import { useState } from "react";
import { AuthInput } from "./AuthInput";
import axios from "axios";
import { validateEmail, API_BASE_URL } from "../../utils/authUtils";

interface ForgotPasswordFormProps {
    onCodeSent: (email: string) => void;
    onBackToLogin: () => void;
}



export const ForgotPasswordForm = ({
    onCodeSent,
    onBackToLogin,
}: ForgotPasswordFormProps) => {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEmail(val);
        setEmailError(validateEmail(val));
        if (error) setError("");
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!email || emailError) {
            setError("Please enter a valid email.");
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}forgot-password/`, {
                email: email,
            });
            onCodeSent(email);
        } catch (err: any) {
            setError("Email not found.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-box forgot">
            <h2>Reset Password</h2>
            <p className="subtitle">Enter your email to receive a 6-digit code.</p>
            <form onSubmit={handleForgotPassword}>
                <AuthInput
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleInputChange}
                    error={emailError}
                />
                {error && <p className="error-text">{error}</p>}
                <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? "Sending..." : "Send Code"}
                </button>
            </form>
            <p className="toggle-text">
                <span onClick={onBackToLogin}>Back to Login</span>
            </p>
        </div>
    );
};
