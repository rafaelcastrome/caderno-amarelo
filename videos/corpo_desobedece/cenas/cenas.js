// "Teu corpo não te obedece", ~75 s, narração Gemini Charon (tomada única cortada nos silêncios).
// Teste 1: gira o pé direito no sentido do relógio e desenha um 6 com a mão direita: o pé vira.
// Teste 2: pontas dos dedos juntas, dedos do meio dobrados: polegar, mindinho e indicador separam; o anelar não.
// Fim "volta... gira o pé de novo" emenda no começo ("Teu corpo não te obedece").
// Os tempos são frações da FALA de cada cena (timeline.json -> falaFim), então se ajustam a qualquer take.
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
  const fill = (tag, attrs, parent) => WB.mk(tag, { 'fill-opacity': 0, stroke: 'none', ...attrs }, parent);
  // fração da fala em que aparece a palavra (n-ésima ocorrência)
  const P = (c, palavra, n = 1) => {
    const txt = WB.projeto.cenas[c - 1].fala; let i = -1;
    for (let k = 0; k < n; k++) i = txt.indexOf(palavra, i + 1);
    return i / txt.length;
  };
  const SKIN = '#f6d5b0';

  function countdown(t0, t1, x, y, parent) {
    const n = Math.ceil(t1 - t0);
    const g = WB.group(parent);
    const nums = [];
    for (let k = 1; k <= n; k++) {
      const gk = WB.group(g);
      WB.showNow(WB.textStrokes(String(k), x, y, 110, INK.gray, gk, 'middle').strokes);
      gk.setAttribute('opacity', 0);
      nums.push(gk);
    }
    WB.effect(t => {
      const v = (t >= t0 && t < t1) ? Math.ceil(t1 - t) : 0;
      nums.forEach((gk, i) => gk.setAttribute('opacity', i + 1 === v ? 1 : 0));
    });
  }
  // seta circular (elipse aberta + ponta); dir 1 = sentido do relógio
  function roda(cx, cy, rx, ry, cor, dir = 1, parent) {
    const a0 = -2.4, span = 5.0 * dir, N = 40;
    const pts = [];
    for (let k = 0; k <= N; k++) { const a = a0 + span * k / N; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    const d = 'M ' + pts.map(p => `${r1(p[0])} ${r1(p[1])}`).join(' L ');
    const [px, py] = pts[N - 2], [ex, ey] = pts[N];
    return [sp(d, cor, 9, parent), sp(WB.arrowHead(r1(ex), r1(ey), Math.atan2(ey - py, ex - px), 34), cor, 9, parent)];
  }

  // =====================================================================
  // FOLHA 1 — gancho (cena 1)
  // =====================================================================
  W(1, 0.0, 0.2, 'Teu CORPO', 540, 470, 140, INK.red);
  W(1, 0.2, 0.42, 'não te obedece', 540, 600, 96, INK.black);
  const fig = C.stickFigure(540, 820, { scale: 1.3, color: INK.black });
  D(1, 0.42, 0.75, fig);
  W(1, 0.75, 0.98, 'vou te provar', 540, 1440, 80, INK.gray);

  // =====================================================================
  // FOLHA 2 — teste 1: pé + número 6 (cenas 2 a 5)
  // =====================================================================
  page(2, 0);
  const t1 = WB.group();
  W(2, 0.02, 0.2, 'pé DIREITO', 540, 360, 110, INK.blue);
  // perna e pé de lado
  const FX = 300, FY = 820;
  const foot = [sp(`M ${FX} ${FY - 240} L ${FX + 4} ${FY + 110}`, INK.black, 9),
    sp(`M ${FX + 90} ${FY - 240} L ${FX + 92} ${FY + 120}`, INK.black, 9),
    sp(`M ${FX + 4} ${FY + 110} Q ${FX - 10} ${FY + 200} ${FX + 60} ${FY + 205} L ${FX + 250} ${FY + 210} Q ${FX + 300} ${FY + 195} ${FX + 270} ${FY + 160} Q ${FX + 200} ${FY + 135} ${FX + 92} ${FY + 120}`, INK.black, 9)];
  const footF = fill('path', { d: `M ${FX} ${FY - 240} L ${FX + 4} ${FY + 110} Q ${FX - 10} ${FY + 200} ${FX + 60} ${FY + 205} L ${FX + 250} ${FY + 210} Q ${FX + 300} ${FY + 195} ${FX + 270} ${FY + 160} Q ${FX + 200} ${FY + 135} ${FX + 92} ${FY + 120} L ${FX + 90} ${FY - 240} Z`, fill: SKIN });
  D(2, 0.22, 0.42, foot); WB.fillAfter(footF, foot, 0.2);
  const rodaOk = roda(FX + 170, FY + 175, 190, 95, INK.green, 1);
  D(2, 0.5, 0.7, rodaOk);
  W(2, 0.66, 0.98, 'gira pro lado do relógio', 540, 1200, 70, INK.green, { parent: t1 });
  // o 6 da mão direita
  const SX = 790, SY = 760;
  const seis = [sp(`M ${SX + 40} ${SY} Q ${SX - 70} ${SY + 40} ${SX - 80} ${SY + 190} Q ${SX - 80} ${SY + 300} ${SX + 5} ${SY + 300} Q ${SX + 85} ${SY + 300} ${SX + 85} ${SY + 225} Q ${SX + 85} ${SY + 155} ${SX + 5} ${SY + 155} Q ${SX - 60} ${SY + 155} ${SX - 78} ${SY + 215}`, INK.purple, 12)];
  W(3, P(3, 'Agora') - 0.02, P(3, 'mão') + 0.05, 'mão DIREITA:', 790, 690, 64, INK.purple);
  D(3, P(3, 'seis') - 0.05, P(3, 'seis') + 0.15, seis);
  W(3, 0.0, 0.25, 'não para!', 260, 1340, 70, INK.orange, { parent: t1 });
  rest(3, T(3, 1.0), sc(4).start - 0.1);
  countdown(sc(3).falaFim, sc(4).start, 790, 1340, t1);
  WB.effect(t => t1.setAttribute('opacity', t < sc(4).start ? 1 : 0));
  // cena 4: virou
  const rodaX = roda(FX + 170, FY + 175, 220, 120, INK.red, -1);
  D(4, 0.0, 0.2, rodaX);
  const st = C.stamp('VIROU!', 540, 1300, { size: 120, color: INK.red, rot: -8 });
  D(4, 0.25, 0.6, [st.box, st.text]);
  // cena 5: por quê
  W(5, 0.12, 0.42, 'mão + pé do MESMO lado', 540, 1460, 70, INK.black);
  W(5, 0.5, 0.75, 'querem girar JUNTOS', 540, 1545, 70, INK.blue);
  rest(5, T(5, 0.8), sc(6).start + 0.1);

  // =====================================================================
  // FOLHA 3 — teste 2: dedos (cenas 6 a 11)
  // =====================================================================
  page(6, 0.1);
  W(6, 0.45, 0.95, 'FASE 2', 540, 330, 120, INK.orange);
  // duas mãos em pé, pulsos embaixo, dedos subindo em leque até as pontas se encostarem no meio (x = 540)
  const CX = 540, m = x => 1080 - x, deg = 180 / Math.PI;
  // [base x, base y, ponta y, largura]  (mão esquerda; a direita é o espelho)
  const DEDOS = { polegar: [418, 948, 862, 64], indicador: [362, 802, 722, 58], MEIO: [348, 735, 636, 60], anelar: [338, 668, 548, 56], mindinho: [332, 606, 466, 50] };
  const SKIN2 = '#e9b98c';
  const palma = lado => {
    const X = x => (lado < 0 ? x : m(x));
    const pts = `M ${X(300)} 572 Q ${X(352)} 584 ${X(356)} 640 L ${X(368)} 830 Q ${X(400)} 900 ${X(452)} 968 Q ${X(400)} 1040 ${X(330)} 1052 L ${X(312)} 1150 L ${X(170)} 1150 L ${X(178)} 840 Q ${X(190)} 640 ${X(300)} 572 Z`;
    const g = WB.group();
    fill('path', { d: pts, fill: SKIN, 'fill-opacity': 1 }, g);
    WB.showNow([sp(`M ${X(300)} 572 Q ${X(190)} 640 ${X(178)} 840 L ${X(170)} 1150`, INK.black, 8, g),
      sp(`M ${X(312)} 1150 L ${X(330)} 1052 Q ${X(400)} 1040 ${X(452)} 968`, INK.black, 8, g)]);
    g.setAttribute('opacity', 0);
    return g;
  };
  // dedo em coordenadas locais: base em x=0, ponta em x=L, eixo no y=0; rr = raio da ponta
  const tuboD = (L, w, rr = w / 2) => {
    const r = w / 2;
    return `M 0 ${-r} L ${L - rr} ${-r} Q ${L} ${-r} ${L} ${-r + rr} L ${L} ${r - rr} Q ${L} ${r} ${L - rr} ${r} L 0 ${r}`;
  };
  const dedo = {};
  const ordem = ['polegar', 'indicador', 'MEIO', 'anelar', 'mindinho'];
  const G1 = palma(-1), G2 = palma(1);
  WB.fade(7, fr(7, T(7, 0.03)), fr(7, T(7, 0.1)), G1, 0, 1);
  WB.fade(7, fr(7, T(7, 0.1)), fr(7, T(7, 0.17)), G2, 0, 1);
  ordem.forEach((nome, i) => {
    const [bx, by, ty, w] = DEDOS[nome];
    const tx = CX - 3, L = Math.hypot(tx - bx, ty - by), th = Math.atan2(ty - by, tx - bx) * deg;
    const mk1 = (lado, cor = SKIN, rr = w / 2, ext = 40) => {
      const len = L;
      const g = WB.group();
      const inner = WB.group(g);
      fill('path', { d: tuboD(len, w, rr).replace('M 0', `M ${-ext}`).replace(/L 0 /, `L ${-ext} `) + ' Z', fill: cor, 'fill-opacity': 1 }, inner);
      WB.showNow([sp(tuboD(len, w, rr), INK.black, 7, inner)]);
      return { g, inner };
    };
    const place = (o, lado, pull = 0, extra = 0) => {
      const x = lado < 0 ? bx : m(bx), a = lado < 0 ? th + extra : 180 - th - extra;
      o.g.setAttribute('transform', `translate(${x} ${by}) rotate(${r1(a)})`);
      o.inner.setAttribute('transform', `translate(${r1(-pull)} 0)`);
    };
    const E = mk1(-1), Dd = mk1(1);
    // unha
    for (const o of [E, Dd]) WB.showNow([sp(WB.roundRectPath(L - w / 2 - 30, -w / 2 + 9, 30, w - 18, 9), INK.gray, 4, o.inner)]);
    place(E, -1); place(Dd, 1);
    E.g.setAttribute('opacity', 0); Dd.g.setAttribute('opacity', 0);
    const f0 = 0.2 + i * 0.05;
    WB.fade(7, fr(7, T(7, f0)), fr(7, T(7, f0 + 0.04)), E.g, 0, 1);
    WB.fade(7, fr(7, T(7, f0)), fr(7, T(7, f0 + 0.04)), Dd.g, 0, 1);
    dedo[nome] = { E, Dd, place, L, w, mk1, th, bx, by };
  });
  // dedo do meio dobrado: encosta pelo nó (ponta reta e mais escura) e a ponta do dedo some pra baixo
  const MD = dedo.MEIO;
  const gDob = WB.group(); gDob.setAttribute('opacity', 0);
  for (const lado of [-1, 1]) {
    const o = MD.mk1(lado, SKIN2, 10, 0);
    gDob.appendChild(o.g);
    WB.showNow([sp(`M ${MD.L - 40} ${-MD.w / 2 + 8} Q ${MD.L - 26} 0 ${MD.L - 40} ${MD.w / 2 - 8}`, INK.red, 6, o.inner)]);
    MD.place(o, lado);
  }
  const tDob = T(7, P(7, 'dobra'));
  WB.effect(t => {
    const k = clamp((t - tDob) / 0.5);
    gDob.setAttribute('opacity', k.toFixed(3));
    if (t >= tDob) { MD.E.g.setAttribute('opacity', (1 - k).toFixed(3)); MD.Dd.g.setAttribute('opacity', (1 - k).toFixed(3)); }
  });
  W(7, P(7, 'dobra') + 0.02, P(7, 'encostando'), 'MEIO', 100, 760, 56, INK.red);
  D(7, P(7, 'encostando'), P(7, 'encostando') + 0.08, [C.arrow(150, 775, 330, 740, INK.red, 6)]);
  const gMeio = WB.group();
  W(7, P(7, 'encostando') + 0.1, 0.98, 'dedos do MEIO dobrados', 540, 1240, 62, INK.red, { parent: gMeio });
  rest(7, T(7, 1.0), sc(8).start - 0.1);

  // cena 8: separa e junta (polegar, mindinho, indicador): o dedo recua e abre espaço entre as pontas
  const LISTA = { polegar: 1320, mindinho: 1390, indicador: 1460 };
  const separa = (nome, fS, fJ) => {
    const dd = dedo[nome];
    const tS = T(8, fS), tJ = T(8, fJ);
    WB.effect(t => {
      const a = ease(clamp((t - tS) / 0.35) * (1 - clamp((t - tJ) / 0.35)));
      dd.place(dd.E, -1, r1(55 * a), 10 * a); dd.place(dd.Dd, 1, r1(55 * a), 10 * a);
    });
    W(8, fS, fS + 0.07, nome, 520, LISTA[nome], 62, INK.green, { anchor: 'end' });
    D(8, fS + 0.075, fS + 0.11, [C.check(580, LISTA[nome] - 18, 30, INK.green)]);
  };
  separa('polegar', P(8, 'Separa', 1), P(8, 'junta', 1));
  separa('mindinho', P(8, 'Separa', 2), P(8, 'junta', 2));
  separa('indicador', P(8, 'Separa', 3), P(8, 'junta', 3));
  rest(8, T(8, 0.98), sc(9).start + 0.05);

  // cena 9: e o anelar?
  const an = dedo.anelar;
  const AY = DEDOS.anelar[2];
  const t3 = WB.group();
  D(9, 0.25, 0.6, [C.circleAround(540, AY, 85, 38, INK.orange)]);
  W(9, 0.55, 0.98, 'e o ANELAR?', 460, 1550, 84, INK.orange, { parent: t3 });
  countdown(sc(9).falaFim, sc(10).start, 800, 1550, t3);
  WB.effect(t => {
    // força, treme, mas não abre
    const on = t > sc(9).falaFim && t < sc(10).start + 1.5;
    const p = on ? r1(4 + 3 * Math.sin(t * 31)) : 0;
    an.place(an.E, -1, p); an.place(an.Dd, 1, p);
    t3.setAttribute('opacity', t < sc(10).start ? 1 : 0);
  });
  rest(9, T(9, 1.0), sc(10).start - 0.1);
  // cena 10: não sai
  const st2 = C.stamp('NÃO SAI!', 540, 1550, { size: 96, color: INK.red, rot: -8 });
  D(10, 0.0, 0.45, [st2.box, st2.text]);
  // cena 11: o tendão que liga o anelar ao do meio (na mão)
  WB.effect(t => gMeio.setAttribute('opacity', t < T(11, P(11, 'tendão') - 0.06) ? 1 : 0));
  const tend = [sp(`M 300 ${DEDOS.MEIO[1] + 10} L 326 ${DEDOS.MEIO[1] - 22} L 292 ${DEDOS.MEIO[1] - 42} L 318 ${DEDOS.anelar[1] - 10}`, INK.red, 11),
    sp(`M ${m(300)} ${DEDOS.MEIO[1] + 10} L ${m(326)} ${DEDOS.MEIO[1] - 22} L ${m(292)} ${DEDOS.MEIO[1] - 42} L ${m(318)} ${DEDOS.anelar[1] - 10}`, INK.red, 11)];
  D(11, P(11, 'tendão') - 0.05, P(11, 'tendão') + 0.12, tend);
  W(11, P(11, 'tendão') + 0.13, P(11, 'meio') + 0.05, 'tendão grudado', 540, 1240, 70, INK.red);
  rest(11, T(11, 0.9), sc(12).start + 0.05);
  // =====================================================================
  // FOLHA 4 — CTA + loop (cena 12)
  // =====================================================================
  page(12, 0);
  W(12, 0.02, 0.14, 'CONSEGUIU', 400, 400, 110, INK.green);
  W(12, 0.1, 0.24, 'ou NÃO?', 700, 520, 96, INK.red);
  W(12, 0.24, 0.32, 'comenta!', 540, 620, 64, INK.gray);
  WB.ctaRedes(12, fr(12, T(12, 0.33)), fr(12, T(12, 0.46)), { y: 640, titulo: 'Me segue!', iconSize: 150 });
  W(12, 0.5, 0.66, 'VOLTA', 540, 1300, 120, INK.orange);
  W(12, 0.68, 1.0, 'e gira o pé de novo', 540, 1420, 80, INK.blue);

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA (fica parada embaixo durante os testes)
  // =====================================================================
  const CTA0 = sc(12).start;
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
    const PARK = [310, 1680], TESTES = [[sc(2).start, sc(4).end], [sc(7).start, sc(10).end]];
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % 3], b = SPOTS[(k + 1) % 3], e = ease(u);
      const w = Math.max(...TESTES.map(([s0, s1]) => clamp((t - s0 + 0.8) / 0.8) * (1 - clamp((t - s1) / 0.8))));
      const x = lerp(lerp(a[0], b[0], e), PARK[0], ease(w)), y = lerp(lerp(a[1], b[1], e), PARK[1], ease(w)) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.3) / 0.4) * (1 - clamp((t - CTA0 + 0.2) / 0.4)) * 0.95).toFixed(3));
    });
  }
};
