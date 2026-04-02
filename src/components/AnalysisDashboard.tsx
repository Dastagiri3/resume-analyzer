import { motion } from "framer-motion";
import { FileText, Hash, BookOpen, CheckCircle2, BarChart3, Award } from "lucide-react";
import ScoreCircle from "@/components/ScoreCircle";
import ScoreBreakdownChart from "@/components/ScoreBreakdownChart";
import SkillTags from "@/components/SkillTags";
import JobMatchCard from "@/components/JobMatchCard";
import Recommendations from "@/components/Recommendations";
import type { AnalysisResult, JobMatch } from "@/lib/resumeAnalyzer";

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
  jobMatches: JobMatch[];
}

const AnalysisDashboard = ({ analysis, jobMatches }: AnalysisDashboardProps) => {
  const getGrade = (score: number) => {
    if (score >= 90) return { letter: "A+", color: "text-success" };
    if (score >= 80) return { letter: "A", color: "text-success" };
    if (score >= 70) return { letter: "B+", color: "text-success" };
    if (score >= 60) return { letter: "B", color: "text-warning" };
    if (score >= 50) return { letter: "C", color: "text-warning" };
    return { letter: "D", color: "text-destructive" };
  };

  const grade = getGrade(analysis.overallScore);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Hero score section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border p-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <ScoreCircle score={analysis.overallScore} label="Overall Score" size="lg" />
            <span className={`font-heading text-2xl font-bold ${grade.color}`}>
              {grade.letter}
            </span>
          </div>
          <div className="flex-1 w-full">
            <h2 className="font-heading text-lg font-bold mb-1 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Score Breakdown
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              Weighted contribution to your overall score
            </p>
            <ScoreBreakdownChart analysis={analysis} />
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: "Words", value: analysis.wordCount.toLocaleString(), desc: analysis.wordCount < 300 ? "Too short" : analysis.wordCount > 800 ? "Consider trimming" : "Good length" },
          { icon: Hash, label: "Skills Found", value: analysis.extractedSkills.length, desc: `${Object.keys(analysis.skillsByCategory).length} categories` },
          { icon: BookOpen, label: "Sections", value: `${analysis.sectionsFound.length}/${analysis.sectionsFound.length + analysis.sectionsMissing.length}`, desc: `${analysis.sectionsMissing.length} missing` },
          { icon: Award, label: "Top Match", value: jobMatches[0] ? `${jobMatches[0].matchPercentage}%` : "—", desc: jobMatches[0]?.job.title || "N/A" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="rounded-xl bg-card border border-border p-4 text-center hover:border-primary/30 transition-colors"
          >
            <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-heading font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{stat.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Recommendations items={analysis.recommendations} />
      )}

      {/* Skills + Sections */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card border border-border p-6">
          <SkillTags title="Extracted Skills" skills={analysis.extractedSkills} />
        </div>
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <SkillTags title="Sections Found" skills={analysis.sectionsFound} />
          <SkillTags title="Missing Sections" skills={analysis.sectionsMissing} variant="missing" />
        </div>
      </div>

      {/* Job matches */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Top Job Matches
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobMatches.map((match, i) => (
            <JobMatchCard key={match.job.id} match={match} index={i} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalysisDashboard;
