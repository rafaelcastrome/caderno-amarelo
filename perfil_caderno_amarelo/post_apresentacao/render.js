const pw = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await pw.chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 2300 } });
  await p.goto('file://' + __dirname + '/imagens.html');
  await p.evaluate(() => document.fonts.ready);
  for (const id of ['img2', 'img3']) await p.locator('#' + id).screenshot({ path: `${id}.png` });
  await b.close();
})();
