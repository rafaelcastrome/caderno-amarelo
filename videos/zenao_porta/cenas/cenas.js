// Cenas do vídeo. Cada cena N tem a duração do áudio N (timeline.json);
// os tempos são frações da cena: draw(cena, inicio, fim, traços).
// API completa: references/api.md da skill whiteboard-video.
window.CENAS = function (WB) {
  const { INK, C } = WB;

  // ---- Cena 1 ----
  const titulo = WB.write(1, 0.05, 0.45, 'Título do vídeo', 540, 205, 104, INK.black, { anchor: 'middle' });
  WB.draw(1, 0.47, 0.57, C.underline(540 - titulo.width / 2, 540 + titulo.width / 2, 238));
  WB.draw(1, 0.60, 0.95, C.stickFigure(540, 700, { label: 'Você' }));

  // ---- Cena 2 (última: convite para seguir) ----
  WB.ctaRedes(2, 0.10, 0.80, { y: 780 });
};
