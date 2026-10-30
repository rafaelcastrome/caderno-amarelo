// Gera o PDF do kit e prévias PNG de cada página.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 560, height: 794 }, deviceScaleFactor: 1.5 });
  await p.goto('file://' + __dirname + '/kit_mentalista.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: __dirname + '/kit-mentalista-v1.pdf', format: 'A5', printBackground: true, preferCSSPageSize: true });
  const pags = await p.$$('.pag');
  require('fs').mkdirSync(__dirname + '/previa', { recursive: true });
  for (let i = 0; i < pags.length; i++) await pags[i].screenshot({ path: `${__dirname}/previa/pag${String(i + 1).padStart(2, '0')}.png` });
  // Checa se algum conteúdo passou do fim da página.
  const estouros = await p.$$eval('.pag', ps => ps.map((pg, i) => [...pg.children].some(c => c.getBoundingClientRect().bottom > pg.getBoundingClientRect().bottom - 14 && !c.classList.contains('rodape')) ? i + 1 : null).filter(Boolean));
  console.log('paginas', pags.length, 'estouros', JSON.stringify(estouros));
  await b.close();
})();
