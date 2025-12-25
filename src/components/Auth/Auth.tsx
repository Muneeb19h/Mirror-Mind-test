import { useEffect, useState } from "react";
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
// new phases
type AuthPhase =
  | "login"
  | "signup"
  | "verify_otp"
  | "forgot_password"
  | "reset_password";

type LastPhase = "signup" | "login" | "forgot" | null;

const Auth = () => {
  const navigate = useNavigate(); // Make sure <AuthPhase> is added here

  const [phase, setPhase] = useState<AuthPhase>("login");
  const [lastPhase, setLastPhase] = useState<LastPhase>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false); // --- Form States ---

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
  }); //---Remember me Logic//
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []); // --- Input Handler ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value })); // Dynamic Validation

    let msg = "";
    if (name === "email") msg = validateEmail(value);
    if (name === "password") msg = validatePassword(value);
    if (name === "fullName") msg = validateFullName(value);

    setFormErrors((prev) => ({ ...prev, [name]: msg }));
    if (error) setError("");
    if (statusMsg) setStatusMsg("");
  }; // --- Frontend Validation Check ---

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
  }; // --- API Actions --- //LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_BASE_URL}login/`, {
        email: formData.email,
        password: formData.password,
      });

      if (rememberMe) localStorage.setItem("rememberedEmail", formData.email);
      else localStorage.removeItem("rememberedEmail");

      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("username", res.data.full_name || res.data.username);
      navigate("/twin-dashboard");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail === "OTP_REQUIRED") {
        setVerificationEmail(formData.email);
        setLastPhase("login");
        setPhase("verify_otp");
      } else if (err.response?.status === 404) {
        setFormErrors((prev) => ({
          ...prev,
          email: "This email is not registered.",
        }));
      } else {
        setError("Invalid credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE_URL}forgot-password/`, {
        email: formData.email,
      });
      setVerificationEmail(formData.email);
      setPhase("reset_password");
      setStatusMsg("Reset code sent to your email.");
    } catch (err: any) {
      setError("Email not found.");
    } finally {
      setLoading(false);
    }
  }; //Verify OTP
  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // We call the existing verify-otp endpoint to check if the code is valid
      await axios.post(`${API_BASE_URL}verify-otp/`, {
        email: verificationEmail,
        code: otpCode,
      }); // If successful, show the password fields

      setIsOtpVerified(true);
      setStatusMsg(""); // Clear any "code sent" messages
    } catch (err: any) {
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }; //RESET Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // Now we send the final update request
      await axios.post(`${API_BASE_URL}reset-password/`, {
        email: verificationEmail,
        otp: otpCode, // Send the verified OTP again for backend security validation
        new_password: formData.password,
      });

      setPhase("login");
      setIsOtpVerified(false); // Reset state for future use
      setError(""); // Use setStatusMsg so it shows as a green success message on the login screen
      setStatusMsg("Password updated! You can now log in.");
    } catch (err: any) {
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  }; //SIGNUP

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
      }); // POINT 3: Auto-login logic after signup verification

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
                                {/* Inside Login Form, after Password input */} 
                             
                <div className="auth-options">
                                   
                  <label className="remember-me">
                                       
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                                        Remember Me                  
                  </label>
                                   
                  <span
                    className="forgot-link"
                    onClick={() => setPhase("forgot_password")}
                  >
                                        Forgot Password?                  
                  </span>
                                 
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
                                New here?                
                <span onClick={() => setPhase("signup")}>Sign Up</span>         
                   
              </p>
                         
            </div>
          )}
                    {/* FORGOT PASSWORD PHASE */}         
          {phase === "forgot_password" && (
            <div className="form-box forgot">
                            <h2>Reset Password</h2>             
              <p className="subtitle">
                                Enter your email to receive a 6-digit code.    
                         
              </p>
                           
              <form onSubmit={handleForgotPassword}>
                               
                <AuthInput
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={formErrors.email}
                />
                                {error && <p className="error-text">{error}</p>}
                               
                <button type="submit" className="auth-btn" disabled={loading}>
                                    {loading ? "Sending..." : "Send Code"}     
                           
                </button>
                             
              </form>
                           
              <p className="toggle-text">
                               
                <span onClick={() => setPhase("login")}>Back to Login</span>   
                         
              </p>
                         
            </div>
          )}
                   
          {phase === "reset_password" && (
            <div className="form-box reset">
                           
              <h2>
                               
                {isOtpVerified ? "Create New Password" : "Verify Reset Code"}   
                         
              </h2>
                           
              <p className="subtitle">
                               
                {isOtpVerified
                  ? "Enter a new secure password for your account."
                  : `Enter the 6-digit code sent to ${verificationEmail}`}
                             
              </p>
                           
              <form
                onSubmit={
                  isOtpVerified ? handleResetPassword : handleVerifyResetOtp
                }
              >
                               
                {!isOtpVerified ? (
                  /* --- STEP 1: OTP VERIFICATION --- */
                  <div className="otp-step">
                                       
                    <AuthInput
                      name="otp"
                      type="text"
                      placeholder="6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                    {error && (
                      <p className="error-text" style={{ color: "#ff4d4f" }}>
                        {error}                     
                      </p>
                    )}
                    <button
                      type="submit"
                      className="auth-btn"
                      disabled={loading}
                    >
                      {loading ? "Checking..." : "Verify Code"}                 
                    </button>
                    <p className="toggle-text mt-3">
                                            Didn't get it?                      
                      <span
                        onClick={handleResendOTP}
                        style={{ cursor: "pointer" }}
                      >
                        Resend                      
                      </span>
                                       
                    </p>
                                     
                  </div>
                ) : (
                  /* --- STEP 2: NEW PASSWORD INPUT (Shows only after verification) --- */
                  <div className="password-step">
                    {" "}
                                       
                    <AuthInput
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      error={formErrors.password}
                    >
                      {PasswordToggle}                   
                    </AuthInput>
                                       
                    <AuthInput
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />{" "}
                                       
                    {error && (
                      <p className="error-text" style={{ color: "#ff4d4f" }}>
                        {error}                     
                      </p>
                    )}
                                       
                    <button
                      type="submit"
                      className="auth-btn"
                      disabled={loading}
                    >
                      {" "}
                                           
                      {loading ? "Updating..." : "Update Password"}             
                           
                    </button>
                                     
                  </div>
                )}
                             
              </form>
                         
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
                                Already a member?                
                <span onClick={() => setPhase("login")}>Login</span>           
                 
              </p>
                         
            </div>
          )}
                    {/* 2nd & 3rd: VERIFICATION PANEL + RESEND OTP */}         
          {phase === "verify_otp" && (
            <div className="form-box verify">
                            <h2>Verify Account</h2>             
              <p className="subtitle">
                                Code sent to
                <strong>{verificationEmail}</strong>             
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
                                Didn't get it?                
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
