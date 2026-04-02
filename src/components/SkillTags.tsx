import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface SkillTagsProps {
  title: string;
  skills: string[];
  variant?: "default" | "missing";
}

/**
 * Display extracted or missing skills as animated tag badges.
 */
const SkillTags = ({ title, skills, variant = "default" }: SkillTagsProps) => {
  if (skills.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-3"
    >
      <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <motion.div
            key={skill}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.05 * i }}
          >
            <Badge
              variant={variant === "missing" ? "destructive" : "secondary"}
              className={`
                text-xs font-medium capitalize
                ${variant === "missing"
                  ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                  : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                }
              `}
            >
              {skill}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SkillTags;
