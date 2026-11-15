/* App de jogos: página inicial, rotas e "adicionar à tela inicial".
   Rotas: #/ (início), #/<jogo>?s=semente&n=nivel&v=valor_do_amigo&d=1 (desafio do dia) */
(function () {
  'use strict';
  const CA = window.CA;
  const ORDEM = CA.ORDEM;

  function lerRota() {
    const h = location.hash.replace(/^#\/?/, '');
    const [nome, q] = h.split('?');
    const p = Object.fromEntries(new URLSearchParams(q || ''));
    return { nome: nome || '', p };
  }

  const jogoDoDia = () => CA.jogoDoDia();

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
    document.title = jogo.nome + ' · Caderno Amarelo';
    limpar = jogo.iniciar(palco, p) || null;
  }

  // Todos os jogos do Caderno (aparecem embaixo do jogo). Cada jogo: 3 níveis grátis, o resto Premium.
  const JOGOS = [
    { nome: 'Acha do 1 ao 25', desc: 'Toca os números em ordem, o mais rápido possível. 3 fases grátis + desafio do dia.', href: '#/', cor: '#1d4ed8', icone: '🔢', atual: true },
    { nome: '66 Desafios', desc: 'Charadas, pegadinhas e ilusões que enganam o cérebro. 3 grátis pra provar.', href: '../desafios.html', cor: '#d62828', icone: '🧠' },
  ];

  // Link do nosso Reels do Acha do 1 ao 25 (Instagram). Vazio = não mostra o vídeo.
  const REELS = 'https://www.instagram.com/reel/DfuG6lkSIzZ/';

  function inicio(palco) {
    document.title = 'Jogos do Caderno Amarelo · Acha do 1 ao 25';
    const feitoHoje = CA.ler('dia:' + CA.hojeBR(), null);
    const prog = CA.progressoFases();
    const prox = CA.proximaFase();
    const conta = CA.conta && CA.conta();
    const est = CA.estrelasTotais();
    const reelsId = (REELS.match(/instagram\.com\/(?:reel|reels|p)\/([\w-]+)/) || [])[1];
    const tiles = CA.FASES.map(f => {
      const feito = prog[f.num];
      const livre = CA.faseLiberada(f.num);
      const cls = feito ? 'feita' : livre ? 'livre' : f.premium && !CA.ehPremium() ? 'premium' : 'trancada';
      const estr = feito ? '★'.repeat(feito.e) + '☆'.repeat(3 - feito.e) : (cls === 'premium' ? '🔒' : cls === 'trancada' ? '·' : '');
      return `<a class="tile-fase ${cls} ${f.num === prox ? 'atual' : ''}" href="#/fase?f=${f.num}" aria-label="Fase ${f.num}">
        <b>${f.num}</b><small>${estr}</small></a>`;
    }).join('');

    palco.appendChild(CA.el(`
      <div class="inicio">
        <header class="cabeca">
          <div class="logo-app"><span class="logo-caderno" aria-hidden="true"></span>Caderno Amarelo</div>
          <div class="cabeca-botoes">
            <a class="som loja-btn" href="../loja.html">Loja</a>
            <a class="som conta-btn" href="#/conta" aria-label="Minha conta">${conta ? (conta.premium ? '★' : '👤') : 'Entrar'}</a>
            <button class="som" type="button" aria-label="Som">${CA.somLigado() ? '🔊' : '🔇'}</button>
          </div>
        </header>
        <h1 class="titulo-app">Acha do <span class="marca">1 ao 25</span></h1>
        <p class="sub-app">${CA.FASES.length} fases, cada uma com uma regra nova. As 3 primeiras são grátis e têm ranking. Duvido tu chegar na última.</p>

        ${reelsId ? `<div class="reels">
          <p class="reels-titulo">Viu no vídeo? Agora é tua vez 👇</p>
          <div class="reels-caixa"><iframe src="https://www.instagram.com/reel/${reelsId}/embed" title="Vídeo do Acha do 1 ao 25 no Instagram" loading="lazy" allowfullscreen scrolling="no"></iframe></div>
        </div>` : ''}

        <a class="btn btn-grande btn-continuar" href="#/fase?f=${prox}">${Object.keys(prog).length ? 'Continuar: fase ' + prox : 'Começar pela fase 1'}</a>
        <p class="placar-estrelas">${est} de ${CA.FASES.length * 3} estrelas</p>

        <a class="dia" href="#/acha?d=1">
          <span class="dia-fita">Desafio do dia</span>
          <strong>${CA.regraDoDia(CA.hojeBR())}</strong>
          <small>${feitoHoje ? 'Tu fez ' + feitoHoje.txt + ' hoje. Tenta bater!' : 'A mesma grade pra todo mundo hoje. Bora?'}</small>
          <span class="btn">Jogar o desafio do dia</span>
        </a>
        <a class="podio" href="#/ranking" hidden></a>

        <h2 class="secao">Fases</h2>
        <div class="grade-fases">${tiles}</div>
        ${CA.ehPremium() ? '' : `<p class="legenda-fases">Fases 1 a ${CA.FASES_GRATIS} grátis · 🔒 Premium</p>`}

        <h2 class="secao">Todos os jogos</h2>
        <div class="lista-jogos">${JOGOS.map(j => `
          <a class="card-jogo ${j.atual ? 'atual' : ''}" href="${j.href}" style="--cor:${j.cor}">
            <span class="card-jogo-icone" aria-hidden="true">${j.icone}</span>
            <span class="card-jogo-txt"><strong>${j.nome}</strong><small>${j.desc}</small></span>
            <em>${j.atual ? 'Tu tá aqui' : 'Jogar'}</em>
          </a>`).join('')}
        </div>
        <a class="mais" href="../loja.html"><strong>Loja do Caderno</strong><small>Brincadeiras pra imprimir, livros de colorir e mágicas pra fazer em família.</small></a>

        <h2 class="secao">Desafios dos dias anteriores</h2>
        <div class="arquivo">${arquivo()}</div>
        ${CA.ehPremium()
          ? '<a class="chamada-premium ativo" href="#/conta"><strong>★ Premium ativo</strong><span>Todos os jogos, desafios anteriores, card dourado e 66 Desafios liberados.</span></a>'
          : '<a class="chamada-premium" href="#/premium"><strong>Caderno Premium</strong><span>Todos os jogos e fases, desafios dos dias anteriores, card dourado e os 66 Desafios. Mensal R$ 4,90 ou anual R$ 29,90.</span></a>'}

        <div class="instalar" hidden>
          <strong>Coloca na tela inicial</strong>
          <small>Vira um ícone igual app, e abre até sem internet.</small>
          <button class="btn btn-claro" type="button">Adicionar</button>
        </div>
        <div class="instalar-ios" hidden>
          <strong>Coloca na tela inicial</strong>
          <small>Toca em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.</small>
        </div>

        <p class="rodape">@Cardeno_Amarelo</p>
      </div>`));

    palco.querySelector('button.som').addEventListener('click', e => {
      CA.gravar('som', !CA.somLigado());
      e.currentTarget.textContent = CA.somLigado() ? '🔊' : '🔇';
    });
    mostrarInstalar(palco);
    if (CA.podioHoje) CA.podioHoje(palco.querySelector('.podio'));
  }

  // Últimos 30 dias de desafio do dia (só Premium joga; os outros veem o cadeado).
  function arquivo() {
    const premium = CA.ehPremium();
    const hoje = Date.parse(CA.hojeBR() + 'T12:00:00Z');
    let h = '';
    for (let i = 1; i <= 30; i++) {
      const d = new Date(hoje - i * 864e5).toISOString().slice(0, 10);
      h += `<a class="dia-antigo" href="#/acha?d=${d}">
        <b>${CA.fmtData(d)}</b><span>${CA.regraDoDia(d)}</span>${premium ? '' : '<i aria-label="Premium">🔒</i>'}</a>`;
    }
    return h;
  }

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
