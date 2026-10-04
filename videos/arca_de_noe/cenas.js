// "A Arca de Noé foi encontrada na Turquia?" (Caderno Amarelo) — arco de retenção.
// Gancho: post-it "?" (quem?) colado no canto; clímax revela que o maior defensor da arca desmentiu.
// Folhas: 1) mapa + linha do tempo  2) réguas (côvados) + amostras  3) geologia  4) reviravolta + CTA.
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const BROWN = '#8b5a2b';

  // ---------- post-it (atravessa as folhas) ----------
  const postit = WB.group(WB.overlay);
  const inner = WB.group(postit, 'rotate(4 940 140)');
  const pd = 'M 850 50 L 1030 50 L 1030 214 Q 1000 234 850 230 Z';
  const pbg = WB.mk('path', { d: pd, fill: '#ffe066', 'fill-opacity': 0 }, inner);
  const pout = WB.strokePath(pd, '#a0790a', 4, inner);
  const mist = WB.group(inner);
  const interrog = WB.textStrokes('?', 940, 182, 120, INK.red, mist, 'middle');
  const rotulo = WB.textStrokes('quem?', 940, 221, 32, INK.black, mist, 'middle');

  // ---------- CENA 1: gancho (mapa) ----------
  WB.write(1, 0.02, 0.10, 'A Arca de Noé', 430, 150, 96, INK.black, { anchor: 'middle' });
  const t2 = WB.write(1, 0.10, 0.18, 'foi encontrada?', 430, 250, 96, INK.red, { anchor: 'middle' });
  WB.draw(1, 0.18, 0.20, C.underline(430 - t2.width / 2, 430 + t2.width / 2, 280));
  const hd = 'M 110 640 Q 330 520 560 600 Q 520 690 330 702 Q 150 700 110 640 Z';
  const hbg = WB.mk('path', { d: hd, fill: '#c9a27a', 'fill-opacity': 0 });
  const hill = WB.strokePath(hd, BROWN, 8);
  WB.draw(1, 0.20, 0.27, [hill, WB.strokePath('M 170 640 Q 330 590 500 620 M 200 670 Q 330 640 470 655', BROWN, 4)]);
  WB.fillAfter(hbg, hill);
  WB.write(1, 0.27, 0.34, 'colina "barco"', 335, 770, 56, BROWN, { anchor: 'middle' });
  WB.draw(1, 0.35, 0.44, [
    WB.strokePath('M 640 705 L 820 420 L 1010 705', INK.black, 8),
    WB.strokePath('M 762 512 L 790 500 L 805 525 L 830 495 L 856 515 L 878 507', INK.blue, 6),
    WB.textStrokes('Monte Ararat', 825, 770, 54, INK.black, null, 'middle').strokes,
  ]);
  WB.draw(1, 0.44, 0.53, [
    WB.strokePath(WB.dashedLine(560, 700, 600, 16, 12), INK.red, 6),
    WB.textStrokes('29 km', 630, 575, 60, INK.red, null, 'middle').strokes,
  ]);
  WB.write(1, 0.53, 0.58, 'Gn 8:4', 905, 440, 40, INK.gray, { anchor: 'middle' });
  WB.draw(1, 0.64, 0.76, pout);
  WB.fillAfter(pbg, pout);
  WB.draw(1, 0.76, 0.83, interrog.strokes);
  WB.draw(1, 0.83, 0.88, rotulo.strokes);
  WB.draw(1, 0.89, 0.94, WB.strokePath('M 840 330 Q 810 290 838 245 M 838 245 L 818 258 M 838 245 L 846 266', INK.red, 5));

  // ---------- CENA 2: descoberta ----------
  WB.write(2, 0.04, 0.12, '1948', 120, 940, 84, INK.red);
  WB.draw(2, 0.12, 0.26, [
    WB.strokePath(WB.cloudPath(470, 900, 110, 50, 9), INK.gray, 6),
    WB.strokePath('M 420 965 L 405 1000 M 470 965 L 455 1000 M 520 965 L 505 1000', INK.blue, 5),
    WB.strokePath('M 640 880 L 670 920 L 650 935 L 690 985', INK.orange, 7),
  ]);
  WB.write(2, 0.26, 0.34, 'chuva + terremotos', 360, 1065, 56, INK.black);
  WB.write(2, 0.38, 0.46, '1959', 120, 1190, 84, INK.red);
  WB.draw(2, 0.46, 0.56, [
    WB.strokePath(WB.roundRectPath(360, 1120, 120, 80, 14), INK.black, 6),
    WB.strokePath(WB.circlePath(420, 1160, 24), INK.black, 6),
    WB.strokePath('M 380 1120 L 395 1104 L 425 1104 L 440 1120', INK.black, 6),
  ]);
  WB.write(2, 0.56, 0.62, 'foto aérea', 510, 1180, 58, INK.black);
  WB.write(2, 0.62, 0.78, 'capitão İlhan Durupınar', 120, 1300, 60, INK.blue);
  WB.draw(2, 0.80, 0.83, C.arrow(120, 1380, 185, 1380, INK.black, 6));
  WB.write(2, 0.83, 0.90, '"Formação Durupınar"', 205, 1400, 64, INK.black);
  WB.restHand(2, 0.92, 0.99);

  // ---------- CENA 3: as réguas (côvados) ----------
  WB.newPage(3, 0.0, 0.04);
  const bt = WB.write(3, 0.04, 0.12, 'Bate o tamanho?', 430, 170, 84, INK.red, { anchor: 'middle' });
  WB.draw(3, 0.12, 0.13, C.underline(430 - bt.width / 2, 430 + bt.width / 2, 198));
  const PXM = 5; // 5 px por metro
  const barra = (y, metros, color) => C.bar(140, y, y + 50 + 4, metros * PXM, color, null, 0.55);
  const b1 = barra(305, 160, BROWN);
  WB.draw(3, 0.13, 0.22, [WB.textStrokes('colina: ~160 m', 140, 290, 54, BROWN).strokes, b1.outline, b1.hatch]);
  WB.write(3, 0.24, 0.32, 'Bíblia: 300 côvados (Gn 6:15)', 540, 450, 56, INK.black, { anchor: 'middle' });
  const b2 = barra(555, 157, INK.green);
  WB.draw(3, 0.36, 0.58, [WB.textStrokes('côvado egípcio (52 cm) = 157 m', 140, 540, 50, INK.green).strokes, b2.outline, b2.hatch]);
  const b3 = barra(715, 135, INK.orange);
  WB.draw(3, 0.62, 0.84, [WB.textStrokes('côvado comum (45 cm) = 135 m', 140, 700, 50, INK.orange).strokes, b3.outline, b3.hatch]);
  WB.write(3, 0.86, 0.95, 'Depende da régua!', 540, 870, 78, INK.red, { anchor: 'middle' });

  // ---------- CENA 4: as amostras ----------
  const tubo = (x) => [
    WB.strokePath(`M ${x} 960 L ${x} 1190 Q ${x} 1225 ${x + 30} 1225 Q ${x + 60} 1225 ${x + 60} 1190 L ${x + 60} 960`, INK.black, 6),
    WB.strokePath(`M ${x + 8} 1110 L ${x + 52} 1110`, BROWN, 14),
  ];
  WB.draw(4, 0.05, 0.22, [tubo(130), tubo(220), tubo(310)]);
  WB.write(4, 0.25, 0.42, '~30 amostras de solo', 430, 1010, 60, INK.black);
  WB.write(4, 0.45, 0.60, 'argila + material marinho', 430, 1090, 56, INK.black);
  WB.write(4, 0.62, 0.80, '3.500 a 5.000 anos!', 430, 1190, 76, INK.blue);
  WB.write(4, 0.82, 0.90, '…mas tem um detalhe', 540, 1340, 68, INK.red, { anchor: 'middle' });
  WB.restHand(4, 0.92, 0.99);

  // ---------- CENA 5: a explicação geológica ----------
  WB.newPage(5, 0.0, 0.04);
  WB.write(5, 0.05, 0.22, 'idade do solo ≠ barco', 430, 185, 72, INK.red, { anchor: 'middle' });
  WB.write(5, 0.24, 0.32, 'Para os geólogos:', 120, 330, 62, INK.black);
  WB.draw(5, 0.34, 0.50, [
    WB.strokePath('M 100 1060 Q 300 1050 540 1062 T 980 1058', INK.gray, 5),
    WB.strokePath('M 100 1000 Q 300 990 540 1002 T 980 998', INK.gray, 5),
    WB.strokePath('M 100 940 Q 300 930 540 942 T 980 938', INK.gray, 5),
    WB.strokePath('M 150 720 Q 540 960 930 720', BROWN, 24),
    WB.strokePath('M 195 765 Q 540 990 885 765', BROWN, 11),
  ]);
  WB.draw(5, 0.50, 0.60, [WB.textStrokes('rocha dura dobrada', 540, 680, 58, BROWN, null, 'middle').strokes,
    WB.textStrokes('camadas mais moles', 540, 1130, 54, INK.gray, null, 'middle').strokes]);
  WB.draw(5, 0.60, 0.74, [
    C.arrow(110, 600, 180, 690, INK.blue, 6), C.arrow(970, 600, 900, 690, INK.blue, 6),
    WB.textStrokes('erosão', 110, 570, 54, INK.blue).strokes,
    WB.textStrokes('erosão', 975, 570, 54, INK.blue, null, 'end').strokes,
  ]);
  WB.write(5, 0.76, 0.84, 'madeira?', 430, 1290, 84, INK.black, { anchor: 'middle' });
  WB.draw(5, 0.84, 0.89, C.xMark(670, 1262, 42, INK.red, 10));
  WB.write(5, 0.84, 0.89, 'nunca comprovada', 430, 1375, 58, INK.red, { anchor: 'middle' });
  WB.restHand(5, 0.91, 0.99);

  // ---------- CENA 6: CLÍMAX — a reviravolta ----------
  WB.newPage(6, 0.0, 0.04);
  WB.write(6, 0.04, 0.10, 'A reviravolta:', 540, 230, 88, INK.black, { anchor: 'middle' });
  const S = 2.8, tx = 540 - 940 * S, ty = 640 - 140 * S;
  WB.transform(6, 0.10, 0.20, postit, { x: 0, y: 0, s: 1 }, { x: tx, y: ty, s: S });
  {
    const a = WB.at(6, 0.10), b = WB.at(6, 0.20);
    WB.handFollow(a, b, (t) => {
      const u = WB.ease(WB.clamp((t - a) / (b - a)));
      const s = WB.lerp(1, S, u);
      return { x: s * 1000 + WB.lerp(0, tx, u), y: s * 222 + WB.lerp(0, ty, u) };
    }, INK.black);
  }
  WB.fade(6, 0.20, 0.23, mist, 1, 0);
  WB.draw(6, 0.23, 0.31, WB.textStrokes('David Fasold', 540, 560, 76, INK.black, WB.overlay, 'middle').strokes);
  WB.draw(6, 0.31, 0.40, WB.textStrokes('defensor da arca', 540, 630, 48, INK.gray, WB.overlay, 'middle').strokes);
  WB.draw(6, 0.40, 0.52, WB.textStrokes('escavou + livro', 540, 700, 48, INK.gray, WB.overlay, 'middle').strokes);
  WB.draw(6, 0.54, 0.64, WB.textStrokes('mudou de ideia!', 540, 800, 76, INK.red, WB.overlay, 'middle').strokes);
  WB.write(6, 0.66, 0.78, '1996 · artigo científico:', 540, 1000, 58, INK.black, { anchor: 'middle' });
  const st = C.stamp('"estrutura geológica comum"', 540, 1110, { size: 58, rot: -4, color: INK.blue });
  WB.draw(6, 0.80, 0.84, st.box);
  WB.draw(6, 0.84, 0.95, st.text);

  // ---------- CENA 7: fechamento + CTA ----------
  WB.write(7, 0.03, 0.24, 'E você? É a arca?', 540, 1300, 72, INK.black, { anchor: 'middle' });
  WB.write(7, 0.24, 0.36, 'Comenta aí!', 540, 1390, 66, INK.green, { anchor: 'middle' });
  WB.write(7, 0.44, 0.66, '@caderno_amarelo', 540, 1500, 66, INK.red, { anchor: 'middle' });
  WB.restHand(7, 0.70, 0.99);
};
