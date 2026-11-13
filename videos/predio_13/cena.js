// O prédio sem 13º andar. Um vídeo só, 32 planos (um por fala). Tempos em dados.json (tl.py): ini[k] = início do plano k.
// Mundo (metros):
//   APÊ 12 em volta da origem (x -3..3, z -2.5..2.5), QUARTO em z = -12, APÊ 13 (igual, antigo) em x = 30, quarto escuro do 13 em x = 30, z = -12
//   ESCADA do 13 em x = -20 (patamar y = 0), CORREDOR do 12 em x = -20, y = -30, ELEVADOR em x = -40, FACHADA em z = -90
window.CENA = (T) => {
  const V3 = THREE.Vector3;
  const D = window.DADOS, INI = D.ini, DUR = D.dur;
  const hemi = T.cena.children.find((o) => o.isHemisphereLight);
  T.fisheye.k.value = 0.16; T.fisheye.vin.value = 0.5;
  const cx = (w, h, d, cor, x, y, z, pai, o) => { const m = T.caixa(w, h, d, cor, pai, o); m.position.set(x, y, z); return m; };
  const cil = (r1, r2, h, cor, x, y, z, pai, o) => { const m = T.cilindro(r1, r2, h, cor, pai, o); m.position.set(x, y, z); return m; };
  const esf = (r, cor, x, y, z, pai, o) => { const m = T.esfera(r, cor, pai, o); m.position.set(x, y, z); return m; };
  const FONTE = '"DejaVu Sans", sans-serif';

  // ============ desenhos em canvas ============
  // criança de palito (desenho infantil a lápis). modo: 'bebe' | 'mochila' | 'dorme' | 'bola' | 'acena' | 'bolo'
  const desenhoCrianca = (c, w, h, modo, seed) => {
    c.fillStyle = '#f6f1e3'; c.fillRect(0, 0, w, h);
    const r = (k) => { const x = Math.sin(seed * 91.7 + k * 12.9) * 43758.5; return x - Math.floor(x); };
    c.strokeStyle = '#2c2c2c'; c.lineWidth = w * 0.018; c.lineCap = 'round'; c.lineJoin = 'round';
    const L = (pts) => { c.beginPath(); pts.forEach(([x, y], i) => { const X = x * w + (r(i) - 0.5) * w * 0.01, Y = y * h; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.stroke(); };
    const O = (x, y, rr) => { c.beginPath(); c.ellipse(x * w, y * h, rr * w, rr * w * 1.05, 0, 0, 7); c.stroke(); };
    if (modo === 'dorme') { // menino dormindo sentado na escada
      for (let k = 0; k < 5; k++) L([[0.08, 0.92 - k * 0.12], [0.08 + 0.18 * (k + 1), 0.92 - k * 0.12], [0.08 + 0.18 * (k + 1), 0.8 - k * 0.12]]);
      O(0.42, 0.42, 0.08); L([[0.42, 0.5], [0.45, 0.68]]); L([[0.45, 0.68], [0.6, 0.7], [0.62, 0.8]]); L([[0.44, 0.56], [0.36, 0.66]]);
      c.fillStyle = '#2c2c2c'; c.font = `bold ${w * 0.08}px ${FONTE}`; c.fillText('z', 0.53 * w, 0.32 * h); c.fillText('z', 0.6 * w, 0.24 * h);
      L([[0.38, 0.41], [0.41, 0.42]]); L([[0.43, 0.41], [0.46, 0.42]]);
      c.fillStyle = '#e7e2d2'; c.beginPath(); c.ellipse(0.75 * w, 0.62 * h, 0.08 * w, 0.025 * h, 0, 0, 7); c.fill(); c.stroke();
      return;
    }
    const cx0 = 0.5, esc = modo === 'bebe' ? 0.8 : 1;
    O(cx0, 0.3, 0.12 * esc);
    c.fillStyle = '#2c2c2c'; c.beginPath(); c.arc((cx0 - 0.04) * w, 0.29 * h, w * 0.012, 0, 7); c.arc((cx0 + 0.04) * w, 0.29 * h, w * 0.012, 0, 7); c.fill();
    c.beginPath(); c.arc(cx0 * w, 0.33 * h, w * 0.04, 0.2, Math.PI - 0.2); c.stroke();
    if (modo === 'bebe') { O(cx0, 0.58, 0.16); L([[0.38, 0.55], [0.3, 0.5]]); L([[0.62, 0.55], [0.7, 0.5]]); c.font = `${w * 0.07}px ${FONTE}`; }
    else {
      L([[cx0, 0.42], [cx0, 0.68]]); L([[cx0, 0.68], [cx0 - 0.1, 0.88]]); L([[cx0, 0.68], [cx0 + 0.1, 0.88]]);
      L([[cx0, 0.5], [cx0 - 0.15, modo === 'acena' ? 0.36 : 0.6]]); L([[cx0, 0.5], [cx0 + 0.15, 0.6]]);
      // cabelo espetado (o menino)
      L([[cx0 - 0.06, 0.19], [cx0 - 0.03, 0.12], [cx0, 0.18], [cx0 + 0.04, 0.11], [cx0 + 0.06, 0.19]]);
      if (modo === 'mochila') { c.strokeRect((cx0 + 0.02) * w, 0.45 * h, 0.12 * w, 0.16 * h); }
      if (modo === 'bola') { O(cx0 + 0.24, 0.84, 0.05); }
      if (modo === 'bolo') { c.strokeRect((cx0 + 0.16) * w, 0.62 * h, 0.2 * w, 0.1 * h); L([[cx0 + 0.26, 0.62], [cx0 + 0.26, 0.55]]); }
    }
    if (r(7) > 0.4) { c.strokeStyle = '#c9a227'; c.lineWidth = w * 0.012; c.beginPath(); c.arc(0.85 * w, 0.12 * h, 0.06 * w, 0, 7); c.stroke(); }
  };
  // foto antiga: a vó novinha com duas bebês iguais no colo
  const desenhoFoto = (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#d9c49a'); g.addColorStop(1, '#b89a6a');
    c.fillStyle = '#f3ead6'; c.fillRect(0, 0, w, h); c.fillStyle = g; c.fillRect(w * 0.07, h * 0.06, w * 0.86, h * 0.8);
    const pele = '#e9cfa3', esc = '#3b2a1c';
    c.fillStyle = '#8a6d4a'; c.beginPath(); c.ellipse(w * 0.5, h * 0.78, w * 0.3, h * 0.3, 0, Math.PI, 0); c.fill(); // corpo
    c.fillStyle = esc; c.beginPath(); c.ellipse(w * 0.5, h * 0.3, w * 0.15, h * 0.15, 0, 0, 7); c.fill(); // cabelo
    c.fillStyle = pele; c.beginPath(); c.ellipse(w * 0.5, h * 0.33, w * 0.11, h * 0.115, 0, 0, 7); c.fill();
    c.fillStyle = esc; c.beginPath(); c.arc(w * 0.46, h * 0.32, w * 0.012, 0, 7); c.arc(w * 0.54, h * 0.32, w * 0.012, 0, 7); c.fill();
    c.strokeStyle = esc; c.lineWidth = w * 0.01; c.beginPath(); c.arc(w * 0.5, h * 0.36, w * 0.035, 0.3, Math.PI - 0.3); c.stroke();
    for (const bx of [0.36, 0.64]) { // as duas bebês, iguaizinhas
      c.fillStyle = '#f4efe2'; c.beginPath(); c.ellipse(w * bx, h * 0.63, w * 0.12, h * 0.09, bx < 0.5 ? -0.3 : 0.3, 0, 7); c.fill();
      c.fillStyle = pele; c.beginPath(); c.arc(w * bx, h * 0.57, w * 0.065, 0, 7); c.fill();
      c.fillStyle = esc; c.beginPath(); c.arc(w * (bx - 0.022), h * 0.565, w * 0.008, 0, 7); c.arc(w * (bx + 0.022), h * 0.565, w * 0.008, 0, 7); c.fill();
      c.beginPath(); c.arc(w * bx, h * 0.585, w * 0.015, 0.2, Math.PI - 0.2); c.stroke();
    }
    c.fillStyle = 'rgba(80,50,20,0.18)'; for (let k = 0; k < 40; k++) c.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    c.fillStyle = '#6b5638'; c.font = `${w * 0.06}px ${FONTE}`; c.textAlign = 'center'; c.fillText('1987', w * 0.5, h * 0.94);
  };

  // ============ personagens ============
  const crianca = (o) => { const P = T.pessoa(Object.assign({ coque: false }, o)); P.g.scale.setScalar(0.64); P.cabeca.scale.setScalar(1.38); return P; };
  const MENINO = crianca({ pele: '#e3ae84', cabelo: '#2a1d14', roupa: '#f2c230', calca: '#3c5a8a', sapato: '#d84a3a' });
  for (const [x, z, rz] of [[-0.05, 0.03, 0.4], [0.02, 0.0, -0.1], [0.08, 0.02, -0.5]]) { const p = T.m(new THREE.ConeGeometry(0.035, 0.11, 12), '#2a1d14', MENINO.cabeca); p.position.set(x, 0.155, z); p.rotation.z = rz; }
  const MAE = T.pessoa({ pele: '#d9a27a', cabelo: '#3a2416', roupa: '#c4553f', calca: '#33405e' });
  const VO = T.pessoa({ pele: '#e6bb98', cabelo: '#d9d9de', roupa: '#8b6fb5', saia: true });
  VO.g.scale.setScalar(0.93);
  for (const sx of [-1, 1]) { const a = T.m(new THREE.TorusGeometry(0.036, 0.006, 8, 24), '#3a3a40', VO.cabeca, { sem: true }); a.position.set(0.052 * sx, 0.012, 0.142); }
  T.m(new THREE.BoxGeometry(0.03, 0.006, 0.006), '#3a3a40', VO.cabeca, { sem: true }).position.set(0, 0.016, 0.148);
  // a chave no cordão
  const cordao = T.m(new THREE.TorusGeometry(0.09, 0.004, 6, 30), '#5a4632', VO.tronco, { sem: true }); cordao.position.set(0, 0.58, 0.05); cordao.rotation.x = 1.25; cordao.scale.y = 1.6;
  const chaveVo = T.grupo(VO.tronco, 0, 0.47, 0.12);
  const fazChave = (pai) => { const g = T.grupo(pai); const an = T.m(new THREE.TorusGeometry(0.018, 0.006, 8, 20), '#c9a227', g); an.position.y = 0.02;
    const h = cx(0.008, 0.05, 0.006, '#c9a227', 0, -0.02, 0, g); cx(0.016, 0.006, 0.006, '#c9a227', 0.008, -0.04, 0, g); cx(0.012, 0.006, 0.006, '#c9a227', 0.006, -0.028, 0, g); return g; };
  fazChave(chaveVo);
  const JORGE = T.pessoa({ pele: '#c98e6a', cabelo: '#c98e6a', roupa: '#4a72a8', calca: '#4b4b4b', coque: false });
  JORGE.g.scale.set(1.08, 1.0, 1.12);
  cx(0.11, 0.025, 0.03, '#3a2618', 0, -0.045, 0.14, JORGE.cabeca, { sem: true }); // bigode
  const SIND = T.pessoa({ pele: '#e2b392', cabelo: '#7a4a2a', roupa: '#2f8f6e', saia: true });
  for (const sx of [-1, 1]) { const a = T.m(new THREE.TorusGeometry(0.034, 0.007, 8, 24), '#8a2a2a', SIND.cabeca, { sem: true }); a.position.set(0.052 * sx, 0.012, 0.142); }
  const TODOS = [MENINO, MAE, VO, JORGE, SIND];
  // prato com arroz e feijão
  const fazPrato = (pai, cheio) => { const g = T.grupo(pai); cil(0.13, 0.1, 0.025, '#f4f4f0', 0, 0.012, 0, g);
    const comida = T.grupo(g); const ar = esf(0.07, '#f7f3e8', -0.03, 0.03, 0, comida, { w: 0.003 }); ar.scale.set(1, 0.35, 1); const fe = esf(0.06, '#5a2e1c', 0.045, 0.03, 0.01, comida, { w: 0.003 }); fe.scale.set(1, 0.3, 1);
    comida.visible = cheio; g.userData.comida = comida; return g; };
  const PRATO = fazPrato(null, true);
  const lanterna = T.grupo(null); cil(0.025, 0.03, 0.16, '#d84a3a', 0, 0, 0, lanterna).rotation.x = Math.PI / 2;
  const spot = new THREE.SpotLight(0xfff2cc, 0, 9, 0.45, 0.5, 1.2); T.cena.add(spot); T.cena.add(spot.target);

  // ============ APÊ (12 e 13) ============
  const apto = (x0, velho) => {
    const g = T.grupo(null, x0, 0, 0); const A = { g };
    const parede = velho ? '#b8a684' : '#e9dcc4', piso = velho ? '#7b5f43' : '#c99a6a', mov = velho ? '#6b4a30' : '#9a6b45';
    cx(6.4, 0.1, 5.4, piso, 0, -0.05, 0, g, { sem: true });
    for (let x = -3; x <= 3; x += 0.5) T.linha([x0 + x, 0.002, -2.6], [x0 + x, 0.002, 2.6], 0.006);
    cx(6.4, 2.7, 0.15, parede, 0, 1.35, -2.6, g); cx(0.15, 2.7, 5.4, parede, -3.2, 1.35, 0, g); cx(0.15, 2.7, 5.4, parede, 3.2, 1.35, 0, g);
    cx(6.4, 0.1, 5.4, velho ? '#9c8d70' : '#f3ece0', 0, 2.75, 0, g, { sem: true });
    cx(6.4, 0.12, 0.05, mov, 0, 0.06, -2.5, g, { sem: true });
    // cozinha (fundo à esquerda)
    cx(2.2, 0.9, 0.6, velho ? '#8f7a5a' : '#f0efe9', -1.9, 0.45, -2.2, g); cx(2.3, 0.05, 0.65, velho ? '#5e5245' : '#5b6670', -1.9, 0.92, -2.2, g);
    const fogao = cx(0.6, 0.02, 0.5, '#2b2b2b', -1.3, 0.95, -2.2, g, { sem: true });
    A.panela = cil(0.13, 0.12, 0.14, '#a8acb2', -1.3, 1.03, -2.15, g); A.colher = cx(0.02, 0.3, 0.02, '#8a5a32', -1.25, 1.18, -2.15, g);
    cx(2.2, 0.6, 0.35, velho ? '#8f7a5a' : '#f0efe9', -1.9, 1.85, -2.38, g);
    // mesa e cadeiras
    cx(1.4, 0.05, 0.9, mov, 0, 0.76, 0.2, g); for (const [a, b] of [[-0.62, -0.38], [0.62, -0.38], [-0.62, 0.78], [0.62, 0.78]]) cx(0.05, 0.74, 0.05, mov, a, 0.37, b, g, { sem: true });
    for (const [x, z, ry] of [[-0.95, 0.2, Math.PI / 2], [0.95, 0.2, -Math.PI / 2]]) { const c = T.grupo(g, x, 0, z); c.rotation.y = ry; cx(0.42, 0.05, 0.42, mov, 0, 0.45, 0, c); cx(0.42, 0.5, 0.05, mov, 0, 0.72, -0.2, c); }
    // sofá à direita
    const sofa = velho ? '#7d5a5a' : '#5f8fb0';
    cx(0.8, 0.45, 1.9, sofa, 2.6, 0.22, 0.6, g); cx(0.25, 0.55, 1.9, sofa, 2.95, 0.6, 0.6, g); cx(0.8, 0.3, 0.2, sofa, 2.6, 0.55, -0.3, g); cx(0.8, 0.3, 0.2, sofa, 2.6, 0.55, 1.5, g);
    // janela no fundo com a cidade à noite
    A.janela = T.tela(1.3, 1.0, 256, (c, w, h) => { c.fillStyle = '#18213a'; c.fillRect(0, 0, w, h); for (let k = 0; k < 9; k++) { const bx = k * w / 8, bh = h * (0.3 + 0.5 * Math.abs(Math.sin(k * 3.7))); c.fillStyle = '#0d1222'; c.fillRect(bx, h - bh, w / 9, bh);
      c.fillStyle = '#f6d77a'; for (let j = 0; j < 6; j++) if (Math.sin(k * 7 + j * 3) > 0.2) c.fillRect(bx + 6, h - bh + 8 + j * 14, 6, 6); } }, g);
    A.janela.position.set(1.0, 1.6, -2.52); cx(1.4, 0.06, 0.08, '#fff', 1.0, 1.08, -2.5, g); cx(1.4, 0.06, 0.08, '#fff', 1.0, 2.12, -2.5, g); cx(0.06, 1.1, 0.08, '#fff', 1.0, 1.6, -2.5, g);
    // relógio de parede
    A.relogio = T.tela(0.42, 0.42, 256, (c, w, h) => {}, g, { transp: true }); A.relogio.position.set(-0.4, 2.05, -2.5);
    A.hora = 21;
    A.relogio.userData.f((c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#fbfaf5'; c.strokeStyle = '#1b1b1b'; c.lineWidth = 12; c.beginPath(); c.arc(w / 2, h / 2, w * 0.44, 0, 7); c.fill(); c.stroke();
      c.lineWidth = 6; for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; c.beginPath(); c.moveTo(w / 2 + Math.sin(a) * w * 0.36, h / 2 - Math.cos(a) * w * 0.36); c.lineTo(w / 2 + Math.sin(a) * w * 0.4, h / 2 - Math.cos(a) * w * 0.4); c.stroke(); }
      const hh = (A.hora % 12) / 12 * 6.283, mm = (A.hora % 1) * 6.283; c.lineWidth = 12; c.beginPath(); c.moveTo(w / 2, h / 2); c.lineTo(w / 2 + Math.sin(hh) * w * 0.22, h / 2 - Math.cos(hh) * w * 0.22); c.stroke();
      c.lineWidth = 7; c.beginPath(); c.moveTo(w / 2, h / 2); c.lineTo(w / 2 + Math.sin(mm) * w * 0.33, h / 2 - Math.cos(mm) * w * 0.33); c.stroke(); });
    A.relogio.userData.redesenha();
    // luminária do teto
    A.lustre = T.grupo(g, 0, 2.7, 0.2); cil(0.006, 0.006, 0.5, '#222', 0, -0.25, 0, A.lustre, { sem: true }); A.cupula = cil(0.12, 0.3, 0.25, velho ? '#a08a5a' : '#f2d27a', 0, -0.6, 0, A.lustre);
    // porta de entrada (parede da direita, frente)
    A.porta = T.grupo(g, 3.12, 0, 2.0); cx(0.08, 2.1, 0.95, velho ? '#5a3e28' : '#8a5a36', 0, 1.05, 0, A.porta); esf(0.035, '#d4b04a', -0.06, 1.0, -0.35, A.porta);
    return A;
  };
  const AP12 = apto(0, false);
  const AP13 = apto(30, true);
  // detalhes do 13: calendário 1987, parede de desenhos, cadeira de balanço, xícaras, estante com a foto, corredor escuro
  const cal = T.tela(0.5, 0.7, 256, (c, w, h) => { c.fillStyle = '#f2ead8'; c.fillRect(0, 0, w, h); c.fillStyle = '#b03a2e'; c.fillRect(0, 0, w, h * 0.28);
    c.fillStyle = '#fff'; c.font = `bold ${w * 0.17}px ${FONTE}`; c.textAlign = 'center'; c.fillText('MARÇO', w / 2, h * 0.13); c.font = `bold ${w * 0.2}px ${FONTE}`; c.fillText('1987', w / 2, h * 0.255);
    c.fillStyle = '#333'; c.font = `${w * 0.075}px ${FONTE}`; for (let k = 0; k < 31; k++) c.fillText(String(k + 1), w * (0.1 + (k % 7) * 0.133), h * (0.38 + Math.floor(k / 7) * 0.12)); }, AP13.g);
  cal.position.set(-2.6, 1.7, -2.5);
  const DESENHOS = []; const modos = ['bebe', 'bebe', 'acena', 'mochila', 'bola', 'bolo', 'acena', 'mochila', 'bola', 'acena', 'bolo', 'mochila', 'acena', 'bola', 'dorme'];
  for (let k = 0; k < 24; k++) {
    const modo = k === 23 ? 'dorme' : modos[k % 14];
    const d = T.tela(0.36, 0.28, 192, (c, w, h) => desenhoCrianca(c, w, h, modo, k + 1), AP13.g, { luz: true });
    const col = k % 8, lin = Math.floor(k / 8);
    d.position.set(-3.1, 1.15 + lin * 0.36 + Math.sin(k * 5) * 0.03, -1.9 + col * 0.42); d.rotation.y = Math.PI / 2; d.rotation.z = Math.sin(k * 3.3) * 0.08; DESENHOS.push(d);
  }
  const balanco = T.grupo(AP13.g, 2.2, 0, -1.2); balanco.rotation.y = -0.7;
  { const b = T.grupo(balanco); for (const sx of [-1, 1]) { for (let k = -6; k <= 6; k++) { const a0 = k * 0.09; const p = cx(0.035, 0.03, 0.07, '#4a3020', 0.24 * sx, 0.04 + (1 - Math.cos(a0)) * 0.9, Math.sin(a0) * 0.9, b, { sem: true }); p.rotation.x = a0; }
      for (const z of [-0.2, 0.2]) cx(0.03, 0.38, 0.03, '#4a3020', 0.24 * sx, 0.24, z, b, { sem: true }); }
    cx(0.55, 0.05, 0.5, '#6b4a30', 0, 0.42, 0, b); cx(0.55, 0.7, 0.05, '#6b4a30', 0, 0.8, -0.27, b).rotation.x = -0.15; balanco.userData.b = b; }
  const xicaras = []; for (const [x, z] of [[-0.2, 0.1], [0.25, 0.3]]) { const xc = cil(0.045, 0.035, 0.08, '#efe6d0', x, 0.82, z, AP13.g); xicaras.push(xc); }
  const fumaca = []; for (let k = 0; k < 6; k++) { const f = esf(0.025, T.basico('#ffffff', { transparent: true, opacity: 0.5 }), 0.25, 0.9, 0.3, AP13.g, { sem: true }); fumaca.push(f); }
  cx(1.0, 1.4, 0.35, '#5a3e28', 1.6, 0.7, -2.38, AP13.g); for (const y of [0.45, 0.9, 1.35]) cx(1.0, 0.04, 0.36, '#4a3020', 1.6, y, -2.36, AP13.g);
  const foto = T.grupo(AP13.g, 1.6, 1.37 + 0.13, -2.3); cx(0.24, 0.3, 0.02, '#3a2818', 0, 0, -0.01, foto); const fotoTela = T.tela(0.2, 0.26, 256, desenhoFoto, foto, { luz: false }); fotoTela.position.z = 0.002; foto.rotation.x = -0.12;
  // corredor escuro do 13 (porta do fundo à direita vira um vão preto)
  const vao = cx(0.9, 2.1, 0.05, T.basico('#050507'), 2.4, 1.05, -2.5, AP13.g, { sem: true });
  const notas = []; for (let k = 0; k < 8; k++) { const n = T.tela(0.18, 0.22, 96, (c, w, h) => { c.fillStyle = '#f4e7b0'; c.font = `bold ${w * 0.9}px ${FONTE}`; c.textAlign = 'center'; c.fillText(k % 2 ? '♪' : '♫', w / 2, h * 0.85); }, null, { transp: true }); notas.push(n); }
  // poeira no 13
  // ============ QUARTO (12) ============
  const Q = T.grupo(null, 0, 0, -12);
  cx(4.6, 0.1, 4.2, '#b88d64', 0, -0.05, 0, Q, { sem: true }); cx(4.6, 2.7, 0.15, '#cfe0e6', 0, 1.35, -2.1, Q); cx(0.15, 2.7, 4.2, '#cfe0e6', -2.3, 1.35, 0, Q); cx(0.15, 2.7, 4.2, '#cfe0e6', 2.3, 1.35, 0, Q);
  const teto = cx(4.6, 0.1, 4.2, '#eef3f5', 0, 2.75, 0, Q, { sem: true });
  const cama = (x, cor) => { const g = T.grupo(Q, x, 0, -1.0); cx(0.95, 0.35, 1.9, '#7a5a3a', 0, 0.18, 0, g); cx(0.9, 0.12, 1.85, '#f5f5f0', 0, 0.42, 0, g); cx(0.95, 0.8, 0.08, '#7a5a3a', 0, 0.5, -0.95, g);
    const trav = cx(0.6, 0.1, 0.3, '#ffffff', 0, 0.52, -0.7, g); const cob = cx(0.92, 0.08, 1.2, cor, 0, 0.5, 0.33, g); return { g, cob }; };
  const CAMA_M = cama(-1.15, '#e8b830'), CAMA_V = cama(1.15, '#9a7bc0');
  const Qlustre = T.grupo(Q, 0, 2.7, -0.4); cil(0.006, 0.006, 0.45, '#222', 0, -0.22, 0, Qlustre, { sem: true }); cil(0.12, 0.28, 0.22, '#f2d27a', 0, -0.55, 0, Qlustre);
  const Qjan = T.tela(1.0, 1.0, 128, (c, w, h) => { c.fillStyle = '#121a30'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2f0d8'; c.beginPath(); c.arc(w * 0.7, h * 0.3, w * 0.1, 0, 7); c.fill(); }, Q); Qjan.position.set(0, 1.6, -2.02);
  const bengala = T.grupo(null); cil(0.012, 0.012, 1.25, '#5a3a22', 0, -0.62, 0, bengala);
  const poeira = []; for (let k = 0; k < 14; k++) { const p = esf(0.012, T.basico('#d9d4c8'), 0, 0, 0, null, { sem: true }); poeira.push(p); }
  // ============ ESCADA e CORREDOR ============
  const patamar = (x0, y0, numero, temMacaneta) => {
    const g = T.grupo(null, x0, y0, 0); const P = { g };
    const parede = '#bfcfc4';
    cx(4.2, 0.12, 2.4, '#9aa0a0', 0, -0.06, -0.3, g, { sem: true });
    cx(4.4, 3.0, 0.15, parede, 0, 1.5, -1.55, g); cx(0.15, 3.0, 6, parede, -2.2, 1.5, 0.8, g); cx(0.15, 3.0, 6, parede, 2.2, 1.5, 0.8, g);
    cx(4.4, 0.6, 0.02, '#8fa596', 0, 0.3, -1.47, g, { sem: true });
    // degraus descendo (esquerda) e subindo (direita), em direção à câmera (+z)
    for (let k = 1; k <= 9; k++) { cx(1.9, 0.17, 0.3, '#a9aeae', -1.1, -k * 0.17 + 0.0, 0.9 + k * 0.3 - 0.15, g); T.linha([x0 - 2.05, y0 - k * 0.17 + 0.085, 0.75 + k * 0.3], [x0 - 0.15, y0 - k * 0.17 + 0.085, 0.75 + k * 0.3], 0.01); }
    for (let k = 0; k < 9; k++) { cx(1.9, 0.17 * (k + 1), 0.3, '#a9aeae', 1.1, 0.085 * (k + 1), 1.05 + k * 0.3, g); }
    cx(0.08, 1.0, 3.0, '#5b6670', 0.0, 0.6, 2.2, g); // corrimão do meio
    // porta
    P.porta = T.grupo(g, -0.2, 0, -1.47);
    P.portaTela = T.tela(0.95, 2.1, 256, (c, w, h) => {}, P.porta, { luz: true }); P.portaTela.position.set(0, 1.05, 0.01);
    P.raspa = 0;
    P.portaTela.userData.f((c, w, h) => { c.fillStyle = '#8fa29a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#6f827a'; c.lineWidth = 6; c.strokeRect(10, 10, w - 20, h - 20);
      if (temMacaneta) { c.fillStyle = '#d4b04a'; c.beginPath(); c.arc(w * 0.82, h * 0.5, 14, 0, 7); c.fill(); }
      if (P.raspa > 0) { const rr = P.raspa * 34; c.fillStyle = '#5a5248'; c.beginPath(); c.ellipse(w * 0.8, h * 0.5, rr * 1.3, rr, 0, 0, 7); c.fill();
        if (P.raspa > 0.5) { c.fillStyle = '#c9a227'; c.beginPath(); c.arc(w * 0.8, h * 0.49, 13, 0, 7); c.fill(); c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(w * 0.8, h * 0.485, 5, 0, 7); c.fill(); c.fillRect(w * 0.8 - 2.5, h * 0.485, 5, 16); } } });
    P.portaTela.userData.redesenha();
    cx(1.1, 2.2, 0.06, '#6f827a', -0.2, 1.1, -1.5, g);
    const num = T.tela(0.8, 0.6, 256, (c, w, h) => { c.fillStyle = '#c0392b'; c.font = `bold ${h * 0.85}px ${FONTE}`; c.textAlign = 'center'; c.fillText(numero, w / 2, h * 0.82); }, g, { transp: true, luz: true });
    num.position.set(1.15, 1.9, -1.46);
    P.luz = cx(0.9, 0.05, 0.15, T.basico('#f8fbff'), 0, 2.95, -0.6, g, { sem: true });
    return P;
  };
  const ESC = patamar(-20, 0, '13', false);
  const COR = patamar(-20, -30, '12', true);
  const ESC14 = patamar(-28, 0, '14', true);
  // maca (corredor do 12)
  const maca = T.grupo(COR.g, 0.6, 0, 0.7); cx(0.6, 0.06, 1.9, '#e8eef2', 0, 0.8, 0, maca); for (const [a, b] of [[-0.25, -0.85], [0.25, -0.85], [-0.25, 0.85], [0.25, 0.85]]) cil(0.02, 0.02, 0.8, '#9aa', a, 0.4, b, maca, { sem: true });
  // ============ ELEVADOR ============
  const EL = T.grupo(null, -40, 0, 0);
  cx(1.8, 0.1, 1.8, '#5a5e66', 0, -0.05, 0, EL, { sem: true }); cx(1.8, 2.5, 0.08, '#b8bdc4', 0, 1.25, -0.9, EL); cx(0.08, 2.5, 1.8, '#b8bdc4', -0.9, 1.25, 0, EL); cx(0.08, 2.5, 1.8, '#c4c9d0', 0.9, 1.25, 0, EL);
  cx(1.8, 0.08, 1.8, '#d8dde2', 0, 2.5, 0, EL, { sem: true });
  let acende13 = 0, aperta14 = 0;
  const painel = T.tela(0.34, 0.8, 340, (c, w, h) => {}, EL, { luz: true }); painel.position.set(0.85, 1.25, -0.3); painel.rotation.y = -Math.PI / 2;
  const desenhaPainel = (c, w, h) => {
    c.fillStyle = '#9ea4ac'; c.fillRect(0, 0, w, h); c.fillStyle = '#16181c'; c.fillRect(w * 0.15, h * 0.04, w * 0.7, h * 0.11);
    c.fillStyle = '#ff5a3c'; c.font = `bold ${h * 0.08}px ${FONTE}`; c.textAlign = 'center'; c.fillText(acende13 > 0.5 ? '13' : '12', w / 2, h * 0.125);
    const bot = acende13 > 0 ? [['15', 0], ['14', 0], ['13', acende13], ['12', 0], ['11', 0], ['10', 0]] : [['16', 0], ['15', 0], ['14', aperta14], ['12', 0], ['11', 0], ['10', 0]];
    bot.forEach(([n, a], i) => { const y = h * (0.24 + i * 0.125); c.fillStyle = a > 0 ? `rgba(255,${180 - 60 * a},60,1)` : '#d9dde2'; c.beginPath(); c.arc(w / 2, y, w * 0.2, 0, 7); c.fill();
      c.strokeStyle = '#555'; c.lineWidth = 4; c.stroke(); c.fillStyle = a > 0 ? '#3a1a00' : '#2a2c30'; c.font = `bold ${w * 0.2}px ${FONTE}`; c.fillText(n, w / 2, y + w * 0.07); });
  };
  painel.userData.f(desenhaPainel); painel.userData.redesenha();
  // ============ FACHADA ============
  const FA = T.grupo(null, 0, 0, -90);
  const ceu = T.tela(60, 50, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a0f24'); g.addColorStop(1, '#2a3560'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, FA); ceu.position.set(0, 20, -12);
  cx(40, 0.1, 30, '#2c2f36', 0, -0.05, 6, FA, { sem: true });
  const NAND = 16, AND = 1.1;
  cx(7, NAND * AND + 0.6, 4, '#c9b9a0', 0, (NAND * AND + 0.6) / 2, -2, FA);
  const janelasFA = [];
  for (let a = 1; a <= NAND; a++) for (let j = 0; j < 5; j++) {
    const aceso = a !== 13 && Math.sin(a * 12.7 + j * 7.1) > -0.35;
    const m = cx(0.75, 0.62, 0.05, T.basico(a === 13 ? '#07080c' : (aceso ? '#f6d77a' : '#2a3048')), -2.6 + j * 1.3, a * AND - 0.35, 0.02, FA, { sem: true }); janelasFA.push({ m, a, j });
    cx(0.85, 0.06, 0.12, '#a89a84', -2.6 + j * 1.3, a * AND - 0.7, 0.05, FA, { sem: true });
  }
  const placa13 = null;
  for (const x of [-12, -9, 9, 12]) { const h = 4 + Math.abs(Math.sin(x)) * 8; cx(2.6, h, 2.6, '#1b2033', x, h / 2, -5, FA, { sem: true }); }
  const poste = T.grupo(FA, 4.5, 0, 3); cil(0.06, 0.08, 4, '#333', 0, 2, 0, poste); const lamp = esf(0.18, T.basico('#ffe9a8'), -0.4, 4, 0, poste, { sem: true });
  // ============ véu preto (apagão / cortes) ============
  const veu = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthTest: false }));
  veu.position.z = -0.1; veu.renderOrder = 999; T.cam.add(veu);
  const flash = new THREE.PointLight(0xff3030, 0, 8, 1.5); T.cena.add(flash);

  // ============ utilidades de plano ============
  const cam = (p, a, fov = 55) => { T.cam.position.set(...p); T.cam.lookAt(new V3(...a)); if (T.cam.fov !== fov) { T.cam.fov = fov; T.cam.updateProjectionMatrix(); } };
  const camK = (u, ks) => { const v = T.chaves(ks.map((k) => [k[0], k.slice(1)]), u); cam(v.slice(0, 3), v.slice(3, 6), v[6] || 55); };
  const luz = (h, s, fundo = '#10131c') => { hemi.intensity = h; T.sol.intensity = s; T.cena.background.set(fundo); };
  const pe = (P, x, y, z, ry = 0) => { P.g.position.set(x, y, z); P.g.rotation.set(0, ry, 0); P.g.visible = true; };
  const respira = (P, t, s = 0) => { P.tronco.scale.y = 1 + 0.012 * Math.sin((t + s) * 2.4); P.piscaAuto(t, s); };
  const sentado = (P, ang = 1.45) => { P.pernas.forEach((q) => { q.rotation.x = -ang; }); };
  const emPe = (P) => { P.pernas.forEach((q) => { q.rotation.x = 0; }); P.g.rotation.x = 0; P.tronco.rotation.set(0, 0, 0); P.cabeca.rotation.set(0, 0, 0); P.boca(0); P.cenho(0); P.olhar(0, 0); P.solto('E'); P.solto('D'); };
  const notasEm = (t, x, y, z, n = 5, sobe = 0.9) => { notas.forEach((m, k) => { m.visible = k < n; const f = ((t * 0.35 + k / n) % 1); m.position.set(x + Math.sin(k * 2.1 + t) * 0.35, y + f * sobe, z + Math.cos(k * 1.7) * 0.2); m.material.opacity = Math.sin(f * Math.PI); m.lookAt(T.cam.position); }); };
  const lanternaEm = (P, lado, alvo, int = 30) => { // lanterna na mão (alvo no mundo) apontando
    const m = P.br[lado].mao; const w = new V3(); m.getWorldPosition(w); lanterna.position.copy(w); lanterna.lookAt(new V3(...alvo)); lanterna.visible = true;
    spot.position.copy(w); spot.target.position.set(...alvo); spot.intensity = int; };
  const maoMundo = (P, lado, w, polo) => { const l = P.g.worldToLocal(new V3(...w)); P.mao(lado, l.toArray(), polo); };
  const pratoNa = (P, lado, cheio = true) => { const w = new V3(); P.br[lado].mao.getWorldPosition(w); PRATO.position.set(w.x, w.y - 0.04, w.z); PRATO.visible = true; PRATO.userData.comida.visible = cheio; };

  // ============ planos ============
  // cada plano: (u = tempo local, d = duração, t = tempo global). k = índice 0..31 = cena k+1 do roteiro
  const S = [];
  // 1 · painel do elevador pula do 12 pro 14
  S[0] = (u, d, t) => {
    luz(1.6, 1.2, '#20242c'); pe(MENINO, -39.62, 0, 0.12, Math.PI / 2 - 0.35); respira(MENINO, t);
    const ap = T.janela(u, 1.0, 1.6) * (1 - T.janela(u, 2.3, 2.8));
    maoMundo(MENINO, 'D', [-39.25 + 0.06 * (1 - ap), 1.0 + 0.26 * ap, -0.05 - 0.25 * ap], [0, -1, -1]); MENINO.cabeca.rotation.x = -0.15;
    aperta14 = T.janela(u, 1.6, 1.8); acende13 = 0; painel.userData.redesenha();
    camK(u, [[0, -40.2, 1.75, 0.95, -39.3, 0.95, -0.25, 60], [d, -40.0, 1.6, 0.6, -39.2, 1.15, -0.3, 44]]);
  };
  // 2 · fachada: a fileira escura do 13
  S[1] = (u, d, t) => {
    luz(0.9, 0.3, '#0a0f24');
    camK(u, [[0, 0, 1.6, -76, 0, 6, -92, 50], [d * 0.7, 0, 3, -78, 0, 14.2, -92, 42], [d, 0, 3.4, -79, 0, 14.6, -92, 34]]);
  };
  // 3 · porta do 13 sem maçaneta
  S[2] = (u, d, t) => {
    luz(1.4, 0.6, '#181c22'); ESC.raspa = 0; ESC.portaTela.userData.redesenha();
    camK(u, [[0, -20.9, 1.6, 2.6, -19.5, 1.35, -1.5, 62], [d, -20.8, 1.5, 1.7, -19.5, 1.25, -1.5, 56]]);
  };
  // 4 · seu Jorge cochichando
  S[3] = (u, d, t) => {
    luz(1.5, 0.7, '#181c22'); pe(JORGE, -28.4, 0, -0.4, 0.25); respira(JORGE, t); JORGE.mao('D', [-0.06, 1.48, 0.25], [-0.5, -1, 0]);
    JORGE.olhar(Math.sin(t * 1.3) * 0.8, 0); JORGE.cabeca.rotation.y = Math.sin(t * 0.9) * 0.15; JORGE.boca(0.25 + 0.25 * Math.sin(t * 13) * (Math.sin(t * 3) > -0.3));
    JORGE.cenho(0.4);
    camK(u, [[0, -27.6, 1.55, 1.3, -28.35, 1.45, -0.4, 42], [d, -27.75, 1.52, 0.95, -28.35, 1.45, -0.4, 40]]);
  };
  // 5 · síndica: "número de azar, e pronto" (carimbo)
  S[4] = (u, d, t) => {
    luz(1.5, 0.7, '#181c22'); pe(SIND, -20.6, -30, -0.6, 0.2); respira(SIND, t);
    const bate = Math.max(0, Math.sin(Math.min(u, d * 0.85) * 6)); SIND.mao('D', [-0.18, 0.95 + bate * 0.15, 0.4], [-0.5, -1, 0]); SIND.mao('E', [0.2, 0.92, 0.38]);
    SIND.boca(u < d - 1.0 ? 0.2 + 0.3 * Math.abs(Math.sin(t * 11)) : 0); SIND.cenho(0.6);
    cx; mesaSind.visible = true; carimbo.position.set(-20.6 - 0.15, -30 + 0.88 + bate * 0.15, -0.2);
    camK(u, [[0, -20.0, -28.5, 1.3, -20.55, -28.8, -0.5, 45], [d, -20.1, -28.55, 1.1, -20.55, -28.8, -0.5, 42]]);
  };
  // 6 · eu moro no doze com minha mãe e minha vó
  S[5] = (u, d, t) => {
    luz(1.55, 1.1, '#10131c');
    pe(MAE, -1.3, 0, -1.65, Math.PI); respira(MAE, t); MAE.mao('D', [-0.05, 1.12, 0.45 + 0.05 * Math.sin(t * 5)]); AP12.colher.position.set(-1.3 + 0.04 * Math.sin(t * 5), 1.18, -2.15 + 0.04 * Math.cos(t * 5));
    pe(VO, 1.6, 0, -1.7, Math.PI - 0.3); respira(VO, t, 1); VO.mao('D', [-0.12, 1.0, 0.3]); VO.mao('E', [0.12, 1.0, 0.3]);
    pe(MENINO, 0.3, 0, 1.4, 0.2); respira(MENINO, t, 2); MENINO.mao('D', [-0.3, 1.05 + 0.1 * Math.sin(t * 9), 0.1], [-1, 0, 0]); MENINO.boca(0.15);
    const vira = T.janela(u, d * 0.35, d * 0.5); MAE.cabeca.rotation.y = -0.8 * vira; VO.g.rotation.y = Math.PI - 0.3 + 2.2 * T.janela(u, d * 0.6, d * 0.8);
    camK(u, [[0, 0.9, 1.7, 6.6, 0.75, 0.95, -0.4, 64], [d, 0.85, 1.65, 6.0, 0.75, 0.95, -0.4, 60]]);
  };
  // 7 · close da vó com cara de segredo
  S[6] = (u, d, t) => {
    luz(1.5, 1.1, '#10131c'); pe(VO, 1.6, 0, -1.7, 0.6); respira(VO, t, 1); VO.mao('D', [-0.12, 1.0, 0.3]); VO.mao('E', [0.12, 1.0, 0.3]);
    VO.cabeca.rotation.y = 0.35 * T.janela(u, 0.3, 1.0); VO.olhar(-0.9 * T.janela(u, 1.0, 1.4), 0.3); VO.boca(0.12);
    const wv = new V3(); VO.cabeca.getWorldPosition(wv); camK(u, [[0, wv.x + 0.75, wv.y - 0.1, wv.z + 1.3, wv.x, wv.y - 0.12, wv.z, 40], [d, wv.x + 0.6, wv.y - 0.1, wv.z + 1.05, wv.x, wv.y - 0.12, wv.z, 34]]);
  };
  // 8 · relógio 21h, a vó deixa o prato na escada
  S[7] = (u, d, t) => {
    if (u < 1.3) { luz(1.5, 1.0); AP12.hora = 21; AP12.relogio.userData.redesenha(); camK(u, [[0, -0.4, 2.05, -1.5, -0.4, 2.05, -2.5, 30], [1.3, -0.4, 2.05, -1.7, -0.4, 2.05, -2.5, 30]]); return; }
    luz(1.3, 0.5, '#181c22'); const v = u - 1.3, w = d - 1.3;
    const ab = T.janela(v, 0, w * 0.55);
    pe(VO, -20.5 + 0.9 * (1 - T.janela(v, 0, w * 0.3)), 0, 0.6 - 0.3 * T.janela(v, 0, w * 0.3), Math.PI * 0.9); respira(VO, t);
    VO.tronco.rotation.x = 0.55 * ab; VO.g.position.y = -0.0;
    VO.mao('D', [0.05, 1.0 - 0.6 * ab, 0.35 + 0.25 * ab], [0, -1, 0.3]); VO.mao('E', [-0.05, 1.0 - 0.6 * ab, 0.35 + 0.25 * ab], [0, -1, 0.3]);
    if (ab < 0.98) pratoNa(VO, 'D'); else { PRATO.position.set(-20.5 - 0.1, 0.01, 0.0); PRATO.visible = true; PRATO.userData.comida.visible = true; }
    VO.anda(v * 1.6 * (1 - T.janela(v, w * 0.3, w * 0.35)), 0.25 * (1 - T.janela(v, w * 0.25, w * 0.32)));
    camK(v, [[0, -21.3, 1.3, 2.9, -20.3, 0.7, -0.3, 55], [w, -21.2, 1.1, 2.4, -20.4, 0.5, -0.2, 50]]);
  };
  // 9 · de manhã: prato vazio e lavado (brilho)
  S[8] = (u, d, t) => {
    luz(2.0, 1.6, '#cfe0f0'); PRATO.position.set(-20.6, 0.01, 0.0); PRATO.visible = true; PRATO.userData.comida.visible = false;
    brilho.visible = u > d * 0.45; brilho.position.set(-20.55, 0.07, 0.08); brilho.scale.setScalar(0.5 + 0.5 * Math.abs(Math.sin(u * 5))); brilho.lookAt(T.cam.position); brilho.rotation.z = u * 2;
    camK(u, [[0, -20.2, 0.75, 1.0, -20.6, 0.02, 0.0, 40], [d, -20.35, 0.55, 0.6, -20.6, 0.02, 0.0, 34]]);
  };
  // 10 · vó bate no teto com a bengala; algo bate de volta
  S[9] = (u, d, t) => {
    luz(0.55, 0.15, '#05070c'); quartoNoite(t);
    pe(VO, 1.0, 0, -12.0, 0.4); respira(VO, t);
    const f = u / d; const TK = D.toc10 || []; const bt = (k) => TK[k] === undefined ? 0 : Math.exp(-Math.pow((t - TK[k]) * 9, 2)); const bat = () => 0; const b = bt(0) + bt(1);
    VO.mao('D', [-0.12, 1.4 + b * 0.1, 0.08], [-0.6, -1, 0]); VO.cabeca.rotation.x = -0.35; VO.olhar(0, 1);
    const w = new V3(); VO.br.D.mao.getWorldPosition(w); bengala.position.set(w.x, w.y + 1.22, w.z); bengala.visible = true;
    const resp = bt(2) + bt(3); const tr = TK[2] || (INI[9] + d * 0.42); Qlustre.rotation.z = 0.12 * Math.sin(u * 7) * T.janela(t, tr, tr + 0.2) * (1 - T.janela(t, tr + 2, tr + 3)); poeiraCai(t, t > tr && t < tr + 3, 1.0, -12.3);
    pe(MAE, -0.6, 0, -10.6, Math.PI + 0.3); respira(MAE, t, 3); MAE.g.visible = f > 0.66; MAE.mao('D', [-0.2, 1.0, 0.2]); MAE.cabeca.rotation.z = 0.15; MAE.boca(f > 0.7 && f < 0.92 ? 0.3 * Math.abs(Math.sin(t * 10)) : 0);
    const sh = resp * 0.02; camK(u, [[0, -0.7 + sh, 1.25, -9.0, 0.9, 1.45, -12.1, 66], [d, -0.6, 1.2, -9.3, 0.9, 1.45, -12.1, 62]]);
  };
  // 11 · vó canta na cama, mãe dá de ombros na porta
  S[10] = (u, d, t) => {
    luz(0.6, 0.15, '#05070c'); quartoNoite(t);
    pe(VO, 1.15, 0.6, -12.25, 0); VO.g.rotation.x = -Math.PI / 2; respira(VO, t); VO.boca(0.2 + 0.2 * Math.sin(t * 4)); VO.pisca(0.85);
    CAMA_V.cob.scale.y = 3; notasEm(t, 1.15, 1.0, -11.6, 6, 0.9);
    pe(MAE, -1.6, 0, -10.6, Math.PI * 0.85); respira(MAE, t, 3); const om = T.janela(u, d * 0.55, d * 0.65) * (1 - T.janela(u, d * 0.85, d * 0.95));
    MAE.mao('D', [-0.35, 0.95 + om * 0.25, 0.25]); MAE.mao('E', [0.35, 0.95 + om * 0.25, 0.25]); MAE.tronco.position.y = 0.78 + om * 0.03; MAE.cenho(-0.4 * om);
    camK(u, [[0, -0.6, 1.6, -9.6, 0.6, 0.75, -12.6, 55], [d, -0.5, 1.5, -9.9, 0.7, 0.75, -12.7, 52]]);
  };
  // 12 · a chave no pescoço da vó
  S[11] = (u, d, t) => {
    luz(1.5, 1.1, '#10131c'); pe(VO, 0.8, 0, 0.6, 0); respira(VO, t); VO.mao('D', [-0.1, 1.05, 0.25], [-1, -0.5, 0]); chaveVo.rotation.z = Math.sin(t * 2) * 0.15;
    VO.cabeca.rotation.y = -0.4 * T.janela(u, d * 0.6, d * 0.8); VO.olhar(-0.6 * T.janela(u, d * 0.6, d * 0.8), 0);
    camK(u, [[0, 0.85, 1.25, 1.5, 0.8, 1.2, 0.6, 30], [d, 0.82, 1.22, 1.1, 0.8, 1.18, 0.6, 26]]);
  };
  // 13 · eu de lanterna na escada, cochilando
  S[12] = (u, d, t) => {
    luz(0.8, 0.2, '#0b0d12');
    pe(MENINO, -21.2, -0.34, 0.95, 0.5); sentado(MENINO, 1.5); MENINO.g.position.y = -0.17 - 0.28; respira(MENINO, t);
    PRATO.position.set(-20.5, 0.01, 0.1); PRATO.visible = true; PRATO.userData.comida.visible = true;
    const sono = T.janela(u, d * 0.45, d * 0.9); MENINO.cabeca.rotation.x = 0.5 * sono + 0.08 * Math.sin(u * 3) * T.janela(u, d * 0.3, d * 0.5); MENINO.pisca(T.clamp(sono * 1.1 + 0.3 * (u > d * 0.3 && Math.sin(u * 5) > 0.6)));
    MENINO.mao('D', [-0.05, 0.62, 0.3], [-1, 0, 0]); MENINO.mao('E', [0.15, 0.6, 0.25]);
    lanternaEm(MENINO, 'D', [-20.5, 0.0, 0.1], 18 * (1 - 0.6 * sono));
    camK(u, [[0, -21.6, 0.9, 3.4, -20.9, 0.0, 0.6, 50], [d, -21.5, 0.75, 2.9, -20.9, 0.0, 0.6, 46]]);
  };
  // 14 · acordo: prato vazio e um desenho de mim dormindo
  S[13] = (u, d, t) => {
    luz(1.2, 0.5, '#181c22');
    pe(MENINO, -21.2, -0.45, 0.95, 0.5); sentado(MENINO, 1.5); respira(MENINO, t);
    const ac = T.janela(u, 0, 0.5); MENINO.cabeca.rotation.x = 0.5 * (1 - ac) + 0.35 * T.janela(u, 0.8, 1.4); MENINO.pisca(1 - ac); MENINO.olhar(0.6, -0.8); MENINO.boca(0.35 * T.janela(u, 0.5, 0.8));
    PRATO.position.set(-20.5, 0.01, 0.1); PRATO.visible = true; PRATO.userData.comida.visible = false;
    folha.visible = true; folha.position.set(-20.85, 0.012, 0.4); folha.rotation.set(-Math.PI / 2, 0, 0.3);
    if (u < d * 0.5) camK(u, [[0, -21.5, 0.8, 3.0, -20.9, 0.0, 0.6, 48], [d * 0.5, -21.45, 0.7, 2.7, -20.9, 0.0, 0.6, 46]]);
    else camK(u - d * 0.5, [[0, -20.7, 0.55, 0.65, -20.85, 0.0, 0.4, 40], [d * 0.5, -20.82, 0.38, 0.5, -20.85, 0.0, 0.4, 32]]);
  };
  // 15 · guardo o desenho no livro
  S[14] = (u, d, t) => {
    luz(1.5, 1.1, '#10131c'); pe(MENINO, 0, 0, 0.75, Math.PI); MENINO.g.rotation.y = Math.PI; respira(MENINO, t);
    const g = T.janela(u, 0.3, d * 0.7); MENINO.mao('D', [-0.1, 0.82, 0.3], [-1, -1, 0]); MENINO.mao('E', [0.12, 0.82, 0.3]);
    livro.visible = true; livro.position.set(0, 0.79, 0.2); livroTampa.rotation.z = -2.6 * (1 - g);
    folha.visible = true; folha.position.set(-0.05, 0.8 + 0.05 * (1 - g), 0.2 + 0.25 * (1 - g)); folha.rotation.set(-Math.PI / 2, 0, 0); folha.scale.setScalar(1 - 0.0 * g);
    MENINO.olhar(Math.sin(u * 2) * 0.8, -0.5); MENINO.cabeca.rotation.y = 0.35 * Math.sin(u * 1.5) * T.janela(u, d * 0.6, d);
    camK(u, [[0, 0.6, 1.4, -0.7, 0, 0.85, 0.3, 48], [d, 0.5, 1.3, -0.55, 0, 0.85, 0.3, 44]]);
  };
  // 16 · ambulância: luzes no corredor, vó na maca
  S[15] = (u, d, t) => {
    luz(0.7, 0.2, '#0b0d12'); const pis = Math.sin(t * 9) > 0; flash.color.set(pis ? 0xff2020 : 0x2050ff); flash.intensity = 9; flash.position.set(-19.2, -28.3, 1.6);
    pe(VO, -19.4, -29.0, 1.55, 0); VO.g.rotation.x = -Math.PI / 2; VO.pisca(0.9); respira(VO, t);
    pe(MAE, -20.3, -30, 1.1, 0.9); respira(MAE, t, 2); MAE.mao('D', [-0.1, 1.0, 0.35]); MAE.cenho(-0.7); MAE.olhar(1, -0.4);
    pe(MENINO, -20.4, -30, 2.3, 0.6); respira(MENINO, t, 4); MENINO.cenho(-0.8); MENINO.olhar(1, -0.2);
    camK(u, [[0, -21.5, -28.4, 4.6, -19.9, -29.3, 1.0, 56], [d, -21.4, -28.5, 4.1, -19.9, -29.3, 1.0, 52]]);
  };
  // 17 · close: a vó, na maca, levanta a chave pra mim
  S[16] = (u, d, t) => {
    luz(0.8, 0.25, '#0b0d12'); const pis = Math.sin(t * 9) > 0; flash.color.set(pis ? 0xff2020 : 0x2050ff); flash.intensity = 6; flash.position.set(-19.0, -28.4, 1.8);
    pe(VO, -19.4, -29.0, 1.55, 0); VO.g.rotation.x = -Math.PI / 2; respira(VO, t); VO.pisca(T.clamp(0.9 - 0.6 * T.janela(u, 0.4, 1.0))); VO.boca(u > d * 0.55 ? 0.15 + 0.2 * Math.abs(Math.sin(t * 7)) : 0); VO.cabeca.rotation.y = -0.6; VO.olhar(-1, 0);
    const ent = T.janela(u, 0.3, d * 0.45); VO.mao('E', [T.lerp(0.25, -0.05, ent), T.lerp(0.9, 1.15, ent), T.lerp(0.15, 0.45, ent)], [1, 0, 0]);
    const wk = new V3(); VO.br.E.mao.getWorldPosition(wk); chaveMao.visible = true; chaveMao.position.copy(wk).add(new V3(0, 0.06, 0)); chaveMao.rotation.set(0, 0.4, Math.sin(t * 3) * 0.2);
    pe(MENINO, -20.05, -30, 0.55, Math.PI / 2 - 0.2); respira(MENINO, t, 4); MENINO.cenho(-0.8); MENINO.olhar(0, -0.3);
    const ent2 = T.janela(u, d * 0.35, d * 0.6); maoMundo(MENINO, 'D', [T.lerp(-20.05, wk.x - 0.05, ent2), T.lerp(-29.35, wk.y + 0.02, ent2), T.lerp(1.3, wk.z, ent2)], [0, -1, 0]);
    camK(u, [[0, -20.2, -28.4, 1.5, -19.4, -28.85, 0.45, 46], [d, -20.1, -28.5, 1.3, -19.4, -28.85, 0.45, 40]]);
  };
  // 18 · mãe vai com ela; a vizinha fica
  S[17] = (u, d, t) => {
    luz(1.2, 0.5, '#181c22'); const sai = T.janela(u, 0, d * 0.8);
    pe(MAE, -19.6 + 0.0, -30, 0.2 + 3.2 * sai, 0); MAE.anda(u * 1.6, 0.35 * (1 - T.janela(u, d * 0.8, d * 0.85)));
    pe(SIND, -20.9, -30, 0.4, 0.5); respira(SIND, t); SIND.boca(u > d * 0.35 ? 0.2 + 0.25 * Math.abs(Math.sin(t * 10)) : 0); SIND.mao('D', [-0.2, 1.05, 0.25]);
    pe(MENINO, -20.5, -30, 1.3, 2.6); respira(MENINO, t, 2); MENINO.cenho(-0.6); MENINO.cabeca.rotation.y = 0.3;
    camK(u, [[0, -21.3, -28.5, 4.8, -20.2, -29.2, 1.0, 56], [d, -21.25, -28.55, 4.4, -20.2, -29.2, 1.2, 54]]);
  };
  // 19 · relógio 21h; o prato vazio no balcão; eu esqueço
  S[18] = (u, d, t) => {
    luz(1.0, 0.6, '#10131c'); AP12.hora = 21 + T.clamp(u / d) * 0.5; AP12.relogio.userData.redesenha();
    PRATO.position.set(-2.4, 0.95, -2.2); PRATO.visible = true; PRATO.userData.comida.visible = false;
    pe(MENINO, 2.55, 0.62, 1.45, 0); MENINO.g.rotation.x = -Math.PI / 2; respira(MENINO, t); MENINO.mao('D', [-0.06, 1.2, 0.42]); MENINO.mao('E', [0.06, 1.2, 0.42]); MENINO.olhar(0, 1);
    celMao.visible = true; const wm = new V3(); MENINO.br.D.mao.getWorldPosition(wm); const wm2 = new V3(); MENINO.br.E.mao.getWorldPosition(wm2); celMao.position.copy(wm).lerp(wm2, 0.5).add(new V3(0, 0.02, 0)); celMao.rotation.set(Math.PI / 2, 0, 0);
    camK(u, [[0, -0.4, 2.05, -1.6, -0.4, 2.05, -2.5, 34], [d * 0.3, -0.4, 2.0, -1.4, -0.4, 1.9, -2.5, 40], [d * 0.6, -1.4, 1.5, -0.6, -2.4, 0.95, -2.2, 42], [d, 0.6, 1.4, 2.6, 2.3, 0.8, 0.6, 46]]);
  };
  // 20 · teto: toc toc sem ninguém bater primeiro
  S[19] = (u, d, t) => {
    luz(0.4, 0.1, '#03040a'); quartoNoite(t);
    pe(MENINO, -1.15, 0.55, -11.7, 0); MENINO.g.rotation.x = -1.4; MENINO.g.position.z = -12.4; respira(MENINO, t); MENINO.olhar(0, 1); MENINO.cenho(-0.8);
    CAMA_M.cob.scale.y = 3; CAMA_M.cob.position.z = 0.25; CAMA_M.cob.scale.z = 1.15; const f = u / d;
    const TK = D.toc20 || []; let b = 0; TK.forEach((x) => { b += Math.exp(-Math.pow((t - x) * 10, 2)); }); const t2 = TK[2] || (INI[19] + d * 0.45);
    Qlustre.rotation.z = 0.25 * b + 0.05 * Math.sin(u * 8) * T.janela(t, t2, t2 + 0.3); poeiraCai(t, t > t2, -0.5, -12.4);
    const sh = b * 0.03 * (t > t2 ? 1.8 : 1);
    camK(u, [[0, -1.0 + sh, 0.75, -11.0, -0.2, 2.7, -12.4, 60], [d, -1.0 + sh, 0.7, -11.2, -0.1, 2.75, -12.5, 52]]);
  };
  // 21 · apagão
  S[20] = (u, d, t) => {
    luz(0.4, 0.1, '#03040a'); quartoNoite(t); pe(MENINO, -1.15, 0.55, -11.7, 0); MENINO.g.rotation.x = -1.4; MENINO.g.position.z = -12.4; MENINO.olhar(0, 1); CAMA_M.cob.scale.y = 3; CAMA_M.cob.position.z = 0.25; CAMA_M.cob.scale.z = 1.15;
    camK(u, [[0, -1.0, 0.7, -11.2, -0.1, 2.75, -12.5, 52], [d, -1.0, 0.7, -11.2, -0.1, 2.75, -12.5, 52]]);
    veu.material.opacity = u > 0.5 ? 1 : 0;
  };
  // 22 · subo a escada no escuro com o prato e a chave
  S[21] = (u, d, t) => {
    luz(0.12, 0.0, '#000000'); const s = T.janela(u, 0, d * 0.9);
    pe(MENINO, -21.1, -1.53 + 1.53 * s, 3.6 - 2.9 * s, Math.PI); MENINO.anda(u * 1.4, 0.4 * (1 - T.janela(u, d * 0.85, d * 0.95))); respira(MENINO, t);
    MENINO.mao('E', [0.1, 0.78, 0.3], [1, -1, 0]); pratoNa(MENINO, 'E', true); MENINO.mao('D', [-0.18, 0.95, 0.3], [-1, -1, 0]);
    const wm = new V3(); MENINO.g.getWorldPosition(wm); lanternaEm(MENINO, 'D', [-20.3, 0.9, -1.5], 40);
    camK(u, [[0, -21.6, 0.3, 5.2, -20.6, 0.1, 0.0, 55], [d, -21.4, 1.2, 2.6, -20.4, 0.9, -1.5, 52]]);
  };
  // 23 · embaixo da tinta, uma fechadura
  S[22] = (u, d, t) => {
    luz(0.12, 0.0, '#000000'); ESC.raspa = T.janela(u, 0.3, d * 0.7); ESC.portaTela.userData.redesenha();
    pe(MENINO, -19.8, 0, -0.75, Math.PI); MENINO.mao('D', [-0.05 + 0.02 * Math.sin(u * 30) * (u < d * 0.7), 0.82, 0.32], [-1, -1, 0]); respira(MENINO, t);
    spot.position.set(-19.6, 1.2, 0.2); spot.target.position.set(-19.8, 1.05, -1.47); spot.intensity = 9; lanterna.visible = false;
    camK(u, [[0, -19.35, 1.3, -0.3, -19.83, 1.05, -1.47, 40], [d, -19.5, 1.2, -0.65, -19.83, 1.05, -1.47, 32]]);
  };
  // 24 · lá dentro: igual a nossa casa, parado no tempo (1987)
  S[23] = (u, d, t) => {
    luz(0.22, 0.0, '#000000'); const e = T.janela(u, 0, d * 0.6);
    const p = [30 + 2.6, 1.2, 2.1 + 1.2 * (1 - e)];
    camK(u, [[0, 32.6, 1.3, 3.4, 29.5, 1.1, -1.5, 55], [d * 0.6, 32.4, 1.25, 2.2, 28.5, 1.2, -1.5, 52], [d, 31.9, 1.4, 1.2, 27.3, 1.65, -2.5, 40]]);
    spot.position.copy(T.cam.position).add(new V3(0.15, -0.2, 0)); const dir = new V3(); T.cam.getWorldDirection(dir); spot.target.position.copy(T.cam.position).add(dir.multiplyScalar(3)); spot.intensity = 40;
  };
  // 25 · parede cheia de desenhos, todos de mim
  S[24] = (u, d, t) => {
    luz(0.2, 0.0, '#000000');
    camK(u, [[0, 28.6, 1.4, 0.6, 26.9, 1.45, -1.4, 50], [d, 28.4, 1.4, -0.4, 26.9, 1.5, 1.6, 54]]);
    const varr = T.chaves([[0, -1.6], [d, 1.4]], u); spot.position.copy(T.cam.position); spot.target.position.set(26.9, 1.5 + 0.15 * Math.sin(u * 2), varr); spot.intensity = 40;
  };
  // 26 · a cadeira de balanço ainda mexendo; xícara fumegando
  S[25] = (u, d, t) => {
    luz(0.25, 0.0, '#000000'); balanco.userData.b.rotation.x = 0.18 * Math.sin(u * 2.4) * Math.exp(-u * 0.15);
    fumaca.forEach((f, k) => { const ff = (u * 0.4 + k / 6) % 1; f.visible = true; f.position.set(0.25 + Math.sin(ff * 6 + k) * 0.03, 0.9 + ff * 0.35, 0.3); f.scale.setScalar(0.6 + ff); f.material.opacity = 0.5 * (1 - ff); });
    camK(u, [[0, 31.2, 1.3, 0.4, 32.2, 0.55, -1.2, 60], [d * 0.55, 31.35, 1.2, 0.15, 32.2, 0.55, -1.2, 52], [d, 30.6, 1.05, 1.3, 30.25, 0.85, 0.3, 36]]);
    spot.position.copy(T.cam.position); const dir = new V3(); T.cam.getWorldDirection(dir); spot.target.position.copy(T.cam.position).add(dir.multiplyScalar(2)); spot.intensity = 30;
  };
  // 27 · a foto: a vó novinha com duas bebês iguais
  S[26] = (u, d, t) => {
    luz(0.25, 0.0, '#000000');
    camK(u, [[0, 31.6, 1.6, -1.2, 31.6, 1.5, -2.3, 44], [d * 0.5, 31.6, 1.52, -1.75, 31.6, 1.5, -2.3, 40], [d, 31.6, 1.51, -1.9, 31.6, 1.49, -2.3, 36]]);
    spot.position.copy(T.cam.position).add(new V3(0.1, 0.1, 0.2)); spot.target.position.set(31.6, 1.5, -2.3); spot.intensity = 30;
  };
  // 28 · do quarto escuro, alguém canta a música da vó; largo o prato e corro
  S[27] = (u, d, t) => {
    luz(0.22, 0.0, '#000000'); const corre = T.janela(u, d * 0.62, d * 0.68);
    notasEm(t, 32.4, 1.0, -2.3, 6, 1.2); notas.forEach((m) => { m.position.z += 0.25; });
    pe(MENINO, 31.4 + 0.0, 0, -0.6 + 3.5 * T.janela(u, d * 0.65, d), Math.PI - Math.PI * corre); respira(MENINO, t);
    MENINO.anda(u * 2.6, 0.55 * corre); MENINO.cabeca.rotation.y = 0.5 * (1 - corre);
    if (corre < 0.5) { MENINO.mao('E', [0.1, 0.78, 0.3], [1, -1, 0]); pratoNa(MENINO, 'E', true); } else { PRATO.visible = true; PRATO.position.set(31.5, 0.01, -0.5); PRATO.rotation.z = 0.0; }
    camK(u, [[0, 30.6, 1.3, 1.2, 32.4, 1.0, -2.5, 50], [d * 0.6, 30.7, 1.25, 0.9, 32.4, 1.0, -2.5, 42], [d, 31.0, 1.0, 3.3, 31.4, 0.8, 0.0, 55]]);
    spot.position.set(31.4, 1.0, -0.4); spot.target.position.set(32.4, 1.0, -2.5); spot.intensity = 25 * (1 - corre);
  };
  // 29 · a luz volta; a mãe está em casa
  S[28] = (u, d, t) => {
    luz(1.5, 1.1, '#10131c'); veu.material.opacity = 1 - T.janela(u, 0, 0.25);
    pe(MENINO, 2.4, 0, 1.9, -Math.PI / 2 - 0.3); respira(MENINO, t * 2.4); MENINO.tronco.rotation.x = 0.25; MENINO.boca(0.4); MENINO.cenho(-0.7);
    const ap = T.janela(u, d * 0.3, d * 0.55); pe(MAE, -1.3 + 1.3 * ap, 0, -1.2 + 0.6 * ap, Math.PI / 2 - 0.3); MAE.anda(u * 1.4, 0.3 * (ap > 0.02 && ap < 0.98)); MAE.boca(u > d * 0.6 ? 0.15 + 0.15 * Math.abs(Math.sin(t * 9)) : 0.08); MAE.cabeca.rotation.y = 0.1;
    respira(MAE, t, 1);
    camK(u, [[0, 2.2, 1.4, 5.0, 0.8, 1.0, -0.4, 58], [d, 2.25, 1.35, 4.6, 0.7, 1.0, -0.4, 54]]);
  };
  // 30 · ela me põe pra dormir e canta (de costas)
  S[29] = (u, d, t) => {
    luz(0.45, 0.1, '#03040a'); quartoNoite(t);
    pe(MENINO, -1.15, 0.55, -11.7, 0); MENINO.g.rotation.x = -1.4; MENINO.g.position.z = -12.4; respira(MENINO, t); MENINO.olhar(0.5, 0.4); CAMA_M.cob.scale.y = 3; CAMA_M.cob.position.z = 0.25; CAMA_M.cob.scale.z = 1.15;
    pe(MAE, -0.3, 0, -11.75, -Math.PI / 2 - 0.15); respira(MAE, t, 1); MAE.tronco.rotation.x = 0.4; MAE.solto('E'); maoMundo(MAE, 'D', [-0.85, 0.75, -12.15 + 0.06 * Math.sin(t * 2)], [-1, -1, 0]);
    MAE.cabeca.rotation.z = 0.12 * Math.sin(t * 1.2); notasEm(t, -0.6, 1.25, -11.6, 6, 0.8);
    camK(u, [[0, 1.2, 1.35, -9.4, -0.7, 0.85, -11.7, 50], [d, 1.0, 1.3, -9.8, -0.75, 0.85, -11.8, 46]]);
  };
  // 31 · close do meu rosto: a minha mãe não sabe essa música
  S[30] = (u, d, t) => {
    luz(0.4, 0.1, '#03040a'); quartoNoite(t);
    pe(MENINO, -1.15, 0.55, -11.7, 0); MENINO.g.rotation.x = -1.4; MENINO.g.position.z = -12.4; MENINO.pisca(0); MENINO.olhar(0.9 * T.janela(u, d * 0.3, d * 0.5), 0.1); MENINO.cenho(-0.9); CAMA_M.cob.scale.y = 3; CAMA_M.cob.position.z = 0.25; CAMA_M.cob.scale.z = 1.15;
    MENINO.tronco.scale.y = 1 + 0.006 * Math.sin(t * 6);
    const w = new V3(); MENINO.cabeca.getWorldPosition(w);
    camK(u, [[0, w.x + 0.1, w.y + 1.0, w.z + 0.45, w.x, w.y, w.z, 36], [d, w.x + 0.05, w.y + 0.75, w.z + 0.3, w.x, w.y, w.z, 30]]);
  };
  // 32 · elevador: o 13 acende sozinho
  S[31] = (u, d, t) => {
    luz(1.4, 1.0, '#20242c'); aperta14 = 0; acende13 = T.janela(u, d * 0.45, d * 0.55); painel.userData.redesenha();
    camK(u, [[0, -39.75, 1.3, -0.3, -39.15, 1.25, -0.3, 46], [d, -39.62, 1.28, -0.3, -39.15, 1.25, -0.3, 40]]);
  };

  // ============ acessórios usados nos planos ============
  const mesaSind = cx(0.8, 0.05, 0.5, '#7a5a3a', -20.75, -30 + 0.82, -0.2); const carimbo = cil(0.04, 0.05, 0.08, '#c0392b');
  const brilho = T.tela(0.18, 0.18, 64, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283, r = k % 2 ? w * 0.12 : w * 0.5; c.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } c.fill(); }, null, { transp: true });
  const folha = T.tela(0.3, 0.22, 192, (c, w, h) => desenhoCrianca(c, w, h, 'dorme', 99), null, { luz: true }); folha.material.side = THREE.DoubleSide;
  const livro = T.grupo(null); cx(0.3, 0.04, 0.22, '#2f6fb0', 0.15, 0, 0, livro); const livroTampa = T.grupo(livro); cx(0.3, 0.02, 0.22, '#2f6fb0', -0.15, 0, 0, livroTampa);
  const chaveMao = fazChave(null); chaveMao.scale.setScalar(1.2);
  const celMao = cx(0.07, 0.13, 0.01, '#22252b'); const celLuz = T.tela(0.06, 0.11, 32, (c, w, h) => { c.fillStyle = '#7ec3ff'; c.fillRect(0, 0, w, h); }, celMao); celLuz.position.z = 0.006;
  const quartoNoite = (t) => { Qjan.visible = true; };
  const poeiraCai = (t, on, x, z) => { poeira.forEach((p, k) => { p.visible = on; const f = (t * 0.5 + k / 14) % 1; p.position.set(x + Math.sin(k * 7) * 0.5, 2.68 - f * 1.6, z + Math.cos(k * 5) * 0.4); }); };
  const EXTRAS = [PRATO, lanterna, bengala, brilho, folha, livro, celMao, chaveMao, carimbo, mesaSind, ...poeira, ...notas, ...fumaca];
  mesaSind.visible = false;

  let ultimo = -1;
  T.cada((t) => {
    let k = 0; while (k + 1 < INI.length && t >= INI[k + 1]) k++;
    const d = (k + 1 < INI.length ? INI[k + 1] : DUR) - INI[k], u = t - INI[k];
    for (const P of TODOS) { P.g.visible = false; emPe(P); P.tronco.position.y = 0.78; }
    for (const e of EXTRAS) e.visible = false; mesaSind.visible = false; carimbo.visible = false;
    CAMA_M.cob.scale.y = 1; CAMA_M.cob.scale.z = 1; CAMA_M.cob.position.z = 0.33; CAMA_V.cob.scale.y = 1;
    spot.intensity = 0; flash.intensity = 0; veu.material.opacity = 0; Qlustre.rotation.z = 0; PRATO.rotation.set(0, 0, 0); folha.scale.setScalar(1);
    chaveVo.visible = k < 16;
    S[k](u, d, t);
    if (k === 4) carimbo.visible = true;
  });
  return { dur: DUR };
};
