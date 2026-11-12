// "Dedo-salsicha" (salsicha flutuante), ~32 s, narração Gemini Algieba (3.1, take único).
// Junta as pontas dos indicadores, olha pra parede atrás, afasta um pouco: aparece uma salsicha flutuando.
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

  const dash = (x0, y0, x1, y1, on = 30, off = 20) => {
    const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L; let d = '';
    for (let s = 0; s < L; s += on + off) { const e = Math.min(L, s + on); d += ` M ${r1(x0 + ux * s)} ${r1(y0 + uy * s)} L ${r1(x0 + ux * e)} ${r1(y0 + uy * e)}`; }
    return d.trim();
  };
  // ===================== FOLHA 1 =====================
  const tit = WB.group();
  WB.showNow(WB.textStrokes('CADÊ A SALSICHA?', 540, 230, 116, INK.red, tit, 'middle').strokes);
  const olhos = WB.group();
  const EY = 560, EXL = 400, EXR = 680;
  const pupL = WB.group(olhos), pupR = WB.group(olhos);
  WB.showNow([sp(`M ${EXL - 90} ${EY} Q ${EXL} ${EY - 80} ${EXL + 90} ${EY} Q ${EXL} ${EY + 80} ${EXL - 90} ${EY} Z`, INK.black, 7, olhos),
    sp(`M ${EXR - 90} ${EY} Q ${EXR} ${EY - 80} ${EXR + 90} ${EY} Q ${EXR} ${EY + 80} ${EXR - 90} ${EY} Z`, INK.black, 7, olhos),
    sp(circ(EXL, EY, 22), INK.blue, 18, pupL), sp(circ(EXR, EY, 22), INK.blue, 18, pupR)]);
  const FY = 1060;
  const dL = WB.group(), dR = WB.group();
  const fL = dedo(-20, FY, 90, 560, 120, dL), fR = dedo(1100, FY, -90, 560, 120, dR);
  WB.showNow([...fL.strokes, ...fR.strokes]);
  const q = WB.group(); WB.showNow(WB.textStrokes('?', 540, 900, 150, INK.blue, q, 'middle').strokes);
  fadeOut(q, S[1].start, 0.2);
  aviso(0.3, 1.1, S[1].start - 0.1, 'FAZ COMIGO!', 540, 1450, 120, INK.blue);
  aviso(2.0, 3.4, S[1].start - 0.1, 'só 10 segundos', 540, 1580, 76, INK.gray);
  rest(3.5, S[1].start - 0.05);
  // cena 2: junta as pontas
  const s2 = S[1].start;
  aviso(s2 + 0.1, s2 + 0.9, S[2].start - 0.05, 'JUNTA AS PONTAS', 540, 1450, 100, INK.blue);
  const c2 = WB.group();
  D(s2 + 1.2, s2 + 1.6, [sp(WB.loopEllipse(540, FY, 120, 100), INK.red, 8, c2)]);
  W(s2 + 2.4, s2 + 3.4, 'na frente dos olhos', 540, 1580, 72, INK.gray, { parent: c2 });
  fadeOut(c2, S[2].start - 0.05, 0.2);
  // cena 3: olha pra parede
  const s3 = S[2].start;
  const pw = WB.group();
  D(s3 + 0.1, s3 + 0.5, [sp(WB.roughLine(80, 1660, 1000, 1660, 3), INK.black, 8, pw)]);
  W(s3 + 0.5, s3 + 1.0, 'PAREDE', 540, 1750, 80, INK.black, { parent: pw });
  D(s3 + 1.0, s3 + 1.5, [sp(dash(EXL, EY + 50, 520, 1640), INK.green, 5, pw), sp(dash(EXR, EY + 50, 560, 1640), INK.green, 5, pw)]);
  aviso(s3 + 1.6, s3 + 2.4, S[3].start - 0.05, 'olha LÁ ATRÁS', 780, 1300, 80, INK.green);
  WB.effect(t => { const u = clamp((t - s3 - 0.3) / 0.3); [pupL, pupR].forEach((g, i) => g.setAttribute('transform', `translate(${r1((i ? -10 : 10) * u)} ${r1(14 * u)})`)); });
  // cena 4: afasta um pouquinho
  const s4 = S[3].start;
  aviso(s4 + 0.1, s4 + 0.8, S[4].start - 0.05, 'AFASTA UM POUCO', 540, 1450, 96, INK.purple);
  WB.effect(t => { const u = ease(clamp((t - s4 - 0.5) / 0.8)); dL.setAttribute('transform', `translate(${r1(-110 * u)} 0)`); dR.setAttribute('transform', `translate(${r1(110 * u)} 0)`); });
  countdown(fim(4) + 0.1, S[3].end - 0.05, 900, 860);
  // cena 5: a salsicha
  const s5 = S[4].start;
  const sal = WB.group();
  {
    const x0 = 450, x1 = 630, h = 52;
    const d = `M ${x0 + h} ${FY - h} L ${x1 - h} ${FY - h} A ${h} ${h} 0 0 1 ${x1 - h} ${FY + h} L ${x0 + h} ${FY + h} A ${h} ${h} 0 0 1 ${x0 + h} ${FY - h} Z`;
    WB.mk('path', { d, fill: SKIN, stroke: 'none' }, sal);
    WB.showNow([sp(d, INK.black, 6, sal),
      sp(`M ${x0 + 14} ${FY - 28} L ${x0 + 46} ${FY - 28} L ${x0 + 46} ${FY + 28} L ${x0 + 14} ${FY + 28} Q ${x0 + 2} ${FY} ${x0 + 14} ${FY - 28}`, SKIN_D, 4, sal),
      sp(`M ${x1 - 14} ${FY - 28} L ${x1 - 46} ${FY - 28} L ${x1 - 46} ${FY + 28} L ${x1 - 14} ${FY + 28} Q ${x1 - 2} ${FY} ${x1 - 14} ${FY - 28}`, SKIN_D, 4, sal)]);
  }
  WB.effect(t => { const u = clamp((t - s5 - 0.2) / 0.5); sal.setAttribute('opacity', u.toFixed(3)); sal.setAttribute('transform', `translate(0 ${r1(Math.sin(t * 3) * 8)})`); });
  W(s5 + 1.3, s5 + 2.1, 'SALSICHA!', 540, 1450, 150, INK.red);
  // cena 6: por quê
  const s6 = S[5].start;
  W(s6 + 0.2, s6 + 1.0, 'olho 1', EXL, 440, 60, INK.blue);
  W(s6 + 1.0, s6 + 1.8, 'olho 2', EXR, 440, 60, INK.blue);
  W(s6 + 2.2, s6 + 3.4, 'o cérebro COLA as 2 imagens', 540, 1580, 66, INK.gray);
  rest(s6 + 3.5, S[5].end - 0.1);

  // ===================== FOLHA 2: CTA =====================
  WB.newPage(7, 0, 0.05);
  const s7 = S[6].start;
  W(s7 + 0.1, s7 + 0.8, 'VIU A SALSICHA?', 540, 640, 130, INK.red);
  W(s7 + 1.0, s7 + 1.5, 'COMENTA AÍ', 540, 900, 110, INK.blue);
  W(s7 + 1.6, s7 + 2.4, 'e manda pro amigo', 540, 1100, 86, INK.gray);
  rest(s7 + 2.5, S[6].end - 0.1);

  // =====================================================================
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
