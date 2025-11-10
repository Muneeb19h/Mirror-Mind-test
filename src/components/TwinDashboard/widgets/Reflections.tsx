import { motion } from "framer-motion";

const Reflections = ({ insights }: any) => {
  return (
    <motion.div
      className="widget reflections"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <h2 className="widget-title">💭 Recent Reflections</h2>
      <ul className="reflection-list">
        {insights.map((item: string, idx: number) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </motion.div>
  );
};

export default Reflections;
