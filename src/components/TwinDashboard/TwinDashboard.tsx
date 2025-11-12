import React, { useState, useEffect } from "react";
import "./TwinDashboard.css";
import TwinSummary from "./widgets/TwinSummary";
import MoodTrends from "./widgets/MoodTrends";
import Reflections from "./widgets/Reflections";
import CognitiveInsights from "./widgets/CognitiveInsights";
import QuickActions from "./widgets/QuickActions";

const TwinDashboard: React.FC = () => {
  const [twinData, setTwinData] = useState({
    name: "Jawad's Digital Twin",
    emotion: "Calm",
    energyLevel: 74,
    reflectionDepth: 82,
    insights: [
      "You handle emotional stress with growing resilience.",
      "Your cognitive-emotional balance improved by 8%.",
      "Reflection depth increased after last 3 sessions.",
    ],
    moodHistory: [60, 72, 65, 78, 80, 74, 82],
  });

  // Simulate real-time updates (for now)
  useEffect(() => {
    const interval = setInterval(() => {
      setTwinData((prev) => ({
        ...prev,
        energyLevel: Math.min(100, prev.energyLevel + (Math.random() * 2 - 1)),
        reflectionDepth: Math.min(
          100,
          prev.reflectionDepth + (Math.random() * 2 - 1)
        ),
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="twin-dashboard">
      <div className="dashboard-grid">
        <TwinSummary twinData={twinData} />
        <MoodTrends moodHistory={twinData.moodHistory} />
        <Reflections insights={twinData.insights} />
        <CognitiveInsights insights={twinData.insights} />
        <QuickActions />
      </div>
    </div>
  );
};

export default TwinDashboard;
