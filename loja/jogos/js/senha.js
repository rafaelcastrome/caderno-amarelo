/* Senha do dia (Rafael, 17/11/2026: o "enigma do dia" estilo Wordle, junto com o Só mais uma).
   Todo dia uma senha de 4 cores, a mesma pra todo mundo. Tu tem 6 chutes; depois de cada chute
   cada bolinha mostra: ✓ verde = cor certa no lugar certo, amarelo = a cor tá na senha mas em outro lugar,
   cinza = essa cor não tá na senha. Sem cor repetida. Uma senha por dia: quem quer mais, volta amanhã.
   Resultado em quadradinhos pra mandar no grupo (sem entregar a resposta) e ranking do dia.
   Premium: senhas dos 30 dias anteriores e o modo difícil (5 cores, 7 opções), que vale outro ranking.

   Rotas: #/senha (hoje) | #/senha?d=AAAA-MM-DD (dia anterior, Premium) | &dif=1 (modo difícil, Premium)
   Ranking: 'senha:AAAA-MM-DD' e 'senhad:AAAA-MM-DD' (acertos = 7 - chutes usados, t = segundos). */
(function () {
  'use strict';
  const CA = window.CA;
  const CORES = [
    { id: 'v', nome: 'vermelho', hex: '#d62828', emo: '🔴' },
    { id: 'a', nome: 'azul', hex: '#1d4ed8', emo: '🔵' },
    { id: 'g', nome: 'verde', hex: '#15803d', emo: '🟢' },
    { id: 'y', nome: 'amarelo', hex: '#f2b705', emo: '🟡' },
    { id: 'r', nome: 'roxo', hex: '#7c3aed', emo: '🟣' },
    { id: 'l', nome: 'laranja', hex: '#ea580c', emo: '🟠' },
    { id: 'm', nome: 'marrom', hex: '#7c4a1e', emo: '🟤' },
  ];
  const CHUTES = 6;
  const cfg = dif => dif ? { n: 5, k: 7 } : { n: 4, k: 6 };
  const chaveRank = (d, dif) => (dif ? 'senhad:' : 'senha:') + d;

  function senhaDe(d, dif) {
    const { n, k } = cfg(dif);
    return CA.rng(CA.sementeDoDia(dif ? 'senha-dif' : 'senha', d)).shuffle(CORES.slice(0, k)).slice(0, n).map(c => c.id);
  }
  // marca cada bolinha do chute: 2 = lugar certo, 1 = tem em outro lugar, 0 = não tem
  const marcar = (chute, senha) => chute.map((c, i) => senha[i] === c ? 2 : senha.includes(c) ? 1 : 0);
  const cor = id => CORES.find(c => c.id === id);
  const estado = (d, dif) => CA.ler((dif ? 'senhad:' : 'senha:') + d, { chutes: [], fim: false, ganhou: false, t0: 0, t: 0 });
  const gravarEstado = (d, dif, e) => CA.gravar((dif ? 'senhad:' : 'senha:') + d, e);

  // vitórias seguidas (só o modo normal de hoje conta)
  function contarSequencia(d, ganhou) {
    const s = CA.ler('senha:seq', { ult: null, vit: 0, melhor: 0, jogos: 0, vitorias: 0, dist: [0, 0, 0, 0, 0, 0] });
    if (s.ult === d) return s;
    const ontem = new Date(Date.parse(d + 'T12:00:00Z') - 864e5).toISOString().slice(0, 10);
    s.jogos++;
    if (ganhou) { s.vitorias++; s.vit = s.ult === ontem && s.vit ? s.vit + 1 : 1; } else s.vit = 0;
    s.melhor = Math.max(s.melhor, s.vit); s.ult = d;
    CA.gravar('senha:seq', s);
    return s;
  }

  CA.cardSenha = function () {
    const d = CA.hojeBR(), e = estado(d, false), s = CA.ler('senha:seq', null);
    const sub = e.fim ? (e.ganhou ? `Tu acertou em ${e.chutes.length}/${CHUTES}! Amanhã tem outra.` : 'Hoje não deu... amanhã tem outra!')
      : e.chutes.length ? `Tu tá no chute ${e.chutes.length + 1} de ${CHUTES}. Bora terminar!` : '4 cores escondidas, 6 chutes. A mesma senha pra todo mundo hoje.';
    return `<a class="card-senha" href="#/senha">
      ${s && s.vit ? `<span class="mm-fogo">🏆 ${s.vit}</span>` : ''}
      <strong>🔐 Senha do dia</strong><small>${sub}</small>
      <span class="sh-mini" aria-hidden="true">${(e.chutes.length ? marcar(e.chutes[e.chutes.length - 1], senhaDe(d, false)) : [0, 0, 0, 0]).map(m => `<i class="m${e.chutes.length ? m : 'x'}"></i>`).join('')}</span></a>`;
  };

  CA.jogos.senha = {
    nome: 'Senha do dia',
    iniciar(palco, p) {
      let vivo = true;
      const hoje = CA.hojeBR();
      let d = hoje;
      if (p.d && p.d !== '1') { const x = CA.dataDoDesafio(p); if (x === false) return null; d = x; }
      const dif = !!p.dif;
      if (dif && !CA.ehPremium()) { location.replace('#/premium'); return null; }
      const ehHoje = d === hoje;
      const { n, k } = cfg(dif), senha = senhaDe(d, dif), opcoes = CORES.slice(0, k);
      let e = estado(d, dif), atual = [];

      function desenhar() {
        palco.innerHTML = '';
        const linhas = Array.from({ length: CHUTES }, (_, i) => {
          const ch = e.chutes[i], ms = ch && marcar(ch, senha), ehAtual = !e.fim && i === e.chutes.length;
          return `<li class="sh-linha ${ehAtual ? 'atual' : ''}">${Array.from({ length: n }, (_, j) => {
            const c = ch ? cor(ch[j]) : ehAtual && atual[j] ? cor(atual[j]) : null;
            return `<span class="sh-bola ${ms ? 'm' + ms[j] : ''} ${c ? 'cheia' : ''}" style="${c ? '--c:' + c.hex : ''}" ${ehAtual && c ? `data-tira="${j}"` : ''}>${ms ? (ms[j] === 2 ? '✓' : ms[j] === 1 ? '•' : '') : ''}</span>`;
          }).join('')}</li>`;
        }).join('');
        const usadas = {};
        e.chutes.forEach(ch => marcar(ch, senha).forEach((m, j) => { usadas[ch[j]] = Math.max(usadas[ch[j]] ?? -1, m); }));
        palco.appendChild(CA.el(`
          <section class="sh-tela ${dif ? 'dificil' : ''}">
            <div class="barra-topo"><a class="voltar" href="#/" aria-label="Voltar">‹</a>
              <span class="nivel-tag">${ehHoje ? 'Hoje' : CA.fmtData(d)}${dif ? ' · modo difícil' : ''}</span></div>
            <h1 class="mm-titulo sh-titulo">Senha do dia</h1>
            <p class="mm-sub">Descobre as <b>${n} cores</b> escondidas em <b>${CHUTES} chutes</b>. Não tem cor repetida.</p>
            <div class="sh-legenda"><span><i class="sh-bola m2 cheia" style="--c:#15803d">✓</i> lugar certo</span><span><i class="sh-bola m1 cheia" style="--c:#1d4ed8">•</i> tem, mas noutro lugar</span><span><i class="sh-bola m0 cheia" style="--c:#7c3aed"></i> não tem</span></div>
            <ol class="sh-grade" style="--n:${n}">${linhas}</ol>
            ${e.fim ? '' : `
            <div class="sh-paleta">${opcoes.map(c => `<button class="sh-op ${usadas[c.id] === 0 ? 'fora' : ''} ${atual.includes(c.id) ? 'usada' : ''}" data-c="${c.id}" style="--c:${c.hex}" aria-label="${c.nome}"></button>`).join('')}</div>
            <div class="sh-acoes"><button class="btn btn-claro" data-a="apaga" ${atual.length ? '' : 'disabled'}>⌫ Apagar</button>
              <button class="btn" data-a="chuta" ${atual.length === n ? '' : 'disabled'}>Chutar</button></div>`}
            <div class="sh-fim"></div>
          </section>`));
        palco.querySelector('.sh-tela').addEventListener('click', clique);
        if (e.fim) fim();
      }

      function clique(ev) {
        if (!vivo || e.fim) return;
        const op = ev.target.closest('.sh-op'), tira = ev.target.closest('[data-tira]'), a = ev.target.closest('[data-a]');
        if (op) {
          if (atual.includes(op.dataset.c)) { CA.aviso('Não tem cor repetida 😉'); return; }
          if (atual.length >= n) return;
          if (!e.t0) { e.t0 = Date.now(); gravarEstado(d, dif, e); }
          atual.push(op.dataset.c); CA.som('tique'); desenhar();
        } else if (tira) { atual.splice(+tira.dataset.tira, 1); desenhar(); }
        else if (a && a.dataset.a === 'apaga') { atual.pop(); desenhar(); }
        else if (a && a.dataset.a === 'chuta' && atual.length === n) chutar();
      }

      function chutar() {
        const ms = marcar(atual, senha);
        e.chutes.push(atual); atual = [];
        const ganhou = ms.every(m => m === 2);
        if (ganhou || e.chutes.length >= CHUTES) {
          e.fim = true; e.ganhou = ganhou; e.t = Math.max(3, Math.round((Date.now() - (e.t0 || Date.now())) / 100) / 10);
          gravarEstado(d, dif, e);
          if (ehHoje && !dif) contarSequencia(d, ganhou);
          if (ganhou && CA.enviarRecorde) CA.enviarRecorde(chaveRank(d, dif), e.t, null, { acertos: CHUTES + 1 - e.chutes.length });
          CA.som(ganhou ? 'recorde' : 'fim');
        } else { gravarEstado(d, dif, e); CA.som(ms.some(m => m) ? 'certo' : 'errado'); }
        desenhar();
        if (e.fim) palco.querySelector('.sh-grade li:nth-child(' + e.chutes.length + ')')?.classList.add('revela');
      }

      // depois de terminar: a senha, quadradinhos pra compartilhar, contador pra próxima e ranking
      let relogio = 0;
      function fim() {
        const alvo = palco.querySelector('.sh-fim');
        const s = CA.ler('senha:seq', { vit: 0, melhor: 0, jogos: 0, vitorias: 0 });
        const quadros = e.chutes.map(ch => marcar(ch, senha).map(m => m === 2 ? '🟩' : m === 1 ? '🟨' : '⬜').join('')).join('\n');
        const titulo = `Senha do dia ${CA.fmtData(d)}${dif ? ' (difícil)' : ''} ${e.ganhou ? e.chutes.length : 'X'}/${CHUTES} 🔐`;
        alvo.innerHTML = `
          <div class="folha sh-folha">
            <p class="res-titulo">${e.ganhou ? ['Gênio! 🤯', 'Que isso! 🔥', 'Mandou bem!', 'Boa!', 'Ufa, acertou!', 'No último chute! 😅'][e.chutes.length - 1] : 'Não foi dessa vez...'}</p>
            <p class="sh-resposta">A senha era: ${senha.map(c => `<i class="sh-bola cheia" style="--c:${cor(c).hex}"></i>`).join('')}</p>
            ${ehHoje && !dif ? `<div class="mm-placar sh-placar"><div><small>Jogos</small><b>${s.jogos}</b></div><div><small>Vitórias seguidas</small><b>🏆 ${s.vit}</b></div><div><small>Melhor</small><b>${s.melhor}</b></div></div>` : ''}
            ${ehHoje ? '<p class="sh-prox">Próxima senha em <b class="sh-conta">--:--:--</b></p>' : ''}
          </div>
          <div class="acoes">
            <button class="btn btn-grande" data-f="manda">Mandar no grupo 🟩🟨</button>
            <a class="btn btn-grande btn-claro" href="#/mais?jogar=1">Enquanto isso: Só mais uma 🔁</a>
            ${CA.ehPremium() ? (!dif ? `<a class="btn btn-grande btn-claro" href="#/senha?dif=1${ehHoje ? '' : '&d=' + d}">Modo difícil: 5 cores ★</a>` : '')
              : `<a class="chamada-premium" href="#/premium"><strong>Quer mais senhas?</strong><span>O ca<span class="r-marca">R</span>deno Premium libera o modo difícil (5 cores) e as senhas dos 30 dias anteriores.</span></a>`}
          </div>
          <a class="podio sh-rank" href="#/senha"></a>
          ${CA.ehPremium() ? arquivo() : ''}`;
        alvo.querySelector('[data-f=manda]').addEventListener('click', () => CA.compartilhar(titulo + '\n' + quadros + '\nDuvido tu acertar em menos:', 'https://' + CA.enderecoJogo() + '/#/senha'));
        const conta = alvo.querySelector('.sh-conta');
        if (conta) {
          const tick = () => {
            if (!conta.isConnected) return clearInterval(relogio);
            const meia = Date.parse(CA.hojeBR() + 'T03:00:00Z') + 864e5, r = Math.max(0, meia - Date.now());
            conta.textContent = [r / 36e5, r / 6e4 % 60, r / 1e3 % 60].map(x => String(Math.floor(x)).padStart(2, '0')).join(':');
          };
          tick(); relogio = setInterval(tick, 1000);
        }
        const cx = alvo.querySelector('.sh-rank');
        if (CA.verRanking) {
          cx.innerHTML = '<div class="cab-ranking"><strong>Ranking da senha</strong></div><p class="vazio">Carregando...</p>';
          CA.verRanking(chaveRank(d, dif)).then(r => {
            if (!cx.isConnected) return;
            const linha = x => `<li class="lr ${x.eu ? 'eu' : ''}">${x.pos <= 3 ? `<span class="medalha">${['🥇', '🥈', '🥉'][x.pos - 1]}</span>` : `<span class="pos">${x.pos}º</span>`}
              <span class="nome">${CA.nomeRankingHtml(x)}${x.eu ? ' <small>(tu)</small>' : ''}</span><span class="val"><b>${CHUTES + 1 - x.acertos}/${CHUTES} chutes</b><small>${CA.fmtSeg(x.t)}</small></span></li>`;
            cx.innerHTML = `<div class="cab-ranking"><strong>Ranking da senha ${ehHoje ? 'de hoje' : 'de ' + CA.fmtData(d)}</strong><span>${r.total} ${r.total === 1 ? 'pessoa' : 'pessoas'}</span></div>
              <p class="sub-ranking regra-ranking">Quem acertou com menos chutes. Empatou, ganha o mais rápido</p>
              ${r.top.length ? `<ol class="lista-ranking">${r.top.slice(0, 10).map(linha).join('')}</ol>` : '<p class="vazio">Ninguém ainda. Bora ser o 1º?</p>'}
              ${r.meu && r.meu.pos > 10 ? `<p class="reticencias">···</p><ol class="lista-ranking">${linha(r.meu)}</ol>` : ''}
              ${CA.conta && CA.conta() ? '' : '<p class="vazio">Entra com teu e-mail pra aparecer aqui.</p>'}`;
          }).catch(() => { if (cx.isConnected) cx.innerHTML = '<div class="cab-ranking"><strong>Ranking da senha</strong></div><p class="vazio">O ranking não carregou agora.</p>'; });
        } else cx.remove();
      }

      function arquivo() {
        const base = Date.parse(CA.hojeBR() + 'T12:00:00Z');
        let h = '';
        for (let i = 1; i <= 30; i++) {
          const dd = new Date(base - i * 864e5).toISOString().slice(0, 10), x = estado(dd, false);
          h += `<a class="dia-antigo" href="#/senha?d=${dd}"><b>${CA.fmtData(dd)}</b><span>${x.fim ? (x.ganhou ? x.chutes.length + '/6 ✓' : 'X/6') : 'jogar'}</span></a>`;
        }
        return `<h2 class="secao">Senhas dos dias anteriores</h2><div class="arquivo">${h}</div>`;
      }

      desenhar();
      return () => { vivo = false; clearInterval(relogio); };
    },
  };
})();
