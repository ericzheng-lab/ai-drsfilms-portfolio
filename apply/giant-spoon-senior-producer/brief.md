---
company: Giant Spoon
role: Senior Producer
archetype: P-led
profile_route: giant-spoon
jd_url: https://jobs.lever.co/wpromote/c4ef1fc3-6a0d-42cf-9c1a-fb88576334cd
selected_work_ids:
  - coach-make-the-ground-shake
  - tencent-dungeon-and-fighter
  - brief-history-of-a-family
page_slots:
  archetype: P-led
  lead:
    - traditional advertising showreel
    - Coach brand spot
  second:
    - Tencent Dungeon & Fighter
  supporting:
    - Brief History of A Family
    - One Click Mute
    - Manga Cut
    - DoomBrush
    - Prompt Builder
  omit:
    - 58-node
    - DEV4 tool wall
    - film as first viewport
    - tool wall
artifacts:
  - cv
  - cover_letter
  - profile
---

# Brief — Giant Spoon / Senior Producer

P-led TRAD. Agency integrated production. The claim is take big-brand integrated production from concept through delivery: budget, vendors, concurrent projects at once.

Official JD: https://jobs.lever.co/wpromote/c4ef1fc3-6a0d-42cf-9c1a-fb88576334cd

Live artifacts for this package:

- Role-specific CV at `cv.md`
- Cover letter at `cl.md`
- Company Profile at https://ai.drsfilms.com/giant-spoon/

Selected work ids, lead-first: `coach-make-the-ground-shake`, `tencent-dungeon-and-fighter`, `brief-history-of-a-family`.

Page slots are locked here, not after a Profile exists.

- Archetype: P-led.
- Lead: traditional advertising showreel + Coach brand spot. First viewport is ads, not film.
- Second: Tencent Dungeon & Fighter.
- Supporting: Brief History of A Family, one card only; AI as schedule/cost One Click Mute → Manga Cut → DoomBrush at most a quarter of the page; Prompt Builder, one screenshot (`prompt-builder-ui-01` if INDEX `public:true`).
- Left off the page: 58-node, DEV4 tool wall, film as first viewport, tool wall.

How ads hang without invented frames:

- Dual gate for any still file: drs-source INDEX `public:true` AND `external_ready`.
- Coach may be an in-page Vimeo embed (190660903) if no INDEX still exists. Do not generate a fake Coach frame.
- Traditional showreel: 21:9 poster picture, then in-page play (Vimeo 1174467043). Poster must be a real public still or a real reel poster already in the repo — not a homemade SVG.
- If Tencent has no public still, one short type card is allowed for second; do not invent a game still.
- Brief History of A Family: at most one still card, not four.
- Prompt Builder: only `prompt-builder-ui-01` if `public:true`. No DEV4 screenshots.
- No visible A-* ids. Klein Blue `#0033A0` as a real wordmark/field. Radius 0. Sora.
