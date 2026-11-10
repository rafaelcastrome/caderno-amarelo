// Episódio 3 (caminho SUBIR): dentro do ônibus 7 rodando na mesma rua. Tempos de dados_ep3.json (tl_ep3.py).
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
  cx(9.45, 0.75, 0.06, corParede, -0.775, 0.93, 1.25); cx(0.55, 0.75, 0.06, corParede, 5.225, 0.93, 1.25); cx(11, 0.5, 0.06, corParede, 0, 2.77, 1.25);
  for (let x = -5.45; x <= 4.0; x += 1.6) for (const z of [-1.25, 1.25]) cx(0.14, 1.2, 0.08, corParede, x, 1.9, z);
  cx(0.14, 1.2, 0.08, corParede, 3.95, 1.9, 1.25); cx(0.14, 1.2, 0.08, corParede, 4.95, 1.9, 1.25); cx(0.14, 1.2, 0.08, corParede, 5.45, 1.9, -1.25);
  const vidro = T.mat('#a8cfe2', { transparent: true, opacity: 0.12 });
  cx(11, 1.2, 0.02, vidro, 0, 1.9, -1.22, { sem: true }); cx(9.45, 1.2, 0.02, vidro, -0.775, 1.9, 1.22, { sem: true });
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
  for (let k = 0; k <= 8; k++) { const x = -4.1 + k * 0.85; assento(x, -0.8); if (x < 3.5) assento(x, 0.8); }
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

  // ---------- movimento do ônibus (anda, dá voltas na mesma rua, para no ponto) ----------
  const XEND = PX + 3.3, VMAX = 3.2, LOOP = 51;
  const vel = (t) => VMAX * T.suave(T.janela(t, E('ANDA'), E('ANDA') + 2.5)) * (1 - T.suave(T.janela(t, E('PARA') - 3.2, E('PARA'))));
  const DT = 0.01, tab = [0];
  for (let k = 1; k <= Math.ceil((DUR + 1) / DT); k++) tab.push(tab[k - 1] + vel(k * DT) * DT);
  const sAt = (t) => tab[Math.min(tab.length - 1, Math.max(0, Math.round(t / DT)))];
  const VOLTAS = [E('MSG') + 1.6, E('HORA') + 0.3, E('ATRAS') + 0.9];
  const X0 = XEND - sAt(E('PARA')) + LOOP * VOLTAS.length;
  const bxAt = (t) => X0 + sAt(t) - LOOP * VOLTAS.filter((w) => t >= w).length;
  console.error('bx', [0, ...VOLTAS.map((w) => w - 0.01), ...VOLTAS, E('PARA')].map((t) => bxAt(t).toFixed(1)).join(' '));

  // ---------- POV ----------
  const V = T.pov({ x: 0, y: 2.15, z: 0, empe: true });
  const F2 = Math.PI * 1.5, FRENTE = -Math.PI / 2, TRAS = Math.PI / 2, DIR = Math.PI, DIR2 = -Math.PI;
  const MSGEU = [['não olha pro', 'motorista.']];
  const camLocal = (t) => {
    const x = T.chaves([[0, 4.45], [E('SOBE'), 4.45], [E('SOBE') + 1.3, 3.5], [E('PROCURA'), 3.4], [E('PROCURA') + 1.8, 1.7], [E('BONE'), 1.65], [E('ATRAS'), 1.6], [E('ATRAS') + 1.6, -1.2], [E('LEVANTA'), -3.2], [DUR, -3.3]], t);
    const z = T.chaves([[0, 0.95], [E('SOBE'), 0.95], [E('SOBE') + 1.3, 0.05], [DUR, 0.05]], t);
    const y = T.chaves([[0, 1.85], [E('SOBE'), 1.85], [E('SOBE') + 1.0, 2.15], [DUR, 2.15]], t);
    return [x, y, z];
  };
  // posição da mulher pra cada passagem: fixa no mundo, bem na janela da direita no meio da janela de tempo
  const passagens = ['JANELA1', 'JANELA2', 'JANELA3'].map((k) => { const tm = E(k) + 1.6; return { de: E(k) - 3, ate: E(k) + 4.5, x: bxAt(tm) + camLocal(tm)[0] }; });

  T.cada((t) => {
    const bx = bxAt(t); ib.position.x = bx;
    const [lx, ly, lz] = camLocal(t);
    const v = vel(t), acel = (vel(t + 0.05) - vel(t - 0.05)) / 0.1;
    const sac = v > 0.1 ? Math.sin(t * 13) * 0.004 + Math.sin(t * 2.3) * 0.003 : 0;
    const passo = Math.abs(camLocal(t + 0.05)[0] - lx) > 0.003 ? Math.sin(t * 9) : 0;
    V.corpo.position.set(bx + lx, ly + sac + Math.abs(passo) * 0.02, -2.7 + lz);
    // luzes: tremem, apagam no "Escolhe" e quando para
    const pisca = (t > E('VIRA') && t < E('VIRA') + 1.2) || (t > E('PARA') - 0.4 && t < E('PARA') + 1.2) ? (Math.sin(t * 31) * Math.sin(t * 7.7) > 0.1 ? 0.15 : 1) : (Math.sin(t * 17) * Math.sin(t * 3.1) > 0.97 ? 0.4 : 1);
    luzes.forEach((l) => l.intensity = 5 * pisca); fitas.forEach((f) => f.material.color.set(pisca > 0.5 ? '#fff6d8' : '#6a665c'));
    // motorista: de costas dirigindo; no fim vira pra ti
    const vi = T.suave(T.janela(t, E('VIRA') + 0.2, E('VIRA') + 1.4));
    mot.g.rotation.y = T.lerp(Math.PI / 2, Math.atan2(lx - 4.55, lz + 0.6), vi);
    if (!(t > E('VIRA') + 0.55 && t < E('PARA') + 0.9)) { mot.mao('E', [0.2, 0.95, 0.35], [1, -0.5, 0]); mot.mao('D', [-0.2, 0.95, 0.35], [-1, -0.5, 0]); }
    if (vi < 0.5) mot.piscaAuto(t, 0.7); else mot.pisca(0);
    mot.cenho(0.4); mot.olhar(0, 0.1 * vi);
    mot.boca(Math.max(T.boca('b0', E('b0'), t), T.boca('b1', E('b1'), t), T.boca('b3', E('b3'), t)) * 1.3 + 0.1 * vi);
    mot.cabeca.rotation.set(0, t < E('ANDA') ? 0.5 : 0, 0); // no começo olha pra porta
    // depois que a luz pisca, ele está EM PÉ no corredor, olhando pra ti (e o ônibus segue andando sozinho)
    const empe = t > E('VIRA') + 0.55 && t < E('PARA') + 0.9;
    mot.pernas.forEach((q) => q.visible = empe);
    if (empe) { mot.g.position.set(3.0, PISO, 0); mot.g.rotation.y = -Math.PI / 2; mot.solto('E', 0.06); mot.solto('D', 0.06); mot.cabeca.rotation.set(0.05, 0, -0.07); mot.olhar(0, 0); }
    else mot.g.position.set(4.55, 0.3, -0.6);
    mot.g.visible = !(t > E('PARA') + 0.9 && t < E('PARA') + 0.9 + 99) || true;
    // amigo: só aparece no fundo quando sussurra; cabeça baixa, levanta pra falar, olha pro motorista
    amigo.g.visible = t > E('SUSSURRO') - 0.1;
    const lev = T.suave(T.janela(t, E('LEVANTA'), E('LEVANTA') + 0.8));
    amigo.cabeca.rotation.set(T.lerp(0.6, 0.0, lev), 0, 0);
    amigo.boca(Math.max(T.boca('a6', E('a6'), t), T.boca('a8', E('a8'), t), T.boca('b2', E('b2'), t)) * 1.2);
    amigo.piscaAuto(t, 2.2); amigo.cenho(-0.5 * lev);
    amigo.olhar(T.janela(t, E('b2'), E('b2') + 0.4) * 0, T.janela(t, E('b2'), E('b2') + 0.4) * 0.6);
    amigo.mao('E', [0.12, 0.8, 0.32], [1, -0.5, -0.3]); amigo.mao('D', [-0.12, 0.8, 0.32], [-1, -0.5, -0.3]);
    // mulher acenando
    const p = passagens.find((q) => t > q.de && t < q.ate);
    mulher.g.visible = !!p; if (p) mulher.g.position.set(p.x, 0.13, 4.2);
    mulher.mao('D', [-0.32, 1.55 + 0.04 * Math.sin(t * 7), 0.12 + 0.05 * Math.sin(t * 7)], [-1, -0.3, 0]); mulher.solto('E', 0.08);
    mulher.piscaAuto(t, 0.4); mulher.boca(0.05);
    // tu e amigo no ponto, no fim
    const ve = t > E('PARA') - 0.5; euP.g.visible = ve; amP.g.visible = ve; celP.visible = ve;
    euP.g.rotation.y = Math.PI * 0.85; amP.g.rotation.y = Math.atan2(1.95 - 1.25, 2.25 - 1.9);
    euP.mao('D', [-0.08, 1.15, 0.28], [-1, -0.6, 0.2]); euP.solto('E', 0.06); euP.cabeca.rotation.x = 0.35; euP.piscaAuto(t, 1.1);
    amP.solto('E', 0.08); amP.solto('D', 0.08); amP.piscaAuto(t, 2);
    euP.g.updateMatrixWorld(true); celP.position.copy(euP.br.D.mao.getWorldPosition(new V3())); celP.rotation.set(-0.9, euP.g.rotation.y, 0);
    // ---- câmera ----
    const yMot = Math.atan2(-(4.55 - lx), -(-0.6 - lz)), yBone = Math.atan2(-(1.05 - lx), -(0.8 - lz)), yAm = Math.atan2(-(-4.95 - lx), -(0 - lz));
    const yaw = T.chaves([[0, yMot], [E('SOBE'), yMot], [E('SOBE') + 1.2, TRAS], [E('PROCURA') + 0.4, TRAS + 0.5], [E('PROCURA') + 1.2, TRAS - 0.5], [E('a1') + 0.6, TRAS],
      [E('BONE'), yBone], [E('ANDA') - 0.2, yBone], [E('ANDA') + 0.6, F2 + 0.1], [E('MSG') + 0.2, F2 + 0.1], [E('MSG') + 0.6, F2 + 0.3],
      [E('JANELA1'), F2 + 0.4], [E('JANELA1') + 0.8, DIR + 0.3], [E('JANELA1') + 2.6, DIR - 0.5], [E('JANELA2') - 0.6, F2 + 0.6], [E('JANELA2') + 0.4, DIR + 0.3],
      [E('JANELA2') + 3.0, DIR - 0.5], [E('JANELA3') - 0.8, F2 + 0.6], [E('JANELA3') + 0.3, DIR + 0.3], [E('a4') + 1.6, DIR - 0.5], [E('HORA'), DIR - 0.5],
      [E('SUSSURRO') + 0.3, DIR - 0.5], [E('SUSSURRO') + 1.3, yAm], [DUR, yAm]], t);
    let yawF = yaw;
    yawF = T.lerp(yawF, FRENTE - 2 * Math.PI * 0 , T.suave(T.janela(t, E('VIRA'), E('VIRA') + 0.9)) * (1 - T.suave(T.janela(t, E('PARA') + 0.6, E('PARA') + 1.6))));
    if (t > E('PARA') + 0.6) yawF = T.lerp(FRENTE, DIR2 + 0.15, T.suave(T.janela(t, E('PARA') + 0.6, E('PARA') + 1.8)));
    const pitch = T.chaves([[0, 0.0], [E('SOBE'), 0.0], [E('SOBE') + 1.2, -0.05], [E('BONE') - 0.3, -0.05], [E('BONE') + 0.5, -0.65], [E('ANDA') - 0.2, -0.6], [E('ANDA') + 0.5, -0.05],
      [E('MSG') + 0.1, -0.05], [E('MSG') + 0.6, -0.5], [E('JANELA1') - 0.1, -0.5], [E('JANELA1') + 0.6, -0.12], [E('HORA') - 0.2, -0.12], [E('HORA') + 0.4, -0.5],
      [E('SUSSURRO') + 0.2, -0.5], [E('SUSSURRO') + 1.0, -0.2], [E('VIRA'), -0.2], [E('VIRA') + 0.9, -0.08], [E('PARA') + 0.6, -0.08], [E('PARA') + 1.8, -0.1], [DUR, -0.1]], t)
      + Math.sin(t * 1.5) * 0.008;
    const roll = -acel * 0.012 + sac * 2;
    const zoomM = T.suave(T.janela(t, E('VIRA') + 1.0, E('b3') + 0.4)) * (1 - T.suave(T.janela(t, E('PARA') + 0.4, E('PARA') + 1.0)));
    const zoomV = T.suave(T.janela(t, E('VE') + 0.2, E('VE') + 2.5));
    const zoomA = 0.3 * T.janela(t, E('a8'), E('a8') + 2) * (1 - T.janela(t, E('VIRA') - 0.4, E('VIRA')));
    T.cam.fov = 104 - zoomM * 72 - zoomV * 40 - zoomA * 30; T.fisheye.k.value = 0.42 * (1 - 0.6 * Math.max(zoomM, zoomV)); T.cam.updateProjectionMatrix();
    V.olhar(yawF + passo * 0.01, pitch, roll);
    // ---- celular ----
    const sobe = T.chaves([[0, 0], [E('MSG') + 0.1, 0], [E('MSG') + 0.6, 1], [E('JANELA1') - 0.2, 1], [E('JANELA1') + 0.4, 0], [E('HORA') - 0.3, 0], [E('HORA') + 0.3, 1],
      [E('SUSSURRO') + 0.2, 1], [E('SUSSURRO') + 0.8, 0], [DUR, 0]], t);
    const vib = (t > E('MSG') && t < E('MSG') + 0.7) ? 0.0025 * Math.sin(t * 160) : 0;
    V.cel.position.set(T.lerp(0.05, 0, sobe) + vib, T.lerp(-0.75, -0.19, sobe), T.lerp(-0.2, -0.27, sobe));
    V.cel.rotation.set(T.lerp(-0.9, -0.42, sobe), T.lerp(0.3, 0.02, sobe), T.lerp(0.4, -0.04, sobe));
    V.cel.visible = sobe > 0.001; V.bE.ombro.visible = V.cel.visible;
    const HS = ['7:20', '7:14', '7:09', '7:03', '6:58', '6:55', '6:52'];
    if (t < E('HORA') - 0.5) V.celTela('msgs', 0, { nome: 'EU', hora: '7:20', msgs: MSGEU });
    else { const k = Math.min(HS.length - 1, Math.max(0, Math.floor((t - E('a5')) / 0.55))); V.celTela('hora', 0, { hora: HS[k] }); }
    V.dedo(0, V.botaoVerde, 0);
    V.bracos();
  });
  return { dur: DUR };
};
