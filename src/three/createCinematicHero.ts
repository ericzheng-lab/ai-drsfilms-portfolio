import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

export type HeroMode = "default" | "film" | "tools" | "agents";

interface HeroScene {
  update: (progress: number, mode: HeroMode, mouseX: number, mouseY: number) => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const COLOR = {
  bg: new THREE.Color("#0c0a08"),
  fog: new THREE.Color("#100c08"),
  amber: new THREE.Color("#e3a868"),
  amberDeep: new THREE.Color("#b87a3e"),
  cyan: new THREE.Color("#7fb5c8"),
  cream: new THREE.Color("#fff4dc"),
  metalDark: new THREE.Color("#1a1611"),
  metalMid: new THREE.Color("#3d342a"),
};

export function createCinematicHero(canvas: HTMLCanvasElement): HeroScene {
  const isMobile = window.matchMedia("(max-width: 860px)").matches;
  const particleCount = isMobile ? 240 : 900;
  const filmFrames = isMobile ? 64 : 110;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(COLOR.bg, 1);

  const scene = new THREE.Scene();
  scene.background = COLOR.bg;
  scene.fog = new THREE.FogExp2(COLOR.fog.getHex(), 0.072);

  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 60);
  camera.position.set(0.6, 0.2, 7.2);
  camera.lookAt(1.0, 0.3, 0);

  scene.add(new THREE.AmbientLight(0x1a1a22, 0.25));
  const keyLight = new THREE.PointLight(COLOR.amber, 4.2, 14, 1.6);
  keyLight.position.set(1.6, 1.4, 1.2);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(COLOR.cyan, 2.0, 12, 1.5);
  rimLight.position.set(-2.4, 0.4, -1.4);
  scene.add(rimLight);
  const coreLight = new THREE.PointLight(COLOR.cream, 0.0, 5, 2);
  coreLight.position.set(1.0, 0.3, 0.4);
  scene.add(coreLight);

  const engine = new THREE.Group();
  engine.position.set(1.05, 0.28, 0);
  scene.add(engine);

  const coreGroup = new THREE.Group();
  engine.add(coreGroup);

  const ringDefs = [
    { r: 0.98, t: 0.045, z: 0.0, m: 0.92, r2: 0.32, e: 0.0 },
    { r: 0.84, t: 0.03, z: 0.1, m: 0.95, r2: 0.22, e: 0.0 },
    { r: 0.7, t: 0.024, z: 0.18, m: 0.96, r2: 0.18, e: 0.0 },
    { r: 0.56, t: 0.02, z: 0.24, m: 0.94, r2: 0.16, e: 0.04 },
    { r: 0.44, t: 0.018, z: 0.28, m: 0.92, r2: 0.14, e: 0.1 },
  ];

  const rings = ringDefs.map((d, i) => {
    const geom = new THREE.TorusGeometry(d.r, d.t, 24, 96);
    const mat = new THREE.MeshStandardMaterial({
      color: COLOR.metalMid,
      metalness: d.m,
      roughness: d.r2,
      emissive: COLOR.amberDeep,
      emissiveIntensity: d.e,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.z = d.z;
    mesh.userData = { baseEmissive: d.e, layer: i };
    coreGroup.add(mesh);
    return mesh;
  });

  {
    const geom = new THREE.CylinderGeometry(1.02, 1.08, 0.18, 64, 1, true);
    const mat = new THREE.MeshStandardMaterial({
      color: COLOR.metalDark,
      metalness: 0.9,
      roughness: 0.55,
      side: THREE.DoubleSide,
    });
    const barrel = new THREE.Mesh(geom, mat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = -0.06;
    coreGroup.add(barrel);
  }

  const blades: THREE.Mesh[] = [];
  const bladeGroup = new THREE.Group();
  bladeGroup.position.z = 0.3;
  coreGroup.add(bladeGroup);
  {
    const N = 8;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.32, -0.035);
    shape.lineTo(0.30, 0.035);
    shape.lineTo(0, 0);
    const geom = new THREE.ShapeGeometry(shape);
    for (let i = 0; i < N; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: COLOR.metalDark,
        metalness: 0.85,
        roughness: 0.42,
        side: THREE.DoubleSide,
      });
      const blade = new THREE.Mesh(geom, mat);
      blade.rotation.z = (i / N) * Math.PI * 2;
      blade.userData.angle = (i / N) * Math.PI * 2;
      bladeGroup.add(blade);
      blades.push(blade);
    }
  }

  const coreSprite = (() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,246,224,1)");
    g.addColorStop(0.18, "rgba(255,210,150,0.78)");
    g.addColorStop(0.45, "rgba(220,140,70,0.32)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.6, 1.6, 1);
    sprite.position.z = 0.34;
    coreGroup.add(sprite);
    return sprite;
  })();

  const flareSprite = (() => {
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 64;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 1024, 0);
    g.addColorStop(0, "rgba(120,180,200,0)");
    g.addColorStop(0.35, "rgba(140,200,220,0.42)");
    g.addColorStop(0.5, "rgba(220,240,255,0.72)");
    g.addColorStop(0.65, "rgba(140,200,220,0.42)");
    g.addColorStop(1, "rgba(120,180,200,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 64);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(4.0, 0.28, 1);
    sprite.position.z = 0.36;
    coreGroup.add(sprite);
    return sprite;
  })();

  const filmGroup = new THREE.Group();
  filmGroup.rotation.set(-0.25, 0.6, 0.18);
  engine.add(filmGroup);

  const filmTex = (() => {
    const w = 256;
    const h = 64;
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#1a1410";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(244,237,225,0.18)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    ctx.fillStyle = "#0c0a08";
    for (let i = 0; i < 4; i++) {
      const x = (i + 0.5) * (w / 4) - 12;
      ctx.fillRect(x, 4, 24, 8);
      ctx.fillRect(x, h - 12, 24, 8);
    }
    ctx.fillStyle = "rgba(227,168,104,0.28)";
    ctx.fillRect(20, h / 2 - 1, w - 40, 2);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  })();

  const filmMesh = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.13, 0.045),
    new THREE.MeshStandardMaterial({
      map: filmTex,
      transparent: true,
      side: THREE.DoubleSide,
      metalness: 0.4,
      roughness: 0.6,
      emissive: COLOR.amberDeep,
      emissiveMap: filmTex,
      emissiveIntensity: 0.08,
    }),
    filmFrames,
  );
  filmMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  filmGroup.add(filmMesh);

  const filmRadius = 1.55;
  const filmArc = Math.PI * 1.52;
  const filmStartAngle = -Math.PI * 0.42;
  const _m = new THREE.Matrix4();
  const _q = new THREE.Quaternion();
  const _e = new THREE.Euler();
  const _p = new THREE.Vector3();
  const _s = new THREE.Vector3();

  function layoutFilm(progress: number, time: number) {
    const reveal = smoothstep(0.18, 0.55, progress);
    const rotShift = time * 0.04 + progress * 0.2;
    for (let i = 0; i < filmFrames; i++) {
      const tv = i / (filmFrames - 1);
      const a = filmStartAngle + tv * filmArc + rotShift;
      const r = filmRadius + Math.sin(time * 0.6 + i * 0.4) * 0.012;
      _p.set(Math.cos(a) * r, Math.sin(a) * r, Math.sin(a * 2 + time * 0.3) * 0.05);
      _e.set(0, 0, a + Math.PI / 2 + Math.sin(time * 0.5 + i) * 0.02);
      _q.setFromEuler(_e);
      const sc = lerp(0, 1, smoothstep(0, 1, reveal * (0.4 + 0.6 * (1 - Math.abs(tv - 0.5) * 1.6))));
      _s.set(sc, sc, sc);
      _m.compose(_p, _q, _s);
      filmMesh.setMatrixAt(i, _m);
    }
    filmMesh.instanceMatrix.needsUpdate = true;
  }

  const particles = (() => {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    const orbits = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const isOrbit = Math.random() < 0.72;
      const r = isOrbit ? lerp(1.7, 3.2, Math.pow(Math.random(), 0.6)) : lerp(2.5, 5.5, Math.random());
      const inc = (Math.random() - 0.5) * (isOrbit ? 0.7 : 1.4);
      const a = Math.random() * Math.PI * 2;
      orbits[i * 3] = r;
      orbits[i * 3 + 1] = inc;
      orbits[i * 3 + 2] = lerp(0.04, 0.18, Math.random()) * (Math.random() < 0.5 ? 1 : -1);
      phases[i] = a;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(inc) * r * 0.7 + (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 2] = Math.sin(a) * r * 0.6;
      const colorRand = Math.random();
      const color = colorRand < 0.6 ? COLOR.amber : colorRand < 0.85 ? COLOR.cyan : COLOR.cream;
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
      sizes[i] = Math.random() < 0.92 ? lerp(0.4, 1.6, Math.random()) : lerp(2.4, 4.2, Math.random());
    }

    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uReveal: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uReveal;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec3 p = position;
          p.x += sin(uTime * 0.2 + position.y * 1.4) * 0.03;
          p.y += cos(uTime * 0.16 + position.z * 1.2) * 0.025;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = size * (0.5 + 0.5 * uReveal) * uPixelRatio * (220.0 / -mv.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float uReveal;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float alpha = (smoothstep(0.5, 0.0, d) + smoothstep(0.5, 0.18, d) * 0.35) * (0.4 + 0.6 * uReveal);
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vColor * (0.8 + 0.4 * uReveal), alpha);
        }
      `,
      vertexColors: true,
    });

    const pts = new THREE.Points(geom, mat);
    scene.add(pts);
    return { geom, mat, orbits, phases };
  })();

  const nodeDefs = [
    { pos: [-3.2, 1.05, -0.4], w: 0.9, h: 0.55, mode: "agents" as HeroMode },
    { pos: [1.9, 0.95, 0.6], w: 0.78, h: 0.46, mode: "tools" as HeroMode },
    { pos: [2.6, -0.45, -0.2], w: 0.86, h: 0.5, mode: "agents" as HeroMode },
    { pos: [-2.4, -0.85, 0.3], w: 0.8, h: 0.48, mode: "tools" as HeroMode },
  ];

  const nodes = nodeDefs.map((d, i) => {
    const g = new THREE.Group();
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(d.w, d.h),
      new THREE.MeshPhysicalMaterial({
        color: 0x14110d,
        metalness: 0.4,
        roughness: 0.35,
        transmission: 0.45,
        thickness: 0.4,
        ior: 1.35,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        emissive: COLOR.amberDeep,
        emissiveIntensity: 0.06,
      }),
    );
    g.add(plate);

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x5a4a36,
      metalness: 0.95,
      roughness: 0.28,
      emissive: COLOR.amberDeep,
      emissiveIntensity: 0.12,
    });
    const ft = 0.006;
    [
      [d.w, ft, 0, d.h / 2],
      [d.w, ft, 0, -d.h / 2],
      [ft, d.h, d.w / 2, 0],
      [ft, d.h, -d.w / 2, 0],
    ].forEach(([w, h, x, y]) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w as number, h as number), frameMat);
      mesh.position.x = x as number;
      mesh.position.y = y as number;
      g.add(mesh);
    });

    const corner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.1, 0.005),
      new THREE.MeshBasicMaterial({ color: COLOR.amber }),
    );
    corner.position.set(-d.w / 2 + 0.06, -d.h / 2 + 0.014, 0.001);
    g.add(corner);

    g.position.set(d.pos[0], d.pos[1], d.pos[2]);
    g.lookAt(0, 0, 7);
    g.userData = { basePos: [...d.pos], phase: Math.random() * Math.PI * 2, index: i, mode: d.mode, plate, frameMat, corner };
    scene.add(g);
    return g;
  });

  const nodeLabelEls = Array.from(document.querySelectorAll<HTMLElement>(".node-label"));
  const copyEl = document.querySelector<HTMLElement>(".hud__copy");
  const titleEl = document.querySelector<HTMLElement>(".hud__title");
  const descEl = document.querySelector<HTMLElement>(".hud__desc");
  const identityEl = document.querySelector<HTMLElement>(".hud__identity");
  const readApertureEl = document.getElementById("readAperture");
  const readFrameEl = document.getElementById("readFrame");
  const readStateEl = document.getElementById("readState");
  const tcBarEl = document.getElementById("tcBar");
  const tcTextEl = document.getElementById("tcText");
  const scrollHintEl = document.getElementById("scrollHint");

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.18,
    0.35,
    0.92,
  );
  composer.addPass(bloomPass);

  const finalShader = {
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uAberration: { value: 0.0025 },
      uVignette: { value: 0.85 },
      uGrain: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform float uAberration;
      uniform float uVignette;
      uniform float uGrain;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = vUv;
        vec2 c = uv - 0.5;
        float d = length(c);
        float ab = uAberration * smoothstep(0.28, 0.85, d);
        vec3 col;
        col.r = texture2D(tDiffuse, uv + c * ab).r;
        col.g = texture2D(tDiffuse, uv).g;
        col.b = texture2D(tDiffuse, uv - c * ab).b;
        float vig = 1.0 - smoothstep(0.32, 0.95, d) * uVignette;
        col *= mix(vec3(1.0), vec3(0.94, 0.92, 0.90), 1.0 - vig);
        col *= vig;
        float lum = dot(col, vec3(0.299, 0.587, 0.114));
        float grain = (rand(uv * uResolution + uTime * 47.0) - 0.5) * uGrain * mix(1.4, 0.6, smoothstep(0.0, 0.5, lum));
        col += grain;
        col += vec3(0.012, 0.006, 0.0) * (1.0 - lum);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  };
  const finalPass = new ShaderPass(finalShader);
  composer.addPass(finalPass);
  composer.addPass(new OutputPass());

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const tmpV = new THREE.Vector3();
  const clock = new THREE.Clock();
  let lastFrameTime = performance.now();
  let disposed = false;
  let currentMode: HeroMode = "default";
  let nextMode: HeroMode = "default";
  let enterBlend = 0;
  let exitBlend = 1;
  let scrollProgressRef = 0;

  function updateNodeLabels(progress: number) {
    const reveal = smoothstep(0.62, 0.95, progress);
    nodes.forEach((node, index) => {
      const el = nodeLabelEls[index];
      if (!el) return;
      tmpV.copy(node.position);
      tmpV.project(camera);
      const x = (tmpV.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-tmpV.y * 0.5 + 0.5) * window.innerHeight;
      el.style.left = `${x}px`;
      el.style.top = `${y + 36}px`;
      el.classList.toggle("is-visible", reveal > 0.5 && tmpV.z < 1);
    });
  }

  function update(progress: number, mode: HeroMode, mouseX: number, mouseY: number) {
    if (disposed) return;

    scrollProgressRef = progress;
    mouse.tx = mouseX;
    mouse.ty = mouseY;
    if (mode !== nextMode) {
      currentMode = nextMode;
      nextMode = mode;
      enterBlend = 0;
      exitBlend = 1;
    }

    const t = clock.getElapsedTime();
    const p = scrollProgressRef;

    const now = performance.now();
    const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
    lastFrameTime = now;

    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    enterBlend += (1 - enterBlend) * Math.min(1, 5.0 * dt);
    exitBlend += (0 - exitBlend) * Math.min(1, 5.0 * dt);

    const filmBlend = nextMode === "film" ? enterBlend : (currentMode === "film" ? exitBlend : 0);
    const toolsBlend = nextMode === "tools" ? enterBlend : (currentMode === "tools" ? exitBlend : 0);
    const agentsBlend = nextMode === "agents" ? enterBlend : (currentMode === "agents" ? exitBlend : 0);

    keyLight.intensity = 4.2 + filmBlend * 0.65 + agentsBlend * 0.35 - toolsBlend * 0.2;
    rimLight.intensity = 2.0 + toolsBlend * 1.25 - agentsBlend * 0.2;
    coreLight.color.copy(toolsBlend > 0 ? COLOR.cyan : agentsBlend > 0 ? COLOR.amber : COLOR.cream);

    const dolly = lerp(7.2, 5.8, smoothstep(0, 1, p)) - filmBlend * 0.12;
    camera.position.set(
      Math.sin(t * 0.06) * 0.12 + mouse.x * 1.8,
      0.2 + Math.cos(t * 0.045) * 0.08 + mouse.y * -1.1,
      dolly,
    );
    camera.lookAt(0.8 + mouse.x * 0.15, 0.0 + mouse.y * 0.05, 0);

    engine.rotation.y = Math.sin(t * 0.08) * 0.05 + mouse.x * 0.06;
    engine.rotation.x = Math.cos(t * 0.06) * 0.03 + mouse.y * 0.04;

    const apertureT = smoothstep(0.22, 0.6, p);
    rings.forEach((ring, i) => {
      ring.rotation.z = t * (0.04 + i * 0.012) * (i % 2 ? 1 : -1);
      (ring.material as THREE.MeshStandardMaterial).emissiveIntensity =
        ring.userData.baseEmissive + smoothstep(0.15, 0.55, p) * (0.12 + i * 0.08);
    });

    blades.forEach((blade, i) => {
      const rot = blade.userData.angle + lerp(Math.PI * 0.42, Math.PI * 0.08, apertureT);
      blade.rotation.z = rot + t * (0.55 + apertureT * 0.35) + Math.sin(t * 0.3 + i) * 0.005;
      const offset = lerp(0.0, 0, apertureT);
      blade.position.x = Math.cos(blade.userData.angle) * offset;
      blade.position.y = Math.sin(blade.userData.angle) * offset;
    });

    const coreReveal = smoothstep(0, 0.45, p);
    (coreSprite.material as THREE.SpriteMaterial).opacity = 0.55 + 0.45 * coreReveal + enterBlend * 0.12;
    coreSprite.scale.setScalar(1.4 + coreReveal * 0.6 + Math.sin(t * 1.2) * 0.04 + filmBlend * 0.14 + agentsBlend * 0.08);
    coreLight.intensity = lerp(0.3, 2.4, coreReveal) + filmBlend * 0.9 + toolsBlend * 0.24 + agentsBlend * 0.52;
    (flareSprite.material as THREE.SpriteMaterial).opacity =
      smoothstep(0.35, 0.85, p) * 0.12 + filmBlend * 0.08 + toolsBlend * 0.04 + agentsBlend * 0.06;

    layoutFilm(p, t + filmBlend * 1.5);

    const positions = particles.geom.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      particles.phases[i] += particles.orbits[i * 3 + 2] * (0.01 + filmBlend * 0.004 + agentsBlend * 0.002);
      const r = particles.orbits[i * 3];
      const inc = particles.orbits[i * 3 + 1];
      const a = particles.phases[i];
      const toolBias = toolsBlend * Math.sin(i * 0.28 + t * 0.8) * 0.12;
      const agentLift = agentsBlend * Math.cos(i * 0.19 + t * 0.55) * 0.08;
      positions[i * 3] = Math.cos(a) * (r + toolBias);
      positions[i * 3 + 1] = Math.sin(inc) * r * 0.7 + Math.sin(t * 0.4 + i * 0.3) * 0.05 + agentLift;
      positions[i * 3 + 2] = Math.sin(a) * r * 0.6 + toolsBlend * Math.cos(i * 0.17 + t * 0.5) * 0.08;
    }
    particles.geom.attributes.position.needsUpdate = true;
    particles.mat.uniforms.uTime.value = t;
    particles.mat.uniforms.uReveal.value = smoothstep(0, 0.7, p) + filmBlend * 0.1 + toolsBlend * 0.06;

    nodes.forEach((node, i) => {
      const base = node.userData.basePos as number[];
      const nodeMode = node.userData.mode as HeroMode;
      const isActiveNode = (nextMode === "tools" || nextMode === "agents") ? nodeMode === nextMode : false;
      const modePush = isActiveNode ? enterBlend : 0;
      node.position.x = base[0] + Math.sin(t * 0.4 + node.userData.phase) * (0.04 + modePush * 0.06);
      node.position.y = base[1] + Math.cos(t * 0.3 + node.userData.phase) * (0.05 + modePush * 0.04);
      node.position.z = base[2] + Math.sin(t * 0.25 + node.userData.phase) * 0.03 + (isActiveNode ? modePush * 0.18 : 0);
      node.rotation.z = Math.sin(t * 0.2 + i) * 0.015 + (isActiveNode ? Math.sin(t * 0.7 + i) * 0.06 * modePush : 0);
      const start = 0.55 + i * 0.06;
      const reveal = smoothstep(start, start + 0.18, p);
      let visibleAmount = reveal;
      if (nextMode === "tools" || nextMode === "agents") {
        visibleAmount = isActiveNode ? reveal * (1 - enterBlend) + enterBlend : reveal * (1 - enterBlend * 0.82);
      } else if (currentMode === "tools" || currentMode === "agents") {
        const wasActive = nodeMode === currentMode;
        visibleAmount = wasActive ? reveal * (1 - exitBlend) + exitBlend : reveal * (1 - exitBlend * 0.82);
      }
      const plate = node.userData.plate as THREE.Mesh;
      const frameMat = node.userData.frameMat as THREE.MeshStandardMaterial;
      const corner = node.userData.corner as THREE.Mesh;
      const plateMat = plate.material as THREE.MeshPhysicalMaterial;
      const accentColor = nextMode === "tools" ? COLOR.cyan : nextMode === "agents" ? COLOR.amber : COLOR.amberDeep;
      plateMat.emissive.copy(accentColor);
      plateMat.emissiveIntensity = 0.06 + modePush * (nextMode === "tools" ? 0.18 : nextMode === "agents" ? 0.24 : 0);
      frameMat.emissive.copy(accentColor);
      frameMat.emissiveIntensity = 0.12 + modePush * 0.2;
      (corner.material as THREE.MeshBasicMaterial).color.copy(accentColor);
      node.scale.setScalar(Math.max(visibleAmount * (1 + modePush * 0.18), 0.001));
      node.visible = visibleAmount > 0.01;
    });

    updateNodeLabels(p);

    bloomPass.strength = lerp(0.34, 0.58, p) + filmBlend * 0.22 - toolsBlend * 0.04 + agentsBlend * 0.08;
    finalShader.uniforms.uTime.value = t;
    finalShader.uniforms.uAberration.value = 0.0018 + smoothstep(0.3, 0.7, p) * 0.0024 + filmBlend * 0.0012 + toolsBlend * 0.00035;
    finalShader.uniforms.uGrain.value = 0.0;

    const bloomRise = smoothstep(0.4, 0.8, p);
    if (copyEl) {
      copyEl.style.setProperty("--copy-bg-opacity", (bloomRise * 0.62).toFixed(3));
      copyEl.style.setProperty("--copy-blur", `${(bloomRise * 6).toFixed(1)}px`);
    }
    if (titleEl && bloomRise > 0.01) {
      const shadowAlpha = (bloomRise * 0.75).toFixed(2);
      const shadowSize = Math.round(bloomRise * 18);
      titleEl.style.textShadow = `0 0 ${shadowSize}px rgba(8,6,4,${shadowAlpha}), 0 2px ${shadowSize * 2}px rgba(8,6,4,${shadowAlpha})`;
    }
    const shadowStr = bloomRise > 0.01
      ? `0 1px ${Math.round(bloomRise * 10)}px rgba(8,6,4,${(bloomRise * 0.85).toFixed(2)})`
      : "none";
    if (descEl) descEl.style.textShadow = shadowStr;
    if (identityEl) identityEl.style.textShadow = shadowStr;

    const aperture = lerp(8, 1.4, apertureT);
    if (readApertureEl) readApertureEl.textContent = `f / ${aperture.toFixed(1)}`;
    if (readFrameEl) {
      const frame = Math.floor(t * 24) % 100000;
      readFrameEl.textContent = `${String(Math.floor((frame / 1440) % 60)).padStart(2, "0")}:${String(Math.floor((frame / 24) % 60)).padStart(2, "0")} : ${String(frame % 24).padStart(2, "0")}`;
    }
    if (readStateEl) {
      let state = "Idle · standby";
      if (p > 0.18 && p < 0.55) state = "Calibrating · iris";
      else if (p >= 0.55 && p < 0.78) state = "Streaming · orbit";
      else if (p >= 0.78 && currentMode === "film") state = "Film cue · exposure";
      else if (p >= 0.78 && currentMode === "tools") state = "Tools cue · systems";
      else if (p >= 0.78 && currentMode === "agents") state = "Agents cue · orchestration";
      else if (p >= 0.78) state = "Engine online";
      readStateEl.textContent = state;
    }
    if (tcBarEl) tcBarEl.style.setProperty("--progress", `${(p * 100).toFixed(1)}%`);
    if (tcTextEl) tcTextEl.textContent = `${String(Math.floor(p * 100)).padStart(2, "0")} / 100`;
    if (scrollHintEl) scrollHintEl.style.opacity = String(clamp(1 - p * 4, 0, 1));

    composer.render();
  }

  function resize(w: number, h: number) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    finalShader.uniforms.uResolution.value.set(w, h);
  }

  function dispose() {
    disposed = true;
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material;
      if (material) {
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material.dispose();
      }
    });
    composer.passes.forEach((pass: { dispose?: () => void }) => pass.dispose?.());
    renderer.dispose();
  }

  composer.render();

  return { update, resize, dispose };
}