// Parte 1, cena da RUA / PARADA DE ÔNIBUS (3D desenho). Tempos de dados_rua.json (tl.py).
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

  // ---------- chuva ----------
  const NG = 700, gotaG = new THREE.BoxGeometry(0.012, 0.35, 0.012), gotaM = T.basico('#cfdbe8', { transparent: true, opacity: 0.7 });
  const chuva = new THREE.InstancedMesh(gotaG, gotaM, NG); T.cena.add(chuva); chuva.visible = false;
  const semente = Array.from({ length: NG }, (_, k) => [((k * 7919) % 1000) / 1000, ((k * 104729) % 1000) / 1000, ((k * 1299709) % 1000) / 1000]);
  const mtx = new THREE.Matrix4();

  // ---------- POV em pé ----------
  const V = T.pov({ x: -7, y: 1.62, z: 1.0, empe: true });
  const olha = (px, pz, cx, cz) => Math.atan2(-(px - cx), -(pz - cz));
  const tel = (k, f = 0) => t0 => t0 > E(k) && t0 < E(k) + EV[k].d + f;

  T.cada((t) => {
    // ---- caminhada até o ponto ----
    const u = T.janela(t, 0, E('ANDA') + 3.0);
    const cx = T.lerp(-7, 0.15, u), cz = 1.0;
    const passo = u > 0 && u < 1 ? Math.sin(t * 9.5) : 0;
    V.corpo.position.set(cx, 1.62 + Math.abs(passo) * 0.025, cz);
    // ---- clima ----
    const temp = T.janela(t, E('HORA') - 2, E('TROVAO'));
    T.cena.background.copy(fundoCeu).lerp(ceuTemp, temp);
    nuvMats.forEach((m) => m.color.set(temp > 0.5 ? '#7d858e' : '#e2e6ea'));
    const ft = t - E('TROVAO'); const flash = ft > 0 && ft < 0.4 ? (ft < 0.07 || (ft > 0.16 && ft < 0.22) ? 1 : 0.2) : 0;
    hemi.intensity = 1.55 - 0.5 * temp + 2.2 * flash; T.sol.intensity = 1.5 - 0.8 * temp + 2 * flash;
    if (flash > 0.5) T.cena.background.set('#e8eef4');
    const chove = T.janela(t, E('TROVAO') + 0.2, E('TROVAO') + 1.2);
    chuva.visible = chove > 0.01; gotaM.opacity = 0.7 * chove;
    if (chuva.visible) for (let k = 0; k < NG; k++) {
      const [a, b, c] = semente[k]; const y = 8 - ((t * 11 + b * 8) % 8);
      mtx.makeTranslation(cx - 10 + a * 20, y, cz - 12 + c * 16); chuva.setMatrixAt(k, mtx);
    }
    chuva.instanceMatrix.needsUpdate = true;
    pocas.forEach((p) => { p.material.opacity = 0.75 * T.janela(t, E('TROVAO') + 1, E('TROVAO') + 5); });
    // ---- amigo ----
    amigo.piscaAuto(t, 1.3);
    const fA = Math.max(...['b0', 'e2', 'e3', 'b4', 'c1'].map((k) => T.boca(k, E(k), t)));
    amigo.boca(fA * 1.4);
    const ri = T.janela(t, E('e2') + 0.2, E('e2') + 0.6) * (1 - T.janela(t, E('e2') + EV.e2.d, E('e2') + EV.e2.d + 0.6));
    const entra = T.janela(t, E('c1') + 0.4, E('c1') + 2.4); // vai até a porta do ônibus e some
    const porta = new V3(onibus.position.x + DXb, 0.13, onibus.position.z + 1.6);
    const ax = T.lerp(AX, porta.x, entra), az = T.lerp(AZ, porta.z, entra);
    amigo.g.position.set(ax, 0.13 + entra * 0.15, az);
    amigo.anda(t * 1.6, 0.4 * Math.sin(Math.PI * entra));
    const olhaAmigo = entra > 0 ? Math.atan2(porta.x - AX, porta.z - AZ) : Math.atan2(cx - ax, cz - az);
    const viraOnibus = T.janela(t, E('b4') - 0.3, E('b4') + 0.2) * (1 - T.janela(t, E('c1') - 0.4, E('c1')));
    amigo.g.rotation.y = T.lerp(olhaAmigo, Math.atan2(-1, -0.4), viraOnibus);
    amigo.g.visible = entra < 0.98;
    amigo.cenho(t > E('e3') - 0.3 && t < E('e4') + 1 ? -0.4 : 0.1);
    amigo.cabeca.rotation.set(-0.25 * ri + 0.04 * fA, 0, Math.sin(t * 1.1) * 0.04);
    // braços do amigo: mãos nas alças da mochila; aponta pro ônibus no b4
    const aponta = T.janela(t, E('b4') - 0.1, E('b4') + 0.3) * (1 - T.janela(t, E('c0'), E('c0') + 0.5));
    amigo.mao('E', [0.16, 1.0, 0.12], [1, -0.4, -0.5]);
    amigo.mao('D', [T.lerp(-0.16, -0.45, aponta), T.lerp(1.0, 1.4, aponta), T.lerp(0.12, 0.35, aponta)], [-1, -0.5, -0.4]);
    // ---- figura de capuz do outro lado (some quando o caminhão passa) ----
    const camT = (t - (E('CAMINHAO') - 0.6)) / 2.0; // 0..1 durante a passagem
    cam.position.x = T.lerp(-40, 40, T.clamp(camT)); cam.visible = camT > 0 && camT < 1;
    sombra.g.visible = t < E('CAMINHAO') + 0.25; celS.visible = sombra.g.visible;
    sombra.g.rotation.y = Math.atan2(cx - 2.3, cz + 8.7);
    sombra.mao('D', [-0.12, 1.5, 0.08], [-1, -0.6, 0.2]); sombra.solto('E', 0.05);
    sombra.g.updateMatrixWorld(true);
    const mS = sombra.br.D.mao.getWorldPosition(new V3()); celS.position.copy(mS); celS.rotation.y = sombra.g.rotation.y; celS.position.y += 0.03;
    // ---- ônibus ----
    const bu = T.janela(t, E('ONIBUS') - 1.2, E('ONIBUS') + 3.4);
    onibus.position.x = T.lerp(-70, 0.15 - 2.2 - BL / 2, 1 - Math.pow(1 - T.clamp((t - (E('ONIBUS') - 1.2)) / 4.6), 2.2));
    onibus.visible = t > E('ONIBUS') - 1.3;
    luzF.intensity = onibus.visible ? 18 : 0;
    const abre = T.janela(t, E('ONIBUS') + 3.4, E('ONIBUS') + 4.0);
    folhas.forEach(([f, s]) => { f.position.x = DXb + s * (0.25 + 0.27 * abre); f.position.z = 1.3 + 0.08 * abre; });
    mot.piscaAuto(t, 2.1); mot.boca(T.boca('c0', E('c0'), t) * 1.4); mot.cenho(0.5);
    mot.mao('E', [0.2, 0.95, 0.35], [1, -0.5, 0]); mot.mao('D', [-0.2, 0.95, 0.35], [-1, -0.5, 0]);
    // ---- cabeça (câmera) ----
    const yA = olha(AX, AZ, cx, cz), yRua = olha(cx + 0.5, -6, cx, cz), yS = olha(2.3, -8.7, cx, cz);
    const yB = olha(onibus.position.x + BL / 2 - 0.9, -2.4, cx, cz), yLonge = olha(-14, -2, cx, cz);
    const yaw = T.chaves([[0, -Math.PI / 2], [E('ANDA') + 2.2, -Math.PI / 2], [E('ANDA') + 3.2, yA + 0.15], [E('VIBRA') + 0.2, yA + 0.15], [E('LE'), yA + 0.35],
      [E('VIRA'), yA + 0.35], [E('VIRA') + 1.1, yS], [E('CAMINHAO') + 1.3, yS], [E('e3') + 0.2, yA + 0.1], [E('HORA'), yA + 0.3], [E('TROVAO'), yRua],
      [E('b4') - 0.2, yRua], [E('b4') + 0.8, yLonge], [E('ONIBUS') + 1.0, yLonge], [E('ONIBUS') + 3.5, yB], [E('c1') + 0.6, yB], [E('c1') + 2.0, yB + 0.25], [E('TOCA') + 0.5, yB + 0.15], [DUR, yB + 0.12]], t);
    const pitch = T.chaves([[0, -0.05], [E('ANDA') + 3.2, -0.04], [E('VIBRA') + 0.2, -0.04], [E('LE'), -0.55], [E('VIRA'), -0.55], [E('VIRA') + 1.1, -0.06],
      [E('CAMINHAO') + 1.3, -0.06], [E('e3') + 0.2, -0.03], [E('HORA'), -0.55], [E('TROVAO'), 0.05], [E('b4') - 0.2, 0.0], [E('ONIBUS') + 3.5, 0.02],
      [E('TOCA') + 0.6, -0.5], [DUR, -0.52]], t) + Math.sin(t * 1.5) * 0.008;
    const enc = T.janela(t, E('VIRA') + 1.0, E('CAMINHAO') - 0.2) * (1 - T.janela(t, E('CAMINHAO') + 0.6, E('CAMINHAO') + 1.4)); // "zoom" de tensão encarando
    T.cam.fov = 104 - enc * 58; T.fisheye.k.value = 0.42 * (1 - enc * 0.6); T.cam.updateProjectionMatrix();
    V.olhar(yaw + passo * 0.01, pitch + Math.abs(passo) * 0.01, passo * 0.012);
    // ---- celular: mensagem, hora, toca de novo ----
    const upMsg = T.janela(t, E('VIBRA') + 0.1, E('LE')) * (1 - T.janela(t, E('VIRA'), E('VIRA') + 0.6));
    const upHora = T.janela(t, E('HORA') - 0.3, E('HORA') + 0.4) * (1 - T.janela(t, E('TROVAO'), E('TROVAO') + 0.5));
    const upToca = T.janela(t, E('TOCA') - 0.1, E('TOCA') + 0.7);
    const sobe = Math.max(upMsg, upHora, upToca);
    const vib = (t > E('VIBRA') && t < E('VIBRA') + 0.8) || t > E('TOCA') ? 0.0025 * Math.sin(t * 160) : 0;
    const perto = T.janela(t, E('TOCA') + 0.7, DUR) * 0.06;
    V.cel.position.set(T.lerp(0.05, 0, sobe) + vib, T.lerp(-0.75, -0.19 + 0.02 * upMsg, sobe), T.lerp(-0.2, -0.27 + perto + 0.04 * upMsg, sobe));
    V.cel.rotation.set(T.lerp(-0.9, -0.42, sobe), T.lerp(0.3, 0.02, sobe), T.lerp(0.4, -0.04, sobe));
    V.cel.visible = sobe > 0.001; V.bE.ombro.visible = V.cel.visible;
    if (upToca > 0) V.celTela('tocando', t); else if (upHora > 0) V.celTela('hora', 0); else V.celTela('msg', 0);
    V.dedo(0, V.botaoVerde, 0);
    V.bracos();
  });
  return { dur: DUR };
};
