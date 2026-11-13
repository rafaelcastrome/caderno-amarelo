window.CENA = (P) => { const L = window.LIB(P); window.ATOR(P, L); window.CLIPE(P, L);
  L.clipe({ x: -0.9, velho: true, caixa: [[0,1]], bracos: [[0,'carrega']] });
  L.clipe({ x: 0.9, sobr: [[0,0.2],[1.5,1]], bracos: [[0,'repouso'],[1,'aceno',0.4]], brilho: [[0,0]] });
  P.camera([{ t: 0, pos: [0, 2.6, 9], alvo: [0, 0.8, 0] }, { t: 3, pos: [0, 2.6, 8.8], alvo: [0, 0.8, 0] }]);
  return { dur: 3 }; };
