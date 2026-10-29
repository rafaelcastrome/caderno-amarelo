// Loja do Caderno Amarelo: catálogo, página de produto e checkout Pix.
// Sem back-end configurado (config.js vazio), roda em modo demonstração.
(function () {
  const CFG = window.LOJA_CONFIG || {};
  const API = CFG.supabaseUrl ? CFG.supabaseUrl + '/functions/v1' : null;
  const DEMO = !API;

  const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = s => document.querySelector(s);

  async function carregarProdutos() {
    const r = await fetch('produtos.json', { cache: 'no-cache' });
    return r.json();
  }

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

  function precoHTML(p) {
    const antigo = p.preco_antigo ? `<s>${brl(p.preco_antigo)}</s>` : '';
    return `<span class="preco">${antigo}${brl(p.preco)}<small>no Pix</small></span>`;
  }

  function cardHTML(p) {
    const selo = p.selo ? `<span class="selo ${p.ativo ? '' : 'breve'}">${esc(p.selo)}</span>` : '';
    const acao = p.ativo ? '<span class="btn" style="padding:8px 14px;font-size:15px">Ver →</span>' : '<span class="mao" style="font-size:22px">em breve</span>';
    const href = p.ativo ? `produto.html?p=${encodeURIComponent(p.slug)}` : '#';
    return `<a class="card ${p.ativo ? '' : 'inativo'}" href="${href}">
      ${selo}
      <div class="card-capa"><img src="${esc(p.capa)}" alt="Capa: ${esc(p.nome)}" loading="lazy"></div>
      <div class="card-corpo">
        <h3>${esc(p.nome)}</h3>
        <p>${esc(p.subtitulo)}</p>
        <div class="card-rodape">${p.ativo ? precoHTML(p) : ''}${acao}</div>
      </div></a>`;
  }

  // ---------- página inicial ----------
  async function iniciarHome() {
    const produtos = await carregarProdutos();
    $('#grade').innerHTML = produtos.map(cardHTML).join('');
    const dest = produtos.find(p => p.destaque && p.ativo);
    if (dest) {
      $('#hero-capa').src = dest.capa;
      $('#hero-cta').href = `produto.html?p=${dest.slug}`;
      $('#hero-cta').textContent = `Quero o ${dest.nome} por ${brl(dest.preco)} →`;
    }
  }

  // ---------- página do produto ----------
  async function iniciarProduto() {
    const slug = new URLSearchParams(location.search).get('p');
    const produtos = await carregarProdutos();
    const p = produtos.find(x => x.slug === slug && x.ativo);
    if (!p) { location.href = 'index.html'; return; }
    document.title = `${p.nome} · Caderno Amarelo`;
    $('#capa').src = p.capa; $('#capa').alt = `Capa: ${p.nome}`;
    $('#nome').textContent = p.nome;
    $('#subtitulo').textContent = p.subtitulo;
    $('#descricao').textContent = p.descricao;
    $('#preco').innerHTML = precoHTML(p);
    $('#preco-barra').innerHTML = precoHTML(p);
    $('#formato').textContent = p.formato;
    $('#inclui').innerHTML = p.inclui.map(i => `<li>${esc(i)}</li>`).join('');
    if (p.conteudo.length) $('#conteudo').innerHTML = p.conteudo.map(i => `<li>${esc(i)}</li>`).join('');
    else $('#bloco-conteudo').remove();
    $('#faq').innerHTML = p.faq.map(([q, r]) => `<details><summary>${esc(q)}</summary><p>${esc(r)}</p></details>`).join('') + $('#faq').innerHTML;
    document.querySelectorAll('[data-comprar]').forEach(b => b.addEventListener('click', () => abrirCheckout(p)));
    retomarPedido(p);
  }

  // ---------- checkout Pix ----------
  let timer = null;

  function modal(html) {
    $('#checkout-corpo').innerHTML = (DEMO ? '<div class="aviso-demo">MODO DEMONSTRAÇÃO · nenhum pagamento é cobrado</div>' : '') + html;
    $('#checkout').classList.add('aberto');
  }
  function fecharModal() { $('#checkout').classList.remove('aberto'); clearInterval(timer); }

  function abrirCheckout(p) {
    modal(`<h3>${esc(p.nome)}</h3>
      <div>${precoHTML(p)}</div>
      <form id="form-pix">
        <label for="email">Teu e-mail (pra receber o PDF)</label>
        <input id="email" type="email" required autocomplete="email" placeholder="voce@email.com">
        <p class="nota">Usamos o e-mail só pra te mandar o kit e o comprovante.</p>
        <button class="btn btn-grande" style="margin-top:16px" type="submit">Gerar Pix de ${brl(p.preco)}</button>
      </form>`);
    $('#form-pix').addEventListener('submit', async e => {
      e.preventDefault();
      const email = $('#email').value.trim();
      const botao = e.target.querySelector('button');
      botao.disabled = true; botao.textContent = 'Gerando Pix...';
      try {
        const pedido = DEMO
          ? { pedido: 'demo-' + Date.now(), qr_base64: null, copia_cola: '00020126...DEMONSTRACAO', valor: p.preco }
          : await chamar('criar-pix', { produto: p.slug, email });
        try { localStorage.setItem('pedido:' + p.slug, pedido.pedido); } catch (_) {}
        mostrarPix(p, pedido);
      } catch (err) {
        botao.disabled = false; botao.textContent = `Gerar Pix de ${brl(p.preco)}`;
        alert(err.message);
      }
    });
  }

  function mostrarPix(p, pedido) {
    const qr = pedido.qr_base64
      ? `<img src="data:image/png;base64,${pedido.qr_base64}" alt="QR Code do Pix">`
      : '<span class="mao" style="font-size:26px">QR Code aqui</span>';
    modal(`<h3>Paga com Pix</h3>
      <p class="nota">Abre o app do banco, escolhe Pix e lê o QR Code, ou copia o código.</p>
      <div class="qr">${qr}</div>
      <div class="copia"><input id="copia" readonly value="${esc(pedido.copia_cola)}"><button class="btn btn-claro" id="copiar" type="button" style="padding:10px 14px">Copiar</button></div>
      <div class="status"><span class="bolinha"></span> Esperando o pagamento...</div>
      <p class="nota" style="text-align:center">Pode deixar essa tela aberta. O download aparece sozinho quando o Pix cair.</p>
      ${DEMO ? '<button class="btn btn-claro btn-grande" id="simular" style="margin-top:12px">Simular pagamento aprovado</button>' : ''}`);
    $('#copiar').addEventListener('click', () => {
      navigator.clipboard?.writeText(pedido.copia_cola);
      $('#copiar').textContent = 'Copiado!';
    });
    if (DEMO) { $('#simular').addEventListener('click', () => mostrarSucesso(p, '#')); return; }
    acompanhar(p, pedido.pedido);
  }

  function acompanhar(p, id) {
    clearInterval(timer);
    timer = setInterval(async () => {
      try {
        const st = await chamar('status-pedido', { pedido: id });
        if (st.status === 'pago') { clearInterval(timer); mostrarSucesso(p, st.download); }
      } catch (_) { /* tenta de novo no próximo ciclo */ }
    }, 4000);
  }

  function mostrarSucesso(p, link) {
    modal(`<div class="sucesso">
      <div class="grande">🎉</div>
      <h3>Pagamento aprovado!</h3>
      <p class="nota">Teu ${esc(p.nome)} tá pronto. Também mandamos o link pro teu e-mail.</p>
      <a class="btn btn-grande" style="margin-top:16px" href="${esc(link)}" target="_blank" rel="noopener">Baixar o PDF</a>
      <p class="nota">O link vale por 7 dias. Salva o PDF no celular!</p></div>`);
  }

  // Se a pessoa fechou a página antes do Pix cair, retoma ao voltar.
  async function retomarPedido(p) {
    if (DEMO) return;
    let id = null;
    try { id = localStorage.getItem('pedido:' + p.slug); } catch (_) {}
    if (!id) return;
    try {
      const st = await chamar('status-pedido', { pedido: id });
      if (st.status === 'pago') mostrarSucesso(p, st.download);
    } catch (_) {}
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-fechar]') || e.target.id === 'checkout') fecharModal();
  });

  window.Loja = { iniciarHome, iniciarProduto };
})();
