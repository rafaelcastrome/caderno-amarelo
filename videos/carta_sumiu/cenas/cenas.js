// "Eu vou tirar a tua carta do vídeo", ~43 s, narração Gemini Charon (tomada única cortada nos silêncios).
// Truque clássico (Princess Card Trick): 6 cartas no começo; as 5 do fim são TODAS diferentes
// (mesmos valores, naipes trocados), então a carta de qualquer pessoa "some".
// O gancho já está na tela no quadro 0 (título + 6 cartas, sem esperar a mão escrever).
// Fim "volta o vídeo e escolhe outra carta" emenda no começo.
window.CENAS = function (WB) {
  const { INK, C, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const sc = c => S[c - 1];
  const fim = c => sc(c).falaFim ?? sc(c).end;
  const T = (c, f) => sc(c).start + f * (fim(c) - sc(c).start);       // fração da fala -> segundos
  const fr = (c, t) => (t - sc(c).start) / (sc(c).end - sc(c).start);  // segundos -> fração da cena
  const D = (c, f0, f1, st) => WB.draw(c, fr(c, T(c, f0)), fr(c, T(c, f1)), st);
  const W = (c, f0, f1, txt, x, y, size, cor, o = {}) =>
    WB.write(c, fr(c, T(c, f0)), fr(c, T(c, f1)), txt, x, y, size, cor, { anchor: 'middle', ...o });
  const rest = (c, t0, t1) => WB.restHand(c, fr(c, t0), fr(c, t1));
  const page = (c, f0) => WB.newPage(c, fr(c, T(c, f0)), fr(c, T(c, f0) + 0.4));
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 7, parent) => WB.strokePath(d, cor, w, parent);
  const P = (c, palavra, n = 1) => {
    const txt = WB.projeto.cenas[c - 1].fala; let i = -1;
    for (let k = 0; k < n; k++) i = txt.indexOf(palavra, i + 1);
    return i / txt.length;
  };
  const textNow = (str, x, y, size, cor, parent, anchor = 'middle') =>
    WB.showNow(WB.textStrokes(str, x, y, size, cor, parent, anchor).strokes);

  function countdown(t0, t1, x, y, size, parent) {
    const n = Math.ceil(t1 - t0 - 0.05);
    const g = WB.group(parent);
    const nums = [];
    for (let k = 1; k <= n; k++) {
      const gk = WB.group(g);
      textNow(String(k), x, y, size, INK.gray, gk);
      gk.setAttribute('opacity', 0);
      nums.push(gk);
    }
    WB.effect(t => {
      const v = (t >= t0 && t < t1) ? Math.ceil((t1 - t) * n / (t1 - t0)) : 0;
      nums.forEach((gk, i) => gk.setAttribute('opacity', i + 1 === v ? 1 : 0));
    });
  }

  // ---------------- cartas (desenho fixo, sem animação de mão) ----------------
  const NAIPE = {
    copas: 'M 0 0.9 C -0.25 0.65 -1 0.2 -1 -0.35 C -1 -0.9 -0.35 -1.05 0 -0.55 C 0.35 -1.05 1 -0.9 1 -0.35 C 1 0.2 0.25 0.65 0 0.9 Z',
    ouros: 'M 0 -1 Q 0.35 -0.4 0.75 0 Q 0.35 0.4 0 1 Q -0.35 0.4 -0.75 0 Q -0.35 -0.4 0 -1 Z',
    espadas: 'M 0 -1 C 0.25 -0.7 1 -0.3 1 0.2 C 1 0.65 0.45 0.8 0.1 0.45 L 0.3 1 L -0.3 1 L -0.1 0.45 C -0.45 0.8 -1 0.65 -1 0.2 C -1 -0.3 -0.25 -0.7 0 -1 Z',
    paus: 'M 0 -0.12 A 0.36 0.36 0 1 1 0.01 -0.12 Z M -0.42 0.48 A 0.36 0.36 0 1 1 -0.41 0.48 Z M 0.42 0.48 A 0.36 0.36 0 1 1 0.43 0.48 Z ' +
      'M -0.1 0.25 L -0.3 1 L 0.3 1 L 0.1 0.25 Z',
  };
  // "paus": arcos completos não renderizam com A de ponto quase igual; usamos círculos de verdade
  const naipe = (tipo, x, y, s, parent) => {
    const cor = (tipo === 'copas' || tipo === 'ouros') ? INK.red : INK.black;
    const g = WB.mk('g', { transform: `translate(${r1(x)} ${r1(y)}) scale(${s})` }, parent);
    if (tipo === 'paus') {
      [[0, -0.48], [-0.44, 0.1], [0.44, 0.1]].forEach(([cx, cy]) => WB.mk('circle', { cx, cy, r: 0.38, fill: cor }, g));
      WB.mk('path', { d: 'M -0.12 0 L -0.32 1 L 0.32 1 L 0.12 0 Z', fill: cor }, g);
    } else WB.mk('path', { d: NAIPE[tipo], fill: cor }, g);
    return cor;
  };
  const CW = 220, CH = 310;
  function carta(cx, cy, valor, tipo, parent, rot = 0) {
    const g = WB.mk('g', { transform: `translate(${cx} ${cy}) rotate(${rot})` }, parent);
    WB.mk('rect', { x: -CW / 2 + 8, y: -CH / 2 + 10, width: CW, height: CH, rx: 22, fill: '#1f1f24', opacity: 0.12 }, g);
    WB.mk('rect', { x: -CW / 2, y: -CH / 2, width: CW, height: CH, rx: 22, fill: '#fffdf6', stroke: INK.black, 'stroke-width': 6 }, g);
    const cor = naipe(tipo, 0, 70, 52, g);
    textNow(valor, 0, 20, 150, cor, g);
    // cantos
    textNow(valor, -CW / 2 + 34, -CH / 2 + 62, 56, cor, g);
    naipe(tipo, -CW / 2 + 34, -CH / 2 + 92, 17, g);
    const g2 = WB.mk('g', { transform: 'rotate(180)' }, g);
    textNow(valor, -CW / 2 + 34, -CH / 2 + 62, 56, cor, g2);
    naipe(tipo, -CW / 2 + 34, -CH / 2 + 92, 17, g2);
    return g;
  }
  const POS6 = [[235, 650], [540, 650], [845, 650], [235, 1020], [540, 1020], [845, 1020]];
  const ANTES = [['K', 'copas'], ['Q', 'espadas'], ['J', 'ouros'], ['K', 'paus'], ['Q', 'copas'], ['J', 'espadas']];
  const POS5 = [[235, 650], [540, 650], [845, 650], [388, 1020], [692, 1020]];
  const DEPOIS = [['K', 'ouros'], ['Q', 'paus'], ['J', 'copas'], ['K', 'espadas'], ['Q', 'ouros']];
  const ROT = [-3, 2, -1.5, 2.5, -2, 1.5];

  // =====================================================================
  // FOLHA 1 — as 6 cartas (cenas 1 e 2). Já está tudo na tela no quadro 0.
  // =====================================================================
  textNow('ESCOLHE UMA CARTA', 540, 330, 112, INK.red, WB.layer);
  POS6.forEach(([x, y], i) => carta(x, y, ANTES[i][0], ANTES[i][1], WB.layer, ROT[i]));
  // cena 1: só com o olho (olhinho desenhado do lado)
  const t1 = W(1, 0.05, 0.4, 'só com o OLHO', 470, 1320, 92, INK.blue);
  const ex = 470 + t1.width / 2 + 95, ey = 1290;
  D(1, 0.42, 0.62, [sp(`M ${ex - 70} ${ey} Q ${ex} ${ey - 60} ${ex + 70} ${ey} Q ${ex} ${ey + 60} ${ex - 70} ${ey}`, INK.blue, 7),
    sp(WB.circlePath(ex, ey, 22), INK.blue, 9)]);
  W(1, 0.66, 0.98, 'e não conta pra ninguém!', 540, 1430, 70, INK.gray);
  // cena 2: repete 3x + contagem
  W(2, P(2, 'repete') - 0.02, 0.95, 'repete 3x na cabeça', 460, 1540, 74, INK.purple);
  rest(2, T(2, 1.0), sc(3).start);
  countdown(sc(2).falaFim + 0.1, sc(2).end - 0.1, 860, 1550, 130, WB.overlay);

  // =====================================================================
  // FOLHA 2 — o olho que lê a mente (cenas 3 e 4)
  // =====================================================================
  page(3, 0.02);
  W(3, P(3, 'Agora'), P(3, 'olho') + 0.06, 'olha no meu OLHO', 540, 360, 104, INK.black);
  const OX = 540, OY = 820;
  const olho = [sp(`M ${OX - 400} ${OY} Q ${OX} ${OY - 330} ${OX + 400} ${OY}`, INK.black, 10),
    sp(`M ${OX - 400} ${OY} Q ${OX} ${OY + 330} ${OX + 400} ${OY}`, INK.black, 10),
    sp(WB.circlePath(OX, OY, 150), INK.purple, 10)];
  D(3, P(3, 'olho') + 0.06, P(3, 'Tô') + 0.02, olho);
  // espiral hipnótica dentro da íris, gira depois de desenhada
  const gEsp = WB.group(null);
  let esp = '';
  for (let k = 0; k <= 160; k++) {
    const a = k / 160 * Math.PI * 2 * 3.5, r = 8 + k / 160 * 128;
    esp += (k ? ' L ' : 'M ') + `${r1(OX + r * Math.cos(a))} ${r1(OY + r * Math.sin(a))}`;
  }
  const espiral = sp(esp, INK.purple, 8, gEsp);
  D(3, P(3, 'Tô'), 0.75, espiral);
  WB.effect(t => {
    const t0 = T(3, 0.75);
    const ang = t > t0 ? (t - t0) * 260 : 0;
    gEsp.setAttribute('transform', `rotate(${r1(ang)} ${OX} ${OY})`);
  });
  // raios saindo do olho
  const raios = [];
  for (let k = 0; k < 8; k++) {
    const a = -Math.PI / 2 + (k - 3.5) * 0.32;
    raios.push(sp(WB.roughLine(r1(OX + 440 * Math.cos(a)), r1(OY - 60 + 300 * Math.sin(a)), r1(OX + 520 * Math.cos(a)), r1(OY - 60 + 380 * Math.sin(a)), 2), INK.orange, 7));
  }
  W(3, 0.76, 0.99, 'tô lendo tua mente...', 540, 1250, 84, INK.purple);
  rest(3, T(3, 1.0) + 0.05, sc(4).start);
  // cena 4: já sei
  D(4, 0.0, 0.25, raios);
  const st = C.stamp('JÁ SEI!', 540, 1460, { size: 130, color: INK.green, rot: -8 });
  D(4, 0.28, 0.85, [st.box, st.text]);

  // =====================================================================
  // FOLHA 3 — 3, 2, 1... e a carta some (cenas 5 e 6)
  // =====================================================================
  page(5, 0.0);
  W(5, 0.06, P(5, 'vídeo') + 0.06, 'vou TIRAR ela do vídeo', 540, 330, 96, INK.black);
  rest(5, T(5, P(5, 'vídeo') + 0.08), T(5, 1) + 0.3);
  const POP = fim(5) - 0.02;
  // números grandes no lugar das cartas
  [['3', 'Três'], ['2', 'dois'], ['1', 'um']].forEach(([n, pal], i, arr) => {
    const g = WB.group(null);
    textNow(n, 540, 1000, 420, i === 2 ? INK.red : INK.gray, g);
    const a = T(5, P(5, pal)) - 0.05;
    const b = i < 2 ? T(5, P(5, arr[i + 1][1])) - 0.05 : POP;
    WB.effect(t => {
      const on = t >= a && t < b;
      const u = clamp((t - a) / 0.18);
      g.setAttribute('opacity', on ? 1 : 0);
      g.setAttribute('transform', `translate(540 840) scale(${r1(10 * (0.6 + 0.4 * ease(u))) / 10}) translate(-540 -840)`);
    });
  });
  // estalo: risquinhos em volta + as 5 cartas pulam na folha
  const puf = WB.group(null);
  for (let k = 0; k < 12; k++) {
    const a = k / 12 * Math.PI * 2;
    WB.mk('path', { d: `M ${r1(540 + 360 * Math.cos(a))} ${r1(840 + 420 * Math.sin(a))} L ${r1(540 + 470 * Math.cos(a))} ${r1(840 + 540 * Math.sin(a))}`,
      stroke: INK.orange, 'stroke-width': 10, 'stroke-linecap': 'round', fill: 'none' }, puf);
  }
  WB.effect(t => {
    const u = clamp((t - POP) / 0.35);
    puf.setAttribute('opacity', t < POP ? 0 : (1 - u).toFixed(3));
    puf.setAttribute('transform', `translate(540 840) scale(${(0.8 + 0.4 * u).toFixed(3)}) translate(-540 -840)`);
  });
  POS5.forEach(([x, y], i) => {
    const g = WB.group(null);
    carta(0, 0, DEPOIS[i][0], DEPOIS[i][1], g, ROT[i]);
    const a = POP + i * 0.06;
    WB.effect(t => {
      const u = clamp((t - a) / 0.22);
      const s = t < a ? 0.01 : 0.55 + 0.45 * ease(u) + 0.08 * Math.sin(Math.PI * u);
      g.setAttribute('opacity', t < a ? 0 : 1);
      g.setAttribute('transform', `translate(${x} ${y}) scale(${s.toFixed(3)})`);
    });
  });
  // cena 6: SUMIU! + lupa procurando
  const st2 = C.stamp('SUMIU!', 540, 1330, { size: 140, color: INK.red, rot: -7 });
  D(6, 0.0, 0.3, [st2.box, st2.text]);
  W(6, P(6, 'Pode'), P(6, 'aqui') + 0.1, 'pode procurar...', 540, 1520, 76, INK.gray);
  rest(6, T(6, 1.0) - 0.1, sc(7).start);
  {
    const lupa = WB.group(WB.overlay);
    WB.mk('circle', { cx: 0, cy: 0, r: 95, fill: '#ffffff', 'fill-opacity': 0.25, stroke: INK.black, 'stroke-width': 12 }, lupa);
    WB.mk('path', { d: 'M 68 68 L 170 170', stroke: INK.black, 'stroke-width': 26, 'stroke-linecap': 'round' }, lupa);
    WB.mk('path', { d: 'M -50 -40 Q -40 -65 -10 -72', stroke: '#ffffff', 'stroke-width': 9, 'stroke-linecap': 'round', fill: 'none' }, lupa);
    const ROTA = [[235, 650], [540, 650], [845, 650], [692, 1020], [388, 1020], [540, 820]];
    const a = T(6, P(6, 'Pode')), b = sc(6).end;
    WB.effect(t => {
      const vis = clamp((t - a) / 0.25) * (1 - clamp((t - b + 0.15) / 0.25));
      lupa.setAttribute('opacity', vis.toFixed(3));
      const u = clamp((t - a) / (b - a)) * (ROTA.length - 1);
      const k = Math.min(ROTA.length - 2, Math.floor(u)), e = ease(u - k);
      const x = lerp(ROTA[k][0], ROTA[k + 1][0], e), y = lerp(ROTA[k][1], ROTA[k + 1][1], e);
      lupa.setAttribute('transform', `translate(${r1(x)} ${r1(y)})`);
    });
  }

  // =====================================================================
  // FOLHA 4 — CTA "comenta MENTE" + loop (cenas 7 e 8)
  // =====================================================================
  page(7, 0.0);
  W(7, 0.04, P(7, 'vinte') + 0.02, 'Quer aprender', 540, 330, 84, INK.black);
  W(7, P(7, 'vinte'), P(7, 'mentalista') + 0.04, '20 TRUQUES', 540, 480, 140, INK.purple);
  W(7, P(7, 'mentalista') + 0.05, P(7, 'Comenta') - 0.02, 'de mentalista?', 540, 590, 84, INK.black);
  const bal = [sp(WB.roundRectPath(200, 650, 680, 270, 50), INK.red, 10),
    sp('M 760 920 L 830 1000 L 690 920', INK.red, 10)];
  D(7, P(7, 'Comenta'), P(7, 'Comenta') + 0.08, bal);
  W(7, P(7, 'Comenta') + 0.08, P(7, 'MENTE'), 'comenta', 540, 730, 64, INK.gray);
  W(7, P(7, 'MENTE'), P(7, 'aqui') + 0.06, 'MENTE', 540, 880, 170, INK.red);
  W(7, P(7, 'que eu'), 0.98, 'que eu te mando!', 540, 1080, 80, INK.green);
  rest(7, T(7, 1.0), sc(8).start);
  W(8, 0.0, P(8, 'Volta') - 0.02, 'DUVIDA?', 540, 1290, 120, INK.orange);
  const v = W(8, P(8, 'Volta'), P(8, 'vídeo') + 0.08, 'VOLTA o vídeo', 600, 1430, 90, INK.blue);
  // seta circular de "voltar" à esquerda do texto
  const vx = 600 - v.width / 2 - 80, vy = 1400;
  const arcPts = [];
  for (let k = 0; k <= 30; k++) { const a = -0.3 - k / 30 * 4.9; arcPts.push([vx + 52 * Math.cos(a), vy + 52 * Math.sin(a)]); }
  const [pa, pb] = [arcPts[28], arcPts[30]];
  D(8, P(8, 'vídeo') + 0.08, P(8, 'escolhe') - 0.02, [sp('M ' + arcPts.map(p => `${r1(p[0])} ${r1(p[1])}`).join(' L '), INK.blue, 9),
    sp(WB.arrowHead(r1(pb[0]), r1(pb[1]), Math.atan2(pb[1] - pa[1], pb[0] - pa[0]), 26), INK.blue, 9)]);
  W(8, P(8, 'escolhe'), 1.0, 'e escolhe OUTRA', 540, 1545, 90, INK.blue);

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA (estaciona embaixo enquanto as cartas estão na tela)
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
    const SPOTS = [[770, 1690], [270, 200], [310, 1690]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    const PARK = [310, 1690], CARTAS = [[0, sc(2).end], [sc(5).end - 1, sc(6).end]];
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % 3], b = SPOTS[(k + 1) % 3], e = ease(u);
      const w = Math.max(...CARTAS.map(([s0, s1]) => clamp((t - s0 + 0.8) / 0.8) * (1 - clamp((t - s1) / 0.8))));
      const x = lerp(lerp(a[0], b[0], e), PARK[0], ease(w)), y = lerp(lerp(a[1], b[1], e), PARK[1], ease(w)) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', 0.95);
    });
  }
};
