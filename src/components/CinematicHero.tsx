/**
 * CinematicHero — AI-Native Production Engine
 *
 * React wrapper for the Three.js hero scene.
 * Handles canvas mounting, scroll tracking, mouse parallax,
 * resize, reduced-motion, mode switching, and cleanup.
 */
import { useEffect, useRef, useCallback } from "react";
import type { HeroForm } from "../three/createPointCloudHero";

type HeroScene = {
  update: (progress: number, pinnedForm: HeroForm | null, mouseX: number, mouseY: number) => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
};

interface CinematicHeroProps {
  progress: number;
  pinnedForm: HeroForm | null;
  reducedMotion?: boolean;
}

export default function CinematicHero({ progress, pinnedForm, reducedMotion }: CinematicHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HeroScene | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const progressRef = useRef(progress);
  const pinnedFormRef = useRef<HeroForm | null>(pinnedForm);
  const rafRef = useRef(0);
  const loadedRef = useRef(false);

  // Keep refs in sync
  progressRef.current = progress;
  pinnedFormRef.current = pinnedForm;

  // Lazy-load Three.js scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadedRef.current) return;
    loadedRef.current = true;

    let disposed = false;

    import("../three/createPointCloudHero").then((mod) => {
      if (disposed) return;
      const scene = mod.createPointCloudHero(canvas);
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
          pinnedFormRef.current,
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
