// "Teu olho vai pintar essa fruta" (pós-imagem colorida), ~60 s, narração Gemini Charon.
// Fatia de melancia com as cores trocadas (polpa azul-piscina, casca rosa, sementes brancas); ~19 s
// encarando o pontinho, aí a folha fica vazia de uma vez e o olho mostra a melancia vermelha e verde.
// Fim "Volta... e dessa vez, não pisca!" emenda no começo. A marca d'água passeia entre 3 pontos seguros
// e fica parada embaixo durante a encarada e enquanto a pessoa olha a pós-imagem.
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
  // cores reais da melancia e as complementares que geram a pós-imagem certa
  const REAL = { polpa: '#e0262f', casca: '#1f9d3a', semente: '#1f1f24' };
  const INV = { polpa: '#1fd9d0', casca: '#e062c5', semente: '#ffffff' };
  const AGORA = 25.3;    // "Agora!" na narração
  const DOT0 = 6.3;      // o pontinho aparece ("pontinho")

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
  // FOLHA 1 — a melancia invertida (cenas 1 a 5); "Agora!" (cena 6) deixa a folha vazia
  // =====================================================================
  const CX = 540, CY = 640, RO = 410, RI = 350;  // corte reto em cima, casca embaixo
  const half = r => `M ${CX - r} ${CY} A ${r} ${r} 0 0 0 ${CX + r} ${CY} Z`;
  const pg1 = WB.group();
  const fruta = WB.group(pg1);
  const cascaF = fill('path', { d: half(RO), fill: INV.casca }, fruta);
  const polpaF = fill('path', { d: half(RI), fill: INV.polpa }, fruta);
  const cascaO = [sp(`M ${CX - RO} ${CY} L ${CX + RO} ${CY}`, INK.black, 7, fruta), sp(WB.arcPath(CX, CY, RO, RO, 0, Math.PI), INK.black, 7, fruta)];
  const polpaO = [sp(WB.arcPath(CX, CY, RI, RI, 0, Math.PI), INK.black, 6, fruta)];
  // sementes (gotas apontando pro centro do corte)
  const SEM = [[-230, 90], [-120, 170], [0, 200], [120, 170], [230, 90], [-170, 260], [170, 260], [-60, 290], [60, 290], [0, 95]];
  const semF = [], semO = [];
  SEM.forEach(([dx, dy]) => {
    const x = CX + dx, y = CY + dy, a = Math.atan2(dy, dx), L = 26, w = 12;
    const tx = x - Math.cos(a) * L, ty = y - Math.sin(a) * L;           // ponta pro centro
    const nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
    const d = `M ${r1(tx)} ${r1(ty)} Q ${r1(x + nx)} ${r1(y + ny)} ${r1(x + Math.cos(a) * 10)} ${r1(y + Math.sin(a) * 10)} Q ${r1(x - nx)} ${r1(y - ny)} ${r1(tx)} ${r1(ty)} Z`;
    semF.push(fill('path', { d, fill: INV.semente }, fruta));
    semO.push(sp(d, INK.black, 3, fruta));
  });
  // gancho já no 1º quadro: a melancia aparece pronta
  WB.showNow([cascaO, polpaO, semO]);
  [cascaF, polpaF, ...semF].forEach(f => f.setAttribute('fill-opacity', 1));
  W(1, 0.2, 1.5, 'cor ERRADA?', 540, 400, 104, INK.red, { parent: pg1 });
  const hookTxt = WB.group(pg1);
  W(1, 3.3, 4.4, 'teu olho pinta...', 540, 1290, 76, INK.gray, { parent: hookTxt });
  W(1, 4.45, 5.3, 'SOZINHO!', 540, 1400, 92, INK.purple, { parent: hookTxt });

  // cena 2: o pontinho e a encarada (o pontinho fica numa camada fixa e sobra na folha vazia)
  const DX = CX, DY = CY + 150;
  const dotG = WB.group(WB.overlay);
  const dotF = fill('circle', { cx: DX, cy: DY, r: 13, fill: '#000' }, dotG);
  const dotO = [sp(WB.circlePath(DX, DY, 9), '#000', 8, dotG)];
  D(2, DOT0, DOT0 + 0.3, dotO); WB.fillAfter(dotF, dotO, 0.1);
  WB.effect(t => dotG.setAttribute('opacity', t < 31.6 ? 1 : 1 - clamp((t - 31.6) / 0.4)));
  WB.effect(t => hookTxt.setAttribute('opacity', (1 - clamp((t - 6.7) / 0.4)).toFixed(3)));
  W(2, 7.6, 8.5, 'NÃO PISCA!', 540, 1330, 100, INK.red, { parent: pg1 });
  rest(2, 8.6, 11.4);
  rest(3, 11.6, 18.7); rest(4, 18.9, 22.5); rest(5, 22.7, 25.1);
  countdown(DOT0 + 0.4, AGORA, 540, 1500, pg1);
  WB.effect(t => pg1.setAttribute('opacity', t < AGORA ? 1 : 0));

  // cenas 6 a 10: folha vazia (a pessoa vê a pós-imagem); só lembretes pequenos embaixo
  rest(6, 25.4, 32.1);
  // lembretes que somem antes do próximo, pra não encavalar
  const lembrete = (c, t0, t1, tSome, txt, y, size, cor) => {
    const g = WB.group();
    W(c, t0, t1, txt, 540, y, size, cor, { parent: g });
    WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - tSome) / 0.3)).toFixed(3)));
  };
  lembrete(7, 32.45, 33.3, 36.2, 'pisca!', 1560, 72, INK.gray);
  rest(7, 33.4, 34.5); rest(8, 34.7, 36.3);
  lembrete(9, 36.7, 37.9, 40.3, 'olha pra PAREDE', 1560, 72, INK.gray);
  rest(9, 38.0, 40.2);
  W(10, 40.75, 41.7, 'GIGANTE!', 540, 1560, 80, INK.orange);
  rest(10, 41.8, 42.3);

  // =====================================================================
  // FOLHA 2 — por quê (cenas 11 e 12)
  // =====================================================================
  WB.newPage(11, 0, 0.12);
  W(11, 42.85, 43.95, 'esse VERMELHO...', 540, 380, 96, INK.red);
  W(11, 44.1, 45.45, 'NUNCA ESTEVE NA TELA!', 540, 500, 80, INK.black);
  const eye = [sp(`M 330 680 Q 540 540 750 680 Q 540 820 330 680`, INK.black, 8),
    sp(WB.circlePath(540, 680, 62), INK.blue, 7)];
  const pup = fill('circle', { cx: 540, cy: 680, r: 26, fill: INK.black });
  D(12, 45.75, 46.4, eye); WB.fillAfter(pup, eye, 0.15);
  W(12, 46.45, 46.95, 'z z z', 830, 590, 64, INK.purple);
  W(12, 47.0, 47.6, 'CANSOU!', 540, 900, 92, INK.orange);
  const ROWS = [[INV.polpa, REAL.polpa, 1100], [INV.casca, REAL.casca, 1250], [INV.semente, REAL.semente, 1400]];
  W(12, 47.7, 48.0, 'encarou', 330, 1010, 52, INK.gray);
  W(12, 48.05, 48.3, 'viu', 750, 1010, 52, INK.gray);
  ROWS.forEach(([a, b, y], i) => {
    const t0 = 48.35 + i * 0.66;
    const fa = fill('rect', { x: 230, y: y - 55, width: 200, height: 110, rx: 10, fill: a });
    const fb = fill('rect', { x: 650, y: y - 55, width: 200, height: 110, rx: 10, fill: b });
    const oa = [sp(WB.roughRect(230, y - 55, 430, y + 55), INK.black, 5)];
    const ar = C.arrow(460, y, 620, y, INK.black, 7);
    const ob = [sp(WB.roughRect(650, y - 55, 850, y + 55), INK.black, 5)];
    D(12, t0, t0 + 0.2, oa); WB.fillAfter(fa, oa, 0.1);
    D(12, t0 + 0.22, t0 + 0.38, ar);
    D(12, t0 + 0.4, t0 + 0.6, ob); WB.fillAfter(fb, ob, 0.1);
  });
  W(12, 50.35, 51.5, 'PINTOU SOZINHO!', 540, 1580, 88, INK.purple);

  // =====================================================================
  // FOLHA 3 — CTA + loop (cena 13)
  // =====================================================================
  WB.newPage(13, 0, 0.05);
  W(13, 52.0, 52.6, 'Viu?', 540, 380, 100, INK.black);
  W(13, 52.75, 53.5, 'COMENTA:', 540, 500, 84, INK.gray);
  W(13, 53.6, 54.0, 'VI', 330, 630, 112, INK.green);
  W(13, 54.2, 54.95, 'ou NÃO VI', 640, 630, 100, INK.red);
  WB.ctaRedes(13, fr(13, 55.0), fr(13, 56.1), { y: 700, titulo: 'Me segue!', iconSize: 150 });
  W(13, 56.2, 56.85, 'VOLTA', 540, 1300, 120, INK.orange);
  W(13, 56.95, 58.6, 'e não pisca!', 540, 1420, 90, INK.red);
  rest(13, 58.7, 59.3);

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA
  // =====================================================================
  const CTA0 = S[12].start;
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
    const PARK = [310, 1680], STARES = [[-1, 42.4]];
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % 3], b = SPOTS[(k + 1) % 3], e = ease(u);
      const w = Math.max(...STARES.map(([s0, s1]) => clamp((t - s0 + 0.8) / 0.8) * (1 - clamp((t - s1) / 0.8))));
      const x = lerp(lerp(a[0], b[0], e), PARK[0], ease(w)), y = lerp(lerp(a[1], b[1], e), PARK[1], ease(w)) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.3) / 0.4) * (1 - clamp((t - CTA0 + 0.2) / 0.4)) * 0.95).toFixed(3));
    });
  }
};
