// "Tua vida pelo mês que tu nasceu" (~61 s, Gemini Charon).
// Grade 3 x 4 com os 12 meses já escrita no 1º quadro (gancho: a pessoa procura o mês dela na hora).
// Cada cena de mês destaca a casa, desenha a piada e escreve a legendinha. No fim a grade fica cheia
// (dá print / pausa) e o CTA pede pra comentar o mês. A marca d'água passeia pelo rodapé.
window.CENAS = function (WB) {
  const { INK, C, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 6, parent) => WB.strokePath(d, cor, w, parent);
  const circ = (x, y, r) => WB.circlePath(r1(x), r1(y), r);
  const BROWN = '#8a5a2b', PINK = '#e58fb0', YEL = '#e6b800';

  // ---------------- título (pronto no 1º quadro) ----------------
  const pg = WB.group();
  WB.showNow(WB.textStrokes('TUA VIDA PELO MÊS', 540, 140, 96, INK.black, pg, 'middle').strokes);
  WB.showNow(WB.textStrokes('QUE TU NASCEU', 540, 240, 96, INK.red, pg, 'middle').strokes);

  // ---------------- grade ----------------
  const GX = 40, GY = 285, CW = 333, CH = 305;
  const MESES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
  const COR = [INK.blue, INK.purple, INK.green, INK.orange, INK.red, INK.orange, INK.blue, INK.purple, INK.green, INK.orange, INK.red, INK.blue];
  const LEG = ['metas: 0 de 10', 'não para quieto', 'dieta... amanhã', 'ninguém acredita', 'o bolo é da mãe', 'só pela comida',
    'parabéns? férias!', 'sempre atrasado', 'ATCHIM!', 'quero presente!', 'carrinho vazio', 'presente 2 em 1'];

  // desenhos centrados em (x, y), cabem em ~±80 x ±70
  const ICON = [
    // JANEIRO: lista de metas toda riscada
    (x, y) => [[WB.roughRect(x - 60, y - 68, x + 60, y + 68), INK.black, 5],
      [`M ${x - 42} ${y - 35} L ${x + 40} ${y - 35} M ${x - 42} ${y} L ${x + 40} ${y} M ${x - 42} ${y + 35} L ${x + 40} ${y + 35}`, INK.gray, 5],
      [`M ${x - 75} ${y - 75} L ${x + 75} ${y + 75} M ${x + 75} ${y - 75} L ${x - 75} ${y + 75}`, INK.red, 8]],
    // FEVEREIRO: boneco dançando com confete
    (x, y) => [[circ(x, y - 45, 18), INK.black, 6],
      [`M ${x} ${y - 27} L ${x} ${y + 25} M ${x} ${y - 12} L ${x - 35} ${y - 50} M ${x} ${y - 12} L ${x + 38} ${y - 45} M ${x} ${y + 25} L ${x - 30} ${y + 65} M ${x} ${y + 25} L ${x + 25} ${y + 50} L ${x + 45} ${y + 62}`, INK.black, 6],
      [`M ${x - 70} ${y - 60} l 10 8 M ${x + 62} ${y - 70} l -8 10 M ${x - 62} ${y + 10} l 12 -4 M ${x + 65} ${y} l 8 10`, INK.red, 6],
      [`M ${x - 45} ${y - 75} l 6 -8 M ${x + 72} ${y + 38} l -10 4 M ${x - 75} ${y + 45} l 8 8`, INK.blue, 6],
      [circ(x + 50, y - 20, 5), INK.green, 6], [circ(x - 50, y - 25, 5), INK.orange, 6], [circ(x + 20, y - 78, 5), INK.purple, 6]],
    // MARÇO: pão de queijo mordido
    (x, y) => [[`M ${x + 40} ${y - 42} Q ${x + 18} ${y - 55} ${x - 10} ${y - 52} Q ${x - 70} ${y - 45} ${x - 68} ${y + 5} Q ${x - 62} ${y + 55} ${x - 5} ${y + 55} Q ${x + 55} ${y + 55} ${x + 65} ${y + 5} Q ${x + 45} ${y + 8} ${x + 42} ${y - 12} Q ${x + 25} ${y - 25} ${x + 40} ${y - 42}`, YEL, 7],
      [`M ${x - 40} ${y - 15} l 6 4 M ${x - 15} ${y + 20} l 7 -3 M ${x + 20} ${y + 30} l 5 5 M ${x - 30} ${y + 30} l 6 3 M ${x + 5} ${y - 25} l 6 4`, BROWN, 5]],
    // ABRIL: cara de nariz comprido
    (x, y) => [[circ(x - 25, y, 50), INK.black, 6], [circ(x - 40, y - 15, 6), INK.black, 6], [circ(x - 12, y - 15, 6), INK.black, 6],
      [`M ${x + 15} ${y - 2} L ${x + 85} ${y - 8} L ${x + 18} ${y + 12}`, INK.orange, 7],
      [`M ${x - 45} ${y + 25} Q ${x - 28} ${y + 35} ${x - 10} ${y + 25}`, INK.black, 5]],
    // MAIO: bolo com coração (da mãe)
    (x, y) => [[`M ${x - 65} ${y - 5} L ${x - 65} ${y + 65} L ${x + 65} ${y + 65} L ${x + 65} ${y - 5} Z`, PINK, 7],
      [WB.wavyLine(x - 65, x + 65, y + 20, 7, 30), PINK, 5],
      [`M ${x} ${y - 5} L ${x} ${y - 45}`, INK.blue, 6], [`M ${x} ${y - 52} Q ${x - 10} ${y - 62} ${x} ${y - 78} Q ${x + 10} ${y - 62} ${x} ${y - 52}`, INK.orange, 5],
      [`M ${x} ${y + 55} C ${x - 32} ${y + 35} ${x - 22} ${y + 18} ${x} ${y + 32} C ${x + 22} ${y + 18} ${x + 32} ${y + 35} ${x} ${y + 55}`, INK.red, 5]],
    // JUNHO: milho + bandeirinhas
    (x, y) => [[`M ${x - 75} ${y - 70} Q ${x} ${y - 50} ${x + 75} ${y - 70}`, INK.black, 4],
      [`M ${x - 55} ${y - 64} l 10 22 l 10 -20 M ${x - 10} ${y - 57} l 10 22 l 10 -22 M ${x + 35} ${y - 62} l 10 22 l 10 -22`, INK.red, 5],
      [`M ${x - 22} ${y + 65} Q ${x - 35} ${y + 5} ${x} ${y - 25} Q ${x + 35} ${y + 5} ${x + 22} ${y + 65} Z`, YEL, 7],
      [`M ${x - 22} ${y + 10} L ${x + 22} ${y + 10} M ${x - 25} ${y + 35} L ${x + 25} ${y + 35} M ${x} ${y - 20} L ${x} ${y + 62}`, YEL, 4],
      [`M ${x - 22} ${y + 65} Q ${x - 55} ${y + 30} ${x - 50} ${y} M ${x + 22} ${y + 65} Q ${x + 55} ${y + 30} ${x + 50} ${y}`, INK.green, 6]],
    // JULHO: escola com cadeado
    (x, y) => [[`M ${x - 65} ${y - 10} L ${x - 65} ${y + 65} L ${x + 65} ${y + 65} L ${x + 65} ${y - 10}`, INK.black, 6],
      [`M ${x - 80} ${y - 5} L ${x} ${y - 60} L ${x + 80} ${y - 5}`, INK.red, 7], [`M ${x} ${y - 60} L ${x} ${y - 85} L ${x + 25} ${y - 78} L ${x} ${y - 72}`, INK.blue, 5],
      [`M ${x - 22} ${y + 65} L ${x - 22} ${y + 15} L ${x + 22} ${y + 15} L ${x + 22} ${y + 65}`, BROWN, 6],
      [`M ${x - 12} ${y + 40} L ${x - 12} ${y + 60} L ${x + 12} ${y + 60} L ${x + 12} ${y + 40} Z M ${x - 7} ${y + 40} Q ${x} ${y + 25} ${x + 7} ${y + 40}`, INK.gray, 5]],
    // AGOSTO: relógio correndo
    (x, y) => [[circ(x + 10, y, 55), INK.black, 7], [`M ${x + 10} ${y} L ${x + 10} ${y - 35} M ${x + 10} ${y} L ${x + 35} ${y + 12}`, INK.red, 7],
      [`M ${x - 80} ${y - 25} L ${x - 55} ${y - 25} M ${x - 85} ${y} L ${x - 55} ${y} M ${x - 80} ${y + 25} L ${x - 55} ${y + 25}`, INK.gray, 5],
      [`M ${x - 15} ${y + 55} L ${x - 30} ${y + 72} M ${x + 35} ${y + 55} L ${x + 50} ${y + 72}`, INK.black, 6]],
    // SETEMBRO: flor + espirro
    (x, y) => [[`M ${x - 25} ${y + 70} Q ${x - 30} ${y + 30} ${x - 25} ${y - 5}`, INK.green, 6], [`M ${x - 27} ${y + 40} Q ${x - 55} ${y + 25} ${x - 60} ${y + 45} Q ${x - 45} ${y + 50} ${x - 27} ${y + 40}`, INK.green, 5],
      [circ(x - 25, y - 30, 12), YEL, 7],
      ...[0, 1, 2, 3, 4].map(i => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [circ(x - 25 + 26 * Math.cos(a), y - 30 + 26 * Math.sin(a), 13), PINK, 6]; }),
      [`M ${x + 25} ${y - 40} L ${x + 75} ${y - 60} M ${x + 28} ${y - 25} L ${x + 80} ${y - 25} M ${x + 25} ${y - 10} L ${x + 75} ${y + 10}`, INK.blue, 5]],
    // OUTUBRO: presente com laço
    (x, y) => [[WB.roughRect(x - 60, y - 20, x + 60, y + 68), INK.purple, 7], [WB.roughRect(x - 68, y - 40, x + 68, y - 20), INK.purple, 6],
      [`M ${x} ${y - 40} L ${x} ${y + 68}`, INK.red, 8],
      [`M ${x} ${y - 40} Q ${x - 45} ${y - 85} ${x - 40} ${y - 50} Q ${x - 25} ${y - 40} ${x} ${y - 40} Q ${x + 45} ${y - 85} ${x + 40} ${y - 50} Q ${x + 25} ${y - 40} ${x} ${y - 40}`, INK.red, 6]],
    // NOVEMBRO: carrinho vazio com etiqueta -90%
    (x, y) => [[`M ${x - 80} ${y - 40} L ${x - 60} ${y - 40} L ${x - 40} ${y + 30} L ${x + 45} ${y + 30} L ${x + 60} ${y - 20} L ${x - 52} ${y - 20}`, INK.black, 6],
      [circ(x - 30, y + 50, 11), INK.black, 6], [circ(x + 35, y + 50, 11), INK.black, 6],
      [`M ${x + 15} ${y - 75} L ${x + 75} ${y - 75} L ${x + 85} ${y - 60} L ${x + 75} ${y - 45} L ${x + 15} ${y - 45} Z`, INK.red, 5]],
    // DEZEMBRO: um presente só com etiqueta "2 em 1"
    (x, y) => [[WB.roughRect(x - 55, y - 15, x + 55, y + 68), INK.green, 7], [`M ${x} ${y - 15} L ${x} ${y + 68} M ${x - 55} ${y + 25} L ${x + 55} ${y + 25}`, INK.red, 7],
      [`M ${x} ${y - 15} Q ${x - 40} ${y - 55} ${x - 35} ${y - 25} M ${x} ${y - 15} Q ${x + 40} ${y - 55} ${x + 35} ${y - 25}`, INK.red, 6],
      [`M ${x + 40} ${y - 40} L ${x + 85} ${y - 70}`, INK.gray, 4]],
  ];
  // textos extras dentro do desenho (escritos junto com ele)
  const EXTRA = { 10: (x, y, g) => WB.textStrokes('-90%', x + 48, y - 51, 26, INK.red, g, 'middle').strokes };

  const cells = MESES.map((m, i) => {
    const r = Math.floor(i / 3), c = i % 3;
    const x0 = GX + c * CW, y0 = GY + r * CH, cx = x0 + CW / 2;
    const g = WB.group(pg);
    const hl = WB.mk('rect', { x: x0 + 10, y: y0 + 10, width: CW - 20, height: CH - 20, rx: 18, fill: '#ffe66d', stroke: 'none', opacity: 0 }, g);
    const box = sp(WB.roughRect(x0 + 6, y0 + 6, x0 + CW - 6, y0 + CH - 6), INK.black, 4, g);
    const lb = WB.textStrokes(m, cx, y0 + 68, 56, COR[i], g, 'middle').strokes;
    WB.showNow([box, lb]);
    return { g, hl, x0, y0, cx };
  });

  // cena 1: gancho (a grade já está na tela)
  WB.draw(1, 0.08, 0.32, [C.underline(250, 830, 262, INK.red)]);
  WB.restHand(1, 0.36, 0.95);

  // cenas 2..13: um mês por cena
  cells.forEach((k, i) => {
    const cena = i + 2, sc = S[cena - 1];
    // marca-texto amarelo: forte durante a cena, fraquinho depois
    WB.effect(t => {
      const on = clamp((t - sc.start) / 0.25), off = clamp((t - sc.end + 0.1) / 0.4);
      k.hl.setAttribute('opacity', (on * (0.55 - 0.35 * off)).toFixed(3));
    });
    const cy = k.y0 + 165;
    const tr = ICON[i](k.cx, cy).map(([d, cor, w]) => sp(d, cor, w, k.g));
    if (EXTRA[i]) tr.push(EXTRA[i](k.cx, cy, k.g));
    WB.draw(cena, 0.14, 0.7, tr);
    const txt = LEG[i];
    const size = Math.min(46, Math.floor(46 * 290 / WB.measure(txt, 46)));
    WB.write(cena, 0.72, 0.94, txt, k.cx, k.y0 + 282, size, INK.black, { anchor: 'middle', parent: k.g });
  });

  // cena 14: CTA no rodapé + grade cheia parada (dá pra pausar e achar o mês)
  WB.write(14, 0.04, 0.4, 'COMENTA TEU MÊS!', 540, 1625, 92, INK.red, { anchor: 'middle' });
  WB.write(14, 0.42, 0.78, 'e marca o amigo igualzinho', 540, 1720, 60, INK.black, { anchor: 'middle' });
  WB.restHand(14, 0.8, 1);

  // ---------------- marca d'água que passeia pelo rodapé ----------------
  const CTA0 = S[13].start;
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[280, 1585], [790, 1690], [300, 1760], [760, 1580]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % SPOTS.length], b = SPOTS[(k + 1) % SPOTS.length], e = ease(u);
      const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t + 0.01) / 0.01) * (1 - clamp((t - CTA0 + 0.2) / 0.4)) * 0.95).toFixed(3));
    });
  }
};
