// "Ligação do teu próprio número" parte 1 (PRÉVIA, ~26 s). Câmera em 1ª pessoa: as mãos de quem assiste aparecem embaixo.
// Legendas no topo, cor por personagem: mãe roxo, tu azul, voz do telefone vermelho.
// c1 mãe grita · c2 tênis · c3 toque (vira folha, celular) · c4 meu número? · c5 alô · c6 não entra no ônibus
// c7 quem tá falando · c8 sou eu daqui a 20 min · c9 chamada encerrada · c10 mãe: quem era? + CONTINUA
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const wmRect = document.querySelector('rect[fill="#fffaf0"]');
  if (wmRect) { const wm = wmRect.parentNode; WB.effect(t => wm.setAttribute('transform', `translate(${(280 * Math.sin(2 * Math.PI * t / 14)).toFixed(1)} 0)`)); }
  const T = (c, f) => WB.at(c, f);
  function ate(g, tA, tB) {
    WB.effect(t => {
      let o = t < tA ? 1 : Math.max(0, 1 - (t - tA) / 0.18);
      if (tB !== undefined && t >= tB) o = Math.min(1, (t - tB) / 0.18);
      g.setAttribute('opacity', o.toFixed(3));
    });
  }
  function janela(g, tA, tB) {  // visível só entre tA e tB (legendas)
    WB.effect(t => g.setAttribute('opacity', (t >= tA && t < tB) ? 1 : 0));
  }
  const LEG = { mae: INK.purple, tu: INK.blue, tel: INK.red };
  const QUEM = { mae: 'MÃE', tu: 'TU', tel: 'NO TELEFONE' };
  function legenda(cena, quem, txt) {
    const g = WB.group(WB.overlay);
    WB.showNow(WB.textStrokes(QUEM[quem], 540, 120, 44, LEG[quem], g, 'middle').strokes);
    let ls = WB.wrap(txt, 74, 900);
    if (ls.length === 2) {  // quebra equilibrada (sem palavra sozinha na 2ª linha)
      const w = txt.split(' '); let best = null;
      for (let k = 1; k < w.length; k++) { const a = w.slice(0, k).join(' '), b = w.slice(k).join(' ');
        const d = Math.max(WB.measure(a, 74), WB.measure(b, 74)); if (!best || d < best[0]) best = [d, [a, b]]; }
      ls = best[1];
    }
    ls.forEach((l, i) => WB.showNow(WB.textStrokes(l, 540, 200 + i * 78, 74, LEG[quem], g, 'middle').strokes));
    janela(g, T(cena, 0), T(cena, 1));
  }
  legenda(1, 'mae', '"Filho! Tu vai perder o ônibus das 7!"');
  legenda(2, 'tu', '"Tô indo, mãe! Só tô achando o tênis..."');
  legenda(4, 'tu', '"Ué... esse número aí é o meu."');
  legenda(5, 'tu', '"Alô?"');
  legenda(6, 'tel', '"Não entra no ônibus das 7."');
  legenda(7, 'tu', '"Quem tá falando?"');
  legenda(8, 'tel', '"Sou eu. Daqui a 20 minutos."');
  legenda(10, 'mae', '"Filho? Quem era no telefone?"');

  // ======== FOLHA 1: quarto, de manhã (tu olhando pra frente) ========
  // porta da cozinha à esquerda e relógio à direita já aparecem no quadro 0
  const porta = [
    WB.strokePath(WB.roughRect(90, 470, 400, 1180), INK.black, 8),
    WB.strokePath('M 120 500 L 370 500 L 370 1180 M 120 500 L 120 1180', INK.black, 5),
    WB.strokePath(WB.circlePath(335, 840, 14), INK.black, 6)];
  WB.showNow(porta);
  WB.showNow(WB.textStrokes('cozinha', 245, 440, 52, INK.gray, undefined, 'middle').strokes);
  WB.showNow(WB.strokePath(WB.circlePath(760, 640, 150), INK.black, 9));
  WB.showNow([0, 1, 2, 3].map(k => { const a = k * Math.PI / 2; return WB.strokePath(`M ${760 + 128 * Math.cos(a)} ${640 + 128 * Math.sin(a)} L ${760 + 145 * Math.cos(a)} ${640 + 145 * Math.sin(a)}`, INK.black, 7); }));
  // chão / beira da cama
  WB.showNow(WB.strokePath(WB.roughLine(60, 1300, 1020, 1300, 4), INK.black, 6));
  // c1: ponteiros 6:52 + grito saindo da porta
  WB.draw(1, 0.02, 0.18, [
    WB.strokePath('M 760 640 L 760 518', INK.red, 9),
    WB.strokePath(`M 760 640 L ${760 + 80 * Math.cos(-Math.PI / 2 + 2 * Math.PI * (6.87 / 12))} ${640 + 80 * Math.sin(-Math.PI / 2 + 2 * Math.PI * (6.87 / 12))}`, INK.black, 12)]);
  WB.write(1, 0.2, 0.36, '6:52', 760, 900, 96, INK.red, { anchor: 'middle' });
  const grito = WB.group();
  WB.draw(1, 0.4, 0.6, WB.strokePath('M 420 690 L 500 650 L 480 700 L 560 690 L 495 735 L 545 780 L 470 760 L 440 810', INK.purple, 7, grito));
  WB.write(1, 0.62, 0.82, 'FILHO!', 560, 1070, 92, INK.purple, { anchor: 'middle', parent: grito });
  WB.restHand(1, 0.84, 0.98);
  // c2: tênis embaixo, com as tuas mãos pegando
  const tenis = 'M 360 1560 Q 350 1450 420 1440 L 520 1440 Q 560 1500 640 1510 Q 740 1520 740 1580 L 740 1610 L 360 1610 Z';
  WB.draw(2, 0.02, 0.3, [WB.strokePath(tenis, INK.black, 8), WB.strokePath('M 360 1590 L 740 1590', INK.black, 6),
    WB.strokePath('M 470 1460 L 510 1490 M 455 1485 L 500 1515 M 445 1510 L 490 1540', INK.red, 6)]);
  WB.draw(2, 0.32, 0.62, [
    WB.strokePath('M 120 1920 Q 220 1700 330 1560 Q 360 1530 390 1560 Q 400 1590 370 1620 L 260 1920', INK.black, 8),
    WB.strokePath('M 960 1920 Q 860 1700 760 1570 Q 730 1540 705 1575 Q 700 1600 720 1625 L 830 1920', INK.black, 8)]);
  WB.write(2, 0.66, 0.86, 'cadê o outro?!', 760, 1220, 64, INK.blue, { anchor: 'middle' });
  WB.restHand(2, 0.88, 0.99);

  // ======== FOLHA 2: o celular toca ========
  WB.newPage(3, 0, 0.1);
  const cel = WB.group();
  const X0 = 300, X1 = 780, Y0 = 380, Y1 = 1300;
  WB.draw(3, 0.11, 0.36, [WB.strokePath(WB.roundRectPath(X0, Y0, X1 - X0, Y1 - Y0, 60), INK.black, 10, cel),
    WB.strokePath(WB.roundRectPath(X0 + 28, Y0 + 70, X1 - X0 - 56, Y1 - Y0 - 140, 18), INK.black, 5, cel)]);
  const topo = WB.group(cel);
  WB.write(3, 0.38, 0.5, 'chamada recebida', 540, 560, 50, INK.gray, { anchor: 'middle', parent: topo });
  WB.write(3, 0.51, 0.62, 'EU', 540, 720, 140, INK.black, { anchor: 'middle', parent: cel });
  WB.write(3, 0.63, 0.8, '(51) 9 9634-2817', 540, 810, 56, INK.black, { anchor: 'middle', parent: cel });
  const bR = WB.mk('circle', { cx: 420, cy: 1120, r: 58, fill: '#e04848', 'fill-opacity': 0 }, cel);
  const bG = WB.mk('circle', { cx: 660, cy: 1120, r: 58, fill: '#3fae5a', 'fill-opacity': 0 }, cel);
  const sR = WB.strokePath(WB.circlePath(420, 1120, 58), INK.red, 7, cel), sG = WB.strokePath(WB.circlePath(660, 1120, 58), INK.green, 7, cel);
  WB.draw(3, 0.81, 0.92, [sR, sG]); WB.fillAfter(bR, [sR], 0.1); WB.fillAfter(bG, [sG], 0.1);
  // tuas mãos segurando o celular
  WB.draw(3, 0.93, 0.995, [
    WB.strokePath('M 150 1920 Q 200 1600 300 1250 M 300 1180 Q 250 1190 255 1230 Q 260 1260 300 1260 M 300 1080 Q 245 1090 250 1130 Q 255 1165 300 1165', INK.black, 8),
    WB.strokePath('M 930 1920 Q 880 1600 780 1250 M 780 1180 Q 830 1190 825 1230 Q 820 1260 780 1260', INK.black, 8)]);
  // vibrando enquanto toca
  WB.effect(t => {
    const on = t >= T(3, 0.35) && t < T(4, 0.05);
    const dx = on ? 9 * Math.sin(t * 2 * Math.PI * 18) * (Math.sin(t * 2 * Math.PI * 1.3) > -0.2 ? 1 : 0) : 0;
    cel.setAttribute('transform', `translate(${dx.toFixed(1)} 0)`);
  });
  // c4: circula o número
  const c4 = WB.group();
  WB.draw(4, 0.3, 0.5, WB.strokePath(WB.loopEllipse(540, 792, 260, 60), INK.red, 8, c4));
  WB.write(4, 0.52, 0.85, 'o MEU número?!', 540, 1470, 88, INK.red, { anchor: 'middle', parent: c4 });
  ate(c4, T(6, 0));
  // c5: atende
  WB.draw(5, 0.0, 0.7, C.check(660, 1120, 40, INK.white));
  ate(topo, T(5, 0.05));
  const tempo = WB.group(cel);
  WB.showNow(WB.textStrokes('em ligação  00:01', 540, 560, 50, INK.green, tempo, 'middle').strokes);
  janela(tempo, T(5, 0.05), T(9, 0.1));
  // c6: voz no telefone -> ônibus com X
  const ondas = WB.group();
  WB.draw(6, 0.0, 0.12, [WB.strokePath(WB.arcPath(780, 450, 60, 60, -1.2, 0.1), INK.red, 7, ondas), WB.strokePath(WB.arcPath(780, 450, 105, 105, -1.2, 0.1), INK.red, 7, ondas)]);
  janela(ondas, T(6, 0), T(9, 0));
  const bus = WB.group();
  WB.draw(6, 0.14, 0.5, [WB.strokePath(WB.roundRectPath(390, 1380, 300, 170, 24), INK.black, 8, bus),
    WB.strokePath('M 415 1405 L 475 1405 L 475 1460 L 415 1460 Z M 495 1405 L 555 1405 L 555 1460 L 495 1460 Z M 575 1405 L 665 1405 L 665 1460 L 575 1460 Z', INK.black, 5, bus),
    WB.strokePath(WB.circlePath(450, 1560, 26) + ' ' + WB.circlePath(630, 1560, 26), INK.black, 7, bus)]);
  WB.draw(6, 0.68, 0.85, WB.strokePath('M 360 1360 L 720 1600 M 720 1360 L 360 1600', INK.red, 14, bus));
  WB.restHand(6, 0.87, 0.99);
  ate(bus, T(8, 0.0));
  // c7: quem tá falando?
  const interroga = WB.group();
  WB.write(7, 0.05, 0.6, '?', 175, 760, 210, INK.blue, { anchor: 'middle', parent: interroga });
  ate(interroga, T(9, 0));
  // c8: sou eu, daqui a 20 min
  const c8 = WB.group();
  WB.draw(8, 0.05, 0.25, WB.strokePath(WB.loopEllipse(540, 680, 140, 95), INK.red, 9, c8));
  WB.write(8, 0.55, 0.9, 'daqui a 20 min', 540, 1500, 96, INK.red, { anchor: 'middle', parent: c8 });
  ate(c8, T(10, 0.45));
  // c9: chamada encerrada
  const fim = WB.group(cel);
  WB.write(9, 0.05, 0.6, 'chamada encerrada', 540, 560, 50, INK.red, { anchor: 'middle', parent: fim });
  WB.effect(t => { if (t >= T(9, 0.05)) { bG.setAttribute('fill-opacity', 0.25); } });
  // c10: mãe chama + CONTINUA
  WB.write(10, 0.5, 0.75, 'CONTINUA...', 540, 1500, 110, INK.black, { anchor: 'middle' });
  WB.restHand(10, 0.78, 0.95);
};
