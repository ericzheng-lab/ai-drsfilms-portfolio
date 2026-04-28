import { useEffect, useRef, useState } from "react";

const promptText =
  "A cinematic portrait in retro sci-fi style, neon-lit, vibrant colors, anime illustration";

export function CanvasDemo() {
  const [typed, setTyped] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "typing" | "selecting" | "rendering" | "complete">("idle");
  const timer = useRef<number>();

  useEffect(() => {
    let cancelled = false;

    const loop = async () => {
      while (!cancelled) {
        setPhase("idle");
        setProgress(0);
        setTyped("");
        setSelectedModel(null);
        await wait(800);
        setPhase("typing");

        for (let i = 0; i <= promptText.length; i += 1) {
          if (cancelled) return;
          setTyped(promptText.slice(0, i));
          await wait(28);
        }

        setPhase("selecting");
        setSelectedModel("GPT Image · v4.1");
        await wait(1200);
        setPhase("rendering");

        for (let p = 0; p <= 100; p += 3.35) {
          if (cancelled) return;
          setProgress(p);
          await wait(50);
        }

        setPhase("complete");
        await wait(3600);
      }
    };

    loop();

    return () => {
      cancelled = true;
      window.clearTimeout(timer.current);
    };
  }, []);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      timer.current = window.setTimeout(resolve, ms);
    });

  return (
    <div className="canvas-demo" aria-label="Animated AI canvas demo">
      <div className="canvas-demo__panel">
        <div className="canvas-demo__topline">
          <span>Text Prompt</span>
          <div>
            <i />
            <i />
          </div>
        </div>
        <div className="prompt-box">
          <span>{typed}</span>
          <span className="cursor" />
        </div>
        <div className="model-label">Model</div>
        <div className="model-row">
          {["Midjourney v7", "GPT Image · v4.1", "DALL·E 3", "Stable Diffusion XL"].map((model) => (
            <span
              className={selectedModel === model ? "is-active" : ""}
              key={model}
            >
              {model}
            </span>
          ))}
        </div>
        <div className={`generate-button ${phase === "rendering" ? "is-generating" : ""} ${selectedModel ? "is-ready" : ""}`}>
          {phase === "rendering" ? `Generating... ${Math.min(100, Math.round(progress))}%` : "Generate"}
        </div>
      </div>

      <div className="canvas-demo__rail">
        <span className={phase === "rendering" || phase === "complete" ? "is-lit" : ""} />
        <span className={phase === "complete" ? "is-lit" : ""} />
        {phase === "rendering" && <b style={{ top: `${80 + progress * 1.4}px` }} />}
      </div>

      <div className="canvas-demo__panel canvas-demo__output">
        <div className="canvas-demo__topline canvas-demo__topline--output">
          <span>Image Generation</span>
          <small>{selectedModel ?? "--"}</small>
        </div>
        <div className={`output-frame ${phase === "complete" ? "is-complete" : ""}`}>
          {phase !== "rendering" && phase !== "complete" && (
            <span className="output-empty">Output</span>
          )}
          {phase === "rendering" && (
            <div className="progress-block">
              <div className="progress">
                <span style={{ width: `${progress}%` }} />
              </div>
              <small>Processing prompt...</small>
            </div>
          )}
          {phase === "complete" && (
            <GeneratedImage />
          )}
        </div>
        {phase === "complete" && (
          <div className="meta-row">
            <span>1024x1024 · 4.2s</span>
            <div>
              <span>Save</span>
              <span>Remix</span>
            </div>
          </div>
        )}
      </div>
      <div className="canvas-watermark">AI Canvas Studio · Demo</div>
    </div>
  );
}

function GeneratedImage() {
  return (
    <svg className="generated-svg" viewBox="0 0 200 200" role="img" aria-label="Generated neon portrait preview">
      <defs>
        <radialGradient id="bg1" cx="50%" cy="50%">
          <stop offset="0%" stopColor="oklch(0.25 0.15 305)" />
          <stop offset="100%" stopColor="oklch(0.08 0.03 260)" />
        </radialGradient>
        <radialGradient id="neon1" cx="30%" cy="40%">
          <stop offset="0%" stopColor="oklch(0.70 0.20 210 / 0.6)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="neon2" cx="70%" cy="60%">
          <stop offset="0%" stopColor="oklch(0.65 0.20 305 / 0.5)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg1)" />
      <circle cx="60" cy="80" r="60" fill="url(#neon1)" />
      <circle cx="140" cy="120" r="50" fill="url(#neon2)" />
      <ellipse cx="100" cy="75" rx="28" ry="32" fill="oklch(0.20 0.05 260)" stroke="oklch(0.60 0.18 210)" strokeWidth="1" />
      <path d="M55 135 Q100 110 145 135 L145 200 L55 200 Z" fill="oklch(0.15 0.04 260)" stroke="oklch(0.50 0.15 305)" strokeWidth="0.8" />
      <line x1="30" y1="160" x2="170" y2="160" stroke="oklch(0.75 0.18 210 / 0.4)" strokeWidth="0.5" />
      <line x1="30" y1="170" x2="170" y2="170" stroke="oklch(0.65 0.20 305 / 0.3)" strokeWidth="0.5" />
      <line x1="88" y1="72" x2="96" y2="72" stroke="oklch(0.75 0.18 210)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="104" y1="72" x2="112" y2="72" stroke="oklch(0.75 0.18 210)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M92 85 Q100 90 108 85" fill="none" stroke="oklch(0.65 0.20 305 / 0.6)" strokeWidth="0.8" />
      <circle cx="45" cy="40" r="1" fill="oklch(0.80 0.13 75)">
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="155" cy="50" r="1.2" fill="oklch(0.75 0.18 210)">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="130" cy="30" r="0.8" fill="oklch(0.65 0.20 305)">
        <animate attributeName="opacity" values="0;1;0" dur="2.5s" begin="1s" repeatCount="indefinite" />
      </circle>
      <text x="100" y="192" textAnchor="middle" fill="oklch(0.55 0.010 240)" fontSize="5" fontFamily="'Space Mono', monospace" letterSpacing="1">
        GENERATED · AI CANVAS STUDIO
      </text>
    </svg>
  );
}
