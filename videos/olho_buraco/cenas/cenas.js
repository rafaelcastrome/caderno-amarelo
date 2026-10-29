// "Teu olho tem um buraco" (ponto cego), ~60 s, narração Antonio (edge-tts).
// Teste 1: olho esquerdo fechado, encara o X e aproxima o celular; a bolinha some (~16-18 cm).
// Teste 2: linha azul com um pedaço faltando; no ponto cego o cérebro "emenda" a linha.
// Fim "Volta... fecha o outro olho e olha pra bolinha" emenda no começo ("Tem um buraco no teu olho").
// Os tempos são frações da FALA de cada cena (timeline.json -> falaFim), então se ajustam a qualquer take.
// A marca d'água @cardeno_amarelo passeia, mas fica parada embaixo durante os dois testes.
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

  // geometria do teste (ver roteiro.md): X e alvo na mesma altura, 660 px de distância
  const XX = 210, XD = 870, YT = 760;

  // contagem regressiva (números prontos, só troca a opacidade)
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
  function bigX(parent) {
    return [sp(WB.roughLine(XX - 48, YT - 48, XX + 48, YT + 48, 1.5), INK.black, 16, parent),
      sp(WB.roughLine(XX + 48, YT - 48, XX - 48, YT + 48, 1.5), INK.black, 16, parent)];
  }

  // =====================================================================
  // FOLHA 1 — gancho (cena 1)
  // =====================================================================
  W(1, 0.0, 0.32, 'BURACO', 540, 430, 140, INK.red);
  W(1, 0.32, 0.5, 'no teu olho?', 540, 560, 84, INK.black);
  const EY = 900;
  const eye = [sp(`M 250 ${EY} Q 540 ${EY - 260} 830 ${EY} Q 540 ${EY + 260} 250 ${EY}`, INK.black, 9),
    sp(WB.circlePath(540, EY, 105), INK.blue, 8)];
  const pup = fill('circle', { cx: 540, cy: EY, r: 46, fill: INK.black });
  D(1, 0.05, 0.4, eye); WB.fillAfter(pup, eye, 0.15);
  // o "furo": um círculo tracejado com interrogação
  const hole = [sp(WB.circlePath(640, EY - 40, 34), INK.red, 6)];
  D(1, 0.5, 0.62, hole);
  D(1, 0.62, 0.72, C.curvedArrow(820, EY - 220, 760, EY - 140, 680, EY - 70, INK.red, 6));
  W(1, 0.62, 0.72, '?', 860, EY - 230, 90, INK.red);
  W(1, 0.66, 0.9, 'vou te provar', 540, 1250, 80, INK.gray);

  // =====================================================================
  // FOLHA 2 — teste 1 (cenas 2, 3, 4)
  // =====================================================================
  page(2, 0);
  const t1 = WB.group();
  W(2, 0.04, 0.3, 'fecha o olho', 540, 380, 76, INK.black, { parent: t1 });
  W(2, 0.12, 0.34, 'ESQUERDO', 540, 490, 100, INK.red, { parent: t1 });
  const xs1 = bigX(); D(2, 0.55, 0.68, xs1);
  const dot1G = WB.group();
  const dot1F = fill('circle', { cx: XD, cy: YT, r: 45, fill: INK.red }, dot1G);
  const dot1O = [sp(WB.circlePath(XD, YT, 40), INK.red, 9, dot1G)];
  D(2, 0.4, 0.5, dot1O); WB.fillAfter(dot1F, dot1O, 0.1);
  W(2, 0.72, 0.96, 'olha só pro X', 360, 1000, 76, INK.blue, { parent: t1 });
  D(2, 0.8, 0.96, C.arrow(250, 930, 225, 830, INK.blue, 7));
  // cena 3: aproxima devagar (mão fora, contagem até o "Sumiu!")
  W(3, 0.0, 0.3, 'aproxima', 540, 1200, 88, INK.orange, { parent: t1 });
  W(3, 0.18, 0.42, 'DEVAGAR...', 540, 1310, 88, INK.orange, { parent: t1 });
  rest(3, T(3, 0.45), sc(4).start - 0.1);
  countdown(T(3, 0.5), sc(4).start, 540, 1480, t1);
  // cena 4: sumiu
  WB.effect(t => t1.setAttribute('opacity', t < sc(4).start ? 1 : 0));
  W(4, 0.0, 0.3, 'SUMIU!', 540, 1250, 130, INK.red);

  // =====================================================================
  // FOLHA 3 — por quê (cenas 5 e 6)
  // =====================================================================
  page(5, 0);
  W(5, 0.02, 0.24, 'PONTO CEGO', 540, 370, 110, INK.blue);
  // corte do olho: globo, cristalino na frente, retina no fundo, nervo saindo
  const OC = 520, OY = 790, OR = 230;
  const globe = [sp(WB.arcPath(OC, OY, OR, OR, 0.42, 2 * Math.PI - 0.42), INK.black, 8)];
  const lens = [sp(`M ${OC - OR + 10} ${OY - 85} Q ${OC - OR - 50} ${OY} ${OC - OR + 10} ${OY + 85} Q ${OC - OR + 50} ${OY} ${OC - OR + 10} ${OY - 85}`, INK.blue, 7)];
  const retina = [sp(WB.arcPath(OC, OY, OR - 22, OR - 22, -1.25, 1.25), INK.red, 6)];
  const ny0 = OY - OR * Math.sin(0.42), ny1 = OY + OR * Math.sin(0.42), nx = OC + OR * Math.cos(0.42);
  const nerve = [sp(`M ${r1(nx)} ${r1(ny0)} Q ${r1(nx + 120)} ${r1(ny0 + 10)} 930 ${r1(ny0 + 30)}`, INK.black, 8),
    sp(`M ${r1(nx)} ${r1(ny1)} Q ${r1(nx + 120)} ${r1(ny1 - 10)} 930 ${r1(ny1 - 30)}`, INK.black, 8)];
  D(5, 0.22, 0.4, globe); D(5, 0.4, 0.46, lens); D(5, 0.46, 0.56, retina); D(5, 0.56, 0.68, nerve);
  W(5, 0.58, 0.68, 'nervo', 830, OY - 130, 60, INK.gray);
  D(5, 0.72, 0.84, [C.circleAround(OC + OR - 22, OY, 55, 95, INK.orange, 8)]);
  W(5, 0.8, 1.0, 'zero células de ver', 540, 1150, 72, INK.orange);
  W(6, 0.24, 0.5, 'o cérebro TAPA', 540, 1300, 92, INK.purple);
  page(6, 0.72);
  W(6, 0.78, 1.0, 'FASE 2', 540, 380, 120, INK.orange);

  // =====================================================================
  // FOLHA 4 — teste 2: a linha que emenda (cenas 7 e 8)
  // =====================================================================
  const t2 = WB.group();
  const xs2 = bigX(); D(7, 0.12, 0.24, xs2);
  // linha azul grossa com um pedaço faltando bem no ponto do alvo
  const GAP0 = XD - 58, GAP1 = XD + 58;
  const lineL = [sp(`M 300 ${YT} L ${GAP0} ${YT}`, INK.blue, 30)];
  const lineR = [sp(`M ${GAP1} ${YT} L 990 ${YT}`, INK.blue, 30)];
  D(7, 0.26, 0.42, lineL); D(7, 0.42, 0.5, lineR);
  W(7, 0.0, 0.14, 'olho esquerdo fechado', 540, 520, 64, INK.gray, { parent: t2 });
  W(7, 0.55, 0.75, 'vem chegando...', 540, 1220, 84, INK.orange, { parent: t2 });
  rest(7, T(7, 0.78), sc(8).start - 0.1);
  countdown(T(7, 0.8), sc(8).start, 540, 1420, t2);
  WB.effect(t => t2.setAttribute('opacity', t < sc(8).start ? 1 : 0));
  W(8, 0.0, 0.25, 'EMENDOU!', 540, 1200, 120, INK.green);
  W(8, 0.55, 0.9, 'pintou o que NÃO EXISTE', 540, 1340, 72, INK.purple);

  // =====================================================================
  // FOLHA 5 — uau + Mariotte (cenas 9 e 10)
  // =====================================================================
  page(9, 0);
  W(9, 0.04, 0.45, 'um pedaço do que', 540, 400, 80, INK.black);
  W(9, 0.25, 0.6, 'tu vê AGORA...', 540, 510, 80, INK.black);
  W(9, 0.66, 0.95, 'é INVENTADO', 540, 650, 118, INK.red);
  // coroa
  const CY0 = 1000;
  const crown = [sp(`M 400 ${CY0 + 90} L 380 ${CY0 - 40} L 460 ${CY0 + 20} L 540 ${CY0 - 80} L 620 ${CY0 + 20} L 700 ${CY0 - 40} L 680 ${CY0 + 90} Z`, INK.orange, 8)];
  const crownF = fill('path', { d: `M 400 ${CY0 + 90} L 380 ${CY0 - 40} L 460 ${CY0 + 20} L 540 ${CY0 - 80} L 620 ${CY0 + 20} L 700 ${CY0 - 40} L 680 ${CY0 + 90} Z`, fill: '#ffdf00' });
  D(10, 0.0, 0.14, crown); WB.fillAfter(crownF, crown, 0.2);
  W(10, 0.12, 0.3, 'Mariotte', 540, 1240, 100, INK.blue);
  W(10, 0.4, 0.64, '+350 anos', 540, 1360, 80, INK.gray);
  W(10, 0.72, 1.0, 'corte do rei: de boca aberta', 540, 1470, 62, INK.purple);

  // =====================================================================
  // FOLHA 6 — CTA + loop (cena 11)
  // =====================================================================
  page(11, 0);
  W(11, 0.02, 0.14, 'SUMIU', 330, 400, 110, INK.red);
  W(11, 0.1, 0.24, 'ou NÃO SUMIU?', 640, 520, 88, INK.black);
  W(11, 0.24, 0.32, 'comenta!', 540, 620, 64, INK.gray);
  WB.ctaRedes(11, fr(11, T(11, 0.33)), fr(11, T(11, 0.48)), { y: 640, titulo: 'Me segue!', iconSize: 150 });
  W(11, 0.5, 0.68, 'VOLTA', 540, 1300, 120, INK.orange);
  W(11, 0.7, 1.0, 'com o OUTRO olho', 540, 1420, 84, INK.red);

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
    const PARK = [310, 1680], TESTES = [[sc(2).start, sc(4).end], [sc(7).start, sc(8).end]];
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % 3], b = SPOTS[(k + 1) % 3], e = ease(u);
      // nos testes ela fica parada embaixo, longe do X e da bolinha
      const w = Math.max(...TESTES.map(([s0, s1]) => clamp((t - s0 + 0.8) / 0.8) * (1 - clamp((t - s1) / 0.8))));
      const x = lerp(lerp(a[0], b[0], e), PARK[0], ease(w)), y = lerp(lerp(a[1], b[1], e), PARK[1], ease(w)) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.3) / 0.4) * (1 - clamp((t - CTA0 + 0.2) / 0.4)) * 0.95).toFixed(3));
    });
  }
};
