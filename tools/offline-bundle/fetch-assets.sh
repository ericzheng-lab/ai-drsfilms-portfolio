#!/bin/sh
# Re-download the two remote things the offline bundle has to carry locally:
# the three Google typefaces and the eight YouTube clip poster frames.
#
# The results are committed under assets/, so build.mjs works with the network
# off. Run this only when the deck gains a clip or the fonts change.
#
#   sh tools/offline-bundle/fetch-assets.sh
#
# Note: python3 on this machine cannot verify TLS certs, so curl does the
# downloading and python3 only rewrites text.

set -e
cd "$(dirname "$0")"

UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
GF='https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Mono:wght@400;500&family=Work+Sans:wght@400;500;600&display=swap'

# The eight external clip ids in public/starx-week-1/index.html.
YT_IDS='vFw_04XfV4I EQROSyAMuOM orLMm76lwjY vdfMLAH1yJQ BfhV3Q4LJPM ksxbp9yb9BU 7TavVZMewpY oACMU-w1RXw'

rm -rf assets/fonts assets/yt-posters
mkdir -p assets/fonts assets/yt-posters

# --- typefaces -------------------------------------------------------------
# Ask Google with a woff2-capable user agent, keep the latin and latin-ext
# subsets (the deck has no Vietnamese), and turn each remote url into a
# FONTFILE: placeholder that build.mjs swaps for a base64 payload.
curl -sS --fail -A "$UA" "$GF" -o /tmp/starx-gf.css

python3 - <<'PY'
import re, pathlib
css = pathlib.Path("/tmp/starx-gf.css").read_text()
blocks = re.findall(r"/\* ([a-z-]+) \*/\n(@font-face \{.*?\n\})", css, re.S)
keep = [(s, b) for s, b in blocks if s in ("latin", "latin-ext")]
seen, out, manifest = {}, [], []
for subset, block in keep:
    url = re.search(r"url\((https://fonts\.gstatic\.com/[^)]+)\)", block).group(1)
    fam = re.search(r"font-family: '([^']+)'", block).group(1).lower().replace(" ", "-")
    w = re.search(r"font-weight: (\d+)", block).group(1)
    # Several weights of a variable family share one file; dedupe by url so the
    # bundle does not carry the same 76 KB three times.
    if url not in seen:
        seen[url] = f"{fam}-{subset}-{w}.woff2"
        manifest.append(f"{seen[url]}\t{url}")
    out.append(f"/* {subset} */\n" + block.replace(url, "FONTFILE:" + seen[url]))
assert len(set(seen.values())) == len(seen), "font filename collision"
pathlib.Path("assets/fonts.template.css").write_text("\n".join(out) + "\n")
pathlib.Path("/tmp/starx-fonts.tsv").write_text("\n".join(manifest) + "\n")
print(f"{len(keep)} @font-face blocks -> {len(seen)} unique files")
PY

while IFS='	' read -r name url; do
  curl -sS --fail -A "$UA" "$url" -o "assets/fonts/$name"
  printf '  font    %-40s %8s bytes\n' "$name" "$(wc -c < "assets/fonts/$name" | tr -d ' ')"
done < /tmp/starx-fonts.tsv

# --- clip poster frames ----------------------------------------------------
for id in $YT_IDS; do
  curl -sS --fail "https://img.youtube.com/vi/$id/hqdefault.jpg" -o "assets/yt-posters/$id.jpg"
  printf '  poster  %-40s %8s bytes\n' "$id.jpg" "$(wc -c < "assets/yt-posters/$id.jpg" | tr -d ' ')"
done

echo 'done — now run: node tools/offline-bundle/build.mjs'
