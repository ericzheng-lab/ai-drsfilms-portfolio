## Context

The ai.drsfilms.com portfolio is a React/Vite single-page app deployed on Cloudflare Pages. It currently has 8 sections (Hero through Contact) implemented as inline functions in `src/App.tsx` with data from `src/data/site.ts`. The site uses a dark cinematic design system (CSS custom properties, Space Mono typography, gold accent color). The Three.js Hero is the centerpiece and must remain untouched.

The v2 upgrade restructures the narrative flow to match deck v7, replacing 6 sections while keeping Hero and the overall design system intact.

## Goals / Non-Goals

**Goals:**
- Replace 6 sections with v2 narrative structure (Track Record → What I Built → Films → Tool Stack → System Thinking → Contact)
- Delete Showreel and GitHub standalone sections
- Maintain the existing dark cinematic design system (CSS variables, typography, color palette)
- All image assets use placeholder divs until user provides actual files
- Each section is a standalone React component in `src/components/sections/`
- Data restructured in `src/data/site.ts` with new types
- Responsive: all sections work on mobile (single-column) and desktop
- Preserve sidebar navigation with updated section IDs

**Non-Goals:**
- Modifying Hero (CinematicHero.tsx, hero.css, createCinematicHero.ts) — zero changes
- Changing the build/deploy pipeline (Vite + Cloudflare Pages)
- Adding new dependencies
- Implementing real images — placeholders only, user provides assets separately
- Modifying the design system (CSS variables, color palette, typography)
- Changing the sidebar layout or identity block

## Decisions

### 1. Component extraction into `src/components/sections/`

**Decision**: Create a new `src/components/sections/` directory with one file per section component.

**Why**: Currently all section components are inline in App.tsx (1193 lines). Extracting them makes each section independently editable and keeps App.tsx as a thin layout shell. The section components are pure React — no shared state between them (each manages its own local state like expanded/detail toggles).

**Alternative considered**: Keep inline in App.tsx — rejected because 6 new components + rewriting 6 existing ones would push App.tsx past 2000 lines.

### 2. Placeholder image strategy

**Decision**: Use styled `<div>` placeholders with descriptive text labels, matching the deck v7 placeholder pattern. Each placeholder div has a data attribute (`data-asset="name"`) for easy grep/replace when real images arrive.

**Why**: User will provide images separately. Placeholders make it obvious what's missing and where to drop in real files. The `data-asset` attribute enables a future script to batch-replace placeholders with `<img>` tags.

**Alternative considered**: Use `<img src="/placeholder.png">` — rejected because it adds a dependency on a placeholder image file and doesn't communicate what the real image should be.

### 3. Data restructuring in site.ts

**Decision**: Replace the current flat data exports (projects, stackGroups, repositories, agents) with structured types per section:

```typescript
// New types
type TrackMetric = { value: string; label: string; sublabel: string }
type BrandLogo = { name: string; src?: string }  // src optional until assets arrive
type Product = { id: string; name: string; tagline: string; techTags: string[]; screenshot: string; liveUrl?: string; repoUrl?: string }
type FilmEntry = { title: string; poster?: string; ... }
type ToolCategory = { category: string; tools: { name: string; logo?: string }[] }
```

**Why**: Each section has different data shape. The current flat structure (7 projects with mixed types) doesn't map cleanly to the new sections. Typed per-section data makes components self-documenting.

### 4. Keeping existing CSS patterns

**Decision**: Reuse existing CSS classes and patterns (`.section`, `.fade-in`, `.section-header`, `.tag-list`, `.metric`) where they fit. New section-specific styles go in `src/styles.css` under clearly commented blocks (e.g., `/* === TRACK RECORD === */`).

**Why**: The design system is already established. Adding new CSS files per section would fragment the styling. The existing file is ~800 lines — adding 6 sections will push it to ~1200 lines, which is manageable.

### 5. Nav updates

**Decision**: Update `navItems` in site.ts to match the new section structure. The sidebar component in App.tsx reads from navItems, so it auto-updates.

**New nav**: Track Record (01), What I Built (02), Films (03), Tool Stack (04), System Thinking (05), Contact (06)

## Risks / Trade-offs

- **[Placeholder visual quality]** → Placeholders will look rough until images arrive. Mitigation: use the existing dark card styling so placeholders feel intentional, not broken.
- **[CSS bloat]** → Single styles.css grows from ~800 to ~1200 lines. Mitigation: clear section comments, no new CSS files.
- **[Component count]** → 6 new files + App.tsx refactoring. Mitigation: each component is small (50-150 lines), well-scoped, no shared state.
- **[Missing assets]** → Sections depend on images that don't exist yet. Mitigation: all image references are placeholder divs with data-asset attributes; no broken `<img>` tags.
