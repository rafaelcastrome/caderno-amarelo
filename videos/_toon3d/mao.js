// Mão anatômica toon: palma arredondada + 4 dedos de 3 falanges + polegar de 3 ossos.
// Espaço local: dedos apontam +Y, palma (lado de dentro) olha -Z, dorso +Z. sx=1 mão direita (polegar em -X), sx=-1 esquerda.
// T.mao({pele, sx, esc, pai}) -> M; M.pose({dedos:[[mcp,pip,dip] x4], abre, pol:[base_z, base_x, j1, j2]}); M.ponta (indicador) ; M.pulso (Object3D)
(function () {
  const T = window.T;
  // caixa de quinas arredondadas (vértices empurrados pra superfície de uma caixa "inflada")
  T.caixaRed = (w, h, d, r, seg = 8) => {
    const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg), p = g.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3();
    const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      c.set(T.clamp(v.x, -hx, hx), T.clamp(v.y, -hy, hy), T.clamp(v.z, -hz, hz));
      v.sub(c).normalize().multiplyScalar(r).add(c); p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals(); return g;
  };
  const LENS = [[0.025, 0.016, 0.0135], [0.028, 0.018, 0.0145], [0.026, 0.017, 0.014], [0.02, 0.013, 0.012]];
  const RAIO = [0.0084, 0.0086, 0.0082, 0.0074];
  T.mao = (o = {}) => {
    const sx = o.sx || 1, pele = o.pele || '#f1c6a2', unhaCor = o.unha || '#f7d8c4', w = o.w || 0.0028;
    const g = T.grupo(o.pai); const M = { g };
    const corpo = T.grupo(g); corpo.scale.setScalar(o.esc || 1);
    const palma = T.m(T.caixaRed(0.074, 0.08, 0.026, 0.012), pele, corpo, { w });
    palma.position.y = 0.0;
    const pulso = T.capsula(0.026, 0.02, pele, corpo, { w }); pulso.position.set(0.002 * sx, -0.052, 0.002); pulso.scale.set(1.15, 1, 0.72);
    M.pulso = T.grupo(corpo, 0, -0.07, 0);
    // dedos
    M.dedos = [];
    const xs = [-0.026, -0.0088, 0.0088, 0.0255];
    for (let i = 0; i < 4; i++) {
      const base = T.grupo(corpo, xs[i] * sx, 0.034 - (i === 3 ? 0.006 : i === 0 ? 0.002 : 0), 0.001);
      const juntas = []; let pai = base;
      for (let k = 0; k < 3; k++) {
        const j = T.grupo(pai, 0, k === 0 ? 0 : LENS[i][k - 1], 0);
        const r = RAIO[i] * (1 - k * 0.06), L = LENS[i][k];
        const c = T.capsula(r, Math.max(0.001, L - r * 0.4), pele, j, { w }); c.position.y = L / 2;
        if (k === 2) { const u = T.esfera(r * 0.62, unhaCor, j, { sem: true }); u.scale.set(1, 1.3, 0.35); u.position.set(0, L * 0.62, r * 0.78); }
        juntas.push(j); pai = j;
      }
      const ponta = T.grupo(pai, 0, LENS[i][2] + RAIO[i] * 0.5, 0);
      M.dedos.push({ base, juntas, ponta });
    }
    M.ponta = M.dedos[0].ponta;
    // polegar: sai da lateral de baixo da palma, do lado do indicador
    const pb = T.grupo(corpo, -0.03 * sx, -0.022, -0.006);
    const PL = [0.03, 0.021, 0.018]; const pj = []; let pp = pb;
    for (let k = 0; k < 3; k++) {
      const j = T.grupo(pp, 0, k === 0 ? 0 : PL[k - 1], 0); const r = 0.0105 - k * 0.0007;
      const c = T.capsula(r, PL[k] - r * 0.3, pele, j, { w }); c.position.y = PL[k] / 2;
      if (k === 0) c.scale.set(1.25, 1, 1.1);
      if (k === 2) { const u = T.esfera(r * 0.62, unhaCor, j, { sem: true }); u.scale.set(1, 1.3, 0.35); u.position.set(0, PL[k] * 0.6, r * 0.78); }
      pj.push(j); pp = j;
    }
    M.polPonta = T.grupo(pp, 0, PL[2] + 0.005, 0);
    M.pol = pj;
    M.pose = (p = {}) => {
      const d = p.dedos || [[0.2, 0.25, 0.15], [0.22, 0.28, 0.15], [0.25, 0.3, 0.16], [0.28, 0.32, 0.18]];
      const abre = p.abre == null ? 0.06 : p.abre;
      M.dedos.forEach((f, i) => {
        f.base.rotation.set(0, 0, (i - 1.5) * -abre * sx);
        f.juntas.forEach((j, k) => { j.rotation.x = -(d[i][k] || 0); });
      });
      const q = p.pol || [0.75, 0.35, 0.25, 0.2];
      pj[0].rotation.set(-q[1], 0, q[0] * sx, 'ZXY'); pj[1].rotation.x = -q[2]; pj[2].rotation.x = -q[3];
      // flexão do polegar em direção à palma: gira em torno do próprio eixo de curva
    };
    M.pose();
    return M;
  };
  // orienta uma mão: dedos (+Y local) na direção 'dir', dorso (+Z local) o mais perto possível de 'dorso' (vetores no espaço do pai)
  T.orientaMao = (M, dir, dorso) => {
    const y = dir.clone().normalize(), z = dorso.clone().sub(y.clone().multiplyScalar(dorso.dot(y))).normalize(), x = new THREE.Vector3().crossVectors(y, z);
    M.g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  };
})();
