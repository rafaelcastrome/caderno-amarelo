// "Gênio da lâmpada: pausa o vídeo e descobre teus 3 desejos de 2027" (vídeo jogável, 03/11/2026, thread 30).
// Ideia do Rafael: o narrador é o gênio, dá 3 desejos; os desejos passam rápido e a pessoa PAUSA o vídeo.
// O que cair é o desejo dela pra 2027, que só se realiza se ela escrever nos comentários.
// Cada rodada tem 8 desejos + 1 DOURADO raro (aparece por pouco tempo, gera "consegui o dourado!").
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
  const GOLD = '#e0a800', GENIE = '#3b82f6', GENIE_D = '#1d4ed8';

  // ---------- gancho fixo desde o quadro 0 ----------
  const hook = WB.group(WB.overlay);
  const h1 = WB.textStrokes('PAUSA O VÍDEO', 540, 135, 104, INK.red, hook, 'middle');
  WB.showNow(h1.strokes);
  WB.showNow(sp(WB.wavyLine(540 - h1.width / 2, 540 + h1.width / 2, 162, 5, 40), INK.red, 5, hook));
  WB.showNow(WB.textStrokes('e descobre teus 3 desejos de 2027', 540, 240, 62, INK.black, hook, 'middle').strokes);
  const FIM = st(6);
  WB.effect(t => hook.setAttribute('opacity', (1 - clamp((t - FIM) / 0.4)).toFixed(3)));

  // ---------- @ que anda ----------
  const wm = WB.group(WB.overlay);
  WB.showNow(WB.textStrokes('@Cardeno_Amarelo', 0, 0, 46, INK.gray, wm, 'middle').strokes);
  const fimWm = st(7) + 0.3;
  WB.effect(t => {
    const x = 540 + 230 * Math.sin(t * 0.42);
    const y = 1700 + 60 * Math.sin(t * 0.61 + 1);
    wm.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    wm.setAttribute('opacity', (t > fimWm ? Math.max(0, 0.55 - (t - fimWm) * 2) : 0.55).toFixed(3));
  });

  // ---------- o gênio (desenhado na cena 1, encolhe pro canto na cena 2) ----------
  const genie = WB.group();
  const gp = (d, cor, w = 7) => sp(d, cor, w, genie);
  const gf = (tag, a) => fill(tag, a, genie);
  // lâmpada
  const lampD = 'M 330 1290 Q 340 1200 540 1195 Q 700 1195 760 1240 L 900 1170 Q 880 1215 800 1280 Q 760 1330 540 1335 Q 360 1335 330 1290 Z';
  const lampF = gf('path', { d: lampD, fill: '#ffcf33' });
  const lamp = [gp(lampD, GOLD, 8), gp('M 430 1335 L 400 1395 L 680 1395 L 650 1335', GOLD, 8),
    gp('M 330 1270 Q 240 1250 250 1200 Q 265 1160 340 1215', GOLD, 7)];
  const baseF = gf('path', { d: 'M 430 1335 L 400 1395 L 680 1395 L 650 1335 Z', fill: '#ffcf33' });
  // fumaça saindo do bico até a cintura
  const smokeD = 'M 890 1175 C 960 1060 760 1030 780 940 C 800 860 650 860 620 820 L 470 820 C 520 900 680 910 660 990 C 640 1080 820 1110 890 1175 Z';
  const smokeF = gf('path', { d: smokeD, fill: '#93c5fd' });
  const smoke = [gp(smokeD, GENIE, 6)];
  // corpo
  const bodyD = 'M 430 830 Q 400 680 450 600 L 630 600 Q 680 680 640 830 Z';
  const bodyF = gf('path', { d: bodyD, fill: GENIE });
  const body = [gp(bodyD, GENIE_D, 7)];
  // braços cruzados
  const armD = 'M 395 690 Q 540 760 685 690 L 690 740 Q 540 800 390 740 Z';
  const armF = gf('path', { d: armD, fill: '#60a5fa' });
  const arm = [gp(armD, GENIE_D, 6)];
  // cabeça
  const headF = gf('circle', { cx: 540, cy: 500, r: 105, fill: '#60a5fa' });
  const head = [gp(WB.circlePath(540, 500, 105), GENIE_D, 7)];
  // turbante + joia
  const turD = 'M 432 450 Q 430 330 540 320 Q 650 330 648 450 Q 540 400 432 450 Z';
  const turF = gf('path', { d: turD, fill: '#a855f7' });
  const tur = [gp(turD, INK.purple, 7), gp('M 540 320 Q 560 270 600 280', INK.purple, 6)];
  const gemF = gf('circle', { cx: 540, cy: 410, r: 20, fill: INK.red });
  const gem = [gp(WB.circlePath(540, 410, 20), INK.red, 5)];
  // rosto: olhos, sobrancelhas, sorriso, bigode
  const face = [
    gp('M 485 485 Q 500 470 515 485 M 565 485 Q 580 470 595 485', INK.black, 7),
    gp('M 475 455 L 515 462 M 565 462 L 605 455', INK.black, 6),
    gp('M 490 545 Q 540 590 590 545', INK.black, 7),
    gp('M 540 525 Q 500 505 470 535 M 540 525 Q 580 505 610 535', INK.black, 6),
  ];
  // brilhos
  const sparks = [gp('M 250 520 L 290 520 M 270 500 L 270 540 M 820 430 L 860 430 M 840 410 L 840 450 M 800 640 L 830 640 M 815 625 L 815 655', GOLD, 6)];
  D(1, 0.02, 0.18, lamp); WB.fillAfter(lampF, lamp, 0.15); WB.fillAfter(baseF, lamp, 0.15);
  D(1, 0.18, 0.30, smoke); WB.fillAfter(smokeF, smoke, 0.15);
  D(1, 0.30, 0.42, body); WB.fillAfter(bodyF, body, 0.15);
  D(1, 0.42, 0.52, head); WB.fillAfter(headF, head, 0.15);
  D(1, 0.52, 0.62, tur); WB.fillAfter(turF, tur, 0.15);
  D(1, 0.62, 0.66, gem); WB.fillAfter(gemF, gem, 0.1);
  D(1, 0.66, 0.80, face);
  D(1, 0.80, 0.86, arm); WB.fillAfter(armF, arm, 0.12);
  D(1, 0.86, 0.95, sparks);
  const leg1 = WB.group();
  W(1, 0.95, 1.15, '3 desejos pra 2027!', 540, 1560, 88, INK.purple, { parent: leg1 });
  // na cena 2 o gênio vai pro canto de baixo à esquerda (fica de "dono" da roleta)
  const G2 = st(2) + 0.15;
  const GS = 0.42, GX = -40, GY = 1080;
  WB.effect(t => {
    const u = WB.ease(clamp((t - G2) / 0.7));
    genie.setAttribute('transform', `translate(${(GX * u).toFixed(1)} ${(GY * u).toFixed(1)}) scale(${(1 - (1 - GS) * u).toFixed(3)})`);
  });
  // a frase "3 desejos" some quando o gênio encolhe
  WB.effect(t => leg1.setAttribute('opacity', (1 - clamp((t - G2) / 0.3)).toFixed(3)));

  // ---------- cena 2: como funciona ----------
  const passos = WB.group();
  W(2, 0.18, 0.45, 'os desejos passam rápido...', 540, 620, 74, INK.black, { parent: passos });
  W(2, 0.50, 0.80, 'e tu PAUSA!', 540, 740, 110, INK.red, { parent: passos });
  // ícone de pause
  D(2, 0.82, 0.98, [sp(WB.roundRectPath(450, 840, 70, 200, 14), INK.black, 8, passos), sp(WB.roundRectPath(560, 840, 70, 200, 14), INK.black, 8, passos)]);
  const p1 = fill('rect', { x: 450, y: 840, width: 70, height: 200, rx: 14, fill: INK.black }, passos);
  const p2 = fill('rect', { x: 560, y: 840, width: 70, height: 200, rx: 14, fill: INK.black }, passos);
  WB.effect(t => { const o = t > tf(2, 0.98) ? 1 : 0; p1.setAttribute('fill-opacity', o); p2.setAttribute('fill-opacity', o); });
  WB.effect(t => passos.setAttribute('opacity', t < st(3) ? 1 : 0));
  rest(2, tf(2, 1.0), en(2));

  // ---------- cenas 3-5: as 3 roletas ----------
  const RODADAS = [
    { titulo: 'DESEJO 1', sub: 'o que tu vai ganhar', cor: INK.green, itens: [
      ['📱', 'iPhone novo'], ['🎮', 'um videogame'], ['🐶', 'um cachorrinho'], ['💰', 'R$ 1 milhão'],
      ['🏍️', 'uma moto'], ['🚗', 'um carro zero'], ['⭐', '1 milhão de seguidores'], ['🏠', 'tua casa própria']],
      ouro: ['✨', 'TODOS os desejos em dobro'] },
    { titulo: 'DESEJO 2', sub: 'o do coração', cor: INK.red, itens: [
      ['💘', 'o crush te pede em namoro'], ['💍', 'um amor de verdade'], ['🤝', 'fazer as pazes com alguém'], ['👯', 'um amigo pra vida toda'],
      ['👨‍👩‍👧', 'a família toda junta'], ['🎤', 'conhecer teu ídolo'], ['😏', 'o ex volta implorando'], ['🐱', 'um gatinho grudento']],
      ouro: ['👑', 'amor E dinheiro juntos'] },
    { titulo: 'DESEJO 3', sub: 'pra onde tu vai', cor: INK.blue, itens: [
      ['🏰', 'Disney'], ['🗼', 'Paris'], ['🏖️', 'praia no Nordeste'], ['🗻', 'Japão'],
      ['🛳️', 'um cruzeiro'], ['❄️', 'ver neve'], ['🏙️', 'Dubai'], ['🎡', 'show do teu ídolo']],
      ouro: ['🌍', 'volta ao mundo'] },
  ];
  const CARD = { x: 140, y: 470, w: 800, h: 760 };
  const PASSO = 0.27, OURO_DUR = 0.18;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function emojiText(ch, x, y, size, parent) {
    const el = WB.mk('text', { x, y, 'font-size': size, 'text-anchor': 'middle', 'font-family': 'Noto Color Emoji' }, parent);
    el.textContent = ch;
    return el;
  }
  function cartao(item, cor, ouro, parent) {
    const g = WB.group(parent);
    if (ouro) WB.mk('rect', { x: CARD.x + 12, y: CARD.y + 150, width: CARD.w - 24, height: CARD.h - 165, rx: 30, fill: '#ffe48a', stroke: 'none' }, g);
    emojiText(item[0], 540, CARD.y + 470, 260, g);
    const linhas = WB.wrap(item[1], 92, CARD.w - 80);
    linhas.forEach((l, i) => WB.showNow(WB.textStrokes(l, 540, CARD.y + 610 + i * 92 - (linhas.length - 1) * 30, 92, ouro ? '#a16207' : cor, g, 'middle').strokes));
    if (ouro) WB.showNow(WB.textStrokes('DOURADO!', 540, CARD.y + 215, 70, '#a16207', g, 'middle').strokes);
    g.setAttribute('opacity', 0);
    return g;
  }

  RODADAS.forEach((r, i) => {
    const c = 3 + i;
    if (i === 0) WB.newPage(3, 0.0, 0.05);
    const pg = WB.group();
    // moldura do cartão (dourada) + título
    const frame = [sp(WB.roundRectPath(CARD.x, CARD.y, CARD.w, CARD.h, 40), GOLD, 10, pg)];
    const sep = [sp(WB.roughLine(CARD.x + 40, CARD.y + 150, CARD.x + CARD.w - 40, CARD.y + 150, 2), GOLD, 5, pg)];
    if (i === 0) { D(c, 0.05, 0.25, frame); D(c, 0.25, 0.32, sep); }
    else WB.showNow([frame, sep]);
    const tg = WB.group(pg);
    WB.showNow(WB.textStrokes(r.titulo, 540, CARD.y + 85, 84, r.cor, tg, 'middle').strokes);
    WB.showNow(WB.textStrokes(r.sub, 540, CARD.y + 133, 46, INK.gray, tg, 'middle').strokes);
    const cards = r.itens.map(it => cartao(it, r.cor, false, pg));
    const ouroG = cartao(r.ouro, r.cor, true, pg);
    // sequência: embaralha 2 voltas, o dourado entra uma vez no meio
    const t0 = st(c) + (i === 0 ? 0.5 : 0.05), t1 = en(c) - 0.1;
    const seq = [];
    let t = t0, k = 0;
    const ordem = [...cards.keys()].sort(() => rnd() - 0.5);
    const ouroEm = t0 + (t1 - t0) * (0.45 + 0.2 * rnd());
    let ouroFeito = false;
    while (t < t1) {
      if (!ouroFeito && t >= ouroEm) { seq.push({ t, g: ouroG, d: OURO_DUR }); t += OURO_DUR; ouroFeito = true; continue; }
      seq.push({ t, g: cards[ordem[k % ordem.length]], d: PASSO }); t += PASSO; k++;
    }
    const todos = [...cards, ouroG];
    WB.effect(tt => {
      let ativo = null;
      if (tt >= t0) {
        ativo = seq[seq.length - 1].g;
        for (const s of seq) if (tt >= s.t && tt < s.t + s.d) { ativo = s.g; break; }
      }
      todos.forEach(g => g.setAttribute('opacity', g === ativo ? 1 : 0));
    });
    // a rodada some quando a próxima começa
    WB.effect(tt => pg.setAttribute('opacity', (tt >= st(c) - (i === 0 ? 1 : 0) && (i === 2 || tt < st(c + 1))) ? 1 : 0));
    // seta "PAUSA!" piscando ao lado
    const pz = WB.group(pg);
    WB.showNow(WB.textStrokes('PAUSA!', 800, 1330, 80, INK.red, pz, 'middle').strokes);
    WB.effect(tt => pz.setAttribute('opacity', (tt > tf(c, 0.7) && tt < en(c) && Math.floor(tt * 3) % 2 === 0) ? 1 : 0));
    rest(c, st(c) + (i === 0 ? 0.35 : 0), en(c));
  });

  // ---------- cena 6: escreve nos comentários ----------
  WB.newPage(6, 0.0, 0.05);
  WB.effect(t => genie.setAttribute('opacity', t < st(6) ? 1 : 0));
  W(6, 0.06, 0.24, 'meus desejos de 2027:', 540, 330, 80, INK.purple);
  [1, 2, 3].forEach((n, j) => {
    const y = 480 + j * 140;
    W(6, 0.25 + j * 0.06, 0.30 + j * 0.06, `${n}.`, 200, y, 80, INK.black);
    D(6, 0.30 + j * 0.06, 0.34 + j * 0.06, sp(WB.roughLine(260, y + 10, 880, y + 10, 2), INK.gray, 5));
  });
  // balão de comentário
  const bub = 'M 300 900 Q 300 840 360 840 L 720 840 Q 780 840 780 900 L 780 1010 Q 780 1070 720 1070 L 470 1070 L 380 1140 L 400 1070 L 360 1070 Q 300 1070 300 1010 Z';
  D(6, 0.48, 0.62, sp(bub, INK.blue, 8));
  W(6, 0.62, 0.75, 'comenta!', 540, 985, 90, INK.blue);
  W(6, 0.76, 0.92, 'senão o gênio não realiza', 540, 1260, 66, INK.red);
  D(6, 0.93, 1.0, C.check(860, 980, 44, INK.green));

  // ---------- cena 7: dourado + CTA ----------
  WB.newPage(7, 0.0, 0.05);
  emojiText('✨', 540, 440, 150, WB.layer);
  W(7, 0.05, 0.25, 'tirou o DOURADO?', 540, 560, 96, '#a16207');
  W(7, 0.25, 0.40, 'sortudo demais!', 540, 660, 70, INK.gray);
  W(7, 0.42, 0.55, 'manda pro amigo', 540, 800, 80, INK.black);
  WB.ctaRedes(7, 0.56, 0.82, { y: 860, titulo: 'e me segue!', iconSize: 170 });
  WB.write(7, 0.82, 0.95, 'volta e tenta de novo', 540, 1500, 62, INK.purple, { anchor: 'middle' });
};
