// Enquanto tu assiste esse vídeo: contadores ao vivo (valores desde o quadro 0).
window.CENAS = function (WB) {
  const { INK, C } = WB;
  const F = window.CAVEAT;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const fmt = (n) => Math.floor(n).toLocaleString('pt-BR');

  // número ao vivo: path preenchido refeito a cada quadro
  function live(parent, x, y, size, color, valueFn, anchor = 'start') {
    const el = WB.mk('path', { d: '', fill: color }, parent);
    WB.effect((t) => {
      const s = valueFn(t);
      if (s == null) { el.setAttribute('d', ''); return; }
      const w = F.getAdvanceWidth(s, size);
      const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
      el.setAttribute('d', F.getPath(s, x0, y, size).toPathData(1));
    });
    return el;
  }

  // ---- gancho no quadro 0
  WB.showNow(WB.textStrokes('ENQUANTO TU ASSISTE', 540, 135, 94, INK.black, null, 'middle').strokes);
  WB.showNow(WB.textStrokes('ESSE VÍDEO...', 540, 235, 94, INK.red, null, 'middle').strokes);

  // ---- cronômetro (cena 1)
  const swX = 410, swY = 318;
  WB.showNow([
    WB.strokePath(WB.circlePath(swX, swY, 30), INK.gray, 6),
    WB.strokePath(`M${swX} ${swY - 30}L${swX} ${swY - 42}M${swX - 10} ${swY - 44}L${swX + 10} ${swY - 44}M${swX} ${swY}L${swX + 13} ${swY - 14}`, INK.gray, 6),
  ]);
  const tStart = 0;
  live(null, 460, swY + 24, 72, INK.gray, (t) => {
    if (t < tStart) return null;
    const s = Math.floor(t), d = Math.floor((t - s) * 10);
    return `0:${String(s).padStart(2, '0')},${d}`;
  });
  

  // ---- linhas de contadores
  const R0 = 480, STEP = 180, IX = 165, LX = 262;
  const rows = [
    { cena: 2, cor: INK.purple, rot: 'bebês nasceram', taxa: 4.25, icon: bebe },
    { cena: 3, cor: INK.orange, rot: 'raios caíram na Terra', taxa: 44, icon: raio },
    { cena: 4, cor: INK.green, rot: 'mensagens no WhatsApp', taxa: 1157407, icon: balao },
    { cena: 5, cor: INK.red, rot: 'batidas do teu coração', taxa: 1.25, icon: coracao },
    { cena: 6, cor: INK.blue, rot: 'células novas no teu corpo', taxa: 3819444, icon: celula },
    { cena: 7, cor: INK.black, rot: 'km que tu andou no espaço', taxa: 29.8, icon: terra },
  ];

  function bebe(x, y, c) {
    return [WB.strokePath(WB.circlePath(x, y - 20, 26), c, 6),
      WB.strokePath(`M${x - 9} ${y - 24}l0 1M${x + 9} ${y - 24}l0 1M${x - 8} ${y - 10}Q${x} ${y - 3} ${x + 8} ${y - 10}`, c, 5),
      WB.strokePath(`M${x - 4} ${y - 46}Q${x + 8} ${y - 58} ${x + 10} ${y - 44}`, c, 5),
      WB.strokePath(`M${x - 30} ${y + 50}Q${x - 36} ${y + 8} ${x} ${y + 8}Q${x + 36} ${y + 8} ${x + 30} ${y + 50}Z`, c, 6)];
  }
  function raio(x, y, c) {
    return WB.strokePath(`M${x + 14} ${y - 52}L${x - 22} ${y + 4}L${x + 2} ${y + 4}L${x - 14} ${y + 54}L${x + 26} ${y - 8}L${x + 2} ${y - 8}Z`, c, 6);
  }
  function balao(x, y, c) {
    return [WB.strokePath(WB.roundRectPath(x - 44, y - 38, 88, 62, 18), c, 6),
      WB.strokePath(`M${x - 18} ${y + 24}L${x - 28} ${y + 46}L${x + 2} ${y + 24}`, c, 6),
      WB.strokePath(`M${x - 18} ${y - 7}l0 1M${x} ${y - 7}l0 1M${x + 18} ${y - 7}l0 1`, c, 9)];
  }
  function coracao(x, y, c) {
    return WB.strokePath(`M${x} ${y + 44}C${x - 60} ${y} ${x - 46} ${y - 52} ${x} ${y - 22}C${x + 46} ${y - 52} ${x + 60} ${y} ${x} ${y + 44}Z`, c, 6);
  }
  function celula(x, y, c) {
    return [WB.strokePath(WB.loopEllipse(x, y, 46, 40, 1.05), c, 6),
      WB.strokePath(WB.circlePath(x + 6, y - 2, 14), c, 6),
      WB.strokePath(`M${x - 24} ${y - 14}l0 1M${x - 20} ${y + 18}l0 1M${x + 24} ${y + 22}l0 1`, c, 8)];
  }
  function terra(x, y, c) {
    return [WB.strokePath(WB.circlePath(x, y, 32), INK.blue, 6),
      WB.strokePath(`M${x - 22} ${y - 14}Q${x - 6} ${y - 22} ${x - 2} ${y - 6}Q${x - 14} ${y + 2} ${x - 20} ${y + 14}M${x + 8} ${y + 10}Q${x + 22} ${y + 4} ${x + 20} ${y + 20}`, INK.green, 6),
      WB.strokePath(WB.arcPath(x, y + 4, 56, 22, 0.15 * Math.PI, 1.1 * Math.PI), c, 5),
      WB.strokePath(WB.arrowHead(x - 55, y + 2, -Math.PI / 2 - 0.3, 14), c, 5)];
  }

  const nums = [];
  rows.forEach((r, i) => {
    const yc = R0 + i * STEP;
    WB.draw(r.cena, 0.02, 0.16, r.icon(IX, yc + 6, r.cor));
    WB.write(r.cena, 0.17, 0.42, r.rot, LX, yc - 22, 50, INK.gray);
    const g = WB.group();
    const tOn = WB.at(r.cena, 0.44);
    live(g, LX, yc + 66, 100, r.cor, (t) => t < tOn ? null : fmt(r.taxa * t));
    // "pop" quando aparece
    WB.effect((t) => {
      const u = clamp((t - tOn) / 0.25), s = t < tOn ? 0 : 1 + 0.18 * Math.sin(u * Math.PI);
      g.setAttribute('transform', `translate(${LX} ${yc + 40}) scale(${s}) translate(${-LX} ${-(yc + 40)})`);
    });
    nums.push({ g, yc });
  });
  [2, 3, 4, 5, 6].forEach((c) => WB.restHand(c, 0.46, 0.96));

  // ---- cena 7: a Terra a 30 km/s
  const yT = R0 + 5 * STEP;
  WB.restHand(7, 0.46, 0.62);
  WB.write(7, 0.64, 0.86, '30 km/s em volta do Sol', 540, yT + 128, 52, INK.blue, { anchor: 'middle' });
  WB.restHand(7, 0.88, 0.99);

  // ---- cena 8: mais de mil km
  WB.draw(8, 0.10, 0.30, C.box(LX - 24, yT - 6, 1010, yT + 92, INK.red, 7));
  WB.write(8, 0.55, 0.84, 'e tu nem saiu do lugar!', 540, yT + 225, 66, INK.red, { anchor: 'middle' });
  WB.restHand(8, 0.86, 0.99);

  // ---- cena 9: manda pra alguém
  WB.writeLines(9, 0.04, 0.42, ['Manda pra alguém que acha', 'que não fez nada hoje'], 540, 1715, 58, INK.black, { anchor: 'middle', lineHeight: 66 });
  WB.restHand(9, 0.44, 1.0);

  // @ que passeia pelo rodapé
  const at = WB.group(WB.overlay);
  WB.showNow(WB.textStrokes('@Cardeno_Amarelo', 0, 0, 42, INK.gray, at, 'middle').strokes);
  WB.effect((t) => {
    const u = (Math.sin(t * 0.35) + 1) / 2;
    at.setAttribute('transform', `translate(${(260 + u * 560).toFixed(1)} 1872)`);
    at.setAttribute('opacity', 0.75);
  });
};
