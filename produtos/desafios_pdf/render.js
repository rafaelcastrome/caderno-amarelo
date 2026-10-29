const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.5 });
  await p.goto('file://' + process.cwd() + '/amostra.html'); await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: 'amostra.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  const pages = await p.$$('.page');
  for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: `pag${i+1}.png` });
  await b.close();
})();
