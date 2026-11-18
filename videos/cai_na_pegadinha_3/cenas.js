// "Tu vai cair na pegadinha 3": 5 pegadinhas novas em voz alta. Narração Gemini Algieba (3.1, take único).
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
  const janela = (g, a, b, d = 0.2) => WB.effect(t => g.setAttribute('opacity', (clamp((t - a) / d) * (1 - clamp((t - b) / d))).toFixed(3)));
  const st = c => S[c - 1].start, fim = c => S[c - 1].start + S[c - 1].fala;
  const pop = (a, b, txt, x, y, size, cor, parent, anchor = 'middle') => { // texto que aparece pronto, com "pulo"
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, anchor).strokes);
    WB.effect(t => {
      const u = clamp((t - a) / 0.18), k = t < a ? 0 : (u < 1 ? 0.6 + 0.5 * ease(u) : 1 + 0.1 * Math.exp(-(t - a - 0.18) * 10));
      const op = t < a ? 0 : 1 - clamp((t - b) / 0.2);
      g.setAttribute('opacity', op.toFixed(3));
      g.setAttribute('transform', `translate(${x} ${y - size * 0.35}) scale(${k.toFixed(3)}) translate(${-x} ${-(y - size * 0.35)})`);
    });
    return g;
  };
  const pulsa = (g, cx, cy, a, amp = 0.08, vel = 9, dec = 2) => WB.effect(t => {
    const k = t > a ? 1 + amp * Math.sin((t - a) * vel) * Math.exp(-(t - a) * dec) : 1;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });
  // instante da resposta certa em cada revelação (igual ao audio.py)
  const CERTA = { 4: 1.33, 6: 1.05, 8: 1.1, 10: 1.0, 12: 1.2 };

  // ---------------- título + placar (prontos no quadro 0) ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('RESPONDE EM VOZ ALTA', 540, 190, 104, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('aposto que tu cai em 3!', 540, 280, 70, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 180, 0.3, 0.05, 8, 1.5);
  const QS = [[2, 4], [5, 6], [7, 8], [9, 10], [11, 12]]; // [cena inicial, cena da revelação]
  const bolas = QS.map((q, i) => {
    const x = 340 + i * 100, y = 390, g = WB.group();
    const c = WB.mk('circle', { cx: x, cy: y, r: 36, fill: '#fffaf0' }, g);
    WB.showNow([sp(WB.circlePath(x, y, 36), INK.black, 5, g)]);
    WB.showNow(WB.textStrokes(String(i + 1), x, y + 17, 52, INK.black, g, 'middle').strokes);
    WB.effect(t => {
      const ativo = t >= st(q[0]) && t < (QS[i + 1] ? st(QS[i + 1][0]) : 999);
      const feito = t >= st(q[1]) + CERTA[q[1]];
      c.setAttribute('fill', feito && !ativo ? '#d9f2df' : ativo ? '#fde68a' : '#fffaf0');
      const k = ativo ? 1.12 + 0.04 * Math.sin(t * 6) : 1;
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`);
    });
    return g;
  });
  const fora = (g, a, b) => WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - a) / 0.25)).toFixed(3)));

  // ---------------- cena 1: gancho ----------------
  rest(0.2, 0.3);
  pop(0.0, st(2) - 0.1, 'só vale responder rápido!', 540, 900, 84, INK.purple);
  pop(0.0, st(2) - 0.1, '5 perguntas', 540, 1060, 120, INK.black);
  [2].forEach(c => rest(fim(c) + 0.05, st(c + 1) - 0.05));
  [3, 5, 7, 9, 11].forEach(c => rest(fim(c) + 0.05, st(c + 1) - 0.02));

  // revelação padrão: resposta errada riscada + certa em verde com check
  const revela = (c, errada, certa, yE, yC, g, xE = 540, xC = 540, sz = 170) => {
    const s = st(c), d = CERTA[c];
    pop(s + 0.02, 999, errada, xE, yE, 130, INK.red, g);
    const w = WB.measure(errada, 130);
    D(s + 0.25, s + 0.5, [sp(`M ${r1(xE - w / 2 - 20)} ${yE - 30} L ${r1(xE + w / 2 + 20)} ${yE - 60}`, INK.red, 12, g)]);
    pop(s + d, 999, certa, xC, yC, sz, INK.green, g);
    const wc = WB.measure(certa, sz), cx = xC + wc / 2 + 60;
    D(s + d + 0.05, s + d + 0.35, [sp(`M ${r1(cx - 30)} ${yC - 60} L ${r1(cx)} ${yC - 25} L ${r1(cx + 55)} ${yC - 110}`, INK.green, 12, g)]);
  };
  // palavra repetida 5x na pausa
  const repete = (c, palavra, g) => {
    W(st(c) + 0.1, fim(c) - 0.05, 'Fala ' + palavra + ' 5x!', 540, 620, 96, INK.black, { parent: g });
    for (let k = 0; k < 5; k++) {
      const t0 = fim(c) + 0.15 + k * 0.4;
      pop(t0, st(c + 1) + 0.05, palavra, 540 + (k % 2 ? 110 : -110), 790 + k * 120, 104, k % 2 ? INK.blue : INK.purple, g);
    }
  };
  // barra de tempo da resposta
  const barra = (c, y, g) => {
    const a = fim(c), b = st(c + 1);
    const bg = WB.mk('rect', { x: 240, y, width: 600, height: 26, rx: 13, fill: '#efe7cf' }, g);
    const fg = WB.mk('rect', { x: 240, y, width: 600, height: 26, rx: 13, fill: INK.red }, g);
    WB.effect(t => {
      const on = t >= st(c) && t < b + 0.1;
      bg.setAttribute('opacity', on ? 1 : 0); fg.setAttribute('opacity', on ? 1 : 0);
      fg.setAttribute('width', r1(600 * (1 - clamp((t - a) / (b - a)))));
    });
  };
  const responde = (c, y) => pop(fim(c) + 0.02, st(c + 1), 'RESPONDE!', 540, y, 90, INK.red);


  const sub = (c, txt, y, g) => W(st(c) + CERTA[c] + 0.35, S[c - 1].end - 0.05, txt, 540, y, 66, INK.blue, { parent: g });
  const F = c => S[c - 1].fala;

  // ---------------- pegadinha 1: torrada / pão ----------------
  const g1 = WB.group();
  repete(2, 'TORRADA', g1);
  const q1 = WB.group(g1);
  WB.effect(t => q1.setAttribute('opacity', t >= st(3) ? 1 : 0));
  { const rep = Array.from(g1.children).filter(n => n !== q1); WB.effect(t => rep.forEach(n => { if (t >= st(3)) n.setAttribute('opacity', 0); })); }
  W(st(3) + 0.02, st(3) + F(3) * 0.45, 'O que tu põe', 540, 620, 104, INK.black, { parent: q1 });
  W(st(3) + F(3) * 0.45, fim(3), 'na TORRADEIRA?', 540, 730, 104, INK.black, { parent: q1 });
  { // torradeira
    const g = WB.group(q1), x = 540, y = 900;
    const corpo = `M ${x - 170} ${y + 70} L ${x - 170} ${y - 40} Q ${x - 170} ${y - 95} ${x - 115} ${y - 95} L ${x + 115} ${y - 95} Q ${x + 170} ${y - 95} ${x + 170} ${y - 40} L ${x + 170} ${y + 70} Z`;
    WB.mk('path', { d: corpo, fill: '#e5e7eb' }, g);
    WB.mk('rect', { x: x - 110, y: y - 105, width: 90, height: 22, rx: 8, fill: '#374151' }, g);
    WB.mk('rect', { x: x + 20, y: y - 105, width: 90, height: 22, rx: 8, fill: '#374151' }, g);
    WB.mk('rect', { x: x + 170, y: y - 20, width: 34, height: 18, rx: 6, fill: '#ef4444' }, g);
    WB.showNow([sp(corpo, INK.black, 6, g), sp(`M ${x - 140} ${y + 70} L ${x - 140} ${y + 92} M ${x + 140} ${y + 70} L ${x + 140} ${y + 92}`, INK.black, 6, g)]);
    WB.effect(t => g.setAttribute('opacity', t >= st(3) + 0.2 ? 1 : 0));
  }
  barra(3, 1010, q1); responde(3, 1140);
  revela(4, 'TORRADA?', 'PÃO!', 1230, 1460, q1);
  sub(4, 'a torrada é o que SAI dela!', 1580, q1);
  fora(g1, st(5));

  // ---------------- pegadinha 2: casa térrea azul ----------------
  const g2 = WB.group(), s5 = st(5);
  W(s5 + 0.02, s5 + 1.6, 'Uma casa TÉRREA', 540, 600, 100, INK.black, { parent: g2 });
  W(s5 + 1.6, s5 + 2.4, 'é toda AZUL', 540, 705, 100, INK.blue, { parent: g2 });
  W(s5 + 4.2, fim(5), 'de que cor é a ESCADA?', 540, 1110, 88, INK.red, { parent: g2 });
  { // casa de um andar, tudo azul
    const g = WB.group(g2), x = 540, y = 960;
    const parede = `M ${x - 220} ${y + 80} L ${x - 220} ${y - 60} L ${x + 220} ${y - 60} L ${x + 220} ${y + 80} Z`;
    const tet = `M ${x - 260} ${y - 60} L ${x} ${y - 190} L ${x + 260} ${y - 60} Z`;
    const pw = WB.mk('path', { d: parede, fill: '#ffffff' }, g), tw = WB.mk('path', { d: tet, fill: '#ffffff' }, g);
    const porta = WB.mk('rect', { x: x - 40, y: y - 10, width: 80, height: 90, fill: '#ffffff' }, g);
    const jan = [x - 160, x + 90].map(jx => WB.mk('rect', { x: jx, y: y - 35, width: 70, height: 60, fill: '#ffffff' }, g));
    WB.showNow([sp(parede, INK.black, 6, g), sp(tet, INK.black, 6, g), sp(`M ${x - 40} ${y + 80} L ${x - 40} ${y - 10} L ${x + 40} ${y - 10} L ${x + 40} ${y + 80}`, INK.black, 5, g),
      sp(`M ${x - 160} ${y - 35} h 70 v 60 h -70 Z M ${x + 90} ${y - 35} h 70 v 60 h -70 Z`, INK.black, 5, g)]);
    // pinta de azul aos poucos: parede, porta, telhado/janelas
    const pinta = (el, a, cor) => WB.effect(t => el.setAttribute('fill', t >= a ? cor : '#ffffff'));
    pinta(pw, s5 + 2.1, '#93c5fd'); pinta(porta, s5 + 3.0, '#2563eb'); pinta(tw, s5 + 3.6, '#1d4ed8'); jan.forEach(j => pinta(j, s5 + 3.9, '#bfdbfe'));
    WB.effect(t => g.setAttribute('opacity', t >= s5 + 0.3 ? 1 : 0));
  }
  barra(5, 1170, g2); responde(5, 1290);
  revela(6, 'AZUL?', 'NÃO TEM!', 1380, 1580, g2, 540, 500, 150);
  sub(6, 'casa térrea não tem escada!', 1700, g2);
  fora(g2, st(7));

  // ---------------- pegadinha 3: meio do ovo ----------------
  const g3 = WB.group(), s7 = st(7);
  W(s7 + 0.02, s7 + F(7) * 0.5, 'O que tem bem no', 540, 620, 100, INK.black, { parent: g3 });
  W(s7 + F(7) * 0.5, fim(7), 'MEIO do OVO?', 540, 730, 110, INK.red, { parent: g3 });
  { // ovo inteiro
    const g = WB.group(g3), x = 540, y = 920;
    WB.mk('ellipse', { cx: x, cy: y, rx: 85, ry: 112, fill: '#fff7e6' }, g);
    WB.mk('ellipse', { cx: x, cy: y, rx: 85, ry: 112, fill: 'none', stroke: INK.black, 'stroke-width': 6 }, g);
    WB.showNow([sp(`M ${x - 40} ${y - 70} Q ${x - 55} ${y - 40} ${x - 50} ${y - 10}`, INK.orange, 5, g)]);
    WB.effect(t => { g.setAttribute('opacity', t >= s7 + 0.2 ? 1 : 0); g.setAttribute('transform', `rotate(${r1(4 * Math.sin(t * 3))} ${x} ${y + 100})`); });
  }
  barra(7, 1080, g3); responde(7, 1210);
  revela(8, 'GEMA?', 'A LETRA V!', 1300, 1480, g3, 540, 500, 140);
  { // o V o: o V no meio da palavra
    const s = st(8) + CERTA[8] + 0.35, g = WB.group(g3);
    pop(s, 999, 'o', 420, 1665, 110, INK.black, g); pop(s + 0.12, 999, 'V', 540, 1665, 120, INK.green, g); pop(s + 0.24, 999, 'o', 660, 1665, 110, INK.black, g);
    D(s + 0.4, s + 0.8, [sp(WB.circlePath(540, 1625, 60), INK.green, 7, g)]);
  }
  fora(g3, st(9));

  // ---------------- pegadinha 4: trem elétrico ----------------
  const g4 = WB.group(), s9 = st(9);
  W(s9 + 0.02, s9 + 1.5, 'Um trem ELÉTRICO', 540, 600, 100, INK.black, { parent: g4 });
  W(s9 + 1.5, s9 + 2.8, 'vai pro norte...', 540, 705, 92, INK.black, { parent: g4 });
  W(s9 + 2.9, s9 + 4.0, 'vento pro sul', 540, 810, 92, INK.blue, { parent: g4 });
  W(s9 + 4.0, fim(9), 'pra que lado vai a FUMAÇA?', 540, 1190, 80, INK.red, { parent: g4 });
  { // trem com pantógrafo no fio, seta N e vento
    const g = WB.group(g4), y = 1010;
    WB.showNow([sp('M 100 905 L 980 905', INK.black, 4, g), sp('M 100 1095 L 980 1095', INK.black, 6, g)]);
    const tr = WB.group(g);
    const vag = (x0, w) => { WB.mk('rect', { x: x0, y: y - 55, width: w, height: 100, rx: 18, fill: '#fde68a' }, tr);
      WB.showNow([sp(`M ${x0 + 18} ${y - 55} h ${w - 36} q 18 0 18 18 v 64 q 0 18 -18 18 h ${-(w - 36)} q -18 0 -18 -18 v -64 q 0 -18 18 -18 Z`, INK.black, 5, tr)]);
      [x0 + 40, x0 + w - 40].forEach(cx => { WB.mk('circle', { cx, cy: y + 52, r: 20, fill: '#374151' }, tr); });
      [x0 + 30, x0 + w / 2 - 15].forEach(wx => WB.mk('rect', { x: wx, y: y - 35, width: 40, height: 30, rx: 5, fill: '#bfdbfe' }, tr)); };
    vag(-230, 220); vag(10, 220);
    WB.showNow([sp('M 90 955 L 120 910 L 150 955', INK.black, 5, tr)]);
    const a = s9 + 0.3;
    WB.effect(t => { tr.setAttribute('transform', `translate(${r1(320 + 70 * clamp((t - a) / 4))} 0)`); g.setAttribute('opacity', t >= s9 + 0.2 ? 1 : 0); });
    // seta "norte" (pra direita) e vento (pra esquerda)
    D(s9 + 1.6, s9 + 2.3, [sp('M 790 860 L 930 860 M 930 860 L 898 842 M 930 860 L 898 878', INK.black, 6, g)]);
    pop(s9 + 2.3, 999, 'N', 950, 880, 60, INK.black, g, 'start');
    const v = WB.group(g);
    WB.showNow([sp('M 420 960 Q 360 940 300 960 Q 250 975 200 960 M 440 1000 Q 380 985 320 1000', INK.blue, 5, v)]);
    WB.effect(t => { v.setAttribute('opacity', t >= s9 + 3.0 ? 0.9 : 0); v.setAttribute('transform', `translate(${r1(-((t * 120) % 120))} 0)`); });
  }
  barra(9, 1250, g4); responde(9, 1370);
  revela(10, 'PRO SUL?', 'NENHUM!', 1440, 1600, g4, 540, 500, 140);
  sub(10, 'trem elétrico não solta fumaça!', 1700, g4);
  fora(g4, st(11));

  // ---------------- pegadinha 5: sábado antes da sexta ----------------
  const g5 = WB.group(), s11 = st(11);
  W(s11 + 0.05, s11 + 1.0, 'ÚLTIMA!', 540, 600, 110, INK.red, { parent: g5 });
  W(s11 + 1.0, s11 + 2.1, 'em que lugar o SÁBADO', 540, 720, 90, INK.black, { parent: g5 });
  W(s11 + 2.1, fim(11), 'vem antes da SEXTA?', 540, 825, 90, INK.black, { parent: g5 });
  { // dois cartões trocando de lugar
    const g = WB.group(g5), y = 980;
    const card = (txt, cor) => { const c = WB.group(g); WB.mk('rect', { x: -150, y: -60, width: 300, height: 110, rx: 18, fill: '#fffaf0' }, c);
      WB.showNow([sp('M -132 -60 h 264 q 18 0 18 18 v 74 q 0 18 -18 18 h -264 q -18 0 -18 -18 v -74 q 0 -18 18 -18 Z', cor, 6, c)]);
      WB.showNow(WB.textStrokes(txt, 0, 22, 72, cor, c, 'middle').strokes); return c; };
    const sx = card('SEXTA', INK.blue), sb = card('SÁBADO', INK.purple);
    const a = s11 + 1.2, b = s11 + 2.4;
    WB.effect(t => { const u = ease(clamp((t - a) / (b - a)));
      sx.setAttribute('transform', `translate(${r1(lerp(360, 720, u))} ${r1(y + 40 * Math.sin(Math.PI * u))})`);
      sb.setAttribute('transform', `translate(${r1(lerp(720, 360, u))} ${r1(y - 40 * Math.sin(Math.PI * u))})`);
      g.setAttribute('opacity', t >= s11 + 0.9 ? 1 : 0); });
  }
  barra(11, 1100, g5); responde(11, 1230);
  revela(12, 'CALENDÁRIO?', 'DICIONÁRIO!', 1340, 1550, g5, 540, 480, 120);
  sub(12, 'SÁ vem antes de SE no ABC!', 1670, g5);
  fora(g5, st(13));

  // ---------------- cena 13: CTA + motivo pra seguir ----------------
  const s13 = st(13), F13 = S[12].fala;
  W(s13 + 0.1, s13 + F13 * 0.4, 'Quantas tu acertou?', 540, 700, 104, INK.black);
  { const g = pop(s13 + 0.5, 999, '__ de 5', 540, 900, 180, INK.red); pulsa(g, 540, 840, s13 + 0.7, 0.06, 6, 0.6); }
  W(s13 + F13 * 0.45, s13 + F13 * 0.8, 'PARTE 4 AMANHÃ', 540, 1120, 110, INK.purple);
  { // botão seguir que vira "seguindo"
    const g = WB.group(), x = 540, y = 1290, a = s13 + F13 * 0.8;
    const bt = WB.mk('rect', { x: x - 170, y: y - 55, width: 340, height: 100, rx: 50, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); WB.showNow(WB.textStrokes('Seguir', x, y + 18, 64, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(g); WB.showNow(WB.textStrokes('Seguindo', x, y + 18, 58, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0);
      const k = on && t < a + 0.25 ? 0.7 + 1.2 * (t - a) : (done && t < a + 1.2 ? 1.08 : 1);
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`); });
  }
  rest(s13 + F13, S[12].end - 0.1);

  // ---------------- marca d'água que passeia ----------------
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[290, 1780], [790, 1780], [540, 1810], [300, 1770]];
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
