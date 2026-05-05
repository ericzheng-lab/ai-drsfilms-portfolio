import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Braces,
  ExternalLink,
  Film,
  Github,
  Layers3,
  Sparkles,
} from "lucide-react";
import { agents, navItems, projects, repositories, stackGroups } from "./data/site";

const sectionIds = navItems.map((item) => item.id);

export function App() {
  const [active, setActive] = useState("work");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 },
    );

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const featured = useMemo(() => projects.filter((project) => project.featured), []);

  return (
    <div className="site-shell">
      <Sidebar active={active} />
      <main>
        <Hero featuredCount={featured.length} />
        <WorkGrid />
        <StudioSection />
        <StackSection />
        <OpenClawSection />
        <GithubSection />
        <ContactSection />
      </main>
    </div>
  );
}

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="sidebar">
      <a className="identity" href="#top" aria-label="Eric Zheng AI Portfolio home">
        <span>Eric Zheng</span>
        <small>AI-Native Filmmaker & Builder</small>
      </a>

      <nav aria-label="Primary navigation">
        {navItems.map((item) => (
          <a className={active === item.id ? "is-active" : ""} href={`#${item.id}`} key={item.id}>
            <span>{item.number}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="availability">
          <span />
          Open to AI film, product, and creative technology roles
        </div>
        <a href="https://www.drsfilms.com" rel="noreferrer" target="_blank">
          DRS Films <ArrowUpRight size={14} />
        </a>
        <a href="https://github.com/ericzheng-lab" rel="noreferrer" target="_blank">
          GitHub <ArrowUpRight size={14} />
        </a>
      </div>
    </aside>
  );
}

function Hero({ featuredCount }: { featuredCount: number }) {
  return (
    <section className="hero" id="top">
      <NeuralCanvas />
      <HeroTicker />
      <div className="corner corner--top" />
      <div className="corner corner--bottom" />
      <div className="hero__visual" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/generated/hero-command-center.png"
          src="/media/hero-loop.mp4"
        />
      </div>
      <div className="hero__content">
        <div className="eyebrow">
          <span className="live-dot" />
          ai.drsfilms.com / 2026 / AI portfolio
        </div>
        <h1>
          I produce films.
          <br />
          I build AI systems.
          <br />
          <span>I connect both.</span>
        </h1>
        <p>
          A proof-of-work portfolio for AI filmmaking, creative tools, multi-agent workflows,
          and production automation grounded in real film and commercial production.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href="#work">
            <Sparkles size={16} /> View Work
          </a>
          <a className="button" href="https://www.drsfilms.com" rel="noreferrer" target="_blank">
            DRS Films <ExternalLink size={15} />
          </a>
        </div>
      </div>

      <div className="hero__dashboard">
        <Metric value="Film" label="Production foundation" />
        <Metric value="Tools" label="Creative systems" />
        <Metric value="Agents" label="Automation layer" />
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function HeroTicker() {
  const items = [
    "AI-Native Filmmaker",
    "Builder",
    "Executive Producer",
    "AI Architect",
    "OpenClaw",
  ];

  return (
    <div className="hero-ticker" aria-hidden="true">
      <div>
        {Array.from({ length: 8 }).flatMap((_, repeat) =>
          items.map((item) => (
            <span key={`${repeat}-${item}`}>
              {item}
              <b>◆</b>
            </span>
          )),
        )}
      </div>
    </div>
  );
}

type NodePoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  pulse: number;
};

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#16d9ff", "#ffc65a", "#a75bff"];
    let width = 0;
    let height = 0;
    let frame = 0;
    let animationFrame = 0;
    let nodes: NodePoint[] = [];
    let pointer = { x: 0, y: 0, active: false };
    const connectDistance = 160;
    const mouseAttract = 150;
    const mouseForce = 0.0105;

    const makeNodes = () => {
      nodes = Array.from({ length: 55 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.15 + 0.65,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      makeNodes();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer = {
        x,
        y,
        active: x >= 0 && x <= rect.width && y >= 0 && y <= rect.height,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      nodes.forEach((node, index) => {
        node.pulse += 0.009;
        const dx = pointer.x - node.x;
        const dy = pointer.y - node.y;
        const dist = Math.hypot(dx, dy);

        if (pointer.active && dist < mouseAttract && dist > 0) {
          node.vx += (dx / dist) * mouseForce;
          node.vy += (dy / dist) * mouseForce;
        }

        node.vx *= 0.985;
        node.vy *= 0.985;
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0) {
          node.x = 0;
          node.vx *= -1;
        }
        if (node.x > width) {
          node.x = width;
          node.vx *= -1;
        }
        if (node.y < 0) {
          node.y = 0;
          node.vy *= -1;
        }
        if (node.y > height) {
          node.y = height;
          node.vy *= -1;
        }
      });

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < connectDistance) {
            const alpha = (1 - dist / connectDistance) * 0.28;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(111, 135, 255, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        const dx = pointer.x - node.x;
        const dy = pointer.y - node.y;
        const dist = Math.hypot(dx, dy);
        if (pointer.active && dist < mouseAttract) {
          const alpha = (1 - dist / mouseAttract) * 0.45;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.strokeStyle = withAlpha(node.color, alpha);
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      });

      if (pointer.active) {
        const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 80);
        glow.addColorStop(0, "rgba(91, 212, 255, 0.08)");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 80, 0, Math.PI * 2);
        ctx.fill();
      }

      nodes.forEach((node) => {
        const pulsed = node.r + Math.sin(node.pulse) * 0.35;
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulsed * 5);
        glow.addColorStop(0, withAlpha(node.color, 0.18));
        glow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulsed * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, pulsed, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      frame += 1;
      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas className="neural-canvas" ref={canvasRef} aria-hidden="true" />;
}

function withAlpha(color: string, alpha: number) {
  const clamped = Math.max(0, Math.min(1, alpha));

  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${clamped})`;
  }

  return color;
}

function SectionHeader({
  id,
  number,
  title,
  summary,
}: {
  id: string;
  number: string;
  title: string;
  summary: string;
}) {
  return (
    <div className="section-header">
      <div>
        <span>{number}</span>
        <p>{id}</p>
      </div>
      <h2>{title}</h2>
      {summary && <p>{summary}</p>}
    </div>
  );
}

function WorkGrid() {
  return (
    <section className="section" id="work">
      <SectionHeader
        id="Selected Work"
        number="01"
        title="Proof, not decoration."
        summary="Each card should demonstrate a specific ability: AI film direction, tool design, system building, or production automation."
      />

      <div className="project-grid">
        {projects.map((project) => (
          <article className={`project-card project-card--${project.type}`} key={project.id}>
            <div className="project-card__media">
              <ProjectVisual project={project} />
              <div className="project-card__type">
                {project.type === "film" ? <Film size={14} /> : <Layers3 size={14} />}
                {project.type}
              </div>
            </div>
            <div className="project-card__body">
              <div className="project-card__meta">
                <span>{project.number}</span>
                <span>{project.year}</span>
                <span>{project.status}</span>
              </div>
              <h3>{project.title}</h3>
              <p className="project-card__eyebrow">{project.eyebrow}</p>
              <p>{project.description}</p>
              <div className="proof-note">
                <span>Proof</span>
                <p>{project.proof}</p>
              </div>
              <div className="tag-list">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="project-card__links">
                {project.link && (
                  <a href={project.link} rel="noreferrer" target="_blank">
                    Visit <ArrowUpRight size={14} />
                  </a>
                )}
                {project.repo && (
                  <a href={project.repo} rel="noreferrer" target="_blank">
                    Code <Github size={14} />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectVisual({ project }: { project: (typeof projects)[number] }) {
  if (project.id === "openclaw-creative-os") {
    return (
      <div className="project-visual project-visual--image">
        <img src="/generated/openclaw-creative-os.png" alt="" />
      </div>
    );
  }

  if (project.id === "ai-video-studio") {
    return (
      <div className="project-visual project-visual--image">
        <img src="/generated/ai-video-studio.png" alt="" />
      </div>
    );
  }

  if (project.id === "ai-publishing-matrix") {
    return (
      <div className="project-visual project-visual--image">
        <img src="/generated/publishing-matrix.png" alt="" />
      </div>
    );
  }

  if (project.id === "career-ops") {
    return (
      <div className="project-visual project-visual--code">
        {["JD ingest", "Score", "Resume", "Cover letter", "Track"].map((step) => (
          <div className="code-row" key={step}>
            <span>$</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (project.id === "production-bridge") {
    return (
      <div className="project-visual project-visual--film">
        <div className="film-strip">
          {["Sundance", "Berlinale", "Tencent", "Nike", "miHoYo"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="visual-caption">Film production foundation</div>
      </div>
    );
  }

  if (project.id === "ai-portfolio") {
    return (
      <div className="project-visual project-visual--website">
        <div className="site-map">
          {["React", "Vite", "Data", "Cloudflare"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="project-visual project-visual--canvas">
      <div className="canvas-orbit" />
      <div className="canvas-card">Prompt / Generate / Remix</div>
    </div>
  );
}

function StudioSection() {
  return (
    <section className="section section--split" id="studio">
      <SectionHeader
        id="AI Studio"
        number="02"
        title="Tools for directors, not just prompts."
        summary="This section frames AI as a production instrument: input, model choice, generation, review, remix, and documented output."
      />

      <div className="split-layout">
        <div className="studio-copy">
          <div className="micro-label">Tool Concept</div>
          <h3>AI Canvas Studio</h3>
          <p>
            A browser-native concept for AI image and video development. It demonstrates the
            interface pattern behind the broader workflow: prompt, reference, generate, revise,
            document, and ship.
          </p>
          <div className="studio-points">
            {[
              ["Prompt to frame", "Turn visual intent into a repeatable shot-development process."],
              ["API stack", "Custom-curated and self-built API stack for model selection, routing, and output handling."],
              ["Production memory", "Preserve decisions so experiments become reusable pipeline knowledge."],
            ].map(([title, text]) => (
              <div key={title}>
                <span>{title}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
        <StudioVideo />
      </div>
    </section>
  );
}

function StudioVideo() {
  return (
    <div className="studio-video" aria-label="AI Canvas Studio demo video">
      <div className="canvas-demo__topline studio-video__topline">
        <span>Live Prototype</span>
        <small>AI Canvas Demo</small>
      </div>
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        src="/media/ai-canvas-web.mp4"
      />
      <div className="studio-video__caption">Browser-native interface study / prompt to generated frame</div>
    </div>
  );
}

function StackSection() {
  return (
    <section className="section" id="stack">
      <SectionHeader
        id="AI Production Stack"
        number="03"
        title="Make the knowledge visible."
        summary="A clearer map of the tools, models, APIs, and production workflows behind the work."
      />

      <div className="stack-grid">
        {stackGroups.map((group, index) => (
          <article className="stack-card" key={group.title}>
            <div className="stack-card__num">{String(index + 1).padStart(2, "0")}</div>
            <h3>{group.title}</h3>
            <p>{group.summary}</p>
            <div className="tag-list">
              {group.tools.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function OpenClawSection() {
  const [selected, setSelected] = useState(agents[0].id);
  const activeAgent = agents.find((agent) => agent.id === selected) ?? agents[0];
  const workflows = [
    {
      label: "Job Monitoring",
      desc: "Career-Ops workflow for JD analysis, resume targeting, score reports, generated CV outputs, and application tracking.",
    },
    {
      label: "Obsidian Memory",
      desc: "Project pages, frontmatter, double links, source indexes, and path tables turn scattered AI outputs into reusable operating memory.",
    },
    {
      label: "Content Pipeline",
      desc: "AI video publishing matrix for turning finished work into platform-specific release packages, behind-the-scenes notes, and technical posts.",
    },
    {
      label: "Browser Automation",
      desc: "Browser and API workflows support research, structured extraction, web tasks, and repeatable reporting when a task needs external context.",
    },
    {
      label: "Rule-Bound Handoff",
      desc: "TEAM-RULEBOOK, agent role files, and Discord mention protocols keep delegation, review, and long-message reports from becoming chaotic.",
    },
    {
      label: "Human Review Gates",
      desc: "The system separates diagnosis from publishing: agents recommend, Eric confirms, then selected outputs become release packages.",
    },
    {
      label: "Discord Coordination",
      desc: "Discord channels and threads act as the control surface, separating HARNESS, AI content, Career-Ops, and film-production contexts.",
    },
  ];
  const governance = [
    {
      label: "Rule Loading",
      desc: "Agents start from TEAM-RULEBOOK, TEAM-DIRECTORY, SKILL-REGISTRY, SOUL.md, and AGENTS.md instead of relying on hidden chat memory.",
    },
    {
      label: "Role Boundaries",
      desc: "Each agent has a defined scope, handoff behavior, stop condition, and channel/thread context.",
    },
    {
      label: "Error Blocking",
      desc: "Critical upstream errors such as wrong project names, wrong files, or wrong scope stop the workflow before downstream writing.",
    },
    {
      label: "Memory Writeback",
      desc: "Outputs enter Obsidian with frontmatter, double links, source paths, project scope, and review boundaries.",
    },
  ];

  return (
    <section className="section section--tinted" id="openclaw">
      <SectionHeader
        id="OpenClaw"
        number="04"
        title="OpenClaw System"
        summary=""
      />

      <div className="openclaw-intro">
        <p>
          "I did not want AI to be another scattered chat log. I wanted a creative operating
          system with memory, roles, review, and handoff."
        </p>
        <p>
          OpenClaw is my multi-agent operations layer. Eight specialized agents coordinate through
          Discord, write structured knowledge into Obsidian, and use Codex as a governance layer
          for audits, refactors, and handoffs. This is where the site proves agentic AI ability:
          delegation, role boundaries, memory, browser/API workflows, and real production tasks.
        </p>
      </div>

      <div className="openclaw-grid">
        <div>
          <div className="openclaw-kicker">8-Agent Architecture - click to explore</div>
          <AgentDiagram activeAgent={selected} setActive={setSelected} />
          <div className="agent-detail">
            <div className="agent-detail__heading">
              <span style={{ background: activeAgent.color }} />
              <strong style={{ color: activeAgent.color }}>
                {activeAgent.label} - {activeAgent.role}
              </strong>
            </div>
            <p>{activeAgent.description}</p>
          </div>
        </div>

        <div>
          <div className="openclaw-kicker">Automated Workflows</div>
          <div className="workflow-stack">
            {workflows.map((workflow) => (
              <div className="workflow-row" key={workflow.label}>
                <span>◆</span>
                <div>
                  <strong>{workflow.label}</strong>
                  <p>{workflow.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="governance-module">
            <div className="openclaw-kicker">Agent Governance / HARNESS</div>
            <h3>System reliability for multi-agent work.</h3>
            <p>
              HARNESS is the governance layer that keeps multi-agent work from becoming unmanaged
              chat: rules load predictably, agents know their boundaries, bad upstream output is
              blocked, and useful work is written back into a durable project memory.
            </p>
            <div className="governance-grid">
              {governance.map((item) => (
                <article className="governance-card" key={item.label}>
                  <strong>{item.label}</strong>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="pipeline-module">
            <div className="openclaw-kicker">Module</div>
            <h3>AI Filmmaking Pipeline</h3>
            <p>
              A dedicated AI filmmaking workspace inside Obsidian, connecting prompt systems,
              model comparison, character/storyboard references, generation paths, and publishing
              workflows.
            </p>
            {[
              ["Platform Research", "Model and workflow comparison across tools such as Runway, Kling, Veo, Flux, Midjourney, and related video/image systems."],
              ["Prompt Library", "Structured prompt templates organized by shot type, style, model target, and repeatable production need."],
              ["Character & Storyboard", "Reusable character references, storyboard templates, and continuity notes for multi-shot generation."],
              ["Publishing Matrix", "A documented path from finished video to platform-specific releases, technical breakdowns, and retrospectives."],
            ].map(([label, desc]) => (
              <div className="pipeline-row" key={label}>
                <span>◆</span>
                <div>
                  <strong>{label}</strong>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AgentDiagram({
  activeAgent,
  setActive,
}: {
  activeAgent: string;
  setActive: (id: string) => void;
}) {
  const width = 520;
  const height = 420;

  return (
    <div className="agent-diagram">
      <svg viewBox={`0 0 ${width} ${height}`} aria-label="OpenClaw agent architecture">
        <defs>
          {agents.slice(1).map((agent) => (
            <linearGradient id={`agent-gradient-${agent.id}`} key={agent.id} x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
              <stop offset="55%" stopColor={agent.color} stopOpacity="0.92" />
              <stop offset="100%" stopColor="var(--accent2)" stopOpacity="0.25" />
            </linearGradient>
          ))}
          {agents.map((agent) => (
            <radialGradient id={`node-glow-${agent.id}`} key={agent.id} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={agent.color} stopOpacity="0.24" />
              <stop offset="62%" stopColor={agent.color} stopOpacity="0.08" />
              <stop offset="100%" stopColor={agent.color} stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="agentSoftGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {agents.slice(1).map((agent) => {
          const cx = width * 0.5;
          const cy = height * 0.5;
          const ax = width * (agent.x / 100);
          const ay = height * (agent.y / 100);
          return (
            <line
              className={activeAgent === agent.id || activeAgent === "general" ? "agent-link is-active" : "agent-link"}
              key={agent.id}
              x1={cx}
              y1={cy}
              x2={ax}
              y2={ay}
              stroke={
                activeAgent === agent.id || activeAgent === "general"
                  ? `url(#agent-gradient-${agent.id})`
                  : "var(--border)"
              }
              strokeDasharray="4 4"
              strokeWidth={activeAgent === agent.id || activeAgent === "general" ? 1.35 : 1}
            />
          );
        })}

        {activeAgent !== "general" &&
          agents
            .filter((agent) => agent.id === activeAgent)
            .map((agent) => {
              const cx = width * 0.5;
              const cy = height * 0.5;
              const ax = width * (agent.x / 100);
              const ay = height * (agent.y / 100);

              return (
                <line
                  className="agent-link-highlight"
                  key={`active-${agent.id}`}
                  x1={cx}
                  y1={cy}
                  x2={ax}
                  y2={ay}
                  stroke={agent.color}
                  strokeDasharray="6 5"
                  strokeWidth="1.8"
                />
              );
            })}

        {agents.map((agent) => {
          const x = width * (agent.x / 100);
          const y = height * (agent.y / 100);
          const isActive = activeAgent === agent.id;
          const radius = agent.id === "general" ? 36 : 28;

          return (
            <g
              className="agent-node"
              key={agent.id}
              onClick={() => setActive(agent.id === activeAgent ? "general" : agent.id)}
              role="button"
              tabIndex={0}
            >
              <circle cx={x} cy={y} r={radius + 8} fill={isActive ? agent.color : "transparent"} opacity="0.08" />
              <circle
                className={isActive ? "agent-node__halo is-active" : "agent-node__halo"}
                cx={x}
                cy={y}
                r={radius + 15}
                fill={`url(#node-glow-${agent.id})`}
              />
              <circle
                className="agent-node__core"
                cx={x}
                cy={y}
                r={radius}
                fill="var(--bg2)"
                stroke={isActive ? agent.color : "var(--border)"}
                strokeWidth={isActive ? 1.5 : 1}
                filter={isActive ? "url(#agentSoftGlow)" : undefined}
              />
              {agent.id === "general" && (
                <circle className="agent-node__orbit" cx={x} cy={y} r={radius - 8} fill="none" stroke={agent.color} strokeWidth="0.5" opacity="0.4" />
              )}
              <text
                x={x}
                y={y - 5}
                textAnchor="middle"
                fill={isActive ? agent.color : "var(--fg)"}
                fontSize={agent.id === "general" ? 9 : 8}
                fontFamily="var(--mono)"
                letterSpacing="1"
              >
                {agent.label}
              </text>
              <text x={x} y={y + 10} textAnchor="middle" fill="var(--fg2)" fontSize="7" fontFamily="var(--mono)" opacity="0.7">
                {agent.role}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function GithubSection() {
  return (
    <section className="section" id="github">
      <SectionHeader
        id="GitHub"
        number="05"
        title="Code, systems, and public proof."
        summary="This section can be connected to real repositories later. For now it is structured so each repo can be updated like a portfolio item."
      />

      <div className="repo-list">
        {repositories.map((repo) => (
          <a href={repo.url} key={repo.name} rel="noreferrer" target="_blank">
            <div>
              <Braces size={18} />
              <strong>ericzheng-lab / {repo.name}</strong>
            </div>
            <p>{repo.description}</p>
            <div className="repo-list__footer">
              <span>{repo.language}</span>
              <span>{repo.tags.join(" / ")}</span>
              <ArrowUpRight size={16} />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="section contact" id="contact">
      <div>
        <span className="micro-label">Connected Sites</span>
        <h2>AI portfolio now. Traditional portfolio later.</h2>
        <p>
          This site is being prepared for ai.drsfilms.com. The traditional portfolio can stay
          live through Figma while we separately recover its missing assets and decide whether
          to rebuild it.
        </p>
      </div>
      <div className="contact__actions">
        <a className="button button--primary" href="https://www.drsfilms.com" rel="noreferrer" target="_blank">
          DRS Films <ExternalLink size={15} />
        </a>
        <a className="button" href="https://github.com/ericzheng-lab" rel="noreferrer" target="_blank">
          GitHub <Github size={15} />
        </a>
        <a className="button" href="mailto:eric.zheng@drsfilms.com">
          eric.zheng@drsfilms.com <ArrowUpRight size={15} />
        </a>
      </div>
    </section>
  );
}
