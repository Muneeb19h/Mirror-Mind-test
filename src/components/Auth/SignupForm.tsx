import { useState } from "react";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { AuthInput } from "./AuthInput";
import {
    validateEmail,
    validatePassword,
    validateFullName,
    API_BASE_URL,
} from "../../utils/authUtils";
import axios from "axios";

interface SignupFormProps {
    onSignupSuccess: (email: string, password?: string, fullName?: string) => void;
    onLoginClick: () => void;
}


export const SignupForm = ({ onSignupSuccess, onLoginClick }: SignupFormProps) => {
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

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [statusMsg, setStatusMsg] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        let msg = "";
        if (name === "email") msg = validateEmail(value);
        if (name === "password") msg = validatePassword(value);
        if (name === "fullName") msg = validateFullName(value);

        setFormErrors((prev) => ({ ...prev, [name]: msg }));
        if (error) setError("");
        if (statusMsg) setStatusMsg("");
    };

    const hasFrontendErrors = () => {
        return (
            !formData.email ||
            !formData.password ||
            !formData.fullName ||
            formData.password !== formData.confirmPassword ||
            formErrors.email !== "" ||
            formErrors.password !== "" ||
            formErrors.fullName !== ""
        );
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
            onSignupSuccess(formData.email, formData.password, formData.fullName);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Signup failed.");
            setStatusMsg("");
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
        <div className="form-box signup">
            <h2>Create Account</h2>
            <p className="subtitle">Join MirrorMind to unlock your AI twin.</p>
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
                Already a member? <span onClick={onLoginClick}>Login</span>
            </p>
        </div>
    );
};
