#!/usr/bin/env node
// Renderiza o projeto whiteboard quadro a quadro (30 fps) e monta o .mp4 com FFmpeg.
//
//   node render.js <pasta-do-projeto> [--out video.mp4] [--workers 4]
//   node render.js <pasta-do-projeto> --preview 3,9.5,20     (só PNGs em <projeto>/preview/)
//
// Requer: playwright (global ou local), ffmpeg/ffprobe, e na pasta do projeto:
// index.html, engine.js, cenas.js, projeto.json, timeline.json, narration.mp3.
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function loadPlaywright() {
  const tries = ['playwright', '/opt/node22/lib/node_modules/playwright'];
  try {
    const g = spawnSync('npm', ['root', '-g'], { encoding: 'utf8' }).stdout.trim();
    if (g) tries.push(path.join(g, 'playwright'));
  } catch { /* sem npm */ }
  for (const t of tries) { try { return require(t); } catch { /* tenta o próximo */ } }
  throw new Error('playwright não encontrado (npm i -g playwright)');
}

const args = process.argv.slice(2);
const ROOT = path.resolve(args[0] && !args[0].startsWith('--') ? args[0] : '.');
const opt = (name, def) => { const i = args.indexOf(name); return i > -1 ? args[i + 1] : def; };
const FPS = 30, W = 1080, H = 1920;
const WORKERS = Number(opt('--workers', Math.max(1, Math.min(4, os.cpus().length))));
const OUT = opt('--out') ? path.resolve(opt('--out')) : path.join(ROOT, 'video.mp4');   // --out é relativo ao diretório atual
const FRAMES_DIR = path.join(ROOT, 'frames');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
  '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };

function serve() {
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

async function openPage(browser, url) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(() => window.__error);
  if (err || errors.length) throw new Error('Erro na página:\n' + (err || errors.join('\n')));
  return page;
}

async function main() {
  for (const f of ['index.html', 'engine.js', 'cenas.js', 'projeto.json', 'timeline.json']) {
    if (!fs.existsSync(path.join(ROOT, f))) throw new Error(`Falta ${f} em ${ROOT}`);
  }
  const playwright = loadPlaywright();
  const server = await serve();
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  const browser = await playwright.chromium.launch();
  const stage = (page) => page.locator('#stage');

  const preview = opt('--preview');
  if (preview) {
    const dir = path.join(ROOT, 'preview');
    fs.mkdirSync(dir, { recursive: true });
    const page = await openPage(browser, url);
    for (const t of preview.split(',').map(Number)) {
      await page.evaluate(tt => window.seekToTime(tt), t);
      const f = path.join(dir, `t_${t.toFixed(2)}.png`);
      await stage(page).screenshot({ path: f });
      console.log(f);
    }
    await browser.close(); server.close();
    return;
  }

  const total = JSON.parse(fs.readFileSync(path.join(ROOT, 'timeline.json'))).total;
  const nFrames = Math.ceil(total * FPS);
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAMES_DIR);
  console.log(`Renderizando ${nFrames} quadros (${total.toFixed(2)}s) com ${WORKERS} páginas...`);
  let done = 0; const t0 = Date.now();
  const chunk = Math.ceil(nFrames / WORKERS);
  // Um navegador (processo) por frente: com várias páginas no mesmo navegador elas disputam
  // o mesmo processo de renderização e a CPU fica ociosa.
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const own = await playwright.chromium.launch();
    const page = await openPage(own, url);
    const el = stage(page);
    for (let f = w * chunk; f < Math.min(nFrames, (w + 1) * chunk); f++) {
      await page.evaluate(tt => window.seekToTime(tt), f / FPS);
      await el.screenshot({ path: path.join(FRAMES_DIR, `f_${String(f).padStart(5, '0')}.png`) });
      if (++done % 150 === 0) {
        const el2 = (Date.now() - t0) / 1000;
        console.log(`  ${done}/${nFrames} quadros (${el2.toFixed(0)}s, faltam ~${((nFrames - done) * el2 / done / 60).toFixed(1)} min)`);
      }
    }
    await page.close();
    await own.close();
  }));
  await browser.close();
  server.close();

  console.log('Compilando com FFmpeg...');
  const r = spawnSync('ffmpeg', [
    '-y', '-v', 'error',
    '-framerate', String(FPS), '-i', path.join(FRAMES_DIR, 'f_%05d.png'),
    '-i', path.join(ROOT, 'narration.mp3'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
    OUT,
  ], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg falhou');
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log(`OK: ${OUT}`);
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
