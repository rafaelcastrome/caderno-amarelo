// Meme "O leão e o veado saindo da Arca de Noé" (animação original de @dalvarothi) redesenhado no Caderno Amarelo,
// formato de cenas (cortes com deslize, faixa amarela de legenda) + MOVIMENTO FLUIDO COM DESLOCAMENTO REAL.
// Os dois bichos são esqueletos de quadrúpede recalculados a cada quadro (makeBeast): espinha que empina, patas com IK
// de dois ossos e pés PRESOS AO CHÃO (a fase do passo vem da distância percorrida, então o pé não escorrega),
// trote/galope, sentar, deitar, braços quando empinam, respiração, piscadas, juba/orelhas com movimento secundário.
// Áudio original (sem risada no final). Quem fala em cada trecho: janelas L_WIN / D_WIN / SING.
// A marca d'água @caderno_amarelo passeia por 4 cantos seguros (fora da ação e da interface do TikTok/Instagram).
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
  const ENV = '03778779999876889776798879999989855888988887753468777777667667786654777678677776666667899999879999988989999889887988989889999756888657766666666666555566666630000003677556789866777788887500000000001554105755544302000662144321343134420122111363245413034652263633326721543664156388875355340110570877396656885623337773405479704860165893167577974008602765389950558504577425836613600374075100687320000004768776776677075674008305815544421102300210000001116566787210000000000000067898867678459995453675799862871698767792798068812750876400989997510000000000000954976868730889761008479658505677796188237707587048863600029616895087077596986068735786086056547572576840775046531485399998707606076073341011113975002353323442344545634454100011000000000020000010000010000210000100000000002110012310000000021002788077896677010000432651487983046064067524456577787185789877958773503888088048898678848570677744682443570664667678776640010000010000039988951000269525401007530100000021000000000000000010647465220000001467412246679645868874568357513463100010000014555536867335775435675125210000000000000000000000000000023024553585758871377653687773343332333331444445665566676666766556554544533444342232332355665565544121142222111112221000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  const SING = [[0.0, 7.45]];
  const D_WIN = [[9.55, 10.5], [11.3, 16.6], [21.5, 22.9], [25.35, 27.0], [27.45, 31.9], [33.3, 34.0], [34.55, 36.3], [39.55, 41.6],
    [49.6, 50.2], [51.55, 53.2], [54.55, 56.35]];
  const L_WIN = [[10.5, 11.3], [16.6, 21.5], [23.45, 25.35], [31.95, 33.3], [34.0, 34.55], [41.6, 45.7], [46.35, 47.2], [48.85, 49.55], [50.2, 51.3]];
  const talk = (wins, t, k = 1.25) => {
    for (const [a, b] of wins) if (t >= a && t <= b) return clamp(envAt(t) * k) * clamp((b - t) / 0.06) * clamp((t - a) / 0.04);
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
  const ZK = 1.25, ZX = 540, ZY = 1200;
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

  const MOODS = {
    neutral: { lid: 0.1, smile: 3 },
    sing: { happy: 1, smile: 10 },
    happy: { happy: 1, smile: 13, blush: 0.6 },
    smile: { lid: 0.08, smile: 12, sparkle: 1 },
    shock: { pr: 0.55, bi: -14, bo: -10, smile: -8 },
    pain: { lid: 0.72, bi: 12, bo: -6, smile: -10, tear: 0.6 },
    angry: { lid: 0.25, bi: 15, bo: -8, smile: -9, pr: 0.8 },
    innocent: { pr: 1.55, sparkle: 1, py: -7, px: 4, bi: -9, smile: 5 },
    smug: { lid: 0.55, smile: 10, bi: 5 },
    sad: { lid: 0.2, bi: -12, bo: 6, py: 3, tear: 0.7, smile: -8 },
    cry: { lid: 0.45, bi: -14, bo: 8, tear: 1, smile: -10 },
    scared: { pr: 0.6, bi: -16, bo: -6, smile: -10, sweat: 1 },
    greedy: { pr: 1.45, sparkle: 1, smile: 9, bi: -6 },
    annoyed: { lid: 0.55, smile: -5, bi: 8, bo: -3 },
    sick: { lid: 0.5, bi: -10, bo: 4, smile: -9, sweat: 1, pr: 0.8 },
    weak: { lid: 0.62, bi: -12, bo: 6, smile: -6 },
    calm: { lid: 0.92, smile: 7 },
    horror: { pr: 0.38, bi: -18, bo: -12, smile: -10, sweat: 1 },
    proud: { lid: 0.32, smile: 12, bi: -4, py: -3 },
    sheepish: { lid: 0.15, smile: 7, bi: -9, px: 7, blush: 1 },
    sly: { lid: 0.45, smile: 11, bi: 6, asym: 1, px: 5 },
    panting: { lid: 0.3, bi: -6, smile: -4, sweat: 1 },
    dead: { lid: 0, smile: -6 },
  };

  // =====================================================================
  // RIG DE QUADRÚPEDE (leão e veado). Origem = chão embaixo do meio do corpo, olhando para +x.
  // st: x, y, s, f, d/v (odômetro), run, sp (espinha em graus; negativo empina), sit, lie, slope,
  //     arm/A1 (pata dianteira de perto vira braço, alvo local), armB/A2 (a de longe), headRot, neckRot,
  //     mood, op, tongue, look, lookY, sick (verde), xeyes, hop, rot, earFlap, wag, ribs, bandage, drool
  // =====================================================================
  const LION = { kind: 'lion', legH: 120, BL: 190, r: 58, a: 66, b: 64, legW: 32, col: '#f0c987', dark: '#d9a960', belly: '#f8e3b8',
    legCol: '#f0c987', legFar: '#ddb06c', neckLen: 48, neckW: 64, neckRest: -42 };
  const DEER = { kind: 'deer', legH: 150, BL: 160, r: 44, a: 80, b: 78, legW: 18, col: '#a8673d', dark: '#7c4524', belly: '#ecd0a8',
    legCol: '#c99566', legFar: '#a87850', neckLen: 118, neckW: 40, neckRest: -64 };
  const MANE = '#c8552b';

  function makeBeast(parent, SP) {
    const g = WB.mk('g', {}, parent);
    const inner = WB.mk('g', {}, g);
    const tailO = dyn(inner, { 'stroke-width': SP.kind === 'lion' ? 16 : 10 }), tailI = dyn(inner, { stroke: SP.col, 'stroke-width': SP.kind === 'lion' ? 8 : 4 });
    const tuft = WB.mk('path', { d: '', fill: SP.kind === 'lion' ? MANE : '#ffffff', stroke: BK, 'stroke-width': 5 }, inner);
    const mkLeg = (col) => { const lg = WB.mk('g', {}, inner); return { o: dyn(lg, { 'stroke-width': SP.legW + 11 }), i: dyn(lg, { stroke: col, 'stroke-width': SP.legW }), ft: WB.mk('path', { d: '', fill: SP.kind === 'lion' ? col : '#3f2a1c', stroke: BK, 'stroke-width': 5 }, lg), g: lg }; };
    const hindFar = mkLeg(SP.legFar), frontFar = mkLeg(SP.legFar);
    const body = WB.mk('path', { d: '', fill: SP.col, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, inner);
    const belly = WB.mk('path', { d: '', fill: SP.belly, stroke: 'none' }, inner);
    const spots = SP.kind === 'deer' ? [0, 1, 2, 3].map(() => WB.mk('path', { d: '', fill: '#f3e3c8', stroke: 'none' }, inner)) : [];
    const ribs = dyn(inner, { 'stroke-width': 4, stroke: '#a16207', opacity: 0 });
    const hindNear = mkLeg(SP.legCol);
    const band = WB.mk('path', { d: '', fill: '#ffffff', stroke: BK, 'stroke-width': 4, opacity: 0 }, inner);
    const neckO = dyn(inner, { 'stroke-width': SP.neckW + 12 }), neckI = dyn(inner, { stroke: SP.col, 'stroke-width': SP.neckW });
    const neckBelly = dyn(inner, { stroke: SP.belly, 'stroke-width': SP.neckW * 0.35 });
    // cabeça (de frente para a câmera)
    const head = WB.mk('g', {}, inner);
    const maneG = WB.mk('g', {}, head);
    let earL = null, earR = null, antler = null;
    if (SP.kind === 'lion') {
      WB.mk('path', { d: WB.cloudPath(0, 4, 112, 106, 13), fill: MANE, stroke: BK, 'stroke-width': 6 }, maneG);
      WB.mk('path', { d: 'M -40 -88 q 10 14 4 30 M 30 -92 q 12 12 8 28 M -84 -20 q 14 6 18 22 M 80 -24 q -14 8 -16 24', fill: 'none', stroke: '#9a3412', 'stroke-width': 4 }, maneG);
      [-1, 1].forEach(sd => {
        WB.mk('path', { d: ellipse(sd * 62, -60, 22, 22), fill: SP.col, stroke: BK, 'stroke-width': 5 }, head);
        WB.mk('path', { d: ellipse(sd * 62, -58, 11, 11), fill: '#f4a7a7', stroke: 'none' }, head);
      });
      WB.mk('path', { d: ellipse(0, 8, 74, 68), fill: SP.col, stroke: BK, 'stroke-width': 6 }, head);
    } else {
      antler = WB.mk('g', {}, head);
      [-1, 1].forEach(sd => {
        const d = `M ${sd * 22} -56 Q ${sd * 34} -110 ${sd * 30} -150 M ${sd * 30} -100 Q ${sd * 62} -112 ${sd * 72} -140 M ${sd * 32} -128 Q ${sd * 8} -142 ${sd * 2} -166`;
        WB.mk('path', { d, fill: 'none', stroke: BK, 'stroke-width': 18, 'stroke-linecap': 'round' }, antler);
        WB.mk('path', { d, fill: 'none', stroke: '#b8b2a7', 'stroke-width': 9, 'stroke-linecap': 'round' }, antler);
      });
      const ear = (sd) => {
        const eg = WB.mk('g', {}, head);
        WB.mk('path', { d: `M 0 0 Q ${sd * 40} -36 ${sd * 92} -14 Q ${sd * 44} 18 0 0 Z`, fill: SP.col, stroke: BK, 'stroke-width': 5, 'stroke-linejoin': 'round' }, eg);
        WB.mk('path', { d: `M ${sd * 14} -2 Q ${sd * 42} -24 ${sd * 76} -12 Q ${sd * 42} 8 ${sd * 14} -2 Z`, fill: '#f4b8a8', stroke: 'none' }, eg);
        return eg;
      };
      earL = ear(-1); earR = ear(1);
      WB.mk('path', { d: 'M -50 -10 Q -56 -64 0 -66 Q 56 -64 50 -10 Q 50 50 30 74 Q 0 92 -30 74 Q -50 50 -50 -10 Z', fill: SP.col, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, head);
    }
    const sickF = WB.mk('path', { d: SP.kind === 'lion' ? ellipse(0, 8, 70, 64) : ellipse(0, 8, 46, 62), fill: '#86c26b', opacity: 0 }, head);
    if (SP.kind === 'lion') WB.mk('path', { d: ellipse(0, 40, 42, 30), fill: SP.belly, stroke: 'none' }, head);
    else WB.mk('path', { d: ellipse(0, 48, 34, 30), fill: SP.belly, stroke: 'none' }, head);
    const blush = WB.mk('g', { opacity: 0 }, head);
    WB.mk('path', { d: ellipse(-44, 28, 13, 8), fill: '#f87171' }, blush); WB.mk('path', { d: ellipse(44, 28, 13, 8), fill: '#f87171' }, blush);
    const EY = SP.kind === 'lion' ? -8 : -14, EX = SP.kind === 'lion' ? 30 : 22;
    const eyeL = makeEye(head, -EX, EY, 20, 25, SP.col, { prx: 7, browW: 6 });
    const eyeR = makeEye(head, EX, EY, 20, 25, SP.col, { prx: 7, browW: 6 });
    const xe = dyn(head, { 'stroke-width': 7, opacity: 0, d: `M ${-EX - 14} ${EY - 14} L ${-EX + 14} ${EY + 14} M ${-EX + 14} ${EY - 14} L ${-EX - 14} ${EY + 14} M ${EX - 14} ${EY - 14} L ${EX + 14} ${EY + 14} M ${EX + 14} ${EY - 14} L ${EX - 14} ${EY + 14}` });
    if (SP.kind === 'lion') {
      WB.mk('path', { d: 'M -16 16 Q 0 10 16 16 Q 14 30 0 34 Q -14 30 -16 16 Z', fill: '#e8899a', stroke: BK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, head);
    } else {
      WB.mk('path', { d: ellipse(0, 34, 17, 15), fill: '#e0473a', stroke: BK, 'stroke-width': 4 }, head);
      WB.mk('circle', { cx: -6, cy: 28, r: 5, fill: '#ffffff', opacity: 0.8 }, head);
    }
    const mouth = makeMouth(head, 0, SP.kind === 'lion' ? 52 : 62, SP.kind === 'lion' ? 36 : 28);
    const drool = WB.mk('path', { d: '', fill: '#93c5fd', stroke: BK, 'stroke-width': 3, opacity: 0 }, head);
    const sweat = WB.mk('path', { d: 'M 70 -60 q -14 24 0 36 q 14 -12 0 -36 Z', fill: '#93c5fd', stroke: BK, 'stroke-width': 4, opacity: 0 }, head);
    const frontNear = mkLeg(SP.legCol);

    const legs = [hindNear, hindFar, frontNear, frontFar];
    const rig = {
      g, head,
      update(t, st) {
        const s = st.s || 1, f = st.f || 1;
        const run = st.run || 0, sit = st.sit || 0, lie = st.lie || 0;
        const amp = clamp((st.v || 0) / (40 * s)) * (1 - lie) * (1 - sit);
        const dl = (st.d || 0) * f / s;
        const gw = GAITS.walk, gr = GAITS.run;
        const uw = dl / gw.S, ur = dl / gr.S;
        const legOff = (i) => {
          const a = footOff(uw, gw.off[i], gw.S, gw.D, gw.lift), b = footOff(ur, gr.off[i], gr.S, gr.D, gr.lift);
          return [lerp(a[0], b[0], run) * amp, lerp(a[1], b[1], run) * amp];
        };
        const breath = Math.sin(t * 2.4 + (st.seed || 0));
        const bob = (-Math.abs(Math.sin(2 * Math.PI * uw)) * 5 * (1 - run) - (0.5 + 0.5 * Math.sin(2 * Math.PI * ur + 1.2)) * 20 * run) * amp;
        g.setAttribute('transform', `translate(${r1(st.x)} ${r1(st.y - (st.hop || 0))}) rotate(${r1(st.rot || 0)}) scale(${r1(s * f * 1000) / 1000} ${s})`);
        const slopeK = Math.tan((st.slope || 0) * DEG);
        const gy = x => x * slopeK;
        const hipH = lerp(lerp(SP.legH, SP.legH * 0.3, sit), SP.r * 0.92, lie);
        const hip = [-SP.BL / 2, -hipH + bob + gy(-SP.BL / 2) * (1 - lie)];
        const spr = ((st.sp || 0) + Math.sin(2 * Math.PI * ur) * 5 * run * amp) * DEG;
        const c = Math.cos(spr), sn = Math.sin(spr), nx = -sn, ny = c;
        const p = (u, v) => [hip[0] + u * c + v * nx, hip[1] + u * sn + v * ny];
        const P2 = (u, v) => { const q = p(u, v); return `${r1(q[0])} ${r1(q[1])}`; };
        const L = SP.BL, half = SP.r + breath * 1.2;
        const sh = p(L, 0);
        body.setAttribute('d', `M ${P2(0, -half)} L ${P2(L, -half)} Q ${P2(L + half * 0.95, -half)} ${P2(L + half * 0.95, 0)} Q ${P2(L + half * 0.95, half)} ${P2(L, half)} L ${P2(0, half)} Q ${P2(-half * 0.95, half)} ${P2(-half * 0.95, 0)} Q ${P2(-half * 0.95, -half)} ${P2(0, -half)} Z`);
        belly.setAttribute('d', `M ${P2(6, half - 5)} L ${P2(L - 6, half - 5)} Q ${P2(L + 10, half - 18)} ${P2(L - 6, half - 24)} L ${P2(6, half - 24)} Q ${P2(-10, half - 16)} ${P2(6, half - 5)} Z`);
        spots.forEach((e, i) => { const q = p(L * (0.15 + i * 0.22), -half * 0.5 + (i % 2) * 8); e.setAttribute('d', ellipse(r1(q[0]), r1(q[1]), 11, 7)); });
        ribs.setAttribute('opacity', (st.ribs || 0).toFixed(2));
        if (st.ribs) ribs.setAttribute('d', [0.35, 0.5, 0.65].map(k => `M ${P2(L * k, -half * 0.6)} Q ${P2(L * k + 16, 0)} ${P2(L * k, half * 0.6)}`).join(' '));
        // rabo
        const wag = st.wag ?? 1;
        if (SP.kind === 'lion') {
          const upT = clamp(-(st.sp || 0) / 70);
          let q = p(-half * 0.8, -half * 0.25), a = lerp(spr + Math.PI + 0.5, Math.PI + 0.15, upT), d = `M ${r1(q[0])} ${r1(q[1])}`;
          for (let i = 1; i <= 9; i++) {
            a += -0.16 + Math.sin(t * 2.6 - i * 0.5) * 0.12 * wag * (i / 9) * 2 + run * amp * 0.03;
            const nq = [q[0] + Math.cos(a) * 17, q[1] + Math.sin(a) * 17];
            d += ` L ${r1(nq[0])} ${r1(nq[1])}`; q = nq;
          }
          tailO.setAttribute('d', d); tailI.setAttribute('d', d);
          tuft.setAttribute('d', `M ${r1(q[0] - 14)} ${r1(q[1] - 4)} Q ${r1(q[0])} ${r1(q[1] - 30)} ${r1(q[0] + 14)} ${r1(q[1] - 4)} Q ${r1(q[0] + 4)} ${r1(q[1] + 18)} ${r1(q[0] - 14)} ${r1(q[1] - 4)} Z`);
        } else {
          const q = p(-half * 0.85, -half * 0.55), a = spr + Math.PI + 0.9 + Math.sin(t * 9) * 0.25 * wag;
          tailO.setAttribute('d', ''); tailI.setAttribute('d', '');
          const e = [q[0] + Math.cos(a) * 34, q[1] + Math.sin(a) * 34];
          tuft.setAttribute('d', `M ${r1(q[0])} ${r1(q[1] - 8)} Q ${r1(e[0])} ${r1(e[1] - 8)} ${r1(e[0])} ${r1(e[1])} Q ${r1(e[0] + 4)} ${r1(e[1] + 10)} ${r1(q[0])} ${r1(q[1] + 8)} Z`);
          tuft.setAttribute('fill', SP.col);
        }
        // patas
        const up = clamp(-(st.sp || 0) / 70);
        const roots = [p(4, half * 0.45), p(-4, half * 0.35), p(L - 4, half * 0.45), p(L + 4, half * 0.35)];
        const restX = [hip[0] + 8, hip[0] - 10, sh[0] + 4, sh[0] + 20];
        const relT = (A) => (A && st.armRel) ? [sh[0] + A[0], sh[1] + A[1]] : A;
        const armT = [null, null, st.arm ? relT(st.A1) : null, st.armB ? relT(st.A2) : null];
        const armK = [0, 0, st.arm || 0, st.armB || 0];
        legs.forEach((lg, i) => {
          const rt = roots[i];
          const o = legOff(i);
          let fx = restX[i] + o[0], fy = gy(restX[i] + o[0]) + o[1];
          if (i < 2) { fx = lerp(fx, hip[0] + 92 - i * 18, sit); fy = lerp(fy, 0, sit); }
          if (i >= 2 && up > 0) { // empinado: patas da frente penduradas no peito
            fx = lerp(fx, sh[0] + 46 - (i - 2) * 16, up); fy = lerp(fy, sh[1] + SP.a + 20, up);
          }
          if (lie) {
            const lx = i < 2 ? hip[0] - 70 - i * 20 : sh[0] + 90 + (i - 2) * 26;
            fx = lerp(fx, lx, lie); fy = lerp(fy, -6, lie);
          }
          if (armK[i] > 0 && armT[i]) { fx = lerp(fx, armT[i][0], armK[i]); fy = lerp(fy, armT[i][1], armK[i]); }
          let pole;
          if (i < 2) pole = sit > 0.5 ? [rt[0] + 300, rt[1] - 200] : [rt[0] - 300, rt[1] + SP.a];
          else pole = (armK[i] > 0.5 || up > 0.5) ? [rt[0] - 120, rt[1] + 300] : [rt[0] + 300, rt[1] + SP.a];
          if (lie && i >= 2) pole = [rt[0] + 100, rt[1] - 200];
          const k = ik(rt[0], rt[1], fx, fy, SP.a, SP.b, pole);
          const d = `M ${r1(rt[0])} ${r1(rt[1])} L ${r1(k.el[0])} ${r1(k.el[1])} L ${r1(k.h[0])} ${r1(k.h[1])}`;
          lg.o.setAttribute('d', d); lg.i.setAttribute('d', d);
          const hx = k.h[0], hy = k.h[1];
          if (SP.kind === 'lion') lg.ft.setAttribute('d', ellipse(r1(hx + 8), r1(hy - 2), 24, 14));
          else lg.ft.setAttribute('d', `M ${r1(hx - 11)} ${r1(hy - 10)} L ${r1(hx + 11)} ${r1(hy - 10)} L ${r1(hx + 14)} ${r1(hy + 4)} L ${r1(hx - 12)} ${r1(hy + 4)} Z`);
          lg.end = k.h; lg.knee = k.el; lg.root = rt;
        });
        // curativo na pata de trás (depois da mordida)
        band.setAttribute('opacity', st.bandage ? 1 : 0);
        if (st.bandage) {
          const a = hindNear.knee, b = hindNear.end, m = [lerp(a[0], b[0], 0.45), lerp(a[1], b[1], 0.45)];
          band.setAttribute('d', `M ${r1(m[0] - 16)} ${r1(m[1] - 12)} L ${r1(m[0] + 16)} ${r1(m[1] - 12)} L ${r1(m[0] + 16)} ${r1(m[1] + 12)} L ${r1(m[0] - 16)} ${r1(m[1] + 12)} Z`);
        }
        // pescoço e cabeça
        const nb = p(L + 6, -half * 0.45);
        const nd = (lerp(SP.neckRest, -88, up) + (st.neckRot || 0) + lie * 40 * 0) * DEG + (up ? 0 : spr * 0.6);
        const hc = [nb[0] + Math.cos(nd) * SP.neckLen, nb[1] + Math.sin(nd) * SP.neckLen];
        const nd2 = `M ${r1(nb[0])} ${r1(nb[1])} L ${r1(hc[0])} ${r1(hc[1])}`;
        neckO.setAttribute('d', nd2); neckI.setAttribute('d', nd2);
        neckBelly.setAttribute('d', SP.kind === 'deer' ? `M ${r1(nb[0] + 10)} ${r1(nb[1] + 6)} L ${r1(hc[0] + 12)} ${r1(hc[1] + 20)}` : '');
        const op = st.op || 0;
        const hr = (st.headRot || 0) + Math.sin(t * 1.5 + (st.seed || 0)) * 1.5 + op * Math.sin(t * 11) * 3;
        const hs = SP.kind === 'lion' ? 1 : 0.92;
        head.setAttribute('transform', `translate(${r1(hc[0])} ${r1(hc[1] - op * 4 + breath)}) rotate(${r1(hr)}) scale(${hs})`);
        // juba / orelhas: secundário (atrasa com a velocidade e balança)
        const lag = (st.v || 0) * 0.012 * (1 - lie);
        maneG.setAttribute('transform', `rotate(${r1(-lag * 3 + Math.sin(t * 2.1) * 1.5 + op * Math.sin(t * 9) * 2)}) translate(${r1(-lag * 3)} 0)`);
        if (earL) {
          const fl = (st.earFlap || 0) * Math.sin(t * 10) * 14 + Math.sin(t * 1.9) * 4 + lag * 3;
          earL.setAttribute('transform', `translate(-44 -40) rotate(${r1(-fl + (st.earDown || 0) * -30)})`);
          earR.setAttribute('transform', `translate(44 -40) rotate(${r1(fl + (st.earDown || 0) * 30)})`);
        }
        const m = st.mood || MOODS.neutral;
        const b = blinkAt(t, (st.seed || 0) + 0.5, 3.3);
        const pe = Object.assign({}, m, { lid: Math.max(m.lid || 0, b), px: (m.px || 0) + (st.look || 0), py: (m.py || 0) + (st.lookY || 0) });
        const xv = st.xeyes || 0;
        if (xv < 0.5) { eyeL(pe, -1, t); eyeR(pe, 1, t); }
        else { eyeL(Object.assign({}, pe, { lid: 1, happy: 0, tear: 0 }), -1, t); eyeR(Object.assign({}, pe, { lid: 1, happy: 0, tear: 0 }), 1, t); }
        xe.setAttribute('opacity', xv > 0.5 ? 1 : 0);
        mouth(op, m.smile || 0, { tongue: st.tongue || 0 });
        blush.setAttribute('opacity', (m.blush || 0).toFixed(2));
        sweat.setAttribute('opacity', (m.sweat || 0).toFixed(2));
        sweat.setAttribute('transform', `translate(0 ${r1((t * 34) % 30)})`);
        sickF.setAttribute('opacity', (0.65 * (st.sick || 0)).toFixed(2));
        const dr = st.drool || 0;
        drool.setAttribute('opacity', dr > 0.02 ? 1 : 0);
        if (dr > 0.02) { const ln = 14 + 40 * dr + Math.sin(t * 5) * 6; drool.setAttribute('d', `M 18 60 L 26 60 Q 30 ${r1(60 + ln)} 22 ${r1(66 + ln)} Q 14 ${r1(60 + ln)} 18 60 Z`); }
        // pontos no mundo
        const W2 = tf(st.x, st.y - (st.hop || 0), st.rot || 0, s * f, s);
        rig.headW = W2(hc[0], hc[1]);
        rig.mouthW = W2(hc[0], hc[1] + (SP.kind === 'lion' ? 52 : 62) * hs);
        rig.armW = W2(...frontNear.end); rig.armBW = W2(...frontFar.end);
        rig.hindW = W2(...hindNear.end); rig.hindKneeW = W2(...hindNear.knee);
        rig.bodyW = W2(...p(L / 2, 0));
        rig.sh = sh; rig.hip = hip;
      },
    };
    return rig;
  }

  // ---------------- figurantes ----------------
  // coelhinho que pula (deslocamento real: x(t) linear, pulos amarrados à distância)
  function makeRabbit(parent) {
    const g = WB.mk('g', {}, parent);
    const ears = WB.mk('g', {}, g);
    WB.mk('path', { d: 'M 18 -58 Q 8 -110 22 -116 Q 36 -110 30 -58 Z M 34 -56 Q 40 -104 54 -104 Q 62 -96 42 -54 Z', fill: '#f5f5f4', stroke: BK, 'stroke-width': 5 }, ears);
    WB.mk('path', { d: ellipse(0, -30, 42, 30), fill: '#f5f5f4', stroke: BK, 'stroke-width': 5 }, g);
    WB.mk('path', { d: ellipse(-40, -40, 12, 12), fill: '#ffffff', stroke: BK, 'stroke-width': 4 }, g);
    WB.mk('path', { d: ellipse(30, -56, 26, 22), fill: '#f5f5f4', stroke: BK, 'stroke-width': 5 }, g);
    WB.mk('circle', { cx: 38, cy: -60, r: 4, fill: '#111' }, g);
    WB.mk('circle', { cx: 54, cy: -52, r: 4, fill: '#f472b6' }, g);
    const legs = dyn(g, { 'stroke-width': 6 });
    return (t, x, y, s = 1, f = 1, X0 = 0, op = 1) => {
      const dist = Math.abs(x - X0) / (90 * s);
      const ph = dist % 1, hop = Math.sin(Math.PI * ph) * 46;
      g.setAttribute('transform', `translate(${r1(x)} ${r1(y - hop * s)}) scale(${s * f} ${s}) rotate(${r1(-Math.cos(Math.PI * ph) * 10)})`);
      legs.setAttribute('d', `M -20 -4 L ${r1(-30 - Math.sin(Math.PI * ph) * 12)} 4 M 18 -6 L ${r1(24 + Math.sin(Math.PI * ph) * 10)} 4`);
      ears.setAttribute('transform', `rotate(${r1(Math.sin(Math.PI * ph) * -12)} 30 -58)`);
      g.setAttribute('opacity', op);
    };
  }
  // avestruz ("ema") correndo: pernas com IK e pés presos ao chão
  function makeOstrich(parent) {
    const g = WB.mk('g', {}, parent);
    const legF = [dyn(g, { 'stroke-width': 9 }), dyn(g, { 'stroke-width': 9 })];
    const neck = dyn(g, { 'stroke-width': 14 }), neckI = dyn(g, { stroke: '#f2b8a0', 'stroke-width': 6 });
    const bodyG = WB.mk('g', {}, g);
    WB.mk('path', { d: WB.cloudPath(0, -170, 80, 52, 9), fill: '#4b4b55', stroke: BK, 'stroke-width': 5 }, bodyG);
    WB.mk('path', { d: 'M -80 -190 q -30 -20 -40 10 q 20 -2 40 6 Z', fill: '#f5f5f4', stroke: BK, 'stroke-width': 4 }, bodyG);
    const headG = WB.mk('g', {}, g);
    WB.mk('path', { d: ellipse(0, 0, 20, 16), fill: '#f2b8a0', stroke: BK, 'stroke-width': 4 }, headG);
    WB.mk('path', { d: 'M 16 -2 L 40 4 L 16 10 Z', fill: '#f59e0b', stroke: BK, 'stroke-width': 3 }, headG);
    WB.mk('circle', { cx: 6, cy: -4, r: 6, fill: '#ffffff', stroke: BK, 'stroke-width': 2 }, headG);
    WB.mk('circle', { cx: 8, cy: -4, r: 3, fill: '#111' }, headG);
    return (t, x, y, s, f, od) => {
      const { d, v } = od(t);
      const amp = clamp(v / (60 * s)), u = (d * f / s) / 210;
      const bob = -(0.5 + 0.5 * Math.sin(4 * Math.PI * u)) * 14 * amp;
      g.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) scale(${s * f} ${s})`);
      bodyG.setAttribute('transform', `translate(0 ${r1(bob)}) rotate(${r1(-8 * amp)} 0 -170)`);
      [0, 0.5].forEach((o, i) => {
        const fo = footOff(u, o, 210, 0.4, 50);
        const fx = fo[0] * amp, fy = fo[1] * amp;
        const k = ik(10, -150 + bob, fx + 10, fy, 80, 82, [200, -60]);
        legF[i].setAttribute('d', `M 10 ${r1(-150 + bob)} L ${r1(k.el[0])} ${r1(k.el[1])} L ${r1(k.h[0])} ${r1(k.h[1])} l 18 0`);
      });
      const hx = 96 + Math.sin(t * 14) * 6 * amp, hy = -320 + bob + Math.cos(t * 14) * 4 * amp;
      const nd = `M 56 ${r1(-190 + bob)} Q 70 ${r1(-250 + bob)} ${r1(hx)} ${r1(hy)}`;
      neck.setAttribute('d', nd); neckI.setAttribute('d', nd);
      headG.setAttribute('transform', `translate(${r1(hx)} ${r1(hy)})`);
    };
  }

  // ---------------- objetos ----------------
  function holder(specs, parent) {
    const g = WB.mk('g', {}, parent || cont);
    put(specs, g);
    return (x, y, rot = 0, sc = 1, op = 1) => {
      g.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)}) scale(${sc})`);
      g.setAttribute('opacity', op);
    };
  }
  const cup = () => [{ d: 'M 22 -30 Q 44 -30 44 -14 Q 44 2 22 2', w: 7 }, { d: 'M -28 -34 L 28 -34 L 22 6 Q 0 14 -22 6 Z', fill: '#ffffff', w: 5 },
    { d: 'M -14 -16 l 6 6 l 6 -6 M 6 -16 l 6 6 l 6 -6', c: '#2563eb', w: 3 }, { d: ellipse(0, -34, 28, 7), fill: '#b45309', w: 4 }];
  const teapot = () => [{ d: 'M -40 -20 Q -44 -70 0 -72 Q 44 -70 40 -20 Q 40 6 0 8 Q -40 6 -40 -20 Z', fill: '#ffffff', w: 6 },
    { d: 'M 38 -40 L 76 -66 L 70 -52 L 40 -22', fill: '#ffffff', w: 5 }, { d: 'M -40 -50 Q -70 -50 -66 -26 Q -62 -10 -40 -16', w: 7 },
    { d: 'M -16 -74 Q 0 -90 16 -74', w: 6 }, circ(0, -90, 7, '#2563eb', null, 4), { d: 'M -24 -36 l 10 10 l 10 -10 l 10 10 l 10 -10', c: '#2563eb', w: 4 }];
  const knife = () => [{ d: 'M -10 0 L 18 0', c: '#7c2d12', w: 14 }, { d: 'M 18 -8 L 96 -14 Q 104 -4 96 6 L 18 8 Z', fill: '#e5e7eb', w: 5 }];
  const fork = () => [{ d: 'M -10 0 L 60 0', c: '#9ca3af', w: 10 }, { d: 'M 60 -14 L 60 14 M 60 -14 L 96 -14 M 60 -4 L 96 -4 M 60 6 L 96 6 M 60 14 L 96 14', c: '#9ca3af', w: 6 }];
  const salad = () => [{ d: ellipse(0, 0, 84, 20), fill: '#ffffff', w: 6 }, { d: WB.cloudPath(0, -20, 56, 24, 9), fill: '#4ade80', w: 5 },
    circ(-24, -26, 10, '#ef4444', null, 3), circ(20, -30, 9, '#ef4444', null, 3), { d: 'M -6 -40 l 10 -10', c: '#166534', w: 4 }];
  const coalBag = () => [{ d: 'M -50 -70 L 50 -70 L 56 70 L -56 70 Z', fill: '#dc2626', w: 6 }, { d: 'M -32 -10 Q 0 -50 32 -10 Q 20 30 0 34 Q -20 30 -32 -10 Z', fill: '#f59e0b', w: 4 },
    { d: 'M -14 6 Q 0 -20 14 6 Q 8 20 0 20 Q -8 20 -14 6 Z', fill: '#fde047', w: 3 }, T('CARVÃO', 0, 58, 26, '#ffffff')];
  const mateBox = () => [box(-80, -110, 160, 150, 10, '#facc15', null, 7), box(-66, -96, 132, 44, 8, '#16a34a', null, 4), T('MATE', 0, -62, 40, '#ffffff'),
    T('LEÃO', 0, 6, 54, '#b91c1c'), { d: 'M -60 22 L 60 22', c: '#b91c1c', w: 4 }];
  const grill = () => [{ d: 'M -100 0 L 100 0 L 84 70 L -84 70 Z', fill: '#4b5563', w: 7 }, { d: 'M -70 70 L -90 230 M 70 70 L 90 230 M -40 150 L 40 150', w: 9 },
    { d: 'M -90 -4 L 90 -4', c: '#9ca3af', w: 8 }, { d: 'M -60 -10 L -60 0 M -20 -10 L -20 0 M 20 -10 L 20 0 M 60 -10 L 60 0', c: '#9ca3af', w: 5 }];

  const FL = 1450;     // piso padrão
  const LS = 1.1;      // escala do leão
  const DS = 1.0;      // escala do veado
  const CTA0 = 58.3;
  const noteSym = (x, y, s = 1, c = '#7c3aed') => [{ d: `M ${x} ${y} L ${x} ${y - 60 * s} L ${x + 34 * s} ${y - 70 * s} L ${x + 34 * s} ${y - 12 * s}`, c, w: 6 },
    { d: ellipse(x - 10 * s, y, 14 * s, 10 * s), fill: c, c, w: 3 }, { d: ellipse(x + 24 * s, y - 12 * s, 14 * s, 10 * s), fill: c, c, w: 3 }];
  function star(x, y, r, fill = '#facc15') {
    let d = '';
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? ' L ' : 'M ') + r1(x + Math.cos(a) * rr) + ' ' + r1(y + Math.sin(a) * rr); }
    return { d: d + ' Z', fill, w: 5 };
  }
  const dust = (x, y, s = 1) => [cloud(x, y, 50 * s, 26 * s, '#e7e5e4', '#a8a29e'), cloud(x - 50 * s, y + 10, 34 * s, 18 * s, '#e7e5e4', '#a8a29e')];
  // cenário de savana do caderno
  function savanna(o = {}) {
    const x0 = o.x0 ?? 96, x1 = o.x1 ?? 1060;
    const out = [
      { d: `M ${x0} ${o.hy || 1080} Q ${x0 + (x1 - x0) * 0.2} ${(o.hy || 1080) - 80} ${x0 + (x1 - x0) * 0.42} ${(o.hy || 1080) - 10} Q ${x0 + (x1 - x0) * 0.62} ${(o.hy || 1080) - 110} ${x1} ${(o.hy || 1080) - 20}`, c: '#a3b18a', w: 5 },
      { d: `M ${x0} ${FL} L ${x1} ${FL} L ${x1} ${FL + 200} L ${x0} ${FL + 200} Z`, fill: '#e3ecc4', c: 'none', fo: 0.75 },
      { d: WB.roughLine(x0, FL, x1, FL, 2), w: 7 },
      { d: `M ${x0 + 70} ${FL + 60} L ${x0 + 240} ${FL + 60} M ${x0 + 420} ${FL + 110} L ${x0 + 620} ${FL + 110} M ${x0 + 700} ${FL + 50} L ${x1 - 40} ${FL + 50}`, c: '#a8a29e', w: 4 },
    ];
    for (let i = 0; i < 9; i++) { const gx = x0 + 40 + i * (x1 - x0 - 80) / 8; out.push({ d: `M ${r1(gx)} ${FL} l -8 -22 M ${r1(gx + 8)} ${FL} l 2 -28 M ${r1(gx + 16)} ${FL} l 10 -20`, c: '#65a30d', w: 4 }); }
    if (o.sun !== false) out.push(circ(o.sunX || 900, o.sunY || 640, 50, '#fde047', '#f59e0b', 5), { d: [0, 1, 2, 3, 4, 5, 6, 7].map(k => { const a = k * Math.PI / 4, sx = o.sunX || 900, sy = o.sunY || 640; return `M ${r1(sx + Math.cos(a) * 66)} ${r1(sy + Math.sin(a) * 66)} L ${r1(sx + Math.cos(a) * 88)} ${r1(sy + Math.sin(a) * 88)}`; }).join(' '), c: '#f59e0b', w: 5 });
    if (o.cloud !== false) out.push(cloud(o.cx || 300, o.cy || 600, 90, 40, '#ffffff', '#93c5fd'));
    if (o.tree) o.tree.forEach(([tx, ty, ts]) => out.push({ d: `M ${tx} ${ty} L ${tx} ${ty - 120 * ts}`, c: '#78350f', w: 12 * ts }, { d: WB.cloudPath(tx, ty - 150 * ts, 80 * ts, 46 * ts, 9), fill: '#86efac', w: 5 }));
    return out;
  }
  // relógio de cena: devolve true se o quadro é desta cena
  const beast = (SP) => makeBeast(cont, SP);
  const PY = (bt, specs, o = {}, dy = 150) => P(bt, specs, Object.assign({ parent: WB.mk('g', { transform: `translate(0 ${dy})` }, cont) }, o));
  const PA = (bt, specs, x, y, sc, o = {}) => P(bt, specs, Object.assign({ parent: WB.mk('g', { transform: `translate(${x} ${y}) scale(${sc})` }, cont) }, o));

  // ---------------- título + legenda (faixa amarela) ----------------
  const titleG = WB.mk('g', {}, WB.overlay);
  {
    const tw = WB.measure('O LEÃO e o VEADO', 84);
    WB.showNow(WB.textStrokes('O LEÃO', 540 - tw / 2, 200, 84, '#c2410c', titleG, 'start').strokes);
    WB.showNow(WB.textStrokes('e o', 540 - tw / 2 + WB.measure('O LEÃO ', 84), 200, 84, BK, titleG, 'start').strokes);
    WB.showNow(WB.textStrokes('VEADO', 540 + tw / 2, 200, 84, '#92400e', titleG, 'end').strokes);
    WB.showNow(WB.strokePath(WB.wavyLine(540 - tw / 2, 540 + tw / 2, 222, 6, 60), '#f59e0b', 6, titleG));
    WB.effect(t => titleG.setAttribute('opacity', t < CTA0 ? clamp(t / 0.3) : clamp(1 - (t - CTA0) / 0.3)));
  }
  const credit = WB.mk('g', {}, WB.overlay);
  WB.showNow(WB.textStrokes('animação original: @dalvarothi', 540, 1720, 40, '#78716c', credit, 'middle').strokes);
  WB.effect(t => credit.setAttribute('opacity', t < CTA0 ? 0.9 : 0));
  const capLayer = WB.mk('g', {}, WB.overlay);
  const CAPS = [
    [0.1, 'Dono de toda ciência,'], [4.3, 'sabedoria e poder...'], [7.4, ''],
    [9.6, 'Que é isso, Leãonardo?'], [10.55, 'Que que foi?'], [11.3, 'Como assim "o que foi", Leãonardo?'],
    [12.3, 'Passamos mais de trezentos dias'], [13.3, 'curtindo o cruzeiro aí junto,'], [14.3, 'tu espera só descer da arca'],
    [15.6, 'pra tu querer me comer!'], [16.6, 'Mas o combinado foi:'], [17.3, 'saiu da arca, é natureza.'], [18.3, 'Cada um por si.'],
    [19.0, 'Self service.'], [20.0, 'Ema, ema, ema...'], [20.6, 'cada um com seus problemas.'], [21.6, 'Vem com essa não!'],
    [22.3, 'Então é isso!'], [23.4, 'Meu amigo, eu estou com fome,'], [24.3, 'tô comendo salada há um tempão!'],
    [25.3, 'Não, tudo bem, eu te entendo.'], [26.3, 'ESPERA!!!'], [27.6, 'Podia pelo menos esperar'], [28.3, 'pra tu trocar uma ideia comigo'],
    [29.3, 'lá em casa.'], [29.65, 'Conhecer minha casa,'], [30.3, 'nóis comer um capim,'], [31.0, 'tomar um chá juntos.'],
    [32.0, 'Capim eu não prometo não,'], [32.65, 'mas chá eu quero!'], [33.3, 'Então bora, pô!'], [34.0, 'Pra que essa press...'],
    [34.6, 'Para!'], [35.6, 'Vamos lá.'], [36.4, ''],
    [39.65, 'E o repovoamento?'], [40.65, 'Vai começar hoje, seu safado?'], [41.65, 'Não...'], [42.3, 'a patroa não tá bem.'],
    [43.0, 'Tem que esperar a patroa.'], [44.0, 'Ela tá naqueles dias,'], [44.65, 'sabe como é que é,'], [45.0, 'vira uma leoa.'], [46.0, ''],
    [48.65, 'De que é o chá?'], [49.65, 'Oi?'], [50.5, 'O chá, é de quê?'], [51.65, 'É...'], [52.3, 'Mate Leão!'], [53.3, ''],
    [54.65, 'Vai comer veado agora...'], [55.6, 'TU E O DIABO!!!!'], [56.4, ''],
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
  // CENA 1 (0–6,0): descendo a rampa da Arca, cantando
  // =====================================================================
  const S1 = [[0, 6.0]];
  shot(S1);
  const RAMP = [430, 1300, 860, FL];
  const rampY = x => x < RAMP[0] ? RAMP[1] : (x < RAMP[2] ? RAMP[1] + (x - RAMP[0]) * (RAMP[3] - RAMP[1]) / (RAMP[2] - RAMP[0]) : FL);
  const rampA = Math.atan2(RAMP[3] - RAMP[1], RAMP[2] - RAMP[0]) / DEG;
  const slopeAt = x => rampA * clamp((x - RAMP[0] + 30) / 60) * clamp((RAMP[2] + 30 - x) / 60);
  put([
    savanna({ sunX: 880, sunY: 600, cx: 640, cy: 560, hy: 1100 }),
    // montanha (Ararat)
    { d: 'M 96 1120 L 260 760 L 330 860 L 420 700 L 600 1120 Z', fill: '#e7e5e4', c: '#a8a29e', w: 5 }, { d: 'M 395 740 L 420 700 L 446 760 L 425 748 Z', fill: '#ffffff', c: '#a8a29e', w: 4 },
    // casco da arca
    { d: 'M 60 1000 L 600 1000 Q 590 1250 470 1330 L 150 1330 Q 70 1250 60 1000 Z', fill: '#c08552', w: 8 },
    { d: 'M 70 1060 L 590 1060 M 80 1130 L 580 1130 M 100 1200 L 560 1200 M 130 1270 L 520 1270', c: '#8b5a2b', w: 4 },
    // cabine
    { d: 'M 150 1000 L 150 860 L 520 860 L 520 1000', fill: '#d6a46f', w: 7 }, { d: 'M 120 870 L 335 780 L 550 870 Z', fill: '#9a5b2c', w: 7 },
    box(200, 900, 60, 50, 6, '#fef3c7', null, 5), box(410, 900, 60, 50, 6, '#fef3c7', null, 5),
    // porta aberta
    { d: 'M 330 1170 L 430 1170 L 430 1300 L 330 1300 Z', fill: '#3f2a1c', w: 6 },
    // rampa
    { d: `M ${RAMP[0]} ${RAMP[1]} L ${RAMP[2]} ${RAMP[3]} L ${RAMP[2]} ${RAMP[3] + 18} L ${RAMP[0]} ${RAMP[1] + 18} Z`, fill: '#b07a45', w: 6 },
    { d: 'M 520 1328 l 0 18 M 610 1360 l 0 18 M 700 1391 l 0 18 M 790 1423 l 0 18', c: '#78350f', w: 4 },
    // placa
    box(100, 1080, 210, 64, 8, '#fffdf5', null, 5), T('ARCA DE NOÉ', 205, 1124, 36, '#7c2d12'),
    { d: 'M 360 1110 L 400 1110', c: INK.red, w: 6 }, { d: WB.arrowHead(400, 1110, 0, 18), c: INK.red, w: 6 },
    T('desembarque', 380, 1160, 28, INK.red),
  ]);
  // Noé acenando no convés
  const noahArm = dyn(cont, { 'stroke-width': 12, stroke: '#a16207' });
  put([{ d: 'M 270 860 L 262 760 L 318 760 L 310 860 Z', fill: '#fde68a', w: 5 }, circ(290, 730, 30, '#fde9d6', null, 5),
    { d: WB.cloudPath(290, 758, 28, 24, 8), fill: '#ffffff', w: 4 }, circ(280, 724, 3, '#111', 'none'), circ(300, 724, 3, '#111', 'none'),
    { d: 'M 262 712 Q 290 690 318 712', c: '#d6d3d1', w: 8 }]);
  const noahHand = WB.mk('circle', { r: 10, fill: '#fde9d6', stroke: BK, 'stroke-width': 4 }, cont);
  const rab1 = [makeRabbit(cont), makeRabbit(cont), makeRabbit(cont)];
  const d1 = beast(DEER), l1 = beast(LION);
  const D1X = K([[0, 380], [0.3, 380, 'l'], [5.6, 960, 'l'], [6.0, 985, 'o']]), D1o = odo(D1X, 0, 6.2);
  const L1X = K([[0, 380], [1.5, 380], [6.0, 820, 'l']]), L1o = odo(L1X, 0, 6.2);
  const RBX = [2.6, 3.1, 3.6].map(t0 => K([[t0, 380], [t0 + 3.4, 1000, 'l']]));
  WB.effect(t => {
    if (!inWin(S1, t)) return;
    const a = Math.sin(t * 9) * 0.6;
    const hx = 330 + Math.cos(-0.9 + a) * 60, hy = 790 + Math.sin(-0.9 + a) * 60;
    noahArm.setAttribute('d', `M 310 790 L ${r1(hx)} ${r1(hy)}`); noahHand.setAttribute('cx', r1(hx)); noahHand.setAttribute('cy', r1(hy));
    RBX.forEach((X, i) => { const x = X(t); rab1[i](t, x, rampY(x), 0.55, 1, 380, t > 2.6 + i * 0.5 ? 1 : 0); });
    for (const [rg, X, o, seed, ss] of [[d1, D1X, D1o, 0.2, 0.78], [l1, L1X, L1o, 1.3, 0.82]]) {
      const x = X(t), sl = slopeAt(x);
      rg.update(t, Object.assign({ x, y: rampY(x), s: ss, f: 1, sp: sl, slope: sl, mood: MOODS.sing, op: talk(SING, t) * 0.9,
        headRot: Math.sin(t * 3.2 + seed) * 9, seed, earFlap: 0.3 }, o(t)));
    }
    l1.g.setAttribute('opacity', clamp((t - 1.45) / 0.15));
  });
  P(0.4, [...noteSym(520, 1000), ...noteSym(640, 940, 0.8, '#db2777')], { loop: 'rise', until: 2.6 });
  P(2.4, [...noteSym(700, 1040, 0.9), ...noteSym(820, 980, 0.7, '#2563eb')], { loop: 'rise', until: 4.6 });
  P(4.2, [...noteSym(860, 1040, 0.9, '#db2777'), ...noteSym(960, 990, 0.7)], { loop: 'rise', until: 6.0 });

  // =====================================================================
  // CENA 2 (6,0–9,55): andando juntos... e o leão morde a pata do veado
  // =====================================================================
  const S2 = [[6.0, 9.55]];
  const s2root = shot(S2);
  // grupo com zoom próprio: a câmera dá um "punch-in" na mordida e depois volta
  const zoom2 = WB.mk('g', {}, s2root);
  cont = zoom2;
  put(savanna({ sunX: 230, sunY: 620, cx: 760, cy: 600, tree: [[960, 1180, 0.8]] }));
  const rab2 = [makeRabbit(cont), makeRabbit(cont)];
  const d2 = beast(DEER), l2 = beast(LION);
  // cópia da canela do veado por cima do leão: a pata aparece atravessando a boca dele
  const legOv = WB.mk('g', { opacity: 0 }, cont);
  const legOvO = dyn(legOv, { 'stroke-width': DEER.legW + 11 }), legOvI = dyn(legOv, { stroke: DEER.legCol, 'stroke-width': DEER.legW });
  const hoofOv = WB.mk('path', { d: '', fill: '#3f2a1c', stroke: BK, 'stroke-width': 5 }, legOv);
  const fangs = WB.mk('g', { opacity: 0 }, cont);
  const fangUp = WB.mk('path', { d: '', fill: '#ffffff', stroke: BK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, fangs);
  const fangDn = WB.mk('path', { d: '', fill: '#ffffff', stroke: BK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, fangs);
  const lipUp = dyn(fangs, { 'stroke-width': 7 }), lipDn = dyn(fangs, { 'stroke-width': 7 });
  const D2X = K([[6.0, 420], [7.3, 680, 'l'], [7.45, 690, 'o']]), D2o = odo(D2X, 6.0, 9.6);
  const L2X = K([[6.0, 120], [7.0, 330, 'l'], [7.3, 360, 'o']]), L2o = odo(L2X, 6.0, 9.6);
  const D2M = moodTrack(MOODS, [[6.0, 'sing'], [7.5, 'shock'], [8.0, 'pain']]);
  const L2M = moodTrack(MOODS, [[6.0, 'sing'], [7.0, 'greedy'], [7.38, 'calm']]);
  const LUNGE = K([[7.3, 0], [7.45, 1, 'o']]);
  const ZOOM = K([[7.42, 1], [7.55, 1.9, 'b'], [8.85, 1.9], [9.25, 1.1, 'io']]);
  const R2X = [K([[6.0, 760], [7.4, 1000, 'l'], [8.2, 1250, 'l']]), K([[6.0, 600], [7.4, 820, 'l'], [8.4, 1250, 'l']])];
  let BP = [600, 1380];
  WB.effect(t => {
    if (!inWin(S2, t)) return;
    R2X.forEach((X, i) => rab2[i](t, X(t), 1330 + i * 30, 0.5, 1, 0, 1));
    const bitten = t > 7.45;
    const jit = bitten && t < 8.9 ? Math.sin(t * 40) * 3 : 0;
    const stD = Object.assign({ x: D2X(t) + jit, y: FL, s: DS, f: 1, mood: D2M(t), op: t < 7.45 ? talk(SING, t) * 0.9 : (t > 8.9 ? 0.5 + 0.3 * Math.sin(t * 20) : 0),
      headRot: t < 7.45 ? Math.sin(t * 3.2) * 9 : -12 + jit, seed: 0.2, earFlap: bitten ? 1.4 : 0.3, sp: bitten ? -10 : 0,
      hop: bitten ? 14 * bump(t, 7.45, 7.7) : 0, neckRot: bitten ? 12 : 0 }, D2o(t));
    d2.update(t, stD);
    // ponto da mordida: no meio da canela da pata de trás do veado
    const k = d2.hindKneeW, e = d2.hindW;
    const bp = [lerp(k[0], e[0], 0.62), lerp(k[1], e[1], 0.62)];
    const lu = LUNGE(t);
    const chew = t > 7.5 && t < 8.9 ? Math.sin(t * 16) * 6 : 0;
    const eyeing = t > 7.0 && t < 7.3;
    const stL = Object.assign({ x: L2X(t), y: FL, s: LS, f: 1, mood: L2M(t), op: t < 7.0 ? talk(SING, t) * 0.9 : (lu > 0.5 ? 0.55 : 0),
      headRot: t < 7.0 ? Math.sin(t * 3.2 + 1) * 9 : 6 * lu + chew, seed: 1.3, sp: 12 * lu, neckRot: 60 * lu,
      look: eyeing ? 9 : 0, lookY: eyeing ? 9 : 0, tongue: eyeing ? 0.6 + 0.4 * Math.sin(t * 14) : 0, drool: eyeing ? 1 : 0 }, L2o(t));
    // duas passadas: mede onde fica a boca e desloca o leão até ela encostar na pata
    l2.update(t, stL);
    if (lu > 0) {
      stL.x += (bp[0] - l2.mouthW[0]) * lu;
      l2.update(t, stL);
    }
    BP = bp;
    const on = bitten && t < 8.95;
    fangs.setAttribute('opacity', on ? 1 : 0);
    legOv.setAttribute('opacity', lu > 0.3 ? 1 : 0);
    if (lu > 0.3) {
      const ld = `M ${r1(k[0])} ${r1(k[1])} L ${r1(e[0])} ${r1(e[1])}`;
      legOvO.setAttribute('d', ld); legOvI.setAttribute('d', ld);
      hoofOv.setAttribute('d', `M ${r1(e[0] - 11)} ${r1(e[1] - 10)} L ${r1(e[0] + 11)} ${r1(e[1] - 10)} L ${r1(e[0] + 14)} ${r1(e[1] + 4)} L ${r1(e[0] - 12)} ${r1(e[1] + 4)} Z`);
    }
    if (on) {
      const m = l2.mouthW, cx = bp[0], cy = Math.min(Math.max(m[1], k[1] + 10), e[1] - 10);
      const gap = 20 + Math.abs(chew) * 1.2;
      const row = (y, dir) => [-28, -9, 10].map(dx => `M ${r1(cx + dx)} ${r1(y)} l 9 ${r1(dir * 20)} l 9 ${r1(-dir * 20)} Z`).join(' ');
      fangUp.setAttribute('d', row(cy - gap, 1)); fangDn.setAttribute('d', row(cy + gap, -1));
      lipUp.setAttribute('d', `M ${r1(cx - 40)} ${r1(cy - gap)} Q ${r1(cx)} ${r1(cy - gap - 8)} ${r1(cx + 40)} ${r1(cy - gap)}`);
      lipDn.setAttribute('d', `M ${r1(cx - 40)} ${r1(cy + gap)} Q ${r1(cx)} ${r1(cy + gap + 8)} ${r1(cx + 40)} ${r1(cy + gap)}`);
    }
    // câmera: zoom em volta da mordida
    const z = ZOOM(t), fx = lerp(540, BP[0] - 40, clamp((z - 1) / 0.9)), fy = lerp(1200, BP[1] - 30, clamp((z - 1) / 0.9));
    const shake = t > 7.45 && t < 7.75 ? Math.sin(t * 90) * 8 * (1 - (t - 7.45) / 0.3) : 0;
    zoom2.setAttribute('transform', `translate(${r1(540 + shake)} 1200) scale(${z.toFixed(3)}) translate(${r1(-fx)} ${r1(-fy)})`);
  });
  cont = s2root;
  TX(7.05, 'hmm...', 300, 900, 64, '#b45309', -6, { loop: 'wiggle', until: 7.3 });
  P(7.46, [burst(330, 760, 120, '#fef08a'), T('NHAC!', 330, 790, 92, INK.red)], { anim: 'slam', until: 8.3 });
  TX(8.32, 'chomp chomp', 330, 820, 72, '#7c2d12', 4, { loop: 'wiggle', until: 8.9 });
  TX(8.95, 'AAAI!', 760, 820, 110, INK.red, 8, { anim: 'slam', loop: 'shake', until: 9.55 });

  // =====================================================================
  // CENA 3 (9,55–16,6): "Que é isso, Leãonardo?" — a bronca (com balão do cruzeiro)
  // =====================================================================
  const S3 = [[9.55, 16.6]];
  shot(S3);
  put(savanna({ sunX: 920, sunY: 600, cx: 260, cy: 620, tree: [[150, 1200, 0.7]] }));
  const d3 = beast(DEER), l3 = beast(LION);
  const D3X = K([[9.55, 420], [9.95, 240, 'o'], [15.4, 240], [16.0, 330, 'io']]), D3o = odo(D3X, 9.5, 16.7);
  const D3M = moodTrack(MOODS, [[9.55, 'shock'], [10.5, 'annoyed'], [11.3, 'angry'], [12.4, 'smile'], [14.3, 'angry'], [15.6, 'angry']]);
  const L3M = moodTrack(MOODS, [[9.55, 'calm'], [9.9, 'innocent'], [11.4, 'sheepish'], [12.5, 'smile'], [14.3, 'sheepish'], [15.6, 'innocent']]);
  const D3arm = K([[9.55, 0], [11.4, 0], [11.6, 1], [12.25, 1], [12.45, 0], [14.3, 0], [14.5, 1], [15.35, 1], [15.5, 0], [15.95, 0], [16.15, 1]]);
  WB.effect(t => {
    if (!inWin(S3, t)) return;
    const am = D3arm(t);
    const stomp = bump(t, 15.6, 15.85) + bump(t, 15.95, 16.2);
    d3.update(t, Object.assign({ x: D3X(t), y: FL, s: DS, f: 1, mood: D3M(t), op: talk(D_WIN, t), seed: 0.2, bandage: t > 9.8,
      hop: bump(t, 9.55, 9.95) * 90 + stomp * 20, arm: am, armRel: true, A1: [100 + Math.sin(t * 7) * 18, -30 + Math.cos(t * 7) * 14], sp: -14 * am,
      headRot: (t > 12.4 && t < 14.3 ? -12 : 4) + Math.sin(t * 6) * 3 * talk(D_WIN, t), earFlap: 0.4 + am * 0.6 }, D3o(t)));
    l3.update(t, { x: 800, y: FL, s: LS, f: -1, mood: L3M(t), op: talk(L_WIN, t), seed: 1.3, drool: t > 9.6 && t < 11.6 ? 1 : 0,
      headRot: t > 10.4 && t < 11.4 ? 14 : (t > 14.3 ? -8 : 0), look: t > 14.3 && t < 15.6 ? 8 : 0, wag: 1.4, lookY: t > 10.4 && t < 11.4 ? -6 : 0 });
  });
  TX(9.7, '?!', 520, 900, 110, INK.red, -6, { anim: 'slam', until: 10.5 });
  TX(10.6, '?', 820, 860, 110, '#2563eb', 8, { loop: 'wiggle', until: 11.3 });
  // balão: o cruzeiro da arca
  PY(12.3, [...thought(560, 660, 330, 190, [[420, 960, 16], [460, 900, 26]]),
    { d: 'M 300 690 L 820 690 Q 800 780 740 800 L 380 800 Q 320 780 300 690 Z', fill: '#c08552', w: 6 },
    { d: 'M 260 820 q 30 -16 60 0 q 30 16 60 0 q 30 -16 60 0 q 30 16 60 0 q 30 -16 60 0 q 30 16 60 0 q 30 -16 60 0 q 30 16 60 0 q 30 -16 60 0 q 30 16 60 0', c: '#3b82f6', w: 5 },
    { d: 'M 400 690 L 430 640 L 480 640 M 600 690 L 630 640 L 680 640', c: '#2563eb', w: 7 },
    circ(450, 610, 22, '#f0c987', null, 4), { d: WB.cloudPath(450, 610, 32, 30, 9), fill: MANE, w: 4 }, circ(450, 612, 18, '#f0c987', null, 3),
    circ(650, 610, 20, '#a8673d', null, 4), { d: 'M 640 590 l -6 -24 M 660 590 l 6 -24', c: '#78716c', w: 5 },
    circ(780, 560, 30, '#fde047', '#f59e0b', 4), { d: 'M 500 600 l 40 -6 M 600 600 l -40 -6', c: '#111', w: 6 },
    T('300 DIAS', 560, 760, 52, '#ffffff')], { until: 14.3 });
  stamp(15.65, 'ME COMER?!', 560, 760, 70, INK.red, -5, { until: 16.6 });

  // =====================================================================
  // CENA 4 (16,6–21,5): "o combinado foi..." — cada um por si / self service / ema, ema, ema
  // =====================================================================
  const S4 = [[16.6, 21.5]];
  shot(S4);
  put(savanna({ sunX: 900, sunY: 620, cx: 360, cy: 610, hy: 1120 }));
  const ost = makeOstrich(cont);
  const d4 = beast(DEER), l4 = beast(LION);
  const knifeH = holder(knife(), cont), forkH = holder(fork(), cont);
  const L4X = K([[16.6, 470], [18.1, 740, 'io'], [18.4, 740], [19.1, 620, 'io']]), L4o = odo(L4X, 16.5, 21.6);
  const L4sp = K([[16.6, 0], [19.05, 0], [19.4, -74, 'b'], [21.2, -74], [21.5, -30]]);
  const L4M = moodTrack(MOODS, [[16.6, 'proud'], [18.3, 'smug'], [19.0, 'greedy'], [20.0, 'greedy'], [20.6, 'smug']]);
  const O4X = K([[19.85, 1300], [21.4, -260, 'l']]), O4o = odo(O4X, 19.8, 21.6);
  WB.effect(t => {
    if (!inWin(S4, t)) return;
    ost(t, O4X(t), 1340, 0.75, -1, O4o);
    const tr = Math.sin(t * 45) * 3;
    d4.update(t, { x: 230 + tr, y: FL, s: DS, f: 1, mood: MOODS.scared, op: talk(D_WIN, t), seed: 0.2, bandage: true, earDown: 1, headRot: -6 + tr, neckRot: 14 });
    const f = t < 18.25 ? 1 : -1;
    const shrug = clamp((t - 20.6) / 0.25) * (t < 21.4 ? 1 : 0);
    const chase = t > 20.0 && t < 20.6;
    l4.update(t, Object.assign({ x: L4X(t), y: FL, s: LS, f, sp: L4sp(t), mood: L4M(t), op: talk(L_WIN, t), seed: 1.3,
      arm: t > 19.1 ? 1 : 0, armB: t > 19.1 ? 1 : 0, armRel: true,
      A1: shrug ? [120, -10 - shrug * 40] : [70 + Math.sin(t * 5) * 10, -40 + Math.sin(t * 9) * 10],
      A2: shrug ? [-80, -20 - shrug * 30] : [90, 40],
      headRot: chase ? -14 : (shrug ? Math.sin(t * 8) * 6 : 0), look: chase ? 10 : 0, tongue: chase ? 0.5 + 0.5 * Math.sin(t * 10) : 0, wag: 1.2 }, L4o(t)));
    const on = t > 19.15 ? 1 : 0;
    knifeH(l4.armW[0], l4.armW[1], f > 0 ? -70 : -110, 1, on);
    forkH(l4.armBW[0], l4.armBW[1], f > 0 ? -60 : -120, 1, on);
  });
  TX(17.25, 'SAIU DA ARCA', 600, 770, 72, '#7c2d12', -4, { until: 18.3 });
  TX(17.75, '= NATUREZA', 640, 860, 72, '#15803d', -4, { until: 18.3 });
  stamp(18.3, 'CADA UM POR SI', 560, 760, 72, INK.red, -5, { until: 19.0 });
  stamp(19.05, 'SELF SERVICE', 600, 740, 80, '#15803d', 4, { until: 20.0 });
  P(20.0, [...noteSym(760, 760, 0.9), ...noteSym(880, 700, 0.7, '#db2777'), T('ema, ema, ema', 560, 690, 64, '#7c3aed')], { loop: 'float', until: 21.5 });

  // =====================================================================
  // CENA 5 (21,5–23,45): o leão já acendendo a churrasqueira
  // =====================================================================
  const S5 = [[21.5, 23.45]];
  shot(S5);
  put(savanna({ sunX: 230, sunY: 620, cx: 640, cy: 590 }));
  const grillH = holder(grill(), cont);
  grillH(600, 1220);
  const coals = WB.mk('g', {}, cont);
  const coalP = dyn(coals, { 'stroke-width': 0, fill: '#1c1917' });
  const d5 = beast(DEER), l5 = beast(LION);
  const bagH = holder(coalBag(), cont);
  const D5X = K([[21.5, -160], [22.05, 290, 'o']]), D5o = odo(D5X, 21.4, 23.5);
  WB.effect(t => {
    if (!inWin(S5, t)) return;
    const running = t < 22.0 ? 1 : 0;
    d5.update(t, Object.assign({ x: D5X(t), y: FL, s: DS, f: 1, mood: t < 22.3 ? MOODS.shock : MOODS.angry, op: talk(D_WIN, t), seed: 0.2, bandage: true,
      run: running, sp: bump(t, 22.0, 22.3) * -12, hop: bump(t, 22.45, 22.65) * 26 + bump(t, 22.7, 22.9) * 20, earFlap: 0.8,
      arm: t > 22.35 ? 1 : 0, armRel: true, A1: [110, -40 + Math.sin(t * 9) * 16] }, D5o(t)));
    const caught = t > 22.2;
    l5.update(t, { x: 800, y: FL, s: LS, f: -1, sp: -74, mood: caught ? MOODS.innocent : MOODS.smug, op: talk(L_WIN, t), seed: 1.3,
      arm: 1, armB: 1, armRel: true, A1: [150, 10], A2: [130, 60], headRot: caught ? 12 : -8, look: caught ? 8 : -4, wag: 1.5 });
    const mx = (l5.armW[0] + l5.armBW[0]) / 2, my = (l5.armW[1] + l5.armBW[1]) / 2;
    bagH(mx - 10, my - 20, -118 + Math.sin(t * 6) * 6, 1, 1);
    // carvão caindo do saco na grelha
    let d = '';
    for (let i = 0; i < 6; i++) {
      const u = ((t * 1.6 + i / 6) % 1), x = lerp(mx - 70, 580 + (i % 3) * 20, u), y = lerp(my - 40, 1210, u * u);
      d += ellipse(r1(x), r1(y), 10, 8) + ' ';
    }
    coalP.setAttribute('d', d);
  });
  P(21.55, [speedLines(160, 1300, 240)], { until: 22.1 });
  P(22.0, [dust(380, 1420, 1)], { until: 22.6 });
  stamp(22.35, 'ENTÃO É ISSO?!', 480, 800, 68, INK.red, -5, { until: 23.45 });

  // =====================================================================
  // CENA 6 (23,45–25,35): o leão magrelo chorando com o prato de salada (anda em pé)
  // =====================================================================
  const S6 = [[23.45, 25.35]];
  shot(S6);
  put(savanna({ sunX: 900, sunY: 620, cx: 330, cy: 600 }));
  const d6 = beast(DEER), l6 = beast(LION);
  const saladH = holder(salad(), cont);
  const L6X = K([[23.45, 820], [25.35, 600, 'l']]), L6o = odo(L6X, 23.4, 25.4);
  const tearS = WB.mk('g', {}, cont);
  const tsL = dyn(tearS, { stroke: '#60a5fa', 'stroke-width': 12, 'stroke-dasharray': '16 12' }), tsR = dyn(tearS, { stroke: '#60a5fa', 'stroke-width': 12, 'stroke-dasharray': '16 12' });
  WB.effect(t => {
    if (!inWin(S6, t)) return;
    d6.update(t, { x: 240, y: FL, s: DS, f: 1, mood: MOODS.sad, op: talk(D_WIN, t), seed: 0.2, bandage: true, headRot: 8 });
    l6.update(t, Object.assign({ x: L6X(t), y: FL, s: LS, f: -1, sp: -74, mood: MOODS.cry, op: talk(L_WIN, t), seed: 1.3, ribs: 1,
      arm: 1, armB: 1, armRel: true, A1: [120, 70], A2: [100, 100], headRot: Math.sin(t * 7) * 5, wag: 0.4 }, L6o(t)));
    const p = l6.armW;
    saladH(p[0] - 10, p[1] - 10, Math.sin(t * 5) * 4, 1, 1);
    const h = l6.headW;
    tsL.setAttribute('d', `M ${r1(h[0] - 26)} ${r1(h[1])} Q ${r1(h[0] - 120)} ${r1(h[1] - 50)} ${r1(h[0] - 160)} ${r1(h[1] + 80)}`);
    tsR.setAttribute('d', `M ${r1(h[0] + 26)} ${r1(h[1])} Q ${r1(h[0] + 120)} ${r1(h[1] - 50)} ${r1(h[0] + 160)} ${r1(h[1] + 80)}`);
    tsL.setAttribute('stroke-dashoffset', r1(-t * 160)); tsR.setAttribute('stroke-dashoffset', r1(-t * 160));
  });
  TX(24.3, 'SÓ SALADA...', 560, 760, 76, '#15803d', -4, { loop: 'wiggle', until: 25.35 });

  // =====================================================================
  // CENA 7 (25,35–27,45): "eu te entendo"... ESPERA!!! — perseguição
  // =====================================================================
  const S7 = [[25.35, 27.45]];
  shot(S7);
  put(savanna({ sunX: 230, sunY: 620, cx: 720, cy: 600, tree: [[980, 1200, 0.7]] }));
  const d7 = beast(DEER), l7 = beast(LION);
  const D7X = K([[25.35, 700], [26.25, 790, 'io'], [26.4, 790], [27.4, 1450, 'i']]), D7o = odo(D7X, 25.3, 27.5);
  const L7X = K([[25.35, 230], [26.3, 230], [26.48, 200, 'o'], [27.45, 1250, 'i']]), L7o = odo(L7X, 25.3, 27.5);
  WB.effect(t => {
    if (!inWin(S7, t)) return;
    const flee = t > 26.35;
    d7.update(t, Object.assign({ x: D7X(t), y: FL, s: DS, f: flee ? 1 : -1, mood: flee ? MOODS.scared : MOODS.sheepish, op: talk(D_WIN, t), seed: 0.2, bandage: true,
      run: flee ? 1 : 0, arm: !flee && t < 26.2 ? 1 : 0, armRel: true, A1: [100, -60 + Math.sin(t * 10) * 20], sp: flee ? 0 : -10, earFlap: flee ? 1.2 : 0.3 }, D7o(t)));
    const crouch = bump(t, 25.95, 26.5);
    const chasing = t > 26.45;
    l7.update(t, Object.assign({ x: L7X(t), y: FL, s: LS, f: 1, mood: t < 25.95 ? MOODS.sad : MOODS.greedy, op: talk(L_WIN, t), seed: 1.3,
      run: chasing ? 1 : 0, sp: 12 * crouch, tongue: chasing ? 0.8 : 0, drool: chasing ? 1 : 0, wag: 2 }, L7o(t)));
  });
  stamp(26.3, 'ESPERA!!!', 560, 760, 90, INK.red, -6, { until: 27.45 });
  P(26.6, [speedLines(420, 1250, 260)], { until: 27.45 });

  // =====================================================================
  // CENA 8 (27,45–31,95): o veado para e convida pra casa (balão: capim e chá)
  // =====================================================================
  const S8 = [[27.45, 31.95]];
  shot(S8);
  put([savanna({ sunX: 900, sunY: 600, cx: 300, cy: 600, tree: [[180, 1180, 0.75]] }),
    { d: 'M 860 1450 Q 840 1300 940 1290 Q 1060 1300 1050 1450 Z', fill: '#d6d3d1', w: 6 }, { d: 'M 900 1350 q 30 -20 60 0', c: '#a8a29e', w: 4 }]);
  const d8 = beast(DEER), l8 = beast(LION);
  const D8X = K([[27.45, -160], [28.2, 800, 'o']]), D8o = odo(D8X, 27.4, 32);
  const L8X = K([[27.45, -600], [28.55, -600], [29.25, 230, 'o']]), L8o = odo(L8X, 27.4, 32);
  const D8M = moodTrack(MOODS, [[27.45, 'scared'], [28.2, 'panting'], [28.55, 'sheepish'], [29.3, 'smile'], [30.3, 'happy'], [31.0, 'smile']]);
  const L8M = moodTrack(MOODS, [[27.45, 'greedy'], [29.3, 'neutral'], [30.3, 'annoyed'], [31.0, 'greedy']]);
  WB.effect(t => {
    if (!inWin(S8, t)) return;
    const turned = t > 28.3;
    const talking = t > 29.3;
    d8.update(t, Object.assign({ x: D8X(t), y: FL, s: DS, f: turned ? -1 : 1, mood: D8M(t), op: talk(D_WIN, t), seed: 0.2, bandage: true,
      run: t < 28.2 ? 1 : 0, arm: talking ? 1 : 0, armRel: true, A1: [90 + Math.sin(t * 5) * 14, -70 + Math.cos(t * 5) * 18], sp: talking ? -8 : 0,
      headRot: t > 28.2 && t < 28.6 ? Math.sin(t * 30) * 3 : 0, earFlap: 0.4 }, D8o(t)));
    l8.update(t, Object.assign({ x: L8X(t), y: FL, s: LS, f: 1, mood: L8M(t), op: talk(L_WIN, t), seed: 1.3,
      run: t < 29.25 ? 1 : 0, tongue: t > 31.0 ? 0.4 + 0.4 * Math.sin(t * 9) : 0, wag: t > 31 ? 2.5 : 1, headRot: t > 30.3 && t < 31 ? -10 : 0 }, L8o(t)));
  });
  P(28.2, [dust(640, 1420, 0.9)], { until: 28.7 });
  P(29.25, [dust(260, 1420, 0.9)], { until: 29.8 });
  PY(29.35, [...thought(560, 660, 300, 190, [[700, 960, 16], [660, 900, 26]]),
    { d: 'M 340 760 L 340 660 L 460 660 L 460 760 Z', fill: '#e7c9a0', w: 5 }, { d: 'M 310 670 L 400 590 L 490 670 Z', fill: '#d4a24c', w: 5 },
    { d: 'M 320 650 l 20 -10 M 360 620 l 20 -10 M 420 620 l 20 10 M 450 650 l 20 10', c: '#92400e', w: 3 }, box(380, 700, 40, 60, 4, '#7c4524', null, 4),
    { d: 'M 520 770 l -8 -40 M 540 770 l 0 -48 M 560 770 l 8 -40 M 580 770 l 14 -36', c: '#16a34a', w: 6 }], { until: 30.95 });
  PY(30.95, [...thought(560, 660, 300, 190, [[700, 960, 16], [660, 900, 26]]), T('chá?', 700, 640, 64, '#b45309')], { until: 31.95 });
  PA(30.95, [...teapot(), heart(110, -60, 0.6)], 470, 870, 1.1, { until: 31.95 });

  // =====================================================================
  // CENA 9 (31,95–36,3): "capim não, mas chá eu quero!" — então bora / para! / vamos lá
  // =====================================================================
  const S9 = [[31.95, 36.3]];
  shot(S9);
  put(savanna({ sunX: 230, sunY: 620, cx: 720, cy: 600 }));
  const d9 = beast(DEER), l9 = beast(LION);
  const L9X = K([[31.95, 250], [33.6, 250], [34.35, 530, 'io'], [34.55, 530], [34.85, 400, 'o'], [35.3, 400], [36.3, 880, 'i']]), L9o = odo(L9X, 31.9, 36.4);
  const D9X = K([[31.95, 760], [33.4, 760], [34.1, 800, 'io'], [35.3, 800], [36.3, 1360, 'i']]), D9o = odo(D9X, 31.9, 36.4);
  const L9M = moodTrack(MOODS, [[31.95, 'annoyed'], [32.65, 'greedy'], [33.3, 'happy'], [33.7, 'greedy'], [34.55, 'shock'], [35.0, 'sheepish'], [35.6, 'smug']]);
  const D9M = moodTrack(MOODS, [[31.95, 'smile'], [33.3, 'happy'], [34.0, 'annoyed'], [34.55, 'angry'], [35.6, 'smile']]);
  WB.effect(t => {
    if (!inWin(S9, t)) return;
    const f = t < 33.35 ? -1 : (t < 34.5 ? 1 : (t < 35.3 ? -1 : 1));
    const kick = bump(t, 34.5, 34.85);
    d9.update(t, Object.assign({ x: D9X(t), y: FL, s: DS, f, mood: D9M(t), op: talk(D_WIN, t), seed: 0.2, bandage: true,
      arm: t > 34.5 && t < 35.4 ? 1 : 0, armRel: true, A1: [110 + kick * 50, 10 - kick * 30], sp: -10 * kick, earFlap: 0.5 }, D9o(t)));
    const no = t < 32.6 ? Math.sin(t * 16) * 14 : 0;
    const sniff = t > 34.0 && t < 34.55;
    l9.update(t, Object.assign({ x: L9X(t), y: FL, s: LS, f: 1, mood: L9M(t), op: talk(L_WIN, t), seed: 1.3, headRot: no + (sniff ? 16 : 0),
      neckRot: sniff ? 30 : 0, sp: sniff ? 8 : 0, tongue: (t > 32.65 && t < 33.3) || sniff ? 0.5 + 0.5 * Math.sin(t * 11) : 0, drool: sniff ? 1 : 0, wag: 2,
      hop: bump(t, 34.55, 34.85) * 30 }, L9o(t)));
  });
  TX(32.0, 'capim? NÃO', 380, 820, 64, '#15803d', -4, { until: 32.65 });
  PA(32.65, [...teapot(), heart(110, -60, 0.7)], 600, 800, 1.0, { loop: 'pulse', until: 33.3 });
  TX(34.05, 'snif snif', 760, 900, 60, '#65a30d', 6, { loop: 'wiggle', until: 34.55 });
  stamp(34.6, 'PARA!', 720, 780, 84, INK.red, -6, { until: 35.6 });

  // =====================================================================
  // CENA 10 (36,3–38,6): a caminhada até a casa do veado (câmera acompanha, fundo em paralaxe)
  // =====================================================================
  const S10 = [[36.3, 38.6]];
  shot(S10);
  const CAM = K([[36.3, 0], [38.6, 780, 'io']]);
  const farG = WB.mk('g', {}, cont), worldG = WB.mk('g', {}, cont);
  cont = farG;
  put([{ d: 'M 0 1120 Q 300 980 600 1100 Q 900 960 1300 1090 Q 1600 990 2000 1100', c: '#a3b18a', w: 5 }, cloud(500, 600, 100, 40, '#ffffff', '#93c5fd'), cloud(1300, 560, 80, 34, '#ffffff', '#93c5fd'),
    circ(1250, 650, 50, '#fde047', '#f59e0b', 5)]);
  cont = worldG;
  put([{ d: `M -200 ${FL} L 2400 ${FL} L 2400 ${FL + 200} L -200 ${FL + 200} Z`, fill: '#e3ecc4', c: 'none', fo: 0.75 }, { d: WB.roughLine(-200, FL, 2400, FL, 2), w: 7 },
    ...[200, 520, 900, 1250, 1500].map(x => ({ d: `M ${x} ${FL} l -8 -24 M ${x + 8} ${FL} l 2 -30 M ${x + 16} ${FL} l 10 -22`, c: '#65a30d', w: 4 })),
    { d: 'M 700 1450 L 700 1300', c: '#78350f', w: 12 }, { d: WB.cloudPath(700, 1260, 80, 48, 9), fill: '#86efac', w: 5 },
    // a casa (cabana de palha)
    { d: 'M 1640 1450 L 1640 1230 L 1920 1230 L 1920 1450 Z', fill: '#e7c9a0', w: 7 }, { d: 'M 1590 1250 L 1780 1080 L 1970 1250 Z', fill: '#d4a24c', w: 7 },
    { d: 'M 1620 1220 l 30 -16 M 1690 1170 l 30 -16 M 1820 1160 l 30 16 M 1890 1210 l 30 16', c: '#92400e', w: 4 }, box(1740, 1320, 80, 130, 6, '#7c4524', null, 6),
    box(1660, 1270, 56, 46, 4, '#fef3c7', null, 4), T('casa do veado', 1780, 1050, 44, '#92400e')]);
  const l10 = makeBeast(worldG, LION), d10 = makeBeast(worldG, DEER);
  const D10X = K([[36.3, 300], [38.5, 1560, 'io']]), D10o = odo(D10X, 36.2, 38.7);
  const L10X = K([[36.3, 20], [38.5, 1300, 'io']]), L10o = odo(L10X, 36.2, 38.7);
  WB.effect(t => {
    if (!inWin(S10, t)) return;
    const cx = CAM(t);
    farG.setAttribute('transform', `translate(${r1(-cx * 0.35)} 0)`);
    worldG.setAttribute('transform', `translate(${r1(-cx)} 0)`);
    d10.update(t, Object.assign({ x: D10X(t), y: FL, s: 0.85, f: 1, mood: MOODS.happy, op: 0, seed: 0.2, bandage: true, run: 0.7, earFlap: 0.6 }, D10o(t)));
    l10.update(t, Object.assign({ x: L10X(t), y: FL, s: 0.92, f: 1, mood: MOODS.greedy, op: 0, seed: 1.3, run: 0.7, tongue: 0.6 + 0.3 * Math.sin(t * 9), wag: 2 }, L10o(t)));
  });
  P(36.6, [...noteSym(400, 900, 0.8)], { loop: 'rise', until: 38.6 });

  // =====================================================================
  // CENA 11 (38,6–53,5): na cabana, o chá. Repovoamento, a patroa leoa, o chá de quê? MATE LEÃO.
  // =====================================================================
  const S11 = [[38.6, 53.5]];
  shot(S11);
  put([
    { d: 'M 96 1450 L 1060 1450 L 1060 1650 L 96 1650 Z', fill: '#efdcb8', c: 'none', fo: 0.8 },
    { d: WB.roughLine(96, FL, 1060, FL, 2), w: 7 },
    // paredes de bambu e janela
    { d: 'M 120 640 L 120 1450 M 1040 640 L 1040 1450 M 120 640 L 1040 640', c: '#92400e', w: 9 },
    { d: 'M 200 660 L 200 1440 M 280 660 L 280 1440 M 880 660 L 880 1440 M 960 660 L 960 1440', c: '#d6b88a', w: 6 },
    { d: 'M 420 700 L 700 700 L 700 900 L 420 900 Z', fill: '#e0f2fe', w: 6 }, { d: 'M 560 700 L 560 900 M 420 800 L 700 800', w: 5 },
    { d: 'M 440 880 Q 500 830 560 870 Q 620 830 690 880', c: '#86efac', w: 5 },
    // prateleira com a caixa de MATE escondida
    { d: 'M 760 980 L 1000 980', c: '#7c4524', w: 10 }, box(800, 900, 70, 80, 6, '#facc15', null, 5), T('MATE', 835, 950, 24, '#15803d'),
    circ(930, 950, 26, '#fca5a5', null, 4),
    // telhado de palha (borda)
    { d: 'M 96 640 L 1060 640 L 1060 600 L 96 600 Z', fill: '#d4a24c', w: 6 }, { d: 'M 140 600 l 0 40 M 240 600 l 0 40 M 340 600 l 0 40 M 440 600 l 0 40 M 540 600 l 0 40 M 640 600 l 0 40 M 740 600 l 0 40 M 840 600 l 0 40 M 940 600 l 0 40', c: '#92400e', w: 4 },
  ]);
  // banquinhos e mesa de toco
  put([{ d: 'M 170 1450 L 180 1330 L 300 1330 L 310 1450 Z', fill: '#b07a45', w: 6 }, { d: ellipse(240, 1330, 62, 14), fill: '#e7c9a0', w: 5 },
    { d: 'M 780 1450 L 790 1330 L 910 1330 L 920 1450 Z', fill: '#b07a45', w: 6 }, { d: ellipse(850, 1330, 62, 14), fill: '#e7c9a0', w: 5 }]);
  const l11 = beast(LION), d11 = beast(DEER);
  const cont11 = cont;
  const tableStart = WB.mk('g', {}, cont);
  put([{ d: 'M 450 1450 L 465 1270 L 635 1270 L 650 1450 Z', fill: '#c08552', w: 7 }, { d: ellipse(550, 1270, 100, 24), fill: '#e7c9a0', w: 6 },
    { d: 'M 520 1270 m -30 0 a 30 8 0 1 0 60 0 a 30 8 0 1 0 -60 0', c: '#b45309', w: 3 }]);
  const tableEnd = cont.lastChild;
  const potH = holder(teapot(), cont);
  potH(560, 1252);
  const cupL = holder(cup(), cont), cupD = holder(cup(), cont), boxH = holder(mateBox(), cont);
  const puddle = WB.mk('path', { d: ellipse(300, 1458, 90, 14), fill: '#b45309', stroke: BK, 'stroke-width': 4, opacity: 0 }, cont);
  const steam = WB.mk('g', {}, cont);
  const stm = dyn(steam, { stroke: '#9ca3af', 'stroke-width': 5 });
  const L11M = moodTrack(MOODS, [[38.6, 'calm'], [39.6, 'smile'], [40.65, 'sheepish'], [41.6, 'sad'], [43.0, 'annoyed'], [44.0, 'scared'], [45.7, 'calm'], [46.3, 'sick'],
    [48.6, 'weak'], [49.6, 'weak'], [52.35, 'horror'], [53.15, 'dead']]);
  const D11M = moodTrack(MOODS, [[38.6, 'calm'], [39.55, 'sly'], [41.6, 'neutral'], [44.0, 'smile'], [46.4, 'calm'], [48.6, 'smile'], [49.6, 'innocent'], [51.55, 'sly'], [52.3, 'smug']]);
  // leão: sentado → cai do banquinho e fica deitado no chão
  const L11lie = K([[48.55, 0], [48.95, 1, 'b']]);
  const L11X = K([[48.55, 330], [48.95, 270, 'o']]);
  const LSIP = t => bump(t, 38.7, 39.4) + bump(t, 45.7, 46.35);
  const DSIP = t => bump(t, 38.95, 39.5) + bump(t, 47.2, 48.5);
  WB.effect(t => {
    if (!inWin(S11, t)) return;
    const lie = L11lie(t);
    const sick = clamp((t - 46.3) / 0.35);
    const gag = t > 46.35 && t < 47.25 ? Math.sin(t * 30) * 4 : 0;
    const shrug = bump(t, 42.9, 43.9);
    const belly = t > 46.6 && lie < 0.5 ? 1 : 0;
    const ls = LSIP(t);
    const dead = t > 53.15 ? 1 : 0;
    if (lie > 0.3) { if (l11.g.parentNode.lastChild !== l11.g) cont11.appendChild(l11.g); }
    else if (l11.g.nextSibling !== tableStart) cont11.insertBefore(l11.g, tableStart);
    l11.update(t, {
      x: L11X(t) + gag, y: FL + lie * 60, s: LS * 0.95, f: 1, sit: 1 - lie, lie, sp: -78 * (1 - lie), mood: L11M(t), op: talk(L_WIN, t), seed: 1.3,
      arm: 1, armB: 1, armRel: true,
      A1: lie > 0.5 ? [90, (t > 48.85 && t < 51.4 ? -70 + Math.sin(t * 6) * 10 : 40)] : (belly ? [70, 120] : (shrug ? [120, -40 * shrug] : [70 - ls * 20, 70 - ls * 110])),
      A2: lie > 0.5 ? [60, 50] : (belly ? [50, 140] : (shrug ? [-60, -30 * shrug] : [50, 110])),
      headRot: lie > 0.5 ? (dead ? 20 : -14) : (t > 41.6 && t < 42.9 ? Math.sin(t * 9) * 10 : (ls ? -10 * ls : 0)) + gag,
      sick: lie > 0.5 && dead ? 0.6 : sick, xeyes: dead, tongue: dead ? 0.9 : 0, wag: dead ? 0 : 0.8, neckRot: lie > 0.5 ? 30 : 0,
    });
    const leanIn = bump(t, 39.6, 41.5);
    const ds = DSIP(t);
    const showBox = t > 51.9;
    const boxUp = eo(clamp((t - 51.95) / 0.35));
    d11.update(t, {
      x: 760, y: FL, s: DS, f: -1, sit: 1, sp: -78 + leanIn * 14, mood: D11M(t), op: talk(D_WIN, t), seed: 0.2, bandage: true,
      arm: 1, armB: 1, armRel: true,
      A1: showBox ? [90, -40 - boxUp * 90] : (t > 49.6 && t < 50.3 ? [10, -150] : [60 - ds * 20, 60 - ds * 100]),
      A2: [40, 110], headRot: (t > 39.6 && t < 41.5 ? Math.sin(t * 8) * 6 : 0) + (t > 49.6 && t < 50.3 ? 16 : 0),
      earFlap: t > 49.6 && t < 50.3 ? 1 : 0.3,
    });
    // xícaras
    const cupFall = t > 46.7;
    if (!cupFall) cupL(l11.armW[0] + 6, l11.armW[1] + 6, -ls * 35, 1, 1);
    else {
      const u = clamp((t - 46.7) / 0.35), p0 = [l11.bodyW[0] + 80, 1260];
      cupL(lerp(p0[0], 300, u), lerp(p0[1], 1440, u * u), u * 160, 1, t < 47.2 ? 1 : 0);
    }
    puddle.setAttribute('opacity', t > 46.95 ? 1 : 0);
    cupD(d11.armW[0] - 6, d11.armW[1] + 6, ds * 35, 1, showBox ? 0 : 1);
    boxH(d11.armW[0], d11.armW[1] - 40, -6 + Math.sin(t * 6) * 3, showBox ? 0.6 + 0.4 * backOut(clamp((t - 51.95) / 0.35)) : 0, showBox ? 1 : 0);
    stm.setAttribute('d', `M 560 1150 q -14 -24 0 -46 q 14 -24 0 -46`);
    steam.setAttribute('transform', `translate(0 ${r1(-((t * 30) % 20))})`);
    steam.setAttribute('opacity', (0.6 + 0.3 * Math.sin(t * 3)).toFixed(2));
  });
  // balões e efeitos da cabana
  PY(39.75, [...thought(560, 740, 260, 160, [[740, 980, 14], [700, 930, 22]]), heart(560, 700, 1.1),
    circ(440, 720, 34, '#f0c987', null, 4), { d: WB.cloudPath(440, 720, 50, 46, 9), fill: MANE, w: 4 }, circ(440, 724, 28, '#f0c987', null, 4),
    circ(680, 720, 32, '#f0c987', null, 4), { d: 'M 650 700 l 10 -14 M 710 700 l -10 -14', c: '#111', w: 4 },
    circ(500, 820, 14, '#f0c987', null, 3), circ(560, 830, 14, '#f0c987', null, 3), circ(620, 820, 14, '#f0c987', null, 3)], { loop: 'float', until: 41.6 }, 110);
  TX(40.7, 'safado', 860, 1040, 56, '#db2777', 6, { loop: 'wiggle', until: 41.6 });
  PY(44.0, [...thought(560, 740, 280, 170, [[300, 1000, 14], [340, 940, 22]]),
    { d: WB.cloudPath(560, 740, 110, 96, 13), fill: '#f0c987', w: 5 }, circ(560, 740, 70, '#f6d9a0', null, 5),
    { d: 'M 520 715 L 545 728 M 600 715 L 575 728', c: '#111', w: 7 }, { d: 'M 525 770 Q 560 800 595 770 L 595 790 Q 560 820 525 790 Z', fill: MOUTH, w: 4 },
    { d: 'M 535 772 l 6 12 l 6 -12 M 573 772 l 6 12 l 6 -12', c: '#ffffff', w: 3 }, burst(760, 640, 50, '#fde047'), T('GRRR!', 380, 650, 60, INK.red)], { loop: 'tremble', until: 45.7 }, 110);
  TX(46.45, 'ARGH...', 300, 980, 64, '#15803d', -6, { loop: 'tremble', until: 47.4 });
  TX(46.95, 'PLOFT', 300, 1360, 56, '#b45309', 4, { anim: 'slam', until: 47.8 });
  TX(47.4, 'sluuurp', 800, 1000, 56, '#7c3aed', 6, { loop: 'wiggle', until: 48.5 });
  TX(49.65, '?', 820, 900, 100, '#2563eb', 8, { loop: 'wiggle', until: 50.3 });
  stamp(52.35, 'MATE LEÃO', 560, 820, 84, INK.red, -6, { until: 53.5 });
  TX(53.2, 'X_X', 300, 1180, 70, '#111', 0, { anim: 'slam' });

  // =====================================================================
  // CENA 12 (53,5–56,4): "Vai comer veado agora... TU E O DIABO!" (o fantasminha desce)
  // =====================================================================
  const S12 = [[53.5, 56.4]];
  shot(S12);
  put([
    { d: 'M 96 1450 L 1060 1450 L 1060 1650 L 96 1650 Z', fill: '#efdcb8', c: 'none', fo: 0.8 }, { d: WB.roughLine(96, FL, 1060, FL, 2), w: 7 },
    { d: 'M 120 640 L 120 1450 M 1040 640 L 1040 1450 M 120 640 L 1040 640', c: '#92400e', w: 9 },
    { d: 'M 200 660 L 200 1440 M 280 660 L 280 1440 M 880 660 L 880 1440 M 960 660 L 960 1440', c: '#d6b88a', w: 6 },
    { d: 'M 96 640 L 1060 640 L 1060 600 L 96 600 Z', fill: '#d4a24c', w: 6 },
  ]);
  const l12 = beast(LION), d12 = beast(DEER);
  const ghost = WB.mk('g', { opacity: 0 }, cont);
  put([{ d: 'M -70 40 Q -80 -60 0 -70 Q 80 -60 70 40 L 70 120 Q 52 100 35 120 Q 18 100 0 120 Q -18 100 -35 120 Q -52 100 -70 120 Z', fill: '#ffffff', w: 5, op: 0.9 },
    { d: WB.cloudPath(0, -40, 64, 58, 11), fill: '#fde2c4', w: 4 }, circ(0, -36, 42, '#ffffff', null, 4),
    { d: 'M -22 -44 l 12 12 M -10 -44 l -12 12 M 10 -44 l 12 12 M 22 -44 l -12 12', w: 5 },
    { d: 'M -46 -88 L -36 -128 L -20 -96 Z M 46 -88 L 36 -128 L 20 -96 Z', fill: '#dc2626', w: 4 },
    { d: 'M 70 60 Q 120 40 110 0 L 124 -6 L 112 -22 L 100 -6 L 112 -2', c: '#dc2626', w: 6 }], ghost);
  const D12X = K([[53.5, 950], [54.4, 790, 'io']]), D12o = odo(D12X, 53.4, 56.5);
  WB.effect(t => {
    if (!inWin(S12, t)) return;
    l12.update(t, { x: 280, y: FL + 60, s: LS * 0.95, f: 1, lie: 1, mood: MOODS.dead, xeyes: 1, tongue: 0.9, seed: 1.3, wag: 0, sick: 0.6, headRot: 20, neckRot: 30 });
    const shout = t > 55.55;
    d12.update(t, Object.assign({ x: D12X(t), y: FL, s: DS * 1.05, f: -1, mood: shout ? MOODS.angry : MOODS.smug, op: talk(D_WIN, t) * (shout ? 1.4 : 1), seed: 0.2, bandage: true,
      arm: t > 54.5 ? 1 : 0, armRel: true, A1: [110, 70 + Math.sin(t * 12) * (shout ? 20 : 6)], sp: shout ? -16 : -6, hop: shout ? Math.abs(Math.sin(t * 12)) * 22 : 0,
      headRot: shout ? Math.sin(t * 20) * 6 : 6, earFlap: shout ? 1.5 : 0.4 }, D12o(t)));
    // fantasminha (com chifrinhos) sai do corpo e desce pro andar de baixo
    const u = clamp((t - 54.6) / 1.8);
    ghost.setAttribute('opacity', (u > 0 ? Math.min(1, u * 4) * 0.85 : 0).toFixed(2));
    ghost.setAttribute('transform', `translate(${r1(310 + Math.sin(t * 4) * 20)} ${r1(1280 - Math.sin(Math.min(u, 1) * Math.PI * 0.5) * 380)}) rotate(${r1(Math.sin(t * 3) * 6)})`);
  });
  stamp(55.6, 'TU E O DIABO!!!', 560, 760, 84, INK.red, -5, { until: 56.4, loop: 'shake' });

  // =====================================================================
  // CENA 13 (56,4–58,3): o veado vai embora saltitando, feliz
  // =====================================================================
  const S13 = [[56.4, CTA0]];
  shot(S13);
  put(savanna({ sunX: 880, sunY: 620, cx: 300, cy: 600, tree: [[960, 1200, 0.8]] }));
  const d13 = beast(DEER);
  const D13X = K([[56.4, -60], [58.3, 1000, 'l']]), D13o = odo(D13X, 56.3, 58.4);
  WB.effect(t => {
    if (!inWin(S13, t)) return;
    const o = D13o(t);
    d13.update(t, Object.assign({ x: D13X(t), y: FL, s: DS, f: 1, mood: MOODS.happy, op: 0, seed: 0.2, bandage: true, run: 0.35,
      hop: Math.abs(Math.sin((o.d / 280) * Math.PI)) * 50, headRot: Math.sin(t * 6) * 8, earFlap: 1 }, o));
  });
  P(56.5, [...noteSym(300, 900, 0.9), ...noteSym(520, 840, 0.7, '#db2777'), ...noteSym(760, 900, 0.8, '#2563eb')], { loop: 'rise', until: CTA0 });

  // =====================================================================
  // CTA (58,3–fim)
  // =====================================================================
  shot([[CTA0, 999]], false);
  {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 560, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 650, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@caderno_amarelo', 380, 650 + 190 * 0.62, 84, BK, g).strokes);
    animate(g, CTA0 + 0.1, { loop: 'float' });
    put([{ d: WB.roughLine(96, 1450, 1060, 1450, 2), w: 7 }]);
    const dc = makeBeast(cont, DEER), lc = makeBeast(cont, LION);
    WB.effect(t => {
      if (t < CTA0) return;
      dc.update(t, { x: 720, y: 1450, s: 0.9, f: -1, mood: MOODS.happy, hop: Math.abs(Math.sin(t * 6)) * 40, seed: 0.2, bandage: true, earFlap: 1,
        arm: 1, armRel: true, A1: [90, -60 + Math.sin(t * 12) * 30] });
      lc.update(t, { x: 330, y: 1450, s: 0.95, f: 1, mood: MOODS.sheepish, seed: 1.3, sit: 1, sp: -78, arm: 1, armRel: true, A1: [100, -60 + Math.sin(t * 9) * 25], wag: 2 });
    });
  }

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA: @caderno_amarelo troca de canto a cada ~5 s (deslizando),
  // sempre fora da faixa de legenda, do meio da ação e das zonas de botões/legenda do TikTok e do Instagram.
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
    // cantos seguros (centro da pílula): alto-esquerda, alto-direita, baixo-direita, baixo-esquerda
    const SPOTS = [[300, 480], [770, 480], [790, 1560], [300, 1560]];
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
