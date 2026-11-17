window.CENA = (T) => {
  T.fisheye.k.value = 0.05; T.cam.fov = 40; T.cam.updateProjectionMatrix();
  T.cena.background = new THREE.Color('#cfe6f5');
  const chao = T.caixa(6, 0.02, 6, '#e9d8b8', null, { sem: true }); chao.position.y = -0.01;
  const poses = [
    {}, { ry: 0.7 }, { ry: Math.PI / 2 }, { bE: [-2.8, 0.2, 0, -0.2], bD: [-2.8, 0.2, 0, -0.2], pE: [-1.4, 0.1, 1.6, 0], ry: 0.4 }
  ];
  const BB = poses.map((p, i) => { const B = T.bebe({ camisa: '#4f8fe0', estampa: '#ffd23a' }); B.g.position.set((i % 2) * 0.7 - 0.35, i < 2 ? 0.7 : 0, 0); B.pose(p); return B; });
  BB[1].rosto({ ri: 1, ab: 0.8, feliz: 0.3 }); BB[3].rosto({ ri: 0.8, sob: 1, ox: 0.5 });
  T.cada((t) => { T.cam.position.set(0, 0.8, 3.1); T.cam.lookAt(0, 0.75, 0); });
  return { dur: 1 };
};
