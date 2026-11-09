// "Ligação do teu próprio número" PARTE 1 (~73 s). Câmera = cabeça do protagonista (1ª pessoa):
// cada cena é o que os olhos dele veem, com as mãos dele na parte de baixo; a imagem balança de leve,
// aproxima nos momentos de tensão e treme no trovão. Sem narrador: só falas, legenda no topo por cor.
// Planos: 1 embaixo da cama (c1-c2) · 2 celular na mão (c3-c9) · 3 corredor até a cozinha (c10-c11)
//         4 parada de ônibus (c12-c20, ônibus chegando = zoom) · 5 celular toca de novo (c21) · cartão final (c22)
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const PAPEL = '#fffaf0';
  const wmRect = document.querySelector('rect[fill="#fffaf0"]');
  if (wmRect) { const wm = wmRect.parentNode; WB.effect(t => wm.setAttribute('transform', `translate(${(280 * Math.sin(2 * Math.PI * t / 14)).toFixed(1)} 0)`)); }
  const T = (c, f) => WB.at(c, f);
  const sp = (d, cor, w, g, o) => WB.strokePath(d, cor, w, g, o);
  const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
  function ate(g, tA, tB) {
    WB.effect(t => { let o = t < tA ? 1 : Math.max(0, 1 - (t - tA) / 0.18);
      if (tB !== undefined && t >= tB) o = Math.min(1, (t - tB) / 0.18); g.setAttribute('opacity', o.toFixed(3)); });
  }
  const janela = (g, tA, tB) => WB.effect(t => g.setAttribute('opacity', (t >= tA && t < tB) ? 1 : 0));
  // câmera na cabeça: respiração leve sempre + zooms + tremidas + passos
  function camera(g, o) {
    WB.effect(t => {
      let s = 1;
      for (const [a, b, s0, s1] of (o.zoom || [])) { if (t >= a) s = s0 + (s1 - s0) * ease((t - a) / (b - a)); }
      let dx = 5 * Math.sin(t * 0.9) + 3 * Math.sin(t * 2.1), dy = 6 * Math.sin(t * 1.3 + 1), rot = 0.35 * Math.sin(t * 0.7);
      for (const [a, b, amp] of (o.treme || [])) if (t >= a && t < b) { const k = amp * (1 - (t - a) / (b - a)); dx += k * Math.sin(t * 83); dy += k * Math.cos(t * 71); }
      for (const [a, b, amp] of (o.passo || [])) if (t >= a && t < b) { dy += amp * Math.abs(Math.sin(Math.PI * (t - a) / 0.55)); dx += amp * 0.4 * Math.sin(Math.PI * (t - a) / 0.55); }
      const [cx, cy] = o.centro || [540, 960];
      g.setAttribute('transform', `translate(${(cx * (1 - s) + dx).toFixed(1)} ${(cy * (1 - s) + dy).toFixed(1)}) rotate(${rot.toFixed(2)} 540 960) scale(${s.toFixed(4)})`);
    });
  }

  // ---------- legendas (camada fixa, cor por personagem) ----------
  const LEG = { mae: INK.purple, tu: INK.blue, tel: INK.red, amigo: INK.green };
  const QUEM = { mae: 'MÃE', tu: 'TU', tel: 'NO TELEFONE', amigo: 'AMIGO', msg: 'MENSAGEM' };
  const legGrupo = WB.group(WB.overlay);
  function legenda(cena, quem, txt, cor) {
    const g = WB.group(legGrupo), k = cor || LEG[quem];
    WB.showNow(WB.textStrokes(QUEM[quem], 540, 125, 44, k, g, 'middle').strokes);
    let ls = WB.wrap(txt, 72, 920);
    if (ls.length === 2) { const w = txt.split(' '); let best = null;
      for (let i = 1; i < w.length; i++) { const a = w.slice(0, i).join(' '), b = w.slice(i).join(' ');
        const d = Math.max(WB.measure(a, 72), WB.measure(b, 72)); if (!best || d < best[0]) best = [d, [a, b]]; } ls = best[1]; }
    ls.forEach((l, i) => WB.showNow(WB.textStrokes(l, 540, 205 + i * 76, 72, k, g, 'middle').strokes));
    janela(g, T(cena, 0), T(cena, 1));
  }
  legenda(1, 'mae', '"Filho! Tu vai perder o ônibus das 7!"');
  legenda(2, 'tu', '"Tô indo, mãe! Só tô achando o tênis..."');
  legenda(4, 'tu', '"Ué... esse número aí é o meu."');
  legenda(5, 'tu', '"Alô?"');
  legenda(6, 'tel', '"Não entra no ônibus das 7."');
  legenda(7, 'tu', '"Quem tá falando?"');
  legenda(8, 'tel', '"Sou eu. Daqui a 20 minutos."');
  legenda(11, 'mae', '"Filho? Quem era no telefone?"');
  legenda(13, 'amigo', '"E aí, mano? Que cara é essa? Parece que viu um fantasma."');
  legenda(14, 'tu', '"Cara... eu recebi uma ligação muito estranha."');
  legenda(16, 'tu', '"Daqui a pouco começa a chover... aí ele chega."');
  legenda(17, 'amigo', '"Quem chega?"');
  legenda(19, 'amigo', '"Olha lá, mano! O das 7!"');

  // ================= PLANO 1: deitado no chão, olhando embaixo da cama =================
  const p1 = WB.group(); camera(p1, { zoom: [[T(2, 0), T(3, 0), 1, 1.08]] });
  WB.showNow([
    sp(WB.roughRect(30, 470, 1050, 760), INK.black, 9, p1),
    sp(WB.wavyLine(60, 1020, 560, 10, 90) + ' ' + WB.wavyLine(60, 1020, 650, 8, 120), INK.blue, 5, p1),
    sp('M 110 760 L 110 1070 M 150 760 L 150 1060 M 930 760 L 930 1060 M 970 760 L 970 1070', INK.black, 8, p1)]);
  const escuro = WB.mk('rect', { x: 150, y: 765, width: 780, height: 290, fill: '#3a3a3a', 'fill-opacity': 0.22 }, p1);
  for (let k = -3; k <= 3; k++) WB.showNow(sp(`M ${540 + k * 75} 1062 L ${540 + k * 300} 1920`, INK.gray, 4, p1));
  WB.showNow(sp('M 0 1062 L 1080 1062', INK.black, 6, p1));
  // c1: o tênis lá no fundo
  const tenis = 'M 560 1040 Q 556 985 590 980 L 640 980 Q 660 1010 700 1013 Q 750 1018 750 1046 L 750 1052 L 560 1052 Z';
  WB.draw(1, 0.15, 0.5, [sp(tenis, INK.black, 6, p1), sp('M 610 990 L 630 1005 M 602 1004 L 624 1018', INK.red, 4, p1)]);
  WB.restHand(1, 0.55, 0.95);
  // c2: as tuas mãos esticando pra pegar
  WB.draw(2, 0.08, 0.55, [
    sp('M 170 1920 Q 260 1500 470 1150 Q 500 1110 535 1130 Q 560 1150 540 1185 M 470 1150 Q 470 1120 500 1105 M 540 1185 L 440 1330 Q 360 1520 330 1920', INK.black, 8, p1),
    sp('M 930 1920 Q 860 1560 760 1230 Q 745 1190 715 1200 Q 690 1215 705 1250 L 760 1400 Q 800 1600 800 1920', INK.black, 8, p1)]);
  WB.restHand(2, 0.6, 0.98);

  // ================= PLANO 2: o celular na tua cara =================
  WB.newPage(3, 0, 0.07);
  const p2 = WB.group();
  camera(p2, { zoom: [[T(6, 0), T(9, 0.2), 1, 1.12]], treme: [[T(9, 0), T(9, 0.5), 10]], centro: [540, 820] });
  const cel = WB.group(p2);
  const X0 = 210, X1 = 870, Y0 = 360, Y1 = 1560;
  WB.draw(3, 0.08, 0.3, [sp(WB.roundRectPath(X0, Y0, X1 - X0, Y1 - Y0, 70), INK.black, 11, cel),
    sp(WB.roundRectPath(X0 + 30, Y0 + 90, X1 - X0 - 60, Y1 - Y0 - 180, 20), INK.black, 5, cel)]);
  const topo = WB.group(cel);
  WB.write(3, 0.31, 0.43, 'chamada recebida', 540, 580, 60, INK.gray, { anchor: 'middle', parent: topo });
  WB.write(3, 0.44, 0.55, 'EU', 540, 830, 210, INK.black, { anchor: 'middle', parent: cel });
  WB.write(3, 0.56, 0.74, '(51) 9 9634-2817', 540, 960, 70, INK.black, { anchor: 'middle', parent: cel });
  const bR = WB.mk('circle', { cx: 400, cy: 1330, r: 78, fill: '#e04848', 'fill-opacity': 0 }, cel);
  const bG = WB.mk('circle', { cx: 680, cy: 1330, r: 78, fill: '#3fae5a', 'fill-opacity': 0 }, cel);
  const sR = sp(WB.circlePath(400, 1330, 78), INK.red, 7, cel), sG = sp(WB.circlePath(680, 1330, 78), INK.green, 7, cel);
  WB.draw(3, 0.75, 0.86, [sR, sG]); WB.fillAfter(bR, [sR], 0.1); WB.fillAfter(bG, [sG], 0.1);
  WB.draw(3, 0.87, 0.99, [
    sp('M 90 1920 Q 140 1700 210 1480 M 210 1420 Q 150 1430 155 1475 Q 160 1510 210 1510 M 210 1300 Q 145 1310 150 1355 Q 155 1395 210 1395', INK.black, 8, p2),
    sp('M 990 1920 Q 940 1700 870 1480 M 870 1420 Q 930 1430 925 1475 Q 920 1510 870 1510', INK.black, 8, p2)]);
  WB.effect(t => { const on = t >= T(3, 0.3) && t < T(4, 0.02);
    const dx = on ? 9 * Math.sin(t * 2 * Math.PI * 18) * (Math.sin(t * 2 * Math.PI * 1.4) > -0.2 ? 1 : 0) : 0;
    cel.setAttribute('transform', `translate(${dx.toFixed(1)} 0)`); });
  const c4 = WB.group(p2);
  WB.draw(4, 0.35, 0.6, sp(WB.loopEllipse(540, 940, 320, 70), INK.red, 9, c4));
  WB.restHand(4, 0.65, 0.98);
  ate(c4, T(5, 0.2));
  WB.draw(5, 0.0, 0.18, C.check(680, 1330, 50, INK.white));
  ate(topo, T(5, 0.05));
  const tempo = WB.group(cel);
  WB.showNow(WB.textStrokes('em ligação  00:01', 540, 580, 60, INK.green, tempo, 'middle').strokes);
  janela(tempo, T(5, 0.05), T(9, 0.05));
  WB.restHand(5, 0.25, 0.95);
  const ondas = WB.group(p2);
  WB.draw(6, 0.0, 0.1, [sp(WB.arcPath(870, 420, 60, 60, -1.3, 0.1), INK.red, 7, ondas), sp(WB.arcPath(870, 420, 110, 110, -1.3, 0.1), INK.red, 7, ondas)]);
  janela(ondas, T(6, 0), T(9, 0));
  WB.restHand(6, 0.15, 0.95);
  const c8 = WB.group(p2);
  WB.draw(8, 0.12, 0.35, sp(WB.loopEllipse(540, 770, 170, 115), INK.red, 10, c8));
  WB.restHand(8, 0.4, 0.95);
  const fim = WB.group(cel);
  WB.write(9, 0.03, 0.4, 'chamada encerrada', 540, 580, 60, INK.red, { anchor: 'middle', parent: fim });
  WB.effect(t => { if (t >= T(9, 0.05)) bG.setAttribute('fill-opacity', 0.25); });
  WB.restHand(9, 0.45, 0.95);

  // ================= PLANO 3: corredor até a cozinha =================
  WB.newPage(10, 0, 0.07);
  const p3 = WB.group();
  const tp = T(10, 0.1);
  camera(p3, { passo: [[tp, T(10, 1), 9]], zoom: [[T(11, 0), T(11, 1), 1, 1.38]], centro: [540, 900] });
  WB.draw(10, 0.08, 0.5, [
    sp('M 30 330 L 400 700 M 1050 330 L 680 700 M 30 1890 L 400 1120 M 1050 1890 L 680 1120', INK.black, 7, p3),
    sp(WB.roughRect(400, 700, 680, 1120), INK.black, 8, p3),
    sp('M 120 690 L 250 760 L 250 960 L 120 930 Z', INK.black, 5, p3),
    sp('M 400 1010 L 680 1010', INK.gray, 6, p3)]);
  const luz = WB.mk('rect', { x: 404, y: 704, width: 272, height: 412, fill: '#ffe9a8', 'fill-opacity': 0 }, p3);
  WB.effect(t => luz.setAttribute('fill-opacity', t >= T(10, 0.5) ? 0.45 : 0));
  // a mãe de costas, no fogão
  WB.draw(10, 0.52, 0.92, [
    sp(WB.circlePath(540, 835, 36), INK.purple, 7, p3), sp(WB.circlePath(540, 790, 15), INK.purple, 6, p3),
    sp('M 500 880 Q 540 865 580 880 L 600 1118 M 500 880 L 482 1118', INK.purple, 7, p3),
    sp('M 512 960 L 568 960', INK.purple, 5, p3)]);
  WB.restHand(10, 0.94, 0.99);

  // ================= PLANO 4: parada de ônibus =================
  WB.newPage(12, 0, 0.06);
  const chuvaG = WB.group();  // chuva fora da câmera (não aumenta no zoom)
  const p4 = WB.group();
  const tz = T(20, 0.05);
  camera(p4, { zoom: [[tz, T(20, 0.95), 1, 5.5]], treme: [[T(18, 0), T(18, 0.45), 16], [T(20, 0.6), T(20, 0.75), 6]], centro: [540, 868] });
  WB.draw(12, 0.07, 0.95, [
    sp('M 30 900 L 1050 900', INK.black, 6, p4),
    sp('M 60 900 L 60 760 L 150 760 L 150 900 M 170 900 L 170 700 L 250 700 L 250 900 M 830 900 L 830 730 L 930 730 L 930 900 M 950 900 L 950 790 L 1030 790 L 1030 900', INK.gray, 5, p4),
    sp('M 120 1890 L 500 900 M 960 1890 L 580 900', INK.black, 7, p4),
    sp('M 540 1840 L 540 1700 M 540 1560 L 540 1460 M 540 1350 L 540 1280 M 540 1200 L 540 1150 M 540 1090 L 540 1060 M 540 1015 L 540 995', INK.orange, 6, p4),
    sp('M 885 1520 L 885 760', INK.black, 8, p4), sp(WB.roughRect(800, 640, 970, 760), INK.black, 6, p4)]);
  WB.restHand(12, 0.96, 0.99);
  WB.showNow(WB.textStrokes('PONTO', 885, 718, 46, INK.black, p4, 'middle').strokes);
  // c13: o amigo
  const amigo = WB.group(p4);
  WB.draw(13, 0.0, 0.55, [
    sp(WB.circlePath(250, 830, 48), INK.green, 7, amigo), sp('M 200 815 Q 250 760 300 815 L 330 812', INK.green, 7, amigo),
    sp('M 250 878 L 250 1110 M 250 930 L 190 1040 M 250 930 L 310 1040 M 250 1110 L 205 1250 M 250 1110 L 295 1250', INK.green, 8, amigo),
    sp('M 232 842 L 236 842 M 264 842 L 268 842 M 236 860 Q 250 868 264 860', INK.green, 5, amigo)]);
  WB.restHand(13, 0.6, 0.98); WB.restHand(14, 0.0, 0.95);
  // c15: mensagem chegando no celular (na tua mão, embaixo)
  const sms = WB.group(p4);
  const fundoCel = WB.mk('path', { d: WB.roundRectPath(260, 1230, 560, 760, 50), fill: PAPEL, 'fill-opacity': 0 }, sms);
  const celO = sp(WB.roundRectPath(260, 1230, 560, 760, 50), INK.black, 10, sms);
  WB.draw(15, 0.04, 0.4, celO); WB.fillAfter(fundoCel, [celO], 0.05);
  WB.write(15, 0.42, 0.58, 'EU', 540, 1335, 72, INK.red, { anchor: 'middle', parent: sms });
  WB.draw(15, 0.6, 0.85, sp(WB.roundRectPath(300, 1375, 480, 240, 30), INK.blue, 6, sms));
  WB.effect(t => { const on = t >= T(15, 0) && t < T(15, 0.6); sms.setAttribute('transform', `translate(${on ? (7 * Math.sin(t * 110)).toFixed(1) : 0} 0)`); });
  WB.writeLines(16, 0.05, 0.85, ['daqui a pouco começa', 'a chover...', 'aí ele chega.'], 540, 1445, 54, INK.black, { anchor: 'middle', lineHeight: 62, parent: sms });
  // c17: quem chega?
  const q = WB.group(p4);
  WB.write(17, 0.05, 0.6, '?', 360, 790, 130, INK.green, { anchor: 'middle', parent: q });
  ate(q, T(19, 0));
  // c18: trovão + chuva
  const flash = WB.mk('rect', { x: 0, y: 0, width: 1080, height: 1920, fill: '#ffffff', opacity: 0 }, WB.overlay);
  WB.effect(t => { const u = t - T(18, 0); flash.setAttribute('opacity', (u >= 0 && u < 0.35 ? (u < 0.06 || (u > 0.14 && u < 0.2) ? 0.85 : 0.15) : 0).toFixed(2)); });
  const gotas = [];
  for (let i = 0; i < 46; i++) { const x = 40 + (i * 233) % 1000, y = 340 + (i * 397) % 900; gotas.push(sp(`M ${x} ${y} L ${x - 14} ${y + 46}`, INK.blue, 4, chuvaG)); }
  WB.draw(18, 0.12, 0.85, gotas);
  WB.effect(t => { if (t < T(18, 0.85)) { chuvaG.setAttribute('transform', ''); return; }
    const u = (t * 900) % 300; chuvaG.setAttribute('transform', `translate(${(-u * 0.3).toFixed(1)} ${u.toFixed(1)})`); });
  // c19: o ônibus lá longe (desenhado pequeno com traço fino: o zoom da cabeça traz ele pra perto)
  const bus = WB.group(p4);
  WB.draw(19, 0.05, 0.25, sp('M 300 960 L 470 890 ' + WB.arrowHead(478, 887, -0.39, 22), INK.green, 6, amigo));
  WB.draw(19, 0.3, 0.8, [
    sp(WB.roundRectPath(505, 838, 70, 58, 6), INK.black, 2.2, bus),
    sp('M 511 846 L 569 846 L 569 868 L 511 868 Z', INK.black, 1.6, bus),
    sp(WB.circlePath(516, 884, 4) + ' ' + WB.circlePath(564, 884, 4), INK.orange, 2, bus),
    sp('M 512 896 L 512 900 M 568 896 L 568 900', INK.black, 2, bus)]);
  WB.write(19, 0.82, 0.93, '7', 540, 845, 12, INK.red, { anchor: 'middle', parent: bus });
  const farol = WB.mk('g', { opacity: 0 }, bus);
  WB.mk('circle', { cx: 516, cy: 884, r: 6, fill: '#ffd34d' }, farol); WB.mk('circle', { cx: 564, cy: 884, r: 6, fill: '#ffd34d' }, farol);
  WB.effect(t => farol.setAttribute('opacity', t >= T(19, 0.8) ? (0.7 + 0.3 * Math.sin(t * 9)).toFixed(2) : 0));
  // porta abrindo (duas folhas que deslizam)
  const porta = WB.mk('g', { opacity: 0 }, bus);
  const pE = WB.mk('rect', { x: 528, y: 870, width: 12, height: 22, fill: '#555', 'fill-opacity': 0.6 }, porta);
  const pD = WB.mk('rect', { x: 540, y: 870, width: 12, height: 22, fill: '#555', 'fill-opacity': 0.6 }, porta);
  const vao = WB.mk('rect', { x: 528, y: 870, width: 24, height: 22, fill: '#111', 'fill-opacity': 0.85 }, porta);
  porta.insertBefore(vao, pE);
  WB.effect(t => { porta.setAttribute('opacity', t >= T(19, 0.9) ? 1 : 0);
    const u = ease((t - T(20, 0.72)) / (T(20, 0.85) - T(20, 0.72))) * 11;
    pE.setAttribute('x', 528 - u); pD.setAttribute('x', 540 + u); pE.setAttribute('width', 12); });
  ate(sms, T(20, 0.1)); ate(amigo, T(20, 0.3));

  // ================= PLANO 5: o celular toca de novo =================
  const p5 = WB.group(WB.overlay);
  WB.overlay.insertBefore(p5, legGrupo);
  const fundo5 = WB.mk('path', { d: WB.roundRectPath(300, 1130, 480, 820, 50), fill: PAPEL, 'fill-opacity': 0 }, p5);
  const o5 = sp(WB.roundRectPath(300, 1130, 480, 820, 50), INK.black, 10, p5);
  WB.draw(21, 0.02, 0.3, o5); WB.fillAfter(fundo5, [o5], 0.05);
  WB.write(21, 0.32, 0.5, 'EU', 540, 1330, 130, INK.red, { anchor: 'middle', parent: p5 });
  WB.write(21, 0.52, 0.75, 'chamando...', 540, 1440, 62, INK.gray, { anchor: 'middle', parent: p5 });
  WB.effect(t => { const on = t >= T(21, 0.3);
    p5.setAttribute('transform', `translate(${on ? (8 * Math.sin(t * 2 * Math.PI * 18) * (Math.sin(t * 2 * Math.PI * 1.4) > -0.2 ? 1 : 0)).toFixed(1) : 0} 0)`); });
  WB.restHand(21, 0.8, 0.98);

  // ================= CARTÃO FINAL =================
  const card = WB.group(WB.overlay);
  WB.mk('rect', { x: 0, y: 0, width: 1080, height: 1920, fill: '#1c1c1c', 'fill-opacity': 0.86 }, card);
  WB.showNow(WB.textStrokes('O QUE VOCÊ', 540, 560, 120, INK.white, card, 'middle').strokes);
  WB.showNow(WB.textStrokes('FARIA?', 540, 700, 130, INK.white, card, 'middle').strokes);
  WB.mk('path', { d: WB.roundRectPath(170, 790, 740, 170, 30), fill: '#d63c3c' }, card);
  WB.showNow(WB.textStrokes('ENTRAR NO ÔNIBUS', 540, 900, 80, INK.white, card, 'middle').strokes);
  WB.mk('path', { d: WB.roundRectPath(170, 1000, 740, 170, 30), fill: '#2f6fb3' }, card);
  WB.showNow(WB.textStrokes('NÃO ENTRAR', 540, 1110, 80, INK.white, card, 'middle').strokes);
  WB.showNow(WB.textStrokes('comenta aqui embaixo', 540, 1270, 64, '#ffd34d', card, 'middle').strokes);
  WB.showNow(WB.textStrokes('Segue pra ver a parte 2', 540, 1420, 70, INK.white, card, 'middle').strokes);
  WB.effect(t => card.setAttribute('opacity', t < T(22, 0) ? 0 : Math.min(1, (t - T(22, 0)) / 0.35).toFixed(2)));
};
