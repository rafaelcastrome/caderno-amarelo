/* Acha do 1 ao N: toca nos números em ordem o mais rápido possível.
   Grade e cores sorteadas a cada partida (ou pela semente do link do amigo). */
(function () {
  'use strict';
  const CA = window.CA;

  const CORES = [
    ['#fde2e4', '#d62828'], ['#dbeafe', '#1d4ed8'], ['#dcfce7', '#15803d'],
    ['#fef3c7', '#d97706'], ['#ede9fe', '#7c3aed'], ['#ffedd5', '#ea580c'],
    ['#e0f2fe', '#0369a1'], ['#fce7f3', '#be185d'],
  ];
  const NIVEIS = [
    { n: 3, nome: 'Aquecimento', desc: '1 ao 9' },
    { n: 4, nome: 'Fácil', desc: '1 ao 16' },
    { n: 5, nome: 'Igual ao vídeo', desc: '1 ao 25' },
    { n: 6, nome: 'Difícil', desc: '1 ao 36' },
  ];
  const PENALIDADE = 1; // segundos por toque errado

  CA.jogos.acha = {
    nome: 'Acha do 1 ao 25',
    desc: 'Toca nos números em ordem. Quanto tempo tu leva?',
    cor: '#1d4ed8',
    icone: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="4" width="40" height="40" rx="6" fill="#dbeafe" stroke="#1f1f24" stroke-width="3"/><path d="M17 4v40M31 4v40M4 17h40M4 31h40" stroke="#1f1f24" stroke-width="2.5"/><text x="10.5" y="15" font-size="10" font-weight="700" font-family="Caveat,cursive" fill="#d62828">1</text><text x="36" y="42" font-size="10" font-weight="700" font-family="Caveat,cursive" fill="#1d4ed8">9</text><text x="21" y="28" font-size="10" font-weight="700" font-family="Caveat,cursive" fill="#15803d">5</text></svg>',
    recordeTxt: () => {
      const r = CA.ler('rec:acha5', null);
      return r == null ? '' : CA.fmtSeg(r) + ' (1 ao 25)';
    },
    iniciar(palco, p) {
      let vivo = true, raf = 0;
      const doDia = p.d === '1';
      const amigo = p.v ? parseFloat(p.v) : null;
      const fixo = p.s != null;

      if (doDia) jogar(5, CA.sementeDoDia('acha'));
      else if (fixo) jogar(clampN(+p.n || 5), +p.s >>> 0);
      else escolherNivel();

      function clampN(n) { return Math.min(6, Math.max(3, n)); }

      function escolherNivel() {
        palco.innerHTML = '';
        const ult = CA.ler('acha:nivel', 5);
        palco.appendChild(CA.el(`
          <section class="intro">
            <a class="voltar" href="#/" aria-label="Voltar">‹</a>
            <h1>Acha do 1 ao 25</h1>
            <p>Toca nos números <b>em ordem</b>, do 1 até o último, o mais rápido que tu conseguir. Errou, perde 1 segundo.</p>
            <div class="niveis">
              ${NIVEIS.map(nv => {
                const r = CA.ler('rec:acha' + nv.n, null);
                return `<button class="nivel ${nv.n === ult ? 'atual' : ''}" data-n="${nv.n}">
                  <strong>${nv.n}x${nv.n}</strong><span>${nv.nome}</span><small>${nv.desc}${r != null ? ' · recorde ' + CA.fmtSeg(r) : ''}</small>
                </button>`;
              }).join('')}
            </div>
          </section>`));
        palco.querySelectorAll('.nivel').forEach(b => b.addEventListener('click', () => {
          const n = +b.dataset.n;
          CA.gravar('acha:nivel', n);
          jogar(n, CA.novaSemente());
        }));
      }

      async function jogar(n, semente) {
        const r = CA.rng(semente);
        const total = n * n;
        const nums = r.shuffle(Array.from({ length: total }, (_, i) => i + 1));
        const cores = nums.map(() => r.pick(CORES));
        const giro = nums.map(() => (r() * 6 - 3).toFixed(1));

        palco.innerHTML = '';
        const tela = CA.el(`
          <section class="jogo jogo-acha">
            <div class="barra">
              <a class="voltar" href="#/" aria-label="Sair">‹</a>
              <div class="alvo">Acha o <b>1</b></div>
              <div class="relogio">0,0 s</div>
            </div>
            ${amigo ? `<p class="meta-amigo">Teu amigo fez <b>${CA.fmtSeg(amigo)}</b>. Bate ele!</p>` : ''}
            ${doDia ? '<p class="meta-amigo">Desafio do dia: a mesma grade pra todo mundo hoje</p>' : ''}
            <div class="grade" style="--n:${n}">
              ${nums.map((v, i) => `<button class="cel" data-v="${v}" style="--fundo:${cores[i][0]};--borda:${cores[i][1]};--giro:${giro[i]}deg">${v}</button>`).join('')}
            </div>
          </section>`);
        palco.appendChild(tela);
        const elAlvo = tela.querySelector('.alvo b');
        const elRel = tela.querySelector('.relogio');
        const grade = tela.querySelector('.grade');
        grade.classList.add('tampada');

        await CA.contagem(tela);
        if (!vivo) return;
        grade.classList.remove('tampada');

        let prox = 1, multa = 0;
        const t0 = performance.now();
        const tempo = () => (performance.now() - t0) / 1000 + multa;
        (function tick() {
          if (!vivo) return;
          elRel.textContent = CA.fmtSeg(tempo());
          raf = requestAnimationFrame(tick);
        })();

        grade.addEventListener('pointerdown', e => {
          const c = e.target.closest('.cel');
          if (!c || c.classList.contains('feito')) return;
          if (+c.dataset.v === prox) {
            c.classList.add('feito');
            CA.som('certo');
            prox++;
            if (prox > total) { terminar(); return; }
            elAlvo.textContent = prox;
            elAlvo.parentElement.classList.remove('pula'); void elAlvo.offsetWidth; elAlvo.parentElement.classList.add('pula');
          } else {
            multa += PENALIDADE;
            CA.som('errado'); CA.vibrar(80);
            c.classList.remove('treme'); void c.offsetWidth; c.classList.add('treme');
            const m = CA.el('<span class="multa">+1 s</span>');
            c.appendChild(m); setTimeout(() => m.remove(), 700);
          }
        });

        function terminar() {
          cancelAnimationFrame(raf);
          const t = Math.round(tempo() * 10) / 10;
          const rec = CA.recorde('acha' + n, t, true);
          const txtT = CA.fmtSeg(t);
          if (n === 5) CA.marcarDia('acha', txtT);
          const recAtual = CA.ler('rec:acha' + n, t);
          setTimeout(() => {
            if (!vivo) return;
            palco.innerHTML = '';
            palco.appendChild(CA.resultado({
              titulo: `Achou do 1 ao ${total} em`,
              valorTxt: txtT,
              detalhe: multa ? `Contando ${multa} s de multa por toque errado` : 'Sem errar nenhum! 👏',
              recorde: rec,
              recordeTxt: CA.fmtSeg(recAtual),
              amigo: amigo ? { valorTxt: CA.fmtSeg(amigo), ganhou: t < amigo } : null,
              desafio: {
                texto: `Achei do 1 ao ${total} em ${txtT} 😎 Duvido tu fazer mais rápido!`,
                url: CA.linkDesafio('acha', { s: semente, n, v: t }),
              },
              card: { jogo: 'Acha do 1 ao ' + total, linha1: 'Eu achei todos em', valor: txtT.replace(' s', 's'), cor: '#1d4ed8' },
              jogarDeNovo: () => (fixo || doDia) ? (location.hash = '#/acha') : jogar(n, CA.novaSemente()),
            }));
          }, 350);
        }
      }

      return () => { vivo = false; cancelAnimationFrame(raf); };
    },
  };
})();
