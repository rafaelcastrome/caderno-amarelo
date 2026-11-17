/* Só mais uma (Rafael, 17/11/2026: "um jogo viciante, que a pessoa volte todo dia e se autodesafie").
   Corrida sem fim com os desafios do canal misturados (Fala a cor, Certo ou errado, Fala a seta,
   Toca no maior, Acha o diferente, Quantos tem?). Acertou ganha tempo, errou perde; fica cada vez
   mais rápido e só acaba quando o tempo zera. Não tem "nível 3": o desafio é bater o próprio recorde.

   O que faz voltar: recorde sempre na tela, desafio do dia (mesma sequência pra todos, ranking do dia),
   sequência de dias 🔥, 3 missões por dia que dão estrelas e liberam canetas, duelo pelo link.
   Premium: 3 tentativas no desafio do dia (grátis: 1), segunda chance (+5 s) 1x por partida,
   1 protetor da sequência por semana e a caneta dourada.

   Rotas: #/mais (início do jogo) | #/mais?jogar=1 (treino) | #/mais?d=1 (desafio do dia)
          | #/mais?s=semente&v=acertos&de=id (duelo: mesma sequência do amigo)
   Ranking no servidor (jogo-ranking): 'mais:AAAA-MM-DD' (desafio do dia) e 'mais:rec' (recorde de sempre),
   os dois por acertos (t = segundos que durou a partida). */
(function () {
  'use strict';
  const CA = window.CA;

  // ---------- ritmo ----------
  const T0 = 10, TMAX = 12, MULTA = 2.5, BLOCO = 5;
  const bonus = i => Math.max(0.5, 1.3 - i * 0.015); // segundos ganhos por acerto (diminui com o tempo)
  const nivelDe = i => Math.min(10, 1 + Math.floor(i / 7)); // velocidade 1..10 pela pergunta
  const TENT_GRATIS = 1, TENT_PREMIUM = 3;

  // ---------- os mini desafios ----------
  const CORES = [
    { id: 'vermelho', nome: 'VERMELHO', hex: '#d62828' },
    { id: 'azul', nome: 'AZUL', hex: '#1d4ed8' },
    { id: 'verde', nome: 'VERDE', hex: '#15803d' },
    { id: 'amarelo', nome: 'AMARELO', hex: '#f2b705' },
    { id: 'roxo', nome: 'ROXO', hex: '#7c3aed' },
    { id: 'laranja', nome: 'LARANJA', hex: '#ea580c' },
  ];
  const SETAS = [
    { id: 'cima', rot: -90, op: 'baixo', nome: 'pra cima' },
    { id: 'dir', rot: 0, op: 'esq', nome: 'pra direita' },
    { id: 'baixo', rot: 90, op: 'cima', nome: 'pra baixo' },
    { id: 'esq', rot: 180, op: 'dir', nome: 'pra esquerda' },
  ];
  const seta = (rot, cor) => `<svg viewBox="0 0 100 100" aria-hidden="true" style="transform:rotate(${rot}deg)"><path d="M12 42h46V22l32 28-32 28V58H12z" fill="${cor}" stroke="#1f1f24" stroke-width="5" stroke-linejoin="round"/></svg>`;
  // pares de letras parecidas (Acha o diferente): os do fim são mais difíceis
  const PARES = [['O', 'Q'], ['E', 'F'], ['b', 'd'], ['M', 'N'], ['6', '9'], ['p', 'q'], ['C', 'G'], ['8', 'B'], ['u', 'v'], ['5', 'S'], ['W', 'V'], ['n', 'h'], ['R', 'P'], ['I', 'l']];
  const sn = `<div class="botoes-sn"><button class="sn sn-certo" data-v="1">CERTO</button><button class="sn sn-errado" data-v="0">ERRADO</button></div>`;

  const TIPOS = {
    cor: {
      nome: 'Fala a cor', icone: '🎨', dica: 'Toca na cor da <b>tinta</b>, não na palavra',
      gerar(r, d) {
        const k = d < 3 ? 3 : d < 5 ? 4 : d < 7 ? 5 : 6, cs = CORES.slice(0, k);
        const pal = r.pick(cs), tinta = r() < 0.15 ? pal : r.pick(cs.filter(c => c !== pal));
        const ordem = d >= 6 ? r.shuffle(cs) : cs; // no começo os botões ficam parados; depois trocam de lugar
        return {
          html: `<div class="mm-palavra" style="color:${tinta.hex}">${pal.nome}</div>`,
          botoes: `<div class="botoes-cor" style="--k:${k === 4 ? 4 : 3}">${ordem.map(c => `<button class="bola-btn" data-v="${c.id}" style="--c:${c.hex}" aria-label="${c.nome}"></button>`).join('')}</div>`,
          certo: tinta.id,
        };
      },
    },
    conta: {
      nome: 'Certo ou errado?', icone: '⚡', dica: 'A conta (ou a frase) tá <b>certa</b> ou <b>errada</b>?',
      gerar(r, d) {
        let txt, ok;
        if (CA.PEGADINHAS && r() < 0.25) { const p = r.pick(CA.PEGADINHAS); txt = p[0]; ok = p[1]; }
        else { const q = CA.gerarConta(r, Math.min(10, d + 1)); txt = q.txt; ok = q.certo; }
        return { html: `<div class="mm-frase">${txt}</div>`, botoes: sn, certo: ok ? '1' : '0' };
      },
    },
    seta: {
      nome: 'Fala a seta', icone: '➡️', dica: 'Toca pra onde a seta aponta. Seta <b class="verm">vermelha</b>: o contrário!',
      gerar(r, d) {
        const s = r.pick(SETAS), contra = d >= 3 && r() < (d >= 6 ? 0.45 : 0.3);
        return {
          html: `<div class="mm-seta ${contra ? 'contra' : ''}">${seta(s.rot, contra ? '#d62828' : '#1d4ed8')}</div>`,
          botoes: `<div class="mm-cruz">${SETAS.map(x => `<button class="mm-dir mm-${x.id}" data-v="${x.id}" aria-label="${x.nome}">${seta(x.rot, '#1f1f24')}</button>`).join('')}</div>`,
          certo: contra ? s.op : s.id,
        };
      },
    },
    maior: {
      nome: 'Toca no maior', icone: '🔢', dica: 'Toca no número <b>MAIOR</b>. Às vezes pede o <b class="verm">MENOR</b>!',
      gerar(r, d) {
        const menor = d >= 3 && r() < 0.35;
        let ns;
        if (d < 3) ns = r.shuffle(Array.from({ length: 40 }, (_, i) => i + 1)).slice(0, 4);
        else {
          // números parecidos: mesmos algarismos trocados de lugar (68 x 86, 619 x 691...)
          const dig = d < 6 ? 2 : 3, set = new Set();
          const base = Array.from({ length: dig }, (_, i) => i === 0 ? r.int(1, 9) : r.int(0, 9));
          while (set.size < 4) {
            const v = +r.shuffle(base).join('');
            if (String(v).length === dig) set.add(v);
            else set.add(+base.join('') + set.size + 1);
            if (set.size < 4 && r() < 0.25) set.add(+base.join('') + r.int(-9, 9) * (dig === 3 ? 10 : 1));
          }
          ns = [...set].slice(0, 4).map(v => Math.max(1, v));
          if (new Set(ns).size < 4) ns = r.shuffle(Array.from({ length: 90 }, (_, i) => i + 10)).slice(0, 4);
        }
        const alvo = menor ? Math.min(...ns) : Math.max(...ns);
        return {
          html: `<div class="mm-pede ${menor ? 'verm' : ''}">Toca no <b>${menor ? 'MENOR' : 'MAIOR'}</b></div>`,
          botoes: `<div class="mm-numeros">${ns.map(n => `<button class="mm-num" data-v="${n}">${n}</button>`).join('')}</div>`,
          certo: String(alvo),
        };
      },
    },
    diferente: {
      nome: 'Acha o diferente', icone: '🔍', dica: 'Todas iguais, menos <b>uma</b>. Toca nela!',
      gerar(r, d) {
        const lado = d < 3 ? 3 : d < 5 ? 4 : d < 8 ? 5 : 6;
        const par = r.pick(PARES.slice(0, Math.min(PARES.length, 6 + d)));
        const [igual, dif] = r() < 0.5 ? par : [par[1], par[0]];
        const pos = r.int(0, lado * lado - 1);
        return {
          html: '',
          botoes: `<div class="mm-grade" style="--n:${lado}">${Array.from({ length: lado * lado }, (_, i) => `<button class="mm-letra" data-v="${i}">${i === pos ? dif : igual}</button>`).join('')}</div>`,
          certo: String(pos),
        };
      },
    },
    quantos: {
      nome: 'Quantos tem?', icone: '🟡', dica: 'Conta as bolinhas, rapidinho!',
      gerar(r, d) {
        const n = d < 3 ? r.int(3, 6) : d < 6 ? r.int(5, 9) : r.int(7, 12);
        const cel = r.shuffle(Array.from({ length: 30 }, (_, i) => i)).slice(0, n); // grade 6x5, sem encostar
        const bolas = cel.map(c => { const x = (c % 6) * 16 + 8 + r.int(-3, 3), y = Math.floor(c / 6) * 18 + 9 + r.int(-3, 3); return `<i style="left:${x}%;top:${y}%"></i>`; }).join('');
        const ops = new Set([n]);
        while (ops.size < 4) { const v = n + r.int(-2, 2); if (v > 0) ops.add(v); }
        return {
          html: `<div class="mm-bolas ${d >= 7 ? 'some' : ''}">${bolas}</div>`,
          botoes: `<div class="mm-numeros">${[...ops].sort((a, b) => a - b).map(v => `<button class="mm-num" data-v="${v}">${v}</button>`).join('')}</div>`,
          certo: String(n),
        };
      },
    },
  };
  const ORDEM = ['cor', 'conta', 'seta', 'maior', 'diferente', 'quantos'];
  const liberadosNoBloco = b => b < 2 ? 3 : b < 4 ? 4 : b < 6 ? 5 : 6;

  // sequência de blocos e perguntas: só depende da semente (mesma semente = mesma partida pro amigo e no desafio do dia)
  function tipoDoBloco(semente, b, anterior) {
    const k = liberadosNoBloco(b);
    if (b > 0 && k > liberadosNoBloco(b - 1)) return { id: ORDEM[k - 1], novo: true };
    const r = CA.rng((semente ^ 0x5bd1e995) + b * 7919);
    const ops = ORDEM.slice(0, k).filter(x => x !== anterior);
    return { id: r.pick(ops), novo: false };
  }

  // ---------- guardado no celular ----------
  const hoje = () => CA.hojeBR();
  const ontemDe = d => new Date(Date.parse(d + 'T12:00:00Z') - 864e5).toISOString().slice(0, 10);
  const diasEntre = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);
  const recorde = () => CA.ler('mais:rec', 0);

  // Sequência de dias: jogou hoje, conta; pulou um dia, zera (Premium tem 1 protetor por semana)
  function sequencia() {
    const s = CA.ler('mais:seq', { ult: null, dias: 0, melhor: 0, prot: null });
    if (s.ult && s.ult !== hoje() && s.ult !== ontemDe(hoje())) {
      const gap = diasEntre(s.ult, hoje());
      const podeProteger = CA.ehPremium() && gap === 2 && (!s.prot || diasEntre(s.prot, hoje()) >= 7);
      return { ...s, viva: podeProteger, emRisco: podeProteger, perdida: !podeProteger };
    }
    return { ...s, viva: !!s.ult, jogouHoje: s.ult === hoje() };
  }
  function marcarDia() {
    const s = CA.ler('mais:seq', { ult: null, dias: 0, melhor: 0, prot: null });
    const h = hoje();
    if (s.ult === h) return { ...s, subiu: false };
    let usouProt = false;
    if (s.ult === ontemDe(h)) s.dias++;
    else if (s.ult && CA.ehPremium() && diasEntre(s.ult, h) === 2 && (!s.prot || diasEntre(s.prot, h) >= 7)) { s.dias++; s.prot = h; usouProt = true; }
    else s.dias = 1;
    s.ult = h; s.melhor = Math.max(s.melhor || 0, s.dias);
    CA.gravar('mais:seq', s);
    return { ...s, subiu: true, usouProt };
  }

  // ---------- missões do dia ----------
  // Sorteadas pela data (iguais pra todo mundo). Cada uma dá 1 estrela; as 3 juntas dão +2.
  function missoesDe(d) {
    const r = CA.rng(CA.sementeDoDia('mais:missoes', d));
    const tipo = r.pick(ORDEM.slice(0, 4));
    const pool = [
      { id: 'pts', alvo: r.pick([15, 20, 25]), txt: a => `Faz ${a} acertos numa partida` },
      { id: 'seq', alvo: r.pick([8, 10, 12]), txt: a => `Acerta ${a} seguidos sem errar` },
      { id: 'jogos', alvo: r.pick([3, 5]), txt: a => `Joga ${a} partidas hoje` },
      { id: 'tipo', alvo: 5, tipo, txt: a => `Acerta ${a} de ${TIPOS[tipo].icone} ${TIPOS[tipo].nome} numa partida` },
      { id: 'vel', alvo: r.pick([3, 4]), txt: a => `Chega na velocidade ${a}` },
      { id: 'dia', alvo: 1, txt: () => 'Joga o desafio do dia' },
    ];
    return r.shuffle(pool).slice(0, 3).map(m => ({ ...m, txt: m.txt(m.alvo) }));
  }
  function estadoMissoes() {
    const d = hoje(), ms = missoesDe(d), st = CA.ler('mais:mis:' + d, { feitas: [], jogos: 0, val: {} });
    return ms.map((m, i) => ({ ...m, feita: st.feitas.includes(i), val: Math.min(m.alvo, m.id === 'jogos' ? st.jogos : (st.val[i] || 0)) }));
  }
  // atualiza com o resultado de uma partida; devolve as missões que acabaram de ser feitas
  function contarMissoes(res) {
    const d = hoje(), ms = missoesDe(d), st = CA.ler('mais:mis:' + d, { feitas: [], jogos: 0, val: {} });
    st.jogos++;
    const novas = [];
    ms.forEach((m, i) => {
      const v = m.id === 'pts' ? res.acertos : m.id === 'seq' ? res.melhorSeq : m.id === 'jogos' ? st.jogos
        : m.id === 'tipo' ? (res.porTipo[m.tipo] || 0) : m.id === 'vel' ? res.vel : m.id === 'dia' ? (res.dia ? 1 : 0) : 0;
      if (m.id !== 'jogos') st.val[i] = Math.max(st.val[i] || 0, v);
      if (!st.feitas.includes(i) && v >= m.alvo) { st.feitas.push(i); novas.push(m); }
    });
    let ganhou = novas.length;
    if (novas.length && st.feitas.length === 3) ganhou += 2;
    if (ganhou) CA.gravar('mais:estrelas', CA.ler('mais:estrelas', 0) + ganhou);
    CA.gravar('mais:mis:' + d, st);
    return { novas, ganhou, todas: st.feitas.length === 3 && novas.length > 0 };
  }

  // ---------- canetas (o prêmio das missões) ----------
  const CANETAS = [
    { id: 'azul', nome: 'Azul', hex: '#1d4ed8', custo: 0 },
    { id: 'vermelha', nome: 'Vermelha', hex: '#d62828', custo: 3 },
    { id: 'verde', nome: 'Verde', hex: '#15803d', custo: 8 },
    { id: 'roxa', nome: 'Roxa', hex: '#7c3aed', custo: 15 },
    { id: 'laranja', nome: 'Laranja', hex: '#ea580c', custo: 25 },
    { id: 'dourada', nome: 'Dourada', hex: '#c99a1b', custo: 40, premium: true },
  ];
  const canetaLivre = c => CA.ler('mais:estrelas', 0) >= c.custo || (c.premium && CA.ehPremium());
  const caneta = () => { const c = CANETAS.find(x => x.id === CA.ler('mais:caneta', 'azul')); return c && canetaLivre(c) ? c : CANETAS[0]; };

  // ---------- desafio do dia ----------
  const chaveDia = d => 'mais:' + d;
  const tentMax = () => CA.ehPremium() ? TENT_PREMIUM : TENT_GRATIS;
  const diaInfo = () => CA.ler('mais:dia:' + hoje(), { tent: 0, melhor: null });

  // ranking (top 10 + tua posição) numa caixa
  function caixaRanking(cx, chave, titulo, regra) {
    const conta = CA.conta && CA.conta();
    if (!CA.verRanking) { cx.hidden = true; return Promise.resolve(null); }
    cx.innerHTML = `<div class="cab-ranking"><strong>${titulo}</strong></div><p class="vazio">Carregando...</p>`;
    return CA.verRanking(chave).then(d => {
      if (!cx.isConnected) return d;
      cx.innerHTML = `
        <div class="cab-ranking"><strong>${titulo}</strong><span>${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</span></div>
        <p class="sub-ranking regra-ranking">${regra}</p>
        ${d.top.length ? `<ol class="lista-ranking">${d.top.slice(0, 10).map(CA.linhaDia).join('')}</ol>` : '<p class="vazio">Ninguém ainda. Bora ser o 1º?</p>'}
        ${d.meu && d.meu.pos > 10 ? `<p class="reticencias">···</p><ol class="lista-ranking">${CA.linhaDia(d.meu)}</ol>` : ''}
        ${conta ? '' : '<p class="vazio">Entra com teu e-mail (e teu @, se quiser) pra aparecer aqui.</p>'}`;
      return d;
    }).catch(() => {
      if (cx.isConnected) cx.innerHTML = `<div class="cab-ranking"><strong>${titulo}</strong></div><p class="vazio">O ranking não carregou agora. Tenta de novo daqui a pouco.</p>`;
      return null;
    });
  }

  // ---------- card na página inicial ----------
  CA.cardMais = function () {
    const rec = recorde(), s = sequencia(), info = diaInfo();
    const fogo = s.viva && s.dias ? `<span class="mm-fogo ${s.jogouHoje ? '' : 'apagando'}">🔥 ${s.dias}</span>` : '';
    const sub = s.viva && s.dias && !s.jogouHoje ? `Joga hoje pra não perder teus ${s.dias} ${s.dias === 1 ? 'dia' : 'dias'} seguidos!`
      : rec ? `Teu recorde: <b>${rec}</b>. Duvido tu passar!` : 'Os desafios do canal misturados, sem fim. Até onde tu aguenta?';
    return `<a class="card-mais" href="#/mais">
      <span class="dia-fita">Novo!</span>${fogo}
      <strong>🔁 Só mais uma</strong>
      <small>${sub}</small>
      <span class="mm-card-rodape"><span class="btn">Jogar</span><em>${info.tent ? 'Desafio do dia: feito ✓' : 'Desafio do dia te esperando'}</em></span></a>`;
  };

  // ---------- telas ----------
  CA.jogos.mais = {
    nome: 'Só mais uma',
    iniciar(palco, p) {
      let vivo = true, parar = null;
      const fechar = () => { if (parar) { try { parar(); } catch (e) {} parar = null; } };
      if (p.de && CA.virarAmigo) CA.virarAmigo(p.de);

      if (p.d) jogarDia();
      else if (p.s != null) partida(+p.s >>> 0, { modo: 'amigo', amigo: p.v != null && isFinite(+p.v) ? +p.v : null });
      else if (p.jogar) partida(CA.novaSemente(), { modo: 'treino' });
      else hub();

      // início do jogo: botão grande, recorde, 🔥, missões, desafio do dia, canetas e rankings
      function hub() {
        fechar();
        const rec = recorde(), s = sequencia(), info = diaInfo(), est = CA.ler('mais:estrelas', 0), cn = caneta();
        const ms = estadoMissoes(), max = tentMax(), resta = Math.max(0, max - info.tent);
        const semana = Array.from({ length: 7 }, (_, i) => {
          const dd = new Date(Date.parse(hoje() + 'T12:00:00Z') - (6 - i) * 864e5).toISOString().slice(0, 10);
          const acesa = s.ult && s.dias && diasEntre(dd, s.ult) >= 0 && diasEntre(dd, s.ult) < s.dias && (s.viva || s.jogouHoje);
          return `<i class="${acesa ? 'acesa' : ''} ${dd === hoje() ? 'hoje' : ''}" title="${CA.fmtData(dd)}">${acesa ? '🔥' : '·'}</i>`;
        }).join('');
        palco.innerHTML = '';
        palco.appendChild(CA.el(`
          <section class="mm-hub" style="--pena:${cn.hex}">
            <div class="barra-topo"><a class="voltar" href="#/" aria-label="Todos os jogos">‹</a><a class="som loja-btn" href="../loja.html">Loja</a></div>
            <h1 class="mm-titulo">Só mais uma</h1>
            <p class="mm-sub">Os desafios do canal misturados e sem fim. Acertou, ganha tempo. Errou, perde. Até onde tu aguenta?</p>

            <div class="mm-placar">
              <div><small>Teu recorde</small><b>${rec || '–'}</b></div>
              <div class="${s.viva || s.jogouHoje ? '' : 'apagado'}"><small>Dias seguidos</small><b>🔥 ${s.perdida ? 0 : (s.dias || 0)}</b></div>
              <div><small>Estrelas</small><b>⭐ ${est}</b></div>
            </div>
            <div class="mm-semana" aria-label="Últimos 7 dias">${semana}</div>
            ${s.emRisco ? '<p class="mm-aviso">🛡️ Teu protetor Premium vai salvar tua sequência se tu jogar hoje!</p>'
              : s.viva && !s.jogouHoje && s.dias ? `<p class="mm-aviso">Joga hoje pra não perder teus 🔥 ${s.dias} dias!</p>` : ''}

            <a class="btn btn-grande mm-jogar" href="#/mais?jogar=1">${rec ? 'Jogar · bater ' + rec : 'Jogar agora'}</a>

            <div class="dia mm-dia" style="--cor:#d62828">
              <span class="dia-fita">Desafio do dia · ${CA.fmtData(hoje())}</span>
              <strong>A mesma partida pra todo mundo</strong>
              <small>${info.tent ? `Teu melhor hoje: <b>${info.melhor}</b> acertos.` : 'Vale o ranking de hoje.'} ${resta ? `Tu tem <b>${resta} ${resta === 1 ? 'tentativa' : 'tentativas'}</b>.` : 'Acabaram tuas tentativas de hoje.'}</small>
              ${resta ? '<a class="btn" href="#/mais?d=1">Jogar o desafio do dia</a>'
                : CA.ehPremium() ? '<span class="btn btn-claro" aria-disabled="true">Volta amanhã 😉</span>'
                : '<a class="btn btn-ouro" href="#/premium">+2 tentativas por dia no Premium</a>'}
            </div>

            <h2 class="secao">Missões de hoje</h2>
            <ol class="mm-missoes">${ms.map(m => `<li class="${m.feita ? 'feita' : ''}"><span>${m.feita ? '✅' : '⭐'}</span><b>${m.txt}</b><em>${m.feita ? 'feita' : m.val + '/' + m.alvo}</em></li>`).join('')}</ol>
            <p class="mm-dica">Cada missão dá 1 ⭐. As 3 no mesmo dia dão +2. Amanhã tem missões novas.</p>

            <h2 class="secao">Tuas canetas</h2>
            <div class="mm-canetas">${CANETAS.map(c => {
              const livre = canetaLivre(c);
              return `<button class="mm-caneta ${c.id === cn.id ? 'usando' : ''} ${livre ? '' : 'trancada'}" data-c="${c.id}" style="--c:${c.hex}" ${livre ? '' : 'aria-disabled="true"'}>
                <i></i><b>${c.nome}</b><small>${c.id === cn.id ? 'usando' : livre ? 'usar' : c.premium ? '★ Premium ou ' + c.custo + ' ⭐' : c.custo + ' ⭐'}</small></button>`;
            }).join('')}</div>

            <a class="podio mm-rank-dia" href="#/mais"></a>
            <a class="podio mm-rank-rec" href="#/mais"></a>
            ${CA.ehPremium() ? '' : `<a class="chamada-premium" href="#/premium"><strong>ca<span class="r-marca">R</span>deno Premium</strong><span>3 tentativas no desafio do dia, segunda chance em toda partida, protetor dos teus dias seguidos e a caneta dourada. Também libera todos os níveis dos outros jogos.</span></a>`}
            <h2 class="secao">Os outros jogos</h2>
            ${CA.cardsJogos ? CA.cardsJogos(null) : ''}
          </section>`));
        palco.querySelectorAll('.mm-caneta').forEach(b => b.addEventListener('click', () => {
          const c = CANETAS.find(x => x.id === b.dataset.c);
          if (!canetaLivre(c)) { CA.aviso(c.premium ? 'A dourada vem com o Premium ou com 40 ⭐' : `Faltam ${c.custo - CA.ler('mais:estrelas', 0)} ⭐ pra essa`); return; }
          CA.gravar('mais:caneta', c.id); CA.som('certo'); hub();
        }));
        caixaRanking(palco.querySelector('.mm-rank-dia'), chaveDia(hoje()), 'Ranking do desafio de hoje', 'Mais acertos no desafio do dia (a mesma partida pra todos)');
        caixaRanking(palco.querySelector('.mm-rank-rec'), 'mais:rec', 'Recordes de todos os tempos', 'O melhor de cada um em qualquer partida');
      }

      function jogarDia() {
        const info = diaInfo();
        if (info.tent >= tentMax()) { location.replace('#/mais'); return; }
        if (CA.pedirCadastro && CA.pedirCadastro(true)) return; // ranking do dia precisa de conta
        partida(CA.sementeDoDia('mais'), { modo: 'dia' });
      }

      // ---------- a partida ----------
      function partida(semente, ctx) {
        fechar();
        let raf = 0, ativo = true;
        parar = () => { ativo = false; cancelAnimationFrame(raf); };
        const rec = recorde(), cn = caneta();
        const meta = ctx.amigo != null ? ctx.amigo : rec;
        palco.innerHTML = '';
        const tela = CA.el(`
          <section class="jogo mm-jogo" style="--pena:${cn.hex}">
            <div class="barra">
              <a class="voltar" href="#/mais" aria-label="Sair">‹</a>
              <div class="pontos"><b>0</b><small>${ctx.amigo != null ? ' / amigo ' + ctx.amigo : rec ? ' / recorde ' + rec : ''}</small></div>
              <div class="relogio">${T0} s</div>
            </div>
            <div class="tempo"><i></i></div>
            <div class="mm-meta"><span class="mm-vel">Velocidade 1</span><span class="mm-falta"></span></div>
            <div class="mm-trilha"><i class="mm-eu"></i>${meta ? '<i class="mm-fantasma" title="teu recorde"></i>' : ''}</div>
            <p class="mm-rotulo"></p>
            <div class="cartao-palavra mm-cartao"><div class="mm-area"></div><small class="combo"></small></div>
            <div class="mm-botoes"></div>
          </section>`);
        palco.appendChild(tela);
        const $ = s => tela.querySelector(s);
        const elPts = $('.pontos b'), elRel = $('.relogio'), elBarra = $('.tempo i'), elArea = $('.mm-area'), elBot = $('.mm-botoes');
        const elRot = $('.mm-rotulo'), elCombo = $('.combo'), elVel = $('.mm-vel'), elFalta = $('.mm-falta'), elEu = $('.mm-eu'), elFant = $('.mm-fantasma');
        let i = 0, acertos = 0, erros = 0, seq = 0, melhorSeq = 0, vel = 1, porTipo = {}, tipoAtual = null, certo = null;
        let fim = 0, pausa = 0, inicio = 0, segunda = false, avisouRec = false, blocos = [];

        const escala = () => Math.max(meta || 0, acertos, 10) * 1.15;
        function trilha() {
          elEu.style.left = Math.min(100, acertos / escala() * 100) + '%';
          if (elFant) elFant.style.left = Math.min(100, meta / escala() * 100) + '%';
          if (meta && acertos < meta) elFalta.textContent = `faltam ${meta - acertos} pra ${ctx.amigo != null ? 'passar teu amigo' : 'bater teu recorde'}`;
          else if (meta && acertos >= meta) elFalta.textContent = ctx.amigo != null ? 'passou teu amigo! 🏆' : 'recorde novo! 🔥';
          else elFalta.textContent = '';
        }

        // banner entre blocos: "Agora: Fala a cor" (o relógio para enquanto aparece)
        function banner(t, ehNovo) {
          return new Promise(res => {
            pausa = performance.now();
            const b = CA.el(`<div class="mm-banner ${ehNovo ? 'novo' : ''}"><small>${ehNovo ? 'Desafio novo!' : 'Agora'}</small><b>${t.icone} ${t.nome}</b><span>${t.dica}</span></div>`);
            tela.appendChild(b);
            setTimeout(() => {
              b.classList.add('sai');
              setTimeout(() => { b.remove(); fim += performance.now() - pausa; pausa = 0; res(); }, 160);
            }, ehNovo ? 1700 : 1000);
          });
        }

        async function proxima() {
          if (!ativo) return;
          const b = Math.floor(i / BLOCO);
          if (i % BLOCO === 0) {
            while (blocos.length <= b) blocos.push(tipoDoBloco(semente, blocos.length, blocos.length ? blocos[blocos.length - 1].id : null));
            const tb = blocos[b];
            tipoAtual = tb.id;
            certo = null;
            elBot.innerHTML = '';
            elArea.innerHTML = '';
            await banner(TIPOS[tipoAtual], tb.novo);
            if (!ativo) return;
          }
          const d = nivelDe(i), t = TIPOS[tipoAtual];
          if (d > vel) { vel = d; elVel.textContent = 'Velocidade ' + vel; elVel.classList.remove('sobe'); void elVel.offsetWidth; elVel.classList.add('sobe'); }
          const q = t.gerar(CA.rng((semente + i * 2654435761) >>> 0), d);
          elRot.innerHTML = t.dica;
          elArea.innerHTML = q.html;
          elBot.innerHTML = q.botoes;
          elArea.classList.remove('entra'); void elArea.offsetWidth; elArea.classList.add('entra');
          certo = q.certo;
          const bs = elArea.querySelector('.mm-bolas.some');
          if (bs) setTimeout(() => bs.classList.add('foi'), 1400);
        }

        elBot.addEventListener('pointerdown', e => {
          const btn = e.target.closest('[data-v]');
          if (!btn || certo == null || pausa) return;
          e.preventDefault();
          if (btn.dataset.v === certo) {
            acertos++; seq++; melhorSeq = Math.max(melhorSeq, seq);
            porTipo[tipoAtual] = (porTipo[tipoAtual] || 0) + 1;
            fim = Math.min(performance.now() + TMAX * 1000, fim + bonus(i) * 1000);
            elPts.textContent = acertos; CA.som('certo');
            elCombo.textContent = seq >= 5 ? seq + ' seguidos! 🔥' : '';
            btn.classList.add('acertou');
            if (meta && !avisouRec && acertos === meta + 1) { avisouRec = true; CA.som('recorde'); tela.classList.add('passou'); setTimeout(() => tela.classList.remove('passou'), 900); }
          } else {
            erros++; seq = 0; elCombo.textContent = '';
            fim -= MULTA * 1000; CA.som('errado'); CA.vibrar(80);
            tela.classList.remove('erro'); void tela.offsetWidth; tela.classList.add('erro');
          }
          trilha();
          certo = null; i++;
          proxima();
        });

        function tick() {
          if (!ativo) return;
          const agora = pausa || performance.now();
          const resta = Math.max(0, (fim - agora) / 1000);
          elRel.textContent = Math.ceil(resta) + ' s';
          elBarra.style.width = Math.min(100, resta / TMAX * 100) + '%';
          elBarra.classList.toggle('pouco', resta < 3);
          if (resta <= 0 && !pausa) { acabou(); return; }
          raf = requestAnimationFrame(tick);
        }

        function acabou() {
          certo = null;
          elArea.innerHTML = '<div class="mm-palavra">TEMPO!</div>';
          elBot.innerHTML = '';
          // segunda chance: Premium, 1 vez por partida (no desafio do dia também)
          if (!segunda && CA.ehPremium()) {
            segunda = true;
            pausa = performance.now();
            const o = CA.el(`<div class="mm-banner mm-chance"><small>★ Premium</small><b>Segunda chance?</b><span>Ganha +5 segundos e continua de onde parou</span>
              <button class="btn" data-a="sim">Continuar</button><button class="link-voltar" data-a="nao" type="button">Não, ver resultado</button></div>`);
            tela.appendChild(o);
            o.addEventListener('click', ev => {
              const a = ev.target.closest('[data-a]'); if (!a) return;
              o.remove();
              if (a.dataset.a === 'sim') { fim = performance.now() + 5000; pausa = 0; i = Math.ceil(i / BLOCO) * BLOCO; raf = requestAnimationFrame(tick); proxima(); }
              else terminar();
            });
            return;
          }
          terminar();
        }

        function terminar() {
          cancelAnimationFrame(raf);
          ativo = false;
          const dur = Math.round((performance.now() - inicio) / 100) / 10;
          setTimeout(() => { if (vivo) resultado(semente, ctx, { acertos, erros, melhorSeq, vel, porTipo, dur, recAntes: rec, dia: ctx.modo === 'dia' }); }, 700);
        }

        (async () => {
          elArea.innerHTML = '<div class="mm-palavra">...</div>';
          trilha();
          await CA.contagem(tela);
          if (!ativo) return;
          inicio = performance.now();
          fim = inicio + T0 * 1000;
          raf = requestAnimationFrame(tick);
          proxima();
        })();
      }

      // ---------- resultado ----------
      function resultado(semente, ctx, res) {
        fechar();
        const d = hoje();
        const bateu = res.acertos > res.recAntes;
        if (bateu) CA.gravar('mais:rec', res.acertos);
        const s = marcarDia();
        const mis = contarMissoes(res);
        let tent = 0, diaMelhor = null;
        if (ctx.modo === 'dia') {
          const info = diaInfo();
          tent = info.tent + 1;
          diaMelhor = Math.max(info.melhor || 0, res.acertos);
          CA.gravar('mais:dia:' + d, { tent, melhor: diaMelhor });
          if (CA.enviarRecorde) CA.enviarRecorde(chaveDia(d), Math.max(5, res.dur), tent, { acertos: res.acertos });
        }
        if (CA.enviarRecorde && res.acertos > 0) CA.enviarRecorde('mais:rec', Math.max(5, res.dur), null, { acertos: res.acertos });
        const cn = caneta();
        const falta = res.recAntes - res.acertos;
        const meuId = CA.perfil && (CA.perfil() || {}).id_publico;
        const titulo = ctx.modo === 'dia' ? `Desafio do dia · ${CA.fmtData(d)}` : ctx.modo === 'amigo' ? 'Duelo com amigo' : 'Só mais uma';
        const card = {
          jogo: 'Só mais uma', linha1: ctx.modo === 'dia' ? 'Desafio do dia · ' + CA.fmtData(d) : `Velocidade ${res.vel} · ${res.melhorSeq} seguidos`,
          valor: String(res.acertos), estrelas: null, cor: cn.hex,
          linha3: `Duvido tu passar de ${res.acertos}!`, comoJoga: 'Acerta o máximo antes do tempo acabar',
          tentativa: ctx.modo === 'dia' && CA.naTentativa ? CA.naTentativa(tent) : '',
        };
        palco.innerHTML = '';
        const tela = CA.resultado({
          titulo,
          valorTxt: res.acertos + (res.acertos === 1 ? ' acerto' : ' acertos'),
          detalhe: `Velocidade ${res.vel} · melhor sequência: ${res.melhorSeq} · ${res.erros} ${res.erros === 1 ? 'erro' : 'erros'}`,
          recorde: { antigo: res.recAntes || null, bateu },
          recordeTxt: Math.max(res.recAntes, res.acertos) ? `${Math.max(res.recAntes, res.acertos)} acertos` : '',
          amigo: ctx.amigo != null ? { valorTxt: ctx.amigo + ' acertos', ganhou: res.acertos > ctx.amigo } : null,
          desafio: {
            texto: `Fiz ${res.acertos} acertos no Só mais uma 🔁 Duvido tu passar!`,
            url: CA.linkDesafio('mais', { s: semente, v: res.acertos, ...(meuId ? { de: meuId } : {}) }),
          },
          card,
          voltaConta: '#/mais',
          linkVoltar: { href: '#/mais', txt: 'Missões, canetas e ranking' },
          jogarDeNovo: () => { location.hash = '#/mais?jogar=1&r=' + Date.now().toString(36); },
        });
        palco.appendChild(tela);
        // "Só mais uma" vem primeiro, grande e amarelo: é o botão mais importante da tela
        const denovo = tela.querySelector('[data-a=denovo]');
        if (denovo) { denovo.classList.remove('btn-claro'); denovo.classList.add('mm-denovo'); denovo.textContent = 'Só mais uma ▶'; tela.querySelector('.acoes').prepend(denovo); }
        const desafiar = tela.querySelector('[data-a=desafiar]'); if (desafiar) desafiar.classList.add('btn-claro');
        const folha = tela.querySelector('.folha');
        const extra = [];
        if (!bateu && falta > 0 && falta <= 5) extra.push(`<p class="mm-quase">Faltou <b>${falta}</b> pro teu recorde! 😱</p>`);
        if (s.subiu) extra.push(`<p class="mm-fogo-res">🔥 <b>${s.dias} ${s.dias === 1 ? 'dia' : 'dias'} seguidos</b>${s.usouProt ? ' · teu protetor 🛡️ salvou a sequência' : s.dias === 1 ? ' · volta amanhã pra chama crescer' : ''}</p>`);
        if (mis.novas.length) extra.push(`<div class="mm-missao-ok">${mis.novas.map(m => `<p>✅ Missão feita: ${m.txt} <b>+1 ⭐</b></p>`).join('')}${mis.todas ? '<p>🎉 As 3 missões de hoje! <b>+2 ⭐</b></p>' : ''}</div>`);
        if (ctx.modo === 'dia') {
          const resta = tentMax() - tent;
          extra.push(`<p class="mm-tent">${resta > 0 ? `Tu ainda tem ${resta} ${resta === 1 ? 'tentativa' : 'tentativas'} no desafio de hoje.` : CA.ehPremium() ? 'Acabaram as tentativas de hoje. Amanhã tem outro!' : 'Essa era tua tentativa de hoje. <a href="#/premium">No Premium são 3 por dia</a>.'}</p>`);
        }
        if (extra.length && folha) folha.insertAdjacentHTML('beforeend', extra.join(''));
        if (ctx.modo === 'dia' && folha) {
          const cx = CA.el('<a class="podio res-ranking" href="#/mais"></a>');
          folha.after(cx);
          if (CA.conta && CA.conta()) setTimeout(() => caixaRanking(cx, chaveDia(d), 'Ranking de hoje', 'Mais acertos no desafio do dia').then(r => { if (r && r.meu) card.ranking = { pos: r.meu.pos, txt: 'LUGAR HOJE' }; }), 1200);
          else cx.remove();
        }
        if (bateu && res.recAntes) CA.vibrar([60, 40, 60]);
      }

      return () => { vivo = false; fechar(); };
    },
  };
})();
