// Meme "Zé Carlos, cadê tu?" (áudio original de @camillailustra no TikTok).
// Só a voz do vídeo original: as imagens foram descartadas e as cenas foram criadas a partir das falas.
// A mãe liga do supermercado; o Zé Carlos, já em casa no sofá, jura que não deve satisfação... até ela perguntar
// com quem ele foi ao mercado. Ele esqueceu a mãe lá.
// Formato de cenas no papel do caderno: cortes com deslize, faixa amarela de legenda (texto rosa = mãe, amarelo = Zé)
// e bonecos articulados (makePerson dos memes "Mobi" e "vestígio"): o Zé (camiseta verde, bermuda, óculos redondos)
// e a mãe (coque, óculos, vestido coral, bolsa). A marca d'água @cardeno_amarelo passeia por 4 cantos seguros.
// Risada de plateia no final.
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
  const ENV = '000079999999999999999999610000000000000000000000000002674017898630000000000000000000678888766554421000000005767705044079864510553000000000000000000000000000000004306876502789975665556248610598765200000000727468781678756653200000000000000000001478768846877778627614668887357241867643840645576775765486116765676235376720377605567766650000000000006058678502650047777556655555431047777654310000000000000000000000000000000000000000000134100000000333521000332445787767677758761888777617886675430115476776848375155135202220200000000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  // duas vozes: a mãe (no mercado) e o Zé Carlos (em casa)
  const M_WIN = [[2.55, 3.35], [5.25, 6.55], [10.15, 11.2], [17.15, 19.25]];
  const Z_WIN = [[4.05, 5.0], [7.95, 9.8], [12.05, 16.65], [22.7, 24.65]];
  const talk = (wins, t, k = 1.25) => {
    for (const [a, b] of wins) if (t >= a && t <= b) return clamp(envAt(t) * k) * clamp((b - t) / 0.06) * clamp((t - a) / 0.04);
    return 0;
  };

  // ---------------- cenas: corte com deslize; cada cena tem zoom próprio e uma camada de textos sem zoom ----------------
  let ov = null;
  function shot(wins, zk = 1.25, zx = 540, zy = 1200) {
    const cid = 'clip' + (UID++);
    const cp = WB.mk('clipPath', { id: cid }, WB.layer);
    WB.mk('rect', { x: 0, y: 245, width: 1080, height: 1675 }, cp);
    const g = WB.mk('g', { 'clip-path': `url(#${cid})` }, WB.layer);
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
  // Zé Carlos: rapaz magro, cabelo bagunçado, óculos redondos, camiseta verde-oliva, bermuda jeans e chinelo
  const ZE = { kind: 'man', thigh: 94, shin: 92, torso: 190, neck: 14, R: 86, up: 82, fo: 80, shW: 54, hipW: 26, legW: 22, armW: 15,
    skin: '#f1c7a1', shirt: '#6b8e3a', pants: '#1d4ed8', shoe: '#facc15', hair: '#3b2414', trim: '#3f5f1f', shorts: true, glasses: '#1f2937', noBeard: true };
  // mãe: coque, óculos, vestido coral, bolsa marrom a tiracolo
  const MAE = { kind: 'woman', thigh: 88, shin: 90, torso: 184, neck: 14, R: 86, up: 78, fo: 76, shW: 52, hipW: 28, legW: 20, armW: 15,
    skin: '#f0bf98', shirt: '#f0776a', pants: '#f0776a', shoe: '#7c2d12', hair: '#5b3417', trim: '#fde2d8', bun: true, glasses: '#7c2d12' };
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
    yell: { lid: 0, pr: 0.8, bi: 16, bo: -10, smile: -10 },
    rage: { lid: 0.35, pr: 0.6, bi: 20, bo: -14, smile: -12 },
    frozen: { lid: 0, pr: 0.32, bi: -20, bo: -14, smile: -6, sweat: 1 },
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
        : (woman && !B.bun ? WB.mk('path', { d: `M ${-R * 1.0} ${-R * 0.3} Q ${-R * 1.18} ${-R * 1.2} 0 ${-R * 1.14} Q ${R * 1.18} ${-R * 1.2} ${R * 1.0} ${-R * 0.3} Q ${R * 1.2} ${R * 0.9} ${R * 1.12} ${R * 1.75} Q ${R * 0.6} ${R * 1.95} 0 ${R * 1.8} Q ${-R * 0.6} ${R * 1.95} ${-R * 1.12} ${R * 1.75} Q ${-R * 1.2} ${R * 0.9} ${-R * 1.0} ${-R * 0.3} Z`, fill: B.hair, stroke: BK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, upper) : null));
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
    if (B.bun) WB.mk('path', { d: WB.cloudPath(R * 0.1, -R * 1.18, R * 0.46, R * 0.38, 9), fill: B.hair, stroke: BK, 'stroke-width': 6 }, head);
    if (woman) [-1, 1].forEach(sd => WB.mk('circle', { cx: sd * R * 0.93, cy: R * 0.32, r: 9, fill: '#fde047', stroke: BK, 'stroke-width': 3 }, head));
    if (!kid && !woman && !B.noBeard) {
      // barba por fazer
      WB.mk('path', { d: `M ${-R * 0.84} ${R * 0.12} Q ${-R * 0.7} ${R * 0.92} 0 ${R * 0.94} Q ${R * 0.7} ${R * 0.92} ${R * 0.84} ${R * 0.12} Q ${R * 0.5} ${R * 0.5} ${R * 0.26} ${R * 0.36} Q 0 ${R * 0.3} ${-R * 0.26} ${R * 0.36} Q ${-R * 0.5} ${R * 0.5} ${-R * 0.84} ${R * 0.12} Z`, fill: B.beard || '#8b6b55', opacity: B.beard ? 1 : 0.28 }, head);
    }
    const blush = WB.mk('g', { opacity: kid ? 0.55 : 0 }, head);
    WB.mk('path', { d: ellipse(-R * 0.6, R * 0.36, 15, 9), fill: '#fb7185' }, blush); WB.mk('path', { d: ellipse(R * 0.6, R * 0.36, 15, 9), fill: '#fb7185' }, blush);
    const rage = WB.mk('path', { d: `M ${-R * 0.88} ${-R * 0.3} Q ${-R * 0.9} ${-R} 0 ${-R} Q ${R * 0.9} ${-R} ${R * 0.88} ${-R * 0.3} Q ${R * 0.92} ${R * 0.62} 0 ${R * 0.98} Q ${-R * 0.92} ${R * 0.62} ${-R * 0.88} ${-R * 0.3} Z`, fill: '#ef4444', opacity: 0 }, head);
    const ex = R * (kid ? 0.38 : 0.36), ey = kid ? R * 0.04 : -R * 0.1, erx = R * (kid ? 0.24 : 0.19), ery = R * (kid ? 0.29 : 0.24);
    const eyeL = makeEye(head, -ex, ey, erx, ery, B.skin, { prx: erx * (kid ? 0.42 : 0.36), browW: kid ? 5 : 8, browC: kid ? B.hair : '#2a1a10' });
    const eyeR = makeEye(head, ex, ey, erx, ery, B.skin, { prx: erx * (kid ? 0.42 : 0.36), browW: kid ? 5 : 8, browC: kid ? B.hair : '#2a1a10' });
    if (kid || woman) dyn(head, { d: `M ${-ex - erx - 4} ${ey - ery * 0.5} l -12 -8 M ${-ex - erx + 2} ${ey - ery * 0.8} l -10 -12 M ${ex + erx + 4} ${ey - ery * 0.5} l 12 -8 M ${ex + erx - 2} ${ey - ery * 0.8} l 10 -12`, 'stroke-width': 4 });
    if (B.glasses) {
      WB.mk('path', { d: WB.circlePath(-ex, ey, erx + 12) + ' ' + WB.circlePath(ex, ey, erx + 12), fill: 'none', stroke: B.glasses, 'stroke-width': 6 }, head);
      dyn(head, { d: `M ${r1(-ex + erx + 12)} ${r1(ey - 4)} Q 0 ${r1(ey - 16)} ${r1(ex - erx - 12)} ${r1(ey - 4)} M ${r1(-ex - erx - 12)} ${r1(ey - 6)} L ${r1(-R * 0.92)} ${r1(ey - 12)} M ${r1(ex + erx + 12)} ${r1(ey - 6)} L ${r1(R * 0.92)} ${r1(ey - 12)}`, stroke: B.glasses, 'stroke-width': 5 });
    }
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
        rage.setAttribute('opacity', ((st.rage || 0) * 0.45).toFixed(2));
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

  // ---------------- objetos do meme ----------------
  // sacola de papel com verdura e baguete; alça presa na mão (0,0), corpo pendurado embaixo
  const sacola = (c = '#d6a46b', o = {}) => [
    { d: 'M -30 30 Q -30 0 0 0 Q 30 0 30 30', c: '#7c4a1e', w: 6 },
    { d: 'M -20 20 l -14 -60 M 6 18 l 10 -70', c: '#16a34a', w: 12 },
    { d: WB.cloudPath(-20, 18, 30, 18, 7), fill: '#4ade80', c: '#15803d', w: 4 },
    { d: 'M 18 30 L 40 -50', c: '#d97706', w: 20 },
    { d: 'M -62 30 L 62 30 L 54 170 L -54 170 Z', fill: c, w: 6 },
    { d: 'M -40 70 L 40 70', c: '#7c4a1e', w: 4, op: 0.6 },
    ...(o.logo ? [T('$', 0, 140, 56, '#15803d')] : []),
  ];
  // sacola apoiada no chão (base em y=0)
  const sacolaChao = (c) => [{ d: 'M -62 -170 L 62 -170 L 54 0 L -54 0 Z', fill: c, w: 6 },
    { d: 'M -30 -170 Q -30 -200 0 -200 Q 30 -200 30 -170', c: '#7c4a1e', w: 6 },
    { d: WB.cloudPath(-14, -176, 40, 22, 8), fill: '#4ade80', c: '#15803d', w: 4 }, { d: 'M 20 -170 L 44 -250', c: '#d97706', w: 20 },
    { d: 'M -40 -120 L 40 -120', c: '#7c4a1e', w: 4, op: 0.6 }];
  const celular = () => [box(-17, -42, 34, 66, 7, '#1f2937', null, 5), box(-11, -34, 22, 44, 3, '#93c5fd', 'none', 2)];
  function carrinho(x, y, s = 1, cheio = true) {
    const P = (dx, dy) => `${r1(x + dx * s)} ${r1(y + dy * s)}`;
    const out = [];
    if (cheio) out.push({ d: WB.cloudPath(x - 10 * s, y - 210 * s, 120 * s, 50 * s, 10), fill: '#fde68a', c: BK, w: 5 },
      box(x - 100 * s, y - 290 * s, 60 * s, 90 * s, 6, '#ef4444', null, 5), box(x - 20 * s, y - 310 * s, 50 * s, 110 * s, 6, '#3b82f6', null, 5),
      box(x + 40 * s, y - 270 * s, 70 * s, 70 * s, 6, '#22c55e', null, 5), { d: WB.cloudPath(x + 70 * s, y - 280 * s, 30 * s, 26 * s, 7), fill: '#f97316', w: 4 });
    out.push({ d: `M ${P(-150, -220)} L ${P(130, -220)} L ${P(100, -90)} L ${P(-120, -90)} Z`, fill: '#e5e7eb', w: 6, fo: 0.85 },
      { d: `M ${P(-120, -220)} L ${P(-100, -90)} M ${P(-60, -220)} L ${P(-50, -90)} M ${P(0, -220)} L ${P(0, -90)} M ${P(60, -220)} L ${P(50, -90)} M ${P(-140, -175)} L ${P(120, -175)} M ${P(-130, -132)} L ${P(110, -132)}`, c: '#9ca3af', w: 4 },
      { d: `M ${P(130, -220)} L ${P(170, -260)} L ${P(200, -260)}`, w: 8 }, { d: `M ${P(-120, -90)} L ${P(-110, -30)} L ${P(100, -30)} L ${P(100, -90)}`, w: 6 },
      circ(x - 100 * s, y - 14 * s, 14 * s, '#374151', null, 5), circ(x + 90 * s, y - 14 * s, 14 * s, '#374151', null, 5));
    return out;
  }
  const pipoca = () => [{ d: WB.cloudPath(0, -96, 64, 30, 9), fill: '#fef9c3', w: 5 }, { d: 'M -56 -90 L 56 -90 L 44 0 L -44 0 Z', fill: '#ffffff', w: 6 },
    { d: 'M -30 -90 L -24 0 M 0 -90 L 0 0 M 30 -90 L 24 0', c: '#ef4444', w: 12 }, { d: 'M -56 -90 L 56 -90 L 44 0 L -44 0 Z', c: BK, w: 6 }];
  const ursinho = () => [circ(-34, -98, 18, '#a16207', null, 5), circ(34, -98, 18, '#a16207', null, 5), circ(0, -70, 44, '#ca8a04', null, 6),
    { d: ellipse(0, 10, 50, 56), fill: '#ca8a04', w: 6 }, { d: ellipse(0, 18, 28, 32), fill: '#fde68a', c: 'none' },
    circ(-15, -78, 6, BK, 'none'), circ(15, -78, 6, BK, 'none'), { d: ellipse(0, -58, 14, 10), fill: '#fde68a', w: 4 }, circ(0, -62, 5, BK, 'none'),
    { d: WB.roundRectPath(-30, -36, 60, 14, 6), fill: '#ef4444', w: 4 }];
  const chinelo = () => [{ d: ellipse(0, 0, 44, 18), fill: '#facc15', w: 5 }, { d: 'M -14 -10 L 6 4 L 22 -12', c: '#1d4ed8', w: 7 }];
  const sorvete = () => [box(-50, -80, 100, 80, 10, '#fce7f3', null, 6), { d: 'M -56 -80 L 56 -80', c: '#db2777', w: 10 }, T('SORVETE', 0, -30, 26, '#be185d')];
  const poca = () => [{ d: ellipse(0, 0, 90, 18), fill: '#f9a8d4', c: '#db2777', w: 4 }];
  const capim = () => [circ(0, 0, 54, 'none', '#a16207', 5), { d: 'M -40 -20 Q 0 40 40 -20 M -44 18 Q 0 -40 44 18 M -10 -50 Q 30 0 -10 50 M 14 -50 Q -30 0 14 50 M -50 0 Q 0 -10 50 0', c: '#a16207', w: 4 }];
  const speech = (x, y) => [{ d: `M ${x} ${y} q 30 -30 0 -60 M ${x + 26} ${y + 14} q 50 -44 0 -88 M ${x + 52} ${y + 28} q 70 -58 0 -116`, c: INK.red, w: 7 }];

  // ---------------- cenários ----------------
  // casa do Zé: sala com porta, quadro de coração, sofá e TV
  function sofa(x, y = FL) {
    return [box(x - 230, y - 260, 460, 150, 40, '#e0a8a0', null, 7), box(x - 260, y - 160, 520, 110, 30, '#f4c2bb', null, 7),
      box(x - 290, y - 230, 70, 190, 30, '#e0a8a0', null, 7), box(x + 220, y - 230, 70, 190, 30, '#e0a8a0', null, 7),
      { d: `M ${x - 240} ${y - 50} L ${x - 240} ${y} M ${x + 240} ${y - 50} L ${x + 240} ${y}`, c: '#7c4a1e', w: 12 }];
  }
  const tv = (x, y) => [box(x - 110, y - 160, 220, 140, 10, '#1f2937', null, 7), box(x - 96, y - 148, 192, 116, 6, '#60a5fa', 'none', 2),
    { d: `M ${x - 60} ${y - 20} L ${x - 80} ${y + 30} M ${x + 60} ${y - 20} L ${x + 80} ${y + 30}`, w: 6 }];
  const quadro = (x, y) => [box(x - 70, y - 80, 140, 160, 8, '#ffffff', '#7c4a1e', 9), heart(x, y + 10, 0.9, '#f87171')];
  function casa(o = {}) {
    const out = [...sala({ janela: o.janela ?? false, lampada: o.lampada ?? false, lx: o.lx, jx: o.jx, planta: o.planta })];
    if (o.quadro !== false) out.push(...quadro(o.qx ?? 260, 760));
    if (o.porta) out.push(...porta(o.porta), ...portaFolha(o.porta));
    if (o.tv) out.push(...tv(o.tv, 1000));
    if (o.sofa) out.push(...sofa(o.sofa));
    return out;
  }
  // supermercado: letreiro vermelho, porta de vidro com prateleiras, carrinhos e faixa amarela no chão
  function mercado(o = {}) {
    const out = [
      { d: `M 60 470 L 1020 470 L 1020 ${FL} L 60 ${FL} Z`, fill: '#e7e5e4', c: 'none', fo: 0.95 },
      { d: `M 60 ${FL} L 1020 ${FL} L 1020 1700 L 60 1700 Z`, fill: '#d6d3d1', c: 'none', fo: 0.9 },
      { d: WB.roughLine(60, FL, 1020, FL, 2), w: 7 },
      { d: `M 60 ${FL + 90} L 1020 ${FL + 60}`, c: '#facc15', w: 22 },
      { d: `M 200 ${FL} L 150 1700 M 420 ${FL} L 400 1700 M 640 ${FL} L 660 1700 M 860 ${FL} L 910 1700`, c: '#a8a29e', w: 3 },
      box(90, 520, 900, 140, 14, '#dc2626', null, 8),
      T('SUPERMERCADO', 540, 622, 92, '#ffffff'),
      box(250, 720, 580, FL - 720, 8, '#bae6fd', '#4b5563', 10),
      { d: `M 540 720 L 540 ${FL}`, c: '#4b5563', w: 8 },
    ];
    [[300, 820, '#ef4444'], [400, 820, '#f59e0b'], [600, 820, '#22c55e'], [700, 820, '#a855f7'], [300, 960, '#3b82f6'], [420, 960, '#ec4899'], [600, 960, '#f97316'], [720, 960, '#14b8a6']]
      .forEach(([x, y, c]) => out.push(box(x - 36, y, 72, 90, 6, c, null, 4)));
    out.push({ d: `M 260 910 L 820 910 M 260 1050 L 820 1050`, c: '#6b7280', w: 7 });
    if (o.carrinhos !== false) out.push(...carrinho(150, FL, 0.6, false), ...carrinho(185, FL, 0.6, false));
    if (o.planta !== false) out.push({ d: `M 900 ${FL} L 890 ${FL - 120} L 1000 ${FL - 120} L 990 ${FL} Z`, fill: '#a8a29e', w: 6 },
      { d: `M 945 ${FL - 120} q -50 -110 -100 -150 M 945 ${FL - 120} q 10 -150 -10 -220 M 945 ${FL - 120} q 50 -100 70 -150`, c: '#15803d', w: 12 });
    return out;
  }
  // placa ABERTO/FECHADO pendurada na porta
  function placa(x, y) {
    const g = WB.mk('g', {}, cont);
    const a = WB.mk('g', {}, g), b = WB.mk('g', {}, g);
    put([box(x - 90, y - 34, 180, 68, 10, '#dcfce7', '#15803d', 6), T('ABERTO', x, y + 16, 44, '#15803d')], a);
    put([box(x - 90, y - 34, 180, 68, 10, '#fee2e2', INK.red, 6), T('FECHADO', x, y + 16, 44, INK.red)], b);
    put([{ d: `M ${x - 50} ${y - 34} L ${x} ${y - 80} L ${x + 50} ${y - 34}`, w: 4 }], g);
    return u => { const k = Math.cos(Math.PI * u); a.setAttribute('opacity', k > 0 ? 1 : 0); b.setAttribute('opacity', k > 0 ? 0 : 1);
      g.setAttribute('transform', `translate(${x} 0) scale(${r1(Math.max(0.04, Math.abs(k)) * 1000) / 1000} 1) translate(${-x} 0)`); };
  }
  // relógio com ponteiro que gira (pos x,y; vel volta/s)
  function relogio(x, y, r, vel, t0) {
    put([circ(x, y, r, '#ffffff', null, 8), circ(x, y, 6, BK, 'none')]);
    const pm = dyn(cont, { 'stroke-width': 8 }), ph = dyn(cont, { 'stroke-width': 10 });
    return t => {
      const a = (t - t0) * vel * Math.PI * 2 - Math.PI / 2, b = (t - t0) * vel / 12 * Math.PI * 2 - Math.PI / 3;
      pm.setAttribute('d', `M ${x} ${y} L ${r1(x + Math.cos(a) * r * 0.8)} ${r1(y + Math.sin(a) * r * 0.8)}`);
      ph.setAttribute('d', `M ${x} ${y} L ${r1(x + Math.cos(b) * r * 0.5)} ${r1(y + Math.sin(b) * r * 0.5)}`);
    };
  }
  // pilha de sacolas no chão em volta da mãe
  const PILHA = [[300, '#d6a46b'], [395, '#fca5a5'], [690, '#d6a46b'], [790, '#93c5fd'], [345, '#fde68a', 1], [740, '#c4b5fd', 1]];
  function pilha(shake) {
    return PILHA.map(([x, c, top]) => {
      const h = holder(sacolaChao(c));
      return (t, k = 0) => h(x + (shake ? Math.sin(t * 50 + x) * 5 * k : 0), top ? FL - 150 : FL + 10, top ? (x < 540 ? -8 : 8) : 0, top ? 0.85 : 1, 1);
    });
  }

  const CTA0 = 25.6;

  // ---------------- título + legenda (faixa amarela = Zé; faixa rosa = mãe) ----------------
  const titleG = WB.mk('g', {}, WB.overlay);
  {
    const a = 'ZÉ CARLOS, ', b = 'CADÊ TU?', size0 = 84;
    const size = Math.min(size0, Math.floor(size0 * 960 / WB.measure(a + b, size0)));
    const tw = WB.measure(a + b, size), x0 = 540 - tw / 2;
    WB.showNow(WB.textStrokes(a, x0, 200, size, BK, titleG, 'start').strokes);
    WB.showNow(WB.textStrokes(b, x0 + WB.measure(a, size), 200, size, INK.red, titleG, 'start').strokes);
    WB.showNow(WB.strokePath(WB.wavyLine(x0, x0 + tw, 222, 6, 60), '#f59e0b', 6, titleG));
    WB.effect(t => titleG.setAttribute('opacity', t < CTA0 ? clamp(t / 0.3) : clamp(1 - (t - CTA0) / 0.3)));
  }
  const capLayer = WB.mk('g', {}, WB.overlay);
  const ZC = 0, MA = 1;
  const CAPS = [
    [2.55, 'ZÉ CARLOS...', MA], [4.05, 'Oi, mãe!', ZC], [5.25, 'Onde é que tu tá, Zé Carlos?', MA], [7.0, ''],
    [7.95, 'Eu tô em casa, mãe.', ZC], [9.25, 'Por quê?', ZC], [10.15, 'E tu tava pra onde??', MA], [11.6, ''],
    [12.05, 'Mãe, eu tava no mercado...', ZC], [13.35, 'mas não preciso tá dando satisfação da minha vida pra senhora não!', ZC],
    [15.5, 'Sou mais uma criança não, mãe...', ZC], [17.15, 'E tu veio com quem, ANIMAL?', MA], [19.4, ''],
    [22.7, 'Valha meu Deus...', ZC], [23.65, 'Tô indo! Tô indo!', ZC], [25.0, ''],
  ];
  CAPS.forEach(([t0, text, who], i) => {
    if (!text) return;
    const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : CTA0;
    const g = WB.mk('g', {}, capLayer);
    const size = 56, lh = 64;
    const lines = WB.wrap(text, size, 860);
    const w = Math.max(...lines.map(l => WB.measure(l, size))) + 64, h = lines.length * lh + 28, y0 = 262;
    WB.mk('rect', { x: r1(540 - w / 2), y: y0, width: r1(w), height: h, rx: 20, fill: who === MA ? '#fce7f3' : '#ffe066', stroke: BK, 'stroke-width': 5 }, g);
    lines.forEach((l, k) => WB.showNow(WB.textStrokes(l, 540, y0 + 58 + k * lh, size, who === MA ? '#be185d' : BK, g, 'middle').strokes));
    const rot = i % 2 ? 1.2 : -1.2;
    WB.effect(t => {
      if (t < t0 || t >= t1) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      const k = backOut(clamp((t - t0) / 0.2)) * 0.1 + 0.9;
      g.setAttribute('transform', `translate(540 ${y0 + h / 2}) rotate(${rot}) scale(${k.toFixed(3)}) translate(-540 ${-(y0 + h / 2)})`);
    });
  });
  // poses base
  const ze = (o) => Object.assign({ y: FL, s: 1, f: 1, seed: 0.3 }, o);
  const ma = (o) => Object.assign({ y: FL, s: 1, f: 1, seed: 1.7 }, o);
  const opZ = t => talk(Z_WIN, t, 1.25), opM = t => talk(M_WIN, t, 1.3);
  const EAR = [96, -272];   // mão no ouvido (celular), coordenadas do quadril
  const newZe = (p) => makePerson(p || cont, ZE), newMae = (p) => makePerson(p || cont, MAE);
  const comCelular = (r) => { put(celular(), WB.mk('g', { transform: 'rotate(-20)' }, r.itemR)); return r; };
  const comSacola = (r, c) => { put(sacola(c), r.itemL); return r; };

  // =====================================================================
  // CENA 1 (0–2,55): o Zé chega em casa todo feliz girando a chave; o celular vibra no bolso
  // =====================================================================
  const S1 = [[0, 2.55]];
  shot(S1, 1.12, 540, 1250);
  put(casa({ porta: 880, quadro: true, qx: 240, lampada: true, lx: 520 }));
  {
    const z = newZe();
    const ph = WB.mk('g', {}, z.itemR); put(celular(), ph);
    const keys = WB.mk('g', {}, z.itemL);
    put([circ(0, 30, 16, 'none', '#9ca3af', 5), { d: 'M 0 46 L 0 90 M 0 70 L 12 70 M 0 84 L 12 84', c: '#9ca3af', w: 7 }], keys);
    const ZX = K([[0, 900], [1.4, 520, 'o']]), Zo = odo(ZX, -0.1, 2.6);
    WB.effect(t => {
      if (!inWin(S1, t)) return;
      const got = t > 1.45;
      keys.setAttribute('transform', `rotate(${r1(t * 900)})`);
      ph.setAttribute('opacity', got ? 1 : 0);
      z.update(t, Object.assign(ze({ x: ZX(t), mood: got ? MOODS.confused : MOODS.joy, look: got ? 6 : -6, hop: got ? 0 : Math.abs(Math.sin(t * 7)) * 10,
        L: [-130, -150], R: got ? EAR : [110 + Math.sin(t * 60) * (t > 0.2 && t < 1.25 ? 6 : 0), -40], rotR: got ? -20 : 0 }), Zo(t)));
    });
  }
  O(0.1, [...note(300, 760, 1, '#7c3aed'), ...note(740, 720, 0.8, '#2563eb')], { loop: 'rise', until: 1.3 });
  ostamp(0.25, 'BZZZ!', 760, 1130, 64, '#7c3aed', 8, { loop: 'tremble', until: 1.3 });

  // =====================================================================
  // CENA 2 (2,55–4,05): a mãe no supermercado, cercada de sacolas, berrando no celular
  // =====================================================================
  const S2 = [[2.55, 4.05]];
  shot(S2, 1.12, 540, 1250);
  put(mercado());
  {
    const pl = pilha(true);
    const m = comSacola(comCelular(newMae()), '#fca5a5');
    WB.effect(t => {
      if (!inWin(S2, t)) return;
      const op = opM(t);
      pl.forEach(f => f(t, op));
      m.update(t, ma({ x: 540, mood: MOODS.yell, op, L: [-100, -40], R: EAR, rotR: -20, lean: -4, headRot: Math.sin(t * 30) * 2 * op, rage: 0.3 }));
    });
  }
  O(2.6, speech(640, 1010), { loop: 'pulse' });
  ostamp(2.8, 'ZÉ CARLOS!!!', 540, 820, 84, INK.red, -5, { loop: 'shake' });

  // =====================================================================
  // CENA 3 (4,05–5,25): o Zé esparramado no sofá com pipoca e TV: "Oi, mãe!"
  // =====================================================================
  const S3 = [[4.05, 5.25]];
  shot(S3, 1.12, 540, 1250);
  put(casa({ tv: 200, sofa: 600, qx: 860 }));
  {
    const z = comCelular(newZe());
    const pip = holder(pipoca());
    WB.effect(t => {
      if (!inWin(S3, t)) return;
      z.update(t, ze({ x: 620, sit: 1, seatH: 150, mood: MOODS.joy, op: opZ(t), L: [-40 + Math.sin(t * 9) * 10, -60], R: EAR, rotR: -20, lean: -10, headRot: 6 }));
      pip(620, FL - 160, 0, 1, 1);
    });
  }
  O(4.2, [heart(360, 800, 0.9), heart(840, 760, 0.7, '#f472b6')], { loop: 'rise' });
  OT(4.6, 'de boa!', 860, 900, 66, '#16a34a', 8, { loop: 'wiggle' });

  // =====================================================================
  // CENA 4 (5,25–7,95): a mãe esperando: relógio voando, sorvete derretendo, pé batendo
  // =====================================================================
  const S4 = [[5.25, 7.95]];
  shot(S4, 1.12, 540, 1250);
  put(mercado({ carrinhos: false }));
  {
    const clock = relogio(870, 760, 70, 3, 5.25);
    const pl = pilha(false);
    const sv = holder(sorvete()), pc = holder(poca());
    const m = comSacola(comCelular(newMae()), '#d6a46b');
    WB.effect(t => {
      if (!inWin(S4, t)) return;
      clock(t);
      pl.forEach(f => f(t));
      const u = clamp((t - 5.25) / 2.6);
      pc(180, FL + 40, 0, 0.3 + 1.2 * u, 1);
      sv(180, FL + 30, 0, 1 - 0.45 * u, 1);
      const tap = Math.max(0, Math.sin(t * 14)) * 22;
      m.update(t, ma({ x: 540, mood: t > 6.6 ? MOODS.stern : MOODS.squint, op: opM(t), L: [-100, -40], R: EAR, rotR: -20, rage: 0.15,
        footT: [null, [MAE.hipW + 30, MAE.thigh + MAE.shin - 6 - tap]] }));
    });
  }
  OT(5.6, 'tic tac', 870, 900, 52, BK, -6, { loop: 'wiggle' });
  ostamp(6.7, 'ESPERANDO...', 540, 1650, 76, '#b45309', -4, { loop: 'pulse' });
  OT(7.0, 'derretendo!', 230, 1260, 48, '#db2777', -8, { loop: 'wiggle' });

  // =====================================================================
  // CENA 5 (7,95–10,15): o Zé "lar doce lar" no sofá... "por quê?" (dá de ombros)
  // =====================================================================
  const S5 = [[7.95, 10.15]];
  shot(S5, 1.12, 540, 1250);
  put(casa({ tv: 880, sofa: 480, quadro: false }));
  put([box(240, 690, 480, 120, 14, '#fff7ed', '#c2410c', 7), T('LAR DOCE LAR', 480, 772, 64, '#c2410c'), heart(240, 700, 0.5), heart(720, 700, 0.5)]);
  {
    const z = comCelular(newZe());
    const pip = holder(pipoca());
    const ch = holder(chinelo());
    WB.effect(t => {
      if (!inWin(S5, t)) return;
      const why = t > 9.25;
      z.update(t, ze({ x: 480, sit: 1, seatH: 150, mood: why ? MOODS.confused : MOODS.proud, op: opZ(t), lean: -14,
        L: why ? [-170, -230] : [-140, -150], R: why ? [150, -240] : EAR, rotR: why ? 0 : -20, headRot: why ? -8 : 4 }));
      pip(380, FL - 175, -12, 0.85, 1);
      ch(700, FL + 40, 20, 1, 1);
    });
  }
  O(8.3, [{ d: WB.cloudPath(880, 860, 60, 26, 8), c: '#d1d5db', w: 5 }], { loop: 'rise' });
  OT(9.35, '?', 760, 860, 140, '#2563eb', 12, { loop: 'wiggle' });

  // =====================================================================
  // CENA 6 (10,15–12,05): close na mãe, olho apertado: "e tu tava pra onde??"
  // =====================================================================
  const S6 = [[10.15, 12.05]];
  shot(S6, 2.0, 540, 1150);
  put(mercado({ carrinhos: false, planta: false }));
  {
    const m = comCelular(newMae());
    WB.effect(t => {
      if (!inWin(S6, t)) return;
      m.update(t, ma({ x: 540, mood: MOODS.squint, op: opM(t), R: EAR, rotR: -20, headRot: -6 + Math.sin(t * 3) * 2, lean: 4, look: 8, rage: 0.2 }));
    });
  }
  [[200, 10.3, -14], [880, 10.5, 12], [160, 10.9, 8], [920, 11.2, -10]].forEach(([x, bt, r], i) => OT(bt, '?', x, 760 + i * 230, 150, i % 2 ? INK.red : '#2563eb', r, { anim: 'fly', fy: -400, loop: 'wiggle' }));

  // =====================================================================
  // CENA 7 (12,05–17,15): o Zé sobe no sofá, "adulto independente"... de ursinho no braço
  // =====================================================================
  const S7 = [[12.05, 17.15]];
  shot(S7, 1.12, 540, 1200);
  put(casa({ sofa: 380, quadro: false }));
  {
    const z = comCelular(newZe());
    const urso = WB.mk('g', { opacity: 0 }, z.itemL); put(ursinho(), WB.mk('g', { transform: 'translate(10 40) scale(0.8)' }, urso));
    WB.effect(t => {
      if (!inWin(S7, t)) return;
      const rebel = t > 13.35, baby = t > 15.5;
      urso.setAttribute('opacity', baby ? 1 : 0);
      const wag = Math.sin(t * 16) * 30;
      z.update(t, ze({ x: 360, y: FL - 150, mood: baby ? MOODS.innocent : (rebel ? MOODS.proud : MOODS.happy), op: opZ(t),
        L: baby ? [-70, -60] : (rebel ? [-80, -40] : [-130, -150]), R: rebel && !baby ? [150 + wag * 0.4, -400 + wag * 0.3] : EAR, rotR: rebel && !baby ? -60 : -20,
        headRot: rebel ? -10 : 0, lean: rebel ? -6 : 0, hop: baby ? Math.abs(Math.sin(t * 6)) * 12 : 0 }));
    });
  }
  O(12.15, [...thought(780, 760, 190, 120, [[560, 880, 14], [600, 840, 20]]), ...carrinho(780, 840, 0.55, true)], { until: 13.3 });
  OT(12.4, 'mercado!', 780, 960, 60, '#15803d', -6, { until: 13.3 });
  ostamp(13.6, 'SATISFAÇÃO?', 760, 720, 64, INK.red, -4, { until: 15.45 });
  ostamp(14.3, 'JAMAIS!', 780, 860, 80, BK, 6, { loop: 'shake', until: 15.45 });
  ostamp(15.6, 'ADULTO', 770, 700, 70, '#2563eb', -3, { loop: 'pulse' });
  ostamp(15.75, 'INDEPENDENTE', 770, 830, 56, '#2563eb', 3, { loop: 'pulse' });
  OT(16.2, '(de ursinho)', 770, 980, 56, '#b45309', 4, { loop: 'wiggle' });

  // =====================================================================
  // CENA 8 (17,15–19,4): a mãe explode: vermelha, fumaça, sacolas tremendo: "ANIMAL!"
  // =====================================================================
  const S8 = [[17.15, 19.4]];
  shot(S8, 1.3, 540, 1200);
  put(mercado());
  {
    const pl = pilha(true);
    const m = comSacola(comCelular(newMae()), '#fca5a5');
    WB.effect(t => {
      if (!inWin(S8, t)) return;
      const k = clamp((t - 17.2) / 1.2);
      pl.forEach(f => f(t, 0.5 + k));
      m.update(t, ma({ x: 540, mood: t > 18.4 ? MOODS.yell : MOODS.rage, op: opM(t), L: [-100, -40], R: EAR, rotR: -20, rage: 0.4 + 0.6 * k, steam: k,
        headRot: Math.sin(t * 45) * 3 * k, hop: t > 18.4 ? Math.abs(Math.sin(t * 12)) * 16 : 0 }));
    });
  }
  OT(17.4, 'COM QUEM?', 230, 760, 62, '#be185d', -8, { loop: 'wiggle' });
  ostamp(18.45, 'ANIMAL!!!', 540, 1650, 120, INK.red, -6, { loop: 'shake' });

  // =====================================================================
  // CENA 9 (19,4–20,45): o Zé congela; a pipoca cai; lembrança: ele e a mãe entrando juntos no mercado
  // =====================================================================
  const S9 = [[19.4, 20.45]];
  shot(S9, 1.12, 540, 1250);
  put(casa({ tv: 200, sofa: 600, qx: 860 }));
  {
    const z = comCelular(newZe());
    const pip = holder(pipoca());
    WB.effect(t => {
      if (!inWin(S9, t)) return;
      z.update(t, ze({ x: 620, sit: 1, seatH: 150, mood: MOODS.frozen, frozen: true, L: [-40, -60], R: EAR, rotR: -20 }));
      const u = clamp((t - 19.7) / 0.35);
      pip(620 + 60 * u, FL - 160 + 170 * ei(u), 80 * u, 1, 1);
    });
  }
  O(19.6, [...thought(600, 700, 300, 170, [[700, 940, 16], [670, 890, 24]]), T('mais cedo...', 600, 600, 46, '#6b7280')]);
  {
    // mini lembrança: o Zé empurrando o carrinho, a mãe do lado, os dois entrando no mercado
    const g = WB.mk('g', {}, ov);
    const mz = makePerson(g, ZE), mm = makePerson(g, MAE);
    put(carrinho(650, 790, 0.32, false), g);
    WB.effect(t => {
      g.setAttribute('opacity', inWin(S9, t) ? clamp((t - 19.65) / 0.2) : 0);
      if (!inWin(S9, t)) return;
      mz.update(t, { x: 560, y: 790, s: 0.3, f: 1, seed: 0.3, mood: MOODS.joy, R: [140, -170], L: [130, -160] });
      mm.update(t, { x: 450, y: 790, s: 0.3, f: 1, seed: 1.7, mood: MOODS.happy, R: [100, -200] });
    });
  }
  OT(20.0, 'GLUP', 900, 1050, 56, '#2563eb', 10);

  // =====================================================================
  // CENA 10 (20,45–21,65): a mãe sozinha no mercado; anoitece, capim rolando, placa vira FECHADO
  // =====================================================================
  const S10 = [[20.45, 21.65]];
  shot(S10, 1.12, 540, 1250);
  put(mercado());
  {
    const fl = placa(700, 1100);
    const pl = pilha(false);
    const m = comSacola(newMae(), '#d6a46b');
    const cp = holder(capim());
    const dusk = WB.mk('rect', { x: 0, y: 0, width: 1080, height: 1920, fill: '#7c2d12', opacity: 0 }, cont);
    WB.effect(t => {
      if (!inWin(S10, t)) return;
      fl(clamp((t - 20.9) / 0.3));
      pl.forEach(f => f(t));
      m.update(t, ma({ x: 480, mood: MOODS.blank, L: [-100, -40], R: [90, -40], frozen: false }));
      const cx = lerp(-80, 1160, (t - 20.45) / 1.2);
      cp(cx, FL + 10 + -Math.abs(Math.sin(t * 8)) * 40, t * 600, 1, 1);
      dusk.setAttribute('opacity', (0.32 * clamp((t - 20.45) / 0.8)).toFixed(3));
    });
  }
  OT(20.6, 'cri... cri...', 300, 800, 76, BK, -6, { loop: 'wiggle' });

  // =====================================================================
  // CENA 11 (21,65–22,7): close no Zé, suando: ESQUECEU A MÃE NO MERCADO!
  // =====================================================================
  const S11 = [[21.65, 22.7]];
  shot(S11, 2.0, 540, 1080);
  put(casa({ quadro: true, qx: 300, sofa: 540 }));
  {
    const z = comCelular(newZe());
    WB.effect(t => {
      if (!inWin(S11, t)) return;
      z.update(t, ze({ x: 540, sit: 1, seatH: 150, mood: MOODS.frozen, R: EAR, rotR: -20, headRot: Math.sin(t * 50) * 2.5, frozen: true }));
    });
  }
  ostamp(21.75, 'ESQUECEU A MÃE', 540, 1440, 82, INK.red, -4, { loop: 'shake' });
  ostamp(22.0, 'NO MERCADO!!!', 540, 1580, 82, INK.red, 3, { loop: 'shake' });

  // =====================================================================
  // CENA 12 (22,7–23,65): "Valha meu Deus!" mãos na cabeça, pulando
  // =====================================================================
  const S12 = [[22.7, 23.65]];
  shot(S12, 1.12, 540, 1250);
  put(casa({ sofa: 300, porta: 880, qx: 560 }));
  {
    const z = newZe();
    WB.effect(t => {
      if (!inWin(S12, t)) return;
      z.update(t, ze({ x: 560, mood: MOODS.horror, op: opZ(t), L: [-70, -340], R: [70, -340], hop: Math.abs(Math.sin(t * 10)) * 26, headRot: Math.sin(t * 20) * 4 }));
    });
  }
  ostamp(22.8, 'VALHA!', 290, 760, 100, '#7c3aed', -6, { loop: 'shake' });

  // =====================================================================
  // CENA 13 (23,65–24,75): o Zé dispara porta afora, um chinelo voa
  // =====================================================================
  const S13 = [[23.65, 24.75]];
  shot(S13, 1.12, 540, 1250);
  put(casa({ sofa: 300, porta: 880, qx: 560 }));
  {
    const z = newZe();
    const ch = holder(chinelo());
    const ZX = K([[23.65, 360], [24.5, 1260, 'i']]), Zo = odo(ZX, 23.6, 24.8);
    WB.effect(t => {
      if (!inWin(S13, t)) return;
      z.update(t, Object.assign(ze({ x: ZX(t), mood: MOODS.horror, op: opZ(t), lean: 20, lift: 50, L: [-150, -200], R: [150, -120] }), Zo(t)));
      const u = clamp((t - 23.85) / 0.6);
      ch(lerp(420, 140, u), FL - 40 - Math.sin(Math.PI * u) * 420, u * 900, 1, 1);
    });
  }
  O(23.8, [speedLines(560, 1100, 300), { d: WB.cloudPath(420, FL - 10, 70, 30, 8), fill: '#e7e5e4', c: '#a8a29e', w: 4 }], { loop: 'float' });
  ostamp(23.75, 'TÔ INDO!!!', 540, 1650, 92, '#16a34a', -5, { loop: 'shake' });

  // =====================================================================
  // CENA 14 (24,75–25,6): chega derrapando no mercado; a mãe de braços cruzados
  // =====================================================================
  const S14 = [[24.75, CTA0]];
  shot(S14, 1.12, 540, 1250);
  put(mercado());
  {
    const pl = pilha(false);
    const m = newMae(), z = newZe();
    const ZX = K([[24.75, -200], [25.2, 330, 'o']]), Zo = odo(ZX, 24.7, 25.7);
    WB.effect(t => {
      if (!inWin(S14, t)) return;
      pl.forEach(f => f(t));
      m.update(t, ma({ x: 700, f: -1, mood: MOODS.stern, rage: 0.5, L: [40, -150], R: [-40, -150], look: -10 }));
      const arrived = t > 25.2;
      z.update(t, Object.assign(ze({ x: ZX(t), mood: arrived ? MOODS.innocent : MOODS.horror, lean: arrived ? -8 : 20, L: arrived ? [-60, -60] : [-150, -200], R: arrived ? [120, -230] : [150, -120],
        sweat: 1 }), Zo(t)));
    });
  }
  O(24.85, [speedLines(200, 1150, 260)]);
  ostamp(25.2, 'OI, MAINHA!', 540, 1650, 72, '#2563eb', -4, { loop: 'pulse' });

  // =====================================================================
  // CTA (25,6–fim): o Zé carregando TODAS as sacolas, a mãe na frente
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
    const zc = makePerson(cont, ZE), mc = makePerson(cont, MAE);
    put(sacola('#fca5a5'), zc.itemL); put(sacola('#93c5fd'), zc.itemR);
    const extra = holder([...sacolaChao('#d6a46b')]);
    WB.effect(t => {
      if (t < CTA0) return;
      zc.update(t, { x: 690, y: 1600, s: 0.8, f: -1, seed: 0.3, mood: MOODS.sad, L: [-110, -40], R: [110, -40], hop: Math.abs(Math.sin(t * 7)) * 8, lean: 6 });
      extra(690 + 6, 1172 - Math.abs(Math.sin(t * 7)) * 6.4, Math.sin(t * 7) * 4, 0.7, 1);
      mc.update(t, { x: 360, y: 1600, s: 0.8, f: 1, seed: 1.7, mood: MOODS.proud, L: [-80, -60], R: [70, -60], look: 12, headRot: -6 });
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
