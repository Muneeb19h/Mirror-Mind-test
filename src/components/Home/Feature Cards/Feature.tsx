import "./Feature.css";
import { FaBrain, FaChartLine, FaHeart } from "react-icons/fa";

const features = [
  {
    icon: <FaBrain />,
    title: "Cognitive Modeling",
    desc: "Simulates human-like reasoning, perception, and decision processes.",
  },
  {
    icon: <FaHeart />,
    title: "Emotional Intelligence",
    desc: "Understands human emotions and adapts responses in real-time.",
  },
  {
    icon: <FaChartLine />,
    title: "Adaptive Learning",
    desc: "Continuously improves through multi-modal data and feedback.",
  },
];

const Feature = () => {
  return (
    <section className="features-section">
      <h2 className="features-title">Core Capabilities</h2>
      <div className="features-grid">
        {features.map((f, index) => (
          <div key={index} className="feature-card">
            <div className="icon-wrapper">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Feature;
