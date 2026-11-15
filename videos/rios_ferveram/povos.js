// Os povos do mundo de dentro (toon3d). Cada criador devolve um grupo com .ud.anima(t) opcional.
(function () {
  const T = window.T, V = THREE.Vector3;
  const POV = window.POV = {};
  // olhos fofos: dois brancos + pupila + brilho; bravo = sobrancelha inclinada
  POV.olhos = (pai, y, z, s = 1, o = {}) => {
    const g = T.grupo(pai, 0, y, z); const d = o.dist || 0.11 * s;
    const pup = [];
    for (const k of [-1, 1]) {
      const b = T.esfera(0.075 * s, '#ffffff', g, { w: 0.004 }); b.position.set(k * d, 0, 0); b.scale.set(1, 1.15, 0.6);
      const p = T.esfera(0.042 * s, '#15151c', b, { sem: true }); p.position.set(0, -0.005, 0.055 * s / 0.6 * 0.6 + 0.02 * s); p.scale.set(1, 1.1, 0.5);
      const br = T.m(new THREE.SphereGeometry(0.014 * s, 10, 8), T.basico('#ffffff'), p, { sem: true }); br.position.set(0.015 * s, 0.018 * s, 0.03 * s);
      pup.push(p);
      if (o.bravo || o.triste) {
        const sb = T.caixa(0.1 * s, 0.022 * s, 0.02 * s, '#15151c', g, { sem: true });
        sb.position.set(k * d, 0.1 * s, 0.03 * s); sb.rotation.z = (o.bravo ? 0.45 : -0.35) * k;
      }
    }
    g.ud = { pup }; g.userData.olhar = (x, y) => pup.forEach((p) => { p.position.x = x * 0.025 * s; p.position.y = -0.005 + y * 0.025 * s; });
    return g;
  };
  POV.sorriso = (pai, y, z, s = 1, aberto = false) => {
    const m = T.m(new THREE.TorusGeometry(0.05 * s, 0.012 * s, 8, 18, Math.PI), T.basico('#15151c'), pai, { sem: true });
    m.position.set(0, y, z); m.rotation.z = Math.PI; return m;
  };
  POV.bocaO = (pai, y, z, s = 1) => { const m = T.esfera(0.04 * s, '#3a0d12', pai, { sem: true }); m.position.set(0, y, z); m.scale.set(1, 1.3, 0.4); return m; };

  // BACTÉRIA: bastonete deitado com perninhas
  POV.bacteria = (pai, cor = '#7cc96a', o = {}) => {
    const g = T.grupo(pai); const s = o.s || 1;
    const corpo = T.grupo(g, 0, 0.22 * s, 0);
    const c = T.capsula(0.2 * s, 0.34 * s, cor, corpo); c.rotation.z = Math.PI / 2;
    // pintinhas
    const esc = new THREE.Color(cor).multiplyScalar(0.8).getStyle();
    [[-0.18, 0.1, 0.12], [0.12, 0.14, 0.1], [0.24, 0.02, 0.14]].forEach(([x, y, z]) => { const p = T.esfera(0.04 * s, esc, corpo, { sem: true }); p.position.set(x * s, y * s, z * s); p.scale.set(1, 1, 0.5); });
    const olh = POV.olhos(corpo, 0.06 * s, 0.17 * s, s * 0.95, o);
    if (o.velho) { // bigode e óculos
      const bg = T.esfera(0.06 * s, '#f4f1ea', corpo, { w: 0.003 }); bg.position.set(0, -0.06 * s, 0.19 * s); bg.scale.set(1.9, 0.6, 0.6);
      [-1, 1].forEach((k) => { const a = T.m(new THREE.TorusGeometry(0.075 * s, 0.009 * s, 6, 20), T.basico('#2a2a2a'), olh, { sem: true }); a.position.set(k * 0.11 * s, 0, 0.05 * s); });
    } else if (o.medo) POV.bocaO(corpo, -0.08 * s, 0.185 * s, s); else POV.sorriso(corpo, -0.06 * s, 0.19 * s, s);
    // perninhas (flagelos curtos)
    const pernas = [];
    [-0.2, -0.07, 0.07, 0.2].forEach((x, i) => { const p = T.capsula(0.025 * s, 0.08 * s, esc, g, { w: 0.003 }); p.position.set(x * s, 0.05 * s, (i % 2 ? 0.06 : -0.02) * s); pernas.push(p); });
    g.ud = { corpo, olh, pernas };
    g.userData.anda = (fase, amp = 1) => { pernas.forEach((p, i) => { p.rotation.x = Math.sin(fase * 6.283 + i * 1.6) * 0.6 * amp; });
      corpo.position.y = 0.22 * s + Math.abs(Math.sin(fase * 6.283)) * 0.05 * s * amp; corpo.rotation.z = Math.sin(fase * 6.283) * 0.05 * amp; };
    g.userData.pula = (u) => { corpo.position.y = 0.22 * s + u * 0.25 * s; corpo.scale.set(1 - u * 0.1, 1 + u * 0.15, 1); };
    return g;
  };

  // GLÓBULO VERMELHO: disco bicôncavo que navega (deitado), com bolha azul de ar
  POV.hemacia = (pai, o = {}) => {
    const g = T.grupo(pai); const s = o.s || 1;
    const t = T.m(new THREE.TorusGeometry(0.24 * s, 0.13 * s, 18, 36), '#d8252f', g); t.rotation.x = Math.PI / 2;
    const meio = T.m(new THREE.CylinderGeometry(0.25 * s, 0.25 * s, 0.1 * s, 30), '#b81c26', g, { sem: true });
    POV.olhos(g, 0.07 * s, 0.33 * s, s * 0.9).rotation.x = -0.15; POV.sorriso(g, -0.04 * s, 0.36 * s, s * 0.9);
    let bolha = null;
    if (o.ar !== false) {
      bolha = T.m(new THREE.SphereGeometry(0.19 * s, 24, 16), new THREE.MeshToonMaterial({ color: '#7fd0ff', transparent: true, opacity: 0.85 }), g, { w: 0.004 });
      bolha.position.set(0, 0.24 * s, -0.02); const br = T.esfera(0.04 * s, '#ffffff', bolha, { sem: true }); br.position.set(-0.07 * s, 0.08 * s, 0.13 * s);
    }
    g.ud = { bolha }; return g;
  };

  // GLÓBULO BRANCO: soldado gordinho de capacete
  POV.leucocito = (pai, o = {}) => {
    const g = T.grupo(pai); const s = o.s || 1;
    const corpo = T.grupo(g, 0, 0.42 * s, 0);
    const c = T.esfera(0.38 * s, '#f6f5f0', corpo); c.scale.set(1, 1.05, 0.95);
    [[0.3, 0.12, 0.12], [-0.3, -0.05, 0.15], [0.12, -0.3, 0.2], [-0.22, 0.25, 0.05]].forEach(([x, y, z]) => { const b = T.esfera(0.13 * s, '#f6f5f0', corpo, { w: 0.004 }); b.position.set(x * s, y * s, z * s); });
    const nucleo = T.esfera(0.09 * s, '#c9b8e8', corpo, { sem: true }); nucleo.position.set(0.2 * s, -0.12 * s, 0.31 * s); nucleo.scale.set(1, 1, 0.3);
    const cap = T.m(new THREE.SphereGeometry(0.33 * s, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), '#4f7d3b', corpo); cap.position.y = 0.16 * s;
    const aba = T.cilindro(0.36 * s, 0.36 * s, 0.03 * s, '#3f6a2e', corpo); aba.position.y = 0.16 * s;
    POV.olhos(corpo, 0.06 * s, 0.33 * s, s * 1.05, { bravo: !o.calmo });
    POV.sorriso(corpo, -0.1 * s, 0.36 * s, s * 0.9);
    const bracos = [];
    [-1, 1].forEach((k) => { const ob = T.grupo(corpo, k * 0.36 * s, -0.02 * s, 0.05 * s); const b = T.capsula(0.06 * s, 0.18 * s, '#f6f5f0', ob, { w: 0.004 }); b.position.y = -0.12 * s; ob.rotation.z = k * 0.4; bracos.push(ob); });
    const pes = [];
    [-1, 1].forEach((k) => { const p = T.esfera(0.08 * s, '#3f6a2e', g, { w: 0.004 }); p.position.set(k * 0.15 * s, 0.05 * s, 0.05 * s); p.scale.set(1, 0.6, 1.4); pes.push(p); });
    g.ud = { corpo, bracos };
    g.userData.anda = (fase, amp = 1) => { pes.forEach((p, i) => { const a = Math.sin(fase * 6.283 + i * Math.PI); p.position.z = 0.05 * s + a * 0.1 * s * amp; p.position.y = 0.05 * s + Math.max(0, -a) * 0.06 * s * amp; });
      corpo.position.y = 0.42 * s + Math.abs(Math.cos(fase * 6.283)) * 0.04 * s * amp; bracos.forEach((b, i) => { b.rotation.x = Math.sin(fase * 6.283 + i * Math.PI) * 0.5 * amp; }); };
    return g;
  };

  // PLAQUETA: plaquinha amarela com bracinhos, carrega tijolo
  POV.plaqueta = (pai, o = {}) => {
    const g = T.grupo(pai); const s = o.s || 1;
    const corpo = T.grupo(g, 0, 0.26 * s, 0);
    const c = T.esfera(0.2 * s, '#f2c94c', corpo); c.scale.set(1.25, 0.95, 0.75);
    POV.olhos(corpo, 0.05 * s, 0.13 * s, s * 0.8); POV.sorriso(corpo, -0.06 * s, 0.155 * s, s * 0.8);
    const cap = T.m(new THREE.SphereGeometry(0.17 * s, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), '#ff8f1f', corpo); cap.position.y = 0.1 * s; cap.scale.set(1.1, 0.8, 1);
    const bracos = [];
    [-1, 1].forEach((k) => { const ob = T.grupo(corpo, k * 0.24 * s, 0, 0.02); const b = T.capsula(0.035 * s, 0.12 * s, '#e0b33a', ob, { w: 0.003 }); b.position.y = 0.08 * s; ob.rotation.z = -k * 0.5; bracos.push(ob); });
    const tijolo = T.caixa(0.26 * s, 0.11 * s, 0.13 * s, '#c8553d', corpo); tijolo.position.set(0, 0.27 * s, 0.02);
    [-1, 1].forEach((k) => { const p = T.esfera(0.05 * s, '#e0b33a', g, { w: 0.003 }); p.position.set(k * 0.1 * s, 0.04 * s, 0); p.scale.set(1, 0.6, 1.3); });
    g.ud = { corpo, tijolo, bracos }; return g;
  };

  // NEURÔNIO: estrela roxa com dendritos
  POV.neuronio = (pai, o = {}) => {
    const g = T.grupo(pai); const s = o.s || 1;
    const c = T.esfera(0.32 * s, '#9b6bd6', g); c.scale.set(1, 0.95, 0.85);
    const pontas = [];
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2 + 0.3; const dir = new V(Math.cos(a), Math.sin(a) * 0.9, -0.25).normalize();
      const L = (0.45 + (i % 2) * 0.2) * s;
      const d = T.cilindro(0.025 * s, 0.09 * s, L, '#8a59c8', g, { w: 0.004 });
      d.position.copy(dir.clone().multiplyScalar(0.26 * s + L / 2)); d.quaternion.setFromUnitVectors(new V(0, 1, 0), dir);
      const p = T.esfera(0.05 * s, '#c8a6f2', g, { w: 0.004 }); p.position.copy(dir.clone().multiplyScalar(0.26 * s + L)); pontas.push(p);
    }
    POV.olhos(g, 0.06 * s, 0.26 * s, s * 1.1); POV.sorriso(g, -0.08 * s, 0.28 * s, s);
    g.ud = { pontas }; return g;
  };

  // VÍRUS: bola verde com espinhos e cara de mau
  POV.virus = (pai, o = {}) => {
    const g = T.grupo(pai); const s = o.s || 1;
    const c = T.esfera(0.3 * s, o.cor || '#6fbf3a', g);
    const n = 18;
    for (let i = 0; i < n; i++) {
      const y = 1 - (i + 0.5) / n * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996;
      const dir = new V(Math.cos(a) * r, y, Math.sin(a) * r);
      if (dir.z > 0.75 && Math.abs(dir.y) < 0.5) continue; // não cobre a cara
      const e = T.cilindro(0.018 * s, 0.024 * s, 0.14 * s, '#4c8f25', g, { w: 0.003 }); e.position.copy(dir.clone().multiplyScalar(0.36 * s)); e.quaternion.setFromUnitVectors(new V(0, 1, 0), dir);
      const p = T.esfera(0.045 * s, '#d6304a', g, { w: 0.003 }); p.position.copy(dir.clone().multiplyScalar(0.44 * s));
    }
    POV.olhos(g, 0.05 * s, 0.26 * s, s * 1.0, { bravo: true });
    // sorriso malvado com dentinhos
    const b = T.m(new THREE.TorusGeometry(0.08 * s, 0.018 * s, 8, 20, Math.PI), T.basico('#15151c'), g, { sem: true }); b.position.set(0, -0.06 * s, 0.28 * s); b.rotation.z = Math.PI;
    [-0.035, 0.035].forEach((x) => { const d = T.m(new THREE.ConeGeometry(0.014 * s, 0.03 * s, 4), T.basico('#ffffff'), g, { sem: true }); d.position.set(x * s, -0.14 * s, 0.285 * s); d.rotation.z = Math.PI; });
    return g;
  };

  // CORAÇÃO: coração gordinho que pulsa, com brilho atrás
  POV.coracao = (pai, s = 1) => {
    const g = T.grupo(pai);
    const sh = new THREE.Shape(); const k = s;
    sh.moveTo(0, -1.0 * k); sh.bezierCurveTo(-0.35 * k, -0.62 * k, -1.05 * k, -0.25 * k, -1.0 * k, 0.28 * k);
    sh.bezierCurveTo(-0.95 * k, 0.8 * k, -0.25 * k, 0.95 * k, 0, 0.5 * k); sh.bezierCurveTo(0.25 * k, 0.95 * k, 0.95 * k, 0.8 * k, 1.0 * k, 0.28 * k);
    sh.bezierCurveTo(1.05 * k, -0.25 * k, 0.35 * k, -0.62 * k, 0, -1.0 * k);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.35 * k, bevelEnabled: true, bevelThickness: 0.25 * k, bevelSize: 0.2 * k, bevelSegments: 6, curveSegments: 32 });
    geo.center();
    const m = T.m(geo, '#e23a4a', g, { w: 0.004, radial: true });
    const br = T.esfera(0.16 * k, '#ff9aa4', m, { sem: true }); br.position.set(-0.5 * k, 0.35 * k, 0.4 * k); br.scale.set(1.3, 0.7, 0.3);
    // brilho (sprite)
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d');
    const gr = c.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(255,170,150,0.9)'); gr.addColorStop(0.4, 'rgba(255,110,110,0.35)'); gr.addColorStop(1, 'rgba(255,90,90,0)');
    c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
    sp.scale.set(6 * s, 6 * s, 1); sp.position.z = -0.5 * s; g.add(sp);
    g.ud = { m, sp };
    // batida: tum-tum a cada periodo
    g.userData.bate = (t, per = 1.1) => { const f = (t % per) / per; const p = Math.exp(-((f - 0.05) ** 2) / 0.002) + 0.6 * Math.exp(-((f - 0.22) ** 2) / 0.002);
      const e = 1 + 0.12 * p; m.scale.set(e, e, e); sp.material.opacity = 0.55 + 0.45 * p; return p; };
    return g;
  };

  // brilho genérico (sprite radial)
  POV.brilho = (pai, cor = '255,240,180', esc = 1) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
    const gr = c.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, `rgba(${cor},1)`); gr.addColorStop(0.35, `rgba(${cor},0.5)`); gr.addColorStop(1, `rgba(${cor},0)`);
    c.fillStyle = gr; c.fillRect(0, 0, 128, 128);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    sp.scale.set(esc, esc, 1); (pai || T.cena).add(sp); return sp;
  };
})();
