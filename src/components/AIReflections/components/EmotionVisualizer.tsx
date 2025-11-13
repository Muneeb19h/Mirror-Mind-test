import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import "./EmotionVisualizer.css";

const data = [
  { emotion: "Calm", level: 85 },
  { emotion: "Joy", level: 70 },
  { emotion: "Focus", level: 65 },
  { emotion: "Stress", level: 40 },
  { emotion: "Confusion", level: 25 },
  { emotion: "Sadness", level: 30 },
];

const EmotionVisualizer: React.FC = () => {
  return (
    <div className="emotion-visualizer">
      <h2 className="emotion-title">Emotional Balance</h2>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(200, 180, 255, 0.2)" />
          <PolarAngleAxis
            dataKey="emotion"
            stroke="#c7bbff"
            tick={{ fontSize: 12 }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            stroke="rgba(255, 255, 255, 0.1)"
            tick={false}
          />
          <Radar
            name="Emotion Level"
            dataKey="level"
            stroke="#b491ff"
            fill="rgba(140, 90, 255, 0.5)"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionVisualizer;
