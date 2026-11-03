/* Menu padrão da loja: o mesmo em todas as páginas.
   Computador: links com ícone no topo.
   Celular: barra fixa embaixo com ícones.
   Tela muito pequena (< 360px): botão de três linhas no topo.
   Ícones SVG em traço (estilo Lucide, licença ISC). */
(function () {
  'use strict';

  const svg = d => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICONES = {
    desafios: svg('<path d="M15.39 4.39a1 1 0 0 0 1.68-.47 2.5 2.5 0 1 1 3.01 3.01 1 1 0 0 0-.47 1.68l1.68 1.68a2.41 2.41 0 0 1 0 3.41l-1.6 1.6a1 1 0 0 1-1.68-.47 2.5 2.5 0 1 0-3.01 3.01 1 1 0 0 1 .47 1.68l-1.6 1.6a2.41 2.41 0 0 1-3.41 0l-1.68-1.68a1 1 0 0 0-1.68.47 2.5 2.5 0 1 1-3.01-3.01 1 1 0 0 0 .47-1.68l-1.68-1.68a2.41 2.41 0 0 1 0-3.41l1.6-1.6a1 1 0 0 1 1.68.47 2.5 2.5 0 1 0 3.01-3.01 1 1 0 0 1-.47-1.68l1.6-1.6a2.41 2.41 0 0 1 3.41 0z"/>'),
    natal: svg('<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17z"/><path d="M12 22v-3"/>'),
    imprimir: svg('<rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/>'),
    mente: svg('<path d="M9.94 14.5A2 2 0 0 0 8.5 13.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 8.94A2 2 0 0 0 9.94 7.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 7.5A2 2 0 0 0 15.5 8.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 13.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>'),
    duvidas: svg('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>'),
    menu: svg('<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>'),
    fechar: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  };

  // mesma regra da home: até 60 dias antes do Natal a seção "natal" fica no destaque
  const ancora = c => 'cat-' + c.normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase();
  const hoje = new Date();
  const dias = Math.ceil((new Date(hoje.getFullYear(), 11, 25) - hoje) / 864e5);
  const natalAncora = dias >= 0 && dias <= 60 ? 'natal' : ancora('Natal');

  const naHome = /(^|\/)(index\.html)?$/.test(location.pathname);
  const home = naHome ? '' : 'index.html';
  const pagina = location.pathname.split('/').pop();

  const ITENS = [
    { id: 'desafios', rotulo: 'Desafios', href: 'desafios.html', ativo: pagina === 'desafios.html' },
    { id: 'natal', rotulo: 'Natal', href: home + '#' + natalAncora },
    { id: 'imprimir', rotulo: 'Brincadeiras', href: home + '#' + ancora('Jogos') },
    { id: 'mente', rotulo: 'Mente', href: home + '#' + ancora('Mente e mágica') },
    { id: 'duvidas', rotulo: 'Dúvidas', href: home + '#duvidas' },
  ];
  const links = ITENS.map(i =>
    `<a href="${i.href}"${i.ativo ? ' aria-current="page"' : ''}>${ICONES[i.id]}<span>${i.rotulo}</span></a>`).join('');

  const topo = document.querySelector('.topo .wrap');
  if (!topo) return;
  topo.querySelectorAll('nav').forEach(n => n.remove());
  topo.insertAdjacentHTML('beforeend',
    `<nav class="menu-topo" aria-label="Menu">${links}</nav>
     <button class="menu-botao" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-gaveta">${ICONES.menu}</button>`);
  document.querySelector('.topo').insertAdjacentHTML('beforeend',
    `<nav class="menu-gaveta" id="menu-gaveta" aria-label="Menu" hidden>${links}</nav>`);
  document.body.insertAdjacentHTML('beforeend', `<nav class="menu-baixo" aria-label="Menu">${links}</nav>`);
  document.body.classList.add('tem-menu-baixo');

  const botao = topo.querySelector('.menu-botao');
  const gaveta = document.getElementById('menu-gaveta');
  function abrir(sim) {
    gaveta.hidden = !sim;
    botao.setAttribute('aria-expanded', String(sim));
    botao.setAttribute('aria-label', sim ? 'Fechar menu' : 'Abrir menu');
    botao.innerHTML = sim ? ICONES.fechar : ICONES.menu;
  }
  botao.addEventListener('click', () => abrir(gaveta.hidden));
  gaveta.addEventListener('click', e => { if (e.target.closest('a')) abrir(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') abrir(false); });

  // teclado aberto no celular: esconde a barra de baixo pra não tapar o campo de resposta
  const vv = window.visualViewport;
  if (vv) {
    const checa = () => document.body.classList.toggle('digitando', window.innerHeight - vv.height > 150);
    vv.addEventListener('resize', checa);
  }
})();
