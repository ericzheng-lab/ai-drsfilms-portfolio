## Why

The current site is a generic AI portfolio with 7 project cards that doesn't tell a coherent story for employers. Eric is sending deck v7 to HR contacts, and the deck links to ai.drsfilms.com — but the site's narrative and structure don't match the deck's flow. Employers who open the site after viewing the deck encounter a completely different structure, weakening the unified brand system. The v2 upgrade aligns the site with deck v7's narrative arc, giving employers a deeper, more focused version of the same story.

## What Changes

- **Delete** Showreel section (00) — redundant with Hero
- **Replace** 01 Work (7 project cards) → 01 Track Record: 3 big numbers ($8M+, Sundance, 60+ Countries) + brand logo matrix + company history
- **Replace** 02 AI Studio → 02 What I Built: 3 product screenshots (AI Film Studio, Budget Studio, Prompt Builder) with Live/GitHub links
- **Add** 03 Films (new): Brief History of A Family poster + film info + 2 AI video thumbnails (HOME MANGA / HOME live-action)
- **Replace** 03 AI Stack → 04 Tool Stack: 5 categories (AI Orchestration, Video, Image, Audio, Build Stack) with logo grids
- **Replace** 04 OpenClaw → 05 System Thinking: manifesto + OpenClaw SVG architecture diagram + agent role labels
- **Delete** 05 GitHub section — repo links merge into 02 What I Built buttons and 06 Contact
- **Rewrite** 06 Contact: dual-path layout (Hire Me / Build With Me) with metadata footer
- **Keep** Hero zero-change (CinematicHero.tsx, hero.css, createCinematicHero.ts)

## Capabilities

### New Capabilities

- `track-record-section`: 01 Track Record — three big metrics, brand logo matrix, company history line
- `what-i-built-section`: 02 What I Built — 3 product cards with screenshots, descriptions, and action links
- `films-section`: 03 Films — film poster + info block + 2 AI video thumbnails with play overlay
- `tool-stack-section`: 04 Tool Stack — 5 category groups with monochrome logo grids and hover effects
- `system-thinking-section`: 05 System Thinking — manifesto quote, OpenClaw SVG architecture, agent role annotations
- `contact-section-v2`: 06 Contact — dual-path Hire Me / Build With Me layout with metadata footer
- `site-data-v2`: Restructured site.ts data — new data types for TrackRecord metrics, brand logos, film entries, tool categories

### Modified Capabilities

(none — all existing specs are replaced by new capabilities)

## Impact

- **Core files**: `src/App.tsx` (major refactor — 6 section components rewritten, 2 deleted), `src/data/site.ts` (full data restructure)
- **Deleted components**: WorkGrid, StudioSection, StackSection, OpenClawSection, GithubSection, ShowreelSection, AgentDiagram, NeuralCanvas, HeroTicker
- **New components**: TrackRecord, WhatIBuilt, Films, ToolStack, SystemThinking, Contact (6 new section components)
- **Retained components**: Hero, Sidebar (nav items updated), SectionHeader (utility)
- **Assets needed**: 3 product screenshots, brand logos (Nike/Tencent/Riot/L'Oreal/BMW/miHoYo/Mercedes/Audi), tool logos (Runway/Midjourney/ElevenLabs/etc.), film poster, 2 AI video thumbnails, OpenClaw SVG
- **No dependency changes** — same React/Vite/Cloudflare Pages stack
- **No API changes** — static content site
