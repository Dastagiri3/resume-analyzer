/**
 * Sample job descriptions dataset for matching.
 * Each job has a title, company, description, and required skills.
 */
export interface JobDescription {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requiredSkills: string[];
  salary: string;
}

export const sampleJobs: JobDescription[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechVault Inc.",
    location: "San Francisco, CA",
    description:
      "Build modern web applications using React, TypeScript, and Next.js. Collaborate with design and backend teams to deliver pixel-perfect, performant user interfaces. Experience with state management, testing frameworks, and CI/CD pipelines required.",
    requiredSkills: [
      "react", "typescript", "javascript", "nextjs", "tailwind", "css",
      "html", "git", "testing", "ci/cd", "redux", "graphql",
    ],
    salary: "$140k – $180k",
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "CloudNine Solutions",
    location: "Remote",
    description:
      "Design and develop scalable full-stack applications. Work with Node.js, Python, PostgreSQL, and React. Deploy and manage cloud infrastructure on AWS. Write clean, maintainable, well-tested code.",
    requiredSkills: [
      "react", "nodejs", "python", "postgresql", "aws", "docker",
      "typescript", "javascript", "sql", "git", "rest api", "mongodb",
    ],
    salary: "$130k – $170k",
  },
  {
    id: "3",
    title: "Machine Learning Engineer",
    company: "DataMind AI",
    location: "New York, NY",
    description:
      "Develop and deploy machine learning models for production systems. Experience with deep learning frameworks, NLP, computer vision, and MLOps. Strong Python and mathematics background required.",
    requiredSkills: [
      "python", "tensorflow", "pytorch", "machine learning", "deep learning",
      "nlp", "computer vision", "sql", "docker", "aws", "scikit-learn", "pandas",
    ],
    salary: "$160k – $210k",
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "InfraScale Corp",
    location: "Austin, TX",
    description:
      "Manage CI/CD pipelines, cloud infrastructure, and container orchestration. Automate deployments using Terraform, Kubernetes, and Docker. Monitor system health and improve reliability.",
    requiredSkills: [
      "docker", "kubernetes", "terraform", "aws", "ci/cd", "linux",
      "python", "bash", "monitoring", "git", "ansible", "jenkins",
    ],
    salary: "$135k – $175k",
  },
  {
    id: "5",
    title: "Backend Developer",
    company: "APIFirst Labs",
    location: "Seattle, WA",
    description:
      "Build robust APIs and microservices using Python/FastAPI and Go. Design database schemas, implement caching strategies, and ensure high availability. Experience with message queues and event-driven architecture.",
    requiredSkills: [
      "python", "fastapi", "go", "postgresql", "redis", "docker",
      "rest api", "sql", "git", "microservices", "rabbitmq", "aws",
    ],
    salary: "$140k – $185k",
  },
  {
    id: "6",
    title: "Data Analyst",
    company: "InsightFlow Analytics",
    location: "Chicago, IL",
    description:
      "Analyze large datasets to drive business decisions. Create dashboards and reports using SQL, Python, and BI tools. Communicate findings to stakeholders through clear visualizations.",
    requiredSkills: [
      "sql", "python", "tableau", "excel", "pandas", "statistics",
      "data visualization", "power bi", "r", "git",
    ],
    salary: "$90k – $120k",
  },
  {
    id: "7",
    title: "Mobile Developer",
    company: "AppForge Studio",
    location: "Los Angeles, CA",
    description:
      "Develop cross-platform mobile applications using React Native and Flutter. Integrate with RESTful APIs, implement offline-first architectures, and publish to app stores.",
    requiredSkills: [
      "react native", "flutter", "javascript", "typescript", "dart",
      "rest api", "git", "ios", "android", "firebase",
    ],
    salary: "$125k – $165k",
  },
  {
    id: "8",
    title: "Cybersecurity Analyst",
    company: "SecureNet Defense",
    location: "Washington, DC",
    description:
      "Monitor and respond to security incidents. Perform vulnerability assessments, penetration testing, and security audits. Implement security best practices across the organization.",
    requiredSkills: [
      "cybersecurity", "penetration testing", "linux", "networking",
      "python", "siem", "firewalls", "incident response", "compliance", "bash",
    ],
    salary: "$110k – $155k",
  },
  {
    id: "9",
    title: "UI/UX Designer",
    company: "PixelCraft Design",
    location: "Remote",
    description:
      "Design intuitive user interfaces and experiences. Create wireframes, prototypes, and design systems. Conduct user research and usability testing to validate design decisions.",
    requiredSkills: [
      "figma", "sketch", "adobe xd", "user research", "prototyping",
      "wireframing", "design systems", "css", "html", "accessibility",
    ],
    salary: "$100k – $140k",
  },
  {
    id: "10",
    title: "Cloud Architect",
    company: "SkyBridge Systems",
    location: "Denver, CO",
    description:
      "Design and implement enterprise cloud architectures. Lead cloud migration initiatives, optimize costs, and ensure security compliance. Multi-cloud experience with AWS, Azure, and GCP preferred.",
    requiredSkills: [
      "aws", "azure", "gcp", "terraform", "kubernetes", "docker",
      "networking", "security", "python", "architecture", "microservices", "linux",
    ],
    salary: "$170k – $220k",
  },
];
