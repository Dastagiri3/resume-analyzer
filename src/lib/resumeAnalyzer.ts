/**
 * Resume analysis engine.
 * Handles text extraction, skill detection, scoring, and job matching.
 */

import { sampleJobs, type JobDescription } from "./sampleJobs";

// ── Skill dictionary organized by category ──
const SKILL_DATABASE: Record<string, string[]> = {
  "Programming Languages": [
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust",
    "ruby", "php", "swift", "kotlin", "dart", "r", "scala", "perl", "bash",
  ],
  "Frontend": [
    "react", "vue", "angular", "svelte", "nextjs", "next.js", "nuxt",
    "html", "css", "sass", "tailwind", "bootstrap", "material ui",
    "redux", "zustand", "mobx", "webpack", "vite",
  ],
  "Backend": [
    "nodejs", "node.js", "express", "fastapi", "django", "flask", "spring",
    "rest api", "graphql", "microservices", "rabbitmq", "kafka",
  ],
  "Database": [
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "dynamodb", "cassandra", "firebase", "supabase",
  ],
  "Cloud & DevOps": [
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "ci/cd", "jenkins", "github actions", "linux", "monitoring",
  ],
  "Data & ML": [
    "machine learning", "deep learning", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "nlp", "computer vision",
    "data visualization", "statistics", "tableau", "power bi", "excel",
  ],
  "Design": [
    "figma", "sketch", "adobe xd", "user research", "prototyping",
    "wireframing", "design systems", "accessibility",
  ],
  "Other": [
    "git", "agile", "scrum", "jira", "testing", "siem", "firewalls",
    "penetration testing", "cybersecurity", "incident response",
    "compliance", "networking", "architecture", "ios", "android",
    "react native", "flutter",
  ],
};

// Flatten all skills for matching
const ALL_SKILLS = Object.values(SKILL_DATABASE).flat();

// Key resume sections to look for
const EXPECTED_SECTIONS = [
  "experience", "education", "skills", "projects", "summary",
  "objective", "certifications", "awards", "publications", "volunteer",
];

// ── Types ──
export interface AnalysisResult {
  overallScore: number;
  skillsScore: number;
  keywordScore: number;
  sectionsScore: number;
  extractedSkills: string[];
  skillsByCategory: Record<string, string[]>;
  sectionsFound: string[];
  sectionsMissing: string[];
  wordCount: number;
  resumeText: string;
}

export interface JobMatch {
  job: JobDescription;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
}

/**
 * Extract skills from resume text using keyword matching.
 */
export function extractSkills(text: string): {
  skills: string[];
  byCategory: Record<string, string[]>;
} {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  const byCategory: Record<string, string[]> = {};

  for (const [category, skills] of Object.entries(SKILL_DATABASE)) {
    const categoryMatches: string[] = [];
    for (const skill of skills) {
      // Use word boundary matching for short skills
      const regex = skill.length <= 3
        ? new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
        : new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      if (regex.test(lowerText)) {
        if (!found.includes(skill)) {
          found.push(skill);
          categoryMatches.push(skill);
        }
      }
    }
    if (categoryMatches.length > 0) {
      byCategory[category] = categoryMatches;
    }
  }

  return { skills: found, byCategory };
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
    const regex = new RegExp(`\\b${section}\\b`, "i");
    if (regex.test(lowerText)) {
      found.push(section);
    } else {
      missing.push(section);
    }
  }

  return { found, missing };
}

/**
 * Compute keyword relevance score using TF approach.
 */
function computeKeywordScore(text: string): number {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).filter((w) => w.length > 2);
  const totalWords = words.length;

  if (totalWords === 0) return 0;

  // Action verbs that indicate strong resume content
  const actionVerbs = [
    "led", "developed", "designed", "implemented", "managed", "created",
    "built", "optimized", "improved", "delivered", "achieved", "increased",
    "reduced", "launched", "collaborated", "mentored", "architected",
    "automated", "deployed", "analyzed", "resolved", "integrated",
  ];

  // Quantifiable achievements indicators
  const quantifiers = ["%", "million", "billion", "increased", "decreased", "reduced", "improved"];

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

  // Score based on density of action verbs and quantifiers
  const verbDensity = Math.min(verbCount / Math.max(totalWords / 50, 1), 1);
  const quantDensity = Math.min(quantifierCount / Math.max(totalWords / 100, 1), 1);

  return Math.round((verbDensity * 0.6 + quantDensity * 0.4) * 100);
}

/**
 * Analyze a resume text and produce a full score breakdown.
 */
export function analyzeResume(text: string): AnalysisResult {
  const { skills, byCategory } = extractSkills(text);
  const { found: sectionsFound, missing: sectionsMissing } = detectSections(text);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Skills score (50% weight) — more skills = better, cap at 12
  const skillsScore = Math.min(Math.round((skills.length / 12) * 100), 100);

  // Keyword relevance score (30% weight)
  const keywordScore = computeKeywordScore(text);

  // Sections score (20% weight) — out of the expected sections
  const sectionsScore = Math.round(
    (sectionsFound.length / EXPECTED_SECTIONS.length) * 100
  );

  // Weighted overall score
  const overallScore = Math.round(
    skillsScore * 0.5 + keywordScore * 0.3 + sectionsScore * 0.2
  );

  return {
    overallScore,
    skillsScore,
    keywordScore,
    sectionsScore,
    extractedSkills: skills,
    skillsByCategory: byCategory,
    sectionsFound,
    sectionsMissing,
    wordCount,
    resumeText: text,
  };
}

/**
 * Match resume against job descriptions using TF-IDF-like cosine similarity.
 * Returns top 5 matches sorted by match percentage.
 */
export function matchJobs(resumeSkills: string[]): JobMatch[] {
  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));

  const matches: JobMatch[] = sampleJobs.map((job) => {
    const jobSkillsLower = job.requiredSkills.map((s) => s.toLowerCase());
    const matched: string[] = [];
    const missing: string[] = [];

    for (const skill of jobSkillsLower) {
      if (resumeSet.has(skill)) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    }

    // Cosine-like similarity: intersection / sqrt(|A| * |B|)
    const similarity =
      jobSkillsLower.length > 0
        ? matched.length / Math.sqrt(resumeSet.size * jobSkillsLower.length)
        : 0;

    const matchPercentage = Math.round(Math.min(similarity * 100 * 1.5, 99));

    return {
      job,
      matchPercentage,
      matchedSkills: matched,
      missingSkills: missing,
    };
  });

  // Sort by match % descending, return top 5
  return matches.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 5);
}
