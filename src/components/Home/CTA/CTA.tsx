import "./CTA.css";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="cta-section">
      <h2 className="cta-title">Ready to Experience the Future of AI?</h2>
      <p className="cta-subtitle">
        Join MirrorMind’s early access program and explore human–AI
        co-evolution.
      </p>
      <Link to="/signup" className="cta-button">
        Get Started
      </Link>
    </section>
  );
};

export default CTA;
