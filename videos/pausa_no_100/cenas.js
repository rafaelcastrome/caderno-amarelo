// "Pausa no 100": desafio de reflexo em 3 níveis (4, 10 e 30 números por segundo).
// No nível 3 o 100 fica 1 quadro só, e esse quadro tem um segredo (abacaxi) pra comentar.
// Narração Gemini Algieba (3.1, take único). Tempos da contagem vêm de cfg.json (mesmos do audio.py).
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const r1 = n => Math.round(n * 10) / 10;
  const st = c => S[c - 1].start, F = c => S[c - 1].fala, fim = c => S[c - 1].start + S[c - 1].fala;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const W = (t0, t1, txt, x, y, size, cor) => { const c = sceneOf(t0); return WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle' }); };
  const img = (href, x, y, s, parent) => WB.mk('image', { href, x: x - s / 2, y: y - s / 2, width: s, height: s }, parent);
  const txt = (s, x, y, size, cor, parent) => { WB.showNow(WB.textStrokes(s, x, y, size, cor, parent, 'middle').strokes); };
  const pop = (a, b, s, x, y, size, cor, parent) => {
    const g = WB.group(parent); txt(s, x, y, size, cor, g);
    WB.effect(t => {
      const u = clamp((t - a) / 0.18), k = t < a ? 0.01 : (u < 1 ? 0.6 + 0.5 * ease(u) : 1 + 0.1 * Math.exp(-(t - a - 0.18) * 10));
      g.setAttribute('opacity', (t < a ? 0 : 1 - clamp((t - b) / 0.2)).toFixed(3));
      g.setAttribute('transform', `translate(${x} ${y - size * 0.35}) scale(${k.toFixed(3)}) translate(${-x} ${-(y - size * 0.35)})`);
    });
    return g;
  };
  const pulsa = (g, cx, cy, a, amp = 0.08, vel = 9, dec = 2) => WB.effect(t => {
    const k = t > a ? 1 + amp * Math.sin((t - a) * vel) * Math.exp(-(t - a) * dec) : 1;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });

  const LEAD = 0.35;
  const NIV = [{ c: 1, de: 93, ate: 107, por_s: 4 }, { c: 2, de: 85, ate: 115, por_s: 10 }, { c: 3, de: 40, ate: 160, por_s: 30 }];
  const DICA = ['nível 1 · fácil', 'nível 2 · rápido', 'nível 3 · impossível'];
  const CINZA = '#c9c0a3', VERDE = '#16a34a';
  const NX = 540, NY = 1090, NS = 430; // número gigante
  const FIM_JOGO = st(4);

  // ---------------- título fixo ----------------
  const tit = WB.group();
  txt('PAUSA NO 100', 540, 215, 130, INK.red, tit);
  pulsa(tit, 540, 175, 0.2, 0.06, 8, 1.2);
  WB.effect(t => tit.setAttribute('opacity', t < FIM_JOGO ? 1 : 0));

  // bolinhas de nível
  NIV.forEach((n, i) => {
    const x = 440 + i * 100, y = 335, g = WB.group();
    const ci = WB.mk('circle', { cx: x, cy: y, r: 36, fill: '#fffaf0' }, g);
    WB.showNow([WB.strokePath(WB.circlePath(x, y, 36), INK.black, 5, g)]);
    txt(String(i + 1), x, y + 17, 52, INK.black, g);
    WB.effect(t => {
      const ativo = t >= st(n.c) && t < S[n.c - 1].end, feito = t >= S[n.c - 1].end;
      ci.setAttribute('fill', ativo ? '#fde68a' : feito ? '#d9f2df' : '#fffaf0');
      g.setAttribute('opacity', t < FIM_JOGO ? 1 : 0);
    });
  });

  // dica de como pausar (só no nível 1)
  {
    const g = WB.group();
    txt('segura o dedo na tela', 540, 1560, 66, INK.blue, g);
    txt('pra pausar', 540, 1640, 66, INK.blue, g);
    WB.effect(t => g.setAttribute('opacity', (clamp((t + 0.01) / 0.01) * (1 - clamp((t - S[0].end + 0.3) / 0.3))).toFixed(3)));
  }

  NIV.forEach((n, li) => {
    const a = st(n.c), T0 = fim(n.c) + LEAD, fimN = S[n.c - 1].end, k = n.ate - n.de + 1;
    pop(a + 0.05, fimN - 0.1, DICA[li], 540, 480, 70, li === 2 ? INK.red : INK.blue);

    // números da contagem (um grupo por número)
    const grupos = [];
    for (let i = 0; i < k; i++) {
      const v = n.de + i, g = WB.group();
      g.setAttribute('opacity', 0);
      if (v === 100 && li < 2) {
        txt('100', NX, NY, NS, VERDE, g);
        txt('PEGOU!', NX, NY + 190, 110, VERDE, g);
      } else if (v === 100) {
        // o quadro secreto
        WB.mk('rect', { x: 70, y: 600, width: 940, height: 1000, rx: 40, fill: '#fff4c2', stroke: INK.red, 'stroke-width': 10 }, g);
        txt('100', NX, 860, 260, INK.red, g);
        img(window.ICONES.abacaxi, NX, 1145, 360, g);
        txt('TU PEGOU!', NX, 1440, 110, INK.black, g);
        txt('comenta esse emoji', NX, 1545, 76, INK.blue, g);
      } else {
        txt(String(v), NX, NY, NS, INK.black, g);
      }
      grupos.push(g);
    }
    // número de espera (cinza) antes e depois da contagem
    const esp0 = WB.group(); txt(String(n.de), NX, NY, NS, CINZA, esp0);
    const esp1 = WB.group(); txt(String(n.ate), NX, NY, NS, CINZA, esp1);
    let atual = -1;
    WB.effect(t => {
      const i = Math.floor((t - T0) * n.por_s + 1e-6);
      const vivo = t >= a && t < fimN;
      const idx = vivo && t >= T0 && i < k ? i : -1;
      if (idx !== atual) {
        if (atual >= 0) grupos[atual].setAttribute('opacity', 0);
        if (idx >= 0) grupos[idx].setAttribute('opacity', 1);
        atual = idx;
      }
      esp0.setAttribute('opacity', vivo && t < T0 ? 1 : 0);
      esp1.setAttribute('opacity', vivo && t >= T0 && i >= k ? 1 : 0);
    });
    rest(a + 0.05, fimN - 0.05);
  });

  // ---------------- CTA ----------------
  const c4 = 4, s4 = st(c4), F4 = F(c4);
  W(s4 + 0.1, s4 + F4 * 0.12, 'pegou o nível 3?', 540, 330, 100, INK.black);
  { const g = WB.group(); img(window.ICONES.shh, 540, 560, 230, g);
    WB.effect(t => { const u = clamp((t - s4 - F4 * 0.14) / 0.25); g.setAttribute('opacity', u.toFixed(3));
      g.setAttribute('transform', `translate(540 560) scale(${(0.6 + 0.4 * ease(u)).toFixed(3)}) translate(-540 -560)`); }); }
  W(s4 + F4 * 0.2, s4 + F4 * 0.33, 'não conta o segredo', 540, 790, 92, INK.red);
  W(s4 + F4 * 0.34, s4 + F4 * 0.5, 'só comenta o emoji', 540, 900, 92, INK.black);
  W(s4 + F4 * 0.52, s4 + F4 * 0.66, 'manda pro amigo', 540, 1060, 96, INK.purple);
  W(s4 + F4 * 0.6, s4 + F4 * 0.72, 'que se acha rápido', 540, 1160, 76, INK.blue);
  { const g = WB.group(), x = 540, y = 1340, a = s4 + F4 * 0.76;
    const bt = WB.mk('rect', { x: x - 170, y: y - 55, width: 340, height: 100, rx: 50, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); txt('Seguir', x, y + 18, 64, '#ffffff', t1);
    const t2 = WB.group(g); txt('Seguindo', x, y + 18, 58, INK.black, t2);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0); });
    const p = pop(a + 0.4, 999, 'amanhã: nível 4', 540, 1520, 84, INK.red); pulsa(p, 540, 1490, a + 0.7, 0.06, 6, 0.6); }
  rest(s4 + F4, S[c4 - 1].end - 0.1);

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
    const SPOTS = [[290, 1770], [790, 1770], [540, 1790], [300, 1760]];
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
