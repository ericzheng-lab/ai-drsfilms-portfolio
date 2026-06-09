## 1. Data Layer Restructure

- [ ] 1.1 Create new TypeScript types in `src/data/site.ts`: TrackMetric, BrandLogo, CompanyHistory, Product, FilmFeature, FilmVideo, ToolCategory, Tool, SystemAgent, ContactPath, ContactMeta
- [ ] 1.2 Define trackRecord data: 3 metrics ($8M+, Sundance, 60+ Countries), 8 brand logos, 2 company history lines
- [ ] 1.3 Define whatIBuilt data: 3 products (AI Film Studio, Budget Studio, Prompt Builder) with taglines, tech tags, placeholder screenshot paths, live/repo URLs
- [ ] 1.4 Define films data: feature film info (Brief History of A Family) + 2 AI video entries (HOME MANGA, HOME live-action)
- [ ] 1.5 Define toolStack data: 5 categories with tool names (AI Orchestration: 4, Video: 6, Image: 5, Audio: 3, Build Stack: 7)
- [ ] 1.6 Define systemThinking data: manifesto text, 4 agent role annotations, SVG path reference
- [ ] 1.7 Define contact data: dual paths (Hire Me / Build With Me) with descriptions and links, metadata footer
- [ ] 1.8 Update navItems to new 6-section structure (track-record through contact)
- [ ] 1.9 Remove legacy exports: projects, stackGroups, repositories, tools arrays

## 2. Section Components — Create

- [ ] 2.1 Create `src/components/sections/` directory
- [ ] 2.2 Create TrackRecord.tsx: 3 metrics row, gold divider, brand logo matrix with hover, company history lines
- [ ] 2.3 Create WhatIBuilt.tsx: 3 vertical product cards with screenshot placeholder, name, tagline, tech tags, action buttons
- [ ] 2.4 Create Films.tsx: top half (poster + film info two-column), gold divider, bottom half (2 video thumbnails with play overlay)
- [ ] 2.5 Create ToolStack.tsx: 5 category groups with title + logo row, monochrome logos with hover-to-gold
- [ ] 2.6 Create SystemThinking.tsx: manifesto quote, SVG architecture diagram, agent role annotations, hook sentence + link
- [ ] 2.7 Create Contact.tsx: dual-column layout (Hire Me / Build With Me), CTA buttons, metadata footer

## 3. Section Components — CSS

- [ ] 3.1 Add Track Record styles: metric row (flex, clamp font size), logo matrix (flex, grayscale-to-gold transition), company history (warm gray)
- [ ] 3.2 Add What I Built styles: vertical product cards (full-width screenshot area, text block, button row)
- [ ] 3.3 Add Films styles: poster+info two-column, video thumbnail grid, play button overlay
- [ ] 3.4 Add Tool Stack styles: category title (Space Mono uppercase), logo row (flex, gap 24-32px), hover effect
- [ ] 3.5 Add System Thinking styles: manifesto (large italic), SVG container (centered, responsive), agent annotations
- [ ] 3.6 Add Contact styles: dual-column (grid or flex), metadata footer (warm gray)

## 4. App.tsx Refactor

- [ ] 4.1 Remove inline section components: WorkGrid, StudioSection, StackSection, OpenClawSection, GithubSection, ShowreelSection, AgentDiagram, NeuralCanvas, HeroTicker, ProjectVisual, StudioVideo
- [ ] 4.2 Import new section components from `src/components/sections/`
- [ ] 4.3 Update main render: Hero → TrackRecord → WhatIBuilt → Films → ToolStack → SystemThinking → Contact
- [ ] 4.4 Remove unused imports (Braces, Film, Layers3, ExternalLink, etc. that were only used by deleted sections)
- [ ] 4.5 Keep SectionHeader utility component (used by new sections) or inline it into each section

## 5. Responsive Verification

- [ ] 5.1 Verify Track Record: 3 metrics horizontal on desktop, vertical on mobile
- [ ] 5.2 Verify What I Built: product cards full-width on all viewports
- [ ] 5.3 Verify Films: poster+info two-column on desktop, stacked on mobile; video thumbnails side-by-side on desktop, stacked on mobile
- [ ] 5.4 Verify Tool Stack: logo rows wrap gracefully on narrow viewports
- [ ] 5.5 Verify System Thinking: SVG scales down on mobile, manifesto readable
- [ ] 5.6 Verify Contact: dual columns on desktop, stacked on mobile
- [ ] 5.7 Verify sidebar navigation highlights correct section on scroll

## 6. Build Verification

- [ ] 6.1 Run `npx tsc --noEmit` — no TypeScript errors
- [ ] 6.2 Run `npm run build` — clean build, no warnings
- [ ] 6.3 Run `npm run dev` — visual spot check of all 7 sections including Hero
