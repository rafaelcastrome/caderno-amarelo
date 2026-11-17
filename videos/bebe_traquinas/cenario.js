// Peças de cenário toon pro "bebê traquinas". Tudo em metros, chão em y=0, frente da câmera = +Z.
(function () {
  const T = window.T, V = THREE.Vector3;
  const C = T.cen = {};
  let sem = 11; C.rnd = () => { sem = (sem * 16807) % 2147483647; return (sem - 1) / 2147483646; };
  const R = C.R = (a, b) => a + (b - a) * C.rnd();
  C.rb = (w, h, d, r, cor, pai, o = {}) => T.m(T.caixaRed(w, h, d, r, 5), cor, pai, Object.assign({ radial: false }, o));

  // textura de azulejo / piso em canvas
  C.tex = (f, px = 256, rep = [1, 1]) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = px; f(cv.getContext('2d'), px);
    const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(rep[0], rep[1]); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; return tx;
  };
  C.azulejo = (cor, rejunte, n = 4) => (c, p) => { c.fillStyle = rejunte; c.fillRect(0, 0, p, p); c.fillStyle = cor; const s = p / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); };
  C.tabuas = (cor, linha) => (c, p) => { c.fillStyle = cor; c.fillRect(0, 0, p, p); c.strokeStyle = linha; c.lineWidth = 4; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(0, i * p / 4); c.lineTo(p, i * p / 4); c.stroke(); } for (let i = 0; i < 4; i++) { const x = ((i * 97) % 4 + 0.5) * p / 4; c.beginPath(); c.moveTo(x, i * p / 4); c.lineTo(x, (i + 1) * p / 4); c.stroke(); } };
  C.plano = (w, d, tx, pai, cor = '#ffffff') => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshToonMaterial({ color: cor, map: tx || null })); m.rotation.x = -Math.PI / 2; (pai || T.cena).add(m); return m; };
  C.parede = (w, h, tx, pai, cor = '#ffffff') => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshToonMaterial({ color: cor, map: tx || null })); m.position.y = h / 2; (pai || T.cena).add(m); return m; };

  // ---------- móveis ----------
  // bancada de banheiro com cuba, torneira e espelho (centro em x, frente em z)
  C.pia = (g, larg = 1.6) => {
    const p = T.grupo(g);
    C.rb(larg, 0.06, 0.55, 0.015, '#efe6d8', p).position.set(0, 0.82, 0);
    C.rb(larg - 0.04, 0.72, 0.5, 0.02, '#9a6a45', p).position.set(0, 0.42, -0.01);
    for (const x of [-larg / 4, larg / 4]) { const pu = T.esfera(0.018, '#e2c8a0', p, { w: 0.003 }); pu.position.set(x, 0.62, 0.245); }
    T.linha([-0.0, 0.08, 0.245], [0, 0.78, 0.245], 0.01, p);
    const cuba = T.m(new THREE.CylinderGeometry(0.22, 0.17, 0.04, 32), T.mat('#d9d3cc'), p, { w: 0.004 }); cuba.position.set(0, 0.852, 0.03); cuba.scale.z = 0.7;
    const tor = T.grupo(p, 0, 0.85, -0.2);
    T.cilindro(0.022, 0.026, 0.2, '#c9ced6', tor).position.y = 0.1;
    const bico = T.capsula(0.016, 0.13, '#c9ced6', tor); bico.rotation.x = Math.PI / 2; bico.position.set(0, 0.2, 0.07);
    for (const x of [-0.12, 0.12]) T.cilindro(0.02, 0.02, 0.07, '#c9ced6', tor).position.set(x, 0.035, 0);
    const esp = T.caixa(larg * 0.85, 0.9, 0.03, '#bcd9e6', p); esp.position.set(0, 1.45, -0.27);
    const brilho = T.caixa(0.08, 0.7, 0.01, '#e6f4fa', p, { sem: true }); brilho.position.set(-larg * 0.25, 1.45, -0.25); brilho.rotation.z = 0.4;
    // escova e pote
    T.cilindro(0.035, 0.03, 0.1, '#7ccfb5', p).position.set(larg * 0.33, 0.9, -0.12);
    const sab = C.rb(0.07, 0.11, 0.07, 0.02, '#f7a6c9', p); sab.position.set(-larg * 0.34, 0.91, -0.14);
    return p;
  };
  C.vaso = (g) => {
    const v = T.grupo(g);
    const base = T.cilindro(0.13, 0.16, 0.36, '#f7f7f4', v); base.position.y = 0.18; base.scale.z = 1.25;
    const bowl = T.m(new THREE.TorusGeometry(0.175, 0.03, 12, 32), T.mat('#f7f7f4'), v, { w: 0.004 }); bowl.rotation.x = Math.PI / 2; bowl.position.set(0, 0.4, 0.03); bowl.scale.set(1, 1.25, 1);
    const agua = T.m(new THREE.CircleGeometry(0.16, 32), T.basico('#9ad7ef'), v, { sem: true }); agua.rotation.x = -Math.PI / 2; agua.position.set(0, 0.3, 0.03); agua.scale.set(1, 1.25, 1);
    const tanque = C.rb(0.42, 0.42, 0.18, 0.03, '#f7f7f4', v); tanque.position.set(0, 0.62, -0.26);
    const tampa = C.rb(0.36, 0.42, 0.03, 0.015, '#f7f7f4', v); tampa.position.set(0, 0.62, -0.15); tampa.rotation.x = -0.15;
    const bt = T.cilindro(0.025, 0.025, 0.02, '#c9ced6', v); bt.position.set(0, 0.84, -0.26);
    v.agua = agua; return v;
  };
  C.sofa = (g, larg = 2.0, cor = '#8a5a3c') => {
    const s = T.grupo(g); const esc = new THREE.Color(cor).multiplyScalar(0.85).getStyle();
    C.rb(larg, 0.25, 0.85, 0.06, esc, s).position.set(0, 0.2, 0);
    for (let i = 0; i < 2; i++) C.rb(larg / 2 - 0.06, 0.16, 0.66, 0.07, cor, s).position.set((i - 0.5) * larg / 2, 0.4, 0.08);
    C.rb(larg, 0.62, 0.24, 0.08, cor, s).position.set(0, 0.62, -0.32);
    for (const sx of [-1, 1]) C.rb(0.2, 0.36, 0.85, 0.07, esc, s).position.set(sx * (larg / 2 + 0.06), 0.45, 0);
    return s;
  };
  C.poltrona = (g, cor = '#6a4a35') => {
    const s = T.grupo(g);
    C.rb(0.8, 0.3, 0.75, 0.05, cor, s).position.set(0, 0.25, 0);
    C.rb(0.62, 0.14, 0.58, 0.06, '#8c7564', s).position.set(0, 0.46, 0.06);
    C.rb(0.8, 0.55, 0.18, 0.05, cor, s).position.set(0, 0.62, -0.3);
    for (const sx of [-1, 1]) C.rb(0.14, 0.26, 0.75, 0.05, cor, s).position.set(sx * 0.37, 0.53, 0);
    return s;
  };
  C.estante = (g, larg = 0.8, alt = 1.8, cor = '#8e2b3a') => {
    const s = T.grupo(g); const n = 5;
    for (let i = 0; i <= n; i++) C.rb(larg, 0.04, 0.32, 0.01, cor, s).position.set(0, 0.02 + i * (alt - 0.04) / n, 0);
    for (const sx of [-1, 1]) C.rb(0.04, alt, 0.32, 0.01, cor, s).position.set(sx * larg / 2, alt / 2, 0);
    C.rb(larg, alt, 0.02, 0.005, new THREE.Color(cor).multiplyScalar(0.7).getStyle(), s).position.set(0, alt / 2, -0.15);
    const cores = ['#ffd23a', '#4fb3ff', '#ff6b6b', '#7bd66b', '#c58aff'];
    for (let i = 1; i < n; i++) for (let k = 0; k < 2; k++) { const y = 0.04 + i * (alt - 0.04) / n; const cx = (k - 0.5) * larg * 0.45 + R(-0.05, 0.05);
      if ((i + k) % 2) C.rb(0.14, 0.14, 0.14, 0.02, cores[(i * 2 + k) % 5], s).position.set(cx, y + 0.07, 0.02); else T.esfera(0.07, cores[(i + k * 3) % 5], s).position.set(cx, y + 0.07, 0.02); }
    s.nivel = (i) => 0.02 + i * (alt - 0.04) / n; return s;
  };
  C.caixaBrinq = (g) => {
    const s = T.grupo(g);
    const c = C.rb(0.8, 0.38, 0.55, 0.03, '#79c8f2', s); c.position.y = 0.19;
    const cores = ['#ffd23a', '#ff6b6b', '#7bd66b', '#c58aff', '#ff9f43'];
    for (let i = 0; i < 9; i++) { const o = i % 2 ? C.rb(0.13, 0.13, 0.13, 0.02, cores[i % 5], s) : T.esfera(0.075, cores[i % 5], s); o.position.set(R(-0.3, 0.3), 0.4 + R(0, 0.05), R(-0.18, 0.18)); o.rotation.set(R(0, 3), R(0, 3), 0); }
    return s;
  };
  C.mesa = (g, larg = 1.6, prof = 0.9, cor = '#f1ebe2') => {
    const s = T.grupo(g);
    C.rb(larg, 0.05, prof, 0.015, cor, s).position.y = 0.74;
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = T.cilindro(0.025, 0.02, 0.72, '#8a6243', s); p.position.set(x * (larg / 2 - 0.1), 0.36, z * (prof / 2 - 0.1)); }
    return s;
  };
  C.cadeira = (g, cor = '#9a6a45', ass = '#e9dccb') => {
    const s = T.grupo(g);
    C.rb(0.44, 0.06, 0.42, 0.02, ass, s).position.y = 0.45;
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = T.cilindro(0.018, 0.016, 0.45, cor, s); p.position.set(x * 0.18, 0.225, z * 0.17); }
    for (const x of [-1, 1]) { const p = T.cilindro(0.018, 0.018, 0.45, cor, s); p.position.set(x * 0.18, 0.7, -0.19); }
    C.rb(0.42, 0.14, 0.04, 0.015, ass, s).position.set(0, 0.86, -0.19);
    return s;
  };
  C.freezer = (g) => {
    const s = T.grupo(g);
    C.rb(1.1, 0.82, 0.62, 0.04, '#3f8fe0', s).position.y = 0.43;
    C.rb(1.12, 0.06, 0.64, 0.02, '#e9eef3', s).position.y = 0.86;
    const pl = T.tela(0.75, 0.42, 512, (c, w, h) => { c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 40); c.fill(); c.fillStyle = '#e8424f'; c.font = 'bold 120px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('SORVETE', w / 2, h * 0.52);
      c.fillStyle = '#f7b84b'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(w * (0.3 + i * 0.2), h * 0.78, 22, 0, 7); c.fill(); } }, s);
    pl.position.set(0, 0.48, 0.315);
    for (const x of [-0.42, 0.42]) T.cilindro(0.04, 0.04, 0.04, '#333', s).position.set(x, 0.02, 0.22);
    return s;
  };
  C.escada = (g, alt = 2.2, cor = '#c4473c') => {
    const s = T.grupo(g); const ang = 0.18;
    for (const sx of [-1, 1]) { const tr = C.rb(0.05, alt, 0.05, 0.01, cor, s); tr.position.set(sx * 0.25, alt / 2, -Math.sin(ang) * alt / 2); tr.rotation.x = ang; }
    const n = 8; s.degraus = [];
    for (let i = 1; i <= n; i++) { const y = i * alt / (n + 1); const d = C.rb(0.5, 0.035, 0.07, 0.01, cor, s); d.position.set(0, y, -Math.tan(ang) * y); s.degraus.push([y, -Math.tan(ang) * y]); }
    return s;
  };
  C.grade = (g, larg = 3, cor = '#4f6f5a') => {
    const s = T.grupo(g);
    for (const y of [0.25, 0.5, 0.75, 1.0]) { const b = T.cilindro(0.025, 0.025, larg, cor, s); b.rotation.z = Math.PI / 2; b.position.y = y; }
    for (let x = -larg / 2; x <= larg / 2 + 0.01; x += 1.0) T.cilindro(0.04, 0.04, 1.1, cor, s).position.set(x, 0.55, 0);
    return s;
  };
  C.bolo = (g) => {
    const s = T.grupo(g);
    T.cilindro(0.26, 0.26, 0.16, '#7cc96a', s).position.y = 0.08;
    T.cilindro(0.18, 0.18, 0.14, '#a6e08f', s).position.y = 0.23;
    for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; const b = T.esfera(0.025, '#ffffff', s, { w: 0.002 }); b.position.set(Math.cos(a) * 0.255, 0.16, Math.sin(a) * 0.255); }
    const vela = T.cilindro(0.012, 0.012, 0.1, '#ffd23a', s); vela.position.y = 0.35;
    const chama = T.esfera(0.018, '#ff9f1c', s, { sem: true }); chama.scale.y = 1.6; chama.position.y = 0.42; chama.material = T.basico('#ffb43a');
    s.chama = chama; return s;
  };
  C.carrinho = (g, cor = '#3a7be0') => {
    const s = T.grupo(g);
    C.rb(0.62, 0.22, 0.34, 0.07, cor, s).position.set(0, 0.2, 0);
    C.rb(0.3, 0.16, 0.3, 0.06, '#ffd23a', s).position.set(-0.05, 0.36, 0);
    for (const [x, z] of [[-0.2, -0.17], [0.2, -0.17], [-0.2, 0.17], [0.2, 0.17]]) { const r = T.cilindro(0.085, 0.085, 0.06, '#2a2a2a', s); r.rotation.x = Math.PI / 2; r.position.set(x, 0.085, z); const c = T.cilindro(0.04, 0.04, 0.065, '#dddddd', s, { sem: true }); c.rotation.x = Math.PI / 2; c.position.set(x, 0.085, z); }
    const vol = T.m(new THREE.TorusGeometry(0.06, 0.012, 8, 20), T.mat('#e8424f'), s, { w: 0.003 }); vol.position.set(0.18, 0.42, 0); vol.rotation.y = Math.PI / 2; vol.rotation.x = 0.4;
    return s;
  };
  // piscina: buraco azul com borda e água que ondula. Devolve {g, agua, tick(t)}
  C.piscina = (g, w = 4, d = 3, cor = '#45c6d8') => {
    const s = T.grupo(g);
    const tx = C.tex(C.azulejo('#e7d9bd', '#cbbd9f', 4), 256, [w * 1.5, 1]);
    for (const [x, z, ww, dd] of [[0, -d / 2 - 0.5, w + 2, 1], [0, d / 2 + 0.75, w + 2, 1.5], [-w / 2 - 0.5, 0, 1, d], [w / 2 + 0.5, 0, 1, d]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(ww, 0.08, dd), new THREE.MeshToonMaterial({ color: '#efe3cc' })); b.position.set(x, -0.04, z); s.add(b);
    }
    const borda = T.m(new THREE.BoxGeometry(w + 0.08, 0.06, 0.12), T.mat('#f6efe2'), s, { w: 0.004 }); borda.position.set(0, 0.01, d / 2);
    const borda2 = T.m(new THREE.BoxGeometry(w + 0.08, 0.06, 0.12), T.mat('#f6efe2'), s, { w: 0.004 }); borda2.position.set(0, 0.01, -d / 2);
    const fundo = C.plano(w, d, C.tex(C.azulejo('#58c7e0', '#86d9ec', 6), 256, [w, d]), s); fundo.position.y = -1.2;
    const lados = []; for (const [x, z, ry, L] of [[0, -d / 2, 0, w], [-w / 2, 0, Math.PI / 2, d], [w / 2, 0, -Math.PI / 2, d], [0, d / 2, Math.PI, w]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(L, 1.2), new THREE.MeshToonMaterial({ color: '#7fd6ea' })); m.position.set(x, -0.6, z); m.rotation.y = ry; s.add(m); lados.push(m); }
    const geo = new THREE.PlaneGeometry(w, d, 40, 30);
    const agua = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color: cor, transparent: true, opacity: 0.78 })); agua.rotation.x = -Math.PI / 2; agua.position.y = -0.1; s.add(agua);
    const p = geo.attributes.position, base = p.array.slice();
    // reflexos brancos
    const rx = []; for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 12), T.basico('#d8f6ff', { transparent: true, opacity: 0.7 })); m.rotation.x = -Math.PI / 2; m.scale.set(R(0.1, 0.25), R(0.02, 0.04), 1); m.position.set(R(-w / 2 + 0.3, w / 2 - 0.3), -0.09, R(-d / 2 + 0.2, d / 2 - 0.2)); m.ud = { x: m.position.x, f: R(0, 6) }; s.add(m); rx.push(m); }
    s.tick = (t, ondas = []) => {
      for (let i = 0; i < p.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; let z = 0.012 * Math.sin(x * 3 + t * 2) + 0.01 * Math.cos(y * 4 - t * 1.6);
        for (const o of ondas) { const dd = Math.hypot(x - o[0], -y - o[1]), a = t - o[2]; if (a > 0) z += o[3] * Math.sin(dd * 14 - a * 9) * Math.exp(-a * 1.5) * Math.exp(-Math.max(0, dd - a * 1.4) * 4) / (1 + dd * 3); }
        p.setZ(i, z); }
      p.needsUpdate = true; geo.computeVertexNormals();
      rx.forEach((m) => { m.position.x = m.ud.x + Math.sin(t * 0.8 + m.ud.f) * 0.08; m.material.opacity = 0.45 + 0.3 * Math.sin(t * 2 + m.ud.f); });
    };
    s.agua = agua; return s;
  };
  // gotas de respingo: explode em (x,y,z) no tempo t0
  C.respingo = (g, n = 22, cor = '#bfefff', esc = 1) => {
    const gs = []; for (let i = 0; i < n; i++) { const m = T.esfera(R(0.025, 0.05) * esc, cor, g, { w: 0.003 }); const a = C.rnd() * 6.283; m.ud = { vx: Math.cos(a) * R(0.4, 1.3), vz: Math.sin(a) * R(0.3, 1.0), vy: R(1.8, 3.4) }; m.visible = false; gs.push(m); }
    return (t, x, y, z) => gs.forEach((m) => { m.visible = t > 0 && t < 1.1; if (!m.visible) return; const u = m.ud; m.position.set(x + u.vx * t, y + u.vy * t - 4.9 * t * t, z + u.vz * t); if (m.position.y < y - 0.05) m.visible = false; });
  };
  C.palmeira = (g, alt = 3) => {
    const s = T.grupo(g); const tr = T.cilindro(0.09, 0.13, alt, '#9a7a55', s); tr.position.y = alt / 2; tr.rotation.z = 0.06;
    for (let i = 0; i < 7; i++) { const f = T.grupo(s, 0.09, alt, 0); f.rotation.set(0, i / 7 * 6.283, 0); const fo = T.esfera(0.5, '#4a9a4a', f); fo.scale.set(1.8, 0.12, 0.45); fo.position.set(0.75, -0.2, 0); fo.rotation.z = -0.4; }
    return s;
  };
  C.ceu = (g, z = -18, cor1 = '#8fd0ff', cor2 = '#e9f7ff') => T.tela(80, 40, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, cor1); gr.addColorStop(1, cor2); c.fillStyle = gr; c.fillRect(0, 0, w, h); }, g).position.set(0, 10, z);
  // pula-pula inflável verde (chão de gomos)
  C.inflavel = (g) => {
    const s = T.grupo(g);
    const geo = new THREE.PlaneGeometry(6, 6, 90, 90); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.035 * (Math.cos(x * 9) + Math.cos(y * 9))); }
    geo.computeVertexNormals();
    const chao = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color: '#36d36a' })); chao.rotation.x = -Math.PI / 2; s.add(chao);
    const f = C.rb(6, 1.0, 0.4, 0.15, '#2f6fe0', s); f.position.set(0, 0.5, -2.2);
    const f2 = C.rb(6, 0.25, 0.42, 0.1, '#e8424f', s); f2.position.set(0, 1.05, -2.2);
    for (const sx of [-1, 1]) { const l = C.rb(0.4, 1.3, 4.5, 0.15, '#2f6fe0', s); l.position.set(sx * 2.6, 0.6, 0); }
    s.chao = chao; return s;
  };
  // pote de chocolate
  C.pote = (g) => { const s = T.grupo(g); T.cilindro(0.08, 0.08, 0.16, '#6b3b1f', s).position.y = 0.08; T.cilindro(0.085, 0.085, 0.03, '#e8424f', s).position.y = 0.17; return s; };
  // manchas de chocolate no rosto do bebê
  C.chocolate = (B) => {
    const ms = []; const cor = T.basico('#4a2412');
    for (const [x, y, s] of [[0.065, -0.095, 0.7], [-0.07, -0.1, 0.8], [0.0, -0.135, 0.75], [0.035, -0.128, 0.5], [-0.04, -0.13, 0.55], [0.11, -0.05, 0.5], [-0.1, -0.035, 0.45], [0.0, -0.035, 0.35], [0.03, 0.07, 0.4], [0.085, -0.115, 0.4]]) {
      const z = Math.sqrt(Math.max(0, 0.19 * 0.19 - x * x - y * y)) * 0.96 + 0.0015;
      const m = new THREE.Mesh(new THREE.CircleGeometry(0.026 * s, 12), cor); m.position.set(x, y, z); m.lookAt(new V(x * 3, y * 3, z * 3)); m.rotateZ(C.R(0, 3)); m.scale.set(1.3, 0.85, 1); B.C.add(m); ms.push(m);
    }
    for (const L of ['E', 'D']) { const h = T.esfera(0.016, '#4a2412', B.br[L].pu, { sem: true }); h.material = cor; h.scale.set(1, 0.6, 0.6); h.position.set(0, -0.035, 0.02); }
    return ms;
  };
  // galo (calombo) na testa
  C.galo = (B) => { const m = T.esfera(0.035, '#ff8f86', B.C, { w: 0.003 }); m.position.set(0.03, 0.075, 0.165); m.scale.set(1, 0.9, 0.55); const b = T.esfera(0.009, '#ffffff', m, { sem: true }); b.position.set(-0.012, 0.014, 0.03); return m; };
  // estrelinhas girando (tontura)
  C.estrelas = (g) => { const ss = []; for (let i = 0; i < 4; i++) { const st = T.m(new THREE.OctahedronGeometry(0.035), T.mat('#ffd23a'), g, { w: 0.003 }); ss.push(st); } return (t, c) => ss.forEach((s, i) => { const a = t * 5 + i * 1.57; s.position.set(c.x + Math.cos(a) * 0.2, c.y + 0.03 * Math.sin(a * 2), c.z + Math.sin(a) * 0.08); s.rotation.y = t * 6; }); };

  // ---------- poses-chave do bebê ----------
  const P = C.P = {};
  P.pe = {};
  P.engatinha = { y: 0.2, rx: 1.15, tr: [0.15, 0, 0], cb: [-1.0, 0, 0], bE: [-1.2, 0.1, 0, -0.2], bD: [-1.2, 0.1, 0, -0.2], pE: [-1.2, 0.08, 2.2, 0.6], pD: [-1.2, 0.08, 2.2, 0.6] };
  P.sentado = { y: 0.03, tr: [-0.05, 0, 0], pE: [-1.45, 0.25, 0.25, -0.3], pD: [-1.45, 0.25, 0.25, -0.3], bE: [-0.4, 0.3, 0, -0.6], bD: [-0.4, 0.3, 0, -0.6] };
  P.bracosCima = { bE: [-2.9, 0.25, 0, -0.1], bD: [-2.9, 0.25, 0, -0.1] };
  P.festa = { bE: [-0.2, 2.4, 0, -0.4], bD: [-0.2, 2.4, 0, -0.4] };
  P.equilibra = { bE: [0, 1.4, 0, -0.2], bD: [0, 1.4, 0, -0.2], pE: [0, 0.18, 0, 0], pD: [0, 0.18, 0, 0] };
  P.agachado = { y: -0.06, tr: [0.35, 0, 0], cb: [-0.3, 0, 0], pE: [-1.3, 0.2, 1.9, -0.6], pD: [-1.3, 0.2, 1.9, -0.6], bE: [-0.9, 0.2, 0, -0.5], bD: [-0.9, 0.2, 0, -0.5] };
  P.deitadoBarriga = { y: 0.11, rx: 1.5, cb: [-1.2, 0, 0], tr: [0, 0, 0], bE: [-2.6, 0.4, 0, -0.3], bD: [-2.6, 0.4, 0, -0.3], pE: [0.1, 0.15, 0.4, 0.4], pD: [0.1, 0.15, 0.6, 0.4] };
  // mistura de poses: base + sobreposição
  C.mix = (...ps) => Object.assign({}, ...ps);
  // interpola poses por chaves [[t, pose], ...]
  const CAMPOS = ['y', 'x', 'z', 'rx', 'ry', 'rz', 'tr', 'cb', 'bE', 'bD', 'pE', 'pD'];
  const DEF = { y: 0, x: 0, z: 0, rx: 0, ry: 0, rz: 0, tr: [0, 0, 0], cb: [0, 0, 0], bE: [0, 0.15, 0, -0.3], bD: [0, 0.15, 0, -0.3], pE: [0, 0.04, 0, 0], pD: [0, 0.04, 0, 0] };
  C.PK = (ks, t) => { const o = {}; for (const c of CAMPOS) o[c] = T.chaves(ks.map(([tt, p]) => [tt, p[c] == null ? DEF[c] : p[c]]), t); return o; };
  // somar deslocamentos a uma pose
  C.add = (p, d) => { const o = Object.assign({}, p); for (const k in d) { if (Array.isArray(d[k])) o[k] = (o[k] || DEF[k]).map((v, i) => v + (d[k][i] || 0)); else o[k] = (o[k] || 0) + d[k]; } return o; };
  // ciclo de engatinhar (fase em ciclos)
  C.cicloEngatinha = (f) => { const s = Math.sin(f * 6.283), c = Math.cos(f * 6.283); return C.add(P.engatinha, { bE: [0.45 * s, 0, 0, 0], bD: [-0.45 * s, 0, 0, 0], pE: [-0.35 * s, 0, 0, 0], pD: [0.35 * s, 0, 0, 0], rz: 0.05 * s, y: 0.01 * Math.abs(c) }); };
  C.cicloCorre = (f, amp = 1) => { const s = Math.sin(f * 6.283), c = Math.cos(f * 6.283); return C.add({ tr: [0.15, 0, 0], bE: [0, 0.35, 0, -1.2], bD: [0, 0.35, 0, -1.2] }, { pE: [-0.7 * s * amp, 0, 0.6 * Math.max(0, s) * amp + 0.1, 0], pD: [0.7 * s * amp, 0, 0.6 * Math.max(0, -s) * amp + 0.1, 0], bE: [0.7 * s * amp, 0, 0, 0], bD: [-0.7 * s * amp, 0, 0, 0], y: 0.025 * Math.abs(c) * amp, rz: 0.06 * s }); };
})();
