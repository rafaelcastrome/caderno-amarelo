/* Acha do 1 ao 25, em fases.
   O jogo é sempre o mesmo (tocar na ordem o mais rápido possível), mas cada fase
   muda uma regra: tamanho da grade, números girados, de trás pra frente, só os pares,
   letras, grade que embaralha, números que piscam... As fases 1 a 6 são grátis,
   da 7 à 30 são do Caderno Premium. Cada fase dá de 1 a 3 estrelas pelo tempo.

   Rotas:
     #/fase?f=7                 joga a fase 7 (se liberada)
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
  const GRATIS = 6;

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
    [3, [], 5, 9, 'Aquecimento'],
    [4, [], 9, 15, 'Pegando o jeito'],
    [5, [], 16, 26, 'Igual ao vídeo'],
    [5, ['reverso'], 18, 28, 'Contagem regressiva'],
    [5, ['giro'], 20, 30, 'Tonteira'],
    [6, [], 26, 40, 'Grade grande'],
    // ---- daqui pra frente, Premium ----
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
    p[num] = { t: a ? Math.min(a.t, t) : t, e: Math.max(est, a ? a.e : 0) };
    CA.gravar('fases', p);
    if (CA.sincronizar) CA.sincronizar(); // salva na conta, se tiver entrado
  }
  // Liberada: fase 1, ou a anterior concluída; e Premium da 7 em diante.
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
    // com a regra de girar, todo número ganha um tracinho embaixo (como em dado e bola de bilhar), pra 6 e 9 não confundirem

    palco.innerHTML = '';
    const tela = CA.el(`
      <section class="jogo jogo-acha">
        <div class="barra">
          <a class="voltar" href="#/" aria-label="Sair">‹</a>
          <div class="alvo">Acha o <b>${rotulo(alvos[0])}</b></div>
          <div class="relogio">0,0 s</div>
        </div>
        <p class="meta-fase">${cfg.titulo}${f.regras.length ? ' · <b>' + descFase(f) + '</b>' : ''}</p>
        ${cfg.amigo ? `<p class="meta-amigo">Teu amigo fez <b>${CA.fmtSeg(cfg.amigo)}</b>. Bate ele!</p>` : ''}
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
          if (idx >= alvos.length) { parar(); cfg.onFim(Math.round(tempo() * 10) / 10, multa); return; }
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

  // ---------- telas ----------
  function telaResultado(palco, { fase, t, multa, semente, amigo, ehDia, ehHoje, data, rejogar }) {
    const txtT = CA.fmtSeg(t);
    let estrelas = null, proxima = null, rec;
    if (ehDia) {
      rec = CA.recorde('dia:' + data, t, true);
      if (ehHoje) CA.marcarDia('acha', txtT);
    } else {
      estrelas = estrelasPor(fase, t);
      rec = CA.recorde('fase' + fase.num, t, true);
      salvarFase(fase.num, t, estrelas);
      const prox = FASES[fase.num];
      if (prox) {
        proxima = CA.faseLiberada(prox.num)
          ? { href: '#/fase?f=' + prox.num, txt: `Próxima: fase ${prox.num}` }
          : { href: '#/fase?f=' + prox.num, txt: `Fase ${prox.num} 🔒 Ver o que tem`, tranca: true };
      }
    }
    const melhor = ehDia ? CA.ler('rec:dia:' + data, t) : (CA.progressoFases()[fase.num] || {}).t;
    const linkParams = ehDia ? { d: data, v: t } : { f: fase.num, s: semente, v: t };
    palco.innerHTML = '';
    palco.appendChild(CA.resultado({
      titulo: ehDia ? (ehHoje ? 'Desafio do dia em' : 'Desafio de ' + CA.fmtData(data) + ' em') : `Fase ${fase.num} em`,
      valorTxt: txtT,
      estrelas,
      detalhe: (estrelas && estrelas < 3 ? `Pra 3 estrelas: até ${fase.a3} s. ` : '') + (multa ? `Contando ${multa} s de multa por toque errado.` : 'Sem errar nenhum! 👏'),
      recorde: rec,
      recordeTxt: melhor != null ? CA.fmtSeg(melhor) : '',
      amigo: amigo ? { valorTxt: CA.fmtSeg(amigo), ganhou: t < amigo } : null,
      proxima,
      desafio: {
        texto: ehDia
          ? `Fiz o desafio do dia do Acha do 1 ao 25 em ${txtT} 😎 Duvido tu fazer mais rápido!`
          : `Passei a fase ${fase.num} do Acha do 1 ao 25 em ${txtT} 😎 Duvido tu fazer mais rápido!`,
        url: CA.linkDesafio(ehDia ? 'acha' : 'fase', linkParams),
      },
      card: {
        jogo: ehDia ? 'Desafio do dia' : `Fase ${fase.num}`,
        linha1: estrelas ? '★'.repeat(estrelas) + '☆'.repeat(3 - estrelas) : 'Acha do 1 ao 25 em',
        valor: txtT.replace(' s', 's'), cor: '#1d4ed8',
      },
      jogarDeNovo: rejogar,
    }));
  }

  function telaTrancada(palco, f) {
    palco.innerHTML = '';
    palco.appendChild(CA.el(`
      <section class="intro trancada">
        <a class="voltar" href="#/" aria-label="Voltar">‹</a>
        <span class="selo-premium">★ Premium</span>
        <h1>Fase ${f.num}: ${f.nome}</h1>
        <p class="regra-grande">${descFase(f)}</p>
        <p>Da fase 7 em diante o jogo fica difícil de verdade: a grade embaralha, os números giram, piscam, viram letras... São <b>24 fases novas</b>, até a fase final.</p>
        <div class="previa-fases">${FASES.slice(GRATIS, GRATIS + 6).map(x => `<span>${x.num}<small>${x.nome}</small></span>`).join('')}</div>
        <a class="btn btn-grande" href="#/premium">Liberar todas as fases · R$ 9,90</a>
        <a class="link-voltar" href="#/">Voltar pras fases</a>
      </section>`));
  }

  // #/fase
  CA.jogos.fase = {
    nome: 'Acha do 1 ao 25',
    iniciar(palco, p) {
      let ativo = true, parar = null;
      const vivo = () => ativo;
      const f = FASES[(+p.f || 1) - 1] || FASES[0];
      const amigo = p.v ? parseFloat(p.v) : null;
      const deAmigo = p.s != null;
      if (!deAmigo && !CA.faseLiberada(f.num)) {
        if (f.premium && !CA.ehPremium()) telaTrancada(palco, f);
        else location.hash = '#/fase?f=' + CA.proximaFase();
        return () => { ativo = false; };
      }
      const rodar = semente => {
        if (parar) parar();
        parar = jogar(palco, {
          fase: f, semente, amigo: deAmigo ? amigo : null,
          titulo: `Fase ${f.num} · ${f.nome}`,
          onFim: (t, multa) => setTimeout(() => {
            if (!ativo) return;
            telaResultado(palco, { fase: f, t, multa, semente, amigo: deAmigo ? amigo : null,
              rejogar: () => deAmigo ? (location.hash = '#/fase?f=' + f.num) : rodar(CA.novaSemente()) });
          }, 350),
        }, vivo);
      };
      rodar(deAmigo ? (+p.s >>> 0) : CA.novaSemente());
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
      const ehHoje = data === CA.hojeBR();
      const f = faseDoDia(data);
      const amigo = p.v ? parseFloat(p.v) : null;
      const rodar = () => {
        if (parar) parar();
        parar = jogar(palco, {
          fase: f, semente: CA.sementeDoDia('acha', data), amigo,
          titulo: ehHoje ? 'Desafio do dia' : 'Desafio de ' + CA.fmtData(data),
          onFim: (t, multa) => setTimeout(() => {
            if (!ativo) return;
            telaResultado(palco, { fase: f, t, multa, amigo, ehDia: true, ehHoje, data, rejogar: rodar });
          }, 350),
        }, vivo);
      };
      rodar();
      return () => { ativo = false; parar && parar(); };
    },
  };

  CA.descFase = descFase;
  CA.regraDoDia = data => descFase(faseDoDia(data));
})();
