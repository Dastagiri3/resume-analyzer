import { motion } from "framer-motion";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

/**
 * Drag-and-drop resume upload zone with interactive 3D tilt effect.
 */
const ResumeUpload = ({ onFileSelect, isLoading }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLLabelElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setFileName(file.name);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (!cardRef.current || isLoading) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -10, y: x * 10 });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto perspective-1000"
    >
      <label
        ref={cardRef}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.2s ease-out",
        }}
        className={`
          relative flex flex-col items-center justify-center
          rounded-3xl border-2 border-dashed p-12 cursor-pointer
          bg-card/70 backdrop-blur-xl shadow-blue
          transition-colors duration-300 overflow-hidden
          ${isDragging
            ? "border-primary bg-primary/5"
            : "border-primary/30 hover:border-primary/60"
          }
        `}
      >
        {/* Animated gradient glow inside card */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, hsl(var(--primary) / 0.15), transparent 60%), radial-gradient(circle at 70% 80%, hsl(var(--accent) / 0.15), transparent 60%)",
          }}
        />

        <input
          type="file"
          accept=".pdf"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="relative flex flex-col items-center gap-4 z-10">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg font-heading font-medium text-foreground">
              Analyzing your resume…
            </p>
            <p className="text-sm text-muted-foreground">
              Extracting skills and computing scores
            </p>
          </div>
        ) : (
          <div
            className="relative flex flex-col items-center gap-5 z-10"
            style={{ transform: "translateZ(40px)" }}
          >
            {/* 3D floating icon */}
            <div className="relative animate-float-3d" style={{ transformStyle: "preserve-3d" }}>
              <div
                className="absolute inset-0 rounded-2xl blur-2xl opacity-70"
                style={{ background: "var(--gradient-primary)" }}
              />
              <div
                className="relative rounded-2xl p-5 shadow-blue"
                style={{ background: "var(--gradient-primary)" }}
              >
                {fileName ? (
                  <FileText className="h-12 w-12 text-primary-foreground" strokeWidth={2} />
                ) : (
                  <Upload className="h-12 w-12 text-primary-foreground" strokeWidth={2} />
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-xl font-heading font-bold text-foreground">
                {fileName ? fileName : "Drop your resume here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1.5">
                {fileName
                  ? "Drop another file to re-analyze"
                  : "or click to browse — PDF files only"}
              </p>
            </div>
          </div>
        )}
      </label>
    </motion.div>
  );
};

export default ResumeUpload;
