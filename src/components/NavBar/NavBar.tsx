import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./NavBar.css";

interface NavBarProps {
  brandName: string;
  imageSrcPath: string;
  navItems: string[];
}

const NavBar = ({ brandName, imageSrcPath, navItems }: NavBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to check login status
  const checkLoginStatus = () => {
    // UPDATED: Check for accessToken (JWT)
    const token = localStorage.getItem("accessToken");
    const storedUsername = localStorage.getItem("username");

    if (token && storedUsername) {
      // UPDATED: Use 'Bearer' prefix for JWT
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUserName(storedUsername);
    } else {
      // User is logged out
      delete axios.defaults.headers.common["Authorization"];
      setUserName(null);
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    // 1. Remove both JWT tokens and username from storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken"); // Ensure refresh token is also cleared
    localStorage.removeItem("username");

    setUserName(null);
    delete axios.defaults.headers.common["Authorization"];
    setIsMenuOpen(false);
    navigate("/");
  };
  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Inside NavBar component (AuthButton definition)
  const AuthButton = ({ isMobile = false }) => (
    <>
      {userName ? (
        // Logged In View: Dropdown Menu
        <div
          className={`user-dropdown-wrapper ${isMobile ? "mobile" : "desktop"}`}
          // Toggle the dropdown state on click
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {/* Username Button (always visible) */}
          <button className={isMobile ? "mobile-login-btn" : "login-btn"}>
            {userName}
            <span
              style={{
                marginLeft: "8px",
                transition: "transform 0.2s",
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              &#9660;
            </span>
          </button>

          {/* Dropdown Menu (Conditionally Rendered) */}
          {isDropdownOpen && (
            <div
              className={`user-dropdown-menu ${
                isMobile ? "mobile" : "desktop"
              }`}
            >
              {/* 1. Dashboard Link */}
              <Link
                to="/twin-dashboard"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent dropdown closing immediately
                  setIsDropdownOpen(false);
                }}
                className="dropdown-item"
              >
                Dashboard
              </Link>

              {/* 2. Logout Action */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent dropdown closing immediately
                  handleLogout(); // Calls the function to clear storage and redirect
                  setIsDropdownOpen(false);
                }}
                className="dropdown-item logout-item"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        // Logged Out View: Show Login/Signup button
        <Link
          to="/auth"
          className={isMobile ? "mobile-login-btn" : "login-btn"}
          onClick={() => setIsMenuOpen(false)}
        >
          Login / Signup
        </Link>
      )}
    </>
  );

  return (
    <nav className={`navbar-modern ${isMenuOpen ? "menu-open" : ""}`}>
      <div className="navbar-container">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand-modern">
          <img src={imageSrcPath} alt="logo" className="brand-logo" />
          <span className="brand-text">{brandName}</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <div
          className={`menu-toggle ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Navigation Links */}
        <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          {navItems.map((item) => {
            const path =
              item.toLowerCase() === "home"
                ? "/"
                : "/" + item.toLowerCase().replace(/\s+/g, "-");

            return (
              <li key={item}>
                <Link
                  to={path}
                  className={`nav-link-modern ${
                    location.pathname === path ? "active" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              </li>
            );
          })}

          {/* Mobile Login/Signup Button (Now dynamic) */}
          <li className="mobile-login-wrapper">
            <AuthButton isMobile={true} />
          </li>
        </ul>

        {/* Desktop Login Button (Now dynamic) */}
        <AuthButton isMobile={false} />
      </div>
    </nav>
  );
};

export default NavBar;
