/* MOVIMENTO · ajudantes da regra de suavidade (ver REGRA-MOVIMENTO.md).
   Usado na loja e nos jogos. Não depende de nada e não atrasa nenhum toque.

   CA_MOV.calmo              -> true se o aparelho pediu menos movimento
   CA_MOV.esconder(el, fim)  -> some suave e põe hidden (fim() roda depois)
   CA_MOV.mostrar(el)        -> tira hidden com animação de entrada
   CA_MOV.fecharClasse(el, classe) -> some suave e tira a classe (modal/lightbox com .aberto)
   CA_MOV.alternarGrupo(botao, abrir?) -> abre/fecha uma .grupo (sanfona)
   CA_MOV.filtrar(itens, passa) -> filtra cards: os que saem somem, os que ficam deslizam pro lugar
   CA_MOV.vigiarPalco(palco) -> cada tela nova do palco entra suave (jogos)
*/
(function () {
  'use strict';
  const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const M = {};
  Object.defineProperty(M, 'calmo', { get: () => mq.matches });

  // lê a duração do token CSS (ex.: --mov-rapido) em ms
  function dur(token) {
    if (mq.matches) return 0;
    const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    return parseFloat(v) * (/ms$/.test(v) ? 1 : 1000) || 0;
  }
  M.dur = dur;

  M.esconder = function (el, fim) {
    if (!el || el.hidden) { if (fim) fim(); return; }
    const t = dur('--mov-rapido');
    if (!t) { el.hidden = true; if (fim) fim(); return; }
    el.classList.add('mov-saindo');
    setTimeout(() => {
      if (!el.classList.contains('mov-saindo')) return; // abriu de novo no meio
      el.hidden = true; el.classList.remove('mov-saindo'); if (fim) fim();
    }, t);
  };

  M.mostrar = function (el) {
    if (!el) return;
    el.classList.remove('mov-saindo');
    el.classList.add('mov-aparece');
    el.hidden = false;
  };

  M.fecharClasse = function (el, classe, fim) {
    if (!el || !el.classList.contains(classe)) return;
    const t = dur('--mov-rapido');
    if (!t) { el.classList.remove(classe); if (fim) fim(); return; }
    el.classList.add('fechando');
    setTimeout(() => {
      if (!el.classList.contains('fechando')) return; // abriu de novo no meio
      el.classList.remove(classe, 'fechando'); if (fim) fim();
    }, t);
  };

  // ---------- grupos (sanfona) ----------
  M.alternarGrupo = function (botao, abrir) {
    const sim = abrir == null ? botao.getAttribute('aria-expanded') !== 'true' : !!abrir;
    botao.setAttribute('aria-expanded', String(sim));
    const corpo = document.getElementById(botao.getAttribute('aria-controls'));
    if (corpo) corpo.inert = !sim; // fechado: os cards de dentro não recebem foco/toque
  };
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.grupo-titulo[aria-controls]');
    if (b) M.alternarGrupo(b);
  });

  // ---------- filtros ----------
  // itens: lista de elementos; passa(el) -> true se deve aparecer
  M.filtrar = function (itens, passa) {
    itens = Array.from(itens);
    const antes = new Map(itens.filter(el => !el.hidden).map(el => [el, el.getBoundingClientRect()]));
    const t = dur('--mov-rapido');
    const sair = itens.filter(el => !el.hidden && !passa(el));
    const entrar = itens.filter(el => el.hidden && passa(el));
    sair.forEach(el => el.classList.add('mov-saindo'));
    setTimeout(() => {
      sair.forEach(el => { el.hidden = true; el.classList.remove('mov-saindo'); });
      entrar.forEach(el => M.mostrar(el));
      if (!dur('--mov-medio')) return;
      // FLIP: quem ficou desliza da posição antiga pra nova
      itens.forEach(el => {
        const r0 = antes.get(el);
        if (!r0 || el.hidden) return;
        const r1 = el.getBoundingClientRect();
        const dx = r0.left - r1.left, dy = r0.top - r1.top;
        if (!dx && !dy) return;
        el.classList.remove('mov-flip');
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.classList.add('mov-flip');
          el.style.transform = '';
          setTimeout(() => el.classList.remove('mov-flip'), dur('--mov-medio') + 30);
        }));
      });
    }, sair.length ? t : 0);
  };
  // liga botões .filtro dentro de .filtros[data-alvo] sozinho:
  // <div class="filtros" data-alvo="#lista"> <button class="filtro" data-filtro="todos" aria-pressed="true">
  // e cada card com data-tags="numero memoria"
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.filtros[data-alvo] .filtro');
    if (!b) return;
    const barra = b.closest('.filtros');
    barra.querySelectorAll('.filtro').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const lista = document.querySelector(barra.dataset.alvo);
    if (!lista) return;
    const f = b.dataset.filtro || 'todos';
    M.filtrar(lista.querySelectorAll('[data-tags]'), el => f === 'todos' || el.dataset.tags.split(/\s+/).includes(f));
  });

  // ---------- troca de tela no palco (jogos) ----------
  // Cada filho novo do palco é uma tela. Se for a "mesma" tela redesenhada
  // (mesmo data-tela ou mesma estrutura), não pisca. Se o data-parte mudou
  // (ex.: data-tela="inicio" data-parte="grupo"), só o .mov-troca de dentro anima.
  function assinatura(el) {
    if (el.dataset.tela) return 't:' + el.dataset.tela;
    return el.tagName + '.' + el.className + '>' + Array.from(el.children).slice(0, 4).map(c => c.tagName + '.' + c.className).join(',');
  }
  M.vigiarPalco = function (palco) {
    if (!palco || !window.MutationObserver) return;
    let ultima = '', parte = '';
    new MutationObserver(lista => {
      for (const m of lista) for (const el of m.addedNodes) {
        if (el.nodeType !== 1 || el.dataset.mov === 'sem') continue;
        const a = assinatura(el), pa = el.dataset.parte || '';
        if (a === ultima) {
          // mesma tela: só anima o miolo (.mov-troca) se mudou de parte (ex.: outra aba)
          if (pa !== parte && !mq.matches) el.querySelectorAll('.mov-troca').forEach(x => x.classList.add('mov-troca-anima'));
          parte = pa;
          continue;
        }
        ultima = a; parte = pa;
        if (!mq.matches) el.classList.add('mov-tela');
      }
    }).observe(palco, { childList: true });
  };

  // iPhone só mostra o :active (botão afundando) se a página escutar toques
  document.addEventListener('touchstart', function () {}, { passive: true });

  window.CA_MOV = M;
})();
