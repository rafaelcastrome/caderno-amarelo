// Gera os PDFs de produtos/pdfs/html/*.html em produtos/pdfs/pdf/ e uma prévia PNG das 3 primeiras páginas.
// Uso: node render.js [slug ...]  (sem argumentos, gera todos)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dirHtml = path.join(__dirname, 'html');
  const slugs = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(dirHtml).filter(f => f.endsWith('.html')).map(f => f.slice(0, -5));
  fs.mkdirSync(path.join(__dirname, 'pdf'), { recursive: true });
  fs.mkdirSync(path.join(__dirname, 'previa'), { recursive: true });
  const b = await chromium.launch();
  for (const slug of slugs) {
    const p = await b.newPage({ viewport: { width: 794, height: 1123 } });
    await p.goto('file://' + path.join(dirHtml, slug + '.html'), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: path.join(__dirname, 'pdf', slug + '.pdf'), preferCSSPageSize: true, printBackground: true });
    const pags = await p.$$('.pag');
    for (let i = 0; i < Math.min(+(process.env.PAGS || 6), pags.length); i++) await pags[i].screenshot({ path: path.join(__dirname, 'previa', `${slug}-${i + 1}.png`) });
    const estouros = await p.$$eval('.pag', ps => ps.map((pg, i) => [...pg.querySelectorAll(':scope > *:not(.rodape)')].some(c => c.getBoundingClientRect().bottom > pg.getBoundingClientRect().bottom - 20) ? i + 1 : null).filter(Boolean));
    console.log(slug, 'paginas', pags.length, 'estouros', JSON.stringify(estouros));
    await p.close();
  }
  await b.close();
})();
