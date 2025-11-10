import "./Overview.css";

const Overview = () => {
  return (
    <section className="overview-section">
      <h2 className="overview-title gradient-text">
        Understand • Reflect • Evolve
      </h2>
      <p className="overview-subtitle">
        MirrorMind helps you uncover how your thoughts, emotions, and behaviors
        interact — the foundation of your digital twin.
      </p>

      <div className="overview-grid">
        <div className="overview-card">
          <div className="card-glow"></div>
          <h3>Understand</h3>
          <p>
            MirrorMind interprets your patterns to reveal cognitive structures.
          </p>
        </div>

        <div className="overview-card">
          <div className="card-glow"></div>
          <h3>Reflect</h3>
          <p>
            See your inner self mirrored through AI-generated emotional
            insights.
          </p>
        </div>

        <div className="overview-card">
          <div className="card-glow"></div>
          <h3>Evolve</h3>
          <p>
            Every interaction strengthens your digital twin’s understanding of
            you.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Overview;
