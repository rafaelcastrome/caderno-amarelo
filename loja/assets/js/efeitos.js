// Efeitos visuais da loja: desenhos flutuando no fundo, aparecer ao rolar, transição entre páginas.
// Tudo desliga sozinho pra quem pediu menos movimento no celular/computador.
(function () {
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DESENHOS = ['arvore', 'estrela', 'presente', 'sino', 'bengala', 'boneco_neve', 'bola', 'meia', 'biscoito', 'rena', 'gorro', 'floco', 'vela', 'luva', 'caneca', 'guirlanda', 'noel', 'pirulito'];

  function fundo() {
    const alvo = document.querySelector('.fundo-animado');
    if (!alvo) return;
    const qtd = window.innerWidth < 700 ? 9 : 16;
    for (let i = 0; i < qtd; i++) {
      const img = document.createElement('img');
      img.src = `assets/img/doodles/${DESENHOS[(i * 7) % DESENHOS.length]}.svg`;
      img.alt = '';
      const tam = 46 + Math.random() * 54;
      img.style.cssText = `left:${Math.random() * 96}%;top:${Math.random() * 100}%;width:${tam}px;` +
        `animation-duration:${18 + Math.random() * 22}s;animation-delay:-${Math.random() * 30}s;--giro:${(Math.random() * 40 - 20).toFixed(0)}deg`;
      alvo.appendChild(img);
    }
    if (calmo) return;
    // leve parallax: o fundo anda mais devagar que a página
    let pend = false;
    window.addEventListener('scroll', () => {
      if (pend) return; pend = true;
      requestAnimationFrame(() => { alvo.style.transform = `translateY(${-window.scrollY * 0.12}px)`; pend = false; });
    }, { passive: true });
  }

  // elementos com .revela aparecem deslizando quando entram na tela
  function revelar(raiz = document) {
    const els = raiz.querySelectorAll('.revela:not(.visivel)');
    if (calmo || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('visivel')); return; }
    const obs = new IntersectionObserver(ents => ents.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visivel'); obs.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => obs.observe(e));
  }

  // transição suave ao trocar de página dentro da loja
  function transicoes() {
    requestAnimationFrame(() => document.body.classList.remove('entrando'));
    if (calmo) return;
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || a.target === '_blank' || e.metaKey || e.ctrlKey || a.hasAttribute('data-i')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !/(\.html|\/)$/.test(url.pathname)) return;
      e.preventDefault();
      document.body.classList.add('saindo');
      setTimeout(() => { location.href = url.href; }, 220);
    });
    window.addEventListener('pageshow', ev => { if (ev.persisted) document.body.classList.remove('saindo'); });
  }

  // cards inclinam levemente seguindo o mouse (só no computador)
  function inclinar() {
    if (calmo || !window.matchMedia('(hover: hover)').matches) return;
    document.addEventListener('pointermove', e => {
      const c = e.target.closest('.card');
      document.querySelectorAll('.card.inclinado').forEach(x => { if (x !== c) { x.classList.remove('inclinado'); x.style.transform = ''; } });
      if (!c) return;
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.classList.add('inclinado');
      c.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
  }

  window.Efeitos = { revelar, calmo };
  document.addEventListener('DOMContentLoaded', () => { fundo(); revelar(); transicoes(); inclinar(); });
})();
