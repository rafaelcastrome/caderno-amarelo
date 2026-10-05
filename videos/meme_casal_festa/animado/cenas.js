// Meme "o casal, a festa às 3 da manhã e o helicóptero" no estilo Caderno Amarelo (formato B, desenho animado).
// Cena fixa embaixo: o quarto, a mulher deitada na cama e o homem sentado na beirada, que depois levanta e vai "pro banheiro".
// Em cima, cada fala ganha seu desenho. Quem fala foi separado pelo tom de voz do áudio original
// (homem ~130–240 Hz, mulher ~260–450 Hz) e conferido nos quadros do vídeo original:
// a boca de cada boneco só mexe dentro das janelas da sua própria voz (FALA_ELA / FALA_ELE).
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  // Abertura sem fala (OFF s): ele deitado, acorda e pula da cama de pijama antes do "Tu vai pra onde?".
  // Todos os tempos abaixo são do áudio original; o motor recebe o tempo do vídeo, deslocado aqui.
  const OFF = 2.6;
  const rawEffect = WB.effect;
  WB.effect = fn => rawEffect(t => fn(t - OFF));
  // ele: 0 = deitado, 1 = sentado na beirada
  const sitU = t => ease(clamp((t + 1.5) / 0.7));
  const r1 = n => Math.round(n * 10) / 10;
  const MOUTH = '#6b1f2b';
  const ellipse = (cx, cy, rx, ry) => WB.arcPath(cx, cy, rx, ry, 0, Math.PI * 2, 48) + ' Z';
  const backOut = u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };

  // energia do áudio original, 20 valores por segundo (0–9)
  const ENV = '000000000452388643432322100000000000000028822652003430020000000000000000065473232208952001233333330210020233311014999994962961982265329894397633212121024211112222220000003999997677768966743233332343123220043112310112343200672043321323320034233203233322246699953185169676329940992146257697998542107410243389568316553215432994399722332841596387594675774995999999995310000999733200000000036344434420002000010000332000020344003460002423443534226232262302443202520102200000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  // quem fala quando (segundos)
  const FALA_ELA = [[0.40, 1.32], [3.60, 4.42], [5.58, 7.12], [8.45, 9.22], [12.90, 14.76]];
  const FALA_ELE = [[1.90, 2.92], [4.43, 5.57], [7.13, 8.25], [9.23, 12.89], [14.77, 18.15], [18.38, 18.78], [19.20, 19.80], [20.33, 20.60]];
  const talking = (wins, t) => wins.some(([a, b]) => t >= a && t <= b);

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
  const showAll = (it) => { WB.showNow(it.strokes); it.fills.forEach(f => f.el.setAttribute('fill-opacity', 1)); return it; };
  // aparece com "pop" (ou outro efeito) e pode seguir se mexendo
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
      if (loop === 'rise') { dy -= tt * 40; op *= clamp(1.6 - tt * 0.35); }
      if (loop === 'pulse') k *= 1 + 0.07 * Math.sin(ts * 9);
      if (loop === 'spin') rot += Math.sin(ts * 9) * 8;
      if (loop === 'turn') rot += tt * 260;
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
  // P(bt, specs, opções): item aparece em bt. opções: anim, loop, ph, fx, fy, rot (giro fixo), parent
  function P(bt, specs, o = {}) {
    let parent = o.parent || cont;
    if (o.rot) parent = WB.mk('g', { transform: `rotate(${o.rot} ${o.rx ?? 540} ${o.ry ?? 700})` }, parent);
    const it = showAll(build(specs, parent));
    animate(it.g, bt, o);
    return it;
  }
  const TX = (bt, text, x, y, size, c, rot = 0, o = {}) => P(bt, T(text, x, y, size, c), Object.assign({ rot, rx: x, ry: y - size * 0.3 }, o));

  // ---------------- desenhos ----------------
  const box = (x, y, w, h, r, fill, c, wd) => ({ d: WB.roundRectPath(x, y, w, h, r), fill, c, w: wd || 6 });
  const circ = (x, y, r, fill, c, wd) => ({ d: WB.circlePath(x, y, r), fill, c, w: wd || 6 });
  const S = (x, y, s) => (dx, dy) => `${r1(x + dx * s)} ${r1(y + dy * s)}`;
  function confetti(x0, y0, x1, y1, n = 34, seed = 1) {
    const cols = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'], out = [];
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
  function partyBoy(x, y, s, shirt, hatC, skin = '#d9a074') {
    const p = S(x, y, s);
    return [
      { d: `M ${p(-18, 150)} L ${p(-30, 235)} M ${p(18, 150)} L ${p(32, 235)}`, w: 9 },
      { d: `M ${p(-38, 78)} L ${p(-96, 0)} M ${p(38, 78)} L ${p(96, 0)}`, w: 9 },
      box(x - 42 * s, y + 48 * s, 84 * s, 108 * s, 20 * s, shirt),
      circ(x, y, 50 * s, skin),
      { d: `M ${p(-36, -30)} L ${p(0, -130)} L ${p(36, -30)} Z`, fill: hatC, w: 5 },
      circ(x, y - 134 * s, 14 * s, '#ffd23f', null, 4),
      { d: `M ${p(-26, -2)} Q ${p(-17, -14)} ${p(-8, -2)} M ${p(8, -2)} Q ${p(17, -14)} ${p(26, -2)}`, w: 5 },
      { d: `M ${p(-26, 16)} Q ${p(0, 52)} ${p(26, 16)} Z`, fill: '#ffffff', w: 5 },
    ];
  }
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
  function qmark(x, y, s, c) { return T('?', x, y, 150 * s, c); }
  function clock(x, y, r) {   // marcando 3 em ponto
    let ticks = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ticks += `M ${r1(x + Math.cos(a) * r * 0.82)} ${r1(y + Math.sin(a) * r * 0.82)} L ${r1(x + Math.cos(a) * r * 0.92)} ${r1(y + Math.sin(a) * r * 0.92)} `;
    }
    return [{ d: `M ${x - r * 0.75} ${y - r * 0.75} l -30 -30 M ${x + r * 0.75} ${y - r * 0.75} l 30 -30`, w: 12 },
      circ(x - r * 0.8, y - r * 0.85, r * 0.28, '#ef4444', null, 7), circ(x + r * 0.8, y - r * 0.85, r * 0.28, '#ef4444', null, 7),
      circ(x, y, r, '#ffffff', null, 9), { d: ticks, w: 6 },
      { d: `M ${x} ${y} L ${x + r * 0.5} ${y}`, w: 12 }, { d: `M ${x} ${y} L ${x} ${y - r * 0.74}`, w: 8 }, circ(x, y, 9, '#111', null, 3),
      { d: `M ${x - r * 0.5} ${y + r} L ${x - r * 0.7} ${y + r * 1.25} M ${x + r * 0.5} ${y + r} L ${x + r * 0.7} ${y + r * 1.25}`, w: 10 }];
  }
  function discoBall(x, y, r) {
    const out = [{ d: `M ${x} ${y - r - 140} L ${x} ${y - r}`, c: '#6b7280', w: 5 }, circ(x, y, r, '#cbd5e1', null, 7)];
    let d = '';
    for (let k = -2; k <= 2; k++) d += `M ${r1(x - r * Math.cos(Math.asin(k / 3)))} ${r1(y + r * k / 3)} L ${r1(x + r * Math.cos(Math.asin(k / 3)))} ${r1(y + r * k / 3)} `;
    out.push({ d, c: '#64748b', w: 4 });
    for (let k = -2; k <= 2; k++) out.push({ d: ellipse(x, y, Math.abs(k) * r / 3 + 1, r), c: '#64748b', w: 4 });
    out.push(T('*', x - r * 1.5, y - r * 0.4, 80, '#facc15'), T('*', x + r * 1.6, y + r * 0.2, 70, '#ec4899'), T('*', x + r * 0.2, y + r * 1.9, 60, '#22c55e'));
    return out;
  }
  function roadSign(x, y, l1, l2) {
    const w = Math.max(WB.measure(l1, 72), WB.measure(l2, 60)) + 120;
    return [{ d: `M ${x - w / 3} ${y + 70} L ${x - w / 3} ${y + 330} M ${x + w / 3} ${y + 70} L ${x + w / 3} ${y + 330}`, c: '#6b7280', w: 16 },
      box(x - w / 2, y - 120, w, 200, 22, '#15803d', null, 8), box(x - w / 2 + 14, y - 106, w - 28, 172, 14, null, '#ffffff', 5),
      T(l1, x, y - 30, 72, '#ffffff'), T(l2, x, y + 46, 60, '#ffffff')];
  }
  function car(x, y) {
    return [{ d: `M ${x - 150} ${y} L ${x - 150} ${y - 60} Q ${x - 140} ${y - 80} ${x - 90} ${y - 84} L ${x - 60} ${y - 140} L ${x + 60} ${y - 140} L ${x + 100} ${y - 84} Q ${x + 150} ${y - 80} ${x + 156} ${y - 50} L ${x + 156} ${y} Z`, fill: '#ef4444', w: 7 },
      box(x - 48, y - 128, 50, 44, 6, '#bfe0f5', null, 4), box(x + 12, y - 128, 54, 44, 6, '#bfe0f5', null, 4),
      circ(x - 90, y + 4, 34, '#374151', null, 7), circ(x + 96, y + 4, 34, '#374151', null, 7), circ(x - 90, y + 4, 12, '#d1d5db', null, 4), circ(x + 96, y + 4, 12, '#d1d5db', null, 4),
      { d: `M ${x - 190} ${y - 70} l -60 0 M ${x - 200} ${y - 30} l -90 0 M ${x - 190} ${y + 10} l -50 0`, c: '#9ca3af', w: 7 }];
  }
  function spiral(x, y, r, c = INK.purple) {
    let d = '';
    for (let i = 0; i <= 60; i++) { const a = i * 0.36, rr = r * i / 60; d += (i ? ' L ' : 'M ') + r1(x + Math.cos(a) * rr) + ' ' + r1(y + Math.sin(a) * rr); }
    return { d, c, w: 8 };
  }
  // helicóptero com os amigos na janela
  function helicopter(x, y, s = 1) {
    const p = S(x, y, s);
    return [
      { d: `M ${p(60, -10)} L ${p(300, -40)} L ${p(300, 10)} L ${p(80, 40)}`, fill: '#facc15', w: 7 },
      circ(x + 300 * s, y - 20 * s, 44 * s, null, '#6b7280', 6),
      { d: `M ${p(-120, 120)} L ${p(130, 120)} M ${p(-160, 120)} Q ${p(-150, 140)} ${p(-120, 140)} L ${p(150, 140)} M ${p(-70, 80)} L ${p(-80, 130)} M ${p(70, 80)} L ${p(80, 130)}`, w: 9 },
      { d: ellipse(x, y, 170 * s, 100 * s), fill: '#facc15', w: 8 },
      { d: `M ${p(-150, -10)} Q ${p(-130, -80)} ${p(-40, -84)} L ${p(80, -84)} Q ${p(110, -60)} ${p(110, -10)} Z`, fill: '#bfe0f5', w: 6 },
      circ(x - 80 * s, y - 34 * s, 26 * s, '#d9a074', null, 4), circ(x - 10 * s, y - 38 * s, 26 * s, '#e8bf9a', null, 4), circ(x + 60 * s, y - 34 * s, 26 * s, '#8d5524', null, 4),
      { d: `M ${p(-96, -28)} Q ${p(-80, -16)} ${p(-64, -28)} M ${p(-26, -32)} Q ${p(-10, -20)} ${p(6, -32)} M ${p(44, -28)} Q ${p(60, -16)} ${p(76, -28)}`, w: 4 },
      { d: `M ${p(-110, -40)} L ${p(-80, -100)} L ${p(-50, -40)} M ${p(-40, -46)} L ${p(-10, -108)} L ${p(20, -46)} M ${p(30, -40)} L ${p(60, -100)} L ${p(90, -40)}`, c: '#ec4899', w: 5 },
      { d: `M ${p(0, -100)} L ${p(0, -136)}`, w: 10 },
    ];
  }
  const rotor = (x, y, s = 1) => [{ d: `M ${x - 230 * s} ${y} L ${x + 230 * s} ${y}`, w: 12 }, circ(x, y, 12 * s, '#374151', null, 4)];
  function toilet(x, y, s = 1) {
    const p = S(x, y, s);
    return [
      { d: `M ${p(-45, 300)} L ${p(-55, 362)} L ${p(55, 362)} L ${p(45, 300)}`, fill: '#ffffff', w: 6 },
      { d: `M ${p(-106, 148)} Q ${p(-92, 282)} ${p(-40, 302)} L ${p(40, 302)} Q ${p(92, 282)} ${p(106, 148)} Z`, fill: '#ffffff', w: 6 },
      box(x - 72 * s, y, 144 * s, 112 * s, 14, '#ffffff'),
      { d: ellipse(x, y + 142 * s, 112 * s, 34 * s), fill: '#e6eef5', w: 6 },
      { d: `M ${p(40, 32)} L ${p(60, 32)}`, w: 8 },
    ];
  }
  function thought(cx, cy, rx, ry, dots) {
    return [...dots.map(([x, y, r]) => circ(x, y, r, '#ffffff', null, 5)), { d: WB.cloudPath(cx, cy, rx, ry), fill: '#ffffff', w: 7 }];
  }
  function nightSky(x0, y0, x1, y1) {
    return [{ d: WB.roughRect(x0, y0, x1, y1), fill: '#1e1b4b', w: 8 },
      { d: `M ${x0 + 150} ${y0 + 60} A 70 70 0 1 0 ${x0 + 210} ${y0 + 190} A 56 56 0 1 1 ${x0 + 150} ${y0 + 60} Z`, fill: '#fde68a', c: '#facc15', w: 5 },
      T('*', x0 + 380, y0 + 110, 70, '#ffffff'), T('*', x1 - 120, y0 + 90, 90, '#fde68a'), T('*', x0 + 520, y0 + 240, 50, '#ffffff'),
      T('*', x1 - 260, y1 - 80, 60, '#ffffff'), T('*', x0 + 110, y1 - 70, 56, '#fde68a')];
  }

  // ---------------- o quarto (camada fixa) ----------------
  document.getElementById('hand').style.display = 'none';
  const room = WB.mk('g', {}, WB.overlay);
  const MOON = 'M 470 1035 A 34 34 0 1 0 500 1095 A 27 27 0 1 1 470 1035 Z';
  showAll(build([
    { d: 'M 40 1600 L 1040 1600', c: '#9ca3af', w: 8 },
    box(410, 990, 200, 170, 10, '#1e1b4b', null, 8), { d: MOON, fill: '#fde68a', c: '#facc15', w: 4 },
    T('*', 560, 1050, 44, '#ffffff'), T('*', 545, 1135, 34, '#fde68a'),
    { d: 'M 510 990 L 510 1160 M 410 1075 L 610 1075', c: INK.black, w: 7 },
    { d: 'M 395 975 Q 420 1080 400 1180 L 430 1180 Q 445 1080 430 975 Z M 625 975 Q 600 1080 620 1180 L 590 1180 Q 575 1080 590 975 Z', fill: '#e9d5ff', w: 5 },
    { d: 'M 380 975 L 640 975', w: 9 },
  ], room));
  // porta do banheiro (abre no fim)
  const door = WB.mk('g', {}, room);
  showAll(build([box(880, 1085, 165, 515, 8, '#1f2937', null, 7)], door));
  const doorLeaf = WB.mk('g', {}, door);
  showAll(build([box(880, 1085, 165, 515, 8, '#c08457', null, 7), box(905, 1120, 115, 170, 8, null, '#8b5a2b', 5),
    box(905, 1340, 115, 220, 8, null, '#8b5a2b', 5), circ(1015, 1330, 12, '#facc15', null, 4),
    box(915, 1010, 95, 60, 10, '#ffffff', null, 5), T('WC', 962, 1056, 46, INK.blue)], doorLeaf));
  WB.effect(t => {
    const u = ease(clamp((t - 20.45) / 0.35)) * (1 - ease(clamp((t - 21.15) / 0.3)));
    doorLeaf.setAttribute('transform', `translate(880 0) scale(${(1 - 0.82 * u).toFixed(3)} 1) translate(-880 0)`);
  });
  // cama
  showAll(build([
    box(55, 1120, 80, 480, 26, '#92400e', null, 8), { d: 'M 75 1180 L 115 1180 M 75 1220 L 115 1220', c: '#78350f', w: 5 },
    box(120, 1440, 32, 160, 6, '#92400e', null, 6), box(830, 1440, 32, 160, 6, '#92400e', null, 6),
    box(110, 1335, 760, 110, 18, '#f8fafc', null, 7),
    box(100, 1440, 775, 50, 10, '#b45309', null, 7),
    { d: ellipse(240, 1300, 118, 50), fill: '#e0e7ff', w: 7 },
  ], room));

  // ---------------- rosto (olhos, sobrancelhas, boca) ----------------
  const MOODS = {
    leve: { lid: 0.3, px: 6, py: 1, bi: 2, bo: 0, smile: -1, rot: 0 },
    enfado: { lid: 0.5, px: 7, py: 2, bi: 3, bo: 2, smile: -3, rot: -4 },
    sorriso: { lid: 0.2, px: 6, py: 0, bi: -6, bo: -2, smile: 11, rot: -4 },
    euforia: { lid: 0, px: 4, py: -6, bi: -14, bo: -10, smile: 12, rot: 6 },
    brava: { lid: 0.28, px: 8, py: 0, bi: 12, bo: -4, smile: -9, rot: 0 },
    arregalada: { lid: 0, px: 6, py: -1, bi: -13, bo: -10, smile: -1, rot: 3 },
    pensativa: { lid: 0.05, px: 6, py: -9, bi: -9, bo: -4, smile: -2, rot: 6 },
    estresse: { lid: 0.4, px: 9, py: 3, bi: -9, bo: 4, smile: -6, rot: -6, sweat: 1 },
    revira: { lid: 0.1, px: 5, py: -12, bi: -6, bo: -6, smile: -4, rot: 7 },
    confusa: { lid: 0.1, px: 7, py: -4, bi: -9, bo: -2, smile: -4, rot: 8, asym: 1 },
    sono: { lid: 0.85, px: 0, py: 3, bi: 2, bo: 2, smile: 2, rot: -3 },
  };
  const keys = ['lid', 'px', 'py', 'bi', 'bo', 'smile', 'rot', 'asym', 'sweat'];
  function stateAt(TL, t) {
    let i = 0;
    while (i + 1 < TL.length && TL[i + 1][0] <= t) i++;
    const cur = TL[i], prev = TL[Math.max(0, i - 1)];
    const u = i === 0 ? 1 : ease(clamp((t - cur[0]) / 0.3));
    const m0 = MOODS[prev[1]], m1 = MOODS[cur[1]], s = { pose0: prev[2] || 'rest', pose1: cur[2] || 'rest', pu: i === 0 ? 1 : ease(clamp((t - cur[0]) / 0.35)) };
    for (const k of keys) s[k] = lerp(m0[k] || 0, m1[k] || 0, u);
    return s;
  }
  function blink(t, off) {
    let v = 0;
    for (let k = 0; k < 10; k++) {
      const tb = off + k * 2.7 + 0.6 * Math.sin(k * 1.7), d = Math.abs(t - tb);
      if (d < 0.09) v = Math.max(v, 1 - d / 0.09);
    }
    return v;
  }
  function makeFace(headG, cfg) {
    showAll(build([cfg.back || [], { d: ellipse(-98, 12, 15, 24), fill: cfg.skin, w: 5 }, { d: ellipse(98, 12, 15, 24), fill: cfg.skin, w: 5 },
      { d: ellipse(0, 0, 100, 118), fill: cfg.skin, w: 7 }, { d: 'M -4 26 Q -14 46 0 50 Q 9 51 12 46', w: 5, c: '#5a3a22' }, cfg.hair], headG));
    const dyn = WB.mk('g', {}, headG);
    const eyes = [-38, 38].map((ex, i) => {
      WB.mk('path', { d: ellipse(ex, 8, 22, 17), fill: '#ffffff', stroke: INK.black, 'stroke-width': 5 }, dyn);
      const cp = WB.mk('clipPath', { id: `eye${i}${cfg.id}` }, dyn);
      WB.mk('path', { d: ellipse(ex, 8, 21, 16) }, cp);
      const clip = `url(#eye${i}${cfg.id})`;
      return {
        ex,
        pupil: WB.mk('circle', { cx: ex, cy: 8, r: 9, fill: '#1f1410', 'clip-path': clip }, dyn),
        lid: WB.mk('rect', { x: ex - 24, y: -10, width: 48, height: 0, fill: cfg.skin, 'clip-path': clip }, dyn),
        lidLine: WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': 5, 'stroke-linecap': 'round', 'clip-path': clip }, dyn),
        brow: WB.mk('path', { d: '', fill: 'none', stroke: cfg.brow, 'stroke-width': 10, 'stroke-linecap': 'round' }, dyn),
      };
    });
    const mouth = WB.mk('path', { d: '', fill: MOUTH, stroke: INK.black, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, dyn);
    const extra = cfg.extra ? showAll(build(cfg.extra, dyn)) : null;
    const sweat = WB.mk('path', { d: 'M 86 -60 q -14 24 0 36 q 14 -12 0 -36 Z', fill: '#93c5fd', stroke: INK.black, 'stroke-width': 4, opacity: 0 }, dyn);
    return function update(t, s, op, look) {
      const lid = Math.max(s.lid, blink(t, cfg.blink));
      eyes.forEach((e, i) => {
        e.pupil.setAttribute('cx', (e.ex + s.px * look).toFixed(1)); e.pupil.setAttribute('cy', (8 + s.py).toFixed(1));
        const h = lid * 34, yl = -9 + h;
        e.lid.setAttribute('height', h.toFixed(1));
        e.lidLine.setAttribute('d', lid > 0.06 ? `M ${e.ex - 24} ${yl.toFixed(1)} Q ${e.ex} ${(yl + 3).toFixed(1)} ${e.ex + 24} ${yl.toFixed(1)}` : '');
        const side = i === 0 ? -1 : 1, bi = s.bi + (i === 1 ? s.asym * 14 : 0);
        const ox = e.ex + side * 26, ix = e.ex - side * 24, oy = -26 + s.bo, iy = -28 + bi;
        e.brow.setAttribute('d', `M ${ox} ${oy.toFixed(1)} Q ${e.ex} ${(Math.min(oy, iy) - 7).toFixed(1)} ${ix} ${iy.toFixed(1)}`);
      });
      const sm = s.smile;
      if (op < 0.06) {
        mouth.setAttribute('fill', 'none');
        mouth.setAttribute('d', `M -26 76 Q 0 ${(76 + sm * 1.6).toFixed(1)} 26 76`);
      } else {
        const rx = 26 - 4 * op, top = 76 - 4 - 6 * op + Math.max(0, sm) * 0.3, bot = 76 + 6 + 32 * op + Math.max(0, sm) * 0.6;
        mouth.setAttribute('fill', MOUTH);
        mouth.setAttribute('d', `M ${(-rx).toFixed(1)} 76 Q 0 ${(2 * top - 76).toFixed(1)} ${rx.toFixed(1)} 76 Q 0 ${(2 * bot - 76).toFixed(1)} ${(-rx).toFixed(1)} 76 Z`);
      }
      sweat.setAttribute('opacity', s.sweat.toFixed(2));
      sweat.setAttribute('transform', `translate(0 ${((t * 30) % 40).toFixed(1)})`);
    };
  }
  // braço que sai do ombro: ombro → cotovelo → mão (com dedo apontando quando pedido)
  function makeArm(parent, skin, sleeve, wOut, wIn, handR) {
    const g = WB.mk('g', {}, parent);
    const out = WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': wOut, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    const inn = WB.mk('path', { d: '', fill: 'none', stroke: skin, 'stroke-width': wIn, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    const slO = WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': wOut + 10, 'stroke-linecap': 'round' }, g);
    const slI = WB.mk('path', { d: '', fill: 'none', stroke: sleeve, 'stroke-width': wIn + 10, 'stroke-linecap': 'round' }, g);
    const hand = WB.mk('g', {}, g);
    const finger = WB.mk('path', { d: `M ${handR * 0.4} ${-handR * 0.45} Q ${handR * 2.2} ${-handR * 0.75} ${handR * 2.9} ${-handR * 0.5} Q ${handR * 3.1} ${-handR * 0.1} ${handR * 2.8} ${handR * 0.1} Q ${handR * 1.8} ${handR * 0.05} ${handR * 0.6} ${handR * 0.4} Z`, fill: skin, stroke: INK.black, 'stroke-width': 5, opacity: 0 }, hand);
    WB.mk('circle', { cx: 0, cy: 0, r: handR, fill: skin, stroke: INK.black, 'stroke-width': 5 }, hand);
    return function set(sh, el, h, rot, point) {
      const d = `M ${r1(sh[0])} ${r1(sh[1])} L ${r1(el[0])} ${r1(el[1])} L ${r1(h[0])} ${r1(h[1])}`;
      out.setAttribute('d', d); inn.setAttribute('d', d);
      const mx = sh[0] + (el[0] - sh[0]) * 0.45, my = sh[1] + (el[1] - sh[1]) * 0.45;
      const sd = `M ${r1(sh[0])} ${r1(sh[1])} L ${r1(mx)} ${r1(my)}`;
      slO.setAttribute('d', sd); slI.setAttribute('d', sd);
      hand.setAttribute('transform', `translate(${r1(h[0])} ${r1(h[1])}) rotate(${r1(rot)})`);
      finger.setAttribute('opacity', point.toFixed(2));
    };
  }
  const lerpP = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  function poseLerp(P0, P1, u) {
    return { el: lerpP(P0.el, P1.el, u), h: lerpP(P0.h, P1.h, u), r: lerp(P0.r || 0, P1.r || 0, u), pt: lerp(P0.pt || 0, P1.pt || 0, u) };
  }

  // ---------------- ELA: deitada na cama, máscara de dormir na testa ----------------
  const W_SKIN = '#f1c9a5', W_HAIR = '#9a3412', W_PJ = '#7c3aed';
  const ELA = { x: 245, y: 1222, s: 0.74, rot: -18 };
  // ombro de pijama (embaixo da coberta)
  showAll(build([{ d: 'M 285 1310 Q 290 1250 345 1246 Q 395 1250 400 1310 Z', fill: W_PJ, w: 6 }], room));
  const elaRoot = WB.mk('g', {}, room);
  const elaHead = WB.mk('g', {}, elaRoot);
  const elaFace = makeFace(elaHead, {
    id: 'ela', skin: W_SKIN, brow: W_HAIR, blink: 1.1,
    back: [{ d: 'M -120 -10 Q -150 -150 0 -150 Q 150 -150 128 -10 Q 170 90 210 150 Q 120 170 60 120 L -60 120 Q -150 170 -220 130 Q -150 80 -120 -10 Z', fill: W_HAIR, w: 6 }],
    hair: [{ d: 'M -104 -5 Q -112 -130 5 -134 Q 114 -128 104 -12 Q 74 -90 -10 -76 Q -68 -66 -104 -5 Z', fill: W_HAIR, w: 6 }],
  });
  // máscara de dormir (roxa com lua e estrelas): começa na testa e desce pros olhos quando ela volta a dormir
  const mask = WB.mk('g', {}, elaHead);
  showAll(build([{ d: 'M -112 -14 L 112 -14', c: '#4c1d95', w: 9 },
    box(-96, -30, 192, 64, 30, '#6d28d9', null, 6),
    { d: 'M -40 -14 A 16 16 0 1 0 -26 14 A 12 12 0 1 1 -40 -14 Z', fill: '#fde68a', c: '#facc15', w: 3 },
    T('*', 20, 18, 40, '#ffffff'), T('*', 60, 4, 30, '#ffffff'), T('*', -68, 18, 26, '#ffffff')], mask));
  // coberta por cima do corpo
  showAll(build([
    { d: 'M 300 1306 Q 330 1262 420 1262 Q 560 1258 650 1276 Q 740 1262 790 1242 Q 850 1236 866 1300 L 870 1420 Q 600 1440 300 1420 Z', fill: '#f4a6c4', w: 7 },
    { d: 'M 310 1330 Q 580 1350 866 1330', c: '#ec4899', w: 6 },
  ], room));
  const elaArm = makeArm(room, W_SKIN, W_PJ, 34, 24, 21);
  const ELA_SH = [345, 1282];
  const ELA_POSE = {
    rest: { el: [405, 1322], h: [478, 1306], r: 0 },
    pergunta: { el: [415, 1262], h: [470, 1190], r: -60 },
    aponta: { el: [420, 1250], h: [520, 1212], r: -12, pt: 1 },
    testa: { el: [415, 1232], h: [292, 1150], r: 180 },
    dorme: { el: [372, 1312], h: [330, 1296], r: 0 },
  };
  const TL_ELA = [[-9, 'sono', 'dorme'], [-0.6, 'arregalada'], [0, 'leve'], [0.4, 'confusa', 'pergunta'], [1.5, 'enfado'], [2.7, 'enfado'], [3.6, 'arregalada', 'pergunta'], [4.5, 'enfado'],
    [5.6, 'brava', 'pergunta'], [6.4, 'confusa', 'aponta'], [7.2, 'enfado'], [8.45, 'confusa', 'pergunta'], [9.3, 'enfado'], [10.9, 'revira'],
    [12.9, 'brava', 'aponta'], [13.85, 'revira', 'testa'], [14.8, 'arregalada'], [15.9, 'enfado'], [17.6, 'confusa'], [18.45, 'brava'],
    [19.25, 'enfado'], [19.6, 'sono']];

  // ---------------- ELE: sentado na beirada da cama, depois levanta ----------------
  const M_SKIN = '#e8bf9a', M_HAIR = '#1f1410', M_SHIRT = '#60a5fa', M_SHORTS = '#60a5fa';   // pijama listrado
  const M_SC = 0.85;
  const eleRoot = WB.mk('g', {}, WB.overlay);
  const legsG = WB.mk('g', {}, eleRoot);
  const legEls = [-1, 1].map(() => ({
    out: WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': 40, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, legsG),
    inn: WB.mk('path', { d: '', fill: 'none', stroke: M_SKIN, 'stroke-width': 30, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, legsG),
    shoe: WB.mk('path', { d: '', fill: '#374151', stroke: INK.black, 'stroke-width': 5 }, legsG),
  }));
  showAll(build([
    { d: 'M -88 70 L -84 -10 L 84 -10 L 88 70 Q 60 82 6 70 L 0 50 L -6 70 Q -60 82 -88 70 Z', fill: M_SHORTS, w: 7 },
    { d: 'M -26 -250 L -24 -200 L 24 -200 L 26 -250 Z', fill: M_SKIN, w: 6 },
    { d: 'M -84 0 Q -96 -120 -98 -170 Q -96 -205 -60 -212 Q 0 -196 60 -212 Q 96 -205 98 -170 Q 96 -120 84 0 Z', fill: M_SHIRT, w: 7 },
    { d: 'M -40 -208 Q 0 -170 40 -208', w: 6 },
    { d: 'M -60 -190 L -64 -10 M -20 -186 L -22 -10 M 30 -186 L 30 -10 M 70 -190 L 68 -10 M -60 -2 L -62 68 M -24 -2 L -24 62 M 30 -2 L 30 62 M 66 -2 L 68 68', c: '#ffffff', w: 9 },
    circ(0, -150, 7, '#ffffff', null, 3), circ(0, -100, 7, '#ffffff', null, 3), circ(0, -50, 7, '#ffffff', null, 3),
  ], eleRoot));
  const armsG = WB.mk('g', {}, eleRoot);
  const eleArmL = makeArm(armsG, M_SKIN, M_SHIRT, 44, 32, 26);
  const eleArmR = makeArm(armsG, M_SKIN, M_SHIRT, 44, 32, 26);
  const eleHead = WB.mk('g', {}, eleRoot);
  const eleFace = makeFace(eleHead, {
    id: 'ele', skin: M_SKIN, brow: M_HAIR, blink: 2.3,
    hair: [{ d: 'M -102 -10 Q -112 -132 -10 -138 Q 70 -150 104 -60 Q 110 -36 102 -10 Q 90 -70 50 -84 Q 60 -60 30 -70 Q 0 -80 -30 -66 Q -70 -76 -102 -10 Z', fill: M_HAIR, w: 6 }],
    extra: [{ d: 'M -46 60 Q -24 44 0 54 Q 24 44 46 60 Q 24 66 0 60 Q -24 66 -46 60 Z', fill: M_HAIR, w: 4 }],
  });
  // touca de dormir: some quando o chapéu de festa aparece
  const cap = WB.mk('g', {}, eleHead);
  showAll(build([{ d: 'M -100 -70 Q -60 -150 20 -140 Q 110 -130 150 -40 Q 170 10 190 40 Q 120 -40 96 -70 Q 0 -100 -100 -70 Z', fill: '#60a5fa', w: 6 },
    { d: 'M -104 -66 Q 0 -110 100 -66', c: '#ffffff', w: 14 }, circ(194, 48, 20, '#ffffff', null, 5)], cap));
  WB.effect(t => cap.setAttribute('opacity', (1 - clamp((t - 2.55) / 0.12)).toFixed(3)));
  // chapéu de festa (aparece no "festa" e voa quando ele inventa que vai ao banheiro)
  const hat = WB.mk('g', {}, eleHead);
  showAll(build([{ d: 'M -50 -112 L 14 -250 L 62 -100 Z', fill: '#ec4899', w: 6 }, { d: 'M -30 -150 L 44 -146 M -14 -196 L 30 -194', c: '#facc15', w: 8 },
    circ(14, -258, 18, '#facc15', null, 4)], hat));
  WB.effect(t => {
    const a = t - 2.62, b = t - 17.55;
    const k = a < 0 ? 0 : backOut(clamp(a / 0.35));
    const fly = clamp(b / 0.6);
    hat.setAttribute('opacity', (a < 0 ? 0 : clamp(a / 0.1) * (1 - fly)).toFixed(3));
    hat.setAttribute('transform', `translate(${(fly * 160).toFixed(1)} ${(-fly * 260).toFixed(1)}) rotate(${(fly * 70).toFixed(1)} 14 -150) translate(14 -150) scale(${k.toFixed(3)}) translate(-14 150)`);
  });
  const SH_L = [-95, -185], SH_R = [95, -185];
  const ELE_POSE = {
    rest: { L: { el: [-128, -95], h: [-108, -12] }, R: { el: [128, -95], h: [108, -12] } },
    festa: { L: { el: [-180, -255], h: [-150, -385] }, R: { el: [180, -255], h: [150, -385] } },
    explica: { L: { el: [-128, -95], h: [-108, -12] }, R: { el: [190, -125], h: [255, -225], r: -40 } },
    aponta: { L: { el: [-205, -185], h: [-315, -165], r: 180, pt: 1 }, R: { el: [128, -95], h: [108, -12] } },
    ceu: { L: { el: [-128, -95], h: [-108, -12] }, R: { el: [175, -290], h: [200, -430], r: -90, pt: 1 } },
    coca: { L: { el: [-128, -95], h: [-108, -12] }, R: { el: [205, -265], h: [100, -430], r: -150 } },
  };
  const TL_ELE = [[-9, 'sono'], [-1.9, 'arregalada'], [-1.5, 'euforia'], [-0.6, 'arregalada'], [1.9, 'sorriso', 'festa'], [3.6, 'sorriso'], [4.43, 'pensativa', 'explica'], [5.6, 'leve'],
    [7.13, 'arregalada', 'explica'], [8.45, 'leve'], [9.25, 'sorriso', 'explica'], [10.85, 'euforia', 'ceu'], [11.9, 'euforia', 'festa'],
    [12.9, 'enfado'], [14.77, 'brava', 'aponta'], [15.85, 'pensativa', 'explica'], [16.9, 'estresse', 'coca'], [18.1, 'estresse'],
    [18.4, 'brava', 'aponta'], [19.8, 'enfado'], [20.3, 'confusa']];
  // onde ele está: x, quanto já levantou (0 sentado, 1 em pé), se está andando
  function elePos(t) {
    const stand = ease(clamp((t - 17.6) / 0.5));
    let x = 700, walk = 0;
    if (t > 18.1) { const u = clamp((t - 18.1) / 0.3); x = lerp(700, 790, ease(u)); walk = u < 1 ? 1 : 0; }
    if (t > 19.85) { const u = clamp((t - 19.85) / 0.5); x = lerp(790, 940, ease(u)); walk = u < 1 ? 1 : 0; }
    return { x, stand, walk };
  }
  // tremidas de susto: [quem, início, duração]
  const JOLTS = [['ela', 3.62, 0.5], ['ela', 8.5, 0.45], ['ele', 7.15, 0.4], ['ele', 10.9, 0.4], ['ele', 14.8, 0.45], ['ele', 18.42, 0.45], ['ela', 18.45, 0.35]];
  const jolt = (who, t) => {
    let sx = 0, sy = 0;
    for (const [w, j0, jd] of JOLTS) if (w === who && t > j0 && t < j0 + jd) { const f = 1 - (t - j0) / jd; sx += Math.sin(t * 70) * 8 * f; sy -= Math.abs(Math.sin(t * 20)) * 12 * f; }
    return [sx, sy];
  };

  WB.effect((t) => {
    // ---- ELA ----
    {
      const s = stateAt(TL_ELA, t);
      const op = talking(FALA_ELA, t) ? clamp(envAt(t) * 1.15) : 0;
      const talk = op > 0.05 ? 1 : 0;
      elaFace(t, s, op, 1);
      const [sx, sy] = jolt('ela', t);
      const rot = ELA.rot + s.rot * 0.6 + talk * 1.8 * Math.sin(t * 6.5);
      elaHead.setAttribute('transform', `translate(${r1(ELA.x + sx)} ${r1(ELA.y + sy - talk * 2 * Math.abs(Math.sin(t * 11)))}) rotate(${r1(rot)}) scale(${ELA.s})`);
      // máscara: testa (-82) → olhos (8)
      const mu = ease(clamp((t - 19.55) / 0.45));
      const mup = ease(clamp((t + 0.75) / 0.35));   // começa nos olhos e ela levanta quando ele pula da cama
      mask.setAttribute('transform', `translate(0 ${r1(lerp(lerp(8, -84, mup), 8, mu))})`);
      const P = poseLerp(ELA_POSE[s.pose0], ELA_POSE[s.pose1], s.pu);
      elaArm(ELA_SH, P.el, P.h, P.r, P.pt);
    }
    // ---- ELE ----
    {
      const s = stateAt(TL_ELE, t);
      const op = talking(FALA_ELE, t) ? clamp(envAt(t) * 1.15) : 0;
      const talk = op > 0.05 ? 1 : 0;
      const pos = elePos(t);
      eleFace(t, s, op, -1);
      const [sx, sy] = jolt('ele', t);
      const su = sitU(t);
      const hipY = lerp(lerp(1330, 1380, su), 1328, pos.stand) - pos.walk * Math.abs(Math.sin(t * 16)) * 8;
      const fade = 1 - clamp((t - 20.75) / 0.35);
      eleRoot.setAttribute('opacity', fade.toFixed(3));
      eleRoot.setAttribute('transform', `translate(${r1(lerp(740, pos.x, su) + sx)} ${r1(hipY + sy)}) rotate(${r1(lerp(-80, 0, su) + Math.sin(Math.PI * su) * -8)}) scale(${M_SC})`);
      const rot = s.rot + talk * 2 * Math.sin(t * 6.5) + (s.pose1 === 'festa' ? Math.sin(t * 9) * 5 : 0);
      eleHead.setAttribute('transform', `translate(0 ${r1(-340 + talk * 2 * Math.sin(t * 11))}) rotate(${r1(rot)} 0 100)`);
      // pernas: sentado (coxa encurtada, canela pendurada na frente do colchão) → em pé
      legEls.forEach((L, i) => {
        const side = i ? 1 : -1;
        const ph = Math.sin(t * 16 + i * Math.PI) * pos.walk;
        const hip = [side * 42, 40];
        const knee = [side * lerp(lerp(50, 62, su), 40, pos.stand) + ph * 14, lerp(lerp(90, 58, su), 150, pos.stand)];
        const foot = [side * lerp(lerp(30, 52, su), 42, pos.stand) + ph * 30, lerp(lerp(150, 215, su), 290, pos.stand) - Math.max(0, ph) * 18];
        const d = `M ${hip[0]} ${hip[1]} L ${r1(knee[0])} ${r1(knee[1])} L ${r1(foot[0])} ${r1(foot[1])}`;
        L.out.setAttribute('d', d); L.inn.setAttribute('d', d);
        L.shoe.setAttribute('d', ellipse(r1(foot[0] + side * 10), r1(foot[1] + 14), 34, 16));
      });
      const P0 = ELE_POSE[s.pose0], P1 = ELE_POSE[s.pose1];
      const wave = s.pose1 === 'festa' ? Math.sin(t * 10) * 18 : 0;
      const pl = poseLerp(P0.L, P1.L, s.pu), pr = poseLerp(P0.R, P1.R, s.pu);
      eleArmL(SH_L, pl.el, [pl.h[0] - wave, pl.h[1]], pl.r, pl.pt);
      eleArmR(SH_R, pr.el, [pr.h[0] + wave, pr.h[1]], pr.r, pr.pt);
    }
  });
  // coberta por cima dele deitado: é jogada pra longe quando ele pula da cama
  const cover = WB.mk('g', {}, WB.overlay);
  showAll(build([{ d: 'M 500 1300 Q 520 1236 600 1232 Q 720 1226 800 1236 Q 860 1240 872 1300 L 876 1420 Q 690 1436 500 1420 Z', fill: '#f4a6c4', w: 7 },
    { d: 'M 506 1330 Q 690 1348 872 1330', c: '#ec4899', w: 6 }], cover));
  WB.effect(t => {
    const u = ease(clamp((t + 1.55) / 0.45));
    cover.setAttribute('opacity', (1 - u).toFixed(3));
    cover.setAttribute('transform', `translate(${r1(u * 260)} ${r1(-Math.sin(Math.PI * u) * 160)}) rotate(${r1(u * 25)} 690 1330)`);
  });
  // Zzz dele dormindo na abertura
  [[-2.5, 'Z', 470, 1150, 56], [-2.15, 'z', 505, 1095, 46]].forEach(([bt, z, x, y, sz]) => {
    const it = P(bt, T(z, x, y, sz, INK.blue), { parent: WB.overlay, loop: 'float' });
    WB.effect(t => { if (t > -1.95) it.g.setAttribute('opacity', 0); });
  });
  // Zzz dela no final
  [[20.7, 'Z', 320, 1120, 60], [21.4, 'z', 355, 1060, 50], [22.1, 'Z', 310, 1000, 64], [22.8, 'z', 350, 950, 48], [23.5, 'Z', 315, 900, 58]]
    .forEach(([bt, z, x, y, sz]) => P(bt, T(z, x, y, sz, INK.blue), { parent: WB.overlay, loop: 'rise' }));

  // ================= CENAS (desenhos de cada fala, em cima) =================
  // 0) Abertura: 3h da manhã, ele acorda e pula da cama de pijama (−2,6–0)
  pg(-2.6, 0);
  P(-2.5, T('3h da manhã...', 540, 400, 96, INK.gray));
  P(-2.3, [{ d: 'M 470 520 A 90 90 0 1 0 560 690 A 72 72 0 1 1 470 520 Z', fill: '#fde68a', c: '#facc15', w: 6 }, T('*', 640, 560, 60, '#facc15'), T('*', 400, 700, 46, '#facc15')], { loop: 'float' });
  stamp(-1.9, '!!', 800, 640, 150, INK.red, 8, { loop: 'shake' });
  P(-1.45, T('PULOU DA CAMA!', 540, 900, 90, INK.orange), { anim: 'slam', loop: 'wiggle' });

  // 1) ELA: "Tu vai pra onde?" (0–1,9)
  pg(0, 1.9);
  P(0.5, T('Tu vai pra onde??', 540, 470, 104, INK.purple), { anim: 'slam', loop: 'wiggle' });
  P(0.75, [{ d: 'M 540 560 L 540 930', c: '#8b5a2b', w: 18 },
    { d: 'M 380 600 L 680 600 L 720 650 L 680 700 L 380 700 Z', fill: '#fde68a', w: 7 }, T('festa?', 540, 672, 56, INK.black),
    { d: 'M 700 740 L 400 740 L 360 790 L 400 840 L 700 840 Z', fill: '#bfdbfe', w: 7 }, T('dormir!', 540, 812, 56, INK.black)], { loop: 'wiggle' });
  P(1.0, qmark(210, 760, 1, INK.red), { loop: 'bounce' });
  P(1.15, qmark(880, 720, 0.85, INK.purple), { loop: 'bounce', ph: 0.4 });

  // 2) ELE: "Vou pra uma festa." (1,9–3,6)
  pg(1.9, 3.6);
  P(1.95, confetti(60, 300, 1020, 940, 46, 5), { loop: 'float' });
  P(2.1, discoBall(540, 640, 120), { loop: 'spin' });
  stamp(2.62, 'FESTA!!', 540, 380, 130, INK.purple, -5, { loop: 'shake' });
  P(2.8, T('uhuuul!', 830, 860, 70, INK.orange), { loop: 'bounce' });
  P(2.9, T('tuts tuts', 250, 860, 60, INK.blue), { loop: 'bounce', ph: 0.5 });

  // 3) ELA: "Feeeesta??" (3,6–4,43)
  pg(3.6, 4.43);
  P(3.62, burst(540, 600, 260, '#fef08a', INK.red), { anim: 'slam', loop: 'pulse' });
  stamp(3.65, 'FEEEESTA??', 540, 600, 120, INK.red, -4, { loop: 'tremble' });
  P(3.9, qmark(170, 420, 0.9, INK.red), { anim: 'slam', loop: 'shake' });
  P(4.0, qmark(900, 860, 0.9, INK.purple), { anim: 'slam', loop: 'shake' });

  // 4) ELE: "É... em outra cidade." (4,43–5,58)
  pg(4.43, 5.58);
  P(4.5, T('É...', 540, 360, 96));
  P(4.96, roadSign(540, 560, 'OUTRA CIDADE', 'bem longe...'), { loop: 'wiggle' });
  P(5.2, car(560, 900), { anim: 'fly', fx: -600, loop: 'tremble' });

  // 5) ELA: "Uma hora dessa? Tá ficando doido, é?" (5,58–7,13)
  pg(5.58, 7.13);
  P(5.65, T('UMA HORA DESSA??', 540, 370, 96, INK.red), { anim: 'slam', loop: 'shake' });
  P(5.9, clock(300, 650, 150), { loop: 'tremble' });
  P(6.0, T('3h!', 300, 900, 76, INK.red));
  P(6.42, spiral(780, 620, 140), { loop: 'turn' });
  P(6.7, T('DOIDO?', 780, 880, 90, INK.purple), { anim: 'slam', loop: 'wiggle' });

  // 6) ELE: "Os meninos tá vindo aí." (7,13–8,45)
  pg(7.13, 8.45);
  P(7.2, T('OS MENINOS!', 540, 370, 110, INK.green), { anim: 'slam' });
  P(7.4, partyBoy(260, 620, 0.95, '#f97316', '#22c55e'), { loop: 'hop' });
  P(7.6, partyBoy(540, 600, 0.95, '#3b82f6', '#ec4899'), { loop: 'hop', ph: 0.3 });
  P(7.8, partyBoy(820, 620, 0.95, '#a855f7', '#facc15'), { loop: 'hop', ph: 0.6 });

  // 7) ELA: "Que meninooo?" (8,45–9,23)
  pg(8.45, 9.23);
  stamp(8.5, 'QUE MENINOOO??', 540, 560, 104, INK.purple, 4, { loop: 'tremble' });
  P(8.7, qmark(200, 820, 1, INK.red), { anim: 'slam', loop: 'shake' });
  P(8.8, qmark(880, 360, 0.9, INK.red), { anim: 'slam', loop: 'shake' });

  // 8) ELE: "Os meninos, meus amigos, tá vindo aí, tudo de helicóptero, vai pousar no terreno do lado." (9,23–12,9)
  pg(9.23, 10.85);
  P(9.4, T('meus amigos...', 540, 360, 96, INK.green));
  P(9.6, partyBoy(260, 630, 0.95, '#f97316', '#22c55e'), { loop: 'hop' });
  P(9.75, partyBoy(540, 610, 0.95, '#3b82f6', '#ec4899'), { loop: 'hop', ph: 0.3 });
  P(9.9, partyBoy(820, 630, 0.95, '#a855f7', '#facc15'), { loop: 'hop', ph: 0.6 });
  P(10.3, T('tão vindo aí!', 540, 880, 70, INK.orange), { loop: 'wiggle' });
  pg(10.85, 12.9);
  stamp(10.9, 'DE HELICÓPTERO!!', 540, 360, 92, INK.orange, -4, { loop: 'shake' });
  {
    // terreno do lado com o "H"
    P(11.95, [{ d: 'M 120 905 Q 540 870 960 905', c: '#65a30d', w: 10 }, { d: ellipse(560, 880, 150, 34), fill: '#d9f99d', w: 6 }, T('H', 560, 898, 56, INK.black)]);
    P(12.3, T('terreno do lado', 250, 960, 54, '#65a30d'));
    // o helicóptero entra voando e pousa
    const heli = WB.mk('g', {}, cont);
    const heliIn = WB.mk('g', {}, heli);
    P(10.9, helicopter(560, 620, 1), { parent: heliIn, anim: 'fly', fx: -900, fy: -120 });
    const rot = WB.mk('g', {}, heli);
    showAll(build(rotor(560, 476, 1), rot));
    WB.effect(t => {
      const sc = Math.cos(t * 40);
      rot.setAttribute('opacity', t < 10.9 ? 0 : 1);
      const fx = -900 * (1 - ease(clamp((t - 10.9) / 0.5)));
      rot.setAttribute('transform', `translate(${r1(fx)} 0) translate(560 0) scale(${sc.toFixed(3)} 1) translate(-560 0)`);
      const land = ease(clamp((t - 11.9) / 0.9));
      const hover = (1 - land) * Math.sin(t * 5) * 10;
      heli.setAttribute('transform', `translate(0 ${r1(land * 110 + hover)}) scale(1)`);
    });
    P(11.6, T('vai pousar!', 200, 560, 60, INK.blue), { loop: 'bounce' });
  }

  // 9) ELA: "Tá ficando doido? Tás sonhando, é?" (12,9–14,77)
  pg(12.9, 14.77);
  P(12.95, T('TÁ DOIDO??', 540, 360, 104, INK.red), { anim: 'slam', loop: 'shake' });
  P(13.85, thought(600, 630, 330, 180, [[760, 880, 16], [720, 835, 24]]), { loop: 'float' });
  P(13.95, helicopter(600, 660, 0.55), { loop: 'float' });
  P(14.1, T('Zzz', 820, 600, 64, INK.blue), { loop: 'bounce' });
  P(14.1, T('TÁ SONHANDO!', 330, 900, 66, INK.purple), { anim: 'slam' });

  // 10) ELE: "Quem tá ficando doida é tu!" (14,77–15,85)
  pg(14.77, 15.85);
  stamp(14.8, 'DOIDA É TU!', 540, 430, 120, INK.red, -5, { loop: 'shake' });
  P(15.1, [{ d: 'M 620 600 Q 520 760 330 900', c: INK.red, w: 14 }, { d: WB.arrowHead(330, 900, 2.5, 50), c: INK.red, w: 14 }], { anim: 'slam' });
  P(15.3, spiral(820, 700, 110, INK.red), { loop: 'turn' });

  // 11) ELE: "Escuridão dessa, rapaz, três horas da manhã..." (15,85–17,55)
  pg(15.85, 17.55);
  P(15.9, nightSky(120, 300, 960, 700));
  P(16.1, T('ESCURIDÃO...', 430, 640, 90, '#ffffff'), { loop: 'tremble' });
  P(16.9, clock(820, 830, 100), { anim: 'slam', loop: 'shake' });
  P(17.0, T('3 DA MANHÃ!', 380, 900, 88, INK.red), { anim: 'slam' });

  // 12) ELE: "Vou no banheiro." (17,55–18,4)
  pg(17.55, 18.4);
  P(17.58, T('VOU NO BANHEIRO...', 540, 370, 90, INK.blue), { anim: 'slam' });
  P(17.7, toilet(540, 440, 1.1), { loop: 'wiggle' });
  P(17.95, T('(disfarça)', 540, 930, 56, INK.gray), { loop: 'wiggle' });

  // 13) ELE: "Doida!" (18,4–19,2)
  pg(18.4, 19.2);
  P(18.42, burst(540, 580, 260, '#fecaca', INK.red), { anim: 'slam', loop: 'pulse' });
  stamp(18.44, 'DOIDA!!', 540, 580, 150, INK.red, 5, { loop: 'shake' });

  // 14) ELE: "Vai dormir!" (19,2–20,3)
  pg(19.2, 20.3);
  P(19.25, T('VAI DORMIR!!!', 540, 400, 112, INK.blue), { anim: 'slam', loop: 'shake' });
  P(19.4, [{ d: ellipse(540, 680, 230, 90), fill: '#e0e7ff', w: 8 }, { d: 'M 360 680 Q 540 720 720 680', c: '#a5b4fc', w: 6 }], { loop: 'float' });
  P(19.6, T('Zzz', 820, 600, 80, INK.blue), { loop: 'bounce' });

  // 15) ELE: "Oxi." (20,3–21,1)
  pg(20.3, 21.1);
  stamp(20.36, 'OXI!?', 540, 560, 140, INK.purple, -6, { loop: 'shake' });

  // 16) Chamada para seguir (21,1–fim)
  pg(21.1, 99);
  {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 470, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 560, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@caderno_amarelo', 380, 560 + 190 * 0.62, 84, INK.black, g).strokes);
    animate(g, 21.25, { loop: 'float' });
  }
};
