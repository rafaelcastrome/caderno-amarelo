// "Fala a seta" (Stroop espacial, continuação do Fala a cor).
// c1 gancho · c2 nível 1 (tiques) · c3 regra nível 2 · c4 nível 2 · c5 travou · c6 regra impossível · c7 nível 3 · c8 respostas · c9 manda pro amigo / loop
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const ANG = { dir: 0, baixo: Math.PI / 2, esq: Math.PI, cima: -Math.PI / 2 };
  const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  // seta "gorda": dims {L, bw, hd, hw}
  function setaPts(cx, cy, dir, d) {
    const { L, bw, hd, hw } = d, a = ANG[dir];
    const loc = [[-L / 2, -bw / 2], [L / 2 - hd, -bw / 2], [L / 2 - hd, -hw], [L / 2, 0], [L / 2 - hd, hw], [L / 2 - hd, bw / 2], [-L / 2, bw / 2]];
    const pts = loc.map(([x, y]) => { const [rx, ry] = rot(x, y, a); return [cx + rx, cy + ry]; });
    const [bx, by] = rot(-hd / 2, 0, a);
    return { pts, body: [cx + bx, cy + by] };
  }
  function seta(cx, cy, dir, d, cor, parent, palavra, opts = {}) {
    const { pts, body } = setaPts(cx, cy, dir, d);
    const poly = 'M ' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L ') + ' Z';
    if (opts.fill) WB.mk('path', { d: poly, fill: opts.fill, 'fill-opacity': opts.fillOp || 0.22, stroke: 'none' }, parent);
    let d2 = '';
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      d2 += WB.roughLine(p[0], p[1], q[0], q[1], 1.5) + ' ';
    }
    const tr = [WB.strokePath(d2, cor, opts.w || 9, parent)];
    if (palavra) {
      const ext = (dir === 'dir' || dir === 'esq') ? (d.L - d.hd) : d.bw;
      const s = Math.min(opts.maxS || 90, 0.8 * ext / WB.measure(palavra, 1));
      tr.push(WB.textStrokes(palavra, body[0], body[1] + 0.33 * s, s, opts.cor2 || cor, parent, 'middle').strokes);
    }
    return tr;
  }
  // aparece de uma vez (com um "pulo") no instante t0, some em t1
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
  WB.showNow(WB.textStrokes('FALA PRA ONDE', 540, 190, 104, INK.black, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('A SETA APONTA', 540, 320, 116, INK.red, null, 'middle').strokes);

  // ---- c1
  WB.write(1, 0.42, 0.9, 'em voz alta e RÁPIDO!', 540, 450, 72, INK.blue, { anchor: 'middle' });
  WB.restHand(1, 0.92, 1);

  // ---- c2: nível 1, setas sem palavra
  const gN1 = WB.group(); WB.showNow(WB.textStrokes('NÍVEL 1', 540, 590, 64, INK.gray, gN1, 'middle').strokes); pop(gN1, tc(2, 0), 0, 540, 570);
  const D1 = { L: 380, bw: 120, hd: 140, hw: 160 };
  [['dir', 300, 840], ['cima', 780, 840], ['esq', 300, 1270], ['baixo', 780, 1270]].forEach(([dir, x, y], i) => {
    const g = WB.group(); WB.showNow(seta(x, y, dir, D1, INK.blue, g, null, { fill: INK.blue, w: 10 }));
    pop(g, tc(2, i * 0.65), 0, x, y);
  });
  WB.restHand(2, 0, 1);

  // ---- c3: regra nível 2
  WB.newPage(3, 0, 0.05);
  WB.write(3, 0.06, 0.24, 'NÍVEL 2', 540, 210, 110, INK.red, { anchor: 'middle' });
  WB.write(3, 0.5, 0.7, 'fala a SETA', 540, 340, 88, INK.black, { anchor: 'middle' });
  WB.write(3, 0.72, 0.9, 'não a palavra!', 540, 445, 72, INK.blue, { anchor: 'middle' });
  WB.restHand(3, 0.92, 1);

  // ---- c4: nível 2, setas com palavra trocada
  const DH = { L: 420, bw: 135, hd: 120, hw: 150 }, DV = { L: 300, bw: 250, hd: 115, hw: 165 };
  const gGrade = WB.group();
  [['cima', 'BAIXO'], ['esq', 'DIREITA'], ['baixo', 'CIMA'], ['dir', 'ESQUERDA'], ['cima', 'CIMA'], ['esq', 'BAIXO']].forEach(([dir, p], i) => {
    const x = i % 2 ? 780 : 300, y = 690 + Math.floor(i / 2) * 340;
    const g = WB.group(gGrade);
    WB.showNow(seta(x, y, dir, (dir === 'cima' || dir === 'baixo') ? DV : DH, INK.black, g, p, { maxS: 72, w: 8 }));
    pop(g, tc(4, i * 0.8), 0, x, y);
  });
  WB.restHand(4, 0, 1);

  // ---- c5: travou
  WB.fade(5, 0, 0.06, gGrade, 1, 0.12);
  const st = C.stamp('TRAVOU?', 540, 720, { size: 130, color: INK.red, rot: -6 });
  WB.draw(5, 0.06, 0.3, [st.box, st.text]);
  WB.writeLines(5, 0.34, 0.9, ['o cérebro LÊ', 'mais rápido', 'que tu!'], 540, 1010, 104, INK.black, { anchor: 'middle', lineHeight: 140 });
  WB.restHand(5, 0.92, 1);

  // ---- c6: regra impossível
  WB.newPage(6, 0, 0.04);
  WB.write(6, 0.05, 0.25, 'NÍVEL IMPOSSÍVEL', 540, 200, 98, INK.red, { anchor: 'middle' });
  const DL = { L: 150, bw: 50, hd: 60, hw: 58 };
  WB.draw(6, 0.28, 0.34, seta(130, 400, 'dir', DL, INK.blue, null, null, { w: 7 }));
  WB.write(6, 0.35, 0.52, 'AZUL = fala a SETA', 240, 425, 70, INK.blue);
  WB.draw(6, 0.55, 0.61, seta(130, 560, 'dir', DL, INK.red, null, null, { w: 7 }));
  WB.write(6, 0.62, 0.84, 'VERMELHA = fala a PALAVRA', 240, 585, 60, INK.red);
  WB.restHand(6, 0.87, 1);

  // ---- c7: nível 3, uma seta gigante por segundo
  const BH = { L: 860, bw: 270, hd: 250, hw: 310 }, BV = { L: 620, bw: 470, hd: 230, hw: 320 };
  const N3 = [['dir', 'CIMA', 'blue'], ['baixo', 'ESQUERDA', 'red'], ['esq', 'DIREITA', 'blue'], ['cima', 'BAIXO', 'red'],
    ['cima', 'DIREITA', 'blue'], ['dir', 'CIMA', 'red'], ['baixo', 'BAIXO', 'blue']];
  const fimN3 = WB.at(8, 0);
  N3.forEach(([dir, p, cor], i) => {
    const g = WB.group();
    WB.showNow(seta(540, 1060, dir, (dir === 'cima' || dir === 'baixo') ? BV : BH, INK[cor], g, p, { maxS: 150, w: 12, fill: INK[cor], fillOp: 0.08 }));
    WB.showNow(WB.textStrokes(`${i + 1}/7`, 540, 1520, 60, INK.gray, g, 'middle').strokes);
    pop(g, tc(7, i * 1.0), i < 6 ? tc(7, (i + 1) * 1.0) : fimN3, 540, 1060);
  });
  WB.restHand(7, 0, 1);

  // ---- c8: respostas
  const RESP = ['DIREITA', 'ESQUERDA', 'ESQUERDA', 'BAIXO', 'CIMA', 'CIMA', 'BAIXO'];
  const gR = WB.group();
  WB.showNow(WB.textStrokes('respostas:', 540, 720, 64, INK.gray, gR, 'middle').strokes);
  RESP.forEach((r, i) => WB.showNow(WB.textStrokes(`${i + 1}. ${r}`, 540, 815 + i * 86, 70, INK[N3[i][2]], gR, 'middle').strokes));
  pop(gR, WB.at(8, 0.02), 0, 540, 1050);
  WB.write(8, 0.08, 0.45, 'quantas tu errou?', 540, 1500, 84, INK.orange, { anchor: 'middle' });
  WB.restHand(8, 0.5, 1);

  // ---- c9: manda pro amigo + volta (loop)
  WB.newPage(9, 0, 0.05);
  WB.writeLines(9, 0.06, 0.5, ['manda pro amigo', 'que se acha'], 540, 560, 104, INK.black, { anchor: 'middle', lineHeight: 140 });
  WB.write(9, 0.5, 0.62, 'RÁPIDO!', 540, 900, 150, INK.red, { anchor: 'middle' });
  WB.write(9, 0.64, 0.8, 'e volta pro começo', 540, 1180, 80, INK.blue, { anchor: 'middle' });
  WB.draw(9, 0.8, 0.88, C.curvedArrow(760, 1240, 900, 1420, 620, 1420, INK.blue, 8));
  WB.restHand(9, 0.9, 1);
};
