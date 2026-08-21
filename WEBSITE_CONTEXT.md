# AI Portfolio Website Context

This project is the working site for `ai.drsfilms.com`.

## Working Rule

This website can be updated from the Obsidian/Codex chat, because that chat can read the Obsidian vault and the website project together.

Do not use this project to edit the traditional portfolio site unless Eric explicitly asks.

Traditional portfolio project:

```text
/Users/yuezheng/Documents/New project 3/Ericportfoliostructuredesign
```

AI portfolio project (this repo, verified 2026-08-13):

```text
/Users/yuezheng/Documents/VSCODE_CC/projects/ai-drsfilms-portfolio
```

Note: `/Users/yuezheng/Documents/New project 3/ai-portfolio-site` still exists on disk and is
a stale clone of the same GitHub repo (last commit 2026-05-05). It is not the working copy.
Do not edit it.

## Obsidian Source Index

Vault root (verified 2026-08-13 — note there is no `Documents/` level in this path):

```text
/Users/yuezheng/Library/CloudStorage/GoogleDrive-eric.zheng@drsfilms.com/Other computers/My MacBook Air/Obsidian-Vault
```

Before making substantial content or positioning changes, read:

```text
/Users/yuezheng/Library/CloudStorage/GoogleDrive-eric.zheng@drsfilms.com/Other computers/My MacBook Air/Obsidian-Vault/_99_Archive/会话总结/14_AI网站资料入口-2026-04-28.md
```

Primary source files listed by that index — all paths below verified to exist on 2026-08-13
except where marked:

```text
/Users/yuezheng/Library/CloudStorage/GoogleDrive-eric.zheng@drsfilms.com/Other computers/My MacBook Air/Obsidian-Vault/10_OpenClaw-Codex系统作品展示方案.md
/Users/yuezheng/Library/CloudStorage/GoogleDrive-eric.zheng@drsfilms.com/Other computers/My MacBook Air/Obsidian-Vault/07_OpenClaw-Agent架构.md
/Users/yuezheng/Library/CloudStorage/GoogleDrive-eric.zheng@drsfilms.com/Other computers/My MacBook Air/Obsidian-Vault/_99_Archive/会话总结/13_OpenClaw运行机制与规则边界复盘-2026-04-28.md
/Users/yuezheng/Library/CloudStorage/GoogleDrive-eric.zheng@drsfilms.com/Other computers/My MacBook Air/Obsidian-Vault/AI电影创作/00-索引.md
/Users/yuezheng/Library/CloudStorage/GoogleDrive-eric.zheng@drsfilms.com/Other computers/My MacBook Air/Obsidian-Vault/9_CV/Database/Eric-Database.md
```

⚠️ Unresolved — needs Eric's confirmation, not deleted:

```text
AI视频发布矩阵/00-项目首页.md
```

That file was listed here under the old vault path. As of 2026-08-13 no file or folder matching
`AI视频发布矩阵` exists anywhere in the vault, so no corrected path could be written for it.
Two of the files above (`14_...` and `13_...`) were also not at the vault root any more — they
were found in `_99_Archive/会话总结/` and the paths were updated accordingly.

## Site Positioning

Recommended positioning:

```text
Eric Zheng is a film producer building AI creative systems, agentic workflows, and production automation.
```

The site should prove:

- AI filmmaking ability.
- AI tool and workflow building ability.
- Agentic AI / OpenClaw system design ability.
- Traditional production credibility as the foundation.

Avoid vague claims like "AI expert" without proof artifacts.

## Editing Map

Main app:

```text
src/App.tsx
```

Structured content:

```text
src/data/site.ts
```

AI canvas component:

```text
src/components/CanvasDemo.tsx
```

Global styles:

```text
src/styles.css
```

Static media:

```text
public/uploads
```

## Verification

After edits, run:

```bash
npm run build
```

If TypeScript checking is needed:

```bash
npx tsc --noEmit
```

Cloudflare Pages settings:

```text
Build command: npm run build
Build output directory: dist
```

## Proof Artifact Backlog

Needed for the next content pass:

- AI video/image experiment screenshots or clips.
- OpenClaw Discord screenshots.
- Obsidian project graph or document screenshots.
- GitHub repo links for public projects.
- Demo URLs for AI tools, if public.
- A list of which client/project materials are safe to show publicly.
