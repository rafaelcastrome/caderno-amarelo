// "Quem leva choque?": circuito com usina, 2 lâmpadas e 3 passarinhos. Resposta: 2 (lâmpada entre os pés) e 3 (rabo no outro fio).
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
    mk('circle', { cx: 860, cy: 540, r: 58, fill: '#ffd23f', stroke: BLK, 'stroke-width': 5 }, sol);
    for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5, c = Math.cos(a), s2 = Math.sin(a);
      mk('path', { d: `M ${r1(860 + c * 76)} ${r1(540 + s2 * 76)} L ${r1(860 + c * 104)} ${r1(540 + s2 * 104)}`, stroke: '#f5b301', 'stroke-width': 8, 'stroke-linecap': 'round' }, sol); }
    WB.effect(t => sol.setAttribute('transform', `rotate(${r1(t * 12)} 860 540)`));
    const nuvem = (x, y, s3) => { const n = WB.group(ceu);
      [[0, 0, 46], [44, -22, 52], [92, 0, 44], [46, 12, 44]].forEach(([dx, dy, r]) => mk('circle', { cx: x + dx * s3, cy: y + dy * s3, r: r * s3, fill: '#ffffff', stroke: BLK, 'stroke-width': 5 }, n));
      [[0, 0, 46], [44, -22, 52], [92, 0, 44], [46, 12, 44]].forEach(([dx, dy, r]) => mk('circle', { cx: x + dx * s3, cy: y + dy * s3, r: r * s3 - 4, fill: '#ffffff' }, n));
      return n; };
    const n1c = nuvem(170, 560, 0.9), n2c = nuvem(500, 470, 0.7);
    WB.effect(t => { n1c.setAttribute('transform', `translate(${r1(Math.sin(t * 0.4) * 20)} 0)`); n2c.setAttribute('transform', `translate(${r1(Math.sin(t * 0.3 + 1) * 26)} 0)`); });
  }

  // ---------------- circuito ----------------
  const YT = 1110, YB = 1270, XL = 165, XR = 905, XA = 560;
  const cena = WB.group();
  cena.setAttribute('transform', 'translate(497 1290) scale(1.12) translate(-497 -1290)');
  const circ = WB.group(cena);
  // fios
  const fio = d => mk('path', { d, fill: 'none', stroke: BLK, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, circ);
  fio(`M ${XL} ${YT} L ${XA - 34} ${YT} M ${XA + 34} ${YT} L ${XR} ${YT} L ${XR} ${YT + 18}`);
  fio(`M ${XL} ${YB} L ${XR} ${YB} L ${XR} ${YB - 22}`);
  // usina
  mk('rect', { x: 45, y: YT - 60, width: 125, height: YB - YT + 120, rx: 16, fill: '#cfd8e3', stroke: BLK, 'stroke-width': 6 }, circ);
  raio(118, YT - 6, 1.4, circ);
  WB.showNow(WB.textStrokes('USINA', 107, YB + 40, 34, BLK, circ, 'middle').strokes);
  // lâmpada A (no fio de cima, entre os pés do 2)
  const lamp = (cx, cy, r, p, horizontal) => {
    const g = WB.group(p);
    const glow = mk('circle', { cx, cy, r: r * 2.2, fill: '#ffe066', opacity: 0 }, g);
    const vidro = mk('circle', { cx, cy, r, fill: '#fffbe6', stroke: BLK, 'stroke-width': 6 }, g);
    mk('path', { d: `M ${cx - r * 0.45} ${cy + r * 0.2} q ${r * 0.22} ${-r * 0.6} ${r * 0.45} 0 q ${r * 0.22} ${-r * 0.6} ${r * 0.45} 0`, fill: 'none', stroke: BLK, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    return { g, glow, vidro };
  };
  const LA = lamp(XA, YT - 44, 36, circ);
  mk('rect', { x: XA - 18, y: YT - 14, width: 36, height: 16, rx: 3, fill: '#9aa3ad', stroke: BLK, 'stroke-width': 4 }, circ);
  fio(`M ${XA - 34} ${YT} L ${XA - 18} ${YT - 4} M ${XA + 34} ${YT} L ${XA + 18} ${YT - 4}`);
  // lâmpada B (fecha o circuito na direita)
  const LB = lamp(XR, (YT + YB) / 2 - 8, 42, circ);
  mk('rect', { x: XR - 20, y: YB - 34, width: 40, height: 18, rx: 3, fill: '#9aa3ad', stroke: BLK, 'stroke-width': 4 }, circ);
  [LA, LB].forEach(L => WB.effect(t => {
    const on = clamp((t - tLiga) / 0.25);
    L.glow.setAttribute('opacity', (on * (0.45 + 0.08 * Math.sin(t * 9))).toFixed(3));
    L.vidro.setAttribute('fill', on > 0.5 ? '#ffe066' : '#fffbe6');
  }));
  // corrente andando (tracejado amarelo por cima do fio)
  const cor = mk('path', { d: `M ${XL} ${YT} L ${XR} ${YT} L ${XR} ${YB} L ${XL} ${YB}`, fill: 'none', stroke: '#f5b301', 'stroke-width': 7,
    'stroke-linecap': 'round', 'stroke-dasharray': '6 30', opacity: 0 }, circ);
  WB.effect(t => { cor.setAttribute('opacity', clamp((t - tLiga) / 0.3).toFixed(3)); cor.setAttribute('stroke-dashoffset', r1(-(t * 160) % 36)); });

  // ---------------- passarinhos ----------------
  const pe = (x, y, p) => mk('path', { d: `M ${x - 12} ${y + 6} q 12 -16 24 0`, fill: 'none', stroke: '#e07a1f', 'stroke-width': 6, 'stroke-linecap': 'round' }, p);
  const perna = (x1, y1, x2, y2, p) => mk('path', { d: `M ${x1} ${y1} L ${x2} ${y2}`, stroke: '#e07a1f', 'stroke-width': 6, 'stroke-linecap': 'round' }, p);
  function passaro(cx, cy, o) {
    const g = WB.group(cena), corpo = WB.group(g);
    const d = o.dir || 1, rx = o.rx || 66, ry = o.ry || 58;
    if (o.rabo) o.rabo(corpo);
    else mk('path', { d: `M ${cx - d * rx * 0.8} ${cy + 4} l ${-d * 42} ${-18} l ${6 * d} ${34} Z`, fill: o.asa, stroke: BLK, 'stroke-width': 5, 'stroke-linejoin': 'round' }, corpo);
    mk('ellipse', { cx, cy, rx, ry, fill: o.cor, stroke: BLK, 'stroke-width': 6 }, corpo);
    mk('ellipse', { cx: cx + d * rx * 0.22, cy: cy + ry * 0.32, rx: rx * 0.55, ry: ry * 0.5, fill: o.barriga }, corpo);
    if (o.bone) mk('path', { d: `M ${cx - rx * 0.62} ${cy - ry * 0.5} Q ${cx} ${cy - ry * 1.25} ${cx + rx * 0.62} ${cy - ry * 0.5} Q ${cx} ${cy - ry * 0.78} ${cx - rx * 0.62} ${cy - ry * 0.5} Z`, fill: o.bone }, corpo);
    mk('path', { d: `M ${cx - d * rx * 0.55} ${cy - 2} q ${d * rx * 0.5} ${-ry * 0.25} ${d * rx * 0.75} ${ry * 0.35} q ${-d * rx * 0.45} ${ry * 0.3} ${-d * rx * 0.75} ${-ry * 0.35} Z`,
      fill: o.asa, stroke: BLK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, corpo);
    const ex = cx + d * rx * 0.42, ey = cy - ry * 0.32;
    const olho = WB.group(corpo);
    mk('circle', { cx: ex, cy: ey, r: 11, fill: BLK }, olho); mk('circle', { cx: ex + 3.5, cy: ey - 4, r: 4, fill: '#fff' }, olho);
    const olhoX = mk('path', { d: `M ${ex - 10} ${ey - 10} l 20 20 M ${ex + 10} ${ey - 10} l -20 20`, stroke: BLK, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0 }, corpo);
    mk('path', { d: `M ${cx + d * rx * 0.88} ${cy - ry * 0.28} l ${d * 30} ${10} l ${-d * 30} ${12} Z`, fill: '#f59e0b', stroke: BLK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, corpo);
    mk('ellipse', { cx: cx + d * rx * 0.25, cy: cy - ry * 0.02, rx: 10, ry: 6, fill: '#f6a6a6', opacity: 0.8 }, corpo);
    return { g, corpo, olho, olhoX, cx, cy, rx, ry };
  }
  // 1: azul, de boa
  const p1 = passaro(300, 1040, { cor: '#5fa8e8', barriga: '#d6ecff', asa: '#2f76b9' });
  perna(285, 1094, 280, YT - 4, p1.g); perna(318, 1094, 322, YT - 4, p1.g); pe(280, YT - 6, p1.g); pe(322, YT - 6, p1.g);
  // 2: amarelo, pernas abertas por cima da lâmpada
  const p2 = passaro(XA, 935, { cor: '#ffd23f', barriga: '#fff3bf', asa: '#e0a800' });
  perna(XA - 34, 985, XA - 92, YT - 4, p2.g); perna(XA + 34, 985, XA + 92, YT - 4, p2.g); pe(XA - 92, YT - 6, p2.g); pe(XA + 92, YT - 6, p2.g);
  // 3: tesourinha (rabo comprido que cai até o fio de baixo)
  const X3 = 770;
  const p3 = passaro(X3, 1040, { cor: '#b9c2cc', barriga: '#ffffff', asa: '#6b7480', bone: BLK, rx: 60, ry: 54,
    rabo: g => {
      mk('path', { d: `M ${X3 - 40} ${1062} C ${X3 - 70} 1120 ${X3 - 92} 1190 ${X3 - 98} ${YB - 6} L ${X3 - 82} ${YB - 8} C ${X3 - 74} 1190 ${X3 - 52} 1125 ${X3 - 24} 1072 Z`, fill: BLK, stroke: BLK, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
      mk('path', { d: `M ${X3 - 34} ${1066} C ${X3 - 52} 1125 ${X3 - 58} 1190 ${X3 - 60} ${YB - 8} L ${X3 - 44} ${YB - 10} C ${X3 - 40} 1190 ${X3 - 32} 1125 ${X3 - 16} 1074 Z`, fill: BLK, stroke: BLK, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    } });
  perna(X3 - 12, 1090, X3 - 16, YT - 4, p3.g); perna(X3 + 18, 1090, X3 + 20, YT - 4, p3.g); pe(X3 - 16, YT - 6, p3.g); pe(X3 + 20, YT - 6, p3.g);

  // números
  const num = (n, x, y) => {
    const g = WB.group(cena);
    const c = mk('circle', { cx: x, cy: y, r: 46, fill: '#fffaf0', stroke: BLK, 'stroke-width': 5 }, g);
    WB.showNow(WB.textStrokes(String(n), x, y + 24, 70, BLK, g, 'middle').strokes);
    return { g, c };
  };
  const n1 = num(1, 300, 880), n2 = num(2, XA, 780), n3 = num(3, X3, 880);

  // piscar normal dos olhos (vivos)
  [[p1, 0.0], [p2, 1.3], [p3, 2.1]].forEach(([p, o]) => WB.effect(t => {
    const u = (t + o) % 3.4; p.olho.setAttribute('transform', u < 0.12 ? `translate(0 ${r1(p.cy * 0)}) ` : '');
    p.olho.setAttribute('opacity', u < 0.1 ? 0.15 : 1);
  }));
  // pulinho quando é a vez dele
  const pulo = (p, a) => WB.effect(t => { const u = t - a; const dy = u > 0 && u < 0.5 ? -Math.sin(u / 0.5 * Math.PI) * 18 : 0;
    p.corpo.setAttribute('transform', `translate(0 ${r1(dy)})`); });
  pulo(p1, tB1);

  // choque: pisca, raios em volta, corpo chamuscado, penas arrepiadas e fumacinha
  function choque(p, a, caminho) {
    const fx = WB.group(cena);
    const linha = mk('path', { d: caminho, fill: 'none', stroke: '#f5b301', 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-dasharray': '8 18', opacity: 0 }, fx);
    const raios = WB.group(fx);
    for (let k = 0; k < 6; k++) {
      const ang = -Math.PI / 2 + (k - 2.5) * 0.55, R = p.rx + 30;
      const x = p.cx + Math.cos(ang) * R, y = p.cy + Math.sin(ang) * R * 0.95;
      const ex = Math.cos(ang) * 46, ey = Math.sin(ang) * 46;
      mk('path', { d: `M ${r1(x)} ${r1(y)} l ${r1(ex * 0.5 + ey * 0.3)} ${r1(ey * 0.5 - ex * 0.3)} l ${r1(-ey * 0.5)} ${r1(ex * 0.5)} l ${r1(ex * 0.6 + ey * 0.3)} ${r1(ey * 0.6 - ex * 0.3)}`,
        fill: 'none', stroke: '#f5b301', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, raios);
    }
    const fuligem = mk('ellipse', { cx: p.cx, cy: p.cy, rx: p.rx, ry: p.ry, fill: '#3a3a3a', opacity: 0 }, p.corpo);
    const crista = WB.group(p.corpo);
    for (let k = 0; k < 5; k++) {
      const x = p.cx - 30 + k * 15;
      mk('path', { d: `M ${x} ${p.cy - p.ry + 6} l ${(k - 2) * 6} -34`, stroke: BLK, 'stroke-width': 6, 'stroke-linecap': 'round' }, crista);
    }
    const fum = WB.group(fx);
    const bolas = [0, 1, 2].map(k => mk('circle', { cx: p.cx - 20 + k * 20, cy: p.cy - p.ry, r: 14, fill: '#9a9a9a', opacity: 0 }, fum));
    WB.effect(t => {
      const u = t - a, on = u >= 0 && u < 0.9;
      const pisc = on ? (Math.floor(u * 16) % 2) : 0;
      linha.setAttribute('opacity', u >= 0 ? (on ? 1 : Math.max(0, 1 - (u - 0.9) / 0.6)).toFixed(2) : 0);
      linha.setAttribute('stroke-dashoffset', r1(-(t * 220) % 26));
      raios.setAttribute('opacity', on ? (0.4 + 0.6 * pisc) : 0);
      p.corpo.setAttribute('opacity', on && pisc ? 0.35 : 1);
      const k = u >= 0.9 ? 1 : 0;
      fuligem.setAttribute('opacity', k * 0.35); crista.setAttribute('opacity', u >= 0.4 ? 1 : 0);
      p.olho.setAttribute('opacity', u >= 0.4 ? 0 : 1); p.olhoX.setAttribute('opacity', u >= 0.4 ? 1 : 0);
      const tr = on ? `translate(${r1(Math.sin(u * 90) * 5)} ${r1(Math.cos(u * 70) * 4)})` : '';
      p.corpo.setAttribute('transform', tr);
      bolas.forEach((b, i) => { const v = (u - 0.9 - i * 0.35); const w = v > 0 ? (v % 1.6) / 1.6 : -1;
        b.setAttribute('opacity', w < 0 ? 0 : (0.7 * (1 - w)).toFixed(2));
        b.setAttribute('cy', r1(p.cy - p.ry - 10 - w * 110)); b.setAttribute('r', r1(12 + w * 18)); });
    });
  }
  choque(p2, tZ2, `M ${XA - 92} ${YT - 6} L ${XA - 34} 985 Q ${XA} 950 ${XA + 34} 985 L ${XA + 92} ${YT - 6}`);
  choque(p3, tZ3, `M ${X3 - 16} ${YT - 6} L ${X3 - 12} 1088 Q ${X3 - 40} 1080 ${X3 - 60} 1140 Q ${X3 - 82} 1200 ${X3 - 90} ${YB - 6}`);

  // marcar números: verde (de boa) / vermelho (choque)
  const marca = (n, a, cor) => WB.effect(t => { if (t >= a) { n.c.setAttribute('fill', cor); } else n.c.setAttribute('fill', '#fffaf0'); });
  marca(n1, tB1, '#bbf7d0'); marca(n2, tZ2, '#fecaca'); marca(n3, tZ3, '#fecaca');

  // ---------------- textos de baixo ----------------
  const bloco = (a, b) => { const g = WB.group(); janela(g, a - 0.01, b); return g; };
  // cena 1: comenta + contagem
  { const g = bloco(0, st(2));
    W(st(1) + F(1) * 0.7, st(1) + F(1) + 0.2, 'Comenta: 1, 2 ou 3?', 540, 1480, 88, INK.black, { parent: g });
    [3, 2, 1].forEach((n, k) => { const a = st(1) + F(1) + 0.25 + k * 1.2; pop(a, a + 1.1, String(n), 540, 1680, 170, INK.red, g); });
  }
  rest(0.1, 0.2);
  // cena 2
  { const g = bloco(st(2), st(3)); pop(st(2) + 0.05, 999, 'LIGA A ENERGIA!', 540, 1560, 110, '#d97706', g); }
  // cena 3
  { const g = bloco(st(3), st(4));
    pop(tB1, 999, '1: DE BOA', 540, 1480, 100, INK.green, g);
    W(st(3) + F(3) * 0.35, st(3) + F(3) * 0.95, 'os 2 pés no mesmo fio', 540, 1600, 72, INK.black, { parent: g }); }
  // cena 4
  { const g = bloco(st(4), st(5));
    pop(tZ2, 999, '2: CHOQUE!', 540, 1480, 100, INK.red, g);
    W(st(4) + F(4) * 0.3, st(4) + F(4) * 0.6, 'lâmpada entre os pés', 540, 1600, 72, INK.black, { parent: g });
    W(st(4) + F(4) * 0.72, st(4) + F(4) + 0.3, 'a corrente atravessa ele', 540, 1695, 66, INK.black, { parent: g }); }
  // cena 5
  { const g = bloco(st(5), st(6));
    pop(tZ3, 999, '3: CHOQUE!', 540, 1480, 100, INK.red, g);
    W(st(5) + F(5) * 0.3, st(5) + F(5) * 0.62, 'rabo no fio de baixo', 540, 1600, 72, INK.black, { parent: g });
    D(st(5) + F(5) * 0.3, st(5) + F(5) * 0.5, [sp(WB.loopEllipse(497 + (X3 - 72 - 497) * 1.12, 1290 + (YB - 1290) * 1.12, 64, 38), INK.red, 7, g)]); }
  // cena 6
  { const g = bloco(st(6), st(7));
    W(st(6) + 0.2, st(6) + F(6) * 0.4, 'CHOQUE = corrente', 540, 1480, 90, INK.red, { parent: g });
    W(st(6) + F(6) * 0.4, st(6) + F(6) * 0.62, 'entra por um lado', 540, 1590, 70, INK.black, { parent: g });
    W(st(6) + F(6) * 0.62, st(6) + F(6) * 0.8, 'e sai pelo outro', 540, 1680, 70, INK.black, { parent: g }); }
  // cena 7
  W(st(7) + 0.1, st(7) + F(7) * 0.35, 'Tu acertou?', 540, 1500, 110, INK.red);
  W(st(7) + F(7) * 0.45, st(7) + F(7) + 0.3, 'manda pro amigo eletricista', 540, 1640, 66, INK.black);
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
