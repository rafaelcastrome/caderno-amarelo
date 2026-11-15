/* Conta e Caderno Premium.
   Conta: entra com e-mail + código de 6 números que chega no e-mail (sem senha).
   Premium: passe no Pix da loja (mensal R$ 4,90 = 30 dias, anual R$ 29,90 = 1 ano), preso ao
   E-MAIL da conta, então vale em qualquer celular. Pix não renova sozinho: a pessoa renova quando
   quiser e os dias somam. Libera TODOS os jogos. O progresso das fases também fica salvo na conta. */
(function () {
  'use strict';
  const CA = window.CA;
  const CFG = window.LOJA_CONFIG || {};
  const API = CFG.supabaseUrl ? CFG.supabaseUrl + '/functions/v1' : null;
  // só pra mostrar; o valor cobrado vem sempre do banco
  const PLANOS = [
    { slug: 'passe-anual', nome: 'Anual', preco: 'R$ 29,90', detalhe: 'R$ 2,49 por mês · economiza 49%', destaque: true },
    { slug: 'passe-mensal', nome: 'Mensal', preco: 'R$ 4,90', detalhe: '30 dias' },
  ];
  const fmtDia = iso => new Date(iso).toLocaleDateString('pt-BR');

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
  CA.conta = () => CA.ler('conta', null);              // { email, token, premium, ate }
  CA.ehPremium = () => { const c = CA.conta(); return !!(c && c.premium && (!c.ate || Date.parse(c.ate) > Date.now())); };
  function guardarConta(d) {
    CA.gravar('conta', { email: d.email, token: d.token || (CA.conta() || {}).token, premium: !!d.premium, ate: d.ate || null });
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
    ['Todos os jogos liberados', 'No Acha do 1 ao 25, da fase 7 à fase final. E cada jogo novo que chegar já vem liberado'],
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
          <p>Todos os jogos, desafios anteriores, card dourado e os 66 Desafios tão liberados na conta <b>${c.email || ''}</b>${c.ate ? ' até <b>' + fmtDia(c.ate) + '</b>' : ''}.</p>
          <p class="pequeno">Em outro celular é só entrar com esse mesmo e-mail. Pode renovar quando quiser: os dias somam.</p>
          <a class="btn btn-grande" href="#/">Bora jogar</a>
          <div class="passo renovar"></div>`;
        if (c.token) pagar(miolo.querySelector('.renovar'), c, 'Renovar');
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
          <div class="preco"><span>a partir de</span><strong>R$ 2,49</strong><span>por mês, no Pix. Sem cobrança automática.</span></div>
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

      function pagar(passo, c, titulo) {
        passo.innerHTML = `
          <div class="caixa-conta">
            <strong>${titulo || '2. Escolhe o plano'}</strong>
            <small>Conta: <b>${c.email}</b> · <button class="link-mini" type="button" data-a="sair">trocar</button></small>
            <div class="planos">
              ${PLANOS.map(pl => `<button class="plano ${pl.destaque ? 'destaque' : ''}" type="button" data-slug="${pl.slug}">
                ${pl.destaque ? '<em>Mais vantajoso</em>' : ''}
                <span>${pl.nome}</span><strong>${pl.preco}</strong><small>${pl.detalhe}</small>
              </button>`).join('')}
            </div>
            <p class="erro-form" role="alert" hidden></p>
          </div>`;
        passo.querySelector('[data-a=sair]').addEventListener('click', async () => { await CA.sairConta(); if (vivo) oferta(); });
        const err = passo.querySelector('.erro-form');
        passo.querySelectorAll('.plano').forEach(b => b.addEventListener('click', async () => {
          err.hidden = true;
          passo.querySelectorAll('.plano').forEach(x => { x.disabled = true; });
          b.classList.add('gerando');
          try {
            const pix = await chamar('criar-pix', { produto: b.dataset.slug, email: c.email });
            if (vivo) telaPix(pix);
          } catch (x) {
            err.textContent = x.message; err.hidden = false;
            passo.querySelectorAll('.plano').forEach(y => { y.disabled = false; });
            b.classList.remove('gerando');
          }
        }));
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
              if (!CA.ehPremium()) guardarConta({ ...CA.conta(), premium: true, ate: null });
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
            <small>${CA.ehPremium() ? '★ Premium ativo' + (c.ate ? ' até ' + fmtDia(c.ate) : '') : 'Plano grátis'} · ${est} estrelas</small>
            <a class="btn btn-grande ${CA.ehPremium() ? 'btn-claro' : ''}" href="#/premium">${CA.ehPremium() ? 'Renovar o Premium' : 'Ver o Premium'}</a>
            <button class="btn btn-claro" type="button" data-a="sair">Sair da conta</button>
          </div>`;
        miolo.querySelector('[data-a=sair]').addEventListener('click', async () => { await CA.sairConta(); if (vivo) mostrar(); });
      };
      mostrar();
      return () => { vivo = false; };
    },
  };
})();
