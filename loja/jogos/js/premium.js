/* Conta e Caderno Premium.
   Conta: entra com e-mail + código de 6 números que chega no e-mail (sem senha).
   Premium: R$ 9,90, pagamento único no Pix da loja, preso ao E-MAIL da conta,
   então vale em qualquer celular. O progresso das fases também fica salvo na conta. */
(function () {
  'use strict';
  const CA = window.CA;
  const CFG = window.LOJA_CONFIG || {};
  const API = CFG.supabaseUrl ? CFG.supabaseUrl + '/functions/v1' : null;
  const PRODUTO = 'caderno-premium';
  const PRECO = 'R$ 9,90'; // só pra mostrar; o valor cobrado vem sempre do banco

  async function chamar(fn, corpo) {
    if (!API) throw new Error('Sem conexão com a loja agora.');
    let r;
    try {
      r = await fetch(`${API}/${fn}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: CFG.supabaseAnonKey, Authorization: `Bearer ${CFG.supabaseAnonKey}` },
        body: JSON.stringify(corpo),
      });
    } catch (e) { throw new Error('Sem internet? Tenta de novo.'); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const er = new Error(j.erro || 'Não deu certo agora. Tenta de novo em instantes.'); er.status = r.status; throw er; }
    return j;
  }

  // ---------- conta ----------
  CA.conta = () => CA.ler('conta', null);              // { email, token, premium }
  CA.ehPremium = () => !!(CA.conta() || {}).premium;
  function guardarConta(d) {
    CA.gravar('conta', { email: d.email, token: d.token || (CA.conta() || {}).token, premium: !!d.premium });
    if (d.progresso) CA.gravar('fases', d.progresso);
    if (d.premium) { try { localStorage.setItem('desafios:jogo', JSON.stringify({ isPremium: true })); } catch (e) {} }
  }
  CA.sairConta = async function () {
    const c = CA.conta();
    if (c) chamar('jogo-conta', { token: c.token, sair: true }).catch(() => {});
    CA.gravar('conta', null);
  };
  // Atualiza Premium e progresso com o servidor (ao abrir o app e depois de cada fase).
  let enviando = null;
  CA.sincronizar = function () {
    const c = CA.conta();
    if (!c || !c.token) return Promise.resolve();
    if (enviando) return enviando;
    enviando = chamar('jogo-conta', { token: c.token, progresso: CA.ler('fases', {}) })
      .then(d => guardarConta(d))
      .catch(e => { if (e.status === 401) CA.gravar('conta', null); })
      .finally(() => { enviando = null; });
    return enviando;
  };

  // Formulário de entrar (usado no Premium e na tela de conta). onPronto(conta) quando entra.
  function formEntrar(alvo, { titulo, texto, onPronto }) {
    alvo.innerHTML = `
      <div class="caixa-conta">
        <strong>${titulo}</strong>
        <small>${texto}</small>
        <form class="f-email">
          <label for="email-conta">Teu e-mail</label>
          <input id="email-conta" type="email" required autocomplete="email" placeholder="nome@email.com">
          <button class="btn btn-grande" type="submit">Mandar código pro e-mail</button>
          <p class="erro-form" role="alert" hidden></p>
        </form>
        <form class="f-codigo" hidden>
          <label for="codigo-conta">Código de 6 números que chegou no e-mail</label>
          <input id="codigo-conta" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required placeholder="000000">
          <button class="btn btn-grande" type="submit">Entrar</button>
          <button class="link-voltar" type="button" data-a="outro">Usar outro e-mail</button>
          <p class="erro-form" role="alert" hidden></p>
          <p class="nota">Não chegou? Olha no spam ou nas promoções.</p>
        </form>
      </div>`;
    const fE = alvo.querySelector('.f-email'), fC = alvo.querySelector('.f-codigo');
    let email = '';
    const erro = (f, m) => { const p = f.querySelector('.erro-form'); p.textContent = m; p.hidden = !m; };
    fE.addEventListener('submit', async e => {
      e.preventDefault(); erro(fE, '');
      const b = fE.querySelector('button'); b.disabled = true; b.textContent = 'Mandando...';
      email = fE.querySelector('input').value.trim().toLowerCase();
      try {
        await chamar('jogo-codigo', { email });
        fE.hidden = true; fC.hidden = false;
        fC.querySelector('input').focus();
        CA.aviso('Código enviado pra ' + email);
      } catch (x) { erro(fE, x.message); }
      b.disabled = false; b.textContent = 'Mandar código pro e-mail';
    });
    fC.addEventListener('submit', async e => {
      e.preventDefault(); erro(fC, '');
      const b = fC.querySelector('button[type=submit]'); b.disabled = true; b.textContent = 'Entrando...';
      try {
        const d = await chamar('jogo-entrar', { email, codigo: fC.querySelector('input').value.trim(), progresso: CA.ler('fases', {}) });
        guardarConta(d);
        onPronto(CA.conta());
      } catch (x) { erro(fC, x.message); b.disabled = false; b.textContent = 'Entrar'; }
    });
    fC.querySelector('[data-a=outro]').addEventListener('click', () => { fC.hidden = true; fE.hidden = false; });
  }

  const BENEFICIOS = [
    ['Todas as 30 fases', 'Da fase 7 à fase final: grade que embaralha, números girados, letras, pisca-pisca, 7x7...'],
    ['Desafios dos dias anteriores', 'Perdeu um desafio do dia? Joga qualquer um dos últimos 30 dias'],
    ['Card dourado', 'Teu resultado com moldura dourada e selo Premium pros stories'],
    ['66 Desafios liberados', 'Os enigmas e pegadinhas do jogo completo, sem pagar de novo'],
  ];

  // #/premium
  CA.jogos.premium = {
    nome: 'Caderno Premium',
    iniciar(palco) {
      let vivo = true, timer = 0;
      palco.innerHTML = '';
      const tela = CA.el(`
        <section class="intro premium">
          <a class="voltar" href="#/" aria-label="Voltar">‹</a>
          <div class="miolo"></div>
        </section>`);
      palco.appendChild(tela);
      const miolo = tela.querySelector('.miolo');
      CA.ehPremium() ? ativo() : oferta();
      if (CA.conta()) CA.sincronizar().then(() => { if (vivo && CA.ehPremium() && !miolo.querySelector('.ativo-ok')) ativo(true); });

      function ativo(recemPago) {
        clearInterval(timer);
        const c = CA.conta() || {};
        miolo.innerHTML = `
          <h1 class="ativo-ok">${recemPago ? 'Liberado! 🎉' : 'Teu Premium tá ativo'}</h1>
          <p>Todas as fases, desafios anteriores, card dourado e os 66 Desafios tão liberados na conta <b>${c.email || ''}</b>.</p>
          <p class="pequeno">Em outro celular é só entrar com esse mesmo e-mail.</p>
          <a class="btn btn-grande" href="#/">Bora jogar</a>`;
      }

      function oferta() {
        const c = CA.conta();
        miolo.innerHTML = `
          <span class="selo-premium">★ Premium</span>
          <h1>Caderno Premium</h1>
          <p>As 6 primeiras fases e o desafio do dia são de graça pra sempre. O Premium é pra quem quer ir até o fim:</p>
          <ul class="beneficios">
            ${BENEFICIOS.map(([t, d]) => `<li><strong>${t}</strong><span>${d}</span></li>`).join('')}
          </ul>
          <div class="preco"><strong>${PRECO}</strong><span>uma vez só, no Pix. Sem mensalidade.</span></div>
          <div class="passo"></div>
          <p class="nota">O Premium fica na tua conta (teu e-mail), vale em qualquer celular. Pagamento por Pix, processado pelo Mercado Pago. Dúvida? ${CFG.contato || ''}</p>`;
        const passo = miolo.querySelector('.passo');
        if (!c) {
          formEntrar(passo, {
            titulo: '1. Cria tua conta',
            texto: 'Só o e-mail, sem senha. A gente manda um código pra confirmar.',
            onPronto: () => vivo && (CA.ehPremium() ? ativo() : oferta()),
          });
        } else pagar(passo, c);
      }

      function pagar(passo, c) {
        passo.innerHTML = `
          <div class="caixa-conta">
            <strong>2. Paga no Pix</strong>
            <small>Conta: <b>${c.email}</b> · <button class="link-mini" type="button" data-a="sair">trocar</button></small>
            <button class="btn btn-grande" type="button" data-a="pix">Pagar ${PRECO} no Pix</button>
            <p class="erro-form" role="alert" hidden></p>
          </div>`;
        passo.querySelector('[data-a=sair]').addEventListener('click', async () => { await CA.sairConta(); if (vivo) oferta(); });
        const b = passo.querySelector('[data-a=pix]'), err = passo.querySelector('.erro-form');
        b.addEventListener('click', async () => {
          err.hidden = true; b.disabled = true; b.textContent = 'Gerando Pix...';
          try {
            const pix = await chamar('criar-pix', { produto: PRODUTO, email: c.email });
            if (vivo) telaPix(pix);
          } catch (x) { err.textContent = x.message; err.hidden = false; b.disabled = false; b.textContent = `Pagar ${PRECO} no Pix`; }
        });
      }

      function telaPix(pix) {
        miolo.innerHTML = `
          <h1>Paga no Pix</h1>
          <p>Abre o app do banco, escolhe Pix e lê o QR code. Ou copia o código.</p>
          ${pix.qr_base64 ? `<img class="qr" alt="QR code do Pix" src="data:image/png;base64,${pix.qr_base64}">` : ''}
          <textarea class="copia-cola" readonly rows="3" aria-label="Pix copia e cola">${pix.copia_cola || ''}</textarea>
          <button class="btn btn-grande btn-claro" type="button" data-a="copiar">Copiar código Pix</button>
          <p class="esperando"><span class="pontinho"></span> Esperando o pagamento... assim que cair, libera sozinho.</p>`;
        miolo.querySelector('[data-a=copiar]').addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(pix.copia_cola); CA.aviso('Código Pix copiado!'); }
          catch (e) { miolo.querySelector('.copia-cola').select(); }
        });
        const t0 = Date.now();
        timer = setInterval(async () => {
          if (!vivo || Date.now() - t0 > 30 * 60e3) { clearInterval(timer); return; }
          try {
            const st = await chamar('status-pedido', { pedido: pix.pedido });
            if (st.status === 'pago') {
              clearInterval(timer);
              await CA.sincronizar();
              if (!CA.ehPremium()) guardarConta({ ...CA.conta(), premium: true });
              CA.som('recorde');
              if (vivo) ativo(true);
            }
          } catch (e) { /* tenta de novo no próximo */ }
        }, 4000);
      }

      return () => { vivo = false; clearInterval(timer); };
    },
  };

  // #/conta: entrar ou ver quem tá conectado
  CA.jogos.conta = {
    nome: 'Minha conta',
    iniciar(palco) {
      let vivo = true;
      palco.innerHTML = '';
      const tela = CA.el('<section class="intro"><a class="voltar" href="#/" aria-label="Voltar">‹</a><h1>Minha conta</h1><div class="miolo"></div></section>');
      palco.appendChild(tela);
      const miolo = tela.querySelector('.miolo');
      const mostrar = () => {
        const c = CA.conta();
        if (!c) {
          formEntrar(miolo, {
            titulo: 'Entra com teu e-mail',
            texto: 'Pra salvar tuas fases e teu Premium e continuar em qualquer celular. Sem senha.',
            onPronto: () => { if (vivo) { CA.aviso('Pronto, tu entrou!'); mostrar(); } },
          });
          return;
        }
        const est = CA.estrelasTotais ? CA.estrelasTotais() : 0;
        miolo.innerHTML = `
          <div class="caixa-conta">
            <strong>${c.email}</strong>
            <small>${c.premium ? '★ Premium ativo' : 'Plano grátis'} · ${est} estrelas</small>
            ${c.premium ? '' : '<a class="btn btn-grande" href="#/premium">Ver o Premium</a>'}
            <button class="btn btn-claro" type="button" data-a="sair">Sair da conta</button>
          </div>`;
        miolo.querySelector('[data-a=sair]').addEventListener('click', async () => { await CA.sairConta(); if (vivo) mostrar(); });
      };
      mostrar();
      return () => { vivo = false; };
    },
  };
})();
