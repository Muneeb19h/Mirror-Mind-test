import { useState } from "react";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { AuthInput } from "./AuthInput";
import axios from "axios";
import { validatePassword, API_BASE_URL } from "../../utils/authUtils";

interface ResetPasswordFormProps {
    email: string;
    onResetSuccess: () => void;
    onResendOtp: () => void;
}



export const ResetPasswordForm = ({
    email,
    onResetSuccess,
    onResendOtp,
}: ResetPasswordFormProps) => {
    const [otpCode, setOtpCode] = useState("");
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [formErrors, setFormErrors] = useState({
        password: "",
    });
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleVerifyResetOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await axios.post(`${API_BASE_URL}verify-otp/`, {
                email: email,
                code: otpCode,
            });
            setIsOtpVerified(true);
        } catch (err: any) {
            setError("Invalid or expired OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        let msg = "";
        if (name === "password") msg = validatePassword(value);
        setFormErrors((prev) => ({ ...prev, [name]: msg }));
        if (error) setError("");
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.password) {
            setError("Password cannot be empty.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (formErrors.password) {
            setError("Please fix password errors.");
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}reset-password/`, {
                email: email,
                otp: otpCode,
                new_password: formData.password,
            });
            onResetSuccess();
        } catch (err: any) {
            setError("Failed to update password. Please try again.");
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
        <div className="form-box reset">
            <h2>
                {isOtpVerified ? "Create New Password" : "Verify Reset Code"}
            </h2>
            <p className="subtitle">
                {isOtpVerified
                    ? "Enter a new secure password for your account."
                    : `Enter the 6-digit code sent to ${email}`}
            </p>

            <form onSubmit={isOtpVerified ? handleResetPassword : handleVerifyResetOtp}>
                {!isOtpVerified ? (
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
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Checking..." : "Verify Code"}
                        </button>
                        <p className="toggle-text mt-3">
                            Didn't get it?
                            <span onClick={onResendOtp} style={{ cursor: "pointer" }}>
                                Resend
                            </span>
                        </p>
                    </div>
                ) : (
                    <div className="password-step">
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
                        />
                        {error && (
                            <p className="error-text" style={{ color: "#ff4d4f" }}>
                                {error}
                            </p>
                        )}
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};
