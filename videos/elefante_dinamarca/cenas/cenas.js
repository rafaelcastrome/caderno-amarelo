// "Vou adivinhar o que tu tá pensando" (truque do elefante cinza na Dinamarca), ~57 s, narração ElevenLabs (Gabriel).
// O espectador faz as contas junto (pausas com contagem regressiva para pensar). Qualquer número de 1 a 10
// vezes 9 tem dígitos que somam 9; 9 - 5 = 4 = D -> Dinamarca; letra seguinte E -> elefante; cor -> cinza.
// O fim "o que um elefante tá fazendo na Dinamarca?" + "VOLTA e pensa em outro número" emenda no começo.
// A marca d'água @cardeno_amarelo passeia entre 3 pontos seguros.
window.CENAS = function (WB) {
  const { INK, C, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  // tempos escritos na mixagem antiga; M() leva cada um, proporcionalmente dentro da cena, para a mixagem nova
  const OLD = [[0, 5.25], [5.25, 9.91], [9.91, 14.55], [14.55, 19.47], [19.47, 22.37], [22.37, 30.26], [30.26, 34.34], [34.34, 40.71], [40.71, 44.35], [44.35, 49.95], [49.95, 53.92], [53.92, 57.52]];
  const M = t => { const i = OLD.findIndex(([a, b]) => t < b), k = i < 0 ? OLD.length - 1 : i;
    const [a, b] = OLD[k]; return S[k].start + (t - a) / (b - a) * (S[k].end - S[k].start); };
  const fr = (c, t) => (M(t) - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const D = (c, t0, t1, st) => WB.draw(c, fr(c, t0), fr(c, t1), st);
  const W = (c, t0, t1, txt, x, y, size, cor, o = {}) => WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o });
  const rest = (c, t0, t1) => WB.restHand(c, fr(c, t0), fr(c, t1));
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 7, parent) => WB.strokePath(d, cor, w, parent);
  const fill = (tag, attrs, parent) => WB.mk(tag, { 'fill-opacity': 0, stroke: 'none', ...attrs }, parent);
  const ell = (cx, cy, rx, ry) => `M ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy}`;
  const CINZA = '#9b9ba3', CINZA2 = '#c4c4cb';

  // contagem regressiva para o espectador pensar (números prontos, só troca a opacidade)
  function countdown(t0, t1, x = 540, y = 1560) {
    const n = Math.ceil(t1 - t0 - 0.05);
    const g = WB.group();
    const nums = [];
    for (let k = 1; k <= n; k++) {
      const gk = WB.group(g);
      WB.showNow(WB.textStrokes(String(k), x, y, 110, INK.gray, gk, 'middle').strokes);
      gk.setAttribute('opacity', 0);
      nums.push(gk);
    }
    WB.effect(t => {
      const v = (t >= M(t0) && t < M(t1)) ? Math.ceil(M(t1) - t - 0.05) : 0;
      nums.forEach((gk, i) => gk.setAttribute('opacity', i + 1 === v ? 1 : 0));
    });
  }

  // =====================================================================
  // CENA 1 — gancho: a bola de cristal
  // =====================================================================
  W(1, 0.1, 1.0, 'EU VOU ADIVINHAR', 540, 380, 104, INK.purple);
  W(1, 1.05, 2.05, 'o que tu tá pensando', 540, 500, 72, INK.gray);
  const ballF = fill('circle', { cx: 540, cy: 880, r: 190, fill: '#e9ddff' });
  const ball = [sp(WB.circlePath(540, 880, 190), INK.purple, 8)];
  const base = [sp(`M 400 1120 L 680 1120 L 630 1050 L 450 1050 Z`, INK.black, 8)];
  const brilho = [sp(`M 440 800 Q 460 740 520 720`, '#ffffff', 12)];
  D(1, 2.1, 2.7, ball); WB.fillAfter(ballF, ball, 0.2);
  D(1, 2.7, 3.0, base);
  D(1, 3.0, 3.15, brilho);
  W(1, 3.15, 3.55, '?', 560, 960, 220, INK.purple);
  W(1, 3.7, 4.9, 'sem trapacear!', 540, 1330, 88, INK.red);
  rest(1, 4.95, 5.2);

  // =====================================================================
  // CENA 2 — pensa num número de 1 a 10
  // =====================================================================
  WB.newPage(2, 0, 0.05);
  W(2, 5.45, 6.4, 'PENSA NUM NÚMERO', 540, 380, 96, INK.black);
  // cabeça com balão de pensamento
  const head = [sp(WB.circlePath(330, 1050, 120), INK.black, 8),
    sp(`M 290 1020 L 292 1032 M 368 1020 L 370 1032`, INK.black, 10),
    sp(`M 285 1100 Q 330 1130 375 1100`, INK.black, 6)];
  D(2, 6.3, 6.75, head);
  D(2, 6.75, 7.15, C.thought(680, 760, 230, 150, 420, 960));
  W(2, 7.15, 7.6, 'de 1 a 10', 680, 785, 84, INK.blue);
  W(2, 8.4, 8.95, 'Pensou?', 760, 1250, 80, INK.gray);
  D(2, 9.2, 9.6, C.check(760, 1380, 60));

  // =====================================================================
  // CENA 3 — x 9
  // =====================================================================
  WB.newPage(3, 0, 0.05);
  W(3, 10.05, 10.9, 'multiplica por', 540, 450, 84, INK.gray);
  W(3, 11.0, 11.9, '× 9', 540, 900, 300, INK.orange);
  rest(3, 12.0, 14.4);
  countdown(12.05, 14.55);

  // =====================================================================
  // CENA 4 — soma os dígitos
  // =====================================================================
  WB.newPage(4, 0, 0.05);
  W(4, 14.7, 15.7, 'deu dois dígitos?', 540, 430, 88, INK.black);
  D(4, 16.0, 16.35, [C.box(250, 720, 430, 920, INK.blue)]);
  W(4, 16.35, 16.6, '+', 540, 870, 140, INK.black);
  D(4, 16.6, 16.95, [C.box(650, 720, 830, 920, INK.blue)]);
  W(4, 16.95, 17.4, 'SOMA!', 540, 1120, 110, INK.green);
  rest(4, 17.45, 19.3);
  countdown(17.47, 19.47);

  // =====================================================================
  // CENA 5 — tira 5
  // =====================================================================
  WB.newPage(5, 0, 0.05);
  W(5, 19.65, 20.3, 'agora tira', 540, 450, 84, INK.gray);
  W(5, 20.35, 20.95, '− 5', 540, 900, 300, INK.red);
  rest(5, 21.0, 22.2);
  countdown(20.87, 22.37);

  // =====================================================================
  // CENA 6 — número vira letra
  // =====================================================================
  WB.newPage(6, 0, 0.05);
  W(6, 22.55, 24.3, 'NÚMERO vira LETRA', 540, 380, 96, INK.black);
  W(6, 24.7, 25.8, '1 = A', 540, 620, 120, INK.blue);
  W(6, 26.1, 27.2, '2 = B', 540, 800, 120, INK.blue);
  W(6, 27.5, 28.5, '3 = C', 540, 980, 120, INK.blue);
  W(6, 28.55, 28.75, '...', 540, 1100, 120, INK.gray);
  rest(6, 28.8, 30.1);
  countdown(28.76, 30.26);

  // =====================================================================
  // CENA 7 — um país
  // =====================================================================
  WB.newPage(7, 0, 0.05);
  W(7, 30.4, 31.25, 'um PAÍS', 540, 400, 120, INK.green);
  W(7, 31.3, 32.15, 'com essa letra', 540, 520, 76, INK.gray);
  const gF = fill('circle', { cx: 540, cy: 930, r: 220, fill: '#cfe6ff' });
  const globo = [sp(WB.circlePath(540, 930, 220), INK.blue, 8)];
  const merid = [sp(ell(540, 930, 95, 220), INK.blue, 5), sp(`M 320 930 L 760 930`, INK.blue, 5),
    sp(`M 350 830 Q 540 860 730 830 M 350 1030 Q 540 1000 730 1030`, INK.blue, 5)];
  D(7, 32.2, 32.7, globo); WB.fillAfter(gF, globo, 0.2);
  D(7, 32.7, 33.2, merid);
  rest(7, 33.25, 34.2);
  countdown(32.34, 34.34);

  // =====================================================================
  // CENA 8 — letra seguinte -> um bicho
  // =====================================================================
  WB.newPage(8, 0, 0.05);
  W(8, 34.5, 35.6, 'a LETRA SEGUINTE', 540, 400, 96, INK.purple);
  W(8, 35.6, 36.7, 'do alfabeto', 540, 510, 72, INK.gray);
  D(8, 36.8, 37.1, C.arrow(540, 580, 540, 740, INK.black, 8));
  W(8, 37.2, 38.0, 'um BICHO', 540, 860, 120, INK.orange);
  // pegada
  const pata = [[540, 1130, 70, 58], [455, 1030, 26, 32], [510, 1000, 26, 32], [570, 1000, 26, 32], [625, 1030, 26, 32]];
  pata.forEach(([x, y, rx, ry], i) => {
    const f = fill('path', { d: ell(x, y, rx, ry), fill: INK.orange });
    const o = [sp(ell(x, y, rx, ry), INK.black, 5)];
    D(8, 38.0 + i * 0.1, 38.1 + i * 0.1, o); WB.fillAfter(f, o, 0.1);
  });
  rest(8, 38.6, 40.55);
  countdown(38.71, 40.71);

  // =====================================================================
  // CENA 9 — qual a cor?
  // =====================================================================
  WB.newPage(9, 0, 0.05);
  W(9, 40.85, 42.5, 'qual a COR dele?', 540, 400, 100, INK.black);
  const palF = fill('path', { d: `M 300 900 Q 300 640 560 640 Q 800 640 800 860 Q 800 960 700 940 Q 610 925 620 1010 Q 640 1120 520 1120 Q 300 1120 300 900 Z`, fill: '#f2dfb8' });
  const pal = [sp(`M 300 900 Q 300 640 560 640 Q 800 640 800 860 Q 800 960 700 940 Q 610 925 620 1010 Q 640 1120 520 1120 Q 300 1120 300 900 Z`, INK.black, 7)];
  D(9, 41.0, 41.6, pal); WB.fillAfter(palF, pal, 0.2);
  [[400, 860, INK.red], [480, 740, '#f2c300'], [610, 730, INK.blue], [710, 810, INK.green], [420, 1000, INK.purple]].forEach(([x, y, c], i) => {
    const f = fill('circle', { cx: x, cy: y, r: 38, fill: c });
    const o = [sp(WB.circlePath(x, y, 38), INK.black, 4)];
    D(9, 41.65 + i * 0.12, 41.75 + i * 0.12, o); WB.fillAfter(f, o, 0.1);
  });
  rest(9, 42.6, 44.2);
  countdown(42.55, 44.35);

  // =====================================================================
  // CENAS 10 e 11 — a revelação: elefante cinza na Dinamarca... com frio
  // =====================================================================
  WB.newPage(10, 0, 0.04);
  W(10, 44.5, 45.2, 'PRONTO...', 540, 330, 100, INK.purple);
  const EX = 430, EY = 900;            // centro do corpo do elefante
  const eleG = WB.group();
  const corpoF = fill('path', { d: ell(EX, EY, 210, 140), fill: CINZA }, eleG);
  const pernasD = [-150, -75, 45, 120].map(dx => `M ${EX + dx} ${EY + 80} L ${EX + dx} ${EY + 240} L ${EX + dx + 52} ${EY + 240} L ${EX + dx + 52} ${EY + 80}`);
  const pernasF = pernasD.map(d => fill('path', { d: d + ' Z', fill: CINZA }, eleG));
  const orelhaF = fill('path', { d: ell(EX + 130, EY - 50, 62, 88), fill: CINZA2 }, eleG);
  const orelha = [sp(ell(EX + 130, EY - 50, 62, 88), INK.black, 6, eleG)];
  const cabF = fill('circle', { cx: EX + 215, cy: EY - 70, r: 100, fill: CINZA }, eleG);
  const corpo = [sp(ell(EX, EY, 210, 140), INK.black, 7, eleG)];
  const pernas = pernasD.map(d => sp(d, INK.black, 7, eleG));
  const cab = [sp(WB.circlePath(EX + 215, EY - 70, 100), INK.black, 7, eleG)];
  const tromba = [sp(`M ${EX + 290} ${EY - 20} Q ${EX + 350} ${EY + 80} ${EX + 315} ${EY + 170} Q ${EX + 305} ${EY + 205} ${EX + 345} ${EY + 200}`, INK.black, 22, eleG),
    sp(`M ${EX + 290} ${EY - 20} Q ${EX + 350} ${EY + 80} ${EX + 315} ${EY + 170} Q ${EX + 305} ${EY + 205} ${EX + 345} ${EY + 200}`, CINZA, 12, eleG)];
  const olhoF = fill('circle', { cx: EX + 250, cy: EY - 105, r: 10, fill: INK.black }, eleG);
  const rabo = [sp(`M ${EX - 205} ${EY - 30} Q ${EX - 245} ${EY + 10} ${EX - 238} ${EY + 60}`, INK.black, 6, eleG)];
  D(10, 46.3, 46.65, corpo); WB.fillAfter(corpoF, corpo, 0.15);
  D(10, 46.65, 46.9, pernas); pernasF.forEach(f => WB.fillAfter(f, pernas, 0.15));
  D(10, 46.9, 47.1, orelha); WB.fillAfter(orelhaF, orelha, 0.15);
  D(10, 47.1, 47.3, cab); WB.fillAfter(cabF, cab, 0.15);
  D(10, 47.3, 47.55, tromba); WB.fillAfter(olhoF, tromba, 0.1);
  D(10, 47.55, 47.65, rabo);
  W(10, 47.15, 48.0, 'elefante CINZA', 540, 1330, 92, INK.gray);
  // bandeira da Dinamarca num mastro (vermelha com a cruz nórdica branca)
  const BX = 700, BY = 470, BW = 260, BH = 190;
  const mastro = [sp(`M ${BX} ${BY - 10} L ${BX} ${BY + 330}`, INK.black, 8)];
  const bandF = fill('rect', { x: BX, y: BY, width: BW, height: BH, fill: '#c8102e' });
  const cruzF = [fill('rect', { x: BX + 75, y: BY, width: 34, height: BH, fill: '#ffffff' }),
    fill('rect', { x: BX, y: BY + BH / 2 - 17, width: BW, height: 34, fill: '#ffffff' })];
  const band = [sp(WB.roughRect(BX, BY, BX + BW, BY + BH), INK.black, 6)];
  D(10, 48.0, 48.15, mastro);
  D(10, 48.15, 48.5, band); WB.fillAfter(bandF, band, 0.12); cruzF.forEach(f => WB.fillAfter(f, band, 0.2));
  W(10, 48.2, 48.95, 'na DINAMARCA!', 540, 1450, 104, INK.red);
  W(10, 49.15, 49.8, 'acertei?', 540, 1570, 80, INK.purple);

  // cena 11: mas peraí... um elefante na Dinamarca? (tremendo de frio)
  W(11, 50.1, 50.95, 'mas peraí...', 300, 470, 72, INK.gray);
  const flocos = [[160, 640], [250, 1150], [880, 760], [930, 1150], [120, 1010], [600, 600]];
  flocos.forEach(([x, y], i) => D(11, 51.0 + i * 0.12, 51.12 + i * 0.12,
    [sp(`M ${x - 22} ${y} L ${x + 22} ${y} M ${x - 11} ${y - 19} L ${x + 11} ${y + 19} M ${x + 11} ${y - 19} L ${x - 11} ${y + 19}`, INK.blue, 5)]));
  const cachecol = [sp(`M ${EX + 130} ${EY + 5} Q ${EX + 190} ${EY + 45} ${EX + 250} ${EY + 15}`, INK.red, 24),
    sp(`M ${EX + 150} ${EY + 20} L ${EX + 135} ${EY + 120}`, INK.red, 20)];
  D(11, 51.75, 52.1, cachecol);
  W(11, 51.7, 52.4, 'brrr', 210, 760, 70, INK.blue);
  W(11, 52.45, 53.5, 'o que ele faz LÁ?!', 540, 1690, 84, INK.orange);
  rest(11, 53.55, 53.85);
  // tremedeira
  WB.effect(t => {
    const k = clamp((t - M(51.3)) / 0.3) * (1 - clamp((t - S[11].start) / 0.2));
    eleG.setAttribute('transform', `translate(${r1(Math.sin(t * 55) * 5 * k)} 0)`);
  });

  // =====================================================================
  // CENA 12 — CTA + loop (sem fala)
  // =====================================================================
  WB.newPage(12, 0, 0.04);
  W(12, 54.0, 54.5, 'ACERTEI?', 540, 360, 120, INK.purple);
  W(12, 54.5, 54.9, 'comenta!', 540, 480, 84, INK.green);
  WB.ctaRedes(12, fr(12, 54.9), fr(12, 55.8), { y: 560, titulo: '', iconSize: 150 });
  W(12, 55.8, 56.3, 'VOLTA', 540, 1250, 130, INK.orange);
  W(12, 56.3, 57.2, 'e pensa em OUTRO número', 540, 1380, 72, INK.red);
  rest(12, 57.25, 57.5);

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
    const SPOTS = [[770, 1810], [270, 200], [310, 1810]];
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
