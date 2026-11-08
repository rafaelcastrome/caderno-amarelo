// "Descobre teu olho dominante" (teste com o dedo, formato tradicional whiteboard).
// c1 gancho · c2 tampa o X · c3 espera 3 s · c4 fecha o esquerdo · c5 pulou? · c6 fecha o direito · c7 resultado · c8 70% / destro · c9 comenta + manda pro amigo
window.CENAS = function (WB) {
  const { INK, C } = WB;
  // marca d'água anda pelo rodapé
  const wmRect = document.querySelector('rect[fill="#fffaf0"]');
  if (wmRect) { const wm = wmRect.parentNode; WB.effect(t => wm.setAttribute('transform', `translate(${(280 * Math.sin(2 * Math.PI * t / 14)).toFixed(1)} 0)`)); }

  // grupo some (apaga rápido) entre tA e tB; antes disso, o motor revela os traços normalmente
  function ate(g, tA, tB) {
    WB.effect(t => {
      let o = t < tA ? 1 : Math.max(0, 1 - (t - tA) / 0.18);
      if (tB !== undefined && t >= tB) o = Math.min(1, (t - tB) / 0.18);
      g.setAttribute('opacity', o.toFixed(3));
    });
  }
  function pop(g, t0, cx, cy) {
    WB.effect(t => {
      if (t < t0) { g.setAttribute('opacity', 0); return; }
      const u = Math.min(1, (t - t0) / 0.14), s = 1.25 - 0.25 * u;
      g.setAttribute('opacity', 1);
      g.setAttribute('transform', `translate(${(cx * (1 - s)).toFixed(1)} ${(cy * (1 - s)).toFixed(1)}) scale(${s.toFixed(3)})`);
    });
  }
  // olho visto de frente (lado esquerdo da tela = olho esquerdo de quem assiste)
  function olho(cx, cy, aberto, cor, g) {
    if (aberto) return [
      WB.strokePath(`M ${cx - 80} ${cy} Q ${cx} ${cy - 70} ${cx + 80} ${cy} Q ${cx} ${cy + 70} ${cx - 80} ${cy}`, cor, 8, g),
      WB.strokePath(WB.circlePath(cx, cy, 26), cor, 8, g),
      WB.strokePath(WB.circlePath(cx, cy, 9), cor, 10, g)];
    return [
      WB.strokePath(`M ${cx - 80} ${cy} Q ${cx} ${cy + 45} ${cx + 80} ${cy}`, cor, 9, g),
      WB.strokePath(`M ${cx - 45} ${cy + 22} l -14 26 M ${cx} ${cy + 30} l 0 30 M ${cx + 45} ${cy + 22} l 14 26`, cor, 7, g)];
  }
  // dedo apontando pra cima (ponta em cx, yTop), pintado de pele por cima do que estiver atrás
  function dedo(cx, yTop, g, alt = 240) {
    const d = `M ${cx - 30} ${yTop + alt} L ${cx - 30} ${yTop + 30} Q ${cx - 30} ${yTop} ${cx} ${yTop} Q ${cx + 30} ${yTop} ${cx + 30} ${yTop + 30} L ${cx + 30} ${yTop + alt}`;
    const fillEl = WB.mk('path', { d: d + ' Z', fill: '#f4c9a4', 'fill-opacity': 0 }, g);
    const st = [WB.strokePath(d, INK.black, 7, g), WB.strokePath(`M ${cx - 14} ${yTop + 34} Q ${cx} ${yTop + 22} ${cx + 14} ${yTop + 34}`, INK.black, 5, g)];
    WB.fillAfter(fillEl, st, 0.15);
    return st;
  }
  const T = (c, f) => WB.at(c, f);

  // ---- alvo: X grande fixo no meio (fica igual durante todo o teste)
  const gx = WB.group();
  WB.showNow(WB.strokePath(`M 455 795 L 625 965 M 625 795 L 455 965`, INK.black, 22, gx));
  ate(gx, T(7, 0), T(9, 0.55));

  // ---- quadro 0: gancho
  const g1 = WB.group();
  WB.showNow(WB.textStrokes('QUAL É TEU', 540, 230, 110, INK.black, g1, 'middle').strokes);
  WB.showNow(WB.textStrokes('OLHO DOMINANTE?', 540, 380, 118, INK.red, g1, 'middle').strokes);
  ate(g1, T(2, 0));
  // c1
  const g1b = WB.group();
  WB.write(1, 0.45, 0.9, 'descobre em 5 segundos', 540, 1280, 80, INK.blue, { anchor: 'middle', parent: g1b });
  ate(g1b, T(2, 0));

  // ---- c2: braço esticado + tampa o X com o dedo, 2 olhos abertos
  const g2 = WB.group();
  WB.write(2, 0.02, 0.22, 'braço esticado', 540, 230, 96, INK.black, { anchor: 'middle', parent: g2 });
  WB.write(2, 0.3, 0.55, 'TAMPA O X COM O DEDO', 540, 380, 92, INK.red, { anchor: 'middle', parent: g2 });
  WB.draw(2, 0.58, 0.66, WB.strokePath(WB.loopEllipse(540, 880, 150, 150), INK.red, 8, g2));
  // mini desenho: X pequeno com o dedo na frente
  WB.draw(2, 0.68, 0.74, WB.strokePath('M 472 1165 L 508 1201 M 508 1165 L 472 1201', INK.black, 12, g2));
  WB.draw(2, 0.75, 0.84, dedo(490, 1150, g2));
  WB.write(2, 0.85, 0.92, 'assim ó', 760, 1230, 76, INK.blue, { anchor: 'middle', parent: g2 });
  WB.draw(2, 0.925, 0.95, WB.strokePath('M 690 1250 L 565 1250 ' + WB.arrowHead(560, 1250, Math.PI, 28), INK.blue, 7, g2));
  
  WB.write(2, 0.955, 0.995, 'os 2 olhos abertos', 540, 1470, 70, INK.blue, { anchor: 'middle', parent: g2 });
  ate(g2, T(4, 0));
  WB.restHand(2, 0.995, 1);

  // ---- c3: espera 3 s (barra encolhendo)
  const gb = WB.group();
  WB.mk('rect', { x: 150, y: 1545, width: 780, height: 56, rx: 18, fill: 'none', stroke: INK.black, 'stroke-width': 6 }, gb);
  const fill = WB.mk('rect', { x: 158, y: 1553, width: 764, height: 40, rx: 12, fill: INK.blue, opacity: 0.85 }, gb);
  WB.effect(t => {
    const t0 = T(3, 0), t1 = T(3, 1);
    if (t < t0 || t >= t1) { gb.setAttribute('opacity', 0); return; }
    gb.setAttribute('opacity', 1);
    fill.setAttribute('width', (764 * (1 - Math.min(1, (t - t0) / 5))).toFixed(1));
  });
  for (let k = 0; k < 5; k++) {
    const gn = WB.group();
    WB.showNow(WB.textStrokes(String(5 - k), 540, 1730, 110, k >= 3 ? INK.red : INK.black, gn, 'middle').strokes);
    pop(gn, T(3, 0) + k, 540, 1690);
    WB.effect(t => { if (t >= T(3, 0) + k + 1 || t >= T(3, 1)) gn.setAttribute('opacity', 0); });
  }
  WB.restHand(3, 0, 1);

  // ---- c4: fecha o esquerdo
  const g4 = WB.group();
  WB.write(4, 0.02, 0.18, 'FECHA O', 540, 230, 110, INK.black, { anchor: 'middle', parent: g4 });
  WB.write(4, 0.2, 0.42, 'ESQUERDO', 540, 380, 130, INK.blue, { anchor: 'middle', parent: g4 });
  const g4o = WB.group();
  WB.draw(4, 0.44, 0.6, [olho(380, 1210, false, INK.blue, g4o), olho(700, 1210, true, INK.blue, g4o)]);
  WB.write(4, 0.62, 0.72, 'esquerdo', 380, 1340, 56, INK.gray, { anchor: 'middle', parent: g4o });
  ate(g4o, T(5, 0));
  ate(g4, T(6, 0));
  WB.restHand(4, 0.74, 1);
  // ---- c5: ficou ou pulou?
  const g5 = WB.group();
  // mini desenho: dedo parado e o X pulando pro lado
  WB.draw(5, 0.0, 0.1, dedo(420, 1130, g5, 220));
  WB.draw(5, 0.11, 0.19, WB.strokePath('M 610 1120 L 690 1200 M 690 1120 L 610 1200', INK.orange, 12, g5));
  WB.draw(5, 0.2, 0.27, C.curvedArrow(450, 1110, 530, 1020, 600, 1110, INK.orange, 7, g5));
  WB.write(5, 0.3, 0.6, 'ficou atrás do dedo...', 540, 1490, 70, INK.black, { anchor: 'middle', parent: g5 });
  WB.write(5, 0.62, 0.8, 'ou PULOU?', 540, 1610, 96, INK.orange, { anchor: 'middle', parent: g5 });
  ate(g5, T(6, 0));
  WB.restHand(5, 0.82, 1);

  // ---- c6: fecha o direito
  const g6 = WB.group();
  WB.write(6, 0.02, 0.16, 'AGORA O', 540, 230, 110, INK.black, { anchor: 'middle', parent: g6 });
  WB.write(6, 0.18, 0.4, 'DIREITO', 540, 380, 130, INK.green, { anchor: 'middle', parent: g6 });
  WB.draw(6, 0.42, 0.58, [olho(380, 1210, true, INK.green, g6), olho(700, 1210, false, INK.green, g6)]);
  WB.write(6, 0.6, 0.7, 'direito', 700, 1340, 56, INK.gray, { anchor: 'middle', parent: g6 });
  ate(g6, T(7, 0));
  WB.restHand(6, 0.72, 1);

  // ---- c7: resultado (folha toda, X some)
  const g7 = WB.group();
  WB.write(7, 0.02, 0.12, 'o X pulou quando', 540, 260, 84, INK.black, { anchor: 'middle', parent: g7 });
  WB.write(7, 0.13, 0.22, 'fechou o DIREITO?', 540, 380, 92, INK.green, { anchor: 'middle', parent: g7 });
  WB.draw(7, 0.23, 0.27, WB.strokePath('M 540 420 L 540 520', INK.black, 8, g7));
  WB.write(7, 0.28, 0.42, 'OLHO DIREITO', 540, 640, 120, INK.green, { anchor: 'middle', parent: g7 });
  WB.write(7, 0.5, 0.6, 'pulou no ESQUERDO?', 540, 900, 92, INK.blue, { anchor: 'middle', parent: g7 });
  WB.draw(7, 0.61, 0.65, WB.strokePath('M 540 940 L 540 1040', INK.black, 8, g7));
  WB.write(7, 0.66, 0.84, 'OLHO ESQUERDO', 540, 1160, 120, INK.blue, { anchor: 'middle', parent: g7 });
  ate(g7, T(9, 0));
  WB.restHand(7, 0.86, 1);

  // ---- c8: 70% + destro que mira com o esquerdo
  const g8 = WB.group();
  WB.write(8, 0.0, 0.14, '70%', 300, 1440, 150, INK.red, { anchor: 'middle', parent: g8 });
  WB.writeLines(8, 0.15, 0.32, ['das pessoas', 'é do direito'], 700, 1380, 64, INK.black, { anchor: 'middle', lineHeight: 80, parent: g8 });
  WB.draw(8, 0.33, 0.37, WB.strokePath(WB.loopEllipse(300, 1395, 140, 95), INK.red, 7, g8));
  ate(g8, T(8, 0.42));
  const g8b = WB.group();
  WB.write(8, 0.45, 0.62, 'muito DESTRO', 540, 1420, 100, INK.orange, { anchor: 'middle', parent: g8b });
  WB.write(8, 0.64, 0.86, 'mira com o ESQUERDO!', 540, 1560, 88, INK.blue, { anchor: 'middle', parent: g8b });
  ate(g8b, T(9, 0));
  WB.restHand(8, 0.88, 1);

  // ---- c9: comenta + manda pro amigo; X volta pro loop
  const g9 = WB.group();
  WB.write(9, 0.02, 0.22, 'DIREITO ou ESQUERDO?', 540, 260, 96, INK.red, { anchor: 'middle', parent: g9 });
  WB.write(9, 0.24, 0.38, 'comenta aí!', 540, 400, 84, INK.black, { anchor: 'middle', parent: g9 });
  WB.write(9, 0.6, 0.85, 'manda pro amigo testar', 540, 1300, 80, INK.blue, { anchor: 'middle', parent: g9 });
  WB.restHand(9, 0.87, 1);
};
