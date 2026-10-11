// Meme "gato vs cachorro" (animação original de @rafaellatuma) redesenhado no Caderno Amarelo, formato B.
// Novidade deste vídeo: MOVIMENTO FLUIDO. Os três bonecos (a dona, o Bidu e o Bartolomeu) são "esqueletos"
// recalculados a cada quadro: posições em trilhas de keyframes com easing (K), braços com IK de dois ossos,
// passos amarrados ao deslocamento (o pé não escorrega), respiração, piscadas, rabo/orelhas com movimento
// secundário e molas (spring) quando algo estica ou volta. Tudo é função pura de t.
// Áudio original (uma voz faz os três). Quem fala em cada trecho: janelas W_WIN / D_WIN / C_WIN.
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
  const ei = u => u * u * u;
  const backOut = u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
  const spring = u => 1 - Math.exp(-5.5 * u) * Math.cos(13 * u);   // passa do ponto e assenta
  const EZ = { io: eio, o: eo, i: ei, b: backOut, s: spring, l: u => u };
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
  const C0 = v => () => v;
  // pulso suave 0→1→0 entre a e b
  const bump = (t, a, b) => (t <= a || t >= b) ? 0 : Math.sin(Math.PI * (t - a) / (b - a));

  // ---------------- áudio: energia (20/s) e quem fala ----------------
  const ENV = '01597257888546678877765444232798987997799998863355298758789989842976989978667875788840100868878388886887988888656155557523677873567775175210515720667740854661866787685387575676288885797278887784078887421145998689778786686874836864443677628787485367877655555444320000000000000000002565544544302332011000000000006310000000000000740688877668647126667000000007876674520014352465652443333221000000000012210000000000134300100110100000112345423210010343444444434343343434332210111110422011000222134553332300000311202231032210000022004554456534433210000420032110000154124540023650224411555025433234201000011222221232222433443543455554342243433321422443531323400000000003100000000651000003341010324447899889988989886100001188888887699985100001234451043340000445344555958686788597389847898897788995000869986898878898510133788888998688888875111089988846999878531000998888873000079889718745999686988887888607888500000300000000000000100006874264251255553204737467855476466757535515346568811640855558545566565638820000003887868788686788752158877777977687578637666787300026998699648899865227764320000000000000000000000000000000000000000000000000000000000000000301220120021013111100001220254555434210000555554211233005555542544545777875798860000000000000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  const W_WIN = [[0.0, 1.25], [5.4, 6.15], [12.15, 13.15], [17.55, 19.0], [19.75, 21.45], [22.25, 22.6], [24.4, 25.2], [25.7, 26.15],
    [26.7, 27.65], [27.75, 29.45], [33.35, 34.45], [36.35, 37.65], [57.1, 58.3]];
  const D_WIN = [[1.35, 5.35], [6.2, 12.05], [21.5, 22.25], [22.6, 24.35], [25.2, 25.7], [26.15, 26.7], [32.1, 32.6], [34.5, 36.3], [37.7, 45.0]];
  const C_WIN = [[13.95, 17.4], [19.0, 19.9], [29.5, 31.8], [46.1, 53.95], [60.4, 61.5]];
  const talk = (wins, t) => {
    for (const [a, b] of wins) if (t >= a && t <= b) return clamp(envAt(t) * 1.25) * clamp((b - t) / 0.06);
    return 0;
  };

  // ---------------- montagem de itens estáticos (traço do caderno) ----------------
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
      if (loop === 'tremble') { dx += Math.sin(ts * 47) * 4; rot += Math.sin(ts * 31) * 2; }
      if (loop === 'wiggle') rot += Math.sin(ts * 5) * 4;
      if (loop === 'float') dy += Math.sin(ts * 2.4) * 10;
      if (loop === 'rise') { dy -= tt * 70; op *= clamp(1.4 - tt * 0.7); rot += Math.sin(ts * 4) * 8; }
      if (loop === 'pulse') k *= 1 + 0.08 * Math.sin(ts * 9);
      if (loop === 'bob') dy -= Math.abs(Math.sin(ts * 6)) * 14;
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
  const ZK = 1.12, ZX = 540, ZY = 950;
  function shot(wins, zoom = true) {
    const g = WB.mk('g', {}, WB.layer);
    const zg = WB.mk('g', zoom ? { transform: `translate(${ZX} ${ZY}) scale(${ZK}) translate(${-ZX} ${-ZY})` } : {}, g);
    const inner = WB.mk('g', {}, zg);
    WB.effect(t => {
      const w = wins.find(([a, b]) => t >= a && t < b);
      if (!w) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      const u = eo(clamp((t - w[0]) / 0.32));
      inner.setAttribute('transform', `translate(${r1(140 * (1 - u))} 0)`);
      inner.setAttribute('opacity', clamp((t - w[0]) / 0.18).toFixed(3));
    });
    cont = inner;
    return inner;
  }
  const inWin = (wins, t) => wins.some(([a, b]) => t >= a && t < b);

  // ---------------- formas ----------------
  const box = (x, y, w, h, r, fill, c, wd) => ({ d: WB.roundRectPath(x, y, w, h, r), fill, c, w: wd || 6 });
  const circ = (x, y, r, fill, c, wd) => ({ d: WB.circlePath(x, y, r), fill, c, w: wd || 6 });
  const S = (x, y, s) => (dx, dy) => `${r1(x + dx * s)} ${r1(y + dy * s)}`;
  const heart = (x, y, s, fill = '#ef4444') => ({ d: `M ${x} ${y + 30 * s} C ${x - 60 * s} ${y - 10 * s} ${x - 30 * s} ${y - 50 * s} ${x} ${y - 20 * s} C ${x + 30 * s} ${y - 50 * s} ${x + 60 * s} ${y - 10 * s} ${x} ${y + 30 * s} Z`, fill, w: 5 });
  function burst(x, y, r, fill, c = INK.red) {
    let d = '';
    for (let i = 0; i <= 20; i++) {
      const a = -Math.PI / 2 + (i / 20) * Math.PI * 2, rr = i % 2 ? r * 0.62 : r;
      d += (i ? ' L ' : 'M ') + r1(x + Math.cos(a) * rr * 1.35) + ' ' + r1(y + Math.sin(a) * rr);
    }
    return { d: d + ' Z', fill, c, w: 7 };
  }
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
  function cloud(cx, cy, rx, ry, fill = '#ffffff', c) { return { d: WB.cloudPath(cx, cy, rx, ry), fill, c, w: 6 }; }
  function thought(cx, cy, rx, ry, dots) { return [...dots.map(([x, y, r]) => circ(x, y, r, '#ffffff', null, 5)), cloud(cx, cy, rx, ry)]; }
  const smell = (x, y, s = 1) => ({ d: `M ${x} ${y} q 12 -20 0 -40 q -12 -20 0 -40 M ${x + 30 * s} ${y + 10} q 12 -20 0 -40 q -12 -20 0 -40`, c: '#65a30d', w: 6 });
  const speedLines = (x, y, len, dir = 1) => ({ d: [0, 1, 2].map(i => `M ${x} ${y + i * 34} L ${x - dir * (len - i * 30)} ${y + i * 34}`).join(' '), c: '#9ca3af', w: 7 });

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
  // olho genérico (branco + pupila + pálpebra + sobrancelha; "happy" vira ^)
  let UID = 0;
  function makeEye(parent, cx, cy, rx, ry, skin, o = {}) {
    const id = 'e' + (UID++);
    const g = WB.mk('g', {}, parent);
    const white = WB.mk('path', { d: ellipse(cx, cy, rx, ry), fill: '#ffffff', stroke: BK, 'stroke-width': 5 }, g);
    const cp = WB.mk('clipPath', { id }, g);
    WB.mk('path', { d: ellipse(cx, cy, rx - 1, ry - 1) }, cp);
    const inner = WB.mk('g', { 'clip-path': `url(#${id})` }, g);
    const prx = o.prx || rx * 0.32, pry = o.pry || prx;
    const pupil = WB.mk('ellipse', { cx, cy, rx: prx, ry: pry, fill: '#1c1917' }, inner);
    const shine = WB.mk('circle', { cx, cy, r: prx * 0.38, fill: '#ffffff' }, inner);
    const lid = WB.mk('rect', { x: cx - rx - 2, y: cy - ry - 2, width: rx * 2 + 4, height: 0, fill: skin }, inner);
    const lidLine = dyn(inner, { 'stroke-width': 5 });
    const tearG = WB.mk('path', { d: '', fill: '#93c5fd', stroke: BK, 'stroke-width': 3, opacity: 0 }, parent);
    const happyArc = dyn(parent, { 'stroke-width': 6 });
    const brow = o.noBrow ? null : dyn(parent, { stroke: o.browC || BK, 'stroke-width': o.browW || 7 });
    return function (p, side, t) {
      const hp = p.happy || 0;
      g.setAttribute('opacity', (1 - hp).toFixed(2));
      happyArc.setAttribute('d', hp > 0.02 ? `M ${r1(cx - rx * 0.85)} ${r1(cy + ry * 0.25)} Q ${cx} ${r1(cy - ry * 0.9 * hp)} ${r1(cx + rx * 0.85)} ${r1(cy + ry * 0.25)}` : '');
      const ks = p.pr || 1;
      pupil.setAttribute('cx', r1(cx + (p.px || 0))); pupil.setAttribute('cy', r1(cy + (p.py || 0)));
      pupil.setAttribute('rx', r1(prx * ks)); pupil.setAttribute('ry', r1(pry * ks));
      shine.setAttribute('cx', r1(cx + (p.px || 0) - prx * ks * 0.35)); shine.setAttribute('cy', r1(cy + (p.py || 0) - pry * ks * 0.35));
      shine.setAttribute('r', r1(prx * ks * (0.3 + 0.25 * (p.sparkle || 0))));
      const lidv = clamp(p.lid || 0), h = lidv * (ry * 2 + 4), yl = cy - ry - 2 + h;
      lid.setAttribute('height', r1(h));
      lidLine.setAttribute('d', lidv > 0.05 ? `M ${r1(cx - rx - 2)} ${r1(yl)} Q ${cx} ${r1(yl + 4)} ${r1(cx + rx + 2)} ${r1(yl)}` : '');
      if (brow) {
        const bi = (p.bi || 0) + (side > 0 ? (p.asym || 0) * 12 : 0), bo = p.bo || 0;
        const ix = cx - side * rx * 0.9, ox = cx + side * rx * 1.0;
        const iy = cy - ry - 14 + bi * (o.browK || 1), oy = cy - ry - 14 + bo * (o.browK || 1);
        brow.setAttribute('d', `M ${r1(ox)} ${r1(oy)} Q ${cx} ${r1(Math.min(iy, oy) - 6)} ${r1(ix)} ${r1(iy)}`);
      }
      const tr = p.tear || 0;
      tearG.setAttribute('opacity', tr > 0.02 ? 1 : 0);
      if (tr > 0.02) {
        const ty = cy + ry * 0.8 + ((t * 120) % 70) * tr;
        tearG.setAttribute('d', `M ${r1(cx + side * rx * 0.4)} ${r1(ty)} q -10 18 0 26 q 10 -8 0 -26 Z`);
      }
    };
  }
  // boca genérica: fechada (sorriso/bico) ou aberta pela energia da voz
  const MOUTH = '#7a1f2b';
  function makeMouth(parent, cx, cy, w) {
    const m = dyn(parent, { 'stroke-width': 5, fill: 'none' });
    const tongue = WB.mk('path', { d: '', fill: '#f472b6', stroke: BK, 'stroke-width': 4, opacity: 0 }, parent);
    const fangs = WB.mk('path', { d: '', fill: '#ffffff', stroke: BK, 'stroke-width': 3, opacity: 0 }, parent);
    return function (op, smile, o = {}) {
      const kiss = o.kiss || 0;
      if (kiss > 0.3) {
        m.setAttribute('fill', '#e11d48');
        m.setAttribute('d', ellipse(cx + w * 0.1, cy, w * 0.22, w * 0.18));
        tongue.setAttribute('opacity', 0); fangs.setAttribute('opacity', 0);
        return;
      }
      const hs = o.hiss || 0, open = Math.max(op, hs);
      if (open < 0.06) {
        m.setAttribute('fill', 'none');
        m.setAttribute('d', `M ${r1(cx - w / 2)} ${cy} Q ${cx} ${r1(cy + smile * 1.6)} ${r1(cx + w / 2)} ${cy}`);
      } else {
        const rx = w / 2 * (1 - 0.15 * op + 0.5 * hs), top = cy - 3 - 5 * open + Math.max(0, smile) * 0.25, bot = cy + 6 + w * 0.9 * open + Math.max(0, smile) * 0.5;
        m.setAttribute('fill', MOUTH);
        m.setAttribute('d', `M ${r1(cx - rx)} ${cy} Q ${cx} ${r1(2 * top - cy)} ${r1(cx + rx)} ${cy} Q ${cx} ${r1(2 * bot - cy)} ${r1(cx - rx)} ${cy} Z`);
      }
      const tg = o.tongue || 0;
      tongue.setAttribute('opacity', tg > 0.02 ? 1 : 0);
      if (tg > 0.02) tongue.setAttribute('d', `M ${r1(cx - w * 0.22)} ${r1(cy + 2)} L ${r1(cx - w * 0.22)} ${r1(cy + 10 + 30 * tg)} Q ${cx} ${r1(cy + 26 + 36 * tg)} ${r1(cx + w * 0.22)} ${r1(cy + 10 + 30 * tg)} L ${r1(cx + w * 0.22)} ${r1(cy + 2)} Z`);
      fangs.setAttribute('opacity', hs > 0.2 ? 1 : 0);
      if (hs > 0.2) {
        const rx = w / 2 * 1.4, y0 = cy - 4 - 5 * hs;
        fangs.setAttribute('d', `M ${r1(cx - rx * 0.6)} ${r1(y0 + 2)} l 8 22 l 8 -22 Z M ${r1(cx + rx * 0.6 - 16)} ${r1(y0 + 2)} l 8 22 l 8 -22 Z`);
      }
    };
  }
  function blinkAt(t, off, every = 3.1) {
    let v = 0;
    const k0 = Math.floor((t - off) / every);
    for (let k = k0 - 1; k <= k0 + 1; k++) {
      const tb = off + k * every + 0.7 * Math.sin(k * 1.9), d = Math.abs(t - tb);
      if (d < 0.08) v = Math.max(v, 1 - d / 0.08);
    }
    return v;
  }
  // humor: trilha [[t,'nome'],...] -> parâmetros interpolados (transição de 0,22 s)
  function moodTrack(MOODS, TL) {
    const names = new Set(); Object.values(MOODS).forEach(m => Object.keys(m).forEach(k => names.add(k)));
    return t => {
      let i = 0;
      while (i + 1 < TL.length && TL[i + 1][0] <= t) i++;
      const cur = MOODS[TL[i][1]], prev = MOODS[TL[Math.max(0, i - 1)][1]];
      const u = i === 0 ? 1 : eio(clamp((t - TL[i][0]) / 0.22));
      const s = {};
      for (const k of names) s[k] = lerp(prev[k] || 0, cur[k] || 0, u);
      return s;
    };
  }
  // transforma ponto local -> mundo (translate, rotate, scale)
  const tf = (x, y, rot, sx, sy) => (lx, ly) => {
    const ax = lx * sx, ay = ly * sy, c = Math.cos(rot * DEG), s = Math.sin(rot * DEG);
    return [x + ax * c - ay * s, y + ax * s + ay * c];
  };

  // =====================================================================
  // RIG: A DONA (cabelo branco, vestido amarelo, braços e pernas finos)
  // origem = quadril; pés em y +205 (no chão: y = piso - 205*s)
  // =====================================================================
  const W_SKIN = '#fde9d6', W_HAIR = '#f7f2e4', W_DRESS = '#f6c22f';
  const W_MOODS = {
    neutral: { lid: 0.1, smile: 3 },
    happy: { lid: 0, smile: 14, bi: -6, bo: -4, sparkle: 1 },
    joy: { happy: 1, smile: 16, bi: -8, bo: -6, blush: 1 },
    awkward: { lid: 0.2, smile: -3, bi: -9, bo: 2, px: 7, sweat: 1 },
    shock: { lid: 0, pr: 0.6, bi: -14, bo: -10, smile: -8 },
    annoyed: { lid: 0.55, smile: -5, bi: 8, bo: -3, px: -4 },
    stubborn: { lid: 0.35, bi: 12, bo: -6, smile: -9 },
    confused: { lid: 0.08, bi: -10, smile: -4, asym: 1, px: 6, py: -3 },
    dismiss: { lid: 0.55, smile: 7, py: -7, px: -4 },
    strain: { lid: 0.72, bi: 10, bo: -4, smile: -10, sweat: 1 },
    sheepish: { lid: 0.15, smile: 9, bi: -9, px: 7, blush: 1 },
    calm: { lid: 0.93, smile: 4, bi: -2 },
    proud: { lid: 0.3, smile: 12, bi: -4, py: -3 },
    tired: { lid: 0.6, smile: -2, bi: -6, bo: 4 },
  };
  function makeWoman(parent) {
    const g = WB.mk('g', {}, parent);
    const legs = WB.mk('g', {}, g);
    const legL = dyn(legs, { 'stroke-width': 10 }), legR = dyn(legs, { 'stroke-width': 10 });
    const shoeL = WB.mk('path', { d: '', fill: '#ef4444', stroke: BK, 'stroke-width': 5 }, legs);
    const shoeR = WB.mk('path', { d: '', fill: '#ef4444', stroke: BK, 'stroke-width': 5 }, legs);
    const upper = WB.mk('g', {}, g);
    const hairBackG = WB.mk('g', {}, upper);
    const armBack = WB.mk('g', {}, upper);
    const aBo = dyn(armBack, { 'stroke-width': 17 }), aBi = dyn(armBack, { stroke: W_SKIN, 'stroke-width': 8 });
    const handBack = WB.mk('g', {}, armBack);
    WB.mk('circle', { cx: 0, cy: 0, r: 12, fill: W_SKIN, stroke: BK, 'stroke-width': 5 }, handBack);
    const itemBack = WB.mk('g', {}, handBack);
    WB.mk('path', { d: 'M -12 -262 L -12 -226 L 12 -226 L 12 -262 Z', fill: W_SKIN, stroke: BK, 'stroke-width': 5 }, upper);
    const dress = WB.mk('path', { d: 'M -46 -232 Q 0 -246 46 -232 Q 64 -110 90 18 Q 0 36 -90 18 Q -64 -110 -46 -232 Z', fill: W_DRESS, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, upper);
    dyn(upper, { d: 'M -30 -236 Q 0 -214 30 -236', 'stroke-width': 4 });
    // cabeça
    const head = WB.mk('g', {}, upper);
    WB.mk('path', { d: WB.cloudPath(0, 22, 138, 128, 15), fill: W_HAIR, stroke: BK, 'stroke-width': 6 }, hairBackG);
    const hairBackFollow = hairBackG.firstChild;
    WB.mk('path', { d: ellipse(0, 0, 100, 96), fill: W_SKIN, stroke: BK, 'stroke-width': 6 }, head);
    const blush = WB.mk('g', { opacity: 0 }, head);
    WB.mk('path', { d: ellipse(-58, 34, 16, 9), fill: '#fca5a5' }, blush); WB.mk('path', { d: ellipse(58, 34, 16, 9), fill: '#fca5a5' }, blush);
    const eyeL = makeEye(head, -38, -2, 25, 30, W_SKIN, { prx: 7.5, browW: 5 });
    const eyeR = makeEye(head, 38, -2, 25, 30, W_SKIN, { prx: 7.5, browW: 5 });
    dyn(head, { d: 'M -2 22 Q -8 34 2 36', 'stroke-width': 4 });
    const mouth = makeMouth(head, 0, 58, 40);
    const sweat = WB.mk('path', { d: 'M 92 -50 q -14 24 0 36 q 14 -12 0 -36 Z', fill: '#93c5fd', stroke: BK, 'stroke-width': 4, opacity: 0 }, head);
    WB.mk('path', { d: 'M -104 -10 Q -112 -112 0 -116 Q 112 -112 104 -10 Q 86 -64 52 -58 Q 30 -86 0 -66 Q -30 -86 -52 -58 Q -86 -64 -104 -10 Z', fill: W_HAIR, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, head);
    dyn(head, { d: 'M -60 -96 q 12 10 6 26 M 20 -104 q 14 10 8 26', 'stroke-width': 4, stroke: '#a8a29e' });
    // braço da frente (por cima do vestido)
    const armFront = WB.mk('g', {}, upper);
    const aFo = dyn(armFront, { 'stroke-width': 17 }), aFi = dyn(armFront, { stroke: W_SKIN, 'stroke-width': 8 });
    const handFront = WB.mk('g', {}, armFront);
    const itemFront = WB.mk('g', {}, handFront);
    WB.mk('circle', { cx: 0, cy: 0, r: 12, fill: W_SKIN, stroke: BK, 'stroke-width': 5 }, handFront);
    const SH = [[-44, -222], [44, -222]];
    const REST = { L: [-60, -66], R: [60, -66] };
    let world = null;
    const rig = {
      g, itemBack, itemFront,
      // st: x, y, s, f, lean, headRot, mood, L, R (alvos das mãos, locais), walk (fase), wamp, op, look
      update(t, st) {
        const s = st.s || 1, f = st.f || 1, lean = st.lean || 0;
        const ph = st.walk || 0, wa = st.wamp || 0;
        const breath = Math.sin(t * 2.3 + (st.seed || 0));
        const bob = -Math.abs(Math.cos(ph)) * 7 * wa + (st.hop || 0);
        g.setAttribute('transform', `translate(${r1(st.x)} ${r1(st.y + bob * s)}) scale(${r1(s * f * 1000) / 1000} ${s})`);
        // pernas (pés amarrados ao passo)
        const fl = Math.sin(ph) * 36 * wa, fr = -fl;
        const ll = Math.max(0, Math.cos(ph)) * 22 * wa, lr = Math.max(0, -Math.cos(ph)) * 22 * wa;
        const sp = st.spread || 0;
        legL.setAttribute('d', `M -22 14 L ${r1(-30 - sp + fl)} ${r1(205 - ll - bob)}`);
        legR.setAttribute('d', `M 22 14 L ${r1(30 + sp + fr)} ${r1(205 - lr - bob)}`);
        shoeL.setAttribute('d', ellipse(r1(-24 - sp + fl), r1(207 - ll - bob), 22, 11));
        shoeR.setAttribute('d', ellipse(r1(36 + sp + fr), r1(207 - lr - bob), 22, 11));
        upper.setAttribute('transform', `rotate(${r1(lean)} 0 10) translate(0 ${r1(breath * 1.6)}) scale(1 ${(1 + breath * 0.008).toFixed(4)})`);
        // braços: IK com polo para fora
        const swing = Math.sin(ph) * 26 * wa;
        const tL = st.L || [REST.L[0] - swing, REST.L[1]], tR = st.R || [REST.R[0] + swing, REST.R[1]];
        const aL = ik(SH[0][0], SH[0][1], tL[0], tL[1], 84, 84, [-200, -150]);
        const aR = ik(SH[1][0], SH[1][1], tR[0], tR[1], 84, 84, [200, -150]);
        const dL = `M ${SH[0][0]} ${SH[0][1]} L ${r1(aL.el[0])} ${r1(aL.el[1])} L ${r1(aL.h[0])} ${r1(aL.h[1])}`;
        const dR = `M ${SH[1][0]} ${SH[1][1]} L ${r1(aR.el[0])} ${r1(aR.el[1])} L ${r1(aR.h[0])} ${r1(aR.h[1])}`;
        aBo.setAttribute('d', dL); aBi.setAttribute('d', dL); aFo.setAttribute('d', dR); aFi.setAttribute('d', dR);
        handBack.setAttribute('transform', `translate(${r1(aL.h[0])} ${r1(aL.h[1])}) rotate(${r1(st.rotL || 0)})`);
        handFront.setAttribute('transform', `translate(${r1(aR.h[0])} ${r1(aR.h[1])}) rotate(${r1(st.rotR || 0)})`);
        // cabeça: inclinação + balanço com a fala + cabelo atrasado (secundário)
        const op = st.op || 0;
        const hr = (st.headRot || 0) + Math.sin(t * 1.4 + (st.seed || 0)) * 1.5 + op * Math.sin(t * 11) * 2.5;
        const hb = -op * 5;
        head.setAttribute('transform', `translate(0 -240) rotate(${r1(hr)}) translate(0 ${r1(-110 + hb)})`);
        hairBackFollow.setAttribute('transform', `translate(0 -240) rotate(${r1(hr * 0.7 - lean * 0.15 + Math.sin(ph) * 2 * wa)}) translate(0 ${r1(-106 + hb * 0.6)})`);
        const m = st.mood;
        const b = blinkAt(t, (st.seed || 0) + 0.4);
        const pe = Object.assign({}, m, { lid: Math.max(m.lid || 0, b), px: (m.px || 0) + (st.look || 0), py: (m.py || 0) + (st.lookY || 0) });
        eyeL(pe, -1, t); eyeR(pe, 1, t);
        mouth(op, m.smile || 0, { kiss: 0 });
        blush.setAttribute('opacity', (m.blush || 0).toFixed(2));
        sweat.setAttribute('opacity', (m.sweat || 0).toFixed(2));
        sweat.setAttribute('transform', `translate(0 ${r1((t * 34) % 30)})`);
        world = tf(st.x, st.y + bob * s, 0, s * f, s);
        const leanP = (p) => { const c = Math.cos(lean * DEG), sn = Math.sin(lean * DEG), y = p[1] - 10; return [p[0] * c - y * sn, p[0] * sn + y * c + 10]; };
        rig.handR = world(...leanP(aR.h)); rig.handL = world(...leanP(aL.h));
        rig.face = world(...leanP([0, -350]));
      },
    };
    return rig;
  }
  // passo amarrado ao deslocamento: fase e amplitude a partir de uma trilha x(t)
  const stride = (X, s = 1, len = 64) => t => ({ walk: Math.abs(X(t) - X(0)) / (len * s) * Math.PI, wamp: clamp(Math.abs(X(t + 0.05) - X(t - 0.05)) / 0.1 / (140 * s)) });

  // =====================================================================
  // RIG: BIDU (salsicha laranja, orelhas compridas). Origem = quadril traseiro.
  // O corpo sai do quadril ao longo da "espinha" (ângulo sp) com comprimento L.
  // Em pé no chão: y = piso - 70*s.
  // =====================================================================
  const D_COL = '#e8833a', D_DARK = '#c1632a', D_EAR = '#b85a24';
  const D_MOODS = {
    normal: { lid: 0.05, smile: 4 },
    happy: { happy: 1, smile: 12 },
    big: { pr: 1.6, sparkle: 1, bi: -8, smile: 6 },
    sus: { lid: 0.55, bi: 9, bo: -4, px: -3, smile: -4 },
    sad: { lid: 0.2, bi: -12, bo: 6, py: 3, tear: 0.6, smile: -8, pr: 1.3, sparkle: 1 },
    cry: { lid: 0.3, bi: -14, bo: 8, tear: 1, smile: -10 },
    shock: { pr: 0.55, bi: -15, bo: -10, smile: -8 },
    panic: { pr: 0.5, bi: -16, bo: -6, smile: -10, tear: 0.4 },
    beg: { pr: 1.75, sparkle: 1, bi: -14, bo: 6, smile: -4, tear: 0.3 },
    love: { pr: 1.4, sparkle: 1, smile: 12, bi: -6 },
  };
  function makeDog(parent) {
    const g = WB.mk('g', {}, parent);
    const tail = dyn(g, { 'stroke-width': 26 }), tailIn = dyn(g, { stroke: D_COL, 'stroke-width': 15 });
    const legsB = [0, 1].map(() => [dyn(g, { 'stroke-width': 26 }), dyn(g, { stroke: D_DARK, 'stroke-width': 15 })]);
    const earB = WB.mk('path', { d: '', fill: D_EAR, stroke: BK, 'stroke-width': 5 }, g);
    const body = WB.mk('path', { d: '', fill: D_COL, stroke: BK, 'stroke-width': 6 }, g);
    const belly = WB.mk('path', { d: '', fill: '#f4b27a', stroke: 'none' }, g);
    const legsF = [0, 1].map(() => [dyn(g, { 'stroke-width': 26 }), dyn(g, { stroke: D_COL, 'stroke-width': 15 })]);
    const head = WB.mk('g', {}, g);
    WB.mk('path', { d: ellipse(0, 0, 44, 40), fill: D_COL, stroke: BK, 'stroke-width': 6 }, head);
    WB.mk('path', { d: 'M 10 -6 Q 60 -18 98 0 Q 108 18 94 30 Q 50 40 12 30 Z', fill: D_COL, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, head);
    const mouth = makeMouth(head, 62, 30, 46);
    WB.mk('path', { d: ellipse(100, 6, 13, 11), fill: '#1c1917', stroke: BK, 'stroke-width': 3 }, head);
    const eye = makeEye(head, 2, -12, 17, 20, D_COL, { prx: 6.5, browW: 6 });
    const blushD = WB.mk('path', { d: ellipse(30, 18, 12, 7), fill: '#f87171', opacity: 0 }, head);
    const earF = WB.mk('path', { d: '', fill: D_EAR, stroke: BK, 'stroke-width': 5 }, g);
    const legEnd = (el, x0, y0, x1, y1) => { const d = `M ${r1(x0)} ${r1(y0)} L ${r1(x1)} ${r1(y1)}`; el[0].setAttribute('d', d); el[1].setAttribute('d', d); };
    const earPath = (bx, by, ang, len, wd) => {
      const c = Math.cos(ang), s = Math.sin(ang), nx = -s, ny = c;
      const tx = bx + c * len, ty = by + s * len;
      return `M ${r1(bx + nx * wd * 0.4)} ${r1(by + ny * wd * 0.4)} Q ${r1(bx + c * len * 0.5 + nx * wd)} ${r1(by + s * len * 0.5 + ny * wd)} ${r1(tx)} ${r1(ty)} Q ${r1(bx + c * len * 0.5 - nx * wd)} ${r1(by + s * len * 0.5 - ny * wd)} ${r1(bx - nx * wd * 0.4)} ${r1(by - ny * wd * 0.4)} Z`;
    };
    const rig = {
      g,
      // st: x,y,s,f,rot, L, sp (graus, negativo levanta a frente), run (fase), ramp, wag, ear (0 caída..1 em pé), earFlap,
      //     headRot, mood, op, tongue, kiss, sq (squash), legsUp (patas da frente pra cima), hindHide
      update(t, st) {
        const s = st.s || 1, f = st.f || 1, L = st.L || 190, sp = (st.sp || 0) * DEG, sq = st.sq || 0;
        g.setAttribute('transform', `translate(${r1(st.x)} ${r1(st.y)}) rotate(${r1(st.rot || 0)}) scale(${r1(s * f * (1 + sq * 0.25) * 1000) / 1000} ${r1(s * (1 - sq * 0.25) * 1000) / 1000})`);
        const breath = Math.sin(t * 3.1 + 1) * 2;
        const c = Math.cos(sp), sn = Math.sin(sp);
        // espinha: quadril (0,0) -> ombro (L·cos, L·sin)
        const Fx = L * c, Fy = L * sn;
        const half = 36 + breath * 0.5;
        const nx = -sn, ny = c;
        // corpo = cápsula ao longo da espinha
        const p = (u, v) => `${r1(u * c + v * nx)} ${r1(u * sn + v * ny)}`;
        body.setAttribute('d', `M ${p(-30, -half)} L ${p(L + 20, -half)} Q ${p(L + 60, -half)} ${p(L + 60, 0)} Q ${p(L + 60, half)} ${p(L + 20, half)} L ${p(-30, half)} Q ${p(-70, half)} ${p(-70, 0)} Q ${p(-70, -half)} ${p(-30, -half)} Z`);
        belly.setAttribute('d', `M ${p(0, half - 6)} L ${p(L, half - 6)} Q ${p(L + 20, half - 18)} ${p(L, half - 22)} L ${p(0, half - 22)} Q ${p(-20, half - 16)} ${p(0, half - 6)} Z`);
        // rabo (abana)
        const wagA = Math.sin(t * (st.wag || 6)) * (st.wag ? 38 : 10) * DEG;
        const bx = -60 * c, by = -60 * sn - 10;
        const ta = sp - 2.2 + wagA;
        const tx = bx + Math.cos(ta) * 80, ty = by + Math.sin(ta) * 80;
        const td = `M ${r1(bx)} ${r1(by)} Q ${r1(bx + Math.cos(ta + 0.5) * 50)} ${r1(by + Math.sin(ta + 0.5) * 50)} ${r1(tx)} ${r1(ty)}`;
        tail.setAttribute('d', td); tailIn.setAttribute('d', td);
        // pernas: traseiras no chão (y 70), dianteiras saem do peito; corrida = balanço
        const ph = st.run || 0, ra = st.ramp || 0;
        const sw = (o) => Math.sin(ph + o) * 34 * ra, lf = (o) => Math.max(0, Math.cos(ph + o)) * 16 * ra;
        legEnd(legsB[0], -20, 18, -36 + sw(0), 70 - lf(0));
        legEnd(legsB[1], 18 * c, 18, 6 + sw(Math.PI), 70 - lf(Math.PI));
        const up = Math.max(st.legsUp || 0, clamp((-(st.sp || 0) - 20) / 25));
        const fx0 = Fx - 8 * c, fy0 = Fy + 22;
        const flail = (st.flail || 0) * Math.sin(t * 26) * 30;
        for (let k = 0; k < 2; k++) {
          const o = k ? Math.PI * 0.6 : Math.PI * 1.6;
          const gx = lerp(fx0 + 6 + sw(o) - k * 26, fx0 + 46 + flail * (k ? 1 : -1), up);
          const gy = lerp(Math.max(fy0 + 50, 70) - lf(o), fy0 + 10 - 30 * up + flail * (k ? -0.5 : 0.5), up);
          legEnd(legsF[k], fx0 - k * 24 * c, fy0 - k * 6, gx, gy);
        }
        // cabeça na frente do ombro
        const op = st.op || 0;
        const hx = Fx + 52 * c + 30 * sn, hy = Fy + 52 * sn - 30 * c - 14;
        const hr = (st.headRot || 0) + sp / DEG * 0.35 + op * Math.sin(t * 13) * 4 + Math.sin(t * 1.7) * 2;
        head.setAttribute('transform', `translate(${r1(hx)} ${r1(hy)}) rotate(${r1(hr)})`);
        const m = st.mood;
        const b = blinkAt(t, 1.1, 2.8);
        eye(Object.assign({}, m, { lid: Math.max(m.lid || 0, b) }), 1, t);
        mouth(op, m.smile || 0, { tongue: st.tongue || 0, kiss: st.kiss || 0 });
        blushD.setAttribute('opacity', (m.sparkle || 0) * 0.8);
        // orelhas compridas: base no alto da cabeça, ângulo entre "em pé" e "caída" + balanço secundário
        const hrr = hr * DEG;
        const base = (dx, dy) => [hx + dx * Math.cos(hrr) - dy * Math.sin(hrr), hy + dx * Math.sin(hrr) + dy * Math.cos(hrr)];
        const eu = st.ear ?? 1;
        const flap = (st.earFlap || 0) * Math.sin(t * 9) * 0.35 + Math.sin(t * 2.3) * 0.06;
        const angF = hrr + lerp(1.9, -1.75, eu) + flap, angB = hrr + lerp(2.1, -1.95, eu) - flap * 0.8;
        const [b1x, b1y] = base(-14, -30), [b2x, b2y] = base(-26, -24);
        earF.setAttribute('d', earPath(b1x, b1y, angF, 118, 22));
        earB.setAttribute('d', earPath(b2x, b2y, angB, 112, 20));
        const W2 = tf(st.x, st.y, st.rot || 0, s * f, s);
        rig.snout = W2(hx + 100 * Math.cos(hrr), hy + 100 * Math.sin(hrr));
        rig.mouthW = W2(hx + 62 * Math.cos(hrr) - 34 * Math.sin(hrr), hy + 62 * Math.sin(hrr) + 34 * Math.cos(hrr));
        rig.headW = W2(hx, hy);
      },
    };
    return rig;
  }

  // =====================================================================
  // RIG: BARTOLOMEU (gato lilás, cara de tédio). Origem = chão sob o corpo.
  // =====================================================================
  const C_COL = '#c9a3f2', C_LIGHT = '#e6d3fb', C_DARK = '#a77fe0';
  const C_MOODS = {
    bored: { lid: 0.5, smile: -1, px: 2 },
    lick: { lid: 0.85, smile: 0 },
    roll: { lid: 0.32, py: -15, smile: -3, bi: -4 },
    smug: { lid: 0.55, smile: 8, bi: 4 },
    angry: { lid: 0.15, bi: 16, bo: -8, smile: -6, pr: 0.7 },
    disgust: { lid: 0.62, py: 9, smile: -7, bi: 6, asym: 1 },
    happy: { happy: 1, smile: 12 },
    deadpan: { lid: 0.62, smile: -2, bi: 4 },
    shock: { pr: 0.55, bi: -12, bo: -8, smile: -6 },
    greedy: { lid: 0.1, pr: 1.5, sparkle: 1, smile: 6, bi: -6 },
    effort: { lid: 0.7, bi: 12, smile: -8 },
  };
  function spikes(cx, cy, rx, ry, n, k) {
    let d = '';
    for (let i = 0; i <= n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? 1 : k;
      d += (i ? ' L ' : 'M ') + r1(cx + Math.cos(a) * rx * rr) + ' ' + r1(cy + Math.sin(a) * ry * rr);
    }
    return d + ' Z';
  }
  function makeCat(parent) {
    const g = WB.mk('g', {}, parent);
    const inner = WB.mk('g', {}, g);
    const tailO = dyn(inner, { 'stroke-width': 32 }), tailI = dyn(inner, { stroke: C_COL, 'stroke-width': 20 });
    const fur = WB.mk('path', { d: spikes(0, -120, 112, 112, 16, 1.28) + ' ' + spikes(0, -262, 112, 92, 16, 1.3), fill: C_COL, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round', opacity: 0 }, inner);
    const armB = [dyn(inner, { 'stroke-width': 30 }), dyn(inner, { stroke: C_DARK, 'stroke-width': 19 })];
    const pawB = WB.mk('circle', { r: 17, fill: C_DARK, stroke: BK, 'stroke-width': 5 }, inner);
    const bodyG = WB.mk('g', {}, inner);
    WB.mk('path', { d: 'M -80 -4 Q -102 -122 -50 -180 Q 0 -200 50 -180 Q 102 -122 80 -4 Q 0 12 -80 -4 Z', fill: C_COL, stroke: BK, 'stroke-width': 6 }, bodyG);
    WB.mk('path', { d: ellipse(0, -78, 44, 58), fill: C_LIGHT, stroke: 'none' }, bodyG);
    const feet = [-48, 48].map(x => WB.mk('path', { d: ellipse(x, -6, 34, 16), fill: C_COL, stroke: BK, 'stroke-width': 5 }, inner));
    const head = WB.mk('g', {}, inner);
    WB.mk('path', { d: 'M -82 -24 L -74 -116 L -22 -66 Z M 82 -24 L 74 -116 L 22 -66 Z', fill: C_COL, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, head);
    WB.mk('path', { d: 'M -70 -40 L -66 -94 L -36 -64 Z M 70 -40 L 66 -94 L 36 -64 Z', fill: '#f9a8d4', stroke: 'none' }, head);
    WB.mk('path', { d: ellipse(0, 0, 92, 74), fill: C_COL, stroke: BK, 'stroke-width': 6 }, head);
    const eyeL = makeEye(head, -34, -8, 25, 28, C_COL, { prx: 8, pry: 14, browW: 6 });
    const eyeR = makeEye(head, 34, -8, 25, 28, C_COL, { prx: 8, pry: 14, browW: 6 });
    WB.mk('path', { d: 'M -9 22 L 9 22 L 0 32 Z', fill: '#f472b6', stroke: BK, 'stroke-width': 3, 'stroke-linejoin': 'round' }, head);
    dyn(head, { d: 'M -46 30 L -100 22 M -46 38 L -98 44 M 46 30 L 100 22 M 46 38 L 98 44', 'stroke-width': 3 });
    const mouth = makeMouth(head, 0, 40, 34);
    const armF = [dyn(inner, { 'stroke-width': 30 }), dyn(inner, { stroke: C_COL, 'stroke-width': 19 })];
    const pawF = WB.mk('g', {}, inner);
    WB.mk('circle', { r: 18, fill: C_COL, stroke: BK, 'stroke-width': 5 }, pawF);
    const pawItem = WB.mk('g', {}, pawF);
    const SHC = [[-50, -150], [50, -150]];
    const rig = {
      g, pawItem,
      // st: x,y,s,f, lean, puff, mood, op, hiss, tongue, tail (amp), tailSpd, L/R (alvos das patas), headRot, hop, tremble, sq
      update(t, st) {
        const s = st.s || 1, f = st.f || 1, puff = st.puff || 0;
        const tr = st.tremble || 0;
        const jx = tr * Math.sin(t * 61) * 5, jy = tr * Math.sin(t * 47) * 3;
        const sq = st.sq || 0;
        g.setAttribute('transform', `translate(${r1(st.x + jx)} ${r1(st.y - (st.hop || 0) + jy)}) scale(${r1(s * f * (1 + sq * 0.2) * 1000) / 1000} ${r1(s * (1 - sq * 0.2) * 1000) / 1000})`);
        const breath = Math.sin(t * 2.0 + 2);
        inner.setAttribute('transform', `rotate(${r1(st.lean || 0)} 0 0)`);
        bodyG.setAttribute('transform', `translate(0 ${r1(-breath * 1.5)}) scale(${(1 + puff * 0.06).toFixed(3)} ${(1 + breath * 0.01).toFixed(4)})`);
        fur.setAttribute('opacity', clamp(puff * 1.5).toFixed(2));
        fur.setAttribute('transform', `translate(0 -160) scale(${(0.8 + 0.25 * puff).toFixed(3)}) translate(0 160)`);
        // rabo sinuoso
        const amp = st.tail ?? 0.35, spd = st.tailSpd || 2.2;
        let x = -70, y = -22, a = Math.PI * 1.0 + (puff ? 0 : 0), d = `M ${x} ${y}`;
        for (let i = 1; i <= 11; i++) {
          a += -0.21 + Math.sin(t * spd - i * 0.55) * amp * 0.24 * (i / 11) * 2;
          const L = 17 * (1 + puff * 0.1);
          const nx = x + Math.cos(a) * L, ny = y + Math.sin(a) * L;
          d += ` Q ${r1(x + Math.cos(a) * L * 0.5)} ${r1(y + Math.sin(a) * L * 0.5)} ${r1(nx)} ${r1(ny)}`;
          x = nx; y = ny;
        }
        tailO.setAttribute('d', d); tailI.setAttribute('d', d);
        tailO.setAttribute('stroke-width', r1(32 + puff * 22)); tailI.setAttribute('stroke-width', r1(20 + puff * 22));
        // patas (IK)
        const tL = st.L || [-58, -64], tR = st.R || [58, -64];
        const aL = ik(SHC[0][0], SHC[0][1], tL[0], tL[1], 60, 62, [-160, -110]);
        const aR = ik(SHC[1][0], SHC[1][1], tR[0], tR[1], 60, 62, [160, -110]);
        const dL = `M ${SHC[0][0]} ${SHC[0][1]} L ${r1(aL.el[0])} ${r1(aL.el[1])} L ${r1(aL.h[0])} ${r1(aL.h[1])}`;
        const dR = `M ${SHC[1][0]} ${SHC[1][1]} L ${r1(aR.el[0])} ${r1(aR.el[1])} L ${r1(aR.h[0])} ${r1(aR.h[1])}`;
        armB.forEach(e => e.setAttribute('d', dL)); armF.forEach(e => e.setAttribute('d', dR));
        pawB.setAttribute('cx', r1(aL.h[0])); pawB.setAttribute('cy', r1(aL.h[1]));
        pawF.setAttribute('transform', `translate(${r1(aR.h[0])} ${r1(aR.h[1])}) rotate(${r1(st.rotR || 0)})`);
        // cabeça
        const op = st.op || 0;
        const hr = (st.headRot || 0) + Math.sin(t * 1.2 + 0.5) * 2 + op * Math.sin(t * 10) * 3;
        head.setAttribute('transform', `translate(0 ${r1(-252 - breath * 2 - op * 4)}) rotate(${r1(hr)}) scale(${(1 + puff * 0.06).toFixed(3)})`);
        const m = st.mood;
        const b = blinkAt(t, 0.3, 3.6);
        const pe = Object.assign({}, m, { lid: Math.max(m.lid || 0, b), px: (m.px || 0) + (st.look || 0), py: (m.py || 0) + (st.lookY || 0) });
        eyeL(pe, -1, t); eyeR(pe, 1, t);
        mouth(op, m.smile || 0, { hiss: st.hiss || 0, tongue: st.tongue || 0 });
        const W3 = tf(st.x, st.y - (st.hop || 0), 0, s * f, s);
        const lr = (p) => { const c = Math.cos((st.lean || 0) * DEG), sn = Math.sin((st.lean || 0) * DEG); return [p[0] * c - p[1] * sn, p[0] * sn + p[1] * c]; };
        rig.pawR = W3(...lr(aR.h)); rig.pawL = W3(...lr(aL.h));
      },
    };
    return rig;
  }

  // ---------------- objetos que as mãos seguram ----------------
  function bagShape(c = '#a3c47a') {
    return [{ d: 'M -20 0 Q 0 -30 20 0', w: 6 }, { d: 'M -44 0 L 44 0 L 36 110 L -36 110 Z', fill: c, w: 6 },
      { d: 'M -10 0 L -24 -40 M 6 0 L 12 -46 M 14 -40 q 8 -10 16 0', c: '#16a34a', w: 7 }, { d: 'M -30 50 L 30 50', c: '#6b8e4e', w: 4 }];
  }
  function bowl(c) { return [{ d: 'M -62 -20 L 62 -20 L 48 22 L -48 22 Z', fill: c, w: 6 }, { d: ellipse(0, -20, 62, 12), fill: '#fef3c7', w: 5 }, { d: 'M -40 -24 q 10 -12 20 0 q 10 -12 20 0 q 10 -12 20 0', c: '#92400e', w: 6 }]; }
  function plate() { return [{ d: ellipse(0, 0, 80, 20), fill: '#ffffff', w: 6 }, { d: 'M -46 -6 L 46 -6 L 40 -40 L -40 -40 Z', fill: '#fbbf24', w: 5 }, { d: 'M -40 -26 L 40 -26', c: '#dc2626', w: 8 }, { d: 'M -40 -40 Q 0 -54 40 -40', c: '#dc2626', w: 6 }]; }
  function mug() { return [{ d: 'M 28 -40 Q 56 -40 56 -16 Q 56 8 28 8', w: 10 }, box(-30, -60, 60, 78, 12, '#22c55e')]; }
  function towel() { return [{ d: 'M -60 -20 L 60 -20 L 66 30 L -66 30 Z', fill: '#f9a8d4', w: 6 }, { d: 'M -60 -6 L 62 -6', c: '#db2777', w: 4 }]; }
  function suitcase(w = 300, h = 190, open = false) {
    return [box(-w / 2, -h, w, h, 18, '#e9c98b', null, 7), { d: `M ${-w / 2 + 10} ${-h * 0.55} L ${w / 2 - 10} ${-h * 0.55}`, c: '#b45309', w: 5 },
      { d: `M -40 ${-h} Q -40 ${-h - 34} 0 ${-h - 34} Q 40 ${-h - 34} 40 ${-h}`, w: 9 },
      box(-w / 2 + 30, -h * 0.55 - 14, 26, 28, 4, '#a16207', null, 4), box(w / 2 - 56, -h * 0.55 - 14, 26, 28, 4, '#a16207', null, 4)];
  }
  function passport() { return [box(-34, -46, 68, 92, 8, '#1e3a8a', null, 5), circ(0, -8, 16, null, '#facc15', 4), { d: 'M -18 26 L 18 26', c: '#facc15', w: 4 }]; }
  function toothbrush() { return [{ d: 'M -60 0 L 40 0', c: '#38bdf8', w: 14 }, box(30, -26, 34, 20, 4, '#ffffff', null, 4), { d: 'M 34 -26 l 0 -10 M 44 -26 l 0 -10 M 54 -26 l 0 -10', c: '#38bdf8', w: 4 }]; }
  function dressItem() { return [{ d: 'M -34 -110 L -24 -80 M 34 -110 L 24 -80', c: '#be185d', w: 6 }, { d: 'M -26 -80 Q 0 -66 26 -80 L 34 -30 Q 20 -20 40 -10 L 90 90 Q 0 110 -90 90 L -40 -10 Q -20 -20 -34 -30 Z', fill: '#f472b6', w: 6 }, { d: 'M -46 0 L 46 0', c: '#be185d', w: 6 }, circ(-20, 30, 8, '#ffffff', 'none'), circ(24, 44, 8, '#ffffff', 'none')]; }
  // item solto que segue uma posição (ex.: mão do personagem) e pode girar
  function holder(specs, parent) {
    const g = WB.mk('g', {}, parent || cont);
    put(specs, g);
    return (x, y, rot = 0, sc = 1, op = 1) => {
      g.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)}) scale(${sc})`);
      g.setAttribute('opacity', op);
    };
  }

  const FL = 1450;     // piso padrão
  const WS = 1.05;     // escala da dona
  const WY = FL - 205 * WS;

  // ---------------- título + legenda (faixa amarela) ----------------
  const FIM_FALAS = 61.6, CTA0 = 62.0;
  const titleG = WB.mk('g', {}, WB.overlay);
  {
    const tw = WB.measure('GATO vs CACHORRO', 84);
    WB.showNow(WB.textStrokes('GATO', 540 - tw / 2, 200, 84, '#7c3aed', titleG, 'start').strokes);
    WB.showNow(WB.textStrokes('vs', 540 - tw / 2 + WB.measure('GATO ', 84), 200, 84, BK, titleG, 'start').strokes);
    WB.showNow(WB.textStrokes('CACHORRO', 540 + tw / 2, 200, 84, '#c2410c', titleG, 'end').strokes);
    WB.showNow(WB.strokePath(WB.wavyLine(540 - tw / 2, 540 + tw / 2, 222, 6, 60), '#f59e0b', 6, titleG));
    WB.effect(t => titleG.setAttribute('opacity', t < CTA0 ? clamp(t / 0.3) : clamp(1 - (t - CTA0) / 0.3)));
  }
  const credit = WB.mk('g', {}, WB.overlay);
  WB.showNow(WB.textStrokes('animação original: @rafaellatuma', 540, 1720, 40, '#78716c', credit, 'middle').strokes);
  WB.effect(t => credit.setAttribute('opacity', t < CTA0 ? 0.9 : 0));
  const capLayer = WB.mk('g', {}, WB.overlay);
  const CAPS = [
    [0.15, 'Cheguei!'], [1.4, 'Ela chegou!'], [2.45, 'Ainda bem que cê chegou!'], [3.7, 'Tava com tanta saudade...'],
    [4.45, 'Achei que cê tinha me abandonado!'], [5.45, 'Eu só fui no mercado.'], [6.2, 'Que cheiro é esse de cachorro?'],
    [7.2, 'Cachorro diferente!'], [7.7, 'Tava dando carinho em outro cachorro?'], [9.2, 'Não importa...'],
    [9.45, 'O que importa é que eu te amo'], [10.7, 'É que você voltou pra mim'], [11.7, 'Eu te amo tanto!'],
    [12.2, 'Cheguei!'], [14.0, 'Ai...'], [14.7, 'Não acredito.'], [16.2, 'Truxe pelo menos alguma coisa pra eu comer?'],
    [17.6, 'Não.'], [18.2, 'Essa comida é minha!'], [19.05, 'HSSSSS!'], [19.75, 'Ó, Bidu...'], [20.7, 'A sua comidinha!'],
    [21.5, 'Pra mim?'], [22.25, 'Sim.'], [22.65, 'Ah, obrigado!'], [23.7, 'Posso te dar um beijo?'], [24.45, 'Não, não...'],
    [25.2, 'É que eu te amo tanto!'], [25.7, 'Só que eu...'], [26.2, 'É que eu preciso!'], [26.7, 'Não, não. Precisa não.'],
    [27.8, 'E essa daqui é do Bartolomeu.'], [29.6, 'Te lascar.'], [31.8, ''],
    [33.4, 'Ué?'], [33.95, 'Que isso, Bidu?'], [34.6, 'Cê vai mesmo? Cê vai viajar?'], [36.4, 'Não, é só um bate-volta.'],
    [37.75, 'E se acontecer alguma coisa com você no meio do caminho?'], [39.7, 'E se você m#rr3r?'],
    [40.7, 'E se eu nunca mais te ver?'], [41.95, 'Para, para, para!'], [43.2, 'Pensa... pensa, por favor!'], [45.1, ''],
    [46.2, 'Pronto, já fiz sua mala.'], [47.2, 'Já tá tudo aqui dentro.'], [47.95, 'Já botei seu vestido favorito'],
    [48.95, 'Sua escova de dente aqui'], [49.7, 'Seu passaporte'], [50.45, 'Vai, vai!'], [50.95, 'Vai que cê muda de ideia!'],
    [51.95, 'Vai, vai, pode ir embora'], [52.95, 'E não volte mais!'], [54.0, ''], [60.45, 'Ainda não foi?'],
  ];
  CAPS.forEach(([t0, text], i) => {
    if (!text) return;
    const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : FIM_FALAS + 0.4;
    const g = WB.mk('g', {}, capLayer);
    const size = 58, lh = 66;
    const lines = WB.wrap(text, size, 860);
    const w = Math.max(...lines.map(l => WB.measure(l, size))) + 64, h = lines.length * lh + 28, y0 = 262;
    WB.mk('rect', { x: r1(540 - w / 2), y: y0, width: r1(w), height: h, rx: 20, fill: '#ffe066', stroke: BK, 'stroke-width': 5 }, g);
    lines.forEach((l, k) => WB.showNow(WB.textStrokes(l, 540, y0 + 60 + k * lh, size, BK, g, 'middle').strokes));
    const rot = i % 2 ? 1.2 : -1.2;
    WB.effect(t => {
      if (t < t0 || t >= t1) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      const k = backOut(clamp((t - t0) / 0.2)) * 0.1 + 0.9;
      g.setAttribute('transform', `translate(540 ${y0 + h / 2}) rotate(${rot}) scale(${k.toFixed(3)}) translate(-540 ${-(y0 + h / 2)})`);
    });
  });

  // chão de caderno: linha do piso com tracinhos
  const floorLine = (y = FL, x0 = 96, x1 = 1060) => [{ d: WB.roughLine(x0, y, x1, y, 2), w: 7 },
    { d: `M ${x0 + 80} ${y + 70} L ${x0 + 260} ${y + 70} M ${x0 + 420} ${y + 110} L ${x0 + 640} ${y + 110} M ${x0 + 720} ${y + 60} L ${x1 - 40} ${y + 60}`, c: '#a8a29e', w: 4 }];

  // =====================================================================
  // CENA 1 (0–12,15): a dona chega, o Bidu pula no colo e fareja outro cachorro
  // =====================================================================
  const S1 = [[0, 12.15]];
  shot(S1);
  put([
    floorLine(),
    // porta aberta à esquerda
    { d: 'M 130 1450 L 130 790 L 400 790 L 400 1450', w: 8 }, { d: 'M 150 1450 L 150 810 L 380 810 L 380 1450', c: '#a8a29e', w: 4 },
    { d: 'M 130 790 L 100 760 L 100 1480 L 130 1450 Z', fill: '#d9f99d', w: 6 },
    // cabideiro e quadro
    { d: 'M 470 700 L 640 700', w: 8 }, { d: 'M 500 700 q 0 30 14 30 M 560 700 q 0 30 14 30 M 620 700 q 0 30 14 30', w: 5 },
    box(780, 620, 170, 130, 8, '#fef3c7', null, 6), { d: 'M 800 730 L 850 670 L 880 700 L 910 660 L 935 730', c: '#16a34a', w: 5 },
    // tapete
    { d: 'M 360 1500 L 760 1500 L 800 1560 L 320 1560 Z', fill: '#fde68a', w: 5, fo: 0.8 },
  ]);
  const w1 = makeWoman(cont);
  const bagL = holder(bagShape(), cont);   // sacola na mão de trás
  const d1 = makeDog(cont);
  // trilhas
  const W1X = K([[0, 210], [1.0, 400, 'o']]);
  const W1st = stride(W1X, WS);
  const W1M = moodTrack(W_MOODS, [[0, 'happy'], [1.5, 'joy'], [5.4, 'awkward'], [6.4, 'awkward'], [7.3, 'shock'], [9.3, 'confused'], [10.7, 'joy']]);
  const W1R = K([[0, [60, -66]], [0.15, [150, -400], 'o'], [1.2, [150, -400]], [1.55, [110, -150], 'o'], [6.6, [110, -150]], [7.0, [70, -80]], [10.5, [70, -80]], [10.85, [112, -150], 'o']]);
  const W1L = K([[0, [-62, -70]], [5.4, [-62, -70]], [5.65, [-80, -150], 'b'], [6.2, [-80, -150]], [6.5, [-62, -70]]]);
  // Bidu: corre (0,5–1,35), pula no colo (1,35–1,9), desce (6,9–7,4), volta pro colo (10,6–11,0)
  const HOLD = [W1X(99) + 120 * WS, WY - 110 * WS];
  const D1X = K([[0, 1180], [0.45, 1180], [1.35, 760, 'l'], [1.9, HOLD[0] - 40, 'o'], [6.9, HOLD[0] - 40], [7.45, 700, 'o'], [10.55, 700], [11.0, HOLD[0] - 40, 'o']]);
  const D1Yb = K([[0, FL - 70], [1.35, FL - 70], [1.9, HOLD[1], 'o'], [6.9, HOLD[1]], [7.45, FL - 70, 'i'], [10.55, FL - 70], [11.0, HOLD[1], 'o']]);
  const jumpArc = t => 260 * bump(t, 1.35, 1.9) + 150 * bump(t, 6.9, 7.45) + 230 * bump(t, 10.55, 11.0);
  const D1Rot = K([[1.35, 0], [1.9, 70, 'o'], [6.9, 70], [7.45, 0, 'o'], [10.55, 0], [11.0, 70, 'o']]);
  const D1M = moodTrack(D_MOODS, [[0, 'love'], [1.4, 'happy'], [3.7, 'sad'], [4.45, 'cry'], [5.4, 'normal'], [6.2, 'sus'], [7.2, 'shock'], [7.7, 'sus'], [9.2, 'sad'], [9.5, 'love'], [10.7, 'happy']]);
  const D1Head = K([[1.9, 0], [6.2, 0], [6.4, 18, 'o'], [6.9, 18], [7.45, 0]]);
  WB.effect(t => {
    if (!inWin(S1, t)) return;
    const wst = W1st(t);
    const squeeze = bump(t, 1.9, 2.3) * 4 + bump(t, 11.0, 11.4) * 4;
    w1.update(t, Object.assign({ x: W1X(t), y: WY, s: WS, f: 1, mood: W1M(t), op: talk(W_WIN, t), R: W1R(t), L: W1L(t),
      lean: -squeeze + (t > 7.2 && t < 9.3 ? -6 : 0) * eio(clamp((t - 7.2) / 0.3)), headRot: t > 1.9 && t < 6.2 ? 6 + Math.sin(t * 7) * 2 : 0, seed: 0.3 }, wst));
    // acena no "Cheguei!"
    if (t < 1.3) w1.update(t, Object.assign({ x: W1X(t), y: WY, s: WS, f: 1, mood: W1M(t), op: talk(W_WIN, t),
      R: [150 + Math.sin(t * 14) * 30, -400], L: W1L(t), seed: 0.3 }, wst));
    bagL(w1.handL[0], w1.handL[1] + 4, Math.sin(t * 3) * 4 + (wst.wamp * Math.sin(wst.walk) * 8));
    // Bidu
    const running = t < 1.35 ? 1 : 0;
    const x = D1X(t), y = D1Yb(t) - jumpArc(t);
    const air = bump(t, 1.35, 1.9) + bump(t, 6.9, 7.45) + bump(t, 10.55, 11.0);
    const land = bump(t, 7.45, 7.7);
    const held = (t > 1.9 && t < 6.9) || t > 11.0;
    const sit = t > 7.6 && t < 10.5 ? eo(clamp((t - 7.5) / 0.3)) : 0;
    d1.update(t, {
      x, y, s: 1.0, f: -1, rot: D1Rot(t) + (held ? Math.sin(t * 5) * 4 : 0) + (t > 9.2 && t < 9.8 ? 0 : 0), L: 190 + air * 30, sp: -55 * sit,
      run: (1180 - Math.min(x, 1180)) / 30, ramp: running, wag: held ? 18 : (t > 9.5 ? 14 : (t < 1.4 ? 16 : 4)), ear: held ? 0.2 : (t < 1.4 ? 0.9 : lerp(0.9, 0.1, sit)),
      earFlap: running + air + (held ? 0.6 : 0), headRot: D1Head(t) + (t > 9.2 && t < 9.9 ? Math.sin((t - 9.2) * 28) * 22 * (1 - (t - 9.2) / 0.7) : 0),
      mood: D1M(t), op: talk(D_WIN, t), tongue: held && t < 5.3 ? 0.6 + 0.4 * Math.sin(t * 9) : 0, sq: land * 0.6 - air * 0.3, legsUp: held ? 0.8 : sit * 0.3,
    });
  });
  // efeitos da cena 1
  P(1.5, confetti(200, 600, 900, 1100, 40, 3), { loop: 'rise', until: 3.2 });
  P(2.6, [heart(700, 760, 1.3)], { loop: 'float', until: 5.3 });
  P(3.0, [heart(780, 880, 0.9, '#f472b6')], { loop: 'float', ph: 0.8, until: 5.3 });
  TX(5.6, 'MERCADO', 200, 1010, 54, '#16a34a', -8, { until: 6.6 });
  P(6.25, [smell(560, 1120), smell(640, 1060)], { loop: 'wiggle', until: 7.4 });
  TX(6.3, 'snif snif', 760, 900, 60, '#65a30d', 6, { loop: 'wiggle', until: 7.2 });
  TX(7.25, '!?', 820, 1060, 140, INK.red, 8, { anim: 'slam', loop: 'shake', until: 9.2 });
  // balão: ela fazendo carinho num poodle
  P(7.8, [...thought(760, 640, 250, 170, [[700, 900, 18], [730, 840, 28]]),
    // poodle branquinho
    cloud(840, 650, 70, 50, '#ffffff', BK), circ(900, 590, 36, '#ffffff', BK, 5), { d: 'M 880 600 l 4 0 M 908 588 l 4 0', w: 6 },
    { d: 'M 820 690 L 820 720 M 870 690 L 870 720', w: 7 },
    // ela (miniatura)
    circ(640, 580, 46, W_SKIN, BK, 5), { d: WB.cloudPath(640, 560, 60, 44), fill: W_HAIR, w: 4 }, { d: 'M 610 630 L 600 720 L 680 720 L 670 630 Z', fill: W_DRESS, w: 5 },
    { d: 'M 670 650 Q 760 620 820 600', w: 6 }, heart(760, 560, 0.5)], { until: 9.35 });
  P(9.0, [{ d: 'M 600 520 L 960 770 M 960 520 L 600 770', c: INK.red, w: 14 }], { anim: 'slam', until: 9.35 });
  P(9.6, [heart(680, 820, 1.0)], { loop: 'rise', until: 11.5 });
  P(11.05, [heart(560, 780, 1.4), heart(700, 700, 0.9, '#f472b6'), heart(430, 720, 0.8)], { loop: 'pulse', until: 12.2 });

  // =====================================================================
  // CENA 2 (12,15–19,9): o Bartolomeu no sofá
  // =====================================================================
  const S2 = [[12.15, 19.9]];
  shot(S2);
  const SEAT = 1210;
  put([
    floorLine(),
    // sofá
    { d: 'M 430 1250 Q 420 980 520 960 L 960 960 Q 1040 980 1030 1250 Z', fill: '#f3a98a', w: 7 },
    { d: 'M 440 1210 L 1020 1210 L 1020 1350 L 440 1350 Z', fill: '#f08f6e', w: 7 },
    { d: 'M 400 1150 Q 380 1110 430 1100 Q 480 1110 470 1170 L 470 1370 L 400 1370 Z', fill: '#f3a98a', w: 7 },
    { d: 'M 1060 1150 Q 1080 1110 1030 1100 Q 980 1110 990 1170 L 990 1370 L 1060 1370 Z', fill: '#f3a98a', w: 7 },
    { d: 'M 460 1370 L 450 1440 M 1040 1370 L 1050 1440', w: 10 },
    { d: 'M 520 1060 Q 560 1010 620 1050 Q 610 1150 520 1140 Z', fill: '#d9f99d', w: 5 },
    // abajur e quadro
    box(200, 640, 200, 150, 8, '#e0f2fe', null, 6), { d: 'M 220 770 Q 300 680 380 770', c: '#0ea5e9', w: 5 }, circ(340, 690, 18, '#fde047', '#f59e0b', 4),
  ]);
  const c2 = makeCat(cont);
  const w2 = makeWoman(cont);
  const plateH = holder(plate(), cont);
  const W2X = K([[12.15, -60], [12.95, 250, 'o']]);
  const W2st = stride(W2X, WS);
  const W2M = moodTrack(W_MOODS, [[12, 'happy'], [14.0, 'confused'], [16.3, 'annoyed'], [17.55, 'stubborn'], [19.05, 'shock']]);
  const W2R = K([[12.15, [60, -66]], [12.25, [150, -400], 'o'], [13.2, [150, -400]], [13.6, [60, -66]], [17.3, [60, -66]], [17.6, [70, -170], 'b'], [18.3, [40, -190], 'o']]);
  const W2L = K([[12.15, [-60, -66]], [17.3, [-60, -66]], [17.6, [-20, -170], 'b'], [18.3, [0, -190], 'o']]);
  const W2lean = K([[18.2, 0], [18.6, -10, 'o'], [19.05, -10], [19.3, -16, 'b']]);
  const C2M = moodTrack(C_MOODS, [[12, 'lick'], [13.2, 'bored'], [13.95, 'roll'], [14.75, 'deadpan'], [16.2, 'greedy'], [17.5, 'disgust'], [18.25, 'angry']]);
  const C2lean = K([[13.9, 0], [14.5, -14, 'io'], [16.1, -14], [16.6, 10, 'b'], [17.4, 10], [17.8, 0]]);
  const C2R = K([[12.15, [40, -230]], [13.3, [40, -230]], [13.7, [58, -64]], [14.75, [58, -64]], [15.1, [30, -330], 'o'], [16.05, [30, -330]], [16.5, [150, -170], 'b'], [17.5, [150, -170]], [17.8, [58, -64]], [19.0, [58, -64]], [19.2, [130, -200], 'b']]);
  const C2L = K([[19.0, [-58, -64]], [19.2, [-130, -200], 'b']]);
  const C2head = K([[12.15, 18], [13.3, 18], [13.8, 0], [14.75, 0], [15.0, -10, 'b'], [16.0, -10], [16.4, 8], [17.5, 0]]);
  WB.effect(t => {
    if (!inWin(S2, t)) return;
    const wst = W2st(t);
    const hiss = t > 19.0 ? 1 : 0;
    w2.update(t, Object.assign({ x: W2X(t), y: WY - bump(t, 19.05, 19.35) * 40, s: WS, f: 1, mood: W2M(t), op: talk(W_WIN, t),
      R: t < 13.3 ? [W2R(t)[0] + Math.sin(t * 13) * 26 * (t > 12.3 ? 1 : 0), W2R(t)[1]] : W2R(t), L: W2L(t), lean: W2lean(t),
      headRot: t > 17.55 && t < 18.2 ? Math.sin((t - 17.55) * 24) * 10 : (t > 16.3 && t < 17.5 ? -6 : 0), seed: 1.1 }, wst));
    const pu = clamp((t - 17.35) / 0.25);
    const mid = [(w2.handR[0] + w2.handL[0]) / 2, (w2.handR[1] + w2.handL[1]) / 2];
    plateH(mid[0], mid[1] - 6, 0, eo(pu), pu > 0 ? 1 : 0);
    // gato: lambe a pata até 13,3
    const licking = t < 13.3;
    const lickPh = Math.sin(t * 7);
    const puff = t > 19.0 ? backOut(clamp((t - 19.0) / 0.25)) : 0;
    c2.update(t, {
      x: 740, y: SEAT, s: 1.0, f: -1, lean: C2lean(t), mood: C2M(t), op: talk(C_WIN, t) * (hiss ? 0 : 1),
      R: licking ? [36 + lickPh * 6, -232 - lickPh * 14] : C2R(t), L: C2L(t), rotR: 0, headRot: C2head(t) + (t > 14.8 && t < 16 ? Math.sin(t * 4) * 6 : 0),
      tongue: licking ? clamp(0.3 + 0.7 * Math.max(0, lickPh)) : 0, tail: 0.35 + puff * 0.8, tailSpd: 2 + puff * 10, puff, hiss: puff * (0.7 + 0.3 * envAt(t)), tremble: puff,
      look: t > 13.3 ? 6 : 0,
    });
  });
  TX(12.5, '...', 860, 880, 90, '#7c3aed', 0, { until: 13.9 });
  P(14.0, [{ d: 'M 820 860 q 30 -40 60 0 q 30 40 60 0', c: '#9ca3af', w: 6 }], { loop: 'rise', until: 14.9 });
  P(16.5, [...thought(820, 650, 190, 130, [[760, 840, 16], [790, 790, 24]]),
    { d: 'M 720 650 Q 800 590 880 650 Q 800 710 720 650 Z M 880 650 L 930 610 L 930 690 Z', fill: '#93c5fd', w: 6 }, circ(760, 640, 6, '#111', 'none'),
    T('?', 960, 610, 90, INK.red)], { until: 17.6 });
  TX(17.65, 'NÃO.', 470, 640, 110, INK.red, -6, { anim: 'slam', until: 18.3 });
  P(19.05, [burst(860, 760, 150, '#fef08a'), T('HSSSS!', 860, 790, 84, INK.red)], { anim: 'slam', loop: 'tremble' });

  // =====================================================================
  // CENA 3 (19,9–28,0): a comidinha do Bidu e o beijo esticado
  // =====================================================================
  const S3 = [[19.9, 27.75]];
  shot(S3);
  put([
    floorLine(),
    { d: 'M 96 1450 L 1060 1450 L 1060 1700 L 96 1700 Z', fill: '#dcfce7', c: 'none', fo: 0.7 },
    { d: 'M 260 1450 L 200 1700 M 480 1450 L 460 1700 M 700 1450 L 720 1700 M 920 1450 L 980 1700 M 96 1560 L 1060 1560', c: '#86efac', w: 4 },
    { d: 'M 96 1000 L 1060 1000', c: '#d6d3d1', w: 5 },
  ]);
  const bowl3 = holder(bowl('#a78bfa'), cont);
  const d3 = makeDog(cont);
  const w3 = makeWoman(cont);
  const W3X = 760;
  const W3M = moodTrack(W_MOODS, [[19.9, 'happy'], [21.5, 'proud'], [23.7, 'awkward'], [24.4, 'annoyed'], [25.2, 'shock'], [25.7, 'annoyed'], [26.2, 'shock'], [26.7, 'stubborn'], [27.5, 'tired']]);
  const W3lean = K([[19.9, 0], [20.2, 28, 'io'], [20.75, 28], [21.1, 0, 'io'], [24.2, 0], [24.5, -12, 'o'], [25.2, -6], [25.35, -16, 'o'], [25.9, -8], [26.25, -22, 'o'], [27.0, -14], [27.4, 0]]);
  // mão: segura a tigela, desce até o chão, solta; depois empurra o focinho do Bidu
  const BOWL_FLOOR = [560, FL - 22];
  const W3R = K([[19.9, [70, -150]], [20.6, [100, 70], 'io'], [20.75, [100, 70]], [21.1, [60, -66]]]);
  // Bidu: entra correndo pela esquerda, para; estica o corpo até o rosto dela 3 vezes
  const D3X = K([[19.9, -260], [20.85, -260], [21.45, 300, 'o']]);
  const D3L = K([[19.9, 190], [24.4, 190], [24.75, 480, 'o'], [25.0, 480], [25.2, 230, 's'], [25.3, 230], [25.55, 500, 'o'], [25.75, 500], [25.95, 230, 's'], [26.15, 230], [26.45, 560, 'o'], [26.75, 560], [27.0, 210, 's']]);
  const D3sp = K([[19.9, 0], [21.5, 0], [21.7, -22, 'b'], [22.6, -22], [22.8, -10], [24.4, -10], [24.75, -46, 'o'], [25.0, -46], [25.2, -18, 's'], [25.3, -18], [25.55, -48, 'o'], [25.75, -48], [25.95, -18, 's'], [26.15, -18], [26.45, -52, 'o'], [26.75, -52], [27.0, -12, 's']]);
  const D3M = moodTrack(D_MOODS, [[19.9, 'normal'], [21.45, 'big'], [22.6, 'happy'], [23.7, 'love'], [24.45, 'shock'], [25.2, 'love'], [25.75, 'shock'], [26.15, 'beg'], [26.75, 'sad']]);
  const kissT = t => clamp((t - 23.75) / 0.2) * (t < 24.45 ? 1 : 0) + bump(t, 25.2, 25.75) + bump(t, 26.15, 26.75);
  WB.effect(t => {
    if (!inWin(S3, t)) return;
    // Bidu primeiro (para a dona saber onde está o focinho)
    const run = t < 21.45;
    const x = D3X(t);
    const skid = bump(t, 21.4, 21.75);
    const hop = bump(t, 22.7, 23.0) * 40 + bump(t, 23.0, 23.3) * 25;
    d3.update(t, {
      x, y: FL - 70 - hop, s: 1.0, f: 1, L: D3L(t), sp: D3sp(t), run: (x + 260) / 30, ramp: run ? 1 : 0, wag: t > 22.6 && t < 24.4 ? 20 : 8,
      ear: t > 26.75 ? 0.05 : 0.85, earFlap: (run ? 1 : 0) + (D3L(t) > 260 ? 0.8 : 0), headRot: t > 21.5 && t < 22.3 ? 14 : 0,
      mood: D3M(t), op: talk(D_WIN, t) * (kissT(t) > 0.3 ? 0 : 1), kiss: kissT(t), sq: skid * 0.5, rot: skid * -6,
    });
    const pushing = (t > 24.5 && t < 25.25) || (t > 25.75 && t < 26.05) || (t > 26.75 && t < 27.1);
    const W3w = tf(W3X, WY, 0, -WS, WS);   // dona virada para a esquerda
    // alvo local da mão = focinho do Bidu (convertido para o espaço dela)
    const sn = d3.snout, loc = [(sn[0] - W3X) / -WS, (sn[1] - WY) / WS];
    const pushR = pushing ? [lerp(60, loc[0] - 14, 1), loc[1]] : null;
    w3.update(t, {
      x: W3X, y: WY, s: WS, f: -1, mood: W3M(t), op: talk(W_WIN, t), lean: W3lean(t), R: pushR || W3R(t),
      headRot: t > 22.25 && t < 22.6 ? Math.sin((t - 22.25) * 18) * 8 : (t > 24.4 && t < 27.4 ? -8 : 0), seed: 2.2,
    });
    // tigela: na mão até 20,75, depois fica no chão
    const tb = clamp((t - 20.75) / 0.12);
    const hx = w3.handR[0], hy = w3.handR[1] + 20;
    bowl3(lerp(hx, BOWL_FLOOR[0], tb), lerp(hy, BOWL_FLOOR[1], tb), 0, 1, 1);
  });
  P(21.2, [speedLines(160, 1300, 260)], { until: 21.6 });
  P(21.55, [star(380, 1180, 30), star(520, 1150, 22)], { loop: 'pulse', until: 22.3 });
  P(23.75, [heart(400, 1000, 0.9), heart(470, 940, 0.6, '#f472b6')], { loop: 'rise', until: 24.4 });
  TX(24.55, 'NÃO!', 900, 760, 90, INK.red, 6, { anim: 'slam', until: 25.2 });
  TX(25.8, 'NÃO!', 900, 760, 90, INK.red, -6, { anim: 'slam', until: 26.15 });
  TX(26.8, 'PRECISA NÃO!', 760, 720, 84, INK.red, -4, { anim: 'slam', until: 27.75 });
  P(27.1, [{ d: 'M 330 1240 q -10 -30 10 -50 M 360 1250 q 0 -30 20 -40', c: '#60a5fa', w: 6 }], { loop: 'float', until: 27.75 });

  function star(x, y, r, fill = '#facc15') {
    let d = '';
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? ' L ' : 'M ') + r1(x + Math.cos(a) * rr) + ' ' + r1(y + Math.sin(a) * rr); }
    return { d: d + ' Z', fill, w: 5 };
  }

  // =====================================================================
  // CENA 4 (27,75–31,8): a tigela do Bartolomeu no balcão; (31,8–33,35) o Bidu pega no ar
  // =====================================================================
  const S4 = [[27.75, 31.8]];
  shot(S4);
  const TOP = 1150;
  put([
    floorLine(),
    { d: 'M 96 900 L 1060 900', c: '#d6d3d1', w: 5 }, { d: 'M 96 820 L 1060 820 M 300 820 L 300 900 M 600 820 L 600 900 M 900 820 L 900 900', c: '#e7e5e4', w: 4 },
  ]);
  const w4 = makeWoman(cont);
  const counterG = WB.mk('g', {}, cont);
  put([{ d: `M 96 ${TOP} L 1000 ${TOP} L 1000 ${TOP + 40} L 96 ${TOP + 40} Z`, fill: '#e7e5e4', w: 7 },
    { d: `M 120 ${TOP + 40} L 980 ${TOP + 40} L 970 ${TOP + 260} L 130 ${TOP + 260} Z`, fill: '#d6d3d1', w: 6 },
    { d: `M 300 ${TOP + 40} L 300 ${TOP + 260} M 560 ${TOP + 40} L 560 ${TOP + 260} M 820 ${TOP + 40} L 820 ${TOP + 260}`, c: '#a8a29e', w: 4 },
    { d: ellipse(200, TOP - 10, 70, 16), fill: '#ffffff', w: 5 }, { d: `M 150 ${TOP - 14} L 250 ${TOP - 14} L 240 ${TOP - 44} L 160 ${TOP - 44} Z`, fill: '#fbbf24', w: 5 }], counterG);
  const c4 = makeCat(cont);
  const bowl4 = holder(bowl('#60a5fa'), cont);
  const W4M = moodTrack(W_MOODS, [[27.75, 'happy'], [29.5, 'proud'], [29.6, 'confused'], [30.9, 'shock']]);
  const C4M = moodTrack(C_MOODS, [[27.75, 'bored'], [28.9, 'disgust'], [29.6, 'deadpan'], [30.8, 'smug']]);
  // tigela desliza no balcão (28,0–28,9); o gato dá um tapa e ela voa (30,85)
  const B4X = K([[27.75, 360], [28.0, 360], [28.9, 560, 'io']]);
  const flyT = 30.85;
  WB.effect(t => {
    if (!inWin(S4, t)) return;
    const pushing = t < 29.0;
    const bx = B4X(t);
    w4.update(t, {
      x: 270, y: WY + 20, s: WS, f: 1, mood: W4M(t), op: talk(W_WIN, t), lean: pushing ? 12 * bump(t, 27.9, 29.0) : 0,
      R: pushing ? [((bx - 30) - 270) / WS, (TOP - 60 - WY - 20) / WS] : [60, -66], headRot: t > 29.6 ? 8 : 0, seed: 3.3,
      L: t > 31.0 ? [-30, -360] : undefined,
    });
    // gato: olha a tigela, empurra devagar e dá o tapa pra cima
    const reach = K([[29.6, [58, -64]], [30.3, [140, -40], 'io'], [30.7, [150, -36]], [30.78, [120, -50]], [30.9, [170, -260], 'o'], [31.3, [58, -64]]])(t);
    c4.update(t, {
      x: 760, y: TOP, s: 0.95, f: -1, mood: C4M(t), op: talk(C_WIN, t), lean: t > 29.6 && t < 30.9 ? 10 : 0, R: reach,
      headRot: t > 28.9 && t < 29.6 ? 14 : 0, look: t > 28.9 && t < 29.6 ? 4 : 0, lookY: t > 28.9 && t < 29.6 ? 10 : 0, tail: 0.5,
    });
    if (t < flyT) {
      const nudge = K([[30.3, 0], [30.7, -16]])(t);
      bowl4(bx + nudge, TOP - 22, 0, 1, 1);
    } else {
      const u = t - flyT;
      bowl4(560 + u * 620, TOP - 22 - u * 1500 + u * u * 1500, u * 720, 1, 1);
    }
  });
  TX(28.3, 'do Bartolomeu', 470, 1030, 54, '#2563eb', -4, { until: 29.6 });
  P(30.0, [{ d: 'M 640 930 L 660 900 M 700 930 L 720 900', c: INK.red, w: 6 }], { until: 30.8 });
  TX(30.9, 'PLÁ!', 760, 760, 110, INK.orange, 8, { anim: 'slam' });

  const S4b = [[31.8, 33.35]];
  shot(S4b);
  put([floorLine(), { d: 'M 96 1450 L 1060 1450 L 1060 1700 L 96 1700 Z', fill: '#dcfce7', c: 'none', fo: 0.7 }]);
  const d4 = makeDog(cont);
  const bowl4b = holder(bowl('#60a5fa'), cont);
  WB.effect(t => {
    if (!inWin(S4b, t)) return;
    const jump = bump(t, 31.95, 32.55);
    d4.update(t, {
      x: 380, y: FL - 70 - jump * 260, s: 1.05, f: 1, sp: -40 * jump - 8, L: 200 + jump * 40, mood: { happy: t > 32.2 ? 1 : 0, smile: 12, pr: 1.3, sparkle: 1 },
      op: talk(D_WIN, t), wag: 22, ear: 0.9, earFlap: 1, headRot: -10 * jump, sq: bump(t, 32.55, 32.8) * 0.5, legsUp: jump,
    });
    const m = d4.mouthW;
    if (t < 32.25) { const u = clamp((t - 31.8) / 0.45); bowl4b(lerp(180, m[0], u), lerp(700, m[1] + 10, u) - Math.sin(u * Math.PI) * 120, u * 540, 1, 1); }
    else bowl4b(m[0], m[1] + 10, 20 + Math.sin(t * 9) * 6, 1, 1);
  });
  TX(32.4, 'NHAM!', 760, 1000, 100, INK.green, -6, { anim: 'slam', loop: 'wiggle' });

  // =====================================================================
  // CENA 5 (33,35–45,1): o Bidu dentro da mala
  // =====================================================================
  const S5 = [[33.35, 45.1]];
  shot(S5);
  put([
    floorLine(),
    // cama
    { d: 'M 400 1180 L 1040 1180 L 1040 1340 L 400 1340 Z', fill: '#f9a8d4', w: 7 },
    { d: 'M 400 1180 Q 720 1150 1040 1180', c: '#db2777', w: 4 }, { d: 'M 420 1340 L 420 1440 M 1020 1340 L 1020 1440', w: 12 },
    { d: 'M 1040 1340 L 1040 980', w: 10 },
    // tapete e chinelos
    { d: 'M 150 1500 L 520 1500 L 560 1560 L 110 1560 Z', fill: '#fef9c3', w: 5 }, { d: ellipse(240, 1520, 34, 12), fill: '#fda4af', w: 4 }, { d: ellipse(320, 1528, 34, 12), fill: '#fda4af', w: 4 },
  ]);
  // tampa aberta (atrás do Bidu) e caixa da mala (na frente)
  const lidG = WB.mk('g', {}, cont);
  put([box(-180, -240, 360, 240, 18, '#d6b06a', null, 7), box(-150, -210, 300, 180, 12, '#f5e3bd', 'none')], lidG);
  WB.mk('clipPath', { id: 'malaClip' }, cont).appendChild(WB.mk('rect', { x: 0, y: 0, width: 1080, height: 1186 }));
  const d5 = makeDog(WB.mk('g', { 'clip-path': 'url(#malaClip)' }, cont));
  const caseFront = WB.mk('g', {}, cont);
  put([box(560, 1060, 360, 130, 14, '#e9c98b', null, 7), { d: 'M 580 1110 L 900 1110', c: '#b45309', w: 5 },
    { d: 'M 600 1062 q 30 -24 60 0 q 30 -24 60 0', c: '#9ca3af', w: 6 }], caseFront);
  const peekEyes = WB.mk('g', { opacity: 0 }, cont);
  put([{ d: ellipse(700, 1078, 14, 10), fill: '#ffffff', w: 4 }, { d: ellipse(744, 1078, 14, 10), fill: '#ffffff', w: 4 }, circ(702, 1080, 5, '#111', 'none'), circ(746, 1080, 5, '#111', 'none')], peekEyes);
  const w5 = makeWoman(cont);
  const towelH = holder(towel(), cont);
  const W5M = moodTrack(W_MOODS, [[33.35, 'confused'], [34.5, 'shock'], [36.35, 'dismiss'], [37.7, 'awkward'], [40.7, 'annoyed'], [43.2, 'tired'], [44.4, 'proud']]);
  const W5R = K([[33.35, [80, -110]], [33.95, [80, -110]], [34.15, [150, -200], 'b'], [34.5, [150, -200]], [34.8, [80, -110]], [36.35, [80, -110]], [36.6, [130, -260], 'b'], [37.6, [130, -260]], [37.9, [80, -110]], [44.2, [80, -110]], [44.5, [200, -260], 'o'], [44.9, [190, -150], 'io']]);
  const D5Y = K([[33.35, 1240], [33.6, 1240], [34.0, 1185, 'o'], [34.45, 1185], [34.65, 1150, 'b'], [44.4, 1150], [44.7, 1250, 'i']]);
  const D5M = moodTrack(D_MOODS, [[33.35, 'sad'], [34.5, 'sad'], [36.35, 'sus'], [37.7, 'panic'], [39.7, 'shock'], [40.7, 'cry'], [41.95, 'panic'], [43.2, 'beg'], [44.6, 'sad']]);
  const lidAng = K([[44.4, 0], [44.85, 168, 'i'], [44.95, 160, 'o'], [45.05, 166]]);
  WB.effect(t => {
    if (!inWin(S5, t)) return;
    w5.update(t, { x: 260, y: WY, s: WS, f: 1, mood: W5M(t), op: talk(W_WIN, t), R: W5R(t), L: [-70, -110],
      headRot: t < 34.5 ? 10 : (t > 36.35 && t < 37.6 ? -8 : 0), seed: 4.4 });
    towelH(t > 44.2 ? lerp(w5.handR[0], 760, clamp((t - 44.2) / 0.3)) : w5.handR[0], w5.handR[1] + 6, 0, 1, t > 44.5 ? 0 : 1);
    // tampa gira para fechar sobre a mala
    lidG.setAttribute('transform', `translate(740 1060) rotate(${r1(-lidAng(t) * 0)}) scale(1 ${(Math.cos(lidAng(t) * DEG)).toFixed(3)})`);
    const panic = t > 37.7 && t < 43.2;
    const para = t > 41.95 && t < 43.2;
    d5.update(t, {
      x: 640, y: D5Y(t) + (panic ? Math.sin(t * 30) * 3 : 0), s: 0.95, f: 1, L: 120, sp: -78, mood: D5M(t), op: talk(D_WIN, t),
      ear: t > 34.5 ? 0.15 : 0.5, earFlap: panic ? 1.2 : 0.2, wag: 0, legsUp: 1, flail: para ? 1 : (panic ? 0.4 : 0),
      headRot: (para ? Math.sin(t * 22) * 18 : 0) + (t > 43.2 && t < 44.4 ? -14 : 0), tongue: 0,
    });
    peekEyes.setAttribute('opacity', t > 44.9 ? 1 : 0);
  });
  TX(33.45, '?', 470, 860, 140, INK.blue, 10, { loop: 'wiggle', until: 34.5 });
  P(36.5, [...thought(330, 640, 210, 120, [[300, 790, 14], [320, 750, 22]]),
    box(220, 600, 150, 60, 20, '#60a5fa', null, 5), circ(250, 670, 18, '#374151', null, 4), circ(340, 670, 18, '#374151', null, 4),
    { d: 'M 400 590 A 60 60 0 1 1 400 700', c: INK.green, w: 7 }, { d: WB.arrowHead(400, 700, Math.PI, 26), c: INK.green, w: 7 }], { until: 37.75 });
  // pensamentos do Bidu em pânico
  P(37.9, [...thought(780, 640, 250, 150, [[700, 840, 16], [730, 790, 24]]),
    box(670, 600, 170, 70, 22, '#ef4444', null, 5), circ(705, 678, 20, '#374151', null, 4), circ(805, 678, 20, '#374151', null, 4),
    burst(900, 600, 50, '#fde047'), T('!!', 900, 625, 60, INK.red)], { loop: 'tremble', until: 39.7 });
  P(39.75, [...thought(780, 640, 250, 150, [[700, 840, 16], [730, 790, 24]]),
    { d: 'M 700 640 Q 640 560 700 520 Q 740 600 760 640 Z M 860 640 Q 920 560 860 520 Q 820 600 800 640 Z', fill: '#ffffff', w: 5 },
    circ(780, 600, 40, W_SKIN, BK, 5), { d: ellipse(780, 548, 44, 12), c: '#f59e0b', w: 7 }, { d: 'M 750 640 L 740 720 L 820 720 L 810 640 Z', fill: '#ffffff', w: 5 }], { loop: 'float', until: 40.7 });
  stamp(42.0, 'PARA!', 820, 700, 80, INK.red, -8, { until: 43.2 });
  stamp(42.35, 'PARA!', 860, 830, 80, INK.red, 6, { until: 43.2 });
  stamp(42.7, 'PARA!', 800, 960, 80, INK.red, -4, { until: 43.2 });
  TX(43.3, 'pensa!', 860, 760, 90, '#7c3aed', 6, { loop: 'pulse', until: 45.1 });
  TX(44.95, 'CLAC!', 740, 960, 90, INK.orange, -6, { anim: 'slam' });
  // lágrimas em cachoeira (40,7–41,9)
  {
    const g = WB.mk('g', {}, cont);
    const L1 = dyn(g, { stroke: '#60a5fa', 'stroke-width': 14, 'stroke-dasharray': '18 14' }), L2 = dyn(g, { stroke: '#60a5fa', 'stroke-width': 14, 'stroke-dasharray': '18 14' });
    WB.effect(t => {
      const on = t > 40.75 && t < 41.95;
      g.setAttribute('opacity', on ? 1 : 0);
      if (!on) return;
      const h = d5.headW;
      L1.setAttribute('d', `M ${r1(h[0] - 6)} ${r1(h[1] + 4)} Q ${r1(h[0] - 120)} ${r1(h[1] - 60)} ${r1(h[0] - 170)} ${r1(h[1] + 90)}`);
      L2.setAttribute('d', `M ${r1(h[0] + 10)} ${r1(h[1] + 4)} Q ${r1(h[0] + 130)} ${r1(h[1] - 60)} ${r1(h[0] + 180)} ${r1(h[1] + 90)}`);
      L1.setAttribute('stroke-dashoffset', r1(-t * 160)); L2.setAttribute('stroke-dashoffset', r1(-t * 160));
    });
  }

  // =====================================================================
  // CENA 6 (45,1–53,95): o Bartolomeu faz a mala DELA
  // =====================================================================
  const S6 = [[45.1, 53.95]];
  shot(S6);
  put([
    floorLine(),
    { d: 'M 96 980 L 1060 980 M 96 1080 L 1060 1080', c: '#d6d3d1', w: 5 },
    { d: 'M 140 700 L 440 700 L 440 960 L 140 960 Z M 290 700 L 290 960', c: '#a8a29e', w: 5 },
    { d: 'M 600 700 L 1000 700 L 1000 960 L 600 960 Z M 800 700 L 800 960', c: '#a8a29e', w: 5 },
  ]);
  // luminárias pendentes balançando
  const lamps = [400, 720].map((x, i) => {
    const g = WB.mk('g', {}, cont);
    put([{ d: `M 0 0 L 0 120`, w: 4 }, { d: 'M -40 170 L -16 120 L 16 120 L 40 170 Z', fill: '#86efac', w: 5 }], g);
    return { g, x, ph: i * 1.3 };
  });
  WB.effect(t => lamps.forEach(l => l.g.setAttribute('transform', `translate(${l.x} 560) rotate(${r1(Math.sin(t * 1.6 + l.ph) * 6)})`)));
  const w6 = makeWoman(cont);
  const mugH = holder(mug(), cont);
  const caseH = holder([...suitcase(320, 200), { d: 'M -120 -200 q 20 -30 50 -6 M 60 -200 q 10 -30 40 0', c: '#f472b6', w: 10 }, { d: 'M 150 -90 l 30 10 l -6 24', c: '#38bdf8', w: 8 }], cont);
  const c6 = makeCat(cont);
  const dressH = holder(dressItem(), cont), brushH = holder(toothbrush(), cont), passH = holder(passport(), cont);
  const steam = WB.mk('g', {}, cont);
  const st1 = dyn(steam, { stroke: '#9ca3af', 'stroke-width': 5 });
  const W6X = K([[45.1, 330], [50.45, 330], [50.9, 250, 'o'], [51.0, 250], [51.4, 180, 'o'], [52.0, 180], [52.4, 90, 'o'], [53.0, 90], [53.5, -80, 'i']]);
  const W6M = moodTrack(W_MOODS, [[45.1, 'calm'], [46.2, 'confused'], [48.0, 'shock'], [49.7, 'awkward'], [50.45, 'shock'], [52.95, 'awkward']]);
  const CASEX = K([[45.1, 1300], [45.3, 1300], [46.4, 640, 'o'], [50.45, 640], [50.9, 520, 'o'], [51.0, 520], [51.4, 450, 'o'], [52.0, 450], [52.4, 360, 'o'], [53.0, 360], [53.5, 190, 'i']]);
  const C6M = moodTrack(C_MOODS, [[45.1, 'effort'], [46.2, 'smug'], [48.0, 'happy'], [48.95, 'smug'], [50.45, 'effort'], [51.95, 'angry'], [52.95, 'smug']]);
  WB.effect(t => {
    if (!inWin(S6, t)) return;
    const X = W6X(t);
    const pushed = t > 50.45;
    const sipping = t < 46.3;
    w6.update(t, Object.assign({ x: X, y: WY, s: WS, f: 1, mood: W6M(t), op: talk(W_WIN, t),
      R: sipping ? [30 + Math.sin(t * 2) * 6, -370 + Math.sin(t * 2) * 8] : [70, -170], L: t > 49.7 ? [-90, -200] : [-62, -70],
      lean: pushed ? -10 - Math.sin(t * 8) * 3 : 0, headRot: sipping ? -6 : 0, seed: 5.5, spread: pushed ? 10 : 0 }, { walk: 0, wamp: 0 }));
    mugH(w6.handR[0] + 6, w6.handR[1] + 12, sipping ? -10 : 0, 1, 1);
    st1.setAttribute('d', `M ${r1(w6.handR[0] + 6)} ${r1(w6.handR[1] - 60)} q -14 -24 0 -46 q 14 -24 0 -46`);
    steam.setAttribute('transform', `translate(0 ${r1(-((t * 30) % 20))})`);
    steam.setAttribute('opacity', (0.6 + 0.3 * Math.sin(t * 3)).toFixed(2));
    const cx = CASEX(t);
    const moving = Math.abs(CASEX(t + 0.05) - CASEX(t - 0.05)) > 2;
    caseH(cx, FL, moving ? Math.sin(t * 16) * 2 : 0, 1, 1);
    // gato empurra a mala (andando) e depois a dona
    const catX = pushed ? Math.max(cx + 200, X + 230) : cx + 230;
    c6.update(t, {
      x: catX, y: FL, s: 0.9, f: -1, mood: C6M(t), op: talk(C_WIN, t), lean: moving ? 16 : 0, hop: moving ? Math.abs(Math.sin(t * 12)) * 10 : 0,
      R: moving ? [130, -150] : (t > 47.2 && t < 47.95 ? [120, -60 - Math.abs(Math.sin(t * 12)) * 40] : (t > 51.95 && t < 52.95 ? [160, -260] : [58, -64])),
      L: moving ? [120, -110] : [-58, -64], tail: 0.5, headRot: 0,
    });
    // itens: vestido sai da mala, escova e passaporte vão pra mão dela
    const pop = (t0) => clamp((t - t0) / 0.45);
    const u1 = eo(pop(48.0));
    dressH(cx - 40 + u1 * 0, FL - 220 - u1 * 260, Math.sin(t * 3) * 8 * u1, 0.4 + 0.6 * u1, t > 48.0 ? 1 : 0);
    const u2 = eo(pop(48.95)), u3 = eo(pop(49.7));
    const hl = w6.handL;
    brushH(lerp(cx + 120, hl[0] + 20, u2), lerp(FL - 200, hl[1] - 10, u2) - Math.sin(u2 * Math.PI) * 120, -30 + 30 * u2 + u2 * 360 * (1 - u2), 1, t > 48.95 ? 1 : 0);
    passH(lerp(cx + 60, hl[0] - 14, u3), lerp(FL - 200, hl[1] + 20, u3) - Math.sin(u3 * Math.PI) * 160, u3 * 360, 1, t > 49.7 ? 1 : 0);
  });
  P(48.4, [{ d: 'M 620 920 l 18 18 l 34 -40', c: INK.green, w: 10 }], { until: 49.0 });
  P(45.4, [speedLines(1060, 1290, 200, -1)], { until: 46.3 });
  stamp(52.0, 'SAÍDA', 700, 760, 76, INK.red, -6, { until: 53.95 });
  P(52.1, [{ d: 'M 600 870 L 380 870', c: INK.red, w: 12 }, { d: WB.arrowHead(380, 870, Math.PI, 40), c: INK.red, w: 12 }], { loop: 'pulse', until: 53.95 });
  TX(53.0, 'TCHAU!', 760, 900, 100, '#7c3aed', 8, { loop: 'wiggle', until: 53.95 });

  // =====================================================================
  // CENA 7 (53,95–62,0): ela sai com a mala, a porta fecha... e ela volta
  // =====================================================================
  const S7 = [[53.95, CTA0]];
  shot(S7);
  put([
    floorLine(),
    // mesinha com o gato
    { d: 'M 120 1160 L 470 1160 L 470 1200 L 120 1200 Z', fill: '#fdba74', w: 7 }, { d: 'M 140 1200 L 150 1450 M 450 1200 L 440 1450', w: 10 },
    { d: 'M 130 1200 L 460 1200 L 440 1300 L 150 1300 Z', fill: '#fed7aa', w: 5 },
    box(170, 1050, 60, 110, 10, '#9ca3af', null, 5),
    // tapete "bem-vindo"
    { d: 'M 640 1470 L 960 1470 L 990 1530 L 610 1530 Z', fill: '#d6d3d1', w: 5 }, T('bem-vindo', 800, 1515, 40, '#57534e'),
  ]);
  // vão da porta (fundo claro = lado de fora)
  put([{ d: 'M 690 800 L 960 800 L 960 1450 L 690 1450 Z', fill: '#e0f2fe', w: 7 }, { d: 'M 700 1380 Q 800 1300 950 1380', c: '#86efac', w: 6 }]);
  const w7 = makeWoman(cont);
  const case7 = holder(suitcase(260, 170), cont);
  // folha da porta (na frente dela) + batente
  const doorG = WB.mk('g', {}, cont);
  const doorP = WB.mk('path', { d: '', fill: '#fcd34d', stroke: BK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, doorG);
  const knob = WB.mk('circle', { r: 12, fill: '#a16207', stroke: BK, 'stroke-width': 4 }, doorG);
  put([{ d: 'M 680 1450 L 680 790 L 970 790 L 970 1450', w: 10 }, { d: 'M 970 790 L 1060 790 L 1060 1450 L 970 1450 Z', fill: '#fbf5df', c: 'none' }]);
  const c7 = makeCat(cont);
  // porta: 1 = aberta (folha estreita colada à direita), 0 = fechada
  const DOOR = K([[53.95, 1], [58.15, 1], [58.45, 0, 'i'], [58.6, 0.05, 'o'], [58.75, 0], [58.9, 0], [60.3, 0.45, 'io']]);
  const W7X = K([[53.95, 500], [57.5, 780, 'l'], [58.15, 900, 'i']]);
  const W7st = stride(W7X, WS, 46);
  const W7M = moodTrack(W_MOODS, [[53.95, 'strain'], [58.9, 'sheepish'], [60.45, 'sheepish'], [61.0, 'awkward']]);
  const C7M = moodTrack(C_MOODS, [[53.95, 'happy'], [58.6, 'shock'], [59.3, 'deadpan'], [60.4, 'deadpan'], [61.5, 'angry']]);
  WB.effect(t => {
    if (!inWin(S7, t)) return;
    const dv = DOOR(t);
    const dw = lerp(270, 50, dv);
    doorP.setAttribute('d', `M 690 ${r1(800 - 20 * dv)} L ${r1(690 + dw)} 800 L ${r1(690 + dw)} 1450 L 690 ${r1(1450 + 30 * dv)} Z`);
    doorG.setAttribute('transform', `translate(${r1(270 - dw)} 0)`);
    knob.setAttribute('cx', r1(690 + 30 + (dw - 60) * 0.1)); knob.setAttribute('cy', 1130);
    const leaving = t < 58.9;
    const X = leaving ? W7X(t) : 820;
    const wst = leaving ? W7st(t) : { walk: 0, wamp: 0 };
    const out = leaving ? clamp((t - 57.6) / 0.5) : 0;
    // volta espiando: só a cabeça aparece pelo vão (o resto atrás da porta)
    const peek = !leaving ? eo(clamp((t - 59.4) / 0.8)) : 0;
    w7.update(t, Object.assign({ x: leaving ? X : lerp(1000, 760, peek), y: WY, s: WS, f: leaving ? 1 : -1, mood: W7M(t), op: talk(W_WIN, t) + (t > 57.1 && t < 58.3 ? 0.3 : 0),
      R: leaving ? [80, -110] : [60, -66], L: leaving ? [60, -100] : [-60, -66], lean: leaving ? -8 + Math.sin(wst.walk * 2) * 3 : 24 * peek,
      headRot: leaving ? Math.sin(t * 3) * 3 : -10 * peek, seed: 6.6 }, wst));
    w7.g.setAttribute('opacity', leaving ? (1 - out).toFixed(2) : (t > 59.2 ? 1 : 0));
    const hm = [(w7.handR[0] + w7.handL[0]) / 2, (w7.handR[1] + w7.handL[1]) / 2];
    case7(hm[0] + 10, hm[1] + 120, Math.sin(wst.walk) * 3, 1, leaving ? 1 - out : 0);
    // gato: acena tchau, comemora quando a porta fecha, depois vira a cara: "Ainda não foi?"
    const wave = t < 58.5;
    const party = t > 58.5 && t < 59.3;
    const turn = eio(clamp((t - 60.1) / 0.35));
    c7.update(t, {
      x: 250, y: 1160, s: 0.95, f: 1, mood: C7M(t), op: talk(C_WIN, t),
      R: wave ? [120 + Math.sin(t * 9) * 40, -330] : (party ? [110, -330] : [58, -64]), L: party ? [-110, -330] : [-58, -64],
      hop: wave ? Math.abs(Math.sin(t * 5)) * 22 : (party ? Math.abs(Math.sin(t * 9)) * 40 : 0), look: 8 * turn, headRot: -6 * turn,
      lean: 6 * turn, tail: wave ? 0.8 : 0.4, tailSpd: wave ? 5 : 2.2,
    });
  });
  P(54.2, [{ d: 'M 860 1010 q 10 -20 0 -40 M 880 1020 q 10 -20 0 -40', c: '#60a5fa', w: 6 }], { loop: 'float', until: 57.6 });
  TX(54.4, 'tchau!', 260, 760, 80, '#7c3aed', -6, { loop: 'wiggle', until: 58.5 });
  TX(58.45, 'BAM!', 820, 760, 110, INK.orange, 6, { anim: 'slam', until: 59.2 });
  P(58.6, confetti(140, 600, 520, 1000, 30, 5), { loop: 'rise', until: 59.6 });
  TX(58.8, 'nheeec...', 820, 740, 80, '#78716c', -4, { loop: 'wiggle', until: 60.4 });
  TX(60.55, '¬¬', 300, 760, 100, '#7c3aed', 0, { loop: 'pulse', until: CTA0 });

  // =====================================================================
  // CTA (62,0–fim)
  // =====================================================================
  shot([[CTA0, 999]], false);
  {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 560, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 650, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@caderno_amarelo', 380, 650 + 190 * 0.62, 84, BK, g).strokes);
    animate(g, CTA0 + 0.1, { loop: 'float' });
    const cc = makeCat(cont), dd = makeDog(cont);
    WB.effect(t => {
      if (t < CTA0) return;
      cc.update(t, { x: 300, y: 1450, s: 0.85, f: 1, mood: C_MOODS.smug, hop: Math.abs(Math.sin(t * 5)) * 30, R: [100, -300 + Math.sin(t * 8) * 30], tail: 0.8 });
      dd.update(t, { x: 640, y: 1380 - Math.abs(Math.sin(t * 5 + 1)) * 40, s: 0.95, f: 1, mood: D_MOODS.happy, wag: 20, ear: 0.9, earFlap: 1, tongue: 0.8, run: t * 8, ramp: 0.3 });
    });
    TX(CTA0 + 0.5, 'kkkkkk', 540, 1600, 90, INK.orange, -4, { loop: 'wiggle' });
  }
};
