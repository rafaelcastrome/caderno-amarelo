// "Afasta o celular": imagens híbridas (de perto uma coisa, de longe outra).
// Nível 1 gato -> cachorro, nível 2 feliz -> chorando, nível 3 "TE AMO" -> "ME PAGA" (pra mandar pra quem te deve).
// Depois de cada tentativa o quadro ENCOLHE na tela (= ver de longe de verdade), então todo mundo vê a troca.
// As imagens ficam fora da camada de tinta (sem o filtro "marker") e cada tamanho já vem reduzido com filtro bom.
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const r1 = n => Math.round(n * 10) / 10;
  const st = c => S[c - 1].start, F = c => S[c - 1].fala, fim = c => S[c - 1].start + S[c - 1].fala, end = c => S[c - 1].end;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const W = (t0, t1, txt, x, y, size, cor) => { const c = sceneOf(t0); return WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle' }); };
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

  const BIG = 820, SM = 96, MED = 560, CX = 540, CY = 1040;
  const ENC = 1.0;               // duração do encolher
  const FIM_JOGO = st(11);

  // ---------- quadro híbrido: um <image> por tamanho, liga só o do tamanho atual ----------
  const pagina = document.querySelector('#pages').lastChild;
  const camada = WB.mk('g', {}, pagina);
  const TAM = window.HIB.tam;   // decrescente
  function painel(nome, keys, vis0, vis1) {
    const g = WB.mk('g', { opacity: 0 }, camada);
    const sombra = WB.mk('rect', { rx: 18, fill: '#3c2a0a', 'fill-opacity': 0.18 }, g);
    const ims = TAM.map(s => WB.mk('image', { href: window.HIB[nome][s], x: -s / 2, y: -s / 2, width: s, height: s, display: 'none' }, g));
    const borda = WB.mk('rect', { rx: 10, fill: 'none', stroke: INK.black, 'stroke-width': 6 }, g);
    let on = -1;
    const tam = t => {
      if (t <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
        const [a, sa] = keys[i - 1], [b, sb] = keys[i];
        return Math.exp(lerp(Math.log(sa), Math.log(sb), ease(clamp((t - a) / (b - a)))));
      }
      return keys[keys.length - 1][1];
    };
    WB.effect(t => {
      const vis = t >= vis0 && t < vis1;
      g.setAttribute('opacity', vis ? 1 : 0);
      if (!vis) return;
      const s = tam(t);
      let k = TAM.length - 1; while (k > 0 && TAM[k] < s - 0.5) k--;   // menor versão >= tamanho atual
      if (k !== on) { if (on >= 0) ims[on].setAttribute('display', 'none'); ims[k].setAttribute('display', 'inline'); on = k; }
      const esc = s / TAM[k];
      ims[k].setAttribute('transform', `scale(${esc.toFixed(4)})`);
      const h = s / 2, bw = Math.max(2, 6 * s / BIG);
      for (const [r, pad] of [[borda, 0], [sombra, 0]]) {
        r.setAttribute('x', r1(-h - pad)); r.setAttribute('y', r1(-h - pad));
        r.setAttribute('width', r1(s + 2 * pad)); r.setAttribute('height', r1(s + 2 * pad));
      }
      sombra.setAttribute('x', r1(-h + 10 * s / BIG)); sombra.setAttribute('y', r1(-h + 14 * s / BIG));
      borda.setAttribute('stroke-width', bw.toFixed(2)); borda.setAttribute('rx', r1(10 * s / BIG));
      g.setAttribute('transform', `translate(${CX} ${CY})`);
    });
  }
  const entra = (t, s = BIG) => [[t, s * 0.55], [t + 0.25, s]];
  // nível 1: gato (de longe cachorro)
  painel('gato', [[0, BIG], [st(2) + 1.0, BIG], [st(2) + 1.0 + ENC * 1.3, SM], [st(4) + 0.1, SM], [st(4) + 1.0, BIG]], 0, st(5));
  // nível 2: carinha feliz (de longe chorando)
  painel('feliz', [...entra(st(5)), [end(5) - ENC - 0.15, BIG], [end(5) - 0.15, SM], [st(7) + 0.1, SM], [st(7) + 0.7, BIG]], st(5), st(7) + 1.2);
  // nível 3: TE AMO (de longe ME PAGA)
  const F11 = F(11), s11 = st(11);
  const P1 = s11 + 0.36 * F11, P2 = s11 + 0.60 * F11, P3 = s11 + 0.79 * F11;
  painel('teamo', [...entra(st(7) + 1.2), [end(9) - ENC - 0.15, BIG], [end(9) - 0.15, SM], [s11 + 0.1, SM],
    [P1 - 0.5, SM], [P1 + 0.2, MED], [P2 - 0.3, MED], [P2 + 0.5, SM], [P3 - 0.1, SM], [P3 + 0.5, MED]], st(7) + 1.2, 999);

  // ---------------- título fixo ----------------
  const tit = WB.group();
  txt('AFASTA O CELULAR', 540, 215, 118, INK.red, tit);
  pulsa(tit, 540, 175, 0.15, 0.06, 8, 1.2);
  WB.effect(t => tit.setAttribute('opacity', (1 - clamp((t - FIM_JOGO) / 0.25)).toFixed(3)));

  // bolinhas de nível
  const NIV = [[1, 5], [5, 7], [7, 11]];
  NIV.forEach(([a, b], i) => {
    const x = 440 + i * 100, y = 335, g = WB.group();
    const ci = WB.mk('circle', { cx: x, cy: y, r: 36, fill: '#fffaf0' }, g);
    WB.showNow([WB.strokePath(WB.circlePath(x, y, 36), INK.black, 5, g)]);
    txt(String(i + 1), x, y + 17, 52, INK.black, g);
    WB.effect(t => {
      const ativo = t >= st(a) && t < st(b), feito = t >= st(b);
      ci.setAttribute('fill', ativo ? '#fde68a' : feito ? '#d9f2df' : '#fffaf0');
      g.setAttribute('opacity', t < FIM_JOGO ? 1 : 0);
    });
  });
  const SUB = ['nível 1 · bicho', 'nível 2 · carinha', 'nível 3 · pra quem te deve'];
  NIV.forEach(([a, b], i) => pop(i === 0 ? -1 : st(a), st(b) - 0.1, SUB[i], 540, 470, 66, i === 2 ? INK.purple : INK.blue));

  // ---------------- dicas na hora de tentar ----------------
  const tentativas = [[0, end(1)], [st(5) + 0.4, end(5) - ENC - 0.15], [st(9), end(9) - ENC - 0.15]];
  tentativas.forEach(([a, b]) => {
    const g = pop(a ? a : -1, b, 'AFASTA!', 540, 1600, 130, INK.red);
    const g2 = pop(a ? a + 0.15 : -1, b, 'ou aperta os olhos', 540, 1700, 62, INK.blue);
    // setas pros lados (afastando)
    const ar = WB.group();
    const ga = WB.group(ar), gb = WB.group(ar);
    WB.showNow([WB.strokePath('M 250 1560 L 130 1560 M 170 1520 L 128 1560 L 170 1600', INK.red, 12, ga)]);
    WB.showNow([WB.strokePath('M 830 1560 L 950 1560 M 910 1520 L 952 1560 L 910 1600', INK.red, 12, gb)]);
    WB.effect(t => {
      const vis = t >= a && t < b;
      const d = vis ? 18 * Math.sin((t - a) * 6) : 0;
      ar.setAttribute('opacity', vis ? 1 : 0);
      [...ar.children].forEach((c, j) => c.setAttribute('transform', `translate(${r1((j ? 1 : -1) * Math.abs(d))} 0)`));
    });
  });

  // ---------------- revelações ----------------
  pop(st(3), st(4) + 0.4, 'CACHORRO!', 540, 1250, 110, INK.red);
  pop(st(2) + 0.1, st(2) + 1.0, 'virou?', 540, 1600, 100, INK.purple);
  pop(st(6), st(7) + 0.3, 'CHORANDO!', 540, 1250, 110, INK.blue);
  pop(st(10), s11 + 0.2, 'ME PAGA!', 540, 1250, 120, INK.red);
  pop(st(8), end(8) + 0.3, 'de perto: TE AMO', 540, 1600, 84, INK.black);
  pop(st(7) + 0.1, st(7) + 1.15, 'a última é pra quem', 540, 1600, 84, INK.purple);
  pop(st(7) + 0.4, st(7) + 1.15, 'te deve dinheiro', 540, 1700, 84, INK.purple);

  // ---------------- explicação + CTA ----------------
  W(s11 + 0.1, s11 + 0.3 * F11, 'imagem híbrida', 540, 230, 120, INK.red);
  pop(s11 + 0.12 * F11, 999, 'criada no MIT', 540, 350, 66, INK.blue);
  pop(P1, P2 - 0.2, 'de perto: traços finos', 540, 1450, 80, INK.black);
  pop(P2, P3 - 0.2, 'de longe: só manchas', 540, 1450, 80, INK.black);
  pop(P3, 999, 'manda pra quem te deve', 540, 1440, 84, INK.purple);
  { const g = WB.group(), x = 540, y = 1600, a = P3 + 0.6;
    const bt = WB.mk('rect', { x: x - 170, y: y - 55, width: 340, height: 100, rx: 50, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); txt('Seguir', x, y + 18, 64, '#ffffff', t1);
    const t2 = WB.group(g); txt('Seguindo', x, y + 18, 58, INK.black, t2);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0); }); }
  rest(0.01, s11);
  rest(s11 + 0.3 * F11 + 0.05, end(11) - 0.05);

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
    const SPOTS = [[290, 1790], [790, 1790], [540, 1800], [300, 1780]];
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
