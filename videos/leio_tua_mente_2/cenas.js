// "Eu leio tua mente" (tabela de 100 desenhos), ~36 s, narração Gemini Algieba (3.1, take único).
// Número de 2 algarismos menos os algarismos = múltiplo de 9; todos os múltiplos de 9 têm o CORAÇÃO.
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

  // ---- formas pequenas
  const FORMAS = {
    coracao: (x, y, r) => `M ${x} ${y + r * 0.9} C ${x - r * 1.5} ${y - r * 0.1} ${x - r * 0.6} ${y - r * 1.2} ${x} ${y - r * 0.35} C ${x + r * 0.6} ${y - r * 1.2} ${x + r * 1.5} ${y - r * 0.1} ${x} ${y + r * 0.9} Z`,
    estrela: (x, y, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? ' L' : 'M'} ${r1(x + rr * Math.cos(a))} ${r1(y + rr * Math.sin(a))}`; } return d + ' Z'; },
    bola: (x, y, r) => circ(x, y, r * 0.85),
    triangulo: (x, y, r) => `M ${x} ${y - r} L ${x + r} ${y + r * 0.8} L ${x - r} ${y + r * 0.8} Z`,
    quadrado: (x, y, r) => `M ${x - r * 0.8} ${y - r * 0.8} L ${x + r * 0.8} ${y - r * 0.8} L ${x + r * 0.8} ${y + r * 0.8} L ${x - r * 0.8} ${y + r * 0.8} Z`,
    xis: (x, y, r) => `M ${x - r * 0.8} ${y - r * 0.8} L ${x + r * 0.8} ${y + r * 0.8} M ${x + r * 0.8} ${y - r * 0.8} L ${x - r * 0.8} ${y + r * 0.8}`,
    lua: (x, y, r) => `M ${x + r * 0.3} ${y - r} A ${r} ${r} 0 1 0 ${x + r * 0.3} ${y + r} A ${r * 0.75} ${r * 0.75} 0 1 1 ${x + r * 0.3} ${y - r} Z`,
    raio: (x, y, r) => `M ${x + r * 0.3} ${y - r} L ${x - r * 0.5} ${y + r * 0.1} L ${x + r * 0.1} ${y + r * 0.1} L ${x - r * 0.3} ${y + r} L ${x + r * 0.6} ${y - r * 0.2} L ${x} ${y - r * 0.2} Z`,
    gota: (x, y, r) => `M ${x} ${y - r} Q ${x + r * 0.9} ${y + r * 0.1} ${x + r * 0.6} ${y + r * 0.5} A ${r * 0.62} ${r * 0.62} 0 0 1 ${x - r * 0.6} ${y + r * 0.5} Q ${x - r * 0.9} ${y + r * 0.1} ${x} ${y - r} Z`,
    losango: (x, y, r) => `M ${x} ${y - r} L ${x + r * 0.7} ${y} L ${x} ${y + r} L ${x - r * 0.7} ${y} Z`,
  };
  const OUTRAS = ['estrela', 'bola', 'triangulo', 'quadrado', 'xis', 'lua', 'raio', 'gota', 'losango'];
  const CORES = [INK.blue, INK.green, INK.orange, INK.purple, INK.black, INK.red];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const EXTRA = new Set([2, 13, 23, 31, 40, 50, 58, 66, 77, 86, 95, 49]);
  // ===================== FOLHA 1: a tabela (pronta no quadro 0) =====================
  const tit = WB.group();
  WB.showNow(WB.textStrokes('EU LEIO TUA MENTE', 540, 230, 112, INK.red, tit, 'middle').strokes);
  const X0 = 40, CW = 100, Y0 = 330, CH = 114;
  function tabela(alvo, corAlvo, extra, outras, sd) {
    seed = sd;
    const grade = WB.group();
    for (let n = 0; n < 100; n++) {
      const r = Math.floor(n / 10), c = n % 10, x = X0 + c * CW, y = Y0 + r * CH, cy = y + CH / 2;
      const st = [sp(WB.roughRect(x + 3, y + 3, x + CW - 3, y + CH - 3), '#c9c2a8', 2, grade)];
      st.push(...WB.textStrokes(String(n), x + 30, cy + 13, 40, INK.black, grade, 'middle').strokes);
      let f, cor;
      if (n % 9 === 0 || extra.has(n)) { f = alvo; cor = corAlvo; }
      else { f = outras[Math.floor(rnd() * outras.length)]; cor = CORES[Math.floor(rnd() * CORES.length)]; }
      st.push(sp(FORMAS[f](x + 72, cy, 20), cor, 5, grade));
      WB.showNow(st);
    }
    return grade;
  }
  const grade = tabela('coracao', INK.red, EXTRA, OUTRAS, 7);
  // cena 1
  aviso(0.3, 1.2, S[1].start - 0.1, 'PENSA COMIGO', 540, 1600, 100, INK.blue);
  rest(1.3, S[1].start - 0.05);
  // cena 2: número de 2 algarismos
  const s2 = S[1].start;
  aviso(s2 + 0.2, s2 + 1.3, S[2].start - 0.05, 'pensa num número', 540, 1580, 84, INK.blue);
  aviso(s2 + 2.0, s2 + 3.0, S[2].start - 0.05, 'de 10 a 99', 540, 1700, 100, INK.red);
  rest(s2 + 3.1, S[2].start - 0.1);
  // cena 3: tira os algarismos (exemplo sem resultado)
  const s3 = S[2].start;
  aviso(s3 + 0.2, s3 + 1.5, S[3].start - 0.05, 'pega o número INTEIRO', 540, 1530, 80, INK.purple);
  aviso(s3 + 2.2, s3 + 3.6, S[3].start - 0.05, 'e tira os 2 algarismos', 540, 1625, 72, INK.purple);
  aviso(s3 + 4.4, s3 + 5.0, S[3].start - 0.05, 'ex: 52', 400, 1730, 100, INK.gray);
  aviso(s3 + 5.6, s3 + 6.0, S[3].start - 0.05, '− 5', 610, 1730, 100, INK.gray);
  aviso(s3 + 6.5, s3 + 6.9, S[3].start - 0.05, '− 2', 760, 1730, 100, INK.gray);
  rest(s3 + 7.0, S[2].end - 0.05);
  // cena 4: acha na tabela, decora o desenho
  const s4 = S[3].start;
  aviso(s4 + 0.2, s4 + 1.1, S[4].start - 0.05, 'acha o resultado', 420, 1590, 80, INK.blue);
  aviso(s4 + 2.4, s4 + 3.5, S[4].start - 0.05, 'e DECORA o desenho', 420, 1710, 76, INK.red);
  countdown(fim(4) + 0.1, S[3].end - 0.05, 900, 1690);
  rest(s4 + 3.6, S[3].end - 0.1);
  // cena 5: pensa forte; a tabela some
  const s5 = S[4].start;
  WB.effect(t => grade.setAttribute('opacity', (1 - clamp((t - s5 - 0.6) / 1.2)).toFixed(3)));
  const pf = WB.group();
  W(s5 + 0.9, s5 + 2.0, 'PENSA FORTE...', 540, 900, 130, INK.purple, { parent: pf });
  WB.effect(t => { const k = 1 + 0.04 * Math.sin((t - s5) * 9) * (t > s5 + 2 ? 1 : 0); pf.setAttribute('transform', `translate(540 860) scale(${k.toFixed(3)}) translate(-540 -860)`); });
  rest(s5 + 2.1, S[4].end - 0.1);

  // ===================== FOLHA 2: revelação =====================
  WB.newPage(6, 0, 0.05);
  const s6 = S[5].start;
  const tit2 = WB.group();
  WB.showNow(WB.textStrokes('EU LEIO TUA MENTE', 540, 230, 112, INK.red, tit2, 'middle').strokes);
  W(s6 + 0.1, s6 + 0.7, 'o teu desenho é...', 540, 470, 90, INK.gray);
  const big = WB.group();
  const bigD = FORMAS.coracao(540, 880, 260);
  const bigFill = WB.mk('path', { d: bigD, fill: '#f6c3c3', stroke: 'none' }, big);
  fadeIn(bigFill, s6 + 1.8, 0.3);
  D(s6 + 1.0, s6 + 1.8, [sp(bigD, INK.red, 14, big)]);
  WB.effect(t => { const k = t > s6 + 1.8 ? 1 + 0.06 * Math.sin((t - s6 - 1.8) * 8) * Math.exp(-(t - s6 - 1.8) * 1.5) : 1; big.setAttribute('transform', `translate(540 880) scale(${k.toFixed(3)}) translate(-540 -880)`); });
  W(s6 + 1.9, s6 + 2.4, 'ESSE!', 540, 1330, 170, INK.red);
  // ===================== FOLHA 3: rodada 2, tabela nova =====================
  WB.newPage(7, 0, 0.05);
  const s7 = S[6].start;
  const tit3 = WB.group();
  WB.showNow(WB.textStrokes('DUVIDA? DE NOVO!', 540, 230, 112, INK.red, tit3, 'middle').strokes);
  const OUTRAS2 = ['coracao', 'bola', 'triangulo', 'quadrado', 'xis', 'lua', 'raio', 'gota', 'losango'];
  const grade2 = tabela('estrela', INK.orange, new Set([5, 16, 21, 34, 47, 52, 60, 69, 74, 83, 92, 38]), OUTRAS2, 101);
  fadeIn(grade2, s7 + 0.05, 0.3);
  aviso(s7 + 0.3, s7 + 1.4, S[7].start + 1.5, 'pensa em OUTRO número', 540, 1560, 80, INK.blue);
  aviso(s7 + 1.8, s7 + 2.8, S[7].start + 1.5, 'mesma conta', 540, 1670, 86, INK.purple);
  rest(s7 + 2.9, S[6].end - 0.05);
  const s8 = S[7].start;
  aviso(s8 + 0.1, s8 + 1.0, S[8].start - 0.05, 'tabela NOVA', 420, 1590, 90, INK.red);
  aviso(s8 + 1.7, s8 + 2.7, S[8].start - 0.05, 'decora o desenho', 420, 1710, 76, INK.blue);
  countdown(fim(8) + 0.1, S[7].end - 0.05, 900, 1690);
  rest(s8 + 2.8, S[7].end - 0.1);
  const s9 = S[8].start;
  WB.effect(t => grade2.setAttribute('opacity', ((t < s7 + 0.05 ? 0 : clamp((t - s7 - 0.05) / 0.3)) * (1 - clamp((t - s9 - 0.2) / 1.0))).toFixed(3)));
  W(s9 + 0.3, s9 + 1.2, 'PENSA FORTE...', 540, 900, 130, INK.purple);
  rest(s9 + 1.3, S[8].end - 0.05);
  // ===================== FOLHA 4: revelação 2 =====================
  WB.newPage(10, 0, 0.1);
  const s10 = S[9].start;
  const tit4 = WB.group();
  WB.showNow(WB.textStrokes('DUVIDA? DE NOVO!', 540, 230, 112, INK.red, tit4, 'middle').strokes);
  const big2 = WB.group();
  const starD = FORMAS.estrela(540, 860, 300);
  const starFill = WB.mk('path', { d: starD, fill: '#fde2b8', stroke: 'none' }, big2);
  fadeIn(starFill, s10 + 0.9, 0.3);
  D(s10 + 0.1, s10 + 0.9, [sp(starD, INK.orange, 14, big2)]);
  WB.effect(t => { const k = t > s10 + 0.9 ? 1 + 0.06 * Math.sin((t - s10 - 0.9) * 8) * Math.exp(-(t - s10 - 0.9) * 1.5) : 1; big2.setAttribute('transform', `translate(540 860) scale(${k.toFixed(3)}) translate(-540 -860)`); });
  W(s10 + 0.9, s10 + 1.4, 'ESSE!', 540, 1330, 170, INK.orange);
  // cena 11: CTA
  const s11 = S[10].start;
  W(s11 + 0.1, s11 + 0.9, 'Acertei as duas?', 540, 1530, 100, INK.black);
  W(s11 + 1.0, s11 + 1.6, 'COMENTA AÍ', 540, 1670, 100, INK.blue);
  rest(s11 + 1.7, S[10].end - 0.1);

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
