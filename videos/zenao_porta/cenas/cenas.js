// "Tu nunca devia chegar na porta" (paradoxo da dicotomia de Zenão), ~88 s, narração Antonio (gravada no PC do Rafael).
// Corredor de 10 m: o boneco anda a metade, a metade do resto... sempre sobra um pedaço. Pausa "pensa aí 3, 2, 1",
// depois a soma 5 + 2,5 + 1,25 + ... = 10 e o tempo que também encolhe. Fim "como é que tu chegou no fim desse vídeo?"
// emenda no começo ("Tu nunca devia conseguir chegar até aquela porta").
// A marca d'água @cardeno_amarelo passeia entre 3 pontos seguros.
window.CENAS = function (WB) {
  const { INK, C, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const T = (c, t) => S[c - 1].start + t;                       // tempo local (Whisper da cena) -> global
  const fr = (c, t) => t / (S[c - 1].end - S[c - 1].start);
  const D = (c, t0, t1, st) => WB.draw(c, fr(c, t0), fr(c, t1), st);
  const W = (c, t0, t1, txt, x, y, size, cor, o = {}) => WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o });
  const rest = (c, t0, t1) => WB.restHand(c, fr(c, t0), fr(c, t1));
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 7, parent) => WB.strokePath(d, cor, w, parent);
  const fill = (tag, attrs, parent) => WB.mk(tag, { 'fill-opacity': 0, stroke: 'none', ...attrs }, parent);

  // =====================================================================
  // FOLHA 1 — o corredor (cenas 1 a 3)
  // =====================================================================
  const FY = 1100, X0 = 120, XP = 960, PX = (XP - X0) / 10;     // 84 px por metro
  const pg1 = WB.group();
  const hook = WB.group(pg1);
  W(1, 0.2, 1.6, 'TU NUNCA VAI', 540, 330, 100, INK.black, { parent: hook });
  W(1, 1.6, 2.6, 'CHEGAR NA PORTA', 540, 450, 100, INK.red, { parent: hook });
  // chão e porta
  D(1, 2.6, 2.95, [sp(`M 70 ${FY} L 1040 ${FY}`, INK.black, 7, pg1)]);
  const portaF = fill('rect', { x: XP, y: FY - 330, width: 80, height: 330, fill: '#c98b4a' }, pg1);
  const porta = [sp(WB.roughRect(XP, FY - 330, XP + 80, FY), INK.black, 7, pg1)];
  D(1, 2.95, 3.3, porta); WB.fillAfter(portaF, porta, 0.15);
  const mac = fill('circle', { cx: XP + 18, cy: FY - 160, r: 9, fill: INK.black }, pg1);
  WB.fillAfter(mac, porta, 0.2);
  // boneco (anda de verdade pelo corredor)
  const man = WB.group(pg1);
  const manS = [sp(WB.circlePath(0, FY - 250, 34), INK.black, 6, man),
    sp(`M 0 ${FY - 216} L 0 ${FY - 110} M 0 ${FY - 190} L -38 ${FY - 140} M 0 ${FY - 190} L 38 ${FY - 140}`, INK.black, 6, man),
    sp(`M 0 ${FY - 110} L -30 ${FY - 2} M 0 ${FY - 110} L 30 ${FY - 2}`, INK.black, 6, man)];
  D(1, 3.3, 3.75, manS);
  W(1, 3.5, 4.0, 'NUNCA!', 540, 1330, 110, INK.red, { parent: hook });
  W(1, 4.6, 5.8, 'um GREGO provou', 540, 1470, 76, INK.blue, { parent: hook });
  W(1, 6.0, 7.4, 'há 2.500 anos', 540, 1580, 76, INK.gray, { parent: hook });
  // passos: [t0 global, t1 global, x do boneco]
  const PASSOS = [[T(2, 5.0), T(2, 7.1), X0 + 5 * PX], [T(3, 2.6), T(3, 3.7), X0 + 7.5 * PX],
    [T(3, 5.3), T(3, 6.3), X0 + 8.75 * PX], [T(3, 8.2), T(3, 9.4), X0 + 9.375 * PX]];
  WB.effect(t => {
    let x = X0, bob = 0, prev = X0;
    for (const [a, b, xx] of PASSOS) {
      if (t >= b) { x = xx; prev = xx; continue; }
      if (t > a) { const u = (t - a) / (b - a); x = lerp(prev, xx, ease(u)); bob = -Math.abs(Math.sin(u * Math.PI * 4)) * 10; }
      break;
    }
    man.setAttribute('transform', `translate(${r1(x)} ${r1(bob)})`);
  });
  // cena 2: os textos do gancho saem
  WB.effect(t => hook.setAttribute('opacity', (1 - clamp((t - T(2, 0.05)) / 0.35)).toFixed(3)));
  W(2, 0.3, 1.4, 'olha só', 540, 380, 80, INK.gray);
  D(2, 1.9, 2.4, C.arrow(X0, FY + 70, XP, FY + 70, INK.black, 5));
  D(2, 2.0, 2.4, C.arrow(XP, FY + 70, X0, FY + 70, INK.black, 5));
  W(2, 2.45, 3.1, '10 m', 540, FY + 150, 80, INK.black);
  const seg = (x0, x1, cor) => [sp(`M ${x0} ${FY - 6} L ${x1} ${FY - 6}`, cor, 16)];
  const tick = x => [sp(`M ${x} ${FY - 40} L ${x} ${FY + 25}`, INK.black, 6)];
  D(2, 5.2, 5.5, tick(X0 + 5 * PX));
  W(2, 5.5, 6.2, 'METADE', 540, 560, 100, INK.green);
  D(2, 6.2, 7.1, seg(X0, X0 + 5 * PX, INK.green));
  W(2, 7.2, 7.85, '5 m', X0 + 2.5 * PX, 770, 64, INK.green);

  // cena 3: metade do que sobrou...
  W(3, 0.3, 2.0, 'metade do que sobrou', 540, 680, 72, INK.gray);
  D(3, 2.6, 2.85, tick(X0 + 7.5 * PX)); D(3, 2.85, 3.6, seg(X0 + 5 * PX, X0 + 7.5 * PX, INK.blue));
  W(3, 3.0, 3.9, '2,5 m', X0 + 6.25 * PX, 770, 56, INK.blue);
  D(3, 5.0, 5.2, tick(X0 + 8.75 * PX)); D(3, 5.2, 6.0, seg(X0 + 7.5 * PX, X0 + 8.75 * PX, INK.orange));
  W(3, 5.5, 6.3, '1,25 m', 800, 1330, 56, INK.orange);
  D(3, 6.3, 6.5, [sp(`M 800 1290 L ${X0 + 8.1 * PX} ${FY + 15}`, INK.orange, 4)]);
  D(3, 7.9, 8.1, tick(X0 + 9.375 * PX)); D(3, 8.1, 8.8, seg(X0 + 8.75 * PX, X0 + 9.375 * PX, INK.purple));
  W(3, 8.4, 9.5, '62 cm', 860, 1460, 56, INK.purple);
  D(3, 9.5, 9.7, [sp(`M 880 1420 L ${X0 + 9.05 * PX} ${FY + 15}`, INK.purple, 4)]);
  rest(3, 9.7, 10.4);

  // =====================================================================
  // FOLHA 2 — sempre sobra um pedacinho (cenas 4 e 5)
  // =====================================================================
  WB.newPage(4, 0, 0.04);
  W(4, 0.2, 2.0, 'sempre sobra um PEDACINHO', 540, 360, 84, INK.black);
  // régua grande: corta no meio, de novo, de novo...
  const RY = 820, RX0 = 110, RX1 = 970;
  D(4, 2.1, 2.6, [sp(`M ${RX0} ${RY} L ${RX1} ${RY}`, INK.black, 10)]);
  D(4, 2.1, 2.6, [sp(`M ${RX0} ${RY - 40} L ${RX0} ${RY + 40} M ${RX1} ${RY - 40} L ${RX1} ${RY + 40}`, INK.black, 8)]);
  let a = RX0, b = RX1;
  const CORTES = [4.6, 5.3, 6.4, 7.8, 8.4, 8.7];
  CORTES.forEach((tc, i) => {
    const m = (a + b) / 2;
    D(4, tc, tc + 0.18, [sp(`M ${r1(m)} ${RY - 34} L ${r1(m)} ${RY + 34}`, [INK.red, INK.blue, INK.orange, INK.purple, INK.green, INK.red][i], 6)]);
    a = m;
  });
  W(4, 4.6, 5.3, '÷2', 540, 960, 70, INK.red);
  W(4, 6.2, 6.85, '÷2', 755, 1060, 64, INK.blue);
  W(4, 7.6, 8.35, '÷2', 870, 960, 60, INK.orange);
  // lupa em cima do pedacinho que sobra
  const LX = 930, LY = RY;
  D(4, 3.0, 3.6, [sp(WB.circlePath(LX, LY, 70), INK.black, 7), sp(`M ${LX - 50} ${LY + 50} L ${LX - 120} ${LY + 140}`, INK.black, 14)]);
  // cena 5
  W(5, 0.2, 1.75, 'INFINITOS pedaços', 540, 1290, 100, INK.purple);
  W(5, 2.6, 4.7, 'como tu chega na porta?', 540, 1430, 72, INK.black);
  W(5, 4.4, 4.9, '?', 540, 1640, 180, INK.red);

  // =====================================================================
  // FOLHA 3 — pensa aí (cena 6)
  // =====================================================================
  WB.newPage(6, 0, 0.04);
  W(6, 0.2, 2.1, 'PENSA AÍ...', 540, 500, 120, INK.purple);
  W(6, 2.55, 2.85, '3', 300, 1000, 260, INK.gray);
  W(6, 3.05, 3.4, '2', 540, 1000, 260, INK.gray);
  W(6, 3.65, 4.0, '1', 780, 1000, 260, INK.gray);
  rest(6, 4.05, 5.1);

  // =====================================================================
  // FOLHA 4 — a soma (cena 7)
  // =====================================================================
  WB.newPage(7, 0, 0.04);
  W(7, 0.2, 2.0, 'o segredo: SOMA TUDO', 540, 340, 84, INK.black);
  W(7, 2.5, 3.0, '5', 540, 520, 90, INK.green);
  W(7, 3.0, 4.1, '+ 2,5', 540, 630, 90, INK.blue);
  W(7, 4.1, 5.5, '+ 1,25', 540, 740, 90, INK.orange);
  W(7, 5.5, 5.9, '+ ...', 540, 850, 90, INK.gray);
  // barra de 10 m que vai enchendo e nunca passa
  const BY = 1060, BX0 = 140, BX1 = 940, BW = BX1 - BX0;
  D(7, 5.9, 6.4, [sp(WB.roughRect(BX0, BY, BX1, BY + 110), INK.black, 7)]);
  W(7, 6.4, 6.9, '10', BX1, BY + 200, 64, INK.black);
  W(7, 6.4, 6.6, '0', BX0, BY + 200, 64, INK.black);
  const CORES = [INK.green, INK.blue, INK.orange, INK.purple, INK.red, INK.green, INK.blue, INK.orange];
  let acc = 0;
  CORES.forEach((cor, i) => {
    const w = BW / Math.pow(2, i + 1);
    const r = fill('rect', { x: r1(BX0 + acc), y: BY + 6, width: r1(Math.max(w - 2, 1)), height: 98, fill: cor });
    const tf = T(7, 6.5 + i * 0.35);
    WB.effect(t => r.setAttribute('fill-opacity', clamp((t - tf) / 0.25) * 0.75));
    acc += w;
  });
  W(7, 7.6, 9.3, 'nunca passa de 10', 540, 1400, 76, INK.red);
  W(7, 9.6, 11.4, '= 10 m', 540, 1580, 150, INK.green);

  // =====================================================================
  // FOLHA 5 — o tempo também encolhe (cena 8)
  // =====================================================================
  WB.newPage(8, 0, 0.04);
  W(8, 0.2, 2.0, 'pedaço menor...', 540, 360, 84, INK.black);
  W(8, 2.0, 3.3, '...tempo menor', 540, 470, 84, INK.blue);
  const ROWS = [['5 m', '5 s', 650], ['2,5 m', '2,5 s', 770], ['1,25 m', '1,25 s', 890], ['...', '...', 990]];
  ROWS.forEach(([m, s, y], i) => {
    const t0 = 1.0 + i * 0.6;
    W(8, t0, t0 + 0.3, m, 330, y, 72, INK.gray);
    if (i < 3) D(8, t0 + 0.3, t0 + 0.45, C.arrow(450, y - 22, 610, y - 22, INK.black, 5));
    W(8, t0 + 0.45, t0 + 0.6, s, 750, y, 72, INK.blue);
  });
  W(8, 3.8, 6.8, 'infinitos pedaços cabem em', 540, 1200, 64, INK.gray);
  W(8, 7.2, 8.8, '10 SEGUNDOS', 540, 1360, 120, INK.green);
  W(8, 8.8, 9.2, '(andando a 1 m/s)', 540, 1470, 48, INK.gray);

  // =====================================================================
  // FOLHA 6 — Zenão (cena 9)
  // =====================================================================
  WB.newPage(9, 0, 0.04);
  W(9, 0.3, 2.2, 'ZENÃO DE ELEIA', 540, 360, 96, INK.purple);
  W(9, 2.0, 2.5, 'Grécia, séc. V a.C.', 540, 460, 56, INK.gray);
  // coluna grega
  const col = [sp(`M 380 560 L 700 560 L 680 610 L 400 610 Z`, INK.black, 6),
    sp(`M 420 610 L 420 1060 M 660 610 L 660 1060 M 480 620 L 480 1050 M 540 620 L 540 1050 M 600 620 L 600 1050`, INK.black, 6),
    sp(`M 380 1110 L 700 1110 L 680 1060 L 400 1060 Z`, INK.black, 6)];
  D(9, 0.6, 2.0, col);
  W(9, 2.6, 4.0, 'inventou o ENIGMA', 540, 1240, 76, INK.black);
  W(9, 4.5, 5.2, 'movimento =', 540, 1380, 80, INK.gray);
  W(9, 5.6, 6.6, 'ILUSÃO?', 540, 1520, 130, INK.red);

  // =====================================================================
  // FOLHA 7 — CTA + loop (cena 10)
  // =====================================================================
  WB.newPage(10, 0, 0.04);
  W(10, 0.2, 1.1, 'COMENTA:', 540, 320, 90, INK.black);
  W(10, 1.2, 1.9, 'Zenão tava', 540, 430, 72, INK.gray);
  W(10, 1.9, 2.3, 'CERTO', 340, 560, 100, INK.green);
  W(10, 2.3, 2.6, 'ou', 540, 560, 64, INK.gray);
  W(10, 2.6, 3.1, 'ERRADO?', 760, 560, 100, INK.red);
  WB.ctaRedes(10, fr(10, 3.1), fr(10, 3.9), { y: 640, titulo: '', iconSize: 140 });
  W(10, 4.3, 6.1, 'se é impossível chegar no fim...', 540, 1150, 60, INK.gray);
  W(10, 6.3, 8.0, 'como tu chegou no FIM', 540, 1290, 84, INK.purple);
  W(10, 8.0, 8.6, 'desse vídeo?', 540, 1410, 84, INK.purple);
  rest(10, 8.7, 9.8);

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA
  // =====================================================================
  const CTA0 = S[9].start;
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[770, 1810], [270, 200], [310, 1810], [800, 200]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % 4], b = SPOTS[(k + 1) % 4], e = ease(u);
      const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.3) / 0.4) * (1 - clamp((t - CTA0 + 0.2) / 0.4)) * 0.95).toFixed(3));
    });
  }
};
