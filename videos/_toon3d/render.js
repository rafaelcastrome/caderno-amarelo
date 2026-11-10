// Renderiza UMA cena do motor toon3d em mp4 (720x1280, 30 qps), sem som.
// Uso: node render.js cena.js saida.mp4 [--prev 1 3.5 ...] [--bocas bocas.json]
// Precisa de three@0.160 (node_modules do _papel3d), playwright e ffmpeg.
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
const args = process.argv.slice(2);
const cenaArq = path.resolve(args[0]); const saida = path.resolve(args[1]);
const iPrev = args.indexOf('--prev'); const prev = iPrev >= 0 ? args.slice(iPrev + 1).filter((x) => /^[0-9.]+$/.test(x)).map(Number) : null;
const iB = args.indexOf('--dados'); const dados = iB >= 0 ? fs.readFileSync(path.resolve(args[iB + 1]), 'utf8') : '{}';
const iB2 = args.indexOf('--bocas'); const bocas = iB2 >= 0 ? fs.readFileSync(path.resolve(args[iB2 + 1]), 'utf8') : '{}';
const FPS = 30; const AQUI = __dirname;
const iDe = args.indexOf('--de'); const iAte = args.indexOf('--ate'); // trecho em quadros (pra renderizar em pedaços)
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  p.on('console', (m) => { if (m.type() === 'error') console.error('JS:', m.text()); });
  p.on('pageerror', (e) => { console.error('ERRO NA CENA:', e.message); process.exitCode = 1; });
  await p.setContent('<html><body style="margin:0;background:#000"><canvas id=c width=720 height=1280></canvas></body></html>');
  await p.addScriptTag({ content: 'window.BOCAS=' + bocas + ';window.DADOS=' + dados + ';if(window.DADOS.bocas)window.BOCAS=window.DADOS.bocas;' });
  await p.addScriptTag({ content: fs.readFileSync(path.join(AQUI, 'node_modules/three/build/three.min.js'), 'utf8') });
  for (const f of ['toon.js', 'mao.js', 'pessoa.js', 'pov.js']) await p.addScriptTag({ content: fs.readFileSync(path.join(AQUI, f), 'utf8') });
  await p.addScriptTag({ content: fs.readFileSync(cenaArq, 'utf8') });
  const info = await p.evaluate(() => { const r = window.CENA(window.T) || {}; return { dur: r.dur || 5 }; });
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  const grab = async (t) => Buffer.from((await p.evaluate((t) => { window.render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, t)).split(',')[1], 'base64');
  if (prev) { for (const t of prev) fs.writeFileSync(saida.replace(/\.mp4$/, `_${t}.jpg`), await grab(t)); await b.close(); return; }
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', saida]);
  const n = Math.round(info.dur * FPS);
  const q0 = iDe >= 0 ? +args[iDe + 1] : 0, q1 = iAte >= 0 ? Math.min(n, +args[iAte + 1]) : n;
  for (let i = q0; i < q1; i++) {
    const j = await grab(i / FPS); if (!ff.stdin.write(j)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 30 === 0) process.stdout.write(`\r${path.basename(saida)} ${i}/${n}`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close(); console.log(`\r${path.basename(saida)} ok (${info.dur} s)`);
})();
