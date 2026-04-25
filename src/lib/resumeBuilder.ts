/**
 * Resume Builder — generates a tailored resume draft from a job description
 * and the user's profile inputs. Uses skill extraction to align keywords.
 */

import { extractSkills } from "./resumeAnalyzer";

export interface BuilderProfile {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: string; // freeform; one role per blank-line block
  education: string;
  skills: string; // comma-separated user-provided skills
}

export interface BuilderResult {
  markdown: string;
  matchedKeywords: string[]; // skills present in JD AND user
  suggestedKeywords: string[]; // skills in JD but missing from user
  jdSkills: string[];
  userSkills: string[];
  alignmentScore: number; // 0-100
  // Structured fields needed by PDF templates
  targetTitle: string;
  tailoredSummary: string;
  resumeSkills: string[];
}

/**
 * Build a tailored resume by aligning the user's profile with the JD.
 */
export function buildResume(
  jobDescription: string,
  profile: BuilderProfile
): BuilderResult {
  const jd = extractSkills(jobDescription);
  const user = extractSkills(
    `${profile.summary}\n${profile.experience}\n${profile.skills}\n${profile.education}`
  );

  const jdSkillSet = new Set(jd.skills);
  const userSkillSet = new Set(user.skills);

  // Add explicitly typed skills (comma list) into user set
  profile.skills
    .split(/[,\n]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .forEach((s) => userSkillSet.add(s));

  const matchedKeywords = Array.from(jdSkillSet).filter((s) =>
    userSkillSet.has(s)
  );
  const suggestedKeywords = Array.from(jdSkillSet).filter(
    (s) => !userSkillSet.has(s)
  );

  const alignmentScore =
    jdSkillSet.size === 0
      ? 0
      : Math.round((matchedKeywords.length / jdSkillSet.size) * 100);

  // Build a tailored summary that injects matched keywords for ATS friendliness
  const targetTitle =
    profile.title?.trim() ||
    inferRoleFromJD(jobDescription) ||
    "Professional";

  const tailoredSummary =
    profile.summary?.trim() ||
    `Results-driven ${targetTitle} with hands-on experience in ${
      matchedKeywords.slice(0, 6).join(", ") || "modern technologies"
    }. Proven ability to deliver measurable impact through ${
      matchedKeywords.slice(6, 10).join(", ") || "cross-functional collaboration"
    }.`;

  // Combine matched + user-provided skills, prioritizing JD matches first
  const skillsForResume = [
    ...matchedKeywords,
    ...Array.from(userSkillSet).filter((s) => !matchedKeywords.includes(s)),
  ].slice(0, 24);

  const md = renderMarkdown({
    profile,
    targetTitle,
    summary: tailoredSummary,
    skills: skillsForResume,
  });

  return {
    markdown: md,
    matchedKeywords,
    suggestedKeywords,
    jdSkills: Array.from(jdSkillSet),
    userSkills: Array.from(userSkillSet),
    alignmentScore,
  };
}

function inferRoleFromJD(jd: string): string | null {
  const m = jd.match(
    /\b(software engineer|frontend developer|backend developer|full[- ]stack developer|data scientist|data analyst|product manager|devops engineer|machine learning engineer|ui\/ux designer)\b/i
  );
  return m ? capitalize(m[1]) : null;
}

function capitalize(s: string) {
  return s
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function renderMarkdown(args: {
  profile: BuilderProfile;
  targetTitle: string;
  summary: string;
  skills: string[];
}): string {
  const { profile, targetTitle, summary, skills } = args;
  const contactLine = [profile.email, profile.phone, profile.location, profile.linkedin]
    .filter(Boolean)
    .join("  •  ");

  const expBlocks = (profile.experience || "")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const expSection = expBlocks.length
    ? expBlocks
        .map((b) => {
          const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
          const header = lines[0] || "";
          const bullets = lines.slice(1);
          return `### ${header}\n${bullets.map((l) => `- ${l.replace(/^[-•]\s*/, "")}`).join("\n")}`;
        })
        .join("\n\n")
    : "_Add your work experience — one role per paragraph, first line as the header, following lines as bullets._";

  const eduSection =
    profile.education?.trim() ||
    "_Add your education — degree, institution, year._";

  return `# ${profile.fullName || "Your Name"}
**${targetTitle}**
${contactLine ? `\n${contactLine}\n` : ""}
---

## Professional Summary
${summary}

## Core Skills
${skills.map((s) => `\`${s}\``).join("  ")}

## Experience
${expSection}

## Education
${eduSection}
`;
}
