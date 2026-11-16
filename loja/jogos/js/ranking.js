/* Ranking: geral (estrelas de todos os jogos, ou de um jogo com ?jogo=), desafio do dia e amigos.
   Rotas: #/ranking (geral), #/ranking?jogo=cor, #/ranking?aba=hoje, #/ranking?d=AAAA-MM-DD,
   #/ranking?aba=f1..f3 (tempo nos níveis grátis do Caça-números), #/ranking?aba=amigos,
   #/ranking?jogo=pegadinhas&n=N (acertos e tempo médio no nível N das Pegadinhas; n=0 = estrelas).
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

  // linha de tempo: 1º 🥇 @fulano ✓ ......... 12,3 s · 3ª tent.
  function linhaTempo(r) {
    return `<li class="lr ${r.eu ? 'eu' : ''}">${posTxt(r.pos)}<span class="nome">${nomeTxt(r)}${r.eu ? ' <small>(tu)</small>' : ''}</span>
      <span class="val"><b>${CA.fmtSeg(r.t)}</b>${r.tentativa ? `<small>${r.tentativa === 1 ? 'de primeira' : r.tentativa + 'ª tent.'}</small>` : ''}</span></li>`;
  }
  CA.linhaRanking = linhaTempo;

  // Pódio pequeno do início: top 3 de hoje
  CA.podioHoje = function (alvo) {
    ver('dia:' + CA.hojeBR()).then(d => {
      if (!alvo.isConnected) return;
      const top = d.top.slice(0, 3);
      alvo.innerHTML = `
        <div class="cab-ranking"><strong>Ranking de hoje</strong><span>${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</span></div>
        ${top.length ? `<ol class="lista-ranking">${top.map(linhaTempo).join('')}</ol>` : '<p class="vazio">Ninguém ainda. Joga o desafio e fica em 1º!</p>'}
        ${d.meu && d.meu.pos > 3 ? `<ol class="lista-ranking">${linhaTempo(d.meu)}</ol>` : ''}
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
            <a href="#/ranking?jogo=pegadinhas&n=0" class="${nPeg ? '' : 'ativa'}">★ Estrelas</a>
          </nav>` : ''}
          <div class="miolo"><p class="carregando">Carregando...</p></div>
          ${conta ? `<p class="nota">Tu aparece como <b>${esc(CA.nomeRanking())}</b> · <a href="#/conta">mudar</a></p>` : ''}
        </section>`);
      palco.appendChild(tela);
      tela.querySelectorAll('.chips .ativa').forEach(ch => ch.scrollIntoView({ inline: 'center', block: 'nearest' }));
      const miolo = tela.querySelector('.miolo');
      const entrar = txt => `<a class="chamada-conta" href="#/conta"><strong>Entra pra aparecer aqui</strong><span>${txt}</span></a>`;
      const falha = () => { if (vivo) miolo.innerHTML = '<p class="vazio">Sem internet agora. Tenta de novo daqui a pouco.</p>'; };

      const linhaEst = r => `<li class="lr ${r.eu ? 'eu' : ''}">${posTxt(r.pos)}<span class="nome">${nomeTxt(r)}${r.eu ? ' <small>(tu)</small>' : ''}</span>
        <span class="val"><b>${r.estrelas} ★</b><small>${r.niveis} ${r.niveis === 1 ? 'nível' : 'níveis'}</small></span></li>`;

      if (nPeg) {
        ver('peg:' + nPeg).then(d => {
          if (!vivo) return;
          miolo.innerHTML = `
            <p class="sub-ranking">Pegadinhas · nível ${nPeg}: quem acertou mais das 10. Empatou, ganha o menor tempo médio · ${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</p>
            ${d.top.length ? `<ol class="lista-ranking">${d.top.map(CA.linhaPeg).join('')}</ol>` : '<p class="vazio">Ninguém jogou esse nível ainda. Bora ser o 1º?</p>'}
            ${d.meu && d.meu.pos > 10 ? `<p class="reticencias">···</p><ol class="lista-ranking">${CA.linhaPeg(d.meu)}</ol>` : ''}
            ${d.amigos.length > 1 ? `<h2 class="secao">Entre teus amigos</h2><ol class="lista-ranking">${d.amigos.map(CA.linhaPeg).join('')}</ol>` : ''}
            <a class="btn btn-grande" href="#/peg?n=${nPeg}">${d.meu ? 'Tentar melhorar' : 'Jogar o nível ' + nPeg}</a>
            ${conta ? '' : entrar('Só quem tem conta entra no ranking. É só o e-mail, sem senha.')}`;
        }).catch(falha);
      } else if (aba === 'geral') {
        const j = jogoSel && CA.jogo(jogoSel);
        CA.chamar('jogo-ranking', { acao: 'estrelas', jogo: jogoSel, token: conta && conta.token }).then(d => {
          if (!vivo) return;
          miolo.innerHTML = `
            <p class="sub-ranking">${j ? `${j.nome}: quem tem mais estrelas nos ${j.total} níveis` : 'Estrelas de todos os jogos somadas'} · ${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</p>
            ${d.top.length ? `<ol class="lista-ranking">${d.top.map(linhaEst).join('')}</ol>` : '<p class="vazio">Ninguém ainda. Bora ser o 1º?</p>'}
            ${d.meu && d.meu.pos > 10 ? `<p class="reticencias">···</p><ol class="lista-ranking">${linhaEst(d.meu)}</ol>` : ''}
            <a class="btn btn-grande" href="${j ? '#/jogo?id=' + j.id : '#/'}">${j ? 'Jogar ' + j.nome : 'Jogar pra subir'}</a>
            ${conta ? '' : entrar('Só quem tem conta entra no ranking. É só o e-mail, sem senha.')}`;
        }).catch(falha);
      } else if (aba !== 'amigos') {
        ver(numFase ? 'nivel:' + numFase : 'dia:' + data).then(d => {
          if (!vivo) return;
          const meuForaTop = d.meu && d.meu.pos > 10;
          miolo.innerHTML = `
            <p class="sub-ranking">${numFase ? `${CA.NOME_ACHA} · nível ${numFase} (${CA.FASES[numFase - 1].q} números) · melhor tempo de cada um` : data === CA.hojeBR() ? 'Desafio do dia: mesma grade pra todo mundo' : 'Desafio de ' + CA.fmtData(data)} · ${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</p>
            ${d.top.length ? `<ol class="lista-ranking">${d.top.map(linhaTempo).join('')}</ol>` : '<p class="vazio">Ninguém jogou ainda. Bora ser o 1º?</p>'}
            ${meuForaTop ? `<p class="reticencias">···</p><ol class="lista-ranking">${linhaTempo(d.meu)}</ol>` : ''}
            ${d.amigos.length > 1 ? `<h2 class="secao">Entre teus amigos</h2><ol class="lista-ranking">${d.amigos.map(linhaTempo).join('')}</ol>` : ''}
            <a class="btn btn-grande" href="${numFase ? '#/fase?f=' + numFase : '#/acha?d=1'}">${d.meu ? 'Tentar melhorar meu tempo' : numFase ? 'Jogar o nível ' + numFase : 'Jogar o desafio do dia'}</a>
            ${conta ? '' : entrar('Só quem tem conta entra no ranking. É só o e-mail, sem senha.')}`;
        }).catch(falha);
      } else {
        if (!conta) { miolo.innerHTML = entrar('Aí, cada amigo que abrir teu link de desafio entra na tua lista.'); return () => { vivo = false; }; }
        CA.chamar('jogo-ranking', { acao: 'amigos', token: conta.token }).then(d => {
          if (!vivo) return;
          const lista = d.amigos || [];
          miolo.innerHTML = `
            <p class="sub-ranking">Quem tem mais estrelas em todos os jogos</p>
            <ol class="lista-ranking">${lista.map(r => linhaEst({ ...r, niveis: r.niveis ?? r.fases })).join('')}</ol>
            ${lista.length < 2 ? '<p class="vazio">Ainda não tem amigo aqui. Manda teu link de desafio: quem abrir entra na tua lista.</p>' : ''}
            <a class="btn btn-grande" href="#/">Jogar pra subir</a>`;
        }).catch(falha);
      }
      return () => { vivo = false; };
    },
  };
})();
