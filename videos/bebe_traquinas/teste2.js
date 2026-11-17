window.CENA = (T) => {
  const C = T.cen, P = C.P;
  T.fisheye.k.value = 0.03; T.cam.fov = 40; T.cam.updateProjectionMatrix();
  T.cena.background = new THREE.Color('#cfe6f5');
  const chao = T.caixa(8, 0.02, 8, '#e9d8b8', null, { sem: true }); chao.position.y = -0.01;
  const L = [P.engatinha, P.sentado, C.mix(P.pe, P.bracosCima), P.agachado, P.deitadoBarriga, C.cicloCorre(0.25), C.mix(P.pe, P.festa), P.equilibra];
  L.forEach((p, i) => { const B = T.bebe({}); B.g.position.set((i % 2) * 0.9 - 0.45, 0, -Math.floor(i / 2) * 0.0); B.g.position.y = Math.floor(i / 2) * -0.0; B.pose(p); B.g.position.x += 0; B.g.position.set((i % 2) * 1.1 - 0.55, (3 - Math.floor(i / 2)) * 1.05 - 1.2, 0); B.g.rotation.y = 1.2; const pl = T.caixa(0.9, 0.02, 0.5, '#bba98a', null, { sem: true }); pl.position.copy(B.g.position); });
  T.cada((t) => { T.cam.position.set(0, 0.6, 6.5); T.cam.lookAt(0, 0.6, 0); });
  return { dur: 1 };
};
