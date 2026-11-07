// "Fala quantos tem" (Stroop de números, continuação do Fala a cor / Fala a seta).
// c1 gancho · c2 nível 1 (bolinhas) · c3 regra nível 2 · c4 nível 2 · c5 travou · c6 regra impossível · c7 nível 3 · c8 respostas · c9 manda pro amigo / loop
window.CENAS = function (WB) {
  const { INK, C } = WB;
  // posições de 1 a 4 itens (em "passos")
  const LAY = {
    1: [[0, 0]],
    2: [[-0.5, 0], [0.5, 0]],
    3: [[-0.55, 0.42], [0.55, 0.42], [0, -0.48]],
    4: [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]],
  };
  // n cópias do algarismo
  function numeros(cx, cy, n, dig, size, cor, parent, step) {
    step = step || size * 0.85;
    const tr = [];
    LAY[n].forEach(([ox, oy]) => tr.push(WB.textStrokes(dig, cx + ox * step, cy + oy * step + 0.33 * size, size, cor, parent, 'middle').strokes));
    return tr;
  }
  // n bolinhas pintadas
  function bolinhas(cx, cy, n, r, cor, parent, step) {
    const tr = [];
    LAY[n].forEach(([ox, oy]) => {
      const x = cx + ox * step, y = cy + oy * step;
      WB.mk('circle', { cx: x, cy: y, r: r, fill: cor, 'fill-opacity': 0.85, stroke: 'none' }, parent);
      tr.push(WB.strokePath(WB.circlePath(x, y, r), cor, 8, parent));
    });
    return tr;
  }
  function pop(g, t0, t1, cx, cy) {
    WB.effect(t => {
      if (t < t0 || (t1 && t >= t1)) { g.setAttribute('opacity', 0); return; }
      const u = Math.min(1, (t - t0) / 0.14), s = 1.25 - 0.25 * u;
      g.setAttribute('opacity', 1);
      g.setAttribute('transform', `translate(${(cx * (1 - s)).toFixed(1)} ${(cy * (1 - s)).toFixed(1)}) scale(${s.toFixed(3)})`);
    });
  }
  const tc = (cena, seg) => WB.at(cena, 0) + seg;
  // marca d'água anda pelo rodapé durante o vídeo
  const wmRect = document.querySelector('rect[fill="#fffaf0"]');
  if (wmRect) { const wm = wmRect.parentNode; WB.effect(t => wm.setAttribute('transform', `translate(${(280 * Math.sin(2 * Math.PI * t / 14)).toFixed(1)} 0)`)); }

  // ---- quadro 0: gancho
  WB.showNow(WB.textStrokes('FALA QUANTOS', 540, 190, 116, INK.black, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('TEM!', 540, 330, 130, INK.red, null, 'middle').strokes);

  // ---- c1
  WB.write(1, 0.3, 0.62, 'não o número: a QUANTIDADE', 540, 440, 62, INK.blue, { anchor: 'middle' });
  WB.write(1, 0.66, 0.9, 'em voz alta e RÁPIDO!', 540, 530, 62, INK.black, { anchor: 'middle' });
  WB.restHand(1, 0.92, 1);

  // ---- c2: nível 1, bolinhas
  const gN1 = WB.group(); WB.showNow(WB.textStrokes('NÍVEL 1', 540, 660, 64, INK.gray, gN1, 'middle').strokes); pop(gN1, tc(2, 0), 0, 540, 640);
  [[3, 300, 900], [1, 780, 900], [4, 300, 1300], [2, 780, 1300]].forEach(([n, x, y], i) => {
    const g = WB.group(); WB.showNow(bolinhas(x, y, n, 52, INK.blue, g, 150));
    pop(g, tc(2, i * 0.65), 0, x, y);
  });
  WB.restHand(2, 0, 1);

  // ---- c3: regra nível 2
  WB.newPage(3, 0, 0.05);
  WB.write(3, 0.06, 0.22, 'NÍVEL 2', 540, 200, 110, INK.red, { anchor: 'middle' });
  WB.write(3, 0.42, 0.6, 'fala QUANTOS tem', 540, 330, 84, INK.black, { anchor: 'middle' });
  WB.write(3, 0.62, 0.78, 'não o número!', 540, 430, 72, INK.blue, { anchor: 'middle' });
  WB.draw(3, 0.8, 0.86, numeros(360, 560, 2, '4', 100, INK.black, null, 85));
  WB.draw(3, 0.86, 0.9, C.arrow ? C.arrow(470, 560, 580, 560, INK.gray, 6) : []);
  WB.write(3, 0.9, 0.97, '= DOIS', 720, 590, 80, INK.green, { anchor: 'middle' });

  // ---- c4: nível 2, número x quantidade
  const N2 = [[2, '3'], [3, '1'], [4, '2'], [1, '4'], [3, '3'], [2, '4']];
  const gGrade = WB.group();
  N2.forEach(([n, d], i) => {
    const x = i % 2 ? 780 : 300, y = 780 + Math.floor(i / 2) * 330;
    const g = WB.group(gGrade);
    WB.showNow([WB.strokePath(WB.roughRect(x - 200, y - 145, x + 200, y + 145), INK.gray, 4, g)]);
    WB.showNow(numeros(x, y, n, d, 130, INK.black, g, 118));
    pop(g, tc(4, i * 0.9), 0, x, y);
  });
  WB.restHand(4, 0, 1);

  // ---- c5: travou
  WB.fade(5, 0, 0.06, gGrade, 1, 0.12);
  const st = C.stamp('TRAVOU?', 540, 720, { size: 130, color: INK.red, rot: -6 });
  WB.draw(5, 0.06, 0.3, [st.box, st.text]);
  WB.writeLines(5, 0.34, 0.9, ['o cérebro LÊ', 'antes de', 'CONTAR!'], 540, 1010, 104, INK.black, { anchor: 'middle', lineHeight: 140 });
  WB.restHand(5, 0.92, 1);

  // ---- c6: regra impossível
  WB.newPage(6, 0, 0.04);
  WB.write(6, 0.05, 0.25, 'NÍVEL IMPOSSÍVEL', 540, 200, 98, INK.red, { anchor: 'middle' });
  WB.draw(6, 0.28, 0.34, numeros(150, 400, 3, '1', 70, INK.blue, null, 58));
  WB.write(6, 0.35, 0.52, 'AZUL = fala QUANTOS', 260, 425, 68, INK.blue);
  WB.draw(6, 0.55, 0.61, numeros(150, 570, 3, '1', 70, INK.red, null, 58));
  WB.write(6, 0.62, 0.84, 'VERMELHO = fala o NÚMERO', 260, 595, 60, INK.red);
  WB.restHand(6, 0.87, 1);

  // ---- c7: nível 3, um grupo gigante por vez
  const N3 = [[3, '2', 'blue'], [2, '4', 'red'], [4, '1', 'blue'], [1, '3', 'red'], [2, '3', 'blue'], [3, '1', 'red'], [4, '4', 'blue']];
  const fimN3 = WB.at(8, 0), DT = 1.1;
  N3.forEach(([n, d, cor], i) => {
    const g = WB.group();
    WB.showNow(numeros(540, 1040, n, d, 380, INK[cor], g, 300));
    WB.showNow(WB.textStrokes(`${i + 1}/7`, 540, 1520, 60, INK.gray, g, 'middle').strokes);
    pop(g, tc(7, i * DT), i < 6 ? tc(7, (i + 1) * DT) : fimN3, 540, 1040);
  });
  WB.restHand(7, 0, 1);

  // ---- c8: respostas
  const RESP = ['TRÊS', 'QUATRO', 'QUATRO', 'TRÊS', 'DOIS', 'UM', 'QUATRO'];
  const gR = WB.group();
  WB.showNow(WB.textStrokes('respostas:', 540, 720, 64, INK.gray, gR, 'middle').strokes);
  RESP.forEach((r, i) => WB.showNow(WB.textStrokes(`${i + 1}. ${r}`, 540, 815 + i * 86, 70, INK[N3[i][2]], gR, 'middle').strokes));
  pop(gR, WB.at(8, 0.02), 0, 540, 1050);
  WB.write(8, 0.08, 0.45, 'quantas tu errou?', 540, 1500, 84, INK.orange, { anchor: 'middle' });
  WB.restHand(8, 0.5, 1);

  // ---- c9: manda pro amigo + volta (loop)
  WB.newPage(9, 0, 0.05);
  WB.writeLines(9, 0.06, 0.5, ['manda pro amigo', 'que se acha'], 540, 560, 104, INK.black, { anchor: 'middle', lineHeight: 140 });
  WB.write(9, 0.5, 0.62, 'ESPERTO!', 540, 900, 150, INK.red, { anchor: 'middle' });
  WB.write(9, 0.64, 0.8, 'e volta pro começo', 540, 1180, 80, INK.blue, { anchor: 'middle' });
  WB.draw(9, 0.8, 0.88, C.curvedArrow(760, 1240, 900, 1420, 620, 1420, INK.blue, 8));
  WB.restHand(9, 0.9, 1);
};
