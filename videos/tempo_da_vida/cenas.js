// "Quanto tempo da sua vida vai pro ralo?" — banheiro, trânsito e celular (Caderno Amarelo).
// Folha 1: título + 3 linhas (desenho à esquerda, conta à direita) + total na base.
// Folha 2: piada final, redes e o caderninho amarelo da marca.
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const ROW = [330, 680, 1030];        // topo de cada linha
  const MX = 400;                      // coluna das contas

  // ---------- CENA 1: título + desenhos ----------
  WB.write(1, 0.02, 0.22, 'Quanto tempo da sua vida', 540, 150, 92, INK.black, { anchor: 'middle' });
  const t2 = WB.write(1, 0.22, 0.34, 'vai pro ralo?', 540, 250, 92, INK.red, { anchor: 'middle' });
  WB.draw(1, 0.34, 0.38, C.underline(540 - t2.width / 2, 540 + t2.width / 2, 278));

  // vaso sanitário + rolo de papel
  let T = ROW[0];
  WB.draw(1, 0.40, 0.53, [
    C.box(165, T + 40, 275, T + 110, INK.black, 7),
    WB.strokePath(`M 140 ${T + 120} L 300 ${T + 120} Q 300 ${T + 210} 220 ${T + 222} Q 140 ${T + 210} 140 ${T + 120}`, INK.black, 7),
    WB.strokePath(`M 195 ${T + 220} L 185 ${T + 272} L 255 ${T + 272} L 245 ${T + 220}`, INK.black, 7),
    WB.strokePath(WB.circlePath(335, T + 150, 24), INK.black, 6),
    WB.strokePath(WB.circlePath(335, T + 150, 7), INK.black, 5),
    WB.textStrokes('Banheiro', 220, T + 322, 50, INK.blue, null, 'middle').strokes,
  ]);
  // carro
  T = ROW[1];
  WB.draw(1, 0.53, 0.66, [
    WB.strokePath(`M 120 ${T + 195} L 120 ${T + 150} Q 124 ${T + 130} 150 ${T + 126} L 182 ${T + 80} Q 192 ${T + 68} 212 ${T + 68} ` +
      `L 268 ${T + 68} Q 288 ${T + 68} 298 ${T + 80} L 322 ${T + 126} Q 345 ${T + 130} 345 ${T + 150} L 345 ${T + 195} Z`, INK.black, 7),
    WB.strokePath(`M 192 ${T + 120} L 210 ${T + 86} L 266 ${T + 86} L 288 ${T + 120} Z`, INK.black, 5),
    WB.strokePath(WB.circlePath(178, T + 198, 26), INK.black, 7),
    WB.strokePath(WB.circlePath(292, T + 198, 26), INK.black, 7),
    WB.strokePath(WB.circlePath(100, T + 182, 9), INK.gray, 5),
    WB.textStrokes('Trânsito', 230, T + 322, 50, INK.orange, null, 'middle').strokes,
  ]);
  // celular
  T = ROW[2];
  WB.draw(1, 0.66, 0.80, [
    WB.strokePath(WB.roundRectPath(170, T + 30, 100, 192, 18), INK.black, 7),
    WB.strokePath(WB.roundRectPath(184, T + 56, 72, 134, 6), INK.black, 4),
    WB.strokePath(WB.circlePath(220, T + 206, 6), INK.black, 5),
    C.arrow(310, T + 190, 310, T + 70, INK.purple, 6),
    WB.textStrokes('Celular', 220, T + 322, 50, INK.purple, null, 'middle').strokes,
  ]);
  WB.restHand(1, 0.84, 0.99);

  // linha de conta: a (por dia), b (por ano), c (na vida)
  function linha(scene, r, a, b, fa, fb) {
    const T = ROW[r];
    WB.write(scene, fa[0], fa[1], a, MX, T + 95, 68, INK.black);
    WB.write(scene, fb[0], fb[1], b, MX, T + 185, 68, INK.black);
  }

  // ---------- CENA 2: banheiro ----------
  linha(2, 0, '20 min por dia', '= 5 dias por ano', [0.10, 0.30], [0.62, 0.76]);
  const r1 = WB.write(2, 0.80, 0.92, '+ de 1 ANO!', MX, ROW[0] + 295, 88, INK.red);
  WB.draw(2, 0.92, 0.96, C.underline(MX - 4, MX + r1.width + 6, ROW[0] + 318, INK.red, 7));

  // ---------- CENA 3: trânsito ----------
  linha(3, 1, '1 h por dia útil', '= 10 dias por ano', [0.08, 0.30], [0.40, 0.56]);
  const r2 = WB.write(3, 0.76, 0.88, '+ de 1 ANO!', MX, ROW[1] + 295, 88, INK.red);
  WB.draw(3, 0.88, 0.92, C.underline(MX - 4, MX + r2.width + 6, ROW[1] + 318, INK.red, 7));

  // ---------- CENA 4: celular ----------
  linha(4, 2, '5 h por dia', '= 76 dias por ano', [0.15, 0.36], [0.48, 0.63]);
  const st = C.stamp('+ de 10 ANOS!', 690, ROW[2] + 280, { size: 78, rot: -7 });
  WB.draw(4, 0.74, 0.78, st.box);
  WB.draw(4, 0.78, 0.92, st.text);

  // ---------- CENA 5: total ----------
  WB.draw(5, 0.02, 0.10, C.box(60, 1405, 1020, 1725, INK.black, 8));
  WB.write(5, 0.10, 0.34, 'TOTAL: + de 12 ANOS!', 540, 1500, 92, INK.red, { anchor: 'middle' });
  WB.writeLines(5, 0.40, 0.78, ['dá pra fazer o fundamental', 'e o médio inteirinhos!'], 540, 1590, 62, INK.blue,
    { anchor: 'middle', lineHeight: 72 });
  WB.restHand(5, 0.80, 0.99);

  // ---------- CENA 6: piada final + redes ----------
  WB.newPage(6, 0.0, 0.05);
  const calma = WB.write(6, 0.06, 0.13, 'Calma!', 540, 290, 140, INK.red, { anchor: 'middle' });
  WB.draw(6, 0.13, 0.15, C.underline(540 - calma.width / 2, 540 + calma.width / 2, 322));
  WB.write(6, 0.16, 0.26, 'Se é pra rolar a tela,', 540, 440, 76, INK.black, { anchor: 'middle' });
  WB.write(6, 0.26, 0.36, 'que seja aprendendo!', 540, 530, 76, INK.blue, { anchor: 'middle' });
  WB.ctaRedes(6, 0.38, 0.74, { y: 600 });

  // caderninho amarelo da marca
  const bg = WB.mk('path', { d: WB.roundRectPath(420, 1330, 260, 330, 22), fill: '#ffd23f', 'fill-opacity': 0 });
  const capa = WB.strokePath(WB.roundRectPath(420, 1330, 260, 330, 22), INK.black, 8);
  WB.draw(6, 0.76, 0.80, capa);
  WB.fillAfter(bg, capa);
  const espiral = [];
  for (let i = 0; i < 5; i++) {
    const y = 1370 + i * 62;
    espiral.push(WB.strokePath(`M 440 ${y} Q 392 ${y} 392 ${y + 16} Q 392 ${y + 32} 448 ${y + 32}`, INK.black, 6));
  }
  WB.draw(6, 0.80, 0.84, espiral);
  WB.draw(6, 0.84, 0.88, [WB.strokePath(WB.roundRectPath(480, 1440, 160, 90, 10), INK.black, 6),
    WB.textStrokes('ca', 560, 1505, 70, INK.black, null, 'middle').strokes]);
};
