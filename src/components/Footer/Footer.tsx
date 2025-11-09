import { Link, useLocation } from "react-router-dom";
import "./Footer.css";
import img from "../../assets/logo.png";

const Footer = () => {
  const location = useLocation();

  // Hide footer on authentication pages
  if (location.pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <footer className="footer-modern">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <img src={img} alt="MirrorMind Logo" className="footer-logo" />
          <h2>MirrorMind</h2>
          <p>Reflect. Create. Evolve.</p>
        </div>

        {/* Navigation Links */}
        <div className="footer-links">
          <h3>Explore</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/dashboard">Twin Dashboard</Link>
            </li>
            <li>
              <Link to="/create-twin">Create Twin</Link>
            </li>
            <li>
              <Link to="/insights">My Insights</Link>
            </li>
            <li>
              <Link to="/reflections">AI Reflections</Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-links">
          <h3>Resources</h3>
          <ul>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div className="footer-socials">
          <h3>Connect</h3>
          <div className="social-icons">
            <a href="#" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" aria-label="GitHub">
              <i className="fab fa-github"></i>
            </a>
            <a href="#" aria-label="LinkedIn">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MirrorMind. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
