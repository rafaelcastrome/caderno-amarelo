// Meme "o pernilongo sommelier" (animação original de @rafaellatuma: abelha, pernilongo e mosca num bar),
// redesenhado no Caderno Amarelo em formato de cenas, com movimento fluido.
// Os três bonecos são rigs recalculados a cada quadro (trilhas de keyframes com easing, braços com IK de dois ossos,
// asas batendo, antenas com balanço, piscadas, boca pela energia da voz de quem fala). O bar é um cenário só,
// filmado por uma câmera virtual (zoom e panorâmica por trilha); vinho, garrafas e jardim são cenas de corte.
// Áudio original + gargalhada aprovada. A marca d'água @caderno_amarelo passeia por 4 cantos seguros.
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

  // ---------------- áudio: energia da voz (20/s, 0–9) e quem fala ----------------
  const ENV = '0587479976997659964697436963323567787244343189998578489959982567763585442486346726527868945368515975621795432122211232248886527636664687655433321111000000366665444553786177778655411102111111111110037637659837446737676756756656257766433228868968978978898768885672136675545523566667665144022333466435766654289578733156636676237776541000148975322556632567776511010004667767777665310000586189854786533782688477538865676313564652577667531111111103897979554217899899978272287632268999998888999755699789969484988968996557636778868875743597776765876634441000000000000298989897687469967887358642110332256864111221156864103328888799841000022211320000111111489947984767986216511112222';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  const BEE_WIN = [[0.4, 1.9], [2.3, 7.35], [9.9, 14.6], [18.38, 18.98], [22.1, 27.8], [28.0, 29.5]];
  const MOS_WIN = [[7.8, 9.3], [14.7, 18.1], [19.12, 21.8]];
  const FLY_WIN = [[30.8, 32.1], [32.4, 33.9]];
  const talk = (wins, t) => {
    for (const [a, b] of wins) if (t >= a && t <= b) return clamp((envAt(t) - 0.2) * 1.45) * clamp((b - t) / 0.06);
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

  function star(x, y, r, fill = '#facc15') {
    let d = '';
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? ' L ' : 'M ') + r1(x + Math.cos(a) * rr) + ' ' + r1(y + Math.sin(a) * rr); }
    return { d: d + ' Z', fill, w: 5 };
  }

  // rig: local -> mundo com a mesma ordem do transform dos bonecos: translate(x y) scale(s*f s) rotate(lean)
  const toWorld = (p) => (lx, ly) => {
    const c = Math.cos((p.lean || 0) * DEG), sn = Math.sin((p.lean || 0) * DEG), s = p.s || 1, f = p.f || 1;
    return [p.x + s * f * (lx * c - ly * sn), p.y + s * (lx * sn + ly * c)];
  };
  const rigT = (p) => `translate(${r1(p.x)} ${r1(p.y)}) scale(${((p.s || 1) * (p.f || 1)).toFixed(3)} ${(p.s || 1).toFixed(3)}) rotate(${r1(p.lean || 0)})`;
  const show = (el, on) => el.setAttribute('display', on ? 'inline' : 'none');
  const fillDyn = (parent, fill, attrs = {}) => WB.mk('path', Object.assign({ d: '', fill, stroke: BK, 'stroke-width': 5, 'stroke-linejoin': 'round' }, attrs), parent);

  // ---------------- objetos de mão ----------------
  const WINE = '#9f1239';
  // taça: a mão segura a haste em (0,0); boca da taça em y -100
  function wineGlass(parent, sc = 1) {
    const g = WB.mk('g', { transform: `scale(${sc})` }, parent);
    const id = 'wg' + (UID++);
    const bowl = 'M -40 -100 Q -48 -40 0 -32 Q 48 -40 40 -100 Z';
    const cp = WB.mk('clipPath', { id }, g); WB.mk('path', { d: bowl }, cp);
    WB.mk('path', { d: bowl, fill: '#ffffff', 'fill-opacity': 0.55, stroke: 'none' }, g);
    const wine = WB.mk('rect', { x: -50, y: -60, width: 100, height: 40, fill: WINE, 'clip-path': `url(#${id})` }, g);
    const surf = WB.mk('path', { d: '', fill: 'none', stroke: '#e11d48', 'stroke-width': 3, 'clip-path': `url(#${id})` }, g);
    WB.mk('path', { d: 'M -40 -100 Q -48 -40 0 -32 Q 48 -40 40 -100', fill: 'none', stroke: BK, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    WB.mk('path', { d: ellipse(0, -100, 40, 7), fill: 'none', stroke: BK, 'stroke-width': 4 }, g);
    WB.mk('path', { d: 'M -24 -88 Q -30 -60 -16 -46', fill: 'none', stroke: '#ffffff', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    WB.mk('path', { d: 'M 0 -32 L 0 30', stroke: BK, 'stroke-width': 6, fill: 'none' }, g);
    WB.mk('path', { d: ellipse(0, 32, 26, 7), fill: '#ffffff', stroke: BK, 'stroke-width': 5 }, g);
    return (level, slosh = 0) => {
      const y = -34 - 58 * clamp(level);
      wine.setAttribute('y', r1(y)); wine.setAttribute('height', r1(-30 - y + 4));
      surf.setAttribute('d', level > 0.02 ? `M -46 ${r1(y + slosh)} L 46 ${r1(y - slosh)}` : '');
    };
  }
  // copo de caipirinha (estático, na mesa): base em (x, y)
  const caipi = (x, y) => [
    { d: `M ${x - 34} ${y - 92} L ${x - 26} ${y} L ${x + 26} ${y} L ${x + 34} ${y - 92} Z`, fill: '#e0f2fe', w: 5 },
    { d: `M ${x - 30} ${y - 60} L ${x - 27} ${y - 4} L ${x + 27} ${y - 4} L ${x + 30} ${y - 60} Z`, fill: '#d9f99d', c: 'none' },
    circ(x - 8, y - 30, 13, '#84cc16', BK, 3), circ(x + 12, y - 18, 11, '#84cc16', BK, 3),
    { d: `M ${x + 10} ${y - 70} L ${x + 44} ${y - 140}`, c: '#ef4444', w: 7 },
    { d: `M ${x - 52} ${y - 96} A 30 30 0 0 1 ${x - 4} ${y - 96} Z`, fill: '#a3e635', w: 4 },
  ];
  // pote de mel: a mão segura em (0,0)
  function honeyJar(parent, sc = 1) {
    const g = WB.mk('g', { transform: `scale(${sc})` }, parent);
    showAll(build([
      { d: 'M -44 -86 Q -58 -40 -48 0 Q -40 26 0 26 Q 40 26 48 0 Q 58 -40 44 -86 Z', fill: '#f59e0b', w: 6 },
      { d: 'M -50 -96 Q 0 -116 50 -96 L 54 -80 Q 0 -66 -54 -80 Z', fill: '#fde68a', w: 5 },
      { d: 'M -46 -84 Q 0 -74 46 -84', c: '#b45309', w: 4 },
      { d: WB.roundRectPath(-30, -54, 60, 38, 8), fill: '#fffbeb', w: 4 },
      T('MEL', 0, -26, 30, '#b45309'),
      { d: 'M -40 -40 q -6 14 0 22', c: '#fef3c7', w: 6 },
      { d: 'M 30 -82 q 6 20 2 34 q -4 8 -6 0', fill: '#f59e0b', w: 4 },
    ], g));
    return g;
  }
  // caneca da mosca: a mão segura a alça em (0,0); corpo pra +x; boca em y -60
  function flyMug(parent) {
    const g = WB.mk('g', {}, parent);
    const poop = WB.mk('g', {}, g);
    showAll(build([
      { d: 'M 8 -40 Q -18 -40 -18 -18 Q -18 6 8 6', w: 9 },
      { d: WB.roundRectPath(4, -62, 74, 82, 10), fill: '#e7e5e4', w: 6 },
      { d: 'M 14 -40 L 68 -40', c: '#a8a29e', w: 4 },
      { d: ellipse(41, -62, 37, 8), fill: '#78350f', w: 4 },
    ], g));
    // cocô em espiral saindo da caneca (aparece no "eu gosto de bosta")
    const PO = '#8b5a2b';
    showAll(build([
      { d: 'M -4 -60 Q -6 -96 41 -94 Q 88 -96 86 -60 Z', fill: PO, w: 6 },
      { d: 'M 6 -92 Q 4 -122 41 -122 Q 78 -122 76 -92 Z', fill: PO, w: 6 },
      { d: 'M 18 -120 Q 16 -146 41 -148 Q 50 -160 46 -172 Q 66 -150 64 -120 Z', fill: PO, w: 6 },
      { d: 'M 20 -84 q 10 -6 18 -2 M 30 -112 q 8 -6 16 -2', c: '#c08a5a', w: 5 },
    ], poop));
    const stink = WB.mk('g', {}, poop);
    showAll(build([{ d: 'M 0 -170 q 14 -22 0 -44 q -14 -22 0 -44 M 82 -170 q 14 -22 0 -44 q -14 -22 0 -44', c: '#65a30d', w: 6 }], stink));
    return { g, poop, stink };
  }

  // =====================================================================
  // RIG: ABELHA (corpo redondo listrado; origem = assento, base do corpo)
  // =====================================================================
  const BEE_Y = '#f6c22f', BEE_D = '#3b3530';
  const BEE_MOODS = {
    neutral: { smile: 5, sparkle: 0.3 },
    laugh: { happy: 1, smile: 16, tear: 1 },
    talk: { smile: 6, bi: -4, sparkle: 0.5 },
    shock: { pr: 0.6, bi: -14, bo: -8, smile: -4 },
    dreamy: { happy: 1, smile: 12, blush: 1 },
    offer: { smile: 12, bi: -8, sparkle: 1, blush: 0.5 },
    skeptic: { lid: 0.55, bi: 10, bo: -2, asym: -1.4, smile: -4, px: 7 },
    plead: { bi: -12, bo: 4, smile: 3, pr: 1.15, sparkle: 1 },
    angry: { lid: 0.12, bi: 14, bo: -6, smile: -10, px: 8 },
    disgust: { lid: 0.45, bi: 12, bo: -4, smile: -12, tongue: 1, px: 9 },
  };
  function makeBee(parent) {
    const g = WB.mk('g', {}, parent);
    const wings = WB.mk('g', {}, g);
    const wing = (sx) => {
      const w = WB.mk('g', {}, wings);
      const inner = WB.mk('g', { transform: `scale(${sx} 1)` }, w);
      WB.mk('path', { d: ellipse(-78, -50, 74, 42), fill: '#e0f2fe', 'fill-opacity': 0.8, stroke: BK, 'stroke-width': 5, transform: 'rotate(-28 -78 -50)' }, inner);
      WB.mk('path', { d: 'M -8 -6 Q -60 -40 -130 -70 M -40 -26 Q -80 -10 -120 -24', fill: 'none', stroke: '#93c5fd', 'stroke-width': 3 }, inner);
      return w;
    };
    const wL = wing(1), wR = wing(-1);
    const legL = dyn(g, { stroke: BEE_D, 'stroke-width': 9 }), legR = dyn(g, { stroke: BEE_D, 'stroke-width': 9 });
    const footL = fillDyn(g, BEE_D), footR = fillDyn(g, BEE_D);
    WB.mk('path', { d: 'M -16 -8 L 0 26 L 16 -8 Z', fill: BEE_D, stroke: BK, 'stroke-width': 4 }, g);
    const id = 'bb' + (UID++);
    const bodyD = ellipse(0, -128, 120, 130);
    const cp = WB.mk('clipPath', { id }, g); WB.mk('path', { d: bodyD }, cp);
    WB.mk('path', { d: bodyD, fill: BEE_Y, stroke: 'none' }, g);
    const stripes = WB.mk('g', { 'clip-path': `url(#${id})` }, g);
    WB.mk('path', { d: 'M -140 -62 Q 0 -36 140 -62', fill: 'none', stroke: BEE_D, 'stroke-width': 36 }, stripes);
    WB.mk('path', { d: 'M -140 -2 Q 0 24 140 -2', fill: 'none', stroke: BEE_D, 'stroke-width': 30 }, stripes);
    WB.mk('path', { d: 'M -70 -230 Q -20 -250 30 -246', fill: 'none', stroke: '#fde68a', 'stroke-width': 10, 'stroke-linecap': 'round' }, stripes);
    WB.mk('path', { d: bodyD, fill: 'none', stroke: BK, 'stroke-width': 7 }, g);
    // pelinhos
    WB.mk('path', { d: 'M -118 -150 l -12 -4 M -120 -110 l -13 2 M 118 -150 l 12 -4 M 120 -110 l 13 2 M -14 -258 q 8 -18 16 -2 q 8 -18 16 0', fill: 'none', stroke: BK, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    const antL = dyn(g, { 'stroke-width': 6 }), antR = dyn(g, { 'stroke-width': 6 });
    const knobL = fillDyn(g, BEE_D), knobR = fillDyn(g, BEE_D);
    const blush = WB.mk('g', { opacity: 0 }, g);
    WB.mk('path', { d: ellipse(-84, -132, 20, 11), fill: '#fb923c', 'fill-opacity': 0.7 }, blush);
    WB.mk('path', { d: ellipse(84, -132, 20, 11), fill: '#fb923c', 'fill-opacity': 0.7 }, blush);
    const eL = makeEye(g, -44, -180, 31, 37, BEE_Y, { prx: 11 }), eR = makeEye(g, 44, -180, 31, 37, BEE_Y, { prx: 11 });
    const mouth = makeMouth(g, 0, -122, 56);
    const sweat = WB.mk('path', { d: 'M 112 -220 q -14 24 0 36 q 14 -12 0 -36 Z', fill: '#93c5fd', stroke: BK, 'stroke-width': 4, opacity: 0 }, g);
    const arm = () => ({ a: dyn(g, { stroke: BEE_D, 'stroke-width': 10 }), h: fillDyn(g, BEE_D), item: WB.mk('g', {}, g) });
    const aL = arm(), aR = arm();
    const items = { honey: honeyJar(aR.item, 0.85) };
    const SHL = [-96, -118], SHR = [96, -118];
    return (t, p) => {
      g.setAttribute('transform', rigT(p));
      const fly = p.fly || 0;
      const fl = Math.sin(t * (fly > 0.5 ? 70 : 6)) * (fly > 0.5 ? 34 : 5);
      wL.setAttribute('transform', `translate(-46 -214) rotate(${r1(-10 + fl)})`);
      wR.setAttribute('transform', `translate(46 -214) rotate(${r1(10 - fl)})`);
      // pernas: sentada, as pernas balançam pra frente; voando, ficam soltas
      const kick = Math.sin(t * 3.1) * 8 * (1 - fly);
      const legs = [[-36, -14, -50 + kick, 64 - fly * 6], [36, -14, 34 - kick, 66 + fly * 10]];
      [[legL, footL], [legR, footR]].forEach(([lg, ft], i) => {
        const [hx, hy, fx, fy] = legs[i];
        const sway = fly * Math.sin(t * 5 + i) * 10;
        lg.setAttribute('d', `M ${hx} ${hy} Q ${r1(hx + (fx - hx) * 0.3 + sway)} ${r1(fy - 10)} ${r1(fx + sway)} ${r1(fy)}`);
        ft.setAttribute('d', ellipse(r1(fx + sway + 6), r1(fy + 4), 14, 8));
      });
      // antenas com atraso (balançam quando o corpo mexe)
      const sw = Math.sin(t * 3.3) * 6 + (p.antK || 0) * Math.sin(t * 17) * 10;
      const tipL = [-70 + sw, -352 + Math.abs(sw) * 0.4], tipR = [62 + sw * 0.8, -356 + Math.abs(sw) * 0.3];
      antL.setAttribute('d', `M -28 -246 Q -36 -310 ${r1(tipL[0])} ${r1(tipL[1])}`);
      antR.setAttribute('d', `M 26 -248 Q 30 -312 ${r1(tipR[0])} ${r1(tipR[1])}`);
      knobL.setAttribute('d', WB.circlePath(r1(tipL[0]), r1(tipL[1]), 13));
      knobR.setAttribute('d', WB.circlePath(r1(tipR[0]), r1(tipR[1]), 13));
      const m = p.m;
      const bl = blinkAt(t, 0.4, 3.3);
      const em = Object.assign({}, m, { lid: Math.max(m.lid || 0, bl) });
      eL(em, -1, t); eR(em, 1, t);
      blush.setAttribute('opacity', (m.blush || 0).toFixed(2));
      sweat.setAttribute('opacity', p.sweat ? 1 : 0);
      mouth(p.op || 0, m.smile || 0, { tongue: m.tongue || 0 });
      // braços (IK), polo para fora e para baixo
      [[aL, SHL, p.L || [-104, -48], -1], [aR, SHR, p.R || [104, -48], 1]].forEach(([A, sh, tg, sd]) => {
        const { el, h } = ik(sh[0], sh[1], tg[0], tg[1], 60, 60, [sh[0] + sd * 90, sh[1] + 70]);
        A.a.setAttribute('d', limb(sh, el, h));
        A.h.setAttribute('d', WB.circlePath(r1(h[0]), r1(h[1]), 12));
        A.item.setAttribute('transform', `translate(${r1(h[0])} ${r1(h[1])})`);
      });
      show(items.honey, p.holdR === 'honey');
      if (p.holdR === 'honey') items.honey.setAttribute('transform', `scale(${(0.85 * (p.honeyK ?? 1)).toFixed(3)})`);
    };
  }
  const limb = (s, e, h) => `M ${r1(s[0])} ${r1(s[1])} Q ${r1(e[0])} ${r1(e[1])} ${r1(h[0])} ${r1(h[1])}`;

  // =====================================================================
  // RIG: PERNILONGO (cabeça azul, olhos de sono, ferrão comprido, barriga rosa; origem = assento)
  // =====================================================================
  const MOS_H = '#9cc7d8', MOS_T = '#7fb0c4', MOS_B = '#f6b8c4';
  const MOS_MOODS = {
    sleepy: { lid: 0.45, smile: 2 },
    smug: { lid: 0.58, smile: 8, py: -3, bi: 2 },
    sniff: { lid: 1, smile: 7, bi: -6 },
    sideeye: { lid: 0.5, px: -10, smile: -3, bi: 4, asym: 1 },
    startle: { lid: 0, pr: 0.6, bi: -14, bo: -10, smile: -6 },
    push: { lid: 0.3, bi: 10, bo: -4, smile: -7, px: -8 },
    offended: { lid: 0.85, bi: -12, bo: 2, smile: -9, py: -8 },
    dreamy: { happy: 1, smile: 14, blush: 1 },
    lookfly: { lid: 0.42, px: 10, smile: -2, bi: -4 },
    disgust: { lid: 0.5, bi: 12, bo: -4, smile: -12, px: 10 },
  };
  function makeMosquito(parent, o = {}) {
    const g = WB.mk('g', {}, parent);
    const wings = WB.mk('g', {}, g);
    const wing = (rot) => {
      const w = WB.mk('g', {}, wings);
      WB.mk('path', { d: ellipse(-10, -100, 26, 100), fill: '#f1f5f9', 'fill-opacity': 0.75, stroke: BK, 'stroke-width': 4, transform: `rotate(${rot})` }, w);
      WB.mk('path', { d: 'M -6 -14 Q -14 -100 -10 -186', fill: 'none', stroke: '#cbd5e1', 'stroke-width': 3, transform: `rotate(${rot})` }, w);
      return w;
    };
    const wA = wing(-38), wB = wing(-18);
    const legs = [0, 1, 2].map(() => dyn(g, { stroke: '#475569', 'stroke-width': 6 }));
    // barriga rosa em gomos + tórax
    put([{ d: ellipse(-8, -104, 54, 104), fill: MOS_B, w: 6 },
      { d: 'M -58 -150 Q -8 -136 44 -150 M -60 -108 Q -8 -94 46 -108 M -56 -66 Q -8 -52 42 -66 M -42 -28 Q -8 -16 28 -28', c: '#db7d92', w: 4 },
      { d: ellipse(0, -222, 58, 50), fill: MOS_T, w: 6 }], g);
    const head = WB.mk('g', {}, g);
    const antL = dyn(head, { 'stroke-width': 5 }), antR = dyn(head, { 'stroke-width': 5 });
    const pro = dyn(head, { stroke: '#334155', 'stroke-width': 8 });
    put([{ d: ellipse(0, -320, 74, 62), fill: MOS_H, w: 6 }], head);
    put([{ d: 'M 30 -312 Q 52 -306 46 -288 Q 30 -284 24 -296 Z', fill: MOS_H, w: 5 }], head);
    const blush = WB.mk('g', { opacity: 0 }, head);
    WB.mk('path', { d: ellipse(-50, -292, 15, 8), fill: '#f472b6', 'fill-opacity': 0.7 }, blush);
    WB.mk('path', { d: ellipse(52, -292, 15, 8), fill: '#f472b6', 'fill-opacity': 0.7 }, blush);
    const eL = makeEye(head, -30, -336, 25, 30, MOS_H, { prx: 8.5, browW: 5 }), eR = makeEye(head, 32, -336, 25, 30, MOS_H, { prx: 8.5, browW: 5 });
    const mouth = makeMouth(head, -6, -280, 30);
    const arm = () => ({ o: dyn(g, { 'stroke-width': 13 }), i: dyn(g, { stroke: MOS_T, 'stroke-width': 6 }), h: fillDyn(g, MOS_H), item: WB.mk('g', {}, g) });
    const aL = arm(), aR = arm();
    const glass = o.noGlass ? null : wineGlass(aR.item, o.glassK || 1);
    const SHL = [-44, -226], SHR = [44, -226];
    return (t, p) => {
      g.setAttribute('transform', rigT(p));
      const fl = Math.sin(t * 7 + 1) * 4;
      wA.setAttribute('transform', `translate(-14 -238) rotate(${r1(fl)})`);
      wB.setAttribute('transform', `translate(10 -240) rotate(${r1(-fl * 0.7)})`);
      // pernas finas dobradas (joelho alto), apoiadas no banquinho
      [[-30, -24, -96, -84, -70, 110], [20, -22, 70, -96, 92, 108], [0, -30, -20, -60, 20, 124]].forEach(([hx, hy, kx, ky, fx, fy], i) =>
        legs[i].setAttribute('d', `M ${hx} ${hy} L ${kx} ${ky} L ${fx} ${fy}`));
      head.setAttribute('transform', `rotate(${r1(p.headRot || 0)} 0 -262)`);
      const sw = Math.sin(t * 2.7) * 5;
      const feather = (x0, y0, x1, y1) => {
        let d = `M ${x0} ${y0} Q ${r1((x0 + x1) / 2 - 6)} ${r1((y0 + y1) / 2)} ${r1(x1)} ${r1(y1)}`;
        for (let k = 1; k <= 4; k++) {
          const u = k / 5, x = lerp(x0, x1, u), y = lerp(y0, y1, u);
          d += ` M ${r1(x)} ${r1(y)} l -14 -6 M ${r1(x)} ${r1(y)} l 14 -6`;
        }
        return d;
      };
      antL.setAttribute('d', feather(-20, -374, -52 + sw, -452));
      antR.setAttribute('d', feather(20, -376, 46 + sw, -458));
      const pa = (p.pa ?? 38) * DEG, L = p.proL || 124, bx = 40, by = -298;
      pro.setAttribute('d', `M ${bx} ${by} Q ${r1(bx + L * 0.55 * Math.cos(pa - 0.12))} ${r1(by + L * 0.55 * Math.sin(pa - 0.12))} ${r1(bx + L * Math.cos(pa))} ${r1(by + L * Math.sin(pa))}`);
      const m = p.m;
      const bl = blinkAt(t, 1.2, 3.7);
      const em = Object.assign({}, m, { lid: Math.max(m.lid || 0, bl) });
      eL(em, -1, t); eR(em, 1, t);
      blush.setAttribute('opacity', (m.blush || 0).toFixed(2));
      mouth(p.op || 0, m.smile || 0, {});
      [[aL, SHL, p.L || [-70, -40], -1], [aR, SHR, p.R || [100, -170], 1]].forEach(([A, sh, tg, sd]) => {
        const { el, h } = ik(sh[0], sh[1], tg[0], tg[1], 88, 88, [sh[0] + sd * 110, sh[1] + 60]);
        const d = limb(sh, el, h);
        A.o.setAttribute('d', d); A.i.setAttribute('d', d);
        A.h.setAttribute('d', WB.circlePath(r1(h[0]), r1(h[1]), 11));
        A.item.setAttribute('transform', `translate(${r1(h[0])} ${r1(h[1])}) rotate(${r1(p.glassRot || 0)})`);
      });
      if (glass) glass(p.wine ?? 0.55, p.slosh || 0);
    };
  }

  // =====================================================================
  // RIG: MOSCA (gorducha verde, olhões compostos vermelhos; origem = assento)
  // =====================================================================
  const FLY_B = '#8db556', FLY_D = '#4b6b2a', FLY_H = '#a7c96b', FLY_E = '#b8463b';
  const FLY_MOODS = {
    sleepy: { lid: 0.55, smile: 1 },
    bored: { lid: 0.68, smile: -3, bi: 4 },
    up: { lid: 0.22, smile: 0, bi: -6 },
    shrug: { lid: 0.6, smile: -5, bi: -8, asym: 1 },
    love: { happy: 1, smile: 15, blush: 1 },
  };
  function makeFlyEye(parent, cx, cy, r) {
    const id = 'fe' + (UID++);
    const g = WB.mk('g', {}, parent);
    WB.mk('path', { d: WB.circlePath(cx, cy, r), fill: FLY_E, stroke: BK, 'stroke-width': 6 }, g);
    const cp = WB.mk('clipPath', { id }, g); WB.mk('path', { d: WB.circlePath(cx, cy, r - 2) }, cp);
    const inner = WB.mk('g', { 'clip-path': `url(#${id})` }, g);
    let hd = '';
    for (let k = -r * 2; k <= r * 2; k += 15) hd += `M ${cx + k - r} ${cy - r} L ${cx + k + r} ${cy + r} M ${cx + k + r} ${cy - r} L ${cx + k - r} ${cy + r} `;
    WB.mk('path', { d: hd, stroke: '#7f1d1d', 'stroke-width': 2.5, 'stroke-opacity': 0.55, fill: 'none' }, inner);
    const shine = WB.mk('path', { d: '', fill: '#ffffff', 'fill-opacity': 0.9 }, inner);
    const lid = WB.mk('rect', { x: cx - r - 2, y: cy - r - 2, width: r * 2 + 4, height: 0, fill: FLY_H }, inner);
    const lidLine = dyn(inner, { 'stroke-width': 5 });
    const happy = dyn(parent, { 'stroke-width': 7 });
    const brow = dyn(parent, { 'stroke-width': 6 });
    return (p, side) => {
      const hp = p.happy || 0;
      g.setAttribute('opacity', (1 - hp).toFixed(2));
      happy.setAttribute('d', hp > 0.02 ? `M ${r1(cx - r * 0.8)} ${r1(cy + r * 0.2)} Q ${cx} ${r1(cy - r * 0.9 * hp)} ${r1(cx + r * 0.8)} ${r1(cy + r * 0.2)}` : '');
      shine.setAttribute('d', ellipse(r1(cx - r * 0.35 + (p.px || 0) * 0.6), r1(cy - r * 0.42 + (p.py || 0) * 0.6), r * 0.22, r * 0.13));
      const lv = clamp(p.lid || 0), h = lv * (r * 2 + 4), yl = cy - r - 2 + h;
      lid.setAttribute('height', r1(h));
      lidLine.setAttribute('d', lv > 0.05 ? `M ${r1(cx - r - 2)} ${r1(yl)} Q ${cx} ${r1(yl + 5)} ${r1(cx + r + 2)} ${r1(yl)}` : '');
      const bi = (p.bi || 0) + (side > 0 ? (p.asym || 0) * 10 : 0), bo = p.bo || 0;
      const ix = cx - side * r * 0.7, ox = cx + side * r * 0.75;
      brow.setAttribute('d', `M ${r1(ox)} ${r1(cy - r - 12 + bo)} Q ${cx} ${r1(cy - r - 22 + Math.min(bi, bo))} ${r1(ix)} ${r1(cy - r - 12 + bi)}`);
    };
  }
  function makeFly(parent) {
    const g = WB.mk('g', {}, parent);
    const wings = WB.mk('g', {}, g);
    const wing = (sx) => {
      const w = WB.mk('g', {}, wings);
      const inner = WB.mk('g', { transform: `scale(${sx} 1)` }, w);
      WB.mk('path', { d: ellipse(-60, -86, 50, 96), fill: '#e5e7eb', 'fill-opacity': 0.78, stroke: BK, 'stroke-width': 5, transform: 'rotate(-30 -60 -86)' }, inner);
      WB.mk('path', { d: 'M -10 -10 Q -50 -90 -100 -160 M -30 -40 Q -80 -70 -110 -90', fill: 'none', stroke: '#9ca3af', 'stroke-width': 3 }, inner);
      return w;
    };
    const wL = wing(1), wR = wing(-1);
    const legL = dyn(g, { stroke: BK, 'stroke-width': 8 }), legR = dyn(g, { stroke: BK, 'stroke-width': 8 });
    const id = 'fb' + (UID++);
    const bodyD = ellipse(0, -112, 118, 112);
    const cp = WB.mk('clipPath', { id }, g); WB.mk('path', { d: bodyD }, cp);
    WB.mk('path', { d: bodyD, fill: FLY_B, stroke: 'none' }, g);
    const st = WB.mk('g', { 'clip-path': `url(#${id})` }, g);
    WB.mk('path', { d: 'M -140 -90 Q 0 -66 140 -90 M -140 -34 Q 0 -10 140 -34', fill: 'none', stroke: FLY_D, 'stroke-width': 26 }, st);
    WB.mk('path', { d: bodyD, fill: 'none', stroke: BK, 'stroke-width': 7 }, g);
    WB.mk('path', { d: 'M -116 -130 l -14 -6 M -118 -96 l -14 0 M -112 -60 l -13 6 M 116 -130 l 14 -6 M 118 -96 l 14 0 M 112 -60 l 13 6', fill: 'none', stroke: BK, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    const head = WB.mk('g', {}, g);
    put([{ d: ellipse(0, -258, 94, 78), fill: FLY_H, w: 6 },
      { d: 'M -14 -334 l -6 -22 M 4 -336 l 2 -24 M 20 -332 l 10 -20 M -40 -322 l -14 -14 M 44 -320 l 14 -14', w: 4 }], head);
    const blush = WB.mk('g', { opacity: 0 }, head);
    WB.mk('path', { d: ellipse(-62, -214, 16, 9), fill: '#f87171', 'fill-opacity': 0.7 }, blush);
    WB.mk('path', { d: ellipse(62, -214, 16, 9), fill: '#f87171', 'fill-opacity': 0.7 }, blush);
    const eL = makeFlyEye(head, -50, -280, 46), eR = makeFlyEye(head, 50, -280, 46);
    const mouth = makeMouth(head, 2, -212, 44);
    const arm = () => ({ a: dyn(g, { 'stroke-width': 9 }), h: fillDyn(g, FLY_D), item: WB.mk('g', {}, g) });
    const aL = arm(), aR = arm();
    const mug = flyMug(aR.item);
    const SHL = [-78, -150], SHR = [78, -150];
    return Object.assign((t, p) => {
      g.setAttribute('transform', rigT(p));
      const fl = Math.sin(t * 5) * 4;
      wL.setAttribute('transform', `translate(-40 -196) rotate(${r1(-6 + fl)})`);
      wR.setAttribute('transform', `translate(40 -196) rotate(${r1(6 - fl)})`);
      const kick = Math.sin(t * 2.3) * 6;
      legL.setAttribute('d', `M -40 -10 Q -52 30 ${r1(-58 + kick)} 62 l -16 4`);
      legR.setAttribute('d', `M 40 -10 Q 52 30 ${r1(46 - kick)} 64 l 16 4`);
      head.setAttribute('transform', `rotate(${r1(p.headRot || 0)} 0 -200)`);
      const m = p.m;
      const bl = blinkAt(t, 2.1, 4.1);
      const em = Object.assign({}, m, { lid: Math.max(m.lid || 0, bl) });
      eL(em, -1); eR(em, 1);
      blush.setAttribute('opacity', (m.blush || 0).toFixed(2));
      mouth(p.op || 0, m.smile || 0, {});
      [[aL, SHL, p.L || [-70, -60], -1], [aR, SHR, p.R || [70, -60], 1]].forEach(([A, sh, tg, sd]) => {
        const { el, h } = ik(sh[0], sh[1], tg[0], tg[1], 52, 52, [sh[0] + sd * 70, sh[1] + 60]);
        A.a.setAttribute('d', limb(sh, el, h));
        A.h.setAttribute('d', WB.circlePath(r1(h[0]), r1(h[1]), 12));
        A.item.setAttribute('transform', `translate(${r1(h[0])} ${r1(h[1])}) rotate(${r1(p.mugRot || 0)})`);
      });
      const pk = p.poop || 0;
      show(mug.poop, pk > 0.01);
      if (pk > 0.01) {
        mug.poop.setAttribute('transform', `translate(41 -60) scale(${pk.toFixed(3)}) translate(-41 60)`);
        mug.stink.setAttribute('transform', `translate(0 ${r1(Math.sin(t * 5) * 6)})`);
        mug.stink.setAttribute('opacity', (0.6 + 0.4 * Math.sin(t * 7)).toFixed(2));
      }
    }, {});
  }

  // =====================================================================
  // BORBOLETA (enfeite do jardim)
  // =====================================================================
  function makeButterfly(parent, c1, c2) {
    const g = WB.mk('g', {}, parent);
    const wl = WB.mk('g', {}, g), wr = WB.mk('g', {}, g);
    put([{ d: ellipse(-26, -16, 26, 20), fill: c1, w: 4 }, { d: ellipse(-18, 14, 16, 13), fill: c2, w: 4 }], wl);
    put([{ d: ellipse(26, -16, 26, 20), fill: c1, w: 4 }, { d: ellipse(18, 14, 16, 13), fill: c2, w: 4 }], wr);
    put([{ d: 'M 0 -22 L 0 24', w: 7 }, { d: 'M 0 -22 q -8 -18 -16 -20 M 0 -22 q 8 -18 16 -20', w: 3 }], g);
    return (t, x, y, ph = 0) => {
      const k = 0.25 + 0.75 * Math.abs(Math.cos(t * 14 + ph));
      g.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 2 + ph) * 15)})`);
      wl.setAttribute('transform', `scale(${k.toFixed(2)} 1)`); wr.setAttribute('transform', `scale(${k.toFixed(2)} 1)`);
    };
  }

  // ---------------- câmera do bar: cena única filmada com zoom/panorâmica ----------------
  function camShot(wins, CAM) {
    const g = WB.mk('g', {}, WB.layer);
    const slide = WB.mk('g', {}, g);
    const cam = WB.mk('g', {}, slide);
    WB.effect(t => {
      const w = wins.find(([a, b]) => t >= a && t < b);
      if (!w) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      const [k, fx, fy] = CAM(t);
      cam.setAttribute('transform', `translate(540 950) scale(${k.toFixed(4)}) translate(${r1(-fx)} ${r1(-fy)})`);
      const u = w[0] === 0 ? 1 : eo(clamp((t - w[0]) / 0.3));
      slide.setAttribute('transform', `translate(${r1(140 * (1 - u))} 0)`);
      slide.setAttribute('opacity', (w[0] === 0 ? 1 : clamp((t - w[0]) / 0.18)).toFixed(3));
    });
    cont = cam;
    return cam;
  }
  function plainShot(wins) { return shot(wins, false); }

  // ---------------- título, legendas (faixa amarela) e crédito ----------------
  const CTA0 = 34.0, FIM_FALAS = 34.0;
  const C_BEE = '#7c3aed', C_MOS = '#1d4ed8', C_FLY = '#15803d';
  const titleG = WB.mk('g', {}, WB.overlay);
  {
    const a = 'O PERNILONGO ', b = 'SOMMELIER', size = 76;
    const tw = WB.measure(a + b, size);
    WB.showNow(WB.textStrokes(a, 540 - tw / 2, 196, size, C_MOS, titleG, 'start').strokes);
    WB.showNow(WB.textStrokes(b, 540 + tw / 2, 196, size, WINE, titleG, 'end').strokes);
    WB.showNow(WB.strokePath(WB.wavyLine(540 - tw / 2, 540 + tw / 2, 218, 6, 60), '#f59e0b', 6, titleG));
    WB.effect(t => titleG.setAttribute('opacity', t < CTA0 ? clamp(t / 0.3) : clamp(1 - (t - CTA0) / 0.3)));
  }
  const credit = WB.mk('g', {}, WB.overlay);
  WB.showNow(WB.textStrokes('animação original: @rafaellatuma', 540, 1720, 40, '#78716c', credit, 'middle').strokes);
  WB.effect(t => credit.setAttribute('opacity', t < CTA0 ? 0.9 : 0));
  const capLayer = WB.mk('g', {}, WB.overlay);
  const CAPS = [
    [0.35, 'HAHAHAHAHA!', C_BEE], [2.3, 'Por um minuto eu entendi...', C_BEE], [3.85, 'que cê falou que gostava de sangue de gente!', C_BEE],
    [7.75, 'Ué, é encorpado!', C_MOS], [9.85, 'Mas cê gosta porque cê nunca provou outra coisa?', C_BEE],
    [11.85, 'Cê já provou mel? Mel é docinho!', C_BEE], [13.4, 'Eu vou conseguir um mel pra você.', C_BEE],
    [14.7, 'Mas tem uns diabeticozinhos...', C_MOS], [16.25, 'que, óia... é docinho que é!', C_MOS], [18.15, ''],
    [18.35, 'Uhum.', C_BEE], [19.1, 'Eu tô achando que cê tá julgando meu estilo de vida.', C_MOS], [21.9, ''],
    [22.1, 'Não, mas é que... num mundo que tem flor, néctar, mel...', C_BEE],
    [24.9, 'Tanta coisa boa e cê vai escolher justo sangue de gente?', C_BEE],
    [27.95, 'Cê também não acha absurdo, mosca?', C_BEE], [29.6, ''],
    [30.75, 'Sei lá...', C_FLY], [32.35, 'Eu gosto de bosta.', C_FLY],
  ];
  CAPS.forEach(([t0, text, col], i) => {
    if (!text) return;
    const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : FIM_FALAS;
    const g = WB.mk('g', {}, capLayer);
    const size = 58, lh = 66;
    const lines = WB.wrap(text, size, 860);
    const w = Math.max(...lines.map(l => WB.measure(l, size))) + 64, h = lines.length * lh + 28, y0 = 262;
    WB.mk('rect', { x: r1(540 - w / 2), y: y0, width: r1(w), height: h, rx: 20, fill: '#ffe066', stroke: BK, 'stroke-width': 5 }, g);
    lines.forEach((l, k) => WB.showNow(WB.textStrokes(l, 540, y0 + 60 + k * lh, size, col, g, 'middle').strokes));
    const rot = i % 2 ? 1.2 : -1.2;
    WB.effect(t => {
      if (t < t0 || t >= t1) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      const k = backOut(clamp((t - t0) / 0.2)) * 0.1 + 0.9;
      g.setAttribute('transform', `translate(540 ${y0 + h / 2}) rotate(${rot}) scale(${k.toFixed(3)}) translate(-540 ${-(y0 + h / 2)})`);
    });
  });

  // =====================================================================
  // O BAR (cenário, bonecos e câmera)
  // =====================================================================
  const BAR_WINS = [[0, 7.7], [9.6, 14.7], [18.2, 22.85], [27.8, 999]];
  const E = 0.001;
  const CAM = K([
    [0, [1.0, 540, 1010]], [2.3, [1.0, 540, 1010]], [7.7, [1.2, 420, 1000]],
    [9.6, [1.2, 430, 1000], 'l'], [13.35, [1.2, 430, 1000]], [14.2, [1.3, 470, 985]], [14.7, [1.3, 470, 985]],
    [18.2, [1.36, 410, 990], 'l'], [22.85, [1.42, 405, 990]],
    [27.8, [1.3, 380, 1000], 'l'], [28.35, [1.3, 380, 1000]], [28.95, [1.3, 690, 1000]], [30.6 - E, [1.32, 700, 1000]],
    [30.6, [1.8, 815, 1070], 'l'], [33.0, [1.9, 800, 1060]], [CTA0 - E, [1.9, 800, 1060]],
    [CTA0, [0.82, 540, 1000], 'l'], [37.6, [0.86, 540, 1000]],
  ]);
  camShot(BAR_WINS, CAM);
  // parede de tijolinhos, letreiro e quadros
  {
    const bricks = [[120, 520], [205, 545], [880, 505], [965, 535], [400, 860], [80, 900], [165, 930], [930, 880], [1010, 905], [700, 860],
      [300, 600], [760, 610], [140, 700], [960, 720], [620, 940], [340, 960]];
    put(bricks.map(([x, y]) => ({ d: WB.roughRect(x - 38, y - 15, x + 38, y + 15), fill: '#eab48f', c: '#b9774f', w: 4 })));
    put([{ d: WB.roundRectPath(330, 600, 420, 92, 22), fill: '#fff1f5', c: '#db2777', w: 7 },
      { d: WB.roundRectPath(342, 612, 396, 68, 14), c: '#f9a8d4', w: 4 },
      T('BAR DO INSETO', 540, 663, 52, '#db2777'),
      { d: 'M 380 600 L 360 560 M 700 600 L 720 560', w: 5 }]);
    // quadro da esquerda: flor; da direita: gota de sangue com coração
    put([{ d: WB.roughRect(110, 650, 250, 790), fill: '#ecfccb', c: '#4d7c0f', w: 8 },
      { d: 'M 180 770 L 180 725', c: '#15803d', w: 5 }, circ(180, 715, 16, '#facc15', BK, 4),
      { d: ellipse(160, 715, 10, 7), fill: '#ffffff', w: 3 }, { d: ellipse(200, 715, 10, 7), fill: '#ffffff', w: 3 },
      { d: WB.roughRect(830, 650, 970, 790), fill: '#fee2e2', c: '#9f1239', w: 8 },
      { d: 'M 900 680 Q 940 730 924 752 Q 900 776 876 752 Q 860 730 900 680 Z', fill: '#dc2626', w: 5 },
      heart(900, 745, 0.25, '#ffffff')]);
    // lambri rosa e piso
    put([{ d: 'M 60 1000 L 1020 1000 L 1020 1240 L 60 1240 Z', fill: '#f6cfd3', w: 6 },
      { d: 'M 60 1024 L 1020 1024', w: 5 },
      { d: Array.from({ length: 16 }, (_, i) => `M ${120 + i * 60} 1030 L ${120 + i * 60} 1236`).join(' '), c: '#e8a5ad', w: 3 },
      { d: WB.roughLine(40, 1240, 1040, 1240, 2), w: 7 },
      { d: [-480, -300, -120, 60, 240, 420, 600].map(dx => `M ${540 + dx * 0.9} 1246 L ${540 + dx * 1.7} 1700`).join(' '), c: '#d6c7a8', w: 4 }]);
  }
  // pernilongo (atrás da mesa)
  const mosBar = makeMosquito(cont);
  const honeyOnTable = WB.mk('g', {}, cont);
  // mesa de carretel
  put([{ d: ellipse(540, 1450, 220, 38), fill: '#f3e3c3', w: 7 },
    { d: 'M 468 1188 L 468 1446 L 612 1446 L 612 1188 Z', fill: '#ecdcbc', w: 7 },
    { d: 'M 500 1200 L 500 1440 M 540 1200 L 540 1446 M 580 1200 L 580 1440', c: '#cdb48a', w: 4 },
    { d: 'M 236 1150 L 236 1176 Q 540 1244 844 1176 L 844 1150 Z', fill: '#e6cfa3', w: 7 },
    { d: ellipse(540, 1150, 304, 46), fill: '#f6e8cb', w: 7 },
    { d: ellipse(540, 1150, 200, 28), c: '#d6b98a', w: 3 }, { d: ellipse(540, 1150, 96, 13), c: '#d6b98a', w: 3 }]);
  put(caipi(392, 1162));
  {
    const hg = WB.mk('g', { transform: 'translate(452 1150)' }, honeyOnTable);
    honeyJar(hg, 0.78);
    WB.effect(t => show(honeyOnTable, t >= 18.2 && t < CTA0));
  }
  const stool = (x) => [{ d: `M ${x - 58} 1262 L ${x - 76} 1600 M ${x + 58} 1262 L ${x + 76} 1600 M ${x} 1270 L ${x} 1612`, w: 8 },
    { d: ellipse(x, 1480, 70, 12), w: 5 }, { d: ellipse(x, 1258, 84, 20), fill: '#ffffff', w: 7 }];
  put([stool(250), stool(840)]);
  const beeBar = makeBee(cont);
  const flyBar = makeFly(cont);
  // balões e enfeites do bar
  P(6.15, [...thought(250, 770, 150, 108, [[300, 900, 14], [282, 870, 20]]),
    circ(210, 730, 22, '#fde9d6'), { d: 'M 210 752 L 210 812 M 210 770 L 180 800 M 210 770 L 246 790 M 210 812 L 190 846 M 210 812 L 230 846', w: 6 },
    { d: 'M 252 784 L 300 740', c: '#ef4444', w: 7 }, { d: 'M 296 742 q 10 -4 8 8', c: '#ef4444', w: 5 },
    { d: 'M 250 800 q -8 14 0 20 q 8 -6 0 -20 Z', fill: '#dc2626', w: 3 },
    T('?!', 320, 722, 62, '#dc2626')], { until: 7.6, loop: 'float' });
  P(11.95, [...thought(240, 790, 120, 92, [[290, 910, 13], [272, 880, 18]])], { until: 13.3 });
  { const cg = WB.mk('g', {}, cont); const hg = WB.mk('g', { transform: 'translate(240 830)' }, cg); honeyJar(hg, 0.8); animate(cg, 12.05, { until: 13.3, loop: 'wiggle', ox: 240, oy: 790 }); }
  P(12.4, [heart(150, 900, 0.55, '#f472b6'), heart(360, 890, 0.45)], { loop: 'rise', until: 13.3 });
  P(13.55, [star(560, 860, 22), star(330, 960, 16, '#fde047')], { loop: 'pulse', until: 14.6 });
  P(19.25, [{ d: 'M 690 850 l 26 -18 M 700 880 l 32 -2 M 694 910 l 26 16', c: '#dc2626', w: 7 }], { loop: 'shake', until: 21.8 });
  TX(18.45, 'hmm...', 180, 900, 54, C_BEE, -8, { until: 19.05, loop: 'wiggle' });
  P(28.25, [{ d: 'M 560 950 L 690 990', c: '#dc2626', w: 7 }, { d: WB.arrowHead(690, 990, 0.3, 26), c: '#dc2626', w: 7 }], { until: 29.4 });
  TX(29.05, '?', 760, 900, 80, C_FLY, 8, { until: 30.5, loop: 'wiggle' });
  P(32.7, [heart(650, 900, 0.5, '#f472b6'), heart(930, 870, 0.4), heart(700, 820, 0.35)], { loop: 'rise', until: CTA0 });
  TX(34.25, 'ECA!', 250, 900, 84, '#65a30d', -10, { anim: 'slam', loop: 'tremble' });
  TX(34.45, 'ECA!', 700, 830, 70, '#65a30d', 8, { anim: 'slam', loop: 'tremble' });

  // ---- abelha no bar
  const BEE_MOOD = moodTrack(BEE_MOODS, [[0, 'laugh'], [2.2, 'talk'], [6.05, 'shock'], [7.4, 'talk'], [9.6, 'talk'], [11.85, 'dreamy'],
    [13.35, 'offer'], [18.2, 'neutral'], [18.35, 'skeptic'], [22.0, 'plead'], [27.8, 'angry'], [29.6, 'neutral'], [34.0, 'disgust']]);
  const BPOS = K([[0, [250, 1250]], [0.45, [250, 1250]], [1.0, [290, 1120], 'o'], [1.5, [325, 1070]], [1.95, [290, 1120]], [2.35, [250, 1250], 's'],
    [13.4, [250, 1250]], [13.75, [300, 1090], 'o'], [14.2, [418, 1085]], [18.2 - E, [418, 1085]], [18.2, [250, 1250], 'l']]);
  const BLEAN = K([[0, 0], [0.35, -16], [2.25, -12], [2.5, 0], [6.1, 4], [6.25, -10, 's'], [7.4, 0], [9.6, 0], [11.85, -4], [13.35, 0],
    [13.75, 12, 'o'], [14.2, 4], [18.2, 0, 'l'], [22.0, 4], [27.8, 8], [28.4, 10], [29.6, 2], [34.0, -8, 'o']]);
  const B_ARMS = K([
    [0, [-40, -62, 40, -70]], [2.3, [-40, -62, 40, -70]], [2.6, [-104, -48, 128, -132]],
    [3.6, [-104, -48, 128, -132]], [3.9, [-150, -150, 150, -170], 'b'], [5.2, [-150, -150, 150, -170]], [5.5, [-104, -48, 128, -132]],
    [6.05, [-104, -48, 128, -132]], [6.25, [-120, -200, 178, -150], 'b'], [7.4, [-120, -200, 178, -150]],
    [9.6, [-104, -48, 128, -132], 'l'], [9.95, [-104, -48, 128, -132]], [10.2, [-150, -160, 160, -170], 'b'], [11.7, [-150, -160, 160, -170]],
    [11.95, [-20, -150, 30, -158]], [13.3, [-20, -150, 30, -158]], [13.6, [60, -120, 170, -140], 'b'], [14.7, [60, -120, 170, -140]],
    [18.2, [-104, -48, 128, -132], 'l'], [18.4, [16, -90, -16, -80], 'b'], [21.95, [16, -90, -16, -80]], [22.25, [-140, -200, 150, -210], 'b'],
    [22.85, [-140, -200, 150, -210]],
    [27.8, [-104, -48, 128, -132], 'l'], [28.1, [-104, -48, 194, -150], 'b'], [29.5, [-104, -48, 194, -150]], [29.9, [-104, -48, 128, -132]],
    [34.0, [-104, -48, 128, -132], 'l'], [34.2, [-20, -100, 30, -104], 'b']]);
  WB.effect(t => {
    if (!inWin(BAR_WINS, t)) return;
    const [x, y] = BPOS(t), fly = y < 1244 ? 1 : 0;
    const laughing = t < 2.3, m = BEE_MOOD(t);
    const a = B_ARMS(t);
    const shake = laughing ? Math.sin(t * 22) * 4 : 0;
    const hover = fly ? Math.sin(t * 6) * 8 : 0;
    const v = talk(BEE_WIN, t);
    beeBar(t, {
      x, y: y + hover - (laughing ? Math.abs(Math.sin(t * 11)) * 10 : 0), s: 0.95, f: 1, lean: BLEAN(t) + shake + (fly ? Math.sin(t * 3) * 3 : 0),
      fly, m, L: [a[0], a[1]], R: [a[2], a[3]], op: laughing ? Math.max(0.55, v) : v + (t >= 34 ? 0.2 : 0),
      holdR: t >= 13.55 && t < 14.7 ? 'honey' : null, honeyK: backOut(clamp((t - 13.55) / 0.3)), antK: fly || laughing ? 1 : 0, sweat: t >= 22 && t < 22.85,
    });
  });
  // ---- pernilongo no bar
  const MOS_MOOD = moodTrack(MOS_MOODS, [[0, 'sleepy'], [2.3, 'smug'], [4.3, 'sniff'], [5.5, 'smug'], [6.3, 'sideeye'], [7.6, 'smug'],
    [9.6, 'smug'], [10.1, 'sideeye'], [13.6, 'startle'], [14.05, 'push'], [18.2, 'smug'], [19.05, 'offended'], [22.0, 'sideeye'],
    [27.8, 'sideeye'], [28.6, 'lookfly'], [34.0, 'disgust']]);
  const M_ARMS = K([
    [0, [-70, -40, 100, -170]], [4.2, [-70, -40, 100, -170]], [4.5, [-70, -40, 82, -121]], [5.4, [-70, -40, 82, -121]], [5.7, [-70, -40, 100, -170]],
    [13.6, [-70, -40, 100, -170]], [14.0, [-130, -230, 110, -150], 'b'], [14.7, [-130, -230, 110, -150]],
    [18.2, [-70, -40, 100, -170], 'l'], [19.1, [-70, -40, 100, -170]], [19.4, [6, -214, 124, -222], 'b'], [21.8, [6, -214, 124, -222]], [22.1, [-70, -40, 100, -170]],
    [34.0, [-70, -40, 100, -170], 'l'], [34.25, [-8, -282, 100, -150], 'b']]);
  const M_PA = K([[0, 38], [4.2, 38], [4.5, 62], [5.4, 62], [5.7, 38], [19.1, 38], [19.4, 6], [21.8, 6], [22.1, 38], [34, 38], [34.25, 60]]);
  const M_HEAD = K([[0, 0], [6.3, 0], [6.5, -6], [7.6, 0], [13.6, 0], [14.0, 10, 'b'], [14.7, 10], [18.2, 0, 'l'], [19.1, 0], [19.4, -12, 'b'], [21.8, -12], [22.1, 0],
    [28.6, 0], [28.9, 6], [34, 0], [34.3, 8]]);
  const M_LEAN = K([[0, 0], [13.6, 0], [14.0, 10, 'b'], [14.7, 10], [18.2, 0, 'l'], [19.1, 0], [19.4, -5], [21.8, -5], [22.1, 0], [34, 0], [34.3, 6]]);
  WB.effect(t => {
    if (!inWin(BAR_WINS, t)) return;
    const a = M_ARMS(t), sip = t > 4.5 && t < 5.4;
    mosBar(t, {
      x: 548, y: 1185, s: 1, f: 1, lean: M_LEAN(t) + Math.sin(t * 1.6) * 1.2, m: MOS_MOOD(t), headRot: M_HEAD(t),
      L: [a[0], a[1]], R: [a[2] + (t > 19.4 && t < 21.8 ? Math.sin(t * 9) * 8 : 0), a[3]], pa: M_PA(t), op: talk(MOS_WIN, t),
      wine: sip ? 0.55 - 0.25 * clamp((t - 4.5) / 0.9) : (t > 5.4 && t < 18.2 ? 0.3 : 0.55), slosh: Math.sin(t * 4) * 3,
    });
  });
  // ---- mosca no bar
  const FLY_MOOD = moodTrack(FLY_MOODS, [[0, 'sleepy'], [6.2, 'bored'], [7.6, 'sleepy'], [29.15, 'up'], [30.6, 'up'], [30.85, 'shrug'],
    [32.35, 'love']]);
  const F_ARMS = K([[0, [-70, -60, 104, -92]], [30.85, [-70, -60, 104, -92]], [31.1, [-140, -200, 104, -92], 'b'], [32.0, [-140, -200, 104, -92]],
    [32.35, [-70, -60, 104, -92]], [32.7, [-70, -60, 118, -178], 'b']]);
  const F_HEAD = K([[0, 0], [29.15, 0], [29.35, -8, 's'], [30.85, -8], [31.1, 10, 'b'], [32.0, 10], [32.35, -4], [33.2, 4]]);
  WB.effect(t => {
    if (!inWin(BAR_WINS, t)) return;
    const a = F_ARMS(t);
    const nod = t < 29 ? Math.sin(t * 1.3) * 3 : 0;
    flyBar(t, {
      x: 840, y: 1250, s: 0.95, f: -1, lean: nod + (t > 30.85 && t < 32 ? 4 : 0), m: FLY_MOOD(t), headRot: F_HEAD(t) + nod,
      L: [a[0] + (t < 29 ? Math.sin(t * 9) * 5 : 0), a[1]], R: [a[2], a[3]], op: talk(FLY_WIN, t),
      poop: t >= 32.6 ? backOut(clamp((t - 32.6) / 0.45)) : 0, mugRot: t >= 32.6 ? -8 : 0,
    });
  });

  // =====================================================================
  // CORTE 1 — "Ué, é encorpado!": vinho Cabernet Sanguíneo na taça do pernilongo sommelier
  // =====================================================================
  const S_WINE = [[7.7, 9.6]];
  plainShot(S_WINE);
  P(7.8, [star(840, 1250, 26), star(180, 700, 20, '#fde047'), star(900, 900, 16)], { loop: 'pulse' });
  const mosW = makeMosquito(cont, { glassK: 1.25 });
  const bottle = WB.mk('g', {}, cont);
  put([{ d: 'M -18 -260 L -18 -170 Q -72 -150 -72 -90 L -72 210 Q -72 236 -46 236 L 46 236 Q 72 236 72 210 L 72 -90 Q 72 -150 18 -170 L 18 -260 Z', fill: '#4c1d2b', w: 7 },
    { d: 'M -20 -262 L 20 -262 L 20 -232 L -20 -232 Z', fill: '#be123c', w: 5 },
    { d: WB.roundRectPath(-60, -30, 120, 170, 10), fill: '#fff7ed', w: 5 },
    T('CABERNET', 0, 10, 30, WINE), T('SANGUÍNEO', 0, 50, 30, WINE),
    { d: 'M 0 72 Q 18 96 12 108 Q 0 122 -12 108 Q -18 96 0 72 Z', fill: '#dc2626', w: 3 }, T('tipo O+', 0, 132, 24, '#78716c'),
    { d: 'M -50 -120 Q -56 0 -50 180', c: '#9f8a90', w: 6 }], bottle);
  const stream = dyn(cont, { stroke: WINE, 'stroke-width': 14 });
  const MW_ARMS = K([[7.7, [-70, -40, 150, -170]], [8.6, [-70, -40, 150, -170]], [9.0, [-70, -40, 120, -150]]]);
  WB.effect(t => {
    if (!inWin(S_WINE, t)) return;
    const a = MW_ARMS(t);
    const swirl = t > 8.6 ? 1 : 0;
    const R = [a[2] + swirl * Math.cos(t * 12) * 12, a[3] + swirl * Math.sin(t * 12) * 8];
    const fill = clamp((t - 7.95) / 1.0) * 0.75;
    const mp = { x: 300, y: 1830, s: 1.55, f: 1, lean: 0, m: t < 8.25 ? MOS_MOODS.smug : MOS_MOODS.sniff, headRot: t > 8.4 ? -6 : 0,
      L: [-70, -40], R, pa: t > 8.4 ? 20 : 40, op: talk(MOS_WIN, t), wine: fill, slosh: swirl * Math.sin(t * 12) * 4 };
    mosW(t, mp);
    // boca da taça (para o fio de vinho cair dentro)
    const w = toWorld(mp);
    const rim = w(R[0], R[1] - 100 * 1.25);
    // garrafa entra pela direita e inclina para servir
    const u = eo(clamp((t - 7.7) / 0.45)), tilt = lerp(-160, -112, eio(clamp((t - 7.7) / 0.5))) + (t > 9.2 ? 30 * eio(clamp((t - 9.2) / 0.3)) : 0);
    const mx = rim[0] + 50 + 400 * (1 - u), my = rim[1] - 360;
    bottle.setAttribute('transform', `translate(${r1(mx)} ${r1(my)}) rotate(${r1(tilt)}) translate(0 262)`);
    const pouring = t > 7.95 && t < 9.25;
    stream.setAttribute('d', pouring ? `M ${r1(mx - 6)} ${r1(my + 4)} Q ${r1(mx - 40 + Math.sin(t * 20) * 4)} ${r1(my + 160)} ${r1(rim[0] + 6)} ${r1(rim[1] + 30)}` : '');
  });

  // =====================================================================
  // CORTE 2 — "Mas tem uns diabeticozinhos que, óia, é docinho que é!": a carta de vinhos de sangue
  // =====================================================================
  const S_BOT = [[14.7, 18.2]];
  plainShot(S_BOT);
  put([{ d: 'M 40 1330 L 1040 1330 L 1040 1370 L 40 1370 Z', fill: '#d6b98a', w: 7 },
    { d: 'M 90 1370 L 90 1640 M 990 1370 L 990 1640', w: 8 },
    { d: 'M 70 1350 L 1010 1350', c: '#b08b5a', w: 3 }]);
  const bottleSpec = (body, label, l1, l2, c, w = 1) => [
    { d: `M -16 -420 L -16 -320 Q ${-70 * w} -300 ${-70 * w} -240 L ${-70 * w} -16 Q ${-70 * w} 0 ${-52 * w} 0 L ${52 * w} 0 Q ${70 * w} 0 ${70 * w} -16 L ${70 * w} -240 Q ${70 * w} -300 16 -320 L 16 -420 Z`, fill: body, w: 7 },
    { d: WB.roundRectPath(-58 * w, -230, 116 * w, 150, 10), fill: label, w: 5 }, T(l1, 0, -180, 26, c), T(l2, 0, -138, 26, c)];
  P(14.8, bottleSpec('#365314', '#ecfccb', 'SANGUE', 'A+ seco', '#365314'), { anim: 'fly', fx: 600, fr: 20, ox: 0, oy: 0, parent: WB.mk('g', { transform: 'translate(210 1330)' }, cont) });
  P(15.05, bottleSpec('#a16207', '#fef9c3', 'SANGUE', 'O- rosé', '#a16207'), { anim: 'fly', fx: 600, fr: 20, ox: 0, oy: 0, parent: WB.mk('g', { transform: 'translate(870 1330)' }, cont) });
  const bigB = WB.mk('g', { transform: 'translate(540 1330) scale(1.3)' }, cont);
  P(15.4, [...bottleSpec('#7f1d1d', '#fff1f2', 'DIABÉTICO', 'docinho', '#be123c', 1.1),
    { d: 'M -18 -420 L 18 -420 L 18 -380 Q 10 -360 4 -380 Q -4 -350 -10 -380 Q -16 -366 -18 -380 Z', fill: '#f9a8d4', w: 4 },
    { d: WB.roundRectPath(-50, -64, 34, 30, 4), fill: '#ffffff', w: 4 }, { d: WB.roundRectPath(10, -60, 34, 30, 4), fill: '#ffffff', w: 4 }],
  { anim: 'slam', parent: bigB });
  P(15.5, [star(380, 760, 30), star(720, 720, 24, '#fde047'), star(790, 960, 20), star(300, 980, 18)], { loop: 'pulse' });
  stamp(15.6, 'safra glicose 300', 540, 1450, 46, '#be123c', -4, { anim: 'slam' });
  const mosB = makeMosquito(cont, { noGlass: true });
  P(16.95, [{ d: 'M 640 1450 l -40 -30 M 630 1490 l -52 -6 M 640 1530 l -40 20', c: '#f59e0b', w: 7 }, star(600, 1400, 22)], { until: 17.5 });
  P(17.0, [heart(560, 1300, 0.6, '#f472b6'), heart(420, 1420, 0.45), heart(700, 1250, 0.4)], { loop: 'rise' });
  const MB_POS = K([[14.7, [980, 2200]], [16.05, [980, 2200]], [16.4, [930, 1960], 'b']]);
  const MB_R = K([[16.0, [80, -240]], [16.35, [80, -240]], [16.5, [0, -274]], [16.75, [0, -274]], [16.95, [170, -330], 'b']]);
  WB.effect(t => {
    if (!inWin(S_BOT, t)) return;
    const [x, y] = MB_POS(t);
    mosB(t, { x, y, s: 1.45, f: -1, lean: -4 + Math.sin(t * 2) * 2, m: t > 16.75 ? MOS_MOODS.dreamy : MOS_MOODS.smug,
      headRot: t > 16.75 ? -8 : 0, L: [-70, -40], R: MB_R(t), pa: 50, op: talk(MOS_WIN, t) });
  });

  // =====================================================================
  // CORTE 3 — "num mundo que tem flor, néctar, mel... cê vai escolher justo sangue de gente?": o jardim da abelha
  // =====================================================================
  const S_GAR = [[22.85, 27.8]];
  plainShot(S_GAR);
  {
    const RB = ['#fca5a5', '#fdba74', '#fde68a', '#bbf7d0', '#bfdbfe', '#ddd6fe'];
    put(RB.map((c, i) => ({ d: WB.arcPath(980, 1080, 560 - i * 30, 560 - i * 30, Math.PI, Math.PI * 1.5, 40), c, w: 30 })));
    put([cloud(160, 1240, 210, 120, '#c7e8b0'), cloud(930, 1220, 230, 130, '#c7e8b0'), cloud(540, 1330, 520, 110, '#b5dd9b'),
      { d: 'M 40 1380 L 1040 1380', c: '#86b06a', w: 5 }]);
    const flower = (x, y, r, c) => {
      const out = [];
      for (let i = 0; i < 5; i++) { const a = i * 72 * DEG; out.push({ d: ellipse(r1(x + Math.cos(a) * r), r1(y + Math.sin(a) * r), r * 0.75, r * 0.75), fill: c, w: 4 }); }
      out.push(circ(x, y, r * 0.6, '#facc15', BK, 4));
      return out;
    };
    put([flower(130, 1450, 24, '#f9a8d4'), flower(940, 1480, 26, '#93c5fd'), flower(250, 1560, 20, '#fde68a'), flower(820, 1600, 22, '#f9a8d4'),
      flower(120, 1100, 18, '#c4b5fd'), flower(980, 1060, 20, '#fde68a')]);
    // margaridona
    const daisy = [{ d: 'M 540 1700 Q 520 1500 540 1300', c: '#15803d', w: 14 },
      { d: 'M 534 1520 Q 460 1470 420 1500 Q 470 1540 534 1530 Z', fill: '#86efac', w: 5 }];
    for (let i = 0; i < 14; i++) {
      const a = i * (360 / 14) * DEG;
      daisy.push({ d: `M 540 1260 Q ${r1(540 + Math.cos(a - 0.25) * 110)} ${r1(1260 + Math.sin(a - 0.25) * 110 * 0.6)} ${r1(540 + Math.cos(a) * 150)} ${r1(1260 + Math.sin(a) * 150 * 0.6)} Q ${r1(540 + Math.cos(a + 0.25) * 110)} ${r1(1260 + Math.sin(a + 0.25) * 110 * 0.6)} 540 1260 Z`, fill: '#ffffff', w: 5 });
    }
    daisy.push({ d: ellipse(540, 1260, 56, 36), fill: '#facc15', w: 5 });
    put(daisy);
  }
  P(24.35, [{ d: 'M 470 1220 q -6 -20 6 -30 M 610 1214 q 8 -20 -4 -32', c: '#f59e0b', w: 6 }, star(470, 1170, 16), star(620, 1160, 14, '#fde047')], { loop: 'pulse', until: 25.0 });
  const bfA = makeButterfly(cont, '#93c5fd', '#c4b5fd'), bfB = makeButterfly(cont, '#f9a8d4', '#fde68a');
  const beeG = makeBee(cont);
  stamp(26.75, 'SÉRIO?!', 540, 1560, 84, '#dc2626', -6, { anim: 'slam' });
  const G_POS = K([[22.85, [-120, 820]], [23.6, [520, 1235], 'o'], [24.75, [520, 1235]], [25.3, [820, 760], 'io'], [25.8, [300, 700]], [26.25, [540, 900]],
    [26.9, [540, 1010], 'o']]);
  const G_S = K([[22.85, 0.55], [26.25, 0.55], [26.9, 1.25, 'b']]);
  const G_MOOD = moodTrack(BEE_MOODS, [[22.85, 'talk'], [23.6, 'dreamy'], [25.0, 'offer'], [26.2, 'angry']]);
  const G_ARMS = K([[22.85, [-150, -150, 150, -160]], [23.6, [-150, -150, 150, -160]], [23.9, [-30, -140, 40, -150]], [24.7, [-30, -140, 40, -150]],
    [24.95, [-100, -60, 150, -170], 'b'], [26.2, [-100, -60, 150, -170]], [26.45, [-60, -80, 172, -150], 'b']]);
  WB.effect(t => {
    if (!inWin(S_GAR, t)) return;
    bfA(t, 200 + 160 * Math.sin(t * 0.9), 820 + 80 * Math.sin(t * 1.7), 0);
    bfB(t, 860 + 120 * Math.sin(t * 1.1 + 2), 980 + 70 * Math.cos(t * 1.5), 1.3);
    const [x, y] = G_POS(t), a = G_ARMS(t), perch = t > 23.6 && t < 24.75;
    const loop = t > 25.0 && t < 26.25 ? (t - 25.0) / 1.25 * 360 : 0;
    beeG(t, { x, y: y + (perch ? 0 : Math.sin(t * 6) * 10), s: G_S(t), f: t > 25.3 && t < 25.8 ? -1 : 1, lean: (perch ? 0 : 8) + (loop ? Math.sin(loop * DEG) * 14 : 0),
      fly: perch ? 0 : 1, m: G_MOOD(t), L: [a[0], a[1]], R: [a[2], a[3]], op: talk(BEE_WIN, t), antK: 1,
      holdR: t > 24.85 && t < 26.25 ? 'honey' : null, honeyK: backOut(clamp((t - 24.85) / 0.3)) });
  });

  // =====================================================================
  // CTA (34–fim): chamada por cima do bar, todo mundo com nojo da mosca feliz
  // =====================================================================
  {
    const g = WB.mk('g', {}, WB.overlay);
    WB.mk('rect', { x: 120, y: 380, width: 840, height: 300, rx: 30, fill: '#fffdf5', stroke: BK, 'stroke-width': 6 }, g);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 480, 92, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(170, 530, 120, g, 9);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@caderno_amarelo', 320, 530 + 120 * 0.66, 76, BK, g).strokes);
    WB.effect(t => {
      if (t < CTA0 + 0.1) { g.setAttribute('opacity', 0); return; }
      const u = backOut(clamp((t - CTA0 - 0.1) / 0.4));
      g.setAttribute('opacity', clamp((t - CTA0 - 0.1) / 0.15).toFixed(2));
      g.setAttribute('transform', `translate(540 530) rotate(${r1(-1.5 + Math.sin(t * 2) * 0.8)}) scale(${(0.9 + 0.1 * u).toFixed(3)}) translate(-540 -530)`);
    });
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
    const SPOTS = [[290, 1610], [790, 470], [790, 1610], [290, 470]];
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
