import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { House } from "react-bootstrap-icons";
import axios from "axios";
import "./Auth.css";

// Django API Base URL
const API_BASE_URL = "http://127.0.0.1:8000/api/";

// Define the phases for the authentication flow
type AuthPhase = "login" | "signup" | "verify_otp";
// Define the source phase (used to determine redirection after successful verification)
type LastPhase = "signup" | "login" | null;

// New state type for frontend validation errors
type FormErrors = {
  email: string;
  password: string;
  fullName: string;
};

const Auth = () => {
  const [phase, setPhase] = useState<AuthPhase>("login");
  const navigate = useNavigate();

  const [lastPhase, setLastPhase] = useState<LastPhase>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "", // Only used for signup
  });

  // NEW STATE: State to hold front-end validation errors
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: "",
    password: "",
    fullName: "",
  });

  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState(""); // Backend/API errors
  const [loading, setLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  // --- 1. VALIDATION LOGIC FUNCTIONS ---

  const validateEmail = (email: string) => {
    if (!email) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email (e.g., abc@example.com).";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required.";
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    // Strong password suggestions
    if (!/[A-Z]/.test(password)) {
      return "Must contain at least one uppercase letter.";
    }
    if (!/[0-9]/.test(password)) {
      return "Must contain at least one number.";
    }
    if (!/[!@#$%^&*()]/.test(password)) {
      return "Must contain at least one special character (!@#...).";
    }
    return "";
  };

  const validateFullName = (fullName: string) => {
    // Only required during the signup phase
    if (phase === "signup" && !fullName) {
      return "Full Name is required for signup.";
    }
    return "";
  };

  // Helper to check if any field has a current validation error
  const hasFrontendErrors = () => {
    // Check required fields based on current phase
    const fieldsToCheck =
      phase === "signup"
        ? ["email", "password", "fullName"]
        : ["email", "password"];

    // Check if any error message exists or if required fields are empty
    return fieldsToCheck.some(
      (field) =>
        formErrors[field as keyof FormErrors] !== "" ||
        !formData[field as keyof FormErrors]
    );
  };

  // --- 2. UNIVERSAL INPUT HANDLER (with Validation) ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // 1. Update form data
    setFormData({ ...formData, [name]: value });

    // 2. Run validation based on field name
    let errorMessage = "";
    if (name === "email") {
      errorMessage = validateEmail(value);
    } else if (name === "password") {
      errorMessage = validatePassword(value);
    } else if (name === "fullName") {
      errorMessage = validateFullName(value);
    }

    // 3. Update form errors state immediately
    setFormErrors((prev) => ({ ...prev, [name]: errorMessage }));

    // 4. Clear generic backend errors when the user starts typing again
    if (error) {
      setError("");
    }
  };

  // Handler for OTP code input (remains the same)
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpCode(e.target.value);
  };

  // --- SWITCHING FORMS ---
  const toggleAuthMode = (newPhase: "login" | "signup") => {
    setPhase(newPhase);
    setLastPhase(null);
    setError("");
    setFormErrors({ email: "", password: "", fullName: "" }); // Clear errors
    setFormData({ email: "", password: "", fullName: "" });
    setOtpCode("");
    setVerificationEmail("");
  };

  // --- 3. HANDLE SIGNUP (Send OTP) ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // FRONTEND VALIDATION CHECK: Stop if errors exist
    if (
      hasFrontendErrors() ||
      !formData.email ||
      !formData.password ||
      !formData.fullName
    ) {
      setError("Please fix the validation errors before submitting.");
      return;
    }

    setError("");
    setLoading(true);

    const url = API_BASE_URL + "auth/send-signup-otp/";

    const payload = {
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      username: formData.fullName.replace(/\s+/g, "_"),
    };

    try {
      const response = await axios.post(url, payload);

      setVerificationEmail(formData.email);
      setLastPhase("signup");
      setPhase("verify_otp");

      setError(
        response.data.detail || "OTP sent successfully. Check your email."
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || "An error occurred during signup.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. HANDLE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // FRONTEND VALIDATION CHECK: Stop if errors exist
    if (hasFrontendErrors() || !formData.email || !formData.password) {
      setError("Please fix the validation errors before submitting.");
      return;
    }

    setError("");
    setLoading(true);

    const payload = {
      email: formData.email,
      password: formData.password,
    };

    let url = API_BASE_URL + "auth/login/";

    try {
      const response = await axios.post(url, payload);

      // Standard Login Success (User is verified and logged in)
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      // NOTE: Assuming your backend now returns 'full_name' or a suitable display name in response.data
      localStorage.setItem(
        "username",
        response.data.full_name || formData.email
      );

      navigate("/twin-dashboard");
    } catch (err: any) {
      // Extract the error data from the backend response
      const errorData = err.response?.data;
      const detail = errorData?.detail;

      // 1. CHECK FOR OTP REQUIREMENT (Both 'OTP_REQUIRED' or 'Account is not verified')
      if (
        detail === "OTP_REQUIRED" ||
        (typeof detail === "string" && detail.includes("not verified"))
      ) {
        try {
          // Automatically trigger the OTP email
          const otpUrl = API_BASE_URL + "auth/send-login-otp/";
          const otpResponse = await axios.post(otpUrl, {
            email: formData.email,
            password: formData.password,
          });

          // Update UI state to move to OTP screen
          setVerificationEmail(formData.email);
          setLastPhase("login");
          setPhase("verify_otp");

          setError(
            otpResponse.data.detail ||
              "Verification required. OTP sent to your email."
          );
        } catch (otpErr: any) {
          setError(
            otpErr.response?.data?.detail ||
              "Credentials correct, but failed to send OTP."
          );
        }
      }
      // 2. CHECK FOR WRONG CREDENTIALS
      else {
        // This catches "Invalid email or password"
        setError(detail || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 5. FINALIZED HANDLE OTP VERIFICATION (remains mostly same) ---
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const verifyUrl = API_BASE_URL + "auth/verify-otp/";

    const payload = {
      email: verificationEmail,
      code: otpCode,
    };

    try {
      const response = await axios.post(verifyUrl, payload);
      const successMessage = response.data.detail || "Verification successful!";

      if (lastPhase === "signup") {
        setError(successMessage + " Logging you in...");

        try {
          const loginPayload = {
            email: verificationEmail,
            password: formData.password,
          };

          const loginUrl = API_BASE_URL + "auth/login/";
          const loginResponse = await axios.post(loginUrl, loginPayload);

          localStorage.setItem("accessToken", loginResponse.data.access);
          localStorage.setItem("refreshToken", loginResponse.data.refresh);
          // Use the full name collected during signup
          localStorage.setItem("username", formData.fullName);

          navigate("/twin-dashboard");
        } catch (loginErr: any) {
          setError(
            "Verification successful! Auto-login failed. Please log in manually."
          );
          setPhase("login");
          setFormData({ email: verificationEmail, password: "", fullName: "" });
          setOtpCode("");
        }
      } else if (lastPhase === "login") {
        setError(successMessage + " You can now log in.");
        setPhase("login");
        setFormData({ email: verificationEmail, password: "", fullName: "" });
        setOtpCode("");
      } else {
        setError(successMessage + " Please log in.");
        setPhase("login");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        "Verification failed. Invalid or expired code.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Determine which handleSubmit function to use
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === "signup") {
      handleSignup(e);
    } else if (phase === "login") {
      handleLogin(e);
    } else if (phase === "verify_otp") {
      handleVerifyOTP(e);
    }
  };

  const containerClass =
    phase === "signup" ? "auth-container signup-mode" : "auth-container";

  // --- RENDER OTP VERIFICATION FORM (remains same) ---
  const renderOTPVerificationForm = () => (
    <div className="form-box verify">
      <h2>Verify Account</h2>
      <p className="subtitle">
        A 6-digit verification code has been sent to{" "}
        <strong>{verificationEmail}</strong>.
      </p>
      <form onSubmit={handleVerifyOTP}>
        <div className="input-group">
          <input
            type="text"
            name="otpCode"
            placeholder="Enter 6-Digit Code"
            value={otpCode}
            onChange={handleOtpChange}
            maxLength={6}
            required
          />
        </div>
        {error && (
          <p
            className={`error-text ${
              error.includes("successful") ? "success-text" : ""
            }`}
          >
            {error}
          </p>
        )}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Verifying..." : "Verify & Activate"}
        </button>
        <p className="toggle-text mt-3">
          Wrong email?{" "}
          <span onClick={() => toggleAuthMode("signup")}>Sign Up again</span>
        </p>
      </form>
    </div>
  );

  // --- RENDER LOGIN FORM (Updated to display errors) ---
  const renderLoginForm = () => (
    <div className="form-box login">
      <h2>Welcome Back</h2>
      <p className="subtitle">Log in to unlock your AI twin.</p>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {/* Display Error for Email */}
          {formErrors.email && (
            <p className="validation-error">{formErrors.email}</p>
          )}
        </div>
        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          {/* Display Error for Password */}
          {formErrors.password && (
            <p className="validation-error">{formErrors.password}</p>
          )}
        </div>
        {error && (
          <p
            className={`error-text ${
              error.includes("successful") ? "success-text" : ""
            }`}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className="auth-btn"
          disabled={loading || hasFrontendErrors()} // Disable if loading or errors exist
        >
          {loading ? "Logging In..." : "Login"}
        </button>
      </form>

      <p className="toggle-text">
        New here? <span onClick={() => toggleAuthMode("signup")}>Sign Up</span>
      </p>
    </div>
  );

  // --- RENDER SIGNUP FORM (Updated to display errors) ---
  const renderSignupForm = () => (
    <div className="form-box signup">
      <h2>Create Account</h2>
      <p className="subtitle">Join MirrorMind to unlock your AI twin.</p>
      <form onSubmit={handleSignup}>
        <div className="input-group">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
          {/* Display Error for Full Name */}
          {formErrors.fullName && (
            <p className="validation-error">{formErrors.fullName}</p>
          )}
        </div>
        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {/* Display Error for Email */}
          {formErrors.email && (
            <p className="validation-error">{formErrors.email}</p>
          )}
        </div>
        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          {/* Display Error for Password */}
          {formErrors.password && (
            <p className="validation-error">{formErrors.password}</p>
          )}
        </div>
        {error && (
          <p
            className={`error-text ${
              error.includes("successful") ? "success-text" : ""
            }`}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className="auth-btn"
          disabled={loading || hasFrontendErrors()} // Disable if loading or errors exist
        >
          {loading ? "Sending OTP..." : "Sign Up"}
        </button>
      </form>

      <p className="toggle-text">
        Already have an account?{" "}
        <span onClick={() => toggleAuthMode("login")}>Login</span>
      </p>
    </div>
  );

  // --- MAIN RENDER ---
  return (
    <div className="auth-wrapper">
      <House className="home-icon" size={30} onClick={() => navigate("/")} />

      <div className={containerClass}>
        {/* --- Form Box (Dynamic) --- */}
        <div className="auth-forms">
          {phase === "login" && renderLoginForm()}
          {phase === "signup" && renderSignupForm()}
          {phase === "verify_otp" && renderOTPVerificationForm()}
        </div>

        {/* --- Animated Panel --- */}
        <div className="auth-panel hide-on-mobile">
          <div className="panel-content">
            <h3>{phase === "login" ? "New here?" : "Already a member?"}</h3>
            <p>
              {phase === "login"
                ? "Create an account to unlock your AI twin."
                : "Log in to continue your journey in MirrorMind."}
            </p>
            <button
              className="panel-btn"
              onClick={() =>
                toggleAuthMode(phase === "login" ? "signup" : "login")
              }
            >
              {phase === "login" ? "Sign Up" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
