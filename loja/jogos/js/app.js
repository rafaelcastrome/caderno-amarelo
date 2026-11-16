/* App de jogos: página inicial, rotas e "adicionar à tela inicial".
   Rotas: #/ (início), #/<jogo>?s=semente&n=nivel&v=valor_do_amigo&d=1 (desafio do dia) */
(function () {
  'use strict';
  const CA = window.CA;
  
  function lerRota() {
    const h = location.hash.replace(/^#\/?/, '');
    const [nome, q] = h.split('?');
    const p = Object.fromEntries(new URLSearchParams(q || ''));
    return { nome: nome || '', p };
  }

  const jogoDoDia = () => CA.jogoDoDia();

  const JOGAVEIS = ['acha', 'fase', 'cor', 'rapido', 'charada'];
  function precisaCadastro() {
    if (CA.conta && CA.conta()) return false;
    const algo = o => o && Object.keys(o).length > 0;
    if (algo(CA.ler('fases', {})) || algo(CA.ler('niveis', {})) || CA.ler('desafios:jogo', null)) return false;
    try { for (let i = 0; i < localStorage.length; i++) if (/^ca-jogos:(dia|rec:dia):/.test(localStorage.key(i))) return false; } catch (e) {}
    return true;
  }

  CA.pedirCadastro = function (trocar) {
    if (!precisaCadastro()) return false;
    const ir = '#/conta?novo=1&volta=' + encodeURIComponent(location.hash);
    if (trocar) location.replace(ir); else location.hash = ir;
    return true;
  };

  let limpar = null;
  function render() {
    if (limpar) { try { limpar(); } catch (e) {} limpar = null; }
    const palco = CA.palco();
    palco.innerHTML = '';
    window.scrollTo(0, 0);
    const { nome, p } = lerRota();
    const jogo = CA.jogos[nome];
    document.body.classList.toggle('em-jogo', !!jogo);
    if (!jogo) { inicio(palco); return; }
    // Jogador novo (sem conta e sem nada jogado neste celular): cria a conta antes de começar.
    // (a tela de apresentação do desafio do dia fica livre, com o vídeo e o ranking; o cadastro vem no "Começar")
    if (JOGAVEIS.includes(nome) && !(nome === 'acha' && p.d) && CA.pedirCadastro(true)) return;
    document.title = jogo.nome + ' · caRdeno Amarelo';
    limpar = jogo.iniciar(palco, p) || null;
  }

  // Página inicial: todos os jogos (cada um com 3 níveis grátis), desafio do dia e ranking geral.
  function inicio(palco) {
    document.title = 'Jogos do caRdeno Amarelo';
    const feitoHoje = CA.ler('dia:' + CA.hojeBR(), null);
    const conta = CA.conta && CA.conta();
    const est = CA.estrelasGerais(), max = CA.JOGOS.reduce((s, j) => s + j.total * 3, 0);

    palco.appendChild(CA.el(`
      <div class="inicio">
        <header class="cabeca">
          <div class="logo-app"><span class="logo-caderno" aria-hidden="true"></span><span>ca<span class="r-marca">R</span>deno Amarelo</span></div>
          <div class="cabeca-botoes">
            <a class="som loja-btn" href="../loja.html">Loja</a>
            <a class="som conta-btn" href="#/conta" aria-label="Minha conta">${conta ? (conta.premium ? '★' : '👤') : 'Entrar'}</a>
            <button class="som" type="button" aria-label="Som">${CA.somLigado() ? '🔊' : '🔇'}</button>
          </div>
        </header>
        <h1 class="titulo-app">Jogos do <span class="marca">ca<span class="r-marca">R</span>deno</span></h1>

        <a class="dia" href="#/acha?d=1">
          <span class="dia-fita">Desafio do dia</span>
          <strong>${CA.NOME_ACHA}: ${CA.regraDoDia(CA.hojeBR())}</strong>
          <small>${feitoHoje ? 'Tu fez ' + feitoHoje.txt + ' hoje. Tenta bater!' : 'A mesma grade pra todo mundo hoje. Bora?'}</small>
          <span class="btn">Jogar o desafio do dia</span>
        </a>

        <h2 class="secao">Escolhe um jogo</h2>
        <p class="placar-estrelas">Tu tem ${est} de ${max} estrelas</p>
        ${CA.cardsJogos(null)}

        <a class="podio" href="#/ranking" hidden></a>

        ${CA.reelsHtml('acha', 'O ' + CA.NOME_ACHA + ' no nosso Instagram 👇')}

        ${CA.ehPremium()
          ? '<a class="chamada-premium ativo" href="#/conta"><strong>★ Premium ativo</strong><span>Todos os níveis de todos os jogos, desafios anteriores e card dourado.</span></a>'
          : '<a class="chamada-premium" href="#/premium"><strong>ca<span class="r-marca">R</span>deno Premium</strong><span>Libera todos os níveis de todos os jogos, os desafios dos dias anteriores e o card dourado. Mensal R$ 4,90 ou anual R$ 29,90.</span></a>'}
        <a class="mais" href="../loja.html"><strong>Loja do ca<span class="r-marca">R</span>deno</strong><small>Brincadeiras pra imprimir, livros de colorir e mágicas pra fazer em família.</small></a>

        <div class="instalar" hidden>
          <strong>Coloca na tela inicial</strong>
          <small>Vira um ícone igual app, e abre até sem internet.</small>
          <button class="btn btn-claro" type="button">Adicionar</button>
        </div>
        <div class="instalar-ios" hidden>
          <strong>Coloca na tela inicial</strong>
          <small>Toca em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.</small>
        </div>

        <p class="rodape">@caRdeno_Amarelo</p>
      </div>`));

    palco.querySelector('button.som').addEventListener('click', e => {
      CA.gravar('som', !CA.somLigado());
      e.currentTarget.textContent = CA.somLigado() ? '🔊' : '🔇';
    });
    mostrarInstalar(palco);
    CA.caixaRankingEstrelas(palco.querySelector('.podio'), null, 'Ranking geral (estrelas de todos os jogos)', '#/ranking');
  }

  // Últimos 30 dias de desafio do dia (só Premium joga; os outros veem o cadeado). Fica na tela do Acha.
  CA.arquivoDias = function () {
    const premium = CA.ehPremium();
    const hoje = Date.parse(CA.hojeBR() + 'T12:00:00Z');
    let h = '';
    for (let i = 1; i <= 30; i++) {
      const d = new Date(hoje - i * 864e5).toISOString().slice(0, 10);
      h += `<a class="dia-antigo" href="#/acha?d=${d}">
        <b>${CA.fmtData(d)}</b><span>${CA.regraDoDia(d)}</span>${premium ? '' : '<i aria-label="Premium">🔒</i>'}</a>`;
    }
    return `<h2 class="secao">Desafios dos dias anteriores</h2><div class="arquivo">${h}</div>`;
  };

  // ---------- adicionar à tela inicial ----------
  let pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    pedidoInstalar = e;
    const p = CA.palco();
    if (p) mostrarInstalar(p);
  });
  function mostrarInstalar(palco) {
    const instalado = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (instalado) return;
    const caixa = palco.querySelector('.instalar');
    if (pedidoInstalar && caixa) {
      caixa.hidden = false;
      caixa.querySelector('button').onclick = async () => {
        pedidoInstalar.prompt();
        try { await pedidoInstalar.userChoice; } catch (e) {}
        pedidoInstalar = null;
        caixa.hidden = true;
      };
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      const ios = palco.querySelector('.instalar-ios');
      if (ios) ios.hidden = false;
    }
  }

  // Desafio do dia: os jogos chamam isso no fim pra marcar que jogou hoje.
  CA.marcarDia = function (jogoId, txt) {
    if (jogoId === jogoDoDia()) CA.gravar('dia:' + CA.hojeBR(), { jogo: jogoId, txt });
  };

  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', () => {
    render();
    CA.fonteCard();
    // confere Premium e progresso na conta (se tiver entrado) e redesenha o início
    if (CA.sincronizar) CA.sincronizar().then(() => { if (!lerRota().nome) render(); });
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  });
})();
