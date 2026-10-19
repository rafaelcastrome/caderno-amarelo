// Meme "Minha esposa adora morar comigo, só não pode ter vestígio" (áudio original de um vídeo do Instagram; autor a confirmar).
// Só a voz do vídeo original: as imagens foram descartadas e as cenas foram criadas a partir das falas.
// Formato de cenas no papel do caderno: cortes com deslize, faixa amarela de legenda (texto rosa = fala da esposa,
// imitada pelo marido) e bonecos articulados (makePerson, base dos memes "o áudio da baixinha" e "Mobi"):
// o marido (camiseta branca, bermuda, óculos na cabeça) e a esposa (cabelo comprido, blazer, lupa de detetive).
// A marca d'água @cardeno_amarelo passeia por 4 cantos seguros. Risada de plateia no final.
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

  // ---------------- áudio: energia (20/s) e quem fala ----------------
  const ENV = '00002301626068764553022321000444976730089995382008984268742346874443463026755421231000016984898689618578531001121222333333223222111122111000000003944999768859438967977978937958278727757963267762772038828875555502450886451551200000049949678558486829982552876200200305640774444027763100000262455187621121000000265316735655101041430000000000122212222111110000000000354225995424772588864300020574388952799848886698744689999677300000000000079999865489999726999974656268987899759843320110010599999559999954782236788775787799742200121210111012386885996699969989868987498577199997696787394987322233334533444333443333244211688421599840068999887766665555566665656656536655640006999777640009999578736513420012286100343000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  // uma voz só (o marido); entre 11,55 e 13,1 s ele imita a esposa, então quem mexe a boca é ela
  const E_WIN = [[11.55, 13.1]];
  const M_WIN = [[0.15, 1.45], [1.55, 5.4], [7.3, 11.45], [13.15, 16.6], [18.15, 21.4], [21.85, 24.1], [24.35, 26.75], [26.85, 30.75]];
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
  // RIG DE GENTE (marido e esposa). Origem = chão embaixo do quadril; de frente para a câmera.
  // st: x, y, s, f, d/v (odômetro), sit, seatH, lean, rot, hop, headRot, mood, op, look, lookY,
  //     L, R (alvos das mãos, coordenadas do quadril), rotL, rotR, footT (alvos dos pés), xeyes, shades, lift, frozen,
  //     alpha (marido "fantasma"), steam (fumaça saindo das orelhas)
  // =====================================================================
  // marido: barba, cabelo curto, óculos escuros na cabeça, camiseta branca, bermuda preta e chinelo azul
  const MARIDO = { kind: 'dad', thigh: 94, shin: 92, torso: 194, neck: 14, R: 90, up: 82, fo: 80, shW: 58, hipW: 28, legW: 24, armW: 16,
    skin: '#e8b48f', shirt: '#ffffff', pants: '#1f2937', shoe: '#2563eb', hair: '#4a2f1d', beard: '#5b3a24', trim: '#9ca3af', shorts: true, shadesUp: true };
  // esposa: cabelo comprido castanho, blazer vinho, calça preta, salto
  const ESPOSA = { kind: 'woman', thigh: 92, shin: 92, torso: 182, neck: 14, R: 84, up: 78, fo: 76, shW: 50, hipW: 26, legW: 20, armW: 14,
    skin: '#f3c6a5', shirt: '#be185d', pants: '#111827', shoe: '#111827', hair: '#6b3a1f', trim: '#fbcfe8', longSleeve: true };
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
    const R = B.R, kid = B.kind === 'kid', woman = B.kind === 'woman';
    const g = WB.mk('g', {}, parent);
    const hipG = WB.mk('g', {}, g);
    const legsG = WB.mk('g', {}, hipG);
    const mkLeg = () => ({ o: dyn(legsG, { 'stroke-width': B.legW + 10 }), sk: B.shorts ? dyn(legsG, { stroke: B.skin, 'stroke-width': B.legW }) : null,
      i: dyn(legsG, { stroke: B.pants || B.skin, 'stroke-width': B.shorts ? B.legW + 8 : B.legW }),
      sh: WB.mk('path', { d: '', fill: B.shoe, stroke: BK, 'stroke-width': 5 }, legsG) });
    const legs = [mkLeg(), mkLeg()];
    const upper = WB.mk('g', {}, hipG);
    const backHair = kid ? WB.mk('path', { d: WB.cloudPath(0, 0, R * 1.08, R * 1.02, 12), fill: B.hair, stroke: BK, 'stroke-width': 6 }, upper)
      : (B.curly ? WB.mk('path', { d: WB.cloudPath(0, -R * 0.32, R * 1.34, R * 1.12, 15), fill: B.hair, stroke: BK, 'stroke-width': 6 }, upper)
        : (woman ? WB.mk('path', { d: `M ${-R * 1.0} ${-R * 0.3} Q ${-R * 1.18} ${-R * 1.2} 0 ${-R * 1.14} Q ${R * 1.18} ${-R * 1.2} ${R * 1.0} ${-R * 0.3} Q ${R * 1.2} ${R * 0.9} ${R * 1.12} ${R * 1.75} Q ${R * 0.6} ${R * 1.95} 0 ${R * 1.8} Q ${-R * 0.6} ${R * 1.95} ${-R * 1.12} ${R * 1.75} Q ${-R * 1.2} ${R * 0.9} ${-R * 1.0} ${-R * 0.3} Z`, fill: B.hair, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, upper) : null));
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
      if (woman) {
        WB.mk('path', { d: `M -26 ${-H} L 0 ${-H + 70} L 26 ${-H} Z`, fill: B.trim, stroke: BK, 'stroke-width': 4 }, upper);
        dyn(upper, { d: `M -30 ${-H + 2} L -6 ${-H + 90} M 30 ${-H + 2} L 6 ${-H + 90}`, 'stroke-width': 5 });
        [-60, -30].forEach(y => WB.mk('circle', { cx: 0, cy: y, r: 6, fill: '#fde047', stroke: BK, 'stroke-width': 3 }, upper));
      } else dyn(upper, { d: `M -30 -84 q 30 22 60 0`, 'stroke-width': 4, stroke: B.trim || '#1e40af' });
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
    if (woman) [-1, 1].forEach(sd => WB.mk('circle', { cx: sd * R * 0.93, cy: R * 0.32, r: 9, fill: '#fde047', stroke: BK, 'stroke-width': 3 }, head));
    if (!kid && !woman) {
      // barba por fazer
      WB.mk('path', { d: `M ${-R * 0.84} ${R * 0.12} Q ${-R * 0.7} ${R * 0.92} 0 ${R * 0.94} Q ${R * 0.7} ${R * 0.92} ${R * 0.84} ${R * 0.12} Q ${R * 0.5} ${R * 0.5} ${R * 0.26} ${R * 0.36} Q 0 ${R * 0.3} ${-R * 0.26} ${R * 0.36} Q ${-R * 0.5} ${R * 0.5} ${-R * 0.84} ${R * 0.12} Z`, fill: B.beard || '#8b6b55', opacity: B.beard ? 1 : 0.28 }, head);
    }
    const blush = WB.mk('g', { opacity: kid ? 0.55 : 0 }, head);
    WB.mk('path', { d: ellipse(-R * 0.6, R * 0.36, 15, 9), fill: '#fb7185' }, blush); WB.mk('path', { d: ellipse(R * 0.6, R * 0.36, 15, 9), fill: '#fb7185' }, blush);
    const ex = R * (kid ? 0.38 : 0.36), ey = kid ? R * 0.04 : -R * 0.1, erx = R * (kid ? 0.24 : 0.19), ery = R * (kid ? 0.29 : 0.24);
    const eyeL = makeEye(head, -ex, ey, erx, ery, B.skin, { prx: erx * (kid ? 0.42 : 0.36), browW: kid ? 5 : 8, browC: kid ? B.hair : '#2a1a10' });
    const eyeR = makeEye(head, ex, ey, erx, ery, B.skin, { prx: erx * (kid ? 0.42 : 0.36), browW: kid ? 5 : 8, browC: kid ? B.hair : '#2a1a10' });
    if (kid || woman) dyn(head, { d: `M ${-ex - erx - 4} ${ey - ery * 0.5} l -12 -8 M ${-ex - erx + 2} ${ey - ery * 0.8} l -10 -12 M ${ex + erx + 4} ${ey - ery * 0.5} l 12 -8 M ${ex + erx - 2} ${ey - ery * 0.8} l 10 -12`, 'stroke-width': 4 });
    const xe = dyn(head, { 'stroke-width': 7, opacity: 0, d: [-1, 1].map(sd => `M ${r1(sd * ex - 16)} ${r1(ey - 16)} l 32 32 M ${r1(sd * ex + 16)} ${r1(ey - 16)} l -32 32`).join(' ') });
    dyn(head, { d: kid ? `M -4 ${R * 0.3} q -6 8 4 10` : `M -4 ${R * 0.12} Q -16 ${R * 0.36} 4 ${R * 0.38}`, 'stroke-width': 5 });
    if (B.must) WB.mk('path', { d: `M ${-R * 0.42} ${R * 0.5} Q ${-R * 0.3} ${R * 0.3} 0 ${R * 0.4} Q ${R * 0.3} ${R * 0.3} ${R * 0.42} ${R * 0.5} Q ${R * 0.2} ${R * 0.44} 0 ${R * 0.5} Q ${-R * 0.2} ${R * 0.44} ${-R * 0.42} ${R * 0.5} Z`, fill: B.hair, stroke: BK, 'stroke-width': 4 }, head);
    const mouth = makeMouth(head, 0, R * (kid ? 0.56 : 0.6), R * (kid ? 0.34 : 0.4));
    const lips = woman ? WB.mk('path', { d: ellipse(0, R * 0.6, R * 0.17, R * 0.06), fill: '#e11d48', stroke: 'none' }, head) : null;
    // fumaça saindo das orelhas (esposa "doida")
    const steam = [-1, 1].map(sd => dyn(head, { stroke: '#9ca3af', 'stroke-width': 12, opacity: 0,
      d: `M ${r1(sd * R * 1.08)} ${r1(-R * 0.05)} q ${sd * 26} -22 ${sd * 6} -48 q ${-sd * 20} -26 ${sd * 6} -52 q ${sd * 22} -24 ${sd * 4} -50` }));
    const sweat = WB.mk('path', { d: `M ${R * 0.9} ${-R * 0.5} q -14 24 0 36 q 14 -12 0 -36 Z`, fill: '#93c5fd', stroke: BK, 'stroke-width': 4, opacity: 0 }, head);
    // cabelo da frente
    if (kid) {
      WB.mk('path', { d: `M ${-R * 0.98} ${-R * 0.06} Q ${-R} ${-R * 1.02} 0 ${-R * 1.0} Q ${R} ${-R * 1.02} ${R * 0.98} ${-R * 0.06} Q ${R * 0.8} ${-R * 0.5} ${R * 0.42} ${-R * 0.44} Q ${R * 0.2} ${-R * 0.62} 0 ${-R * 0.42} Q ${-R * 0.24} ${-R * 0.64} ${-R * 0.46} ${-R * 0.44} Q ${-R * 0.82} ${-R * 0.5} ${-R * 0.98} ${-R * 0.06} Z`, fill: B.hair, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, head);
    } else if (B.curly) {
      // peruca de cachos: touca de nuvem + cachinhos em espiral + cachos dos lados
      [-1, 1].forEach(sd => WB.mk('path', { d: WB.cloudPath(sd * R * 0.98, -R * 0.28, R * 0.3, R * 0.42, 8), fill: B.hair, stroke: BK, 'stroke-width': 5 }, head));
      WB.mk('path', { d: WB.cloudPath(0, -R * 0.86, R * 1.1, R * 0.5, 14), fill: B.hair, stroke: BK, 'stroke-width': 6 }, head);
      dyn(head, { d: [[-0.7, -0.9], [-0.35, -1.1], [0, -0.85], [0.35, -1.12], [0.7, -0.9], [-0.5, -0.62], [0.5, -0.64], [0.15, -1.25], [-0.15, -0.6]].map(([a, b]) =>
        `M ${r1(a * R)} ${r1(b * R)} m -9 0 a 9 9 0 1 1 9 9`).join(' '), stroke: '#5b3415', 'stroke-width': 4 });
    } else if (B.cap) {
      WB.mk('path', { d: `M ${-R * 0.94} ${-R * 0.5} Q ${-R * 1.0} ${-R * 1.16} 0 ${-R * 1.14} Q ${R * 1.0} ${-R * 1.16} ${R * 0.94} ${-R * 0.5} Z`, fill: B.cap, stroke: BK, 'stroke-width': 6 }, head);
      WB.mk('path', { d: `M ${-R * 1.04} ${-R * 0.5} Q 0 ${-R * 0.34} ${R * 1.04} ${-R * 0.5} Q 0 ${-R * 0.66} ${-R * 1.04} ${-R * 0.5} Z`, fill: B.capB || B.cap, stroke: BK, 'stroke-width': 5 }, head);
      WB.mk('path', { d: ellipse(0, -R * 0.84, R * 0.2, R * 0.13), fill: '#ffffff', stroke: BK, 'stroke-width': 4 }, head);
    } else if (woman) {
      WB.mk('path', { d: `M ${-R * 1.0} ${R * 0.2} Q ${-R * 1.08} ${-R * 1.1} 0 ${-R * 1.08} Q ${R * 1.08} ${-R * 1.1} ${R * 1.0} ${R * 0.2} Q ${R * 0.9} ${-R * 0.45} ${R * 0.4} ${-R * 0.62} Q ${-R * 0.2} ${-R * 0.82} ${-R * 0.7} ${-R * 0.4} Q ${-R * 0.92} ${-R * 0.1} ${-R * 1.0} ${R * 0.2} Z`, fill: B.hair, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, head);
    } else {
      WB.mk('path', { d: `M ${-R * 0.92} ${-R * 0.12} Q ${-R * 1.04} ${-R * 1.12} 0 ${-R * 1.1} Q ${R * 1.04} ${-R * 1.12} ${R * 0.92} ${-R * 0.12} Q ${R * 0.86} ${-R * 0.56} ${R * 0.52} ${-R * 0.62} Q ${R * 0.1} ${-R * 0.5} ${-R * 0.3} ${-R * 0.7} Q ${-R * 0.78} ${-R * 0.62} ${-R * 0.92} ${-R * 0.12} Z`, fill: B.hair, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, head);
    }
    if (B.shadesUp) {
      // óculos escuros apoiados no alto da cabeça
      const sy = -R * 0.84;
      WB.mk('path', { d: ellipse(-R * 0.34, sy, R * 0.25, R * 0.14) + ' ' + ellipse(R * 0.34, sy, R * 0.25, R * 0.14), fill: '#111827', stroke: BK, 'stroke-width': 4 }, head);
      dyn(head, { d: `M ${r1(-R * 0.09)} ${r1(sy)} L ${r1(R * 0.09)} ${r1(sy)} M ${r1(-R * 0.45)} ${r1(sy - 4)} l 10 -5 M ${r1(R * 0.23)} ${r1(sy - 4)} l 10 -5`, stroke: '#9ca3af', 'stroke-width': 4 });
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
        g.setAttribute('opacity', (st.alpha ?? 1).toFixed(3));
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
          legs[i].o.setAttribute('d', d);
          if (B.shorts) { legs[i].sk.setAttribute('d', d); legs[i].i.setAttribute('d', `M ${r1(hx)} 4 L ${r1(lerp(hx, k.el[0], 0.85))} ${r1(lerp(4, k.el[1], 0.85))}`); }
          else legs[i].i.setAttribute('d', d);
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
          const sl = B.longSleeve ? `M ${sh[0]} ${sh[1]} L ${r1(k.el[0])} ${r1(k.el[1])} L ${r1(lerp(k.el[0], k.h[0], 0.8))} ${r1(lerp(k.el[1], k.h[1], 0.8))}`
        : `M ${sh[0]} ${sh[1]} L ${r1(lerp(sh[0], k.el[0], kid ? 0.38 : 0.5))} ${r1(lerp(sh[1], k.el[1], kid ? 0.38 : 0.5))}`;
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
        if (lips) lips.setAttribute('opacity', op < 0.06 ? 1 : 0);
        const stm = st.steam || 0;
        steam.forEach((p, k) => { p.setAttribute('opacity', (stm * (0.6 + 0.4 * Math.sin(t * 9 + k))).toFixed(2)); p.setAttribute('transform', `translate(0 ${r1(-((t * 90 + k * 25) % 40))})`); });
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
  const marido = () => makePerson(cont, MARIDO);
  const esposa = () => makePerson(cont, ESPOSA);

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
  function star(x, y, r, fill = '#facc15') {
    let d = '';
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? ' L ' : 'M ') + r1(x + Math.cos(a) * rr) + ' ' + r1(y + Math.sin(a) * rr); }
    return { d: d + ' Z', fill, w: 5 };
  }
  function calendar(x, y, top, big, c = INK.red, w = 300) {
    return [box(x - w / 2, y - 150, w, 300, 18, '#ffffff', null, 7), { d: WB.roundRectPath(x - w / 2, y - 150, w, 80, 18), fill: c, c: 'none' },
      { d: `M ${x - w / 2} ${y - 70} L ${x + w / 2} ${y - 70}`, w: 6 }, { d: `M ${x - 70} ${y - 170} L ${x - 70} ${y - 130} M ${x + 70} ${y - 170} L ${x + 70} ${y - 130}`, w: 10 },
      T(top, x, y - 94, 44, '#ffffff'), T(big, x, y + 60, big.length > 4 ? 64 : 120, BK)];
  }
  const note = (x, y, s = 1, c = '#7c3aed') => [{ d: `M ${x} ${y} L ${x} ${y - 70 * s} L ${x + 44 * s} ${y - 84 * s} L ${x + 44 * s} ${y - 14 * s}`, c, w: 7 },
    { d: ellipse(x - 12 * s, y, 16 * s, 12 * s), fill: c, c }, { d: ellipse(x + 32 * s, y - 14 * s, 16 * s, 12 * s), fill: c, c }];
  const lupa = () => [{ d: 'M 0 0 L 0 110', c: '#92400e', w: 22 }, circ(0, -70, 70, '#e0f2fe', null, 10), { d: 'M -30 -100 Q -44 -78 -36 -54', c: '#ffffff', w: 8 }];
  const shadesS = (x, y, s = 1) => [{ d: `M ${x - 56 * s} ${y - 10 * s} L ${x + 56 * s} ${y - 10 * s}`, w: 6 }, { d: ellipse(x - 30 * s, y + 4 * s, 24 * s, 16 * s), fill: '#111827' }, { d: ellipse(x + 30 * s, y + 4 * s, 24 * s, 16 * s), fill: '#111827' }];


  // ---------------- objetos da casa ----------------
  const caneca = (c = '#2563eb') => [{ d: 'M 30 -52 q 30 0 30 22 q 0 22 -30 22', c: BK, w: 9 }, box(-30, -64, 62, 64, 10, c, null, 6), { d: 'M -18 -48 L -18 -14', c: '#ffffff', w: 5, op: 0.7 }];
  const maleta = () => [box(-60, -10, 120, 86, 10, '#78350f', null, 6), { d: 'M -22 -10 L -22 -26 L 22 -26 L 22 -10', w: 6 }, { d: 'M -60 24 L 60 24', c: '#451a03', w: 4 }];
  const footprint = (x, y, rot = 0) => ({ d: `M ${x} ${y} m -14 0 a 14 22 0 1 0 28 0 a 14 22 0 1 0 -28 0 M ${x - 12} ${y - 30} a 5 5 0 1 0 0.1 0 M ${x} ${y - 34} a 5 5 0 1 0 0.1 0 M ${x + 12} ${y - 30} a 5 5 0 1 0 0.1 0`, fill: '#a8a29e', c: '#57534e', w: 3 });
  const xMark = (x, y, r = 30, c = INK.red) => ({ d: `M ${x - r} ${y - r} L ${x + r} ${y + r} M ${x + r} ${y - r} L ${x - r} ${y + r}`, c, w: 10 });
  const mesa = (x, y, w = 360) => [box(x - w / 2, y - 18, w, 24, 8, '#b7793f', null, 6), { d: `M ${x - w / 2 + 30} ${y + 6} L ${x - w / 2 + 40} ${y + 170} M ${x + w / 2 - 30} ${y + 6} L ${x + w / 2 - 40} ${y + 170}`, c: '#7c4a1e', w: 14 }];
  // fita amarela de cena do crime (faixa inclinada)
  function fita(x0, y0, x1, y1, txt = 'NÃO ULTRAPASSE') {
    const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.floor(L / 360)), out = [];
    const nx = -Math.sin(a) * 30, ny = Math.cos(a) * 30;
    out.push({ d: `M ${r1(x0 + nx)} ${r1(y0 + ny)} L ${r1(x1 + nx)} ${r1(y1 + ny)} L ${r1(x1 - nx)} ${r1(y1 - ny)} L ${r1(x0 - nx)} ${r1(y0 - ny)} Z`, fill: '#facc15', w: 5 });
    return { specs: out, labels: Array.from({ length: n }, (_, i) => [x0 + (x1 - x0) * (i + 0.5) / n, y0 + (y1 - y0) * (i + 0.5) / n, a / DEG, txt]) };
  }
  function putFita(bt, x0, y0, x1, y1, o = {}) {
    const f = fita(x0, y0, x1, y1, o.txt);
    const g = WB.mk('g', {}, o.parent || ov);
    put(f.specs, g);
    f.labels.forEach(([x, y, rot, txt]) => { const tg = WB.mk('g', { transform: `rotate(${r1(rot)} ${r1(x)} ${r1(y)})` }, g); put([T(txt, x, y + 13, 36, BK)], tg); });
    animate(g, bt, Object.assign({ anim: 'fly', fx: -500 }, o));
    return g;
  }
  const sirene = (x, y) => [box(x - 50, y, 100, 30, 6, '#374151', null, 5), { d: `M ${x - 40} ${y} Q ${x - 40} ${y - 80} ${x} ${y - 80} Q ${x + 40} ${y - 80} ${x + 40} ${y} Z`, fill: '#ef4444', w: 6 }];
  const comprovante = () => [box(-130, -170, 260, 320, 10, '#ffffff', null, 6), T('COMPROVANTE', 0, -120, 36, BK), T('DE RESIDÊNCIA', 0, -82, 36, BK),
    { d: 'M -100 -50 L 100 -50 M -100 -15 L 60 -15 M -100 20 L 90 20', c: '#9ca3af', w: 5 }, T('MORADOR: EU!', 0, 80, 40, INK.red), circ(70, 120, 22, '#fca5a5', INK.red, 4)];
  const geladeira = () => [box(-130, -560, 260, 560, 22, '#f1f5f9', null, 7), { d: 'M -130 -360 L 130 -360', w: 6 }, { d: 'M 100 -330 L 100 -250 M 100 -520 L 100 -420', c: '#64748b', w: 10 }];
  const microondas = () => [box(-130, -150, 260, 150, 14, '#e5e7eb', null, 6), box(-110, -130, 160, 110, 8, '#1e293b', null, 5), circ(90, -110, 12, '#9ca3af', null, 4), circ(90, -70, 12, '#9ca3af', null, 4), box(76, -44, 30, 16, 4, '#22c55e', null, 3)];
  const vaso = () => [{ d: 'M -90 -150 Q -100 -40 -50 0 L 50 0 Q 100 -40 90 -150 Z', fill: '#ffffff', w: 7 }, { d: ellipse(0, -150, 100, 30), fill: '#e0f2fe', w: 6 },
    box(-70, -250, 140, 80, 20, '#ffffff', null, 6), { d: 'M -40 0 L -40 30 L 40 30 L 40 0', fill: '#ffffff', w: 6 }];
  const prato = () => [{ d: ellipse(0, 0, 200, 60), fill: '#ffffff', w: 6 }, { d: ellipse(0, -4, 150, 42), fill: '#f8fafc', c: '#cbd5e1', w: 4 },
    { d: WB.cloudPath(-60, -40, 70, 34, 10), fill: '#fefce8', w: 5 }, { d: WB.cloudPath(50, -40, 64, 30, 9), fill: '#78350f', w: 5 },
    { d: 'M 10 -90 q 40 -30 80 -6 q 20 30 -20 40 q -50 6 -60 -34 Z', fill: '#d97706', w: 5 }, { d: 'M -120 -30 q 14 -26 40 -16 q 6 20 -20 24 Z', fill: '#16a34a', w: 4 }];
  // guarda-roupa: corpo e duas portas que abrem (escala horizontal presa na dobradiça)
  function guardaRoupa(x, y, w = 420, h = 620) {
    const g = WB.mk('g', {}, cont);
    put([box(x - w / 2, y - h, w, h, 12, '#a16207', null, 7), box(x - w / 2 + 16, y - h + 16, w - 32, h - 32, 8, '#3f2a14', null, 5),
      { d: `M ${x - w / 2 + 24} ${y - h + 70} L ${x + w / 2 - 24} ${y - h + 70}`, c: '#d6d3d1', w: 8 }], g);
    const inside = WB.mk('g', {}, g);
    const mkDoor = (side) => {
      const dg = WB.mk('g', {}, g), hx = side < 0 ? x - w / 2 : x + w / 2, dx = side < 0 ? x - w / 2 : x;
      put([box(dx, y - h, w / 2, h, 8, '#ca8a04', null, 7), box(dx + 26, y - h + 30, w / 2 - 52, h - 60, 8, 'none', '#854d0e', 4), circ(side < 0 ? x - 26 : x + 26, y - h / 2, 10, '#fde047', null, 4)], dg);
      return u => dg.setAttribute('transform', `translate(${hx} 0) scale(${r1((1 - 0.85 * u) * 1000) / 1000} 1) translate(${-hx} 0)`);
    };
    const dl = mkDoor(-1), dr = mkDoor(1);
    return { g, inside, open: u => { dl(u); dr(u); } };
  }
  // vestido no cabide
  const vestido = (x, y, c) => [{ d: `M ${x} ${y} q 0 -20 14 -20 M ${x - 40} ${y + 14} L ${x} ${y} L ${x + 40} ${y + 14}`, c: '#d6d3d1', w: 5 },
    { d: `M ${x - 26} ${y + 10} L ${x + 26} ${y + 10} L ${x + 34} ${y + 70} L ${x + 60} ${y + 210} L ${x - 60} ${y + 210} L ${x - 34} ${y + 70} Z`, fill: c, w: 5 }];

  // ---------------- cenário: sala da casa de praia (madeira, luminária de palha, janela com verde) ----------------
  const FL = 1450;
  function sala(o = {}) {
    const out = [
      { d: `M 60 500 L 1020 500 L 1020 ${FL} L 60 ${FL} Z`, fill: '#fdf2d8', c: 'none', fo: 0.9 },
      { d: `M 60 500 L 1020 500 L 1020 560 L 60 560 Z`, fill: '#b7793f', c: 'none' },
      { d: `M 60 ${FL} L 1020 ${FL} L 1020 1700 L 60 1700 Z`, fill: '#d6a46b', c: 'none', fo: 0.9 },
      { d: WB.roughLine(60, FL, 1020, FL, 2), w: 7 },
      { d: `M 60 ${FL + 80} L 1020 ${FL + 80} M 60 ${FL + 170} L 1020 ${FL + 170} M 300 ${FL} L 280 ${FL + 80} M 700 ${FL + 80} L 690 ${FL + 170}`, c: '#a16207', w: 4 },
    ];
    if (o.janela !== false) out.push(box(o.jx ?? 130, 660, 280, 250, 10, '#bbf7d0', '#7c4a1e', 9), { d: `M ${(o.jx ?? 130) + 140} 660 L ${(o.jx ?? 130) + 140} 910 M ${o.jx ?? 130} 785 L ${(o.jx ?? 130) + 280} 785`, c: '#7c4a1e', w: 7 },
      { d: WB.cloudPath((o.jx ?? 130) + 80, 850, 60, 40, 8), fill: '#4ade80', c: '#15803d', w: 4 });
    if (o.lampada !== false) out.push({ d: `M ${o.lx ?? 600} 560 L ${o.lx ?? 600} 640`, w: 5 }, { d: `M ${(o.lx ?? 600) - 70} 720 Q ${o.lx ?? 600} 600 ${(o.lx ?? 600) + 70} 720 Z`, fill: '#d4a373', w: 6 },
      { d: `M ${(o.lx ?? 600) - 50} 700 L ${(o.lx ?? 600) + 50} 700 M ${(o.lx ?? 600) - 30} 670 L ${(o.lx ?? 600) + 30} 670`, c: '#92400e', w: 3 });
    if (o.planta) out.push({ d: `M ${o.planta - 50} ${FL} L ${o.planta - 60} ${FL - 110} L ${o.planta + 60} ${FL - 110} L ${o.planta + 50} ${FL} Z`, fill: '#c2410c', w: 6 },
      { d: `M ${o.planta} ${FL - 110} q -60 -120 -110 -160 M ${o.planta} ${FL - 110} q 10 -150 -10 -230 M ${o.planta} ${FL - 110} q 60 -110 120 -150`, c: '#15803d', w: 12 });
    return out;
  }
  const porta = (x) => [box(x - 100, 860, 200, FL - 860, 8, '#7c4a1e', null, 7)];
  const portaFolha = (x) => [box(x - 96, 864, 192, FL - 868, 6, '#a16207', null, 6), { d: `M ${x - 70} 900 L ${x - 70} ${FL - 40} M ${x - 30} 900 L ${x - 30} ${FL - 40} M ${x + 10} 900 L ${x + 10} ${FL - 40} M ${x + 50} 900 L ${x + 50} ${FL - 40}`, c: '#854d0e', w: 4 }, circ(x + 70, 1160, 12, '#fde047', null, 4)];
  function portaQueAbre(x) {
    put(porta(x));
    const g = WB.mk('g', {}, cont);
    put(portaFolha(x), g);
    return u => g.setAttribute('transform', `translate(${x - 100} 0) scale(${r1((1 - 0.8 * u) * 1000) / 1000} 1) translate(${-(x - 100)} 0)`);
  }

  const CTA0 = 31.0;

  // ---------------- título + legenda (faixa amarela; texto rosa = esposa, na voz imitada pelo marido) ----------------
  const titleG = WB.mk('g', {}, WB.overlay);
  {
    const a = 'SÓ NÃO PODE TER ', b = 'VESTÍGIO', size0 = 80;
    const size = Math.min(size0, Math.floor(size0 * 960 / WB.measure(a + b, size0)));
    const tw = WB.measure(a + b, size), x0 = 540 - tw / 2;
    WB.showNow(WB.textStrokes(a, x0, 200, size, BK, titleG, 'start').strokes);
    WB.showNow(WB.textStrokes(b, x0 + WB.measure(a, size), 200, size, INK.red, titleG, 'start').strokes);
    WB.showNow(WB.strokePath(WB.wavyLine(x0, x0 + tw, 222, 6, 60), '#f59e0b', 6, titleG));
    WB.effect(t => titleG.setAttribute('opacity', t < CTA0 ? clamp(t / 0.3) : clamp(1 - (t - CTA0) / 0.3)));
  }
  const capLayer = WB.mk('g', {}, WB.overlay);
  const HM = 0, EL = 1;
  const CAPS = [
    [0.15, 'A minha esposa adora morar comigo.', HM], [1.55, 'Só não pode ter vestígio...', HM], [3.45, '...na casa que eu moro lá também.', HM], [5.45, ''],
    [7.3, 'E se ela chega em casa e vê alguma coisa fora do lugar...', HM], [9.4, '...de quando ela sai do trabalho...', HM], [10.4, 'ela já fica doida já!', HM],
    [11.55, '"Mas por que isso aqui tá fora do lugar?"', EL],
    [13.15, 'Eu falei: então... não quero te assustar assim...', HM], [15.5, '...mas eu moro aqui também.', HM], [16.7, ''],
    [18.15, 'Tu sai pro trabalho?', HM], [19.45, 'É, irmão! Eu vou no banheiro...', HM],
    [21.85, 'eu abro a geladeira, uso micro-ondas...', HM], [24.35, 'eu almoço aqui, meu irmão!', HM],
    [26.85, 'Se tu procurar bonitinho...', HM], [28.0, '...tu vai achar até roupa minha aqui dentro!', HM], [30.8, ''],
  ];
  CAPS.forEach(([t0, text, who], i) => {
    if (!text) return;
    const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : CTA0;
    const g = WB.mk('g', {}, capLayer);
    const size = 56, lh = 64;
    const lines = WB.wrap(text, size, 860);
    const w = Math.max(...lines.map(l => WB.measure(l, size))) + 64, h = lines.length * lh + 28, y0 = 262;
    WB.mk('rect', { x: r1(540 - w / 2), y: y0, width: r1(w), height: h, rx: 20, fill: who === EL ? '#fce7f3' : '#ffe066', stroke: BK, 'stroke-width': 5 }, g);
    lines.forEach((l, k) => WB.showNow(WB.textStrokes(l, 540, y0 + 58 + k * lh, size, who === EL ? '#be185d' : BK, g, 'middle').strokes));
    const rot = i % 2 ? 1.2 : -1.2;
    WB.effect(t => {
      if (t < t0 || t >= t1) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      const k = backOut(clamp((t - t0) / 0.2)) * 0.1 + 0.9;
      g.setAttribute('transform', `translate(540 ${y0 + h / 2}) rotate(${rot}) scale(${k.toFixed(3)}) translate(-540 ${-(y0 + h / 2)})`);
    });
  });
  // poses base
  const mar = (o) => Object.assign({ y: FL, s: 1, f: 1, seed: 0.3 }, o);
  const esp = (o) => Object.assign({ y: FL, s: 1, f: 1, seed: 1.7 }, o);
  const opM = t => talk(M_WIN, t, 1.25), opE = t => talk(E_WIN, t, 1.3);

  // =====================================================================
  // CENA 1 (0–1,55): o casal abraçado na sala, corações subindo: "adora morar comigo"
  // =====================================================================
  const S1 = [[0, 1.55]];
  shot(S1, 1.12, 540, 1250);
  put(sala({ planta: 930 }));
  const m1 = marido(), e1 = esposa();
  WB.effect(t => {
    if (!inWin(S1, t)) return;
    m1.update(t, mar({ x: 400, mood: MOODS.joy, op: opM(t), look: 4, R: [150, -170], L: [-120 + Math.sin(t * 10) * 10, -260], headRot: 6 }));
    e1.update(t, esp({ x: 600, mood: MOODS.joy, look: -8, L: [-120, -170], headRot: -8, lean: -4 }));
  });
  O(0.3, [heart(500, 640, 1.2), heart(380, 720, 0.8, '#f472b6')], { loop: 'rise' });
  O(0.8, [heart(640, 700, 0.9)], { loop: 'rise' });
  OT(0.6, 'ADORA!', 820, 620, 80, '#be185d', 8, { loop: 'pulse' });

  // =====================================================================
  // CENA 2 (1,55–5,45): perícia em casa: a esposa de lupa caça pegadas; o marido vira fantasma
  // =====================================================================
  const S2 = [[1.55, 5.45]];
  shot(S2, 1.12, 540, 1250);
  put(sala({ janela: false, lx: 300 }));
  {
    const m2 = marido(), e2 = esposa();
    put(lupa(), e2.itemR);
    const MX = K([[1.55, 260], [4.2, 760, 'io']]), Mo = odo(MX, 1.5, 5.5);
    const EX = K([[1.55, 60], [2.2, 60], [5.0, 520, 'io']]), Eo = odo(EX, 1.5, 5.5);
    const AL = K([[1.55, 1], [2.6, 1], [3.4, 0.3, 'io']]);
    // pegadas que o marido deixa e que a esposa "risca"
    const steps = [0, 1, 2, 3, 4, 5].map(i => ({ x: 300 + i * 80, tOn: 1.9 + i * 0.36, tX: 2.7 + i * 0.4 }));
    const fp = steps.map(st => holder([footprint(0, 0, 0)]));
    const fx = steps.map(st => holder([xMark(0, 0, 30)]));
    WB.effect(t => {
      if (!inWin(S2, t)) return;
      const tip = Math.sin(t * 9);
      m2.update(t, Object.assign(mar({ x: MX(t), mood: t < 3.5 ? MOODS.innocent : MOODS.sly, op: opM(t), alpha: AL(t), lean: 6, lift: 34,
        L: [-120, -230 + tip * 10], R: [130, -230 - tip * 10], headRot: -4, look: -10 }), Mo(t)));
      e2.update(t, Object.assign(esp({ x: EX(t), mood: MOODS.squint, lean: 22, look: 12, lookY: 10, R: [170, -120], rotR: 70, L: [-60, -60] }), Eo(t)));
      steps.forEach((st, i) => { fp[i](st.x, FL + 60 + (i % 2) * 30, 0, 1, t > st.tOn ? 1 : 0); fx[i](st.x, FL + 60 + (i % 2) * 30, 0, 1, t > st.tX ? 1 : 0); });
    });
  }
  putFita(1.7, 40, 600, 1040, 520);
  ostamp(2.4, 'PROIBIDO VESTÍGIOS!', 540, 1640, 70, INK.red, -4, { loop: 'shake' });
  OT(3.6, 'EU MORO AQUI!', 760, 760, 60, '#1d4ed8', 6, { loop: 'wiggle' });
  OT(4.2, '(eu acho)', 790, 830, 46, '#6b7280', 6, {});

  // =====================================================================
  // CENA 3 (5,45–7,3): o quadro do casamento na parede... o marido foi tapado com um post-it
  // =====================================================================
  const S3 = [[5.45, 7.3]];
  shot(S3, 1);
  put(sala({ janela: false, lampada: false }));
  {
    // moldura com o casal: ela sorrindo, ele coberto
    put([box(240, 640, 600, 520, 18, '#a16207', null, 9), box(270, 670, 540, 460, 8, '#e0f2fe', null, 5),
      { d: 'M 270 1130 Q 400 1020 540 1060 Q 680 1000 810 1130 Z', fill: '#bbf7d0', c: 'none' }]);
    const fe = makePerson(cont, ESPOSA), fm = makePerson(cont, MARIDO);
    WB.effect(t => {
      if (!inWin(S3, t)) return;
      fe.update(t, esp({ x: 660, y: 1130, s: 0.55, mood: MOODS.joy, L: [-100, -200], frozen: true }));
      fm.update(t, mar({ x: 430, y: 1130, s: 0.55, mood: MOODS.joy, R: [100, -200], frozen: true }));
    });
    put([T('CASAMENTO', 540, 1210, 50, '#7c4a1e')]);
  }
  O(5.9, [box(310, 690, 230, 230, 6, '#fde047', null, 6), T('???', 425, 820, 90, BK)], { anim: 'slam', rot: -8, rx: 425, ry: 805 });
  OT(6.4, 'ele quem?', 230, 590, 64, INK.red, -6, { loop: 'wiggle' });
  O(6.4, [{ d: 'M 240 620 Q 250 680 320 720', c: INK.red, w: 7 }, { d: WB.arrowHead(320, 720, 0.6, 18), c: INK.red, w: 7 }], {});

  // =====================================================================
  // CENA 4 (7,3–9,4): ela chega do trabalho... e tem UMA caneca fora do lugar (alarme!)
  // =====================================================================
  const S4 = [[7.3, 9.4]];
  shot(S4, 1.12, 540, 1250);
  put(sala({ janela: true, lx: 420 }));
  {
    const door = portaQueAbre(880);
    put(mesa(330, 1240, 360));
    const cup = holder(caneca());
    const e4 = esposa();
    put(maleta(), e4.itemL);
    const EX = K([[7.3, 880], [7.6, 880], [8.4, 700, 'o']]), Eo = odo(EX, 7.2, 9.5);
    const DO = K([[7.3, 0], [7.6, 1, 'o'], [8.6, 1], [8.9, 0]]);
    WB.effect(t => {
      if (!inWin(S4, t)) return;
      door(DO(t));
      cup(390, 1222, 18 * clamp((t - 7.3) * 10), 1, 1);
      const seen = t > 8.45;
      e4.update(t, Object.assign(esp({ x: EX(t), f: -1, mood: seen ? MOODS.horror : MOODS.neutral, look: -14, frozen: seen,
        L: [-60, -40], R: seen ? [150, -330] : undefined, headRot: seen ? Math.sin(t * 40) * 3 : 0 }), Eo(t)));
    });
  }
  O(8.45, [circ(390, 1190, 90, 'none', INK.red, 10)], { anim: 'slam' });
  O(8.5, sirene(540, 600), { loop: 'pulse' });
  O(8.5, [{ d: 'M 440 560 l -80 -40 M 640 560 l 80 -40 M 430 600 l -90 0 M 650 600 l 90 0', c: INK.red, w: 9 }], { loop: 'pulse' });
  OT(8.55, 'ALERTA!', 540, 760, 80, INK.red, -3, { loop: 'shake' });

  // =====================================================================
  // CENA 5 (9,4–11,55): antes e depois: a caneca andou 2 cm... e ela fica DOIDA
  // =====================================================================
  const S5 = [[9.4, 11.55]];
  shot(S5, 1);
  put([{ d: WB.roughLine(60, 1640, 1020, 1640, 2), w: 7 }]);
  {
    const e5 = esposa();
    WB.effect(t => {
      if (!inWin(S5, t)) return;
      const crazy = t > 10.4, sh = crazy ? Math.sin(t * 50) * 8 : 0;
      e5.update(t, esp({ x: 400 + sh, y: 1640, s: 1.1, mood: crazy ? MOODS.horror : MOODS.squint, steam: crazy ? 1 : 0, hop: crazy ? Math.abs(Math.sin(t * 12)) * 30 : 0,
        L: crazy ? [-150 + sh, -330] : [-60, -60], R: crazy ? [150 - sh, -330] : [-20, -160], look: crazy ? Math.sin(t * 30) * 8 : 0, headRot: crazy ? Math.sin(t * 22) * 8 : 0 }));
    });
  }
  // painel antes / depois
  O(9.45, [box(80, 450, 440, 330, 16, '#ffffff', null, 6), T('8h (saiu)', 300, 515, 54, BK), { d: 'M 120 720 L 480 720', c: '#b7793f', w: 14 },
    { d: 'M 240 720 l 0 -100 l 90 0 l 0 100 Z', fill: '#2563eb', w: 6 }, { d: 'M 330 640 q 40 0 40 30 q 0 30 -40 30', w: 8 }, { d: 'M 285 720 L 285 760', c: '#16a34a', w: 6 }], { anim: 'pop' });
  O(9.75, [box(560, 450, 440, 330, 16, '#ffffff', null, 6), T('18h (voltou)', 780, 515, 54, BK), { d: 'M 600 720 L 960 720', c: '#b7793f', w: 14 },
    { d: 'M 750 720 l 0 -100 l 90 0 l 0 100 Z', fill: '#2563eb', w: 6 }, { d: 'M 840 640 q 40 0 40 30 q 0 30 -40 30', w: 8 },
    { d: 'M 765 720 L 765 760 M 795 720 L 795 760', c: INK.red, w: 6 }, { d: 'M 765 750 L 795 750', c: INK.red, w: 5 }], { anim: 'pop' });
  ostamp(10.0, 'ANDOU 2 CM!!', 780, 860, 60, INK.red, -4, { loop: 'shake' });
  ostamp(10.45, 'DOIDA!', 820, 1200, 96, INK.red, 8, { loop: 'shake' });

  // =====================================================================
  // CENA 6 (11,55–13,15): close na esposa gritando com a caneca na mão
  // =====================================================================
  const S6 = [[11.55, 13.15]];
  shot(S6, 1.8, 540, 980);
  put(sala({ janela: false, lampada: false }));
  {
    const e6 = esposa();
    put(caneca(), e6.itemR);
    WB.effect(t => {
      if (!inWin(S6, t)) return;
      const tr = Math.sin(t * 46) * 4;
      e6.update(t, esp({ x: 540, mood: MOODS.stern, op: opE(t), steam: 1, headRot: tr * 0.6, lean: -4, R: [150 + tr, -330], L: [-150, -240 + tr * 2], rotR: 0 }));
    });
  }
  O(11.6, [speedLines(900, 720, 120, -1)], { loop: 'pulse' });
  OT(12.1, 'POR QUÊ?!', 200, 640, 70, INK.red, -6, { loop: 'shake' });

  // =====================================================================
  // CENA 7 (13,15–16,7): ele, calmo, mostra o comprovante de residência; ela desmaia
  // =====================================================================
  const S7 = [[13.15, 16.7]];
  shot(S7, 1.12, 540, 1250);
  put(sala({ jx: 700 }));
  {
    const m7 = marido(), e7 = esposa();
    const pap = holder(comprovante(), cont);
    const ROT = K([[13.15, 0], [15.9, 0], [16.35, -86, 'i'], [16.5, -80, 'o']]), EX = K([[13.15, 740], [15.9, 740], [16.35, 900, 'io']]);
    WB.effect(t => {
      if (!inWin(S7, t)) return;
      const show = t > 15.5, down = t > 16.35;
      m7.update(t, mar({ x: 250, mood: show ? MOODS.innocent : MOODS.neutral, op: opM(t), look: 10,
        L: show ? [-60, -60] : [-150, -300], R: show ? [180, -260] : [150, -300], headRot: show ? 6 : Math.sin(t * 2) * 4 }));
      pap(m7.handR ? m7.handR[0] + 70 : 600, m7.handR ? m7.handR[1] - 40 : 1000, 6, 0.85 * backOut(clamp((t - 15.5) / 0.3)), show ? 1 : 0);
      e7.update(t, esp({ x: EX(t), f: -1, rot: ROT(t), mood: down ? MOODS.dead : (show ? MOODS.horror : MOODS.stern), xeyes: down ? 1 : 0, tongue: down ? 0.8 : 0, steam: show ? 0 : 0.6,
        look: -12, L: show ? [-140, -330] : [-60, -60], R: show ? [140, -330] : [120, -150],
        footT: down ? [[118, -30], [116, 30]] : null }));
    });
  }
  OT(13.5, 'calma...', 300, 700, 60, '#15803d', -5, { loop: 'float' });
  O(16.4, [burst(660, 1520, 80, '#fef08a'), T('PLOFT!', 660, 1545, 56, INK.red)], { anim: 'slam' });

  // =====================================================================
  // CENA 8 (16,7–18,15): ela acorda em pânico: "TEM UM HOMEM MORANDO AQUI?!"
  // =====================================================================
  const S8 = [[16.7, 18.15]];
  shot(S8, 1.5, 540, 1100);
  put(sala({ janela: false, lampada: false }));
  {
    const e8 = esposa();
    WB.effect(t => {
      if (!inWin(S8, t)) return;
      const tr = Math.sin(t * 50) * 5;
      e8.update(t, esp({ x: 540 + tr, mood: MOODS.horror, L: [-130, -330 + tr], R: [130, -330 - tr], headRot: tr * 0.5 }));
    });
  }
  O(16.8, thought(540, 560, 380, 150, [[640, 760, 22], [690, 710, 30]]), {});
  OT(16.9, 'TEM UM HOMEM', 540, 545, 70, BK, 0, {});
  OT(17.2, 'MORANDO AQUI?!', 540, 625, 70, INK.red, 0, { loop: 'shake' });

  // =====================================================================
  // CENA 9 (18,15–19,45): ela sai pro trabalho; ele brota de trás do sofá
  // =====================================================================
  const S9 = [[18.15, 19.45]];
  shot(S9, 1.12, 540, 1250);
  put(sala({ jx: 120 }));
  {
    const door = portaQueAbre(880);
    const m9 = marido(), e9 = esposa();
    put(maleta(), e9.itemL);
    put([box(140, 1180, 460, 200, 40, '#78716c', null, 7), box(110, 1260, 520, 190, 40, '#a8a29e', null, 7), box(170, 1220, 120, 90, 30, '#fde047', null, 5), box(450, 1220, 120, 90, 30, '#93c5fd', null, 5)]);
    const EX = K([[18.15, 600], [19.2, 900, 'i']]), Eo = odo(EX, 18.1, 19.5);
    const MY = K([[18.15, FL + 400], [18.7, FL + 400], [19.0, FL + 30, 'b']]);
    WB.effect(t => {
      if (!inWin(S9, t)) return;
      door(K([[18.15, 0], [18.6, 1, 'o']])(t));
      e9.update(t, Object.assign(esp({ x: EX(t), mood: MOODS.proud, look: 10, L: [-70, -40], alpha: 1 - clamp((t - 19.0) / 0.2) }), Eo(t)));
      m9.update(t, mar({ x: 370, y: MY(t), mood: MOODS.sly, op: opM(t), look: 12, L: [-150 + Math.sin(t * 12) * 20, -300], R: [130, -300] }));
    });
    put([box(110, 1260, 520, 190, 40, '#a8a29e', null, 7)]);
  }
  O(18.3, calendar(820, 700, 'SAIU', '8h', '#2563eb', 240), { anim: 'pop' });
  OT(18.9, 'TCHAU!', 860, 960, 60, '#7c3aed', 6, { loop: 'wiggle' });

  // =====================================================================
  // CENA 10 (19,45–21,85): o banheiro dela é dele: lendo jornal no trono
  // =====================================================================
  const S10 = [[19.45, 21.85]];
  shot(S10, 1.12, 540, 1250);
  put([{ d: `M 60 500 L 1020 500 L 1020 ${FL} L 60 ${FL} Z`, fill: '#e0f2fe', c: 'none', fo: 0.9 }, { d: `M 60 ${FL} L 1020 ${FL} L 1020 1700 L 60 1700 Z`, fill: '#cbd5e1', c: 'none' },
    ...[0, 1, 2, 3, 4, 5].map(i => ({ d: `M ${60 + i * 160} 900 L ${60 + i * 160} ${FL}`, c: '#93c5fd', w: 4 })), { d: 'M 60 900 L 1020 900', c: '#93c5fd', w: 4 },
    { d: WB.roughLine(60, FL, 1020, FL, 2), w: 7 }, box(760, 640, 180, 240, 20, '#bae6fd', '#64748b', 8), T('BANHEIRO DELA', 300, 640, 54, '#be185d')]);
  {
    const vg = WB.mk('g', { transform: `translate(540 ${FL})` }, cont);
    put(vaso(), vg);
    const m10 = marido();
    const jornal = [box(-80, -110, 160, 120, 6, '#f5f5f4', null, 5), T('NOTÍCIAS', 0, -70, 30, BK), { d: 'M -60 -40 L 60 -40 M -60 -16 L 40 -16', c: '#9ca3af', w: 4 }];
    put(jornal, m10.itemR);
    WB.effect(t => {
      if (!inWin(S10, t)) return;
      m10.update(t, mar({ x: 540, sit: 1, seatH: 150, mood: t < 20.6 ? MOODS.joy : MOODS.proud, op: opM(t), L: [-130, -200], R: [60, -210], shades: t > 20.6, headRot: Math.sin(t * 2) * 4 }));
    });
  }
  OT(20.2, 'AAAHH...', 260, 820, 64, '#0369a1', -6, { loop: 'float' });
  ostamp(20.9, 'FLUSH!', 820, 1100, 64, '#0284c7', 8, { loop: 'pulse' });

  // =====================================================================
  // CENA 11 (21,85–24,35): geladeira aberta brilhando + micro-ondas: PLIM!
  // =====================================================================
  const S11 = [[21.85, 24.35]];
  shot(S11, 1.12, 540, 1250);
  put(sala({ janela: false, lampada: false }));
  {
    put(geladeira(), WB.mk('g', { transform: `translate(240 ${FL})` }, cont));
    const doorG = WB.mk('g', {}, cont);
    put([box(110, FL - 560, 260, 560, 22, '#e2e8f0', null, 7), { d: `M 340 ${FL - 330} L 340 ${FL - 250} M 340 ${FL - 520} L 340 ${FL - 420}`, c: '#64748b', w: 10 }], doorG);
    const glow = holder([{ d: `M 120 ${FL - 540} L -60 ${FL - 680} M 120 ${FL - 300} L -100 ${FL - 300} M 120 ${FL - 80} L -60 ${FL + 40}`, c: '#fde047', w: 14 }]);
    const shelf = holder([box(130, FL - 520, 220, 160, 8, '#fef9c3', null, 5), circ(180, FL - 410, 26, '#ef4444', null, 4), box(220, FL - 470, 50, 90, 8, '#ffffff', null, 4), box(290, FL - 440, 40, 60, 6, '#86efac', null, 4)]);
    put(mesa(800, 1270, 340));
    const mw = WB.mk('g', { transform: `translate(800 1252)` }, cont);
    put(microondas(), mw);
    const m11 = marido();
    const MX = K([[21.85, 330], [22.9, 330], [23.2, 600, 'io']]), Mo = odo(MX, 21.8, 24.4);
    WB.effect(t => {
      if (!inWin(S11, t)) return;
      const op = clamp((t - 22.0) / 0.25);
      doorG.setAttribute('transform', `translate(110 0) scale(${r1((1 - 0.85 * op) * 1000) / 1000} 1) translate(-110 0)`);
      glow(0, 0, 0, 1, op * (0.6 + 0.4 * Math.sin(t * 12)));
      shelf(0, 0, 0, 1, op);
      const atMw = t > 23.1;
      m11.update(t, Object.assign(mar({ x: MX(t), mood: atMw ? MOODS.joy : MOODS.greedy, op: opM(t), look: atMw ? 12 : -12,
        L: atMw ? [-60, -60] : [-160, -240], R: atMw ? [170, -170] : [80, -60], headRot: atMw ? 4 : -6 }), Mo(t)));
    });
  }
  ostamp(23.3, 'PLIM!', 820, 950, 70, '#16a34a', -6, { loop: 'pulse' });

  // =====================================================================
  // CENA 12 (24,35–26,85): almoço completo na mesa dela, de guardanapo no pescoço
  // =====================================================================
  const S12 = [[24.35, 26.85]];
  shot(S12, 1.12, 540, 1250);
  put(sala({ planta: 940, jx: 120 }));
  {
    const m12 = marido();
    put([{ d: 'M -20 0 L -20 -90 M -34 -90 L -34 -60 M -6 -90 L -6 -60', c: '#9ca3af', w: 7 }], m12.itemL);
    put([{ d: 'M 0 0 L 0 -100', c: '#9ca3af', w: 9 }], m12.itemR);
    put(mesa(540, 1260, 640));
    const pl = holder(prato());
    const nap = holder([{ d: 'M -70 0 L 70 0 L 0 110 Z', fill: '#ffffff', w: 5 }, { d: 'M -40 30 L 40 30', c: '#ef4444', w: 4 }]);
    WB.effect(t => {
      if (!inWin(S12, t)) return;
      const chew = Math.sin(t * 14);
      m12.update(t, mar({ x: 540, y: FL - 20, mood: MOODS.joy, op: opM(t), L: [-150, -170 + chew * 20], R: [150, -170 - chew * 20], headRot: chew * 3 }));
      nap(540, FL - 20 - 320 - 6, 0, 0.9, 1);
      pl(540, 1240, 0, 1, 1);
    });
  }
  O(24.5, [{ d: WB.cloudPath(300, 1120, 40, 18, 7), c: '#d1d5db', w: 5 }, { d: WB.cloudPath(780, 1120, 40, 18, 7), c: '#d1d5db', w: 5 }], { loop: 'rise' });
  ostamp(25.1, 'ALMOÇO COMPLETO', 540, 1640, 66, '#b45309', -3, { loop: 'pulse' });
  OT(25.6, 'meu irmão!', 830, 700, 64, '#7c3aed', 6, { loop: 'wiggle' });

  // =====================================================================
  // CENA 13 (26,85–31,0): ela procura bonitinho no guarda-roupa... e acha ELE lá dentro
  // =====================================================================
  const S13 = [[26.85, CTA0]];
  shot(S13, 1.12, 540, 1250);
  put(sala({ janela: false, lx: 860 }));
  {
    const gr = guardaRoupa(380, FL, 440, 640);
    put([...vestido(250, FL - 560, '#f472b6'), ...vestido(360, FL - 560, '#c084fc'), ...vestido(500, FL - 560, '#fb7185')], gr.inside);
    const hidden = makePerson(gr.inside, MARIDO);
    const cue = holder([{ d: 'M -50 -20 L 50 -20 L 44 30 Q 20 30 0 10 Q -20 30 -44 30 Z', fill: '#38bdf8', w: 5 }, { d: 'M -50 -12 L 50 -12', c: '#ffffff', w: 4 }]);
    const e13 = esposa();
    put(lupa(), e13.itemR);
    const EX = K([[26.85, 900], [27.9, 720, 'io']]), Eo = odo(EX, 26.8, 31.1);
    const DO = K([[26.85, 0], [28.0, 0], [28.35, 1, 'o']]);
    WB.effect(t => {
      if (!inWin(S13, t)) return;
      gr.open(DO(t));
      const found = t > 29.0;
      hidden.update(t, mar({ x: 380, y: FL - 30, s: 0.82, mood: found ? MOODS.innocent : MOODS.sly, op: 0, look: 14, L: found ? [-150 + Math.sin(t * 12) * 24, -300] : [-60, -60], R: [60, -60] }));
      cue(600, FL - 300 + (found ? 0 : 0), -10, 1, t > 28.4 ? 1 : 0);
      e13.update(t, Object.assign(esp({ x: EX(t), f: -1, mood: found ? MOODS.horror : MOODS.squint, lean: found ? -10 : 18, look: -12, lookY: 6,
        R: found ? [150, -330] : [170, -120], rotR: found ? 0 : 70, L: found ? [-150, -330] : [-60, -60], headRot: found ? Math.sin(t * 40) * 3 : 0 }), Eo(t)));
    });
  }
  ostamp(29.0, 'VESTÍGIO ENCONTRADO!', 540, 1660, 66, INK.red, -3, { loop: 'shake' });
  OT(29.4, 'oi, amor!', 330, 720, 60, '#1d4ed8', -6, { loop: 'wiggle' });

  // =====================================================================
  // CTA (31,0–fim)
  // =====================================================================
  shot([[CTA0, 999]], 1);
  {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 560, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 650, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@cardeno_amarelo', 380, 650 + 190 * 0.62, 84, BK, g).strokes);
    animate(g, CTA0 + 0.1, { loop: 'float' });
    put([{ d: WB.roughLine(96, 1600, 1060, 1600, 2), w: 7 }]);
    const mc = makePerson(cont, MARIDO), ec = makePerson(cont, ESPOSA);
    put(lupa(), ec.itemR);
    WB.effect(t => {
      if (t < CTA0) return;
      mc.update(t, { x: 330, y: 1600, s: 0.85, f: 1, seed: 0.3, mood: MOODS.joy, shades: true, alpha: 0.55 + 0.35 * Math.sin(t * 3), L: [-90 + Math.sin(t * 10) * 26, -300], R: [130, -150], hop: Math.abs(Math.sin(t * 6)) * 20 });
      ec.update(t, { x: 750, y: 1600, s: 0.85, f: -1, seed: 1.7, mood: MOODS.squint, lean: 16, look: -12, R: [170, -120], rotR: 70 });
    });
  }

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA: @cardeno_amarelo troca de canto a cada ~5 s
  // =====================================================================
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const S = 40, fs = 36, handle = '@cardeno_amarelo';
    const tw = WB.measure(handle, fs), total = S + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -S / 2 - 10, width: r1(total + 44), height: S + 20, rx: (S + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -S / 2, S, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + S + 12, S * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[300, 470], [780, 470], [790, 1560], [300, 1560]];
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
