# V2 Website Image Asset Checklist

All images needed for the ai.drsfilms.com v2 upgrade. Each item includes a placeholder in the code — drop your file into `public/` and update the path in `src/data/site.ts`.

---

## 1. Product Screenshots — 02 What I Built

### 1a. AI Film Studio Screenshot
- **File:** `public/images/ai-film-studio.png`
- **Dimensions:** 16:10 ratio (e.g. 1280 × 800px)
- **Style:** Dark theme, gate pipeline dashboard showing G0-G7 gates
- **Used in:** WhatIBuilt component, Product #1

### 1b. Budget Studio Screenshot
- **File:** `public/images/budget-studio.png`
- **Dimensions:** 16:10 ratio (e.g. 1280 × 800px)
- **Style:** Dark theme, budget interface with contingency/fringe calculation
- **Used in:** WhatIBuilt component, Product #2

### 1c. Prompt Builder Screenshot
- **File:** `public/images/prompt-builder.png`
- **Dimensions:** 16:10 ratio (e.g. 1280 × 800px)
- **Style:** Dark theme, prompt input interface with film-grade presets
- **Used in:** WhatIBuilt component, Product #3

---

## 2. Brand Logos — 01 Track Record

**Directory:** `public/images/logos/brands/`
**Dimensions:** ~80 × 80px each (square, PNG with transparency, monochrome/white)
**Style:** White or light gray logos on transparent background — will be grayscale in code, gold on hover

**Required logos:**
- [ ] `nike.png`
- [ ] `tencent.png`
- [ ] `riot.png`
- [ ] `loreal.png`
- [ ] `bmw.png`
- [ ] `mihoyo.png`
- [ ] `mercedes.png`
- [ ] `audi.png`

**Source:** Download from [Simple Icons](https://simpleicons.org/) or official brand kits

---

## 3. Film Poster — 03 Films

### 3a. Brief History of A Family Poster
- **File:** `public/images/film-poster.jpg`
- **Dimensions:** 2:3 ratio (e.g. 480 × 720px)
- **Style:** Official movie poster or festival still from "Brief History of A Family"
- **Used in:** Films component, top section

---

## 4. AI Video Thumbnails — 03 Films

### 4a. HOME MANGA Thumbnail
- **File:** `public/images/home-manga-thumb.jpg`
- **Dimensions:** 16:9 ratio (e.g. 640 × 360px)
- **Style:** Anime-style frame from the HOME MANGA video
- **Used in:** Films component, bottom left

### 4b. HOME Live-Action Thumbnail
- **File:** `public/images/home-liveaction-thumb.jpg`
- **Dimensions:** 16:9 ratio (e.g. 640 × 360px)
- **Style:** Cinematic realism frame from the HOME live-action video
- **Used in:** Films component, bottom right

---

## 5. Tool Logos — 04 Tool Stack

**Directory:** `public/images/logos/tools/`
**Dimensions:** ~60 × 60px each (square, PNG with transparency, monochrome/white)
**Style:** White or light gray logos on transparent background — will be grayscale in code, gold on hover

**Required logos (25 total):**

AI Orchestration:
- [ ] `claude.png` — Anthropic Claude
- [ ] `cursor.png` — Cursor
- [ ] `openspec.png` — OpenSpec
- [ ] `discord.png` — Discord

Video:
- [ ] `runway.png` — Runway ML
- [ ] `higgsfield.png` — Higgsfield
- [ ] `seedance.png` — Seedance
- [ ] `kling.png` — Kling
- [ ] `minimax.png` — MiniMax
- [ ] `invideo.png` — InVideo

Image:
- [ ] `midjourney.png` — Midjourney
- [ ] `flux.png` — Flux (Black Forest Labs)
- [ ] `nanobanana.png` — Nano Banana
- [ ] `freepik.png` — Freepik
- [ ] `dreamina.png` — Dreamina

Audio:
- [ ] `elevenlabs.png` — ElevenLabs
- [ ] `suno.png` — Suno AI
- [ ] `xiaomimimo.png` — XiaoMiMiMo

Build Stack:
- [ ] `nextjs.png` — Next.js
- [ ] `react.png` — React
- [ ] `typescript.png` — TypeScript
- [ ] `supabase.png` — Supabase
- [ ] `vercel.png` — Vercel
- [ ] `cloudflare.png` — Cloudflare
- [ ] `github.png` — GitHub

---

## 6. Architecture Diagram — 05 System Thinking

### 6a. OpenClaw SVG
- **File:** `public/images/OpenClaw-Agent-Control-v1.svg`
- **Style:** Existing SVG — just needs to be copied into public/images/
- **Used in:** SystemThinking component

---

## Summary

| # | Asset | Count | Section |
|---|-------|-------|---------|
| 1 | Product screenshots | 3 | 02 What I Built |
| 2 | Brand logos | 8 | 01 Track Record |
| 3 | Film poster | 1 | 03 Films |
| 4 | Video thumbnails | 2 | 03 Films |
| 5 | Tool logos | 25 | 04 Tool Stack |
| 6 | Architecture SVG | 1 | 05 System Thinking |
| **Total** | | **40 files** | |

---

## Priority

| Priority | Assets | Impact | Effort |
|----------|--------|--------|--------|
| P0 | Product screenshots (3) | Highest — core proof | Medium — need to run apps |
| P0 | Film poster (1) | High — validates film credentials | Low — use existing |
| P1 | Brand logos (8) | High — credibility signal | Low — Simple Icons |
| P1 | Video thumbnails (2) | Medium — shows AI film range | Low — export from video |
| P2 | Tool logos (25) | Medium — industry knowledge | Low — Simple Icons |
| P2 | OpenClaw SVG (1) | Low — already exists | Trivial — copy file |

---

## How to Use

1. Prepare the images at the specified dimensions
2. Place them in `public/images/` following the directory structure above
3. Tell me which files you've added, and I'll update the placeholder divs to real `<img>` tags in `src/data/site.ts`
