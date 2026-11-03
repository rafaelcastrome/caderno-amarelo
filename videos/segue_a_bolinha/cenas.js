// "Segue a bolinha: 3 fases" (vídeo jogável, 03/11/2026, thread 31).
// Ideia do Rafael a partir de uma referência de "copinhos": a bolinha some embaixo de um copo, os copos
// embaralham e a pessoa tem que dizer em qual copo ela está. Aqui são 3 fases (3, 5 e 9 copos), cada uma
// mais rápida; depois de cada fase os copos ganham número, congela, e o copo certo levanta.
// No fim a pessoa comenta o placar (1, 2 ou 3 de 3). Embaralhamento honesto: dá pra seguir prestando atenção.
window.CENAS = function (WB) {
  const { INK, clamp, ease, lerp } = WB;
  const S = WB.scenes;
  const st = c => S[c - 1].start, en = c => S[c - 1].end;
  const fala = c => S[c - 1].fala ?? (en(c) - st(c));
  const fr = (c, t) => (t - st(c)) / (en(c) - st(c));
  const tf = (c, k) => st(c) + k * fala(c);
  const NS = 'http://www.w3.org/2000/svg';
  const txt = (s, x, y, size, cor, parent, anchor = 'middle') => {
    const r = WB.textStrokes(s, x, y, size, cor, parent, anchor); WB.showNow(r.strokes); return r;
  };
  const RED = '#e63946', RED_D = '#a4161a', YEL = '#ffd60a', GOLD = '#e0a800';

  // ---------------- gancho fixo desde o quadro 0 ----------------
  const hook = WB.group(WB.overlay);
  const h1 = txt('SEGUE A BOLINHA', 540, 150, 112, INK.red, hook);
  WB.showNow(WB.strokePath(WB.wavyLine(540 - h1.width / 2, 540 + h1.width / 2, 178, 5, 40), INK.red, 5, hook));
  txt('3 fases... duvido tu passar da última', 540, 262, 60, INK.black, hook);

  // rótulo da fase (troca a cada fase)
  const FASES = [
    { nome: 'FASE 1 · FÁCIL', cor: INK.green },
    { nome: 'FASE 2 · MÉDIO', cor: INK.orange },
    { nome: 'FASE 3 · INSANA', cor: INK.red },
  ];
  const faseIni = [-1, st(5), st(8)];
  const faseFim = [st(5), st(8), st(11)];
  FASES.forEach((f, i) => {
    const g = WB.group(WB.overlay);
    const m = WB.measure(f.nome, 70);
    WB.mk('rect', { x: 540 - m / 2 - 34, y: 318, width: m + 68, height: 96, rx: 20, fill: f.cor, opacity: 0.14 }, g);
    WB.showNow(WB.strokePath(WB.roughRect(540 - m / 2 - 34, 318, 540 + m / 2 + 34, 414), f.cor, 6, g));
    txt(f.nome, 540, 390, 70, f.cor, g);
    WB.effect(t => {
      const a = clamp((t - faseIni[i]) / 0.25) * (1 - clamp((t - faseFim[i]) / 0.25));
      const pop = 1 + 0.25 * Math.max(0, 1 - (t - faseIni[i]) / 0.35) * (t >= faseIni[i] ? 1 : 0);
      g.setAttribute('opacity', a.toFixed(3));
      g.setAttribute('transform', `translate(540 366) scale(${pop.toFixed(3)}) translate(-540 -366)`);
    });
  });

  // ---------------- @ que anda ----------------
  const wm = WB.group(WB.overlay);
  txt('@Cardeno_Amarelo', 0, 0, 46, INK.gray, wm);
  WB.effect(t => {
    const x = 520 + 220 * Math.sin(t * 0.42);
    const y = 1690 + 50 * Math.sin(t * 0.61 + 1);
    wm.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    wm.setAttribute('opacity', 0.55);
  });

  // ---------------- copos e bolinha ----------------
  // copo de cabeça pra baixo; origem (0,0) = centro da boca (embaixo)
  function makeCup(parent, num) {
    const g = document.createElementNS(NS, 'g'); parent.appendChild(g);
    const body = 'M -92 0 L -62 -205 Q 0 -219 62 -205 L 92 0 Q 0 20 -92 0 Z';
    WB.mk('path', { d: body, fill: RED, stroke: INK.black, 'stroke-width': 7, 'stroke-linejoin': 'round' }, g);
    WB.mk('path', { d: 'M -86 -36 Q 0 -20 86 -36 L 84 -52 Q 0 -36 -84 -52 Z', fill: RED_D, opacity: 0.55 }, g);
    WB.mk('path', { d: 'M -70 -150 Q 0 -138 70 -150 L 68 -163 Q 0 -151 -68 -163 Z', fill: RED_D, opacity: 0.45 }, g);
    WB.mk('ellipse', { cx: 0, cy: -205, rx: 62, ry: 14, fill: '#ff8a93', stroke: INK.black, 'stroke-width': 6 }, g);
    WB.mk('path', { d: 'M -52 -180 L -72 -62', stroke: '#fff', 'stroke-width': 12, 'stroke-linecap': 'round', opacity: 0.45, fill: 'none' }, g);
    // número (aparece no congelamento)
    const lab = document.createElementNS(NS, 'g'); g.appendChild(lab);
    WB.mk('circle', { cx: 0, cy: -100, r: 46, fill: '#fffdf3', stroke: INK.black, 'stroke-width': 5 }, lab);
    txt(String(num), 0, -73, 82, INK.black, lab);
    return { g, lab };
  }
  function makeBall(parent) {
    const g = document.createElementNS(NS, 'g'); parent.appendChild(g);
    WB.mk('circle', { cx: 0, cy: -40, r: 40, fill: YEL, stroke: INK.black, 'stroke-width': 6 }, g);
    WB.mk('circle', { cx: -13, cy: -54, r: 11, fill: '#fff', opacity: 0.85 }, g);
    WB.mk('path', { d: 'M 18 -12 Q 34 -24 36 -44', stroke: GOLD, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
    return g;
  }

  // embaralhamento determinístico: lista de rodadas { t0, dur, pares:[[slotA, slotB], ...] }
  function rng(seed) { return () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }; }
  function plano(n, rodadas, t0, total, ballSlot0, seed, duplas) {
    const r = rng(seed); const R = [];
    let ball = ballSlot0; const dur = total / rodadas;
    for (let k = 0; k < rodadas; k++) {
      const livres = [...Array(n).keys()]; const pares = [];
      const nPares = duplas && k % 2 === 1 ? 2 : 1;
      for (let p = 0; p < nPares; p++) {
        let a, b;
        if (p === 0 && r() < 0.72 && livres.includes(ball)) a = ball; else a = livres[Math.floor(r() * livres.length)];
        livres.splice(livres.indexOf(a), 1);
        b = livres[Math.floor(r() * livres.length)];
        livres.splice(livres.indexOf(b), 1);
        pares.push([a, b]);
        if (ball === a) ball = b; else if (ball === b) ball = a;
      }
      R.push({ t0: t0 + k * dur, dur: dur * 0.92, pares });
    }
    return { R, final: ball };
  }

  // cria uma fase
  function fase({ slots, escala, ballSlot, tShow, tLiftUp, tLiftDown, tShufA, tShufB, rodadas, seed, duplas, tNum, tReveal, tOut }) {
    const n = slots.length;
    const layer = WB.group();
    const shadows = WB.group(layer), ballG = WB.group(layer), cupsG = WB.group(layer);
    const sh = slots.map(() => WB.mk('ellipse', { cx: 0, cy: 6, rx: 100, ry: 20, fill: 'rgba(60,40,10,0.18)' }, shadows));
    const ball = makeBall(ballG);
    // copo k começa no slot k
    const cups = slots.map(() => null).map((_, k) => makeCup(cupsG, 0));
    const { R, final } = plano(n, rodadas, tShufA, tShufB - tShufA, ballSlot, seed, duplas);
    // números: o número é do LUGAR (slot), então troco o label depois do embaralhamento
    cups.forEach(c => c.lab.remove());
    const labs = slots.map((s, i) => { const lg = WB.group(layer); const L = document.createElementNS(NS, 'g'); lg.appendChild(L);
      WB.mk('circle', { cx: 0, cy: -100, r: 46, fill: '#fffdf3', stroke: INK.black, 'stroke-width': 5 }, L);
      txt(String(i + 1), 0, -73, 82, INK.black, L); return lg; });
    const P = i => slots[i];
    // slot de cada copo no instante t + posição interpolada
    function estado(t) {
      const slotOf = [...Array(n).keys()]; // copo k -> slot
      const pos = slotOf.map(s => ({ ...P(s) })); const lift = Array(n).fill(0);
      for (const rd of R) {
        if (t < rd.t0) break;
        const u = clamp((t - rd.t0) / rd.dur);
        for (const [a, b] of rd.pares) {
          const ka = slotOf.indexOf(a), kb = slotOf.indexOf(b);
          if (u >= 1) { slotOf[ka] = b; slotOf[kb] = a; continue; }
          const e = ease(u), pa = P(a), pb = P(b);
          const dx = pb.x - pa.x, dy = pb.y - pa.y, L = Math.hypot(dx, dy) || 1;
          const nx = -dy / L, ny = dx / L, arc = Math.min(130, L * 0.32) * Math.sin(Math.PI * e);
          pos[ka] = { x: lerp(pa.x, pb.x, e) + nx * arc, y: lerp(pa.y, pb.y, e) + ny * arc };
          pos[kb] = { x: lerp(pb.x, pa.x, e) - nx * arc, y: lerp(pb.y, pa.y, e) - ny * arc };
        }
        for (const [a, b] of rd.pares) if (u >= 1) { /* já trocado */ }
      }
      for (let k = 0; k < n; k++) if (!R.some(rd => t >= rd.t0 && t < rd.t0 + rd.dur && rd.pares.flat().includes(slotOf[k]))) pos[k] = { ...P(slotOf[k]) };
      return { slotOf, pos };
    }
    const ballCup = ballSlot; // o copo que começa no slot da bola guarda a bola
    WB.effect(t => {
      const vis = t >= tShow && t < tOut + 0.35;
      const out = clamp((t - tOut) / 0.35);
      const inn = clamp((t - tShow) / 0.3);
      layer.setAttribute('opacity', vis ? (inn * (1 - out)).toFixed(3) : 0);
      if (!vis) return;
      const { slotOf, pos } = estado(t);
      // levantar: no começo (copo da bola) e na revelação (copo da bola, agora no slot final)
      const upA = ease(clamp((t - tLiftUp) / 0.3)) * (1 - ease(clamp((t - tLiftDown) / 0.3)));
      const upB = ease(clamp((t - tReveal) / 0.3));
      const lift = k => k === ballCup ? 165 * escala * Math.max(upA, upB) : 0;
      const ord = [...Array(n).keys()].sort((a, b) => pos[a].y - pos[b].y);
      ord.forEach(k => cupsG.appendChild(cups[k].g));
      for (let k = 0; k < n; k++) {
        const p = pos[k], l = lift(k);
        const pop = 0.7 + 0.3 * ease(clamp((t - tShow - k * 0.05) / 0.3));
        cups[k].g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${(p.y - l).toFixed(1)}) scale(${(escala * pop).toFixed(3)})`);
        sh[k].setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${escala.toFixed(3)})`);
        // na revelação, os outros copos ficam apagadinhos
        cups[k].g.setAttribute('opacity', (k !== ballCup && t > tReveal ? 1 - 0.55 * clamp((t - tReveal) / 0.3) : 1).toFixed(3));
      }
      const bp = pos[ballCup];
      const bounce = (t > tReveal ? Math.abs(Math.sin((t - tReveal) * 7)) * 18 * Math.max(0, 1 - (t - tReveal) / 1.4) : 0);
      ballG.setAttribute('transform', `translate(${bp.x.toFixed(1)} ${(bp.y - bounce).toFixed(1)}) scale(${escala.toFixed(3)})`);
      const showBall = Math.max(upA, upB) > 0.05;
      ballG.setAttribute('opacity', showBall ? 1 : 0);
      // números nos lugares
      labs.forEach((lg, i) => {
        const a = clamp((t - tNum - i * 0.04) / 0.2) * (t < tReveal ? 1 : 1 - 0.6 * clamp((t - tReveal) / 0.3));
        const k = slotOf.indexOf(i), p = pos[k], l = lift(k);
        lg.setAttribute('transform', `translate(${p.x.toFixed(1)} ${(p.y - l).toFixed(1)}) scale(${(escala * (0.6 + 0.4 * a)).toFixed(3)})`);
        lg.setAttribute('opacity', a.toFixed(3));
      });
      ord.forEach(k => { const i = slotOf[k]; layer.appendChild(labs[i]); });
    });
    return { final: final + 1, R };
  }

  // ---------------- as 3 fases ----------------
  const fimFala = c => tf(c, 1) + 0.05;
  const F1 = fase({
    slots: [{ x: 250, y: 1150 }, { x: 540, y: 1150 }, { x: 830, y: 1150 }], escala: 1.3, ballSlot: 1,
    tShow: -1, tLiftUp: -1, tLiftDown: tf(1, 0.82), tShufA: fimFala(2), tShufB: en(2) - 0.05,
    rodadas: 5, seed: 7, duplas: false, tNum: st(3), tReveal: st(4) + 0.05, tOut: st(5),
  });
  const F2 = fase({
    slots: [{ x: 250, y: 900 }, { x: 540, y: 900 }, { x: 830, y: 900 }, { x: 395, y: 1240 }, { x: 685, y: 1240 }],
    escala: 0.95, ballSlot: 3,
    tShow: st(5) + 0.15, tLiftUp: st(5) + 0.5, tLiftDown: tf(5, 0.8), tShufA: fimFala(5), tShufB: en(5) - 0.05,
    rodadas: 9, seed: 3, duplas: false, tNum: st(6), tReveal: st(7) + 0.05, tOut: st(8),
  });
  const g3 = [];
  for (const y of [790, 1060, 1330]) for (const x of [240, 520, 800]) g3.push({ x, y });
  const F3 = fase({
    slots: g3, escala: 0.78, ballSlot: 4,
    tShow: st(8) + 0.15, tLiftUp: st(8) + 0.4, tLiftDown: tf(8, 0.78), tShufA: fimFala(8), tShufB: en(8) - 0.05,
    rodadas: 13, seed: 11, duplas: true, tNum: st(9), tReveal: st(10) + 0.02, tOut: st(11),
  });
  console.log('respostas', F1.final, F2.final, F3.final);
  window.__RESPOSTAS = [F1.final, F2.final, F3.final];
  window.__SWAPS = [F1.R, F2.R, F3.R].map(R => R.map(r => [r.t0, r.dur, r.pares.length]));

  // ---------------- "QUAL COPO?" + pausa piscando ----------------
  [[3, 1560], [6, 1580], [9, 1600]].forEach(([c, y]) => {
    const g = WB.group(WB.overlay);
    txt('QUAL COPO?', 540, y, 104, INK.red, g);
    WB.effect(t => {
      const a = t >= st(c) && t < st(c + 1) ? 1 : 0;
      const s = 1 + 0.08 * Math.sin((t - st(c)) * 9);
      g.setAttribute('opacity', a);
      g.setAttribute('transform', `translate(540 ${y - 35}) scale(${s.toFixed(3)}) translate(-540 ${-(y - 35)})`);
    });
  });
  // fase 3: "PAUSA AGORA!" com ícone de pause
  {
    const g = WB.group(WB.overlay);
    WB.mk('rect', { x: 330, y: 1650, width: 26, height: 70, rx: 6, fill: INK.black }, g);
    WB.mk('rect', { x: 372, y: 1650, width: 26, height: 70, rx: 6, fill: INK.black }, g);
    txt('pausa se precisar!', 420, 1712, 62, INK.black, g, 'start');
    WB.effect(t => g.setAttribute('opacity', t >= tf(9, 0.45) && t < st(10) && Math.floor((t - st(9)) * 3) % 2 === 0 ? 1 : 0));
  }
  // na revelação: "COPO N" em verde
  [[4, F1.final, 1560], [7, F2.final, 1580], [10, F3.final, 1600]].forEach(([c, num, y]) => {
    const g = WB.group(WB.overlay);
    txt(`era o copo ${num}!`, 540, y, 100, INK.green, g);
    WB.effect(t => g.setAttribute('opacity', t >= st(c) && t < st(c + 1) ? clamp((t - st(c)) / 0.15) : 0));
  });

  // ---------------- final: placar ----------------
  const fim = WB.group(WB.overlay);
  WB.mk('rect', { x: 110, y: 470, width: 860, height: 1010, rx: 36, fill: '#fffdf3', stroke: INK.black, 'stroke-width': 7 }, fim);
  txt('respostas:', 540, 590, 84, INK.black, fim);
  [[`fase 1:  copo ${F1.final}`, INK.green], [`fase 2:  copo ${F2.final}`, INK.orange], [`fase 3:  copo ${F3.final}`, INK.red]]
    .forEach(([s, cor], i) => txt(s, 540, 730 + i * 120, 86, cor, fim));
  WB.showNow(WB.strokePath(WB.wavyLine(220, 860, 1030, 5, 40), INK.gray, 4, fim));
  txt('comenta teu placar:', 540, 1150, 76, INK.black, fim);
  txt('1/3   2/3   3/3', 540, 1290, 120, INK.red, fim);
  txt('(sem mentir, hein!)', 540, 1400, 58, INK.gray, fim);
  WB.effect(t => {
    const a = clamp((t - st(11)) / 0.3);
    fim.setAttribute('opacity', a.toFixed(3));
    const s = 0.9 + 0.1 * ease(a);
    fim.setAttribute('transform', `translate(540 975) scale(${s.toFixed(3)}) translate(-540 -975)`);
  });
};
