import React, { useState } from "react";
import "./CreateTwin.css";

interface TwinData {
  name: string;
  purpose: string;
  mood: string;
  energyLevel: number;
  reflectionDepth: number;
  cognitiveStyle: string;
  sensitivity: number;
  focusAreas: string[];
  modelType: string;
  avatarStyle: string;
  auraColor: string;
  personalityIntensity: number;
  insightDepth: number;
  moodVariability: number;
}

const CreateTwin: React.FC = () => {
  const [twinData, setTwinData] = useState<TwinData>({
    name: "",
    purpose: "",
    mood: "Calm",
    energyLevel: 70,
    reflectionDepth: 70,
    cognitiveStyle: "Balanced",
    sensitivity: 50,
    focusAreas: [],
    modelType: "Hybrid",
    // Optional setup:
    avatarStyle: "Neural Sphere",
    auraColor: "#9f7bff",
    personalityIntensity: 60,
    insightDepth: 75,
    moodVariability: 40,
  });

  const moods = ["Calm", "Focused", "Curious", "Stressed", "Happy"];
  const styles = ["Analytical", "Creative", "Empathic", "Balanced"];
  const focuses = [
    "Productivity",
    "Self-awareness",
    "Learning",
    "Health",
    "Relationships",
  ];
  const avatars = [
    "Neural Sphere",
    "Light Entity",
    "Abstract Face",
    "Data Pulse",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTwinData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (focus: string) => {
    setTwinData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(focus)
        ? prev.focusAreas.filter((f) => f !== focus)
        : [...prev.focusAreas, focus],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("twinData", JSON.stringify(twinData));
    window.location.href = "/dashboard";
  };

  return (
    <div className="create-twin-container">
      <form className="twin-form widget" onSubmit={handleSubmit}>
        <h2 className="widget-title">🧠 Create Your Digital Twin</h2>

        {/* ===== Basic Identity ===== */}
        <div className="form-section">
          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Muneb’s Digital Twin"
            value={twinData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-section">
          <label>Purpose</label>
          <input
            type="text"
            name="purpose"
            placeholder="e.g., Emotional awareness tracking"
            value={twinData.purpose}
            onChange={handleChange}
          />
        </div>

        <div className="form-section">
          <label>Default Mood</label>
          <select name="mood" value={twinData.mood} onChange={handleChange}>
            {moods.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* ===== Cognitive & Emotional ===== */}
        <div className="form-section">
          <label>Energy Level: {Math.round(twinData.energyLevel)}%</label>
          <input
            type="range"
            name="energyLevel"
            min="0"
            max="100"
            value={twinData.energyLevel}
            onChange={handleChange}
          />
        </div>

        <div className="form-section">
          <label>
            Reflection Depth: {Math.round(twinData.reflectionDepth)}%
          </label>
          <input
            type="range"
            name="reflectionDepth"
            min="0"
            max="100"
            value={twinData.reflectionDepth}
            onChange={handleChange}
          />
        </div>

        <div className="form-section">
          <label>Cognitive Style</label>
          <select
            name="cognitiveStyle"
            value={twinData.cognitiveStyle}
            onChange={handleChange}
          >
            {styles.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label>Emotional Sensitivity: {twinData.sensitivity}%</label>
          <input
            type="range"
            name="sensitivity"
            min="0"
            max="100"
            value={twinData.sensitivity}
            onChange={handleChange}
          />
        </div>

        {/* ===== Focus Areas & Model ===== */}
        <div className="form-section">
          <label>Primary Focus Areas</label>
          <div className="checkbox-group">
            {focuses.map((f) => (
              <label key={f}>
                <input
                  type="checkbox"
                  checked={twinData.focusAreas.includes(f)}
                  onChange={() => handleCheckboxChange(f)}
                />
                {f}
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label>Model Type</label>
          <select
            name="modelType"
            value={twinData.modelType}
            onChange={handleChange}
          >
            <option>Cognitive</option>
            <option>Emotional</option>
            <option>Behavioral</option>
            <option>Hybrid</option>
          </select>
        </div>

        {/* ===== Optional: Twin Profile ===== */}
        <h3 className="optional-title">✨ Twin Profile (Optional)</h3>

        <div className="form-section">
          <label>Avatar Style</label>
          <select
            name="avatarStyle"
            value={twinData.avatarStyle}
            onChange={handleChange}
          >
            {avatars.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label>Aura Color</label>
          <input
            type="color"
            name="auraColor"
            value={twinData.auraColor}
            onChange={handleChange}
          />
        </div>

        <div className="form-section">
          <label>Personality Intensity: {twinData.personalityIntensity}%</label>
          <input
            type="range"
            name="personalityIntensity"
            min="0"
            max="100"
            value={twinData.personalityIntensity}
            onChange={handleChange}
          />
        </div>

        {/* ===== Optional: Cognitive Insights / Mood Trends ===== */}
        <h3 className="optional-title">🧩 Cognitive Insights / Mood Trends</h3>

        <div className="form-section">
          <label>Insight Depth: {twinData.insightDepth}%</label>
          <input
            type="range"
            name="insightDepth"
            min="0"
            max="100"
            value={twinData.insightDepth}
            onChange={handleChange}
          />
        </div>

        <div className="form-section">
          <label>Mood Variability: {twinData.moodVariability}%</label>
          <input
            type="range"
            name="moodVariability"
            min="0"
            max="100"
            value={twinData.moodVariability}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="create-btn">
          Create Twin
        </button>
      </form>

      {/* Live Preview */}
      <div className="twin-preview widget">
        <h3 className="widget-title">🌠 Twin Preview</h3>
        <div
          className="preview-avatar"
          style={{
            background: twinData.auraColor,
            boxShadow: `0 0 30px ${twinData.auraColor}`,
          }}
        ></div>
        <p>
          <strong>Name:</strong> {twinData.name || "Unnamed Twin"}
        </p>
        <p>
          <strong>Mood:</strong> {twinData.mood}
        </p>
        <p>
          <strong>Avatar:</strong> {twinData.avatarStyle}
        </p>
        <p>
          <strong>Personality Intensity:</strong>{" "}
          {twinData.personalityIntensity}%
        </p>
        <p>
          <strong>Insight Depth:</strong> {twinData.insightDepth}%
        </p>
        <p>
          <strong>Mood Variability:</strong> {twinData.moodVariability}%
        </p>
      </div>
    </div>
  );
};

export default CreateTwin;
