// Parte 1, cena do QUARTO (3D desenho). Tempos vêm de dados_quarto.json (tl.py).
// 
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
  const V = T.pov({ x: -0.95, y: 1.12, z: 0.45, sentado: true });
  const olhaPara = (x, z) => Math.atan2(-(x + 0.95), -(z - 0.45));
  const TL = window.DADOS.tl, DUR = window.DADOS.dur;
  const E = (k) => TL[k];
  // céu escurece depois que a mãe fala da chuva
  const ceuF = (esc) => (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, esc ? '#5d6670' : '#8fc6ee'); g.addColorStop(1, esc ? '#9aa3ab' : '#d9eefb'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = esc ? '#454c55' : '#fff'; for (const [x, y, r] of [[60, 70, 30], [95, 62, 38], [130, 74, 28], [190, 150, 22], [215, 142, 28], [30, 120, 26], [160, 110, 34]]) { if (!esc && y > 100 && x < 170) continue; c.beginPath(); c.arc(x, y, r * (esc ? 1.4 : 1), 0, 7); c.fill(); }
    c.fillStyle = '#7bb36a'; c.fillRect(0, h * 0.78, w, h); c.fillStyle = '#e9e2d0'; c.fillRect(30, h * 0.6, 60, 60); c.fillStyle = '#c0583e'; c.beginPath(); c.moveTo(22, h * 0.6); c.lineTo(60, h * 0.47); c.lineTo(98, h * 0.6); c.fill(); };
  let ceuEsc = false;

  T.cada((t) => {
    // ---- mãe ----
    mae.piscaAuto(t, 0.7);
    const fala = Math.max(T.boca('a0', E('a0'), t), T.boca('m1', E('m1'), t), T.boca('m2', E('m2'), t));
    mae.boca(fala * 1.4);
    const preocupada = t > E('OLHAMAE') - 1;
    mae.cenho(preocupada ? -0.6 : (t < E('a1') + 2 ? 0.9 : 0.3));
    mae.cabeca.rotation.set(0.05 + 0.05 * fala, 0, Math.sin(t * 1.3) * 0.04 + (preocupada ? 0.12 : 0));
    // anda até perto da cama durante a ligação (fora de quadro)
    const chega = T.janela(t, E('DESLIGA') + 0.2, E('OLHAMAE') + 0.6);
    mae.anda(t * 1.4, 0.35 * Math.sin(Math.PI * T.clamp((t - E('DESLIGA') - 0.2) / (E('OLHAMAE') + 0.4 - E('DESLIGA')))));
    const mx = T.lerp(DX - 0.1, 0.05, chega), mz = T.lerp(MZ, -0.95, chega);
    mae.g.position.set(mx, 0, mz); mae.g.rotation.y = Math.atan2(-0.95 - mx, 0.45 - mz);
    const tap = t > E('a0') - 0.2 && t < E('a0') + 3.0 ? Math.abs(Math.sin((t - E('a0')) * 7)) : 0;
    const relogio = [0.06, 1.12, 0.2];
    if (t < E('a0') + 3.3) {
      mae.mao('E', relogio, [1, -0.5, -0.4]);
      mae.mao('D', [relogio[0] - 0.03, relogio[1] + 0.05 + tap * 0.04, relogio[2] + 0.04], [-1, -0.4, -0.5]);
    } else if (t < E('m1') - 0.3) {
      const u = T.janela(t, E('a0') + 3.3, E('a0') + 4.0);
      mae.mao('E', [T.lerp(0.06, 0.2, u), T.lerp(1.12, 1.0, u), T.lerp(0.2, 0.05, u)], [1, 0, -0.6]);
      mae.mao('D', [T.lerp(0.03, -0.2, u), T.lerp(1.17, 1.0, u), T.lerp(0.24, 0.05, u)], [-1, 0, -0.6]);
    } else {
      // preocupada: mãos juntas na frente; no "leva o guarda-chuva" aponta pra janela
      const ap = T.janela(t, E('m2') + 0.3, E('m2') + 0.9) * (1 - T.janela(t, E('FIM') - 0.4, E('FIM')));
      mae.mao('E', [0.05, 1.05, 0.2], [1, -0.3, -0.5]);
      const pj = mae.g.worldToLocal(new THREE.Vector3(-2.2, 1.6, -1.2)).sub(new THREE.Vector3(-0.19, 1.33, 0)).normalize().multiplyScalar(0.5).add(new THREE.Vector3(-0.19, 1.33, 0));
      mae.mao('D', [T.lerp(-0.05, pj.x, ap), T.lerp(1.07, pj.y, ap), T.lerp(0.21, pj.z, ap)], [-1, -0.6, -0.3]);
    }
    // ---- cabeça (câmera) ----
    const yM = olhaPara(mx, mz), respira = Math.sin(t * 1.6) * 0.01;
    const yawJ = olhaPara(-2.2, -1.2);
    const yaw = T.chaves([[0, yM], [E('a1'), yM], [E('a1') + 1.0, yM - 0.75], [E('a1') + 2.2, yM - 0.95], [E('TOQ') + 0.2, yM - 0.9], [E('SOBE') + 0.8, olhaPara(DX - 0.1, MZ) - 0.25],
      [E('OLHAMAE'), olhaPara(DX - 0.1, MZ) - 0.25], [E('OLHAMAE') + 0.9, yM], [E('m2') + 1.0, yM], [E('JANELA') + 0.9, yawJ], [DUR, yawJ - 0.04]], t);
    const pitch = T.chaves([[0, -0.16], [E('a1'), -0.14], [E('a1') + 1.0, -0.62], [E('a1') + 2.2, -0.55], [E('TOQ') + 0.2, -0.5], [E('SOBE') + 0.8, -0.42],
      [E('OLHAMAE'), -0.44], [E('OLHAMAE') + 0.9, 0.02], [E('m2') + 1.0, 0.02], [E('JANELA') + 0.9, 0.12], [DUR, 0.12]], t) + respira;
    const tel = (k) => t > E(k) && t < E(k) + window.DADOS.ev[k].d;
    const treme = (tel('a4') || tel('a6') || tel('t1')) ? 0.004 * Math.sin(t * 37) : 0;
    V.olhar(yaw + treme, pitch, Math.sin(t * 0.8) * 0.01);
    // ---- celular ----
    const sobe = T.janela(t, E('SOBE') - 0.3, E('SOBE') + 0.6) * (1 - T.janela(t, E('OLHAMAE'), E('OLHAMAE') + 0.8));
    const vib = t > E('TOQ') && t < E('VERDE') + 0.2 ? 0.0025 * Math.sin(t * 160) : 0;
    const perto = T.janela(t, E('a4'), E('DESLIGA')) * 0.05;
    V.cel.position.set(T.lerp(0.05, 0.0, sobe) + vib, T.lerp(-0.7, -0.17, sobe) + respira * 0.5, T.lerp(-0.2, -0.3 + perto, sobe));
    V.cel.rotation.set(T.lerp(-0.9, -0.42, sobe), T.lerp(0.3, 0.02, sobe), T.lerp(0.4, -0.04, sobe));
    V.cel.visible = sobe > 0.001; V.bE.ombro.visible = V.cel.visible;
    if (t < E('VERDE') + 0.15) V.celTela('tocando', t);
    else if (t < E('DESLIGA')) V.celTela('chamada', t - E('VERDE'));
    else V.celTela('encerrada', 0);
    const ida = T.janela(t, E('VERDE') - 0.9, E('VERDE') - 0.1), volta = 1 - T.janela(t, E('VERDE') + 0.4, E('VERDE') + 1.1);
    const toque = T.janela(t, E('VERDE') - 0.15, E('VERDE')) * (1 - T.janela(t, E('VERDE') + 0.1, E('VERDE') + 0.3));
    V.dedo(Math.min(ida, volta), V.botaoVerde, toque);
    V.bracos();
    // ---- janela: céu fecha ----
    const esc = t > E('m2') + 1.5;
    if (esc !== ceuEsc) { ceuEsc = esc; ceu.userData.f(ceuF(esc)); ceu.userData.redesenha(); }
    cort.forEach((c, i) => { c.rotation.x = Math.sin(t * (esc ? 2.4 : 1.1) + i) * (esc ? 0.07 : 0.03); });
  });
  return { dur: DUR };
};
