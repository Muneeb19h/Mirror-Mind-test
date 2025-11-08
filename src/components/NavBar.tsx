import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";

interface NavBarProps {
  brandName: string;
  imageSrcPath: string;
  navItems: string[];
}

const NavBar = ({ brandName, imageSrcPath, navItems }: NavBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="navbar-modern">
      <div className="navbar-container">
        {/* Logo and Brand */}
        <Link to="/" className="navbar-brand-modern">
          <img src={imageSrcPath} alt="logo" className="brand-logo" />
          <span>{brandName}</span>
        </Link>

        {/* Hamburger for mobile */}
        <div
          className={`menu-toggle ${isMenuOpen ? "open" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Nav Links */}
        <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          {navItems.map((item) => {
            const path =
              item.toLowerCase() === "home"
                ? "/"
                : "/" + item.toLowerCase().replace(" ", "-");
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
        <Link to="/login" className="login-btn">
          Login / Signup
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
