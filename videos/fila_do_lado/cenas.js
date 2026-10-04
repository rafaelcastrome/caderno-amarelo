// "Por que a fila do lado anda mais rápido?" — versão com arco de retenção (Caderno Amarelo).
// Gancho: um post-it com "?" (o segredo) fica colado no canto desde o 1º segundo (camada fixa WB.overlay).
// Meio: matemática (1 em 3) -> "mas por que parece SEMPRE?" -> teste da Nature -> "chuta aí" -> mecanismo.
// Clímax: o post-it voa para o centro, cresce e revela "70%"... e a faixa era mais LENTA.
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const QX = [250, 540, 830];

  // ---------- post-it do segredo (atravessa as folhas) ----------
  const postit = WB.group(WB.overlay);
  const inner = WB.group(postit, 'rotate(4 940 140)');
  const pd = 'M 850 50 L 1030 50 L 1030 214 Q 1000 234 850 230 Z';
  const pbg = WB.mk('path', { d: pd, fill: '#ffe066', 'fill-opacity': 0 }, inner);
  const pout = WB.strokePath(pd, '#a0790a', 4, inner);
  const mist = WB.group(inner);
  const interrog = WB.textStrokes('?', 940, 182, 120, INK.red, mist, 'middle');
  const segredo = WB.textStrokes('segredo', 940, 221, 30, INK.black, mist, 'middle');

  // ---------- CENA 1: gancho + promessa ----------
  WB.write(1, 0.02, 0.18, 'Por que a fila do lado', 450, 140, 82, INK.black, { anchor: 'middle' });
  const t2 = WB.write(1, 0.18, 0.30, 'anda mais rápido?', 450, 240, 92, INK.red, { anchor: 'middle' });
  WB.draw(1, 0.30, 0.33, C.underline(450 - t2.width / 2, 450 + t2.width / 2, 270));
  WB.draw(1, 0.52, 0.64, pout);
  WB.fillAfter(pbg, pout);
  WB.draw(1, 0.66, 0.73, interrog.strokes);
  WB.draw(1, 0.73, 0.78, segredo.strokes);
  WB.draw(1, 0.80, 0.84, WB.strokePath('M 820 120 Q 790 150 800 190 M 800 190 L 786 172 M 800 190 L 812 174', INK.red, 5));
  WB.write(1, 0.84, 0.95, '(e não é azar!)', 450, 350, 56, INK.gray, { anchor: 'middle' });

  // ---------- CENA 2: a matemática ----------
  WB.draw(2, 0.12, 0.24, QX.map((x, i) => [
    C.box(x - 60, 420, x + 60, 500, INK.black, 7),
    WB.textStrokes(String(i + 1), x, 480, 58, INK.black, null, 'middle').strokes,
  ]));
  const heads = [];
  QX.forEach((x, q) => {
    for (let k = 0; k < 4; k++) heads.push(WB.strokePath(WB.circlePath(x, 580 + k * 80, 28), INK.black, 6));
  });
  WB.draw(2, 0.24, 0.36, heads);
  const vy = 580 + 4 * 80;
  WB.draw(2, 0.36, 0.42, [
    WB.strokePath(WB.circlePath(540, vy, 30), INK.red, 7),
    WB.strokePath(`M 527 ${vy - 9} L 532 ${vy - 6} M 553 ${vy - 9} L 548 ${vy - 6}`, INK.red, 6),
    WB.strokePath(`M 527 ${vy + 15} Q 540 ${vy + 4} 553 ${vy + 15}`, INK.red, 5),
    WB.textStrokes('você', 590, vy + 16, 54, INK.red).strokes,
  ]);
  WB.write(2, 0.42, 0.48, 'sua fila ganha:', 540, 1040, 58, INK.black, { anchor: 'middle' });
  WB.write(2, 0.48, 0.58, '1 em 3 = 33%', 540, 1135, 96, INK.green, { anchor: 'middle' });
  WB.draw(2, 0.58, 0.63, [
    WB.strokePath('M 880 600 L 950 600 M 880 670 L 960 670 M 880 740 L 945 740', INK.orange, 6),
    WB.textStrokes('zum!', 880, 548, 54, INK.orange).strokes,
  ]);
  WB.write(2, 0.64, 0.70, 'outra fila ganha:', 540, 1235, 58, INK.black, { anchor: 'middle' });
  const p67 = WB.write(2, 0.70, 0.86, '2 em 3 = 67%!', 540, 1335, 96, INK.red, { anchor: 'middle' });
  WB.draw(2, 0.86, 0.89, C.underline(540 - p67.width / 2, 540 + p67.width / 2, 1362));
  WB.restHand(2, 0.90, 0.99);

  // ---------- CENA 3: re-gancho + o teste da Nature ----------
  WB.newPage(3, 0.0, 0.05);
  const sem = WB.write(3, 0.06, 0.30, 'Mas por que parece SEMPRE?', 420, 165, 64, INK.red, { anchor: 'middle' });
  WB.draw(3, 0.30, 0.33, C.underline(420 - sem.width / 2, 420 + sem.width / 2, 192));
  const nat = WB.textStrokes('revista Nature, 1999', 450, 285, 56, INK.gray, null, 'middle');
  WB.draw(3, 0.55, 0.70, [C.box(450 - nat.width / 2 - 24, 233, 450 + nat.width / 2 + 24, 305, INK.gray, 5), nat.strokes]);
  let dash = '';
  for (let y = 340; y < 790; y += 60) dash += `M 520 ${y} L 520 ${y + 34} `;
  WB.draw(3, 0.72, 0.82, [
    WB.strokePath(WB.roughLine(260, 330, 260, 800, 2), INK.black, 7),
    WB.strokePath(WB.roughLine(780, 330, 780, 800, 2), INK.black, 7),
    WB.strokePath(dash, INK.black, 6),
  ]);
  const car = (cx, cy, color, parent) => [
    WB.strokePath(WB.roundRectPath(cx - 42, cy - 62, 84, 124, 20), color, 7, parent),
    WB.strokePath(WB.roundRectPath(cx - 28, cy - 34, 56, 34, 8), color, 5, parent),
  ];
  const passa = WB.group();
  WB.draw(3, 0.82, 0.94, [car(390, 560, INK.blue), car(650, 710, INK.orange, passa)]);

  // ---------- CENA 4: o teste + "chuta aí" ----------
  WB.write(4, 0.03, 0.10, 'sua faixa', 390, 390, 46, INK.blue, { anchor: 'middle' });
  WB.write(4, 0.10, 0.17, 'a do lado', 650, 390, 46, INK.orange, { anchor: 'middle' });
  WB.write(4, 0.20, 0.40, '120 alunos de autoescola', 520, 885, 64, INK.black, { anchor: 'middle' });
  WB.write(4, 0.45, 0.66, 'Qual anda mais rápido?', 520, 985, 70, INK.blue, { anchor: 'middle' });
  WB.write(4, 0.72, 0.90, 'Chuta: quantos erraram?', 520, 1085, 70, INK.red, { anchor: 'middle' });

  // ---------- CENA 5: o mecanismo (suspense antes da resposta) ----------
  WB.moveGroup(5, 0.12, 0.28, passa, 0, -240, { grab: { x: 650, y: 770 }, arc: 0, color: INK.orange });
  WB.write(5, 0.28, 0.32, 'fui!', 700, 500, 50, INK.orange);
  WB.write(5, 0.34, 0.48, 'quem te passa: fica na frente', 520, 1200, 60, INK.black, { anchor: 'middle' });
  WB.write(5, 0.50, 0.65, 'quem você passa: some!', 520, 1290, 60, INK.black, { anchor: 'middle' });
  WB.writeLines(5, 0.68, 0.88, ['Seu cérebro só lembra', 'de quem te passou!'], 520, 1395, 68, INK.red, { anchor: 'middle', lineHeight: 78 });
  WB.restHand(5, 0.90, 0.99);

  // ---------- CENA 6: CLÍMAX — o post-it revela o segredo ----------
  WB.newPage(6, 0.0, 0.07);
  WB.write(6, 0.08, 0.16, 'O resultado:', 540, 230, 92, INK.black, { anchor: 'middle' });
  const S = 2.8, tx = 540 - 940 * S, ty = 700 - 140 * S;
  WB.transform(6, 0.16, 0.30, postit, { x: 0, y: 0, s: 1 }, { x: tx, y: ty, s: S });
  {
    const a = WB.at(6, 0.16), b = WB.at(6, 0.30);
    WB.handFollow(a, b, (t) => {
      const u = WB.ease(WB.clamp((t - a) / (b - a)));
      const s = WB.lerp(1, S, u);
      return { x: s * 1000 + WB.lerp(0, tx, u), y: s * 222 + WB.lerp(0, ty, u) };
    }, INK.black);
  }
  WB.fade(6, 0.30, 0.34, mist, 1, 0);
  WB.draw(6, 0.34, 0.48, WB.textStrokes('70%', 540, 760, 210, INK.red, WB.overlay, 'middle').strokes);
  WB.draw(6, 0.48, 0.60, [
    WB.textStrokes('acharam a do lado', 540, 850, 52, INK.black, WB.overlay, 'middle').strokes,
    WB.textStrokes('mais rápida', 540, 910, 52, INK.black, WB.overlay, 'middle').strokes,
  ]);
  const st = C.stamp('mas ela era mais LENTA!', 540, 1090, { size: 70, rot: -5 });
  WB.draw(6, 0.62, 0.66, st.box);
  WB.draw(6, 0.66, 0.86, st.text);

  // ---------- CENA 7: fechamento rápido + CTA ----------
  WB.write(7, 0.03, 0.24, 'A fila do lado não é mais rápida…', 540, 1260, 58, INK.black, { anchor: 'middle' });
  WB.write(7, 0.24, 0.40, '…ela só aparece mais!', 540, 1360, 84, INK.blue, { anchor: 'middle' });
  WB.write(7, 0.46, 0.70, 'Me segue: @caderno_amarelo', 540, 1490, 64, INK.red, { anchor: 'middle' });
  WB.restHand(7, 0.74, 0.99);
};
