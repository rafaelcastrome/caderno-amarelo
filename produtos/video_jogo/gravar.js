// Grava o jogo (loja/desafios.html) como se alguém tivesse jogando no celular.
// Uso: node gravar.js <pasta da loja> <pasta de saída dos quadros>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [LOJA, OUT] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const marcas = [];
(async () => {
  const b = await chromium.launch({ args: ['--force-device-scale-factor=2'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  let n = 0;
  cdp.on('Page.screencastFrame', async f => {
    const t = f.metadata.timestamp;
    fs.writeFileSync(path.join(OUT, `${String(n++).padStart(5, '0')}_${t.toFixed(3)}.jpg`), Buffer.from(f.data, 'base64'));
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (_) {}
  });
  const marca = nome => marcas.push({ nome, t: Date.now() / 1000 });
  const dedo = `
    if (!document.getElementById('dedo')) {
      const s = document.createElement('style');
      s.textContent = '#dedo{position:fixed;width:46px;height:46px;border-radius:50%;background:rgba(40,40,40,.28);border:3px solid rgba(255,255,255,.9);pointer-events:none;z-index:99999;transform:translate(-50%,-50%) scale(.4);opacity:0;transition:transform .18s,opacity .18s}#dedo.on{transform:translate(-50%,-50%) scale(1);opacity:1}';
      document.head.appendChild(s);
      const d = document.createElement('div'); d.id = 'dedo'; document.body.appendChild(d);
    }`;
  async function toca(sel) {
    const el = p.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    const bb = await el.boundingBox();
    const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    await p.evaluate(([x, y, js]) => { eval(js); const d = document.getElementById('dedo'); d.style.left = x + 'px'; d.style.top = y + 'px'; d.classList.add('on'); }, [x, y, dedo]);
    await p.waitForTimeout(260);
    await p.evaluate(() => document.getElementById('dedo').classList.remove('on'));
    await el.click();
  }
  async function digita(txt) { await toca('#resposta'); await p.waitForTimeout(250); await p.keyboard.type(txt, { delay: 120 }); await p.waitForTimeout(350); await toca('#btn-responder'); }
  async function rapido(txt) { await p.fill('#resposta', txt); await p.click('#btn-responder'); await p.waitForTimeout(150); await p.click('#btn-proximo'); await p.waitForTimeout(500); }

  await p.goto('file://' + path.resolve(LOJA, 'index.html'));
  await p.evaluate(() => localStorage.clear());
  await p.waitForTimeout(1500);
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1, maxWidth: 780, maxHeight: 1560 });
  marca('home'); await p.waitForTimeout(1500);
  await toca('.btn-jogar'); await p.waitForTimeout(1300);
  marca('d1'); await p.waitForTimeout(800);
  await digita('dinheiro'); await p.waitForTimeout(1500);
  marca('d1_fim');
  await rapido('buraco');
  marca('d2'); await p.waitForTimeout(1000);
  await digita('9'); await p.waitForTimeout(1500);
  marca('d2_fim');
  // libera o jogo (premium) sem mostrar o Pix e avança até os desafios que aparecem de relance
  await p.fill('#resposta', '14'); await p.click('#btn-responder'); await p.waitForTimeout(150);
  await p.evaluate(() => localStorage.setItem('desafios:jogo', JSON.stringify({ isPremium: true })));
  await p.click('#btn-proximo'); await p.waitForTimeout(500);
  if (await p.locator('#paywall[aria-hidden="false"]').count()) {
    // estado em memória ainda não premium: recarrega e refaz 1 e 2 rapidinho
    await p.reload(); await p.waitForTimeout(800); await rapido('buraco'); await rapido('14');
  }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300); marca('d3'); await p.waitForTimeout(1600); marca('d3_fim');
  await rapido('vermelho'); await rapido('12');
  marca('d5'); await p.waitForTimeout(1600); marca('d5_fim');
  await rapido('iguais'); await rapido('segundo'); await rapido('42'); await rapido('joao');
  marca('d9'); await p.waitForTimeout(1600); marca('d9_fim');
  await cdp.send('Page.stopScreencast');
  fs.writeFileSync(path.join(OUT, 'marcas.json'), JSON.stringify(marcas, null, 1));
  await b.close();
})();
