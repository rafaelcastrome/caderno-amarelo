/* Os 66 Desafios divididos em jogos de níveis (cada nível = 1 desafio).
   As 17 pegadinhas (ids 40, 8, 30...) viraram o jogo Pegadinhas (pegadinhas.js), 1 em cada nível de 10 perguntas.
   Dados: ../assets/js/desafios-dados.js (window.DESAFIOS). Rota: #/charada?j=<jogo>&n=<nível>.
   Estrelas: 3 de primeira, 2 na 2ª, 1 na 3ª ou depois, 0 se pediu a resposta.
   Quem comprou os 66 Desafios avulso (antes do Premium) continua com todos os níveis liberados. */
(function () {
  'use strict';
  const CA = window.CA;
  const D = window.DESAFIOS || [];
  const porId = id => D.find(d => d.id === id);

  // 66 desafios em 4 jogos (as pegadinhas ficam no jogo Pegadinhas) (ids da lista original), do mais fácil pro mais difícil em cada jogo
  const GRUPOS = [
    { id: 'oque', nome: 'O que é, o que é?', icone: '🤔', cor: '#ea580c',
      desc: 'Adivinhas clássicas: parece difícil até tu sacar.',
      ids: [10, 46, 59, 53, 14, 1, 18, 22, 55, 61, 28, 51, 32, 63, 42] },
    { id: 'olho', nome: 'Olho atento', icone: '👀', cor: '#15803d',
      desc: 'Conta, compara e acha. Teu olho vai querer te enganar.',
      ids: [3, 13, 17, 39, 37, 5, 58, 21, 29, 27, 50, 47, 2, 48] },
    { id: 'proximo', nome: 'Qual o próximo?', icone: '🧩', cor: '#7c3aed',
      desc: 'Descobre a regra da sequência e completa.',
      ids: [54, 31, 7, 15, 41, 23, 45] },
    { id: 'emojis', nome: 'Emojis e espelhos', icone: '🪞', cor: '#0e7490',
      desc: 'Filme em emoji, palavra no espelho, relógio ao contrário.',
      ids: [11, 25, 52, 43, 56, 62, 33, 19, 35, 9, 60, 64, 66] },
  ];

  // comprou os 66 Desafios avulso? (no celular ou na conta)
  CA.comprou66 = () => {
    try { if (JSON.parse(localStorage.getItem('desafios:jogo') || '{}').isPremium) return true; } catch (e) {}
    return !!(CA.conta && CA.conta() && CA.conta().desafios);
  };

  // ---------- conferir resposta (igual ao jogo antigo) ----------
  const normalizar = txt => String(txt ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[º°ª]/g, 'o').replace(/[^a-z0-9: ]+/g, ' ').replace(/\s+/g, ' ').trim();
  function confere(d, tentativa) {
    const t = normalizar(tentativa);
    if (!t) return false;
    const junto = x => x.replace(/ /g, '');
    return [d.respostaCorreta, ...(d.aceitas || [])].some(r => { const n = normalizar(r); return n === t || junto(n) === junto(t); });
  }

  GRUPOS.forEach(g => CA.registrarJogo({
    id: g.id, nome: g.nome, icone: g.icone, cor: g.cor, desc: g.desc, total: g.ids.length,
    nomeNivel: n => 'Nível ' + n, href: n => `#/charada?j=${g.id}&n=${n}`,
    premiumExtra: CA.comprou66,
    liberado(n) { return n >= 1 && n <= g.ids.length && (n <= CA.NIVEIS_GRATIS || CA.ehPremium() || CA.comprou66()); }, // charada não precisa ir em ordem
  }));

  CA.jogos.charada = {
    nome: 'Desafio',
    iniciar(palco, p) {
      if (p.j === 'pegadinha') { location.replace('#/peg?n=' + (+p.n || 1)); return null; } // link antigo
      const g = GRUPOS.find(x => x.id === p.j), j = g && CA.jogo(g.id);
      const n = Math.max(1, Math.min(+p.n || 1, g ? g.ids.length : 1));
      const d = g && porId(g.ids[n - 1]);
      if (!g || !d) { location.hash = '#/'; return null; }
      if (!j.liberado(n)) {
        if (n > CA.NIVEIS_GRATIS && !j.acesso()) CA.telaNivelTrancado(palco, j, n);
        else location.hash = j.href(j.proximo());
        return null;
      }
      document.title = `${g.nome} · nível ${n}`;
      let erros = 0, feito = false;
      palco.innerHTML = '';
      const tela = CA.el(`
        <section class="tela-charada" style="--cor:${g.cor}">
          <div class="barra-topo"><a class="voltar" href="#/jogo?id=${g.id}" aria-label="Voltar pros níveis">‹</a>
            <span class="nivel-tag">${g.nome} · nível ${n} de ${g.ids.length}</span></div>
          <article class="desafio-card">
            <h1>${d.titulo}</h1>
            <p class="desafio-pergunta">${d.pergunta}</p>
            ${d.tipo === 'imagem' ? `<figure class="desafio-img">${d.imagem}</figure>` : ''}
            <form class="f-resposta" autocomplete="off">
              <label class="sr" for="resp">Tua resposta</label>
              <input id="resp" enterkeyhint="send" placeholder="Tua resposta" autocapitalize="none">
              <button class="btn" type="submit">Responder</button>
            </form>
            <p class="msg-erro" role="alert"></p>
            <button class="link-voltar ver-resp" type="button" hidden>Ver a resposta (sem estrelas)</button>
            <div class="revela" hidden></div>
          </article>
          <div class="pos-charada"></div>
          <h2 class="secao">Todos os jogos</h2>
          ${CA.cardsJogos(g.id)}
        </section>`);
      palco.appendChild(tela);
      const inp = tela.querySelector('#resp'), msg = tela.querySelector('.msg-erro'), card = tela.querySelector('.desafio-card');
      const verResp = tela.querySelector('.ver-resp');
      setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 300);

      tela.querySelector('.f-resposta').addEventListener('submit', e => {
        e.preventDefault();
        if (feito || !inp.value.trim()) return;
        if (confere(d, inp.value)) return acabou(erros === 0 ? 3 : erros === 1 ? 2 : 1);
        erros++;
        CA.som('errado'); CA.vibrar(80);
        inp.classList.remove('treme'); void inp.offsetWidth; inp.classList.add('treme');
        msg.textContent = ['Não é isso... pensa de novo!', 'Quase! Lê a pergunta com calma.', 'Ainda não. Olha de novo 👀'][Math.min(erros - 1, 2)];
        if (erros >= 2) verResp.hidden = false;
      });
      verResp.addEventListener('click', () => { if (!feito) acabou(0); });

      function acabou(estrelas) {
        feito = true;
        const tent = CA.salvarNivel(g.id, n, { e: estrelas });
        CA.som(estrelas ? 'recorde' : 'fim');
        card.classList.add('resolvido');
        tela.querySelector('.f-resposta').hidden = true; verResp.hidden = true; msg.textContent = '';
        const rv = tela.querySelector('.revela');
        rv.hidden = false;
        rv.innerHTML = `
          <p class="certo">${estrelas ? ['', 'Acertou!', 'Boa!', 'De primeira! 🔥'][estrelas] : 'A resposta era:'}</p>
          <p class="res-estrelas" aria-label="${estrelas} de 3 estrelas">${'<i class="cheia">★</i>'.repeat(estrelas)}${'<i>★</i>'.repeat(3 - estrelas)}</p>
          <p class="resposta-completa"><b>${d.respostaCorreta}</b></p>
          ${d.explicacao ? `<p class="explicacao">${d.explicacao}</p>` : ''}
          ${tent > 1 ? `<p class="pequeno">Tentativa nº ${tent} nesse nível.</p>` : ''}`;
        const prox = n < g.ids.length ? n + 1 : null;
        const livre = prox && (prox <= CA.NIVEIS_GRATIS || j.acesso());
        const pos = tela.querySelector('.pos-charada');
        pos.innerHTML = `
          <div class="acoes">
            ${prox ? `<a class="btn btn-grande ${livre ? '' : 'btn-ouro'}" href="${j.href(prox)}">${livre ? 'Próximo: nível ' + prox : 'Nível ' + prox + ' 🔒 Ver o que tem'}</a>`
                   : `<a class="btn btn-grande" href="#/">Zerou ${g.nome}! Joga outro</a>`}
            <button class="btn btn-grande btn-claro" data-a="desafiar">Desafiar um amigo</button>
            <a class="link-voltar" href="#/jogo?id=${g.id}">Ver todos os níveis</a>
          </div>
          <a class="podio res-ranking" hidden></a>`;
        pos.querySelector('[data-a=desafiar]').addEventListener('click', () =>
          CA.compartilhar(`${d.pergunta} 🤔 Acertei ${estrelas === 3 ? 'de primeira' : ''} no ${g.nome} do caRdeno Amarelo. Duvido tu acertar!`, CA.linkDesafio('charada', { j: g.id, n })));
        CA.caixaRankingEstrelas(pos.querySelector('.podio'), g.id, 'Ranking de ' + g.nome, '#/ranking?jogo=' + g.id);
        pos.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return null;
    },
  };
})();
