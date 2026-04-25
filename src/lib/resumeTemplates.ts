/**
 * Resume PDF templates — multiple visual styles for the tailored resume.
 * Each template renders a BuilderProfile + skills/summary into a jsPDF document.
 */

import { jsPDF } from "jspdf";
import type { BuilderProfile } from "./resumeBuilder";

export type TemplateId = "classic" | "modern" | "minimal" | "elegant";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  accent: string; // tailwind hex preview color
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional serif layout, ATS-friendly.",
    accent: "#1f2937",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Bold sidebar with blue accent header.",
    accent: "#2563eb",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean single-column with subtle dividers.",
    accent: "#0f172a",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Warm tones and refined typography.",
    accent: "#b45309",
  },
];

export interface RenderInput {
  profile: BuilderProfile;
  targetTitle: string;
  summary: string;
  skills: string[];
}

/** Public entry point — render to jsPDF and return blob. */
export function renderResumePdf(
  template: TemplateId,
  input: RenderInput
): Blob {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  switch (template) {
    case "modern":
      renderModern(doc, input);
      break;
    case "minimal":
      renderMinimal(doc, input);
      break;
    case "elegant":
      renderElegant(doc, input);
      break;
    case "classic":
    default:
      renderClassic(doc, input);
      break;
  }
  return doc.output("blob");
}

// ---------- Helpers ----------

interface ExpBlock {
  header: string;
  bullets: string[];
}

function parseExperience(raw: string): ExpBlock[] {
  return (raw || "")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
      return {
        header: lines[0] || "",
        bullets: lines.slice(1).map((l) => l.replace(/^[-•]\s*/, "")),
      };
    });
}

function contactLine(p: BuilderProfile): string {
  return [p.email, p.phone, p.location, p.linkedin].filter(Boolean).join("  •  ");
}

/** Wrap text and write, returning the new Y. */
function writeWrapped(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 14
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  lines.forEach((ln, i) => doc.text(ln, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

function ensureSpace(doc: jsPDF, y: number, needed: number, top = 56): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - 48) {
    doc.addPage();
    return top;
  }
  return y;
}

// ---------- Template: Classic ----------

function renderClassic(doc: jsPDF, { profile, targetTitle, summary, skills }: RenderInput) {
  const W = doc.internal.pageSize.getWidth();
  const margin = 56;
  const contentW = W - margin * 2;
  let y = 64;

  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text(profile.fullName || "Your Name", margin, y);
  y += 22;

  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(targetTitle, margin, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 100, 100);
  doc.text(contactLine(profile), margin, y);
  y += 16;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.6);
  doc.line(margin, y, W - margin, y);
  y += 18;

  y = sectionClassic(doc, "PROFESSIONAL SUMMARY", margin, y);
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(40, 40, 40);
  y = writeWrapped(doc, summary, margin, y, contentW, 14) + 10;

  y = sectionClassic(doc, "CORE SKILLS", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y = writeWrapped(doc, skills.join("  •  "), margin, y, contentW, 13) + 10;

  y = sectionClassic(doc, "EXPERIENCE", margin, y);
  for (const block of parseExperience(profile.experience)) {
    y = ensureSpace(doc, y, 40);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(25, 25, 25);
    y = writeWrapped(doc, block.header, margin, y, contentW, 14);
    doc.setFont("times", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(50, 50, 50);
    for (const b of block.bullets) {
      y = ensureSpace(doc, y, 16);
      y = writeWrapped(doc, `•  ${b}`, margin + 10, y, contentW - 10, 13);
    }
    y += 8;
  }

  if (profile.education?.trim()) {
    y = ensureSpace(doc, y, 40);
    y = sectionClassic(doc, "EDUCATION", margin, y);
    doc.setFont("times", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(50, 50, 50);
    writeWrapped(doc, profile.education.trim(), margin, y, contentW, 14);
  }
}

function sectionClassic(doc: jsPDF, label: string, x: number, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 30);
  doc.text(label, x, y);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(x, y + 3, x + 80, y + 3);
  return y + 18;
}

// ---------- Template: Modern (sidebar) ----------

function renderModern(doc: jsPDF, { profile, targetTitle, summary, skills }: RenderInput) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const sidebarW = 180;

  // Sidebar background
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, sidebarW, H, "F");

  // Sidebar content
  let sy = 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  sy = writeWrapped(doc, profile.fullName || "Your Name", 22, sy, sidebarW - 32, 22);
  sy += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(220, 230, 255);
  sy = writeWrapped(doc, targetTitle, 22, sy, sidebarW - 32, 13) + 16;

  // Sidebar contact
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("CONTACT", 22, sy);
  sy += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 230, 255);
  for (const line of [profile.email, profile.phone, profile.location, profile.linkedin].filter(Boolean)) {
    sy = writeWrapped(doc, line, 22, sy, sidebarW - 32, 12) + 4;
  }
  sy += 10;

  // Sidebar skills
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("SKILLS", 22, sy);
  sy += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 230, 255);
  for (const s of skills) {
    sy = ensureSpace(doc, sy, 14, 60);
    sy = writeWrapped(doc, `• ${s}`, 22, sy, sidebarW - 32, 12) + 2;
  }

  // Main column
  const mx = sidebarW + 32;
  const mw = W - mx - 40;
  let y = 64;

  y = sectionModern(doc, "Summary", mx, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(50, 50, 50);
  y = writeWrapped(doc, summary, mx, y, mw, 14) + 12;

  y = sectionModern(doc, "Experience", mx, y);
  for (const block of parseExperience(profile.experience)) {
    y = ensureSpace(doc, y, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    y = writeWrapped(doc, block.header, mx, y, mw, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    for (const b of block.bullets) {
      y = ensureSpace(doc, y, 14);
      y = writeWrapped(doc, `•  ${b}`, mx + 8, y, mw - 8, 13);
    }
    y += 8;
  }

  if (profile.education?.trim()) {
    y = ensureSpace(doc, y, 40);
    y = sectionModern(doc, "Education", mx, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    writeWrapped(doc, profile.education.trim(), mx, y, mw, 14);
  }
}

function sectionModern(doc: jsPDF, label: string, x: number, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(37, 99, 235);
  doc.text(label.toUpperCase(), x, y);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1.5);
  doc.line(x, y + 4, x + 40, y + 4);
  return y + 18;
}

// ---------- Template: Minimal ----------

function renderMinimal(doc: jsPDF, { profile, targetTitle, summary, skills }: RenderInput) {
  const W = doc.internal.pageSize.getWidth();
  const margin = 64;
  const contentW = W - margin * 2;
  let y = 72;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(26);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.fullName || "Your Name", margin, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(targetTitle, margin, y);
  y += 14;
  doc.setFontSize(9);
  doc.text(contactLine(profile), margin, y);
  y += 24;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, W - margin, y);
  y += 18;

  y = sectionMinimal(doc, "Summary", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85);
  y = writeWrapped(doc, summary, margin, y, contentW, 14) + 14;

  y = sectionMinimal(doc, "Skills", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y = writeWrapped(doc, skills.join(" · "), margin, y, contentW, 14) + 14;

  y = sectionMinimal(doc, "Experience", margin, y);
  for (const block of parseExperience(profile.experience)) {
    y = ensureSpace(doc, y, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    y = writeWrapped(doc, block.header, margin, y, contentW, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    for (const b of block.bullets) {
      y = ensureSpace(doc, y, 14);
      y = writeWrapped(doc, `—  ${b}`, margin + 10, y, contentW - 10, 13);
    }
    y += 8;
  }

  if (profile.education?.trim()) {
    y = ensureSpace(doc, y, 40);
    y = sectionMinimal(doc, "Education", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    writeWrapped(doc, profile.education.trim(), margin, y, contentW, 14);
  }
}

function sectionMinimal(doc: jsPDF, label: string, x: number, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(label.toUpperCase(), x, y, { charSpace: 2 });
  return y + 14;
}

// ---------- Template: Elegant ----------

function renderElegant(doc: jsPDF, { profile, targetTitle, summary, skills }: RenderInput) {
  const W = doc.internal.pageSize.getWidth();
  const margin = 56;
  const contentW = W - margin * 2;

  // Header band
  doc.setFillColor(180, 119, 9);
  doc.rect(0, 0, W, 90, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 248, 235);
  doc.text(profile.fullName || "Your Name", margin, 48);
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.setTextColor(255, 230, 200);
  doc.text(targetTitle, margin, 68);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(contactLine(profile), margin, 84);

  let y = 120;

  y = sectionElegant(doc, "Profile", margin, y);
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 40, 20);
  y = writeWrapped(doc, summary, margin, y, contentW, 15) + 14;

  y = sectionElegant(doc, "Expertise", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 60, 40);
  y = writeWrapped(doc, skills.join("   ◆   "), margin, y, contentW, 14) + 14;

  y = sectionElegant(doc, "Experience", margin, y);
  for (const block of parseExperience(profile.experience)) {
    y = ensureSpace(doc, y, 40);
    doc.setFont("times", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(120, 70, 10);
    y = writeWrapped(doc, block.header, margin, y, contentW, 14);
    doc.setFont("times", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(60, 40, 20);
    for (const b of block.bullets) {
      y = ensureSpace(doc, y, 14);
      y = writeWrapped(doc, `◆  ${b}`, margin + 10, y, contentW - 10, 14);
    }
    y += 8;
  }

  if (profile.education?.trim()) {
    y = ensureSpace(doc, y, 40);
    y = sectionElegant(doc, "Education", margin, y);
    doc.setFont("times", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(60, 40, 20);
    writeWrapped(doc, profile.education.trim(), margin, y, contentW, 14);
  }
}

function sectionElegant(doc: jsPDF, label: string, x: number, y: number): number {
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(180, 119, 9);
  doc.text(label, x, y);
  doc.setDrawColor(180, 119, 9);
  doc.setLineWidth(0.8);
  doc.line(x, y + 4, x + 60, y + 4);
  return y + 20;
}
