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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl animate-blob"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full opacity-25 blur-3xl animate-blob"
          style={{
            background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
            animationDelay: "-6s",
          }}
        />
        <div
          className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl animate-blob"
          style={{
            background: "radial-gradient(circle, hsl(217 91% 70%) 0%, transparent 70%)",
            animationDelay: "-12s",
          }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="rounded-xl p-2 shadow-blue-sm"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-xl font-bold">
              Resume<span className="text-gradient-blue">AI</span>
            </h1>
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
      <main className="px-4 py-8 md:py-12 relative">
        <AnimatePresence mode="wait">
          {!analysis ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-10"
            >
              <div className="text-center max-w-xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-5 backdrop-blur-sm"
                >
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                  <span className="text-xs font-medium text-primary">AI-Powered Analysis</span>
                </motion.div>
                <motion.h2
                  className="font-heading text-4xl md:text-5xl font-bold mb-4 leading-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Analyze Your <span className="text-gradient-blue">Resume</span>
                </motion.h2>
                <motion.p
                  className="text-muted-foreground text-base md:text-lg"
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
