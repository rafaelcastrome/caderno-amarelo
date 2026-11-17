// "Pra que lado ela gira?": bailarina em silhueta girando (ilusão biestável), ajudantes com contorno no meio.
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
  const st = c => S[c - 1].start, fim = c => S[c - 1].start + S[c - 1].fala, F = c => S[c - 1].fala;
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
  const END = S[S.length - 1].end;
  const seta = (x, y, dir, len, cor, w, parent) => { // seta reta pronta (fonte não tem ← →)
    const xb = x + dir * len, h = Math.max(16, len * 0.38);
    WB.showNow([sp(`M ${x} ${y} L ${xb} ${y} M ${xb - dir * h} ${y - h * 0.8} L ${xb} ${y} L ${xb - dir * h} ${y + h * 0.8}`, cor, w, parent)]);
  };
  const popSeta = (a, b, txt, x, y, size, cor, dir) => { // texto + seta, aparecendo com pulo
    const g = pop(a, b, txt, x, y, size, cor);
    const tw = WB.measure(txt, size), xs = dir > 0 ? x + tw / 2 + 14 : x - tw / 2 - 14;
    seta(xs, y - size * 0.3, dir, size * 0.8, cor, 7, g); return g;
  };

  // ---------------- modelo 3D da bailarina (y pra cima, z pra quem olha) ----------------
  const CAP = [ // [p1, p2, raio]
    [[-0.05, 0.53, 0], [-0.03, 0.28, 0.012], 0.042],      // coxa (perna de apoio)
    [[-0.03, 0.28, 0.012], [-0.01, 0.045, 0], 0.03],      // canela
    [[-0.01, 0.045, 0], [0.04, 0.02, 0.03], 0.02],         // pé
    [[0.05, 0.53, 0], [0.18, 0.43, -0.14], 0.04],          // coxa (perna levantada)
    [[0.18, 0.43, -0.14], [0.31, 0.37, -0.27], 0.028],     // canela
    [[0.31, 0.37, -0.27], [0.36, 0.345, -0.32], 0.019],    // pé esticado
    [[0, 0.54, 0], [0, 0.66, 0.005], 0.05],                // cintura
    [[0, 0.66, 0.005], [0, 0.76, 0], 0.068],               // peito
    [[-0.075, 0.79, 0], [0.075, 0.79, 0], 0.036],          // ombros
    [[0, 0.79, 0], [0, 0.865, 0.01], 0.026],               // pescoço
    [[-0.08, 0.79, 0], [-0.125, 0.955, 0.035], 0.023],     // braço de cima
    [[-0.125, 0.955, 0.035], [-0.045, 1.085, 0.02], 0.019],
    [[0.08, 0.79, 0], [0.215, 0.79, 0.085], 0.023],        // braço do lado
    [[0.215, 0.79, 0.085], [0.345, 0.815, 0.13], 0.019],
    [[0, 0.975, -0.05], [0, 0.875, -0.115], 0.028],        // rabo de cavalo
  ];
  const SPH = [ // [centro, raio]
    [[0, 0.925, 0.012], 0.066], [[0, 0.975, -0.04], 0.03], // cabeça + coque
    [[-0.04, 1.095, 0.02], 0.022], [[0.355, 0.818, 0.135], 0.022], // mãos
  ];
  const TUTU = { y0: 0.555, r0: 0.07, y1: 0.475, r1: 0.205 };
  const PIV = -0.01, ELEV = 0.10, T = 2.1;  // eixo no pé de apoio, câmera quase na altura dela, 1 volta a cada 2,1 s

  function hull(P) {
    P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of P.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }

  // modo: 0 = só silhueta (ambígua), +1 = contornos de quem gira pra DIREITA, -1 = pra ESQUERDA
  function bailarina(parent, modo) {
    const g = WB.group(parent);
    const BLK = '#1f1f24', OUT = '#fbf5df';
    const itens = [];
    const add = (tipo, dados) => {
      const els = [];
      if (modo) els.push(WB.mk(tipo === 'c' ? 'path' : tipo === 's' ? 'circle' : 'path', tipo === 'c'
        ? { fill: 'none', stroke: OUT, 'stroke-linecap': 'round' } : tipo === 's' ? { fill: OUT } : { fill: OUT, stroke: OUT, 'stroke-linejoin': 'round' }, g));
      els.push(WB.mk(tipo === 's' ? 'circle' : 'path', tipo === 'c'
        ? { fill: 'none', stroke: BLK, 'stroke-linecap': 'round' } : { fill: BLK }, g));
      itens.push({ tipo, dados, els, z: 0 });
    };
    CAP.forEach(c => add('c', c)); SPH.forEach(s => add('s', s)); add('t', TUTU);
    const L = modo ? 3.2 : 0; // espessura do contorno
    function upd(t, cx, base, sc, op = 1) {
      g.setAttribute('opacity', op.toFixed(3));
      if (op <= 0) return;
      const ph = 2 * Math.PI * t / T, co = Math.cos(ph), si = Math.sin(ph), ce = Math.cos(ELEV), se = Math.sin(ELEV);
      const pj = ([x, y, z]) => {
        const xr = (x - PIV) * co + z * si, zr = -(x - PIV) * si + z * co;
        return [cx + sc * xr, base - sc * (y * ce - zr * se), zr * ce + y * se];
      };
      for (const it of itens) {
        if (it.tipo === 'c') {
          const a = pj(it.dados[0]), b = pj(it.dados[1]), w = 2 * it.dados[2] * sc;
          const d = `M ${r1(a[0])} ${r1(a[1])} L ${r1(b[0])} ${r1(b[1])}`;
          it.els.forEach((e, i) => { e.setAttribute('d', d); e.setAttribute('stroke-width', r1(w + (modo && i === 0 ? 2 * L : 0))); });
          it.z = (a[2] + b[2]) / 2;
        } else if (it.tipo === 's') {
          const c = pj(it.dados[0]), r = it.dados[1] * sc;
          it.els.forEach((e, i) => { e.setAttribute('cx', r1(c[0])); e.setAttribute('cy', r1(c[1])); e.setAttribute('r', r1(r + (modo && i === 0 ? L : 0))); });
          it.z = c[2] + 0.001;
        } else {
          const P = [];
          for (let k = 0; k < 28; k++) {
            const a = 2 * Math.PI * k / 28;
            const p0 = pj([PIV + TUTU.r0 * Math.cos(a), TUTU.y0, TUTU.r0 * Math.sin(a)]);
            const p1 = pj([PIV + TUTU.r1 * Math.cos(a), TUTU.y1, TUTU.r1 * Math.sin(a)]);
            P.push(p0, p1);
          }
          const d = 'M ' + hull(P.map(p => [p[0], p[1]])).map(p => `${r1(p[0])} ${r1(p[1])}`).join(' L ') + ' Z';
          it.els.forEach((e, i) => { e.setAttribute('d', d); if (modo && i === 0) e.setAttribute('stroke-width', r1(2 * L)); });
          it.z = pj([PIV, 0.53, 0])[2];
        }
      }
      if (modo) { // ordem de profundidade: o de trás primeiro (para a esquerda, profundidade invertida)
        itens.slice().sort((a, b) => modo * (a.z - b.z)).forEach(it => it.els.forEach(e => g.appendChild(e)));
      }
    }
    return upd;
  }

  // ---------------- título (pronto no quadro 0) ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('PRA QUE LADO', 540, 200, 108, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('ELA GIRA?', 540, 315, 108, INK.red, tit, 'middle').strokes);
  WB.effect(t => { const k = 1 + 0.04 * Math.sin(t * 5) * Math.exp(-t * 0.6);
    tit.setAttribute('transform', `translate(540 240) scale(${k.toFixed(3)}) translate(-540 -240)`); });
  const opc = WB.group();
  WB.showNow(WB.textStrokes('ESQUERDA', 330, 430, 70, INK.blue, opc, 'middle').strokes);
  seta(185, 408, -1, 60, INK.blue, 8, opc);
  WB.showNow(WB.textStrokes('ou', 540, 430, 54, INK.gray, opc, 'middle').strokes);
  WB.showNow(WB.textStrokes('DIREITA', 740, 430, 70, INK.blue, opc, 'middle').strokes);
  seta(865, 408, +1, 60, INK.blue, 8, opc);
  janela(opc, -1, st(4) + 0.2);

  // ---------------- as três bailarinas ----------------
  const chao = WB.group();
  const linhaChao = WB.mk('path', { fill: 'none', stroke: '#1f1f24', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.55 }, chao);
  const fig = bailarina(null, 0), dir = bailarina(null, +1), esq = bailarina(null, -1);
  // setas no chão das ajudantes (meia elipse da frente + ponta)
  function setaChao(sentido) {
    const g = WB.group();
    const p = WB.mk('path', { fill: 'none', stroke: INK.red, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    return (cx, cy, rx, op) => {
      g.setAttribute('opacity', op.toFixed(3)); const ry = rx * 0.22;
      // arco da frente (metade de baixo da elipse); ponta no lado pra onde vai
      const xa = cx - sentido * rx, xb = cx + sentido * rx;
      let d = `M ${r1(xa)} ${r1(cy)} A ${r1(rx)} ${r1(ry)} 0 0 ${sentido > 0 ? 0 : 1} ${r1(xb)} ${r1(cy)}`;
      d += ` M ${r1(xb - sentido * 30)} ${r1(cy + 6)} L ${r1(xb)} ${r1(cy)} L ${r1(xb - sentido * 6)} ${r1(cy + 30)}`;
      p.setAttribute('d', d);
    };
  }
  const sD = setaChao(+1), sE = setaChao(-1);

  const A4 = st(4) + 0.15, B5 = st(5) + F(5) * 0.35;          // encolhe / volta
  const tD = st(4) + F(4) * 0.22, tE = st(4) + F(4) * 0.5;    // ajudantes aparecem
  WB.effect(t => {
    const k = ease(clamp((t - A4) / 0.7)) * (1 - ease(clamp((t - B5) / 0.8)));
    const sc = lerp(760, 470, k), base = lerp(1470, 1300, k);
    fig(t, 540 + 0.05 * sc * 0, base, sc);
    linhaChao.setAttribute('d', `M ${r1(540 - sc * 0.22)} ${r1(base + 8)} L ${r1(540 + sc * 0.2)} ${r1(base + 8)}`);
    const sh = 330, bh = 1290, xD = 865, xE = 215;
    const oD = clamp((t - tD) / 0.3) * (1 - clamp((t - B5) / 0.4)), oE = clamp((t - tE) / 0.3) * (1 - clamp((t - B5) / 0.4));
    dir(t, xD, bh, sh, oD); esq(t, xE, bh, sh, oE);
    sD(xD, bh + 30, 105, oD); sE(xE, bh + 30, 105, oE);
  });
  popSeta(tD, B5, 'DIREITA', 845, 1440, 60, INK.red, +1);
  popSeta(tE, B5, 'ESQUERDA', 245, 1440, 60, INK.red, -1);
  { // "e a do meio?"
    const g = pop(st(4) + F(4) * 0.78, B5, 'e essa?', 540, 1440, 66, INK.black);
  }

  // ---------------- cena 1 ----------------
  rest(0.1, 0.2);
  { const c1 = WB.group(); W(st(1) + F(1) * 0.78, st(1) + F(1) + 0.9, 'guarda tua resposta!', 540, 1610, 76, INK.green, { parent: c1 }); janela(c1, -1, st(2)); }

  // ---------------- cena 2 ----------------
  const c2 = WB.group();
  W(st(2) + 0.2, st(2) + F(2) * 0.55, 'METADE vê girar', 540, 1580, 80, INK.black, { parent: c2 });
  W(st(2) + F(2) * 0.55, st(2) + F(2) + 0.3, 'pro OUTRO lado!', 540, 1680, 88, INK.red, { parent: c2 });
  janela(c2, -1, st(3));

  // ---------------- cena 3: olha só pro pé ----------------
  const veu = WB.mk('rect', { x: 0, y: 470, width: 1080, height: 600, fill: '#fbf5df', opacity: 0 });
  WB.effect(t => veu.setAttribute('opacity', (0.82 * clamp((t - (st(3) + F(3) * 0.45)) / 0.6) * (1 - clamp((t - st(4)) / 0.3))).toFixed(3)));
  const c3 = WB.group();
  const tPe = st(3) + F(3) * 0.38;
  D(tPe, tPe + 0.7, [sp(WB.loopEllipse ? WB.loopEllipse(540, 1450, 120, 50) : WB.circlePath(540, 1450, 90), INK.red, 8, c3)]);
  W(st(3) + F(3) * 0.5, st(3) + F(3) * 0.8, 'olha SÓ pro pé', 540, 1600, 80, INK.red, { parent: c3 });
  W(st(3) + F(3) * 0.8, st(3) + F(3) + 0.5, 'e imagina o contrário', 540, 1695, 66, INK.black, { parent: c3 });
  janela(c3, -1, st(4));

  // ---------------- cena 5 ----------------
  const c5 = WB.group();
  W(st(5) + F(5) * 0.3, st(5) + F(5) * 0.55, 'AS DUAS tão certas!', 540, 1580, 84, INK.green, { parent: c5 });
  W(st(5) + F(5) * 0.62, st(5) + F(5) + 0.3, 'quem escolhe é teu CÉREBRO', 540, 1680, 66, INK.black, { parent: c5 });
  janela(c5, -1, st(6));

  // ---------------- cena 6: CTA ----------------
  { const g6 = WB.group(); W(st(6) + 0.1, st(6) + F(6) * 0.45, 'Comenta:', 360, 1590, 84, INK.red, { parent: g6 });
    D(st(6) + F(6) * 0.45, st(6) + F(6) * 0.6, [sp('M 640 1565 L 560 1565 M 590 1540 L 560 1565 L 590 1590', INK.red, 8, g6)]);
    W(st(6) + F(6) * 0.6, st(6) + F(6) * 0.7, 'ou', 690, 1590, 64, INK.gray, { parent: g6 });
    D(st(6) + F(6) * 0.7, st(6) + F(6) * 0.85, [sp('M 740 1565 L 820 1565 M 790 1540 L 820 1565 L 790 1590', INK.red, 8, g6)]); }
  W(st(6) + F(6) * 0.5, st(6) + F(6) + 0.3, 'e se conseguiu trocar!', 540, 1690, 66, INK.black);
  rest(st(6) + F(6) + 0.4, END - 0.1);

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
