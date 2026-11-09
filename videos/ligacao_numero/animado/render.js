// uso: node render.js [--preview t1,t2,...]   -> frames/ + teste_animado.mp4
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
(async () => {
  const dir = __dirname, env = JSON.parse(fs.readFileSync(path.join(dir, 'env.json')));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(dir, 'cena.html')); await p.evaluate(e => { ENV = e; }, env);
  await p.evaluate(() => document.fonts.load('80px Cav'));
  const i = process.argv.indexOf('--preview');
  if (i > 0) { fs.mkdirSync(path.join(dir, 'preview'), { recursive: true });
    for (const t of process.argv[i + 1].split(',').map(Number)) { await p.evaluate(t => render(t), t); await p.screenshot({ path: path.join(dir, 'preview', `t_${t}.png`) }); }
    await b.close(); return; }
  const fr = path.join(dir, 'frames'); fs.rmSync(fr, { recursive: true, force: true }); fs.mkdirSync(fr);
  const N = Math.round(21 * 30);
  for (let f = 0; f < N; f++) { await p.evaluate(t => render(t), f / 30); await p.screenshot({ path: path.join(fr, `f${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 }); if (f % 90 === 0) console.log(f, '/', N); }
  await b.close();
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', '30', '-i', path.join(fr, 'f%04d.jpg'), '-i', path.join(dir, 'teste_audio.wav'),
    '-vf', 'scale=720:1280', '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', path.join(dir, 'teste_animado.mp4')]);
  console.log('OK');
})();
