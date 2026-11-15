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
  CORES.push({ id: 'laranja', nome: 'LARANJA', hex: '#ea580c' });

  // níveis: [cores, segundos, multa, botões mudam de lugar?, pontos pra 1/2/3 estrelas]
  const NIV = [
    [4, 30, 2, false, [12, 18, 24]],
    [4, 25, 2, false, [12, 17, 22]],
    [5, 30, 2, false, [14, 20, 26]],
    [5, 25, 2, true, [12, 17, 22]],
    [5, 20, 2, false, [10, 14, 18]],
    [6, 30, 2, false, [14, 19, 24]],
    [6, 25, 2, true, [12, 16, 20]],
    [6, 20, 3, false, [10, 14, 18]],
    [6, 20, 3, true, [10, 13, 17]],
    [6, 15, 3, true, [8, 11, 14]],
  ];

  const jogo = CA.registrarJogo({
    id: 'cor', nome: 'Fala a cor', icone: '🎨', cor: '#d62828', total: NIV.length,
    desc: 'Toca na cor da TINTA, não na palavra. Parece fácil...',
    href: n => '#/cor?n=' + n,
  });

  CA.jogos.cor = {
    nome: 'Fala a cor',
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
      const [ATIVAS, DURACAO, MULTA, MEXE, ALVO] = NIV[n - 1];
      if (deAmigo) jogar(+p.s >>> 0); else intro();

      function intro() {
        palco.innerHTML = '';
        palco.appendChild(CA.el(`
          <section class="intro">
            <a class="voltar" href="#/jogo?id=cor" aria-label="Voltar">‹</a>
            <span class="nivel-tag">Fala a cor · nível ${n} de ${NIV.length}</span>
            <h1>Fala a cor</h1>
            <p>Vai aparecer o nome de uma cor pintado com <b>outra</b> cor. Toca na cor da <b>tinta</b>, não no que tá escrito.</p>
            <div class="exemplo-cor"><span style="color:#d62828">AZUL</span> → toca no <i class="bola" style="background:#d62828"></i></div>
            <ul class="regras-nivel">
              <li><b>${DURACAO} segundos</b> e <b>${ATIVAS} cores</b>${MEXE ? ', e os botões <b>mudam de lugar</b>' : ''}</li>
              <li>Errou, perde ${MULTA} segundos</li>
              <li>★ ${ALVO[0]} acertos · ★★ ${ALVO[1]} · ★★★ ${ALVO[2]}</li>
            </ul>
            <button class="btn btn-grande" data-a="ir">Começar o nível ${n}</button>
          </section>`));
        palco.querySelector('[data-a=ir]').addEventListener('click', () => jogar(CA.novaSemente()));
      }

      async function jogar(semente) {
        const r = CA.rng(semente);
        palco.innerHTML = '';
        const tela = CA.el(`
          <section class="jogo jogo-cor">
            <div class="barra">
              <a class="voltar" href="#/jogo?id=cor" aria-label="Sair">‹</a>
              <div class="pontos"><b>0</b> / ${ALVO[0]}</div>
              <div class="relogio">${DURACAO} s</div>
            </div>
            <div class="tempo"><i></i></div>
            <p class="meta-amigo">${amigo != null ? `Teu amigo fez <b>${amigo}</b>. Bate ele!` : `Nível ${n}: faz ${ALVO[0]} pra passar`}</p>
            <div class="cartao-palavra"><span class="palavra"></span><small class="combo"></small></div>
            <div class="botoes-cor"></div>
          </section>`);
        palco.appendChild(tela);
        const elPal = tela.querySelector('.palavra'), elPts = tela.querySelector('.pontos b');
        const elRel = tela.querySelector('.relogio'), elBarra = tela.querySelector('.tempo i');
        const elCombo = tela.querySelector('.combo'), caixa = tela.querySelector('.botoes-cor');
        const cs = CORES.slice(0, ATIVAS);
        let pontos = 0, erros = 0, seguidos = 0, melhorSeq = 0, tinta = null, ultimaPal = null;
        function montarBotoes() {
          caixa.style.setProperty('--k', ATIVAS > 4 ? 3 : 4);
          caixa.innerHTML = r.shuffle(cs).map(c => `<button class="bola-btn" data-c="${c.id}" style="--c:${c.hex}" aria-label="${c.nome}"></button>`).join('');
        }
        function proxima() {
          let pal; do { pal = r.pick(cs); } while (pal === ultimaPal);
          ultimaPal = pal;
          tinta = r() < 0.15 ? pal : r.pick(cs.filter(c => c !== pal)); // às vezes bate, pra pegar quem chuta
          elPal.textContent = pal.nome; elPal.style.color = tinta.hex;
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
          const resta = Math.max(0, (fim - performance.now()) / 1000), s = Math.ceil(resta);
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
            elPts.textContent = pontos; CA.som('certo');
            elCombo.textContent = seguidos >= 5 ? seguidos + ' seguidos! 🔥' : '';
            if (MEXE) montarBotoes();
          } else {
            erros++; seguidos = 0; elCombo.textContent = '';
            fim -= MULTA * 1000; CA.som('errado'); CA.vibrar(80);
            tela.classList.remove('erro'); void tela.offsetWidth; tela.classList.add('erro');
          }
          proxima();
        });

        function terminar() {
          cancelAnimationFrame(raf);
          tinta = null;
          elPal.textContent = 'TEMPO!'; elPal.style.color = '#1f1f24';
          const est = pontos >= ALVO[2] ? 3 : pontos >= ALVO[1] ? 2 : pontos >= ALVO[0] ? 1 : 0;
          const melhorAntes = (jogo.prog()[n] || {}).p;
          const tent = est ? CA.salvarNivel('cor', n, { e: est, p: pontos }) : null;
          setTimeout(() => {
            if (!vivo) return;
            CA.resultadoNivel(palco, jogo, n, {
              titulo: est ? `Nível ${n}: tu acertou` : `Faltou pouco! Precisava de ${ALVO[0]}`,
              valorTxt: pontos + (pontos === 1 ? ' cor' : ' cores'),
              estrelas: est,
              detalhe: (tent ? (tent === 1 ? 'De primeira! ' : `Tentativa nº ${tent}. `) : '') + `${erros} ${erros === 1 ? 'erro' : 'erros'} · melhor sequência: ${melhorSeq}`,
              recordeTxt: melhorAntes != null ? Math.max(melhorAntes, pontos) + ' cores' : '',
              amigo: amigo != null ? { valorTxt: amigo + ' cores', ganhou: pontos > amigo } : null,
              desafio: {
                texto: `Acertei ${pontos} cores no nível ${n} do Fala a cor 🧠 Duvido tu não se enrolar!`,
                url: CA.linkDesafio('cor', { n, s: semente, v: pontos }),
              },
              card: { jogo: 'Fala a cor', linha1: `Nível ${n} · ${DURACAO} segundos`, valor: String(pontos), estrelas: est, linha3: 'Duvido tu não se enrolar!', cor: '#d62828',
                comoJoga: 'Toca na cor da tinta, não na palavra', tentativa: tent ? CA.naTentativa(tent) : '' },
              jogarDeNovo: () => jogar(CA.novaSemente()),
            });
          }, 900);
        }
      }
      return () => { vivo = false; cancelAnimationFrame(raf); };
    },
  };
})();
