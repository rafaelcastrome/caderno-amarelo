/* Acha do 1 ao 25, em fases.
   O jogo é sempre o mesmo (tocar na ordem o mais rápido possível), mas cada fase
   muda uma regra: tamanho da grade, números girados, de trás pra frente, só os pares,
   letras, grade que embaralha, números que piscam... As fases 1 a 6 são grátis,
   da 4 à 30 são do caRdeno Premium. Cada fase dá de 1 a 3 estrelas pelo tempo.

   Rotas:
     #/fase?f=4                 joga a fase 4 (se liberada)
     #/fase?f=7&s=123&v=21.4    desafio de amigo: mesma fase e mesma grade (abre mesmo sem Premium)
     #/acha?d=1 | d=AAAA-MM-DD  desafio do dia (5x5 com uma regra sorteada pelo dia) */
(function () {
  'use strict';
  const CA = window.CA;

  const CORES = [
    ['#fde2e4', '#d62828'], ['#dbeafe', '#1d4ed8'], ['#dcfce7', '#15803d'],
    ['#fef3c7', '#d97706'], ['#ede9fe', '#7c3aed'], ['#ffedd5', '#ea580c'],
    ['#e0f2fe', '#0369a1'], ['#fce7f3', '#be185d'],
  ];
  const TINTAS = ['#d62828', '#1d4ed8', '#15803d', '#d97706', '#7c3aed', '#be185d'];
  const PENALIDADE = 1;
  const GRATIS = 3;

  // O que cada regra faz, em palavras de quem joga.
  const REGRAS = {
    reverso: 'De trás pra frente',
    giro: 'Números girados',
    espelho: 'Números no espelho',
    embaralha: 'A grade embaralha a cada 5 acertos',
    piscam: 'Os números piscam',
    pares: 'Só os pares, em ordem',
    letras: 'Letras de A a Z',
    cores: 'Cores que confundem',
  };

  // [tamanho, regras, segundos pra 3 estrelas, segundos pra 2 estrelas, nome]
  const F = [
    // ---- 3 fases grátis (já de verdade: cada uma tem ranking) ----
    [5, [], 16, 26, 'Igual ao vídeo'],
    [5, ['reverso'], 18, 28, 'Contagem regressiva'],
    [6, [], 26, 40, 'Grade grande'],
    // ---- daqui pra frente, Premium ----
    [5, ['giro'], 20, 30, 'Tonteira'],
    [5, ['embaralha'], 22, 34, 'Mudou tudo!'],
    [5, ['letras'], 20, 30, 'ABC'],
    [6, ['pares'], 18, 28, 'Só os pares'],
    [5, ['espelho'], 22, 32, 'No espelho'],
    [6, ['giro'], 32, 46, 'Tonteira 2'],
    [5, ['piscam'], 24, 36, 'Pisca-pisca'],
    [6, ['reverso'], 32, 46, 'Regressiva 2'],
    [6, ['embaralha'], 34, 50, 'Bagunça'],
    [7, [], 42, 62, 'Gigante'],
    [5, ['giro', 'embaralha'], 26, 38, 'Furacão'],
    [6, ['cores'], 30, 44, 'Arco-íris do mal'],
    [7, ['pares'], 30, 44, 'Pares gigantes'],
    [6, ['piscam'], 36, 52, 'Pisca-pisca 2'],
    [7, ['reverso'], 44, 64, 'Regressiva gigante'],
    [5, ['letras', 'reverso'], 22, 34, 'ZYX'],
    [6, ['giro', 'reverso'], 36, 52, 'Cambalhota'],
    [7, ['giro'], 48, 70, 'Tonteira gigante'],
    [6, ['embaralha', 'giro'], 38, 56, 'Liquidificador'],
    [7, ['embaralha'], 48, 70, 'Terremoto'],
    [6, ['piscam', 'giro'], 40, 58, 'Pisca e gira'],
    [7, ['espelho'], 50, 72, 'Espelho gigante'],
    [7, ['piscam'], 50, 72, 'Apagão'],
    [7, ['embaralha', 'giro'], 54, 78, 'Caos'],
    [6, ['letras', 'giro'], 34, 50, 'ABC tonto'],
    [7, ['cores', 'reverso'], 50, 72, 'Arco-íris ao contrário'],
    [7, ['giro', 'embaralha', 'piscam'], 60, 88, 'Fase final'],
  ];
  const FASES = F.map(([n, regras, a3, a2, nome], i) => ({ num: i + 1, n, regras, a3, a2, nome, premium: i >= GRATIS }));
  CA.FASES = FASES;
  CA.FASES_GRATIS = GRATIS;

  const descFase = f => f.regras.length ? f.regras.map(r => REGRAS[r]).join(' + ') : `Do 1 ao ${f.n * f.n}`;
  const estrelasPor = (f, t) => t <= f.a3 ? 3 : t <= f.a2 ? 2 : 1;

  // ---------- progresso das fases (no celular) ----------
  CA.progressoFases = () => CA.ler('fases', {});
  function salvarFase(num, t, est) {
    const p = CA.progressoFases();
    const a = p[num];
    const n = ((a && a.n) || 0) + 1;            // quantas vezes já terminou essa fase
    const bateu = !a || t < a.t;
    p[num] = { t: bateu ? t : a.t, e: Math.max(est, a ? a.e : 0), n, r: bateu ? n : (a.r || null) };
    CA.gravar('fases', p);
    if (CA.sincronizar) CA.sincronizar(); // salva na conta, se tiver entrado
    return n;
  }
  // "de primeira", "na 3ª tentativa"
  const naTentativa = n => !n ? '' : n === 1 ? 'de primeira' : `na ${n}ª tentativa`;
  CA.naTentativa = naTentativa;
  // Liberada: fase 1, ou a anterior concluída; e Premium da 4 em diante.
  CA.faseLiberada = function (num) {
    const f = FASES[num - 1];
    if (!f) return false;
    if (f.premium && !CA.ehPremium()) return false;
    return num === 1 || !!CA.progressoFases()[num - 1];
  };
  CA.estrelasTotais = () => Object.values(CA.progressoFases()).reduce((s, x) => s + (x.e || 0), 0);
  CA.proximaFase = function () {
    const p = CA.progressoFases();
    for (const f of FASES) if (!p[f.num]) return f.num;
    return FASES.length;
  };

  // Desafio do dia: 5x5 com uma regra (ou nenhuma) sorteada pela data.
  function faseDoDia(data) {
    const r = CA.rng(CA.sementeDoDia('acha-regra', data));
    const opcoes = [[], ['reverso'], ['giro'], ['embaralha'], ['letras'], ['espelho'], ['piscam'], ['cores']];
    return { num: 0, n: 5, regras: r.pick(opcoes), a3: 20, a2: 32, nome: 'Desafio do dia' };
  }

  // ---------- motor do jogo ----------
  // cfg = { fase, semente, amigo, titulo, onFim(t, multa) }
  function jogar(palco, cfg, vivo) {
    const f = cfg.fase, n = f.n, R = new Set(f.regras);
    const r = CA.rng(cfg.semente);
    const total = n * n;
    const nums = r.shuffle(Array.from({ length: total }, (_, i) => i + 1));
    let alvos = Array.from({ length: total }, (_, i) => i + 1);
    if (R.has('pares')) alvos = alvos.filter(v => v % 2 === 0);
    if (R.has('reverso')) alvos.reverse();
    const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const rotulo = v => R.has('letras') ? ABC[v - 1] : String(v);
    const cores = nums.map(() => r.pick(CORES));
    const giro = nums.map(() => (r() * 6 - 3).toFixed(1));
    const giroTxt = nums.map(() => R.has('giro') ? r.pick([90, 180, 270, 45, 135, 225, 315]) : 0);
    const tinta = nums.map(() => R.has('cores') ? r.pick(TINTAS) : '');
    // desenho da grade pro card dos stories: o caminho da caneta passa pelos números na ordem tocada
    const quadro = { n, nomes: nums.map(rotulo), cores: cores.map(c => c[0]), bordas: cores.map(c => c[1]),
      caminho: alvos.map(v => nums.indexOf(v)) };
    // com a regra de girar, todo número ganha um tracinho embaixo (como em dado e bola de bilhar), pra 6 e 9 não confundirem

    palco.innerHTML = '';
    const tela = CA.el(`
      <section class="jogo jogo-acha">
        <div class="barra">
          <a class="voltar" href="#/jogo?id=acha" aria-label="Sair">‹</a>
          <div class="alvo">Acha o <b>${rotulo(alvos[0])}</b></div>
          <div class="relogio">0,0 s</div>
        </div>
        <p class="meta-fase">${cfg.titulo}${f.regras.length ? ' · <b>' + descFase(f) + '</b>' : ''}</p>
        ${cfg.amigo ? `<p class="meta-amigo">Teu amigo fez <b>${CA.fmtSeg(cfg.amigo)}</b>${cfg.amigoTent ? ' ' + CA.naTentativa(cfg.amigoTent) : ''}. Bate ele!</p>` : ''}
        <div class="grade ${R.has('espelho') ? 'espelho' : ''}" style="--n:${n}">
          ${nums.map((v, i) => {
            const lab = rotulo(v);
            const sub = R.has('giro') ? ' sub' : '';
            return `<button class="cel" data-v="${v}" style="--fundo:${cores[i][0]};--borda:${cores[i][1]};--giro:${giro[i]}deg">` +
              `<span class="txt${sub}" style="--rot:${giroTxt[i]}deg${tinta[i] ? ';color:' + tinta[i] : ''}">${lab}</span></button>`;
          }).join('')}
        </div>
      </section>`);
    palco.appendChild(tela);
    const elAlvo = tela.querySelector('.alvo b');
    const elRel = tela.querySelector('.relogio');
    const grade = tela.querySelector('.grade');
    grade.classList.add('tampada');

    let raf = 0, pisca = 0;
    const parar = () => { cancelAnimationFrame(raf); clearInterval(pisca); };

    CA.contagem(tela).then(() => {
      if (!vivo()) return;
      grade.classList.remove('tampada');
      let idx = 0, multa = 0;
      const t0 = performance.now();
      const tempo = () => (performance.now() - t0) / 1000 + multa;
      (function tick() {
        if (!vivo()) { parar(); return; }
        elRel.textContent = CA.fmtSeg(tempo());
        raf = requestAnimationFrame(tick);
      })();
      if (R.has('piscam')) {
        pisca = setInterval(() => {
          if (!vivo()) { parar(); return; }
          grade.classList.add('apagada');
          setTimeout(() => grade.classList.remove('apagada'), 700);
        }, 2600);
      }

      grade.addEventListener('pointerdown', e => {
        const c = e.target.closest('.cel');
        if (!c || c.classList.contains('feito') || !vivo()) return;
        if (+c.dataset.v === alvos[idx]) {
          c.classList.add('feito');
          CA.som('certo');
          idx++;
          if (idx >= alvos.length) { parar(); cfg.onFim(Math.round(tempo() * 10) / 10, multa, quadro); return; }
          elAlvo.textContent = rotulo(alvos[idx]);
          elAlvo.parentElement.classList.remove('pula'); void elAlvo.offsetWidth; elAlvo.parentElement.classList.add('pula');
          if (R.has('embaralha') && idx % 5 === 0) embaralhar();
        } else {
          multa += PENALIDADE;
          CA.som('errado'); CA.vibrar(80);
          c.classList.remove('treme'); void c.offsetWidth; c.classList.add('treme');
          const m = CA.el('<span class="multa">+1 s</span>');
          c.appendChild(m); setTimeout(() => m.remove(), 700);
        }
      });

      function embaralhar() {
        grade.classList.add('mexendo');
        r.shuffle(Array.from(grade.children)).forEach(c => grade.appendChild(c));
        setTimeout(() => grade.classList.remove('mexendo'), 300);
      }
    });
    return parar;
  }

  // ---------- duelo com amigo ----------
  // O link leva o tempo do desafiante em cada fase que ele passou; o amigo joga fase por fase
  // contra esses tempos, com a mesma grade (semente) em cada fase, e o placar vai somando.
  const codDuelo = tempos => Object.keys(tempos).sort((a, b) => a - b).map(f => f + '-' + Math.round(tempos[f].t * 10) + (tempos[f].r ? '-' + tempos[f].r : '')).join('.');
  function lerDuelo(dz) {
    const o = {};
    String(dz || '').split('.').forEach(x => { const [f, t, r] = x.split('-'); if (+f > 0 && +f <= FASES.length && +t > 0) o[+f] = { t: +t / 10, r: +r || null }; });
    return o;
  }
  const sementeDuelo = (s, f) => ((+s >>> 0) ^ Math.imul(f, 2654435761)) >>> 0;
  function placarDuelo(id, f, ganhou) {
    let pl = CA.ler('duelo', null);
    if (!pl || pl.id !== id) pl = { id, r: {} };
    if (f != null) { pl.r[f] = ganhou; CA.gravar('duelo', pl); }
    const v = Object.values(pl.r);
    return { eu: v.filter(Boolean).length, ele: v.filter(x => !x).length };
  }

  // ---------- telas ----------
  function telaResultado(palco, { fase, t, multa, quadro, semente, amigo, amigoTent, duelo, ehDia, ehHoje, data, rejogar }) {
    const txtT = CA.fmtSeg(t);
    let estrelas = null, proxima = null, rec, tent, tentRec;
    if (ehDia) {
      tent = CA.ler('tent:dia:' + data, 0) + 1;
      CA.gravar('tent:dia:' + data, tent);
      rec = CA.recorde('dia:' + data, t, true);
      if (rec.bateu) CA.gravar('tentrec:dia:' + data, tent);
      tentRec = CA.ler('tentrec:dia:' + data, null);
      if (ehHoje) CA.marcarDia('acha', txtT);
    } else {
      estrelas = estrelasPor(fase, t);
      rec = CA.recorde('fase' + fase.num, t, true);
      tent = salvarFase(fase.num, t, estrelas);
      tentRec = (CA.progressoFases()[fase.num] || {}).r;
      const prox = FASES[fase.num];
      const dProx = duelo && duelo.tempos[prox ? prox.num : 0], tProx = dProx && dProx.t;
      if (prox && tProx) {
        // no duelo a próxima fase continua valendo contra o amigo
        const livre = !prox.premium || CA.ehPremium();
        proxima = { href: `#/fase?f=${prox.num}&s=${duelo.s}&dz=${duelo.dz}`,
          txt: livre ? `Próxima: fase ${prox.num} · teu amigo fez ${CA.fmtSeg(tProx)}` : `Fase ${prox.num} 🔒 Teu amigo fez ${CA.fmtSeg(tProx)}`, tranca: !livre };
      } else if (prox) {
        proxima = CA.faseLiberada(prox.num)
          ? { href: '#/fase?f=' + prox.num, txt: `Próxima: fase ${prox.num}` }
          : { href: '#/fase?f=' + prox.num, txt: `Fase ${prox.num} 🔒 Ver o que tem`, tranca: true };
      }
    }
    const melhor = ehDia ? CA.ler('rec:dia:' + data, t) : (CA.progressoFases()[fase.num] || {}).t;
    // o desafio leva os tempos de TODAS as fases que a pessoa já passou (começa da fase 1)
    const meus = {};
    if (!ehDia) Object.entries(CA.progressoFases()).forEach(([f, x]) => { if (x && x.t) meus[f] = { t: x.t, r: x.r }; });
    const nMinhas = Object.keys(meus).length;
    const linkParams = ehDia ? { d: data, v: t, r: tent } : { f: 1, s: CA.novaSemente(), dz: codDuelo(meus) };
    // quem abrir o link vira amigo no ranking
    const meuId = CA.perfil && (CA.perfil() || {}).id_publico;
    if (meuId) linkParams.de = meuId;
    const envio = CA.enviarRecorde ? CA.enviarRecorde(ehDia ? 'dia:' + data : 'fase:' + fase.num, t, tent) : Promise.resolve(false);
    let placar = null;
    if (duelo && amigo) {
      const pl = placarDuelo(duelo.s + duelo.dz, fase.num, t < amigo);
      const ultima = !Object.keys(duelo.tempos).some(f => +f > fase.num);
      placar = (ultima ? 'Fim do duelo! ' : 'Placar do duelo: ') + `tu ${pl.eu} x ${pl.ele} teu amigo`;
    }
    const dadosCard = {
        jogo: 'Acha do 1 ao 25',
        linha1: ehDia ? (ehHoje ? 'Desafio do dia · ' : 'Desafio de ') + CA.fmtData(data) : `Fase ${fase.num} · ${fase.nome}`,
        valor: txtT.replace(' s', 's'), estrelas, cor: '#1d4ed8', quadro, tentativa: naTentativa(tent),
        regra: fase.regras.length ? descFase(fase) : '',
        comoJoga: 'Toca os números em ordem, o mais rápido que tu conseguir',
    };
    palco.innerHTML = '';
    palco.appendChild(CA.resultado({
      titulo: ehDia ? (ehHoje ? 'Desafio do dia em' : 'Desafio de ' + CA.fmtData(data) + ' em') : `Fase ${fase.num} em`,
      valorTxt: txtT,
      estrelas,
      detalhe: `${tent === 1 ? 'De primeira! ' : `Tentativa nº ${tent}. `}` + (estrelas && estrelas < 3 ? `Pra 3 estrelas: até ${fase.a3} s. ` : '') + (multa ? `Contando ${multa} s de multa por toque errado.` : 'Sem errar nenhum! 👏'),
      recorde: rec,
      recordeTxt: melhor != null ? CA.fmtSeg(melhor) + (tentRec ? ' (' + naTentativa(tentRec) + ')' : '') : '',
      amigo: amigo ? { valorTxt: CA.fmtSeg(amigo) + (duelo ? ' nessa fase' : '') + (amigoTent ? ', ' + naTentativa(amigoTent) : ''), ganhou: t < amigo, placar } : null,
      proxima,
      desafio: {
        texto: ehDia
          ? `Fiz o desafio do dia do Acha do 1 ao 25 em ${txtT}, ${naTentativa(tent)} 😎 Duvido tu fazer mais rápido!`
          : `Passei ${nMinhas > 1 ? nMinhas + ' fases' : 'a fase 1'} do Acha do 1 ao 25 😎 Duvido tu bater meus tempos em todas!`,
        url: CA.linkDesafio(ehDia ? 'acha' : 'fase', linkParams),
      },
      card: dadosCard,
      voltaConta: ehDia ? '#/acha?d=' + data : '#/jogo?id=acha',
      jogarDeNovo: rejogar,
    }));
    if (ehDia) caixaRanking(palco, 'dia:' + data, '#/ranking?d=' + data, 'Ranking de hoje', envio, dadosCard);
    else if (fase.num <= GRATIS) caixaRanking(palco, 'fase:' + fase.num, '#/ranking?aba=f' + fase.num, 'Ranking da fase ' + fase.num, envio, dadosCard);
    const res = palco.querySelector('.resultado');
    if (res && CA.cardsJogos) res.appendChild(CA.el(`<div class="outros-jogos"><h2 class="secao">Todos os jogos</h2>${CA.cardsJogos('acha')}</div>`));
  }

  // No resultado (desafio do dia e fases grátis): tua posição e o top 3, ou o convite pra entrar no ranking.
  function caixaRanking(palco, chave, href, titulo, envio, card) {
    const folha = palco.querySelector('.folha');
    if (!folha || !CA.verRanking) return;
    const cx = CA.el(`<a class="podio res-ranking" href="${href}" hidden></a>`);
    folha.after(cx);
    if (!(CA.conta && CA.conta())) {
      cx.innerHTML = `<div class="cab-ranking"><strong>${titulo}</strong></div><p class="vazio">Entra com teu e-mail pra aparecer no ranking (e com teu @, se quiser).</p><span class="ver-mais">Entrar e aparecer →</span>`;
      cx.href = '#/conta'; cx.hidden = false;
      return;
    }
    envio.then(() => CA.verRanking(chave)).then(d => {
      // a colocação vai pra arte dos stories
      if (d.meu && card) card.ranking = { pos: d.meu.pos, txt: chave.startsWith('dia:') ? 'LUGAR HOJE' : 'NA FASE ' + chave.slice(5) };
      if (!cx.isConnected) return;
      cx.innerHTML = `
        <div class="cab-ranking"><strong>${d.meu ? 'Tu tá em ' + d.meu.pos + 'º lugar' : titulo}</strong><span>${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</span></div>
        <ol class="lista-ranking">${d.top.slice(0, 3).map(CA.linhaRanking).join('')}</ol>
        <span class="ver-mais">Ver ranking completo →</span>`;
      cx.hidden = false;
    }).catch(() => {});
  }

  function telaTrancada(palco, f, tAmigo) {
    palco.innerHTML = '';
    palco.appendChild(CA.el(`
      <section class="intro trancada">
        <a class="voltar" href="#/jogo?id=acha" aria-label="Voltar">‹</a>
        <span class="selo-premium">★ Premium</span>
        <h1>Fase ${f.num}: ${f.nome}</h1>
        <p class="regra-grande">${descFase(f)}</p>
        ${tAmigo ? `<p class="meta-amigo">Teu amigo passou essa fase em <b>${CA.fmtSeg(tAmigo)}</b>. Libera pra tentar bater ele!</p>` : ''}
        <p>Da fase 4 em diante o jogo fica difícil de verdade: a grade embaralha, os números giram, piscam, viram letras... São <b>${FASES.length - GRATIS} fases novas</b>, até a fase final.</p>
        <div class="previa-fases">${FASES.slice(GRATIS, GRATIS + 6).map(x => `<span>${x.num}<small>${x.nome}</small></span>`).join('')}</div>
        <a class="btn btn-grande" href="#/premium">Liberar todas as fases · a partir de R$ 2,49/mês</a>
        <a class="link-voltar" href="#/jogo?id=acha">Voltar pras fases</a>
      </section>`));
  }

  // #/fase
  CA.jogos.fase = {
    nome: 'Acha do 1 ao 25',
    iniciar(palco, p) {
      let ativo = true, parar = null;
      const vivo = () => ativo;
      const f = FASES[(+p.f || 1) - 1] || FASES[0];
      const duelo = p.dz ? { s: +p.s >>> 0, dz: p.dz, tempos: lerDuelo(p.dz) } : null;
      if (p.de && CA.virarAmigo) CA.virarAmigo(p.de);
      const dAmigo = duelo && duelo.tempos[f.num];
      const amigo = duelo ? (dAmigo ? dAmigo.t : null) : (p.v ? parseFloat(p.v) : null);
      const amigoTent = dAmigo ? dAmigo.r : (+p.r || null);
      const deAmigo = p.s != null;
      if (duelo && f.premium && !CA.ehPremium()) { telaTrancada(palco, f, amigo); return () => { ativo = false; }; }
      if (!deAmigo && !CA.faseLiberada(f.num)) {
        if (f.premium && !CA.ehPremium()) telaTrancada(palco, f);
        else location.hash = '#/fase?f=' + CA.proximaFase();
        return () => { ativo = false; };
      }
      const rodar = semente => {
        if (parar) parar();
        parar = jogar(palco, {
          fase: f, semente, amigo: deAmigo ? amigo : null, amigoTent,
          titulo: `Fase ${f.num} · ${f.nome}`,
          onFim: (t, multa, quadro) => setTimeout(() => {
            if (!ativo) return;
            telaResultado(palco, { fase: f, t, multa, quadro, semente, amigo: deAmigo ? amigo : null, amigoTent, duelo,
              rejogar: () => duelo ? rodar(semente) : deAmigo ? (location.hash = '#/fase?f=' + f.num) : rodar(CA.novaSemente()) });
          }, 350),
        }, vivo);
      };
      rodar(duelo ? sementeDuelo(duelo.s, f.num) : deAmigo ? (+p.s >>> 0) : CA.novaSemente());
      return () => { ativo = false; parar && parar(); };
    },
  };

  // #/acha: desafio do dia. Links antigos sem d caem nas fases.
  CA.jogos.acha = {
    nome: 'Acha do 1 ao 25',
    iniciar(palco, p) {
      let ativo = true, parar = null;
      const vivo = () => ativo;
      if (!p.d) {
        const alvo = p.n ? FASES.findIndex(x => x.n === +p.n && !x.regras.length) + 1 : CA.proximaFase();
        location.hash = '#/fase?f=' + Math.max(1, alvo) + (p.s ? `&s=${p.s}&v=${p.v || ''}` : '');
        return null;
      }
      const data = CA.dataDoDesafio(p);
      if (data === false) return null;
      if (p.de && CA.virarAmigo) CA.virarAmigo(p.de);
      const ehHoje = data === CA.hojeBR();
      const f = faseDoDia(data);
      const amigo = p.v ? parseFloat(p.v) : null;
      // antes de jogar: tela do desafio com a regra, o vídeo do Instagram e o ranking do dia
      const telaDia = () => {
        const meu = CA.ler('rec:dia:' + data, null);
        const conta = CA.conta && CA.conta();
        palco.innerHTML = '';
        palco.appendChild(CA.el(`
          <section class="intro intro-dia">
            <div class="barra-topo"><a class="voltar" href="#/" aria-label="Voltar">‹</a>
              <span class="nivel-tag">${ehHoje ? 'Desafio do dia · ' + CA.fmtData(data) : 'Desafio de ' + CA.fmtData(data)}</span></div>
            <h1>Acha do 1 ao 25</h1>
            <p class="regra-grande">${descFase(f)}</p>
            <ul class="regras-nivel">
              <li>Toca os números <b>em ordem</b>, o mais rápido que tu conseguir</li>
              <li>A <b>mesma grade pra todo mundo</b> ${ehHoje ? 'hoje' : 'nesse dia'}: o ranking é justo</li>
              <li>Tocou errado, ganha 1 segundo de multa</li>
            </ul>
            ${amigo ? `<p class="meta-amigo">Teu amigo fez <b>${CA.fmtSeg(amigo)}</b>. Bate ele!</p>` : ''}
            ${meu != null ? `<p class="placar-estrelas">Teu melhor ${ehHoje ? 'hoje' : ''}: ${CA.fmtSeg(meu)}</p>` : ''}
            <button class="btn btn-grande" data-a="ir">${meu != null ? 'Jogar de novo e bater meu tempo' : 'Começar o desafio'}</button>
            <a class="podio rank-dia" href="#/ranking?${ehHoje ? 'aba=hoje' : 'd=' + data}">
              <div class="cab-ranking"><strong>Ranking ${ehHoje ? 'de hoje' : 'de ' + CA.fmtData(data)}</strong></div><p class="vazio">Carregando...</p></a>
            ${CA.reelsHtml('acha', 'Como é o jogo 👇 (vídeo do nosso Instagram)')}
          </section>`));
        palco.querySelector('[data-a=ir]').addEventListener('click', rodar);
        const cx = palco.querySelector('.rank-dia');
        if (!CA.verRanking) { cx.hidden = true; return; }
        CA.verRanking('dia:' + data).then(d => {
          if (!ativo || !cx.isConnected) return;
          cx.innerHTML = `
            <div class="cab-ranking"><strong>Ranking ${ehHoje ? 'de hoje' : 'de ' + CA.fmtData(data)}</strong><span>${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</span></div>
            ${d.top.length ? `<ol class="lista-ranking">${d.top.slice(0, 10).map(CA.linhaRanking).join('')}</ol>` : '<p class="vazio">Ninguém jogou ainda. Bora ser o 1º?</p>'}
            ${d.meu && d.meu.pos > 10 ? `<p class="reticencias">···</p><ol class="lista-ranking">${CA.linhaRanking(d.meu)}</ol>` : ''}
            ${conta ? '' : '<p class="vazio">Entra com teu e-mail (e teu @, se quiser) pra aparecer aqui.</p>'}
            <span class="ver-mais">Ver ranking completo e dos amigos →</span>`;
        }).catch(() => { if (cx.isConnected) cx.innerHTML = '<div class="cab-ranking"><strong>Ranking de hoje</strong></div><p class="vazio">Sem internet agora. O ranking volta quando a conexão voltar.</p>'; });
      };
      const rodar = () => {
        if (CA.pedirCadastro && CA.pedirCadastro()) return; // jogador novo cria a conta antes
        if (parar) parar();
        parar = jogar(palco, {
          fase: f, semente: CA.sementeDoDia('acha', data), amigo, amigoTent: +p.r || null,
          titulo: ehHoje ? 'Desafio do dia' : 'Desafio de ' + CA.fmtData(data),
          onFim: (t, multa, quadro) => setTimeout(() => {
            if (!ativo) return;
            telaResultado(palco, { fase: f, t, multa, quadro, amigo, amigoTent: +p.r || null, ehDia: true, ehHoje, data, rejogar: rodar });
          }, 350),
        }, vivo);
      };
      telaDia();
      return () => { ativo = false; parar && parar(); };
    },
  };

  CA.descFase = descFase;
  CA.regraDoDia = data => descFase(faseDoDia(data));

  // entra na lista de jogos (progresso fica em 'fases', que já existia antes dos outros jogos)
  CA.registrarJogo({
    id: 'acha', nome: 'Acha do 1 ao 25', icone: '🔢', cor: '#1d4ed8', total: FASES.length,
    desc: 'Toca os números em ordem, o mais rápido possível. Cada fase tem uma regra nova.',
    nomeNivel: n => `Fase ${n}: ${FASES[n - 1].nome}`, href: n => '#/fase?f=' + n,
    prog: CA.progressoFases, liberado: CA.faseLiberada,
    extraFim: () => CA.arquivoDias ? CA.arquivoDias() : '',
    extraTopo: () => {
      const feito = CA.ler('dia:' + CA.hojeBR(), null);
      return `<a class="dia" href="#/acha?d=1"><span class="dia-fita">Desafio do dia</span>
        <strong>${CA.regraDoDia(CA.hojeBR())}</strong>
        <small>${feito ? 'Tu fez ' + feito.txt + ' hoje. Tenta bater!' : 'A mesma grade pra todo mundo hoje, com ranking.'}</small>
        <span class="btn">Jogar o desafio do dia</span></a>`;
    },
  });
})();
