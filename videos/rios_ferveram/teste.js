window.CENA = (T) => {
  T.fisheye.k.value = 0; T.fisheye.vin.value = 0.25; T.cam.fov = 45; T.cam.updateProjectionMatrix();
  T.cena.background = new THREE.Color('#f7c6c0');
  const chao = T.m(new THREE.PlaneGeometry(30, 30), '#f0a49d', null, { sem: true }); chao.rotation.x = -Math.PI / 2;
  const b1 = POV.bacteria(null, '#7cc96a'); b1.position.set(-1.4, 0, 0);
  const b2 = POV.bacteria(null, '#b98ae0', { velho: true }); b2.position.set(-0.5, 0, 0.3);
  const h = POV.hemacia(null); h.position.set(0.4, 0.2, 0.2);
  const l = POV.leucocito(null); l.position.set(1.4, 0, 0);
  const p = POV.plaqueta(null); p.position.set(-1.0, 0, 1.1);
  const v = POV.virus(null); v.position.set(0.2, 0.5, 1.2);
  const n = POV.neuronio(null); n.position.set(1.2, 0.8, 1.0);
  const c = POV.coracao(null, 0.6); c.position.set(0, 2.6, -2);
  T.cada((t) => { b1.userData.anda(t); c.userData.bate(t); });
  T.cam.position.set(0, 2.2, 8.5); T.cam.lookAt(0, 0.9, 0);
  return { dur: 2 };
};
