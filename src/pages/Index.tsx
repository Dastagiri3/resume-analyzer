import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw } from "lucide-react";
import ResumeUpload from "@/components/ResumeUpload";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import { extractTextFromPDF } from "@/lib/pdfParser";
import { analyzeResume, matchJobs } from "@/lib/resumeAnalyzer";
import type { AnalysisResult, JobMatch } from "@/lib/resumeAnalyzer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * Main page — upload a resume PDF, see analysis & job matches.
 */
const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const { toast } = useToast();

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setAnalysis(null);
      setJobMatches([]);

      try {
        // 1. Extract text from PDF
        const text = await extractTextFromPDF(file);

        if (!text.trim()) {
          toast({
            title: "No text found",
            description: "The PDF appears to be empty or image-only. Try a text-based resume.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // 2. Analyze resume
        const result = analyzeResume(text);

        // 3. Match jobs
        const matches = matchJobs(result.extractedSkills);

        // Small delay for UX polish
        await new Promise((r) => setTimeout(r, 600));

        setAnalysis(result);
        setJobMatches(matches);

        toast({
          title: "Analysis complete",
          description: `Found ${result.extractedSkills.length} skills and ${matches.length} job matches.`,
        });
      } catch (err) {
        console.error("Resume analysis failed:", err);
        toast({
          title: "Analysis failed",
          description: "Could not parse the PDF. Please try a different file.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const handleReset = () => {
    setAnalysis(null);
    setJobMatches([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-heading text-xl font-bold">ResumeAI</h1>
          </div>
          {analysis && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New Analysis
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {!analysis ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="text-center max-w-lg">
                <motion.h2
                  className="font-heading text-3xl md:text-4xl font-bold mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Analyze Your Resume
                </motion.h2>
                <motion.p
                  className="text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  Upload a PDF resume to get an instant score, skill extraction,
                  and personalized job matches powered by AI.
                </motion.p>
              </div>
              <ResumeUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnalysisDashboard analysis={analysis} jobMatches={jobMatches} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
