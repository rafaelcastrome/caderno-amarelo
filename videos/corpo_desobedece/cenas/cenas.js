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
  // ilustração das mãos (Canva, aprovada pelo Rafael): pontas juntas, dedos do meio dobrados (nós encostando)
  // imagem 944x1300 (recortada acima dos pulsos) escalada 0,7 -> 661x910, em x 210..871, y 430..1340
  const IS = 0.7, IX0 = 540 - 944 * IS / 2, IY0 = 430;
  const ip = (ix, iy) => [r1(IX0 + ix * IS), r1(IY0 + iy * IS)];
  const gMaos = WB.group();
  WB.mk('image', { href: window.MAOS_PNG, x: r1(IX0), y: IY0, width: r1(944 * IS), height: r1(1300 * IS) }, gMaos);
  gMaos.setAttribute('opacity', 0);
  WB.fade(7, fr(7, T(7, 0.03)), fr(7, T(7, 0.2)), gMaos, 0, 1);
  const [PX, PY] = ip(472, 175), [MX, MY] = ip(472, 745), [TX, TY] = ip(472, 1090);
  // rótulos com setas
  W(7, 0.2, 0.32, 'pontas', 900, PY - 20, 54, INK.gray);
  W(7, 0.32, 0.42, 'juntas', 900, PY + 40, 54, INK.gray);
  D(7, 0.42, 0.48, [C.arrow(840, PY + 60, 600, PY + 20, INK.gray, 6)]);
  W(7, P(7, 'dobra'), P(7, 'dobra') + 0.12, 'MEIO', 130, MY - 30, 64, INK.red);
  W(7, P(7, 'dobra') + 0.12, P(7, 'encostando'), 'dobrado', 130, MY + 40, 54, INK.red);
  D(7, P(7, 'encostando'), P(7, 'encostando') + 0.08, [C.arrow(210, MY + 10, MX - 60, MY, INK.red, 7)]);
  rest(7, T(7, 1.0), sc(8).start - 0.1);

  // cena 8: separa e junta (polegar, mindinho, indicador): setas que abrem e lista com ✓
  const LISTA = { polegar: 1420, mindinho: 1480, indicador: 1540 };
  const abre = (y, tS, tJ) => {
    const g = WB.group(WB.overlay);
    const a1 = WB.group(g), a2 = WB.group(g);
    WB.showNow([sp(`M 0 0 L 70 0`, INK.green, 9, a1), sp(WB.arrowHead(70, 0, 0, 26), INK.green, 9, a1),
      sp(`M 0 0 L -70 0`, INK.green, 9, a2), sp(WB.arrowHead(-70, 0, Math.PI, 26), INK.green, 9, a2)]);
    WB.effect(t => {
      const a = ease(clamp((t - tS) / 0.3) * (1 - clamp((t - tJ) / 0.3)));
      g.setAttribute('opacity', a.toFixed(3));
      a1.setAttribute('transform', `translate(${r1(560 + 40 * a)} ${y})`);
      a2.setAttribute('transform', `translate(${r1(520 - 40 * a)} ${y})`);
    });
  };
  const separa = (nome, y, fS, fJ) => {
    abre(y, T(8, fS), T(8, fJ));
    W(8, fS, fS + 0.07, nome, 420, LISTA[nome], 62, INK.green, { anchor: 'end' });
    D(8, fS + 0.075, fS + 0.11, [C.check(470, LISTA[nome] - 18, 30, INK.green)]);
  };
  separa('polegar', TY, P(8, 'Separa', 1), P(8, 'junta', 1));
  separa('mindinho', PY + 40, P(8, 'Separa', 2), P(8, 'junta', 2));
  separa('indicador', PY + 100, P(8, 'Separa', 3), P(8, 'junta', 3));
  rest(8, T(8, 0.98), sc(9).start + 0.05);

  // cena 9: e o anelar?
  const t3 = WB.group();
  D(9, 0.25, 0.6, [C.circleAround(540, PY + 60, 95, 110, INK.orange)]);
  W(9, 0.55, 0.98, 'e o ANELAR?', 760, 1450, 72, INK.orange, { parent: t3 });
  countdown(sc(9).falaFim, sc(10).start, 760, 1560, t3);
  // força: a imagem treme um pouco, mas as pontas não abrem
  WB.effect(t => {
    const on = t > sc(9).falaFim && t < sc(10).start + 1.2;
    const dx = on ? r1(3 * Math.sin(t * 37)) : 0;
    gMaos.setAttribute('transform', `translate(${dx} 0)`);
    t3.setAttribute('opacity', t < sc(10).start ? 1 : 0);
  });
  rest(9, T(9, 1.0), sc(10).start - 0.1);
  // cena 10: não sai
  const st2 = C.stamp('NÃO SAI!', 760, 1490, { size: 84, color: INK.red, rot: -8 });
  D(10, 0.0, 0.45, [st2.box, st2.text]);
  // cena 11: o tendão que prende o anelar ao do meio
  const [Z0x, Z0y] = ip(395, 700), [Z1x, Z1y] = ip(415, 420);
  const zz = (x0, y0, x1, y1) => `M ${x0} ${y0} L ${r1(x0 + 18)} ${r1(lerp(y0, y1, 0.3))} L ${r1(x0 - 14)} ${r1(lerp(y0, y1, 0.55))} L ${r1(x1 + 14)} ${r1(lerp(y0, y1, 0.8))} L ${x1} ${y1}`;
  const tend = [sp(zz(Z0x, Z0y, Z1x, Z1y), INK.red, 11), sp(zz(r1(1080 - Z0x), Z0y, r1(1080 - Z1x), Z1y), INK.red, 11)];
  D(11, P(11, 'tendão') - 0.05, P(11, 'tendão') + 0.12, tend);
  W(11, P(11, 'tendão') + 0.13, P(11, 'tendão') + 0.25, 'tendão', 920, 790, 60, INK.red);
  W(11, P(11, 'tendão') + 0.25, P(11, 'meio') + 0.05, 'grudado', 920, 850, 60, INK.red);
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
