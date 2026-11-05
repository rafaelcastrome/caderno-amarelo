// "Teu pé vai te desobedecer" (pé girando + desenhar um 6 com a mão do mesmo lado).
// c1 gancho · c2 gira o pé · c3 desenha o 6 · c4 mudou! · c5 explicação · c6 duvido / manda pro amigo
window.CENAS = function (WB) {
  const { INK, C } = WB;
  WB.showNow(WB.textStrokes('TEU PÉ VAI TE', 540, 215, 100, INK.black, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('DESOBEDECER', 540, 340, 124, INK.red, null, 'middle').strokes);

  // c1: senta e faz junto
  WB.write(1, 0.35, 0.9, 'senta e faz junto!', 540, 470, 70, INK.blue, { anchor: 'middle' });

  // c2: pé direito (vista de lado) girando no sentido do relógio
  const pe = WB.group();
  const peTr = [
    WB.strokePath('M 230 600 L 235 930 Q 230 990 180 1010 Q 150 1060 200 1080 L 470 1080 Q 540 1075 530 1030 Q 510 990 440 975 L 330 940 L 325 600', INK.black, 8, pe),
    WB.strokePath('M 470 1080 Q 490 1050 470 1020 M 500 1072 Q 515 1048 500 1028', INK.black, 5, pe),
  ];
  WB.write(2, 0.04, 0.24, 'pé DIREITO', 280, 570, 64, INK.black, { anchor: 'middle' });
  WB.draw(2, 0.25, 0.5, peTr);
  // seta circular no sentido do relógio
  const giro = (cx, cy, r, horario, cor, parent) => {
    const a0 = -2.4, sg = horario ? 1 : -1, a1 = a0 + sg * 5.0;
    let d = '';
    for (let i = 0; i <= 40; i++) { const a = a0 + (a1 - a0) * i / 40; d += (i ? ' L ' : 'M ') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); }
    const ex = cx + r * Math.cos(a1), ey = cy + r * Math.sin(a1);
    const px = cx + r * Math.cos(a1 - sg * 0.15), py = cy + r * Math.sin(a1 - sg * 0.15);
    return [WB.strokePath(d, cor, 8, parent), WB.strokePath(WB.arrowHead(ex, ey, Math.atan2(ey - py, ex - px), 34), cor, 8, parent)];
  };
  const gAzul = WB.group();
  WB.draw(2, 0.52, 0.66, giro(300, 1260, 110, true, INK.blue, gAzul));
  WB.write(2, 0.67, 0.86, 'relógio', 300, 1440, 60, INK.blue, { anchor: 'middle', parent: gAzul });
  WB.restHand(2, 0.88, 1);
  // o pé gira (círculo horário) até a cena 4, depois inverte
  const tA = WB.at(2, 0.55), tB = WB.at(4, 0.0);
  WB.effect(t => {
    let ang = 0, r = 0;
    if (t > tA && t < tB) { ang = (t - tA) * 5.2; r = 22; }
    else if (t >= tB) { ang = (tB - tA) * 5.2 - (t - tB) * 5.2; r = 22; }
    const P0 = 1.7; // dobra o pé em torno do tornozelo
    pe.setAttribute('transform', `translate(${(r * Math.cos(ang)).toFixed(1)} ${(r * Math.sin(ang)).toFixed(1)})`);
  });

  // c3: mão direita desenha um 6
  WB.write(3, 0.3, 0.45, 'mão DIREITA', 780, 570, 64, INK.black, { anchor: 'middle' });
  const seis = WB.textStrokes('6', 780, 1180, 560, INK.red, null, 'middle');
  WB.draw(3, 0.5, 0.75, seis.strokes);
  WB.draw(3, 0.76, 0.88, giro(780, 1340, 90, false, INK.red));
  WB.restHand(3, 0.9, 1);

  // c4: mudou!
  WB.fade(4, 0.0, 0.06, gAzul, 1, 0);
  WB.draw(4, 0.06, 0.26, giro(300, 1260, 110, false, INK.orange));
  const st = C.stamp('MUDOU!', 540, 1560, { size: 110, color: INK.red, rot: -6 });
  WB.draw(4, 0.3, 0.75, [st.box, st.text]);

  // c5: explicação, folha nova
  WB.newPage(5, 0, 0.05);
  WB.draw(5, 0.06, 0.18, [WB.strokePath(WB.cloudPath(540, 470, 300, 190), INK.purple, 8),
    WB.strokePath(WB.roughLine(540, 300, 540, 640, 3), INK.purple, 5)]);
  WB.write(5, 0.18, 0.3, 'esquerdo', 410, 490, 62, INK.purple, { anchor: 'middle' });
  WB.write(5, 0.3, 0.38, 'direito', 670, 490, 50, INK.gray, { anchor: 'middle' });
  WB.draw(5, 0.4, 0.5, C.curvedArrow(400, 640, 420, 820, 640, 860, INK.purple, 7));
  WB.write(5, 0.5, 0.58, 'mão direita', 670, 880, 70, INK.black);
  WB.draw(5, 0.59, 0.67, C.curvedArrow(360, 650, 330, 1030, 640, 1080, INK.purple, 7));
  WB.write(5, 0.67, 0.74, 'pé direito', 670, 1100, 70, INK.black);
  WB.draw(5, 0.76, 0.86, [giro(360, 1350, 100, false, INK.blue), giro(720, 1350, 100, false, INK.blue)]);
  WB.write(5, 0.87, 0.98, 'mesmo lado', 540, 1540, 76, INK.blue, { anchor: 'middle' });

  // c6: duvido + manda pro amigo
  WB.newPage(6, 0, 0.04);
  WB.write(6, 0.06, 0.22, 'tenta devagar...', 540, 480, 84, INK.black, { anchor: 'middle' });
  WB.write(6, 0.32, 0.45, 'DUVIDO!', 540, 800, 170, INK.red, { anchor: 'middle' });
  WB.writeLines(6, 0.5, 0.85, ['manda pro amigo', 'que se acha', 'COORDENADO'], 540, 1120, 100, INK.blue, { anchor: 'middle', lineHeight: 135 });
  WB.restHand(6, 0.88, 1);
};
