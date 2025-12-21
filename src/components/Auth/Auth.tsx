import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeSlash, House } from "react-bootstrap-icons";
import axios from "axios";
import "./Auth.css";

const API_BASE_URL = "http://127.0.0.1:8000/api/auth/";

type AuthPhase = "login" | "signup" | "verify_otp";
type LastPhase = "signup" | "login" | null;
type FormErrors = { email: string; password: string; fullName: string };

const Auth = () => {
  const [phase, setPhase] = useState<AuthPhase>("login");
  const [lastPhase, setLastPhase] = useState<LastPhase>(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: "",
    password: "",
    fullName: "",
  });
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  // --- VALIDATION LOGIC ---

  const validateFullName = (name: string) => {
    if (!name) return "Full name is required.";
    if (name.length < 3) return "Name must be at least 3 characters.";
    if (name.length > 25) return "Name cannot exceed 25 characters.";
    // Optional: Ensures it's not just numbers/symbols
    if (!/^[a-zA-Z\s]*$/.test(name)) return "Name can only contain letters.";
    return "";
  };
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? ""
      : "Enter valid email (example@gmail.com)";

  const validatePassword = (pass: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!pass) return "Password is required.";
    if (pass.length < 8) return "Min 8 characters required.";
    if (!/(?=.*[A-Z])/.test(pass))
      return "At least one uppercase letter required.";
    if (!/(?=.*[a-z])/.test(pass))
      return "At least one lowercase letter required.";
    if (!/(?=.*\d)/.test(pass)) return "At least one number required.";
    if (!/(?=.*[@$!%*?&#])/.test(pass))
      return "At least one special character required.";

    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation
    let msg = "";
    if (name === "email") msg = validateEmail(value);
    if (name === "password") msg = validatePassword(value);
    if (name === "fullName") msg = validateFullName(value);

    setFormErrors((prev) => ({ ...prev, [name]: msg }));

    if (error) setError("");
    if (statusMsg) setStatusMsg("");
  };

  const hasFrontendErrors = () => {
    if (phase === "signup") {
      const passwordsMatch = formData.password === formData.confirmPassword;
      if (!passwordsMatch) return true; // You can also set an error message here

      return (
        !formData.email ||
        !formData.password ||
        !formData.fullName ||
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

  // --- ACTIONS ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasFrontendErrors()) {
      setError("Please fix the errors above.");
      return;
    }

    setLoading(true);
    setStatusMsg("Logging you in...");
    try {
      const res = await axios.post(`${API_BASE_URL}login/`, {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("username", res.data.full_name || res.data.username);
      navigate("/twin-dashboard");
    } catch (err: any) {
      if (err.response?.data?.detail === "OTP_REQUIRED") {
        setStatusMsg(`Sending code to ${formData.email}...`);
        await axios.post(`${API_BASE_URL}send-login-otp/`, {
          email: formData.email,
          password: formData.password,
        });
        setVerificationEmail(formData.email);
        setLastPhase("login");
        setPhase("verify_otp");
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
      const res = await axios.post(`${API_BASE_URL}resend-otp/`, {
        email: verificationEmail,
      });
      setError("New code sent! Please check your inbox.");
    } catch (err: any) {
      setError("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <House className="home-icon" size={30} onClick={() => navigate("/")} />

      <div
        className={`auth-container ${phase === "signup" ? "signup-mode" : ""}`}
      >
        <div className="auth-forms">
          {/* LOGIN FORM */}
          {phase === "login" && (
            <div className="form-box login">
              <h2>Welcome Back</h2>
              <p className="subtitle">Log in to unlock your AI twin.</p>
              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.email && (
                    <p className="validation-error">{formErrors.email}</p>
                  )}
                </div>

                <div className="input-group">
                  {/* Wrap password in the new wrapper */}
                  <div className="password-field-wrapper">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <span
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlash size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </span>
                  </div>
                  {formErrors.password && (
                    <p className="validation-error">{formErrors.password}</p>
                  )}
                </div>

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

          {/* SIGNUP FORM */}
          {phase === "signup" && (
            <div className="form-box signup">
              <h2>Create Account</h2>
              <p className="subtitle">
                Join MirrorMind to unlock your AI twin.
              </p>
              <form onSubmit={handleSignup}>
                <div className="input-group">
                  <input
                    name="fullName"
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.fullName && (
                    <p className="validation-error">{formErrors.fullName}</p>
                  )}
                </div>

                <div className="input-group">
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.email && (
                    <p className="validation-error">{formErrors.email}</p>
                  )}
                </div>

                <div className="input-group">
                  <div className="password-field-wrapper">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <span
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlash size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </span>
                  </div>
                  {formErrors.password && (
                    <p className="validation-error">{formErrors.password}</p>
                  )}
                </div>

                <div className="input-group">
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"} // Also toggles with the same eye icon
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="validation-error">
                        Passwords do not match.
                      </p>
                    )}
                </div>

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

          {/* VERIFY OTP FORM (No validation needed for simple text) */}
          {phase === "verify_otp" && (
            <div className="form-box verify">
              <h2>Verify Account</h2>
              <p className="subtitle">
                Code sent to <strong>{verificationEmail}</strong>
              </p>
              <form onSubmit={handleVerifyOTP}>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
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
                Didn't get it? <span onClick={handleResendOTP}>Resend OTP</span>
              </p>
            </div>
          )}
        </div>

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
