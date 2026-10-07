// Meme "o tiozão do grupo Voto 22" no estilo Caderno Amarelo (formato B, desenho animado).
// Um áudio de WhatsApp de 5 min cortado em 4 trechos (~90 s): bom dia ao grupo, o barco afundando,
// os ricos comemorando, o "vamos lá, Bolsonaro" irônico e o "vai dar certo" com a água no pescoço.
// A boca segue a energia do áudio (ENV: 20 valores por segundo, 0–9). O tiozão fica num barquinho
// com a bandeira do Brasil que vai afundando aos poucos.
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const r1 = n => Math.round(n * 10) / 10;
  const SKIN = '#e0ac85', HAIR = '#b8bcc4', MOUTH = '#6b1f2b', SEA = '#60a5fa', GOLD = '#facc15', MONEY = '#86efac';
  const ellipse = (cx, cy, rx, ry) => WB.arcPath(cx, cy, rx, ry, 0, Math.PI * 2, 48) + ' Z';
  const backOut = u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };

  const ENV = '689999999995999866896788765556787899777458971068678777778762005686411111100000000067763789998699855699779864588898988740000000000001010010000399996799996985689875599970079988863000000005986397899999768443221000000000001189914714810676302108961991745748877306877421011113828869648315598852288767754230101200000200113479835779731179763796688656666540010000000000000000000004700886977956876566597464300047983665556898865335456886316889888778875556662587457785587879766541379868887746994456584422127613200274167877754465796300101001698279877300000077830136410000106745776310001002000000087786877873114868859840058756850087401866749988775886887626875689899611874000000770571086688720478679878877648611000000099728889888721514179727768445478777649600000067860000007976567788688400000194385985557551978899998544332334427854487874132000100009955974039967875018877898017505888798777679688857705877730000000079703966886008862049989988985886666479300562018960598799984930777637588610121002278863710983008997895369589977885234285232880089973214231300000001499770057777300000000000871642850238942785688987985278898608997872675002120098883678878725650399984562000000000000000007887200000000000000000000077598688777774971566876541001001110016589876433177268864020002000003736953268868872696227867732899987311100000000000000048871057887400000288289677877578630000000000000778998766200027867788872000000000000007954779029646799577677621244000000990970886118500750674468988765000077088586871785986983548873071760675268407606666578764100000000037439994141200008978972887898778789999850221100120000000000000019962589978778898377666335577989987338748767887644441000007625996305422121100288864977502678886523566559997420000000000000019999996079998700000120098079610465774986687259508711287887568416897614771762587530000000000000000000000000000000000000000000000000000000000000000000000000000000000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  const END = 93.75;

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
      if (loop === 'rock') rot += Math.sin(ts * 2.2) * 6;
      if (loop === 'pulse') k *= 1 + 0.07 * Math.sin(ts * 9);
      if (loop === 'spin') rot += ts * 40;
      if (loop === 'fall') dy += ((ts * 260) % 900) - 200;
      if (loop === 'sink') { dy += Math.min(ts, 4) * 70; rot += Math.min(ts, 4) * 6; }
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
  const TX = (bt, text, x, y, size, c, rot = 0, o = {}) => P(bt, T(text, x, y, size, c), Object.assign({ rot, rx: x, ry: y - size * 0.3 }, o));

  // ---------------- desenhos ----------------
  const box = (x, y, w, h, r, fill, c, wd) => ({ d: WB.roundRectPath(x, y, w, h, r), fill, c, w: wd || 6 });
  const circ = (x, y, r, fill, c, wd) => ({ d: WB.circlePath(x, y, r), fill, c, w: wd || 6 });
  const S = (x, y, s) => (dx, dy) => `${r1(x + dx * s)} ${r1(y + dy * s)}`;
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
      const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0), c = cols[i % cols.length], a = rnd() * 180;
      if (i % 3 === 0) out.push(circ(r1(x), r1(y), 9, c, 'none'));
      else if (i % 3 === 1) out.push({ d: `M ${r1(x)} ${r1(y)} l ${r1(Math.cos(a) * 16)} ${r1(Math.sin(a) * 16)}`, c, w: 9 });
      else out.push({ d: `M ${r1(x)} ${r1(y)} q 10 -14 20 0 q 10 14 20 0`, c, w: 6 });
    }
    return out;
  }
  function sun(x, y, r) {
    let rays = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      rays += `M ${r1(x + Math.cos(a) * r * 1.25)} ${r1(y + Math.sin(a) * r * 1.25)} L ${r1(x + Math.cos(a) * r * 1.65)} ${r1(y + Math.sin(a) * r * 1.65)} `;
    }
    return [{ d: rays, c: '#f59e0b', w: 10 }, circ(x, y, r, '#fde047', null, 7),
      { d: `M ${x - r * 0.45} ${y - r * 0.1} q ${r * 0.12} ${-r * 0.2} ${r * 0.24} 0 M ${x + r * 0.21} ${y - r * 0.1} q ${r * 0.12} ${-r * 0.2} ${r * 0.24} 0`, w: 6 },
      { d: `M ${x - r * 0.4} ${y + r * 0.22} Q ${x} ${y + r * 0.7} ${x + r * 0.4} ${y + r * 0.22} Z`, fill: '#ffffff', w: 5 }];
  }
  function mug(x, y) {
    return [{ d: `M ${x + 80} ${y - 50} q 70 0 70 50 q 0 50 -70 50`, w: 12 },
      { d: `M ${x - 90} ${y - 90} L ${x + 90} ${y - 90} L ${x + 76} ${y + 100} Q ${x} ${y + 120} ${x - 76} ${y + 100} Z`, fill: '#ef4444', w: 7 },
      { d: ellipse(x, y - 90, 90, 18), fill: '#7c4a1e', w: 6 }, T('CAFÉ', x, y + 30, 50, '#ffffff'),
      { d: `M ${x - 40} ${y - 130} q 14 -22 0 -44 q -14 -22 0 -44 M ${x + 30} ${y - 126} q 14 -22 0 -44 q -14 -22 0 -44`, c: '#9ca3af', w: 6 }];
  }
  function groupCard(bt) {
    const x0 = 120, x1 = 960, y0 = 560, y1 = 1060;
    P(bt, [box(x0, y0, x1 - x0, y1 - y0, 30, '#ece5dd', null, 8), box(x0, y0, x1 - x0, 130, 30, '#128c7e', null, 8),
      circ(x0 + 70, y0 + 65, 40, '#ffffff', null, 5), T('22', x0 + 70, y0 + 84, 50, '#128c7e'),
      T('Galera do Voto 22', x0 + 130, y0 + 82, 62, '#ffffff', 'start')]);
    P(bt + 0.35, [box(x0 + 40, y0 + 170, 460, 110, 24, '#ffffff', null, 5), T('Bom dia!!', x0 + 70, y0 + 245, 58, INK.black, 'start')], { anim: 'fly', fx: -300 });
    P(bt + 0.7, [box(x0 + 40, y0 + 310, 520, 110, 24, '#ffffff', null, 5), T('Bom diaaa', x0 + 70, y0 + 385, 58, INK.black, 'start')], { anim: 'fly', fx: -300 });
  }
  function brFlag(x, y, w) {
    const h = w * 0.7, cx = x + w / 2, cy = y + h / 2;
    return [box(x, y, w, h, 6, '#16a34a', null, 6),
      { d: `M ${cx} ${y + h * 0.1} L ${x + w * 0.92} ${cy} L ${cx} ${y + h * 0.9} L ${x + w * 0.08} ${cy} Z`, fill: GOLD, w: 4 },
      circ(cx, cy, h * 0.24, '#1d4ed8', null, 4)];
  }
  function boat(x, y, s = 1, man = true) {
    const p = S(x, y, s);
    const out = [
      { d: `M ${p(0, 30)} L ${p(0, -260)}`, c: '#7c4a1e', w: 10 },
      ...brFlag(x + 6 * s, y - 250 * s, 170 * s),
    ];
    if (man) out.push(circ(x - 90 * s, y - 40 * s, 42 * s, SKIN, null, 5),
      { d: `M ${p(-122, -56)} q 32 -36 64 0`, c: HAIR, w: 10 },
      { d: `M ${p(-104, -26)} q 14 -10 28 0`, w: 4 },
      { d: `M ${p(-110, -42)} l 0 4 M ${p(-74, -42)} l 0 4`, w: 6 });
    out.push({ d: `M ${p(-230, 0)} L ${p(230, 0)} L ${p(170, 110)} L ${p(-170, 110)} Z`, fill: '#b45309', w: 7 },
      { d: `M ${p(-205, 38)} L ${p(205, 38)} M ${p(-185, 74)} L ${p(185, 74)}`, c: '#7c2d12', w: 5 },
      T('BRASIL', x, y + 66 * s, 48 * s, '#fef3c7'));
    return out;
  }
  const sea = (x0, x1, y) => ({ d: WB.wavyLine(x0, x1, y, 10, 90), c: '#2563eb', w: 8 });
  function cloudRain(x, y, s = 1) {
    const out = [{ d: WB.cloudPath(x, y, 130 * s, 70 * s), fill: '#9ca3af', w: 7 }];
    for (let i = -2; i <= 2; i++) out.push({ d: `M ${r1(x + i * 44 * s)} ${r1(y + 90 * s)} l -10 34`, c: '#3b82f6', w: 7 });
    return out;
  }
  function richMan(x, y, s = 1) {
    const p = S(x, y, s);
    return [
      { d: `M ${p(-150, 330)} Q ${p(-140, 130)} ${p(0, 120)} Q ${p(140, 130)} ${p(150, 330)} Z`, fill: '#1f2937', w: 7 },
      { d: `M ${p(-40, 126)} L ${p(0, 200)} L ${p(40, 126)} Z`, fill: '#ffffff', w: 5 },
      { d: `M ${p(-34, 140)} L ${p(0, 156)} L ${p(-34, 172)} Z M ${p(34, 140)} L ${p(0, 156)} L ${p(34, 172)} Z`, fill: '#dc2626', w: 4 },
      circ(x, y, 100 * s, '#f1c7a5', null, 7),
      { d: `M ${p(-120, -70)} L ${p(120, -70)}`, w: 12 },
      box(x - 72 * s, y - 230 * s, 144 * s, 160 * s, 6, '#111827', null, 6),
      { d: `M ${p(-72, -100)} L ${p(72, -100)}`, c: '#dc2626', w: 14 },
      circ(x + 38 * s, y - 6 * s, 28 * s, null, null, 6), { d: `M ${p(64, 14)} Q ${p(80, 80)} ${p(70, 130)}`, c: GOLD, w: 4 },
      circ(x - 38 * s, y - 6 * s, 8 * s, '#111', null, 3), circ(x + 38 * s, y - 6 * s, 8 * s, '#111', null, 3),
      { d: `M ${p(-60, 34)} Q ${p(-30, 20)} ${p(0, 38)} Q ${p(30, 20)} ${p(60, 34)} Q ${p(30, 48)} ${p(0, 42)} Q ${p(-30, 48)} ${p(-60, 34)} Z`, fill: '#6b7280', w: 4 },
      { d: `M ${p(-36, 58)} Q ${p(0, 86)} ${p(36, 58)} Z`, fill: '#ffffff', w: 4 },
    ];
  }
  function champagne(x, y) {
    return [{ d: `M ${x - 34} ${y + 140} L ${x - 34} ${y - 10} Q ${x - 34} ${y - 50} ${x - 14} ${y - 70} L ${x - 14} ${y - 130} L ${x + 14} ${y - 130} L ${x + 14} ${y - 70} Q ${x + 34} ${y - 50} ${x + 34} ${y - 10} L ${x + 34} ${y + 140} Z`, fill: '#166534', w: 6 },
      box(x - 34, y + 10, 68, 70, 4, GOLD, null, 4),
      circ(x - 20, y - 190, 26, '#fef9c3', null, 4), circ(x + 20, y - 210, 30, '#fef9c3', null, 4), circ(x, y - 250, 24, '#fef9c3', null, 4),
      box(x + 40, y - 330, 30, 40, 6, '#d6a75c', null, 4)];
  }
  function chartUp(x0, y0, x1, y1, c = '#16a34a', down = false) {
    const ys = down ? [y0 + 40, y0 + 90, y0 + 70, y1 - 90, y1 - 120, y1 - 30] : [y1 - 30, y1 - 90, y1 - 60, y0 + 120, y0 + 140, y0 + 30];
    const xs = ys.map((_, i) => x0 + 20 + (i / (ys.length - 1)) * (x1 - x0 - 60));
    const d = xs.map((x, i) => `${i ? 'L' : 'M'} ${r1(x)} ${r1(ys[i])}`).join(' ');
    const ang = Math.atan2(ys[5] - ys[4], xs[5] - xs[4]);
    return [{ d: `M ${x0} ${y0 - 20} L ${x0} ${y1} L ${x1 + 10} ${y1}`, w: 7 }, { d, c, w: 12 }, { d: WB.arrowHead(xs[5], ys[5], ang, 40), c, w: 12 }];
  }
  function arrowV(x, y0, y1, c, w = 16) {
    return { d: `M ${x} ${y0} L ${x} ${y1} ` + WB.arrowHead(x, y1, y1 > y0 ? Math.PI / 2 : -Math.PI / 2, 44), c, w };
  }
  function bill(x, y, s = 1) {
    const p = S(x, y, s);
    return [{ d: WB.roundRectPath(x - 120 * s, y - 60 * s, 240 * s, 120 * s, 10), fill: MONEY, w: 6 },
      { d: ellipse(x, y, 42 * s, 42 * s), fill: '#dcfce7', w: 4 }, T('$', x, y + 22 * s, 66 * s, '#166534'),
      { d: `M ${p(-100, -40)} L ${p(-70, -40)} M ${p(70, 40)} L ${p(100, 40)}`, c: '#166534', w: 4 }];
  }
  function moneyBag(x, y, s = 1) {
    const p = S(x, y, s);
    return [{ d: `M ${p(-40, -90)} Q ${p(-130, 20)} ${p(-100, 90)} Q ${p(0, 130)} ${p(100, 90)} Q ${p(130, 20)} ${p(40, -90)} Z`, fill: '#d6a75c', w: 7 },
      { d: `M ${p(-40, -90)} L ${p(-60, -130)} L ${p(60, -130)} L ${p(40, -90)} Z`, fill: '#d6a75c', w: 6 },
      { d: `M ${p(-48, -92)} L ${p(48, -92)}`, c: '#7c2d12', w: 10 }, T('$', x, y + 50 * s, 110 * s, '#166534')];
  }
  function plate(x, y, full) {
    const out = [{ d: ellipse(x, y, 170, 56), fill: '#f8fafc', w: 7 }, { d: ellipse(x, y, 120, 36), fill: '#e2e8f0', w: 4 }];
    if (full) out.push({ d: `M ${x - 110} ${y - 10} Q ${x - 120} ${y - 130} ${x} ${y - 140} Q ${x + 120} ${y - 130} ${x + 110} ${y - 10} Z`, fill: '#c2410c', w: 7 },
      { d: `M ${x + 70} ${y - 100} L ${x + 140} ${y - 170}`, w: 12 }, circ(x + 148, y - 178, 16, '#ffffff', null, 5), circ(x + 128, y - 186, 14, '#ffffff', null, 5),
      { d: `M ${x - 80} ${y - 110} q 10 -30 0 -50 M ${x} ${y - 150} q 10 -30 0 -50`, c: '#9ca3af', w: 6 });
    return out;
  }
  function poorMan(x, y, s = 1) {
    const p = S(x, y, s);
    return [{ d: `M ${p(-130, 290)} Q ${p(-120, 120)} ${p(0, 110)} Q ${p(120, 120)} ${p(130, 290)} Z`, fill: '#94a3b8', w: 7 },
      box(x + 30 * s, y + 180 * s, 50 * s, 50 * s, 4, '#fde68a', null, 4),
      circ(x, y, 90 * s, '#c68a5f', null, 7),
      { d: `M ${p(-50, -24)} Q ${p(-34, -36)} ${p(-18, -18)} M ${p(18, -18)} Q ${p(34, -36)} ${p(50, -24)}`, w: 6 },
      circ(x - 34 * s, y, 7 * s, '#111', null, 3), circ(x + 34 * s, y, 7 * s, '#111', null, 3),
      { d: `M ${p(-30, 52)} Q ${p(0, 30)} ${p(30, 52)}`, w: 6 },
      { d: `M ${p(46, 10)} q -10 18 0 26 q 10 -8 0 -26 Z`, fill: '#60a5fa', w: 3 }];
  }
  const fly = (x, y) => [{ d: ellipse(x - 9, y - 12, 10, 7), fill: '#e0f2fe', w: 3 }, { d: ellipse(x + 9, y - 12, 10, 7), fill: '#e0f2fe', w: 3 }, circ(x, y, 9, '#111', null, 3)];
  function pompom(x, y, c1, c2) {
    const out = [{ d: `M ${x} ${y + 60} L ${x} ${y + 170}`, w: 12 }];
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; out.push(circ(r1(x + Math.cos(a) * 50), r1(y + Math.sin(a) * 50), 40, i % 2 ? c1 : c2, null, 4)); }
    out.push(circ(x, y, 44, c1, null, 4));
    return out;
  }
  function family(x, y) {
    const one = (cx, h, c) => [circ(cx, y - h, 26, SKIN, null, 5), { d: `M ${cx} ${y - h + 26} L ${cx} ${y - 40} M ${cx - 34} ${y - h + 70} L ${cx + 34} ${y - h + 70} M ${cx} ${y - 40} L ${cx - 24} ${y + 10} M ${cx} ${y - 40} L ${cx + 24} ${y + 10}`, c, w: 8 }];
    return [one(x - 70, 170, INK.blue), one(x + 70, 160, '#db2777'), one(x, 100, INK.green)];
  }
  function heaven(x, y) {
    let rays = '';
    for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI; rays += `M ${r1(x + Math.cos(a) * 110)} ${r1(y + Math.sin(a) * 70)} L ${r1(x + Math.cos(a) * 170)} ${r1(y + Math.sin(a) * 120)} `; }
    return [{ d: rays, c: GOLD, w: 8 }, { d: WB.cloudPath(x, y, 110, 55), fill: '#ffffff', w: 6 }];
  }
  function foamFinger(x, y) {
    return [{ d: `M ${x - 90} ${y + 230} L ${x - 100} ${y - 20} Q ${x - 100} ${y - 70} ${x - 50} ${y - 70} L ${x - 40} ${y - 70} L ${x - 40} ${y - 250} Q ${x} ${y - 300} ${x + 40} ${y - 250} L ${x + 40} ${y - 70} Q ${x + 110} ${y - 80} ${x + 100} ${y + 20} L ${x + 90} ${y + 230} Z`, fill: '#fde047', w: 8 },
      { d: `M ${x - 40} ${y - 70} L ${x - 40} ${y + 10} M ${x + 40} ${y - 70} L ${x + 40} ${y}`, w: 5 },
      T('#1', x, y + 140, 110, '#16a34a')];
  }
  function bigEye(x, y) {
    return [{ d: `M ${x - 260} ${y} Q ${x} ${y - 230} ${x + 260} ${y} Q ${x} ${y + 230} ${x - 260} ${y} Z`, fill: '#ffffff', w: 9 },
      circ(x, y, 96, '#16a34a', null, 7), circ(x, y, 44, '#111', null, 4), circ(x + 26, y - 30, 16, '#ffffff', 'none'),
      { d: `M ${x - 180} ${y - 92} l -30 -50 M ${x - 90} ${y - 140} l -14 -56 M ${x} ${y - 156} l 0 -58 M ${x + 90} ${y - 140} l 14 -56 M ${x + 180} ${y - 92} l 30 -50`, w: 8 },
      { d: `M ${x - 220} ${y + 70} Q ${x - 200} ${y + 110} ${x - 230} ${y + 160}`, c: '#ef4444', w: 5 }];
  }
  function bandaid(x, y) {
    return [{ d: WB.roundRectPath(x - 200, y - 60, 400, 120, 60), fill: '#f2c9a0', w: 7 }, box(x - 70, y - 50, 140, 100, 14, '#e8b384', null, 5),
      circ(x - 130, y - 20, 6, '#c08458', 'none'), circ(x - 150, y + 20, 6, '#c08458', 'none'), circ(x + 130, y - 20, 6, '#c08458', 'none'), circ(x + 150, y + 20, 6, '#c08458', 'none')];
  }
  const bubbles = (x, y) => [circ(x, y, 20, '#dbeafe', SEA, 5), circ(x + 40, y - 70, 14, '#dbeafe', SEA, 5), circ(x - 20, y - 130, 24, '#dbeafe', SEA, 5)];

  // ---------------- o tiozão (camada fixa) ----------------
  const ch = (() => {
    const root = WB.mk('g', { transform: 'translate(540 1300)' }, WB.overlay);
    const bodyG = WB.mk('g', {}, root), headG = WB.mk('g', {}, root), armG = WB.mk('g', {}, root), hullG = WB.mk('g', { opacity: 0 }, root);
    const parts = [
      build([{ d: 'M -28 90 L -26 185 L 26 185 L 28 90 Z', fill: SKIN, w: 6 },
        { d: 'M -190 430 Q -185 215 -60 180 Q 0 200 60 180 Q 185 215 190 430 Z', fill: '#7dd3fc', w: 7 },
        { d: 'M -60 182 L -10 250 L -40 176 Z M 60 182 L 10 250 L 40 176 Z', fill: '#ffffff', w: 5 },
        { d: 'M -150 300 L -150 430 M -110 280 L -110 430 M 110 280 L 110 430 M 150 300 L 150 430 M -190 360 L 190 360', c: '#0284c7', w: 4 },
        box(70, 290, 70, 60, 6, '#bae6fd', null, 5), { d: 'M 90 280 L 90 320', c: INK.blue, w: 8 }], bodyG),
      build([{ d: ellipse(-98, 12, 15, 24), fill: SKIN, w: 5 }, { d: ellipse(98, 12, 15, 24), fill: SKIN, w: 5 },
        { d: ellipse(0, 0, 100, 118), fill: SKIN, w: 7 },
        { d: 'M -6 22 Q -20 48 0 54 Q 12 56 16 48', w: 5, c: '#7a4a2a' },
        // careca com cabelo grisalho dos lados
        { d: 'M -100 -10 Q -112 -70 -82 -92 Q -76 -40 -90 30 Z', fill: HAIR, w: 5 },
        { d: 'M 100 -10 Q 112 -70 82 -92 Q 76 -40 90 30 Z', fill: HAIR, w: 5 },
        { d: 'M -30 -104 q 10 -14 22 -2 M 10 -108 q 12 -12 22 2', c: '#9ca3af', w: 4 },
        { d: 'M -60 -70 Q -40 -88 -20 -82', c: '#f5d0b5', w: 8 }], headG),
    ];
    for (const p of parts) { WB.showNow(p.strokes); p.fills.forEach(f => f.el.setAttribute('fill-opacity', 1)); }
    const dyn = WB.mk('g', {}, headG);
    const eyeG = WB.mk('g', {}, dyn);
    const eyes = [-38, 38].map((ex, i) => {
      WB.mk('path', { d: ellipse(ex, 8, 19, 14), fill: '#ffffff', stroke: INK.black, 'stroke-width': 4 }, eyeG);
      const cp = WB.mk('clipPath', { id: `eyeT${i}` }, eyeG);
      WB.mk('path', { d: ellipse(ex, 8, 18, 13) }, cp);
      const clip = `url(#eyeT${i})`;
      return {
        ex,
        pupil: WB.mk('circle', { cx: ex, cy: 8, r: 8, fill: '#1f1410', 'clip-path': clip }, eyeG),
        lid: WB.mk('rect', { x: ex - 24, y: -10, width: 48, height: 0, fill: SKIN, 'clip-path': clip }, eyeG),
        lidLine: WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': 4, 'stroke-linecap': 'round', 'clip-path': clip }, eyeG),
        brow: WB.mk('path', { d: '', fill: 'none', stroke: '#9ca3af', 'stroke-width': 12, 'stroke-linecap': 'round' }, dyn),
      };
    });
    // óculos
    WB.mk('path', { d: WB.circlePath(-38, 8, 32) + ' ' + WB.circlePath(38, 8, 32) + ' M -6 4 Q 0 -2 6 4 M -70 2 L -98 -4 M 70 2 L 98 -4', fill: 'none', stroke: '#1f2937', 'stroke-width': 6 }, dyn);
    const mouth = WB.mk('path', { d: '', fill: MOUTH, stroke: INK.black, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, dyn);
    // bigode grisalho por cima da boca
    WB.mk('path', { d: 'M -56 70 Q -50 50 -24 52 Q -8 52 0 60 Q 8 52 24 52 Q 50 50 56 70 Q 34 64 0 70 Q -34 64 -56 70 Z', fill: '#d1d5db', stroke: INK.black, 'stroke-width': 4 }, dyn);
    const sweat = WB.mk('path', { d: 'M 86 -60 q -14 24 0 36 q 14 -12 0 -36 Z', fill: '#93c5fd', stroke: INK.black, 'stroke-width': 4, opacity: 0 }, dyn);
    const tear = WB.mk('path', { d: 'M -60 30 q -12 22 0 32 q 12 -10 0 -32 Z', fill: '#60a5fa', stroke: '#1d4ed8', 'stroke-width': 3, opacity: 0 }, dyn);
    const armOut = WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': 56, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, armG);
    const armIn = WB.mk('path', { d: '', fill: 'none', stroke: '#7dd3fc', 'stroke-width': 44, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, armG);
    const handG = WB.mk('g', {}, armG);
    const finger = WB.mk('path', { d: 'M 20 -16 Q 80 -30 108 -24 Q 118 -12 106 -4 Q 70 -2 28 8 Z', fill: SKIN, stroke: INK.black, 'stroke-width': 5, opacity: 0 }, handG);
    WB.mk('path', { d: 'M -36 30 Q -46 -16 -26 -46 Q 0 -62 26 -46 Q 46 -16 36 30 Q 0 48 -36 30 Z', fill: SKIN, stroke: INK.black, 'stroke-width': 5 }, handG);
    WB.mk('path', { d: 'M -14 -42 L -12 -12 M 4 -46 L 4 -14 M 20 -40 L 18 -12', stroke: '#7a4f30', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, handG);
    // barquinho na frente do corpo, com a bandeira do Brasil no mastro
    const hull = build([
      { d: 'M 300 250 L 300 -60', c: '#7c4a1e', w: 10 }, ...brFlag(304, -56, 150),
      { d: 'M -340 250 L 340 250 L 270 470 L -270 470 Z', fill: '#b45309', w: 8 },
      { d: 'M -320 320 L 320 320 M -300 390 L 300 390', c: '#7c2d12', w: 6 },
      T('BRASIL', 0, 375, 64, '#fef3c7'),
    ], hullG);
    WB.showNow(hull.strokes); hull.fills.forEach(f => f.el.setAttribute('fill-opacity', 1));
    return { root, headG, armG, hullG, eyeG, eyes, mouth, sweat, tear, armOut, armIn, handG, finger };
  })();
  // água na frente de tudo (sobe no fim)
  const water = WB.mk('path', { d: '', fill: SEA, 'fill-opacity': 0.88, stroke: '#1d4ed8', 'stroke-width': 7 }, WB.overlay);
  const bub = [0, 1, 2, 3, 4].map(() => WB.mk('circle', { r: 12, fill: '#dbeafe', stroke: '#1d4ed8', 'stroke-width': 4, opacity: 0 }, WB.overlay));

  const MOODS = {
    leve: { lid: 0.3, px: 3, py: 1, bi: 2, bo: 0, smile: -1, rot: 0 },
    enfado: { lid: 0.5, px: 7, py: 2, bi: 3, bo: 2, smile: -3, rot: -6 },
    sorriso: { lid: 0.3, px: 4, py: 0, bi: -4, bo: -2, smile: 11, rot: -5 },
    seria: { lid: 0.25, px: 0, py: 0, bi: 6, bo: -1, smile: -4, rot: 0 },
    arregalada: { lid: 0, px: 0, py: -1, bi: -13, bo: -10, smile: -1, rot: 3 },
    pensativa: { lid: 0.05, px: 8, py: -9, bi: -9, bo: -4, smile: -2, rot: 8 },
    estresse: { lid: 0.5, px: 0, py: 5, bi: -9, bo: 4, smile: -7, rot: -9, sweat: 1 },
    revira: { lid: 0.1, px: 5, py: -11, bi: -6, bo: -6, smile: -4, rot: 7 },
    brava: { lid: 0.28, px: 0, py: 0, bi: 12, bo: -4, smile: -9, rot: 0 },
    triste: { lid: 0.35, px: 0, py: 5, bi: -12, bo: 7, smile: -10, rot: 6, tear: 1 },
    cinico: { lid: 0.45, px: 6, py: 0, bi: -8, bo: 6, smile: 9, rot: -8, asym: 1 },
  };
  // [início, humor, mão, aceno]
  const TL = [[0, 'sorriso', 'acena'], [7.3, 'arregalada', 'aponta'], [9.5, 'sorriso', null, 1],
    [10.8, 'triste'], [13.5, 'triste', 'testa'], [15.8, 'seria', 'aponta'], [18.6, 'arregalada'], [21.3, 'estresse', 'testa'],
    [24.0, 'arregalada'], [26.4, 'estresse'], [29.2, 'enfado'], [32.2, 'revira'], [35.2, 'enfado', 'aponta'], [38.0, 'revira'],
    [41.6, 'brava'], [43.9, 'brava', 'aponta'], [47.0, 'revira'], [49.9, 'enfado', null, 1], [52.2, 'pensativa', 'queixo'],
    [55.9, 'seria', 'aponta'], [58.1, 'seria', null, 1], [59.4, 'cinico', 'joinha'], [61.4, 'cinico', 'acena'], [64.2, 'cinico'],
    [66.7, 'cinico', 'joinha'], [67.9, 'revira'], [69.6, 'cinico', 'joinha'], [73.1, 'triste'], [74.5, 'cinico', 'joinha'],
    [76.3, 'seria', 'aponta'], [79.5, 'brava', 'aponta'], [82.2, 'seria', null, 1], [83.4, 'seria', 'aponta'],
    [85.7, 'cinico', 'joinha'], [88.4, 'estresse', 'joinha'], [90.8, 'sorriso', 'joinha']];
  const HAND = { none: { x: 165, y: 400, r: 0, ex: 165, ey: 330 }, queixo: { x: 42, y: 152, r: -12, ex: 178, ey: 345 }, testa: { x: 112, y: -58, r: -28, ex: 222, ey: 165 },
    aponta: { x: 262, y: 40, r: -8, ex: 225, ey: 255 }, acena: { x: 230, y: -60, r: -20, ex: 270, ey: 160 }, joinha: { x: 250, y: 40, r: -90, ex: 260, ey: 230 } };
  const keys = ['lid', 'px', 'py', 'bi', 'bo', 'smile', 'rot', 'asym', 'sweat', 'tear'];
  const isPoint = h => h === 'aponta' || h === 'joinha';
  function stateAt(t) {
    let i = 0;
    while (i + 1 < TL.length && TL[i + 1][0] <= t) i++;
    const cur = TL[i], prev = TL[Math.max(0, i - 1)];
    const u = i === 0 ? 1 : ease(clamp((t - cur[0]) / 0.3));
    const m0 = MOODS[prev[1]], m1 = MOODS[cur[1]], s = {};
    for (const k of keys) s[k] = lerp(m0[k] || 0, m1[k] || 0, u);
    const h0 = HAND[prev[2] || 'none'], h1 = HAND[cur[2] || 'none'], hu = i === 0 ? 1 : ease(clamp((t - cur[0]) / 0.4));
    s.hand = { x: lerp(h0.x, h1.x, hu), y: lerp(h0.y, h1.y, hu), r: lerp(h0.r, h1.r, hu), ex: lerp(h0.ex, h1.ex, hu), ey: lerp(h0.ey, h1.ey, hu) };
    if (cur[2] === 'acena') s.hand.r += Math.sin(t * 9) * 22 * hu;
    s.point = (isPoint(prev[2]) ? 1 - hu : 0) + (isPoint(cur[2]) ? hu : 0);
    s.handOn = (prev[2] ? 1 - hu : 0) + (cur[2] ? hu : 0);
    if (i === 0) s.handOn = cur[2] ? 1 : 0;
    s.nod = cur[3] ? Math.abs(Math.sin((t - cur[0]) * 7)) * 10 * clamp((t - cur[0]) / 0.2) : 0;
    return s;
  }
  function blink(t) {
    let v = 0;
    for (let k = 0; k < 34; k++) {
      const tb = 1.6 + k * 2.9 + 0.7 * Math.sin(k * 1.7), d = Math.abs(t - tb);
      if (d < 0.09) v = Math.max(v, 1 - d / 0.09);
    }
    return v;
  }
  document.getElementById('hand').style.display = 'none';
  const JOLTS = [[5.6, 0.6], [21.5, 0.6], [25.6, 0.5], [47.1, 0.5], [60.4, 0.4], [88.5, 0.7]];
  const BOAT_T = 10.7;
  // afunda: 0 até 18,5 s; desce durante "afundar" e "bem grande"; no "vai dar certo" a água chega no queixo
  function sinkAt(t) {
    if (t < 18.5) return 0;
    if (t < 24) return lerp(0, 50, ease((t - 18.5) / 5.5));
    if (t < 29) return lerp(50, 90, ease((t - 24) / 5));
    if (t < 86.6) return 90;
    return lerp(90, 170, ease(clamp((t - 86.6) / 3.9)));
  }
  function waterTop(t) {
    if (t < BOAT_T) return 2000;
    const rise = lerp(2000, 1745, ease(clamp((t - BOAT_T) / 0.6)));
    return t < 86.6 ? rise : lerp(1745, 1650, ease(clamp((t - 86.6) / 3.9)));
  }
  WB.effect((t) => {
    const s = stateAt(t);
    let op = clamp((envAt(t) - 0.12) * 1.25);
    const talk = op > 0.05 ? 1 : 0;
    const lid = Math.max(s.lid, blink(t));
    ch.eyes.forEach((e, i) => {
      const px = e.ex + s.px, py = 8 + s.py;
      e.pupil.setAttribute('cx', px.toFixed(1)); e.pupil.setAttribute('cy', py.toFixed(1));
      const h = lid * 30, yl = -8 + h;
      e.lid.setAttribute('height', h.toFixed(1));
      e.lidLine.setAttribute('d', lid > 0.06 ? `M ${e.ex - 22} ${yl.toFixed(1)} Q ${e.ex} ${(yl + 3).toFixed(1)} ${e.ex + 22} ${yl.toFixed(1)}` : '');
      const side = i === 0 ? -1 : 1, bi = s.bi + (i === 1 ? s.asym * 14 : 0);
      const ox = e.ex + side * 26, ix = e.ex - side * 24, oy = -36 + s.bo, iy = -38 + bi;
      e.brow.setAttribute('d', `M ${ox} ${oy.toFixed(1)} Q ${e.ex} ${(Math.min(oy, iy) - 7).toFixed(1)} ${ix} ${iy.toFixed(1)}`);
    });
    const sm = s.smile;
    if (op < 0.06) {
      ch.mouth.setAttribute('fill', 'none');
      ch.mouth.setAttribute('d', `M -28 78 Q 0 ${(78 + sm * 1.6).toFixed(1)} 28 78`);
    } else {
      const rx = 28 - 4 * op, top = 70 - 4 * op + Math.max(0, sm) * 0.3, bot = 78 + 34 * op + Math.max(0, sm) * 0.6;
      ch.mouth.setAttribute('fill', MOUTH);
      ch.mouth.setAttribute('d', `M ${(-rx).toFixed(1)} 76 Q 0 ${(2 * top - 76).toFixed(1)} ${rx.toFixed(1)} 76 Q 0 ${(2 * bot - 76).toFixed(1)} ${(-rx).toFixed(1)} 76 Z`);
    }
    ch.sweat.setAttribute('opacity', s.sweat.toFixed(2));
    ch.sweat.setAttribute('transform', `translate(0 ${((t * 30) % 40).toFixed(1)})`);
    ch.tear.setAttribute('opacity', (s.tear * (1 - ((t * 1.2) % 1))).toFixed(2));
    ch.tear.setAttribute('transform', `translate(0 ${(((t * 1.2) % 1) * 90).toFixed(1)})`);
    const rot = s.rot + talk * 1.8 * Math.sin(t * 6.5);
    const dy = s.nod + talk * 2 * Math.sin(t * 11);
    ch.headG.setAttribute('transform', `translate(0 ${dy.toFixed(1)}) rotate(${rot.toFixed(2)} 0 100)`);
    let sx = 0, sy = 0;
    for (const [j0, jd] of JOLTS) if (t > j0 && t < j0 + jd) { const f = 1 - (t - j0) / jd; sx += Math.sin(t * 70) * 10 * f; sy -= Math.abs(Math.sin(t * 20)) * 14 * f; }
    // barco: aparece em BOAT_T e balança
    const bu = clamp((t - BOAT_T) / 0.45), boatOn = t >= BOAT_T;
    ch.hullG.setAttribute('opacity', boatOn ? 1 : 0);
    ch.hullG.setAttribute('transform', `translate(0 ${((1 - backOut(bu)) * 400).toFixed(1)})`);
    const rock = boatOn ? Math.sin(t * 1.7) * 2.5 * bu : 0, sink = sinkAt(t);
    ch.root.setAttribute('transform', `translate(${(540 + sx).toFixed(1)} ${(1300 + sy + sink).toFixed(1)}) rotate(${rock.toFixed(2)} 0 380)`);
    if (s.handOn < 0.02) { ch.armG.setAttribute('opacity', 0); }
    else {
      const h = s.hand;
      ch.armG.setAttribute('opacity', clamp(s.handOn * 2).toFixed(2));
      const d = `M 140 245 L ${h.ex.toFixed(1)} ${h.ey.toFixed(1)} L ${h.x.toFixed(1)} ${(h.y + 22).toFixed(1)}`;
      ch.armOut.setAttribute('d', d); ch.armIn.setAttribute('d', d);
      ch.handG.setAttribute('transform', `translate(${h.x.toFixed(1)} ${h.y.toFixed(1)}) rotate(${h.r.toFixed(1)})`);
      ch.finger.setAttribute('opacity', s.point.toFixed(2));
    }
    // água
    const wy = waterTop(t);
    let d = `M -20 ${wy.toFixed(1)}`;
    for (let x = -20; x <= 1100; x += 40) d += ` L ${x} ${(wy + Math.sin(x / 70 + t * 3) * 10).toFixed(1)}`;
    water.setAttribute('d', d + ' L 1100 1960 L -20 1960 Z');
    const sinking = (t > 18.5 && t < 29) || t > 86.6;
    bub.forEach((b, j) => {
      const ph = (t * 0.9 + j * 0.21) % 1;
      b.setAttribute('cx', (360 + j * 90 + Math.sin(t * 4 + j) * 12).toFixed(1));
      b.setAttribute('cy', (wy + 60 - ph * 140).toFixed(1));
      b.setAttribute('opacity', sinking ? (1 - ph).toFixed(2) : 0);
    });
  });

  // ================= CENAS =================
  // 1) "Bom dia, bom dia, bom dia, bom dia," (0–4,0)
  pg(0, 4.0);
  P(0.05, sun(190, 400, 80), { loop: 'wiggle' });
  P(0.2, mug(880, 760), { loop: 'float' });
  TX(0.4, 'bom dia', 560, 410, 66, INK.orange, -6);
  TX(0.98, 'bom dia!', 520, 580, 82, INK.green, 5);
  TX(1.64, 'BOM DIA!', 520, 760, 100, INK.blue, -4, { anim: 'slam' });
  TX(2.9, 'BOM DIAAA!', 540, 960, 120, INK.purple, 3, { anim: 'slam', loop: 'wiggle' });

  // 2) "bom dia, galera do voto 22." (4,0–10,6)
  pg(4.0, 10.6);
  TX(5.6, 'BOM DIAAAAA!!', 540, 420, 128, INK.orange, -3, { anim: 'slam', loop: 'shake' });
  groupCard(7.4);
  P(9.6, [circ(840, 520, 90, GOLD, '#16a34a', 10), T('22', 840, 556, 110, '#16a34a')], { anim: 'slam', loop: 'pulse' });

  // 3) "Eu fico triste porque eu estou dentro do barco, né? Eu estou dentro desse barco aí." (10,6–15,6)
  pg(10.6, 15.6);
  P(11.2, cloudRain(210, 470, 0.9), { loop: 'float' });
  P(12.3, [boat(560, 780, 1.1), sea(80, 1000, 905)], { loop: 'rock' });
  P(12.5, T('tô dentro do barco...', 560, 370, 84));
  P(13.6, T('(o barco = o Brasil)', 540, 1060, 58, INK.gray), { loop: 'wiggle' });

  // 4) "E esse barco aí, meu irmãozinho," (15,6–18,5)
  pg(15.6, 18.5);
  P(15.9, [boat(540, 760, 1.35), sea(60, 1020, 910)], { loop: 'rock' });
  P(16.4, [{ d: 'M 420 795 L 450 830 L 430 860 L 470 880', c: INK.black, w: 6 }, { d: 'M 470 880 q 30 30 10 60 q -10 20 0 40', c: SEA, w: 10 }], { anim: 'slam' });
  P(16.8, T('meu irmãozinho...', 540, 370, 96, INK.blue));

  // 5) "a probabilidade dele ir afundar, é de afundar," (18,5–24,0)
  pg(18.5, 24.0);
  P(18.9, T('CHANCE DE AFUNDAR', 540, 380, 84, INK.black), { anim: 'slam' });
  {
    const cx = 540, cy = 860, R = 290;
    P(19.2, [{ d: WB.arcPath(cx, cy, R, R, Math.PI, Math.PI * 1.33), c: '#22c55e', w: 46 },
      { d: WB.arcPath(cx, cy, R, R, Math.PI * 1.34, Math.PI * 1.66), c: GOLD, w: 46 },
      { d: WB.arcPath(cx, cy, R, R, Math.PI * 1.67, Math.PI * 2), c: '#ef4444', w: 46 },
      T('pouca', cx - 250, cy + 70, 46, INK.green), T('MUITA', cx + 250, cy + 70, 54, INK.red), circ(cx, cy, 30, '#111827', null, 4)]);
    const needle = WB.mk('path', { d: `M ${cx} ${cy} L ${cx - R + 60} ${cy}`, stroke: '#111827', 'stroke-width': 16, 'stroke-linecap': 'round', opacity: 0 }, cont);
    WB.effect(t => {
      needle.setAttribute('opacity', t > 19.2 ? 1 : 0);
      const u = ease(clamp((t - 20.0) / 1.5)), wob = t > 21.5 ? Math.sin(t * 30) * 4 * Math.exp(-(t - 21.5)) + Math.sin(t * 9) * 2 : 0;
      needle.setAttribute('transform', `rotate(${(u * 165 + wob).toFixed(2)} ${cx} ${cy})`);
    });
  }
  stamp(21.5, 'AFUNDAR!', 540, 1050, 100, INK.red, -4, { loop: 'shake' });

  // 6) "bem, bem, bem grande, viu? Bem grande, bem grande." (24,0–29,1)
  pg(24.0, 29.1);
  TX(24.18, 'BEM', 230, 400, 90, INK.red, -8, { anim: 'slam' });
  TX(24.62, 'BEM', 540, 400, 104, INK.red, 0, { anim: 'slam' });
  TX(25.14, 'BEM', 850, 400, 118, INK.red, 8, { anim: 'slam' });
  TX(25.66, 'GRANDE!', 540, 580, 150, INK.red, -3, { anim: 'slam', loop: 'shake' });
  P(26.4, boat(540, 820, 1.0, false), { loop: 'sink' });
  P(26.6, [{ d: 'M 40 900 L 1040 900 L 1040 1230 L 40 1230 Z', fill: '#bfdbfe', c: 'none' }, sea(40, 1040, 900)]);
  P(27.2, bubbles(540, 860), { loop: 'float' });
  P(28.0, T('glub glub...', 840, 780, 70, INK.blue), { loop: 'wiggle' });

  // 7) "Tá aí, os ricão já estão comemorando, já. A Bolsa, já tá todo mundo comemorando," (29,1–35,0)
  pg(29.1, 35.0);
  P(29.6, T('os RICÃO comemorando', 540, 360, 84, INK.green), { anim: 'slam' });
  P(30.3, richMan(290, 760, 0.95), { loop: 'bounce' });
  P(31.2, champagne(470, 760), { loop: 'wiggle' });
  P(31.3, confetti(40, 420, 1040, 1100, 46, 5), { loop: 'float' });
  P(32.5, [box(620, 520, 380, 380, 20, '#f0fdf4', null, 6), chartUp(660, 560, 960, 860)], { anim: 'slam' });
  P(33.0, T('BOLSA', 810, 980, 84, INK.green), { anim: 'slam', loop: 'pulse' });
  P(33.9, T('tim-tim!', 290, 1110, 64, INK.purple), { loop: 'wiggle' });

  // 8) "o dólar já tá baixando, né? Os juros estão baixando também, quer dizer," (35,0–41,5)
  pg(35.0, 41.5);
  P(35.3, T('tá baixando!', 540, 360, 96, INK.blue), { anim: 'slam' });
  P(35.5, bill(290, 640, 1.2), { loop: 'wiggle' });
  P(36.6, [arrowV(290, 740, 930, INK.red), T('DÓLAR', 290, 1040, 80, INK.green)], { anim: 'slam' });
  P(38.3, [circ(790, 640, 120, '#fef3c7', null, 7), T('%', 790, 690, 160, INK.purple)], { loop: 'wiggle' });
  P(39.4, [arrowV(790, 780, 930, INK.red), T('JUROS', 790, 1040, 80, INK.purple)], { anim: 'slam' });

  // 9) "os banqueiros já estão comemorando, já estão muito satisfatórios o resultado..." (41,5–51,7)
  pg(41.5, 51.7);
  P(41.9, T('BANQUEIROS', 540, 360, 110, INK.green), { anim: 'slam' });
  P(42.1, [moneyBag(200, 900, 0.9), moneyBag(880, 900, 0.9), moneyBag(330, 980, 0.6), moneyBag(750, 990, 0.6)]);
  P(42.4, richMan(540, 640, 1.05), { loop: 'hop' });
  [[43.2, 150, 520, 0.6], [43.5, 920, 470, 0.55], [43.8, 300, 400, 0.5], [44.1, 800, 620, 0.6], [44.4, 120, 760, 0.5]].forEach(([bt, x, y, s], i) =>
    P(bt, bill(x, y, s), { loop: 'fall', ph: i * 0.7 }));
  stamp(47.1, 'MUITO SATISFATÓRIO!', 540, 1080, 70, INK.green, -4, { loop: 'shake', bg: '#f0fdf4' });
  P(49.9, T('ahh...', 840, 560, 70, INK.green), { loop: 'pulse' });

  // 10) "Será que essa satisfação também vem pro outro lado? O pobre, o lado do pobre, tá?" (51,7–59,3)
  pg(51.7, 59.3);
  P(52.3, T('E O OUTRO LADO??', 540, 360, 96, INK.purple), { anim: 'slam' });
  P(52.6, { d: 'M 540 450 L 540 1110', c: INK.gray, w: 6 });
  P(53.3, [plate(280, 900, true), T('satisfação', 280, 600, 60, INK.green), T('hmm!', 280, 700, 70, INK.orange)], { loop: 'bounce' });
  P(56.2, [poorMan(800, 640, 0.8), plate(800, 960, false)], { anim: 'fly', fx: 400 });
  P(56.8, fly(760, 920), { loop: 'float' });
  P(57.1, T('e o POBRE?', 800, 1100, 72, INK.red), { anim: 'slam' });
  TX(58.2, '?', 980, 520, 150, INK.red, 12, { anim: 'slam', loop: 'shake' });

  // 11) "Mas vamos lá, Bolsonaro! Vamos lá, vamos pra cima... Deus, pátria e família. Vamos lá, vamos ver." (59,3–69,5)
  pg(59.3, 69.5);
  P(59.7, T('VAMOS LÁ, BOLSONARO!', 540, 360, 84, INK.green), { anim: 'slam', loop: 'pulse' });
  stamp(60.4, 'modo ironia: ON', 540, 480, 52, INK.purple, -5, { bg: '#faf5ff' });
  P(61.4, pompom(150, 620, '#16a34a', GOLD), { loop: 'hop' });
  P(61.6, pompom(930, 620, GOLD, '#16a34a'), { loop: 'hop', ph: 0.3 });
  P(63.1, [arrowV(400, 760, 600, INK.green), arrowV(680, 760, 600, INK.green), T('PRA CIMA!', 540, 720, 96, INK.green)], { anim: 'slam', loop: 'bounce' });
  P(64.35, [heaven(200, 960), T('Deus', 200, 1100, 60)], { loop: 'float' });
  P(65.69, [...brFlag(445, 880, 190), T('Pátria', 540, 1100, 60)], { loop: 'wiggle' });
  P(66.81, [family(870, 1030), T('Família', 870, 1100, 60)], { loop: 'bounce' });
  P(68.0, T('vamos ver...', 540, 840, 64, INK.gray), { loop: 'wiggle' });

  // 12) "Eu queria que ele ganhasse, tô torcendo pra que ele ganhe. Apesar de eu estar dentro desse barco..." (69,5–76,3)
  pg(69.5, 76.3);
  P(70.0, foamFinger(290, 760), { loop: 'bounce' });
  P(71.8, T('TÔ TORCENDO!', 540, 370, 110, INK.green), { anim: 'slam', loop: 'shake' });
  P(73.2, [boat(770, 780, 0.75), sea(570, 1000, 865)], { loop: 'rock' });
  P(73.8, T('apesar do barco...', 770, 1010, 60, INK.gray));
  P(75.2, T('vai, ganha!', 290, 1090, 64, INK.green), { loop: 'wiggle' });

  // 13a) "Tá certo? Aí vocês vão ver o que é realmente o bolsonarismo, tá certo?" (76,3–83,3)
  pg(76.3, 83.3);
  P(77.1, T('AÍ VOCÊS VÃO VER...', 540, 370, 92, INK.black), { anim: 'slam' });
  P(78.1, bigEye(540, 680), { loop: 'pulse' });
  P(80.4, T('o que é REALMENTE', 540, 960, 76, INK.purple));
  P(81.0, T('o bolsonarismo', 540, 1080, 96, INK.black), { anim: 'slam', loop: 'wiggle' });

  // 13b) "Aí vocês vão sentir, beleza? Pura!" (83,3–86,6)
  pg(83.3, 86.6);
  P(83.6, T('VÃO SENTIR NA PELE!', 540, 380, 92, INK.red), { anim: 'slam', loop: 'shake' });
  P(84.5, bandaid(540, 650), { rot: -15, rx: 540, ry: 650, anim: 'slam' });
  TX(84.6, 'AI!', 820, 560, 90, INK.red, 12, { anim: 'slam' });
  TX(85.75, 'BELEZA?', 290, 960, 92, INK.blue, -6, { anim: 'slam' });
  TX(86.05, 'PURA!', 790, 980, 110, INK.green, 6, { anim: 'slam', loop: 'wiggle' });

  // 14) "Vamo pra cima, gente, vamo pra cima, vai dar certo, vai dar certo!" (86,6–90,8)
  pg(86.6, 90.8);
  P(86.8, T('PRA CIMA, GENTE!', 540, 380, 96, INK.green), { anim: 'slam' });
  P(86.9, arrowV(150, 820, 520, INK.green, 20), { loop: 'bounce' });
  P(87.0, [boat(560, 800, 1.05)], { loop: 'sink' });
  P(87.0, [{ d: 'M 40 900 L 1040 900 L 1040 1250 L 40 1250 Z', fill: '#bfdbfe', c: 'none' }, sea(40, 1040, 900)]);
  P(87.6, bubbles(560, 880), { loop: 'float' });
  P(88.5, T('VAI DAR CERTO!', 580, 560, 104, INK.green), { anim: 'slam', loop: 'shake' });

  // 15) Chamada para seguir (90,8–fim)
  pg(90.8, END + 1);
  {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 470, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 560, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@caderno_amarelo', 380, 560 + 190 * 0.62, 84, INK.black, g).strokes);
    animate(g, 90.95, { loop: 'float' });
  }
};
