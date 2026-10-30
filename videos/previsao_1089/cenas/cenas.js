// "Teu resultado já tá no envelope", ~51 s, narração Gemini Charon (tomada única cortada nos silêncios).
// Truque do 1089: número de 3 algarismos com o 1º bem maior que o último; maior − invertido; soma com o
// invertido do resultado = 1089 sempre. O envelope com a previsão está na tela desde o quadro 0
// (camada fixa), encolhe pro canto durante as contas e volta pra abrir no fim.
// Fim "volta e tenta com outro número" emenda no começo.
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
  // fração da fala onde começa o trecho (n-ésima ocorrência); use trechos longos o bastante pra não achar dentro de outra palavra
  const P = (c, trecho, n = 1) => {
    const txt = WB.projeto.cenas[c - 1].fala; let i = -1;
    for (let k = 0; k < n; k++) i = txt.indexOf(trecho, i + 1);
    if (i < 0) throw new Error(`"${trecho}" não está na fala ${c}`);
    return i / txt.length;
  };
  const textNow = (str, x, y, size, cor, parent, anchor = 'middle') =>
    WB.showNow(WB.textStrokes(str, x, y, size, cor, parent, anchor).strokes);

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

  // =====================================================================
  // ENVELOPE (camada fixa, desenho pronto). Origem no centro do envelope.
  // =====================================================================
  const EW = 520, EH = 330;
  const env = WB.group(WB.overlay);
  WB.mk('rect', { x: -EW / 2 + 10, y: -EH / 2 + 14, width: EW, height: EH, rx: 14, fill: '#1f1f24', opacity: 0.13 }, env);
  WB.mk('rect', { x: -EW / 2, y: -EH / 2, width: EW, height: EH, rx: 14, fill: '#e9d3a4', stroke: INK.black, 'stroke-width': 7 }, env);
  // frente do envelope (bolso em V) cobre o cartão
  const frente = `M ${-EW / 2} ${-EH / 2 + 20} L 0 ${EH / 2 - 120} L ${EW / 2} ${-EH / 2 + 20} L ${EW / 2} ${EH / 2 - 14} Q ${EW / 2} ${EH / 2} ${EW / 2 - 14} ${EH / 2} L ${-EW / 2 + 14} ${EH / 2} Q ${-EW / 2} ${EH / 2} ${-EW / 2} ${EH / 2 - 14} Z`;
  WB.mk('path', { d: frente, fill: '#f3e2bd', stroke: INK.black, 'stroke-width': 6, 'stroke-linejoin': 'round' }, env);
  textNow('NÃO ABRE!', 0, EH / 2 - 40, 62, INK.red, env);
  // aba de cima (gira em torno da borda de cima) + lacre
  const aba = WB.group(env);
  WB.mk('path', { d: `M ${-EW / 2} ${-EH / 2 + 4} L 0 ${EH / 2 - 150} L ${EW / 2} ${-EH / 2 + 4} Z`, fill: '#dcc28c', stroke: INK.black, 'stroke-width': 6, 'stroke-linejoin': 'round' }, aba);
  const lacre = WB.group(aba);
  WB.mk('circle', { cx: 0, cy: EH / 2 - 150, r: 44, fill: INK.red, stroke: '#8f1414', 'stroke-width': 5 }, lacre);
  textNow('?', 0, EH / 2 - 132, 64, '#fffdf6', lacre);

  // cartão da previsão: fica escondido (nada vaza pela fenda do V) e salta de dentro quando a aba abre
  const card = WB.group(env);
  WB.mk('rect', { x: -EW / 2 + 40, y: -EH / 2 + 20, width: EW - 80, height: EH - 40, rx: 10, fill: '#fffdf6', stroke: INK.black, 'stroke-width': 5 }, card);
  textNow('1089', 0, 52, 170, INK.red, card);
  // posição/escala do envelope ao longo do vídeo
  const ABRE = sc(6).start + 0.6, ABRE2 = ABRE + 0.5, SOBE = sc(7).start - 0.35;
  const POS = [
    [0, 540, 870, 1.25],
    [sc(1).end - 0.1, 540, 870, 1.25],
    [sc(1).end + 0.5, 875, 300, 0.42],           // canto durante as contas
    [sc(6).start, 875, 300, 0.42],
    [sc(6).start + 0.55, 540, 1060, 1.3],        // volta pro meio pra abrir
    [sc(8).start, 540, 1060, 1.3],
  ];
  WB.effect(t => {
    let k = 0; while (k < POS.length - 1 && t >= POS[k + 1][0]) k++;
    const a = POS[k], b = POS[Math.min(k + 1, POS.length - 1)];
    const u = b === a ? 0 : ease(clamp((t - a[0]) / Math.max(1e-6, b[0] - a[0])));
    const x = lerp(a[1], b[1], u), y = lerp(a[2], b[2], u), s = lerp(a[3], b[3], u);
    const treme = (t > sc(5).end - 0.2 && t < ABRE) ? Math.sin(t * 40) * 3 : 0;
    env.setAttribute('transform', `translate(${r1(x + treme)} ${r1(y)}) scale(${s.toFixed(3)}) rotate(${r1(Math.sin(t * 1.1) * 1.5)})`);
    // aba abre (escala vertical 1 -> -1 em volta da borda de cima)
    const ab = ease(clamp((t - ABRE) / (ABRE2 - ABRE)));
    aba.setAttribute('transform', `translate(0 ${-EH / 2 + 4}) scale(1 ${(1 - 2 * ab).toFixed(3)}) translate(0 ${EH / 2 - 4})`);
    lacre.setAttribute('opacity', (1 - clamp((t - ABRE) / 0.2)).toFixed(3));
    // cartão sobe e cresce
    const cu = ease(clamp((t - SOBE) / 0.45));
    card.setAttribute('transform', `translate(0 ${r1(-300 * cu)}) scale(${(0.6 + 0.65 * cu).toFixed(3)})`);
    card.setAttribute('opacity', t < SOBE ? 0 : 1);
    env.setAttribute('opacity', t < sc(8).start - 0.3 ? 1 : (1 - clamp((t - sc(8).start + 0.3) / 0.3)).toFixed(3));
  });

  // =====================================================================
  // FOLHA 1 — gancho (cena 1): já está na tela no quadro 0
  // =====================================================================
  textNow('EU JÁ SEI', 540, 330, 120, INK.red, WB.layer);
  textNow('o teu resultado', 540, 450, 96, INK.black, WB.layer);
  // calculadora desenhada
  const CX = 540, CY = 1400;
  const calc = [sp(WB.roundRectPath(CX - 340, CY - 120, 200, 280, 24), INK.black, 8),
    sp(WB.roughRect(CX - 315, CY - 95, CX - 165, CY - 35), INK.black, 6)];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
    calc.push(sp(WB.circlePath(CX - 300 + j * 50, CY + 5 + i * 50, 13), INK.gray, 5));
  D(1, P(1, 'calculadora') - 0.03, P(1, 'celular') + 0.06, calc);
  W(1, P(1, 'celular') + 0.07, P(1, 'Eu já') + 0.02, 'calculadora', 640, 1395, 76, INK.blue);
  W(1, P(1, 'Eu já'), P(1, 'resultado') + 0.05, 'aberta!', 640, 1480, 64, INK.gray);
  rest(1, T(1, P(1, 'resultado') + 0.08), sc(2).start);

  // =====================================================================
  // FOLHA 2 — as contas (cenas 2 a 5); envelope no canto de cima
  // =====================================================================
  page(2, 0.0);
  const L = 120;
  W(2, P(2, 'Digita'), P(2, 'três') + 0.06, '1. número de 3 algarismos', L, 470, 74, INK.black, { anchor: 'start' });
  W(2, P(2, 'com o primeiro'), P(2, 'último') + 0.06, 'o 1º BEM maior que o último', L + 40, 560, 60, INK.purple, { anchor: 'start' });
  W(2, P(2, 'Tipo'), 0.99, 'tipo: 852', L + 40, 640, 58, INK.gray, { anchor: 'start' });
  countdown(fim(2) + 0.1, sc(2).end - 0.1, 870, 640, 110, WB.overlay);

  W(3, P(3, 'Agora'), P(3, 'oito') - 0.01, '2. escreve AO CONTRÁRIO', L, 790, 74, INK.black, { anchor: 'start' });
  W(3, P(3, 'oito'), P(3, 'E faz') - 0.01, 'tipo: 852 vira 258', L + 40, 875, 62, INK.gray, { anchor: 'start' });
  W(3, P(3, 'E faz'), 0.99, 'MAIOR − menor', L + 40, 975, 80, INK.blue, { anchor: 'start' });
  rest(3, T(3, 1.0), sc(4).start);
  countdown(fim(3) + 0.1, sc(3).end - 0.1, 870, 975, 110, WB.overlay);

  W(4, P(4, 'Escreve'), P(4, 'também') + 0.08, '3. resultado AO CONTRÁRIO', L, 1115, 74, INK.black, { anchor: 'start' });
  W(4, P(4, 'e soma'), 0.99, 'e SOMA com o resultado', L + 40, 1205, 72, INK.green, { anchor: 'start' });
  rest(4, T(4, 1.0), sc(5).start);
  countdown(fim(4) + 0.1, sc(4).end - 0.1, 900, 1300, 110, WB.overlay);

  W(5, 0.0, P(5, 'né?') + 0.04, 'cada um, um número DIFERENTE...', 540, 1350, 62, INK.purple);
  W(5, P(5, 'Então'), 0.99, 'guarda o teu resultado', 540, 1450, 70, INK.black);
  const cad = [C.underline(310, 770, 1475, INK.red)];
  D(5, 0.99, 1.0 + (sc(5).end - fim(5)) / (fim(5) - sc(5).start) * 0.9, cad);

  // =====================================================================
  // FOLHA 3 — abre o envelope (cenas 6 e 7)
  // =====================================================================
  page(6, 0.0);
  W(6, 0.05, 0.98, 'o que tava no envelope...', 540, 400, 84, INK.black);
  rest(6, T(6, 1.0), sc(7).start + 0.3);
  // estalo em volta do cartão quando ele aparece
  const puf = WB.group(WB.overlay);
  for (let k = 0; k < 14; k++) {
    const a = k / 14 * Math.PI * 2;
    WB.mk('path', { d: `M ${r1(540 + 380 * Math.cos(a))} ${r1(760 + 260 * Math.sin(a))} L ${r1(540 + 470 * Math.cos(a))} ${r1(760 + 330 * Math.sin(a))}`,
      stroke: INK.orange, 'stroke-width': 10, 'stroke-linecap': 'round', fill: 'none' }, puf);
  }
  WB.effect(t => {
    const u = clamp((t - SOBE - 0.35) / 0.5);
    puf.setAttribute('opacity', (t < SOBE + 0.35 || t > sc(8).start) ? 0 : (1 - u).toFixed(3));
  });
  const st = C.stamp('ACERTEI?', 540, 1560, { size: 120, color: INK.green, rot: -7 });
  D(7, P(7, 'Acertei'), 0.99, [st.box, st.text]);

  // =====================================================================
  // FOLHA 4 — CTA (link da bio / comenta MENTE) + loop (cenas 8 e 9)
  // =====================================================================
  page(8, 0.0);
  W(8, 0.04, P(8, 'vinte') + 0.02, 'Quer aprender', 540, 330, 84, INK.black);
  W(8, P(8, 'vinte'), P(8, 'mentalista') + 0.04, '20 TRUQUES', 540, 480, 140, INK.purple);
  W(8, P(8, 'mentalista') + 0.05, P(8, 'Tá no') - 0.01, 'de mentalista?', 540, 590, 84, INK.black);
  const bio = W(8, P(8, 'Tá no'), P(8, 'bio') + 0.05, 'tá no LINK da BIO', 540, 760, 116, INK.red);
  D(8, P(8, 'bio') + 0.05, P(8, 'ou com') - 0.01, [C.underline(540 - bio.width / 2, 540 + bio.width / 2, 795, INK.red)]);
  const bal = [sp(WB.roundRectPath(240, 860, 600, 230, 46), INK.purple, 9), sp('M 720 1090 L 790 1160 L 650 1090', INK.purple, 9)];
  D(8, P(8, 'ou com'), P(8, 'comenta') + 0.04, bal);
  W(8, P(8, 'comenta') + 0.04, P(8, 'MENTE'), 'ou comenta', 540, 930, 58, INK.gray);
  W(8, P(8, 'MENTE'), 0.99, 'MENTE', 540, 1055, 130, INK.purple);
  W(9, 0.0, P(9, 'Volta') - 0.02, 'DUVIDA?', 540, 1290, 120, INK.orange);
  const v = W(9, P(9, 'Volta'), P(9, 'e tenta') - 0.13, 'VOLTA', 600, 1430, 96, INK.blue);
  const vx = 600 - v.width / 2 - 80, vy = 1400, arcPts = [];
  for (let k = 0; k <= 30; k++) { const a = -0.3 - k / 30 * 4.9; arcPts.push([vx + 52 * Math.cos(a), vy + 52 * Math.sin(a)]); }
  const [pa, pb] = [arcPts[28], arcPts[30]];
  D(9, P(9, 'e tenta') - 0.12, P(9, 'e tenta') - 0.01, [sp('M ' + arcPts.map(p => `${r1(p[0])} ${r1(p[1])}`).join(' L '), INK.blue, 9),
    sp(WB.arrowHead(r1(pb[0]), r1(pb[1]), Math.atan2(pb[1] - pa[1], pb[0] - pa[0]), 26), INK.blue, 9)]);
  W(9, P(9, 'e tenta'), 0.97, 'e tenta OUTRO número', 540, 1545, 84, INK.blue);
  rest(9, T(9, 1.0), sc(9).end);

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA (fica embaixo à esquerda quando a folha está cheia)
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
    const SPOTS = [[770, 1690], [300, 200], [310, 1690]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    const PARK = [310, 1690], FIXO = [[sc(2).start, sc(5).end], [sc(8).start, 1e9]];
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % 3], b = SPOTS[(k + 1) % 3], e = ease(u);
      const w = Math.max(...FIXO.map(([s0, s1]) => clamp((t - s0 + 0.8) / 0.8) * (1 - clamp((t - s1) / 0.8))));
      const x = lerp(lerp(a[0], b[0], e), PARK[0], ease(w)), y = lerp(lerp(a[1], b[1], e), PARK[1], ease(w)) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', 0.95);
    });
  }
};
