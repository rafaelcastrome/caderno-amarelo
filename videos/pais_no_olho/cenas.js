// "A resposta aparece no teu olho" (desafio, Caderno Amarelo, 03/11/2026, thread 28).
// Junta os dois que mais deram view: a continha do elefante (força um país) + a pós-imagem da bandeira.
// (2n + 20) / 2 - n = 10 -> J -> Japão. A bandeira do Japão aparece com as cores invertidas
// (preto + bolinha ciano); ~12 s encarando o ponto e a folha fica vazia: o olho vê a bolinha vermelha.
// Gancho no topo desde o quadro 0. @ d'água anda pelo rodapé (some na encarada e na pós-imagem).
window.CENAS = function (WB) {
  const { INK, C, clamp } = WB;
  const S = WB.scenes;
  const st = c => S[c - 1].start, en = c => S[c - 1].end;
  const fala = c => S[c - 1].fala ?? (en(c) - st(c));
  const fr = (c, t) => (t - st(c)) / (en(c) - st(c));
  const tf = (c, k) => st(c) + k * fala(c);          // k = fração da FALA
  const D = (c, k0, k1, s) => WB.draw(c, fr(c, tf(c, k0)), fr(c, tf(c, k1)), s);
  const W = (c, k0, k1, txt, x, y, size, cor, o = {}) =>
    WB.write(c, fr(c, tf(c, k0)), fr(c, tf(c, k1)), txt, x, y, size, cor, { anchor: 'middle', ...o });
  const sp = (d, cor = INK.black, w = 7, parent) => WB.strokePath(d, cor, w, parent);
  const fill = (tag, attrs, parent) => WB.mk(tag, { 'fill-opacity': 0, stroke: 'none', ...attrs }, parent);
  const rest = (c, t0, t1) => WB.restHand(c, fr(c, t0), fr(c, t1));

  const ENCARA = st(10);                 // começa a encarada (some o gancho e o @)
  const AGORA = st(11);                  // "Agora!": a folha fica vazia
  const VOLTA = st(12);                  // o @ volta

  // contagem regressiva (números prontos, só troca a opacidade)
  function countdown(t0, t1, x, y, size = 110, parent) {
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

  // ---------- camada fixa: gancho (some na encarada) ----------
  const hook = WB.group(WB.overlay);
  WB.showNow(WB.textStrokes('a resposta vai aparecer', 540, 125, 78, INK.black, hook, 'middle').strokes);
  const not = WB.textStrokes('NO TEU OLHO', 540, 235, 104, INK.red, hook, 'middle');
  WB.showNow(not.strokes);
  WB.showNow(sp(WB.wavyLine(540 - not.width / 2, 540 + not.width / 2, 262, 5, 40), INK.red, 5, hook));
  WB.effect(t => hook.setAttribute('opacity', (1 - clamp((t - ENCARA) / 0.4)).toFixed(3)));

  // ---------- @ que anda ----------
  const wm = WB.group(WB.overlay);
  WB.showNow(WB.textStrokes('@Cardeno_Amarelo', 0, 0, 46, INK.gray, wm, 'middle').strokes);
  const fimWm = st(14) + 0.3;
  WB.effect(t => {
    const x = 540 + 230 * Math.sin(t * 0.42);
    const y = 1690 + 70 * Math.sin(t * 0.61 + 1);
    wm.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    let o = 0.55;
    if (t > ENCARA - 0.4 && t < VOLTA) o = 0.55 * (1 - clamp((t - (ENCARA - 0.4)) / 0.4));
    else if (t >= VOLTA) o = 0.55 * clamp((t - VOLTA) / 0.5);
    if (t > fimWm) o = Math.max(0, 0.55 - (t - fimWm) * 2);
    wm.setAttribute('opacity', o.toFixed(3));
  });

  // ---------- CENA 1: olho com "?" ----------
  const EX = 540, EY = 800;
  const olho = [
    sp(`M ${EX - 300} ${EY} Q ${EX} ${EY - 250} ${EX + 300} ${EY} Q ${EX} ${EY + 250} ${EX - 300} ${EY}`, INK.black, 9),
    sp(WB.circlePath(EX, EY, 105), INK.blue, 8),
  ];
  const pupila = fill('circle', { cx: EX, cy: EY, r: 46, fill: INK.black });
  D(1, 0.04, 0.30, olho); WB.fillAfter(pupila, olho, 0.15);
  D(1, 0.32, 0.42, sp(`M ${EX - 250} ${EY - 165} L ${EX - 290} ${EY - 225} M ${EX - 130} ${EY - 205} L ${EX - 145} ${EY - 275} M ${EX} ${EY - 215} L ${EX} ${EY - 290} M ${EX + 130} ${EY - 205} L ${EX + 145} ${EY - 275} M ${EX + 250} ${EY - 165} L ${EX + 290} ${EY - 225}`, INK.black, 7));
  W(1, 0.45, 0.62, 'qual país?', 540, 1180, 96, INK.purple);
  const du = C.stamp('DENTRO DO OLHO', 540, 1380, { size: 84, color: INK.red, rot: -5 });
  D(1, 0.66, 0.92, [du.box, du.text]);
  WB.restHand(1, 0.94, 1.0);

  // ---------- CENAS 2-6: a continha ----------
  WB.newPage(2, 0.0, 0.07);
  const passo = (c, n, txt, y, cor = INK.black, k0 = 0.05, k1 = 0.75) => {
    D(c, k0, k0 + 0.12, [
      sp(WB.circlePath(150, y - 28, 46), INK.blue, 6),
      WB.textStrokes(String(n), 150, y - 6, 66, INK.blue, null, 'middle').strokes,
    ]);
    W(c, k0 + 0.14, k1, txt, 230, y, 84, cor, { anchor: 'start' });
  };
  // 2: número de 1 a 10 (cabeça com balão)
  passo(2, 1, 'pensa: 1 a 10', 470, INK.black, 0.05, 0.55);
  D(2, 0.58, 0.85, C.check(860, 440, 50, INK.green));
  rest(2, tf(2, 0.9), en(2));
  passo(3, 2, '× 2', 620, INK.black, 0.0, 0.7);
  passo(4, 3, '+ 20', 770, INK.black, 0.0, 0.7);
  passo(5, 4, '÷ 2', 920, INK.black, 0.0, 0.7);
  passo(6, 5, '− o que pensou', 1070, INK.red, 0.03, 0.8);
  [3, 4, 5, 6].forEach(c => {
    rest(c, tf(c, 1.0), tf(c, 1.0) + 0.3);
    countdown(tf(c, 1.0) + 0.05, en(c) - 0.05, 900, 300 + 150 * (c - 1) + 30, 80);
  });

  // ---------- CENA 7: número vira letra (tabela) ----------
  const LET = 'ABCDEFGHIJKL';
  const TX0 = 165, TDX = 150, TY = [1260, 1470];
  D(7, 0.0, 0.06, sp(WB.roughLine(90, 1150, 990, 1150, 2), INK.gray, 4));
  for (let r = 0; r < 2; r++) {
    const cells = [];
    for (let k = 0; k < 6; k++) {
      const i = r * 6 + k, x = TX0 + k * TDX;
      cells.push(WB.textStrokes(LET[i], x, TY[r], 76, INK.black, null, 'middle').strokes);
      cells.push(WB.textStrokes(String(i + 1), x, TY[r] + 66, 48, INK.gray, null, 'middle').strokes);
    }
    D(7, 0.08 + r * 0.44, 0.48 + r * 0.44, cells);
  }
  rest(7, tf(7, 0.96), en(7));
  countdown(tf(7, 1.0) + 0.05, en(7) - 0.05, 900, 1080, 70);

  // ---------- CENA 8-9: país com essa letra ----------
  WB.newPage(8, 0.0, 0.08);
  const GX = 540, GY = 760, GR = 230;
  D(8, 0.10, 0.40, [
    sp(WB.circlePath(GX, GY, GR), INK.blue, 8),
    sp(`M ${GX - GR} ${GY} Q ${GX} ${GY + 40} ${GX + GR} ${GY}`, INK.blue, 5),
    sp(`M ${GX} ${GY - GR} Q ${GX - 120} ${GY} ${GX} ${GY + GR} M ${GX} ${GY - GR} Q ${GX + 120} ${GY} ${GX} ${GY + GR}`, INK.blue, 5),
  ]);
  D(8, 0.42, 0.60, [
    sp(`M ${GX - 150} ${GY - 120} Q ${GX - 60} ${GY - 170} ${GX - 20} ${GY - 90} Q ${GX - 70} ${GY - 20} ${GX - 150} ${GY - 50} Z`, INK.green, 6),
    sp(`M ${GX + 40} ${GY + 30} Q ${GX + 150} ${GY} ${GX + 170} ${GY + 90} Q ${GX + 100} ${GY + 170} ${GX + 50} ${GY + 110} Z`, INK.green, 6),
  ]);
  W(8, 0.62, 0.88, 'um PAÍS com', 540, 1150, 92, INK.black);
  W(8, 0.90, 1.12, 'essa letra', 540, 1250, 92, INK.black);
  const rap = C.stamp('RÁPIDO!', 820, 470, { size: 80, color: INK.red, rot: 8 });
  WB.draw(8, fr(8, tf(8, 1.0) + 0.05), fr(8, tf(8, 1.0) + 0.55), [rap.box, rap.text]);
  rest(8, tf(8, 1.0) + 0.6, en(8));
  W(9, 0.05, 0.45, 'não vou falar...', 540, 1420, 70, INK.gray);
  W(9, 0.50, 0.95, 'vou botar no teu olho', 540, 1520, 76, INK.purple);

  // ---------- CENA 10: a bandeira invertida + encarada ----------
  // Japão 3:2, bolinha com 3/5 da altura. Invertida: branco -> preto, vermelho #bc002d -> ciano #43ffd2.
  WB.newPage(10, 0.0, 0.03);
  const pg = WB.group();
  const FW = 870, FH = 580, FX0 = 540 - FW / 2, FY0 = 560, FX1 = FX0 + FW, FY1 = FY0 + FH;
  const CX = 540, CY = FY0 + FH / 2, R = FH * 0.3;
  const flag = WB.group(pg);
  const rectF = fill('rect', { x: FX0, y: FY0, width: FW, height: FH, fill: '#0d0d0d' }, flag);
  const circF = fill('circle', { cx: CX, cy: CY, r: R, fill: '#43ffd2' }, flag);
  const rectO = [sp(WB.roughRect(FX0, FY0, FX1, FY1), INK.black, 7, flag)];
  const circO = [sp(WB.circlePath(CX, CY, R), INK.black, 5, flag)];
  WB.draw(10, 0.04, 0.10, rectO); WB.fillAfter(rectF, rectO, 0.15);
  WB.draw(10, 0.11, 0.15, circO); WB.fillAfter(circF, circO, 0.15);
  // ponto preto no meio (fica na camada fixa até a pós-imagem acabar)
  const dotG = WB.group(WB.overlay);
  const dotF = fill('circle', { cx: CX, cy: CY, r: 13, fill: '#000' }, dotG);
  const dotO = [sp(WB.circlePath(CX, CY, 9), '#000', 8, dotG)];
  WB.draw(10, 0.16, 0.18, dotO); WB.fillAfter(dotF, dotO, 0.05);
  WB.effect(t => dotG.setAttribute('opacity', t < en(11) - 0.3 ? 1 : 1 - clamp((t - (en(11) - 0.3)) / 0.3)));
  W(10, 0.45, 0.75, 'NÃO PISCA!', 540, 1330, 100, INK.red, { parent: pg });
  rest(10, tf(10, 0.78), AGORA - 0.1);
  countdown(tf(10, 0.3), AGORA, 540, 1490, 120, pg);
  WB.effect(t => pg.setAttribute('opacity', t < AGORA ? 1 : 0));

  // ---------- CENA 12: É o Japão! ----------
  const JW = 600, JH = 400, JX0 = 540 - JW / 2, JY0 = 520;
  const jR = [sp(WB.roughRect(JX0, JY0, JX0 + JW, JY0 + JH), INK.black, 6)];
  const jC = [sp(WB.circlePath(540, JY0 + JH / 2, JH * 0.3), '#bc002d', 6)];
  const jCF = fill('circle', { cx: 540, cy: JY0 + JH / 2, r: JH * 0.3, fill: '#bc002d' });
  WB.draw(12, 0.02, 0.18, jR);
  WB.draw(12, 0.20, 0.32, jC); WB.fillAfter(jCF, jC, 0.15);
  W(12, 0.33, 0.62, 'JAPÃO!', 540, 1120, 140, INK.red);
  W(12, 0.66, 0.95, 'acertei?', 540, 1250, 84, INK.purple);
  D(12, 1.0, 1.15, C.check(800, 1215, 50, INK.green));

  // ---------- CENA 13: o fato uau ----------
  WB.newPage(13, 0.0, 0.06);
  W(13, 0.08, 0.30, 'o Brasil tem a maior', 540, 460, 76, INK.black);
  W(13, 0.31, 0.55, 'comunidade japonesa', 540, 560, 84, INK.red);
  W(13, 0.56, 0.72, 'fora do Japão', 540, 660, 76, INK.black);
  // mini bandeiras: Brasil ❤ Japão
  const bx = 330, by = 900;
  const bR = [sp(WB.roughRect(bx - 140, by - 95, bx + 140, by + 95), INK.green, 6)];
  const bL = [sp(`M ${bx - 115} ${by} L ${bx} ${by - 75} L ${bx + 115} ${by} L ${bx} ${by + 75} L ${bx - 115} ${by}`, '#d4a800', 6)];
  const bC = [sp(WB.circlePath(bx, by, 42), INK.blue, 6)];
  const bRF = fill('rect', { x: bx - 140, y: by - 95, width: 280, height: 190, fill: '#009c3b' });
  const bLF = fill('path', { d: `M ${bx - 115} ${by} L ${bx} ${by - 75} L ${bx + 115} ${by} L ${bx} ${by + 75} Z`, fill: '#ffdf00' });
  const bCF = fill('circle', { cx: bx, cy: by, r: 42, fill: '#002776' });
  D(13, 0.73, 0.80, bR); WB.fillAfter(bRF, bR, 0.1);
  D(13, 0.80, 0.85, bL); WB.fillAfter(bLF, bL, 0.1);
  D(13, 0.85, 0.88, bC); WB.fillAfter(bCF, bC, 0.1);
  const jx = 750;
  const j2R = [sp(WB.roughRect(jx - 140, by - 95, jx + 140, by + 95), INK.black, 6)];
  const j2C = [sp(WB.circlePath(jx, by, 57), '#bc002d', 6)];
  const j2CF = fill('circle', { cx: jx, cy: by, r: 57, fill: '#bc002d' });
  D(13, 0.89, 0.94, j2R);
  D(13, 0.94, 0.97, j2C); WB.fillAfter(j2CF, j2C, 0.1);
  const hd = 'M 540 945 C 470 895 470 840 510 835 C 530 833 540 850 540 862 C 540 850 550 833 570 835 C 610 840 610 895 540 945 Z';
  const hO = [sp(hd, INK.red, 6)];
  const hF = fill('path', { d: hd, fill: INK.red });
  D(13, 0.97, 1.0, hO); WB.fillAfter(hF, hO, 0.1);
  W(13, 1.0, 1.06, '~2 milhões!', 540, 1180, 110, INK.purple);

  // ---------- CENA 14: CTA ----------
  WB.newPage(14, 0.0, 0.05);
  WB.write(14, 0.06, 0.22, 'Manda pro amigo', 540, 470, 100, INK.black, { anchor: 'middle' });
  WB.write(14, 0.23, 0.40, 'aparece no olho dele?', 540, 565, 66, INK.gray, { anchor: 'middle' });
  WB.draw(14, 0.41, 0.47, sp('M 700 640 L 900 590 L 780 710 L 760 650 Z M 760 650 L 900 590', INK.blue, 6));
  WB.ctaRedes(14, 0.48, 0.78, { y: 760, titulo: 'e me segue!', iconSize: 190 });
  WB.write(14, 0.80, 0.92, 'volta e pensa em OUTRO número', 540, 1430, 62, INK.purple, { anchor: 'middle' });
};
