// Meme "tive o menino" no estilo Caderno Amarelo (formato B, desenho animado).
// Áudio de WhatsApp de 25 s: o tio avisa a família que não vai participar de nada porque teve um
// entupimento, pelejou desde de manhã e "teve o menino" quase meio-dia. Pense num parto. CREEEEDO!
// A boca segue a energia do áudio (ENV: 20 valores por segundo, 0–9). O tio aparece sentado no trono.
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const r1 = n => Math.round(n * 10) / 10;
  const SKIN = '#c68a5f', HAIR = '#1f1a17', MOUTH = '#6b1f2b', GOLD = '#facc15', POO = '#8b5a2b', BABY = '#93c5fd';
  const ellipse = (cx, cy, rx, ry) => WB.arcPath(cx, cy, rx, ry, 0, Math.PI * 2, 48) + ' Z';
  const backOut = u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };

  const ENV = '000267861798883612677888867898987878408820983032630088655477667787457100003896898400887863587700100000000000000000000044999998688588999889983496106977875548994886477678766588742772000000005974259534887778601376555777334300000010000000000000000044899679983104599789889999888873499870499768999975335778764475782087058720069987888887456520089875463002499898643377777997469993005871248747875532442000000000000007988999999999998876654211000002311000000000000000000000000000000000000000000000000000000000000000000000000000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  const END = 25.8;

  // ---------------- montagem de itens (traços + preenchimentos) ----------------
  const T = (text, x, y, size, c, anchor) => ({ text, x, y, size, c, anchor });
  function build(specs, parent) {
    const g = WB.mk('g', {}, parent);
    const strokes = [], fills = [];
    for (const s of [specs].flat(6)) {
      if (!s) continue;
      if (s.text !== undefined) {
        strokes.push(...WB.textStrokes(s.text, s.x, s.y, s.size, s.c || INK.black, g, s.anchor || 'middle').strokes);
        continue;
      }
      const fillEl = s.fill ? WB.mk('path', { d: s.d, fill: s.fill, 'fill-opacity': 0, stroke: 'none' }, g) : null;
      const st = s.c === 'none' ? [] : WB.strokePath(s.d, s.c || INK.black, s.w || 7, g, s.op ? { opacity: s.op } : {});
      if (fillEl) fills.push({ el: fillEl, st });
      strokes.push(...st);
    }
    return { g, strokes, fills };
  }
  function animate(g, t0, o = {}) {
    const bb = g.getBBox();
    const ox = o.ox ?? bb.x + bb.width / 2, oy = o.oy ?? bb.y + bb.height / 2;
    const kind = o.anim || 'pop', loop = o.loop, ph = o.ph || 0;
    WB.effect((t) => {
      const tt = t - t0;
      if (tt < 0) { g.setAttribute('opacity', 0); return; }
      let k = 1, rot = 0, dx = 0, dy = 0, sy = 1, op = 1;
      if (kind === 'slam') { k = 1 + 0.9 * Math.pow(1 - clamp(tt / 0.2), 2); op = clamp(tt / 0.08); }
      else if (kind === 'fly') { const v = ease(clamp(tt / 0.5)); dx = (o.fx || 0) * (1 - v); dy = (o.fy || 0) * (1 - v); rot = (o.fr || 0) * (1 - v); }
      else { k = backOut(clamp(tt / 0.38)); op = clamp(tt / 0.12); }
      const ts = tt + ph;
      if (loop === 'shake') rot += Math.sin(ts * 40) * 5 * Math.exp(-tt * 2);
      if (loop === 'tremble') { dx += Math.sin(ts * 47) * 4; rot += Math.sin(ts * 31) * 2; }
      if (loop === 'wiggle') rot += Math.sin(ts * 5) * 3;
      if (loop === 'bounce') dy -= Math.abs(Math.sin(ts * 5)) * 16;
      if (loop === 'hop') dy -= Math.abs(Math.sin(ts * 8)) * 26;
      if (loop === 'float') dy += Math.sin(ts * 2.4) * 9;
      if (loop === 'rock') rot += Math.sin(ts * 2.2) * 6;
      if (loop === 'pulse') k *= 1 + 0.07 * Math.sin(ts * 9);
      if (loop === 'spin') rot += ts * 40;
      if (loop === 'fall') dy += ((ts * 260) % 900) - 200;
      g.setAttribute('opacity', op.toFixed(3));
      g.setAttribute('transform', `translate(${(ox + dx).toFixed(1)} ${(oy + dy).toFixed(1)}) rotate(${rot.toFixed(2)}) ` +
        `scale(${k.toFixed(3)} ${(k * sy).toFixed(3)}) translate(${-ox} ${-oy})`);
    });
  }
  let cont = null;   // grupo da "folha" atual
  function pg(t0, t1) {
    const g = WB.mk('g', {}, WB.layer);
    WB.effect(t => g.setAttribute('opacity', t < t0 ? 0 : t > t1 ? clamp(1 - (t - t1) / 0.15).toFixed(3) : 1));
    cont = g;
  }
  function P(bt, specs, o = {}) {
    let parent = o.parent || cont;
    if (o.rot) parent = WB.mk('g', { transform: `rotate(${o.rot} ${o.rx ?? 540} ${o.ry ?? 700})` }, parent);
    if (o.at) parent = WB.mk('g', { transform: `translate(${o.at[0]} ${o.at[1]}) scale(${o.at[2] || 1})` }, parent);
    const it = build(specs, parent);
    WB.showNow(it.strokes);
    it.fills.forEach(f => f.el.setAttribute('fill-opacity', 1));
    animate(it.g, bt, o);
    return it;
  }
  const TX = (bt, text, x, y, size, c, rot = 0, o = {}) => P(bt, T(text, x, y, size, c), Object.assign({ rot, rx: x, ry: y - size * 0.3 }, o));

  // ---------------- desenhos ----------------
  const box = (x, y, w, h, r, fill, c, wd) => ({ d: WB.roundRectPath(x, y, w, h, r), fill, c, w: wd || 6 });
  const circ = (x, y, r, fill, c, wd) => ({ d: WB.circlePath(x, y, r), fill, c, w: wd || 6 });
  const S = (x, y, s) => (dx, dy) => `${r1(x + dx * s)} ${r1(y + dy * s)}`;
  function stamp(bt, text, cx, cy, size, color, rot, o = {}) {
    const w = WB.measure(text, size) + 70, h = size * 1.45;
    return P(bt, [{ d: WB.roughRect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), fill: o.bg || '#fffdf5', c: color, w: 10 },
      T(text, cx, cy + size * 0.33, size, color)], Object.assign({ rot, rx: cx, ry: cy, anim: 'slam' }, o));
  }
  function confetti(x0, y0, x1, y1, n = 34, seed = 1, cols = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']) {
    const out = [];
    let r = seed * 9301 + 49297;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++) {
      const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0), c = cols[i % cols.length], a = rnd() * 180;
      if (i % 3 === 0) out.push(circ(r1(x), r1(y), 9, c, 'none'));
      else if (i % 3 === 1) out.push({ d: `M ${r1(x)} ${r1(y)} l ${r1(Math.cos(a) * 16)} ${r1(Math.sin(a) * 16)}`, c, w: 9 });
      else out.push({ d: `M ${r1(x)} ${r1(y)} q 10 -14 20 0 q 10 14 20 0`, c, w: 6 });
    }
    return out;
  }
  function sun(x, y, r) {
    let rays = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      rays += `M ${r1(x + Math.cos(a) * r * 1.25)} ${r1(y + Math.sin(a) * r * 1.25)} L ${r1(x + Math.cos(a) * r * 1.65)} ${r1(y + Math.sin(a) * r * 1.65)} `;
    }
    return [{ d: rays, c: '#f97316', w: 10 }, circ(x, y, r, '#fdba74', null, 7),
      { d: `M ${x - r * 0.45} ${y - r * 0.1} q ${r * 0.12} ${-r * 0.2} ${r * 0.24} 0 M ${x + r * 0.21} ${y - r * 0.1} q ${r * 0.12} ${-r * 0.2} ${r * 0.24} 0`, w: 6 },
      { d: `M ${x - r * 0.4} ${y + r * 0.22} Q ${x} ${y + r * 0.7} ${x + r * 0.4} ${y + r * 0.22} Z`, fill: '#ffffff', w: 5 }];
  }
  function familyCard(bt) {
    const x0 = 120, x1 = 960, y0 = 470, y1 = 960;
    P(bt, [box(x0, y0, x1 - x0, y1 - y0, 30, '#ece5dd', null, 8), box(x0, y0, x1 - x0, 130, 30, '#128c7e', null, 8),
      circ(x0 + 70, y0 + 65, 40, '#ffffff', null, 5), T('F', x0 + 70, y0 + 84, 54, '#128c7e'),
      T('Família abençoada', x0 + 130, y0 + 82, 60, '#ffffff', 'start')]);
    P(bt + 0.3, [box(x0 + 40, y0 + 165, 560, 100, 24, '#ffffff', null, 5), T('Bora pro churrasco?', x0 + 66, y0 + 232, 52, INK.black, 'start')], { anim: 'fly', fx: -300 });
    P(bt + 0.6, [box(x0 + 240, y0 + 290, 560, 100, 24, '#dcf8c6', null, 5), T('Quem vem hoje??', x0 + 270, y0 + 357, 52, INK.black, 'start')], { anim: 'fly', fx: 300 });
  }
  function banSign(x, y, r) {
    return [circ(x, y, r, null, '#dc2626', 22), { d: `M ${r1(x - r * 0.7)} ${r1(y - r * 0.7)} L ${r1(x + r * 0.7)} ${r1(y + r * 0.7)}`, c: '#dc2626', w: 22 }];
  }
  function plunger(x, y, s = 1) {
    const p = S(x, y, s);
    return [box(x - 16 * s, y - 330 * s, 32 * s, 300 * s, 10, '#b45309', null, 6),
      { d: `M ${p(-120, 60)} Q ${p(-120, -40)} ${p(0, -40)} Q ${p(120, -40)} ${p(120, 60)} Z`, fill: '#dc2626', w: 7 },
      { d: `M ${p(-120, 60)} L ${p(120, 60)}`, c: '#7f1d1d', w: 10 }];
  }
  function pipe(x0, x1, y) {
    return [box(x0, y - 60, x1 - x0, 120, 10, '#d1d5db', null, 7),
      box(x0 - 20, y - 76, 40, 152, 6, '#9ca3af', null, 6), box(x1 - 20, y - 76, 40, 152, 6, '#9ca3af', null, 6),
      { d: `M ${(x0 + x1) / 2 - 70} ${y + 48} Q ${(x0 + x1) / 2 - 80} ${y - 40} ${(x0 + x1) / 2} ${y - 50} Q ${(x0 + x1) / 2 + 80} ${y - 40} ${(x0 + x1) / 2 + 70} ${y + 48} Z`, fill: POO, w: 6 }];
  }
  function cone(x, y) {
    return [{ d: `M ${x - 70} ${y} L ${x - 20} ${y - 170} L ${x + 20} ${y - 170} L ${x + 70} ${y} Z`, fill: '#f97316', w: 6 },
      { d: `M ${x - 50} ${y - 60} L ${x + 50} ${y - 60} M ${x - 36} ${y - 110} L ${x + 36} ${y - 110}`, c: '#ffffff', w: 14 },
      box(x - 95, y - 6, 190, 30, 6, '#f97316', null, 6)];
  }
  function clock(x, y, r, h, m, label) {
    const ah = ((h % 12) + m / 60) / 12 * Math.PI * 2 - Math.PI / 2, am = m / 60 * Math.PI * 2 - Math.PI / 2;
    let ticks = '';
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ticks += `M ${r1(x + Math.cos(a) * r * 0.8)} ${r1(y + Math.sin(a) * r * 0.8)} L ${r1(x + Math.cos(a) * r * 0.92)} ${r1(y + Math.sin(a) * r * 0.92)} `; }
    const out = [circ(x, y, r, '#ffffff', null, 9), { d: ticks, w: 5 },
      { d: `M ${x} ${y} L ${r1(x + Math.cos(ah) * r * 0.5)} ${r1(y + Math.sin(ah) * r * 0.5)}`, w: 12 },
      { d: `M ${x} ${y} L ${r1(x + Math.cos(am) * r * 0.75)} ${r1(y + Math.sin(am) * r * 0.75)}`, c: INK.red, w: 8 }, circ(x, y, 10, '#111', null, 3)];
    if (label) out.push(T(label, x, y + r + 80, 64, INK.blue));
    return out;
  }
  function strainLines(x, y, r) {
    let d = '';
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2; d += `M ${r1(x + Math.cos(a) * r)} ${r1(y + Math.sin(a) * r)} L ${r1(x + Math.cos(a) * (r + 60))} ${r1(y + Math.sin(a) * (r + 60))} `; }
    return { d, c: INK.red, w: 9 };
  }
  function donut(x, y, s = 1) {
    return [{ d: ellipse(x, y, 230 * s, 120 * s), fill: '#f9a8d4', w: 8 }, { d: ellipse(x, y - 8 * s, 90 * s, 40 * s), fill: '#fffdf5', w: 6 },
      { d: `M ${x - 180 * s} ${y - 30 * s} q 30 -40 80 -50 M ${x + 120 * s} ${y + 70 * s} q 40 -14 60 -50`, c: '#ffffff', w: 8 }];
  }
  function screw(x, y, s = 1) {
    return [circ(x, y, 26 * s, '#9ca3af', null, 5), { d: `M ${x - 14 * s} ${y} L ${x + 14 * s} ${y} M ${x} ${y - 14 * s} L ${x} ${y + 14 * s}`, w: 5 },
      { d: `M ${x - 10 * s} ${y + 24 * s} L ${x - 8 * s} ${y + 90 * s} L ${x + 8 * s} ${y + 90 * s} L ${x + 10 * s} ${y + 24 * s}`, fill: '#d1d5db', w: 5 }];
  }
  const spring = (x, y) => ({ d: `M ${x} ${y} l 30 -16 l -60 -16 l 60 -16 l -60 -16 l 60 -16 l -60 -16 l 30 -16`, c: '#6b7280', w: 7 });
  // o "menino": um cocozinho de touca azul, chupeta e mantinha
  function pooBaby(x, y, s = 1) {
    const p = S(x, y, s);
    return [
      { d: `M ${p(-230, 120)} Q ${p(-250, 290)} ${p(0, 300)} Q ${p(250, 290)} ${p(230, 120)} Q ${p(0, 170)} ${p(-230, 120)} Z`, fill: BABY, w: 8 },
      { d: ellipse(x, y + 110 * s, 200 * s, 72 * s), fill: POO, w: 7 },
      { d: ellipse(x, y + 30 * s, 150 * s, 62 * s), fill: POO, w: 7 },
      { d: ellipse(x, y - 40 * s, 100 * s, 50 * s), fill: POO, w: 7 },
      { d: `M ${p(-30, -84)} Q ${p(0, -150)} ${p(40, -130)} Q ${p(20, -100)} ${p(30, -80)} Z`, fill: POO, w: 6 },
      // touca azul
      { d: `M ${p(-110, -40)} Q ${p(-110, -170)} ${p(0, -175)} Q ${p(110, -170)} ${p(110, -40)} Z`, fill: '#60a5fa', w: 7 },
      circ(x, y - 182 * s, 30 * s, '#ffffff', null, 5),
      // olhos e chupeta
      circ(x - 55 * s, y + 20 * s, 30 * s, '#ffffff', null, 5), circ(x + 55 * s, y + 20 * s, 30 * s, '#ffffff', null, 5),
      circ(x - 50 * s, y + 26 * s, 13 * s, '#111', null, 3), circ(x + 50 * s, y + 26 * s, 13 * s, '#111', null, 3),
      { d: ellipse(x, y + 95 * s, 46 * s, 28 * s), fill: '#f472b6', w: 5 }, circ(x, y + 95 * s, 16 * s, '#fbcfe8', null, 4),
      circ(x - 105 * s, y + 70 * s, 18 * s, '#fca5a5', 'none'), circ(x + 105 * s, y + 70 * s, 18 * s, '#fca5a5', 'none'),
    ];
  }
  function balloon(x, y, c) {
    return [{ d: `M ${x} ${y + 95} q -20 60 10 120 q 20 50 -10 110`, c: '#6b7280', w: 4 },
      { d: ellipse(x, y, 72, 92), fill: c, w: 6 }, { d: `M ${x - 14} ${y + 92} L ${x} ${y + 110} L ${x + 14} ${y + 92} Z`, fill: c, w: 4 },
      { d: `M ${x - 34} ${y - 40} q 10 -26 30 -30`, c: '#ffffff', w: 8 }];
  }
  function legs(x, y) {
    const leg = (dx) => [{ d: `M ${x + dx} ${y} L ${x + dx} ${y + 250}`, c: INK.black, w: 66 }, { d: `M ${x + dx} ${y} L ${x + dx} ${y + 250}`, c: SKIN, w: 52 },
      { d: `M ${x + dx - 34} ${y + 250} Q ${x + dx - 30} ${y + 300} ${x + dx + 60 * Math.sign(dx)} ${y + 300} Q ${x + dx + 90 * Math.sign(dx)} ${y + 280} ${x + dx + 30} ${y + 250} Z`, fill: '#ffffff', w: 6 }];
    return [box(x - 220, y - 70, 440, 90, 30, '#2563eb', null, 7), leg(-120), leg(120)];
  }
  const bolt = (x, y, s = 1) => ({ d: `M ${x} ${y} l ${-40 * s} ${80 * s} l ${40 * s} 0 l ${-30 * s} ${90 * s} l ${80 * s} ${-110 * s} l ${-44 * s} 0 l ${34 * s} ${-60 * s} Z`, fill: GOLD, w: 6 });
  function certificate(bt, x0, y0) {
    const w = 840, h = 660;
    P(bt, [box(x0, y0, w, h, 14, '#fefce8', null, 8), { d: WB.roundRectPath(x0 + 20, y0 + 20, w - 40, h - 40, 10), c: '#ca8a04', w: 4 },
      T('CERTIDÃO DE NASCIMENTO', x0 + w / 2, y0 + 110, 60, INK.black)], { rot: -3, rx: x0 + w / 2, ry: y0 + h / 2 });
    const rows = [['Nome:', 'O Menino'], ['Hora:', '11h58'], ['Local:', 'banheiro'], ['Parto:', 'normal (sofrido)']];
    rows.forEach(([a, b], i) => P(bt + 0.35 + i * 0.32, [T(a, x0 + 70, y0 + 230 + i * 100, 54, INK.gray, 'start'), T(b, x0 + 270, y0 + 230 + i * 100, 60, INK.blue, 'start')],
      { rot: -3, rx: x0 + w / 2, ry: y0 + h / 2 }));
  }
  const fly = (x, y) => [{ d: ellipse(x - 9, y - 12, 10, 7), fill: '#e0f2fe', w: 3 }, { d: ellipse(x + 9, y - 12, 10, 7), fill: '#e0f2fe', w: 3 }, circ(x, y, 9, '#111', null, 3)];
  const stink = (x, y) => ({ d: `M ${x} ${y} q 24 -30 0 -60 q -24 -30 0 -60 M ${x + 60} ${y + 10} q 24 -30 0 -60 q -24 -30 0 -60 M ${x - 60} ${y + 10} q 24 -30 0 -60 q -24 -30 0 -60`, c: '#65a30d', w: 8 });

  // ---------------- o tio (camada fixa) ----------------
  const ch = (() => {
    const root = WB.mk('g', { transform: 'translate(540 1300)' }, WB.overlay);
    const tankG = WB.mk('g', { opacity: 0 }, root);
    const bodyG = WB.mk('g', {}, root), headG = WB.mk('g', {}, root), armG = WB.mk('g', {}, root), hullG = WB.mk('g', { opacity: 0 }, root);
    // caixa de descarga atrás dele
    const tank = build([box(-300, 90, 600, 250, 26, '#f8fafc', null, 8), box(-320, 70, 640, 50, 18, '#e2e8f0', null, 7),
      circ(230, 160, 22, '#cbd5e1', null, 5)], tankG);
    const parts = [
      build([{ d: 'M -28 90 L -26 185 L 26 185 L 28 90 Z', fill: SKIN, w: 6 },
        // ombros de fora + regata branca
        { d: 'M -200 430 Q -195 215 -60 180 Q 0 200 60 180 Q 195 215 200 430 Z', fill: SKIN, w: 7 },
        { d: 'M -150 430 L -140 250 Q -120 200 -90 196 Q -60 280 0 286 Q 60 280 90 196 Q 120 200 140 250 L 150 430 Z', fill: '#ffffff', w: 6 },
        { d: 'M -60 330 q 10 -8 20 0 M 40 300 q 10 -8 20 0 M -10 360 q 8 -6 16 0', c: '#6b4226', w: 4 }], bodyG),
      build([{ d: ellipse(-98, 12, 15, 24), fill: SKIN, w: 5 }, { d: ellipse(98, 12, 15, 24), fill: SKIN, w: 5 },
        { d: ellipse(0, 0, 100, 118), fill: SKIN, w: 7 },
        { d: 'M -6 22 Q -22 50 0 56 Q 14 58 18 48', w: 5, c: '#6b4226' },
        // cabelo preto curto com topete
        { d: 'M -100 -10 Q -112 -100 -40 -122 Q 30 -140 90 -96 Q 116 -60 100 -10 Q 86 -60 50 -70 Q 0 -60 -40 -78 Q -80 -60 -100 -10 Z', fill: HAIR, w: 5 },
        // barba por fazer
        { d: 'M -70 70 l 0 2 M -54 96 l 0 2 M -30 110 l 0 2 M 0 116 l 0 2 M 30 110 l 0 2 M 54 96 l 0 2 M 70 70 l 0 2 M -40 90 l 0 2 M 40 90 l 0 2', c: '#3f2a1c', w: 6 }], headG),
    ];
    for (const p of [tank, ...parts]) { WB.showNow(p.strokes); p.fills.forEach(f => f.el.setAttribute('fill-opacity', 1)); }
    const dyn = WB.mk('g', {}, headG);
    const red = WB.mk('path', { d: ellipse(0, 10, 92, 108), fill: '#ef4444', opacity: 0 }, dyn);
    const eyeG = WB.mk('g', {}, dyn);
    const eyes = [-38, 38].map((ex, i) => {
      WB.mk('path', { d: ellipse(ex, 8, 19, 14), fill: '#ffffff', stroke: INK.black, 'stroke-width': 4 }, eyeG);
      const cp = WB.mk('clipPath', { id: `eyeT${i}` }, eyeG);
      WB.mk('path', { d: ellipse(ex, 8, 18, 13) }, cp);
      const clip = `url(#eyeT${i})`;
      return {
        ex,
        pupil: WB.mk('circle', { cx: ex, cy: 8, r: 8, fill: '#1f1410', 'clip-path': clip }, eyeG),
        lid: WB.mk('rect', { x: ex - 24, y: -10, width: 48, height: 0, fill: SKIN, 'clip-path': clip }, eyeG),
        lidLine: WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': 4, 'stroke-linecap': 'round', 'clip-path': clip }, eyeG),
        brow: WB.mk('path', { d: '', fill: 'none', stroke: HAIR, 'stroke-width': 13, 'stroke-linecap': 'round' }, dyn),
      };
    });
    const mouth = WB.mk('path', { d: '', fill: MOUTH, stroke: INK.black, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, dyn);
    // bigodão preto
    WB.mk('path', { d: 'M -60 72 Q -54 48 -24 50 Q -8 50 0 58 Q 8 50 24 50 Q 54 48 60 72 Q 34 62 0 68 Q -34 62 -60 72 Z', fill: HAIR, stroke: INK.black, 'stroke-width': 4 }, dyn);
    const sweat = WB.mk('path', { d: 'M 86 -60 q -14 24 0 36 q 14 -12 0 -36 Z', fill: '#93c5fd', stroke: INK.black, 'stroke-width': 4, opacity: 0 }, dyn);
    const sweat2 = WB.mk('path', { d: 'M -90 -40 q -12 20 0 30 q 12 -10 0 -30 Z', fill: '#93c5fd', stroke: INK.black, 'stroke-width': 4, opacity: 0 }, dyn);
    const tear = WB.mk('path', { d: 'M -60 30 q -12 22 0 32 q 12 -10 0 -32 Z', fill: '#60a5fa', stroke: '#1d4ed8', 'stroke-width': 3, opacity: 0 }, dyn);
    const armOut = WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': 56, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, armG);
    const armIn = WB.mk('path', { d: '', fill: 'none', stroke: SKIN, 'stroke-width': 44, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, armG);
    const handG = WB.mk('g', {}, armG);
    const finger = WB.mk('path', { d: 'M 20 -16 Q 80 -30 108 -24 Q 118 -12 106 -4 Q 70 -2 28 8 Z', fill: SKIN, stroke: INK.black, 'stroke-width': 5, opacity: 0 }, handG);
    WB.mk('path', { d: 'M -36 30 Q -46 -16 -26 -46 Q 0 -62 26 -46 Q 46 -16 36 30 Q 0 48 -36 30 Z', fill: SKIN, stroke: INK.black, 'stroke-width': 5 }, handG);
    WB.mk('path', { d: 'M -14 -42 L -12 -12 M 4 -46 L 4 -14 M 20 -40 L 18 -12', stroke: '#6b4226', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, handG);
    // vaso sanitário na frente (ele está sentado no trono)
    const hull = build([
      { d: 'M -110 580 L -90 700 L 90 700 L 110 580 Z', fill: '#f1f5f9', w: 8 },
      { d: 'M -270 420 Q -260 550 -130 590 L 130 590 Q 260 550 270 420 Z', fill: '#ffffff', w: 8 },
      { d: ellipse(0, 412, 290, 46), fill: '#f8fafc', w: 8 },
      { d: 'M -220 480 Q -200 530 -140 550', c: '#cbd5e1', w: 8 },
      // rolo de papel higiênico pendurado ao lado
      box(330, 250, 130, 30, 8, '#9ca3af', null, 5), circ(395, 330, 62, '#ffffff', null, 7), circ(395, 330, 20, '#e5e7eb', null, 5),
      { d: 'M 457 330 L 457 520 L 360 520 L 340 392', fill: '#ffffff', w: 6 },
    ], hullG);
    WB.showNow(hull.strokes); hull.fills.forEach(f => f.el.setAttribute('fill-opacity', 1));
    return { root, tankG, headG, armG, hullG, eyeG, eyes, mouth, sweat, sweat2, tear, red, armOut, armIn, handG, finger };
  })();

  const MOODS = {
    leve: { lid: 0.3, px: 3, py: 1, bi: 2, bo: 0, smile: -1, rot: 0 },
    sorriso: { lid: 0.3, px: 4, py: 0, bi: -4, bo: -2, smile: 11, rot: -5 },
    seria: { lid: 0.25, px: 0, py: 0, bi: 6, bo: -1, smile: -4, rot: 0 },
    arregalada: { lid: 0, px: 0, py: -1, bi: -13, bo: -10, smile: -1, rot: 3 },
    pensativa: { lid: 0.05, px: 8, py: -9, bi: -9, bo: -4, smile: -2, rot: 8 },
    estresse: { lid: 0.5, px: 0, py: 5, bi: -9, bo: 4, smile: -7, rot: -9, sweat: 1 },
    forca: { lid: 0.92, px: 0, py: 0, bi: 13, bo: -6, smile: -9, rot: 0, red: 1, sweat: 1, tr: 1 },
    brava: { lid: 0.28, px: 0, py: 0, bi: 12, bo: -4, smile: -9, rot: 0, red: 0.4 },
    triste: { lid: 0.35, px: 0, py: 5, bi: -12, bo: 7, smile: -10, rot: 6, tear: 1 },
    cansado: { lid: 0.6, px: 0, py: 6, bi: -10, bo: 8, smile: -6, rot: 10, sweat: 1 },
    cinico: { lid: 0.45, px: 6, py: 0, bi: -8, bo: 6, smile: 9, rot: -8, asym: 1 },
    pavor: { lid: 0, px: 0, py: -3, bi: -16, bo: -14, smile: -4, rot: 0, sweat: 1, tr: 1 },
  };
  // [início, humor, mão, aceno]
  const TL = [[0, 'sorriso', 'acena'], [1.6, 'triste'], [2.7, 'triste', null, 1], [3.85, 'arregalada', 'aponta'], [5.0, 'estresse', 'testa'],
    [6.2, 'pensativa'], [7.0, 'forca'], [8.2, 'estresse', 'testa'], [9.6, 'brava', 'aponta'], [11.3, 'cansado'],
    [12.4, 'arregalada'], [13.0, 'sorriso', 'joinha'], [14.0, 'cinico', 'aponta'], [15.25, 'estresse'], [16.3, 'pavor', 'testa'],
    [17.8, 'cansado', 'testa'], [19.0, 'triste'], [20.3, 'pavor'], [22.4, 'sorriso', 'acena']];
  const HAND = { none: { x: 165, y: 400, r: 0, ex: 165, ey: 330 }, queixo: { x: 42, y: 152, r: -12, ex: 178, ey: 345 }, testa: { x: 112, y: -58, r: -28, ex: 222, ey: 165 },
    aponta: { x: 262, y: 40, r: -8, ex: 225, ey: 255 }, acena: { x: 230, y: -60, r: -20, ex: 270, ey: 160 }, joinha: { x: 250, y: 40, r: -90, ex: 260, ey: 230 } };
  const keys = ['lid', 'px', 'py', 'bi', 'bo', 'smile', 'rot', 'asym', 'sweat', 'tear', 'red', 'tr'];
  const isPoint = h => h === 'aponta' || h === 'joinha';
  function stateAt(t) {
    let i = 0;
    while (i + 1 < TL.length && TL[i + 1][0] <= t) i++;
    const cur = TL[i], prev = TL[Math.max(0, i - 1)];
    const u = i === 0 ? 1 : ease(clamp((t - cur[0]) / 0.3));
    const m0 = MOODS[prev[1]], m1 = MOODS[cur[1]], s = {};
    for (const k of keys) s[k] = lerp(m0[k] || 0, m1[k] || 0, u);
    const h0 = HAND[prev[2] || 'none'], h1 = HAND[cur[2] || 'none'], hu = i === 0 ? 1 : ease(clamp((t - cur[0]) / 0.4));
    s.hand = { x: lerp(h0.x, h1.x, hu), y: lerp(h0.y, h1.y, hu), r: lerp(h0.r, h1.r, hu), ex: lerp(h0.ex, h1.ex, hu), ey: lerp(h0.ey, h1.ey, hu) };
    if (cur[2] === 'acena') s.hand.r += Math.sin(t * 9) * 22 * hu;
    s.point = (isPoint(prev[2]) ? 1 - hu : 0) + (isPoint(cur[2]) ? hu : 0);
    s.handOn = (prev[2] ? 1 - hu : 0) + (cur[2] ? hu : 0);
    if (i === 0) s.handOn = cur[2] ? 1 : 0;
    s.nod = cur[3] ? Math.abs(Math.sin((t - cur[0]) * 7)) * 10 * clamp((t - cur[0]) / 0.2) : 0;
    return s;
  }
  function blink(t) {
    let v = 0;
    for (let k = 0; k < 10; k++) {
      const tb = 1.4 + k * 2.7 + 0.6 * Math.sin(k * 1.7), d = Math.abs(t - tb);
      if (d < 0.09) v = Math.max(v, 1 - d / 0.09);
    }
    return v;
  }
  document.getElementById('hand').style.display = 'none';
  // [início, duração, força]
  const JOLTS = [[3.88, 0.5, 1], [9.65, 0.5, 1], [12.45, 0.4, 1], [16.3, 0.6, 1], [20.35, 1.2, 2.2]];
  const THRONE_T = 3.85;   // o vaso aparece no "entupimento"
  WB.effect((t) => {
    const s = stateAt(t);
    const op = clamp((envAt(t) - 0.12) * 1.25);
    const talk = op > 0.05 ? 1 : 0;
    const lid = Math.max(s.lid, blink(t));
    ch.eyes.forEach((e, i) => {
      const px = e.ex + s.px, py = 8 + s.py;
      e.pupil.setAttribute('cx', px.toFixed(1)); e.pupil.setAttribute('cy', py.toFixed(1));
      const h = lid * 30, yl = -8 + h;
      e.lid.setAttribute('height', h.toFixed(1));
      e.lidLine.setAttribute('d', lid > 0.06 ? `M ${e.ex - 22} ${yl.toFixed(1)} Q ${e.ex} ${(yl + 3).toFixed(1)} ${e.ex + 22} ${yl.toFixed(1)}` : '');
      const side = i === 0 ? -1 : 1, bi = s.bi + (i === 1 ? s.asym * 14 : 0);
      const ox = e.ex + side * 26, ix = e.ex - side * 24, oy = -36 + s.bo, iy = -38 + bi;
      e.brow.setAttribute('d', `M ${ox} ${oy.toFixed(1)} Q ${e.ex} ${(Math.min(oy, iy) - 7).toFixed(1)} ${ix} ${iy.toFixed(1)}`);
    });
    const sm = s.smile;
    if (op < 0.06) {
      ch.mouth.setAttribute('fill', 'none');
      ch.mouth.setAttribute('d', `M -28 82 Q 0 ${(82 + sm * 1.6).toFixed(1)} 28 82`);
    } else {
      const rx = 28 - 4 * op, top = 74 - 4 * op + Math.max(0, sm) * 0.3, bot = 82 + 34 * op + Math.max(0, sm) * 0.6;
      ch.mouth.setAttribute('fill', MOUTH);
      ch.mouth.setAttribute('d', `M ${(-rx).toFixed(1)} 80 Q 0 ${(2 * top - 80).toFixed(1)} ${rx.toFixed(1)} 80 Q 0 ${(2 * bot - 80).toFixed(1)} ${(-rx).toFixed(1)} 80 Z`);
    }
    ch.red.setAttribute('opacity', (s.red * (0.38 + 0.08 * Math.sin(t * 8))).toFixed(2));
    ch.sweat.setAttribute('opacity', s.sweat.toFixed(2));
    ch.sweat.setAttribute('transform', `translate(0 ${((t * 30) % 40).toFixed(1)})`);
    ch.sweat2.setAttribute('opacity', s.sweat.toFixed(2));
    ch.sweat2.setAttribute('transform', `translate(0 ${(((t + 0.7) * 30) % 40).toFixed(1)})`);
    ch.tear.setAttribute('opacity', (s.tear * (1 - ((t * 1.2) % 1))).toFixed(2));
    ch.tear.setAttribute('transform', `translate(0 ${(((t * 1.2) % 1) * 90).toFixed(1)})`);
    const rot = s.rot + talk * 1.8 * Math.sin(t * 6.5) + s.tr * Math.sin(t * 43) * 2.5;
    const dy = s.nod + talk * 2 * Math.sin(t * 11);
    ch.headG.setAttribute('transform', `translate(${(s.tr * Math.sin(t * 51) * 3).toFixed(1)} ${dy.toFixed(1)}) rotate(${rot.toFixed(2)} 0 100)`);
    let sx = 0, sy = 0;
    for (const [j0, jd, jf] of JOLTS) if (t > j0 && t < j0 + jd) { const f = (1 - (t - j0) / jd) * jf; sx += Math.sin(t * 70) * 10 * f; sy -= Math.abs(Math.sin(t * 20)) * 14 * f; }
    // trono: entra de baixo em THRONE_T
    const bu = clamp((t - THRONE_T) / 0.45), on = t >= THRONE_T;
    ch.hullG.setAttribute('opacity', on ? 1 : 0);
    ch.tankG.setAttribute('opacity', on ? clamp(bu * 3).toFixed(2) : 0);
    ch.hullG.setAttribute('transform', `translate(0 ${((1 - backOut(bu)) * 500).toFixed(1)})`);
    ch.root.setAttribute('transform', `translate(${(540 + sx).toFixed(1)} ${(1300 + sy).toFixed(1)})`);
    if (s.handOn < 0.02) { ch.armG.setAttribute('opacity', 0); }
    else {
      const h = s.hand;
      ch.armG.setAttribute('opacity', clamp(s.handOn * 2).toFixed(2));
      const d = `M 150 245 L ${h.ex.toFixed(1)} ${h.ey.toFixed(1)} L ${h.x.toFixed(1)} ${(h.y + 22).toFixed(1)}`;
      ch.armOut.setAttribute('d', d); ch.armIn.setAttribute('d', d);
      ch.handG.setAttribute('transform', `translate(${h.x.toFixed(1)} ${h.y.toFixed(1)}) rotate(${h.r.toFixed(1)})`);
      ch.finger.setAttribute('opacity', s.point.toFixed(2));
    }
  });

  // ================= CENAS =================
  // 1) "Boa tarde, família. Hoje eu não tô participando de nada," (0–3,75)
  pg(0, 3.75);
  P(0.05, sun(170, 340, 70), { loop: 'wiggle' });
  TX(0.3, 'BOA TARDE, FAMÍLIA!', 600, 360, 80, INK.orange, -3, { anim: 'slam' });
  familyCard(0.9);
  P(2.5, banSign(540, 715, 250), { anim: 'slam', loop: 'pulse' });
  stamp(3.0, 'HOJE NÃO!', 540, 1060, 92, INK.red, -5, { loop: 'shake' });

  // 2) "tive um entupimento." (3,75–6,1)
  pg(3.75, 6.1);
  P(3.9, T('tive um...', 300, 360, 74, INK.gray), { rot: -4 });
  stamp(4.5, 'ENTUPIMENTO!', 540, 500, 104, INK.red, 3, { loop: 'shake' });
  P(4.6, pipe(90, 990, 760), { anim: 'slam' });
  P(5.0, cone(220, 1080), { loop: 'wiggle' });
  P(5.1, cone(860, 1080), { loop: 'wiggle', ph: 0.4 });
  P(5.2, plunger(540, 1050, 0.8), { loop: 'hop' });

  // 3) "Desde de manhã que eu pelejava com as hemorroidas, tudo desmantelado." (6,1–12,2)
  pg(6.1, 12.2);
  P(6.25, clock(220, 470, 130, 6, 0, 'de manhã'), { loop: 'wiggle' });
  P(7.0, T('PELEJANDO...', 680, 420, 96, INK.purple), { anim: 'slam', loop: 'tremble' });
  P(7.2, strainLines(540, 1300, 170), { loop: 'pulse' });
  P(8.2, [donut(690, 700, 1.0), T('hemorroidas', 690, 880, 70, INK.red)], { anim: 'slam', loop: 'bounce' });
  TX(8.6, 'AI! AI!', 230, 820, 72, INK.red, -10, { anim: 'slam', loop: 'shake' });
  stamp(9.65, 'TUDO DESMANTELADO!', 540, 1060, 76, INK.red, -3, { loop: 'shake' });
  P(9.7, screw(130, 1010, 0.8), { anim: 'fly', fx: 300, fy: -200, fr: 300 });
  P(9.8, screw(960, 980, 0.8), { anim: 'fly', fx: -300, fy: -200, fr: -300 });
  P(9.9, spring(970, 640), { anim: 'fly', fx: -200, fy: 200, loop: 'wiggle' });

  // 4) "Tive, tive o menino agora quase meio-dia," (12,2–15,2)
  pg(12.2, 15.2);
  stamp(12.45, 'TIVE O MENINO!', 540, 360, 100, INK.blue, -3, { bg: '#eff6ff' });
  P(13.0, pooBaby(540, 700, 1.0), { anim: 'slam', loop: 'bounce' });
  P(13.2, balloon(150, 640, BABY), { loop: 'float' });
  P(13.3, balloon(930, 620, '#60a5fa'), { loop: 'float', ph: 0.5 });
  P(13.4, confetti(40, 440, 1040, 1080, 30, 3, ['#3b82f6', '#93c5fd', '#facc15', '#ffffff']), { loop: 'float' });
  P(13.95, clock(880, 1000, 90, 11, 58), { anim: 'slam', loop: 'wiggle' });
  P(14.2, T('quase meio-dia', 360, 1080, 66, INK.blue), { rot: -3 });

  // 5) "chega, tô com câimbra nas pernas," (15,2–17,7)
  pg(15.2, 17.7);
  P(15.4, T('chega...', 540, 360, 74, INK.gray));
  P(15.7, legs(540, 640), { loop: 'tremble' });
  P(16.3, [bolt(250, 640, 1.1), bolt(830, 640, 1.1), bolt(540, 900, 0.9)], { anim: 'slam', loop: 'shake' });
  stamp(16.35, 'CÂIMBRA!!', 540, 1070, 110, INK.red, 4, { loop: 'tremble' });

  // 6) "Pense num parto..." (17,7–20,3)
  pg(17.7, 20.3);
  stamp(17.85, 'PENSE NUM PARTO!', 540, 360, 90, INK.purple, -3, { bg: '#faf5ff' });
  certificate(18.4, 120, 500);

  // 7) "CREEEEDO!" (20,3–22,4)
  pg(20.3, 22.4);
  TX(20.35, 'CREEEEDO!!!', 540, 560, 150, INK.red, -4, { anim: 'slam', loop: 'tremble' });
  P(20.6, [stink(200, 980), stink(880, 980)], { loop: 'wiggle' });
  [[20.8, 160, 760], [20.95, 900, 760], [21.1, 540, 880], [21.25, 330, 1000], [21.4, 760, 1020]].forEach(([bt, x, y], i) =>
    P(bt, fly(x, y), { loop: 'float', ph: i * 0.6 }));
  TX(21.0, 'kkkkkk', 540, 380, 70, INK.gray, 3, { loop: 'wiggle' });

  // 8) Chamada para seguir (22,4–fim)
  pg(22.4, END + 1);
  {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 470, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 560, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@caderno_amarelo', 380, 560 + 190 * 0.62, 84, INK.black, g).strokes);
    animate(g, 22.55, { loop: 'float' });
  }
};
