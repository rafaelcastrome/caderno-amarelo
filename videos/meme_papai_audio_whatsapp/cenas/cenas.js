// Meme "o áudio da baixinha": uma criança grava um áudio pelo celular da vovó tentando explicar alguma coisa e o papai ouve sem entender nada.
// Áudio original (voz da criança) + risada de plateia no final. Formato de cenas no papel do caderno: cortes com deslize,
// faixa amarela de legenda e bonecos articulados recalculados a cada quadro (makePerson: pernas com IK e pés presos ao chão
// pela distância percorrida, braços com IK, respiração, piscadas, humor com transição). Personagens genéricos, sem nomes.
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
  // ODÔMETRO: distância percorrida (com sinal) e velocidade a partir de uma trilha x(t).
  // A fase do passo sai da distância, então cada pé fica parado no chão enquanto apoia.
  // =====================================================================
  function odo(X, t0, t1) {
    const dt = 1 / 240, n = Math.ceil((t1 - t0) / dt) + 2, acc = new Float64Array(n);
    let prev = X(t0);
    for (let i = 1; i < n; i++) { const v = X(t0 + i * dt); acc[i] = acc[i - 1] + (v - prev); prev = v; }
    return t => {
      const u = clamp((t - t0) / dt, 0, n - 1.001), i = Math.floor(u), f = u - i;
      const d = acc[i] + (acc[i + 1] - acc[i]) * f;
      const v = Math.abs(X(t + 0.04) - X(t - 0.04)) / 0.08;
      return { d, v };
    };
  }

  // passo: S = comprimento do ciclo, D = fração em apoio, ordem das patas: traseira perto, traseira longe, dianteira perto, dianteira longe
  const GAITS = {
    walk: { S: 105, D: 0.62, lift: 26, off: [0, 0.5, 0.25, 0.75] },
    run: { S: 250, D: 0.36, lift: 52, off: [0, 0.1, 0.5, 0.62] },
  };
  function footOff(u, o, S, D, lift) {
    const f = ((u + o) % 1 + 1) % 1;
    if (f < D) return [S * (D / 2 - f), 0];
    const g = (f - D) / (1 - D);
    return [-S * D / 2 + g * S * D, -Math.sin(Math.PI * g) * lift];
  }

  // ---------------- áudio: energia (20/s) e quando a pequena fala ----------------
  const ENV = '000000001200000000055101677766655332100000000000000000000000007776666666348610158777777788657786323444444530000000000000776431367666654255547765557778777777654200000100000000377677778998210079661165256654002887864630034234204400000001467607777666642344530245555676530040002000000233330001778777776100067602755565006656662544463003200056776664367888865100000444345445520455300000020003343334544444443310000000010024100000000000344443100200333400045300000000000000255555443210000000000000024300000000000466665555444000230000000266664000000000000002000000000000000000000000777540465503566433333000000000000122772357610000034066610465667755554431000003466420000003520478601776457555443';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  const K_WIN = [[0.35, 2.0], [2.9, 8.1], [8.6, 13.5], [13.9, 17.7], [17.9, 26.7], [28.4, 34.05]];
  const talk = (wins, t, k = 1.25) => {
    for (const [a, b] of wins) if (t >= a && t <= b) return clamp(envAt(t) * k) * clamp((b - t) / 0.06) * clamp((t - a) / 0.04);
    return 0;
  };

  // ---------------- cenas: corte com deslize; cada cena tem zoom próprio e uma camada de textos sem zoom ----------------
  let ov = null;
  function shot(wins, zk = 1.25, zx = 540, zy = 1200) {
    const g = WB.mk('g', {}, WB.layer);
    const slide = WB.mk('g', {}, g);
    const zg = WB.mk('g', { transform: `translate(${zx} ${zy}) scale(${zk}) translate(${-zx} ${-zy})` }, slide);
    const og = WB.mk('g', {}, slide);
    WB.effect(t => {
      const w = wins.find(([a, b]) => t >= a && t < b);
      if (!w) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      const u = eo(clamp((t - w[0]) / 0.3));
      slide.setAttribute('transform', `translate(${r1(130 * (1 - u))} 0)`);
      slide.setAttribute('opacity', clamp((t - w[0]) / 0.16).toFixed(3));
    });
    cont = zg; ov = og;
    return zg;
  }
  // texto / desenho na camada sem zoom da cena atual
  const O = (bt, specs, o = {}) => P(bt, specs, Object.assign({ parent: ov }, o));
  const OT = (bt, text, x, y, size, c, rot = 0, o = {}) => O(bt, T(text, x, y, size, c), Object.assign({ rot, rx: x, ry: y - size * 0.3 }, o));
  const ostamp = (bt, text, cx, cy, size, color, rot, o = {}) => stamp(bt, text, cx, cy, size, color, rot, Object.assign({ parent: ov }, o));

  // =====================================================================
  // RIG DE GENTE (papai e a pequena). Origem = chão embaixo do quadril; de frente para a câmera.
  // st: x, y, s, f, d/v (odômetro), sit, seatH, lean, rot, hop, headRot, mood, op, look, lookY,
  //     L, R (alvos das mãos, coordenadas do quadril), rotL, rotR, footT (alvos dos pés), xeyes, shades, lift, frozen
  // =====================================================================
  const DAD = { kind: 'dad', thigh: 94, shin: 92, torso: 196, neck: 14, R: 94, up: 80, fo: 78, shW: 56, hipW: 28, legW: 24, armW: 16,
    skin: '#f1c29b', shirt: '#2f7fd1', pants: '#3b4a63', shoe: '#3f3f46', hair: '#3a2618' };
  const KID = { kind: 'kid', thigh: 48, shin: 46, torso: 100, neck: 6, R: 90, up: 50, fo: 48, shW: 36, hipW: 17, legW: 15, armW: 12,
    skin: '#f7d4b6', shirt: '#f472b6', pants: null, shoe: '#ef4444', hair: '#5b3a24' };
  const MOODS = {
    neutral: { lid: 0.1, smile: 3 },
    happy: { lid: 0, smile: 14, bi: -6, bo: -4, sparkle: 1 },
    joy: { happy: 1, smile: 16, bi: -8, bo: -6, blush: 1 },
    shock: { lid: 0, pr: 0.55, bi: -16, bo: -12, smile: -9 },
    horror: { pr: 0.38, bi: -18, bo: -12, smile: -10, sweat: 1 },
    confused: { lid: 0.08, bi: -10, smile: -4, asym: 1, px: 6, py: -3 },
    squint: { lid: 0.55, bi: 12, bo: -2, smile: -6, asym: 1, sweat: 1 },
    sly: { lid: 0.45, smile: 11, bi: 6, asym: 1, px: 6 },
    innocent: { pr: 1.6, sparkle: 1, py: -7, px: 3, bi: -10, smile: 6, blush: 1 },
    think: { lid: 0.12, bi: -8, smile: -3, asym: 1, px: 8, py: -11 },
    bored: { lid: 0.5, smile: -2, py: -10, px: -6 },
    stern: { lid: 0.3, bi: 14, bo: -6, smile: -6 },
    proud: { lid: 0.3, smile: 12, bi: -4, py: -3 },
    sad: { lid: 0.2, bi: -12, bo: 6, py: 3, tear: 0.7, smile: -8 },
    blank: { lid: 0.25, pr: 0.7, smile: -1 },
    dead: { lid: 0, smile: -6 },
    greedy: { pr: 1.45, sparkle: 1, smile: 10, bi: -6 },
  };
  const GAIT = { S: 120, D: 0.6, lift: 22 };

  function makePerson(parent, B) {
    const R = B.R, kid = B.kind === 'kid';
    const g = WB.mk('g', {}, parent);
    const hipG = WB.mk('g', {}, g);
    const legsG = WB.mk('g', {}, hipG);
    const mkLeg = () => ({ o: dyn(legsG, { 'stroke-width': B.legW + 10 }), i: dyn(legsG, { stroke: B.pants || B.skin, 'stroke-width': B.legW }),
      sh: WB.mk('path', { d: '', fill: B.shoe, stroke: BK, 'stroke-width': 5 }, legsG) });
    const legs = [mkLeg(), mkLeg()];
    const upper = WB.mk('g', {}, hipG);
    const backHair = kid ? WB.mk('path', { d: WB.cloudPath(0, 0, R * 1.08, R * 1.02, 12), fill: B.hair, stroke: BK, 'stroke-width': 6 }, upper) : null;
    // tronco
    WB.mk('path', { d: `M ${-B.neck - 8} ${-B.torso - B.neck - 6} L ${-B.neck - 8} ${-B.torso + 10} L ${B.neck + 8} ${-B.torso + 10} L ${B.neck + 8} ${-B.torso - B.neck - 6} Z`, fill: B.skin, stroke: BK, 'stroke-width': 5 }, upper);
    if (kid) {
      const H = B.torso, w0 = B.shW - 4, w1 = B.hipW + 42;
      WB.mk('path', { d: `M ${-w0} ${-H} Q 0 ${-H - 10} ${w0} ${-H} Q ${w1 - 10} ${-H * 0.4} ${w1} 30 Q 0 44 ${-w1} 30 Q ${-w1 + 10} ${-H * 0.4} ${-w0} ${-H} Z`, fill: B.shirt, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, upper);
      [[-22, -60], [20, -30], [-8, 4], [28, 14], [-34, 18], [6, -78]].forEach(([x, y]) => WB.mk('circle', { cx: x, cy: y, r: 5, fill: '#fde047' }, upper));
      dyn(upper, { d: `M ${-w0 + 8} ${-H + 4} Q 0 ${-H + 22} ${w0 - 8} ${-H + 4}`, 'stroke-width': 4, stroke: '#ffffff' });
    } else {
      const H = B.torso, w0 = B.shW + 6;
      WB.mk('path', { d: `M ${-w0} ${-H + 4} Q 0 ${-H - 8} ${w0} ${-H + 4} Q ${w0 + 14} ${-H * 0.5} ${w0 + 6} ${-30} Q ${w0 + 2} 6 ${w0 - 6} 14 Q 0 22 ${-w0 + 6} 14 Q ${-w0 - 2} 6 ${-w0 - 6} -30 Q ${-w0 - 14} ${-H * 0.5} ${-w0} ${-H + 4} Z`, fill: B.shirt, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, upper);
      dyn(upper, { d: `M -26 ${-H} Q 0 ${-H + 26} 26 ${-H}`, 'stroke-width': 5 });
      dyn(upper, { d: `M ${-w0 + 10} 6 L ${w0 - 10} 6`, 'stroke-width': 8, stroke: '#78350f' });
      dyn(upper, { d: `M -30 -84 q 30 22 60 0`, 'stroke-width': 4, stroke: '#1e40af' });
    }
    // cabeça
    const head = WB.mk('g', {}, upper);
    if (kid) {
      [-1, 1].forEach(sd => {
        WB.mk('path', { d: WB.cloudPath(sd * R * 0.98, -R * 0.72, R * 0.42, R * 0.4, 9), fill: B.hair, stroke: BK, 'stroke-width': 6 }, head);
        WB.mk('path', { d: ellipse(sd * R * 0.72, -R * 0.55, 12, 16), fill: '#f472b6', stroke: BK, 'stroke-width': 4 }, head);
      });
    } else {
      [-1, 1].forEach(sd => WB.mk('path', { d: ellipse(sd * R * 0.93, R * 0.05, R * 0.16, R * 0.22), fill: B.skin, stroke: BK, 'stroke-width': 5 }, head));
    }
    WB.mk('path', { d: kid ? ellipse(0, 4, R, R * 0.94) : `M ${-R * 0.88} ${-R * 0.3} Q ${-R * 0.9} ${-R} 0 ${-R} Q ${R * 0.9} ${-R} ${R * 0.88} ${-R * 0.3} Q ${R * 0.92} ${R * 0.62} 0 ${R * 0.98} Q ${-R * 0.92} ${R * 0.62} ${-R * 0.88} ${-R * 0.3} Z`,
      fill: B.skin, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, head);
    if (!kid) {
      // barba por fazer
      WB.mk('path', { d: `M ${-R * 0.84} ${R * 0.12} Q ${-R * 0.7} ${R * 0.92} 0 ${R * 0.94} Q ${R * 0.7} ${R * 0.92} ${R * 0.84} ${R * 0.12} Q ${R * 0.5} ${R * 0.5} ${R * 0.26} ${R * 0.36} Q 0 ${R * 0.3} ${-R * 0.26} ${R * 0.36} Q ${-R * 0.5} ${R * 0.5} ${-R * 0.84} ${R * 0.12} Z`, fill: '#8b6b55', opacity: 0.28 }, head);
    }
    const blush = WB.mk('g', { opacity: kid ? 0.55 : 0 }, head);
    WB.mk('path', { d: ellipse(-R * 0.6, R * 0.36, 15, 9), fill: '#fb7185' }, blush); WB.mk('path', { d: ellipse(R * 0.6, R * 0.36, 15, 9), fill: '#fb7185' }, blush);
    const ex = R * (kid ? 0.38 : 0.36), ey = kid ? R * 0.04 : -R * 0.1, erx = R * (kid ? 0.24 : 0.19), ery = R * (kid ? 0.29 : 0.24);
    const eyeL = makeEye(head, -ex, ey, erx, ery, B.skin, { prx: erx * (kid ? 0.42 : 0.36), browW: kid ? 5 : 8, browC: kid ? B.hair : '#2a1a10' });
    const eyeR = makeEye(head, ex, ey, erx, ery, B.skin, { prx: erx * (kid ? 0.42 : 0.36), browW: kid ? 5 : 8, browC: kid ? B.hair : '#2a1a10' });
    if (kid) dyn(head, { d: `M ${-ex - erx - 4} ${ey - ery * 0.5} l -12 -8 M ${-ex - erx + 2} ${ey - ery * 0.8} l -10 -12 M ${ex + erx + 4} ${ey - ery * 0.5} l 12 -8 M ${ex + erx - 2} ${ey - ery * 0.8} l 10 -12`, 'stroke-width': 4 });
    const xe = dyn(head, { 'stroke-width': 7, opacity: 0, d: [-1, 1].map(sd => `M ${r1(sd * ex - 16)} ${r1(ey - 16)} l 32 32 M ${r1(sd * ex + 16)} ${r1(ey - 16)} l -32 32`).join(' ') });
    dyn(head, { d: kid ? `M -4 ${R * 0.3} q -6 8 4 10` : `M -4 ${R * 0.12} Q -16 ${R * 0.36} 4 ${R * 0.38}`, 'stroke-width': 5 });
    const mouth = makeMouth(head, 0, R * (kid ? 0.56 : 0.6), R * (kid ? 0.34 : 0.4));
    const sweat = WB.mk('path', { d: `M ${R * 0.9} ${-R * 0.5} q -14 24 0 36 q 14 -12 0 -36 Z`, fill: '#93c5fd', stroke: BK, 'stroke-width': 4, opacity: 0 }, head);
    // cabelo da frente
    if (kid) {
      WB.mk('path', { d: `M ${-R * 0.98} ${-R * 0.06} Q ${-R} ${-R * 1.02} 0 ${-R * 1.0} Q ${R} ${-R * 1.02} ${R * 0.98} ${-R * 0.06} Q ${R * 0.8} ${-R * 0.5} ${R * 0.42} ${-R * 0.44} Q ${R * 0.2} ${-R * 0.62} 0 ${-R * 0.42} Q ${-R * 0.24} ${-R * 0.64} ${-R * 0.46} ${-R * 0.44} Q ${-R * 0.82} ${-R * 0.5} ${-R * 0.98} ${-R * 0.06} Z`, fill: B.hair, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, head);
    } else {
      WB.mk('path', { d: `M ${-R * 0.92} ${-R * 0.12} Q ${-R * 1.04} ${-R * 1.12} 0 ${-R * 1.1} Q ${R * 1.04} ${-R * 1.12} ${R * 0.92} ${-R * 0.12} Q ${R * 0.86} ${-R * 0.56} ${R * 0.52} ${-R * 0.62} Q ${R * 0.1} ${-R * 0.5} ${-R * 0.3} ${-R * 0.7} Q ${-R * 0.78} ${-R * 0.62} ${-R * 0.92} ${-R * 0.12} Z`, fill: B.hair, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, head);
    }
    const shades = WB.mk('g', { opacity: 0 }, head);
    WB.mk('path', { d: `M ${-ex - erx - 8} ${ey - 20} L ${-ex + erx + 6} ${ey - 20} Q ${-ex + erx} ${ey + 26} ${-ex} ${ey + 26} Q ${-ex - erx - 4} ${ey + 26} ${-ex - erx - 8} ${ey - 20} Z M ${ex - erx - 6} ${ey - 20} L ${ex + erx + 8} ${ey - 20} Q ${ex + erx + 4} ${ey + 26} ${ex} ${ey + 26} Q ${ex - erx} ${ey + 26} ${ex - erx - 6} ${ey - 20} Z`, fill: '#111827', stroke: BK, 'stroke-width': 5 }, shades);
    dyn(shades, { d: `M ${-ex + erx + 6} ${ey - 14} L ${ex - erx - 6} ${ey - 14} M ${-ex - 12} ${ey - 10} l 10 -6 M ${ex - 12} ${ey - 10} l 10 -6`, 'stroke-width': 5, stroke: '#9ca3af' });
    // braços (na frente de tudo)
    const mkArm = () => {
      const ag = WB.mk('g', {}, upper);
      const o = dyn(ag, { 'stroke-width': B.armW + 10 }), i = dyn(ag, { stroke: B.skin, 'stroke-width': B.armW });
      const so = dyn(ag, { 'stroke-width': B.armW + 22 }), si = dyn(ag, { stroke: B.shirt, 'stroke-width': B.armW + 12 });
      const hand = WB.mk('g', {}, ag);
      const item = WB.mk('g', {}, hand);
      WB.mk('circle', { cx: 0, cy: 0, r: B.armW * 0.75 + 5, fill: B.skin, stroke: BK, 'stroke-width': 5 }, hand);
      return { o, i, so, si, hand, item };
    };
    const armL = mkArm(), armR = mkArm();
    const SH = [[-B.shW, -B.torso + 16], [B.shW, -B.torso + 16]];
    const HEADY = -B.torso - B.neck - R * 0.88;
    const legLen = B.thigh + B.shin;
    const rig = {
      g, B, itemL: armL.item, itemR: armR.item, HEADY,
      update(t, st) {
        const s = st.s || 1, f = st.f || 1, sit = st.sit || 0, fr = st.frozen ? 0 : 1;
        const amp = clamp((st.v || 0) / (50 * s)) * (1 - sit);
        const lift = st.lift || GAIT.lift * (kid ? 0.7 : 1);
        const SS = GAIT.S * (kid ? 0.62 : 1);
        const u = ((st.d || 0) * f / s) / SS;
        const bob = -Math.abs(Math.sin(2 * Math.PI * u)) * 7 * amp - (st.hop || 0) / s;
        const breath = Math.sin(t * 2.3 + (st.seed || 0)) * fr;
        g.setAttribute('transform', `translate(${r1(st.x)} ${r1(st.y)}) rotate(${r1(st.rot || 0)}) scale(${r1(s * f * 1000) / 1000} ${s})`);
        const hipH = lerp(legLen - 6, st.seatH || 120, sit);
        hipG.setAttribute('transform', `translate(0 ${r1(-hipH + bob)})`);
        const ground = hipH - bob;
        const th = B.thigh * (1 - 0.72 * sit);
        [0, 1].forEach(i => {
          const sd = i ? 1 : -1;
          const fo = footOff(u, i * 0.5, SS, GAIT.D, lift);
          let fx = sd * (B.hipW + 2) + fo[0] * amp, fy = ground + fo[1] * amp;
          if (sit) { fx = lerp(fx, sd * (B.hipW + 12), sit); }
          if (st.footT && st.footT[i]) { fx = st.footT[i][0]; fy = st.footT[i][1]; }
          const hx = sd * B.hipW * 0.7;
          const k = ik(hx, 4, fx, fy, th, B.shin, [hx + 260 * (sit ? sd : 1), (fy + 4) / 2]);
          const d = `M ${r1(hx)} 4 L ${r1(k.el[0])} ${r1(k.el[1])} L ${r1(k.h[0])} ${r1(k.h[1])}`;
          legs[i].o.setAttribute('d', d); legs[i].i.setAttribute('d', d);
          legs[i].sh.setAttribute('d', ellipse(r1(k.h[0] + 8), r1(k.h[1] + 2), kid ? 18 : 26, kid ? 10 : 13));
        });
        const lean = (st.lean || 0) + Math.sin(2 * Math.PI * u) * 2 * amp;
        upper.setAttribute('transform', `rotate(${r1(lean)} 0 0) translate(0 ${r1(breath * 1.5)})`);
        // braços
        const swing = Math.sin(2 * Math.PI * u) * 24 * amp;
        const rest = [[-B.shW - 10 + swing, -B.torso * 0.12], [B.shW + 10 - swing, -B.torso * 0.12]];
        const tg = [st.L || rest[0], st.R || rest[1]];
        [armL, armR].forEach((a, i) => {
          const sd = i ? 1 : -1, sh = SH[i];
          const k = ik(sh[0], sh[1], tg[i][0], tg[i][1], B.up, B.fo, [sh[0] + sd * 300, sh[1] + 120]);
          const d = `M ${sh[0]} ${sh[1]} L ${r1(k.el[0])} ${r1(k.el[1])} L ${r1(k.h[0])} ${r1(k.h[1])}`;
          a.o.setAttribute('d', d); a.i.setAttribute('d', d);
          const sl = `M ${sh[0]} ${sh[1]} L ${r1(lerp(sh[0], k.el[0], kid ? 0.38 : 0.5))} ${r1(lerp(sh[1], k.el[1], kid ? 0.38 : 0.5))}`;
          a.so.setAttribute('d', sl); a.si.setAttribute('d', sl);
          a.hand.setAttribute('transform', `translate(${r1(k.h[0])} ${r1(k.h[1])}) rotate(${r1((i ? st.rotR : st.rotL) || 0)})`);
          a.end = k.h;
        });
        // cabeça
        const op = st.op || 0;
        const hr = (st.headRot || 0) + (Math.sin(t * 1.4 + (st.seed || 0)) * 1.5 + op * Math.sin(t * 11) * 3) * fr;
        head.setAttribute('transform', `translate(0 ${r1(HEADY - op * 4)}) rotate(${r1(hr)})`);
        if (backHair) backHair.setAttribute('transform', `translate(0 ${r1(HEADY - op * 3)}) rotate(${r1(hr * 0.7 - lean * 0.2)})`);
        const m = st.mood || MOODS.neutral;
        const b = fr ? blinkAt(t, (st.seed || 0) + 0.4) : 0;
        const pe = Object.assign({}, m, { lid: Math.max(m.lid || 0, b), px: (m.px || 0) + (st.look || 0), py: (m.py || 0) + (st.lookY || 0) });
        const xv = st.xeyes || 0;
        if (xv < 0.5) { eyeL(pe, -1, t); eyeR(pe, 1, t); } else { const z = Object.assign({}, pe, { lid: 1, happy: 0, tear: 0 }); eyeL(z, -1, t); eyeR(z, 1, t); }
        xe.setAttribute('opacity', xv > 0.5 ? 1 : 0);
        mouth(op, m.smile || 0, { tongue: st.tongue || 0 });
        blush.setAttribute('opacity', Math.max(kid ? 0.55 : 0, m.blush || 0).toFixed(2));
        sweat.setAttribute('opacity', (m.sweat || 0).toFixed(2));
        sweat.setAttribute('transform', `translate(0 ${r1((t * 34) % 30)})`);
        shades.setAttribute('opacity', st.shades ? 1 : 0);
        // pontos no mundo
        const W = tf(st.x, st.y, st.rot || 0, s * f, s);
        const up = (p) => { const c = Math.cos(lean * DEG), sn = Math.sin(lean * DEG); return W(p[0] * c - p[1] * sn, p[0] * sn + p[1] * c - hipH + bob); };
        rig.handR = up(armR.end); rig.handL = up(armL.end);
        rig.face = up([0, HEADY]);
        rig.top = up([0, HEADY - R * 1.1]);
      },
    };
    return rig;
  }
  const dad = () => makePerson(cont, DAD);
  const kid = () => makePerson(cont, KID);

  // ---------------- objetos ----------------
  function holder(specs, parent) {
    const g = WB.mk('g', {}, parent || cont);
    put(specs, g);
    const f = (x, y, rot = 0, sc = 1, op = 1) => {
      g.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)}) scale(${sc})`);
      g.setAttribute('opacity', op);
    };
    f.g = g;
    return f;
  }
  const flower = (x, y, r, c) => [0, 1, 2, 3, 4].map(k => circ(r1(x + Math.cos(k * 1.2566) * r), r1(y + Math.sin(k * 1.2566) * r), r * 0.7, c, 'none')).concat([circ(x, y, r * 0.6, '#fde047', 'none')]);
  // celular da vovó (capinha florida) — a mão fica embaixo
  const vovoPhone = (rec = true) => [box(-36, -118, 72, 128, 14, '#f9a8d4', null, 5), ...flower(-20, -100, 7, '#ffffff'), ...flower(22, -10, 6, '#ffffff'),
    box(-26, -104, 52, 98, 6, '#e0f2fe', null, 4), ...(rec ? [circ(0, -56, 18, '#ef4444', null, 4), { d: 'M -6 -66 L -6 -50 Q 0 -44 6 -50 L 6 -66 Q 0 -72 -6 -66 Z', fill: '#ffffff', c: 'none' }] : [])];
  const dadPhone = () => [box(-30, -112, 60, 116, 12, '#1f2937', null, 5), box(-22, -100, 44, 88, 5, '#ecfdf5', null, 3),
    box(-18, -66, 36, 22, 8, '#86efac', null, 3), { d: 'M -12 -60 l 0 10 l 8 -5 Z', fill: '#15803d', c: 'none' }];
  // balão de áudio que aparece no celular do papai
  const audioBubble = (x, y) => [box(x - 200, y - 52, 400, 104, 26, '#dcfce7', '#15803d', 6), circ(x - 150, y, 30, '#22c55e', null, 5),
    { d: `M ${x - 160} ${y - 14} l 0 28 l 24 -14 Z`, fill: '#ffffff', c: 'none' },
    { d: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `M ${x - 100 + i * 18} ${y - [10, 22, 14, 28, 18, 8, 24, 30, 12, 20, 26, 10][i]} L ${x - 100 + i * 18} ${y + [10, 22, 14, 28, 18, 8, 24, 30, 12, 20, 26, 10][i]}`).join(' '), c: '#15803d', w: 6 },
    T('0:34', x + 150, y + 14, 40, '#15803d')];
  const suitcase = () => [box(-34, 0, 68, 62, 8, '#a855f7', null, 5), { d: 'M -14 0 L -14 -14 L 14 -14 L 14 0', w: 5 }, { d: 'M -34 22 L 34 22', c: '#fde047', w: 5 },
    circ(-20, 66, 6, '#111', 'none'), circ(20, 66, 6, '#111', 'none')];
  const teddy = () => [circ(-26, -64, 15, '#b45309', null, 5), circ(26, -64, 15, '#b45309', null, 5), circ(0, -40, 34, '#d97706', null, 5),
    { d: ellipse(0, 10, 34, 38), fill: '#d97706', w: 5 }, { d: ellipse(0, 14, 18, 20), fill: '#fde68a', c: 'none' },
    circ(-12, -46, 4, '#111', 'none'), circ(12, -46, 4, '#111', 'none'), { d: ellipse(0, -32, 8, 5), fill: '#111', c: 'none' }, { d: 'M -8 -24 Q 0 -18 8 -24', w: 3 },
    { d: 'M -14 -4 l 28 0', c: '#ef4444', w: 7 }];
  // boneco de super-herói (o "boneco" do papai)
  const hero = () => [{ d: 'M -34 -40 L 34 -40 L 48 70 L -48 70 Z', fill: '#dc2626', w: 5 }, box(-24, -44, 48, 70, 10, '#2563eb', null, 5),
    { d: 'M -24 26 L -24 76 M 24 26 L 24 76', c: BK, w: 14 }, { d: 'M -24 26 L -24 76 M 24 26 L 24 76', c: '#2563eb', w: 7 },
    circ(0, -70, 28, '#fcd9b6', null, 5), { d: 'M -28 -76 L 28 -76 L 24 -64 L -24 -64 Z', fill: '#111827', c: 'none' },
    circ(-10, -70, 3, '#ffffff', 'none'), circ(10, -70, 3, '#ffffff', 'none'), { d: 'M -14 -14 L 14 -14 L 0 6 Z', fill: '#fde047', w: 4 }];
  const paoDeQueijo = (r = 90) => [{ d: WB.cloudPath(0, 0, r, r * 0.86, 10), fill: '#f6c45a', w: 7 }, { d: WB.cloudPath(-r * 0.15, -r * 0.2, r * 0.5, r * 0.36, 7), fill: '#fde68a', c: 'none' },
    circ(-r * 0.4, r * 0.25, 6, '#d97706', 'none'), circ(r * 0.3, r * 0.35, 5, '#d97706', 'none'), circ(r * 0.45, -r * 0.1, 5, '#d97706', 'none'), circ(-r * 0.05, r * 0.5, 4, '#d97706', 'none')];
  function star(x, y, r, fill = '#facc15') {
    let d = '';
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? ' L ' : 'M ') + r1(x + Math.cos(a) * rr) + ' ' + r1(y + Math.sin(a) * rr); }
    return { d: d + ' Z', fill, w: 5 };
  }
  function gear(r, n = 8) {
    let d = '';
    for (let i = 0; i < n * 4; i++) { const a = i / (n * 4) * Math.PI * 2, rr = (i % 4 < 2) ? r : r * 0.78; d += (i ? ' L ' : 'M ') + r1(Math.cos(a) * rr) + ' ' + r1(Math.sin(a) * rr); }
    return [{ d: d + ' Z', fill: '#d1d5db', w: 5 }, circ(0, 0, r * 0.3, '#fffdf5', null, 5)];
  }
  function calendar(x, y, top, big, c = INK.red, w = 300) {
    return [box(x - w / 2, y - 150, w, 300, 18, '#ffffff', null, 7), { d: WB.roundRectPath(x - w / 2, y - 150, w, 80, 18), fill: c, c: 'none' },
      { d: `M ${x - w / 2} ${y - 70} L ${x + w / 2} ${y - 70}`, w: 6 }, { d: `M ${x - 70} ${y - 170} L ${x - 70} ${y - 130} M ${x + 70} ${y - 170} L ${x + 70} ${y - 130}`, w: 10 },
      T(top, x, y - 94, 44, '#ffffff'), T(big, x, y + 60, big.length > 4 ? 64 : 120, BK)];
  }
  const bulb = (x, y) => [{ d: `M ${x - 40} ${y} Q ${x - 50} ${y - 80} ${x} ${y - 84} Q ${x + 50} ${y - 80} ${x + 40} ${y} Q ${x + 24} ${y + 14} ${x + 22} ${y + 34} L ${x - 22} ${y + 34} Q ${x - 24} ${y + 14} ${x - 40} ${y} Z`, fill: '#fde047', w: 6 },
    box(x - 24, y + 34, 48, 26, 6, '#9ca3af', null, 5),
    { d: [0, 1, 2, 3, 4].map(k => { const a = -Math.PI + k * Math.PI / 4; return `M ${r1(x + Math.cos(a) * 80)} ${r1(y - 40 + Math.sin(a) * 80)} L ${r1(x + Math.cos(a) * 112)} ${r1(y - 40 + Math.sin(a) * 112)}`; }).join(' '), c: '#f59e0b', w: 7 }];

  // ---------------- cenários ----------------
  const FL = 1450;
  function vovoRoom(o = {}) {
    const out = [
      { d: `M 60 520 L 1020 520 L 1020 ${FL} L 60 ${FL} Z`, fill: '#fdf0f6', c: 'none', fo: 0.85 },
      { d: `M 60 ${FL} L 1020 ${FL} L 1020 1700 L 60 1700 Z`, fill: '#e9d3ad', c: 'none', fo: 0.9 },
      { d: WB.roughLine(60, FL, 1020, FL, 2), w: 7 },
      { d: `M 120 ${FL + 70} L 300 ${FL + 70} M 420 ${FL + 130} L 640 ${FL + 130} M 720 ${FL + 60} L 980 ${FL + 60}`, c: '#b08968', w: 4 },
    ];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) out.push(...flower(150 + i * 160 + (j % 2) * 80, 640 + j * 190, 9, '#f9a8d4'));
    // quadro "família" e relógio cuco
    out.push(box(150, 700, 170, 140, 8, '#fef3c7', '#92400e', 8), circ(205, 760, 22, '#fde68a', null, 4), circ(265, 760, 22, '#fde68a', null, 4), heart(235, 810, 0.5));
    if (o.clock !== false) out.push({ d: 'M 760 640 L 840 590 L 920 640 L 920 760 L 760 760 Z', fill: '#a16207', w: 6 }, circ(840, 690, 40, '#fffdf5', null, 5), { d: 'M 840 690 L 840 664 M 840 690 L 860 700', w: 5 }, { d: 'M 820 760 L 820 820 M 860 760 L 860 840', c: '#a16207', w: 4 }, circ(820, 830, 10, '#facc15', null, 3), circ(860, 850, 10, '#facc15', null, 3));
    // planta
    if (o.plant !== false) out.push({ d: `M 110 ${FL} L 120 ${FL - 90} L 200 ${FL - 90} L 210 ${FL} Z`, fill: '#c2410c', w: 6 }, { d: WB.cloudPath(160, FL - 160, 60, 56, 9), fill: '#4ade80', w: 5 });
    return out;
  }
  // poltrona da vovó (com paninho de crochê)
  const armchair = (x) => [box(x - 130, FL - 340, 260, 230, 50, '#be185d', null, 7), box(x - 160, FL - 200, 60, 150, 26, '#9d174d', null, 7), box(x + 100, FL - 200, 60, 150, 26, '#9d174d', null, 7),
    box(x - 110, FL - 170, 220, 120, 20, '#db2777', null, 6), { d: `M ${x - 120} ${FL - 50} L ${x - 120} ${FL} M ${x + 120} ${FL - 50} L ${x + 120} ${FL}`, w: 10 },
    { d: WB.cloudPath(x, FL - 330, 70, 30, 10), fill: '#ffffff', w: 4 }];
  function dadRoom(o = {}) {
    const out = [
      { d: `M 60 520 L 1020 520 L 1020 ${FL} L 60 ${FL} Z`, fill: '#e8f1fb', c: 'none', fo: 0.85 },
      { d: `M 60 ${FL} L 1020 ${FL} L 1020 1700 L 60 1700 Z`, fill: '#d6c7b0', c: 'none', fo: 0.9 },
      { d: WB.roughLine(60, FL, 1020, FL, 2), w: 7 },
      // janela
      box(120, 640, 230, 260, 10, '#bae6fd', null, 7), { d: 'M 235 640 L 235 900 M 120 770 L 350 770', w: 6 }, cloud(210, 700, 50, 20, '#ffffff', '#93c5fd'),
      // quadro na parede
      box(760, 660, 190, 140, 6, '#fef9c3', '#78350f', 7), { d: 'M 780 780 L 830 710 L 870 760 L 900 730 L 930 780 Z', fill: '#86efac', w: 4 }, circ(900, 700, 14, '#fde047', null, 4),
      // abajur
      { d: `M 960 ${FL} L 960 ${FL - 300}`, w: 8 }, { d: `M 910 ${FL - 300} L 1010 ${FL - 300} L 990 ${FL - 380} L 930 ${FL - 380} Z`, fill: '#fde68a', w: 6 },
    ];
    return out;
  }
  // sofá: frente (cobre o quadril) e fundo (atrás do papai)
  const sofaBack = (x = 540, w = 600) => [box(x - w / 2, FL - 380, w, 280, 40, '#64748b', null, 7), box(x - w / 2 - 50, FL - 250, 90, 230, 30, '#475569', null, 7), box(x + w / 2 - 40, FL - 250, 90, 230, 30, '#475569', null, 7)];
  const sofaSeat = (x = 540, w = 600) => [box(x - w / 2 + 30, FL - 150, w - 60, 110, 20, '#94a3b8', null, 6), { d: `M ${x} ${FL - 146} L ${x} ${FL - 44}`, c: '#64748b', w: 4 },
    { d: `M ${x - w / 2 + 30} ${FL - 40} L ${x - w / 2 + 30} ${FL} M ${x + w / 2 - 30} ${FL - 40} L ${x + w / 2 - 30} ${FL}`, w: 10 }];

  const CTA0 = 36.0;

  // conversão mundo (dentro do zoom da cena) -> tela
  const toS = (zk, zx, zy) => (p) => [zx + (p[0] - zx) * zk, zy + (p[1] - zy) * zk];
  const cup = () => [{ d: 'M 22 -30 Q 44 -30 44 -14 Q 44 2 22 2', w: 7 }, { d: 'M -28 -34 L 28 -34 L 22 6 Q 0 14 -22 6 Z', fill: '#ffffff', w: 5 },
    { d: 'M -12 -20 Q 0 -12 12 -20', c: '#ef4444', w: 4 }, { d: ellipse(0, -34, 28, 7), fill: '#7c2d12', w: 4 }];
  // papai sentado no sofá (pose base)
  const DADX = 540, SEAT = 140;
  const dadSit = (o) => Object.assign({ x: DADX, y: FL, s: 1, f: 1, sit: 1, seatH: SEAT, seed: 0.7, L: [-46, -96], R: [100, -238], rotR: -12, rotL: 0 }, o);
  const KS = 1.22;   // escala da pequena

  // ---------------- título + legenda (faixa amarela) ----------------
  const titleG = WB.mk('g', {}, WB.overlay);
  {
    const a = 'O ÁUDIO DA ', b = 'BAIXINHA', size = 82;
    const tw = WB.measure(a + b, size), x0 = 540 - tw / 2;
    WB.showNow(WB.textStrokes(a, x0, 200, size, BK, titleG, 'start').strokes);
    WB.showNow(WB.textStrokes(b, x0 + WB.measure(a, size), 200, size, '#db2777', titleG, 'start').strokes);
    WB.showNow(WB.strokePath(WB.wavyLine(x0, x0 + tw, 222, 6, 60), '#f59e0b', 6, titleG));
    WB.effect(t => titleG.setAttribute('opacity', t < CTA0 ? clamp(t / 0.3) : clamp(1 - (t - CTA0) / 0.3)));
  }
  const capLayer = WB.mk('g', {}, WB.overlay);
  const CAPS = [
    [0.35, 'Ô pai,'], [2.95, 'daqui a 8 dias'], [6.0, 'eu vou ir embora, tá?'], [8.6, 'Porque eu quero pegar uma coisa'],
    [10.9, 'que você nunca imagina como é.'], [13.9, 'É que eu quero esconder o meu boneco,'], [16.7, 'o seu boneco.'],
    [17.9, 'É que... hmmm...'], [21.0, 'você... (???)'], [23.2, 'pai... pai...'], [25.0, 'porque...'], [26.7, ''],
    [28.4, 'E o pão de queijo...'], [30.2, 'Por favor, eu quero comer amanhã.'], [32.4, 'Não, depois de amanhã.'], [34.1, ''],
  ];
  CAPS.forEach(([t0, text], i) => {
    if (!text) return;
    const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : CTA0;
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

  // =====================================================================
  // CENA 1 (0–2,9): na casa da vovó, a pequena entra com o celular da vovó e grava: "Ô pai"
  // =====================================================================
  const S1 = [[0, 2.9]];
  shot(S1);
  put([vovoRoom(), armchair(860)]);
  const k1 = kid();
  put(vovoPhone(), k1.itemR);
  const K1X = K([[0, -40], [1.1, 430, 'o']]), K1o = odo(K1X, 0, 3);
  const K1M = moodTrack(MOODS, [[0, 'happy'], [0.5, 'joy'], [1.9, 'happy']]);
  WB.effect(t => {
    if (!inWin(S1, t)) return;
    const wave = t > 0.3 && t < 2.2;
    k1.update(t, Object.assign({ x: K1X(t), y: FL, s: KS, f: 1, seed: 0.1, mood: K1M(t), op: talk(K_WIN, t, 1.3), R: [64, -112], rotR: -8,
      L: wave ? [-150 + Math.sin(t * 14) * 22, -165 + Math.cos(t * 14) * 14] : undefined, headRot: Math.sin(t * 5) * 4 }, K1o(t)));
  });
  O(0.2, [circ(355, 520, 16, '#ef4444', 'none'), T('gravando áudio...', 560, 536, 50, INK.red)], { loop: 'pulse', until: 2.9 });
  OT(1.2, 'celular da vovó', 800, 760, 50, '#be185d', -4);
  O(1.25, [{ d: 'M 720 790 Q 690 840 650 860', c: '#be185d', w: 6 }, { d: WB.arrowHead(650, 860, 2.6, 18), c: '#be185d', w: 6 }]);

  // =====================================================================
  // CENA 2 (2,9–5,9): o papai no sofá recebe o áudio e põe no ouvido... "daqui a 8 dias"
  // =====================================================================
  const S2 = [[2.9, 5.9]];
  shot(S2);
  put([dadRoom(), sofaBack(), sofaSeat()]);
  const d2 = dad();
  put(dadPhone(), d2.itemR); put(cup(), d2.itemL);
  const D2R = K([[2.9, [76, -150]], [3.7, [76, -150]], [4.1, [100, -238], 'b']]);
  const D2M = moodTrack(MOODS, [[2.9, 'happy'], [4.15, 'neutral'], [4.6, 'confused'], [5.2, 'shock']]);
  WB.effect(t => {
    if (!inWin(S2, t)) return;
    const reading = t < 3.9;
    d2.update(t, dadSit({ mood: D2M(t), R: D2R(t), rotR: reading ? 0 : -12, look: reading ? 10 : 0, lookY: reading ? 10 : 0, headRot: reading ? 6 : -4 + bump(t, 5.2, 5.9) * -6 }));
  });
  O(3.0, audioBubble(540, 480), { anim: 'fly', fy: -40, until: 4.2 });
  O(3.05, [T('Vovó', 360, 410, 40, '#15803d')], { until: 4.2 });
  O(4.5, calendar(800, 680, 'DAQUI A', '8 DIAS', INK.red, 280), { anim: 'slam', loop: 'shake' });
  OT(5.0, '???', 260, 640, 110, '#7c3aed', -8, { loop: 'wiggle' });

  // =====================================================================
  // CENA 3 (5,9–8,6): "eu vou ir embora, tá?" — óculos escuros, malinha de rodinha, atravessa a sala
  // =====================================================================
  const S3 = [[5.9, 8.6]];
  shot(S3);
  put(vovoRoom({ plant: false }));
  const k3 = kid();
  put(suitcase(), k3.itemL);
  const K3X = K([[5.9, 120], [8.5, 900, 'l']]), K3o = odo(K3X, 5.8, 8.7);
  WB.effect(t => {
    if (!inWin(S3, t)) return;
    k3.update(t, Object.assign({ x: K3X(t), y: FL, s: KS, f: 1, seed: 0.1, mood: MOODS.proud, op: talk(K_WIN, t, 1.3), shades: true, lean: 5,
      L: [-66, -14], R: [150 + Math.sin(t * 13) * 22, -165 + Math.cos(t * 13) * 14], headRot: -6 + Math.sin(t * 4) * 4 }, K3o(t)));
  });
  ostamp(6.9, 'TCHAU!', 620, 560, 96, '#7c3aed', -6, { until: 8.6 });
  O(6.2, [...[0, 1, 2].map(i => cloud(170 + i * 40, 1560 - i * 14, 36, 18, '#e7e5e4', '#a8a29e'))], { loop: 'rise', until: 7.6 });

  // =====================================================================
  // CENA 4 (8,6–10,9): close no papai em pânico: "embora pra onde?!", "pegar o quê?!"
  // =====================================================================
  const S4 = [[8.6, 10.9]];
  shot(S4, 2.0, 540, 1000);
  put([dadRoom(), sofaBack(), sofaSeat()]);
  const d4 = dad();
  put(dadPhone(), d4.itemR); put(cup(), d4.itemL);
  WB.effect(t => {
    if (!inWin(S4, t)) return;
    const tr = Math.sin(t * 46) * 5;
    d4.update(t, dadSit({ mood: MOODS.horror, L: [-46 + tr, -150], rotL: tr * 2, headRot: Math.sin(t * 30) * 2, lean: -3 }));
  });
  O(8.65, thought(540, 560, 380, 120, [[420, 720, 22], [470, 670, 32]]), { until: 10.9 });
  OT(8.7, 'EMBORA PRA ONDE?!', 540, 585, 74, INK.red, -2, { until: 9.95, loop: 'tremble' });
  OT(10.0, 'PEGAR O QUÊ?!', 540, 585, 80, '#7c3aed', 2, { loop: 'tremble' });

  // =====================================================================
  // CENA 5 (10,9–13,9): "uma coisa que você nunca imagina como é" — a caixa misteriosa
  // =====================================================================
  const S5 = [[10.9, 13.9]];
  shot(S5);
  put(vovoRoom());
  const k5 = kid();
  put(vovoPhone(), k5.itemR);
  const K5X = K([[10.9, 300], [11.6, 360, 'o']]), K5o = odo(K5X, 10.8, 14);
  WB.effect(t => {
    if (!inWin(S5, t)) return;
    k5.update(t, Object.assign({ x: K5X(t), y: FL, s: KS, f: 1, seed: 0.1, mood: MOODS.sly, op: talk(K_WIN, t, 1.3), R: [64, -112], rotR: -8,
      L: [-34, -150], look: 9, headRot: 8, lean: 4 }, K5o(t)));
  });
  P(11.1, [box(640, 1200, 230, 230, 10, '#a855f7', null, 7), { d: 'M 755 1200 L 755 1430 M 640 1315 L 870 1315', c: '#fde047', w: 14 },
    { d: 'M 755 1200 Q 700 1130 720 1170 Q 690 1120 755 1200 Q 820 1120 790 1170 Q 810 1130 755 1200', fill: '#fde047', w: 5 }], { anim: 'slam', loop: 'shake' });
  P(11.3, [T('?', 755, 1100, 150, '#7c3aed')], { loop: 'float' });
  P(11.6, [star(620, 1150, 26), star(900, 1200, 20, '#f472b6'), star(880, 1060, 16)], { loop: 'pulse' });
  OT(12.2, 'segredo!', 820, 700, 64, '#be185d', 6, { loop: 'wiggle' });

  // =====================================================================
  // CENA 6 (13,9–16,7): "esconder o meu boneco" — anda nas pontinhas dos pés e esconde o ursinho atrás da poltrona
  // =====================================================================
  const S6 = [[13.9, 16.7]];
  shot(S6);
  put(vovoRoom({ clock: false }));
  const teddyBack = holder(teddy());
  put(armchair(860));
  const k6 = kid();
  const teddyFront = holder(teddy());
  const K6X = K([[13.9, 90], [15.8, 610, 'l'], [16.0, 620, 'o']]), K6o = odo(K6X, 13.8, 16.8);
  const TOSS = 15.85;
  WB.effect(t => {
    if (!inWin(S6, t)) return;
    const tossed = t > TOSS;
    const sneak = Math.sin(t * 6) * 3;
    k6.update(t, Object.assign({ x: K6X(t), y: FL, s: KS, f: 1, seed: 0.1, mood: tossed ? MOODS.proud : MOODS.sly, op: talk(K_WIN, t, 1.3),
      lift: 40, lean: tossed ? 0 : 8 + sneak, look: 8,
      L: tossed ? [-40, -140 + Math.sin(t * 9) * 10] : [-26, -66], R: tossed ? [80, -210] : [26, -66], headRot: 6 }, K6o(t)));
    const hp = [(k6.handL[0] + k6.handR[0]) / 2, (k6.handL[1] + k6.handR[1]) / 2];
    teddyFront(hp[0], hp[1] + 10, 0, KS * 0.9, tossed ? 0 : 1);
    const u = clamp((t - TOSS) / 0.45), e = eo(u);
    const tx = lerp(hp[0], 880, e), ty = lerp(hp[1], FL - 300, u) - Math.sin(Math.PI * u) * 220;
    teddyBack(tx, ty, u * 360, KS * 0.9, tossed ? 1 : 0);
  });
  OT(14.2, 'shhh...', 300, 700, 70, '#7c3aed', -6, { loop: 'wiggle', until: 15.8 });
  OT(16.15, 'escondido!', 760, 640, 70, '#15803d', 5, { anim: 'slam' });

  // =====================================================================
  // CENA 7 (16,7–17,9): "o SEU boneco" — o papai abraça o boneco dele
  // =====================================================================
  const S7 = [[16.7, 17.9]];
  shot(S7, 1.5, 540, 1100);
  put([dadRoom(), sofaBack(), sofaSeat()]);
  const d7 = dad();
  const heroH = holder(hero());
  WB.effect(t => {
    if (!inWin(S7, t)) return;
    const sh = Math.sin(t * 40) * 3;
    d7.update(t, dadSit({ mood: MOODS.horror, L: [-30, -112], R: [30, -112], rotR: 0, lean: -5 + sh * 0.4, headRot: -8 + sh }));
    heroH(DADX - 6 + sh, FL - SEAT - 100, -8, 1.1);
  });
  ostamp(16.85, 'O MEU NÃO!', 540, 600, 96, INK.red, -5, { loop: 'shake' });

  // =====================================================================
  // CENA 8 (17,9–21,0): "É que... hmmm..." — engrenagens girando, barra de carregamento
  // =====================================================================
  const S8 = [[17.9, 21.0]];
  const Z8 = [1.3, 540, 1250];
  shot(S8, ...Z8);
  put(vovoRoom());
  const k8 = kid();
  put(vovoPhone(false), k8.itemL);
  const g1 = WB.mk('g', {}, ov), g2 = WB.mk('g', {}, ov);
  put(gear(70, 9), g1); put(gear(46, 7), g2);
  const t8 = toS(...Z8);
  WB.effect(t => {
    if (!inWin(S8, t)) return;
    k8.update(t, { x: 540, y: FL, s: KS, f: 1, seed: 0.1, mood: MOODS.think, op: talk(K_WIN, t, 1.3), R: [24, -126], L: [-70, -10], rotL: 170,
      headRot: 8 + Math.sin(t * 1.6) * 5, lean: Math.sin(t * 1.2) * 3 });
    const p = t8(k8.top);
    const sm = clamp((t - 18.2) / 0.3);
    g1.setAttribute('transform', `translate(${r1(p[0] - 50)} ${r1(p[1] - 70)}) rotate(${r1(t * 120)}) scale(${sm})`);
    g2.setAttribute('transform', `translate(${r1(p[0] + 64)} ${r1(p[1] - 118)}) rotate(${r1(-t * 180)}) scale(${sm})`);
  });
  O(19.0, [cloud(420, 640, 46, 26, '#e5e7eb', '#9ca3af'), cloud(660, 600, 40, 22, '#e5e7eb', '#9ca3af')], { loop: 'rise' });
  O(18.05, [box(250, 440, 580, 64, 30, '#ffffff', null, 6), T('pensando...', 540, 425, 50, '#6b7280')]);
  {
    const bar = WB.mk('rect', { x: 262, y: 452, width: 0, height: 40, rx: 20, fill: '#22c55e' }, ov);
    WB.effect(t => { if (inWin(S8, t)) bar.setAttribute('width', r1(556 * 0.97 * eio(clamp((t - 18.1) / 2.8)))); });
  }

  // =====================================================================
  // CENA 9 (21,0–24,4): o papai encosta o celular na orelha... cada vez mais perto
  // =====================================================================
  const S9 = [[21.0, 24.4]];
  shot(S9, 1.6, 540, 1080);
  put([dadRoom(), sofaBack(), sofaSeat()]);
  const d9 = dad();
  const ph9 = WB.mk('g', {}, d9.itemR); put(dadPhone(), ph9); put(cup(), d9.itemL);
  const LEAN9 = K([[21.0, 0], [23.6, 16, 'io']]), PS9 = K([[21.0, 1], [23.6, 1.7, 'io']]);
  WB.effect(t => {
    if (!inWin(S9, t)) return;
    ph9.setAttribute('transform', `scale(${PS9(t).toFixed(3)})`);
    d9.update(t, dadSit({ mood: MOODS.squint, lean: LEAN9(t), headRot: 4 + LEAN9(t) * 0.6, L: [-50, -60] }));
  });
  OT(21.5, 'hã?', 280, 620, 100, '#7c3aed', -8, { loop: 'wiggle' });
  OT(22.6, 'como é que é?', 640, 520, 70, '#7c3aed', 5, { loop: 'wiggle' });
  OT(23.6, '???', 300, 800, 110, '#7c3aed', -4, { loop: 'pulse' });

  // =====================================================================
  // CENA 10 (24,4–26,8): "pai... pai... porque..." — anda pra lá e pra cá, olhando pro teto
  // =====================================================================
  const S10 = [[24.4, 26.8]];
  shot(S10);
  put(vovoRoom({ plant: false }));
  const k10 = kid();
  put(vovoPhone(), k10.itemR);
  const K10X = K([[24.4, 380], [25.2, 600], [26.0, 400], [26.8, 520]]), K10o = odo(K10X, 24.3, 26.9);
  WB.effect(t => {
    if (!inWin(S10, t)) return;
    const pq = t > 25.8;
    const fwd = K10X(t + 0.05) >= K10X(t - 0.05) ? 1 : -1;
    k10.update(t, Object.assign({ x: K10X(t), y: FL, s: KS, f: 1, seed: 0.1, mood: pq ? MOODS.think : MOODS.bored, op: talk(K_WIN, t, 1.3), R: [64, -112], rotR: -8,
      L: pq ? [-150, -160] : undefined, headRot: Math.sin(t * 3) * 7, lean: fwd * 4 }, K10o(t)));
  });
  OT(24.5, 'pai...', 820, 720, 60, '#be185d', 4, { loop: 'float' });
  OT(25.0, 'pai...', 240, 640, 52, '#be185d', -5, { loop: 'float' });
  OT(25.5, 'pai...', 760, 540, 44, '#be185d', 6, { loop: 'float' });

  // =====================================================================
  // CENA 11 (26,8–28,4): silêncio. O papai congelado, grilo cantando, bola de feno rolando
  // =====================================================================
  const S11 = [[26.8, 28.4]];
  shot(S11);
  put([dadRoom(), sofaBack(), sofaSeat()]);
  const d11 = dad();
  put(dadPhone(), d11.itemR); put(cup(), d11.itemL);
  const weed = holder([{ d: WB.cloudPath(0, 0, 60, 56, 11), fill: '#d6b88a', w: 5 }, { d: 'M -40 -20 Q 0 30 40 -10 M -30 30 Q 10 -40 44 20 M -46 10 Q 0 -10 30 40', c: '#92400e', w: 4 }]);
  const WX = K([[26.8, 1120], [28.4, -80, 'l']]);
  WB.effect(t => {
    if (!inWin(S11, t)) return;
    d11.update(26.9, dadSit({ mood: MOODS.blank, frozen: true, L: [-46, -150] }));
    const x = WX(t);
    weed(x, FL - 56 - Math.abs(Math.sin(x / 70)) * 40, -x * 0.9, 1);
  });
  OT(26.95, '(silêncio)', 540, 470, 64, '#6b7280', 0);
  OT(27.2, 'cri... cri...', 790, 640, 60, '#15803d', 5, { loop: 'wiggle' });
  OT(27.8, 'tic tac', 250, 640, 56, '#6b7280', -6, { loop: 'pulse' });

  // =====================================================================
  // CENA 12 (28,4–32,3): ideia! "E o pão de queijo..." / "por favor" / "comer amanhã"
  // =====================================================================
  const S12 = [[28.4, 32.3]];
  const Z12 = [1.25, 540, 1200];
  shot(S12, ...Z12);
  put(vovoRoom({ clock: false }));
  P(28.6, [...paoDeQueijo(120)], { anim: 'slam', loop: 'pulse', parent: WB.mk('g', { transform: 'translate(800 1150)' }, cont) });
  P(28.75, [star(660, 1010, 24), star(950, 1040, 20, '#f472b6'), star(900, 1290, 16), star(680, 1300, 14, '#f472b6')], { loop: 'pulse' });
  const k12 = kid();
  put(vovoPhone(), k12.itemR);
  const K12X = K([[28.4, 260], [29.7, 450, 'o']]), K12o = odo(K12X, 28.3, 32.4);
  const K12M = moodTrack(MOODS, [[28.4, 'shock'], [28.65, 'joy'], [30.2, 'innocent'], [31.0, 'greedy']]);
  const bulbG = WB.mk('g', { opacity: 0 }, ov);
  put(bulb(0, 0), bulbG);
  const t12 = toS(...Z12);
  WB.effect(t => {
    if (!inWin(S12, t)) return;
    const pls = t >= 30.2 && t < 31.0;
    const hopv = t < 29.8 ? Math.abs(Math.sin((t - 28.5) * 8)) * 40 : (t > 31.0 ? Math.abs(Math.sin(t * 7)) * 18 : 0);
    k12.update(t, Object.assign({ x: K12X(t), y: FL, s: KS, f: 1, seed: 0.1, mood: K12M(t), op: talk(K_WIN, t, 1.3), hop: hopv,
      R: pls ? [8, -62] : [64, -112], rotR: pls ? 180 : -8, L: pls ? [-8, -62] : (t < 30.2 ? [-150, -160 + Math.sin(t * 10) * 16] : undefined),
      look: 10, tongue: t > 31.4 ? 0.7 + 0.3 * Math.sin(t * 12) : 0, headRot: pls ? -8 : Math.sin(t * 6) * 5 }, K12o(t)));
    const p = t12(k12.top), u = clamp((t - 28.45) / 0.25);
    bulbG.setAttribute('opacity', t < 29.6 ? u : clamp(1 - (t - 29.6) / 0.2));
    bulbG.setAttribute('transform', `translate(${r1(p[0])} ${r1(p[1] - 40)}) scale(${backOut(u).toFixed(3)})`);
  });
  OT(30.3, 'por favorzinho', 560, 600, 60, '#db2777', -5, { loop: 'float', until: 31.0 });
  O(31.0, calendar(300, 620, 'AMANHÃ', '', '#16a34a', 240), { anim: 'slam' });
  O(31.05, [heart(300, 660, 1.6)], { loop: 'pulse' });

  // =====================================================================
  // CENA 13 (32,3–34,1): "Não, depois de amanhã." — dedinho de "não não" e o calendário vira
  // =====================================================================
  const S13 = [[32.3, 34.1]];
  shot(S13);
  put(vovoRoom({ clock: false, plant: false }));
  const k13 = kid();
  put(vovoPhone(), k13.itemR);
  WB.effect(t => {
    if (!inWin(S13, t)) return;
    k13.update(t, { x: 330, y: FL, s: KS, f: 1, seed: 0.1, mood: MOODS.stern, op: talk(K_WIN, t, 1.3), R: [64, -112], rotR: -8,
      L: [-150 + Math.sin(t * 15) * 22, -158], rotL: Math.sin(t * 15) * 20, headRot: Math.sin(t * 9) * 8 });
  });
  O(32.35, calendar(760, 760, 'AMANHÃ', '', '#16a34a', 300));
  O(32.7, [{ d: 'M 640 700 L 880 900 M 880 700 L 640 900', c: INK.red, w: 16 }], { anim: 'slam' });
  ostamp(33.3, 'DEPOIS DE AMANHÃ!', 620, 520, 76, INK.red, -4, { loop: 'shake' });

  // =====================================================================
  // CENA 14 (34,1–36,0): o papai cai do sofá — "TUDO ISSO POR UM PÃO DE QUEIJO?!"
  // =====================================================================
  const S14 = [[34.1, CTA0]];
  shot(S14, 1.05, 540, 1200);
  put([dadRoom(), sofaBack(), sofaSeat()]);
  const d14 = dad();
  const phoneFly = holder(dadPhone()), cupFly = holder(cup());
  const ROT = K([[34.1, 0], [34.45, 0], [34.95, -86, 'i'], [35.15, -80, 'o']]), HOP = K([[34.1, 0], [34.3, 70, 'o'], [34.6, 0, 'i']]);
  const X14 = K([[34.1, DADX], [34.95, 660, 'io']]);
  WB.effect(t => {
    if (!inWin(S14, t)) return;
    const down = t > 34.95, kick = Math.sin(t * 22) * 22;
    d14.update(t, dadSit({ x: X14(t), rot: ROT(t), hop: HOP(t), mood: down ? MOODS.dead : MOODS.horror, xeyes: down ? 1 : 0, tongue: down ? 0.8 : 0,
      L: t < 34.4 ? [-90, -230] : [-150, -150], R: t < 34.4 ? [110, -230] : [150, -150], rotR: 0,
      footT: down ? [[118, -30 + kick], [116, 36 - kick]] : null, headRot: down ? 8 : 0 }));
    const u = clamp((t - 34.3) / 0.9);
    phoneFly(lerp(DADX + 100, 900, u), FL - 380 - Math.sin(Math.PI * u) * 300 + u * 330, u * 720, 1, t > 34.3 ? 1 : 0);
    cupFly(lerp(DADX - 60, 250, u), FL - 260 - Math.sin(Math.PI * u) * 260 + u * 230, -u * 540, 1, t > 34.3 ? 1 : 0);
  });
  O(34.95, [burst(640, 1180, 100, '#fef08a'), T('PLOFT!', 640, 1205, 70, INK.red)], { anim: 'slam' });
  O(34.4, [box(130, 400, 820, 210, 20, '#fffdf5', INK.red, 10), T('TUDO ISSO POR UM', 540, 480, 76, INK.red), T('PÃO DE QUEIJO?!', 540, 570, 84, INK.red)], { anim: 'slam', loop: 'shake' });

  // =====================================================================
  // CTA (36,0–fim)
  // =====================================================================
  shot([[CTA0, 999]], 1);
  {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 560, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 650, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@caderno_amarelo', 380, 650 + 190 * 0.62, 84, BK, g).strokes);
    animate(g, CTA0 + 0.1, { loop: 'float' });
    put([{ d: WB.roughLine(96, 1600, 1060, 1600, 2), w: 7 }]);
    const dc = makePerson(cont, DAD), kc = makePerson(cont, KID);
    put(paoDeQueijo(44), kc.itemR);
    WB.effect(t => {
      if (t < CTA0) return;
      dc.update(t, { x: 360, y: 1600, s: 0.85, f: 1, seed: 0.7, mood: MOODS.joy, L: [-90 + Math.sin(t * 10) * 26, -250], R: [70, -40] });
      kc.update(t, { x: 720, y: 1600, s: 1.15, f: 1, seed: 0.1, mood: MOODS.joy, hop: Math.abs(Math.sin(t * 6)) * 40, R: [130, -110], L: [-150 + Math.sin(t * 12) * 20, -160] });
    });
  }

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA: @caderno_amarelo troca de canto a cada ~5 s
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
    const SPOTS = [[300, 420], [770, 420], [790, 1560], [300, 1560]];
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
