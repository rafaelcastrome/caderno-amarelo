// "Quantos Natais tu ainda tem com teus pais?" (série "Tua vida no caderno"). Narração Gemini Algieba (3.1, take único).
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const r1 = n => Math.round(n * 10) / 10;
  const st = c => S[c - 1].start, F = c => S[c - 1].fala;
  const at = (c, f) => st(c) + F(c) * f;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const img = (href, x, y, s, parent) => WB.mk('image', { href, x: x - s / 2, y: y - s / 2, width: s, height: s }, parent);
  const pop = (a, b, txt, x, y, size, cor, parent, anchor = 'middle') => {
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, anchor).strokes);
    WB.effect(t => {
      const u = clamp((t - a) / 0.18), k = t < a ? 0 : (u < 1 ? 0.6 + 0.5 * ease(u) : 1 + 0.1 * Math.exp(-(t - a - 0.18) * 10));
      g.setAttribute('opacity', (t < a ? 0 : 1 - clamp((t - b) / 0.2)).toFixed(3));
      g.setAttribute('transform', `translate(${x} ${y - size * 0.35}) scale(${k.toFixed(3)}) translate(${-x} ${-(y - size * 0.35)})`);
    });
    return g;
  };
  const surge = (g, a, b, cx, cy) => WB.effect(t => {
    const u = clamp((t - a) / 0.25), k = t < a ? 0.01 : 0.7 + 0.3 * ease(u);
    g.setAttribute('opacity', (t < a ? 0 : 1 - clamp((t - b) / 0.2)).toFixed(3));
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });
  const icone = (nome, x, y, s, a, b) => { const g = WB.group(); img(window.ICONES[nome], x, y, s, g); surge(g, a, b, x, y); return g; };

  // ---------------- 1: a pergunta (quadro 0) ----------------
  const b1 = st(2);
  pop(-1, b1, 'QUANTOS NATAIS', 540, 230, 110, INK.red);
  pop(-1, b1, 'TU AINDA TEM', 540, 350, 96, INK.black);
  pop(-1, b1, 'COM TEUS PAIS?', 540, 460, 96, INK.black);
  { const g = WB.group(), cx = 540, cy = 860; img(window.ICONES.arvore, cx, cy, 420, g);
    WB.showNow(WB.textStrokes('?', 790, 760, 220, INK.red, g, 'middle').strokes);
    WB.effect(t => { g.setAttribute('opacity', (1 - clamp((t - b1 + 0.2) / 0.2)).toFixed(3));
      const k = 1 + 0.025 * Math.sin(t * 3); g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`); }); }
  pop(at(1, 0.6), b1, 'faz a conta comigo...', 540, 1290, 80, INK.blue);
  pop(at(1, 0.85), b1, 'vai doer!', 540, 1400, 96, INK.purple);

  // cabeçalho fixo do resto do vídeo
  pop(st(2), st(8), 'NATAIS COM TEUS PAIS', 540, 200, 82, INK.red);

  // ---------------- 2: idades ----------------
  { const b = st(3);
    icone('jovem', 300, 520, 230, at(2, 0.05), b); pop(at(2, 0.1), b, 'tu: 20 anos', 300, 760, 76, INK.blue);
    icone('pai', 700, 520, 200, at(2, 0.55), b); icone('mae', 860, 520, 200, at(2, 0.6), b);
    pop(at(2, 0.62), b, 'pais: 50', 780, 760, 76, INK.purple); }

  // ---------------- 3 a 6: grade de 26 árvores ----------------
  const N = 26, COLS = 6, DX = 145, DY = 140, X0 = 540 - DX * (COLS - 1) / 2, Y0 = 560;
  const pos = i => { const r = Math.floor(i / COLS), nr = r < 4 ? COLS : N - 4 * COLS;
    const x0 = 540 - DX * (nr - 1) / 2; return [x0 + DX * (i % COLS), Y0 + DY * r]; };
  const fimGrade = st(7);
  const aparece = i => at(3, 0.55) + i * 0.07;                        // vão surgindo enquanto fala "sobram 26"
  const risca = i => (i >= 5 && i % 2 === 1) ? at(5, 0.55) + (i - 5) * 0.11 : 1e9;   // revezamento: 11 riscadas
  pop(at(3, 0.05), st(4) - 0.1, 'até 76 anos', 540, 360, 84, INK.black);
  pop(at(3, 0.25), st(4) - 0.1, '(média do Brasil)', 540, 440, 60, INK.gray);
  { const box = WB.group(); // moldura "em casa" nas 5 primeiras
    WB.mk('rect', { x: pos(0)[0] - 70, y: Y0 - 70, width: DX * 4 + 140, height: 140, rx: 30, fill: '#fef3c7', stroke: INK.blue, 'stroke-width': 6 }, box);
    surge(box, at(5, 0.08), fimGrade, 540, Y0); }
  for (let i = 0; i < N; i++) {
    const [x, y] = pos(i), g = WB.group(); img(window.ICONES.arvore, x, y, 112, g);
    const xg = WB.group(g);
    WB.mk('path', { d: `M ${x - 45} ${y - 45} L ${x + 45} ${y + 45} M ${x + 45} ${y - 45} L ${x - 45} ${y + 45}`, stroke: INK.red, 'stroke-width': 12, 'stroke-linecap': 'round', fill: 'none' }, xg);
    const a = aparece(i), rr = risca(i);
    WB.effect(t => {
      const u = clamp((t - a) / 0.2), k = t < a ? 0.01 : 0.6 + 0.4 * ease(u);
      const morto = clamp((t - rr) / 0.2);
      g.setAttribute('opacity', (t < a ? 0 : (1 - 0.7 * morto) * (1 - clamp((t - fimGrade + 0.2) / 0.2))).toFixed(3));
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`);
      xg.setAttribute('opacity', morto.toFixed(3));
    });
  }
  pop(at(5, 0.1), fimGrade, 'em casa', pos(0)[0] - 40, Y0 - 82, 50, INK.blue, undefined, 'start');
  // contadores embaixo da grade
  pop(at(3, 0.75), st(5) + 0.3, '26 NATAIS', 540, 1300, 140, INK.green || '#15803d');
  pop(at(4, 0.05), st(5) + 0.3, 'parece bastante...', 540, 1440, 76, INK.black);
  pop(at(4, 0.7), st(5) + 0.3, 'mas calma!', 540, 1540, 84, INK.red);
  pop(at(5, 0.05), st(6), 'tu sai de casa...', 540, 1260, 78, INK.blue);
  icone('casal', 540, 1400, 130, at(5, 0.3), st(6));
  pop(at(5, 0.55), st(6), 'um ano lá, um ano cá', 540, 1560, 74, INK.purple);
  pop(at(6, 0.35), fimGrade, 'SOBRAM', 540, 1280, 90, INK.black);
  pop(at(6, 0.55), fimGrade, '≈ 15 NATAIS', 540, 1420, 140, INK.red);

  // ---------------- 7: 20 já foram x 15 faltam ----------------
  { const a = st(7), b = st(8);
    pop(a + 0.05, b, '15!', 540, 380, 130, INK.red);
    pop(at(7, 0.15), b, 'já foram: 20', 540, 540, 80, INK.gray);
    pop(at(7, 0.45), b, 'faltam: 15', 540, 880, 80, '#15803d');
    for (let i = 0; i < 35; i++) {
      const passado = i < 20, j = passado ? i : i - 20, x = 135 + (j % 10) * 90, y = (passado ? 640 : 980) + Math.floor(j / 10) * 95;
      const g = WB.group(); img(window.ICONES.arvore, x, y, 82, g);
      const ai = passado ? at(7, 0.18) + i * 0.04 : at(7, 0.48) + j * 0.05;
      WB.effect(t => { g.setAttribute('opacity', t < ai ? 0 : (passado ? 0.35 : 1) * (1 - clamp((t - b + 0.2) / 0.2)));
        const k = t < ai ? 0.01 : 0.6 + 0.4 * ease(clamp((t - ai) / 0.2));
        g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`); });
    }
    pop(at(7, 0.62), b, 'MAIS DA METADE', 540, 1330, 110, INK.red);
    pop(at(7, 0.7), b, 'JÁ FOI.', 540, 1460, 120, INK.red);
  }

  // ---------------- 8: CTA ----------------
  { const a = st(8), f = F(8);
    pop(a + 0.1, 99, 'quantos tu ainda tem?', 540, 420, 84, INK.blue);
    pop(at(8, 0.15), 99, 'comenta!', 540, 530, 84, INK.blue);
    const g = WB.group(), cx = 540, cy = 790; img(window.ICONES.coracao, cx, cy, 240, g); surge(g, at(8, 0.32), 99, cx, cy);
    WB.effect(t => { if (t < at(8, 0.6)) return; const k = 1 + 0.08 * Math.max(0, Math.sin((t - a) * 7));
      g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`); });
    pop(at(8, 0.35), 99, 'manda pros teus pais', 540, 1050, 88, INK.purple);
    const gb = WB.group(), x = 540, y = 1260, ab = at(8, 0.55);
    const bt = WB.mk('rect', { x: x - 170, y: y - 50, width: 340, height: 96, rx: 48, fill: '#3b82f6' }, gb);
    const t1 = WB.group(gb); WB.showNow(WB.textStrokes('Seguir', x, y + 18, 64, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(gb); WB.showNow(WB.textStrokes('Seguindo', x, y + 18, 58, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= ab, done = t >= ab + 1.0;
      gb.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0); });
    pop(at(8, 0.62), 99, 'toda semana:', 540, 1440, 70, INK.black);
    pop(at(8, 0.68), 99, 'tua vida no caderno', 540, 1540, 84, INK.red);
  }

  for (let c = 1; c <= S.length; c++) rest(st(c) + 0.02, S[c - 1].end - 0.02);

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
    const SPOTS = [[290, 1760], [790, 1760], [540, 1790], [300, 1750]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const n = Math.floor(t / CYC), u = clamp((t - n * CYC - HOLD) / MOVE);
      const p = SPOTS[n % 4], q = SPOTS[(n + 1) % 4], e = ease(u);
      const x = lerp(p[0], q[0], e), y = lerp(p[1], q[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.2) / 0.3) * 0.95).toFixed(3));
    });
  }
};
