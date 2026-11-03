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
  const SECOES = {
    'Natal': ['Especial de Natal', 'Jogos pra ceia, coisas pra montar e colorir em família.'],
    'Jogos': ['Jogos pra imprimir', 'Pra jogar com amigos e família. Só precisa de papel e lápis.'],
    'Mente e mágica': ['Truques de mente', 'Os truques que bombam nos nossos vídeos, explicados passo a passo.'],
  };
  const ancora = c => 'cat-' + c.normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase();

  function trilhoHTML(lista) {
    return lista.map(p => `<div class="trilho-item">${cardHTML(p)}</div>`).join('');
  }

  function ligarSetas(sec) {
    const tr = sec.querySelector('.trilho');
    sec.querySelectorAll('[data-seta]').forEach(b => b.addEventListener('click', () => {
      tr.scrollBy({ left: Number(b.dataset.seta) * tr.clientWidth * 0.85, behavior: 'smooth' });
    }));
  }

  function contagem() {
    const alvo = () => { const h = new Date(); return new Date(h.getFullYear(), 11, 25); };
    const dois = n => String(n).padStart(2, '0');
    const tick = () => {
      let s = Math.max(0, Math.floor((alvo() - new Date()) / 1000));
      $('#cd-d').textContent = dois(Math.floor(s / 86400)); s %= 86400;
      $('#cd-h').textContent = dois(Math.floor(s / 3600)); s %= 3600;
      $('#cd-m').textContent = dois(Math.floor(s / 60)); $('#cd-s').textContent = dois(s % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  function leque(produtos) {
    const el = $('#leque');
    if (!el) return;
    const capas = produtos.slice(0, 5);
    el.innerHTML = capas.map((p, i) => `<a class="leque-capa" href="produto.html?p=${encodeURIComponent(p.slug)}" style="--i:${i}" tabindex="-1"><img src="${esc(p.capa)}" alt=""></a>`).join('');
    if (window.Efeitos && Efeitos.calmo) return;
    let k = 0;
    setInterval(() => {
      k = (k + 1) % capas.length;
      el.querySelectorAll('.leque-capa').forEach((c, i) => c.style.setProperty('--i', (i - k + capas.length) % capas.length));
    }, 2800);
  }

  function palavraQueTroca() {
    const el = $('#troca');
    const palavras = ['jogar', 'colorir', 'montar', 'imprimir', 'impressionar'];
    if (!el || (window.Efeitos && Efeitos.calmo)) return;
    let i = 0;
    setInterval(() => {
      el.classList.add('sai');
      setTimeout(() => { i = (i + 1) % palavras.length; el.textContent = palavras[i]; el.classList.remove('sai'); }, 260);
    }, 2200);
  }

  async function iniciarHome() {
    const produtos = await carregarProdutos();
    const ativos = produtos.filter(p => p.ativo);
    const cats = [...new Set(ativos.map(p => p.categoria || 'Outros'))];
    const hoje = new Date(), dias = Math.ceil((new Date(hoje.getFullYear(), 11, 25) - hoje) / 864e5);
    const temporadaNatal = cats.includes('Natal') && dias >= 0 && dias <= 60;

    if (temporadaNatal) {
      $('#natal').hidden = false;
      $('#natal .trilho').innerHTML = trilhoHTML(ativos.filter(p => p.categoria === 'Natal'));
      $('#natal .trilho-wrap').insertAdjacentHTML('beforeend', '<button class="seta esq" data-seta="-1" aria-label="Anterior">‹</button><button class="seta dir" data-seta="1" aria-label="Próximo">›</button>');
      ligarSetas($('#natal')); contagem();
    }
    const outras = cats.filter(c => !(temporadaNatal && c === 'Natal'));
    $('#outras-secoes').innerHTML = outras.map(c => {
      const [tit, sub] = SECOES[c] || [c, ''];
      return `<section class="secao-cat revela" id="${ancora(c)}"><div class="wrap"><h2 class="titulo-secao">${esc(tit)}</h2><p class="sub-secao">${esc(sub)}</p></div>
        <div class="trilho-wrap"><div class="trilho">${trilhoHTML(produtos.filter(p => (p.categoria || 'Outros') === c))}</div>
        <button class="seta esq" data-seta="-1" aria-label="Anterior">‹</button><button class="seta dir" data-seta="1" aria-label="Próximo">›</button></div></section>`;
    }).join('');
    document.querySelectorAll('.secao-cat').forEach(ligarSetas);

    // menu do topo com as categorias
    const links = (temporadaNatal ? ['Natal'] : []).concat(outras)
      .map(c => `<a href="#${c === 'Natal' && temporadaNatal ? 'natal' : ancora(c)}">${esc(c === 'Mente e mágica' ? 'Mente' : c)}</a>`).join('');
    $('#menu-cats').insertAdjacentHTML('afterbegin', links);

    const vitrine = temporadaNatal ? ativos.filter(p => p.categoria === 'Natal') : ativos;
    leque(vitrine);
    palavraQueTroca();
    if (CFG.contato) $('#contato').innerHTML = `<a href="mailto:${esc(CFG.contato)}">${esc(CFG.contato)}</a>`;
    if (window.Efeitos) Efeitos.revelar();
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
    if (p.previas && p.previas.length) {
      $('#previas').innerHTML = p.previas.map((s, i) => `<a role="button" tabindex="0" data-i="${i}"><img src="${esc(s)}" alt="Página ${i + 1} de dentro do ${esc(p.nome)}" loading="lazy"></a>`).join('');
      lightbox(p.previas);
    } else $('#bloco-previas').remove();
    const rel = produtos.filter(x => x.ativo && x.slug !== p.slug).sort((a, b) => (b.categoria === p.categoria) - (a.categoria === p.categoria)).slice(0, 8);
    if (rel.length) { $('#relacionados').hidden = false; $('#trilho-rel').innerHTML = rel.map(x => `<div class="trilho-item">${cardHTML(x)}</div>`).join(''); }
    if (window.Efeitos) Efeitos.revelar();
    if (p.titulo_conteudo) $('#titulo-conteudo').textContent = p.titulo_conteudo;
    if (p.conteudo.length) $('#conteudo').innerHTML = p.conteudo.map(i => `<li>${esc(i)}</li>`).join('');
    else $('#bloco-conteudo').remove();
    $('#faq').innerHTML = p.faq.map(([q, r]) => `<details><summary>${esc(q)}</summary><p>${esc(r)}</p></details>`).join('') + $('#faq').innerHTML;
    document.querySelectorAll('[data-comprar]').forEach(b => b.addEventListener('click', () => abrirCheckout(p)));
    retomarPedido(p);
  }

  // prévias abrem grandes por cima da página, com setas pra passar
  function lightbox(fotos) {
    const lb = $('#lightbox'), img = lb.querySelector('img');
    let i = 0;
    const mostra = n => { i = (n + fotos.length) % fotos.length; img.src = fotos[i]; };
    $('#previas').addEventListener('click', e => {
      const a = e.target.closest('a[data-i]'); if (!a) return;
      e.preventDefault(); mostra(Number(a.dataset.i)); lb.classList.add('aberto');
    });
    lb.querySelector('.lb-ant').onclick = () => mostra(i - 1);
    lb.querySelector('.lb-prox').onclick = () => mostra(i + 1);
    lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.lb-fechar')) lb.classList.remove('aberto'); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('aberto')) return;
      if (e.key === 'Escape') lb.classList.remove('aberto');
      if (e.key === 'ArrowLeft') mostra(i - 1);
      if (e.key === 'ArrowRight') mostra(i + 1);
    });
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
