import { motion } from "framer-motion";
import { Zap, Sparkles, Activity } from "lucide-react";

type CognitiveInsightsProps = {
  insights: string[];
};
const CognitiveInsights: React.FC<CognitiveInsightsProps> = ({}) => {
  return (
    <motion.div
      className="widget cognitive-insights"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2 }}
    >
      <h2 className="widget-title">🧩 Cognitive Insights</h2>
      <div className="insight-items">
        <div className="insight">
          <Zap color="#70ffb7" size={22} />
          <p>Neural stability improving across emotional states.</p>
        </div>
        <div className="insight">
          <Sparkles color="#a488ff" size={22} />
          <p>Creativity bursts align with focused calm states.</p>
        </div>
        <div className="insight">
          <Activity color="#ff6ef8" size={22} />
          <p>Self-regulation patterns stable since last update.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CognitiveInsights;
