/* Pegadinhas: 17 níveis, 10 perguntas de lógica feitas pra enganar em cada um (dados em pegadinhas-dados.js).
   Rota: #/peg?n=<nível>  (duelo: &s=semente&v=acertos&m=tempo médio do amigo)
   Cada pergunta tem 3 opções e 30 segundos. Conta o número de acertos e o tempo médio de resposta.
   Estrelas: ★ 6 acertos, ★★ 8, ★★★ 10 (precisa de 6 pra liberar o próximo nível).
   Ranking de cada nível (chave 'peg:N'): mais acertos primeiro; empatou, ganha o menor tempo médio.
   Quem comprou os 66 Desafios avulso continua com todos os níveis (as pegadinhas antigas estão aqui dentro). */
(function () {
  'use strict';
  const CA = window.CA;
  const P = window.PEGADINHAS || [];
  const ID = 'pegadinhas', COR = '#d62828';
  const SEG = 30, QTD = 10, ALVO = [6, 8, 10];
  const estDe = a => a >= ALVO[2] ? 3 : a >= ALVO[1] ? 2 : a >= ALVO[0] ? 1 : 0;
  const fmtMedia = m => CA.fmtSeg(Number(m) || 0);
  const acertosTxt = a => `${a} de ${QTD}`;

  const jogo = CA.registrarJogo({
    id: ID, nome: 'Pegadinhas', icone: '😜', cor: COR, total: P.length,
    desc: 'Perguntas de lógica feitas pra te enganar. 10 por nível. Pensa antes!',
    href: n => '#/peg?n=' + n,
    premiumExtra: () => !!(CA.comprou66 && CA.comprou66()),
    caixaRanking: (alvo, n, card) => caixaNivel(alvo, n || null, card),
  });

  // ---------- ranking de um nível: acertos e tempo médio ----------
  CA.linhaPeg = r => `<li class="lr ${r.eu ? 'eu' : ''}">${r.pos <= 3 ? `<span class="medalha">${['🥇', '🥈', '🥉'][r.pos - 1]}</span>` : `<span class="pos">${r.pos}º</span>`}
    <span class="nome">${CA.nomeRankingHtml(r)}${r.eu ? ' <small>(tu)</small>' : ''}</span>
    <span class="val"><b>${r.acertos}/${QTD} ✓</b><small>${fmtMedia(r.t)} por pergunta</small></span></li>`;

  let envio = Promise.resolve();
  function caixaNivel(alvo, nIni, card) {
    if (!CA.verRanking) return;
    const feitos = Object.keys(jogo.prog()).map(Number);
    let n = nIni || (feitos.length ? Math.max(...feitos) : 1);
    const desenhar = () => {
      alvo.innerHTML = `
        <div class="cab-ranking"><strong>Ranking das Pegadinhas</strong><span class="rk-total"></span></div>
        <nav class="chips chips-nivel" aria-label="Escolher nível">${P.map((_, i) => `<button type="button" data-n="${i + 1}" class="${i + 1 === n ? 'ativa' : ''}">Nível ${i + 1}</button>`).join('')}</nav>
        <p class="sub-ranking">Nível ${n}: quem acertou mais. Empatou, ganha quem respondeu mais rápido.</p>
        <div class="rk-lista"><p class="vazio">Carregando...</p></div>
        <a class="ver-mais" href="#/ranking?jogo=${ID}&n=${n}">Ver ranking completo →</a>`;
      const at = alvo.querySelector('.chips-nivel .ativa');
      if (at) at.scrollIntoView({ inline: 'center', block: 'nearest' });
      const pedido = n;
      envio.then(() => CA.verRanking('peg:' + n)).then(d => {
        if (!alvo.isConnected || pedido !== n) return;
        if (card && d.meu) { card.ranking = { pos: d.meu.pos, txt: 'NO RANKING' }; card = null; }
        alvo.querySelector('.rk-total').textContent = `${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}`;
        alvo.querySelector('.rk-lista').innerHTML = `
          ${d.top.length ? `<ol class="lista-ranking">${d.top.slice(0, 5).map(CA.linhaPeg).join('')}</ol>` : '<p class="vazio">Ninguém jogou esse nível ainda. Bora ser o 1º?</p>'}
          ${d.meu && d.meu.pos > 5 ? `<ol class="lista-ranking">${CA.linhaPeg(d.meu)}</ol>` : ''}
          ${CA.conta && CA.conta() ? '' : '<p class="vazio">Entra com teu e-mail pra aparecer aqui.</p>'}`;
      }).catch(() => { if (alvo.isConnected) alvo.querySelector('.rk-lista').innerHTML = '<p class="vazio">Sem internet agora.</p>'; });
    };
    // a caixa é um link nas outras telas: aqui ela vira um bloco com os botões de nível
    if (alvo.tagName === 'A') {
      const div = document.createElement('div');
      div.className = alvo.className;
      alvo.replaceWith(div);
      alvo = div;
    }
    alvo.hidden = false;
    alvo.addEventListener('click', e => {
      const b = e.target.closest('[data-n]');
      if (!b) return;
      n = +b.dataset.n;
      desenhar();
    });
    desenhar();
  }

  CA.jogos.peg = {
    nome: 'Pegadinhas',
    iniciar(palco, p) {
      let vivo = true, raf = 0;
      const n = Math.max(1, Math.min(+p.n || jogo.proximo(), P.length));
      const amigo = p.v != null ? { a: parseInt(p.v, 10) || 0, m: parseFloat(p.m) || null } : null;
      const deAmigo = p.s != null;
      if (!jogo.liberado(n) && !(deAmigo && n <= CA.NIVEIS_GRATIS)) {
        if (n > CA.NIVEIS_GRATIS && !jogo.acesso()) CA.telaNivelTrancado(palco, jogo, n);
        else location.hash = jogo.href(jogo.proximo());
        return null;
      }
      if (deAmigo) jogar(+p.s >>> 0); else intro();

      function intro() {
        const meu = jogo.prog()[n];
        palco.innerHTML = '';
        palco.appendChild(CA.el(`
          <section class="intro" style="--cor:${COR}">
            <a class="voltar" href="#/jogo?id=${ID}" aria-label="Voltar">‹</a>
            <span class="nivel-tag">Pegadinhas · nível ${n} de ${P.length}</span>
            <h1>Pegadinhas</h1>
            <p>São <b>${QTD} perguntas</b> feitas pra te enganar. Cada uma tem 3 respostas e só uma tá certa. Lê com calma... mas não muito!</p>
            <ul class="regras-nivel">
              <li><b>${SEG} segundos</b> por pergunta</li>
              <li>No ranking vale quem acerta mais. Empatou, ganha o menor tempo médio</li>
              <li>★ ${ALVO[0]} acertos · ★★ ${ALVO[1]} · ★★★ ${ALVO[2]}</li>
              ${meu && meu.a != null ? `<li>Teu melhor: <b>${acertosTxt(meu.a)}</b> · ${fmtMedia(meu.m)} por pergunta</li>` : ''}
            </ul>
            <button class="btn btn-grande" data-a="ir">Começar o nível ${n}</button>
          </section>`));
        palco.querySelector('[data-a=ir]').addEventListener('click', () => jogar(CA.novaSemente()));
      }

      async function jogar(semente) {
        const r = CA.rng(semente);
        const perguntas = r.shuffle(P[n - 1]).map(([q, certa, erradas, x]) => ({ q, certa, x, opcoes: r.shuffle([certa, ...erradas]) }));
        palco.innerHTML = '';
        const tela = CA.el(`
          <section class="jogo jogo-peg" style="--cor:${COR}">
            <div class="barra">
              <a class="voltar" href="#/jogo?id=${ID}" aria-label="Sair">‹</a>
              <div class="pontos"><b>0</b> ✓</div>
              <div class="relogio">${SEG} s</div>
            </div>
            <div class="tempo"><i></i></div>
            <ol class="peg-bolinhas" aria-hidden="true">${perguntas.map(() => '<li></li>').join('')}</ol>
            <p class="meta-amigo">${amigo ? `Teu amigo acertou <b>${acertosTxt(amigo.a)}</b>${amigo.m ? ` (${fmtMedia(amigo.m)} por pergunta)` : ''}. Bate ele!` : `Nível ${n}: acerta ${ALVO[0]} pra passar`}</p>
            <div class="cartao-pergunta peg-cartao"><span class="peg-num"></span><p class="peg-q">...</p></div>
            <div class="peg-opcoes"></div>
            <div class="peg-explica" hidden><p></p><button class="btn btn-grande" type="button">Próxima</button></div>
          </section>`);
        palco.appendChild(tela);
        const elQ = tela.querySelector('.peg-q'), elNum = tela.querySelector('.peg-num'), elCartao = tela.querySelector('.peg-cartao');
        const elOps = tela.querySelector('.peg-opcoes'), elExp = tela.querySelector('.peg-explica');
        const elPts = tela.querySelector('.pontos b'), elRel = tela.querySelector('.relogio'), elBarra = tela.querySelector('.tempo i');
        const bolinhas = [...tela.querySelectorAll('.peg-bolinhas li')];

        let k = -1, acertos = 0, tempos = [], inicio = 0, aberta = false;
        await CA.contagem(tela);
        if (!vivo) return;
        proxima();

        function proxima() {
          k++;
          if (k >= perguntas.length) return terminar();
          const pq = perguntas[k];
          elNum.textContent = `Pergunta ${k + 1} de ${QTD}`;
          elQ.textContent = pq.q;
          elQ.classList.toggle('longa', pq.q.length > 110);
          bolinhas.forEach((b, i) => b.classList.toggle('agora', i === k));
          elCartao.removeAttribute('data-fx');
          elCartao.classList.remove('entra'); void elCartao.offsetWidth; elCartao.classList.add('entra');
          elOps.innerHTML = pq.opcoes.map((o, i) => `<button class="peg-op" type="button" data-i="${i}"><b>${'ABC'[i]}</b><span></span></button>`).join('');
          elOps.querySelectorAll('.peg-op span').forEach((s, i) => { s.textContent = pq.opcoes[i]; });
          elExp.hidden = true;
          aberta = true;
          inicio = performance.now();
          let ultimoSeg = SEG;
          cancelAnimationFrame(raf);
          (function tick() {
            if (!vivo || !aberta) return;
            const passou = (performance.now() - inicio) / 1000, resta = Math.max(0, SEG - passou), s = Math.ceil(resta);
            elRel.textContent = s + ' s';
            elBarra.style.width = (resta / SEG * 100) + '%';
            if (s !== ultimoSeg) { ultimoSeg = s; if (s <= 5 && s > 0) CA.som('tique'); }
            if (resta <= 0) { responder(-1); return; }
            raf = requestAnimationFrame(tick);
          })();
        }

        function responder(i) {
          if (!aberta) return;
          aberta = false;
          cancelAnimationFrame(raf);
          const pq = perguntas[k];
          const t = Math.min(SEG, (performance.now() - inicio) / 1000);
          tempos.push(t);
          const certo = i >= 0 && pq.opcoes[i] === pq.certa;
          const botoes = [...elOps.querySelectorAll('.peg-op')];
          botoes.forEach((b, j) => {
            b.disabled = true;
            if (pq.opcoes[j] === pq.certa) b.classList.add('certa');
            else if (j === i) b.classList.add('errada');
          });
          if (certo) { acertos++; elPts.textContent = acertos; CA.som('certo'); elCartao.dataset.fx = 'certo'; }
          else {
            CA.som('errado'); CA.vibrar(80); elCartao.dataset.fx = 'errado';
            tela.classList.remove('erro'); void tela.offsetWidth; tela.classList.add('erro');
          }
          bolinhas[k].classList.remove('agora');
          bolinhas[k].classList.add(certo ? 'ok' : 'x');
          elExp.querySelector('p').innerHTML = `<b>${certo ? 'Acertou!' : i < 0 ? 'Acabou o tempo!' : 'Caiu na pegadinha!'}</b> ${esc(pq.x)}`;
          elExp.querySelector('button').textContent = k + 1 < QTD ? 'Próxima' : 'Ver meu resultado';
          elExp.hidden = false;
          elExp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        elOps.addEventListener('click', e => { const b = e.target.closest('.peg-op'); if (b) responder(+b.dataset.i); });
        elExp.querySelector('button').addEventListener('click', proxima);

        function terminar() {
          const media = Math.round(tempos.reduce((s, x) => s + x, 0) / tempos.length * 10) / 10;
          const est = estDe(acertos);
          const antes = jogo.prog()[n];
          // guarda o melhor: mais acertos, ou os mesmos acertos com tempo médio menor
          const pontos = acertos * 301 + (300 - Math.round(media * 10)); // cabe no limite de 9999 do servidor
          const tent = est ? CA.salvarNivel(ID, n, { e: est, p: pontos, a: acertos, m: media }) : null;
          envio = CA.enviarRecorde ? CA.enviarRecorde('peg:' + n, media, tent, { acertos }) : Promise.resolve();
          const melhor = antes && antes.a != null && (antes.a > acertos || (antes.a === acertos && antes.m <= media)) ? antes : null;
          const ganhou = amigo ? (acertos > amigo.a || (acertos === amigo.a && amigo.m != null && media < amigo.m)) : false;
          CA.resultadoNivel(palco, jogo, n, {
            titulo: est ? `Nível ${n}: tu acertou` : `Faltou pouco! Precisava de ${ALVO[0]}`,
            valorTxt: acertosTxt(acertos),
            estrelas: est,
            detalhe: `Tempo médio: ${fmtMedia(media)} por pergunta` + (tent ? (tent === 1 ? ' · de primeira!' : ` · tentativa nº ${tent}`) : ''),
            recordeTxt: melhor ? `${acertosTxt(melhor.a)} · ${fmtMedia(melhor.m)}` : '',
            amigo: amigo ? { valorTxt: acertosTxt(amigo.a) + (amigo.m ? ` em ${fmtMedia(amigo.m)}` : ''), ganhou } : null,
            desafio: {
              texto: `Acertei ${acertosTxt(acertos)} no nível ${n} das Pegadinhas 😜 Duvido tu não cair em nenhuma!`,
              url: CA.linkDesafio('peg', { n, s: semente, v: acertos, m: media }),
            },
            card: { jogo: 'Pegadinhas', linha1: `Nível ${n} · ${QTD} perguntas`, valor: acertosTxt(acertos), estrelas: est,
              linha3: `${fmtMedia(media)} por pergunta. Duvido tu!`, cor: COR,
              comoJoga: 'Perguntas de lógica feitas pra te enganar', tentativa: tent ? CA.naTentativa(tent) : '' },
            jogarDeNovo: () => jogar(CA.novaSemente()),
          });
        }
      }
      return () => { vivo = false; cancelAnimationFrame(raf); };
    },
  };

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
})();
