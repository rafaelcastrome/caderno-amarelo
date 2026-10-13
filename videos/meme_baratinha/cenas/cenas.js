// Meme "A baratinha" (Eu sou o cordeirinho), vídeo original de @rafaellatuma (2022), redesenhado no Caderno Amarelo
// em formato de cenas: cortes com deslize, faixa amarela com o contexto e a letra "ouvida" em vermelho, palavra por palavra.
// Três personagens com rig recalculado a cada quadro: o menino que canta (cabelo black power, mãos juntas, boca pela voz),
// Jesus na nuvem (braços com IK, auréola, barba) e a baratinha de uma perna só (pula, braços acenando, antenas balançando).
// No fim, Jesus e a baratinha dançam de mãos dadas atravessando o palco. Áudio original + gargalhada aprovada.
// A marca d'água @caderno_amarelo passeia por 4 cantos seguros.
window.CENAS = function (WB) {
  const { INK, clamp, lerp } = WB;
  document.getElementById('hand').style.display = 'none';
  const r1 = n => Math.round(n * 10) / 10;
  const ellipse = (cx, cy, rx, ry) => WB.arcPath(cx, cy, rx, ry, 0, Math.PI * 2, 48) + ' Z';
  const DEG = Math.PI / 180;
  const BK = INK.black;

  // ---------------- easing e trilhas ----------------
  const eio = WB.ease;
  const eo = u => 1 - Math.pow(1 - u, 3);
  const backOut = u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
  const spring = u => 1 - Math.exp(-5.5 * u) * Math.cos(13 * u);
  const EZ = { io: eio, o: eo, b: backOut, s: spring, l: u => u };
  const mix = (a, b, u) => Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], u)) : lerp(a, b, u);
  // K([[t, v], [t, v, 'o'], ...]) -> f(t). O easing de cada key vale para o trecho que CHEGA nela.
  function K(keys) {
    return t => {
      if (t <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) {
        if (t < keys[i][0]) {
          const [t0, v0] = keys[i - 1], [t1, v1, m] = keys[i];
          return mix(v0, v1, (EZ[m || 'io'])((t - t0) / (t1 - t0)));
        }
      }
      return keys[keys.length - 1][1];
    };
  }
  const bump = (t, a, b) => (t <= a || t >= b) ? 0 : Math.sin(Math.PI * (t - a) / (b - a));

  // ---------------- áudio: energia da voz (20/s, 0–9) ----------------
  const ENV = '0000004888445798888760048986387875566677677776756877636775478876786058750005676400000000000066743698632222011587766787367665378886000000678888870299941000777743468767256666300000000036776777614899978777578716887767850650000788998860687747740588756752120666650000000675018887305817700787007778851655840588826772066505772067400000176007888501765840388002878870561760289852776056610775056600000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  const SONG_END = 19.38;
  const voice = (t, k = 1.2) => t > SONG_END ? 0 : clamp((envAt(t) - 0.25) * k / 0.75);

  // ---------------- montagem de itens estáticos ----------------
  const T = (text, x, y, size, c, anchor) => ({ text, x, y, size, c, anchor });
  function build(specs, parent) {
    const g = WB.mk('g', {}, parent);
    const strokes = [], fills = [];
    for (const s of [specs].flat(8)) {
      if (!s) continue;
      if (s.text !== undefined) {
        strokes.push(...WB.textStrokes(s.text, s.x, s.y, s.size, s.c || BK, g, s.anchor || 'middle').strokes);
        continue;
      }
      const fillEl = s.fill ? WB.mk('path', { d: s.d, fill: s.fill, 'fill-opacity': 0, stroke: 'none', ...(s.fo ? { opacity: s.fo } : {}) }, g) : null;
      const st = s.c === 'none' ? [] : WB.strokePath(s.d, s.c || BK, s.w || 6, g, s.op ? { opacity: s.op } : {});
      if (fillEl) fills.push({ el: fillEl, st });
      strokes.push(...st);
    }
    return { g, strokes, fills };
  }
  const showAll = (it) => { WB.showNow(it.strokes); it.fills.forEach(f => f.el.setAttribute('fill-opacity', 1)); return it; };
  let cont = null;
  const put = (specs, parent) => showAll(build(specs, parent || cont));
  function animate(g, t0, o = {}) {
    const bb = g.getBBox();
    const ox = o.ox ?? bb.x + bb.width / 2, oy = o.oy ?? bb.y + bb.height / 2;
    const kind = o.anim || 'pop', loop = o.loop, ph = o.ph || 0;
    WB.effect((t) => {
      const tt = t - t0;
      if (tt < 0) { g.setAttribute('opacity', 0); return; }
      let k = 1, rot = 0, dx = 0, dy = 0, op = 1;
      if (kind === 'slam') { k = 1 + 0.9 * Math.pow(1 - clamp(tt / 0.2), 2); op = clamp(tt / 0.08); }
      else if (kind === 'fly') { const v = eo(clamp(tt / 0.45)); dx = (o.fx || 0) * (1 - v); dy = (o.fy || 0) * (1 - v); rot = (o.fr || 0) * (1 - v); op = clamp(tt / 0.1); }
      else { k = backOut(clamp(tt / 0.38)); op = clamp(tt / 0.12); }
      if (o.until !== undefined && t > o.until) { const u = clamp((t - o.until) / 0.25); op *= 1 - u; k *= 1 - 0.4 * eio(u); }
      const ts = tt + ph;
      if (loop === 'shake') rot += Math.sin(ts * 40) * 5 * Math.exp(-tt * 2);
      if (loop === 'wiggle') rot += Math.sin(ts * 5) * 4;
      if (loop === 'float') dy += Math.sin(ts * 2.4) * 10;
      if (loop === 'rise') { dy -= tt * 90; op *= clamp(1.4 - tt * 0.8); rot += Math.sin(ts * 4) * 8; }
      if (loop === 'pulse') k *= 1 + 0.08 * Math.sin(ts * 9);
      if (loop === 'bob') dy -= Math.abs(Math.sin(ts * 6.3)) * 14;
      if (loop === 'spin') rot += ts * 60;
      g.setAttribute('opacity', op.toFixed(3));
      g.setAttribute('transform', `translate(${(ox + dx).toFixed(1)} ${(oy + dy).toFixed(1)}) rotate(${rot.toFixed(2)}) ` +
        `scale(${k.toFixed(3)}) translate(${-ox} ${-oy})`);
    });
  }
  function P(bt, specs, o = {}) {
    let parent = o.parent || cont;
    if (o.rot) parent = WB.mk('g', { transform: `rotate(${o.rot} ${o.rx ?? 540} ${o.ry ?? 960})` }, parent);
    const it = showAll(build(specs, parent));
    animate(it.g, bt, o);
    return it;
  }
  const TX = (bt, text, x, y, size, c, rot = 0, o = {}) => P(bt, T(text, x, y, size, c), Object.assign({ rot, rx: x, ry: y - size * 0.3 }, o));

  // ---------------- cenas: corte com deslize suave ----------------
  function shot(wins) {
    const g = WB.mk('g', {}, WB.layer);
    const inner = WB.mk('g', {}, g);
    WB.effect(t => {
      const w = wins.find(([a, b]) => t >= a && t < b);
      if (!w) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      const u = eo(clamp((t - w[0]) / 0.28));
      inner.setAttribute('transform', `translate(${r1(120 * (1 - u))} 0)`);
      inner.setAttribute('opacity', clamp((t - w[0]) / 0.15).toFixed(3));
    });
    cont = inner;
    return inner;
  }
  const inWin = (wins, t) => wins.some(([a, b]) => t >= a && t < b);

  // ---------------- formas ----------------
  const circ = (x, y, r, fill, c, wd) => ({ d: WB.circlePath(x, y, r), fill, c, w: wd || 6 });
  const heart = (x, y, s, fill = '#ef4444') => ({ d: `M ${x} ${y + 30 * s} C ${x - 60 * s} ${y - 10 * s} ${x - 30 * s} ${y - 50 * s} ${x} ${y - 20 * s} C ${x + 30 * s} ${y - 50 * s} ${x + 60 * s} ${y - 10 * s} ${x} ${y + 30 * s} Z`, fill, w: 5 });
  function stamp(bt, text, cx, cy, size, color, rot, o = {}) {
    const w = WB.measure(text, size) + 70, h = size * 1.45;
    return P(bt, [{ d: WB.roughRect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), fill: o.bg || '#fffdf5', c: color, w: 10 },
      T(text, cx, cy + size * 0.33, size, color)], Object.assign({ rot, rx: cx, ry: cy, anim: 'slam' }, o));
  }
  function confetti(x0, y0, x1, y1, n = 34, seed = 1) {
    const cols = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'], out = [];
    let r = seed * 9301 + 49297;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++) {
      const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0), c = cols[i % cols.length], a = rnd() * 6.28;
      if (i % 3 === 0) out.push(circ(r1(x), r1(y), 9, c, 'none'));
      else if (i % 3 === 1) out.push({ d: `M ${r1(x)} ${r1(y)} l ${r1(Math.cos(a) * 18)} ${r1(Math.sin(a) * 18)}`, c, w: 9 });
      else out.push({ d: `M ${r1(x)} ${r1(y)} q 10 -14 20 0 q 10 14 20 0`, c, w: 6 });
    }
    return out;
  }
  const cloud = (cx, cy, rx, ry, fill = '#ffffff', c, n) => ({ d: WB.cloudPath(cx, cy, rx, ry, n), fill, c, w: 6 });
  const noteSym = (x, y, s = 1, c = '#7c3aed') => [{ d: `M ${x} ${y} L ${x} ${y - 60 * s} L ${x + 34 * s} ${y - 70 * s} L ${x + 34 * s} ${y - 12 * s}`, c, w: 6 },
    { d: ellipse(x - 10 * s, y, 14 * s, 10 * s), fill: c, c, w: 3 }, { d: ellipse(x + 24 * s, y - 12 * s, 14 * s, 10 * s), fill: c, c, w: 3 }];
  function star(x, y, r, fill = '#facc15') {
    let d = '';
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? ' L ' : 'M ') + r1(x + Math.cos(a) * rr) + ' ' + r1(y + Math.sin(a) * rr); }
    return { d: d + ' Z', fill, w: 5 };
  }

  // ---------------- peças dinâmicas ----------------
  const dyn = (parent, attrs) => WB.mk('path', Object.assign({ d: '', fill: 'none', stroke: BK, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, attrs), parent);
  // IK de dois ossos: devolve o cotovelo; escolhe a solução mais perto do "polo"
  function ik(sx, sy, tx, ty, a, b, pole) {
    let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 1;
    const maxd = a + b - 0.5;
    if (d > maxd) { tx = sx + dx / d * maxd; ty = sy + dy / d * maxd; d = maxd; }
    d = Math.max(d, Math.abs(a - b) + 1);
    const th = Math.atan2(dy, dx), al = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
    const e1 = [sx + a * Math.cos(th + al), sy + a * Math.sin(th + al)], e2 = [sx + a * Math.cos(th - al), sy + a * Math.sin(th - al)];
    const d1 = Math.hypot(e1[0] - pole[0], e1[1] - pole[1]), d2 = Math.hypot(e2[0] - pole[0], e2[1] - pole[1]);
    return { el: d1 < d2 ? e1 : e2, h: [tx, ty] };
  }
  const limb = (s, e, h) => `M ${r1(s[0])} ${r1(s[1])} Q ${r1(e[0])} ${r1(e[1])} ${r1(h[0])} ${r1(h[1])}`;
  // olho de desenho: fechado (arco "u" de quem canta de olhos fechados) ou aberto (branco + pupila)
  function makeEye(parent, cx, cy, r, skin) {
    const closed = dyn(parent, { 'stroke-width': 7 });
    const open = WB.mk('g', {}, parent);
    const white = WB.mk('circle', { cx, cy, r, fill: '#ffffff', stroke: BK, 'stroke-width': 5 }, open);
    const pupil = WB.mk('circle', { cx, cy, r: r * 0.36, fill: '#1c1917' }, open);
    const shine = WB.mk('circle', { cx, cy, r: r * 0.12, fill: '#ffffff' }, open);
    const brow = dyn(parent, { 'stroke-width': 7 });
    return (p) => {
      const o = p.open || 0, sc = 0.7 + 0.3 * o + (p.pop || 0) * 0.35;
      open.setAttribute('opacity', o > 0.5 ? 1 : 0);
      white.setAttribute('r', r1(r * sc));
      const pr = r * 0.36 * (p.pr || 1);
      const px = cx + (p.px || 0) * r * 0.45, py = cy + (p.py || 0) * r * 0.45;
      pupil.setAttribute('cx', r1(px)); pupil.setAttribute('cy', r1(py)); pupil.setAttribute('r', r1(pr));
      shine.setAttribute('cx', r1(px - pr * 0.35)); shine.setAttribute('cy', r1(py - pr * 0.35));
      closed.setAttribute('d', o > 0.5 ? '' : `M ${r1(cx - r * 0.85)} ${r1(cy - 2)} Q ${cx} ${r1(cy + r * 0.62)} ${r1(cx + r * 0.85)} ${r1(cy - 2)}`);
      const by = cy - r * (o > 0.5 ? sc + 0.45 : 0.75) - (p.brow || 0), side = p.side || 1;
      brow.setAttribute('d', `M ${r1(cx - r * 0.75)} ${r1(by + side * (p.tilt || 0))} Q ${cx} ${r1(by - r * 0.3)} ${r1(cx + r * 0.75)} ${r1(by - side * (p.tilt || 0))}`);
    };
  }
  // boca: fechada (sorriso) ou aberta pela energia da voz, com dentinhos e língua opcionais
  const MOUTH = '#6b1d2a';
  function makeMouth(parent, cx, cy, w, o = {}) {
    const m = dyn(parent, { 'stroke-width': 5 });
    const tongue = WB.mk('path', { d: '', fill: '#f472b6', stroke: BK, 'stroke-width': 4, opacity: 0 }, parent);
    const teeth = o.teeth ? WB.mk('path', { d: '', fill: '#ffffff', stroke: BK, 'stroke-width': 3 }, parent) : null;
    return function (op, smile, q = {}) {
      const ww = w * (q.wide || 1);
      let top = cy, bot = cy;
      if (op < 0.06) {
        m.setAttribute('fill', 'none');
        m.setAttribute('d', `M ${r1(cx - ww / 2)} ${cy} Q ${cx} ${r1(cy + smile * 1.6)} ${r1(cx + ww / 2)} ${cy}`);
        top = cy + smile * 0.8;
      } else {
        const hh = 6 + ww * 0.42 * op, rx = ww * (0.3 + 0.16 * op);
        top = cy - 6; bot = top + hh * 2;
        m.setAttribute('fill', MOUTH);
        m.setAttribute('d', ellipse(cx, top + hh, rx, hh));
      }
      if (teeth) {
        const tw = w * 0.17, th = w * 0.22, y = top - 1;
        teeth.setAttribute('d', `M ${r1(cx - tw - 1)} ${r1(y)} h ${r1(tw)} v ${r1(th)} h ${r1(-tw)} Z M ${r1(cx + 1)} ${r1(y)} h ${r1(tw)} v ${r1(th)} h ${r1(-tw)} Z`);
      }
      const tg = q.tongue || 0;
      tongue.setAttribute('opacity', tg > 0.02 ? 1 : 0);
      if (tg > 0.02) {
        const y0 = op < 0.06 ? cy : bot - 10;
        tongue.setAttribute('d', `M ${r1(cx - w * 0.2)} ${r1(y0 - 4)} L ${r1(cx - w * 0.2)} ${r1(y0 + 24 * tg)} Q ${cx} ${r1(y0 + 50 * tg)} ${r1(cx + w * 0.2)} ${r1(y0 + 24 * tg)} L ${r1(cx + w * 0.2)} ${r1(y0 - 4)} Z`);
      }
    };
  }

  // =====================================================================
  // PERSONAGENS
  // =====================================================================
  const SKIN = '#f5cfa8', HAIR = '#3b2416';

  // ---- MENINO (busto atrás do banco da igreja). Coordenadas absolutas; balança em volta de (540, 1330).
  function makeKid(parent) {
    const g = WB.mk('g', {}, parent);
    const shirt = '#7dd3fc';
    put([
      { d: 'M 470 1045 L 610 1045 Q 760 1075 790 1200 L 822 1420 L 258 1420 L 290 1200 Q 320 1075 470 1045 Z', fill: shirt, w: 7 },
      { d: 'M 490 1050 L 540 1120 L 590 1050', fill: '#ffffff', w: 6 },
      { d: 'M 335 1150 Q 345 1290 470 1286', c: BK, w: 82 }, { d: 'M 335 1150 Q 345 1290 470 1286', c: shirt, w: 66 },
      { d: 'M 745 1150 Q 735 1290 610 1286', c: BK, w: 82 }, { d: 'M 745 1150 Q 735 1290 610 1286', c: shirt, w: 66 },
      { d: 'M 540 1150 Q 606 1212 594 1300 L 486 1300 Q 474 1212 540 1150 Z', fill: SKIN, w: 6 },
      { d: 'M 540 1172 L 540 1300 M 512 1215 L 512 1262 M 568 1215 L 568 1262', w: 4 },
      { d: ellipse(540, 1040, 52, 30), fill: SKIN, c: 'none' },
      cloud(540, 832, 268, 232, HAIR, BK, 14),
      circ(366, 925, 36, SKIN), circ(714, 925, 36, SKIN),
      { d: ellipse(540, 918, 176, 166), fill: SKIN, w: 7 },
    ], g);
    // franja crespa (borda de baixo em ondinhas)
    let d = '';
    for (let a = 186; a <= 354; a += 6) {
      const x = 540 + 184 * Math.cos(a * DEG), y = 918 + 174 * Math.sin(a * DEG);
      d += (d ? ' L ' : 'M ') + r1(x) + ' ' + r1(y);
    }
    const n = 7, xa = 718, xb = 362, w = (xa - xb) / n;
    d += ` L ${xa} 852`;
    for (let i = 0; i < n; i++) d += ` Q ${r1(xa - w * (i + 0.5))} ${i % 2 ? 900 : 892} ${r1(xa - w * (i + 1))} 852`;
    let edge = `M 362 858 L ${xa} 852`;
    for (let i = 0; i < n; i++) edge += ` Q ${r1(xa - w * (i + 0.5))} ${i % 2 ? 900 : 892} ${r1(xa - w * (i + 1))} 852`;
    put([{ d: d + ' Z', fill: HAIR, c: 'none' }, { d: edge.replace(/^M 362 858 L /, 'M '), w: 6 },
      { d: 'M 420 780 q 14 -16 28 0 M 600 770 q 14 -16 28 0 M 330 840 q 14 -16 28 0 M 710 830 q 14 -16 28 0 M 510 700 q 14 -16 28 0', c: '#7c5236', w: 5 },
      { d: ellipse(430, 1000, 30, 16), fill: '#fda4af', c: 'none', fo: 0.75 }, { d: ellipse(650, 1000, 30, 16), fill: '#fda4af', c: 'none', fo: 0.75 },
      { d: 'M 538 968 Q 516 984 536 998', w: 6 }], g);
    const eL = makeEye(g, 470, 940, 44, SKIN), eR = makeEye(g, 610, 940, 44, SKIN);
    const mouth = makeMouth(g, 540, 1032, 78, { teeth: true });
    return (t, st) => {
      g.setAttribute('transform', `translate(${r1(st.dx || 0)} ${r1(st.dy || 0)}) rotate(${(st.rot || 0).toFixed(2)} 540 1330)`);
      const e = { open: st.open, pop: st.pop, px: st.px, py: st.py, pr: st.pr, brow: st.brow };
      eL(Object.assign({ side: 1 }, e)); eR(Object.assign({ side: -1 }, e));
      mouth(st.op, st.smile ?? 6, { wide: st.wide || 1 });
    };
  }

  // ---- JESUS (corpo inteiro; origem no chão/nuvem, olhando para a frente).
  // st: x, y, s, lean, L/R = alvo das mãos (local), pointL/pointR, shrug, open, pop, px, py, op (boca), halo, blush
  function makeJesus(parent) {
    const root = WB.mk('g', {}, parent);
    const g = WB.mk('g', {}, root);
    const HJ = '#7c4a1e', ROBE = '#fafaf9';
    put([
      { d: 'M -96 -690 Q -116 -580 -128 -508 L 128 -508 Q 116 -580 96 -690 Z', fill: HJ, w: 6 },
      circ(0, -672, 100, HJ),
      { d: 'M -96 -540 L 96 -540 Q 124 -500 134 -400 L 178 0 L -178 0 L -134 -400 Q -124 -500 -96 -540 Z', fill: ROBE, w: 7 },
      { d: 'M -100 -536 L -58 -546 L 140 -322 L 128 -276 Z', fill: '#b91c1c', w: 6 },
      { d: 'M -40 -250 L -60 -10 M 50 -200 L 66 -10', c: '#d6d3d1', w: 5 },
    ], g);
    const armBack = WB.mk('g', {}, g);
    const sleeves = [0, 1].map(() => ({ o: dyn(armBack, { 'stroke-width': 62 }), i: dyn(armBack, { stroke: ROBE, 'stroke-width': 48 }) }));
    const hands = [0, 1].map(() => WB.mk('circle', { r: 24, fill: SKIN, stroke: BK, 'stroke-width': 5 }, armBack));
    const fingers = [0, 1].map(() => dyn(armBack, { 'stroke-width': 9, stroke: BK }));
    const fingersIn = [0, 1].map(() => dyn(armBack, { 'stroke-width': 4, stroke: SKIN }));
    const headG = WB.mk('g', {}, g);
    put([
      { d: 'M -24 -590 L 24 -590 L 24 -530 L -24 -530 Z', fill: SKIN, c: 'none' },
      { d: ellipse(0, -664, 80, 94), fill: SKIN, w: 7 },
      { d: 'M -84 -676 Q -74 -772 0 -762 Q 74 -772 84 -676 Q 44 -738 0 -716 Q -44 -738 -84 -676 Z', fill: HJ, w: 6 },
      { d: 'M -82 -662 Q -80 -556 0 -538 Q 80 -556 82 -662 Q 62 -606 0 -610 Q -62 -606 -82 -662 Z', fill: HJ, w: 6 },
      { d: 'M -36 -626 Q -16 -640 0 -628 Q 16 -640 36 -626 Q 16 -618 0 -622 Q -16 -618 -36 -626 Z', fill: HJ, w: 4 },
      { d: 'M -4 -668 Q -14 -646 2 -640', w: 5 },
    ], headG);
    const blush = WB.mk('g', { opacity: 0 }, headG);
    put([{ d: ellipse(-50, -640, 18, 10), fill: '#fda4af', c: 'none' }, { d: ellipse(50, -640, 18, 10), fill: '#fda4af', c: 'none' }], blush);
    const eL = makeEye(headG, -32, -676, 22, SKIN), eR = makeEye(headG, 32, -676, 22, SKIN);
    const mouth = makeMouth(headG, 0, -606, 30);
    const halo = WB.mk('path', { d: ellipse(0, 0, 92, 22), fill: 'none', stroke: '#f59e0b', 'stroke-width': 11 }, root);
    const haloIn = WB.mk('path', { d: ellipse(0, 0, 92, 22), fill: 'none', stroke: '#fde68a', 'stroke-width': 4 }, root);
    return (t, st) => {
      const s = st.s || 1, lean = st.lean || 0;
      root.setAttribute('transform', `translate(${r1(st.x)} ${r1(st.y)}) scale(${s})`);
      g.setAttribute('transform', `rotate(${(lean).toFixed(2)} 0 0)`);
      const sh = (st.shrug || 0) * 22;
      const SH = [[-88, -512 - sh], [88, -512 - sh]];
      [st.L, st.R].forEach((h, i) => {
        const side = i ? 1 : -1;
        const k = ik(SH[i][0], SH[i][1], h[0], h[1], 128, 122, [SH[i][0] + side * 160, SH[i][1] + 150]);
        const dd = limb(SH[i], k.el, k.h);
        sleeves[i].o.setAttribute('d', dd); sleeves[i].i.setAttribute('d', dd);
        hands[i].setAttribute('cx', r1(k.h[0])); hands[i].setAttribute('cy', r1(k.h[1]));
        const pt = i ? (st.pointR || 0) : (st.pointL || 0);
        const fd = pt > 0.5 ? `M ${r1(k.h[0] - side * 6)} ${r1(k.h[1] - 14)} L ${r1(k.h[0] - side * 10)} ${r1(k.h[1] - 54)}` : '';
        fingers[i].setAttribute('d', fd); fingersIn[i].setAttribute('d', fd);
      });
      const hx = st.headRot || 0;
      headG.setAttribute('transform', `translate(0 ${r1(-sh * 0.6)}) rotate(${hx.toFixed(2)} 0 -560)`);
      blush.setAttribute('opacity', (st.blush || 0).toFixed(2));
      const e = { open: st.open, pop: st.pop, px: st.px, py: st.py, pr: st.pr, brow: st.brow, tilt: st.tilt };
      eL(Object.assign({ side: 1 }, e)); eR(Object.assign({ side: -1 }, e));
      mouth(st.op || 0, st.smile ?? 6, {});
      // auréola acompanha a cabeça (com inclinação própria quando ele leva susto)
      const ha = (st.halo || 0) + hx + lean;
      const hc = [Math.sin((hx + lean) * DEG) * 230, -790 + (1 - Math.cos((hx + lean) * DEG)) * 230 - sh * 0.6 - (st.haloUp || 0)];
      const tr = `translate(${r1(hc[0])} ${r1(hc[1])}) rotate(${ha.toFixed(2)})`;
      halo.setAttribute('transform', tr); haloIn.setAttribute('transform', tr);
    };
  }

  // ---- BARATINHA (uma perna só). Origem no chão, embaixo do pé.
  // st: x, y, s, f, hop, footX, arms (fase), wave, armTarget (mão de cima perto do parceiro, local), open, px, py, op, tongue, tilt
  function makeRoach(parent) {
    const root = WB.mk('g', {}, parent);
    const BR = '#8a4f24', BRD = '#6b3a17', BRL = '#c8915a';
    const legO = dyn(root, { 'stroke-width': 26 }), legI = dyn(root, { stroke: BRD, 'stroke-width': 14 });
    const foot = WB.mk('path', { d: '', fill: BRD, stroke: BK, 'stroke-width': 5 }, root);
    const body = WB.mk('g', {}, root);
    const antO = [0, 1].map(() => dyn(body, { 'stroke-width': 9 }));
    const antTip = [0, 1].map(() => WB.mk('circle', { r: 12, fill: BRD, stroke: BK, 'stroke-width': 4 }, body));
    const armsBack = WB.mk('g', {}, body);
    const arms = [0, 1, 2, 3].map(() => ({ o: dyn(armsBack, { 'stroke-width': 16 }), i: dyn(armsBack, { stroke: BRD, 'stroke-width': 7 }) }));
    const handsA = [0, 1, 2, 3].map(() => WB.mk('circle', { r: 13, fill: BRD, stroke: BK, 'stroke-width': 4 }, armsBack));
    put([
      { d: ellipse(0, -380, 112, 172), fill: BR, w: 7 },
      { d: ellipse(0, -368, 70, 140), fill: BRL, w: 5 },
      { d: 'M -62 -430 Q 0 -414 62 -430 M -70 -370 Q 0 -352 70 -370 M -64 -310 Q 0 -292 64 -310 M -48 -254 Q 0 -240 48 -254', c: BRD, w: 5 },
      circ(0, -578, 88, BRD, BK, 7),
    ], body);
    const eL = makeEye(body, -46, -612, 48, BRD), eR = makeEye(body, 46, -612, 48, BRD);
    const mouth = makeMouth(body, 0, -540, 56);
    const SHO = [[-98, -470], [98, -470], [-106, -372], [106, -372]];
    return (t, st) => {
      const s = st.s || 1, f = st.f || 1, hop = st.hop || 0, sq = st.squash || 0;
      root.setAttribute('transform', `translate(${r1(st.x)} ${r1(st.y)}) scale(${(s * f).toFixed(3)} ${s.toFixed(3)}) rotate(${(st.tilt || 0).toFixed(2)})`);
      body.setAttribute('transform', `translate(0 ${r1(-hop)}) translate(0 -215) scale(${(1 + sq * 0.08).toFixed(3)} ${(1 - sq * 0.08).toFixed(3)}) translate(0 215)`);
      // perna única com IK (quadril sobe com o pulo, pé no chão)
      const hip = [0, -215 - hop + sq * 14], fx = st.footX || 0;
      const k = ik(hip[0], hip[1], fx, -12, 112, 112, [90, -110]);
      const ld = limb(hip, k.el, k.h);
      legO.setAttribute('d', ld); legI.setAttribute('d', ld);
      foot.setAttribute('d', ellipse(fx + 22, -8, 40, 16));
      // antenas que balançam com o pulo
      [-1, 1].forEach((sd, i) => {
        const sw = Math.sin(t * 7 + i * 1.3) * 18 + hop * 0.4 * sd;
        const tip = [sd * 120 + sw, -830 + Math.cos(t * 5 + i) * 10];
        antO[i].setAttribute('d', `M ${sd * 26} -650 Q ${r1(sd * 40 + sw * 0.4)} -770 ${r1(tip[0])} ${r1(tip[1])}`);
        antTip[i].setAttribute('cx', r1(tip[0])); antTip[i].setAttribute('cy', r1(tip[1]));
      });
      // quatro bracinhos acenando
      SHO.forEach((sp, i) => {
        const side = sp[0] < 0 ? -1 : 1, lowArm = i >= 2;
        const ph = t * (st.armSpeed || 8) + i * 1.7 + (st.arms || 0);
        let tg = [sp[0] + side * 80, sp[1] + (lowArm ? 20 : -60) + Math.sin(ph) * 44 * (st.wave ?? 1)];
        if (i === 0 && st.armTarget) tg = st.armTarget;
        const kk = ik(sp[0], sp[1], tg[0], tg[1], 62, 62, [sp[0] + side * 40, sp[1] + 80]);
        const dd = limb(sp, kk.el, kk.h);
        arms[i].o.setAttribute('d', dd); arms[i].i.setAttribute('d', dd);
        handsA[i].setAttribute('cx', r1(kk.h[0])); handsA[i].setAttribute('cy', r1(kk.h[1]));
      });
      const e = { open: 1, pop: st.pop, px: st.px, py: st.py, pr: st.pr || 1.1, brow: 6 };
      eL(Object.assign({ side: 1 }, e, st.eL || {})); eR(Object.assign({ side: -1 }, e, st.eR || {}));
      mouth(st.op || 0, st.smile ?? 8, { tongue: st.tongue || 0 });
    };
  }
  // mão de cima da baratinha no mundo (para o Jesus segurar)
  const roachHandWorld = (st, local) => [st.x + local[0] * (st.s || 1) * (st.f || 1), st.y + (local[1] - (st.hop || 0)) * (st.s || 1)];

  // =====================================================================
  // CENÁRIOS
  // =====================================================================
  function church() {
    const win = (x0, x1) => {
      const cx = (x0 + x1) / 2;
      return [
        { d: `M ${x0} 950 L ${x0} 700 Q ${x0} 600 ${cx} 600 Q ${x1} 600 ${x1} 700 L ${x1} 950 Z`, fill: '#c7d2fe', w: 7 },
        { d: `M ${x0} 760 L ${x1} 760 M ${x0} 860 L ${x1} 860 M ${cx} 600 L ${cx} 950`, w: 5 },
        { d: `M ${x0 + 8} 768 L ${cx - 4} 768 L ${cx - 4} 852 L ${x0 + 8} 852 Z`, fill: '#fde68a', c: 'none', fo: 0.9 },
        { d: `M ${cx + 4} 868 L ${x1 - 8} 868 L ${x1 - 8} 942 L ${cx + 4} 942 Z`, fill: '#fca5a5', c: 'none', fo: 0.9 },
        { d: `M ${cx} 640 L ${cx} 730 M ${cx - 26} 666 L ${cx + 26} 666`, c: '#b45309', w: 9 },
      ];
    };
    put([win(70, 230), win(850, 1010)]);
  }
  function pew() {
    put([
      { d: WB.roundRectPath(110, 1400, 860, 130, 10), fill: '#a8622c', w: 7 },
      { d: 'M 150 1440 L 930 1440 M 150 1488 L 930 1488', c: '#7c4519', w: 4 },
      { d: WB.roundRectPath(78, 1326, 924, 80, 18), fill: '#c2783a', w: 8 },
      { d: 'M 120 1352 Q 300 1344 480 1356 M 600 1350 Q 780 1360 960 1352', c: '#8a4f24', w: 4 },
    ]);
  }
  function sky() {
    let rays = '';
    for (let i = 0; i < 14; i++) {
      const a0 = (i / 14) * Math.PI * 2, a1 = a0 + Math.PI / 20;
      rays += `M 540 760 L ${r1(540 + Math.cos(a0) * 900)} ${r1(760 + Math.sin(a0) * 900)} L ${r1(540 + Math.cos(a1) * 900)} ${r1(760 + Math.sin(a1) * 900)} Z `;
    }
    const raysG = WB.mk('g', {}, cont);
    WB.mk('path', { d: rays, fill: '#fef3c7', stroke: 'none' }, raysG);
    WB.effect(t => raysG.setAttribute('transform', `rotate(${(t * 6).toFixed(2)} 540 760)`));
    put([cloud(150, 640, 90, 40, '#ffffff', '#93c5fd'), cloud(920, 600, 80, 36, '#ffffff', '#93c5fd')]);
  }
  const skyFront = () => put([cloud(540, 1470, 560, 130, '#ffffff', '#60a5fa', 16), cloud(120, 1420, 160, 80, '#ffffff', '#60a5fa'), cloud(960, 1430, 170, 80, '#ffffff', '#60a5fa')]);
  function stage(o = {}) {
    const cone = WB.mk('path', { d: 'M 470 470 L 610 470 L 880 1480 L 200 1480 Z', fill: '#fef9c3', stroke: 'none', opacity: 0.9 }, cont);
    WB.effect(t => cone.setAttribute('transform', `rotate(${(Math.sin(t * 2.2) * 3).toFixed(2)} 540 470)`));
    put([{ d: WB.roughLine(40, 1478, 1040, 1478, 2), w: 7 }, { d: ellipse(540, 1480, 290, 34), fill: '#fde68a', w: 5 }]);
    const ball = WB.mk('g', {}, cont);
    put([{ d: 'M 540 450 L 540 520', w: 5 }, circ(540, 568, 52, '#d4d4d8', BK, 6),
      { d: 'M 492 548 L 588 548 M 490 588 L 590 588 M 520 518 Q 506 568 520 618 M 560 518 Q 574 568 560 618', c: '#71717a', w: 4 }], ball);
    WB.effect(t => ball.setAttribute('transform', `rotate(${(Math.sin(t * 3) * 6).toFixed(2)} 540 450)`));
  }

  // =====================================================================
  // FAIXA AMARELA (contexto) + LETRA EM VERMELHO + CRÉDITO
  // =====================================================================
  const CTA0 = 19.4;
  {
    const band = WB.mk('g', {}, WB.overlay);
    const size = 52, lh = 60, lines = ['O ano era 2022, e o mundo', 'tava conhecendo a baratinha.'];
    const w = Math.max(...lines.map(l => WB.measure(l, size))) + 70, h = lines.length * lh + 30, y0 = 130;
    WB.mk('rect', { x: r1(540 - w / 2), y: y0, width: r1(w), height: h, rx: 20, fill: '#ffe066', stroke: BK, 'stroke-width': 5 }, band);
    lines.forEach((l, k) => WB.showNow(WB.textStrokes(l, 540, y0 + 58 + k * lh, size, BK, band, 'middle').strokes));
    WB.effect(t => {
      band.setAttribute('opacity', t < CTA0 ? clamp(t / 0.3) : clamp(1 - (t - CTA0) / 0.3));
      band.setAttribute('transform', `rotate(${(-1.2).toFixed(1)} 540 ${y0 + h / 2})`);
    });
  }
  const credit = WB.mk('g', {}, WB.overlay);
  WB.showNow(WB.textStrokes('vídeo original: @rafaellatuma', 540, 1730, 40, '#78716c', credit, 'middle').strokes);
  WB.effect(t => credit.setAttribute('opacity', t < CTA0 ? 0.9 : 0));

  // Letra "ouvida", como no original: cada trecho cresce palavra por palavra. [início, fim, [[t, texto acumulado], ...], giro]
  const RED = '#c81e1e';
  const LYR = [
    [0.4, 1.3, [[0.45, 'EU'], [0.85, 'EU SOU'], [1.12, 'EU SOU O']]],
    [1.3, 2.62, [[1.3, 'COR'], [1.55, 'CORDEI'], [1.8, 'CORDEIRIII'], [2.12, 'CORDEIRIIINHO']], -5],
    [2.62, 3.05, [[2.65, 'JESUS']]],
    [3.05, 4.6, [[3.05, 'É'], [3.3, 'É MEU'], [3.75, 'É MEU PASTOR']]],
    [4.6, 5.3, [[4.7, 'SE EU SOU...']]],
    [5.3, 5.98, [[5.32, 'SENHOR']]],
    [5.98, 6.9, [[6.0, 'BENDI'], [6.5, 'BENDITO']]],
    [6.9, 7.72, [[6.92, 'NO'], [7.25, 'NO CRISTO']]],
    [7.72, 8.95, [[7.75, 'ME'], [8.2, 'ME SALVOU']]],
    [9.0, 10.0, [[9.02, 'É'], [9.28, 'É MENTIRA']]],
    [10.0, 11.08, [[10.02, 'DA BARATA']], 3],
    [11.08, 12.0, [[11.1, 'ELA'], [11.62, 'ELA TEM']]],
    [12.0, 13.2, [[12.02, 'UMA'], [12.38, 'UMA PERNA'], [12.75, 'UMA PERNA SÓ']]],
    [13.2, 14.0, [[13.22, 'TA'], [13.47, 'TA TA'], [13.72, 'TA TA TA']], -3],
    [14.0, 16.45, [[14.02, 'TO'], [14.25, 'TO TO'], [14.6, 'TO TO TÁTÁ'], [14.85, 'TO TO TÁTÁ TA'], [15.2, 'TO TO TÁTÁ TA TA'],
      [15.45, 'TO TO TÁTÁ TA TA TA'], [15.7, 'TO TO TÁTÁ TA TA TA TA'], [16.0, 'TO TO TÁTÁ TA TA TA TA TA']]],
    [16.45, 17.22, [[16.48, 'TA'], [16.72, 'TA TA'], [16.98, 'TA TA TATA']]],
    [17.22, CTA0, [[17.25, 'TO'], [17.5, 'TO TO'], [17.8, 'TO TO TÁTÁ'], [18.05, 'TO TO TÁTÁ TA'], [18.35, 'TO TO TÁTÁ TA TA'],
      [18.6, 'TO TO TÁTÁ TA TA TA'], [18.85, 'TO TO TÁTÁ TA TA TA TA'], [19.05, 'TO TO TÁTÁ TA TA TA TA TA']], 2],
  ];
  {
    const lyr = WB.mk('g', {}, WB.overlay);
    const LY = 440;
    LYR.forEach(([a, b, states, rot = 0], si) => {
      const final = states[states.length - 1][1];
      const size = Math.min(96, 940 * 96 / WB.measure(final, 96));
      const x0 = 540 - WB.measure(final, size) / 2;
      states.forEach(([t0, text], k) => {
        const t1 = k + 1 < states.length ? states[k + 1][0] : b;
        const g = WB.mk('g', {}, lyr);
        WB.showNow(WB.textStrokes(text, x0, LY, size, RED, g, 'start').strokes);
        const lastW = WB.measure(text, size), px = x0 + lastW - 20;
        WB.effect(t => {
          if (t < t0 || t >= t1) { g.setAttribute('display', 'none'); return; }
          g.setAttribute('display', 'inline');
          const kk = 0.9 + 0.1 * backOut(clamp((t - t0) / 0.16));
          g.setAttribute('transform', `rotate(${rot} 540 ${LY}) translate(${r1(px)} ${LY - size * 0.3}) scale(${kk.toFixed(3)}) translate(${r1(-px)} ${-(LY - size * 0.3)})`);
        });
      });
    });
  }

  // =====================================================================
  // CENA A — MENINO NO BANCO DA IGREJA (cantando de olhos fechados)
  // =====================================================================
  const SK = [[0, 2.62], [3.5, 4.58], [7.62, 9.98], [14.0, 15.12], [16.42, 17.62]];
  shot(SK);
  church();
  // ovelhinha ("cordeirinho") que aparece no banco e fica por ali
  const sheepG = WB.mk('g', {}, cont);
  P(1.32, [
    { d: 'M 120 1336 L 120 1300 M 150 1338 L 150 1304 M 210 1338 L 210 1304 M 240 1336 L 240 1300', w: 10 },
    cloud(180, 1250, 100, 66, '#ffffff', BK, 11),
    { d: ellipse(278, 1224, 40, 48), fill: '#3f3f46', w: 6 },
    { d: ellipse(244, 1196, 26, 12), fill: '#3f3f46', w: 5 }, { d: ellipse(312, 1196, 26, 12), fill: '#3f3f46', w: 5 },
    circ(264, 1214, 10, '#ffffff', BK, 3), circ(294, 1214, 10, '#ffffff', BK, 3), circ(266, 1216, 4, BK, 'none'), circ(292, 1216, 4, BK, 'none'),
    { d: 'M 266 1244 Q 278 1252 290 1244', c: '#ffffff', w: 4 },
    cloud(276, 1176, 38, 18, '#ffffff', BK, 7),
  ], { parent: sheepG, loop: 'bob', ox: 180, oy: 1336 });
  TX(1.45, 'béé!', 300, 1120, 64, '#7c3aed', -8, { until: 2.55, loop: 'wiggle' });
  const kid = makeKid(cont);
  pew();
  P(8.22, [star(330, 760, 34), star(760, 730, 28, '#fde047'), star(800, 980, 22), star(280, 1000, 24, '#fde047')], { loop: 'pulse', until: 8.92 });
  P(9.02, [{ d: 'M 640 1040 L 760 1010 M 650 1080 L 790 1090 M 440 1040 L 320 1010 M 430 1080 L 290 1090', c: RED, w: 9 }], { loop: 'shake', until: 9.95 });
  TX(9.1, '!!', 222, 1130, 90, RED, -10, { until: 9.95, anim: 'slam' });
  P(14.05, noteSym(830, 800, 1.1), { loop: 'rise', until: 15.1 });
  P(16.45, noteSym(230, 800, 1.1, '#2563eb'), { loop: 'rise', until: 17.6 });
  const KOPEN = K([[0, 0], [3.5, 1, 'l'], [4.58, 1], [4.6, 0, 'l'], [8.12, 0], [8.2, 1, 'l'], [8.95, 1], [9.0, 0, 'l']]);
  WB.effect(t => {
    if (!inWin(SK, t)) return;
    const open = KOPEN(t), belt = t >= 9.0 && t < 9.98 ? 1 : 0;
    const v = voice(t);
    const sway = Math.sin(t * 4.2) * 3 * (1 - belt);
    kid(t, {
      rot: sway + belt * Math.sin(t * 45) * 1.5, dy: -v * 10 - belt * 14,
      open, pop: open ? bump(t, 3.5, 3.8) + bump(t, 8.2, 8.45) : 0, pr: open ? 0.75 : 1, py: open ? -0.3 : 0,
      brow: open ? 16 : 0, op: v * (belt ? 1.25 : 0.9), wide: belt ? 1.35 : 1, smile: 8,
    });
  });

  // =====================================================================
  // CENA B — JESUS NA NUVEM
  // =====================================================================
  const SJ = [[2.62, 3.5], [4.58, 7.62], [10.0, 11.08], [15.12, 16.42]];
  shot(SJ);
  sky();
  const jes = makeJesus(cont);
  skyFront();
  P(2.72, [heart(380, 820, 0.9), heart(700, 780, 0.7, '#f472b6'), heart(760, 920, 0.6)], { loop: 'rise', until: 3.5 });
  P(4.9, [...noteSym(250, 900, 0.9), ...noteSym(820, 860, 0.8, '#db2777')], { loop: 'rise', until: 6.4 });
  P(6.4, [...noteSym(300, 860, 0.8, '#2563eb'), ...noteSym(800, 920, 0.9)], { loop: 'rise', until: 7.6 });
  stamp(10.3, '?!', 820, 640, 100, RED, 10, { until: 11.0 });
  P(10.25, [{ d: 'M 650 700 q -14 26 0 36 q 14 -10 0 -36 Z', fill: '#93c5fd', w: 4 }], { loop: 'float', until: 11.0 });
  const PRAY = [-16, -455, 16, -455], OPEN = [-232, -700, 232, -700], SHRUG = [-215, -478, 215, -478], CHEST = [-150, -560, 10, -470];
  const JPOSE = K([[2.6, PRAY], [4.58, PRAY], [4.85, OPEN, 'b'], [5.2, OPEN], [5.42, PRAY], [5.68, PRAY], [5.9, OPEN, 'b'], [6.12, OPEN], [6.32, CHEST],
    [6.66, CHEST], [6.9, OPEN, 'b'], [10.0, OPEN], [10.12, [-250, -760, 250, -760], 's'], [11.1, [-250, -760, 250, -760]],
    [15.12, SHRUG], [15.75, SHRUG], [15.95, [-180, -560, 180, -560]]]);
  const JPT = K([[4.58, 0], [4.8, 1, 'l'], [5.25, 1], [5.3, 0, 'l'], [5.85, 0], [5.9, 1, 'l'], [6.2, 1], [6.25, 0, 'l'], [6.85, 0], [6.9, 1, 'l'], [11.1, 1], [11.2, 0, 'l']]);
  const JOPEN = K([[10.0, 0], [10.12, 1, 'l'], [11.1, 1], [15.1, 1]]);
  WB.effect(t => {
    if (!inWin(SJ, t)) return;
    const pose = JPOSE(t), pt = JPT(t) > 0.5 ? 1 : 0;
    const sing = (t > 4.58 && t < 7.62) ? voice(t) * 0.9 : 0;
    const scare = t >= 10.0 && t < 11.08, shrug = t >= 15.12 ? clamp((t - 15.12) / 0.2) * (1 - clamp((t - 15.75) / 0.25)) : 0;
    const groove = t >= 15.8 ? Math.sin(t * 12.6) : 0;
    const wob = (t < 7.62) ? Math.sin(t * 3.4) * 3 : 0;
    jes(t, {
      x: 540, y: 1430 - (scare ? spring(clamp((t - 10.1) / 0.6)) * 0 : 0) - Math.abs(groove) * 10, s: 1,
      lean: wob + groove * 3, L: [pose[0], pose[1]], R: [pose[2], pose[3]], pointL: pt, pointR: pt,
      shrug, open: t >= 10.0 ? JOPEN(t) : 0, pop: scare ? bump(t, 10.1, 10.45) * 1.2 : 0,
      pr: scare ? 0.6 : 1, px: t >= 15.12 ? 0.6 : 0, py: t >= 15.12 ? 0.1 : 0, brow: scare ? 14 : (t >= 15.12 ? 4 : 0), tilt: t >= 15.12 ? 6 : 0,
      op: scare ? 0.45 : sing, smile: t >= 15.12 ? 5 : 8, blush: t < 3.5 ? 1 : 0,
      headRot: wob * 1.6 + groove * 6 + (t >= 15.12 && t < 15.8 ? -6 : 0),
      halo: scare ? -22 * spring(clamp((t - 10.1) / 0.7)) : 0, haloUp: scare ? 40 * bump(t, 10.08, 10.4) : 0,
    });
  });

  // =====================================================================
  // CENA C — A BARATINHA DE UMA PERNA SÓ, NO PALCO
  // =====================================================================
  const SR = [[11.08, 14.0]];
  shot(SR);
  stage();
  const roach = makeRoach(cont);
  P(12.3, [{ d: WB.loopEllipse(560, 1380, 120, 110), c: RED, w: 9 }, { d: 'M 760 1270 L 690 1330', c: RED, w: 9 }, { d: WB.arrowHead(690, 1330, 2.4, 30), c: RED, w: 9 },
    T('uma só!', 820, 1250, 64, RED)], { until: 13.2 });
  const RX = K([[11.08, 980], [11.75, 540, 'o']]);
  WB.effect(t => {
    if (!inWin(SR, t)) return;
    const fast = t >= 13.2;
    const per = fast ? 0.25 : 0.5;
    const ph = ((t - 11.08) / per) % 1;
    const hop = Math.sin(Math.PI * ph) * (fast ? 70 : 55);
    const land = ph < 0.12 || ph > 0.92 ? 1 : 0;
    const v = voice(t);
    roach(t, {
      x: RX(t), y: 1475, s: 1, f: 1, hop, squash: land, footX: Math.sin(t * 3) * 10, tilt: Math.sin(t * 6.3) * 5,
      wave: 1, armSpeed: fast ? 14 : 8, op: v * 0.95, tongue: fast ? 1 : 0, smile: 10,
      px: fast ? 0 : Math.sin(t * 2) * 0.5, eL: fast ? { px: 0.6, py: -0.3 } : {}, eR: fast ? { px: -0.6, py: 0.4 } : {},
      pop: bump(t, 11.75, 12.0),
    });
  });

  // =====================================================================
  // CENA D — JESUS E A BARATINHA DANÇANDO DE MÃOS DADAS (atravessam o palco)
  // =====================================================================
  const SD = [[17.62, CTA0]];
  shot(SD);
  stage();
  P(17.8, confetti(80, 520, 1000, 1350, 40, 3), { loop: 'float' });
  P(18.0, [...noteSym(200, 900, 0.9), ...noteSym(880, 860, 0.8, '#db2777')], { loop: 'rise' });
  const jd = makeJesus(cont), rd = makeRoach(cont);
  danceDuo(SD, jd, rd, 1475, K([[17.62, -160], [19.4, 160, 'l']]), 1, 0.7);

  function danceDuo(wins, jRig, rRig, FY, DX, S, roachS) {
    WB.effect(t => {
      if (!inWin(wins, t)) return;
      const dx = DX(t), beat = t * 2.1;
      const ph = beat % 1, hop = Math.sin(Math.PI * ph) * 45;
      const rst = { x: 720 * S + 540 * (1 - S) + dx, y: FY, s: roachS * S, f: -1, hop, squash: ph < 0.1 ? 1 : 0,
        footX: 0, tilt: Math.sin(t * 6.6) * 6, op: voice(t) * 0.9, smile: 12, wave: 1, armSpeed: 9,
        armTarget: [-175, -500 + Math.sin(t * 6.6) * 20], px: -0.4 };
      // a mão de cima da baratinha (lado do Jesus) é o ponto que ele segura
      const hw = roachHandWorld(rst, [-175, -500 + Math.sin(t * 6.6) * 20]);
      const jx = 330 * S + 540 * (1 - S) + dx, js = 0.74 * S, sway = Math.sin(t * 6.6);
      jRig(t, {
        x: jx, y: FY - Math.abs(sway) * 12 * S, s: js, lean: 9 + sway * 4,
        L: [-200 + sway * 30, -720 + Math.cos(t * 6.6) * 40], R: [(hw[0] - jx) / js, (hw[1] - (FY - Math.abs(sway) * 12 * S)) / js],
        pointL: 0, open: 0, op: 0, smile: 12, headRot: sway * 8, blush: 0.6,
      });
      rRig(t, rst);
    });
  }

  // =====================================================================
  // CTA (19,4–fim)
  // =====================================================================
  shot([[CTA0, 999]]);
  {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 560, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 650, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@caderno_amarelo', 380, 650 + 190 * 0.62, 84, BK, g).strokes);
    animate(g, CTA0 + 0.1, { loop: 'float' });
    put([{ d: WB.roughLine(96, 1560, 1060, 1560, 2), w: 7 }]);
    const jc = makeJesus(cont), rc = makeRoach(cont);
    danceDuo([[CTA0, 999]], jc, rc, 1560, K([[CTA0, -40], [23.2, 40, 'l']]), 0.78, 0.7);
  }

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA: @caderno_amarelo troca de canto a cada ~5 s (deslizando)
  // =====================================================================
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const S = 40, fs = 36, handle = '@caderno_amarelo';
    const tw = WB.measure(handle, fs), total = S + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -S / 2 - 10, width: r1(total + 44), height: S + 20, rx: (S + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -S / 2, S, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + S + 12, S * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[290, 540], [790, 540], [790, 1610], [290, 1610]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % 4], b = SPOTS[(k + 1) % 4], e = eio(u);
      const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.3) / 0.4) * (1 - clamp((t - CTA0 + 0.2) / 0.4)) * 0.95).toFixed(3));
    });
  }
};
