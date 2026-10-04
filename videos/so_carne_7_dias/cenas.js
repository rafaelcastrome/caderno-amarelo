// "O que acontece se você comer só carne por 7 dias?" (Caderno Amarelo) — arco de retenção.
// Gancho: post-it "?" (balança) colado no canto desde o início (WB.overlay); clímax revela "ÁGUA!".
// Folha 1: cenas 1-3 (prato, calendário, intestino). Folha 2: cenas 4-5 (pesquisa, balança). Folha 3: cenas 6-7.
window.CENAS = function (WB) {
  const { INK, C } = WB;

  // ---------- post-it da pegadinha (atravessa as folhas) ----------
  const postit = WB.group(WB.overlay);
  const inner = WB.group(postit, 'rotate(4 940 140)');
  const pd = 'M 850 50 L 1030 50 L 1030 214 Q 1000 234 850 230 Z';
  const pbg = WB.mk('path', { d: pd, fill: '#ffe066', 'fill-opacity': 0 }, inner);
  const pout = WB.strokePath(pd, '#a0790a', 4, inner);
  const mist = WB.group(inner);
  const interrog = WB.textStrokes('?', 940, 182, 120, INK.red, mist, 'middle');
  const rotulo = WB.textStrokes('balança', 940, 221, 30, INK.black, mist, 'middle');

  // ---------- CENA 1: gancho ----------
  WB.write(1, 0.02, 0.16, 'O que acontece se você', 430, 140, 68, INK.black, { anchor: 'middle' });
  const t2 = WB.write(1, 0.16, 0.32, 'comer SÓ carne por 7 dias?', 425, 240, 72, INK.red, { anchor: 'middle' });
  WB.draw(1, 0.32, 0.35, C.underline(425 - t2.width / 2, 425 + t2.width / 2, 266));
  // prato com bife
  const bd = 'M 430 450 Q 440 395 520 392 Q 610 388 650 420 Q 680 455 640 485 Q 580 510 500 500 Q 425 490 430 450 Z';
  const bifeBg = WB.mk('path', { d: bd, fill: '#c8574a', 'fill-opacity': 0 });
  const bife = WB.strokePath(bd, '#7a2e24', 8);
  WB.fillAfter(bifeBg, bife);
  WB.draw(1, 0.35, 0.44, [
    WB.strokePath(WB.loopEllipse(540, 450, 230, 105, 1.0, -1.6), INK.black, 7),
    WB.strokePath(WB.loopEllipse(540, 450, 175, 75, 1.0, -1.6), INK.gray, 4),
    bife,
    WB.strokePath('M 470 440 Q 540 425 610 440 M 480 465 Q 545 452 615 462', '#f3d6c8', 5),
  ]);
  const sem = WB.textStrokes('sem fruta · sem arroz · sem feijão', 540, 640, 58, INK.gray, null, 'middle');
  WB.draw(1, 0.44, 0.60, sem.strokes);
  WB.draw(1, 0.60, 0.64, WB.strokePath(WB.roughLine(540 - sem.width / 2, 622, 540 + sem.width / 2, 618, 2), INK.red, 6));
  WB.draw(1, 0.68, 0.79, pout);
  WB.fillAfter(pbg, pout);
  WB.draw(1, 0.79, 0.85, interrog.strokes);
  WB.draw(1, 0.85, 0.89, rotulo.strokes);
  WB.draw(1, 0.90, 0.94, WB.strokePath('M 830 330 Q 800 290 830 240 M 830 240 L 812 256 M 830 240 L 838 262', INK.red, 5));

  // ---------- CENA 2: dias 1-3, a "gripe low carb" ----------
  const days = [];
  for (let d = 0; d < 7; d++) {
    const x = 110 + d * 123;
    days.push(C.box(x, 700, x + 105, 790, INK.black, 5));
    days.push(WB.textStrokes(String(d + 1), x + 52, 765, 54, INK.black, null, 'middle').strokes);
  }
  WB.draw(2, 0.02, 0.14, [WB.textStrokes('dia', 60, 765, 40, INK.gray, null, 'middle').strokes, days]);
  WB.draw(2, 0.14, 0.20, [0, 1, 2].map(d => C.xMark(110 + d * 123 + 52, 745, 32, INK.red, 7)));
  WB.write(2, 0.20, 0.32, 'dor de cabeça · cansaço · enjoo', 540, 880, 56, INK.black, { anchor: 'middle' });
  WB.write(2, 0.34, 0.46, '= "gripe low carb"', 540, 975, 82, INK.red, { anchor: 'middle' });
  WB.write(2, 0.50, 0.64, 'estudo com 300 pessoas:', 540, 1060, 56, INK.blue, { anchor: 'middle' });
  WB.write(2, 0.66, 0.82, 'some em até 1 mês', 540, 1130, 64, INK.blue, { anchor: 'middle' });
  WB.restHand(2, 0.86, 0.99);

  // ---------- CENA 3: menos gases ----------
  WB.draw(3, 0.04, 0.20, WB.strokePath(
    'M 130 1210 Q 300 1180 330 1240 Q 350 1300 220 1300 Q 110 1300 130 1360 Q 150 1420 300 1400 Q 380 1390 360 1460 Q 340 1520 180 1510',
    '#c0587a', 16));
  const bolhas = WB.group();
  WB.draw(3, 0.20, 0.28, [[245, 1235, 16], [180, 1330, 12], [300, 1430, 18], [210, 1480, 11], [330, 1300, 10]]
    .map(([x, y, r]) => WB.strokePath(WB.circlePath(x, y, r), INK.green, 5, bolhas)));
  WB.write(3, 0.28, 0.38, 'menos gases!', 450, 1290, 84, INK.green);
  WB.write(3, 0.45, 0.62, 'gás = bactérias', 450, 1380, 56, INK.black);
  WB.write(3, 0.62, 0.78, 'fermentando carboidrato', 450, 1445, 56, INK.black);
  WB.fade(3, 0.80, 0.88, bolhas, 1, 0.12);
  WB.restHand(3, 0.88, 0.99);

  // ---------- CENA 4: "e quem jura que se sente ótimo?" ----------
  WB.newPage(4, 0.0, 0.05);
  const q4 = WB.write(4, 0.05, 0.18, 'E quem jura que se sente ótimo?', 415, 170, 56, INK.red, { anchor: 'middle' });
  WB.draw(4, 0.18, 0.20, C.underline(415 - q4.width / 2, 415 + q4.width / 2, 196));
  WB.draw(4, 0.20, 0.30, [
    C.stickFigure(200, 330, { scale: 0.62 }),
    WB.strokePath(WB.roundRectPath(330, 280, 560, 110, 40), INK.green, 6),
    WB.strokePath('M 345 360 L 280 400 L 350 385', INK.green, 6),
    WB.textStrokes('"me sinto ótimo!"', 610, 352, 62, INK.green, null, 'middle').strokes,
  ]);
  // lupa
  WB.draw(4, 0.32, 0.38, [WB.strokePath(WB.circlePath(200, 690, 70), INK.black, 8),
    WB.strokePath('M 250 740 L 320 815', INK.black, 14)]);
  WB.write(4, 0.38, 0.47, 'pesquisa de 2021:', 370, 620, 56, INK.gray);
  WB.write(4, 0.47, 0.55, '2.029 pessoas pela internet', 370, 690, 56, INK.black);
  WB.write(4, 0.55, 0.65, 'que já seguiam a dieta', 370, 760, 56, INK.black);
  WB.write(4, 0.66, 0.77, 'respondendo por conta própria', 370, 830, 56, INK.black);
  const caut = C.stamp('autores: CAUTELA!', 540, 960, { size: 70, rot: -5 });
  WB.draw(4, 0.80, 0.84, caut.box);
  WB.draw(4, 0.84, 0.95, caut.text);

  // ---------- CENA 5: a balança ----------
  WB.draw(5, 0.04, 0.26, [
    WB.strokePath(WB.roundRectPath(340, 1060, 400, 250, 50), INK.black, 8),
    WB.strokePath(WB.roundRectPath(430, 1092, 220, 86, 14), INK.black, 6),
    WB.strokePath('M 400 1275 L 470 1275 M 610 1275 L 680 1275', INK.gray, 10),
  ]);
  WB.draw(5, 0.26, 0.40, [WB.textStrokes('kg', 600, 1155, 52, INK.black, null, 'middle').strokes,
    C.arrow(500, 1104, 500, 1164, INK.red, 7)]);
  WB.write(5, 0.42, 0.62, '"eba, emagreci!"', 540, 1400, 72, INK.green, { anchor: 'middle' });
  WB.draw(5, 0.62, 0.66, WB.strokePath('M 790 1080 L 830 1040 M 820 1130 L 880 1120 M 260 1070 L 220 1030 M 250 1140 L 190 1130', INK.orange, 6));
  WB.write(5, 0.68, 0.84, 'Mas espera aí…', 540, 1495, 72, INK.red, { anchor: 'middle' });

  // ---------- CENA 6: CLÍMAX — o post-it revela ----------
  WB.newPage(6, 0.0, 0.06);
  WB.write(6, 0.06, 0.13, 'O segredo da balança:', 540, 230, 80, INK.black, { anchor: 'middle' });
  const S = 2.8, tx = 540 - 940 * S, ty = 640 - 140 * S;
  WB.transform(6, 0.13, 0.25, postit, { x: 0, y: 0, s: 1 }, { x: tx, y: ty, s: S });
  {
    const a = WB.at(6, 0.13), b = WB.at(6, 0.25);
    WB.handFollow(a, b, (t) => {
      const u = WB.ease(WB.clamp((t - a) / (b - a)));
      const s = WB.lerp(1, S, u);
      return { x: s * 1000 + WB.lerp(0, tx, u), y: s * 222 + WB.lerp(0, ty, u) };
    }, INK.black);
  }
  WB.fade(6, 0.25, 0.28, mist, 1, 0);
  WB.draw(6, 0.28, 0.33, WB.textStrokes('boa parte era', 540, 530, 54, INK.black, WB.overlay, 'middle').strokes);
  WB.draw(6, 0.33, 0.44, WB.textStrokes('ÁGUA!', 540, 720, 190, INK.blue, WB.overlay, 'middle').strokes);
  const gota = (x, y, s) => WB.strokePath(`M ${x} ${y - 30 * s} Q ${x + 24 * s} ${y} ${x} ${y + 14 * s} Q ${x - 24 * s} ${y} ${x} ${y - 30 * s} Z`, INK.blue, 5, WB.overlay);
  WB.draw(6, 0.44, 0.48, [gota(370, 820, 1.1), gota(540, 830, 1), gota(710, 820, 1.1)]);
  WB.write(6, 0.48, 0.60, '1 g de glicogênio', 540, 1000, 62, INK.black, { anchor: 'middle' });
  WB.write(6, 0.60, 0.74, 'segura 3 g de água!', 540, 1090, 76, INK.blue, { anchor: 'middle' });
  WB.write(6, 0.78, 0.94, 'Gordura? Quase nada… ainda.', 540, 1200, 66, INK.red, { anchor: 'middle' });

  // ---------- CENA 7: fechamento + CTA ----------
  WB.write(7, 0.03, 0.30, 'Vai testar? Fala com um médico antes.', 540, 1340, 56, INK.black, { anchor: 'middle' });
  WB.write(7, 0.40, 0.66, 'Me segue: @caderno_amarelo', 540, 1460, 66, INK.red, { anchor: 'middle' });
  WB.restHand(7, 0.70, 0.99);
};
