// Renderiza index.html quadro a quadro (30 fps) com Playwright e monta o .mp4 com FFmpeg.
// Uso:
//   node render.js                 -> vídeo completo (voto_util_explicacao.mp4)
//   node render.js --preview 3,9.5 -> só salva PNGs desses instantes em preview/
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }

const ROOT = __dirname;
const FPS = 30;
const W = 1080, H = 1920;
const WORKERS = Math.max(1, Math.min(4, require('os').cpus().length));
const FRAMES_DIR = path.join(ROOT, 'frames');
const OUT = path.join(ROOT, 'voto_util_explicacao.mp4');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
  '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.css': 'text/css' };

function serve() {
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
      res.writeHead(404); return res.end();
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

async function openPage(browser, url) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function main() {
  const server = await serve();
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  const browser = await playwright.chromium.launch();
  const stage = (page) => page.locator('#stage');

  const pi = process.argv.indexOf('--preview');
  if (pi > -1) {
    const times = process.argv[pi + 1].split(',').map(Number);
    fs.mkdirSync(path.join(ROOT, 'preview'), { recursive: true });
    const page = await openPage(browser, url);
    for (const t of times) {
      await page.evaluate(tt => window.seekToTime(tt), t);
      await stage(page).screenshot({ path: path.join(ROOT, 'preview', `t_${t.toFixed(2)}.png`) });
    }
    await browser.close(); server.close();
    return;
  }

  const total = JSON.parse(fs.readFileSync(path.join(ROOT, 'timeline.json'))).total;
  const nFrames = Math.ceil(total * FPS);
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAMES_DIR);
  console.log(`Renderizando ${nFrames} quadros (${total.toFixed(2)}s) com ${WORKERS} páginas...`);

  let done = 0;
  const t0 = Date.now();
  const chunk = Math.ceil(nFrames / WORKERS);
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const page = await openPage(browser, url);
    const el = stage(page);
    for (let f = w * chunk; f < Math.min(nFrames, (w + 1) * chunk); f++) {
      await page.evaluate(tt => window.seekToTime(tt), f / FPS);
      await el.screenshot({ path: path.join(FRAMES_DIR, `f_${String(f).padStart(5, '0')}.png`) });
      if (++done % 150 === 0) {
        console.log(`  ${done}/${nFrames} quadros (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
      }
    }
    await page.close();
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

main().catch(e => { console.error(e); process.exit(1); });
