import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

interface NavBarProps {
  brandName: string;
  imageSrcPath: string;
  navItems: string[];
}

const NavBar = ({ brandName, imageSrcPath, navItems }: NavBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
        </ul>

        {/* Login Button */}
        <Link to="/auth" className="login-btn">
          Login / Signup
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
