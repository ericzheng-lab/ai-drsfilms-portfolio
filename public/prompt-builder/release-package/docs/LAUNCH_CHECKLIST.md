# Prompt Builder Launch Checklist

## 1. GitHub Pages

- Publish the V3 root folder as the active GitHub Pages site.
- Make `index.html` the public entry.
- Confirm `prompt-builder.html` opens from the landing page.
- After the final GitHub Pages URL is live, replace relative Open Graph image paths with absolute URLs if LinkedIn does not pick them up.

## 2. GitHub CLI Install

- Confirm `package.json` and `bin/prompt-builder.js` are at the repo root.
- Put `install.sh` at the GitHub repo root.
- Replace `ericzheng-lab` in `README.md` and `docs/CLI_INSTALL.md`.
- Test: `npx --yes github:ericzheng-lab/prompt-builder`
- Test: `curl -fsSL https://raw.githubusercontent.com/ericzheng-lab/prompt-builder/main/install.sh | bash`
- Run `prompt-builder`.
- Confirm the app opens locally and the browser still offers PWA install.

## 3. PWA Smoke Test

- Open the live site in Chrome.
- Confirm the install icon appears.
- Install the app and launch it from the desktop.
- Reload once offline or with a weak connection to confirm the service worker path is working.

## 4. Demo Path

Record a 30-45 second demo with this sequence:

1. Land on the homepage.
2. Open the builder.
3. Choose a visual workflow.
4. Select fields and chips like `wide shot`, `35mm anamorphic`, `blue hour`, `teal-and-amber`, `cinematic scale`.
5. Click `Use Fields Directly`.
6. Switch Midjourney, Flux, Nano Banana, and GPT Image.
7. Show the preview changing format without an API call.
8. Copy the final prompt.
9. Optional GitHub flex: show `prompt-builder` launching the local app from the terminal.

## 5. LinkedIn Launch Order

1. Launch post: broad public introduction.
2. Product thinking post: why blank text boxes are weak AI interfaces.
3. HR post: what the project demonstrates.
4. Investor/product strategy post: domain expertise as interface.
5. Short version: repost with demo clip or screenshot.

## 6. Visual Assets

- Use `../web-shots/landing-homepage.png` as the first GitHub README visual.
- Use `../web-shots/builder-direct-mode.png` as the main product-proof visual.
- Use `../PICS/showcase-creative-range-what-can-you-build.jpg` for product breadth.
- Use `../PICS/audience-who-uses-prompt-builder.jpg` for HR / investor audience framing.
- Use `../PICS/preset-library-100-plus-catalog-infographic.jpg` for preset depth.
- Do not use `../PICS/archive/legacy-*` files publicly.
- Do not use `../PICS/metrics-by-the-numbers-preset-stats.jpg` until the claims are rewritten.
- Use `../social-cards/post-cards.html` to capture polished 1200 x 630 launch cards.

## 7. Positioning Rules

- Lead with the user benefit: prompt in shot language.
- Show the working product before explaining the philosophy.
- Keep PWA/no-backend/no-account as trust signals, not the headline.
- Use CLI install as a credibility signal, not the main product promise.
- For investors, frame it as domain-specific AI interfaces.
- For HR, frame it as product judgment plus shipped execution.

## 8. Launch-Day Checks

- Direct mode does not call the LLM API.
- Model switching reformats the current preview.
- GPT Image output parses as valid JSON.
- Copy/export/history use the current preview.
- Manifest and service worker load without 404s.
- `prompt-builder` opens the installed local copy.
