// Exemplo: mala de papel com etiqueta de matrioska (mesma cena 1 do "Eu adivinho"), 4.5 s.
window.CENA = (P) => {
  const { F, CORES: C } = P;
  const m = P.grupo({ y: 0, z: 0 });
  // corpo e tampa (camadas de papelão empilhadas)
  P.peca(F.ret(3.1, 2.1, 0.28), { pai: m, prof: 0.8, cor: C.VERMELHO, y: 1.08, t: 0.3 });
  P.peca(F.ret(2.8, 1.8, 0.2), { pai: m, prof: 0.02, cor: P.costura(0xd84a3c, { w: 512, h: 330, margem: 14, linha: 'rgba(120,30,25,0.6)' }), y: 1.06, z: 0.405, t: 0.75 });
  P.peca(F.ret(3.14, 0.07, 0.03), { pai: m, prof: 0.84, cor: C.VERMELHO2, y: 1.5, t: 0.95 });
  // tiras de couro com fivela
  [-0.85, 0.85].forEach((x, i) => {
    P.peca(F.ret(0.28, 2.16, 0.06), { pai: m, prof: 0.86, cor: P.costura(C.MARROM, { w: 64, h: 512, margem: 9, grossura: 3 }), x, y: 1.08, t: 1.2 + i * 0.18 });
    P.peca(F.anel(0.17, 0.1), { pai: m, prof: 0.05, cor: C.DOURADO, x, y: 1.62, z: 0.46, t: 1.65 + i * 0.12, entra: 'pop' });
  });
  // cantoneiras e rebites
  [[-1, -1, 0], [1, -1, 1], [-1, 1, 2], [1, 1, 3]].forEach(([sx, sy, k]) => {
    const rz = { '-1,-1': 0, '1,-1': Math.PI / 2, '1,1': Math.PI, '-1,1': -Math.PI / 2 }[sx + ',' + sy];
    const x = sx * 1.53, y = 1.08 + sy * 1.03; // cantoneira triangular de couro colada no canto
    P.peca(F.poligono([[0, 0], [0.6, 0], [0.5, 0.12], [0.12, 0.5], [0, 0.6]]), { pai: m, prof: 0.03, cor: C.MARROM, x, y, z: 0.425, rz, t: 2.0 + k * 0.1 });
    P.rebite({ pai: m, x: x - sx * 0.17, y: y - sy * 0.17, z: 0.45, t: 2.45 + k * 0.06, entra: 'pop' });
  });
  // alça
  P.peca(F.arco(0.52, 0.36), { pai: m, prof: 0.18, cor: C.MARROM, y: 2.12, t: 2.7 });
  [-0.44, 0.44].forEach((x, i) => P.peca(F.ret(0.22, 0.12, 0.03), { pai: m, prof: 0.24, cor: C.DOURADO, x, y: 2.17, t: 2.9 + i * 0.08 }));
  // etiqueta com matrioska (o segredo escondido)
  const etq = P.grupo({ pai: m, x: 0.4, y: 2.12, z: 0.47 });
  P.peca(F.ret(0.016, 0.34, 0.005), { pai: etq, prof: 0.016, cor: 0xf4ecd8, y: -0.17, t: 3.1, entra: 'pop', esboco: false });
  const forma = F.poligono([[-0.27, -0.42], [0.27, -0.42], [0.27, 0.3], [0, 0.44], [-0.27, 0.3]]);
  P.impresso(0.54, 0.86, (g, w, h) => {
    g.fillStyle = '#f6eedb'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c9bfa8'; g.beginPath(); g.arc(w / 2, h * 0.11, w * 0.06, 0, 7); g.fill();
    const cx = w / 2, cy = h * 0.6;
    g.fillStyle = '#d63a2f'; g.beginPath(); g.ellipse(cx, cy + h * 0.08, w * 0.3, h * 0.26, 0, 0, 7); g.fill();
    g.beginPath(); g.arc(cx, cy - h * 0.18, w * 0.24, 0, 7); g.fill();
    g.fillStyle = '#f7d9bd'; g.beginPath(); g.arc(cx, cy - h * 0.17, w * 0.15, 0, 7); g.fill();
    g.fillStyle = '#4a3020'; g.beginPath(); g.arc(cx - w * 0.055, cy - h * 0.18, w * 0.017, 0, 7); g.arc(cx + w * 0.055, cy - h * 0.18, w * 0.017, 0, 7); g.fill();
    g.fillStyle = '#ef8a8a'; g.beginPath(); g.arc(cx - w * 0.08, cy - h * 0.145, w * 0.025, 0, 7); g.arc(cx + w * 0.08, cy - h * 0.145, w * 0.025, 0, 7); g.fill();
    g.fillStyle = '#f3c534'; g.beginPath(); g.ellipse(cx, cy + h * 0.1, w * 0.18, h * 0.14, 0, 0, 7); g.fill();
    g.fillStyle = '#3e8d58'; for (let a = 0; a < 6; a++) { g.beginPath(); g.ellipse(cx + Math.cos(a) * w * 0.08, cy + h * 0.1 + Math.sin(a) * w * 0.08, w * 0.045, w * 0.025, a, 0, 7); g.fill(); }
    g.fillStyle = '#d63a2f'; g.beginPath(); g.arc(cx, cy + h * 0.1, w * 0.04, 0, 7); g.fill();
  }, { pai: etq, forma, y: -0.78, t: 3.2, entra: 'pop' });
  P.animar((ts) => { etq.rotation.z = ts > 3.6 ? Math.sin((ts - 3.6) * 5) * 0.16 * Math.exp(-(ts - 3.6) * 1.2) : 0; });
  P.camera([{ t: 0, pos: [0.5, 10.6, 13.4], alvo: [0, 0.9, 0.4] }, { t: 4.5, pos: [0.2, 9.6, 12.0], alvo: [0, 1.0, 0.5] }]);
  return { dur: 4.5 };
};
