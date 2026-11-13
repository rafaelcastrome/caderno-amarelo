// "O lápis acha teu número" (relógio), narração Gemini Algieba (3.1, take único).
// Pensa em n (1-12); a cada toc conta n+1, n+2...; no 20 para. Toques 1-7 em qualquer lugar,
// toque 8 no 12 e depois anti-horário 11, 10, ... 1  =>  no toque 20-n o lápis está em n.
window.TOQUES = { inicio: 0.6, passo: 0.8 };
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const D = (t0, t1, st) => { const c = sceneOf(t0); WB.draw(c, fr(c, t0), fr(c, t1), st); };
  const W = (t0, t1, txt, x, y, size, cor, o = {}) => { const c = sceneOf(t0); return WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o }); };
  const rest = (t0, t1) => { if (t1 > t0 + 0.05) { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); } };
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 6, parent) => WB.strokePath(d, cor, w, parent);
  const circ = (x, y, r) => WB.circlePath(r1(x), r1(y), r);
  const fadeOut = (g, ts, d = 0.25) => WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - ts) / d)).toFixed(3)));
  const fim = c => S[c - 1].start + S[c - 1].fala;
  const aviso = (t0, t1, tSome, txt, x, y, size, cor, parent) => {
    const g = WB.group(parent); W(t0, t1, txt, x, y, size, cor, { parent: g }); if (tSome) fadeOut(g, tSome); return g;
  };
  const pulsar = (g, cx, cy, t0, amp = 0.05) => WB.effect(t => {
    const k = t > t0 ? 1 + amp * Math.sin((t - t0) * 8) * Math.exp(-(t - t0) * 1.5) : 1;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });

  // ===================== RELÓGIO (pronto no quadro 0) =====================
  const CX = 540, CY = 900, R = 400, RN = 318;
  const tit = WB.group();
  WB.showNow(WB.textStrokes('O LÁPIS ACHA', 540, 205, 112, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('O TEU NÚMERO', 540, 325, 112, INK.red, tit, 'middle').strokes);
  const relogio = WB.group();
  WB.mk('circle', { cx: CX, cy: CY, r: R, fill: '#fffaf0', stroke: 'none' }, relogio);
  const st = [sp(circ(CX, CY, R), INK.black, 12, relogio), sp(circ(CX, CY, R - 22), INK.blue, 4, relogio)];
  const POS = {};
  for (let n = 1; n <= 12; n++) {
    const a = (n / 12) * 2 * Math.PI - Math.PI / 2;
    const x = CX + RN * Math.cos(a), y = CY + RN * Math.sin(a);
    POS[n] = [x, y];
    st.push(...WB.textStrokes(String(n), x, y + 34, 108, INK.black, relogio, 'middle').strokes);
    for (let m = 1; m < 5; m++) {   // risquinhos dos minutos
      const b = a + (m / 5) * (Math.PI / 6);
      st.push(sp(`M ${r1(CX + (R - 34) * Math.cos(b))} ${r1(CY + (R - 34) * Math.sin(b))} L ${r1(CX + (R - 48) * Math.cos(b))} ${r1(CY + (R - 48) * Math.sin(b))}`, INK.gray, 4, relogio));
    }
  }
  st.push(sp(circ(CX, CY, 14), INK.red, 14, relogio));
  WB.showNow(st);

  // ===================== falas 1-5 =====================
  aviso(0.3, 1.3, S[1].start - 0.1, 'PENSA COMIGO', 540, 1480, 100, INK.blue);
  rest(1.4, S[1].start - 0.05);
  const s2 = S[1].start;
  aviso(s2 + 0.2, s2 + 1.4, S[2].start - 0.05, 'pensa num número', 540, 1470, 88, INK.blue);
  aviso(s2 + 1.7, s2 + 2.6, S[2].start - 0.05, 'de 1 a 12', 540, 1600, 110, INK.red);
  rest(s2 + 2.7, S[2].start - 0.05);
  const s3 = S[2].start;
  aviso(s3 + 0.2, s3 + 1.4, S[3].start - 0.05, 'a cada TOC do lápis', 540, 1470, 84, INK.purple);
  aviso(s3 + 1.8, s3 + 3.2, S[3].start - 0.05, 'conta +1 a partir', 540, 1590, 80, INK.blue);
  aviso(s3 + 3.4, s3 + 4.6, S[3].start - 0.05, 'do teu número', 540, 1700, 80, INK.blue);
  rest(s3 + 4.7, S[3].start - 0.05);
  const s4 = S[3].start, d4 = S[3].fala;
  aviso(s4 + 0.15, s4 + 1.0, S[4].start - 0.05, 'pensou no 5?', 540, 1470, 92, INK.gray);
  aviso(s4 + d4 * 0.45, s4 + d4 * 0.45 + 0.8, S[4].start - 0.05, '1º toc = 6', 540, 1600, 92, INK.purple);
  aviso(s4 + d4 * 0.68, s4 + d4 * 0.68 + 0.9, S[4].start - 0.05, 'depois 7, 8...', 540, 1720, 92, INK.purple);
  rest(s4 + d4 * 0.68 + 1.0, S[4].start - 0.05);
  const s5 = S[4].start, d5 = S[4].fala;
  aviso(s5 + 0.2, s5 + 1.3, S[5].start + 0.4, 'chegou no 20?', 540, 1470, 96, INK.blue);
  const para = aviso(s5 + d5 * 0.35, s5 + d5 * 0.35 + 0.8, S[5].start + 0.4, 'PARA!', 540, 1640, 170, INK.red);
  pulsar(para, 540, 1590, s5 + d5 * 0.35 + 0.8, 0.08);
  const val = aviso(fim(5) - 0.7, fim(5) - 0.1, S[5].start + 0.4, 'VALENDO!', 540, 1790, 100, INK.green);
  rest(fim(5), S[4].end - 0.05);

  // ===================== OS TOQUES =====================
  const T0 = S[5].start + window.TOQUES.inicio, TP = window.TOQUES.passo;
  const ORDEM = [3, 9, 6, 1, 10, 4, 7, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const ACIMA = 54;   // a ponta do lápis bate logo acima do centro do número
  const alvo = n => ({ x: POS[n][0] + 44, y: POS[n][1] + 44 });
  const chegadas = ORDEM.map((n, k) => T0 + k * TP);
  // a mão entra (do repouso até o primeiro número)
  const start0 = { x: CX + 60, y: CY + 520 };
  WB.handFollow(S[5].start, chegadas[0], t => {
    const u = ease(clamp((t - S[5].start) / (chegadas[0] - S[5].start))), b = alvo(ORDEM[0]);
    return { x: lerp(start0.x, b.x, u), y: lerp(start0.y, b.y, u) };
  });
  const MOVE = 0.26;
  for (let k = 0; k < ORDEM.length; k++) {
    const a = alvo(ORDEM[k]), tA = chegadas[k];
    const tFim = k + 1 < ORDEM.length ? chegadas[k + 1] : tA + 0.9;
    const temProx = k + 1 < ORDEM.length;
    const b = temProx ? alvo(ORDEM[k + 1]) : a;
    WB.handFollow(tA, tFim - 0.001, t => {
      const tm = tFim - MOVE;
      if (!temProx || t < tm) {
        // batida: desce rápido e fica parado em cima do número
        const pre = clamp((t - tA) / 0.08);
        return { x: a.x, y: a.y - 18 * (1 - pre) };
      }
      const u = ease(clamp((t - tm) / MOVE));
      return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) - 70 * Math.sin(Math.PI * u) };
    });
    // anel que pulsa no número tocado
    const g = WB.group();
    const ring = sp(circ(POS[ORDEM[k]][0], POS[ORDEM[k]][1], 70), INK.red, 8, g);
    WB.showNow([ring]);
    g.setAttribute('opacity', 0);
    const [nx, ny] = POS[ORDEM[k]];
    WB.effect(t => {
      const u = (t - tA) / 0.55;
      if (u < 0 || u > 1) { g.setAttribute('opacity', 0); return; }
      g.setAttribute('opacity', (1 - u).toFixed(3));
      const sc = 0.8 + 0.5 * u;
      g.setAttribute('transform', `translate(${r1(nx)} ${r1(ny)}) scale(${sc.toFixed(3)}) translate(${r1(-nx)} ${r1(-ny)})`);
    });
  }
  const tUlt = chegadas[ORDEM.length - 1] + 0.9;
  rest(tUlt, S[5].end - 0.05);

  // ===================== revelação + CTA =====================
  const s7 = S[6].start;
  const rv = WB.group();
  W(s7 + 0.05, s7 + 1.2, 'TAVA NO TEU', 540, 1500, 120, INK.red, { parent: rv });
  W(s7 + 1.25, s7 + 2.3, 'NÚMERO, NÉ?', 540, 1650, 120, INK.red, { parent: rv });
  pulsar(rv, 540, 1580, s7 + 2.3, 0.06);
  fadeOut(rv, S[7].start - 0.15, 0.2);
  rest(s7 + 2.4, S[6].end - 0.05);
  const s8 = S[7].start, d8 = S[7].fala;
  W(s8 + 0.1, s8 + 1.3, 'tenta com OUTRO', 540, 1490, 96, INK.blue);
  W(s8 + 1.4, s8 + 2.4, 'número!', 540, 1610, 96, INK.blue);
  W(Math.max(s8 + 2.5, s8 + d8 * 0.62), Math.max(s8 + 3.6, s8 + d8 * 0.62 + 1.1), 'COMENTA QUAL ERA', 540, 1760, 92, INK.red);
  rest(Math.max(s8 + 3.7, s8 + d8 * 0.62 + 1.2), S[7].end - 0.1);

  // ===================== MARCA D'ÁGUA QUE PASSEIA =====================
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[290, 1860], [790, 1860], [540, 1875], [300, 1850]];
    const HOLD = 4.2, MOVE2 = 0.8, CYC = HOLD + MOVE2;
    WB.effect(t => {
      const n = Math.floor(t / CYC), u = clamp((t - n * CYC - HOLD) / MOVE2);
      const a = SPOTS[n % 4], b = SPOTS[(n + 1) % 4], e = ease(u);
      const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.2) / 0.3) * 0.95).toFixed(3));
    });
  }
};
