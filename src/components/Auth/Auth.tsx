import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { House } from "react-bootstrap-icons";
import axios from "axios";
// Custom components and utils
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { VerifyOtpForm } from "./VerifyOtpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import "./Auth.css";
import { API_BASE_URL } from "../../utils/authUtils";



type AuthPhase =
  | "login"
  | "signup"
  | "verify_otp"
  | "forgot_password"
  | "reset_password";

type LastPhase = "signup" | "login" | "forgot" | null;

const Auth = () => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<AuthPhase>("login");
  const [lastPhase, setLastPhase] = useState<LastPhase>(null);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [signupCredentials, setSignupCredentials] = useState({
    password: "",
    fullName: ""
  });

  // --- Handlers ---

  const handleLoginSuccess = (data: any) => {
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("username", data.full_name || data.username);
    navigate("/twin-dashboard");
  };

  const handleOtpRequired = (email: string) => {
    setVerificationEmail(email);
    setLastPhase("login");
    setPhase("verify_otp");
  };

  const handleSignupSuccess = (email: string, password?: string, fullName?: string) => {
    setVerificationEmail(email);
    if (password && fullName) {
      setSignupCredentials({ password, fullName });
    }
    setLastPhase("signup");
    setPhase("verify_otp");
  };

  const handleVerifySuccess = () => {
    // If auto-login happened in VerifyOtpForm, we won't reach here usually. 
    // This is a fallback valid state.
    setPhase("login");
  };

  const handleCodeSent = (email: string) => {
    setVerificationEmail(email);
    setPhase("reset_password");
  };

  const handleResetSuccess = () => {
    setPhase("login");
  };

  return (
    <div className="auth-wrapper">
      <House className="home-icon" size={30} onClick={() => navigate("/")} />
      <div
        className={`auth-container ${phase === "signup" ? "signup-mode" : ""}`}
      >
        <div className="auth-forms">
          {phase === "login" && (
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onForgotPassword={() => setPhase("forgot_password")}
              onSignupClick={() => setPhase("signup")}
              onOtpRequired={handleOtpRequired}
            />
          )}

          {phase === "forgot_password" && (
            <ForgotPasswordForm
              onCodeSent={handleCodeSent}
              onBackToLogin={() => setPhase("login")}
            />
          )}

          {phase === "reset_password" && (
            <ResetPasswordForm
              email={verificationEmail}
              onResetSuccess={handleResetSuccess}
              onResendOtp={async () => {
                await axios.post(`${API_BASE_URL}resend-otp/`, { email: verificationEmail });
              }}
            />
          )}

          {phase === "signup" && (
            <SignupForm
              onSignupSuccess={handleSignupSuccess}
              onLoginClick={() => setPhase("login")}
            />
          )}

          {phase === "verify_otp" && (
            <VerifyOtpForm
              email={verificationEmail}
              onVerifySuccess={handleVerifySuccess}
              isSignupVerification={lastPhase === "signup"}
              passwordForAutoLogin={signupCredentials.password}
              fullNameForAutoLogin={signupCredentials.fullName}
            />
          )}
        </div>

        {/* Side Panel */}
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
