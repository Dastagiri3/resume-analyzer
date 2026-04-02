import { motion } from "framer-motion";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

/**
 * Drag-and-drop resume upload zone with file input fallback.
 */
const ResumeUpload = ({ onFileSelect, isLoading }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          rounded-2xl border-2 border-dashed p-12 cursor-pointer
          transition-all duration-300
          ${isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
          }
        `}
      >
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
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg font-heading font-medium text-foreground">
              Analyzing your resume…
            </p>
            <p className="text-sm text-muted-foreground">
              Extracting skills and computing scores
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-4">
              {fileName ? (
                <FileText className="h-10 w-10 text-primary" />
              ) : (
                <Upload className="h-10 w-10 text-primary" />
              )}
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-semibold text-foreground">
                {fileName ? fileName : "Drop your resume here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
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
