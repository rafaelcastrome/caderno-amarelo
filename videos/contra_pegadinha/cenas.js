// "Contra-pegadinha": pegadinhas famosas viradas do avesso. Narração Gemini Algieba (3.1, take único).
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
  const CERTA = { 4: 1.4, 6: 3.1, 8: 2.3, 11: 1.05, 13: 1.0 };

  // ---------------- título + placar (prontos no quadro 0) ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('RESPONDE EM VOZ ALTA', 540, 190, 104, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('tu já conhece todas, né?', 540, 280, 70, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 180, 0.3, 0.05, 8, 1.5);
  const QS = [[2, 4], [5, 6], [7, 8], [9, 11], [12, 13]]; // [cena inicial, cena da revelação]
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
  pop(0.0, st(2) - 0.1, 'PEGADINHAS', 540, 860, 130, INK.black);
  pop(0.0, st(2) - 0.1, 'que tu já sabe...', 540, 990, 90, INK.purple);
  pop(1.6, st(2) - 0.1, 'será?', 540, 1160, 120, INK.red);
  [2, 9].forEach(c => rest(fim(c) + 0.05, st(c + 1) - 0.05));
  [3, 5, 7, 10, 12].forEach(c => rest(fim(c) + 0.05, st(c + 1) - 0.02));

  // revelação padrão: resposta errada riscada + certa em verde com check
  const revela = (c, errada, certa, yE, yC, g, xE = 540, xC = 540, sz = 170, szE = 130) => {
    const s = st(c), d = CERTA[c];
    pop(s + 0.02, 999, errada, xE, yE, szE, INK.red, g);
    const w = WB.measure(errada, szE);
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


  const img = (href, x, y, s, parent) => WB.mk('image', { href, x: x - s / 2, y: y - s / 2, width: s, height: s }, parent);
  const surge = (g, a, cx, cy) => WB.effect(t => {
    const u = clamp((t - a) / 0.25), k = t < a ? 0.01 : 0.7 + 0.3 * ease(u) + 0.03 * Math.sin((t - a) * 3);
    g.setAttribute('opacity', t < a ? 0 : 1);
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });
  // troca da tela do "fala X 5x" pra pergunta
  const trocaRep = (g, q, a) => { const rep = Array.from(g.children).filter(n => n !== q); WB.effect(t => { q.setAttribute('opacity', t >= a ? 1 : 0); rep.forEach(n => { if (t >= a) n.setAttribute('opacity', 0); }); }); };

  // ---------------- 1: branco / o que a vaca DÁ ----------------
  const g1 = WB.group();
  repete(2, 'BRANCO', g1);
  const q1 = WB.group(g1); trocaRep(g1, q1, st(3));
  W(st(3) + 0.02, fim(3), 'O que a vaca DÁ?', 540, 640, 110, INK.black, { parent: q1 });
  { const g = WB.group(q1); img(window.ICONES.vaca, 540, 860, 260, g); surge(g, st(3) + 0.1, 540, 860); }
  barra(3, 1010, q1); responde(3, 1140);
  revela(4, 'ÁGUA?', 'LEITE!', 1240, 1450, q1);
  { const g = WB.group(q1); img(window.ICONES.leite, 860, 1400, 130, g); surge(g, st(4) + CERTA[4] + 0.1, 860, 1400); }
  sub(4, 'água é o que ela BEBE!', 1580, q1);
  fora(g1, st(5));

  // ---------------- 2: 1 kg de algodão x 2 kg de ferro ----------------
  const g2 = WB.group(), s5 = st(5);
  W(s5 + 0.02, s5 + 1.0, 'O que pesa mais?', 540, 610, 104, INK.black, { parent: g2 });
  { // dois sacos
    const g = WB.group(g2);
    const saco = (x, fundo, cor, kg, nome, a) => { const h = WB.group(g);
      const d = `M ${x - 150} ${1080} L ${x - 130} ${880} Q ${x} ${840} ${x + 130} ${880} L ${x + 150} ${1080} Q ${x} ${1110} ${x - 150} ${1080} Z`;
      WB.mk('path', { d, fill: fundo }, h); WB.showNow([sp(d, INK.black, 6, h), sp(`M ${x - 40} ${860} Q ${x} ${830} ${x + 40} ${860}`, INK.black, 5, h)]);
      WB.showNow(WB.textStrokes(kg, x, 990, 96, cor, h, 'middle').strokes);
      WB.showNow(WB.textStrokes(nome, x, 1060, 56, cor, h, 'middle').strokes);
      surge(h, a, x, 980); };
    saco(290, '#ffffff', INK.blue, '1 kg', 'algodão', s5 + 1.2);
    saco(790, '#9ca3af', INK.black, '2 kg', 'ferro', s5 + 3.4);
    pop(s5 + 3.0, 999, 'ou', 540, 1000, 80, INK.purple, g);
  }
  barra(5, 1170, g2); responde(5, 1290);
  revela(6, 'PESA IGUAL?', 'O FERRO!', 1380, 1640, g2, 540, 520, 150);
  { const s = st(6); pop(s + 1.2, 999, 'eu falei DOIS quilos!', 540, 1480, 70, INK.purple, g2); }
  fora(g2, st(7));

  // ---------------- 3: passa o PRIMEIRO ----------------
  const g3 = WB.group(), s7 = st(7);
  W(s7 + 0.02, s7 + 1.4, 'Tu tá numa corrida', 540, 600, 96, INK.black, { parent: g3 });
  W(s7 + 1.4, s7 + 2.6, 'e passa o PRIMEIRO', 540, 705, 96, INK.red, { parent: g3 });
  W(s7 + 2.6, fim(7), 'em que lugar tu fica?', 540, 1150, 84, INK.black, { parent: g3 });
  { // pista com dois corredores e bandeira
    const g = WB.group(g3), y = 960;
    WB.showNow([sp('M 90 1060 L 990 1060', INK.black, 6, g), sp('M 90 900 L 990 900', INK.black, 3, g)]);
    img(window.ICONES.chegada, 930, 960, 120, g);
    const a = WB.group(g); img(window.ICONES.corre, 0, 0, 120, a);
    const b = WB.group(g); img(window.ICONES.corre, 0, 0, 140, b);
    const ta = s7 + 1.6;
    WB.effect(t => { g.setAttribute('opacity', t >= s7 + 0.3 ? 1 : 0);
      const u = ease(clamp((t - ta) / 1.6));
      const xa = 560 + 40 * clamp((t - s7) / 6), xb = lerp(300, 700, u);
      a.setAttribute('transform', `translate(${r1(xa)} ${r1(985 + 6 * Math.sin(t * 14))}) scale(-1 1)`);
      b.setAttribute('transform', `translate(${r1(xb)} ${r1(975 + 6 * Math.sin(t * 15 + 1))}) scale(-1 1)`); });
    const l1 = pop(s7 + 1.2, ta + 1.2, '1º', 560, 905, 60, INK.red, g);
    const mv = WB.group(g); pop(s7 + 1.2, 999, 'TU', 300, 905, 60, INK.blue, mv);
    WB.effect(t => { const u = ease(clamp((t - ta) / 1.6)); mv.setAttribute('transform', `translate(${r1(lerp(0, 400, u))} 0)`); });
  }
  barra(7, 1210, g3); responde(7, 1330);
  revela(8, 'SEGUNDO?', 'PRIMEIRO!', 1420, 1610, g3, 540, 500, 150);
  sub(8, 'passou o 1º... tu é o 1º!', 1730, g3);
  fora(g3, st(9));

  // ---------------- 4: torrada / o que SAI da torradeira ----------------
  const g4 = WB.group();
  repete(9, 'TORRADA', g4);
  const q4 = WB.group(g4); trocaRep(g4, q4, st(10));
  W(st(10) + 0.02, fim(10), 'O que SAI da torradeira?', 540, 640, 92, INK.black, { parent: q4 });
  { // torradeira
    const g = WB.group(q4), x = 540, y = 900;
    const corpo = `M ${x - 170} ${y + 70} L ${x - 170} ${y - 40} Q ${x - 170} ${y - 95} ${x - 115} ${y - 95} L ${x + 115} ${y - 95} Q ${x + 170} ${y - 95} ${x + 170} ${y - 40} L ${x + 170} ${y + 70} Z`;
    WB.mk('path', { d: corpo, fill: '#e5e7eb' }, g);
    WB.mk('rect', { x: x - 110, y: y - 105, width: 90, height: 22, rx: 8, fill: '#374151' }, g);
    WB.mk('rect', { x: x + 20, y: y - 105, width: 90, height: 22, rx: 8, fill: '#374151' }, g);
    WB.mk('rect', { x: x + 170, y: y - 20, width: 34, height: 18, rx: 6, fill: '#ef4444' }, g);
    WB.showNow([sp(corpo, INK.black, 6, g), sp(`M ${x - 140} ${y + 70} L ${x - 140} ${y + 92} M ${x + 140} ${y + 70} L ${x + 140} ${y + 92}`, INK.black, 6, g)]);
    WB.effect(t => g.setAttribute('opacity', t >= st(10) + 0.1 ? 1 : 0));
  }
  barra(10, 1010, q4); responde(10, 1140);
  revela(11, 'PÃO?', 'TORRADA!', 1240, 1450, q4);
  sub(11, 'entra pão... SAI torrada!', 1580, q4);
  fora(g4, st(12));

  // ---------------- 5: meses com 31 dias ----------------
  const g5 = WB.group(), s12 = st(12);
  W(s12 + 0.05, s12 + 0.7, 'ÚLTIMA!', 540, 600, 110, INK.red, { parent: g5 });
  W(s12 + 0.7, fim(12), 'quantos meses têm 31 dias?', 540, 720, 80, INK.black, { parent: g5 });
  { const g = WB.group(g5); img(window.ICONES.calendario, 540, 900, 200, g); surge(g, s12 + 0.6, 540, 900); }
  barra(12, 1050, g5); responde(12, 1180);
  revela(13, 'TODOS?', 'SÓ 7!', 1280, 1480, g5);
  { // os 7 meses
    const s = st(13) + CERTA[13] + 0.3, g = WB.group(g5);
    ['JAN', 'MAR', 'MAI', 'JUL', 'AGO', 'OUT', 'DEZ'].forEach((m, i) => pop(s + i * 0.08, 999, m, 150 + i * 130, 1640, 58, INK.blue, g));
  }
  fora(g5, st(14));

  // ---------------- 14: CTA ----------------
  const s14 = st(14), F14 = S[13].fala;
  W(s14 + 0.1, s14 + F14 * 0.3, 'Caiu por ser esperto?', 540, 680, 96, INK.black);
  { const g = pop(s14 + 0.5, 999, '__ de 5', 540, 880, 170, INK.red); pulsa(g, 540, 820, s14 + 0.7, 0.06, 6, 0.6); }
  W(s14 + F14 * 0.32, s14 + F14 * 0.7, 'manda pro amigo', 540, 1070, 96, INK.purple);
  W(s14 + F14 * 0.45, s14 + F14 * 0.75, 'que acha que sabe todas', 540, 1170, 76, INK.blue);
  { // botão seguir
    const g = WB.group(), x = 540, y = 1340, a = s14 + F14 * 0.78;
    const bt = WB.mk('rect', { x: x - 170, y: y - 55, width: 340, height: 100, rx: 50, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); WB.showNow(WB.textStrokes('Seguir', x, y + 18, 64, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(g); WB.showNow(WB.textStrokes('Seguindo', x, y + 18, 58, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0);
      const k = on && t < a + 0.25 ? 0.7 + 1.2 * (t - a) : (done && t < a + 1.2 ? 1.08 : 1);
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`); });
    pop(a + 0.2, 999, 'amanhã tem mais!', 540, 1500, 76, INK.red);
  }
  rest(s14 + F14, S[13].end - 0.1);

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
