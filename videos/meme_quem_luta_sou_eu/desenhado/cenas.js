// Meme "quem luta com ele sou eu" no estilo Caderno Amarelo.
// O mesmo arquivo serve aos dois formatos; projeto.json -> "modo":
//   "A" = desenhado na hora (a mão desenha cada cena enquanto a voz fala)
//   "B" = desenho animado (tudo já desenhado, a personagem fala e faz expressões)
// Tempos em segundos do áudio original (tirados da legenda palavra a palavra do meme).
window.CENAS = function (WB) {
  const { INK } = WB;
  const A = String(WB.projeto.modo || 'A').toUpperCase() === 'A';
  const { clamp, lerp, ease } = WB;
  const S1 = WB.scenes[0], D1 = S1.end - S1.start;
  const fr = t => (t - S1.start) / D1;           // tempo absoluto -> fração da cena 1 (o motor é linear)
  const r1 = n => Math.round(n * 10) / 10;
  const SKIN = '#c68a5f', SKIN2 = '#d9a074', SKIN3 = '#e8bf9a', HAIR = '#2a1a12', PINK = '#f4a6c4';
  const BROWN = '#7a4a1e', MOUTH = '#6b1f2b';
  const ellipse = (cx, cy, rx, ry) => WB.arcPath(cx, cy, rx, ry, 0, Math.PI * 2, 48) + ' Z';
  const backOut = u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };

  // Palavras da personagem [início, fim] (legenda do vídeo original).
  const WORDS = [[3.33,3.67],[3.67,3.9],[3.9,4.03],[4.03,4.23],[4.23,4.47],[4.97,5.17],[5.17,5.3],[5.3,5.47],[5.47,5.7],[5.7,5.77],[5.77,5.87],[5.87,6.17],[6.17,6.67],[6.67,6.93],[6.93,7.1],[7.1,7.63],[7.63,7.77],[7.77,7.9],[7.9,8.03],[8.03,8.13],[8.13,8.33],[8.33,8.57],[8.63,8.9],[8.9,9.1],[9.1,9.57],[9.57,9.73],[9.73,9.9],[9.9,10.03],[10.03,10.13],[10.13,10.5],[10.5,10.63],[10.63,10.73],[10.73,10.83],[10.83,11.07],[11.07,11.23],[11.23,11.7],[11.7,12.13],[12.97,13.3],[13.3,13.47],[13.47,13.9],[13.9,14.27],[14.27,14.63],[15.47,16.23],[16.3,16.43],[16.43,16.53],[16.53,16.67],[16.7,16.83],[16.83,17.07],[17.07,17.3],[17.3,17.43],[17.43,17.7],[17.7,17.87],[18.03,18.47],[18.47,18.63],[18.63,18.93],[18.93,19.27],[19.27,19.63],[19.67,19.93],[19.93,20.13],[20.13,20.47],[20.47,20.73],[20.73,21.1],[21.1,21.3],[21.3,21.57],[21.57,21.67],[21.67,21.9],[21.9,22.03],[22.03,22.73],[22.73,23.07],[23.07,23.33],[23.33,23.63],[23.63,23.77],[23.77,23.93],[23.93,24.17],[24.17,24.57],[24.57,24.87],[25.77,26.17],[26.17,26.27],[26.27,26.5],[26.5,26.77],[26.77,26.87],[26.87,26.97],[26.97,27.27],[27.27,27.5],[27.5,27.7],[27.7,28.13],[28.13,28.27],[28.27,28.33],[28.33,28.67],[28.67,28.9],[29.13,29.53],[29.53,29.9],[29.9,30.1],[30.1,30.33],[30.33,30.77],[30.77,31.17],[31.17,31.3],[31.3,31.37],[31.37,31.5],[31.53,31.73],[31.73,31.97],[31.97,32.27],[32.27,32.5],[32.5,32.63],[32.63,32.83],[32.83,33.13],[33.13,33.33],[33.37,33.53],[33.53,33.73],[33.73,34.03],[34.03,34.13],[34.13,34.3],[34.3,34.57],[35.03,35.37],[35.37,35.57],[35.57,35.73],[35.73,36.17],[36.67,37.07],[37.07,37.3],[37.3,37.43],[37.43,37.57],[37.57,37.87],[37.87,38.13],[38.13,38.33],[38.33,38.53],[38.53,38.77],[38.77,39.13],[39.13,39.33],[39.33,39.47],[39.47,39.63],[39.63,39.93],[39.93,40.27],[40.27,40.53],[40.53,40.9],[40.9,41.43],[41.43,41.67],[41.67,41.77],[41.77,42.1],[42.1,42.43],[42.57,42.87],[42.9,42.97],[42.97,43.1],[43.1,43.3],[43.3,43.53],[43.53,44.5],[44.5,44.87],[44.97,45.27],[45.27,45.53],[45.53,45.7],[45.73,45.9],[45.9,46.03],[46.03,46.13],[46.13,46.33],[46.33,46.83],[47.3,47.73],[47.73,47.9],[47.9,48.1],[48.1,48.37],[48.37,48.67],[48.67,48.97],[49.43,49.9],[49.9,50.0],[50.0,50.23],[50.23,50.5],[50.5,51.03],[51.03,51.17],[51.17,51.33],[51.33,51.47],[51.47,51.63],[51.63,51.77],[51.77,51.97],[52.03,52.1],[52.1,52.23],[52.23,52.37],[52.37,52.67],[52.67,52.83],[52.83,52.9],[52.9,53.17],[53.17,53.37],[53.37,53.5],[53.5,53.83],[53.87,54.1],[54.1,55.23],[55.23,55.9],[56.57,57.03],[57.03,57.3],[57.3,57.37],[57.37,57.63],[57.63,57.9],[57.9,58.33],[58.33,58.43],[58.97,59.27],[59.27,59.43],[59.43,59.63],[59.63,59.7],[59.7,59.9],[59.9,60.03],[60.03,60.13],[60.13,60.33],[60.33,60.63],[60.87,61.13],[61.13,61.37],[61.37,61.63],[61.63,62.03],[62.03,62.13],[62.13,62.23],[62.23,62.53],[62.53,62.87],[62.87,63.1],[63.1,63.27],[63.27,63.33],[63.33,63.63],[63.63,63.93],[63.93,64.07],[64.07,64.3],[64.3,64.53],[64.53,64.83],[64.83,65.1],[65.1,65.5],[65.5,65.73],[65.73,65.97],[65.97,66.17],[66.67,67.13],[67.13,67.37],[67.37,67.5],[67.5,67.7],[67.7,67.87],[67.87,68.33],[68.33,68.53],[68.53,68.7],[68.7,68.83],[68.83,69.1],[69.1,69.77],[70.27,70.93],[70.93,71.53],[71.53,71.67],[71.67,71.77],[71.77,71.87],[71.87,72.03],[72.03,72.17],[72.17,72.3],[72.3,72.43],[72.43,72.53],[72.53,72.7],[72.7,72.9],[72.9,73.33],[74.03,74.67]];
  // Abertura da boca (0..1): uma "sílaba" a cada ~0,15 s dentro de cada palavra.
  function mouthOpen(t) {
    for (const [a, b] of WORDS) {
      if (t < a) break;
      if (t <= b) {
        const n = Math.max(1, Math.round((b - a) / 0.15)), u = (t - a) / (b - a);
        return Math.pow(Math.abs(Math.sin(Math.PI * u * n)), 0.7);
      }
    }
    return 0;
  }

  // ---------------- montagem de itens (traços + preenchimentos) ----------------
  const T = (text, x, y, size, c, anchor) => ({ text, x, y, size, c, anchor });
  function build(specs, parent) {
    const g = WB.mk('g', {}, parent);
    const strokes = [], fills = [];
    for (const s of [specs].flat(5)) {
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
  // B: aparece com "pop" (ou outro efeito) e pode seguir se mexendo.
  function animate(g, t0, o = {}) {
    const bb = g.getBBox();
    const ox = o.ox ?? bb.x + bb.width / 2, oy = o.oy ?? bb.y + bb.height / 2;
    const kind = o.anim || 'pop', loop = o.loop;
    WB.effect((t) => {
      const tt = t - t0;
      if (tt < 0) { g.setAttribute('opacity', 0); return; }
      let k = 1, rot = 0, dx = 0, dy = 0, sy = 1, op = 1;
      if (kind === 'slam') { k = 1 + 0.9 * Math.pow(1 - clamp(tt / 0.2), 2); op = clamp(tt / 0.08); }
      else if (kind === 'fly') { const v = ease(clamp(tt / 0.5)); dx = (o.fx || 0) * (1 - v); dy = (o.fy || 0) * (1 - v); }
      else { k = backOut(clamp(tt / 0.38)); op = clamp(tt / 0.12); }
      if (loop === 'shake') rot += Math.sin(tt * 40) * 5 * Math.exp(-tt * 2);
      if (loop === 'wiggle') rot += Math.sin(tt * 5) * 3;
      if (loop === 'bounce') dy -= Math.abs(Math.sin(tt * 5)) * 16;
      if (loop === 'float') dy += Math.sin(tt * 2.4) * 9;
      if (loop === 'pulse') k *= 1 + 0.07 * Math.sin(tt * 9);
      if (loop === 'flicker') sy = 1 + 0.07 * Math.sin(tt * 13) + 0.03 * Math.sin(tt * 29);
      if (loop === 'spin') rot += Math.sin(tt * 9) * 8;
      g.setAttribute('opacity', op.toFixed(3));
      g.setAttribute('transform', `translate(${(ox + dx).toFixed(1)} ${(oy + dy).toFixed(1)}) rotate(${rot.toFixed(2)}) ` +
        `scale(${k.toFixed(3)} ${(k * sy).toFixed(3)}) translate(${-ox} ${-oy})`);
    });
  }
  let cont = null;   // B: grupo da "folha" atual
  // Nova folha. A: a mão vira a página. B: o grupo some no fim (t1) e o próximo entra.
  function pg(t0, t1) {
    if (A) { if (t0 > 0.01) WB.newPage(1, fr(t0), fr(t0 + 0.25)); return; }
    const g = WB.mk('g', {}, WB.layer);
    WB.effect(t => g.setAttribute('opacity', t < t0 ? 0 : t > t1 ? clamp(1 - (t - t1) / 0.15).toFixed(3) : 1));
    cont = g;
  }
  // Mostra um item: A desenha entre t0 e t1; B faz aparecer em o.bt (ou t0).
  function show(t0, t1, specs, o = {}) {
    const it = build(specs, o.parent || (A ? WB.layer : cont));
    if (A) {
      WB.draw(1, fr(t0), fr(t1), it.strokes);
      it.fills.forEach(f => WB.fillAfter(f.el, f.st.length ? f.st : it.strokes, 0.25));
    } else {
      WB.showNow(it.strokes);
      it.fills.forEach(f => f.el.setAttribute('fill-opacity', 1));
      animate(it.g, o.bt ?? t0, o);
    }
    return it;
  }

  // ---------------- desenhos ----------------
  const box = (x, y, w, h, r, fill, c, wd) => ({ d: WB.roundRectPath(x, y, w, h, r), fill, c, w: wd || 6 });
  const circ = (x, y, r, fill, c, wd) => ({ d: WB.circlePath(x, y, r), fill, c, w: wd || 6 });
  function bubble(x0, y0, x1, y1, tx, ty) {
    const bx = Math.max(x0 + 60, Math.min(x1 - 140, tx - 40));
    return [box(x0, y0, x1 - x0, y1 - y0, 50, '#ffffff'),
      { d: `M ${bx} ${y1 - 4} L ${tx} ${ty} L ${bx + 80} ${y1 - 4}`, fill: '#ffffff', w: 6 }];
  }
  function house(x0, y0, x1, y1) {
    const cx = (x0 + x1) / 2, w = x1 - x0;
    return [
      { d: WB.roughRect(x0, y0, x1, y1), fill: '#f6e7c1', w: 7 },
      { d: `M ${x0 - 35} ${y0 + 4} L ${cx} ${y0 - 150} L ${x1 + 35} ${y0 + 4} Z`, fill: '#d9603b', w: 7 },
      box(cx - w * 0.13, y1 - 150, w * 0.26, 146, 10, '#8b5a2b'),
      box(x0 + w * 0.1, y0 + 50, w * 0.24, 90, 6, '#bfe0f5'),
      { d: `M ${x0 + w * 0.22} ${y0 + 50} L ${x0 + w * 0.22} ${y0 + 140} M ${x0 + w * 0.1} ${y0 + 95} L ${x0 + w * 0.34} ${y0 + 95}`, w: 4 },
    ];
  }
  function boy(x, y, s = 1) {
    const P = (dx, dy) => `${r1(x + dx * s)} ${r1(y + dy * s)}`;
    return [
      { d: `M ${P(-18, 150)} L ${P(-30, 235)} M ${P(18, 150)} L ${P(32, 235)}`, w: 9 },
      { d: `M ${P(-38, 78)} L ${P(-92, 15)} M ${P(38, 78)} L ${P(94, 22)}`, w: 9 },
      box(x - 42 * s, y + 48 * s, 84 * s, 108 * s, 20 * s, '#4f86d9'),
      circ(x, y, 50 * s, SKIN2),
      { d: `M ${P(-50, -12)} L ${P(-44, -58)} L ${P(-26, -38)} L ${P(-14, -72)} L ${P(2, -44)} L ${P(18, -74)} L ${P(28, -42)} L ${P(46, -60)} L ${P(50, -12)} Q ${P(0, -40)} ${P(-50, -12)} Z`, fill: HAIR, w: 5 },
      circ(x - 17 * s, y + 2 * s, 6 * s, '#111', null, 3), circ(x + 17 * s, y + 2 * s, 6 * s, '#111', null, 3),
      { d: `M ${P(-24, 18)} Q ${P(0, 48)} ${P(24, 18)} Z`, fill: '#ffffff', w: 5 },
    ];
  }
  function vo(x, y) {
    return [
      { d: `M ${x - 40} ${y + 52} Q ${x - 92} ${y + 250} ${x - 80} ${y + 262} L ${x + 80} ${y + 262} Q ${x + 92} ${y + 250} ${x + 40} ${y + 52} Z`, fill: '#9b7fd1', w: 6 },
      { d: `M ${x + 104} ${y + 128} L ${x + 104} ${y + 272} M ${x + 104} ${y + 128} Q ${x + 104} ${y + 104} ${x + 82} ${y + 110} M ${x + 40} ${y + 84} L ${x + 102} ${y + 134}`, w: 8 },
      circ(x, y - 68, 27, '#cfcfcf'),
      circ(x, y, 55, SKIN3),
      { d: `M ${x - 55} ${y - 4} Q ${x - 57} ${y - 64} ${x} ${y - 62} Q ${x + 57} ${y - 64} ${x + 55} ${y - 4} Q ${x + 30} ${y - 40} ${x} ${y - 38} Q ${x - 30} ${y - 40} ${x - 55} ${y - 4} Z`, fill: '#cfcfcf', w: 5 },
      circ(x - 21, y + 4, 15, null, null, 4), circ(x + 21, y + 4, 15, null, null, 4),
      { d: `M ${x - 6} ${y + 4} L ${x + 6} ${y + 4} M ${x - 16} ${y + 30} Q ${x} ${y + 40} ${x + 16} ${y + 30}`, w: 4 },
    ];
  }
  function dad(x, y) {
    return [
      { d: `M ${x - 55} ${y + 55} L ${x + 55} ${y + 55} L ${x + 78} ${y + 262} L ${x - 78} ${y + 262} Z`, fill: '#3f9b5c', w: 6 },
      circ(x, y, 55, SKIN),
      { d: `M ${x - 57} ${y - 12} Q ${x - 55} ${y - 76} ${x} ${y - 76} Q ${x + 55} ${y - 76} ${x + 57} ${y - 12} Z`, fill: INK.red, w: 6 },
      { d: `M ${x + 20} ${y - 14} L ${x + 104} ${y - 10} Q ${x + 100} ${y + 2} ${x + 20} ${y - 2} Z`, fill: INK.red, w: 5 },
      circ(x - 19, y + 6, 6, '#111', null, 3), circ(x + 19, y + 6, 6, '#111', null, 3),
      { d: `M ${x - 30} ${y + 30} Q ${x} ${y + 12} ${x + 30} ${y + 30} Q ${x} ${y + 40} ${x - 30} ${y + 30} Z`, fill: HAIR, w: 4 },
    ];
  }
  function tinyGirl(x, y) {
    return [
      { d: `M ${x - 14} ${y + 200} L ${x - 22} ${y + 262} M ${x + 14} ${y + 200} L ${x + 22} ${y + 262}`, w: 9 },
      { d: `M ${x - 30} ${y + 52} L ${x - 75} ${y + 140} M ${x + 30} ${y + 52} L ${x + 80} ${y + 130}`, w: 9 },
      { d: `M ${x - 30} ${y + 48} L ${x + 30} ${y + 48} L ${x + 62} ${y + 205} L ${x - 62} ${y + 205} Z`, fill: PINK, w: 6 },
      { d: ellipse(x, y - 4, 60, 64), fill: HAIR, w: 5 },
      circ(x, y + 2, 48, SKIN),
      { d: `M ${x - 50} ${y - 6} Q ${x - 40} ${y - 62} ${x + 4} ${y - 56} Q ${x + 52} ${y - 52} ${x + 50} ${y - 6} Q ${x + 20} ${y - 36} ${x - 50} ${y - 6} Z`, fill: HAIR, w: 4 },
      circ(x - 16, y + 6, 5, '#111', null, 3), circ(x + 16, y + 6, 5, '#111', null, 3),
      { d: `M ${x - 14} ${y + 28} Q ${x} ${y + 22} ${x + 14} ${y + 28}`, w: 4 },
    ];
  }
  function toilet(x, y) {
    return [
      { d: `M ${x - 45} ${y + 300} L ${x - 55} ${y + 362} L ${x + 55} ${y + 362} L ${x + 45} ${y + 300}`, fill: '#ffffff', w: 6 },
      { d: `M ${x - 106} ${y + 148} Q ${x - 92} ${y + 282} ${x - 40} ${y + 302} L ${x + 40} ${y + 302} Q ${x + 92} ${y + 282} ${x + 106} ${y + 148} Z`, fill: '#ffffff', w: 6 },
      box(x - 72, y, 144, 112, 14, '#ffffff'),
      { d: ellipse(x, y + 142, 112, 34), fill: '#e6eef5', w: 6 },
      { d: `M ${x + 40} ${y + 32} L ${x + 60} ${y + 32}`, w: 8 },
    ];
  }
  function poop(x, y) {
    return [
      { d: `M ${x - 62} ${y} Q ${x - 74} ${y - 30} ${x - 40} ${y - 36} Q ${x - 48} ${y - 66} ${x - 14} ${y - 68} Q ${x - 16} ${y - 100} ${x + 8} ${y - 114} Q ${x + 12} ${y - 90} ${x + 32} ${y - 72} Q ${x + 60} ${y - 64} ${x + 48} ${y - 36} Q ${x + 78} ${y - 30} ${x + 64} ${y} Z`, fill: BROWN, w: 6 },
      circ(x - 16, y - 40, 9, '#ffffff', null, 3), circ(x + 16, y - 40, 9, '#ffffff', null, 3),
      { d: `M ${x - 120} ${y - 60} q 12 -20 0 -40 q -12 -20 0 -40 M ${x + 120} ${y - 60} q 12 -20 0 -40 q -12 -20 0 -40`, c: '#6b8e23', w: 6 },
    ];
  }
  function burst(x, y, r, fill) {
    let d = '';
    for (let i = 0; i <= 20; i++) {
      const a = -Math.PI / 2 + (i / 20) * Math.PI * 2, rr = i % 2 ? r * 0.62 : r;
      d += (i ? ' L ' : 'M ') + r1(x + Math.cos(a) * rr * 1.35) + ' ' + r1(y + Math.sin(a) * rr);
    }
    return { d: d + ' Z', fill, c: INK.red, w: 7 };
  }
  function stamp(text, cx, cy, size, color, rot) {
    const g = { text, x: cx, y: cy + size * 0.33, size, c: color };
    const w = WB.measure(text, size) + 70, h = size * 1.45;
    return { rot, cx, cy, specs: [{ d: WB.roughRect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), c: color, w: 10 }, g] };
  }
  function showStamp(t0, t1, st, o = {}) {
    const holder = WB.mk('g', { transform: `rotate(${st.rot} ${st.cx} ${st.cy})` }, A ? WB.layer : cont);
    return show(t0, t1, st.specs, Object.assign({ parent: holder, anim: 'slam' }, o));
  }
  function smiley(x, y, r) {
    return [circ(x, y, r, '#ffd23f', null, 8), circ(x - r * 0.35, y - r * 0.2, r * 0.09, '#111', null, 4),
      circ(x + r * 0.35, y - r * 0.2, r * 0.09, '#111', null, 4),
      { d: `M ${x - r * 0.5} ${y + r * 0.2} Q ${x} ${y + r * 0.75} ${x + r * 0.5} ${y + r * 0.2}`, w: 9 }];
  }
  const xmark = (x, y, r) => [{ d: WB.roughLine(x - r, y - r, x + r, y + r, 4), c: INK.red, w: 16 },
    { d: WB.roughLine(x + r, y - r, x - r, y + r, 4), c: INK.red, w: 16 }];
  function banknote(x0, y0, x1, y1) {
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    return [box(x0, y0, x1 - x0, y1 - y0, 16, '#bfe3b0', INK.green, 8),
      box(x0 + 26, y0 + 26, x1 - x0 - 52, y1 - y0 - 52, 10, null, INK.green, 4),
      circ(cx, cy, 82, '#e7f5df', INK.green, 6), T('R$', cx, cy + 34, 96, INK.green),
      T('1', x0 + 70, y0 + 100, 64, INK.green), T('1', x1 - 70, y1 - 46, 64, INK.green)];
  }
  function thought(cx, cy, rx, ry, dots) {
    return [...dots.map(([x, y, r]) => circ(x, y, r, '#ffffff', null, 5)), { d: WB.cloudPath(cx, cy, rx, ry), fill: '#ffffff', w: 7 }];
  }
  function shampoo(x, y) {
    return [box(x - 58, y - 40, 116, 240, 34, '#5fb8e6'), box(x - 20, y - 82, 40, 44, 6, '#ffffff'),
      box(x - 34, y - 124, 68, 46, 10, '#ff7aa8'), box(x - 44, y + 30, 88, 100, 10, '#ffffff', null, 4),
      T('xampu', x, y + 94, 34, INK.blue), circ(x + 100, y - 70, 18, null, INK.blue, 4), circ(x + 132, y - 120, 12, null, INK.blue, 4),
      circ(x - 96, y - 40, 14, null, INK.blue, 4)];
  }
  function clownFace(x, y, r) {
    return [circ(x - r * 0.95, y - r * 0.1, r * 0.45, '#f97316'), circ(x + r * 0.95, y - r * 0.1, r * 0.45, '#22c55e'),
      circ(x, y, r, '#fff7ed', null, 7), circ(x - r * 0.36, y - r * 0.22, r * 0.08, '#111', null, 3),
      circ(x + r * 0.36, y - r * 0.22, r * 0.08, '#111', null, 3), circ(x, y + r * 0.08, r * 0.2, INK.red, null, 4),
      { d: `M ${x - r * 0.5} ${y + r * 0.42} Q ${x} ${y + r * 0.8} ${x + r * 0.5} ${y + r * 0.42}`, c: INK.red, w: 8 }];
  }
  function dog(x, y) {
    return [
      { d: `M ${x + 100} ${y + 20} Q ${x + 160} ${y - 10} ${x + 150} ${y - 70}`, w: 9 },
      { d: `M ${x - 60} ${y + 80} L ${x - 64} ${y + 150} M ${x - 20} ${y + 88} L ${x - 18} ${y + 152} M ${x + 40} ${y + 88} L ${x + 42} ${y + 152} M ${x + 80} ${y + 80} L ${x + 86} ${y + 148}`, w: 9 },
      { d: ellipse(x + 10, y + 40, 112, 60), fill: '#d9a35b', w: 7 },
      circ(x - 110, y - 30, 58, '#d9a35b', null, 7),
      { d: `M ${x - 140} ${y - 78} Q ${x - 182} ${y - 40} ${x - 156} ${y + 8} Q ${x - 140} ${y - 30} ${x - 118} ${y - 72} Z`, fill: '#8a5a2b', w: 5 },
      circ(x - 100, y - 40, 8, '#111', null, 3), circ(x - 160, y - 18, 10, '#111', null, 3),
      { d: `M ${x - 150} ${y + 4} Q ${x - 128} ${y + 18} ${x - 108} ${y + 2}`, w: 4 },
    ];
  }
  function tag(x, y, text) {
    const w = WB.measure(text, 60) + 70;
    return [{ d: `M ${x - w / 2} ${y - 40} L ${x + w / 2 - 30} ${y - 40} L ${x + w / 2} ${y} L ${x + w / 2 - 30} ${y + 40} L ${x - w / 2} ${y + 40} Z`, fill: '#ffd23f', w: 6 },
      circ(x + w / 2 - 34, y, 7, '#ffffff', null, 3), T(text, x - 14, y + 20, 60, INK.black)];
  }
  function flames() {
    return [
      { d: 'M 230 1010 Q 210 820 290 720 Q 300 820 360 840 Q 340 650 450 540 Q 440 700 520 750 Q 545 610 630 500 Q 630 680 705 725 Q 725 630 790 610 Q 775 770 840 830 Q 875 920 850 1010 Z', fill: '#f28c28', c: INK.red, w: 8 },
      { d: 'M 320 1010 Q 300 900 360 840 Q 380 900 420 900 Q 420 790 500 730 Q 500 840 560 860 Q 590 760 650 720 Q 650 840 710 880 Q 760 940 750 1010 Z', fill: '#ffd23f', c: '#ea580c', w: 6 },
    ];
  }
  function glove(x, y, flip) {
    const m = flip ? -1 : 1, X = dx => r1(x + dx * m);
    return [
      box(x - 56, y + 64, 112, 64, 12, '#ffffff'),
      { d: `M ${X(-70)} ${y + 70} Q ${X(-100)} ${y - 40} ${X(-40)} ${y - 86} Q ${X(30)} ${y - 118} ${X(72)} ${y - 44} Q ${X(98)} ${y + 20} ${X(62)} ${y + 72} Z`, fill: INK.red, w: 7 },
      { d: `M ${X(-66)} ${y + 2} Q ${X(-112)} ${y + 12} ${X(-86)} ${y + 58}`, w: 6 },
      { d: `M ${X(-30)} ${y - 60} Q ${X(10)} ${y - 84} ${X(40)} ${y - 50}`, c: '#ffb4b4', w: 6 },
    ];
  }
  function tornado(x, y) {
    const out = [];
    for (let i = 0; i < 6; i++) out.push({ d: ellipse(x + (i % 2 ? 18 : -14) * (i / 3), y + i * 58, 180 - i * 28, 28 - i * 2), c: '#6b7280', w: 8 });
    out.push({ d: `M ${x - 230} ${y + 40} q 20 -30 40 0 M ${x + 210} ${y + 120} q 20 -30 40 0`, c: '#6b7280', w: 6 });
    out.push(box(x + 170, y - 40, 40, 40, 4, '#ffd23f', null, 4), { d: `M ${x - 250} ${y + 200} L ${x - 210} ${y + 170} L ${x - 196} ${y + 214} Z`, fill: '#60a5fa', w: 4 });
    return out;
  }
  function clock(x, y, r) {
    let ticks = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ticks += `M ${r1(x + Math.cos(a) * r * 0.82)} ${r1(y + Math.sin(a) * r * 0.82)} L ${r1(x + Math.cos(a) * r * 0.92)} ${r1(y + Math.sin(a) * r * 0.92)} `;
    }
    const ha = (-90 + 240) * Math.PI / 180;
    return [circ(x, y, r, '#ffffff', null, 9), { d: ticks, w: 6 },
      { d: `M ${x} ${y} L ${r1(x + Math.cos(ha) * r * 0.5)} ${r1(y + Math.sin(ha) * r * 0.5)}`, w: 12 },
      { d: `M ${x} ${y} L ${x} ${y - r * 0.72}`, w: 8 }, circ(x, y, 10, '#111', null, 3),
      T('8', x - r * 0.62, y + r * 0.5, 54, INK.red)];
  }
  const moon = (x, y) => [{ d: `M ${x} ${y - 80} A 80 80 0 1 0 ${x} ${y + 80} A 58 80 0 1 1 ${x} ${y - 80} Z`, fill: '#ffd23f', w: 6 },
    T('*', x + 110, y - 30, 70, INK.orange), T('*', x - 120, y + 40, 50, INK.orange)];
  function flying() {
    const speed = (x, y) => ({ d: `M ${x} ${y} L ${x - 70} ${y - 40} M ${x + 14} ${y - 26} L ${x - 50} ${y - 64} M ${x - 18} ${y + 22} L ${x - 80} ${y - 10}`, c: INK.gray, w: 5 });
    return [
      speed(170, 440), { d: 'M 170 520 Q 170 470 215 470 L 245 505 Q 300 505 305 545 L 170 545 Z', fill: '#8b5cf6', w: 6 },
      speed(470, 360), box(490, 380, 80, 100, 10, '#ef4444'), { d: 'M 570 400 Q 610 420 570 455', w: 6 },
      speed(790, 450), box(800, 460, 110, 110, 10, '#22c55e'), T('A', 855, 545, 80, INK.white),
    ];
  }
  function teeth(x, y) {
    const out = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * (0.15 + i * 0.14);
      out.push({ d: ellipse(r1(x - Math.cos(a) * 170), r1(y - Math.sin(a) * 60), 18, 26), fill: '#fecaca', c: INK.red, w: 4 });
      out.push({ d: ellipse(r1(x - Math.cos(a) * 170), r1(y + 120 + Math.sin(a) * 50), 18, 26), fill: '#fecaca', c: INK.red, w: 4 });
    }
    return out;
  }
  const heart = (x, y, s) => ({ d: `M ${x} ${y + 30 * s} C ${x - 60 * s} ${y - 20 * s} ${x - 30 * s} ${y - 70 * s} ${x} ${y - 35 * s} C ${x + 30 * s} ${y - 70 * s} ${x + 60 * s} ${y - 20 * s} ${x} ${y + 30 * s} Z`, fill: INK.red, w: 6 });
  function person(x, y, skin, hair) {
    return [
      { d: `M ${x - 110} ${y + 200} Q ${x - 100} ${y + 80} ${x} ${y + 76} Q ${x + 100} ${y + 80} ${x + 110} ${y + 200}`, fill: '#cbd5e1', w: 6 },
      circ(x, y, 72, skin),
      { d: `M ${x - 72} ${y - 6} Q ${x - 70} ${y - 82} ${x} ${y - 80} Q ${x + 70} ${y - 82} ${x + 72} ${y - 6} Q ${x} ${y - 50} ${x - 72} ${y - 6} Z`, fill: hair, w: 5 },
      { d: ellipse(x - 26, y + 6, 17, 14), fill: '#ffffff', w: 4 }, { d: ellipse(x + 26, y + 6, 17, 14), fill: '#ffffff', w: 4 },
      circ(x - 26 + 8, y + 12, 6, '#111', null, 2), circ(x + 26 + 8, y + 12, 6, '#111', null, 2),
      { d: `M ${x - 44} ${y - 26} L ${x - 10} ${y - 18} M ${x + 10} ${y - 18} L ${x + 44} ${y - 26}`, w: 6 },
      { d: `M ${x - 14} ${y + 44} Q ${x} ${y + 36} ${x + 14} ${y + 44}`, w: 4 },
    ];
  }
  function badge(x, y) {
    return [
      { d: `M ${x - 150} ${y - 170} L ${x - 20} ${y + 8} M ${x + 150} ${y - 170} L ${x + 20} ${y + 8}`, c: INK.blue, w: 14 },
      box(x - 150, y, 300, 370, 26, '#ffffff', null, 8), box(x - 40, y + 20, 80, 16, 8, '#e5e7eb', null, 4),
      box(x - 95, y + 62, 190, 170, 12, '#e5e7eb', null, 5), T('?', x, y + 205, 150, INK.red),
      { d: `M ${x - 100} ${y + 280} L ${x + 100} ${y + 280} M ${x - 100} ${y + 322} L ${x + 50} ${y + 322}`, c: INK.gray, w: 8 },
    ];
  }

  // ---------------- personagem principal (fica na camada fixa, não vira com a folha) ----------------
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
    const dyn = WB.mk('g', {}, headG);
    const sfx = A ? 'a' : 'b';
    const eyes = [-38, 38].map((ex, i) => {
      const cp = WB.mk('clipPath', { id: `eye${i}${sfx}` }, dyn);
      WB.mk('path', { d: ellipse(ex, 8, 20, 14) }, cp);
      const clip = `url(#eye${i}${sfx})`;
      return {
        ex,
        pupil: WB.mk('circle', { cx: ex, cy: 8, r: 9, fill: '#1f1410', 'clip-path': clip }, dyn),
        lid: WB.mk('rect', { x: ex - 24, y: -12, width: 48, height: 0, fill: SKIN, 'clip-path': clip }, dyn),
        lidLine: WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': 5, 'stroke-linecap': 'round', 'clip-path': clip }, dyn),
        brow: WB.mk('path', { d: '', fill: 'none', stroke: HAIR, 'stroke-width': 10, 'stroke-linecap': 'round' }, dyn),
      };
    });
    const mouth = WB.mk('path', { d: '', fill: MOUTH, stroke: INK.black, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, dyn);
    const nose = WB.mk('circle', { cx: 2, cy: 40, r: 20, fill: '#e3262f', stroke: INK.black, 'stroke-width': 4, opacity: 0 }, dyn);
    // braço + mão (só no formato B)
    const armOut = WB.mk('path', { d: '', fill: 'none', stroke: INK.black, 'stroke-width': 56, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, armG);
    const armIn = WB.mk('path', { d: '', fill: 'none', stroke: SKIN, 'stroke-width': 44, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, armG);
    const handG = WB.mk('g', {}, armG);
    const finger = WB.mk('path', { d: 'M 20 -16 Q 80 -30 108 -24 Q 118 -12 106 -4 Q 70 -2 28 8 Z', fill: SKIN, stroke: INK.black, 'stroke-width': 5, opacity: 0 }, handG);
    WB.mk('path', { d: 'M -36 30 Q -46 -16 -26 -46 Q 0 -62 26 -46 Q 46 -16 36 30 Q 0 48 -36 30 Z', fill: SKIN, stroke: INK.black, 'stroke-width': 5 }, handG);
    WB.mk('path', { d: 'M -14 -42 L -12 -12 M 4 -46 L 4 -14 M 20 -40 L 18 -12', stroke: '#7a4f30', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, handG);
    return { root, backG, headG, armG, back, body, head, dyn, eyes, mouth, nose, armOut, armIn, handG, finger };
  })();

  const MOODS = {
    lado: { lid: 0.15, px: 9, py: 1, bi: 0, bo: 0, smile: 0, rot: 4 },
    leve: { lid: 0.3, px: 3, py: 1, bi: 2, bo: 0, smile: -1, rot: 0 },
    enfado: { lid: 0.5, px: 7, py: 2, bi: 3, bo: 2, smile: -3, rot: -6 },
    sorriso: { lid: 0.35, px: 4, py: 0, bi: -4, bo: -2, smile: 11, rot: -5 },
    seria: { lid: 0.25, px: 0, py: 0, bi: 6, bo: -1, smile: -4, rot: 0 },
    arregalada: { lid: 0, px: 0, py: -1, bi: -13, bo: -10, smile: -1, rot: 3 },
    pensativa: { lid: 0.05, px: 8, py: -9, bi: -9, bo: -4, smile: -2, rot: 8 },
    estresse: { lid: 0.55, px: 0, py: 5, bi: -9, bo: 4, smile: -7, rot: -9 },
    triste: { lid: 0.42, px: -4, py: 6, bi: -10, bo: 5, smile: -9, rot: -5 },
    revira: { lid: 0.1, px: 5, py: -12, bi: -6, bo: -6, smile: -4, rot: 7 },
    brava: { lid: 0.28, px: 0, py: 0, bi: 12, bo: -4, smile: -9, rot: 0 },
    ouch: { lid: 0.7, px: 0, py: 0, bi: 9, bo: -2, smile: -12, rot: -7 },
    confusa: { lid: 0.1, px: 7, py: -5, bi: -9, bo: -2, smile: -4, rot: 9, asym: 1 },
  };
  // [início, humor, mão, aceno]
  const TIMELINE_B = [
    [0, 'lado'], [3.3, 'enfado'], [7.77, 'sorriso'], [12.5, 'sorriso', null, 1], [14.27, 'arregalada'], [14.9, 'seria'],
    [20.13, 'pensativa', 'queixo'], [26.6, 'revira', 'queixo'], [27.6, 'pensativa', 'queixo'], [29.13, 'estresse', 'testa'],
    [31.37, 'triste'], [34.8, 'enfado'], [36.67, 'revira'], [39.13, 'brava'], [40.9, 'brava', 'aponta'], [42.5, 'brava'],
    [44.9, 'brava', null, 1], [46.03, 'enfado'], [49.43, 'arregalada'], [52.03, 'enfado'], [55.9, 'ouch'], [59.1, 'triste'],
    [66.5, 'seria'], [68.33, 'confusa'], [71.53, 'confusa', 'testa'], [74.67, 'sorriso'],
  ];
  const TL = A ? [[0, 'leve']] : TIMELINE_B;
  // mão (x, y, r) e cotovelo (ex, ey); o braço sai do ombro direito (140, 245)
  const HAND = { none: { x: 165, y: 400, r: 0, ex: 165, ey: 330 }, queixo: { x: 42, y: 152, r: -12, ex: 178, ey: 345 }, testa: { x: 112, y: -58, r: -28, ex: 222, ey: 165 }, aponta: { x: 262, y: 40, r: -8, ex: 225, ey: 255 } };
  const keys = ['lid', 'px', 'py', 'bi', 'bo', 'smile', 'rot', 'asym'];
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
    for (let k = 0; k < 26; k++) {
      const tb = 1.6 + k * 3.1 + 0.7 * Math.sin(k * 1.7), d = Math.abs(t - tb);
      if (d < 0.09) v = Math.max(v, 1 - d / 0.09);
    }
    return v;
  }
  if (!A) document.getElementById('hand').style.display = 'none';
  let girlReady = 0;   // A: só ganha vida depois de desenhada
  WB.effect((t) => {
    const s = stateAt(t), op = mouthOpen(t), talk = op > 0 ? 1 : 0;
    girl.dyn.setAttribute('opacity', t >= girlReady ? 1 : 0);
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
      const rx = 24 - 4 * op, top = 74 - 4 - 6 * op + Math.max(0, sm) * 0.3, bot = 74 + 6 + 24 * op + Math.max(0, sm) * 0.6;
      girl.mouth.setAttribute('fill', MOUTH);
      girl.mouth.setAttribute('d', `M ${-rx} 74 Q 0 ${(2 * top - 74).toFixed(1)} ${rx} 74 Q 0 ${(2 * bot - 74).toFixed(1)} ${-rx} 74 Z`);
    }
    // cabeça: inclinação do humor + balanço da fala + aceno
    const rot = s.rot + (A ? 0 : talk * 1.6 * Math.sin(t * 6.5));
    const dy = s.nod + (A ? 0 : talk * 1.5 * Math.sin(t * 11));
    const tr = `translate(0 ${dy.toFixed(1)}) rotate(${rot.toFixed(2)} 0 100)`;
    girl.headG.setAttribute('transform', tr); girl.backG.setAttribute('transform', tr);
    // sacode na mordida (B)
    let sx = 0;
    if (!A && t > 57.85 && t < 58.7) sx = Math.sin(t * 70) * 8 * (1 - (t - 57.85) / 0.85);
    girl.root.setAttribute('transform', `translate(${(540 + sx).toFixed(1)} 1300)`);
    // braço
    if (A || s.handOn < 0.02) { girl.armG.setAttribute('opacity', 0); }
    else {
      const h = s.hand;
      girl.armG.setAttribute('opacity', clamp(s.handOn * 2).toFixed(2));
      const d = `M 140 245 L ${h.ex.toFixed(1)} ${h.ey.toFixed(1)} L ${h.x.toFixed(1)} ${(h.y + 22).toFixed(1)}`;
      girl.armOut.setAttribute('d', d); girl.armIn.setAttribute('d', d);
      girl.handG.setAttribute('transform', `translate(${h.x.toFixed(1)} ${h.y.toFixed(1)}) rotate(${h.r.toFixed(1)})`);
      girl.finger.setAttribute('opacity', s.point.toFixed(2));
    }
  });
  // nariz de palhaça (cena "palhaça velha")
  WB.effect(t => girl.nose.setAttribute('opacity', (clamp((t - 30.8) / 0.1) * (1 - clamp((t - 31.9) / 0.25))).toFixed(3)));

  // ================= CENAS =================
  // 1) Pergunta da entrevista (0–3,3)
  pg(0, 3.3);
  if (A) {
    WB.draw(1, fr(0.05), fr(0.4), girl.body.strokes);
    WB.draw(1, fr(0.42), fr(0.65), girl.back.strokes);
    WB.draw(1, fr(0.67), fr(1.3), girl.head.strokes);
    for (const p of [girl.body, girl.back, girl.head]) p.fills.forEach(f => WB.fillAfter(f.el, f.st, 0.2));
    girlReady = 1.35;
  } else {
    for (const p of [girl.body, girl.back, girl.head]) { WB.showNow(p.strokes); p.fills.forEach(f => f.el.setAttribute('fill-opacity', 1)); }
  }
  show(1.35, 1.6, [{ d: 'M 772 1262 L 930 1480', c: '#333333', w: 30 }, circ(740, 1222, 44, '#6b7280', null, 6),
    { d: 'M 712 1200 L 768 1244 M 708 1226 L 752 1262 M 726 1186 L 772 1222', c: '#d1d5db', w: 4 }],
  { bt: 0.15, anim: 'fly', fx: 420, fy: 300, loop: 'wiggle' });
  show(1.62, 1.85, bubble(110, 340, 970, 610, 720, 1140), { bt: 0.45 });
  show(1.9, 3.2, T('Quem fica com ele?', 540, 505, 104), { bt: 0.6, loop: 'wiggle' });

  // 2) Casa da vó + supapo (3,3–7,77)
  pg(3.3, 7.77);
  show(3.6, 4.6, house(150, 600, 500, 880), { bt: 3.5 });
  show(4.65, 5.4, T('casa da vó', 325, 980, 76), { bt: 4.4 });
  show(5.5, 6.6, boy(770, 660, 1.15), { bt: 5.4, loop: 'bounce' });
  show(7.0, 7.6, [burst(760, 400, 120, '#ffd23f'), T('SUPAPO!', 760, 422, 62, INK.red)], { bt: 7.08, anim: 'slam', loop: 'shake' });

  // 3) Vó conta que ele cagou no banheiro (7,77–12,5) + 4) "cagou sim" (12,5–14,27)
  pg(7.77, 14.27);
  show(8.05, 9.0, vo(220, 600), { bt: 7.95, loop: 'wiggle' });
  show(9.05, 9.3, bubble(380, 330, 1000, 580, 300, 530), { bt: 9.1 });
  show(9.35, 10.7, [T('ele cagou', 690, 435, 84), T('no banheiro!', 690, 530, 84)], { bt: 10.13 });
  show(10.75, 11.5, toilet(720, 640), { bt: 10.83 });
  show(11.55, 12.1, poop(720, 790), { bt: 11.5, loop: 'bounce' });
  showStamp(13.3, 14.1, stamp('CAGOU SIM.', 540, 1060, 92, INK.red, -6), { bt: 13.47 });

  // 5) "Oi? Não, nem coisa assim de sorrir" (14,27–17,3)
  pg(14.27, 17.3);
  show(14.55, 14.95, T('Oi?', 220, 420, 130), { bt: 14.3, loop: 'wiggle' });
  show(15.4, 16.2, smiley(560, 660, 190), { bt: 15.5 });
  show(16.25, 16.6, xmark(560, 660, 190), { bt: 16.53, anim: 'slam' });
  show(16.65, 17.25, T('sorrir? não!', 560, 1010, 100, INK.red), { bt: 16.85 });

  // 6) "é uma coisa séria também, pois é" (17,3–20,13)
  pg(17.3, 20.13);
  show(17.9, 18.5, T('é uma', 540, 430, 96), { bt: 18.47 });
  showStamp(18.6, 19.6, stamp('COISA SÉRIA', 540, 650, 110, INK.red, -5), { bt: 18.93 });
  show(19.65, 20.1, T('pois é.', 540, 930, 100), { bt: 19.67 });

  // 7) Benefício / salário mínimo (20,13–25,2)
  pg(20.13, 25.2);
  show(21.2, 22.6, T('O benefício', 540, 400, 108), { bt: 22.03 });
  show(23.0, 23.9, banknote(170, 500, 910, 820), { bt: 24.17, loop: 'float' });
  show(24.0, 25.0, T('1 salário mínimo', 540, 990, 92, INK.green), { bt: 24.3 });

  // 8) Sonhando com um shampoo (25,2–29,13)
  pg(25.2, 29.13);
  show(25.5, 26.4, thought(560, 560, 380, 250, [[700, 1075, 14], [752, 975, 22], [790, 860, 30]]), { bt: 25.8, loop: 'float' });
  show(27.6, 28.3, shampoo(560, 560), { bt: 27.7, loop: 'wiggle' });
  show(28.35, 28.95, T('pra MIM?', 330, 1000, 100, INK.purple), { bt: 28.33 });

  // 9) "pra botar no cabelo da palhaça velha" (29,13–31,37)
  pg(29.13, 31.37);
  show(29.4, 30.2, T('pro cabelo da', 540, 450, 100), { bt: 29.9 });
  show(30.25, 30.75, clownFace(540, 880, 110), { bt: 30.6, loop: 'wiggle' });
  show(30.8, 31.33, T('palhaça velha', 540, 640, 120, INK.red), { bt: 30.77, anim: 'slam' });

  // 10) Até o cachorro vale mais (31,37–34,8)
  pg(31.37, 34.8);
  show(31.7, 32.5, dog(330, 700), { bt: 32.27, loop: 'bounce' });
  show(32.55, 32.95, tag(320, 560, 'R$ 1000'), { bt: 32.63 });
  show(33.0, 33.55, T('até o cachorro', 540, 360, 92), { bt: 32.83 });
  show(33.6, 33.75, T('>', 590, 790, 190, INK.red), { bt: 33.73, anim: 'slam' });
  show(33.8, 34.3, tinyGirl(820, 650), { bt: 34.13 });
  show(34.32, 34.75, T('R$ 0', 820, 1010, 84, INK.red), { bt: 34.3, anim: 'slam' });

  // 11) "não vou poder" + 12) "minha vida vai virar um inferno" (34,8–39,13)
  pg(34.8, 39.13);
  show(35.1, 36.2, T('não vou poder...', 540, 400, 100), { bt: 35.37 });
  show(36.9, 37.9, flames(), { bt: 37.6, loop: 'flicker', oy: 1010 });
  show(38.0, 38.9, T('INFERNO', 540, 930, 130, '#7f1d1d'), { bt: 38.77, anim: 'slam', loop: 'shake' });

  // 13) "quem tiver achando ruim, pegar ele e levar" (39,13–42,5)
  pg(39.13, 42.5);
  show(39.45, 40.85, T('achou ruim?', 540, 420, 120), { bt: 40.27 });
  show(40.9, 41.5, boy(300, 640, 1.1), { bt: 40.9, loop: 'bounce' });
  show(41.52, 41.75, [{ d: 'M 420 700 Q 650 540 880 690', c: INK.red, w: 9 }, { d: WB.arrowHead(880, 690, 0.6, 34), c: INK.red, w: 9 }], { bt: 41.45 });
  show(41.78, 42.45, T('leva ele!', 600, 1020, 124, INK.red), { bt: 41.77, anim: 'slam' });

  // 14) "não vou ficar louca, quem luta com ele é eu" (42,5–46,03)
  pg(42.5, 46.03);
  show(42.8, 44.0, T('não vou ficar louca', 540, 410, 88), { bt: 43.3 });
  show(44.05, 44.85, [glove(330, 690), glove(750, 690, true)], { bt: 44.97, loop: 'shake' });
  show(44.9, 45.95, T('quem luta é EU!', 540, 1010, 108, INK.red), { bt: 45.27, anim: 'slam' });

  // 15) Casa do pai + 16) "virou a soroba" (46,03–52,03)
  pg(46.03, 52.03);
  show(46.35, 47.2, house(140, 620, 470, 900), { bt: 46.33 });
  show(47.25, 47.9, T('casa do pai', 305, 1000, 76), { bt: 46.5 });
  show(47.95, 48.9, dad(760, 620), { bt: 46.83, loop: 'wiggle' });
  show(49.5, 50.4, tornado(305, 520), { bt: 49.9, loop: 'spin' });
  show(50.45, 51.9, T('virou a soroba!', 540, 340, 104, INK.red), { bt: 50.5, anim: 'slam' });

  // 17) "chegou oito hora da noite, ele virou tudo" (52,03–55,9)
  pg(52.03, 55.9);
  show(52.35, 52.75, moon(820, 480), { bt: 53.37, loop: 'float' });
  show(52.8, 53.5, clock(330, 620, 170), { bt: 52.9 });
  show(53.55, 54.1, T('8 da noite', 600, 910, 100), { bt: 53.2 });
  show(54.2, 55.3, T('virou tudo!', 540, 1050, 112, INK.red), { bt: 54.1, anim: 'slam', loop: 'shake' });

  // 18) "jogou coisa em mim, me mordeu" (55,9–59,1)
  pg(55.9, 59.1);
  show(56.6, 57.5, flying(), { bt: 56.6, anim: 'fly', fx: -500, fy: -200, loop: 'wiggle' });
  show(57.9, 58.4, teeth(540, 860), { bt: 57.9, anim: 'slam' });
  show(58.45, 58.95, T('NHAC!', 540, 740, 130, INK.red), { bt: 57.95, anim: 'slam', loop: 'shake' });

  // 19) "não gosto de andar com ele na rua, não é vergonha" (59,1–63,1)
  pg(59.1, 63.1);
  show(59.45, 59.95, T('na rua', 540, 360, 100), { bt: 60.33 });
  show(60.0, 61.1, [tinyGirl(420, 600), boy(660, 640, 0.85), { d: 'M 495 735 Q 540 760 585 730', w: 9 }], { bt: 59.5 });
  show(61.4, 61.8, heart(540, 520, 1.3), { bt: 62.53, loop: 'pulse' });
  show(61.9, 63.0, T('não é vergonha!', 540, 1030, 104, INK.red), { bt: 62.3 });

  // 20) "a gente sofre" + 21) "preconceito, ele não se aquieta" (63,1–68,33)
  pg(63.1, 68.33);
  show(63.4, 64.6, [person(230, 560, '#e0b48f', '#6b4423'), person(540, 520, '#8d5a3b', '#1f1f24'), person(850, 560, '#f1c9a5', '#d4a017')], { bt: 63.63 });
  show(64.7, 65.9, T('a gente sofre', 540, 340, 100), { bt: 65.97 });
  showStamp(66.7, 67.7, stamp('PRECONCEITO', 540, 860, 100, INK.red, -5), { bt: 66.7 });
  show(67.75, 68.3, T('ele não se aquieta', 540, 1060, 76), { bt: 67.5, loop: 'shake' });

  // 22) Crachá de identificação + 23) "não sei onde faz" (68,33–74,67)
  pg(68.33, 74.67);
  show(68.7, 69.9, badge(540, 560), { bt: 69.1, loop: 'float' });
  show(70.0, 71.45, T('crachá de identificação', 540, 1020, 78), { bt: 70.27 });
  show(72.0, 73.2, T('onde faz isso??', 540, 330, 100), { bt: 72.17, loop: 'wiggle' });
  show(73.25, 73.6, T('?', 170, 720, 200, INK.red), { bt: 72.9, loop: 'wiggle' });

  // 24) Chamada para seguir (74,67–fim)
  pg(74.67, 99);
  if (A) WB.ctaRedes(1, fr(74.95), fr(77.6), { y: 380 });
  else {
    const g = WB.mk('g', {}, cont);
    WB.showNow(WB.textStrokes('Gostou? Me segue!', 540, 470, 96, INK.green, g, 'middle').strokes);
    const ic = WB.notebookIcon(150, 560, 190, g, 12);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes('@caderno_amarelo', 380, 560 + 190 * 0.62, 84, INK.black, g).strokes);
    animate(g, 74.8, { loop: 'float' });
  }
};
