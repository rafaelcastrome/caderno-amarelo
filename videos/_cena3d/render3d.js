// Renderiza UMA cena 3D animada em mp4 (720x1280, 30 qps), sem som.
// Uso:
//   node render.js cena01.js saida/cena01.mp4           -> vídeo + saida/cena01.json (duração e instantes das peças pro som)
//   node render.js cena01.js saida/cena01.mp4 --prev 1 3 -> só quadros soltos saida/cena01_1.jpg, _3.jpg (conferir rápido)
// Precisa: npm i (three@0.160.0, opentype.js@1.3.4, playwright) nesta pasta, ffmpeg no PATH.
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
const opentype = require('opentype.js');

const args = process.argv.slice(2);
const cenaArq = path.resolve(args[0]); const saida = path.resolve(args[1]);
const iPrev = args.indexOf('--prev'); const prev = iPrev >= 0 ? args.slice(iPrev + 1).map(Number) : null;
const FPS = 30;
const AQUI = __dirname;

// contornos das letras (Caveat Bold) pro P.texto(); y pra cima, altura de maiúscula ~0.7
function glifos() {
  const f = opentype.loadSync(path.join(AQUI, 'Caveat-Bold.ttf'));
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúç0123456789?!.,:+-×÷=%$#@&()/';
  const out = {}; const esc = 1 / f.unitsPerEm;
  for (const ch of chars) {
    const g = f.charToGlyph(ch); const cmds = g.getPath(0, 0, 1).commands.map((c) => {
      const o = { type: c.type }; for (const k of ['x', 'y', 'x1', 'y1', 'x2', 'y2']) if (c[k] !== undefined) o[k] = k.startsWith('y') ? -c[k] : c[k];
      return o;
    });
    out[ch] = { adv: g.advanceWidth * esc, cmds };
  }
  return out;
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  p.on('console', (m) => { if (m.type() === 'error') console.error('JS:', m.text()); });
  p.on('pageerror', (e) => { console.error('ERRO NA CENA:', e.message); process.exitCode = 1; });
  await p.setContent('<html><body style="margin:0;background:#000"><canvas id=c></canvas></body></html>');
  await p.addScriptTag({ content: 'window.GLIFOS=' + JSON.stringify(glifos()) });
  await p.addScriptTag({ content: fs.readFileSync(path.join(AQUI, 'node_modules/three/build/three.min.js'), 'utf8') });
  await p.addScriptTag({ content: fs.readFileSync(path.join(AQUI, 'motor3d.js'), 'utf8') });
  await p.addScriptTag({ content: fs.readFileSync(cenaArq, 'utf8') });
  const info = await p.evaluate(() => { const r = window.CENA(window.P) || {}; return { dur: r.dur || 5, eventos: window.P.eventos }; });
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  const grab = async (t) => Buffer.from((await p.evaluate((t) => { window.render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, t)).split(',')[1], 'base64');
  if (prev) {
    for (const t of prev) fs.writeFileSync(saida.replace(/\.mp4$/, `_${t}.jpg`), await grab(t));
    await b.close(); return;
  }
  fs.writeFileSync(saida.replace(/\.mp4$/, '.json'), JSON.stringify({ dur: info.dur, eventos: info.eventos.filter((e) => e < info.dur).sort((a, b) => a - b) }));
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-crf', '19', '-pix_fmt', 'yuv420p', saida]);
  const n = Math.round(info.dur * FPS);
  for (let i = 0; i < n; i++) {
    const j = await grab(i / FPS); if (!ff.stdin.write(j)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 30 === 0) process.stdout.write(`\r${path.basename(saida)} ${i}/${n}`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close(); console.log(`\r${path.basename(saida)} ok (${info.dur} s)`);
})();
