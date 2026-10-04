// Esqueleto: uma tomada na sala com duas pessoas conversando.
window.CENAS = function (CT) {
  CT.fala('ana', [[0.2, 0.6], [0.6, 1.0], [1.0, 1.5]]);
  CT.legenda([[0.2, 'OI, TUDO BEM?'], [2.0, '']]);
  const s1 = CT.shot(0, CT.timeline.total, 'sala', { sofa: true });
  const ana = CT.pessoa(s1, { x: 360, y: 1480, voz: 'ana', cabelo: { tipo: 'coque', cor: '#9a5b2c' }, roupa: { tipo: 'camiseta', cima: '#b45cc8', baixo: '#22c55e', perna: 'calca' } });
  const beto = CT.pessoa(s1, { x: 720, y: 1480, flip: true, cabelo: { tipo: 'cacheado' }, oculos: true });
  ana.humor(0, 'sorriso').braco(0.2, 'd', 'acena');
  beto.olhar(0, -12).humor(1.6, 'arregalada');
};
