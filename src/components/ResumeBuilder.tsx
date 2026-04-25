import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Wand2, Copy, Download, Sparkles, Target, AlertCircle, Upload, FileText, X, Loader2, FileDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { buildResume, type BuilderProfile, type BuilderResult } from "@/lib/resumeBuilder";
import { extractTextFromPDF } from "@/lib/pdfParser";
import { TEMPLATES, renderResumePdf, type TemplateId } from "@/lib/resumeTemplates";

const EMPTY: BuilderProfile = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  summary: "",
  experience: "",
  education: "",
  skills: "",
};

/**
 * Resume Builder — paste a job description + fill in profile,
 * get a tailored resume draft aligned with JD keywords.
 */
const ResumeBuilder = () => {
  const [jd, setJd] = useState("");
  const [jdFileName, setJdFileName] = useState<string | null>(null);
  const [jdLoading, setJdLoading] = useState(false);
  const [profile, setProfile] = useState<BuilderProfile>(EMPTY);
  const [result, setResult] = useState<BuilderResult | null>(null);
  const [building, setBuilding] = useState(false);
  const [template, setTemplate] = useState<TemplateId>("modern");
  const jdFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const update = (k: keyof BuilderProfile) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setProfile((p) => ({ ...p, [k]: e.target.value }));

  const handleJdFile = async (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isTxt = file.type.startsWith("text/") || /\.(txt|md)$/i.test(file.name);
    if (!isPdf && !isTxt) {
      toast({
        title: "Unsupported file",
        description: "Please upload a PDF, TXT, or MD file.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" });
      return;
    }
    setJdLoading(true);
    try {
      const text = isPdf ? await extractTextFromPDF(file) : await file.text();
      if (!text.trim()) {
        toast({
          title: "No text found",
          description: "The file appears empty or image-only.",
          variant: "destructive",
        });
        return;
      }
      setJd(text);
      setJdFileName(file.name);
      toast({ title: "Job description loaded", description: file.name });
    } catch (err) {
      console.error("JD parse failed:", err);
      toast({
        title: "Parse failed",
        description: "Could not read the file. Try another.",
        variant: "destructive",
      });
    } finally {
      setJdLoading(false);
    }
  };

  const handleJdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleJdFile(f);
    e.target.value = "";
  };

  const handleJdDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleJdFile(f);
  };

  const clearJd = () => {
    setJd("");
    setJdFileName(null);
  };

  const handleBuild = async () => {
    if (!jd.trim()) {
      toast({
        title: "Job description required",
        description: "Paste a job description to tailor your resume.",
        variant: "destructive",
      });
      return;
    }
    if (!profile.fullName.trim()) {
      toast({
        title: "Name required",
        description: "Add at least your full name to generate a resume.",
        variant: "destructive",
      });
      return;
    }
    setBuilding(true);
    await new Promise((r) => setTimeout(r, 400));
    const r = buildResume(jd, profile);
    setResult(r);
    setBuilding(false);
    toast({
      title: "Resume generated",
      description: `${r.alignmentScore}% alignment with the job description.`,
    });
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.markdown);
    toast({ title: "Copied to clipboard" });
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(profile.fullName || "resume").replace(/\s+/g, "_")}_resume.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6"
    >
      {/* Left: Inputs */}
      <Card className="p-5 bg-card/70 backdrop-blur-xl border-border/60 space-y-5">
        <div className="flex items-center gap-2">
          <div
            className="rounded-lg p-1.5"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Target className="h-4 w-4 text-primary-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold">Job Description</h3>
        </div>

        {/* Upload / drag-drop area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleJdDrop}
          className="rounded-lg border-2 border-dashed border-border/70 bg-background/40 hover:border-primary/50 hover:bg-primary/5 transition-colors p-3 flex items-center justify-between gap-3"
        >
          <input
            ref={jdFileInputRef}
            type="file"
            accept=".pdf,.txt,.md,application/pdf,text/plain"
            className="hidden"
            onChange={handleJdInputChange}
          />
          {jdFileName ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm truncate">{jdFileName}</span>
              <Button size="icon" variant="ghost" onClick={clearJd} className="h-7 w-7 shrink-0">
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
              {jdLoading ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <Upload className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">
                {jdLoading ? "Reading file…" : "Drop a JD file here, or"}
              </span>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => jdFileInputRef.current?.click()}
            disabled={jdLoading}
            className="gap-1.5 shrink-0"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload PDF
          </Button>
        </div>

        <Textarea
          value={jd}
          onChange={(e) => {
            setJd(e.target.value);
            if (jdFileName) setJdFileName(null);
          }}
          placeholder="…or paste the full job description here."
          className="min-h-[140px] resize-y"
        />

        <div className="border-t border-border/50 pt-4 space-y-3">
          <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Your Profile
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Full name *" value={profile.fullName} onChange={update("fullName")} />
            <Input placeholder="Target role (e.g. Frontend Engineer)" value={profile.title} onChange={update("title")} />
            <Input placeholder="Email" value={profile.email} onChange={update("email")} />
            <Input placeholder="Phone" value={profile.phone} onChange={update("phone")} />
            <Input placeholder="Location" value={profile.location} onChange={update("location")} />
            <Input placeholder="LinkedIn / Portfolio" value={profile.linkedin} onChange={update("linkedin")} />
          </div>
          <Textarea
            placeholder="Professional summary (leave blank to auto-generate from JD keywords)"
            value={profile.summary}
            onChange={update("summary")}
            className="min-h-[80px]"
          />
          <Textarea
            placeholder={`Experience — one role per paragraph. First line = "Role at Company (dates)", next lines = bullet achievements.\n\nExample:\nSenior Engineer at Acme (2022 – Present)\nLed migration to React 18 reducing load time by 40%\nMentored 5 junior engineers`}
            value={profile.experience}
            onChange={update("experience")}
            className="min-h-[140px]"
          />
          <Textarea
            placeholder="Education — degree, institution, year"
            value={profile.education}
            onChange={update("education")}
            className="min-h-[60px]"
          />
          <Textarea
            placeholder="Your skills (comma separated) — e.g. react, typescript, aws"
            value={profile.skills}
            onChange={update("skills")}
            className="min-h-[60px]"
          />
        </div>

        <Button
          onClick={handleBuild}
          disabled={building}
          className="w-full gap-2"
          size="lg"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Wand2 className="h-4 w-4" />
          {building ? "Tailoring resume…" : "Generate Tailored Resume"}
        </Button>
      </Card>

      {/* Right: Output */}
      <div className="space-y-4">
        {result ? (
          <>
            <Card className="p-5 bg-card/70 backdrop-blur-xl border-border/60">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    JD Alignment
                  </p>
                  <p className="font-heading text-2xl font-bold text-gradient-blue">
                    {result.alignmentScore}%
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload} className="gap-1.5">
                    <Download className="h-3.5 w-3.5" /> .md
                  </Button>
                </div>
              </div>
              <Progress value={result.alignmentScore} className="h-2" />

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    ✅ Matched keywords ({result.matchedKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedKeywords.length === 0 && (
                      <span className="text-xs text-muted-foreground">None yet — add more skills.</span>
                    )}
                    {result.matchedKeywords.map((k) => (
                      <Badge key={k} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>
                {result.suggestedKeywords.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Suggested keywords from JD ({result.suggestedKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.suggestedKeywords.slice(0, 18).map((k) => (
                        <Badge key={k} variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-5 bg-card/70 backdrop-blur-xl border-border/60">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Tailored Resume Preview
              </p>
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-foreground/90 max-h-[600px] overflow-y-auto">
                {result.markdown}
              </pre>
            </Card>
          </>
        ) : (
          <Card className="p-10 bg-card/50 backdrop-blur-xl border-border/60 border-dashed text-center">
            <Wand2 className="h-10 w-10 mx-auto text-primary/60 mb-3" />
            <h3 className="font-heading text-lg font-semibold mb-1">
              Your tailored resume appears here
            </h3>
            <p className="text-sm text-muted-foreground">
              Paste a job description, fill your profile, and click generate.
              We'll align your resume with the JD's keywords for better ATS scoring.
            </p>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default ResumeBuilder;
