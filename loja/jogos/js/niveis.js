/* Jogos com níveis: lista de todos os jogos, progresso (estrelas) de cada nível e a tela de cada jogo.
   Regra de todo jogo: os 3 primeiros níveis são grátis, o resto é caRdeno Premium.
   Progresso: Acha do 1 ao 25 fica em 'fases' (chaves "1".."30"); os outros em 'niveis' (chaves "cor:1").
   Rota: #/jogo?id=<jogo> (tela com os níveis, o ranking do jogo e os outros jogos). */
(function () {
  'use strict';
  const CA = window.CA;
  const GRATIS = 3;
  CA.NIVEIS_GRATIS = GRATIS;
  CA.JOGOS = [];

  // jogo = { id, nome, desc, icone, cor, total, nomeNivel(n), href(n), prog?(), liberado?(n), premiumExtra?() }
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

  // ranking de estrelas de um jogo (ou geral, sem jogo), preenchido quando chega do servidor
  CA.caixaRankingEstrelas = function (alvo, jogoId, titulo, href, card) {
    if (!CA.chamar) return;
    const c = CA.conta && CA.conta();
    CA.chamar('jogo-ranking', { acao: 'estrelas', jogo: jogoId || null, token: c && c.token }).then(d => {
      if (card && d.meu) card.ranking = { pos: d.meu.pos, txt: 'NO RANKING' };
      if (!alvo.isConnected) return;
      const linha = r => `<li class="lr ${r.eu ? 'eu' : ''}">${r.pos <= 3 ? `<span class="medalha">${['🥇', '🥈', '🥉'][r.pos - 1]}</span>` : `<span class="pos">${r.pos}º</span>`}
        <span class="nome">${String(r.nome).replace(/[<>&"]/g, '')}${r.ok ? ' <i class="ok" aria-label="@ confirmado">✓</i>' : ''}${r.eu ? ' <small>(tu)</small>' : ''}</span>
        <span class="val"><b>${r.estrelas} ★</b><small>${r.niveis} ${r.niveis === 1 ? 'nível' : 'níveis'}</small></span></li>`;
      alvo.innerHTML = `
        <div class="cab-ranking"><strong>${titulo}</strong><span>${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</span></div>
        ${d.top.length ? `<ol class="lista-ranking">${d.top.slice(0, 5).map(linha).join('')}</ol>` : '<p class="vazio">Ninguém ainda. Joga e fica em 1º!</p>'}
        ${d.meu && d.meu.pos > 5 ? `<ol class="lista-ranking">${linha(d.meu)}</ol>` : ''}
        ${c ? '' : '<p class="vazio">Entra com teu e-mail pra aparecer aqui.</p>'}
        ${href ? '<span class="ver-mais">Ver ranking completo →</span>' : ''}`;
      if (href) alvo.href = href;
      alvo.hidden = false;
    }).catch(() => { alvo.hidden = true; });
  };

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
          <a class="podio" hidden></a>
          ${j.acesso() ? '' : `<a class="chamada-premium" href="#/premium"><strong>Quer jogar até o fim?</strong><span>O caRdeno Premium libera todos os níveis de todos os jogos. Mensal R$ 4,90 ou anual R$ 29,90.</span></a>`}
          <h2 class="secao">Todos os jogos</h2>
          ${CA.cardsJogos(j.id)}
          ${j.extraFim ? j.extraFim() : ''}
        </section>`));
      CA.caixaRankingEstrelas(palco.querySelector('.podio'), j.id, 'Ranking de ' + j.nome, '#/ranking?jogo=' + j.id);
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
    const cx = CA.el('<a class="podio res-ranking" hidden></a>');
    folha.after(cx);
    setTimeout(() => CA.caixaRankingEstrelas(cx, j.id, 'Ranking de ' + j.nome, '#/ranking?jogo=' + j.id, r.card), 1500); // espera o progresso subir pra conta
    palco.querySelector('.resultado').appendChild(CA.el(`<div class="outros-jogos"><h2 class="secao">Todos os jogos</h2>${CA.cardsJogos(j.id)}</div>`));
  };
})();
