/* Jogos com níveis: lista de todos os jogos, progresso (estrelas) de cada nível e a tela de cada jogo.
   Regra de todo jogo: os 3 primeiros níveis são grátis, o resto é caRdeno Premium.
   Progresso de todos os jogos em 'niveis' (chaves "acha:1", "cor:1"...). Cada nível tem que ser mais difícil que o anterior.
   Rota: #/jogo?id=<jogo> (tela com os níveis, o ranking do jogo e os outros jogos). */
(function () {
  'use strict';
  const CA = window.CA;
  const GRATIS = 3;
  CA.NIVEIS_GRATIS = GRATIS;
  CA.JOGOS = [];

  // jogo = { id, nome, desc, icone, cor, total, nomeNivel(n), href(n), prog?(), liberado?(n), premiumExtra?(), caixaRanking?(alvo, n, card) }
  CA.registrarJogo = function (j) {
    const jogo = {
      prog: () => { const t = CA.ler('niveis', {}), o = {}; for (const k in t) if (k.startsWith(j.id + ':')) o[+k.split(':')[1]] = t[k]; return o; },
      ...j,
    };
    jogo.acesso = () => CA.ehPremium() || !!(jogo.premiumExtra && jogo.premiumExtra());
    jogo.liberado = j.liberado || (n => n >= 1 && n <= jogo.total && (n <= GRATIS || jogo.acesso()) && (n === 1 || !!jogo.prog()[n - 1]));
    jogo.estrelas = () => Object.values(jogo.prog()).reduce((s, x) => s + ((x && x.e) || 0), 0);
    jogo.feitos = () => Object.keys(jogo.prog()).length;
    jogo.proximo = () => { const p = jogo.prog(); for (let n = 1; n <= jogo.total; n++) if (!p[n]) return n; return jogo.total; };
    CA.JOGOS.push(jogo);
    return jogo;
  };
  CA.jogo = id => CA.JOGOS.find(j => j.id === id);

  // guarda o resultado de um nível (o melhor fica). valor: { e, t? (tempo, menor é melhor), p? (pontos, maior é melhor) }
  CA.salvarNivel = function (id, n, v) {
    const todos = CA.ler('niveis', {}), k = id + ':' + n, a = todos[k];
    const tent = ((a && a.n) || 0) + 1;
    const melhor = !a || (v.e > (a.e || 0)) || (v.p != null && v.p > (a.p ?? -1)) || (v.t != null && v.t < (a.t ?? 1e9));
    todos[k] = melhor ? { ...v, e: Math.max(v.e, (a && a.e) || 0), n: tent, r: tent } : { ...a, n: tent };
    CA.gravar('niveis', todos);
    if (CA.sincronizar) CA.sincronizar();
    return tent;
  };

  const estrelasTxt = e => '★'.repeat(e) + '☆'.repeat(3 - e);
  CA.estrelasTxt = estrelasTxt;

  // estrelas de todos os jogos somadas (ranking geral)
  CA.estrelasGerais = () => CA.JOGOS.reduce((s, j) => s + j.estrelas(), 0);

  // cards "Todos os jogos" (o atual aparece marcado)
  CA.cardsJogos = function (atualId) {
    return `<div class="lista-jogos">${CA.JOGOS.map(j => {
      const est = j.estrelas(), max = j.total * 3;
      return `<a class="card-jogo ${j.id === atualId ? 'atual' : ''}" href="#/jogo?id=${j.id}" style="--cor:${j.cor}">
        <span class="card-jogo-icone" aria-hidden="true">${j.icone}</span>
        <span class="card-jogo-txt"><strong>${j.nome}</strong><small>${j.desc}</small>
          <span class="card-jogo-prog"><i style="width:${Math.round(est / max * 100)}%"></i></span>
          <span class="card-jogo-rodape"><small class="card-jogo-est">${est} de ${max} ★ · ${j.total} níveis</small>
          <em>${j.id === atualId ? 'Tu tá aqui' : j.feitos() ? 'Continuar' : 'Jogar'}</em></span></span>
      </a>`;
    }).join('')}</div>`;
  };

  // grade de níveis de um jogo
  function grade(j) {
    const p = j.prog(), prox = j.proximo();
    return `<div class="grade-fases">${Array.from({ length: j.total }, (_, i) => {
      const n = i + 1, feito = p[n], livre = j.liberado(n);
      const cls = feito ? 'feita' : livre ? 'livre' : n > GRATIS && !j.acesso() ? 'premium' : 'trancada';
      const est = feito ? estrelasTxt(feito.e || 0) : cls === 'premium' ? '🔒' : cls === 'trancada' ? '·' : '';
      return `<a class="tile-fase ${cls} ${n === prox && !feito ? 'atual' : ''}" href="${j.href(n)}" aria-label="${j.nomeNivel ? j.nomeNivel(n) : 'Nível ' + n}"><b>${n}</b><small>${est}</small></a>`;
    }).join('')}</div>`;
  }

  // ---------- o que conta no ranking (16/11/2026: velocidade e acertos, não só estrelas) ----------
  // O servidor (jogo-ranking, _comum/pontos.ts) ordena; aqui só mostra o número que decidiu a posição.
  const CHARADA = id => ['oque', 'olho', 'proximo', 'emojis'].includes(id);
  const milhar = x => Math.round(x || 0).toLocaleString('pt-BR');
  const niveisTxt = n => `${n} ${n === 1 ? 'nível' : 'níveis'}`;
  // texto curto de "como funciona" embaixo do título do ranking
  CA.regraRanking = function (id) {
    if (id === 'acha') return 'Quem é mais rápido (teu tempo em cada nível comparado com o das 3 estrelas). Empatou, ganha quem fez mais níveis';
    if (id === 'cor' || id === 'rapido') return 'Quem somou mais acertos em todos os níveis';
    if (id === 'pegadinhas') return 'Quem somou mais acertos. Empatou, ganha quem respondeu mais rápido';
    if (CHARADA(id)) return 'Quem acertou mais, com menos erros. Empatou, ganha o mais rápido';
    return 'Pontos de todos os jogos: quanto mais rápido e mais acertos, mais pontos';
  };
  // valor da linha: o número grande (o que conta) e o detalhe pequeno embaixo
  CA.valorRanking = function (r, id) {
    const est = `${r.estrelas} ★`;
    if (r.pontos == null) return [est, niveisTxt(r.niveis)]; // resposta antiga do servidor
    if (id === 'acha') return [`${milhar(r.velocidade)} de velocidade`, `${niveisTxt(r.niveis)} · ${r.tempo ? CA.fmtSeg(r.tempo) + ' no total' : est}`];
    if (id === 'cor' || id === 'rapido') return [`${r.acertos} acertos`, `${niveisTxt(r.niveis)} · ${est}`];
    if (id === 'pegadinhas') return [`${r.acertos} acertos`, (r.media != null ? CA.fmtSeg(r.media) + ' por pergunta · ' : '') + niveisTxt(r.niveis)];
    if (CHARADA(id)) return [`${r.acertos} ${r.acertos === 1 ? 'acerto' : 'acertos'}`, est + (r.tempo ? ' · ' + CA.fmtSeg(r.tempo) : '')];
    return [`${milhar(r.pontos)} pts`, `${est} · ${niveisTxt(r.niveis)}`];
  };
  CA.linhaRankingJogo = function (r, id, curta) {
    const [grande, peq] = CA.valorRanking(r, id);
    return `<li class="lr ${r.eu ? 'eu' : ''}">${r.pos <= 3 ? `<span class="medalha">${['🥇', '🥈', '🥉'][r.pos - 1]}</span>` : `<span class="pos">${r.pos}º</span>`}
        <span class="nome">${CA.nomeRankingHtml(r)}${r.eu ? ' <small>(tu)</small>' : ''}</span>
        <span class="val"><b>${grande}</b>${curta ? '' : `<small>${peq}</small>`}</span></li>`;
  };

  // ranking de um jogo (ou geral, sem jogo), preenchido quando chega do servidor
  // compacto = versão curta do topo da página inicial: top 3 + a posição da pessoa, já com o espaço
  // reservado enquanto carrega (nada pula na tela quando o ranking chega).
  CA.caixaRankingEstrelas = function (alvo, jogoId, titulo, href, card, compacto) {
    if (!CA.chamar) return;
    const c = CA.conta && CA.conta();
    if (compacto) return rankingCompacto(alvo, jogoId, titulo, href, c);
    CA.chamar('jogo-ranking', { acao: 'estrelas', jogo: jogoId || null, token: c && c.token }).then(d => {
      if (card && d.meu) card.ranking = { pos: d.meu.pos, txt: 'NO RANKING' };
      if (!alvo.isConnected) return;
      const linha = r => CA.linhaRankingJogo(r, jogoId);
      alvo.innerHTML = `
        <div class="cab-ranking"><strong>${titulo}</strong><span>${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</span></div>
        <p class="sub-ranking regra-ranking">${CA.regraRanking(jogoId)}</p>
        ${d.top.length ? `<ol class="lista-ranking">${d.top.slice(0, 5).map(linha).join('')}</ol>` : '<p class="vazio">Ninguém ainda. Joga e fica em 1º!</p>'}
        ${d.meu && d.meu.pos > 5 ? `<ol class="lista-ranking">${linha(d.meu)}</ol>` : ''}
        ${c ? '' : '<p class="vazio">Entra com teu e-mail pra aparecer aqui.</p>'}
        ${href ? '<span class="ver-mais">Ver ranking completo →</span>' : ''}`;
      if (href) alvo.href = href;
      alvo.hidden = false;
    }).catch(() => { alvo.hidden = true; });
  };

  function rankingCompacto(alvo, jogoId, titulo, href, c) {
    const cab = total => `<div class="cab-ranking"><strong>🏆 ${titulo}</strong><span>${total}</span></div>`;
    const fantasma = '<li class="lr fantasma"><span></span><span></span><span></span></li>';
    alvo.classList.add('podio-mini');
    if (href) alvo.href = href;
    alvo.innerHTML = cab('&nbsp;') + `<ol class="lista-ranking">${fantasma.repeat(3)}</ol><span class="ver-mais">Ver ranking completo →</span>`;
    alvo.hidden = false;
    CA.chamar('jogo-ranking', { acao: 'estrelas', jogo: jogoId || null, token: c && c.token }).then(d => {
      if (!alvo.isConnected) return;
      const linha = r => CA.linhaRankingJogo(r, jogoId, true);
      const fim = d.meu && d.meu.pos > 3 ? `<li class="lr-sep" aria-hidden="true">⋯</li>${linha(d.meu)}`
        : !c ? '<li class="lr-dica">Entra com teu e-mail pra aparecer aqui.</li>' : '';
      alvo.innerHTML = cab(`${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}`) +
        `<ol class="lista-ranking chegou">${d.top.length ? d.top.slice(0, 3).map(linha).join('') : '<li class="lr-dica">Ninguém ainda. Joga e fica em 1º!</li>'}${fim}</ol>` +
        '<span class="ver-mais">Ver ranking completo →</span>';
    }).catch(() => { alvo.hidden = true; });
  }

  // ---------- tela de um jogo: #/jogo?id=x ----------
  CA.jogos.jogo = {
    nome: 'Jogo',
    iniciar(palco, p) {
      const j = CA.jogo(p.id);
      if (!j) { location.hash = '#/'; return null; }
      document.title = j.nome + ' · Jogos do caRdeno Amarelo';
      const prox = j.proximo(), p0 = j.prog();
      palco.innerHTML = '';
      palco.appendChild(CA.el(`
        <section class="tela-jogo" style="--cor:${j.cor}">
          <div class="barra-topo"><a class="voltar" href="#/" aria-label="Todos os jogos">‹</a><a class="som loja-btn" href="../loja.html">Loja</a></div>
          <div class="cab-jogo"><span class="card-jogo-icone" aria-hidden="true">${j.icone}</span>
            <div><h1>${j.nome}</h1><p>${j.desc}</p></div></div>
          ${j.extraTopo ? j.extraTopo() : ''}
          <a class="btn btn-grande btn-continuar" href="${j.href(prox)}">${Object.keys(p0).length ? 'Continuar: nível ' + prox : 'Começar pelo nível 1'}</a>
          <p class="placar-estrelas">${j.estrelas()} de ${j.total * 3} estrelas</p>
          <h2 class="secao">Níveis</h2>
          ${grade(j)}
          ${j.acesso() ? '' : `<p class="legenda-fases">Níveis 1 a ${GRATIS} grátis · 🔒 Premium</p>`}
          <a class="podio mov-aparece" hidden></a>
          ${j.acesso() ? '' : `<a class="chamada-premium" href="#/premium"><strong>Quer jogar até o fim?</strong><span>O ca<span class="r-marca">R</span>deno Premium libera todos os níveis de todos os jogos. Mensal R$ 4,90 ou anual R$ 29,90.</span></a>`}
          <h2 class="secao">Todos os jogos</h2>
          ${CA.cardsJogos(j.id)}
          ${j.extraFim ? j.extraFim() : ''}
        </section>`));
      if (j.caixaRanking) j.caixaRanking(palco.querySelector('.podio'));
      else CA.caixaRankingEstrelas(palco.querySelector('.podio'), j.id, 'Ranking de ' + j.nome, '#/ranking?jogo=' + j.id);
      return null;
    },
  };

  // Tela de nível trancado (Premium) de qualquer jogo
  CA.telaNivelTrancado = function (palco, j, n) {
    palco.innerHTML = '';
    palco.appendChild(CA.el(`
      <section class="intro trancada">
        <a class="voltar" href="#/jogo?id=${j.id}" aria-label="Voltar">‹</a>
        <span class="selo-premium">★ Premium</span>
        <h1>${j.nome}: nível ${n}</h1>
        <p>Os ${GRATIS} primeiros níveis são grátis. Daqui pra frente são mais <b>${j.total - GRATIS} níveis</b>, cada vez mais difíceis.</p>
        <a class="btn btn-grande" href="#/premium">Liberar todos os jogos · a partir de R$ 2,49/mês</a>
        <a class="link-voltar" href="#/jogo?id=${j.id}">Voltar pros níveis</a>
      </section>`));
  };

  // Resultado de um nível: usa a tela de resultado comum + ranking do jogo + todos os jogos embaixo
  CA.resultadoNivel = function (palco, j, n, r) {
    const prox = n < j.total ? n + 1 : null;
    const livre = prox && (prox <= GRATIS || j.acesso());
    palco.innerHTML = '';
    palco.appendChild(CA.resultado({
      ...r,
      proxima: prox ? (livre && r.estrelas
        ? { href: j.href(prox), txt: `Próximo: nível ${prox}` }
        : !livre ? { href: j.href(prox), txt: `Nível ${prox} 🔒 Ver o que tem`, tranca: true } : null) : { href: '#/', txt: 'Zerou! Joga outro jogo' },
      linkVoltar: { href: '#/jogo?id=' + j.id, txt: 'Ver todos os níveis' },
    }));
    const folha = palco.querySelector('.folha');
    const cx = CA.el('<a class="podio res-ranking mov-aparece" hidden></a>');
    folha.after(cx);
    setTimeout(() => j.caixaRanking ? j.caixaRanking(cx, n, r.card) : CA.caixaRankingEstrelas(cx, j.id, 'Ranking de ' + j.nome, '#/ranking?jogo=' + j.id, r.card), 1500); // espera o progresso subir pra conta
    palco.querySelector('.resultado').appendChild(CA.el(`<div class="outros-jogos"><h2 class="secao">Todos os jogos</h2>${CA.cardsJogos(j.id)}</div>`));
  };
})();
