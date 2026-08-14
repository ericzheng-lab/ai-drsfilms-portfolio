#!/usr/bin/env node
/**
 * Syntax-check every inline <script> block in public/**\/*.html.
 *
 * Why this exists: on 2026-05-21 a bad edit to public/TTL-BP/index.html left an
 * orphaned `if` block and a nested `<script>` opener inside a live script. That
 * is a SyntaxError, so the browser discarded the ENTIRE block -- nextSlide,
 * prevSlide, goToSlide and updatePresenterUI were never defined and the deck
 * could not leave slide 1. It shipped to production twice (cd75e32, then again
 * in 70c61c9 after c33caa2 had repaired it) and stayed broken for ~3 months
 * because nothing in the pipeline parses inline JS.
 *
 * The extractor deliberately mirrors the HTML parser: a script block ends at the
 * first literal `</script>`, wherever it appears. A nested `<script>` opener is
 * therefore just text inside the block -- and a syntax error.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { Script } from 'node:vm';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

// Hand-rolled walk rather than fs.globSync: CI pins Node 20 (see
// .github/workflows/deploy.yml and .nvmrc) and globSync only landed in Node 22.
function findHtml(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) findHtml(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(relative(ROOT, full));
  }
  return out;
}

// Script types the browser executes as classic JS. Anything else (JSON-LD,
// templates, importmaps) is data, not code, and is skipped.
const CLASSIC_TYPES = new Set(['', 'text/javascript', 'application/javascript', 'module']);

function extractBlocks(html) {
  const blocks = [];
  const opener = /<script\b([^>]*)>/gi;
  let m;
  while ((m = opener.exec(html)) !== null) {
    const attrs = m[1];
    const start = m.index + m[0].length;
    const end = html.indexOf('</script>', start);
    const body = end === -1 ? html.slice(start) : html.slice(start, end);

    // Advance past this block so a nested `<script>` inside it is not treated
    // as a new block -- the browser does not treat it as one either.
    opener.lastIndex = end === -1 ? html.length : end + '</script>'.length;

    if (/\bsrc\s*=/i.test(attrs)) continue;
    const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]*)/i)?.[1] ?? '').toLowerCase();
    if (!CLASSIC_TYPES.has(type)) continue;
    if (!body.trim()) continue;

    blocks.push({
      body,
      type,
      unterminated: end === -1,
      line: html.slice(0, start).split('\n').length,
    });
  }
  return blocks;
}

const files = findHtml(join(ROOT, 'public'));
const failures = [];
let blockCount = 0;

for (const file of files) {
  const html = readFileSync(join(ROOT, file), 'utf8');
  for (const block of extractBlocks(html)) {
    blockCount++;
    if (block.unterminated) {
      failures.push({ file, line: block.line, message: 'unterminated <script> block (no closing </script>)' });
      continue;
    }
    try {
      // Compiles without executing. `module` type is checked as a classic
      // script, which is close enough to catch structural damage like this.
      new Script(block.body, { filename: `${file}:${block.line}` });
    } catch (err) {
      failures.push({ file, line: block.line, message: `${err.name}: ${err.message}` });
    }
  }
}

const scope = `${files.length} HTML file(s), ${blockCount} inline script block(s)`;

if (failures.length === 0) {
  console.log(`inline-js: PASSED -- ${scope}`);
  process.exit(0);
}

console.error(`inline-js: FAILED -- ${failures.length} broken block(s) in ${scope}\n`);
for (const f of failures) {
  console.error(`  ${f.file} (inline script starting at line ${f.line})`);
  console.error(`    ${f.message}\n`);
}
console.error('A syntax error discards the whole <script> block at load time.');
console.error('Every function it defines silently disappears from the page.');
process.exit(1);
