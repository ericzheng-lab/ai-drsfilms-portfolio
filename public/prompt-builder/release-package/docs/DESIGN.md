# Design Philosophy — Prompt Builder

## Product Thesis

Prompt Builder is built on one belief:

> AI tools become dramatically more useful when they speak the language of the user’s craft.

Most AI image products start from the model. They expose a text box, a few parameters, and maybe a gallery of examples. That works for experimentation, but it is weak as a production workflow.

Film and visual creators do not think in generic prompt syntax. They think in shot size, lens choice, blocking, lighting motivation, color temperature, aspect ratio, emotional tone, continuity, and references. Prompt Builder turns that expert vocabulary into a usable interface.

## The Problem

AI image generation has an input problem.

The models can produce strong images, but the user has to translate intent into machine-friendly phrasing. That translation is fragile. A small wording change can alter composition, camera feel, lighting, or genre.

For non-specialists, the problem is prompt literacy.  
For specialists, the problem is vocabulary mismatch.

A DP may know exactly what they want: an epic wide shot, a 35mm anamorphic feel, blue-hour industrial glow, a human figure small in frame, teal-and-amber color, and a monumental sense of scale.

But most AI interfaces still ask: “Describe your image.”

Prompt Builder removes that blank-page moment.

## The Design Decision

The interface is structured around decisions a creator already understands:

- What are you making?
- What kind of shot is it?
- What lens language does it need?
- How is it lit?
- What mood should it carry?
- Which model should receive the final prompt?

Instead of making the user write from scratch, the tool lets them compose intent through chips, fields, and presets.

That is the core UX move: **selection before syntax**.

## Why Presets Matter

Presets here are not shortcuts. They are encoded workflow knowledge.

A character turnaround preset is not just “character sheet.” It knows that consistency matters across front, side, back, head study, costume breakdown, and hero portrait.

A panorama preset is not just “wide shot.” It knows that an establishing image sets geography, lighting direction, spatial relationships, and continuity for later shots.

A film poster preset is not just “poster.” It knows that key art needs thumbnail readability, emotional hook, title area, genre signal, and a controlled palette.

That is the difference between a button and a workflow.

## Why Model-Specific Output Exists

Different image models reward different prompt shapes.

Midjourney responds well to compact visual phrasing and parameters. Flux benefits from explicit natural-language description. Nano Banana works best when addressed conversationally. GPT Image is strongest when given structured JSON for layouts, panels, constraints, and controlled composition.

Prompt Builder does not pretend one prompt format fits every model.

The same visual intent is mapped into the right dialect.

## Why “Use Fields Directly” Is Important

The tool deliberately does not require an LLM.

Users can fill fields, select chips, choose model params, and get a live prompt preview without an API key. This matters because the core value is the translation layer, not the LLM call.

LLM enhancement is useful, but optional. The product should still feel complete offline.

That design choice makes Prompt Builder more trustworthy:

- The user sees exactly what their selections become.
- The preview updates as they work.
- The model output is predictable.
- The user stays in control.

## Why PWA

Prompt Builder is meant to feel like a lightweight creative utility.

An installable PWA lets a user keep it on their desktop like a small production tool, not a web page they have to remember. It is also aligned with the project’s philosophy: useful, portable, low-friction, and independent of accounts or servers.

## What This Project Demonstrates

For users, it is a practical prompt builder.

For investors, it is a thesis about domain-specific AI interfaces.

For hiring teams, it demonstrates:

- product judgment
- interface design
- domain insight
- AI workflow thinking
- ability to ship a complete static product

The deeper point is not “here is a prompt tool.”

The deeper point is:

> Expert knowledge can be transformed into interface primitives. Once that happens, AI becomes easier to direct.

That is the product direction Prompt Builder is exploring.
