// "O clipe vingativo": cada item = uma cena (P, L, D). Clipe fiel ao meme (clipe.js), humanos = L.ator (perfil).
const FX = { t: -1, entra: 'fixo', esboco: false };
const CAMK = (P, ks) => P.camera(ks.map(([t, pos, alvo]) => ({ t, pos, alvo })));
const CHAO = (P, cor, z = 0.2, w = 6, x = 0) => P.deitado(P.F.ret(9, w, 0.02), { prof: 0.012, cor, z, x, ...FX });
const PAREDE = (P, cor, z = -2.2, h = 7) => P.peca(P.F.ret(11, h, 0.02), { prof: 0.04, cor, y: h / 2 - 0.2, z, ...FX });
// caixa de papelão com fita
const CAIXA = (P, x, y, z, w = 0.62, h = 0.46, d = 0.44, cor = 0xb88654, ry = 0) => {
  const g = P.grupo({ x, y, z, ry });
  P.caixa(w, h, d, { pai: g, cor, ...FX });
  P.peca(P.F.ret(w + 0.01, 0.07, 0.005), { pai: g, prof: 0.005, cor: 0xd9c7a0, y: h * 0.18, z: d / 2 + 0.004, ...FX });
  P.peca(P.F.ret(0.07, d, 0.005), { pai: g, prof: 0.005, cor: 0xd9c7a0, y: h / 2 + 0.004, rx: -Math.PI / 2, ...FX });
  return g;
};
// estante de metal com caixas
const ESTANTE = (P, x, z, cores) => {
  const g = P.grupo({ x, z });
  [-0.95, 0.95].forEach((px) => P.caixa(0.08, 2.9, 0.08, { pai: g, x: px, y: 1.45, z: 0.3, cor: 0x5d6a78, ...FX }));
  [-0.95, 0.95].forEach((px) => P.caixa(0.08, 2.9, 0.08, { pai: g, x: px, y: 1.45, z: -0.3, cor: 0x4d5864, ...FX }));
  [0.05, 1.0, 1.95, 2.85].forEach((py) => P.caixa(2.0, 0.06, 0.7, { pai: g, y: py, cor: 0x6f7c8a, ...FX }));
  let k = 0; [0.08, 1.03, 1.98].forEach((py) => [-0.55, 0.05, 0.6].forEach((px) => { if (cores[k % cores.length]) CAIXA(P, px + (k % 2) * 0.05, py + 0.25, 0, 0.5, 0.42, 0.5, cores[k % cores.length]); k++; }));
  return g;
};
// lâmpada pendurada
const LAMPADA = (P, x, y, z) => {
  P.caixa(0.02, 2, 0.02, { x, y: y + 1, z, cor: 0x222222, ...FX });
  P.peca(P.F.poligono([[-0.32, 0], [0.32, 0], [0.12, 0.22], [-0.12, 0.22]]), { prof: 0.3, cor: 0x3f4a3f, x, y, z, ...FX });
  P.peca(P.F.circulo(0.1), { prof: 0.05, cor: 0xfff2b8, x, y: y - 0.02, z: z + 0.16, ...FX });
};
const CRACHA = (P, o) => P.impresso(0.42, 0.58, (c, w, h) => {
  c.fillStyle = '#f8f6ef'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#2f6fb4'; c.fillRect(0, 0, w, h * 0.2);
  c.fillStyle = '#fff'; c.font = `bold ${w * 0.15}px sans-serif`; c.textAlign = 'center'; c.fillText('MICROSOFT', w / 2, h * 0.14);
  c.fillStyle = '#d8e4f0'; c.fillRect(w * 0.22, h * 0.25, w * 0.56, h * 0.36);
  // fotinho do clipe novo
  c.strokeStyle = '#8f89c0'; c.lineWidth = w * 0.035; c.beginPath(); c.moveTo(w * 0.45, h * 0.58); c.lineTo(w * 0.45, h * 0.33); c.arc(w * 0.5, h * 0.33, w * 0.05, Math.PI, 0); c.lineTo(w * 0.55, h * 0.56); c.arc(w * 0.5, h * 0.56, w * 0.08, 0, Math.PI); c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(w * 0.44, h * 0.42, w * 0.06, 0, 7); c.arc(w * 0.57, h * 0.42, w * 0.06, 0, 7); c.fill();
  c.fillStyle = '#111'; c.beginPath(); c.arc(w * 0.45, h * 0.42, w * 0.025, 0, 7); c.arc(w * 0.58, h * 0.42, w * 0.025, 0, 7); c.fill();
  c.fillStyle = '#222'; c.font = `bold ${w * 0.11}px sans-serif`; c.fillText('CLIPPY', w / 2, h * 0.72);
  c.font = `${w * 0.085}px sans-serif`; c.fillText('Assistente do Office', w / 2, h * 0.82); c.fillText('desde 1997', w / 2, h * 0.91);
}, Object.assign({ prof: 0.015, ...FX }, o));
// sala dos anos 90 (escritório)
const ESCRITORIO = (P, L) => {
  PAREDE(P, 0xd9cdb0, -2.0); CHAO(P, 0x8a7d6b, 0.0, 5);
  P.peca(P.F.ret(1.8, 1.3, 0.03), { prof: 0.05, cor: 0x7a5a3a, x: -1.6, y: 2.6, z: -1.96, ...FX });
  P.peca(P.F.ret(1.62, 1.12, 0.03), { prof: 0.05, cor: 0xa9d2ea, x: -1.6, y: 2.6, z: -1.92, ...FX });
  P.caixa(0.05, 1.12, 0.05, { x: -1.6, y: 2.6, z: -1.88, cor: 0x7a5a3a, ...FX });
};
const MESA = (P, x, z, w = 2.0) => { P.caixa(w, 0.1, 1.0, { x, y: 0.86, z, cor: 0x8e5a36, ...FX }); [-1, 1].forEach((k) => P.caixa(0.1, 0.81, 0.9, { x: x + k * (w / 2 - 0.08), y: 0.405, z, cor: 0x6a4026, ...FX })); };
const SEPIA = (L) => L.veu(0xb0874a, 0.28);
window.EP = [
  // 1 HOJE, depósito: clipe velho de capacete carregando caixa, gemendo
  (P, L, D) => {
    PAREDE(P, 0x8d8a80, -2.4); CHAO(P, 0x9b968c, 0.2, 6);
    ESTANTE(P, -1.6, -1.6, [0xb88654, 0xa87c4c, 0xc49866, 0, 0xb07e50]);
    ESTANTE(P, 1.7, -1.6, [0xa87c4c, 0xc49866, 0xb88654, 0xb07e50, 0]);
    LAMPADA(P, -0.2, 3.2, -0.6);
    // pilha de caixas à esquerda
    CAIXA(P, -1.4, 0.23, 0.6); CAIXA(P, -1.38, 0.69, 0.62, 0.62, 0.46, 0.44, 0xa87c4c, 0.08); CAIXA(P, -1.42, 1.15, 0.6, 0.62, 0.46, 0.44, 0xc49866, -0.05);
    P.impresso(1.0, 0.34, (c, w, h) => { c.fillStyle = '#e8d24a'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; c.font = `bold ${h * 0.55}px sans-serif`; c.textAlign = 'center'; c.fillText('DEPÓSITO', w / 2, h * 0.72); }, { x: 0.2, y: 3.0, z: -2.35, ...FX });
    L.clipe({ nome: 'clipe', velho: true, caixa: true, x: 1.6, z: 0.7, mov: [[0, 1.6], [D - 0.6, -0.55]], bracos: [[0, 'carrega']], olhar: [[0, [-0.6, -0.2]]], sobr: [[0, -0.8]], palp: [[0, 0.5]] });
    CAMK(P, [[0, [1.3, 2.6, 8.4], [0.8, 1.2, 0.4]], [D, [-0.3, 2.4, 7.6], [-0.4, 1.2, 0.4]]]);
  },
  // 2 caixa de cima cai, abre, sai o crachá; ele pega: "Peraí... meu crachá... da Microsoft."
  (P, L, D) => {
    PAREDE(P, 0x8d8a80, -2.4); CHAO(P, 0x9b968c, 0.2, 6);
    ESTANTE(P, -1.6, -1.6, [0xb88654, 0xa87c4c, 0xc49866, 0, 0xb07e50]);
    CAIXA(P, -1.4, 0.23, 0.6); CAIXA(P, -1.38, 0.69, 0.62, 0.62, 0.46, 0.44, 0xa87c4c, 0.08);
    const cai = CAIXA(P, -1.42, 1.15, 0.6, 0.62, 0.46, 0.44, 0xc49866, -0.05);
    const cr = CRACHA(P, {});
    const K = L.K;
    const caiP = K([[0, [-1.42, 1.15, 0.6, 0]], [0.35, [-1.42, 1.15, 0.6, 0]], [0.75, [-0.95, 0.23, 0.95, -1.4]]]);
    const crP = K([[0, [-0.95, 0.03, 0.95, -1.57, 0]], [0.8, [-0.95, 0.03, 0.95, -1.57, 0]], [1.3, [-0.35, 0.03, 1.1, -1.57, 0.6]], [2.3, [-0.35, 0.03, 1.1, -1.57, 0.6]], [2.9, [0.08, 0.6, 1.25, 0, 0.05]], [D, [0.08, 0.62, 1.25, 0, 0.05]]]);
    P.animar((ts, t) => {
      const [x, y, z, r] = caiP(t); cai.position.set(x, y, z); cai.rotation.z = r;
      const [a, b, c, rx, rz] = crP(t); cr.position.set(a, b, c); cr.rotation.set(rx, 0, rz); cr.visible = t > 0.75;
    });
    L.tremor([[0.75, 0.04, 0.3]]);
    L.clipe({ nome: 'clipe', velho: true, caixa: [[0, 1], [0.5, 0]], x: -0.15, z: 0.75, bracos: [[0, 'carrega'], [0.5, 'repouso', 0.3], [2.4, 'segura', 0.5]],
      olhar: [[0, [-0.4, -0.2]], [0.6, [-0.8, 0.1]], [1.2, [-0.3, -0.8]], [2.6, [0.5, -0.3]], [D, [0.5, -0.3]]], sobr: [[0, -0.8], [0.7, -2], [1.4, -0.4], [3.2, -2.2], [D, -1.6]], palp: [[0, 0.5], [0.7, 0.05], [1.6, 0.25], [3.2, 0], [D, 0]] });
    const larg = CAIXA(P, 1.0, 0.23, 0.9); P.animar((ts, t) => { larg.visible = t > 0.5; }); // a caixa que ele largou
    CAMK(P, [[0, [-0.4, 2.3, 6.8], [-0.5, 0.9, 0.6]], [2.4, [-0.2, 1.9, 5.6], [-0.1, 0.9, 0.8]], [D, [0.0, 1.55, 4.6], [-0.05, 0.95, 0.9]]]);
  },
  // 3 1997: clipe novinho no monitor: "Oi! Parece que você está escrevendo uma carta! Quer ajuda?" e o cara fecha ele
  (P, L, D) => {
    ESCRITORIO(P, L); SEPIA(L);
    MESA(P, 0.25, 0.3);
    // monitor de tubo bege
    const mon = P.grupo({ x: 0.3, y: 0.91, z: 0.15 });
    P.caixa(1.25, 1.0, 0.9, { pai: mon, y: 0.55, cor: 0xe2d9c0, ...FX });
    P.caixa(0.5, 0.08, 0.4, { pai: mon, y: 0.04, cor: 0xd6ccb0, ...FX });
    P.impresso(1.02, 0.78, (c, w, h) => { c.fillStyle = '#2d7f86'; c.fillRect(0, 0, w, h); c.fillStyle = '#c8c8c8'; c.fillRect(0, 0, w, h * 0.09); c.fillStyle = '#1f3f9a'; c.fillRect(0, 0, w * 0.7, h * 0.09);
      c.fillStyle = '#fff'; c.fillRect(w * 0.12, h * 0.15, w * 0.6, h * 0.8); const wd = (x, y, z) => { c.fillStyle = '#2b5fb4'; c.fillRect(x, y, z, z); c.fillStyle = '#1d4690'; c.fillRect(x, y, z * 0.38, z); c.fillStyle = '#fff'; c.font = `bold ${z * 0.62}px sans-serif`; c.textAlign = 'center'; c.fillText('W', x + z * 0.62, y + z * 0.74); c.textAlign = 'left'; }; wd(w * 0.015, h * 0.005, h * 0.08); wd(w * 0.15, h * 0.18, w * 0.15); c.fillStyle = '#555'; c.font = `${h * 0.055}px serif`; c.fillText('Prezado senhor,', w * 0.33, h * 0.29);
      for (let i = 0; i < 6; i++) { c.fillStyle = '#bbb'; c.fillRect(w * 0.16, h * (0.33 + i * 0.07), w * 0.5, h * 0.02); } }, { pai: mon, y: 0.57, z: 0.455, ...FX });
    P.caixa(1.0, 0.05, 0.35, { x: 0.15, y: 0.94, z: 0.62, cor: 0xd6ccb0, ...FX }); // teclado
    // cadeira e o cara digitando
    P.caixa(0.6, 0.08, 0.6, { x: -1.12, y: 0.62, z: 0.5, cor: 0x3a3a44, ...FX });
    P.caixa(0.08, 0.6, 0.08, { x: -1.12, y: 0.3, z: 0.5, cor: 0x222222, ...FX });
    L.ator({ nome: 'cara', x: -1.1, z: 0.62, D, t: -1, roupa: 0x9db4c8, poses: [[0, 'sentado+desenha'], [4.4, 'sentado+aponta', 0.2], [4.8, 'sentado+desenha', 0.3]] });
    L.clipe({ nome: 'clipe', s: 0.42, x: 0.62, y: 1.12, z: 0.66, folha: true, vis: [[0, 0], [0.44, 0], [0.45, 1], [4.69, 1], [4.7, 0]], bracos: [[0, 'aceno']], sobr: [[0, -2]], olhar: [[0, [-0.6, 0]]] });
    CAMK(P, [[0, [-0.2, 2.4, 8.8], [-0.2, 1.3, 0.4]], [D, [-0.15, 2.2, 7.8], [-0.15, 1.35, 0.4]]]);
  },
  // 4 sala do chefe: "Clipe... você tá demitido." / "Mas... por quê?! Eu ajudava todo mundo!" / "Sei lá. Só tá."
  (P, L, D) => {
    ESCRITORIO(P, L); SEPIA(L);
    MESA(P, 0.1, 0.4, 2.2);
    P.caixa(0.5, 0.04, 0.35, { x: 0.55, y: 0.93, z: 0.45, cor: 0xf4efe2, ...FX });
    L.ator({ nome: 'chefe', x: 0.85, z: -0.25, D, t: -1, terno: true, roupa: 0x4a4f5c, dir: -1, poses: [[0, 'normal'], [3.0, 'aponta', 0.3], [5.4, 'normal', 0.4], [9.5, 'abre_bracos', 0.3], [11.0, 'bolsos', 0.4]] });
    L.clipe({ nome: 'clipe', s: 0.62, x: -0.35, y: 0.91, z: 0.5, bracos: [[0, 'repouso'], [6.0, 'cima', 0.25], [7.9, 'abre', 0.35], [9.8, 'repouso', 0.5]],
      olhar: [[0, [0.6, 0.2]], [3.1, [0.3, -0.7]], [4.6, [0.6, 0.2]]], sobr: [[0, 0.2], [1.2, -1.2], [3.2, -2.2], [5.0, -1.4], [6.0, -2.2], [7.8, 1.0], [9.6, -2], [10.5, -1]], palp: [[0, 0], [10.5, 0.25]] });
    CAMK(P, [[0, [0.3, 2.4, 7.6], [0.2, 1.55, 0.2]], [D, [0.15, 2.2, 6.8], [0.15, 1.55, 0.2]]]);
  },
  // 5 de volta ao depósito: olhando o crachá, a raiva sobe: "Vinte anos... sem motivo nenhum."
  (P, L, D) => {
    PAREDE(P, 0x8d8a80, -2.4); CHAO(P, 0x9b968c, 0.2, 6);
    ESTANTE(P, -1.4, -1.6, [0xb88654, 0xa87c4c, 0xc49866, 0, 0xb07e50]);
    L.clipe({ nome: 'clipe', velho: true, x: 0, z: 0.8, bracos: [[0, 'segura']], olhar: [[0, [0.5, -0.3]], [1.6, [0, 0]]], sobr: [[0, -1.2], [1.0, -0.4], [2.2, 1.2], [D, 1.3]], palp: [[0, 0.1], [1.6, 0.3], [D, 0.35]] });
    CRACHA(P, { x: 0.08, y: 0.62, z: 1.25, rz: 0.05 });
    L.veu(0x8a1010, (t) => Math.min(0.22, Math.max(0, (t - 1.8) * 0.12)));
    CAMK(P, [[0, [0.3, 1.6, 5.0], [0.05, 0.95, 0.9]], [D, [0.0, 1.55, 4.7], [0.0, 1.0, 0.9]]]);
  },
  // 6 sala dos servidores: "Parece que você está tentando mandar um e-mail..." e puxa o cabo
  (P, L, D) => {
    const TP = 17.5; // puxão
    PAREDE(P, 0x2c3440, -2.4); CHAO(P, 0x3a414c, 0.2, 6);
    const leds = [];
    const RACK = (x, z) => { const g = P.grupo({ x, z });
      P.caixa(1.0, 2.8, 0.8, { pai: g, y: 1.4, cor: 0x1f242c, ...FX });
      for (let i = 0; i < 9; i++) { P.caixa(0.86, 0.22, 0.02, { pai: g, y: 0.35 + i * 0.27, z: 0.41, cor: 0x343b46, ...FX });
        for (let j = 0; j < 3; j++) { const m = new P.THREE.Mesh(new P.THREE.CircleGeometry(0.025, 10), new P.THREE.MeshBasicMaterial({ color: [0x58f06a, 0x4fb3ff, 0xffb34a][(i + j) % 3] })); m.position.set(0.28 + j * 0.08, 0.35 + i * 0.27, 0.425); g.add(m); leds.push(m); } }
      return g; };
    RACK(1.55, -0.1); RACK(-1.9, -0.6); RACK(-0.75, -1.3); RACK(0.45, -1.3); RACK(2.2, -1.4);
    P.impresso(1.9, 0.42, (c, w, h) => { c.fillStyle = '#c93a2e'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = `bold ${h * 0.5}px sans-serif`; c.textAlign = 'center'; c.fillText('SERVIDOR DE E-MAIL', w / 2, h * 0.68); }, { x: -0.3, y: 3.15, z: -2.35, ...FX });
    // tela do Copilot (bolinha colorida que pulsa com a fala) num pedestal à esquerda
    const BCP = window.BOCA && window.BOCA.copilot;
    P.caixa(0.08, 1.2, 0.08, { x: -1.35, y: 0.6, z: -0.1, cor: 0x1a1e24, ...FX });
    P.caixa(0.5, 0.05, 0.4, { x: -1.35, y: 0.03, z: -0.1, cor: 0x1a1e24, ...FX });
    P.caixa(1.15, 0.85, 0.08, { x: -1.35, y: 1.62, z: -0.1, cor: 0x15181d, ...FX });
    const cvc = document.createElement('canvas'); cvc.width = 300; cvc.height = 220; const txc = new P.THREE.CanvasTexture(cvc); txc.colorSpace = P.THREE.SRGBColorSpace;
    const telaC = new P.THREE.Mesh(new P.THREE.PlaneGeometry(1.03, 0.74), new P.THREE.MeshBasicMaterial({ map: txc })); telaC.position.set(-1.35, 1.62, -0.05); P.raiz.add(telaC);
    P.animar((ts, t) => { const g = cvc.getContext('2d'); g.fillStyle = '#0b0f1a'; g.fillRect(0, 0, 300, 220);
      const on = t > 1.0 && t < TP + 0.15; if (on) {
        const fr = BCP ? BCP[Math.min(BCP.length - 1, Math.round(t * 30))] || 0 : 0; const r = 46 + fr * 16 + Math.sin(t * 3) * 3;
        const cols = ['#ff5ca8', '#7a5cff', '#2fd4ff', '#3ce58a', '#ffb13b'];
        cols.forEach((c, i) => { const a = t * 1.6 + i * 1.256; g.fillStyle = c; g.globalAlpha = 0.75; g.beginPath(); g.ellipse(150 + Math.cos(a) * r * 0.45, 95 + Math.sin(a) * r * 0.35, r * 0.75, r * 0.55, a, 0, 7); g.fill(); });
        g.globalAlpha = 1; g.fillStyle = '#fff'; g.beginPath(); g.arc(135, 92, 7, 0, 7); g.arc(165, 92, 7, 0, 7); g.fill();
        g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; g.fillStyle = '#e8f4ff'; g.fillText('Copilot', 150, 196); }
      txc.needsUpdate = true; });
    // tomada na lateral do rack da frente e o plugue com cabo grosso
    P.caixa(0.04, 0.42, 0.34, { x: 1.04, y: 0.95, z: 0.05, cor: 0xb7bcc4, ...FX });
    const plug = P.grupo({ x: 0.93, y: 0.95, z: 0.05 });
    P.caixa(0.2, 0.17, 0.17, { pai: plug, cor: 0x2e2e33, ...FX });
    [-0.04, 0.04].forEach((dy) => P.caixa(0.08, 0.025, 0.025, { pai: plug, x: 0.13, y: dy, cor: 0xcfcfcf, ...FX }));
    const T3 = P.THREE; const matC = new T3.MeshStandardMaterial({ color: 0x151515, roughness: 0.5 });
    const cabo = new T3.Mesh(new T3.BufferGeometry(), matC); cabo.castShadow = true; P.raiz.add(cabo);
    const faz = (px, py, pz) => { const c = new T3.CatmullRomCurve3([new T3.Vector3(px - 0.1, py, pz), new T3.Vector3(px - 0.35, py - 0.2, pz + 0.1), new T3.Vector3(px - 0.4, 0.25, pz + 0.3), new T3.Vector3(px - 0.2, 0.07, pz + 0.7), new T3.Vector3(0.6, 0.07, 1.6), new T3.Vector3(-0.5, 0.07, 2.4)]);
      cabo.geometry.dispose(); cabo.geometry = new T3.TubeGeometry(c, 60, 0.045, 10, false); };
    const plugX = L.K([[0, 0.93], [TP, 0.93], [TP + 0.25, 0.25], [D, 0.2]]);
    // faíscas
    const fa = P.grupo({ x: 1.03, y: 0.95, z: 0.1 });
    for (let i = 0; i < 7; i++) P.peca(P.F.estrela(0.12 + (i % 3) * 0.05, 0.04, 5), { pai: fa, prof: 0.01, cor: i % 2 ? 0xfff2a0 : 0xffd040, x: -0.1 + Math.cos(i) * 0.25, y: Math.sin(i * 1.7) * 0.25, z: 0.05, t: -1, entra: 'fixo', esboco: false });
    P.animar((ts, t) => { const x = plugX(t); plug.position.x = x; faz(x, 0.95, 0.05);
      const k = t - TP - 0.1; fa.visible = k > 0 && k < 0.6 && Math.floor(t * 24) % 2 === 0; fa.scale.setScalar(0.6 + k * 1.5);
      leds.forEach((m, i) => { m.visible = t < TP + 0.15 && ((Math.floor(t * 6 + i * 1.7) % 4) !== 0); }); });
    L.flash(TP + 0.12, 0.1, 0xfff4c0);
    L.veu(0x05070c, (t) => (t < TP + 0.25 ? 0 : Math.min(0.72, (t - TP - 0.25) * 2)));
    L.tremor([[TP + 0.1, 0.06, 0.5]]);
    L.clipe({ nome: 'clipe', velho: true, capacete: true, x: -2.6, z: 0.35, mov: [[0, -2.6, 0.35], [1.3, -0.35, 0.35], [12.9, -0.35, 0.35], [13.7, -0.05, 0.15], [TP, -0.05, 0.15], [TP + 0.25, -0.75, 0.15], [D, -0.78, 0.15]],
      bracos: [[0, 'repouso'], [13.9, 'alcancaD', 0.4], [TP, 'puxa', 0.15]], inclina: [[0, -0.05], [TP, -0.05], [TP + 0.2, 0.25], [D, 0.12]],
      olhar: [[0, [0.6, 0]], [1.2, [-0.9, 0.2]], [9.3, [-0.9, 0.2]], [9.9, [-0.2, 0]], [13.6, [-0.2, 0]], [14.0, [0.9, -0.2]], [14.9, [-0.1, 0]], [TP - 0.3, [0.9, -0.2]]],
      sobr: [[0, 1.1], [1.4, -2], [3.5, 0.6], [9.4, 1.3]], palp: [[0, 0.32], [1.4, 0], [3.5, 0.2], [9.4, 0.38]] });
    CAMK(P, [[0, [-0.8, 2.5, 7.8], [-0.7, 1.2, 0.0]], [1.6, [-0.8, 2.2, 6.8], [-0.8, 1.2, 0.0]], [8.9, [-0.8, 2.1, 6.3], [-0.8, 1.2, 0.0]], [9.7, [-0.35, 1.7, 4.6], [-0.35, 1.05, 0.3]],
      [13.3, [-0.3, 1.65, 4.3], [-0.3, 1.05, 0.3]], [14.3, [0.5, 2.2, 7.2], [0.5, 1.1, 0.0]], [TP, [0.55, 2.0, 6.8], [0.5, 1.05, 0.0]], [D, [0.2, 2.0, 7.0], [0.2, 1.05, 0.0]]]);
  },
  // 7 no escuro, só os olhos: "...Quer ajuda?"
  (P, L, D) => {
    PAREDE(P, 0x2c3440, -2.4); CHAO(P, 0x3a414c, 0.2, 6);
    L.veu(0x020306, 0.88);
    const tela = (x, y, z) => { const m = P.impresso(0.9, 0.5, (c, w, h) => { c.fillStyle = '#100'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff3b30'; c.font = `bold ${h * 0.3}px sans-serif`; c.textAlign = 'center'; c.fillText('FORA DO AR', w / 2, h * 0.62); }, { x, y, z, ...FX });
      m.traverse((o) => { if (o.isMesh) { o.material = (Array.isArray(o.material) ? o.material : [o.material]).map((mm) => new P.THREE.MeshBasicMaterial({ map: mm.map, color: 0xffffff, depthTest: false, transparent: true, opacity: 0.9 })); o.renderOrder = 999; } });
      P.animar((ts, t) => { m.visible = Math.floor(t * 3) % 2 === 0 || t > 1.2; }); };
    tela(-1.3, 2.4, -1.8); tela(1.4, 2.2, -1.8);
    const c = L.clipe({ nome: 'clipe', velho: true, x: 0, z: 0.9, brilho: [[0, 1]], sobr: [[0, 1.3]], palp: [[0, 0.36]], olhar: [[0, [0, -0.1]]] });
    c.traverse((o) => { if (o.isMesh) { const ms = Array.isArray(o.material) ? o.material : [o.material]; if (ms.some((m) => m.emissiveMap)) { ms.forEach((m) => { m.depthTest = false; m.transparent = true; }); o.renderOrder = 1000; } } });
    CAMK(P, [[0, [0.05, 1.7, 5.6], [0.05, 1.15, 1.5]], [D, [0.05, 1.6, 4.9], [0.05, 1.15, 1.5]]]);
  },
];
