// "Qual é a senha?" (desafio, caRdeno Amarelo, 18/11/2026, thread 99). Cadeado com pistas, 3 níveis.
// Senhas conferidas por força bruta (resposta única, toda pista necessária): 359, 158 e 475 (a 3ª não é revelada).
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const st = c => S[c - 1].start, fim = c => S[c - 1].start + S[c - 1].fala, en = c => S[c - 1].end;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const W = (t0, t1, txt, x, y, size, cor, o = {}) => { const c = sceneOf(t0); return WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o }); };
  const D = (t0, t1, s) => { const c = sceneOf(t0); WB.draw(c, fr(c, t0), fr(c, t1), s); };
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 6, parent) => WB.strokePath(d, cor, w, parent);
  const pop = (a, b, txt, x, y, size, cor, parent, anchor = 'middle') => {
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, anchor).strokes);
    WB.effect(t => {
      const u = clamp((t - a) / 0.18), k = t < a ? 0 : (u < 1 ? 0.6 + 0.5 * ease(u) : 1 + 0.1 * Math.exp(-(t - a - 0.18) * 10));
      g.setAttribute('opacity', (t < a ? 0 : 1 - clamp((t - b) / 0.2)).toFixed(3));
      g.setAttribute('transform', `translate(${x} ${y - size * 0.35}) scale(${k.toFixed(3)}) translate(${-x} ${-(y - size * 0.35)})`);
    });
    return g;
  };
  const janela = (g, a, b) => WB.effect(t => g.setAttribute('opacity', (clamp((t - a) / 0.2) * (1 - clamp((t - b) / 0.2))).toFixed(3)));

  // ---------- cabeçalho (pronto no quadro 0) ----------
  const head = WB.group(WB.overlay);
  WB.showNow(WB.textStrokes('QUAL É A SENHA?', 540, 165, 116, INK.red, head, 'middle').strokes);
  WB.showNow(WB.textStrokes('fala em voz alta!', 540, 255, 64, INK.blue, head, 'middle').strokes);
  WB.effect(t => {
    const k = 1 + 0.04 * Math.sin(t * 5) * Math.exp(-t * 0.4);
    head.setAttribute('transform', `translate(540 140) scale(${k.toFixed(3)}) translate(-540 -140)`);
    head.setAttribute('opacity', (1 - clamp((t - st(7) - 0.2) / 0.3)).toFixed(3));
  });

  const TXT = { '10': ['1 certo, no lugar', INK.green], '01': ['1 certo, lugar errado', INK.orange],
    '02': ['2 certos, lugar errado', INK.orange], '20': ['2 certos, no lugar', INK.green], '00': ['nada certo', INK.gray] };
  const NIV = [
    { c: 2, rev: 3, fimG: st(4), senha: '359', pistas: [['827', '00'], ['598', '02'], ['369', '20']] },
    { c: 4, rev: 5, fimG: st(6), senha: '158', pistas: [['890', '01'], ['410', '01'], ['054', '10'], ['490', '00']] },
    { c: 6, rev: null, fimG: st(7), senha: '???', pistas: [['089', '00'], ['671', '10'], ['724', '02'], ['286', '00'], ['834', '01']] },
  ];
  NIV.forEach((nv, i) => {
    const g = WB.group(), a = i === 0 ? -1 : st(nv.c), b = nv.fimG;
    janela(g, a, b - 0.05);
    if (i === 0) pop(-1, 999, 'NÍVEL 1', 540, 375, 92, INK.purple, g); else W(a + 0.05, a + 0.8, 'NÍVEL ' + (i + 1), 540, 375, 92, INK.purple, { parent: g });
    // cadeado com 3 casas
    const cx = 540, cy = 640, lk = WB.group(g), arco = WB.group(lk);
    WB.showNow([sp(`M ${cx - 75} ${cy - 60} L ${cx - 75} ${cy - 110} A 75 75 0 0 1 ${cx + 75} ${cy - 110} L ${cx + 75} ${cy - 60}`, INK.black, 14, arco)]);
    WB.mk('rect', { x: cx - 170, y: cy - 65, width: 340, height: 170, rx: 26, fill: '#fbbf24' }, lk);
    WB.showNow([sp(`M ${cx - 144} ${cy - 65} h 288 q 26 0 26 26 v 118 q 0 26 -26 26 h -288 q -26 0 -26 -26 v -118 q 0 -26 26 -26 Z`, INK.black, 6, lk)]);
    const slots = [0, 1, 2].map(k => {
      const x = cx - 100 + k * 100;
      WB.mk('rect', { x: x - 40, y: cy - 35, width: 80, height: 105, rx: 12, fill: '#fffaf0' }, lk);
      WB.showNow([sp(`M ${x - 40} ${cy - 35} h 80 v 105 h -80 Z`, INK.black, 4, lk)]);
      const q = WB.group(lk); WB.showNow(WB.textStrokes('?', x, cy + 48, 84, INK.gray, q, 'middle').strokes);
      return { x, q };
    });
    const r = nv.rev ? st(nv.rev) + 0.05 : 1e9;
    slots.forEach((s, k) => {
      WB.effect(t => s.q.setAttribute('opacity', t >= r + k * 0.35 ? 0 : 1));
      if (nv.rev) pop(r + k * 0.35, 999, nv.senha[k], s.x, cy + 48, 90, INK.green, lk);
    });
    WB.effect(t => {
      const u = ease(clamp((t - r - 1.2) / 0.35));
      arco.setAttribute('transform', `translate(0 ${r1(-45 * u)})`);
      const tr = t > fim(nv.c) && t < en(nv.c) ? 3 * Math.sin(t * 40) * clamp((t - (en(nv.c) - 3)) / 1) : 0;
      lk.setAttribute('transform', `rotate(${r1(tr)} ${cx} ${cy})`);
    });
    // pistas
    nv.pistas.forEach(([num, f], j) => {
      const y = 850 + j * 128, row = WB.group(g), t0 = i === 0 ? -1 : a + 0.6 + j * 0.25;
      [0, 1, 2].forEach(k => {
        const x = 150 + k * 92;
        WB.mk('rect', { x: x - 40, y: y - 52, width: 80, height: 92, rx: 10, fill: '#ffffff' }, row);
        WB.showNow([sp(`M ${x - 40} ${y - 52} h 80 v 92 h -80 Z`, INK.black, 4, row)]);
        WB.showNow(WB.textStrokes(num[k], x, y + 22, 70, INK.black, row, 'middle').strokes);
      });
      WB.showNow(WB.textStrokes(TXT[f][0], 400, y + 14, 54, TXT[f][1], row, 'start').strokes);
      WB.effect(t => { const u = clamp((t - t0) / 0.2); row.setAttribute('opacity', u.toFixed(3));
        row.setAttribute('transform', `translate(${r1(40 * (1 - ease(u)))} 0)`); });
    });
    // cronômetro
    const ta = fim(nv.c), tb = en(nv.c), yb = 850 + nv.pistas.length * 128 + 10;
    const bg = WB.mk('rect', { x: 190, y: yb, width: 700, height: 28, rx: 14, fill: '#efe7cf' }, g);
    const fg = WB.mk('rect', { x: 190, y: yb, width: 700, height: 28, rx: 14, fill: INK.red }, g);
    WB.effect(t => { const on = t >= (i === 0 ? st(2) : a + 0.6) && t < tb + 0.05; bg.setAttribute('opacity', on ? 1 : 0); fg.setAttribute('opacity', on ? 1 : 0);
      fg.setAttribute('width', r1(700 * (1 - clamp((t - ta) / (tb - ta))))); });
    const n = Math.round(tb - ta), nums = [];
    for (let k = 1; k <= n; k++) { const gk = WB.group(g); WB.showNow(WB.textStrokes(String(k), 540, yb + 120, 90, k <= 3 ? INK.red : INK.gray, gk, 'middle').strokes); nums.push(gk); }
    WB.effect(t => { const v = t >= ta && t < tb ? Math.ceil(tb - t) : 0; nums.forEach((gk, k) => gk.setAttribute('opacity', k + 1 === v ? 1 : 0)); });
    if (i > 0) rest(a + 0.85, a + 1.3); rest(ta + 0.1, tb - 0.1);
    if (nv.rev) { rest(st(nv.rev) + 0.1, en(nv.rev) - 0.1); }
  });
  // nível 1/2 resposta: "acertou?"
  pop(st(3) + 1.6, st(4) - 0.1, 'acertou?', 870, 640, 60, INK.blue);
  pop(st(5) + 1.3, st(6) - 0.1, 'ABRIU!', 860, 640, 64, INK.green);

  // ---------- cena 7: CTA (resposta do nível 3 só amanhã) ----------
  const s7 = st(7), F7 = S[6].fala;
  W(s7 + 0.1, s7 + 1.2, 'TEMPO!', 540, 330, 130, INK.red);
  W(s7 + 1.3, s7 + 2.6, 'comenta a senha', 540, 520, 100, INK.black);
  D(s7 + 2.6, s7 + 3.0, [sp('M 540 570 L 540 690 M 540 690 L 505 650 M 540 690 L 575 650', INK.black, 7)]);
  W(s7 + 3.0, s7 + 4.4, 'manda pro amigo esperto', 540, 800, 76, INK.blue);
  W(s7 + 4.6, s7 + 5.6, 'resposta AMANHÃ', 540, 980, 110, INK.purple);
  { const g = WB.group(), x = 540, y = 1160, a = s7 + 5.9;
    const bt = WB.mk('rect', { x: x - 170, y: y - 55, width: 340, height: 100, rx: 50, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); WB.showNow(WB.textStrokes('Seguir', x, y + 18, 64, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(g); WB.showNow(WB.textStrokes('Seguindo', x, y + 18, 58, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0);
      const k = on && t < a + 0.25 ? 0.7 + 1.2 * (t - a) : (done && t < a + 1.2 ? 1.08 : 1);
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`); }); }
  rest(s7 + F7, en(7) - 0.1);

  // ---------- @ que passeia ----------
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[290, 1790], [790, 1790], [540, 1805], [300, 1780]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const n = Math.floor(t / CYC), u = clamp((t - n * CYC - HOLD) / MOVE);
      const a = SPOTS[n % 4], b = SPOTS[(n + 1) % 4], e = ease(u);
      wm.setAttribute('transform', `translate(${r1(lerp(a[0], b[0], e))} ${r1(lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4)})`);
      wm.setAttribute('opacity', (clamp((t - 0.2) / 0.3) * 0.95).toFixed(3));
    });
  }
};
