// Bebê toon 3D (cabeção, bochechas, fralda) com esqueleto simples por rotações.
// T.bebe({pai, camisa, short, cabelo}) -> B. B.g = raiz (no chão, entre os pés).
// B.pose(P) aplica uma pose: { y, rx, ry, rz (raiz), tr:[x,y,z] (tronco), cb:[x,y,z] (cabeça),
//   bE/bD:[ombroX, ombroZ(abre), ombroY, cotovelo], pE/pD:[quadrilX, quadrilZ(abre), joelho, pe] }
// B.rosto({ri: sorriso 0..1, ab: boca aberta 0..1, pi: piscada, sob: sobrancelha -1..1 (levanta>0), ox, oy (olhar)})
// B.maos(f) fecha as mãos (0 aberta, 1 fechada)
(function () {
  const T = window.T, V = THREE.Vector3;
  T.bebe = (o = {}) => {
    const pele = o.pele || '#f6c9a6', cab = o.cabelo || '#7a4a26', cam = o.camisa || '#4f8fe0', sh = o.short || '#ffffff';
    const W = 0.0042;
    const g = T.grupo(o.pai); const B = { g };
    const raiz = T.grupo(g, 0, 0, 0); B.raiz = raiz;
    const quad = T.grupo(raiz, 0, 0.255, 0); B.quad = quad;
    // fralda / short
    const fr = T.esfera(0.125, sh, quad, { w: W }); fr.scale.set(1.08, 0.78, 0.95); fr.position.y = 0.01;
    if (o.fralda) { const fita = T.caixa(0.05, 0.03, 0.01, '#9fd3ff', quad, { sem: true }); fita.position.set(0.0, 0.055, 0.118); }
    // tronco
    const tr = T.grupo(quad, 0, 0.04, 0); B.tr = tr;
    const barriga = T.esfera(0.13, o.semCamisa ? pele : cam, tr, { w: W }); barriga.scale.set(1.02, 1.05, 0.95); barriga.position.y = 0.1;
    if (!o.semCamisa && o.estampa) { const e = T.m(new THREE.CircleGeometry(0.035, 5), T.basico(o.estampa), tr, { sem: true }); e.position.set(0, 0.13, 0.124); }
    const pesc = T.cilindro(0.045, 0.05, 0.06, pele, tr, { sem: true }); pesc.position.y = 0.22;
    // cabeça (grande)
    const cb = T.grupo(tr, 0, 0.225, 0); B.cb = cb;
    const R = 0.19;
    const sup = (x, y, k = 1) => Math.sqrt(Math.max(0, R * R - x * x - y * y)) * 0.96 * k; // z na superfície do rosto
    const cabeca = T.esfera(R, pele, cb, { w: W }); cabeca.position.y = R * 0.95; cabeca.scale.set(1.02, 0.98, 0.96);
    const C = T.grupo(cb, 0, R * 0.95, 0); // centro da cabeça
    // cabelo: calota + mechas
    const cap = T.m(new THREE.SphereGeometry(R * 1.04, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.5), cab, C, { w: W });
    cap.rotation.x = -0.5; cap.position.set(0, 0.004, -0.012); cap.scale.set(1.02, 1, 1);
    // mechinhas da franja (gotas arredondadas caindo na testa)
    for (const [x, rz, k] of [[-0.075, 0.5, 0.9], [-0.025, 0.15, 1.05], [0.03, -0.2, 1], [0.08, -0.55, 0.85]]) {
      const y = 0.105, m = T.esfera(0.042 * k, cab, C, { w: W }); m.scale.set(0.75, 1.15, 0.5); m.position.set(x, y, sup(x, y) - 0.012); m.rotation.set(-0.45, x * 3, rz);
    }
    const topete = T.m(new THREE.TorusGeometry(0.03, 0.009, 8, 16, Math.PI * 1.3), cab, C, { w: W }); topete.position.set(0.0, R * 1.08, 0.02); topete.rotation.set(0, Math.PI / 2, 0.3);
    
    // orelhas
    for (const sx of [-1, 1]) { const or = T.esfera(0.034, pele, C, { w: W }); or.scale.set(0.45, 0.9, 0.7); or.position.set(R * 0.98 * sx, -0.01, -0.005); }
    // olhos grandes
    B.olhos = [];
    for (const sx of [-1, 1]) {
      const og = T.grupo(C, 0.068 * sx, -0.01, sup(0.068, -0.01) - 0.013); og.scale.setScalar(1.15);
      og.rotation.y = 0.32 * sx;
      const br = T.esfera(0.036, '#ffffff', og, { w: 0.0032 }); br.scale.set(0.9, 1.15, 0.5);
      const iris = T.esfera(0.026, '#5a3820', og, { sem: true }); iris.scale.set(1, 1.12, 0.45); iris.position.z = 0.012;
      const pu = T.esfera(0.015, '#140d08', iris, { sem: true }); pu.position.z = 0.02; pu.scale.set(1, 1, 0.6);
      const b1 = T.esfera(0.0075, '#ffffff', og, { sem: true }); b1.position.set(0.009, 0.012, 0.024);
      const b2 = T.esfera(0.0038, '#ffffff', og, { sem: true }); b2.position.set(-0.008, -0.008, 0.024);
      const pal = T.esfera(0.039, pele, og, { sem: true }); pal.scale.set(0.95, 1.2, 0.56); pal.position.z = 0.002;
      B.olhos.push({ og, iris, pal, b1, b2 });
    }
    B.sob = [];
    for (const sx of [-1, 1]) { const s = T.capsula(0.006, 0.03, '#5a3418', C, { sem: true }); s.rotation.z = Math.PI / 2 + 0.15 * sx; s.position.set(0.068 * sx, 0.055, sup(0.068, 0.055) + 0.002); B.sob.push({ s, sx }); }
    // bochechas
    for (const sx of [-1, 1]) { const bo = T.esfera(0.026, '#ff9f9a', C, { sem: true }); bo.scale.set(1, 0.6, 0.3); bo.position.set(0.105 * sx, -0.058, sup(0.105, -0.058) - 0.004); bo.rotation.y = 0.55 * sx; bo.material = T.basico('#ffaaa3'); }
    const nariz = T.esfera(0.016, pele, C, { w: 0.0028 }); nariz.position.set(0, -0.04, sup(0, -0.04) + 0.004); nariz.scale.set(1.2, 0.85, 0.8);
    // boca: sorriso (arco) e boca aberta (elipse com língua)
    const bocaG = T.grupo(C, 0, -0.088, sup(0, -0.088) - 0.002); bocaG.rotation.x = 0.42;
    const sorriso = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0045, 8, 20, Math.PI), T.basico('#5b2026')); sorriso.rotation.z = Math.PI; bocaG.add(sorriso);
    const aberta = T.grupo(bocaG);
    // boca aberta em "D": topo reto, fundo redondo; língua embaixo e dentinhos em cima
    const forma = new THREE.Shape(); forma.moveTo(-0.036, 0.008); forma.lineTo(0.036, 0.008); forma.absarc(0, 0.008, 0.036, 0, -Math.PI, true);
    const bAb = new THREE.Mesh(new THREE.ShapeGeometry(forma, 24), T.basico('#6b1d28')); aberta.add(bAb); bAb.scale.set(1, 0.85, 1);
    const borda = new THREE.Mesh(new THREE.ShapeGeometry(forma, 24), T.basico('#2a0c10')); borda.scale.set(1.12, 0.97, 1); borda.position.set(0, -0.0016, -0.0015); aberta.add(borda);
    const lingua = new THREE.Mesh(new THREE.CircleGeometry(0.02, 20), T.basico('#e86a76')); lingua.scale.set(1.1, 0.55, 1); lingua.position.set(0, -0.019, 0.0008); aberta.add(lingua);
    for (const x of [-0.0058, 0.0058]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.0095, 0.008), T.basico('#ffffff')); d.position.set(x, 0.0042, 0.0009); aberta.add(d); }
    aberta.position.z = 0.002;
    B.extras = T.grupo(C); // pra pôr chocolate, galo etc.
    B.C = C;
    // braços
    B.br = {};
    for (const [lado, sx] of [['E', 1], ['D', -1]]) {
      const om = T.grupo(tr, 0.118 * sx, 0.16, 0);
      const sup = T.capsula(0.038, 0.06, o.semCamisa || o.regata ? pele : pele, om, { w: W }); sup.position.y = -0.055;
      if (!o.semCamisa && !o.regata) { const manga = T.capsula(0.046, 0.03, cam, om, { w: W }); manga.position.y = -0.025; }
      const cot = T.grupo(om, 0, -0.12, 0);
      const inf = T.capsula(0.034, 0.055, pele, cot, { w: W }); inf.position.y = -0.05;
      const pu = T.grupo(cot, 0, -0.105, 0);
      const M = T.mao({ pele, sx: -sx, esc: 0.62, pai: pu, w: 0.0018, unha: '#fbe0d0' });
      M.g.position.y = -0.012; M.g.rotation.set(0, 0, Math.PI);
      M.g.rotation.set(Math.PI, 0, 0); // dedos pra baixo (-Y), palma pra dentro
      M.g.rotation.y = sx * Math.PI / 2;
      B.br[lado] = { om, cot, pu, M, sx };
    }
    // pernas
    B.pn = {};
    for (const [lado, sx] of [['E', 1], ['D', -1]]) {
      const qd = T.grupo(quad, 0.065 * sx, -0.02, 0);
      const cx = T.capsula(0.056, 0.04, o.calca ? o.calca : pele, qd, { w: W }); cx.position.y = -0.05;
      const jo = T.grupo(qd, 0, -0.11, 0);
      const ca = T.capsula(0.047, 0.04, o.calca ? o.calca : pele, jo, { w: W }); ca.position.y = -0.045;
      const tz = T.grupo(jo, 0, -0.1, 0);
      const pe = T.esfera(0.045, o.sapato || pele, tz, { w: W }); pe.scale.set(0.85, 0.55, 1.35); pe.position.set(0, -0.012, 0.022);
      if (!o.sapato) for (let k = 0; k < 4; k++) { const d = T.esfera(0.0095 - k * 0.0012, pele, tz, { w: 0.0016 }); d.position.set((0.022 - k * 0.0125) * sx * -1 + 0.0 , -0.016, 0.077 - k * 0.0035); }
      B.pn[lado] = { qd, jo, tz, sx };
    }
    // ---------- poses ----------
    const def = { y: 0, x: 0, z: 0, rx: 0, ry: 0, rz: 0, tr: [0, 0, 0], cb: [0, 0, 0], bE: [0, 0.15, 0, -0.3], bD: [0, 0.15, 0, -0.3], pE: [0, 0.04, 0, 0], pD: [0, 0.04, 0, 0] };
    B.pose = (p) => {
      p = Object.assign({}, def, p);
      raiz.position.set(p.x, p.y, p.z); raiz.rotation.set(p.rx, p.ry, p.rz, 'YXZ');
      tr.rotation.set(p.tr[0], p.tr[1], p.tr[2], 'YXZ'); cb.rotation.set(p.cb[0], p.cb[1], p.cb[2], 'YXZ');
      for (const L of ['E', 'D']) {
        const b = B.br[L], a = p['b' + L];
        b.om.rotation.set(a[0], a[2] * b.sx, a[1] * b.sx, 'XZY'); b.cot.rotation.set(a[3], 0, 0);
        const q = B.pn[L], l = p['p' + L];
        q.qd.rotation.set(l[0], 0, l[1] * q.sx, 'XZY'); q.jo.rotation.set(l[2], 0, 0); q.tz.rotation.set(l[3] || 0, 0, 0);
      }
    };
    B.rosto = (f = {}) => {
      const ri = f.ri == null ? 0.6 : f.ri, ab = f.ab || 0, pi = f.pi || 0, sob = f.sob || 0;
      sorriso.visible = ab < 0.25; sorriso.scale.set(0.7 + ri * 0.5, 0.4 + ri * 0.9, 1);
      aberta.visible = ab >= 0.25; aberta.scale.set(0.75 + ri * 0.25, 0.45 + ab * 0.65, 1);
      for (const e of B.olhos) {
        e.pal.visible = pi > 0.03; e.pal.scale.y = 1.2 * T.clamp(pi); e.pal.position.y = 0.036 * (1 - pi);
        e.iris.position.set(0.008 * (f.ox || 0), 0.006 * (f.oy || 0), 0.012);
        e.og.scale.y = 1.15 * (1 - (f.feliz || 0) * 0.35); // olho apertado de rir
      }
      for (const s of B.sob) { s.s.position.y = 0.052 + 0.012 * sob; s.s.rotation.z = Math.PI / 2 + (0.15 - 0.35 * (f.bravo || 0)) * s.sx; }
    };
    B.maos = (f = 0, L) => {
      for (const k of L ? [L] : ['E', 'D']) {
        const M = B.br[k].M, d = 0.25 + f * 1.1;
        M.pose({ dedos: [[d, d * 1.1, d * 0.8], [d, d * 1.15, d * 0.8], [d, d * 1.15, d * 0.8], [d, d * 1.1, d * 0.8]], abre: 0.12 - f * 0.1, pol: [0.6 + f * 0.4, 0.4 + f * 0.4, 0.2 + f * 0.5, 0.2 + f * 0.5] });
      }
    };
    B.pose({}); B.rosto({}); B.maos(0.1);
    return B;
  };
})();
