// "5 coisas que teu corpo NÃO consegue fazer" (desafio, Caderno Amarelo, 03/11/2026).
// Gancho na tela desde o quadro 0 (título + 5 bolinhas na camada fixa). Cada desafio vira a folha:
// cena ímpar-par = instrução (mão desenha durante o silêncio pra pessoa tentar) + reação (X vermelho na bolinha).
// Final: "respirando no manual" + CTA mandar pro amigo / seguir. @ d'água anda pelo rodapé o vídeo todo.
window.CENAS = function (WB) {
  const { INK, C } = WB;

  // ---------- camada fixa: gancho + placar ----------
  WB.showNow(WB.textStrokes('5 coisas que teu corpo', 540, 120, 80, INK.black, WB.overlay, 'middle').strokes);
  const nao = WB.textStrokes('NÃO consegue fazer', 540, 225, 100, INK.red, WB.overlay, 'middle');
  WB.showNow(nao.strokes);
  WB.showNow(WB.strokePath(WB.wavyLine(540 - nao.width / 2, 540 + nao.width / 2, 250, 5, 40), INK.red, 5, WB.overlay));
  const BX = [300, 420, 540, 660, 780], BY = 320;
  BX.forEach((x, i) => {
    WB.showNow(WB.strokePath(WB.circlePath(x, BY, 38), INK.black, 6, WB.overlay));
    WB.showNow(WB.textStrokes(String(i + 1), x, BY + 20, 56, INK.black, WB.overlay, 'middle').strokes);
  });
  const xis = (cena, f0, f1, i) => {
    const g = WB.group(WB.overlay);
    WB.draw(cena, f0, f1, WB.strokePath(`M ${BX[i] - 34} ${BY - 34} L ${BX[i] + 34} ${BY + 34} M ${BX[i] + 34} ${BY - 34} L ${BX[i] - 34} ${BY + 34}`, INK.red, 9, g));
  };

  // ---------- @ que anda (marca d'água própria) ----------
  const wm = WB.group(WB.overlay);
  WB.showNow(WB.textStrokes('@Cardeno_Amarelo', 0, 0, 46, INK.gray, wm, 'middle').strokes);
  const fimWm = WB.at(12, 0.55);
  WB.effect(t => {
    const x = 540 + 230 * Math.sin(t * 0.42);
    const y = 1690 + 70 * Math.sin(t * 0.61 + 1);
    wm.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    wm.setAttribute('opacity', t > fimWm ? Math.max(0, 0.55 - (t - fimWm) * 2) : 0.55);
  });

  // ---------- CENA 1: desafio lançado ----------
  const du = C.stamp('DUVIDO!', 540, 800, { size: 150, color: INK.red, rot: -6 });
  WB.draw(1, 0.62, 0.80, [du.box, du.text]);
  WB.write(1, 0.82, 0.97, 'tenta comigo', 540, 1060, 84, INK.black, { anchor: 'middle' });

  // ---------- instrução padrão de cada desafio ----------
  const instrucao = (cena, n, linhas, f0 = 0.10, f1 = 0.45) => {
    WB.newPage(cena, 0.0, 0.07);
    WB.draw(cena, f0, f0 + 0.05, [
      WB.strokePath(WB.circlePath(130, 480, 58), INK.blue, 7),
      WB.textStrokes(String(n), 130, 508, 84, INK.blue, null, 'middle').strokes,
    ]);
    WB.writeLines(cena, f0 + 0.06, f1, linhas, 220, 485, 76, INK.black, { lineHeight: 88 });
  };
  const reacao = (cena, linha1, linha2, cor = INK.red) => {
    const r = WB.write(cena, 0.05, 0.40, linha1, 540, 1390, 92, cor, { anchor: 'middle' });
    if (linha2) WB.write(cena, 0.42, 0.85, linha2, 540, 1480, 56, INK.gray, { anchor: 'middle' });
    return r;
  };

  // ---------- 1: lamber o cotovelo ----------
  instrucao(2, 1, ['Lambe o teu', 'cotovelo'], 0.06, 0.32);
  WB.draw(2, 0.34, 0.62, [
    WB.strokePath(WB.circlePath(330, 920, 130), INK.black, 7),
    WB.strokePath('M 300 870 L 300 890 M 380 870 L 380 890', INK.black, 8),
    WB.strokePath('M 360 975 Q 400 990 440 962', INK.black, 6),
    WB.strokePath('M 440 958 Q 530 940 560 968 Q 535 995 440 972', INK.red, 6),
  ]);
  WB.draw(2, 0.63, 0.82, [
    WB.strokePath('M 640 740 L 830 1060', INK.black, 12),
    WB.strokePath('M 830 1060 L 660 1210', INK.black, 12),
    WB.strokePath(WB.circlePath(830, 1060, 16), INK.black, 6),
  ]);
  let tr = '';
  for (let k = 0; k < 6; k++) {
    const a = k / 6, b = a + 0.09;
    tr += `M ${575 + (805 - 575) * a} ${972 + (1052 - 972) * a} L ${575 + (805 - 575) * b} ${972 + (1052 - 972) * b} `;
  }
  WB.draw(2, 0.83, 0.93, WB.strokePath(tr, INK.gray, 5));
  WB.restHand(2, 0.94, 1.0);
  xis(3, 0.02, 0.15, 0);
  reacao(3, 'Nem chegou perto!');
  WB.draw(3, 0.45, 0.70, C.circleAround(830, 1060, 60, 60, INK.red));

  // ---------- 2: falar PAPAI sem encostar os lábios ----------
  instrucao(4, 2, ['Fala PAPAI sem', 'encostar os lábios'], 0.08, 0.40);
  WB.draw(4, 0.42, 0.70, [
    WB.strokePath('M 330 860 Q 420 760 500 805 Q 540 785 580 805 Q 660 760 750 860 Q 540 890 330 860', INK.red, 7),
    WB.strokePath('M 330 950 Q 540 925 750 950 Q 650 1080 540 1080 Q 430 1080 330 950', INK.red, 7),
  ]);
  WB.draw(4, 0.72, 0.80, [C.arrow(540, 700, 540, 860, INK.gray, 5), C.arrow(540, 1190, 540, 1040, INK.gray, 5)]);
  WB.write(4, 0.81, 0.93, 'não encosta!', 540, 1250, 60, INK.gray, { anchor: 'middle' });
  WB.restHand(4, 0.94, 1.0);
  xis(5, 0.02, 0.15, 1);
  reacao(5, 'aaai?!', 'o P só sai com os lábios fechados', INK.orange);

  // ---------- 3: engolir e respirar ----------
  instrucao(6, 3, ['Engole e respira', 'ao mesmo tempo'], 0.08, 0.40);
  WB.write(6, 0.42, 0.48, 'boca', 540, 680, 54, INK.gray, { anchor: 'middle' });
  WB.draw(6, 0.49, 0.72, [
    WB.strokePath('M 500 710 L 500 860 L 360 1200 M 580 710 L 580 860 L 720 1200', INK.black, 7),
    WB.strokePath('M 440 1200 L 540 905 L 640 1200', INK.black, 7),
  ]);
  WB.draw(6, 0.73, 0.88, [
    WB.textStrokes('ar', 390, 1270, 66, INK.blue, null, 'middle').strokes,
    WB.textStrokes('comida', 690, 1270, 66, INK.orange, null, 'middle').strokes,
    C.arrow(600, 950, 660, 1120, INK.orange, 6),
  ]);
  WB.restHand(6, 0.90, 1.0);
  xis(7, 0.02, 0.10, 2);
  WB.draw(7, 0.12, 0.22, WB.strokePath('M 452 962 L 528 962', INK.red, 14));
  WB.write(7, 0.23, 0.30, 'fecha!', 300, 985, 60, INK.red, { anchor: 'middle' });
  WB.write(7, 0.32, 0.55, 'Não dá!', 540, 1390, 92, INK.red, { anchor: 'middle' });
  WB.write(7, 0.57, 0.88, 'o corpo fecha o caminho do ar', 540, 1480, 56, INK.gray, { anchor: 'middle' });

  // ---------- 4: cócegas em si mesmo ----------
  instrucao(8, 4, ['Faz cócegas', 'em ti mesmo'], 0.08, 0.40);
  WB.draw(8, 0.42, 0.72, C.stickFigure(400, 730, { scale: 1.1, color: INK.black }));
  WB.draw(8, 0.73, 0.90, [
    WB.strokePath('M 540 1010 Q 610 900 720 780', INK.purple, 6),
    WB.strokePath('M 600 920 L 560 890 M 620 895 L 585 860 M 645 865 L 612 830 M 670 840 L 640 800 M 610 925 L 650 940 M 632 898 L 672 908 M 656 868 L 696 875 M 682 840 L 720 842', INK.purple, 4),
  ]);
  WB.restHand(8, 0.92, 1.0);
  xis(9, 0.02, 0.12, 3);
  reacao(9, 'Nada, né?', 'o cérebro sabe que é tu');
  WB.draw(9, 0.80, 0.90, C.thought(800, 640, 150, 80, 470, 690));
  WB.write(9, 0.90, 0.98, 'é tu!', 800, 665, 64, INK.purple, { anchor: 'middle' });

  // ---------- 5: parar de pensar na respiração ----------
  instrucao(10, 5, ['Para de pensar na', 'tua respiração'], 0.30, 0.62);
  WB.draw(10, 0.64, 0.86, [
    WB.strokePath('M 540 640 L 540 770 M 540 770 L 515 800 M 540 770 L 565 800', INK.black, 7),
    WB.strokePath('M 515 800 Q 380 760 370 1000 Q 365 1160 490 1160 Q 520 1150 520 1050 Z', INK.black, 7),
    WB.strokePath('M 565 800 Q 700 760 710 1000 Q 715 1160 590 1160 Q 560 1150 560 1050 Z', INK.black, 7),
  ]);
  WB.write(10, 0.87, 0.94, 'automático', 540, 1270, 64, INK.gray, { anchor: 'middle' });
  WB.restHand(10, 0.95, 1.0);
  xis(11, 0.02, 0.10, 4);
  WB.draw(11, 0.11, 0.18, WB.strokePath('M 400 1250 L 680 1250', INK.red, 8));
  const st = C.stamp('MANUAL', 540, 960, { size: 120, color: INK.red, rot: -9 });
  WB.draw(11, 0.19, 0.50, [st.box, st.text]);
  WB.write(11, 0.52, 0.85, 'respirando no manual', 540, 1420, 76, INK.red, { anchor: 'middle' });

  // ---------- CTA ----------
  WB.newPage(12, 0.0, 0.05);
  WB.write(12, 0.06, 0.24, 'Manda pro amigo', 540, 520, 100, INK.black, { anchor: 'middle' });
  WB.write(12, 0.25, 0.44, 'que acha que consegue', 540, 615, 66, INK.gray, { anchor: 'middle' });
  WB.draw(12, 0.45, 0.52, WB.strokePath('M 700 690 L 900 640 L 780 760 L 760 700 Z M 760 700 L 900 640', INK.blue, 6));
  WB.ctaRedes(12, 0.55, 0.85, { y: 820, titulo: 'e me segue!', iconSize: 190 });
};
