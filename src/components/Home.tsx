import React from "react";
import "../App.css";

const Home = () => {
  return (
    <div className="home-container text-light">
      {/* Hero Section */}
      <section className="hero">
        <h1>Shape Your Digital Twin Today</h1>
        <p>
          Build a cognitive–emotional model for deeper self-understanding
          through MirrorMind.
        </p>
        <button className="btn-glow">Create Twin</button>
      </section>

      {/* Feature Cards */}
      <section className="container text-center mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-3 col-md-4 col-sm-8 mx-3 mb-4 feature-card">
            <h4>Emotions Tracked</h4>
            <p>Visualize emotional trends with AI reflections.</p>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-8 mx-3 mb-4 feature-card">
            <h4>Decision Reflection</h4>
            <p>Revisit and learn from past cognitive decisions.</p>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-8 mx-3 mb-4 feature-card">
            <h4>Behavior Analysis</h4>
            <p>Understand your behavioral patterns for better balance.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta text-center mt-5">
        <h3>Start Building Your Digital Twin</h3>
        <button className="btn-glow mt-3">Get Started</button>
      </section>
    </div>
  );
};

export default Home;
