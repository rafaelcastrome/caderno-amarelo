// Parte 4 (final): ônibus parado no ponto, a regra do motorista, o amigo desce pela porta de trás, tu fica e liga pro teu eu do passado. Tempos de dados_ep4.json.
// Rua corre ao longo de X. Nossa calçada z 0..4, pista z -7..0, calçada do outro lado z -10..-7.
window.CENA = (T) => {
  const V3 = THREE.Vector3;
  const TL = window.DADOS.tl, DUR = window.DADOS.dur, EV = window.DADOS.ev;
  const E = (k) => TL[k];
  const fundoCeu = new THREE.Color('#b4bcc4'), ceuTemp = new THREE.Color('#6c7680');
  T.cena.background = fundoCeu.clone();
  T.fisheye.vin.value = 0.4;
  const hemi = T.cena.children.find((o) => o.isHemisphereLight);

  // ---------- chão ----------
  const plano = (w, d, cor, x, y, z) => { const m = T.caixa(w, 0.02, d, cor, null, { sem: true }); m.position.set(x, y, z); return m; };
  plano(160, 4.5, '#cdcac3', 0, 0.12, 2.25);           // nossa calçada
  const meio = T.caixa(160, 0.14, 0.18, '#e9e6df', null); meio.position.set(0, 0.07, 0.0); // meio-fio
  plano(160, 7, '#5d6068', 0, 0.0, -3.5);              // pista
  for (let x = -80; x < 80; x += 4) { const f = T.caixa(2, 0.01, 0.15, T.basico('#f0f0e8'), null, { sem: true }); f.position.set(x, 0.015, -3.5); }
  const meio2 = T.caixa(160, 0.14, 0.18, '#e9e6df', null); meio2.position.set(0, 0.07, -7.0);
  plano(160, 3, '#cdcac3', 0, 0.12, -8.5);
  plano(160, 6, '#8cbf6a', 0, 0.1, -13);               // grama do outro lado
  plano(160, 6, '#8cbf6a', 0, 0.1, 7.5);
  // poças (aparecem com a chuva)
  const pocas = [];
  for (const [x, z, s] of [[-1.5, 1.6, 0.9], [2.8, 2.6, 0.6], [-4, -1.2, 1.4], [4, -5.5, 1.1], [0.5, -8.3, 0.7]]) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(s, 24), T.basico('#7f93a8', { transparent: true, opacity: 0 })); p.rotation.x = -Math.PI / 2; p.position.set(x, z > 0 || z < -7 ? 0.135 : 0.012, z); p.scale.y = 0.6; T.cena.add(p); pocas.push(p);
  }

  // ---------- casas ----------
  const coresCasa = ['#f0d9a8', '#cfe0ea', '#f2c4b0', '#e2e8c8', '#e8d0e6', '#f5e6c8'];
  const casa = (x, z, ry, i) => {
    const g = T.grupo(null, x, 0, z); g.rotation.y = ry;
    const w = 5 + (i % 3), h = 3 + (i % 2) * 0.6;
    const corpo = T.caixa(w, h, 5, coresCasa[i % 6], g); corpo.position.y = h / 2;
    const tel = T.m(new THREE.CylinderGeometry(3.3, 3.3, w + 0.4, 3), '#b5523b', g, { radial: true }); tel.rotation.z = Math.PI / 2; tel.rotation.y = 0; tel.rotation.x = Math.PI / 2; tel.position.y = h + 0.45; tel.scale.set(1, 1, 0.42);
    tel.rotation.set(0, 0, Math.PI / 2); tel.scale.set(0.42, 1, 0.85);
    const porta = T.caixa(0.9, 2.0, 0.08, '#7a4e2e', g); porta.position.set(-w / 4, 1.0, 2.52);
    for (const xx of [w / 6, w / 3]) { const j = T.caixa(0.9, 0.9, 0.06, '#9cc8e8', g); j.position.set(xx, 1.7, 2.52); const b = T.caixa(1.0, 1.0, 0.04, '#ffffff', g, { sem: true }); b.position.set(xx, 1.7, 2.5); }
    const cerca = T.caixa(w, 0.8, 0.06, '#f7f4ee', g); cerca.position.set(0, 0.4, 4.4);
    return g;
  };
  let i = 0; for (let x = -62; x <= 62; x += 8.5) casa(x, -16, 0, i++);
  i = 3; for (let x = -62; x <= 62; x += 8.5) casa(x, 11, Math.PI, i++);
  // árvores e postes
  const arvore = (x, z, s = 1) => { const t = T.cilindro(0.14 * s, 0.18 * s, 2.2 * s, '#7a5434'); t.position.set(x, 1.1 * s, z);
    for (const [dx, dy, r] of [[0, 2.6, 1.1], [0.6, 2.3, 0.8], [-0.6, 2.4, 0.85]]) { const c = T.esfera(r * s, '#5fa04e'); c.position.set(x + dx * s, dy * s, z); } };
  for (const x of [-52, -36, -18, -9, 7, 15, 24, 40, 55]) arvore(x, -11.5, 1.1);
  for (const x of [-44, -14, 10, 30]) arvore(x, 4.6, 1.0);
  const poste = (x, z) => { const p = T.cilindro(0.06, 0.08, 5, '#5b6068'); p.position.set(x, 2.5, z); const b = T.caixa(0.9, 0.08, 0.2, '#5b6068'); b.position.set(x, 5, z + (z > 0 ? -0.4 : 0.4)); };
  poste(-6, 0.5); poste(9, 0.5); poste(3.2, -7.6); poste(-12, -7.6);
  // nuvens
  const nuvens = T.grupo(null, 0, 0, 0);
  for (let k = 0; k < 14; k++) { const n = T.esfera(3 + (k % 3), '#e2e6ea', nuvens, { sem: true }); n.scale.set(2.2, 0.6, 1.2); n.position.set(-50 + k * 8, 26 + (k % 4) * 2, -40 + (k % 5) * 6); }
  const nuvMats = nuvens.children.map((n) => n.material);

  // ---------- ponto de ônibus ----------
  const PX = 1.6, PZ = 2.9;
  const fundoP = T.caixa(3.2, 2.2, 0.06, T.mat('#bfe0ee', { transparent: true, opacity: 0.55 }), null); fundoP.position.set(PX, 1.25, PZ + 0.4);
  const teto = T.caixa(3.5, 0.1, 1.5, '#3a6ea8', null); teto.position.set(PX, 2.4, PZ - 0.2);
  for (const dx of [-1.6, 1.6]) { const c = T.caixa(0.08, 2.3, 0.08, '#3a6ea8', null); c.position.set(PX + dx, 1.25, PZ + 0.35); }
  const banco = T.caixa(2.4, 0.08, 0.45, '#c98b4f', null); banco.position.set(PX, 0.6, PZ + 0.1);
  for (const dx of [-1, 1]) { const p = T.caixa(0.06, 0.45, 0.06, '#333', null); p.position.set(PX + dx, 0.36, PZ + 0.1); }
  const placaP = T.cilindro(0.04, 0.04, 2.8, '#666', null); placaP.position.set(4.6, 1.5, 0.6);
  const placa = T.tela(0.55, 0.55, 256, (c, w, h) => { c.fillStyle = '#1f5fae'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 120px sans-serif'; c.textAlign = 'center'; c.fillText('7', w / 2, 150); c.font = 'bold 40px sans-serif'; c.fillText('PONTO', w / 2, 220); });
  placa.position.set(4.6, 2.7, 0.62); placa.rotation.y = 0.3;

  T.cena.background.copy(new THREE.Color('#4a525c'));
  hemi.intensity = 0.7; T.sol.intensity = 0.32;
  pocas.forEach((p) => { p.material.opacity = 0.7; });
  nuvens.children.forEach((n) => n.material.color.set('#6d757e'));
  const fim = (k) => E(k) + EV[k].d;
  const J = (k) => T.janela;

  // ---------- ônibus por dentro (grupo local: frente +x, porta no lado +z) ----------
  const ib = T.grupo(null, 0, 0, -2.7);
  const PISO = 0.55;
  const cx = (w, h, d, cor, x, y, z, o) => { const m = T.caixa(w, h, d, cor, ib, o); m.position.set(x, y, z); return m; };
  cx(11, 0.1, 2.5, '#4a4a50', 0, 0.5, 0);                         // piso
  cx(11, 0.1, 2.6, '#d8d4c8', 0, 3.02, 0);                        // teto
  const fitas = [cx(10, 0.03, 0.14, T.basico('#fff6d8'), 0, 2.96, 0.5, { sem: true }), cx(10, 0.03, 0.14, T.basico('#fff6d8'), 0, 2.96, -0.5, { sem: true })];
  const corParede = '#d9cfb8';
  // paredes laterais com janelas (vão de y 1.3 a 2.5)
  cx(11, 0.75, 0.06, corParede, 0, 0.93, -1.25); cx(11, 0.5, 0.06, corParede, 0, 2.77, -1.25);
  cx(1.4, 0.75, 0.06, corParede, -4.8, 0.93, 1.25); cx(7.15, 0.75, 0.06, corParede, 0.375, 0.93, 1.25); cx(0.55, 0.75, 0.06, corParede, 5.225, 0.93, 1.25); cx(11, 0.5, 0.06, corParede, 0, 2.77, 1.25);
  for (let x = -5.45; x <= 4.0; x += 1.6) for (const z of [-1.25, 1.25]) if (!(z > 0 && Math.abs(x + 3.85) < 0.1)) cx(0.14, 1.2, 0.08, corParede, x, 1.9, z);
  for (const x of [-4.1, -3.2]) cx(0.12, 2.0, 0.08, corParede, x, 1.55, 1.25);
  cx(0.14, 1.2, 0.08, corParede, 3.95, 1.9, 1.25); cx(0.14, 1.2, 0.08, corParede, 4.95, 1.9, 1.25); cx(0.14, 1.2, 0.08, corParede, 5.45, 1.9, -1.25);
  const vidro = T.mat('#a8cfe2', { transparent: true, opacity: 0.12 });
  cx(11, 1.2, 0.02, vidro, 0, 1.9, -1.22, { sem: true }); cx(1.4, 1.2, 0.02, vidro, -4.8, 1.9, 1.22, { sem: true }); cx(7.15, 1.2, 0.02, vidro, 0.375, 1.9, 1.22, { sem: true });
  const folhasT = [-1, 1].map((s) => cx(0.43, 1.95, 0.05, T.mat('#7090a8', { transparent: true, opacity: 0.25 }), -3.65 + s * 0.22, 1.55, 1.28, { sem: true })); // porta de trás
  cx(0.9, 0.3, 0.4, '#555', -3.65, 0.35, 1.45); // degrau
  // fundo (janela traseira)
  cx(0.06, 1.0, 2.5, corParede, -5.5, 1.0, 0); cx(0.06, 0.5, 2.5, corParede, -5.5, 2.77, 0); cx(0.03, 1.0, 2.4, vidro, -5.48, 2.0, 0, { sem: true });
  // porta fechada (2 folhas escuras)
  const folhas = [-1, 1].map((s) => cx(0.44, 1.95, 0.05, T.mat('#3a5068', { transparent: true, opacity: 0.55 }), 4.45 + s * 0.23, 1.55, 1.28, { sem: true }));
  // frente: para-brisa, painel, volante, banco e divisória do motorista
  cx(0.06, 0.8, 2.5, '#f0b23a', 5.5, 0.95, 0); cx(0.03, 1.3, 2.4, vidro, 5.48, 2.0, 0, { sem: true }); cx(0.06, 0.45, 2.5, corParede, 5.5, 2.8, 0);
  cx(0.5, 0.35, 2.3, '#2b2b2e', 5.2, 1.25, 0);
  const vol = T.m(new THREE.TorusGeometry(0.2, 0.025, 10, 28), '#1a1a1a', ib); vol.position.set(5.05, 1.45, -0.6); vol.rotation.y = Math.PI / 2; vol.rotation.x = 0.5;
  cx(0.12, 0.8, 0.9, '#30343a', 4.05, 1.3, -0.65); cx(0.06, 1.5, 0.06, '#e8c000', 3.95, 1.3, -0.15);
  const letr = T.tela(1.2, 0.18, 256, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffb02e'; c.font = 'bold 30px monospace'; c.textAlign = 'center'; c.fillText('7  CENTRO', w / 2, 30); }, ib);
  letr.position.set(5.4, 2.85, 0); letr.rotation.y = -Math.PI / 2;
  // barras amarelas
  for (let x = -4.6; x <= 3.4; x += 1.7) for (const z of [-0.33, 0.33]) { const b = T.cilindro(0.022, 0.022, 2.45, '#e8c000', ib); b.position.set(x, 1.78, z); }
  for (const z of [-0.36, 0.36]) { const b = T.cilindro(0.02, 0.02, 9.6, '#e8c000', ib); b.rotation.z = Math.PI / 2; b.position.set(-0.6, 2.72, z); }
  // bancos (olhando pra frente) e o banco do fundo
  const assento = (x, z) => { cx(0.46, 0.1, 0.82, '#2f5fa8', x, 1.0, z); cx(0.08, 0.62, 0.82, '#2f5fa8', x - 0.23, 1.34, z); cx(0.06, 0.45, 0.06, '#333', x, 0.75, z); };
  for (let k = 0; k <= 8; k++) { const x = -4.1 + k * 0.85; assento(x, -0.8); if (x < 3.5 && x > -3.0) assento(x, 0.8); }
  cx(0.6, 0.1, 2.4, '#2f5fa8', -5.0, 1.0, 0); cx(0.08, 0.8, 2.4, '#2f5fa8', -5.42, 1.45, 0); cx(0.6, 0.45, 2.4, '#333a44', -5.0, 0.75, 0);
  // luzes internas (piscam)
  const luzes = [new THREE.PointLight(0xfff0d0, 5, 9), new THREE.PointLight(0xfff0d0, 5, 9)];
  luzes[0].position.set(2.2, 2.7, 0); luzes[1].position.set(-2.8, 2.7, 0); luzes.forEach((l) => ib.add(l));
  // boné do amigo no banco
  const bone = T.grupo(ib, 1.05, 1.06, 0.8);
  const copa = T.m(new THREE.SphereGeometry(0.15, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), '#50545e', bone); copa.scale.y = 0.75;
  const aba = T.cilindro(0.1, 0.1, 0.012, '#50545e', bone); aba.scale.set(1, 1, 0.75); aba.position.set(0.17, 0.0, 0); aba.rotation.z = -0.1;
  bone.rotation.y = 0.6;

  // ---------- personagens ----------
  const mot = T.pessoa({ pele: '#f1c6a2', cabelo: '#2a1c12', roupa: '#2f8f4e', calca: '#3b5a8c', coque: false });
  mot.pernas.forEach((p) => p.visible = false);
  mot.g.position.set(4.55, 0.3, -0.6); ib.add(mot.g); mot.g.rotation.y = Math.PI / 2;
  // amigo sentado no banco do fundo (coxas pra frente, canelas pra baixo)
  const amigo = T.pessoa({ pele: '#c98e66', cabelo: '#2a1c12', roupa: '#e2783a', calca: '#2e3f6e', sapato: '#f2f2f2', coque: false });
  amigo.pernas.forEach((q) => { q.children.forEach((c) => c.visible = false);
    const coxa = T.capsula(0.06, 0.34, '#2e3f6e', q); coxa.rotation.x = Math.PI / 2; coxa.position.set(0, -0.02, 0.2);
    const canela = T.capsula(0.055, 0.36, '#2e3f6e', q); canela.position.set(0, -0.26, 0.4);
    const pe = T.esfera(0.07, '#f2f2f2', q); pe.scale.set(0.85, 0.6, 1.5); pe.position.set(0, -0.5, 0.45); });
  amigo.g.position.set(-4.95, 0.27, 0); amigo.g.rotation.y = Math.PI / 2; ib.add(amigo.g);
  amigo.tronco.rotation.x = 0.12;
  // a mulher no portão (aparece de novo a cada volta)
  const mulher = T.pessoa({ pele: '#e8b48e', cabelo: '#c4c4c4', roupa: '#7a3b5e', saia: true, coque: true });
  mulher.g.rotation.y = Math.PI;
  // tu e o amigo no ponto, às 6:58 (o começo da parte 1)
  const euP = T.pessoa({ pele: '#f1c6a2', cabelo: '#2a1c12', roupa: '#2f8f4e', calca: '#3b5a8c', sapato: '#f2f2f2', coque: false });
  const amP = T.pessoa({ pele: '#c98e66', cabelo: '#2a1c12', roupa: '#e2783a', calca: '#2e3f6e', sapato: '#f2f2f2', coque: false, bone: '#222428' });
  euP.g.position.set(1.95, 0.13, 2.25); amP.g.position.set(1.25, 0.13, 1.9);
  const celP = T.caixa(0.075, 0.15, 0.01, '#22252b', null);

  // amigo em pé (quando levanta e desce)
  const amigoE = T.pessoa({ pele: '#c98e66', cabelo: '#2a1c12', roupa: '#e2783a', calca: '#2e3f6e', sapato: '#f2f2f2', coque: false });
  ib.add(amigoE.g);
  bone.visible = false;
  // ônibus parado no ponto (onde a parte 3 terminou)
  const XEND = PX + 3.3; ib.position.x = XEND;
  const V = T.pov({ x: 0, y: 2.15, z: 0, empe: true });
  const F2 = Math.PI * 1.5, TRAS = Math.PI / 2, DIR = Math.PI;
  const LX = -3.5, LZ = -0.25;
  const NOTICIA = { nome: 'NOTÍCIA', icone: '!', hora: '6:58', msgs: [['Ônibus 7 cai em córrego', 'durante temporal às 7h.', 'Ninguém sobreviveu.']] };
  const yDe = (x, z) => Math.atan2(-(x - LX), -(z - LZ));
  const porta = new V3(-3.65, 0, 1.0);

  T.cada((t) => {
    V.corpo.position.set(XEND + LX, 2.15 + Math.sin(t * 1.3) * 0.004, -2.7 + LZ);
    // ---- luzes: normais, piscam, apagam ----
    const apag = T.janela(t, E('APAGA'), E('APAGA') + 0.6);
    const pis = (t > E('VIRA') && t < E('VIRA') + 0.6) || (t > E('APAGA') - 0.8 && t < E('APAGA') + 0.6) ? (Math.sin(t * 31) * Math.sin(t * 7.7) > 0.1 ? 0.15 : 1) : (Math.sin(t * 17) * Math.sin(t * 3.1) > 0.97 ? 0.4 : 1);
    const L = pis * (1 - 0.92 * apag);
    luzes.forEach((l) => l.intensity = 5 * L); fitas.forEach((f) => f.material.color.set(L > 0.5 ? '#fff6d8' : '#3a3832'));
    hemi.intensity = 0.7 - 0.45 * apag; T.sol.intensity = 0.32 - 0.25 * apag;
    T.cena.background.set(apag > 0.5 ? '#262b31' : '#4a525c');
    // ---- motorista em pé no corredor, vem chegando; some quando apaga ----
    mot.pernas.forEach((q) => q.visible = true);
    const mx = T.chaves([[0, 3.0], [E('VIRA'), 3.0], [E('b0'), 2.4], [E('b2') + 1, 0.4], [DUR, 0.4]], t);
    const andando = Math.abs(T.chaves([[0, 3.0], [E('VIRA'), 3.0], [E('b0'), 2.4], [E('b2') + 1, 0.4], [DUR, 0.4]], t + 0.05) - mx) > 0.002;
    mot.g.position.set(mx, PISO, 0); mot.g.rotation.y = -Math.PI / 2; mot.g.visible = t < E('APAGA') + 0.3;
    mot.anda(t * 0.9, andando ? 0.22 : 0); if (!andando) mot.pernas.forEach((q) => q.rotation.x = 0);
    mot.solto('E', 0.06); mot.solto('D', 0.06); mot.pisca(0); mot.cenho(0.4); mot.olhar(0, 0);
    mot.boca(Math.max(T.boca('b0', E('b0'), t), T.boca('b1', E('b1'), t), T.boca('b2', E('b2'), t)) * 1.3 + 0.1);
    mot.cabeca.rotation.set(0.04, 0, -0.07 + 0.03 * Math.sin(t * 0.8));
    // ---- amigo: sentado no fundo; levanta e desce pela porta de trás ----
    const levanta = t > E('CORRE') - 0.2;
    amigo.g.visible = !levanta; amigoE.g.visible = levanta;
    const fA = Math.max(T.boca('a1', E('a1'), t), T.boca('a2', E('a2'), t), T.boca('a5', E('a5'), t));
    amigo.boca(fA * 1.2); amigoE.boca(fA * 1.2); amigo.piscaAuto(t, 2.2); amigoE.piscaAuto(t, 2.2);
    amigo.cabeca.rotation.set(t < E('a1') - 0.3 ? 0.35 : 0, 0, 0); amigo.cenho(-0.5);
    amigo.olhar(0, 0); amigo.mao('E', [0.12, 0.8, 0.32], [1, -0.5, -0.3]); amigo.mao('D', [-0.12, 0.8, 0.32], [-1, -0.5, -0.3]);
    // caminho: banco -> corredor -> porta -> degrau -> calçada (até o ponto)
    const u = T.janela(t, E('CORRE'), E('CORRE') + 2.6);
    const cam2 = [[-4.6, PISO, 0.0], [-4.0, PISO, 0.6], [-3.65, PISO, 1.1], [-3.65, 0.35, 1.7], [-2.6, 0.13 - 0, 3.6]];
    const seg = Math.min(3, Math.floor(u * 4)), f = u * 4 - seg, a = cam2[seg], b = cam2[seg + 1];
    const ax = T.lerp(a[0], b[0], f), ay = T.lerp(a[1], b[1], f), az = T.lerp(a[2], b[2], f);
    amigoE.g.position.set(ax, ay, az);
    amigoE.g.rotation.y = u > 0.98 ? Math.atan2(LX - ax, LZ - az) : Math.atan2(b[0] - a[0], b[2] - a[2]);
    amigoE.anda(t * 1.8, u > 0 && u < 0.99 ? 0.45 : 0); if (u >= 0.99) amigoE.pernas.forEach((q) => q.rotation.x = 0);
    amigoE.solto('E', 0.1); amigoE.solto('D', 0.1); amigoE.cenho(-0.6);
    if (u >= 0.99 && t < E('FECHA') + 1.2) amigoE.mao('D', [-0.2, 1.45, 0.25], [-1, -0.3, 0]); // acena da calçada
    if (t > E('APAGA') + 0.3) amigoE.g.visible = false;
    // portas de trás: abrem pra ele descer, fecham
    const ab = T.janela(t, E('CORRE') + 0.4, E('CORRE') + 0.9) * (1 - T.janela(t, E('FECHA'), E('FECHA') + 0.6));
    folhasT.forEach((fl, k) => { const s = k ? 1 : -1; fl.position.x = -3.65 + s * (0.22 + 0.26 * ab); fl.position.z = 1.28 + 0.08 * ab; });
    // ---- tu e o amigo do passado no ponto: somem quando apaga ----
    const ve = t < E('APAGA') + 0.3; euP.g.visible = ve; amP.g.visible = ve; celP.visible = ve;
    euP.g.rotation.y = Math.PI * 0.85; amP.g.rotation.y = Math.atan2(1.95 - 1.25, 2.25 - 1.9);
    euP.mao('D', [-0.08, 1.15, 0.28], [-1, -0.6, 0.2]); euP.solto('E', 0.06); euP.cabeca.rotation.x = 0.35; euP.piscaAuto(t, 1.1);
    amP.solto('E', 0.08); amP.solto('D', 0.08); amP.piscaAuto(t, 2);
    euP.g.updateMatrixWorld(true); celP.position.copy(euP.br.D.mao.getWorldPosition(new V3())); celP.rotation.set(-0.9, euP.g.rotation.y, 0);
    mulher.g.visible = false;
    // ---- câmera ----
    const pos = (y) => (y < 0 ? y + 2 * Math.PI : y); // tudo no mesmo ramo (0..2π) pra virar pelo lado certo
    const yAm = pos(yDe(-4.95, 0)), yPorta = pos(yDe(-3.1, 4.9)), yPonto = pos(yDe(-3.3, 4.95));
    const yaw = T.chaves([[0, yPonto], [E('a0') + EV.a0.d, yPonto], [E('a1') + 0.3, yAm], [E('VIRA'), yAm], [E('VIRA') + 1.2, F2], [E('OLHAM'), F2],
      [E('OLHAM') + 1.0, yAm], [E('CORRE'), yAm], [E('CORRE') + 0.9, yAm + 0.4], [E('CORRE') + 2.2, yPorta], [E('FECHA') + 1.0, yPorta],
      [E('APAGA') + 1.2, yPorta], [E('b3'), yPorta], [E('b3') + 2.0, F2 - 0.3], [E('CEL'), F2 - 0.3], [DUR, F2 - 0.3]], t);
    const pitch = T.chaves([[0, -0.08], [E('a1'), -0.08], [E('a1') + 0.3, -0.15], [E('VIRA') + 1.2, 0.0], [E('NOTI') + 0.1, 0.0], [E('NOTI') + 0.6, -0.5], [E('b1') + 1.0, -0.5],
      [E('b1') + 1.7, 0.0], [E('OLHAM') + 1.0, -0.15], [E('PAUSA'), -0.15], [E('PAUSA') + 0.6, -0.4], [E('a4'), -0.4], [E('a4') + 0.5, -0.12], [E('CORRE') + 2.2, -0.12],
      [E('CEL') + 0.1, -0.05], [E('CEL') + 0.7, -0.5], [DUR, -0.52]], t) + Math.sin(t * 1.5) * 0.008;
    const zm = T.suave(T.janela(t, E('b0'), E('b0') + 3)) * (1 - T.suave(T.janela(t, E('OLHAM'), E('OLHAM') + 0.8)));
    const zf = 0.35 * T.janela(t, E('a6'), E('a6') + 2.5);
    T.cam.fov = 104 - zm * 34 - zf * 20; T.fisheye.k.value = 0.42 * (1 - 0.4 * zm); T.cam.updateProjectionMatrix();
    V.olhar(yaw, pitch, 0);
    // ---- celular: a notícia; depois a ligação pro EU às 6:52 ----
    const sobe = T.chaves([[0, 0], [E('NOTI') + 0.1, 0], [E('NOTI') + 0.6, 1], [E('b1') + 1.0, 1], [E('b1') + 1.6, 0], [E('CEL') + 0.1, 0], [E('CEL') + 0.7, 1], [DUR, 1]], t);
    const vib = (t > E('NOTI') && t < E('NOTI') + 0.7) ? 0.0025 * Math.sin(t * 160) : 0;
    V.cel.position.set(T.lerp(0.05, 0, sobe) + vib, T.lerp(-0.75, -0.19, sobe), T.lerp(-0.2, -0.27 + 0.05 * T.janela(t, E('a6'), DUR), sobe));
    V.cel.rotation.set(T.lerp(-0.9, -0.42, sobe), T.lerp(0.3, 0.02, sobe), T.lerp(0.4, -0.04, sobe));
    V.cel.visible = sobe > 0.001; V.bE.ombro.visible = V.cel.visible;
    if (t < E('CEL')) V.celTela('msgs', 0, NOTICIA);
    else if (t < E('a6') - 0.2) V.celTela('ligando', 0, { nome: 'EU', hora: '6:52' });
    else V.celTela('chamada', t - E('a6') + 0.2, { nome: 'EU', hora: '6:52' });
    const tap = E('CEL') + 1.8;
    const ud = T.janela(t, E('CEL') + 1.0, tap - 0.1) * (1 - T.janela(t, tap + 0.2, tap + 0.6));
    V.dedo(ud, V.botaoVerde, T.janela(t, tap - 0.15, tap));
    V.bracos();
  });
  return { dur: DUR };
};
