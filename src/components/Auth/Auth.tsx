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

const Auth = () => {
  // Use 'phase' to manage the currently displayed form
  const [phase, setPhase] = useState<AuthPhase>("login");
  const navigate = useNavigate();

  // New state to track if the user came from 'signup' or 'login'
  const [lastPhase, setLastPhase] = useState<LastPhase>(null);

  // State to hold all form input data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "", // Only used for signup
  });

  const [otpCode, setOtpCode] = useState(""); // New state for OTP input
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // The email that needs verification (stored after successful API call)
  const [verificationEmail, setVerificationEmail] = useState("");

  // Universal handler for all input fields (signup/login)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler for OTP code input
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpCode(e.target.value);
  };

  // --- SWITCHING FORMS ---
  const toggleAuthMode = (newPhase: "login" | "signup") => {
    setPhase(newPhase);
    setLastPhase(null); // Reset phase tracker
    setError("");
    // IMPORTANT: Only clear if switching between login/signup.
    // We rely on formData state persistence when switching to verify_otp
    setFormData({ email: "", password: "", fullName: "" });
    setOtpCode(""); // Clear OTP
    setVerificationEmail(""); // Clear email for verification
  };

  // --- 1. HANDLE SIGNUP (Send OTP) ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = API_BASE_URL + "auth/send-signup-otp/";

    const payload = {
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      username: formData.fullName.replace(/\s+/g, "_"), // For Django
    };

    try {
      const response = await axios.post(url, payload);

      // OTP sent successfully. Keep formData (including password) in state.
      setVerificationEmail(formData.email);
      setLastPhase("signup"); // Mark the source as signup
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

  // --- 2. HANDLE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Use email as the username for display on the Navbar
      localStorage.setItem("username", formData.email);

      // Redirect to dashboard
      navigate("/twin-dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail;

      // CHECK 1: If the error suggests the user is UNVERIFIED, switch to OTP flow
      if (errorMessage && errorMessage.includes("Account is not verified")) {
        try {
          url = API_BASE_URL + "auth/send-login-otp/";
          const otpResponse = await axios.post(url, payload);

          setVerificationEmail(formData.email);
          setLastPhase("login"); // Mark the source as login
          setPhase("verify_otp");
          setError(
            otpResponse.data.detail ||
              "Account requires verification. OTP sent to your email."
          );
        } catch (otpErr: any) {
          setError(
            otpErr.response?.data?.detail ||
              "Login failed and OTP could not be sent."
          );
        }
      } else {
        // Standard login failure (e.g., wrong password, user not found)
        setError(errorMessage || "Login failed. Check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 3. FINALIZED HANDLE OTP VERIFICATION ---
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
      // ATTEMPT 1: Verify the OTP Code
      const response = await axios.post(verifyUrl, payload);
      const successMessage = response.data.detail || "Verification successful!";

      if (lastPhase === "signup") {
        // --- AUTO-LOGIN FOR NEWLY VERIFIED USER ---
        setError(successMessage + " Logging you in...");

        try {
          // 1. Prepare login payload (using preserved password in formData)
          const loginPayload = {
            email: verificationEmail,
            password: formData.password,
          };

          // 2. Call the standard login endpoint to get the tokens (JWT)
          const loginUrl = API_BASE_URL + "auth/login/";
          const loginResponse = await axios.post(loginUrl, loginPayload);

          // 3. Save tokens and username (Auto-Login Complete)
          localStorage.setItem("accessToken", loginResponse.data.access);
          localStorage.setItem("refreshToken", loginResponse.data.refresh);
          // Use the full name (or email if full name is cleared)
          localStorage.setItem(
            "username",
            formData.fullName || verificationEmail
          );

          // 4. Redirect to dashboard
          navigate("/twin-dashboard");
        } catch (loginErr: any) {
          // Failure during the auto-login step
          setError(
            "Verification successful! Auto-login failed. Please log in manually."
          );
          setPhase("login");
          setFormData({ email: verificationEmail, password: "", fullName: "" });
          setOtpCode("");
        }
      } else if (lastPhase === "login") {
        // Returning user: Ask them to log in now that they are verified
        setError(successMessage + " You can now log in.");
        setPhase("login");
        setFormData({ email: verificationEmail, password: "", fullName: "" });
        setOtpCode("");
      } else {
        // Fallback
        setError(successMessage + " Please log in.");
        setPhase("login");
      }
    } catch (err: any) {
      // Failure during the initial OTP verification step
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
    e.preventDefault(); // Prevent default form submission once
    if (phase === "signup") {
      handleSignup(e);
    } else if (phase === "login") {
      handleLogin(e);
    } else if (phase === "verify_otp") {
      handleVerifyOTP(e);
    }
  };

  // Dynamic CSS class for the container transition (for the signup panel animation)
  const containerClass =
    phase === "signup" ? "auth-container signup-mode" : "auth-container";

  // --- RENDER OTP VERIFICATION FORM ---
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

  // --- RENDER LOGIN FORM ---
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
          {loading ? "Logging In..." : "Login"}
        </button>
      </form>

      <p className="toggle-text">
        New here? <span onClick={() => toggleAuthMode("signup")}>Sign Up</span>
      </p>
    </div>
  );

  // --- RENDER SIGNUP FORM ---
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
