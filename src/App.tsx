import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { HeroForm } from "./three/createPointCloudHero";
import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  Github,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { agents, navItems, projects, repositories, stackGroups } from "./data/site";

const CinematicHero = lazy(() => import("./components/CinematicHero"));

const sectionIds = navItems.map((item) => item.id);

const SECTION_BG: Record<string, string> = {
  top: "#0c0a08",
  showreel: "#0d0b08",
  work: "#0c0c0c",
  studio: "#0b0c0f",
  stack: "#090c12",
  openclaw: "#080c14",
  github: "#070b13",
  contact: "#060a12",
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const HERO_STATES: { form: HeroForm; idx: string; name: string; sub: string }[] = [
  { form: 0, idx: "01", name: "Lens", sub: "the eye" },
  { form: 1, idx: "02", name: "Aperture", sub: "capture" },
  { form: 2, idx: "03", name: "Reel", sub: "film" },
  { form: 3, idx: "04", name: "Signal", sub: "sound" },
  { form: 4, idx: "05", name: "Network", sub: "systems" },
];

export function App() {
  const [active, setActive] = useState("work");

  // Nav active section observer + section-driven nav background
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            const bg = SECTION_BG[entry.target.id];
            const navEl = document.getElementById("topNav");
            if (bg && navEl) {
              navEl.style.background = `rgba(${hexToRgb(bg)}, 0.86)`;
            }
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 },
    );

    [...sectionIds, "top"].forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Scroll fade-in observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.08 },
    );

    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const targetId = new URLSearchParams(window.location.search).get("heroDebugJump");
    if (!targetId) return;
    const timer = window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) window.scrollTo(0, target.offsetTop);
    }, 80);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const hero = document.querySelector(".hero-wrap");
      const isOverHero = hero
        ? e.clientY >= hero.getBoundingClientRect().top && e.clientY <= hero.getBoundingClientRect().bottom
        : false;
      document.body.classList.toggle("spotlight-off", isOverHero);
      if (!isOverHero) {
        document.body.style.setProperty("--spotlight-x", `${e.clientX}px`);
        document.body.style.setProperty("--spotlight-y", `${e.clientY}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="site-shell">
      <Nav active={active} />
      <main>
        <Hero />
        <ShowreelSection />
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

function Nav({ active }: { active: string }) {
  return (
    <nav className="nav" id="topNav">
      <a className="nav__brand" href="#top">
        Eric Zheng
        <small>· DRS Films · AI Portfolio</small>
      </a>
      <div className="nav__links">
        {navItems.map((item) => (
          <a className={active === item.id ? "is-active" : ""} href={`#${item.id}`} key={item.id}>
            {item.label}
          </a>
        ))}
      </div>
      <div className="nav__right">
        <span className="nav__dot" />
        <span>ai.drsfilms.com</span>
        <a className="nav__drslink" href="https://www.drsfilms.com" rel="noreferrer" target="_blank">
          Open DRS Films <ArrowUpRight size={12} />
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pinnedForm, setPinnedForm] = useState<HeroForm | null>(null);
  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const debugProgress = useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get("heroDebugProgress");
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? clamp01(value) : null;
  }, []);
  const debugForm = useMemo<HeroForm | null>(() => {
    const raw = new URLSearchParams(window.location.search).get("heroDebugForm");
    if (raw == null) return null;
    const value = Number(raw);
    return value >= 0 && value <= 4 ? (value as HeroForm) : null;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const total = heroRef.current.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(total, 1)));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const effectiveProgress = debugProgress ?? scrollProgress;
  const effectivePinned = debugForm ?? pinnedForm;

  return (
    <section className="hero-wrap" id="top" ref={heroRef}>
      <div className="hero" id="hero">
        <Suspense fallback={null}>
          <CinematicHero progress={effectiveProgress} pinnedForm={effectivePinned} reducedMotion={reducedMotion} />
        </Suspense>
        <div className="hero__scrim" />

        <div className="hud">
          <header className="hud__top">
            <div className="hud__crest">
              <small>ai.drsfilms.com · 2026</small>
            </div>
            <div className="hud__channel">
              <span>
                <span className="dot" />
                LIVE · AI-NATIVE PRODUCTION SYSTEM
              </span>
            </div>
          </header>

          <div className="hud__copy">
            <p className="hud__identity">Eric Zheng · Film Producer &amp; AI Systems Builder</p>
            <h1 className="hud__title">
              <span className="br">I produce films.</span>
              <span className="br">I build AI systems.</span>
              <span className="br">
                <em>I connect both.</em>
              </span>
            </h1>
            <p className="hud__desc">
              A proof-of-work portfolio for AI filmmaking, creative tools, multi-agent workflows, and production
              automation — grounded in real film and commercial production.
            </p>
            <div className="hud__cta">
              <a className="btn btn--primary" href="#work">
                View Work <span>→</span>
              </a>
              <a className="btn" href="https://www.drsfilms.com" rel="noreferrer" target="_blank">
                DRS Films <span>↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className="scroll-hint" id="scrollHint">
          <span>Scroll · engage</span>
          <span className="line" />
        </div>

        <div className="hero-states" id="heroStates">
          {HERO_STATES.map((state) => (
            <button
              className={`hero-state${state.form === 0 && effectivePinned === null ? " is-active" : ""}`}
              data-form={state.form}
              key={state.form}
              onClick={() => setPinnedForm(state.form)}
              type="button"
            >
              <span className="hs-idx">{state.idx}</span>
              <span className="hs-name">{state.name}</span>
              <span className="hs-sub">{state.sub}</span>
            </button>
          ))}
        </div>

        <div className="timecode">
          <span>TC</span>
          <span className="bar" id="tcBar" />
          <span id="tcText">00 / 100</span>
        </div>

        <div className="hero-exit" />
      </div>
    </section>
  );
}

function ShowreelSection() {
  const [expanded, setExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play();
  }, [expanded]);

  return (
    <section className="section fade-in" id="showreel">
      <div className="section-num" aria-hidden="true">00</div>
      <div className="showreel__layout">
        <div className="showreel__meta">
          <p className="eyebrow">00 · Reel</p>
          <h2>AI-Native Creative Portfolio Reel</h2>
          <p>Small ambient preview. Expand when needed. Grounded in real production output, not stock footage.</p>
        </div>
        <div className={`showreel__frame ${expanded ? "is-expanded" : ""}`}>
          <button
            aria-label={expanded ? "Close expanded video" : "Expand video"}
            className="showreel__toggle"
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {expanded ? "Close" : "Play Full"}
          </button>
          <video
            ref={videoRef}
            autoPlay
            controls={expanded}
            loop
            muted={!expanded}
            playsInline
            preload="metadata"
            poster="/generated/hero-command-center.png"
            src="/media/drs-films-reel-withaudio.mp4"
          />
        </div>
      </div>
      {expanded ? <button className="showreel__backdrop is-visible" onClick={() => setExpanded(false)} type="button" /> : null}
    </section>
  );
}

function SectionHeader({
  number,
  id,
  title,
  summary,
  cyan,
}: {
  number: string;
  id: string;
  title: string;
  summary?: string;
  cyan?: boolean;
}) {
  return (
    <div className={`section-header${cyan ? " cyan-accent" : ""}`}>
      <div className="section-header__meta">{number} · {id}</div>
      <h2>{title}</h2>
      {summary && <p>{summary}</p>}
    </div>
  );
}

function WorkGrid() {
  return (
    <section className="section fade-in" id="work">
      <div className="section-num" aria-hidden="true">01</div>
      <SectionHeader
        number="01"
        id="Work"
        title="Proof, not decoration."
        summary="Each card demonstrates a specific ability: AI film direction, tool design, system building, or production automation."
      />

      <div className="work-grid">
        {projects.map((project, index) => (
          <article className={`project-card fade-in fade-in-delay-${(index % 3) + 1}`} key={project.id}>
            <div className="card-media">
              <ProjectVisual project={project} />
              <div className="card-type">{cardType(project.type)}</div>
            </div>
            <div className="card-body">
              <div className="card-meta">
                <span>{project.number}</span>
                <span>{project.year}</span>
                <span className={cardStatusClass(project.status)}>{project.status}</span>
              </div>
              <h3>{project.title}</h3>
              <p className="card-eyebrow">{project.eyebrow}</p>
              <p>{project.description}</p>
              <div className="card-proof">
                <span>Proof</span>
                <p>{project.proof}</p>
              </div>
              <div className="tags">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="card-links">
                {project.link && (
                  <a href={project.link} rel="noreferrer" target="_blank">
                    Live <ArrowUpRight size={12} />
                  </a>
                )}
                {project.repo && (
                  <a href={project.repo} rel="noreferrer" target="_blank">
                    GitHub <ArrowUpRight size={12} />
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

function cardType(type: (typeof projects)[number]["type"]) {
  switch (type) {
    case "film":
      return "Film";
    case "tool":
      return "Tool";
    case "system":
      return "System";
    case "code":
      return "Code";
    default:
      return "Web";
  }
}

function cardStatusClass(status: (typeof projects)[number]["status"]) {
  switch (status) {
    case "Live":
    case "Archive":
      return "card-status-live";
    case "In Progress":
      return "card-status-prog";
    default:
      return "card-status-proto";
  }
}

function Waveform() {
  const bars = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        height: 6 + Math.random() * 34,
        delay: i * 0.055,
        opacity: 0.5 + Math.random() * 0.5,
      })),
    [],
  );
  return (
    <div className="cv-waveform">
      {bars.map((bar, i) => (
        <div
          className="bar"
          key={i}
          style={{ height: `${bar.height}px`, animationDelay: `${bar.delay}s`, opacity: bar.opacity }}
        />
      ))}
    </div>
  );
}

function ProjectVisual({ project }: { project: (typeof projects)[number] }) {
  if (project.id === "openclaw-creative-os") {
    return (
      <div className="cv">
        <div className="cv-nodes">
          <span>General<br />Commander</span>
          <span>Engineer<br />Technical</span>
          <span>Creator<br />Content</span>
          <span>Wiseman<br />Knowledge</span>
        </div>
      </div>
    );
  }

  if (project.id === "ai-video-studio") {
    return (
      <div className="cv">
        <Waveform />
      </div>
    );
  }

  if (project.id === "ai-publishing-matrix") {
    return (
      <div className="cv">
        <div className="cv-grid">
          {["YouTube", "Bilibili", "RedNote", "LinkedIn", "Twitter", "Archive"].map((platform) => (
            <span key={platform}><b /> {platform}</span>
          ))}
        </div>
      </div>
    );
  }

  if (project.id === "career-ops") {
    return (
      <div className="cv">
        <div className="cv-terminal">
          {["JD ingest + score", "Resume targeting", "Cover letter gen", "Application track"].map((step) => (
            <div className="row" key={step}>
              <span>$</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (project.id === "production-bridge") {
    return (
      <div className="cv">
        <div className="cv-filmstrip">
          {["Sundance", "Berlinale", "Tencent", "Nike", "miHoYo"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cv">
      <div className="cv-canvas">
        <div className="orbit" />
        <div className="label">Prompt / Generate / Remix</div>
      </div>
    </div>
  );
}

function StudioSection() {
  return (
    <section className="section fade-in" id="studio">
      <div className="section-num" aria-hidden="true">02</div>
      <SectionHeader
        number="02"
        id="Studio"
        title="Tools for directors, not just prompts."
        summary="AI as a production instrument — input, model choice, generation, review, remix, documented output."
        cyan
      />

      <div className="studio-layout">
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
              ["API stack", "Custom-curated API stack for model selection, routing, and output handling."],
              ["Production memory", "Preserve decisions so experiments become reusable pipeline knowledge."],
            ].map(([label, text]) => (
              <div className="point" key={label}>
                <span className="point-label">{label}</span>
                <p className="point-text">{text}</p>
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
      <div className="studio-video__bar">
        <span>Live Prototype</span>
        <small>AI Canvas Demo</small>
      </div>
      <video autoPlay loop muted playsInline preload="metadata" src="/media/ai-canvas-web.mp4" />
      <div className="studio-video__caption">Browser-native interface study · prompt to generated frame</div>
    </div>
  );
}

function StackSection() {
  return (
    <section className="section fade-in" id="stack">
      <div className="section-num" aria-hidden="true">03</div>
      <SectionHeader
        number="03"
        id="Stack"
        title="Make the knowledge visible."
        summary="Tools, models, APIs, and production workflows behind the work."
        cyan
      />

      <div className="stack-grid">
        {stackGroups.map((group, index) => (
          <article className={`stack-card fade-in fade-in-delay-${(index % 4) + 1}`} key={group.title}>
            <div className="stack-card__num">{String(index + 1).padStart(2, "0")}</div>
            <h3>{group.title}</h3>
            <p>{group.summary}</p>
            <div className="tags">
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const activeAgent = agents.find((agent) => agent.id === selected) ?? agents[0];
  const workflows = [
    {
      label: "Job Monitoring",
      desc: "Career-Ops workflow for JD analysis, resume targeting, score reports, and application tracking.",
    },
    {
      label: "Obsidian Memory",
      desc: "Project pages, frontmatter, double links, source indexes, and path tables as operating memory.",
    },
    {
      label: "Content Pipeline",
      desc: "AI video publishing matrix for platform-specific release packages and technical posts.",
    },
    {
      label: "Browser Automation",
      desc: "Browser and API workflows for research, structured extraction, and repeatable reporting.",
    },
    {
      label: "Rule-Bound Handoff",
      desc: "TEAM-RULEBOOK, agent role files, and Discord mention protocols keep delegation structured.",
    },
  ];
  const governance = [
    {
      label: "Rule Loading",
      desc: "Agents start from TEAM-RULEBOOK, SOUL.md, and AGENTS.md instead of relying on hidden chat memory.",
    },
    {
      label: "Role Boundaries",
      desc: "Each agent has defined scope, handoff behavior, stop condition, and channel/thread context.",
    },
    {
      label: "Error Blocking",
      desc: "Critical upstream errors — wrong project names, wrong scope — stop the workflow before downstream writing.",
    },
    {
      label: "Memory Writeback",
      desc: "Outputs enter Obsidian with frontmatter, double links, source paths, and review boundaries.",
    },
  ];

  return (
    <section className="section fade-in" id="openclaw">
      <div className="section-num" aria-hidden="true">04</div>
      <SectionHeader number="04" id="OpenClaw" title="OpenClaw System" cyan />

      <div className="openclaw-grid">
        <div>
          <p className="openclaw-quote">
            "I did not want AI to be another scattered chat log. I wanted a creative operating
            system with memory, roles, review, and handoff."
          </p>
          <p className="openclaw-body">
            OpenClaw is my multi-agent operations layer. Eight specialized agents coordinate through
            Discord, write structured knowledge into Obsidian, and use Codex as a governance layer
            for audits, refactors, and handoffs.
          </p>
          <div className="openclaw-kicker" style={{ marginTop: 36 }}>Automated Workflows</div>
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
        </div>

        <div>
          <div className="openclaw-kicker">8-Agent Architecture — click to explore</div>
          <AgentDiagram activeAgent={selected} setActive={setSelected} />
          <div className="agent-detail">
            <div className="agent-detail__heading">
              <span style={{ background: activeAgent.color }} />
              <strong style={{ color: activeAgent.color }}>
                {activeAgent.label} — {activeAgent.role}
              </strong>
            </div>
            <p>{activeAgent.description}</p>
          </div>
        </div>
      </div>

      <button className="openclaw-toggle" onClick={() => setDetailsOpen(!detailsOpen)} type="button">
        {detailsOpen ? "Hide System Details" : "View System Details"}
      </button>

      {detailsOpen && (
        <div className="openclaw-details">
          <div className="openclaw-kicker">Agent Governance · HARNESS</div>
          <div className="governance-grid">
            {governance.map((item) => (
              <article className="governance-card" key={item.label}>
                <strong>{item.label}</strong>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      )}
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
  const width = 500;
  const height = 400;

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
          const radius = agent.id === "general" ? 34 : 26;

          return (
            <g
              className="agent-node"
              key={agent.id}
              onClick={() => setActive(agent.id === activeAgent ? "general" : agent.id)}
              role="button"
              tabIndex={0}
            >
              <circle
                className={isActive ? "agent-node__halo is-active" : "agent-node__halo"}
                cx={x}
                cy={y}
                r={radius + 12}
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
              <text x={x} y={y + 9} textAnchor="middle" fill="var(--fg2)" fontSize="7" fontFamily="var(--mono)">
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
    <section className="section fade-in" id="github">
      <div className="section-num" aria-hidden="true">05</div>
      <SectionHeader number="05" id="GitHub" title="Code, systems, and public proof." cyan />

      <div className="repo-list">
        {repositories.map((repo) => (
          <a className="repo-card" href={repo.url} key={repo.name} rel="noreferrer" target="_blank">
            <div>
              <Code2 size={15} />
              <strong>ericzheng-lab / {repo.name}</strong>
            </div>
            <p>{repo.description}</p>
            <div className="repo-list__footer">
              <span>{repo.language}</span>
              <span>{repo.tags.join(" · ")}</span>
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
    <section className="section" id="contact">
      <div className="section-num" aria-hidden="true">06</div>
      <div className="contact fade-in">
        <div>
          <span className="micro-label">06 · Connect</span>
          <h2>
            AI film, creative tech,
            <br />
            agentic workflow collaborations.
          </h2>
          <p>
            Open to projects that push the edges of AI production. Grounded in real film work, not
            just experimentation.
          </p>
        </div>
        <div className="contact__actions">
          <a className="button button--primary" href="mailto:eric.zheng@drsfilms.com">
            eric.zheng@drsfilms.com <ExternalLink size={15} />
          </a>
          <a className="button" href="https://www.drsfilms.com" rel="noreferrer" target="_blank">
            DRS Films <ArrowUpRight size={15} />
          </a>
          <a className="button" href="https://github.com/ericzheng-lab" rel="noreferrer" target="_blank">
            GitHub <Github size={15} />
          </a>
        </div>
      </div>
      <div className="contact-foot">
        <span>© 2026 Eric Zheng · DRS Films</span>
        <span>ai.drsfilms.com</span>
      </div>
    </section>
  );
}
