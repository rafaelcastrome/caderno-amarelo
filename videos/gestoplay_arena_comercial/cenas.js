// Gestôplay: comercial "explique desenhando" para donos de arena (11 cenas, ~82 s).
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const NAVY = '#14306b', LIME = '#3f9e0c';

  // Logo do Gestôplay (imagem enviada pelo Rafael) com moldura desenhada.
  function logo(scene, f0, f1, x, y, w) {
    const h = w * window.LOGO_GP_H / window.LOGO_GP_W;
    const img = WB.mk('image', { href: window.LOGO_GP, x, y, width: w, height: h, opacity: 0 });
    WB.draw(scene, f0, f0 + (f1 - f0) * 0.45, WB.strokePath(WB.roughRect(x - 10, y - 10, x + w + 10, y + h + 10), NAVY, 8));
    WB.fade(scene, f0 + (f1 - f0) * 0.4, f1, img, 0, 1);
    return h;
  }
  // Etiqueta de boleto "R$" pendurada.
  const boleto = (x, y, g) => [
    WB.strokePath(WB.roughRect(x, y, x + 110, y + 70), INK.red, 6, g),
    WB.textStrokes('R$', x + 55, y + 52, 48, INK.red, g, 'middle').strokes,
  ];
  // Celular simples.
  const phone = (x0, y0, x1, y1, cor = INK.black, g) => [
    WB.strokePath(WB.roundRectPath(x0, y0, x1 - x0, y1 - y0, 36), cor, 8, g),
    WB.strokePath(WB.roughLine((x0 + x1) / 2 - 30, y0 + 28, (x0 + x1) / 2 + 30, y0 + 28, 1), cor, 7, g),
  ];

  // Marca d'água discreta com o @ (some no CTA final).
  const wm = WB.group(WB.overlay);
  WB.mk('rect', { x: 380, y: 1838, width: 320, height: 62, rx: 31, fill: NAVY, 'fill-opacity': 0.92 }, wm);
  WB.showNow(WB.textStrokes('@gestoplay', 540, 1882, 40, INK.white, wm, 'middle').strokes);
  const tEnd = WB.at(11, 0);
  WB.effect((t) => wm.setAttribute('opacity', (WB.clamp((t - 0.4) / 0.5) * (1 - WB.clamp((t - tEnd) / 0.5))).toFixed(3)));

  // ================= FOLHA 1: a dor =================
  // CENA 1 (6,0 s): "Ou, dono de arena... quantos sistemas você paga hoje? Um? Dois? Três?"
  const t1 = WB.write(1, 0.02, 0.24, 'Ou, dono de arena…', 540, 200, 100, NAVY, { anchor: 'middle' });
  WB.draw(1, 0.24, 0.28, C.underline(540 - t1.width / 2, 540 + t1.width / 2, 232, LIME));
  WB.draw(1, 0.29, 0.47, C.stickFigure(190, 380, { scale: 0.75 }));
  WB.writeLines(1, 0.48, 0.66, ['Quantos sistemas', 'você paga hoje?'], 640, 400, 70, INK.black, { anchor: 'middle', lineHeight: 84 });
  WB.write(1, 0.70, 0.77, '1?', 470, 640, 110, INK.red, { anchor: 'middle' });
  WB.write(1, 0.79, 0.86, '2?', 640, 640, 110, INK.red, { anchor: 'middle' });
  WB.write(1, 0.88, 0.96, '3?', 810, 640, 110, INK.red, { anchor: 'middle' });

  // CENA 2 (7,4 s): agenda, caixa, escolinha, planilha
  const BX = [
    { x0: 70, y0: 790, x1: 505, y1: 1060, l1: 'Agenda', l2: 'de quadra', f: [0.04, 0.20] },
    { x0: 575, y0: 790, x1: 1010, y1: 1060, l1: 'Caixa', l2: '(PDV)', f: [0.22, 0.38] },
    { x0: 70, y0: 1150, x1: 505, y1: 1420, l1: 'Escolinha', l2: '', f: [0.40, 0.56] },
  ];
  BX.forEach((b) => {
    const cx = (b.x0 + b.x1) / 2;
    WB.draw(2, b.f[0], b.f[0] + 0.05, C.box(b.x0, b.y0, b.x1, b.y1, INK.black, 7));
    WB.draw(2, b.f[0] + 0.05, b.f[1], [
      WB.textStrokes(b.l1, cx, b.y0 + (b.l2 ? 110 : 150), 70, NAVY, null, 'middle').strokes,
      b.l2 ? WB.textStrokes(b.l2, cx, b.y0 + 190, 56, INK.gray, null, 'middle').strokes : [],
      boleto(b.x1 - 85, b.y1 - 40),
    ]);
  });
  // planilha perdida
  WB.draw(2, 0.60, 0.66, C.box(575, 1150, 1010, 1420, INK.gray, 6));
  WB.draw(2, 0.66, 0.74, WB.strokePath(
    WB.roughLine(640, 1230, 940, 1230, 1) + ' ' + WB.roughLine(640, 1290, 940, 1290, 1) + ' ' + WB.roughLine(640, 1350, 940, 1350, 1) +
    ' ' + WB.roughLine(760, 1180, 760, 1400, 1), INK.gray, 5));
  WB.write(2, 0.76, 0.86, 'Planilha?', 792, 1215, 62, INK.black, { anchor: 'middle' });
  WB.write(2, 0.87, 0.95, '???', 860, 1380, 80, INK.red, { anchor: 'middle' });

  // CENA 3 (6,1 s): boleto pra cá, senha pra lá, nada conversa
  WB.draw(3, 0.03, 0.18, [
    WB.strokePath(WB.dashedLine(510, 570, 925), INK.gray, 6),
    WB.strokePath(WB.roughLine(287, 1065, 287, 1145, 1), INK.gray, 6),
    WB.strokePath(WB.roughLine(792, 1065, 792, 1145, 1), INK.gray, 6),
  ]);
  WB.draw(3, 0.18, 0.30, [C.xMark(540, 925, 30), C.xMark(287, 1105, 28), C.xMark(792, 1105, 28)]);
  WB.write(3, 0.32, 0.48, 'boleto pra cá…', 70, 1540, 66, INK.red);
  WB.write(3, 0.50, 0.64, 'senha pra lá…', 1010, 1540, 66, INK.purple, { anchor: 'end' });
  const cansa = WB.write(3, 0.68, 0.82, 'Cansa, né?', 540, 1690, 100, INK.black, { anchor: 'middle' });
  WB.draw(3, 0.82, 0.86, WB.strokePath(WB.wavyLine(540 - cansa.width / 2, 540 + cansa.width / 2, 1720, 5, 60), INK.red, 7));
  WB.restHand(3, 0.87, 0.97);

  // ================= FOLHA 2: a virada =================
  // CENA 4 (3,4 s): "Pois é! Acabei com isso contratando o Gestôplay!"
  WB.draw(4, 0.0, 0.22, WB.strokePath(WB.zigzagHatch(90, 800, 990, 1430, 120), INK.red, 14));
  WB.newPage(4, 0.25, 0.36);
  const lh = logo(4, 0.40, 0.80, 90, 300, 900);
  WB.write(4, 0.82, 0.97, 'Acabou a bagunça!', 540, 300 + lh + 120, 84, INK.red, { anchor: 'middle' });

  // CENA 5 (7,9 s): tudo num lugar só
  const PY = 300 + lh + 190;  // topo do celular
  WB.draw(5, 0.0, 0.07, phone(160, PY, 920, PY + 760, NAVY));
  const itens = [
    ['Agenda + aluguel', 'de quadras'], ['PDV'], ['Escolinha'], ['Clientes'], ['Produtos'],
  ];
  let yy = PY + 140;
  const fr = [[0.08, 0.26], [0.30, 0.36], [0.38, 0.46], [0.48, 0.55], [0.57, 0.64]];
  itens.forEach((it, i) => {
    WB.draw(5, fr[i][0], fr[i][0] + 0.03, C.check(245, yy - 26, 36, LIME));
    WB.draw(5, fr[i][0] + 0.03, fr[i][1], [
      WB.textStrokes(it[0], 310, yy, 74, INK.black).strokes,
      it[1] ? WB.textStrokes(it[1], 310, yy + 66, 56, INK.gray).strokes : [],
    ]);
    yy += it[1] ? 165 : 118;
  });
  const so = WB.write(5, 0.68, 0.84, 'Tudo num lugar só!', 540, PY + 870, 92, LIME, { anchor: 'middle' });
  WB.draw(5, 0.84, 0.88, C.underline(540 - so.width / 2, 540 + so.width / 2, PY + 900, NAVY));
  WB.restHand(5, 0.89, 0.97);

  // ================= FOLHA 3: link exclusivo =================
  // CENA 6 (9,7 s)
  WB.newPage(6, 0.0, 0.05);
  const t6 = WB.write(6, 0.05, 0.12, 'Seu link exclusivo', 540, 200, 96, NAVY, { anchor: 'middle' });
  WB.draw(6, 0.12, 0.13, C.underline(540 - t6.width / 2, 540 + t6.width / 2, 232, LIME));
  // celular do dono com o link
  WB.draw(6, 0.13, 0.17, phone(80, 340, 400, 900));
  WB.write(6, 0.17, 0.21, 'Sua arena', 240, 470, 52, NAVY, { anchor: 'middle' });
  WB.draw(6, 0.21, 0.25, [
    WB.strokePath(WB.roundRectPath(150, 560, 110, 60, 30), LIME, 9),
    WB.strokePath(WB.roundRectPath(220, 600, 110, 60, 30), LIME, 9),
  ]);
  WB.write(6, 0.25, 0.28, 'link', 240, 760, 60, LIME, { anchor: 'middle' });
  // seta para o cliente, passando por WhatsApp / Instagram
  WB.draw(6, 0.29, 0.33, C.curvedArrow(410, 560, 540, 400, 670, 560, INK.black, 7));
  WB.write(6, 0.33, 0.38, 'WhatsApp', 540, 680, 50, INK.green, { anchor: 'middle' });
  WB.write(6, 0.38, 0.43, 'Instagram', 540, 750, 50, INK.purple, { anchor: 'middle' });
  // celular do cliente com horários
  WB.draw(6, 0.44, 0.47, phone(680, 340, 1000, 900));
  const slots = [['18h', 'livre', LIME], ['19h', 'ocupado', INK.gray], ['20h', 'livre', LIME]];
  slots.forEach((s, i) => {
    const y = 480 + i * 120, f = 0.47 + i * 0.04;
    WB.draw(6, f, f + 0.04, [WB.textStrokes(s[0], 710, y, 50, INK.black).strokes,
      WB.textStrokes(s[1], 800, y, 46, s[2]).strokes]);
  });
  WB.draw(6, 0.59, 0.63, C.circleAround(860, 465, 95, 45, LIME));
  const res = WB.write(6, 0.64, 0.74, 'Reserva sozinho!', 540, 1150, 104, LIME, { anchor: 'middle' });
  WB.draw(6, 0.74, 0.76, C.underline(540 - res.width / 2, 540 + res.width / 2, 1185, NAVY));
  WB.write(6, 0.77, 0.88, 'Sem ficar te ligando!', 540, 1360, 84, INK.black, { anchor: 'middle' });
  // telefone tocando riscado
  WB.draw(6, 0.88, 0.95, [phone(480, 1430, 600, 1640), WB.textStrokes('trim!', 650, 1500, 52, INK.gray).strokes,
    WB.textStrokes('trim!', 430, 1590, 52, INK.gray, null, 'end').strokes, C.xMark(540, 1535, 120)]);
  WB.restHand(6, 0.95, 0.99);

  // ================= FOLHA 4: vitrine + destaque =================
  // CENA 7 (7,0 s)
  WB.newPage(7, 0.0, 0.06);
  const t7 = WB.write(7, 0.07, 0.20, 'Vitrine Gestôplay', 540, 200, 100, NAVY, { anchor: 'middle' });
  WB.draw(7, 0.20, 0.23, C.underline(540 - t7.width / 2, 540 + t7.width / 2, 232, LIME));
  WB.draw(7, 0.24, 0.37, C.stickFigure(170, 420, { scale: 0.72, label: 'atleta' }));
  // lupa na mão levantada (75,68)*0.72 -> (224, 469)
  WB.draw(7, 0.37, 0.42, [WB.strokePath(WB.circlePath(262, 430, 36), INK.black, 7),
    WB.strokePath(WB.roughLine(236, 456, 214, 480, 1), INK.black, 9)]);
  WB.draw(7, 0.43, 0.48, C.box(370, 330, 1010, 1010, NAVY, 7));
  WB.write(7, 0.48, 0.55, 'Arenas perto de você', 690, 410, 50, INK.gray, { anchor: 'middle' });
  const ROW_Y = [560, 720, 880];
  const rows = [
    { nome: 'Arena A', km: '1 km', cor: INK.black },
    { nome: 'Arena B', km: '3 km', cor: INK.black },
    { nome: 'Sua arena', km: '5 km', cor: INK.blue },
  ];
  rows.forEach((r, i) => {
    r.g = WB.group();
    const f = 0.56 + i * 0.1;
    WB.draw(7, f, f + 0.09, [
      WB.strokePath(WB.roughRect(395, ROW_Y[i] - 80, 985, ROW_Y[i] + 40), r.cor, 5, r.g),
      WB.textStrokes(r.nome, 420, ROW_Y[i], 62, r.cor, r.g).strokes,
      WB.textStrokes(r.km, 960, ROW_Y[i], 56, INK.gray, r.g, 'end').strokes,
    ]);
  });
  WB.write(7, 0.87, 0.97, '📍 por ordem de distância'.replace('📍 ', ''), 540, 1130, 66, INK.black, { anchor: 'middle' });

  // CENA 8 (6,4 s): destacar e aparecer primeiro
  WB.draw(8, 0.10, 0.20, C.curvedArrow(1000, 880, 1060, 700, 1000, 520, INK.orange, 9));
  WB.moveGroup(8, 0.24, 0.42, rows[2].g, 0, ROW_Y[0] - ROW_Y[2], { grab: { x: 440, y: ROW_Y[2] - 20 }, arc: 120, color: INK.blue });
  WB.transform(8, 0.26, 0.42, rows[0].g, { x: 0, y: 0 }, { x: 0, y: ROW_Y[1] - ROW_Y[0] });
  WB.transform(8, 0.26, 0.42, rows[1].g, { x: 0, y: 0 }, { x: 0, y: ROW_Y[2] - ROW_Y[1] });
  const st8 = C.stamp('DESTAQUE', 560, 1330, { size: 96, color: INK.orange, rot: -8 });
  WB.draw(8, 0.46, 0.52, st8.box); WB.draw(8, 0.52, 0.66, st8.text);
  WB.write(8, 0.70, 0.88, 'Apareça primeiro!', 540, 1580, 88, INK.orange, { anchor: 'middle' });
  WB.restHand(8, 0.89, 0.97);

  // ================= FOLHA 5: inteligência artificial =================
  // CENA 9 (7,5 s)
  WB.newPage(9, 0.0, 0.05);
  const t9 = WB.write(9, 0.06, 0.18, 'Bateu dúvida?', 540, 200, 104, NAVY, { anchor: 'middle' });
  WB.draw(9, 0.18, 0.20, C.underline(540 - t9.width / 2, 540 + t9.width / 2, 234, LIME));
  WB.draw(9, 0.21, 0.32, C.stickFigure(190, 640, { scale: 0.75 }));
  WB.draw(9, 0.32, 0.36, WB.strokePath(WB.roundRectPath(300, 330, 700, 170, 40) + ' M 360 500 L 330 560 L 420 500', INK.black, 6));
  WB.write(9, 0.36, 0.46, 'Como faço isso?', 650, 440, 64, INK.black, { anchor: 'middle' });
  // robozinho
  const R = { x: 760, y: 720 };
  WB.draw(9, 0.47, 0.58, [
    WB.strokePath(WB.roundRectPath(R.x - 130, R.y, 260, 200, 40), NAVY, 8),
    WB.strokePath(WB.roughLine(R.x, R.y, R.x, R.y - 60, 1) + ' ' + WB.circlePath(R.x, R.y - 75, 15), NAVY, 7),
    WB.strokePath(WB.circlePath(R.x - 55, R.y + 80, 20) + ' ' + WB.circlePath(R.x + 55, R.y + 80, 20), LIME, 9),
    WB.strokePath(`M ${R.x - 50} ${R.y + 145} Q ${R.x} ${R.y + 175} ${R.x + 50} ${R.y + 145}`, NAVY, 7),
    WB.strokePath(WB.roughRect(R.x - 100, R.y + 200, R.x + 100, R.y + 380), NAVY, 8),
  ]);
  WB.write(9, 0.58, 0.63, 'IA', R.x, R.y + 315, 80, LIME, { anchor: 'middle' });
  WB.draw(9, 0.64, 0.68, WB.strokePath(WB.roundRectPath(120, 1170, 840, 150, 40) + ' M 700 1170 L 740 1110 L 760 1170', LIME, 7));
  WB.write(9, 0.68, 0.80, 'É só perguntar!', 540, 1270, 76, LIME, { anchor: 'middle' });
  WB.write(9, 0.82, 0.95, 'tim-tim por tim-tim', 540, 1480, 80, INK.black, { anchor: 'middle' });

  // ================= FOLHA 6: preço =================
  // CENA 10 (11,3 s)
  WB.newPage(10, 0.0, 0.04);
  const t10 = WB.write(10, 0.05, 0.13, 'E o preço?', 540, 200, 104, NAVY, { anchor: 'middle' });
  WB.draw(10, 0.13, 0.15, C.underline(540 - t10.width / 2, 540 + t10.width / 2, 234, LIME));
  const tag = (x0, y0, x1, y1, cor) => WB.strokePath(
    `M ${x0 + 70} ${y0} L ${x1} ${y0} L ${x1} ${y1} L ${x0 + 70} ${y1} L ${x0} ${(y0 + y1) / 2} Z ` + WB.circlePath(x0 + 70, (y0 + y1) / 2, 16), cor, 8);
  WB.draw(10, 0.16, 0.22, tag(90, 320, 990, 640, NAVY));
  WB.write(10, 0.22, 0.27, 'Cada módulo', 590, 420, 64, INK.black, { anchor: 'middle' });
  WB.write(10, 0.27, 0.36, 'R$ 69', 590, 590, 150, NAVY, { anchor: 'middle' });
  WB.writeLines(10, 0.37, 0.52, ['Escolha só', 'o que você usar'], 540, 780, 76, INK.black, { anchor: 'middle', lineHeight: 90 });
  WB.draw(10, 0.53, 0.59, tag(90, 1000, 990, 1400, LIME));
  WB.write(10, 0.59, 0.65, 'Sistema completo', 590, 1100, 66, INK.black, { anchor: 'middle' });
  WB.write(10, 0.65, 0.78, 'R$ 179/mês', 590, 1290, 136, LIME, { anchor: 'middle' });
  const st10 = C.stamp('PROMOÇÃO', 600, 1580, { size: 90, color: INK.red, rot: -7 });
  WB.draw(10, 0.80, 0.85, st10.box); WB.draw(10, 0.85, 0.94, st10.text);

  // ================= FOLHA 7: CTA =================
  // CENA 11 (9,0 s)
  WB.newPage(11, 0.0, 0.04);
  logo(11, 0.05, 0.22, 90, 300, 900);
  WB.write(11, 0.24, 0.40, 'Chama no direct', 540, 800, 100, INK.black, { anchor: 'middle' });
  const at11 = WB.write(11, 0.41, 0.55, '@gestoplay', 540, 990, 130, NAVY, { anchor: 'middle' });
  WB.draw(11, 0.55, 0.59, C.underline(540 - at11.width / 2, 540 + at11.width / 2, 1030, LIME));
  WB.writeLines(11, 0.60, 0.74, ['Sua arena inteira', 'num lugar só!'], 540, 1250, 90, LIME, { anchor: 'middle', lineHeight: 110 });
  WB.restHand(11, 0.76, 0.86);
};
