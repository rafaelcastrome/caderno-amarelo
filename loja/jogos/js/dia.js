/* Desafio do dia (Rafael, 16/11/2026): cada dia da semana é um jogo, e o desafio é jogar os
   níveis 1, 2 e 3 desse jogo em sequência, com a mesma semente pra todo mundo no dia.
   Depois do 3, quem quiser continuar vai pro nível 4 (Premium). O ranking do dia é um só,
   do jogo do dia: Caça-números = menor tempo somado; Fala a cor e Responde rápido = mais acertos somados.
   Pegadinhas e charadas ficam de fora: as perguntas são fixas, toda semana a galera já saberia a resposta.

   Rotas: #/dia?d=1 (hoje) | #/dia?d=AAAA-MM-DD (dia anterior, só Premium), &v=valor_do_amigo, &de=id_publico
   Ranking no servidor: chave 'jdia:AAAA-MM-DD' (t = tempo somado; acertos = acertos somados, quando o jogo conta acertos).
   As chaves antigas 'dia:...' eram do desafio antigo (1 ao 25 com regra sorteada) e não valem mais. */
(function () {
  'use strict';
  const CA = window.CA;
  const NIVEIS = 3;

  // domingo, segunda, terça, quarta, quinta, sexta, sábado
  const SEMANA = ['acha', 'acha', 'cor', 'rapido', 'acha', 'cor', 'rapido'];
  const NOME_DIA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const diaSemana = d => new Date((d || CA.hojeBR()) + 'T12:00:00Z').getUTCDay();
  CA.jogoDoDia = d => SEMANA[diaSemana(d)];
  CA.nomeDiaSemana = d => NOME_DIA[diaSemana(d)];
  CA.chaveDia = d => 'jdia:' + d;

  // como cada jogo entra no desafio
  const porIniciar = id => (palco, n, semente, ctx, onFim) =>
    CA.jogos[id].iniciar(palco, { n, s: semente, meta: ctx.titulo, voltar: ctx.voltar, onFim }) || (() => {});
  const MODOS = {
    acha: {
      metrica: 'tempo',
      como: 'Toca os números <b>em ordem</b>, o mais rápido que tu conseguir. Tocou errado, +1 segundo',
      regra: 'Ganha quem somar o <b>menor tempo</b> nos 3 níveis',
      nivelTxt: n => CA.acha.FASES[n - 1].q + ' números',
      jogar(palco, n, semente, ctx, onFim) {
        const f = CA.acha.FASES[n - 1];
        let ativo = true;
        const parar = CA.acha.jogar(palco, {
          fase: f, semente, titulo: ctx.titulo, voltar: ctx.voltar,
          onFim: (t, multa) => setTimeout(() => { if (ativo && ctx.vivo()) onFim({ t, multa, e: CA.acha.estrelasPor(f, t) }); }, 350),
        }, () => ativo && ctx.vivo());
        return () => { ativo = false; if (parar) parar(); };
      },
      salvar: (n, r) => CA.acha.salvarFase(n, r.t, r.e),
      txt: r => CA.fmtSeg(r.t),
    },
    cor: {
      metrica: 'acertos',
      como: 'Toca na cor da <b>tinta</b>, não na palavra. 30 segundos por nível, e cada nível tem mais cores',
      regra: 'Ganha quem somar <b>mais acertos</b> nos 3 níveis',
      nivelTxt: n => CA.NIV_COR[n - 1][0] + ' cores',
      jogar: porIniciar('cor'),
      salvar: (n, r) => { if (r.e) CA.salvarNivel('cor', n, { e: r.e, p: r.p }); },
      txt: r => r.p + (r.p === 1 ? ' acerto' : ' acertos'),
    },
    rapido: {
      metrica: 'acertos',
      como: 'Certo ou errado? Responde o mais rápido possível. 30 segundos por nível, e as contas vão ficando mais difíceis',
      regra: 'Ganha quem somar <b>mais acertos</b> nos 3 níveis',
      nivelTxt: n => CA.CONTEUDO_RAPIDO[n - 1],
      jogar: porIniciar('rapido'),
      salvar: (n, r) => { if (r.e) CA.salvarNivel('rapido', n, { e: r.e, p: r.p }); },
      txt: r => r.p + (r.p === 1 ? ' acerto' : ' acertos'),
    },
  };

  // total da rodada: tempo somado ou acertos somados
  const totalDe = (M, rs) => M.metrica === 'tempo'
    ? { t: Math.round(rs.reduce((s, r) => s + r.t, 0) * 10) / 10 }
    : { a: rs.reduce((s, r) => s + r.p, 0) };
  const totalTxt = (M, tot) => M.metrica === 'tempo' ? CA.fmtSeg(tot.t) : tot.a + (tot.a === 1 ? ' acerto' : ' acertos');
  const melhorQue = (M, x, y) => !y || (M.metrica === 'tempo' ? x.t < y.t : x.a > y.a);

  // linha do ranking do dia: tempo ou acertos
  CA.linhaDia = r => r.acertos == null ? CA.linhaRanking(r) : `<li class="lr ${r.eu ? 'eu' : ''}">${r.pos <= 3 ? `<span class="medalha">${['🥇', '🥈', '🥉'][r.pos - 1]}</span>` : `<span class="pos">${r.pos}º</span>`}
      <span class="nome">${CA.nomeRankingHtml(r)}${r.eu ? ' <small>(tu)</small>' : ''}</span>
      <span class="val"><b>${r.acertos} ${r.acertos === 1 ? 'acerto' : 'acertos'}</b>${r.tentativa ? `<small>${r.tentativa === 1 ? 'de primeira' : r.tentativa + 'ª tent.'}</small>` : ''}</span></li>`;
  CA.regraDia = d => MODOS[CA.jogoDoDia(d)].regra.replace(/<\/?b>/g, '');

  // a semana: qual jogo cai em cada dia (hoje marcado)
  CA.semanaDia = function (data) {
    const hoje = diaSemana(data);
    return `<ol class="semana-dia" aria-label="Jogo de cada dia da semana">${[1, 2, 3, 4, 5, 6, 0].map(i => {
      const j = CA.jogo(SEMANA[i]);
      return `<li class="${i === hoje ? 'hoje' : ''}" style="--cor:${j.cor}" title="${NOME_DIA[i]}: ${j.nome}"><small>${CURTO[i]}</small><span aria-hidden="true">${j.icone}</span></li>`;
    }).join('')}</ol>`;
  };

  // card do desafio de hoje (página inicial e tela do jogo do dia)
  CA.cardDia = function () {
    const hoje = CA.hojeBR(), j = CA.jogo(CA.jogoDoDia(hoje)), feito = CA.ler('dia:' + hoje, null);
    const meu = feito && feito.jogo === j.id ? feito : null;
    return `<a class="dia" href="#/dia?d=1" style="--cor:${j.cor}">
      <span class="dia-fita">Desafio de ${CA.nomeDiaSemana(hoje)}</span>
      <strong><span aria-hidden="true">${j.icone}</span> ${j.nome}</strong>
      <small>${meu ? 'Tu fez ' + meu.txt + ' hoje. Tenta bater!' : 'Níveis 1, 2 e 3 seguidos, iguais pra todo mundo hoje. Quem fica em 1º?'}</small>
      <span class="btn">Jogar o desafio do dia</span></a>`;
  };

  // Últimos 30 dias (só Premium joga; os outros veem o cadeado)
  CA.arquivoDias = function () {
    const premium = CA.ehPremium();
    const hoje = Date.parse(CA.hojeBR() + 'T12:00:00Z');
    let h = '';
    for (let i = 1; i <= 30; i++) {
      const d = new Date(hoje - i * 864e5).toISOString().slice(0, 10), j = CA.jogo(CA.jogoDoDia(d));
      h += `<a class="dia-antigo" href="#/dia?d=${d}" style="--cor:${j.cor}">
        <b>${CA.fmtData(d)}</b><span>${j.icone} ${j.nome}</span>${premium ? '' : '<i aria-label="Premium">🔒</i>'}</a>`;
    }
    return `<h2 class="secao">Desafios dos dias anteriores</h2><div class="arquivo">${h}</div>`;
  };

  // caixa do ranking do dia, cheia (intro) ou top 3 com tua posição (resultado)
  function rankingDia(cx, data, ehHoje, curto, antes) {
    const titulo = 'Ranking ' + (ehHoje ? 'de hoje' : 'de ' + CA.fmtData(data));
    const conta = CA.conta && CA.conta();
    if (!CA.verRanking) { cx.hidden = true; return Promise.resolve(null); }
    return (antes || Promise.resolve()).then(() => CA.verRanking(CA.chaveDia(data))).then(d => {
      if (!cx.isConnected) return d;
      const n = curto ? 3 : 10;
      cx.innerHTML = `
        <div class="cab-ranking"><strong>${curto && d.meu ? 'Tu tá em ' + d.meu.pos + 'º lugar' : titulo}</strong><span>${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</span></div>
        ${curto ? '' : `<p class="sub-ranking regra-ranking">${CA.regraDia(data)}</p>`}
        ${d.top.length ? `<ol class="lista-ranking">${d.top.slice(0, n).map(CA.linhaDia).join('')}</ol>` : '<p class="vazio">Ninguém jogou ainda. Bora ser o 1º?</p>'}
        ${d.meu && d.meu.pos > n ? `<p class="reticencias">···</p><ol class="lista-ranking">${CA.linhaDia(d.meu)}</ol>` : ''}
        ${conta ? '' : '<p class="vazio">Entra com teu e-mail (e teu @, se quiser) pra aparecer aqui.</p>'}
        <span class="ver-mais">${!curto && d.total > 10 ? `Ver todos os ${d.total} →` : 'Ver ranking completo e dos amigos →'}</span>`;
      // a intro mostra o top 10; tocar abre o ranking inteiro do dia, por páginas (17/11/2026)
      if (!curto && d.total > 10 && cx.href && !/todos=1/.test(cx.getAttribute('href'))) cx.setAttribute('href', cx.getAttribute('href') + '&todos=1');
      cx.hidden = false;
      return d;
    }).catch(() => { if (cx.isConnected) cx.innerHTML = `<div class="cab-ranking"><strong>${titulo}</strong></div><p class="vazio">Sem internet agora. O ranking volta quando a conexão voltar.</p>`; return null; });
  }

  CA.jogos.dia = {
    nome: 'Desafio do dia',
    iniciar(palco, p) {
      let ativo = true, parar = null;
      const data = p.d ? CA.dataDoDesafio(p) : CA.hojeBR();
      if (data === false) return null;
      if (p.de && CA.virarAmigo) CA.virarAmigo(p.de);
      const ehHoje = data === CA.hojeBR();
      const id = CA.jogoDoDia(data), j = CA.jogo(id), M = MODOS[id];
      const voltar = '#/dia?d=' + (ehHoje ? '1' : data);
      const rotulo = (ehHoje ? 'Desafio de ' + CA.nomeDiaSemana(data) : 'Desafio de ' + CA.fmtData(data));
      const amigo = p.v != null && p.v !== '' && isFinite(+p.v) ? +p.v : null;
      const amigoTxt = amigo == null ? '' : M.metrica === 'tempo' ? CA.fmtSeg(amigo) : amigo + ' acertos';
      const recKey = 'rec:jdia:' + data;
      let rs = [];
      const fechar = () => { if (parar) { try { parar(); } catch (e) {} parar = null; } };

      function intro() {
        fechar();
        const meu = CA.ler(recKey, null);
        palco.innerHTML = '';
        palco.appendChild(CA.el(`
          <section class="intro intro-dia" style="--cor:${j.cor}">
            <div class="barra-topo"><a class="voltar" href="#/" aria-label="Voltar">‹</a>
              <span class="nivel-tag">${rotulo} · ${CA.fmtData(data)}</span></div>
            <div class="cab-jogo"><span class="card-jogo-icone" aria-hidden="true">${j.icone}</span>
              <div><h1>${j.nome}</h1><p>Níveis 1, 2 e 3, um atrás do outro</p></div></div>
            <ul class="regras-nivel">
              <li>${M.como}</li>
              <li>Nível 1: ${M.nivelTxt(1)} · nível 2: ${M.nivelTxt(2)} · nível 3: ${M.nivelTxt(3)}</li>
              <li>Tudo <b>igual pra todo mundo</b> ${ehHoje ? 'hoje' : 'nesse dia'}: o ranking é justo</li>
              <li>🏆 ${M.regra}</li>
            </ul>
            ${amigo != null ? `<p class="meta-amigo">Teu amigo fez <b>${amigoTxt}</b>. Bate ele!</p>` : ''}
            ${meu ? `<p class="placar-estrelas">Teu melhor ${ehHoje ? 'hoje' : ''}: ${totalTxt(M, meu)}</p>` : ''}
            <button class="btn btn-grande" data-a="ir">${meu ? 'Jogar de novo e bater meu recorde' : 'Começar pelo nível 1'}</button>
            <h2 class="secao">Cada dia um jogo</h2>
            ${CA.semanaDia(data)}
            <a class="podio rank-dia" href="#/ranking?${ehHoje ? 'aba=hoje' : 'd=' + data}">
              <div class="cab-ranking"><strong>Ranking ${ehHoje ? 'de hoje' : 'de ' + CA.fmtData(data)}</strong></div><p class="vazio">Carregando...</p></a>
            ${CA.arquivoDias()}
          </section>`));
        palco.querySelector('[data-a=ir]').addEventListener('click', comecar);
        rankingDia(palco.querySelector('.rank-dia'), data, ehHoje, false);
      }

      function comecar() {
        if (CA.pedirCadastro && CA.pedirCadastro()) return; // jogador novo cria a conta antes
        rs = [];
        nivel(1);
      }

      function nivel(n) {
        fechar();
        window.scrollTo(0, 0);
        parar = M.jogar(palco, n, CA.sementeDoDia(id + ':' + n, data),
          { titulo: `${rotulo} · nível ${n} de ${NIVEIS}`, voltar: '#/', vivo: () => ativo },
          r => {
            if (!ativo) return;
            rs[n - 1] = r;
            M.salvar(n, r);
            if (n < NIVEIS) entre(n); else fim();
          });
      }

      // entre um nível e outro: como foi, quanto soma e o próximo
      function entre(n) {
        fechar();
        const r = rs[n - 1], tot = totalDe(M, rs);
        palco.innerHTML = '';
        palco.appendChild(CA.el(`
          <section class="intro entre-niveis" style="--cor:${j.cor}">
            <span class="nivel-tag">${rotulo} · ${j.nome}</span>
            <p class="entre-titulo">Nível ${n} de ${NIVEIS}</p>
            <p class="entre-valor">${M.txt(r)}</p>
            ${r.e ? `<p class="res-estrelas">${'<i class="cheia">★</i>'.repeat(r.e)}${'<i>★</i>'.repeat(3 - r.e)}</p>` : ''}
            <ol class="niveis-dia">${Array.from({ length: NIVEIS }, (_, i) => `<li class="${rs[i] ? 'feito' : i === n ? 'proximo' : ''}">
              <b>Nível ${i + 1}</b><span>${M.nivelTxt(i + 1)}</span><em>${rs[i] ? M.txt(rs[i]) : i === n ? 'agora' : '...'}</em></li>`).join('')}</ol>
            <p class="entre-soma">Somando até agora: <b>${totalTxt(M, tot)}</b></p>
            <button class="btn btn-grande" data-a="ir">Jogar o nível ${n + 1}</button>
            <button class="link-voltar" type="button" data-a="parar">Parar e voltar pro início do desafio</button>
          </section>`));
        palco.querySelector('[data-a=ir]').addEventListener('click', () => nivel(n + 1));
        palco.querySelector('[data-a=parar]').addEventListener('click', intro);
      }

      function fim() {
        fechar();
        const tot = totalDe(M, rs), txt = totalTxt(M, tot);
        const tent = CA.ler('tent:jdia:' + data, 0) + 1;
        CA.gravar('tent:jdia:' + data, tent);
        const antes = CA.ler(recKey, null), bateu = melhorQue(M, tot, antes);
        if (bateu) CA.gravar(recKey, { ...tot, r: tent });
        const melhor = bateu ? { ...tot, r: tent } : antes;
        if (ehHoje) CA.gravar('dia:' + data, { jogo: id, txt: totalTxt(M, melhor) });
        // pro ranking: no Caça-números t = tempo somado; nos outros, acertos (t = segundos jogados)
        const envio = CA.enviarRecorde
          ? CA.enviarRecorde(CA.chaveDia(data), M.metrica === 'tempo' ? tot.t : NIVEIS * 30, tent, M.metrica === 'tempo' ? null : { acertos: tot.a })
          : Promise.resolve(false);
        const valor = M.metrica === 'tempo' ? tot.t : tot.a;
        const meuId = CA.perfil && (CA.perfil() || {}).id_publico;
        const link = { d: data, v: valor, ...(meuId ? { de: meuId } : {}) };
        const prox = NIVEIS + 1, livre = j.acesso();
        const card = {
          jogo: j.nome, linha1: rotulo + ' · níveis 1 a 3', valor: txt.replace(' s', 's'), estrelas: null, cor: j.cor,
          linha3: 'Duvido tu fazer melhor hoje!', comoJoga: 'Desafio do dia: os 3 primeiros níveis, iguais pra todo mundo',
          tentativa: CA.naTentativa ? CA.naTentativa(tent) : '',
        };
        palco.innerHTML = '';
        palco.appendChild(CA.resultado({
          titulo: `${rotulo} · ${j.icone} ${j.nome}`,
          valorTxt: txt,
          detalhe: rs.map((r, i) => `Nível ${i + 1}: ${M.txt(r)}`).join(' · ') + (tent === 1 ? ' · de primeira!' : ` · tentativa nº ${tent}`),
          recorde: { antigo: antes ? (M.metrica === 'tempo' ? antes.t : antes.a) : null, bateu },
          recordeTxt: antes ? totalTxt(M, melhor) : '',
          amigo: amigo != null ? { valorTxt: amigoTxt, ganhou: M.metrica === 'tempo' ? tot.t < amigo : tot.a > amigo } : null,
          proxima: livre ? { href: j.href(prox), txt: `Continuar no nível ${prox}` } : { href: j.href(prox), txt: `Continuar no nível ${prox} 🔒`, tranca: true },
          desafio: {
            texto: `Fiz ${txt} no desafio de hoje do ${j.nome} ${j.icone} Duvido tu fazer melhor!`,
            url: CA.linkDesafio('dia', link),
          },
          card,
          voltaConta: voltar,
          linkVoltar: { href: '#/ranking?' + (ehHoje ? 'aba=hoje' : 'd=' + data), txt: 'Ver o ranking do dia' },
          jogarDeNovo: comecar,
        }));
        const folha = palco.querySelector('.folha');
        if (folha) {
          const cx = CA.el(`<a class="podio res-ranking mov-aparece" href="#/ranking?${ehHoje ? 'aba=hoje' : 'd=' + data}" hidden></a>`);
          folha.after(cx);
          if (!(CA.conta && CA.conta())) {
            cx.innerHTML = '<div class="cab-ranking"><strong>Ranking de hoje</strong></div><p class="vazio">Entra com teu e-mail pra aparecer no ranking (e com teu @, se quiser).</p><span class="ver-mais">Entrar e aparecer →</span>';
            cx.href = '#/conta?volta=' + encodeURIComponent(voltar); cx.hidden = false;
          } else {
            rankingDia(cx, data, ehHoje, true, envio).then(d => { if (d && d.meu) card.ranking = { pos: d.meu.pos, txt: 'LUGAR HOJE' }; });
          }
        }
        const res = palco.querySelector('.resultado');
        if (res && CA.cardsJogos) res.appendChild(CA.el(`<div class="outros-jogos"><h2 class="secao">Todos os jogos</h2>${CA.cardsJogos(id)}</div>`));
      }

      intro();
      return () => { ativo = false; fechar(); };
    },
  };
})();
