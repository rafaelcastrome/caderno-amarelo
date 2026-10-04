// Meme "quem luta com ele sou eu" no estilo desenho animado (skill cartoon-animado).
// Tempos = áudio original do meme (legenda palavra a palavra do vídeo).
window.CENAS = function (CT) {
  const { P, E, R, T, obj } = CT;

  // ---------- falas ----------
  CT.fala('rep', [[0, 0.33], [0.37, 0.43], [0.43, 0.53], [0.53, 0.93], [0.93, 1.17], [1.17, 1.37], [1.37, 1.7], [1.7, 1.97], [1.97, 2.43], [2.43, 2.57], [2.57, 2.73], [2.73, 3.07], [3.07, 3.27]]);
  CT.fala('menina', [[3.33,3.67],[3.67,3.9],[3.9,4.03],[4.03,4.23],[4.23,4.47],[4.97,5.17],[5.17,5.3],[5.3,5.47],[5.47,5.7],[5.7,5.77],[5.77,5.87],[5.87,6.17],[6.17,6.67],[6.67,6.93],[6.93,7.1],[7.1,7.63],[7.63,7.77],[7.77,7.9],[7.9,8.03],[8.03,8.13],[8.13,8.33],[8.33,8.57],[8.63,8.9],[8.9,9.1],[9.1,9.57],[9.57,9.73],[9.73,9.9],[9.9,10.03],[10.03,10.13],[10.13,10.5],[10.5,10.63],[10.63,10.73],[10.73,10.83],[10.83,11.07],[11.07,11.23],[11.23,11.7],[11.7,12.13],[12.97,13.3],[13.3,13.47],[13.47,13.9],[13.9,14.27],[14.27,14.63],[15.47,16.23],[16.3,16.43],[16.43,16.53],[16.53,16.67],[16.7,16.83],[16.83,17.07],[17.07,17.3],[17.3,17.43],[17.43,17.7],[17.7,17.87],[18.03,18.47],[18.47,18.63],[18.63,18.93],[18.93,19.27],[19.27,19.63],[19.67,19.93],[19.93,20.13],[20.13,20.47],[20.47,20.73],[20.73,21.1],[21.1,21.3],[21.3,21.57],[21.57,21.67],[21.67,21.9],[21.9,22.03],[22.03,22.73],[22.73,23.07],[23.07,23.33],[23.33,23.63],[23.63,23.77],[23.77,23.93],[23.93,24.17],[24.17,24.57],[24.57,24.87],[25.77,26.17],[26.17,26.27],[26.27,26.5],[26.5,26.77],[26.77,26.87],[26.87,26.97],[26.97,27.27],[27.27,27.5],[27.5,27.7],[27.7,28.13],[28.13,28.27],[28.27,28.33],[28.33,28.67],[28.67,28.9],[29.13,29.53],[29.53,29.9],[29.9,30.1],[30.1,30.33],[30.33,30.77],[30.77,31.17],[31.17,31.3],[31.3,31.37],[31.37,31.5],[31.53,31.73],[31.73,31.97],[31.97,32.27],[32.27,32.5],[32.5,32.63],[32.63,32.83],[32.83,33.13],[33.13,33.33],[33.37,33.53],[33.53,33.73],[33.73,34.03],[34.03,34.13],[34.13,34.3],[34.3,34.57],[35.03,35.37],[35.37,35.57],[35.57,35.73],[35.73,36.17],[36.67,37.07],[37.07,37.3],[37.3,37.43],[37.43,37.57],[37.57,37.87],[37.87,38.13],[38.13,38.33],[38.33,38.53],[38.53,38.77],[38.77,39.13],[39.13,39.33],[39.33,39.47],[39.47,39.63],[39.63,39.93],[39.93,40.27],[40.27,40.53],[40.53,40.9],[40.9,41.43],[41.43,41.67],[41.67,41.77],[41.77,42.1],[42.1,42.43],[42.57,42.87],[42.9,42.97],[42.97,43.1],[43.1,43.3],[43.3,43.53],[43.53,44.5],[44.5,44.87],[44.97,45.27],[45.27,45.53],[45.53,45.7],[45.73,45.9],[45.9,46.03],[46.03,46.13],[46.13,46.33],[46.33,46.83],[47.3,47.73],[47.73,47.9],[47.9,48.1],[48.1,48.37],[48.37,48.67],[48.67,48.97],[49.43,49.9],[49.9,50.0],[50.0,50.23],[50.23,50.5],[50.5,51.03],[51.03,51.17],[51.17,51.33],[51.33,51.47],[51.47,51.63],[51.63,51.77],[51.77,51.97],[52.03,52.1],[52.1,52.23],[52.23,52.37],[52.37,52.67],[52.67,52.83],[52.83,52.9],[52.9,53.17],[53.17,53.37],[53.37,53.5],[53.5,53.83],[53.87,54.1],[54.1,55.23],[55.23,55.9],[56.57,57.03],[57.03,57.3],[57.3,57.37],[57.37,57.63],[57.63,57.9],[57.9,58.33],[58.33,58.43],[58.97,59.27],[59.27,59.43],[59.43,59.63],[59.63,59.7],[59.7,59.9],[59.9,60.03],[60.03,60.13],[60.13,60.33],[60.33,60.63],[60.87,61.13],[61.13,61.37],[61.37,61.63],[61.63,62.03],[62.03,62.13],[62.13,62.23],[62.23,62.53],[62.53,62.87],[62.87,63.1],[63.1,63.27],[63.27,63.33],[63.33,63.63],[63.63,63.93],[63.93,64.07],[64.07,64.3],[64.3,64.53],[64.53,64.83],[64.83,65.1],[65.1,65.5],[65.5,65.73],[65.73,65.97],[65.97,66.17],[66.67,67.13],[67.13,67.37],[67.37,67.5],[67.5,67.7],[67.7,67.87],[67.87,68.33],[68.33,68.53],[68.53,68.7],[68.7,68.83],[68.83,69.1],[69.1,69.77],[70.27,70.93],[70.93,71.53],[71.53,71.67],[71.67,71.77],[71.77,71.87],[71.87,72.03],[72.03,72.17],[72.17,72.3],[72.3,72.43],[72.43,72.53],[72.53,72.7],[72.7,72.9],[72.9,73.33],[74.03,74.67]]);

  CT.legenda([
    [0, 'COMO QUE VAI FICAR'], [0.93, 'QUANDO TU PRECISAR DE ALGUÉM,'], [2.43, 'QUEM QUE PODERIA FICAR?'],
    [3.33, 'EU DEIXO ELE'], [4.03, 'LÁ NA CASA DA VÓ DELE,'], [5.7, 'QUE É PRA ELAS'], [6.67, 'AGUENTAR O SUPAPO DELE,'],
    [7.77, 'QUE A VÓ DELE'], [8.63, 'VEIO AQUI HOJE'], [9.57, 'E DISSE QUE'], [10.03, 'ELE CAGOU'], [10.63, 'LÁ DENTRO DO BANHEIRO'], [11.23, 'DA CASA DELA.'],
    [12.97, 'POIS É,'], [13.47, 'CAGOU SIM.'], [14.27, 'OI?'], [15.47, 'NÃO, NEM COISA ASSIM'], [16.7, 'DE SORRIR,'],
    [17.07, 'MAS É PORQUE É...'], [18.03, 'É UMA COISA SÉRIA'], [19.27, 'TAMBÉM, POIS É.'],
    [20.13, 'AÍ ESSE POVO AÍ'], [21.3, 'QUANDO ELE TIVER'], [21.9, 'O BENEFÍCIO, NÉ?'], [23.07, 'VAMOS DIZER,'], [23.63, 'ELE TEM UM SALÁRIO MÍNIMO,'],
    [25.77, 'SERÁ QUE DESSE DINHEIRO'], [26.77, 'EU VOU PODER TIRAR'], [27.5, 'UM SHAMPOO PRA MIM'], [28.33, 'COMPRAR MEU'],
    [29.13, 'PRA BOTAR NO CABELO'], [30.33, 'DA PALHAÇA VELHA'],
    [31.37, 'QUE EU TÔ VALENDO'], [31.97, 'UMA CACHORRA'], [32.5, 'QUE ATÉ ESSES CACHORRO'], [33.37, 'TEM MAIS VALOR'], [34.03, 'DO QUE EU,'],
    [35.03, 'ENTENDEU, NÃO VOU PODER,'], [36.67, 'ENTENDEU,'], [37.07, 'AÍ É QUE MINHA VIDA'], [38.13, 'VAI VIRAR UM INFERNO,'],
    [39.13, 'MAS EU MANDO'], [39.63, 'QUEM TIVER ACHANDO RUIM'], [40.9, 'PEGAR ELE E LEVAR,'],
    [42.57, 'PORQUE NÃO VOU FICAR LOUCA,'], [43.53, 'NÃO, ENTENDEU,'], [44.97, 'QUEM LUTA COM ELE É EU.'],
    [46.03, 'O PAI DELE LEVOU ELE'], [47.73, 'UMA VEZ PRA LÁ,'], [49.43, 'ELE VIROU, VIROU A SOROBA'], [51.03, 'LÁ NA CASA DO PAI DELE,'],
    [52.03, 'O PAI DELE CHEGOU COM ELE'], [52.9, 'OITO HORA DA NOITE,'], [53.87, 'ELE VIROU TUDO,'],
    [56.57, 'JOGOU COISA EM MIM,'], [57.63, 'ME MORDEU, MORDEU,'], [58.97, 'ENTENDEU,'],
    [59.27, 'NÃO GOSTO DE ANDAR'], [59.9, 'COM ELE NA RUA,'], [60.87, 'NÃO É POR CAUSA'], [61.63, 'QUE EU TENHO VERGONHA DELE,'],
    [63.1, 'NÃO, É PORQUE'], [63.63, 'QUANDO EU VOU NA RUA COM ELE'], [65.5, 'A GENTE SOFRE'], [66.67, 'PRECONCEITO'], [67.13, 'PORQUE ELE NÃO SE AQUIETA'],
    [68.33, 'E EU NÃO TENHO'], [69.1, 'CRACHÁ DE IDENTIFICAÇÃO,'], [71.53, 'QUE EU NÃO SEI NEM'], [72.17, 'ONDE É QUE FAZ ESSE CRACHÁ,'], [74.03, 'ENTENDEU.'],
    [74.67, 'SEGUE O @CADERNO_AMARELO'],
  ]);

  // ---------- elenco ----------
  const PELE = '#b97a4f';
  const MENINA = { pele: PELE, cabelo: { tipo: 'longo', cor: '#241510' }, roupa: { tipo: 'regata', cima: '#f4a6c4', baixo: '#3b5ea8' }, voz: 'menina' };
  const REP = { pele: '#f1c9a5', cabelo: { tipo: 'curto', cor: '#6b4423' }, roupa: { tipo: 'camiseta', cima: '#2563eb', baixo: '#374151', perna: 'calca' }, cracha: true, chinelo: '#222', voz: 'rep', mao: { d: 'mic' } };
  const VO = { pele: '#e8bf9a', cabelo: { tipo: 'coque', cor: '#cfcfcf' }, roupa: { tipo: 'vestido', cima: '#9b7fd1' }, oculos: true, chinelo: '#f472b6' };
  const MENINO = { pele: PELE, s: 0.82, cabelo: { tipo: 'espetado', cor: '#241510' }, roupa: { tipo: 'camiseta', cima: '#f59e0b', baixo: '#2563eb' } };
  const PAI = { pele: '#a8704a', cabelo: { tipo: 'careca' }, bone: '#d62828', bigode: true, roupa: { tipo: 'camiseta', cima: '#3f9b5c', baixo: '#475569', perna: 'calca' } };
  const with_ = (base, extra) => Object.assign({}, base, extra);
  // posição do nariz/cabeça de um personagem (para balões e efeitos)
  const cabeca = (x, y, s, sent) => ({ x, y: y + ((sent ? -150 : -230) - 300) * s });

  // Cena de entrevista na sala (reaproveitada em várias tomadas).
  function entrevista(t0, t1, o = {}) {
    const sh = CT.shot(t0, t1, 'sala', { planta: true, plantaX: 960 });
    obj.cadeira(sh.g, 660, 1480);
    const rep = CT.pessoa(sh, with_(REP, { x: 300, y: 1490 }));
    const men = CT.pessoa(sh, with_(MENINA, { x: 660, y: 1480, pose: 'sentado' }));
    rep.braco(t0 - 1, 'd', 'frente').olhar(t0 - 1, 12, 0);
    men.olhar(t0 - 1, -8, 0);
    return { sh, rep, men };
  }

  // ===== 1) Pergunta + "deixo na casa da vó" (0–7,77)
  {
    const { sh, rep, men } = entrevista(0, 7.77);
    men.humor(0, 'neutro').olhar(0, -14, 0).olhar(3.3, -4, 0).humor(3.3, 'enfado').humor(6.6, 'seria').humor(7.1, 'brava');
    men.braco(4.0, 'd', 'ombro').braco(5.2, 'd', 'baixo');
    rep.humor(0, 'neutro').humor(3.3, 'lado');
    sh.zoom(6.9, 1.12, 660, 1000);
  }

  // ===== 2) A vó conta que ele cagou no banheiro (7,77–12,5)
  {
    const sh = CT.shot(7.77, 12.5, 'banheiro');
    obj.vaso(sh.g, 790, 1440);
    const cc = CT.mk('g', {}, sh.g); obj.coco(cc, 610, 1520, 1.1); CT.pop(cc, 10.13, { anim: 'slam', loop: 'bounce' });
    const men = CT.pessoa(sh, with_(MENINO, { x: 930, y: 1500 }));
    men.humor(7.77, 'malandro').olhar(7.77, -10, 4).braco(10.2, 'ambos', 'acima').pulo(10.2, 11.4, 3, 40);
    const vo = CT.pessoa(sh, with_(VO, { x: 150, y: 1490 }));
    vo.mover(7.9, 8.9, 360).humor(7.77, 'neutro').humor(9.6, 'seria').humor(10.13, 'arregalada').braco(10.15, 'ambos', 'cabeca').olhar(10.13, 10, 8).treme(10.2, 10.7, 5);
    sh.zoom(10.13, 1.18, 600, 1300);
  }

  // ===== 3) "Pois é, cagou sim" / "nem coisa de sorrir" / "coisa séria" (12,5–20,13)
  {
    const { sh, rep, men } = entrevista(12.5, 20.13);
    men.humor(12.5, 'sorriso').pulo(12.97, 13.5, 2, 10).humor(14.27, 'arregalada').olhar(14.27, -14, 0)
      .humor(15.2, 'seria').olhar(15.2, -4, 0).braco(15.4, 'ambos', 'cruzado').humor(18.03, 'brava');
    rep.humor(12.5, 'neutro').humor(13.47, 'risada').braco(13.5, 'e', 'boca').humor(15.0, 'arregalada').braco(15.0, 'e', 'baixo').humor(15.8, 'neutro');
    sh.zoom(18.6, 1.3, 660, 980).zoom(19.9, 1, 540, 1000);
  }

  // ===== 4) O benefício, o shampoo e a palhaça velha (20,13–31,37)
  {
    const { sh, rep, men } = entrevista(20.13, 31.37);
    const hd = cabeca(660, 1480, 1.15, true);
    men.humor(20.13, 'pensativa').braco(20.3, 'd', 'queixo').olhar(20.13, 8, -12)
      .humor(25.8, 'revira').humor(27.5, 'feliz').olhar(27.5, 6, -10)
      .humor(29.13, 'estresse').braco(29.2, 'd', 'cabeca').braco(29.2, 'e', 'cintura').humor(30.77, 'triste');
    rep.humor(20.13, 'lado').humor(27.6, 'arregalada').humor(28.6, 'neutro');
    // balão 1: dinheiro
    const b1 = obj.balao(sh.g, 760, 640, 230, 150, [hd.x + 60, hd.y - 110]);
    R(b1, 640, 590, 240, 110, '#bfe3b0', { r: 10, w: 5, stroke: '#15803d' });
    E(b1, 760, 645, 40, 40, '#e7f5df', { stroke: '#15803d' }); T(b1, 'R$', 760, 660, 40, '#15803d');
    CT.pop(b1, 23.9, { ate: 25.6, loop: 'float' });
    // balão 2: shampoo
    const b2 = obj.balao(sh.g, 760, 640, 230, 170, [hd.x + 60, hd.y - 110]);
    R(b2, 715, 600, 90, 150, '#5fb8e6', { r: 26 }); R(b2, 742, 568, 36, 34, '#ffffff', { w: 4 }); R(b2, 732, 540, 56, 32, '#ff7aa8', { r: 8, w: 4 });
    R(b2, 725, 640, 70, 60, '#ffffff', { r: 8, w: 3 }); T(b2, 'XAMPU', 760, 678, 20, '#1d4ed8');
    CT.pop(b2, 27.6, { ate: 29.13, loop: 'wiggle' });
    // nariz de palhaça
    const nose = CT.mk('g', {}, sh.g); CT.mk('circle', { cx: hd.x + 4, cy: hd.y + 40 * 1.15, r: 22, fill: '#e3262f', stroke: CT.OUT, 'stroke-width': 4 }, nose);
    CT.pop(nose, 30.6, { anim: 'slam' });
    sh.zoom(30.6, 1.35, 660, 1000);
  }

  // ===== 5) Até o cachorro vale mais (31,37–34,8)
  {
    const sh = CT.shot(31.37, 34.8, 'quintal');
    const g = sh.g;
    // almofada + cachorro com coroa
    E(g, 330, 1440, 210, 50, '#b91c1c'); E(g, 330, 1425, 190, 38, '#ef4444', { w: 4 });
    const dog = CT.mk('g', {}, g);
    P(dog, 'M 420 1330 Q 480 1300 470 1240', 'none', { w: 9 });
    E(dog, 340, 1350, 120, 66, '#d9a35b'); E(dog, 210, 1270, 66, 62, '#d9a35b');
    P(dog, 'M 175 1220 Q 130 1260 160 1310 Q 175 1270 196 1226 Z', '#8a5a2b', { w: 4 });
    CT.mk('circle', { cx: 225, cy: 1258, r: 9, fill: '#111' }, dog); E(dog, 160, 1290, 14, 11, '#111', { w: 2 });
    P(dog, 'M 165 1312 Q 190 1330 215 1310', 'none', { w: 4 });
    P(dog, 'M 175 1200 L 185 1160 L 205 1185 L 220 1150 L 235 1185 L 255 1160 L 260 1205 Z', '#ffd23f', { w: 4 });
    CT.pop(dog, 31.4, { anim: 'none', loop: 'bounce' });
    const tag = CT.mk('g', {}, g);
    P(tag, 'M 230 1000 L 410 1000 L 450 1040 L 410 1080 L 230 1080 Z', '#ffd23f'); T(tag, 'R$ 1000', 330, 1056, 44, CT.OUT);
    CT.pop(tag, 33.37, { anim: 'slam' });
    const tag2 = CT.mk('g', {}, g);
    P(tag2, 'M 640 900 L 820 900 L 860 940 L 820 980 L 640 980 Z', '#e5e7eb'); T(tag2, 'R$ 0', 740, 956, 44, '#b91c1c');
    CT.pop(tag2, 34.03, { anim: 'slam' });
    const men = CT.pessoa(sh, with_(MENINA, { x: 760, y: 1490, flip: true }));
    men.humor(31.37, 'triste').braco(31.37, 'ambos', 'cruzado').olhar(31.37, -14, 6).humor(34.03, 'brava');
  }

  // ===== 6) "não vou poder... inferno... leva ele... quem luta sou eu" (34,8–46,03)
  {
    const { sh, rep, men } = entrevista(34.8, 46.03);
    men.humor(34.8, 'enfado').braco(35.0, 'd', 'ombro').braco(36.2, 'd', 'baixo')
      .humor(36.67, 'revira').humor(38.13, 'estresse').braco(38.2, 'ambos', 'acima').braco(39.0, 'ambos', 'baixo')
      .humor(39.13, 'brava').braco(40.5, 'd', 'aponta').olhar(40.5, 14, 0).braco(42.4, 'd', 'baixo').olhar(42.4, -4, 0)
      .braco(42.6, 'ambos', 'cintura').humor(44.97, 'brava').braco(44.97, 'ambos', 'soco').treme(45.0, 45.4, 4);
    rep.humor(34.8, 'lado').humor(38.3, 'arregalada').mover(40.6, 41.4, 240).humor(41.4, 'neutro').humor(45.0, 'arregalada');
    sh.zoom(38.3, 1.2, 660, 1000).zoom(39.1, 1, 540, 1000).zoom(44.97, 1.25, 660, 1020);
  }

  // ===== 7) Casa do pai: "virou a soroba" (46,03–52,03)
  {
    const sh = CT.shot(46.03, 52.03, 'sala', { parede: '#e7f0de', sofa: true, sofaX: 520, sofaW: 440, corSofa: '#7c9cc8', janela: false, quadroX: 140, porta: false, tv: false });
    const pai = CT.pessoa(sh, with_(PAI, { x: -120, y: 1490 }));
    const men = CT.pessoa(sh, with_(MENINO, { x: -20, y: 1500 }));
    pai.mover(46.1, 47.8, 260).braco(46.03, 'd', 'segura').humor(46.03, 'feliz').olhar(46.03, 10, 0)
      .braco(49.43, 'd', 'baixo').humor(49.43, 'arregalada').braco(49.6, 'ambos', 'cabeca').olhar(49.6, 14, -4).treme(50.4, 51.0, 5);
    men.mover(46.1, 47.8, 380).humor(46.03, 'malandro').mover(49.43, 49.9, 700, { y: 1250, anda: false })
      .braco(49.9, 'ambos', 'acima').pulo(49.95, 52.0, 6, 70).humor(49.9, 'feliz');
    // almofadas voando
    for (const [x, y, c, t] of [[880, 900, '#f59e0b', 50.2], [620, 820, '#ef4444', 50.8], [960, 1060, '#22c55e', 51.3]]) {
      const a = CT.mk('g', {}, sh.g); R(a, x - 40, y - 30, 80, 60, c, { r: 14 }); CT.pop(a, t, { anim: 'fly', fx: -120, fy: 260, loop: 'spin' });
    }
  }

  // ===== 8) Chegou 8 da noite (52,03–55,9)
  {
    const sh = CT.shot(52.03, 55.9, 'noite');
    const men = CT.pessoa(sh, with_(MENINA, { x: 540, y: 1470 }));
    men.humor(52.03, 'enfado').braco(52.03, 'ambos', 'cintura').olhar(52.03, -12, 0).humor(53.87, 'dor');
    const pai = CT.pessoa(sh, with_(PAI, { x: -120, y: 1500 }));
    const kid = CT.pessoa(sh, with_(MENINO, { x: -20, y: 1510 }));
    pai.mover(52.1, 53.4, 200).braco(52.03, 'd', 'segura').humor(52.03, 'enfado').olhar(52.03, 12, 0);
    kid.mover(52.1, 53.4, 320).humor(52.03, 'malandro').braco(53.87, 'ambos', 'acima').pulo(53.9, 55.8, 6, 60).treme(53.9, 55.8, 6);
  }

  // ===== 9) "jogou coisa em mim, me mordeu" (55,9–59,1)
  {
    const { sh, rep, men } = entrevista(55.9, 59.1);
    rep.some(55.9, 59.1);
    const kid = CT.pessoa(sh, with_(MENINO, { x: 330, y: 1500 }));
    kid.humor(55.9, 'malandro').olhar(55.9, 14, 0).braco(56.57, 'd', 'acima').braco(57.0, 'd', 'frente')
      .mover(57.5, 57.8, 470, { anda: false }).humor(57.63, 'brava').braco(57.63, 'ambos', 'frente');
    men.humor(55.9, 'enfado').olhar(55.9, -12, 0).humor(56.9, 'arregalada').humor(57.63, 'dor').treme(57.65, 58.6, 6).braco(57.7, 'e', 'acima');
    for (const [x, y, c, t] of [[620, 900, '#8b5cf6', 56.7], [700, 820, '#ef4444', 57.0]]) {
      const a = CT.mk('g', {}, sh.g); R(a, x - 34, y - 26, 68, 52, c, { r: 10 }); CT.pop(a, t, { anim: 'fly', fx: -300, fy: 300, ate: t + 0.9 });
    }
    const nhac = CT.mk('g', {}, sh.g); T(nhac, 'NHAC!', 560, 760, 90, '#d62828', { stroke: '#fff', sw: 10 });
    CT.pop(nhac, 57.63, { anim: 'slam', loop: 'shake' });
  }

  // ===== 10) Na rua: vergonha não, preconceito sim (59,1–68,33)
  {
    const sh = CT.shot(59.1, 68.33, 'rua', { chao: 1200 });
    const p1 = CT.pessoa(sh, { x: 820, y: 1480, flip: true, pele: '#f1c9a5', cabelo: { tipo: 'coque', cor: '#d4a017' }, roupa: { tipo: 'vestido', cima: '#14b8a6' } });
    const p2 = CT.pessoa(sh, { x: 980, y: 1500, flip: true, pele: '#8d5a3b', cabelo: { tipo: 'curto', cor: '#111' }, roupa: { tipo: 'camiseta', cima: '#f97316', baixo: '#1f2937', perna: 'calca' } });
    p1.humor(59.1, 'neutro').olhar(59.1, -14, 0).humor(63.6, 'seria').braco(63.6, 'd', 'boca').humor(66.67, 'brava').braco(66.67, 'ambos', 'cruzado');
    p2.humor(59.1, 'neutro').olhar(59.1, -14, 0).humor(64.0, 'arregalada').braco(66.67, 'd', 'aponta').humor(66.67, 'seria');
    const men = CT.pessoa(sh, with_(MENINA, { x: 120, y: 1490 }));
    const kid = CT.pessoa(sh, with_(MENINO, { x: 250, y: 1510 }));
    men.mover(59.1, 62.6, 400).braco(59.1, 'd', 'segura').humor(59.1, 'seria').olhar(59.1, 6, 0)
      .humor(60.87, 'triste').olhar(62.6, -2, 2).humor(65.5, 'triste').humor(66.67, 'brava').olhar(66.67, 14, 0);
    kid.mover(59.1, 62.6, 530).humor(59.1, 'feliz').pulo(59.2, 62.6, 8, 35).braco(63.0, 'ambos', 'acima').pulo(63.0, 68.3, 14, 55).treme(67.1, 68.3, 6);
  }

  // ===== 11) Crachá de identificação (68,33–74,67)
  {
    const { sh, rep, men } = entrevista(68.33, 74.67);
    const hd = cabeca(660, 1480, 1.15, true);
    men.humor(68.33, 'confusa').braco(68.33, 'ambos', 'ombro').braco(70.3, 'ambos', 'baixo').olhar(69.0, 8, -12)
      .braco(71.53, 'd', 'cabeca').humor(72.2, 'confusa').olhar(74.03, -12, 0);
    rep.humor(68.33, 'lado').humor(72.2, 'confusa');
    const b = obj.balao(sh.g, 760, 640, 220, 190, [hd.x + 60, hd.y - 110]);
    P(b, 'M 700 520 L 750 600 M 820 520 L 770 600', 'none', { w: 9, stroke: '#2563eb' });
    R(b, 700, 600, 120, 160, '#ffffff', { r: 12 }); R(b, 725, 625, 70, 70, '#e5e7eb', { r: 6, w: 3 });
    T(b, '?', 760, 680, 60, '#d62828'); P(b, 'M 720 720 L 800 720 M 720 740 L 780 740', 'none', { w: 5, stroke: '#9ca3af' });
    CT.pop(b, 69.1, { loop: 'float' });
    const q = CT.mk('g', {}, sh.g); T(q, '?', 960, 760, 130, '#d62828'); CT.pop(q, 72.17, { loop: 'wiggle' });
  }

  // ===== 12) Final: segue o perfil (74,67–fim)
  {
    const { sh, rep, men } = entrevista(74.67, 999);
    men.humor(74.67, 'feliz').braco(74.8, 'd', 'acena').olhar(74.67, 0, 2);
    rep.humor(74.67, 'feliz').braco(74.8, 'e', 'acena').olhar(74.67, 0, 2);
  }
};
