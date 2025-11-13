import React, { useState, useEffect } from "react";
import EmotionVisualizer from "./components/EmotionVisualizer";
import "./AIReflections.css";

const AIReflections: React.FC = () => {
  const [reflections, setReflections] = useState<string[]>([
    "Your focus improved during emotionally calm states.",
    "You’ve shown higher resilience when journaling regularly.",
    "Emotional awareness and reflection depth are in harmony today.",
  ]);

  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const handleReflect = () => {
    if (!userInput.trim()) return;

    // Mock AI reflection (in real setup, connect to AI backend)
    const responses = [
      "That’s a thoughtful reflection. It shows strong emotional intelligence.",
      "I sense a positive adaptation in your cognitive response patterns.",
      "It’s okay to feel uncertain — your twin is learning from this moment.",
      "Noticing your emotions is the first step to balanced cognition.",
    ];
    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
    setAiResponse(randomResponse);
    setReflections((prev) => [...prev, `🧠 ${randomResponse}`]);
    setUserInput("");
  };

  return (
    <div className="ai-reflections-page">
      <h1 className="page-title">AI Reflections</h1>

      {/* Reflection Feed */}
      <div className="reflection-feed">
        {reflections.map((r, i) => (
          <div key={i} className="reflection-item">
            {r}
          </div>
        ))}
      </div>

      <EmotionVisualizer />
      {/* Reflection Input Box */}
      <div className="reflection-input-box">
        <textarea
          placeholder="Share your thoughts with your twin..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        ></textarea>
        <button onClick={handleReflect}>Reflect</button>
      </div>

      {/* AI Response Area */}
      {aiResponse && (
        <div className="ai-response-box">
          <p className="response-text">{aiResponse}</p>
        </div>
      )}
    </div>
  );
};

export default AIReflections;
