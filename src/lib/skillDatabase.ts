/**
 * Skill database with categories and synonym mappings for improved matching.
 */

export const SKILL_DATABASE: Record<string, string[]> = {
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

/** Synonym map: alternative terms → canonical skill name */
export const SKILL_SYNONYMS: Record<string, string> = {
  "js": "javascript",
  "ts": "typescript",
  "py": "python",
  "node": "nodejs",
  "node.js": "nodejs",
  "react.js": "react",
  "reactjs": "react",
  "vue.js": "vue",
  "vuejs": "vue",
  "angular.js": "angular",
  "angularjs": "angular",
  "next.js": "nextjs",
  "nuxt.js": "nuxt",
  "postgres": "postgresql",
  "mongo": "mongodb",
  "k8s": "kubernetes",
  "tf": "terraform",
  "gha": "github actions",
  "ci": "ci/cd",
  "cd": "ci/cd",
  "ml": "machine learning",
  "dl": "deep learning",
  "natural language processing": "nlp",
  "cv": "computer vision",
  "rest": "rest api",
  "restful": "rest api",
  "restful api": "rest api",
  "amazon web services": "aws",
  "google cloud": "gcp",
  "google cloud platform": "gcp",
  "microsoft azure": "azure",
  "tailwindcss": "tailwind",
  "tailwind css": "tailwind",
  "scikit learn": "scikit-learn",
  "sklearn": "scikit-learn",
  "rn": "react native",
  "ux": "user research",
  "ui/ux": "user research",
};

export const ALL_SKILLS = Object.values(SKILL_DATABASE).flat();

export const EXPECTED_SECTIONS = [
  "experience", "education", "skills", "projects", "summary",
  "objective", "certifications", "awards", "publications", "volunteer",
];
