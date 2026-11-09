// Personagem toon (corpo inteiro) com IK de braço, piscada, sobrancelhas e boca.
// T.pessoa({pele, cabelo, roupa, calca, sapato, coque, saia, altura}) -> objeto com .g (raiz nos pés)
// Métodos: p.mao('E'|'D', [x,y,z] no espaço da raiz, cotoveloPara) ; p.braco('E'|'D', 'solto'); p.olhar(rx, ry);
// p.boca(v 0..1); p.pisca(v 0..1); p.cenho(v -1..1, bravo>0)
(function () {
  const T = window.T, V = THREE.Vector3;
  const Q = new THREE.Quaternion(), BAIXO = new V(0, -1, 0);

  // IK de 2 ossos. ombro (Object3D cujo -Y aponta pro cotovelo), cotovelo (filho, -Y aponta pra mão)
  T.ik2 = (ombro, cotovelo, L1, L2, alvoLocal, polo) => {
    // alvoLocal e polo no espaço do PAI do ombro
    const s = ombro.position.clone(), d = alvoLocal.clone().sub(s);
    let dist = T.clamp(d.length(), Math.abs(L1 - L2) + 1e-3, L1 + L2 - 1e-3);
    const u = d.clone().normalize();
    const pv = polo.clone().sub(u.clone().multiplyScalar(polo.dot(u))).normalize();
    const A = Math.acos(T.clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1));
    const dirSup = u.clone().multiplyScalar(Math.cos(A)).add(pv.clone().multiplyScalar(Math.sin(A))).normalize();
    ombro.quaternion.setFromUnitVectors(BAIXO, dirSup);
    const cot = s.clone().add(dirSup.clone().multiplyScalar(L1));
    const dirInf = alvoLocal.clone().sub(cot).normalize();
    const loc = dirInf.applyQuaternion(ombro.quaternion.clone().invert());
    cotovelo.quaternion.setFromUnitVectors(BAIXO, loc);
  };

  T.pessoa = (o = {}) => {
    const pele = o.pele || '#e8b48e', cab = o.cabelo || '#5a3a22', roupa = o.roupa || '#8a5cc8';
    const calca = o.calca || '#2e3f6e', sap = o.sapato || '#2a2a2a';
    const g = T.grupo(o.pai);
    const P = { g };
    // pernas
    P.pernas = [];
    for (const sx of [-1, 1]) {
      const quadril = T.grupo(g, 0.085 * sx, 0.78, 0);
      const perna = T.capsula(0.058, 0.62, o.saia ? pele : calca, quadril); perna.position.set(0, -0.36, 0);
      const pe = T.esfera(0.07, sap, quadril); pe.scale.set(0.85, 0.6, 1.5); pe.position.set(0, -0.73, 0.04);
      P.pernas.push(quadril);
    }
    // passada: fase em ciclos, amp em rad
    P.anda = (fase, amp = 0.35) => { P.pernas.forEach((q, i) => { q.rotation.x = Math.sin(fase * 6.283 + i * Math.PI) * amp; });
      P.tronco.position.y = 0.78 + Math.abs(Math.cos(fase * 6.283)) * 0.02 * (amp / 0.35); };
    const tronco = P.tronco = T.grupo(g, 0, 0.78, 0);
    if (o.saia) {
      const saia = T.cilindro(0.16, 0.27, 0.5, roupa, tronco); saia.position.y = 0.1; saia.scale.z = 0.8;
    } else {
      const quadril = T.capsula(0.14, 0.1, calca, tronco); quadril.position.y = 0.06; quadril.scale.z = 0.75;
    }
    const peito = T.capsula(0.155, 0.26, roupa, tronco); peito.position.y = 0.42; peito.scale.z = 0.72;
    const pesc = T.cilindro(0.045, 0.05, 0.1, pele, tronco, { sem: true }); pesc.position.y = 0.66;
    // cabeça
    const cabeca = P.cabeca = T.grupo(tronco, 0, 0.8, 0);
    T.esfera(0.145, pele, cabeca);
    const cap = T.m(new THREE.SphereGeometry(0.153, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.52), cab, cabeca);
    cap.rotation.x = -0.42; cap.position.set(0, 0.008, -0.008);
    if (o.coque !== false && !o.capuz) { const cq = T.esfera(0.072, cab, cabeca); cq.position.set(0, 0.15, -0.06); }
    if (o.bone) { // boné virado pra trás
      const copa = T.m(new THREE.SphereGeometry(0.158, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), o.bone, cabeca); copa.position.y = 0.02; copa.rotation.x = -0.12;
      const aba = T.cilindro(0.1, 0.1, 0.012, o.bone, cabeca); aba.scale.set(1, 1, 0.75); aba.position.set(0, 0.055, -0.16); aba.rotation.x = 0.25;
    }
    if (o.capuz) { // capuz cobrindo a cabeça, rosto na sombra
      cap.visible = false;
      const cz = T.m(new THREE.SphereGeometry(0.175, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.75), o.capuz, cabeca); cz.rotation.x = -0.55; cz.position.set(0, 0.01, -0.02);
      const sombra = T.esfera(0.146, '#2a2a30', cabeca, { sem: true }); sombra.position.z = 0.004; sombra.scale.set(0.97, 0.97, 0.97);
      P.rostoSombra = sombra;
    }
    for (const sx of [-1, 1]) { const orelha = T.esfera(0.028, pele, cabeca); orelha.scale.set(0.5, 1, 0.8); orelha.position.set(0.143 * sx, -0.005, -0.005); }
    // olhos
    P.olhos = [];
    for (const sx of [-1, 1]) {
      const og = T.grupo(cabeca, 0.052 * sx, 0.012, 0.12);
      const br = T.esfera(0.031, '#ffffff', og, { w: 0.004 }); br.scale.set(0.95, 1.25, 0.55);
      const pu = T.esfera(0.017, '#1b1410', og, { sem: true }); pu.position.set(0, -0.004, 0.017); pu.scale.set(1, 1.15, 0.5);
      const bri = T.esfera(0.005, '#ffffff', og, { sem: true }); bri.position.set(0.006, 0.006, 0.025);
      // pálpebra (cor de pele) desce na piscada
      const pal = T.esfera(0.034, pele, og, { sem: true }); pal.scale.set(0.98, 1.3, 0.6); pal.position.z = 0.002;
      P.olhos.push({ og, pu, pal });
    }
    P.sobr = [];
    for (const sx of [-1, 1]) {
      const s = T.caixa(0.055, 0.011, 0.012, '#3a2414', cabeca, { sem: true }); s.position.set(0.054 * sx, 0.072, 0.133);
      P.sobr.push({ s, sx });
    }
    const nariz = T.esfera(0.019, pele, cabeca, { w: 0.003 }); nariz.position.set(0, -0.025, 0.145); nariz.scale.set(1, 0.8, 0.7);
    const bocaG = T.grupo(cabeca, 0, -0.07, 0.132);
    const boca = T.esfera(0.03, '#6b1f24', bocaG, { w: 0.003 }); boca.scale.set(1, 0.18, 0.35);
    const lingua = T.esfera(0.018, '#d0646c', bocaG, { sem: true }); lingua.position.set(0, -0.006, 0.004); lingua.scale.set(1, 0.4, 0.3);
    // braços
    P.br = {};
    for (const [lado, sx] of [['E', 1], ['D', -1]]) {
      const ombro = T.grupo(tronco, 0.175 * sx, 0.55, 0);
      const sup = T.capsula(0.042, 0.2, pele, ombro); sup.position.y = -0.13;
      const manga = T.cilindro(0.058, 0.05, 0.15, roupa, ombro); manga.position.y = -0.05;
      const cot = T.grupo(ombro, 0, -0.27, 0);
      const inf = T.capsula(0.038, 0.18, pele, cot); inf.position.y = -0.12;
      const mao = T.grupo(cot, 0, -0.215, 0);
      const M = T.mao({ pele, sx: -sx, esc: 0.82, pai: mao, w: 0.0024 });
      T.orientaMao(M, new V(0, -1, 0), new V(sx, 0, 0.25));
      M.g.position.y = 0.045;
      M.pose({ dedos: [[0.35, 0.45, 0.3], [0.4, 0.5, 0.3], [0.45, 0.5, 0.3], [0.5, 0.55, 0.35]], abre: 0.05, pol: [0.5, 0.5, 0.2, 0.15] });
      P.br[lado] = { ombro, cot, mao, sx };
    }
    P.L1 = 0.27; P.L2 = 0.26;
    P.mao = (lado, alvo, polo) => {
      const b = P.br[lado]; const a = new V(...alvo).sub(tronco.position);
      T.ik2(b.ombro, b.cot, P.L1, P.L2, a, new V(...(polo || [0.4 * b.sx, -1, -0.3])));
    };
    P.solto = (lado, abre = 0.08) => { const b = P.br[lado]; b.ombro.quaternion.setFromEuler(new THREE.Euler(0.05, 0, abre * b.sx)); b.cot.quaternion.setFromEuler(new THREE.Euler(-0.15, 0, 0)); };
    P.boca = (v) => { v = T.clamp(v); boca.scale.y = 0.18 + v * 0.95; boca.scale.x = 1 - v * 0.15; lingua.visible = v > 0.25; };
    P.pisca = (v) => { for (const e of P.olhos) { e.pal.scale.y = 1.3 * T.clamp(v); e.pal.position.y = 0.04 * (1 - v); e.pal.visible = v > 0.02; } };
    P.cenho = (v) => { for (const e of P.sobr) { e.s.rotation.z = -0.35 * v * e.sx; e.s.position.y = 0.072 - 0.006 * Math.abs(v); } };
    P.olhar = (x, y) => { for (const e of P.olhos) e.pu.position.set(0.008 * x, -0.004 + 0.006 * y, 0.017); };
    P.pisca(0); P.boca(0); P.cenho(0); P.solto('E'); P.solto('D');
    // piscada automática: chame P.piscaAuto(t)
    P.piscaAuto = (t, seed = 0) => { const c = (t + seed) % 3.7; P.pisca(c < 0.14 ? Math.sin(c / 0.14 * Math.PI) : 0); };
    return P;
  };
})();
