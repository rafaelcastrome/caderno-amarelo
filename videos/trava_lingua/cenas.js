// "Trava-língua impossível" (desafio de fala, formato tradicional whiteboard).
// c1 gancho · c2 nível 1 · c3 cronômetro 1 · c4 nível 2 · c5 cronômetro 2 · c6 impossível · c7 cronômetro 3 · c8 travou em qual · c9 manda pro amigo / loop
window.CENAS = function (WB) {
  const { INK, C } = WB;
  function pop(g, t0, t1, cx, cy) {
    WB.effect(t => {
      if (t < t0 || (t1 && t >= t1)) { g.setAttribute('opacity', 0); return; }
      const u = Math.min(1, (t - t0) / 0.14), s = 1.25 - 0.25 * u;
      g.setAttribute('opacity', 1);
      g.setAttribute('transform', `translate(${(cx * (1 - s)).toFixed(1)} ${(cy * (1 - s)).toFixed(1)}) scale(${s.toFixed(3)})`);
    });
  }
  // marca d'água anda pelo rodapé
  const wmRect = document.querySelector('rect[fill="#fffaf0"]');
  if (wmRect) { const wm = wmRect.parentNode; WB.effect(t => wm.setAttribute('transform', `translate(${(280 * Math.sin(2 * Math.PI * t / 14)).toFixed(1)} 0)`)); }

  // frase aparece inteira no começo do cronômetro + barra que encolhe + contagem regressiva
  function cronometro(cena, linhas, size, lh, y0, cor) {
    const t0 = WB.at(cena, 0), t1 = WB.at(cena, 1), dur = 7.0;
    const g = WB.group();
    linhas.forEach((l, i) => WB.showNow(WB.textStrokes(l, 540, y0 + i * lh, size, cor, g, 'middle').strokes));
    pop(g, t0, 0, 540, y0 + lh);
    // barra
    const gb = WB.group();
    WB.mk('rect', { x: 150, y: 1290, width: 780, height: 64, rx: 18, fill: 'none', stroke: INK.black, 'stroke-width': 6 }, gb);
    const fill = WB.mk('rect', { x: 158, y: 1298, width: 764, height: 48, rx: 12, fill: INK.blue, opacity: 0.85 }, gb);
    WB.effect(t => {
      if (t < t0 || t >= t1) { gb.setAttribute('opacity', 0); return; }
      gb.setAttribute('opacity', 1);
      const u = Math.min(1, Math.max(0, (t - t0) / dur));
      fill.setAttribute('width', (764 * (1 - u)).toFixed(1));
      fill.setAttribute('fill', u > 0.7 ? INK.red : INK.blue);
    });
    // números 7..1 e TEMPO!
    for (let k = 0; k < 8; k++) {
      const gn = WB.group();
      const txt = k < 7 ? String(7 - k) : 'TEMPO!';
      WB.showNow(WB.textStrokes(txt, 540, 1530, k < 7 ? 150 : 130, k >= 4 ? INK.red : INK.black, gn, 'middle').strokes);
      pop(gn, t0 + k, k < 7 ? t0 + k + 1 : t1, 540, 1480);
    }
  }

  // ---- quadro 0: gancho
  WB.showNow(WB.textStrokes('TRAVA-LÍNGUA', 540, 210, 120, INK.black, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('IMPOSSÍVEL', 540, 360, 130, INK.red, null, 'middle').strokes);

  // ---- c1
  WB.write(1, 0.3, 0.6, 'fala em voz alta', 540, 560, 84, INK.black, { anchor: 'middle' });
  WB.write(1, 0.62, 0.92, 'RÁPIDO e sem travar!', 540, 700, 84, INK.blue, { anchor: 'middle' });
  WB.draw(1, 0.93, 0.99, C.underline(240, 840, 730, INK.blue));

  // ---- c2: nível 1
  WB.newPage(2, 0, 0.1);
  WB.write(2, 0.12, 0.5, 'NÍVEL 1', 540, 220, 110, INK.gray, { anchor: 'middle' });
  const s1 = C.stamp('3 VEZES', 540, 1100, { size: 110, color: INK.red, rot: -5 });
  WB.draw(2, 0.55, 0.97, [s1.box, s1.text]);
  WB.restHand(2, 0.97, 1);

  // ---- c3
  cronometro(3, ['"Três pratos', 'de trigo para', 'três tigres', 'tristes"'], 110, 140, 420, INK.black);
  WB.restHand(3, 0, 1);

  // ---- c4: nível 2
  WB.newPage(4, 0, 0.08);
  WB.write(4, 0.1, 0.4, 'NÍVEL 2', 540, 220, 110, INK.orange, { anchor: 'middle' });
  const s2 = C.stamp('3 VEZES', 540, 1100, { size: 110, color: INK.red, rot: 4 });
  WB.draw(4, 0.5, 0.95, [s2.box, s2.text]);
  WB.restHand(4, 0.96, 1);

  // ---- c5
  cronometro(5, ['"A aranha arranha', 'a rã, a rã', 'arranha', 'a aranha"'], 110, 140, 420, INK.black);
  WB.restHand(5, 0, 1);

  // ---- c6: impossível
  WB.newPage(6, 0, 0.06);
  WB.write(6, 0.08, 0.35, 'IMPOSSÍVEL', 540, 220, 130, INK.red, { anchor: 'middle' });
  WB.write(6, 0.38, 0.55, 'ninguém passou daqui', 540, 340, 64, INK.gray, { anchor: 'middle' });
  const s3 = C.stamp('5 VEZES', 540, 1100, { size: 120, color: INK.red, rot: -4 });
  WB.draw(6, 0.6, 0.95, [s3.box, s3.text]);
  WB.restHand(6, 0.96, 1);

  // ---- c7
  cronometro(7, ['"Bagre branco,', 'branco bagre"'], 140, 180, 600, INK.black);
  WB.restHand(7, 0, 1);

  // ---- c8: travou em qual
  WB.newPage(8, 0, 0.08);
  WB.write(8, 0.1, 0.42, 'travou em qual?', 540, 520, 110, INK.black, { anchor: 'middle' });
  WB.write(8, 0.45, 0.72, '1,  2  ou  3?', 540, 760, 150, INK.red, { anchor: 'middle' });
  WB.write(8, 0.74, 0.92, 'comenta aí!', 540, 960, 90, INK.blue, { anchor: 'middle' });
  WB.restHand(8, 0.93, 1);

  // ---- c9: manda pro amigo + loop
  WB.writeLines(9, 0.02, 0.45, ['manda pro amigo', 'que se acha'], 540, 1170, 84, INK.black, { anchor: 'middle', lineHeight: 110 });
  WB.write(9, 0.46, 0.62, 'BOM DE FALA!', 540, 1420, 120, INK.orange, { anchor: 'middle' });
  WB.write(9, 0.64, 0.8, 'e volta pro começo', 500, 1580, 70, INK.blue, { anchor: 'middle' });
  WB.draw(9, 0.81, 0.88, C.curvedArrow(870, 1570, 1075, 1050, 990, 440, INK.blue, 8));
  WB.restHand(9, 0.9, 1);
};
