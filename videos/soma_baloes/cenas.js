// "Soma dos balões": 4 níveis, cada um mais difícil (6 balões/3 = 30, 8/3 = 50, 9/3 = 100, 10/4 = 100).
// Cada nível tem UMA resposta só (conferido em conferir.py). Narração Gemini Algieba (3.1, take único).
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 6, parent) => WB.strokePath(d, cor, w, parent);
  const st = c => S[c - 1].start, fim = c => S[c - 1].start + S[c - 1].fala, F = c => S[c - 1].fala;
  const rest = (a, b) => { let c = 1; while (c < S.length && a >= S[c].start) c++; const fr = t => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start); WB.restHand(c, fr(a), fr(b)); };
  const W = (t0, t1, txt, x, y, size, cor) => { let c = 1; while (c < S.length && t0 >= S[c].start) c++; const fr = t => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start); return WB.write(c, fr(t0), fr(t1), txt, x, y, size, cor, { anchor: 'middle' }); };
  const pop = (a, b, txt, x, y, size, cor, parent) => {
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, 'middle').strokes);
    WB.effect(t => {
      const u = clamp((t - a) / 0.18), k = t < a ? 0.01 : (u < 1 ? 0.6 + 0.5 * ease(u) : 1 + 0.1 * Math.exp(-(t - a - 0.18) * 10));
      g.setAttribute('opacity', t < a ? 0 : (1 - clamp((t - b) / 0.2)).toFixed(3));
      g.setAttribute('transform', `translate(${x} ${y - size * 0.35}) scale(${k.toFixed(3)}) translate(${-x} ${-(y - size * 0.35)})`);
    });
    return g;
  };
  const pulsa = (g, cx, cy, a, amp = 0.08, vel = 9, dec = 2) => WB.effect(t => {
    const k = t > a ? 1 + amp * Math.sin((t - a) * vel) * Math.exp(-(t - a) * dec) : 1;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });

  // balão desenhado na origem (centro do corpo em 0,0); s = altura do corpo
  const balao = (parent, s, fill, txt) => {
    const g = WB.group(parent), rx = s * 0.4, ry = s * 0.5;
    const corpo = `M 0 ${-ry} C ${rx * 1.38} ${-ry} ${rx * 1.25} ${ry * 0.55} 0 ${ry} C ${-rx * 1.25} ${ry * 0.55} ${-rx * 1.38} ${-ry} 0 ${-ry} Z`;
    WB.mk('path', { d: `M 0 ${ry} q ${s * 0.12} ${s * 0.18} 0 ${s * 0.34} q ${-s * 0.12} ${s * 0.16} 0 ${s * 0.32}`, fill: 'none', stroke: '#6b6b6b', 'stroke-width': 3 }, g);
    WB.mk('path', { d: `M ${-s * 0.06} ${ry + s * 0.07} L ${s * 0.06} ${ry + s * 0.07} L 0 ${ry - 2} Z`, fill, stroke: INK.black, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
    WB.mk('path', { d: corpo, fill, stroke: INK.black, 'stroke-width': 5 }, g);
    WB.mk('path', { d: `M ${-rx * 0.62} ${-ry * 0.42} Q ${-rx * 0.55} ${-ry * 0.78} ${-rx * 0.15} ${-ry * 0.84}`, fill: 'none', stroke: '#ffffff', 'stroke-width': s * 0.06, 'stroke-linecap': 'round', opacity: 0.85 }, g);
    if (txt) WB.showNow(WB.textStrokes(txt, 0, s * 0.17, s * 0.5, INK.black, g, 'middle').strokes);
    return g;
  };
  const AMARELO = '#f7c843', VAZIO = '#ffffff';

  // ---------------- título fixo ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('ESCOLHE OS BALÕES', 540, 170, 100, INK.red, tit, 'middle').strokes);
  pulsa(tit, 540, 140, 0.3, 0.05, 8, 1.5);

  const NIV = [
    { c: 1, k: 3, alvo: 30, nums: [5, 14, 16, 4, 13, 11], cols: 3, resp: [5, 11, 14] },
    { c: 3, k: 3, alvo: 50, nums: [25, 19, 2, 21, 22, 28, 5, 24], cols: 4, resp: [21, 5, 24] },
    { c: 5, k: 3, alvo: 100, nums: [55, 25, 22, 52, 58, 35, 42, 24, 21], cols: 3, resp: [55, 21, 24] },
    { c: 7, k: 4, alvo: 100, nums: [17, 26, 29, 33, 22, 42, 13, 25, 30, 18], cols: 5, resp: [13, 25, 29, 33] }];
  const DICA = ['nível 1 · fácil', 'nível 2 · médio', 'nível 3 · difícil', 'nível 4 · gênio'];

  // bolinhas de nível
  NIV.forEach((n, i) => {
    const x = 390 + i * 100, y = 285, g = WB.group();
    const ci = WB.mk('circle', { cx: x, cy: y, r: 34, fill: '#fffaf0' }, g);
    WB.showNow([sp(WB.circlePath(x, y, 34), INK.black, 5, g)]);
    WB.showNow(WB.textStrokes(String(i + 1), x, y + 16, 50, INK.black, g, 'middle').strokes);
    const a = i ? st(n.c) : 0, fimN = st(n.c + 2) || 999;
    WB.effect(t => { const ativo = t >= a && t < st(n.c + 1), feito = t >= st(n.c + 1);
      ci.setAttribute('fill', ativo ? '#fde68a' : feito ? '#d9f2df' : '#fffaf0'); });
  });

  NIV.forEach((n, li) => {
    const a = li === 0 ? 0 : st(n.c) + 0.15, T0 = fim(n.c) + 0.15, T1 = S[n.c - 1].end, fimN = S[n.c].end;
    const g = WB.group();
    WB.effect(t => g.setAttribute('opacity', t < a ? 0 : (1 - clamp((t - fimN + 0.25) / 0.25)).toFixed(3)));
    pop(a, fimN - 0.05, DICA[li], 540, 395, 58, INK.blue, g);
    // equação: k balões vazios + "= alvo"
    const slotW = n.k === 4 ? 135 : 165, plusW = 50, eqW = n.alvo >= 100 ? 290 : 240;
    const total = n.k * slotW + (n.k - 1) * plusW + eqW, x0 = 540 - total / 2, ey = 560, es = n.k === 4 ? 118 : 140;
    const slots = [];
    for (let i = 0; i < n.k; i++) {
      const cx = x0 + slotW / 2 + i * (slotW + plusW);
      slots.push(cx);
      const b = balao(g, es, VAZIO); b.setAttribute('transform', `translate(${r1(cx)} ${ey})`);
      if (i < n.k - 1) WB.showNow(WB.textStrokes('+', cx + slotW / 2 + plusW / 2, ey + 28, 90, INK.black, g, 'middle').strokes);
    }
    const eqx = x0 + n.k * slotW + (n.k - 1) * plusW + eqW / 2;
    const eqg = WB.group(g);
    WB.showNow(WB.textStrokes('= ' + n.alvo, eqx, ey + 45, 140, INK.red, eqg, 'middle').strokes);
    pulsa(eqg, eqx, ey, a + 0.2, 0.1, 9, 2.5);
    // grade de balões amarelos
    const rows = Math.ceil(n.nums.length / n.cols), cw = Math.min(240, 960 / n.cols), bs = n.cols >= 5 ? 160 : n.cols === 4 ? 185 : 205;
    const rh = Math.min(300, 820 / rows), gy0 = 800 + (820 - rh * rows) / 2 + rh * 0.38;
    const vistos = {};
    n.nums.forEach((v, i) => {
      const r = Math.floor(i / n.cols), naLinha = Math.min(n.cols, n.nums.length - r * n.cols), c = i % n.cols;
      const gx = 540 + (c - (naLinha - 1) / 2) * cw, gy = gy0 + r * rh;
      const bg = WB.group(g); balao(bg, bs, AMARELO, String(v));
      const ri = n.resp.indexOf(v), ph = i * 1.7;
      const tv = T1 + 0.05 + ri * (F(n.c + 1) / n.k) * 0.9; // voa quando o número é falado
      WB.effect(t => {
        const ap = li === 0 ? 1 : clamp((t - a - 0.05 * i) / 0.3), k0 = 0.6 + 0.4 * ease(ap);
        let x = gx, y = gy + Math.sin(t * 2.2 + ph) * 6, k = k0, op = ap;
        if (ri >= 0) {
          const u = ease(clamp((t - tv) / 0.55));
          x = lerp(gx, slots[ri], u); y = lerp(y, ey, u) - Math.sin(u * Math.PI) * 60; k = lerp(k0, es / bs, u);
        } else if (t >= T1) op = Math.max(0.2, 1 - clamp((t - T1) / 0.3) * 0.8);
        bg.setAttribute('opacity', op.toFixed(3));
        bg.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.6 + ph) * 3)}) scale(${k.toFixed(3)})`);
      });
    });
    // check verde no fim da revelação
    const ok = WB.group(g); WB.showNow([sp(`M ${eqx - 60} ${ey + 120} l 35 35 l 75 -80`, '#16a34a', 14, ok)]);
    const tOk = T1 + F(n.c + 1) * 0.9 + 0.5;
    WB.effect(t => ok.setAttribute('opacity', t >= tOk ? 1 : 0));
    // cronômetro
    const bgb = WB.mk('rect', { x: 240, y: 1660, width: 560, height: 26, rx: 13, fill: '#efe7cf' }, g);
    const fg = WB.mk('rect', { x: 240, y: 1660, width: 560, height: 26, rx: 13, fill: INK.red }, g);
    const nums = [], secs = Math.round(T1 - T0);
    for (let s = secs; s >= 1; s--) { const ng = WB.group(g); WB.showNow(WB.textStrokes(String(s), 900, 1700, 80, INK.red, ng, 'middle').strokes); nums.push([s, ng]); }
    { const rg = WB.group(g); WB.showNow([sp(WB.circlePath(170, 1672, 34), INK.black, 6, rg), sp('M 170 1672 l 0 -22 M 170 1672 l 16 8', INK.black, 6, rg)]);
      WB.effect(t => rg.setAttribute('opacity', t >= T0 && t < T1 ? 1 : 0)); }
    WB.effect(t => { const on = t >= T0 && t < T1; bgb.setAttribute('opacity', on ? 1 : 0); fg.setAttribute('opacity', on ? 1 : 0);
      fg.setAttribute('width', r1(560 * (1 - clamp((t - T0) / (T1 - T0)))));
      const rs = Math.ceil(T1 - t); nums.forEach(([s, ng]) => ng.setAttribute('opacity', on && s === rs ? 1 : 0)); });
    rest(T0 - 0.1, fimN - 0.05);
  });
  rest(0.1, 0.2);

  // ---------------- CTA ----------------
  const c9 = 9, s9 = st(c9), F9 = F(c9);
  W(s9 + 0.1, s9 + F9 * 0.28, 'até que nível', 540, 600, 100, INK.black);
  W(s9 + F9 * 0.12, s9 + F9 * 0.3, 'tu chegou?', 540, 710, 100, INK.black);
  { const g = pop(s9 + 0.6, 999, '__ de 4', 540, 900, 170, INK.red); pulsa(g, 540, 840, s9 + 0.8, 0.06, 6, 0.6); }
  W(s9 + F9 * 0.33, s9 + F9 * 0.55, 'manda pro amigo', 540, 1090, 100, INK.purple);
  W(s9 + F9 * 0.45, s9 + F9 * 0.62, 'que se acha bom de conta', 540, 1190, 74, INK.blue);
  { const g = WB.group(), x = 540, y = 1360, a = s9 + F9 * 0.66;
    const bt = WB.mk('rect', { x: x - 170, y: y - 55, width: 340, height: 100, rx: 50, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); WB.showNow(WB.textStrokes('Seguir', x, y + 18, 64, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(g); WB.showNow(WB.textStrokes('Seguindo', x, y + 18, 58, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0); });
    pop(a + 0.3, 999, 'amanhã: nível 5', 540, 1530, 80, INK.red); }
  rest(s9 + F9, S[c9 - 1].end - 0.1);

  // ---------------- marca d'água que passeia ----------------
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[290, 1780], [790, 1780], [540, 1810], [300, 1770]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const n = Math.floor(t / CYC), u = clamp((t - n * CYC - HOLD) / MOVE);
      const a = SPOTS[n % 4], b = SPOTS[(n + 1) % 4], e = ease(u);
      const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.2) / 0.3) * 0.95).toFixed(3));
    });
  }
};
