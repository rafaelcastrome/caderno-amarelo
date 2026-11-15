/* Fala a cor: aparece o nome de uma cor pintado com OUTRA cor.
   Tu toca na cor da TINTA, não na palavra. 30 segundos. */
(function () {
  'use strict';
  const CA = window.CA;

  const CORES = [
    { id: 'vermelho', nome: 'VERMELHO', hex: '#d62828' },
    { id: 'azul', nome: 'AZUL', hex: '#1d4ed8' },
    { id: 'verde', nome: 'VERDE', hex: '#15803d' },
    { id: 'amarelo', nome: 'AMARELO', hex: '#f2b705' },
    { id: 'roxo', nome: 'ROXO', hex: '#7c3aed' },
  ];
  const ROXO_APOS = 8;

  CA.jogos.cor = {
    nome: 'Fala a cor',
    desc: 'Toca na cor da tinta, não na palavra. Parece fácil...',
    cor: '#d62828',
    icone: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="8" width="40" height="32" rx="6" fill="#fff" stroke="#1f1f24" stroke-width="3"/><text x="24" y="31" text-anchor="middle" font-size="13" font-weight="700" font-family="Caveat,cursive" fill="#1d4ed8">VERDE</text></svg>',
    recordeTxt: () => {
      const r = CA.ler('rec:cor', null);
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

      if (doDia || fixo) jogar(doDia ? CA.sementeDoDia('cor', dataDia) : (+p.s >>> 0));
      else intro();

      function intro() {
        palco.innerHTML = '';
        const rec = CA.ler('rec:cor', null);
        palco.appendChild(CA.el(`
          <section class="intro">
            <a class="voltar" href="#/" aria-label="Voltar">‹</a>
            <h1>Fala a cor</h1>
            <p>Vai aparecer o nome de uma cor pintado com <b>outra</b> cor. Toca na cor da <b>tinta</b>, não no que tá escrito.</p>
            <div class="exemplo-cor"><span style="color:#d62828">AZUL</span> → toca no <i class="bola" style="background:#d62828"></i></div>
            <p class="pequeno">30 segundos. Errou, perde 2 segundos.${rec != null ? ` Teu recorde: <b>${rec}</b>.` : ''}</p>
            <button class="btn btn-grande" data-a="ir">Começar</button>
            ${CA.botaoImpossivel('cor', '20 segundos, 5 cores e 3 segundos de multa')}
          </section>`));
        palco.querySelector('[data-a=ir]').addEventListener('click', () => jogar(CA.novaSemente()));
      }

      async function jogar(semente) {
        const r = CA.rng(semente);
        palco.innerHTML = '';
        const tela = CA.el(`
          <section class="jogo jogo-cor">
            <div class="barra">
              <a class="voltar" href="#/" aria-label="Sair">‹</a>
              <div class="pontos"><b>0</b> acertos</div>
              <div class="relogio">${DURACAO} s</div>
            </div>
            <div class="tempo"><i></i></div>
            ${amigo != null ? `<p class="meta-amigo">Teu amigo fez <b>${amigo}</b>. Bate ele!</p>` : ''}
            ${doDia ? `<p class="meta-amigo">${ehHoje ? 'Desafio do dia: a mesma sequência pra todo mundo hoje' : 'Desafio do dia ' + CA.fmtData(dataDia)}</p>` : ''}
            <div class="cartao-palavra"><span class="palavra"></span><small class="combo"></small></div>
            <div class="botoes-cor"></div>
          </section>`);
        palco.appendChild(tela);
        const elPal = tela.querySelector('.palavra');
        const elPts = tela.querySelector('.pontos b');
        const elRel = tela.querySelector('.relogio');
        const elBarra = tela.querySelector('.tempo i');
        const elCombo = tela.querySelector('.combo');
        const caixa = tela.querySelector('.botoes-cor');

        let pontos = 0, erros = 0, seguidos = 0, melhorSeq = 0, tinta = null, ativas = imp ? 5 : 4, ultimaPal = null;
        function montarBotoes() {
          // ordem dos botões também sorteada, pra não decorar a posição
          const lista = r.shuffle(CORES.slice(0, ativas));
          caixa.style.setProperty('--k', ativas);
          caixa.innerHTML = lista.map(c => `<button class="bola-btn" data-c="${c.id}" style="--c:${c.hex}" aria-label="${c.nome}"></button>`).join('');
        }
        function proxima() {
          if (pontos >= ROXO_APOS && ativas === 4) { ativas = 5; montarBotoes(); }
          const cs = CORES.slice(0, ativas);
          let pal; do { pal = r.pick(cs); } while (pal === ultimaPal);
          ultimaPal = pal;
          // 15% das vezes a palavra e a tinta batem, pra pegar quem tá chutando
          tinta = r() < 0.15 ? pal : r.pick(cs.filter(c => c !== pal));
          elPal.textContent = pal.nome;
          elPal.style.color = tinta.hex;
          elPal.classList.remove('entra'); void elPal.offsetWidth; elPal.classList.add('entra');
        }
        montarBotoes();
        elPal.textContent = '...';

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

        caixa.addEventListener('pointerdown', e => {
          const b = e.target.closest('.bola-btn');
          if (!b || !tinta) return;
          if (b.dataset.c === tinta.id) {
            pontos++; seguidos++; melhorSeq = Math.max(melhorSeq, seguidos);
            elPts.textContent = pontos;
            CA.som('certo');
            elCombo.textContent = seguidos >= 5 ? seguidos + ' seguidos! 🔥' : '';
          } else {
            erros++; seguidos = 0; elCombo.textContent = '';
            fim -= MULTA * 1000;
            CA.som('errado'); CA.vibrar(80);
            tela.classList.remove('erro'); void tela.offsetWidth; tela.classList.add('erro');
          }
          proxima();
        });

        function terminar() {
          cancelAnimationFrame(raf);
          tinta = null;
          elPal.textContent = 'TEMPO!'; elPal.style.color = '#1f1f24';
          const rec = CA.recorde(imp ? 'corx' : 'cor', pontos, false);
          if (ehHoje) CA.marcarDia('cor', pontos + ' acertos');
          setTimeout(() => {
            if (!vivo) return;
            palco.innerHTML = '';
            palco.appendChild(CA.resultado({
              titulo: 'Tu acertou',
              valorTxt: pontos + (pontos === 1 ? ' cor' : ' cores'),
              detalhe: `${erros} ${erros === 1 ? 'erro' : 'erros'} · melhor sequência: ${melhorSeq}`,
              recorde: rec,
              recordeTxt: CA.ler(imp ? 'rec:corx' : 'rec:cor', pontos) + ' acertos',
              amigo: amigo != null ? { valorTxt: amigo + ' acertos', ganhou: pontos > amigo } : null,
              desafio: {
                texto: `Acertei ${pontos} cores em ${DURACAO} segundos no Fala a cor${imp ? ' (modo impossível)' : ''} 🧠 Duvido tu não se enrolar!`,
                url: CA.linkDesafio('cor', imp ? { s: semente, v: pontos, m: 'x' } : { s: semente, v: pontos }),
              },
              card: { jogo: 'Fala a cor', linha1: imp ? 'Modo impossível: acertei' : 'Acertei em 30 segundos', valor: String(pontos), linha3: 'Duvido tu não se enrolar! 👀', cor: '#15803d' },
              jogarDeNovo: () => (fixo || doDia) ? (location.hash = '#/cor') : jogar(CA.novaSemente()),
              imp,
            }));
          }, 900);
        }
      }

      return () => { vivo = false; cancelAnimationFrame(raf); };
    },
  };
})();
