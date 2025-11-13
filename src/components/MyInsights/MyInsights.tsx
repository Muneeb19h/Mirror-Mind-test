import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./MyInsights.css";

const MyInsights: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Your reflection depth increased by 12% this week.",
    "Cognitive flexibility showed improvement in complex tasks.",
    "Mood stability improved after consistent journaling.",
  ]);

  const [stats] = useState([
    { label: "Emotional Stability", value: 82 },
    { label: "Cognitive Growth", value: 74 },
    { label: "Reflection Depth", value: 88 },
  ]);

  const [chartData] = useState([
    { day: "Mon", mood: 70, focus: 65 },
    { day: "Tue", mood: 72, focus: 68 },
    { day: "Wed", mood: 75, focus: 70 },
    { day: "Thu", mood: 78, focus: 74 },
    { day: "Fri", mood: 80, focus: 76 },
    { day: "Sat", mood: 85, focus: 78 },
    { day: "Sun", mood: 88, focus: 82 },
  ]);

  // Simulate new AI insights appearing every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setInsights((prev) => [
        ...prev,
        "You demonstrated higher emotional awareness today 🌿",
      ]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="insights-page">
      <h1 className="page-title">My Insights</h1>

      {/* Stats Overview */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <h3>{stat.label}</h3>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${stat.value}%` }}></div>
            </div>
            <p>{stat.value}%</p>
          </div>
        ))}
      </div>

      {/* Mood vs Focus Chart */}
      <div className="chart-section">
        <h2>Mood vs Focus Trends</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7a5eff" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#a488ff" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6affb8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#4fd8a6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
              />
              <XAxis dataKey="day" stroke="#bfaaff" />
              <YAxis stroke="#bfaaff" />
              <Tooltip
                contentStyle={{
                  background: "rgba(40,30,80,0.9)",
                  border: "1px solid rgba(150,100,255,0.3)",
                  borderRadius: "10px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="url(#moodGradient)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="focus"
                stroke="url(#focusGradient)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight Feed */}
      <div className="insight-feed">
        <h2>Recent Reflections</h2>
        <ul>
          {insights.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* AI Recommendations */}
      <div className="recommendations">
        <h2>AI Suggestions</h2>
        <div className="suggestions-grid">
          <div className="suggestion-card">🧘 Practice mindfulness tonight</div>
          <div className="suggestion-card">📖 Journal your daily emotions</div>
          <div className="suggestion-card">💬 Reflect on positive outcomes</div>
        </div>
      </div>
    </div>
  );
};

export default MyInsights;
