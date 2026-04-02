import { motion } from "framer-motion";

interface ScoreCircleProps {
  score: number;
  label: string;
  size?: "sm" | "lg";
}

/**
 * Animated circular progress indicator for scores.
 */
const ScoreCircle = ({ score, label, size = "lg" }: ScoreCircleProps) => {
  const radius = size === "lg" ? 80 : 40;
  const stroke = size === "lg" ? 10 : 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const dimension = radius * 2;

  const getColor = (s: number) => {
    if (s >= 75) return "hsl(var(--success))";
    if (s >= 50) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg width={dimension} height={dimension} className="-rotate-90">
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`font-heading font-bold ${size === "lg" ? "text-3xl" : "text-lg"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <span className={`font-medium text-muted-foreground ${size === "lg" ? "text-sm" : "text-xs"}`}>
        {label}
      </span>
    </div>
  );
};

export default ScoreCircle;
