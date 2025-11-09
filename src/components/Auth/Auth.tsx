import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { House } from "react-bootstrap-icons"; // install: npm i react-bootstrap-icons
import "./Auth.css";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={`auth-wrapper ${isSignup ? "signup-mode" : ""}`}>
      {/* 🏠 Small home icon instead of Navbar */}
      <div className="home-icon" onClick={() => navigate("/")}>
        <House size={26} />
      </div>

      <div className="auth-container">
        {/* --- Login Form --- */}
        <div className="form-box login">
          <h2>Welcome Back</h2>
          <p className="subtitle">Login to your MirrorMind account</p>

          <form>
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="auth-btn">
              Login
            </button>
          </form>

          <p className="toggle-text">
            Don’t have an account?{" "}
            <span onClick={() => setIsSignup(true)}>Sign up</span>
          </p>
        </div>

        {/* --- Signup Form --- */}
        <div className="form-box signup">
          <h2>Create Account</h2>
          <p className="subtitle">Join the MirrorMind experience</p>

          <form>
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name" required />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Create a password" required />
            </div>
            <button type="submit" className="auth-btn">
              Sign Up
            </button>
          </form>

          <p className="toggle-text">
            Already have an account?{" "}
            <span onClick={() => setIsSignup(false)}>Login</span>
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
              onClick={() => setIsSignup(!isSignup)}
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
