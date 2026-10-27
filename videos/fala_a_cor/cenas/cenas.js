// "Fala a cor" (efeito Stroop + frase-pegadinha), ~52 s, narração ElevenLabs (Gabriel) numa tomada só.
// Truque de rewatch: a placa do começo diz "EU AMO / PARIS NA / NA PRIMAVERA" (o "NA" repete na quebra
// de linha). Ela fica num canto (camada fixa WB.overlay) durante o teste de cores e volta no fim com a
// pergunta "achou a pegadinha?". O vídeo termina em "Me segue... e volta." e o loop emenda em "Lê essa frase aí".
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
  // tintas do teste: bem distintas entre si
  const T = { azul: '#1d4ed8', verde: '#15803d', vermelho: '#dc2626', laranja: '#f97316', roxo: '#7c3aed' };

  // =====================================================================
  // PLACA (camada fixa): desenhada na cena 1, vai pro canto, volta no fim.
  // =====================================================================
  const TCX = 540, TCY = 645;
  const tri = WB.group(WB.overlay);
  const triD = `M 540 330 L 950 960 L 130 960 Z`;
  const triFill = WB.mk('path', { d: triD, fill: '#fff3b0', 'fill-opacity': 1, stroke: 'none' }, tri);
  const triOut = [sp(`M 540 330 L 950 960 L 130 960 L 540 330`, INK.red, 14, tri)];
  D(1, 0.05, 0.6, triOut);
  WB.fillAfter(triFill, triOut, 0.2);
  W(1, 0.65, 1.15, 'EU AMO', 540, 640, 84, INK.black, { parent: tri });
  W(1, 1.2, 1.75, 'PARIS NA', 540, 760, 84, INK.black, { parent: tri });
  W(1, 1.8, 2.45, 'NA PRIMAVERA', 540, 880, 84, INK.black, { parent: tri });
  W(1, 2.5, 3.0, 'em voz alta!', 540, 1140, 96, INK.orange);

  const KF = [   // [t, centro x, centro y, escala]
    [6.2, 540, 645, 1], [7.2, 925, 300, 0.3],
    [38.0, 925, 300, 0.3], [38.9, 540, 645, 1],
    [47.5, 540, 645, 1], [48.1, 540, 430, 0.45],
  ];
  WB.effect(t => {
    let cx = KF[0][1], cy = KF[0][2], s = KF[0][3];
    for (let i = 0; i < KF.length - 1; i++) {
      const a = KF[i], b = KF[i + 1];
      if (t >= a[0]) {
        const u = ease(clamp((t - a[0]) / Math.max(b[0] - a[0], 1e-6)));
        cx = lerp(a[1], b[1], u); cy = lerp(a[2], b[2], u); s = lerp(a[3], b[3], u);
      }
    }
    tri.setAttribute('transform', `translate(${r1(cx - s * TCX)} ${r1(cy - s * TCY)}) scale(${s.toFixed(4)})`);
  });

  // cena 2: leu? guarda ela
  W(2, 3.2, 3.85, 'Leu?', 470, 1300, 100, INK.green);
  D(2, 3.9, 4.15, C.check(620, 1270, 34));
  W(2, 4.7, 5.9, 'guarda ela aí...', 540, 1440, 76, INK.gray);
  rest(2, 6.0, 7.3);

  // =====================================================================
  // FOLHA 2 — o teste (cenas 3 a 6)
  // =====================================================================
  WB.newPage(3, 0, 0.05);
  W(3, 8.55, 9.6, 'Fala a COR', 470, 520, 108, INK.black);
  W(3, 9.65, 10.1, 'da tinta', 470, 620, 66, INK.black);
  W(3, 10.25, 11.15, '(não a palavra!)', 540, 720, 62, INK.gray);
  W(3, 11.4, 12.2, 'fácil:', 90, 840, 58, INK.gray, { anchor: 'start' });

  // cena 4: rodada fácil, palavra e tinta batem
  W(4, 12.5, 13.2, 'AZUL', 180, 950, 80, T.azul);
  W(4, 13.45, 14.05, 'VERDE', 430, 950, 80, T.verde);
  W(4, 14.1, 14.8, 'VERMELHO', 750, 950, 80, T.vermelho);

  // cena 5: rodada valendo, palavras aparecem prontas de uma vez (cartão do teste)
  const GRID = [
    ['VERMELHO', T.laranja, 300, 1215], ['VERDE', T.azul, 770, 1215],
    ['AZUL', T.roxo, 300, 1365], ['LARANJA', T.vermelho, 750, 1365],
    ['ROXO', T.verde, 540, 1515],
  ];
  const card = WB.group();
  const gw = GRID.map(([txt, cor, x, y]) => {
    const r = WB.textStrokes(txt, x, y, 112, cor, card, 'middle');
    WB.showNow(r.strokes);
    return r.width;
  });
  WB.effect(t => card.setAttribute('opacity', clamp((t - 15.25) / 0.15).toFixed(3)));
  const st = C.stamp('RÁPIDO!', 540, 1060, { size: 70, rot: -6, color: INK.red });
  D(5, 15.85, 16.15, st.box); D(5, 16.15, 17.05, st.text);
  rest(5, 17.15, 18.7);   // silêncio: a pessoa tenta sozinha

  // cena 6: as respostas, sublinhando cada palavra quando o narrador fala a cor
  const AT = [18.84, 19.48, 20.04, 20.56, 21.28];
  GRID.forEach(([, cor, x, y], i) => {
    const w = gw[i];
    D(6, AT[i], AT[i] + 0.38, C.underline(x - w / 2, x + w / 2, y + 22, cor));
  });
  rest(6, 22.0, 22.16);

  // =====================================================================
  // FOLHA 3 — o nome e o porquê (cenas 7 a 9)
  // =====================================================================
  WB.newPage(7, 0, 0.07);
  W(7, 22.4, 23.15, 'TRAVOU?', 470, 540, 130, INK.red);
  W(7, 24.2, 25.3, 'todo mundo trava!', 540, 660, 72, INK.gray);
  const ef = W(8, 26.45, 27.55, 'EFEITO STROOP', 540, 840, 112, INK.blue);
  D(8, 27.6, 27.85, C.underline(540 - ef.width / 2, 540 + ef.width / 2, 870, INK.blue));
  W(8, 29.6, 30.4, '1935', 470, 1010, 110, INK.orange);
  W(8, 30.45, 31.1, 'J. R. Stroop', 760, 1000, 52, INK.gray);
  // cena 9: ler (automático) x cor (esforço)
  W(9, 31.35, 32.0, 'LER', 270, 1250, 110, INK.green);
  W(9, 32.05, 33.3, 'automático', 270, 1335, 54, INK.green);
  rest(9, 33.4, 34.7);
  W(9, 34.85, 35.4, 'COR', 810, 1250, 110, INK.orange);
  W(9, 35.45, 36.2, 'dá trabalho', 810, 1335, 54, INK.orange);
  D(9, 36.25, 36.6, [sp(`M 560 1150 L 500 1260 L 570 1250 L 510 1360`, INK.red, 9)]);
  W(9, 36.7, 37.5, 'BRIGA!', 540, 1490, 104, INK.red);

  // =====================================================================
  // FOLHA 4 — a placa volta (cenas 10 e 11)
  // =====================================================================
  WB.newPage(10, 0, 0.06);
  W(10, 39.3, 41.6, '"eu amo Paris na primavera"?', 540, 1110, 62, INK.gray);
  W(11, 42.85, 44.0, 'tem PEGADINHA!', 540, 1265, 104, INK.red);
  W(11, 44.3, 46.05, 'teu cérebro lê o que ESPERA', 540, 1395, 64, INK.purple);
  W(11, 46.15, 47.2, 'não o que tá escrito', 540, 1495, 64, INK.gray);

  // =====================================================================
  // FOLHA 5 — CTA + loop (cena 12)
  // =====================================================================
  WB.newPage(12, 0, 0.04);
  W(12, 47.65, 48.75, 'Achou? COMENTA!', 540, 720, 92, INK.green);
  WB.ctaRedes(12, fr(12, 48.85), fr(12, 50.6), { y: 800, titulo: 'Não achou? Me segue!', iconSize: 150 });
  W(12, 50.7, 51.3, 'e VOLTA!', 540, 1420, 110, INK.orange);
  rest(12, 51.35, 51.62);

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA
  // =====================================================================
  const CTA0 = S[11].start;
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[770, 1620], [250, 250], [310, 1620]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % 3], b = SPOTS[(k + 1) % 3], e = ease(u);
      const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.3) / 0.4) * (1 - clamp((t - CTA0 + 0.2) / 0.4)) * 0.95).toFixed(3));
    });
  }
};
