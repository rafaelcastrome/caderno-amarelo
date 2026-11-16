/* Responde rápido: conta e pegadinha de CERTO ou ERRADO, 30 segundos.
   As contas são geradas na hora e as pegadinhas são embaralhadas,
   então a sequência nunca se repete (a não ser no link do amigo). */
(function () {
  'use strict';
  const CA = window.CA;

  // [frase, é certo?]
  const PEGADINHAS = [
    ['1 kg de algodão pesa menos que 1 kg de ferro', false],
    ['Se tu passa o segundo colocado, tu fica em primeiro', false],
    ['Aranha tem 8 patas', true],
    ['O Sol é uma estrela', true],
    ['O polvo tem 3 corações', true],
    ['A Lua tem luz própria', false],
    ['Metade de 2, mais 2, dá 3', true],
    ['Pinguim é ave', true],
    ['Baleia é peixe', false],
    ['Morcego é mamífero', true],
    ['Tubarão é mamífero', false],
    ['Tomate é fruta', true],
    ['Uma dúzia tem 10 unidades', false],
    ['Meia dúzia mais meia dúzia é uma dúzia', true],
    ['Um minuto tem 100 segundos', false],
    ['Uma hora tem 3.600 segundos', true],
    ['Zero vezes qualquer número dá zero', true],
    ['15 minutos é um quarto de hora', true],
    ['Hexágono tem 6 lados', true],
    ['Triângulo tem 4 lados', false],
    ['Galo bota ovo', false],
    ['Fevereiro sempre tem 28 dias', false],
    ['Um século tem 100 anos', true],
    ['O mindinho é o maior dedo da mão', false],
    ['O número 1 é par', false],
    ['Dez dezenas dá cem', true],
    ['Plutão ainda é considerado planeta', false],
    ['A Terra gira em volta do Sol', true],
    ['O Brasil tem 26 estados e o Distrito Federal', true],
    ['Um ano tem 12 meses e 365 ou 366 dias', true],
    ['Cem centímetros é um metro', true],
  ];

  // Conta de CERTO ou ERRADO. d = dificuldade (o nível, de 1 a 10, que ainda sobe um pouco durante a partida).
  // Cada nível libera contas novas e números maiores, e o erro fica mais disfarçado (perto do certo).
  function gerarConta(r, d) {
    const tipos = ['soma', 'sub'];
    if (d >= 3) tipos.push('vezes');
    if (d >= 4) tipos.push('vezes');
    if (d >= 5) tipos.push('metade', 'dobro');
    if (d >= 6) tipos.push('compara');
    if (d >= 8) tipos.push('tres', 'vezes2');
    if (d >= 9) tipos.push('ordem', 'ordem');
    const tipo = r.pick(tipos);
    const lim = [10, 20, 30, 50, 99, 99, 150, 199, 299, 499][Math.min(9, d - 1)];
    const erra = r() < 0.5;
    // nos primeiros níveis o erro é grande (fácil de ver); depois fica colado no resultado certo
    const desvio = () => d <= 2 ? r.pick([-5, -4, -3, 3, 4, 5]) : d <= 5 ? r.pick([-10, -3, -2, -1, 1, 2, 3, 10]) : r.pick([-10, -1, 1, 10, -2, 2]);
    let txt, certo, c;
    if (tipo === 'soma') {
      const a = r.int(1, Math.ceil(lim / 2)), b = r.int(1, Math.ceil(lim / 2));
      c = a + b + (erra ? desvio() : 0);
      txt = `${a} + ${b} = ${c}`; certo = c === a + b;
    } else if (tipo === 'sub') {
      const a = r.int(Math.min(5, lim), lim), b = r.int(1, a - 1 || 1);
      c = a - b + (erra ? desvio() : 0);
      txt = `${a} − ${b} = ${c}`; certo = c === a - b;
    } else if (tipo === 'vezes') {
      const max = d <= 3 ? 5 : d <= 6 ? 9 : 12;
      const a = r.int(2, max), b = r.int(2, max);
      c = a * b + (erra ? r.pick([-a, a, -1, 1, b, -b]) : 0);
      txt = `${a} × ${b} = ${c}`; certo = c === a * b;
    } else if (tipo === 'vezes2') {
      const a = r.int(11, 25), b = r.int(2, 9);
      c = a * b + (erra ? r.pick([-b, b, -10, 10, -1, 1]) : 0);
      txt = `${a} × ${b} = ${c}`; certo = c === a * b;
    } else if (tipo === 'tres') {
      const a = r.int(5, 60), b = r.int(5, 60), e = r.int(5, 60);
      c = a + b + e + (erra ? desvio() : 0);
      txt = `${a} + ${b} + ${e} = ${c}`; certo = c === a + b + e;
    } else if (tipo === 'ordem') {
      // pegadinha da ordem: primeiro a multiplicação
      const a = r.int(2, 20), b = r.int(2, 9), e = r.int(2, 9);
      const certoV = a + b * e, errado = (a + b) * e;
      c = erra ? (r() < 0.6 ? errado : certoV + desvio()) : certoV;
      if (c === certoV && erra) c = certoV + 1;
      txt = `${a} + ${b} × ${e} = ${c}`; certo = c === certoV;
    } else if (tipo === 'metade') {
      const a = r.int(3, d >= 7 ? 99 : 40) * 2;
      c = a / 2 + (erra ? desvio() : 0);
      txt = `A metade de ${a} é ${c}`; certo = c === a / 2;
    } else if (tipo === 'dobro') {
      const a = r.int(6, d >= 7 ? 199 : 49);
      c = a * 2 + (erra ? desvio() : 0);
      txt = `O dobro de ${a} é ${c}`; certo = c === a * 2;
    } else {
      // pegadinha clássica de vírgula: 0,5 x 0,45
      const a = r.int(1, 9), b = r.int(10, 99);
      const va = a / 10, vb = b / 100;
      const fa = '0,' + a, fb = '0,' + b;
      if (r() < 0.5) { txt = `${fa} é maior que ${fb}`; certo = va > vb; }
      else { txt = `${fb} é maior que ${fa}`; certo = vb > va; }
    }
    return { txt, certo };
  }

  // os Jogos em grupo (grupo.js) usam as mesmas contas e pegadinhas
  CA.gerarConta = gerarConta;
  CA.PEGADINHAS = PEGADINHAS;

  // níveis: [segundos, multa, pegadinhas?, acertos pra 1/2/3 estrelas]
  // A conta de cada nível usa gerarConta(nível): começa com soma e diminuição até 10
  // e vai ganhando tabuada, metade/dobro, vírgula, três números, ordem das contas...
  const NIV = [
    [30, 1, false, [10, 14, 18]],
    [30, 2, false, [10, 14, 18]],
    [30, 2, true, [10, 14, 18]],
    [30, 2, true, [11, 15, 19]],
    [30, 2, true, [11, 15, 19]],
    [25, 3, true, [10, 13, 16]],
    [25, 3, true, [10, 13, 16]],
    [25, 3, true, [10, 13, 16]],
    [20, 3, true, [8, 11, 14]],
    [20, 3, true, [9, 12, 15]],
  ];
  // o que entra em cada nível, pra tela de antes de jogar
  const CONTEUDO = ['soma e diminuição até 10', 'soma e diminuição até 20', 'soma, diminuição e tabuada até 5',
    'tabuada completa', 'metade e dobro', 'vírgula que engana (0,5 ou 0,45?)', 'números até 150 e tabuada do 12',
    'conta com três números', 'ordem das contas (+ e ×)', 'tudo junto, números grandes'];

  const jogo = CA.registrarJogo({
    id: 'rapido', nome: 'Responde rápido', icone: '⏱️', cor: '#15803d', total: NIV.length,
    desc: 'Certo ou errado? Começa com conta de 1+1 e vai ficando cabeluda.',
    href: n => '#/rapido?n=' + n,
  });

  CA.CONTEUDO_RAPIDO = CONTEUDO; // pro desafio do dia (dia.js)

  CA.jogos.rapido = {
    nome: 'Responde rápido',
    iniciar(palco, p) {
      let vivo = true, raf = 0;
      const n = Math.max(1, Math.min(+p.n || jogo.proximo(), NIV.length));
      const amigo = p.v != null ? parseInt(p.v, 10) : null;
      const deAmigo = p.s != null;
      if (!jogo.liberado(n) && !(deAmigo && n <= CA.NIVEIS_GRATIS)) {
        if (n > CA.NIVEIS_GRATIS && !jogo.acesso()) CA.telaNivelTrancado(palco, jogo, n);
        else location.hash = jogo.href(jogo.proximo());
        return null;
      }
      const [DURACAO, MULTA, PEGA, ALVO] = NIV[n - 1];
      if (deAmigo) jogar(+p.s >>> 0); else intro();

      function intro() {
        palco.innerHTML = '';
        palco.appendChild(CA.el(`
          <section class="intro">
            <a class="voltar" href="#/jogo?id=rapido" aria-label="Voltar">‹</a>
            <span class="nivel-tag">Responde rápido · nível ${n} de ${NIV.length}</span>
            <h1>Responde rápido</h1>
            <p>Vai aparecer uma conta${PEGA ? ' ou uma frase' : ''}. Tu responde <b>CERTO</b> ou <b>ERRADO</b>, o mais rápido possível.${PEGA ? ' Cuidado com as pegadinhas!' : ''}</p>
            <ul class="regras-nivel">
              <li><b>${DURACAO} segundos</b> · novidade: ${CONTEUDO[n - 1]}</li>
              <li>Errou, perde ${MULTA} segundos</li>
              <li>★ ${ALVO[0]} acertos · ★★ ${ALVO[1]} · ★★★ ${ALVO[2]}</li>
            </ul>
            <button class="btn btn-grande" data-a="ir">Começar o nível ${n}</button>
          </section>`));
        palco.querySelector('[data-a=ir]').addEventListener('click', () => jogar(CA.novaSemente()));
      }

      async function jogar(semente) {
        const r = CA.rng(semente);
        const pool = r.shuffle(PEGADINHAS);
        palco.innerHTML = '';
        const tela = CA.el(`
          <section class="jogo jogo-rapido">
            <div class="barra">
              <a class="voltar" href="${p.voltar || '#/jogo?id=rapido'}" aria-label="Sair">‹</a>
              <div class="pontos"><b>0</b> / ${ALVO[0]}</div>
              <div class="relogio">${DURACAO} s</div>
            </div>
            <div class="tempo"><i></i></div>
            <p class="meta-amigo">${p.meta ? p.meta : amigo != null ? `Teu amigo fez <b>${amigo}</b>. Bate ele!` : `Nível ${n}: acerta ${ALVO[0]} pra passar`}</p>
            <div class="cartao-pergunta"><span class="pergunta"></span></div>
            <div class="botoes-sn">
              <button class="sn sn-certo" data-r="1">CERTO</button>
              <button class="sn sn-errado" data-r="0">ERRADO</button>
            </div>
          </section>`);
        palco.appendChild(tela);
        const elQ = tela.querySelector('.pergunta'), elCartao = tela.querySelector('.cartao-pergunta');
        const elPts = tela.querySelector('.pontos b'), elRel = tela.querySelector('.relogio');
        const elBarra = tela.querySelector('.tempo i');

        let pontos = 0, erros = 0, k = 0, atual = null, pi = 0;
        function proxima() {
          k++;
          if (PEGA && k >= 3 && pi < pool.length && r() < 0.34) {
            const [txt, certo] = pool[pi++];
            atual = { txt, certo };
          } else atual = gerarConta(r, Math.min(10, n + Math.floor(k / 12)));
          elQ.textContent = atual.txt;
          elQ.classList.toggle('longa', atual.txt.length > 22);
          elCartao.classList.remove('entra'); void elCartao.offsetWidth; elCartao.classList.add('entra');
        }
        elQ.textContent = '...';
        await CA.contagem(tela);
        if (!vivo) return;
        proxima();

        let fim = performance.now() + DURACAO * 1000, ultimoSeg = DURACAO;
        (function tick() {
          if (!vivo) return;
          const resta = Math.max(0, (fim - performance.now()) / 1000), s = Math.ceil(resta);
          elRel.textContent = s + ' s';
          elBarra.style.width = (resta / DURACAO * 100) + '%';
          if (s !== ultimoSeg) { ultimoSeg = s; if (s <= 5 && s > 0) CA.som('tique'); }
          if (resta <= 0) { terminar(); return; }
          raf = requestAnimationFrame(tick);
        })();

        tela.querySelector('.botoes-sn').addEventListener('pointerdown', e => {
          const b = e.target.closest('.sn');
          if (!b || !atual) return;
          if ((b.dataset.r === '1') === atual.certo) {
            pontos++; elPts.textContent = pontos; CA.som('certo');
            elCartao.dataset.fx = 'certo';
          } else {
            erros++; fim -= MULTA * 1000; CA.som('errado'); CA.vibrar(80);
            elCartao.dataset.fx = 'errado';
            tela.classList.remove('erro'); void tela.offsetWidth; tela.classList.add('erro');
          }
          proxima();
        });

        function terminar() {
          cancelAnimationFrame(raf);
          atual = null;
          elQ.textContent = 'TEMPO!';
          const est = pontos >= ALVO[2] ? 3 : pontos >= ALVO[1] ? 2 : pontos >= ALVO[0] ? 1 : 0;
          // desafio do dia (dia.js): quem controla a rodada guarda o resultado e chama o próximo nível
          if (p.onFim) { setTimeout(() => { if (vivo) p.onFim({ p: pontos, e: est, erros, semente }); }, 900); return; }
          const melhorAntes = (jogo.prog()[n] || {}).p;
          const tent = est ? CA.salvarNivel('rapido', n, { e: est, p: pontos }) : null;
          setTimeout(() => {
            if (!vivo) return;
            CA.resultadoNivel(palco, jogo, n, {
              titulo: est ? `Nível ${n}: tu acertou` : `Faltou pouco! Precisava de ${ALVO[0]}`,
              valorTxt: pontos + (pontos === 1 ? ' resposta' : ' respostas'),
              estrelas: est,
              detalhe: (tent ? (tent === 1 ? 'De primeira! ' : `Tentativa nº ${tent}. `) : '') + `${erros} ${erros === 1 ? 'erro' : 'erros'} em ${DURACAO} segundos`,
              recordeTxt: melhorAntes != null ? Math.max(melhorAntes, pontos) + ' acertos' : '',
              amigo: amigo != null ? { valorTxt: amigo + ' acertos', ganhou: pontos > amigo } : null,
              desafio: {
                texto: `Acertei ${pontos} no nível ${n} do Responde rápido ⏱️ Duvido tu cair em menos pegadinha!`,
                url: CA.linkDesafio('rapido', { n, s: semente, v: pontos }),
              },
              card: { jogo: 'Responde rápido', linha1: `Nível ${n} · ${DURACAO} segundos`, valor: String(pontos), estrelas: est, linha3: 'Duvido tu não cair na pegadinha!', cor: '#15803d',
                comoJoga: 'Certo ou errado? Responde antes do tempo acabar', tentativa: tent ? CA.naTentativa(tent) : '' },
              jogarDeNovo: () => jogar(CA.novaSemente()),
            });
          }, 900);
        }
      }
      return () => { vivo = false; cancelAnimationFrame(raf); };
    },
  };
})();
