// Desafios do Caderno Amarelo: a lista de desafios do jogo (desafios.html).
//
// Campos de cada desafio:
//   id              número sequencial (é o "desafio 01, 02...")
//   tipo            'imagem' (tem desenho em SVG) ou 'texto' (só a pergunta)
//   titulo          nome curto que aparece em cima
//   pergunta        o que o jogador tem que responder
//   imagem          (só tipo 'imagem') SVG em texto, desenhado no estilo caderno
//   respostaCorreta resposta principal; é ela que aparece no "revelar"
//   aceitas         outras respostas que também valem (opcional)
//   explicacao      texto que aparece junto com a resposta, depois de acertar
//   isPremium       true = só abre depois do Pix (do desafio 3 em diante)
//
// A checagem ignora maiúsculas, acentos, pontuação e espaços extras
// (ver normalizar() em desafios.js), então não precisa repetir variações assim aqui.

(function () {
  const TINTA = '#1f1f24';
  const svg = (corpo, vb = '0 0 320 200') =>
    `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" font-family="Caveat, 'Comic Sans MS', cursive" stroke-linecap="round" stroke-linejoin="round">${corpo}</svg>`;

  // Grade 3x3 pro desafio dos quadrados.
  const grade = (() => {
    const x0 = 100, y0 = 40, l = 40;
    let s = '';
    for (let i = 0; i <= 3; i++) {
      s += `<line x1="${x0}" y1="${y0 + i * l}" x2="${x0 + 3 * l}" y2="${y0 + i * l}"/>`;
      s += `<line x1="${x0 + i * l}" y1="${y0}" x2="${x0 + i * l}" y2="${y0 + 3 * l}"/>`;
    }
    return svg(`<g stroke="${TINTA}" stroke-width="4" fill="none">${s}</g>`);
  })();

  // Ilusão de Müller-Lyer: as duas linhas têm o mesmo tamanho.
  const mullerLyer = svg(`
    <g stroke="${TINTA}" stroke-width="5" fill="none">
      <line x1="90" y1="62" x2="230" y2="62"/>
      <polyline points="112,40 90,62 112,84"/><polyline points="208,40 230,62 208,84"/>
      <line x1="90" y1="148" x2="230" y2="148"/>
      <polyline points="68,126 90,148 68,170"/><polyline points="252,126 230,148 252,170"/>
    </g>
    <text x="40" y="72" font-size="34" fill="#1d4ed8">A</text>
    <text x="40" y="158" font-size="34" fill="#d62828">B</text>`);

  // Fala a cor (efeito Stroop): a palavra AZUL pintada de vermelho.
  const stroop = svg(`<text x="160" y="125" text-anchor="middle" font-size="86" font-weight="700" fill="#d62828">AZUL</text>`);

  // Sequência de números.
  const sequencia = svg(`
    <g font-size="44" fill="${TINTA}" text-anchor="middle">
      <text x="34" y="118">2</text><text x="86" y="118">6</text><text x="138" y="118">12</text>
      <text x="196" y="118">20</text><text x="252" y="118">30</text>
    </g>
    <text x="300" y="118" font-size="52" fill="#d62828" text-anchor="middle">?</text>
    <g stroke="${TINTA}" stroke-width="2" fill="none" opacity=".35">
      <path d="M40 135 q23 22 46 0"/><path d="M92 135 q23 22 46 0"/><path d="M146 135 q25 22 50 0"/><path d="M202 135 q25 22 50 0"/>
    </g>`);

  // Palavra escrita no espelho.
  const espelho = svg(`
    <g transform="translate(320,0) scale(-1,1)">
      <text x="160" y="122" text-anchor="middle" font-size="70" font-weight="700" fill="${TINTA}">AMARELO</text>
    </g>
    <rect x="18" y="160" width="284" height="10" rx="5" fill="#ffd23f"/>`);

  // Relógio no espelho: mostra 9h no espelho, que na verdade é 3h.
  const relogio = svg(`
    <circle cx="160" cy="100" r="78" fill="#fffaf0" stroke="${TINTA}" stroke-width="5"/>
    ${[...Array(12)].map((_, i) => {
      const a = i * Math.PI / 6;
      const x1 = 160 + Math.sin(a) * 64, y1 = 100 - Math.cos(a) * 64;
      const x2 = 160 + Math.sin(a) * 72, y2 = 100 - Math.cos(a) * 72;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${TINTA}" stroke-width="${i % 3 ? 2 : 5}"/>`;
    }).join('')}
    <line x1="160" y1="100" x2="160" y2="44" stroke="${TINTA}" stroke-width="5"/>
    <line x1="160" y1="100" x2="118" y2="100" stroke="#d62828" stroke-width="7"/>
    <circle cx="160" cy="100" r="6" fill="${TINTA}"/>
    <text x="306" y="36" text-anchor="end" font-size="26" fill="#1d4ed8">espelho</text>`);

  window.DESAFIOS = [
    {
      id: 1, tipo: 'texto', titulo: 'Esquenta',
      pergunta: 'O que é, o que é: quanto mais tu tira, maior fica?',
      respostaCorreta: 'Buraco', aceitas: ['um buraco', 'o buraco'],
      explicacao: 'Cada pazada que tu tira deixa o buraco maior. Quem pensou em "dívida" também tá no caminho, mas aí aumenta quando tu põe, né?',
      isPremium: false
    },
    {
      id: 2, tipo: 'imagem', titulo: 'Conta os quadrados',
      pergunta: 'Quantos quadrados tu vê nesse desenho?',
      imagem: grade,
      respostaCorreta: '14', aceitas: ['quatorze', 'catorze'],
      explicacao: 'Quase todo mundo fala 9. Mas tem 9 pequenos, 4 médios (de 2x2) e 1 grandão em volta de tudo: 9 + 4 + 1 = 14.',
      isPremium: false
    },
    {
      id: 3, tipo: 'imagem', titulo: 'Fala a cor',
      pergunta: 'Qual é a COR da tinta dessa palavra?',
      imagem: stroop,
      respostaCorreta: 'Vermelho', aceitas: ['vermelha'],
      explicacao: 'Teu cérebro lê a palavra sozinho e ela briga com a cor. Isso é o efeito Stroop, descoberto em 1935.',
      isPremium: true
    },
    {
      id: 4, tipo: 'texto', titulo: 'Pegadinha do calendário',
      pergunta: 'Quantos meses do ano têm 28 dias?',
      respostaCorreta: 'Todos (12)', aceitas: ['12', 'doze', 'todos', 'todos os meses', 'os 12'],
      explicacao: 'Fevereiro é o único que tem SÓ 28, mas todos os 12 meses têm pelo menos 28 dias.',
      isPremium: true
    },
    {
      id: 5, tipo: 'imagem', titulo: 'Qual linha é maior?',
      pergunta: 'Qual linha é maior: A ou B?',
      imagem: mullerLyer,
      respostaCorreta: 'São iguais', aceitas: ['iguais', 'igual', 'nenhuma', 'as duas', 'mesmo tamanho', 'tem o mesmo tamanho', 'sao do mesmo tamanho'],
      explicacao: 'Mede com o dedo: as duas têm o mesmo tamanho. As setinhas pra fora fazem a B parecer maior. É a ilusão de Müller-Lyer.',
      isPremium: true
    },
    {
      id: 6, tipo: 'texto', titulo: 'A corrida',
      pergunta: 'Tu tá numa corrida e ultrapassa o segundo colocado. Em que lugar tu fica?',
      respostaCorreta: 'Segundo lugar', aceitas: ['segundo', '2', '2º', '2o', 'em segundo', 'segundo colocado'],
      explicacao: 'Tu tomou o lugar dele, então virou o segundo. O primeiro continua lá na frente!',
      isPremium: true
    },
    {
      id: 7, tipo: 'imagem', titulo: 'Qual o próximo?',
      pergunta: 'Que número vem no lugar do ponto de interrogação?',
      imagem: sequencia,
      respostaCorreta: '42', aceitas: ['quarenta e dois'],
      explicacao: 'O pulo cresce de 2 em 2: +4, +6, +8, +10... então o próximo é +12. 30 + 12 = 42.',
      isPremium: true
    },
    {
      id: 8, tipo: 'texto', titulo: 'Os filhos',
      pergunta: 'O pai do João tem 5 filhos: Lalá, Lelé, Lili, Loló e...?',
      respostaCorreta: 'João', aceitas: ['o joao', 'joao'],
      explicacao: 'Tá na própria pergunta: "o pai do JOÃO". O cérebro vê o padrão La-Le-Li-Lo e quer completar com Lulu.',
      isPremium: true
    },
    {
      id: 9, tipo: 'imagem', titulo: 'Relógio no espelho',
      pergunta: 'Esse relógio tá refletido no espelho. Que horas são de verdade?',
      imagem: relogio,
      respostaCorreta: '3 horas', aceitas: ['3', '3h', '3:00', '03:00', 'tres', 'tres horas', '15h', '15', '15:00', 'quinze horas'],
      explicacao: 'No espelho o ponteiro pequeno aponta pro 9, mas o espelho troca esquerda e direita. Desvirando, ele aponta pro 3.',
      isPremium: true
    },
    {
      id: 10, tipo: 'imagem', titulo: 'Desafio final',
      pergunta: 'Que palavra tá escrita no espelho?',
      imagem: espelho,
      respostaCorreta: 'Amarelo', aceitas: ['caderno amarelo'],
      explicacao: 'AMARELO, de Caderno Amarelo! Tu zerou todos os desafios. Manda pra um amigo e vê se ele consegue.',
      isPremium: true
    }
  ];
})();
