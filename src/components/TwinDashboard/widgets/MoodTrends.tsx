import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MoodTrends = ({ moodHistory }: any) => {
  const data = moodHistory.map((m: number, i: number) => ({
    day: `D${i + 1}`,
    mood: m,
  }));

  return (
    <motion.div
      className="widget mood-trends"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="widget-title">📈 Mood Trends</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="day" stroke="#8884d8" />
          <YAxis stroke="#8884d8" />
          <Tooltip
            contentStyle={{
              background: "rgba(20,20,40,0.8)",
              border: "1px solid #8884d8",
            }}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#a488ff"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default MoodTrends;
