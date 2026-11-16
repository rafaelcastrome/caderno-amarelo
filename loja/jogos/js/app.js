/* App de jogos: página inicial, rotas e "instalar o app no celular".
   Rotas: #/ (início), #/<jogo>?s=semente&n=nivel&v=valor_do_amigo, #/dia?d=1 (desafio do dia, dia.js) */
(function () {
  'use strict';
  const CA = window.CA;

  // Link curto dos Jogos em grupo: /s/ABCD (Netlify manda pra /jogos/?sala=ABCD) entra direto na sala.
  try {
    const sala = new URLSearchParams(location.search).get('sala');
    if (sala && /^[a-z]{4}$/i.test(sala)) history.replaceState(null, '', location.pathname + '#/sala?c=' + sala.toUpperCase());
  } catch (e) {}
  
  function lerRota() {
    const h = location.hash.replace(/^#\/?/, '');
    const [nome, q] = h.split('?');
    const p = Object.fromEntries(new URLSearchParams(q || ''));
    return { nome: nome || '', p };
  }

  const JOGAVEIS = ['acha', 'fase', 'cor', 'rapido', 'peg', 'charada'];
  function precisaCadastro() {
    if (CA.conta && CA.conta()) return false;
    const algo = o => o && Object.keys(o).length > 0;
    if (algo(CA.ler('fases', {})) || algo(CA.ler('niveis', {})) || CA.ler('desafios:jogo', null)) return false;
    try { for (let i = 0; i < localStorage.length; i++) if (/^ca-jogos:(dia|rec:dia|rec:jdia):/.test(localStorage.key(i))) return false; } catch (e) {}
    return true;
  }

  CA.pedirCadastro = function (trocar) {
    if (!precisaCadastro()) return false;
    const ir = '#/conta?novo=1&volta=' + encodeURIComponent(location.hash);
    if (trocar) location.replace(ir); else location.hash = ir;
    return true;
  };

  let limpar = null;
  let abaAntes = null; // pra pílula das abas deslizar da aba anterior
  function render() {
    if (limpar) { try { limpar(); } catch (e) {} limpar = null; }
    const palco = CA.palco();
    palco.innerHTML = '';
    window.scrollTo(0, 0);
    const { nome, p } = lerRota();
    const jogo = CA.jogos[nome];
    document.body.classList.toggle('em-jogo', !!jogo);
    if (nome === 'grupo') { inicio(palco, 'grupo'); return; }
    if (!jogo) { inicio(palco); return; }
    // Jogador novo (sem conta e sem nada jogado neste celular): cria a conta antes de começar.
    // (a tela de apresentação do desafio do dia fica livre, com o vídeo e o ranking; o cadastro vem no "Começar")
    if (JOGAVEIS.includes(nome) && !(nome === 'acha' && p.d) && nome !== 'dia' && CA.pedirCadastro(true)) return;
    document.title = jogo.nome + ' · caRdeno Amarelo';
    limpar = jogo.iniciar(palco, p) || null;
  }

  // Página inicial: todos os jogos (cada um com 3 níveis grátis), desafio do dia e ranking geral.
  // aba = 'grupo' mostra a aba Jogos em grupo (TV + celular, em grupo.js) no lugar da lista de jogos.
  function inicio(palco, aba) {
    document.title = aba === 'grupo' ? 'Jogos em grupo · caRdeno Amarelo' : 'Jogos do caRdeno Amarelo';
    const conta = CA.conta && CA.conta();
    const est = CA.estrelasGerais(), max = CA.JOGOS.reduce((s, j) => s + j.total * 3, 0);

    palco.appendChild(CA.el(`
      <div class="inicio" data-tela="inicio" data-parte="${aba || 'jogos'}">
        <header class="cabeca">
          <div class="logo-app"><img class="logo-img" src="../assets/img/logo-cabecalho.png" alt="" width="171" height="192"><span>ca<span class="r-marca">R</span>deno Amarelo</span></div>
          <div class="cabeca-botoes">
            <a class="som loja-btn" href="../loja.html">Loja</a>
            <a class="som conta-btn" href="#/conta" aria-label="Minha conta">${conta ? (conta.premium ? '★' : '👤') : 'Entrar'}</a>
            <button class="som" type="button" aria-label="Som">${CA.somLigado() ? '🔊' : '🔇'}</button>
          </div>
        </header>
        <h1 class="titulo-app">Jogos do <span class="marca">ca<span class="r-marca">R</span>deno</span></h1>

        <nav class="abas mov-pilula" aria-label="Tipo de jogo" style="--i:${aba === 'grupo' ? 1 : 0};--de:${abaAntes == null ? (aba === 'grupo' ? 1 : 0) : abaAntes}">
          <a class="aba ${aba === 'grupo' ? '' : 'ativa'}" href="#/" ${aba === 'grupo' ? '' : 'aria-current="page"'}>🧠 Jogos</a>
          <a class="aba ${aba === 'grupo' ? 'ativa' : ''}" href="#/grupo" ${aba === 'grupo' ? 'aria-current="page"' : ''}>📺 Jogos em grupo</a>
        </nav>
        ${aba === 'grupo' && CA.grupoAbaHtml ? CA.grupoAbaHtml() + '<p class="rodape"><a href="https://www.instagram.com/cardeno_amarelo/" target="_blank" rel="noopener">@caRdeno_Amarelo</a></p></div>' : `
        <div class="inicio-corpo mov-troca"><div class="inicio-principal">
        <a class="podio" href="#/ranking" hidden></a>
        ${CA.cardDia()}

        <h2 class="secao">Escolhe um jogo</h2>
        <p class="placar-estrelas">Tu tem ${est} de ${max} estrelas</p>
        ${CA.cardsJogos(null)}
        </div>
        <aside class="inicio-lado">

        ${CA.ehPremium()
          ? '<a class="chamada-premium ativo" href="#/conta"><strong>★ Premium ativo</strong><span>Todos os níveis de todos os jogos, desafios anteriores e card dourado.</span></a>'
          : '<a class="chamada-premium" href="#/premium"><strong>ca<span class="r-marca">R</span>deno Premium</strong><span>Libera todos os níveis de todos os jogos, os desafios dos dias anteriores e o card dourado. Mensal R$ 4,90 ou anual R$ 29,90.</span></a>'}
        <a class="mais" href="../loja.html"><strong>Loja do ca<span class="r-marca">R</span>deno</strong><small>Brincadeiras pra imprimir, livros de colorir e mágicas pra fazer em família.</small></a>
        <a class="mais insta" href="https://www.instagram.com/cardeno_amarelo/" target="_blank" rel="noopener"><strong>Segue a gente no Instagram</strong><small>@caRdeno_Amarelo · desafios novos todo dia</small></a>

        <div class="instalar mov-aparece" hidden>
          <button class="fechar-instalar" type="button" aria-label="Fechar">×</button>
          <strong>Instalar o app no celular</strong>
          <small>Fica um ícone na tela do celular, igual app, e abre até sem internet.</small>
          <button class="btn btn-claro" type="button">Instalar</button>
        </div>
        <div class="instalar-ios mov-aparece" hidden>
          <button class="fechar-instalar" type="button" aria-label="Fechar">×</button>
          <strong>Instalar o app no celular</strong>
          <small>Fica um ícone na tela do celular, igual app, e abre até sem internet.</small>
          <button class="btn btn-claro" type="button">Instalar</button>
          <small class="dica-ios mov-aparece" hidden>O iPhone só deixa instalar pelo menu dele: toca em <b>Compartilhar</b> (o quadradinho com a seta, embaixo) e depois em <b>Adicionar à Tela de Início</b>.</small>
        </div>
        </aside></div>

        <p class="rodape"><a href="https://www.instagram.com/cardeno_amarelo/" target="_blank" rel="noopener">@caRdeno_Amarelo</a></p>
      </div>`}`));

    abaAntes = aba === 'grupo' ? 1 : 0;
    palco.querySelector('button.som').addEventListener('click', e => {
      CA.gravar('som', !CA.somLigado());
      e.currentTarget.textContent = CA.somLigado() ? '🔊' : '🔇';
    });
    if (aba === 'grupo') { if (CA.grupoAbaLigar) CA.grupoAbaLigar(palco); return; }
    mostrarInstalar(palco);
    // ranking geral: no celular fica no topo (quem entra já vê); no PC fica no começo da coluna da direita
    const podio = palco.querySelector('.podio'), pc = CA.mqPC || (CA.mqPC = matchMedia('(min-width: 900px)'));
    const lugar = () => {
      if (!podio.isConnected) return pc.removeEventListener('change', lugar);
      if (pc.matches) palco.querySelector('.inicio-lado').prepend(podio);
      else palco.querySelector('.inicio-principal').prepend(podio);
    };
    lugar(); pc.addEventListener('change', lugar);
    CA.caixaRankingEstrelas(podio, null, 'Ranking geral', '#/ranking', null, true);
  }

  // Desafio do dia (card, semana, arquivo dos dias anteriores): dia.js

  // ---------- instalar o app no celular ----------
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
    if (CA.ler('instalar-fechou', 0) >= 3) return; // fechou 3 vezes: não mostra mais
    palco.querySelectorAll('.fechar-instalar').forEach(b => {
      b.onclick = () => {
        CA.gravar('instalar-fechou', CA.ler('instalar-fechou', 0) + 1);
        CA_MOV.esconder(b.parentElement);
      };
    });
    const caixa = palco.querySelector('.instalar');
    if (pedidoInstalar && caixa) {
      caixa.hidden = false;
      caixa.querySelector('.btn').onclick = async () => {
        pedidoInstalar.prompt();
        try { await pedidoInstalar.userChoice; } catch (e) {}
        pedidoInstalar = null;
        CA_MOV.esconder(caixa);
      };
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      const ios = palco.querySelector('.instalar-ios');
      if (ios) {
        ios.hidden = false;
        ios.querySelector('.btn').onclick = () => { ios.querySelector('.dica-ios').hidden = false; };
      }
    }
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', () => {
    CA_MOV.vigiarPalco(CA.palco());
    render();
    CA.fonteCard();
    // confere Premium e progresso na conta (se tiver entrado) e redesenha o início
    if (CA.sincronizar) CA.sincronizar().then(() => { if (!lerRota().nome) render(); });
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  });
})();
