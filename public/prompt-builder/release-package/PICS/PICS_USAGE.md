# PICS Asset Usage Report

Contact sheet: `asset-contact-sheet.jpg`

## Rename Summary

All public image files in this folder use content-based names. Old legacy files have been removed.

## Best Assets

### `showcase-creative-range-what-can-you-build.jpg`

Strongest public-facing image in this folder.

Use for:
- Landing page: category / capability section.
- PR package: main product breadth visual.
- LinkedIn carousel: slide 2 or 3.
- GitHub README: secondary image after the real product screenshot.

Do not use as:
- GitHub hero image. It feels like a generated marketing card, not proof of the actual app.

### `audience-who-uses-prompt-builder.jpg`

Best audience-positioning image.

Use for:
- PR package: audience slide.
- LinkedIn: HR / investor post.
- Landing page: "Who it is for" section.

Do not use as:
- GitHub README hero. It is positioning, not product proof.

### `preset-library-100-plus-catalog-infographic.jpg`

Best feature-depth image. **Replaced in V5** — previous version was swapped for a cleaner layout.

Use for:
- Landing page: preset library section.
- PR package: feature proof.
- GitHub README: feature/supporting image.

Do not use as:
- First image in GitHub. It explains depth, not the core product.

### `before-after-blank-box-to-chips.jpg`

Best transformation image. Shows the core value proposition visually.

Use for:
- Landing page: before & after section.
- PR package: value prop proof.
- LinkedIn: standalone "this is what it does" post.
- GitHub README: secondary image — demonstrates the user journey.

Do not use as:
- GitHub hero image. It is a detail shot, not an app overview.

### `before-after-prompt-transformation.jpg`

Alternate transformation image. Use when the other before/after doesn't fit the layout.

Use for:
- PR package: backup transformation visual.
- LinkedIn carousel: slide showing the problem → solution arc.

Do not use if:
- `before-after-blank-box-to-chips.jpg` is already used nearby.

### `one-scene-four-formats-model-comparison.jpg`

Best model-awareness image. Shows multi-model output in one frame.

Use for:
- Landing page: model comparison / output formats section.
- PR package: technical breadth proof.
- GitHub README: supporting image after product screenshot.
- LinkedIn: "same idea, four models" educational post.

Do not use as:
- GitHub hero. It explains output formats, not the core product entry point.

### `showcase-what-can-you-build-category-grid.jpg`

Usable backup version of the creative-range image.

Use for:
- PR package backup.
- Cropped social post background.
- Alternate LinkedIn carousel slide.

Do not use if:
- `showcase-creative-range-what-can-you-build.jpg` is already used nearby.

## Conditional Assets

### `metrics-by-the-numbers-preset-stats.jpg`

Looks good but needs claim cleanup before public use.

Possible use:
- PR package internal draft.
- LinkedIn only after verifying claims.

Risk:
- "0 dependencies", "0 setup steps", and "0 data leaving your device" are marketing-friendly but technically fragile. The app uses browser/runtime assets and optional API features. GitHub viewers may challenge this.

Recommendation:
- Do not use on GitHub homepage.
- Recreate later with safer claims: `Static PWA`, `Optional LLM`, `Local direct mode`, `No backend account`.

## Recommended Placement

### Landing Page

Primary:
- `showcase-creative-range-what-can-you-build.jpg`
- `audience-who-uses-prompt-builder.jpg`
- `preset-library-100-plus-catalog-infographic.jpg`
- `before-after-blank-box-to-chips.jpg`
- `one-scene-four-formats-model-comparison.jpg`

Secondary:
- `showcase-what-can-you-build-category-grid.jpg`
- `before-after-prompt-transformation.jpg`

Avoid:
- `metrics-by-the-numbers-preset-stats.jpg` until claims are rewritten.

### PR / Press Package

Primary:
- `showcase-creative-range-what-can-you-build.jpg`
- `audience-who-uses-prompt-builder.jpg`
- `preset-library-100-plus-catalog-infographic.jpg`
- `before-after-blank-box-to-chips.jpg`
- `one-scene-four-formats-model-comparison.jpg`
- Existing `web-shots/landing-homepage.png`
- Existing `web-shots/builder-direct-mode.png`
- Existing `social-cards/post-launch.png`

Secondary:
- `showcase-what-can-you-build-category-grid.jpg`
- `before-after-prompt-transformation.jpg`
- `metrics-by-the-numbers-preset-stats.jpg` after claim cleanup.

### GitHub README / Homepage

Best order:
1. `web-shots/landing-homepage.png`
2. `web-shots/builder-direct-mode.png`
3. `PICS/showcase-creative-range-what-can-you-build.jpg`
4. `PICS/before-after-blank-box-to-chips.jpg`
5. `PICS/one-scene-four-formats-model-comparison.jpg`
6. `PICS/preset-library-100-plus-catalog-infographic.jpg`

Avoid:
- `audience-who-uses-prompt-builder.jpg` as a top GitHub image. Good for positioning, weaker as technical proof.
- `metrics-by-the-numbers-preset-stats.jpg`.

### LinkedIn Carousel

Best order:
1. `social-cards/post-launch.png`
2. `web-shots/builder-direct-mode.png`
3. `PICS/showcase-creative-range-what-can-you-build.jpg`
4. `PICS/before-after-blank-box-to-chips.jpg`
5. `PICS/one-scene-four-formats-model-comparison.jpg`
6. `PICS/audience-who-uses-prompt-builder.jpg`
7. `PICS/preset-library-100-plus-catalog-infographic.jpg`

Optional:
- Add `PICS/before-after-prompt-transformation.jpg` or `PICS/showcase-what-can-you-build-category-grid.jpg` if a longer carousel is needed.

## Remaining Assets

The launch package now has real before/after and model comparison images. One gap remains:

- Real hero composite: actual product UI + a generated result side by side. Useful for GitHub hero if the current `web-shots/` pair feels insufficient.
