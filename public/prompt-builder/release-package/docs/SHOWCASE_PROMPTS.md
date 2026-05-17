# Showcase Prompt Source

These are the source prompts behind the current showcase images. Keep captions, demo copy, and launch posts aligned with this file.

Canonical source file in the app root: `../../Prompt_USED_CASES`.

## Midjourney

Theme: monumental brutalist steampunk cityscape.

Core idea:

- A man stands alone on a windswept hill.
- He is seen from behind, looking over a sprawling city.
- The city is built from concrete megastructures, brass pipes, smokestacks, cables, gears, and industrial haze.
- The shot uses epic scale, deep foreground grass, layered skyline, 35mm anamorphic language, dusk light, sodium vapor glow, cold blue industrial shadows, teal-and-amber grading, film grain, volumetric smoke, and weathered textures.

Short caption:

> Midjourney: brutalist steampunk cityscape, 35mm anamorphic, teal-and-amber industrial haze.

## Flux 2 Max

Theme: cinematic film still with current-day contrast.

Core idea:

- A current-day man in modern clothing stands on a windswept hill.
- He looks out over a vast brutalist steampunk city.
- The city includes concrete megastructures, brass pipes, smokestacks, elevated rail lines, steam vents, turbine towers, and industrial spires.
- The prompt specifies ARRI Alexa 65, 40mm anamorphic lens, f/2.8, dusk lighting, cold blue ambience, warm amber industrial glow, fog, steam, volumetric light, and `flux-realism`.

Parameters:

```text
model: flux-realism
guidance_scale: 20
steps: 50
format: png
safety: 2
```

Short caption:

> Flux 2 Max: ARRI Alexa 65, 40mm anamorphic, flux-realism, guidance 20, steps 50.

## GPT Image

Theme: structured cinematic still.

Core idea:

- Goal: create a frame from a high-budget science-fiction film.
- Subject: a present-day man in contemporary clothing, alone on a windswept hill.
- Scene: twilight / blue hour over a colossal brutalist steampunk metropolis.
- Style: cinematic, high-budget sci-fi, brutalist architecture, steampunk industrial design, neo-noir atmosphere, teal-and-amber grading, realistic film grain, monumental composition.
- Layout: 3x3 character continuity structure.

Short caption:

> GPT Image: structured JSON for cinematic scale, continuity, constraints, and controlled composition.
