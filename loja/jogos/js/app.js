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

  function inicio(palco) {
    document.title = 'Jogos do Caderno Amarelo';
    const idDia = jogoDoDia();
    const dia = CA.jogos[idDia];
    const feitoHoje = CA.ler('dia:' + CA.hojeBR(), null);
    const cards = ORDEM.map(id => {
      const j = CA.jogos[id];
      const rec = j.recordeTxt && j.recordeTxt();
      return `
        <a class="card-jogo" href="#/${id}" style="--cor:${j.cor}">
          <span class="card-icone">${j.icone}</span>
          <span class="card-txt">
            <strong>${j.nome}</strong>
            <small>${j.desc}</small>
            ${rec ? `<em>Teu recorde: ${rec}</em>` : ''}
          </span>
          <span class="card-seta" aria-hidden="true">›</span>
        </a>`;
    }).join('');

    palco.appendChild(CA.el(`
      <div class="inicio">
        <header class="cabeca">
          <div class="logo-app"><span class="logo-caderno" aria-hidden="true"></span>Caderno Amarelo</div>
          <button class="som" type="button" aria-label="Som">${CA.somLigado() ? '🔊' : '🔇'}</button>
        </header>
        <h1 class="titulo-app">Jogos que <span class="marca">enganam</span> o teu cérebro</h1>
        <p class="sub-app">Grátis, sem instalar nada. Cada partida é diferente.</p>

        <a class="dia" href="#/${idDia}?d=1">
          <span class="dia-fita">Desafio do dia</span>
          <strong>${dia.nome}</strong>
          <small>${feitoHoje ? 'Tu já jogou hoje: ' + feitoHoje.txt + '. Tenta bater!' : 'A mesma partida pra todo mundo hoje. Bora?'}</small>
          <span class="btn">Jogar o desafio do dia</span>
        </a>

        <h2 class="secao">Escolhe um jogo</h2>
        <div class="lista-jogos">${cards}</div>

        <h2 class="secao">Desafios dos dias anteriores</h2>
        <div class="arquivo">${arquivo()}</div>
        ${CA.ehPremium()
          ? '<a class="chamada-premium ativo" href="#/premium"><strong>★ Premium ativo</strong><span>Modo impossível, desafios anteriores, card dourado e 66 Desafios liberados.</span></a>'
          : '<a class="chamada-premium" href="#/premium"><strong>Caderno Premium</strong><span>Modo impossível, desafios dos dias anteriores, card dourado e os 66 Desafios. R$ 9,90 uma vez só.</span></a>'}

        <div class="instalar" hidden>
          <strong>Coloca na tela inicial</strong>
          <small>Vira um ícone igual app, e abre até sem internet.</small>
          <button class="btn btn-claro" type="button">Adicionar</button>
        </div>
        <div class="instalar-ios" hidden>
          <strong>Coloca na tela inicial</strong>
          <small>Toca em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.</small>
        </div>

        <h2 class="secao">Quer mais?</h2>
        <a class="mais" href="../desafios.html"><strong>66 Desafios</strong><small>Enigmas e pegadinhas que enganam o cérebro. 2 grátis pra provar.</small></a>
        <a class="mais" href="../index.html"><strong>Loja do Caderno</strong><small>Brincadeiras pra imprimir e jogar em família.</small></a>
        <p class="rodape">@Cardeno_Amarelo</p>
      </div>`));

    palco.querySelector('.som').addEventListener('click', e => {
      CA.gravar('som', !CA.somLigado());
      e.currentTarget.textContent = CA.somLigado() ? '🔊' : '🔇';
    });
    mostrarInstalar(palco);
  }

  // Últimos 30 dias de desafio do dia (só Premium joga; os outros veem o cadeado).
  function arquivo() {
    const premium = CA.ehPremium();
    const hoje = Date.parse(CA.hojeBR() + 'T12:00:00Z');
    let h = '';
    for (let i = 1; i <= 30; i++) {
      const d = new Date(hoje - i * 864e5).toISOString().slice(0, 10);
      const j = CA.jogos[CA.jogoDoDia(d)];
      h += `<a class="dia-antigo" href="#/${CA.jogoDoDia(d)}?d=${d}" style="--cor:${j.cor}">
        <b>${CA.fmtData(d)}</b><span>${j.nome}</span>${premium ? '' : '<i aria-label="Premium">🔒</i>'}</a>`;
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
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  });
})();
