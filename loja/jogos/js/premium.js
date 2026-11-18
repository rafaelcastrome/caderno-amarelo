/* Conta e caRdeno Premium.
   Conta: entra com e-mail + código de 6 números que chega no e-mail (sem senha).
   Premium: no Pix da loja. Com OFERTA_UNICA ligada: passe-vitalicio R$ 9,90, sem data de fim (ate = null).
   Desligada: mensal R$ 4,90 = 30 dias, anual R$ 29,90 = 1 ano. Preso ao
   E-MAIL da conta, então vale em qualquer celular. Pix não renova sozinho: a pessoa renova quando
   quiser e os dias somam. Libera TODOS os jogos. O progresso dos níveis também fica salvo na conta. */
(function () {
  'use strict';
  const CA = window.CA;
  const CFG = window.LOJA_CONFIG || {};
  const API = CFG.supabaseUrl ? CFG.supabaseUrl + '/functions/v1' : null;
  // só pra mostrar; o valor cobrado vem sempre do banco.
  // Chave OFERTA_UNICA (assets/js/config.js): ligada mostra só o vitalício; desligada volta o mensal e o anual.
  const OFERTA_UNICA = CFG.OFERTA_UNICA !== false;
  const PLANO_VITALICIO = { slug: 'passe-vitalicio', nome: 'Pra sempre', preco: 'R$ 9,90', detalhe: 'Paga uma vez só. Sem mensalidade, nunca vence', destaque: true, selo: 'Oferta única' };
  const PLANOS_PASSE = [
    { slug: 'passe-anual', nome: 'Anual', preco: 'R$ 29,90', detalhe: 'R$ 2,49 por mês · economiza 49%', destaque: true, selo: 'Mais vantajoso' },
    { slug: 'passe-mensal', nome: 'Mensal', preco: 'R$ 4,90', detalhe: '30 dias' },
  ];
  const PLANOS = OFERTA_UNICA ? [PLANO_VITALICIO] : PLANOS_PASSE;
  // textos de chamada usados nas outras telas (início, nível trancado, resultado)
  CA.OFERTA = OFERTA_UNICA
    ? { unica: true, preco: 'R$ 9,90', botao: 'R$ 9,90 uma vez, pra sempre', chamada: 'R$ 9,90 uma vez só, pra sempre. Sem mensalidade.' }
    : { unica: false, preco: 'R$ 4,90', botao: 'a partir de R$ 2,49/mês', chamada: 'Mensal R$ 4,90 ou anual R$ 29,90.' };
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
    // O bot confirma o @ mesmo quando o Instagram não deixa ele responder na direct (conversa na pasta
    // Pedidos de quem não segue). Então o aviso de "confirmado" sai aqui no jogo, na próxima sincronização.
    const virouOk = antes.perfil && antes.perfil.arroba && !antes.perfil.arroba_confirmado && d.perfil && d.perfil.arroba_confirmado;
    CA.gravar('conta', { email: d.email || antes.email, token: d.token || antes.token, premium: !!d.premium, ate: d.ate || null, perfil: d.perfil || antes.perfil || null });
    amigoPendente();
    if (d.progresso) {
      // chaves "acha:4", "cor:2"... = níveis de cada jogo ("1".."30" = fases antigas do Acha, não usadas mais)
      const fases = {}, niveis = {};
      for (const k in d.progresso) (k.includes(':') ? niveis : fases)[k] = d.progresso[k];
      CA.gravar('fases', fases); CA.gravar('niveis', niveis);
    }
    if (d.desafios) { try { localStorage.setItem('desafios:jogo', JSON.stringify({ isPremium: true })); } catch (e) {} }
    if (virouOk && !document.querySelector('.confirmar-arroba')) arrobaConfirmado(d.perfil.arroba);
  }
  // Cartão de comemoração quando o @ foi confirmado com a pessoa fora da tela do código.
  function arrobaConfirmado(arroba) {
    document.querySelectorAll('.selo-confirmado').forEach(x => x.remove());
    const f = CA.el(`
      <div class="selo-confirmado" role="dialog" aria-live="polite">
        <div class="selo-cartao">
          <div class="selo-check" aria-hidden="true">✓</div>
          <strong>@${arroba} confirmado!</strong>
          <small>Recebemos teu código. Teu @ já aparece com ✓ no ranking.</small>
          <button class="btn btn-grande" type="button">Beleza!</button>
        </div>
      </div>`);
    const fechar = () => { f.classList.add('some'); setTimeout(() => f.remove(), 350); };
    f.querySelector('button').addEventListener('click', fechar);
    f.addEventListener('click', e => { if (e.target === f) fechar(); });
    document.body.appendChild(f);
    if (CA.som) CA.som('recorde');
  }
  // Voltou do Instagram pro jogo: confere na hora se o @ já foi confirmado.
  document.addEventListener('visibilitychange', () => {
    const p = CA.perfil();
    if (document.visibilityState === 'visible' && p && p.arroba && !p.arroba_confirmado) CA.sincronizar();
  });
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
  // extra: { acertos } nas Pegadinhas (chave 'peg:N', t = tempo médio)
  CA.enviarRecorde = function (chave, t, tentativa, extra) {
    const c = CA.conta();
    if (!c || !c.token) return Promise.resolve(false);
    return chamar('jogo-ranking', { acao: 'enviar', token: c.token, chave, t, tentativa, ...(extra || {}) }).then(() => true).catch(() => false);
  };
  CA.sairConta = async function () {
    const c = CA.conta();
    if (c) chamar('jogo-conta', { token: c.token, sair: true }).catch(() => {});
    CA.gravar('conta', null);
  };
  // Atualiza Premium e progresso com o servidor (ao abrir o app e depois de cada nível).
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

  // Quem jogou sem conta e entrou depois: manda pro ranking os tempos que já fez (desafio do dia de hoje e ontem, níveis grátis do Acha).
  function enviarPendentes() {
    const hoje = CA.hojeBR(), ontem = new Date(Date.parse(hoje + 'T12:00:00Z') - 864e5).toISOString().slice(0, 10);
    [hoje, ontem].forEach(d => {
      const m = CA.ler('rec:jdia:' + d, null); // desafio do dia (dia.js): tempo somado ou acertos somados
      if (m && m.t != null) CA.enviarRecorde('jdia:' + d, m.t, m.r || null);
      else if (m && m.a != null) CA.enviarRecorde('jdia:' + d, 90, m.r || null, { acertos: m.a });
    });
    const fases = CA.progressoFases ? CA.progressoFases() : {};
    for (let f = 1; f <= (CA.FASES_GRATIS || 3); f++) if (fases[f] && fases[f].t) CA.enviarRecorde('nivel:' + f, fases[f].t, fases[f].r || null);
    const peg = CA.jogo && CA.jogo('pegadinhas');
    if (peg) { const pp = peg.prog(); for (const n in pp) if (pp[n] && pp[n].a != null) CA.enviarRecorde('peg:' + n, pp[n].m, pp[n].r || null, { acertos: pp[n].a }); }
  }

  // Link da direct do @caRdeno_Amarelo. No Android o ig.me abre tela preta no Chrome,
  // então manda direto pro app do Instagram (e, sem o app, pro perfil no site).
  CA.ehCelular = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  CA.linkDirect = function () {
    if (/Android/i.test(navigator.userAgent)) {
      return 'intent://ig.me/m/cardeno_amarelo#Intent;scheme=https;package=com.instagram.android;S.browser_fallback_url='
        + encodeURIComponent('https://www.instagram.com/cardeno_amarelo/') + ';end';
    }
    return 'https://ig.me/m/cardeno_amarelo';
  };

  // Copia na hora do toque (sem esperar promessa), porque logo depois a página perde o foco.
  CA.copiarJa = function (texto) {
    let ok = false;
    try {
      const t = document.createElement('textarea');
      t.value = texto; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(t); t.select(); t.setSelectionRange(0, texto.length);
      ok = document.execCommand('copy'); t.remove();
    } catch (x) { /* segue */ }
    try { if (navigator.clipboard) navigator.clipboard.writeText(texto).catch(() => {}); } catch (x) { /* segue */ }
    return ok;
  };

  // Formulário de entrar (usado no Premium e na tela de conta). onPronto(conta) quando entra.
  function formEntrar(alvo, { titulo, texto, onPronto, origem }) {
    alvo.innerHTML = `
      <div class="caixa-conta">
        <strong>${titulo}</strong>
        <small>${texto}</small>
        <form class="f-email mov-aparece">
          <label for="email-conta">Teu e-mail</label>
          <input id="email-conta" type="email" required autocomplete="email" placeholder="nome@email.com">
          <button class="btn btn-grande" type="submit">Mandar código pro e-mail</button>
          <p class="erro-form mov-aparece" role="alert" hidden></p>
          <p class="nota">Esqueceu qual e-mail usou? Manda direct pro <a href="${CA.linkDirect()}">@caRdeno_Amarelo</a> que a gente te ajuda.</p>
        </form>
        <form class="f-codigo mov-aparece" hidden>
          <label for="codigo-conta">Código de 6 números que chegou no e-mail</label>
          <input id="codigo-conta" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required placeholder="000000">
          <button class="btn btn-grande" type="submit">Entrar</button>
          <button class="link-voltar" type="button" data-a="outro">Usar outro e-mail</button>
          <p class="erro-form mov-aparece" role="alert" hidden></p>
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
        if (CA.funil) CA.funil('pediu_codigo', { origem: origem || 'conta' });
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
        if (CA.funil) CA.funil('entrou_na_conta', { origem: origem || 'conta' });
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
          <p class="erro-form mov-aparece" role="alert" hidden></p>
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
          <li>Manda na direct do <b>@caRdeno_Amarelo</b> (ou comenta num post nosso)</li>
          <li>Volta aqui: confirma sozinho</li>
        </ol>
        <a class="btn btn-grande" href="${CA.linkDirect()}" data-a="direct"${CA.ehCelular() ? '' : ' target="_blank" rel="noopener"'}>Copiar e abrir a direct</a>
        <p class="esperando"><span class="pontinho"></span> Esperando a mensagem... pode levar até 2 minutinhos. O código vale 24 horas.</p>
        <p class="aviso-direct">O Instagram nem sempre deixa a gente responder na direct. Se ficar sem resposta, tudo bem: o ✓ aparece aqui no jogo.</p>
        <button class="link-voltar" type="button" data-a="depois">Confirmar depois</button>
        <p class="erro-form mov-aparece" role="alert" hidden></p>
      </div>`;
    const cx = alvo.querySelector('.codigo-grande'), err = alvo.querySelector('.erro-form');
    const fim = ok => { vivo = false; clearInterval(timer); if (ok) { CA.som('recorde'); CA.aviso('@' + p.arroba + ' confirmado ✓'); } onPronto(); };
    alvo.querySelector('[data-a=depois]').addEventListener('click', () => fim(false));
    chamar('jogo-perfil', { token: CA.conta().token, pedirCodigo: true }).then(d => {
      cx.textContent = d.codigo;
      alvo.querySelector('[data-a=direct]').addEventListener('click', e => {
        // Copia na hora e deixa o link abrir. No computador abre em outra aba, pra esta
        // tela continuar aqui esperando a confirmação; no celular troca pro app do Instagram.
        CA.copiarJa(d.codigo);
        CA.aviso('Código ' + d.codigo + ' copiado');
        if (CA.ehCelular()) {
          e.preventDefault();
          const link = e.currentTarget.href;
          setTimeout(() => { location.href = link; }, 150);
        }
      });
      timer = setInterval(async () => {
        if (!vivo || !alvo.isConnected) { clearInterval(timer); return; }
        await CA.sincronizar();
        if ((CA.perfil() || {}).arroba_confirmado) fim(true);
      }, 5000);
    }).catch(x => { err.textContent = x.message; err.hidden = false; });
  }

  const BENEFICIOS = [
    ['Todos os níveis de todos os jogos', 'Do nível 4 até o último em cada jogo: Caça-números, Fala a cor, Responde rápido, charadas, pegadinhas... E cada jogo novo que chegar já vem liberado'],
    ['Desafios dos dias anteriores', 'Perdeu um desafio do dia? Joga qualquer um dos últimos 30 dias'],
    ['Card dourado', 'Teu resultado com moldura dourada e selo Premium pros stories'],
  ];

  // ---------- Pix pendente (sobrevive a trocar de app e a recarregar) ----------
  // { pedido, copia_cola, qr_base64, validade (ms), slug, preco, email }. O Pix do Mercado Pago vale 30 min.
  CA.pixPendente = function () {
    const p = CA.ler('pixPendente', null);
    if (p && p.pedido && p.validade > Date.now()) return p;
    if (p) CA.gravar('pixPendente', null);
    return null;
  };
  const naPremium = () => /^#\/premium/.test(location.hash);
  // Voltou pro site (do app do banco) ou recarregou com um Pix esperando: reabre a tela do Pix.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && CA.pixPendente() && !naPremium()) location.hash = '#/premium';
  });
  // Antes do app desenhar a primeira tela (este arquivo carrega antes do app.js): sem disparar hashchange.
  window.addEventListener('DOMContentLoaded', () => {
    if (CA.pixPendente() && !naPremium()) history.replaceState(null, '', location.pathname + location.search + '#/premium');
  });

  // #/premium
  CA.jogos.premium = {
    nome: 'caRdeno Premium',
    iniciar(palco) {
      let vivo = true, timer = 0, conferindo = false;
      let escolhido = (PLANOS.find(p => p.destaque) || PLANOS[0]).slug;
      palco.innerHTML = '';
      const tela = CA.el(`
        <section class="intro premium">
          <a class="voltar" href="#/" aria-label="Voltar">‹</a>
          <div class="miolo"></div>
        </section>`);
      palco.appendChild(tela);
      const miolo = tela.querySelector('.miolo');
      const pend = CA.pixPendente();
      if (!CA.ehPremium() && !pend && CA.funil) CA.funil('abriu_premium');
      if (pend) telaPix(pend);
      else CA.ehPremium() ? ativo() : oferta();
      if (CA.conta()) CA.sincronizar().then(() => { if (vivo && CA.ehPremium() && !CA.pixPendente() && !miolo.querySelector('.ativo-ok')) ativo(true); });
      const aoVoltar = () => { if (document.visibilityState === 'visible' && vivo && CA.pixPendente()) conferir(); };
      document.addEventListener('visibilitychange', aoVoltar);

      function ativo(recemPago) {
        clearInterval(timer);
        const c = CA.conta() || {};
        miolo.innerHTML = `
          <h1 class="ativo-ok">${recemPago ? 'Liberado! 🎉' : 'Teu Premium tá ativo'}</h1>
          <p>Todos os níveis de todos os jogos, desafios anteriores e card dourado tão liberados na conta <b>${c.email || ''}</b>${c.ate ? ' até <b>' + fmtDia(c.ate) + '</b>' : ' <b>pra sempre</b>'}.</p>
          <p class="pequeno">Em outro celular é só entrar com esse mesmo e-mail.${c.ate ? ' Pode renovar quando quiser: os dias somam.' : ''}</p>
          ${recemPago && c.perfil && !c.perfil.apelido ? '<button class="btn btn-grande btn-claro" type="button" data-a="apelido">Escolher meu nome no ranking</button>' : ''}
          <a class="btn btn-grande" href="#/">Bora jogar</a>
          ${c.ate ? '<div class="passo renovar"></div>' : ''}`;
        const ba = miolo.querySelector('[data-a=apelido]');
        if (ba) ba.addEventListener('click', () => formPerfil(miolo, { titulo: 'Como tu quer aparecer no ranking?', onPronto: () => vivo && ativo() }));
        const r = miolo.querySelector('.renovar');
        if (r && c.token) r.appendChild(caixaPlanos('Renovar'));
      }

      // Oferta: plano e preço primeiro; e-mail na mesma tela (só pra quem não entrou); depois do código, direto pro Pix.
      function oferta() {
        clearInterval(timer);
        miolo.innerHTML = `
          <span class="selo-premium">★ Premium</span>
          <h1>ca<span class="r-marca">R</span>deno Premium</h1>
          <p>Os 3 primeiros níveis de cada jogo e o desafio do dia são de graça pra sempre. O Premium é pra quem quer ir até o fim.</p>
          <div class="passo"></div>
          <h2 class="secao">O que o Premium libera</h2>
          <ul class="beneficios">
            ${BENEFICIOS.map(([t, d]) => `<li><strong>${t}</strong><span>${d}</span></li>`).join('')}
          </ul>
          <p class="nota">O Premium fica na tua conta (teu e-mail), vale em qualquer celular. Pagamento por Pix, processado pelo Mercado Pago. Sem cobrança automática. Dúvida? ${CFG.contato || ''}</p>`;
        miolo.querySelector('.passo').appendChild(caixaPlanos());
      }

      // Caixa com os planos + (sem conta) e-mail e código + botão do Pix
      function caixaPlanos(titulo) {
        const c = CA.conta();
        const cx = CA.el(`
          <div class="caixa-conta caixa-plano">
            <strong>${titulo || (PLANOS.length === 1 ? 'Libera tudo, pra sempre' : 'Escolhe teu plano')}</strong>
            <div class="planos ${PLANOS.length === 1 ? 'um' : ''}" role="radiogroup" aria-label="Plano">
              ${PLANOS.map(pl => `<button class="plano ${pl.destaque ? 'destaque' : ''}" type="button" role="radio" data-slug="${pl.slug}">
                ${pl.selo ? `<em>${pl.selo}</em>` : ''}
                <span>${pl.nome}</span><strong>${pl.preco}</strong><small>${pl.detalhe}</small>
              </button>`).join('')}
            </div>
            ${c ? `<small class="conta-de">Conta: <b>${c.email}</b> · <button class="link-mini" type="button" data-a="sair">trocar</button></small>
                   <button class="btn btn-grande" type="button" data-a="pix">Gerar Pix</button>`
              : `<form class="f-email">
                  <label for="email-premium">Teu e-mail (o Premium fica nele)</label>
                  <input id="email-premium" type="email" required autocomplete="email" placeholder="nome@email.com">
                  <button class="btn btn-grande" type="submit">Continuar</button>
                  <p class="nota">A gente manda um código de 6 números pro e-mail. Sem senha.</p>
                </form>
                <form class="f-codigo mov-aparece" hidden>
                  <label for="codigo-premium">Código que chegou no e-mail</label>
                  <input id="codigo-premium" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required placeholder="000000">
                  <button class="btn btn-grande" type="submit">Confirmar e gerar o Pix</button>
                  <button class="link-voltar" type="button" data-a="outro">Usar outro e-mail</button>
                  <p class="nota">Não chegou? Olha no spam ou nas promoções.</p>
                </form>`}
            <p class="erro-form mov-aparece" role="alert" hidden></p>
          </div>`);
        const err = cx.querySelector('.erro-form');
        const erro = m => { err.textContent = m || ''; err.hidden = !m; };
        const marcar = () => {
          cx.querySelectorAll('.plano').forEach(b => { const on = b.dataset.slug === escolhido; b.classList.toggle('escolhido', on); b.setAttribute('aria-checked', on); });
          const pl = PLANOS.find(p => p.slug === escolhido);
          const bp = cx.querySelector('[data-a=pix]');
          if (bp && pl) bp.textContent = `Gerar Pix de ${pl.preco}`;
        };
        cx.querySelectorAll('.plano').forEach(b => b.addEventListener('click', () => { escolhido = b.dataset.slug; marcar(); }));
        marcar();

        async function gerar(botao, email) {
          erro('');
          const txt = botao.textContent;
          botao.disabled = true; botao.textContent = 'Gerando o Pix...';
          try {
            const pix = await chamar('criar-pix', { produto: escolhido, email, ...(window.Funil ? { sessao: Funil.sessao(), ig: Funil.ig, origem: 'premium' } : {}) });
            const pl = PLANOS.find(p => p.slug === escolhido) || {};
            const p = { pedido: pix.pedido, copia_cola: pix.copia_cola || '', qr_base64: pix.qr_base64 || '', validade: Date.now() + 29 * 60e3, slug: escolhido, preco: pl.preco || '', email };
            CA.gravar('pixPendente', p);
            if (vivo) telaPix(p);
          } catch (x) { erro(x.message); botao.disabled = false; botao.textContent = txt; }
        }

        if (c) {
          cx.querySelector('[data-a=sair]').addEventListener('click', async () => { await CA.sairConta(); if (vivo) oferta(); });
          cx.querySelector('[data-a=pix]').addEventListener('click', e => gerar(e.currentTarget, c.email));
          return cx;
        }

        const fE = cx.querySelector('.f-email'), fC = cx.querySelector('.f-codigo');
        let email = '';
        fE.addEventListener('submit', async e => {
          e.preventDefault(); erro('');
          const b = fE.querySelector('button'); b.disabled = true; b.textContent = 'Mandando o código...';
          email = fE.querySelector('input').value.trim().toLowerCase();
          try {
            await chamar('jogo-codigo', { email });
            if (CA.funil) CA.funil('pediu_codigo', { origem: 'premium' });
            fE.hidden = true; fC.hidden = false;
            fC.querySelector('input').focus();
            CA.aviso('Código enviado pra ' + email);
          } catch (x) { erro(x.message); }
          b.disabled = false; b.textContent = 'Continuar';
        });
        fC.addEventListener('submit', async e => {
          e.preventDefault(); erro('');
          const b = fC.querySelector('button[type=submit]'); b.disabled = true; b.textContent = 'Confirmando...';
          try {
            const d = await chamar('jogo-entrar', { email, codigo: fC.querySelector('input').value.trim(), progresso: { ...CA.ler('fases', {}), ...CA.ler('niveis', {}) } });
            guardarConta(d);
            if (CA.funil) CA.funil('entrou_na_conta', { origem: 'premium' });
            enviarPendentes();
            if (CA.ehPremium()) { if (vivo) ativo(); return; } // já tinha Premium nesse e-mail
            await gerar(b, d.email || email); // apelido do ranking fica pra depois, na conta: nada entre o código e o Pix
          } catch (x) { erro(x.message); b.disabled = false; b.textContent = 'Confirmar e gerar o Pix'; }
        });
        fC.querySelector('[data-a=outro]').addEventListener('click', () => { fC.hidden = true; fE.hidden = false; erro(''); });
        return cx;
      }

      // Tela do Pix: copiar é o principal (no celular a pessoa paga no app do banco do mesmo aparelho).
      function telaPix(p) {
        clearInterval(timer);
        const pl = PLANOS.find(x => x.slug === p.slug);
        miolo.innerHTML = `
          <h1>Paga no Pix</h1>
          <p class="pix-valor">${pl ? 'caRdeno Premium · ' + pl.nome + ' · ' : ''}<b>${p.preco || ''}</b></p>
          <button class="btn btn-grande btn-copiar-pix" type="button" data-a="copiar">Copiar código Pix</button>
          <ol class="passos-pix">
            <li>Toca em <b>Copiar código Pix</b></li>
            <li>Abre o app do banco e escolhe <b>Pix copia e cola</b></li>
            <li>Paga e volta aqui: libera sozinho</li>
          </ol>
          <textarea class="copia-cola" readonly rows="3" aria-label="Pix copia e cola">${p.copia_cola}</textarea>
          <p class="esperando"><span class="pontinho"></span> Esperando o pagamento... <span class="pix-tempo"></span></p>
          ${p.qr_base64 ? `<details class="pix-qr"><summary>Vai pagar com outro celular? Mostrar QR code</summary><img class="qr" alt="QR code do Pix" src="data:image/png;base64,${p.qr_base64}"></details>` : ''}
          <button class="link-voltar" type="button" data-a="cancelar">Trocar de plano ou gerar outro Pix</button>`;
        const bc = miolo.querySelector('[data-a=copiar]');
        bc.addEventListener('click', () => {
          const ok = CA.copiarJa(p.copia_cola);
          if (!ok) miolo.querySelector('.copia-cola').select();
          bc.textContent = 'Copiado! Agora abre o app do banco';
          bc.classList.add('copiado');
          CA.aviso('Código Pix copiado!');
          setTimeout(() => { if (bc.isConnected) { bc.textContent = 'Copiar de novo'; bc.classList.remove('copiado'); } }, 4000);
        });
        miolo.querySelector('[data-a=cancelar]').addEventListener('click', () => { CA.gravar('pixPendente', null); if (vivo) (CA.ehPremium() ? ativo() : oferta()); });
        const tempo = miolo.querySelector('.pix-tempo');
        const relogio = () => {
          const s = Math.max(0, Math.round((p.validade - Date.now()) / 1000));
          tempo.textContent = `O código vale mais ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
          return s;
        };
        relogio();
        let n = 0;
        timer = setInterval(() => {
          if (!vivo) { clearInterval(timer); return; }
          if (relogio() <= 0) { venceu(); return; }
          if (++n % 4 === 0) conferir(); // confere a cada 4 s
        }, 1000);
        conferir();
      }

      function venceu() {
        clearInterval(timer);
        CA.gravar('pixPendente', null);
        oferta();
        const e = miolo.querySelector('.erro-form');
        if (e) { e.textContent = 'Aquele Pix venceu (vale 30 minutos). Gera outro aqui.'; e.hidden = false; }
      }

      async function conferir() {
        const p = CA.pixPendente();
        if (!p || conferindo) return;
        conferindo = true;
        try {
          const st = await chamar('status-pedido', { pedido: p.pedido });
          if (st.status === 'pago') {
            clearInterval(timer);
            CA.gravar('pixPendente', null);
            await CA.sincronizar();
            if (!CA.ehPremium()) guardarConta({ ...CA.conta(), premium: true, ate: null });
            CA.som('recorde');
            if (vivo) ativo(true);
          } else if (st.status === 'cancelado') { if (vivo) venceu(); else CA.gravar('pixPendente', null); }
        } catch (e) { /* tenta de novo no próximo */ }
        conferindo = false;
      }

      return () => { vivo = false; clearInterval(timer); document.removeEventListener('visibilitychange', aoVoltar); };
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
            origem: novo ? 'cadastro' : volta ? 'ranking' : 'conta',
            titulo: novo ? 'Cria tua conta pra jogar' : volta ? 'Cria tua conta grátis' : 'Entra com teu e-mail',
            texto: novo ? 'É grátis e sem senha, só teu e-mail. Assim teus níveis e estrelas ficam salvos e tu aparece no ranking. Já tem conta? Usa o mesmo e-mail.'
              : volta ? 'Aí tu entra no ranking (com teu @, se quiser) e tua colocação aparece na arte dos stories. Teus tempos de hoje já contam. Sem senha.'
              : 'Pra entrar no ranking, salvar teus níveis e teu Premium e continuar em qualquer celular. Sem senha.',
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
            <small>${CA.ehPremium() ? '★ Premium ativo' + (c.ate ? ' até ' + fmtDia(c.ate) : ' pra sempre') : 'Plano grátis'} · ${est} estrelas</small>
            <div class="perfil-linha">
              <span>No ranking: <b>${nomeRanking()}</b>${(c.perfil || {}).arroba && !(c.perfil || {}).arroba_confirmado ? ' <em class="sem-ok">@ não confirmado</em>' : ''}</span>
              <button class="link-mini" type="button" data-a="perfil">editar</button>
            </div>
            ${(c.perfil || {}).arroba && !(c.perfil || {}).arroba_confirmado ? '<button class="btn btn-claro" type="button" data-a="confirmar">Confirmar meu @</button>' : ''}
            <a class="btn btn-grande ${CA.ehPremium() ? 'btn-claro' : ''}" href="#/premium">${CA.ehPremium() ? (c.ate ? 'Renovar o Premium' : 'Ver meu Premium') : 'Ver o Premium'}</a>
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
