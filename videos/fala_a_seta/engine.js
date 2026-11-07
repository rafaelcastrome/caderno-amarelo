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
  const REST = { x: 965, y: 1985 };    // mão "estacionada" no canto inferior direito

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
  <g id="overlay" filter="url(#marker)"></g>
  <rect width="${W}" height="${H}" filter="url(#paperNoise)" opacity="0.35"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <g id="watermark" opacity="0"></g>
  <!-- Mão ✍🏻: arte do Twemoji (CC-BY 4.0, https://github.com/jdecked/twemoji), lápis recolorido e antebraço acrescentado.
       A ponta do lápis fica na origem (0,0). -->
  <g id="hand"><g id="handRot" filter="url(#handShadow)"><g transform="scale(11) translate(-1.423 -35.238)">
  <g class="emoji-hand"><polygon points="33.060,18.420 146.200,100.900 134.800,116.100 23.940,30.580" fill="#F7DECE"/><polygon points="27.400,29.300 136.900,113.300 134.800,116.100 25.660,31.620" fill="#E0AA94" opacity="0.55"/><polygon points="45.900,26.300 147.100,99.700 133.900,117.300 35.100,40.700" fill="#3567a0"/><polygon points="45.900,26.300 48.760,28.320 37.840,42.880 35.100,40.700" fill="#25507d"/><path fill="#E0AA94" d="M6.203 21.641c-.078.922.321 1.198.946 1.636.618.433 4.383-2.867 5.614-3.369 1.231-.502 12.787-2.949 12.286-5.183-.501-2.234-3.993-2.564-6.683-2.108-2.69.456-7.838 2.822-9.342 4.099-1.504 1.276-2.821 4.925-2.821 4.925zm8.622 1.497s-3.557 1.155-3.557 4.155.866 4.692 1.276 5.513c.411.82 1.688 1.616 3.455.851 2.052-.889-.491-6.004 6-3.656 2.974 1.075 6.059 2.528 9.059 1.528C33.904 30.58 35 27 35 25c0-4.094-3-3-4-2s-9 3-10 3-6.175-2.862-6.175-2.862z"/><path fill="#EEC2AD" d="M19.312 28.188s-.12-1.316-1.375-1.469c-1.031-.125-2.656.219-3.5 1.906-.844 1.688-2.344 1.406-2.281 2.812.062 1.406.5 2.5 1.406 2.781.907.282 2.188-.218 2.344-1.718.156-1.5.344-2.875 1.312-3.469.97-.593 2.094-.843 2.094-.843z"/><path fill="#E0AA94" d="M18 26s-1-1-3-1-6.664 2.133-5.25 6.375c1 3 3.844 1.594 4.25-1.375.407-2.973 4-4 4-4z"/><path fill="#EEC2AD" d="M17 26s-1-1-3-1-4.885 1.53-5 6c-.094 3.656 4.031 2 4-1-.031-3 4-4 4-4z"/><path fill="#E0AA94" d="M5 27c0 3.297.457 5.286 2.428 4.947 3.269-.562 2.028-4.614 4.889-5.754 2.077-.827 5.101-.63 8.02 1.103C22.26 28.438 21 24 19 23s-8 0-9 0-5 4-5 4z"/><path fill="#EEC2AD" d="M4.842 27.174C3.251 29.839 4.219 32.594 7 32c2.691-.574 1.343-4.07 4-6 1.489-1.082 4.698-1.445 6.698-.445S20 24 18 23s-8.54-.025-9.538.037c-1.909.119-3.62 4.137-3.62 4.137z"/><path fill="#f5c518" d="M9.418 29.114c-.679.778-1.86.859-2.639.18l-.196-.171c-.779-.679-.859-1.859-.18-2.638L28.926.668c.679-.778 1.86-.859 2.639-.18l.195.171c.779.679.859 1.86.181 2.638L9.418 29.114z"/><path fill="#f5c518" d="M10.49 27.886c-2.36 2.705-8.313 8.009-9.067 7.352-.753-.657 3.693-7.275 6.053-9.981 2.36-2.706 1.661-.542 2.493.185.832.726 2.881-.26.521 2.444z"/><polygon points="1.423,35.238 5.190,32.946 3.149,31.180" fill="#f2d3a6"/><polygon class="ink-tint" points="1.423,35.238 2.782,34.431 2.026,33.777" fill="#1f1f24"/><path fill="#E0AA94" d="M6.672 25.026c0 1 2.421 1.915 3.421.915s3.341-2.228 6.419-.941C23.716 28.01 21 24 18 23s-8 0-9 0-2.328 2.026-2.328 2.026z"/><path fill="#F7DECE" d="M6.195 22.043c-.358-1.113 2.188-7.279 3.341-8.234 1.452-1.202 7.069-3.063 9.069-3.063S35 18 35 23s-2 5.625-4.875 6.406c-2.299.625-7.115.242-9.219-1.719C19.062 25.969 17.781 24.781 16 24c-3.302-1.448-5.503.424-6.503 1.424-2 2-5.768-.159-2.625-3.58C9.121 19.395 11.102 18.632 13 18c6-2 10-2 8-4-.707-.707-1.092.346-2.076.525-1.98.36-3.556.602-6.165 1.472-.902.3-5.172 3.023-6.564 6.046z"/><path fill="#E0AA94" d="M13.196 16.275c1.064-.388 5.702-1.232 8.115-2.068 1.949-.676 3.659.636-.04 2.028-3.57 1.343-7.279 1.233-9.984 2.307-1.023.406-1.91-.875 1.909-2.267z"/><path fill="#f5c518" d="M22.487 8.023s-5.928 6.795-8.446 9.661c2.254-.926 4.271-.75 6.198-1.884 1.927-1.133 2.806-2.342 5.73-5.695 1.086-1.244-3.482-2.082-3.482-2.082z"/></g>
  </g></g></g>`;
  const pagesRoot = svg.querySelector('#pages');
  const hand = svg.querySelector('#hand');
  const handRot = svg.querySelector('#handRot');
  const tintEls = [...svg.querySelectorAll('.ink-tint')];
  const watermark = svg.querySelector('#watermark');
  const overlay = svg.querySelector('#overlay');   // camada fixa: não vira junto com a folha

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
  // Ícone neutro da marca: caderninho amarelo (sem logo de nenhuma plataforma).
  function notebookIcon(x, y, S, parent, w) {
    const r = S * 0.12, bx = x + S * 0.12, bw = S * 0.78;
    const bg = mk('path', { d: roundRectPath(bx, y, bw, S, r), fill: '#ffd23f', 'fill-opacity': 0 }, parent);
    const outline = strokePath(roundRectPath(bx, y, bw, S, r), INK.black, w, parent);
    const rest = [];
    for (let i = 0; i < 4; i++) {
      const yy = y + S * (0.14 + i * 0.22);
      rest.push(strokePath(`M ${bx + S * 0.08} ${yy} Q ${x} ${yy} ${x} ${yy + S * 0.06} Q ${x} ${yy + S * 0.12} ${bx + S * 0.1} ${yy + S * 0.12}`, INK.black, w * 0.8, parent));
    }
    rest.push(strokePath(`M ${bx + bw * 0.72} ${y} L ${bx + bw * 0.72} ${y + S * 0.3} L ${bx + bw * 0.8} ${y + S * 0.24} L ${bx + bw * 0.88} ${y + S * 0.3} L ${bx + bw * 0.88} ${y}`, INK.red, w * 0.8, parent));
    return { bg, outline, rest };
  }
  // IMPORTANTE: por padrão NÃO mostramos logos de plataformas (Instagram/TikTok). O TikTok trata
  // logo/marca d'água de outra rede como conteúdo reaproveitado e tira o vídeo do "Para Você".
  // Só o @ (sem repetir quando é igual nas redes) com o caderninho da marca. marca.logos=true reativa os ícones.
  const marca = projeto.marca || {};
  const norm = (h) => '@' + String(h).replace(/^@/, '');
  const redes = marca.logos === true ? [
    marca.instagram && { nome: 'Instagram', handle: norm(marca.instagram), icon: igIcon },
    marca.tiktok && { nome: 'TikTok', handle: norm(marca.tiktok), icon: ttIcon },
  ].filter(Boolean) : [...new Set([marca.handle, marca.instagram, marca.tiktok].filter(Boolean).map(norm))]
    .map(h => ({ nome: marca.nome || '', handle: h, icon: notebookIcon }));
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
        r.nome ? textStrokes(r.nome, 385, y + S * 0.3, 50, INK.gray).strokes : [],
        textStrokes(r.handle, 380, y + (r.nome ? S * 0.79 : S * 0.62), 84, INK.black).strokes,
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
    overlay,
    roughSeg, roughLine, roughRect, zigzagHatch, dashedLine, wavyLine, loopEllipse, arrowHead,
    arcPath, circlePath, roundRectPath, cloudPath, C, igIcon, ttIcon, notebookIcon, ctaRedes,
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
    const rot = 15 + Math.sin(t * 1.7) * 2.2 + (x - 540) * 0.004;
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
