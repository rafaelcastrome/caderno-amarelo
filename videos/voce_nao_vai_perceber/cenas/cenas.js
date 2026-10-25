// "Você não vai perceber" (cegueira à mudança), ~58 s, narração ElevenLabs (Gabriel) numa tomada só.
// Truque de rewatch: 3 coisas da "mesa" (camada fixa WB.overlay, visíveis desde o 1º quadro) mudam devagar:
//   1) camisa do bonequinho: amarelo -> azul (14 s -> 24 s, durante o gorila)
//   2) caneca de café some (27 s -> 33,5 s, durante a porta)
//   3) ponteiro do relógio: 3 h -> 8 h (36 s -> 46 s)
// O vídeo termina em "...porque" e o loop do app emenda em "Nesse vídeo...", com tudo de volta ao original.
// A marca d'água @cardeno_amarelo passeia entre 3 pontos seguros.
window.CENAS = function (WB) {
  const { INK, C, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const D = (c, t0, t1, st) => WB.draw(c, fr(c, t0), fr(c, t1), st);
  const W = (c, t0, t1, txt, x, y, size, cor, o = {}) => WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o });
  const rest = (c, t0, t1) => WB.restHand(c, fr(c, t0), fr(c, t1));
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 7, parent) => WB.strokePath(d, cor, w, parent);
  const mixHex = (a, b, u) => {
    const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16));
    return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], u)).toString(16).padStart(2, '0')).join('');
  };

  // =====================================================================
  // MESA (camada fixa): caneca, bonequinho e relógio. Aparecem prontos desde t = 0.
  // =====================================================================
  const desk = WB.group(WB.overlay);
  // caneca (some devagar)
  const mug = WB.group(desk);
  WB.mk('path', { d: WB.roughRect(70, 252, 142, 330), fill: '#8a5a33', 'fill-opacity': 1, stroke: 'none' }, mug);
  WB.showNow([
    sp(WB.roughRect(66, 246, 146, 334), INK.black, 6, mug),
    sp(`M 146 266 Q 182 272 180 292 Q 178 314 146 316`, INK.black, 6, mug),
    sp(`M 88 236 Q 80 222 90 208 Q 98 196 90 184`, INK.gray, 4, mug),
    sp(`M 118 236 Q 110 222 120 208 Q 128 196 120 184`, INK.gray, 4, mug),
  ]);
  WB.effect(t => mug.setAttribute('opacity', (1 - ease(clamp((t - 27.0) / 6.5))).toFixed(3)));

  // bonequinho com camisa (muda de cor devagar)
  const MX = 250, MY = 196, ms = 0.42, P = (dx, dy) => `${r1(MX + dx * ms)} ${r1(MY + dy * ms)}`;
  const shirt = WB.mk('path', {
    d: `M ${P(-46, 70)} L ${P(46, 70)} L ${P(40, 170)} L ${P(-40, 170)} Z`,
    fill: '#f2c230', stroke: INK.black, 'stroke-width': 5, 'stroke-linejoin': 'round',
  }, desk);
  WB.showNow([
    sp(WB.circlePath(MX, MY, 58 * ms), INK.black, 6, desk),
    sp(`M ${P(-22, -12)} L ${P(-20, -8)} M ${P(20, -12)} L ${P(22, -8)}`, INK.black, 7, desk),
    sp(`M ${P(-24, 18)} Q ${P(0, 38)} ${P(24, 18)}`, INK.black, 5, desk),
    sp(`M ${P(-44, 78)} L ${P(-86, 160)} M ${P(44, 78)} L ${P(86, 160)}`, INK.black, 6, desk),
    sp(`M ${P(-26, 170)} L ${P(-40, 290)} M ${P(26, 170)} L ${P(40, 290)}`, INK.black, 6, desk),
  ]);
  WB.effect(t => shirt.setAttribute('fill', mixHex('#f2c230', '#2f6fd0', ease(clamp((t - 14) / 10)))));

  // relógio (ponteiro das horas gira de 3 para 8)
  const CX = 985, CY = 258, CR = 60;
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6, r0 = i % 3 === 0 ? CR - 16 : CR - 10;
    ticks.push(`M ${r1(CX + Math.sin(a) * r0)} ${r1(CY - Math.cos(a) * r0)} L ${r1(CX + Math.sin(a) * (CR - 4))} ${r1(CY - Math.cos(a) * (CR - 4))}`);
  }
  WB.mk('circle', { cx: CX, cy: CY, r: CR, fill: '#fffaf0' }, desk);
  WB.showNow([
    sp(WB.circlePath(CX, CY, CR), INK.black, 6, desk),
    sp(ticks.join(' '), INK.black, 4, desk),
    sp(`M ${CX} ${CY} L ${CX} ${CY - CR + 14}`, INK.black, 5, desk),
  ]);
  const hourHand = WB.group(desk);
  WB.showNow([sp(`M ${CX} ${CY} L ${CX} ${CY - 34}`, INK.red, 8, hourHand)]);
  WB.effect(t => hourHand.setAttribute('transform', `rotate(${r1(lerp(90, 240, ease(clamp((t - 36) / 10))))} ${CX} ${CY})`));

  // =====================================================================
  // FOLHA 1 — gancho (cenas 1 e 2)
  // =====================================================================
  D(1, 0.10, 1.25, [
    sp(`M 290 700 Q 540 500 790 700 Q 540 900 290 700`, INK.black, 9),
    sp(WB.circlePath(540, 700, 92), INK.blue, 8),
  ]);
  const pupil = WB.mk('circle', { cx: 540, cy: 700, r: 42, fill: INK.black, 'fill-opacity': 0 });
  WB.effect(t => pupil.setAttribute('fill-opacity', clamp((t - 1.25) / 0.2).toFixed(3)));
  D(1, 1.27, 1.55, [sp(`M 300 620 L 260 570 M 400 560 L 385 500 M 540 540 L 540 478 M 680 560 L 695 500 M 780 620 L 820 570`, INK.black, 6)]);
  W(1, 1.6, 3.3, '1 coisa vai MUDAR', 540, 1010, 100, INK.black);
  W(1, 3.45, 5.1, 'VOCÊ NÃO VAI VER!', 540, 1160, 112, INK.red);

  // cena 2: cérebro que chuta
  D(2, 6.1, 7.4, [
    sp(WB.cloudPath(370, 1370, 160, 105), INK.purple, 8),
    sp(`M 370 1285 Q 350 1330 372 1370 Q 392 1410 368 1455`, INK.purple, 6),
  ]);
  W(2, 7.5, 8.2, '?', 370, 1405, 110, INK.purple);
  W(2, 8.9, 9.8, 'ele CHUTA!', 740, 1395, 96, INK.orange);

  // =====================================================================
  // FOLHA 2 — gorila (cenas 3, 4 e 5)
  // =====================================================================
  WB.newPage(3, 0, 0.06);
  W(3, 10.35, 11.3, 'Harvard, 1999', 540, 470, 88, INK.blue);
  const xs = [210, 540, 870];
  D(3, 11.4, 12.6, xs.map(x => C.stickFigure(x, 590, { scale: 0.58 })));
  D(3, 12.65, 13.2, [
    C.curvedArrow(250, 540, 375, 470, 500, 540, INK.orange, 5),
    C.curvedArrow(580, 540, 705, 470, 830, 540, INK.orange, 5),
  ]);
  W(3, 13.2, 13.9, 'passes: 1, 2, 3...', 540, 900, 66, INK.orange);

  // cena 4: o gorila no meio
  const gor = WB.group();
  const gBody = WB.mk('path', { d: `M 450 1050 Q 540 1015 630 1050 Q 680 1160 630 1270 Q 540 1300 450 1270 Q 400 1160 450 1050 Z`,
    fill: '#4a4a52', 'fill-opacity': 0 }, gor);
  const gHead = WB.mk('circle', { cx: 540, cy: 1000, r: 46, fill: '#4a4a52', 'fill-opacity': 0 }, gor);
  const gOut = [
    sp(WB.circlePath(540, 1000, 46), INK.black, 7, gor),
    sp(`M 450 1050 Q 540 1015 630 1050 Q 680 1160 630 1270 Q 540 1300 450 1270 Q 400 1160 450 1050`, INK.black, 8, gor),
    sp(`M 452 1070 Q 380 1170 410 1290 M 628 1070 Q 700 1170 670 1290`, INK.black, 9, gor),
    sp(`M 490 1280 L 478 1360 M 590 1280 L 602 1360`, INK.black, 9, gor),
  ];
  D(4, 15.3, 16.9, gOut);
  WB.fillAfter(gBody, gOut); WB.fillAfter(gHead, gOut);
  const gFace = [sp(`M 522 992 L 524 996 M 556 992 L 558 996`, INK.white, 8, gor), sp(`M 524 1020 Q 540 1030 556 1020`, INK.white, 5, gor)];
  D(4, 16.95, 17.2, gFace);
  D(4, 17.4, 17.95, [
    sp(`M 372 1110 L 345 1100 M 368 1140 L 338 1140 M 372 1170 L 345 1180`, INK.red, 6),
    sp(`M 708 1110 L 735 1100 M 712 1140 L 742 1140 M 708 1170 L 735 1180`, INK.red, 6),
  ]);
  W(4, 18.0, 18.55, 'TUM!', 220, 1160, 72, INK.red);
  W(4, 18.6, 19.15, 'TUM!', 860, 1160, 72, INK.red);
  WB.effect(t => {   // gorila batendo no peito: quica leve enquanto fala "batendo no peito"
    const k = t > 17.4 && t < 19.4 ? Math.abs(Math.sin((t - 17.4) * 9)) * 10 : 0;
    gor.setAttribute('transform', `translate(0 ${r1(-k)})`);
  });

  // cena 5: 46% não viu
  W(5, 19.9, 20.9, '46%', 330, 1490, 150, INK.red);
  W(5, 20.95, 21.6, 'NÃO VIU!', 730, 1475, 96, INK.red);
  D(5, 21.62, 22.05, C.circleAround(540, 1180, 210, 230, INK.red));

  // =====================================================================
  // FOLHA 3 — a porta (cenas 6 a 9)
  // =====================================================================
  WB.newPage(6, 0, 0.1);
  W(6, 22.45, 23.75, '"Ah, mas é vídeo..."', 540, 470, 80, INK.gray);
  W(6, 23.9, 24.45, 'Tá bom:', 540, 570, 72, INK.black);
  W(7, 24.7, 25.5, 'Cornell, 1998', 540, 680, 80, INK.blue);
  // A (pede informação, com mapa) e B (pedestre)
  const A1 = WB.group(), A2 = WB.group();
  const a1 = C.stickFigure(300, 850, { scale: 0.62 });   // traços vão para o grupo A1 (some na troca)
  for (const s of a1.flat(3)) A1.appendChild(s.el);
  D(7, 25.6, 26.3, a1);
  D(7, 26.3, 26.6, sp(WB.roughRect(330, 900, 410, 960), INK.green, 6, A1));
  D(7, 26.6, 27.3, C.stickFigure(780, 850, { scale: 0.62 }));
  // Porta (fica por cima dos bonecos)
  const door = WB.group();
  WB.mk('path', { d: WB.roughRect(40, 760, 200, 1180), fill: '#c8945a', 'fill-opacity': 1, stroke: 'none' }, door).setAttribute('opacity', 0);
  const doorFill = door.lastChild;
  const doorSt = [
    sp(WB.roughRect(40, 760, 200, 1180), INK.black, 8, door),
    sp(WB.roughRect(66, 800, 174, 950) + ' ' + WB.roughRect(66, 990, 174, 1140), INK.black, 4, door),
    sp(WB.circlePath(182, 975, 7), INK.black, 6, door),
  ];
  D(7, 27.5, 28.5, doorSt);
  WB.effect(t => doorFill.setAttribute('opacity', clamp((t - 28.5) / 0.25).toFixed(3)));
  const DX = t => {
    if (t < 28.7) return 0;
    if (t < 30.9) return lerp(0, 180, ease((t - 28.7) / 2.2));   // cobre o A (centro 120 -> 300)
    if (t < 32.9) return 180;
    if (t < 34.2) return lerp(180, 420, ease((t - 32.9) / 1.3)); // segue até o meio dos dois
    return 420;
  };
  WB.effect(t => {
    door.setAttribute('transform', `translate(${r1(DX(t))} 0)`);
    door.setAttribute('opacity', (1 - clamp((t - 34.3) / 0.5)).toFixed(3));
  });
  // troca atrás da porta (cena 8): A2 tem chapéu, bigode e outra cor
  const a2 = C.stickFigure(300, 850, { scale: 0.62, color: INK.red });
  for (const s of a2.flat(3)) A2.appendChild(s.el);
  WB.showNow(a2);
  const a2x = [
    sp(`M 250 822 L 350 822 M 268 822 Q 270 770 300 768 Q 330 770 332 822`, INK.black, 7, A2),
    sp(`M 284 866 Q 300 858 316 866`, INK.black, 6, A2),
    sp(WB.roughRect(330, 900, 410, 960), INK.green, 6, A2),
  ];
  WB.showNow(a2x);
  A2.setAttribute('opacity', 0);
  WB.effect(t => {
    const u = clamp((t - 32.4) / 0.15);
    A1.setAttribute('opacity', (1 - u).toFixed(3));
    A2.setAttribute('opacity', u.toFixed(3));
  });

  // cena 9: metade nem notou
  W(9, 34.4, 35.9, '1 em cada 2', 540, 1330, 110, INK.red);
  D(9, 36.3, 36.9, C.curvedArrow(780, 1110, 560, 1200, 330, 1120, INK.orange, 6));
  W(9, 37.0, 38.0, 'um estranho!', 540, 1215, 60, INK.orange);
  W(9, 38.25, 39.1, 'NEM NOTOU!', 540, 1470, 110, INK.red);

  // =====================================================================
  // FOLHA 4 — o nome + a pergunta (cenas 10 e 11)
  // =====================================================================
  WB.newPage(10, 0, 0.04);
  W(10, 40.25, 41.0, 'CEGUEIRA', 540, 580, 140, INK.red);
  const tm = W(10, 41.0, 41.6, 'À MUDANÇA', 540, 720, 120, INK.red);
  D(10, 41.62, 41.85, C.underline(540 - tm.width / 2, 540 + tm.width / 2, 752, INK.red));
  D(10, 41.9, 42.6, [sp(WB.cloudPath(250, 930, 140, 92), INK.purple, 8), sp(`M 250 850 Q 232 890 252 930 Q 270 970 248 1010`, INK.purple, 6)]);
  W(10, 42.7, 44.3, 'só o importante', 680, 950, 70, INK.green);
  D(10, 44.32, 44.55, C.check(910, 925, 28));
  W(10, 44.7, 45.8, 'o resto: INVENTA', 540, 1130, 84, INK.orange);
  W(11, 46.55, 47.3, 'Percebeu', 540, 1300, 104, INK.black);
  W(11, 47.32, 48.1, 'o que MUDOU?', 540, 1430, 104, INK.blue);

  // =====================================================================
  // FOLHA 5 — 3 mudanças + CTA + loop (cenas 12 e 13)
  // =====================================================================
  WB.newPage(12, 0, 0.05);
  const st = C.stamp('3 MUDANÇAS', 540, 660, { size: 112, rot: -8 });
  D(12, 49.6, 49.9, st.box); D(12, 49.9, 50.7, st.text);
  W(12, 50.9, 51.6, 'comenta quantas', 540, 900, 84, INK.black);
  W(12, 51.6, 52.3, 'você achou!', 540, 1005, 84, INK.black);
  WB.ctaRedes(13, fr(13, 52.5), fr(13, 55.3), { y: 1060, titulo: 'Me segue!', iconSize: 160 });
  W(13, 55.55, 56.3, 'Duvida?', 360, 470, 84, INK.orange);
  W(13, 56.4, 57.05, 'VOLTA!', 690, 470, 100, INK.orange);
  D(13, 57.07, 57.4, sp(WB.wavyLine(560, 820, 495, 5, 50), INK.orange, 7));
  rest(13, 57.42, 57.83);   // mão sai de cena: o 1º quadro do loop também está sem mão

  // =====================================================================
  // MARCA D'ÁGUA QUE PASSEIA: @cardeno_amarelo troca de lugar a cada ~5 s
  // =====================================================================
  const CTA0 = S[12].start;
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[560, 372], [770, 1612], [310, 1612]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const k = Math.floor(t / CYC), u = clamp((t - k * CYC - HOLD) / MOVE);
      const a = SPOTS[k % 3], b = SPOTS[(k + 1) % 3], e = ease(u);
      const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.3) / 0.4) * (1 - clamp((t - CTA0 + 0.2) / 0.4)) * 0.95).toFixed(3));
    });
  }
};
