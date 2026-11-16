// Grava o Acha do 1 ao 25 (fase 1) como se alguém tivesse jogando no celular, em 9:16.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const DPR = 1080 / 390;
const perfil = { apelido: 'Rafa', arroba: 'cardeno_amarelo', mostrar_arroba: true, arroba_confirmado: true, id_publico: 'demo' };
let tempoFinal = 15;
const linhas = t => [
  { pos: 1, nome: 'Ju', t: +(t - 1.6).toFixed(1), tentativa: 4 },
  { pos: 2, nome: '@cardeno_amarelo', ok: true, eu: true, t, tentativa: 1 },
  { pos: 3, nome: 'Pedrinho', t: +(t + 0.9).toFixed(1), tentativa: 2 },
  { pos: 4, nome: 'Bia', t: +(t + 2.3).toFixed(1), tentativa: 1 },
  { pos: 5, nome: 'Lucas', t: +(t + 3.8).toFixed(1), tentativa: 3 },
  { pos: 6, nome: 'Mari', t: +(t + 5.1).toFixed(1), tentativa: 1 },
];
(async () => {
  const b = await chromium.launch({ args: ['--force-device-scale-factor=' + DPR] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 693 }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const p = await ctx.newPage();
  await p.route('**/functions/v1/**', async r => {
    const fn = r.request().url().split('/').pop(); let body = {};
    try { body = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    let res = { ok: true };
    if (fn === 'jogo-conta') res = { email: 'demo@demo', token: 'demo', premium: false, perfil };
    if (fn === 'jogo-ranking' && body.acao === 'enviar' && body.t) tempoFinal = body.t;
    if (fn === 'jogo-ranking' && body.acao === 'ver') { const l = linhas(tempoFinal); res = { total: l.length, top: l, meu: l[1], amigos: [] }; }
    if (fn === 'jogo-ranking' && body.acao === 'estrelas') res = { total: 0, top: [], amigos: [] };
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(res) });
  });
  await p.addInitScript(perfil => {
    try {
      localStorage.setItem('ca-jogos:conta', JSON.stringify({ email: 'demo@demo', token: 'demo', premium: false, perfil }));
    } catch (e) {}
    window.__ev = [];
    const iv = setInterval(() => {
      if (window.CA && CA.som && !CA.som.__h) { const o = CA.som; CA.som = function (t) { window.__ev.push([t, Date.now() / 1000]); }; CA.som.__h = 1; }
      if (window.CA && CA.compartilhar && !CA.compartilhar.__h) { CA.compartilhar = async function () { window.__ev.push(['desafiar', Date.now() / 1000]); CA.aviso('Link copiado! Cola no WhatsApp 😉'); }; CA.compartilhar.__h = 1; }
    }, 5);
  }, perfil);
  const cdp = await ctx.newCDPSession(p);
  let n = 0; const quadros = [];
  cdp.on('Page.screencastFrame', async f => {
    const nome = `${String(n++).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(OUT, nome), Buffer.from(f.data, 'base64'));
    quadros.push([nome, f.metadata.timestamp]);
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (_) {}
  });
  const marcas = []; const marca = nome => marcas.push([nome, Date.now() / 1000]);
  const dedoJs = `if(!document.getElementById('dedo')){const s=document.createElement('style');s.textContent='#dedo{position:fixed;width:54px;height:54px;border-radius:50%;background:rgba(30,30,30,.30);border:3px solid rgba(255,255,255,.95);box-shadow:0 0 0 2px rgba(0,0,0,.25);pointer-events:none;z-index:99999;transform:translate(-50%,-50%) scale(.5);opacity:0;transition:transform .12s,opacity .12s}#dedo.on{transform:translate(-50%,-50%) scale(1);opacity:1}';document.head.appendChild(s);const d=document.createElement('div');d.id='dedo';document.body.appendChild(d);}`;
  async function tocaXY(x, y, seg = 120) {
    await p.evaluate(([x, y, js]) => { eval(js); const d = document.getElementById('dedo'); d.style.left = x + 'px'; d.style.top = y + 'px'; d.classList.add('on'); }, [x, y, dedoJs]);
    await p.waitForTimeout(70);
    await p.mouse.click(x, y);
    await p.waitForTimeout(seg);
    await p.evaluate(() => document.getElementById('dedo').classList.remove('on'));
  }
  async function toca(sel, seg = 220) {
    const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(150);
    const bb = await el.boundingBox(); await tocaXY(bb.x + bb.width / 2, bb.y + bb.height / 2, seg);
  }
  const cel = async v => { const bb = await p.locator(`.cel[data-v="${v}"]`).boundingBox(); return [bb.x + bb.width / 2 + (Math.random() * 10 - 5), bb.y + bb.height / 2 + (Math.random() * 10 - 5)]; };

  await p.goto('http://localhost:8765/jogos/#/');
  await p.waitForTimeout(800);
  await p.evaluate(() => { location.hash = '#/fase?f=1&s=777'; });
  await p.waitForTimeout(150);
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, everyNthFrame: 1, maxWidth: 1080, maxHeight: 1920 });
  marca('inicio');
  // espera o "Valendo!"
  await p.waitForFunction(() => !document.querySelector('.contagem'), null, { timeout: 8000 });
  marca('valendo');
  // [espera antes do toque (ms), número que toca]
  const plano = [];
  const base = [200, 260, 170, 300, 220, 250, 180];
  for (let v = 1; v <= 25; v++) {
    let d = base[v % base.length] + Math.round(Math.random() * 60);
    if (v === 1) d = 350;
    if (v === 7) { plano.push([350, 17, 'erro1']); d = 450; }
    if (v === 13) d = 700;
    
    plano.push([d, v, v === 25 ? 'fim' : null]);
  }
  for (const [d, v, m] of plano) {
    await p.waitForTimeout(Math.max(0, d - 190));
    const [x, y] = await cel(v);
    if (m) marca(m);
    await tocaXY(x, y);
  }
  await p.waitForSelector('.resultado');
  tempoFinal = await p.evaluate(() => parseFloat(document.querySelector('.res-valor').textContent.replace(',', '.')));
  marca('resultado');
  await p.waitForTimeout(1300);
  await p.evaluate(() => document.querySelector('[data-a="desafiar"]').scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await p.waitForTimeout(700);
  await toca('[data-a="desafiar"]'); marca('desafiar');
  await p.waitForTimeout(1200);
  // caixa do ranking embaixo do resultado
  await p.evaluate(() => { const c = document.querySelector('.res-ranking'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  await p.waitForTimeout(900); marca('caixa_ranking');
  await toca('.res-ranking'); marca('ranking');
  await p.waitForTimeout(4000);
  marca('fim_grav');
  await cdp.send('Page.stopScreencast');
  const ev = await p.evaluate(() => window.__ev);
  fs.writeFileSync(path.join(OUT, 'dados.json'), JSON.stringify({ quadros, marcas, ev, tempoFinal }, null, 1));
  await b.close();
})();
