import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeSlash, House } from "react-bootstrap-icons";
import axios from "axios";

// Custom components and utils
import { AuthInput } from "./AuthInput";
import {
  validateEmail,
  validatePassword,
  validateFullName,
} from "../../utils/authUtils";
import "./Auth.css";

const API_BASE_URL = "http://127.0.0.1:8000/api/auth/";

const Auth = () => {
  const navigate = useNavigate();

  // --- UI & Flow States ---
  const [phase, setPhase] = useState<"login" | "signup" | "verify_otp">(
    "login"
  );
  const [lastPhase, setLastPhase] = useState<"signup" | "login" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // --- Form States ---
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  // --- Input Handler ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Dynamic Validation
    let msg = "";
    if (name === "email") msg = validateEmail(value);
    if (name === "password") msg = validatePassword(value);
    if (name === "fullName") msg = validateFullName(value);

    setFormErrors((prev) => ({ ...prev, [name]: msg }));
    if (error) setError("");
    if (statusMsg) setStatusMsg("");
  };

  // --- Frontend Validation Check ---
  const hasFrontendErrors = () => {
    if (phase === "signup") {
      return (
        !formData.email ||
        !formData.password ||
        !formData.fullName ||
        formData.password !== formData.confirmPassword ||
        formErrors.email !== "" ||
        formErrors.password !== "" ||
        formErrors.fullName !== ""
      );
    }
    return (
      !formData.email ||
      !formData.password ||
      formErrors.email !== "" ||
      formErrors.password !== ""
    );
  };

  // --- API Actions ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasFrontendErrors()) {
      setError("Please fix the errors above.");
      return;
    }

    setLoading(true);
    setError(""); // Reset general error
    setFormErrors((prev) => ({ ...prev, email: "" })); // Reset field error

    try {
      const res = await axios.post(`${API_BASE_URL}login/`, {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("username", res.data.full_name || res.data.username);
      navigate("/twin-dashboard");
    } catch (err: any) {
      const serverMsg = err.response?.data?.detail;

      if (serverMsg === "OTP_REQUIRED") {
        // ... (existing OTP logic)
        setStatusMsg(`Sending code to ${formData.email}...`);
        await axios.post(`${API_BASE_URL}send-login-otp/`, {
          email: formData.email,
          password: formData.password,
        });
        setVerificationEmail(formData.email);
        setLastPhase("login");
        setPhase("verify_otp");
      }
      // NEW: Check for "User not found" or "Email does not exist"
      else if (
        serverMsg &&
        (serverMsg.toLowerCase().includes("user") ||
          serverMsg.toLowerCase().includes("email"))
      ) {
        setFormErrors((prev) => ({
          ...prev,
          email: "This email is not registered.",
        }));
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setLoading(false);
      setStatusMsg("");
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasFrontendErrors()) {
      setError("Please complete the form correctly.");
      return;
    }

    setLoading(true);
    setStatusMsg(`Sending code to ${formData.email}...`);
    try {
      await axios.post(`${API_BASE_URL}send-signup-otp/`, {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
      });
      setVerificationEmail(formData.email);
      setLastPhase("signup");
      setPhase("verify_otp");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed.");
    } finally {
      setLoading(false);
      setStatusMsg("");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}verify-otp/`, {
        email: verificationEmail,
        code: otpCode,
      });

      // POINT 3: Auto-login logic after signup verification
      if (lastPhase === "signup") {
        setStatusMsg("Email verified! Signing you in now...");
        const res = await axios.post(`${API_BASE_URL}login/`, {
          email: verificationEmail,
          password: formData.password,
        });
        localStorage.setItem("accessToken", res.data.access);
        localStorage.setItem(
          "username",
          res.data.full_name || formData.fullName
        );
        navigate("/twin-dashboard");
      } else {
        setPhase("login");
        setError("Verified! You can now log in.");
      }
    } catch (err: any) {
      setError("Wrong OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}resend-otp/`, {
        email: verificationEmail,
      });
      setError("New code sent! Please check your inbox."); // Using error state to show msg per your original code
    } catch (err: any) {
      setError("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const PasswordToggle = (
    <span
      className="password-toggle-icon"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
    </span>
  );

  return (
    <div className="auth-wrapper">
      <House className="home-icon" size={30} onClick={() => navigate("/")} />

      <div
        className={`auth-container ${phase === "signup" ? "signup-mode" : ""}`}
      >
        <div className="auth-forms">
          {/* 1st: LOGIN FORM */}
          {phase === "login" && (
            <div className="form-box login">
              <h2>Welcome Back</h2>
              <p className="subtitle">Log in to unlock your AI twin.</p>
              <form onSubmit={handleLogin}>
                <AuthInput
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={formErrors.email}
                />
                <AuthInput
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={formErrors.password}
                >
                  {PasswordToggle}
                </AuthInput>

                {statusMsg && (
                  <p
                    className="status-text"
                    style={{
                      color: "#a78bfa",
                      fontSize: "0.85rem",
                      marginBottom: "10px",
                    }}
                  >
                    {statusMsg}
                  </p>
                )}
                {error && (
                  <p
                    className="error-text"
                    style={{
                      color: "#ff4d4f",
                      fontSize: "0.85rem",
                      marginBottom: "10px",
                    }}
                  >
                    {error}
                  </p>
                )}

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? "Please wait..." : "Login"}
                </button>
              </form>
              <p className="toggle-text">
                New here?{" "}
                <span onClick={() => setPhase("signup")}>Sign Up</span>
              </p>
            </div>
          )}

          {/* 1st: SIGNUP FORM */}
          {phase === "signup" && (
            <div className="form-box signup">
              <h2>Create Account</h2>
              <p className="subtitle">
                Join MirrorMind to unlock your AI twin.
              </p>
              <form onSubmit={handleSignup}>
                <AuthInput
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  error={formErrors.fullName}
                />
                <AuthInput
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={formErrors.email}
                />
                <AuthInput
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={formErrors.password}
                >
                  {PasswordToggle}
                </AuthInput>
                <AuthInput
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                      ? "Passwords do not match."
                      : ""
                  }
                />

                {statusMsg && (
                  <p
                    className="status-text"
                    style={{
                      color: "#a78bfa",
                      fontSize: "0.85rem",
                      marginBottom: "10px",
                    }}
                  >
                    {statusMsg}
                  </p>
                )}
                {error && (
                  <p
                    className="error-text"
                    style={{
                      color: "#ff4d4f",
                      fontSize: "0.85rem",
                      marginBottom: "10px",
                    }}
                  >
                    {error}
                  </p>
                )}

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? "Processing..." : "Sign Up"}
                </button>
              </form>
              <p className="toggle-text">
                Already a member?{" "}
                <span onClick={() => setPhase("login")}>Login</span>
              </p>
            </div>
          )}

          {/* 2nd & 3rd: VERIFICATION PANEL + RESEND OTP */}
          {phase === "verify_otp" && (
            <div className="form-box verify">
              <h2>Verify Account</h2>
              <p className="subtitle">
                Code sent to <strong>{verificationEmail}</strong>
              </p>
              <form onSubmit={handleVerifyOTP}>
                <AuthInput
                  name="otp"
                  type="text"
                  placeholder="6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />

                {statusMsg && (
                  <p
                    className="status-text"
                    style={{ color: "#4ade80", fontSize: "0.85rem" }}
                  >
                    {statusMsg}
                  </p>
                )}
                {error && (
                  <p
                    className="error-text"
                    style={{ color: "#ff4d4f", fontSize: "0.85rem" }}
                  >
                    {error}
                  </p>
                )}

                <button type="submit" className="auth-btn" disabled={loading}>
                  Verify & Activate
                </button>
              </form>
              <p className="toggle-text mt-3">
                Didn't get it?{" "}
                <span onClick={handleResendOTP} style={{ cursor: "pointer" }}>
                  Resend OTP
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Side Panel for Desktop */}
        <div className="auth-panel hide-on-mobile">
          <div className="panel-content">
            <h3>{phase === "login" ? "New here?" : "Already a member?"}</h3>
            <p>
              {phase === "login"
                ? "Create an account to unlock your AI twin."
                : "Log in to continue your journey."}
            </p>
            <button
              className="panel-btn"
              onClick={() => setPhase(phase === "login" ? "signup" : "login")}
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
