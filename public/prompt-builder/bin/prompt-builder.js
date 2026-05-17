#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const appRoot = path.resolve(__dirname, '..');
const defaultPort = Number(process.env.PROMPT_BUILDER_PORT || 4733);
const command = process.argv[2] || 'open';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function usage() {
  console.log(`Prompt Builder CLI

Usage:
  prompt-builder            Start the local app and open it
  prompt-builder open       Start the local app and open it
  prompt-builder serve      Start the local app without opening a browser
  prompt-builder path       Show the package app path
  prompt-builder help       Show this help

Environment:
  PROMPT_BUILDER_PORT=4733`);
}

function openUrl(url) {
  const platform = process.platform;
  const opener = platform === 'darwin'
    ? 'open'
    : platform === 'win32'
      ? 'cmd'
      : 'xdg-open';
  const args = platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(opener, args, { stdio: 'ignore', detached: true });
  child.on('error', () => {});
  child.unref();
}

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, 'http://127.0.0.1');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';

  const requestedPath = path.normalize(path.join(appRoot, pathname));
  if (!requestedPath.startsWith(appRoot)) return null;

  try {
    const stat = fs.statSync(requestedPath);
    if (stat.isDirectory()) return path.join(requestedPath, 'index.html');
  } catch {
    return requestedPath;
  }

  return requestedPath;
}

function createServer() {
  return http.createServer((req, res) => {
    const filePath = resolveRequestPath(req.url || '/');
    if (!filePath) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }

      const type = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'content-type': type });
      res.end(content);
    });
  });
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    const onError = error => {
      server.removeListener('listening', onListening);
      if (error.code === 'EADDRINUSE') resolve(false);
      else reject(error);
    };
    const onListening = () => {
      server.removeListener('error', onError);
      resolve(true);
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, '127.0.0.1');
  });
}

async function start({ shouldOpen }) {
  if (!fs.existsSync(path.join(appRoot, 'index.html')) || !fs.existsSync(path.join(appRoot, 'prompt-builder.html'))) {
    console.error(`Prompt Builder files were not found in ${appRoot}`);
    process.exit(1);
  }

  for (let port = defaultPort; port < defaultPort + 80; port += 1) {
    const server = createServer();
    const ok = await listen(server, port);
    if (!ok) continue;

    const url = `http://127.0.0.1:${port}/`;
    console.log('Prompt Builder is running:');
    console.log(`  ${url}`);
    console.log('');
    console.log("Tip: use your browser's Install button to keep it as a desktop PWA.");
    console.log('Press Ctrl+C to stop.');

    if (shouldOpen) openUrl(url);
    return;
  }

  console.error(`No free local port found from ${defaultPort} to ${defaultPort + 79}.`);
  process.exit(1);
}

if (command === 'help' || command === '--help' || command === '-h') {
  usage();
} else if (command === 'path') {
  console.log(appRoot);
} else if (command === 'open' || command === 'start') {
  start({ shouldOpen: true }).catch(error => {
    console.error(error.message);
    process.exit(1);
  });
} else if (command === 'serve') {
  start({ shouldOpen: false }).catch(error => {
    console.error(error.message);
    process.exit(1);
  });
} else {
  usage();
  process.exit(1);
}
