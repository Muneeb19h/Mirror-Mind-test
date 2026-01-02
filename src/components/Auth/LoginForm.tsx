import { useState, useEffect } from "react";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { AuthInput } from "./AuthInput";
import { validateEmail, validatePassword, API_BASE_URL } from "../../utils/authUtils";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
    onLoginSuccess: (data: any) => void;
    onForgotPassword: () => void;
    onSignupClick: () => void;
    onOtpRequired: (email: string) => void;
}



export const LoginForm = ({
    onLoginSuccess,
    onForgotPassword,
    onSignupClick,
    onOtpRequired,
}: LoginFormProps) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [formErrors, setFormErrors] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [statusMsg, setStatusMsg] = useState("");

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        if (savedEmail) {
            setFormData((prev) => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        let msg = "";
        if (name === "email") msg = validateEmail(value);
        if (name === "password") msg = validatePassword(value);

        setFormErrors((prev) => ({ ...prev, [name]: msg }));
        if (error) setError("");
        if (statusMsg) setStatusMsg("");
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Basic frontend check before hitting API
        if (
            !formData.email ||
            !formData.password ||
            formErrors.email ||
            formErrors.password
        ) {
            setError("Please fill in all fields correctly.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${API_BASE_URL}login/`, {
                email: formData.email,
                password: formData.password,
            });

            if (rememberMe) localStorage.setItem("rememberedEmail", formData.email);
            else localStorage.removeItem("rememberedEmail");

            onLoginSuccess(res.data);
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            if (detail === "OTP_REQUIRED") {
                onOtpRequired(formData.email);
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

    const PasswordToggle = (
        <span
            className="password-toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
        >
            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
        </span>
    );

    return (
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
                <div className="auth-options">
                    <label className="remember-me">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        Remember Me
                    </label>
                    <span className="forgot-link" onClick={onForgotPassword}>
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
                New here? <span onClick={onSignupClick}>Sign Up</span>
            </p>
        </div>
    );
};
