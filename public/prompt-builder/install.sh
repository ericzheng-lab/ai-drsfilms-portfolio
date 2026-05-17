#!/usr/bin/env bash
set -euo pipefail

APP_NAME="Prompt Builder"
REPO_URL="${PROMPT_BUILDER_REPO_URL:-https://github.com/ericzheng-lab/prompt-builder.git}"
BRANCH="${PROMPT_BUILDER_BRANCH:-main}"
INSTALL_HOME="${PROMPT_BUILDER_HOME:-$HOME/.prompt-builder}"
APP_DIR="$INSTALL_HOME/app"
BIN_DIR="${PROMPT_BUILDER_BIN_DIR:-$HOME/.local/bin}"
CLI_PATH="$BIN_DIR/prompt-builder"

info() {
  printf '%s\n' "==> $*"
}

fail() {
  printf '%s\n' "Error: $*" >&2
  exit 1
}

has() {
  command -v "$1" >/dev/null 2>&1
}

detect_source_dir() {
  local script_path="${BASH_SOURCE[0]}"
  local script_dir
  script_dir="$(cd "$(dirname "$script_path")" >/dev/null 2>&1 && pwd -P)"

  if [ -n "${PROMPT_BUILDER_SOURCE_DIR:-}" ]; then
    printf '%s\n' "$PROMPT_BUILDER_SOURCE_DIR"
    return
  fi

  if [ -f "$script_dir/index.html" ] && [ -f "$script_dir/prompt-builder.html" ]; then
    printf '%s\n' "$script_dir"
    return
  fi

  printf '%s\n' ""
}

copy_local_app() {
  local source_dir="$1"
  mkdir -p "$APP_DIR"

  if has rsync; then
    rsync -a \
      --delete \
      --exclude '.git' \
      --exclude '.DS_Store' \
      --exclude 'release-package/PICS' \
      "$source_dir/" "$APP_DIR/"
  else
    rm -rf "$APP_DIR"
    mkdir -p "$APP_DIR"
    cp -R "$source_dir"/. "$APP_DIR"/
    rm -rf "$APP_DIR/.git" "$APP_DIR/release-package/PICS"
  fi
}

clone_remote_app() {
  mkdir -p "$INSTALL_HOME"

  if has git; then
    if [ -d "$APP_DIR/.git" ]; then
      info "Updating existing install"
      git -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
      git -C "$APP_DIR" checkout "$BRANCH"
      git -C "$APP_DIR" reset --hard "origin/$BRANCH"
    else
      rm -rf "$APP_DIR"
      info "Cloning $APP_NAME"
      git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
    fi
    return
  fi

  fail "git is required for remote install. Install git, or run this script from a downloaded repo folder."
}

write_cli() {
  mkdir -p "$BIN_DIR"

  cat > "$CLI_PATH" <<'CLI'
#!/usr/bin/env bash
set -euo pipefail

INSTALL_HOME="${PROMPT_BUILDER_HOME:-$HOME/.prompt-builder}"
APP_DIR="$INSTALL_HOME/app"
DEFAULT_PORT="${PROMPT_BUILDER_PORT:-4733}"

has() {
  command -v "$1" >/dev/null 2>&1
}

python_bin() {
  if has python3; then
    printf '%s\n' "python3"
  elif has python; then
    printf '%s\n' "python"
  else
    printf '%s\n' ""
  fi
}

pick_port() {
  local py="$1"
  local start_port="$2"
  "$py" - "$start_port" <<'PY'
import socket
import sys

start = int(sys.argv[1])
for port in range(start, start + 80):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.bind(("127.0.0.1", port))
        except OSError:
            continue
    print(port)
    raise SystemExit(0)

raise SystemExit("No free local port found.")
PY
}

open_url() {
  local url="$1"
  if has open; then
    open "$url" >/dev/null 2>&1 || true
  elif has xdg-open; then
    xdg-open "$url" >/dev/null 2>&1 || true
  elif has start; then
    start "$url" >/dev/null 2>&1 || true
  fi
}

usage() {
  cat <<'HELP'
Prompt Builder CLI

Usage:
  prompt-builder            Start the local app and open it
  prompt-builder open       Start the local app and open it
  prompt-builder serve      Start the local app without opening a browser
  prompt-builder update     Pull the latest GitHub version when installed from git
  prompt-builder path       Show the installed app path
  prompt-builder help       Show this help

Environment:
  PROMPT_BUILDER_PORT=4733
  PROMPT_BUILDER_HOME="$HOME/.prompt-builder"
HELP
}

require_app() {
  if [ ! -f "$APP_DIR/index.html" ] || [ ! -f "$APP_DIR/prompt-builder.html" ]; then
    printf '%s\n' "Prompt Builder is not installed at $APP_DIR" >&2
    printf '%s\n' "Run install.sh again from the GitHub repo." >&2
    exit 1
  fi
}

serve_app() {
  local should_open="$1"
  local py
  py="$(python_bin)"
  if [ -z "$py" ]; then
    printf '%s\n' "Python is required to run the local static server." >&2
    exit 1
  fi

  require_app

  local port
  port="$(pick_port "$py" "$DEFAULT_PORT")"
  local url="http://127.0.0.1:$port/"

  printf '%s\n' "Prompt Builder is running:"
  printf '%s\n' "  $url"
  printf '%s\n' ""
  printf '%s\n' "Tip: use your browser's Install button to keep it as a desktop PWA."
  printf '%s\n' "Press Ctrl+C to stop."

  cd "$APP_DIR"
  if [ "$should_open" = "yes" ]; then
    open_url "$url"
  fi
  "$py" -m http.server "$port" --bind 127.0.0.1
}

case "${1:-open}" in
  open|start)
    serve_app "yes"
    ;;
  serve)
    serve_app "no"
    ;;
  update)
    require_app
    if [ -d "$APP_DIR/.git" ]; then
      git -C "$APP_DIR" pull --ff-only
      printf '%s\n' "Prompt Builder updated."
    else
      printf '%s\n' "This install was copied from local files. Re-run install.sh from the latest repo folder."
    fi
    ;;
  path)
    printf '%s\n' "$APP_DIR"
    ;;
  help|--help|-h)
    usage
    ;;
  *)
    usage
    exit 1
    ;;
esac
CLI

  chmod +x "$CLI_PATH"
}

main() {
  local source_dir
  source_dir="$(detect_source_dir)"

  info "Installing $APP_NAME"
  if [ -n "$source_dir" ]; then
    info "Using local source: $source_dir"
    copy_local_app "$source_dir"
  else
    clone_remote_app
  fi

  write_cli

  info "Installed CLI: $CLI_PATH"
  printf '%s\n' ""
  printf '%s\n' "Run:"
  printf '%s\n' "  prompt-builder"
  printf '%s\n' ""

  case ":$PATH:" in
    *":$BIN_DIR:"*) ;;
    *)
      printf '%s\n' "Add this to your shell profile if the command is not found:"
      printf '%s\n' "  export PATH=\"$BIN_DIR:\$PATH\""
      ;;
  esac
}

main "$@"
