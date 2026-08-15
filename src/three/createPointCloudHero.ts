import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/* ════════════════════════════════════════════════════════════════
   HERO · POINT-CLOUD MORPH
   Ported from the "Hero.html" / hero-cloud.module.js design authored in
   Claude Design (project "ai portfolio"). One particle system,
   continuously reassembled between five forms:
     0 · LENS    — an eye that is a camera aperture
     1 · APERTURE— mechanical iris diaphragm
     2 · REEL    — film strip + sprockets
     3 · SIGNAL  — audio waveform / spectrogram
     4 · NETWORK — multi-agent node-link constellation
   With no form pinned, the cloud auto-cycles through all five. Clicking
   one of the five hero-state buttons (App.tsx) pins the cloud on that
   form. Scroll progress drives camera dolly and fade-out; the cursor
   repels particles.
═════════════════════════════════════════════════════════════════ */

export type HeroForm = 0 | 1 | 2 | 3 | 4;

interface HeroScene {
  update: (progress: number, pinnedForm: HeroForm | null, mouseX: number, mouseY: number) => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
}

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const rnd = () => Math.random();
const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;

const COL = {
  amber: new THREE.Color("#e3a868"),
  amberD: new THREE.Color("#b07a42"),
  cyan: new THREE.Color("#7fb5c8"),
  cyanD: new THREE.Color("#4f7e8f"),
  cream: new THREE.Color("#fff4dc"),
  bg: new THREE.Color("#0c0a08"),
};

type FormBuffers = { p: Float32Array; c: Float32Array };

function setC(arr: Float32Array, i: number, c: THREE.Color) {
  arr[i * 3] = c.r;
  arr[i * 3 + 1] = c.g;
  arr[i * 3 + 2] = c.b;
}

/* ── FORM 0 · THE LENS — an eye that is a camera aperture ────────── */
function buildFrame(N: number): FormBuffers {
  const p = new Float32Array(N * 3);
  const c = new Float32Array(N * 3);
  const Riris = 0.52;
  const Rpup = 0.19;
  const cornerX = 1.55;
  const cy = 0.14;
  const upper = (u: number) => 0.82 * Math.pow(Math.max(0, 1 - u * u), 0.6);
  const lower = (u: number) => -0.54 * Math.pow(Math.max(0, 1 - u * u), 0.82);
  for (let i = 0; i < N; i++) {
    let x = 0;
    let y = 0;
    const z = (rnd() - 0.5) * 0.1;
    let col: THREE.Color;
    const r = rnd();
    if (r < 0.2) {
      const u = rnd() * 2 - 1;
      x = u * cornerX;
      const crease = rnd() < 0.32;
      y = upper(u) + (crease ? 0.13 + gauss() * 0.03 : gauss() * 0.011);
      col = crease ? COL.amberD.clone() : COL.cream.clone().lerp(COL.amber, rnd() * 0.4);
    } else if (r < 0.33) {
      const u = rnd() * 2 - 1;
      x = u * cornerX;
      y = lower(u) + gauss() * 0.011;
      col = COL.amber.clone().lerp(COL.amberD, rnd() * 0.6);
    } else if (r < 0.39) {
      const side = rnd() < 0.5 ? 1 : -1;
      const u = side * (0.85 + rnd() * 0.14);
      x = u * cornerX;
      y = (upper(u) + lower(u)) * 0.5 + gauss() * 0.04;
      col = COL.amberD.clone();
    } else if (r < 0.7) {
      const a = rnd() * TAU;
      const rr = Rpup + Math.pow(rnd(), 0.85) * (Riris - Rpup);
      const wob = (rnd() - 0.5) * 0.03;
      x = Math.cos(a) * rr + Math.cos(a + 1.57) * wob;
      y = cy + Math.sin(a) * rr + Math.sin(a + 1.57) * wob;
      col = COL.amber.clone().lerp(COL.amberD, ((rr - Rpup) / (Riris - Rpup)) * 0.7);
    } else if (r < 0.8) {
      const isLimbus = rnd() < 0.66;
      const ring = isLimbus ? Riris : Riris * 0.64;
      const a = rnd() * TAU;
      x = Math.cos(a) * ring + gauss() * 0.011;
      y = cy + Math.sin(a) * ring + gauss() * 0.011;
      col = isLimbus ? COL.cream.clone() : COL.amber.clone();
    } else if (r < 0.88) {
      const a = rnd() * TAU;
      x = Math.cos(a) * Rpup + gauss() * 0.01;
      y = cy + Math.sin(a) * Rpup + gauss() * 0.01;
      col = COL.cream.clone();
    } else if (r < 0.93) {
      x = -0.16 + gauss() * 0.06;
      y = cy + 0.17 + gauss() * 0.06;
      col = COL.cream.clone();
    } else {
      const u = (rnd() * 2 - 1) * 0.95;
      const lo = lower(u);
      const hi = upper(u);
      x = u * cornerX;
      y = lo + rnd() * (hi - lo);
      if (x * x + (y - cy) * (y - cy) < Riris * 1.1 * (Riris * 1.1)) {
        i--;
        continue;
      }
      col = COL.amberD.clone().multiplyScalar(0.5);
    }
    p[i * 3] = x;
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = z;
    setC(c, i, col);
  }
  return { p, c };
}

/* ── FORM 1 · APERTURE — mechanical iris diaphragm ──────────────── */
function buildField(N: number): FormBuffers {
  const p = new Float32Array(N * 3);
  const c = new Float32Array(N * 3);
  const blades = 8;
  const seg = TAU / blades;
  const Rop = 0.58;
  const Rbarrel = 1.34;
  for (let i = 0; i < N; i++) {
    let x = 0;
    let y = 0;
    const z = (rnd() - 0.5) * 0.1;
    let col: THREE.Color;
    const r = rnd();
    if (r < 0.34) {
      const k = Math.floor(rnd() * blades);
      const a0 = k * seg;
      const a1 = (k + 1) * seg;
      const t = rnd();
      x = lerp(Math.cos(a0) * Rop, Math.cos(a1) * Rop, t) + gauss() * 0.012;
      y = lerp(Math.sin(a0) * Rop, Math.sin(a1) * Rop, t) + gauss() * 0.012;
      col = COL.cream.clone().lerp(COL.amber, rnd() * 0.5);
    } else if (r < 0.7) {
      const k = Math.floor(rnd() * blades);
      const a = k * seg;
      const vx = Math.cos(a) * Rop;
      const vy = Math.sin(a) * Rop;
      const t = Math.pow(rnd(), 0.9);
      const ang = a + 1.15;
      const push = 1 + t * 0.18;
      x = (vx + Math.cos(ang) * t * 0.95) * push + gauss() * 0.02;
      y = (vy + Math.sin(ang) * t * 0.95) * push + gauss() * 0.02;
      col = COL.amber.clone().lerp(COL.amberD, t * 0.8);
    } else if (r < 0.84) {
      const a = rnd() * TAU;
      const rr = Rbarrel + gauss() * 0.03;
      x = Math.cos(a) * rr;
      y = Math.sin(a) * rr;
      col = COL.amberD.clone();
    } else if (r < 0.92) {
      const ticks = 24;
      const k = Math.floor(rnd() * ticks);
      const major = k % 3 === 0;
      const a = (k / ticks) * TAU;
      const rr = Rbarrel + 0.08 + rnd() * 0.1 * (major ? 1.6 : 1);
      x = Math.cos(a) * rr;
      y = Math.sin(a) * rr;
      col = major ? COL.cream.clone() : COL.amber.clone();
    } else {
      const a = rnd() * TAU;
      const rr = Rop + rnd() * (Rbarrel - Rop);
      x = Math.cos(a) * rr;
      y = Math.sin(a) * rr;
      col = COL.amberD.clone().multiplyScalar(0.45);
    }
    p[i * 3] = x;
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = z;
    setC(c, i, col);
  }
  return { p, c };
}

/* ── FORM 2 · REEL — film strip + sprockets ─────────────────────── */
function buildReel(N: number): FormBuffers {
  const p = new Float32Array(N * 3);
  const c = new Float32Array(N * 3);
  const halfW = 2.45;
  const railY = 0.62;
  const frameTop = 0.42;
  const dividers = [-2.45, -1.47, -0.49, 0.49, 1.47, 2.45];
  for (let i = 0; i < N; i++) {
    let x = 0;
    let y = 0;
    const z = (rnd() - 0.5) * 0.1;
    let col: THREE.Color;
    const r = rnd();
    if (r < 0.18) {
      const side = rnd() < 0.5 ? 1 : -1;
      x = (rnd() * 2 - 1) * halfW;
      y = side * railY + gauss() * 0.012;
      col = COL.cream.clone().lerp(COL.amber, rnd() * 0.4);
    } else if (r < 0.48) {
      const side = rnd() < 0.5 ? 1 : -1;
      const holes = 14;
      const k = Math.floor(rnd() * holes);
      const hx = -halfW + (k + 0.5) * ((2 * halfW) / holes);
      const hw = 0.085;
      const hh = 0.07;
      if (rnd() < 0.5) {
        x = hx + (rnd() * 2 - 1) * hw;
        y = side * 0.5 + (rnd() < 0.5 ? hh : -hh);
      } else {
        x = hx + (rnd() < 0.5 ? hw : -hw);
        y = side * 0.5 + (rnd() * 2 - 1) * hh;
      }
      col = COL.amber.clone().lerp(COL.amberD, rnd() * 0.5);
    } else if (r < 0.62) {
      const dx = dividers[Math.floor(rnd() * dividers.length)];
      x = dx + gauss() * 0.012;
      y = (rnd() * 2 - 1) * frameTop;
      col = COL.amberD.clone();
    } else {
      x = (rnd() * 2 - 1) * halfW;
      y = (rnd() * 2 - 1) * frameTop * 0.92;
      col = COL.amberD.clone().multiplyScalar(0.4 + rnd() * 0.35);
    }
    p[i * 3] = x;
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = z;
    setC(c, i, col);
  }
  return { p, c };
}

/* ── FORM 3 · SIGNAL — audio waveform / spectrogram ─────────────── */
function buildWave(N: number): FormBuffers {
  const p = new Float32Array(N * 3);
  const c = new Float32Array(N * 3);
  const halfW = 2.45;
  const nbars = 74;
  const amp = (k: number) => {
    const w = Math.pow(Math.max(0, 1 - k * k), 0.4);
    return w * (0.16 + 0.84 * Math.abs(Math.sin(k * 7.0) * 0.6 + Math.sin(k * 17.0 + 1.0) * 0.3 + Math.sin(k * 3.0) * 0.4));
  };
  for (let i = 0; i < N; i++) {
    let x = 0;
    let y = 0;
    const z = (rnd() - 0.5) * 0.1;
    let col: THREE.Color;
    if (rnd() < 0.11) {
      x = (rnd() * 2 - 1) * halfW;
      y = gauss() * 0.012;
      col = COL.cream.clone();
    } else {
      const bk = Math.floor(rnd() * nbars);
      const kx = ((bk + 0.5) / nbars) * 2 - 1;
      const A = amp(kx) * 1.18;
      x = kx * halfW + gauss() * 0.012;
      const yy = (rnd() * 2 - 1) * A;
      y = yy;
      const tip = Math.abs(yy) / (A + 0.0001);
      col = COL.amber.clone().lerp(COL.cyan, clamp(kx * 0.5 + 0.5, 0, 1) * 0.7).lerp(COL.cream, tip * 0.45);
    }
    p[i * 3] = x;
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = z;
    setC(c, i, col);
  }
  return { p, c };
}

/* ── FORM 4 · NETWORK — multi-agent constellation ───────────────── */
function buildNetwork(N: number): FormBuffers {
  const p = new Float32Array(N * 3);
  const c = new Float32Array(N * 3);
  const inner = 6;
  const outer = 11;
  const R1 = 1.28;
  const R2 = 2.42;
  const nodes: [number, number, number][] = [[0, 0, 0]];
  for (let k = 0; k < inner; k++) {
    const a = (k / inner) * TAU + 0.2;
    nodes.push([Math.cos(a) * R1, Math.sin(a) * R1 * 0.82, (rnd() - 0.5) * 0.5]);
  }
  for (let k = 0; k < outer; k++) {
    const a = (k / outer) * TAU;
    const rr = R2 * (0.86 + rnd() * 0.22);
    nodes.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.78, (rnd() - 0.5) * 0.7]);
  }
  const innerStart = 1;
  const outerStart = 1 + inner;
  const edges: [number, number][] = [];
  for (let k = 0; k < inner; k++) edges.push([0, innerStart + k]);
  for (let k = 0; k < inner; k++) edges.push([innerStart + k, innerStart + ((k + 1) % inner)]);
  for (let k = 0; k < outer; k++) edges.push([innerStart + (k % inner), outerStart + k]);
  for (let k = 0; k < outer; k += 2) edges.push([outerStart + k, outerStart + ((k + 1) % outer)]);
  for (let i = 0; i < N; i++) {
    let x = 0;
    let y = 0;
    let z = 0;
    let col: THREE.Color;
    if (rnd() < 0.46) {
      let ni: number;
      const q = rnd();
      if (q < 0.14) ni = 0;
      else if (q < 0.55) ni = innerStart + Math.floor(rnd() * inner);
      else ni = outerStart + Math.floor(rnd() * outer);
      const n = nodes[ni];
      const s = ni === 0 ? 0.26 : ni < outerStart ? 0.17 : 0.12;
      x = n[0] + gauss() * s;
      y = n[1] + gauss() * s;
      z = n[2] + gauss() * s;
      col =
        ni === 0
          ? COL.cream.clone()
          : ni < outerStart
            ? COL.cream.clone().lerp(COL.cyan, 0.4 + rnd() * 0.4)
            : COL.cyan.clone().lerp(COL.cyanD, rnd() * 0.5);
    } else {
      const e = edges[Math.floor(rnd() * edges.length)];
      const a = nodes[e[0]];
      const b = nodes[e[1]];
      const t = rnd();
      x = lerp(a[0], b[0], t) + gauss() * 0.04;
      y = lerp(a[1], b[1], t) + gauss() * 0.04;
      z = lerp(a[2], b[2], t) + gauss() * 0.04;
      col = COL.cyan.clone().lerp(COL.cyanD, 0.3 + rnd() * 0.5);
    }
    p[i * 3] = x;
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = z;
    setC(c, i, col);
  }
  return { p, c };
}

export function createPointCloudHero(canvas: HTMLCanvasElement): HeroScene {
  const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mob = window.matchMedia("(max-width: 860px)").matches;
  const N = mob ? 4200 : 12000;

  const hasCopy = !!document.querySelector(".hud__copy");
  const OFF = new THREE.Vector3(mob || !hasCopy ? 0 : 0.82, 0.04, 0);

  const F0 = buildFrame(N);
  const F1 = buildField(N);
  const F2 = buildReel(N);
  const F3 = buildWave(N);
  const F4 = buildNetwork(N);
  const SCALE = 1.45;
  [F0, F1, F2, F3, F4].forEach((F) => {
    for (let i = 0; i < F.p.length; i++) F.p[i] *= SCALE;
  });
  const seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) seeds[i] = rnd();

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mob, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mob ? 1.3 : 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(COL.bg, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 60);
  camera.position.set(0, 0.12, 5.7);
  camera.lookAt(0, 0, 0);

  const cloud = new THREE.Group();
  cloud.position.copy(OFF);
  scene.add(cloud);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(F0.p.slice(), 3));
  geo.setAttribute("p0", new THREE.BufferAttribute(F0.p, 3));
  geo.setAttribute("p1", new THREE.BufferAttribute(F1.p, 3));
  geo.setAttribute("p2", new THREE.BufferAttribute(F2.p, 3));
  geo.setAttribute("p3", new THREE.BufferAttribute(F3.p, 3));
  geo.setAttribute("p4", new THREE.BufferAttribute(F4.p, 3));
  geo.setAttribute("c0", new THREE.BufferAttribute(F0.c, 3));
  geo.setAttribute("c1", new THREE.BufferAttribute(F1.c, 3));
  geo.setAttribute("c2", new THREE.BufferAttribute(F2.c, 3));
  geo.setAttribute("c3", new THREE.BufferAttribute(F3.c, 3));
  geo.setAttribute("c4", new THREE.BufferAttribute(F4.c, 3));
  geo.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 9);

  const uniforms = {
    uForm: { value: 0 },
    uTime: { value: 0 },
    uPR: { value: renderer.getPixelRatio() },
    uReveal: { value: 0 },
    uBillow: { value: 0.85 },
    uMouse: { value: new THREE.Vector3(999, 999, 0) },
    uMouseR: { value: 0.72 },
    uMouseS: { value: 0 },
    uFade: { value: 1 },
  };

  const ptsMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
    vertexShader: `
      attribute vec3 p0,p1,p2,p3,p4,c0,c1,c2,c3,c4; attribute float seed;
      uniform float uForm,uTime,uPR,uReveal,uBillow,uMouseR,uMouseS,uFade;
      uniform vec3 uMouse;
      varying vec3 vColor; varying float vA;
      float ss(float a,float b,float x){float t=clamp((x-a)/(b-a),0.,1.);return t*t*(3.-2.*t);}
      vec3 pick(float idx, vec3 a0,vec3 a1,vec3 a2,vec3 a3,vec3 a4){
        vec3 r=a0;
        r=mix(r,a1,step(0.5,idx));
        r=mix(r,a2,step(1.5,idx));
        r=mix(r,a3,step(2.5,idx));
        r=mix(r,a4,step(3.5,idx));
        return r;
      }
      void main(){
        float NF=5.0;
        float lo=floor(uForm); float hi=min(lo+1.0,NF-1.0); float bl=ss(0.0,1.0,uForm-lo);
        vec3 pa = pick(lo,p0,p1,p2,p3,p4);
        vec3 pb = pick(hi,p0,p1,p2,p3,p4);
        vec3 ca = pick(lo,c0,c1,c2,c3,c4);
        vec3 cb = pick(hi,c0,c1,c2,c3,c4);
        vec3 pos = mix(pa,pb,bl);
        vColor = mix(ca,cb,bl);
        float bw = sin(3.14159*bl);
        vec3 dir = normalize(vec3(sin(seed*91.7),cos(seed*47.3),sin(seed*13.1))+0.0001);
        pos += dir*bw*(0.35+seed*1.1)*uBillow;
        pos += dir*(1.0-uReveal)*1.4;
        pos.x += sin(uTime*0.55+seed*30.0)*0.022;
        pos.y += cos(uTime*0.47+seed*22.0)*0.022;
        vec2 d = pos.xy-uMouse.xy; float dl=length(d);
        float fall = exp(-(dl*dl)/(uMouseR*uMouseR));
        vec2 dn = d/(dl+0.0001);
        vec2 perp = vec2(-dn.y, dn.x);
        float mode = floor(uForm+0.5);
        if(mode < 0.5){
          float ripple = sin(dl*15.0 - uTime*5.0);
          pos.xy += dn*fall*ripple*uMouseS*0.34;
          pos.z  += fall*uMouseS*1.15;
        } else if(mode < 1.5){
          float ripple = sin(dl*9.0 - uTime*3.2 + seed*6.28);
          pos.xy += perp*fall*uMouseS*1.35;
          pos.xy -= dn*fall*uMouseS*0.30;
          pos.z  += fall*ripple*uMouseS*0.5;
        } else if(mode < 2.5){
          float judder = sin(uTime*9.0 + seed*6.28);
          pos.x += sign(d.x)*fall*uMouseS*(0.7 + judder*0.22);
          pos.z += fall*uMouseS*0.30;
        } else if(mode < 3.5){
          float w = sin(pos.x*6.0 - uTime*6.0);
          pos.y += fall*uMouseS*w*1.1;
          pos.z += fall*uMouseS*0.30;
        } else {
          pos.xy -= dn*fall*uMouseS*0.95;
          pos.xy += vec2(sin(seed*99.0+uTime*6.0),cos(seed*55.0+uTime*5.0))*fall*uMouseS*0.20;
          pos.z  += fall*uMouseS*0.45;
        }
        vec4 mv = modelViewMatrix*vec4(pos,1.0);
        float sz = 0.085+seed*0.30;
        if(seed>0.93) sz*=1.9;
        gl_PointSize = sz*uPR*(110.0/-mv.z)*(0.5+0.5*uReveal);
        vA = (0.4+0.5*uReveal)*uFade;
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vA;
      void main(){
        vec2 uv = gl_PointCoord-0.5; float d=length(uv);
        float core = smoothstep(0.5,0.0,d);
        float a = core*vA;
        if(a<0.01) discard;
        gl_FragColor = vec4(vColor*1.18, a);
      }`,
  });
  const points = new THREE.Points(geo, ptsMat);
  points.frustumCulled = false;
  cloud.add(points);

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.5, 0.5);
  composer.addPass(bloom);
  const finalShader = {
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uAb: { value: 0.0018 },
      uVig: { value: 1.0 },
      uGrain: { value: 0.024 },
      uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
      uniform sampler2D tDiffuse;uniform float uTime,uAb,uVig,uGrain;uniform vec2 uRes;varying vec2 vUv;
      float rand(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
      void main(){
        vec2 uv=vUv; vec2 c=uv-0.5; float d=length(c);
        float ab=uAb*smoothstep(0.25,0.9,d);
        vec3 col;
        col.r=texture2D(tDiffuse,uv+c*ab).r;
        col.g=texture2D(tDiffuse,uv).g;
        col.b=texture2D(tDiffuse,uv-c*ab).b;
        float vig=1.0-smoothstep(0.42,1.05,d)*0.55*uVig;
        col*=vig;
        float lum=dot(col,vec3(0.299,0.587,0.114));
        col+=(rand(uv*uRes+uTime*47.0)-0.5)*uGrain*mix(1.3,0.5,smoothstep(0.0,0.5,lum));
        gl_FragColor=vec4(col,1.0);
      }`,
  };
  const fpass = new ShaderPass(finalShader);
  composer.addPass(fpass);
  composer.addPass(new OutputPass());

  const copyEl = document.querySelector<HTMLElement>(".hud__copy");
  const titleEl = document.querySelector<HTMLElement>(".hud__title");
  const scrollHintEl = document.getElementById("scrollHint");
  const tcBarEl = document.getElementById("tcBar");
  const tcTextEl = document.getElementById("tcText");
  const stateEls = Array.from(document.querySelectorAll<HTMLElement>(".hero-state"));
  const statesWrapEl = document.getElementById("heroStates");

  const SEQ = [0, 1, 2, 3, 4, 3, 2, 1];
  const DWELL = mob ? 5200 : 4400;
  let seqIdx = 0;
  let targetForm = 0;
  let formF = 0;
  let lastSwitch = performance.now();
  let currentPinRef: HeroForm | null = null;
  let lastActive = -1;

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const started = performance.now();
  let lastFrameTime = started;
  let disposed = false;

  function dollyProgressCamera(progress: number, t: number) {
    const dolly = lerp(5.7, 5.0, smoothstep(0, 1, progress));
    const cx = mouse.x * 0.55 + Math.sin(t * 0.08) * 0.12;
    const cy = 0.15 + mouse.y * 0.4 + Math.cos(t * 0.06) * 0.07;
    camera.position.x += (cx - camera.position.x) * 0.04;
    camera.position.y += (cy - camera.position.y) * 0.04;
    camera.position.z += (dolly - camera.position.z) * 0.04;
    camera.lookAt(OFF.x * 0.6 + mouse.x * 0.18, OFF.y * 0.5 + mouse.y * 0.12, 0);
  }

  function update(progress: number, pinnedForm: HeroForm | null, mouseX: number, mouseY: number) {
    if (disposed) return;

    if (pinnedForm !== currentPinRef) {
      currentPinRef = pinnedForm;
      if (pinnedForm !== null) {
        targetForm = pinnedForm;
        const at = SEQ.indexOf(targetForm);
        if (at >= 0) seqIdx = at;
        lastSwitch = performance.now();
      }
    }

    const now = performance.now();
    const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
    lastFrameTime = now;
    const t = now / 1000;

    if (rm) {
      uniforms.uReveal.value = 1;
    } else {
      uniforms.uReveal.value = smoothstep(0, 1, (now - started) / 1700);
    }
    if (uniforms.uReveal.value > 0.5) statesWrapEl?.classList.add("is-ready");

    if (currentPinRef === null && now - lastSwitch > DWELL) {
      seqIdx = (seqIdx + 1) % SEQ.length;
      targetForm = SEQ[seqIdx];
      lastSwitch = now;
    }
    formF += (targetForm - formF) * Math.min(1, dt * 2.4);
    uniforms.uForm.value = formF;

    const nearest = Math.round(formF);
    if (nearest !== lastActive) {
      lastActive = nearest;
      stateEls.forEach((el) => el.classList.toggle("is-active", Number(el.dataset.form) === nearest));
    }

    mouse.tx = mouseX;
    mouse.ty = mouseY;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    uniforms.uMouseS.value = lerp(uniforms.uMouseS.value, 0.55, 0.06);
    uniforms.uMouse.value.set(mouse.x * 2.4 - OFF.x, mouse.y * 1.6 - OFF.y, 0);

    dollyProgressCamera(progress, t);
    cloud.scale.setScalar(1 + Math.sin(t * 0.5) * 0.012);
    uniforms.uTime.value = t;

    const apAmt = clamp(1 - Math.abs(formF - 1), 0, 1);
    const netAmt = clamp(1 - Math.abs(formF - 4), 0, 1);
    bloom.strength = lerp(bloom.strength, 0.45 + apAmt * 0.14 + netAmt * 0.05, 0.05);
    fpass.uniforms.uTime.value = t;
    uniforms.uFade.value = lerp(uniforms.uFade.value, 1 - smoothstep(0.55, 1, progress) * 0.55, 0.06);

    const rise = smoothstep(0.35, 0.8, progress);
    if (copyEl) {
      copyEl.style.setProperty("--copy-bg-opacity", (rise * 0.6).toFixed(3));
      copyEl.style.setProperty("--copy-blur", `${(rise * 6).toFixed(1)}px`);
    }
    if (titleEl && rise > 0.01) {
      const sz = Math.round(rise * 16);
      titleEl.style.textShadow = `0 0 ${sz}px rgba(8,6,4,${(rise * 0.7).toFixed(2)}),0 2px ${sz * 2}px rgba(8,6,4,${(rise * 0.6).toFixed(2)})`;
    }
    if (scrollHintEl) scrollHintEl.style.opacity = String(clamp(1 - progress * 4, 0, 1));
    if (tcBarEl) tcBarEl.style.setProperty("--progress", `${(progress * 100).toFixed(1)}%`);
    if (tcTextEl) tcTextEl.textContent = `${String(Math.floor(progress * 100)).padStart(2, "0")} / 100`;

    composer.render();
  }

  function resize(w: number, h: number) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    finalShader.uniforms.uRes.value.set(w, h);
    uniforms.uPR.value = renderer.getPixelRatio();
  }

  function dispose() {
    disposed = true;
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
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
