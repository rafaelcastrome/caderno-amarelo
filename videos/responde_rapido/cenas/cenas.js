// "Responde rápido, sem pensar", ~41 s, narração Gemini Charon (tomada única cortada nos silêncios).
// Mentalismo de associação rápida: número de 1 a 10 -> 7, cor -> vermelho, ferramenta -> martelo,
// contas rápidas (2+2, 4+4, 8+8, 16+16) e um legume -> cenoura. A maioria acerta 4 de 4 (não todo mundo).
// Quadro 0 já mostra o gancho: título + 4 caixas com "?". As respostas "pulam" na caixa na hora da fala.
// Fim "volta e faz com um amigo" emenda no começo.
window.CENAS = function (WB) {
  const { INK, C, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const sc = c => S[c - 1];
  const fim = c => sc(c).falaFim ?? sc(c).end;
  const T = (c, f) => sc(c).start + f * (fim(c) - sc(c).start);       // fração da fala -> segundos
  const fr = (c, t) => (t - sc(c).start) / (sc(c).end - sc(c).start);  // segundos -> fração da cena
  const D = (c, f0, f1, st) => WB.draw(c, fr(c, T(c, f0)), fr(c, T(c, f1)), st);
  const W = (c, f0, f1, txt, x, y, size, cor, o = {}) =>
    WB.write(c, fr(c, T(c, f0)), fr(c, T(c, f1)), txt, x, y, size, cor, { anchor: 'middle', ...o });
  const rest = (c, t0, t1) => WB.restHand(c, fr(c, t0), fr(c, t1));
  const page = (c, f0) => WB.newPage(c, fr(c, T(c, f0)), fr(c, T(c, f0) + 0.4));
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 7, parent) => WB.strokePath(d, cor, w, parent);
  // fração da fala onde começa o trecho; use trechos que não aparecem dentro de outra palavra
  const P = (c, trecho, n = 1) => {
    const txt = WB.projeto.cenas[c - 1].fala; let i = -1;
    for (let k = 0; k < n; k++) i = txt.indexOf(trecho, i + 1);
    if (i < 0) throw new Error(`"${trecho}" não está na fala ${c}`);
    return i / txt.length;
  };
  const textNow = (str, x, y, size, cor, parent, anchor = 'middle') =>
    WB.showNow(WB.textStrokes(str, x, y, size, cor, parent, anchor).strokes);
  // visível só entre t0 e t1 (com pulinho de escala ao aparecer)
  const popIn = (g, cx, cy, t0, t1 = 1e9, s0 = 0.4) => WB.effect(t => {
    const on = t >= t0 && t < t1;
    const u = clamp((t - t0) / 0.25);
    const s = s0 + (1 - s0) * ease(u) + 0.1 * Math.sin(Math.PI * u);
    g.setAttribute('opacity', on ? 1 : 0);
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${s.toFixed(3)})`);
  });
  function countdown(t0, t1, x, y, size, parent) {
    const n = Math.max(1, Math.round(t1 - t0));
    const g = WB.group(parent);
    const nums = [];
    for (let k = 1; k <= n; k++) {
      const gk = WB.group(g);
      textNow(String(k), x, y, size, INK.gray, gk);
      gk.setAttribute('opacity', 0);
      nums.push(gk);
    }
    WB.effect(t => {
      const v = (t >= t0 && t < t1) ? Math.ceil((t1 - t) * n / (t1 - t0)) : 0;
      nums.forEach((gk, i) => gk.setAttribute('opacity', i + 1 === v ? 1 : 0));
    });
  }
  function burst(cx, cy, t0, cor = INK.orange) {
    const g = WB.group(WB.overlay);
    for (let k = 0; k < 10; k++) {
      const a = k / 10 * Math.PI * 2;
      WB.mk('path', { d: `M ${r1(cx + 175 * Math.cos(a))} ${r1(cy + 165 * Math.sin(a))} L ${r1(cx + 225 * Math.cos(a))} ${r1(cy + 210 * Math.sin(a))}`,
        stroke: cor, 'stroke-width': 9, 'stroke-linecap': 'round', fill: 'none' }, g);
    }
    WB.effect(t => g.setAttribute('opacity', (t < t0 ? 0 : 1 - clamp((t - t0) / 0.5)).toFixed(3)));
  }

  // =====================================================================
  // FOLHA 1 — título + 4 caixas (tudo na tela no quadro 0)
  // =====================================================================
  textNow('RESPONDE RÁPIDO', 540, 300, 116, INK.red, WB.layer);
  textNow('sem pensar!', 540, 400, 82, INK.black, WB.layer);
  const BOX = [[305, 700], [770, 700], [305, 1120], [770, 1120]];
  const BW = 400, BH = 380;
  const interroga = BOX.map(([x, y], i) => {
    WB.mk('rect', { x: x - BW / 2 + 8, y: y - BH / 2 + 10, width: BW, height: BH, rx: 26, fill: '#1f1f24', opacity: 0.08 });
    WB.mk('rect', { x: x - BW / 2, y: y - BH / 2, width: BW, height: BH, rx: 26, fill: '#fffdf6', 'fill-opacity': 0.75, stroke: INK.black, 'stroke-width': 7 });
    const g = WB.group(null);
    textNow('?', x, y + 85, 230, '#c9c4b5', g);
    textNow(String(i + 1), x - BW / 2 + 34, y - BH / 2 + 56, 46, INK.gray, null);
    return g;
  });

  // cena 1: promessa
  const g1 = WB.group(null);
  W(1, P(1, 'Eu vou'), 0.99, 'eu vou acertar as 4', 540, 1460, 84, INK.purple, { parent: g1 });
  rest(1, T(1, 1.0), sc(2).start);
  WB.effect(t => g1.setAttribute('opacity', t < sc(8).start - 0.2 ? 1 : 0));

  // pergunta (rótulo na caixa + contagem na pausa) e resposta (pula na caixa)
  const LBL = ['nº de 1 a 10', 'uma cor', 'uma ferramenta', 'um legume'];
  const perguntar = (i, c) => {
    const [x, y] = BOX[i];
    W(c, 0.0, 0.85, LBL[i], x + 16, y - BH / 2 + 60, 50, INK.blue);
    rest(c, T(c, 0.9), sc(c).end);
    countdown(fim(c) + 0.05, sc(c).end - 0.05, x, y + BH / 2 - 30, 70, WB.overlay);
  };
  const responder = (i, c, g) => {
    const [x, y] = BOX[i], t0 = sc(c).start + 0.05;
    popIn(g, x, y + 20, t0);
    burst(x, y + 20, t0);
    WB.effect(t => interroga[i].setAttribute('opacity', t < t0 ? 1 : 0));
  };

  // 1) número -> 7
  perguntar(0, 2);
  const r7 = WB.group(null); textNow('7', 0, 85, 250, INK.blue, r7);
  responder(0, 3, r7);
  // 2) cor -> vermelho (mancha de tinta)
  perguntar(1, 4);
  const rCor = WB.group(null);
  {
    let d = '';
    for (let k = 0; k <= 24; k++) {
      const a = k / 24 * Math.PI * 2, r = 92 + (k % 3 === 0 ? 26 : k % 2 ? -6 : 10);
      d += (k ? ' L ' : 'M ') + `${r1(r * Math.cos(a))} ${r1(-25 + r * 0.85 * Math.sin(a))}`;
    }
    WB.mk('path', { d: d + ' Z', fill: INK.red, stroke: '#8f1414', 'stroke-width': 5, 'stroke-linejoin': 'round' }, rCor);
    [[-120, 70, 16], [130, -90, 13], [115, 75, 10]].forEach(([cx, cy, r]) => WB.mk('circle', { cx, cy, r, fill: INK.red }, rCor));
    textNow('VERMELHO', 0, 140, 62, INK.red, rCor);
  }
  responder(1, 5, rCor);
  // 3) ferramenta -> martelo
  perguntar(2, 6);
  const rMart = WB.group(null);
  {
    const m = WB.mk('g', { transform: 'rotate(-28) translate(0 10)' }, rMart);
    WB.mk('rect', { x: -20, y: -40, width: 40, height: 190, rx: 10, fill: '#b5793f', stroke: INK.black, 'stroke-width': 6 }, m);
    WB.mk('path', { d: 'M -110 -115 L 80 -115 Q 115 -95 120 -60 L 80 -40 L -110 -40 Q -125 -78 -110 -115 Z', fill: '#8a8f99', stroke: INK.black, 'stroke-width': 6, 'stroke-linejoin': 'round' }, m);
    WB.mk('path', { d: 'M -90 -100 L 40 -100', stroke: '#c8ccd3', 'stroke-width': 8, 'stroke-linecap': 'round' }, m);
  }
  responder(2, 7, rMart);

  // contas rápidas (cenas 8 a 11), uma de cada vez embaixo das caixas
  const CONTAS = [[8, 'Dois', '2 + 2 ?'], [9, 'Quatro', '4 + 4 ?'], [10, 'Oito', '8 + 8 ?'], [11, 'Dezesseis', '16 + 16 ?']];
  CONTAS.forEach(([c, pal, txt], k) => {
    const g = WB.group(null);
    textNow(txt, 0, 40, 130, INK.black, g);
    const t0 = T(c, P(c, pal)) - 0.05, t1 = k < 3 ? T(CONTAS[k + 1][0], 0) - 0.02 : sc(12).start;
    popIn(g, 540, 1430, t0, t1, 0.7);
  });
  const gRap = WB.group(null);
  W(8, 0.0, P(8, 'Dois') - 0.03, 'contas RÁPIDO!', 540, 1580, 70, INK.orange, { parent: gRap });
  WB.effect(t => gRap.setAttribute('opacity', t < sc(12).start ? 1 : 0));
  // legume -> cenoura
  const gLeg = WB.group(null);
  textNow('UM LEGUME!', 0, 40, 130, INK.red, gLeg);
  popIn(gLeg, 540, 1440, sc(12).start + 0.02, sc(14).start, 0.6);
  {
    const [x, y] = BOX[3];
    const g = WB.group(null);
    textNow(LBL[3], 0, 0, 50, INK.blue, g);
    popIn(g, x + 16, y - BH / 2 + 60, sc(12).start + 0.02, 1e9, 0.7);
    countdown(fim(12) + 0.05, sc(12).end - 0.05, x, y + BH / 2 - 30, 70, WB.overlay);
  }
  const rCen = WB.group(null);
  {
    const m = WB.mk('g', { transform: 'rotate(-35) translate(0 20)' }, rCen);
    [['M -6 -95 Q -60 -160 -40 -195 Q -5 -150 4 -100 Z'], ['M 4 -98 Q 10 -175 40 -200 Q 40 -140 16 -95 Z'], ['M -14 -96 Q -95 -120 -95 -150 Q -40 -140 -2 -100 Z']]
      .forEach(([d]) => WB.mk('path', { d, fill: INK.green, stroke: INK.black, 'stroke-width': 5, 'stroke-linejoin': 'round' }, m));
    WB.mk('path', { d: 'M -52 -100 Q 0 -122 52 -100 Q 40 30 4 150 Q 0 158 -4 150 Q -40 30 -52 -100 Z', fill: '#f28c28', stroke: INK.black, 'stroke-width': 6, 'stroke-linejoin': 'round' }, m);
    [[-38, -50, 0], [30, -10, 1], [-25, 40, 0], [18, 85, 1]].forEach(([x, y, dir]) =>
      WB.mk('path', { d: dir ? `M ${x} ${y} L ${x - 22} ${y + 6}` : `M ${x} ${y} L ${x + 22} ${y + 6}`, stroke: '#a85a12', 'stroke-width': 5, 'stroke-linecap': 'round' }, m));
  }
  responder(3, 13, rCen);

  // cena 14: quantas eu acertei?
  W(14, 0.0, P(14, 'Comenta') - 0.02, 'quantas eu acertei?', 540, 1450, 88, INK.purple);
  W(14, P(14, 'Comenta'), 0.98, 'comenta: 4 de 4?', 540, 1570, 76, INK.green);
  rest(14, T(14, 1.0), sc(15).start);

  // =====================================================================
  // FOLHA 2 — CTA (link da bio / comenta MENTE) + loop (cenas 15 e 16)
  // =====================================================================
  page(15, 0.0);
  W(15, 0.04, P(15, 'vinte') + 0.02, 'Quer aprender', 540, 330, 84, INK.black);
  W(15, P(15, 'vinte'), P(15, 'mentalista') + 0.04, '20 TRUQUES', 540, 480, 140, INK.purple);
  W(15, P(15, 'mentalista') + 0.05, P(15, 'Tá no') - 0.01, 'de mentalista?', 540, 590, 84, INK.black);
  const bio = W(15, P(15, 'Tá no'), P(15, 'bio') + 0.05, 'tá no LINK da BIO', 540, 760, 116, INK.red);
  D(15, P(15, 'bio') + 0.05, P(15, 'ou com') - 0.01, [C.underline(540 - bio.width / 2, 540 + bio.width / 2, 795, INK.red)]);
  const bal = [sp(WB.roundRectPath(240, 860, 600, 230, 46), INK.purple, 9), sp('M 720 1090 L 790 1160 L 650 1090', INK.purple, 9)];
  D(15, P(15, 'ou com'), P(15, 'comenta') + 0.04, bal);
  W(15, P(15, 'comenta') + 0.04, P(15, 'MENTE'), 'ou comenta', 540, 930, 58, INK.gray);
  W(15, P(15, 'MENTE'), 0.99, 'MENTE', 540, 1055, 130, INK.purple);
  const v = W(16, 0.0, P(16, 'e faz') - 0.12, 'VOLTA', 600, 1330, 110, INK.orange);
  const vx = 600 - v.width / 2 - 80, vy = 1295, arcPts = [];
  for (let k = 0; k <= 30; k++) { const a = -0.3 - k / 30 * 4.9; arcPts.push([vx + 52 * Math.cos(a), vy + 52 * Math.sin(a)]); }
  const [pa, pb] = [arcPts[28], arcPts[30]];
  D(16, P(16, 'e faz') - 0.11, P(16, 'e faz') - 0.01, [sp('M ' + arcPts.map(p => `${r1(p[0])} ${r1(p[1])}`).join(' L '), INK.orange, 9),
    sp(WB.arrowHead(r1(pb[0]), r1(pb[1]), Math.atan2(pb[1] - pa[1], pb[0] - pa[0]), 26), INK.orange, 9)]);
  W(16, P(16, 'e faz'), 0.97, 'e faz com um AMIGO', 540, 1460, 90, INK.blue);
  rest(16, T(16, 1.0), sc(16).end);

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA (fora das caixas)
  // =====================================================================
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[310, 1700], [300, 145], [770, 1700], [780, 145]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % 4], b = SPOTS[(k + 1) % 4], e = ease(u);
      const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', 0.95);
    });
  }
};
