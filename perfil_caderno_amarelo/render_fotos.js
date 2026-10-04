const pw = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await pw.chromium.launch();
  const p = await b.newPage({ viewport: { width: 3400, height: 1100 } });
  await p.goto('file://' + __dirname + '/fotos.html');
  await p.evaluate(() => document.fonts.ready);
  for (const id of ['a', 'b', 'c']) await p.locator('#' + id).screenshot({ path: `foto_perfil_${id}.png` });
  await b.close();
})();
