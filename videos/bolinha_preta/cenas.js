// "Quantas bolinhas pretas?" (grade cintilante, Schrauf/Lingelbach/Wist 1997)
// c1 gancho · c2 contagem 4-3-2-1 · c3 elas fogem · c4 olha fixo na do meio · c5 a do lado pisca
// c6 apaga as linhas · c7 ZERO · c8 linhas voltam, cérebro inventa · c9 comenta + volta (loop)
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const tc = (cena, f) => WB.at(cena, f);
  // marca d'água anda pelo rodapé durante o vídeo
  const wmRect = document.querySelector('rect[fill="#fffaf0"]');
  if (wmRect) { const wm = wmRect.parentNode; WB.effect(t => wm.setAttribute('transform', `translate(${(280 * Math.sin(2 * Math.PI * t / 14)).toFixed(1)} 0)`)); }

  // ---- a grade (fora do filtro de "tinta" para ficar nítida)
  const X0 = 110, Y0 = 430, S = 860, N = 9, P = S / N, BAR = 15, R = 12.5;
  const gGrid = WB.group();
  const ink = gGrid.parentNode; ink.parentNode.insertBefore(gGrid, ink);
  WB.mk('rect', { x: X0, y: Y0, width: S, height: S, fill: '#000', rx: 6 }, gGrid);
  const gLin = WB.mk('g', {}, gGrid);
  for (let i = 0; i < N; i++) {
    const c = P * (i + 0.5);
    WB.mk('rect', { x: X0 + c - BAR / 2, y: Y0, width: BAR, height: S, fill: '#7d7d7d' }, gLin);
    WB.mk('rect', { x: X0, y: Y0 + c - BAR / 2, width: S, height: BAR, fill: '#7d7d7d' }, gLin);
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++)
    WB.mk('circle', { cx: X0 + P * (i + 0.5), cy: Y0 + P * (j + 0.5), r: R, fill: '#fff' }, gGrid);
  const CX = X0 + P * 4.5, CY = Y0 + P * 4.5;
  // linhas somem na c6 e voltam na c8
  WB.effect(t => {
    const a0 = tc(6, 0.64), a1 = tc(6, 0.94), b0 = tc(8, 0.06), b1 = tc(8, 0.24);
    let o = 1;
    if (t >= a0 && t < b0) o = 1 - Math.min(1, (t - a0) / (a1 - a0));
    else if (t >= b0) o = Math.min(1, (t - b0) / (b1 - b0));
    gLin.setAttribute('opacity', o.toFixed(3));
  });

  // mensagem na faixa de baixo (grupo que some em tOff)
  const BY = 1430;
  function msg(cena, f0, f1, txt, cor, size, tOff, y = BY) {
    const g = WB.group();
    WB.write(cena, f0, f1, txt, 540, y, size, cor, { anchor: 'middle', parent: g });
    if (tOff) WB.effect(t => g.setAttribute('opacity', t >= tOff ? Math.max(0, 1 - (t - tOff) / 0.15).toFixed(3) : 1));
    return g;
  }
  // aparece de uma vez com um "pulo"
  function pop(g, t0, t1, cx, cy) {
    WB.effect(t => {
      if (t < t0 || (t1 && t >= t1)) { g.setAttribute('opacity', 0); return; }
      const u = Math.min(1, (t - t0) / 0.14), s = 1.25 - 0.25 * u;
      g.setAttribute('opacity', 1);
      g.setAttribute('transform', `translate(${(cx * (1 - s)).toFixed(1)} ${(cy * (1 - s)).toFixed(1)}) scale(${s.toFixed(3)})`);
    });
  }

  // ---- gancho (quadro 0) — some na c7 e volta no fim (loop)
  const gHook = WB.group();
  WB.showNow(WB.textStrokes('QUANTAS BOLINHAS', 540, 200, 96, INK.black, gHook, 'middle').strokes);
  WB.showNow(WB.textStrokes('PRETAS?', 540, 340, 130, INK.red, gHook, 'middle').strokes);
  WB.effect(t => {
    const a = tc(7, 0), b = tc(9, 0.82);
    let o = 1;
    if (t >= a && t < b) o = Math.max(0, 1 - (t - a) / 0.15);
    else if (t >= b) o = Math.min(1, (t - b) / 0.25);
    gHook.setAttribute('opacity', o.toFixed(3));
  });
  WB.restHand(1, 0, 1);

  // ---- c2: contagem 4-3-2-1
  ['4', '3', '2', '1'].forEach((n, i) => {
    const g = WB.group();
    WB.showNow(WB.textStrokes(n, 540, BY + 30, 150, i < 3 ? INK.blue : INK.red, g, 'middle').strokes);
    pop(g, tc(2, 0) + i * 1.0, i < 3 ? tc(2, 0) + (i + 1) * 1.0 : tc(3, 0), 540, BY - 20);
  });
  WB.restHand(2, 0, 1);

  // ---- c3: elas fogem
  msg(3, 0.3, 0.75, 'elas FOGEM do teu olho!', INK.red, 94, tc(4, 0));
  WB.restHand(3, 0.78, 1);

  // ---- c4: olha fixo na do meio
  const gAnel = WB.group();
  WB.draw(4, 0.05, 0.2, WB.strokePath(WB.loopEllipse(CX, CY, 40, 40), INK.red, 7, gAnel));
  WB.effect(t => gAnel.setAttribute('opacity', t >= tc(6, 0.6) ? Math.max(0, 1 - (t - tc(6, 0.6)) / 0.3).toFixed(3) : 1));
  msg(4, 0.22, 0.45, 'olha FIXO na do meio', INK.black, 100, tc(5, 0));
  WB.restHand(4, 0.47, 1);

  // ---- c5: a do lado pisca
  msg(5, 0.12, 0.6, 'as do lado PISCAM preto', INK.black, 92, tc(6, 0));
  WB.restHand(5, 0.62, 1);

  // ---- c6: apaga as linhas
  msg(6, 0.08, 0.5, 'apagando as linhas...', INK.blue, 100, tc(7, 0));
  WB.restHand(6, 0.52, 1);

  // ---- c7: ZERO
  const st = C.stamp('ZERO!', 540, 270, { size: 150, color: INK.red, rot: -6 });
  WB.draw(7, 0.02, 0.18, [st.box, st.text]);
  const gZero = st.box[0].el.parentNode;
  WB.effect(t => gZero.setAttribute('opacity', t >= tc(9, 0.8) ? Math.max(0, 1 - (t - tc(9, 0.8)) / 0.15).toFixed(3) : 1));
  msg(7, 0.3, 0.75, 'todas são BRANCAS', INK.blue, 106, tc(8, 0));
  WB.restHand(7, 0.77, 1);

  // ---- c8: o cérebro inventa
  msg(8, 0.1, 0.5, 'teu CÉREBRO pinta de preto', INK.black, 86, tc(9, 0));
  WB.restHand(8, 0.52, 1);

  // ---- c9: comenta + volta pro começo
  msg(9, 0.04, 0.4, 'quantas tu contou?', INK.orange, 104, tc(9, 0.84));
  WB.restHand(9, 0.42, 1);
};
