// Meme "Indo comprar um Mobi" (áudio de @matheus.ruff): o vendedor de peruca cacheada tenta empurrar um Mobi para o pai de sete filhos.
// Áudio original (vendedor + cliente fora de quadro) + risada de plateia no final. Formato de cenas no papel do caderno:
// cortes com deslize, faixa amarela de legenda (texto azul = cliente) e bonecos articulados (makePerson, base do meme
// "o áudio da baixinha") com peruca cacheada, barba e boné. O Mobi (makeCar) abre porta-malas, capô e porta e pula com o som.
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
  const ENV = '0998350797277099878999766899599600799769899899879989994099998769999777899319999996430006999899999999997899978998999997100000299999973898999999998999997212419975849926980860776888888720000000999779996796559975993798999999998089999961999986011000010009999999999999999995982999779949999899988989966797129972999899999998799752012864999799989999994697059689967977167979779999889999689896001798576799971981886589999932999768999799889982199861899969999986399999538679974898799998109977985797999999740099949945972233239949989999981899869999994059429889968897199877999995698871223449980999399978999989799869960999899979999957987999814999689938975980887988974897995599810894019998810009999359999700002100111043201111101201111001003999799999999997999799899998998888998199899469509999998109997119989879984899899999998379919999989899888847999999510000004999978899821980079872279768996999999840889979707987999997999898599998998988899799874799899999949988999998103407989897399399798099006889875769810000799989999899979979983591799809849948999981995099999819707967608999929989988997789987899899999987510000006899998500000999799996000995998899999969996239993899688977999860000000000999889999999989989899999999999999897786875654333221000000000000000000000009878777565433332100000000000000000000000885977755543333220000000000000001011211019679996799899999998898392998599999999874116989767532112353324343544454344335422249999999998299999599699898199982159970899899971215533232399728992998999609972189999976731799878999994115886587999556665166219997113317679989879968999669779986883299676106997766896267776554067755422100999999997888777100489720057888787655454444445554545545424544530005988666520009998467625503420023398300687100156300001000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  // quem fala: V = vendedor (na tela), C = cliente (fora de quadro no vídeo original)
  const C_WIN = [[4.5, 6.2], [7.75, 9.5], [11.6, 12.5], [17.1, 19.3], [42.5, 43.5], [45.35, 49.45], [56.9, 58.2]];
  const V_WIN = [[0.1, 4.3], [6.3, 7.7], [9.6, 11.55], [12.8, 17.05], [19.35, 42.45], [43.55, 45.3], [49.5, 56.85], [58.4, 60.1], [66.0, 68.3], [70.2, 80.5]];
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
  // RIG DE GENTE (vendedor e cliente). Origem = chão embaixo do quadril; de frente para a câmera.
  // st: x, y, s, f, d/v (odômetro), sit, seatH, lean, rot, hop, headRot, mood, op, look, lookY,
  //     L, R (alvos das mãos, coordenadas do quadril), rotL, rotR, footT (alvos dos pés), xeyes, shades, lift, frozen
  // =====================================================================
  // vendedor: peruca de cachos, barba cheia, camisa vinho; cliente (pai de sete): boné, bigode, camiseta laranja
  const VEND = { kind: 'dad', thigh: 96, shin: 94, torso: 190, neck: 14, R: 90, up: 82, fo: 80, shW: 56, hipW: 28, legW: 24, armW: 16,
    skin: '#b9825f', shirt: '#7b2340', pants: '#4b5563', shoe: '#111827', hair: '#9a5a2b', curly: true, beard: '#2a1a10', trim: '#4c0519' };
  const CLI = { kind: 'dad', thigh: 92, shin: 90, torso: 200, neck: 14, R: 92, up: 80, fo: 78, shW: 60, hipW: 30, legW: 26, armW: 17,
    skin: '#f1c29b', shirt: '#f97316', pants: '#3b5b8c', shoe: '#78350f', hair: '#3a2618', cap: '#2563eb', capB: '#1e3a8a', must: true, trim: '#c2410c' };
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
    const backHair = kid ? WB.mk('path', { d: WB.cloudPath(0, 0, R * 1.08, R * 1.02, 12), fill: B.hair, stroke: BK, 'stroke-width': 6 }, upper)
      : (B.curly ? WB.mk('path', { d: WB.cloudPath(0, -R * 0.32, R * 1.34, R * 1.12, 15), fill: B.hair, stroke: BK, 'stroke-width': 6 }, upper) : null);
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
      dyn(upper, { d: `M -30 -84 q 30 22 60 0`, 'stroke-width': 4, stroke: B.trim || '#1e40af' });
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
      WB.mk('path', { d: `M ${-R * 0.84} ${R * 0.12} Q ${-R * 0.7} ${R * 0.92} 0 ${R * 0.94} Q ${R * 0.7} ${R * 0.92} ${R * 0.84} ${R * 0.12} Q ${R * 0.5} ${R * 0.5} ${R * 0.26} ${R * 0.36} Q 0 ${R * 0.3} ${-R * 0.26} ${R * 0.36} Q ${-R * 0.5} ${R * 0.5} ${-R * 0.84} ${R * 0.12} Z`, fill: B.beard || '#8b6b55', opacity: B.beard ? 1 : 0.28 }, head);
    }
    const blush = WB.mk('g', { opacity: kid ? 0.55 : 0 }, head);
    WB.mk('path', { d: ellipse(-R * 0.6, R * 0.36, 15, 9), fill: '#fb7185' }, blush); WB.mk('path', { d: ellipse(R * 0.6, R * 0.36, 15, 9), fill: '#fb7185' }, blush);
    const ex = R * (kid ? 0.38 : 0.36), ey = kid ? R * 0.04 : -R * 0.1, erx = R * (kid ? 0.24 : 0.19), ery = R * (kid ? 0.29 : 0.24);
    const eyeL = makeEye(head, -ex, ey, erx, ery, B.skin, { prx: erx * (kid ? 0.42 : 0.36), browW: kid ? 5 : 8, browC: kid ? B.hair : '#2a1a10' });
    const eyeR = makeEye(head, ex, ey, erx, ery, B.skin, { prx: erx * (kid ? 0.42 : 0.36), browW: kid ? 5 : 8, browC: kid ? B.hair : '#2a1a10' });
    if (kid) dyn(head, { d: `M ${-ex - erx - 4} ${ey - ery * 0.5} l -12 -8 M ${-ex - erx + 2} ${ey - ery * 0.8} l -10 -12 M ${ex + erx + 4} ${ey - ery * 0.5} l 12 -8 M ${ex + erx - 2} ${ey - ery * 0.8} l 10 -12`, 'stroke-width': 4 });
    const xe = dyn(head, { 'stroke-width': 7, opacity: 0, d: [-1, 1].map(sd => `M ${r1(sd * ex - 16)} ${r1(ey - 16)} l 32 32 M ${r1(sd * ex + 16)} ${r1(ey - 16)} l -32 32`).join(' ') });
    dyn(head, { d: kid ? `M -4 ${R * 0.3} q -6 8 4 10` : `M -4 ${R * 0.12} Q -16 ${R * 0.36} 4 ${R * 0.38}`, 'stroke-width': 5 });
    if (B.must) WB.mk('path', { d: `M ${-R * 0.42} ${R * 0.5} Q ${-R * 0.3} ${R * 0.3} 0 ${R * 0.4} Q ${R * 0.3} ${R * 0.3} ${R * 0.42} ${R * 0.5} Q ${R * 0.2} ${R * 0.44} 0 ${R * 0.5} Q ${-R * 0.2} ${R * 0.44} ${-R * 0.42} ${R * 0.5} Z`, fill: B.hair, stroke: BK, 'stroke-width': 4 }, head);
    const mouth = makeMouth(head, 0, R * (kid ? 0.56 : 0.6), R * (kid ? 0.34 : 0.4));
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
  const dudeV = () => makePerson(cont, VEND);
  const dudeC = () => makePerson(cont, CLI);

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
  // motorzinho (o "motor de micro-ondas")
  const engine = (s = 1) => [box(-34 * s, -26 * s, 68 * s, 46 * s, 8 * s, '#9ca3af', null, 5), box(-26 * s, -40 * s, 52 * s, 16 * s, 5 * s, '#6b7280', null, 4),
    circ(-20 * s, -2 * s, 8 * s, '#e5e7eb', null, 3), circ(4 * s, -2 * s, 8 * s, '#e5e7eb', null, 3), { d: `M ${34 * s} ${-6 * s} q ${18 * s} 0 ${18 * s} ${18 * s}`, c: '#ef4444', w: 5 }];
  const lupa = () => [{ d: 'M 0 0 L 0 110', c: '#92400e', w: 22 }, circ(0, -70, 70, '#e0f2fe', null, 10), { d: 'M -30 -100 Q -44 -78 -36 -54', c: '#ffffff', w: 8 }];
  const calcu = () => [box(-90, -150, 180, 250, 22, '#334155', null, 6), box(-70, -128, 140, 56, 8, '#bbf7d0', null, 4),
    ...[0, 1, 2].map(r => [0, 1, 2].map(c => box(-66 + c * 46, -56 + r * 46, 38, 36, 8, c === 2 && r === 2 ? '#f59e0b' : '#e5e7eb', null, 3))).flat()];
  const priceTag = (txt) => [{ d: 'M -150 -70 L 110 -70 L 170 0 L 110 70 L -150 70 Z', fill: '#fde047', w: 7 }, circ(118, 0, 12, '#fffdf5', null, 5), T(txt, -20, 22, 64, INK.red)];
  const shadesS = (x, y, s = 1) => [{ d: `M ${x - 56 * s} ${y - 10 * s} L ${x + 56 * s} ${y - 10 * s}`, w: 6 }, { d: ellipse(x - 30 * s, y + 4 * s, 24 * s, 16 * s), fill: '#111827' }, { d: ellipse(x + 30 * s, y + 4 * s, 24 * s, 16 * s), fill: '#111827' }];

  // ---------------- o carro — vista de lado, frente para a direita; origem no chão, no meio ----------------
  // Mobi (padrão): hatch alto e curtinho, com moldura preta nas rodas e rack no teto, bem MENOR que o vendedor.
  // Onix (o: big): sedã-hatch comprido da cena 1, para contrastar.
  const GEO = {
    mobi: {
      body: 'M -255 -60 L -262 -150 Q -262 -270 -215 -287 L 95 -292 Q 130 -290 172 -207 L 240 -192 Q 262 -186 262 -150 L 260 -80 Q 258 -60 240 -60 Z',
      win: ['M -140 -278 L -20 -280 L -20 -207 L -140 -205 Z'],
      doorP: 'M -10 -286 L 95 -290 Q 128 -286 168 -207 L 170 -72 L -10 -72 Z', doorW: 'M -2 -278 L 92 -282 Q 120 -278 158 -209 L -2 -209 Z', doorX: 170,
      lidP: 'M -215 -289 L -150 -289 L -150 -105 L -258 -105 L -262 -150 Q -262 -270 -215 -289 Z', lidW: 'M -212 -278 Q -250 -258 -254 -207 L -162 -207 L -162 -278 Z', lidH: [-215, -289],
      hoodP: 'M 172 -209 L 240 -194 Q 263 -188 263 -158 L 175 -160 Z', hoodH: [172, -209], eng: [220, -172],
      tail: [-270, -208, 18, 50], head: 'M 230 -186 L 260 -180 L 262 -162 L 232 -164 Z', mirror: 'M 158 -210 L 182 -222 L 186 -202 Z',
      wheels: [-165, 168], wr: 40, ar: 56, badge: [-205, -132], sticker: [20, -262], extra: [{ d: 'M -200 -300 L 92 -303', c: '#1f2937', w: 9 }, { d: 'M -150 -296 L -150 -290 M 40 -300 L 40 -294', w: 5 },
        { d: 'M -252 -82 L 258 -82', c: '#1f2937', w: 18 }],
    },
    onix: {
      body: 'M -366 -60 L -374 -200 Q -372 -300 -300 -332 L 70 -338 Q 120 -334 225 -222 L 340 -202 Q 380 -192 380 -150 L 378 -80 Q 376 -60 350 -60 Z',
      win: ['M -270 -318 L -40 -322 L -40 -232 L -280 -230 Z'],
      doorP: 'M -28 -324 L 70 -326 Q 108 -322 196 -230 L 200 -76 L -28 -76 Z', doorW: 'M -20 -318 L 70 -322 Q 106 -318 184 -236 L -20 -236 Z', doorX: 200,
      lidP: 'M -300 -332 L -214 -332 L -214 -112 L -368 -112 L -374 -200 Q -372 -300 -300 -332 Z', lidW: 'M -296 -320 Q -352 -296 -360 -236 L -232 -236 L -232 -320 Z', lidH: [-300, -332],
      hoodP: 'M 222 -224 L 340 -204 Q 380 -194 380 -160 L 226 -162 Z', hoodH: [222, -224], eng: [300, -172],
      tail: [-380, -236, 22, 64], head: 'M 332 -194 L 374 -186 L 378 -162 L 336 -166 Z', mirror: 'M 186 -236 L 214 -250 L 220 -226 Z',
      wheels: [-235, 250], wr: 60, ar: 82, badge: [-290, -160], sticker: [29, -280], extra: [{ d: 'M -372 -110 L 378 -110', c: '#9ca3af', w: 5 }],
    },
  };
  function makeCar(parent, o = {}) {
    const G = o.big ? GEO.onix : GEO.mobi;
    const g = WB.mk('g', {}, parent);
    const bodyC = o.color || '#ffffff';
    const inner = WB.mk('g', {}, g);
    const glass = o.seeThru ? 0.22 : 1;
    put([{ d: G.body, fill: bodyC, w: 8 }], inner);
    // o que fica "dentro" do carro: só aparece pelos vidros (e acima do teto, para a cabeça furar o teto)
    const cid = 'car' + (UID++);
    const cp = WB.mk('clipPath', { id: cid }, inner);
    [...G.win, G.doorW, G.lidW, 'M -400 -296 L 400 -296 L 400 -1200 L -400 -1200 Z'].forEach(d => WB.mk('path', { d }, cp));
    const behind = WB.mk('g', { 'clip-path': `url(#${cid})` }, inner);
    put([...G.win.map(d => ({ d, fill: '#bae6fd', fo: glass, w: 6 })),
      { d: `M ${G.doorX + 2} -205 L ${G.doorX + 4} -74`, w: 5 },
      box(...G.tail, 8, '#ef4444', null, 5), { d: G.head, fill: '#fde047', w: 5 }, { d: G.mirror, fill: '#1f2937', w: 5 }, ...G.extra], inner);
    if (o.dents) put([{ d: 'M -320 -150 q 20 -16 40 0 q 20 16 40 0', c: '#6b7280', w: 5 }, { d: 'M 100 -150 q 14 -24 34 -6 q 14 14 30 -4', c: '#6b7280', w: 5 },
      { d: 'M 280 -120 l 20 -20 l 10 14 l 18 -22', c: '#6b7280', w: 5 },
      box(-200, -175, 70, 26, 8, '#fcd34d', null, 4), { d: 'M -180 -168 l 0 12 M -150 -168 l 0 12', c: '#b45309', w: 3 },
      box(120, -210, 66, 24, 8, '#fcd34d', null, 4)], inner);
    // interior do porta-malas (aparece quando a tampa abre)
    const trunkIn = WB.mk('g', { opacity: 0 }, inner);
    put([{ d: G.lidP, fill: '#44403c', w: 6 }], trunkIn);
    if (o.tinyTrunk) put([box(-232, -150, 52, 36, 6, '#60a5fa', null, 4), { d: 'M -222 -150 L -222 -160 L -190 -160 L -190 -150', w: 4 }], trunkIn);
    const voidG = WB.mk('g', {}, trunkIn);
    // vão do motor
    const bay = WB.mk('g', { opacity: 0 }, inner);
    put([{ d: G.hoodP, fill: '#292524', w: 6 }], bay);
    const eng = WB.mk('g', { transform: `translate(${G.eng[0]} ${G.eng[1]})` }, bay);
    put(engine(o.tinyEngine ? 0.18 : 0.6), eng);
    // tampa do porta-malas
    const lid = WB.mk('g', {}, inner);
    put([{ d: G.lidP, fill: bodyC, w: 7 }, { d: G.lidW, fill: '#bae6fd', fo: glass, w: 5 }, box(...G.tail, 8, '#ef4444', null, 5),
      T(o.badge || 'MOBI', G.badge[0] + (o.big ? 0 : 52), G.badge[1], o.big ? 40 : 30, '#6b7280')], lid);
    // capô
    const hood = WB.mk('g', {}, inner);
    put([{ d: G.hoodP, fill: bodyC, w: 7 }], hood);
    // porta da frente (quando abre mostra o banco)
    const doorIn = WB.mk('g', { opacity: 0 }, inner);
    put([{ d: G.doorP, fill: '#57534e', w: 6 }, box(G.doorX - 150, -260, 60, 150, 24, '#1f2937', null, 5)], doorIn);
    const door = WB.mk('g', {}, inner);
    put([{ d: G.doorP, fill: bodyC, w: 7 }, { d: G.doorW, fill: '#bae6fd', fo: glass, w: 5 }, { d: `M ${G.doorX - 150} -170 L ${G.doorX - 115} -170`, w: 7 }], door);
    if (o.sticker) put([box(G.sticker[0] - 30, G.sticker[1] - 30, 60, 44, 4, '#fde047', null, 4), T('R$', G.sticker[0], G.sticker[1] + 2, 26, INK.red)], inner);
    const front = WB.mk('g', {}, inner);   // por cima da carroceria (ex.: pés saindo pela janela)
    // rodas
    const wheels = G.wheels.map(wx => {
      put([{ d: WB.arcPath(wx, -60, G.ar, G.ar, Math.PI, Math.PI * 2, 24) + ' Z', fill: o.big ? '#292524' : '#1f2937', w: 6 }], inner);
      const wg = WB.mk('g', {}, inner);
      put([circ(0, 0, G.wr, '#1f2937', null, 6), circ(0, 0, G.wr * 0.52, '#d1d5db', null, 5), { d: `M ${-G.wr * 0.46} 0 L ${G.wr * 0.46} 0 M 0 ${-G.wr * 0.46} L 0 ${G.wr * 0.46}`, c: '#6b7280', w: 5 }], wg);
      return { wg, wx };
    });
    const car = {
      g, eng, behind, front, G, set(x, y, s = 1, st = {}) {
        const b = st.bounce || 0, sq = st.squash || 0;
        car.x = x; car.y = y; car.s = s;
        g.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) scale(${s * (st.f || 1)} ${s})`);
        inner.setAttribute('transform', `translate(0 ${r1(-b + sq * 14)}) rotate(${r1(st.rot || 0)} 0 -60)`);
        const tr = st.trunk || 0, hd = st.hood || 0, dr = st.door || 0;
        lid.setAttribute('transform', `rotate(${r1(78 * tr)} ${G.lidH[0]} ${G.lidH[1]})`);
        trunkIn.setAttribute('opacity', tr > 0.02 ? 1 : 0);
        hood.setAttribute('transform', `rotate(${r1(-62 * hd)} ${G.hoodH[0]} ${G.hoodH[1]})`);
        bay.setAttribute('opacity', hd > 0.02 ? 1 : 0);
        door.setAttribute('transform', `translate(${G.doorX} 0) scale(${r1((1 - 0.72 * dr) * 1000) / 1000} 1) translate(${-G.doorX} 0)`);
        doorIn.setAttribute('opacity', dr > 0.02 ? 1 : 0);
        // pneus amassando quando o carro está "pesado"
        wheels.forEach(w => w.wg.setAttribute('transform', `translate(${w.wx} ${r1(-G.wr - 2 + b - sq * 14 + G.wr * 0.3 * sq)}) scale(${r1((1 + 0.25 * sq) * 100) / 100} ${r1((1 - 0.3 * sq) * 100) / 100}) rotate(${r1(st.spin || 0)})`));
      },
      // ponto local do carro -> mundo
      at(lx, ly) { return [car.x + lx * car.s, car.y + ly * car.s]; },
    };
    return car;
  }

  // menininhos (os sete filhos): bonequinho simples que corre e pula
  const KIDC = [['#ef4444', '#3a2618'], ['#22c55e', '#f59e0b'], ['#3b82f6', '#111827'], ['#f472b6', '#5b3a24'], ['#a855f7', '#3a2618'], ['#f59e0b', '#111827'], ['#14b8a6', '#7c2d12']];
  function miniKid(parent, k) {
    const [shirt, hair] = KIDC[k % 7];
    const g = WB.mk('g', {}, parent);
    const legs = dyn(g, { 'stroke-width': 9 }), arms = dyn(g, { 'stroke-width': 8 });
    put([box(-22, -96, 44, 58, 16, shirt, null, 5)], g);
    const hg = WB.mk('g', {}, g);
    put([circ(0, -128, 32, '#f7d4b6', null, 5), { d: k % 2 ? 'M -32 -132 Q -30 -168 0 -166 Q 30 -168 32 -132 Q 14 -150 0 -146 Q -14 -150 -32 -132 Z' : WB.cloudPath(0, -150, 30, 16, 8), fill: hair, w: 5 },
      circ(-11, -128, 4, '#111', 'none'), circ(11, -128, 4, '#111', 'none')], hg);
    const m = dyn(hg, { 'stroke-width': 4, fill: MOUTH });
    return (x, y, s, t, o = {}) => {
      const run = o.run || 0, ph = t * 14 + k * 1.3;
      const sw = Math.sin(ph) * 22 * run;
      const hop = (o.hop || 0) * Math.abs(Math.sin(t * 8 + k));
      g.setAttribute('transform', `translate(${r1(x)} ${r1(y - hop)}) scale(${r1((o.f || 1) * s * 100) / 100} ${s}) rotate(${r1(o.rot || 0)})`);
      g.setAttribute('opacity', o.op ?? 1);
      legs.setAttribute('d', `M -8 -40 L ${r1(-10 - sw)} 0 M 8 -40 L ${r1(10 + sw)} 0`);
      const up = o.armsUp ? -60 : 0;
      arms.setAttribute('d', `M -20 -86 L ${r1(-40 + sw * 0.6)} ${-50 + up} M 20 -86 L ${r1(40 - sw * 0.6)} ${-50 + up}`);
      const op = o.yell ? 0.6 + 0.4 * Math.sin(t * 20 + k) : 0;
      m.setAttribute('d', op > 0.1 ? ellipse(0, -110, 9, 4 + 8 * op) : 'M -10 -112 Q 0 -104 10 -112');
      m.setAttribute('fill', op > 0.1 ? MOUTH : 'none');
    };
  }

  // ---------------- cenários ----------------
  const FL = 1450;
  function loja(o = {}) {
    const out = [
      { d: `M 60 520 L 1020 520 L 1020 ${FL} L 60 ${FL} Z`, fill: '#e5e7eb', c: 'none', fo: 0.9 },
      { d: `M 60 520 L 1020 520 L 1020 640 L 60 640 Z`, fill: '#374151', c: 'none', fo: 0.95 },
      { d: `M 60 ${FL} L 1020 ${FL} L 1020 1700 L 60 1700 Z`, fill: '#a8a29e', c: 'none', fo: 0.85 },
      { d: WB.roughLine(60, FL, 1020, FL, 2), w: 7 },
      { d: `M 140 ${FL + 80} L 330 ${FL + 80} M 460 ${FL + 150} L 700 ${FL + 150} M 760 ${FL + 70} L 990 ${FL + 70}`, c: '#78716c', w: 4 },
    ];
    for (let i = 0; i < 6; i++) out.push(circ(130 + i * 165, 590, 12, '#fde047', '#f59e0b', 4));
    if (o.vitrine !== false) {
      out.push(box(110, 760, 860, 300, 10, '#dbeafe', '#6b7280', 6), { d: 'M 397 760 L 397 1060 M 683 760 L 683 1060', c: '#6b7280', w: 6 });
      [250, 540, 830].forEach(cx => out.push({ d: `M ${cx - 100} 1040 L ${cx - 104} 980 Q ${cx - 90} 940 ${cx - 40} 935 L ${cx + 50} 935 Q ${cx + 80} 950 ${cx + 100} 985 L ${cx + 104} 1040 Z`, fill: '#ffffff', c: '#9ca3af', w: 5 }));
    }
    if (o.placa !== false) out.push(box(300, 680, 480, 64, 12, '#facc15', null, 6), T('SEMINOVOS & 0 KM', 540, 728, 46, BK));
    return out;
  }
  // por dentro do carro (o vendedor no banco do motorista)
  function dentro() {
    return [
      { d: `M 60 520 L 1020 520 L 1020 1700 L 60 1700 Z`, fill: '#d6d3d1', c: 'none', fo: 0.9 },
      { d: 'M 520 600 L 1000 640 L 1000 1000 L 560 960 Z', fill: '#1e293b', w: 7 },
      ...[0, 1, 2, 3].map(i => circ(640 + i * 90, 720 + (i % 2) * 20, 9, '#fde047', 'none')),
      { d: 'M 600 900 L 700 860 L 780 880 L 860 850 L 990 880 L 990 990 L 580 960 Z', fill: '#ffffff', c: '#94a3b8', w: 4 },
      { d: 'M 60 540 Q 300 500 560 560', c: '#78716c', w: 8 },
      box(170, 820, 300, 520, 70, '#292524', null, 7), box(220, 700, 200, 150, 50, '#292524', null, 7),
    ];
  }
  const painel = () => [{ d: 'M 500 1180 L 1020 1080 L 1020 1700 L 500 1700 Z', fill: '#44403c', w: 7 },
    box(800, 1130, 170, 110, 12, '#0f172a', null, 6), box(816, 1146, 138, 78, 6, '#22d3ee', null, 3), circ(885, 1280, 22, '#9ca3af', null, 5)];
  const volante = () => [circ(0, 0, 150, 'none', null, 22), circ(0, 0, 150, 'none', '#111827', 12), circ(0, 0, 40, '#374151', null, 6), { d: 'M -140 10 L -40 0 M 140 10 L 40 0 M 0 40 L 0 140', w: 14 }];

  const CTA0 = 81.0;
  const toS = (zk, zx, zy) => (p) => [zx + (p[0] - zx) * zk, zy + (p[1] - zy) * zk];

  // ---------------- título + legenda (faixa amarela; texto azul = cliente) ----------------
  const titleG = WB.mk('g', {}, WB.overlay);
  {
    const a = 'INDO COMPRAR UM ', b = 'MOBI', size = 80;
    const tw = WB.measure(a + b, size), x0 = 540 - tw / 2;
    WB.showNow(WB.textStrokes(a, x0, 200, size, BK, titleG, 'start').strokes);
    WB.showNow(WB.textStrokes(b, x0 + WB.measure(a, size), 200, size, INK.red, titleG, 'start').strokes);
    WB.showNow(WB.strokePath(WB.wavyLine(x0, x0 + tw, 222, 6, 60), '#f59e0b', 6, titleG));
    WB.effect(t => titleG.setAttribute('opacity', t < CTA0 ? clamp(t / 0.3) : clamp(1 - (t - CTA0) / 0.3)));
  }
  const capLayer = WB.mk('g', {}, WB.overlay);
  const V = 0, C = 1;
  const CAPS = [
    [0.1, 'Por que todo Onix zero é batido, Deus?', V], [2.2, 'Não vejo um inteiro!', V], [3.35, 'Opa, boa tarde!', V],
    [4.5, 'Bom dia! Pode me ajudar?', C], [6.3, 'Senhor... é boa noite!', V], [7.75, 'Eu queria comprar um carro pra família.', C],
    [9.6, 'Ô major, tu tem quantos menino?', V], [11.6, 'Sete.', C],
    [12.8, 'Ô cara... o teu é um Mobi, major!', V], [15.05, 'Tá entendendo, major? Tu tá entendendo?', V],
    [17.1, 'Esse aqui pra levar minha família?', C], [18.5, 'Tu tá doido, é?', C],
    [19.35, 'Mas aqui cabe sete menino folgado aí dentro...', V], [21.6, '...tudo correndo!', V],
    [22.55, 'Olha esse porta-malas aqui, major.', V], [24.3, 'Olha o espaço desse...', V],
    [25.55, 'Eu só não entro porque tenho medo de me perder aí dentro.', V],
    [28.85, 'Aqui é a primeira, major. Tu é doido, né?', V],
    [30.9, 'Major, olha o motor desse bicho aqui!', V], [33.3, 'Aqui, olha aqui, olha.', V], [34.7, ''],
    [36.1, 'Tá entendendo, major?', V],
    [37.2, 'O mesmo motor desse aqui é o que os cabra bota no micro-ondas da Electrolux.', V],
    [42.1, 'Felizmente.', V], [42.55, 'É potente, né, o bicho?', C], [43.55, 'O bicho, major! Tu é doido, é?', V],
    [45.35, 'Deixa aí, major... dá pra ver dentro do bichão?', C], [47.6, 'Tem certeza que dá pra levar os sete menino aqui dentro?', C],
    [49.5, 'Tem, major! Aqui tu já tá pensando no futuro...', V], [52.1, '...pra quando quiser fazer mais dois menino!', V],
    [54.8, 'Entendeu? Tá entendendo, major?', V], [56.9, 'E o som do bichão?', C],
    [58.4, 'Primeiro, major... oi, oi, oi!', V], [60.2, 'TUM... TUM... TUM...', V],
    [66.0, 'Tu tá entendendo, major! Tu tá entendendo!', V], [68.4, ''],
    [70.2, 'Major, e aqui eu vou fazer no precinho, viu?', V], [73.2, '72 parcelas de 3.890!', V],
    [76.25, 'Se tu quiser rodar de Uber... em duas semanas...', V], [79.5, 'felizmente.', V], [80.6, ''],
  ];
  CAPS.forEach(([t0, text, who], i) => {
    if (!text) return;
    const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : CTA0;
    const g = WB.mk('g', {}, capLayer);
    const size = 56, lh = 64;
    const lines = WB.wrap(text, size, 860);
    const w = Math.max(...lines.map(l => WB.measure(l, size))) + 64, h = lines.length * lh + 28, y0 = 262;
    WB.mk('rect', { x: r1(540 - w / 2), y: y0, width: r1(w), height: h, rx: 20, fill: who === C ? '#dbeafe' : '#ffe066', stroke: BK, 'stroke-width': 5 }, g);
    lines.forEach((l, k) => WB.showNow(WB.textStrokes(l, 540, y0 + 58 + k * lh, size, who === C ? '#1d4ed8' : BK, g, 'middle').strokes));
    const rot = i % 2 ? 1.2 : -1.2;
    WB.effect(t => {
      if (t < t0 || t >= t1) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      const k = backOut(clamp((t - t0) / 0.2)) * 0.1 + 0.9;
      g.setAttribute('transform', `translate(540 ${y0 + h / 2}) rotate(${rot}) scale(${k.toFixed(3)}) translate(-540 ${-(y0 + h / 2)})`);
    });
  });
  // poses base
  const vend = (o) => Object.assign({ y: FL, s: 1, f: 1, seed: 0.3 }, o);
  const cli = (o) => Object.assign({ y: FL, s: 1, f: 1, seed: 1.7 }, o);
  const opV = t => talk(V_WIN, t, 1.25), opC = t => talk(C_WIN, t, 1.25);
  // "tá entendendo?": mão girando na frente do peito
  const roll = (t, k = 1) => [70 * k + Math.cos(t * 12) * 30, -150 + Math.sin(t * 12) * 26];

  // =====================================================================
  // CENA 1 (0–3,35): o vendedor examina um Onix zero todo amassado
  // =====================================================================
  const S1 = [[0, 3.35]];
  shot(S1);
  put(loja({ vitrine: false }));
  const onix = makeCar(cont, { dents: true, badge: 'ONIX', big: true });
  const v1 = dudeV();
  const V1X = K([[0, 160], [1.6, 330, 'io'], [2.4, 330]]), V1o = odo(V1X, 0, 3.4);
  const V1M = moodTrack(MOODS, [[0, 'squint'], [1.0, 'horror'], [2.2, 'sad']]);
  WB.effect(t => {
    if (!inWin(S1, t)) return;
    onix.set(640, FL, 1.0, {});
    const bend = t < 1.8 ? 18 : 6;
    v1.update(t, Object.assign(vend({ x: V1X(t), mood: V1M(t), op: opV(t), lean: bend + Math.sin(t * 3) * 3, look: 12,
      L: t > 2.2 ? [-120, -290 + Math.sin(t * 9) * 10] : [-40, -40], R: t > 2.2 ? [120, -290 + Math.cos(t * 9) * 10] : [150, -150] }), V1o(t)));
  });
  O(0.4, [burst(860, 1260, 50, '#fef08a'), burst(560, 1230, 40, '#fef08a')], { loop: 'pulse' });
  ostamp(0.9, '0 KM?!', 780, 700, 90, INK.red, 6, { loop: 'shake' });
  OT(2.3, 'ai, Deus...', 280, 760, 64, '#7c3aed', -6, { loop: 'wiggle' });

  // =====================================================================
  // CENA 2 (3,35–9,6): o cliente chega na loja: "boa tarde" / "bom dia"... e é de noite
  // =====================================================================
  const S2 = [[3.35, 9.6]];
  shot(S2, 1.12, 540, 1250);
  put(loja({ placa: false }));
  const v2 = dudeV(), c2 = dudeC();
  const C2X = K([[3.35, -120], [4.0, -120], [6.2, 300, 'o']]), C2o = odo(C2X, 3.3, 9.7);
  WB.effect(t => {
    if (!inWin(S2, t)) return;
    const greet = t < 4.5, noite = t > 6.3 && t < 7.7;
    v2.update(t, vend({ x: 760, mood: greet ? MOODS.happy : (t < 7.6 ? MOODS.neutral : MOODS.greedy), op: opV(t), f: -1, look: -10,
      L: greet ? [-150 + Math.sin(t * 14) * 22, -300] : (noite ? [-120, -400] : [-60, -60]), R: [60, -60], headRot: greet ? -6 : (noite ? -10 : 0) }));
    c2.update(t, Object.assign(cli({ x: C2X(t), mood: t > 6.4 && t < 7.7 ? MOODS.confused : (t < 7.6 ? MOODS.happy : MOODS.proud), op: opC(t), look: 10,
      R: t > 4.6 && t < 6.0 ? [150 + Math.sin(t * 14) * 20, -300] : (t > 7.7 ? [110, -240] : undefined) }), C2o(t)));
  });
  O(3.5, [circ(860, 520, 34, '#fde047', '#f59e0b', 5)], { anim: 'pop', until: 4.5 });
  O(4.6, [circ(220, 520, 34, '#fde047', '#f59e0b', 5)], { anim: 'pop', until: 6.4 });
  O(6.4, [{ d: 'M 560 430 A 60 60 0 1 0 610 540 A 46 46 0 1 1 560 430 Z', fill: '#e2e8f0', w: 5 }, T('boa noite!', 560, 610, 50, '#475569')], { anim: 'pop', until: 9.6 });
  O(8.0, [heart(300, 560, 1.1), T('família', 300, 660, 50, '#be185d')], { loop: 'pulse' });

  // =====================================================================
  // CENA 3 (9,6–11,6): close no vendedor: "tu tem quantos menino?"
  // =====================================================================
  const S3 = [[9.6, 11.6]];
  shot(S3, 1.9, 540, 960);
  put(loja({ placa: false }));
  const v3 = dudeV();
  WB.effect(t => {
    if (!inWin(S3, t)) return;
    v3.update(t, vend({ x: 540, mood: MOODS.sly, op: opV(t), lean: 4, headRot: 8 + Math.sin(t * 4) * 3, look: -8,
      L: [-40, -190], R: [120 + Math.sin(t * 6) * 10, -300] }));
  });
  OT(9.9, '?', 830, 620, 140, '#7c3aed', 8, { loop: 'wiggle' });
  OT(10.4, '?', 250, 700, 110, '#7c3aed', -8, { loop: 'wiggle' });

  // =====================================================================
  // CENA 4 (11,6–12,8): "Sete." — os sete meninos aparecem um por um
  // =====================================================================
  const S4 = [[11.6, 12.8]];
  shot(S4, 1);
  put(loja({ vitrine: false, placa: false }));
  const kids4 = [0, 1, 2, 3, 4, 5, 6].map(k => miniKid(cont, k));
  WB.effect(t => {
    if (!inWin(S4, t)) return;
    kids4.forEach((f, k) => {
      const t0 = 11.65 + k * 0.1, u = backOut(clamp((t - t0) / 0.2));
      f(160 + k * 127, FL - 10, 1.25 * u, t, { hop: 30, armsUp: true, yell: true, op: t > t0 ? 1 : 0 });
    });
  });
  ostamp(11.7, '7 MENINOS!', 540, 800, 120, INK.red, -5, { loop: 'shake' });

  // =====================================================================
  // CENA 5 (12,8–17,1): o vendedor corre até o Mobi: "o teu é um Mobi, major!"
  // =====================================================================
  const S5 = [[12.8, 17.1]];
  shot(S5, 1.12, 540, 1250);
  put(loja());
  const mobi5 = makeCar(cont, { sticker: true });
  const v5 = dudeV();
  const V5X = K([[12.8, 100], [14.0, 250, 'o']]), V5o = odo(V5X, 12.7, 17.2);
  WB.effect(t => {
    if (!inWin(S5, t)) return;
    mobi5.set(690, FL, 0.95, {});
    const tad = t < 14.4, ent = t > 15.05;
    v5.update(t, Object.assign(vend({ x: V5X(t), mood: ent ? MOODS.sly : MOODS.joy, op: opV(t), lean: tad ? 8 : 0,
      R: tad ? [190, -270 + Math.sin(t * 8) * 8] : (ent ? roll(t, 1.2) : [210, -200]), L: ent ? [-110, -60] : [-80, -280], headRot: ent ? Math.sin(t * 5) * 6 : 6, look: 8 }), V5o(t)));
  });
  O(13.6, [star(420, 980, 30), star(860, 960, 24, '#f472b6'), star(700, 1080, 18)], { loop: 'pulse' });
  ostamp(14.0, 'MOBI!', 760, 680, 110, '#1d4ed8', -6, { loop: 'pulse', until: 15.0 });
  OT(15.2, 'tá entendendo?', 720, 690, 66, '#7c3aed', 4, { loop: 'wiggle' });
  O(15.6, [box(560, 1560, 420, 74, 16, '#fffdf5', INK.red, 6), T('"CARRO DE FAMÍLIA"', 770, 1612, 46, INK.red), { d: 'M 770 1556 L 770 1500', c: INK.red, w: 6 }, { d: WB.arrowHead(770, 1500, -1.57, 16), c: INK.red, w: 6 }], { anim: 'slam' });

  // =====================================================================
  // CENA 6 (17,1–19,35): o cliente em choque: "pra levar MINHA FAMÍLIA?"
  // =====================================================================
  const S6 = [[17.1, 19.35]];
  shot(S6, 1.8, 540, 980);
  put(loja({ placa: false }));
  const c6 = dudeC();
  WB.effect(t => {
    if (!inWin(S6, t)) return;
    const tr = Math.sin(t * 46) * 4;
    c6.update(t, cli({ x: 540, mood: t < 18.5 ? MOODS.shock : MOODS.stern, op: opC(t), headRot: tr * 0.5, L: [-130 + tr, -300], R: [130 - tr, -300] }));
  });
  {
    O(17.2, thought(540, 560, 360, 150, [[600, 760, 22], [640, 710, 30]]), {});
    const tg = WB.mk('g', {}, ov);
    const tc = makeCar(tg, {});
    const tk = [0, 1, 2, 3, 4, 5, 6].map(k => miniKid(tg, k));
    WB.effect(t => {
      if (!inWin(S6, t)) return;
      const sq = Math.sin(t * 16) * 4;
      tc.set(540, 650 + sq * 0.3, 0.42, { rot: Math.sin(t * 9) * 1.5 });
      tk.forEach((f, k) => f(440 + (k % 4) * 62 + (k > 3 ? 30 : 0), 512 - (k > 3 ? 46 : 0) + Math.sin(t * 12 + k) * 4, 0.48, t, { yell: true, armsUp: k % 2 === 0, rot: (k - 3) * 6 }));
      tg.setAttribute('opacity', clamp((t - 17.3) / 0.2));
    });
  }

  // =====================================================================
  // CENA 7 (19,35–22,55): por dentro o Mobi é um estádio: sete meninos correndo
  // =====================================================================
  const S7 = [[19.35, 22.55]];
  shot(S7, 1);
  put([{ d: WB.roughLine(60, 1560, 1020, 1560, 2), w: 7 }]);
  {
    const m7 = makeCar(cont, { seeThru: true });
    // 3 lá dentro (cara amassada no vidro), 2 no teto, 1 saindo pela janela, 1 pendurado no porta-malas
    const kin = [0, 1, 2].map(k => miniKid(m7.behind, k));
    const kout = [3, 4, 5, 6].map(k => miniKid(m7.front, k));
    WB.effect(t => {
      if (!inWin(S7, t)) return;
      const run = t > 21.6, dx = run ? Math.sin((t - 21.6) * 6) * 40 : 0;
      m7.set(540 + dx, 1560, 1.45, { squash: 1, rot: Math.sin(t * 10) * 1.2, spin: dx * 3 });
      kin.forEach((f, k) => f(-110 + k * 85, -84, 0.92, t, { yell: true, rot: (k - 1) * 14, armsUp: k === 1 }));
      kout[0](-120, -300, 0.8, t, { yell: true, armsUp: true, rot: -8, hop: run ? 16 : 0 });
      kout[1](20, -302, 0.8, t, { yell: true, armsUp: true, rot: 10, hop: run ? 16 : 0 });
      kout[2](150, -150, 0.75, t, { yell: true, rot: 70, armsUp: true });
      kout[3](-300, -140, 0.75, t, { yell: true, rot: -75, armsUp: true });
    });
  }
  O(19.5, [T('7 MENINOS NUM MOBI', 540, 560, 72, '#1d4ed8')], {});
  ostamp(20.4, 'FOLGADO?!', 760, 720, 92, '#15803d', 5, { loop: 'shake' });
  OT(21.7, 'tudo correndo!', 300, 760, 62, INK.red, -6, { loop: 'wiggle' });

  // =====================================================================
  // CENA 8 (22,55–30,9): o porta-malas abre para o infinito; ele tem medo de se perder lá dentro
  // =====================================================================
  const S8 = [[22.55, 30.9]];
  shot(S8, 1.12, 540, 1250);
  put(loja({ placa: false }));
  const mobi8 = makeCar(cont, { tinyTrunk: true });
  const v8 = dudeV();
  const TR8 = K([[22.55, 0], [22.8, 0], [23.4, 1, 'b'], [28.85, 1], [29.05, 0, 'i']]);
  const V8X = K([[22.55, 220], [25.5, 220], [26.0, 260, 'io'], [26.6, 130, 'o'], [28.6, 130], [28.85, 210, 'io']]), V8o = odo(V8X, 22.5, 31);
  const V8M = moodTrack(MOODS, [[22.55, 'proud'], [24.3, 'greedy'], [25.6, 'horror'], [27.6, 'shock'], [29.0, 'sly']]);
  WB.effect(t => {
    if (!inWin(S8, t)) return;
    mobi8.set(740, FL, 1.05, { trunk: TR8(t) });
    const scared = t > 25.6 && t < 28.6;
    v8.update(t, Object.assign(vend({ x: V8X(t), mood: V8M(t), op: opV(t), look: 12, lean: scared ? -10 : 4,
      R: t < 23.4 ? [160, -330] : (scared ? [60, -300] : (t > 28.85 ? [180, -260] : [190, -200])),
      L: scared ? [-60, -300] : (t > 29.6 ? roll(t, -1) : [-90, -70]), headRot: scared ? -10 + Math.sin(t * 30) * 2 : 4 }), V8o(t)));
  });
  O(24.4, [box(560, 1600, 440, 74, 16, '#fffdf5', INK.red, 6), T('cabe: 1 marmita', 780, 1652, 50, INK.red), { d: 'M 640 1596 Q 600 1520 560 1460', c: INK.red, w: 6 }, { d: WB.arrowHead(560, 1460, -2.2, 16), c: INK.red, w: 6 }], { anim: 'slam', until: 28.8 });
  ostamp(26.4, 'SE PERDER ONDE?!', 640, 700, 72, '#1d4ed8', 4, { loop: 'shake', until: 28.8 });
  O(29.0, [burst(330, 1050, 70, '#fef08a'), T('PÁ!', 330, 1075, 70, INK.red)], { anim: 'slam' });

  // =====================================================================
  // CENA 9 (30,9–37,2): o capô abre... o motor é minúsculo; ele mostra com a lupa
  // =====================================================================
  const S9 = [[30.9, 37.2]];
  shot(S9, 1.12, 540, 1250);
  put(loja({ placa: false }));
  const mobi9 = makeCar(cont, { tinyEngine: true });
  const v9 = dudeV();
  const lupaH = holder(lupa(), ov);
  const HD9 = K([[30.9, 0], [31.3, 0], [31.9, 1, 'b']]);
  const V9X = K([[30.9, 760], [33.2, 760], [33.7, 860, 'io']]), V9o = odo(V9X, 30.8, 37.3);
  const Z9 = [1.12, 540, 1250], t9 = toS(...Z9);
  WB.effect(t => {
    if (!inWin(S9, t)) return;
    mobi9.set(420, FL, 1.05, { hood: HD9(t) });
    const look = t > 33.3 && t < 36.1;
    v9.update(t, Object.assign(vend({ x: V9X(t), mood: t > 36.1 ? MOODS.proud : (look ? MOODS.think : MOODS.happy), op: opV(t), f: -1, look: -12, lean: look ? -12 : 0,
      L: look ? [-170, -250] : [-160, -330], R: t > 36.1 ? roll(t, -1) : [90, -80], headRot: look ? -10 : 0 }), V9o(t)));
    // lupa sobre o motorzinho (posição do motor: carro em 330, motor em +300 x -172, escala 1,25)
    const ep = t9(mobi9.at(...mobi9.G.eng));
    const u = clamp((t - 33.3) / 0.3);
    lupaH(ep[0] + 10, ep[1] + 60 + Math.sin(t * 3) * 6, -18, 1, look ? u : 0);
  });
  O(33.5, [{ d: 'M 600 1000 Q 620 1080 640 1130', c: INK.red, w: 6 }, { d: WB.arrowHead(640, 1130, 1.2, 18), c: INK.red, w: 6 }, T('o motor!', 580, 980, 56, INK.red)], { until: 36.1 });
  OT(36.2, 'tá entendendo?', 520, 760, 66, '#7c3aed', -4, { loop: 'wiggle' });

  // =====================================================================
  // CENA 10 (37,2–42,55): o mesmo motor do micro-ondas
  // =====================================================================
  const S10 = [[37.2, 42.55]];
  shot(S10, 1);
  {
    put([box(110, 720, 700, 440, 30, '#e5e7eb', null, 8), box(150, 760, 460, 360, 20, '#1e293b', null, 6), box(640, 770, 140, 340, 14, '#d1d5db', null, 5),
      ...[0, 1, 2].map(r => [0, 1].map(c => box(660 + c * 54, 800 + r * 54, 44, 40, 8, '#ffffff', null, 3))).flat(), box(660, 980, 98, 40, 8, '#22c55e', null, 3),
      { d: ellipse(380, 1080, 180, 26), fill: '#cbd5e1', w: 5 }, { d: 'M 110 1160 L 140 1200 M 810 1160 L 780 1200', w: 8 }, T('micro-ondas', 460, 1260, 56, '#475569')]);
    const glow = WB.mk('rect', { x: 156, y: 766, width: 448, height: 348, rx: 16, fill: '#fde047', opacity: 0 }, cont);
    const plate = WB.mk('g', {}, cont);
    put([...engine(1.6)], plate);
    WB.effect(t => {
      if (!inWin(S10, t)) return;
      glow.setAttribute('opacity', t > 38.0 ? (0.25 + 0.1 * Math.sin(t * 8)).toFixed(2) : 0);
      plate.setAttribute('transform', `translate(380 1050) scale(${r1(Math.cos(t * 2.5) * 100) / 100} 1)`);
    });
  }
  const v10 = dudeV();
  WB.effect(t => {
    if (!inWin(S10, t)) return;
    v10.update(t, vend({ x: 870, s: 0.82, y: 1600, mood: t > 42.1 ? MOODS.proud : MOODS.happy, op: opV(t), f: -1, look: -10,
      L: t < 42.1 ? [-200, -300 + Math.sin(t * 5) * 10] : [-150, -360], R: [80, -80], rotL: t > 42.1 ? -80 : 0 }));
  });
  put([{ d: WB.roughLine(60, 1600, 1020, 1600, 2), w: 6 }]);
  O(38.0, [T('MESMO MOTOR', 460, 600, 80, INK.red), { d: 'M 460 630 Q 430 680 400 720', c: INK.red, w: 6 }, { d: WB.arrowHead(400, 720, 2.2, 18), c: INK.red, w: 6 }], { anim: 'slam' });
  OT(40.7, 'PLIM!', 250, 1330, 70, '#15803d', -8, { anim: 'slam' });
  ostamp(42.1, 'FELIZMENTE', 520, 1380, 76, '#15803d', -4, { loop: 'pulse' });

  // =====================================================================
  // CENA 11 (42,55–45,35): "é potente, né?" — "O BICHO!" — um cavalinho só
  // =====================================================================
  const S11 = [[42.55, 45.35]];
  shot(S11, 1.12, 540, 1250);
  put(loja({ placa: false }));
  const c11 = dudeC(), v11 = dudeV();
  WB.effect(t => {
    if (!inWin(S11, t)) return;
    const flex = t > 43.55;
    c11.update(t, cli({ x: 260, mood: flex ? MOODS.confused : MOODS.innocent, op: opC(t), look: 10, L: [-60, -60], R: flex ? [60, -60] : [80, -230] }));
    v11.update(t, vend({ x: 760, mood: flex ? MOODS.proud : MOODS.neutral, op: opV(t), f: -1, look: -10, lean: flex ? -4 : 0,
      L: flex ? [-120, -330 + Math.sin(t * 10) * 10] : [-60, -60], R: flex ? [120, -330 + Math.cos(t * 10) * 10] : [60, -60] }));
  });
  {
    const pony = WB.mk('g', {}, ov);
    put([{ d: ellipse(0, 0, 54, 30), fill: '#a16207', w: 5 }, { d: 'M 40 -14 L 70 -60 L 96 -50 L 70 -6 Z', fill: '#a16207', w: 5 }, circ(84, -48, 4, '#111', 'none'),
      { d: 'M 58 -64 Q 40 -50 46 -22', c: '#422006', w: 8 }, { d: 'M -54 -6 Q -86 0 -80 30', c: '#422006', w: 8 }], pony);
    const legsP = dyn(pony, { 'stroke-width': 8 });
    put([box(-130, 60, 260, 26, 12, '#475569', null, 5)], pony);
    WB.effect(t => {
      if (!inWin(S11, t) || t < 44.0) { pony.setAttribute('opacity', 0); return; }
      const s = Math.sin(t * 22) * 14;
      pony.setAttribute('opacity', 1);
      pony.setAttribute('transform', `translate(540 ${r1(620 - Math.abs(Math.sin(t * 11)) * 6)}) scale(${r1(backOut(clamp((t - 44) / 0.3)) * 100) / 100})`);
      legsP.setAttribute('d', `M -34 20 L ${r1(-34 + s)} 62 M -14 20 L ${r1(-14 - s)} 62 M 24 20 L ${r1(24 + s)} 62 M 40 20 L ${r1(40 - s)} 62`);
    });
  }
  OT(44.1, 'potência: 1 cavalinho', 540, 760, 54, '#92400e', 0);

  // =====================================================================
  // CENA 12 (45,35–49,5): o cliente abre a porta e espia: cabem os sete?
  // =====================================================================
  const S12 = [[45.35, 49.5]];
  shot(S12, 1.12, 540, 1250);
  put(loja({ placa: false }));
  const mobi12 = makeCar(cont, { sticker: true });
  const c12 = dudeC();
  const DR12 = K([[45.35, 0], [46.0, 0], [46.6, 1, 'b']]);
  const C12X = K([[45.35, 120], [46.6, 290, 'io']]), C12o = odo(C12X, 45.3, 49.6);
  WB.effect(t => {
    if (!inWin(S12, t)) return;
    mobi12.set(700, FL, 1.0, { door: DR12(t) });
    c12.update(t, Object.assign(cli({ x: C12X(t), mood: t < 47.6 ? MOODS.think : MOODS.squint, op: opC(t), look: 12, lean: t > 46.6 ? 10 : 0,
      R: t < 46.6 ? [170, -260] : [150, -300], L: [-70, -80] }), C12o(t)));
  });
  {
    O(47.6, thought(700, 600, 300, 150, [[520, 760, 20], [560, 720, 28]]), {});
    const tg = WB.mk('g', {}, ov);
    const tk = [0, 1, 2, 3, 4, 5, 6].map(k => miniKid(tg, k));
    WB.effect(t => {
      if (!inWin(S12, t)) return;
      tg.setAttribute('opacity', clamp((t - 47.7) / 0.2));
      tk.forEach((f, k) => {
        const row = k < 3 ? 0 : (k < 6 ? 1 : 2), col = row === 2 ? 1 : k % 3;
        f(600 + col * 100, 700 - row * 70, 0.55, t, { rot: (col - 1) * 12 + (row === 2 ? 180 : 0), yell: true });
      });
    });
  }
  OT(48.0, '???', 240, 760, 100, '#7c3aed', -6, { loop: 'pulse' });

  // =====================================================================
  // CENA 13 (49,5–56,9): no banco do motorista: "pensando no futuro: mais dois menino!"
  // =====================================================================
  // vendedor todo encolhido dentro do Mobi: corpo no banco (aparece pelos vidros), cabeça furando o teto, joelho no queixo, pé pela janela
  function cramScene(win, o) {
    put(loja({ placa: false }));
    const car = makeCar(cont, { seeThru: true, sticker: true });
    const v = makePerson(car.behind, VEND);
    put([{ d: 'M -120 -292 L -96 -318 L -76 -296 L -50 -326 L -30 -296 L -4 -322 L 10 -292', c: BK, w: 6, fill: 'none' }], car.front);
    const shoe = holder([{ d: ellipse(0, 0, 26, 13), fill: '#111827', w: 5 }, { d: 'M -14 -10 L -20 -46', c: '#4b5563', w: 24 }, { d: 'M -14 -10 L -20 -46', c: BK, w: 4, op: 0 }], car.front);
    const sweat = WB.mk('g', {}, car.front);
    put([{ d: 'M 60 -470 q -14 24 0 36 q 14 -12 0 -36 Z', fill: '#93c5fd', w: 4 }, { d: 'M -150 -430 q -12 20 0 30 q 12 -10 0 -30 Z', fill: '#93c5fd', w: 4 }], sweat);
    WB.effect(t => {
      if (!inWin(win, t)) return;
      const b = o.beat ? o.beat(t) : 0;
      car.set(560, FL, 1.3, { squash: 1, rot: -2 + Math.sin(t * 2) * 0.6, bounce: b * 40 });
      const st = o.st(t);
      v.update(t, Object.assign({ x: -60, y: -96, s: 0.8, f: 1, seed: 0.3, sit: 1, seatH: 70, lean: -14, headRot: 22 + (st.headRot || 0),
        footT: [[60, -170], [90, -150]], op: opV(t) }, st, { headRot: 22 + (st.headRot || 0) }));
      shoe(222, -150 + Math.sin(t * 6) * 4, -20, 1, 1);
      sweat.setAttribute('transform', `translate(0 ${r1((t * 40) % 30)})`);
    });
    return car;
  }
  const S13 = [[49.5, 56.9]];
  shot(S13, 1.12, 540, 1250);
  cramScene(S13, { st: t => {
    const ent = t > 54.8;
    return { mood: t < 52.1 ? MOODS.happy : (ent ? MOODS.sly : MOODS.greedy), look: -6,
      R: ent ? roll(t, 1.2) : [150, -200], L: t > 52.1 && t < 54.8 ? [-110, -260] : [-60, -110], headRot: ent ? Math.sin(t * 5) * 5 : 0 };
  } });
  OT(49.7, 'espaçoso!', 300, 700, 76, '#15803d', -6, { loop: 'wiggle', until: 52.1 });
  O(50.4, [box(540, 1590, 420, 74, 16, '#fffdf5', INK.red, 6), T('teto: opcional', 750, 1642, 50, INK.red)], { anim: 'slam', until: 52.2 });
  ostamp(52.3, '+2 MENINOS?!', 700, 700, 80, '#db2777', 5, { loop: 'pulse' });
  {
    const bg = WB.mk('g', {}, ov);
    const b1 = miniKid(bg, 3), b2 = miniKid(bg, 6);
    WB.effect(t => {
      if (!inWin(S13, t) || t < 52.6) { bg.setAttribute('opacity', 0); return; }
      bg.setAttribute('opacity', 1);
      const u = backOut(clamp((t - 52.6) / 0.3));
      b1(800, 1000, 0.7 * u, t, { yell: true, rot: -20 }); b2(900, 1010, 0.7 * u, t, { yell: true, rot: 15 });
    });
  }
  O(52.7, [{ d: 'M 860 1040 Q 900 1100 860 1150', c: INK.red, w: 6 }, T('onde?', 940, 1200, 54, INK.red)], { anim: 'pop' });

  // =====================================================================
  // CENA 14 (56,9–58,4): "E o som do bichão?"
  // =====================================================================
  const S14 = [[56.9, 58.4]];
  shot(S14, 1.8, 540, 980);
  put(loja({ placa: false }));
  const c14 = dudeC();
  WB.effect(t => {
    if (!inWin(S14, t)) return;
    c14.update(t, cli({ x: 540, mood: MOODS.innocent, op: opC(t), headRot: 6, L: [-40, -150], R: [120, -330] }));
  });
  O(57.1, [...note(820, 760, 1.2), T('?', 900, 640, 90, '#7c3aed')], { loop: 'float' });

  // =====================================================================
  // CENA 15 (58,4–61,0 dentro / 61,0–66,0 fora): liga o som... TUM TUM, o Mobi pula
  // =====================================================================
  const S15 = [[58.4, 61.0]];
  shot(S15, 1.12, 540, 1250);
  const BEAT = t => { const u = ((t - 60.0) % 2 + 2) % 2; return t < 60 ? 0 : Math.exp(-u * 5); };
  cramScene(S15, { beat: BEAT, st: t => {
    const press = t < 59.3;
    return { mood: press ? MOODS.sly : MOODS.joy, look: press ? 12 : 0, shades: t > 59.3,
      R: press ? [160, -160 + Math.sin(t * 8) * 6] : [100, -240 + Math.sin(t * 9) * 12], L: press ? [-60, -110] : [-100, -240 + Math.cos(t * 9) * 12],
      headRot: press ? 0 : Math.sin(t * 9) * 6 };
  } });
  O(59.4, [...note(860, 900, 0.8, '#22d3ee'), ...note(940, 800, 0.6, '#7c3aed')], { loop: 'rise' });
  const S15b = [[61.0, 66.0]];
  shot(S15b, 1.12, 540, 1250);
  put(loja({ placa: false }));
  const mobi15 = makeCar(cont, {});
  {
    const waves = WB.mk('g', {}, cont);
    put([{ d: 'M 920 1050 Q 960 1150 920 1250 M 970 1010 Q 1030 1150 970 1290', c: '#7c3aed', w: 8 },
      { d: 'M 160 1050 Q 120 1150 160 1250 M 110 1010 Q 50 1150 110 1290', c: '#7c3aed', w: 8 }], waves);
    const tum = WB.mk('g', {}, ov);
    WB.showNow(WB.textStrokes('TUM!', 0, 0, 120, INK.red, tum, 'middle').strokes);
    WB.effect(t => {
      if (!inWin(S15b, t)) return;
      const b = BEAT(t);
      mobi15.set(540, FL, 1.3, { bounce: b * 70, rot: Math.sin(t * 3) * 2 * b });
      waves.setAttribute('opacity', b.toFixed(2));
      tum.setAttribute('opacity', b > 0.15 ? 1 : 0);
      const k = Math.floor((t - 60) / 2);
      tum.setAttribute('transform', `translate(${k % 2 ? 760 : 320} ${k % 2 ? 640 : 700}) rotate(${k % 2 ? 8 : -8}) scale(${r1((0.8 + b * 0.5) * 100) / 100})`);
    });
  }
  O(61.2, [...note(380, 760, 0.9), ...note(700, 720, 0.7, '#22d3ee')], { loop: 'float' });
  OT(61.6, 'o paredão do Mobi', 540, 1640, 56, '#7c3aed', 0);

  // =====================================================================
  // CENA 16 (66,0–70,2): ele sai do carro dançando de óculos: "tu tá entendendo!"
  // =====================================================================
  const S16 = [[66.0, 70.2]];
  shot(S16, 1.12, 540, 1250);
  put(loja({ placa: false }));
  const mobi16 = makeCar(cont, { sticker: true });
  const v16 = dudeV();
  const V16X = K([[66.0, 420], [67.4, 560, 'o'], [68.8, 460], [70.2, 540]]), V16o = odo(V16X, 65.9, 70.3);
  WB.effect(t => {
    if (!inWin(S16, t)) return;
    mobi16.set(700, FL, 0.9, { door: 1 });
    v16.update(t, Object.assign(vend({ x: V16X(t), mood: MOODS.joy, op: opV(t), shades: true, hop: Math.abs(Math.sin(t * 7)) * 30,
      L: [-140 + Math.sin(t * 7) * 30, -320], R: roll(t, 1.4), headRot: Math.sin(t * 7) * 8, lean: Math.sin(t * 3.5) * 6 }), V16o(t)));
  });
  O(66.1, confetti(120, 600, 960, 1100, 30, 3), { loop: 'float' });
  ostamp(66.3, 'TÁ ENTENDENDO!', 540, 680, 84, '#7c3aed', -4, { loop: 'pulse' });

  // =====================================================================
  // CENA 17 (70,2–76,25): o precinho: 72 x 3.890 = R$ 280 mil
  // =====================================================================
  const S17 = [[70.2, 76.25]];
  shot(S17, 1.12, 540, 1250);
  put(loja({ placa: false }));
  const v17 = dudeV(), c17 = dudeC();
  put(priceTag('PRECINHO'), v17.itemR);
  const calcH = holder(calcu(), ov);
  WB.effect(t => {
    if (!inWin(S17, t)) return;
    const res = t > 74.9;
    v17.update(t, vend({ x: 740, mood: res ? MOODS.greedy : MOODS.sly, op: opV(t), f: 1, look: -10, R: [150, -380 + Math.sin(t * 4) * 10], rotR: -10,
      L: t > 73.2 ? [-170, -240] : [-60, -60] }));
    c17.update(t, cli({ x: 230, mood: res ? MOODS.horror : (t > 73.2 ? MOODS.shock : MOODS.happy), op: opC(t), look: 10,
      L: res ? [-120, -330] : [-60, -60], R: res ? [120, -330] : [60, -60], headRot: res ? Math.sin(t * 40) * 3 : 0 }));
    const u = backOut(clamp((t - 73.3) / 0.3));
    calcH(540, 790, -6, 0.7 * u, t > 73.3 ? 1 : 0);
  });
  O(73.4, [T('72 x 3.890', 540, 580, 74, BK)], { anim: 'pop' });
  ostamp(74.9, '= R$ 280.080', 540, 1200, 92, INK.red, 4, { loop: 'shake' });
  OT(75.4, 'NUM MOBI?!', 250, 700, 64, '#1d4ed8', -8, { loop: 'tremble' });

  // =====================================================================
  // CENA 18 (76,25–81,0): o cliente desmaia; "em duas semanas... felizmente"
  // =====================================================================
  const S18 = [[76.25, CTA0]];
  shot(S18, 1.08, 540, 1250);
  put(loja({ placa: false }));
  const c18 = dudeC(), v18 = dudeV();
  const ROT18 = K([[76.25, 0], [77.3, 0], [77.8, -86, 'i'], [78.0, -80, 'o']]);
  const X18 = K([[76.25, 420], [77.8, 560, 'io']]);
  WB.effect(t => {
    if (!inWin(S18, t)) return;
    const down = t > 77.8, kick = Math.sin(t * 22) * 22;
    c18.update(t, cli({ x: X18(t), rot: ROT18(t), mood: down ? MOODS.dead : MOODS.horror, xeyes: down ? 1 : 0, tongue: down ? 0.8 : 0,
      L: [-150, -150], R: [150, -150], footT: down ? [[118, -30 + kick], [116, 36 - kick]] : null }));
    v18.update(t, vend({ x: 860, mood: t > 79.5 ? MOODS.proud : MOODS.sly, op: opV(t), f: -1, look: -12,
      L: t > 79.5 ? [-150, -360] : [-110, -250], rotL: t > 79.5 ? -80 : 0, R: [70, -70] }));
  });
  O(76.6, calendar(330, 720, 'EM', '2 SEMANAS', '#16a34a', 330), { anim: 'slam', until: 79.4 });
  O(77.8, [burst(600, 1360, 80, '#fef08a'), T('PLOFT!', 600, 1385, 60, INK.red)], { anim: 'slam' });
  ostamp(79.5, 'FELIZMENTE!', 660, 640, 96, '#15803d', -5, { loop: 'shake' });

  // =====================================================================
  // CTA (81,0–fim)
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
    const cc = makeCar(cont, { sticker: true });
    const vc = makePerson(cont, VEND);
    WB.effect(t => {
      if (t < CTA0) return;
      cc.set(700, 1600, 0.85, { bounce: Math.abs(Math.sin(t * 5)) * 16 });
      vc.update(t, { x: 260, y: 1600, s: 0.85, f: 1, seed: 0.3, mood: MOODS.joy, shades: true, L: [-90 + Math.sin(t * 10) * 26, -300], R: roll(t, 1.3), hop: Math.abs(Math.sin(t * 6)) * 24 });
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