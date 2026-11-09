// Peças da câmera em 1ª pessoa (papel recortado): mãos, tênis, celular, quarto. Carregado depois de lib.js e ator.js.
window.POV = (P, L) => {
  const { F, THREE } = P;
  const PELE = 0xe9b98e, PELE2 = 0xd9a77c, MANGA = 0x3f6fb5, MANGA2 = 0x34609e;
  const fx = (o) => Object.assign({ t: -1, entra: 'fixo', esboco: false }, o);   // tudo já pronto: nada é desenhado
  const V = {};
  V.fx = fx;
  // ---- câmera de cabeça: quadros [t, pos(mundo), alvo(mundo)] + respiração; devolve o "rig" (segue a câmera) ----
  V.cabeca = (quadros, o = {}) => {
    const kp = L.K(quadros.map(([t, p, a]) => [t, p.concat(a)]));
    const dummy = new THREE.PerspectiveCamera();
    const rig = P.grupo({ pai: P.fg });
    P.fov = o.fov ?? 52; P.foco = [-0.3, -0.2];
    P.animar((ts, t) => {
      const v = kp(t), br = o.resp ?? 1;
      const p = [v[0] + br * 0.02 * Math.sin(t * 0.9), v[1] + br * 0.025 * Math.sin(t * 1.3 + 1), v[2]];
      const a = [v[3] + br * 0.03 * Math.sin(t * 0.7), v[4] + br * 0.02 * Math.sin(t * 1.1), v[5]];
      const sh = o.treme ? o.treme(t) : 0;
      P.camera([{ t: 0, pos: [p[0] + sh * Math.sin(t * 83) * 0.02, p[1] + sh * Math.cos(t * 71) * 0.02, p[2]], alvo: a }]);
      dummy.position.set(p[0], p[1], p[2]); dummy.lookAt(a[0], a[1], a[2]);
      rig.position.copy(dummy.position); rig.quaternion.copy(dummy.quaternion);
    });
    return rig;
  };
  // ---- mão vista por cima (costas da mão), dedos pra cima. side: 1 = mão direita (polegar à esquerda), -1 = esquerda ----
  // devolve { g, dedos[4], polegar, manga }. Tamanho: palma 0.62 x 0.7 (escala pelo grupo)
  V.mao = (pai, side = 1, o = {}) => {
    const g = P.grupo({ pai, x: o.x || 0, y: o.y || 0, z: o.z || 0, rz: o.rz || 0 }); g.scale.setScalar(o.s ?? 1);
    const manga = P.grupo({ pai: g });
    P.peca(F.ret(0.78, 1.6, 0.12), fx({ pai: manga, prof: 0.05, cor: MANGA, y: -1.05, z: -0.02 }));
    P.peca(F.ret(0.8, 0.16, 0.06), fx({ pai: manga, prof: 0.06, cor: MANGA2, y: -0.32, z: -0.01 }));
    P.peca(F.ret(0.62, 0.62, 0.2), fx({ pai: g, prof: 0.05, cor: PELE, y: 0.02 }));
    const lens = [0.36, 0.46, 0.43, 0.32];   // mindinho .. indicador (da borda de fora pra dentro)
    const dedos = [0, 1, 2, 3].map((i) => {
      const x = side * (0.225 - i * 0.15);
      const d = P.grupo({ pai: g, x, y: 0.28, z: 0.004 });
      const L1 = lens[i];
      P.peca(F.ret(0.135, L1, 0.0675), fx({ pai: d, prof: 0.05, cor: PELE, y: L1 / 2 - 0.02 }));
      P.peca(F.ret(0.09, 0.012, 0.006), fx({ pai: d, prof: 0.052, cor: PELE2, y: L1 * 0.45, z: 0.001 }));   // dobrinha do dedo
      return d;
    });
    const polegar = P.grupo({ pai: g, x: -side * 0.27, y: -0.12, z: 0.008, rz: side * 0.55 });
    P.peca(F.ret(0.16, 0.42, 0.08), fx({ pai: polegar, prof: 0.05, cor: PELE, y: 0.18 }));
    return { g, dedos, polegar, manga };
  };
  // ---- tênis de perfil (bico pra +x) ----
  V.tenis = (pai, o = {}) => {
    const g = P.grupo({ pai, x: o.x || 0, y: o.y || 0, z: o.z || 0 }); g.scale.setScalar(o.s ?? 1);
    const up = new THREE.Shape();
    up.moveTo(-0.5, 0.08); up.lineTo(-0.5, 0.36); up.quadraticCurveTo(-0.5, 0.48, -0.38, 0.48);
    up.lineTo(-0.2, 0.44); up.quadraticCurveTo(-0.1, 0.62, 0.0, 0.58); up.lineTo(0.08, 0.5);
    up.quadraticCurveTo(0.3, 0.3, 0.44, 0.24); up.quadraticCurveTo(0.54, 0.2, 0.52, 0.08); up.closePath();
    P.peca(up, fx({ pai: g, prof: 0.14, cor: o.cor ?? 0xc93a2e }));
    P.peca(F.ret(1.1, 0.13, 0.06), fx({ pai: g, prof: 0.16, cor: 0xf8f3e8, y: 0.05, x: 0.01 }));                // sola
    P.peca(F.ret(1.1, 0.03, 0.015), fx({ pai: g, prof: 0.165, cor: 0x9a948a, y: 0.0, x: 0.01 }));
    const bico = new THREE.Shape(); bico.moveTo(0.2, 0.1); bico.quadraticCurveTo(0.3, 0.28, 0.44, 0.24); bico.quadraticCurveTo(0.54, 0.2, 0.52, 0.1); bico.closePath();
    P.peca(bico, fx({ pai: g, prof: 0.145, cor: 0xf8f3e8, z: 0.001 }));
    for (let i = 0; i < 3; i++) P.peca(F.ret(0.13, 0.035, 0.017), fx({ pai: g, prof: 0.15, cor: 0xf8f3e8, x: -0.02 + i * 0.09, y: 0.48 - i * 0.075, rz: -0.6, z: 0.002 }));
    P.peca(F.ret(0.5, 0.05, 0.025), fx({ pai: g, prof: 0.145, cor: 0xf8f3e8, x: -0.18, y: 0.2, rz: 0.12, z: 0.001 }));   // faixa lateral
    return g;
  };
  return V;
};
