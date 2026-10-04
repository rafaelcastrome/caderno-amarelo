/*
 * Motor de "desenho animado" (estilo cartoon 2D chapado, tipo esquete de TikTok) — 1080x1920.
 *
 * Visual de referência: cenários simples (sala, banheiro, rua, quintal...), personagens de corpo
 * inteiro com contorno preto, olhos grandes e redondos, pernas de palito e chinelo; caixa de título
 * fixa no topo (texto vermelho em maiúsculas) e uma linha de legenda preta logo abaixo.
 * Cortes secos entre "tomadas" (shots), sem mão desenhando.
 *
 * O projeto fornece:
 *   projeto.json  -> titulo (caixa do topo), marca (@ discreto), opções
 *   timeline.json -> total (duração) e cenas (start/end) — gerado à mão ou pelo gerar_audio.py
 *   cenas.js      -> window.CENAS = function (CT) { ... }
 * O motor expõe window.seekToTime(t): TODO o quadro é função de t (renderização determinística).
 * Referência da API: references/api.md da skill.
 */
(async function () {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1080, H = 1920;
  const OUT = '#1d1d1f';
  const FONT = '"Varela Round", "Arial Rounded MT Bold", sans-serif';

  const svg = document.getElementById('svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.innerHTML = `<rect width="${W}" height="${H}" fill="#ffffff"/><g id="world"></g><g id="hud"></g>`;
  const world = svg.querySelector('#world'), hud = svg.querySelector('#hud');

  const [projeto, timeline] = await Promise.all([
    fetch('projeto.json').then(r => r.json()),
    fetch('timeline.json').then(r => r.json()),
  ]);
  await document.fonts.load(`60px "Varela Round"`);

  // ---------------- utilidades ----------------
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const lerp = (a, b, u) => a + (b - a) * u;
  const backOut = u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
  const f1 = n => (Math.round(n * 10) / 10).toString();
  function mk(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }
  const effects = [];
  const effect = fn => effects.push(fn);
  // forma com contorno: path(g, d, fill, {w, stroke, ...})
  const P = (g, d, fill = 'none', o = {}) => mk('path', { d, fill, stroke: o.stroke ?? OUT, 'stroke-width': o.w ?? 5,
    'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: o.opacity }, g);
  const E = (g, cx, cy, rx, ry, fill = '#fff', o = {}) => mk('ellipse', { cx, cy, rx, ry, fill, stroke: o.stroke ?? OUT, 'stroke-width': o.w ?? 5, opacity: o.opacity }, g);
  const R = (g, x, y, w, h, fill, o = {}) => mk('rect', { x, y, width: w, height: h, rx: o.r ?? 0, fill, stroke: o.stroke ?? OUT, 'stroke-width': o.w ?? 5 }, g);
  function T(g, str, x, y, size, fill = OUT, o = {}) {
    const el = mk('text', { x, y, 'font-family': FONT, 'font-size': size, fill, 'text-anchor': o.anchor || 'middle',
      'letter-spacing': o.ls ?? 0, stroke: o.stroke, 'stroke-width': o.sw, 'paint-order': 'stroke' }, g);
    el.textContent = str;
    return el;
  }
  // Mostra o grupo só entre t0 e t1 (corte seco).
  const visible = (g, t0, t1) => effect(t => { g.style.display = t >= t0 && t < t1 ? '' : 'none'; });

  // Entrada com efeito e movimento contínuo opcional (pop, slam, fly; loops shake/wiggle/bounce/float/pulse/spin).
  function pop(g, t0, o = {}) {
    let c = null;
    const kind = o.anim || 'pop', loop = o.loop, t1 = o.ate ?? Infinity;
    effect((t) => {
      const tt = t - t0;
      if (tt < 0 || t >= t1) { g.setAttribute('opacity', 0); return; }
      if (!c) { const bb = g.getBBox(); if (!bb.width && o.ox === undefined) { g.setAttribute('opacity', 0); return; } c = { x: o.ox ?? bb.x + bb.width / 2, y: o.oy ?? bb.y + bb.height / 2 }; }
      let k = 1, rot = 0, dx = 0, dy = 0, op = 1;
      if (kind === 'slam') { k = 1 + 0.9 * Math.pow(1 - clamp(tt / 0.2), 2); op = clamp(tt / 0.08); }
      else if (kind === 'fly') { const v = ease(clamp(tt / (o.dur || 0.5))); dx = (o.fx || 0) * (1 - v); dy = (o.fy || 0) * (1 - v); }
      else if (kind === 'none') { /* aparece direto */ }
      else { k = backOut(clamp(tt / 0.35)); op = clamp(tt / 0.1); }
      if (loop === 'shake') rot += Math.sin(tt * 40) * 5 * Math.exp(-tt * 2);
      if (loop === 'wiggle') rot += Math.sin(tt * 5) * 3;
      if (loop === 'bounce') dy -= Math.abs(Math.sin(tt * 5)) * 16;
      if (loop === 'float') dy += Math.sin(tt * 2.4) * 8;
      if (loop === 'pulse') k *= 1 + 0.06 * Math.sin(tt * 9);
      if (loop === 'spin') rot += Math.sin(tt * 9) * 8;
      g.setAttribute('opacity', op.toFixed(3));
      g.setAttribute('transform', `translate(${f1(c.x + dx)} ${f1(c.y + dy)}) rotate(${rot.toFixed(2)}) scale(${k.toFixed(3)}) translate(${-c.x} ${-c.y})`);
    });
    return g;
  }

  // ---------------- falas (boca sincronizada) ----------------
  const VOZES = {};
  // CT.fala('menina', [[t0,t1], ...]) — intervalos de cada palavra dita por aquela voz.
  function fala(voz, palavras) { (VOZES[voz] = VOZES[voz] || []).push(...palavras); VOZES[voz].sort((a, b) => a[0] - b[0]); }
  function boca(voz, t) {
    const ws = VOZES[voz];
    if (!ws) return 0;
    for (const [a, b] of ws) {
      if (t < a) break;
      if (t <= b) {
        const n = Math.max(1, Math.round((b - a) / 0.15)), u = (t - a) / (b - a);
        return Math.pow(Math.abs(Math.sin(Math.PI * u * n)), 0.7);
      }
    }
    return 0;
  }

  // ---------------- tomadas (shots) ----------------
  // CT.shot(t0, t1, 'sala', { ...opções do cenário }) -> { g, chao, t0, t1, zoom(t, s, cx, cy) }
  function shot(t0, t1, cenario, opts = {}) {
    const g = mk('g', {}, world);
    visible(g, t0, t1);
    const sh = { g, t0, t1, chao: opts.chao ?? 1240 };
    if (cenario) {
      const fn = typeof cenario === 'function' ? cenario : CENARIOS[cenario];
      if (!fn) throw new Error(`cenário desconhecido: ${cenario}`);
      fn(g, Object.assign({ chao: sh.chao }, opts));
    }
    const zk = [[t0, 1, 540, 1000]];
    sh.zoom = (t, s, cx = 540, cy = 1000) => { zk.push([t, s, cx, cy]); zk.sort((a, b) => a[0] - b[0]); return sh; };
    effect((t) => {
      let i = 0; while (i + 1 < zk.length && zk[i + 1][0] <= t) i++;
      const a = zk[Math.max(0, i - 1)], b = zk[i], u = i === 0 ? 1 : ease(clamp((t - b[0]) / 0.3));
      const s = lerp(a[1], b[1], u), cx = lerp(a[2], b[2], u), cy = lerp(a[3], b[3], u);
      g.setAttribute('transform', s === 1 ? '' : `translate(${f1(cx)} ${f1(cy)}) scale(${s.toFixed(4)}) translate(${-cx} ${-cy})`);
    });
    return sh;
  }

  // ---------------- cenários ----------------
  function chao(g, y, cor = '#d3d3d3') { mk('rect', { x: 0, y, width: W, height: H - y, fill: cor }, g); P(g, `M 0 ${y} L ${W} ${y}`, 'none', { w: 5 }); }
  function porta(g, x, y0, y1, cor = '#cfc58e', o = {}) {
    R(g, x - 16, y0 - 16, 252, y1 - y0 + 16, o.batente || '#b98b5e', { w: 5 });
    R(g, x, y0, 220, y1 - y0, cor, { w: 5 });
    mk('circle', { cx: x + 190, cy: (y0 + y1) / 2 + 40, r: 11, fill: '#e3b341', stroke: OUT, 'stroke-width': 4 }, g);
    if (o.aberta) R(g, x + 12, y0 + 12, 196, y1 - y0 - 12, o.aberta, { w: 0, stroke: 'none' });
  }
  function janela(g, x, y, w, h, o = {}) {
    R(g, x - 12, y - 12, w + 24, h + 24, '#ffffff', { w: 5 });
    R(g, x, y, w, h, o.noite ? '#1f2a4d' : '#bfe6fb', { w: 4 });
    if (o.noite) { mk('circle', { cx: x + w * 0.7, cy: y + h * 0.35, r: 28, fill: '#ffe48a', stroke: 'none' }, g); mk('circle', { cx: x + w * 0.7 + 12, cy: y + h * 0.35 - 8, r: 24, fill: '#1f2a4d', stroke: 'none' }, g); }
    P(g, `M ${x + w / 2} ${y} L ${x + w / 2} ${y + h} M ${x} ${y + h / 2} L ${x + w} ${y + h / 2}`, 'none', { w: 5 });
  }
  function sofa(g, x, y, w = 420, cor = '#c8946a') {   // x,y = canto esquerdo do assento (chão em y+150)
    R(g, x, y - 170, w, 190, cor, { r: 30 });
    R(g, x + 30, y - 10, w - 60, 90, cor, { r: 18 });
    R(g, x - 30, y - 90, 70, 200, cor, { r: 26 }); R(g, x + w - 40, y - 90, 70, 200, cor, { r: 26 });
    P(g, `M ${x + w / 2} ${y - 6} L ${x + w / 2} ${y + 78}`, 'none', { w: 4 });
    P(g, `M ${x + 20} ${y + 110} L ${x + 20} ${y + 150} M ${x + w - 20} ${y + 110} L ${x + w - 20} ${y + 150}`, 'none', { w: 10 });
  }
  function tv(g, x, y) {   // x,y = topo do rack
    R(g, x, y, 280, 150, '#4b4b4b', { r: 6 }); R(g, x + 20, y + 30, 240, 90, '#2f2f2f', { r: 4, w: 3 });
    R(g, x + 30, y - 190, 220, 160, '#151515', { r: 8 }); R(g, x + 42, y - 178, 196, 136, '#22d3ee', { r: 4, w: 3 });
    R(g, x + 125, y - 30, 30, 30, '#151515', { w: 4 });
  }
  function quadro(g, x, y, w, h, cor = '#f4a6c4') { R(g, x, y, w, h, '#b98b5e', { w: 5 }); R(g, x + 14, y + 14, w - 28, h - 28, cor, { w: 3 }); }
  function planta(g, x, y) {   // y = chão
    R(g, x - 38, y - 80, 76, 80, '#d9603b', { r: 8 });
    P(g, `M ${x} ${y - 80} Q ${x - 70} ${y - 170} ${x - 40} ${y - 220} Q ${x - 10} ${y - 150} ${x} ${y - 80} Q ${x + 10} ${y - 190} ${x + 50} ${y - 230} Q ${x + 70} ${y - 140} ${x} ${y - 80} Z`, '#4caf50');
  }
  function arbusto(g, x, y, s = 1) {
    P(g, `M ${x - 60 * s} ${y} Q ${x - 70 * s} ${y - 50 * s} ${x - 30 * s} ${y - 50 * s} Q ${x - 20 * s} ${y - 90 * s} ${x + 15 * s} ${y - 70 * s} Q ${x + 50 * s} ${y - 90 * s} ${x + 55 * s} ${y - 45 * s} Q ${x + 80 * s} ${y - 30 * s} ${x + 62 * s} ${y} Z`, '#3fae49', { w: 4 });
  }
  function casa(g, x, y, w, h, cor, telhado = '#c2502e') {   // fachada com base em y
    R(g, x, y - h, w, h, cor, { w: 5 });
    P(g, `M ${x - 20} ${y - h} L ${x + w / 2} ${y - h - w * 0.32} L ${x + w + 20} ${y - h} Z`, telhado);
    R(g, x + w * 0.38, y - h * 0.55, w * 0.24, h * 0.55, '#8b5a2b', { w: 4 });
    R(g, x + w * 0.08, y - h * 0.8, w * 0.22, h * 0.25, '#bfe6fb', { w: 4 });
    R(g, x + w * 0.7, y - h * 0.8, w * 0.22, h * 0.25, '#bfe6fb', { w: 4 });
  }
  const CENARIOS = {
    // Sala: parede branca, porta, janela, sofá opcional, tapete, chão cinza.
    sala(g, o) {
      const y = o.chao;
      mk('rect', { x: 0, y: 0, width: W, height: y, fill: o.parede || '#fbf8ef' }, g);
      mk('rect', { x: 0, y: y - 30, width: W, height: 30, fill: '#e7dcc4' }, g);
      if (o.porta !== false) porta(g, o.portaX ?? 780, y - 620, y, o.corPorta);
      if (o.janela !== false) janela(g, o.janelaX ?? 110, y - 560, 230, 200, { noite: o.noite });
      if (o.quadro !== false) quadro(g, o.quadroX ?? 440, y - 600, 170, 130);
      chao(g, y, o.piso || '#d3d3d3');
      mk('ellipse', { cx: 540, cy: y + 230, rx: 560, ry: 190, fill: o.tapete || '#a3ab72', stroke: 'none' }, g);
      if (o.sofa) sofa(g, o.sofaX ?? 60, y - 20, o.sofaW ?? 420, o.corSofa);
      if (o.tv) tv(g, o.tvX ?? 780, y - 60);
      if (o.planta) planta(g, o.plantaX ?? 700, y + 10);
    },
    banheiro(g, o) {
      const y = o.chao;
      mk('rect', { x: 0, y: 0, width: W, height: y, fill: '#dff1f8' }, g);
      for (let yy = 380; yy < y; yy += 90) P(g, `M 0 ${yy} L ${W} ${yy}`, 'none', { w: 2, stroke: '#9cc9db' });
      for (let xx = 0; xx < W; xx += 90) P(g, `M ${xx} 380 L ${xx} ${y}`, 'none', { w: 2, stroke: '#9cc9db' });
      chao(g, y, '#e9e9e9');
      for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) mk('rect', { x: i * 90, y: y + j * 90, width: 90, height: 90, fill: '#cfcfcf' }, g);
      P(g, `M 0 ${y} L ${W} ${y}`, 'none', { w: 5 });
      if (o.porta !== false) porta(g, o.portaX ?? 60, y - 620, y, '#f2f2f2', { batente: '#c9c9c9' });
    },
    rua(g, o) {
      const y = o.chao;
      mk('rect', { x: 0, y: 0, width: W, height: y, fill: '#eaf6ff' }, g);
      casa(g, -40, y - 40, 380, 400, '#f6d58e'); casa(g, 380, y - 40, 340, 360, '#a7d3a6', '#7a5230'); casa(g, 760, y - 40, 380, 420, '#f2b6c6');
      mk('rect', { x: 0, y: y - 40, width: W, height: 40, fill: '#9e9e9e' }, g);
      chao(g, y, '#cfcfcf');
      P(g, `M 0 ${y + 330} L ${W} ${y + 330}`, 'none', { w: 6 });
      mk('rect', { x: 0, y: y + 333, width: W, height: H, fill: '#7d7d7d' }, g);
      for (let x = 20; x < W; x += 200) mk('rect', { x, y: y + 520, width: 110, height: 18, fill: '#f5d142' }, g);
    },
    quintal(g, o) {
      const y = o.chao;
      mk('rect', { x: 0, y: 0, width: W, height: y, fill: '#ffffff' }, g);
      R(g, -10, y - 520, W + 20, 520, '#c4c4c4', { w: 5 });
      for (let x = 60; x < W; x += 180) P(g, `M ${x} ${y - 520} L ${x} ${y}`, 'none', { w: 2, stroke: '#a8a8a8' });
      chao(g, y, '#9fd39a');
      arbusto(g, 80, y + 6); arbusto(g, 990, y + 6, 1.2);
    },
    // Frente de casa à noite (porta acesa).
    noite(g, o) {
      const y = o.chao;
      mk('rect', { x: 0, y: 0, width: W, height: y, fill: '#1f2a4d' }, g);
      for (const [x, yy] of [[120, 420], [300, 520], [940, 460], [620, 400], [820, 600]]) mk('circle', { cx: x, cy: yy, r: 5, fill: '#fff' }, g);
      mk('circle', { cx: 860, cy: 520, r: 60, fill: '#ffe48a' }, g); mk('circle', { cx: 885, cy: 500, r: 52, fill: '#1f2a4d' }, g);
      R(g, -10, y - 640, W + 20, 640, '#e8d9b5', { w: 5 });
      porta(g, o.portaX ?? 430, y - 600, y, '#cfc58e', { aberta: '#ffd56b' });
      janela(g, 110, y - 520, 200, 170, { noite: true });
      chao(g, y, '#8f8f8f');
    },
    vazio(g, o) { mk('rect', { x: 0, y: 0, width: W, height: H, fill: o.cor || '#ffffff' }, g); },
  };

  // ---------------- objetos ----------------
  function cadeira(g, x, y, cor = '#f4a6c4') {   // cadeira de plástico vista de frente; y = chão, assento em y-150
    R(g, x - 95, y - 330, 190, 190, cor, { r: 40 });
    P(g, `M ${x - 75} ${y - 150} L ${x - 95} ${y} M ${x + 75} ${y - 150} L ${x + 95} ${y}`, 'none', { w: 14 });
    P(g, `M ${x - 75} ${y - 150} L ${x - 95} ${y} M ${x + 75} ${y - 150} L ${x + 95} ${y}`, 'none', { w: 8, stroke: cor });
    R(g, x - 110, y - 175, 220, 40, cor, { r: 16 });
  }
  function vaso(g, x, y) {   // y = chão
    P(g, `M ${x - 45} ${y} L ${x - 55} ${y - 60} L ${x + 55} ${y - 60} L ${x + 45} ${y} Z`, '#ffffff');
    P(g, `M ${x - 95} ${y - 140} Q ${x - 90} ${y - 50} ${x - 40} ${y - 50} L ${x + 40} ${y - 50} Q ${x + 90} ${y - 50} ${x + 95} ${y - 140} Z`, '#ffffff');
    R(g, x - 70, y - 300, 140, 120, '#ffffff', { r: 12 });
    E(g, x, y - 145, 105, 30, '#e6eef5');
  }
  function coco(g, x, y, s = 1) {   // y = base
    P(g, `M ${x - 50 * s} ${y} Q ${x - 60 * s} ${y - 25 * s} ${x - 32 * s} ${y - 30 * s} Q ${x - 38 * s} ${y - 55 * s} ${x - 10 * s} ${y - 56 * s} Q ${x - 12 * s} ${y - 82 * s} ${x + 6 * s} ${y - 94 * s} Q ${x + 10 * s} ${y - 74 * s} ${x + 26 * s} ${y - 60 * s} Q ${x + 48 * s} ${y - 52 * s} ${x + 40 * s} ${y - 30 * s} Q ${x + 64 * s} ${y - 25 * s} ${x + 52 * s} ${y} Z`, '#7a4a1e', { w: 4 });
  }
  function balao(g, cx, cy, rx, ry, de, o = {}) {  // balão de pensamento; de = [x, y] da cabeça
    const grp = mk('g', {}, g);
    if (de) {
      const [fx, fy] = de;
      for (const [u, r] of [[0.25, 12], [0.5, 20]]) E(grp, lerp(fx, cx, u), lerp(fy, cy + ry, u), r, r * 0.85, '#fff', { w: 4 });
    }
    let d = ''; const n = 12;
    const pts = Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      if (!i) d = `M ${f1(p[0])} ${f1(p[1])}`;
      d += ` Q ${f1(mx + (mx - cx) * 0.3)} ${f1(my + (my - cy) * 0.3)} ${f1(q[0])} ${f1(q[1])}`;
    });
    P(grp, d + ' Z', '#ffffff', { w: 5 });
    return grp;
  }
  function falaBalao(g, x0, y0, x1, y1, tx, ty) {   // balão de fala com rabinho apontando (tx,ty)
    const grp = mk('g', {}, g), bx = clamp(tx - 40, x0 + 40, x1 - 120);
    R(grp, x0, y0, x1 - x0, y1 - y0, '#ffffff', { r: 40 });
    P(grp, `M ${bx} ${y1 - 3} L ${tx} ${ty} L ${bx + 70} ${y1 - 3}`, '#ffffff');
    return grp;
  }

  // ---------------- personagens ----------------
  const MOODS = {
    neutro: { lid: 0.08, px: 0, py: 0, bi: 0, bo: 0, smile: 0 },
    lado: { lid: 0.12, px: 10, py: 0, bi: 0, bo: 0, smile: 0 },
    enfado: { lid: 0.48, px: 6, py: 2, bi: 4, bo: 3, smile: -3, rot: -4 },
    sorriso: { lid: 0.3, px: 3, py: 0, bi: -5, bo: -3, smile: 12, rot: -3 },
    risada: { lid: 0.55, px: 0, py: 0, bi: -7, bo: -4, smile: 14, ri: 1, rot: 4 },
    seria: { lid: 0.2, px: 0, py: 0, bi: 7, bo: -1, smile: -4 },
    arregalada: { lid: 0, px: 0, py: -2, bi: -14, bo: -12, smile: -2, o: 1, rot: 2 },
    pensativa: { lid: 0.04, px: 9, py: -12, bi: -9, bo: -4, smile: -2, rot: 6 },
    estresse: { lid: 0.55, px: 0, py: 6, bi: -10, bo: 5, smile: -8, rot: -7 },
    triste: { lid: 0.42, px: -4, py: 8, bi: -11, bo: 6, smile: -10, rot: -4 },
    revira: { lid: 0.12, px: 6, py: -15, bi: -7, bo: -7, smile: -5, rot: 6 },
    brava: { lid: 0.3, px: 0, py: 0, bi: 13, bo: -4, smile: -10 },
    dor: { lid: 0.75, px: 0, py: 0, bi: 10, bo: -2, smile: -13, rot: -6 },
    confusa: { lid: 0.08, px: 8, py: -6, bi: -10, bo: -2, smile: -5, rot: 8, asym: 1 },
    feliz: { lid: 0.05, px: 0, py: 0, bi: -6, bo: -4, smile: 14 },
    malandro: { lid: 0.35, px: 10, py: 0, bi: 6, bo: -6, smile: 10, rot: 5 },
  };
  const MKEYS = ['lid', 'px', 'py', 'bi', 'bo', 'smile', 'ri', 'o', 'rot', 'asym'];
  // Poses de braço (braço direito; o esquerdo é espelhado). [cotovelo, mão] relativos ao ombro.
  // Valores com "h" são calculados a partir da cabeça (dependem do corpo).
  const POSES = {
    baixo: () => [[10, 95], [14, 185]],
    cintura: () => [[60, 80], [8, 140]],
    queixo: (b) => [[36, 108], [-52, b.hy + 102 - b.sy]],
    cabeca: (b) => [[86, -40], [8, b.hy - 60 - b.sy]],
    boca: (b) => [[40, 96], [-56, b.hy + 62 - b.sy]],
    orelha: (b) => [[74, 40], [22, b.hy + 4 - b.sy]],
    aponta: () => [[78, 10], [168, -34]],
    acima: () => [[60, -84], [86, -180]],
    frente: () => [[44, 84], [118, 40]],
    ombro: () => [[62, 46], [112, -8]],
    soco: () => [[34, 66], [24, -42]],
    acena: () => [[62, -74], [104, -172]],
    segura: () => [[26, 96], [58, 176]],
    cruzado: () => [[34, 92], [-74, 64]],
  };
  const SEEDS = { n: 0 };
  /*
   * CT.pessoa(shot, spec) — personagem de corpo inteiro (pés em spec.x, spec.y).
   * spec: { x, y, s=1.15, flip, pose: 'em_pe'|'sentado', pele, cabelo: { tipo: 'longo'|'coque'|'curto'|'espetado'|'cacheado'|'careca', cor },
   *         roupa: { tipo: 'camiseta'|'regata'|'vestido', cima, baixo, perna: 'bermuda'|'calca' }, chinelo, oculos, bigode, bone, cracha,
   *         voz, mao: { d: 'mic'|'celular', e: ... } }
   * Retorna o rig: humor(t, m), braco(t, 'd'|'e', pose), olhar(t, dx, dy), mover(t0, t1, x, {anda}), pulo(t0, t1, n), treme(t0, t1), some(t0, t1)
   */
  function pessoa(sh, sp) {
    const parent = sh.g || sh;
    const s = sp.s ?? 1.15, flip = sp.flip ? -1 : 1, sent = sp.pose === 'sentado';
    const hip = sent ? -150 : -230, sy = hip - 166, hy = hip - 300, b = { hip, sy, hy };
    const skin = sp.pele || '#e9b48a', hair = (sp.cabelo || {}).cor || '#2a1a12', htipo = (sp.cabelo || {}).tipo || 'curto';
    const roupa = Object.assign({ tipo: 'camiseta', cima: '#7c5cd6', baixo: '#3b82f6', perna: 'bermuda' }, sp.roupa || {});
    const seed = ++SEEDS.n;
    const root = mk('g', {}, parent);
    const body = mk('g', {}, root);
    const hairBack = mk('g', {}, body), legs = mk('g', {}, body), torso = mk('g', {}, body);
    const head = mk('g', {}, body);
    const armsG = mk('g', {}, body);

    // cabelo de trás
    if (htipo === 'longo') P(hairBack, `M -94 ${hy - 6} Q -104 ${hy - 122} 0 ${hy - 120} Q 104 ${hy - 122} 94 ${hy - 6} Q 104 ${sy + 20} 98 ${sy + 76} L -98 ${sy + 76} Q -104 ${sy + 20} -94 ${hy - 6} Z`, hair);
    if (htipo === 'coque') E(hairBack, 0, hy - 108, 38, 34, hair);
    // pernas + chinelos
    const legL = P(legs, '', 'none', { w: 7 }), legR = P(legs, '', 'none', { w: 7 });
    const footL = mk('g', {}, legs), footR = mk('g', {}, legs);
    for (const f of [footL, footR]) {
      E(f, 0, 0, 34, 11, sp.chinelo || '#7cc8f2', { w: 4 });
      P(f, 'M -12 -6 L 2 -16 L 14 -6', 'none', { w: 4 });
    }
    // roupa
    if (roupa.tipo === 'vestido') {
      P(torso, `M -58 ${sy - 4} Q 0 ${sy - 16} 58 ${sy - 4} Q 70 ${hip - 40} 108 ${hip + 92} L -108 ${hip + 92} Q -70 ${hip - 40} -58 ${sy - 4} Z`, roupa.cima);
    } else {
      if (roupa.perna === 'calca') P(torso, `M -62 ${hip - 62} L 62 ${hip - 62} L 58 -14 L 10 -14 L 0 ${hip + 40} L -10 -14 L -58 -14 Z`, roupa.baixo);
      else P(torso, `M -62 ${hip - 62} L 62 ${hip - 62} L 72 ${hip + 52} L 6 ${hip + 52} L 0 ${hip + 12} L -6 ${hip + 52} L -72 ${hip + 52} Z`, roupa.baixo);
      if (roupa.tipo === 'regata') {
        P(torso, `M -66 ${sy + 6} Q 0 ${sy - 8} 66 ${sy + 6} L 60 ${hip - 50} L -60 ${hip - 50} Z`, skin);
        P(torso, `M -56 ${sy + 56} Q 0 ${sy + 84} 56 ${sy + 56} L 62 ${hip - 50} L -62 ${hip - 50} Z`, roupa.cima);
        P(torso, `M -46 ${sy + 58} L -42 ${sy + 4} M 46 ${sy + 58} L 42 ${sy + 4}`, 'none', { w: 9, stroke: roupa.cima });
      } else {
        P(torso, `M -68 ${sy + 6} Q 0 ${sy - 8} 68 ${sy + 6} L 62 ${hip - 50} L -62 ${hip - 50} Z`, roupa.cima);
        P(torso, `M -22 ${sy} Q 0 ${sy + 22} 22 ${sy}`, skin, { w: 4 });
      }
    }
    if (sp.cracha) { R(torso, 14, sy + 70, 44, 56, '#ffffff', { r: 6, w: 4 }); P(torso, `M 36 ${sy + 70} L 20 ${sy + 6}`, 'none', { w: 4, stroke: '#2563eb' }); }
    // pescoço + cabeça
    R(head, -15, hy + 72, 30, sy - hy - 68, skin, { w: 4 });
    E(head, -80, hy + 8, 13, 19, skin, { w: 4 }); E(head, 80, hy + 8, 13, 19, skin, { w: 4 });
    E(head, 0, hy, 82, 94, skin, { w: 5 });
    const face = mk('g', {}, head);
    const eyes = [-1, 1].map((sd, i) => {
      const ex = sd * 31, ey = hy - 6, id = `ol${seed}_${i}`;
      const cp = mk('clipPath', { id }, face); mk('circle', { cx: ex, cy: ey, r: 30 }, cp);
      mk('circle', { cx: ex, cy: ey, r: 31, fill: '#ffffff', stroke: OUT, 'stroke-width': 4.5 }, face);
      const pupil = mk('circle', { cx: ex, cy: ey, r: 8.5, fill: '#111', 'clip-path': `url(#${id})` }, face);
      const lid = mk('rect', { x: ex - 34, y: ey - 34, width: 68, height: 0, fill: skin, 'clip-path': `url(#${id})` }, face);
      const lidLine = mk('path', { d: '', fill: 'none', stroke: OUT, 'stroke-width': 4.5, 'clip-path': `url(#${id})` }, face);
      mk('circle', { cx: ex, cy: ey, r: 31, fill: 'none', stroke: OUT, 'stroke-width': 4.5 }, face);
      const brow = mk('path', { d: '', fill: 'none', stroke: htipo === 'careca' ? '#555' : hair, 'stroke-width': 9, 'stroke-linecap': 'round' }, face);
      return { ex, ey, pupil, lid, lidLine, brow };
    });
    P(face, `M 6 ${hy + 26} Q -10 ${hy + 42} 6 ${hy + 46}`, 'none', { w: 4 });
    const mouth = mk('path', { d: '', fill: '#7a1f2b', stroke: OUT, 'stroke-width': 4.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, face);
    if (sp.bigode) P(face, `M -30 ${hy + 58} Q 0 ${hy + 40} 30 ${hy + 58} Q 0 ${hy + 66} -30 ${hy + 58} Z`, hair, { w: 4 });
    if (sp.barba) P(face, `M -60 ${hy + 40} Q -50 ${hy + 100} 0 ${hy + 102} Q 50 ${hy + 100} 60 ${hy + 40} Q 40 ${hy + 86} 0 ${hy + 84} Q -40 ${hy + 86} -60 ${hy + 40} Z`, hair, { w: 4 });
    // cabelo da frente
    const hf = mk('g', {}, head);
    if (htipo === 'longo') {
      P(hf, `M -86 ${hy - 20} Q -88 ${hy - 110} 4 ${hy - 108} Q 94 ${hy - 106} 86 ${hy - 26} Q 46 ${hy - 82} -18 ${hy - 64} Q -60 ${hy - 54} -86 ${hy - 20} Z`, hair);
      P(hf, `M 60 ${hy - 80} Q 104 ${hy - 10} 84 ${hy + 86} Q 74 ${hy + 30} 56 ${hy - 30} Z`, hair, { w: 4 });
    } else if (htipo === 'coque') {
      P(hf, `M -84 ${hy - 14} Q -86 ${hy - 104} 0 ${hy - 102} Q 86 ${hy - 104} 84 ${hy - 14} Q 44 ${hy - 70} 0 ${hy - 66} Q -44 ${hy - 70} -84 ${hy - 14} Z`, hair);
      P(hf, `M -40 ${hy - 92} Q -10 ${hy - 80} 10 ${hy - 98} M 20 ${hy - 90} Q 40 ${hy - 76} 60 ${hy - 86}`, 'none', { w: 3 });
    } else if (htipo === 'curto') {
      P(hf, `M -84 ${hy - 6} Q -92 ${hy - 104} 0 ${hy - 104} Q 92 ${hy - 104} 84 ${hy - 6} Q 70 ${hy - 56} 30 ${hy - 60} Q 10 ${hy - 46} -20 ${hy - 60} Q -60 ${hy - 56} -84 ${hy - 6} Z`, hair);
    } else if (htipo === 'espetado') {
      let d = `M -84 ${hy - 4}`;
      [[-82, -86], [-58, -66], [-48, -118], [-24, -82], [-4, -128], [14, -84], [40, -122], [52, -76], [80, -100], [84, -4]].forEach(([x, y]) => { d += ` L ${x} ${hy + y}`; });
      P(hf, d + ` Q 30 ${hy - 54} 0 ${hy - 50} Q -40 ${hy - 54} -84 ${hy - 4} Z`, hair);
    } else if (htipo === 'cacheado') {
      for (const [x, y, r] of [[-70, -40, 30], [-56, -82, 32], [-20, -104, 34], [22, -106, 34], [58, -84, 32], [74, -42, 28]]) mk('circle', { cx: x, cy: hy + y, r, fill: hair, stroke: OUT, 'stroke-width': 4 }, hf);
    }
    if (sp.bone) {
      P(hf, `M -86 ${hy - 20} Q -84 ${hy - 112} 0 ${hy - 112} Q 84 ${hy - 112} 86 ${hy - 20} Z`, sp.bone);
      P(hf, `M 20 ${hy - 22} L 140 ${hy - 16} Q 136 ${hy} 20 ${hy - 4} Z`, sp.bone, { w: 4 });
    }
    if (sp.oculos) {
      for (const sd of [-1, 1]) mk('circle', { cx: sd * 31, cy: hy - 6, r: 37, fill: 'none', stroke: OUT, 'stroke-width': 4 }, hf);
      P(hf, `M -6 ${hy - 10} L 6 ${hy - 10}`, 'none', { w: 4 });
    }
    // braços
    const arms = ['e', 'd'].map((lado) => {
      const sd = lado === 'd' ? 1 : -1, g = mk('g', {}, armsG);
      const out = mk('path', { d: '', fill: 'none', stroke: OUT, 'stroke-width': 21, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      const inn = mk('path', { d: '', fill: 'none', stroke: skin, 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      const handG = mk('g', {}, g);
      const item = (sp.mao || {})[lado];
      const itemG = mk('g', {}, handG);
      if (item === 'mic') { R(itemG, -8, -78, 16, 86, '#333', { r: 6, w: 4 }); mk('circle', { cx: 0, cy: -92, r: 22, fill: '#8a8a8a', stroke: OUT, 'stroke-width': 4 }, itemG); P(itemG, 'M -14 -100 L 14 -84 M -16 -88 L 10 -72 M -8 -110 L 16 -96', 'none', { w: 3, stroke: '#d0d0d0' }); }
      if (item === 'celular') R(itemG, -17, -34, 34, 60, '#333', { r: 7, w: 4 });
      if (typeof item === 'function') item(itemG);
      mk('circle', { cx: 0, cy: 0, r: 13, fill: skin, stroke: OUT, 'stroke-width': 4 }, handG);
      const finger = P(handG, `M 6 -4 L ${30 * sd} -10`, 'none', { w: 9, opacity: 0 });
      let sleeve = null;
      if (roupa.tipo === 'camiseta' || (roupa.tipo === 'vestido' && sp.manga)) {
        sleeve = [mk('path', { d: '', fill: 'none', stroke: OUT, 'stroke-width': 40, 'stroke-linecap': 'round' }, g),
          mk('path', { d: '', fill: 'none', stroke: roupa.cima, 'stroke-width': 31, 'stroke-linecap': 'round' }, g)];
        g.appendChild(handG);
      }
      return { lado, sd, g, out, inn, handG, finger, sleeve, k: [[-1, 'baixo']] };
    });

    // trilhas de estado
    const moods = [[-1, 'neutro']], looks = [[-1, 0, 0]], moves = [], hops = [], shakes = [], hides = [];
    const rig = {
      root, head, body, b, spec: sp,
      humor(t, m) { if (!MOODS[m]) throw new Error('humor desconhecido: ' + m); moods.push([t, m]); moods.sort((a, c) => a[0] - c[0]); return rig; },
      braco(t, lado, pose) {
        if (!POSES[pose]) throw new Error('pose desconhecida: ' + pose);
        const ls = lado === 'ambos' ? ['e', 'd'] : [lado];
        for (const l of ls) { const a = arms.find(x => x.lado === l); a.k.push([t, pose]); a.k.sort((x, y) => x[0] - y[0]); }
        return rig;
      },
      olhar(t, dx, dy = 0) { looks.push([t, dx, dy]); looks.sort((a, c) => a[0] - c[0]); return rig; },
      mover(t0, t1, x, o = {}) { moves.push({ t0, t1, x, y: o.y, anda: o.anda !== false }); moves.sort((a, c) => a.t0 - c.t0); return rig; },
      pulo(t0, t1, n = 2, alt = 60) { hops.push({ t0, t1, n, alt }); return rig; },
      treme(t0, t1, amp = 8) { shakes.push({ t0, t1, amp }); return rig; },
      some(t0, t1) { hides.push([t0, t1]); return rig; },
    };
    const step = (list, t) => { let i = 0; while (i + 1 < list.length && list[i + 1][0] <= t) i++; return i; };
    function moodAt(t) {
      const i = step(moods, t), cur = MOODS[moods[i][1]], prev = MOODS[moods[Math.max(0, i - 1)][1]];
      const u = i === 0 ? 1 : ease(clamp((t - moods[i][0]) / 0.25)), m = {};
      for (const k of MKEYS) m[k] = lerp(prev[k] || 0, cur[k] || 0, u);
      return m;
    }
    function armAt(a, t) {
      const i = step(a.k, t), p1 = POSES[a.k[i][1]](b), p0 = POSES[a.k[Math.max(0, i - 1)][1]](b);
      const u = i === 0 ? 1 : ease(clamp((t - a.k[i][0]) / 0.3));
      const L = (q, r) => [lerp(q[0], r[0], u), lerp(q[1], r[1], u)];
      return { el: L(p0[0], p1[0]), hd: L(p0[1], p1[1]), point: (a.k[i][1] === 'aponta' ? u : 0) + (a.k[Math.max(0, i - 1)][1] === 'aponta' && i > 0 ? 1 - u : 0), wave: a.k[i][1] === 'acena' ? u : 0 };
    }
    function posAt(t) {
      let x = sp.x, y = sp.y, walking = 0;
      for (const m of moves) {
        if (t >= m.t1) { x = m.x; if (m.y !== undefined) y = m.y; }
        else if (t > m.t0) {
          const u = (t - m.t0) / (m.t1 - m.t0), e = m.anda ? u : ease(u);
          x = lerp(x, m.x, e); if (m.y !== undefined) y = lerp(y, m.y, e);
          if (m.anda) walking = 1;
        }
      }
      return { x, y, walking };
    }
    effect((t) => {
      let hidden = false;
      for (const [a, c] of hides) if (t >= a && t < c) hidden = true;
      root.style.display = hidden ? 'none' : '';
      if (hidden) return;
      const p = posAt(t), m = moodAt(t);
      let dy = 0, dx = 0;
      for (const h of hops) if (t > h.t0 && t < h.t1) dy -= Math.abs(Math.sin(Math.PI * h.n * (t - h.t0) / (h.t1 - h.t0))) * h.alt;
      for (const sk of shakes) if (t > sk.t0 && t < sk.t1) dx += Math.sin(t * 70) * sk.amp;
      const ph = t * 9;
      if (p.walking) dy -= Math.abs(Math.sin(ph)) * 10;
      root.setAttribute('transform', `translate(${f1(p.x + dx)} ${f1(p.y + dy)}) scale(${(s * flip).toFixed(3)} ${s.toFixed(3)})`);
      // pernas
      const kx = sent ? 46 : 32, wl = p.walking ? Math.sin(ph) * 26 : 0, lift = p.walking ? 12 : 0;
      const fL = { x: -kx - 6 + wl, y: -6 - Math.max(0, Math.sin(ph)) * lift }, fR = { x: kx + 6 - wl, y: -6 - Math.max(0, -Math.sin(ph)) * lift };
      legL.setAttribute('d', `M -28 ${hip + 44} L ${f1(fL.x)} ${f1(fL.y - 6)}`);
      legR.setAttribute('d', `M 28 ${hip + 44} L ${f1(fR.x)} ${f1(fR.y - 6)}`);
      footL.setAttribute('transform', `translate(${f1(fL.x - 8)} ${f1(fL.y)})`);
      footR.setAttribute('transform', `translate(${f1(fR.x + 8)} ${f1(fR.y)})`);
      // respiração
      body.setAttribute('transform', `translate(0 ${f1(Math.sin(t * 2.2 + seed) * 2)})`);
      // falando?
      const op = sp.voz ? boca(sp.voz, t) : 0, talk = op > 0 ? 1 : 0;
      const rot = (m.rot || 0) + talk * 1.8 * Math.sin(t * 6.5 + seed) + (m.ri ? Math.sin(t * 18) * 2 : 0);
      const hdy = talk * 1.6 * Math.sin(t * 11) + (m.ri ? Math.abs(Math.sin(t * 18)) * 4 : 0);
      head.setAttribute('transform', `translate(0 ${f1(hdy)}) rotate(${rot.toFixed(2)} 0 ${sy})`);
      hairBack.setAttribute('transform', head.getAttribute('transform'));
      // olhos
      const li = step(looks, t), lk = looks[li], lk0 = looks[Math.max(0, li - 1)], lu = li === 0 ? 1 : ease(clamp((t - lk[0]) / 0.2));
      const ldx = lerp(lk0[1], lk[1], lu) * flip, ldy = lerp(lk0[2], lk[2], lu);
      let blink = 0;
      for (let k = 0; k < 40; k++) { const tb = 1.1 + seed * 0.37 + k * 3.2 + 0.8 * Math.sin(k * 1.7 + seed); const d = Math.abs(t - tb); if (d < 0.09) blink = Math.max(blink, 1 - d / 0.09); }
      const lid = Math.max(m.lid, blink);
      eyes.forEach((e, i) => {
        const px = clamp(m.px + ldx, -18, 18), py = clamp(m.py + ldy, -18, 18);
        e.pupil.setAttribute('cx', f1(e.ex + px)); e.pupil.setAttribute('cy', f1(e.ey + py));
        e.pupil.setAttribute('r', m.o ? 6.5 : 8.5);
        const h = lid * 64, yl = e.ey - 31 + h;
        e.lid.setAttribute('height', f1(h));
        e.lidLine.setAttribute('d', lid > 0.05 ? `M ${e.ex - 34} ${f1(yl)} L ${e.ex + 34} ${f1(yl)}` : '');
        const sd = i === 0 ? -1 : 1, bi = m.bi + (i === 1 ? (m.asym || 0) * 16 : 0);
        const ox = e.ex + sd * 30, ix = e.ex - sd * 24, oy = e.ey - 46 + m.bo, iy = e.ey - 48 + bi;
        e.brow.setAttribute('d', `M ${ox} ${f1(oy)} Q ${e.ex} ${f1(Math.min(oy, iy) - 8)} ${ix} ${f1(iy)}`);
      });
      // boca
      const my = hy + 64, sm = m.smile;
      let open = op;
      if (m.ri) open = Math.max(open, 0.55 + 0.25 * Math.abs(Math.sin(t * 18)));
      if (m.o) open = Math.max(open, 0.45);
      if (open < 0.06) {
        mouth.setAttribute('fill', 'none');
        mouth.setAttribute('d', `M -24 ${my} Q 2 ${f1(my + sm * 1.6)} 26 ${my}`);
      } else {
        const rx = (m.o && !op ? 14 : 24) - 3 * open, top = my - 4 - 5 * open + Math.max(0, sm) * 0.2, bot = my + 6 + 26 * open + Math.max(0, sm) * 0.8;
        mouth.setAttribute('fill', '#7a1f2b');
        mouth.setAttribute('d', `M ${f1(-rx)} ${my} Q 2 ${f1(2 * top - my)} ${f1(rx)} ${my} Q 2 ${f1(2 * bot - my)} ${f1(-rx)} ${my} Z`);
      }
      // braços
      for (const a of arms) {
        const st = armAt(a, t), sx = a.sd * 66, syy = sy + 24;
        let hx = sx + a.sd * st.hd[0], hyy = syy + st.hd[1];
        const ex = sx + a.sd * st.el[0], ey = syy + st.el[1];
        if (st.wave) hx += Math.sin(t * 12) * 22 * st.wave;
        const d = `M ${sx} ${syy} L ${f1(ex)} ${f1(ey)} L ${f1(hx)} ${f1(hyy)}`;
        a.out.setAttribute('d', d); a.inn.setAttribute('d', d);
        if (a.sleeve) { const sd2 = `M ${sx - a.sd * 4} ${syy - 6} L ${f1(lerp(sx, ex, 0.42))} ${f1(lerp(syy, ey, 0.42))}`; a.sleeve.forEach(el => el.setAttribute('d', sd2)); }
        a.handG.setAttribute('transform', `translate(${f1(hx)} ${f1(hyy)})`);
        a.finger.setAttribute('opacity', st.point.toFixed(2));
      }
    });
    return rig;
  }

  // ---------------- HUD: caixa de título, legenda e @ ----------------
  const titulo = projeto.titulo_caixa || projeto.titulo || '';
  if (titulo) {
    const lines = Array.isArray(titulo) ? titulo : String(titulo).split('\n');
    const size = projeto.titulo_tamanho || 56, lh = size * 1.18;
    const h = lines.length * lh + 50, y0 = 130;
    R(hud, 150, y0, 780, h, '#fcf6d4', { w: 7, stroke: '#b3141b' });
    lines.forEach((l, i) => T(hud, l.toUpperCase(), 540, y0 + 30 + size * 0.85 + i * lh, size, '#b3141b'));
  }
  const capEl = T(hud, '', 540, projeto.legenda_y || 470, projeto.legenda_tamanho || 46, OUT, { ls: 1, stroke: '#ffffff', sw: 9 });
  const legendas = [];
  // CT.legenda([[t, 'TEXTO'], ...]) — cada texto fica até o próximo; '' apaga.
  function legenda(lista) { legendas.push(...lista); legendas.sort((a, b) => a[0] - b[0]); }
  effect((t) => {
    let txt = '';
    for (const [a, s] of legendas) { if (a <= t) txt = s; else break; }
    capEl.textContent = txt.toUpperCase();
  });
  const marca = projeto.marca || {};
  if (marca.handle && projeto.marcaDagua !== false) {
    T(hud, '@' + String(marca.handle).replace(/^@/, '').toUpperCase(), projeto.marca_x || 80, projeto.marca_y || 1560, 30, '#8a8a8a', { anchor: 'start', ls: 1 });
  }

  // ---------------- cenas do projeto ----------------
  const CT = {
    W, H, OUT, FONT, projeto, timeline, clamp, ease, lerp, mk, effect, visible, pop,
    P, E, R, T, shot, pessoa, fala, legenda, MOODS, POSES, CENARIOS,
    obj: { cadeira, vaso, coco, balao, falaBalao, sofa, tv, porta, janela, quadro, planta, arbusto, casa, chao },
  };
  if (typeof window.CENAS !== 'function') throw new Error('cenas.js precisa definir window.CENAS = function (CT) {...}');
  window.CENAS(CT);

  window.seekToTime = function (t) { for (const fx of effects) fx(t); };
  window.TOTAL = timeline.total;
  window.seekToTime(0);
  window.__ready = true;

  if (location.search.includes('play')) {
    const audio = new Audio('narration.mp3');
    document.body.addEventListener('click', () => {
      audio.currentTime = 0; audio.play();
      const loop = () => { window.seekToTime(audio.currentTime); if (!audio.ended) requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }, { once: true });
  }
})().catch((e) => { window.__error = String(e && e.stack || e); console.error(e); });
