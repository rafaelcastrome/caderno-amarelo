// "Olha pra parede do teu quarto" (pós-imagem negativa de uma menina), narração Gemini Algieba (3.1, tom de suspense).
// Menina em NEGATIVO desde o quadro 0; encara o pontinho vermelho 15 s; quadro fica branco -> pós-imagem
// mostra a menina de cabelo preto; no fim a menina de verdade aparece devagar.
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const W = (t0, t1, txt, x, y, size, cor, o = {}) => { const c = sceneOf(t0); return WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o }); };
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const r1 = n => Math.round(n * 10) / 10;
  const janela = (g, a, b, d = 0.2) => WB.effect(t => g.setAttribute('opacity', (clamp((t - a) / d) * (1 - clamp((t - b) / d))).toFixed(3)));
  const st = c => S[c - 1].start;
  const flash = (a, b, txt, x, y, size, cor, parent) => {
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, 'middle').strokes); janela(g, a, b, 0.15); return g;
  };
  const T = st(2) + S[1].fala + 0.1;   // começa a encarar
  const T15 = T + 15;                   // vira papel branco

  // ---------------- a menina (cores positivas -> negativo calculado) ----------------
  const NEG = hex => '#' + [1, 3, 5].map(i => (255 - parseInt(hex.substr(i, 2), 16)).toString(16).padStart(2, '0')).join('');
  const BX0 = 160, BY0 = 380, BX1 = 920, BY1 = 1370, CX = 540;
  function menina(neg, parent) {
    const c = neg ? NEG : (h => h);
    const g = WB.group(parent);
    const P = (d, fill, extra = {}) => WB.mk('path', { d, fill: c(fill), stroke: 'none', ...extra }, g);
    WB.mk('rect', { x: BX0, y: BY0, width: BX1 - BX0, height: BY1 - BY0, rx: 24, fill: c('#ffffff') }, g);
    // cabelo de trás (comprido, liso)
    P(`M 330 860 Q 320 560 540 540 Q 760 560 750 860 L 770 1340 Q 700 1365 640 1300 L 440 1300 Q 380 1365 310 1340 Z`, '#151515');
    // vestido + ombros
    P(`M 300 1370 Q 310 1180 470 1150 L 610 1150 Q 770 1180 780 1370 Z`, '#e9e6e0');
    // pescoço
    P(`M 495 1010 L 495 1165 Q 540 1190 585 1165 L 585 1010 Z`, '#e8c4aa');
    // rosto
    P(`M 540 600 C 650 600 715 690 715 820 C 715 960 640 1060 540 1060 C 440 1060 365 960 365 820 C 365 690 430 600 540 600 Z`, '#f2d3bd');
    // franja reta e mechas caindo dos lados do rosto
    P(`M 360 790 Q 350 590 540 575 Q 730 590 720 790 L 690 775 L 660 735 L 630 760 L 600 730 L 570 758 L 540 728 L 510 758 L 480 730 L 450 760 L 420 735 L 390 775 Z`, '#151515');
    P(`M 362 780 Q 380 900 395 1080 L 350 1090 Q 330 920 345 790 Z`, '#151515');
    P(`M 718 780 Q 700 900 685 1080 L 730 1090 Q 750 920 735 790 Z`, '#151515');
    // olheiras
    P(`M 425 885 Q 470 915 515 885 Q 470 900 425 885 Z`, '#b8a0b0');
    P(`M 565 885 Q 610 915 655 885 Q 610 900 565 885 Z`, '#b8a0b0');
    // olhos (amêndoa) + íris + brilho
    [470, 610].forEach(x => {
      P(`M ${x - 48} 850 Q ${x} 812 ${x + 48} 850 Q ${x} 880 ${x - 48} 850 Z`, '#ffffff');
      WB.mk('circle', { cx: x, cy: 849, r: 19, fill: c('#2a1a12') }, g);
      WB.mk('circle', { cx: x, cy: 849, r: 9, fill: c('#000000') }, g);
      P(`M ${x - 50} 851 Q ${x} 806 ${x + 50} 851 L ${x + 46} 846 Q ${x} 814 ${x - 46} 846 Z`, '#151515');   // cílios de cima
      // sobrancelha
      P(`M ${x - 46} 800 Q ${x} 784 ${x + 46} 800 L ${x + 44} 808 Q ${x} 794 ${x - 44} 808 Z`, '#2a2a2a');
    });
    // nariz
    P(`M 540 870 Q 532 915 522 930 Q 540 942 558 930 L 552 926 Q 540 934 530 927 Q 540 912 546 870 Z`, '#cf9f86');
    // boca
    P(`M 500 985 Q 540 975 580 985 Q 540 1002 500 985 Z`, '#a8484a');
    return g;
  }
  const neg = menina(true);
  const pos = menina(false);
  // ponto vermelho de fixação no nariz (fica vermelho no negativo também)
  const ponto = WB.group();
  WB.mk('circle', { cx: CX, cy: 918, r: 11, fill: '#ff1a1a' }, ponto);
  // quadro branco da revelação
  const branco = WB.mk('rect', { x: BX0, y: BY0, width: BX1 - BX0, height: BY1 - BY0, rx: 24, fill: '#ffffff' });
  WB.effect(t => {
    const show = t < T15;
    neg.setAttribute('opacity', show ? 1 : 0);
    ponto.setAttribute('opacity', show ? 1 : 0);
    branco.setAttribute('opacity', show ? 0 : 1);
    // a menina de verdade surge devagar no fim (cena 8 em diante)
    const a = st(8) + 1.2;
    pos.setAttribute('opacity', (clamp((t - a) / 3.0) * 0.95).toFixed(3));
  });
  WB.overlay.parentNode && 0;   // (marca d'água fica no overlay)
  // ordem: pos e branco acima do neg? garante pos por cima do branco
  branco.parentNode.appendChild(branco); pos.parentNode.appendChild(pos);

  // ---------------- topo ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('TEM UMA MENINA AQUI', 540, 175, 104, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('e tu vai ver ela...', 540, 280, 76, INK.black, tit, 'middle').strokes);

  // ---------------- cena 1/2: instrução ----------------
  rest(0.2, 0.3);
  const s2 = st(2), F2 = S[1].fala;
  W(s2 + 0.2, s2 + F2 * 0.55, 'olha fixo no pontinho VERMELHO', 540, 1480, 70, INK.red);
  W(s2 + F2 * 0.6, s2 + F2 * 0.95, 'e não pisca', 540, 1590, 80, INK.black);
  rest(s2 + F2 * 0.97, T - 0.05);
  // anel chamando o olho pro ponto (só antes de começar)
  const anel = WB.mk('circle', { cx: CX, cy: 918, r: 30, fill: 'none', stroke: '#ff1a1a', 'stroke-width': 5 });
  WB.effect(t => {
    const u = ((t - s2) % 1.0 + 1) % 1.0;
    const on = t > s2 + 0.3 && t < T;
    anel.setAttribute('r', r1(20 + 50 * u)); anel.setAttribute('opacity', on ? (1 - u).toFixed(3) : 0);
  });
  // barra de 15 s embaixo do quadro (bem fina, fora do rosto)
  const bar = WB.mk('rect', { x: BX0, y: BY1 + 22, width: BX1 - BX0, height: 12, rx: 6, fill: INK.red });
  WB.effect(t => {
    const u = clamp((t - T) / 15);
    bar.setAttribute('width', r1((BX1 - BX0) * (1 - u)));
    bar.setAttribute('opacity', t > T && t < T15 ? 0.8 : 0);
  });
  // os textos de baixo somem quando começa a encarar
  const someTextos = WB.mk('rect', { x: 0, y: 1400, width: 1080, height: 300, fill: '#fbf5df' });
  WB.effect(t => someTextos.setAttribute('opacity', t > T ? 1 : 0));
  flash(st(3), st(3) + 2.4, 'continua olhando...', 540, 1520, 78, INK.gray);
  flash(st(4), st(4) + 2.4, 'não pisca...', 540, 1520, 78, INK.gray);

  // ---------------- cena 5+: papel branco ----------------
  flash(T15, st(6) - 0.1, 'AGORA OLHA PRO BRANCO!', 540, 1520, 80, INK.red);
  flash(st(6), st(7) - 0.1, 'tá vendo ela?', 540, 1520, 96, INK.purple);
  flash(st(7), st(8) - 0.1, 'pisca rápido...', 540, 1520, 96, INK.purple);
  flash(st(8), st(9) - 0.1, 'olha pra parede do teu quarto', 540, 1520, 76, INK.red);
  flash(st(9), 999, 'comenta VI se tu viu', 540, 1500, 88, INK.black);
  flash(st(9) + 1.6, 999, 'e manda pra quem tem medo', 540, 1610, 76, INK.blue);

  // ---------------- marca d'água (some no encarar e no branco pra não atrapalhar) ----------------
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[290, 1780], [790, 1780], [540, 1810], [300, 1770]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const n = Math.floor(t / CYC), u = clamp((t - n * CYC - HOLD) / MOVE);
      const a = SPOTS[n % 4], b = SPOTS[(n + 1) % 4], e = ease(u);
      const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.2) / 0.3) * 0.95).toFixed(3));
    });
  }
};
