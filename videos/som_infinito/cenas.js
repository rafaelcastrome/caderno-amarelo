// "O som que sobe pra sempre" (escala de Shepard). A trilha começa em t=0, uma nota a cada 0,42 s (12 por volta).
// c1 gancho + escada · c2 som sozinho (bolinha sobe sem fim) · c3 "já era pra tá fino" · c4 várias notas juntas
// c5 anda em círculo · c6 nome + Dunkirk · c7 manda pra quem tem nervo fraco
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const NOTA = 0.42;
  const passo = (t) => { const x = Math.max(0, t) / NOTA, k = Math.floor(x), f = x - k;
    const u = Math.min(1, f / 0.4); return { k, f, s: k + WB.ease(u), pulo: Math.sin(Math.PI * u) }; };

  WB.showNow(WB.textStrokes('ESSE SOM SOBE', 540, 205, 104, INK.black, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('PRA SEMPRE', 540, 330, 124, INK.red, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('(liga o som!)', 540, 420, 58, INK.orange, null, 'middle').strokes);

  // ---------- escada (folha 1) ----------
  const SW = 110, SH = 120, X0 = 100, Y0 = 1500;
  const degraus = (i0, i1) => {
    let d = `M ${X0 + i0 * SW} ${Y0 - i0 * SH}`;
    for (let i = i0; i < i1; i++) d += ` L ${X0 + (i + 1) * SW} ${Y0 - i * SH} L ${X0 + (i + 1) * SW} ${Y0 - (i + 1) * SH}`;
    return d;
  };
  const escada = WB.group();
  const visivel = WB.strokePath(degraus(0, 8), INK.black, 8, escada);
  WB.draw(1, 0.12, 0.85, visivel);
  const extras = WB.group(escada);
  const ext = [WB.strokePath(degraus(-9, 0), INK.black, 8, extras), WB.strokePath(degraus(8, 10), INK.black, 8, extras)];
  WB.showNow(ext); extras.setAttribute('opacity', 0);
  WB.fade(2, 0, 0.03, extras, 0, 1);
  // bolinha
  const BX = X0 + 4.5 * SW, BY = Y0 - 4 * SH - 36;
  const bola = WB.mk('circle', { cx: BX, cy: BY, r: 34, fill: '#f2b705', stroke: '#1f1f24', 'stroke-width': 6 }, WB.layer);
  bola.setAttribute('opacity', 0);
  WB.fade(1, 0.85, 0.95, bola, 0, 1);
  const tS = WB.at(2, 0), tF = WB.at(4, 0.05);
  WB.effect(t => {
    if (t < tS) { escada.setAttribute('transform', ''); bola.setAttribute('transform', ''); return; }
    const p = passo(t - tS), u = p.s % 8;
    escada.setAttribute('transform', `translate(${(-u * SW).toFixed(1)} ${(u * SH).toFixed(1)})`);
    bola.setAttribute('transform', `translate(0 ${(-p.pulo * 60).toFixed(1)})`);
  });

  // c3: já era pra tá fino
  WB.write(3, 0.05, 0.25, 'já devia tá', 90, 570, 66, INK.black);
  WB.write(3, 0.25, 0.45, 'FININHO!', 90, 680, 96, INK.red);
  WB.write(3, 0.55, 0.75, 'mas continua', 90, 800, 62, INK.black);
  WB.write(3, 0.75, 0.97, 'no mesmo lugar', 90, 890, 62, INK.black);

  // ---------- c4: várias notas juntas (folha 2) ----------
  WB.newPage(4, 0, 0.04);
  WB.write(4, 0.05, 0.2, 'várias notas juntas', 540, 330, 90, INK.black, { anchor: 'middle' });
  const notas = [], cores = [INK.blue, INK.purple, INK.green, INK.orange, INK.red];
  for (let i = 0; i < 5; i++) {
    const g = WB.group(); const y = 540 + i * 180;
    notas.push({ g, y, s: WB.strokePath(WB.wavyLine(300, 960, y, 20, 70), cores[i], 8, g) });
  }
  WB.draw(4, 0.21, 0.36, notas.map(n => n.s));
  WB.write(4, 0.37, 0.44, 'agudo', 90, 560, 58, INK.gray);
  WB.write(4, 0.44, 0.51, 'grave', 90, 1300, 58, INK.gray);
  const tM = WB.at(4, 0.4);
  WB.effect(t => {
    const dy = t < tM ? 0 : (t - tM) * 70;
    for (const n of notas) {
      let y = n.y - dy; y = 450 + ((((y - 450) % 900) + 900) % 900);
      const op = t < tM ? 1 : Math.exp(-0.5 * Math.pow((y - 900) / 220, 2));
      n.g.setAttribute('transform', `translate(0 ${(y - n.y).toFixed(1)})`);
      n.g.setAttribute('opacity', op.toFixed(3));
    }
  });
  WB.write(4, 0.55, 0.68, 'some!', 90, 660, 60, INK.red);
  WB.write(4, 0.75, 0.88, 'entra!', 90, 1200, 60, INK.green);
  WB.restHand(4, 0.9, 1);

  // ---------- c5: anda em círculo (folha 3) ----------
  WB.newPage(5, 0, 0.04);
  WB.writeLines(5, 0.05, 0.4, ['teu cérebro só ouve', 'as que tão subindo'], 540, 300, 76, INK.purple, { anchor: 'middle', lineHeight: 90 });
  const CX = 540, CY = 870, R1 = 330, R0 = 150;
  const raios = [];
  for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + i * Math.PI / 6;
    raios.push(WB.strokePath(WB.roughLine(CX + R0 * Math.cos(a), CY + R0 * Math.sin(a), CX + R1 * Math.cos(a), CY + R1 * Math.sin(a), 1.5), INK.black, 5)); }
  WB.draw(5, 0.45, 0.7, [WB.strokePath(WB.circlePath(CX, CY, R1), INK.black, 7), WB.strokePath(WB.circlePath(CX, CY, R0), INK.black, 7), raios]);
  const RB = (R0 + R1) / 2;
  const bola2 = WB.mk('circle', { cx: 0, cy: 0, r: 34, fill: '#f2b705', stroke: '#1f1f24', 'stroke-width': 6 }, WB.layer);
  bola2.setAttribute('opacity', 0); WB.fade(5, 0.7, 0.74, bola2, 0, 1);
  WB.effect(t => { const p = passo(t); const a = -Math.PI / 2 + (p.s % 12 + 0.5) * Math.PI / 6;
    bola2.setAttribute('transform', `translate(${(CX + RB * Math.cos(a)).toFixed(1)} ${(CY + RB * Math.sin(a) - p.pulo * 20).toFixed(1)})`); });
  WB.draw(5, 0.75, 0.85, C.curvedArrow(CX + 200, CY - R1 - 60, CX + R1 + 90, CY - R1 + 30, CX + R1 + 60, CY - 120, INK.orange, 8));
  WB.write(5, 0.86, 0.98, 'anda em CÍRCULO', 540, 1330, 86, INK.orange, { anchor: 'middle' });

  // c6: nome + Dunkirk
  WB.write(6, 0.05, 0.35, 'Escala de Shepard', 540, 1460, 92, INK.blue, { anchor: 'middle' });
  WB.write(6, 0.45, 0.8, 'usada no filme Dunkirk', 540, 1550, 62, INK.gray, { anchor: 'middle' });
  WB.restHand(6, 0.85, 1);

  // ---------- c7: manda pra quem tem nervo fraco (folha 4) ----------
  WB.newPage(7, 0, 0.05);
  WB.write(7, 0.06, 0.22, 'manda pra quem tem', 540, 420, 84, INK.black, { anchor: 'middle' });
  WB.write(7, 0.22, 0.4, 'NERVO FRACO', 540, 570, 130, INK.red, { anchor: 'middle' });
  WB.draw(7, 0.45, 0.55, C.arrow(540, 1250, 540, 760, INK.orange, 12));
  WB.writeLines(7, 0.56, 0.8, ['o som nunca', 'parou de subir'], 540, 1400, 90, INK.orange, { anchor: 'middle', lineHeight: 105 });
  WB.restHand(7, 0.85, 1);
};
