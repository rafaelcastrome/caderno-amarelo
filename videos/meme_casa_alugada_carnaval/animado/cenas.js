// Meme "pós-Carnaval, devolvendo as casas alugadas" no estilo Caderno Amarelo (formato B, desenho animado).
// Três áudios de WhatsApp: a dona da casa reclama (0–57 s) e a amiga morre de rir (57–92 s).
// A boca de quem fala segue a energia do áudio original (ENV: 20 valores por segundo, 0–9).
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const r1 = n => Math.round(n * 10) / 10;
  const SKIN = '#c68a5f', SKIN3 = '#e8bf9a', HAIR = '#2a1a12', PINK = '#f4a6c4';
  const BROWN = '#7a4a1e', MOUTH = '#6b1f2b', ICE = '#38bdf8', PIG = '#f9a8d4';
  const ellipse = (cx, cy, rx, ry) => WB.arcPath(cx, cy, rx, ry, 0, Math.PI * 2, 48) + ' Z';
  const backOut = u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };

  const ENV = '0000000000310107973456571056871056984104641710506861579746862587766665566200355550006101879405767858850004678878200699100076666663000000000005676047877731577511003625977009910684652577568855667302675672135273028640375767830530474562651692077102655436200000000077049865811766599841375083384485266005460089357130052666700310467860620000014674000056776786990498711100000573003676813740057639405771066793350008980000666777762000000060087513766695000000342865144767069972576669958603635526238405405602276604439946870027969800459989221766306269748500688100000057890099706687341144577612421045675554310000000000000000000000004573674065376052604740233223443435556400000134036302003555533435404556376322022222220321000000010002433334322143343000332223122110000000000000000000000012330154455333203551003770001556546652235335530033002750006435255154233204323544411121000000000000000000000000000000000000000000034332344446532344003203652555400255402211110122221100122223344444565665545530004655754086600885387768775257106723767137700005565243221000000000000000012204645633457623653846884537877315752236766644545663556426878630767857747773226675522200000000000255730000000000000000000000000422577107732030220031125601103200994000221235310008300277101484002560007600085710274610243720243000210001000000000000000000344300000110100000000000018412279511103001899305650000001569600561104300342000000000005710397100697100389410037787765433232222233332323322113322300000000000000000000000000000000000000498744421000999725551420120001100010000000000100001000000001000100000000000000000000000000000000000045520000676008758104650001899886200000000000000000000000000000000599672010001000000000000000000000001000566776104962163233122200200000001000000000000340125410000164387946770079670000798623323322243020131000230001310002330000330001540001465000000000000099999994569874100000000000000000000000000000000000000000000000000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  const FRIEND_T0 = 57.3, FRIEND_T1 = 92.2;

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
      if (loop === 'buzz') { dx += Math.sin(ts * 7) * 30 + Math.sin(ts * 23) * 6; dy += Math.cos(ts * 9) * 18; }
      if (loop === 'pulse') k *= 1 + 0.07 * Math.sin(ts * 9);
      if (loop === 'flicker') sy = 1 + 0.07 * Math.sin(ts * 13) + 0.03 * Math.sin(ts * 29);
      if (loop === 'spin') rot += Math.sin(ts * 9) * 8;
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
  // P(bt, specs, opções): item aparece em bt. opções: anim, loop, ph, fx, fy, rot (giro fixo), at:[x,y,s] (desenho na origem)
  function P(bt, specs, o = {}) {
    let parent = o.parent || cont;
    if (o.rot) parent = WB.mk('g', { transform: `rotate(${o.rot} ${o.rx ?? 540} ${o.ry ?? 700})` }, parent);
    if (o.at) parent = WB.mk('g', { transform: `translate(${o.at[0]} ${o.at[1]}) scale(${o.at[2] || 1})` }, parent);
    const it = build(specs, parent);
    WB.showNow(it.strokes);
    it.fills.forEach(f => f.el.setAttribute('fill-opacity', 1));
    animate(it.g, bt, o);
    return it;
  }
  // texto girado
  const TX = (bt, text, x, y, size, c, rot = 0, o = {}) => P(bt, T(text, x, y, size, c), Object.assign({ rot, rx: x, ry: y - size * 0.3 }, o));

  // ---------------- desenhos ----------------
  const box = (x, y, w, h, r, fill, c, wd) => ({ d: WB.roundRectPath(x, y, w, h, r), fill, c, w: wd || 6 });
  const circ = (x, y, r, fill, c, wd) => ({ d: WB.circlePath(x, y, r), fill, c, w: wd || 6 });
  const S = (x, y, s) => (dx, dy) => `${r1(x + dx * s)} ${r1(y + dy * s)}`;
  function house(x0, y0, x1, y1, wall = '#f6e7c1', roof = '#d9603b') {
    const cx = (x0 + x1) / 2, w = x1 - x0, h = y1 - y0;
    return [
      { d: WB.roughRect(x0, y0, x1, y1), fill: wall, w: 7 },
      { d: `M ${x0 - w * 0.1} ${y0 + 4} L ${cx} ${y0 - h * 0.55} L ${x1 + w * 0.1} ${y0 + 4} Z`, fill: roof, w: 7 },
      box(cx - w * 0.13, y1 - h * 0.54, w * 0.26, h * 0.53, 10, '#8b5a2b'),
      box(x0 + w * 0.1, y0 + h * 0.18, w * 0.24, h * 0.32, 6, '#bfe0f5'),
      box(x1 - w * 0.34, y0 + h * 0.18, w * 0.24, h * 0.32, 6, '#bfe0f5'),
    ];
  }
  function poop(x, y, s = 1, eyes = true) {
    const p = S(x, y, s);
    const out = [{ d: `M ${p(-62, 0)} Q ${p(-74, -30)} ${p(-40, -36)} Q ${p(-48, -66)} ${p(-14, -68)} Q ${p(-16, -100)} ${p(8, -114)} Q ${p(12, -90)} ${p(32, -72)} Q ${p(60, -64)} ${p(48, -36)} Q ${p(78, -30)} ${p(64, 0)} Z`, fill: BROWN, w: 6 }];
    if (eyes) out.push(circ(x - 16 * s, y - 40 * s, 9 * s, '#ffffff', null, 3), circ(x + 16 * s, y - 40 * s, 9 * s, '#ffffff', null, 3),
      circ(x - 14 * s, y - 38 * s, 3.5 * s, '#111', null, 2), circ(x + 18 * s, y - 38 * s, 3.5 * s, '#111', null, 2),
      { d: `M ${p(-14, -18)} Q ${p(0, -6)} ${p(14, -18)}`, w: 4 });
    return out;
  }
  const stink = (x, y, s = 1) => ({ d: `M ${r1(x - 40 * s)} ${y} q ${12 * s} ${-20 * s} 0 ${-40 * s} q ${-12 * s} ${-20 * s} 0 ${-40 * s} M ${r1(x + 40 * s)} ${y} q ${12 * s} ${-20 * s} 0 ${-40 * s} q ${-12 * s} ${-20 * s} 0 ${-40 * s} M ${x} ${r1(y - 20 * s)} q ${12 * s} ${-20 * s} 0 ${-40 * s} q ${-12 * s} ${-20 * s} 0 ${-40 * s}`, c: '#6b8e23', w: 6 });
  const fly = (x, y) => [{ d: ellipse(x - 9, y - 12, 10, 7), fill: '#e0f2fe', w: 3 }, { d: ellipse(x + 9, y - 12, 10, 7), fill: '#e0f2fe', w: 3 }, circ(x, y, 9, '#111', null, 3)];
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
  function partyBoy(x, y, s, shirt, hatC) {
    const p = S(x, y, s);
    return [
      { d: `M ${p(-18, 150)} L ${p(-30, 235)} M ${p(18, 150)} L ${p(32, 235)}`, w: 9 },
      { d: `M ${p(-38, 78)} L ${p(-96, 0)} M ${p(38, 78)} L ${p(96, 0)}`, w: 9 },
      box(x - 42 * s, y + 48 * s, 84 * s, 108 * s, 20 * s, shirt),
      circ(x, y, 50 * s, '#d9a074'),
      { d: `M ${p(-36, -30)} L ${p(0, -130)} L ${p(36, -30)} Z`, fill: hatC, w: 5 },
      circ(x, y - 134 * s, 14 * s, '#ffd23f', null, 4),
      { d: `M ${p(-26, -2)} Q ${p(-17, -14)} ${p(-8, -2)} M ${p(8, -2)} Q ${p(17, -14)} ${p(26, -2)}`, w: 5 },
      { d: `M ${p(-26, 16)} Q ${p(0, 52)} ${p(26, 16)} Z`, fill: '#ffffff', w: 5 },
    ];
  }
  function sign(x, y, l1, l2, c = INK.red) {
    const w = Math.max(WB.measure(l1, 64), l2 ? WB.measure(l2, 52) : 0) + 70, h = l2 ? 150 : 100;
    return [{ d: `M ${x - w / 2 + 30} ${y - h / 2 - 70} L ${x} ${y - h / 2 - 110} L ${x + w / 2 - 30} ${y - h / 2 - 70}`, c: '#6b7280', w: 5 },
      { d: WB.roughRect(x - w / 2, y - h / 2, x + w / 2, y + h / 2), fill: '#fff7d6', c, w: 8 },
      T(l1, x, y + (l2 ? -10 : 22), 64, c), l2 ? T(l2, x, y + 52, 52, INK.purple) : null];
  }
  function sofa(x, y, w = 620) {
    const x0 = x - w / 2;
    return [
      { d: `M ${x0 + 30} ${y + 110} L ${x0 + 20} ${y + 150} M ${x0 + w - 30} ${y + 110} L ${x0 + w - 20} ${y + 150}`, w: 9 },
      box(x0 + 20, y - 150, w - 40, 170, 36, '#5aa9e6'),
      box(x0 + 10, y - 10, w - 20, 120, 22, '#5aa9e6'),
      { d: `M ${x} ${y - 4} L ${x} ${y + 100}`, w: 5 },
      box(x0 - 40, y - 70, 90, 190, 36, '#3d8fd1'), box(x0 + w - 50, y - 70, 90, 190, 36, '#3d8fd1'),
    ];
  }
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
  function towel(x, y) {
    return [box(x - 130, y - 170, 260, 340, 14, '#7cc8f2'),
      { d: `M ${x - 130} ${y + 110} L ${x + 130} ${y + 110} M ${x - 130} ${y + 130} L ${x + 130} ${y + 130}`, c: '#ffffff', w: 10 },
      { d: `M ${x - 110} ${y + 172} l 0 22 M ${x - 70} ${y + 172} l 0 22 M ${x - 30} ${y + 172} l 0 22 M ${x + 10} ${y + 172} l 0 22 M ${x + 50} ${y + 172} l 0 22 M ${x + 90} ${y + 172} l 0 22`, w: 5 },
      { d: `M ${x - 40} ${y - 30} Q ${x - 10} ${y - 90} ${x + 30} ${y - 40} Q ${x + 80} ${y - 10} ${x + 40} ${y + 40} Q ${x} ${y + 70} ${x - 30} ${y + 30} Q ${x - 70} ${y + 10} ${x - 40} ${y - 30} Z`, fill: BROWN, c: '#5a3412', w: 4 }];
  }
  function shirt(x, y, color = '#16a34a', smear = true) {
    const out = [{ d: `M ${x - 70} ${y - 150} L ${x - 160} ${y - 100} L ${x - 124} ${y - 30} L ${x - 92} ${y - 52} L ${x - 92} ${y + 150} L ${x + 92} ${y + 150} L ${x + 92} ${y - 52} L ${x + 124} ${y - 30} L ${x + 160} ${y - 100} L ${x + 70} ${y - 150} Q ${x} ${y - 100} ${x - 70} ${y - 150} Z`, fill: color, w: 7 },
      T('10', x, y + 40, 110, '#ffffff')];
    if (smear) out.push({ d: `M ${x - 70} ${y + 70} Q ${x - 20} ${y + 40} ${x + 30} ${y + 80} Q ${x + 70} ${y + 110} ${x + 20} ${y + 130} Q ${x - 40} ${y + 140} ${x - 70} ${y + 70} Z`, fill: BROWN, c: '#5a3412', w: 4 });
    return out;
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
  function tornado(x, y, s = 1) {
    const out = [];
    for (let i = 0; i < 6; i++) out.push({ d: ellipse(x + (i % 2 ? 18 : -14) * (i / 3) * s, y + i * 52 * s, (180 - i * 28) * s, (28 - i * 2) * s), c: '#6b7280', w: 8 });
    out.push(box(x + 150 * s, y - 40 * s, 40, 40, 4, '#ffd23f', null, 4), { d: `M ${x - 230 * s} ${y + 160 * s} L ${x - 190 * s} ${y + 130 * s} L ${x - 176 * s} ${y + 174 * s} Z`, fill: '#60a5fa', w: 4 });
    out.push({ d: `M ${x + 160 * s} ${y + 140 * s} Q ${x + 190 * s} ${y + 100 * s} ${x + 220 * s} ${y + 150 * s} Q ${x + 190 * s} ${y + 130 * s} ${x + 160 * s} ${y + 140 * s} Z`, fill: '#facc15', w: 4 });
    return out;
  }
  function bucket(x, y) {
    return [
      { d: `M ${x + 30} ${y - 40} L ${x + 230} ${y - 420}`, c: '#8b5a2b', w: 16 },
      { d: `M ${x - 110} ${y - 90} L ${x + 110} ${y - 90} L ${x + 85} ${y + 120} L ${x - 85} ${y + 120} Z`, fill: '#4f86d9', w: 7 },
      { d: `M ${x - 110} ${y - 90} Q ${x} ${y - 230} ${x + 110} ${y - 90}`, w: 5 },
      circ(x - 70, y - 100, 30, '#ffffff', null, 4), circ(x - 20, y - 112, 36, '#ffffff', null, 4), circ(x + 40, y - 104, 30, '#ffffff', null, 4), circ(x + 84, y - 96, 22, '#ffffff', null, 4),
      circ(x - 130, y - 200, 18, null, '#60a5fa', 4), circ(x - 160, y - 260, 12, null, '#60a5fa', 4), circ(x + 150, y - 170, 14, null, '#60a5fa', 4),
    ];
  }
  function trashCan(x, y) {
    return [
      { d: `M ${x - 150} ${y - 160} L ${x + 150} ${y - 160} L ${x + 120} ${y + 220} L ${x - 120} ${y + 220} Z`, fill: '#9ca3af', w: 7 },
      { d: `M ${x - 70} ${y - 120} L ${x - 60} ${y + 190} M ${x} ${y - 120} L ${x} ${y + 190} M ${x + 70} ${y - 120} L ${x + 60} ${y + 190}`, c: '#6b7280', w: 6 },
      box(x - 170, y - 190, 340, 40, 14, '#6b7280'), T('LIXO', x, y + 70, 70, '#ffffff'),
    ];
  }
  function calendar(x, y) {
    return [box(x - 220, y - 210, 440, 420, 24, '#ffffff', null, 8), box(x - 220, y - 210, 440, 110, 24, INK.red, null, 8),
      { d: `M ${x - 120} ${y - 240} L ${x - 120} ${y - 180} M ${x + 120} ${y - 240} L ${x + 120} ${y - 180}`, w: 14 },
      T('FEVEREIRO', x, y - 132, 60, '#ffffff'), T('CARNAVAL', x, y + 40, 92, INK.purple), T('ano retrasado', x, y + 140, 56, INK.gray)];
  }
  function mask(x, y, s = 1) {
    const p = S(x, y, s);
    return [
      { d: `M ${p(-150, -40)} Q ${p(-180, -160)} ${p(-120, -190)} M ${p(-120, -40)} Q ${p(-110, -170)} ${p(-60, -200)} M ${p(150, -40)} Q ${p(190, -150)} ${p(140, -190)}`, c: '#22c55e', w: 10 },
      { d: `M ${p(-170, -40)} Q ${p(-90, -80)} ${p(0, -30)} Q ${p(90, -80)} ${p(170, -40)} Q ${p(170, 60)} ${p(80, 60)} Q ${p(20, 60)} ${p(0, 20)} Q ${p(-20, 60)} ${p(-80, 60)} Q ${p(-170, 60)} ${p(-170, -40)} Z`, fill: '#a855f7', w: 7 },
      { d: ellipse(x - 80 * s, y, 42 * s, 24 * s), fill: '#ffffff', w: 5 }, { d: ellipse(x + 80 * s, y, 42 * s, 24 * s), fill: '#ffffff', w: 5 },
      circ(x - 130 * s, y + 40 * s, 8 * s, '#ffd23f', null, 3), circ(x + 130 * s, y + 40 * s, 8 * s, '#ffd23f', null, 3), circ(x, y - 10 * s, 9 * s, '#ffd23f', null, 3),
    ];
  }
  function key(x, y) {
    return [circ(x - 60, y, 44, '#facc15', null, 7), circ(x - 60, y, 14, '#fffdf5', null, 5),
      { d: `M ${x - 16} ${y} L ${x + 120} ${y} M ${x + 80} ${y} L ${x + 80} ${y + 34} M ${x + 110} ${y} L ${x + 110} ${y + 26}`, c: '#a16207', w: 14 }];
  }
  function bag(x, y, s = 1) {
    const p = S(x, y, s);
    return [
      ...poop(x, y - 52 * s, 0.55 * s, false),
      { d: `M ${p(-60, -70)} Q ${p(-56, -150)} ${p(-20, -70)} M ${p(20, -70)} Q ${p(56, -150)} ${p(60, -70)}`, w: 7 },
      { d: `M ${p(-80, -70)} L ${p(80, -70)} L ${p(98, 100)} Q ${p(0, 124)} ${p(-98, 100)} Z`, fill: '#f8fafc', w: 7 },
      { d: `M ${p(-50, -30)} L ${p(-40, 60)} M ${p(30, -20)} L ${p(40, 70)}`, c: '#cbd5e1', w: 5 },
      { d: ellipse(x, y + 40 * s, 52 * s, 34 * s), fill: '#a0703f', c: 'none' },
    ];
  }
  function freezer(x, y) {
    const shelf = yy => ({ d: `M ${x - 150} ${yy} L ${x + 150} ${yy}`, c: '#93c5fd', w: 6 });
    const mini = (bx, by) => [{ d: `M ${bx - 40} ${by} L ${bx + 40} ${by} L ${bx + 48} ${by + 70} L ${bx - 48} ${by + 70} Z`, fill: '#f8fafc', w: 5 },
      { d: ellipse(bx, by + 44, 28, 18), fill: '#a0703f', c: 'none' }, { d: `M ${bx - 14} ${by} q 14 -26 28 0`, w: 5 }];
    return [
      box(x - 190, y - 290, 380, 580, 22, '#e0f2fe', null, 8), box(x - 160, y - 260, 320, 520, 12, '#ffffff', '#93c5fd', 6),
      shelf(y - 90), shelf(y + 90),
      mini(x - 70, y - 190), mini(x + 60, y - 190), mini(x - 70, y - 10), mini(x + 70, y - 10), mini(x, y + 160),
      { d: `M ${x + 190} ${y - 290} L ${x + 330} ${y - 340} L ${x + 330} ${y + 320} L ${x + 190} ${y + 290} Z`, fill: '#bae6fd', w: 7 },
      { d: `M ${x + 300} ${y - 60} L ${x + 300} ${y + 60}`, w: 12 },
      T('*', x - 240, y - 200, 90, ICE), T('*', x + 400, y - 120, 70, ICE), T('*', x - 260, y + 120, 60, ICE), T('*', x + 390, y + 200, 90, ICE),
    ];
  }
  function person(x, y, skin, hair, top = '#cbd5e1', happy = true) {
    return [
      { d: `M ${x - 110} ${y + 200} Q ${x - 100} ${y + 80} ${x} ${y + 76} Q ${x + 100} ${y + 80} ${x + 110} ${y + 200}`, fill: top, w: 6 },
      { d: ellipse(x, y - 10, 92, 96), fill: hair, w: 5 },
      circ(x, y, 72, skin),
      { d: `M ${x - 72} ${y - 6} Q ${x - 70} ${y - 82} ${x} ${y - 80} Q ${x + 70} ${y - 82} ${x + 72} ${y - 6} Q ${x} ${y - 50} ${x - 72} ${y - 6} Z`, fill: hair, w: 5 },
      { d: ellipse(x - 26, y + 6, 17, 14), fill: '#ffffff', w: 4 }, { d: ellipse(x + 26, y + 6, 17, 14), fill: '#ffffff', w: 4 },
      circ(x - 22, y + 8, 6, '#111', null, 2), circ(x + 30, y + 8, 6, '#111', null, 2),
      happy ? { d: `M ${x - 26} ${y + 36} Q ${x} ${y + 62} ${x + 26} ${y + 36} Z`, fill: '#ffffff', w: 4 } : { d: `M ${x - 14} ${y + 44} Q ${x} ${y + 36} ${x + 14} ${y + 44}`, w: 4 },
    ];
  }
  function thought(cx, cy, rx, ry, dots) {
    return [...dots.map(([x, y, r]) => circ(x, y, r, '#ffffff', null, 5)), { d: WB.cloudPath(cx, cy, rx, ry), fill: '#ffffff', w: 7 }];
  }
  function steak(x, y) {
    return [
      { d: `M ${x - 150} ${y - 20} Q ${x - 160} ${y - 110} ${x - 40} ${y - 110} Q ${x + 60} ${y - 120} ${x + 130} ${y - 60} Q ${x + 180} ${y + 10} ${x + 110} ${y + 70} Q ${x} ${y + 120} ${x - 90} ${y + 80} Q ${x - 150} ${y + 50} ${x - 150} ${y - 20} Z`, fill: '#dc2626', w: 7 },
      { d: `M ${x - 110} ${y - 20} Q ${x - 100} ${y - 80} ${x - 20} ${y - 80} Q ${x + 70} ${y - 80} ${x + 110} ${y - 30}`, c: '#fecaca', w: 9 },
      circ(x + 20, y + 10, 26, '#fff7ed', null, 6),
      { d: `M ${x - 210} ${y - 140} q 10 -24 0 -48 M ${x + 200} ${y - 140} q 10 -24 0 -48`, c: '#9ca3af', w: 6 },
    ];
  }
  function frozenPoop(x, y) {
    return [
      ...poop(x, y + 130, 2.5, true),
      { d: WB.roundRectPath(x - 210, y - 180, 420, 330, 30), fill: null, c: ICE, w: 12 },
      { d: `M ${x - 170} ${y - 140} L ${x - 110} ${y - 140} M ${x - 170} ${y - 140} L ${x - 170} ${y - 80} M ${x + 150} ${y + 100} L ${x + 120} ${y + 120}`, c: '#e0f2fe', w: 10 },
      { d: `M ${x - 160} ${y + 150} L ${x - 140} ${y + 220} L ${x - 120} ${y + 150} M ${x - 40} ${y + 150} L ${x - 20} ${y + 250} L ${x} ${y + 150} M ${x + 90} ${y + 150} L ${x + 110} ${y + 210} L ${x + 130} ${y + 150}`, fill: '#e0f2fe', c: ICE, w: 6 },
      T('*', x + 260, y - 150, 90, ICE), T('*', x - 270, y - 60, 70, ICE),
    ];
  }
  function pig(x, y, s = 1, extras = false) {
    const p = S(x, y, s);
    const out = [
      { d: `M ${p(140, -30)} q 40 -10 30 -40 q -10 -24 -30 -6 q -14 20 16 26`, w: 6 },
      { d: `M ${p(-90, 70)} L ${p(-96, 140)} M ${p(-40, 86)} L ${p(-40, 150)} M ${p(50, 86)} L ${p(52, 150)} M ${p(100, 66)} L ${p(108, 140)}`, w: 14 },
      { d: ellipse(x + 10 * s, y, 150 * s, 104 * s), fill: PIG, w: 7 },
      { d: ellipse(x + 60 * s, y + 30 * s, 40 * s, 26 * s), fill: '#a0703f', c: 'none' }, { d: ellipse(x - 30 * s, y + 60 * s, 26 * s, 16 * s), fill: '#a0703f', c: 'none' },
      { d: `M ${p(-170, -110)} L ${p(-150, -170)} L ${p(-110, -120)} Z M ${p(-90, -120)} L ${p(-60, -170)} L ${p(-44, -110)} Z`, fill: PIG, w: 6 },
      circ(x - 110 * s, y - 50 * s, 84 * s, PIG),
      { d: ellipse(x - 180 * s, y - 30 * s, 36 * s, 28 * s), fill: '#f472b6', w: 6 },
      circ(x - 192 * s, y - 32 * s, 6 * s, '#111', null, 2), circ(x - 168 * s, y - 32 * s, 6 * s, '#111', null, 2),
      { d: `M ${p(-140, -90)} Q ${p(-126, -102)} ${p(-112, -90)} M ${p(-90, -90)} Q ${p(-76, -102)} ${p(-62, -90)}`, w: 6 },
      { d: `M ${p(-150, 6)} Q ${p(-120, 30)} ${p(-90, 6)} Z`, fill: '#ffffff', w: 4 },
    ];
    if (extras) out.push({ d: `M ${p(-160, -126)} L ${p(-110, -250)} L ${p(-60, -126)} Z`, fill: '#a855f7', w: 6 }, circ(x - 110 * s, y - 256 * s, 16 * s, '#ffd23f', null, 4),
      { d: `M ${p(-150, -134)} L ${p(-70, -134)}`, c: '#ffd23f', w: 6 });
    return out;
  }
  function laughFace(x, y, r) {
    return [circ(x, y, r, '#ffd23f', null, 7),
      { d: `M ${x - r * 0.62} ${y - r * 0.12} Q ${x - r * 0.38} ${y - r * 0.48} ${x - r * 0.14} ${y - r * 0.12} M ${x + r * 0.14} ${y - r * 0.12} Q ${x + r * 0.38} ${y - r * 0.48} ${x + r * 0.62} ${y - r * 0.12}`, w: 7 },
      { d: `M ${x - r * 0.55} ${y + r * 0.12} Q ${x} ${y + r * 0.95} ${x + r * 0.55} ${y + r * 0.12} Z`, fill: MOUTH, w: 6 },
      { d: `M ${x - r * 0.75} ${y} q -16 24 0 40 q 16 -16 0 -40 Z M ${x + r * 0.75} ${y} q -16 24 0 40 q 16 -16 0 -40 Z`, fill: '#60a5fa', c: '#2563eb', w: 3 }];
  }
  function clock(x, y, r) {
    let ticks = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ticks += `M ${r1(x + Math.cos(a) * r * 0.82)} ${r1(y + Math.sin(a) * r * 0.82)} L ${r1(x + Math.cos(a) * r * 0.92)} ${r1(y + Math.sin(a) * r * 0.92)} `;
    }
    return [circ(x, y, r, '#ffffff', null, 9), { d: ticks, w: 6 }, { d: `M ${x} ${y} L ${x + r * 0.45} ${y + r * 0.2}`, w: 11 }, { d: `M ${x} ${y} L ${x} ${y - r * 0.72}`, w: 7 }, circ(x, y, 9, '#111', null, 3)];
  }
  function microwave(x, y) {
    return [box(x - 230, y - 160, 460, 320, 26, '#e5e7eb', null, 8), box(x - 200, y - 128, 290, 256, 14, '#fde68a', null, 6),
      box(x + 112, y - 118, 92, 54, 8, '#111827', null, 4), T('DESC', x + 158, y - 78, 34, '#4ade80'),
      circ(x + 135, y - 10, 14, '#9ca3af', null, 4), circ(x + 180, y - 10, 14, '#9ca3af', null, 4), circ(x + 135, y + 40, 14, '#9ca3af', null, 4), circ(x + 180, y + 40, 14, '#9ca3af', null, 4),
      box(x + 120, y + 78, 76, 30, 8, '#4ade80', null, 4),
      { d: `M ${x - 175} ${y + 98} L ${x + 65} ${y + 98}`, c: '#9ca3af', w: 10 },
      { d: `M ${x - 120} ${y - 200} q 14 -22 0 -44 q -14 -22 0 -44 M ${x - 40} ${y - 196} q 14 -22 0 -44 q -14 -22 0 -44 M ${x + 40} ${y - 200} q 14 -22 0 -44 q -14 -22 0 -44`, c: '#9ca3af', w: 6 }];
  }

  // ---------------- dona da casa (camada fixa) ----------------
  const girl = (() => {
    const root = WB.mk('g', { transform: 'translate(540 1300)' }, WB.overlay);
    const backG = WB.mk('g', {}, root), bodyG = WB.mk('g', {}, root), headG = WB.mk('g', {}, root), armG = WB.mk('g', {}, root);
    const back = build([{ d: 'M -122 -5 Q -140 -150 0 -150 Q 140 -150 124 -5 Q 132 110 100 190 L -100 190 Q -132 110 -122 -5 Z', fill: HAIR, w: 6 }], backG);
    const body = build([
      { d: 'M -28 90 L -26 185 L 26 185 L 28 90 Z', fill: SKIN, w: 6 },
      { d: 'M -190 430 Q -185 215 -60 180 Q 0 200 60 180 Q 185 215 190 430 Z', fill: SKIN, w: 7 },
      { d: 'M -128 430 Q -126 290 -92 262 Q 0 300 92 262 Q 126 290 128 430 Z', fill: PINK, w: 6 },
      { d: 'M -100 268 L -84 186', c: '#e58bb0', w: 11 }, { d: 'M 100 268 L 84 186', c: '#e58bb0', w: 11 },
    ], bodyG);
    const head = build([
      { d: ellipse(-98, 12, 15, 24), fill: SKIN, w: 5 }, { d: ellipse(98, 12, 15, 24), fill: SKIN, w: 5 },
      { d: ellipse(0, 0, 100, 118), fill: SKIN, w: 7 },
      { d: ellipse(-38, 8, 21, 15), fill: '#ffffff', w: 5 }, { d: ellipse(38, 8, 21, 15), fill: '#ffffff', w: 5 },
      { d: 'M -4 26 Q -14 46 0 50 Q 9 51 12 46', w: 5, c: '#5a3a22' },
      { d: 'M -102 -5 Q -110 -128 5 -132 Q 112 -128 104 -15 Q 72 -88 -12 -74 Q -66 -64 -102 -5 Z', fill: HAIR, w: 6 },
      { d: 'M 62 -96 Q 124 -20 98 100 Q 84 40 58 -30 Z', fill: HAIR, w: 5 },
    ], headG);
    for (const p of [body, back, head]) { WB.showNow(p.strokes); p.fills.forEach(f => f.el.setAttribute('fill-opacity', 1)); }
    const dyn = WB.mk('g', {}, headG);
    const eyes = [-38, 38].map((ex, i) => {
      const cp = WB.mk('clipPath', { id: `eye${i}c` }, dyn);
      WB.mk('path', { d: ellipse(ex, 8, 20, 14) }, cp);
      const clip = `url(#eye${i}c)`;
      return {
        ex,
        pupil: WB.mk('circle', { cx: ex, cy: 8, r: 9, fill: '#1f1410', 'clip-path': clip }, dyn),
        lid: WB.mk('rect', { x: ex - 24, y: -12, width: 48, height: 0, fill: SKIN, 'clip-path': clip }, dyn),
        lidLine: WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': 5, 'stroke-linecap': 'round', 'clip-path': clip }, dyn),
        brow: WB.mk('path', { d: '', fill: 'none', stroke: HAIR, 'stroke-width': 10, 'stroke-linecap': 'round' }, dyn),
      };
    });
    const mouth = WB.mk('path', { d: '', fill: MOUTH, stroke: INK.black, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, dyn);
    const green = WB.mk('g', { opacity: 0 }, dyn);   // cara verde de nojo
    WB.mk('path', { d: 'M -70 30 Q -40 20 -20 40 M 20 40 Q 40 20 70 30', fill: 'none', stroke: '#65a30d', 'stroke-width': 6, 'stroke-linecap': 'round' }, green);
    WB.mk('ellipse', { cx: -62, cy: 44, rx: 22, ry: 12, fill: '#84cc16', opacity: 0.55 }, green);
    WB.mk('ellipse', { cx: 62, cy: 44, rx: 22, ry: 12, fill: '#84cc16', opacity: 0.55 }, green);
    const sweat = WB.mk('path', { d: 'M 86 -60 q -14 24 0 36 q 14 -12 0 -36 Z', fill: '#93c5fd', stroke: INK.black, 'stroke-width': 4, opacity: 0 }, dyn);
    // braço + mão: sai do ombro direito (140, 245)
    const armOut = WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': 56, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, armG);
    const armIn = WB.mk('path', { d: '', fill: 'none', stroke: SKIN, 'stroke-width': 44, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, armG);
    const handG = WB.mk('g', {}, armG);
    const finger = WB.mk('path', { d: 'M 20 -16 Q 80 -30 108 -24 Q 118 -12 106 -4 Q 70 -2 28 8 Z', fill: SKIN, stroke: INK.black, 'stroke-width': 5, opacity: 0 }, handG);
    WB.mk('path', { d: 'M -36 30 Q -46 -16 -26 -46 Q 0 -62 26 -46 Q 46 -16 36 30 Q 0 48 -36 30 Z', fill: SKIN, stroke: INK.black, 'stroke-width': 5 }, handG);
    WB.mk('path', { d: 'M -14 -42 L -12 -12 M 4 -46 L 4 -14 M 20 -40 L 18 -12', stroke: '#7a4f30', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, handG);
    return { root, backG, headG, armG, dyn, eyes, mouth, green, sweat, armOut, armIn, handG, finger };
  })();

  const MOODS = {
    lado: { lid: 0.15, px: 9, py: 1, bi: 0, bo: 0, smile: 0, rot: 4 },
    leve: { lid: 0.3, px: 3, py: 1, bi: 2, bo: 0, smile: -1, rot: 0 },
    enfado: { lid: 0.5, px: 7, py: 2, bi: 3, bo: 2, smile: -3, rot: -6 },
    sorriso: { lid: 0.35, px: 4, py: 0, bi: -4, bo: -2, smile: 11, rot: -5 },
    seria: { lid: 0.25, px: 0, py: 0, bi: 6, bo: -1, smile: -4, rot: 0 },
    arregalada: { lid: 0, px: 0, py: -1, bi: -13, bo: -10, smile: -1, rot: 3 },
    pensativa: { lid: 0.05, px: 8, py: -9, bi: -9, bo: -4, smile: -2, rot: 8 },
    estresse: { lid: 0.55, px: 0, py: 5, bi: -9, bo: 4, smile: -7, rot: -9, sweat: 1 },
    revira: { lid: 0.1, px: 5, py: -12, bi: -6, bo: -6, smile: -4, rot: 7 },
    brava: { lid: 0.28, px: 0, py: 0, bi: 12, bo: -4, smile: -9, rot: 0 },
    ouch: { lid: 0.7, px: 0, py: 0, bi: 9, bo: -2, smile: -12, rot: -7, green: 1 },
    confusa: { lid: 0.1, px: 7, py: -5, bi: -9, bo: -2, smile: -4, rot: 9, asym: 1 },
    nojo: { lid: 0.45, px: -7, py: 3, bi: 10, bo: 3, smile: -11, rot: -10, asym: -0.6, green: 1 },
  };
  // [início, humor, mão, aceno]
  const TL = [
    [0, 'lado'], [1.0, 'enfado'], [1.8, 'arregalada'], [3.0, 'seria'], [4.5, 'arregalada', 'testa'], [7.0, 'estresse', 'testa'],
    [8.2, 'nojo'], [10.2, 'nojo'], [11.4, 'ouch'], [13.0, 'brava'], [13.8, 'brava', 'aponta'], [15.0, 'brava', null, 1],
    [16.8, 'estresse'], [19.4, 'estresse', 'testa'], [21.6, 'confusa'], [22.4, 'enfado'], [24.9, 'nojo'], [27.7, 'brava', 'aponta'],
    [29.6, 'brava', null, 1], [30.8, 'seria'], [33.9, 'sorriso'], [35.6, 'leve'], [38.6, 'arregalada'], [40.4, 'nojo'],
    [42.1, 'arregalada', 'testa'], [44.6, 'pensativa', 'queixo'], [48.8, 'sorriso'], [52.3, 'arregalada'], [53.95, 'ouch', 'testa'],
    [55.0, 'seria', null, 1], [57.3, 'confusa'], [59.0, 'enfado'], [61.2, 'revira'], [66.2, 'enfado', 'queixo'], [69.5, 'revira'],
    [72.5, 'enfado', 'queixo'], [76.0, 'revira'], [79.5, 'estresse', 'testa'], [84.3, 'nojo'], [87.9, 'ouch'], [89.4, 'sorriso'],
  ];
  const HAND = { none: { x: 165, y: 400, r: 0, ex: 165, ey: 330 }, queixo: { x: 42, y: 152, r: -12, ex: 178, ey: 345 }, testa: { x: 112, y: -58, r: -28, ex: 222, ey: 165 }, aponta: { x: 262, y: 40, r: -8, ex: 225, ey: 255 } };
  const keys = ['lid', 'px', 'py', 'bi', 'bo', 'smile', 'rot', 'asym', 'green', 'sweat'];
  function stateAt(t) {
    let i = 0;
    while (i + 1 < TL.length && TL[i + 1][0] <= t) i++;
    const cur = TL[i], prev = TL[Math.max(0, i - 1)];
    const u = i === 0 ? 1 : ease(clamp((t - cur[0]) / 0.3));
    const m0 = MOODS[prev[1]], m1 = MOODS[cur[1]], s = {};
    for (const k of keys) s[k] = lerp(m0[k] || 0, m1[k] || 0, u);
    const h0 = HAND[prev[2] || 'none'], h1 = HAND[cur[2] || 'none'], hu = i === 0 ? 1 : ease(clamp((t - cur[0]) / 0.4));
    s.hand = { x: lerp(h0.x, h1.x, hu), y: lerp(h0.y, h1.y, hu), r: lerp(h0.r, h1.r, hu), ex: lerp(h0.ex, h1.ex, hu), ey: lerp(h0.ey, h1.ey, hu) };
    s.point = (prev[2] === 'aponta' ? 1 - hu : 0) + (cur[2] === 'aponta' ? hu : 0);
    s.handOn = (prev[2] ? 1 - hu : 0) + (cur[2] ? hu : 0);
    s.nod = cur[3] ? Math.abs(Math.sin((t - cur[0]) * 7)) * 10 * clamp((t - cur[0]) / 0.2) : 0;
    return s;
  }
  function blink(t) {
    let v = 0;
    for (let k = 0; k < 32; k++) {
      const tb = 1.6 + k * 3.1 + 0.7 * Math.sin(k * 1.7), d = Math.abs(t - tb);
      if (d < 0.09) v = Math.max(v, 1 - d / 0.09);
    }
    return v;
  }
  document.getElementById('hand').style.display = 'none';
  // tremidas de susto: [início, duração]
  const JOLTS = [[4.64, 0.6], [7.24, 0.5], [13.86, 0.4], [28.08, 0.6], [42.26, 0.6], [53.98, 0.8], [87.98, 0.7]];
  WB.effect((t) => {
    const s = stateAt(t);
    const op = t < FRIEND_T0 ? clamp(envAt(t) * 1.15) : 0, talk = op > 0.05 ? 1 : 0;
    const lid = Math.max(s.lid, blink(t));
    girl.eyes.forEach((e, i) => {
      const px = e.ex + s.px, py = 8 + s.py;
      e.pupil.setAttribute('cx', px.toFixed(1)); e.pupil.setAttribute('cy', py.toFixed(1));
      const h = lid * 32, yl = -10 + h;
      e.lid.setAttribute('height', h.toFixed(1));
      e.lidLine.setAttribute('d', lid > 0.06 ? `M ${e.ex - 24} ${yl.toFixed(1)} Q ${e.ex} ${(yl + 3).toFixed(1)} ${e.ex + 24} ${yl.toFixed(1)}` : '');
      const side = i === 0 ? -1 : 1, bi = s.bi + (i === 1 ? s.asym * 14 : 0);
      const ox = e.ex + side * 26, ix = e.ex - side * 24, oy = -24 + s.bo, iy = -26 + bi;
      e.brow.setAttribute('d', `M ${ox} ${oy.toFixed(1)} Q ${e.ex} ${(Math.min(oy, iy) - 7).toFixed(1)} ${ix} ${iy.toFixed(1)}`);
    });
    const sm = s.smile;
    if (op < 0.06) {
      girl.mouth.setAttribute('fill', 'none');
      girl.mouth.setAttribute('d', `M -26 74 Q 0 ${(74 + sm * 1.6).toFixed(1)} 26 74`);
    } else {
      const rx = 26 - 4 * op, top = 74 - 4 - 6 * op + Math.max(0, sm) * 0.3, bot = 74 + 6 + 30 * op + Math.max(0, sm) * 0.6;
      girl.mouth.setAttribute('fill', MOUTH);
      girl.mouth.setAttribute('d', `M ${-rx} 74 Q 0 ${(2 * top - 74).toFixed(1)} ${rx} 74 Q 0 ${(2 * bot - 74).toFixed(1)} ${-rx} 74 Z`);
    }
    girl.green.setAttribute('opacity', s.green.toFixed(2));
    girl.sweat.setAttribute('opacity', s.sweat.toFixed(2));
    girl.sweat.setAttribute('transform', `translate(0 ${((t * 30) % 40).toFixed(1)})`);
    const rot = s.rot + talk * 1.8 * Math.sin(t * 6.5);
    const dy = s.nod + talk * 2 * Math.sin(t * 11);
    const tr = `translate(0 ${dy.toFixed(1)}) rotate(${rot.toFixed(2)} 0 100)`;
    girl.headG.setAttribute('transform', tr); girl.backG.setAttribute('transform', tr);
    let sx = 0, sy = 0;
    for (const [j0, jd] of JOLTS) if (t > j0 && t < j0 + jd) { const f = 1 - (t - j0) / jd; sx += Math.sin(t * 70) * 10 * f; sy -= Math.abs(Math.sin(t * 20)) * 14 * f; }
    girl.root.setAttribute('transform', `translate(${(540 + sx).toFixed(1)} ${(1300 + sy).toFixed(1)})`);
    if (s.handOn < 0.02) { girl.armG.setAttribute('opacity', 0); }
    else {
      const h = s.hand;
      girl.armG.setAttribute('opacity', clamp(s.handOn * 2).toFixed(2));
      const d = `M 140 245 L ${h.ex.toFixed(1)} ${h.ey.toFixed(1)} L ${h.x.toFixed(1)} ${(h.y + 22).toFixed(1)}`;
      girl.armOut.setAttribute('d', d); girl.armIn.setAttribute('d', d);
      girl.handG.setAttribute('transform', `translate(${h.x.toFixed(1)} ${h.y.toFixed(1)}) rotate(${h.r.toFixed(1)})`);
      girl.finger.setAttribute('opacity', s.point.toFixed(2));
    }
  });

  // ================= CENAS =================
  // 1) "Ó Fernando, tu acredita que teve uns meninos aqui que..." (0–4,3)
  pg(0, 4.3);
  P(0.1, house(110, 660, 460, 920));
  P(0.35, sign(780, 520, 'ALUGA-SE', 'p/ Carnaval'), { loop: 'wiggle' });
  P(0.6, confetti(60, 300, 1020, 1080, 40, 3), { loop: 'float' });
  P(1.06, T('Ó Fernando...', 540, 360, 96));
  P(3.3, partyBoy(640, 760, 0.72, '#f97316', '#22c55e'), { loop: 'hop' });
  P(3.45, partyBoy(790, 740, 0.72, '#22c55e', '#ec4899'), { loop: 'hop', ph: 0.3 });
  P(3.6, partyBoy(940, 760, 0.72, '#3b82f6', '#facc15'), { loop: 'hop', ph: 0.6 });
  P(1.8, T('TU ACREDITA??', 540, 1060, 104, INK.red), { anim: 'slam', loop: 'wiggle' });

  // 2) "cagaram a sala, o sofá, cagaram" (4,3–8,1)
  pg(4.3, 8.1);
  P(4.35, sofa(540, 780));
  stamp(4.64, 'CAGARAM!', 540, 380, 120, BROWN, -5, { loop: 'shake' });
  P(5.5, [...poop(180, 1000, 0.9), stink(180, 900, 0.8)], { anim: 'slam', loop: 'bounce' });
  P(5.6, T('a sala', 180, 1070, 56, BROWN));
  P(5.9, [...poop(540, 640, 1.2), stink(540, 520)], { anim: 'slam', loop: 'bounce', ph: 0.4 });
  P(6.0, T('o sofá', 540, 1040, 64, BROWN));
  P(7.24, [...poop(860, 990, 0.9), stink(860, 890, 0.8)], { anim: 'slam', loop: 'bounce', ph: 0.2 });
  P(7.24, [...poop(330, 660, 0.7), ...poop(760, 660, 0.7)], { anim: 'slam', loop: 'wiggle' });
  P(7.4, fly(400, 520), { loop: 'buzz' }); P(7.5, fly(700, 560), { loop: 'buzz', ph: 1.3 });

  // 3) "fizeram cocô no banheiro" (8,1–10,2)
  pg(8.1, 10.2);
  P(8.15, toilet(540, 560, 1.15));
  P(8.68, [...poop(540, 650, 1.9), stink(540, 470, 1.2)], { anim: 'slam', loop: 'bounce' });
  P(8.96, [...poop(330, 1000, 0.7, false), ...poop(760, 1010, 0.8, false)], { anim: 'slam' });
  P(9.24, T('no BANHEIRO!', 540, 380, 110, INK.red), { anim: 'slam', loop: 'shake' });
  P(9.3, fly(300, 560), { loop: 'buzz' }); P(9.3, fly(800, 600), { loop: 'buzz', ph: 2 });

  // 4) "limparam a bunda com a toalha, com a camisa de outro" (10,2–13,0)
  pg(10.2, 13.0);
  P(10.26, T('limparam a bunda...', 540, 360, 92));
  P(10.86, towel(290, 680), { anim: 'fly', fx: -500, fr: -30, loop: 'wiggle' });
  P(11.46, shirt(780, 690), { anim: 'fly', fx: 500, fr: 30, loop: 'wiggle' });
  P(11.8, T('a camisa de outro!', 780, 920, 58, INK.green));
  P(11.0, fly(380, 540), { loop: 'buzz' }); P(11.6, fly(820, 520), { loop: 'buzz', ph: 1 });
  stamp(12.1, 'ECA!!', 540, 1040, 110, '#65a30d', 6, { loop: 'shake' });

  // 5) "Rapaz, isso não é justo, essa bagaceira que fizeram aqui em casa" (13,0–16,8)
  pg(13.0, 16.8);
  P(13.16, T('Rapaz...', 540, 340, 100));
  stamp(13.86, 'NÃO É JUSTO!', 540, 500, 108, INK.red, -4, { loop: 'shake' });
  P(14.6, tornado(540, 660, 0.85), { loop: 'spin' });
  P(14.9, T('BAGACEIRA!', 540, 1060, 110, '#7c2d12'), { anim: 'slam', loop: 'tremble' });

  // 6) "a sala tá toda cagada, o sofá, entendeu?" (16,8–22,3)
  pg(16.8, 22.3);
  P(16.85, [box(170, 420, 220, 170, 8, '#fde68a', '#8b5a2b', 10), sofa(560, 800, 560), { d: 'M 820 300 L 820 380', w: 5 }, { d: 'M 760 420 L 820 380 L 880 420 Z', fill: '#fbbf24', w: 5 }]);
  const POOPS = [[17.56, 280, 520, 0.6], [17.9, 820, 400, 0.5], [18.2, 450, 700, 0.8], [18.5, 690, 690, 0.8], [18.8, 160, 1010, 0.7],
    [19.1, 950, 1000, 0.7], [19.4, 560, 1010, 0.6], [20.0, 330, 980, 0.5], [20.4, 560, 560, 1.1]];
  POOPS.forEach(([bt, x, y, s], i) => P(bt, poop(x, y, s), { anim: 'slam', loop: i % 2 ? 'bounce' : 'wiggle', ph: i * 0.3 }));
  P(19.58, T('TODA CAGADA!', 540, 330, 110, BROWN), { anim: 'slam', loop: 'shake' });
  P(19.0, fly(420, 460), { loop: 'buzz' }); P(19.6, fly(700, 900), { loop: 'buzz', ph: 1.5 }); P(20.2, fly(900, 600), { loop: 'buzz', ph: 3 });
  P(21.7, T('ENTENDEU??', 540, 1080, 92, INK.red), { anim: 'slam', loop: 'wiggle' });

  // 7) "tivemos que lavar o banheiro, a camisa" (22,3–24,9)
  pg(22.3, 24.9);
  P(22.48, T('LAVAR TUDO!', 540, 360, 110, INK.blue), { anim: 'slam' });
  P(22.98, bucket(320, 830), { loop: 'spin' });
  P(23.46, [...toilet(780, 520, 0.9), T('*', 640, 560, 80, '#facc15'), T('*', 930, 760, 70, '#facc15')], { loop: 'tremble' });
  P(24.0, T('esfrega, esfrega!', 540, 1060, 78, INK.blue), { loop: 'wiggle' });

  // 8) "tivemos que jogar fora a toalha, jogar fora" (24,9–27,7)
  pg(24.9, 27.7);
  P(24.95, T('PRO LIXO!', 540, 360, 120, INK.red), { anim: 'slam' });
  P(24.95, trashCan(540, 820));
  P(25.32, towel(420, 600), { anim: 'fly', fx: -420, fy: -300, fr: -200, rot: -14, rx: 420, ry: 600 });
  P(26.94, shirt(680, 610, '#16a34a'), { anim: 'fly', fx: 420, fy: -300, fr: 220, rot: 12, rx: 680, ry: 610 });
  P(27.0, [stink(380, 700), stink(700, 700)], { loop: 'float' });

  // 9) "Tudo cagado! Isso não é justo não." (27,7–30,8)
  pg(27.7, 30.8);
  P(28.08, [burst(540, 680, 300, '#ffd23f', BROWN), ...poop(540, 790, 2.2)], { anim: 'slam', loop: 'shake' });
  stamp(28.08, 'TUDO CAGADO!', 540, 360, 110, BROWN, -5);
  P(29.08, T('não é justo não!', 540, 1070, 92, INK.red), { loop: 'tremble' });

  // 10) "Uma vez também aconteceu aqui na minha rua" (30,8–33,9)
  pg(30.8, 33.9);
  P(31.0, [house(70, 700, 310, 900, '#fde68a', '#16a34a'), house(420, 680, 660, 900), house(770, 700, 1010, 900, '#bfdbfe', '#7c3aed'), { d: 'M 30 930 L 1050 930', w: 8 }]);
  P(31.72, T('aconteceu na minha rua...', 540, 380, 84));

  // 11) "foi ano retrasado no Carnaval" (33,9–35,6)
  pg(33.9, 35.6);
  P(33.94, calendar(540, 700), { loop: 'float' });
  P(34.74, [confetti(30, 300, 300, 1080, 20, 7), confetti(780, 300, 1050, 1080, 20, 11)], { loop: 'float' });
  P(34.74, mask(540, 360, 0.75), { anim: 'slam', loop: 'wiggle' });
  P(34.9, T('Ê, Carnaval!', 540, 1070, 92, INK.purple), { loop: 'bounce' });

  // 12) "o pessoal alugou a casa" (35,6–38,5)
  pg(35.6, 38.5);
  P(35.7, house(330, 640, 750, 930));
  P(36.36, sign(540, 470, 'ALUGADA!'), { anim: 'slam' });
  P(36.7, partyBoy(190, 820, 0.7, '#f97316', '#22c55e'), { loop: 'hop' });
  P(36.9, partyBoy(890, 820, 0.7, '#a855f7', '#facc15'), { loop: 'hop', ph: 0.4 });
  P(37.18, key(540, 1050), { loop: 'wiggle' });
  P(37.3, T('o pessoal alugou...', 540, 310, 84));

  // 13) "aí cagaram num bocado de sacola" (38,5–42,0)
  pg(38.5, 42.0);
  P(38.86, T('CAGARAM...', 540, 350, 110, BROWN), { anim: 'slam', loop: 'shake' });
  P(39.4, [...bag(260, 700, 1.1), stink(260, 540, 0.8)], { loop: 'wiggle' });
  P(39.76, [...bag(540, 680, 1.25), stink(540, 500, 0.9)], { loop: 'wiggle', ph: 0.5 });
  P(40.3, [...bag(820, 700, 1.1), stink(820, 540, 0.8)], { loop: 'wiggle', ph: 1 });
  P(40.6, T('num bocado de SACOLA!', 540, 1060, 82, INK.blue), { anim: 'slam' });
  P(40.0, fly(400, 470), { loop: 'buzz' });

  // 14) "e botaram no congelador" (42,0–45,0)
  pg(42.0, 45.0);
  P(42.08, freezer(470, 720), { anim: 'slam', loop: 'tremble' });
  stamp(42.26, 'NO CONGELADOR!!', 540, 340, 92, ICE, -4, { loop: 'shake', bg: '#f0f9ff' });
  P(43.2, T('brrrr', 540, 1080, 70, ICE), { loop: 'tremble' });

  // 15) "Quando a mulher foi pegar a casa..." (45,0–48,8)
  pg(45.0, 48.8);
  P(45.14, T('a dona voltou...', 540, 350, 96));
  P(45.56, person(400, 640, '#e8bf9a', '#6b4423', '#fca5a5'), { loop: 'bounce' });
  P(46.28, key(780, 600), { loop: 'wiggle' });
  P(47.0, [box(640, 760, 280, 260, 18, '#e0f2fe', null, 7), { d: 'M 640 880 L 920 880', c: '#93c5fd', w: 6 }, T('*', 780, 850, 70, ICE)], { loop: 'float' });
  P(47.3, T('abriu o congelador...', 540, 1080, 70, INK.gray));

  // 16) "ela pensou que era carne" (48,8–52,3)
  pg(48.8, 52.3);
  P(49.04, person(220, 900, '#e8bf9a', '#6b4423', '#fca5a5'));
  P(49.4, thought(620, 560, 360, 240, [[330, 820, 16], [390, 760, 24], [450, 690, 32]]), { loop: 'float' });
  P(50.1, steak(620, 560), { loop: 'pulse' });
  P(50.6, T('CARNE!', 820, 1010, 100, INK.red), { anim: 'slam', loop: 'bounce' });
  P(51.0, T('oba, churrasco!', 820, 1090, 56, INK.gray));
  P(50.3, { d: 'M 236 950 q 6 30 0 54', c: '#60a5fa', w: 7 }, { loop: 'float' });

  // 17) "Quando foi ver, era um tolete de bosta dura!" (52,3–55,0)
  pg(52.3, 55.0);
  P(52.56, T('quando foi ver...', 540, 350, 96));
  P(53.98, frozenPoop(540, 640), { anim: 'slam', loop: 'shake' });
  P(54.62, T('BOSTA CONGELADA!', 540, 1070, 96, BROWN), { anim: 'slam', loop: 'tremble' });

  // 18) "Ela nunca mais quis alugar a casa." (55,0–57,3)
  pg(55.0, 57.3);
  P(55.0, house(300, 620, 780, 940));
  P(55.32, [{ d: WB.roughLine(260, 460, 820, 970, 4), c: INK.red, w: 22 }, { d: WB.roughLine(820, 460, 260, 970, 4), c: INK.red, w: 22 }], { anim: 'slam' });
  stamp(55.6, 'NUNCA MAIS!', 540, 360, 110, INK.red, -6, { loop: 'shake' });
  P(56.0, T('aluga-se? NÃO!', 540, 1080, 80, INK.red));

  // 19) A amiga responde: "filho de rapariga... tem que ser muito porco" (57,3–61,2)
  pg(57.3, 61.2);
  P(58.84, T('#@$%&!', 800, 380, 96, INK.red), { anim: 'slam', loop: 'shake' });
  P(59.9, pig(820, 700, 0.85), { anim: 'slam', loop: 'bounce' });
  P(60.3, T('MUITO PORCO!', 800, 1010, 80, '#db2777'), { anim: 'slam', loop: 'wiggle' });

  // 20) Gargalhada (61,2–66,2)
  pg(61.2, 66.2);
  const KK = [[61.4, 'KKKK', 170, 420, 70, INK.red, -14], [62.0, 'KKKKK', 910, 460, 66, INK.purple, 12], [62.6, 'KKK', 180, 760, 80, INK.blue, -8],
    [63.2, 'KKKKKK', 900, 820, 60, INK.green, 10], [63.9, 'KKKK', 540, 300, 80, INK.orange, 0], [64.6, 'KKKKK', 190, 1060, 66, '#db2777', 6], [65.2, 'KKKK', 890, 1080, 70, INK.red, -6]];
  KK.forEach(([bt, tx, x, y, sz, c, rot]) => TX(bt, tx, x, y, sz, c, rot, { anim: 'slam', loop: 'tremble' }));

  // 21) "Tem que ser muito porco, véi, filho de rapariga" (66,2–69,5)
  pg(66.2, 69.5);
  P(66.38, pig(820, 700, 0.95, true), { anim: 'slam', loop: 'hop' });
  P(66.86, T('PORCO, VÉI!', 800, 1040, 86, '#db2777'), { anim: 'slam', loop: 'shake' });
  P(67.8, T('#@$%&!', 800, 340, 90, INK.red), { anim: 'slam', loop: 'tremble' });

  // 22) Gargalhada sem fim (69,5–84,3)
  pg(69.5, 84.3);
  const KK2 = [[69.6, 'KKKKK', 170, 450, 64, INK.red, -12], [70.3, 'KKKK', 910, 470, 70, INK.blue, 12], [71.0, 'KKKKKK', 170, 1000, 56, INK.purple, 8],
    [71.6, 'KKK', 910, 1010, 80, INK.green, -8]];
  KK2.forEach(([bt, tx, x, y, sz, c, rot]) => TX(bt, tx, x, y, sz, c, rot, { anim: 'slam', loop: 'tremble' }));
  P(72.5, clock(170, 700, 90), { loop: 'wiggle' });
  P(72.6, T('1 minuto', 170, 840, 48, INK.gray));
  P(72.6, T('depois...', 170, 885, 48, INK.gray));
  P(74.6, laughFace(910, 720, 90), { loop: 'bounce' });
  P(76.0, T('ainda rindo...', 910, 890, 52, INK.gray), { loop: 'wiggle' });
  const puddle = WB.mk('ellipse', { cx: 540, cy: 1085, rx: 0, ry: 0, fill: '#93c5fd', stroke: INK.black, 'stroke-width': 6 }, cont);
  WB.effect(t => { const u = clamp((t - 79.0) / 4.5); puddle.setAttribute('rx', (270 * ease(u)).toFixed(1)); puddle.setAttribute('ry', (38 * ease(u)).toFixed(1)); });
  P(80.5, T('poça de lágrimas', 540, 1100, 44, INK.blue));
  TX(82.0, 'KKKKKKKKK', 540, 300, 96, INK.red, -3, { anim: 'slam', loop: 'tremble' });

  // 23) "A mulher descongelando a bosta!" (84,3–89,2)
  pg(84.3, 89.2);
  P(84.48, T('a mulher...', 790, 380, 76));
  P(86.0, microwave(790, 680));
  const plate = WB.mk('g', {}, cont);
  P(86.0, poop(745, 760, 0.95), { parent: plate });
  WB.effect(t => plate.setAttribute('transform', `translate(745 0) scale(${Math.cos((t - 86) * 3.2).toFixed(3)} 1) translate(-745 0)`));
  P(87.16, T('DESCONGELANDO...', 790, 940, 66, ICE), { loop: 'pulse' });
  P(87.98, T('A BOSTA!!', 790, 1050, 100, BROWN), { anim: 'slam', loop: 'shake' });

  // 24) Gargalhada final (89,2–92,2)
  pg(89.2, 92.2);
  TX(89.3, 'KKKKKK', 170, 450, 66, INK.red, -12, { anim: 'slam', loop: 'tremble' });
  TX(89.8, 'KKKKK', 910, 470, 66, INK.purple, 12, { anim: 'slam', loop: 'tremble' });
  P(90.3, laughFace(170, 900, 80), { loop: 'bounce' });
  P(90.6, laughFace(910, 900, 80), { loop: 'bounce', ph: 0.4 });

  // 25) Chamada para seguir (92,2–fim)
  pg(92.2, 99);
  {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 470, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 560, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@caderno_amarelo', 380, 560 + 190 * 0.62, 84, INK.black, g).strokes);
    animate(g, 92.35, { loop: 'float' });
  }

  // ---------------- amiga no celular (gravando áudio e morrendo de rir) ----------------
  const phone = (() => {
    const root = WB.mk('g', {}, WB.overlay);
    const inner = WB.mk('g', {}, root);
    const mk = (tag, a, p = inner) => WB.mk(tag, a, p);
    mk('rect', { x: -175, y: -310, width: 350, height: 620, rx: 44, fill: '#1f2937', stroke: INK.black, 'stroke-width': 7 });
    mk('rect', { id: 'scrBg', x: -155, y: -268, width: 310, height: 540, rx: 18, fill: '#dcf8c6', stroke: INK.black, 'stroke-width': 4 });
    const cp = mk('clipPath', { id: 'scrClip' });
    WB.mk('rect', { x: -155, y: -268, width: 310, height: 540, rx: 18 }, cp);
    mk('rect', { x: -40, y: -296, width: 80, height: 12, rx: 6, fill: '#4b5563' });
    const scr = mk('g', { 'clip-path': 'url(#scrClip)' });
    const FS = '#e0a77e', FH = '#3b2416';
    const bust = WB.mk('g', {}, scr);
    WB.mk('path', { d: 'M -150 290 Q -140 150 -40 130 L 40 130 Q 140 150 150 290 Z', fill: '#a855f7', stroke: INK.black, 'stroke-width': 6 }, bust);
    WB.mk('path', { d: 'M -24 80 L -22 140 L 22 140 L 24 80 Z', fill: FS, stroke: INK.black, 'stroke-width': 5 }, bust);
    const head = WB.mk('g', {}, scr);
    for (const [x, y, r] of [[-80, -70, 52], [-30, -100, 56], [30, -100, 56], [80, -70, 52], [-100, -10, 44], [100, -10, 44], [-92, 40, 36], [92, 40, 36]])
      WB.mk('circle', { cx: x, cy: y, r, fill: FH, stroke: INK.black, 'stroke-width': 5 }, head);
    WB.mk('ellipse', { cx: 0, cy: 10, rx: 86, ry: 98, fill: FS, stroke: INK.black, 'stroke-width': 6 }, head);
    WB.mk('path', { d: 'M -86 -10 Q -80 -96 0 -94 Q 80 -96 86 -10 Q 50 -62 0 -58 Q -50 -62 -86 -10 Z', fill: FH, stroke: INK.black, 'stroke-width': 5 }, head);
    WB.mk('circle', { cx: -86, cy: 52, r: 12, fill: '#facc15', stroke: INK.black, 'stroke-width': 4 }, head);
    WB.mk('circle', { cx: 86, cy: 52, r: 12, fill: '#facc15', stroke: INK.black, 'stroke-width': 4 }, head);
    WB.mk('path', { d: 'M -62 4 Q -40 -22 -16 4 M 16 4 Q 40 -22 62 4', fill: 'none', stroke: INK.black, 'stroke-width': 8, 'stroke-linecap': 'round' }, head);
    WB.mk('path', { d: 'M -64 -30 Q -40 -48 -18 -36 M 18 -36 Q 40 -48 64 -30', fill: 'none', stroke: FH, 'stroke-width': 9, 'stroke-linecap': 'round' }, head);
    WB.mk('ellipse', { cx: -56, cy: 34, rx: 18, ry: 10, fill: '#f472b6', opacity: 0.6 }, head);
    WB.mk('ellipse', { cx: 56, cy: 34, rx: 18, ry: 10, fill: '#f472b6', opacity: 0.6 }, head);
    WB.mk('path', { d: 'M -4 18 Q -12 34 0 38 Q 8 38 10 34', fill: 'none', stroke: '#7a4f30', 'stroke-width': 5, 'stroke-linecap': 'round' }, head);
    const mouth = WB.mk('path', { d: '', fill: MOUTH, stroke: INK.black, 'stroke-width': 5, 'stroke-linejoin': 'round' }, head);
    const teeth = WB.mk('path', { d: '', fill: '#ffffff', stroke: 'none' }, head);
    const tears = [0, 1, 2, 3].map(() => WB.mk('path', { d: 'M 0 -14 Q -11 4 0 8 Q 11 4 0 -14 Z', fill: '#60a5fa', stroke: '#1d4ed8', 'stroke-width': 3 }, head));
    // barra "gravando áudio"
    const bar = WB.mk('g', {}, inner);
    WB.mk('rect', { x: -140, y: 196, width: 280, height: 60, rx: 30, fill: '#ffffff', stroke: INK.black, 'stroke-width': 4 }, bar);
    const dot = WB.mk('circle', { cx: -108, cy: 226, r: 12, fill: '#ef4444' }, bar);
    WB.showNow(WB.textStrokes('gravando...', 10, 240, 40, INK.black, bar, 'middle').strokes);
    return { root, inner, head, mouth, teeth, tears, dot };
  })();
  const LEFT = { x: 300, y: 660, s: 1 }, MID = { x: 540, y: 680, s: 1.05 };
  const POS = [[FRIEND_T0, LEFT], [61.2, MID], [66.2, LEFT], [69.5, MID], [84.3, LEFT], [89.2, MID]];
  WB.effect((t) => {
    if (t < FRIEND_T0 - 0.05 || t > FRIEND_T1 + 0.3) { phone.root.setAttribute('opacity', 0); return; }
    let i = 0;
    while (i + 1 < POS.length && POS[i + 1][0] <= t) i++;
    const a = POS[Math.max(0, i - 1)][1], b = POS[i][1], u = i === 0 ? 1 : ease(clamp((t - POS[i][0]) / 0.45));
    const op = envAt(t), tt = t - FRIEND_T0;
    const k = backOut(clamp(tt / 0.45)) * lerp(a.s, b.s, u);
    const x = lerp(a.x, b.x, u) + Math.sin(t * 31) * 4 * op, y = lerp(a.y, b.y, u) + Math.sin(t * 23) * 3 * op;
    phone.root.setAttribute('opacity', (clamp(tt / 0.15) * (1 - clamp((t - FRIEND_T1) / 0.25))).toFixed(3));
    phone.root.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(3)}) rotate(${(Math.sin(t * 13) * 2.5 * op).toFixed(2)})`);
    // cabeça jogada pra trás de tanto rir
    const hr = Math.sin(t * 10) * 7 * op - 4, hy = -Math.abs(Math.sin(t * 9)) * 12 * op;
    phone.head.setAttribute('transform', `translate(0 ${hy.toFixed(1)}) rotate(${hr.toFixed(2)} 0 120)`);
    const open = Math.max(0.3, clamp(op * 1.2));
    const bot = 52 + 18 + 62 * open;
    phone.mouth.setAttribute('d', `M -44 52 Q 0 46 44 52 Q 0 ${(2 * bot - 52).toFixed(1)} -44 52 Z`);
    phone.teeth.setAttribute('d', `M -38 54 Q 0 49 38 54 L 34 ${(54 + 8 + 4 * open).toFixed(1)} Q 0 ${(60 + 4 * open).toFixed(1)} -34 ${(54 + 8 + 4 * open).toFixed(1)} Z`);
    phone.tears.forEach((el, j) => {
      const side = j % 2 ? 1 : -1, ph = ((t * 1.3 + j * 0.37) % 1);
      const tx = side * (66 + 46 * ph), ty = 6 + 110 * ph * ph;
      el.setAttribute('transform', `translate(${tx.toFixed(1)} ${ty.toFixed(1)})`);
      el.setAttribute('opacity', (1 - ph).toFixed(2));
    });
    phone.dot.setAttribute('opacity', Math.sin(t * 6) > 0 ? 1 : 0.25);
  });
};
