import { motion } from "framer-motion";
import { Battery, Brain, Heart } from "lucide-react";

const TwinSummary = ({ twinData }: any) => {
  return (
    <motion.div
      className="widget twin-summary"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="widget-title">🧬 {twinData.name}</h2>
      <div className="summary-stats">
        <div className="stat">
          <Heart size={20} color="#ff5ea2" />
          <span>Emotion:</span>
          <strong>{twinData.emotion}</strong>
        </div>
        <div className="stat">
          <Battery size={20} color="#70ffb7" />
          <span>Energy:</span>
          <div className="bar">
            <div
              className="fill"
              style={{ width: `${twinData.energyLevel}%` }}
            ></div>
          </div>
          <strong>{Math.round(twinData.energyLevel)}%</strong>
        </div>
        <div className="stat">
          <Brain size={20} color="#9f7bff" />
          <span>Reflection Depth:</span>
          <div className="bar">
            <div
              className="fill purple"
              style={{ width: `${twinData.reflectionDepth}%` }}
            ></div>
          </div>
          <strong>{Math.round(twinData.reflectionDepth)}%</strong>
        </div>
      </div>
    </motion.div>
  );
};

export default TwinSummary;
