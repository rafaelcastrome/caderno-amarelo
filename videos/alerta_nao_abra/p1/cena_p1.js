// Alerta: não abra · parte 1. Praça de alimentação -> corredor e porta de vidro -> fuga -> escada de serviço -> corredor de concreto -> depósito.
// Tempos em dados_p1.json (tl_p1.py). Mundo: praça em volta da origem; corredor das lojas ao longo de -Z (x -4..4, z -6..-24, vidro em z=-24);
// porta SOMENTE FUNCIONÁRIOS na parede x=4, z=-10; escada desce ao longo de +X até y=-3.6; corredor de serviço x 10..18; depósito x 18..26.
window.CENA = (T) => {
  const V3 = THREE.Vector3;
  const D = window.DADOS, TL = D.tl, DUR = D.dur, EV = D.ev;
  const E = (k) => TL[k], FIM = (k) => TL[k] + EV[k].d;
  const hemi = T.cena.children.find((o) => o.isHemisphereLight);
  T.cena.background = new THREE.Color('#1a1e26');
  T.fisheye.vin.value = 0.42;
  const B = -3.6; // piso do subsolo

  // ---------- utilidades ----------
  const cx = (w, h, d, cor, x, y, z, pai, o) => { const m = T.caixa(w, h, d, cor, pai, o); m.position.set(x, y, z); return m; };
  const placa = (larg, alt, txt, fundo, cor, px = 512, fonte = 'bold 120px sans-serif') => T.tela(larg, alt, px, (c, w, h) => {
    c.fillStyle = fundo; c.fillRect(0, 0, w, h); c.fillStyle = cor; c.font = fonte; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 4); });
  const luzTeto = []; // painéis que apagam: {m, z}

  // ======================= PRAÇA DE ALIMENTAÇÃO =======================
  cx(18, 0.1, 13, '#d9cdb8', 0, -0.05, 0, null, { sem: true });
  for (let x = -8; x <= 8; x += 2) T.linha([x, 0.002, -6.5], [x, 0.002, 6.5], 0.012);
  for (let z = -6; z <= 6; z += 2) T.linha([-9, 0.002, z], [9, 0.002, z], 0.012);
  cx(18, 0.1, 13, '#e9e4da', 0, 4.6, 0, null, { sem: true });
  for (const x of [-6, -2, 2, 6]) for (const z of [-4, 0, 4]) { const p = cx(1.6, 0.04, 1.0, T.basico('#fffbe8'), x, 4.54, z, null, { sem: true }); luzTeto.push({ m: p, z: 6 }); }
  // paredes da praça
  cx(18, 4.6, 0.2, '#e8dccb', 0, 2.3, 6.6); cx(0.2, 4.6, 13, '#e8dccb', 9, 2.3, 0); cx(0.2, 4.6, 13, '#e8dccb', -9, 2.3, 0);
  cx(5, 4.6, 0.2, '#e8dccb', -6.5, 2.3, -6.5); cx(5, 4.6, 0.2, '#e8dccb', 6.5, 2.3, -6.5);
  // lanchonetes (nomes inventados)
  const lojas = [['PASTEL DO ZÉ', '#e0533d'], ['AÇAÍ MIL GRAU', '#7b3fa0'], ['BRASA BURGER', '#e09a2d'], ['YAKI SOBA', '#2f8f6e']];
  lojas.forEach(([nome, cor], k) => {
    const x = -6.6 + k * 4.4;
    cx(3.8, 1.1, 0.8, cor, x, 0.55, 5.9); cx(3.8, 0.06, 0.9, '#f4f0e8', x, 1.13, 5.9);
    cx(3.8, 2.0, 0.1, '#3a3530', x, 2.2, 6.45, null, { sem: true });
    const s = placa(3.6, 0.7, nome, cor, '#fff', 512, 'bold 64px sans-serif'); s.position.set(x, 3.6, 6.38); s.rotation.y = Math.PI;
    for (let j = 0; j < 3; j++) { const q = cx(0.7, 0.5, 0.04, T.basico(['#f7d27a', '#f1a56b', '#9fd6a4'][j]), x - 1 + j, 2.5, 6.38, null, { sem: true }); }
  });
  // mesas e cadeiras
  const mesa = (x, z) => {
    const tampo = T.cilindro(0.45, 0.45, 0.05, '#f2efe8'); tampo.position.set(x, 0.74, z);
    const pe = T.cilindro(0.05, 0.05, 0.72, '#555a62', null, { sem: true }); pe.position.set(x, 0.37, z);
    const base = T.cilindro(0.25, 0.25, 0.03, '#555a62'); base.position.set(x, 0.02, z);
  };
  const cadeira = (x, z, ry) => {
    const g = T.grupo(null, x, 0, z); g.rotation.y = ry;
    cx(0.42, 0.05, 0.42, '#2f6fb0', 0, 0.45, 0, g); cx(0.42, 0.45, 0.05, '#2f6fb0', 0, 0.7, -0.2, g);
    for (const [a, b] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) cx(0.03, 0.45, 0.03, '#444', a, 0.22, b, g, { sem: true });
  };
  const MESAS = [[0, 1.25], [-3.2, 2.2], [3.4, 1.6], [-3.6, -2.5], [3.0, -2.8], [6.4, 3.4]];
  MESAS.forEach(([x, z], k) => { mesa(x, z); if (k) cadeira(x, z + 0.7, 0); cadeira(x, z - 0.7, Math.PI); });
  // copo e bandeja na nossa mesa
  const copo = T.cilindro(0.045, 0.035, 0.14, '#e0533d'); copo.position.set(0.18, 0.84, 1.35);
  const tampa = T.cilindro(0.047, 0.047, 0.012, '#fafafa'); tampa.position.set(0.18, 0.915, 1.35);
  const canudo = T.cilindro(0.005, 0.005, 0.12, '#f4d03f', null, { sem: true }); canudo.position.set(0.2, 0.97, 1.35);
  const bandeja = cx(0.45, 0.02, 0.32, '#c0392b', -0.15, 0.775, 1.15);
  const celMesa = cx(0.075, 0.01, 0.15, '#22252b', 0.05, 0.775, 1.55); // nosso celular deitado na mesa
  const celMesaTela = T.tela(0.066, 0.138, 128, (c, w, h) => { c.fillStyle = '#d42c2c'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.fillText('!', w / 2, h / 2 + 14); });
  celMesaTela.rotation.x = -Math.PI / 2; celMesaTela.position.set(0.05, 0.782, 1.55);
  // escada rolante (desce do lado esquerdo da praça)
  const esc = T.grupo(null, -7.2, 0, -1.2);
  for (let k = 0; k < 14; k++) { const d = cx(1.1, 0.06, 0.42, '#8b9098', 0, -k * 0.26, k * 0.42, esc, { sem: true }); }
  for (const sx of [-1, 1]) { const l = cx(0.12, 1.0, 6.4, '#c8ccd2', 0.62 * sx, -1.4, 2.7, esc); l.rotation.x = 0.55; const c = cx(0.14, 0.08, 6.6, '#222', 0.62 * sx, -0.85, 2.9, esc, { sem: true }); c.rotation.x = 0.55; }
  cx(1.6, 0.05, 1.2, '#7b8088', -7.2, 0.0, -1.7);

  // ======================= CORREDOR DAS LOJAS =======================
  cx(8, 0.1, 18, '#e3dccd', 0, -0.05, -15, null, { sem: true });
  for (let z = -6; z >= -24; z -= 2) T.linha([-4, 0.002, z], [4, 0.002, z], 0.012);
  cx(8, 0.1, 18, '#ece7de', 0, 4.6, -15, null, { sem: true });
  for (let z = -8; z >= -23; z -= 3) { const p = cx(5.0, 0.04, 0.5, T.basico('#fffbe8'), 0, 4.54, z, null, { sem: true }); luzTeto.push({ m: p, z }); }
  const grades = []; // {g, x, z} desce no tempo
  const vitrines = [['MODA JOVEM', '#e85d8a'], ['GAMES', '#2c3e50'], ['ÓTICA', '#16a085'], ['CALÇADOS', '#d35400'], ['PERFUMES', '#8e44ad'], ['CELULARES', '#2980b9']];
  let vi = 0;
  for (const sx of [-1, 1]) {
    if (sx < 0) cx(0.2, 4.6, 18, '#e8dccb', -4.1, 2.3, -15, null, {});
    else { cx(0.2, 4.6, 3.4, '#e8dccb', 4.1, 2.3, -7.7, null, {}); cx(0.2, 4.6, 13.4, '#e8dccb', 4.1, 2.3, -17.3, null, {}); cx(0.2, 2.4, 1.2, '#e8dccb', 4.1, 3.4, -10, null, {}); }
    for (let z0 = -6.2; z0 > -23.8; z0 -= 4.4) {
      const zc = z0 - 2.1;
      if (sx > 0 && Math.abs(zc + 10) < 2) continue; // espaço da porta de funcionários
      const [nome, cor] = vitrines[vi++ % vitrines.length];
      cx(0.12, 2.9, 3.8, '#9fc4d8', 4.0 * sx, 1.45, zc, null, { w: 0.004 });
      cx(0.14, 0.9, 4.0, cor, 3.98 * sx, 3.4, zc);
      const s = placa(3.6, 0.6, nome, cor, '#fff', 512, 'bold 70px sans-serif'); s.position.set(3.9 * sx, 3.4, zc); s.rotation.y = -Math.PI / 2 * sx;
      // vitrine por dentro: manequim/prateleira simples
      cx(0.5, 1.2, 0.5, '#f4f1ea', 4.6 * sx, 0.6, zc - 0.9); cx(0.6, 0.06, 2.4, '#bfa98a', 4.5 * sx, 1.2, zc + 0.3);
      // grade de enrolar (desce)
      const g = T.grupo(null, 3.85 * sx, 2.95, zc);
      const lam = cx(0.06, 2.95, 3.9, '#a7adb5', 0, -1.475, 0, g, { w: 0.004 });
      for (let k = 0; k < 14; k++) cx(0.08, 0.025, 3.9, '#7d838b', 0.01 * sx, -0.1 - k * 0.2, 0, g, { sem: true });
      g.scale.y = 0.02; grades.push({ g, z: zc, sx });
    }
  }
  // porta SOMENTE FUNCIONÁRIOS
  const portaF = T.grupo(null, 4.0, 0, -10.5); // dobradiça
  cx(0.08, 2.15, 1.0, '#6f7780', 0, 1.075, 0.5, portaF);
  const pf = placa(0.7, 0.22, 'SOMENTE FUNCIONÁRIOS', '#c0392b', '#fff', 512, 'bold 46px sans-serif'); pf.position.set(-0.05, 1.7, 0.5); pf.rotation.y = -Math.PI / 2; portaF.add(pf);
  const mac = T.esfera(0.035, '#ddd', portaF); mac.position.set(-0.07, 1.0, 0.85);
  cx(0.1, 0.1, 1.2, '#4b5058', 4.02, 2.2, -10.0, null, {}); cx(0.1, 2.2, 0.1, '#4b5058', 4.02, 1.1, -10.6); cx(0.1, 2.2, 0.1, '#4b5058', 4.02, 1.1, -9.4);
  // fachada de vidro na entrada (z=-24) e a rua lá fora
  cx(8, 0.3, 0.3, '#3d4249', 0, 3.2, -24); cx(8, 1.4, 0.3, '#3d4249', 0, 3.95, -24);
  for (const x of [-3.9, -2.2, 2.2, 3.9]) cx(0.12, 3.2, 0.14, '#3d4249', x, 1.6, -24);
  cx(0.05, 2.4, 0.06, '#2b2f35', 0, 1.2, -24.0, null, { sem: true });
  const vidroMat = T.mat('#9ccbe6', { transparent: true, opacity: 0.18 });
  const vidroF = cx(8, 3.2, 0.03, vidroMat, 0, 1.6, -24, null, { sem: true });
  const ab = T.esfera(0.03, '#c9ccd0', null); ab.position.set(-0.15, 1.1, -23.95); const ab2 = T.esfera(0.03, '#c9ccd0', null); ab2.position.set(0.15, 1.1, -23.95);
  // rua
  cx(40, 0.05, 30, '#30343c', 0, -0.06, -40, null, { sem: true });
  cx(40, 0.15, 3, '#5b5f66', 0, 0.05, -26, null, { sem: true });
  for (const x of [-7, 7]) { const p = T.cilindro(0.06, 0.08, 5, '#3a3e45'); p.position.set(x, 2.5, -27.5); const lp = T.esfera(0.22, T.basico('#ffe9b0'), null, { sem: true }); lp.position.set(x, 5, -27.2); }
  for (const x of [-3.2, 3.4]) { const p = T.cilindro(0.05, 0.06, 3.6, '#3a3e45'); p.position.set(x, 1.8, -29); const lp = T.esfera(0.2, T.basico('#ffe9b0'), null, { sem: true }); lp.position.set(x, 3.6, -29); const halo = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), T.basico('#ffe9b0', { transparent: true, opacity: 0.12, depthWrite: false })); halo.position.set(x, 1.0, -28.9); T.cena.add(halo); halo.rotation.x = -Math.PI / 2; halo.position.y = 0.01; }
  const carro = T.grupo(null, -1.2, 0, -31); cx(3.6, 0.7, 1.7, '#7b2d26', 0, 0.55, 0, carro); cx(2.0, 0.6, 1.5, '#5e221d', -0.2, 1.15, 0, carro); cx(1.9, 0.45, 1.52, T.mat('#2b3644'), -0.2, 1.17, 0, carro, { sem: true });
  for (const [a, b] of [[-1.1, -0.86], [1.1, -0.86], [-1.1, 0.86], [1.1, 0.86]]) { const r = T.cilindro(0.3, 0.3, 0.2, '#111', carro); r.rotation.x = Math.PI / 2; r.position.set(a, 0.3, b); }
  const prediosFora = [[-12, -40, 8, 10], [0, -46, 10, 14], [11, -38, 6, 8]];
  for (const [x, z, w, h] of prediosFora) for (let jy = 1.5; jy < h - 1; jy += 2.2) for (let jx = -w / 2 + 1; jx < w / 2 - 0.5; jx += 1.6) if ((jx * 7 + jy * 3) % 5 > 2.2) cx(0.7, 0.9, 0.05, T.basico('#e8c76a'), x + jx, jy, z + 2.03, null, { sem: true });
  for (const [x, z, w, h] of prediosFora) cx(w, h, 4, '#262a32', x, h / 2, z);
  // neblina: planos semitransparentes
  const neb = [];
  for (let k = 0; k < 3; k++) {
    const n = new THREE.Mesh(new THREE.PlaneGeometry(26, 3.5), T.basico('#9aa4b2', { transparent: true, opacity: 0.05, depthWrite: false }));
    n.position.set(-4 + (k % 3) * 4, 0.9 + (k % 2) * 0.6, -25.5 - k * 1.8); T.cena.add(n); neb.push(n);
  }
  // a mão no vidro (lado de fora)
  const maoF = T.mao({ pele: '#d9dee4', sx: 1, esc: 2.2 });
  maoF.g.position.set(0.6, 1.55, -24.06); T.orientaMao(maoF, new V3(0, 1, 0), new V3(0, 0, -1));
  maoF.pose({ dedos: [[0.05, 0.05, 0.05], [0.05, 0.05, 0.05], [0.05, 0.05, 0.05], [0.05, 0.05, 0.05]], abre: 0.16, pol: [0.9, 0.2, 0.1, 0.05] });

  // ======================= ESCADA DE SERVIÇO E CORREDOR DE CONCRETO =======================
  const conc = '#a9a8a2', concE = '#8e8d88';
  cx(1.6, 0.1, 1.6, conc, 4.9, -0.05, -10); // patamar
  for (let k = 0; k < 12; k++) cx(0.4, 0.3, 1.6, k % 2 ? conc : concE, 5.9 + k * 0.4, -0.15 - k * 0.3, -10);
  const rampaTeto = cx(6.2, 0.1, 1.8, '#77766f', 8.0, 1.3, -10); rampaTeto.rotation.z = -0.64;
  for (const sz of [-1, 1]) { const pa = cx(7.2, 5.5, 0.12, concE, 7.5, -0.9, -10 + 0.86 * sz); }
  const corrimao = T.cilindro(0.025, 0.025, 6.2, '#d4ac0d'); corrimao.rotation.z = Math.PI / 2 + 0.64; corrimao.position.set(7.9, -0.95, -10.7);
  const lampEsc = T.esfera(0.09, T.basico('#fff1c4'), null, { sem: true }); lampEsc.position.set(6.3, 2.2, -10);
  cx(8.2, 0.12, 1.8, conc, 14.0, B - 0.06, -10);
  cx(8.2, 0.12, 1.8, '#7f7e78', 14.0, B + 2.7, -10);
  for (const sz of [-1, 1]) cx(8.2, 2.8, 0.12, concE, 14.0, B + 1.35, -10 + 0.86 * sz);
  for (const [y, z, r, cor] of [[B + 2.45, -10.55, 0.07, '#7a8a96'], [B + 2.3, -10.35, 0.05, '#b5651d'], [B + 2.5, -9.5, 0.09, '#5e6e7a']]) {
    const c = T.cilindro(r, r, 8.2, cor); c.rotation.z = Math.PI / 2; c.position.set(14.0, y, z);
  }
  const lampCorr = [];
  for (const x of [11.5, 15.5]) { const l = T.esfera(0.07, T.basico('#fff1c4'), null, { sem: true }); l.position.set(x, B + 2.55, -10); lampCorr.push(l); }
  const luzCorr = new THREE.PointLight(0xffe2b0, 0, 7); luzCorr.position.set(13.5, B + 2.3, -10); T.cena.add(luzCorr);
  const luzEsc = new THREE.PointLight(0xffe2b0, 0, 6); luzEsc.position.set(6.5, 1.8, -10); T.cena.add(luzEsc);

  // ======================= DEPÓSITO =======================
  cx(8, 0.12, 8, '#9b9a94', 22, B - 0.06, -10);
  cx(8, 0.12, 8, '#6e6d68', 22, B + 3.1, -10);
  cx(0.15, 3.1, 8, concE, 26, B + 1.55, -10); cx(8, 3.1, 0.15, concE, 22, B + 1.55, -14); cx(8, 3.1, 0.15, concE, 22, B + 1.55, -6);
  cx(0.15, 3.1, 3.4, concE, 18, B + 1.55, -12.3); cx(0.15, 3.1, 3.4, concE, 18, B + 1.55, -7.7); cx(0.15, 0.9, 1.2, concE, 18, B + 2.65, -10);
  // porta de aço com visor (dobradiça em z=-10.6, abre pra dentro do depósito)
  const portaA = T.grupo(null, 18.05, B, -10.6);
  cx(0.1, 2.2, 1.2, '#59606a', 0, 1.1, 0.6, portaA, { w: 0.005 });
  for (const y of [0.4, 1.1, 1.8]) cx(0.12, 0.05, 1.2, '#4a5058', 0.0, y, 0.6, portaA, { sem: true });
  const visor = cx(0.13, 0.32, 0.46, T.mat('#2a323c', { transparent: true, opacity: 0.22 }), 0, 1.6, 0.6, portaA, { w: 0.004 });
  const visorTela = T.tela(0.44, 0.3, 256, (c, w, h) => {
    const g = c.createRadialGradient(w * 0.5, h * 0.45, 4, w * 0.5, h * 0.5, w * 0.6); g.addColorStop(0, '#5a5446'); g.addColorStop(1, '#0b0c0e'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#25262a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, h); c.lineTo(w * 0.42, h * 0.58); c.lineTo(w * 0.58, h * 0.58); c.lineTo(w, h); c.moveTo(0, 0); c.lineTo(w * 0.42, h * 0.32); c.lineTo(w * 0.58, h * 0.32); c.lineTo(w, 0); c.stroke();
    c.fillStyle = '#d8c79a'; c.beginPath(); c.arc(w * 0.5, h * 0.36, 4, 0, 7); c.fill(); }, portaA);
  visorTela.position.set(0.071, 1.6, 0.6); visorTela.rotation.y = Math.PI / 2;
  const trinco = cx(0.1, 0.08, 0.2, '#2b2f35', 0.08, 1.05, 1.05, portaA);
  // prateleiras e caixas
  const caixaPapelao = (x, y, z, s = 1, r = 0) => { const c = cx(0.6 * s, 0.45 * s, 0.5 * s, '#c79a5b', x, y + 0.225 * s, z); c.rotation.y = r; const f = cx(0.61 * s, 0.05 * s, 0.1 * s, '#e8d3a8', x, y + 0.45 * s, z, null, { sem: true }); f.rotation.y = r; return c; };
  for (const z of [-13.4, -6.6]) {
    for (const y of [0.05, 0.9, 1.75, 2.6]) cx(5.5, 0.05, 0.7, '#5d6670', 22.5, B + y, z);
    for (const x of [19.9, 22.5, 25.1]) cx(0.06, 2.7, 0.7, '#4c545d', x, B + 1.35, z);
    for (let k = 0; k < 7; k++) caixaPapelao(20.4 + k * 0.75, B + 0.92 + (k % 2) * 0.85, z, 0.9, (k % 3) * 0.1);
  }
  caixaPapelao(21.0, B, -8.3, 1.0, 0.1); caixaPapelao(22.15, B, -8.25, 1.0, -0.15); // onde tu e o Léo sentam
  caixaPapelao(24.5, B, -10.5, 1.1); caixaPapelao(24.5, B + 0.5, -10.5, 1.0, 0.3); caixaPapelao(23.6, B, -11.6, 1.0);
  const balde = T.cilindro(0.16, 0.13, 0.3, '#2e86c1'); balde.position.set(23.2, B + 0.15, -12.8);
  const esfregao = T.cilindro(0.015, 0.015, 1.4, '#a0522d'); esfregao.position.set(23.35, B + 0.75, -12.85); esfregao.rotation.z = 0.15;
  // lâmpada pendurada
  const fio = T.cilindro(0.006, 0.006, 0.7, '#111', null, { sem: true }); fio.position.set(22, B + 2.7, -10);
  const bulbo = T.esfera(0.07, T.basico('#fff3c8'), null, { sem: true }); bulbo.position.set(22, B + 2.32, -10);
  const luzBulbo = new THREE.PointLight(0xffe6b0, 0, 9, 1.4); luzBulbo.position.set(22, B + 2.25, -10); T.cena.add(luzBulbo);

  // ======================= PERSONAGENS =======================
  const leo = T.pessoa({ pele: '#c98e66', cabelo: '#1e140c', roupa: '#3b6fd1', calca: '#2b2f3a', sapato: '#f2f2f2', coque: false });
  const edson = T.pessoa({ pele: '#8d5a3b', cabelo: '#c8c8c8', roupa: '#25324c', calca: '#1c2230', sapato: '#111', coque: false });
  const neide = T.pessoa({ pele: '#e0a882', cabelo: '#d0d0d0', roupa: '#86b9cf', calca: '#86b9cf', sapato: '#eeeeee', coque: true });
  const marcos = T.pessoa({ pele: '#f0c4a0', cabelo: '#3a2a1a', roupa: '#4a4f58', calca: '#4a4f58', sapato: '#111', coque: false });
  const gravata = T.caixa(0.045, 0.3, 0.02, '#b03a2e', marcos.tronco); gravata.position.set(0, 0.47, 0.115);
  const golaM = T.caixa(0.12, 0.05, 0.03, '#f5f5f5', marcos.tronco, { sem: true }); golaM.position.set(0, 0.62, 0.1);
  const crachaE = T.caixa(0.08, 0.05, 0.01, '#f1c40f', edson.tronco, { sem: true }); crachaE.position.set(0.08, 0.52, 0.115);
  // lanterna do Edson
  const lant = T.cilindro(0.028, 0.035, 0.22, '#1b1b1b');
  const spot = new THREE.SpotLight(0xfff2cc, 0, 14, 0.38, 0.5, 1.2); T.cena.add(spot); T.cena.add(spot.target);
  const feixe = new THREE.Mesh(new THREE.ConeGeometry(0.9, 5, 24, 1, true), T.basico('#fff6d8', { transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide }));
  T.cena.add(feixe);
  // celular do Marcos
  const celM = T.caixa(0.07, 0.14, 0.01, '#111', null, { w: 0.003 });
  // gente sentada na praça (olhando o celular vermelho)
  const sentar = (P) => {
    P.pernas.forEach((q) => { q.children.forEach((c) => (c.visible = false));
      const coxa = T.capsula(0.06, 0.34, '#2e3f6e', q); coxa.rotation.x = Math.PI / 2; coxa.position.set(0, -0.02, 0.2);
      const canela = T.capsula(0.055, 0.36, '#2e3f6e', q); canela.position.set(0, -0.26, 0.4);
      const pe = T.esfera(0.07, '#333', q); pe.scale.set(0.85, 0.6, 1.5); pe.position.set(0, -0.5, 0.45); });
  };
  const npcs = [];
  for (const [x, z, ry, roupa, pele, cab] of [[-3.2, 2.9, Math.PI, '#d35400', '#f1c6a2', '#3a2414'], [3.0, -3.5, 0, '#16a085', '#8d5a3b', '#111'], [-3.6, -3.2, 0, '#c0392b', '#e8b48e', '#7a4a22'], [6.4, 4.1, Math.PI, '#8e44ad', '#f0c4a0', '#222']]) {
    const P = T.pessoa({ pele, cabelo: cab, roupa, calca: '#2e3f6e', coque: false }); sentar(P);
    P.g.position.set(x, -0.3, z); P.g.rotation.y = ry; P.cabeca.rotation.x = 0.4;
    P.mao('D', [-0.06, 0.95, 0.3], [-1, -0.6, 0.2]); P.mao('E', [0.06, 0.95, 0.3], [1, -0.6, 0.2]);
    const cel = T.caixa(0.07, 0.14, 0.01, '#111', null, { w: 0.003 });
    const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.062, 0.128), T.basico('#e23b3b')); cel.add(tela); tela.position.z = -0.006; tela.rotation.y = Math.PI;
    npcs.push({ P, cel, levanta: npcs.length });
  }
  sentar(leo); // começa sentado; trocamos as pernas quando ele levanta (ver leoPernas)
  const leoC = T.pessoa({ pele: '#c98e66', cabelo: '#1e140c', roupa: '#3b6fd1', calca: '#2b2f3a', sapato: '#f2f2f2', coque: false }); sentar(leoC);
  leoC.pernas.forEach((q) => q.children.forEach((c) => { if (c.material && c.material.color && c.visible) c.material = T.mat(c.material.color.getHexString() === '2e3f6e' ? '#2b2f3a' : '#' + c.material.color.getHexString()); }));
  const leoEmPe = T.pessoa({ pele: '#c98e66', cabelo: '#1e140c', roupa: '#3b6fd1', calca: '#2b2f3a', sapato: '#f2f2f2', coque: false });

  // ======================= POV =======================
  const V = T.pov({ manga: '#2c2c34', punho: '#1f1f25', pele: '#f1c6a2' });
  const ALERTA = (c, w, h, t) => {
    const pis = Math.sin(t * 9) > 0 ? 1 : 0.82;
    c.fillStyle = `rgb(${Math.round(200 * pis)},${Math.round(28 * pis)},${Math.round(28 * pis)})`; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff'; c.textAlign = 'center';
    c.beginPath(); c.moveTo(w / 2, 80); c.lineTo(w / 2 + 60, 185); c.lineTo(w / 2 - 60, 185); c.closePath(); c.fill();
    c.fillStyle = '#c81c1c'; c.font = 'bold 70px sans-serif'; c.fillText('!', w / 2, 178);
    c.fillStyle = '#fff'; c.font = 'bold 34px sans-serif'; c.fillText('ALERTA EXTREMO', w / 2, 260);
    c.fillRect(40, 285, w - 80, 4);
    c.font = 'bold 28px sans-serif';
    ['PERMANEÇA EM', 'LOCAL FECHADO.', '', 'NÃO ABRA A PORTA', 'PARA QUEM CHAMAR', 'SEU NOME.'].forEach((l, k) => c.fillText(l, w / 2, 350 + k * 46));
    c.font = '24px sans-serif'; c.fillStyle = '#ffd6d6'; c.fillText('Defesa Civil · agora', w / 2, h - 60);
  };

  // ---------- trajetórias ----------
  // olho de quem assiste: sentado (1.15) na praça, em pé 1.62
  const SENT = [0, 1.15, 2.0], EMPE = [0, 1.62, 1.9], VID = [-0.6, 1.62, -21.6], PORTA_F = [3.2, 1.62, -10.0], DENTRO = [4.9, 1.62, -10.0];
  const PE_ESC = [10.1, B + 1.62, -10.0], CORR = [16.6, B + 1.62, -10.15], DEP = [19.6, B + 1.62, -10.15], CAIXA = [20.95, B + 1.12, -8.4], VISOR = [18.55, B + 1.62, -10.0];
  const pos = (t) => T.chaves([[0, SENT], [E('LEOSAI'), SENT], [E('GRADES') + 0.8, SENT], [E('GRADES') + 1.8, EMPE], [E('ANDA'), EMPE], [E('ANDA') + EV.ANDA.d, VID],
    [E('BAM') + 0.4, VID], [E('CORRE') - 0.2, [-0.4, 1.62, -21.0]], [E('CORRE') + 3.6, PORTA_F], [E('CORRE') + EV.CORRE.d, DENTRO], [E('ESCADA') + EV.ESCADA.d, PE_ESC],
    [E('CORREDOR') + EV.CORREDOR.d, CORR], [E('FECHA') + 0.2, CORR], [E('FECHA') + 1.8, DEP], [E('SENTA'), DEP], [E('SENTA') + 1.3, CAIXA],
    [E('LEVANTA'), CAIXA], [E('LEVANTA') + 1.0, [21.0, B + 1.62, -8.6]], [E('mae1'), [20.0, B + 1.62, -9.4]], [E('VISOR'), VISOR], [DUR, VISOR]], t);
  // pra onde olha (ponto no mundo)
  const LEO_S = [0, 1.05, 0.5];
  const alvo = (t) => T.chaves([
    [0, [0.05, 0.78, 1.55]], [E('ALERTA') + 0.9, [0.05, 0.78, 1.55]], [E('ALERTA') + 1.6, [0, 1.0, 1.1]],           // celular na mesa -> na mão
    [E('l0'), [0, 1.0, 1.1]], [E('l0') + 0.4, LEO_S], [E('t0'), LEO_S], [E('t0') + 0.5, [-3.6, 1.1, -3.4]], [E('t0') + EV.t0.d + 0.2, [3.0, 1.1, -3.4]], // olha os outros
    [E('l1'), LEO_S], [E('l3') + EV.l3.d, LEO_S], [E('LEOSAI') + 2.0, [-7.0, 0.8, -1.0]],                          // Léo vai pra escada rolante
    [E('GRADES'), [-6.0, 2.5, -1]], [E('GRADES') + 1.0, [3.8, 2.0, -8.3]], [E('GRADES') + 2.2, [0, 1.5, -14]], [E('ANDA') + EV.ANDA.d - 0.5, [0, 1.5, -26]],
    [E('VIDRO') + 0.6, [0.4, 1.0, -30]], [E('e0') - 0.2, [0.4, 1.0, -30]], [E('e0') + 0.5, [-2.6, 1.55, -20.5]], [E('e3'), [-2.6, 1.55, -20.5]],
    [E('e3') + 1.2, [4.0, 1.5, -10.3]], [E('t5'), [4.0, 1.5, -10.3]], [E('LEOVOLTA') + 0.4, [-0.5, 1.4, -12]], [E('l5') + EV.l5.d, [-0.5, 1.5, -20.4]],
    [E('BAM') + 0.25, [0.6, 1.5, -26]], [E('e4'), [0.6, 1.4, -26]], [E('CORRE') + 0.3, [2.5, 1.5, -12]], [E('CORRE') + 3.4, [4.2, 1.4, -10]],
    [E('CORRE') + EV.CORRE.d, [8, -0.5, -10]], [E('ESCADA') + EV.ESCADA.d - 0.5, [14, B + 1.2, -10]], [E('CORREDOR') + 1.0, [18, B + 1.3, -10]],
    [E('m0'), [20.6, B + 1.5, -12]], [E('n0'), [18.4, B + 1.45, -9.2]], [E('m1'), [20.6, B + 1.5, -12]], [E('FECHA'), [18.4, B + 1.45, -9.2]],
    [E('FECHA') + 1.6, [18.2, B + 1.3, -10]], [E('e5'), [19.3, B + 1.55, -10.9]], [E('e5') + 2.0, [20.6, B + 1.5, -12]], [E('e5') + 3.2, [23.3, B + 1.45, -11.2]],
    [E('e5') + 4.2, [19.3, B + 1.55, -10.9]], [E('m2'), [20.6, B + 1.5, -12]], [E('e6'), [19.3, B + 1.55, -10.9]], [E('SENTA'), [22.15, B + 1.1, -8.2]],
    [E('SENTA') + 1.4, [22.15, B + 1.22, -8.1]], [E('t9') - 0.3, [22.15, B + 1.22, -8.1]], [E('t9') + 0.3, [23.3, B + 1.45, -11.2]], [E('m3'), [23.3, B + 1.45, -11.2]],
    [E('m3') + 0.3, [20.6, B + 1.5, -12]], [E('n3'), [23.3, B + 1.45, -11.2]], [E('SILENCIO') + 1.0, [22, B + 2.3, -10]], [E('TOC'), [18.1, B + 1.3, -10]],
    [E('mae1') + EV.mae1.d, [18.1, B + 1.55, -10]], [E('VISOR'), [17.0, B + 1.6, -10]], [E('VISOR') + EV.VISOR.d, [16.0, B + 1.6, -10]],
    [E('l8') - 0.1, [21.0, B + 1.5, -9.3]], [DUR, [20.7, B + 1.55, -9.6]]], t);

  // caminhos dos personagens
  const leoS = new V3(0, -0.3, 0.55); // sentado na nossa mesa
  T.cada((t) => {
    const P = pos(t), A = alvo(t);
    // balanço da caminhada/corrida
    const v = new V3(...pos(t + 0.05)).sub(new V3(...P)).length() / 0.05;
    const bob = Math.min(1, v / 4.5);
    const correndo = t > E('BAM') && t < E('CORREDOR') + EV.CORREDOR.d;
    const amp = correndo ? 0.05 : 0.025;
    const px = P[0], py = P[1] + Math.abs(Math.sin(t * (correndo ? 9.5 : 6.5))) * amp * bob + Math.sin(t * 1.3) * 0.004, pz = P[2];
    const dx = A[0] - px, dy = A[1] - py, dz = A[2] - pz;
    const yaw = Math.atan2(-dx, -dz), pitch = Math.atan2(dy, Math.hypot(dx, dz));
    let roll = Math.sin(t * (correndo ? 4.75 : 3.25)) * 0.02 * bob;
    let tremor = 0;
    if (t > E('BAM') && t < E('BAM') + 0.5) tremor += 0.03 * (1 - (t - E('BAM')) / 0.5);
    if (t > E('TOC') && t < E('TOC') + 1.6) tremor += 0.012 * Math.abs(Math.sin((t - E('TOC')) * 7.8));
    if (t > E('FECHA') + 1.0 && t < E('FECHA') + 1.3) tremor += 0.02;
    V.corpo.position.set(px, py, pz);
    V.olhar(yaw + tremor * Math.sin(t * 61), pitch + tremor * Math.sin(t * 47), roll);
    // zoom de tensão: alerta, mão no vidro, batidas, voz, Léo
    const zAl = T.janela(t, E('ALERTA') + 1.2, E('ALERTA') + 2.4) * (1 - T.janela(t, E('l0') - 0.2, E('l0') + 0.3));
    const zVis = T.janela(t, E('VISOR'), E('VISOR') + EV.VISOR.d) * (1 - T.janela(t, E('l8') - 0.2, E('l8')));
    const zTic = T.janela(t, E('mae0'), FIM('mae0')) * 0.5 * (1 - T.janela(t, E('LEVANTA'), E('LEVANTA') + 0.5));
    const zLeo = T.janela(t, E('l8') + 0.2, DUR);
    T.cam.fov = 104 - 26 * Math.max(zAl, zVis, zTic, zLeo * 0.9); T.fisheye.k.value = 0.42 * (1 - 0.35 * Math.max(zAl, zVis)); T.cam.updateProjectionMatrix();

    // ---------- celular do POV ----------
    const sobe = T.chaves([[0, 0], [E('ALERTA') + 0.9, 0], [E('ALERTA') + 1.6, 1], [E('l0') + 0.3, 1], [E('l0') + 1.0, 0], [DUR, 0]], t);
    celMesa.visible = celMesaTela.visible = t < E('ALERTA') + 1.0;
    V.cel.position.set(0.0, T.lerp(-0.6, -0.17, sobe), T.lerp(-0.25, -0.3, sobe)); V.cel.rotation.set(T.lerp(-1.2, -0.25, sobe), 0, 0);
    V.cel.visible = sobe > 0.01 && t > E('ALERTA') + 0.9; V.bE.ombro.visible = V.cel.visible;
    V.celTela('custom', t, { f: ALERTA }); V.dedo(0, V.botaoVerde); V.bracos();
    // celulares dos outros piscando vermelho
    npcs.forEach(({ P, cel }, k) => {
      P.piscaAuto(t, k * 0.9); P.boca(0);
      const sai = t > E('GRADES') + 0.4 + k * 0.4;
      P.g.visible = !sai || t < E('GRADES') + 1.5 + k * 0.4;
      P.g.updateMatrixWorld(true); cel.position.copy(P.br.D.mao.getWorldPosition(new V3())).add(P.br.E.mao.getWorldPosition(new V3())).multiplyScalar(0.5);
      cel.position.y += 0.03; cel.rotation.set(-0.9, P.g.rotation.y + Math.PI, 0); cel.visible = P.g.visible;
    });
    // ---------- luzes ----------
    const pisca = (t > E('GRADES') - 0.2 && t < E('GRADES') + 1.0) ? (Math.sin(t * 37) * Math.sin(t * 11) > 0 ? 0.2 : 1) : 1;
    const apagaFrente = (z) => T.janela(t, E('BAM') + 0.3 + (z + 24) * -0.0 + (-24 - z) * -0.1, E('BAM') + 0.5 + (-24 - z) * -0.1);
    luzTeto.forEach(({ m, z }) => { const off = t > E('BAM') ? T.janela(t, E('BAM') + 0.3 + (z + 24) * 0.14, E('BAM') + 0.45 + (z + 24) * 0.14) : 0; m.material.color.set(off > 0.5 || pisca < 0.5 ? '#3a3a36' : '#fffbe8'); });
    const emBaixo = P[1] < -0.5 || (P[0] > 4.5);
    const escuroCima = T.janela(t, E('BAM') + 0.3, E('BAM') + 3.5);
    hemi.intensity = emBaixo ? 0.32 : (1.55 * (1 - 0.7 * escuroCima)) * (pisca < 0.5 ? 0.55 : 1);
    T.sol.intensity = emBaixo ? 0.12 : 1.5 * (1 - 0.8 * escuroCima) * (pisca < 0.5 ? 0.5 : 1);
    T.cena.background.set(emBaixo ? '#0e1014' : (escuroCima > 0.5 ? '#0f1218' : '#1a1e26'));
    // subsolo: escada e corredor acesos fraquinho; lâmpada do depósito com zumbido e piscada
    luzEsc.intensity = 3.5; luzCorr.intensity = t < E('FECHA') + 1.2 ? 4 : (Math.sin(t * 13) * Math.sin(t * 3.7) > 0.9 ? 0.3 : 2.2);
    const flick = (Math.sin(t * 23) * Math.sin(t * 5.3) > 0.94) || (t > E('SILENCIO') + 0.5 && t < E('SILENCIO') + 0.9) || (t > E('TOC') && t < E('TOC') + 0.25) ? 0.25 : 1;
    luzBulbo.intensity = 7 * flick; bulbo.material.color.set(flick < 0.5 ? '#6b6556' : '#fff3c8');
    bulbo.position.x = 22 + Math.sin(t * 0.9) * 0.03 * (t > E('TOC') ? 3 : 1); luzBulbo.position.x = bulbo.position.x;
    // ---------- grades descendo (a partir de GRADES; a da fuga quase pega o Léo) ----------
    grades.forEach((G, k) => {
      const t0 = E('GRADES') + 0.2 + (k % 5) * 0.35, d = 2.5 + (k % 3) * 0.6;
      G.g.scale.y = Math.max(0.02, T.janela(t, t0, t0 + d));
    });
    // ---------- neblina e mão no vidro ----------
    neb.forEach((n, k) => { n.position.x = -4 + (k % 3) * 4 + Math.sin(t * 0.15 + k) * 1.2; });
    const mV = t > E('BAM') - 0.05 && t < E('BAM') + 1.4;
    maoF.g.visible = mV; maoF.g.position.set(0.6, 1.55 + 0.0, -24.06 - T.janela(t, E('BAM') + 0.6, E('BAM') + 1.4) * 1.5);
    vidroF.material.opacity = 0.18 + (t > E('BAM') && t < E('BAM') + 0.2 ? 0.25 : 0);
    // ---------- porta de funcionários e porta de aço ----------
    portaF.rotation.y = 1.6 * T.janela(t, E('CORRE') + 2.8, E('CORRE') + 3.4) * (1 - T.janela(t, E('ESCADA') + 0.8, E('ESCADA') + 1.4));
    const abA = 1 - T.janela(t, E('FECHA') + 0.6, E('FECHA') + 1.1);
    portaA.rotation.y = -1.5 * abA;
    // ---------- Léo ----------
    const leoSentado = t < E('LEOSAI');
    leo.g.visible = leoSentado; leoEmPe.g.visible = !leoSentado;
    leo.g.position.copy(leoS); leo.g.rotation.y = 0; leo.piscaAuto(t, 2.1);
    leo.cabeca.rotation.set(t < E('l0') ? 0.35 : 0.02, 0, 0); leo.cenho(t < E('l2') ? 0.25 : -0.3);
    leo.mao('E', [0.12, 0.95, 0.35], [1, -0.5, -0.3]); leo.mao('D', [-0.12, 0.95, 0.35], [-1, -0.5, -0.3]);
    const bL = Math.max(...['l0', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8'].map((k) => T.boca(k, E(k), t)));
    leo.boca(bL * 1.2); leoEmPe.boca(bL * 1.2); leoEmPe.piscaAuto(t, 2.1);
    // em pé: levanta, vai pra escada rolante e desce; volta correndo pelo corredor; corre junto; desce; senta do nosso lado
    const LP = T.chaves([[0, [0, 0, 0.55]], [E('LEOSAI'), [0, 0, 0.55]], [E('LEOSAI') + 0.6, [-0.8, 0, 0.3]], [E('LEOSAI') + 2.0, [-6.6, 0, -1.3]], [E('LEOSAI') + 2.4, [-7.2, 0, -1.0]],
      [E('LEOSAI') + 3.6, [-7.2, -1.5, 1.5]], [E('LEOVOLTA') - 0.3, [-7.2, -1.5, 1.5]], [E('LEOVOLTA') + 0.0, [-1.5, 0, -12.5]], [E('LEOVOLTA') + 2.0, [-0.9, 0, -20.6]],
      [E('CORRE') + 0.2, [-0.9, 0, -20.6]], [E('CORRE') + 3.8, [3.0, 0, -10.4]], [E('CORRE') + EV.CORRE.d, [4.9, 0, -10.3]], [E('ESCADA') + EV.ESCADA.d, [9.6, B, -10.3]],
      [E('CORREDOR') + EV.CORREDOR.d, [16.0, B, -10.2]], [E('FECHA') + 0.3, [16.6, B, -10.2]], [E('FECHA') + 1.9, [19.9, B, -9.5]], [E('SENTA') + 1.0, [22.15, B, -8.25]], [DUR, [22.15, B, -8.25]]], t);
    // depois de LEVANTA, o Léo fica em pé logo atrás de nós (aparece quando a gente vira)
    let lp = LP;
    if (t > E('LEVANTA')) lp = T.chaves([[E('LEVANTA'), LP], [E('mae1'), [20.9, B, -9.0]], [E('l8'), [19.55, B, -9.75]], [DUR, [19.45, B, -9.8]]], t);
    leoEmPe.g.position.set(lp[0], lp[1] + (t > E('SENTA') + 1.0 && t < E('LEVANTA') ? -0.32 : 0), lp[2]);
    const lp2 = T.chaves([[0, [0, 0, 0.55]], [E('LEOSAI'), [0, 0, 0.55]], [E('LEOSAI') + 0.6, [-0.8, 0, 0.3]], [E('LEOSAI') + 2.0, [-6.6, 0, -1.3]], [E('LEOSAI') + 2.4, [-7.2, 0, -1.0]],
      [E('LEOSAI') + 3.6, [-7.2, -1.5, 1.5]], [E('LEOVOLTA') - 0.3, [-7.2, -1.5, 1.5]], [E('LEOVOLTA') + 0.0, [-1.5, 0, -12.5]], [E('LEOVOLTA') + 2.0, [-0.9, 0, -20.6]],
      [E('CORRE') + 0.2, [-0.9, 0, -20.6]], [E('CORRE') + 3.8, [3.0, 0, -10.4]], [E('CORRE') + EV.CORRE.d, [4.9, 0, -10.3]], [E('ESCADA') + EV.ESCADA.d, [9.6, B, -10.3]],
      [E('CORREDOR') + EV.CORREDOR.d, [16.0, B, -10.2]], [E('FECHA') + 0.3, [16.6, B, -10.2]], [E('FECHA') + 1.9, [19.9, B, -9.5]], [E('SENTA') + 1.0, [22.15, B, -8.25]], [DUR, [22.15, B, -8.25]]], t + 0.08);
    const lv = Math.hypot(lp2[0] - LP[0], lp2[2] - LP[2]);
    const sentadoCaixa = t > E('SENTA') + 1.0 && t < E('LEVANTA');
    if (lv > 0.01 && t < E('LEVANTA')) leoEmPe.g.rotation.y = Math.atan2(lp2[0] - LP[0], lp2[2] - LP[2]);
    if (t > E('LEOVOLTA') + 2.0 && t < E('CORRE')) leoEmPe.g.rotation.y = Math.atan2(VID[0] - lp[0], VID[2] - lp[2]);
    if (sentadoCaixa) leoEmPe.g.rotation.y = -Math.PI * 0.5 + 0.35; // olhando pra porta
    if (t > E('LEVANTA')) leoEmPe.g.rotation.y = Math.atan2(pos(t)[0] - lp[0], pos(t)[2] - lp[2]);
    const corre = lv / 0.08;
    leoEmPe.anda(t * (corre > 3 ? 1.9 : 1.3), sentadoCaixa ? 0 : Math.min(0.5, corre * 0.12));
    if (sentadoCaixa) leoEmPe.pernas.forEach((q) => (q.rotation.x = -1.45));
    leoEmPe.solto('E', 0.08); leoEmPe.solto('D', 0.08);
    if (sentadoCaixa) { leoEmPe.mao('E', [0.12, 0.62, 0.32], [1, -0.5, -0.3]); leoEmPe.mao('D', [-0.12, 0.62, 0.32], [-1, -0.5, -0.3]); }
    leoEmPe.cenho(t > E('t7') ? -0.1 : -0.4);
    leoEmPe.olhar(0, 0);
    leoEmPe.cabeca.rotation.set(sentadoCaixa && t < E('t7') ? 0.15 : 0, sentadoCaixa && t > E('t7') - 0.3 && t < E('l7') + EV.l7.d ? 0.5 : 0, 0);
    leoC.g.visible = sentadoCaixa; if (sentadoCaixa) leoEmPe.g.visible = false;
    leoC.g.position.set(22.15, B - 0.3, -8.25); leoC.g.rotation.y = -Math.PI * 0.5 + 0.35; leoC.boca(bL * 1.2); leoC.piscaAuto(t, 2.1); leoC.cenho(t > E('t7') ? -0.1 : -0.4);
    leoC.mao('E', [0.12, 0.9, 0.35], [1, -0.5, -0.3]); leoC.mao('D', [-0.12, 0.9, 0.35], [-1, -0.5, -0.3]);
    leoC.cabeca.rotation.set(t < E('t7') ? 0.15 : 0, t > E('t7') - 0.3 && t < E('l7') + EV.l7.d ? 0.45 : 0, 0);
    if (t > E('l8') - 0.4) { leoEmPe.cenho(0); leoEmPe.pisca(0); leoEmPe.olhar(0, 0.2); } // olhar parado, sem piscar

    // ---------- Edson ----------
    const EP = T.chaves([[0, [-6, 0, -16]], [E('e0') - 1.2, [-3.5, 0, -18.5]], [E('e0') + 0.6, [-2.4, 0, -21.0]], [E('CORRE'), [-2.4, 0, -21.0]], [E('CORRE') + 3.3, [2.4, 0, -10.9]],
      [E('CORRE') + 4.0, [4.6, 0, -10.6]], [E('ESCADA') + EV.ESCADA.d - 0.4, [9.0, B, -10.6]], [E('CORREDOR') + 1.5, [15.5, B, -10.5]], [E('CORREDOR') + EV.CORREDOR.d + 1.0, [18.8, B, -11.0]],
      [E('e5'), [19.3, B, -10.9]], [DUR, [19.3, B, -10.9]]], t);
    const EP2 = T.chaves([[0, [-6, 0, -16]], [E('e0') - 1.2, [-3.5, 0, -18.5]], [E('e0') + 0.6, [-2.4, 0, -21.0]], [E('CORRE'), [-2.4, 0, -21.0]], [E('CORRE') + 3.3, [2.4, 0, -10.9]],
      [E('CORRE') + 4.0, [4.6, 0, -10.6]], [E('ESCADA') + EV.ESCADA.d - 0.4, [9.0, B, -10.6]], [E('CORREDOR') + 1.5, [15.5, B, -10.5]], [E('CORREDOR') + EV.CORREDOR.d + 1.0, [18.8, B, -11.0]],
      [E('e5'), [19.3, B, -10.9]], [DUR, [19.3, B, -10.9]]], t + 0.08);
    edson.g.visible = t > E('e0') - 1.4;
    edson.g.position.set(...EP);
    const ev2 = Math.hypot(EP2[0] - EP[0], EP2[2] - EP[2]);
    const olhaNos = (Q) => Math.atan2(P[0] - Q[0], P[2] - Q[2]);
    edson.g.rotation.y = ev2 > 0.01 ? Math.atan2(EP2[0] - EP[0], EP2[2] - EP[2]) : olhaNos(EP);
    edson.anda(t * (ev2 / 0.08 > 3 ? 1.9 : 1.2), Math.min(0.5, ev2 / 0.08 * 0.12));
    edson.piscaAuto(t, 0.7); edson.cenho(0.6); edson.olhar(0, 0);
    edson.boca(Math.max(...['e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6'].map((k) => T.boca(k, E(k), t))) * 1.2);
    // lanterna na mão direita, apontando pra frente (ou pra porta em e3, ou pra cada um na contagem)
    let apontaLant = null;
    if (t > E('e3') && t < E('t5')) apontaLant = [4.0, 1.2, -10.0];
    if (t > E('e5') && t < E('e5') + 5.0) { const quem = [[CAIXA[0], B + 1.0, -9.6], [20.6, B + 1.3, -12], [23.3, B + 1.3, -11.2], [19.9, B + 1.3, -9.4]]; apontaLant = quem[Math.min(3, Math.floor((t - E('e5')) / 1.0))]; }
    edson.g.updateMatrixWorld(true);
    if (apontaLant) { const loc = edson.g.worldToLocal(new V3(...apontaLant)); const dir = loc.clone().sub(new V3(-0.18, 1.3, 0)).normalize(); edson.mao('D', [-0.18 + dir.x * 0.45, 1.3 + dir.y * 0.45, dir.z * 0.45], [-1, -0.5, -0.2]); }
    else edson.mao('D', [-0.16, 1.05, 0.38], [-1, -0.6, -0.1]);
    if (t > E('e0') - 0.2 && t < E('e0') + 1.2) edson.mao('E', [0.3, 1.35, 0.35], [1, -0.3, 0]); else edson.solto('E', 0.06);
    edson.g.updateMatrixWorld(true);
    const mE = edson.br.D.mao.getWorldPosition(new V3());
    const dirL = apontaLant ? new V3(...apontaLant).sub(mE).normalize() : new V3(Math.sin(edson.g.rotation.y), -0.25, Math.cos(edson.g.rotation.y)).normalize();
    lant.position.copy(mE).add(dirL.clone().multiplyScalar(0.06)); lant.quaternion.setFromUnitVectors(new V3(0, 1, 0), dirL); lant.visible = edson.g.visible;
    spot.position.copy(mE); spot.target.position.copy(mE.clone().add(dirL.clone().multiplyScalar(4)));
    spot.intensity = edson.g.visible ? (emBaixo ? 30 : 12 + 25 * escuroCima) : 0;
    feixe.visible = edson.g.visible && (escuroCima > 0.3 || emBaixo); feixe.position.copy(mE.clone().add(dirL.clone().multiplyScalar(2.6))); feixe.quaternion.setFromUnitVectors(new V3(0, -1, 0), dirL);

    // ---------- Neide (segura a porta, depois perto da prateleira) ----------
    const NP = T.chaves([[0, [19.3, B, -8.7]], [E('FECHA') + 0.4, [19.3, B, -8.7]], [E('FECHA') + 1.2, [18.4, B, -9.6]], [E('e5'), [22.6, B, -11.4]], [DUR, [22.6, B, -11.4]]], t);
    neide.g.position.set(...NP); neide.g.visible = t > E('ESCADA');
    neide.g.rotation.y = t < E('FECHA') + 1.2 && t > E('FECHA') + 0.4 ? -Math.PI / 2 : (t > E('FECHA') + 1.3 && t < E('e5') ? Math.atan2(22.6 - NP[0], -11.4 - NP[2]) : olhaNos(NP));
    neide.anda(t * 1.1, (t > E('FECHA') + 1.2 && t < E('e5')) ? 0.3 : 0); if (!(t > E('FECHA') + 1.2 && t < E('e5'))) neide.pernas.forEach((q) => (q.rotation.x = 0));
    neide.piscaAuto(t, 1.7); neide.cenho(-0.2); neide.olhar(0, -0.2);
    neide.boca(Math.max(...['n0', 'n1', 'n2', 'n3'].map((k) => T.boca(k, E(k), t))) * 1.2);
    neide.g.updateMatrixWorld(true);
    if (t < E('FECHA') + 0.9) neide.mao('D', neide.g.worldToLocal(portaA.localToWorld(new V3(0.08, 1.05, 1.1))).toArray(), [-1, -0.4, -0.2]); else neide.solto('D', 0.05);
    if (t > E('n2') && t < E('n2') + EV.n2.d) neide.mao('E', [0.2, 1.05, 0.3], [1, -0.5, 0]); else neide.solto('E', 0.05);
    neide.cabeca.rotation.set(t > E('n1') && t < FIM('n3') ? 0.12 : 0, 0, 0);
    // ---------- Marcos (anda de um lado pro outro com o celular no alto) ----------
    const mx = 20.6 + Math.sin(t * 0.7) * 0.9 * (t < E('e5') ? 1 : 0.4);
    const MP = [mx, B, -12.0];
    marcos.g.position.set(...MP); marcos.g.visible = t > E('ESCADA');
    const andandoM = Math.abs(Math.cos(t * 0.7)) > 0.25 && !(t > E('m2') && t < FIM('m2'));
    marcos.g.rotation.y = (t > E('m1') - 0.3 && t < FIM('m1') + 0.5) || (t > E('m2') && t < FIM('m3') + 0.4) ? olhaNos(MP) : (Math.cos(t * 0.7) > 0 ? Math.PI / 2 : -Math.PI / 2);
    marcos.anda(t * 1.2, andandoM ? 0.3 : 0); if (!andandoM) marcos.pernas.forEach((q) => (q.rotation.x = 0));
    marcos.piscaAuto(t, 0.3); marcos.cenho(-0.7); marcos.olhar(0, 0);
    marcos.boca(Math.max(...['m0', 'm1', 'm2', 'm3'].map((k) => T.boca(k, E(k), t))) * 1.2);
    const celAlto = t < E('FECHA') + 1.2 || (t > E('e6') && t < E('n1'));
    marcos.mao('D', celAlto ? [-0.15, 1.75, 0.25] : [-0.12, 1.1, 0.32], [-1, -0.4, -0.2]);
    if (t > E('m2') && t < FIM('m2')) marcos.mao('E', [0.25, 1.25, 0.35], [1, -0.3, 0]); else marcos.solto('E', 0.07);
    marcos.cabeca.rotation.set(celAlto ? -0.35 : 0, 0, 0);
    marcos.g.updateMatrixWorld(true); celM.position.copy(marcos.br.D.mao.getWorldPosition(new V3())); celM.position.y += 0.06; celM.rotation.set(celAlto ? 0.3 : -0.5, marcos.g.rotation.y, 0); celM.visible = marcos.g.visible;
  });
  return { dur: DUR };
};
