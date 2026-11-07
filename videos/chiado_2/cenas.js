// "Tu não vai entender essa frase" PARTE 2 (fala com chiado / vocoder de ruído). Tempos: timeline.json.
// c1 gancho · c2 chiado 1 · c3 mostra a frase · c4 "escuta de novo" · c5 chiado 2 · c6 explicação · c7 manda pro amigo
window.CENAS = function (WB) {
  const { INK, C } = WB;
  // marca d'água anda pelo rodapé durante o vídeo
  const wmRect = document.querySelector('rect[fill="#fffaf0"]');
  if (wmRect) { const wm = wmRect.parentNode; WB.effect(t => wm.setAttribute('transform', `translate(${(280 * Math.sin(2 * Math.PI * t / 14)).toFixed(1)} 0)`)); }
  // gancho na tela desde o quadro 0
  const p2 = C.stamp('PARTE 2', 540, 115, { size: 96, color: INK.red, rot: -4 });
  WB.showNow([p2.box, p2.text].flat());
  WB.showNow(WB.textStrokes('TU NÃO VAI ENTENDER', 540, 305, 96, INK.black, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('ESSA FRASE', 540, 420, 120, INK.red, null, 'middle').strokes);

  // c1: alto-falante
  const spk = [WB.strokePath(WB.roughRect(330, 520, 410, 640), INK.black, 8),
    WB.strokePath('M 410 520 L 500 450 L 500 710 L 410 640', INK.black, 8)];
  WB.draw(1, 0.15, 0.6, spk);
  const ondas = [0, 1, 2].map(i => WB.strokePath(WB.arcPath(510, 580, 60 + i * 55, 70 + i * 60, -0.9, 0.9), INK.blue, 7));
  WB.draw(1, 0.62, 0.95, ondas);

  // c2: chiado tocando -> rabisco de onda bagunçada
  let d = 'M 90 860'; let s = 3;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let x = 90; x <= 990; x += 14) d += ` L ${x} ${860 + (rnd() - 0.5) * (40 + 160 * Math.abs(Math.sin(x / 70)))}`;
  WB.draw(2, 0.02, 0.72, WB.strokePath(d, INK.gray, 5));
  WB.write(2, 0.76, 0.97, '???', 540, 1060, 140, INK.red, { anchor: 'middle' });

  // c3: "Agora lê o que tá escrito aqui" -> a frase
  const caixa = WB.strokePath(WB.roughRect(90, 1150, 990, 1560), INK.blue, 7);
  WB.draw(3, 0.48, 0.54, caixa);
  const linhas = ['Minha mãe escondeu', 'o controle dentro', 'da geladeira'];
  const fr = WB.writeLines(3, 0.55, 0.88, linhas, 540, 1260, 100, INK.blue, { anchor: 'middle', lineHeight: 120 });
  WB.restHand(3, 0.92, 1);

  // c4: escuta de novo
  WB.write(4, 0.05, 0.8, 'DE NOVO!', 855, 600, 76, INK.orange, { anchor: 'middle' });

  // c5: chiado de novo, sublinhando cada pedaço da frase no ritmo do som
  const sub = (l, f0, f1) => WB.draw(5, f0, f1, C.underline(540 - fr[l].width / 2, 540 + fr[l].width / 2, 1260 + l * 120 + 22, INK.red));
  sub(0, 0.04, 0.3); sub(1, 0.31, 0.56); sub(2, 0.57, 0.76);
  WB.restHand(5, 0.88, 1);

  // c6: folha nova, explicação
  WB.newPage(6, 0, 0.05);
  WB.write(6, 0.07, 0.24, 'O SOM É O MESMO', 540, 330, 104, INK.black, { anchor: 'middle' });
  const onda = (x0, cor) => {
    let p = `M ${x0} 560`; let s2 = 3;
    for (let x = 0; x <= 300; x += 14) { s2 = (s2 * 9301 + 49297) % 233280; p += ` L ${x0 + x} ${560 + (s2 / 233280 - 0.5) * 120}`; }
    return WB.strokePath(p, cor, 5);
  };
  WB.draw(6, 0.25, 0.33, onda(100, INK.gray));
  WB.write(6, 0.33, 0.37, '=', 540, 600, 120, INK.black, { anchor: 'middle' });
  WB.draw(6, 0.37, 0.45, onda(680, INK.gray));
  // cérebro com lâmpada
  WB.draw(6, 0.47, 0.62, [WB.strokePath(WB.cloudPath(540, 930, 270, 180), INK.purple, 8),
    WB.strokePath('M 400 900 Q 460 840 520 900 T 640 900 M 420 990 Q 500 950 580 1000 T 690 980', INK.purple, 6)]);
  WB.write(6, 0.64, 0.8, 'quem mudou foi', 540, 1250, 80, INK.black, { anchor: 'middle' });
  WB.write(6, 0.8, 0.95, 'TEU CÉREBRO', 540, 1370, 110, INK.purple, { anchor: 'middle' });

  // c7: manda pro amigo
  WB.write(7, 0.02, 0.3, 'entendeu de primeira?', 540, 1500, 76, INK.orange, { anchor: 'middle' });
  WB.write(7, 0.34, 0.55, 'manda pra um amigo', 540, 1595, 76, INK.blue, { anchor: 'middle' });
  WB.write(7, 0.55, 0.7, 'sem mostrar a tela!', 540, 1685, 68, INK.red, { anchor: 'middle' });
  WB.restHand(7, 0.75, 1);
};
