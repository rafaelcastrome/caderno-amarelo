window.CENA = (T) => {
  T.fisheye.k.value = 0.05; T.cam.fov = 40; T.cam.updateProjectionMatrix();
  T.cena.background = new THREE.Color('#cfe6f5');
  const ex = [{}, { ri: 1, ab: 0.9, feliz: 0.5 }, { ri: 0.2, ab: 0.6, sob: 1 }, { ri: 0, pi: 0.7, bravo: -0.6, sob: -0.3 }];
  ex.forEach((e, i) => { const B = T.bebe({}); B.g.position.set((i % 2) * 0.5 - 0.25, -0.45 - Math.floor(i / 2) * 0.55, 0); B.rosto(e); if (i == 3) { T.cen.chocolate(B); } });
  T.cada((t) => { T.cam.position.set(0, -0.0, 1.9); T.cam.lookAt(0, 0.0, 0); });
  return { dur: 1 };
};
