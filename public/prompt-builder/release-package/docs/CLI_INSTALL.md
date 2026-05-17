# CLI Install Notes

## Public CLI Commands

Use this for the cleanest GitHub-native launch:

```bash
npx --yes github:ericzheng-lab/prompt-builder
```

Use this when you want a persistent local command:

```bash
curl -fsSL https://raw.githubusercontent.com/ericzheng-lab/prompt-builder/main/install.sh | bash
prompt-builder
```

Replace `ericzheng-lab` with the final GitHub owner.

## What It Does

- Installs the app into `~/.prompt-builder/app`.
- Creates a local `prompt-builder` command in `~/.local/bin`.
- Starts a local static server on the first free port from `4733`.
- Opens the landing page in the browser.
- Keeps the browser PWA install path available.

The `npx github:...` path uses `package.json` and `bin/prompt-builder.js`. The `curl | bash` path uses `install.sh`.

## Local Test Command

From the V3 root:

```bash
bash install.sh
prompt-builder
```

## Launch Copy

Prompt Builder can run three ways: open the static files, install it from GitHub with one command, or save it as a desktop PWA from the browser. That makes the project feel lightweight, portable, and serious without adding backend infrastructure.

## Release Check

- Confirm `install.sh` exists at the GitHub repo root.
- Replace `ericzheng-lab` in `README.md`.
- Test: `npx --yes github:ericzheng-lab/prompt-builder`.
- Run the install command on a clean machine or temporary shell profile.
- Confirm `prompt-builder` opens the app.
- Confirm the browser still offers PWA install.
