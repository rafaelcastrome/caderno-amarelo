/* Natal de Papel (natal.html). Gerado a partir de natal/src: base e música, arte, fundo, cena e app. */
'use strict';
/* ============ Configuração (muda aqui) ============ */
const CONFIG = {
  marca: 'Natal de Papel',
  perfil: '@caRdeno_Amarelo',
  site: 'cardenoamarelo.netlify.app/natal', // endereço que aparece na marca d'água e no compartilhar
  premium: false,                            // fase 2: Pix libera vídeo sem marca d'água
  bpm: 130,
};

/* ============ Base ============ */
const W = 720, H = 1280;
const B_INTRO = 4, B_REFRAO = 64, B_FIM = 6;
const B_TOTAL = B_INTRO + B_REFRAO + B_FIM;        // 74 tempos
const SPB = 60 / CONFIG.bpm;                       // segundos por tempo
const DURACAO = B_TOTAL * SPB;                     // ~34 s
const QPS = 15;                                    // stop-motion: 15 poses por segundo
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const elastico = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 9 - .75) * 2 * Math.PI / 3) + 1);
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ============ Música: "Jingle Bells" (domínio público, 1857) no batidão de funk, sintetizada aqui ============ */
const Musica = (() => {
  let ctx = null, master = null, dest = null, ruido = null, revIn = null, satura = null;
  let timer = null, eventos = [], idx = 0, t0 = 0, tocando = false, aoFim = null;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 5; comp.attack.value = .003; comp.release.value = .18;
    master = ctx.createGain(); master.gain.value = .85;
    master.connect(comp); comp.connect(ctx.destination);
    if (ctx.createMediaStreamDestination) { dest = ctx.createMediaStreamDestination(); comp.connect(dest); }
    ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const len = Math.floor(ctx.sampleRate * .9), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const b = ir.getChannelData(ch); for (let i = 0; i < len; i++) b[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    const rev = ctx.createConvolver(); rev.buffer = ir;
    revIn = ctx.createGain(); revIn.gain.value = .14; revIn.connect(rev); rev.connect(master);
    // saturação do grave: o 808 ganha harmônico e aparece até em caixinha de celular
    const curva = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; curva[i] = Math.tanh(x * 3.2); }
    satura = ctx.createWaveShaper(); satura.curve = curva; satura.oversample = '2x';
    const sg = ctx.createGain(); sg.gain.value = .75; satura.connect(sg); sg.connect(master);
    return ctx;
  }
  function ruidoFonte(t, dur) { const n = ctx.createBufferSource(); n.buffer = ruido; n.start(t, Math.random() * .5, dur); return n; }
  function filtro(tipo, f, q = .7) { const b = ctx.createBiquadFilter(); b.type = tipo; b.frequency.value = f; b.Q.value = q; return b; }

  function grave808(t, m, vel, dur = .5) {         // bumbo 808 afinado na nota do acorde
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(hz(m) * 3, t); o.frequency.exponentialRampToValueAtTime(hz(m), t + .06);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + .003);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(satura); o.start(t); o.stop(t + dur + .05);
    const n = ruidoFonte(t, .02), f = filtro('highpass', 1800), ng = ctx.createGain();
    ng.gain.setValueAtTime(vel * .35, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .015);
    n.connect(f); f.connect(ng); ng.connect(master);
  }
  function palma(t, vel) {
    const f = filtro('bandpass', 1500, .9), g = ctx.createGain(); f.connect(g); g.connect(master); g.connect(revIn);
    g.gain.setValueAtTime(0, t);
    [0, .011, .022].forEach((d, k) => { g.gain.setValueAtTime(vel * (k === 2 ? 1 : .7), t + d); g.gain.exponentialRampToValueAtTime(vel * .2, t + d + .009); });
    g.gain.exponentialRampToValueAtTime(.0001, t + .16);
    const n = ruidoFonte(t, .2); n.connect(f);
  }
  function chimbal(t, vel) {
    const n = ruidoFonte(t, .05), f = filtro('highpass', 7200), g = ctx.createGain();
    g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(.0001, t + .035);
    n.connect(f); f.connect(g); g.connect(master);
  }
  function tambor(t, vel, alto) {                   // atabaque do tamborzão
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(alto ? 240 : 170, t); o.frequency.exponentialRampToValueAtTime(alto ? 175 : 118, t + .09);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + .003); g.gain.exponentialRampToValueAtTime(.0001, t + .2);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + .25);
    const n = ruidoFonte(t, .04), f = filtro('bandpass', 900, 1.4), ng = ctx.createGain();
    ng.gain.setValueAtTime(vel * .6, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .03);
    n.connect(f); f.connect(ng); ng.connect(master);
  }
  function apito(t, dur, vel) {                     // apito do baile: trinado
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 2950;
    const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 27;
    const lg = ctx.createGain(); lg.gain.value = 170; lfo.connect(lg); lg.connect(o.frequency);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + .012);
    g.gain.setValueAtTime(vel, t + dur - .04); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(master); g.connect(revIn);
    o.start(t); lfo.start(t); o.stop(t + dur + .02); lfo.stop(t + dur + .02);
  }
  function lead(m, t, dur, vel) {                   // sintetizador da melodia
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 2;
    f.frequency.setValueAtTime(3800, t); f.frequency.exponentialRampToValueAtTime(1300, t + .16);
    const g = ctx.createGain(); f.connect(g); g.connect(master); g.connect(revIn);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + .004);
    g.gain.exponentialRampToValueAtTime(vel * .55, t + .12); g.gain.setValueAtTime(vel * .55, t + Math.max(.13, dur - .05));
    g.gain.exponentialRampToValueAtTime(.0001, t + dur + .08);
    [-6, 6].forEach((c) => { const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = hz(m); o.detune.value = c; o.connect(f); o.start(t); o.stop(t + dur + .12); });
  }
  function sino(m, t, vel) {                        // brilho de Natal dobrando a melodia
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .7);
    g.connect(master); g.connect(revIn);
    [[1, 1], [2.76, .35], [5.4, .12]].forEach(([k, a]) => { const o = ctx.createOscillator(); o.frequency.value = hz(m + 12) * k; const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(g); o.start(t); o.stop(t + .75); });
  }
  function acorde(notas, t, vel) {
    const f = filtro('lowpass', 1900), g = ctx.createGain(); f.connect(g); g.connect(master); g.connect(revIn);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + .16);
    notas.forEach((m) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.connect(f); o.start(t); o.stop(t + .2); });
  }
  function guizo(t, vel) {
    for (let k = 0; k < 3; k++) {
      const tt = t + k * .012, n = ruidoFonte(tt, .1), f = filtro('bandpass', 7200, 2.5), g = ctx.createGain();
      g.gain.setValueAtTime(vel * (1 - k * .25), tt); g.gain.exponentialRampToValueAtTime(.0001, tt + .09);
      n.connect(f); f.connect(g); g.connect(master);
    }
  }

  // Refrão: [nota MIDI, início em tempos, duração em tempos]. Dó maior.
  const MELODIA = [[76,0,1],[76,1,1],[76,2,2],[76,4,1],[76,5,1],[76,6,2],[76,8,1],[79,9,1],[72,10,1.5],[74,11.5,.5],[76,12,4],
    [77,16,1],[77,17,1],[77,18,1.5],[77,19.5,.5],[77,20,1],[76,21,1],[76,22,1],[76,23,.5],[76,23.5,.5],[76,24,1],[74,25,1],[74,26,1],[76,27,1],[74,28,2],[79,30,2],
    [76,32,1],[76,33,1],[76,34,2],[76,36,1],[76,37,1],[76,38,2],[76,40,1],[79,41,1],[72,42,1.5],[74,43.5,.5],[76,44,4],
    [77,48,1],[77,49,1],[77,50,1.5],[77,51.5,.5],[77,52,1],[76,53,1],[76,54,1],[76,55,.5],[76,55.5,.5],[79,56,1],[79,57,1],[77,58,1],[74,59,1],[72,60,4]];
  const ACORDES = ['C','C','C','C7','F','C','D7','G7','C','C','C','C7','F','C','G7','C'];
  const VOZES = { C:[60,64,67], C7:[58,64,67], F:[60,65,69], D7:[60,62,66], G7:[59,62,65] };
  const GRAVE = { C:36, C7:36, F:41, D7:38, G7:43 };
  // batidão (16 semicolcheias por compasso): grave em 3-3-2-3-3-2, palma no 2 e no 4
  const BUMBO = [[0, 1], [3, .8], [6, .85], [8, .95], [11, .8], [14, .85]];

  function montar() {
    const E = [], add = (b, fn) => E.push({ b, fn }), FIM = B_INTRO + B_REFRAO;
    for (let bar = 0; bar < FIM / 4; bar++) {
      const b0 = bar * 4, ac = bar === 0 ? 'C' : ACORDES[bar - 1], rz = GRAVE[ac];
      BUMBO.forEach(([s, v]) => add(b0 + s / 4, (t) => grave808(t, rz, .9 * v, s === 14 ? .3 : .45)));
      [4, 12].forEach((s) => add(b0 + s / 4, (t) => { palma(t, .55); if (bar) acorde(VOZES[ac], t, .05); }));
      [2, 6, 10, 14].forEach((s) => add(b0 + s / 4, (t) => chimbal(t, .14)));
      add(b0 + 7 / 4, (t) => tambor(t, .5, true)); add(b0 + 15 / 4, (t) => tambor(t, .55, false));
      if (bar > 0) for (let k = 0; k < 4; k++) add(b0 + k, (t) => guizo(t, k % 2 ? .13 : .08));
    }
    [12, 13, 14, 15].forEach((s) => add(s / 4, (t) => tambor(t, .45, s % 2 === 0)));   // virada do começo
    add(0, (t) => { apito(t, .22, .1); apito(t + .3, .32, .11); });
    [16, 32, 48].forEach((b) => add(B_INTRO + b, (t) => apito(t, .28, .09)));
    MELODIA.forEach(([m, s, d]) => add(B_INTRO + s, (t) => { lead(m, t, d * SPB * .9, .1); sino(m, t, .05); }));
    add(FIM, (t) => { grave808(t, 36, 1, 1.1); palma(t, .6); acorde([60, 64, 67, 72], t, .09); sino(72, t, .08); apito(t + .05, .6, .1); });
    return E.sort((x, y) => x.b - y.b);
  }

  function tick() {
    if (!tocando) return;
    const lim = ctx.currentTime + .25;
    while (idx < eventos.length) {
      const e = eventos[idx], te = t0 + e.b * SPB;
      if (te > lim) break;
      if (te >= ctx.currentTime - .05) e.fn(Math.max(te, ctx.currentTime));
      idx++;
    }
    if (ctx.currentTime > t0 + DURACAO + .25) { const f = aoFim; parar(); f && f(); }
  }
  async function tocar(opts = {}) {
    init();
    if (ctx.state !== 'running') { try { await ctx.resume(); } catch (e) { /* segue */ } }
    parar(); master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(.85, ctx.currentTime);
    eventos = montar(); idx = 0; t0 = ctx.currentTime + .15; tocando = true; aoFim = opts.aoFim || null;
    timer = setInterval(tick, 40); tick();
  }
  function parar(silenciar) {
    tocando = false; clearInterval(timer); timer = null;
    if (silenciar && ctx) master.gain.setTargetAtTime(0, ctx.currentTime, .02);
  }
  function tempo() { return tocando ? (ctx.currentTime - t0) / SPB : null; }
  return { init, tocar, parar, tempo, get stream() { return dest ? dest.stream : null; }, get ctx() { return ctx; }, get tocando() { return tocando; } };
})();
/* ============ Arte de papel: recortes com borda clara, grão e sombra ============ */
const Arte = (() => {
  const RS = 1.6;                    // resolução dos recortes (escala sem borrar)
  const SDX = 7, SDY = 10, SOMBRA = .40;
  const VERSO = '#f3e9d2';           // costas do papel (aparece no giro)
  const R = 84, RB = 7;              // raio do rosto e borda branca do recorte
  let grao = null, BW = 5, BCOR = '#fff7e6';

  function texturaGrao() {
    const c = mk(256, 256), g = c.getContext('2d'), r = mulberry32(7), img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) { const v = r() < .5 ? 30 : 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = Math.floor(r() * 16); }
    g.putImageData(img, 0, 0);
    g.strokeStyle = 'rgba(110,80,40,.06)'; g.lineWidth = 1;
    for (let k = 0; k < 70; k++) { const x = r() * 256, y = r() * 256, a = r() * Math.PI; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16); g.stroke(); }
    return c;
  }
  function aplicarGrao(g, w, h, forca = 1) {
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = forca;
    g.fillStyle = g.createPattern(grao, 'repeat'); g.fillRect(0, 0, w, h); g.restore();
  }
  function sombraDe(c) {
    const pad = 24, s = mk(c.width + pad * 2, c.height + pad * 2), g = s.getContext('2d'), off = s.width + 60;
    g.shadowColor = 'rgba(35,22,6,1)'; g.shadowBlur = 9 * RS * .8; g.shadowOffsetX = off;
    g.drawImage(c, pad - off, pad);
    return { c: s, pad };
  }
  // desenho(g, modo): 'borda' faz a silhueta clara (o miolo branco do papel cortado), 'cor' pinta por cima
  function recorte(x0, y0, x1, y1, desenho, o = {}) {
    const bw = o.bordaW ?? 5, pad = bw + 4;
    const c = mk((x1 - x0 + pad * 2) * RS, (y1 - y0 + pad * 2) * RS), g = c.getContext('2d');
    g.setTransform(RS, 0, 0, RS, (pad - x0) * RS, (pad - y0) * RS);
    BW = bw; BCOR = o.borda || '#fff7e6';
    if (bw > 0) desenho(g, 'borda');
    desenho(g, 'cor');
    aplicarGrao(g, c.width, c.height, o.grao ?? 1);
    const s = sombraDe(c);
    return { c, s: s.c, ox: (pad - x0) * RS, oy: (pad - y0) * RS, sp: s.pad };
  }
  // desenha um recorte na origem atual, com a sombra deslocada no espaço do mundo
  function peca(ctx, sp, base = 1, alfa = 1) {
    const m = ctx.getTransform();
    ctx.setTransform(m.a, m.b, m.c, m.d, m.e + SDX * base, m.f + SDY * base);
    ctx.globalAlpha = SOMBRA * alfa;
    ctx.drawImage(sp.s, -(sp.ox + sp.sp) / RS, -(sp.oy + sp.sp) / RS, sp.s.width / RS, sp.s.height / RS);
    ctx.setTransform(m); ctx.globalAlpha = alfa;
    ctx.drawImage(sp.c, -sp.ox / RS, -sp.oy / RS, sp.c.width / RS, sp.c.height / RS);
    ctx.globalAlpha = 1;
  }
  function forma(g, modo, path, cor) {
    g.beginPath(); path(g);
    if (modo === 'borda') { g.lineJoin = 'round'; g.lineWidth = BW * 2; g.strokeStyle = BCOR; g.stroke(); g.fillStyle = BCOR; g.fill(); }
    else { g.fillStyle = cor; g.fill(); }
  }
  function rr(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function capsula(g, x1, y1, x2, y2, r) {
    const a = Math.atan2(y2 - y1, x2 - x1), p = Math.PI / 2;
    g.moveTo(x1 + Math.cos(a + p) * r, y1 + Math.sin(a + p) * r);
    g.arc(x2, y2, r, a + p, a - p, true); g.arc(x1, y1, r, a - p, a + p, true); g.closePath();
  }
  function estrela(g, x, y, re, ri, n = 5, rot = -Math.PI / 2) {
    for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : re, a = rot + i * Math.PI / n, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.closePath();
  }
  function rebite(g, x, y, r = 5) {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = '#b8901c'; g.fill();
    g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .42, 0, Math.PI * 2); g.fillStyle = '#f5e08a'; g.fill();
  }
  function costura(g, path, cor = 'rgba(255,255,255,.5)') {
    g.save(); g.setLineDash([6, 5]); g.strokeStyle = cor; g.lineWidth = 2; g.beginPath(); path(g); g.stroke(); g.restore();
  }

  const ROUPAS = [
    { nome: 'Papai Noel', casaco: '#c8102e', calca: '#a10d24', bota: '#2b2320', luva: '#fffaf0', pelo: '#fffaf0', gorro: '#c8102e', cinto: true },
    { nome: 'Duende', casaco: '#1f7a4c', calca: 'listra', bota: '#1f7a4c', luva: '#c8102e', pelo: '#f6d047', gorro: '#1f7a4c', botoes: true },
    { nome: 'Amarelinho', casaco: '#f2b705', calca: '#2f5d8a', bota: '#6b3e26', luva: '#fffaf0', pelo: '#fffaf0', gorro: '#c8102e', botoes: true },
    { nome: 'Rena', casaco: '#8a5a3b', calca: '#5e3b26', bota: '#2b2320', luva: '#fffaf0', pelo: '#e9d3b4', chifre: true },
  ];

  const pTorso = (g) => { g.moveTo(-58, 6); g.lineTo(-48, -130); g.quadraticCurveTo(-46, -150, -28, -152); g.lineTo(28, -152); g.quadraticCurveTo(46, -150, 48, -130); g.lineTo(58, 6); g.quadraticCurveTo(0, 18, -58, 6); g.closePath(); };
  function torso(r, verso) {
    return recorte(-72, -172, 72, 26, (g, m) => {
      forma(g, m, pTorso, verso ? VERSO : r.casaco);
      if (verso) { if (m === 'cor') costura(g, (g) => { g.moveTo(-30, -60); g.lineTo(30, -60); }, 'rgba(120,100,70,.25)'); return; }
      if (m === 'cor') {
        g.save(); g.beginPath(); pTorso(g); g.clip();
        if (r.cinto) {
          g.fillStyle = r.pelo; g.beginPath(); rr(g, -11, -146, 22, 140, 6); g.fill();
          g.fillStyle = '#2b2320'; g.fillRect(-70, -70, 140, 20);
          g.fillStyle = '#e0b52b'; g.beginPath(); rr(g, -17, -75, 34, 30, 4); g.fill();
          g.fillStyle = '#2b2320'; g.beginPath(); rr(g, -9, -67, 18, 14, 2); g.fill();
        }
        if (r.botoes) { g.fillStyle = '#e0b52b'; [-112, -84, -56].forEach((y) => { g.beginPath(); g.arc(0, y, 7, 0, Math.PI * 2); g.fill(); }); }
        if (r.chifre) { g.fillStyle = r.pelo; g.beginPath(); g.ellipse(0, -62, 34, 46, 0, 0, Math.PI * 2); g.fill(); }
        costura(g, (g) => { g.moveTo(-50, -10); g.lineTo(-41, -126); g.moveTo(50, -10); g.lineTo(41, -126); });
        g.restore();
      }
      forma(g, m, (g) => g.ellipse(0, -148, 44, 15, 0, 0, Math.PI * 2), r.pelo);
      forma(g, m, (g) => rr(g, -64, -10, 128, 26, 13), r.pelo);
    });
  }
  function perna(r, verso) {
    return recorte(-32, -16, 56, 144, (g, m) => {
      const listra = r.calca === 'listra';
      forma(g, m, (g) => rr(g, -16, -10, 32, 114, 14), verso ? VERSO : (listra ? '#fffaf0' : r.calca));
      if (m === 'cor' && !verso && listra) { g.save(); g.beginPath(); rr(g, -16, -10, 32, 114, 14); g.clip(); g.fillStyle = '#c8102e'; for (let y = -6; y < 104; y += 22) g.fillRect(-20, y, 40, 11); g.restore(); }
      forma(g, m, (g) => { g.moveTo(-19, 96); g.lineTo(19, 96); g.lineTo(19, 106); g.quadraticCurveTo(46, 106, 48, 124); g.quadraticCurveTo(48, 136, 32, 136); g.lineTo(-20, 136); g.quadraticCurveTo(-25, 136, -25, 124); g.closePath(); }, verso ? VERSO : r.bota);
      if (!verso) forma(g, m, (g) => rr(g, -22, 88, 44, 15, 7), r.pelo);
      if (m === 'cor') rebite(g, 0, 0, 5);
    });
  }
  function braco(r, verso) {
    return recorte(-34, -18, 26, 140, (g, m) => {
      forma(g, m, (g) => rr(g, -15, -12, 30, 98, 14), verso ? VERSO : r.casaco);
      if (!verso) forma(g, m, (g) => rr(g, -18, 72, 36, 16, 8), r.pelo);
      // luva: palma arredondada, 4 dedos de tamanhos diferentes e polegar (lado do corpo)
      forma(g, m, (g) => {
        g.ellipse(0, 101, 16, 17, 0, 0, Math.PI * 2);
        capsula(g, -10.5, 108, -10.5, 124, 4.3);
        capsula(g, -3.5, 109, -3.5, 129, 4.3);
        capsula(g, 3.5, 109, 3.5, 127, 4.3);
        capsula(g, 10.5, 107, 10.5, 120, 4);
        capsula(g, -12, 96, -24, 110, 5);
      }, verso ? VERSO : r.luva);
      if (m === 'cor') {
        g.strokeStyle = 'rgba(60,40,20,.22)'; g.lineWidth = 1.4; g.beginPath();
        [-7, 0, 7].forEach((x) => { g.moveTo(x, 113); g.lineTo(x, 124); });
        g.stroke(); rebite(g, 0, 0, 5);
      }
    });
  }
  function gorro(r, verso) {
    if (r.chifre) return chifres(verso);
    const top = -R - 4;
    return recorte(-88, top - 140, 94, top + 30, (g, m) => {
      forma(g, m, (g) => { g.moveTo(-66, top + 4); g.bezierCurveTo(-60, top - 70, 10, top - 128, 66, top - 112); g.bezierCurveTo(52, top - 82, 50, top - 40, 68, top + 4); g.closePath(); }, verso ? VERSO : r.gorro);
      forma(g, m, (g) => g.arc(66, top - 114, 18, 0, Math.PI * 2), verso ? VERSO : r.pelo);
      forma(g, m, (g) => rr(g, -80, top - 16, 160, 30, 15), verso ? VERSO : r.pelo);
      if (m === 'cor' && !verso) costura(g, (g) => { g.moveTo(-68, top - 1); g.lineTo(68, top - 1); }, 'rgba(120,100,70,.35)');
    });
  }
  function chifres(verso) {
    const top = -R + 2;
    return recorte(-112, top - 122, 112, top + 22, (g, m) => {
      const cor = verso ? VERSO : '#7a4a2a';
      [-1, 1].forEach((s) => forma(g, m, (g) => {
        capsula(g, s * 38, top + 4, s * 60, top - 70, 9); capsula(g, s * 50, top - 36, s * 86, top - 52, 7);
        capsula(g, s * 57, top - 62, s * 44, top - 104, 7); capsula(g, s * 58, top - 66, s * 92, top - 92, 6);
      }, cor));
      forma(g, m, (g) => { g.arc(0, 0, R + RB + 3, Math.PI * 1.17, Math.PI * 1.83); g.arc(0, 0, R + RB - 9, Math.PI * 1.83, Math.PI * 1.17, true); g.closePath(); }, verso ? VERSO : '#c8102e');
    });
  }
  const TONS = ['#f1c27d', '#c68642', '#e0ac69', '#8d5524'];
  const CABELOS = ['#4a2c1a', '#1f1410', '#7a4a22', '#1f1410'];
  function rostoPadrao(g, i) {
    g.fillStyle = TONS[i % 4]; g.fillRect(-R, -R, R * 2, R * 2);
    g.fillStyle = CABELOS[i % 4]; g.beginPath(); g.ellipse(0, -R * .78, R * 1.05, R * .55, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(214,80,80,.32)'; [-40, 40].forEach((x) => { g.beginPath(); g.arc(x, 22, 13, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#2b1a12'; [-27, 27].forEach((x) => { g.beginPath(); g.ellipse(x, -2, 7, 9.5, 0, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#fff'; [-25, 29].forEach((x) => { g.beginPath(); g.arc(x, -5, 2.6, 0, Math.PI * 2); g.fill(); });
    g.strokeStyle = '#5a2a1a'; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 12, 28, .18 * Math.PI, .82 * Math.PI); g.stroke();
    g.lineWidth = 4; [-1, 1].forEach((s) => { g.beginPath(); g.arc(s * 27, -18, 12, 1.2 * Math.PI, 1.8 * Math.PI); g.stroke(); });
  }
  function cabeca(rosto, i = 0) {
    return recorte(-R - RB, -R - RB, R + RB, R + RB, (g, m) => {
      forma(g, m, (g) => g.arc(0, 0, R + RB, 0, Math.PI * 2), '#fffaf0');
      if (m !== 'cor') return;
      g.save(); g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.clip();
      if (rosto) g.drawImage(rosto, -R, -R, R * 2, R * 2); else rostoPadrao(g, i);
      const vg = g.createRadialGradient(0, 0, R * .62, 0, 0, R);
      vg.addColorStop(0, 'rgba(60,30,10,0)'); vg.addColorStop(1, 'rgba(60,30,10,.22)');
      g.fillStyle = vg; g.fillRect(-R, -R, R * 2, R * 2); g.restore();
      g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.strokeStyle = 'rgba(60,40,20,.2)'; g.lineWidth = 1.5; g.stroke();
    }, { grao: rosto ? .55 : 1 });
  }
  function cabecaVerso() {
    return recorte(-R - RB, -R - RB, R + RB, R + RB, (g, m) => {
      forma(g, m, (g) => g.arc(0, 0, R + RB, 0, Math.PI * 2), VERSO);
      if (m === 'cor') costura(g, (g) => { g.moveTo(-30, 20); g.quadraticCurveTo(0, 34, 30, 20); }, 'rgba(120,100,70,.25)');
    });
  }
  const kits = [];
  function kit(i) {
    if (!kits[i]) {
      const r = ROUPAS[i];
      kits[i] = { torso: torso(r, false), torsoV: torso(r, true), perna: perna(r, false), pernaV: perna(r, true),
        braco: braco(r, false), bracoV: braco(r, true), gorro: gorro(r, false), gorroV: gorro(r, true) };
    }
    return kits[i];
  }
  function init() { grao = texturaGrao(); }
  return { init, RS, R, RB, VERSO, recorte, peca, forma, rr, capsula, estrela, rebite, costura, aplicarGrao, ROUPAS, kit, cabeca, cabecaVerso, grao: () => grao };
})();
/* ============ Fundo: diorama de papel em cima do bloco amarelo pautado ============ */
const Fundo = (() => {
  let fundo = null, luzes = null, etiqueta = null, faixa = null, marca = null;
  const fio = [], coco = [], estrelas = [];
  const LUZ = ['#ff4d4d', '#ffd23f', '#3bd16f', '#59a8ff'], LUZ_OFF = ['#7d2b2b', '#7a6620', '#22683b', '#2c517d'];
  const ENFEITES = [[590, 588, 0], [634, 642, 2], [598, 668, 3], [556, 740, 1], [652, 724, 0], [612, 780, 2], [536, 836, 3], [598, 850, 1], [684, 840, 2]];
  const yFio = (x) => 214 + 48 * (1 - Math.pow((x - 360) / 372, 2));

  function pecaFundo(g, path, cor, bw = 4) {
    g.beginPath(); path(g); g.lineJoin = 'round'; g.lineWidth = bw * 2; g.strokeStyle = '#fff2d6'; g.stroke(); g.fillStyle = cor; g.fill();
  }
  function camada(desenho, s = { blur: 14, dx: 6, dy: 10, a: .35 }) {
    const c = mk(W, H), g = c.getContext('2d'); desenho(g);
    Arte.aplicarGrao(g, W, H, 1);
    const f = fundo.getContext('2d'); f.save();
    if (s) { f.shadowColor = `rgba(35,22,6,${s.a})`; f.shadowBlur = s.blur; f.shadowOffsetX = s.dx; f.shadowOffsetY = s.dy; }
    f.drawImage(c, 0, 0); f.restore();
  }
  function montarFundo() {
    fundo = mk(W, H);
    camada((g) => { // folha do bloco (chão)
      g.fillStyle = '#f3cf55'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(64,112,170,.38)'; g.lineWidth = 2;
      for (let k = 0, y = 948; y < H + 20; k++, y = 948 + 13 * k + 1.7 * k * k) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.strokeStyle = 'rgba(205,60,60,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(150, 940); g.lineTo(40, H); g.stroke();
    }, null);
    camada((g) => { // painel do céu, papelão em pé
      const gr = g.createLinearGradient(0, 0, 0, 940);
      gr.addColorStop(0, '#132150'); gr.addColorStop(.55, '#2a3d85'); gr.addColorStop(.86, '#5b4a92'); gr.addColorStop(1, '#b5687a');
      g.fillStyle = gr; g.fillRect(-10, -10, W + 20, 950);
    }, { blur: 18, dx: 0, dy: 12, a: .45 });
    camada((g) => { // lua
      g.beginPath(); g.arc(140, 340, 46, 0, Math.PI * 2); g.lineWidth = 8; g.strokeStyle = '#fff2d6'; g.stroke(); g.fillStyle = '#fff3c4'; g.fill();
      g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(164, 326, 42, 0, Math.PI * 2); g.fill();
    }, { blur: 10, dx: 4, dy: 6, a: .3 });
    const r = mulberry32(11);
    camada((g) => { // estrelinhas
      for (let i = 0; i < 26; i++) {
        const x = 24 + r() * 672, y = 270 + r() * 440, s = 5 + r() * 8;
        if (Math.hypot(x - 140, y - 340) < 70) continue;
        g.beginPath(); Arte.estrela(g, x, y, s, s * .45); g.fillStyle = '#ffe27a'; g.fill();
        if (i % 3 === 0) estrelas.push({ x, y, s, f: r() * 6 });
      }
    }, { blur: 6, dx: 2, dy: 3, a: .3 });
    camada((g) => pecaFundo(g, (g) => { g.moveTo(-20, 945); g.lineTo(-20, 800); g.bezierCurveTo(120, 730, 260, 760, 380, 800); g.bezierCurveTo(500, 840, 620, 740, 740, 770); g.lineTo(740, 945); g.closePath(); }, '#e39b45'));
    camada((g) => pecaFundo(g, (g) => { g.moveTo(-20, 945); g.lineTo(-20, 862); g.bezierCurveTo(140, 822, 300, 882, 430, 870); g.bezierCurveTo(560, 858, 640, 822, 740, 852); g.lineTo(740, 945); g.closePath(); }, '#f0b860'));
    camada((g) => { // coqueiro com pisca-pisca
      const P0 = [96, 950], P1 = [70, 720], P2 = [152, 522];
      const pt = (t) => [(1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0], (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1]];
      for (let i = 0; i < 12; i++) {
        const ta = i / 12, tb = (i + 1) / 12, a = pt(ta), b = pt(tb), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L, wa = 24 - ta * 9, wb = (24 - tb * 9) * 1.08;
        pecaFundo(g, (g) => { g.moveTo(a[0] + nx * wa, a[1] + ny * wa); g.lineTo(b[0] + nx * wb, b[1] + ny * wb); g.lineTo(b[0] - nx * wb, b[1] - ny * wb); g.lineTo(a[0] - nx * wa, a[1] - ny * wa); g.closePath(); }, i % 2 ? '#8a5a3b' : '#a06b45', 3);
      }
      for (let i = 1; i < 11; i++) { const t = i / 11.5, p = pt(t); coco.push({ x: p[0] + (i % 2 ? 1 : -1) * (19 - t * 8), y: p[1], c: i % 4 }); }
      const B = [152, 520];
      [[-172, 150, .30], [-140, 175, .26], [-104, 150, .1], [-68, 160, .08], [-30, 170, .24], [6, 165, .34], [36, 140, .38]].forEach(([ang, L, caida], k) => {
        const a = ang * Math.PI / 180, T = [B[0] + Math.cos(a) * L, B[1] + Math.sin(a) * L + L * caida];
        const M = [(B[0] + T[0]) / 2, (B[1] + T[1]) / 2 - 18], dx = T[0] - B[0], dy = T[1] - B[1], n = Math.hypot(dx, dy), nx = -dy / n * 22, ny = dx / n * 22;
        pecaFundo(g, (g) => { g.moveTo(B[0], B[1]); g.quadraticCurveTo(M[0] + nx, M[1] + ny, T[0], T[1]); g.quadraticCurveTo(M[0] - nx, M[1] - ny, B[0], B[1]); g.closePath(); }, k % 2 ? '#3fa860' : '#2f8f4e', 3);
        g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(B[0], B[1]); g.quadraticCurveTo(M[0], M[1], T[0], T[1]); g.stroke();
      });
      [[140, 536], [163, 541], [151, 556]].forEach(([x, y]) => pecaFundo(g, (g) => g.arc(x, y, 14, 0, Math.PI * 2), '#6b4226', 3));
    });
    camada((g) => { // pinheirinho com estrela
      pecaFundo(g, (g) => Arte.rr(g, 597, 860, 30, 82, 4), '#7a4a2a');
      const camadaArv = (cx, yt, w, h) => (g) => {
        g.moveTo(cx, yt); g.lineTo(cx + w / 2, yt + h);
        const n = 5, st = w / n;
        for (let k = 0; k < n; k++) { const x0 = cx + w / 2 - k * st, x1 = x0 - st; g.quadraticCurveTo((x0 + x1) / 2, yt + h + 16, x1, yt + h); }
        g.closePath();
      };
      [[612, 700, 222, 172, '#1f7a4c'], [612, 612, 180, 150, '#258a57'], [612, 532, 138, 128, '#2c9a60']].forEach(([cx, yt, w, h, cor]) => pecaFundo(g, camadaArv(cx, yt, w, h), cor));
      pecaFundo(g, (g) => Arte.estrela(g, 612, 516, 40, 17), '#ffd23f');
    });
    camada((g) => { // presentes no chão
      const presente = (x, y, w, h, cor, fita) => {
        pecaFundo(g, (g) => Arte.rr(g, x, y, w, h, 4), cor, 3);
        pecaFundo(g, (g) => Arte.rr(g, x - 5, y - 14, w + 10, 18, 4), cor, 3);
        g.fillStyle = fita; g.fillRect(x + w / 2 - 7, y - 14, 14, h + 14); g.fillRect(x, y + h * .45, w, 11);
        [-1, 1].forEach((s) => pecaFundo(g, (g) => g.ellipse(x + w / 2 + s * 15, y - 22, 15, 9, s * .5, 0, Math.PI * 2), fita, 2));
      };
      presente(16, 928, 96, 74, '#c8102e', '#f6d047');
      presente(104, 966, 62, 48, '#2f5d8a', '#fffaf0');
      presente(632, 944, 72, 60, '#f2b705', '#c8102e');
    });
    camada((g) => { // fio do pisca-pisca
      g.strokeStyle = '#123d24'; g.lineWidth = 3; g.beginPath();
      for (let x = -10; x <= W + 10; x += 8) x === -10 ? g.moveTo(x, yFio(x)) : g.lineTo(x, yFio(x));
      g.stroke();
    }, { blur: 4, dx: 2, dy: 4, a: .3 });
    for (let x = 24; x <= 696; x += 48) fio.push({ x, y: yFio(x) });
  }
  function montarLuzes() {
    luzes = LUZ.map((cor, i) => [true, false].map((ligada) => {
      const c = mk(64, 64), g = c.getContext('2d');
      if (ligada) { const gr = g.createRadialGradient(32, 38, 2, 32, 38, 30); gr.addColorStop(0, cor + 'bb'); gr.addColorStop(1, cor + '00'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
      g.fillStyle = '#123d24'; g.fillRect(28, 16, 8, 9);
      g.beginPath(); g.ellipse(32, 35, 8, 11, 0, 0, Math.PI * 2); g.fillStyle = ligada ? cor : LUZ_OFF[i]; g.fill();
      g.beginPath(); g.ellipse(29.5, 31, 2.4, 4, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.7)'; g.fill();
      return c;
    }));
  }
  function desenharLuzes(ctx, b) {
    const bt = Math.floor(b);
    fio.forEach((p, i) => ctx.drawImage(luzes[i % 4][(i + bt) % 2 ? 1 : 0], p.x - 32, p.y - 16));
    coco.forEach((p, i) => ctx.drawImage(luzes[p.c][(i + Math.floor(b / 2)) % 3 ? 0 : 1], p.x - 32, p.y - 34));
    ENFEITES.forEach(([x, y, c], i) => {
      const brilho = (i + bt) % 4 === 0;
      if (brilho) ctx.drawImage(luzes[c][0], x - 32, y - 38);
      ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fillStyle = LUZ[c]; ctx.fill();
      ctx.beginPath(); ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill();
    });
  }
  function desenharEstrelas(ctx, t) {
    estrelas.forEach((e) => {
      const a = .5 + .5 * Math.sin(t * 3 + e.f); if (a < .35) return;
      const gr = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.s * 2.4);
      gr.addColorStop(0, `rgba(255,236,150,${.7 * a})`); gr.addColorStop(1, 'rgba(255,236,150,0)');
      ctx.fillStyle = gr; ctx.fillRect(e.x - e.s * 2.4, e.y - e.s * 2.4, e.s * 4.8, e.s * 4.8);
    });
  }

  /* ---- textos de papel ---- */
  const FONTE = (px) => `700 ${px}px Caveat, 'Segoe Print', cursive`;
  function medir(txt, px) { const g = mk(4, 4).getContext('2d'); g.font = FONTE(px); return g.measureText(txt).width; }
  function cartaoTexto(txt, px, cor, padX, h, maxW) {
    const w = Math.min(medir(txt, px), maxW) + padX * 2;
    return Arte.recorte(-w / 2, -h / 2, w / 2, h / 2, (g, m) => {
      Arte.forma(g, m, (g) => Arte.rr(g, -w / 2, -h / 2, w, h, 10), '#fffaf0');
      if (m !== 'cor') return;
      g.font = FONTE(px); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = cor;
      g.fillText(txt, 0, px * .06, maxW);
      Arte.costura(g, (g) => Arte.rr(g, -w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 6), 'rgba(120,100,70,.32)');
    });
  }
  function montarTextos(nome) {
    etiqueta = cartaoTexto(nome ? `Natal da Família ${nome}` : 'Natal de Papel', 62, '#c8102e', 34, 92, 590);
    marca = cartaoTexto(`${CONFIG.perfil}  ·  faz o teu: ${CONFIG.site}`, 30, '#5c4a36', 18, 46, 620);
    const l2 = nome ? `da Família ${nome}` : 'de toda a família!', w = 600, h = 270;
    faixa = Arte.recorte(-w / 2, -h / 2, w / 2, h / 2, (g, m) => {
      Arte.forma(g, m, (g) => Arte.rr(g, -w / 2, -h / 2, w, h, 16), '#fffaf0');
      if (m !== 'cor') return;
      [[-w / 2 + 40, -h / 2 + 40, 1], [w / 2 - 40, h / 2 - 40, -1]].forEach(([x, y, s]) => {
        g.fillStyle = '#1f7a4c'; [-.6, .6].forEach((a) => { g.beginPath(); g.ellipse(x + Math.cos(a) * 16 * s, y + Math.sin(a) * 10, 18, 8, a, 0, Math.PI * 2); g.fill(); });
        g.fillStyle = '#c8102e'; [[-5, -4], [5, -4], [0, 5]].forEach(([dx, dy]) => { g.beginPath(); g.arc(x + dx, y + dy, 6, 0, Math.PI * 2); g.fill(); });
      });
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = FONTE(124); g.fillStyle = '#c8102e'; g.fillText('Feliz Natal!', 0, -34, w - 80);
      g.font = FONTE(62); g.fillStyle = '#1f7a4c'; g.fillText(l2, 0, 72, w - 80);
      g.fillStyle = '#6b5a44'; [-210, 210].forEach((x) => { g.beginPath(); g.arc(x, -h / 2 + 22, 7, 0, Math.PI * 2); g.fill(); });
    });
  }
  function desenharEtiqueta(ctx, b, passo) {
    let y = 116;
    if (b < 1.5) y -= 16 * Math.sin(Math.PI * clamp(b / 1.5, 0, 1));
    if (b > 66) y -= 300 * easeOut(clamp((b - 66) / 1.5, 0, 1));
    if (y < -100) return;
    ctx.save(); ctx.translate(360, y); ctx.rotate(-.025 + .012 * Math.sin(passo * 1.7)); Arte.peca(ctx, etiqueta); ctx.restore();
  }
  function desenharFaixa(ctx, b) {
    if (b < 67.5) return;
    const e = b - 67.5, y = lerp(-360, 262, elastico(clamp(e / 1.6, 0, 1))), rot = .06 * Math.sin(e * 2.4) * Math.exp(-e * .5);
    ctx.save(); ctx.translate(360, y); ctx.rotate(rot);
    ctx.strokeStyle = '#6b5a44'; ctx.lineWidth = 2.5; ctx.beginPath();
    [-210, 210].forEach((x) => { ctx.moveTo(x, -113); ctx.lineTo(x * .8, -y - 20); }); ctx.stroke();
    Arte.peca(ctx, faixa); ctx.restore();
  }
  function desenharMarca(ctx) { ctx.save(); ctx.translate(360, 1234); Arte.peca(ctx, marca, 1, .95); ctx.restore(); }

  /* ---- confete de papel ---- */
  const confete = [];
  (() => { const r = mulberry32(99), C = ['#c8102e', '#f2b705', '#1f7a4c', '#fffaf0', '#59a8ff'];
    for (let i = 0; i < 96; i++) confete.push({ x: r() * W, y0: r() * H, v: 70 + r() * 90, a: r() * 6.28, va: (r() - .5) * 6, w: 7 + r() * 7, h: 4 + r() * 4, c: C[i % 5], f: r() * 6.28, extra: i >= 52 }); })();
  function desenharConfete(ctx, b, t, frente) {
    const forca = b >= 36 ? clamp((b - 36) / 8, 0, 1) : 0, fim = b >= 68;
    if (!forca) return;
    const tf = t - 68 * SPB;
    confete.forEach((p, i) => {
      if ((i % 2 === 0) !== frente) return;
      let y;
      if (p.extra) { if (!fim) return; y = -60 - p.y0 * .35 + tf * p.v * 2.2; if (y > H + 40) return; }
      else y = ((p.y0 + p.v * t) % (H + 80)) - 40;
      const x = p.x + Math.sin(t * 1.4 + p.f) * 26;
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.a + p.va * t); ctx.scale(1, Math.cos(t * 3 + p.f));
      ctx.globalAlpha = forca; ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    });
    ctx.globalAlpha = 1;
  }
  function init() { montarLuzes(); montarFundo(); montarTextos(''); }
  return { init, imagem: () => fundo, desenharLuzes, desenharEstrelas, desenharConfete, montarTextos, desenharEtiqueta, desenharFaixa, desenharMarca };
})();
/* ============ Cena: bonecos de papel dançando no ritmo ============ */
const Cena = (() => {
  const cv = $('#cena'), ctx = cv.getContext('2d');
  const CHAO = 1092;
  let base = 1, elenco = [], cabVerso = null, demo = null;

  function definirElenco(pessoas) {
    const lista = pessoas.length ? pessoas : demo, n = lista.length;
    const s = [0, 1.15, 1.0, .88, .76][n];
    const xs = { 1: [360], 2: [232, 488], 3: [156, 360, 564], 4: [114, 279, 441, 606] }[n];
    elenco = lista.map((p, i) => { if (!p.cab) p.cab = Arte.cabeca(p.face, i); return { p, x: xs[i], s, i, n }; });
  }

  // Coreografia em tempos (b). 1 compasso de entrada, 4 blocos de 4 compassos no refrão, final.
  function pose(i, n, b) {
    const P = { dx: 0, dy: 0, rot: 0, sx: 1, aL: .2, aR: .2, lL: .05, lR: .05, head: 0, pop: 1 };
    const abre = n >= 4 ? .75 : n === 3 ? .88 : 1;
    const fr = ((b % 1) + 1) % 1, bt = Math.floor(b), pulo = Math.pow(Math.sin(Math.PI * fr), 2);
    if (b < B_INTRO) {            // entrada: todo mundo já em pé (o 1º quadro vira a capa no WhatsApp) dando tchau
      const tchau = 2.35 + .35 * Math.sin(2 * Math.PI * b * 1.5), sobe = easeOut(clamp(b / .6, 0, 1));
      P.head = .12 * Math.sin(Math.PI * b); P.dy = -5 * pulo;
      if (i % 2) { P.aL = lerp(.2, tchau, sobe); P.aR = .25; } else { P.aR = lerp(.2, tchau, sobe); P.aL = .25; }
    } else if (b < B_INTRO + B_REFRAO) {
      const c = b - B_INTRO, sec = Math.floor(c / 16), cl = c % 16;
      if (sec === 0) {            // batidão: soco pro alto alternado, quicando no tempo
        const lado = bt % 2 === 0, soco = Math.pow(Math.sin(Math.PI * fr), .7);
        P.aR = lado ? lerp(.35, 2.35, soco) : .35; P.aL = lado ? .35 : lerp(.35, 2.35, soco);
        P.dy = -12 * pulo; P.rot = (lado ? -1 : 1) * .06 * soco;
        P.lL = .05 + (lado ? 0 : .14 * pulo); P.lR = .05 + (lado ? .14 * pulo : 0);
        P.head = (lado ? 1 : -1) * .12 * soco;
      } else if (sec === 1) {     // mão pro alto balançando, dois tempos pra cada lado
        const ph = Math.PI * c / 2;
        P.aL = 2.6 + .25 * Math.sin(ph); P.aR = 2.6 - .25 * Math.sin(ph);
        P.rot = .14 * Math.sin(ph); P.dx = 18 * Math.sin(ph); P.dy = -10 * pulo;
        P.lL = P.lR = .06 + .06 * pulo; P.head = .14 * Math.sin(ph);
      } else if (sec === 2) {     // passinho: pé rápido em colcheia, braço do lado oposto
        const f2 = ((b * 2) % 1 + 1) % 1, meio = Math.floor(b * 2), k = Math.sin(Math.PI * f2), dir = (meio + i) % 2 === 0;
        if (dir) P.lR = .1 + .62 * k; else P.lL = .1 + .62 * k;
        P.aL = (dir ? .95 : .3) * abre + .1; P.aR = (dir ? .3 : .95) * abre + .1;
        P.dy = -7 * k; P.dx = 10 * Math.sin(Math.PI * b / 2); P.rot = (dir ? -1 : 1) * .05 * k;
        P.head = (dir ? 1 : -1) * .1 * k;
      } else if (cl < 12) {       // giro: aparece o verso branco do papel
        const sp = clamp((cl % 4 - 1) / 2, 0, 1);
        P.sx = Math.cos(easeInOut(sp) * Math.PI * 2);
        P.dy = sp > 0 && sp < 1 ? -24 * Math.sin(Math.PI * sp) : -8 * pulo;
        P.aL = P.aR = .5 + .9 * Math.sin(Math.PI * sp) * abre; P.head = .1 * Math.sin(Math.PI * c);
      } else {                    // ta-dá
        const tt = clamp(cl - 12, 0, 1);
        P.aL = P.aR = lerp(.4, 2.25, easeOut(tt)); P.dy = -6 * pulo; P.head = .12 * Math.sin(Math.PI * c * .5);
      }
    } else {
      const e = b - B_INTRO - B_REFRAO;
      P.aL = P.aR = 2.25 + .05 * Math.sin(e * 2); P.dy = -3 * Math.abs(Math.sin(e * Math.PI)); P.head = .07 * Math.sin(e * 1.5);
    }
    return P;
  }

  function desenharBoneco(d, P, jx, jy) {
    const k = Arte.kit(d.p.roupa), verso = P.sx < 0, s = d.s;
    ctx.save(); ctx.translate(d.x + P.dx * s + jx, CHAO);
    const sc = Math.max(.3, Math.abs(P.sx)) * s * P.pop * (1 + P.dy / 160);
    ctx.beginPath(); ctx.ellipse(6 * s, 4, 66 * sc, 14 * s * P.pop, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(70,45,10,.22)'; ctx.fill();
    ctx.translate(0, P.dy * s + jy); ctx.rotate(P.rot); ctx.scale(s * P.sx, s * P.pop); ctx.translate(0, -130);
    const pe = verso ? k.pernaV : k.perna, br = verso ? k.bracoV : k.braco;
    ctx.save(); ctx.translate(-25, -4); ctx.rotate(P.lL); ctx.scale(-1, 1); Arte.peca(ctx, pe, base); ctx.restore();
    ctx.save(); ctx.translate(25, -4); ctx.rotate(-P.lR); Arte.peca(ctx, pe, base); ctx.restore();
    Arte.peca(ctx, verso ? k.torsoV : k.torso, base);
    ctx.save(); ctx.translate(-46, -128); ctx.rotate(P.aL); ctx.scale(-1, 1); Arte.peca(ctx, br, base); ctx.restore();
    ctx.save(); ctx.translate(46, -128); ctx.rotate(-P.aR); Arte.peca(ctx, br, base); ctx.restore();
    ctx.save(); ctx.translate(0, -146); ctx.rotate(P.head); ctx.translate(0, -76);
    Arte.peca(ctx, verso ? cabVerso : d.p.cab, base);
    ctx.rotate(P.head * .35); Arte.peca(ctx, verso ? k.gorroV : k.gorro, base);
    ctx.restore(); ctx.restore();
  }

  function render(b) {
    const passo = Math.floor(b * SPB * QPS), bq = passo / (SPB * QPS), t = bq * SPB;
    const z = 1 + .06 * clamp(b / B_TOTAL, 0, 1);                 // câmera aproximando devagar
    ctx.setTransform(base * z, 0, 0, base * z, base * (1 - z) * 360, base * (1 - z) * 940);
    ctx.drawImage(Fundo.imagem(), 0, 0);
    Fundo.desenharEstrelas(ctx, t);
    Fundo.desenharLuzes(ctx, b);
    Fundo.desenharConfete(ctx, bq, t, false);
    const r = mulberry32(passo * 7 + 3);
    elenco.forEach((d) => { const jx = (r() - .5) * 1.4, jy = (r() - .5) * 1.4; desenharBoneco(d, pose(d.i, d.n, bq), jx, jy); });
    Fundo.desenharConfete(ctx, bq, t, true);
    ctx.setTransform(base, 0, 0, base, 0, 0);
    Fundo.desenharEtiqueta(ctx, bq, passo);
    Fundo.desenharFaixa(ctx, bq);
    if (!CONFIG.premium) Fundo.desenharMarca(ctx);
  }

  function init() {
    base = cv.width / W;
    Arte.init(); Fundo.init();
    cabVerso = Arte.cabecaVerso();
    demo = [0, 1, 2, 3].map((i) => ({ face: null, roupa: i, cab: null }));
    definirElenco([]);
  }
  return { init, render, definirElenco, canvas: cv };
})();
/* ============ Interface: rostos, recorte, prévia, gravação ============ */
const App = (() => {
  const pessoas = [0, 1, 2, 3].map((i) => ({ img: null, face: null, cab: null, crop: null, thumb: null, roupa: i }));
  let modo = 'loop', tLoop0 = performance.now(), gravador = null, blobFinal = null, arqFinal = '';
  let naPrevia = false, downloads = null, trava = null;
  // funil do site: a tabela só aceita os eventos dela, então aqui só conta a visita (abriu_site, pagina natal)
  const abriuSite = () => { try { if (window.Funil && window.Funil.abriuSite) window.Funil.abriuSite('natal'); } catch (e) { /* nunca quebra */ } };

  function aviso(txt, ms = 3800) { const a = $('#aviso'); a.textContent = txt; a.hidden = false; clearTimeout(aviso.t); aviso.t = setTimeout(() => { a.hidden = true; }, ms); }
  // caixa por cima: no site usa .modal-fundo + .aberto (regra de movimento); na versão solta usa hidden
  const modalAberto = (el) => (el.classList.contains('modal-fundo') ? el.classList.contains('aberto') : !el.hidden);
  function abrirModal(el) { if (el.classList.contains('modal-fundo')) { el.classList.remove('fechando'); el.classList.add('aberto'); } else el.hidden = false; }
  function fecharModal(el) {
    if (!el.classList.contains('modal-fundo')) { el.hidden = true; return; }
    if (window.CA_MOV && window.CA_MOV.fecharClasse) window.CA_MOV.fecharClasse(el, 'aberto'); else el.classList.remove('aberto');
  }
  const ativos = () => pessoas.filter((p) => p.face);
  function atualizarElenco() {
    Cena.definirElenco(ativos());
    const r = $('#resumoRostos'), n = ativos().length;
    if (r) r.textContent = n ? `${n} de 4` : 'até 4 pessoas';
  }
  function nomeFamilia() { const s = $('#familia').value.trim().replace(/\s+/g, ' ').slice(0, 24); return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
  const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const suave = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

  // O campo de arquivo fica por cima do círculo: o toque cai direto nele (funciona no navegador do Instagram e de apps)
  function campoFoto(i, rotulo) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*'; inp.className = 'campo-foto'; inp.setAttribute('aria-label', rotulo);
    inp.addEventListener('change', () => { const f = inp.files && inp.files[0]; inp.value = ''; if (f) receberFoto(i, f); });
    return inp;
  }
  function montarSlots() {
    const box = $('#slots'); box.innerHTML = '';
    pessoas.forEach((p, i) => {
      const d = document.createElement('div'); d.className = 'slot';
      let alvo;
      if (p.face) {
        alvo = document.createElement('button'); alvo.type = 'button'; alvo.className = 'rosto tem mov-toque';
        alvo.style.backgroundImage = `url(${p.thumb})`; alvo.setAttribute('aria-label', `Ajustar o rosto ${i + 1}`);
        alvo.onclick = () => Recorte.abrir(i);
      } else {
        alvo = document.createElement('label'); alvo.className = 'rosto mov-toque';
        alvo.append('+', campoFoto(i, `Pôr o rosto ${i + 1}`));
      }
      const r = document.createElement('button'); r.type = 'button'; r.className = 'roupa mov-toque';
      r.textContent = Arte.ROUPAS[p.roupa].nome; r.setAttribute('aria-label', `Roupa ${i + 1}: ${Arte.ROUPAS[p.roupa].nome}. Toca pra trocar`);
      r.onclick = () => { p.roupa = (p.roupa + 1) % Arte.ROUPAS.length; montarSlots(); atualizarElenco(); };
      d.append(alvo, r); box.append(d);
    });
  }
  async function receberFoto(i, f) {
    try { pessoas[i].img = await carregarImagem(f); pessoas[i].crop = null; Recorte.abrir(i); }
    catch (err) { aviso('Não deu pra abrir essa foto. Tenta outra.'); }
  }
  function carregarImagem(file) {
    return new Promise((ok, erro) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        const k = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight)), c = mk(im.naturalWidth * k, im.naturalHeight * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c);
      };
      im.onerror = () => { URL.revokeObjectURL(url); erro(new Error('foto')); };
      im.src = url;
    });
  }

  /* ---- recorte do rosto: arrastar, pinça (zoom e giro), roda do mouse ---- */
  const Recorte = (() => {
    const cv = $('#cropCv'), g = cv.getContext('2d'), S = 640, CR = 250, caixa = $('#mRecorte');
    let i = -1, img = null, st = null, sMin = 1, sMax = 8, pinca = null;
    const pts = new Map();
    function abrir(slot) {
      i = slot; img = pessoas[i].img;
      if (!img) return;
      sMin = (2 * CR) / Math.min(img.width, img.height); sMax = sMin * 8;
      st = pessoas[i].crop ? { ...pessoas[i].crop } : { x: 0, y: 0, s: sMin, rot: 0 };
      sincZoom(); desenhar(); $('#cropRemover').hidden = !pessoas[i].face;
      abrirModal(caixa); $('#cropOk').focus({ preventScroll: true });
    }
    function fechar() { fecharModal(caixa); pts.clear(); pinca = null; }
    function sincZoom() { $('#cropZoom').value = String(clamp(Math.log(st.s / sMin) / Math.log(sMax / sMin), 0, 1)); }
    function desenhar() {
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#efe4cc'; g.fillRect(0, 0, S, S);
      g.save(); g.translate(S / 2 + st.x, S / 2 + st.y); g.rotate(st.rot); g.scale(st.s, st.s); g.drawImage(img, -img.width / 2, -img.height / 2); g.restore();
      g.fillStyle = 'rgba(31,31,36,.6)'; g.beginPath(); g.rect(0, 0, S, S); g.arc(S / 2, S / 2, CR, 0, Math.PI * 2, true); g.fill('evenodd');
      g.save(); g.setLineDash([14, 10]); g.lineWidth = 5; g.strokeStyle = '#fffaf0'; g.beginPath(); g.arc(S / 2, S / 2, CR, 0, Math.PI * 2); g.stroke(); g.restore();
    }
    function rosto() {
      const R = 512, c = mk(R, R), q = c.getContext('2d'), k = (R / 2) / CR;
      q.beginPath(); q.arc(R / 2, R / 2, R / 2, 0, Math.PI * 2); q.clip(); q.fillStyle = '#efe4cc'; q.fillRect(0, 0, R, R);
      q.translate(R / 2 + st.x * k, R / 2 + st.y * k); q.rotate(st.rot); q.scale(st.s * k, st.s * k); q.drawImage(img, -img.width / 2, -img.height / 2);
      return c;
    }
    const escala = () => S / cv.getBoundingClientRect().width;
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y), ang = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
    function novaPinca() { const v = [...pts.values()]; pinca = v.length === 2 ? { d: dist(v[0], v[1]) || 1, a: ang(v[0], v[1]), s: st.s, rot: st.rot } : null; }
    cv.addEventListener('pointerdown', (e) => { if (!st) return; cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); novaPinca(); });
    cv.addEventListener('pointermove', (e) => {
      if (!st || !pts.has(e.pointerId)) return; e.preventDefault();
      const ant = pts.get(e.pointerId), k = escala(); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) { st.x += (e.clientX - ant.x) * k; st.y += (e.clientY - ant.y) * k; }
      else if (pinca) { const v = [...pts.values()]; st.s = clamp(pinca.s * dist(v[0], v[1]) / pinca.d, sMin * .5, sMax); st.rot = pinca.rot + ang(v[0], v[1]) - pinca.a; sincZoom(); }
      desenhar();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => cv.addEventListener(ev, (e) => { pts.delete(e.pointerId); if (st) novaPinca(); }));
    cv.addEventListener('wheel', (e) => { if (!st) return; e.preventDefault(); st.s = clamp(st.s * Math.exp(-e.deltaY * .0015), sMin * .5, sMax); sincZoom(); desenhar(); }, { passive: false });
    $('#cropZoom').addEventListener('input', (e) => { if (!st) return; st.s = sMin * Math.pow(sMax / sMin, +e.target.value); desenhar(); });
    $('#cropGirar').onclick = () => { st.rot += Math.PI / 2; desenhar(); };
    $('#cropArquivo').addEventListener('change', (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) { fechar(); receberFoto(i, f); } });
    $('#cropRemover').onclick = () => { Object.assign(pessoas[i], { img: null, face: null, cab: null, crop: null, thumb: null }); fechar(); montarSlots(); atualizarElenco(); };
    $('#cropCancelar').onclick = fechar;
    $('#cropOk').onclick = () => {
      const p = pessoas[i]; p.crop = { ...st }; p.face = rosto(); p.cab = null;
      const t = mk(168, 168); t.getContext('2d').drawImage(p.face, 0, 0, 168, 168); p.thumb = t.toDataURL('image/jpeg', .85);
      fechar(); montarSlots(); atualizarElenco();
    };
    return { abrir, fechar, caixa };
  })();

  /* ---- prévia com música ---- */
  function voltarLoop() { modo = 'loop'; tLoop0 = performance.now(); $('#btnPlay').textContent = '▶ Ver com música'; }
  async function tocarPrevia() {
    if (modo === 'musica') { Musica.parar(true); voltarLoop(); return; }
    await Musica.tocar({ aoFim: voltarLoop }); modo = 'musica'; $('#btnPlay').textContent = '■ Parar a música';
  }

  /* ---- gravação do vídeo ---- */
  function tipoVideo() {
    if (!window.MediaRecorder) return null;
    // H.264 primeiro (o que o WhatsApp e o iPhone tocam em qualquer aparelho)
    const tipos = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4;codecs=avc1,opus', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    return tipos.find((t) => { try { return MediaRecorder.isTypeSupported(t); } catch (e) { return false; } }) || '';
  }
  async function pedirTelaLigada() { try { trava = navigator.wakeLock ? await navigator.wakeLock.request('screen') : null; } catch (e) { trava = null; } }
  function soltarTelaLigada() { try { if (trava) trava.release(); } catch (e) { /* nada */ } trava = null; }
  function entrarGravacao() {
    $('#painelGravando').hidden = false; $('#btnPlay').disabled = true; $('#btnGravar').disabled = true; $('#progresso').style.width = '0%';
    $('#tela').scrollIntoView({ behavior: suave(), block: 'center' }); pedirTelaLigada();
  }
  function sairGravacao() { $('#painelGravando').hidden = true; $('#btnPlay').disabled = false; $('#btnGravar').disabled = false; gravador = null; soltarTelaLigada(); voltarLoop(); }
  async function gravar() {
    if (gravador) return;
    if (!ativos().length) {
      aviso('Põe pelo menos um rosto primeiro.');
      const t = $('#tRostos'); if (t && t.getAttribute('aria-expanded') === 'false' && window.CA_MOV) window.CA_MOV.alternarGrupo(t, true);
      $('#slots').scrollIntoView({ behavior: suave(), block: 'center' }); return;
    }
    const tipo = tipoVideo();
    if (tipo === null || !Cena.canvas.captureStream) { aviso('Esse navegador não grava vídeo. Abre no Chrome ou no Safari atualizado.', 5000); return; }
    Musica.init(); try { await Musica.ctx.resume(); } catch (e) { /* segue */ }
    const video = Cena.canvas.captureStream(30), audio = Musica.stream;
    const stream = new MediaStream([...video.getVideoTracks(), ...(audio ? audio.getAudioTracks() : [])]);
    let rec;
    try { rec = new MediaRecorder(stream, Object.assign({ videoBitsPerSecond: 2500000, audioBitsPerSecond: 128000 }, tipo ? { mimeType: tipo } : {})); }
    catch (e) { try { rec = new MediaRecorder(stream); } catch (e2) { aviso('Não deu pra começar a gravação nesse aparelho.'); return; } }
    const partes = []; let cancelado = false;
    rec.ondataavailable = (e) => { if (e.data && e.data.size) partes.push(e.data); };
    rec.onstop = () => {
      video.getTracks().forEach((t) => t.stop()); sairGravacao();
      if (cancelado || !partes.length) return;
      const mime = (rec.mimeType || tipo || 'video/webm').split(';')[0], nome = nomeFamilia();
      blobFinal = new Blob(partes, { type: mime });
      arqFinal = `natal-de-papel${nome ? '-' + slug(nome) : ''}.${mime.includes('mp4') ? 'mp4' : 'webm'}`;
      mostrarResultado();
    };
    gravador = { cancelar: () => { cancelado = true; Musica.parar(true); if (rec.state !== 'inactive') rec.stop(); } };
    entrarGravacao();
    rec.start(500);
    await Musica.tocar({ aoFim: () => setTimeout(() => { if (rec.state !== 'inactive') rec.stop(); }, 400) });
    modo = 'gravando';
  }
  function mostrarResultado() {
    const v = $('#vidResultado'); if (v.src) URL.revokeObjectURL(v.src); v.src = URL.createObjectURL(blobFinal);
    const file = new File([blobFinal], arqFinal, { type: blobFinal.type });
    let podeMandar = false; try { podeMandar = !naPrevia && !!(navigator.canShare && navigator.canShare({ files: [file] })); } catch (e) { podeMandar = false; }
    $('#btnCompartilhar').hidden = !podeMandar;
    $('#btnSalvar').hidden = naPrevia && !downloads;
    $('#dicaResultado').textContent = naPrevia
      ? (downloads ? 'Aqui na prévia dá pra salvar. No site também dá pra mandar direto no WhatsApp.' : 'Aqui na prévia o vídeo só toca. No site dá pra salvar e mandar no WhatsApp.')
      : (podeMandar ? 'Escolhe o WhatsApp na lista e manda no grupo da família.' : 'Salva o vídeo e manda no WhatsApp como vídeo.');
    abrirModal($('#mResultado'));
  }
  async function compartilhar() {
    const file = new File([blobFinal], arqFinal, { type: blobFinal.type });
    try { await navigator.share({ files: [file], title: CONFIG.marca, text: `Nosso Natal de Papel! Faz o teu: https://${CONFIG.site}` }); }
    catch (e) { if (e && e.name !== 'AbortError') aviso('Não abriu o compartilhar. Usa o "Salvar vídeo".'); }
  }
  async function salvar() {
    if (naPrevia) {
      if (!downloads) return;
      try { await downloads.save({ filename: arqFinal, data: blobFinal }); aviso('Vídeo salvo.'); }
      catch (e) { if (!e || e.code !== 'declined') aviso(e && e.code === 'rate_limited' ? 'Espera um pouquinho e tenta de novo.' : 'Não deu pra salvar por aqui.'); }
      return;
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blobFinal); a.download = arqFinal;
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }
  function fecharResultado() { $('#vidResultado').pause(); fecharModal($('#mResultado')); }

  /* ---- laço de quadros ---- */
  function quadro(agora) {
    if (modo !== 'pausa') {
      let b;
      if (modo === 'loop') b = (((agora - tLoop0) / 1000) % (DURACAO + 1.6)) / SPB;
      else { const m = Musica.tempo(); b = m === null ? B_TOTAL : m; }
      Cena.render(b);
      if (modo === 'gravando') $('#progresso').style.width = `${clamp(b / B_TOTAL, 0, 1) * 100}%`;
    }
    requestAnimationFrame(quadro);
  }
  async function fontes() {
    try { await Promise.race([Promise.all([document.fonts.load('700 62px Caveat'), document.fonts.load('700 124px Caveat')]), new Promise((r) => setTimeout(r, 2500))]); } catch (e) { /* usa a reserva */ }
  }
  async function init() {
    Cena.init(); montarSlots(); atualizarElenco(); requestAnimationFrame(quadro);
    if (window.claude && typeof window.claude.use === 'function') {
      naPrevia = true; window.claude.use('downloads').then((d) => { downloads = d; }).catch(() => { downloads = null; });
    }
    $('#btnPlay').onclick = tocarPrevia;
    $('#btnGravar').onclick = gravar;
    $('#btnCancelarGrav').onclick = () => gravador && gravador.cancelar();
    $('#btnCompartilhar').onclick = compartilhar;
    $('#btnSalvar').onclick = salvar;
    $('#btnFechar').onclick = fecharResultado;
    [Recorte.caixa, $('#mResultado')].forEach((el) => el.addEventListener('click', (e) => { if (e.target === el) (el === Recorte.caixa ? Recorte.fechar() : fecharResultado()); }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (modalAberto(Recorte.caixa)) Recorte.fechar(); else if (modalAberto($('#mResultado'))) fecharResultado(); } });
    document.addEventListener('visibilitychange', () => { if (document.hidden && gravador) { gravador.cancelar(); aviso('A gravação parou porque a tela saiu. Grava de novo e deixa a tela aberta.', 5000); } });
    let tNome = 0;
    $('#familia').addEventListener('input', () => {
      clearTimeout(tNome);
      tNome = setTimeout(() => { const n = nomeFamilia(); Fundo.montarTextos(n); const r = $('#resumoNome'); if (r) r.textContent = n ? `Família ${n}` : 'aparece no final'; }, 250);
    });
    abriuSite();
    await fontes(); Fundo.montarTextos(nomeFamilia());
  }
  // gancho pra teste automático (não muda nada pra quem usa)
  window.NatalDePapel = {
    quadro: (b) => { modo = 'pausa'; Cena.render(b); }, continuar: () => voltarLoop(),
    rosto: (i, c) => { const p = pessoas[i]; p.img = c; p.face = c; p.cab = null; const t = mk(168, 168); t.getContext('2d').drawImage(c, 0, 0, 168, 168); p.thumb = t.toDataURL(); montarSlots(); atualizarElenco(); },
    video: () => blobFinal, arquivo: () => arqFinal,
  };
  return { init };
})();
App.init();
