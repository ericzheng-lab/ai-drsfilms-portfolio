export type ProjectType = "film" | "tool" | "website" | "system" | "code";

export type Project = {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  type: ProjectType;
  year: string;
  status: "Live" | "In Progress" | "Prototype" | "Archive";
  description: string;
  proof: string;
  tags: string[];
  image: string;
  link?: string;
  repo?: string;
  videoEmbed?: string;
  featured?: boolean;
};

export const navItems = [
  { id: "work", label: "Work", number: "01" },
  { id: "studio", label: "AI Studio", number: "02" },
  { id: "stack", label: "AI Stack", number: "03" },
  { id: "openclaw", label: "OpenClaw", number: "04" },
  { id: "github", label: "GitHub", number: "05" },
  { id: "contact", label: "Contact", number: "06" },
];

export const projects: Project[] = [
  {
    id: "openclaw-creative-os",
    number: "001",
    title: "OpenClaw Creative OS",
    eyebrow: "Multi-agent creative operating system",
    type: "system",
    year: "2026",
    status: "In Progress",
    description:
      "A personal creative operations system that uses Discord as the control layer, OpenClaw agents as the execution team, Obsidian as memory, and Codex as governance.",
    proof: "Proves agentic AI ability through role-based delegation, project memory, structured Markdown writeback, and rule-bound handoff between agents.",
    tags: ["OpenClaw", "Agents", "Discord", "Obsidian", "Codex"],
    image: "/uploads/pasted-1776995439612-0.png",
    repo: "https://github.com/ericzheng-lab",
    featured: true,
  },
  {
    id: "ai-video-studio",
    number: "002",
    title: "AI Video Generation Studio",
    eyebrow: "Web UI + Discord + API workflow",
    type: "tool",
    year: "2026",
    status: "Prototype",
    description:
      "A documented AI video creation setup with a web interface, Discord command path, API route, prompt templates, model choices, and Obsidian archival.",
    proof: "Shows AI tool-building beyond one-off prompting: multiple input paths, model routing, repeatable prompts, and project documentation.",
    tags: ["AI Video", "Kling", "Flux", "Midjourney", "API"],
    image: "/uploads/pasted-1776995396578-0.png",
    link: "https://videoagent-studio.vercel.app",
    featured: true,
  },
  {
    id: "ai-publishing-matrix",
    number: "003",
    title: "AI Video Publishing Matrix",
    eyebrow: "Content distribution workflow",
    type: "system",
    year: "2026",
    status: "In Progress",
    description:
      "A structured workflow for turning finished or in-progress AI videos into platform-specific release packages, behind-the-scenes posts, technical breakdowns, and retrospectives.",
    proof: "Demonstrates operational AI thinking: platform selection, phase-based review, content reuse, publishing calendars, and feedback loops.",
    tags: ["Content Ops", "YouTube", "Bilibili", "RedNote", "LinkedIn"],
    image: "/uploads/pasted-1776995386413-0.png",
  },
  {
    id: "ai-canvas",
    number: "004",
    title: "AI Canvas Studio",
    eyebrow: "Creative tool prototype",
    type: "tool",
    year: "2026",
    status: "Prototype",
    description:
      "A browser-native generative canvas concept for directors and artists: prompt, choose a model, generate, save, remix, and document creative decisions.",
    proof: "Proves tool-building ability: interface logic, model routing concept, prompt input, and output state design.",
    tags: ["React", "Generative Tool", "Image AI", "Web App"],
    image: "/uploads/draw-c8eb2afc-4d4d-4170-a24f-b285c78691c6.png",
  },
  {
    id: "career-ops",
    number: "005",
    title: "Career-Ops Automation",
    eyebrow: "Resume/JD intelligence system",
    type: "code",
    year: "2026",
    status: "In Progress",
    description:
      "A local workflow for job-description analysis, resume targeting, score reports, cover letters, interview prep, and application tracking.",
    proof: "Shows practical automation: structured source data, scripts, generated outputs, scoring reports, and repeatable career operations.",
    tags: ["Automation", "LLM Workflow", "Resume", "Scoring", "Python"],
    image: "/uploads/pasted-1776995408528-0.png",
  },
  {
    id: "production-bridge",
    number: "006",
    title: "Film Production Bridge",
    eyebrow: "Traditional production foundation",
    type: "film",
    year: "2026",
    status: "Archive",
    description:
      "The production base behind the AI work: feature film financing and delivery, S-tier commercial and CG animation pipelines, global vendors, and post-production judgment.",
    proof: "Grounds the AI portfolio in real production work: Sundance/Berlinale feature experience, Tencent/Riot/miHoYo/Nike campaigns, and international delivery.",
    tags: ["Film", "Executive Producer", "CG", "Post", "Global Production"],
    image: "/uploads/pasted-1776995420940-0.png",
    link: "https://www.drsfilms.com",
  },
  {
    id: "ai-portfolio",
    number: "007",
    title: "AI Portfolio Website",
    eyebrow: "This site",
    type: "website",
    year: "2026",
    status: "Live",
    description:
      "A maintainable AI-native personal site for ai.drsfilms.com, rebuilt from a Claude design export into a structured React/Vite project.",
    proof: "Shows AI-assisted design translated into maintainable code, structured content, local preview, and Cloudflare Pages deployment readiness.",
    tags: ["React", "Vite", "Cloudflare Pages", "AI Design"],
    image: "/uploads/pasted-1776995493459-0.png",
    repo: "https://github.com/ericzheng-lab",
  },
];

export const stackGroups = [
  {
    title: "AI Image & Look Development",
    summary:
      "Visual research, character/style exploration, concept frames, and prompt systems for production-ready looks.",
    tools: ["Midjourney", "Flux", "GPT Image", "Gemini", "Nano Banana", "Figma"],
  },
  {
    title: "AI Video & Motion",
    summary:
      "Shot generation, motion tests, model comparison, visual continuity, and editorial experiments.",
    tools: ["Runway", "Kling", "Veo", "Higgsfield", "Luma", "Pika"],
  },
  {
    title: "Agentic Systems",
    summary:
      "Multi-agent coordination, role boundaries, project memory, browser/API workflows, and human review gates.",
    tools: ["OpenClaw", "Claude", "Codex", "Discord", "Obsidian", "MCP"],
  },
  {
    title: "Production Automation",
    summary:
      "Operational workflows for research, CV/JD matching, content calendars, structured notes, and repeatable reporting.",
    tools: ["Node.js", "Python", "Markdown", "Google Workspace", "Sheets", "Local Scripts"],
  },
  {
    title: "Film & Post Bridge",
    summary:
      "The traditional production base that makes the AI work practical: directing language, edit logic, VFX judgment, and delivery.",
    tools: ["DaVinci Resolve", "After Effects", "Nuke-style Workflow", "Vimeo", "Production Briefs", "DRS Films"],
  },
];

export const repositories = [
  {
    name: "videoagent-studio",
    description:
      "AI video generation workspace with web UI, Discord path, API workflow, and Obsidian documentation.",
    tags: ["AI Video", "API", "Workflow"],
    language: "TypeScript",
    url: "https://github.com/ericzheng-lab",
  },
  {
    name: "cv-jd-generator",
    description:
      "AI resume and job-description matching system for targeted applications.",
    tags: ["Automation", "LLM", "Workflow"],
    language: "Node.js",
    url: "https://github.com/ericzheng-lab",
  },
  {
    name: "OpenClaw Creative OS",
    description:
      "Private multi-agent creative operations workspace connecting Discord, Obsidian, Codex, and role-based AI agents.",
    tags: ["OpenClaw", "Agents", "Obsidian"],
    language: "Markdown / Node.js",
    url: "https://github.com/ericzheng-lab",
  },
  {
    name: "Ericportfoliostructuredesign",
    description:
      "The earlier Figma-to-code structure for the traditional Eric portfolio site.",
    tags: ["Portfolio", "Figma", "React"],
    language: "TypeScript",
    url: "https://github.com/ericzheng-lab/Ericportfoliostructuredesign",
  },
];

export const agents = [
  {
    id: "general",
    label: "General",
    role: "Commander",
    color: "var(--accent)",
    x: 50,
    y: 50,
    description:
      "Central orchestration - receives top-level goals, delegates to specialized agents, and coordinates the full pipeline via Discord.",
  },
  {
    id: "advisor",
    label: "Advisor",
    role: "Strategy",
    color: "#a8c8f0",
    x: 18,
    y: 22,
    description:
      "Strategic analysis, opportunity scoring, and risk assessment. Advises the General before major decisions.",
  },
  {
    id: "engineer",
    label: "Engineer",
    role: "Technical",
    color: "#f0d080",
    x: 82,
    y: 22,
    description:
      "Technical execution - writes and runs code, maintains system infrastructure, handles API integrations.",
  },
  {
    id: "creator",
    label: "Creator",
    role: "Content",
    color: "#c8a0f0",
    x: 18,
    y: 78,
    description:
      "Content creation - Xiaohongshu posts, email copy, production briefs. End-to-end: research, writing, review, publish.",
  },
  {
    id: "wiseman",
    label: "Wiseman",
    role: "Knowledge",
    color: "#90d0a8",
    x: 82,
    y: 78,
    description:
      "Knowledge review, fact-checking, and quality control. Final gate before any output is delivered.",
  },
  {
    id: "debugger",
    label: "Debugger",
    role: "Debug",
    color: "#f09090",
    x: 50,
    y: 15,
    description:
      "Troubleshooting and system diagnostics - identifies failures, isolates bugs, and restores agent operations.",
  },
  {
    id: "marketer",
    label: "Marketer",
    role: "Marketing",
    color: "#f0a870",
    x: 15,
    y: 50,
    description:
      "Marketing strategy and social media operations - manages positioning, platform growth, and campaign execution.",
  },
  {
    id: "video",
    label: "Video",
    role: "Video",
    color: "#80b8f0",
    x: 85,
    y: 50,
    description:
      "Video production specialist - briefing, editing direction, and delivery pipeline for film and short-form content.",
  },
];
