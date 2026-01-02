import { useState } from "react";
import { AuthInput } from "./AuthInput";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../utils/authUtils";

interface VerifyOtpFormProps {
    email: string;
    onVerifySuccess: () => void;
    onResendSuccess?: (message: string) => void;
    isSignupVerification?: boolean;
    passwordForAutoLogin?: string;
    fullNameForAutoLogin?: string;
}



export const VerifyOtpForm = ({
    email,
    onVerifySuccess,
    isSignupVerification = false,
    passwordForAutoLogin,
    fullNameForAutoLogin,
}: VerifyOtpFormProps) => {
    const navigate = useNavigate();
    const [otpCode, setOtpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [statusMsg, setStatusMsg] = useState("");

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await axios.post(`${API_BASE_URL}verify-otp/`, {
                email: email,
                code: otpCode,
            });

            // Auto-login logic after signup verification 
            if (isSignupVerification && passwordForAutoLogin) {
                setStatusMsg("Email verified! Signing you in now...");
                const res = await axios.post(`${API_BASE_URL}login/`, {
                    email: email,
                    password: passwordForAutoLogin,
                });
                localStorage.setItem("accessToken", res.data.access);
                localStorage.setItem(
                    "username",
                    res.data.full_name || fullNameForAutoLogin || "User"
                );
                navigate("/twin-dashboard");
            } else {
                // Just notify success, parent handles navigation (e.g. back to login)
                onVerifySuccess();
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
                email: email,
            });
            setStatusMsg("New code sent! Please check your inbox.");
        } catch (err: any) {
            setError("Failed to resend code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-box verify">
            <h2>Verify Account</h2>
            <p className="subtitle">
                Code sent to <strong>{email}</strong>
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
    );
};
