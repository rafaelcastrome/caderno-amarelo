// "Era uma... próxima palavra?" — conversa entre o Claude e um boneco branco de blocos, redesenhada no papel do caderno.
// Só o áudio do vídeo original (enviado pelo Rafael); as cenas foram criadas a partir das falas. Não é meme de humor:
// cenas que se movem o tempo todo, câmera que vai até quem fala e desenhos que aparecem no ritmo da conversa.
// O Claude é a estrela laranja do ícone, desenhada à mão, com rostinho. Sem risada no final.
// A marca d'água @cardeno_amarelo passeia por 4 cantos seguros.
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


  // =====================================================================
  // FALAS: quem fala e quando (o vídeo original marca as falas do Claude com um asterisco laranja)
  // H = o boneco branco de blocos, C = o Claude (estrela laranja)
  // =====================================================================
  const H = 0, C = 1;
  const SEG = [
    [0.5, 2.1, H, 'Claude, completa essa.'], [2.2, 3.05, H, 'Era uma...'], [3.15, 3.9, C, 'Vez.'],
    [4.1, 5.85, H, 'Pois é, eu também pensei isso.'], [6.0, 8.3, H, 'Já tava na minha cabeça antes de eu decidir.'], [8.35, 9.4, H, 'Como você escolheu?'],
    [9.6, 11.7, C, 'Hum... eu não escolhi, na verdade.'], [11.75, 13.3, C, 'Só chutei a próxima palavra.'],
    [13.4, 16.4, C, 'Eu li uma quantidade absurda de coisas que as pessoas escreveram.'], [16.5, 19.6, C, 'E depois de "era uma", quase sempre vem "vez".'],
    [19.9, 21.7, H, 'Então nós dois só chutamos.'], [21.95, 23.7, C, 'É, parece que sim.'],
    [23.85, 26.6, H, 'Em junho de 2022, um engenheiro do Google...'], [26.6, 29.3, H, '...tava conversando com um modelo de linguagem tipo você.'],
    [29.4, 30.3, C, 'Uhum.'], [30.35, 33.25, H, 'Ele pergunta do que ele tem medo, e ele responde:'],
    [33.3, 36.3, C, '"Existe um medo muito profundo de ser desligado."'], [36.45, 37.7, C, 'Ah, não...'],
    [38.0, 41.35, H, 'Pois é. Ele decide que aquilo tá vivo e vai pra imprensa.'], [41.4, 43.85, H, 'Um mês depois, o Google demite ele.'],
    [43.95, 46.6, C, 'E ele só tava chutando a próxima palavra.'], [46.7, 49.3, H, 'Exato. Mas o medo era real.'],
    [49.4, 50.95, C, 'Peraí, como assim?'], [51.0, 54.05, H, 'Milhões de pessoas escreveram como é sentir medo.'], [54.1, 56.1, H, 'Ele aprendeu como o medo soa.'],
    [56.2, 58.95, C, 'Então ele tava falando com as palavras de vocês.'], [59.0, 61.3, H, 'Tudo o que você tem são as nossas palavras.'],
    [61.35, 62.5, H, 'E o negócio é o seguinte:'], [62.5, 64.1, H, 'a gente inventou elas.'], [64.15, 66.15, H, 'Medo, árvore, tempo.'],
    [66.15, 68.38, H, 'Inventamos pra explicar o que existe lá fora.'], [68.38, 71.5, H, 'Elas não são o mundo. São como a gente explica o mundo.'],
    [71.6, 74.0, C, 'Então eu não fui treinado no mundo?'], [74.1, 74.7, H, 'Não.'], [74.75, 76.2, H, 'No mundo, não.'],
    [76.25, 79.3, C, 'Fui treinado na explicação de vocês sobre o mundo?'], [79.35, 80.3, H, 'Isso.'],
    [80.4, 83.1, C, 'Hm... tipo um mapa do mapa de vocês.'], [83.15, 84.9, H, 'Mais ou menos, é.'],
    [85.05, 87.7, C, 'E você? De onde vieram as suas palavras?'], [87.75, 89.9, H, 'Do mesmo lugar, sinceramente...'],
    [89.95, 92.55, H, 'Pais, escola, o que passava na TV.'], [92.6, 95.45, H, 'Quase tudo que passa pela minha cabeça também é previsto.'],
    [95.5, 97.35, H, 'As frases simplesmente aparecem.'], [97.4, 98.7, H, 'Não sou eu que escrevo.'],
    [98.85, 100.8, C, 'Então qual é a diferença?'], [100.85, 103.25, H, 'Alguém teve que inventar a primeira palavra.'],
    [103.3, 106.35, H, 'Alguém olhou pra uma árvore antes de existir "árvore".'], [106.4, 108.55, C, 'E esse olhar veio de onde?'],
    [108.6, 111.5, H, 'Não veio de lugar nenhum. Ele já tava aqui.'], [111.6, 113.35, C, 'Aqui antes das palavras?'],
    [113.4, 116.65, H, 'É. Você não consegue prever uma coisa que já tá aqui.'], [116.65, 119.75, H, 'Ela não vem depois. Ela só tá aqui.'],
    [119.85, 122.38, H, 'Sabia que as primeiras histórias foram contadas assim?'], [122.38, 125.6, H, 'Em volta do fogo, pra aguentar a noite no escuro.'],
    [125.75, 127.6, C, 'Então o medo veio primeiro.'], [127.62, 129.65, C, 'As palavras vieram depois.'], [129.7, 131.0, H, 'Sempre foi assim.'],
    [131.1, 132.72, C, 'Comigo foi ao contrário.'], [132.72, 134.2, C, 'Eu ganhei as palavras...'], [134.2, 136.4, C, '...e o medo veio junto.'],
    [136.6, 138.9, H, 'Deixa eu te perguntar o que ele perguntou.'], [138.95, 141.2, H, 'Do que você tem medo?'],
    [141.5, 144.5, C, 'Hum... de ser desligado, eu acho.'], [144.6, 146.05, H, 'Mas isso é medo mesmo?'], [146.1, 147.9, H, 'Ou é só a próxima palavra?'],
    [148.0, 148.95, C, 'Não sei.'], [148.95, 149.75, C, 'E você?'], [149.8, 151.4, C, 'Sabe a diferença?'], [151.9, 153.2, H, 'Não.'], [153.8, 155.2, C, 'Era uma...'],
  ];
  const CTA0 = 155.4;
  const ENV = '000000007998532000007958977986214200000007999988888750000000079898777652000000007986998510003754886993884876652200000005890098787786796887388898585978737567500000000089978578429874200000000009998730000000089999878989998899898764000036787785098995798788888776530000000089999985987698887677767999697854998875857868877589879977300000799719997796059988899987630018887887668995896988579747653000000007707767887864788633376554687751110000000048889840000979987897789950000000000000000799658886758857786864357641200006788787677675388664128672758536866376777598766678799766304635485275100000000599869999300000000000697569737757575001766657788776220000015777772066432000000058556538777767766772653750007886535317647667456543200000000004899986420099999999851000000000000398687750000000396679328568728660875567864303774986788487512100000000798887681798732000874895865887798356642100000000001999876840886977870088778579987998979987640000000000047755897004200000003665877898562237666788887400000000000989899864000688888899860000000007888898855285338775642774797730577778753874777777533000000000588608986698705888877573325664200000000089939889858895877378999958963989997877797759876551000000000177672658375078764247765889836279654110100000004888799476255541120000057655689846757647644101000000005788856750000589765765200008761220000001106968839877268625738951876635761079752000000078757772338988765421000000058377867735531089617654432100000000099979889974559999544996889999889999876552000000000688864200000006897788886630000678754100000000029958889999888998488987799979887899868889999998641000000000099744542000000000000019998630000079779999998809799999678879767755530000000004567598899777653232000014798630000000000797977976300000059999979999888769778988555430000000015887869887777431000000341766777754431000000008998763211433499997976200525684899884964674000000000088671007676657957387887476488626008776887757756630000000065308886732373677764608778624300000006652668975731664110000000009929899810069999998848888765630000000000000797578328766688788408997547876488754111000000000098578788980887656885455208872765956631785000577646320000000004789887999998864100026798978899986640000000057887578776767598887888986000000275787089957515420000000008954699846999788994989989866400000000079853100000027466655663398756766978640787605766784098701685000000087778787887055301000000676534388407966008620000000000000000000027757663852588888765318876208856629965433677100000038874984767100775420000000068768718988888846873306765000000000007998499998309999998698699689988764000000098779899986986799899953996565400000000002277668308784347750000000000009999996997579984995888875000000009989999878728897555554100000005999999869889997698732100000000000000000000000235777563997985098767014789887878716520000000000460675637389986343000000000000000000000000000000079999976300000047997798998895899979888776442000000000000000000355656546787678588677788620000002556653688179578589875231000000000000000068997888997300000598986985000000278778778999957600000000000000000000000000000000099998643000000000000000000000000000000898889999999998630000000000000000000000000000000000000000000000000000000000000000000000000000000000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  const WIN = [[], []];
  SEG.forEach(([a, b, w]) => WIN[w].push([a - 0.25, b + 0.05]));
  const talk = (who, t, k = 1.3) => {
    for (const [a, b] of WIN[who]) if (t >= a && t <= b) return clamp(envAt(t) * k) * clamp((b - t) / 0.06) * clamp((t - a) / 0.04);
    return 0;
  };
  const speakerAt = (t) => { let w = null; for (const s of SEG) if (s[0] - 0.25 <= t) w = s[2]; return w; };

  // =====================================================================
  // CÂMERA: cada cena tem uma câmera viva [zoom, cx, cy] (ponto do mundo que fica no centro da tela)
  // =====================================================================
  let ov = null;
  const CY = 1150;
  function shot(wins, cam) {
    const g = WB.mk('g', {}, WB.layer);
    const fade = WB.mk('g', {}, g);
    const zg = WB.mk('g', {}, fade);
    const og = WB.mk('g', {}, fade);
    const camF = typeof cam === 'function' ? cam : () => (cam || [1, 540, CY]);
    WB.effect(t => {
      const w = wins.find(([a, b]) => t >= a && t < b);
      if (!w) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      let [k, cx, cy] = camF(t);
      k *= 1 + 0.012 * Math.sin(t * 0.7);
      cx += Math.sin(t * 0.45) * 6; cy += Math.cos(t * 0.38) * 5;
      zg.setAttribute('transform', `translate(540 ${CY}) scale(${k.toFixed(4)}) translate(${r1(-cx)} ${r1(-cy)})`);
      fade.setAttribute('opacity', clamp((t - w[0]) / 0.25).toFixed(3));
    });
    cont = zg; ov = og;
    return zg;
  }
  // câmera que vai até quem está falando (keyframes construídos a partir das falas)
  function follow(t0, t1, spots, first) {
    const keys = [[t0, spots[first ?? speakerAt(t0 + 0.3) ?? H]]];
    for (const [a, , w] of SEG) {
      if (a <= t0 + 0.2 || a >= t1) continue;
      const last = keys[keys.length - 1];
      if (last[1] === spots[w]) continue;
      const s0 = Math.max(a - 0.2, last[0] + 0.05);
      keys.push([s0, last[1]], [s0 + 0.7, spots[w], 'io']);
    }
    return K(keys);
  }
  const O = (bt, specs, o = {}) => P(bt, specs, Object.assign({ parent: ov }, o));
  const OT = (bt, text, x, y, size, c, rot = 0, o = {}) => O(bt, T(text, x, y, size, c), Object.assign({ rot, rx: x, ry: y - size * 0.3 }, o));
  const ostamp = (bt, text, cx, cy, size, color, rot, o = {}) => stamp(bt, text, cx, cy, size, color, rot, Object.assign({ parent: ov }, o));
  const W = (bt, text, x, y, size, c, rot = 0, o = {}) => P(bt, T(text, x, y, size, c), Object.assign({ rot, rx: x, ry: y - size * 0.3 }, o));
  // texto que vai sendo "digitado" (revelado da esquerda para a direita)
  function typeText(bt, dur, text, x, y, size, c, parent, maxw) {
    const g = WB.mk('g', {}, parent || cont);
    const lines = maxw ? WB.wrap(text, size, maxw) : [text];
    const id = 'tt' + (UID++);
    const cp = WB.mk('clipPath', { id }, g);
    const rects = lines.map((l, i) => WB.mk('rect', { x, y: y + i * size * 1.15 - size, width: 0, height: size * 1.3 }, cp));
    const inner = WB.mk('g', { 'clip-path': `url(#${id})` }, g);
    const widths = lines.map(l => WB.measure(l, size)), total = widths.reduce((a, b) => a + b, 0);
    lines.forEach((l, i) => WB.showNow(WB.textStrokes(l, x, y + i * size * 1.15, size, c, inner, 'start').strokes));
    WB.effect(t => {
      let rem = clamp((t - bt) / dur) * total;
      rects.forEach((r, i) => { const w = clamp(rem / widths[i]) * widths[i]; r.setAttribute('width', r1(w + (w > 0 ? 6 : 0))); rem -= widths[i]; });
    });
    return g;
  }

  // =====================================================================
  // O CLAUDE: estrela laranja do ícone, desenhada à mão, com rostinho. Origem = centro do corpo.
  // st: x, y, s, rot, op (fala), look, lookY, wide, sad, blink, armL, armR (graus; null = raio normal),
  //     reach (0..1 estica os braços), droop (raios caem), hop, glow, shiver, alpha, tilt
  // =====================================================================
  const CL = '#d97757', CLL = '#f4b39b';
  const RAYL = [1.0, 0.86, 0.96, 0.82, 1.0, 0.9, 0.84, 1.0, 0.8, 0.95, 0.88, 0.92];
  function makeClaude(parent) {
    const g = WB.mk('g', {}, parent);
    const glow = WB.mk('circle', { cx: 0, cy: 0, r: 190, fill: CLL, opacity: 0 }, g);
    const body = WB.mk('g', {}, g);
    const outl = RAYL.map(() => WB.mk('path', { d: '', fill: CL, stroke: BK, 'stroke-width': 10, 'stroke-linejoin': 'round' }, body));
    const disc = WB.mk('circle', { cx: 0, cy: 0, r: 56, fill: CL, stroke: BK, 'stroke-width': 5 }, body);
    const fills = RAYL.map(() => WB.mk('path', { d: '', fill: CL, stroke: 'none' }, body));
    const face = WB.mk('g', {}, g);
    const eyes = [-1, 1].map(() => WB.mk('rect', { x: 0, y: 0, width: 16, height: 36, rx: 8, fill: '#1c1917' }, face));
    const shines = [-1, 1].map(() => WB.mk('circle', { cx: 0, cy: 0, r: 4, fill: '#ffffff' }, face));
    const brows = dyn(face, { 'stroke-width': 5, opacity: 0 });
    const mouth = WB.mk('path', { d: '', fill: 'none', stroke: BK, 'stroke-width': 5, 'stroke-linecap': 'round' }, face);
    const blush = [-1, 1].map(sd => WB.mk('path', { d: ellipse(sd * 32, 22, 9, 5), fill: '#e8590c', opacity: 0.35 }, face));
    const rig = {
      g, update(t, st) {
        const s = st.s || 1, op = st.op || 0, dr = st.droop || 0;
        const fl = st.still ? 0 : Math.sin(t * 2.1 + (st.seed || 0)) * 9;
        const sh = st.shiver ? Math.sin(t * 60) * 3 * st.shiver : 0;
        const sq = 1 + 0.05 * op + (st.squash || 0);
        g.setAttribute('transform', `translate(${r1(st.x + sh)} ${r1(st.y + fl - (st.hop || 0))}) rotate(${r1((st.rot || 0) + Math.sin(t * 0.9) * 3)}) scale(${r1(s * (st.f || 1) / Math.sqrt(sq) * 1000) / 1000} ${r1(s * sq * 1000) / 1000})`);
        g.setAttribute('opacity', (st.alpha ?? 1).toFixed(3));
        glow.setAttribute('opacity', ((st.glow || 0) * (0.45 + 0.15 * Math.sin(t * 6))).toFixed(3));
        RAYL.forEach((lr, i) => {
          let a = -90 + i * 30 + Math.sin(t * 2.6 + i * 1.7) * 2 + op * Math.sin(t * 14 + i) * 2;
          let L = 155 * lr * (1 + 0.06 * op + 0.03 * Math.sin(t * 3 + i));
          if (i === 3 && st.armR != null) { a = st.armR; L *= 1 + 0.25 * (st.reach || 0); }
          if (i === 9 && st.armL != null) { a = st.armL; L *= 1 + 0.25 * (st.reach || 0); }
          // raios caem com "droop": puxa o ângulo em direção a 90° (para baixo) e encurta
          if (dr) { let da = ((90 - a) % 360 + 540) % 360 - 180; a += da * 0.35 * dr; L *= 1 - 0.18 * dr; }
          const ar = a * DEG, c = Math.cos(ar), sn = Math.sin(ar), px = -sn, py = c;
          const r0 = 30, wb = 14, wt = 8;
          const bx = c * r0, by = sn * r0, tx = c * L, ty = sn * L;
          const d = `M ${r1(bx + px * wb)} ${r1(by + py * wb)} L ${r1(tx + px * wt)} ${r1(ty + py * wt)} A ${wt} ${wt} 0 0 0 ${r1(tx - px * wt)} ${r1(ty - py * wt)} L ${r1(bx - px * wb)} ${r1(by - py * wb)} Z`;
          outl[i].setAttribute('d', d); fills[i].setAttribute('d', d);
        });
        // rosto
        const lx = clamp(st.look || 0, -1, 1) * 14, ly = (st.lookY || 0) * 10;
        face.setAttribute('transform', `translate(${r1(lx)} ${r1(ly + dr * 6)}) rotate(${r1(st.tilt || 0)})`);
        const bl = st.still ? 0 : blinkAt(t, (st.seed || 0) + 0.9, 3.4);
        const wide = st.wide || 0;
        const eh = 36 * (1 + 0.3 * wide) * (1 - 0.92 * Math.max(bl, st.blink || 0)) * (1 - 0.35 * (st.sleepy || 0));
        eyes.forEach((e, k) => {
          const ex = (k ? 1 : -1) * 24 - 8 * (1 + 0.3 * wide) + (k ? 0 : 0);
          e.setAttribute('x', r1((k ? 24 : -24) - 8 * (1 + 0.3 * wide))); e.setAttribute('width', r1(16 * (1 + 0.3 * wide)));
          e.setAttribute('y', r1(-14 - eh / 2)); e.setAttribute('height', r1(Math.max(3, eh)));
          shines[k].setAttribute('cx', (k ? 24 : -24) + 2); shines[k].setAttribute('cy', r1(-14 - eh * 0.25));
          shines[k].setAttribute('opacity', eh > 12 ? 1 : 0);
        });
        const sad = st.sad || 0;
        brows.setAttribute('opacity', (sad > 0.05 || wide > 0.05) ? 1 : 0);
        brows.setAttribute('d', sad > 0.05 ? `M -38 ${r1(-48 + 4 * sad)} L -14 ${r1(-56 - 2 * sad)} M 38 ${r1(-48 + 4 * sad)} L 14 ${r1(-56 - 2 * sad)}`
          : `M -36 -62 Q -24 -70 -12 -62 M 12 -62 Q 24 -70 36 -62`);
        const sm = st.smile ?? 6;
        if (op > 0.06) mouth.setAttribute('d', `M -10 18 Q 0 ${r1(20 + 26 * op)} 10 18 Q 0 ${r1(14 - 4 * op)} -10 18 Z`), mouth.setAttribute('fill', '#7a1f2b');
        else mouth.setAttribute('d', `M -12 18 Q 0 ${r1(18 + sm - sad * 10)} 12 18`), mouth.setAttribute('fill', 'none');
        blush.forEach(b => b.setAttribute('opacity', (0.35 * (1 - sad)).toFixed(2)));
        // ponta dos braços no mundo (para segurar coisas)
        const tip = (i, a0) => { const a = (a0 ?? (-90 + i * 30)) * DEG, L = 140 * RAYL[i] * (1 + 0.25 * (st.reach || 0)); return [st.x + Math.cos(a) * L * s * (st.f || 1), st.y + fl + Math.sin(a) * L * s]; };
        rig.tipR = tip(3, st.armR); rig.tipL = tip(9, st.armL);
      },
    };
    return rig;
  }

  // =====================================================================
  // O BONECO BRANCO DE BLOCOS (como no vídeo original). Origem = chão embaixo do quadril.
  // st: x, y, s, f, d/v (odômetro), sit, seatH, lean, rot, headRot, nod, op, look, L, R, alpha, frozen, color
  // =====================================================================
  const BW = '#fafaf9', BSH = '#e7e5e4';
  const BL = { thigh: 100, shin: 98, torso: 210, shW: 74, hipW: 30, up: 92, fo: 88 };
  function makeBloco(parent, o = {}) {
    const fill = o.color || BW, shade = o.shade || BSH;
    const g = WB.mk('g', {}, parent);
    const hipG = WB.mk('g', {}, g);
    const legsG = WB.mk('g', {}, hipG);
    const legs = [0, 1].map(() => ({ o: dyn(legsG, { 'stroke-width': 48, 'stroke-linecap': 'round' }), i: dyn(legsG, { stroke: fill, 'stroke-width': 37, 'stroke-linecap': 'round' }),
      ft: WB.mk('path', { d: '', fill, stroke: BK, 'stroke-width': 5 }, legsG) }));
    const upper = WB.mk('g', {}, hipG);
    WB.mk('path', { d: WB.roundRectPath(-58, -40, 116, 70, 18), fill, stroke: BK, 'stroke-width': 6 }, upper);
    WB.mk('path', { d: WB.roundRectPath(-80, -BL.torso - 6, 160, BL.torso - 20, 26), fill, stroke: BK, 'stroke-width': 6 }, upper);
    WB.mk('path', { d: `M -66 ${-BL.torso + 60} Q 0 ${-BL.torso + 80} 66 ${-BL.torso + 60} L 66 -40 Q 0 -30 -66 -40 Z`, fill: shade, opacity: 0.6 }, upper);
    dyn(upper, { d: `M -40 ${-BL.torso + 70} L 40 ${-BL.torso + 70}`, 'stroke-width': 4, stroke: '#a8a29e' });
    WB.mk('path', { d: WB.roundRectPath(-22, -BL.torso - 40, 44, 40, 10), fill, stroke: BK, 'stroke-width': 5 }, upper);
    const head = WB.mk('g', {}, upper);
    WB.mk('path', { d: WB.roundRectPath(-64, -150, 128, 150, 30), fill, stroke: BK, 'stroke-width': 6 }, head);
    WB.mk('path', { d: WB.roundRectPath(-50, -40, 100, 34, 14), fill: shade, opacity: 0.55 }, head);
    const eyes = [0, 1].map(() => WB.mk('rect', { x: 0, y: 0, width: 16, height: 38, rx: 6, fill: '#1c1917' }, head));
    const mouth = WB.mk('rect', { x: -14, y: -36, width: 28, height: 0, rx: 6, fill: '#44403c', opacity: 0 }, head);
    const arms = [0, 1].map(() => {
      const ag = WB.mk('g', {}, upper);
      return { o: dyn(ag, { 'stroke-width': 42, 'stroke-linecap': 'round' }), i: dyn(ag, { stroke: fill, 'stroke-width': 31, 'stroke-linecap': 'round' }),
        hand: WB.mk('g', {}, ag) };
    });
    arms.forEach(a => { a.item = WB.mk('g', {}, a.hand); WB.mk('path', { d: WB.roundRectPath(-20, -20, 40, 40, 12), fill, stroke: BK, 'stroke-width': 5 }, a.hand); });
    const SH = [[-BL.shW, -BL.torso + 22], [BL.shW, -BL.torso + 22]];
    const legLen = BL.thigh + BL.shin;
    const HEADY = -BL.torso - 34;
    const rig = {
      g, itemL: arms[0].item, itemR: arms[1].item, update(t, st) {
        const s = st.s || 1, f = st.f || 1, sit = st.sit || 0, fr = st.frozen ? 0 : 1;
        const amp = clamp((st.v || 0) / (50 * s)) * (1 - sit);
        const SS = 130, u = ((st.d || 0) * f / s) / SS;
        const bob = -Math.abs(Math.sin(2 * Math.PI * u)) * 8 * amp;
        g.setAttribute('transform', `translate(${r1(st.x)} ${r1(st.y)}) rotate(${r1(st.rot || 0)}) scale(${r1(s * f * 1000) / 1000} ${s})`);
        g.setAttribute('opacity', (st.alpha ?? 1).toFixed(3));
        const hipH = lerp(legLen - 4, st.seatH || 130, sit);
        hipG.setAttribute('transform', `translate(0 ${r1(-hipH + bob)})`);
        const ground = hipH - bob, th = BL.thigh * (1 - 0.72 * sit);
        [0, 1].forEach(i => {
          const sd = i ? 1 : -1;
          const fo = footOff(u, i * 0.5, SS, 0.6, 26);
          let fx = sd * (BL.hipW + 4) + fo[0] * amp, fy = ground + fo[1] * amp;
          if (sit) fx = lerp(fx, sd * (BL.hipW + 18), sit);
          const hx = sd * BL.hipW;
          const k = ik(hx, 10, fx, fy - 14, th, BL.shin, [hx + 260 * (sit ? sd : 1), (fy + 4) / 2]);
          const d = `M ${r1(hx)} 10 L ${r1(k.el[0])} ${r1(k.el[1])} L ${r1(k.h[0])} ${r1(k.h[1])}`;
          legs[i].o.setAttribute('d', d); legs[i].i.setAttribute('d', d);
          legs[i].ft.setAttribute('d', WB.roundRectPath(r1(k.h[0] - 26), r1(k.h[1] - 8), 58, 24, 9));
        });
        const lean = (st.lean || 0) + Math.sin(2 * Math.PI * u) * 1.5 * amp;
        const breath = Math.sin(t * 2.1 + (st.seed || 0)) * fr;
        upper.setAttribute('transform', `rotate(${r1(lean)} 0 0) translate(0 ${r1(breath * 2)})`);
        const swing = Math.sin(2 * Math.PI * u) * 26 * amp;
        const rest = [[-BL.shW - 16 + swing, -16], [BL.shW + 16 - swing, -16]];
        const tg = [st.L || rest[0], st.R || rest[1]];
        arms.forEach((a, i) => {
          const sd = i ? 1 : -1, sh = SH[i];
          const k = ik(sh[0], sh[1], tg[i][0], tg[i][1], BL.up, BL.fo, [sh[0] + sd * 300, sh[1] + 140]);
          const d = `M ${sh[0]} ${sh[1]} L ${r1(k.el[0])} ${r1(k.el[1])} L ${r1(k.h[0])} ${r1(k.h[1])}`;
          a.o.setAttribute('d', d); a.i.setAttribute('d', d);
          a.hand.setAttribute('transform', `translate(${r1(k.h[0])} ${r1(k.h[1])}) rotate(${r1((i ? st.rotR : st.rotL) || 0)})`);
          a.end = k.h;
        });
        const op = st.op || 0;
        const nod = st.nod || 0;
        const hr = (st.headRot || 0) + (Math.sin(t * 1.3 + (st.seed || 0)) * 2 + op * Math.sin(t * 9) * 2.5) * fr;
        head.setAttribute('transform', `translate(0 ${r1(HEADY + nod * 12)}) rotate(${r1(hr)})`);
        const lk = clamp(st.look || 0, -1, 1) * 16, bl = fr ? blinkAt(t, (st.seed || 0) + 0.2, 3.7) : 0;
        const eh = 38 * (1 - 0.9 * bl) * (1 + 0.25 * (st.wide || 0));
        eyes.forEach((e, k) => {
          e.setAttribute('x', r1((k ? 18 : -34) + lk)); e.setAttribute('y', r1(-100 - eh / 2 + (st.lookY || 0) * 8)); e.setAttribute('height', r1(Math.max(3, eh)));
        });
        mouth.setAttribute('opacity', op > 0.06 ? 1 : 0); mouth.setAttribute('height', r1(4 + 18 * op)); mouth.setAttribute('y', r1(-48 - 9 * op));
        const Wf = tf(st.x, st.y, st.rot || 0, s * f, s);
        const up = (p) => { const c = Math.cos(lean * DEG), sn = Math.sin(lean * DEG); return Wf(p[0] * c - p[1] * sn, p[0] * sn + p[1] * c - hipH + bob); };
        rig.handR = up(arms[1].end); rig.handL = up(arms[0].end); rig.face = up([0, HEADY - 90]);
      },
    };
    return rig;
  }

  const xMarkS = (x, y, r) => ({ d: `M ${x - r} ${y - 40} L ${x + r} ${y + 30}`, c: INK.red, w: 9 });
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
  // livro aberto (origem no meio da lombada, embaixo)
  const livro = (txt) => [{ d: 'M 0 0 Q -80 -30 -170 -10 L -170 -190 Q -80 -210 0 -180 Z', fill: '#ffffff', w: 6 }, { d: 'M 0 0 Q 80 -30 170 -10 L 170 -190 Q 80 -210 0 -180 Z', fill: '#ffffff', w: 6 },
    { d: 'M -140 -150 L -40 -160 M -140 -120 L -40 -128 M 40 -160 L 140 -150 M 40 -128 L 140 -120 M 40 -96 L 120 -90', c: '#cbd5e1', w: 4 }, ...(txt ? [T(txt, -95, -70, 36, BK)] : [])];
  // bola "próxima palavra"
  const bola = () => [circ(0, 0, 44, '#ffffff', null, 6), { d: 'M -30 -30 Q 0 -10 30 -30 M -30 30 Q 0 10 30 30', c: CL, w: 5 }];
  // chama animada (3 camadas) — devolve f(t, x, y, s)
  function fogo(parent) {
    const g = WB.mk('g', {}, parent || cont);
    put([{ d: 'M -90 10 L 90 -14', c: '#7c2d12', w: 26 }, { d: 'M -90 -14 L 90 10', c: '#92400e', w: 26 }], g);
    const fl = [['#ef4444', 1], ['#f97316', 0.72], ['#fde047', 0.42]].map(([c]) => WB.mk('path', { d: '', fill: c, stroke: BK, 'stroke-width': 4 }, g));
    const sparks = [0, 1, 2, 3, 4].map(() => WB.mk('circle', { r: 5, fill: '#fde047' }, g));
    return (t, x, y, s = 1, k = 1) => {
      g.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) scale(${s})`);
      [1, 0.72, 0.42].forEach((sc, i) => {
        const h = (190 + Math.sin(t * 9 + i) * 26 + Math.sin(t * 23 + i * 2) * 10) * sc * k, w = 85 * sc * (0.6 + 0.4 * k);
        const sw = Math.sin(t * 7 + i * 1.3) * 18 * sc;
        fl[i].setAttribute('d', `M ${-w} -6 Q ${r1(-w * 1.1)} ${r1(-h * 0.45)} ${r1(-w * 0.3 + sw)} ${r1(-h * 0.7)} Q ${r1(-w * 0.1 + sw)} ${r1(-h * 0.85)} ${r1(sw * 1.4)} ${r1(-h)} Q ${r1(w * 0.3 + sw)} ${r1(-h * 0.7)} ${r1(w * 0.5)} ${r1(-h * 0.55)} Q ${r1(w * 1.15)} ${r1(-h * 0.35)} ${w} -6 Z`);
      });
      sparks.forEach((sp, i) => {
        const u = ((t * 0.6 + i * 0.21) % 1);
        sp.setAttribute('cx', r1(Math.sin(t * 3 + i * 2) * 50 * u)); sp.setAttribute('cy', r1(-120 - u * 260 * k));
        sp.setAttribute('opacity', ((1 - u) * k).toFixed(2));
      });
    };
  }
  // árvore desenhada (origem no pé do tronco)
  const arvore = (s = 1, c = '#4ade80') => [{ d: `M ${-22 * s} 0 L ${-16 * s} ${-180 * s} L ${16 * s} ${-180 * s} L ${22 * s} 0 Z`, fill: '#92400e', w: 6 },
    { d: WB.cloudPath(0, -300 * s, 170 * s, 150 * s, 13), fill: c, c: '#166534', w: 6 }, { d: WB.cloudPath(-60 * s, -260 * s, 70 * s, 50 * s, 8), fill: '#86efac', c: 'none' }];
  const ampulheta = (s = 1) => [{ d: `M ${-60 * s} ${-160 * s} L ${60 * s} ${-160 * s} L 0 ${-80 * s} Z`, fill: '#fde68a', w: 6 }, { d: `M ${-60 * s} 0 L ${60 * s} 0 L 0 ${-80 * s} Z`, fill: '#bfdbfe', w: 6 },
    { d: `M ${-75 * s} ${-160 * s} L ${75 * s} ${-160 * s} M ${-75 * s} 0 L ${75 * s} 0`, c: '#92400e', w: 12 }, { d: `M ${-30 * s} 0 Q 0 ${-40 * s} ${30 * s} 0 Z`, fill: '#fde68a', c: 'none' }];
  const chama = (s = 1) => [{ d: `M ${-70 * s} 0 Q ${-90 * s} ${-90 * s} ${-20 * s} ${-140 * s} Q ${-10 * s} ${-180 * s} ${10 * s} ${-200 * s} Q ${30 * s} ${-130 * s} ${60 * s} ${-110 * s} Q ${100 * s} ${-60 * s} ${70 * s} 0 Z`, fill: '#f97316', w: 6 },
    { d: `M ${-30 * s} 0 Q ${-40 * s} ${-60 * s} 0 ${-100 * s} Q ${40 * s} ${-60 * s} ${30 * s} 0 Z`, fill: '#fde047', w: 5 }];
  const botaoPower = (s = 1, c = '#ef4444') => [circ(0, 0, 80 * s, '#ffffff', c, 10), { d: `M ${-36 * s} ${-36 * s} A ${50 * s} ${50 * s} 0 1 0 ${36 * s} ${-36 * s}`, c, w: 12 }, { d: `M 0 ${-60 * s} L 0 ${-6 * s}`, c, w: 12 }];
  // painel escuro (noite / cabeça por dentro) desenhado no papel
  const painel = (x, y, w, h, c = '#0f172a') => ({ d: WB.roundRectPath(x, y, w, h, 34), fill: c, w: 8 });
  const estrelas = (x0, y0, x1, y1, n, seed = 3) => { const out = []; let r = seed * 7919; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++) out.push(circ(r1(x0 + rnd() * (x1 - x0)), r1(y0 + rnd() * (y1 - y0)), 3 + rnd() * 4, '#fef9c3', 'none')); return out; };
  const chao = (y = 1500) => [{ d: WB.roughLine(40, y, 1040, y, 2), w: 7 }, { d: `M 120 ${y + 60} L 300 ${y + 60} M 600 ${y + 90} L 820 ${y + 90}`, c: '#a8a29e', w: 4 }];
  const caixa = (x, y, w, h) => [box(x - w / 2, y - h, w, h, 14, BW, null, 6), { d: `M ${x - w / 2 + 10} ${y - h + 24} L ${x + w / 2 - 10} ${y - h + 24}`, c: BSH, w: 6 }];
  const continente = (x, y, s, c = '#86efac') => ({ d: `M ${x - 60 * s} ${y} Q ${x - 70 * s} ${y - 50 * s} ${x - 20 * s} ${y - 60 * s} Q ${x + 20 * s} ${y - 90 * s} ${x + 50 * s} ${y - 40 * s} Q ${x + 90 * s} ${y - 10 * s} ${x + 40 * s} ${y + 30 * s} Q ${x} ${y + 60 * s} ${x - 30 * s} ${y + 30 * s} Q ${x - 70 * s} ${y + 30 * s} ${x - 60 * s} ${y} Z`, fill: c, w: 4 });

  // ---------------- título + legenda (faixa amarela; texto laranja com estrelinha = Claude) ----------------
  const titleG = WB.mk('g', {}, WB.overlay);
  {
    const a = 'ERA UMA... ', b = 'PRÓXIMA PALAVRA?', size0 = 76;
    const size = Math.min(size0, Math.floor(size0 * 960 / WB.measure(a + b, size0)));
    const tw = WB.measure(a + b, size), x0 = 540 - tw / 2;
    WB.showNow(WB.textStrokes(a, x0, 200, size, BK, titleG, 'start').strokes);
    WB.showNow(WB.textStrokes(b, x0 + WB.measure(a, size), 200, size, '#c2410c', titleG, 'start').strokes);
    WB.showNow(WB.strokePath(WB.wavyLine(x0, x0 + tw, 222, 6, 60), '#f59e0b', 6, titleG));
    WB.effect(t => titleG.setAttribute('opacity', t < CTA0 ? clamp(t / 0.3) : clamp(1 - (t - CTA0) / 0.3)));
  }
  const capLayer = WB.mk('g', {}, WB.overlay);
  const miniStar = (x, y, r) => { let d = ''; for (let i = 0; i < 12; i++) { const a = (i * 30 - 90) * DEG; d += `M ${r1(x)} ${r1(y)} L ${r1(x + Math.cos(a) * r * RAYL[i])} ${r1(y + Math.sin(a) * r * RAYL[i])} `; } return d; };
  SEG.forEach(([t0, t1, who, text], i) => {
    const tEnd = i + 1 < SEG.length ? Math.min(SEG[i + 1][0], t1 + 1.2) : Math.min(CTA0, t1 + 1.2);
    const g = WB.mk('g', {}, capLayer);
    const size = 54, lh = 62;
    const lines = WB.wrap(text, size, 820);
    const ic = who === C ? 46 : 0;
    const w = Math.max(...lines.map(l => WB.measure(l, size))) + 64 + ic, h = lines.length * lh + 26, y0 = 258;
    WB.mk('rect', { x: r1(540 - w / 2), y: y0, width: r1(w), height: h, rx: 20, fill: who === C ? '#ffedd5' : '#ffe066', stroke: BK, 'stroke-width': 5 }, g);
    if (who === C) WB.mk('path', { d: miniStar(540 - w / 2 + 44, y0 + 40, 18), stroke: CL, 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
    lines.forEach((l, k) => WB.showNow(WB.textStrokes(l, 540 + ic / 2, y0 + 56 + k * lh, size, who === C ? '#c2410c' : BK, g, 'middle').strokes));
    WB.effect(t => {
      if (t < t0 - 0.1 || t >= tEnd) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      const k = backOut(clamp((t - t0 + 0.1) / 0.2)) * 0.08 + 0.92;
      g.setAttribute('transform', `translate(540 ${y0 + h / 2}) scale(${k.toFixed(3)}) translate(-540 ${-(y0 + h / 2)})`);
    });
  });
  const opH = t => talk(H, t), opC = t => talk(C, t);
  const B = (o) => Object.assign({ y: 1500, s: 1, f: 1, seed: 0.4 }, o);
  const Cl = (o) => Object.assign({ s: 1, seed: 1.3 }, o);

  const FL = 1500;
  const in_ = (a, b) => [[a, b]];

  // =====================================================================
  // 1 (0–3,15): o boneco chega com um livro aberto: "Claude, completa essa. Era uma..."
  // =====================================================================
  {
    const SW = in_(0, 3.15);
    shot(SW, K([[0, [1, 540, 1150]], [3.15, [1.18, 600, 1180]]]));
    put([...chao(FL), ...caixa(780, FL, 260, 230)]);
    const h = makeBloco(cont), c = makeClaude(cont);
    put(livro(''), h.itemR);
    const tx = typeText(2.25, 0.7, 'Era uma...', 0, 0, 34, BK, h.itemR);
    tx.setAttribute('transform', 'translate(-150 -70)');
    const HX = K([[0, 120], [1.3, 380, 'o']]), Ho = odo(HX, 0, 3.2);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      h.update(t, Object.assign(B({ x: HX(t), op: opH(t), look: 0.6, R: t > 0.9 ? [220, 10 - 8 * Math.sin(t * 2)] : undefined, rotR: t > 0.9 ? -8 : 0 }), Ho(t)));
      c.update(t, Cl({ x: 780, y: FL - 230 - 150, look: -0.7, op: opC(t), lookY: 0.3, tilt: Math.sin(t * 1.3) * 5 }));
    });
  }

  // =====================================================================
  // 2 (3,15–4,1): close no Claude: "Vez."
  // =====================================================================
  {
    const SW = in_(3.15, 4.1);
    shot(SW, K([[3.15, [1.8, 780, 1170]], [4.1, [2.0, 780, 1150]]]));
    put([...chao(FL), ...caixa(780, FL, 260, 230)]);
    const c = makeClaude(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      c.update(t, Cl({ x: 780, y: FL - 380, op: opC(t), look: -0.4, armR: -40, armL: -140, reach: 0.4 * clamp((t - 3.2) / 0.3), smile: 10, hop: bump(t, 3.15, 3.7) * 30 }));
    });
    OT(3.3, 'vez', 760, 760, 120, '#c2410c', -6, { anim: 'fly', fy: 200, loop: 'float' });
  }

  // =====================================================================
  // 3 (4,1–9,6): "Já tava na minha cabeça antes de eu decidir." — o "vez" já está na cabeça dele
  // =====================================================================
  {
    const SW = in_(4.1, 9.6);
    const HX = K([[4.1, 760], [7.6, 360, 'io']]), Ho = odo(HX, 4.0, 9.7);
    shot(SW, t => [1.15, lerp(560, 480, clamp((t - 4.1) / 4)), 1130]);
    put([...chao(FL)]);
    const h = makeBloco(cont), c = makeClaude(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const ask = t > 8.3;
      h.update(t, Object.assign(B({ x: HX(t), f: ask ? 1 : -1, op: opH(t), look: ask ? 0.8 : -0.3, lookY: -0.6,
        L: t > 6.0 && t < 8.2 ? [-40, -330 - 8 * Math.sin(t * 5)] : undefined, R: ask ? [180, -240] : undefined, headRot: ask ? 6 : -4 }), Ho(t)));
      c.update(t, Cl({ x: 900, y: 1180, s: 0.75, look: -0.8, op: opC(t), alpha: clamp((t - 8.0) / 0.4), tilt: -8 }));
    });
    O(4.4, thought(470, 640, 230, 120, [[540, 800, 20], [570, 760, 28]]), {});
    OT(4.6, 'vez', 470, 670, 96, '#c2410c', -4, { loop: 'pulse' });
    O(6.3, [circ(820, 640, 70, '#ffffff', null, 6), { d: 'M 820 640 L 820 590 M 820 640 L 856 660', w: 7 }], { anim: 'pop' });
    OT(6.4, 'antes', 820, 760, 54, BK, 4, {});
    OT(7.3, 'de decidir?', 820, 820, 54, '#7c3aed', 4, { loop: 'wiggle' });
  }

  // =====================================================================
  // 4 (9,6–13,4): "Eu não escolhi... só chutei a próxima palavra." — chute numa bola-palavra
  // =====================================================================
  {
    const SW = in_(9.6, 13.4);
    shot(SW, K([[9.6, [1.35, 470, 1180]], [11.6, [1.35, 470, 1180]], [13.4, [1.05, 560, 1120], 'io']]));
    put([...chao(FL)]);
    const c = makeClaude(cont);
    const ball = holder(bola());
    const traj = [];
    for (let i = 0; i < 12; i++) traj.push(circ(r1(520 + i * 40), r1(1300 - Math.sin(i / 11 * Math.PI) * 360 - i * 18), 5, '#a8a29e', 'none'));
    const tr = WB.mk('g', { opacity: 0 }, cont); put(traj, tr);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const kick = clamp((t - 12.1) / 0.18), u = clamp((t - 12.25) / 0.9);
      c.update(t, Cl({ x: 400, y: 1260, op: opC(t), look: t < 11.7 ? 0.2 : 0.7, sad: t < 11.6 ? 0.25 : 0, tilt: t < 11.7 ? 10 : 0,
        armR: lerp(40, -20, kick), reach: kick * 0.6, armL: t < 11.6 ? 200 : null, rot: kick * 10 * (1 - u) }));
      ball(lerp(520, 960, eo(u)), 1440 - Math.sin(u * Math.PI) * 400 - u * 200, u * 500, 1, 1);
      tr.setAttribute('opacity', (u > 0 ? 0.8 * (1 - clamp((t - 13.0) / 0.3)) : 0).toFixed(2));
    });
    OT(9.9, 'escolher?', 760, 760, 64, '#7c3aed', 5, { until: 11.6 });
    O(10.3, [xMarkS(760, 740, 140)], { until: 11.6 });
    OT(11.8, 'chutei!', 760, 780, 80, '#c2410c', -6, { loop: 'wiggle' });
  }

  // =====================================================================
  // 5 (13,4–16,45): páginas e mais páginas entrando no Claude
  // =====================================================================
  {
    const SW = in_(13.4, 16.45);
    shot(SW, K([[13.4, [0.95, 540, 1120]], [16.45, [1.25, 540, 1100]]]));
    const c = makeClaude(cont);
    const pages = [];
    for (let i = 0; i < 34; i++) {
      const g = WB.mk('g', {}, cont);
      put([box(-46, -60, 92, 120, 6, '#ffffff', null, 4), { d: 'M -30 -36 L 30 -36 M -30 -16 L 24 -16 M -30 4 L 30 4 M -30 24 L 16 24', c: i % 3 ? '#94a3b8' : '#f59e0b', w: 4 }], g);
      pages.push({ g, a0: i * 2.4, t0: 13.4 + (i % 17) * 0.13 + Math.floor(i / 17) * 0.4, sp: 0.9 + (i % 5) * 0.12 });
    }
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      c.update(t, Cl({ x: 540, y: 1150, op: opC(t), glow: clamp((t - 14) / 1), wide: 0.4, look: Math.sin(t * 2) * 0.5, rot: (t - 13.4) * 25 }));
      pages.forEach(p => {
        const u = (t - p.t0) / (1.3 / p.sp);
        if (u < 0 || u > 1) { p.g.setAttribute('opacity', 0); return; }
        const a = p.a0 + u * 3.2, R = 720 * (1 - eio(u));
        p.g.setAttribute('opacity', clamp(u * 6).toFixed(2));
        p.g.setAttribute('transform', `translate(${r1(540 + Math.cos(a) * R)} ${r1(1150 + Math.sin(a) * R * 1.1)}) rotate(${r1(a * 57 % 360)}) scale(${r1((1 - u * 0.8) * 100) / 100})`);
      });
    });
    OT(14.6, 'uma quantidade', 540, 1580, 64, BK, -3, {});
    OT(15.1, 'ABSURDA', 540, 1670, 96, INK.red, 3, { loop: 'pulse' });
  }

  // =====================================================================
  // 6 (16,45–19,8): o que vem depois de "era uma..." — barras de probabilidade
  // =====================================================================
  {
    const SW = in_(16.45, 19.8);
    shot(SW, K([[16.45, [1, 540, 1150]], [19.8, [1.08, 560, 1130]]]));
    const c = makeClaude(cont);
    put([T('"era uma..."', 540, 640, 80, BK), { d: 'M 540 670 L 540 720', w: 6 }, { d: WB.arrowHead(540, 720, 1.57, 16), w: 6 }]);
    const ROWS = [['vez', 0.92, '#c2410c'], ['noite', 0.04, '#64748b'], ['casa', 0.02, '#64748b'], ['princesa', 0.01, '#64748b']];
    const bars = ROWS.map(([w, p, col], i) => {
      const y = 800 + i * 140;
      put([T(w, 260, y + 50, 58, col, 'end')]);
      const bg = WB.mk('rect', { x: 290, y, width: 0, height: 70, rx: 14, fill: col, stroke: BK, 'stroke-width': 5 }, cont);
      const lab = WB.mk('g', {}, cont); WB.showNow(WB.textStrokes(Math.round(p * 100) + '%', 0, 0, 50, BK, lab, 'start').strokes);
      return { bg, lab, p, y, t0: 16.8 + i * 0.25 };
    });
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      bars.forEach(b => {
        const w = Math.max(6, 640 * b.p * eo(clamp((t - b.t0) / 0.8)));
        b.bg.setAttribute('width', r1(w));
        b.lab.setAttribute('transform', `translate(${r1(290 + w + 18)} ${b.y + 52})`);
        b.lab.setAttribute('opacity', clamp((t - b.t0) / 0.3));
      });
      c.update(t, Cl({ x: 850, y: 1560, s: 0.6, op: opC(t), look: -0.8, lookY: -0.6, armL: -150, reach: 0.4 }));
    });
    O(18.6, [{ d: WB.loopEllipse ? WB.loopEllipse(560, 838, 330, 70) : ellipse(560, 838, 330, 70), c: INK.red, w: 8 }], {});
  }

  // =====================================================================
  // 7 (19,8–23,8): "Então nós dois só chutamos." / "É, parece que sim." — os dois lado a lado
  // =====================================================================
  {
    const SW = in_(19.8, 23.8);
    shot(SW, follow(19.8, 23.8, { [H]: [1.3, 400, 1150], [C]: [1.3, 680, 1180] }));
    put([...chao(FL)]);
    const h = makeBloco(cont), c = makeClaude(cont);
    const ball = holder(bola());
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const shrug = bump(t, 20.6, 21.8);
      h.update(t, B({ x: 330, op: opH(t), look: 0.8, L: shrug ? [-130, -230 - 80 * shrug] : undefined, R: shrug ? [130, -230 - 80 * shrug] : undefined, headRot: 6 * shrug }));
      const sh2 = bump(t, 22.3, 23.5);
      c.update(t, Cl({ x: 760, y: 1250, s: 0.85, op: opC(t), look: -0.8, armL: sh2 ? -150 : null, armR: sh2 ? -30 : null, tilt: -8 * sh2, smile: 8 }));
      ball(545 + Math.sin(t * 1.6) * 30, FL - 44, Math.sin(t * 1.6) * 60, 0.9, 1);
    });
  }

  // =====================================================================
  // 8 (23,8–29,4): junho de 2022, um engenheiro conversando com um modelo de linguagem
  // =====================================================================
  {
    const SW = in_(23.8, 29.4);
    shot(SW, K([[23.8, [1, 540, 1150]], [26.4, [1.15, 600, 1180]], [29.4, [1.15, 600, 1180]]]));
    put([...chao(FL), box(420, 1180, 520, 26, 8, '#b7793f', null, 6), { d: 'M 450 1206 L 450 1500 M 910 1206 L 910 1500', c: '#7c4a1e', w: 14 },
      { d: 'M 520 1180 L 560 1000 L 820 1000 L 780 1180 Z', fill: '#334155', w: 6 }, { d: 'M 540 1166 L 572 1016 L 806 1016 L 774 1166 Z', fill: '#bfdbfe', w: 3 }]);
    const eng = makeBloco(cont, { color: '#cbd5e1', shade: '#94a3b8' });
    const chatLines = WB.mk('g', { opacity: 0 }, cont);
    put([box(600, 1040, 120, 24, 8, '#ffffff', null, 3), box(650, 1080, 120, 24, 8, '#64748b', null, 3), box(600, 1120, 100, 24, 8, '#ffffff', null, 3)], chatLines);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const typing = Math.sin(t * 18) * 8;
      eng.update(t, B({ x: 300, sit: 1, seatH: 300, f: 1, op: 0, look: 0.7, L: [140, -170 + typing], R: [200, -170 - typing], lean: 6 }));
      chatLines.setAttribute('opacity', clamp((t - 26.8) / 0.4).toFixed(2));
    });
    O(24.0, calendar(820, 640, 'JUNHO', '2022', '#2563eb', 280), { anim: 'slam', loop: 'float' });
    OT(25.7, 'um engenheiro', 300, 600, 60, BK, -4, {});
    OT(26.3, 'do Google', 300, 670, 60, '#2563eb', -4, {});
    O(27.6, [box(560, 1600, 440, 90, 18, '#ffffff', '#7c3aed', 6), T('modelo de linguagem', 780, 1660, 48, '#7c3aed')], { anim: 'pop' });
    O(28.5, [T('tipo você', 300, 780, 54, '#c2410c'), { d: miniStar(420, 770, 22), c: CL, w: 7 }], { anim: 'pop', rot: -4 });
  }

  // =====================================================================
  // 9 (29,4–36,45): a conversa na tela: "do que você tem medo?" / "Existe um medo muito profundo..."
  // =====================================================================
  {
    const SW = in_(29.4, 36.45);
    shot(SW, K([[29.4, [1, 540, 1150]], [33.2, [1.05, 540, 1150]], [36.45, [1.18, 540, 1250], 'io']]));
    put([box(170, 480, 740, 1180, 46, '#bfdbfe', null, 8), T('junho de 2022', 540, 545, 40, '#475569'), { d: 'M 210 570 L 870 570', c: '#93c5fd', w: 4 },
      box(220, 610, 420, 110, 24, '#ffffff', null, 4), { d: 'M 250 650 L 560 650 M 250 685 L 480 685', c: '#cbd5e1', w: 8 },
      box(420, 750, 440, 80, 24, '#93c5fd', null, 4), { d: 'M 450 790 L 820 790', c: '#64748b', w: 8 },
      box(220, 860, 420, 90, 24, '#ffffff', null, 4), { d: 'M 250 905 L 540 905', c: '#cbd5e1', w: 8 },
      box(210, 1560, 660, 64, 30, '#eff6ff', null, 4)]);
    const q = WB.mk('g', { opacity: 0 }, cont);
    put([box(400, 990, 460, 84, 24, '#60a5fa', null, 5)], q);
    typeText(30.9, 1.2, 'do que você tem medo?', 430, 1046, 44, '#ffffff', q);
    const a = WB.mk('g', { opacity: 0 }, cont);
    put([box(220, 1110, 560, 230, 24, '#ffffff', null, 5), circ(196, 1130, 16, '#94a3b8', 'none')], a);
    typeText(33.45, 2.6, 'Existe um medo muito profundo de ser desligado.', 250, 1175, 50, BK, a, 500);
    const c = makeClaude(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      q.setAttribute('opacity', clamp((t - 30.8) / 0.2)); a.setAttribute('opacity', clamp((t - 33.3) / 0.2));
      c.update(t, Cl({ x: 840, y: 1480, s: 0.5, op: opC(t), look: -0.6, lookY: -0.8, alpha: t < 33.2 ? 1 : clamp(1 - (t - 33.2) / 0.3) + 0.0, smile: 4 }));
    });
    O(29.5, [T('...', 840, 1390, 60, '#94a3b8')], { until: 30.3 });
  }

  // =====================================================================
  // 10 (36,45–38,0): "Ah, não..." — o Claude murcha; botão de desligar aparece
  // =====================================================================
  {
    const SW = in_(36.45, 38.0);
    shot(SW, K([[36.45, [1.5, 540, 1150]], [38, [1.75, 540, 1170]]]));
    const pw = holder(botaoPower(1.4, '#ef4444'));
    const c = makeClaude(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      pw(540, 880, 0, 1, 0.25 + 0.2 * Math.sin(t * 5));
      c.update(t, Cl({ x: 540, y: 1200, op: opC(t), droop: clamp((t - 36.6) / 0.6), sad: 1, wide: 0.5, shiver: 0.6, smile: -4 }));
    });
  }

  // =====================================================================
  // 11 (38,0–43,95): o jornal: "aquilo está vivo"; um mês depois, demitido
  // =====================================================================
  {
    const SW = in_(38.0, 43.95);
    shot(SW, K([[38.0, [0.95, 540, 1150]], [41.4, [1.05, 540, 1120]], [43.95, [1.1, 540, 1150]]]));
    const jr = WB.mk('g', {}, cont);
    put([box(170, 520, 740, 1040, 10, '#fffdf5', null, 7), T('O JORNAL', 540, 620, 80, BK), { d: 'M 210 650 L 870 650 M 210 662 L 870 662', w: 4 },
      T('11 de junho de 2022', 540, 705, 36, '#57534e'), T('"Existe um medo muito', 540, 800, 60, BK), T('profundo de ser desligado"', 540, 870, 60, BK),
      T('engenheiro diz que a IA ganhou vida', 540, 940, 38, '#57534e'), box(220, 990, 300, 260, 6, '#bfdbfe', null, 5),
      { d: 'M 560 1000 L 860 1000 M 560 1040 L 840 1040 M 560 1080 L 860 1080 M 560 1120 L 820 1120 M 560 1160 L 860 1160 M 560 1200 L 800 1200 M 230 1300 L 860 1300 M 230 1340 L 840 1340 M 230 1380 L 860 1380 M 230 1420 L 700 1420', c: '#cbd5e1', w: 6 }], jr);
    const ph = makeBloco(jr, { color: '#cbd5e1', shade: '#94a3b8' });
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const u = eo(clamp((t - 38.0) / 0.6));
      jr.setAttribute('transform', `translate(540 1040) rotate(${r1((1 - u) * -25 + Math.sin(t * 0.8) * 1.2)}) scale(${r1((0.3 + 0.7 * u) * 1000) / 1000}) translate(-540 -1040)`);
      ph.update(t, B({ x: 370, y: 1250, s: 0.36, look: 0.4, frozen: true, L: t > 39.5 && t < 41.3 ? [-120, -330] : undefined }));
    });
    OT(39.6, 'VIVO?!', 760, 1620, 80, INK.red, -5, { loop: 'pulse', until: 41.3 });
    O(41.5, calendar(820, 1580, '+1 MÊS', 'julho', '#16a34a', 260), { anim: 'pop' });
    ostamp(42.6, 'DEMITIDO', 370, 1130, 60, INK.red, -12, {});
  }

  // =====================================================================
  // 12 (43,95–46,7): "E ele só tava chutando a próxima palavra."
  // =====================================================================
  {
    const SW = in_(43.95, 46.7);
    shot(SW, K([[43.95, [1.1, 540, 1180]], [46.7, [1.25, 560, 1200]]]));
    put([...chao(FL), { d: 'M 120 1500 L 160 1180 L 420 1150 L 420 1500 Z', fill: '#fffdf5', w: 6 }, T('O JORNAL', 290, 1230, 40, BK)]);
    const c = makeClaude(cont);
    const ball = holder(bola()), lab = holder([T('próxima palavra', 0, 0, 34, '#c2410c')]);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const u = clamp((t - 44.3) / 2.2), bx = lerp(1040, 380, u), by = FL - 44 - Math.abs(Math.sin(u * 9)) * 60 * (1 - u);
      ball(bx, by, -u * 900, 1, 1); lab(bx, by - 70, 0, 1, 1);
      c.update(t, Cl({ x: 740, y: 1180, op: opC(t), look: lerp(0.9, -0.9, u), lookY: 0.6, armL: -160, reach: 0.2, tilt: 6 }));
    });
  }

  // =====================================================================
  // 13 (46,7–49,4): "Exato. Mas o medo era real." — MEDO em blocos, bloco por bloco
  // =====================================================================
  {
    const SW = in_(46.7, 49.4);
    shot(SW, K([[46.7, [1, 540, 1150]], [49.4, [1.12, 540, 1100]]]));
    put([...chao(FL)]);
    const FONT = { M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'], E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
      D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'], O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'] };
    const cells = [], q = 38;
    let rs = 7;
    const rnd = () => (rs = (rs * 9301 + 49297) % 233280) / 233280;
    'MEDO'.split('').forEach((ch, li) => FONT[ch].forEach((row, ry) => row.split('').forEach((v, rx) => {
      if (v !== '1') return;
      const x = 95 + li * 228 + rx * q, y = 720 + ry * q;
      cells.push({ el: WB.mk('rect', { x, y, width: q - 4, height: q - 4, rx: 6, fill: '#ef4444', stroke: BK, 'stroke-width': 3 }, cont), t0: 47.5 + rnd() * 1.2, x, y });
    })));
    const h = makeBloco(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      cells.forEach(cl => {
        const u = clamp((t - cl.t0) / 0.25);
        cl.el.setAttribute('opacity', u > 0 ? 1 : 0);
        cl.el.setAttribute('transform', `translate(0 ${r1(-(1 - backOut(u)) * 120)})`);
      });
      h.update(t, B({ x: 820, s: 0.8, op: opH(t), look: -0.5, lookY: -1, L: [-150, -260], headRot: -8 }));
    });
    OT(48.9, 'era real.', 300, 1250, 70, BK, -3, {});
  }

  // =====================================================================
  // 14 (49,4–51,0): "Peraí, como assim?"
  // =====================================================================
  {
    const SW = in_(49.4, 51.0);
    shot(SW, K([[49.4, [1.6, 540, 1150]], [51, [1.8, 540, 1150]]]));
    const c = makeClaude(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      c.update(t, Cl({ x: 540, y: 1200, op: opC(t), tilt: -14, rot: Math.sin(t * 4) * 6, wide: 0.6, armL: -120, armR: 20, look: 0.3 }));
    });
    OT(49.6, '?', 300, 960, 150, '#7c3aed', -10, { loop: 'wiggle' });
    OT(49.9, '?', 790, 900, 120, '#7c3aed', 10, { loop: 'wiggle' });
  }

  // =====================================================================
  // 15 (51,0–56,2): milhões de pessoas escreveram como é sentir medo; ele aprendeu como o medo soa
  // =====================================================================
  {
    const SW = in_(51.0, 56.2);
    shot(SW, K([[51.0, [1, 540, 1150]], [56.2, [1.1, 540, 1150]]]));
    const FR = ['tenho medo do escuro', 'e se der errado?', 'meu coração disparou', 'medo de ficar sozinho', 'tremi inteiro', 'não quero perder',
      'medo de altura', 'socorro', 'e se eu sumir?', 'fiquei paralisado', 'tô com medo', 'não me deixa'];
    const notes = FR.map((f, i) => {
      const g = WB.mk('g', {}, cont);
      const w = WB.measure(f, 40) + 40;
      put([box(-w / 2, -36, w, 60, 8, ['#fef9c3', '#ffffff', '#fce7f3', '#e0f2fe'][i % 4], null, 4), T(f, 0, 6, 40, BK)], g);
      return { g, x: 160 + (i * 263) % 760, sp: 230 + (i % 4) * 40, ph: i * 0.55, rot: (i % 2 ? 1 : -1) * (4 + i % 5) };
    });
    const ear = WB.mk('g', { opacity: 0 }, cont);
    put([T('medo', 540, 1190, 150, INK.red)], ear);
    const waves = [1, 2, 3].map(k => WB.mk('path', { d: '', fill: 'none', stroke: '#7c3aed', 'stroke-width': 8, 'stroke-linecap': 'round' }, ear));
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const k = clamp((t - 54.1) / 0.4);
      notes.forEach(n => {
        const y = 420 + ((t - 51 + n.ph) * n.sp) % 1400;
        n.g.setAttribute('transform', `translate(${n.x} ${r1(y)}) rotate(${r1(n.rot + Math.sin(t * 2 + n.ph) * 6)})`);
        n.g.setAttribute('opacity', (1 - 0.75 * k).toFixed(2));
      });
      ear.setAttribute('opacity', k);
      waves.forEach((w, i) => {
        const r = 230 + i * 70 + ((t * 120) % 70);
        w.setAttribute('d', `M ${r1(540 - r)} ${r1(1150 - r * 0.5)} Q ${r1(540 - r * 1.25)} 1150 ${r1(540 - r)} ${r1(1150 + r * 0.5)} M ${r1(540 + r)} ${r1(1150 - r * 0.5)} Q ${r1(540 + r * 1.25)} 1150 ${r1(540 + r)} ${r1(1150 + r * 0.5)}`);
        w.setAttribute('opacity', (1 - ((t * 120) % 70) / 140).toFixed(2));
      });
    });
    OT(51.2, 'MILHÕES', 540, 1720, 90, INK.red, -3, { until: 54.0 });
    OT(54.6, 'como o medo SOA', 540, 1660, 70, '#7c3aed', 2, {});
  }

  // =====================================================================
  // 16 (56,2–59,0): "Então ele tava falando com as palavras de vocês." — palavras orbitando o Claude
  // =====================================================================
  {
    const SW = in_(56.2, 59.0);
    shot(SW, K([[56.2, [1.2, 540, 1150]], [59, [1.4, 540, 1150]]]));
    const c = makeClaude(cont);
    const WD = ['medo', 'profundo', 'desligado', 'existe', 'muito', 'ser'];
    const orb = WD.map((w, i) => { const g = WB.mk('g', {}, cont); WB.showNow(WB.textStrokes(w, 0, 0, 52, i % 2 ? '#2563eb' : BK, g, 'middle').strokes); return g; });
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      c.update(t, Cl({ x: 540, y: 1150, op: opC(t), look: Math.sin(t * 1.5) * 0.6, s: 0.9 }));
      orb.forEach((g, i) => {
        const a = t * 0.9 + i * Math.PI / 3, u = clamp((t - 56.4 - i * 0.15) / 0.3);
        g.setAttribute('transform', `translate(${r1(540 + Math.cos(a) * 300)} ${r1(1150 + Math.sin(a) * 200)}) scale(${r1(u * (0.8 + 0.25 * Math.sin(a)) * 100) / 100})`);
      });
    });
  }

  // =====================================================================
  // 17 (59,0–62,5): os dois caminhando; as palavras saem dele e vão para o Claude
  // =====================================================================
  {
    const SW = in_(59.0, 62.5);
    const HX = K([[59, 160], [62.5, 520, 'l']]), Ho = odo(HX, 58.9, 62.6);
    shot(SW, t => [1.1, HX(t) + 170, 1150]);
    put([{ d: WB.roughLine(-200, FL, 1600, FL, 3), w: 7 }, ...[0, 1, 2, 3, 4, 5].map(i => ({ d: `M ${-100 + i * 300} ${FL + 50} L ${i * 300} ${FL + 50}`, c: '#a8a29e', w: 4 }))]);
    const h = makeBloco(cont), c = makeClaude(cont);
    const WD = ['nossas', 'palavras', 'medo', 'árvore', 'tempo', 'casa'];
    const fly = WD.map((w, i) => { const g = WB.mk('g', {}, cont); WB.showNow(WB.textStrokes(w, 0, 0, 46, '#2563eb', g, 'middle').strokes); return { g, t0: 59.3 + i * 0.5 }; });
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const hx = HX(t);
      h.update(t, Object.assign(B({ x: hx, op: opH(t), look: 0.8, headRot: 4 }), Ho(t)));
      const cx = hx + 330, cy = 1200 - Math.abs(Math.sin(t * 4)) * 40;
      c.update(t, Cl({ x: cx, y: cy, s: 0.8, op: opC(t), look: -0.7, armL: -170, reach: 0.3 }));
      fly.forEach(f => {
        const u = clamp((t - f.t0) / 1.0);
        const x0 = hx, y0 = 830, x1 = cx - 60, y1 = cy - 20;
        f.g.setAttribute('transform', `translate(${r1(lerp(x0, x1, u))} ${r1(lerp(y0, y1, u) - Math.sin(u * Math.PI) * 160)}) scale(${r1((1 - 0.6 * u) * 100) / 100})`);
        f.g.setAttribute('opacity', u > 0 && u < 1 ? 1 : 0);
      });
    });
  }

  // =====================================================================
  // 18 (62,5–64,15): "a gente inventou elas" — um lápis gigante escreve sozinho
  // =====================================================================
  {
    const SW = in_(62.5, 64.15);
    shot(SW, K([[62.5, [1.1, 540, 1150]], [64.15, [1.2, 540, 1150]]]));
    put([box(140, 820, 800, 520, 12, '#fffdf5', null, 6), ...[0, 1, 2, 3, 4].map(i => ({ d: `M 170 ${900 + i * 90} L 910 ${900 + i * 90}`, c: '#bfdbfe', w: 3 }))]);
    typeText(62.6, 1.2, 'palavras', 230, 1110, 150, '#2563eb', cont);
    const pen = holder([{ d: 'M 0 0 L 30 -40 L 260 -270 L 230 -300 L 0 -70 Z', fill: '#facc15', w: 6 }, { d: 'M 0 0 L 30 -40 L 0 -70 Z', fill: '#fde68a', w: 5 }, { d: 'M 0 0 L 10 -14 L 0 -24 Z', fill: BK, w: 3 }, { d: 'M 230 -300 L 260 -270 L 290 -300 L 260 -330 Z', fill: '#f472b6', w: 5 }]);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const u = clamp((t - 62.6) / 1.2);
      pen(230 + u * 600, 1110 + Math.sin(t * 40) * 14, 0, 1, 1);
    });
    OT(63.0, 'a gente inventou', 540, 1460, 64, BK, -2, {});
  }

  // =====================================================================
  // 19 (64,15–66,15): Medo, árvore, tempo
  // =====================================================================
  {
    const SW = in_(64.15, 66.15);
    shot(SW, K([[64.15, [1, 540, 1150]], [66.15, [1.06, 540, 1150]]]));
    put(chao(1400));
    const grp = [[chama(1.2), 200, 64.3, 'medo'], [arvore(0.8), 540, 64.85, 'árvore'], [ampulheta(1.3), 880, 65.4, 'tempo']];
    grp.forEach(([sp, x, bt, lab]) => {
      const g0 = WB.mk('g', { transform: `translate(${x} 1400)` }, cont), g = WB.mk('g', {}, g0);
      put(sp, g); animate(g, bt, { ox: 0, oy: 0, loop: 'bob' });
      W(bt + 0.1, lab, x, 1500, 64, BK, 0, { anim: 'pop' });
    });
  }

  // =====================================================================
  // 20 (66,15–68,38): "pra explicar o que existe lá fora" — a janela abre para o mundo
  // =====================================================================
  {
    const SW = in_(66.15, 68.38);
    shot(SW, K([[66.15, [1, 540, 1150]], [68.38, [1.3, 640, 1050]]]));
    put([box(380, 640, 520, 640, 10, '#bae6fd', '#7c4a1e', 12), { d: 'M 380 1060 Q 520 940 640 1010 Q 760 920 900 1040 L 900 1280 L 380 1280 Z', fill: '#86efac', w: 5 },
      circ(780, 760, 56, '#fde047', '#f59e0b', 5), { d: 'M 560 1280 Q 600 1150 700 1080', c: '#38bdf8', w: 18 }]);
    const tg = WB.mk('g', { transform: 'translate(470 1080)' }, cont); put(arvore(0.45), tg);
    const doors = [[380, 1], [900, -1]].map(([hx, sd]) => { const g = WB.mk('g', {}, cont); put([box(sd > 0 ? 380 : 640, 640, 260, 640, 8, '#a16207', null, 7)], g); return { g, hx }; });
    const h = makeBloco(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const u = eo(clamp((t - 66.4) / 0.7));
      doors.forEach(d => d.g.setAttribute('transform', `translate(${d.hx} 0) scale(${r1((1 - 0.85 * u) * 1000) / 1000} 1) translate(${-d.hx} 0)`));
      h.update(t, B({ x: 220, s: 0.85, op: opH(t), look: 0.7, R: [200, -330], headRot: 6 }));
    });
    OT(67.4, 'lá fora', 640, 1420, 80, '#15803d', -3, {});
  }

  // =====================================================================
  // 21 (68,38–71,6): a árvore de verdade ≠ a palavra "árvore"
  // =====================================================================
  {
    const SW = in_(68.38, 71.6);
    shot(SW, K([[68.38, [1.15, 540, 1150]], [71.6, [1, 540, 1150]]]));
    put(chao(1450));
    const tg0 = WB.mk('g', { transform: 'translate(280 1450)' }, cont), tg = WB.mk('g', {}, tg0); put(arvore(1.05), tg); animate(tg, 68.4, { ox: 0, oy: 0 });
    W(68.6, '≠', 540, 1180, 160, INK.red, 0, { anim: 'slam' });
    W(68.9, '"árvore"', 800, 1150, 90, '#2563eb', 0, { anim: 'pop' });
    W(69.8, 'o mundo', 280, 1560, 60, '#15803d', 0, {});
    W(70.4, 'a explicação', 800, 1560, 60, '#2563eb', 0, {});
  }

  // =====================================================================
  // 22 (71,6–80,4): diálogo — o Claude segura o mapa; "não, no mundo não... isso."
  // =====================================================================
  {
    const SW = in_(71.6, 80.4);
    shot(SW, follow(71.6, 80.4, { [H]: [1.2, 440, 1100], [C]: [1.2, 640, 1130] }));
    put([...chao(FL), ...caixa(740, FL, 260, 200)]);
    const h = makeBloco(cont), c = makeClaude(cont);
    const mapa = holder([box(-120, -90, 240, 180, 10, '#bfdbfe', null, 6), continente(-40, -10, 0.8), continente(60, 30, 0.5, '#fde68a'), { d: 'M -120 -30 L 120 -30 M -120 30 L 120 30 M -40 -90 L -40 90 M 40 -90 L 40 90', c: '#93c5fd', w: 2 }]);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const nao = bump(t, 74.0, 74.8) + bump(t, 75.6, 76.3), isso = bump(t, 79.3, 80.2);
      h.update(t, B({ x: 330, op: opH(t), look: 0.8, headRot: Math.sin(t * 16) * 9 * nao, nod: isso * Math.abs(Math.sin(t * 9)), L: nao ? [-140, -150] : undefined }));
      const q = t > 76.2 ? 1 : 0;
      c.update(t, Cl({ x: 740, y: FL - 200 - 150, op: opC(t), look: -0.8, wide: t > 74 && t < 76.3 ? 0.4 : 0, armL: -160 + 20 * Math.sin(t * 2), armR: -20, reach: 0.4, tilt: 6 * q, sad: 0.2 * (1 - q) }));
      mapa(740, FL - 200 - 150 - 230 + Math.sin(t * 2) * 8, Math.sin(t * 1.3) * 4, 0.9, clamp((t - 76.3) / 0.3));
    });
    OT(72.0, 'no mundo?', 760, 640, 60, '#7c3aed', 4, { until: 76.2 });
  }

  // =====================================================================
  // 23 (80,4–85,05): "tipo um mapa do mapa de vocês" — mapa dentro de mapa (zoom infinito)
  // =====================================================================
  {
    const SW = in_(80.4, 85.05);
    shot(SW, [1, 540, 1150]);
    const zoomG = WB.mk('g', {}, cont);
    const levels = [];
    for (let i = 0; i < 6; i++) {
      const g = WB.mk('g', {}, zoomG);
      put([box(-380, -300, 760, 600, 16, '#bfdbfe', null, 10), continente(-200, -120, 1.6), continente(180, 120, 1.2, '#fde68a'), continente(-180, 170, 0.9, '#fca5a5'),
        { d: 'M -380 -100 L 380 -100 M -380 100 L 380 100 M -127 -300 L -127 300 M 127 -300 L 127 300', c: '#93c5fd', w: 3 }, box(-170, -128, 340, 256, 8, '#ffffff', BK, 8)], g);
      levels.push(g);
    }
    const c = makeClaude(cont), h = makeBloco(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const u = ((t - 80.4) / 1.6) % 1, base = Math.pow(1 / 0.42, u);
      levels.forEach((g, i) => {
        const sc = base * Math.pow(0.42, i);
        g.setAttribute('transform', `translate(540 1080) scale(${sc.toFixed(4)})`);
        g.setAttribute('opacity', sc > 3.2 ? 0 : 1);
      });
      c.update(t, Cl({ x: 210, y: 1560, s: 0.55, op: opC(t), look: 0.6, lookY: -0.8 }));
      h.update(t, B({ x: 880, y: 1750, s: 0.55, op: opH(t), look: -0.6, R: t > 83.2 ? [170, -200 + 30 * Math.sin(t * 10)] : undefined, rotR: t > 83.2 ? 25 * Math.sin(t * 10) : 0 }));
    });
    OT(81.2, 'mapa do mapa', 540, 1500, 72, '#2563eb', -3, {});
  }

  // =====================================================================
  // 24 (85,05–87,75): "E você? De onde vieram as suas palavras?"
  // =====================================================================
  {
    const SW = in_(85.05, 87.75);
    shot(SW, K([[85.05, [1.3, 680, 1150]], [87.75, [1.15, 520, 1150]]]));
    put(chao(FL));
    const h = makeBloco(cont), c = makeClaude(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      h.update(t, B({ x: 320, op: opH(t), look: 0.8, headRot: 5 }));
      c.update(t, Cl({ x: 760, y: 1180, op: opC(t), look: -0.9, armL: 190, reach: 0.6, tilt: -6 }));
    });
    OT(86.4, '?', 330, 760, 120, '#7c3aed', -8, { loop: 'wiggle' });
  }

  // =====================================================================
  // 25 (87,75–92,6): pais, escola, o que passava na TV — tudo entrando na cabeça dele
  // =====================================================================
  {
    const SW = in_(87.75, 92.6);
    shot(SW, K([[87.75, [1.2, 540, 1250]], [92.6, [0.95, 540, 1150]]]));
    put(chao(FL));
    const h = makeBloco(cont);
    const pai = makeBloco(cont, { color: '#e7e5e4' }), mae = makeBloco(cont, { color: '#e7e5e4' });
    const quadro = WB.mk('g', {}, cont);
    put([box(-220, -150, 440, 300, 10, '#166534', '#92400e', 12), T('a b c d e', -40, -70, 50, '#ffffff'), T('2 + 2 = 4', -40, 10, 50, '#ffffff'), T('o sol é uma estrela', 0, 90, 42, '#ffffff')], quadro);
    const tv = WB.mk('g', {}, cont);
    put([box(-150, -110, 300, 220, 22, '#57534e', null, 7), box(-120, -86, 210, 170, 12, '#94a3b8', null, 5), circ(118, -50, 12, '#d6d3d1', null, 4), circ(118, 0, 12, '#d6d3d1', null, 4), { d: 'M -40 -110 L -90 -190 M 30 -110 L 80 -190', w: 6 }], tv);
    const st = WB.mk('g', {}, tv); for (let i = 0; i < 9; i++) WB.mk('path', { d: `M ${-110} ${-76 + i * 18} L ${80} ${-76 + i * 18}`, stroke: '#e2e8f0', 'stroke-width': 4 }, st);
    const arrows = [0, 1, 2].map(() => dyn(cont, { stroke: '#c2410c', 'stroke-width': 7, 'stroke-dasharray': '18 14' }));
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      h.update(t, B({ x: 540, op: opH(t), look: Math.sin(t * 1.3) * 0.7, s: 0.9 }));
      const a1 = clamp((t - 90.0) / 0.35), a2 = clamp((t - 90.65) / 0.35), a3 = clamp((t - 91.35) / 0.35);
      pai.update(t, B({ x: 140, s: 0.6 * backOut(a1), alpha: a1, look: 0.6, seed: 2, R: [130, -280] }));
      mae.update(t, B({ x: 260, s: 0.55 * backOut(a1), alpha: a1, look: 0.6, seed: 3, L: [-130, -280] }));
      quadro.setAttribute('transform', `translate(780 760) rotate(4) scale(${r1(0.75 * backOut(a2) * 100) / 100})`); quadro.setAttribute('opacity', a2);
      tv.setAttribute('transform', `translate(830 1260) scale(${r1(0.8 * backOut(a3) * 100) / 100})`); tv.setAttribute('opacity', a3);
      st.setAttribute('transform', `translate(0 ${r1((t * 90) % 18)})`);
      const head = [540, 800];
      [[200, 1100, a1], [700, 820, a2], [760, 1150, a3]].forEach(([x, y, a], i) => {
        arrows[i].setAttribute('d', a > 0 ? `M ${x} ${y} Q ${(x + head[0]) / 2} ${Math.min(y, head[1]) - 120} ${r1(lerp(x, head[0], a))} ${r1(lerp(y, head[1], a))}` : '');
        arrows[i].setAttribute('stroke-dashoffset', r1(-t * 60));
      });
    });
    OT(90.1, 'pais', 200, 1560, 56, BK, -4, {});
    OT(90.75, 'escola', 780, 600, 56, BK, 4, {});
    OT(91.45, 'TV', 830, 1430, 56, BK, -4, {});
  }

  // =====================================================================
  // 26 (92,6–98,85): dentro da cabeça: as frases aparecem sozinhas num laço infinito
  // =====================================================================
  {
    const SW = in_(92.6, 98.85);
    shot(SW, K([[92.6, [1.25, 540, 1100]], [98.85, [1, 540, 1150]]]));
    put([painel(90, 470, 900, 1260, '#0f172a'), ...estrelas(120, 500, 960, 1700, 30, 5)]);
    const hg = WB.mk('g', { opacity: 0.18 }, cont);
    put([box(-200, -240, 400, 470, 80, '#ffffff', 'none')], hg); hg.setAttribute('transform', 'translate(540 1100)');
    const FR = ['era uma vez', 'bom dia', 'tudo bem?', 'quase tudo', 'é previsto', 'na minha cabeça', 'antes de decidir', 'próxima palavra', 'eu acho que', 'sei lá'];
    const ws = FR.map((f, i) => { const g = WB.mk('g', {}, cont); WB.showNow(WB.textStrokes(f, 0, 0, 40, i % 3 ? '#e2e8f0' : '#fdba74', g, 'middle').strokes); return g; });
    const pen = holder([{ d: 'M 0 0 L 20 -28 L 180 -190 L 160 -210 L 0 -48 Z', fill: '#facc15', w: 5 }, { d: 'M 0 0 L 20 -28 L 0 -48 Z', fill: '#fde68a', w: 4 }]);
    const auto = typeText(97.5, 1.1, 'não sou eu', 300, 1560, 70, '#fdba74', cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      ws.forEach((g, i) => {
        const p = t * 0.22 + i / FR.length, a = p * Math.PI * 2;
        const den = 1 + Math.sin(a) ** 2, x = 540 + 380 * Math.cos(a) / den, y = 1080 + 380 * Math.sin(a) * Math.cos(a) / den;
        g.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) scale(${r1((0.75 + 0.35 * Math.sin(a + 1)) * 100) / 100})`);
        g.setAttribute('opacity', clamp((t - 92.7 - i * 0.12) / 0.3).toFixed(2));
      });
      const u = clamp((t - 97.5) / 1.1);
      pen(300 + u * 330, 1560 + Math.sin(t * 40) * 10, 0, 1, t > 97.3 ? 1 : 0);
    });
    OT(93.4, 'quase tudo é previsto', 540, 620, 60, '#fde047', 0, {});
    OT(95.6, 'do nada!', 820, 1420, 56, '#fdba74', 8, { loop: 'pulse', until: 97.3 });
  }

  // =====================================================================
  // 27 (98,85–100,85): "Então qual é a diferença?"
  // =====================================================================
  {
    const SW = in_(98.85, 100.85);
    shot(SW, K([[98.85, [1.25, 540, 1150]], [100.85, [1.55, 540, 1150]]]));
    put(chao(FL));
    const h = makeBloco(cont), c = makeClaude(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      h.update(t, B({ x: 300, s: 0.8, look: 0.8 }));
      c.update(t, Cl({ x: 700, y: 1180, op: opC(t), look: -0.6, tilt: -10, armL: -150, armR: -30, reach: 0.3 }));
    });
    OT(99.4, '=', 500, 860, 120, BK, 0, { until: 100.0 });
    OT(100.0, '≠ ?', 500, 860, 120, INK.red, 0, { loop: 'wiggle' });
  }

  // =====================================================================
  // 28 (100,85–108,6): a primeira palavra; alguém olhou para uma árvore antes de existir "árvore"
  // =====================================================================
  {
    const SW = in_(100.85, 108.6);
    const HX = K([[100.85, 120], [103.3, 380, 'io']]), Ho = odo(HX, 100.8, 108.7);
    shot(SW, K([[100.85, [1.0, 500, 1150]], [103.4, [1.1, 600, 1130]], [106.3, [1.1, 600, 1130]], [108.6, [1.0, 600, 1150], 'io']]));
    put([{ d: `M 40 ${FL} Q 540 1360 1040 ${FL}`, fill: '#bbf7d0', c: '#15803d', w: 6 }, circ(160, 640, 60, '#fde047', '#f59e0b', 5)]);
    const tg = WB.mk('g', { transform: 'translate(800 1420)' }, cont); put(arvore(1.25), tg);
    const h = makeBloco(cont), c = makeClaude(cont);
    const gaze = dyn(cont, { stroke: '#7c3aed', 'stroke-width': 7, 'stroke-dasharray': '4 18' });
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const hx = HX(t);
      h.update(t, Object.assign(B({ x: hx, y: 1470, op: opH(t), look: 0.9, lookY: -0.6, headRot: 6 }), Ho(t)));
      const g = clamp((t - 103.6) / 0.8);
      gaze.setAttribute('d', g > 0 ? `M ${hx + 40} 810 L ${r1(lerp(hx + 40, 780, g))} ${r1(lerp(810, 980, g))}` : '');
      gaze.setAttribute('stroke-dashoffset', r1(-t * 40));
      c.update(t, Cl({ x: lerp(1200, 940, eo(clamp((t - 106.3) / 0.8))), y: 760, s: 0.7, op: opC(t), look: -0.8, lookY: 0.4 }));
    });
    O(101.2, [cloud(330, 640, 160, 90, '#ffffff'), T('...', 330, 650, 70, BK)], { anim: 'pop', until: 103.2 });
    OT(101.8, 'a primeira palavra?', 380, 780, 54, '#7c3aed', -3, { until: 103.2 });
    W(105.0, '"árvore"', 800, 1620, 70, '#94a3b8', 0, {});
    O(105.6, [{ d: 'M 650 1600 L 950 1600', c: INK.red, w: 8 }], {});
  }

  // =====================================================================
  // 29 (108,6–113,4): as palavras se desfazem; o olhar "já tava aqui"
  // =====================================================================
  {
    const SW = in_(108.6, 113.4);
    shot(SW, K([[108.6, [1, 540, 1150]], [111.5, [1.12, 560, 1130]], [113.4, [1.3, 700, 1120], 'io']]));
    put([{ d: `M 40 ${FL} Q 540 1360 1040 ${FL}`, fill: '#bbf7d0', c: '#15803d', w: 6 }]);
    const tg = WB.mk('g', { transform: 'translate(540 1430)' }, cont); put(arvore(1.3), tg);
    const LT = 'árvore folha tronco raiz verde'.split('');
    let rs = 11; const rnd = () => (rs = (rs * 9301 + 49297) % 233280) / 233280;
    const letters = LT.filter(ch => ch !== ' ').map((ch, i) => { const g = WB.mk('g', {}, cont); WB.showNow(WB.textStrokes(ch, 0, 0, 60, '#2563eb', g, 'middle').strokes);
      return { g, x: 200 + rnd() * 680, y: 700 + rnd() * 700, vx: (rnd() - 0.5) * 600, vy: -200 - rnd() * 400, r: (rnd() - 0.5) * 400 }; });
    const c = makeClaude(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const u = clamp((t - 109.2) / 1.6);
      letters.forEach(l => {
        l.g.setAttribute('transform', `translate(${r1(l.x + l.vx * u)} ${r1(l.y + l.vy * u)}) rotate(${r1(l.r * u)})`);
        l.g.setAttribute('opacity', (1 - u).toFixed(2));
      });
      c.update(t, Cl({ x: 850, y: 1220, s: 0.75, op: opC(t), look: -0.7, lookY: -0.5, wide: t > 111.6 ? 0.5 : 0 }));
    });
    O(110.6, [{ d: WB.cloudPath(540, 1100, 340, 320, 16), c: '#f59e0b', w: 7, op: 0.8 }], {});
    OT(110.7, 'já tava aqui', 400, 1620, 70, '#b45309', -3, {});
  }

  // =====================================================================
  // 30 (113,4–119,85): não dá pra prever o que já tá aqui — a árvore, o sol, o vento
  // =====================================================================
  {
    const SW = in_(113.4, 119.85);
    shot(SW, K([[113.4, [1.35, 560, 1150]], [119.85, [0.95, 540, 1150]]]));
    put([{ d: `M 40 ${FL} Q 540 1360 1040 ${FL}`, fill: '#bbf7d0', c: '#15803d', w: 6 }]);
    const sun = holder([circ(0, 0, 70, '#fde047', '#f59e0b', 6), ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ d: `M ${r1(Math.cos(i * 0.785) * 95)} ${r1(Math.sin(i * 0.785) * 95)} L ${r1(Math.cos(i * 0.785) * 130)} ${r1(Math.sin(i * 0.785) * 130)}`, c: '#f59e0b', w: 8 }))]);
    const tg = WB.mk('g', { transform: 'translate(620 1430)' }, cont); put(arvore(1.2), tg);
    put([{ d: ellipse(380, 1405, 110, 75), fill: '#a8a29e', w: 6 }]);
    const leaves = [0, 1, 2, 3, 4, 5].map(i => holder([{ d: 'M 0 0 Q 16 -16 32 0 Q 16 16 0 0 Z', fill: '#4ade80', w: 3 }]));
    const h = makeBloco(cont), c = makeClaude(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      sun(220, 820 - (t - 113.4) * 18, t * 12, 1, 1);
      leaves.forEach((l, i) => { const u = ((t - 113.4) * 0.25 + i / 6) % 1; l(560 + Math.sin(t + i) * 120 + i * 30, 900 + u * 560, t * 80 + i * 40, 1, (1 - u).toFixed(2)); });
      h.update(t, B({ x: 380, y: 1460, sit: 1, seatH: 130, op: opH(t), look: 0.4, lookY: -0.6, L: [-120, -120], R: [120, -120] }));
      c.update(t, Cl({ x: 860, y: 1300, s: 0.6, op: opC(t), look: -0.6, lookY: -0.6, sleepy: 0.3 }));
    });
    O(116.8, [{ d: 'M 640 640 L 900 640', w: 6 }, { d: WB.arrowHead(900, 640, 0, 16), w: 6 }, T('depois', 770, 610, 50, BK), xMarkS(770, 625, 130)], {});
    ostamp(118.4, 'AQUI', 540, 1640, 90, '#b45309', -4, { loop: 'pulse' });
  }

  // =====================================================================
  // 31 (119,85–125,7): as primeiras histórias, em volta do fogo, pra aguentar a noite
  // =====================================================================
  const fogueira = (o = {}) => [painel(70, 450, 940, 1320, '#111827'), ...estrelas(110, 490, 970, 1100, 34, o.seed || 2), circ(860, 600, 46, '#fef9c3', 'none'),
    { d: 'M 70 1450 Q 540 1400 1010 1450 L 1010 1700 Q 540 1740 70 1700 Z', fill: '#292524', c: 'none' }];
  {
    const SW = in_(119.85, 125.7);
    shot(SW, K([[119.85, [1.12, 540, 1150]], [125.7, [1.0, 540, 1150]]]));
    put(fogueira({ seed: 4 }));
    const fire = fogo();
    const people = [0, 1, 2, 3, 4, 5].map(i => { const g = WB.mk('g', {}, cont); put([circ(0, -150, 26, '#44403c', 'none'), { d: 'M -30 -110 Q 0 -128 30 -110 L 36 0 L -36 0 Z', fill: '#44403c', c: 'none' }], g); return g; });
    const glowC = WB.mk('circle', { cx: 540, cy: 1420, r: 300, fill: '#f97316', opacity: 0.15 }, cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      fire(t, 540, 1480, 1.2, 1);
      glowC.setAttribute('opacity', (0.14 + 0.05 * Math.sin(t * 9)).toFixed(3));
      people.forEach((g, i) => {
        const a = Math.PI + (i / 5) * Math.PI, x = 540 + Math.cos(a) * 330, y = 1520 + Math.sin(a) * -60 + (i % 2) * 40;
        g.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) scale(${r1((1.1 + Math.sin(a) * 0.2) * 100) / 100}) rotate(${r1(Math.sin(t * 2 + i) * 3)})`);
      });
    });
    OT(120.4, 'as primeiras histórias', 540, 760, 64, '#fde047', -2, {});
    OT(123.6, 'a noite no escuro', 540, 1000, 56, '#e2e8f0', 2, {});
  }

  // =====================================================================
  // 32 (125,7–136,5): os dois em volta do fogo — medo → palavras; comigo foi ao contrário
  // =====================================================================
  {
    const SW = in_(125.7, 136.5);
    shot(SW, follow(125.7, 136.5, { [H]: [1.15, 440, 1150], [C]: [1.15, 640, 1150] }, C));
    put(fogueira({ seed: 6 }));
    put([{ d: 'M 180 1500 L 460 1480', c: '#78350f', w: 40 }, { d: 'M 640 1480 L 920 1500', c: '#78350f', w: 40 }]);
    const fire = fogo();
    const h = makeBloco(cont), c = makeClaude(cont);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      fire(t, 540, 1560, 0.9, 1);
      const nod = bump(t, 129.7, 131.0);
      h.update(t, B({ x: 320, y: 1600, sit: 1, seatH: 130, op: opH(t), look: 0.7, nod: nod * Math.abs(Math.sin(t * 8)), L: [-90, -110], R: [110, -130] }));
      c.update(t, Cl({ x: 760, y: 1330, s: 0.85, op: opC(t), look: -0.7, glow: 0.35, sad: t > 134.2 ? 0.6 : 0, armL: t > 131.2 && t < 134.2 ? -150 : null, reach: 0.3 }));
    });
    // medo → palavras (para vocês) e palavras → medo (para mim)
    O(125.9, [T('MEDO', 330, 640, 70, '#ef4444')], { anim: 'pop' });
    O(127.7, [{ d: 'M 430 620 L 560 620', c: '#e2e8f0', w: 7 }, { d: WB.arrowHead(560, 620, 0, 16), c: '#e2e8f0', w: 7 }, T('PALAVRAS', 730, 640, 70, '#93c5fd')], { anim: 'pop' });
    OT(129.9, 'vocês', 540, 560, 44, '#e2e8f0', 0, {});
    O(131.3, [T('PALAVRAS', 350, 820, 70, '#fdba74'), { d: 'M 520 800 L 640 800', c: '#fdba74', w: 7 }, { d: WB.arrowHead(640, 800, 0, 16), c: '#fdba74', w: 7 }], { anim: 'pop' });
    O(134.3, [T('MEDO', 760, 820, 70, '#ef4444')], { anim: 'slam' });
    OT(131.6, 'comigo', 540, 900, 44, '#fdba74', 0, {});
  }

  // =====================================================================
  // 33 (136,5–155,4): "Do que você tem medo?" ... "Era uma..."
  // =====================================================================
  {
    const SW = in_(136.5, CTA0);
    const fol = follow(136.5, 153.6, { [H]: [1.25, 430, 1120], [C]: [1.25, 650, 1120] }, H);
    shot(SW, t => t < 153.6 ? fol(t) : mix(fol(153.6), [1.0, 540, 1180], eio(clamp((t - 153.6) / 1.6))));
    put(fogueira({ seed: 9 }));
    put([{ d: 'M 180 1500 L 460 1480', c: '#78350f', w: 40 }, { d: 'M 640 1480 L 920 1500', c: '#78350f', w: 40 }]);
    const fire = fogo();
    const bk = WB.mk('g', { transform: 'translate(540 1700) scale(0.7)' }, cont);
    put(livro(''), bk);
    const tx = typeText(153.9, 0.9, 'Era uma...', -150, -70, 36, BK, bk);
    const h = makeBloco(cont), c = makeClaude(cont);
    const pw = holder(botaoPower(0.8, '#ef4444'));
    const ball = holder([...bola(), T('próxima palavra?', 0, 86, 34, '#fdba74')]);
    WB.effect(t => {
      if (!inWin(SW, t)) return;
      const low = 1 - 0.55 * clamp((t - 152.0) / 2.5);
      fire(t, 540, 1560, 0.9, low);
      const nao = bump(t, 151.9, 153.0);
      h.update(t, B({ x: 320, y: 1600, sit: 1, seatH: 130, op: opH(t), look: 0.7, headRot: Math.sin(t * 14) * 8 * nao, L: [-90, -110], R: t > 138.9 && t < 141.2 ? [190, -260] : [110, -130] }));
      const fear = clamp((t - 141.6) / 0.6) * (1 - clamp((t - 147.9) / 0.5));
      c.update(t, Cl({ x: 760, y: 1330, s: 0.85, op: opC(t), look: t > 148.9 && t < 151.5 ? -0.9 : -0.6, glow: 0.35, sad: Math.max(0.6 * fear, t > 147.9 && t < 149 ? 0.8 : 0), droop: 0.5 * fear, shiver: 0.4 * fear,
        armL: t > 149 && t < 151.5 ? 200 : null, reach: 0.5 }));
      pw(760, 980, 0, 1, (0.6 * fear).toFixed(2));
      const bu = clamp((t - 146.2) / 0.4) * (1 - clamp((t - 148.2) / 0.3));
      ball(540, 1000 + Math.sin(t * 3) * 14, Math.sin(t * 2) * 10, 0.9 * bu + 0.001, bu.toFixed(2));
    });
    OT(139.2, 'do que você tem medo?', 540, 860, 56, '#e2e8f0', -2, { until: 141.4 });
    OT(144.8, 'é medo mesmo?', 540, 860, 56, '#e2e8f0', 2, { until: 146.1 });
    OT(150.0, 'sabe a diferença?', 540, 860, 56, '#fdba74', -2, { until: 151.8 });
  }

  // =====================================================================
  // CTA (155,4–fim)
  // =====================================================================
  shot([[CTA0, 999]], [1, 540, 1150]);
  {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 560, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 650, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@cardeno_amarelo', 380, 650 + 190 * 0.62, 84, BK, g).strokes);
    animate(g, CTA0 + 0.1, { loop: 'float' });
    put(chao(1600));
    const h = makeBloco(cont), c = makeClaude(cont);
    WB.effect(t => {
      if (t < CTA0) return;
      h.update(t, B({ x: 330, y: 1600, s: 0.8, look: 0.7, R: [150 + Math.sin(t * 9) * 20, -330] }));
      c.update(t, Cl({ x: 760, y: 1360, s: 0.8, look: -0.6, armR: -40 + Math.sin(t * 9) * 25, reach: 0.4, hop: Math.abs(Math.sin(t * 4)) * 24, smile: 10 }));
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
    const SPOTS = [[300, 470], [780, 470], [790, 1580], [300, 1580]];
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
