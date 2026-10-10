// Meme "dúvidas pro Vorcaro" no Caderno Amarelo, FORMATO DE CENAS.
// Em vez de desenhos soltos na folha, cada trecho do áudio vira uma cena completa com corte seco:
//  - CELA: o Vorcaro de uniforme ouvindo o áudio no celular (reage, sua, sonha em ser solto);
//  - COZINHA: ela gravando o áudio (a boca segue a voz original);
//  - cenas de corte (desenhadas no papel do caderno) ilustrando cada pergunta dela.
// Legenda manuscrita em faixa amarela no alto. Áudio original (uma voz só, a dela); risada no fim.
// Todos os tempos são segundos do áudio original (narration.mp3 começa junto).
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const r1 = n => Math.round(n * 10) / 10;
  const MOUTH = '#6b1f2b';
  const ellipse = (cx, cy, rx, ry) => WB.arcPath(cx, cy, rx, ry, 0, Math.PI * 2, 48) + ' Z';
  const backOut = u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
  document.getElementById('hand').style.display = 'none';

  // energia do áudio original, 20 valores por segundo (0–9)
  const ENV = '000999889717560573987527752783753787746678843644706384466777777704758955816882878992785657172577897477520999874663367968096846700788820255319587883877625799977887635488783768706658367657789886867199875647509986358987459997178688426267730776787339966547984540299665788865789946788055067777871000797568651587654998506947757756528874981566256788662881898776498713139982007948779864857878645899388309828973730860693887728358816995420599666683789849899700993487689810584858507676653864200333100000032996785662867679722667884055088408656973788995875645999850199485746548778998476068629878757777608975687799755274377777742099895766608817997766077687178986699740079818986878718608864677799866075777589969761888866898878858863002686301046371994545659972087363895868868877735668768997620058987886399859658754541265449997165875875988705691528945099975894865784098630799376009738599804556247868740688898935969863995177687611089884687246477551796088564765699574456289700099610873074100023420000000398996999870998440525628745651687777812772076663466277875788735869956356678747600867686646468799998477375497054509938767994686319878744574478707853299599746130875637760550146999766665089288976777377283478777648705698599755960888408877885447999630687798479910887777705664717218610049969998710686476268872546465986736750271039598395774887876667578683842884097886578606767366678759956896847995878551599886520000033310000855386538827453776876610787959776375546478440095086429198706887103089974776850561789998564437527987607764695755873584563787549797929769731786089972091887787078657787865660551550008767887294978887316986787647726753998499981746732094978887599665576530865697708878667686555389886753079820397759999335566899463510897635587563547703999099859488602999657078977644697367756760000033410000048997886476666576561775876400398066307336299655685775548630076917998278676478886198600089886577650721008510599643758845246352888466279877368737377657744462899973989735698877766648877752699753798377627777762584099407873689999814998765888866620688877467798006670784567667521089992187798600786467400406638934899988670997606835676647736386776669406720774568887559788363668871988886895999605747267464673785003343100000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  const FALA_FIM = 109.9;
  const TOTAL = WB.timeline.total;

  // ---------------- montagem de itens ----------------
  const T = (text, x, y, size, c, anchor) => ({ text, x, y, size, c, anchor });
  function build(specs, parent) {
    const g = WB.mk('g', {}, parent);
    const strokes = [], fills = [];
    for (const s of [specs].flat(8)) {
      if (!s) continue;
      if (s.text !== undefined) {
        strokes.push(...WB.textStrokes(s.text, s.x, s.y, s.size, s.c || INK.black, g, s.anchor || 'middle').strokes);
        continue;
      }
      const fillEl = s.fill ? WB.mk('path', { d: s.d, fill: s.fill, 'fill-opacity': 0, stroke: 'none', ...(s.fo ? { opacity: s.fo } : {}) }, g) : null;
      const st = s.c === 'none' ? [] : WB.strokePath(s.d, s.c || INK.black, s.w || 7, g, s.op ? { opacity: s.op } : {});
      if (fillEl) fills.push({ el: fillEl, st });
      strokes.push(...st);
    }
    return { g, strokes, fills };
  }
  const showAll = (it) => { WB.showNow(it.strokes); it.fills.forEach(f => f.el.setAttribute('fill-opacity', 1)); return it; };
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
      else if (kind === 'fly') { const v = ease(clamp(tt / 0.5)); dx = (o.fx || 0) * (1 - v); dy = (o.fy || 0) * (1 - v); rot = (o.fr || 0) * (1 - v); }
      else if (kind === 'fade') { op = clamp(tt / 0.25); }
      else { k = backOut(clamp(tt / 0.38)); op = clamp(tt / 0.12); }
      if (o.until !== undefined && t > o.until) op *= clamp(1 - (t - o.until) / 0.15);
      const ts = tt + ph;
      if (loop === 'shake') rot += Math.sin(ts * 40) * 5 * Math.exp(-tt * 2);
      if (loop === 'tremble') { dx += Math.sin(ts * 47) * 4; rot += Math.sin(ts * 31) * 2; }
      if (loop === 'wiggle') rot += Math.sin(ts * 5) * 3;
      if (loop === 'bounce') dy -= Math.abs(Math.sin(ts * 5)) * 16;
      if (loop === 'hop') dy -= Math.abs(Math.sin(ts * 8)) * 22;
      if (loop === 'float') dy += Math.sin(ts * 2.4) * 10;
      if (loop === 'fall') { dy += ((ts * 420) % 800) - 60; }
      if (loop === 'pulse') k *= 1 + 0.07 * Math.sin(ts * 9);
      if (loop === 'spin') rot += Math.sin(ts * 9) * 8;
      if (loop === 'turn') rot += tt * 260;
      if (loop === 'ring') { rot += Math.sin(ts * 50) * 9 * (Math.sin(ts * 3) > 0 ? 1 : 0.15); }
      g.setAttribute('opacity', op.toFixed(3));
      g.setAttribute('transform', `translate(${(ox + dx).toFixed(1)} ${(oy + dy).toFixed(1)}) rotate(${rot.toFixed(2)}) ` +
        `scale(${k.toFixed(3)}) translate(${-ox} ${-oy})`);
    });
  }
  // P(t, specs, opções): item aparece em t com "pop"
  function P(bt, specs, o = {}) {
    let parent = o.parent || cont;
    if (o.rot) parent = WB.mk('g', { transform: `rotate(${o.rot} ${o.rx ?? 540} ${o.ry ?? 960})` }, parent);
    const it = showAll(build(specs, parent));
    animate(it.g, bt, o);
    return it;
  }
  const TX = (bt, text, x, y, size, c, rot = 0, o = {}) => P(bt, T(text, x, y, size, c), Object.assign({ rot, rx: x, ry: y - size * 0.3 }, o));

  // ---------------- cenas (cortes secos) ----------------
  let cont = null;
  function shot(wins) {
    const g = WB.mk('g', {}, WB.layer);
    const inner = WB.mk('g', {}, g);
    WB.effect(t => {
      const w = wins.find(([a, b]) => t >= a && t < b);
      if (!w) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      const k = 1.04 - 0.04 * ease(clamp((t - w[0]) / 0.25));
      inner.setAttribute('transform', `translate(540 960) scale(${k.toFixed(4)}) translate(-540 -960)`);
    });
    cont = inner;
    return inner;
  }

  // ---------------- formas ----------------
  const box = (x, y, w, h, r, fill, c, wd) => ({ d: WB.roundRectPath(x, y, w, h, r), fill, c, w: wd || 6 });
  const circ = (x, y, r, fill, c, wd) => ({ d: WB.circlePath(x, y, r), fill, c, w: wd || 6 });
  const S = (x, y, s) => (dx, dy) => `${r1(x + dx * s)} ${r1(y + dy * s)}`;
  const rect = (x0, y0, x1, y1, fill, c = 'none', w = 6) => ({ d: `M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`, fill, c, w });
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
      else if (i % 3 === 1) out.push({ d: `M ${r1(x)} ${r1(y)} l ${r1(Math.cos(a) * 16)} ${r1(Math.sin(a) * 16)}`, c, w: 9 });
      else out.push({ d: `M ${r1(x)} ${r1(y)} q 10 -14 20 0 q 10 14 20 0`, c, w: 6 });
    }
    return out;
  }
  const heart = (x, y, s, fill = '#ef4444') => ({ d: `M ${x} ${y + 30 * s} C ${x - 60 * s} ${y - 10 * s} ${x - 30 * s} ${y - 50 * s} ${x} ${y - 20 * s} C ${x + 30 * s} ${y - 50 * s} ${x + 60 * s} ${y - 10 * s} ${x} ${y + 30 * s} Z`, fill, w: 5 });
  const star = (x, y, r, fill = '#facc15') => {
    let d = '';
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? ' L ' : 'M ') + r1(x + Math.cos(a) * rr) + ' ' + r1(y + Math.sin(a) * rr); }
    return { d: d + ' Z', fill, w: 5 };
  };
  const arrow = (x1, y1, x2, y2, c, w = 12) => [{ d: `M ${x1} ${y1} L ${x2} ${y2}`, c, w }, { d: WB.arrowHead(x2, y2, Math.atan2(y2 - y1, x2 - x1), 40), c, w }];
  const squiggle = (x, y, len, c = '#374151', w = 6) => {
    let d = `M ${x} ${y}`;
    for (let i = 0; i < len / 30; i++) d += ` q 7 -14 15 0 q 7 14 15 0`;
    return { d, c, w };
  };
  function phoneShape(x, y, w, h, rot, screen = '#bfdbfe') {
    const g = [box(x - w / 2, y - h / 2, w, h, w * 0.16, '#1f2937', null, 5), box(x - w / 2 + 8, y - h / 2 + 14, w - 16, h - 30, 6, screen, 'none')];
    return rot ? { rotWrap: rot, x, y, items: g } : g;
  }
  const phoneAt = (bt, x, y, s, rot, o = {}) => P(bt, phoneShape(x, y, 70 * s, 130 * s), Object.assign({ rot, rx: x, ry: y }, o));
  function pillBottle(x, y, s, label, cap = '#ef4444', body = '#ffffff') {
    const p = S(x, y, s);
    return [box(x - 60 * s, y - 150 * s, 120 * s, 40 * s, 8, cap), box(x - 70 * s, y - 112 * s, 140 * s, 220 * s, 22 * s, body),
      box(x - 70 * s, y - 60 * s, 140 * s, 90 * s, 4, '#fde68a', null, 4), T(label, x, y + 2 * s, 30, INK.black),
      { d: `M ${p(-40, 60)} L ${p(40, 60)}`, c: '#9ca3af', w: 4 }];
  }
  function mug(x, y, s, fill = '#ef4444', steam = true) {
    const p = S(x, y, s);
    return [{ d: `M ${p(40, -60)} Q ${p(90, -60)} ${p(90, -20)} Q ${p(90, 20)} ${p(40, 20)}`, w: 12 * s + 4 },
      box(x - 50 * s, y - 90 * s, 100 * s, 130 * s, 16 * s, fill),
      steam ? { d: `M ${p(-20, -110)} q -15 -25 0 -50 q 15 -25 0 -50 M ${p(20, -110)} q -15 -25 0 -50 q 15 -25 0 -50`, c: '#9ca3af', w: 6 } : null];
  }
  function moneyBag(x, y, s, fill = '#a3a370') {
    const p = S(x, y, s);
    return [{ d: `M ${p(-30, -80)} Q ${p(-110, 0)} ${p(-90, 70)} Q ${p(0, 110)} ${p(90, 70)} Q ${p(110, 0)} ${p(30, -80)} Z`, fill: '#d6b97a', w: 6 },
      { d: `M ${p(-34, -80)} L ${p(-50, -120)} L ${p(50, -120)} L ${p(34, -80)} Z`, fill: '#d6b97a', w: 6 }, { d: `M ${p(-40, -82)} L ${p(40, -82)}`, c: '#7c5a1e', w: 8 },
      T('$', x, y + 40 * s, 110 * s, '#15803d')];
  }
  function toilet(x, y, s = 1) {
    const p = S(x, y, s);
    return [
      { d: `M ${p(-45, 300)} L ${p(-55, 362)} L ${p(55, 362)} L ${p(45, 300)}`, fill: '#ffffff', w: 6 },
      { d: `M ${p(-106, 148)} Q ${p(-92, 282)} ${p(-40, 302)} L ${p(40, 302)} Q ${p(92, 282)} ${p(106, 148)} Z`, fill: '#ffffff', w: 6 },
      box(x - 72 * s, y, 144 * s, 112 * s, 14, '#ffffff'),
      { d: ellipse(x, y + 142 * s, 112 * s, 34 * s), fill: '#e6eef5', w: 6 },
    ];
  }
  function cloud(cx, cy, rx, ry, fill = '#ffffff', c) { return { d: WB.cloudPath(cx, cy, rx, ry), fill, c, w: 7 }; }
  function thought(cx, cy, rx, ry, dots) {
    return [...dots.map(([x, y, r]) => circ(x, y, r, '#ffffff', null, 5)), cloud(cx, cy, rx, ry)];
  }
  function plane(x, y, s, fill = '#e0f2fe') {
    const p = S(x, y, s);
    return [{ d: `M ${p(-110, 0)} Q ${p(-110, -22)} ${p(-80, -22)} L ${p(100, -22)} Q ${p(140, -10)} ${p(140, 0)} Q ${p(140, 14)} ${p(100, 22)} L ${p(-80, 22)} Q ${p(-110, 22)} ${p(-110, 0)} Z`, fill, w: 5 },
      { d: `M ${p(-10, -18)} L ${p(-60, -90)} L ${p(-20, -90)} L ${p(40, -18)} Z M ${p(-10, 18)} L ${p(-60, 90)} L ${p(-20, 90)} L ${p(40, 18)} Z M ${p(-100, -18)} L ${p(-130, -60)} L ${p(-105, -60)} L ${p(-75, -18)} Z`, fill: '#93c5fd', w: 5 },
      { d: `M ${p(60, -8)} L ${p(70, -8)} M ${p(30, -8)} L ${p(40, -8)} M ${p(0, -8)} L ${p(10, -8)}`, c: '#1e3a8a', w: 6 }];
  }
  function discoBall(x, y, r) {
    const out = [{ d: `M ${x} ${y - r - 140} L ${x} ${y - r}`, c: '#6b7280', w: 5 }, circ(x, y, r, '#cbd5e1', null, 7)];
    let d = '';
    for (let k = -2; k <= 2; k++) d += `M ${r1(x - r * Math.cos(Math.asin(k / 3)))} ${r1(y + r * k / 3)} L ${r1(x + r * Math.cos(Math.asin(k / 3)))} ${r1(y + r * k / 3)} `;
    out.push({ d, c: '#64748b', w: 4 });
    for (let k = -2; k <= 2; k++) out.push({ d: ellipse(x, y, Math.abs(k) * r / 3 + 1, r), c: '#64748b', w: 4 });
    return out;
  }
  // bonequinho simples (cabeça + corpo), para multidões
  function mini(x, y, s, shirt, hair = '#3f2a1d', skin = '#e8bf9a', o = {}) {
    const p = S(x, y, s);
    const out = [];
    if (o.dress) out.push({ d: `M ${p(-34, 50)} L ${p(-60, 170)} L ${p(60, 170)} L ${p(34, 50)} Z`, fill: shirt, w: 5 });
    else out.push(box(x - 38 * s, y + 46 * s, 76 * s, 110 * s, 18 * s, shirt, null, 5));
    if (o.longHair) out.push({ d: `M ${p(-50, 0)} Q ${p(-60, 70)} ${p(-40, 70)} L ${p(40, 70)} Q ${p(60, 70)} ${p(50, 0)} Z`, fill: hair, w: 4 });
    out.push(circ(x, y, 48 * s, skin, null, 5));
    if (o.bald) out.push({ d: `M ${p(-46, -6)} Q ${p(-50, -24)} ${p(-38, -26)} M ${p(46, -6)} Q ${p(50, -24)} ${p(38, -26)}`, c: '#d1d5db', w: 8 });
    else out.push({ d: `M ${p(-48, -4)} Q ${p(-50, -54)} ${p(0, -52)} Q ${p(50, -54)} ${p(48, -4)} Q ${p(30, -30)} ${p(0, -28)} Q ${p(-30, -30)} ${p(-48, -4)} Z`, fill: hair, w: 4 });
    out.push(circ(x - 16 * s, y + 2 * s, 5 * s + 1, '#111', 'none'), circ(x + 16 * s, y + 2 * s, 5 * s + 1, '#111', 'none'));
    out.push({ d: `M ${p(-16, 20)} Q ${p(0, o.sad ? 12 : 34)} ${p(16, 20)}`, w: 4 });
    if (o.glasses) out.push(circ(x - 16 * s, y + 2 * s, 14 * s, null, null, 4), circ(x + 16 * s, y + 2 * s, 14 * s, null, null, 4));
    if (o.mask) out.push({ d: `M ${p(-50, -10)} L ${p(50, -10)} L ${p(50, 14)} L ${p(-50, 14)} Z`, fill: '#111827', w: 4 }, circ(x - 16 * s, y + 2 * s, 7 * s, '#ffffff', 'none'), circ(x + 16 * s, y + 2 * s, 7 * s, '#ffffff', 'none'));
    if (o.collar) out.push(box(x - 12 * s, y + 46 * s, 24 * s, 14 * s, 3, '#ffffff', null, 3));
    return out;
  }

  // ---------------- rostos e corpos ----------------
  const MOODS = {
    leve: { lid: 0.3, px: 6, py: 1, bi: 2, bo: 0, smile: -1, rot: 0 },
    sorriso: { lid: 0.2, px: 6, py: 0, bi: -6, bo: -2, smile: 11, rot: -4 },
    malicia: { lid: 0.42, px: 9, py: 0, bi: 4, bo: -8, smile: 7, rot: -6, asym: 1 },
    euforia: { lid: 0, px: 4, py: -6, bi: -14, bo: -10, smile: 12, rot: 6 },
    arregalada: { lid: 0, px: 6, py: -1, bi: -13, bo: -10, smile: -1, rot: 3 },
    pensativa: { lid: 0.05, px: 6, py: -9, bi: -9, bo: -4, smile: -2, rot: 6 },
    estresse: { lid: 0.4, px: 9, py: 3, bi: -9, bo: 4, smile: -6, rot: -6, sweat: 1 },
    revira: { lid: 0.1, px: 5, py: -12, bi: -6, bo: -6, smile: -4, rot: 7 },
    confusa: { lid: 0.1, px: 7, py: -4, bi: -9, bo: -2, smile: -4, rot: 8, asym: 1 },
    triste: { lid: 0.35, px: 4, py: 6, bi: -12, bo: 8, smile: -9, rot: -5 },
    zen: { lid: 0.92, px: 0, py: 3, bi: -2, bo: 0, smile: 6, rot: 0 },
  };
  const keys = ['lid', 'px', 'py', 'bi', 'bo', 'smile', 'rot', 'asym', 'sweat'];
  const moodOf = (name) => { const s = {}; for (const k of keys) s[k] = MOODS[name][k] || 0; return s; };
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
    const k0 = Math.floor((t - off) / 2.7);
    for (let k = k0 - 1; k <= k0 + 1; k++) {
      const tb = off + k * 2.7 + 0.6 * Math.sin(k * 1.7), d = Math.abs(t - tb);
      if (d < 0.09) v = Math.max(v, 1 - d / 0.09);
    }
    return v;
  }
  let FID = 0;
  function makeFace(headG, cfg) {
    const id = 'f' + (FID++);
    showAll(build([cfg.back || [], { d: ellipse(-98, 12, 15, 24), fill: cfg.skin, w: 5 }, { d: ellipse(98, 12, 15, 24), fill: cfg.skin, w: 5 },
      { d: ellipse(0, 0, 100, 118), fill: cfg.skin, w: 7 }, cfg.under || [], { d: 'M -4 26 Q -14 46 0 50 Q 9 51 12 46', w: 5, c: '#5a3a22' }, cfg.hair], headG));
    const dyn = WB.mk('g', {}, headG);
    const eyes = [-38, 38].map((ex, i) => {
      WB.mk('path', { d: ellipse(ex, 8, 22, 17), fill: '#ffffff', stroke: INK.black, 'stroke-width': 5 }, dyn);
      const cp = WB.mk('clipPath', { id: `eye${i}${id}` }, dyn);
      WB.mk('path', { d: ellipse(ex, 8, 21, 16) }, cp);
      const clip = `url(#eye${i}${id})`;
      return {
        ex,
        pupil: WB.mk('circle', { cx: ex, cy: 8, r: 9, fill: '#1f1410', 'clip-path': clip }, dyn),
        lid: WB.mk('rect', { x: ex - 24, y: -10, width: 48, height: 0, fill: cfg.skin, 'clip-path': clip }, dyn),
        lidLine: WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': 5, 'stroke-linecap': 'round', 'clip-path': clip }, dyn),
        brow: WB.mk('path', { d: '', fill: 'none', stroke: cfg.brow, 'stroke-width': 10, 'stroke-linecap': 'round' }, dyn),
      };
    });
    const mouth = WB.mk('path', { d: '', fill: MOUTH, stroke: INK.black, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, dyn);
    if (cfg.extra) showAll(build(cfg.extra, dyn));
    const sweat = WB.mk('path', { d: 'M 86 -60 q -14 24 0 36 q 14 -12 0 -36 Z', fill: '#93c5fd', stroke: INK.black, 'stroke-width': 4, opacity: 0 }, dyn);
    return function update(t, s, op, look = 1) {
      const lid = Math.max(s.lid, cfg.noBlink ? 0 : blink(t, cfg.blink || 1.3));
      eyes.forEach((e, i) => {
        e.pupil.setAttribute('cx', (e.ex + s.px * look).toFixed(1)); e.pupil.setAttribute('cy', (8 + s.py).toFixed(1));
        const h = lid * 34, yl = -9 + h;
        e.lid.setAttribute('height', h.toFixed(1));
        e.lidLine.setAttribute('d', lid > 0.06 ? `M ${e.ex - 24} ${yl.toFixed(1)} Q ${e.ex} ${(yl + 3).toFixed(1)} ${e.ex + 24} ${yl.toFixed(1)}` : '');
        const side = i === 0 ? -1 : 1, bi = s.bi + (i === 1 ? (s.asym || 0) * 14 : 0);
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
      sweat.setAttribute('opacity', (s.sweat || 0).toFixed(2));
      sweat.setAttribute('transform', `translate(0 ${((t * 30) % 40).toFixed(1)})`);
    };
  }
  // braço do ombro → cotovelo → mão
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
      const mx = sh[0] + (el[0] - sh[0]) * 0.55, my = sh[1] + (el[1] - sh[1]) * 0.55;
      const sd = `M ${r1(sh[0])} ${r1(sh[1])} L ${r1(mx)} ${r1(my)}`;
      slO.setAttribute('d', sd); slI.setAttribute('d', sd);
      hand.setAttribute('transform', `translate(${r1(h[0])} ${r1(h[1])}) rotate(${r1(rot || 0)})`);
      finger.setAttribute('opacity', (point || 0).toFixed(2));
    };
  }
  const lerpP = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const poseLerp = (P0, P1, u) => ({ el: lerpP(P0.el, P1.el, u), h: lerpP(P0.h, P1.h, u), r: lerp(P0.r || 0, P1.r || 0, u), pt: lerp(P0.pt || 0, P1.pt || 0, u) });

  // paletas
  const V_SKIN = '#f0c09c', V_HAIR = '#1c1410', BEARD = '#5c4434';
  const VFACE = {
    skin: V_SKIN, brow: V_HAIR, blink: 1.7,
    under: [{ d: 'M -98 10 Q -96 112 -40 128 Q 0 140 40 128 Q 96 112 98 10 Q 86 62 58 70 Q 30 54 0 58 Q -30 54 -58 70 Q -86 62 -98 10 Z', fill: BEARD, w: 4 }],
    hair: [{ d: 'M -104 -16 Q -114 -126 -30 -156 Q 64 -182 110 -92 Q 118 -60 104 -16 Q 98 -80 52 -98 Q 0 -112 -52 -98 Q -92 -82 -104 -16 Z', fill: V_HAIR, w: 6 },
      { d: 'M -64 -132 Q 0 -158 74 -124 M -44 -114 Q 20 -134 86 -104', c: '#57534e', w: 4 }],
    extra: [{ d: 'M -42 60 Q -20 46 0 54 Q 20 46 42 60 Q 20 66 0 60 Q -20 66 -42 60 Z', fill: V_HAIR, w: 4 }],
  };
  const E_SKIN = '#c98a5e', E_HAIR = '#2b1a12';
  const EFACE = {
    skin: E_SKIN, brow: E_HAIR, blink: 0.9,
    back: [{ d: WB.cloudPath(0, -60, 150, 120, 13), fill: E_HAIR, w: 6 }, circ(0, -190, 62, E_HAIR, null, 6)],
    under: [circ(-62, 44, 16, '#f9a8a8', 'none'), circ(62, 44, 16, '#f9a8a8', 'none'), circ(-100, 50, 16, null, '#eab308', 6), circ(100, 50, 16, null, '#eab308', 6)],
    hair: [{ d: 'M -106 -6 Q -122 -124 0 -140 Q 122 -124 106 -6 Q 96 -70 56 -82 Q 34 -58 0 -78 Q -34 -58 -56 -82 Q -96 -70 -106 -6 Z', fill: E_HAIR, w: 6 },
      { d: 'M -40 -132 q 10 -18 22 0 M 10 -136 q 10 -18 22 0 M 52 -120 q 10 -18 22 0', c: '#57402f', w: 4 }],
  };
  // roupas: costas, pernas, tronco (coordenadas locais; cabeça em 0,0)
  const LEGS = (pants, shoe = '#1f2937') => [
    { d: 'M -40 420 L -46 760 M 40 420 L 46 760', w: 50 }, { d: 'M -40 420 L -46 760 M 40 420 L 46 760', c: pants, w: 38 },
    { d: ellipse(-60, 772, 42, 20), fill: shoe, w: 5 }, { d: ellipse(60, 772, 42, 20), fill: shoe, w: 5 }];
  const TORSO = 'M -95 165 Q -110 300 -88 440 L 88 440 Q 110 300 95 165 Q 0 140 -95 165 Z';
  const OUTFITS = {
    preso: { sleeve: '#f97316', legs: LEGS('#f97316', '#e5e7eb'), torso: [{ d: TORSO, fill: '#f97316', w: 7 }, { d: 'M -30 160 L 0 210 L 30 160', w: 5 },
      box(-82, 230, 70, 44, 6, '#ffffff', null, 4), T('0071', -47, 264, 30, INK.black), { d: 'M 0 210 L 0 430', c: '#c2410c', w: 5 }] },
    terno: { sleeve: '#1e3a8a', legs: LEGS('#1e3a8a'), torso: [{ d: TORSO, fill: '#1e3a8a', w: 7 }, { d: 'M -46 158 L 0 280 L 46 158 Z', fill: '#ffffff', w: 5 },
      { d: 'M -10 178 L 10 178 L 16 255 L 0 282 L -16 255 Z', fill: '#dc2626', w: 4 }, { d: 'M -46 158 L -20 300 M 46 158 L 20 300', c: '#93c5fd', w: 4 }] },
    vampiro: { sleeve: '#111827', back: [{ d: 'M -110 170 L -240 770 L 240 770 L 110 170 Z', fill: '#111827', w: 6 }, { d: 'M -100 190 L -205 740 L 205 740 L 100 190 Z', fill: '#b91c1c', c: 'none' },
      { d: 'M -96 150 L -190 10 L -40 130 Z M 96 150 L 190 10 L 40 130 Z', fill: '#b91c1c', w: 5 }],
    legs: LEGS('#111827'), torso: [{ d: TORSO, fill: '#111827', w: 7 }, { d: 'M -30 158 L 0 220 L 30 158 Z', fill: '#ffffff', w: 4 }, { d: 'M -22 172 L 22 172', c: '#b91c1c', w: 10 }] },
    pastor: { sleeve: '#111827', legs: [], torso: [{ d: 'M -95 165 Q -150 460 -160 770 L 160 770 Q 150 460 95 165 Q 0 140 -95 165 Z', fill: '#111827', w: 7 },
      box(-18, 160, 36, 26, 4, '#ffffff', null, 4), { d: 'M -60 260 L -60 330 M -90 290 L -30 290', c: '#facc15', w: 8 }] },
    medita: { sleeve: '#f8fafc', legs: [{ d: 'M -200 470 Q -210 400 -90 410 L 90 410 Q 210 400 200 470 Q 100 530 0 500 Q -100 530 -200 470 Z', fill: '#f8fafc', w: 7 },
      { d: ellipse(-150, 492, 36, 18), fill: V_SKIN, w: 5 }, { d: ellipse(150, 492, 36, 18), fill: V_SKIN, w: 5 }],
    torso: [{ d: 'M -95 165 Q -110 300 -96 430 L 96 430 Q 110 300 95 165 Q 0 140 -95 165 Z', fill: '#f8fafc', w: 7 }, { d: 'M -30 160 L 0 200 L 30 160', w: 5 }] },
    blusa: { sleeve: '#facc15', legs: [], torso: [{ d: 'M -95 165 Q -110 330 -92 560 L 92 560 Q 110 330 95 165 Q 0 140 -95 165 Z', fill: '#facc15', w: 7 },
      { d: 'M -46 158 Q 0 230 46 158', fill: E_SKIN, w: 5 }, { d: 'M -60 360 L 60 360', c: '#eab308', w: 5 }] },
  };
  const POSES = {
    rest: { L: { el: [-128, 300], h: [-116, 420] }, R: { el: [128, 300], h: [116, 420] } },
    festa: { L: { el: [-190, 90], h: [-150, -60] }, R: { el: [190, 90], h: [150, -60] } },
    open: { L: { el: [-210, 230], h: [-310, 130] }, R: { el: [210, 230], h: [310, 130] } },
    ear: { L: { el: [-128, 300], h: [-116, 420] }, R: { el: [190, 240], h: [118, 60] } },
    phone: { L: { el: [-128, 300], h: [-116, 420] }, R: { el: [150, 340], h: [60, 280] } },
    point: { L: { el: [-128, 300], h: [-116, 420] }, R: { el: [200, 200], h: [300, 160], pt: 1 } },
    zen: { L: { el: [-170, 330], h: [-150, 430] }, R: { el: [170, 330], h: [150, 430] } },
    bible: { L: { el: [-150, 320], h: [-40, 300] }, R: { el: [190, 120], h: [170, -40], pt: 1, r: -90 } },
    bag: { L: { el: [-150, 320], h: [-200, 430] }, R: { el: [140, 320], h: [60, 260] } },
    chin: { L: { el: [-128, 300], h: [-116, 420] }, R: { el: [160, 300], h: [40, 130] } },
  };
  const SH = [[-92, 190], [92, 190]];
  // personagem completo. o: {x,y,s,kind:'V'|'E', outfit, pose, mood, parent, face extra}
  function makeChar(o) {
    const outer = WB.mk('g', {}, o.parent || cont);
    const root = WB.mk('g', { transform: `translate(${o.x} ${o.y}) scale(${o.s})${o.flip ? ' scale(-1 1)' : ''}` }, outer);
    const of = OUTFITS[o.outfit];
    const skin = o.kind === 'E' ? E_SKIN : V_SKIN;
    if (of.back) put(of.back, root);
    if (!o.noLegs) put(of.legs, root);
    put(of.torso, root);
    if (o.behindArms) put(o.behindArms, root);
    const armL = makeArm(root, skin, of.sleeve, 40, 30, 24), armR = makeArm(root, skin, of.sleeve, 40, 30, 24);
    if (o.front) put(o.front, root);
    const head = WB.mk('g', {}, root);
    const face = makeFace(head, Object.assign({}, o.kind === 'E' ? EFACE : VFACE, o.faceCfg || {}));
    if (o.headExtra) put(o.headExtra, head);
    const setPose = (p, rot = 0) => { armL(SH[0], p.L.el, p.L.h, p.L.r, p.L.pt); armR(SH[1], p.R.el, p.R.h, p.R.r, p.R.pt); };
    setPose(POSES[o.pose || 'rest']);
    if (o.mood) { const m = moodOf(o.mood); face(0, m, 0, o.look || 1); head.setAttribute('transform', `rotate(${r1(m.rot * 0.6)} 0 100)`); }
    if (o.hold) put(o.hold, root);
    return { outer, root, head, face, setPose, armL, armR };
  }
  const SUNGLASSES = [{ d: 'M -70 -6 L 70 -6', w: 8 }, box(-74, -14, 62, 40, 14, '#111827', null, 5), box(12, -14, 62, 40, 14, '#111827', null, 5)];

  // ---------------- legenda (faixa amarela manuscrita) ----------------
  const capLayer = WB.mk('g', {}, WB.overlay);
  const CAPS = [
    [0.25, 'Vorcaro querido, tudo bem?'], [1.25, 'Então tá bom, viu?'], [2.0, 'Eu tenho umas dúvidas aqui'],
    [2.85, 'que assim... não é da minha conta'], [3.5, 'mas eu queria saber só porque eu sou curioso mesmo'],
    [5.3, 'Por exemplo...'], [5.85, 'a bateria social sua'], [7.0, 'que cê conversava ali com mais ou menos'],
    [8.0, '287 pessoas por dia'], [9.5, 'organizava festa'], [10.15, 'jantar, viagem'], [10.95, 'falava com amante'],
    [11.5, 'com político, ministro'], [12.3, 'gente de direita e esquerda'], [13.2, 'do meio, do lado, do outro'],
    [14.0, 'em cima e embaixo'], [14.8, 'Como que é isso?'], [15.3, 'Venvanse? Ritalina?'], [16.35, 'Venvanse com Ritalina?'],
    [17.4, 'Café? Energético? Tóxico?'], [18.45, 'Eu queria tá sabendo'], [19.4, 'porque assim...'],
    [19.75, 'se eu falo com 5 pessoas ao mesmo tempo no WhatsApp'], [21.55, 'no mínimo 3 delas'], [22.55, 'vão ficar no vácuo'],
    [23.2, 'Então como é que cê faz isso aí?'], [24.85, 'Outra dúvida:'], [25.35, 'na festinha lá que cê fez'],
    [26.3, '120 mulheres pra 20 homens'], [27.65, 'se dividir por igual'], [28.6, 'dá mais ou menos 6 mulheres pra cada homem'],
    [30.85, 'Daí, na hora que eu fiz essa conta'], [31.75, 'me surgiu uma curiosidade'],
    [32.8, 'No caso, essas 6 mulheres pra cada homem'], [34.65, 'elas só ficavam ali fazendo uma vibe, né?'],
    [36.4, 'tipo quadro de museu'], [37.3, 'eles ficavam ali olhando e admirando elas'], [39.0, 'Porque, menino...'],
    [39.4, 'pelo que eu vi da lista de convidado'], [40.6, 'não tem tadalafila que faz um aguentar 6'],
    [42.8, 'E se tivesse tudo isso de tadalafila'], [44.55, 'ia ficar mais caro a tadalafila'],
    [46.0, 'que as 120 passagens dessas mulheres pra vir pra cá'], [48.0, 'Como que foi isso aí?'],
    [49.3, 'E por falar nas festas'], [50.3, 'que sinceramente é uma das partes que eu mais tenho curiosidade'],
    [52.4, 'Negócio do dinheiro...'], [53.1, 'quando que cê roubou, deixou de roubar'], [54.15, 'deixa que a polícia cuida'],
    [54.9, 'Mas falando das festas'], [55.65, 'a grade de show, quem que escolhe?'], [56.9, 'Era tudo seu ou se tinha uma equipe?'],
    [57.9, 'Porque olha, menino, que curadoria!'], [58.9, 'Tem até que te parabenizar'], [59.85, 'Cê tem vários defeitos'],
    [60.8, 'mas nenhum deles é mau gosto'], [62.0, 'pras atração aí das suas festa'], [63.3, 'E o bom é que se nada der certo'],
    [64.5, 'desempregado cê não fica'], [65.35, 'Cê pode ser promoter de um Vila JK'], [67.0, 'fazer uns bico no Rock in Rio'],
    [68.25, 'ajudar na curadoria do Tomorrowland'], [70.1, 'Outra coisa importante que eu queria saber'],
    [71.35, 'o negócio do equilíbrio todo que cê tem'], [72.9, 'é terapia? Psicóloga?'], [73.8, 'Remédio controlado? Meditação?'],
    [75.15, 'Curso de algum coach de Alphaville?'], [76.4, 'Porque que acontece:'], [77.0, 'no sábado cê tava numa festa de Halloween'],
    [78.3, 'com as tchutchuca'], [79.0, 'e no domingo cê tava onde?'], [80.0, 'Na igreja pregando!'],
    [80.75, 'Isso aí é equilíbrio'], [81.6, 'Até nas amizades cê tinha'], [82.55, 'cê não ficava só numa panelinha'],
    [83.65, 'cê era amigo de todos'], [84.85, 'de direita, de esquerda'], [85.75, 'do bandido, do pastor'],
    [86.7, 'Olha, Vorcaro, isso que é'], [87.7, 'tá com os chakras alinhados'], [89.3, 'Aí, uma última dúvida que eu queria saber'],
    [90.7, 'Qual que era seu critério pra fazer amizade?'], [92.3, 'Porque pelo que eu andei vendo'],
    [93.3, 'parece que só eu não ganhei um Pix seu'], [94.6, 'Claro, porque a gente não se conhecia'],
    [95.9, 'mas eu queria saber o negócio do critério'], [97.25, 'pra ver se pelo menos eu me enquadrava'],
    [98.45, 'e daí eu fico mais tranquilo'], [99.3, 'e não me sinto tão excluído'], [100.15, 'Porque, menino...'],
    [100.6, 'todo dia é um nome, uma conversa com você'], [102.35, 'Eu falo: gente, onde que eu tava'],
    [103.4, 'que só eu não participei?'], [104.3, 'E claro, porque assim...'], [105.4, 'a gente não sabe o dia de amanhã'],
    [106.2, 'vai que cê é solto aí'], [107.05, 'e eu tô aqui de bobeira também'], [108.2, 'Network, né, Vorcaro?'],
    [109.1, 'Sabe como é que é'],
  ];
  CAPS.forEach(([t0, text], i) => {
    const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : 110.1;
    const g = WB.mk('g', {}, capLayer);
    const size = 62, lh = 70;
    const lines = WB.wrap(text, size, 860);
    const w = Math.max(...lines.map(l => WB.measure(l, size))) + 64, h = lines.length * lh + 30, y0 = 268;
    WB.mk('rect', { x: r1(540 - w / 2), y: y0, width: r1(w), height: h, rx: 20, fill: '#ffe066', stroke: INK.black, 'stroke-width': 5 }, g);
    lines.forEach((l, k) => WB.showNow(WB.textStrokes(l, 540, y0 + 64 + k * lh, size, INK.black, g, 'middle').strokes));
    const rot = i % 2 ? 1.2 : -1.2;
    WB.effect(t => {
      if (t < t0 || t >= t1) { g.setAttribute('display', 'none'); return; }
      g.setAttribute('display', 'inline');
      const k = backOut(clamp((t - t0) / 0.2)) * 0.1 + 0.9;
      g.setAttribute('transform', `translate(540 ${y0 + h / 2}) rotate(${rot}) scale(${k.toFixed(3)}) translate(-540 ${-(y0 + h / 2)})`);
    });
  });

  // =====================================================================
  // CELA (Vorcaro ouvindo o áudio)
  // =====================================================================
  const CELA = [[0, 1.95], [23.2, 24.85], [48.0, 49.3], [104.3, 108.2]];
  shot(CELA);
  put([
    rect(0, 0, 1080, 1920, '#cfd5dc'),
    { d: 'M 0 1500 L 1080 1500 L 1080 1920 L 0 1920 Z', fill: '#8f99a5', w: 7 },
    { d: 'M 0 0 L 150 160 L 150 1500 L 0 1640 Z', fill: '#b6bec8', w: 7 },
    { d: 'M 150 160 L 1080 160', w: 7 },
    { d: 'M 300 420 l 30 40 l -20 30 l 30 50 M 860 1100 l -30 30 l 20 40', c: '#9ca3af', w: 4 },
    { d: 'M 230 1580 L 900 1580 M 120 1720 L 1000 1720', c: '#7b8591', w: 4 },
    // janela gradeada
    box(690, 560, 260, 230, 8, '#1e293b', null, 8), { d: 'M 735 1000', c: 'none' },
    { d: 'M 760 555 L 760 795 M 820 555 L 820 795 M 880 555 L 880 795', c: '#475569', w: 16 },
    { d: 'M 905 610 A 26 26 0 1 0 925 650 A 20 20 0 1 1 905 610 Z', fill: '#fde68a', c: '#facc15', w: 3 },
    // calendário de risquinhos
    box(200, 560, 220, 250, 6, '#fffdf5', null, 6), box(200, 560, 220, 50, 6, '#dc2626', null, 6),
    { d: 'M 225 650 l 0 60 M 245 650 l 0 60 M 265 650 l 0 60 M 285 650 l 0 60 M 215 700 l 90 -40 M 330 650 l 0 60 M 350 650 l 0 60 M 225 740 l 0 50 M 245 740 l 0 50', c: '#374151', w: 5 },
    // cama
    box(700, 1250, 360, 40, 6, '#64748b', null, 6), box(700, 1200, 360, 60, 14, '#e5e7eb', null, 6),
    { d: ellipse(980, 1188, 70, 30), fill: '#ffffff', w: 6 },
    { d: 'M 720 1290 L 720 1470 M 1040 1290 L 1040 1470', c: '#475569', w: 14 },
    // pia + privada
    toilet(260, 1170, 0.95),
    box(140, 960, 220, 60, 20, '#f1f5f9', null, 6), { d: 'M 250 960 L 250 920 L 290 920', w: 10, c: '#64748b' },
  ]);
  // Vorcaro de uniforme
  const vc = makeChar({ x: 500, y: 830, s: 0.85, kind: 'V', outfit: 'preso', pose: 'phone' });
  // celular na mão + ondas do áudio
  const vPhone = WB.mk('g', {}, vc.root);
  put(phoneShape(0, 0, 76, 136), vPhone);
  const vWaves = WB.mk('g', {}, vc.root);
  put([{ d: 'M 70 -60 Q 100 -20 70 20', c: INK.blue, w: 7 }, { d: 'M 100 -90 Q 145 -20 100 50', c: INK.blue, w: 7 }], vWaves);
  // balão de áudio recebido (início)
  P(0.1, [box(620, 880, 330, 120, 30, '#dcfce7', null, 6), circ(680, 940, 30, '#22c55e', null, 5), { d: 'M 672 925 L 672 955 L 696 940 Z', fill: '#ffffff', c: 'none' },
    { d: 'M 730 940 l 0 0 M 735 925 l 0 30 M 755 915 l 0 50 M 775 930 l 0 20 M 795 920 l 0 40 M 815 928 l 0 24 M 835 912 l 0 56 M 855 930 l 0 20', c: '#15803d', w: 8 },
    T('1:49', 900, 990, 40, '#15803d')], { until: 1.9 });
  // sonho de ser solto (106,2)
  P(106.2, [...thought(780, 640, 250, 150, [[600, 820, 16], [640, 770, 24]]), T('SOLTO!', 700, 610, 70, INK.green)], { loop: 'float' });
  P(106.35, [{ d: 'M 860 660 m -40 0 a 30 30 0 1 0 60 0 a 30 30 0 1 0 -60 0 M 880 660 L 950 660 L 950 685 M 930 660 L 930 680', c: '#ca8a04', w: 10 }], { loop: 'wiggle' });
  P(106.5, [{ d: ellipse(760, 700, 120, 18), fill: '#fde68a', c: '#f59e0b', w: 4 }, { d: 'M 700 700 L 700 640 M 700 640 q 20 -10 40 0 M 700 640 q -20 -10 -40 0', c: '#16a34a', w: 6 }], { loop: 'float', ph: 0.3 });
  const TL_V = [[-9, 'leve'], [0.3, 'arregalada'], [1.0, 'sorriso'], [23.2, 'estresse'], [24.2, 'arregalada'], [48.0, 'estresse'], [48.6, 'arregalada'],
    [104.3, 'pensativa'], [106.2, 'euforia'], [107.1, 'malicia']];
  const JOLT_V = [23.25, 48.05, 106.25];
  WB.effect(t => {
    if (!CELA.some(([a, b]) => t >= a && t < b)) return;
    const s = stateAt(TL_V, t);
    vc.face(t, s, 0, 1);
    let jx = 0, jy = 0;
    for (const j of JOLT_V) if (t > j && t < j + 0.45) { const f = 1 - (t - j) / 0.45; jx += Math.sin(t * 70) * 7 * f; jy -= Math.abs(Math.sin(t * 20)) * 10 * f; }
    vc.head.setAttribute('transform', `translate(${r1(jx)} ${r1(jy)}) rotate(${r1(s.rot * 0.7 + Math.sin(t * 1.3) * 2)} 0 100)`);
    vc.root.setAttribute('transform', `translate(${r1(500 + jx * 0.4)} ${r1(830 + Math.sin(t * 2.1) * 3)}) scale(0.85)`);
    const p = POSES.phone.R.h;
    vPhone.setAttribute('transform', `translate(${p[0] + 6} ${p[1] - 40}) rotate(-8)`);
    const e = t < FALA_FIM ? envAt(t) : 0;
    vWaves.setAttribute('transform', `translate(${p[0] + 6} ${p[1] - 40})`);
    vWaves.setAttribute('opacity', (0.25 + 0.75 * e).toFixed(2));
  });

  // =====================================================================
  // COZINHA (ela gravando o áudio)
  // =====================================================================
  const ELA = [[1.95, 5.3], [18.45, 19.7], [30.85, 33.3], [49.3, 52.4], [70.1, 71.35], [89.3, 92.3], [94.6, 100.15], [108.2, 110.1]];
  shot(ELA);
  put([
    rect(0, 0, 1080, 1920, '#fde8c8'),
    rect(0, 1120, 1080, 1420, '#ffffff'),
    { d: 'M 0 1120 L 1080 1120 M 0 1220 L 1080 1220 M 0 1320 L 1080 1320 ' + [...Array(12)].map((_, i) => `M ${i * 100 + 50} 1120 L ${i * 100 + 50} 1420`).join(' '), c: '#e7d3b0', w: 4 },
    // janela
    box(80, 520, 320, 380, 10, '#bae6fd', null, 8), { d: 'M 240 520 L 240 900 M 80 710 L 400 710', w: 8 },
    cloud(170, 610, 60, 30), circ(330, 600, 40, '#fde047', '#f59e0b', 5),
    { d: 'M 60 500 Q 110 700 80 920 L 130 920 Q 150 700 120 500 Z M 420 500 Q 370 700 400 920 L 350 920 Q 330 700 360 500 Z', fill: '#fb7185', w: 5 },
    { d: 'M 50 500 L 430 500', w: 10 },
    box(140, 880, 90, 70, 10, '#c2410c', null, 5), { d: 'M 185 880 Q 160 820 150 800 M 185 880 Q 190 810 200 790 M 185 880 Q 220 830 235 815', c: '#16a34a', w: 8 },
    // relógio
    circ(930, 900, 70, '#ffffff', null, 7),
  ]);
  const clockHands = WB.mk('g', {}, cont);
  const hMin = WB.mk('path', { d: 'M 0 0 L 0 -52', stroke: INK.black, 'stroke-width': 7, 'stroke-linecap': 'round' }, clockHands);
  WB.mk('path', { d: 'M 0 0 L 32 0', stroke: INK.black, 'stroke-width': 9, 'stroke-linecap': 'round' }, clockHands);
  clockHands.setAttribute('transform', 'translate(930 900)');
  WB.effect(t => hMin.setAttribute('transform', `rotate(${r1(t * 30)})`));
  const ec = makeChar({ x: 540, y: 890, s: 0.9, kind: 'E', outfit: 'blusa', pose: 'rest', noLegs: true });
  const ePhone = WB.mk('g', {}, ec.root);
  put(phoneShape(0, 0, 76, 136, 0, '#bbf7d0'), ePhone);
  // mesa por cima
  put([{ d: 'M 0 1480 L 1080 1480 L 1080 1920 L 0 1920 Z', fill: '#92400e', w: 7 },
    { d: 'M -10 1400 L 1090 1400 L 1090 1490 L -10 1490 Z', fill: '#b45309', w: 8 }, { d: 'M 0 1440 L 1080 1440', c: '#d97706', w: 5 }, { d: 'M 200 1600 Q 400 1620 600 1600 M 500 1750 Q 700 1770 900 1750', c: '#78350f', w: 5 },
    ...mug(860, 1430, 0.9, '#22c55e')]);
  // indicador de gravação
  const rec = WB.mk('g', {}, cont);
  put([box(640, 560, 300, 96, 48, '#ffffff', null, 6), T('gravando', 830, 622, 40, INK.red)], rec);
  const recDot = WB.mk('circle', { cx: 690, cy: 608, r: 20, fill: '#ef4444', stroke: INK.black, 'stroke-width': 4 }, rec);
  const bars = [...Array(7)].map((_, i) => WB.mk('rect', { x: 600 + i * 0, y: 0, width: 12, height: 10, rx: 6, fill: '#ef4444' }, cont));
  // gestos da mão esquerda
  const E_POSE = {
    rest: { el: [-150, 360], h: [-80, 470], r: 0 },
    gesto: { el: [-190, 320], h: [-230, 190], r: -60 },
    mao: { el: [-200, 300], h: [-270, 230], r: 200 },
    aponta: { el: [-180, 250], h: [-200, 90], r: -80, pt: 1 },
    peito: { el: [-170, 330], h: [-30, 280], r: 0, pt: 1 },
  };
  const TL_E = [[-9, 'sorriso', 'gesto'], [2.85, 'revira', 'mao'], [3.5, 'malicia', 'gesto'],
    [18.45, 'confusa', 'mao'], [30.85, 'pensativa', 'aponta'], [31.75, 'arregalada', 'aponta'],
    [49.3, 'malicia', 'gesto'], [50.3, 'pensativa', 'mao'], [70.1, 'pensativa', 'aponta'],
    [89.3, 'pensativa', 'aponta'], [90.7, 'confusa', 'mao'], [94.6, 'leve', 'mao'], [97.2, 'triste', 'peito'], [99.3, 'triste', 'rest'],
    [108.2, 'malicia', 'aponta'], [109.1, 'sorriso', 'gesto']];
  WB.effect(t => {
    if (!ELA.some(([a, b]) => t >= a && t < b)) return;
    const s = stateAt(TL_E, t);
    const op = t < FALA_FIM ? clamp(envAt(t) * 1.15) : 0;
    const talk = op > 0.05 ? 1 : 0;
    ec.face(t, s, op, -1);
    ec.head.setAttribute('transform', `translate(0 ${r1(-talk * 2 * Math.abs(Math.sin(t * 11)))}) rotate(${r1(s.rot * 0.6 + talk * 2 * Math.sin(t * 6.5))} 0 100)`);
    const p = poseLerp(E_POSE[s.pose0], E_POSE[s.pose1], s.pu);
    const wob = talk * Math.sin(t * 7) * 10;
    ec.armL(SH[0], p.el, [p.h[0], p.h[1] + wob], p.r, p.pt);
    ec.armR(SH[1], [170, 330], [140, 190], 0, 0);
    ePhone.setAttribute('transform', 'translate(150 130) rotate(-14)');
    recDot.setAttribute('opacity', (0.5 + 0.5 * Math.abs(Math.sin(t * 4))).toFixed(2));
    bars.forEach((b, i) => {
      const hh = 10 + 70 * (t < FALA_FIM ? envAt(t - i * 0.05) : 0) * (0.6 + 0.4 * Math.abs(Math.sin(i * 1.7 + t * 9)));
      b.setAttribute('x', 690 + 40 + i * 0); b.setAttribute('height', r1(hh)); b.setAttribute('x', 735 + i * 0);
      b.setAttribute('transform', `translate(${i * 26 - 60} ${r1(720 - hh / 2)})`);
    });
  });
  const bulbG = WB.mk('g', { transform: 'translate(250 1010) scale(0.6) translate(-540 -640)' }, cont);
  // lâmpada (31,8), nuvem de chuva (99,3), network (108,3)
  P(31.8, [{ d: 'M 470 700 Q 410 640 440 580 Q 470 520 540 520 Q 610 520 640 580 Q 670 640 610 700 L 600 740 L 480 740 Z', fill: '#fde047', w: 7 },
    box(485, 740, 110, 40, 8, '#9ca3af', null, 5), { d: 'M 400 520 l -40 -40 M 680 520 l 40 -40 M 540 470 l 0 -50 M 380 640 l -50 0 M 700 640 l 50 0', c: '#f59e0b', w: 8 }], { until: 33.3, loop: 'pulse', parent: bulbG });
  P(99.3, [cloud(560, 560, 200, 80, '#9ca3af'), { d: 'M 440 660 l -14 40 M 500 680 l -14 40 M 560 660 l -14 40 M 620 680 l -14 40 M 680 660 l -14 40', c: INK.blue, w: 7 }], { loop: 'float', until: 100.1 });
  stamp(98.0, 'EXCLUÍDA', 260, 1560, 70, INK.red, -8, { loop: 'shake', until: 100.1 });
  stamp(108.3, 'NETWORK!', 540, 1600, 84, INK.green, -5, { loop: 'shake' });
  P(2.0, [T('?', 860, 1180, 120, INK.purple)], { loop: 'bounce', until: 5.3 });

  // =====================================================================
  // CENAS DE CORTE (no papel do caderno)
  // =====================================================================
  // 3) bateria social (5,3–9,45)
  shot([[5.3, 9.45]]);
  {
    const v = makeChar({ x: 540, y: 960, s: 0.72, kind: 'V', outfit: 'terno', pose: 'ear', mood: 'sorriso' });
    put(phoneShape(540 + 118 * 0.72, 960 + 40 * 0.72, 50, 90), v.root.parentNode);
    animate(v.outer, 5.3, { loop: 'wiggle', anim: 'fade' });
    [[170, 760, 5.4], [910, 740, 5.6], [150, 1180, 5.8], [930, 1160, 6.0], [250, 1540, 6.2], [830, 1560, 6.35]].forEach(([x, y, t], i) =>
      P(t, [...phoneShape(x, y, 90, 160), { d: `M ${x - 70} ${y - 60} l -26 -20 M ${x + 70} ${y - 60} l 26 -20 M ${x - 76} ${y} l -30 0 M ${x + 76} ${y} l 30 0`, c: INK.red, w: 7 }], { loop: 'ring', ph: i * 0.37 }));
    // bateria 100%
    P(5.9, [box(330, 480, 380, 170, 26, '#ffffff', null, 9), box(712, 530, 30, 70, 8, '#374151', null, 6),
      box(350, 500, 70, 130, 10, '#22c55e', 'none'), box(430, 500, 70, 130, 10, '#22c55e', 'none'), box(510, 500, 70, 130, 10, '#22c55e', 'none'), box(590, 500, 100, 130, 10, '#22c55e', 'none'),
      { d: 'M 540 505 L 500 575 L 545 575 L 515 640 L 590 555 L 545 555 L 575 505 Z', fill: '#facc15', w: 5 }], { loop: 'pulse' });
    // contador até 287
    const steps = [[7.2, '0'], [7.45, '41'], [7.7, '98'], [7.95, '173'], [8.2, '235'], [8.4, '287']];
    steps.forEach(([t, n], i) => {
      const it = P(t, [box(330, 1600, 420, 150, 20, '#fffdf5', INK.red, 8), T(n + '/dia', 540, 1705, 96, INK.red)], { anim: i === steps.length - 1 ? 'slam' : 'fade', loop: i === steps.length - 1 ? 'shake' : undefined });
      if (i < steps.length - 1) WB.effect(tt => { if (tt >= steps[i + 1][0]) it.g.setAttribute('opacity', 0); });
    });
  }

  // 4) agenda (9,45–14,8)
  shot([[9.45, 14.8]]);
  {
    const v = makeChar({ x: 540, y: 1000, s: 0.62, kind: 'V', outfit: 'terno', pose: 'open', mood: 'euforia' });
    animate(v.outer, 9.45, { anim: 'fade', loop: 'bounce' });
    P(9.55, [...confetti(80, 480, 320, 700, 14, 3), { d: 'M 150 650 L 200 480 L 250 650 Z', fill: '#ec4899', w: 6 }, circ(200, 476, 16, '#facc15', null, 4), T('festa', 200, 730, 50, INK.purple)], { loop: 'wiggle' });
    P(10.2, [{ d: ellipse(540, 600, 120, 50), fill: '#ffffff', w: 7 }, { d: ellipse(540, 600, 70, 26), c: '#d1d5db', w: 5 },
      { d: 'M 390 550 L 390 660 M 690 550 L 690 660 M 676 550 L 676 590 M 704 550 L 704 590', w: 7 }, T('jantar', 540, 720, 50, INK.orange)], { loop: 'wiggle', ph: 0.4 });
    P(10.65, [...plane(880, 590, 0.9), T('viagem', 880, 720, 50, INK.blue)], { anim: 'fly', fx: -300, loop: 'float' });
    P(11.0, [...mini(180, 930, 1, '#ec4899', '#facc15', E_SKIN, { dress: true, longHair: true }), heart(260, 880, 1.1), T('amante', 180, 1150, 50, INK.red)], { loop: 'hop' });
    P(11.55, [...mini(900, 930, 1, '#6b7280', '#9ca3af', V_SKIN, { collar: true }), { d: 'M 862 980 L 940 1060', c: '#16a34a', w: 14 }, T('político', 900, 1150, 50, INK.black)], { loop: 'hop', ph: 0.3 });
    P(12.05, [...mini(180, 1290, 1, '#111827', '#d1d5db', '#f2d0b4', { collar: true, glasses: true }), box(140, 1430, 80, 60, 8, '#78350f', null, 5), T('ministro', 180, 1540, 50, INK.black)], { loop: 'hop', ph: 0.6 });
    P(12.4, [...arrow(780, 1330, 990, 1330, INK.blue, 14), T('direita', 880, 1300, 52, INK.blue)], { anim: 'fly', fx: -200 });
    P(12.8, [...arrow(300, 1660, 90, 1660, INK.red, 14), T('esquerda', 200, 1630, 52, INK.red)], { anim: 'fly', fx: 200 });
    P(13.25, [T('meio', 540, 1660, 56, INK.green), ...arrow(470, 1690, 380, 1690, INK.green, 8), ...arrow(610, 1690, 700, 1690, INK.green, 8)], { anim: 'slam' });
    P(14.0, [...arrow(400, 860, 400, 760, INK.purple, 12), T('em cima', 400, 900, 46, INK.purple)], { anim: 'slam' });
    P(14.35, [...arrow(800, 1460, 800, 1580, INK.purple, 12), T('embaixo', 800, 1440, 46, INK.purple)], { anim: 'slam' });
  }

  // 5) farmácia (14,8–18,45)
  shot([[14.8, 18.45]]);
  {
    const v = makeChar({ x: 540, y: 880, s: 0.66, kind: 'V', outfit: 'terno', pose: 'festa', mood: 'arregalada' });
    animate(v.outer, 14.8, { anim: 'fade', loop: 'tremble' });
    put([{ d: 'M 30 1300 L 1050 1300 L 1050 1760 L 30 1760 Z', fill: '#e5e7eb', w: 8 }, { d: 'M 30 1340 L 1050 1340', c: '#9ca3af', w: 6 }, T('+', 540, 1600, 160, '#16a34a')]);
    P(14.85, [T('?', 330, 620, 130, INK.red), T('?', 760, 600, 110, INK.purple)], { loop: 'bounce' });
    P(15.4, pillBottle(160, 1130, 1.25, 'VENVANSE', '#3b82f6'), { anim: 'fly', fy: -500, loop: 'wiggle' });
    P(15.85, pillBottle(370, 1130, 1.25, 'RITALINA', '#f97316'), { anim: 'fly', fy: -500, loop: 'wiggle', ph: 0.5 });
    P(16.4, [T('+', 260, 1000, 110, INK.red)], { anim: 'slam', loop: 'pulse' });
    P(17.4, mug(720, 1260, 1.1, '#78350f'), { anim: 'fly', fy: -500 });
    P(17.75, [box(850, 1080, 130, 220, 20, '#22d3ee', null, 7), { d: 'M 850 1110 L 980 1110 M 850 1270 L 980 1270', w: 6 }, { d: 'M 930 1130 L 890 1200 L 925 1200 L 900 1260 L 955 1180 L 920 1180 L 945 1130 Z', fill: '#facc15', w: 4 }, T('ENERGÉTICO', 915, 1050, 42, INK.blue)], { anim: 'fly', fy: -500, loop: 'wiggle' });
    stamp(18.15, 'TÓXICO??', 540, 1560, 90, INK.red, -6, { loop: 'shake', bg: '#fef08a' });
  }

  // 6) WhatsApp (19,7–23,2)
  shot([[19.7, 23.2]]);
  {
    put([box(250, 470, 580, 1180, 60, '#1f2937', null, 8), box(276, 520, 528, 1080, 18, '#f8fafc', 'none'),
      box(276, 520, 528, 120, 18, '#16a34a', 'none'), T('Conversas', 540, 600, 60, '#ffffff'), box(470, 488, 140, 18, 9, '#374151', 'none')]);
    const names = ['Fulano', 'Ciclano', 'Beltrano', 'Tia Nice', 'Grupo'];
    const cols = ['#f97316', '#3b82f6', '#a855f7', '#ec4899', '#22c55e'];
    names.forEach((n, i) => {
      const y = 720 + i * 180;
      P(19.8 + i * 0.25, [circ(350, y, 50, cols[i], null, 5), T(n, 420, y - 6, 50, INK.black, 'start'), squiggle(420, y + 40, 260, '#9ca3af', 5), { d: `M 290 ${y + 85} L 790 ${y + 85}`, c: '#e5e7eb', w: 4 }], { anim: 'fly', fx: 300 });
    });
    [1, 2, 4].forEach((i, k) => {
      const y = 720 + i * 180;
      P(21.7 + k * 0.25, [{ d: `M 720 ${y + 4} l 12 14 l 22 -28 M 744 ${y + 4} l 12 14 l 22 -28`, c: '#9ca3af', w: 6 }, { d: `M 690 ${y - 50} L 790 ${y + 40} M 740 ${y - 50} L 740 ${y + 40} M 690 ${y - 5} L 790 ${y - 5} M 700 ${y - 40} Q 740 ${y - 10} 780 ${y - 40}`, c: '#cbd5e1', w: 3 }], { anim: 'slam' });
    });
    stamp(22.6, 'NO VÁCUO...', 540, 1500, 96, INK.gray, -7, { loop: 'shake', bg: '#f1f5f9' });
  }

  // 7) festa 120 x 20 (24,85–27,6) e a conta (27,6–30,85)
  shot([[24.85, 27.6]]);
  {
    put([...discoBall(540, 620, 100), ...confetti(60, 470, 1020, 800, 30, 7)]);
    animate(cont.lastChild, 24.85, { anim: 'fade', loop: 'spin' });
    P(26.3, [T('120', 210, 1050, 150, '#db2777'), ...[0, 1, 2, 3, 4, 5].flatMap(i => mini(420 + i * 105, 990, 0.55, '#f472b6', ['#7c2d12', '#facc15', '#111827', '#b45309', '#dc2626', '#4b5563'][i], ['#f1c9a5', '#c98a5e', '#8d5524', '#f2d0b4', '#e0ac69', '#c68642'][i], { dress: true, longHair: true }))], { loop: 'hop' });
    P(26.55, [...[0, 1, 2, 3, 4, 5].flatMap(i => mini(420 + i * 105, 1190, 0.55, '#f472b6', ['#4b5563', '#7c2d12', '#facc15', '#111827', '#b45309', '#dc2626'][i], ['#c98a5e', '#f1c9a5', '#e0ac69', '#8d5524', '#c68642', '#f2d0b4'][i], { dress: true, longHair: true }))], { loop: 'hop', ph: 0.3 });
    P(27.0, [T('20', 210, 1500, 150, '#2563eb'), ...mini(520, 1440, 0.6, '#60a5fa', '#111827', V_SKIN), ...mini(680, 1440, 0.6, '#60a5fa', '#7c2d12', '#c98a5e')], { loop: 'hop' });
  }
  shot([[27.6, 30.85]]);
  {
    const eq = WB.textStrokes('120 ÷ 20 = 6', 540, 700, 150, INK.black, cont, 'middle');
    WB.draw(1, 27.7 / TOTAL, 29.0 / TOTAL, eq.strokes);
    P(29.1, [{ d: WB.loopEllipse(905, 650, 95, 100), c: INK.red, w: 9 }], { anim: 'fade' });
    P(29.5, mini(540, 1150, 0.95, '#60a5fa', '#111827', V_SKIN), { loop: 'bounce' });
    [[300, 1000], [780, 1000], [230, 1250], [850, 1250], [330, 1480], [750, 1480]].forEach(([x, y], i) =>
      P(29.6 + i * 0.15, mini(x, y, 0.7, '#f472b6', ['#7c2d12', '#facc15', '#111827', '#b45309', '#dc2626', '#4b5563'][i], ['#f1c9a5', '#c98a5e', '#8d5524', '#f2d0b4', '#e0ac69', '#c68642'][i], { dress: true, longHair: true }), { loop: 'hop', ph: i * 0.2 }));
    TX(30.3, 'pra cada um!', 540, 1700, 80, INK.red, -3, { anim: 'slam' });
  }

  // 9) museu (33,3–39,0)
  shot([[33.3, 39.0]]);
  {
    put([rect(0, 1380, 1080, 1920, '#e7d3b0'), { d: 'M 0 1380 L 1080 1380', w: 7 }]);
    const frames = [[200, 600], [540, 600], [880, 600], [200, 980], [540, 980], [880, 980]];
    const hairs = ['#7c2d12', '#facc15', '#111827', '#b45309', '#dc2626', '#4b5563'];
    const skins = ['#f1c9a5', '#c98a5e', '#8d5524', '#f2d0b4', '#e0ac69', '#c68642'];
    frames.forEach(([x, y], i) => P(33.4 + i * 0.18, [box(x - 140, y - 160, 280, 320, 6, '#ca8a04', null, 7), box(x - 116, y - 136, 232, 272, 4, ['#fecdd3', '#bfdbfe', '#bbf7d0', '#fde68a', '#e9d5ff', '#fed7aa'][i], null, 5),
      ...mini(x, y - 20, 1.0, '#f472b6', hairs[i], skins[i], { dress: true, longHair: true })], { anim: 'slam' }));
    P(34.7, [T('vibe', 540, 1240, 80, INK.purple)], { loop: 'wiggle' });
    P(36.5, [{ d: 'M 60 1360 Q 300 1420 540 1360 Q 780 1420 1020 1360', c: '#b91c1c', w: 12 }, box(50, 1340, 24, 160, 6, '#ca8a04', null, 5), box(530, 1340, 24, 160, 6, '#ca8a04', null, 5), box(1006, 1340, 24, 160, 6, '#ca8a04', null, 5)], { anim: 'fade' });
    [[230, '#1f2937'], [540, '#475569'], [850, '#78350f']].forEach(([x, c], i) => {
      P(37.35 + i * 0.2, [...mini(x, 1560, 1.05, c, '#111827', ['#f0c09c', '#c98a5e', '#e8bf9a'][i]), heart(x - 18, 1560, 0.35), heart(x + 18, 1560, 0.35), T('hmm...', x, 1440, 46, INK.gray)], { loop: 'float', ph: i * 0.5 });
    });
  }

  // 10) lista de convidados + tadalafila (39,0–42,8)
  shot([[39.0, 42.8]]);
  {
    P(39.4, [box(70, 480, 520, 860, 20, '#d6b97a', null, 8), box(100, 540, 460, 770, 6, '#ffffff', null, 5), box(240, 460, 180, 60, 10, '#9ca3af', null, 5),
      T('CONVIDADOS', 330, 620, 54, INK.black), ...[0, 1, 2, 3, 4].flatMap(i => [...mini(160, 720 + i * 120, 0.5, '#6b7280', '#d1d5db', '#f2d0b4', { bald: true, glasses: true }), squiggle(210, 730 + i * 120, 300, '#374151', 5)])], { anim: 'slam' });
    P(40.7, [box(110, 1420, 380, 210, 16, '#ffffff', null, 7), box(110, 1420, 380, 60, 16, '#3b82f6', null, 7), T('TADALAFILA', 300, 1550, 52, INK.blue)], { loop: 'wiggle' });
    P(41.2, [...mini(800, 1000, 1.9, '#9ca3af', '#d1d5db', '#f2d0b4', { bald: true, glasses: true, sad: true }), { d: 'M 880 1170 L 900 1470', c: '#78350f', w: 12 }, { d: 'M 860 1170 Q 880 1150 900 1170', c: '#78350f', w: 12 }], { loop: 'tremble' });
    P(41.4, [{ d: 'M 900 860 q -14 24 0 36 q 14 -12 0 -36 Z', fill: '#93c5fd', w: 4 }, { d: 'M 700 870 q -14 24 0 36 q 14 -12 0 -36 Z', fill: '#93c5fd', w: 4 }], { loop: 'bounce' });
    stamp(41.9, 'AGUENTAR 6?!', 760, 1580, 70, INK.red, 6, { loop: 'shake' });
  }

  // 11) balança: tadalafila x 120 passagens (42,8–48,0)
  shot([[42.8, 48.0]]);
  {
    put([{ d: 'M 540 900 L 540 1600', w: 18 }, { d: 'M 400 1620 L 680 1620 L 640 1580 L 440 1580 Z', fill: '#ca8a04', w: 7 }]);
    const beam = WB.mk('g', {}, cont);
    put([{ d: 'M 240 900 L 840 900', w: 16 }, circ(540, 900, 22, '#ca8a04', null, 6)], beam);
    const panL = WB.mk('g', {}, cont), panR = WB.mk('g', {}, cont);
    const pan = (x) => [{ d: `M ${x} 900 L ${x - 140} 1180 M ${x} 900 L ${x + 140} 1180`, c: '#6b7280', w: 5 }, { d: `M ${x - 170} 1180 Q ${x} 1260 ${x + 170} 1180 Z`, fill: '#ca8a04', w: 7 }];
    put(pan(240), panL); put(pan(840), panR);
    const boxes = (x, y) => [box(x - 60, y - 70, 120, 70, 8, '#ffffff', null, 5), box(x - 60, y - 70, 120, 20, 8, '#3b82f6', null, 4), T('tadala', x, y - 14, 30, INK.blue)];
    P(43.3, [...boxes(180, 1180), ...boxes(300, 1180)], { parent: panL, anim: 'fly', fy: -300 });
    P(44.0, [...boxes(240, 1110), ...boxes(180, 1040), ...boxes(300, 1040), ...boxes(240, 970)], { parent: panL, anim: 'fly', fy: -300 });
    P(44.6, [T('R$ $$$', 240, 820, 64, INK.red)], { parent: panL, anim: 'slam' });
    const tickets = [];
    for (let i = 0; i < 4; i++) tickets.push(box(760 + (i % 2) * 40, 1100 - i * 34, 150, 70, 8, '#e0f2fe', null, 4));
    P(46.1, [...tickets, T('120 passagens', 840, 820, 54, INK.blue)], { parent: panR, anim: 'fly', fy: -300 });
    WB.effect(t => {
      const a = -10 * ease(clamp((t - 44.6) / 0.6)) + 1.5 * Math.sin(t * 4) * clamp((t - 44.6) / 0.6);
      beam.setAttribute('transform', `rotate(${r1(a)} 540 900)`);
      const dy = Math.sin(a * Math.PI / 180) * 300;
      panL.setAttribute('transform', `translate(${r1(300 - 300 * Math.cos(a * Math.PI / 180))} ${r1(-dy)})`);
      panR.setAttribute('transform', `translate(${r1(-(300 - 300 * Math.cos(a * Math.PI / 180)))} ${r1(dy)})`);
    });
    stamp(46.9, 'MAIS CARO!', 270, 1500, 76, INK.red, -6, { loop: 'shake' });
  }

  // 14) dinheiro / polícia (52,4–54,9)
  shot([[52.4, 54.9]]);
  {
    P(52.45, [...moneyBag(200, 1450, 1.1), ...moneyBag(360, 1500, 0.9), ...moneyBag(270, 1300, 0.8)], { anim: 'slam' });
    const v = makeChar({ x: 640, y: 880, s: 0.6, kind: 'V', outfit: 'terno', pose: 'bag', mood: 'malicia',
      headExtra: [{ d: 'M -104 -10 L 104 -10 L 104 20 L -104 20 Z', fill: '#111827', w: 4 }, circ(-38, 6, 10, '#ffffff', 'none'), circ(38, 6, 10, '#ffffff', 'none')],
      hold: moneyBag(-210, 470, 0.8) });
    animate(v.outer, 53.1, { anim: 'fly', fx: 600, loop: 'hop' });
    P(53.5, [T('psiu...', 840, 650, 56, INK.gray)], { loop: 'wiggle' });
    P(54.15, [box(560, 1500, 460, 170, 40, '#ffffff', null, 8), box(620, 1430, 300, 90, 20, '#bfdbfe', null, 6), circ(660, 1680, 46, '#374151', null, 6), circ(920, 1680, 46, '#374151', null, 6),
      T('POLÍCIA', 790, 1610, 60, INK.blue), box(730, 1390, 50, 40, 8, '#ef4444', null, 5), box(790, 1390, 50, 40, 8, '#3b82f6', null, 5)], { anim: 'fly', fx: 600, loop: 'tremble' });
    P(54.3, [T('ok!', 960, 1360, 70, INK.blue)], { anim: 'slam' });
  }

  // 15) palco e curadoria (54,9–59,85)
  shot([[54.9, 59.85]]);
  {
    put([rect(0, 440, 1080, 1920, '#1e1b4b'), { d: 'M 0 440 Q 120 900 60 1500 L 0 1500 Z M 1080 440 Q 960 900 1020 1500 L 1080 1500 Z', fill: '#b91c1c', w: 6 },
      { d: 'M 0 1500 L 1080 1500 L 1080 1920 L 0 1920 Z', fill: '#78350f', w: 7 },
      { d: 'M 200 440 L 80 1500 L 380 1500 Z', fill: '#fde68a', c: 'none', fo: 0.25 }, { d: 'M 880 440 L 700 1500 L 1000 1500 Z', fill: '#fde68a', c: 'none', fo: 0.25 }]);
    P(55.7, [box(260, 500, 560, 560, 16, '#fffdf5', null, 8), T('GRADE DE SHOWS', 540, 590, 60, INK.red),
      ...[0, 1, 2, 3].flatMap(i => [star(320, 690 + i * 100, 26), squiggle(370, 690 + i * 100, 360, '#1f2937', 6)])], { anim: 'slam' });
    const v = makeChar({ x: 540, y: 1320, s: 0.42, kind: 'V', outfit: 'terno', pose: 'festa', mood: 'euforia', headExtra: SUNGLASSES });
    animate(v.outer, 56.9, { loop: 'bounce' });
    put([box(300, 1370, 480, 140, 14, '#111827', null, 6), circ(420, 1410, 36, '#6b7280', null, 5), circ(660, 1410, 36, '#6b7280', null, 5), T('DJ', 540, 1470, 50, '#facc15')]);
    P(57.9, [T('CURADORIA', 540, 1140, 70, '#facc15')], { anim: 'slam' });
    [0, 1, 2, 3, 4].forEach(i => P(58.1 + i * 0.12, star(340 + i * 100, 1190, 40), { anim: 'slam', loop: 'pulse' }));
    P(59.0, [{ d: 'M 860 1560 L 860 1640 M 820 1650 L 900 1650', w: 12, c: '#ca8a04' }, { d: 'M 790 1420 L 930 1420 Q 930 1550 860 1560 Q 790 1550 790 1420 Z', fill: '#facc15', w: 7 }, T('10', 860, 1510, 54, INK.black)], { anim: 'slam', loop: 'wiggle' });
  }

  // 16) defeitos x mau gosto (59,85–63,3)
  shot([[59.85, 63.3]]);
  {
    P(59.9, [T('DEFEITOS:', 330, 560, 90, INK.red)], { anim: 'slam' });
    [0, 1, 2, 3, 4, 5].forEach(i => P(60.0 + i * 0.12, [T('-', 120, 680 + i * 95, 60, INK.black, 'start'), squiggle(170, 660 + i * 95, 360 + (i % 3) * 90, '#374151', 6)], { anim: 'fade' }));
    P(60.9, [T('mau gosto?', 540, 1320, 100, INK.black)], { anim: 'slam' });
    P(61.6, [{ d: 'M 290 1250 L 790 1340 M 290 1340 L 790 1250', c: INK.red, w: 16 }], { anim: 'slam' });
    stamp(62.1, 'NUNCA!', 540, 1520, 110, INK.green, -6, { loop: 'shake' });
    const v = makeChar({ x: 900, y: 1560, s: 0.3, kind: 'V', outfit: 'terno', pose: 'point', mood: 'sorriso', headExtra: SUNGLASSES });
    animate(v.outer, 62.0, { loop: 'bounce' });
  }

  // 17) currículo / plano B (63,3–70,1)
  shot([[63.3, 70.1]]);
  {
    P(63.4, [box(120, 470, 840, 1230, 12, '#ffffff', null, 8), T('CURRÍCULO', 600, 580, 80, INK.blue), { d: 'M 340 610 L 860 610', c: INK.blue, w: 6 }]);
    const v = makeChar({ x: 230, y: 610, s: 0.4, kind: 'V', outfit: 'terno', pose: 'rest', mood: 'sorriso', noLegs: true });
    animate(v.outer, 63.5, { anim: 'fade' });
    stamp(64.5, 'DESEMPREGADO? NUNCA', 540, 860, 60, INK.red, -4, { loop: 'shake' });
    const items = [[65.4, 'Promoter de balada'], [67.0, 'Bico no Rock in Rio'], [68.3, 'Curadoria Tomorrowland']];
    items.forEach(([t, s], i) => P(t, [{ d: `M 170 ${1060 + i * 190} l 24 30 l 50 -60`, c: INK.green, w: 12 }, T(s, 270, 1090 + i * 190, 58, INK.black, 'start')], { anim: 'fly', fx: 300 }));
    P(68.9, [box(700, 1570, 220, 100, 14, '#facc15', null, 6), T('STAFF', 810, 1640, 52, INK.black)], { anim: 'slam', loop: 'wiggle' });
  }

  // 18) equilíbrio (71,35–76,4)
  shot([[71.35, 76.4]]);
  {
    const v = makeChar({ x: 540, y: 930, s: 0.66, kind: 'V', outfit: 'medita', pose: 'zen', mood: 'zen' });
    animate(v.outer, 71.35, { anim: 'fade', loop: 'float' });
    P(71.5, [{ d: ellipse(540, 1300, 200, 30), fill: '#e5e7eb', c: 'none' }], { anim: 'fade' });
    P(72.9, [{ d: 'M 90 760 L 330 760 L 330 690 Q 330 650 290 650 L 130 650 Q 90 650 90 690 Z', fill: '#a855f7', w: 6 }, box(80, 700, 260, 60, 20, '#c084fc', null, 6), T('terapia', 210, 840, 52, INK.purple)], { loop: 'wiggle' });
    P(73.35, [box(780, 620, 180, 220, 10, '#fffdf5', null, 6), squiggle(800, 680, 130, '#374151', 4), squiggle(800, 730, 130, '#374151', 4), squiggle(800, 780, 100, '#374151', 4), T('psicóloga', 870, 900, 52, INK.purple)], { loop: 'wiggle', ph: 0.4 });
    P(73.8, [box(80, 1340, 260, 150, 12, '#ffffff', null, 7), rect(80, 1430, 340, 1475, '#111827'), T('TARJA PRETA', 210, 1410, 36, INK.black), T('remédio', 210, 1560, 50, INK.red)], { loop: 'wiggle', ph: 0.2 });
    P(74.6, [T('OM', 870, 1430, 110, '#f59e0b'), T('meditação', 870, 1560, 50, '#f59e0b')], { loop: 'pulse' });
    P(75.2, [...mini(540, 1560, 0.85, '#111827', '#facc15', '#f2d0b4'), { d: 'M 500 1540 Q 470 1580 500 1600 L 520 1600', c: '#374151', w: 4 }, box(390, 1700, 300, 70, 12, '#16a34a', null, 5), T('COACH', 540, 1752, 46, '#ffffff')], { anim: 'fly', fy: 400, loop: 'hop' });
  }

  // 19) sábado Halloween x domingo igreja (76,4–80,75)
  shot([[76.4, 80.75]]);
  {
    P(76.9, [box(50, 450, 980, 640, 20, '#3b0764', null, 8), T('SÁBADO', 220, 540, 64, '#facc15'), circ(880, 540, 50, '#fde68a', '#facc15', 5),
      { d: 'M 700 600 q 20 -30 40 0 q 20 -30 40 0 M 330 620 q 16 -24 32 0 q 16 -24 32 0', c: '#111827', w: 7 },
      { d: ellipse(160, 1020, 60, 46), fill: '#f97316', w: 6 }, { d: ellipse(920, 1020, 60, 46), fill: '#f97316', w: 6 }, { d: 'M 140 1010 l 10 -10 l 10 10 M 170 1010 l 10 -10 l 10 10 M 140 1035 q 20 14 40 0', c: '#111827', w: 4 }], { anim: 'slam' });
    const v1 = makeChar({ x: 540, y: 690, s: 0.42, kind: 'V', outfit: 'vampiro', pose: 'festa', mood: 'malicia', faceCfg: { extra: VFACE.extra.concat([{ d: 'M -18 80 L -10 100 L -2 80 Z M 2 80 L 10 100 L 18 80 Z', fill: '#ffffff', w: 3 }]) } });
    animate(v1.outer, 77.1, { loop: 'bounce' });
    P(78.3, [...mini(280, 860, 0.8, '#ec4899', '#facc15', '#f1c9a5', { dress: true, longHair: true }), { d: 'M 250 830 l 10 -40 l 16 30 M 310 830 l -10 -40 l -16 30', fill: '#111827', w: 4 },
      ...mini(800, 860, 0.8, '#a855f7', '#111827', '#8d5524', { dress: true, longHair: true }), { d: 'M 770 830 l 10 -40 l 16 30 M 830 830 l -10 -40 l -16 30', fill: '#111827', w: 4 }], { loop: 'hop' });
    P(79.0, [box(50, 1120, 980, 640, 20, '#fef9c3', null, 8), T('DOMINGO', 230, 1210, 64, INK.blue),
      { d: 'M 830 1170 Q 900 1130 970 1170 L 970 1330 L 830 1330 Z', fill: '#93c5fd', w: 6 }, { d: 'M 900 1180 L 900 1320 M 860 1230 L 940 1230', c: '#ca8a04', w: 10 }], { anim: 'slam' });
    const v2 = makeChar({ x: 540, y: 1330, s: 0.42, kind: 'V', outfit: 'pastor', pose: 'bible', mood: 'pensativa',
      front: [box(-150, 260, 110, 80, 6, '#7c2d12', null, 5), { d: 'M -95 260 L -95 340', c: '#facc15', w: 4 }] });
    animate(v2.outer, 79.1, { anim: 'fade' });
    P(79.15, [{ d: 'M 330 1560 L 750 1560 L 700 1740 L 380 1740 Z', fill: '#92400e', w: 7 }, { d: 'M 540 1600 L 540 1700 M 500 1640 L 580 1640', c: '#facc15', w: 10 }], { anim: 'fade' });
    P(80.0, [T('pregando!', 820, 1480, 58, INK.blue), { d: 'M 640 1150 l -40 -30 M 680 1170 l 10 -40', c: '#f59e0b', w: 6 }], { anim: 'slam', loop: 'wiggle' });
  }

  // 20) amizades (80,75–86,7)
  shot([[80.75, 86.7]]);
  {
    const v = makeChar({ x: 540, y: 1000, s: 0.6, kind: 'V', outfit: 'terno', pose: 'open', mood: 'euforia' });
    animate(v.outer, 80.75, { anim: 'fade' });
    P(81.6, [T('AMIGOS', 540, 560, 90, INK.green)], { anim: 'slam' });
    P(82.55, [{ d: 'M 90 700 L 330 700 Q 330 840 210 840 Q 90 840 90 700 Z', fill: '#9ca3af', w: 7 }, { d: 'M 60 700 L 90 700 M 330 700 L 360 700', w: 10 }, T('panelinha', 210, 910, 46, INK.gray),
      { d: 'M 90 650 L 340 880 M 340 650 L 90 880', c: INK.red, w: 12 }], { anim: 'slam', loop: 'shake' });
    P(83.7, [heart(400, 760, 0.9), heart(700, 740, 1.1), heart(560, 680, 0.7)], { loop: 'float' });
    P(84.9, [...mini(880, 1000, 1.05, '#2563eb', '#111827', '#f2d0b4'), box(800, 1170, 160, 60, 10, '#fffdf5', null, 4), T('direita', 880, 1215, 40, INK.blue)], { anim: 'fly', fx: 300, loop: 'hop' });
    P(85.4, [...mini(200, 1000, 1.05, '#dc2626', '#7c2d12', '#c98a5e'), box(120, 1170, 160, 60, 10, '#fffdf5', null, 4), T('esquerda', 200, 1215, 40, INK.red)], { anim: 'fly', fx: -300, loop: 'hop', ph: 0.3 });
    P(85.8, [...mini(850, 1440, 1.05, '#111827', '#111827', '#e8bf9a', { mask: true }), ...moneyBag(960, 1560, 0.5), T('bandido', 850, 1660, 42, INK.black)], { anim: 'fly', fx: 300, loop: 'hop', ph: 0.5 });
    P(86.2, [...mini(230, 1440, 1.05, '#111827', '#9ca3af', '#f2d0b4', { collar: true }), box(300, 1480, 70, 90, 6, '#7c2d12', null, 4), T('pastor', 230, 1660, 42, INK.black)], { anim: 'fly', fx: -300, loop: 'hop', ph: 0.7 });
  }

  // 21) chakras alinhados (86,7–89,3)
  shot([[86.7, 89.3]]);
  {
    put([circ(540, 1020, 420, '#fef3c7', 'none')]);
    const v = makeChar({ x: 540, y: 900, s: 0.72, kind: 'V', outfit: 'medita', pose: 'zen', mood: 'zen' });
    animate(v.outer, 86.7, { anim: 'fade', loop: 'float' });
    const cols = ['#a855f7', '#6366f1', '#3b82f6', '#22c55e', '#facc15', '#f97316', '#ef4444'];
    const ys = [780, 868, 1005, 1080, 1150, 1210, 1255];
    const start = [[-260, 80], [220, -60], [-180, 160], [300, 40], [-320, -40], [160, 180], [-60, -260]];
    cols.forEach((c, i) => {
      const it = put([circ(540, ys[i], 20, c, null, 5)]);
      WB.effect(t => {
        const u = ease(clamp((t - 87.8) / 0.7));
        const wob = (1 - u) * 20;
        it.g.setAttribute('transform', `translate(${r1(start[i][0] * (1 - u) + Math.sin(t * 3 + i) * wob)} ${r1(start[i][1] * (1 - u) + Math.cos(t * 2.5 + i) * wob)})`);
        it.g.setAttribute('opacity', clamp((t - 86.8 - i * 0.08) / 0.2).toFixed(2));
      });
    });
    stamp(88.4, 'ALINHADOS!', 540, 1580, 90, INK.purple, -4, { loop: 'pulse' });
  }

  // 23) Pix (92,3–94,6)
  shot([[92.3, 94.6]]);
  {
    const pix = (x, y) => [{ d: `M ${x} ${y - 46} L ${x + 46} ${y} L ${x} ${y + 46} L ${x - 46} ${y} Z`, fill: '#2dd4bf', w: 5 }, T('PIX', x, y + 14, 34, '#ffffff')];
    [[180, 1150, '#f97316'], [380, 1150, '#3b82f6'], [580, 1150, '#a855f7']].forEach(([x, y, c], i) => P(92.35 + i * 0.1, [...mini(x, y, 1.1, c, '#111827', ['#f1c9a5', '#8d5524', '#e0ac69'][i]), T('$$$', x, y + 280, 54, '#15803d')], { loop: 'hop', ph: i * 0.3 }));
    [[150, 520], [330, 600], [520, 500], [250, 760], [460, 820], [600, 700]].forEach(([x, y], i) => P(92.4 + i * 0.08, pix(x, y), { loop: 'fall', ph: i * 0.29 }));
    const e = makeChar({ x: 860, y: 1100, s: 0.46, kind: 'E', outfit: 'blusa', pose: 'rest', mood: 'triste', noLegs: true });
    animate(e.outer, 92.6, { anim: 'fade' });
    P(92.8, [...phoneShape(900, 1500, 120, 200, 0, '#f1f5f9'), T('R$ 0', 900, 1520, 40, INK.red)], { loop: 'wiggle' });
    P(93.4, [cloud(860, 820, 140, 60, '#9ca3af'), { d: 'M 790 900 l -10 30 M 850 910 l -10 30 M 910 900 l -10 30', c: INK.blue, w: 6 }], { loop: 'float' });
    TX(93.6, 'e eu??', 860, 1720, 80, INK.red, 4, { anim: 'slam', loop: 'shake' });
  }

  // 25) lista de nomes (100,15–104,3)
  shot([[100.15, 104.3]]);
  {
    P(100.2, [box(110, 470, 860, 1000, 8, '#f5f5f4', null, 8), T('JORNAL DO DIA', 540, 570, 76, INK.black), { d: 'M 150 610 L 930 610 M 150 620 L 930 620', w: 5 },
      T('A LISTA DO VORCARO', 540, 710, 62, INK.red)], { anim: 'slam' });
    for (let i = 0; i < 6; i++) P(100.7 + i * 0.25, [T('-', 170, 820 + i * 100, 60, INK.black, 'start'), squiggle(210, 800 + i * 100, 260 + (i % 3) * 120, '#374151', 6)], { anim: 'fade' });
    P(101.0, [box(760, 760, 170, 170, 10, '#ffffff', null, 6), box(760, 760, 170, 50, 10, '#dc2626', null, 6), T('todo', 845, 860, 40, INK.black), T('dia!', 845, 905, 40, INK.black)], { loop: 'wiggle' });
    const e = makeChar({ x: 800, y: 1450, s: 0.36, kind: 'E', outfit: 'blusa', pose: 'rest', mood: 'confusa', noLegs: true });
    e.armL(SH[0], [-170, 330], [-30, 280], 0, 1);
    animate(e.outer, 102.35, { anim: 'fly', fx: 400, loop: 'bounce' });
    stamp(103.4, 'SÓ EU NÃO PARTICIPEI?!', 480, 1690, 62, INK.red, -4, { loop: 'shake' });
  }

  // CTA (110,1–fim)
  shot([[110.1, 999]]);
  {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 560, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 650, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@caderno_amarelo', 380, 650 + 190 * 0.62, 84, INK.black, g).strokes);
    animate(g, 110.2, { loop: 'float' });
    const v = makeChar({ x: 330, y: 1150, s: 0.42, kind: 'V', outfit: 'preso', pose: 'festa', mood: 'euforia' });
    animate(v.outer, 110.4, { loop: 'hop' });
    const e = makeChar({ x: 760, y: 1150, s: 0.42, kind: 'E', outfit: 'blusa', pose: 'festa', mood: 'euforia' });
    put([{ d: 'M -92 560 L -92 760 M 92 560 L 92 760', c: '#1f2937', w: 40 }], e.root);
    animate(e.outer, 110.5, { loop: 'hop', ph: 0.4 });
    TX(110.8, 'kkkkkk', 540, 1620, 90, INK.orange, -4, { loop: 'wiggle' });
  }
};
