// Teu braço vai subir sozinho (fenômeno de Kohnstamm): empurra a parede 30 s, solta, o braço flutua.
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (u) => 1 - Math.pow(1 - u, 3);
  const LW = 7;

  // ---- gancho no quadro 0
  WB.showNow(WB.textStrokes('TEU BRAÇO VAI', 540, 150, 104, INK.black, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('SUBIR SOZINHO', 540, 262, 104, INK.red, null, 'middle').strokes);

  // boneco de frente; o braço direito (lado da parede) fica num grupo próprio pra girar no ombro
  const ARM = 265;
  function boneco(x, headY, armDeg) {
    const sh = { x, y: headY + 100 };
    const hip = { x, y: headY + 360 };
    const body = [
      WB.strokePath(WB.circlePath(x, headY, 55), INK.black, LW),
      WB.strokePath(WB.roughLine(x, headY + 55, hip.x, hip.y, 1.5), INK.black, LW),
      WB.strokePath(WB.roughLine(sh.x, sh.y, x - 78, sh.y + 252, 1.5), INK.black, LW),
      WB.strokePath(WB.circlePath(x - 82, sh.y + 266, 15), INK.black, 6),
      WB.strokePath(WB.roughLine(hip.x, hip.y, x - 62, hip.y + 340, 1.5), INK.black, LW),
      WB.strokePath(WB.roughLine(hip.x, hip.y, x + 62, hip.y + 340, 1.5), INK.black, LW),
    ];
    const g = WB.group();
    const a = armDeg * Math.PI / 180;
    const hx = sh.x + Math.sin(a) * ARM, hy = sh.y + Math.cos(a) * ARM;
    const arm = [
      WB.strokePath(WB.roughLine(sh.x, sh.y, hx, hy, 1.5), INK.black, LW, g),
      WB.strokePath(WB.circlePath(hx + Math.sin(a) * 15, hy + Math.cos(a) * 15, 15), INK.black, 6, g),
    ];
    return { body, arm, g, sh, hand: { x: hx + Math.sin(a) * 15, y: hy + Math.cos(a) * 15 }, feetY: hip.y + 340 };
  }
  function parede(x, y0, y1, cor) {
    const tr = [WB.strokePath(WB.roughLine(x, y0, x, y1, 2), cor, 8)];
    let d = '';
    for (let y = y0 + 20; y < y1; y += 44) d += `M${x} ${y + 30} L${x + 60} ${y - 10} `;
    tr.push(WB.strokePath(d, cor, 3.5));
    return tr;
  }

  // ---- Folha 1 -------------------------------------------------------------
  // Cena 1: cronômetro de 30 s
  const SW = { x: 830, y: 560, r: 100 };
  WB.showNow([
    WB.strokePath(WB.circlePath(SW.x, SW.y, SW.r), INK.black, 7),
    WB.strokePath(WB.roughLine(SW.x, SW.y - SW.r, SW.x, SW.y - SW.r - 28, 1), INK.black, 7),
    WB.strokePath(WB.roughLine(SW.x - 26, SW.y - SW.r - 32, SW.x + 26, SW.y - SW.r - 32, 1), INK.black, 8),
    WB.textStrokes('30s', SW.x, SW.y + 26, 84, INK.red, null, 'middle').strokes,
  ]);
  WB.write(1, 0.10, 0.40, 'sem tu', SW.x, SW.y + SW.r + 72, 62, INK.gray, { anchor: 'middle' });
  WB.write(1, 0.42, 0.75, 'querer!', SW.x, SW.y + SW.r + 140, 62, INK.gray, { anchor: 'middle' });
  WB.restHand(1, 0.78, 1.0);

  // Cena 2: parede + boneco
  const WX = 600;
  const b1 = boneco(500, 540, 18);
  WB.draw(2, 0.02, 0.30, parede(WX, 400, 1250, INK.gray));
  WB.draw(2, 0.30, 0.38, WB.strokePath(WB.roughLine(140, 1250, WX, 1250, 2), INK.gray, 6));
  WB.draw(2, 0.40, 0.92, b1.body);
  WB.write(2, 0.58, 0.72, 'parede', 800, 960, 62, INK.gray, { anchor: 'middle' });
  WB.draw(2, 0.73, 0.90, C.arrow(730, 940, 676, 900, INK.gray, 5));

  // Cena 3: braço esticado, costas da mão na parede
  WB.draw(3, 0.02, 0.26, b1.arm);
  WB.draw(3, 0.30, 0.44, C.circleAround(b1.hand.x, b1.hand.y, 44, 44, INK.red));
  WB.writeLines(3, 0.48, 0.80, ['costas da mão', 'encostada na parede'], 400, 1322, 64, INK.red, { anchor: 'middle', lineHeight: 70 });
  WB.draw(3, 0.82, 0.92, C.arrow(470, 1268, b1.hand.x - 20, b1.hand.y + 52, INK.red, 5));
  WB.restHand(3, 0.93, 1.0);

  // Cena 4: empurra
  WB.draw(4, 0.06, 0.20, C.arrow(b1.hand.x - 120, b1.hand.y - 6, b1.hand.x - 30, b1.hand.y - 6, INK.red, 8));
  WB.write(4, 0.22, 0.48, 'EMPURRA!', 540, 1530, 120, INK.red, { anchor: 'middle' });
  WB.draw(4, 0.50, 0.66, C.arrow(b1.hand.x - 120, b1.hand.y + 30, b1.hand.x - 30, b1.hand.y + 30, INK.red, 8));
  WB.restHand(4, 0.70, 0.98);
  // a mão "treme" de força enquanto empurra
  WB.effect((t) => {
    const t0 = WB.at(4, 0.2), t1 = WB.at(5, 0.02);
    const on = t > t0 && t < t1;
    b1.g.setAttribute('transform', on ? `translate(${(Math.sin(t * 70) * 1.6).toFixed(2)} 0)` : '');
  });

  // ---- Folha 2: cronômetro gigante ------------------------------------------
  WB.newPage(5, 0, 0.05);
  const T0 = WB.at(5, 0), DUR = 30;
  const CX = 540, CY = 830, R = 300;
  WB.write(5, 0.06, 0.26, 'EMPURRA COM FORÇA!', 540, 230, 92, INK.red, { anchor: 'middle' });
  WB.draw(5, 0.27, 0.36, WB.strokePath(WB.circlePath(CX, CY, R), INK.black, 8));
  // arco vermelho que vai diminuindo
  const ring = WB.mk('path', { d: '', fill: 'none', stroke: INK.red, 'stroke-width': 26, 'stroke-linecap': 'round', opacity: 0.85 });
  // números 30..0
  const nums = [];
  for (let n = DUR; n >= 0; n--) {
    const g = WB.group(null, `translate(${CX} ${CY})`);
    g.style.display = 'none';
    WB.showNow(WB.textStrokes(String(n), 0, 95, 290, n <= 5 ? INK.red : INK.black, g, 'middle').strokes);
    nums[n] = g;
  }
  WB.effect((t) => {
    const e = t - T0;
    const show = t >= WB.at(5, 0.36) && t < WB.at(9, 1) + 0.0;
    const u = clamp(e / DUR);
    if (show && u < 1) {
      const a0 = -Math.PI / 2, a1 = a0 + 2 * Math.PI * (1 - u);
      const r = R - 38;
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      ring.setAttribute('d', `M${CX + r * Math.cos(a0)} ${CY + r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${(CX + r * Math.cos(a1)).toFixed(1)} ${(CY + r * Math.sin(a1)).toFixed(1)}`);
    } else ring.setAttribute('d', '');
    const n = Math.max(0, Math.ceil(DUR - e - 1e-6));
    nums.forEach((g, i) => {
      const vis = show && i === n;
      g.style.display = vis ? '' : 'none';
      if (vis) {
        const frac = (DUR - e) - Math.floor(DUR - e);
        const pulse = 1 + 0.08 * Math.max(0, frac - 0.8) / 0.2;
        g.setAttribute('transform', `translate(${CX} ${CY}) scale(${pulse.toFixed(3)})`);
      }
    });
  });
  WB.restHand(5, 0.40, 0.6);

  // gritos de incentivo, um de cada vez
  function grito(scene, txt, cor) {
    const g = WB.group();
    WB.write(scene, 0.0, 0.16, txt, 540, 1340, 110, cor, { anchor: 'middle', parent: g });
    return g;
  }
  const g6 = grito(6, 'NÃO PARA!', INK.red);
  WB.restHand(6, 0.2, 0.4);
  WB.fade(7, 0.0, 0.03, g6, 1, 0);
  const g7 = grito(7, 'CONTINUA!', INK.blue);
  WB.restHand(7, 0.2, 0.4);
  WB.fade(8, 0.0, 0.03, g7, 1, 0);
  grito(8, 'SÓ MAIS 5!', INK.red);
  WB.restHand(8, 0.2, 0.4);

  // ---- Folha 3: o braço sobe -------------------------------------------------
  WB.newPage(9, 0.05, 0.6);
  WB.write(10, 0.0, 0.28, 'SOLTA O BRAÇO...', 540, 220, 92, INK.black, { anchor: 'middle' });
  const b2 = boneco(470, 560, 10);
  WB.draw(10, 0.30, 0.50, parede(880, 470, 1260, INK.gray));
  WB.draw(10, 0.50, 0.56, WB.strokePath(WB.roughLine(250, 1260, 880, 1260, 2), INK.gray, 6));
  WB.draw(10, 0.56, 0.62, b2.body);
  WB.draw(10, 0.62, 0.64, b2.arm);
  WB.write(10, 0.66, 0.74, 'relaxa...', 540, 322, 60, INK.gray, { anchor: 'middle' });
  WB.restHand(10, 0.76, 0.9);
  // sobe sozinho: devagar, de 10° pra 82°, e balança de leve
  const R0 = WB.at(10, 0.74), R1 = WB.at(11, 0.62);
  const trail = WB.mk('path', { d: '', fill: 'none', stroke: INK.blue, 'stroke-width': 5, 'stroke-dasharray': '4 18', 'stroke-linecap': 'round' });
  WB.effect((t) => {
    const u = clamp((t - R0) / (R1 - R0));
    const ang = 72 * easeOut(u) + (u >= 1 ? Math.sin((t - R1) * 2.2) * 1.5 : 0);
    b2.g.setAttribute('transform', `rotate(${(-ang).toFixed(2)} ${b2.sh.x} ${b2.sh.y})`);
    if (u <= 0) { trail.setAttribute('d', ''); return; }
    const r = ARM + 30, a0 = (10) * Math.PI / 180, a1 = (10 + 72 * easeOut(u)) * Math.PI / 180;
    let d = '';
    for (let k = 0; k <= 24; k++) {
      const a = a0 + (a1 - a0) * k / 24;
      d += (k ? 'L' : 'M') + (b2.sh.x + Math.sin(a) * r).toFixed(1) + ' ' + (b2.sh.y + Math.cos(a) * r).toFixed(1);
    }
    trail.setAttribute('d', d);
  });

  // Cena 11: subiu sozinho + cérebro mandando empurrar
  WB.write(11, 0.02, 0.30, 'SUBIU SOZINHO!', 540, 1440, 112, INK.red, { anchor: 'middle' });
  WB.draw(11, 0.40, 0.60, C.thought(790, 440, 160, 85, 515, 520));
  WB.write(11, 0.62, 0.84, 'EMPURRA!', 790, 462, 62, INK.red, { anchor: 'middle' });
  WB.restHand(11, 0.86, 1.0);

  // ---- Folha 4: fato + desafio ----------------------------------------------
  WB.newPage(12, 0, 0.05);
  WB.write(12, 0.06, 0.20, 'Fenômeno de', 540, 420, 84, INK.black, { anchor: 'middle' });
  WB.write(12, 0.20, 0.38, 'KOHNSTAMM', 540, 540, 120, INK.blue, { anchor: 'middle' });
  WB.write(12, 0.40, 0.56, '+100 ANOS', 540, 790, 170, INK.red, { anchor: 'middle' });
  WB.writeLines(12, 0.60, 0.92, ['e a ciência ainda', 'discute o porquê'], 540, 960, 72, INK.black, { anchor: 'middle', lineHeight: 86 });

  WB.write(13, 0.02, 0.26, 'FAZ NUM AMIGO', 540, 1230, 96, INK.black, { anchor: 'middle' });
  WB.draw(13, 0.28, 0.40, WB.strokePath(WB.roundRectPath(110, 1320, 860, 170, 30), INK.gray, 6));
  WB.write(13, 0.42, 0.78, 'SUBIU ou NÃO SUBIU?', 540, 1430, 74, INK.red, { anchor: 'middle' });
  WB.restHand(13, 0.80, 1.0);

  // @ que passeia pelo rodapé
  const at = WB.group(WB.overlay);
  WB.showNow(WB.textStrokes('@Cardeno_Amarelo', 0, 0, 42, INK.gray, at, 'middle').strokes);
  WB.effect((t) => {
    const u = (Math.sin(t * 0.35) + 1) / 2;
    at.setAttribute('transform', `translate(${(260 + u * 560).toFixed(1)} 1872)`);
    at.setAttribute('opacity', 0.75);
  });
};
