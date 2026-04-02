import { motion } from "framer-motion";
import { MapPin, DollarSign, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JobMatch } from "@/lib/resumeAnalyzer";

interface JobMatchCardProps {
  match: JobMatch;
  index: number;
}

/**
 * Card displaying a job match with percentage, matched/missing skills.
 */
const JobMatchCard = ({ match, index }: JobMatchCardProps) => {
  const { job, matchPercentage, matchedSkills, missingSkills } = match;

  const getMatchColor = (pct: number) => {
    if (pct >= 60) return "text-success";
    if (pct >= 35) return "text-warning";
    return "text-destructive";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <h3 className="font-heading font-semibold text-lg leading-tight truncate">
                {job.title}
              </h3>
              <p className="text-sm font-medium text-primary">{job.company}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {job.salary}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className={`text-2xl font-heading font-bold ${getMatchColor(matchPercentage)}`}>
                {matchPercentage}%
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                match
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {job.description}
          </p>

          {matchedSkills.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-success">
                <CheckCircle2 className="h-3 w-3" />
                Matched Skills
              </div>
              <div className="flex flex-wrap gap-1">
                {matchedSkills.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="text-[10px] bg-success/10 text-success border-success/20 capitalize"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {missingSkills.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-destructive">
                <XCircle className="h-3 w-3" />
                Missing Skills
              </div>
              <div className="flex flex-wrap gap-1">
                {missingSkills.slice(0, 5).map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="text-[10px] bg-destructive/10 text-destructive border-destructive/20 capitalize"
                  >
                    {s}
                  </Badge>
                ))}
                {missingSkills.length > 5 && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{missingSkills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default JobMatchCard;
