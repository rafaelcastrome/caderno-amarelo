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
  CA.chamar = chamar;
  CA.perfil = () => (CA.conta() || {}).perfil || null;   // { apelido, arroba, mostrar_arroba, arroba_confirmado, id_publico }
  function guardarConta(d) {
    const antes = CA.conta() || {};
    CA.gravar('conta', { email: d.email || antes.email, token: d.token || antes.token, premium: !!d.premium, ate: d.ate || null, perfil: d.perfil || antes.perfil || null });
    amigoPendente();
    if (d.progresso) {
      // chaves "1".."30" = fases do Acha; "cor:2" = níveis dos outros jogos
      const fases = {}, niveis = {};
      for (const k in d.progresso) (k.includes(':') ? niveis : fases)[k] = d.progresso[k];
      CA.gravar('fases', fases); CA.gravar('niveis', niveis);
    }
    if (d.desafios) { try { localStorage.setItem('desafios:jogo', JSON.stringify({ isPremium: true })); } catch (e) {} }
  }
  // link de duelo de alguém: vira amigo (agora, ou quando entrar na conta)
  CA.virarAmigo = function (id) {
    if (!id || (CA.perfil() || {}).id_publico === id) return;
    CA.gravar('amigoPend', id);
    amigoPendente();
  };
  function amigoPendente() {
    const id = CA.ler('amigoPend', null), c = CA.conta();
    if (!id || !c || !c.token) return;
    CA.gravar('amigoPend', null);
    chamar('jogo-ranking', { acao: 'amigo', token: c.token, id }).catch(() => {});
  }
  // manda o tempo pro ranking (só com conta)
  CA.enviarRecorde = function (chave, t, tentativa) {
    const c = CA.conta();
    if (!c || !c.token) return Promise.resolve(false);
    return chamar('jogo-ranking', { acao: 'enviar', token: c.token, chave, t, tentativa }).then(() => true).catch(() => false);
  };
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
    enviando = chamar('jogo-conta', { token: c.token, progresso: { ...CA.ler('fases', {}), ...CA.ler('niveis', {}) } })
      .then(d => guardarConta(d))
      .catch(e => { if (e.status === 401) CA.gravar('conta', null); })
      .finally(() => { enviando = null; });
    return enviando;
  };

  // Quem jogou sem conta e entrou depois: manda pro ranking os tempos que já fez (desafio de hoje e ontem, fases grátis).
  function enviarPendentes() {
    const hoje = CA.hojeBR(), ontem = new Date(Date.parse(hoje + 'T12:00:00Z') - 864e5).toISOString().slice(0, 10);
    [hoje, ontem].forEach(d => {
      const t = CA.ler('rec:dia:' + d, null);
      if (t) CA.enviarRecorde('dia:' + d, t, CA.ler('tentrec:dia:' + d, null));
    });
    const fases = CA.ler('fases', {});
    for (let f = 1; f <= (CA.FASES_GRATIS || 3); f++) if (fases[f] && fases[f].t) CA.enviarRecorde('fase:' + f, fases[f].t, fases[f].r || null);
  }

  // Link da direct do @Cardeno_Amarelo. No Android o ig.me abre tela preta no Chrome,
  // então manda direto pro app do Instagram (e, sem o app, pro perfil no site).
  CA.linkDirect = function () {
    if (/Android/i.test(navigator.userAgent)) {
      return 'intent://ig.me/m/Cardeno_Amarelo#Intent;scheme=https;package=com.instagram.android;S.browser_fallback_url='
        + encodeURIComponent('https://www.instagram.com/cardeno_amarelo/') + ';end';
    }
    return 'https://ig.me/m/Cardeno_Amarelo';
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
          <p class="nota">Esqueceu qual e-mail usou? Manda direct pro <a href="${CA.linkDirect()}">@Cardeno_Amarelo</a> que a gente te ajuda.</p>
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
        const d = await chamar('jogo-entrar', { email, codigo: fC.querySelector('input').value.trim(), progresso: { ...CA.ler('fases', {}), ...CA.ler('niveis', {}) } });
        guardarConta(d);
        enviarPendentes();
        if (d.perfil && d.perfil.apelido) onPronto(CA.conta());
        else formPerfil(alvo, { titulo: 'Como tu quer aparecer no ranking?', onPronto: () => onPronto(CA.conta()) });
      } catch (x) { erro(fC, x.message); b.disabled = false; b.textContent = 'Entrar'; }
    });
    fC.querySelector('[data-a=outro]').addEventListener('click', () => { fC.hidden = true; fE.hidden = false; });
  }

  // Perfil do ranking: apelido (obrigatório), @ do Instagram (opcional) e se mostra o @.
  // O @ só ganha o ✓ depois de confirmar pela direct (o bot confere o código de 4 números).
  function formPerfil(alvo, { titulo, onPronto, botao }) {
    const p = CA.perfil() || {};
    alvo.innerHTML = `
      <div class="caixa-conta">
        <strong>${titulo}</strong>
        <small>É assim que teu nome aparece no ranking e pros teus amigos. Teu e-mail nunca aparece.</small>
        <form class="f-perfil">
          <label for="apelido">Apelido</label>
          <input id="apelido" maxlength="20" required autocomplete="nickname" placeholder="Ex.: Rafa" value="${(p.apelido || '').replace(/"/g, '&quot;')}">
          <label for="arroba">Teu @ do Instagram <span class="opcional">(se quiser)</span></label>
          <div class="campo-arroba"><span>@</span><input id="arroba" maxlength="31" autocapitalize="none" autocomplete="off" spellcheck="false" placeholder="seu.arroba" value="${p.arroba || ''}"></div>
          <label class="marcar"><input type="checkbox" id="mostrar" ${p.mostrar_arroba ? 'checked' : ''}> Mostrar meu @ no ranking</label>
          <button class="btn btn-grande" type="submit">${botao || 'Salvar e continuar'}</button>
          <p class="erro-form" role="alert" hidden></p>
        </form>
      </div>`;
    const f = alvo.querySelector('.f-perfil'), err = f.querySelector('.erro-form');
    const arroba = f.querySelector('#arroba'), mostrar = f.querySelector('#mostrar');
    arroba.addEventListener('input', () => { arroba.value = arroba.value.replace(/^@+/, '').replace(/\s/g, '').toLowerCase(); if (arroba.value && !p.arroba) mostrar.checked = true; });
    f.addEventListener('submit', async e => {
      e.preventDefault(); err.hidden = true;
      const b = f.querySelector('button'); b.disabled = true;
      try {
        const d = await chamar('jogo-perfil', { token: CA.conta().token, apelido: f.querySelector('#apelido').value, arroba: arroba.value, mostrar: mostrar.checked && !!arroba.value });
        guardarConta({ ...CA.conta(), perfil: d.perfil });
        if (d.perfil.arroba && !d.perfil.arroba_confirmado) confirmarArroba(alvo, onPronto);
        else onPronto();
      } catch (x) { err.textContent = x.message; err.hidden = false; b.disabled = false; }
    });
  }
  CA.formPerfil = formPerfil;

  // Mostra o código de 4 números pra mandar na direct e espera o bot confirmar.
  function confirmarArroba(alvo, onPronto) {
    let vivo = true, timer = 0;
    const p = CA.perfil();
    alvo.innerHTML = `
      <div class="caixa-conta confirmar-arroba">
        <strong>Confirma que o @${p.arroba} é teu</strong>
        <small>Assim teu @ ganha o ✓ no ranking e ninguém usa ele no teu lugar.</small>
        <div class="codigo-grande" aria-live="polite">····</div>
        <ol class="passos-arroba">
          <li>Copia o código</li>
          <li>Manda na direct do <b>@Cardeno_Amarelo</b> (ou comenta num post nosso)</li>
          <li>Volta aqui: confirma sozinho</li>
        </ol>
        <a class="btn btn-grande" href="${CA.linkDirect()}" data-a="direct">Copiar e abrir a direct</a>
        <p class="esperando"><span class="pontinho"></span> Esperando a mensagem... vale 30 minutos.</p>
        <button class="link-voltar" type="button" data-a="depois">Confirmar depois</button>
        <p class="erro-form" role="alert" hidden></p>
      </div>`;
    const cx = alvo.querySelector('.codigo-grande'), err = alvo.querySelector('.erro-form');
    const fim = ok => { vivo = false; clearInterval(timer); if (ok) { CA.som('recorde'); CA.aviso('@' + p.arroba + ' confirmado ✓'); } onPronto(); };
    alvo.querySelector('[data-a=depois]').addEventListener('click', () => fim(false));
    chamar('jogo-perfil', { token: CA.conta().token, pedirCodigo: true }).then(d => {
      cx.textContent = d.codigo;
      alvo.querySelector('[data-a=direct]').addEventListener('click', e => {
        // copia primeiro e só depois abre o Instagram (senão o celular troca de app antes de copiar)
        e.preventDefault();
        const link = e.currentTarget.href;
        CA.aviso('Código ' + d.codigo + ' copiado');
        let foi = false; const abrir = () => { if (!foi) { foi = true; location.href = link; } };
        try { navigator.clipboard.writeText(d.codigo).then(abrir, abrir); } catch (x) { abrir(); }
        setTimeout(abrir, 600);
      });
      timer = setInterval(async () => {
        if (!vivo || !alvo.isConnected) { clearInterval(timer); return; }
        await CA.sincronizar();
        if ((CA.perfil() || {}).arroba_confirmado) fim(true);
      }, 5000);
    }).catch(x => { err.textContent = x.message; err.hidden = false; });
  }

  const BENEFICIOS = [
    ['Todos os níveis de todos os jogos', 'Do nível 4 até o último em cada jogo: Acha do 1 ao 25, Fala a cor, Responde rápido, charadas, pegadinhas... E cada jogo novo que chegar já vem liberado'],
    ['Desafios dos dias anteriores', 'Perdeu um desafio do dia? Joga qualquer um dos últimos 30 dias'],
    ['Card dourado', 'Teu resultado com moldura dourada e selo Premium pros stories'],
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
          <p>Todos os níveis de todos os jogos, desafios anteriores e card dourado tão liberados na conta <b>${c.email || ''}</b>${c.ate ? ' até <b>' + fmtDia(c.ate) + '</b>' : ''}.</p>
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
          <p>Em cada jogo, os 3 primeiros níveis e o desafio do dia são de graça pra sempre. O Premium é pra quem quer ir até o fim:</p>
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

  // nome que a pessoa tem no ranking (igual ao servidor)
  function nomeRanking() {
    const p = CA.perfil() || {};
    if (p.mostrar_arroba && p.arroba) return '@' + p.arroba + (p.arroba_confirmado ? ' ✓' : '');
    return p.apelido || 'sem apelido';
  }
  CA.nomeRanking = nomeRanking;

  // #/conta: entrar ou ver quem tá conectado
  CA.jogos.conta = {
    nome: 'Minha conta',
    iniciar(palco, p) {
      let vivo = true;
      const volta = p && /^#\/[\w?=&.:-]*$/.test(p.volta || '') ? p.volta : null; // volta pro jogo depois de entrar
      const novo = !!(p && p.novo); // jogador novo: cadastro antes de começar
      palco.innerHTML = '';
      const tela = CA.el(`<section class="intro"><a class="voltar" href="${novo ? (/^#\/acha\?d=/.test(volta || '') ? volta : '#/') : (volta || '#/')}" aria-label="Voltar">‹</a><h1>${novo ? 'Bora jogar!' : 'Minha conta'}</h1><div class="miolo"></div></section>`);
      palco.appendChild(tela);
      const miolo = tela.querySelector('.miolo');
      const mostrar = () => {
        const c = CA.conta();
        if (!c) {
          formEntrar(miolo, {
            titulo: novo ? 'Cria tua conta pra jogar' : volta ? 'Cria tua conta grátis' : 'Entra com teu e-mail',
            texto: novo ? 'É grátis e sem senha, só teu e-mail. Assim teus níveis e estrelas ficam salvos e tu aparece no ranking. Já tem conta? Usa o mesmo e-mail.'
              : volta ? 'Aí tu entra no ranking (com teu @, se quiser) e tua colocação aparece na arte dos stories. Teus tempos de hoje já contam. Sem senha.'
              : 'Pra entrar no ranking, salvar tuas fases e teu Premium e continuar em qualquer celular. Sem senha.',
            onPronto: () => {
              if (!vivo) return;
              CA.aviso('Pronto, tu entrou!');
              const seguir = () => { if (!vivo) return; if (volta) location.hash = volta; else mostrar(); };
              seguir();
            },
          });
          return;
        }
        const est = CA.estrelasTotais ? CA.estrelasTotais() : 0;
        miolo.innerHTML = `
          <div class="caixa-conta">
            <strong>${c.email}</strong>
            <small>${CA.ehPremium() ? '★ Premium ativo' + (c.ate ? ' até ' + fmtDia(c.ate) : '') : 'Plano grátis'} · ${est} estrelas</small>
            <div class="perfil-linha">
              <span>No ranking: <b>${nomeRanking()}</b>${(c.perfil || {}).arroba && !(c.perfil || {}).arroba_confirmado ? ' <em class="sem-ok">@ não confirmado</em>' : ''}</span>
              <button class="link-mini" type="button" data-a="perfil">editar</button>
            </div>
            ${(c.perfil || {}).arroba && !(c.perfil || {}).arroba_confirmado ? '<button class="btn btn-claro" type="button" data-a="confirmar">Confirmar meu @</button>' : ''}
            <a class="btn btn-grande ${CA.ehPremium() ? 'btn-claro' : ''}" href="#/premium">${CA.ehPremium() ? 'Renovar o Premium' : 'Ver o Premium'}</a>
            <button class="btn btn-claro" type="button" data-a="sair">Sair da conta</button>
          </div>`;
        miolo.querySelector('[data-a=sair]').addEventListener('click', async () => { await CA.sairConta(); if (vivo) mostrar(); });
        miolo.querySelector('[data-a=perfil]').addEventListener('click', () => formPerfil(miolo, { titulo: 'Teu nome no ranking', botao: 'Salvar', onPronto: () => vivo && mostrar() }));
        const bc = miolo.querySelector('[data-a=confirmar]');
        if (bc) bc.addEventListener('click', () => confirmarArroba(miolo, () => vivo && mostrar()));
      };
      mostrar();
      return () => { vivo = false; };
    },
  };
})();
