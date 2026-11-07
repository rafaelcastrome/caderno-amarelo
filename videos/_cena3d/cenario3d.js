// Cenários 3D (sem papel) pra minissérie: cabine de avião anos 70 e floresta amazônica. window.CEN3D(P, L).
window.CEN3D = (P, L) => {
  const { THREE, G, malha, mat } = P;
  const esc = (c, f) => new THREE.Color(c).multiplyScalar(f).getHex();
  L.CAM = (ks) => P.camera(ks.map(([t, pos, alvo]) => ({ t, pos, alvo })));
  L.CORTE = (ks) => ks.flatMap(([t, pos, alvo], i) => (i ? [[t - 0.001, ks[i - 1][1], ks[i - 1][2]], [t, pos, alvo]] : [[t, pos, alvo]]));
  // ------------------------- cabine -------------------------
  L.poltrona = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, pai: o.pai });
    const cor = o.cor ?? 0xc4642a, m = mat(cor, { rug: 0.9 }), mE = mat(esc(cor, 0.8), { rug: 0.9 });
    malha(G.caixaR(0.5, 0.13, 0.44, 0.05), m, { pai: g, x: 0.02, y: 0.55 }); // assento
    malha(G.caixaR(0.14, 1.0, 0.44, 0.06), m, { pai: g, x: -0.26, y: 1.06, rz: -0.1 }); // encosto
    malha(G.caixaR(0.15, 0.2, 0.38, 0.05), mat(0xece4d2, { rug: 0.85 }), { pai: g, x: -0.31, y: 1.44, rz: -0.1 }); // capinha
    malha(G.caixaR(0.5, 0.06, 0.4, 0.02), mE, { pai: g, x: 0.0, y: 0.47 });
    malha(G.cil(0.03, 0.03, 0.45, 12), mat(0x8a8a90, { rug: 0.35, metal: 0.6 }), { pai: g, x: 0.0, y: 0.23 });
    malha(G.caixaR(0.55, 0.04, 0.3, 0.015), mat(0x7a7a80, { rug: 0.4, metal: 0.5 }), { pai: g, y: 0.02 });
    if (o.braco) malha(G.caixaR(0.42, 0.05, 0.06, 0.02), mat(0x8a8a90, { rug: 0.4, metal: 0.4 }), { pai: g, x: 0.0, y: 0.78, z: -0.25 });
    return g;
  };
  // fileira de 3; gente: [{...ficha, lugar}]
  L.fileira = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, pai: o.pai, rx: o.rx || 0, ry: o.ry || 0, rz: o.rz || 0 });
    for (let i = 0; i < 3; i++) L.poltrona({ pai: g, z: -0.5 + i * 0.52, cor: [0xc4642a, 0xb85a26, 0xa85222][i] });
    (o.gente || []).forEach((a) => L.ator(Object.assign({ x: 0.08, z: -0.5 + (a.lugar ?? 0) * 0.52, D: o.D ?? 30, pai: g, poses: [[0, 'sentado']] }, a)));
    if (o.cinto) malha(G.caixaR(0.3, 0.05, 0.02, 0.008), mat(0xb8b2a6), { pai: g, x: 0.12, y: 0.75, z: -0.5 + (o.cinto - 1) * 0.52 + 0.17 });
    return g;
  };
  // parede da janela (atrás, em z = zP), janelas ovais furadas; devolve grupos atrás de cada janela pra pôr nuvens
  L.cabine = (o = {}) => {
    const zP = o.z ?? -1.0, xs = o.xs ?? [-3.0, -1.6, -0.2, 1.2, 2.6], jy = o.jy ?? 1.62, w = o.w ?? 12;
    const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, 2.9); sh.lineTo(-w / 2, 2.9); sh.closePath();
    xs.forEach((x) => { const f = new THREE.Path(); f.absellipse(x, jy, 0.22, 0.3, 0, Math.PI * 2, true); sh.holes.push(f); });
    malha(G.forma(sh, 0.08, 0.01), mat(o.corParede ?? 0xe6dfcf, { rug: 0.75 }), { pai: o.pai, z: zP });
    xs.forEach((x) => { const a = new THREE.Shape(); a.absellipse(0, 0, 0.31, 0.4, 0, Math.PI * 2, false); const b = new THREE.Path(); b.absellipse(0, 0, 0.22, 0.3, 0, Math.PI * 2, true); a.holes.push(b);
      malha(G.forma(a, 0.05, 0.02), mat(0xd2c9b6, { rug: 0.5 }), { pai: o.pai, x, y: jy, z: zP + 0.06 });
      malha(G.caixaR(0.44, 0.06, 0.04, 0.015), mat(0xbcb29c, { rug: 0.6 }), { pai: o.pai, x, y: jy + 0.33, z: zP + 0.08 }); });
    malha(G.caixaR(w, 0.06, 0.05, 0.02), mat(0xb4a990, { rug: 0.6 }), { pai: o.pai, y: 1.02, z: zP + 0.07 }); // friso
    malha(G.caixa(w, 0.08, 4.0), mat(0x5a5048, { rug: 0.95 }), { pai: o.pai, y: -0.04, z: zP + 2.0 }); // carpete
    malha(G.caixaR(w, 0.5, 0.8, 0.08), mat(0xded6c2, { rug: 0.6 }), { pai: o.pai, y: 2.55, z: zP + 0.42 }); // bagageiro
    malha(G.caixa(w, 0.04, 0.82), mat(0xa89e88, { rug: 0.6 }), { pai: o.pai, y: 2.29, z: zP + 0.43 });
    for (let i = 0; i < 8; i++) malha(G.cil(0.035, 0.035, 0.02, 16), mat(0xfff4d8, { emis: 0xfff0c8, emisI: 0.5 }), { pai: o.pai, x: -3.5 + i, y: 2.27, z: zP + 0.75, sombra: false });
    malha(G.caixa(w, 0.05, 3.0), mat(0xece6d8, { rug: 0.8 }), { pai: o.pai, y: 3.0, z: zP + 1.4 }); // teto
    // céu atrás das janelas
    const ceu = P.grupo({ pai: o.pai, z: zP - 0.6 });
    malha(G.caixa(w + 4, 4, 0.05), mat(o.ceu ?? 0x8fc0e4, { rug: 1, emis: o.ceu ?? 0x8fc0e4, emisI: 0.55 }), { pai: ceu, y: jy, z: -0.2, sombra: false });
    return xs.map((x) => P.grupo({ pai: ceu, x, y: jy }));
  };
  L.nuvem = (pai, o = {}) => { const g = P.grupo({ pai, x: o.x || 0, y: o.y || 0, z: o.z || 0 }); const r = P.fixo(o.semente ?? 3), m = mat(o.cor ?? 0xffffff, { rug: 1, emis: o.cor ?? 0xffffff, emisI: o.brilho ?? 0.35 });
    for (let i = 0; i < 6; i++) malha(G.esfera(0.12 + r() * 0.1, 16, 12), m, { pai: g, x: (i - 2.5) * 0.12, y: r() * 0.06, z: r() * 0.05, sombra: false }); g.scale.setScalar(o.s ?? 1); return g; };
  // ------------------------- floresta -------------------------
  const VERDES = [0x1e4a2a, 0x275a32, 0x2f6a3a, 0x3d7a44, 0x4f8c4c];
  const folhaGeo = (() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(0.12, 0.2, 0, 0.55); s.quadraticCurveTo(-0.12, 0.2, 0, 0); const g = new THREE.ShapeGeometry(s, 8);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, -0.25 * Math.pow(p.getY(i), 2)); g.computeVertexNormals(); return g; })();
  // nuvem de folhas instanciadas em volta de um ponto (copa, arbusto)
  L.folhagem = (o) => {
    const n = o.n ?? 120, r = P.fixo(o.semente ?? 1), cores = o.cores ?? VERDES;
    const im = new THREE.InstancedMesh(folhaGeo, new THREE.MeshStandardMaterial({ roughness: 0.75, side: THREE.DoubleSide }), n);
    const d = new THREE.Object3D(), c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, b = Math.acos(2 * r() - 1), rr = Math.cbrt(r());
      d.position.set(Math.sin(b) * Math.cos(a) * o.rx * rr, Math.cos(b) * o.ry * rr, Math.sin(b) * Math.sin(a) * o.rz * rr);
      d.rotation.set(r() * 6.3, r() * 6.3, r() * 6.3); d.scale.setScalar((o.s ?? 1) * (0.7 + r() * 0.6)); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
      im.setColorAt(i, c.setHex(cores[Math.floor(r() * cores.length)]).multiplyScalar(0.85 + r() * 0.3));
    }
    im.castShadow = o.sombra !== false; im.receiveShadow = true; im.position.set(o.x || 0, o.y || 0, o.z || 0); (o.pai || P.raiz).add(im); return im;
  };
  L.arvore = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0 }); const h = o.h ?? 6, r = P.fixo(o.semente ?? Math.round((o.x || 0) * 13 + 50)), wb = o.larg ?? 0.22;
    const cT = o.tronco ?? [0x5e4634, 0x4e3a2c, 0x6a5440][(o.semente ?? 0) % 3];
    malha(G.torno([[wb * 1.25, 0], [wb, 0.5], [wb * 0.75, h * 0.5], [wb * 0.55, h], [0.0, h + 0.05]], 18), mat(cT, { rug: 0.95 }), { pai: g });
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + r() * 0.6; // sapopemas
      const sp = new THREE.Shape(); sp.moveTo(0, 0); sp.lineTo(wb * 3.2, 0); sp.quadraticCurveTo(wb * 1.2, 0.25, 0, 1.0 + r() * 0.5); sp.closePath();
      malha(G.forma(sp, 0.05, 0.015), mat(esc(cT, 0.9), { rug: 0.95 }), { pai: g, ry: a }); }
    for (let k = 0; k < 4; k++) L.folhagem({ pai: g, x: (r() - 0.5) * 1.6, y: h + r() * 0.8, z: (r() - 0.5) * 1.6, rx: 1.2 + r() * 0.6, ry: 0.5, rz: 1.2 + r() * 0.6, n: 70, s: 0.9, semente: (o.semente ?? 0) * 7 + k });
    if (o.cipo !== false) L.cipo({ a: [(o.x || 0) + 0.2, h * 0.95, (o.z || 0)], b: [(o.x || 0) + 1.4, h * 0.75, (o.z || 0) + 0.3], queda: 0.5 });
    return g;
  };
  L.cipo = (o) => { const [x0, y0, z0] = o.a, [x1, y1, z1] = o.b, pts = [];
    for (let i = 0; i <= 24; i++) { const k = i / 24; pts.push(new THREE.Vector3(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k - (o.queda ?? 0.8) * 4 * k * (1 - k), z0 + (z1 - z0) * k)); }
    malha(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, o.r ?? 0.018, 6), mat(o.cor ?? 0x4a5a2a, { rug: 0.9 }), {}); };
  // samambaia: frondes arqueadas com folíolos instanciados
  L.samambaia = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, s: o.s ?? 1 }); const r = P.fixo(o.semente ?? 5);
    const fol = new THREE.InstancedMesh(folhaGeo, new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide }), 9 * 22 * 2);
    const d = new THREE.Object3D(), c = new THREE.Color(); let n = 0;
    for (let k = 0; k < 9; k++) { const az = k / 9 * Math.PI * 2 + r() * 0.3, len = 0.8 + r() * 0.4;
      for (let i = 1; i <= 22; i++) { const u = i / 22, el = 1.2 - u * 1.9, rr = len * u; const px = Math.cos(az) * rr * 0.9, py = Math.sin(1.2) * rr * 0.9 * (1 - u) + 0.05 + 0.5 * u * (1 - u), pz = Math.sin(az) * rr * 0.9;
        for (const s of [1, -1]) { d.position.set(px, py, pz); d.rotation.set(0, -az + s * Math.PI / 2, el * 0.3); d.rotateX(s * 1.2); d.scale.setScalar(0.35 * Math.sin(Math.PI * (0.15 + 0.85 * (1 - u)))); d.updateMatrix(); fol.setMatrixAt(n, d.matrix);
          fol.setColorAt(n++, c.setHex(o.cor ?? 0x4c8a4a).multiplyScalar(0.8 + r() * 0.35)); } } }
    fol.castShadow = true; fol.receiveShadow = true; g.add(fol); return g;
  };
  L.folhaGrande = (o = {}) => { const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, rz: o.rz || 0, ry: o.ry || 0, s: o.s ?? 1 });
    malha(folhaGeo, mat(o.cor ?? 0x3f7f45, { rug: 0.7, lados: true }), { pai: g, s: [5.5, 4.0, 3] }); P.animar((t) => { g.rotation.z = (o.rz || 0) + Math.sin(t * 1.3 + (o.x || 0)) * 0.04; }); return g; };
  L.chao = (o = {}) => { const geo = new THREE.PlaneGeometry(o.w ?? 40, o.d ?? 40, 80, 80); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position, r = P.fixo(o.semente ?? 2);
    const cores = [], c = new THREE.Color(); for (let i = 0; i < p.count; i++) { p.setY(i, Math.sin(p.getX(i) * 0.7) * Math.cos(p.getZ(i) * 0.6) * 0.04); c.setHex(o.cor ?? 0x4a3a28).multiplyScalar(0.8 + r() * 0.35); cores.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); m.receiveShadow = true; m.position.set(o.x || 0, o.y || 0, o.z || 0); P.raiz.add(m);
    // folhas secas
    const n = o.folhas ?? 400, im = new THREE.InstancedMesh(folhaGeo, new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide }), n), d = new THREE.Object3D();
    for (let i = 0; i < n; i++) { d.position.set((r() - 0.5) * (o.wf ?? 14), 0.05, (r() - 0.5) * (o.df ?? 10) + (o.zf ?? 0)); d.rotation.set(-Math.PI / 2 + (r() - 0.5) * 0.4, 0, r() * 6.3); d.scale.setScalar(0.35 + r() * 0.3); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
      im.setColorAt(i, c.setHex([0x7a5a32, 0x6a4a28, 0x8a6a3a, 0x5a5a2a][i % 4]).multiplyScalar(0.8 + r() * 0.4)); }
    im.receiveShadow = true; P.raiz.add(im); return m; };
  L.riacho = (o = {}) => { const g = P.grupo({ x: o.x || 0, z: o.z || 0 });
    malha(G.caixa(o.w ?? 30, 0.02, o.larg ?? 1.6), mat(o.cor ?? 0x4a6a6c, { rug: 0.12, metal: 0.25 }), { pai: g, y: 0.03 });
    const r = P.fixo(o.semente ?? 3), rs = [];
    for (let i = 0; i < 14; i++) rs.push([malha(new THREE.RingGeometry(0.04, 0.048, 24), mat(0x9ab8b8, { rug: 0.3, lados: true }), { pai: g, x: -6 + r() * 12, y: 0.045, z: (r() - 0.5) * (o.larg ?? 1.6) * 0.85, rx: -Math.PI / 2, sombra: false }), r()]);
    P.animar((t) => rs.forEach(([m, k]) => { const u = (t * 0.6 + k) % 1; m.scale.setScalar(0.5 + u * 1.6); m.material.opacity = 0.6 * (1 - u); m.position.x = ((-6 + k * 12 + t * (o.v ?? 0.3)) + 7) % 14 - 7; }));
    rs.forEach(([m]) => { m.material = m.material.clone(); m.material.transparent = true; });
    return g; };
  L.raiosLuz = (o = {}) => { const r = P.fixo(o.semente ?? 12);
    for (let i = 0; i < (o.n ?? 4); i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5 + r() * 0.5, 12), new THREE.MeshBasicMaterial({ color: o.cor ?? 0xfff2c8, transparent: true, opacity: (o.op ?? 0.08) * (0.6 + r() * 0.6), depthWrite: false, side: THREE.DoubleSide }));
      m.position.set((o.x ?? 0) - 3 + i * 1.8 + r() * 0.6, 4.5, (o.z ?? -1.5) + r() * 2); m.rotation.z = 0.35; P.raiz.add(m); } };
  L.floresta = (o = {}) => {
    P.fundo(o.ceu ?? 0x6f8f78); P.neblina(o.ceu ?? 0x6f8f78, o.perto ?? 6, o.longe ?? 22);
    P.hemi.color.setHex(0xd8ecd0); P.hemi.groundColor.setHex(0x3a3020); P.hemi.intensity = 0.9; P.sol.intensity = o.sol ?? 2.0; P.sol.color.setHex(0xfff0d0);
    L.chao({ cor: 0x4a3a28, zf: -1 });
    const r = P.fixo(o.semente ?? 9);
    for (let c = 0; c < 4; c++) for (let i = 0; i < 7; i++) L.arvore({ x: -7 + i * 2.2 + r() * 1.0, z: -2.5 - c * 1.8 - r() * 0.6, h: 5.5 + r() * 2.5, semente: c * 10 + i, cipo: c >= 2 && r() > 0.4, larg: 0.16 + r() * 0.1 });
    for (let i = 0; i < 7; i++) L.samambaia({ x: -5 + i * 1.7 + r() * 0.6, z: -1.6 - r() * 0.8, s: 0.8 + r() * 0.5, semente: i, cor: [0x4c8a4a, 0x3a7440][i % 2] });
    for (let i = 0; i < 6; i++) L.folhagem({ x: -6 + i * 2.4 + r(), y: 0.5, z: -2.2 - r(), rx: 0.8, ry: 0.5, rz: 0.6, n: 90, s: 0.8, semente: 100 + i });
    if (o.luz !== false) L.raiosLuz({ z: -2.0 });
  };
};
