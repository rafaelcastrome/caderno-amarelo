// "Teu cérebro pinta a bandeira" (pós-imagem + ilusão da cachoeira), ~71 s, narração ElevenLabs (Gabriel).
// Fase 1: bandeira do Brasil com as cores invertidas; ~12 s encarando o ponto, aí a folha fica vazia de
// uma vez e o olho "pinta" verde e amarelo. Fase 2: espiral girando ~11 s; quando para, parece girar
// pro outro lado. Fim "Volta... e dessa vez, não pisca!" emenda no começo ("Essa bandeira tá com as cores...").
// A marca d'água @cardeno_amarelo passeia entre 3 pontos seguros.
window.CENAS = function (WB) {
  const { INK, C, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const D = (c, t0, t1, st) => WB.draw(c, fr(c, t0), fr(c, t1), st);
  const W = (c, t0, t1, txt, x, y, size, cor, o = {}) => WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o });
  const rest = (c, t0, t1) => WB.restHand(c, fr(c, t0), fr(c, t1));
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 7, parent) => WB.strokePath(d, cor, w, parent);
  const fill = (tag, attrs, parent) => WB.mk(tag, { 'fill-opacity': 0, stroke: 'none', ...attrs }, parent);
  // cores reais da bandeira e as invertidas (complementares) que geram a pós-imagem certa
  const REAL = { verde: '#009c3b', amarelo: '#ffdf00', azul: '#002776' };
  const INV = { verde: '#ff63c4', amarelo: '#0020ff', azul: '#ffd889', branco: '#111111' };
  const AGORA1 = 18.78, AGORA2 = 49.72;   // "Agora!" na narração
  const SPIN0 = 38.8;                      // a espiral começa a girar

  // contagem regressiva (números prontos, só troca a opacidade)
  function countdown(t0, t1, x, y, parent) {
    const n = Math.ceil(t1 - t0);
    const g = WB.group(parent);
    const nums = [];
    for (let k = 1; k <= n; k++) {
      const gk = WB.group(g);
      WB.showNow(WB.textStrokes(String(k), x, y, 120, INK.gray, gk, 'middle').strokes);
      gk.setAttribute('opacity', 0);
      nums.push(gk);
    }
    WB.effect(t => {
      const v = (t >= t0 && t < t1) ? Math.ceil(t1 - t) : 0;
      nums.forEach((gk, i) => gk.setAttribute('opacity', i + 1 === v ? 1 : 0));
    });
  }

  // =====================================================================
  // FOLHA 1 — a bandeira invertida (cenas 1 e 2) e a revelação (cenas 3 e 4)
  // =====================================================================
  const FX0 = 130, FY0 = 573, U = 41;          // bandeira 20 x 14 unidades = 820 x 574 px
  const FX1 = FX0 + 20 * U, FY1 = FY0 + 14 * U;
  const CX = 540, CY = FY0 + 7 * U;            // centro (540, 860)
  const pg1 = WB.group();
  const flag = WB.group(pg1);
  const rectF = fill('rect', { x: FX0, y: FY0, width: 20 * U, height: 14 * U, fill: INV.verde }, flag);
  const losD = `M ${FX0 + 1.7 * U} ${CY} L ${CX} ${FY0 + 1.7 * U} L ${FX1 - 1.7 * U} ${CY} L ${CX} ${FY1 - 1.7 * U} Z`;
  const losF = fill('path', { d: losD, fill: INV.amarelo }, flag);
  const R = 3.5 * U;
  const circF = fill('circle', { cx: CX, cy: CY, r: R, fill: INV.azul }, flag);
  const rectO = [sp(WB.roughRect(FX0, FY0, FX1, FY1), INK.black, 7, flag)];
  const losO = [sp(`M ${FX0 + 1.7 * U} ${CY} L ${CX} ${FY0 + 1.7 * U} L ${FX1 - 1.7 * U} ${CY} L ${CX} ${FY1 - 1.7 * U} L ${FX0 + 1.7 * U} ${CY}`, INK.black, 6, flag)];
  const circO = [sp(WB.circlePath(CX, CY, R), INK.black, 6, flag)];
  WB.mk('circle', { cx: CX, cy: CY, r: R - 3 }, WB.mk('clipPath', { id: 'clipGlobo' }, flag));
  const bandG = WB.group(flag);
  bandG.setAttribute('clip-path', 'url(#clipGlobo)');
  const band = [sp(`M ${CX - R - 10} ${CY + 25} Q ${CX} ${CY - 85} ${CX + R + 10} ${CY + 5}`, INV.branco, 26, bandG)];
  D(1, 0.12, 0.62, rectO); WB.fillAfter(rectF, rectO, 0.2);
  D(1, 0.68, 1.12, losO); WB.fillAfter(losF, losO, 0.2);
  D(1, 1.18, 1.5, circO); WB.fillAfter(circF, circO, 0.2);
  D(1, 1.55, 1.78, band);
  W(1, 1.85, 2.9, 'cores ERRADAS?', 540, 440, 100, INK.red, { parent: pg1 });
  const hookTxt = WB.group(pg1);
  W(1, 3.1, 4.75, 'teu cérebro conserta...', 540, 1290, 72, INK.gray, { parent: hookTxt });
  W(1, 4.85, 5.65, 'SOZINHO!', 540, 1400, 88, INK.purple, { parent: hookTxt });

  // cena 2: o ponto e a encarada
  const dotG = WB.group(WB.overlay);
  const dotF = fill('circle', { cx: CX, cy: CY, r: 13, fill: '#000' }, dotG);
  const dotO = [sp(WB.circlePath(CX, CY, 9), '#000', 8, dotG)];
  D(2, 6.42, 6.7, dotO); WB.fillAfter(dotF, dotO, 0.1);
  WB.effect(t => dotG.setAttribute('opacity', t < 25.2 ? 1 : 1 - clamp((t - 25.2) / 0.4)));
  WB.effect(t => hookTxt.setAttribute('opacity', (1 - clamp((t - 7.3) / 0.4)).toFixed(3)));
  W(2, 7.85, 8.85, 'NÃO PISCA!', 540, 1330, 100, INK.red, { parent: pg1 });
  rest(2, 8.95, 18.6);
  countdown(6.78, AGORA1, 540, 1500, pg1);
  // "Agora!": a folha fica vazia na hora (só o ponto fica)
  WB.effect(t => pg1.setAttribute('opacity', t < AGORA1 ? 1 : 0));

  // cena 4: ela não tá aí
  W(4, 24.9, 25.95, 'ELA NÃO TÁ AÍ!', 540, 1330, 96, INK.red);
  W(4, 26.3, 27.1, 'nunca esteve', 540, 1440, 72, INK.gray);

  // =====================================================================
  // FOLHA 2 — por quê (cenas 5 e 6)
  // =====================================================================
  WB.newPage(5, 0, 0.06);
  // olho cansado
  const eye = [sp(`M 330 470 Q 540 330 750 470 Q 540 610 330 470`, INK.black, 8),
    sp(WB.circlePath(540, 470, 62), INK.blue, 7)];
  const pup = fill('circle', { cx: 540, cy: 470, r: 26, fill: INK.black });
  D(5, 27.75, 28.4, eye); WB.fillAfter(pup, eye, 0.15);
  W(5, 28.45, 29.2, 'z z z', 830, 380, 64, INK.purple);
  W(5, 29.3, 29.95, 'CANSOU!', 540, 720, 96, INK.orange);
  // pares: cor que você encarou -> cor que você viu
  const ROWS = [[INV.verde, REAL.verde, 900], [INV.amarelo, REAL.amarelo, 1060], [INV.azul, REAL.azul, 1220]];
  W(5, 30.0, 30.4, 'encarou', 330, 815, 52, INK.gray);
  W(5, 30.45, 30.75, 'viu', 750, 815, 52, INK.gray);
  ROWS.forEach(([a, b, y], i) => {
    const t0 = 30.85 + i * 0.8;
    const fa = fill('rect', { x: 230, y: y - 55, width: 200, height: 110, rx: 10, fill: a });
    const fb = fill('rect', { x: 650, y: y - 55, width: 200, height: 110, rx: 10, fill: b });
    const oa = [sp(WB.roughRect(230, y - 55, 430, y + 55), INK.black, 5)];
    const ar = C.arrow(460, y, 620, y, INK.black, 7);
    const ob = [sp(WB.roughRect(650, y - 55, 850, y + 55), INK.black, 5)];
    D(5, t0, t0 + 0.25, oa); WB.fillAfter(fa, oa, 0.1);
    D(5, t0 + 0.27, t0 + 0.45, ar);
    D(5, t0 + 0.47, t0 + 0.72, ob); WB.fillAfter(fb, ob, 0.1);
  });
  const pi = W(6, 33.55, 35.0, 'PÓS-IMAGEM', 540, 1440, 112, INK.blue);
  D(6, 35.05, 35.3, C.underline(540 - pi.width / 2, 540 + pi.width / 2, 1470, INK.blue));

  // =====================================================================
  // FOLHA 3 — fase 2: a espiral (cenas 7, 8, 9)
  // =====================================================================
  WB.newPage(6, fr(6, 35.5), fr(6, 35.95));
  W(6, 36.45, 37.4, 'FASE 2', 540, 360, 110, INK.orange);
  const SCX = 540, SCY = 880;
  const spiral = WB.group();
  const arm = off => {
    let d = '';
    for (let th = 0; th <= 5 * Math.PI + 1e-6; th += 0.06) {
      const r = 14 + 22 * th, a = th + off;
      d += (d ? ' L ' : 'M ') + r1(SCX + r * Math.cos(a)) + ' ' + r1(SCY + r * Math.sin(a));
    }
    return d;
  };
  const arms = [sp(arm(0), INK.black, 32, spiral), sp(arm(Math.PI), INK.black, 32, spiral)];
  const sdot = fill('circle', { cx: SCX, cy: SCY, r: 12, fill: INK.red }, spiral);
  D(7, 37.6, 38.6, arms); WB.fillAfter(sdot, arms, 0.1);
  rest(7, 38.65, 49.5);
  const SPEED = 216; // graus por segundo (0,6 volta/s)
  WB.effect(t => {
    const te = Math.min(t, AGORA2);
    let ang = 0;
    if (te > SPIN0) {
      const dt = te - SPIN0, ramp = 0.6;
      ang = SPEED * (dt < ramp ? dt * dt / (2 * ramp) : dt - ramp / 2);
    }
    spiral.setAttribute('transform', `rotate(${(ang % 360).toFixed(2)} ${SCX} ${SCY})`);
  });
  countdown(SPIN0, AGORA2, 540, 1440);
  // cena 8: parada
  W(8, 52.8, 53.9, 'PARADA!', 540, 1440, 110, INK.red);
  // cena 9: e a tua mão?
  W(9, 54.15, 55.5, 'e a tua MÃO?', 540, 1560, 84, INK.purple);
  rest(9, 55.6, 57.4);

  // =====================================================================
  // FOLHA 4 — ilusão da cachoeira (cena 10)
  // =====================================================================
  WB.newPage(10, 0, 0.06);
  W(10, 57.95, 59.45, 'ILUSÃO DA CACHOEIRA', 540, 380, 92, INK.blue);
  // penhasco, água caindo e pedras com setas pra cima
  const cliff = [sp(`M 180 560 L 470 560 L 470 1150 L 180 1150`, INK.black, 8)];
  const water = [0, 1, 2, 3].map(i => sp(`M ${490 + i * 34} 560 Q ${500 + i * 34} 760 ${488 + i * 34} 960 Q ${498 + i * 34} 1060 ${490 + i * 34} 1150`, INK.blue, 7));
  const rocks = [sp(`M 690 1150 Q 700 1040 770 1040 Q 850 1045 860 1150`, INK.black, 7),
    sp(`M 700 900 Q 720 820 780 830 Q 840 840 840 905 Q 790 925 700 900`, INK.black, 7)];
  const ups = [C.arrow(900, 1080, 900, 960, INK.red, 7), C.arrow(890, 880, 890, 770, INK.red, 7)];
  D(10, 59.55, 60.05, cliff);
  D(10, 60.1, 60.75, water);
  D(10, 60.8, 61.25, rocks);
  D(10, 61.3, 61.6, ups);
  W(10, 61.7, 62.7, '1834', 540, 1360, 120, INK.orange);
  W(10, 63.2, 64.3, 'Escócia', 540, 1470, 72, INK.gray);

  // =====================================================================
  // FOLHA 5 — CTA + loop (cena 11)
  // =====================================================================
  WB.newPage(11, 0, 0.05);
  W(11, 64.95, 65.6, 'Funcionou?', 540, 380, 92, INK.black);
  W(11, 65.75, 66.4, 'COMENTA:', 540, 500, 84, INK.gray);
  W(11, 66.5, 66.95, 'VI', 330, 630, 112, INK.green);
  W(11, 67.0, 67.65, 'ou NÃO VI', 640, 630, 100, INK.red);
  WB.ctaRedes(11, fr(11, 67.7), fr(11, 68.8), { y: 700, titulo: 'Me segue!', iconSize: 150 });
  W(11, 68.85, 69.45, 'VOLTA', 540, 1300, 120, INK.orange);
  W(11, 69.5, 70.9, 'e não pisca!', 540, 1420, 90, INK.red);
  rest(11, 70.95, 71.3);

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA
  // =====================================================================
  const CTA0 = S[10].start;
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[770, 1680], [250, 250], [310, 1680]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    const PARK = [310, 1680], STARES = [[6.2, AGORA1 + 0.3], [37.6, AGORA2 + 0.3]];
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % 3], b = SPOTS[(k + 1) % 3], e = ease(u);
      // nas duas encaradas ela fica parada embaixo, pra não passar por cima da bandeira/espiral
      const w = Math.max(...STARES.map(([s0, s1]) => clamp((t - s0 + 0.8) / 0.8) * (1 - clamp((t - s1) / 0.8))));
      const x = lerp(lerp(a[0], b[0], e), PARK[0], ease(w)), y = lerp(lerp(a[1], b[1], e), PARK[1], ease(w)) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.3) / 0.4) * (1 - clamp((t - CTA0 + 0.2) / 0.4)) * 0.95).toFixed(3));
    });
  }
};
