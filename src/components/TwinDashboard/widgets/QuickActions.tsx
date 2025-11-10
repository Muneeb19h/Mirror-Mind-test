import { motion } from "framer-motion";
import { Button } from "@chakra-ui/react";

import { Brain, MessageCircle, FileText } from "lucide-react";

const QuickActions = () => {
  return (
    <motion.div
      className="widget quick-actions"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4 }}
    >
      <h2 className="widget-title">⚡ Quick Actions</h2>
      <div className="actions">
        <Button className="action-btn">
          <Brain size={18} />
          Reflect Now
        </Button>
        <Button className="action-btn">
          <MessageCircle size={18} />
          Chat with Twin
        </Button>
        <Button className="action-btn">
          <FileText size={18} />
          Generate Report
        </Button>
      </div>
    </motion.div>
  );
};

export default QuickActions;
