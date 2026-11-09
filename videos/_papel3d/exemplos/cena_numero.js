// Exemplo: número de papel (o que o Flow não consegue: letra e número certinhos), nuvens e aviãozinho, 4 s.
window.CENA = (P) => {
  const { F, CORES: C } = P;
  // nuvens de papel em camadas, atrás
  [[-1.9, 2.7, -0.6, 1.0, 0.2], [1.8, 3.0, -0.8, 0.8, 0.35], [-0.2, 3.5, -1.2, 0.7, 0.5]].forEach(([x, y, z, s, t]) => {
    P.peca(F.nuvem(1.6 * s, 0.7 * s), { cor: C.BRANCO, prof: 0.05, x, y, z, t, entra: 'pop' });
    P.peca(F.nuvem(1.2 * s, 0.5 * s), { cor: C.AZUL_CLARO, prof: 0.03, x: x + 0.1, y: y - 0.05, z: z - 0.06, t: t + 0.05, entra: 'pop', esboco: false });
  });
  // o número: cada algarismo é uma peça grossa, com sombra de outra cor atrás (duas camadas)
  P.texto('18', { tam: 3.2, prof: 0.16, cor: C.VERMELHO, x: 0, y: 0.05, z: 0.25, t: 0.6, passo: 0.25, entra: 'cai' });
  P.texto('18', { tam: 3.2, prof: 0.1, cor: C.AMARELO, x: 0.07, y: 0.02, z: 0.05, t: 0.9, passo: 0.25, entra: 'cai', esboco: false });
  // base: tira de papel verde deitada
  P.deitado(F.ret(4.6, 1.4, 0.3), { cor: C.VERDE_CLARO, x: 0, y: 0, z: 0.4, t: 0.2 });
  // aviãozinho de papel atravessando
  const av = P.grupo({ x: -3, y: 3.2, z: 0.6 });
  P.peca(F.poligono([[0.7, 0], [-0.5, 0.32], [-0.3, 0], [-0.5, -0.32]]), { pai: av, cor: C.BRANCO, prof: 0.02, t: 1.6, entra: 'pop', rx: 0.5 });
  P.animar((ts) => { const k = Math.max(0, ts - 1.6); av.position.set(-3 + k * 2.6, 3.2 + Math.sin(k * 3) * 0.15, 0.6); av.rotation.z = Math.cos(k * 3) * 0.15; });
  P.camera([{ t: 0, pos: [0.0, 10.8, 13.2], alvo: [0, 1.1, 0.4] }, { t: 4, pos: [-0.3, 9.8, 11.8], alvo: [0, 1.2, 0.4] }]);
  return { dur: 4 };
};
