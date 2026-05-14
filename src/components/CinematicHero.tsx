/**
 * CinematicHero — AI-Native Production Engine
 *
 * React wrapper for the Three.js hero scene.
 * Handles canvas mounting, scroll tracking, mouse parallax,
 * resize, reduced-motion, mode switching, and cleanup.
 */
import { useEffect, useRef, useCallback } from "react";
import type { HeroMode } from "../three/createCinematicHero";

type HeroScene = {
  update: (progress: number, mode: HeroMode, mouseX: number, mouseY: number) => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
};

interface CinematicHeroProps {
  progress: number;
  mode: HeroMode;
  reducedMotion?: boolean;
}

export default function CinematicHero({ progress, mode, reducedMotion }: CinematicHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HeroScene | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const progressRef = useRef(progress);
  const modeRef = useRef<HeroMode>(mode);
  const rafRef = useRef(0);
  const loadedRef = useRef(false);

  // Keep refs in sync
  progressRef.current = progress;
  modeRef.current = mode;

  // Lazy-load Three.js scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadedRef.current) return;
    loadedRef.current = true;

    let disposed = false;

    import("../three/createCinematicHero").then((mod) => {
      if (disposed) return;
      const scene = mod.createCinematicHero(canvas);
      sceneRef.current = scene;

      // Ensure correct initial size — canvas layout may not be ready yet
      const fit = () => {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        scene.resize(w, h);
      };
      fit();
      requestAnimationFrame(fit);

      const tick = () => {
        if (disposed) return;
        scene.update(
          progressRef.current,
          modeRef.current,
          mouseRef.current.x,
          mouseRef.current.y
        );
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      sceneRef.current?.dispose();
      sceneRef.current = null;
      loadedRef.current = false; // reset so React Strict Mode re-mount works
    };
  }, []);

  // Mouse tracking
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    mouseRef.current = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    };
  }, []);

  // Resize
  useEffect(() => {
    const onResize = () => {
      sceneRef.current?.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (reducedMotion) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#08080c" }} />
    );
  }

  return (
    <canvas
      className="hero__canvas"
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "100%" }}
      onPointerMove={handlePointerMove}
    />
  );
}
