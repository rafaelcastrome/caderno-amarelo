// Exemplo completo: "Voto útil no 1º turno" (8 cenas, ~95 s).
// Mostra: título + ícone que encolhe, gráfico de barras, blocos arrastados pela mão,
// marcações (X, círculo), troca de página, história com boneco e balão, moral e redes.
window.CENAS = function (WB) {
  const { INK, C } = WB;

  // ---------- CENA 1: título + urna ----------
  const title = WB.write(1, 0.04, 0.47, 'Voto Útil no 1º Turno?', 60, 205, 104, INK.black);
  WB.draw(1, 0.49, 0.58, C.underline(56, 66 + title.width, 238));
  const urn = C.ballotBox(330, 640, 1);
  WB.draw(1, 0.60, 0.85, urn.strokes);
  WB.draw(1, 0.86, 0.98, WB.textStrokes('?', 540, 1105, 300, INK.red, urn.group, 'middle').strokes);
  // a urna encolhe e vira um ícone ao lado do título
  const sc = 0.27, tx = Math.min(60 + title.width + 30, 1040 - 510 * sc) - 330 * sc, ty = 95 - 735 * sc;
  WB.transform(2, 0, 0.11, urn.group, { x: 0, y: 0, s: 1 }, { x: tx, y: ty, s: sc });

  // ---------- CENA 2: gráfico + linha de 50% + 1 ----------
  const BASE = 1220, PX = 14, yOf = (p) => BASE - p * PX, META = yOf(50);
  WB.draw(2, 0.07, 0.27, [C.axes(130, BASE, 440, 1045),
    WB.strokePath(WB.roughLine(118, yOf(25), 142, yOf(25), 1) + ' ' + WB.roughLine(118, META, 142, META, 1), INK.black, 6)]);
  WB.draw(2, 0.28, 0.40, [
    WB.textStrokes('0', 108, BASE + 12, 42, INK.black, null, 'end').strokes,
    WB.textStrokes('25%', 110, yOf(25) + 12, 40, INK.black, null, 'end').strokes,
    WB.textStrokes('50%', 110, META + 12, 40, INK.red, null, 'end').strokes,
  ]);
  WB.draw(2, 0.44, 0.62, WB.strokePath(WB.dashedLine(140, 1045, META), INK.red, 9));
  WB.write(2, 0.64, 0.97, 'Meta 1º Turno: 50% + 1', 1040, META - 22, 60, INK.red, { anchor: 'end' });

  // ---------- CENA 3: barras ----------
  const a = C.bar(200, yOf(43), BASE, 100, INK.blue);
  WB.draw(3, 0.02, 0.10, a.outline); WB.draw(3, 0.10, 0.21, a.hatch);
  WB.write(3, 0.21, 0.27, '43%', 250, yOf(43) - 16, 54, INK.blue, { anchor: 'middle' });
  WB.write(3, 0.27, 0.35, 'Candidato A', 250, BASE + 52, 40, INK.blue, { anchor: 'middle' });
  const b = C.bar(400, yOf(28), BASE, 100, INK.green);
  WB.draw(3, 0.37, 0.43, b.outline); WB.draw(3, 0.43, 0.51, b.hatch);
  const b28 = WB.group();
  WB.write(3, 0.51, 0.56, '28%', 450, yOf(28) - 16, 54, INK.green, { anchor: 'middle', parent: b28 });
  WB.write(3, 0.56, 0.64, 'Candidato B', 450, BASE + 52, 40, INK.green, { anchor: 'middle' });
  const small = [
    { name: 'C', pct: 6, x: 600, f: [0.66, 0.76] },
    { name: 'D', pct: 5, x: 750, f: [0.77, 0.865] },
    { name: 'E', pct: 4, x: 900, f: [0.875, 0.97] },
  ];
  for (const s of small) {
    s.ghost = WB.group(); s.g = WB.group();
    const bb = C.bar(s.x, yOf(s.pct), BASE, 100, INK.green, s.g, 0.35);
    WB.draw(3, s.f[0], s.f[1], [bb.outline, bb.hatch,
      WB.textStrokes(`${s.pct}%`, s.x + 50, BASE - 4 - (s.pct * PX) / 2 + 14, 42, INK.black, s.g, 'middle').strokes,
      WB.textStrokes(s.name, s.x + 50, BASE + 52, 44, INK.green, null, 'middle').strokes]);
    WB.mk('path', { d: WB.roughRect(s.x, yOf(s.pct), s.x + 100, BASE - 4), fill: 'none', stroke: INK.gray,
      'stroke-width': 4, 'stroke-dasharray': '10 12', 'stroke-linecap': 'round' }, s.ghost);
    s.ghost.setAttribute('opacity', 0);
  }

  // ---------- CENA 4: setas e empilhamento sobre o B ----------
  let stackTop = yOf(28);
  const arrowG = WB.group();
  const arrowF = [[0.05, 0.16], [0.17, 0.28], [0.29, 0.40]], moveF = [[0.42, 0.50], [0.50, 0.58], [0.58, 0.66]];
  small.forEach((s, i) => {
    const h = s.pct * PX, dx = 400 - s.x, dy = (stackTop - h) - yOf(s.pct);
    stackTop -= h;
    const sx = s.x + 50, sy = yOf(s.pct) - 14, ex = 512 + i * 6, ey = stackTop + h / 2;
    WB.draw(4, arrowF[i][0], arrowF[i][1], C.curvedArrow(sx, sy, (sx + ex) / 2 + 40, Math.min(sy, ey) - 170 - i * 40, ex, ey, INK.black, 6, arrowG));
    WB.moveGroup(4, moveF[i][0], moveF[i][1], s.g, dx, dy, { grab: { x: s.x + 62, y: yOf(s.pct) + 10 }, color: INK.green });
    WB.fade(4, moveF[i][0], moveF[i][0] + 0.03, s.ghost, 0, 0.9);
  });
  WB.fade(4, moveF[0][0] + 0.02, moveF[0][0] + 0.06, b28, 1, 0);
  WB.fade(4, 0.66, 0.71, arrowG, 1, 0.12);
  WB.write(4, 0.71, 0.86, '28+6+5+4', 560, 668, 56, INK.green);
  WB.write(4, 0.87, 0.98, '= 43%', 600, 738, 60, INK.green);

  // ---------- CENA 5: X no B, círculo no A ----------
  WB.draw(5, 0.30, 0.37, C.xMark(450, 569, 41));
  WB.write(5, 0.38, 0.45, 'Não!', 505, 594, 54, INK.red);
  WB.draw(5, 0.50, 0.65, C.circleAround(250, 902, 96, 326, INK.blue));
  WB.write(5, 0.67, 0.97, 'Continua com os mesmos 43%!', 60, 1372, 68, INK.blue);

  // ---------- CENA 6: única saída + resumo ----------
  WB.draw(6, 0.10, 0.18, C.curvedArrow(292, 560, 262, 400, 372, 336, INK.red, 8));
  WB.write(6, 0.19, 0.31, 'Única forma de baixar', 392, 344, 62, INK.red);
  WB.write(6, 0.31, 0.39, 'o % do líder!', 392, 410, 62, INK.red);
  WB.draw(6, 0.42, 0.50, C.box(48, 1425, 1032, 1818));
  WB.write(6, 0.51, 0.66, 'Soma da oposição < 50%+1', 540, 1540, 84, INK.black, { anchor: 'middle' });
  WB.write(6, 0.67, 0.77, '= Vai para o 2º turno', 540, 1652, 84, INK.black, { anchor: 'middle' });
  const last = WB.write(6, 0.78, 0.87, 'de qualquer jeito!', 540, 1762, 84, INK.red, { anchor: 'middle' });
  WB.draw(6, 0.875, 0.905, WB.strokePath(WB.wavyLine(540 - last.width / 2, 540 + last.width / 2, 1790, 5, 60), INK.red, 7));

  // ---------- CENA 7: a história do João (folha nova) ----------
  WB.newPage(7, 0.0, 0.06);
  const t7 = WB.write(7, 0.07, 0.17, 'A história do João', 540, 195, 100, INK.black, { anchor: 'middle' });
  WB.draw(7, 0.17, 0.20, C.underline(540 - t7.width / 2, 540 + t7.width / 2, 228, INK.blue));
  WB.draw(7, 0.20, 0.30, [C.stickFigure(230, 560, { label: 'João' }), C.box(296, 566, 350, 630, INK.blue, 5)]);
  WB.draw(7, 0.31, 0.38, C.thought(700, 480, 290, 160, 300, 540));
  WB.write(7, 0.38, 0.41, 'C', 575, 520, 120, INK.green, { anchor: 'middle' });
  WB.draw(7, 0.41, 0.44, C.arrow(630, 478, 745, 478));
  WB.write(7, 0.44, 0.47, 'B', 805, 520, 120, INK.green, { anchor: 'middle' });
  WB.write(7, 0.47, 0.55, 'p/ vencer o A no 1º turno!', 700, 592, 42, INK.black, { anchor: 'middle' });
  WB.draw(7, 0.56, 0.61, C.box(110, 1080, 970, 1580));
  WB.write(7, 0.61, 0.67, 'Noite da apuração', 540, 1165, 66, INK.black, { anchor: 'middle' });
  WB.write(7, 0.68, 0.74, 'A: 43%', 180, 1310, 100, INK.blue);
  WB.write(7, 0.74, 0.79, 'B: 43%', 180, 1450, 100, INK.green);
  const st = C.stamp('2º TURNO', 735, 1370, { size: 100 });
  WB.draw(7, 0.80, 0.83, st.box); WB.draw(7, 0.83, 0.89, st.text);
  WB.write(7, 0.89, 0.96, '…como iria de qualquer jeito!', 540, 1690, 64, INK.red, { anchor: 'middle' });

  // ---------- CENA 8: moral + redes ----------
  WB.newPage(8, 0.0, 0.05);
  const t8 = WB.write(8, 0.06, 0.13, 'Moral da história', 540, 200, 104, INK.red, { anchor: 'middle' });
  WB.draw(8, 0.13, 0.15, C.underline(540 - t8.width / 2, 540 + t8.width / 2, 234));
  WB.writeLines(8, 0.16, 0.31, ['No 1º turno, vote em quem', 'realmente te representa.'], 540, 380, 72, INK.black, { anchor: 'middle', lineHeight: 88 });
  WB.writeLines(8, 0.32, 0.45, ['O confronto direto', 'fica para o 2º turno!'], 540, 585, 72, INK.blue, { anchor: 'middle', lineHeight: 88 });
  WB.ctaRedes(8, 0.48, 0.84, { y: 780 });
  const box = C.ballotBox(540 - 255 * 0.42, 1500, 0.42, { ballot: false });
  WB.draw(8, 0.85, 0.92, box.strokes);
  WB.draw(8, 0.92, 0.95, WB.strokePath('M 430 985 L 515 1080 L 685 880', INK.green, 26, box.group));
};
