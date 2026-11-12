// "Tu tem dois narizes" (ilusão de Aristóteles), ~34 s, narração Gemini Algieba (3.1, take único).
// Cruza os dedos, fecha o olho, esfrega o nariz entre as pontas: sente dois narizes.
window.CENAS = function (WB) {
  const { INK, C, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const D = (t0, t1, st) => { const c = sceneOf(t0); WB.draw(c, fr(c, t0), fr(c, t1), st); };
  const W = (t0, t1, txt, x, y, size, cor, o = {}) => { const c = sceneOf(t0); return WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o }); };
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 6, parent) => WB.strokePath(d, cor, w, parent);
  const circ = (x, y, r) => WB.circlePath(r1(x), r1(y), r);
  const SKIN = '#f6d6bf', SKIN_D = '#c98b6b';
  const fadeOut = (g, ts, d = 0.25) => WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - ts) / d)).toFixed(3)));
  const fadeIn = (g, ts, d = 0.25) => { g.setAttribute('opacity', 0); WB.effect(t => g.setAttribute('opacity', clamp((t - ts) / d).toFixed(3))); };
  const fim = c => S[c - 1].start + S[c - 1].fala;
  const aviso = (t0, t1, tSome, txt, x, y, size, cor, parent) => {
    const g = WB.group(parent); W(t0, t1, txt, x, y, size, cor, { parent: g }); if (tSome) fadeOut(g, tSome); return g;
  };
  function countdown(t0, t1, x, y, parent) {
    const n = Math.ceil(t1 - t0 - 0.01);
    const g = WB.group(parent), nums = [];
    for (let k = 1; k <= n; k++) {
      const gk = WB.group(g);
      WB.showNow(WB.textStrokes(String(k), x, y, 150, INK.red, gk, 'middle').strokes);
      gk.setAttribute('opacity', 0); nums.push(gk);
    }
    WB.effect(t => {
      const v = (t >= t0 && t < t1) ? Math.ceil(t1 - t - 0.001) : 0;
      nums.forEach((gk, i) => gk.setAttribute('opacity', i + 1 === v ? 1 : 0));
    });
    return g;
  }
  // rosto simples; narizes = lista de x
  function rosto(cx, cy, R, narizes, parent) {
    const g = WB.group(parent);
    const pts = [];
    pts.push([circ(cx, cy, R), INK.black, 7]);
    pts.push([`M ${cx - R * 0.42} ${cy - R * 0.25} Q ${cx - R * 0.3} ${cy - R * 0.38} ${cx - R * 0.18} ${cy - R * 0.25}`, INK.black, 7]);
    pts.push([`M ${cx + R * 0.18} ${cy - R * 0.25} Q ${cx + R * 0.3} ${cy - R * 0.38} ${cx + R * 0.42} ${cy - R * 0.25}`, INK.black, 7]);
    pts.push([circ(cx - R * 0.3, cy - R * 0.12, 14), INK.black, 12], [circ(cx + R * 0.3, cy - R * 0.12, 14), INK.black, 12]);
    narizes.forEach(nx => pts.push([`M ${nx} ${cy - R * 0.05} Q ${nx - 10} ${cy + R * 0.2} ${nx - 30} ${cy + R * 0.26} Q ${nx} ${cy + R * 0.34} ${nx + 26} ${cy + R * 0.24}`, INK.red, 8]));
    pts.push([`M ${cx - R * 0.4} ${cy + R * 0.48} Q ${cx} ${cy + R * 0.78} ${cx + R * 0.4} ${cy + R * 0.48}`, INK.black, 8]);
    return { g, strokes: pts.map(([d, c, w]) => sp(d, c, w, g)) };
  }
  // dedo: base (bx,by), ângulo (graus, + = ponta pra direita), comprimento, largura
  function dedo(bx, by, ang, len, w, parent) {
    const a = ang * Math.PI / 180, ux = Math.sin(a), uy = -Math.cos(a), nx = -uy, ny = ux;   // u = pra ponta, n = lado
    const P = (s, t) => `${r1(bx + ux * s + nx * t)} ${r1(by + uy * s + ny * t)}`;
    const h = w / 2, top = len - h;
    let d = `M ${P(0, -h)} L ${P(top, -h)}`;
    for (let i = 1; i <= 10; i++) { const th = Math.PI * i / 10; d += ` L ${P(top + h * Math.sin(th), -h * Math.cos(th))}`; }
    d += ` L ${P(0, h)}`;
    const g = WB.group(parent);
    WB.mk('path', { d: d + ' Z', fill: SKIN, stroke: 'none' }, g);
    const contorno = sp(d, INK.black, 6, g);
    const unha = sp(`M ${P(top - 50, -h * 0.55)} L ${P(top + 10, -h * 0.55)} Q ${P(top + h * 0.75, 0)} ${P(top + 10, h * 0.55)} L ${P(top - 50, h * 0.55)} Q ${P(top - 62, 0)} ${P(top - 50, -h * 0.55)}`, SKIN_D, 4, g);
    const dobra = sp(`M ${P(len * 0.42, -h * 0.4)} Q ${P(len * 0.40, 0)} ${P(len * 0.42, h * 0.4)} M ${P(len * 0.2, -h * 0.4)} Q ${P(len * 0.18, 0)} ${P(len * 0.2, h * 0.4)}`, SKIN_D, 4, g);
    return { g, strokes: [contorno, unha, dobra], tip: [bx + ux * len, by + uy * len] };
  }

  // ===================== FOLHA 1 =====================
  const tit = WB.group();
  WB.showNow(WB.textStrokes('TU TEM 2 NARIZES?', 540, 230, 112, INK.red, tit, 'middle').strokes);
  // cena 1: rosto pronto desde o quadro 0
  const face1 = rosto(540, 880, 300, [540]);
  WB.showNow(face1.strokes);
  const q = WB.group(face1.g); WB.showNow(WB.textStrokes('?', 850, 700, 200, INK.blue, q, 'middle').strokes);
  aviso(0.3, 1.2, null, 'FAZ COMIGO!', 540, 1450, 120, INK.blue, face1.g);
  W(1.9, 3.2, 'vai ser MUITO estranho', 540, 1580, 76, INK.gray, { parent: face1.g });
  fadeOut(face1.g, S[1].start - 0.05, 0.2);
  rest(3.3, S[1].start - 0.05);

  // cena 2: mão com dedos cruzados (meio por cima do indicador)
  const s2 = S[1].start;
  const mao = WB.group();
  const palmD = `M 360 1420 Q 350 1700 420 1760 L 680 1760 Q 760 1700 740 1420 Q 640 1370 540 1380 Q 430 1380 360 1420 Z`;
  const palmFill = WB.mk('path', { d: palmD, fill: SKIN, stroke: 'none' }, mao);
  const palm = sp(palmD, INK.black, 6, mao);
  const ind = dedo(460, 1460, 13, 720, 128, mao);
  const mei = dedo(640, 1460, -13, 740, 128, mao);
  fadeIn(palmFill, s2 + 0.2, 0.3);
  [ind, mei].forEach((f, i) => fadeIn(f.g.firstChild, s2 + 0.6 + i * 0.9, 0.3));
  D(s2 + 0.15, s2 + 0.6, [palm]);
  D(s2 + 0.6, s2 + 1.4, ind.strokes);
  D(s2 + 1.5, s2 + 2.3, mei.strokes);
  aviso(s2 + 0.2, s2 + 1.0, S[2].start, 'CRUZA OS DEDOS', 540, 420, 96, INK.blue, mao);
  const lbl = WB.group(mao);
  W(s2 + 2.4, s2 + 2.9, 'do meio', 250, 1180, 62, INK.purple, { parent: lbl });
  D(s2 + 2.9, s2 + 3.1, [C.arrow(300, 1210, 420, 1240, INK.purple, 5, lbl)]);
  W(s2 + 3.1, s2 + 3.6, 'por cima', 860, 1180, 62, INK.purple, { parent: lbl });
  D(s2 + 3.6, s2 + 3.8, [C.arrow(800, 1210, 660, 1240, INK.purple, 5, lbl)]);
  fadeOut(lbl, S[2].start + 0.2);
  // cena 3: fecha o olho, nariz entre as pontas
  const s3 = S[2].start;
  const t3 = WB.group();
  aviso(s3 + 0.05, s3 + 0.6, null, 'FECHA O OLHO', 540, 420, 96, INK.red, t3);
  D(s3 + 0.6, s3 + 0.9, [sp(`M 830 520 Q 880 560 930 520 M 845 535 L 835 560 M 880 545 L 880 572 M 915 535 L 925 560`, INK.black, 6, t3)]);
  fadeOut(t3, S[3].start - 0.1, 0.15);
  const alvo = WB.group(mao);
  const gx = (ind.tip[0] + mei.tip[0]) / 2, gy = (ind.tip[1] + mei.tip[1]) / 2 + 20;
  D(s3 + 2.2, s3 + 2.7, [sp(WB.loopEllipse(gx, gy, 95, 80), INK.red, 8, alvo)]);
  W(s3 + 2.8, s3 + 3.5, 'NARIZ AQUI', 860, 700, 72, INK.red, { parent: alvo });
  // nariz de perfil descendo até as pontas
  const nz = WB.group(alvo);
  const narizD = `M -40 -200 Q -30 -60 -70 -10 Q -40 20 10 10`;
  const nzs = sp(narizD, INK.black, 8, nz);
  WB.showNow(nzs);
  WB.effect(t => {
    const u = ease(clamp((t - (s3 + 3.5)) / 0.8));
    nz.setAttribute('opacity', t >= s3 + 3.5 ? 1 : 0);
    const wob = t > S[3].start ? Math.sin((t - S[3].start) * 7) * 30 : 0;
    nz.setAttribute('transform', `translate(${r1(gx + 40)} ${r1(lerp(gy - 260, gy - 20, u) + wob)})`);
  });
  // cena 4: esfrega
  const s4 = S[3].start;
  const t4 = WB.group(mao);
  aviso(s4 + 0.05, s4 + 0.6, null, 'ESFREGA', 540, 420, 110, INK.purple, t4);
  D(s4 + 0.7, s4 + 1.1, [C.arrow(gx + 160, gy + 60, gx + 160, gy - 80, INK.green, 7, t4), C.arrow(gx - 160, gy - 80, gx - 160, gy + 60, INK.green, 7, t4)]);
  countdown(fim(4) + 0.1, S[3].end - 0.05, 900, 1250, t4);
  rest(s4 + 1.2, S[3].end - 0.1);

  // ===================== FOLHA 2: dois narizes =====================
  WB.newPage(5, 0, 0.05);
  const s5 = S[4].start;
  const face2 = rosto(540, 860, 300, [470, 610]);
  D(s5 + 0.2, s5 + 1.2, face2.strokes);
  W(s5 + 1.3, s5 + 1.9, '2 NARIZES!', 540, 1400, 150, INK.red);
  const tit2 = WB.group();
  WB.showNow(WB.textStrokes('TU TEM 2 NARIZES?', 540, 230, 112, INK.red, tit2, 'middle').strokes);
  // cena 6: por quê
  const s6 = S[5].start;
  W(s6 + 0.3, s6 + 1.6, 'teu cérebro acha que', 540, 1560, 70, INK.gray);
  W(s6 + 1.6, s6 + 2.6, 'os dedos tão no lugar normal', 540, 1650, 66, INK.gray);
  W(s6 + 3.2, s6 + 3.7, 'achei!', 260, 1050, 76, INK.blue);
  D(s6 + 3.7, s6 + 3.9, [C.arrow(300, 1010, 430, 960, INK.blue, 6)]);
  W(s6 + 3.9, s6 + 4.4, 'achei!', 830, 1050, 76, INK.blue);
  D(s6 + 4.4, s6 + 4.6, [C.arrow(790, 1010, 650, 960, INK.blue, 6)]);
  W(s6 + 5.0, s6 + 5.8, '1 + 1 = 2', 540, 1780, 90, INK.purple);
  rest(s6 + 5.9, S[5].end - 0.1);

  // ===================== FOLHA 3: CTA =====================
  WB.newPage(7, 0, 0.05);
  const s7 = S[6].start;
  W(s7 + 0.15, s7 + 0.9, 'TESTA NO AMIGO', 540, 640, 120, INK.blue);
  W(s7 + 1.2, s7 + 1.6, 'e comenta:', 540, 880, 90, INK.gray);
  W(s7 + 1.7, s7 + 2.6, 'SENTIU 2?', 540, 1120, 170, INK.red);
  rest(s7 + 2.7, S[6].end - 0.1);

  // MARCA D'ÁGUA QUE PASSEIA (faixa de baixo, fora da grade)
  // =====================================================================
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[290, 1770], [790, 1770], [540, 1800], [300, 1760]];
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
