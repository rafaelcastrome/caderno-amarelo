/* Ranking: desafio do dia (mesma grade pra todo mundo) e ranking dos amigos.
   Rotas: #/ranking (hoje), #/ranking?aba=amigos, #/ranking?d=AAAA-MM-DD.
   Só aparece no ranking quem tem conta. O @ só aparece se a pessoa deixou, e ganha ✓
   quando foi confirmado pela direct do @Cardeno_Amarelo. */
(function () {
  'use strict';
  const CA = window.CA;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MEDALHA = ['🥇', '🥈', '🥉'];
  const posTxt = p => p <= 3 ? `<span class="medalha" aria-label="${p}º">${MEDALHA[p - 1]}</span>` : `<span class="pos">${p}º</span>`;
  const nomeTxt = r => `${esc(r.nome)}${r.ok ? ' <i class="ok" aria-label="@ confirmado">✓</i>' : ''}`;

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
      const aba = p.aba === 'amigos' ? 'amigos' : 'hoje';
      const data = /^\d{4}-\d{2}-\d{2}$/.test(p.d || '') ? p.d : CA.hojeBR();
      const conta = CA.conta && CA.conta();
      palco.innerHTML = '';
      const tela = CA.el(`
        <section class="intro ranking">
          <a class="voltar" href="#/" aria-label="Voltar">‹</a>
          <h1>Ranking</h1>
          <nav class="abas" aria-label="Rankings">
            <a href="#/ranking" class="${aba === 'hoje' ? 'ativa' : ''}">Desafio de hoje</a>
            <a href="#/ranking?aba=amigos" class="${aba === 'amigos' ? 'ativa' : ''}">Amigos</a>
          </nav>
          <div class="miolo"><p class="carregando">Carregando...</p></div>
          ${conta ? `<p class="nota">Tu aparece como <b>${esc(CA.nomeRanking())}</b> · <a href="#/conta">mudar</a></p>` : ''}
        </section>`);
      palco.appendChild(tela);
      const miolo = tela.querySelector('.miolo');
      const entrar = txt => `<a class="chamada-conta" href="#/conta"><strong>Entra pra aparecer aqui</strong><span>${txt}</span></a>`;
      const falha = () => { if (vivo) miolo.innerHTML = '<p class="vazio">Sem internet agora. Tenta de novo daqui a pouco.</p>'; };

      if (aba === 'hoje') {
        ver('dia:' + data).then(d => {
          if (!vivo) return;
          const meuForaTop = d.meu && d.meu.pos > 10;
          miolo.innerHTML = `
            <p class="sub-ranking">${data === CA.hojeBR() ? 'Mesma grade pra todo mundo hoje' : 'Desafio de ' + CA.fmtData(data)} · ${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</p>
            ${d.top.length ? `<ol class="lista-ranking">${d.top.map(linhaTempo).join('')}</ol>` : '<p class="vazio">Ninguém jogou ainda. Bora ser o 1º?</p>'}
            ${meuForaTop ? `<p class="reticencias">···</p><ol class="lista-ranking">${linhaTempo(d.meu)}</ol>` : ''}
            ${d.amigos.length > 1 ? `<h2 class="secao">Entre teus amigos</h2><ol class="lista-ranking">${d.amigos.map(linhaTempo).join('')}</ol>` : ''}
            <a class="btn btn-grande" href="#/acha?d=1">${d.meu ? 'Tentar melhorar meu tempo' : 'Jogar o desafio do dia'}</a>
            ${conta ? '' : entrar('Só quem tem conta entra no ranking. É só o e-mail, sem senha.')}`;
        }).catch(falha);
      } else {
        if (!conta) { miolo.innerHTML = entrar('Aí, cada amigo que abrir teu link de desafio entra na tua lista.'); return () => { vivo = false; }; }
        CA.chamar('jogo-ranking', { acao: 'amigos', token: conta.token }).then(d => {
          if (!vivo) return;
          const lista = d.amigos || [];
          miolo.innerHTML = `
            <p class="sub-ranking">Quem tem mais estrelas nas fases</p>
            <ol class="lista-ranking">${lista.map(r => `<li class="lr ${r.eu ? 'eu' : ''}">${posTxt(r.pos)}<span class="nome">${nomeTxt(r)}${r.eu ? ' <small>(tu)</small>' : ''}</span>
              <span class="val"><b>${r.estrelas} ★</b><small>${r.fases} ${r.fases === 1 ? 'fase' : 'fases'}</small></span></li>`).join('')}</ol>
            ${lista.length < 2 ? '<p class="vazio">Ainda não tem amigo aqui. Manda teu link de desafio: quem abrir entra na tua lista.</p>' : ''}
            <a class="btn btn-grande" href="#/fase?f=${CA.proximaFase()}">Jogar pra subir</a>`;
        }).catch(falha);
      }
      return () => { vivo = false; };
    },
  };
})();
