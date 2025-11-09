import "./Hero.css";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="gradient-text">MirrorMind AI</span>
        </h1>
        <p className="hero-subtitle">
          A cognitive–affective Digital Twin that bridges human emotion,
          behavior, and artificial intelligence.
        </p>
        <div className="hero-buttons">
          <Link to="/about" className="btn-glow">
            Learn More
          </Link>
          <Link to="/demo" className="btn-outline">
            Try Demo
          </Link>
        </div>
      </div>

      <div className="hero-glow"></div>
    </section>
  );
};

export default Hero;
