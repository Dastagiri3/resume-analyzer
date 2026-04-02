import { motion } from "framer-motion";
import { FileText, Hash, BookOpen, CheckCircle2 } from "lucide-react";
import ScoreCircle from "@/components/ScoreCircle";
import SkillTags from "@/components/SkillTags";
import JobMatchCard from "@/components/JobMatchCard";
import type { AnalysisResult, JobMatch } from "@/lib/resumeAnalyzer";

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
  jobMatches: JobMatch[];
}

/**
 * Main dashboard displaying all analysis results.
 */
const AnalysisDashboard = ({ analysis, jobMatches }: AnalysisDashboardProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Score overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border p-8"
      >
        <h2 className="font-heading text-xl font-bold mb-6 text-center">
          Resume Score
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          <ScoreCircle score={analysis.overallScore} label="Overall" size="lg" />
          <div className="flex gap-6 md:gap-10">
            <ScoreCircle score={analysis.skillsScore} label="Skills (50%)" size="sm" />
            <ScoreCircle score={analysis.keywordScore} label="Keywords (30%)" size="sm" />
            <ScoreCircle score={analysis.sectionsScore} label="Sections (20%)" size="sm" />
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: "Words", value: analysis.wordCount.toLocaleString() },
          { icon: Hash, label: "Skills Found", value: analysis.extractedSkills.length },
          { icon: BookOpen, label: "Sections", value: `${analysis.sectionsFound.length}/${analysis.sectionsFound.length + analysis.sectionsMissing.length}` },
          { icon: CheckCircle2, label: "Top Match", value: jobMatches[0] ? `${jobMatches[0].matchPercentage}%` : "—" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="rounded-xl bg-card border border-border p-4 text-center"
          >
            <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-heading font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Skills section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          <SkillTags title="Extracted Skills" skills={analysis.extractedSkills} />
        </div>
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <SkillTags
            title="Sections Found"
            skills={analysis.sectionsFound}
          />
          <SkillTags
            title="Missing Sections"
            skills={analysis.sectionsMissing}
            variant="missing"
          />
        </div>
      </div>

      {/* Job matches */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="font-heading text-xl font-bold mb-4">
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
