// Teste 3D desenho (estilo da referência): quarto, mãe na porta, celular tocando "EU".
// Falas (início em s): a0 mãe 0.5 | a1 tu 3.9 | toque 7.4 | a2 tu 9.2 | toque no verde 12.0 | a3 alô 12.5 | a4 telefone 13.2
window.CENA = (T) => {
  const V3 = THREE.Vector3;
  T.cena.background = new THREE.Color('#cfd8de');
  // ---------- quarto: x -2.2..2.2, z -2.7..1.6, pé-direito 2.6 ----------
  const X0 = -2.2, X1 = 2.2, Z0 = -2.7, Z1 = 1.6, AL = 2.6;
  const parede = '#c6dbe6', paredeEsc = '#b5cedc';
  // piso de tábuas
  T.tela(X1 - X0, Z1 - Z0, 1024, (c, w, h) => {
    c.fillStyle = '#d4a877'; c.fillRect(0, 0, w, h);
    const n = 9; for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? '#cfa271' : '#dcb283'; c.fillRect(i * w / n, 0, w / n, h);
      c.fillStyle = '#9a7048'; c.fillRect(i * w / n, 0, 3, h); for (let k = 0; k < 4; k++) { const y = ((i * 137 + k * 311) % 1000) / 1000 * h; c.fillRect(i * w / n, y, w / n, 3); } }
  }, null, { luz: true }).rotation.x = -Math.PI / 2;
  const piso = T.cena.children[T.cena.children.length - 1]; piso.position.set(0, 0, (Z0 + Z1) / 2);
  // paredes
  const pf = T.caixa(X1 - X0, AL, 0.1, parede, null, { sem: true }); pf.position.set(0, AL / 2, Z0 - 0.05);
  const pe = T.caixa(0.1, AL, Z1 - Z0, paredeEsc, null, { sem: true }); pe.position.set(X0 - 0.05, AL / 2, (Z0 + Z1) / 2);
  const pd = T.caixa(0.1, AL, Z1 - Z0, paredeEsc, null, { sem: true }); pd.position.set(X1 + 0.05, AL / 2, (Z0 + Z1) / 2);
  const pt = T.caixa(X1 - X0, AL, 0.1, parede, null, { sem: true }); pt.position.set(0, AL / 2, Z1 + 0.05);
  const teto = T.caixa(X1 - X0, 0.1, Z1 - Z0, '#eef0ee', null, { sem: true }); teto.position.set(0, AL + 0.05, (Z0 + Z1) / 2);
  // rodapé e quinas
  for (const [a, b] of [[[X0, 0.06, Z0], [X1, 0.06, Z0]], [[X0, 0.06, Z0], [X0, 0.06, Z1]], [[X1, 0.06, Z0], [X1, 0.06, Z1]]]) {
    const r = T.linha(a, b, 0.12); r.material = T.mat('#f2efe8'); T.linha([a[0], 0.12, a[2]], [b[0], 0.12, b[2]], 0.014);
  }
  for (const p of [[X0, Z0], [X1, Z0]]) T.linha([p[0], 0, p[1]], [p[0], AL, p[1]], 0.016);
  T.linha([X0, AL, Z0], [X1, AL, Z0], 0.016); T.linha([X0, AL, Z0], [X0, AL, Z1], 0.016); T.linha([X1, AL, Z0], [X1, AL, Z1], 0.016);
  // luminária no teto
  const lum = T.caixa(1.2, 0.05, 0.22, '#ffffff', null); lum.position.set(0, AL - 0.03, -0.6);
  const lumL = T.caixa(1.1, 0.02, 0.14, T.basico('#fffbe8'), null, { sem: true }); lumL.position.set(0, AL - 0.06, -0.6);

  // porta (parede do fundo) com batente; folha aberta pra dentro
  const DX = 0.55, DW = 0.9, DH = 2.05;
  const vao = T.caixa(DW, DH, 0.02, '#3d3a36', null, { sem: true }); vao.position.set(DX, DH / 2, Z0 + 0.005);
  const corredor = T.caixa(DW, DH, 0.02, '#e8dcc0', null, { sem: true }); corredor.position.set(DX, DH / 2, Z0 - 0.6);
  const corrE = T.caixa(0.02, DH, 0.6, '#d9caa6', null, { sem: true }); corrE.position.set(DX - DW / 2, DH / 2, Z0 - 0.3);
  const corrD = T.caixa(0.02, DH, 0.6, '#d9caa6', null, { sem: true }); corrD.position.set(DX + DW / 2, DH / 2, Z0 - 0.3);
  const corrP = T.caixa(DW, 0.02, 0.6, '#cdb48a', null, { sem: true }); corrP.position.set(DX, 0.002, Z0 - 0.3);
  vao.visible = false;
  for (const [x, y, w, h] of [[DX - DW / 2 - 0.04, DH / 2, 0.08, DH + 0.08], [DX + DW / 2 + 0.04, DH / 2, 0.08, DH + 0.08], [DX, DH + 0.04, DW + 0.16, 0.08]]) {
    const b = T.caixa(w, h, 0.06, '#f4f1ea', null); b.position.set(x, y, Z0 + 0.03);
  }
  const dob = T.grupo(null, DX - DW / 2, 0, Z0 + 0.02);
  const folha = T.caixa(DW - 0.03, DH - 0.03, 0.045, '#c98b4f', dob); folha.position.set((DW - 0.03) / 2, DH / 2, 0);
  const mac = T.esfera(0.03, '#d8c060', folha); mac.position.set((DW - 0.03) / 2 - 0.1, 0, 0.04);
  dob.rotation.y = 1.25;

  // janela (parede esquerda) com cortinas vermelhas e céu
  const JZ = -1.2;
  const ceu = T.tela(1.1, 1.0, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8fc6ee'); g.addColorStop(1, '#d9eefb'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff'; for (const [x, y, r] of [[60, 70, 30], [95, 62, 38], [130, 74, 28], [190, 150, 22], [215, 142, 28]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
    c.fillStyle = '#7bb36a'; c.fillRect(0, h * 0.78, w, h); c.fillStyle = '#e9e2d0'; c.fillRect(30, h * 0.6, 60, 60); c.fillStyle = '#c0583e'; c.beginPath(); c.moveTo(22, h * 0.6); c.lineTo(60, h * 0.47); c.lineTo(98, h * 0.6); c.fill(); });
  ceu.rotation.y = Math.PI / 2; ceu.position.set(X0 + 0.005, 1.45, JZ);
  for (const [y, z, w, h] of [[1.45, JZ - 0.58, 0.07, 1.12], [1.45, JZ + 0.58, 0.07, 1.12], [0.92, JZ, 1.24, 0.07], [1.98, JZ, 1.24, 0.07], [1.45, JZ, 0.04, 1.0]]) {
    const b = T.caixa(0.06, h, w, '#ffffff', null); b.position.set(X0 + 0.03, y, z);
  }
  T.cada((t) => {}); // (placeholder)
  const cort = [];
  for (const s of [-1, 1]) { const c = T.caixa(0.06, 1.35, 0.32, '#c8343a', null); c.position.set(X0 + 0.1, 1.42, JZ + s * 0.72); cort.push(c); }
  const varao = T.cilindro(0.015, 0.015, 1.9, '#5a4a3a', null); varao.rotation.x = Math.PI / 2; varao.position.set(X0 + 0.1, 2.12, JZ);

  // relógio de parede 6:52
  const rel = T.tela(0.34, 0.34, 256, (c, w, h) => {
    c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 8, 0, 7); c.fill(); c.lineWidth = 12; c.strokeStyle = '#222'; c.stroke();
    c.fillStyle = '#222'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; c.fillRect(w / 2 + Math.sin(a) * 100 - 4, h / 2 - Math.cos(a) * 100 - 4, 8, 8); }
    const mao = (a, L, lw) => { c.lineWidth = lw; c.lineCap = 'round'; c.beginPath(); c.moveTo(w / 2, h / 2); c.lineTo(w / 2 + Math.sin(a) * L, h / 2 - Math.cos(a) * L); c.stroke(); };
    mao((6 + 52 / 60) / 12 * 6.283, 60, 12); mao(52 / 60 * 6.283, 92, 8);
  });
  rel.position.set(-0.75, 1.95, Z0 + 0.01);
  // pôster (parede do fundo) e quadro de cortiça
  const poster = T.tela(0.5, 0.7, 256, (c, w, h) => { c.fillStyle = '#1d2a4a'; c.fillRect(0, 0, w, h); c.fillStyle = '#f5c542'; c.beginPath(); c.arc(w / 2, h * 0.4, 70, 0, 7); c.fill();
    c.fillStyle = '#e8eef8'; c.font = 'bold 44px sans-serif'; c.textAlign = 'center'; c.fillText('SPACE', w / 2, h * 0.8); c.lineWidth = 10; c.strokeStyle = '#fff'; c.strokeRect(5, 5, w - 10, h - 10); });
  poster.position.set(-1.55, 1.5, Z0 + 0.01);
  // escrivaninha + cadeira (parede direita)
  const mesa = T.caixa(0.6, 0.05, 1.1, '#e7dcc8', null); mesa.position.set(X1 - 0.32, 0.75, -1.3);
  for (const [dx, dz] of [[-0.25, -0.5], [-0.25, 0.5], [0.25, -0.5], [0.25, 0.5]]) { const p = T.caixa(0.05, 0.75, 0.05, '#e7dcc8', null); p.position.set(X1 - 0.32 + dx, 0.375, -1.3 + dz); }
  const livros = [['#d84c3c', 0.06], ['#3c7bd8', 0.05], ['#e8b339', 0.07], ['#4caf6a', 0.05]];
  let lz = -1.7; for (const [cor, w] of livros) { const l = T.caixa(0.2, 0.26, w, cor, null); l.position.set(X1 - 0.2, 0.9, lz); lz += w + 0.005; }
  const lamp = T.cilindro(0.06, 0.09, 0.03, '#333', null); lamp.position.set(X1 - 0.3, 0.79, -0.95);
  const haste = T.cilindro(0.012, 0.012, 0.35, '#333', null); haste.position.set(X1 - 0.3, 0.96, -0.95);
  const cupula = T.cilindro(0.05, 0.11, 0.12, '#2f8f4e', null); cupula.position.set(X1 - 0.3, 1.15, -0.95);
  const cad = T.caixa(0.42, 0.05, 0.42, '#3c4a5c', null); cad.position.set(X1 - 0.75, 0.45, -1.2);
  const enc = T.caixa(0.05, 0.45, 0.42, '#3c4a5c', null); enc.position.set(X1 - 0.53, 0.7, -1.2);
  for (const [dx, dz] of [[-0.18, -0.18], [-0.18, 0.18], [0.18, -0.18], [0.18, 0.18]]) { const p = T.cilindro(0.015, 0.015, 0.45, '#222', null); p.position.set(X1 - 0.75 + dx, 0.225, -1.2 + dz); }
  // mochila no chão e tênis (procurando)
  const tenis = (x, z, ry) => { const g = T.grupo(null, x, 0, z); g.rotation.y = ry;
    const sola = T.capsula(0.045, 0.16, '#f5f5f5', g); sola.rotation.x = Math.PI / 2; sola.position.y = 0.035; sola.scale.set(1.15, 1, 0.6);
    const cima = T.esfera(0.075, '#e14b4b', g); cima.scale.set(0.72, 0.5, 1.3); cima.position.set(0, 0.06, -0.01);
    const cano = T.cilindro(0.045, 0.05, 0.06, '#e14b4b', g); cano.position.set(0, 0.09, -0.07);
    const furo = T.cilindro(0.032, 0.032, 0.01, '#3a1d1d', g, { sem: true }); furo.position.set(0, 0.122, -0.07);
    const cad = T.caixa(0.06, 0.008, 0.05, '#ffffff', g, { sem: true }); cad.position.set(0, 0.098, 0.03); cad.rotation.x = -0.4;
    return g; };
  tenis(0.75, -0.35, 0.6); tenis(0.95, -0.55, 2.2);

  // cama (a gente tá sentado na beirada; aparece embaixo à esquerda)
  const cama = T.caixa(1.0, 0.42, 2.0, '#e9e4da', null); cama.position.set(-1.65, 0.21, 0.2);
  const colch = T.caixa(1.0, 0.16, 2.0, '#3d6fb3', null); colch.position.set(-1.65, 0.5, 0.2);
  const trav = T.caixa(0.6, 0.18, 0.35, '#f7f3ea', null); trav.position.set(-1.7, 0.66, -0.55); trav.rotation.y = 0.1;
  const cabe = T.caixa(1.08, 1.0, 0.08, '#8c6a4c', null); cabe.position.set(-1.65, 0.5, -0.84);
  const cober = T.caixa(1.04, 0.05, 1.2, '#2f5c98', null); cober.position.set(-1.62, 0.6, 0.55);

  // ---------- mãe ----------
  const mae = T.pessoa({ pele: '#eab994', cabelo: '#4a2d1a', roupa: '#8a5cc8', saia: true, sapato: '#3a2a2a' });
  const MZ = Z0 + 0.75; mae.g.position.set(DX - 0.1, 0, MZ);
  // ---------- POV: sentado na beirada da cama ----------
  const V = T.pov({ x: -0.95, y: 1.12, z: 0.45, sentado: true });
  const yawMae = Math.atan2(-(DX - 0.1 + 0.95), -(MZ - 0.45)); // yaw pra olhar a mãe
  mae.g.rotation.y = Math.atan2(-0.95 - DX + 0.1, 0.45 - MZ);

  const A0 = 0.5, A1 = 3.9, TOQ = 7.4, A2 = 9.2, VERDE = 12.0, A3 = 12.5, A4 = 13.2, DUR = 16.0;
  T.cada((t) => {
    // mãe: bate no relógio enquanto grita, depois mão na cintura
    mae.piscaAuto(t, 0.7);
    const fala = Math.max(T.boca('a0', A0, t), T.boca('a1m', -9, t));
    mae.boca(fala * 1.4);
    mae.cenho(t < 7 ? 0.9 : 0.3);
    mae.olhar(0, 0);
    mae.cabeca.rotation.set(0.05 + 0.05 * fala, 0, Math.sin(t * 1.3) * 0.04);
    mae.tronco.rotation.z = Math.sin(t * 0.9) * 0.015;
    const tap = t > A0 - 0.2 && t < A0 + 3.3 ? Math.abs(Math.sin((t - A0) * 7)) : 0;
    const relogio = [0.06, 1.12, 0.2];
    mae.mao('E', relogio, [1, -0.5, -0.4]);
    if (t < A0 + 3.6) mae.mao('D', [relogio[0] - 0.03, relogio[1] + 0.05 + tap * 0.04, relogio[2] + 0.04], [-1, -0.4, -0.5]);
    else { const u = T.janela(t, A0 + 3.6, A0 + 4.3); mae.mao('D', [T.lerp(0.03, -0.2, u), T.lerp(1.2, 1.0, u), T.lerp(0.24, 0.05, u)], [-1, 0, -0.6]); }
    if (t > A0 + 3.6) { const u = T.janela(t, A0 + 3.6, A0 + 4.3); mae.mao('E', [T.lerp(0.06, 0.2, u), T.lerp(1.12, 1.0, u), T.lerp(0.2, 0.05, u)], [1, 0, -0.6]); }

    // cabeça (câmera): olha a mãe -> procura o tênis no chão -> olha o celular
    const respira = Math.sin(t * 1.6) * 0.01;
    const yaw = T.chaves([[0, yawMae], [A1, yawMae], [A1 + 1.0, yawMae - 0.75], [A1 + 2.2, yawMae - 0.95], [TOQ + 0.2, yawMae - 0.9], [TOQ + 1.0, yawMae - 0.25], [DUR, yawMae - 0.22]], t);
    const pitch = T.chaves([[0, -0.16], [A1, -0.14], [A1 + 1.0, -0.62], [A1 + 2.2, -0.55], [TOQ + 0.2, -0.5], [TOQ + 1.0, -0.42], [A4, -0.44], [DUR, -0.5]], t) + respira;
    const treme = t > A4 ? 0.004 * Math.sin(t * 37) : 0;
    V.olhar(yaw + treme, pitch, Math.sin(t * 0.8) * 0.01);
    // celular: sobe pra frente do rosto quando toca
    const sobe = T.janela(t, TOQ + 0.1, TOQ + 0.9);
    const vib = t > TOQ && t < VERDE + 0.2 ? 0.0025 * Math.sin(t * 160) : 0;
    const perto = T.janela(t, A4, DUR) * 0.04;
    V.cel.position.set(T.lerp(0.05, 0.0, sobe) + vib, T.lerp(-0.7, -0.17, sobe) + respira * 0.5, T.lerp(-0.2, -0.3 + perto, sobe));
    V.cel.rotation.set(T.lerp(-0.9, -0.42, sobe), T.lerp(0.3, 0.02, sobe), T.lerp(0.4, -0.04, sobe));
    V.cel.visible = sobe > 0.001; V.bE.ombro.visible = V.cel.visible;
    V.celTela(t < VERDE + 0.15 ? 'tocando' : 'chamada', t < VERDE + 0.15 ? t : t - VERDE);
    // dedo direito aperta o verde
    const ida = T.janela(t, VERDE - 0.9, VERDE - 0.1), volta = 1 - T.janela(t, VERDE + 0.4, VERDE + 1.1);
    const toque = T.janela(t, VERDE - 0.15, VERDE) * (1 - T.janela(t, VERDE + 0.1, VERDE + 0.3));
    V.dedo(Math.min(ida, volta), V.botaoVerde, toque);
    V.bracos();
    // cortina balança
    cort.forEach((c, i) => { c.rotation.x = Math.sin(t * 1.1 + i) * 0.03; });
  });
  return { dur: DUR };
};
