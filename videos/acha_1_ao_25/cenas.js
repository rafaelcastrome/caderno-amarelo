// "Acha do 1 ao 25" (Tabela de Schulte com cronômetro de 25 s), narração Gemini Algieba (3.1, take único).
// Grade colorida desde o quadro 0; regra; embaralha; 3-2-1; cronômetro de 25 s com falas de torcida;
// TEMPO; níveis + comenta; fato (Schulte); salva e tenta amanhã.
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const D = (t0, t1, st) => { const c = sceneOf(t0); WB.draw(c, fr(c, t0), fr(c, t1), st); };
  const W = (t0, t1, txt, x, y, size, cor, o = {}) => { const c = sceneOf(t0); return WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o }); };
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 6, parent) => WB.strokePath(d, cor, w, parent);
  const fadeOut = (g, ts, d = 0.25) => WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - ts) / d)).toFixed(3)));
  const janela = (g, a, b, d = 0.2) => WB.effect(t => g.setAttribute('opacity', (clamp((t - a) / d) * (1 - clamp((t - b) / d))).toFixed(3)));
  const st = c => S[c - 1].start, fim = c => S[c - 1].start + S[c - 1].fala;
  const aviso = (t0, t1, tSome, txt, x, y, size, cor, parent) => {
    const g = WB.group(parent); W(t0, t1, txt, x, y, size, cor, { parent: g }); if (tSome) fadeOut(g, tSome); return g;
  };
  // texto que aparece pronto (sem mão) numa janela de tempo
  const flash = (a, b, txt, x, y, size, cor, parent) => {
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, 'middle').strokes); janela(g, a, b, 0.12); return g;
  };
  const pulsa = (g, cx, cy, a, amp = 0.08, vel = 9, dec = 2) => WB.effect(t => {
    const k = t > a ? 1 + amp * Math.sin((t - a) * vel) * Math.exp(-(t - a) * dec) : 1;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });

  const T = S[2].start + S[2].fala + 0.05;        // cronômetro começa logo depois do "Valendo!"
  const T_END = T + 25;

  // ===================== GRADE =====================
  const N = 5, CS = 170, GAP = 12, X0 = 91, Y0 = 430;
  const pos = k => ({ x: X0 + (k % N) * (CS + GAP) + CS / 2, y: Y0 + Math.floor(k / N) * (CS + GAP) + CS / 2 });
  // célula k -> número (A = abertura, B = desafio)
  const A = [12, 21, 7, 18, 24, 3, 10, 20, 14, 9, 25, 17, 23, 1, 15, 11, 6, 19, 13, 2, 22, 16, 4, 5, 8];
  const B = [24, 19, 4, 9, 5, 8, 23, 2, 18, 22, 6, 10, 25, 7, 12, 20, 13, 3, 17, 15, 21, 16, 14, 1, 11];
  const cellA = {}, cellB = {};
  A.forEach((n, k) => cellA[n] = k); B.forEach((n, k) => cellB[n] = k);
  const COR = ['#d62828', '#1d4ed8', '#15803d', '#ea580c', '#7c3aed', '#0e7490', '#be185d', '#a16207'];
  const grade = WB.group();
  const cel = {};
  for (let n = 1; n <= 25; n++) {
    const cor = COR[(n * 5) % COR.length];
    const g = WB.group(grade);
    const h = CS / 2 - 4;
    WB.mk('rect', { x: -h, y: -h, width: 2 * h, height: 2 * h, rx: 22, fill: cor, 'fill-opacity': 0.2, stroke: 'none' }, g);
    WB.showNow([sp(WB.roundRectPath(-h, -h, 2 * h, 2 * h, 22), cor, 6, g)]);
    WB.showNow(WB.textStrokes(String(n), 0, 38, 112, INK.black, g, 'middle').strokes);
    cel[n] = g;
  }
  // posição de cada número: A até o embaralho, depois B (voando em arco)
  const sh0 = st(3) + 0.15, sh1 = sh0 + 1.0;
  WB.effect(t => {
    const u = ease(clamp((t - sh0) / (sh1 - sh0)));
    for (let n = 1; n <= 25; n++) {
      const a = pos(cellA[n]), b = pos(cellB[n]);
      const x = lerp(a.x, b.x, u), y = lerp(a.y, b.y, u) - Math.sin(u * Math.PI) * 90;
      const rot = Math.sin(u * Math.PI) * (n % 2 ? 25 : -25);
      cel[n].setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)})`);
    }
  });
  // grade some no "Preparado?" e volta no "Valendo!"; some de novo no TEMPO
  const prep = st(3) + 1.35;
  WB.effect(t => {
    let o = 1;
    if (t > prep && t < T) o = 1 - 0.93 * clamp((t - prep) / 0.25);
    if (t >= T) o = 0.07 + 0.93 * clamp((t - T) / 0.12);
    if (t >= T_END) o = 1 - 0.85 * clamp((t - T_END) / 0.2);
    grade.setAttribute('opacity', o.toFixed(3));
  });

  // ===================== TOPO: título (até T) e cronômetro (a partir de T) =====================
  const tit = WB.group();
  WB.showNow(WB.textStrokes('ACHA DO 1 AO 25', 540, 215, 120, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('em só 25 segundos?', 540, 335, 84, INK.blue, tit, 'middle').strokes);
  WB.effect(t => tit.setAttribute('opacity', (1 - clamp((t - T + 0.3) / 0.3)).toFixed(3)));

  const crono = WB.group();
  // relógio desenhado
  const RX = 250, RY = 250, RR = 62;
  WB.showNow([sp(WB.circlePath(RX, RY, RR), INK.black, 8, crono),
    sp(`M ${RX - 16} ${RY - RR - 22} L ${RX + 16} ${RY - RR - 22} M ${RX} ${RY - RR - 22} L ${RX} ${RY - RR}`, INK.black, 8, crono),
    sp(`M ${RX + RR * 0.72} ${RY - RR * 0.72} L ${RX + RR * 0.9} ${RY - RR * 0.9}`, INK.black, 8, crono)]);
  const ponteiro = WB.mk('path', { d: `M ${RX} ${RY} L ${RX} ${RY - RR + 14}`, stroke: INK.red, 'stroke-width': 8, 'stroke-linecap': 'round', fill: 'none' }, crono);
  const digs = [];
  for (let s = 25; s >= 0; s--) {
    const g = WB.group(crono);
    WB.showNow(WB.textStrokes('00:' + String(s).padStart(2, '0'), 580, 292, 150, s <= 10 ? INK.red : INK.black, g, 'middle').strokes);
    g.setAttribute('opacity', 0); digs[s] = g;
  }
  // barra que encolhe
  const BX0 = 150, BX1 = 930, BY = 345;
  WB.showNow([sp(WB.roundRectPath(BX0, BY, BX1 - BX0, 26, 13), INK.black, 4, crono)]);
  const barra = WB.mk('rect', { x: BX0 + 4, y: BY + 4, width: BX1 - BX0 - 8, height: 18, rx: 9, fill: INK.green }, crono);
  WB.effect(t => {
    crono.setAttribute('opacity', clamp((t - T + 0.3) / 0.3).toFixed(3));
    const el = clamp(t - T, 0, 25), rest = 25 - el;
    const s = t < T ? 25 : Math.max(0, Math.ceil(25 - (t - T) - 1e-6));
    digs.forEach((g, i) => g.setAttribute('opacity', i === s ? 1 : 0));
    ponteiro.setAttribute('transform', `rotate(${r1(el / 25 * 360)} ${RX} ${RY})`);
    barra.setAttribute('width', r1(Math.max(0, (BX1 - BX0 - 8) * rest / 25)));
    barra.setAttribute('fill', rest > 10 ? INK.green : rest > 5 ? INK.orange : INK.red);
    // tremidinha nos últimos 10 s
    const k = rest <= 10 && t < T_END ? 1 + 0.05 * Math.max(0, Math.cos((t - T) * Math.PI * 2)) ** 8 : 1;
    digs[s].setAttribute('transform', `translate(580 240) scale(${k.toFixed(3)}) translate(-580 -240)`);
  });
  const lembrete = WB.group();
  WB.showNow(WB.textStrokes('do 1 ao 25, na ordem', 540, 1400, 62, INK.gray, lembrete, 'middle').strokes);
  janela(lembrete, T - 0.1, T_END, 0.2);

  // ===================== CENA 1: gancho =====================
  rest(0.2, 0.3);
  const duv = WB.group();
  W(fim(1) - 1.0, fim(1) - 0.2, 'DUVIDO!', 540, 1560, 150, INK.red, { parent: duv });
  pulsa(duv, 540, 1510, fim(1) - 0.2);
  fadeOut(duv, st(2) + 0.1);
  rest(fim(1) - 0.15, st(2) - 0.05);

  // ===================== CENA 2: regra (circula 1, 2, 3 ... 25) =====================
  const s2 = st(2), F2 = S[1].fala;
  const laco = WB.group();
  const circula = (n, t0, cor) => { const p = pos(cellA[n]); D(t0, t0 + 0.45, [sp(WB.loopEllipse(p.x, p.y, 96, 96), cor, 9, laco)]); };
  circula(1, s2 + F2 * 0.27, INK.red);
  circula(2, s2 + F2 * 0.42, INK.red);
  circula(3, s2 + F2 * 0.55, INK.red);
  aviso(s2 + F2 * 0.64, s2 + F2 * 0.88, st(3) + 0.1, '1, 2, 3 ... até o 25', 540, 1560, 96, INK.blue);
  circula(25, s2 + F2 * 0.9, INK.blue);
  fadeOut(laco, st(3) + 0.05, 0.2);
  rest(s2 + F2 * 0.9 + 0.5, st(3) + 0.1);

  // ===================== CENA 3: embaralha, 3-2-1, valendo =====================
  const s3 = st(3);
  flash(sh0, prep - 0.05, 'embaralhando...', 540, 1560, 90, INK.purple);
  flash(prep, T, 'Preparado?', 540, 640, 130, INK.black);
  const nums = [['3', s3 + 2.45], ['2', s3 + 3.42], ['1', s3 + 4.5]];
  nums.forEach(([n, a], i) => {
    const b = i < 2 ? nums[i + 1][1] - 0.05 : s3 + 5.3;
    const g = flash(a, b, n, 540, 1150, 420, INK.red); pulsa(g, 540, 1000, a, 0.12, 10, 3);
  });
  const val = flash(s3 + 5.3, T - 0.02, 'VALENDO!', 540, 1060, 190, INK.green); pulsa(val, 540, 1000, s3 + 5.3, 0.1, 10, 3);

  // ===================== CENAS 4-11: torcida durante os 25 s =====================
  flash(st(4), st(4) + 2.2, 'VAI! VAI! VAI!', 540, 1560, 110, INK.blue);
  flash(st(5), st(5) + 2.3, 'METADE DO TEMPO!', 540, 1560, 100, INK.orange);
  flash(st(6), st(7) - 0.1, '10 SEGUNDOS!', 540, 1560, 110, INK.red);
  for (let c = 7; c <= 11; c++) {
    const g = flash(st(c), st(c) + 0.9, String(12 - c), 540, 1600, 170, INK.red); pulsa(g, 540, 1540, st(c), 0.15, 10, 3);
  }

  // ===================== CENA 12: TEMPO! =====================
  const s12 = st(12);
  const tp = WB.group();
  WB.mk('rect', { x: 120, y: 700, width: 840, height: 330, rx: 40, fill: '#fffaf0', stroke: INK.red, 'stroke-width': 10 }, tp);
  WB.showNow(WB.textStrokes('TEMPO!', 540, 930, 230, INK.red, tp, 'middle').strokes);
  janela(tp, s12, S[11].end + 0.2, 0.08);
  WB.effect(t => { const k = t > s12 ? 1 + 0.25 * Math.exp(-(t - s12) * 9) : 1; tp.setAttribute('transform', `translate(540 865) scale(${k.toFixed(3)}) rotate(${(-4 * (t > s12)).toFixed(1)}) translate(-540 -865)`); });
  flash(s12 + 0.6, S[11].end + 0.2, 'para tudo!', 540, 1150, 100, INK.black);

  // ===================== FOLHA 2: níveis + comenta =====================
  WB.newPage(13, 0, 0.05);
  const s13 = st(13), F13 = S[12].fala;
  W(s13 + 0.35, s13 + F13 * 0.17, 'Até qual número', 540, 330, 104, INK.black);
  W(s13 + F13 * 0.17 + 0.02, s13 + F13 * 0.2, 'tu chegou?', 540, 460, 104, INK.black);
  const nivel = (y, num, cor, txt, t0, t1) => {
    const tm = lerp(t0, t1, 0.4);
    W(t0, tm, 'até ' + num, 330, y, 100, cor);
    D(tm + 0.02, tm + 0.3, [sp(WB.arrowPath ? WB.arrowPath(470, y - 30, 560, y - 30) : `M 470 ${y - 30} L 560 ${y - 30} M 535 ${y - 52} L 562 ${y - 30} L 535 ${y - 8}`, INK.gray, 7)]);
    W(tm + 0.32, t1, txt, 760, y, 92, cor);
  };
  nivel(690, '10', INK.blue, 'normal', s13 + F13 * 0.24, s13 + F13 * 0.43);
  nivel(890, '20', INK.orange, 'rápido', s13 + F13 * 0.48, s13 + F13 * 0.66);
  const top = WB.group();
  W(s13 + F13 * 0.72, s13 + F13 * 0.82, 'achou os 25?', 540, 1090, 100, INK.red, { parent: top });
  W(s13 + F13 * 0.84, s13 + F13 * 0.99, 'CÉREBRO DE FOGUETE!', 540, 1220, 108, INK.red, { parent: top });
  pulsa(top, 540, 1150, s13 + F13 * 0.99, 0.06, 8, 1.5);
  // cena 14: comenta
  const s14 = st(14);
  const bal = WB.group();
  D(s14 + 0.05, s14 + 0.6, [sp(`M 230 1350 Q 230 1310 270 1310 L 810 1310 Q 850 1310 850 1350 L 850 1470 Q 850 1510 810 1510 L 420 1510 L 330 1575 L 350 1510 L 270 1510 Q 230 1510 230 1470 Z`, INK.blue, 8, bal)]);
  W(s14 + 0.62, s14 + 1.7, 'comenta teu número', 540, 1435, 80, INK.blue);
  rest(s14 + 1.75, S[13].end - 0.05);

  // ===================== FOLHA 3: Tabela de Schulte =====================
  WB.newPage(15, 0, 0.05);
  const s15 = st(15), F15 = S[14].fala;
  W(s15 + 0.3, s15 + F15 * 0.2, 'isso se chama', 540, 290, 84, INK.gray);
  const tt = WB.group();
  W(s15 + F15 * 0.2 + 0.02, s15 + F15 * 0.36, 'TABELA DE SCHULTE', 540, 420, 112, INK.red, { parent: tt });
  // mini grade desenhada
  const mx = 390, my = 500, ms = 300, mc = ms / 5;
  const linhas = [];
  for (let i = 0; i <= 5; i++) {
    linhas.push(sp(WB.roughLine(mx + i * mc, my, mx + i * mc, my + ms, 2), INK.black, 5));
    linhas.push(sp(WB.roughLine(mx, my + i * mc, mx + ms, my + i * mc, 2), INK.black, 5));
  }
  D(s15 + F15 * 0.37, s15 + F15 * 0.5, linhas);
  const miniNum = WB.group();
  B.forEach((n, k) => WB.showNow(WB.textStrokes(String(n), mx + (k % 5) * mc + mc / 2, my + Math.floor(k / 5) * mc + mc / 2 + 14, 40, INK.blue, miniNum, 'middle').strokes));
  miniNum.setAttribute('opacity', 0);
  WB.effect(t => miniNum.setAttribute('opacity', clamp((t - s15 - F15 * 0.5) / 0.3).toFixed(3)));
  W(s15 + F15 * 0.52, s15 + F15 * 0.66, 'um psiquiatra alemão criou', 540, 950, 78, INK.black);
  W(s15 + F15 * 0.66 + 0.02, s15 + F15 * 0.76, 'pra medir a ATENÇÃO', 540, 1060, 86, INK.purple);
  W(s15 + F15 * 0.8, s15 + F15 * 0.98, 'hoje: treino de leitura rápida', 540, 1200, 74, INK.green);
  // cena 16: salva
  const s16 = st(16), F16 = S[15].fala;
  const mk = WB.group();
  D(s16 + 0.05, s16 + 0.55, [sp('M 150 1330 L 240 1330 L 240 1480 L 195 1440 L 150 1480 Z', INK.orange, 9, mk)]);
  W(s16 + 0.6, s16 + F16 * 0.5, 'salva e tenta amanhã', 600, 1430, 80, INK.orange);
  W(s16 + F16 * 0.55, s16 + F16 * 0.95, 'aposto que tu vai mais longe!', 540, 1560, 72, INK.black);
  rest(s16 + F16 * 0.96, S[15].end - 0.1);

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA (faixa de baixo, fora da grade)
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
    const SPOTS = [[290, 1770], [790, 1770], [540, 1800], [300, 1760]];
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
