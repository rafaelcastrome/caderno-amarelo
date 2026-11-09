// Tua vida em quadradinhos: 80 anos x 52 semanas = 4.160 quadradinhos.
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const COLS = 52, ROWS = 80, CS = 15.5, X0 = 137, Y0 = 300;
  const X1 = X0 + COLS * CS, Y1 = Y0 + ROWS * CS;
  const cx = (c) => X0 + c * CS, cy = (r) => Y0 + r * CS;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeIO = (u) => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;

  // gancho no quadro 0
  WB.showNow(WB.textStrokes('TUA VIDA INTEIRA', 540, 150, 96, INK.black, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('CABE NESSA FOLHA', 540, 255, 96, INK.red, null, 'middle').strokes);

  // ---- camadas: preenchimentos (embaixo), grade, post-its (em cima)
  const fills = WB.group();
  function band(color, a, b, reverse, scene, f0, f1) {
    // pinta as células [a, b) em ordem de leitura (ou de trás pra frente)
    const el = WB.mk('path', { d: '', fill: color, 'fill-opacity': 0.82 }, fills);
    const t0 = WB.at(scene, f0), t1 = WB.at(scene, f1);
    const range = (t) => {
      const n = Math.round((b - a) * easeIO(clamp((t - t0) / (t1 - t0))));
      return reverse ? [b - n, b] : [a, a + n];
    };
    WB.effect((t) => {
      const [s, e] = range(t);
      if (e <= s) { el.setAttribute('d', ''); return; }
      let d = ''; let i = s;
      while (i < e) {
        const r = Math.floor(i / COLS), c0 = i % COLS;
        const c1 = Math.min(COLS, c0 + (e - i));
        d += `M${cx(c0)} ${cy(r)}H${cx(c1)}V${cy(r + 1)}H${cx(c0)}Z`;
        i += c1 - c0;
      }
      el.setAttribute('d', d);
    });
    WB.handFollow(t0, t1, (t) => {
      const [s, e] = range(t); const i = reverse ? s : Math.max(a, e - 1);
      return { x: cx(i % COLS) + CS / 2, y: cy(Math.floor(i / COLS)) + CS / 2 };
    }, color);
  }

  let gd = '';
  for (let c = 1; c < COLS; c++) gd += `M${cx(c)} ${Y0}V${Y1}`;
  for (let r = 1; r < ROWS; r++) gd += `M${X0} ${cy(r)}H${X1}`;
  const grid = WB.mk('path', { d: gd, stroke: '#7d8794', 'stroke-width': 1.6, fill: 'none', opacity: 0 });
  const year = (r) => WB.mk('path', { d: `M${X0} ${cy(r)}H${X1}`, stroke: '#3b4250', 'stroke-width': 2.6, opacity: 0 });
  const decadas = [10, 20, 30, 40, 50, 60, 70].map(year);

  function postit(scene, f0, f1, text, x, y, size, color, w) {
    const g = WB.group();
    const tw = w || WB.measure(text, size) + 56, h = size * 1.3;
    const bg = WB.mk('rect', { x: x - tw / 2, y: y - h / 2, width: tw, height: h, rx: 6,
      fill: '#fff6a6', stroke: '#e3cf5a', 'stroke-width': 2, opacity: 0 }, g);
    WB.fade(scene, f0, f0 + 0.05, bg, 0, 0.97);
    WB.write(scene, f0 + 0.05, f1, text, x, y + size * 0.3, size, color, { anchor: 'middle', parent: g });
    return g;
  }

  // ---- Cena 1: a folha
  WB.draw(1, 0.08, 0.80, C.box(X0, Y0, X1, Y1, INK.black, 4));
  WB.fade(1, 0.35, 0.95, grid, 0, 1);
  decadas.forEach((d) => WB.fade(1, 0.6, 0.95, d, 0, 1));

  // ---- Cena 2: 1 quadradinho = 1 semana, 1 linha = 1 ano, 4.160
  WB.draw(2, 0.02, 0.10, C.circleAround(cx(0) + CS / 2, cy(0) + CS / 2, 22, 22, INK.red));
  const p1 = postit(2, 0.10, 0.24, '1 quadradinho = 1 semana', 540, 470, 60, INK.black);
  WB.draw(2, 0.25, 0.34, C.box(X0 - 6, cy(0) - 6, X1 + 6, cy(1) + 6, INK.red, 4));
  const p2 = postit(2, 0.34, 0.44, '1 linha = 1 ano', 540, 600, 60, INK.black);
  WB.write(2, 0.46, 0.50, '0', X0 - 14, cy(0) + 30, 46, INK.gray, { anchor: 'end' });
  WB.write(2, 0.50, 0.55, '80', X0 - 12, Y1, 46, INK.gray, { anchor: 'end' });
  const p3 = postit(2, 0.58, 0.82, '80 anos = 4.160', 540, 920, 84, INK.red);
  [p1, p2, p3].forEach((p) => WB.fade(2, 0.94, 1.0, p, 1, 0));
  WB.restHand(2, 0.84, 0.93);

  // células: 0..779 vividas (15 anos); de baixo pra cima: sono, escola/trabalho, rotina, celular
  const N = COLS * ROWS, VIV = 15 * COLS;
  const SONO = 1127, TRAB = 624, ROT = 364, CEL = 564;
  const eSono = N, eTrab = eSono - SONO, eRot = eTrab - TRAB, eCel = eRot - ROT, LIVRE0 = VIV, LIVRE1 = eCel - CEL;
  const mid = (a, b) => (cy(Math.floor(a / COLS)) + cy(Math.ceil(b / COLS))) / 2;

  // ---- Cena 3: o que já foi
  band('#4a4f5a', 0, VIV, false, 3, 0.30, 0.86);
  WB.write(3, 0.87, 0.90, '15', X0 - 12, cy(15) + 14, 46, INK.gray, { anchor: 'end' });
  postit(3, 0.90, 0.99, '15 anos: já foi', 540, mid(0, VIV), 58, INK.black);

  // ---- Cena 4: dormindo
  band('#2f6fdd', eSono - SONO, eSono, true, 4, 0.06, 0.70);
  postit(4, 0.72, 0.97, 'dormindo ≈ 22 anos', 540, mid(eSono - SONO, eSono), 58, INK.blue);
  // ---- Cena 5: escola, trabalho, trânsito
  band('#f08a1c', eTrab - TRAB, eTrab, true, 5, 0.04, 0.62);
  postit(5, 0.64, 0.97, 'escola, trabalho, trânsito ≈ 12', 540, mid(eTrab - TRAB, eTrab), 54, INK.orange);
  // ---- Cena 6: rotina
  band('#2f9e4f', eRot - ROT, eRot, true, 6, 0.04, 0.55);
  postit(6, 0.58, 0.97, 'comer, banho, louça, fila ≈ 7', 540, mid(eRot - ROT, eRot), 50, INK.green);
  // ---- Cena 7: celular
  band('#d6333a', eCel - CEL, eCel, true, 7, 0.10, 0.72);
  postit(7, 0.74, 0.97, 'celular ≈ 11 anos', 540, mid(eCel - CEL, eCel), 60, INK.red);

  // ---- Cena 8: o que sobra
  const yL0 = cy(15), yL1 = cy(Math.ceil(LIVRE1 / COLS));
  WB.draw(8, 0.30, 0.50, C.box(X0 - 10, yL0 - 8, X1 + 10, yL1 + 8, INK.red, 7));
  postit(8, 0.56, 0.86, '≈ 700 semanas livres', 540, yL1 - 52, 66, INK.red);
  WB.restHand(8, 0.88, 0.98);

  // ---- Cena 9: essa semana
  const c0x = cx(0) + CS / 2, c0y = cy(15) + CS / 2;
  WB.draw(9, 0.08, 0.22, C.circleAround(c0x, c0y, 26, 26, INK.red));
  WB.draw(9, 0.24, 0.34, C.curvedArrow(330, 586, 250, 560, c0x + 30, c0y + 8, INK.red, 5));
  const tag = WB.group();
  const tagBg = WB.mk('rect', { x: 330, y: 550, width: 330, height: 72, rx: 6, fill: '#fff6a6', stroke: '#e3cf5a', 'stroke-width': 2, opacity: 0 }, tag);
  WB.fade(9, 0.34, 0.38, tagBg, 0, 0.97);
  WB.write(9, 0.38, 0.55, 'ESSA SEMANA', 495, 603, 56, INK.red, { anchor: 'middle', parent: tag });
  // o quadradinho vai se enchendo de vermelho (ela tá acabando)
  const sem = WB.mk('rect', { x: cx(0), y: cy(15), width: 0, height: CS, fill: '#d6333a' });
  const tS0 = WB.at(9, 0.55), tS1 = WB.at(10, 0.95);
  WB.effect((t) => sem.setAttribute('width', (CS * clamp((t - tS0) / (tS1 - tS0))).toFixed(2)));
  WB.effect((t) => {
    const on = t > tS0 ? 1 + 0.6 * Math.max(0, Math.sin((t - tS0) * Math.PI * 2)) : 1;
    sem.setAttribute('fill-opacity', Math.min(1, on - 0.1).toFixed(2));
  });
  WB.restHand(9, 0.58, 0.98);

  // ---- Cena 10: manda pra alguém
  WB.writeLines(10, 0.04, 0.80, ['Manda pra quem tu quer', 'gastar teus quadradinhos'], 540, 1628, 62, INK.black, { anchor: 'middle', lineHeight: 70 });
  WB.restHand(10, 0.82, 1.0);

  // @ que passeia pelo rodapé
  const at = WB.group(WB.overlay);
  WB.showNow(WB.textStrokes('@Cardeno_Amarelo', 0, 0, 42, INK.gray, at, 'middle').strokes);
  WB.effect((t) => {
    const u = (Math.sin(t * 0.35) + 1) / 2;
    at.setAttribute('transform', `translate(${(260 + u * 560).toFixed(1)} 1872)`);
    at.setAttribute('opacity', 0.75);
  });
};
