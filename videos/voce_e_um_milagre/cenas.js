// "Você já é um milagre" — áudio motivacional original redesenhado no caderno (Caderno Amarelo).
// Os tempos abaixo são em SEGUNDOS do áudio (tirados da transcrição palavra a palavra);
// os helpers convertem para cena + fração.
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const P = (d, cor = INK.black, w = 7) => WB.strokePath(d, cor, w);

  // ---------- tempo absoluto -> (cena, fração) ----------
  const N = WB.scenes.length;
  const cenaDe = t => { for (let s = N; s >= 1; s--) if (t >= WB.at(s, 0) - 1e-6) return s; return 1; };
  const fr = (s, t) => (t - WB.at(s, 0)) / (WB.at(s, 1) - WB.at(s, 0));
  const D = (t0, t1, tr) => { const s = cenaDe(t0); return WB.draw(s, fr(s, t0), fr(s, t1), tr); };
  const Wr = (t0, t1, txt, x, y, size, cor, o = {}) => { const s = cenaDe(t0); return WB.write(s, fr(s, t0), fr(s, t1), txt, x, y, size, cor, o); };
  const Mid = (t0, t1, txt, y, size, cor = INK.black) => Wr(t0, t1, txt, 540, y, size, cor, { anchor: 'middle' });
  const Rest = (t0, t1) => { const s = cenaDe(t0); WB.restHand(s, fr(s, t0), fr(s, t1)); };
  const Page = (t0, t1) => { const s = cenaDe(t0); WB.newPage(s, fr(s, t0), fr(s, t1)); };
  const Sub = (r, cor = INK.red, dy = 26) => C.underline(r.x, r.x + r.width, r.y + dy, cor, 7);

  // ---------- desenhos reutilizados ----------
  function fantasma(cx, top, s = 1, cor = INK.black) {
    const w = 70 * s, h = 210 * s, y = top;
    const corpo = `M ${cx - w} ${y + h} L ${cx - w} ${y + 80 * s} Q ${cx - w} ${y} ${cx} ${y} Q ${cx + w} ${y} ${cx + w} ${y + 80 * s} ` +
      `L ${cx + w} ${y + h} Q ${cx + w * 0.66} ${y + h - 22 * s} ${cx + w * 0.33} ${y + h} Q ${cx} ${y + h - 22 * s} ${cx - w * 0.33} ${y + h} ` +
      `Q ${cx - w * 0.66} ${y + h - 22 * s} ${cx - w} ${y + h}`;
    const olho = (x) => P(`M ${x} ${y + 70 * s} L ${x} ${y + 105 * s}`, cor, 16 * s);
    return [P(corpo, cor, 7), olho(cx - 24 * s), olho(cx + 24 * s)];
  }
  function estrela(cx, cy, r, cor = INK.orange) {   // brilho de 4 pontas
    const k = r * 0.22;
    return P(`M ${cx} ${cy - r} Q ${cx + k} ${cy - k} ${cx + r} ${cy} Q ${cx + k} ${cy + k} ${cx} ${cy + r} ` +
      `Q ${cx - k} ${cy + k} ${cx - r} ${cy} Q ${cx - k} ${cy - k} ${cx} ${cy - r}`, cor, 5);
  }
  function lua(cx, cy, r, cor = INK.blue) {
    return P(`M ${cx + r * 0.3} ${cy - r} A ${r} ${r} 0 1 0 ${cx + r * 0.3} ${cy + r} A ${r * 0.8} ${r * 0.8} 0 1 1 ${cx + r * 0.3} ${cy - r}`, cor, 6);
  }
  function coracao(cx, cy, s, cor = INK.red, w = 7) {
    return P(`M ${cx} ${cy + s * 0.9} C ${cx - s * 1.3} ${cy + s * 0.1} ${cx - s * 0.9} ${cy - s * 1.0} ${cx} ${cy - s * 0.35} ` +
      `C ${cx + s * 0.9} ${cy - s * 1.0} ${cx + s * 1.3} ${cy + s * 0.1} ${cx} ${cy + s * 0.9}`, cor, w);
  }
  function elipseGirada(cx, cy, rx, ry, ang) {
    let d = '';
    for (let i = 0; i <= 40; i++) {
      const a = i / 40 * Math.PI * 2, x = rx * Math.cos(a), y = ry * Math.sin(a);
      const X = cx + x * Math.cos(ang) - y * Math.sin(ang), Y = cy + x * Math.sin(ang) + y * Math.cos(ang);
      d += `${i ? 'L' : 'M'} ${X.toFixed(1)} ${Y.toFixed(1)} `;
    }
    return d;
  }
  function atomo(cx, cy, r, cor = INK.purple) {
    return [P(WB.circlePath(cx, cy, 9), cor, 12),
      P(elipseGirada(cx, cy, r, r * 0.34, 0), cor, 5),
      P(elipseGirada(cx, cy, r, r * 0.34, Math.PI / 3), cor, 5),
      P(elipseGirada(cx, cy, r, r * 0.34, -Math.PI / 3), cor, 5)];
  }
  function espiral(cx, cy, r, voltas, cor, w = 6) {
    let d = '';
    const n = 60 * voltas;
    for (let i = 0; i <= n; i++) {
      const a = i / 60 * Math.PI * 2, rr = r * i / n;
      d += `${i ? 'L' : 'M'} ${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a) * 0.8).toFixed(1)} `;
    }
    return P(d, cor, w);
  }
  function cabeca(cx, cy, s, cor = INK.black, w = 7) {   // perfil olhando para a direita
    const X = v => (cx + v * s).toFixed(1), Y = v => (cy + v * s).toFixed(1);
    return P(`M ${X(-90)} ${Y(170)} Q ${X(-150)} ${Y(60)} ${X(-130)} ${Y(-30)} Q ${X(-100)} ${Y(-160)} ${X(10)} ${Y(-165)} ` +
      `Q ${X(130)} ${Y(-165)} ${X(150)} ${Y(-40)} L ${X(190)} ${Y(20)} L ${X(155)} ${Y(30)} Q ${X(165)} ${Y(70)} ${X(150)} ${Y(80)} ` +
      `Q ${X(160)} ${Y(100)} ${X(140)} ${Y(110)} Q ${X(140)} ${Y(150)} ${X(80)} ${Y(145)} L ${X(70)} ${Y(190)}`, cor, w);
  }

  // =========================================================================
  // FOLHA 1 (0–16.6 s): fantasma -> esqueleto -> rocha no espaço -> "postar?"
  // =========================================================================
  Mid(0.3, 1.7, 'Você é um fantasma', 190, 100);
  D(1.75, 2.5, fantasma(230, 290, 1.15));
  Wr(2.5, 2.95, 'pilota', 360, 300, 60, INK.purple);
  D(2.95, 3.2, C.curvedArrow(340, 400, 470, 330, 600, 420, INK.purple, 6));
  // esqueleto
  D(3.2, 4.1, [
    P(WB.circlePath(770, 350, 42)),
    P(`M 752 345 L 752 352 M 788 345 L 788 352 M 758 372 L 782 372`, INK.black, 6),
    P(WB.roughLine(770, 392, 770, 610, 2)),
    P(`M 735 440 Q 770 425 805 440 M 730 475 Q 770 460 810 475 M 738 510 Q 770 497 802 510`, INK.black, 6),
    P(`M 740 610 Q 770 630 800 610`, INK.black, 6),
    P(`M 770 420 L 700 550 M 770 420 L 840 550`, INK.black, 6),
    P(`M 760 615 L 720 770 M 780 615 L 820 770`, INK.black, 6),
  ]);
  // "coberto de carne"
  D(4.1, 4.85, [
    P(WB.circlePath(770, 350, 62), INK.orange, 6),
    P(`M 735 410 Q 680 420 670 470 L 680 570 M 805 410 Q 860 420 870 470 L 860 570 M 715 450 L 712 610 Q 712 640 745 640 L 795 640 Q 828 640 828 610 L 825 450`, INK.orange, 6),
    P(`M 735 640 L 700 790 M 805 640 L 840 790`, INK.orange, 6),
  ]);
  // a rocha (Terra) com alguém em cima
  D(4.9, 6.3, [
    P(WB.circlePath(330, 1010, 165)),
    P(WB.circlePath(260, 960, 30), INK.gray, 5), P(WB.circlePath(390, 1070, 42), INK.gray, 5), P(WB.circlePath(300, 1100, 18), INK.gray, 5),
    C.stickFigure(330, 760, { scale: 0.22, color: INK.black }),
  ]);
  D(6.5, 7.1, [P(WB.roughLine(70, 930, 140, 930, 2), INK.blue, 6), P(WB.roughLine(50, 1010, 140, 1010, 2), INK.blue, 6), P(WB.roughLine(70, 1090, 140, 1090, 2), INK.blue, 6)]);
  Wr(7.1, 8.4, '+ de 1 milhão', 530, 980, 72, INK.red);
  Wr(8.4, 9.6, 'de km/h!', 530, 1070, 72, INK.red);
  D(10.0, 11.5, [estrela(120, 620, 30), estrela(560, 690, 24), estrela(930, 820, 32), estrela(110, 1240, 26), estrela(620, 1210, 30), estrela(930, 1190, 22)]);
  Rest(11.5, 12.2);
  // "e você está preocupado com o que você vai postar"
  D(12.3, 13.0, [
    P(WB.roundRectPath(110, 1300, 110, 200, 18)), P(WB.roundRectPath(124, 1324, 82, 140, 6), INK.black, 4), P(WB.circlePath(165, 1482, 6), INK.black, 5),
  ]);
  Wr(13.0, 14.1, 'e você preocupado', 270, 1370, 72);
  const post = Wr(14.1, 15.3, 'com o que vai POSTAR?', 270, 1470, 76, INK.red);
  D(15.3, 15.6, P(`M 250 1290 Q 238 1312 250 1322 Q 262 1312 250 1290`, INK.blue, 5));
  Rest(15.7, 16.6);

  // =========================================================================
  // FOLHA 2 (16.6–26.3 s): todas as noites você sai do corpo...
  // =========================================================================
  Page(16.6, 17.05);
  Mid(17.1, 18.2, 'Todas as noites...', 200, 96);
  // cama com alguém dormindo
  D(18.2, 19.2, [
    P(`M 170 950 L 170 1170 M 170 1060 L 910 1060 L 910 1170 M 170 1110 L 910 1110`),
    P(`M 210 1060 Q 200 1015 250 1015 L 320 1015 Q 350 1030 330 1060`, INK.black, 6),
    P(WB.circlePath(300, 1000, 36)),
    P(`M 285 995 Q 292 1002 299 995 M 309 995 Q 316 1002 323 995`, INK.black, 4),
    P(`M 345 1060 Q 360 990 450 985 L 820 990 Q 880 995 900 1060`, INK.blue, 7),
  ]);
  // o fantasma sai do corpo
  D(19.2, 19.5, P(`M 330 960 Q 380 880 470 840`, INK.purple, 5));
  D(19.5, 20.1, fantasma(560, 650, 0.85, INK.purple));
  // alucina por horas (nuvem de sonho)
  D(20.1, 20.7, P(WB.cloudPath(540, 420, 330, 120), INK.purple, 6));
  D(20.7, 21.6, [espiral(380, 420, 55, 3, INK.orange), espiral(560, 410, 60, 3, INK.blue), espiral(730, 430, 50, 3, INK.red)]);
  // esquece quase tudo
  const esq = Mid(21.7, 22.8, 'esquece quase tudo', 1290, 76, INK.gray);
  D(22.8, 23.3, P(WB.wavyLine(540 - esq.width / 2, 540 + esq.width / 2, 1265, 10, 40), INK.red, 7));
  // acorda como se nada tivesse acontecido
  D(23.35, 23.8, [P(WB.circlePath(880, 720, 40), INK.orange, 6),
    P(`M 880 660 L 880 640 M 880 780 L 880 800 M 820 720 L 800 720 M 940 720 L 960 720 M 838 678 L 825 665 M 922 762 L 935 775 M 922 678 L 935 665 M 838 762 L 825 775`, INK.orange, 5)]);
  Mid(23.8, 24.8, 'e acorda como se nada', 1410, 70, INK.blue);
  Mid(24.8, 25.8, 'tivesse acontecido', 1495, 70, INK.blue);

  // =========================================================================
  // FOLHA 3 (26.3–35.8 s): ...e chama de DORMIR. Insano!
  // =========================================================================
  Page(26.3, 26.75);
  Mid(26.8, 27.6, 'toda noite', 230, 84);
  D(27.6, 28.4, [150, 280, 410, 540, 670, 800, 930].map(x => lua(x, 360, 38)));
  Mid(28.4, 29.0, 'e chama de', 590, 84);
  const dormir = Mid(29.0, 30.1, 'DORMIR', 820, 210, INK.blue);
  Wr(30.1, 30.5, 'Zzz', 860, 600, 70, INK.gray);
  Mid(30.6, 31.9, 'como se isso, por si só,', 1040, 72);
  Mid(32.0, 33.0, 'já não fosse...', 1130, 72);
  const ins = C.stamp('INSANO!', 540, 1340, { size: 140, rot: -6, color: INK.red });
  D(33.05, 33.4, ins.box);
  D(33.4, 34.4, ins.text);
  Rest(34.6, 35.8);

  // =========================================================================
  // FOLHA 4 (35.8–43.7 s): coleção de átomos que pensa sobre pensar
  // =========================================================================
  Page(35.8, 36.1);
  Mid(36.1, 37.2, 'Você é uma coleção', 210, 90);
  const at = Mid(37.25, 38.1, 'de ÁTOMOS', 330, 116, INK.purple);
  D(38.1, 39.4, [atomo(170, 540, 90), atomo(420, 590, 75), atomo(660, 530, 90), atomo(890, 590, 75)]);
  // cabeça pensando numa cabeça pensando numa cabeça...
  D(39.45, 40.3, cabeca(270, 1030, 1.15));
  D(40.3, 40.9, [P(WB.circlePath(500, 950, 12), INK.blue, 5), P(WB.circlePath(540, 910, 18), INK.blue, 5), P(WB.circlePath(680, 880, 125), INK.blue, 6)]);
  D(40.9, 41.5, cabeca(665, 895, 0.45, INK.black, 6));
  D(41.5, 41.9, [P(WB.circlePath(800, 815, 7), INK.blue, 4), P(WB.circlePath(825, 790, 10), INK.blue, 4), P(WB.circlePath(885, 745, 52), INK.blue, 5)]);
  D(41.9, 42.2, cabeca(880, 750, 0.19, INK.black, 5));
  Mid(42.25, 43.4, 'pensando sobre pensar', 1440, 90, INK.blue);

  // =========================================================================
  // FOLHA 5 (43.7–53.8 s): sentimentos sobre sentimentos, consciência da consciência
  // =========================================================================
  Page(43.7, 44.05);
  Wr(44.1, 45.3, 'sentir sentimentos', 420, 410, 70);
  D(45.3, 46.5, [coracao(240, 420, 150), coracao(240, 430, 95, INK.red, 6), coracao(240, 440, 45, INK.red, 5)]);
  Wr(46.5, 47.6, 'sobre sentimentos', 420, 510, 70, INK.red);
  // olho dentro do olho
  D(47.65, 48.4, [
    P(`M 90 860 Q 240 740 390 860 Q 240 980 90 860`), P(WB.circlePath(240, 860, 62), INK.blue, 6),
    P(`M 190 860 Q 240 820 290 860 Q 240 900 190 860`, INK.blue, 4), P(WB.circlePath(240, 860, 12), INK.blue, 10),
  ]);
  Wr(48.4, 49.4, 'consciente de', 420, 830, 70);
  Wr(49.4, 50.5, 'estar consciente', 420, 930, 70, INK.blue);
  Mid(50.9, 52.3, 'Você entende quanto isso é', 1170, 72);
  const cpx = Mid(52.35, 53.3, 'COMPLEXO?!', 1360, 150, INK.red);
  D(53.3, 53.6, Sub(cpx, INK.red, 30));

  // =========================================================================
  // FOLHA 6 (53.8–62.9 s): um universo consciente num corpo temporário
  // =========================================================================
  Page(53.8, 54.15);
  Mid(54.2, 55.4, 'Você é um UNIVERSO', 200, 96);
  Mid(55.45, 56.3, 'consciente', 300, 84, INK.purple);
  D(56.35, 57.5, [
    P(WB.circlePath(540, 450, 72)),
    P(`M 500 530 Q 420 535 400 590 L 330 820 Q 320 850 350 855 L 425 680 L 428 900 L 405 1170 Q 405 1195 435 1195 L 472 1195 ` +
      `L 530 960 L 550 960 L 608 1195 L 645 1195 Q 675 1195 675 1170 L 652 900 L 655 680 L 730 855 Q 760 850 750 820 L 680 590 Q 660 535 580 530`),
  ]);
  D(57.5, 58.5, [espiral(540, 760, 110, 3, INK.purple, 6), estrela(470, 660, 16, INK.orange), estrela(620, 870, 18, INK.orange), estrela(470, 880, 12, INK.blue), estrela(620, 650, 12, INK.blue)]);
  // ampulheta: temporário
  D(58.5, 59.2, [P(`M 820 600 L 940 600 M 820 820 L 940 820 M 835 600 Q 835 680 880 710 Q 835 740 835 820 M 925 600 Q 925 680 880 710 Q 925 740 925 820`),
    P(`M 850 790 L 910 790 L 880 760 Z M 860 640 L 900 640`, INK.orange, 6)]);
  const anos = Mid(60.2, 61.8, '80 a 90 anos', 1390, 140, INK.red);
  D(61.8, 62.1, Sub(anos, INK.red, 30));
  Rest(62.2, 62.9);

  // =========================================================================
  // FOLHA 7 (62.9–80.6 s): 4 mil semanas e as preocupações pequenas
  // =========================================================================
  Page(62.9, 63.3);
  Mid(63.3, 64.8, 'São 4.000 semanas', 230, 104, INK.red);
  const grade = [];
  for (let i = 0; i <= 20; i++) grade.push(P(WB.roughLine(90 + i * 45, 300, 90 + i * 45, 660, 1), INK.gray, 3));
  for (let j = 0; j <= 8; j++) grade.push(P(WB.roughLine(90, 300 + j * 45, 990, 300 + j * 45, 1), INK.gray, 3));
  D(64.85, 66.3, grade);
  D(66.35, 67.25, P(WB.zigzagHatch(90, 300, 450, 435, 14), INK.orange, 5));
  Mid(67.3, 68.9, 'e você gasta várias preocupado:', 790, 66);
  // 1) o texto
  D(68.95, 69.3, [P(WB.roundRectPath(95, 870, 70, 90, 6), INK.black, 5), P(`M 110 895 L 150 895 M 110 915 L 150 915 M 110 935 L 140 935`, INK.black, 4)]);
  const w1 = Wr(69.3, 70.6, 'o texto ficou bom?', 200, 935, 74);
  // 2) a voz
  D(70.7, 71.05, [P(`M 100 1065 L 125 1065 L 150 1040 L 150 1120 L 125 1095 L 100 1095 Z`, INK.black, 5), P(`M 165 1055 Q 180 1080 165 1105`, INK.black, 4)]);
  const w2 = Wr(71.05, 72.5, 'minha voz tá alta?', 200, 1100, 74);
  // 3) o projeto
  D(72.6, 73.0, [P(WB.circlePath(130, 1225, 32), INK.black, 5), P(`M 115 1260 L 145 1260 M 118 1275 L 142 1275`, INK.black, 4)]);
  const w3 = Wr(73.0, 75.2, 'esse projeto é o certo?', 200, 1265, 74);
  Rest(75.3, 76.5);
  // pausa da música: risca tudo e responde
  D(76.6, 77.7, [w1, w2, w3].map((w, i) => P(WB.roughLine(190, [910, 1075, 1240][i], 210 + w.width, [910, 1075, 1240][i] - 6, 3), INK.red, 8)));
  Mid(77.9, 79.6, 'pequeno perto do que você é', 1440, 70, INK.blue);
  Rest(79.7, 80.6);

  // =========================================================================
  // FOLHA 8 (80.6–91.4 s): você já é um milagre + redes
  // =========================================================================
  Page(80.6, 80.95);
  Mid(80.95, 81.75, 'Você já é um', 330, 100);
  const mil = Mid(81.75, 82.6, 'MILAGRE', 560, 220, INK.orange);
  Mid(82.65, 83.9, 'que nem a própria física', 730, 76);
  Mid(83.9, 85.4, 'consegue explicar por inteiro', 825, 76, INK.blue);
  D(85.4, 85.95, [estrela(150, 420, 40), estrela(930, 440, 34), estrela(110, 600, 24), estrela(960, 620, 26)]);
  WB.ctaRedes(10, 0.06, 0.62, { y: 990 });
};
