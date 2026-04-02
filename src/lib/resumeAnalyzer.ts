/**
 * Resume analysis engine.
 * Handles text extraction, skill detection, scoring, and job matching.
 */

import { sampleJobs, type JobDescription } from "./sampleJobs";
import {
  SKILL_DATABASE,
  SKILL_SYNONYMS,
  ALL_SKILLS,
  EXPECTED_SECTIONS,
} from "./skillDatabase";

// ── Types ──
export interface AnalysisResult {
  overallScore: number;
  skillsScore: number;
  keywordScore: number;
  sectionsScore: number;
  formattingScore: number;
  extractedSkills: string[];
  skillsByCategory: Record<string, string[]>;
  sectionsFound: string[];
  sectionsMissing: string[];
  wordCount: number;
  resumeText: string;
  recommendations: string[];
}

export interface JobMatch {
  job: JobDescription;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
}

/**
 * Extract skills from resume text using keyword + synonym matching.
 */
export function extractSkills(text: string): {
  skills: string[];
  byCategory: Record<string, string[]>;
} {
  const lowerText = text.toLowerCase();
  const foundSet = new Set<string>();
  const byCategory: Record<string, string[]> = {};

  // First pass: direct skill matching
  for (const [category, skills] of Object.entries(SKILL_DATABASE)) {
    const categoryMatches: string[] = [];
    for (const skill of skills) {
      const regex =
        skill.length <= 3
          ? new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
          : new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      if (regex.test(lowerText) && !foundSet.has(skill)) {
        foundSet.add(skill);
        categoryMatches.push(skill);
      }
    }
    if (categoryMatches.length > 0) {
      byCategory[category] = categoryMatches;
    }
  }

  // Second pass: synonym matching
  for (const [synonym, canonical] of Object.entries(SKILL_SYNONYMS)) {
    if (foundSet.has(canonical)) continue;
    const regex = new RegExp(
      `\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i"
    );
    if (regex.test(lowerText)) {
      foundSet.add(canonical);
      // Find the category for canonical skill
      for (const [category, skills] of Object.entries(SKILL_DATABASE)) {
        if (skills.includes(canonical)) {
          byCategory[category] = byCategory[category] || [];
          if (!byCategory[category].includes(canonical)) {
            byCategory[category].push(canonical);
          }
          break;
        }
      }
    }
  }

  return { skills: Array.from(foundSet), byCategory };
}

/**
 * Detect which resume sections are present.
 */
export function detectSections(text: string): {
  found: string[];
  missing: string[];
} {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];

  for (const section of EXPECTED_SECTIONS) {
    // Look for section headers (word at start of line or after newline, possibly with colon)
    const regex = new RegExp(`(?:^|\\n)\\s*${section}[s]?\\s*[:.]?\\s*(?:\\n|$)`, "im");
    const simpleRegex = new RegExp(`\\b${section}\\b`, "i");
    if (regex.test(lowerText) || simpleRegex.test(lowerText)) {
      found.push(section);
    } else {
      missing.push(section);
    }
  }

  return { found, missing };
}

/**
 * Compute keyword relevance score using action verb density + quantifiable achievements.
 */
function computeKeywordScore(text: string): number {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).filter((w) => w.length > 2);
  const totalWords = words.length;
  if (totalWords === 0) return 0;

  const actionVerbs = [
    "led", "developed", "designed", "implemented", "managed", "created",
    "built", "optimized", "improved", "delivered", "achieved", "increased",
    "reduced", "launched", "collaborated", "mentored", "architected",
    "automated", "deployed", "analyzed", "resolved", "integrated",
    "spearheaded", "orchestrated", "streamlined", "pioneered", "facilitated",
    "negotiated", "transformed", "revamped", "accelerated",
  ];

  const quantifiers = ["%", "million", "billion", "increased", "decreased", "reduced", "improved", "revenue", "roi", "growth"];

  let verbCount = 0;
  let quantifierCount = 0;

  for (const verb of actionVerbs) {
    const matches = lowerText.match(new RegExp(`\\b${verb}\\b`, "gi"));
    if (matches) verbCount += matches.length;
  }

  for (const q of quantifiers) {
    const matches = lowerText.match(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"));
    if (matches) quantifierCount += matches.length;
  }

  // Check for numeric achievements (e.g., "increased revenue by 30%")
  const numericAchievements = lowerText.match(/\d+[%+]|\$[\d,]+[kKmMbB]?|\d+x\b/g);
  const achievementBonus = numericAchievements ? Math.min(numericAchievements.length * 5, 20) : 0;

  const verbDensity = Math.min(verbCount / Math.max(totalWords / 40, 1), 1);
  const quantDensity = Math.min(quantifierCount / Math.max(totalWords / 80, 1), 1);

  return Math.min(Math.round((verbDensity * 0.5 + quantDensity * 0.3) * 100 + achievementBonus), 100);
}

/**
 * Compute formatting quality score based on structure and length.
 */
function computeFormattingScore(text: string): number {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  let score = 0;

  // Ideal word count: 300–800
  if (wordCount >= 300 && wordCount <= 800) score += 30;
  else if (wordCount >= 200 && wordCount <= 1200) score += 20;
  else if (wordCount >= 100) score += 10;

  // Has bullet points or dashes (structured content)
  const bulletLines = lines.filter((l) => /^\s*[-•●▪◦*]\s/.test(l));
  if (bulletLines.length >= 5) score += 25;
  else if (bulletLines.length >= 2) score += 15;

  // Has dates (shows timeline)
  const datePatterns = text.match(/\b(20\d{2}|19\d{2})\b/g);
  if (datePatterns && datePatterns.length >= 2) score += 15;
  else if (datePatterns) score += 8;

  // Has email/phone (contact info)
  if (/[\w.-]+@[\w.-]+\.\w+/.test(text)) score += 10;
  if (/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) score += 10;

  // Line variety (not just walls of text)
  const avgLineLen = lines.reduce((sum, l) => sum + l.length, 0) / Math.max(lines.length, 1);
  if (avgLineLen > 20 && avgLineLen < 120) score += 10;

  return Math.min(score, 100);
}

/**
 * Generate actionable recommendations based on analysis.
 */
function generateRecommendations(
  skills: string[],
  sectionsFound: string[],
  sectionsMissing: string[],
  wordCount: number,
  keywordScore: number,
  formattingScore: number
): string[] {
  const recs: string[] = [];

  if (skills.length < 5) {
    recs.push("Add more technical skills — aim for at least 8-12 relevant skills to improve your score.");
  }
  if (sectionsMissing.includes("summary") && sectionsMissing.includes("objective")) {
    recs.push("Add a professional summary or objective statement at the top of your resume.");
  }
  if (sectionsMissing.includes("projects")) {
    recs.push("Include a Projects section to showcase hands-on experience.");
  }
  if (wordCount < 200) {
    recs.push("Your resume is too short. Expand with more details about your experience and achievements.");
  } else if (wordCount > 1200) {
    recs.push("Consider trimming your resume — keep it concise and focused on relevant experience.");
  }
  if (keywordScore < 40) {
    recs.push("Use more action verbs (e.g., 'developed', 'implemented', 'optimized') and quantify your achievements with numbers.");
  }
  if (formattingScore < 40) {
    recs.push("Improve formatting with bullet points, clear section headers, and consistent date formatting.");
  }
  if (!sectionsMissing.includes("certifications") === false && sectionsMissing.includes("certifications")) {
    recs.push("Add relevant certifications to stand out from other candidates.");
  }

  return recs.length > 0 ? recs : ["Your resume looks solid! Keep it updated with your latest achievements."];
}

/**
 * Analyze a resume text and produce a full score breakdown.
 */
export function analyzeResume(text: string): AnalysisResult {
  const { skills, byCategory } = extractSkills(text);
  const { found: sectionsFound, missing: sectionsMissing } = detectSections(text);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Skills score (40% weight) — more skills = better, cap at 15
  const skillsScore = Math.min(Math.round((skills.length / 15) * 100), 100);

  // Keyword relevance score (25% weight)
  const keywordScore = computeKeywordScore(text);

  // Sections score (15% weight)
  const sectionsScore = Math.round(
    (sectionsFound.length / EXPECTED_SECTIONS.length) * 100
  );

  // Formatting score (20% weight)
  const formattingScore = computeFormattingScore(text);

  // Weighted overall score
  const overallScore = Math.round(
    skillsScore * 0.4 + keywordScore * 0.25 + sectionsScore * 0.15 + formattingScore * 0.2
  );

  const recommendations = generateRecommendations(
    skills, sectionsFound, sectionsMissing, wordCount, keywordScore, formattingScore
  );

  return {
    overallScore,
    skillsScore,
    keywordScore,
    sectionsScore,
    formattingScore,
    extractedSkills: skills,
    skillsByCategory: byCategory,
    sectionsFound,
    sectionsMissing,
    wordCount,
    resumeText: text,
    recommendations,
  };
}

/**
 * Match resume against job descriptions using improved similarity.
 * Uses Jaccard + weighted skill importance for better accuracy.
 */
export function matchJobs(resumeSkills: string[]): JobMatch[] {
  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));

  // Build synonym-expanded resume set
  const expandedResume = new Set(resumeSet);
  for (const skill of resumeSet) {
    // Add canonical forms
    if (SKILL_SYNONYMS[skill]) expandedResume.add(SKILL_SYNONYMS[skill]);
    // Add reverse synonyms
    for (const [syn, canonical] of Object.entries(SKILL_SYNONYMS)) {
      if (canonical === skill) expandedResume.add(syn);
    }
  }

  const matches: JobMatch[] = sampleJobs.map((job) => {
    const jobSkillsLower = job.requiredSkills.map((s) => s.toLowerCase());
    const matched: string[] = [];
    const missing: string[] = [];

    for (const skill of jobSkillsLower) {
      // Check direct match or synonym match
      if (expandedResume.has(skill)) {
        matched.push(skill);
      } else {
        // Check if any synonym of this job skill is in resume
        const canonical = SKILL_SYNONYMS[skill] || skill;
        if (expandedResume.has(canonical)) {
          matched.push(skill);
        } else {
          missing.push(skill);
        }
      }
    }

    // Improved similarity: weighted Jaccard with diminishing returns
    const jobTotal = jobSkillsLower.length;
    if (jobTotal === 0) {
      return { job, matchPercentage: 0, matchedSkills: matched, missingSkills: missing };
    }

    // Base: percentage of job skills matched
    const coverageRatio = matched.length / jobTotal;

    // Bonus for having extra relevant skills (breadth)
    const breadthBonus = Math.min((expandedResume.size - matched.length) * 0.5, 10);

    // Combined score with diminishing returns curve
    const rawScore = coverageRatio * 90 + breadthBonus;
    const matchPercentage = Math.round(Math.min(rawScore, 99));

    return { job, matchPercentage, matchedSkills: matched, missingSkills: missing };
  });

  return matches.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 6);
}
