// Renderiza as cenas 3D (cena3d.js) quadro a quadro no Chromium headless.
// Uso: node render3d.js timeline.json saida.mp4 [t1 t2 ...]  (com tempos: salva prev3d_<t>.jpg)
const { chromium } = require('playwright');
const fs = require('fs'); const { spawn } = require('child_process'); const path = require('path');
const THREE_JS = process.env.THREE_JS || path.join(__dirname, 'node_modules/three/build/three.min.js');
(async () => {
  const [tlPath, out, ...ts] = process.argv.slice(2);
  const TL = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('console', m => { if (m.type() === 'error') console.error('JS:', m.text()); });
  p.on('pageerror', e => console.error('PAGEERR:', e.message));
  await p.setContent('<html><body style="margin:0;background:#000"><canvas id=c></canvas></body></html>');
  await p.addScriptTag({ content: fs.readFileSync(THREE_JS, 'utf8') });
  await p.addScriptTag({ content: 'window.TL=' + JSON.stringify(TL) + ';' });
  await p.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'cena3d.js'), 'utf8') });
  const grab = async (t) => {
    const r = await p.evaluate((t) => { const e = window.render(t); return { e, d: document.getElementById('c').toDataURL('image/jpeg', 0.93) }; }, t);
    return { extra: r.e, jpg: Buffer.from(r.d.split(',')[1], 'base64') };
  };
  if (ts.length) {
    for (const t of ts) { const r = await grab(parseFloat(t)); fs.writeFileSync(`prev3d_${t}.jpg`, r.jpg); console.log(t, JSON.stringify(r.extra)); }
    await b.close(); return;
  }
  const N = Math.round(TL.DUR * TL.FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(TL.FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'fast', '-crf', '14', '-pix_fmt', 'yuv420p', out]);
  const extras = [];
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const r = await grab(i / TL.FPS); extras.push(r.extra);
    if (!ff.stdin.write(r.jpg)) await new Promise(res => ff.stdin.once('drain', res));
    if (i % 150 === 0) console.log('quadro', i, '/', N, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  ff.stdin.end(); await new Promise(res => ff.on('close', res));
  fs.writeFileSync(out.replace(/\.mp4$/, '_extra.json'), JSON.stringify(extras));
  await b.close();
})();
