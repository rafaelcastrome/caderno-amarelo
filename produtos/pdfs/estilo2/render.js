// Renderiza um SVG de página de colorir em PNG (e opcionalmente PDF A4).
// uso: node render.js entrada.svg saida.png [saida.pdf] [escala]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [svgIn, pngOut, pdfOut, escala] = process.argv.slice(2);
  const svg = fs.readFileSync(svgIn, 'utf8');
  const fonte = 'file://' + path.resolve(__dirname, '..', 'Caveat-Bold.ttf');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face{font-family:Caveat;src:url('${fonte}')}
    html,body{margin:0;padding:0;background:#fff}
    .pg{width:210mm;height:297mm;overflow:hidden}
    .pg svg{width:100%;height:100%;display:block}
    @page{size:A4;margin:0}
  </style></head><body><div class="pg">${svg}</div></body></html>`;
  const tmp = path.join(path.dirname(path.resolve(pngOut)), '_tmp_render.html');
  fs.writeFileSync(tmp, html);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: Number(escala || 2) });
  await p.goto('file://' + tmp);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: pngOut, fullPage: false });
  if (pdfOut && pdfOut !== '-') await p.pdf({ path: pdfOut, format: 'A4', printBackground: true });
  await b.close();
  fs.unlinkSync(tmp);
})();
