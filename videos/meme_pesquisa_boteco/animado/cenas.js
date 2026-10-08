// Meme "pesquisa de boteco" no estilo Caderno Amarelo (formato B, desenho animado), com o áudio original
// do vídeo de @mateuscidrao. Embaixo fica o boteco: o entrevistador (coque, óculos redondos, bigode, tatuagens,
// camiseta branca com estampa amarela) segura o microfone e, do outro lado da mesa, entra um velhinho por vez,
// desenhado como no vídeo original:
//   A) seu da latinha: magro, cabelo grisalho enrolado, bigode branco, camiseta cinza listrada, latinha vermelha;
//   B) seu de rosa: camisa rosa e óculos escuros;
//   C) seu do boné PN: boné preto, barba branca cheia, camisa polo cinza, relógio;
//   D) seu sem camisa: cabelão e barbona brancos, bronzeado, cachaça na mesa.
// Em cima, cada fala ganha seu desenho. A boca de cada um só mexe nas janelas da própria fala (FALA),
// marcadas pela transcrição e conferidas nos quadros do vídeo original.
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const r1 = n => Math.round(n * 10) / 10;
  const MOUTH = '#6b1f2b';
  const ellipse = (cx, cy, rx, ry) => WB.arcPath(cx, cy, rx, ry, 0, Math.PI * 2, 48) + ' Z';
  const backOut = u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };

  // energia do áudio original, 20 valores por segundo (0–9)
  const ENV = '311598146616643066640002677618568056164257338676510200000011264107888644799855754444444400320011011312111713665456255455523746653100004447404400531123111467568516615314607543646556542667722100137757403348535524412323246324226776756664595157355540460048452134676750253872116555026544215501416405742211121025313322333321376666630000123001444313630045666621274410456663153342200471443036245432357300356514004532110024521420260034100021167436762013445300541035006456524674310000000269999349973210115411530011110045003100442233443334212201332233200013510366551043415500122101564567873775386111773203666412221785664656116541001674521222238546777756789857425777887878766769734534254158545764797534203137347731576640066787416730028427435368642000059765645454023321663147768799501017666630000001000356544786568743210167899976653100000000003674695773036643461174500288433555410101010000000000265000486510046541682177664012357874451136451164475784746401657765344000000000000000002325210006486125453652476553427645664376342344435022064531466511265102740122255677665284166654444543784127551111132846637721264533477999996999999989999999951474165661102463425769765662376756651266405663000277651176247563066212183077563536757764566525666575743483166305644225562443375447411212332263037264251777431133110242125884099553127765663655666767684257654117556327451353828675763127748787732465744566653566479575821774555689852454320000000000000000000000000000000000000000000000000000000000000000000000';
  const envAt = (t) => {
    const x = t * 20, i = Math.floor(x), f = x - i;
    const a = +(ENV[i] || 0), b = +(ENV[i + 1] || 0);
    return (a + (b - a) * f) / 9;
  };
  // quem fala quando (segundos do áudio original)
  const FALA = {
    E: [[0.10, 2.85], [5.10, 6.70], [7.65, 9.65], [11.58, 15.05], [28.55, 31.0], [32.6, 33.8], [34.75, 36.9], [48.9, 53.3], [53.75, 54.3], [56.26, 60.2], [62.5, 63.0], [64.4, 64.95], [67.0, 67.8]],
    A: [[3.10, 4.40]],
    B: [[6.75, 7.60]],
    C: [[9.70, 11.55], [15.1, 25.35], [25.4, 28.45], [31.4, 32.5], [33.95, 34.6]],
    D: [[37.1, 43.98], [44.2, 48.85], [53.4, 53.75], [55.1, 56.2], [60.28, 62.3], [63.0, 64.2], [65.0, 66.95], [67.85, 70.1]],
  };
  const talking = (wins, t) => wins.some(([a, b]) => t >= a && t <= b);

  // ---------------- montagem de itens (traços + preenchimentos) ----------------
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
      const fillEl = s.fill ? WB.mk('path', { d: s.d, fill: s.fill, 'fill-opacity': 0, stroke: 'none' }, g) : null;
      if (fillEl && s.fop !== undefined) fillEl.dataset.fop = s.fop;
      const st = s.c === 'none' ? [] : WB.strokePath(s.d, s.c || INK.black, s.w || 7, g, s.op ? { opacity: s.op } : {});
      if (fillEl) fills.push({ el: fillEl, st });
      strokes.push(...st);
    }
    return { g, strokes, fills };
  }
  const showAll = (it) => { WB.showNow(it.strokes); it.fills.forEach(f => f.el.setAttribute('fill-opacity', f.el.dataset.fop ?? 1)); return it; };
  function animate(g, t0, o = {}) {
    const bb = g.getBBox();
    const ox = o.ox ?? bb.x + bb.width / 2, oy = o.oy ?? bb.y + bb.height / 2;
    const kind = o.anim || 'pop', loop = o.loop, ph = o.ph || 0;
    WB.effect((t) => {
      const tt = t - t0;
      if (tt < 0 || (o.until !== undefined && t > o.until)) { g.setAttribute('opacity', 0); return; }
      let k = 1, rot = 0, dx = 0, dy = 0, op = 1;
      if (kind === 'slam') { k = 1 + 0.9 * Math.pow(1 - clamp(tt / 0.2), 2); op = clamp(tt / 0.08); }
      else if (kind === 'fly') { const v = ease(clamp(tt / 0.5)); dx = (o.fx || 0) * (1 - v); dy = (o.fy || 0) * (1 - v); rot = (o.fr || 0) * (1 - v); }
      else { k = backOut(clamp(tt / 0.38)); op = clamp(tt / 0.12); }
      const ts = tt + ph;
      if (loop === 'shake') rot += Math.sin(ts * 40) * 5 * Math.exp(-tt * 2);
      if (loop === 'tremble') { dx += Math.sin(ts * 47) * 4; rot += Math.sin(ts * 31) * 2; }
      if (loop === 'wiggle') rot += Math.sin(ts * 5) * 3;
      if (loop === 'drunk') { rot += Math.sin(ts * 2.2) * 7; dx += Math.sin(ts * 1.3) * 14; }
      if (loop === 'bounce') dy -= Math.abs(Math.sin(ts * 5)) * 16;
      if (loop === 'hop') dy -= Math.abs(Math.sin(ts * 8)) * 26;
      if (loop === 'float') dy += Math.sin(ts * 2.4) * 9;
      if (loop === 'rise') { dy -= tt * 60; op *= clamp(1.4 - tt * 0.9); }
      if (loop === 'rain') { dy += (ts * 200) % 300 - 60; }
      if (loop === 'pulse') k *= 1 + 0.07 * Math.sin(ts * 9);
      if (loop === 'spin') rot += Math.sin(ts * 9) * 8;
      if (loop === 'turn') rot += tt * 300;
      g.setAttribute('opacity', op.toFixed(3));
      g.setAttribute('transform', `translate(${(ox + dx).toFixed(1)} ${(oy + dy).toFixed(1)}) rotate(${rot.toFixed(2)}) ` +
        `scale(${k.toFixed(3)}) translate(${-ox} ${-oy})`);
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
    if (o.rot) parent = WB.mk('g', { transform: `rotate(${o.rot} ${o.rx ?? 540} ${o.ry ?? 600})` }, parent);
    const it = showAll(build(specs, parent));
    animate(it.g, bt, o);
    return it;
  }

  // ---------------- desenhos ----------------
  const box = (x, y, w, h, r, fill, c, wd) => ({ d: WB.roundRectPath(x, y, w, h, r), fill, c, w: wd || 6 });
  const circ = (x, y, r, fill, c, wd) => ({ d: WB.circlePath(x, y, r), fill, c, w: wd || 6 });
  const S = (x, y, s) => (dx, dy) => `${r1(x + dx * s)} ${r1(y + dy * s)}`;
  function stamp(bt, text, cx, cy, size, color, rot, o = {}) {
    const w = WB.measure(text, size) + 70, h = size * 1.45;
    return P(bt, [{ d: WB.roughRect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), fill: o.bg || '#fffdf5', c: color, w: 10 },
      T(text, cx, cy + size * 0.33, size, color)], Object.assign({ rot, rx: cx, ry: cy, anim: 'slam' }, o));
  }
  const qmark = (x, y, s, c) => T('?', x, y, 150 * s, c);
  function burst(x, y, r, fill, c = INK.red) {
    let d = '';
    for (let i = 0; i <= 20; i++) {
      const a = -Math.PI / 2 + (i / 20) * Math.PI * 2, rr = i % 2 ? r * 0.62 : r;
      d += (i ? ' L ' : 'M ') + r1(x + Math.cos(a) * rr * 1.35) + ' ' + r1(y + Math.sin(a) * rr);
    }
    return { d: d + ' Z', fill, c, w: 7 };
  }
  function heart(x, y, s, fill = '#ef4444') {
    const p = S(x, y, s);
    return { d: `M ${p(0, 30)} C ${p(-60, -10)} ${p(-40, -60)} ${p(0, -30)} C ${p(40, -60)} ${p(60, -10)} ${p(0, 30)} Z`, fill, c: '#991b1b', w: 5 };
  }
  function signpost(x, y) {
    return [{ d: `M ${x} ${y - 40} L ${x} ${y + 330}`, c: '#8b5a2b', w: 20 },
      { d: `M ${x - 20} ${y} L ${x - 330} ${y} L ${x - 380} ${y + 55} L ${x - 330} ${y + 110} L ${x - 20} ${y + 110} Z`, fill: '#fecaca', c: INK.red, w: 7 },
      T('ESQUERDA', x - 190, y + 76, 62, INK.red),
      { d: `M ${x + 20} ${y + 140} L ${x + 330} ${y + 140} L ${x + 380} ${y + 195} L ${x + 330} ${y + 250} L ${x + 20} ${y + 250} Z`, fill: '#bfdbfe', c: INK.blue, w: 7 },
      T('DIREITA', x + 190, y + 216, 62, INK.blue)];
  }
  function flagBR(x, y, w) {
    const h = w * 0.7;
    return [{ d: `M ${x - w / 2 - 14} ${y - h / 2 - 20} L ${x - w / 2 - 14} ${y + h / 2 + 200}`, c: '#6b7280', w: 12 },
      box(x - w / 2, y - h / 2, w, h, 6, '#16a34a', null, 7),
      { d: `M ${x - w * 0.42} ${y} L ${x} ${y - h * 0.4} L ${x + w * 0.42} ${y} L ${x} ${y + h * 0.4} Z`, fill: '#facc15', w: 5 },
      circ(x, y, h * 0.24, '#1d4ed8', null, 5),
      { d: `M ${x - h * 0.23} ${y - 6} Q ${x} ${y - 22} ${x + h * 0.23} ${y + 4}`, c: '#ffffff', w: 7 }];
  }
  function thumbsUp(x, y, s, skin = '#e8bf9a') {
    const p = S(x, y, s);
    return [box(x - 60 * s, y - 10 * s, 120 * s, 110 * s, 26 * s, skin, null, 7),
      { d: `M ${p(-40, -6)} L ${p(-34, -120)} Q ${p(-20, -150)} ${p(4, -128)} L ${p(10, -6)} Z`, fill: skin, w: 7 },
      { d: `M ${p(-60, 30)} L ${p(58, 30)} M ${p(-60, 62)} L ${p(58, 62)}`, w: 5 },
      box(x - 82 * s, y + 4 * s, 26 * s, 92 * s, 8, '#ffffff', null, 6)];
  }
  function moneyBag(x, y, s, label = 'R$', fill = '#d6b36a') {
    const p = S(x, y, s);
    return [{ d: `M ${p(-34, -96)} Q ${p(-80, -150)} ${p(-36, -150)} L ${p(36, -150)} Q ${p(80, -150)} ${p(34, -96)} Q ${p(130, -40)} ${p(110, 50)} Q ${p(90, 110)} ${p(0, 110)} Q ${p(-90, 110)} ${p(-110, 50)} Q ${p(-130, -40)} ${p(-34, -96)} Z`, fill, w: 7 },
      { d: `M ${p(-44, -96)} L ${p(44, -96)}`, c: '#7c5a1a', w: 10 },
      T(label, x, y + 40 * s, 84 * s, '#166534')];
  }
  function bill(x, y, rot, s = 1) {
    const p = S(x, y, s);
    const a = rot * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
    const q = (dx, dy) => p(dx * c - dy * sn, dx * sn + dy * c);
    return [{ d: `M ${q(-60, -30)} L ${q(60, -30)} L ${q(60, 30)} L ${q(-60, 30)} Z`, fill: '#86efac', c: '#166534', w: 5 },
      { d: WB.circlePath(x, y, 16 * s), c: '#166534', w: 4 }];
  }
  function cabare(x, y) {
    return [box(x - 260, y - 200, 520, 400, 10, '#7c3aed', null, 8),
      { d: `M ${x - 290} ${y - 190} L ${x} ${y - 330} L ${x + 290} ${y - 190} Z`, fill: '#4c1d95', w: 8 },
      box(x - 230, y - 160, 460, 110, 20, '#111827', '#f472b6', 8), T('CABARÉ', x, y - 80, 90, '#f472b6'),
      box(x - 60, y + 40, 120, 160, 50, '#f9a8d4', null, 6),
      box(x - 210, y - 20, 100, 90, 8, '#fde68a', null, 6), box(x + 110, y - 20, 100, 90, 8, '#fde68a', null, 6),
      heart(x - 160, y + 120, 0.6, '#f472b6'), heart(x + 165, y + 120, 0.6, '#f472b6'),
      T('*', x - 320, y - 240, 70, '#facc15'), T('*', x + 330, y - 260, 80, '#f472b6'), T('*', x + 300, y + 60, 56, '#facc15')];
  }
  function wallet(x, y) {
    return [box(x - 170, y - 90, 340, 190, 18, '#92400e', null, 8), box(x - 150, y - 60, 300, 40, 8, '#b45309', null, 5),
      { d: `M ${x + 90} ${y - 40} Q ${x + 150} ${y - 140} ${x + 210} ${y - 120}`, c: '#9ca3af', w: 4 },
      { d: `M ${x + 200} ${y - 150} Q ${x + 160} ${y - 200} ${x + 210} ${y - 190} Q ${x + 230} ${y - 150} ${x + 260} ${y - 200} Q ${x + 290} ${y - 150} ${x + 210} ${y - 140} Z`, fill: '#d6d3d1', w: 4 }];
  }
  function ballotBox(x, y) {
    return [box(x - 170, y - 120, 340, 240, 14, '#e5e7eb', null, 8), box(x - 90, y - 140, 180, 26, 8, '#374151', null, 6),
      T('URNA', x, y + 30, 76, INK.gray),
      { d: `M ${x + 170} ${y - 120} L ${x + 80} ${y - 40} M ${x + 170} ${y - 70} L ${x + 115} ${y - 50} L ${x + 120} ${y - 120} M ${x + 140} ${y - 100} L ${x + 150} ${y - 60}`, c: '#9ca3af', w: 3 },
      { d: `M ${x - 170} ${y + 120} L ${x - 90} ${y + 40} M ${x - 170} ${y + 60} L ${x - 120} ${y + 80} L ${x - 110} ${y + 120}`, c: '#9ca3af', w: 3 }];
  }
  function numCard(x, y, n, col, bg) {
    return [box(x - 140, y - 150, 280, 300, 22, bg, col, 9), T(n, x, y + 60, 190, col)];
  }
  function bottle51(x, y, s = 1) {
    const p = S(x, y, s);
    return [{ d: `M ${p(-30, -250)} L ${p(-30, -170)} Q ${p(-90, -140)} ${p(-90, -80)} L ${p(-90, 200)} Q ${p(-90, 230)} ${p(-60, 230)} L ${p(60, 230)} Q ${p(90, 230)} ${p(90, 200)} L ${p(90, -80)} Q ${p(90, -140)} ${p(30, -170)} L ${p(30, -250)} Z`, fill: '#ecfeff', w: 8 },
      { d: `M ${p(-88, -20)} L ${p(88, -20)} L ${p(88, 140)} L ${p(-88, 140)} Z`, fill: '#facc15', w: 6 },
      T('51', x, y + 100 * s, 130 * s, INK.red),
      box(x - 34 * s, y - 290 * s, 68 * s, 50 * s, 6, '#dc2626', null, 6),
      { d: `M ${p(-60, -100)} L ${p(-60, -40)}`, c: '#ffffff', w: 10 }];
  }
  function trophy(x, y) {
    return [{ d: `M ${x - 120} ${y - 180} L ${x + 120} ${y - 180} Q ${x + 120} ${y + 20} ${x} ${y + 40} Q ${x - 120} ${y + 20} ${x - 120} ${y - 180} Z`, fill: '#facc15', w: 8 },
      { d: `M ${x - 120} ${y - 150} Q ${x - 200} ${y - 150} ${x - 180} ${y - 80} Q ${x - 160} ${y - 30} ${x - 100} ${y - 40} M ${x + 120} ${y - 150} Q ${x + 200} ${y - 150} ${x + 180} ${y - 80} Q ${x + 160} ${y - 30} ${x + 100} ${y - 40}`, w: 10, c: '#ca8a04' },
      box(x - 20, y + 40, 40, 70, 4, '#eab308', null, 6), box(x - 90, y + 110, 180, 50, 8, '#92400e', null, 7),
      T('Nº1', x, y - 50, 90, '#92400e')];
  }
  function bandit(x, y) {
    return [circ(x, y, 110, '#e8bf9a', null, 7),
      { d: `M ${x - 112} ${y - 30} Q ${x} ${y - 70} ${x + 112} ${y - 30} L ${x + 112} ${y + 10} Q ${x} ${y - 20} ${x - 112} ${y + 10} Z`, fill: '#111827', w: 5 },
      circ(x - 40, y - 22, 13, '#ffffff', null, 3), circ(x + 40, y - 22, 13, '#ffffff', null, 3),
      { d: `M ${x - 40} ${y + 50} Q ${x} ${y + 80} ${x + 40} ${y + 50}`, w: 6 },
      { d: `M ${x - 115} ${y - 60} Q ${x} ${y - 190} ${x + 115} ${y - 60} Z`, fill: '#1f2937', w: 6 }];
  }
  function halo(x, y, rx) { return { d: ellipse(x, y, rx, rx * 0.28), c: '#facc15', w: 12 }; }
  function card(x, y, rot, label, red) {
    const g = [];
    const a = rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    const q = (dx, dy) => `${r1(x + dx * c - dy * s)} ${r1(y + dx * s + dy * c)}`;
    g.push({ d: `M ${q(-75, -110)} L ${q(75, -110)} L ${q(75, 110)} L ${q(-75, 110)} Z`, fill: '#ffffff', w: 6 });
    const cx = x - 0 * c, cy = y;
    g.push(T(label, r1(cx + -45 * c - -70 * s), r1(cy + -45 * s + -70 * c), 54, red ? INK.red : INK.black));
    g.push(red ? heart(cx, cy + 10, 0.8, '#ef4444') : { d: `M ${cx} ${cy - 30} L ${cx + 30} ${cy + 20} L ${cx - 30} ${cy + 20} Z M ${cx} ${cy + 20} L ${cx} ${cy + 45}`, fill: '#111827', w: 6 });
    return g;
  }
  function cachacaGlass(x, y, s = 1) {
    const p = S(x, y, s);
    return [{ d: `M ${p(-60, -90)} L ${p(60, -90)} L ${p(45, 90)} L ${p(-45, 90)} Z`, fill: '#f0f9ff', w: 7 },
      { d: `M ${p(-54, -20)} L ${p(54, -20)} L ${p(45, 90)} L ${p(-45, 90)} Z`, fill: '#fef3c7', c: 'none' },
      { d: `M ${p(-57, -50)} L ${p(57, -50)} M ${p(-52, 10)} L ${p(52, 10)}`, c: '#94a3b8', w: 4 }];
  }
  function angelLady(x, y) {
    return [{ d: `M ${x - 60} ${y + 40} Q ${x - 260} ${y - 80} ${x - 220} ${y + 90} Q ${x - 160} ${y + 170} ${x - 50} ${y + 110} Z`, fill: '#ffffff', w: 6 },
      { d: `M ${x + 60} ${y + 40} Q ${x + 260} ${y - 80} ${x + 220} ${y + 90} Q ${x + 160} ${y + 170} ${x + 50} ${y + 110} Z`, fill: '#ffffff', w: 6 },
      { d: `M ${x - 70} ${y + 60} Q ${x} ${y + 30} ${x + 70} ${y + 60} L ${x + 90} ${y + 230} L ${x - 90} ${y + 230} Z`, fill: '#e9d5ff', w: 6 },
      circ(x, y - 30, 80, '#f1c9a5', null, 6),
      circ(x, y - 120, 40, '#d1d5db', null, 5), { d: `M ${x - 82} ${y - 40} Q ${x - 70} ${y - 120} ${x} ${y - 112} Q ${x + 70} ${y - 120} ${x + 82} ${y - 40} Q ${x + 40} ${y - 90} ${x} ${y - 86} Q ${x - 40} ${y - 90} ${x - 82} ${y - 40} Z`, fill: '#d1d5db', w: 5 },
      circ(x - 30, y - 30, 20, null, '#374151', 5), circ(x + 30, y - 30, 20, null, '#374151', 5), { d: `M ${x - 10} ${y - 30} L ${x + 10} ${y - 30}`, c: '#374151', w: 4 },
      { d: `M ${x - 25} ${y + 10} Q ${x} ${y + 28} ${x + 25} ${y + 10}`, w: 5 },
      halo(x, y - 185, 70)];
  }

  // ---------------- rosto (olhos, sobrancelhas, boca) ----------------
  const MOODS = {
    leve: { lid: 0.3, px: 6, py: 1, bi: 2, bo: 0, smile: -1, rot: 0 },
    sorriso: { lid: 0.2, px: 6, py: 0, bi: -6, bo: -2, smile: 11, rot: -4 },
    euforia: { lid: 0, px: 4, py: -6, bi: -14, bo: -10, smile: 12, rot: 6 },
    arregalada: { lid: 0, px: 6, py: -1, bi: -13, bo: -10, smile: -1, rot: 3 },
    pensativa: { lid: 0.05, px: 6, py: -9, bi: -9, bo: -4, smile: -2, rot: 6 },
    confusa: { lid: 0.1, px: 7, py: -4, bi: -9, bo: -2, smile: -4, rot: 8, asym: 1 },
    bebado: { lid: 0.52, px: 5, py: 3, bi: 2, bo: 4, smile: 6, rot: -4 },
    bebado2: { lid: 0.62, px: 2, py: 4, bi: -4, bo: 2, smile: 9, rot: 6, asym: 0.6 },
    risada: { lid: 0.85, px: 0, py: 0, bi: -10, bo: -4, smile: 14, rot: 9 },
    serio: { lid: 0.35, px: 6, py: 2, bi: 6, bo: -2, smile: -4, rot: -2 },
  };
  const keys = ['lid', 'px', 'py', 'bi', 'bo', 'smile', 'rot', 'asym'];
  function stateAt(TL, t) {
    let i = 0;
    while (i + 1 < TL.length && TL[i + 1][0] <= t) i++;
    const cur = TL[i], prev = TL[Math.max(0, i - 1)];
    const u = i === 0 ? 1 : ease(clamp((t - cur[0]) / 0.3));
    const m0 = MOODS[prev[1]], m1 = MOODS[cur[1]];
    const s = { pose0: prev[2] || 'rest', pose1: cur[2] || 'rest', pu: i === 0 ? 1 : ease(clamp((t - cur[0]) / 0.35)) };
    for (const k of keys) s[k] = lerp(m0[k] || 0, m1[k] || 0, u);
    return s;
  }
  function blink(t, off) {
    let v = 0;
    for (let k = 0; k < 30; k++) {
      const tb = off + k * 2.7 + 0.6 * Math.sin(k * 1.7), d = Math.abs(t - tb);
      if (d < 0.09) v = Math.max(v, 1 - d / 0.09);
    }
    return v;
  }
  function makeFace(headG, cfg) {
    const rx = cfg.rx || 100, ry = cfg.ry || 118;
    showAll(build([cfg.back || [], { d: ellipse(-rx + 2, 12, 15, 24), fill: cfg.skin, w: 5 }, { d: ellipse(rx - 2, 12, 15, 24), fill: cfg.skin, w: 5 },
      { d: ellipse(0, 0, rx, ry), fill: cfg.skin, w: 7 }, cfg.wrinkles || [], { d: 'M -4 26 Q -14 46 0 50 Q 9 51 12 46', w: 5, c: '#5a3a22' }, cfg.hair], headG));
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
    if (cfg.extra) showAll(build(cfg.extra, dyn));
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
        mouth.setAttribute('fill', sm > 10 ? MOUTH : 'none');
        mouth.setAttribute('d', sm > 10 ? `M -30 74 Q 0 ${(74 + sm * 2.6).toFixed(1)} 30 74 Z` : `M -26 76 Q 0 ${(76 + sm * 1.6).toFixed(1)} 26 76`);
      } else {
        const rx2 = 26 - 4 * op, top = 76 - 4 - 6 * op + Math.max(0, sm) * 0.3, bot = 76 + 6 + 32 * op + Math.max(0, sm) * 0.6;
        mouth.setAttribute('fill', MOUTH);
        mouth.setAttribute('d', `M ${(-rx2).toFixed(1)} 76 Q 0 ${(2 * top - 76).toFixed(1)} ${rx2.toFixed(1)} 76 Q 0 ${(2 * bot - 76).toFixed(1)} ${(-rx2).toFixed(1)} 76 Z`);
      }
    };
  }
  // braço que sai do ombro: ombro → cotovelo → mão; prop = objeto na mão (microfone, latinha), tattoo = desenhos no antebraço
  function makeArm(parent, skin, sleeve, wOut, wIn, handR, o = {}) {
    const g = WB.mk('g', {}, parent);
    const out = WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': wOut, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    const inn = WB.mk('path', { d: '', fill: 'none', stroke: skin, 'stroke-width': wIn, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    const tat = o.tattoo ? WB.mk('path', { d: '', fill: 'none', stroke: '#334155', 'stroke-width': wIn * 0.45, 'stroke-dasharray': '9 7 3 7', 'stroke-linecap': 'round', opacity: 0.75 }, g) : null;
    const slO = WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': wOut + 10, 'stroke-linecap': 'round' }, g);
    const slI = WB.mk('path', { d: '', fill: 'none', stroke: sleeve, 'stroke-width': wIn + 10, 'stroke-linecap': 'round' }, g);
    const hand = WB.mk('g', {}, g);
    const finger = WB.mk('path', { d: `M ${handR * 0.4} ${-handR * 0.45} Q ${handR * 2.2} ${-handR * 0.75} ${handR * 2.9} ${-handR * 0.5} Q ${handR * 3.1} ${-handR * 0.1} ${handR * 2.8} ${handR * 0.1} Q ${handR * 1.8} ${handR * 0.05} ${handR * 0.6} ${handR * 0.4} Z`, fill: skin, stroke: INK.black, 'stroke-width': 5, opacity: 0 }, hand);
    if (o.prop) showAll(build(o.prop, hand));
    WB.mk('circle', { cx: 0, cy: 0, r: handR, fill: skin, stroke: INK.black, 'stroke-width': 5 }, hand);
    if (o.watch) WB.mk('rect', { x: -handR * 1.6, y: -handR * 0.75, width: handR * 0.6, height: handR * 1.5, rx: 4, fill: '#111827', stroke: INK.black, 'stroke-width': 3 }, hand);
    return function set(sh, el, h, rot, point) {
      const d = `M ${r1(sh[0])} ${r1(sh[1])} L ${r1(el[0])} ${r1(el[1])} L ${r1(h[0])} ${r1(h[1])}`;
      out.setAttribute('d', d); inn.setAttribute('d', d);
      if (tat) tat.setAttribute('d', `M ${r1(lerp(el[0], h[0], 0.12))} ${r1(lerp(el[1], h[1], 0.12))} L ${r1(lerp(el[0], h[0], 0.78))} ${r1(lerp(el[1], h[1], 0.78))}`);
      const mx = sh[0] + (el[0] - sh[0]) * 0.45, my = sh[1] + (el[1] - sh[1]) * 0.45;
      const sd = `M ${r1(sh[0])} ${r1(sh[1])} L ${r1(mx)} ${r1(my)}`;
      slO.setAttribute('d', sd); slI.setAttribute('d', sd);
      hand.setAttribute('transform', `translate(${r1(h[0])} ${r1(h[1])}) rotate(${r1(rot)})`);
      finger.setAttribute('opacity', point.toFixed(2));
    };
  }
  const lerpP = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const poseLerp = (P0, P1, u) => ({ el: lerpP(P0.el, P1.el, u), h: lerpP(P0.h, P1.h, u), r: lerp(P0.r || 0, P1.r || 0, u), pt: lerp(P0.pt || 0, P1.pt || 0, u) });
  const torsoD = (w = 1) => {
    const q = (x, y) => `${r1(x * w)} ${y}`;
    return `M ${q(-84, 0)} Q ${q(-96, -120)} ${q(-98, -170)} Q ${q(-96, -205)} ${q(-60, -212)} Q ${q(0, -196)} ${q(60, -212)} Q ${q(96, -205)} ${q(98, -170)} Q ${q(96, -120)} ${q(84, 0)} Z`;
  };
  const neck = (skin) => ({ d: 'M -26 -250 L -24 -200 L 24 -200 L 26 -250 Z', fill: skin, w: 6 });

  // personagem genérico: tronco + braços + cabeça. pose do braço por nome; TL = [tempo, humor, pose]
  function makeChar(cfg) {
    const root = WB.mk('g', {}, WB.overlay);
    showAll(build(cfg.torso, root));
    const armsG = WB.mk('g', {}, root);
    const w = cfg.armW || 1;
    const armL = makeArm(armsG, cfg.skin, cfg.sleeve, 44, 32, 26, cfg.armLopt || {});
    const armR = makeArm(armsG, cfg.skin, cfg.sleeve, 44, 32, 26, cfg.armRopt || {});
    const head = WB.mk('g', {}, root);
    const face = makeFace(head, cfg.face);
    if (cfg.headTop) showAll(build(cfg.headTop, head));
    const SH_L = [-95 * w, -185], SH_R = [95 * w, -185];
    return function update(t, pos, opacity) {
      root.setAttribute('opacity', opacity.toFixed(3));
      if (opacity < 0.01) return;
      const s = stateAt(cfg.TL, t);
      const op = talking(FALA[cfg.id], t) ? clamp(envAt(t) * 1.2) : 0;
      const talk = op > 0.05 ? 1 : 0;
      face(t, s, op, cfg.look);
      const sway = cfg.drunk ? Math.sin(t * 1.15 + cfg.ph) * 3.5 : 0;
      let hic = 0;
      for (const h of cfg.hics || []) if (t > h && t < h + 0.35) hic = Math.sin(Math.PI * (t - h) / 0.35);
      const laugh = s.pose1 === 'ri' ? Math.abs(Math.sin(t * 14)) * 10 : 0;
      root.setAttribute('transform', `translate(${r1(pos[0])} ${r1(pos[1] - hic * 22 - laugh)}) rotate(${r1(sway + (pos[2] || 0))} 0 0) scale(${cfg.sc})`);
      const hr = s.rot + talk * 2.2 * Math.sin(t * 6.5) + (cfg.drunk ? Math.sin(t * 1.7 + cfg.ph) * 7 : 0);
      head.setAttribute('transform', `translate(0 ${r1(-340 + talk * 2 * Math.sin(t * 11))}) rotate(${r1(hr)} 0 100)`);
      const P0 = cfg.POSE[s.pose0], P1 = cfg.POSE[s.pose1];
      const pl = poseLerp(P0.L, P1.L, s.pu), pr = poseLerp(P0.R, P1.R, s.pu);
      const wave = (s.pose1 === 'gesto' || s.pose1 === 'ri') ? Math.sin(t * 7) * 16 : 0;
      armL(SH_L, pl.el, [pl.h[0], pl.h[1] + wave], pl.r, pl.pt);
      armR(SH_R, pr.el, [pr.h[0], pr.h[1] - wave], pr.r, pr.pt);
    };
  }

  document.getElementById('hand').style.display = 'none';

  // ---------------- cenários do boteco (embaixo) ----------------
  const HIP = 1643, OLD_X = 300, E_X = 790;
  function bgGroup(t0, t1) {
    const g = WB.mk('g', {}, WB.overlay);
    WB.effect(t => g.setAttribute('opacity', (clamp((t - t0) / 0.3 + (t0 <= 0 ? 1 : 0)) * (1 - clamp((t - t1) / 0.3))).toFixed(3)));
    return g;
  }
  // A) bar com prateleira verde cheia de garrafas
  {
    const g = bgGroup(0, 4.95);
    const sp = [box(40, 985, 1000, 805, 10, '#bbf7d0', '#15803d', 7)];
    for (let row = 0; row < 5; row++) {
      const y = 1110 + row * 120;
      sp.push({ d: `M 40 ${y} L 1040 ${y}`, c: '#15803d', w: 9 });
      for (let i = 0; i < 12; i++) {
        const x = 80 + i * 80 + (row % 2) * 30, col = ['#b45309', '#16a34a', '#dc2626', '#fde68a', '#7c3aed', '#0ea5e9'][(i + row * 2) % 6];
        sp.push({ d: `M ${x - 14} ${y - 6} L ${x - 14} ${y - 60} Q ${x} ${y - 74} ${x + 14} ${y - 60} L ${x + 14} ${y - 6} Z M ${x - 5} ${y - 72} L ${x - 5} ${y - 96} L ${x + 5} ${y - 96} L ${x + 5} ${y - 72}`, fill: col, w: 4, fop: 0.75 });
      }
    }
    showAll(build(sp, g));
  }
  // B/C) parede vermelha com a porta de enrolar amarela
  {
    const g = bgGroup(4.95, 34.7);
    showAll(build([box(40, 985, 1000, 805, 10, '#fca5a5', '#dc2626', 7),
      box(40, 985, 300, 300, 6, '#fde047', '#ca8a04', 6),
      { d: [0, 1, 2, 3, 4, 5, 6, 7].map(i => `M 40 ${1010 + i * 34} L 340 ${1010 + i * 34}`).join(' '), c: '#ca8a04', w: 4 },
      box(40, 1285, 330, 22, 4, '#facc15', null, 5), box(860, 985, 30, 805, 4, '#1f2937', null, 4),
      box(890, 985, 150, 805, 4, '#fed7aa', '#c2410c', 5)], g));
  }
  // D) feira/mercado: pilhas de cadeiras de plástico e bandeirinhas do Brasil
  {
    const g = bgGroup(34.7, 99);
    const sp = [box(40, 985, 1000, 805, 10, '#e0f2fe', '#64748b', 6), { d: 'M 40 1030 Q 300 1080 540 1030 Q 780 1080 1040 1030', c: '#6b7280', w: 4 }];
    [100, 230, 360, 500, 640, 780, 920].forEach((x, i) => {
      const y = 1030 + Math.sin((x - 40) / 1000 * Math.PI * 2) * 0 + (i % 2 ? 22 : 18);
      sp.push({ d: `M ${x - 34} ${y} L ${x + 34} ${y} L ${x + 34} ${y + 44} L ${x - 34} ${y + 44} Z`, fill: '#16a34a', w: 4 },
        { d: `M ${x - 26} ${y + 22} L ${x} ${y + 6} L ${x + 26} ${y + 22} L ${x} ${y + 38} Z`, fill: '#facc15', w: 3 }, circ(x, y + 22, 9, '#1d4ed8', null, 3));
    });
    for (const x0 of [60, 470, 880]) {
      for (let k = 0; k < 14; k++) {
        const y = 1130 + k * 30;
        sp.push({ d: `M ${x0} ${y} L ${x0 + 150} ${y} L ${x0 + 140} ${y + 22} L ${x0 + 10} ${y + 22} Z`, fill: k % 3 === 1 ? '#86efac' : '#ffffff', w: 4 });
      }
    }
    showAll(build(sp, g));
  }
  showAll(build([{ d: 'M 30 1790 L 1050 1790', c: '#9ca3af', w: 8 }], WB.overlay));

  // ---------------- os personagens ----------------
  const OLD_POSE = {
    rest: { L: { el: [-140, -95], h: [-110, -40] }, R: { el: [140, -95], h: [110, -40] } },
    gesto: { L: { el: [-140, -95], h: [-110, -40] }, R: { el: [200, -150], h: [230, -270], r: -60 } },
    aponta: { L: { el: [-140, -95], h: [-110, -40] }, R: { el: [170, -280], h: [190, -420], r: -90, pt: 1 } },
    joia: { L: { el: [-140, -95], h: [-110, -40] }, R: { el: [190, -170], h: [200, -300], r: -90, pt: 1 } },
    bebe: { L: { el: [-170, -150], h: [-55, -250], r: -30 }, R: { el: [140, -95], h: [110, -40] } },
    boca: { L: { el: [-140, -95], h: [-110, -40] }, R: { el: [120, -150], h: [10, -255], r: 180 } },
    ri: { L: { el: [-150, -110], h: [-60, -60] }, R: { el: [150, -110], h: [60, -60] } },
    ombros: { L: { el: [-190, -130], h: [-250, -230], r: -120 }, R: { el: [190, -130], h: [250, -230], r: -60 } },
    zip: { L: { el: [-140, -95], h: [-110, -40] }, R: { el: [130, -160], h: [20, -262], r: 180, pt: 1 } },
  };
  const BEBADO = ['#ef6b6b', '#f87171'];
  const redNose = { d: WB.circlePath(4, 42, 16), fill: BEBADO[0], c: '#991b1b', w: 4 };
  const cheeks = [{ d: ellipse(-60, 44, 20, 11), fill: BEBADO[1], c: 'none', fop: 0.5 }, { d: ellipse(60, 44, 20, 11), fill: BEBADO[1], c: 'none', fop: 0.5 }];

  // A) seu da latinha
  const A_SKIN = '#a8693c';
  const A = makeChar({
    id: 'A', sc: 1.15, skin: A_SKIN, sleeve: '#6b7280', look: 1, drunk: true, ph: 0.3, armW: 0.88,
    torso: [{ d: torsoD(0.88), fill: '#6b7280', w: 7 },
      { d: 'M -80 -150 L 80 -150 M -82 -110 L 82 -110 M -80 -70 L 80 -70 M -76 -30 L 76 -30', c: '#4b5563', w: 9 },
      neck(A_SKIN), { d: 'M -40 -208 Q 0 -175 40 -208', w: 6 }],
    face: {
      id: 'a', skin: A_SKIN, brow: '#d4d4d4', blink: 0.9, rx: 90, ry: 120,
      back: [{ d: WB.cloudPath(0, -70, 128, 92), fill: '#d4d4d4', w: 6 }],
      wrinkles: [{ d: 'M -50 -62 Q 0 -72 50 -62 M -40 -46 Q 0 -54 40 -46 M -86 40 Q -74 70 -60 96 M 86 40 Q 74 70 60 96', c: '#7c4a26', w: 4 }],
      hair: [{ d: WB.cloudPath(0, -100, 92, 42), fill: '#e5e5e5', w: 5 }],
      extra: [redNose, cheeks, { d: 'M -56 66 Q -40 46 0 56 Q 40 46 56 66 Q 50 76 30 68 Q 0 74 -30 68 Q -50 76 -56 66 Z', fill: '#f5f5f5', w: 4 }],
    },
    armLopt: { prop: [box(-26, -86, 52, 92, 8, '#dc2626', null, 5), { d: 'M -26 -60 L 26 -60', c: '#ffffff', w: 6 }, T('B', 0, -20, 34, '#ffffff')] },
    POSE: OLD_POSE,
    hics: [1.4, 4.6],
    TL: [[-9, 'bebado'], [1.0, 'confusa'], [2.0, 'bebado2'], [3.1, 'bebado2', 'gesto'], [4.4, 'risada', 'bebe']],
  });
  // B) seu de rosa de óculos escuros
  const B_SKIN = '#e2a77f';
  const B = makeChar({
    id: 'B', sc: 1.15, skin: B_SKIN, sleeve: '#f9a8c0', look: 1, drunk: true, ph: 1.1,
    torso: [{ d: torsoD(1.05), fill: '#f9a8c0', w: 7 }, neck(B_SKIN),
      { d: 'M -46 -210 L 0 -160 L 46 -210 L 30 -222 L 0 -190 L -30 -222 Z', fill: '#fbcfe8', w: 5 },
      { d: 'M 0 -160 L 0 0', c: '#db2777', w: 4 }, circ(0, -120, 5, '#ffffff', null, 2), circ(0, -80, 5, '#ffffff', null, 2),
      box(30, -150, 46, 50, 4, '#f9a8c0', '#db2777', 4)],
    face: {
      id: 'b', skin: B_SKIN, brow: '#e5e7eb', blink: 1.3,
      hair: [{ d: 'M -100 -10 Q -104 -70 -70 -96 Q -84 -50 -86 -6 Z M 100 -10 Q 104 -70 70 -96 Q 84 -50 86 -6 Z', fill: '#f3f4f6', w: 4 },
        { d: 'M -40 -90 Q 0 -104 40 -90', c: '#c2855e', w: 4 }],
      extra: [redNose, cheeks,
        { d: 'M -74 -10 L -8 -10 Q -6 24 -40 28 Q -72 26 -74 -10 Z M 74 -10 L 8 -10 Q 6 24 40 28 Q 72 26 74 -10 Z', fill: '#111827', w: 5 },
        { d: 'M -8 -6 L 8 -6 M -74 -8 L -100 -2 M 74 -8 L 100 -2', w: 5 }, { d: 'M -60 -2 L -46 -2 M 22 -2 L 36 -2', c: '#9ca3af', w: 4 }],
    },
    armLopt: { prop: [{ d: 'M -24 -70 L 24 -70 L 18 10 L -18 10 Z', fill: '#f8fafc', w: 4 }] },
    POSE: OLD_POSE,
    TL: [[-9, 'bebado'], [6.75, 'sorriso', 'joia'], [7.65, 'bebado', 'bebe']],
  });
  // C) seu do boné PN
  const C_SKIN = '#d99a73';
  const C = makeChar({
    id: 'C', sc: 1.15, skin: C_SKIN, sleeve: '#c4c8ce', look: 1, drunk: true, ph: 2.0,
    torso: [{ d: torsoD(1.08), fill: '#c4c8ce', w: 7 }, neck(C_SKIN),
      { d: 'M -50 -212 L -10 -170 L -20 -150 L -66 -196 Z M 50 -212 L 10 -170 L 20 -150 L 66 -196 Z', fill: '#d1d5db', w: 5 },
      { d: 'M 0 -170 L 0 -110', c: '#6b7280', w: 4 }, box(28, -150, 50, 56, 4, '#c4c8ce', '#6b7280', 4), { d: 'M 34 -140 L 72 -140', c: '#111827', w: 8 }],
    face: {
      id: 'c', skin: C_SKIN, brow: '#f3f4f6', blink: 2.1,
      hair: [{ d: 'M -98 -20 Q -104 20 -96 50 L -84 40 Q -86 0 -84 -24 Z M 98 -20 Q 104 20 96 50 L 84 40 Q 86 0 84 -24 Z', fill: '#f3f4f6', w: 4 },
        { d: 'M -98 10 Q -104 120 -46 150 Q 0 172 46 150 Q 104 120 98 10 Q 80 60 40 54 Q 0 46 -40 54 Q -80 60 -98 10 Z', fill: '#f8fafc', w: 6 },
        { d: 'M -60 100 l 8 14 M -20 130 l 4 16 M 30 128 l -4 16 M 66 98 l -8 14', c: '#cbd5e1', w: 4 },
        { d: 'M -108 -36 Q -112 -152 0 -156 Q 112 -152 108 -36 Z', fill: '#1f2937', w: 6 },
        { d: 'M -118 -40 Q 0 -66 118 -40 Q 124 -24 106 -22 Q 0 -44 -106 -22 Q -124 -24 -118 -40 Z', fill: '#111827', w: 5 },
        T('PN', 0, -70, 64, '#ffffff')],
      extra: [redNose, { d: 'M -60 64 Q -40 42 0 54 Q 40 42 60 64 Q 40 74 0 66 Q -40 74 -60 64 Z', fill: '#ffffff', w: 4 }],
    },
    armRopt: { watch: true },
    POSE: OLD_POSE,
    hics: [12.4, 26.0],
    TL: [[-9, 'bebado'], [8.0, 'pensativa'], [9.7, 'serio', 'zip'], [11.58, 'bebado', 'rest'], [13.4, 'euforia'], [15.1, 'bebado2', 'gesto'],
      [17.0, 'sorriso', 'gesto'], [18.4, 'bebado', 'aponta'], [19.6, 'pensativa', 'gesto'], [21.6, 'bebado2', 'gesto'], [24.1, 'euforia', 'ombros'],
      [25.4, 'serio', 'aponta'], [27.4, 'bebado2', 'gesto'], [28.5, 'risada', 'ri'], [31.4, 'sorriso', 'gesto'], [32.6, 'risada', 'ri'], [33.95, 'euforia', 'joia']],
  });
  // D) seu sem camisa, cabelão e barbona
  const D_SKIN = '#c4793f';
  const D = makeChar({
    id: 'D', sc: 1.15, skin: D_SKIN, sleeve: D_SKIN, look: 1, drunk: true, ph: 0.7,
    torso: [{ d: torsoD(1.02), fill: D_SKIN, w: 7 }, neck(D_SKIN),
      { d: 'M -70 -120 Q -40 -96 -6 -116 M 70 -120 Q 40 -96 6 -116 M -60 -70 Q -30 -60 -10 -72 M 60 -70 Q 30 -60 10 -72 M -64 -40 Q -30 -30 -10 -42 M 64 -40 Q 30 -30 10 -42', c: '#7c3f16', w: 4 },
      circ(-42, -106, 5, '#7c3f16', 'none'), circ(42, -106, 5, '#7c3f16', 'none'), { d: 'M -2 -14 q 4 6 8 0', c: '#7c3f16', w: 4 }],
    face: {
      id: 'd', skin: D_SKIN, brow: '#f3f4f6', blink: 0.5,
      back: [{ d: 'M -118 -40 Q -146 -176 0 -170 Q 146 -176 118 -40 Q 150 80 140 190 L 120 160 L 112 200 Q 100 120 92 60 L -92 60 Q -100 120 -112 200 L -120 160 L -140 190 Q -150 80 -118 -40 Z', fill: '#eceff3', w: 6 }],
      wrinkles: [{ d: 'M -50 -66 Q 0 -76 50 -66 M -40 -50 Q 0 -58 40 -50', c: '#7c3f16', w: 4 }],
      hair: [{ d: 'M -104 -10 Q -112 -120 0 -126 Q 112 -120 104 -10 Q 92 -70 56 -80 Q 0 -90 -56 -80 Q -92 -70 -104 -10 Z', fill: '#f3f4f6', w: 5 },
        { d: 'M -20 -122 Q -60 -160 -90 -140 M 20 -124 Q 50 -170 96 -150 M 0 -126 Q 10 -160 -10 -176', c: '#cbd5e1', w: 6 },
        { d: 'M -98 0 Q -112 140 -72 230 L -50 206 L -32 262 L -8 222 L 14 272 L 34 222 L 58 254 L 72 210 Q 112 140 98 0 Q 80 60 40 54 Q 0 46 -40 54 Q -80 60 -98 0 Z', fill: '#f8fafc', w: 6 },
        { d: 'M -60 110 l 6 30 M -24 150 l 2 34 M 24 150 l -2 34 M 60 110 l -6 30 M -40 200 l 4 24 M 40 200 l -4 24', c: '#cbd5e1', w: 4 }],
      extra: [redNose, { d: 'M -62 64 Q -40 40 0 54 Q 40 40 62 64 Q 40 76 0 66 Q -40 76 -62 64 Z', fill: '#ffffff', w: 4 }],
    },
    POSE: OLD_POSE,
    hics: [36.2, 54.6, 63.2],
    TL: [[-9, 'bebado'], [35.3, 'pensativa'], [37.1, 'serio', 'gesto'], [38.0, 'euforia', 'aponta'], [40.5, 'sorriso', 'joia'], [44.2, 'serio', 'gesto'],
      [46.2, 'confusa', 'ombros'], [48.4, 'euforia', 'aponta'], [48.9, 'risada', 'boca'], [50.5, 'bebado', 'rest'], [53.4, 'confusa', 'ombros'],
      [54.4, 'bebado2', 'gesto'], [56.3, 'bebado', 'rest'], [60.28, 'euforia', 'gesto'], [61.4, 'bebado2', 'bebe'], [62.4, 'bebado', 'gesto'],
      [64.4, 'risada', 'ri'], [65.0, 'risada', 'boca'], [66.0, 'risada', 'ri'], [67.85, 'serio', 'joia'], [68.4, 'bebado2', 'gesto'], [70.2, 'bebado']],
    armLopt: { prop: [{ d: 'M -22 -64 L 22 -64 L 17 6 L -17 6 Z', fill: '#f0f9ff', w: 4 }, { d: 'M -20 -30 L 20 -30 L 17 6 L -17 6 Z', fill: '#fde68a', c: 'none' }] },
  });
  // E) o entrevistador
  const E_SKIN = '#e9c09a', E_HAIR = '#3b2416';
  const micProp = [box(8, -11, 64, 22, 8, '#111827', null, 4), circ(80, 0, 16, '#374151', null, 4)];
  const E_POSE = {
    rest: { L: { el: [-150, -95], h: [-110, -40] }, R: { el: [140, -95], h: [110, -40] } },
    self: { L: { el: [-165, -150], h: [-80, -205], r: -70 }, R: { el: [140, -95], h: [110, -40] } },
    out: { L: { el: [-200, -185], h: [-335, -228], r: 180 }, R: { el: [140, -95], h: [110, -40] } },
    gesto: { L: { el: [-165, -150], h: [-80, -205], r: -70 }, R: { el: [200, -150], h: [230, -270], r: -60 } },
    ri: { L: { el: [-165, -150], h: [-90, -190], r: -70 }, R: { el: [150, -110], h: [60, -60] } },
  };
  // TL do entrevistador montado das janelas de fala: microfone na boca quando ele pergunta, no velhinho quando o velhinho responde
  const E_TL = [[-9, 'sorriso', 'self']];
  const evts = [];
  for (const [a, b] of FALA.E) evts.push([a - 0.15, 'E', b]);
  for (const k of ['A', 'B', 'C', 'D']) for (const [a] of FALA[k]) evts.push([a - 0.2, 'O', a]);
  evts.sort((x, y) => x[0] - y[0]);
  let gi = 0;
  for (const [t0, who] of evts) E_TL.push(who === 'E' ? [t0, gi++ % 2 ? 'euforia' : 'sorriso', gi % 3 === 0 ? 'gesto' : 'self'] : [t0, 'leve', 'out']);
  // risadas dele
  for (const [t0, t1] of [[4.45, 5.0], [28.45, 28.55], [49.0, 50.0], [65.1, 66.9]]) { E_TL.push([t0, 'risada', 'ri']); E_TL.push([t1, 'sorriso', t0 === 28.45 ? 'self' : 'out']); }
  E_TL.sort((x, y) => x[0] - y[0]);
  const E = makeChar({
    id: 'E', sc: 1.15, skin: E_SKIN, sleeve: '#ffffff', look: -1, drunk: false, ph: 0,
    torso: [{ d: torsoD(1.0), fill: '#ffffff', w: 7 }, neck(E_SKIN),
      { d: 'M -18 -244 q 10 8 0 18 q -10 8 0 18 M 14 -240 l 6 20 M 4 -214 l 10 6', c: '#334155', w: 4 },
      { d: 'M -40 -208 Q 0 -178 40 -208', w: 6 },
      circ(0, -110, 66, '#facc15', '#ca8a04', 6), circ(0, -112, 30, '#e9c09a', null, 4),
      { d: 'M -26 -122 L 26 -122 L 22 -108 L -22 -108 Z', fill: '#111827', w: 3 }, { d: 'M -30 -136 Q 0 -160 30 -136', c: '#1f1410', w: 8 },
      circ(-46, -66, 13, '#dc2626', null, 3), circ(46, -66, 13, '#dc2626', null, 3)],
    face: {
      id: 'e', skin: E_SKIN, brow: E_HAIR, blink: 1.8,
      back: [circ(-10, -132, 40, E_HAIR, null, 6)],
      hair: [{ d: 'M -102 -20 Q -108 -128 0 -132 Q 108 -128 102 -20 Q 96 -80 50 -90 Q 0 -98 -50 -90 Q -96 -80 -102 -20 Z', fill: E_HAIR, w: 6 },
        { d: 'M -60 -110 Q 0 -124 60 -110 M -50 -98 Q 0 -110 50 -98', c: '#5b3a24', w: 4 }],
      extra: [{ d: WB.circlePath(-38, 8, 31), fill: 'none', c: '#111827', w: 8 }, { d: WB.circlePath(38, 8, 31), fill: 'none', c: '#111827', w: 8 },
        { d: 'M -8 4 Q 0 -2 8 4 M -69 4 L -98 -4 M 69 4 L 98 -4', c: '#111827', w: 6 },
        { d: 'M -52 64 Q -26 44 0 54 Q 26 44 52 64 Q 56 74 46 70 Q 24 62 0 66 Q -24 62 -46 70 Q -56 74 -52 64 Z', fill: E_HAIR, w: 4 }],
    },
    armLopt: { prop: micProp, tattoo: true }, armRopt: { tattoo: true },
    POSE: E_POSE, TL: E_TL,
  });

  // entrada e saída dos velhinhos (entram cambaleando pela esquerda)
  const SLOTS = [[A, -9, 4.9], [B, 5.0, 7.62], [C, 7.72, 34.62], [D, 34.72, 99]];
  WB.effect((t) => {
    for (const [fn, t0, t1] of SLOTS) {
      const uin = t0 < 0 ? 1 : ease(clamp((t - t0) / 0.45)), uout = ease(clamp((t - t1) / 0.4));
      const vis = t > t0 - 0.01 && t < t1 + 0.42;
      const x = OLD_X - 560 * (1 - uin) - 560 * uout;
      const tilt = (1 - uin) * 14 * Math.sin(t * 12) - uout * 12;
      fn(t, [x, HIP, tilt], vis ? 1 : 0);
    }
    E(t, [E_X, HIP, 0], 1);
  });

  // mesa de plástico branca na frente de todo mundo + o que tem em cima
  const table = WB.mk('g', { transform: 'translate(0 150)' }, WB.overlay);
  showAll(build([box(30, 1440, 1020, 46, 14, '#f8fafc', null, 8), { d: 'M 60 1486 L 50 1640 M 1020 1486 L 1030 1640 M 300 1486 L 290 1640 M 780 1486 L 790 1640', c: '#cbd5e1', w: 18 },
    { d: 'M 50 1460 L 1030 1460', c: '#e2e8f0', w: 5 }], table));
  function onTable(t0, t1, specs) {
    const g = WB.mk('g', {}, table);
    showAll(build(specs, g));
    WB.effect(t => g.setAttribute('opacity', (clamp((t - t0) / 0.3 + (t0 <= 0 ? 1 : 0)) * (1 - clamp((t - t1) / 0.3))).toFixed(3)));
  }
  onTable(5.0, 34.7, [{ d: 'M 470 1438 L 530 1438 L 522 1360 L 478 1360 Z', fill: '#ffffff', w: 5 }, { d: 'M 590 1438 L 640 1438 L 634 1372 L 596 1372 Z', fill: '#ffffff', w: 5 },
    { d: 'M 940 1438 L 940 1330 Q 940 1300 960 1290 L 960 1250 L 980 1250 L 980 1290 Q 1000 1300 1000 1330 L 1000 1438 Z', fill: '#f1f5f9', w: 5 }]);
  onTable(34.7, 99, [
    { d: 'M 470 1438 L 470 1330 Q 470 1300 490 1290 L 492 1262 L 518 1262 L 520 1290 Q 540 1300 540 1330 L 540 1438 Z', fill: '#f8fafc', w: 5 },
    box(485, 1240, 40, 26, 4, '#facc15', null, 4), box(472, 1360, 66, 40, 4, '#facc15', null, 4), T('Gostosa', 505, 1388, 22, INK.red),
    { d: 'M 570 1438 Q 560 1380 590 1360 L 650 1350 Q 680 1380 670 1438 Z', fill: '#fafaf9', w: 4 }, { d: 'M 600 1420 Q 620 1390 650 1420', fill: '#d97706', c: '#b45309', w: 4 },
    { d: 'M 960 1438 L 960 1300 Q 960 1270 980 1258 L 980 1200 L 1004 1200 L 1004 1258 Q 1024 1270 1024 1300 L 1024 1438 Z', fill: '#ecfeff', w: 5 },
    box(962, 1320, 60, 60, 4, '#ffffff', null, 4), T('Pinga', 992, 1358, 22, INK.red)]);

  // "hic!" dos bêbados
  const HIC = [[1.45, 230, 1060], [4.65, 230, 1060], [12.45, 230, 1040], [26.05, 230, 1040], [36.25, 230, 1040], [54.65, 230, 1040], [63.25, 230, 1040]];
  HIC.forEach(([bt, x, y], i) => P(bt, T('hic!', 120 + (i % 2) * 330, 1170, 76, INK.purple), { parent: WB.overlay, loop: 'rise', until: bt + 1.5 }));

  // título fixo
  {
    const g = WB.mk('g', {}, WB.overlay);
    showAll(build([T('PESQUISA DE BOTECO', 500, 190, 92, INK.orange),
      { d: 'M 930 120 L 1000 120 L 994 210 L 936 210 Z', fill: '#fde68a', w: 6 }, { d: 'M 1000 140 Q 1036 150 1000 186', w: 7 },
      { d: WB.cloudPath(965, 116, 40, 16), fill: '#ffffff', w: 5 }], g));
    animate(g, 0.05, { loop: 'drunk' });
  }

  // ================= CENAS (desenhos de cada fala, em cima: y 280–960) =================
  // 1) E: "O senhor tá mais pra esquerda ou mais pra direita?" (0–3,05)
  pg(0, 3.05);
  P(0.15, T('Esquerda ou direita?', 540, 360, 96, INK.black), { anim: 'slam' });
  const sign = P(0.6, signpost(540, 500), { loop: 'wiggle' });
  P(1.1, qmark(130, 760, 0.9, INK.red), { loop: 'bounce' });
  P(2.0, qmark(950, 820, 0.9, INK.blue), { loop: 'bounce', ph: 0.4 });

  // 2) A: responde embolado (3,05–5,0): a placa gira e ele fica TORTO
  pg(3.05, 5.0);
  P(3.1, signpost(540, 470), { loop: 'turn', oy: 600 });
  stamp(3.4, 'TÔ É TORTO!', 540, 860, 110, INK.purple, -6, { loop: 'drunk' });
  P(3.6, T('*', 160, 400, 90, '#facc15'), { loop: 'turn' });
  P(3.7, T('*', 930, 380, 80, '#facc15'), { loop: 'turn' });

  // 3) E: "O que o senhor tá achando do Brasil hoje?" (5,0–6,75)
  pg(5.0, 6.75);
  P(5.15, T('E o Brasil hoje?', 540, 370, 104, INK.green), { anim: 'slam' });
  P(5.4, flagBR(540, 620, 400), { loop: 'wiggle' });
  P(6.0, qmark(900, 780, 0.9, INK.blue), { loop: 'bounce' });

  // 4) B: "Pra mim tá tudo bem." (6,75–7,65)
  pg(6.75, 7.65);
  P(6.8, thumbsUp(320, 640, 1.5, B_SKIN), { anim: 'slam', loop: 'wiggle' });
  stamp(6.95, 'TÁ TUDO BEM!', 680, 470, 96, INK.green, 5, { loop: 'drunk' });
  P(7.1, flagBR(760, 760, 220), { loop: 'float' });

  // 5) E: "E o senhor, meu querido?" (7,65–9,7)
  pg(7.65, 9.7);
  P(7.75, T('E o senhor, meu querido?', 540, 380, 84, INK.blue), { anim: 'slam' });
  P(8.0, flagBR(540, 640, 380), { loop: 'wiggle' });
  P(8.6, qmark(140, 820, 0.9, INK.red), { loop: 'bounce' });

  // 6) C: "Tenho nem o que dizer, não." (9,7–11,58)
  pg(9.7, 11.58);
  P(9.75, [circ(540, 620, 190, '#fde68a', null, 8), circ(470, 570, 20, '#111827', null, 4), circ(610, 570, 20, '#111827', null, 4),
    { d: 'M 430 690 L 650 690', w: 9 }, { d: [450, 480, 510, 540, 570, 600, 630].map(x => `M ${x} 676 L ${x} 704`).join(' '), w: 5 },
    box(640, 672, 34, 36, 6, '#9ca3af', null, 5)], { anim: 'slam', loop: 'wiggle' });
  P(10.3, T('Nem o que dizer...', 540, 900, 84, INK.gray), { loop: 'drunk' });
  P(10.1, T('...', 540, 380, 130, INK.black), { loop: 'bounce' });

  // 7) E: "Se o senhor tivesse aquele dinheiro que o Vorcaro tem?" (11,58–15,08)
  pg(11.58, 15.08);
  P(11.7, T('Se tivesse o dinheiro', 540, 350, 84, INK.black), { anim: 'slam' });
  P(12.1, T('do VORCARO...', 540, 440, 96, INK.green), { anim: 'slam' });
  P(12.9, moneyBag(330, 700, 1.25), { loop: 'bounce' });
  P(13.2, moneyBag(720, 710, 1.4, 'R$$'), { loop: 'bounce', ph: 0.3 });
  P(14.0, T('o que faria?', 540, 930, 80, INK.blue), { loop: 'wiggle' });

  // 8) C: "O cabaré é o gasto, meu filho!" (15,08–17,0)
  pg(15.08, 17.0);
  P(15.15, cabare(540, 650), { anim: 'slam', loop: 'pulse' });
  P(15.6, [bill(150, 420, -20), bill(930, 460, 25), bill(200, 880, 15), bill(890, 900, -30)], { loop: 'float' });
  P(16.0, T('meu filho!', 540, 960, 84, INK.red), { loop: 'drunk' });

  // 9) C: "Eu gasto é hoje sem ter!" (17,0–18,4)
  pg(17.0, 18.4);
  stamp(17.05, 'GASTO É HOJE!', 540, 400, 104, INK.red, -4, { loop: 'shake' });
  P(17.4, wallet(500, 700), { loop: 'tremble' });
  P(17.7, T('(sem ter)', 540, 930, 76, INK.gray), { loop: 'wiggle' });

  // 10) C: "... uma parte, sabe? um pouco... dava uma parte daquilo ali" (18,4–24,05)
  pg(18.4, 24.05);
  P(18.5, cabare(320, 640), { loop: 'pulse' });
  P(19.6, moneyBag(820, 760, 1.0), { loop: 'bounce' });
  P(19.7, T('uma parte...', 800, 420, 80, INK.green), { loop: 'wiggle' });
  P(20.8, [{ d: 'M 720 640 Q 640 520 560 560', c: INK.green, w: 12 }, { d: WB.arrowHead(560, 560, 3.6, 40), c: INK.green, w: 12 }], { anim: 'slam' });
  P(21.6, [bill(640, 460, -20, 0.8), bill(700, 520, 30, 0.8)], { loop: 'float' });
  P(22.6, T('um poquinho', 800, 960, 64, INK.gray), { loop: 'drunk' });

  // 11) C: "Dava tudo! Dava tudo!" (24,05–25,38)
  pg(24.05, 25.38);
  P(24.08, burst(540, 600, 260, '#fef08a', INK.red), { anim: 'slam', loop: 'pulse' });
  stamp(24.1, 'DAVA TUDO!!', 540, 600, 120, INK.red, -5, { loop: 'tremble' });
  P(24.3, [bill(150, 360, 20), bill(400, 340, -15), bill(700, 360, 25), bill(930, 340, -20), bill(160, 720, 10), bill(920, 700, -25)], { loop: 'rain' });

  // 12) C: "... porque ninguém votou" (25,38–28,5)
  pg(25.38, 28.5);
  P(25.5, T('Sabe por quê?', 540, 370, 96, INK.black), { anim: 'slam' });
  P(26.4, ballotBox(540, 660), { loop: 'wiggle' });
  stamp(27.75, 'NINGUÉM VOTOU!', 540, 900, 88, INK.red, -4, { loop: 'shake' });

  // 13) E comenta e ri (28,5–31,2)
  pg(28.5, 31.2);
  P(28.55, ballotBox(540, 640), { loop: 'float' });
  P(28.7, T('kkkkkk', 540, 380, 110, INK.orange), { anim: 'slam', loop: 'hop' });
  P(29.6, T('kkk', 200, 900, 80, INK.orange), { loop: 'hop' });
  P(30.0, T('kkk', 880, 900, 80, INK.orange), { loop: 'hop', ph: 0.3 });

  // 14) C: "Aí, deixa comigo! ... Eu vou!" (31,2–34,7)
  pg(31.2, 34.7);
  stamp(31.45, 'DEIXA COMIGO!', 540, 420, 100, INK.blue, -4, { loop: 'drunk' });
  P(32.2, thumbsUp(540, 690, 1.4, C_SKIN), { loop: 'wiggle' });
  P(33.95, T('EU VOU!', 540, 930, 110, INK.green), { anim: 'slam', loop: 'hop' });

  // 15) E: "O senhor prefere 13 ou 22?" (34,7–37,0)
  pg(34.7, 37.05);
  P(34.85, T('13 ou 22?', 540, 380, 120, INK.black), { anim: 'slam' });
  P(35.6, numCard(300, 660, '13', INK.red, '#fee2e2'), { anim: 'slam', loop: 'wiggle' });
  P(36.3, numCard(780, 660, '22', INK.blue, '#dbeafe'), { anim: 'slam', loop: 'wiggle', ph: 0.4 });

  // 16) D: "Não... 51!" (37,05–40,45)
  pg(37.05, 40.45);
  P(37.1, numCard(230, 420, '13', INK.red, '#fee2e2'), {});
  P(37.1, numCard(850, 420, '22', INK.blue, '#dbeafe'), {});
  P(37.25, [{ d: 'M 110 290 L 350 550 M 350 290 L 110 550', c: INK.red, w: 16 }, { d: 'M 730 290 L 970 550 M 970 290 L 730 550', c: INK.red, w: 16 }], { anim: 'slam' });
  P(37.95, bottle51(540, 590, 0.95), { anim: 'slam', loop: 'drunk' });
  stamp(38.1, 'NÃO... 51!', 540, 895, 100, INK.green, -5, { loop: 'shake' });

  // 17) D: "O Lula é o melhor presidente que existe." (40,45–44,1)
  pg(40.45, 44.1);
  P(40.55, trophy(540, 600), { anim: 'slam', loop: 'pulse' });
  P(41.6, T('O MELHOR', 540, 860, 96, '#ca8a04'), { anim: 'slam' });
  P(42.6, T('que existe!', 540, 950, 80, INK.black), { loop: 'wiggle' });
  P(41.0, T('*', 220, 420, 90, '#facc15'), { loop: 'turn' });
  P(41.2, T('*', 860, 450, 80, '#facc15'), { loop: 'turn' });

  // 18) D: "Todo presidente rouba. Quem é que não rouba nesse mundo?" (44,1–48,4)
  pg(44.1, 48.38);
  P(44.3, T('Todo presidente rouba...', 540, 360, 84, INK.red), { anim: 'slam' });
  P(45.0, bandit(380, 650), { loop: 'wiggle' });
  P(45.4, moneyBag(760, 700, 1.1, '$'), { anim: 'fly', fx: 300, loop: 'bounce' });
  P(46.4, T('QUEM NÃO ROUBA?', 540, 930, 92, INK.purple), { anim: 'slam', loop: 'tremble' });

  // 19) D: "EU!" (48,38–48,9)
  pg(48.38, 48.9);
  P(48.4, burst(540, 620, 270, '#fef9c3', INK.orange), { anim: 'slam', loop: 'pulse' });
  P(48.4, T('EU!', 540, 690, 230, INK.red), { anim: 'slam', loop: 'shake' });
  P(48.45, halo(540, 400, 140), { loop: 'float' });

  // 20) E: "E o caso do Daniel Vorcaro, 100 bilhões de reais?" (48,9–53,35)
  pg(48.9, 53.35);
  P(48.95, T('EU!', 820, 430, 100, INK.red), { loop: 'shake' });
  P(49.1, halo(820, 300, 70), { loop: 'float' });
  P(49.3, T('kkkk', 260, 380, 84, INK.orange), { loop: 'hop' });
  P(50.1, T('Daniel Vorcaro', 540, 520, 92, INK.green), { anim: 'slam' });
  P(51.8, T('R$ 100 BILHÕES', 540, 640, 104, '#166534'), { anim: 'slam', loop: 'pulse' });
  P(52.3, [moneyBag(230, 850, 0.8), moneyBag(420, 870, 0.9), moneyBag(640, 870, 0.9), moneyBag(850, 850, 0.8)], { loop: 'bounce' });

  // 21) D: "Daniel quê?" / "nem sei quem é!" (53,35–56,24)
  pg(53.35, 56.24);
  stamp(53.4, 'DANIEL QUÊ??', 540, 440, 104, INK.purple, 5, { loop: 'tremble' });
  P(53.8, T('Vorcaro!', 540, 620, 84, INK.green), { loop: 'wiggle' });
  P(54.2, qmark(170, 800, 1, INK.red), { anim: 'slam', loop: 'shake' });
  P(54.4, qmark(900, 820, 1, INK.purple), { anim: 'slam', loop: 'shake' });
  P(55.15, T('sei nem quem é!', 540, 900, 84, INK.red), { anim: 'slam', loop: 'drunk' });

  // 22) E: "Se o senhor tivesse com os bilhões dele, qual a primeira coisa?" (56,24–60,25)
  pg(56.24, 60.25);
  P(56.4, T('Com os bilhões dele...', 540, 360, 88, INK.black), { anim: 'slam' });
  P(57.3, moneyBag(540, 640, 1.6, 'R$'), { loop: 'bounce' });
  P(58.8, T('1ª coisa que faria?', 540, 930, 84, INK.blue), { anim: 'slam', loop: 'wiggle' });

  // 23) D: "Jogar baralho e beber cachaça!" (60,25–64,35)
  pg(60.25, 64.35);
  P(60.5, [card(250, 560, -24, 'A', false), card(360, 530, -8, 'K', true), card(470, 530, 8, '7', false), card(580, 560, 24, 'Q', true)], { anim: 'slam', loop: 'wiggle' });
  P(60.6, T('BARALHO', 410, 380, 96, INK.black), { anim: 'slam' });
  P(61.5, bottle51(840, 600, 0.8), { anim: 'slam', loop: 'drunk' });
  P(61.9, cachacaGlass(160, 790, 0.8), { loop: 'drunk', ph: 0.5 });
  P(61.7, T('+ CACHAÇA!', 560, 925, 100, INK.orange), { anim: 'slam', loop: 'shake' });

  // 24) E: "Tem véia?" (64,35–64,98)
  pg(64.35, 64.98);
  P(64.4, heart(540, 600, 3.2, '#f472b6'), { anim: 'slam', loop: 'pulse' });
  P(64.45, T('?', 540, 660, 200, '#ffffff'), { anim: 'slam' });

  // 25) D: "Não, porque a bicha morreu, faz tempo. Morreu!" (64,98–70,3)
  pg(64.98, 70.35);
  P(65.1, angelLady(540, 560), { anim: 'fly', fy: 300, loop: 'float' });
  P(65.6, T('MORREU...', 540, 920, 104, INK.gray), { anim: 'slam' });
  P(66.5, T('faz tempo!', 820, 380, 70, INK.purple), { loop: 'wiggle' });
  P(68.0, T('MORREU!', 230, 380, 80, INK.red), { anim: 'slam', loop: 'shake' });
  P(68.6, [heart(850, 760, 0.7, '#f472b6'), heart(230, 760, 0.6, '#f472b6')], { loop: 'float' });

  // 26) Chamada para seguir (70,35–fim)
  pg(70.35, 99);
  {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 470, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 560, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@caderno_amarelo', 380, 560 + 190 * 0.62, 84, INK.black, g).strokes);
    animate(g, 70.5, { loop: 'float' });
  }
};
