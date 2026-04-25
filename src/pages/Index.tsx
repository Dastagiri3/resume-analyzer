import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw, FileSearch, Wand2 } from "lucide-react";
import ResumeUpload from "@/components/ResumeUpload";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import ResumeBuilder from "@/components/ResumeBuilder";
import { extractTextFromPDF } from "@/lib/pdfParser";
import { analyzeResume, matchJobs } from "@/lib/resumeAnalyzer";
import type { AnalysisResult, JobMatch } from "@/lib/resumeAnalyzer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated sky live preview background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Sun glow */}
        <div
          className="absolute top-[8%] right-[12%] h-[320px] w-[320px] rounded-full blur-2xl animate-sun-glow"
          style={{
            background:
              "radial-gradient(circle, hsl(45 100% 75% / 0.85) 0%, hsl(35 95% 70% / 0.5) 35%, transparent 70%)",
          }}
        />
        {/* Aurora wash */}
        <div
          className="absolute inset-0 opacity-70 animate-aurora"
          style={{ background: "var(--gradient-aurora)", filter: "blur(60px)" }}
        />
        {/* Drifting clouds */}
        <div
          className="absolute top-[15%] left-[-10%] h-[180px] w-[60%] rounded-full blur-3xl opacity-70 animate-cloud-slow"
          style={{
            background:
              "radial-gradient(ellipse, hsl(0 0% 100% / 0.85) 0%, hsl(0 0% 100% / 0.3) 50%, transparent 75%)",
          }}
        />
        <div
          className="absolute top-[40%] right-[-15%] h-[220px] w-[70%] rounded-full blur-3xl opacity-60 animate-cloud-fast"
          style={{
            background:
              "radial-gradient(ellipse, hsl(0 0% 100% / 0.75) 0%, hsl(210 40% 95% / 0.3) 50%, transparent 75%)",
          }}
        />
        <div
          className="absolute bottom-[10%] left-[20%] h-[200px] w-[55%] rounded-full blur-3xl opacity-55 animate-cloud-slow"
          style={{
            background:
              "radial-gradient(ellipse, hsl(30 50% 92% / 0.7) 0%, hsl(30 40% 88% / 0.3) 50%, transparent 75%)",
            animationDelay: "-10s",
          }}
        />
        {/* Distant warm horizon haze */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[35%]"
          style={{
            background:
              "linear-gradient(to top, hsl(30 50% 82% / 0.6) 0%, hsl(35 60% 86% / 0.3) 50%, transparent 100%)",
          }}
        />
        {/* Twinkling highlights */}
        <div className="absolute top-[20%] left-[30%] h-1.5 w-1.5 rounded-full bg-white animate-star-twinkle" />
        <div
          className="absolute top-[35%] left-[70%] h-1 w-1 rounded-full bg-white animate-star-twinkle"
          style={{ animationDelay: "-1s" }}
        />
        <div
          className="absolute top-[55%] left-[15%] h-1.5 w-1.5 rounded-full bg-white animate-star-twinkle"
          style={{ animationDelay: "-2s" }}
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
              className="flex flex-col items-center gap-8"
            >
              <div className="text-center max-w-xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-5 backdrop-blur-sm"
                >
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                  <span className="text-xs font-medium text-primary">AI-Powered Analysis & Builder</span>
                </motion.div>
                <motion.h2
                  className="font-heading text-4xl md:text-5xl font-bold mb-4 leading-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Build & Analyze Your <span className="text-gradient-blue">Resume</span>
                </motion.h2>
                <motion.p
                  className="text-muted-foreground text-base md:text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  Upload a PDF for an instant score, or craft a tailored resume
                  directly from any job description.
                </motion.p>
              </div>

              <Tabs defaultValue="analyze" className="w-full max-w-6xl">
                <TabsList className="mx-auto grid w-full max-w-md grid-cols-2 bg-card/60 backdrop-blur-xl">
                  <TabsTrigger value="analyze" className="gap-1.5">
                    <FileSearch className="h-4 w-4" /> Analyze
                  </TabsTrigger>
                  <TabsTrigger value="build" className="gap-1.5">
                    <Wand2 className="h-4 w-4" /> Build from JD
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="analyze" className="mt-8 flex justify-center">
                  <ResumeUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
                </TabsContent>
                <TabsContent value="build" className="mt-8">
                  <ResumeBuilder />
                </TabsContent>
              </Tabs>
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
