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

  function gerarConta(r, nivel) {
    const tipo = r.pick(nivel < 4 ? ['soma', 'sub'] : ['soma', 'sub', 'vezes', 'vezes', 'metade', 'dobro', 'compara']);
    let txt, certo;
    const erra = r() < 0.5;
    const desvio = () => r.pick([-10, -3, -2, -1, 1, 2, 3, 10]);
    if (tipo === 'soma') {
      const a = r.int(2, nivel < 4 ? 15 : 49), b = r.int(2, nivel < 4 ? 15 : 49);
      const c = a + b + (erra ? desvio() : 0);
      txt = `${a} + ${b} = ${c}`; certo = c === a + b;
    } else if (tipo === 'sub') {
      const a = r.int(10, nivel < 4 ? 30 : 99), b = r.int(1, a - 1);
      const c = a - b + (erra ? desvio() : 0);
      txt = `${a} − ${b} = ${c}`; certo = c === a - b;
    } else if (tipo === 'vezes') {
      const a = r.int(2, 9), b = r.int(2, 9);
      const c = a * b + (erra ? r.pick([-a, a, -1, 1, b, -b]) : 0);
      txt = `${a} × ${b} = ${c}`; certo = c === a * b;
    } else if (tipo === 'metade') {
      const a = r.int(3, 40) * 2;
      const c = a / 2 + (erra ? desvio() : 0);
      txt = `A metade de ${a} é ${c}`; certo = c === a / 2;
    } else if (tipo === 'dobro') {
      const a = r.int(6, 49);
      const c = a * 2 + (erra ? desvio() : 0);
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

  CA.jogos.rapido = {
    nome: 'Responde rápido',
    desc: 'Certo ou errado? Contas e pegadinhas em 30 segundos.',
    cor: '#15803d',
    icone: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="26" r="17" fill="#dcfce7" stroke="#1f1f24" stroke-width="3"/><path d="M24 26V15M24 26l7 5" stroke="#1f1f24" stroke-width="3" stroke-linecap="round"/><rect x="19" y="3" width="10" height="6" rx="2" fill="#1f1f24"/></svg>',
    recordeTxt: () => {
      const r = CA.ler('rec:rapido', null);
      return r == null ? '' : r + ' acertos';
    },
    iniciar(palco, p) {
      let vivo = true, raf = 0;
      const dataDia = CA.dataDoDesafio(p);
      if (dataDia === false) return;
      const doDia = !!dataDia, ehHoje = dataDia === CA.hojeBR();
      const imp = p.m === 'x';
      if (imp && !CA.ehPremium()) { location.hash = '#/premium'; return; }
      const DURACAO = imp ? 20 : 30, MULTA = imp ? 3 : 2;
      const amigo = p.v != null ? parseInt(p.v, 10) : null;
      const fixo = p.s != null;

      if (doDia || fixo) jogar(doDia ? CA.sementeDoDia('rapido', dataDia) : (+p.s >>> 0));
      else intro();

      function intro() {
        palco.innerHTML = '';
        const rec = CA.ler('rec:rapido', null);
        palco.appendChild(CA.el(`
          <section class="intro">
            <a class="voltar" href="#/" aria-label="Voltar">‹</a>
            <h1>Responde rápido</h1>
            <p>Vai aparecer uma conta ou uma frase. Tu responde <b>CERTO</b> ou <b>ERRADO</b>, o mais rápido possível. Cuidado com as pegadinhas!</p>
            <p class="pequeno">30 segundos. Errou, perde 2 segundos.${rec != null ? ` Teu recorde: <b>${rec}</b>.` : ''}</p>
            <button class="btn btn-grande" data-a="ir">Começar</button>
            ${CA.botaoImpossivel('rapido', '20 segundos, contas difíceis desde o começo e 3 segundos de multa')}
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
              <a class="voltar" href="#/" aria-label="Sair">‹</a>
              <div class="pontos"><b>0</b> acertos</div>
              <div class="relogio">${DURACAO} s</div>
            </div>
            <div class="tempo"><i></i></div>
            ${amigo != null ? `<p class="meta-amigo">Teu amigo fez <b>${amigo}</b>. Bate ele!</p>` : ''}
            ${doDia ? `<p class="meta-amigo">${ehHoje ? 'Desafio do dia: as mesmas perguntas pra todo mundo hoje' : 'Desafio do dia ' + CA.fmtData(dataDia)}</p>` : ''}
            <div class="cartao-pergunta"><span class="pergunta"></span></div>
            <div class="botoes-sn">
              <button class="sn sn-certo" data-r="1">CERTO</button>
              <button class="sn sn-errado" data-r="0">ERRADO</button>
            </div>
          </section>`);
        palco.appendChild(tela);
        const elQ = tela.querySelector('.pergunta');
        const elCartao = tela.querySelector('.cartao-pergunta');
        const elPts = tela.querySelector('.pontos b');
        const elRel = tela.querySelector('.relogio');
        const elBarra = tela.querySelector('.tempo i');

        let pontos = 0, erros = 0, n = 0, atual = null, pi = 0;
        function proxima() {
          n++;
          // a partir da 4ª, 1 em cada 3 é pegadinha
          if (n >= 4 && pi < pool.length && r() < 0.34) {
            const [txt, certo] = pool[pi++];
            atual = { txt, certo };
          } else atual = gerarConta(r, imp ? n + 10 : n);
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
          const resta = Math.max(0, (fim - performance.now()) / 1000);
          const s = Math.ceil(resta);
          elRel.textContent = s + ' s';
          elBarra.style.width = (resta / DURACAO * 100) + '%';
          if (s !== ultimoSeg) { ultimoSeg = s; if (s <= 5 && s > 0) CA.som('tique'); }
          if (resta <= 0) { terminar(); return; }
          raf = requestAnimationFrame(tick);
        })();

        tela.querySelector('.botoes-sn').addEventListener('pointerdown', e => {
          const b = e.target.closest('.sn');
          if (!b || !atual) return;
          const resp = b.dataset.r === '1';
          if (resp === atual.certo) {
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
          const rec = CA.recorde(imp ? 'rapidox' : 'rapido', pontos, false);
          if (ehHoje) CA.marcarDia('rapido', pontos + ' acertos');
          setTimeout(() => {
            if (!vivo) return;
            palco.innerHTML = '';
            palco.appendChild(CA.resultado({
              titulo: 'Tu acertou',
              valorTxt: pontos + (pontos === 1 ? ' resposta' : ' respostas'),
              detalhe: `${erros} ${erros === 1 ? 'erro' : 'erros'} em ${DURACAO} segundos`,
              recorde: rec,
              recordeTxt: CA.ler(imp ? 'rec:rapidox' : 'rec:rapido', pontos) + ' acertos',
              amigo: amigo != null ? { valorTxt: amigo + ' acertos', ganhou: pontos > amigo } : null,
              desafio: {
                texto: `Acertei ${pontos} no Responde rápido${imp ? ' (modo impossível)' : ''} em ${DURACAO} segundos ⏱️ Duvido tu cair em menos pegadinha!`,
                url: CA.linkDesafio('rapido', imp ? { s: semente, v: pontos, m: 'x' } : { s: semente, v: pontos }),
              },
              card: { jogo: 'Responde rápido', linha1: imp ? 'Modo impossível: acertei' : 'Acertei em 30 segundos', valor: String(pontos), linha3: 'Duvido tu não cair na pegadinha!', cor: '#d62828' },
              jogarDeNovo: () => (fixo || doDia) ? (location.hash = '#/rapido') : jogar(CA.novaSemente()),
              imp,
            }));
          }, 900);
        }
      }

      return () => { vivo = false; cancelAnimationFrame(raf); };
    },
  };
})();
