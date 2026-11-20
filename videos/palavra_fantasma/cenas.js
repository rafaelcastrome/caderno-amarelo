// "Palavra fantasma": sílabas LO e BO repetindo sem parar; o cérebro alterna entre LOBO e BOLO.
// Depois a pessoa lê BOLO e ouve BOLO, lê LOBO e ouve LOBO. Narração Gemini Algieba (3.1, take único).
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const r1 = n => Math.round(n * 10) / 10;
  const st = c => S[c - 1].start, F = c => S[c - 1].fala, fim = c => S[c - 1].start + S[c - 1].fala;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const img = (href, x, y, s, parent) => WB.mk('image', { href, x: x - s / 2, y: y - s / 2, width: s, height: s }, parent);
  const pop = (a, b, txt, x, y, size, cor, parent, anchor = 'middle') => { // texto pronto, aparece com "pulo"
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
  // intensidade da sílaba que está tocando (loops começam no início da cena, sílabas de 0,26 s)
  const SIL = 0.26;
  const batida = (t, c) => { const d = t - st(c); if (d < 0 || d > F(c)) return 0; const u = (d % SIL) / SIL; return Math.sin(Math.PI * u); };
  const LOOPS = [2, 5, 7];
  const tocando = t => { for (const c of LOOPS) if (t >= st(c) && t < fim(c)) return c; return 0; };

  // ---------------- título (quadro 0 até a cena 3) ----------------
  const fimTit = st(4);
  pop(-1, fimTit, 'QUAL PALAVRA', 540, 200, 112, INK.red);
  pop(-1, fimTit, 'TU OUVE?', 540, 320, 112, INK.red);

  // ---------------- orelha que pulsa com cada sílaba (cenas 1 e 2) ----------------
  { const g = WB.group(), cx = 540, cy = 690; img(window.ICONES.orelha, cx, cy, 360, g);
    WB.effect(t => {
      const on = t < st(3); g.setAttribute('opacity', on ? (1 - clamp((t - st(3) + 0.2) / 0.2)).toFixed(3) : 0);
      const k = 1 + 0.07 * batida(t, 2) + 0.015 * Math.sin(t * 3);
      g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
    }); }

  // ---------------- onda do som (toca junto com os loops) ----------------
  const onda = (y, cor) => {
    const g = WB.group(), path = WB.mk('path', { d: '', fill: 'none', stroke: cor, 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
    WB.effect(t => {
      const c = tocando(t); g.setAttribute('opacity', c ? 1 : 0); if (!c) return;
      const amp = 20 + 55 * batida(t, c); let d = '';
      for (let k = 0; k <= 120; k++) { const x = 180 + 720 * k / 120, env = Math.sin(Math.PI * k / 120);
        d += (k ? ' L ' : 'M ') + r1(x) + ' ' + r1(y + amp * env * Math.sin(2 * Math.PI * 6 * k / 120 - t * 16)); }
      path.setAttribute('d', d);
    });
  };
  onda(1010, INK.red);

  // ---------------- cena 1: o pedido ----------------
  pop(-1, st(2) + 0.6, 'comenta qual tu ouviu!', 540, 1210, 84, INK.blue);
  pop(st(1) + F(1) * 0.55, st(2) + 0.6, 'sem espiar os comentários!', 540, 1320, 66, INK.purple);

  // ---------------- cena 2: 14 s de palavra repetindo ----------------
  { const g = WB.group(), a = st(2), b = fim(2);
    const bg = WB.mk('rect', { x: 190, y: 1160, width: 700, height: 30, rx: 15, fill: '#efe7cf' }, g);
    const fg = WB.mk('rect', { x: 190, y: 1160, width: 700, height: 30, rx: 15, fill: INK.red }, g);
    WB.effect(t => { const on = t >= a && t < b + 0.2; g.setAttribute('opacity', on ? 1 : 0);
      fg.setAttribute('width', r1(700 * (1 - clamp((t - a) / (b - a))))); }); }
  { const g = pop(st(2) + 0.6, fim(2) + 0.2, 'escuta...', 540, 1310, 90, INK.black);
    const lbl = WB.group(); lbl.appendChild(g);
    WB.effect(t => lbl.setAttribute('opacity', (0.55 + 0.45 * Math.sin(t * 5)).toFixed(2))); }
  pop(st(2) + 6.0, fim(2) + 0.2, 'mudou?', 540, 1470, 130, INK.red);
  pop(st(2) + 10.0, fim(2) + 0.2, 'qual tu ouve AGORA?', 540, 1600, 72, INK.blue);

  // ---------------- cena 3: LOBO ou BOLO? ----------------
  { const a1 = st(3) + F(3) * 0.38, a2 = st(3) + F(3) * 0.78, b = st(4);
    const c1 = WB.group(), c2 = WB.group();
    [[c1, 290, 'lobo', 'LOBO', INK.blue, a1], [c2, 790, 'bolo', 'BOLO', INK.purple, a2]].forEach(([g, x, ic, txt, cor, a]) => {
      WB.mk('rect', { x: x - 210, y: 520, width: 420, height: 620, rx: 40, fill: '#fffaf0', stroke: '#1f1f24', 'stroke-width': 5 }, g);
      img(window.ICONES[ic], x, 760, 300, g);
      WB.showNow(WB.textStrokes(txt, x, 1060, 120, cor, g, 'middle').strokes);
      surge(g, a, b, x, 830);
    });
    pop(st(3) + F(3) * 0.62, b, 'ou', 540, 860, 80, INK.black);
  }

  // ---------------- cena 4: o som não mudou ----------------
  { const a = st(4), b = st(5);
    pop(a + 0.1, b, 'O SOM', 540, 300, 120, INK.black);
    pop(a + F(4) * 0.18, b, 'NÃO MUDOU!', 540, 440, 130, INK.red);
    const g = WB.group(); img(window.ICONES.cerebro, 540, 780, 320, g); surge(g, a + F(4) * 0.4, b, 540, 780);
    pop(a + F(4) * 0.45, b, 'quem muda é', 540, 1080, 80, INK.blue);
    pop(a + F(4) * 0.5, b, 'o teu cérebro!', 540, 1180, 92, INK.blue);
    pop(a + F(4) * 0.72, b, 'lê e escuta 👇'.replace(' 👇', ''), 540, 1420, 96, INK.purple);
  }

  // ---------------- cenas 5 a 7: lê BOLO, depois lê LOBO ----------------
  const leitura = (a, b, ic, txt, cor) => {
    const g = WB.group(); img(window.ICONES[ic], 540, 520, 300, g);
    WB.showNow(WB.textStrokes(txt, 540, 900, 300, cor, g, 'middle').strokes);
    surge(g, a, b, 540, 700);
    WB.effect(t => { if (t < a || t > b) return; const k = 1 + 0.035 * Math.max(batida(t, 5), batida(t, 7));
      g.setAttribute('transform', `translate(540 700) scale(${k.toFixed(3)}) translate(-540 -700)`); });
  };
  leitura(st(5), st(6), 'bolo', 'BOLO', INK.purple);
  leitura(st(6), st(8), 'lobo', 'LOBO', INK.blue);
  pop(st(5) + 0.2, fim(5) + 0.15, 'lê e escuta...', 540, 1290, 80, INK.black);
  pop(st(7) + 0.2, fim(7) + 0.15, 'lê e escuta...', 540, 1290, 80, INK.black);
  pop(st(6) + 0.05, st(7) + 0.3, 'agora essa!', 540, 1290, 80, INK.red);

  // ---------------- cena 8: CTA ----------------
  { const a = st(8), f = F(8);
    pop(a + 0.1, 99, 'TU OUVE', 540, 300, 120, INK.red);
    pop(a + f * 0.06, 99, 'O QUE TU LÊ!', 540, 430, 120, INK.red);
    const g1 = WB.group(); img(window.ICONES.lobo, 380, 680, 200, g1); surge(g1, a + f * 0.12, 99, 380, 680);
    const g2 = WB.group(); img(window.ICONES.bolo, 700, 680, 200, g2); surge(g2, a + f * 0.16, 99, 700, 680);
    pop(a + f * 0.2, 99, 'qual tu ouviu primeiro?', 540, 960, 80, INK.blue);
    pop(a + f * 0.42, 99, 'manda pro amigo!', 540, 1100, 92, INK.purple);
    pop(a + f * 0.52, 99, 'ele vai ouvir a outra 😂'.replace(' 😂', ''), 540, 1200, 72, INK.purple);
    const gb = WB.group(), x = 540, y = 1420, ab = a + f * 0.72;
    const bt = WB.mk('rect', { x: x - 170, y: y - 50, width: 340, height: 96, rx: 48, fill: '#3b82f6' }, gb);
    const t1 = WB.group(gb); WB.showNow(WB.textStrokes('Seguir', x, y + 18, 64, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(gb); WB.showNow(WB.textStrokes('Seguindo', x, y + 18, 58, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= ab, done = t >= ab + 1.0;
      gb.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0); });
    pop(a + f * 0.85, 99, 'amanhã tem outra!', 540, 1580, 72, INK.black);
  }

  // mão sempre descansando (tudo aparece pronto)
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
