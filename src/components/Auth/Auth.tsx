import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { House } from "react-bootstrap-icons";
import axios from "axios"; // 👈 Import Axios
import "./Auth.css";

// Django API Base URL
const API_BASE_URL = "http://127.0.0.1:8000/api/";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  // State to hold all form input data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "", // Only used for signup
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Universal handler for all input fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isSignup ? "signup/" : "login/";
    const url = API_BASE_URL + endpoint;

    // Prepare payload
    const payload = isSignup
      ? {
          username: formData.fullName.replace(/\s+/g, "_"),
          email: formData.email,
          password: formData.password,
        }
      : {
          // For login, we still use email to find the account
          email: formData.email,
          password: formData.password,
        };

    try {
      const response = await axios.post(url, payload);

      // Successful response
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        // If we just logged in, use the username from the server.
        const displayName = isSignup
          ? formData.fullName
          : response.data.user.username;

        localStorage.setItem("username", displayName);

        setFormData({ email: "", password: "", fullName: "" });
        navigate("/twin-dashboard");
      }
    } catch (err) {
      // Failed response (400, 401, 500, etc.)
      const axiosError = err as any;
      if (axiosError.response) {
        // Display specific error detail from Django
        const detail =
          axiosError.response.data.detail ||
          axiosError.response.data.email?.[0] ||
          "Check your credentials.";
        setError(detail);
      } else {
        // Network error (Django server is not running)
        setError("Could not connect to the Django server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-wrapper ${isSignup ? "signup-mode" : ""}`}>
      <div className="home-icon" onClick={() => navigate("/")}>
        <House size={26} />
      </div>

      <div className="auth-container">
        {/* --- Login Form --- */}
        <div className="form-box login">
          <h2>Welcome Back</h2>
          <p className="subtitle">Login to your MirrorMind account</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              {/* Added name, value, and onChange handler */}
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              {/* Added name, value, and onChange handler */}
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            {error && !isSignup && <p className="error-text">{error}</p>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="toggle-text">
            Don’t have an account?{" "}
            <span
              onClick={() => {
                setIsSignup(true);
                setError("");
              }}
            >
              Sign up
            </span>
          </p>
        </div>

        {/* --- Signup Form --- */}
        <div className="form-box signup">
          <h2>Create Account</h2>
          <p className="subtitle">Join the MirrorMind experience</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              {/* Added name, value, and onChange handler */}
              <input
                type="text"
                name="fullName"
                placeholder="Enter your name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              {/* Added name, value, and onChange handler */}
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              {/* Added name, value, and onChange handler */}
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            {error && isSignup && <p className="error-text">{error}</p>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="toggle-text">
            Already have an account?{" "}
            <span
              onClick={() => {
                setIsSignup(false);
                setError("");
              }}
            >
              Login
            </span>
          </p>
        </div>

        {/* --- Animated Panel --- */}
        <div className="auth-panel hide-on-mobile">
          <div className="panel-content">
            <h3>{isSignup ? "Already a member?" : "New here?"}</h3>
            <p>
              {isSignup
                ? "Log in to continue your journey in MirrorMind."
                : "Create an account to unlock your AI twin."}
            </p>
            <button
              className="panel-btn"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
