/* Jogos em grupo: a TV (ou o computador) abre uma sala e mostra um código; cada pessoa entra
   pelo celular com o código e o celular vira o controle. A pergunta aparece na TV, todo mundo
   responde no celular e quem acerta primeiro leva mais pontos. Placar na TV.

   Conversa entre TV e celulares: Supabase Realtime (canal "broadcast", sem tabela e sem guardar nada).
   A TV manda em tudo: ela sorteia, confere as respostas e soma os pontos.

   Rotas:
     #/grupo          aba "Jogos em grupo" da página inicial (fica em app.js)
     #/tv             a TV abre a sala
     #/sala?c=ABCD    o celular entra na sala ABCD

   Premium: quem joga pelo celular nunca paga nem precisa de conta. Quem abre a sala na TV
   joga os níveis 1 a 3 de cada jogo de graça; do 4 ao 10 é caRdeno Premium (de quem abriu a sala). */
(function () {
  'use strict';
  const CA = window.CA;
  const GRATIS = 3;
  const MAX_JOGADORES = 12;
  const LETRAS = 'ABCDEFGHJKLMNPRSTUVXZ'; // sem I, O, Q, W, Y (confundem quando falados ou na TV)
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- canal em tempo real (protocolo do Supabase Realtime, sem biblioteca) ----------
  function Canal(codigo, aoMsg, aoStatus) {
    const cfg = window.LOJA_CONFIG || {};
    const url = window.CA_RT_URL ||
      (cfg.supabaseUrl || '').replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(cfg.supabaseAnonKey || '') + '&vsn=1.0.0';
    const topico = 'realtime:ca-sala-' + codigo;
    let ws = null, ref = 0, joinRef = null, ok = false, fechado = false, hb = 0, tent = 0, fila = [];
    const cru = o => { try { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); } catch (e) {} };
    function abrir() {
      try { ws = new WebSocket(url); } catch (e) { aoStatus('erro'); return; }
      ws.onopen = () => {
        tent = 0;
        joinRef = String(++ref);
        cru({ topic: topico, event: 'phx_join', ref: joinRef, join_ref: joinRef,
          payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, private: false } } });
        clearInterval(hb);
        hb = setInterval(() => cru({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(++ref) }), 25000);
      };
      ws.onmessage = e => {
        let d; try { d = JSON.parse(e.data); } catch (x) { return; }
        if (d.topic !== topico) return;
        if (d.event === 'phx_reply' && d.ref === joinRef) {
          ok = !!(d.payload && d.payload.status === 'ok');
          aoStatus(ok ? 'on' : 'erro');
          if (ok) { const f = fila; fila = []; f.forEach(([ev, p]) => mandar(ev, p)); }
          return;
        }
        if (d.event === 'broadcast' && d.payload) aoMsg(d.payload.event, d.payload.payload || {});
        if (d.event === 'phx_error' || d.event === 'phx_close') { try { ws.close(); } catch (x) {} }
      };
      ws.onclose = () => {
        clearInterval(hb); ok = false;
        if (fechado) return;
        aoStatus('caiu');
        setTimeout(() => { if (!fechado) abrir(); }, Math.min(6000, 400 * 2 ** tent++));
      };
      ws.onerror = () => {};
    }
    function mandar(ev, p) {
      if (!ok) { if (fila.length < 40) fila.push([ev, p]); return; }
      cru({ topic: topico, event: 'broadcast', ref: String(++ref), join_ref: joinRef, payload: { type: 'broadcast', event: ev, payload: p } });
    }
    abrir();
    return {
      mandar,
      fechar() { fechado = true; clearInterval(hb); try { ws && ws.close(); } catch (e) {} },
    };
  }

  // tela acesa enquanto joga (celular e TV)
  function telaAcesa() {
    let trava = null, vivo = true;
    const pedir = async () => { try { if (vivo && navigator.wakeLock && document.visibilityState === 'visible') trava = await navigator.wakeLock.request('screen'); } catch (e) {} };
    const vis = () => { if (document.visibilityState === 'visible') pedir(); };
    document.addEventListener('visibilitychange', vis);
    pedir();
    return () => { vivo = false; document.removeEventListener('visibilitychange', vis); try { trava && trava.release(); } catch (e) {} };
  }

  // ---------- os jogos ----------
  const CORES = [
    { id: 'vermelho', nome: 'VERMELHO', hex: '#d62828' },
    { id: 'azul', nome: 'AZUL', hex: '#1d4ed8' },
    { id: 'verde', nome: 'VERDE', hex: '#15803d' },
    { id: 'amarelo', nome: 'AMARELO', hex: '#f2b705' },
    { id: 'roxo', nome: 'ROXO', hex: '#7c3aed' },
    { id: 'laranja', nome: 'LARANJA', hex: '#ea580c' },
  ];
  const corPorId = id => CORES.find(c => c.id === id);

  // Cada nível é mais difícil que o anterior (regra de todos os jogos do app).
  const JOGOS = {
    cor: {
      nome: 'Fala a cor', icone: '🎨', cor: '#d62828', rodadas: 10,
      desc: 'Na TV aparece o nome de uma cor pintado com outra. Quem tocar primeiro na cor da TINTA leva.',
      // [cores, segundos pra responder, botões mudam de lugar a cada rodada]
      niveis: [[3, 8, false], [4, 7, false], [5, 6, false], [5, 5, true], [6, 5, false], [6, 4, true], [6, 3.5, true], [6, 3, true], [6, 2.5, true], [6, 2, true]],
      nivelTxt(n) { const [k, s, m] = this.niveis[n - 1]; return `${k} cores · ${String(s).replace('.', ',')} s${m ? ' · botões trocam de lugar' : ''}`; },
      sortear(r, n) {
        const [k, s, mexe] = this.niveis[n - 1];
        const ativas = CORES.slice(0, k);
        const palavra = r.pick(ativas);
        let tinta = r.pick(ativas);
        while (tinta.id === palavra.id) tinta = r.pick(ativas);
        const ordem = (mexe ? r.shuffle(ativas) : ativas).map(c => c.id);
        return { dur: s * 1000, certo: tinta.id, d: { palavra: palavra.id, tinta: tinta.id, ordem } };
      },
    },
    rapido: {
      nome: 'Responde rápido', icone: '⏱️', cor: '#15803d', rodadas: 10,
      desc: 'Conta ou pegadinha na TV: certo ou errado? Quem responder certo primeiro leva.',
      niveis: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => [n, [8, 8, 7, 7, 6, 6, 5, 5, 4.5, 4][n - 1]]),
      conteudo: ['soma e diminuição até 10', 'soma e diminuição até 20', 'tabuada até 5 e pegadinhas', 'tabuada completa', 'metade e dobro',
        'vírgula que engana', 'números até 150', 'conta com três números', 'ordem das contas', 'tudo junto, números grandes'],
      nivelTxt(n) { return this.conteudo[n - 1] + ' · ' + String(this.niveis[n - 1][1]).replace('.', ',') + ' s'; },
      sortear(r, n, usadas) {
        const s = this.niveis[n - 1][1];
        let txt, certo;
        const pegas = (CA.PEGADINHAS || []).filter(p => !usadas.has(p[0]));
        if (n >= 3 && pegas.length && r() < 0.3) { [txt, certo] = r.pick(pegas); usadas.add(txt); }
        else if (CA.gerarConta) ({ txt, certo } = CA.gerarConta(r, n));
        else { const a = r.int(1, 9), b = r.int(1, 9), c = a + b + (r() < .5 ? 1 : 0); txt = `${a} + ${b} = ${c}`; certo = c === a + b; }
        return { dur: s * 1000, certo: certo ? 'certo' : 'errado', d: { txt } };
      },
    },
    acha: {
      nome: 'Corrida do Caça-números', icone: '🔢', cor: '#1d4ed8', rodadas: 3,
      desc: 'Todo mundo recebe a mesma grade no celular. Toca do 1 ao último na ordem: quem terminar primeiro ganha.',
      // [quantos números, colunas]
      niveis: [[9, 3], [12, 3], [16, 4], [20, 4], [25, 5], [30, 5], [36, 6], [42, 6], [49, 7], [64, 8]],
      nivelTxt(n) { const [q] = this.niveis[n - 1]; return `do 1 ao ${q} · 3 corridas`; },
      sortear(r, n) {
        const [q, c] = this.niveis[n - 1];
        return { dur: Math.round(15 + q * 1.6) * 1000, certo: null, d: { semente: CA.novaSemente(), q, c } };
      },
    },
  };
  CA.JOGOS_GRUPO = JOGOS;

  // pontos de quem acerta, na ordem de rapidez
  const PONTOS = [3, 2];
  const pontosDa = pos => PONTOS[pos] || 1;

  // cores e letrinha de cada jogador (mesma cor na TV e no celular)
  const TONS = ['#d62828', '#1d4ed8', '#15803d', '#d97706', '#7c3aed', '#be185d', '#0369a1', '#ea580c', '#4d7c0f', '#9333ea', '#0f766e', '#b91c1c'];

  // ---------- aba "Jogos em grupo" (desenhada dentro da página inicial, em app.js) ----------
  CA.grupoAbaHtml = function () {
    const premium = CA.ehPremium();
    const cards = Object.entries(JOGOS).map(([id, j]) => `
      <div class="card-jogo card-grupo" style="--cor:${j.cor}">
        <span class="card-jogo-icone" aria-hidden="true">${j.icone}</span>
        <span class="card-jogo-txt"><strong>${j.nome}</strong><small>${j.desc}</small>
          <span class="card-jogo-rodape"><small class="card-jogo-est">10 níveis · ${premium ? 'todos liberados ★' : 'níveis 1 a 3 grátis'}</small></span></span>
      </div>`).join('');
    return `
      <section class="grupo-aba">
        <div class="grupo-hero">
          <div class="grupo-desenho" aria-hidden="true">
            <span class="g-tv"><b>ABCD</b></span>
            <span class="g-cel">👆</span><span class="g-cel g-cel2">👆</span>
          </div>
          <h2>Joga com a galera na TV</h2>
          <ol class="grupo-passos">
            <li><b>Abre a sala na TV</b> (ou no computador). Aparece um código.</li>
            <li><b>Cada um entra pelo celular</b> com o código. O celular vira o controle.</li>
            <li><b>A pergunta aparece na TV</b>. Quem acertar primeiro no celular leva mais pontos.</li>
          </ol>
          <a class="btn btn-grande" href="#/tv">📺 Abrir a sala na TV</a>
          <small class="grupo-dica">Abre este site no navegador da TV ou no computador ligado na TV.</small>
        </div>

        <form class="grupo-entrar">
          <label for="g-codigo"><b>Tá vendo um código na TV?</b> Entra com o celular:</label>
          <div class="grupo-entrar-linha">
            <input id="g-codigo" name="c" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD" inputmode="text" aria-label="Código da sala">
            <button class="btn" type="submit">Entrar</button>
          </div>
        </form>

        <h2 class="secao">Jogos da sala</h2>
        <div class="lista-jogos">${cards}</div>

        ${premium
          ? '<a class="chamada-premium ativo" href="#/conta"><strong>★ Premium ativo</strong><span>Na tua sala todos os níveis dos jogos em grupo estão liberados. Quem joga pelo celular não paga nada.</span></a>'
          : '<a class="chamada-premium" href="#/premium"><strong>ca<span class="r-marca">R</span>deno Premium</strong><span>Quem abre a sala libera os níveis 4 a 10 de todos os jogos em grupo (e de todos os outros jogos). Quem joga pelo celular nunca paga. Mensal R$ 4,90 ou anual R$ 29,90.</span></a>'}
      </section>`;
  };
  CA.grupoAbaLigar = function (palco) {
    const f = palco.querySelector('.grupo-entrar');
    if (!f) return;
    const inp = f.querySelector('input');
    inp.addEventListener('input', () => { inp.value = inp.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); });
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (inp.value.length !== 4) { inp.focus(); CA.aviso('O código tem 4 letras 😉'); return; }
      location.hash = '#/sala?c=' + inp.value;
    });
  };

  // ======================================================================
  // TV: abre a sala, mostra o código, sorteia as rodadas e soma os pontos
  // ======================================================================
  CA.jogos.tv = {
    nome: 'Jogos em grupo (TV)',
    iniciar(palco) {
      document.body.classList.add('modo-tv');
      let vivo = true;
      const timers = new Set();
      const espera = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (vivo) fn(); }, ms); timers.add(t); return t; };
      const soltarTela = telaAcesa();

      let codigo = '';
      for (let i = 0; i < 4; i++) codigo += LETRAS[Math.floor(Math.random() * LETRAS.length)];
      const linkSala = location.origin + location.pathname + '#/sala?c=' + codigo;
      const endereco = (location.host.replace(/^www\./, '') + location.pathname.replace(/index\.html$/, '')).replace(/\/$/, '');

      // estado da sala
      const S = {
        fase: 'sala', jogo: CA.ler('grupo:jogo', 'cor'), nivel: 1, rodada: 0, rid: '', dados: null, certo: null,
        dur: 0, t0: 0, jog: {}, ordem: [], resp: {}, prog: {}, res: null, usadas: new Set(), semente: 0,
      };
      if (!JOGOS[S.jogo]) S.jogo = 'cor';
      const premium = CA.ehPremium();
      const liberado = n => n <= GRATIS || premium;

      const canal = Canal(codigo, aoMsg, st => {
        if (!vivo) return;
        conexao = st;
        const el = palco.querySelector('.tv-conexao');
        if (el) el.dataset.st = st, el.textContent = st === 'on' ? 'Sala aberta' : st === 'erro' ? 'Sem conexão com a sala' : 'Conectando...';
        if (st === 'on') publicar();
      });
      let conexao = 'conectando';

      const ativos = () => S.ordem.map(id => S.jog[id]).filter(Boolean);
      const online = j => Date.now() - j.visto < 20000;
      const lista = () => ativos().map(j => [j.id, j.nome, j.pts, j.tom, online(j) ? 1 : 0]);

      // manda o estado pros celulares (eles desenham a tela a partir disso)
      function publicar() {
        canal.mandar('estado', {
          f: S.fase, j: S.jogo, n: S.nivel, r: S.rodada, t: JOGOS[S.jogo].rodadas, rid: S.rid,
          d: S.fase === 'rodada' ? S.dados : null, dur: S.dur, lista: lista(), res: S.fase === 'revela' || S.fase === 'fim' ? S.res : null,
        });
      }
      const pulso = setInterval(() => { if (vivo) { publicar(); if (S.fase === 'sala') desenharJogadores(); } }, 5000);

      function aoMsg(ev, p) {
        if (!vivo || !p || !p.id) return;
        const id = String(p.id).slice(0, 24);
        if (ev === 'oi') {
          let j = S.jog[id];
          if (!j) {
            if (S.ordem.length >= MAX_JOGADORES) { canal.mandar('cheia', { id }); return; }
            let nome = String(p.nome || 'Jogador').replace(/\s+/g, ' ').trim().slice(0, 16) || 'Jogador';
            const usados = new Set(ativos().map(x => x.nome.toLowerCase()));
            if (usados.has(nome.toLowerCase())) { let k = 2; while (usados.has((nome + ' ' + k).toLowerCase())) k++; nome = nome + ' ' + k; }
            j = S.jog[id] = { id, nome, pts: 0, tom: TONS[S.ordem.length % TONS.length], visto: Date.now() };
            S.ordem.push(id);
            CA.som('certo');
            if (S.fase === 'sala') desenharJogadores(true);
            else desenharPlacar();
          }
          j.visto = Date.now();
          publicar();
        } else if (ev === 'sai') {
          if (S.jog[id]) { S.jog[id].visto = 0; if (S.fase === 'sala') { delete S.jog[id]; S.ordem = S.ordem.filter(x => x !== id); desenharJogadores(); } }
          checarFimRodada();
        } else if (ev === 'resp') {
          if (S.fase !== 'rodada' || p.rid !== S.rid || !S.jog[id] || S.resp[id]) return;
          S.jog[id].visto = Date.now();
          const ms = Math.max(0, Math.min(+p.ms || 0, S.dur + 2000));
          const ok = S.jogo === 'acha' ? p.v === 'fim' : p.v === S.certo;
          S.resp[id] = { v: p.v, ms, ok };
          marcarRespondeu(id, ok);
          checarFimRodada();
        } else if (ev === 'prog') {
          if (S.fase !== 'rodada' || p.rid !== S.rid || !S.jog[id]) return;
          S.jog[id].visto = Date.now();
          S.prog[id] = Math.max(S.prog[id] || 0, +p.k || 0);
          desenharCorrida();
        }
      }

      // ---------- telas da TV ----------
      function moldura(miolo, lado) {
        palco.innerHTML = '';
        palco.appendChild(CA.el(`
          <section class="tv">
            <header class="tv-topo">
              <a class="tv-sair" href="#/grupo" aria-label="Fechar a sala">‹</a>
              <div class="logo-app"><span class="logo-caderno" aria-hidden="true"></span><span>ca<span class="r-marca">R</span>deno Amarelo · Jogos em grupo</span></div>
              <div class="tv-cod-mini">Sala <b>${codigo}</b></div>
              <span class="tv-conexao" data-st="${conexao}">${conexao === 'on' ? 'Sala aberta' : 'Conectando...'}</span>
              <button class="som tv-tela-cheia" type="button" aria-label="Tela cheia">⛶</button>
            </header>
            <div class="tv-corpo ${lado ? 'com-lado' : ''}">
              <div class="tv-miolo">${miolo}</div>
              ${lado ? `<aside class="tv-lado"><h3>Placar</h3><ol class="tv-placar"></ol><p class="tv-entra">Entra também: <b>${codigo}</b></p></aside>` : ''}
            </div>
          </section>`));
        palco.querySelector('.tv-tela-cheia').addEventListener('click', () => {
          try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) {}
        });
        if (lado) desenharPlacar();
      }

      function telaSala() {
        S.fase = 'sala'; S.res = null; S.rid = '';
        const J = JOGOS[S.jogo];
        if (!liberado(S.nivel)) S.nivel = 1;
        const opJogos = Object.entries(JOGOS).map(([id, j]) =>
          `<button type="button" class="tv-op-jogo ${id === S.jogo ? 'sel' : ''}" data-jogo="${id}" style="--cor:${j.cor}"><i aria-hidden="true">${j.icone}</i><b>${j.nome}</b></button>`).join('');
        const opNiv = J.niveis.map((_, i) => {
          const n = i + 1, ok = liberado(n);
          return `<button type="button" class="tv-op-nivel ${n === S.nivel ? 'sel' : ''} ${ok ? '' : 'tranca'}" data-n="${n}" aria-label="Nível ${n}${ok ? '' : ' (Premium)'}">${ok ? n : '🔒'}</button>`;
        }).join('');
        moldura(`
          <div class="tv-sala">
            <div class="tv-convite">
              <p class="tv-convite-t">Entra pelo celular 📱</p>
              <div class="tv-qr" aria-label="QR code pra entrar na sala"></div>
              <p class="tv-ou">ou abre <b>${esc(endereco)}</b>, toca em <b>Jogos em grupo</b> e digita:</p>
              <p class="tv-codigo">${codigo.split('').map(l => `<span>${l}</span>`).join('')}</p>
            </div>
            <div class="tv-config">
              <h2>Quem tá na sala <small class="tv-qtd"></small></h2>
              <ul class="tv-jogadores"></ul>
              <h2>Escolhe o jogo</h2>
              <div class="tv-jogos">${opJogos}</div>
              <p class="tv-desc">${J.desc}</p>
              <div class="tv-niveis-t"><b>Nível ${S.nivel}</b> · <span class="tv-niv-txt">${J.nivelTxt(S.nivel)}</span></div>
              <div class="tv-niveis">${opNiv}</div>
              ${premium ? '' : '<p class="tv-premium-dica">Níveis 1 a 3 grátis. Do 4 ao 10 com o <a href="#/premium">caRdeno Premium</a> de quem abre a sala.</p>'}
              <button class="btn btn-grande tv-comecar" type="button" disabled>Esperando a galera entrar...</button>
            </div>
          </div>`, false);
        desenharQr();
        desenharJogadores();
        const tela = palco.querySelector('.tv-sala');
        tela.addEventListener('click', e => {
          const bj = e.target.closest('[data-jogo]'), bn = e.target.closest('[data-n]');
          if (bj) { S.jogo = bj.dataset.jogo; CA.gravar('grupo:jogo', S.jogo); S.nivel = 1; telaSala(); publicar(); }
          if (bn) {
            const n = +bn.dataset.n;
            if (!liberado(n)) { CA.aviso('Nível ' + n + ' é caRdeno Premium 🔒'); return; }
            S.nivel = n; telaSala(); publicar();
          }
        });
        tela.querySelector('.tv-comecar').addEventListener('click', comecarPartida);
        publicar();
      }

      function desenharQr() {
        const caixa = palco.querySelector('.tv-qr');
        if (!caixa) return;
        const fazer = () => {
          try {
            const qr = window.qrcode(0, 'M'); qr.addData(linkSala); qr.make();
            caixa.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
          } catch (e) { caixa.remove(); }
        };
        if (window.qrcode) return fazer();
        const s = document.createElement('script');
        s.src = 'js/qrcode.js'; s.onload = () => vivo && fazer(); s.onerror = () => caixa.remove();
        document.head.appendChild(s);
      }

      function chip(j, extra) {
        return `<li class="tv-chip ${online(j) ? '' : 'fora'}" style="--tom:${j.tom}"><i>${esc(j.nome[0].toUpperCase())}</i><span>${esc(j.nome)}</span>${extra || ''}</li>`;
      }
      function desenharJogadores(novo) {
        const ul = palco.querySelector('.tv-jogadores');
        if (!ul) return;
        const js = ativos();
        ul.innerHTML = js.length ? js.map(j => chip(j)).join('') : '<li class="tv-vazio">Ninguém ainda. Aponta a câmera do celular pro QR code 👈</li>';
        if (novo && ul.lastElementChild) ul.lastElementChild.classList.add('chegou');
        palco.querySelector('.tv-qtd').textContent = js.length ? `(${js.length})` : '';
        const b = palco.querySelector('.tv-comecar');
        b.disabled = !js.length;
        b.textContent = js.length ? `Começar ${JOGOS[S.jogo].nome} ▶` : 'Esperando a galera entrar...';
      }

      function desenharPlacar() {
        const ol = palco.querySelector('.tv-placar');
        if (!ol) return;
        const js = ativos().slice().sort((a, b) => b.pts - a.pts);
        ol.innerHTML = js.map(j => `<li class="${online(j) ? '' : 'fora'}" style="--tom:${j.tom}" data-id="${j.id}"><i>${esc(j.nome[0].toUpperCase())}</i><span>${esc(j.nome)}</span><b>${j.pts}</b></li>`).join('');
      }

      function marcarRespondeu(id, ok) {
        const li = palco.querySelector(`.tv-respostas [data-id="${CSS.escape(id)}"]`);
        if (li) li.classList.add('foi');
        if (S.jogo === 'acha' && ok) { CA.som('certo'); desenharCorrida(); }
        else CA.som('tique');
        const q = palco.querySelector('.tv-qtd-resp');
        if (q) q.textContent = `${Object.keys(S.resp).length} de ${ativos().filter(online).length} responderam`;
      }

      // ---------- partida ----------
      function comecarPartida() {
        ativos().forEach(j => { j.pts = 0; });
        S.rodada = 0; S.usadas = new Set(); S.semente = CA.novaSemente();
        proximaRodada();
      }

      function proximaRodada() {
        const J = JOGOS[S.jogo];
        S.rodada++;
        S.fase = 'pre'; S.res = null;
        publicar();
        moldura(`<div class="tv-pre"><p class="tv-pre-r">${J.icone} ${J.nome} · rodada ${S.rodada} de ${J.rodadas}</p>
          <p class="tv-pre-dica">${S.jogo === 'acha' ? 'Olha pro teu celular! 👇' : 'Olha pra TV! 👀'}</p><div class="tv-pre-conta"></div></div>`, true);
        CA.contagem(palco.querySelector('.tv-pre-conta')).then(() => vivo && iniciarRodada());
      }

      function iniciarRodada() {
        const J = JOGOS[S.jogo];
        const r = CA.rng((S.semente + S.rodada * 7919) >>> 0);
        const s = J.sortear(r, S.nivel, S.usadas);
        S.dados = s.d; S.certo = s.certo; S.dur = s.dur;
        S.rid = Math.random().toString(36).slice(2, 9);
        S.resp = {}; S.prog = {};
        S.fase = 'rodada'; S.t0 = performance.now();
        publicar();
        desenharRodada();
        S.fimTimer = espera(fecharRodada, S.dur + 1200); // folguinha pra resposta que ainda tá chegando
      }

      function desenharRodada() {
        const J = JOGOS[S.jogo], d = S.dados;
        let alvo = '';
        if (S.jogo === 'cor') {
          const p = corPorId(d.palavra), t = corPorId(d.tinta);
          alvo = `<p class="tv-pergunta">Toca na cor da <b>tinta</b></p><p class="tv-palavra" style="color:${t.hex}">${p.nome}</p>
            <div class="tv-bolas">${d.ordem.map(id => `<i style="background:${corPorId(id).hex}"></i>`).join('')}</div>`;
        } else if (S.jogo === 'rapido') {
          alvo = `<p class="tv-pergunta">Certo ou errado?</p><p class="tv-frase">${esc(d.txt)}</p>`;
        } else {
          alvo = `<p class="tv-pergunta">Toca do <b>1</b> ao <b>${d.q}</b> no teu celular!</p><ul class="tv-corrida"></ul>`;
        }
        moldura(`
          <div class="tv-rodada">
            <p class="tv-pre-r">${J.icone} ${J.nome} · rodada ${S.rodada} de ${J.rodadas}</p>
            <div class="tv-tempo"><i style="animation-duration:${S.dur}ms"></i></div>
            ${alvo}
            ${S.jogo === 'acha' ? '' : `<ul class="tv-respostas">${ativos().map(j => chip(j).replace('<li class="tv-chip', `<li data-id="${esc(j.id)}" class="tv-chip`)).join('')}</ul>
            <p class="tv-qtd-resp">0 de ${ativos().filter(online).length} responderam</p>`}
          </div>`, true);
        if (S.jogo === 'acha') desenharCorrida();
      }

      function desenharCorrida() {
        const ul = palco.querySelector('.tv-corrida');
        if (!ul || !S.dados) return;
        const q = S.dados.q;
        const js = ativos().slice().sort((a, b) => {
          const ra = S.resp[a.id], rb = S.resp[b.id];
          if (ra && rb) return ra.ms - rb.ms;
          if (ra || rb) return ra ? -1 : 1;
          return (S.prog[b.id] || 0) - (S.prog[a.id] || 0);
        });
        ul.innerHTML = js.map(j => {
          const r = S.resp[j.id], k = r ? q : (S.prog[j.id] || 0);
          return `<li style="--tom:${j.tom}" class="${r ? 'chegou' : ''}"><span class="tv-corr-nome">${esc(j.nome)}</span>
            <span class="tv-corr-trilho"><i style="width:${Math.round(k / q * 100)}%"></i></span>
            <b>${r ? '🏁 ' + CA.fmtSeg(r.ms / 1000) : k + '/' + q}</b></li>`;
        }).join('');
      }

      function checarFimRodada() {
        if (S.fase !== 'rodada') return;
        const on = ativos().filter(online);
        const todos = on.length > 0 && on.every(j => S.resp[j.id]);
        if (todos) { clearTimeout(S.fimTimer); timers.delete(S.fimTimer); S.fimTimer = espera(fecharRodada, 500); }
      }

      function fecharRodada() {
        if (S.fase !== 'rodada') return;
        const J = JOGOS[S.jogo];
        const certos = Object.entries(S.resp).filter(([, r]) => r.ok).sort((a, b) => a[1].ms - b[1].ms);
        const lista = certos.map(([id, r], i) => { const g = pontosDa(i); if (S.jog[id]) S.jog[id].pts += g; return [id, r.ms, g]; });
        const erros = Object.entries(S.resp).filter(([, r]) => !r.ok).map(([id]) => id);
        S.res = { certo: S.certo, d: S.dados, ganhos: lista, erros };
        S.fase = S.rodada >= J.rodadas ? 'fim' : 'revela';
        if (S.fase === 'fim') { telaFim(); publicar(); return; }
        publicar();
        telaRevela();
        espera(proximaRodada, 4200);
      }

      function textoCerto() {
        const d = S.res.d;
        if (S.jogo === 'cor') { const t = corPorId(d.tinta); return `A tinta era <b style="color:${t.hex}">${t.nome}</b>`; }
        if (S.jogo === 'rapido') return `${esc(d.txt)} → <b class="${S.res.certo === 'certo' ? 'ok' : 'nao'}">${S.res.certo === 'certo' ? 'CERTO' : 'ERRADO'}</b>`;
        return `Corrida do 1 ao ${d.q}`;
      }

      function telaRevela() {
        const g = S.res.ganhos;
        const prim = g[0] && S.jog[g[0][0]];
        CA.som(prim ? 'certo' : 'errado');
        moldura(`
          <div class="tv-revela">
            <p class="tv-certo">${textoCerto()}</p>
            ${prim ? `<p class="tv-raio" style="--tom:${prim.tom}">⚡ <b>${esc(prim.nome)}</b> foi ${S.jogo === 'acha' ? 'o mais rápido' : 'quem acertou primeiro'}! <small>${CA.fmtSeg(g[0][1] / 1000)}</small></p>` : '<p class="tv-raio ninguem">Ninguém acertou dessa vez 😅</p>'}
            <ul class="tv-ganhos">${g.slice(0, 8).map(([id, ms, pts], i) => { const j = S.jog[id]; return j ? `<li style="--tom:${j.tom}"><span>${i + 1}º</span><i>${esc(j.nome[0].toUpperCase())}</i><b>${esc(j.nome)}</b><small>${CA.fmtSeg(ms / 1000)}</small><em>+${pts}</em></li>` : ''; }).join('')}</ul>
            <p class="tv-prox">Próxima rodada já já...</p>
          </div>`, true);
      }

      function telaFim() {
        const js = ativos().slice().sort((a, b) => b.pts - a.pts);
        CA.som('recorde');
        const pod = [js[1], js[0], js[2]];
        moldura(`
          <div class="tv-fim">
            <p class="tv-pre-r">${JOGOS[S.jogo].icone} ${JOGOS[S.jogo].nome} · nível ${S.nivel}</p>
            <h2 class="tv-campeao">${js[0] ? '🏆 ' + esc(js[0].nome) + ' ganhou!' : 'Fim de jogo'}</h2>
            <div class="tv-podio">${pod.map((j, i) => j ? `<div class="tv-degrau d${[2, 1, 3][i]}" style="--tom:${j.tom}"><i>${esc(j.nome[0].toUpperCase())}</i><b>${esc(j.nome)}</b><small>${j.pts} pts</small><span>${[2, 1, 3][i]}º</span></div>` : '<div class="tv-degrau vazio"></div>').join('')}</div>
            ${js.length > 3 ? `<ol class="tv-resto" start="4">${js.slice(3).map(j => `<li>${esc(j.nome)} · ${j.pts} pts</li>`).join('')}</ol>` : ''}
            <div class="tv-fim-botoes">
              <button class="btn btn-grande" type="button" data-a="denovo">Jogar de novo</button>
              <button class="btn btn-grande btn-claro" type="button" data-a="trocar">Trocar de jogo ou nível</button>
            </div>
            <p class="tv-fim-marca">Posta a foto da galera e marca <b>@caRdeno_Amarelo</b> 📸</p>
          </div>`, false);
        palco.querySelector('[data-a=denovo]').addEventListener('click', comecarPartida);
        palco.querySelector('[data-a=trocar]').addEventListener('click', () => { telaSala(); });
      }

      telaSala();
      if (window.matchMedia('(max-width: 700px)').matches) CA.aviso('Dica: abre a sala na TV ou no computador, e o celular vira controle 📺');

      return () => {
        vivo = false;
        try { canal.mandar('tchau', { id: 'tv' }); } catch (e) {}
        setTimeout(() => canal.fechar(), 150);
        clearInterval(pulso);
        timers.forEach(clearTimeout);
        soltarTela();
        document.body.classList.remove('modo-tv');
      };
    },
  };

  // ======================================================================
  // CELULAR: entra na sala e vira o controle
  // ======================================================================
  CA.jogos.sala = {
    nome: 'Jogos em grupo',
    iniciar(palco, p) {
      const codigo = String(p.c || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
      if (codigo.length !== 4) { location.replace('#/grupo'); return null; }
      let vivo = true, canal = null, oiT = 0, achouT = 0, soltarTela = null;
      let meuId = CA.ler('grupo:id', null);
      if (!meuId) { meuId = Math.random().toString(36).slice(2, 12); CA.gravar('grupo:id', meuId); }
      const perfil = (CA.perfil && CA.perfil()) || {};
      let nome = CA.ler('grupo:nome', '') || perfil.apelido || '';
      let E = null;          // último estado da TV
      let ridFeito = '';     // rodada que já respondi
      let ridTela = '';      // rodada desenhada agora
      let t0 = 0;

      function casca(miolo, cls) {
        palco.innerHTML = '';
        const me = E && E.lista && E.lista.find(x => x[0] === meuId);
        palco.appendChild(CA.el(`
          <section class="ctrl ${cls || ''}">
            <div class="ctrl-topo">
              <a class="voltar" href="#/grupo" aria-label="Sair da sala">‹</a>
              <span class="ctrl-sala">Sala <b>${codigo}</b></span>
              ${me ? `<span class="ctrl-eu" style="--tom:${me[3]}"><i>${esc(me[1][0].toUpperCase())}</i>${esc(me[1])} · <b>${me[2]}</b> pts</span>` : ''}
            </div>
            ${miolo}
          </section>`));
      }

      function pedirNome() {
        casca(`
          <form class="ctrl-nome">
            <h1>Entrando na sala <b>${codigo}</b></h1>
            <label for="g-nome">Como tu quer aparecer na TV?</label>
            <input id="g-nome" maxlength="16" required autocomplete="nickname" placeholder="Teu nome ou apelido" value="${esc(nome)}">
            <button class="btn btn-grande" type="submit">Entrar na sala</button>
            <small>Não precisa de conta nem pagar nada pra jogar pelo celular.</small>
          </form>`);
        const f = palco.querySelector('.ctrl-nome');
        const inp = f.querySelector('input');
        if (!nome) setTimeout(() => inp.focus(), 50);
        f.addEventListener('submit', e => {
          e.preventDefault();
          nome = inp.value.replace(/\s+/g, ' ').trim().slice(0, 16);
          if (!nome) return;
          CA.gravar('grupo:nome', nome);
          entrar();
        });
      }

      function entrar() {
        casca(`<div class="ctrl-msg"><div class="ctrl-girando" aria-hidden="true"></div><h2>Entrando na sala ${codigo}...</h2></div>`);
        soltarTela = telaAcesa();
        canal = Canal(codigo, aoMsg, st => {
          if (!vivo) return;
          if (st === 'on') mandarOi();
          if (st === 'erro' && !E) casca(`<div class="ctrl-msg"><h2>Não consegui conectar 😕</h2><p>Confere a internet do celular e tenta de novo.</p><a class="btn btn-grande" href="#/sala?c=${codigo}" onclick="location.reload()">Tentar de novo</a></div>`);
        });
        oiT = setInterval(mandarOi, 8000);
        achouT = setTimeout(() => {
          if (vivo && !E) casca(`<div class="ctrl-msg"><h2>Não achei a sala ${codigo} 🤔</h2>
            <p>Confere o código que tá na TV. Se a TV fechou a sala, ela mostra um código novo.</p>
            <a class="btn btn-grande" href="#/grupo">Digitar outro código</a><p class="ctrl-peq">Continuo procurando...</p></div>`);
        }, 7000);
      }
      const mandarOi = () => canal && canal.mandar('oi', { id: meuId, nome });

      function aoMsg(ev, d) {
        if (!vivo) return;
        if (ev === 'cheia' && d.id === meuId) {
          casca('<div class="ctrl-msg"><h2>A sala tá cheia 😅</h2><p>Cabem até 12 pessoas por sala.</p></div>');
          return;
        }
        if (ev === 'tchau') {
          E = null;
          casca('<div class="ctrl-msg"><h2>A sala fechou 👋</h2><p>Quando a TV abrir outra sala, entra com o código novo.</p><a class="btn btn-grande" href="#/grupo">Entrar com outro código</a></div>');
          return;
        }
        if (ev !== 'estado') return;
        const antes = E;
        E = d;
        clearTimeout(achouT);
        const estou = (d.lista || []).some(x => x[0] === meuId);
        if (!estou) { mandarOi(); if (!antes) return; }
        // só redesenha quando muda de tela (o estado chega a cada 5 s)
        const chave = d.f + '|' + d.rid + '|' + d.j + '|' + d.n + '|' + d.r + '|' + (d.lista || []).length;
        const meuPts = ((d.lista || []).find(x => x[0] === meuId) || [])[2];
        const chaveAntes = antes ? antes.f + '|' + antes.rid + '|' + antes.j + '|' + antes.n + '|' + antes.r + '|' + (antes.lista || []).length : '';
        const ptsAntes = antes ? ((antes.lista || []).find(x => x[0] === meuId) || [])[2] : null;
        if (chave === chaveAntes && meuPts === ptsAntes && estou === (antes && (antes.lista || []).some(x => x[0] === meuId))) return;
        desenhar();
      }

      function desenhar() {
        const d = E, J = JOGOS[d.j] || JOGOS.cor;
        if (d.f === 'sala') {
          ridTela = '';
          const me = (d.lista || []).find(x => x[0] === meuId);
          casca(`<div class="ctrl-msg">
            <p class="ctrl-grande">✅</p>
            <h2>${me ? 'Tu tá na sala!' : 'Entrando...'}</h2>
            <p>Olha teu nome na TV. Quem tá na TV escolhe o jogo e começa.</p>
            <div class="ctrl-proximo"><small>Jogo escolhido</small><b>${J.icone} ${J.nome}</b><span>Nível ${d.n} · ${J.nivelTxt(d.n)}</span></div>
            <p class="ctrl-peq">${(d.lista || []).length} na sala</p>
          </div>`, 'ctrl-espera');
        } else if (d.f === 'pre') {
          ridTela = '';
          casca(`<div class="ctrl-msg"><p class="ctrl-pre-r">Rodada ${d.r} de ${d.t}</p><h2 class="ctrl-olha">${d.j === 'acha' ? 'Prepara o dedo! 👆' : 'Olha pra TV! 👀'}</h2>
            <p>${d.j === 'cor' ? 'Toca na cor da <b>tinta</b>, não no que tá escrito.' : d.j === 'rapido' ? 'Certo ou errado? Quem acertar primeiro leva mais.' : 'A grade aparece aqui no teu celular. Toca do 1 ao último na ordem!'}</p></div>`, 'ctrl-espera');
        } else if (d.f === 'rodada') {
          if (ridTela === d.rid) return;
          ridTela = d.rid;
          if (ridFeito === d.rid) { casca('<div class="ctrl-msg"><h2>Foi! ✋</h2><p>Espera a rodada acabar...</p></div>'); return; }
          if (d.j === 'cor') controleCor(d);
          else if (d.j === 'rapido') controleRapido(d);
          else controleAcha(d);
        } else if (d.f === 'revela' || d.f === 'fim') {
          ridTela = '';
          const g = (d.res && d.res.ganhos) || [];
          const pos = g.findIndex(x => x[0] === meuId);
          const errou = d.res && (d.res.erros || []).includes(meuId);
          let msg;
          if (pos === 0) msg = `<p class="ctrl-grande">⚡</p><h2>Tu foi ${d.j === 'acha' ? 'o mais rápido' : 'o primeiro'}! +${g[0][2]}</h2>`;
          else if (pos > 0) msg = `<p class="ctrl-grande">👍</p><h2>${d.j === 'acha' ? 'Chegou' : 'Acertou'}! ${pos + 1}º · +${g[pos][2]}</h2>`;
          else if (errou) msg = `<p class="ctrl-grande">❌</p><h2>Errou essa!</h2>`;
          else msg = `<p class="ctrl-grande">⏰</p><h2>${d.j === 'acha' ? 'Não terminou a tempo' : 'Não deu tempo'}</h2>`;
          if (d.f === 'fim') {
            const ord = (d.lista || []).slice().sort((a, b) => b[2] - a[2]);
            const minha = ord.findIndex(x => x[0] === meuId) + 1;
            casca(`<div class="ctrl-msg ctrl-fim">
              <p class="ctrl-grande">${minha === 1 ? '🏆' : minha === 2 ? '🥈' : minha === 3 ? '🥉' : '🎉'}</p>
              <h2>${minha === 1 ? 'Tu ganhou!' : minha ? 'Tu ficou em ' + minha + 'º' : 'Fim de jogo'}</h2>
              <p>${ord[0] ? 'Campeão: <b>' + esc(ord[0][1]) + '</b> com ' + ord[0][2] + ' pts' : ''}</p>
              <p class="ctrl-peq">Quem tá na TV escolhe se joga de novo.</p>
              <a class="convite-conta" href="#/">
                <span class="convite-medalha" aria-hidden="true">🧠</span>
                <span><strong>Treina sozinho também</strong><small>Os mesmos jogos com níveis e ranking. Os 3 primeiros níveis são grátis.</small></span></a>
            </div>`);
          } else {
            casca(`<div class="ctrl-msg">${msg}<p class="ctrl-peq">Olha o placar na TV</p></div>`);
          }
        }
      }

      function responder(v) {
        if (!E || E.f !== 'rodada' || ridFeito === E.rid) return;
        ridFeito = E.rid;
        const ms = Math.round(performance.now() - t0);
        canal.mandar('resp', { id: meuId, rid: E.rid, v, ms });
        CA.vibrar(30);
        casca(`<div class="ctrl-msg"><h2>Foi! ✋</h2><p>${CA.fmtSeg(ms / 1000)}. Espera a rodada acabar...</p></div>`);
      }

      function controleCor(d) {
        const ops = d.d.ordem.map(corPorId);
        casca(`<div class="ctrl-jogo">
          <p class="ctrl-pre-r">Rodada ${d.r} de ${d.t} · toca na cor da <b>tinta</b></p>
          <div class="ctrl-cores n${ops.length}">${ops.map(c => `<button type="button" class="ctrl-cor" data-v="${c.id}" style="--c:${c.hex}" aria-label="${c.nome}"></button>`).join('')}</div>
        </div>`);
        t0 = performance.now();
        palco.querySelector('.ctrl-cores').addEventListener('pointerdown', e => {
          const b = e.target.closest('[data-v]'); if (b) { e.preventDefault(); responder(b.dataset.v); }
        });
      }

      function controleRapido(d) {
        casca(`<div class="ctrl-jogo">
          <p class="ctrl-pre-r">Rodada ${d.r} de ${d.t} · olha a conta na TV</p>
          <div class="ctrl-ce">
            <button type="button" class="ctrl-btn-ce certo" data-v="certo">✔ CERTO</button>
            <button type="button" class="ctrl-btn-ce errado" data-v="errado">✘ ERRADO</button>
          </div>
        </div>`);
        t0 = performance.now();
        palco.querySelector('.ctrl-ce').addEventListener('pointerdown', e => {
          const b = e.target.closest('[data-v]'); if (b) { e.preventDefault(); responder(b.dataset.v); }
        });
      }

      // Caça-números: mesma grade pra todo mundo (vem da semente da TV)
      const FUNDOS = [['#fde2e4', '#d62828'], ['#dbeafe', '#1d4ed8'], ['#dcfce7', '#15803d'], ['#fef3c7', '#d97706'], ['#ede9fe', '#7c3aed'], ['#ffedd5', '#ea580c'], ['#e0f2fe', '#0369a1'], ['#fce7f3', '#be185d']];
      function controleAcha(d) {
        const { semente, q, c } = d.d;
        const r = CA.rng(semente);
        const nums = r.shuffle(Array.from({ length: q }, (_, i) => i + 1));
        const cores = nums.map(() => r.pick(FUNDOS));
        const giro = nums.map(() => (r() * 6 - 3).toFixed(1));
        casca(`<div class="ctrl-jogo ctrl-acha">
          <div class="barra"><div class="alvo">Acha o <b>1</b></div><div class="relogio">0,0 s</div></div>
          <div class="grade" style="--n:${c}">${nums.map((v, i) => `<button class="cel" data-v="${v}" style="--fundo:${cores[i][0]};--borda:${cores[i][1]};--giro:${giro[i]}deg"><span class="txt">${v}</span></button>`).join('')}</div>
        </div>`, 'ctrl-corrida');
        t0 = performance.now();
        let alvo = 1, multa = 0, raf = 0;
        const elA = palco.querySelector('.alvo b'), elR = palco.querySelector('.relogio');
        const rid = d.rid;
        (function tick() {
          if (!vivo || ridTela !== rid || ridFeito === rid) return;
          elR.textContent = CA.fmtSeg((performance.now() - t0) / 1000 + multa);
          raf = requestAnimationFrame(tick);
        })();
        palco.querySelector('.grade').addEventListener('pointerdown', e => {
          const b = e.target.closest('.cel');
          if (!b || b.classList.contains('feito') || ridFeito === rid) return;
          e.preventDefault();
          if (+b.dataset.v === alvo) {
            b.classList.add('feito'); CA.som('certo');
            alvo++;
            if (alvo > q) {
              cancelAnimationFrame(raf);
              ridFeito = rid;
              const ms = Math.round(performance.now() - t0 + multa * 1000);
              canal.mandar('resp', { id: meuId, rid, v: 'fim', ms });
              CA.vibrar([40, 40, 80]);
              casca(`<div class="ctrl-msg"><p class="ctrl-grande">🏁</p><h2>Terminou! ${CA.fmtSeg(ms / 1000)}</h2><p>Olha na TV quem chegou primeiro.</p></div>`);
              return;
            }
            elA.textContent = alvo;
            canal.mandar('prog', { id: meuId, rid, k: alvo - 1 });
          } else {
            multa += 1; CA.som('errado'); CA.vibrar(60);
            b.classList.remove('treme'); void b.offsetWidth; b.classList.add('treme');
          }
        });
      }

      if (nome && p.ok) entrar(); else pedirNome();

      return () => {
        vivo = false;
        clearInterval(oiT); clearTimeout(achouT);
        if (canal) { try { canal.mandar('sai', { id: meuId }); } catch (e) {} setTimeout(() => canal.fechar(), 150); }
        if (soltarTela) soltarTela();
      };
    },
  };
})();
