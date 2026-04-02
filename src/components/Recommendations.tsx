import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface RecommendationsProps {
  items: string[];
}

const Recommendations = ({ items }: RecommendationsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-card border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-lg bg-warning/10 p-1.5">
          <Lightbulb className="h-4 w-4 text-warning" />
        </div>
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          Recommendations
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((rec, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.4 }}
            className="flex gap-3 text-sm text-foreground"
          >
            <span className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              {i + 1}
            </span>
            <span>{rec}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default Recommendations;
