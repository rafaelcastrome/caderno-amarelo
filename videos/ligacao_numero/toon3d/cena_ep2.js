// Episódio 2 (caminho NÃO ENTRAR): mesma rua da parte 1. Tempos de dados_ep2.json (tl_ep2.py).
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
  plano(120, 4.5, '#cdcac3', 0, 0.12, 2.25);           // nossa calçada
  const meio = T.caixa(120, 0.14, 0.18, '#e9e6df', null); meio.position.set(0, 0.07, 0.0); // meio-fio
  plano(120, 7, '#5d6068', 0, 0.0, -3.5);              // pista
  for (let x = -60; x < 60; x += 4) { const f = T.caixa(2, 0.01, 0.15, T.basico('#f0f0e8'), null, { sem: true }); f.position.set(x, 0.015, -3.5); }
  const meio2 = T.caixa(120, 0.14, 0.18, '#e9e6df', null); meio2.position.set(0, 0.07, -7.0);
  plano(120, 3, '#cdcac3', 0, 0.12, -8.5);
  plano(120, 6, '#8cbf6a', 0, 0.1, -13);               // grama do outro lado
  plano(120, 6, '#8cbf6a', 0, 0.1, 7.5);
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
  let i = 0; for (let x = -40; x <= 40; x += 8.5) casa(x, -16, 0, i++);
  i = 3; for (let x = -40; x <= 40; x += 8.5) casa(x, 11, Math.PI, i++);
  // árvores e postes
  const arvore = (x, z, s = 1) => { const t = T.cilindro(0.14 * s, 0.18 * s, 2.2 * s, '#7a5434'); t.position.set(x, 1.1 * s, z);
    for (const [dx, dy, r] of [[0, 2.6, 1.1], [0.6, 2.3, 0.8], [-0.6, 2.4, 0.85]]) { const c = T.esfera(r * s, '#5fa04e'); c.position.set(x + dx * s, dy * s, z); } };
  for (const x of [-18, -9, 7, 15, 24]) arvore(x, -11.5, 1.1);
  for (const x of [-14, 10]) arvore(x, 4.6, 1.0);
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

  // ---------- personagens ----------
  const amigo = T.pessoa({ pele: '#c98e66', cabelo: '#2a1c12', roupa: '#e2783a', calca: '#2e3f6e', sapato: '#f2f2f2', coque: false, bone: '#222428' });
  const AX = 1.25, AZ = 1.9;
  amigo.g.position.set(AX, 0.13, AZ);
  const sombra = T.pessoa({ pele: '#e9b48c', roupa: '#2f8f4e', calca: '#3b5a8c', sapato: '#f2f2f2', capuz: '#2b7e45', coque: false });
  sombra.g.position.set(2.3, 0.13, -8.7);
  const celS = T.caixa(0.075, 0.15, 0.01, '#22252b', null);
  // motorista
  const mot = T.pessoa({ pele: '#d9a07a', cabelo: '#9a9a9a', roupa: '#2c4a7a', calca: '#2c3440', coque: false, bone: '#2c4a7a' });
  mot.pernas.forEach((p) => p.visible = false);
  const mot2 = T.pessoa({ pele: '#f1c6a2', cabelo: '#2a1c12', roupa: '#2f8f4e', calca: '#3b5a8c', coque: false });
  mot2.pernas.forEach((p) => p.visible = false);

  // ---------- caminhão ----------
  const cam = T.grupo(null, -40, 0, -5.2);
  const bau = T.caixa(6, 2.8, 2.4, '#e8e8e8', cam); bau.position.set(-1.2, 1.9, 0);
  const cab = T.caixa(1.8, 2.2, 2.3, '#c8343a', cam); cab.position.set(2.8, 1.5, 0);
  const vid = T.caixa(0.05, 0.8, 2.0, '#2a3a4a', cam, { sem: true }); vid.position.set(3.71, 2.0, 0);
  for (const x of [-3, -0.8, 2.8]) for (const z of [-1.15, 1.15]) { const r = T.cilindro(0.5, 0.5, 0.3, '#1d1d1d', cam); r.rotation.x = Math.PI / 2; r.position.set(x, 0.5, z); }

  // ---------- ônibus ----------
  const BL = 11, onibus = T.grupo(null, -70, 0, -2.7);
  const FR = 1.7; // cabine da frente aberta (motorista visível pelo para-brisa e pela porta)
  const corpoB = T.caixa(BL - FR, 2.6, 2.5, '#f0b23a', onibus); corpoB.position.set(-FR / 2, 1.75, 0);
  const faixa = T.caixa(BL - FR + 0.02, 0.25, 2.52, '#2f5fa8', onibus, { sem: true }); faixa.position.set(-FR / 2, 1.0, 0);
  for (let k = 0; k < 5; k++) { const j = T.caixa(1.35, 0.95, 2.54, '#1f2a36', onibus, { sem: true }); j.position.set(-4.4 + k * 1.6, 2.35, 0); }
  const fx = BL / 2 - FR / 2;
  const interior = T.caixa(0.03, 2.4, 2.4, '#5a5048', onibus, { sem: true }); interior.position.set(BL / 2 - FR + 0.02, 1.75, 0);
  const pisoB = T.caixa(FR, 0.1, 2.5, '#444', onibus); pisoB.position.set(fx, 0.5, 0);
  const tetoB = T.caixa(FR, 0.35, 2.5, '#f0b23a', onibus); tetoB.position.set(fx, 2.88, 0);
  const ladoL = T.caixa(FR, 2.6, 0.05, '#f0b23a', onibus); ladoL.position.set(fx, 1.75, -1.25);
  const pilar = T.caixa(0.5, 2.6, 0.05, '#f0b23a', onibus); pilar.position.set(BL / 2 - 0.25, 1.75, 1.25);
  const frenteB = T.caixa(0.06, 0.95, 2.5, '#f0b23a', onibus); frenteB.position.set(BL / 2, 0.95, 0);
  const faixaF = T.caixa(0.08, 0.25, 2.52, '#2f5fa8', onibus, { sem: true }); faixaF.position.set(BL / 2, 1.0, 0);
  const parabrisa = T.caixa(0.03, 1.25, 2.4, T.mat('#a8cfe2', { transparent: true, opacity: 0.28 }), onibus, { sem: true }); parabrisa.position.set(BL / 2, 2.05, 0);
  const painel = T.caixa(0.5, 0.35, 2.3, '#2b2b2e', onibus); painel.position.set(BL / 2 - 0.3, 1.25, 0);
  const volante = T.m(new THREE.TorusGeometry(0.2, 0.025, 10, 28), '#1a1a1a', onibus); volante.position.set(BL / 2 - 0.45, 1.45, -0.6); volante.rotation.y = Math.PI / 2; volante.rotation.x = 0.5;
  const letreiro = T.tela(1.6, 0.32, 256, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffb02e'; c.font = 'bold 40px monospace'; c.textAlign = 'center'; c.fillText('7  CENTRO', w / 2, 38); }, onibus);
  letreiro.rotation.y = Math.PI / 2; letreiro.position.set(BL / 2 + 0.07, 2.86, 0);
  const farois = [];
  for (const z of [-0.85, 0.85]) { const f = T.esfera(0.16, T.basico('#fff6c8'), onibus); f.position.set(BL / 2 + 0.02, 0.85, z); f.scale.x = 0.4; farois.push(f); }
  const luzF = new THREE.SpotLight(0xfff2c0, 0, 30, 0.6, 0.5); luzF.position.set(BL / 2, 1, 0); onibus.add(luzF); onibus.add(luzF.target); luzF.target.position.set(BL / 2 + 10, 0, 0);
  for (const x of [-3.5, 3.4]) for (const z of [-1.2, 1.2]) { const r = T.cilindro(0.5, 0.5, 0.3, '#1d1d1d', onibus); r.rotation.x = Math.PI / 2; r.position.set(x, 0.5, z); }
  // porta da frente (lado da calçada, +z): vão iluminado + 2 folhas que abrem
  const DXb = BL / 2 - 1.05;
    const folhas = [];
  for (const s of [-1, 1]) { const f = T.caixa(0.5, 2.1, 0.05, T.mat('#3a5068', { transparent: true, opacity: 0.6 }), onibus, { sem: true }); f.position.set(DXb + s * 0.25, 1.55, 1.3); folhas.push([f, s]); }
  const degrau = T.caixa(1.0, 0.3, 0.4, '#555', onibus); degrau.position.set(DXb, 0.35, 1.1);
  mot.g.position.set(BL / 2 - 0.95, 0.3, -0.6); onibus.add(mot.g); mot.g.rotation.y = Math.PI / 2 + 0.9;
  mot2.g.position.copy(mot.g.position); onibus.add(mot2.g); mot2.g.rotation.y = mot.g.rotation.y;
  // luz interna fria do ônibus (aparece na volta, vazio por dentro)
  const luzIn = new THREE.PointLight(0xbfe8ff, 0, 9); luzIn.position.set(BL / 2 - 1.2, 2.4, 0); onibus.add(luzIn);

  // ---------- chuva ----------
  const NG = 700, gotaG = new THREE.BoxGeometry(0.012, 0.35, 0.012), gotaM = T.basico('#cfdbe8', { transparent: true, opacity: 0.7 });
  const chuva = new THREE.InstancedMesh(gotaG, gotaM, NG); T.cena.add(chuva); chuva.visible = false;
  const semente = Array.from({ length: NG }, (_, k) => [((k * 7919) % 1000) / 1000, ((k * 104729) % 1000) / 1000, ((k * 1299709) % 1000) / 1000]);
  const mtx = new THREE.Matrix4();

  // ---------- POV em pé, onde a parte 1 terminou ----------
  const CX = 0.15, CZ = 1.0;
  const V = T.pov({ x: CX, y: 1.62, z: CZ, empe: true });
  const olha = (px, pz) => Math.atan2(-(px - CX), -(pz - CZ));
  const X0 = 0.15 - 2.2 - BL / 2;
  const AMIGO = { nome: 'AMIGO', cor: '#e2783a', pele: '#c98e66' };
  const M1 = ['mano cadê tu? o ônibus', 'tá andando e não tem mais', 'ninguém aqui dentro'];
  const M2 = ['ele não para em', 'ponto nenhum'];
  const ceuNoite = new THREE.Color('#4a525c');
  const fim = (k) => E(k) + EV[k].d;

  sombra.g.visible = false; celS.visible = false; cam.visible = false; // o sósia e o caminhão ficaram na parte 1
  T.cada((t) => {
    // ---- ônibus: parado, vai embora, volta ----
    const uSai = T.clamp((t - E('PARTE')) / 4.0), uVolta = T.clamp((t - E('FAROL')) / 6.0);
    if (t < E('FAROL')) onibus.position.x = X0 + 80 * Math.pow(uSai, 2.2);
    else onibus.position.x = T.lerp(-70, X0, 1 - Math.pow(1 - uVolta, 2.2));
    onibus.visible = t < E('PARTE') + 4 || t > E('FAROL');
    luzF.intensity = onibus.visible ? (t > E('FAROL') ? 30 : 18) : 0;
    farois.forEach((f) => f.scale.setScalar(t > E('FAROL') ? 1.25 : 1).multiply(new V3(0.4, 1, 1)));
    const abre = (1 - T.janela(t, E('FECHA'), E('FECHA') + 0.6)) + T.janela(t, E('CHEGA') + 3.6, E('CHEGA') + 4.2) * (t > E('FAROL') ? 1 : 0);
    folhas.forEach(([f, s]) => { f.position.x = DXb + s * (0.25 + 0.27 * abre); f.position.z = 1.3 + 0.08 * abre; });
    // luz de dentro: na volta, fria e piscando, ônibus vazio
    const pis = t > E('CHEGA') + 3.6 ? (Math.sin(t * 23) > 0.6 && Math.sin(t * 5.3) > 0 ? 0.25 : 1) : 1;
    luzIn.intensity = t > E('FAROL') ? 3.2 * pis : 0;
    // motoristas: o de antes some com o ônibus; na volta é ele (com a tua cara)
    mot.g.visible = t < E('FAROL'); mot2.g.visible = t >= E('FAROL');
    mot.piscaAuto(t, 2.1); mot.cenho(0.5);
    mot.mao('E', [0.2, 0.95, 0.35], [1, -0.5, 0]); mot.mao('D', [-0.2, 0.95, 0.35], [-1, -0.5, 0]);
    const ro = T.janela(t, E('ROSTO'), E('ROSTO') + 1.3);
    const mx = onibus.position.x + BL / 2 - 0.95, mz = onibus.position.z - 0.6;
    mot2.g.rotation.y = T.lerp(Math.PI / 2 + 0.9, Math.atan2(CX - mx, CZ - mz), T.suave(ro));
    if (t < E('ROSTO') + 0.6) mot2.piscaAuto(t, 0.7); else mot2.pisca(0);
    mot2.cenho(0.3 + 0.2 * ro); mot2.olhar(0, 0.1 * ro);
    mot2.boca(Math.max(T.boca('g1', E('g1'), t) * 1.3, 0.12 * ro));
    mot2.cabeca.rotation.set(0.04 * ro, 0, -0.08 * ro);
    mot2.mao('E', [0.2, 0.95, 0.35], [1, -0.5, 0]); mot2.mao('D', [-0.2, 0.95, 0.35], [-1, -0.5, 0]);
    // ---- amigo: no degrau da porta, olha pra ti, sobe ----
    const vai = T.janela(t, fim('f1') - 0.3, E('FECHA') + 0.2);
    const pX = onibus.position.x + DXb, pZ = onibus.position.z + 1.6;
    const ax = pX, az = T.lerp(pZ, pZ - 1.0, vai);
    amigo.g.position.set(ax, 0.28, az);
    amigo.g.visible = vai < 0.95 && t < E('PARTE');
    amigo.g.rotation.y = T.lerp(Math.atan2(CX - ax, CZ - az), Math.atan2(0, -1), T.suave(T.clamp(vai * 2)));
    amigo.anda(t * 1.6, 0.35 * Math.sin(Math.PI * vai));
    amigo.piscaAuto(t, 1.3);
    const fA = T.boca('f1', E('f1'), t); amigo.boca(fA * 1.4);
    amigo.cenho(t > E('f0') ? 0.35 : 0);
    amigo.cabeca.rotation.set(0.04 * fA, Math.sin(t * 6) * 0.12 * T.janela(t, E('f1'), E('f1') + 0.3) * (1 - T.janela(t, E('f1') + 1.2, E('f1') + 1.5)), 0);
    amigo.mao('E', [0.16, 1.0, 0.12], [1, -0.4, -0.5]);
    const ab = T.janela(t, E('f1') - 0.1, E('f1') + 0.3) * (1 - T.janela(t, E('f1') + 1.4, E('f1') + 1.8)); // abre o braço: "tu é doido"
    amigo.mao('D', [T.lerp(-0.16, -0.42, ab), T.lerp(1.0, 1.22, ab), T.lerp(0.12, 0.25, ab)], [-1, -0.5, -0.4]);
    // ---- clima: chove, para de repente, escurece ----
    const esc = T.janela(t, E('PARA'), E('FAROL') + 2);
    T.cena.background.copy(ceuTemp).lerp(ceuNoite, esc);
    nuvMats.forEach((m) => m.color.set('#7d858e'));
    hemi.intensity = 1.05 - 0.4 * esc; T.sol.intensity = 0.7 - 0.4 * esc;
    const chove = 1 - T.janela(t, E('PARA'), E('PARA') + 0.25);
    const cz = CZ + 0.3 * T.janela(t, E('f0'), E('f0') + 0.6); // passo pra trás
    chuva.visible = chove > 0.01; gotaM.opacity = 0.7 * chove;
    if (chuva.visible) for (let k = 0; k < NG; k++) {
      const [a, b, c] = semente[k]; const y = 8 - ((t * 11 + b * 8) % 8);
      mtx.makeTranslation(CX - 10 + a * 20, y, cz - 12 + c * 16); chuva.setMatrixAt(k, mtx);
    }
    chuva.instanceMatrix.needsUpdate = true;
    pocas.forEach((p) => { p.material.opacity = 0.75; });
    V.corpo.position.set(CX, 1.62, cz);
    // ---- cabeça (câmera) ----
    const yDoor = olha(X0 + DXb, -1.1), yCab = olha(X0 + BL / 2 - 0.95, -3.3), yRua = olha(CX, -6);
    const yL = olha(-20, -3), yR = olha(20, -3);
    let yaw = T.chaves([[0, yDoor], [E('PARTE'), yDoor], [E('PARTE') + 4, yR], [E('SOZINHO') + 0.2, yR], [E('SOZINHO') + 1.2, yL + 0.2], [E('SOZINHO') + 2.2, yRua],
      [E('PARA'), yRua], [E('OLHA') + 0.9, yL], [E('OLHA') + 2.1, yR], [E('f4') + 0.6, yRua], [E('FAROL') + 0.4, yRua], [E('FAROL') + 1.5, yL + 0.1], [DUR, yL]], t);
    if (t > E('PARTE') && t < E('PARTE') + 4) yaw = T.lerp(yDoor, Math.max(yR, olha(Math.min(onibus.position.x + BL / 2, 30), -2.7)), T.suave(T.clamp((t - E('PARTE')) / 0.8)));
    if (t > E('FAROL') + 1.5) { const yb = olha(onibus.position.x + BL / 2 - 0.5, -2.7); yaw = T.lerp(yaw, yb, T.janela(t, E('FAROL') + 1.5, E('FAROL') + 2.5)); }
    yaw = T.lerp(yaw, yCab, T.suave(T.janela(t, E('CHEGA') + 3.4, E('ROSTO') + 0.6)));
    const pitch = T.chaves([[0, -0.48], [E('INI') + 0.3, -0.48], [E('INI') + 1.0, -0.02], [E('LIGA') - 0.2, -0.04], [E('LIGA') + 0.4, -0.5], [E('HORA') + 2.0, -0.5],
      [E('PARA') + 0.6, 0.06], [E('MSG1') + 0.2, 0.0], [E('MSG1') + 0.8, -0.5], [E('CAI') + 0.9, -0.5], [E('FAROL') + 0.5, 0.0], [E('ROSTO'), 0.02], [DUR, 0.05]], t)
      + Math.sin(t * 1.5) * 0.008 + (t > E('PARA') ? Math.sin(t * 0.7) * 0.006 : 0);
    const enc = T.janela(t, E('ROSTO'), E('ROSTO') + 1.8) + 0.12 * T.janela(t, E('g1'), DUR);
    const enc2 = 0.25 * T.janela(t, E('f5'), fim('f5')) * (1 - T.janela(t, fim('f6'), fim('f6') + 0.4)); // aperta no sussurro
    T.cam.fov = 104 - enc * 56 - enc2 * 20; T.fisheye.k.value = 0.42 * (1 - Math.min(1, enc) * 0.6); T.cam.updateProjectionMatrix();
    const treme = t > E('ROSTO') + 1.8 ? 0.004 * Math.sin(t * 37) : 0;
    V.olhar(yaw + treme, pitch, 0);
    // ---- celular ----
    const sobe = T.chaves([[0, 1], [E('INI') + 0.3, 1], [E('INI') + 1.0, 0], [E('LIGA') - 0.3, 0], [E('LIGA') + 0.4, 1], [E('HORA') + 2.0, 1], [E('PARA') + 0.4, 0],
      [E('MSG1') + 0.1, 0], [E('MSG1') + 0.7, 1], [E('CAI') + 1.0, 1], [E('FAROL') + 0.4, 0], [DUR, 0]], t);
    const tap = E('LIGAAMIGO') + 0.9;
    const vibra = t < E('PARTE') + 1 || (t > E('MSG1') && t < E('MSG1') + 0.7) || (t > E('MSG2') && t < E('MSG2') + 0.7) || (t > E('LIGAAMIGO') && t < tap);
    const vib = vibra ? 0.0025 * Math.sin(t * 160) : 0;
    V.cel.position.set(T.lerp(0.05, 0, sobe) + vib, T.lerp(-0.75, -0.19, sobe), T.lerp(-0.2, -0.27, sobe));
    V.cel.rotation.set(T.lerp(-0.9, -0.42, sobe), T.lerp(0.3, 0.02, sobe), T.lerp(0.4, -0.04, sobe));
    V.cel.visible = sobe > 0.001; V.bE.ombro.visible = V.cel.visible;
    if (t < E('PARTE') + 1) V.celTela('tocando', t, { hora: '7:00' });
    else if (t < E('LIGA')) V.celTela('apagada', 0);
    else if (t < E('g0')) V.celTela('ligando', 0, { ...AMIGO, hora: '7:04' });
    else if (t < fim('g0') + 0.2) V.celTela('chamada', t - E('g0'), { ...AMIGO, hora: '7:04' });
    else if (t < E('HORA')) V.celTela('encerrada', 0, { ...AMIGO, hora: '7:04' });
    else if (t < E('MSG1')) V.celTela('hora', 0, { hora: '7:20' });
    else if (t < E('MSG2')) V.celTela('msgs', 0, { ...AMIGO, hora: '7:21', msgs: [M1] });
    else if (t < E('LIGAAMIGO')) V.celTela('msgs', 0, { ...AMIGO, hora: '7:21', msgs: [M1, M2] });
    else if (t < tap) V.celTela('tocando', t, { ...AMIGO, hora: '7:22' });
    else if (t < E('CAI')) V.celTela('chamada', t - tap, { ...AMIGO, hora: '7:22' });
    else V.celTela('encerrada', 0, { ...AMIGO, hora: '7:22' });
    const ud = T.janela(t, E('LIGAAMIGO') + 0.3, tap - 0.1) * (1 - T.janela(t, tap + 0.2, tap + 0.6));
    V.dedo(ud, V.botaoVerde, T.janela(t, tap - 0.15, tap));
    V.bracos();
  });
  return { dur: DUR };
};
