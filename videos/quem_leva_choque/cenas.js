// "Quem leva choque?" v2: poste de ferro + 2 fios, passarinhos de verdade (imagens). Resposta: 2 (rabo no poste) e 3 (cabeça no fio de cima).
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
  const st = c => S[c - 1].start, F = c => S[c - 1].fala;
  const END = S[S.length - 1].end;
  const janela = (g, a, b, d = 0.25) => WB.effect(t => g.setAttribute('opacity', (clamp((t - a) / d) * (1 - clamp((t - b) / d))).toFixed(3)));
  const pop = (a, b, txt, x, y, size, cor, parent) => {
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, 'middle').strokes);
    WB.effect(t => {
      const u = clamp((t - a) / 0.18), k = t < a ? 0 : (u < 1 ? 0.6 + 0.5 * ease(u) : 1 + 0.1 * Math.exp(-(t - a - 0.18) * 10));
      g.setAttribute('opacity', (t < a ? 0 : 1 - clamp((t - b) / 0.25)).toFixed(3));
      g.setAttribute('transform', `translate(${x} ${y - size * 0.35}) scale(${k.toFixed(3)}) translate(${-x} ${-(y - size * 0.35)})`);
    });
    return g;
  };
  const mk = (tag, at, p) => WB.mk(tag, at, p);
  const BLK = '#1f1f24';

  // momentos
  const tLiga = st(2) + 0.35;
  const tB1 = st(3) + F(3) * 0.12, tZ2 = st(4) + F(4) * 0.13, tZ3 = st(5) + F(5) * 0.12;

  // ---------------- título ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('QUEM LEVA', 540, 200, 116, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('CHOQUE?', 540, 320, 116, INK.red, tit, 'middle').strokes);
  // raiozinho do lado do título
  const raio = (x, y, s, p, cor = '#f5b301') => mk('path', { d: `M ${x} ${y} l ${-14 * s} ${44 * s} l ${16 * s} 0 l ${-10 * s} ${40 * s} l ${30 * s} ${-54 * s} l ${-17 * s} 0 l ${10 * s} ${-30 * s} Z`,
    fill: cor, stroke: BLK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, p);
  raio(860, 210, 1.5, tit); raio(220, 210, 1.5, tit);
  WB.effect(t => { const k = 1 + 0.04 * Math.sin(t * 5) * Math.exp(-t * 0.5);
    tit.setAttribute('transform', `translate(540 250) scale(${k.toFixed(3)}) translate(-540 -250)`); });

  // ---------------- céu (sol + nuvens, só enfeite) ----------------
  { const ceu = WB.group();
    const sol = WB.group(ceu);
    mk('circle', { cx: 900, cy: 500, r: 58, fill: '#ffd23f', stroke: BLK, 'stroke-width': 5 }, sol);
    for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5, c = Math.cos(a), s2 = Math.sin(a);
      mk('path', { d: `M ${r1(900 + c * 76)} ${r1(500 + s2 * 76)} L ${r1(900 + c * 104)} ${r1(500 + s2 * 104)}`, stroke: '#f5b301', 'stroke-width': 8, 'stroke-linecap': 'round' }, sol); }
    WB.effect(t => sol.setAttribute('transform', `rotate(${r1(t * 12)} 900 500)`));
    const nuvem = (x, y, s3) => { const n = WB.group(ceu);
      [[0, 0, 46], [44, -22, 52], [92, 0, 44], [46, 12, 44]].forEach(([dx, dy, r]) => mk('circle', { cx: x + dx * s3, cy: y + dy * s3, r: r * s3, fill: '#ffffff', stroke: BLK, 'stroke-width': 5 }, n));
      [[0, 0, 46], [44, -22, 52], [92, 0, 44], [46, 12, 44]].forEach(([dx, dy, r]) => mk('circle', { cx: x + dx * s3, cy: y + dy * s3, r: r * s3 - 4, fill: '#ffffff' }, n));
      return n; };
    const n1c = nuvem(260, 470, 0.8), n2c = nuvem(560, 420, 0.6);
    WB.effect(t => { n1c.setAttribute('transform', `translate(${r1(Math.sin(t * 0.4) * 20)} 0)`); n2c.setAttribute('transform', `translate(${r1(Math.sin(t * 0.3 + 1) * 26)} 0)`); });
  }


  // ---------------- poste, fios e chão ----------------
  const YT = 960, YB = 1250, XP0 = 140, XP1 = 190, YG = 1335, XI = 222;
  const cena = WB.group();
  // chão
  mk('path', { d: `M 0 ${YG} Q 270 ${YG - 10} 540 ${YG} T 1080 ${YG} L 1080 ${YG + 40} L 0 ${YG + 40} Z`, fill: '#9bd38a', stroke: BLK, 'stroke-width': 5 }, cena);
  for (let x = 30; x < 1080; x += 70) mk('path', { d: `M ${x} ${YG + 2} l -8 -22 M ${x + 10} ${YG + 2} l 6 -26`, stroke: '#3f8f3a', 'stroke-width': 4, 'stroke-linecap': 'round' }, cena);
  // poste de ferro
  const posteG = WB.group(cena);
  mk('defs', {}, cena).innerHTML = `
    <linearGradient id="ferro" x1="0" x2="1"><stop offset="0" stop-color="#6b7480"/><stop offset="0.45" stop-color="#c3cad3"/><stop offset="1" stop-color="#5a626c"/></linearGradient>
    <filter id="fuligem"><feColorMatrix type="matrix" values="0.42 0 0 0 0  0 0.40 0 0 0  0 0 0.38 0 0  0 0 0 1 0"/></filter>
    <filter id="clarao"><feComponentTransfer><feFuncR type="linear" slope="1.9" intercept="0.15"/><feFuncG type="linear" slope="1.9" intercept="0.15"/><feFuncB type="linear" slope="1.1"/></feComponentTransfer></filter>`;
  mk('rect', { x: XP0, y: 600, width: XP1 - XP0, height: YG - 600, fill: 'url(#ferro)', stroke: BLK, 'stroke-width': 5 }, posteG);
  mk('rect', { x: XP0 - 8, y: 588, width: XP1 - XP0 + 16, height: 22, rx: 4, fill: '#5a626c', stroke: BLK, 'stroke-width': 5 }, posteG);
  for (let y = 680; y < YG - 40; y += 120) mk('circle', { cx: (XP0 + XP1) / 2, cy: y, r: 5, fill: '#4a525c' }, posteG);
  // placa de perigo
  mk('path', { d: `M 165 1080 L 205 1150 L 125 1150 Z`, fill: '#ffd23f', stroke: BLK, 'stroke-width': 5, 'stroke-linejoin': 'round' }, posteG);
  raio(168, 1098, 0.8, posteG, BLK);
  // isoladores (o fio não encosta no poste)
  const isolador = y => {
    mk('rect', { x: XP1, y: y + 44, width: XI - XP1 + 10, height: 12, fill: '#5a626c', stroke: BLK, 'stroke-width': 4 }, cena);
    mk('path', { d: `M ${XI - 14} ${y + 46} L ${XI - 18} ${y + 30} L ${XI + 18} ${y + 30} L ${XI + 14} ${y + 46} Z M ${XI - 12} ${y + 30} L ${XI - 15} ${y + 16} L ${XI + 15} ${y + 16} L ${XI + 12} ${y + 30} Z M ${XI - 9} ${y + 16} L ${XI - 11} ${y + 2} L ${XI + 11} ${y + 2} L ${XI + 9} ${y + 16} Z`,
      fill: '#8fb7c9', stroke: BLK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, cena);
  };
  isolador(YT); isolador(YB);
  const fio = d => mk('path', { d, fill: 'none', stroke: BLK, 'stroke-width': 8, 'stroke-linecap': 'round' }, cena);
  fio(`M ${XI} ${YT} L 1090 ${YT}`); fio(`M ${XI} ${YB} L 1090 ${YB}`);
  // energia andando nos fios
  const cor = mk('path', { d: `M ${XI} ${YT} L 1090 ${YT} M ${XI} ${YB} L 1090 ${YB}`, fill: 'none', stroke: '#f5b301', 'stroke-width': 6,
    'stroke-linecap': 'round', 'stroke-dasharray': '6 30', opacity: 0 }, cena);
  WB.effect(t => { cor.setAttribute('opacity', clamp((t - tLiga) / 0.3).toFixed(3)); cor.setAttribute('stroke-dashoffset', r1(-(t * 160) % 36)); });

  // ---------------- passarinhos de verdade ----------------
  // img: [arquivo, largura, altura, x dos pés, y dos pés (px da imagem), escala]
  function ave(nome, W0, H0, fx, fy, sc, X, Y) {
    const g = WB.group(cena), corpo = WB.group(g);
    const w = W0 * sc, h = H0 * sc, x = X - fx * sc, y = Y - fy * sc;
    const im = mk('image', { href: window.AVES[nome], x: r1(x), y: r1(y), width: r1(w), height: r1(h) }, corpo);
    return { g, corpo, im, x, y, w, h, cx: x + w / 2, cy: y + h * 0.4 };
  }
  const X1 = 560, X2 = 314, X3 = 835;
  const p1 = ave('pardal', 640, 528, 410, 492, 0.30, X1, YT + 4);
  const p2 = ave('bemtevi', 629, 640, 335, 507, 0.37, X2, YT + 4);
  const p3 = ave('pombo', 607, 640, 195, 602, 0.485, X3, YB + 4);

  // números
  const num = (n, x, y) => {
    const g = WB.group(cena);
    const c = mk('circle', { cx: x, cy: y, r: 44, fill: '#fffaf0', stroke: BLK, 'stroke-width': 5 }, g);
    WB.showNow(WB.textStrokes(String(n), x, y + 23, 68, BLK, g, 'middle').strokes);
    return { g, c };
  };
  const n1 = num(1, X1, 740), n2 = num(2, X2 + 20, 700), n3 = num(3, 700, 880);

  // vivos: respiração leve
  [[p1, 0], [p2, 1.1], [p3, 2.3]].forEach(([p, o]) => WB.effect(t => {
    if (p.morto && t >= p.morto) return;
    const k = 1 + 0.012 * Math.sin((t + o) * 3.1), ox = p.x + p.w / 2, oy = p.y + p.h;
    p.im.setAttribute('transform', `translate(${r1(ox)} ${r1(oy)}) scale(1 ${k.toFixed(4)}) translate(${r1(-ox)} ${r1(-oy)})`);
  }));
  // pulinho do 1
  WB.effect(t => { const u = t - tB1; const dy = u > 0 && u < 0.45 ? -Math.sin(u / 0.45 * Math.PI) * 22 : 0;
    p1.corpo.setAttribute('transform', `translate(0 ${r1(dy)})`); });

  // choque: clarão piscando, faíscas, corrente pelo caminho, depois chamuscado com fumacinha
  function choque(p, a, caminho, extra) {
    p.morto = a;
    const fx = WB.group(cena);
    const linha = mk('path', { d: caminho, fill: 'none', stroke: '#f5b301', 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-dasharray': '8 16', opacity: 0 }, fx);
    const raios = WB.group(fx);
    for (let k = 0; k < 7; k++) {
      const ang = -Math.PI / 2 + (k - 3) * 0.5, R = Math.max(p.w, p.h) * 0.42;
      const x = p.cx + Math.cos(ang) * R, y = p.cy + Math.sin(ang) * R;
      const ex = Math.cos(ang) * 44, ey = Math.sin(ang) * 44;
      mk('path', { d: `M ${r1(x)} ${r1(y)} l ${r1(ex * 0.5 + ey * 0.3)} ${r1(ey * 0.5 - ex * 0.3)} l ${r1(-ey * 0.5)} ${r1(ex * 0.5)} l ${r1(ex * 0.6 + ey * 0.3)} ${r1(ey * 0.6 - ex * 0.3)}`,
        fill: 'none', stroke: '#f5b301', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, raios);
    }
    const fum = WB.group(fx);
    const bolas = [0, 1, 2].map(k => mk('circle', { cx: p.cx - 25 + k * 25, cy: p.y + p.h * 0.1, r: 14, fill: '#9a9a9a', opacity: 0 }, fum));
    WB.effect(t => {
      const u = t - a, on = u >= 0 && u < 1.0, pisc = on ? Math.floor(u * 14) % 2 : 0;
      linha.setAttribute('opacity', u >= 0 ? (on ? 1 : Math.max(0, 1 - (u - 1.0) / 0.8)).toFixed(2) : 0);
      linha.setAttribute('stroke-dashoffset', r1(-(t * 220) % 24));
      raios.setAttribute('opacity', on ? (0.35 + 0.65 * pisc) : 0);
      p.im.setAttribute('filter', on ? (pisc ? 'url(#clarao)' : '') : (u >= 1.0 ? 'url(#fuligem)' : ''));
      p.corpo.setAttribute('transform', on ? `translate(${r1(Math.sin(u * 90) * 5)} ${r1(Math.cos(u * 70) * 4)})` : '');
      if (u >= 0) p.im.setAttribute('transform', '');
      bolas.forEach((b, i) => { const v = u - 1.0 - i * 0.35; const w = v > 0 ? (v % 1.6) / 1.6 : -1;
        b.setAttribute('opacity', w < 0 ? 0 : (0.7 * (1 - w)).toFixed(2));
        b.setAttribute('cy', r1(p.y + p.h * 0.15 - w * 110)); b.setAttribute('r', r1(12 + w * 18)); });
      if (extra) extra(t, u);
    });
  }
  // 2: fio -> pés -> corpo -> rabo -> poste -> chão
  { const desc = mk('path', { d: `M ${(XP0 + XP1) / 2} ${YT + 50} L ${(XP0 + XP1) / 2} ${YG}`, fill: 'none', stroke: '#f5b301', 'stroke-width': 10, 'stroke-dasharray': '10 16', opacity: 0 }, cena);
    const faisca = WB.group(cena);
    for (let k = 0; k < 5; k++) mk('path', { d: `M ${165} ${YG} l ${(k - 2) * 26} ${-30 - (k % 2) * 16}`, stroke: '#f5b301', 'stroke-width': 7, 'stroke-linecap': 'round' }, faisca);
    choque(p2, tZ2, `M ${X2 + 20} ${YT} L ${X2} ${YT - 50} L ${X2 - 70} ${YT + 10} L ${XP1} ${YT + 46}`, (t, u) => {
      const on = u >= 0 && u < 1.0;
      desc.setAttribute('opacity', u >= 0 ? (on ? 1 : Math.max(0, 1 - (u - 1.0) / 0.8)).toFixed(2) : 0);
      desc.setAttribute('stroke-dashoffset', r1((t * 260) % 26));
      faisca.setAttribute('opacity', on && Math.floor(u * 12) % 2 ? 1 : 0);
    });
  }
  // 3: fio de cima -> cabeça -> corpo -> pés -> fio de baixo
  choque(p3, tZ3, `M ${X3 - 55} ${YT} L ${X3 - 40} ${YT + 90} L ${X3 - 10} ${YT + 200} L ${X3} ${YB}`);

  // marcar números: verde (de boa) / vermelho (choque)
  const marca = (n, a, cor) => WB.effect(t => n.c.setAttribute('fill', t >= a ? cor : '#fffaf0'));
  marca(n1, tB1, '#bbf7d0'); marca(n2, tZ2, '#fecaca'); marca(n3, tZ3, '#fecaca');

  // ---------------- textos de baixo ----------------
  const bloco = (a, b) => { const g = WB.group(); janela(g, a - 0.01, b); return g; };
  const TY = 1470;
  { const g = bloco(0, st(2));
    W(st(1) + F(1) * 0.7, st(1) + F(1) + 0.2, 'Comenta: 1, 2 ou 3?', 540, TY, 88, INK.black, { parent: g });
    [3, 2, 1].forEach((n, k) => { const a = st(1) + F(1) + 0.25 + k * 1.2; pop(a, a + 1.1, String(n), 540, TY + 190, 160, INK.red, g); });
  }
  rest(0.1, 0.2);
  { const g = bloco(st(2), st(3)); pop(st(2) + 0.05, 999, 'LIGA A ENERGIA!', 540, TY + 60, 110, '#d97706', g); }
  { const g = bloco(st(3), st(4));
    pop(tB1, 999, '1: DE BOA', 540, TY, 100, INK.green, g);
    W(st(3) + F(3) * 0.35, st(3) + F(3) * 0.95, 'os 2 pés no mesmo fio', 540, TY + 115, 72, INK.black, { parent: g }); }
  { const g = bloco(st(4), st(5));
    pop(tZ2, 999, '2: CHOQUE!', 540, TY, 100, INK.red, g);
    W(st(4) + F(4) * 0.3, st(4) + F(4) * 0.5, 'rabo encostou no poste', 540, TY + 115, 72, INK.black, { parent: g });
    W(st(4) + F(4) * 0.55, st(4) + F(4) + 0.3, 'do fio, por ele, até o chão', 540, TY + 210, 66, INK.black, { parent: g });
    D(st(4) + F(4) * 0.3, st(4) + F(4) * 0.4, [sp(WB.loopEllipse(XP1 + 4, YT + 46, 46, 36), INK.red, 7, g)]); }
  { const g = bloco(st(5), st(6));
    pop(tZ3, 999, '3: CHOQUE!', 540, TY, 100, INK.red, g);
    W(st(5) + F(5) * 0.42, st(5) + F(5) * 0.66, 'cabeça no fio de cima', 540, TY + 115, 72, INK.black, { parent: g });
    D(st(5) + F(5) * 0.42, st(5) + F(5) * 0.54, [sp(WB.loopEllipse(X3 - 55, YT + 14, 52, 38), INK.red, 7, g)]); }
  { const g = bloco(st(6), st(7));
    W(st(6) + 0.2, st(6) + F(6) * 0.4, 'CHOQUE = corrente', 540, TY, 90, INK.red, { parent: g });
    W(st(6) + F(6) * 0.4, st(6) + F(6) * 0.62, 'entra por um lado', 540, TY + 110, 70, INK.black, { parent: g });
    W(st(6) + F(6) * 0.62, st(6) + F(6) * 0.8, 'e sai pelo outro', 540, TY + 200, 70, INK.black, { parent: g }); }
  W(st(7) + 0.1, st(7) + F(7) * 0.35, 'Tu acertou?', 540, TY + 20, 110, INK.red);
  W(st(7) + F(7) * 0.45, st(7) + F(7) + 0.3, 'manda pro amigo eletricista', 540, TY + 160, 66, INK.black);
  rest(st(7) + F(7) + 0.4, END - 0.1);

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
    const SPOTS = [[290, 1785], [790, 1785], [540, 1800], [300, 1780]];
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
