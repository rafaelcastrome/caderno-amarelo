// "Teu olho pinta a praia" (Caderno Amarelo, 12/11/2026, thread 57). Primo da bandeira_pinta.
// Desenho de praia do Rio em CINZA desde o quadro 0. Na encarada ele vira o negativo das cores
// (inverso RGB, como a bandeira invertida). No "Agora!" volta o CINZA de uma vez, com o ponto no mesmo
// lugar: a pós-imagem pinta o desenho cinza com as cores certas (céu azul, mar, bandeira verde e amarela).
// "Mexe o olho... sumiu!" -> sempre foi cinza. Loop: "volta e não pisca" -> "esse desenho é preto e branco".
window.CENAS = function (WB) {
  const { INK, C, clamp } = WB;
  const S = WB.scenes;
  const st = c => S[c - 1].start, en = c => S[c - 1].end;
  const fala = c => S[c - 1].fala ?? (en(c) - st(c));
  const fr = (c, t) => (t - st(c)) / (en(c) - st(c));
  const tf = (c, k) => st(c) + k * fala(c);
  const D = (c, k0, k1, s) => WB.draw(c, fr(c, tf(c, k0)), fr(c, tf(c, k1)), s);
  const W = (c, k0, k1, txt, x, y, size, cor, o = {}) =>
    WB.write(c, fr(c, tf(c, k0)), fr(c, tf(c, k1)), txt, x, y, size, cor, { anchor: 'middle', ...o });
  const sp = (d, cor = INK.black, w = 7, parent) => WB.strokePath(d, cor, w, parent);
  const fill = (tag, attrs, parent) => WB.mk(tag, { 'fill-opacity': 0, stroke: 'none', ...attrs }, parent);
  const rest = (c, t0, t1) => WB.restHand(c, fr(c, t0), fr(c, t1));

  const ENCARA = st(2) + 0.25;           // o desenho vira o negativo
  const AGORA = st(4);                   // volta o cinza de uma vez
  const MEXE = tf(5, 0.30);              // "mexe o olho": some o ponto
  const VOLTA = st(6);                   // o @ volta

  // ---------- paletas ----------
  // cinza = luminância (L* do Lab) de cada cor real, clareando um pouco as escuras;
  // negativo = 255 - cor real (mesmo esquema da bandeira invertida).
  const CINZA = { ceu: '#acacac', sol: '#d8d8d8', morro: '#898989', mar: '#767676', areia: '#cdcdcd',
    tronco: '#6e6e6e', folha: '#898989', guarda: '#7b7b7b', verde: '#878787', amarelo: '#dfdfdf', azul: '#4a4a4a' };
  const NEG = { ceu: '#b04c00', sol: '#002bff', morro: '#e061c5', mar: '#f59d36', areia: '#0d36b3',
    tronco: '#72a5d4', folha: '#d162c5', guarda: '#1ac6ca', verde: '#ff63c4', amarelo: '#0020ff', azul: '#ffd889' };

  // ---------- geometria do desenho (cartão-postal) ----------
  const PX0 = 90, PY0 = 380, PX1 = 990, PY1 = 1260, HOR = 860, PRAIA = 1060;
  const DOT = { x: 540, y: 905 };
  const FORMAS = [
    ['ceu', 'rect', { x: PX0, y: PY0, width: PX1 - PX0, height: HOR - PY0 }],
    ['sol', 'circle', { cx: 840, cy: 500, r: 72 }],
    ['morro', 'path', { d: `M ${PX0} ${HOR} L ${PX0} 770 C 150 690 200 600 275 590 C 350 582 392 690 425 765 C 445 810 462 840 478 ${HOR} Z` }],
    ['morro', 'path', { d: `M 470 ${HOR} C 520 800 560 735 612 728 C 664 722 698 795 728 ${HOR} Z` }],
    ['mar', 'rect', { x: PX0, y: HOR, width: PX1 - PX0, height: PRAIA - HOR }],
    ['areia', 'rect', { x: PX0, y: PRAIA, width: PX1 - PX0, height: PY1 - PRAIA }],
    ['tronco', 'path', { d: 'M 178 1245 C 168 1150 176 1040 218 958 L 244 968 C 206 1052 204 1150 214 1245 Z' }],
    ['folha', 'path', { d: 'M 232 962 C 180 900 120 905 100 935 C 150 925 190 935 232 962 Z' }],
    ['folha', 'path', { d: 'M 232 962 C 205 880 150 850 112 860 C 165 880 200 915 232 962 Z' }],
    ['folha', 'path', { d: 'M 232 962 C 250 880 300 850 345 862 C 295 882 262 915 232 962 Z' }],
    ['folha', 'path', { d: 'M 232 962 C 290 915 350 925 372 960 C 320 945 278 945 232 962 Z' }],
    ['folha', 'path', { d: 'M 232 962 C 228 900 240 850 262 830 C 255 880 248 920 232 962 Z' }],
    ['guarda', 'path', { d: 'M 650 1120 Q 770 990 890 1120 Z' }],
    ['verde', 'rect', { x: 452, y: 1010, width: 180, height: 122 }],
    ['amarelo', 'path', { d: 'M 466 1071 L 542 1022 L 618 1071 L 542 1120 Z' }],
    ['azul', 'circle', { cx: 542, cy: 1071, r: 30 }],
  ];
  // contornos (iguais nas duas versões, pra pós-imagem encaixar)
  const CONTORNOS = [
    [WB.roughRect(PX0, PY0, PX1, PY1), 8],
    [WB.circlePath(840, 500, 72), 5],
    [`M ${PX0} 770 C 150 690 200 600 275 590 C 350 582 392 690 425 765 C 445 810 462 840 478 ${HOR}`, 5],
    [`M 470 ${HOR} C 520 800 560 735 612 728 C 664 722 698 795 728 ${HOR}`, 5],
    ['M 275 592 L 612 730', 3],                                  // bondinho
    [`M ${PX0} ${HOR} L ${PX1} ${HOR}`, 5],
    [`M ${PX0} ${PRAIA} L ${PX1} ${PRAIA}`, 5],
    ['M 700 930 q 25 -14 50 0 q 25 14 50 0', 4], ['M 820 1000 q 25 -14 50 0 q 25 14 50 0', 4],
    ['M 300 1010 q 25 -14 50 0 q 25 14 50 0', 4],
    ['M 178 1245 C 168 1150 176 1040 218 958 L 244 968 C 206 1052 204 1150 214 1245', 5],
    ['M 232 962 C 180 900 120 905 100 935 C 150 925 190 935 232 962', 4],
    ['M 232 962 C 205 880 150 850 112 860 C 165 880 200 915 232 962', 4],
    ['M 232 962 C 250 880 300 850 345 862 C 295 882 262 915 232 962', 4],
    ['M 232 962 C 290 915 350 925 372 960 C 320 945 278 945 232 962', 4],
    ['M 232 962 C 228 900 240 850 262 830 C 255 880 248 920 232 962', 4],
    ['M 650 1120 Q 770 990 890 1120 Z', 5], ['M 770 1058 L 770 1240', 7],
    [WB.roughRect(452, 1010, 632, 1132), 5], ['M 452 1010 L 452 1248', 7],
    ['M 466 1071 L 542 1022 L 618 1071 L 542 1120 Z', 4], [WB.circlePath(542, 1071, 30), 4],
  ];
  function desenho(parent, pal) {
    const g = WB.group(parent);
    for (const [k, tag, a] of FORMAS) WB.mk(tag, { ...a, fill: pal[k], stroke: 'none' }, g);
    // bondinho
    WB.mk('rect', { x: 430, y: 642, width: 34, height: 26, rx: 5, fill: pal === NEG ? '#ffffff' : '#3a3a3a', stroke: 'none' }, g);
    return g;
  }

  // ---------- contagem regressiva ----------
  function countdown(t0, t1, x, y, size = 120, parent) {
    const n = Math.max(1, Math.round(t1 - t0));
    const g = WB.group(parent);
    const nums = [];
    for (let k = 1; k <= n; k++) {
      const gk = WB.group(g);
      WB.showNow(WB.textStrokes(String(k), x, y, size, INK.gray, gk, 'middle').strokes);
      gk.setAttribute('opacity', 0);
      nums.push(gk);
    }
    const step = (t1 - t0) / n;
    WB.effect(t => {
      const v = (t >= t0 && t < t1) ? Math.ceil((t1 - t) / step) : 0;
      nums.forEach((gk, i) => gk.setAttribute('opacity', i + 1 === v ? 1 : 0));
    });
  }

  // ---------- página 1: o desenho (cinza desde o quadro 0) ----------
  const pg = WB.group();
  desenho(pg, CINZA);
  const neg = desenho(pg, NEG);
  neg.setAttribute('opacity', 0);
  const lin = WB.group(pg);
  WB.showNow(CONTORNOS.map(([d, w]) => sp(d, '#141414', w, lin)));
  // negativo entra rápido no começo da encarada e some de uma vez no "Agora!"
  WB.effect(t => {
    const o = t < ENCARA ? 0 : t < AGORA ? clamp((t - ENCARA) / 0.5) : 0;
    neg.setAttribute('opacity', o.toFixed(3));
  });

  // gancho no topo desde o quadro 0
  const hook = WB.group(WB.overlay);
  WB.showNow(WB.textStrokes('esse desenho é', 540, 140, 78, INK.black, hook, 'middle').strokes);
  const pb = WB.textStrokes('PRETO E BRANCO', 540, 262, 112, INK.black, hook, 'middle');
  WB.showNow(pb.strokes);
  WB.showNow(sp(WB.wavyLine(540 - pb.width / 2, 540 + pb.width / 2, 292, 5, 40), INK.red, 5, hook));
  WB.effect(t => hook.setAttribute('opacity', (1 - clamp((t - ENCARA) / 0.3)).toFixed(3)));

  // cena 1: "mas tu vai ver ele colorido... dentro do teu olho"
  const t1g = WB.group(pg);
  W(1, 0.30, 0.62, 'mas tu vai ver', 540, 1370, 76, INK.gray, { parent: t1g });
  const cols = ['#e53935', '#f39c12', '#1f9e3a', '#1e6fd9', '#8e44ad', '#e53935', '#f39c12', '#1f9e3a'];
  const word = 'COLORIDO';
  const letters = [];
  let lx = 540 - 4 * 74 + 37;
  for (let i = 0; i < word.length; i++) {
    letters.push(WB.textStrokes(word[i], lx + i * 74, 1500, 120, cols[i], t1g, 'middle').strokes);
  }
  D(1, 0.62, 0.86, letters);
  W(1, 0.88, 1.0, 'no teu olho!', 540, 1610, 70, INK.purple, { parent: t1g });
  rest(1, tf(1, 1.0), en(1));
  WB.effect(t => t1g.setAttribute('opacity', t < ENCARA ? 1 : 0));

  // ponto preto (camada fixa) da cena 2 até "mexe o olho"
  const dotG = WB.group(WB.overlay);
  WB.mk('circle', { cx: DOT.x, cy: DOT.y, r: 15, fill: '#000', stroke: '#fff', 'stroke-width': 3 }, dotG);
  WB.effect(t => {
    const o = t < st(2) ? 0 : t < st(2) + 0.2 ? clamp((t - st(2)) / 0.2) : t < MEXE ? 1 : 1 - clamp((t - MEXE) / 0.25);
    dotG.setAttribute('opacity', o.toFixed(3));
  });

  // cena 2-3: encarada
  const enc = WB.group(pg);
  W(2, 0.40, 0.62, 'NÃO PISCA!', 540, 1385, 104, INK.red, { parent: enc });
  countdown(tf(2, 0.65), AGORA, 540, 1545, 130, enc);
  rest(2, tf(2, 0.64), AGORA - 0.1);
  WB.effect(t => enc.setAttribute('opacity', t < AGORA ? 1 : 0));

  // cena 5: sumiu!
  const sm = WB.group(pg);
  W(5, 0.34, 0.55, 'sumiu!', 540, 1400, 110, INK.purple, { parent: sm });
  const car = C.stamp('SEMPRE FOI CINZA', 540, 1560, { size: 84, color: INK.red, rot: -6 });
  D(5, 0.62, 0.98, [car.box, car.text]);
  rest(5, tf(5, 1.0), en(5));

  // ---------- cena 6: quem pintou foi o teu cérebro ----------
  WB.newPage(6, 0.0, 0.05);
  W(6, 0.06, 0.32, 'quem pintou', 540, 430, 92, INK.black);
  W(6, 0.33, 0.50, 'foi o TEU CÉREBRO', 540, 545, 92, INK.red);
  // pares: encarou -> viu
  W(6, 0.52, 0.60, 'encarou', 330, 720, 60, INK.gray);
  W(6, 0.52, 0.60, 'viu', 760, 720, 60, INK.gray);
  const pares = [['#b04c00', '#4fb3ff'], ['#0d36b3', '#f2c94c'], ['#ff63c4', '#009c3b']];
  pares.forEach(([a, b], i) => {
    const y = 790 + i * 190, k0 = 0.60 + i * 0.12;
    const r1 = [sp(WB.roughRect(250, y, 410, y + 130), INK.black, 6)];
    const r2 = [sp(WB.roughRect(680, y, 840, y + 130), INK.black, 6)];
    const f1 = fill('rect', { x: 250, y, width: 160, height: 130, fill: a });
    const f2 = fill('rect', { x: 680, y, width: 160, height: 130, fill: b });
    D(6, k0, k0 + 0.04, r1); WB.fillAfter(f1, r1, 0.12);
    D(6, k0 + 0.04, k0 + 0.07, sp(`M 450 ${y + 65} L 630 ${y + 65}`, INK.black, 6));
    D(6, k0 + 0.07, k0 + 0.08, sp(`M 600 ${y + 40} L 635 ${y + 65} L 600 ${y + 90}`, INK.black, 6));
    D(6, k0 + 0.08, k0 + 0.12, r2); WB.fillAfter(f2, r2, 0.12);
  });
  W(6, 0.98, 1.08, 'cansou → mostra o contrário', 540, 1450, 58, INK.purple);

  // ---------- cena 7: o buraco no olho (ponto cego) ----------
  WB.newPage(7, 0.0, 0.05);
  W(7, 0.08, 0.28, 'e tem um BURACO', 540, 440, 96, INK.black);
  W(7, 0.29, 0.40, 'no teu olho', 540, 550, 84, INK.black);
  const EX = 540, EY = 900;
  const olho = [sp(`M 230 ${EY} Q ${EX} 640 850 ${EY} Q ${EX} 1160 230 ${EY} Z`, INK.black, 8)];
  const iris = [sp(WB.circlePath(EX, EY, 120), INK.blue, 7)];
  const irisF = fill('circle', { cx: EX, cy: EY, r: 120, fill: '#6fa8dc' });
  const pupF = fill('circle', { cx: EX, cy: EY, r: 52, fill: '#141414' });
  const pup = [sp(WB.circlePath(EX, EY, 52), '#141414', 6)];
  D(7, 0.40, 0.50, olho);
  D(7, 0.50, 0.56, iris); WB.fillAfter(irisF, iris, 0.15);
  D(7, 0.56, 0.60, pup); WB.fillAfter(pupF, pup, 0.15);
  W(7, 0.62, 0.78, 'PONTO CEGO', 540, 1240, 100, INK.red);
  W(7, 0.80, 1.02, 'o cérebro pinta por cima', 540, 1360, 64, INK.purple);
  W(7, 1.02, 1.12, 'e tu nem percebe', 540, 1450, 64, INK.purple);

  // ---------- cena 8: CTA + loop ----------
  WB.newPage(8, 0.0, 0.05);
  W(8, 0.06, 0.25, 'viu colorido?', 540, 470, 100, INK.black);
  W(8, 0.26, 0.36, 'comenta', 540, 600, 72, INK.gray);
  const vi = C.stamp('VI', 330, 790, { size: 120, color: INK.green, rot: -8 });
  const nvi = C.stamp('NÃO VI', 740, 790, { size: 100, color: INK.red, rot: 7 });
  D(8, 0.37, 0.50, [vi.box, vi.text]);
  D(8, 0.52, 0.66, [nvi.box, nvi.text]);
  W(8, 0.70, 0.88, 'não viu? VOLTA', 540, 1080, 96, INK.purple);
  W(8, 0.89, 1.02, 'e dessa vez... não pisca!', 540, 1200, 76, INK.red);
  rest(8, tf(8, 1.05), en(8));

  // ---------- @ que anda (some na encarada, no "Agora" e no "sumiu") ----------
  const wm = WB.group(WB.overlay);
  WB.showNow(WB.textStrokes('@Cardeno_Amarelo', 0, 0, 46, INK.gray, wm, 'middle').strokes);
  WB.effect(t => {
    const x = 540 + 230 * Math.sin(t * 0.42);
    const y = 1760 + 60 * Math.sin(t * 0.61 + 1);
    wm.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    let o = 0.55;
    if (t > ENCARA - 0.4 && t < VOLTA) o = 0.55 * (1 - clamp((t - (ENCARA - 0.4)) / 0.4));
    else if (t >= VOLTA) o = 0.55 * clamp((t - VOLTA) / 0.5);
    wm.setAttribute('opacity', o.toFixed(3));
  });
};
