// "Põe o dedo na tela 2" (adivinhação pela grade), ~48 s, narração Gemini Algieba (3.1, take único).
// Grade 3 x 4. 1ª andada = nº de letras do desenho; depois +3, +1, +1. Cada desenho apagado é de uma
// "cor de tabuleiro" onde ninguém pode estar naquela hora; no fim todo mundo cai no CHINELO
// (conferido por simulação de todos os começos e caminhos, ver roteiro.md). O chinelo "da tua mãe"
// voa na tela e bate no vidro. Fim "Volta e começa em outro desenho" pede o replay.
window.CENAS = function (WB) {
  const { INK, C, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const D = (t0, t1, st) => { const c = sceneOf(t0); WB.draw(c, fr(c, t0), fr(c, t1), st); };
  const W = (t0, t1, txt, x, y, size, cor, o = {}) => { const c = sceneOf(t0); return WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o }); };
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 6, parent) => WB.strokePath(d, cor, w, parent);
  const circ = (x, y, r) => WB.circlePath(r1(x), r1(y), r);
  const BROWN = '#8a5a2b', PINK = '#e58fb0', GOLD = '#d4a017';
  const fadeOut = (g, ts, d = 0.25) => WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - ts) / d)).toFixed(3)));

  // contagem regressiva grande (só os números, sem mão)
  function countdown(t0, t1, x, y, parent) {
    const n = Math.ceil(t1 - t0 - 0.01);
    const g = WB.group(parent), nums = [];
    for (let k = 1; k <= n; k++) {
      const gk = WB.group(g);
      WB.showNow(WB.textStrokes(String(k), x, y, 130, INK.red, gk, 'middle').strokes);
      gk.setAttribute('opacity', 0); nums.push(gk);
    }
    WB.effect(t => {
      const v = (t >= t0 && t < t1) ? Math.ceil(t1 - t - 0.001) : 0;
      nums.forEach((gk, i) => gk.setAttribute('opacity', i + 1 === v ? 1 : 0));
    });
  }
  // "TUA VEZ!" + contagem, tudo some no fim
  function tuaVez(t0, t1) {
    const g = WB.group();
    W(t0, t0 + 0.45, 'TUA VEZ!', 420, 1560, 96, INK.black, { parent: g });
    countdown(t0 + 0.1, t1, 760, 1575, g);
    fadeOut(g, t1 - 0.05, 0.15);
  }
  const aviso = (t0, t1, tSome, txt, x, y, size, cor) => {
    const g = WB.group(); W(t0, t1, txt, x, y, size, cor, { parent: g }); fadeOut(g, tSome); return g;
  };

  // =====================================================================
  // A GRADE (pronta no 1º quadro)
  // =====================================================================
  const CW = 300, CH = 282, GX = 90, GY = 290;
  const NOMES = [['SORVETE', 'GATO', 'LUA'], ['FLOR', 'PEIXE', 'PIPA'], ['OVO', 'BANANA', 'BALÃO'], ['DADO', 'CHINELO', 'BOLA']];
  const petal = (x, y, a, r0, r2, w) => {
    const P = (r, b) => `${r1(x + r * Math.cos(b))} ${r1(y + r * Math.sin(b))}`;
    return `M ${P(r0, a - w)} Q ${P(r2 * 1.18, a - w * 1.15)} ${P(r2, a)} Q ${P(r2 * 1.18, a + w * 1.15)} ${P(r0, a + w)}`;
  };
  // desenhos centrados em (x, y), cabem em ~±85 px
  const ICON = {
    SORVETE: (x, y) => [
      [`M ${x - 42} ${y - 4} L ${x} ${y + 92} L ${x + 42} ${y - 4}`, BROWN, 7],
      [`M ${x - 30} ${y + 22} L ${x + 8} ${y + 4} M ${x - 18} ${y + 50} L ${x + 30} ${y + 26} M ${x - 22} ${y + 8} L ${x + 16} ${y + 66} M ${x + 6} ${y + 2} L ${x + 30} ${y + 34}`, BROWN, 4],
      [`M ${x - 52} ${y - 4} Q ${x - 62} ${y - 78} ${x} ${y - 78} Q ${x + 62} ${y - 78} ${x + 52} ${y - 4} Q ${x + 36} ${y + 10} ${x + 18} ${y - 4} Q ${x} ${y + 12} ${x - 18} ${y - 4} Q ${x - 36} ${y + 10} ${x - 52} ${y - 4}`, PINK, 7],
      [circ(x + 4, y - 90, 11), INK.red, 6], [`M ${x + 6} ${y - 101} Q ${x + 12} ${y - 114} ${x + 24} ${y - 116}`, INK.green, 4],
    ],
    GATO: (x, y) => [
      [`M ${x - 50} ${y - 12} L ${x - 46} ${y - 70} L ${x - 14} ${y - 44} Q ${x} ${y - 49} ${x + 14} ${y - 44} L ${x + 46} ${y - 70} L ${x + 50} ${y - 12} Q ${x + 64} ${y + 32} ${x + 36} ${y + 56} Q ${x} ${y + 74} ${x - 36} ${y + 56} Q ${x - 64} ${y + 32} ${x - 50} ${y - 12} Z`, INK.orange, 7],
      [circ(x - 21, y + 4, 7), INK.black, 7], [circ(x + 21, y + 4, 7), INK.black, 7],
      [`M ${x - 7} ${y + 22} L ${x + 7} ${y + 22} L ${x} ${y + 30} Z`, PINK, 5],
      [`M ${x} ${y + 30} Q ${x - 6} ${y + 42} ${x - 16} ${y + 38} M ${x} ${y + 30} Q ${x + 6} ${y + 42} ${x + 16} ${y + 38}`, INK.black, 4],
      [`M ${x - 26} ${y + 26} L ${x - 74} ${y + 18} M ${x - 26} ${y + 34} L ${x - 72} ${y + 42} M ${x + 26} ${y + 26} L ${x + 74} ${y + 18} M ${x + 26} ${y + 34} L ${x + 72} ${y + 42}`, INK.black, 3],
    ],
    LUA: (x, y) => [
      [`M ${x + 18} ${y - 72} A 74 74 0 1 0 ${x + 18} ${y + 72} A 58 58 0 1 1 ${x + 18} ${y - 72} Z`, GOLD, 7],
      [`M ${x + 52} ${y - 52} L ${x + 52} ${y - 28} M ${x + 40} ${y - 40} L ${x + 64} ${y - 40}`, GOLD, 5],
      [`M ${x + 62} ${y + 20} L ${x + 62} ${y + 40} M ${x + 52} ${y + 30} L ${x + 72} ${y + 30}`, GOLD, 5],
    ],
    FLOR: (x, y) => [
      [`M ${x} ${y + 10} Q ${x - 6} ${y + 50} ${x} ${y + 95}`, INK.green, 7],
      [`M ${x - 2} ${y + 62} Q ${x + 30} ${y + 34} ${x + 50} ${y + 46} Q ${x + 30} ${y + 72} ${x - 2} ${y + 62}`, INK.green, 5],
      [Array.from({ length: 6 }, (_, i) => petal(x, y - 25, -Math.PI / 2 + i * Math.PI / 3, 20, 62, 0.42)).join(' '), INK.red, 6],
      [circ(x, y - 25, 18), GOLD, 7],
    ],
    PEIXE: (x, y) => [[`M ${x - 62} ${y} Q ${x - 5} ${y - 58} ${x + 42} ${y} Q ${x - 5} ${y + 58} ${x - 62} ${y}`, INK.blue, 7], [`M ${x + 38} ${y} L ${x + 80} ${y - 36} L ${x + 80} ${y + 36} Z`, INK.blue, 7],
      [circ(x - 34, y - 8, 6), INK.black, 6], [`M ${x - 10} ${y - 24} Q ${x + 4} ${y} ${x - 10} ${y + 24}`, INK.blue, 5]],
    PIPA: (x, y) => [
      [`M ${x} ${y - 82} L ${x + 50} ${y - 18} L ${x} ${y + 50} L ${x - 50} ${y - 18} Z`, INK.red, 7],
      [`M ${x} ${y - 82} L ${x} ${y + 50} M ${x - 50} ${y - 18} L ${x + 50} ${y - 18}`, INK.gray, 4],
      [`M ${x} ${y + 50} Q ${x + 24} ${y + 64} ${x + 2} ${y + 78} Q ${x - 22} ${y + 92} ${x + 6} ${y + 100}`, INK.black, 4],
      [`M ${x + 2} ${y + 78} L ${x - 14} ${y + 70} L ${x - 12} ${y + 86} Z M ${x + 2} ${y + 78} L ${x + 18} ${y + 72} L ${x + 16} ${y + 88} Z`, INK.blue, 4],
    ],
    OVO: (x, y) => [
      [`M ${x - 66} ${y + 2} Q ${x - 72} ${y - 48} ${x - 22} ${y - 50} Q ${x + 10} ${y - 70} ${x + 46} ${y - 46} Q ${x + 78} ${y - 20} ${x + 62} ${y + 20} Q ${x + 56} ${y + 60} ${x + 6} ${y + 56} Q ${x - 42} ${y + 66} ${x - 60} ${y + 36} Q ${x - 72} ${y + 18} ${x - 66} ${y + 2} Z`, INK.gray, 6],
      [circ(x - 2, y + 2, 26), INK.orange, 8], [`M ${x - 14} ${y - 8} Q ${x - 8} ${y - 16} ${x} ${y - 16}`, INK.white, 5],
    ],
    BANANA: (x, y) => [
      [`M ${x - 58} ${y - 40} Q ${x - 52} ${y + 52} ${x + 58} ${y + 26} Q ${x + 72} ${y + 20} ${x + 66} ${y + 8} Q ${x - 16} ${y + 26} ${x - 38} ${y - 46} Z`, GOLD, 7],
      [`M ${x - 58} ${y - 40} L ${x - 62} ${y - 58} L ${x - 44} ${y - 62} L ${x - 38} ${y - 46}`, BROWN, 6],
      [`M ${x - 46} ${y - 18} Q ${x - 30} ${y + 26} ${x + 30} ${y + 24}`, GOLD, 4],
    ],
    BALÃO: (x, y) => [
      [`M ${x} ${y - 88} C ${x + 64} ${y - 88} ${x + 62} ${y + 6} ${x} ${y + 30} C ${x - 62} ${y + 6} ${x - 64} ${y - 88} ${x} ${y - 88} Z`, INK.red, 7],
      [`M ${x - 7} ${y + 40} L ${x} ${y + 30} L ${x + 7} ${y + 40} Z`, INK.red, 5],
      [`M ${x} ${y + 40} Q ${x + 16} ${y + 60} ${x} ${y + 76} Q ${x - 16} ${y + 92} ${x + 2} ${y + 104}`, INK.black, 4],
      [`M ${x - 30} ${y - 52} Q ${x - 28} ${y - 68} ${x - 14} ${y - 72}`, INK.red, 5],
    ],
    DADO: (x, y) => [
      [`M ${x - 52} ${y - 22} L ${x + 28} ${y - 22} L ${x + 28} ${y + 58} L ${x - 52} ${y + 58} Z`, INK.black, 6],
      [`M ${x - 52} ${y - 22} L ${x - 24} ${y - 50} L ${x + 56} ${y - 50} L ${x + 28} ${y - 22} M ${x + 28} ${y + 58} L ${x + 56} ${y + 30} L ${x + 56} ${y - 50}`, INK.black, 6],
      [circ(x - 32, y - 2, 5), INK.red, 8], [circ(x - 12, y + 18, 5), INK.red, 8], [circ(x + 8, y + 38, 5), INK.red, 8],
      [circ(x + 16, y - 36, 4), INK.red, 7], [circ(x + 42, y + 4, 4), INK.red, 7],
    ],
    CHINELO: (x, y) => [
      [`M ${x} ${y - 88} C ${x + 44} ${y - 88} ${x + 50} ${y - 34} ${x + 38} ${y + 6} C ${x + 30} ${y + 38} ${x + 44} ${y + 82} ${x} ${y + 90} C ${x - 44} ${y + 82} ${x - 30} ${y + 38} ${x - 38} ${y + 6} C ${x - 50} ${y - 34} ${x - 44} ${y - 88} ${x} ${y - 88} Z`, INK.blue, 7],
      [`M ${x - 38} ${y + 4} Q ${x - 22} ${y - 40} ${x} ${y - 54} Q ${x + 22} ${y - 40} ${x + 38} ${y + 4}`, INK.green, 9],
      [circ(x, y - 54, 6), INK.green, 7],
    ],
    BOLA: (x, y) => [[circ(x, y, 66), INK.black, 6], [`M ${x - 20} ${y - 15} L ${x} ${y - 30} L ${x + 20} ${y - 15} L ${x + 13} ${y + 10} L ${x - 13} ${y + 10} Z`, INK.black, 6],
      [`M ${x} ${y - 30} L ${x} ${y - 66} M ${x + 20} ${y - 15} L ${x + 62} ${y - 25} M ${x + 13} ${y + 10} L ${x + 36} ${y + 54} M ${x - 13} ${y + 10} L ${x - 36} ${y + 54} M ${x - 20} ${y - 15} L ${x - 62} ${y - 25}`, INK.black, 5]],
  };
  const pg1 = WB.group();
  const CELL = {};
  NOMES.forEach((linha, r) => linha.forEach((nome, c) => {
    const x0 = GX + c * CW, y0 = GY + r * CH, cx = x0 + CW / 2, iy = y0 + 112;
    const g = WB.group(pg1);
    const box = sp(WB.roughRect(x0 + 6, y0 + 6, x0 + CW - 6, y0 + CH - 6), INK.black, 4, g);
    const gi = WB.group(g);
    const ic = ICON[nome](cx, iy).map(([d, cor, w]) => sp(d, cor, w, gi));
    const lb = WB.textStrokes(nome, cx, y0 + CH - 26, 54, INK.black, g, 'middle').strokes;
    WB.showNow([box, ic, lb]);
    CELL[nome] = { g, gi, x0, y0, cx, cy: y0 + CH / 2, iy };
  }));
  // apaga um desenho: rabisco cinza por cima e o desenho some
  const apaga = (t, nome, d = 0.3) => {
    const k = CELL[nome];
    D(t, t + d, [sp(WB.zigzagHatch(k.x0 + 24, k.y0 + 24, k.x0 + CW - 24, k.y0 + CH - 24, 36), INK.gray, 6, pg1)]);
    WB.effect(tt => k.g.setAttribute('opacity', (1 - 0.85 * clamp((tt - t - 0.05) / 0.3)).toFixed(3)));
  };

  // título fixo do topo (desde o quadro 0)
  const tit = WB.group(pg1);
  WB.showNow(WB.textStrokes('PÕE O DEDO!', 540, 215, 120, INK.red, tit, 'middle').strokes);

  // ---- cena 1: gancho
  aviso(2.3, 3.6, 4.3, 'eu adivinho onde ele PARA', 540, 1560, 76, INK.blue);
  rest(3.7, 4.3);
  // ---- cena 2: a regra
  aviso(4.85, 5.75, 7.75, 'conta as LETRAS', 540, 1530, 84, INK.blue);
  aviso(6.4, 7.5, 7.75, 'e anda isso de casas', 540, 1625, 64, INK.gray);
  const setas = WB.group();
  D(7.85, 9.25, [C.arrow(260, 1640, 260, 1520, INK.green, 7, setas), C.arrow(380, 1520, 380, 1640, INK.green, 7, setas),
    C.arrow(560, 1580, 460, 1580, INK.green, 7, setas), C.arrow(600, 1580, 700, 1580, INK.green, 7, setas)]);
  D(9.5, 9.85, [C.arrow(800, 1640, 880, 1530, INK.gray, 7, setas)]);
  D(9.95, 10.3, [sp(WB.roughLine(790, 1530, 890, 1640, 3), INK.red, 11, setas), sp(WB.roughLine(890, 1530, 790, 1640, 3), INK.red, 11, setas)]);
  fadeOut(setas, 10.75);
  rest(10.35, 10.8);
  // ---- cena 3: exemplo no OVO: 1 FLOR, 2 SORVETE, 3 GATO
  const ex = WB.group();
  D(11.2, 11.65, [sp(WB.loopEllipse(CELL.OVO.cx, CELL.OVO.cy, 132, 128), INK.red, 7, ex)]);
  W(11.95, 12.7, 'O-V-O = 3', 540, 1560, 92, INK.red, { parent: ex });
  const p = n => [CELL[n].cx, CELL[n].cy];
  const [ox, oy] = p('OVO'), [fx, fy] = p('FLOR'), [sx, sy] = p('SORVETE'), [gx, gy] = p('GATO');
  const hop = [
    [C.curvedArrow(ox + 60, oy - 70, ox + 95, (oy + fy) / 2, fx + 60, fy + 70, INK.red, 7, ex), 13.05, '1', fx + 100, fy + 40],
    [C.curvedArrow(fx + 60, fy - 70, fx + 95, (fy + sy) / 2, sx + 60, sy + 70, INK.red, 7, ex), 13.6, '2', sx + 100, sy + 40],
    [C.curvedArrow(sx + 70, sy - 40, (sx + gx) / 2, sy - 95, gx - 70, gy - 40, INK.red, 7, ex), 14.06, '3', gx + 70, gy - 60],
  ];
  hop.forEach(([arr, t0, n, nx, ny]) => { D(t0, t0 + 0.22, arr); W(t0 + 0.24, t0 + 0.42, n, nx, ny, 96, INK.red, { parent: ex }); });
  const nc = aviso(14.75, 15.75, 16.1, 'onde tu tá NÃO conta!', 540, 1660, 66, INK.red);
  fadeOut(ex, 16.1);
  tuaVez(16.2, 19.0);
  // ---- cena 4
  apaga(20.5, 'SORVETE'); apaga(21.5, 'LUA');
  rest(21.85, 22.2);
  // ---- cena 5: +3
  aviso(22.55, 23.3, 25.05, '+3 casas', 540, 1540, 110, INK.purple);
  aviso(23.85, 24.9, 25.05, 'apagada NÃO vale', 540, 1650, 70, INK.gray);
  tuaVez(25.15, 28.15);
  // ---- cena 6
  apaga(28.9, 'GATO'); apaga(29.75, 'PIPA'); apaga(30.58, 'FLOR');
  rest(30.92, 31.2);
  // ---- cena 7: +1
  aviso(31.25, 31.85, 32.0, '+1', 540, 1560, 130, INK.purple);
  tuaVez(32.05, 33.45);
  // ---- cena 8
  apaga(34.0, 'PEIXE', 0.28); apaga(34.68, 'OVO', 0.28); apaga(35.32, 'BALÃO', 0.28);
  rest(35.62, 35.85);
  // ---- cena 9: última
  aviso(35.9, 36.5, 38.25, 'ÚLTIMA!', 360, 1570, 104, INK.red);
  aviso(36.6, 37.05, 38.25, '+1', 720, 1575, 130, INK.purple);
  rest(37.1, 37.6);
  apaga(37.62, 'DADO', 0.2); apaga(37.85, 'BANANA', 0.2); apaga(38.08, 'BOLA', 0.2);
  D(38.4, 38.85, [sp(WB.loopEllipse(CELL.CHINELO.cx, CELL.CHINELO.cy, 140, 130), INK.red, 9, pg1)]);
  const achei = WB.group(pg1);
  W(38.9, 39.4, 'ACHEI!', 540, 1610, 120, INK.red, { parent: achei });
  fadeOut(achei, 40.7, 0.08);

  // ---- cena 10: o chinelo voa na tela e bate no vidro
  const TV = 39.55, TH = 40.75;   // começa a voar / bate
  const k = CELL.CHINELO;
  WB.effect(t => k.gi.setAttribute('opacity', t >= TV ? 0 : 1));
  const fly = WB.mk('g', { opacity: 0 }, WB.overlay);
  const flyIn = WB.group(fly);
  const solaD = ICON.CHINELO(0, 0)[0][0];
  WB.mk('path', { d: solaD, fill: '#dde8ff', stroke: 'none' }, flyIn);
  const flyStrokes = ICON.CHINELO(0, 0).map(([d, cor, w]) => sp(d, cor, w * 2.2, flyIn));
  WB.showNow(flyStrokes);
  flyIn.querySelectorAll('path').forEach(el => { el.setAttribute('vector-effect', 'non-scaling-stroke'); el.style.strokeDasharray = 'none'; });
  const crack = WB.mk('g', { opacity: 0 }, WB.overlay);
  {
    const cxk = 560, cyk = 900;
    const rays = Array.from({ length: 9 }, (_, i) => {
      const a = i * 2 * Math.PI / 9 + 0.3; let d = `M ${cxk} ${cyk}`; let r = 0;
      for (let j = 1; j <= 4; j++) { r += 90 + 40 * Math.sin(i * 7 + j); const aj = a + 0.18 * Math.sin(i * 3 + j * 2); d += ` L ${r1(cxk + r * Math.cos(aj))} ${r1(cyk + r * Math.sin(aj))}`; }
      return d;
    }).join(' ');
    WB.showNow(sp(rays, INK.black, 7, crack));
    WB.showNow(sp(circ(cxk, cyk, 60), INK.black, 4, crack));
    WB.showNow(WB.textStrokes('CORRE!!', 540, 1560, 190, INK.red, crack, 'middle').strokes);
  }
  WB.effect(t => {
    const u = clamp((t - TV) / (TH - TV));
    const e = u * u;   // acelera chegando na tela
    const x = lerp(k.cx, 560, e), y = lerp(k.iy, 900, e);
    const s = lerp(1, 7.5, e), rot = lerp(0, 540, ease(u)) - 20;
    const wob = t > TH ? Math.sin((t - TH) * 40) * 8 * Math.exp(-(t - TH) * 6) : 0;
    fly.setAttribute('opacity', t >= TV ? 1 : 0);
    flyIn.setAttribute('transform', `translate(${r1(x + wob)} ${r1(y)}) rotate(${r1(t > TH ? -20 : rot)}) scale(${s.toFixed(3)})`);
    crack.setAttribute('opacity', t >= TH ? 1 : 0);
    const sh = t > TH && t < TH + 0.45 ? Math.sin((t - TH) * 70) * 18 * (1 - (t - TH) / 0.45) : 0;
    pg1.setAttribute('transform', `translate(${r1(sh)} ${r1(sh * 0.6)})`);
    const fim = 1 - clamp((t - S[10].start + 0.05) / 0.2);
    fly.setAttribute('opacity', (t >= TV ? fim : 0).toFixed(3));
    crack.setAttribute('opacity', (t >= TH ? fim : 0).toFixed(3));
  });

  // =====================================================================
  // FOLHA 2: pergunta + replay (cena 11)
  // =====================================================================
  WB.newPage(11, 0, 0.04);
  W(42.35, 42.95, 'Acertei?', 540, 520, 160, INK.black);
  W(43.0, 43.7, 'COMENTA AÍ', 540, 720, 116, INK.blue);
  W(43.95, 44.6, 'Duvida?', 540, 1020, 124, INK.gray);
  W(44.8, 45.3, 'VOLTA', 540, 1250, 180, INK.orange);
  W(45.4, 46.5, 'e começa em OUTRO desenho', 540, 1420, 86, INK.red);
  rest(46.6, 47.2);

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA (faixa de baixo, fora da grade)
  // =====================================================================
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[290, 1770], [790, 1770], [540, 1800], [300, 1760]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const n = Math.floor(t / CYC), u = clamp((t - n * CYC - HOLD) / MOVE);
      const a = SPOTS[n % 4], b = SPOTS[(n + 1) % 4], e = ease(u);
      const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.2) / 0.3) * 0.95).toFixed(3));
    });
  }
};
