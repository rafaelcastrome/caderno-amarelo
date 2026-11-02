// Jogo "Desafios do Caderno Amarelo": estado, checagem de resposta, progressão e paywall Pix.
// Usa window.DESAFIOS (desafios-dados.js) e window.LOJA_CONFIG (config.js).
(function () {
  // ---------- configuração do jogo ----------
  const JOGO = {
    produto: 'jogo-desafios',   // slug na tabela "produtos" do Supabase (ver supabase/jogo-desafios.sql)
    preco: 3.90,                 // só pra exibir; o valor cobrado vem SEMPRE do banco
    // false = Pix de demonstração e pagamento validado pelo toggle (pedido do Rafael, 02/11).
    // true  = chama a função criar-pix de verdade e confere o pagamento em status-pedido.
    pixReal: false,
    chaveSalva: 'desafios:jogo'
  };

  const CFG = window.LOJA_CONFIG || {};
  const API = CFG.supabaseUrl ? CFG.supabaseUrl + '/functions/v1' : null;
  const DESAFIOS = window.DESAFIOS || [];
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // ---------- validação (fuzzy match simples) ----------
  // "  São   IGUAIS! " -> "sao iguais"
  function normalizar(txt) {
    return String(txt ?? '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // tira acentos
      .toLowerCase()
      .replace(/[º°ª]/g, 'o')
      .replace(/[^a-z0-9: ]+/g, ' ')                    // pontuação vira espaço
      .replace(/\s+/g, ' ')                              // espaços extras
      .trim();
  }

  function checarResposta(desafio, tentativa) {
    const t = normalizar(tentativa);
    if (!t) return false;
    const junto = x => x.replace(/ /g, '');   // "guarda-sol", "guarda sol" e "guardasol" valem igual
    return [desafio.respostaCorreta, ...(desafio.aceitas || [])].some(r => { const n = normalizar(r); return n === t || junto(n) === junto(t); });
  }

  // ---------- estado ----------
  const salvo = ler();
  const estado = {
    indice: 0,               // desafio na tela (posição no array)
    resolvido: false,        // acertou o desafio atual? libera o "Próximo"
    isPremium: !!salvo.isPremium,
    showPaywall: false,
    pix: null,               // { pedido, qr_base64, copia_cola, valor }
    pagamentoValidado: false,
    terminou: false,
    erros: 0
  };

  function setEstado(parcial) {
    Object.assign(estado, parcial);
    render();
  }

  function ler() { try { return JSON.parse(localStorage.getItem(JOGO.chaveSalva)) || {}; } catch (_) { return {}; } }
  function salvar() { try { localStorage.setItem(JOGO.chaveSalva, JSON.stringify({ isPremium: estado.isPremium })); } catch (_) {} }

  const bloqueado = d => d.isPremium && !estado.isPremium;

  // ---------- ações ----------
  function responder(e) {
    e.preventDefault();
    if (estado.resolvido) return;
    const campo = $('#resposta');
    const d = DESAFIOS[estado.indice];
    if (!campo.value.trim()) { campo.focus(); return; }

    if (checarResposta(d, campo.value)) {
      setEstado({ resolvido: true });
      return;
    }
    // Errou: tremor no campo, limpa e deixa tentar de novo.
    estado.erros++;
    campo.value = '';
    campo.classList.remove('treme');
    void campo.offsetWidth;             // reinicia a animação se errar duas vezes seguidas
    campo.classList.add('treme');
    const msg = $('#msg-erro');
    msg.textContent = ['Errou! Tenta de novo.', 'Quase... pensa diferente!', 'Nada ainda. Lê a pergunta de novo!'][estado.erros % 3];
    msg.classList.add('visivel');
    if (navigator.vibrate) navigator.vibrate(120);
    campo.focus();
  }

  function proximo() {
    if (!estado.resolvido) return;
    const prox = estado.indice + 1;
    if (prox >= DESAFIOS.length) { setEstado({ terminou: true }); return; }
    // Do desafio 2 pro 3 (primeiro premium): abre o paywall em vez de avançar.
    if (bloqueado(DESAFIOS[prox])) { setEstado({ showPaywall: true }); return; }
    estado.erros = 0;
    setEstado({ indice: prox, resolvido: false });
  }

  function recomecar() {
    estado.erros = 0;
    setEstado({ indice: 0, resolvido: false, terminou: false });
  }

  // ---------- integração Mercado Pago (Pix) ----------
  async function chamar(fn, corpo) {
    const r = await fetch(`${API}/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CFG.supabaseAnonKey, Authorization: `Bearer ${CFG.supabaseAnonKey}` },
      body: JSON.stringify(corpo)
    });
    const dados = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(dados.erro || 'Não deu certo agora. Tenta de novo em instantes.');
    return dados;
  }

  // Gera a cobrança Pix e devolve { pedido, qr_base64, copia_cola, valor }.
  async function gerarPixDesbloqueio(email) {
    if (JOGO.pixReal && API) return chamar('criar-pix', { produto: JOGO.produto, email });
    await new Promise(r => setTimeout(r, 700)); // simula a ida ao servidor
    return {
      pedido: 'demo-' + Date.now(),
      qr_base64: null,
      copia_cola: '00020101021226830014br.gov.bcb.pix2561DEMONSTRACAO-CADERNO-AMARELO5204000053039865405' + JOGO.preco.toFixed(2) + '5802BR6304DEMO',
      valor: JOGO.preco
    };
  }

  let timerPix = null;
  function acompanharPagamento(id) {
    clearInterval(timerPix);
    if (!(JOGO.pixReal && API)) return;   // no modo simulado quem valida é o toggle
    timerPix = setInterval(async () => {
      try {
        const st = await chamar('status-pedido', { pedido: id });
        if (st.status === 'pago') confirmarPagamento();
      } catch (_) { /* tenta de novo no próximo ciclo */ }
    }, 4000);
  }

  // Pagamento validado (pelo Mercado Pago ou pelo toggle): libera o resto do jogo.
  function confirmarPagamento() {
    clearInterval(timerPix);
    estado.pagamentoValidado = true;
    estado.isPremium = true;
    salvar();
    const prox = estado.resolvido ? estado.indice + 1 : estado.indice;
    $('#paywall-corpo').innerHTML = `<div class="pw-ok"><div class="pw-ok-icone">🔓</div><h3>Liberado!</h3><p>Bora pro desafio ${String(prox + 1).padStart(2, '0')}.</p></div>`;
    setTimeout(() => {
      estado.erros = 0;
      setEstado({ showPaywall: false, pix: null, indice: prox, resolvido: false });
    }, 1100);
  }

  // ---------- render ----------
  function render() {
    renderProgresso();
    if (estado.terminou) renderFim(); else renderDesafio();
    renderPaywall();
  }

  function renderProgresso() {
    const feitos = estado.terminou ? DESAFIOS.length : estado.indice + (estado.resolvido ? 1 : 0);
    const proximoBloqueado = DESAFIOS.findIndex(bloqueado);
    $('#progresso').innerHTML = `
      <div class="prog-texto"><span>Desafio <strong>${Math.min(estado.indice + 1, DESAFIOS.length)}</strong> de ${DESAFIOS.length}</span>
        <span>${proximoBloqueado >= 0 ? '🔒 ' + (DESAFIOS.length - proximoBloqueado) + ' bloqueados' : '🔓 tudo liberado'}</span></div>
      <div class="prog-barra" role="progressbar" aria-valuemin="0" aria-valuemax="${DESAFIOS.length}" aria-valuenow="${feitos}">
        <div class="prog-cheio" style="width:${(feitos / DESAFIOS.length * 100).toFixed(1)}%"></div>
        ${proximoBloqueado > 0 ? `<div class="prog-cadeado" style="left:${(proximoBloqueado / DESAFIOS.length * 100).toFixed(1)}%"></div>` : ''}
      </div>`;
  }

  let ultimoRender = null;
  function renderDesafio() {
    const d = DESAFIOS[estado.indice];
    const chave = d.id + ':' + estado.resolvido;
    if (ultimoRender === chave) return;       // evita redesenhar o card à toa (perderia a animação)
    const mudouDesafio = !ultimoRender || !ultimoRender.startsWith(d.id + ':');
    ultimoRender = chave;

    if (mudouDesafio) {
      $('#jogo').innerHTML = `
        <article class="desafio entra" data-tipo="${d.tipo}">
          <span class="etiqueta">desafio ${String(d.id).padStart(2, '0')}</span>
          <h2>${esc(d.titulo)}</h2>
          <p class="pergunta">${esc(d.pergunta)}</p>
          ${d.tipo === 'imagem' ? `<figure class="desafio-img">${d.imagem}</figure>` : ''}
          <form id="form-resposta" autocomplete="off">
            <label class="sr" for="resposta">Tua resposta</label>
            <input id="resposta" name="resposta" placeholder="Tua resposta" enterkeyhint="send" autocapitalize="off" spellcheck="false">
            <button class="btn" type="submit" id="btn-responder">Responder</button>
          </form>
          <p class="msg-erro" id="msg-erro" aria-live="polite"></p>
          <div class="revela-resposta" id="revela" aria-live="polite">
            <div class="revela-dentro">
              <p class="certo">✔ Acertou!</p>
              <p class="resposta-completa">Resposta: <strong>${esc(d.respostaCorreta)}</strong></p>
              <p class="explicacao">${esc(d.explicacao)}</p>
            </div>
          </div>
          <button class="btn btn-grande" id="btn-proximo" type="button" disabled>${estado.indice === DESAFIOS.length - 1 ? 'Ver resultado →' : 'Próximo →'}</button>
        </article>`;
      $('#form-resposta').addEventListener('submit', responder);
      $('#btn-proximo').addEventListener('click', proximo);
      $('#resposta').addEventListener('input', () => $('#msg-erro').classList.remove('visivel'));
      $('#resposta').addEventListener('animationend', e => e.target.classList.remove('treme'));
      if (!estado.showPaywall) setTimeout(() => $('#resposta')?.focus({ preventScroll: true }), 50);
    }

    const card = $('.desafio');
    card.classList.toggle('resolvido', estado.resolvido);
    $('#resposta').disabled = estado.resolvido;
    $('#btn-responder').disabled = estado.resolvido;
    $('#btn-proximo').disabled = !estado.resolvido;
    if (estado.resolvido) {
      $('#msg-erro').classList.remove('visivel');
      $('#resposta').value = DESAFIOS[estado.indice].respostaCorreta;
      $('#btn-proximo').focus({ preventScroll: true });
    }
  }

  function renderFim() {
    ultimoRender = null;
    $('#jogo').innerHTML = `
      <article class="desafio entra fim">
        <span class="etiqueta">zerou!</span>
        <h2>Tu passou pelos ${DESAFIOS.length} desafios 🏆</h2>
        <p class="pergunta">Agora desafia alguém: manda o link e vê quanto tempo a pessoa leva.</p>
        <div class="fim-botoes">
          <button class="btn btn-grande" id="btn-compartilhar" type="button">Desafiar um amigo</button>
          <button class="btn btn-claro btn-grande" id="btn-recomecar" type="button">Jogar de novo</button>
        </div>
      </article>`;
    $('#btn-recomecar').addEventListener('click', recomecar);
    $('#btn-compartilhar').addEventListener('click', async () => {
      const dados = { title: 'Desafios do Caderno Amarelo', text: `Duvido tu passar dos ${DESAFIOS.length} desafios do Caderno Amarelo!`, url: location.href.split('#')[0] };
      try {
        if (navigator.share) await navigator.share(dados);
        else { await navigator.clipboard.writeText(dados.url); $('#btn-compartilhar').textContent = 'Link copiado!'; }
      } catch (_) {}
    });
  }

  // ---------- paywall ----------
  let paywallAberto = false;
  function renderPaywall() {
    const fundo = $('#paywall');
    document.body.classList.toggle('com-paywall', estado.showPaywall);
    fundo.classList.toggle('aberto', estado.showPaywall);
    fundo.setAttribute('aria-hidden', String(!estado.showPaywall));
    if (!estado.showPaywall) { paywallAberto = false; return; }
    if (paywallAberto) return;
    paywallAberto = true;
    telaOferta();
  }

  function telaOferta() {
    const premium = DESAFIOS.filter(d => d.isPremium).length;
    $('#paywall-corpo').innerHTML = `
      <div class="pw-cadeado" aria-hidden="true">🔒</div>
      <h3>Mandou bem nos 2 primeiros!</h3>
      <p>Faltam <strong>${premium} desafios</strong>, cada vez mais difíceis. Desbloqueia todos de uma vez com Pix.</p>
      <ul class="pw-lista">
        <li>✔ ${premium} desafios novos (ilusões, pegadinhas e enigmas)</li>
        <li>✔ Explicação de cada resposta</li>
        <li>✔ Fica liberado neste aparelho</li>
      </ul>
      <form id="form-desbloquear">
        <label for="pw-email">Teu e-mail (pro comprovante)</label>
        <input id="pw-email" type="email" required autocomplete="email" placeholder="voce@email.com">
        <button class="btn btn-grande" type="submit" id="btn-desbloquear">Desbloquear por ${brl(JOGO.preco)}</button>
      </form>
      <p class="nota">Pagamento por Pix, processado pelo Mercado Pago.</p>`;
    $('#form-desbloquear').addEventListener('submit', async e => {
      e.preventDefault();
      const botao = $('#btn-desbloquear');
      botao.disabled = true; botao.textContent = 'Gerando Pix...';
      try {
        const pix = await gerarPixDesbloqueio($('#pw-email').value.trim());
        estado.pix = pix;
        telaPix(pix);
        acompanharPagamento(pix.pedido);
      } catch (err) {
        botao.disabled = false; botao.textContent = `Desbloquear por ${brl(JOGO.preco)}`;
        alert(err.message);
      }
    });
  }

  function telaPix(pix) {
    const simulado = !(JOGO.pixReal && API);
    const qr = pix.qr_base64
      ? `<img src="data:image/png;base64,${pix.qr_base64}" alt="QR Code do Pix">`
      : '<span class="mao" style="font-size:26px">QR Code aqui</span>';
    $('#paywall-corpo').innerHTML = `
      ${simulado ? '<div class="aviso-demo">MODO TESTE · nenhum pagamento é cobrado</div>' : ''}
      <h3>Paga com Pix</h3>
      <p class="nota">Abre o app do banco, escolhe Pix e lê o QR Code, ou copia o código.</p>
      <div class="qr">${qr}</div>
      <div class="copia"><input id="pw-copia" readonly value="${esc(pix.copia_cola)}"><button class="btn btn-claro" id="pw-copiar" type="button">Copiar</button></div>
      <div class="status"><span class="bolinha"></span> Esperando o pagamento...</div>
      ${simulado ? `
      <label class="toggle">
        <input type="checkbox" id="toggle-pago">
        <span class="trilho-toggle" aria-hidden="true"></span>
        <span>Simular pagamento validado</span>
      </label>` : '<p class="nota" style="text-align:center">Pode deixar essa tela aberta. Libera sozinho quando o Pix cair.</p>'}`;
    $('#pw-copiar').addEventListener('click', () => {
      navigator.clipboard?.writeText(pix.copia_cola);
      $('#pw-copiar').textContent = 'Copiado!';
    });
    $('#toggle-pago')?.addEventListener('change', e => { if (e.target.checked) confirmarPagamento(); });
  }

  function fecharPaywall() {
    if (estado.pagamentoValidado) return;
    clearInterval(timerPix);
    setEstado({ showPaywall: false });
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-fechar-paywall]') || e.target.id === 'paywall') fecharPaywall();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && estado.showPaywall) fecharPaywall(); });

  // Expõe o estado e as funções pra testar no console.
  window.DesafiosJogo = { estado, normalizar, checarResposta, gerarPixDesbloqueio, confirmarPagamento, JOGO, render };
  render();
})();
