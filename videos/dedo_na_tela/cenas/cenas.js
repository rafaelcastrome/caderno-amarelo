// "Põe o dedo na tela" (adivinhação pela grade), ~53 s, narração Gemini Charon.
// Grade 3 x 4. A 1ª andada é o nº de letras do desenho; depois +3, +1, +3, +1. Cada desenho apagado é
// de uma "cor de tabuleiro" onde ninguém pode estar naquela hora, e no fim todo mundo cai na GIRAFA
// (conferido por simulação de todos os começos e caminhos; ver roteiro.md). O segredo não é contado.
// Fim "Volta... e começa em outro desenho!" emenda no começo. A marca d'água passeia como nos outros.
window.CENAS = function (WB) {
  const { INK, C, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const D = (c, t0, t1, st) => WB.draw(c, fr(c, t0), fr(c, t1), st);
  const W = (c, t0, t1, txt, x, y, size, cor, o = {}) => WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o });
  const rest = (c, t0, t1) => WB.restHand(c, fr(c, t0), fr(c, t1));
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 6, parent) => WB.strokePath(d, cor, w, parent);
  const fill = (tag, attrs, parent) => WB.mk(tag, { stroke: 'none', ...attrs }, parent);
  const circ = (x, y, r) => WB.circlePath(r1(x), r1(y), r);

  function countdown(t0, t1, x, y, parent) {
    const n = Math.ceil(t1 - t0);
    const g = WB.group(parent);
    const nums = [];
    for (let k = 1; k <= n; k++) {
      const gk = WB.group(g);
      WB.showNow(WB.textStrokes(String(k), x, y, 110, INK.gray, gk, 'middle').strokes);
      gk.setAttribute('opacity', 0);
      nums.push(gk);
    }
    WB.effect(t => {
      const v = (t >= t0 && t < t1) ? Math.ceil(t1 - t) : 0;
      nums.forEach((gk, i) => gk.setAttribute('opacity', i + 1 === v ? 1 : 0));
    });
  }
  // texto que some numa hora certa (a faixa de baixo é reaproveitada)
  const aviso = (c, t0, t1, tSome, txt, y, size, cor) => {
    const g = WB.group();
    W(c, t0, t1, txt, 540, y, size, cor, { parent: g });
    WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - tSome) / 0.3)).toFixed(3)));
  };

  // =====================================================================
  // A GRADE (aparece pronta no 1º quadro)
  // =====================================================================
  const CW = 205, CH = 270, GX = 130, GY = 400;
  const NOMES = [['PIZZA', 'BOLA', 'PEIXE', 'PATO'], ['CASA', 'UVA', 'SAPO', 'CHAVE'], ['SOL', 'GIRAFA', 'LIVRO', 'VACA']];
  // desenhos simples centrados em (x, y), cabem em ~±75 px
  const ICON = {
    PIZZA: (x, y) => [[`M ${x - 65} ${y - 45} L ${x + 65} ${y - 45} L ${x} ${y + 70} Z`, INK.orange, 6], [`M ${x - 70} ${y - 45} Q ${x} ${y - 75} ${x + 70} ${y - 45}`, '#8a5a2b', 9],
      [circ(x - 22, y - 18, 13), INK.red, 6], [circ(x + 20, y - 12, 13), INK.red, 6], [circ(x, y + 25, 11), INK.red, 6]],
    BOLA: (x, y) => [[circ(x, y, 65), INK.black, 6], [`M ${x - 20} ${y - 15} L ${x} ${y - 30} L ${x + 20} ${y - 15} L ${x + 13} ${y + 10} L ${x - 13} ${y + 10} Z`, INK.black, 6],
      [`M ${x} ${y - 30} L ${x} ${y - 65} M ${x + 20} ${y - 15} L ${x + 60} ${y - 25} M ${x + 13} ${y + 10} L ${x + 35} ${y + 52} M ${x - 13} ${y + 10} L ${x - 35} ${y + 52} M ${x - 20} ${y - 15} L ${x - 60} ${y - 25}`, INK.black, 5]],
    PEIXE: (x, y) => [[`M ${x - 55} ${y} Q ${x} ${y - 55} ${x + 45} ${y} Q ${x} ${y + 55} ${x - 55} ${y}`, INK.blue, 7], [`M ${x + 40} ${y} L ${x + 80} ${y - 35} L ${x + 80} ${y + 35} Z`, INK.blue, 7],
      [circ(x - 28, y - 8, 6), INK.black, 6], [`M ${x - 5} ${y - 22} Q ${x + 8} ${y} ${x - 5} ${y + 22}`, INK.blue, 5]],
    PATO: (x, y) => [[`M ${x - 65} ${y + 10} Q ${x - 55} ${y + 65} ${x + 10} ${y + 60} Q ${x + 65} ${y + 55} ${x + 50} ${y + 10} Q ${x - 10} ${y + 25} ${x - 65} ${y + 10}`, INK.orange, 7],
      [circ(x + 30, y - 30, 30), INK.orange, 7], [`M ${x + 58} ${y - 32} L ${x + 85} ${y - 25} L ${x + 58} ${y - 18}`, INK.red, 6], [circ(x + 36, y - 38, 5), INK.black, 6]],
    CASA: (x, y) => [[`M ${x - 55} ${y - 10} L ${x - 55} ${y + 65} L ${x + 55} ${y + 65} L ${x + 55} ${y - 10}`, INK.black, 6], [`M ${x - 72} ${y - 5} L ${x} ${y - 70} L ${x + 72} ${y - 5}`, INK.red, 7],
      [`M ${x - 15} ${y + 65} L ${x - 15} ${y + 22} L ${x + 15} ${y + 22} L ${x + 15} ${y + 65}`, INK.blue, 6]],
    UVA: (x, y) => [[`M ${x} ${y - 55} Q ${x + 8} ${y - 75} ${x + 25} ${y - 78}`, '#8a5a2b', 6],
      ...[[-26, -35], [0, -35], [26, -35], [-13, -8], [13, -8], [-26, 19], [0, 19], [26, 19], [-13, 46], [13, 46]].map(([dx, dy]) => [circ(x + dx, y + dy, 14), INK.purple, 6])],
    SAPO: (x, y) => [[`M ${x - 70} ${y + 30} Q ${x - 70} ${y - 30} ${x} ${y - 30} Q ${x + 70} ${y - 30} ${x + 70} ${y + 30} Q ${x} ${y + 70} ${x - 70} ${y + 30}`, INK.green, 7],
      [circ(x - 32, y - 40, 20), INK.green, 6], [circ(x + 32, y - 40, 20), INK.green, 6], [circ(x - 32, y - 40, 5), INK.black, 6], [circ(x + 32, y - 40, 5), INK.black, 6],
      [`M ${x - 35} ${y + 18} Q ${x} ${y + 40} ${x + 35} ${y + 18}`, INK.black, 5]],
    CHAVE: (x, y) => [[circ(x - 45, y, 28), INK.orange, 7], [`M ${x - 17} ${y} L ${x + 75} ${y}`, INK.orange, 8],
      [`M ${x + 45} ${y} L ${x + 45} ${y + 25} M ${x + 65} ${y} L ${x + 65} ${y + 20}`, INK.orange, 8], [circ(x - 45, y, 9), INK.orange, 5]],
    SOL: (x, y) => [[circ(x, y, 38), INK.orange, 7],
      [Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `M ${r1(x + 50 * Math.cos(a))} ${r1(y + 50 * Math.sin(a))} L ${r1(x + 72 * Math.cos(a))} ${r1(y + 72 * Math.sin(a))}`; }).join(' '), INK.orange, 6]],
    GIRAFA: (x, y) => [[`M ${x - 45} ${y + 70} L ${x - 45} ${y + 30} Q ${x - 45} ${y + 10} ${x - 20} ${y + 10} L ${x + 15} ${y + 10} L ${x + 15} ${y + 70}`, INK.orange, 7],
      [`M ${x - 5} ${y + 10} L ${x + 15} ${y - 50} M ${x + 15} ${y + 10} L ${x + 33} ${y - 45}`, INK.orange, 7],
      [`M ${x + 8} ${y - 50} Q ${x + 20} ${y - 75} ${x + 60} ${y - 62} Q ${x + 65} ${y - 45} ${x + 33} ${y - 42}`, INK.orange, 7],
      [`M ${x + 18} ${y - 68} L ${x + 15} ${y - 85} M ${x + 32} ${y - 70} L ${x + 32} ${y - 87}`, '#8a5a2b', 6],
      [circ(x + 35, y - 58, 4), INK.black, 6], [circ(x - 25, y + 35, 7), '#8a5a2b', 6], [circ(x - 2, y + 30, 6), '#8a5a2b', 6], [circ(x + 12, y - 20, 5), '#8a5a2b', 6]],
    LIVRO: (x, y) => [[`M ${x} ${y - 45} Q ${x - 35} ${y - 60} ${x - 70} ${y - 45} L ${x - 70} ${y + 50} Q ${x - 35} ${y + 35} ${x} ${y + 50} Z`, INK.blue, 6],
      [`M ${x} ${y - 45} Q ${x + 35} ${y - 60} ${x + 70} ${y - 45} L ${x + 70} ${y + 50} Q ${x + 35} ${y + 35} ${x} ${y + 50}`, INK.blue, 6],
      [`M ${x - 55} ${y - 20} L ${x - 15} ${y - 20} M ${x - 55} ${y} L ${x - 15} ${y} M ${x + 15} ${y - 20} L ${x + 55} ${y - 20} M ${x + 15} ${y} L ${x + 55} ${y}`, INK.gray, 4]],
    VACA: (x, y) => [[`M ${x - 45} ${y - 40} Q ${x} ${y - 60} ${x + 45} ${y - 40} L ${x + 40} ${y + 30} Q ${x} ${y + 45} ${x - 40} ${y + 30} Z`, INK.black, 6],
      [`M ${x - 45} ${y - 40} L ${x - 65} ${y - 62} M ${x + 45} ${y - 40} L ${x + 65} ${y - 62}`, INK.gray, 7],
      [`M ${x - 35} ${y + 25} Q ${x} ${y + 75} ${x + 35} ${y + 25}`, '#e58fb0', 7], [circ(x - 12, y + 42, 4), INK.black, 5], [circ(x + 12, y + 42, 4), INK.black, 5],
      [circ(x - 18, y - 15, 6), INK.black, 6], [circ(x + 18, y - 15, 6), INK.black, 6], [`M ${x + 15} ${y - 48} Q ${x + 40} ${y - 40} ${x + 30} ${y - 22} Q ${x + 18} ${y - 30} ${x + 15} ${y - 48}`, INK.black, 6]],
  };
  const pg1 = WB.group();
  const CELL = {};
  NOMES.forEach((linha, r) => linha.forEach((nome, c) => {
    const x0 = GX + c * CW, y0 = GY + r * CH, cx = x0 + CW / 2;
    const g = WB.group(pg1);
    const box = sp(WB.roughRect(x0 + 6, y0 + 6, x0 + CW - 6, y0 + CH - 6), INK.black, 4, g);
    const ic = ICON[nome](cx, y0 + 110).map(([d, cor, w]) => sp(d, cor, w, g));
    const lb = WB.textStrokes(nome, cx, y0 + CH - 32, 50, INK.black, g, 'middle').strokes;
    WB.showNow([box, ic, lb]);
    CELL[nome] = { g, x0, y0, cx, cy: y0 + CH / 2 };
  }));
  // apaga um desenho: rabisco cinza por cima e o desenho some
  const apaga = (c, t, nome) => {
    const k = CELL[nome];
    const hatch = [sp(WB.zigzagHatch(k.x0 + 22, k.y0 + 22, k.x0 + CW - 22, k.y0 + CH - 22, 34), INK.gray, 6, pg1)];
    D(c, t, t + 0.32, hatch);
    WB.effect(tt => k.g.setAttribute('opacity', (1 - 0.85 * clamp((tt - t - 0.05) / 0.3)).toFixed(3)));
  };

  // cena 1: gancho
  W(1, 0.15, 1.3, 'PÕE O DEDO!', 540, 320, 108, INK.red, { parent: pg1 });
  rest(1, 1.4, 4.5);
  // cena 2: a regra
  aviso(2, 5.5, 6.7, 11.7, 'conta as LETRAS', 1310, 76, INK.blue);
  aviso(2, 7.25, 8.2, 11.7, 'e anda isso de casas', 1400, 64, INK.gray);
  const setas = WB.group();
  D(2, 8.65, 10.3, [C.arrow(330, 1520, 330, 1450, INK.green, 6, setas), C.arrow(430, 1450, 430, 1520, INK.green, 6, setas),
    C.arrow(570, 1485, 500, 1485, INK.green, 6, setas), C.arrow(610, 1485, 680, 1485, INK.green, 6, setas)]);
  D(2, 10.7, 10.95, [C.arrow(760, 1520, 820, 1460, INK.gray, 6, setas)]);
  D(2, 11.0, 11.3, [sp(WB.roughLine(752, 1452, 828, 1528, 3), INK.red, 10, setas), sp(WB.roughLine(828, 1452, 752, 1528, 3), INK.red, 10, setas)]);
  WB.effect(t => setas.setAttribute('opacity', (1 - clamp((t - 11.7) / 0.3)).toFixed(3)));
  rest(2, 11.35, 11.8);
  // cena 3: exemplo no SOL (some antes da contagem acabar)
  const ex = WB.group();
  const exL = [sp(WB.loopEllipse(CELL.SOL.cx, CELL.SOL.cy, 92, 120), INK.red, 7, ex)];
  D(3, 12.6, 13.0, exL);
  W(3, 13.05, 13.6, 'S-O-L = 3', 540, 1330, 76, INK.red, { parent: ex });
  const p = (n) => [CELL[n].cx, CELL[n].cy];
  const [sx, sy] = p('SOL'), [cx1, cy1] = p('CASA'), [px, py] = p('PIZZA'), [bx, by] = p('BOLA');
  const caminho = [C.curvedArrow(sx + 30, sy - 60, sx + 50, (sy + cy1) / 2, cx1 + 30, cy1 + 60, INK.red, 6, ex),
    C.curvedArrow(cx1 + 30, cy1 - 60, cx1 + 50, (cy1 + py) / 2, px + 30, py + 60, INK.red, 6, ex),
    C.curvedArrow(px + 60, py - 20, (px + bx) / 2, py - 60, bx - 60, by - 20, INK.red, 6, ex)];
  D(3, 13.65, 14.6, caminho);
  WB.effect(t => ex.setAttribute('opacity', (1 - clamp((t - 15.6) / 0.4)).toFixed(3)));
  rest(3, 14.7, 17.3);
  countdown(14.4, 17.43, 540, 1560);
  // cena 4
  apaga(4, 19.0, 'PIZZA'); apaga(4, 19.95, 'PEIXE');
  rest(4, 20.35, 20.65);
  // cena 5
  aviso(5, 20.95, 22.25, 26.4, 'apagou? NÃO VALE', 1330, 72, INK.gray);
  aviso(5, 22.45, 23.0, 26.4, '+3', 1450, 110, INK.purple);
  rest(5, 23.1, 26.4);
  countdown(23.5, 26.5, 540, 1580);
  // cena 6
  apaga(6, 27.35, 'BOLA'); apaga(6, 28.25, 'PATO'); apaga(6, 29.2, 'CASA');
  rest(6, 29.6, 30.2);
  // cena 7
  aviso(7, 30.5, 30.95, 32.9, '+1', 1450, 110, INK.purple);
  rest(7, 31.05, 32.9);
  countdown(30.97, 32.97, 540, 1580);
  // cena 8
  apaga(8, 33.65, 'CHAVE');
  rest(8, 34.0, 34.4);
  // cena 9
  aviso(9, 34.75, 35.25, 38.45, '+3', 1450, 110, INK.purple);
  rest(9, 35.35, 38.4);
  countdown(35.52, 38.52, 540, 1580);
  // cena 10
  apaga(10, 39.25, 'SAPO'); apaga(10, 40.15, 'VACA');
  rest(10, 40.5, 40.9);
  // cena 11
  aviso(11, 41.2, 41.8, 44.5, 'ÚLTIMA!', 1330, 80, INK.red);
  aviso(11, 41.9, 42.35, 44.5, '+1', 1450, 110, INK.purple);
  rest(11, 42.45, 44.4);
  countdown(42.59, 44.59, 540, 1580);
  // cena 12: revelação
  apaga(12, 44.7, 'UVA'); apaga(12, 45.05, 'SOL'); apaga(12, 45.4, 'LIVRO');
  D(12, 45.75, 46.15, [sp(WB.loopEllipse(CELL.GIRAFA.cx, CELL.GIRAFA.cy, 100, 128), INK.red, 8)]);
  W(12, 46.2, 46.8, 'ACHEI!', 540, 1420, 120, INK.red);

  // =====================================================================
  // FOLHA 2 — CTA + loop (cena 13)
  // =====================================================================
  WB.newPage(13, 0, 0.06);
  W(13, 47.3, 48.0, 'Acertei?', 540, 380, 100, INK.black);
  W(13, 48.05, 48.7, 'COMENTA:', 540, 500, 84, INK.gray);
  W(13, 48.75, 49.15, 'SIM', 330, 630, 112, INK.green);
  W(13, 49.2, 49.75, 'ou NÃO', 640, 630, 100, INK.red);
  WB.ctaRedes(13, fr(13, 49.8), fr(13, 50.6), { y: 700, titulo: 'Me segue!', iconSize: 150 });
  W(13, 50.7, 51.2, 'VOLTA', 540, 1300, 120, INK.orange);
  W(13, 51.25, 52.4, 'e começa em OUTRO', 540, 1420, 84, INK.red);
  rest(13, 52.5, 53.0);

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA (só entre os pontos de baixo e o canto de cima, fora da grade)
  // =====================================================================
  const CTA0 = S[12].start;
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[770, 1700], [250, 150], [310, 1700], [800, 150]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % 4], b = SPOTS[(k + 1) % 4], e = ease(u);
      const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.3) / 0.4) * (1 - clamp((t - CTA0 + 0.2) / 0.4)) * 0.95).toFixed(3));
    });
  }
};
