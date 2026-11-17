/* Ranking: geral (pontos de todos os jogos, ou a métrica de um jogo com ?jogo=: tempo, acertos...), desafio do dia e amigos.
   Rotas: #/ranking (geral), #/ranking?jogo=cor, #/ranking?aba=hoje, #/ranking?d=AAAA-MM-DD,
   #/ranking?aba=f1..f3 (tempo nos níveis grátis do Caça-números), #/ranking?aba=amigos,
   #/ranking?jogo=pegadinhas&n=N (acertos e tempo médio no nível N das Pegadinhas; n=0 = todos os níveis somados).
   Qualquer rota aceita &todos=1&p=N: ranking inteiro por páginas (sem isso, só o top 10 e a tua posição).
   Só aparece no ranking quem tem conta. O @ só aparece se a pessoa deixou, e ganha ✓
   quando foi confirmado pela direct do @Cardeno_Amarelo; só o @ confirmado vira link pro Instagram. */
(function () {
  'use strict';
  const CA = window.CA;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MEDALHA = ['🥇', '🥈', '🥉'];
  const posTxt = p => p <= 3 ? `<span class="medalha" aria-label="${p}º">${MEDALHA[p - 1]}</span>` : `<span class="pos">${p}º</span>`;
  const nomeTxt = r => CA.nomeRankingHtml(r);

  function ver(chave) {
    const c = CA.conta && CA.conta();
    return CA.chamar('jogo-ranking', { acao: 'ver', chave, token: c && c.token });
  }
  CA.verRanking = ver;
  // uma página do ranking por chave (desafio do dia, níveis): de = posição inicial (0 = 1º)
  function buscarVer(chave, de, qtd) {
    const c = CA.conta && CA.conta();
    return CA.chamar('jogo-ranking', { acao: 'ver', chave, token: c && c.token, de, qtd });
  }

  // linha de tempo: 1º 🥇 @fulano ✓ ......... 12,3 s · 3ª tent.
  function linhaTempo(r) {
    return `<li class="lr ${r.eu ? 'eu' : ''}">${posTxt(r.pos)}<span class="nome">${nomeTxt(r)}${r.eu ? ' <small>(tu)</small>' : ''}</span>
      <span class="val"><b>${CA.fmtSeg(r.t)}</b>${r.tentativa ? `<small>${r.tentativa === 1 ? 'de primeira' : r.tentativa + 'ª tent.'}</small>` : ''}</span></li>`;
  }
  CA.linhaRanking = linhaTempo;

  // ---------- Top 10 + "Ver todos" (Rafael, 17/11/2026) ----------
  // Todo ranking abre só com os 10 primeiros (e a tua posição, se tu tá fora deles).
  // "Ver todos" abre o ranking inteiro por páginas de 25, com "Ir pra minha posição".
  // O estado fica na URL (&todos=1&p=N), então voltar/recarregar cai na mesma página.
  const POR_PAGINA = 25;
  function listaComTodos(slot, o) {
    // o = { d: resposta com o top 10, linha(r), buscar(de, qtd) -> Promise<resposta>, todos, pag, vazio }
    let todos = !!o.todos, pag = Math.max(1, +o.pag || 1), total = o.d.total, meu = o.d.meu, pedido = 0;
    const cache = new Map();
    const paginas = () => Math.max(1, Math.ceil(total / POR_PAGINA));
    const lista = rows => `<ol class="lista-ranking chegou">${rows.map(o.linha).join('')}</ol>`;
    const pessoas = n => `${n} ${n === 1 ? 'pessoa' : 'pessoas'}`;
    function marcarUrl() {
      const [cam, q] = location.hash.split('?');
      const sp = new URLSearchParams(q || '');
      sp.delete('todos'); sp.delete('p');
      if (todos) { sp.set('todos', '1'); if (pag > 1) sp.set('p', pag); }
      const s = sp.toString();
      try { history.replaceState(history.state, '', cam + (s ? '?' + s : '')); } catch (e) { /* sem history */ }
    }
    function subir() {
      const r = slot.getBoundingClientRect();
      if (r.top < 0) slot.scrollIntoView({ block: 'start' });
    }
    function top10() {
      if (!o.d.top.length) { slot.innerHTML = o.vazio ? `<p class="vazio">${o.vazio}</p>` : ''; return; }
      slot.innerHTML = lista(o.d.top.slice(0, 10)) +
        (meu && meu.pos > 10 ? `<p class="reticencias">···</p>${lista([meu])}` : '') +
        (total > 10 ? `<button type="button" class="ver-todos mov-toque">Ver todos os ${total} <span aria-hidden="true">→</span></button>` : '');
      const b = slot.querySelector('.ver-todos');
      if (b) b.onclick = () => { todos = true; pag = 1; marcarUrl(); mostrarPagina(); };
    }
    function desenhar(rows) {
      const n = paginas();
      const naPagina = meu && rows.some(r => r.pos === meu.pos);
      slot.innerHTML = `
        <div class="pag-cab"><b>Todos · ${pessoas(total)}</b><button type="button" class="so-top mov-toque">Só o top 10</button></div>
        ${rows.length ? lista(rows) : '<p class="vazio">Essa página tá vazia.</p>'}
        ${meu && !naPagina ? `<button type="button" class="ir-meu mov-toque">Ir pra minha posição (${meu.pos}º)</button>` : ''}
        ${n > 1 ? `<nav class="paginas" aria-label="Páginas do ranking">
          <button type="button" class="pg-ant mov-toque" ${pag <= 1 ? 'disabled' : ''}>‹ Anterior</button>
          <span>Página <b>${pag}</b> de ${n}</span>
          <button type="button" class="pg-prox mov-toque" ${pag >= n ? 'disabled' : ''}>Próxima ›</button>
        </nav>` : ''}`;
      const ir = p => { pag = Math.max(1, Math.min(p, paginas())); marcarUrl(); mostrarPagina(true); };
      slot.querySelector('.so-top').onclick = () => { todos = false; pag = 1; marcarUrl(); top10(); subir(); };
      const a = slot.querySelector('.pg-ant'), pr = slot.querySelector('.pg-prox'), im = slot.querySelector('.ir-meu');
      if (a) a.onclick = () => ir(pag - 1);
      if (pr) pr.onclick = () => ir(pag + 1);
      if (im) im.onclick = () => ir(Math.ceil(meu.pos / POR_PAGINA));
    }
    function mostrarPagina(rolar) {
      const de = (pag - 1) * POR_PAGINA, meuPedido = ++pedido;
      if (cache.has(pag)) { desenhar(cache.get(pag)); if (rolar) subir(); return; }
      const ol = slot.querySelector('.lista-ranking');
      if (ol) ol.classList.add('esperando');
      else slot.innerHTML = '<p class="carregando">Carregando...</p>';
      o.buscar(de, POR_PAGINA).then(d => {
        if (meuPedido !== pedido || !slot.isConnected) return;
        total = d.total; if (d.meu) meu = d.meu;
        if (!d.top.length && pag > 1 && total) { pag = paginas(); marcarUrl(); return mostrarPagina(rolar); }
        cache.set(pag, d.top);
        desenhar(d.top); if (rolar) subir();
      }).catch(() => {
        if (meuPedido !== pedido || !slot.isConnected) return;
        slot.innerHTML = '<p class="vazio">Sem internet agora. Tenta de novo daqui a pouco.</p>';
      });
    }
    if (todos && total > 0) mostrarPagina(); else { todos = false; top10(); }
  }
  CA.listaComTodos = listaComTodos;

  // Pódio pequeno do início: top 3 de hoje
  CA.podioHoje = function (alvo) {
    ver(CA.chaveDia(CA.hojeBR())).then(d => {
      if (!alvo.isConnected) return;
      const top = d.top.slice(0, 3);
      alvo.innerHTML = `
        <div class="cab-ranking"><strong>Ranking de hoje</strong><span>${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</span></div>
        ${top.length ? `<ol class="lista-ranking">${top.map(CA.linhaDia).join('')}</ol>` : '<p class="vazio">Ninguém ainda. Joga o desafio e fica em 1º!</p>'}
        ${d.meu && d.meu.pos > 3 ? `<ol class="lista-ranking">${CA.linhaDia(d.meu)}</ol>` : ''}
        <span class="ver-mais">Ver ranking completo e dos amigos →</span>`;
      alvo.hidden = false;
    }).catch(() => { alvo.hidden = true; });
  };

  CA.jogos.ranking = {
    nome: 'Ranking',
    iniciar(palco, p) {
      let vivo = true;
      // abas: geral (estrelas), hoje (desafio do dia) e amigos. Os níveis grátis do Acha abrem pelo resultado do nível.
      const GR = CA.FASES_GRATIS || 3;
      const fasesAbas = Array.from({ length: GR }, (_, i) => 'f' + (i + 1));
      const data = /^\d{4}-\d{2}-\d{2}$/.test(p.d || '') ? p.d : CA.hojeBR();
      const aba = p.aba === 'amigos' || p.aba === 'hoje' || fasesAbas.includes(p.aba) ? p.aba : p.d ? 'hoje' : 'geral';
      const numFase = /^f\d$/.test(aba) ? +aba.slice(1) : 0;
      const jogoSel = aba === 'geral' && CA.jogo(p.jogo) ? p.jogo : null;
      // Pegadinhas: ranking de cada nível (acertos e tempo médio). n=0 mostra as estrelas.
      const peg = jogoSel === 'pegadinhas' && CA.jogo('pegadinhas');
      const feitosPeg = peg ? Object.keys(peg.prog()).map(Number) : [];
      const nPeg = !peg ? 0 : p.n === '0' ? 0 : Math.max(1, Math.min(+p.n || (feitosPeg.length ? Math.max(...feitosPeg) : 1), peg.total));
      const conta = CA.conta && CA.conta();
      palco.innerHTML = '';
      const tela = CA.el(`
        <section class="intro ranking">
          <a class="voltar" href="${jogoSel ? '#/jogo?id=' + jogoSel : '#/'}" aria-label="Voltar">‹</a>
          <h1>Ranking</h1>
          <nav class="abas" aria-label="Rankings" style="--k:3">
            <a href="#/ranking" class="${aba === 'geral' ? 'ativa' : ''}">Geral</a>
            <a href="#/ranking?aba=hoje" class="${aba === 'hoje' || numFase ? 'ativa' : ''}">Desafio do dia</a>
            <a href="#/ranking?aba=amigos" class="${aba === 'amigos' ? 'ativa' : ''}">Amigos</a>
          </nav>
          ${aba === 'geral' ? `<nav class="chips" aria-label="Escolher jogo">
            <a href="#/ranking" class="${jogoSel ? '' : 'ativa'}">Todos</a>
            ${CA.JOGOS.map(j => `<a href="#/ranking?jogo=${j.id}" class="${jogoSel === j.id ? 'ativa' : ''}">${j.icone} ${j.nome}</a>`).join('')}
          </nav>` : ''}
          ${peg ? `<nav class="chips chips-nivel" aria-label="Escolher nível">
            ${Array.from({ length: peg.total }, (_, i) => `<a href="#/ranking?jogo=pegadinhas&n=${i + 1}" class="${nPeg === i + 1 ? 'ativa' : ''}">Nível ${i + 1}</a>`).join('')}
            <a href="#/ranking?jogo=pegadinhas&n=0" class="${nPeg ? '' : 'ativa'}">Todos os níveis</a>
          </nav>` : ''}
          <div class="miolo"><p class="carregando">Carregando...</p></div>
          ${conta ? `<p class="nota">Tu aparece como <b>${esc(CA.nomeRanking())}</b> · <a href="#/conta">mudar</a></p>` : ''}
        </section>`);
      palco.appendChild(tela);
      tela.querySelectorAll('.chips .ativa').forEach(ch => ch.scrollIntoView({ inline: 'center', block: 'nearest' }));
      const miolo = tela.querySelector('.miolo');
      const entrar = txt => `<a class="chamada-conta" href="#/conta"><strong>Entra pra aparecer aqui</strong><span>${txt}</span></a>`;
      const falha = () => { if (vivo) miolo.innerHTML = '<p class="vazio">Sem internet agora. Tenta de novo daqui a pouco.</p>'; };

      const linhaEst = (r, id) => CA.linhaRankingJogo(r, id || null);

      if (nPeg) {
        ver('peg:' + nPeg).then(d => {
          if (!vivo) return;
          miolo.innerHTML = `
            <p class="sub-ranking">Pegadinhas · nível ${nPeg}: quem acertou mais das 10. Empatou, ganha o menor tempo médio · ${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</p>
            <div class="lista-todos"></div>
            ${d.amigos.length > 1 ? `<h2 class="secao">Entre teus amigos</h2><ol class="lista-ranking">${d.amigos.map(CA.linhaPeg).join('')}</ol>` : ''}
            <a class="btn btn-grande" href="#/peg?n=${nPeg}">${d.meu ? 'Tentar melhorar' : 'Jogar o nível ' + nPeg}</a>
            ${conta ? '' : entrar('Só quem tem conta entra no ranking. É só o e-mail, sem senha.')}`;
          listaComTodos(miolo.querySelector('.lista-todos'), { d, linha: CA.linhaPeg, buscar: (de, qtd) => buscarVer('peg:' + nPeg, de, qtd), todos: p.todos, pag: p.p, vazio: 'Ninguém jogou esse nível ainda. Bora ser o 1º?' });
        }).catch(falha);
      } else if (aba === 'geral') {
        const j = jogoSel && CA.jogo(jogoSel);
        CA.chamar('jogo-ranking', { acao: 'estrelas', jogo: jogoSel, token: conta && conta.token }).then(d => {
          if (!vivo) return;
          miolo.innerHTML = `
            <p class="sub-ranking">${j ? j.nome + ': ' + CA.regraRanking(jogoSel).replace(/^./, c => c.toLowerCase()) : CA.regraRanking(null)} · ${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</p>
            <div class="lista-todos"></div>
            <a class="btn btn-grande" href="${j ? '#/jogo?id=' + j.id : '#/'}">${j ? 'Jogar ' + j.nome : 'Jogar pra subir'}</a>
            ${conta ? '' : entrar('Só quem tem conta entra no ranking. É só o e-mail, sem senha.')}`;
          listaComTodos(miolo.querySelector('.lista-todos'), {
            d, linha: r => linhaEst(r, jogoSel), todos: p.todos, pag: p.p, vazio: 'Ninguém ainda. Bora ser o 1º?',
            buscar: (de, qtd) => CA.chamar('jogo-ranking', { acao: 'estrelas', jogo: jogoSel, token: conta && conta.token, de, qtd }),
          });
        }).catch(falha);
      } else if (aba !== 'amigos') {
        const lin = numFase ? linhaTempo : CA.linhaDia, jd = !numFase && CA.jogo(CA.jogoDoDia(data));
        ver(numFase ? 'nivel:' + numFase : CA.chaveDia(data)).then(d => {
          if (!vivo) return;
          miolo.innerHTML = `
            <p class="sub-ranking">${numFase ? `${CA.NOME_ACHA} · nível ${numFase} (${CA.FASES[numFase - 1].q} números) · melhor tempo de cada um` : (data === CA.hojeBR() ? 'Desafio de hoje' : 'Desafio de ' + CA.fmtData(data)) + `: ${jd.icone} ${jd.nome}, níveis 1 a 3 · ${CA.regraDia(data)}`} · ${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</p>
            <div class="lista-todos"></div>
            ${d.amigos.length > 1 ? `<h2 class="secao">Entre teus amigos</h2><ol class="lista-ranking">${d.amigos.map(lin).join('')}</ol>` : ''}
            <a class="btn btn-grande" href="${numFase ? '#/fase?f=' + numFase : '#/dia?d=' + (data === CA.hojeBR() ? '1' : data)}">${d.meu ? (numFase ? 'Tentar melhorar meu tempo' : 'Tentar melhorar') : numFase ? 'Jogar o nível ' + numFase : 'Jogar o desafio do dia'}</a>
            ${conta ? '' : entrar('Só quem tem conta entra no ranking. É só o e-mail, sem senha.')}`;
          const chave = numFase ? 'nivel:' + numFase : CA.chaveDia(data);
          listaComTodos(miolo.querySelector('.lista-todos'), { d, linha: lin, buscar: (de, qtd) => buscarVer(chave, de, qtd), todos: p.todos, pag: p.p, vazio: 'Ninguém jogou ainda. Bora ser o 1º?' });
        }).catch(falha);
      } else {
        if (!conta) { miolo.innerHTML = entrar('Aí, cada amigo que abrir teu link de desafio entra na tua lista.'); return () => { vivo = false; }; }
        CA.chamar('jogo-ranking', { acao: 'amigos', token: conta.token }).then(d => {
          if (!vivo) return;
          const lista = d.amigos || [];
          miolo.innerHTML = `
            <p class="sub-ranking">${CA.regraRanking(null)}</p>
            <div class="lista-todos"></div>
            ${lista.length < 2 ? '<p class="vazio">Ainda não tem amigo aqui. Manda teu link de desafio: quem abrir entra na tua lista.</p>' : ''}
            <a class="btn btn-grande" href="#/">Jogar pra subir</a>`;
          // a lista de amigos já vem inteira: as páginas são cortadas aqui mesmo
          const pg = (de, qtd) => ({ total: lista.length, top: lista.slice(de, de + qtd), meu: lista.find(r => r.eu) || null });
          listaComTodos(miolo.querySelector('.lista-todos'), {
            d: pg(0, 10), linha: r => linhaEst({ ...r, niveis: r.niveis ?? r.fases }), todos: p.todos, pag: p.p, vazio: '',
            buscar: (de, qtd) => Promise.resolve(pg(de, qtd)),
          });
        }).catch(falha);
      }
      return () => { vivo = false; };
    },
  };
})();
