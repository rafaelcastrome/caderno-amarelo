// Desafios do Caderno Amarelo: a lista de desafios do jogo (desafios.html).
//
// Campos de cada desafio (o id é posto automaticamente pela ordem da lista):
//   id              número sequencial (é o "desafio 01, 02...")
//   tipo            'imagem' (tem desenho em SVG) ou 'texto' (só a pergunta)
//   titulo          nome curto que aparece em cima
//   pergunta        o que o jogador tem que responder
//   imagem          (só tipo 'imagem') SVG em texto, desenhado no estilo caderno
//   respostaCorreta resposta principal; é ela que aparece no "revelar"
//   aceitas         outras respostas que também valem (opcional)
//   explicacao      texto que aparece junto com a resposta, depois de acertar
//   isPremium       true = só abre depois do Pix (do desafio 3 em diante; posto automaticamente)
//
// A checagem ignora maiúsculas, acentos, pontuação e espaços extras
// (ver normalizar() em desafios.js), então não precisa repetir variações assim aqui.

(function () {
  const TINTA = '#1f1f24', VERM = '#d62828', AZUL = '#1d4ed8', VERDE = '#15803d', ROXO = '#7c3aed', LARANJA = '#ea580c', AMAR = '#ffd23f';
  const svg = (corpo, vb = '0 0 320 200') =>
    `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" font-family="Caveat, 'Comic Sans MS', cursive" stroke-linecap="round" stroke-linejoin="round">${corpo}</svg>`;

  // ---------- geradores de desenho ----------

  // Grade n x n (contar quadrados).
  function grade(n) {
    const l = Math.min(40, 150 / n), x0 = 160 - (n * l) / 2, y0 = 100 - (n * l) / 2;
    let s = '';
    for (let i = 0; i <= n; i++) {
      s += `<line x1="${x0}" y1="${y0 + i * l}" x2="${x0 + n * l}" y2="${y0 + i * l}"/>`;
      s += `<line x1="${x0 + i * l}" y1="${y0}" x2="${x0 + i * l}" y2="${y0 + n * l}"/>`;
    }
    return svg(`<g stroke="${TINTA}" stroke-width="4" fill="none">${s}</g>`);
  }

  // Tira com n casinhas (contar retângulos).
  function tira(n) {
    const l = 50, x0 = 160 - (n * l) / 2;
    let s = `<rect x="${x0}" y="70" width="${n * l}" height="60"/>`;
    for (let i = 1; i < n; i++) s += `<line x1="${x0 + i * l}" y1="70" x2="${x0 + i * l}" y2="130"/>`;
    return svg(`<g stroke="${TINTA}" stroke-width="4" fill="none">${s}</g>`);
  }

  // Fala a cor (efeito Stroop): palavra escrita numa cor diferente.
  const stroop = (palavra, cor, tam = 86) =>
    svg(`<text x="160" y="128" text-anchor="middle" font-size="${tam}" font-weight="700" fill="${cor}">${palavra}</text>`);

  // Sequência com um ? no fim.
  function sequencia(itens, tam = 44) {
    const todos = [...itens, '?'];
    const passo = 300 / todos.length;
    return svg(todos.map((t, i) =>
      `<text x="${10 + passo * (i + .5)}" y="118" text-anchor="middle" font-size="${t === '?' ? tam + 8 : tam}" fill="${t === '?' ? VERM : TINTA}">${t}</text>`).join(''));
  }

  // Palavra no espelho ou de cabeça pra baixo.
  const espelho = (palavra, tam = 70) => svg(`
    <g transform="translate(320,0) scale(-1,1)"><text x="160" y="122" text-anchor="middle" font-size="${tam}" font-weight="700" fill="${TINTA}">${palavra}</text></g>
    <rect x="18" y="160" width="284" height="10" rx="5" fill="${AMAR}"/>`);
  const deCabeca = (palavra, tam = 70) => svg(`
    <g transform="rotate(180 160 100)"><text x="160" y="124" text-anchor="middle" font-size="${tam}" font-weight="700" fill="${TINTA}">${palavra}</text></g>`);

  // Relógio no espelho: o ponteiro pequeno aponta pra "horaNoEspelho", o grande pro 12.
  function relogio(horaNoEspelho) {
    let marcas = '';
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const p = r => [(160 + Math.sin(a) * r).toFixed(1), (100 - Math.cos(a) * r).toFixed(1)];
      const [x1, y1] = p(64), [x2, y2] = p(72);
      marcas += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${TINTA}" stroke-width="${i % 3 ? 2 : 5}"/>`;
    }
    const a = horaNoEspelho * Math.PI / 6;
    const hx = (160 + Math.sin(a) * 42).toFixed(1), hy = (100 - Math.cos(a) * 42).toFixed(1);
    return svg(`
      <circle cx="160" cy="100" r="78" fill="#fffaf0" stroke="${TINTA}" stroke-width="5"/>${marcas}
      <line x1="160" y1="100" x2="160" y2="44" stroke="${TINTA}" stroke-width="5"/>
      <line x1="160" y1="100" x2="${hx}" y2="${hy}" stroke="${VERM}" stroke-width="7"/>
      <circle cx="160" cy="100" r="6" fill="${TINTA}"/>
      <text x="306" y="36" text-anchor="end" font-size="26" fill="${AZUL}">espelho</text>`);
  }

  // Emojis grandes (charadas de filme e de palavra).
  const emojis = (linha, tam = 64) => {
    const itens = linha.split(' ').filter(Boolean), passo = 300 / itens.length;
    return svg(itens.map((t, i) => t === '+'
      ? `<text x="${10 + passo * (i + .5)}" y="122" text-anchor="middle" font-size="48" fill="${TINTA}">+</text>`
      : `<text x="${10 + passo * (i + .5)}" y="124" text-anchor="middle" font-size="${tam}" font-family="'Noto Color Emoji','Apple Color Emoji','Segoe UI Emoji',sans-serif">${t}</text>`).join(''));
  };

  // Grade de emojis pra contar um deles. Ordem fixa (sem sorteio), pra resposta não mudar.
  function grupoEmojis(alvo, isca, mapa) {
    const linhas = mapa.trim().split('/');
    const tam = 30, larg = linhas[0].length * 36, x0 = 160 - larg / 2 + 18, y0 = 100 - (linhas.length * 36) / 2 + 28;
    let s = '', total = 0;
    linhas.forEach((l, r) => [...l].forEach((c, k) => {
      if (c === 'x') total++;
      s += `<text x="${x0 + k * 36}" y="${y0 + r * 36}" text-anchor="middle" font-size="${tam}">${c === 'x' ? alvo : isca}</text>`;
    }));
    return { imagem: svg(`<g font-family="'Noto Color Emoji','Apple Color Emoji','Segoe UI Emoji',sans-serif">${s}</g>`), total };
  }

  // Ilusões.
  const mullerLyer = svg(`
    <g stroke="${TINTA}" stroke-width="5" fill="none">
      <line x1="90" y1="62" x2="230" y2="62"/>
      <polyline points="112,40 90,62 112,84"/><polyline points="208,40 230,62 208,84"/>
      <line x1="90" y1="148" x2="230" y2="148"/>
      <polyline points="68,126 90,148 68,170"/><polyline points="252,126 230,148 252,170"/>
    </g>
    <text x="40" y="72" font-size="34" fill="${AZUL}">A</text>
    <text x="40" y="158" font-size="34" fill="${VERM}">B</text>`);

  const ebbinghaus = (() => {
    let s = '';
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; s += `<circle cx="${(85 + Math.cos(a) * 52).toFixed(1)}" cy="${(100 + Math.sin(a) * 52).toFixed(1)}" r="24" fill="#9ca3af"/>`; }
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += `<circle cx="${(240 + Math.cos(a) * 30).toFixed(1)}" cy="${(100 + Math.sin(a) * 30).toFixed(1)}" r="8" fill="#9ca3af"/>`; }
    return svg(`${s}<circle cx="85" cy="100" r="18" fill="${LARANJA}"/><circle cx="240" cy="100" r="18" fill="${LARANJA}"/>
      <text x="85" y="190" text-anchor="middle" font-size="28" fill="${AZUL}">A</text><text x="240" y="190" text-anchor="middle" font-size="28" fill="${VERM}">B</text>`);
  })();

  const cinzas = svg(`
    <defs><linearGradient id="dg" x1="0" x2="1"><stop offset="0" stop-color="#111"/><stop offset="1" stop-color="#f4f4f4"/></linearGradient></defs>
    <rect x="10" y="30" width="300" height="130" fill="url(#dg)"/>
    <rect x="50" y="70" width="50" height="50" fill="#808080"/><rect x="220" y="70" width="50" height="50" fill="#808080"/>
    <text x="75" y="190" text-anchor="middle" font-size="28" fill="${AZUL}">A</text><text x="245" y="190" text-anchor="middle" font-size="28" fill="${VERM}">B</text>`);

  // Frase pra contar letras.
  const frase = (linhas, tam = 40) => svg(linhas.map((t, i) =>
    `<text x="160" y="${100 - (linhas.length - 1) * tam * .55 + i * tam * 1.1 + tam * .35}" text-anchor="middle" font-size="${tam}" fill="${TINTA}">${t}</text>`).join(''));

  const maca = grupoEmojis('🍎', '🍅', 'oxoox/xooxo/ooxoo/xoxoo');
  const gato = grupoEmojis('🐱', '🐯', 'ooxoo/xoooo/oooxo/ooooo/oxooo');
  const olhos = grupoEmojis('👀', '👁️', 'xooox/ooxoo/oxoxo');

  // ---------- os desafios ----------
  const LISTA = [
    { tipo: 'texto', titulo: 'Esquenta',
      pergunta: 'O que é, o que é: quanto mais tu tira, maior fica?',
      respostaCorreta: 'Buraco', aceitas: ['um buraco', 'o buraco'],
      explicacao: 'Cada pazada que tu tira deixa o buraco maior.' },
    { tipo: 'imagem', titulo: 'Conta os quadrados',
      pergunta: 'Quantos quadrados tu vê nesse desenho?', imagem: grade(3),
      respostaCorreta: '14', aceitas: ['quatorze', 'catorze'],
      explicacao: 'Quase todo mundo fala 9. Mas tem 9 pequenos, 4 médios (de 2x2) e 1 grandão em volta de tudo: 9 + 4 + 1 = 14.' },

    // ---- daqui pra baixo é premium ----
    { tipo: 'imagem', titulo: 'Fala a cor',
      pergunta: 'Qual é a COR da tinta dessa palavra?', imagem: stroop('AZUL', VERM),
      respostaCorreta: 'Vermelho', aceitas: ['vermelha'],
      explicacao: 'Teu cérebro lê a palavra sozinho e ela briga com a cor. Isso é o efeito Stroop, descoberto em 1935.' },
    { tipo: 'texto', titulo: 'Pegadinha do calendário',
      pergunta: 'Quantos meses do ano têm 28 dias?',
      respostaCorreta: 'Todos (12)', aceitas: ['12', 'doze', 'todos', 'todos os meses', 'os 12'],
      explicacao: 'Fevereiro é o único que tem SÓ 28, mas todos os 12 meses têm pelo menos 28 dias.' },
    { tipo: 'imagem', titulo: 'Qual linha é maior?',
      pergunta: 'Qual linha é maior: A ou B?', imagem: mullerLyer,
      respostaCorreta: 'São iguais', aceitas: ['iguais', 'igual', 'nenhuma', 'as duas', 'mesmo tamanho', 'tem o mesmo tamanho', 'sao do mesmo tamanho'],
      explicacao: 'Mede com o dedo: as duas têm o mesmo tamanho. As setinhas pra fora fazem a B parecer maior. É a ilusão de Müller-Lyer.' },
    { tipo: 'texto', titulo: 'A corrida',
      pergunta: 'Tu tá numa corrida e ultrapassa o segundo colocado. Em que lugar tu fica?',
      respostaCorreta: 'Segundo lugar', aceitas: ['segundo', '2', '2º', '2o', 'em segundo', 'segundo colocado'],
      explicacao: 'Tu tomou o lugar dele, então virou o segundo. O primeiro continua lá na frente!' },
    { tipo: 'imagem', titulo: 'Qual o próximo?',
      pergunta: 'Que número vem no lugar do ponto de interrogação?', imagem: sequencia([2, 6, 12, 20, 30]),
      respostaCorreta: '42', aceitas: ['quarenta e dois'],
      explicacao: 'O pulo cresce de 2 em 2: +4, +6, +8, +10... então o próximo é +12. 30 + 12 = 42.' },
    { tipo: 'texto', titulo: 'Os filhos',
      pergunta: 'O pai do João tem 5 filhos: Lalá, Lelé, Lili, Loló e...?',
      respostaCorreta: 'João', aceitas: ['o joao'],
      explicacao: 'Tá na própria pergunta: "o pai do JOÃO". O cérebro vê o padrão La-Le-Li-Lo e quer completar com Lulu.' },
    { tipo: 'imagem', titulo: 'Relógio no espelho',
      pergunta: 'Esse relógio tá refletido no espelho. Que horas são de verdade?', imagem: relogio(9),
      respostaCorreta: '3 horas', aceitas: ['3', '3h', '3:00', '03:00', 'tres', 'tres horas', '15h', '15', '15:00', 'quinze horas'],
      explicacao: 'No espelho o ponteiro pequeno aponta pro 9, mas o espelho troca esquerda e direita. Desvirando, ele aponta pro 3.' },
    { tipo: 'texto', titulo: 'Cai em pé',
      pergunta: 'O que é, o que é: cai em pé e corre deitada?',
      respostaCorreta: 'Chuva', aceitas: ['a chuva'],
      explicacao: 'Cai do céu "em pé" e depois escorre deitadinha pelo chão.' },
    { tipo: 'imagem', titulo: 'Charada de filme',
      pergunta: 'Que filme é esse?', imagem: emojis('🦁 👑'),
      respostaCorreta: 'O Rei Leão', aceitas: ['rei leao', 'the lion king', 'lion king'],
      explicacao: 'Leão + coroa = O Rei Leão, de 1994. O remake de 2019 é um dos filmes que mais faturaram na história.' },
    { tipo: 'texto', titulo: 'A arca',
      pergunta: 'Quantos animais de cada espécie Moisés levou na arca?',
      respostaCorreta: 'Nenhum (foi Noé)', aceitas: ['nenhum', 'zero', '0', 'foi noe', 'noe', 'nenhum foi noe', 'moises nao levou'],
      explicacao: 'Quem construiu a arca foi Noé, não Moisés. Teu cérebro nem percebe a troca porque os dois nomes "combinam" com a história.' },
    { tipo: 'imagem', titulo: 'Fala a cor 2',
      pergunta: 'Qual é a COR da tinta dessa palavra?', imagem: stroop('VERDE', AZUL),
      respostaCorreta: 'Azul',
      explicacao: 'De novo o efeito Stroop: ler é automático, falar a cor dá trabalho pro cérebro.' },
    { tipo: 'texto', titulo: 'A toalha',
      pergunta: 'O que é, o que é: quanto mais seca, mais molhada fica?',
      respostaCorreta: 'Toalha', aceitas: ['a toalha'],
      explicacao: 'Cada vez que ela te seca, ela fica mais encharcada.' },
    { tipo: 'imagem', titulo: 'Sequência famosa',
      pergunta: 'Que número vem agora?', imagem: sequencia([1, 1, 2, 3, 5, 8]),
      respostaCorreta: '13', aceitas: ['treze'],
      explicacao: 'Cada número é a soma dos dois anteriores: 5 + 8 = 13. É a sequência de Fibonacci, que aparece até em girassol e concha de caracol.' },
    { tipo: 'texto', titulo: 'O tijolo',
      pergunta: 'Um tijolo pesa 1 kg mais meio tijolo. Quanto pesa o tijolo inteiro?',
      respostaCorreta: '2 kg', aceitas: ['2', 'dois', 'dois quilos', '2 quilos', '2kg'],
      explicacao: 'Se meio tijolo + 1 kg é o tijolo todo, então a outra metade pesa 1 kg. Duas metades de 1 kg = 2 kg.' },
    { tipo: 'imagem', titulo: 'Acha as maçãs',
      pergunta: 'Quantas MAÇÃS tem aqui? (cuidado com os tomates)', imagem: maca.imagem,
      respostaCorreta: String(maca.total),
      explicacao: 'Tomate e maçã vermelhos juntos confundem o olho. Quem conta rápido sempre erra por um ou dois.' },
    { tipo: 'texto', titulo: 'Coroa e escamas',
      pergunta: 'Tem coroa mas não é rei, tem escamas mas não é peixe. O que é?',
      respostaCorreta: 'Abacaxi', aceitas: ['o abacaxi', 'ananas'],
      explicacao: 'A "coroa" são as folhas lá em cima e as "escamas" são a casca.' },
    { tipo: 'imagem', titulo: 'Palavra no espelho',
      pergunta: 'Que palavra tá escrita no espelho?', imagem: espelho('CADERNO'),
      respostaCorreta: 'Caderno',
      explicacao: 'Ler espelhado é lento porque o cérebro precisa "girar" cada letra antes de reconhecer.' },
    { tipo: 'texto', titulo: 'O galo',
      pergunta: 'Um galo bota um ovo bem no meio do telhado. Pra que lado o ovo cai?',
      respostaCorreta: 'Nenhum: galo não bota ovo', aceitas: ['nenhum', 'nenhum lado', 'galo nao bota ovo', 'nao cai', 'galo nao poe ovo'],
      explicacao: 'Quem bota ovo é a galinha! Tu tava calculando o telhado, né?' },
    { tipo: 'imagem', titulo: 'Bolinha laranja',
      pergunta: 'Qual bolinha LARANJA é maior: A ou B?', imagem: ebbinghaus,
      respostaCorreta: 'São iguais', aceitas: ['iguais', 'igual', 'nenhuma', 'mesmo tamanho', 'as duas', 'sao do mesmo tamanho'],
      explicacao: 'As duas são do mesmo tamanho. Cercada de bolas grandes ela parece pequena, e cercada de pequenas parece grande. É a ilusão de Ebbinghaus.' },
    { tipo: 'texto', titulo: 'Dente que não morde',
      pergunta: 'Tem cabeça e tem dente, não é bicho nem é gente. O que é?',
      respostaCorreta: 'Alho', aceitas: ['o alho', 'cabeca de alho', 'dente de alho'],
      explicacao: 'Cabeça de alho, cheia de dentes de alho.' },
    { tipo: 'imagem', titulo: 'Letras misteriosas',
      pergunta: 'Que letra vem agora?', imagem: sequencia(['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N'], 30),
      respostaCorreta: 'D', aceitas: ['letra d', 'a letra d', 'dezembro'],
      explicacao: 'São as iniciais dos meses: Janeiro, Fevereiro, Março... Novembro, Dezembro!' },
    { tipo: 'texto', titulo: 'A bola e o taco',
      pergunta: 'Um taco e uma bola custam R$ 1,10 juntos. O taco custa R$ 1,00 a mais que a bola. Quanto custa a bola?',
      respostaCorreta: 'R$ 0,05 (5 centavos)', aceitas: ['0,05', '0.05', 'r$ 0,05', '5 centavos', 'cinco centavos', '5'],
      explicacao: 'Quase todo mundo fala 10 centavos. Mas aí o taco seria R$ 1,10 e o total daria R$ 1,20. Bola R$ 0,05 + taco R$ 1,05 = R$ 1,10.' },
    { tipo: 'imagem', titulo: 'Charada de filme 2',
      pergunta: 'Que filme é esse?', imagem: emojis('🐠 🔍'),
      respostaCorreta: 'Procurando Nemo', aceitas: ['nemo', 'procurando o nemo', 'finding nemo'],
      explicacao: 'Peixe-palhaço + lupa = Procurando Nemo, da Pixar (2003).' },
    { tipo: 'texto', titulo: 'Os gatos',
      pergunta: 'Se 3 gatos pegam 3 ratos em 3 minutos, quantos gatos pegam 100 ratos em 100 minutos?',
      respostaCorreta: '3 gatos', aceitas: ['3', 'tres', 'tres gatos', 'os mesmos 3'],
      explicacao: 'Cada gato pega 1 rato por 3 minutos. Em 100 minutos, 3 gatos pegam uns 100 ratos. Não precisa de mais gato!' },
    { tipo: 'imagem', titulo: 'Conta os retângulos',
      pergunta: 'Quantos retângulos tem nessa tira? (contando os grandes também)', imagem: tira(3),
      respostaCorreta: '6', aceitas: ['seis'],
      explicacao: '3 pequenos + 2 de dois quadradinhos + 1 grandão = 6.' },
    { tipo: 'texto', titulo: 'O nome',
      pergunta: 'O que é que é teu, mas os outros usam muito mais do que tu?',
      respostaCorreta: 'Teu nome', aceitas: ['nome', 'o nome', 'meu nome', 'o meu nome', 'o teu nome', 'seu nome'],
      explicacao: 'Todo mundo te chama pelo nome. Tu quase nunca fala o teu próprio.' },
    { tipo: 'imagem', titulo: 'Qual quadrado é mais escuro?',
      pergunta: 'Qual quadradinho cinza é mais escuro: A ou B?', imagem: cinzas,
      respostaCorreta: 'São iguais', aceitas: ['iguais', 'igual', 'nenhum', 'mesma cor', 'os dois', 'sao da mesma cor'],
      explicacao: 'Os dois são exatamente o mesmo cinza. O fundo escuro faz o A parecer claro e o fundo claro faz o B parecer escuro.' },
    { tipo: 'texto', titulo: 'A mãe da Ana',
      pergunta: 'A mãe da Ana tem 3 filhas: Janeiro, Fevereiro e...?',
      respostaCorreta: 'Ana', aceitas: ['a ana'],
      explicacao: 'Tá na pergunta de novo! O cérebro pega o padrão dos meses e quer falar "Março".' },
    { tipo: 'imagem', titulo: 'Os quadrados ao quadrado',
      pergunta: 'Que número vem agora?', imagem: sequencia([1, 4, 9, 16, 25]),
      respostaCorreta: '36', aceitas: ['trinta e seis'],
      explicacao: 'São 1x1, 2x2, 3x3, 4x4, 5x5... agora 6x6 = 36.' },
    { tipo: 'texto', titulo: 'O silêncio',
      pergunta: 'O que é que quebra só de falar o nome dele?',
      respostaCorreta: 'Silêncio', aceitas: ['o silencio'],
      explicacao: 'Falou "silêncio", já quebrou o silêncio.' },
    { tipo: 'imagem', titulo: 'Charada de palavra',
      pergunta: 'Que palavra (ou expressão) esses emojis formam?', imagem: emojis('🌙 + 🍯'),
      respostaCorreta: 'Lua de mel', aceitas: ['lua-de-mel'],
      explicacao: 'Lua + mel = lua de mel, a viagem depois do casamento.' },
    { tipo: 'texto', titulo: 'Os comprimidos',
      pergunta: 'O médico te deu 3 comprimidos pra tomar um a cada meia hora. Quanto tempo eles duram?',
      respostaCorreta: '1 hora', aceitas: ['uma hora', '1h', '60 minutos', '60 min', '1'],
      explicacao: 'Toma um agora, outro em 30 min e o último em 60 min. Acabou em 1 hora, não em 1 hora e meia.' },
    { tipo: 'imagem', titulo: 'De cabeça pra baixo',
      pergunta: 'Que palavra é essa?', imagem: deCabeca('BRIGADEIRO', 52),
      respostaCorreta: 'Brigadeiro',
      explicacao: 'De cabeça pra baixo a gente lê pelo formato da palavra, não letra por letra. Por isso dá pra ler, só que mais devagar.' },
    { tipo: 'texto', titulo: 'O avião',
      pergunta: 'Um avião cai bem na fronteira do Brasil com a Argentina. Em que país enterram os sobreviventes?',
      respostaCorreta: 'Em nenhum: sobrevivente não se enterra', aceitas: ['nenhum', 'em nenhum', 'nenhum lugar', 'em lugar nenhum', 'nao enterram', 'sobrevivente nao se enterra', 'nao se enterra sobrevivente', 'eles estao vivos'],
      explicacao: 'Sobrevivente tá VIVO! Teu cérebro ficou pensando em fronteira e esqueceu essa palavra.' },
    { tipo: 'imagem', titulo: 'Acha o gato',
      pergunta: 'Quantos GATOS tem aqui? (os tigres não contam)', imagem: gato.imagem,
      respostaCorreta: String(gato.total),
      explicacao: 'Gato e tigre de longe parecem iguais. O olho procura a cor e esquece das listras.' },
    { tipo: 'texto', titulo: 'O fósforo',
      pergunta: 'Tu entra num quarto escuro com um só fósforo. Lá tem uma vela, um lampião e um fogão. O que tu acende primeiro?',
      respostaCorreta: 'O fósforo', aceitas: ['fosforo'],
      explicacao: 'Antes de qualquer coisa, tem que acender o fósforo!' },
    { tipo: 'imagem', titulo: 'Fala a cor 3',
      pergunta: 'Qual é a COR da tinta dessa palavra?', imagem: stroop('AMARELO', ROXO, 72),
      respostaCorreta: 'Roxo', aceitas: ['roxa', 'lilas', 'violeta'],
      explicacao: 'Logo a palavra AMARELO pra te enganar! A tinta é roxa.' },
    { tipo: 'texto', titulo: 'Algodão ou ferro',
      pergunta: 'O que pesa mais: 1 kg de algodão ou 1 kg de ferro?',
      respostaCorreta: 'Os dois pesam igual', aceitas: ['iguais', 'igual', 'nenhum', 'os dois', 'pesam igual', 'mesmo peso', 'tanto faz'],
      explicacao: '1 kg é 1 kg. O ferro só parece mais pesado porque ocupa bem menos espaço.' },
    { tipo: 'imagem', titulo: 'Os triângulos',
      pergunta: 'Que número vem agora?', imagem: sequencia([1, 3, 6, 10, 15]),
      respostaCorreta: '21', aceitas: ['vinte e um'],
      explicacao: 'Soma +2, +3, +4, +5... agora +6: 15 + 6 = 21. São os números triangulares (as bolas de sinuca no triângulo são 15!).' },
    { tipo: 'texto', titulo: 'A letra',
      pergunta: 'O que aparece uma vez no minuto, duas vezes no momento e nunca em cem anos?',
      respostaCorreta: 'A letra M', aceitas: ['m', 'letra m'],
      explicacao: 'Olha as palavras: Minuto tem um M, MoMento tem dois M e "cem anos" não tem nenhum.' },
    { tipo: 'imagem', titulo: 'Charada de filme 3',
      pergunta: 'Que filme (ou herói) é esse?', imagem: emojis('🕷️ 🧑'),
      respostaCorreta: 'Homem-Aranha', aceitas: ['homem aranha', 'spider man', 'spiderman', 'spider-man'],
      explicacao: 'Aranha + homem = Homem-Aranha, criado em 1962.' },
    { tipo: 'texto', titulo: 'O 10',
      pergunta: 'Quantas vezes dá pra tirar 2 de 10?',
      respostaCorreta: 'Uma vez', aceitas: ['1', 'uma', '1 vez', 'so uma', 'so uma vez'],
      explicacao: 'Depois que tu tira 2 do 10, ele já virou 8. Aí tu tá tirando do 8!' },
    { tipo: 'imagem', titulo: 'Contando números',
      pergunta: 'Que letra vem agora?', imagem: sequencia(['U', 'D', 'T', 'Q', 'C', 'S', 'S'], 38),
      respostaCorreta: 'O', aceitas: ['letra o', 'a letra o', 'oito'],
      explicacao: 'Um, Dois, Três, Quatro, Cinco, Seis, Sete... Oito!' },
    { tipo: 'texto', titulo: 'O pente',
      pergunta: 'Tem dentes, mas não morde, e vive na tua cabeça de manhã. O que é?',
      respostaCorreta: 'Pente', aceitas: ['o pente', 'escova', 'escova de cabelo'],
      explicacao: 'O pente tem um monte de dentinhos e passa no teu cabelo todo dia.' },
    { tipo: 'imagem', titulo: 'Conta os quadrados 2',
      pergunta: 'E agora? Quantos quadrados tem nessa grade?', imagem: grade(2),
      respostaCorreta: '5', aceitas: ['cinco'],
      explicacao: '4 pequenos + 1 grande em volta = 5. Esse é o aquecimento pro de baixo!' },
    { tipo: 'imagem', titulo: 'Conta os quadrados: chefão',
      pergunta: 'E nessa grade 4x4? Quantos quadrados no total?', imagem: grade(4),
      respostaCorreta: '30', aceitas: ['trinta'],
      explicacao: '16 pequenos + 9 de 2x2 + 4 de 3x3 + 1 grande = 30. Truque: é 1² + 2² + 3² + 4².' },
    { tipo: 'texto', titulo: 'O trem elétrico',
      pergunta: 'Um trem elétrico vai pro norte e o vento sopra pro sul. Pra que lado vai a fumaça?',
      respostaCorreta: 'Nenhum: trem elétrico não solta fumaça', aceitas: ['nenhum', 'nenhum lado', 'nao tem fumaca', 'nao solta fumaca', 'trem eletrico nao solta fumaca', 'nao tem'],
      explicacao: 'Trem elétrico não queima nada, então não tem fumaça!' },
    { tipo: 'imagem', titulo: 'Conta as letras',
      pergunta: 'Quantas letras A tem nessa frase?', imagem: frase(['A ARARA AMARELA', 'ADORA BANANA']),
      respostaCorreta: '13', aceitas: ['treze'],
      explicacao: 'A (1) + ARARA (3) + AMARELA (4) + ADORA (2) + BANANA (3) = 13. Quase todo mundo esquece o A sozinho do começo.' },
    { tipo: 'texto', titulo: 'O segredo',
      pergunta: 'Se tu me tem, quer me contar. Se me conta, não me tem mais. O que eu sou?',
      respostaCorreta: 'Um segredo', aceitas: ['segredo', 'o segredo'],
      explicacao: 'Contou o segredo? Ele deixou de ser segredo.' },
    { tipo: 'imagem', titulo: 'Charada de filme 4',
      pergunta: 'Que filme é esse?', imagem: emojis('❄️ 👸 ⛄'),
      respostaCorreta: 'Frozen', aceitas: ['frozen uma aventura congelante', 'uma aventura congelante'],
      explicacao: 'Gelo + princesa + boneco de neve (o Olaf) = Frozen, da Disney (2013).' },
    { tipo: 'texto', titulo: 'A vassoura',
      pergunta: 'O que é, o que é: corre a casa inteira e depois dorme no canto?',
      respostaCorreta: 'Vassoura', aceitas: ['a vassoura'],
      explicacao: 'Varre a casa toda e depois fica encostada no cantinho.' },
    { tipo: 'imagem', titulo: 'Dobrando',
      pergunta: 'Que número vem agora?', imagem: sequencia([3, 6, 12, 24, 48]),
      respostaCorreta: '96', aceitas: ['noventa e seis'],
      explicacao: 'Cada número é o dobro do anterior: 48 x 2 = 96.' },
    { tipo: 'texto', titulo: 'O pão',
      pergunta: 'O que é, o que é: quanto mais quente, mais fresquinho?',
      respostaCorreta: 'Pão', aceitas: ['o pao', 'pao quentinho', 'pao frances'],
      explicacao: 'Pão quentinho é pão que acabou de sair do forno, fresquinho!' },
    { tipo: 'imagem', titulo: 'Charada de palavra 2',
      pergunta: 'Que comida esses emojis formam?', imagem: emojis('🐶 + 🔥'),
      respostaCorreta: 'Cachorro-quente', aceitas: ['cachorro quente', 'hot dog', 'hotdog'],
      explicacao: 'Cachorro + quente = cachorro-quente!' },
    { tipo: 'texto', titulo: 'O dicionário',
      pergunta: 'Qual palavra tá escrita errado em todos os dicionários?',
      respostaCorreta: 'Errado', aceitas: ['a palavra errado'],
      explicacao: 'A palavra "errado" tá escrita... "errado" em todo dicionário. Pegadinha de português!' },
    { tipo: 'imagem', titulo: 'Os olhos',
      pergunta: 'Quantos pares de olhos 👀 tem aqui? (o olho sozinho não conta)', imagem: olhos.imagem,
      respostaCorreta: String(olhos.total),
      explicacao: 'O olho sozinho é quase igual ao par. Teu cérebro completa o que falta e vê par onde não tem.' },
    { tipo: 'texto', titulo: 'A agulha',
      pergunta: 'Tem olho mas não enxerga, e vive com linha. O que é?',
      respostaCorreta: 'Agulha', aceitas: ['a agulha', 'agulha de costura'],
      explicacao: 'O "olho" da agulha é o furinho onde passa a linha.' },
    { tipo: 'imagem', titulo: 'Relógio no espelho 2',
      pergunta: 'Mais um relógio no espelho. Que horas são de verdade?', imagem: relogio(10),
      respostaCorreta: '2 horas', aceitas: ['2', '2h', '2:00', '02:00', 'duas', 'duas horas', '14h', '14', '14:00', 'catorze horas', 'quatorze horas'],
      explicacao: 'No espelho aponta pro 10. Desvirando, o 10 vira o 2 (os dois ficam à mesma distância do 12).' },
    { tipo: 'texto', titulo: 'A rua',
      pergunta: 'O que é, o que é: foi feita pra andar e nunca sai do lugar?',
      respostaCorreta: 'Rua', aceitas: ['a rua', 'estrada', 'calcada', 'caminho'],
      explicacao: 'Todo mundo anda na rua, mas a rua mesmo fica paradinha.' },
    { tipo: 'imagem', titulo: 'Charada de filme 5',
      pergunta: 'Que filme é esse?', imagem: emojis('🍫 🏭'),
      respostaCorreta: 'A Fantástica Fábrica de Chocolate', aceitas: ['fantastica fabrica de chocolate', 'fabrica de chocolate', 'a fabrica de chocolate', 'wonka', 'charlie e a fantastica fabrica de chocolate'],
      explicacao: 'Chocolate + fábrica = A Fantástica Fábrica de Chocolate, do Willy Wonka.' },
    { tipo: 'texto', titulo: 'O vento',
      pergunta: 'Passa na frente do sol e não faz sombra. O que é?',
      respostaCorreta: 'O vento', aceitas: ['vento', 'ar', 'o ar'],
      explicacao: 'O vento passa por tudo e é invisível, então não tem sombra.' },
    { tipo: 'imagem', titulo: 'Escrita de hacker',
      pergunta: 'O que tá escrito aqui?', imagem: svg(`<text x="160" y="90" text-anchor="middle" font-size="54" font-weight="700" fill="${TINTA}">C4D3RN0</text><text x="160" y="150" text-anchor="middle" font-size="54" font-weight="700" fill="${TINTA}">4M4R3L0</text>`),
      respostaCorreta: 'Caderno Amarelo',
      explicacao: '4 = A, 3 = E, 0 = O. Teu cérebro troca os números por letras sem tu nem perceber.' },
    { tipo: 'texto', titulo: 'Meses de 31',
      pergunta: 'Quantos meses do ano têm 31 dias?',
      respostaCorreta: '7', aceitas: ['sete', '7 meses', 'sete meses'],
      explicacao: 'Janeiro, março, maio, julho, agosto, outubro e dezembro. Truque: conta nos nós dos dedos da mão fechada!' },
    { tipo: 'imagem', titulo: 'Desafio final',
      pergunta: 'Que palavra tá escrita no espelho?', imagem: espelho('AMARELO'),
      respostaCorreta: 'Amarelo', aceitas: ['caderno amarelo'],
      explicacao: 'AMARELO, de Caderno Amarelo! Tu zerou todos os desafios. Manda pra um amigo e vê se ele consegue.' }
  ];

  const GRATIS = 2; // desafios grátis antes do paywall
  window.DESAFIOS = LISTA.map((d, i) => ({ id: i + 1, ...d, isPremium: i >= GRATIS }));
})();
