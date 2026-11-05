// "A ou B? #1 · Teto ou Lua?" (folha dobrada 42 vezes).
// c1 gancho · c2 escolhe · c3 3-2-1 · c4 10 dobras · c5 20 · c6 30 · c7 42 passa da Lua
// c8 B acertou + recorde 12 · c9 amanhã #2 + botão Seguir
window.CENAS = function (WB) {
  const { INK, C, mk } = WB;

  // marca d'água passeia pela tela (regra do perfil: o @ precisa se mover)
  const wm = document.querySelector('#watermark');
  WB.effect(t => {
    const x = 230 * Math.sin(t * 0.32);
    const y = -40 * (1 - Math.cos(t * 0.21));
    wm.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  });

  // ---------- folha 1: gancho (visível desde o quadro 0) ----------
  WB.showNow(WB.textStrokes('A ou B?  #1', 540, 190, 66, INK.purple, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('TETO', 330, 360, 150, INK.black, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('ou', 560, 355, 80, INK.gray, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('LUA?', 790, 360, 150, INK.blue, null, 'middle').strokes);

  // c1: a folha e o x42
  const folha = [
    WB.strokePath(WB.roughRect(300, 440, 600, 700), INK.black, 7),
    WB.strokePath(WB.roughLine(450, 446, 450, 694, 2), INK.gray, 4),
    WB.strokePath(WB.roughLine(306, 570, 594, 570, 2), INK.gray, 4),
  ];
  WB.draw(1, 0.25, 0.45, folha);
  WB.write(1, 0.5, 0.68, 'dobra', 790, 540, 64, INK.black, { anchor: 'middle' });
  WB.write(1, 0.68, 0.88, '42x', 790, 680, 130, INK.red, { anchor: 'middle' });

  // c2: as duas opções
  WB.draw(2, 0.0, 0.14, WB.strokePath(WB.roughRect(70, 790, 515, 1290), INK.black, 7));
  WB.write(2, 0.14, 0.24, 'A', 140, 900, 110, INK.orange, { anchor: 'middle' });
  // teto com lâmpada
  WB.draw(2, 0.24, 0.42, [
    WB.strokePath(WB.roughLine(150, 980, 440, 980, 2), INK.black, 9),
    WB.strokePath(WB.zigzagHatch(150, 950, 440, 978, 18), INK.gray, 4),
    WB.strokePath(WB.roughLine(295, 980, 295, 1060, 1), INK.black, 5),
    WB.strokePath(WB.arcPath(295, 1060, 45, 40, Math.PI, 2 * Math.PI) + ' Z', INK.orange, 6),
  ]);
  WB.write(2, 0.42, 0.52, 'TETO', 295, 1230, 96, INK.black, { anchor: 'middle' });

  WB.draw(2, 0.5, 0.62, WB.strokePath(WB.roughRect(565, 790, 1010, 1290), INK.black, 7));
  WB.write(2, 0.62, 0.7, 'B', 635, 900, 110, INK.blue, { anchor: 'middle' });
  // lua crescente
  const lua = (cx, cy, r) => {
    let d = '';
    for (let i = 0; i <= 30; i++) { const a = Math.PI / 2 + Math.PI * i / 30; d += (i ? ' L ' : 'M ') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy - r * Math.sin(a)).toFixed(1); }
    for (let i = 0; i <= 30; i++) { const a = -Math.PI / 2 + Math.PI * i / 30; d += ' L ' + (cx - 0.4 * r * Math.cos(a)).toFixed(1) + ' ' + (cy - r * Math.sin(a)).toFixed(1); }
    return d;
  };
  const luaB = WB.strokePath(lua(800, 1030, 95), INK.blue, 7);
  WB.draw(2, 0.7, 0.84, luaB);
  WB.write(2, 0.84, 0.95, 'LUA', 790, 1230, 96, INK.blue, { anchor: 'middle' });

  // c3: contagem 3 · 2 · 1
  const tick = (n, f0, f1, cor) => {
    const g = WB.group();
    WB.draw(3, f0, f0 + 0.1, WB.textStrokes(n, 540, 1620, 230, cor, g, 'middle').strokes);
    if (f1 < 1) WB.fade(3, f1 - 0.02, f1, g, 1, 0);
    return g;
  };
  tick('3', 0.0, 0.31, INK.red);
  tick('2', 0.31, 0.66, INK.orange);
  const g1 = tick('1', 0.66, 2, INK.green);
  WB.restHand(3, 0.8, 1);

  // ---------- folha 2: a pilha subindo ----------
  WB.newPage(4, 0, 0.05);
  WB.write(4, 0.06, 0.2, 'cada dobra = DOBRO', 540, 250, 84, INK.black, { anchor: 'middle' });
  // seta grande subindo à esquerda
  WB.draw(4, 0.2, 0.3, C.arrow(130, 1560, 130, 380, INK.purple, 8));

  // linha 1 (embaixo): 10 dobras = 10 cm  (pilha de folhinhas)
  const pilha = [];
  for (let i = 0; i < 6; i++) pilha.push(WB.strokePath(WB.roughLine(210, 1500 - i * 14, 330, 1500 - i * 14, 1), INK.gray, 5));
  WB.draw(4, 0.32, 0.5, pilha);
  WB.write(4, 0.5, 0.68, '10 dobras', 370, 1440, 70, INK.black);
  WB.write(4, 0.7, 0.9, '10 cm', 720, 1440, 84, INK.orange);

  // linha 2: 20 dobras = prédio de 35 andares
  const pred = [WB.strokePath(WB.roughRect(215, 1080, 315, 1300), INK.black, 6)];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++)
    pred.push(WB.strokePath(WB.roughRect(232 + c * 44, 1100 + r * 48, 258 + c * 44, 1128 + r * 48), INK.blue, 4));
  WB.draw(5, 0.0, 0.3, pred);
  WB.write(5, 0.3, 0.5, '20 dobras', 370, 1180, 70, INK.black);
  WB.write(5, 0.52, 0.85, 'prédio de 35 andares', 370, 1270, 58, INK.orange);

  // linha 3: 30 dobras = 100 km, espaço
  const estrela = (x, y, s) => WB.strokePath(`M ${x} ${y - s} L ${x} ${y + s} M ${x - s} ${y} L ${x + s} ${y} M ${x - s * 0.6} ${y - s * 0.6} L ${x + s * 0.6} ${y + s * 0.6} M ${x + s * 0.6} ${y - s * 0.6} L ${x - s * 0.6} ${y + s * 0.6}`, INK.purple, 5);
  WB.draw(6, 0.0, 0.2, [
    WB.strokePath(WB.arcPath(265, 1010, 75, 75, Math.PI * 1.05, Math.PI * 1.95), INK.green, 7),
    estrela(225, 860, 22), estrela(305, 820, 16),
  ]);
  WB.write(6, 0.2, 0.42, '30 dobras', 370, 860, 70, INK.black);
  WB.write(6, 0.45, 0.65, '100 km', 370, 960, 84, INK.orange);
  WB.write(6, 0.68, 0.9, 'ESPAÇO!', 670, 960, 84, INK.purple);

  // linha 4 (topo): 42 dobras = passa da Lua
  const lua2 = WB.strokePath(lua(270, 520, 70), INK.blue, 8);
  WB.draw(7, 0.0, 0.2, lua2);
  WB.write(7, 0.12, 0.3, '42 dobras', 370, 500, 76, INK.black);
  WB.write(7, 0.32, 0.55, 'PASSA DA LUA!', 370, 610, 92, INK.red);
  WB.write(7, 0.6, 0.85, '440 mil km', 370, 715, 76, INK.orange);
  WB.restHand(7, 0.88, 1);

  // ---------- folha 3: resposta + série ----------
  WB.newPage(8, 0, 0.05);
  WB.write(8, 0.06, 0.18, 'quem escolheu', 540, 330, 76, INK.black, { anchor: 'middle' });
  WB.write(8, 0.18, 0.28, 'B', 470, 600, 260, INK.blue, { anchor: 'middle' });
  WB.draw(8, 0.28, 0.36, C.check(690, 500, 70, INK.green, 16));
  WB.write(8, 0.48, 0.66, 'recorde mundial:', 540, 820, 76, INK.black, { anchor: 'middle' });
  WB.write(8, 0.68, 0.86, 'só 12 dobras!', 540, 960, 120, INK.red, { anchor: 'middle' });

  // c9: amanhã tem o #2 + cartão com botão Seguir
  WB.write(9, 0.0, 0.2, 'amanhã: A ou B? #2', 540, 1140, 80, INK.purple, { anchor: 'middle' });
  const card = WB.group();
  WB.fade(9, 0.12, 0.2, card, 0, 1);
  mk('path', { d: WB.roundRectPath(110, 1220, 860, 270, 36), fill: '#ffffff', stroke: '#1f1f24', 'stroke-width': 4 }, card);
  const ic = WB.notebookIcon(150, 1265, 150, card, 9);
  ic.bg.setAttribute('fill-opacity', 1);
  WB.showNow([ic.outline, ic.rest]);
  WB.showNow(WB.textStrokes('@Cardeno_Amarelo', 340, 1320, 58, INK.black, card).strokes);
  // botão azul "Seguir" -> cinza "Seguindo"
  const btn = WB.group(card);
  mk('path', { d: WB.roundRectPath(340, 1360, 360, 96, 22), fill: '#0095f6' }, btn);
  WB.showNow(WB.textStrokes('Seguir', 520, 1428, 62, '#ffffff', btn, 'middle').strokes);
  const btn2 = WB.group(card);
  mk('path', { d: WB.roundRectPath(340, 1360, 360, 96, 22), fill: '#e4e6eb' }, btn2);
  WB.showNow(WB.textStrokes('Seguindo', 520, 1428, 58, '#1f1f24', btn2, 'middle').strokes);
  btn2.setAttribute('opacity', 0);
  const tClick = WB.at(9, 0.62);
  WB.handFollow(WB.at(9, 0.42), WB.at(9, 0.74), (t) => {
    const k = Math.max(0, Math.min(1, (t - WB.at(9, 0.42)) / 0.4));
    const press = Math.exp(-Math.pow((t - tClick) / 0.08, 2)) * 18;
    return { x: 900 - 330 * k, y: 1700 - 270 * k + press };
  });
  WB.restHand(9, 0.76, 1);
  WB.effect(t => {
    const on = t >= tClick;
    btn.setAttribute('opacity', on ? 0 : 1);
    btn2.setAttribute('opacity', on ? 1 : 0);
    const s = 1 - 0.06 * Math.exp(-Math.pow((t - tClick) / 0.1, 2));
    card.setAttribute('transform', `translate(${540 * (1 - s)} ${1355 * (1 - s)}) scale(${s})`);
  });
};
