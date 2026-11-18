/* Caça-números (era "Acha do 1 ao 25"), em níveis.
   O jogo é sempre o mesmo (tocar na ordem o mais rápido possível), mas a cada nível a grade
   cresce: 9, 12, 16, 20, 25, 30, 36, 42, 49, 56, 64 números. Quando o tamanho repete, entra uma
   regra nova (de trás pra frente, girados, letras, embaralha, piscam...). Níveis 1 a 3 grátis,
   do 4 ao 30 caRdeno Premium. Cada nível dá de 1 a 3 estrelas pelo tempo.

   Rotas:
     #/fase?f=4                 joga o nível 4 (se liberado)
     #/fase?f=7&s=123&v=21.4    desafio de amigo: mesmo nível e mesma grade (abre mesmo sem Premium)
     #/acha?d=...               link antigo do desafio do dia: vai pro #/dia (dia.js) */
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
  const NOME = 'Caça-números';
  CA.NOME_ACHA = NOME;

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

  // [quantos números, colunas da grade, regras, nome]
  // A cada nível a grade cresce (9, 12, 16, 20, 25... até 64 números) e as regras novas
  // entram quando o tamanho repete. Os 3 grátis são o aquecimento; do 4 em diante esquenta.
  const F = [
    // ---- 3 níveis grátis ----
    [9, 3, [], 'Aquecimento'],
    [12, 3, [], 'Esquentando'],
    [16, 4, [], 'Agora vai'],
    // ---- daqui pra frente, Premium ----
    [20, 4, [], 'Vinte'],
    [25, 5, [], 'Igual ao vídeo'],
    [25, 5, ['reverso'], 'Contagem regressiva'],
    [25, 5, ['letras'], 'ABC'],
    [30, 5, [], 'Trinta'],
    [30, 5, ['giro'], 'Tonteira'],
    [30, 5, ['embaralha'], 'Mudou tudo!'],
    [36, 6, [], 'Grade grande'],
    [36, 6, ['pares'], 'Ímpar não vale'],
    [36, 6, ['espelho'], 'No espelho'],
    [36, 6, ['piscam'], 'Pisca-pisca'],
    [42, 6, [], 'Quarenta e dois'],
    [42, 6, ['reverso'], 'Regressiva 2'],
    [42, 6, ['cores'], 'Arco-íris do mal'],
    [42, 6, ['giro'], 'Tonteira 2'],
    [49, 7, [], 'Gigante'],
    [49, 7, ['embaralha'], 'Terremoto'],
    [49, 7, ['pares'], 'Pares gigantes'],
    [49, 7, ['giro', 'reverso'], 'Cambalhota'],
    [49, 7, ['piscam'], 'Apagão'],
    [56, 7, [], 'Cinquenta e seis'],
    [56, 7, ['espelho'], 'Espelho gigante'],
    [56, 7, ['giro', 'embaralha'], 'Liquidificador'],
    [56, 7, ['cores', 'reverso'], 'Arco-íris ao contrário'],
    [64, 8, [], 'Sessenta e quatro'],
    [64, 8, ['piscam', 'giro'], 'Pisca e gira'],
    [64, 8, ['giro', 'embaralha', 'piscam'], 'Nível final'],
  ];
  // tempo pra 3 estrelas: cresce com a quantidade de números e com cada regra
  const PESO = { reverso: 1.1, letras: 1.2, giro: 1.25, espelho: 1.3, cores: 1.3, embaralha: 1.35, piscam: 1.45, pares: 1.3 };
  function tempos(q, regras) {
    const alvos = regras.includes('pares') ? q / 2 : q;
    let a3 = alvos * (0.52 + q / 200);
    regras.forEach(r => { a3 *= PESO[r] || 1; });
    a3 = Math.ceil(a3);
    return [a3, Math.ceil(a3 * 1.55)];
  }
  const FASES = F.map(([q, c, regras, nome], i) => {
    const [a3, a2] = tempos(q, regras);
    return { num: i + 1, q, c, l: Math.ceil(q / c), regras, a3, a2, nome, premium: i >= GRATIS };
  });
  CA.FASES = FASES;
  CA.FASES_GRATIS = GRATIS;

  const descFase = f => (f.regras.includes('letras') ? `De A a ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[f.q - 1]}` : f.regras.includes('pares') ? `Só os pares, do 2 ao ${f.q - f.q % 2}` : `Do 1 ao ${f.q}`)
    + (f.regras.filter(r => r !== 'letras' && r !== 'pares').length ? ' · ' + f.regras.filter(r => r !== 'letras' && r !== 'pares').map(r => REGRAS[r]).join(' + ') : '');
  const estrelasPor = (f, t) => t <= f.a3 ? 3 : t <= f.a2 ? 2 : 1;

  // ---------- progresso das fases (no celular) ----------
  // Desde 16/11/2026 os níveis crescem (9, 12, 16... números). O progresso antigo ('fases', tudo com 25+
  // números) não vale mais: o novo fica junto dos outros jogos, em 'niveis' com chave "acha:N".
  CA.progressoFases = () => { const t = CA.ler('niveis', {}), o = {}; for (const k in t) if (k.startsWith('acha:')) o[+k.slice(5)] = t[k]; return o; };
  function salvarFase(num, t, est) {
    const todos = CA.ler('niveis', {}), k = 'acha:' + num, a = todos[k];
    const n = ((a && a.n) || 0) + 1;            // quantas vezes já terminou esse nível
    const bateu = !a || !(a.t > 0) || t < a.t;
    todos[k] = { t: bateu ? t : a.t, e: Math.max(est, (a && a.e) || 0), n, r: bateu ? n : (a.r || null) };
    CA.gravar('niveis', todos);
    if (CA.sincronizar) CA.sincronizar(); // salva na conta, se tiver entrado
    if (CA.funilNivel) CA.funilNivel('acha', num);
    return n;
  }
  // "de primeira", "na 3ª tentativa"
  const naTentativa = n => !n ? '' : n === 1 ? 'de primeira' : `na ${n}ª tentativa`;
  CA.naTentativa = naTentativa;
  // Liberado: nível 1, ou o anterior concluído; e Premium do 4 em diante.
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

  // ---------- motor do jogo ----------
  // cfg = { fase, semente, amigo, titulo, onFim(t, multa) }
  function jogar(palco, cfg, vivo) {
    const f = cfg.fase, n = f.c, R = new Set(f.regras);
    const r = CA.rng(cfg.semente);
    const total = f.q;
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
    const quadro = { n, l: f.l, nomes: nums.map(rotulo), cores: cores.map(c => c[0]), bordas: cores.map(c => c[1]),
      caminho: alvos.map(v => nums.indexOf(v)) };
    // com a regra de girar, todo número ganha um tracinho embaixo (como em dado e bola de bilhar), pra 6 e 9 não confundirem

    palco.innerHTML = '';
    const tela = CA.el(`
      <section class="jogo jogo-acha">
        <div class="barra">
          <a class="voltar" href="${cfg.voltar || '#/jogo?id=acha'}" aria-label="Sair">‹</a>
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
    } else {
      estrelas = estrelasPor(fase, t);
      rec = CA.recorde('nivel' + fase.num, t, true);
      tent = salvarFase(fase.num, t, estrelas);
      tentRec = (CA.progressoFases()[fase.num] || {}).r;
      const prox = FASES[fase.num];
      const dProx = duelo && duelo.tempos[prox ? prox.num : 0], tProx = dProx && dProx.t;
      if (prox && tProx) {
        // no duelo a próxima fase continua valendo contra o amigo
        const livre = !prox.premium || CA.ehPremium();
        proxima = { href: `#/fase?f=${prox.num}&s=${duelo.s}&dz=${duelo.dz}`,
          txt: livre ? `Próximo: nível ${prox.num} · teu amigo fez ${CA.fmtSeg(tProx)}` : `Nível ${prox.num} 🔒 Teu amigo fez ${CA.fmtSeg(tProx)}`, tranca: !livre };
      } else if (prox) {
        proxima = CA.faseLiberada(prox.num)
          ? { href: '#/fase?f=' + prox.num, txt: `Próximo: nível ${prox.num}` }
          : { href: '#/fase?f=' + prox.num, txt: `Nível ${prox.num} 🔒 Ver o que tem`, tranca: true };
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
    const envio = CA.enviarRecorde ? CA.enviarRecorde(ehDia ? 'dia:' + data : 'nivel:' + fase.num, t, tent) : Promise.resolve(false);
    let placar = null;
    if (duelo && amigo) {
      const pl = placarDuelo(duelo.s + duelo.dz, fase.num, t < amigo);
      const ultima = !Object.keys(duelo.tempos).some(f => +f > fase.num);
      placar = (ultima ? 'Fim do duelo! ' : 'Placar do duelo: ') + `tu ${pl.eu} x ${pl.ele} teu amigo`;
    }
    const dadosCard = {
        jogo: NOME,
        linha1: ehDia ? (ehHoje ? 'Desafio do dia · ' : 'Desafio de ') + CA.fmtData(data) : `Nível ${fase.num} · ${fase.nome}`,
        valor: txtT.replace(' s', 's'), estrelas, cor: '#1d4ed8', quadro, tentativa: naTentativa(tent),
        regra: fase.regras.length ? descFase(fase) : '',
        comoJoga: 'Toca os números em ordem, o mais rápido que tu conseguir',
    };
    palco.innerHTML = '';
    palco.appendChild(CA.resultado({
      titulo: ehDia ? (ehHoje ? 'Desafio do dia em' : 'Desafio de ' + CA.fmtData(data) + ' em') : `Nível ${fase.num} em`,
      valorTxt: txtT,
      estrelas,
      detalhe: `${tent === 1 ? 'De primeira! ' : `Tentativa nº ${tent}. `}` + (estrelas && estrelas < 3 ? `Pra 3 estrelas: até ${fase.a3} s. ` : '') + (multa ? `Contando ${multa} s de multa por toque errado.` : 'Sem errar nenhum! 👏'),
      recorde: rec,
      recordeTxt: melhor != null ? CA.fmtSeg(melhor) + (tentRec ? ' (' + naTentativa(tentRec) + ')' : '') : '',
      amigo: amigo ? { valorTxt: CA.fmtSeg(amigo) + (duelo ? ' nessa fase' : '') + (amigoTent ? ', ' + naTentativa(amigoTent) : ''), ganhou: t < amigo, placar } : null,
      proxima,
      desafio: {
        texto: ehDia
          ? `Fiz o desafio do dia do ${NOME} em ${txtT}, ${naTentativa(tent)} 😎 Duvido tu fazer mais rápido!`
          : `Passei ${nMinhas > 1 ? nMinhas + ' níveis' : 'o nível 1'} do ${NOME} 😎 Duvido tu bater meus tempos em todos!`,
        url: CA.linkDesafio(ehDia ? 'acha' : 'fase', linkParams),
      },
      card: dadosCard,
      voltaConta: ehDia ? '#/acha?d=' + data : '#/jogo?id=acha',
      jogarDeNovo: rejogar,
    }));
    if (ehDia) caixaRanking(palco, 'dia:' + data, '#/ranking?d=' + data, 'Ranking de hoje', envio, dadosCard);
    else if (fase.num <= GRATIS) caixaRanking(palco, 'nivel:' + fase.num, '#/ranking?aba=f' + fase.num, 'Ranking do nível ' + fase.num, envio, dadosCard);
    const res = palco.querySelector('.resultado');
    if (res && CA.cardsJogos) res.appendChild(CA.el(`<div class="outros-jogos"><h2 class="secao">Todos os jogos</h2>${CA.cardsJogos('acha')}</div>`));
  }

  // No resultado (desafio do dia e fases grátis): tua posição e o top 3, ou o convite pra entrar no ranking.
  function caixaRanking(palco, chave, href, titulo, envio, card) {
    const folha = palco.querySelector('.folha');
    if (!folha || !CA.verRanking) return;
    const cx = CA.el(`<a class="podio res-ranking mov-aparece" href="${href}" hidden></a>`);
    folha.after(cx);
    if (!(CA.conta && CA.conta())) {
      cx.innerHTML = `<div class="cab-ranking"><strong>${titulo}</strong></div><p class="vazio">Entra com teu e-mail pra aparecer no ranking (e com teu @, se quiser).</p><span class="ver-mais">Entrar e aparecer →</span>`;
      cx.href = '#/conta'; cx.hidden = false;
      return;
    }
    envio.then(() => CA.verRanking(chave)).then(d => {
      // a colocação vai pra arte dos stories
      if (d.meu && card) card.ranking = { pos: d.meu.pos, txt: chave.startsWith('dia:') ? 'LUGAR HOJE' : 'NO NÍVEL ' + chave.slice(6) };
      if (!cx.isConnected) return;
      cx.innerHTML = `
        <div class="cab-ranking"><strong>${d.meu ? 'Tu tá em ' + d.meu.pos + 'º lugar' : titulo}</strong><span>${d.total} ${d.total === 1 ? 'pessoa' : 'pessoas'}</span></div>
        <ol class="lista-ranking">${d.top.slice(0, 3).map(CA.linhaRanking).join('')}</ol>
        <span class="ver-mais">Ver ranking completo →</span>`;
      cx.hidden = false;
    }).catch(() => {});
  }

  function telaTrancada(palco, f, tAmigo) {
    if (CA.funil) CA.funil('chegou_no_limite', { jogo: 'acha', nivel: f.num, origem: 'travado' });
    palco.innerHTML = '';
    palco.appendChild(CA.el(`
      <section class="intro trancada">
        <a class="voltar" href="#/jogo?id=acha" aria-label="Voltar">‹</a>
        <span class="selo-premium">★ Premium</span>
        <h1>Nível ${f.num}: ${f.nome}</h1>
        <p class="regra-grande">${descFase(f)}</p>
        ${tAmigo ? `<p class="meta-amigo">Teu amigo passou esse nível em <b>${CA.fmtSeg(tAmigo)}</b>. Libera pra tentar bater ele!</p>` : ''}
        <p>Do nível 4 em diante a grade só cresce, até <b>64 números</b>, e ainda embaralha, gira, pisca, vira letra... São <b>${FASES.length - GRATIS} níveis novos</b>, até o nível final.</p>
        <div class="previa-fases">${FASES.slice(GRATIS, GRATIS + 6).map(x => `<span>${x.num}<small>${x.q} números${x.regras.length ? ' · ' + x.nome : ''}</small></span>`).join('')}</div>
        <a class="btn btn-grande" href="#/premium">Liberar todos os níveis · a partir de R$ 2,49/mês</a>
        <a class="link-voltar" href="#/jogo?id=acha">Voltar pros níveis</a>
      </section>`));
  }

  // #/fase
  CA.jogos.fase = {
    nome: NOME,
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
          titulo: `Nível ${f.num} · ${f.nome}`,
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

  // #/acha: links antigos. Com d (desafio do dia antigo) vai pro desafio do dia novo (dia.js); sem d cai nos níveis.
  CA.jogos.acha = {
    nome: NOME,
    iniciar(palco, p) {
      if (p.d) { location.replace('#/dia?d=' + p.d + (p.de ? '&de=' + p.de : '')); return null; }
      const alvo = p.n ? FASES.findIndex(x => x.q === (+p.n) * (+p.n) && !x.regras.length) + 1 : CA.proximaFase();
      location.hash = '#/fase?f=' + Math.max(1, alvo) + (p.s ? `&s=${p.s}&v=${p.v || ''}` : '');
      return null;
    },
  };

  CA.descFase = descFase;
  // pro desafio do dia (dia.js): joga um nível com a semente do dia e guarda no progresso normal
  CA.acha = { jogar, FASES, estrelasPor, salvarFase, descFase };

  // entra na lista de jogos (progresso em 'niveis', chaves "acha:N")
  CA.registrarJogo({
    id: 'acha', nome: NOME, icone: '🔢', cor: '#1d4ed8', total: FASES.length,
    desc: 'Toca os números em ordem, o mais rápido possível. A cada nível a grade cresce: começa com 9 e vai até 64.',
    nomeNivel: n => `Nível ${n}: ${FASES[n - 1].nome}`, href: n => '#/fase?f=' + n,
    prog: CA.progressoFases, liberado: CA.faseLiberada,
  });
})();
