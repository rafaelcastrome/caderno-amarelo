// Gera as capas da loja (800x1000) a partir dos HTML desta pasta.
// kit.html e desafios.html têm nome de saída fixo; natal-<slug>.html vira capa-<slug>.png.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 800, height: 1000 } });
  const lista = [['kit', 'capa-kit-mentalista'], ['desafios', 'capa-desafios']];
  for (const f of fs.readdirSync(__dirname)) if (f.startsWith('natal-') && f.endsWith('.html')) lista.push([f.slice(0, -5), 'capa-' + f.slice(6, -5)]);
  for (const [f, o] of lista) {
    await p.goto('file://' + __dirname + '/' + f + '.html');
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: __dirname + '/../assets/img/' + o + '.png' });
  }
  await b.close();
})();
