/*
 * Motor de vídeo "whiteboard" (papel e caneta) — 1080x1920.
 *
 * O projeto fornece:
 *   projeto.json  -> marca (redes sociais), opções
 *   timeline.json -> gerado pelo gerar_audio.py (início/fim de cada cena)
 *   cenas.js      -> window.CENAS = function (WB) { ...desenha as cenas usando a API... }
 *
 * O motor monta o papel, a mão com o marcador e expõe window.seekToTime(t),
 * que deixa TODO o quadro em função de t (determinístico, quadro a quadro).
 * Referência completa da API: references/api.md da skill.
 */
(async function () {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1080, H = 1920;
  const INK = {
    black: '#1f1f24', red: '#d62828', blue: '#1d4ed8', green: '#15803d',
    orange: '#ea580c', purple: '#7c3aed', gray: '#8a8a8a', white: '#ffffff',
  };
  const REST = { x: 1000, y: 1912 };   // mão "estacionada" na borda inferior direita

  // ---------------- estrutura do SVG ----------------
  const svg = document.getElementById('svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.innerHTML = `
  <defs>
    <filter id="paperNoise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.2  0 0 0 0.55 0"/>
    </filter>
    <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
      <stop offset="60%" stop-color="#7a5a20" stop-opacity="0"/>
      <stop offset="100%" stop-color="#7a5a20" stop-opacity="0.22"/>
    </radialGradient>
    <filter id="marker" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="3" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="handShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="9"/>
      <feOffset dx="18" dy="22"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.28"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6d2b4"/><stop offset="1" stop-color="#e3a985"/>
    </linearGradient>
    <linearGradient id="markerBody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#d9d9d9"/><stop offset="0.35" stop-color="#ffffff"/><stop offset="1" stop-color="#bdbdbd"/>
    </linearGradient>
    <linearGradient id="sleeve" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#25507d"/><stop offset="0.5" stop-color="#3567a0"/><stop offset="1" stop-color="#1f4369"/>
    </linearGradient>
    <pattern id="gridPat" x="30" y="30" width="216" height="216" patternUnits="userSpaceOnUse">
      <g fill="rgba(70,130,200,0.16)">
        <rect x="54" width="1" height="216"/><rect x="108" width="1" height="216"/><rect x="162" width="1" height="216"/>
        <rect y="54" width="216" height="1"/><rect y="108" width="216" height="1"/><rect y="162" width="216" height="1"/>
      </g>
      <g fill="rgba(70,130,200,0.26)"><rect width="2" height="216"/><rect width="216" height="2"/></g>
    </pattern>
    <g id="paperBg">
      <rect width="${W}" height="${H}" fill="#fbf5df"/>
      <rect width="${W}" height="${H}" fill="url(#gridPat)"/>
      <rect x="88" width="3" height="${H}" fill="rgba(214,40,40,0.35)"/>
    </g>
    <linearGradient id="pageShadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3c2a0a" stop-opacity="0.35"/><stop offset="1" stop-color="#3c2a0a" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="igGrad" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#feda75"/><stop offset="0.3" stop-color="#fa7e1e"/><stop offset="0.6" stop-color="#d62976"/>
      <stop offset="0.85" stop-color="#962fbf"/><stop offset="1" stop-color="#4f5bd5"/>
    </linearGradient>
  </defs>
  <g id="pages"></g>
  <rect width="${W}" height="${H}" filter="url(#paperNoise)" opacity="0.35"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <g id="watermark" opacity="0"></g>
  <g id="hand"><g id="handRot" filter="url(#handShadow)">
    <path d="M 70 300 C 60 520 70 800 80 1300 L 360 1300 C 350 820 330 520 270 330 Z" fill="url(#skin)" stroke="#9b6142" stroke-width="3"/>
    <path d="M 62 640 C 150 660 270 660 350 630 L 380 1300 L 50 1300 Z" fill="url(#sleeve)" stroke="#173554" stroke-width="3"/>
    <path d="M 62 640 C 150 660 270 660 350 630 L 352 690 C 270 720 150 720 60 700 Z" fill="#2b5a8c" stroke="#173554" stroke-width="3"/>
    <path d="M 22 150 C 70 105 190 120 255 200 C 310 270 300 380 268 450 C 230 520 120 520 70 470 C 30 430 20 330 26 260 Z" fill="url(#skin)" stroke="#9b6142" stroke-width="3"/>
    <path d="M 30 205 C 70 185 120 192 132 222 C 140 248 108 262 70 258 C 45 256 30 240 30 205 Z" fill="url(#skin)" stroke="#9b6142" stroke-width="3"/>
    <path d="M 40 262 C 80 250 125 258 132 285 C 138 310 106 320 72 316 C 50 313 38 298 40 262 Z" fill="url(#skin)" stroke="#9b6142" stroke-width="3"/>
    <rect x="-25" y="60" width="50" height="380" rx="13" fill="url(#markerBody)" stroke="#2b2b2b" stroke-width="3"/>
    <rect class="ink-tint" x="-25" y="372" width="50" height="68" rx="12" fill="#1f1f24" stroke="#2b2b2b" stroke-width="3"/>
    <rect class="ink-tint" x="-25" y="250" width="50" height="16" fill="#1f1f24"/>
    <rect x="-19" y="34" width="38" height="30" rx="4" fill="#9aa0a6" stroke="#2b2b2b" stroke-width="3"/>
    <path class="ink-tint" d="M -7 1 Q 0 -3 7 1 L 16 36 L -16 36 Z" fill="#1f1f24" stroke="#2b2b2b" stroke-width="2"/>
    <path d="M -30 118 C -34 92 -14 80 4 84 C 40 92 90 120 140 150 C 160 162 150 196 124 192 C 80 182 30 166 -12 158 C -26 154 -30 140 -30 118 Z" fill="url(#skin)" stroke="#9b6142" stroke-width="3"/>
    <path d="M -6 92 C 2 90 12 92 16 100" fill="none" stroke="#c98f6d" stroke-width="2.5"/>
    <path d="M -24 150 C -58 158 -64 196 -46 222 C -28 248 18 252 46 236 L 34 198 C 8 202 -12 186 -24 150 Z" fill="url(#skin)" stroke="#9b6142" stroke-width="3"/>
    <path d="M -44 170 C -50 180 -50 192 -44 200" fill="none" stroke="#fff3ea" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
  </g></g>`;
  const pagesRoot = svg.querySelector('#pages');
  const hand = svg.querySelector('#hand');
  const handRot = svg.querySelector('#handRot');
  const tintEls = [...svg.querySelectorAll('.ink-tint')];
  const watermark = svg.querySelector('#watermark');

  const [projeto, timeline, fontBuf] = await Promise.all([
    fetch('projeto.json').then(r => r.json()),
    fetch('timeline.json').then(r => r.json()),
    fetch('Caveat-Bold.ttf').then(r => r.arrayBuffer()),
  ]);
  const font = opentype.parse(fontBuf);

  // ---------------- utilidades ----------------
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const lerp = (a, b, u) => a + (b - a) * u;
  const lerpP = (p, q, u) => ({ x: lerp(p.x, q.x, u), y: lerp(p.y, q.y, u) });
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rand = rng(projeto.semente || 20261003);
  const jit = (a) => (rand() - 0.5) * 2 * a;

  // ---------------- folhas ----------------
  let currentPage = null;
  let inkLayer = null;
  function makePage() {
    const page = document.createElementNS(NS, 'g');
    page.innerHTML = `<use href="#paperBg"/><rect y="${H}" width="${W}" height="60" fill="url(#pageShadow)"/>` +
      `<g filter="url(#marker)"></g>`;
    // nova folha fica POR BAIXO da atual
    if (currentPage) pagesRoot.insertBefore(page, currentPage); else pagesRoot.appendChild(page);
    return page;
  }
  currentPage = makePage();
  inkLayer = currentPage.lastChild;

  function mk(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    (parent || inkLayer).appendChild(el);
    return el;
  }
  const group = (parent, transform) => {
    const g = mk('g', transform ? { transform } : {}, parent);
    return g;
  };

  // ---------------- formas "à mão" (retornam o atributo d) ----------------
  function roughSeg(x1, y1, x2, y2, amp = 3) {
    const mx = (x1 + x2) / 2 + jit(amp), my = (y1 + y2) / 2 + jit(amp);
    return `Q ${mx.toFixed(1)} ${my.toFixed(1)} ${(x2 + jit(1)).toFixed(1)} ${(y2 + jit(1)).toFixed(1)}`;
  }
  const roughLine = (x1, y1, x2, y2, amp) => `M ${x1} ${y1} ` + roughSeg(x1, y1, x2, y2, amp);
  const roughRect = (x0, y0, x1, y1) => `M ${x0} ${y1} ` + roughSeg(x0, y1, x0, y0) + ' ' + roughSeg(x0, y0, x1, y0) +
    ' ' + roughSeg(x1, y0, x1, y1) + ' ' + roughSeg(x1, y1, x0 - 2, y1 + 1);
  function zigzagHatch(x0, y0, x1, y1, sp = 15) {
    const pts = []; let y = y1 - 6, left = true;
    while (y > y0 + 4) { pts.push([left ? x0 + 6 : x1 - 6, y]); y -= sp; left = !left; }
    pts.push([left ? x0 + 6 : x1 - 6, y0 + 6]);
    return 'M ' + pts.map(p => `${(p[0] + jit(2)).toFixed(1)} ${(p[1] + jit(2)).toFixed(1)}`).join(' L ');
  }
  function dashedLine(x0, x1, y, on = 34, off = 20) {
    let d = '';
    for (let x = x0; x < x1; x += on + off) {
      d += `M ${x} ${(y + jit(1.5)).toFixed(1)} L ${Math.min(x + on, x1)} ${(y + jit(1.5)).toFixed(1)} `;
    }
    return d;
  }
  function wavyLine(x0, x1, y, amp = 6, wl = 64) {
    let d = `M ${x0} ${y}`, i = 0;
    for (let x = x0; x < x1; x += wl / 2, i++) {
      const xe = Math.min(x + wl / 2, x1);
      d += ` Q ${(x + xe) / 2} ${y + (i % 2 ? amp : -amp)} ${xe} ${y + jit(1)}`;
    }
    return d;
  }
  function loopEllipse(cx, cy, rx, ry, turns = 1.12, start = -1.9) {
    const n = 120; let d = '';
    for (let i = 0; i <= n; i++) {
      const a = start + (i / n) * turns * Math.PI * 2;
      const k = 1 + 0.03 * Math.sin(a * 3 + 1) + (i / n) * 0.03;
      d += (i ? ' L ' : 'M ') + (cx + Math.cos(a) * rx * k).toFixed(1) + ' ' + (cy + Math.sin(a) * ry * k).toFixed(1);
    }
    return d;
  }
  function arrowHead(x, y, angle, size = 30) {
    const a1 = angle + Math.PI * 0.82, a2 = angle - Math.PI * 0.82;
    return `M ${(x + Math.cos(a1) * size).toFixed(1)} ${(y + Math.sin(a1) * size).toFixed(1)} L ${x} ${y} ` +
      `L ${(x + Math.cos(a2) * size).toFixed(1)} ${(y + Math.sin(a2) * size).toFixed(1)}`;
  }
  // Arco de elipse de a0 a a1 (radianos; 0 = direita, PI/2 = baixo). Ex.: base de moeda = arcPath(cx, cy, rx, ry, 0, Math.PI).
  function arcPath(cx, cy, rx, ry, a0, a1, n = 40) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * (i / n);
      d += (i ? ' L ' : 'M ') + (cx + Math.cos(a) * rx).toFixed(1) + ' ' + (cy + Math.sin(a) * ry).toFixed(1);
    }
    return d;
  }
  const circlePath = (cx, cy, r) => `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;
  const roundRectPath = (x, y, w, h, r) =>
    `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h - r} ` +
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} ` +
    `L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y}`;
  function cloudPath(cx, cy, rx, ry, n = 11) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      d += ` Q ${(mx + (mx - cx) * 0.35).toFixed(1)} ${(my + (my - cy) * 0.35).toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
    }
    return d;
  }

  // ---------------- traços revelados pela caneta ----------------
  const subpaths = d => d.split(/(?=M)/).map(x => x.trim()).filter(Boolean);
  function prepDash(p) {
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len + 2} ${len + 12}`;
    p.style.strokeDashoffset = len + 6;
    p.style.visibility = 'hidden';
    return len;
  }
  // Um traço por subcaminho (a mão revela cada um em sequência).
  function strokePath(d, color = INK.black, width = 7, parent, opts = {}) {
    return subpaths(d).map(sd => {
      const p = mk('path', {
        d: sd, fill: 'none', stroke: color, 'stroke-width': width,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      }, parent);
      if (opts.opacity) p.setAttribute('opacity', opts.opacity);
      return { el: p, len: prepDash(p), color };
    });
  }
  const measure = (str, size) => font.getAdvanceWidth(str, size);
  // Texto manuscrito: contornos dos glifos (fonte Caveat) traçados e depois preenchidos.
  function textStrokes(str, x, y, size, color = INK.black, parent, anchor = 'start') {
    const w = measure(str, size);
    if (anchor === 'middle') x -= w / 2;
    if (anchor === 'end') x -= w;
    const strokes = [];
    for (const gp of font.getPaths(str, x, y, size)) {
      const d = gp.toPathData(2);
      if (!d) continue;
      const fillEl = mk('path', { d, fill: color, 'fill-opacity': 0, stroke: 'none' }, parent);
      const contours = subpaths(d).map(cd => {
        const p = mk('path', {
          d: cd, fill: 'none', stroke: color, 'stroke-width': Math.max(1.6, size * 0.03),
          'stroke-linejoin': 'round', 'stroke-linecap': 'butt',
        }, parent);
        return { el: p, len: prepDash(p), color };
      });
      contours[contours.length - 1].fillEl = fillEl;
      strokes.push(...contours);
    }
    return { strokes, width: w, x, y, size };
  }
  // Quebra um texto em linhas que caibam em maxW.
  function wrap(str, size, maxW) {
    const words = str.split(/\s+/); const lines = []; let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (cur && measure(test, size) > maxW) { lines.push(cur); cur = w; } else cur = test;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  function showNow(list) {
    for (const s of list.flat(3)) {
      s.el.style.visibility = 'visible'; s.el.style.strokeDashoffset = 0;
      if (s.fillEl) s.fillEl.setAttribute('fill-opacity', 1);
    }
  }

  // ---------------- agenda ----------------
  const scenes = timeline.cenas;
  function at(scene, f) {
    const s = scenes[scene - 1];
    if (!s) throw new Error(`cena ${scene} não existe no timeline.json (há ${scenes.length})`);
    return s.start + f * (s.end - s.start);
  }
  const drawItems = [], handSegs = [], effects = [];
  const effect = (fn) => effects.push(fn);

  function ptAt(s, l) {
    if (!s.ctm) s.ctm = s.el.getCTM();
    const p = s.el.getPointAtLength(l).matrixTransform(s.ctm);
    return { x: p.x, y: p.y };
  }
  // Agenda os traços para serem desenhados entre as frações f0 e f1 da cena.
  function draw(scene, f0, f1, strokes) {
    strokes = [strokes].flat(4).filter(Boolean);
    if (!strokes.length) return strokes;
    const t0 = at(scene, f0), t1 = at(scene, f1);
    const items = []; let prevEnd = null, total = 0;
    for (const s of strokes) {
      const start = ptAt(s, 0);
      if (prevEnd) {
        const w = Math.hypot(start.x - prevEnd.x, start.y - prevEnd.y) * 0.3 + 4;
        items.push({ type: 'travel', from: prevEnd, to: start, w }); total += w;
      }
      items.push({ type: 'stroke', s, w: Math.max(s.len, 1) }); total += Math.max(s.len, 1);
      prevEnd = ptAt(s, s.len);
    }
    let t = t0;
    for (const it of items) {
      const dt = (it.w / total) * (t1 - t0);
      it.t0 = t; it.t1 = t + dt; t += dt;
      if (it.type === 'stroke') {
        const s = it.s; s.t0 = it.t0; s.t1 = it.t1;
        handSegs.push({
          t0: s.t0, t1: s.t1, drawing: true, color: s.color,
          pos: (tt) => ptAt(s, clamp((tt - s.t0) / (s.t1 - s.t0)) * s.len),
        });
      } else {
        const a = it.from, b = it.to, c0 = it.t0, c1 = it.t1;
        handSegs.push({
          t0: c0, t1: c1, drawing: false, color: strokes[0].color,
          pos: (tt) => lerpP(a, b, ease(clamp((tt - c0) / Math.max(1e-6, c1 - c0)))),
        });
      }
    }
    drawItems.push({ t0, t1, strokes });
    return strokes;
  }
  // Atalho: escreve um texto entre f0 e f1.
  function write(scene, f0, f1, str, x, y, size, color, opts = {}) {
    const t = textStrokes(str, x, y, size, color, opts.parent, opts.anchor || 'start');
    draw(scene, f0, f1, t.strokes);
    return t;
  }
  // Escreve várias linhas (array ou texto quebrado por maxWidth), dividindo o tempo pelo tamanho de cada uma.
  function writeLines(scene, f0, f1, lines, x, y, size, color, opts = {}) {
    if (typeof lines === 'string') lines = wrap(lines, size, opts.maxWidth || 900);
    const lh = opts.lineHeight || size * 1.15;
    const total = lines.reduce((a, l) => a + l.length, 0) || 1;
    let f = f0; const out = [];
    lines.forEach((l, i) => {
      const fe = f + (f1 - f0) * (l.length / total);
      out.push(write(scene, f, fe, l, x, y + i * lh, size, color, opts));
      f = fe;
    });
    return out;
  }
  // A mão segue posFn(t) entre t0 e t1 (ex.: arrastando algo).
  function handFollow(t0, t1, posFn, color = INK.black) {
    handSegs.push({ t0, t1, drawing: false, color, pos: posFn });
  }
  // Manda a mão para a borda inferior (repouso) entre f0 e f1, para não cobrir o quadro enquanto a fala continua.
  function restHand(scene, f0, f1) {
    handFollow(at(scene, f0), at(scene, f1), () => REST);
  }
  // Move um grupo (dx, dy) num arco, com a mão "arrastando" pelo ponto grab.
  function moveGroup(scene, f0, f1, g, dx, dy, opts = {}) {
    const m0 = at(scene, f0), m1 = at(scene, f1);
    const lift = opts.arc ?? 160;
    const ctrl = { x: dx * 0.5 + 30, y: Math.min(0, dy) - lift };
    const off = (t) => {
      const u = ease(clamp((t - m0) / (m1 - m0))), a = 1 - u;
      return { x: 2 * a * u * ctrl.x + u * u * dx, y: 2 * a * u * ctrl.y + u * u * dy };
    };
    effect((t) => { const o = off(t); g.setAttribute('transform', `translate(${o.x.toFixed(2)} ${o.y.toFixed(2)})`); });
    if (opts.grab) handFollow(m0, m1, (t) => { const o = off(t); return { x: opts.grab.x + o.x, y: opts.grab.y + o.y }; }, opts.color);
    return off;
  }
  // Interpola opacidade de um elemento (sem mão).
  function fade(scene, f0, f1, el, from, to) {
    const a = at(scene, f0), b = at(scene, f1);
    effect((t) => el.setAttribute('opacity', lerp(from, to, ease(clamp((t - a) / Math.max(1e-6, b - a)))).toFixed(3)));
  }
  // Interpola translate+scale de um grupo (ex.: encolher um desenho para um canto).
  function transform(scene, f0, f1, g, from, to) {
    const a = at(scene, f0), b = at(scene, f1);
    effect((t) => {
      const u = ease(clamp((t - a) / Math.max(1e-6, b - a)));
      g.setAttribute('transform', `translate(${lerp(from.x || 0, to.x || 0, u)} ${lerp(from.y || 0, to.y || 0, u)}) ` +
        `scale(${lerp(from.s ?? 1, to.s ?? 1, u)})`);
    });
  }
  // Preenchimento (ex.: fundo de ícone) aparece depois do último traço da lista.
  function fillAfter(el, strokeList, dur = 0.35) {
    const s = [strokeList].flat(4).slice(-1)[0];
    effect((t) => el.setAttribute('fill-opacity', clamp((t - s.t1) / dur).toFixed(3)));
  }
  // Vira a folha atual (a mão puxa para cima) e passa a desenhar numa folha nova.
  function newPage(scene, f0 = 0, f1 = 0.06) {
    const page = currentPage;
    const next = makePage();
    const t0 = at(scene, f0), t1 = at(scene, f1);
    const lift = (t) => ease(clamp((t - t0) / (t1 - t0)));
    effect((t) => {
      const u = lift(t);
      page.setAttribute('transform', u <= 0 ? '' :
        `translate(0 ${(-2000 * u).toFixed(1)}) rotate(${(-4 * Math.sin(Math.PI * u)).toFixed(2)} 0 ${H})`);
      page.style.display = u >= 1 ? 'none' : '';
    });
    handFollow(t0, t1, (t) => ({ x: 760 - 140 * lift(t), y: Math.max(260, 1890 - 2000 * lift(t)) }));
    currentPage = next;
    inkLayer = next.lastChild;
    return next;
  }

  // ---------------- componentes prontos (retornam traços para usar com draw) ----------------
  const C = {
    // Eixos de gráfico: y de yBase até yTop (com seta), x de x0 até xEnd.
    axes(x0, yBase, yTop, xEnd, color = INK.black) {
      return [strokePath(roughLine(x0, yBase + 6, x0, yTop, 2), color, 7),
        strokePath(arrowHead(x0, yTop, -Math.PI / 2, 26), color, 7),
        strokePath(roughLine(x0 - 6, yBase, xEnd, yBase, 2), color, 7)];
    },
    // Barra com contorno e hachura (retorna {outline, hatch} para desenhar em momentos diferentes).
    bar(x0, yTop, yBase, width, color, parent, hatchOpacity = 0.75) {
      return {
        outline: strokePath(roughRect(x0, yTop, x0 + width, yBase - 4), color, 7, parent),
        hatch: strokePath(zigzagHatch(x0, yTop, x0 + width, yBase - 4, 15), color, 4, parent, { opacity: hatchOpacity }),
      };
    },
    // Seta curva de (sx,sy) a (ex,ey) passando perto de (cx,cy).
    curvedArrow(sx, sy, cx, cy, ex, ey, color = INK.black, width = 6, parent) {
      return [strokePath(`M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`, color, width, parent),
        strokePath(arrowHead(ex, ey, Math.atan2(ey - cy, ex - cx), 26), color, width, parent)];
    },
    arrow(x1, y1, x2, y2, color = INK.black, width = 7, parent) {
      return [strokePath(roughLine(x1, y1, x2, y2, 2), color, width, parent),
        strokePath(arrowHead(x2, y2, Math.atan2(y2 - y1, x2 - x1), 26), color, width, parent)];
    },
    underline(x0, x1, y, color = INK.red, width = 8) { return strokePath(wavyLine(x0, x1, y), color, width); },
    circleAround(cx, cy, rx, ry, color = INK.blue, width = 7) { return strokePath(loopEllipse(cx, cy, rx, ry), color, width); },
    xMark(cx, cy, r = 42, color = INK.red, width = 10) {
      return [strokePath(roughLine(cx - r, cy - r, cx + r, cy + r, 3), color, width),
        strokePath(roughLine(cx + r, cy - r, cx - r, cy + r, 3), color, width)];
    },
    check(cx, cy, s = 60, color = INK.green, width = 12) {
      return strokePath(`M ${cx - s} ${cy} L ${cx - s * 0.3} ${cy + s * 0.75} L ${cx + s} ${cy - s * 0.8}`, color, width);
    },
    box(x0, y0, x1, y1, color = INK.black, width = 8, parent) { return strokePath(roughRect(x0, y0, x1, y1), color, width, parent); },
    // Boneco palito com cabeça em (x, y). Retorna traços (inclui o nome, se houver).
    stickFigure(x, y, opts = {}) {
      const s = opts.scale || 1, c = opts.color || INK.black, P = (dx, dy) => [x + dx * s, y + dy * s];
      const L = (a, b) => strokePath(roughLine(...P(...a), ...P(...b), 2), c, 7);
      const out = [
        strokePath(circlePath(x, y, 58 * s), c, 7),
        strokePath(`M ${P(-23, -15)} L ${P(-21, -11)} M ${P(20, -15)} L ${P(22, -11)}`.replace(/,/g, ' '), c, 9),
        strokePath(`M ${P(-25, 18)} Q ${P(0, 42)} ${P(26, 18)}`.replace(/,/g, ' '), c, 5),
        L([0, 58], [2, 240]), L([1, 110], [-70, 190]), L([1, 110], [75, 68]),
        L([2, 240], [-50, 360]), L([2, 240], [55, 360]),
      ];
      if (opts.label) out.push(textStrokes(opts.label, x, y + 430 * s, 62 * s, c, null, 'middle').strokes);
      return out;
    },
    // Balão de pensamento: nuvem + bolinhas saindo de (fromX, fromY).
    thought(cx, cy, rx, ry, fromX, fromY, color = INK.black) {
      const dx = cx - rx - fromX, dy = cy - fromY;
      return [strokePath(circlePath(fromX + dx * 0.25, fromY + dy * 0.25, 9), color, 5),
        strokePath(circlePath(fromX + dx * 0.6, fromY + dy * 0.6 - 10, 14), color, 5),
        strokePath(cloudPath(cx, cy, rx, ry), color, 6)];
    },
    // Carimbo girado (caixa + texto). Retorna {box, text}.
    stamp(text, cx, cy, opts = {}) {
      const size = opts.size || 100, color = opts.color || INK.red, rot = opts.rot ?? -12;
      const g = group(null, `rotate(${rot} ${cx} ${cy})`);
      const w = measure(text, size) + 60, h = size * 1.5;
      return {
        box: strokePath(roughRect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), color, 9, g),
        text: textStrokes(text, cx, cy + size * 0.33, size, color, g, 'middle').strokes,
      };
    },
    // Urna simples (escala s, canto superior esquerdo aproximado em x,y). Retorna {group, strokes}.
    ballotBox(x, y, s = 1, opts = {}) {
      const g = group(null, `translate(${x - 330 * s} ${y - 640 * s}) scale(${s})`);
      const w = 8 / Math.max(s, 0.3);
      const strokes = [
        strokePath(roughRect(330, 820, 750, 1180), INK.black, w, g),
        strokePath('M 330 820 ' + roughSeg(330, 820, 420, 735) + ' ' + roughSeg(420, 735, 840, 735) + ' ' + roughSeg(840, 735, 750, 820), INK.black, w, g),
        strokePath('M 840 735 ' + roughSeg(840, 735, 840, 1095) + ' ' + roughSeg(840, 1095, 750, 1180), INK.black, w, g),
        strokePath(roughRect(505, 765, 665, 790), INK.black, w * 0.75, g),
      ];
      if (opts.ballot !== false) {
        strokes.push(strokePath('M 548 778 ' + roughSeg(548, 778, 560, 640) + ' ' + roughSeg(560, 640, 640, 648) + ' ' + roughSeg(640, 648, 626, 778), INK.blue, w * 0.75, g));
      }
      return { group: g, strokes };
    },
  };

  // ---------------- redes sociais ----------------
  function igIcon(x, y, S, parent, w) {
    const bg = mk('path', { d: roundRectPath(x, y, S, S, S * 0.28), fill: 'url(#igGrad)', 'fill-opacity': 0 }, parent);
    const outline = strokePath(roundRectPath(x, y, S, S, S * 0.28), '#c13584', w, parent);
    const rest = [
      strokePath(roundRectPath(x + S * 0.2, y + S * 0.2, S * 0.6, S * 0.6, S * 0.18), '#ffffff', w, parent),
      strokePath(circlePath(x + S / 2, y + S / 2, S * 0.14), '#ffffff', w, parent),
      strokePath(circlePath(x + S * 0.69, y + S * 0.31, S * 0.015), '#ffffff', w * 1.2, parent),
    ];
    return { bg, outline, rest };
  }
  function ttIcon(x, y, S, parent, w) {
    const bg = mk('path', { d: roundRectPath(x, y, S, S, S * 0.28), fill: '#111111', 'fill-opacity': 0 }, parent);
    const outline = strokePath(roundRectPath(x, y, S, S, S * 0.28), '#111111', w, parent);
    const note = (dx, dy, color) => {
      const X = (k) => (x + S * k + dx).toFixed(1), Y = (k) => (y + S * k + dy).toFixed(1), r = (S * 0.13).toFixed(1);
      return strokePath(`M ${X(0.76)} ${Y(0.37)} Q ${X(0.59)} ${Y(0.34)} ${X(0.56)} ${Y(0.18)} L ${X(0.56)} ${Y(0.66)} ` +
        `A ${r} ${r} 0 1 1 ${X(0.30)} ${Y(0.66)} A ${r} ${r} 0 1 1 ${X(0.56)} ${Y(0.66)}`, color, S * 0.085, parent);
    };
    return { bg, outline, rest: [note(-S * 0.03, -S * 0.02, '#25f4ee'), note(S * 0.03, S * 0.02, '#fe2c55'), note(0, 0, '#ffffff')] };
  }
  const marca = projeto.marca || {};
  const redes = [
    marca.instagram && { nome: 'Instagram', handle: '@' + marca.instagram.replace(/^@/, ''), icon: igIcon },
    marca.tiktok && { nome: 'TikTok', handle: '@' + marca.tiktok.replace(/^@/, ''), icon: ttIcon },
  ].filter(Boolean);
  let watermarkHideAt = Infinity;
  // Chamada para ação: "Gostou? Me segue!" + ícones desenhados + @. y = topo do bloco.
  function ctaRedes(scene, f0, f1, opts = {}) {
    if (!redes.length) return;
    const y0 = opts.y ?? 780, S = opts.iconSize || 190;
    watermarkHideAt = Math.min(watermarkHideAt, at(scene, f0));
    const titulo = opts.titulo ?? 'Gostou? Me segue!';
    const slots = titulo ? 1 + redes.length * 2 : redes.length * 2;
    const step = (f1 - f0) / slots; let f = f0;
    if (titulo) { write(scene, f, f + step, titulo, 540, y0 + 80, 96, opts.cor || INK.green, { anchor: 'middle' }); f += step; }
    redes.forEach((r, i) => {
      const y = y0 + (titulo ? 180 : 0) + i * (S + 90);
      const ic = r.icon(150, y, S, null, 12);
      draw(scene, f, f + step * 0.55, ic.outline);
      fillAfter(ic.bg, ic.outline);
      draw(scene, f + step * 0.55, f + step, ic.rest);
      f += step;
      draw(scene, f, f + step, [
        textStrokes(r.nome, 385, y + S * 0.3, 50, INK.gray).strokes,
        textStrokes(r.handle, 380, y + S * 0.79, 84, INK.black).strokes,
      ]);
      f += step;
    });
  }
  // Marca d'água fixa no rodapé (some quando ctaRedes começa).
  if (redes.length && projeto.marcaDagua !== false) {
    const S = 42, fs = 36, y = 1856, gap = 44;
    const widths = redes.map(r => measure(r.handle, fs));
    const total = redes.reduce((a, r, i) => a + S + 12 + widths[i], 0) + gap * (redes.length - 1);
    let x = 540 - total / 2;
    mk('rect', {
      x: x - 22, y: y - 10, width: total + 44, height: S + 20, rx: (S + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.9, stroke: '#1f1f24', 'stroke-opacity': 0.25, 'stroke-width': 2,
    }, watermark);
    redes.forEach((r, i) => {
      const ic = r.icon(x, y, S, watermark, 4);
      ic.bg.setAttribute('fill-opacity', 1); showNow([ic.outline, ic.rest]);
      x += S + 12;
      showNow(textStrokes(r.handle, x, y + S * 0.78, fs, INK.black, watermark).strokes);
      x += widths[i] + gap;
    });
    effect((t) => watermark.setAttribute('opacity',
      (clamp((t - 0.4) / 0.6) * (1 - clamp((t - watermarkHideAt) / 0.5))).toFixed(3)));
  }

  // ---------------- cenas do projeto ----------------
  const WB = {
    W, H, INK, REST, font, projeto, timeline, scenes, clamp, ease, lerp, rand, jit,
    at, draw, write, writeLines, effect, handFollow, restHand, moveGroup, fade, transform, fillAfter, newPage,
    strokePath, textStrokes, measure, wrap, showNow, mk, group,
    get layer() { return inkLayer; },
    roughSeg, roughLine, roughRect, zigzagHatch, dashedLine, wavyLine, loopEllipse, arrowHead,
    arcPath, circlePath, roundRectPath, cloudPath, C, igIcon, ttIcon, ctaRedes,
  };
  if (typeof window.CENAS !== 'function') throw new Error('cenas.js precisa definir window.CENAS = function (WB) {...}');
  window.CENAS(WB);

  handSegs.sort((a, b) => a.t0 - b.t0);
  const allStrokes = drawItems.flatMap(d => d.strokes);

  // ---------------- posição da mão (função de t) ----------------
  function handState(t) {
    let prev = null, next = null;
    for (const s of handSegs) {
      if (t >= s.t0 && t <= s.t1) return { p: s.pos(t), drawing: s.drawing, color: s.color };
      if (s.t1 < t && (!prev || s.t1 > prev.t1)) prev = s;
      if (s.t0 > t && !next) next = s;
    }
    const P = prev ? prev.pos(prev.t1) : REST, tp = prev ? prev.t1 : 0;
    const N = next ? next.pos(next.t0) : REST, tn = next ? next.t0 : Infinity;
    const color = (prev || next || { color: INK.black }).color;
    const MOVE = 0.6;
    if (!next) return { p: lerpP(P, REST, ease(clamp((t - tp) / 0.8))), drawing: false, color };
    const gap = tn - tp;
    if (gap <= 1.5) {
      const u = ease(clamp((t - tp) / gap)), p = lerpP(P, N, u);
      p.y -= Math.sin(Math.PI * u) * Math.min(40, gap * 40);
      return { p, drawing: false, color };
    }
    if (t < tp + MOVE) return { p: lerpP(P, REST, ease((t - tp) / MOVE)), drawing: false, color };
    if (t > tn - MOVE) return { p: lerpP(REST, N, ease((t - (tn - MOVE)) / MOVE)), drawing: false, color };
    return { p: { x: REST.x + Math.sin(t * 0.9) * 6, y: REST.y + Math.sin(t * 1.3) * 4 }, drawing: false, color };
  }

  window.seekToTime = function (t) {
    for (const s of allStrokes) {
      const u = t <= s.t0 ? 0 : t >= s.t1 ? 1 : (t - s.t0) / (s.t1 - s.t0);
      s.el.style.strokeDashoffset = ((s.len + 6) * (1 - u)).toFixed(2);
      s.el.style.visibility = u > 0 ? 'visible' : 'hidden';
      if (s.fillEl) s.fillEl.setAttribute('fill-opacity', clamp((t - s.t1 + 0.05) / 0.3).toFixed(3));
    }
    for (const fx of effects) fx(t);
    const st = handState(t);
    let { x, y } = st.p;
    if (st.drawing) {
      x += Math.sin(t * 37.0) * 1.4 + Math.sin(t * 13.3) * 1.0;
      y += Math.cos(t * 29.0) * 1.4 + Math.sin(t * 17.7) * 0.9;
    }
    const rot = -30 + Math.sin(t * 1.7) * 2.2 + (x - 540) * 0.006;
    hand.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    handRot.setAttribute('transform', `rotate(${rot.toFixed(2)})`);
    for (const el of tintEls) el.setAttribute('fill', st.color);
  };
  window.TOTAL = timeline.total;
  window.seekToTime(0);
  window.__ready = true;

  // Pré-visualização: index.html?play (clique para tocar com o áudio).
  if (location.search.includes('play')) {
    const audio = new Audio('narration.mp3');
    document.body.addEventListener('click', () => {
      audio.currentTime = 0; audio.play();
      const loop = () => { window.seekToTime(audio.currentTime); if (!audio.ended) requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }, { once: true });
  }
})().catch((e) => { window.__error = String(e && e.stack || e); console.error(e); });
