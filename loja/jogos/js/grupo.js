/* Jogos em grupo: a TV (ou o computador) abre uma sala; cada pessoa entra pelo celular
   (QR code, link curto /s/CODIGO ou digitando o código) e o celular vira o controle.

   Conversa entre TV e celulares: Supabase Realtime (canal "broadcast", sem tabela e sem guardar nada).
   A TV manda em tudo: ela sorteia, confere as respostas e soma os pontos.

   A sala NÃO acaba quando um jogo acaba (pedido do Rafael 16/11): no fim todo mundo volta pra sala,
   vota no próximo jogo e o 👑 chefe da sala (o primeiro que entrou) ou a TV começa.
   Se a TV recarregar ou sair um instante, ela volta com o MESMO código e o placar; os celulares
   esperam e se reconectam sozinhos. Só "Fechar a sala" encerra de verdade.

   Rotas:
     #/grupo          aba "Jogos em grupo" da página inicial (fica em app.js)
     #/tv             a TV abre a sala
     #/sala?c=ABCD    o celular entra na sala ABCD (o link /s/ABCD cai aqui, ver app.js e _redirects)

   Premium: quem joga pelo celular nunca paga nem precisa de conta. Quem abre a sala na TV
   joga os níveis 1 a 3 de cada jogo de graça; do 4 ao 10 é caRdeno Premium (de quem abriu a sala). */
(function () {
  'use strict';
  const CA = window.CA;
  const GRATIS = 3;
  const MAX_JOGADORES = 12;
  const VALIDADE_SALA = 4 * 3600e3; // a TV reaproveita o mesmo código por 4 horas
  const LETRAS = 'ABCDEFGHJKLMNPRSTUVXZ'; // sem I, O, Q, W, Y (confundem quando falados ou na TV)
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- canal em tempo real (protocolo do Supabase Realtime, sem biblioteca) ----------
  // Reconecta sozinho: se a internet piscar, se o celular apagar a tela, ou se o servidor parar de responder.
  function Canal(codigo, aoMsg, aoStatus) {
    const cfg = window.LOJA_CONFIG || {};
    const url = window.CA_RT_URL ||
      (cfg.supabaseUrl || '').replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(cfg.supabaseAnonKey || '') + '&vsn=1.0.0';
    const topico = 'realtime:ca-sala-' + codigo;
    let ws = null, ref = 0, joinRef = null, ok = false, fechado = false, hb = 0, hbPend = 0, tent = 0, fila = [], volta = 0;
    const cru = o => { try { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); } catch (e) {} };
    function abrir() {
      clearTimeout(volta);
      try { ws = new WebSocket(url); } catch (e) { aoStatus('erro'); agendar(); return; }
      const este = ws;
      ws.onopen = () => {
        joinRef = String(++ref);
        cru({ topic: topico, event: 'phx_join', ref: joinRef, join_ref: joinRef,
          payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, private: false } } });
        clearInterval(hb); hbPend = 0;
        hb = setInterval(() => {
          if (hbPend >= 2) { try { este.close(); } catch (x) {} return; } // servidor mudo: reconecta
          hbPend++;
          cru({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(++ref) });
        }, 12000);
      };
      ws.onmessage = e => {
        let d; try { d = JSON.parse(e.data); } catch (x) { return; }
        if (d.topic === 'phoenix') { if (d.event === 'phx_reply') hbPend = 0; return; }
        if (d.topic !== topico) return;
        if (d.event === 'phx_reply' && d.ref === joinRef) {
          ok = !!(d.payload && d.payload.status === 'ok');
          if (ok) tent = 0;
          aoStatus(ok ? 'on' : 'erro');
          if (ok) { const f = fila; fila = []; f.forEach(([ev, p]) => mandar(ev, p)); }
          else { try { este.close(); } catch (x) {} }
          return;
        }
        if (d.event === 'broadcast' && d.payload) aoMsg(d.payload.event, d.payload.payload || {});
        if (d.event === 'phx_error' || d.event === 'phx_close') { try { este.close(); } catch (x) {} }
      };
      ws.onclose = () => {
        if (este !== ws) return;
        clearInterval(hb); ok = false;
        if (fechado) return;
        aoStatus('caiu');
        agendar();
      };
      ws.onerror = () => {};
    }
    function agendar() { clearTimeout(volta); volta = setTimeout(() => { if (!fechado) abrir(); }, Math.min(5000, 300 * 2 ** tent++)); }
    function mandar(ev, p) {
      if (!ok) { if (fila.length < 40) fila.push([ev, p]); return; }
      cru({ topic: topico, event: 'broadcast', ref: String(++ref), join_ref: joinRef, payload: { type: 'broadcast', event: ev, payload: p } });
    }
    // voltou pro app (tela acendeu, trocou de aba): se caiu, reconecta na hora
    const aoVoltar = () => {
      if (document.visibilityState !== 'visible' || fechado) return;
      if (!ws || ws.readyState > 1) { tent = 0; abrir(); }
    };
    document.addEventListener('visibilitychange', aoVoltar);
    window.addEventListener('online', aoVoltar);
    abrir();
    return {
      mandar,
      get ok() { return ok; },
      reabrir() { tent = 0; try { ws && ws.close(); } catch (e) {} if (!ws || ws.readyState === 3) abrir(); },
      fechar() {
        fechado = true; clearInterval(hb); clearTimeout(volta);
        document.removeEventListener('visibilitychange', aoVoltar); window.removeEventListener('online', aoVoltar);
        try { ws && ws.close(); } catch (e) {}
      },
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
  const OPCOES = [['A', '#d62828'], ['B', '#1d4ed8'], ['C', '#15803d']]; // cores das alternativas do Quiz
  const ANIMAIS = ['🐶', '🐱', '🐸', '🐷', '🐔', '🐟', '🐢', '🐰'];
  const COISAS = ['🍎', '⭐', '🚗', '🌻', '⚽', '🎈', '🍌', '🧀'];
  const PARECIDOS = [['🐶', '🐺', '🦊', '🐱'], ['🍎', '🍅', '🍒', '🍓'], ['🐸', '🐢', '🦎', '🐊'], ['⭐', '🌟', '✨', '💫'], ['🚗', '🚕', '🚙', '🚓']];

  // Cada nível é mais difícil que o anterior (regra de todos os jogos do app).
  // tipo: 'sprint' (sequência no celular, conta acertos), 'corrida' (mesma grade, quem termina primeiro)
  // ou 'pergunta' (a TV mostra, cada um responde uma vez; quem acerta mais rápido leva 3, 2, 1 pontos).
  const JOGOS = {
    cor: {
      nome: 'Fala a cor', icone: '🎨', cor: '#d62828', rodadas: 1, tipo: 'sprint', olha: 'celular',
      desc: 'As cores aparecem no celular de cada um, sem parar. Quem acertar mais no tempo ganha.',
      como: ['Aparece o nome de uma cor pintado com outra tinta', 'Toca na cor da <b>tinta</b>, não na palavra', 'Quem acertar mais em 30 segundos ganha'],
      // [cores, segundos, multa por erro, botões mudam de lugar]
      niveis: [[3, 30, 1, false], [4, 30, 2, false], [5, 30, 2, false], [5, 30, 2, true], [6, 30, 2, false], [6, 30, 2, true], [6, 25, 3, true], [6, 20, 3, true], [6, 20, 3, true], [6, 15, 3, true]],
      nivelTxt(n) { const [k, s, m, x] = this.niveis[n - 1]; return `${k} cores · ${s} s${x ? ' · botões trocam de lugar' : ''} · errou, perde ${m} s`; },
      sortear(r, n) {
        const [k, s, multa, mexe] = this.niveis[n - 1];
        return { dur: s * 1000, certo: null, d: { semente: CA.novaSemente(), k, multa, mexe: mexe ? 1 : 0 } };
      },
    },
    rapido: {
      nome: 'Responde rápido', icone: '⏱️', cor: '#15803d', rodadas: 1, tipo: 'sprint', olha: 'celular',
      desc: 'Contas e pegadinhas no celular de cada um, certo ou errado, sem parar. Quem acertar mais ganha.',
      como: ['Aparece uma conta ou pegadinha no teu celular', 'Toca em <b>CERTO</b> ou <b>ERRADO</b>, uma atrás da outra', 'Errou, perde segundos. Quem acertar mais ganha'],
      niveis: [[30, 1, 0], [30, 2, 0], [30, 2, 1], [30, 2, 1], [30, 2, 1], [25, 3, 1], [25, 3, 1], [25, 3, 1], [20, 3, 1], [20, 3, 1]],
      conteudo: ['soma e diminuição até 10', 'soma e diminuição até 20', 'tabuada até 5 e pegadinhas', 'tabuada completa', 'metade e dobro',
        'vírgula que engana', 'números até 150', 'conta com três números', 'ordem das contas', 'tudo junto, números grandes'],
      nivelTxt(n) { const [s, m] = this.niveis[n - 1]; return `${this.conteudo[n - 1]} · ${s} s · errou, perde ${m} s`; },
      sortear(r, n) {
        const [s, multa, pega] = this.niveis[n - 1];
        return { dur: s * 1000, certo: null, d: { semente: CA.novaSemente(), n, multa, pega } };
      },
    },
    acha: {
      nome: 'Corrida do Caça-números', icone: '🔢', cor: '#1d4ed8', rodadas: 3, tipo: 'corrida', olha: 'celular',
      desc: 'Todo mundo recebe a mesma grade no celular. Toca do 1 ao último na ordem: quem terminar primeiro ganha.',
      como: ['A mesma grade de números aparece em todos os celulares', 'Toca do <b>1</b> até o último, na ordem', 'Quem terminar primeiro leva mais pontos. São 3 corridas'],
      niveis: [[9, 3], [12, 3], [16, 4], [20, 4], [25, 5], [30, 5], [36, 6], [42, 6], [49, 7], [64, 8]],
      nivelTxt(n) { const [q] = this.niveis[n - 1]; return `do 1 ao ${q} · 3 corridas`; },
      sortear(r, n) {
        const [q, c] = this.niveis[n - 1];
        return { dur: Math.round(15 + q * 1.6) * 1000, certo: null, d: { semente: CA.novaSemente(), q, c } };
      },
    },
    quiz: {
      nome: 'Quiz das pegadinhas', icone: '🤔', cor: '#7c3aed', rodadas: 5, tipo: 'pergunta', olha: 'tv',
      desc: 'A pergunta aparece na TV, cada um escolhe a resposta no celular. Quem acertar mais rápido leva mais pontos.',
      como: ['A pergunta aparece na TV, com 3 respostas', 'Escolhe a certa no celular. Cuidado que é pegadinha!', 'Acertou mais rápido, leva mais pontos. São 5 perguntas'],
      segs: [20, 20, 18, 18, 16, 16, 15, 14, 13, 12],
      nivelTxt(n) { return `pegadinhas nível ${n} · ${this.segs[n - 1]} s por pergunta · 5 perguntas`; },
      sortear(r, n, usadas) {
        const lista = (window.PEGADINHAS || [])[n - 1] || [];
        let i = r.int(0, Math.max(0, lista.length - 1)), volta = 0;
        while (usadas.has('q' + i) && volta++ < 40) i = r.int(0, lista.length - 1);
        usadas.add('q' + i);
        const [p, certa, erradas, expl] = lista[i] || ['Quanto é 2 + 2?', '4', ['5', '22'], ''];
        const ops = r.shuffle([certa].concat(erradas.slice(0, 2)));
        return { dur: this.segs[n - 1] * 1000, certo: String(ops.indexOf(certa)), d: { p, ops, expl } };
      },
    },
    reflexo: {
      nome: 'Dedo mais rápido', icone: '⚡', cor: '#ea580c', rodadas: 5, tipo: 'pergunta', olha: 'celular',
      desc: 'A tela fica vermelha... quando ficar VERDE, toca! Quem tocar antes da hora queima.',
      como: ['Teu celular fica vermelho: espera...', 'Ficou <b>VERDE</b>? Toca o mais rápido que puder!', 'Tocou antes da hora, queimou. Nos níveis altos tem sinal falso'],
      // [sinais falsos, ms que o verde fica na tela]
      niveis: [[0, 3000], [0, 2500], [1, 2500], [1, 2000], [2, 2000], [2, 1600], [3, 1500], [3, 1300], [4, 1100], [5, 900]],
      nivelTxt(n) { const [f, j] = this.niveis[n - 1]; return `${f ? f + ' sinal falso' + (f > 1 ? 's' : '') + ' por rodada' : 'sem sinal falso'} · verde fica ${(j / 1000).toFixed(1).replace('.', ',')} s · 5 rodadas`; },
      sortear(r, n) {
        const [falsos, janela] = this.niveis[n - 1];
        const ev = []; let t = 1500 + r.int(0, 2500);
        for (let i = 0; i < falsos; i++) {
          ev.push([t, n >= 7 && i % 2 ? 'falso2' : 'falso', 700]);
          t += 700 + 900 + r.int(0, 1500);
        }
        ev.push([t, 'vai', janela]);
        return { dur: t + janela + 900, certo: 'ok', d: { ev } };
      },
      conferir: v => v === 'ok',
    },
    conta: {
      nome: 'Quantos tem?', icone: '👀', cor: '#0369a1', rodadas: 4, tipo: 'pergunta', olha: 'tv',
      desc: 'A TV mostra um monte de bichinhos por poucos segundos. Quantos tinha? Quem chegar mais perto ganha.',
      como: ['A TV mostra um monte de figurinhas por poucos segundos', 'Conta só as que a TV pedir', 'Digita no celular quantas tinha. Acertou em cheio: 3 pontos'],
      // [mínimo e máximo do que conta, figurinhas que enganam, tipos que enganam, ms na tela]
      niveis: [[4, 7, 0, 0, 5000], [5, 9, 3, 1, 5000], [7, 11, 6, 2, 4500], [8, 12, 9, 2, 4000], [9, 14, 12, 3, 4000], [10, 15, 15, 3, 3500], [11, 17, 18, 3, 3500], [12, 18, 20, 3, 3000], [14, 20, 24, 3, 3000], [15, 23, 28, 3, 2500]],
      nivelTxt(n) { const [a, b, f, , ms] = this.niveis[n - 1]; return `de ${a} a ${b} pra contar${f ? ' no meio de ' + f + ' que enganam' : ''} · ${(ms / 1000).toFixed(1).replace('.', ',')} s pra olhar`; },
      sortear(r, n, usadas) {
        const [a, b, falsas, tipos, ver] = this.niveis[n - 1];
        let alvo, outras;
        if (n >= 8) { const g = r.pick(PARECIDOS); alvo = g[0]; outras = g.slice(1); }
        else { const base = r() < 0.5 ? ANIMAIS : COISAS; alvo = r.pick(base); outras = r.shuffle(base.filter(x => x !== alvo)).slice(0, tipos); }
        const qtd = r.int(a, b);
        const fig = Array(qtd).fill(alvo).concat(Array.from({ length: outras.length ? falsas : 0 }, () => r.pick(outras)));
        const total = fig.length, col = Math.ceil(Math.sqrt(total * 1.8)), lin = Math.ceil(total / col);
        const casas = r.shuffle(Array.from({ length: col * lin }, (_, i) => i)).slice(0, total);
        const itens = r.shuffle(fig).map((e, i) => {
          const c = casas[i] % col, l = Math.floor(casas[i] / col);
          return [e, +(((c + .2 + r() * .6) / col) * 100).toFixed(1), +(((l + .2 + r() * .6) / lin) * 100).toFixed(1), r.int(-25, 25)];
        });
        return { dur: ver + 15000, certo: String(qtd), d: { alvo, itens, ver } };
      },
      conferir: () => true,
      // quem chegar mais perto ganha: em cheio 3, errou por 1 leva 2, por 2 leva 1
      pontuar(resp, certo) {
        const alvo = +certo;
        return Object.entries(resp).map(([id, r]) => [id, r.ms, 0, +r.v, Math.abs(+r.v - alvo)])
          .sort((x, y) => x[4] - y[4] || x[1] - y[1])
          .map(x => { x[2] = Math.max(0, 3 - x[4]); return x.slice(0, 4); });
      },
    },
    memoria: {
      nome: 'Sequência de cores', icone: '🧠', cor: '#be185d', rodadas: 3, tipo: 'pergunta', olha: 'tv',
      desc: 'As cores piscam na TV numa ordem. Repete a sequência no celular. Cada rodada fica mais comprida.',
      como: ['As cores piscam na TV, uma de cada vez', 'Decora a ordem e repete no celular', 'Acertou tudo e foi rápido, leva mais pontos'],
      // [tamanho da sequência na 1ª rodada, quantas cores, ms de cada piscada]
      niveis: [[3, 4, 800], [4, 4, 750], [5, 4, 700], [5, 5, 650], [6, 5, 620], [7, 5, 580], [7, 6, 550], [8, 6, 520], [9, 6, 480], [10, 6, 450]],
      nivelTxt(n) { const [t, k] = this.niveis[n - 1]; return `${t} a ${t + 2} piscadas · ${k} cores · 3 rodadas`; },
      sortear(r, n, usadas, rodada) {
        const [t, k, vel] = this.niveis[n - 1];
        const ids = CORES.slice(0, k).map(c => c.id), tam = t + (rodada - 1);
        const seq = []; while (seq.length < tam) { const c = r.pick(ids); if (c !== seq[seq.length - 1] || r() < 0.25) seq.push(c); }
        const mostra = 900 + tam * vel;
        return { dur: mostra + 6000 + tam * 900, certo: seq.join(','), d: { seq, k, vel, mostra } };
      },
    },
  };
  CA.JOGOS_GRUPO = JOGOS;
  const ORDEM_JOGOS = ['quiz', 'reflexo', 'conta', 'memoria', 'cor', 'rapido', 'acha'];
  const rotuloPts = J => J.tipo === 'sprint' ? 'acertos' : 'pts';

  // pontos de quem acerta, na ordem de rapidez
  const pontosDa = pos => [3, 2][pos] || 1;

  // navegador de TV (controle remoto): a página inicial já oferece abrir a sala
  CA.ehTV = () => /SmartTV|SMART-TV|Tizen|Web0S|webOS|NetCast|HbbTV|BRAVIA|VIDAA|Roku|CrKey|GoogleTV|Android TV|AFT[A-Z]|; TV\b/i.test(navigator.userAgent || '');
  // endereço curto pra digitar na TV (cardenoamarelo.netlify.app/tv)
  const enderecoTV = () => location.host.replace(/^www\./, '') + '/tv';

  // cores e letrinha de cada jogador (mesma cor na TV e no celular)
  const TONS = ['#d62828', '#1d4ed8', '#15803d', '#d97706', '#7c3aed', '#be185d', '#0369a1', '#ea580c', '#4d7c0f', '#9333ea', '#0f766e', '#b91c1c'];

  // como funciona (TV e celular)
  const PASSOS_TV = [
    ['📷', 'Aponta a câmera do celular pro QR code', 'ou abre o link aqui embaixo'],
    ['✍️', 'Escreve teu nome', 'pronto: teu celular virou controle'],
    ['🗳️', 'Todo mundo vota no jogo', 'o 👑 chefe (primeiro que entrou) começa'],
  ];

  // ---------- aba "Jogos em grupo" (desenhada dentro da página inicial, em app.js) ----------
  CA.grupoAbaHtml = function () {
    const premium = CA.ehPremium();
    const ult = CA.ler('grupo:ultima', null);
    const voltar = ult && Date.now() - ult.t < 3 * 3600e3 ? ult.c : '';
    const cards = ORDEM_JOGOS.map(id => [id, JOGOS[id]]).map(([id, j]) => `
      <div class="card-jogo card-grupo" style="--cor:${j.cor}">
        <span class="card-jogo-icone" aria-hidden="true">${j.icone}</span>
        <span class="card-jogo-txt"><strong>${j.nome}</strong><small>${j.desc}</small>
          <span class="card-jogo-rodape"><small class="card-jogo-est">10 níveis · ${premium ? 'todos liberados ★' : 'níveis 1 a 3 grátis'}</small></span></span>
      </div>`).join('');
    return `
      <section class="grupo-aba mov-troca">
        ${voltar ? `<a class="grupo-voltar btn" href="#/sala?c=${voltar}">↩ Voltar pra sala <b>${voltar}</b></a>` : ''}
        <div class="grupo-hero">
          <div class="grupo-desenho" aria-hidden="true">
            <span class="g-tv"><b>ABCD</b></span>
            <span class="g-cel">👆</span><span class="g-cel g-cel2">👆</span>
          </div>
          <h2>Joga com a galera na TV</h2>
          <ol class="grupo-passos">
            <li><b>Abre a sala na TV</b> (ou no computador). Aparece um QR code.</li>
            <li><b>Cada um aponta a câmera do celular</b> pro QR code. O celular vira o controle.</li>
            <li><b>Acabou um jogo, ninguém sai:</b> todo mundo vota no próximo.</li>
          </ol>
          <a class="btn btn-grande" href="#/tv">📺 Abrir a sala na TV</a>
          <p class="grupo-tv-end">Na TV, abre o navegador e digita só:<b>${esc(enderecoTV())}</b></p>
          <small class="grupo-dica">Funciona também no computador ligado na TV. Na primeira vez, salva nos favoritos da TV ⭐ e depois é só abrir.</small>
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
          : '<a class="chamada-premium" href="#/premium"><strong>ca<span class="r-marca">R</span>deno Premium</strong><span>Quem abre a sala libera os níveis 4 a 10 de todos os jogos em grupo (e de todos os outros jogos). Quem joga pelo celular nunca paga. ' + ((CA.OFERTA || {}).chamada || '') + '</span></a>'}
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
  // TV: abre a sala, mostra o QR/link, sorteia as rodadas e soma os pontos
  // ======================================================================
  CA.jogos.tv = {
    nome: 'Jogos em grupo (TV)',
    iniciar(palco) {
      document.body.classList.add('modo-tv');
      let vivo = true, fechando = false;
      const timers = new Set();
      const espera = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (vivo) fn(); }, ms); timers.add(t); return t; };
      const parar = t => { clearTimeout(t); timers.delete(t); };
      const soltarTela = telaAcesa();

      // mesma sala de antes (a TV recarregou ou saiu um instante): mesmo código e mesmo placar
      const guardada = CA.ler('grupo:tv', null);
      const reaproveita = guardada && guardada.c && Date.now() - guardada.t < VALIDADE_SALA;
      let codigo = reaproveita ? guardada.c : '';
      if (!codigo) for (let i = 0; i < 4; i++) codigo += LETRAS[Math.floor(Math.random() * LETRAS.length)];
      const linkSala = location.origin + location.pathname + '#/sala?c=' + codigo;
      const linkCurto = location.host.replace(/^www\./, '') + '/s/' + codigo;

      const S = {
        fase: 'sala', jogo: CA.ler('grupo:jogo', 'quiz'), nivel: 1, rodada: 0, rid: '', dados: null, certo: null,
        dur: 0, t0: 0, jog: {}, ordem: [], resp: {}, prog: {}, res: null, usadas: new Set(), semente: 0, votos: {},
      };
      if (reaproveita) {
        S.ordem = (guardada.ordem || []).filter(id => guardada.jog && guardada.jog[id]).slice(0, MAX_JOGADORES);
        S.ordem.forEach(id => { const j = guardada.jog[id]; S.jog[id] = { id, nome: j.nome, pts: j.pts || 0, tom: j.tom, visto: 0 }; });
      }
      if (!JOGOS[S.jogo]) S.jogo = 'quiz';
      const premium = CA.ehPremium();
      const liberado = n => n <= GRATIS || premium;
      function salvar() {
        if (fechando) return;
        const jog = {}; S.ordem.forEach(id => { const j = S.jog[id]; if (j) jog[id] = { nome: j.nome, pts: j.pts, tom: j.tom }; });
        CA.gravar('grupo:tv', { c: codigo, t: Date.now(), ordem: S.ordem, jog });
      }
      salvar();

      let conexao = 'conectando';
      const canal = Canal(codigo, aoMsg, st => {
        if (!vivo) return;
        conexao = st;
        const el = palco.querySelector('.tv-conexao');
        if (el) el.dataset.st = st, el.textContent = st === 'on' ? 'Sala aberta' : st === 'erro' ? 'Sem conexão' : 'Reconectando...';
        if (st === 'on') publicar();
      });

      const ativos = () => S.ordem.map(id => S.jog[id]).filter(Boolean);
      const online = j => Date.now() - j.visto < 20000;
      const lista = () => ativos().map(j => [j.id, j.nome, j.pts, j.tom, online(j) ? 1 : 0]);
      const chefe = () => (ativos().find(online) || {}).id || '';
      const contaVotos = () => { const c = {}; Object.entries(S.votos).forEach(([id, j]) => { if (S.jog[id] && online(S.jog[id])) c[j] = (c[j] || 0) + 1; }); return c; };

      // manda o estado pros celulares (eles desenham a tela a partir disso)
      function publicar() {
        canal.mandar('estado', {
          f: S.fase, j: S.jogo, n: S.nivel, r: S.rodada, t: JOGOS[S.jogo].rodadas, rid: S.rid,
          d: S.fase === 'rodada' ? S.dados : null, dur: S.dur, lista: lista(), res: S.fase === 'revela' || S.fase === 'fim' ? S.res : null,
          vt: S.votos, ch: chefe(), pr: premium ? 1 : 0,
        });
      }
      let chefeAntes = '';
      const pulso = setInterval(() => {
        if (!vivo) return;
        publicar();
        if (S.fase === 'sala') desenharJogadores();
        if (chefe() !== chefeAntes) { chefeAntes = chefe(); if (S.fase === 'sala') atualizarSala(); }
      }, 4000);

      function aoMsg(ev, p) {
        if (!vivo || !p || !p.id) return;
        const id = String(p.id).slice(0, 24);
        if (ev === 'oi') {
          let j = S.jog[id], novo = false;
          const nome0 = String(p.nome || 'Jogador').replace(/\s+/g, ' ').trim().slice(0, 16) || 'Jogador';
          if (!j) {
            if (S.ordem.length >= MAX_JOGADORES) {
              // sala cheia: tira quem já saiu (offline faz tempo) antes de recusar
              const fora = S.ordem.find(x => S.jog[x] && Date.now() - S.jog[x].visto > 120000);
              if (!fora) { canal.mandar('cheia', { id }); return; }
              delete S.jog[fora]; S.ordem = S.ordem.filter(x => x !== fora);
            }
            let nome = nome0;
            const usados = new Set(ativos().map(x => x.nome.toLowerCase()));
            if (usados.has(nome.toLowerCase())) { let k = 2; while (usados.has((nome + ' ' + k).toLowerCase())) k++; nome = nome + ' ' + k; }
            const tomLivre = TONS.find(t => !ativos().some(x => x.tom === t)) || TONS[S.ordem.length % TONS.length];
            j = S.jog[id] = { id, nome, pts: 0, tom: tomLivre, visto: Date.now() };
            S.ordem.push(id);
            CA.som('certo');
            salvar(); novo = true;
          } else if (p.nome && nome0 !== j.nome && !ativos().some(x => x !== j && x.nome.toLowerCase() === nome0.toLowerCase())) {
            j.nome = nome0; salvar(); // trocou o nome no celular
          }
          const voltou = novo || !online(j);
          j.visto = Date.now();
          if (S.fase === 'sala') { desenharJogadores(voltou); atualizarSala(); } else desenharPlacar();
          publicar();
        } else if (ev === 'sai') {
          if (S.jog[id]) {
            S.jog[id].visto = 0; delete S.votos[id];
            if (S.fase === 'sala') { delete S.jog[id]; S.ordem = S.ordem.filter(x => x !== id); salvar(); desenharJogadores(); atualizarSala(); }
            publicar();
          }
          checarFimRodada();
        } else if (ev === 'voto') {
          if (!S.jog[id] || !JOGOS[p.j]) return;
          S.jog[id].visto = Date.now();
          S.votos[id] = p.j;
          if (S.fase === 'sala') atualizarSala();
          publicar();
        } else if (ev === 'cmd') {
          if (!S.jog[id]) return;
          S.jog[id].visto = Date.now();
          if (id !== chefe()) return; // só o chefe comanda pelo celular
          if (p.a === 'jogo' && JOGOS[p.j] && S.fase === 'sala') escolherJogo(p.j);
          else if (p.a === 'nivel' && S.fase === 'sala') escolherNivel(+p.n);
          else if (p.a === 'comecar' && S.fase === 'sala') comecarPartida();
          else if (p.a === 'denovo' && S.fase === 'fim') comecarPartida();
          else if (p.a === 'sala' && S.fase === 'fim') telaSala();
        } else if (ev === 'resp') {
          if (S.fase !== 'rodada' || p.rid !== S.rid || !S.jog[id] || S.resp[id]) return;
          S.jog[id].visto = Date.now();
          const J = JOGOS[S.jogo];
          const ms = Math.max(0, Math.min(+p.ms || 0, S.dur + 2000));
          const v = String(p.v == null ? '' : p.v).slice(0, 200);
          const ok = J.tipo !== 'pergunta' ? v === 'fim' : J.conferir ? J.conferir(v, S.certo) : v === S.certo;
          S.resp[id] = { v, ms, ok, k: Math.max(0, Math.min(999, +p.k || 0)), e: Math.max(0, Math.min(999, +p.e || 0)) };
          if (J.tipo === 'sprint') { desenharCorrida(); checarFimRodada(); return; }
          marcarRespondeu(id, ok);
          checarFimRodada();
        } else if (ev === 'prog') {
          if (S.fase !== 'rodada' || p.rid !== S.rid || !S.jog[id]) return;
          S.jog[id].visto = Date.now();
          if (JOGOS[S.jogo].tipo === 'sprint') S.prog[id] = { k: Math.max(0, Math.min(999, +p.k || 0)), e: Math.max(0, Math.min(999, +p.e || 0)) };
          else S.prog[id] = Math.max(S.prog[id] || 0, +p.k || 0);
          desenharCorrida();
        }
      }

      // ---------- telas da TV ----------
      function moldura(miolo, lado, tela) {
        palco.innerHTML = '';
        palco.appendChild(CA.el(`
          <section class="tv" ${tela ? `data-tela="${tela}"` : ''}>
            <header class="tv-topo">
              <a class="tv-sair" href="#/grupo" aria-label="Voltar (a sala continua aberta)">‹</a>
              <div class="logo-app"><span class="logo-caderno" aria-hidden="true"></span><span>ca<span class="r-marca">R</span>deno Amarelo · Jogos em grupo</span></div>
              <div class="tv-cod-mini">Entra: <b>${esc(linkCurto)}</b></div>
              <span class="tv-conexao" data-st="${conexao}">${conexao === 'on' ? 'Sala aberta' : 'Conectando...'}</span>
              <button class="som tv-tela-cheia" type="button" aria-label="Tela cheia">⛶</button>
            </header>
            <div class="tv-corpo ${lado ? 'com-lado' : ''}">
              <div class="tv-miolo">${miolo}</div>
              ${lado ? `<aside class="tv-lado"><h3>Placar</h3><ol class="tv-placar"></ol><p class="tv-entra">Entra também:<br><b>${esc(linkCurto)}</b></p></aside>` : ''}
            </div>
          </section>`));
        palco.querySelector('.tv-tela-cheia').addEventListener('click', () => {
          try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) {}
        });
        if (lado) desenharPlacar();
      }

      function telaSala() {
        S.fase = 'sala'; S.res = null; S.rid = ''; S.votos = {};
        if (!liberado(S.nivel)) S.nivel = 1;
        const opJogos = ORDEM_JOGOS.map(id => [id, JOGOS[id]]).map(([id, j]) =>
          `<button type="button" class="tv-op-jogo mov-toque" data-jogo="${id}" style="--cor:${j.cor}"><i aria-hidden="true">${j.icone}</i><b>${j.nome}</b><span class="tv-votos"></span></button>`).join('');
        moldura(`
          <div class="tv-sala">
            <div class="tv-convite">
              <p class="tv-convite-t">Entra pelo celular 📱</p>
              <div class="tv-convite-linha">
                <div class="tv-qr" aria-label="QR code pra entrar na sala"></div>
                <div class="tv-link">
                  <small>Aponta a câmera pro QR code<br>ou digita no navegador do celular:</small>
                  <p class="tv-link-url">${esc(linkCurto.replace('/s/' + codigo, '/s/'))}<b>${codigo}</b></p>
                  <small>Código da sala</small>
                  <p class="tv-codigo">${codigo.split('').map(l => `<span>${l}</span>`).join('')}</p>
                </div>
              </div>
              <ol class="tv-passos">${PASSOS_TV.map(([i, t, s], k) => `<li><i aria-hidden="true">${i}</i><b>${k + 1}. ${t}</b><small>${s}</small></li>`).join('')}</ol>
            </div>
            <div class="tv-config">
              <h2>Quem tá na sala <small class="tv-qtd"></small></h2>
              <ul class="tv-jogadores"></ul>
              <h2>Escolhe o jogo <small class="tv-dica-voto">o celular de cada um vota 👍</small></h2>
              <div class="tv-jogos">${opJogos}</div>
              <p class="tv-desc"></p>
              <div class="tv-niveis-t"><b class="tv-niv-n"></b> · <span class="tv-niv-txt"></span></div>
              <div class="tv-niveis"></div>
              ${premium ? '' : '<p class="tv-premium-dica">Níveis 1 a 3 grátis. Do 4 ao 10 com o <a href="#/premium">caRdeno Premium</a> de quem abre a sala.</p>'}
              <button class="btn btn-grande tv-comecar" type="button" disabled>Esperando a galera entrar...</button>
              <p class="tv-chefe-dica"></p>
              <p class="tv-favorito">⭐ Salva esta página nos <b>favoritos da TV</b>: da próxima vez é só abrir, sem digitar nada. Endereço da TV: <b>${esc(enderecoTV())}</b></p>
              <button class="tv-fechar" type="button">Fechar a sala</button>
            </div>
          </div>`, false, 'tv-sala');
        desenharQr();
        desenharJogadores();
        atualizarSala();
        const tela = palco.querySelector('.tv-sala');
        tela.addEventListener('click', e => {
          const bj = e.target.closest('[data-jogo]'), bn = e.target.closest('[data-n]');
          if (bj) escolherJogo(bj.dataset.jogo);
          if (bn) escolherNivel(+bn.dataset.n);
        });
        tela.querySelector('.tv-comecar').addEventListener('click', comecarPartida);
        // fechar de verdade pede dois toques (não fecha sem querer)
        const bf = tela.querySelector('.tv-fechar');
        bf.addEventListener('click', () => {
          if (!bf.classList.contains('confirma')) {
            bf.classList.add('confirma'); bf.textContent = 'Toca de novo pra fechar (todo mundo sai)';
            espera(() => { bf.classList.remove('confirma'); bf.textContent = 'Fechar a sala'; }, 4000);
            return;
          }
          fecharSala();
        });
        salvar();
        publicar();
      }

      function escolherJogo(id) {
        S.jogo = id; CA.gravar('grupo:jogo', id); S.nivel = 1;
        atualizarSala(); publicar();
      }
      function escolherNivel(n) {
        if (!(n >= 1 && n <= 10)) return;
        if (!liberado(n)) { CA.aviso('Nível ' + n + ' é caRdeno Premium 🔒'); return; }
        S.nivel = n; atualizarSala(); publicar();
      }

      // atualiza a sala sem redesenhar a tela toda (o QR code e os jogadores ficam onde estão)
      function atualizarSala() {
        const tela = palco.querySelector('.tv-sala');
        if (!tela) return;
        const J = JOGOS[S.jogo], votos = contaVotos();
        tela.querySelectorAll('.tv-op-jogo').forEach(b => {
          b.classList.toggle('sel', b.dataset.jogo === S.jogo);
          const v = votos[b.dataset.jogo] || 0, s = b.querySelector('.tv-votos');
          const txt = v ? '👍 ' + v : '';
          if (s.textContent !== txt) { s.textContent = txt; if (v) { s.classList.remove('pula'); void s.offsetWidth; s.classList.add('pula'); } }
        });
        tela.querySelector('.tv-desc').textContent = J.desc;
        tela.querySelector('.tv-niv-n').textContent = 'Nível ' + S.nivel;
        tela.querySelector('.tv-niv-txt').textContent = J.nivelTxt(S.nivel);
        tela.querySelector('.tv-niveis').innerHTML = Array.from({ length: 10 }, (_, i) => {
          const n = i + 1, ok = liberado(n);
          return `<button type="button" class="tv-op-nivel mov-toque ${n === S.nivel ? 'sel' : ''} ${ok ? '' : 'tranca'}" data-n="${n}" aria-label="Nível ${n}${ok ? '' : ' (Premium)'}">${ok ? n : '🔒'}</button>`;
        }).join('');
        const js = ativos(), b = tela.querySelector('.tv-comecar');
        b.disabled = !js.length;
        b.textContent = js.length ? `Começar ${J.nome} ▶` : 'Esperando a galera entrar...';
        const ch = S.jog[chefe()];
        tela.querySelector('.tv-chefe-dica').innerHTML = ch ? `👑 <b>${esc(ch.nome)}</b> também escolhe e começa pelo celular` : '';
      }

      function desenharQr() {
        const caixa = palco.querySelector('.tv-qr');
        if (!caixa) return;
        const fazer = () => {
          try {
            const qr = window.qrcode(0, 'M'); qr.addData(linkSala); qr.make();
            caixa.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 1, scalable: true });
          } catch (e) { caixa.remove(); }
        };
        if (window.qrcode) return fazer();
        const s = document.createElement('script');
        s.src = 'js/qrcode.js'; s.onload = () => vivo && fazer(); s.onerror = () => caixa.remove();
        document.head.appendChild(s);
      }

      function chip(j, extra) {
        const coroa = j.id === chefe() ? '<em class="coroa" aria-label="chefe da sala">👑</em>' : '';
        return `<li class="tv-chip ${online(j) ? '' : 'fora'}" style="--tom:${j.tom}"><i>${esc(j.nome[0].toUpperCase())}</i><span>${esc(j.nome)}</span>${coroa}${extra || ''}</li>`;
      }
      function desenharJogadores(novo) {
        const ul = palco.querySelector('.tv-jogadores');
        if (!ul) return;
        const js = ativos();
        const html = js.length ? js.map(j => chip(j).replace('<li class="tv-chip', `<li data-id="${esc(j.id)}" class="tv-chip`)).join('') : '<li class="tv-vazio">Ninguém ainda. Aponta a câmera do celular pro QR code 👈</li>';
        if (ul.dataset.html !== html) { ul.innerHTML = html; ul.dataset.html = html; }
        if (novo && ul.lastElementChild) ul.lastElementChild.classList.add('chegou');
        palco.querySelector('.tv-qtd').textContent = js.length ? `(${js.length})` : '';
        const b = palco.querySelector('.tv-comecar');
        if (b) { b.disabled = !js.length; b.textContent = js.length ? `Começar ${JOGOS[S.jogo].nome} ▶` : 'Esperando a galera entrar...'; }
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
        if (!ativos().length) return;
        ativos().forEach(j => { j.pts = 0; });
        S.rodada = 0; S.usadas = new Set(); S.semente = CA.novaSemente();
        proximaRodada();
      }

      function proximaRodada() {
        const J = JOGOS[S.jogo];
        S.rodada++;
        S.fase = 'pre'; S.res = null;
        publicar();
        const primeira = S.rodada === 1;
        const titulo = `${J.icone} ${J.nome}${J.rodadas > 1 ? ' · rodada ' + S.rodada + ' de ' + J.rodadas : ' · nível ' + S.nivel}`;
        moldura(`<div class="tv-pre">
          <p class="tv-pre-r">${titulo}</p>
          ${primeira ? `<h2 class="tv-como-t">Como joga</h2><ol class="tv-como">${J.como.map(c => `<li>${c}</li>`).join('')}</ol>` : ''}
          <p class="tv-pre-dica">${J.olha === 'celular' ? 'Olha pro teu celular! 👇' : 'Olha pra TV! 👀'}</p><div class="tv-pre-conta"></div></div>`, J.tipo !== 'sprint', 'tv-pre');
        espera(() => CA.contagem(palco.querySelector('.tv-pre-conta')).then(() => vivo && S.fase === 'pre' && iniciarRodada()), primeira ? 5000 : 0);
      }

      function iniciarRodada() {
        const J = JOGOS[S.jogo];
        const r = CA.rng((S.semente + S.rodada * 7919) >>> 0);
        const s = J.sortear(r, S.nivel, S.usadas, S.rodada);
        S.dados = s.d; S.certo = s.certo; S.dur = s.dur;
        S.rid = Math.random().toString(36).slice(2, 9);
        S.resp = {}; S.prog = {};
        S.fase = 'rodada'; S.t0 = performance.now();
        publicar();
        desenharRodada();
        S.fimTimer = espera(fecharRodada, S.dur + 1200); // folguinha pra resposta que ainda tá chegando
      }

      const chipsResposta = () => `<ul class="tv-respostas">${ativos().map(j => chip(j).replace('<li class="tv-chip', `<li data-id="${esc(j.id)}" class="tv-chip`)).join('')}</ul>
            <p class="tv-qtd-resp">0 de ${ativos().filter(online).length} responderam</p>`;

      function desenharRodada() {
        const J = JOGOS[S.jogo], d = S.dados, rid = S.rid;
        const vale = () => vivo && S.fase === 'rodada' && S.rid === rid;
        let alvo = '';
        if (J.tipo === 'sprint') {
          alvo = `<p class="tv-pergunta">${S.jogo === 'cor' ? 'Toca na cor da <b>tinta</b>' : 'Certo ou errado?'} no teu celular! Quem acertar mais ganha</p>
            <p class="tv-relogio-grande">${Math.round(S.dur / 1000)}</p><ul class="tv-corrida tv-placar-vivo"></ul>`;
        } else if (J.tipo === 'corrida') {
          alvo = `<p class="tv-pergunta">Toca do <b>1</b> ao <b>${d.q}</b> no teu celular!</p><ul class="tv-corrida"></ul>`;
        } else if (S.jogo === 'quiz') {
          alvo = `<p class="tv-quiz-p">${esc(d.p)}</p>
            <div class="tv-quiz-ops">${d.ops.map((o, i) => `<div class="tv-quiz-op" style="--c:${OPCOES[i][1]}"><i>${OPCOES[i][0]}</i><span>${esc(o)}</span></div>`).join('')}</div>`;
        } else if (S.jogo === 'reflexo') {
          alvo = `<div class="tv-reflexo" data-s="espera"><b>Espera...</b><small>olha pro teu celular e toca quando ficar verde</small></div>`;
        } else if (S.jogo === 'conta') {
          alvo = `<p class="tv-pergunta tv-conta-p">Conta quantos <span class="tv-conta-alvo">${d.alvo}</span> tem!</p>
            <div class="tv-conta-campo">${d.itens.map(([e, x, y, g]) => `<span style="left:${x}%;top:${y}%;--g:${g}deg">${e}</span>`).join('')}</div>`;
        } else if (S.jogo === 'memoria') {
          alvo = `<p class="tv-pergunta tv-mem-p">Decora a ordem das cores 👀</p>
            <div class="tv-mem n${d.k}">${CORES.slice(0, d.k).map(c => `<i data-c="${c.id}" style="--c:${c.hex}"></i>`).join('')}</div>`;
        }
        moldura(`
          <div class="tv-rodada">
            <p class="tv-pre-r">${J.icone} ${J.nome}${J.rodadas > 1 ? ' · rodada ' + S.rodada + ' de ' + J.rodadas : ' · nível ' + S.nivel}</p>
            <div class="tv-tempo"><i style="animation-duration:${S.dur}ms"></i></div>
            ${alvo}
            ${J.tipo === 'pergunta' ? chipsResposta() : ''}
          </div>`, J.tipo !== 'sprint', 'tv-rodada');
        if (J.tipo !== 'pergunta') desenharCorrida();
        if (J.tipo === 'sprint') {
          const el = palco.querySelector('.tv-relogio-grande'), fim = S.t0 + S.dur;
          const rel = setInterval(() => {
            if (!vale()) { clearInterval(rel); return; }
            const f = Math.max(0, Math.ceil((fim - performance.now()) / 1000));
            if (el.textContent !== String(f)) { el.textContent = f; if (f <= 5 && f > 0) CA.som('tique'); }
          }, 200);
        }
        if (S.jogo === 'reflexo') {
          // a TV mostra (mais ou menos junto) o que aparece nos celulares
          const caixa = palco.querySelector('.tv-reflexo');
          const pinta = (s, txt, sub) => { if (!vale()) return; caixa.dataset.s = s; caixa.innerHTML = `<b>${txt}</b><small>${sub}</small>`; };
          d.ev.forEach(([t, tipo, dur]) => {
            espera(() => tipo === 'vai' ? (pinta('vai', 'TOCA!', 'agora!'), CA.som('valendo')) : pinta(tipo, tipo === 'falso2' ? 'AGORA?' : 'Ainda não!', 'é pegadinha, não toca'), t);
            espera(() => pinta('espera', tipo === 'vai' ? 'Acabou!' : 'Espera...', tipo === 'vai' ? 'vamos ver quem foi mais rápido' : 'olha pro teu celular e toca quando ficar verde'), t + dur);
          });
        }
        if (S.jogo === 'conta') {
          espera(() => {
            if (!vale()) return;
            const campo = palco.querySelector('.tv-conta-campo');
            campo.classList.add('cobre');
            palco.querySelector('.tv-conta-p').innerHTML = `Quantos <span class="tv-conta-alvo">${d.alvo}</span> tinha? Digita no celular!`;
            CA.som('tique');
          }, d.ver);
        }
        if (S.jogo === 'memoria') {
          const pads = palco.querySelectorAll('.tv-mem i');
          d.seq.forEach((c, i) => {
            const t = 900 + i * d.vel;
            espera(() => { if (!vale()) return; const p = Array.from(pads).find(x => x.dataset.c === c); p.classList.add('acende'); CA.som('tique'); espera(() => p.classList.remove('acende'), d.vel * 0.7); }, t);
          });
          espera(() => { if (vale()) palco.querySelector('.tv-mem-p').innerHTML = 'Agora repete no teu celular! 👇'; }, d.mostra);
        }
      }

      function desenharCorrida() {
        const ul = palco.querySelector('.tv-corrida');
        if (!ul || !S.dados) return;
        if (JOGOS[S.jogo].tipo === 'sprint') {
          const ac = j => S.resp[j.id] ? S.resp[j.id].k : ((S.prog[j.id] || {}).k || 0);
          const er = j => S.resp[j.id] ? S.resp[j.id].e : ((S.prog[j.id] || {}).e || 0);
          const js = ativos().slice().sort((a, b) => ac(b) - ac(a) || er(a) - er(b));
          const max = Math.max(10, ...js.map(ac));
          ul.innerHTML = js.map(j => `<li style="--tom:${j.tom}" class="${S.resp[j.id] ? 'chegou' : ''}"><span class="tv-corr-nome">${esc(j.nome)}</span>
            <span class="tv-corr-trilho"><i style="width:${Math.round(ac(j) / max * 100)}%"></i></span>
            <b>${ac(j)} ${ac(j) === 1 ? 'acerto' : 'acertos'}</b></li>`).join('');
          return;
        }
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
        if (todos) { parar(S.fimTimer); S.fimTimer = espera(fecharRodada, 600); }
      }

      function fecharRodada() {
        if (S.fase !== 'rodada') return;
        const J = JOGOS[S.jogo];
        if (J.tipo === 'sprint') {
          const ac = id => S.resp[id] ? S.resp[id].k : ((S.prog[id] || {}).k || 0);
          const er = id => S.resp[id] ? S.resp[id].e : ((S.prog[id] || {}).e || 0);
          const ord = S.ordem.filter(id => S.jog[id]).sort((a, b) => ac(b) - ac(a) || er(a) - er(b));
          ord.forEach(id => { S.jog[id].pts += ac(id); });
          S.res = { d: S.dados, ganhos: ord.map(id => [id, er(id), ac(id)]), erros: [] };
        } else {
          let lista;
          if (J.pontuar) lista = J.pontuar(S.resp, S.certo);
          else lista = Object.entries(S.resp).filter(([, r]) => r.ok).sort((a, b) => a[1].ms - b[1].ms).map(([id, r], i) => [id, r.ms, pontosDa(i), r.v]);
          lista.forEach(([id, , g]) => { if (S.jog[id]) S.jog[id].pts += g; });
          const ganhos = lista.filter(x => x[2] > 0);
          const erros = Object.keys(S.resp).filter(id => !ganhos.some(x => x[0] === id));
          const chutes = J.pontuar ? Object.fromEntries(Object.entries(S.resp).map(([id, r]) => [id, r.v])) : null;
          S.res = { certo: S.certo, d: S.dados, ganhos, erros, chutes, queimou: Object.keys(S.resp).filter(id => S.resp[id].v === 'queimou') };
        }
        salvar();
        S.fase = S.rodada >= J.rodadas ? 'fim' : 'revela';
        if (S.fase === 'fim') { telaFim(); publicar(); return; }
        publicar();
        telaRevela();
        espera(proximaRodada, S.jogo === 'quiz' ? 6500 : 4500);
      }

      function textoCerto() {
        const d = S.res.d;
        if (S.jogo === 'quiz') return `Resposta: <b class="ok">${esc(d.ops[+S.res.certo])}</b>${d.expl ? `<small class="tv-expl">${esc(d.expl)}</small>` : ''}`;
        if (S.jogo === 'conta') return `Tinha <b class="ok">${S.res.certo}</b> ${d.alvo}`;
        if (S.jogo === 'memoria') return `A ordem era <span class="tv-seq">${d.seq.map(c => `<i style="--c:${corPorId(c).hex}"></i>`).join('')}</span>`;
        if (S.jogo === 'reflexo') return 'Quem tem o dedo mais rápido?';
        if (S.jogo === 'acha') return `Corrida do 1 ao ${d.q}`;
        return JOGOS[S.jogo].nome;
      }

      function telaRevela() {
        const g = S.res.ganhos;
        const prim = g[0] && S.jog[g[0][0]];
        CA.som(prim ? 'certo' : 'errado');
        const feito = { acha: 'foi o mais rápido', reflexo: 'teve o dedo mais rápido', conta: g[0] && g[0][2] === 3 ? 'acertou em cheio' : 'chegou mais perto' }[S.jogo] || 'acertou primeiro';
        const det = ([, ms, , v]) => S.jogo === 'conta' ? 'chutou ' + esc(v) : CA.fmtSeg(ms / 1000);
        const queimou = (S.res.queimou || []).map(id => S.jog[id]).filter(Boolean);
        moldura(`
          <div class="tv-revela">
            <p class="tv-certo">${textoCerto()}</p>
            ${prim ? `<p class="tv-raio" style="--tom:${prim.tom}">⚡ <b>${esc(prim.nome)}</b> ${feito}! <small>${det(g[0])}</small></p>` : '<p class="tv-raio ninguem">Ninguém acertou dessa vez 😅</p>'}
            <ul class="tv-ganhos">${g.slice(0, 8).map((x, i) => { const j = S.jog[x[0]]; return j ? `<li style="--tom:${j.tom}"><span>${i + 1}º</span><i>${esc(j.nome[0].toUpperCase())}</i><b>${esc(j.nome)}</b><small>${det(x)}</small><em>+${x[2]}</em></li>` : ''; }).join('')}</ul>
            ${queimou.length ? `<p class="tv-queimou">🔥 Queimou (tocou antes da hora): ${queimou.map(j => esc(j.nome)).join(', ')}</p>` : ''}
            <p class="tv-prox">Próxima rodada já já...</p>
          </div>`, true, 'tv-revela');
      }

      function telaFim() {
        const J = JOGOS[S.jogo];
        const js = ativos().slice().sort((a, b) => b.pts - a.pts);
        CA.som('recorde');
        const pod = [js[1], js[0], js[2]];
        const ch = S.jog[chefe()];
        moldura(`
          <div class="tv-fim">
            <p class="tv-pre-r">${J.icone} ${J.nome} · nível ${S.nivel}</p>
            <h2 class="tv-campeao">${js[0] ? '🏆 ' + esc(js[0].nome) + ' ganhou!' : 'Fim de jogo'}</h2>
            <div class="tv-podio">${pod.map((j, i) => j ? `<div class="tv-degrau d${[2, 1, 3][i]}" style="--tom:${j.tom}"><i>${esc(j.nome[0].toUpperCase())}</i><b>${esc(j.nome)}</b><small>${j.pts} ${rotuloPts(J)}</small><span>${[2, 1, 3][i]}º</span></div>` : '<div class="tv-degrau vazio"></div>').join('')}</div>
            ${js.length > 3 ? `<ol class="tv-resto" start="4">${js.slice(3).map(j => `<li>${esc(j.nome)} · ${j.pts} ${rotuloPts(J)}</li>`).join('')}</ol>` : ''}
            <div class="tv-fim-botoes">
              <button class="btn btn-grande" type="button" data-a="sala">Escolher outro jogo</button>
              <button class="btn btn-grande btn-claro" type="button" data-a="denovo">Jogar de novo</button>
            </div>
            <p class="tv-volta">Ninguém sai da sala 😉 Voltando pra escolher o próximo jogo em <b>20</b> s${ch ? ` · 👑 ${esc(ch.nome)} também escolhe pelo celular` : ''}</p>
            <p class="tv-fim-marca">Posta a foto da galera e marca <b>@caRdeno_Amarelo</b> 📸</p>
          </div>`, false, 'tv-fim');
        palco.querySelector('[data-a=denovo]').addEventListener('click', comecarPartida);
        palco.querySelector('[data-a=sala]').addEventListener('click', telaSala);
        // volta sozinha pra sala (todo mundo continua conectado e vota no próximo)
        let falta = 20;
        const conta = () => {
          if (S.fase !== 'fim') return;
          const b = palco.querySelector('.tv-volta b');
          if (--falta <= 0) { telaSala(); return; }
          if (b) b.textContent = falta;
          espera(conta, 1000);
        };
        espera(conta, 1000);
      }

      function fecharSala() {
        fechando = true;
        canal.mandar('tchau', { id: 'tv' });
        try { localStorage.removeItem('ca-jogos:grupo:tv'); } catch (e) {}
        CA.gravar('grupo:tv', null);
        setTimeout(() => { location.hash = '#/grupo'; }, 250);
      }

      if (reaproveita && S.ordem.length) CA.aviso(`Sala ${codigo} de volta, com o placar 👍`);
      telaSala();
      if (window.matchMedia('(max-width: 700px)').matches) CA.aviso('Dica: abre a sala na TV ou no computador, e o celular vira controle 📺');

      return () => {
        vivo = false;
        // saiu da tela da TV sem fechar: os celulares esperam ela voltar (mesmo código)
        if (!fechando) { salvar(); try { canal.mandar('pausa', { id: 'tv' }); } catch (e) {} }
        setTimeout(() => canal.fechar(), 200);
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
      let vivo = true, canal = null, oiT = 0, achouT = 0, vigia = 0, soltarTela = null, ultimoEstado = 0, pausada = false;
      let meuId = CA.ler('grupo:id', null);
      if (!meuId) { meuId = Math.random().toString(36).slice(2, 12); CA.gravar('grupo:id', meuId); }
      const perfil = (CA.perfil && CA.perfil()) || {};
      let nome = CA.ler('grupo:nome', '') || perfil.apelido || '';
      let E = null;          // último estado da TV
      let chaveAntes = '';
      let ridFeito = '';     // rodada que já respondi
      let ridTela = '';      // rodada desenhada agora
      let meuChute = null;
      let t0 = 0;
      let comoAberto = !CA.ler('grupo:viu-como', false);
      let saiToque = 0;
      const lembrar = () => CA.gravar('grupo:ultima', { c: codigo, t: Date.now() });

      function casca(miolo, cls, tela) {
        palco.innerHTML = '';
        const me = E && E.lista && E.lista.find(x => x[0] === meuId);
        const souChefe = E && E.ch === meuId;
        palco.appendChild(CA.el(`
          <section class="ctrl ${cls || ''}" ${tela ? `data-tela="${tela}"` : ''}>
            <div class="ctrl-topo">
              <a class="voltar" href="#/grupo" aria-label="Sair da sala">‹</a>
              <span class="ctrl-sala">Sala <b>${codigo}</b></span>
              <span class="ctrl-st" hidden>reconectando...</span>
              ${me ? `<span class="ctrl-eu" style="--tom:${me[3]}">${souChefe ? '👑 ' : ''}<i>${esc(me[1][0].toUpperCase())}</i>${esc(me[1])} · <b>${me[2]}</b></span>` : ''}
            </div>
            ${miolo}
          </section>`));
        // sair da sala pede dois toques (não sai sem querer no meio da brincadeira)
        palco.querySelector('.voltar').addEventListener('click', e => {
          if (!E || Date.now() - saiToque < 3500) { CA.gravar('grupo:ultima', null); return; }
          e.preventDefault(); saiToque = Date.now();
          CA.aviso('Toca de novo no ‹ pra sair da sala');
        });
        mostrarStatus();
      }
      let statusCanal = 'conectando';
      function mostrarStatus() {
        const el = palco.querySelector('.ctrl-st');
        if (el) el.hidden = !(E && statusCanal !== 'on');
      }

      function pedirNome(trocando) {
        casca(`
          <form class="ctrl-nome">
            <h1>${trocando ? 'Trocar o nome' : `Entrando na sala <b>${codigo}</b>`}</h1>
            <label for="g-nome">Como tu quer aparecer na TV?</label>
            <input id="g-nome" maxlength="16" required autocomplete="nickname" placeholder="Teu nome ou apelido" value="${esc(nome)}">
            <button class="btn btn-grande" type="submit">${trocando ? 'Salvar' : 'Entrar na sala'}</button>
            <small>Não precisa de conta nem pagar nada pra jogar pelo celular.</small>
          </form>`, '', 'ctrl-nome');
        const f = palco.querySelector('.ctrl-nome');
        const inp = f.querySelector('input');
        if (!nome || trocando) setTimeout(() => { inp.focus(); inp.select(); }, 50);
        f.addEventListener('submit', e => {
          e.preventDefault();
          nome = inp.value.replace(/\s+/g, ' ').trim().slice(0, 16);
          if (!nome) return;
          CA.gravar('grupo:nome', nome);
          if (trocando) { mandarOi(); chaveAntes = ''; if (E) desenhar(); return; }
          entrar();
        });
      }

      function entrar() {
        lembrar();
        casca(`<div class="ctrl-msg"><div class="ctrl-girando" aria-hidden="true"></div><h2>Entrando na sala ${codigo}...</h2></div>`, '', 'ctrl-entrando');
        soltarTela = telaAcesa();
        canal = Canal(codigo, aoMsg, st => {
          if (!vivo) return;
          statusCanal = st; mostrarStatus();
          if (st === 'on') mandarOi();
          if (st === 'erro' && !E) casca(`<div class="ctrl-msg"><h2>Não consegui conectar 😕</h2><p>Confere a internet do celular. Tô tentando de novo sozinho...</p><div class="ctrl-girando" aria-hidden="true"></div></div>`, '', 'ctrl-erro');
        });
        oiT = setInterval(mandarOi, 7000);
        // a TV manda o estado a cada 4 s: se ficar 13 s sem nada, reconecta
        vigia = setInterval(() => {
          if (!vivo || !E || pausada || document.visibilityState !== 'visible') return;
          if (Date.now() - ultimoEstado > 13000 && canal) { ultimoEstado = Date.now(); canal.reabrir(); }
        }, 3000);
        achouT = setTimeout(() => {
          if (vivo && !E) casca(`<div class="ctrl-msg"><h2>Não achei a sala ${codigo} 🤔</h2>
            <p>Confere o código que tá na TV. Se a TV fechou a sala, ela mostra um código novo.</p>
            <a class="btn btn-grande" href="#/grupo">Digitar outro código</a><p class="ctrl-peq">Continuo procurando...</p></div>`, '', 'ctrl-erro');
        }, 9000);
      }
      const mandarOi = () => canal && canal.mandar('oi', { id: meuId, nome });

      function aoMsg(ev, d) {
        if (!vivo) return;
        if (ev === 'cheia' && d.id === meuId) {
          casca('<div class="ctrl-msg"><h2>A sala tá cheia 😅</h2><p>Cabem até 12 pessoas por sala.</p></div>');
          return;
        }
        if (ev === 'tchau') {
          E = null; CA.gravar('grupo:ultima', null);
          casca('<div class="ctrl-msg"><h2>A sala fechou 👋</h2><p>Quem tava na TV fechou a sala. Quando abrir outra, entra com o código novo.</p><a class="btn btn-grande" href="#/grupo">Entrar com outro código</a></div>');
          return;
        }
        if (ev === 'pausa') {
          pausada = true; chaveAntes = '';
          casca(`<div class="ctrl-msg"><p class="ctrl-grande">📺</p><h2>A TV saiu um instantinho</h2><p>Fica aqui que tu continua na sala. Quando a TV voltar, segue o jogo.</p><div class="ctrl-girando" aria-hidden="true"></div></div>`, 'ctrl-espera', 'ctrl-pausa');
          return;
        }
        if (ev !== 'estado') return;
        E = d; ultimoEstado = Date.now(); pausada = false; lembrar();
        clearTimeout(achouT);
        const estou = (d.lista || []).some(x => x[0] === meuId);
        if (!estou) mandarOi();
        // só redesenha quando alguma coisa mudou (o estado chega a cada 4 s)
        const chave = JSON.stringify([d.f, d.rid, d.j, d.n, d.r, d.lista, d.ch, d.f === 'sala' ? d.vt : 0]);
        if (chave === chaveAntes) return;
        chaveAntes = chave;
        desenhar();
      }

      function telaComo() {
        return `<div class="grupo ctrl-como">
          <button class="grupo-titulo" type="button" aria-expanded="${comoAberto}" aria-controls="g-como">❓ Como funciona</button>
          <div class="grupo-corpo" id="g-como"><div class="grupo-miolo"><ol>
            <li><i>📺</i><span>A pergunta ou o desafio aparece <b>na TV</b> ou <b>aqui no celular</b>. A TV avisa pra onde olhar.</span></li>
            <li><i>👆</i><span>Tu responde aqui. Quem for <b>mais rápido e certeiro</b> leva mais pontos. O placar fica na TV.</span></li>
            <li><i>🗳️</i><span>Acabou um jogo? <b>Ninguém sai da sala.</b> Vota no próximo e o 👑 chefe começa.</span></li>
          </ol></div></div></div>`;
      }

      function desenhar() {
        const d = E, J = JOGOS[d.j] || JOGOS.quiz;
        if (d.f === 'sala') {
          ridTela = '';
          const me = (d.lista || []).find(x => x[0] === meuId);
          const souChefe = d.ch === meuId;
          const chefe = (d.lista || []).find(x => x[0] === d.ch);
          const meuVoto = (d.vt || {})[meuId];
          const cont = {}; Object.values(d.vt || {}).forEach(j => { cont[j] = (cont[j] || 0) + 1; });
          const lib = n => n <= GRATIS || d.pr;
          casca(`<div class="ctrl-lobby">
            <div class="ctrl-lobby-topo">
              <h2>${!me ? 'Entrando...' : souChefe ? '👑 Tu é o chefe da sala!' : '✅ Tu tá na sala!'}</h2>
              <p>${souChefe ? 'Escolhe o jogo e começa daqui. A galera vota 👍' : `Vota no próximo jogo. ${chefe ? `<b>${esc(chefe[1])}</b> 👑 começa` : 'Quem tá na TV começa'}.`}</p>
            </div>
            <h3 class="ctrl-tit">${souChefe ? 'Escolhe o jogo' : 'Vota no próximo jogo'}</h3>
            <div class="ctrl-votos">${ORDEM_JOGOS.map(id => { const j = JOGOS[id]; return `
              <button type="button" class="ctrl-voto mov-toque ${meuVoto === id ? 'meu' : ''} ${d.j === id ? 'escolhido' : ''}" data-voto="${id}" style="--cor:${j.cor}">
                <i aria-hidden="true">${j.icone}</i><b>${j.nome}</b>
                <small>${cont[id] ? '👍 ' + cont[id] : ''}</small>
                ${d.j === id ? '<em>escolhido</em>' : ''}
              </button>`; }).join('')}</div>
            ${souChefe ? `
              <div class="ctrl-chefe">
                <p><b>Nível ${d.n}</b> · ${J.nivelTxt(d.n)}</p>
                <div class="ctrl-niveis">${Array.from({ length: 10 }, (_, i) => i + 1).map(n => `<button type="button" class="mov-toque ${n === d.n ? 'sel' : ''} ${lib(n) ? '' : 'tranca'}" data-n="${n}">${lib(n) ? n : '🔒'}</button>`).join('')}</div>
                <button class="btn btn-grande ctrl-comecar" type="button">Começar ${J.icone} ${J.nome} ▶</button>
              </div>` : `<div class="ctrl-proximo"><small>Jogo escolhido</small><b>${J.icone} ${J.nome}</b><span>Nível ${d.n} · ${J.nivelTxt(d.n)}</span></div>`}
            ${telaComo()}
            <p class="ctrl-peq">${(d.lista || []).length} na sala · <button type="button" class="ctrl-link ctrl-trocar-nome">trocar meu nome</button></p>
          </div>`, 'ctrl-espera', 'ctrl-sala');
          const t = palco.querySelector('.ctrl-lobby');
          t.addEventListener('click', e => {
            const v = e.target.closest('[data-voto]'), n = e.target.closest('[data-n]');
            if (e.target.closest('.grupo-titulo')) { comoAberto = !comoAberto; CA.gravar('grupo:viu-como', true); return; }
            if (v) {
              canal.mandar('voto', { id: meuId, j: v.dataset.voto });
              if (souChefe) canal.mandar('cmd', { id: meuId, a: 'jogo', j: v.dataset.voto });
              CA.vibrar(15);
              t.querySelectorAll('.ctrl-voto').forEach(b => b.classList.toggle('meu', b === v));
            }
            if (n && souChefe) {
              if (!lib(+n.dataset.n)) { CA.aviso('Nível ' + n.dataset.n + ' é caRdeno Premium de quem abriu a sala na TV 🔒'); return; }
              canal.mandar('cmd', { id: meuId, a: 'nivel', n: +n.dataset.n });
            }
            if (e.target.closest('.ctrl-comecar')) { canal.mandar('cmd', { id: meuId, a: 'comecar' }); CA.vibrar(30); }
            if (e.target.closest('.ctrl-trocar-nome')) pedirNome(true);
          });
          if (comoAberto) CA.gravar('grupo:viu-como', true);
        } else if (d.f === 'pre') {
          ridTela = '';
          casca(`<div class="ctrl-msg"><p class="ctrl-pre-r">${J.icone} ${J.nome} · ${d.t > 1 ? 'rodada ' + d.r + ' de ' + d.t : 'nível ' + d.n}</p>
            <h2 class="ctrl-olha">${J.olha === 'celular' ? 'Prepara o dedo! 👆' : 'Olha pra TV! 👀'}</h2>
            ${d.r === 1 ? `<ol class="ctrl-como-lista">${J.como.map(c => `<li>${c}</li>`).join('')}</ol>` : ''}</div>`, 'ctrl-espera', 'ctrl-pre');
        } else if (d.f === 'rodada') {
          if (ridTela === d.rid) return;
          ridTela = d.rid;
          if (ridFeito === d.rid) { casca('<div class="ctrl-msg"><h2>Foi! ✋</h2><p>Espera a rodada acabar...</p></div>', '', 'ctrl-foi'); return; }
          meuChute = null;
          if (J.tipo === 'sprint') controleSprint(d);
          else if (J.tipo === 'corrida') controleAcha(d);
          else if (d.j === 'quiz') controleQuiz(d);
          else if (d.j === 'reflexo') controleReflexo(d);
          else if (d.j === 'conta') controleConta(d);
          else if (d.j === 'memoria') controleMemoria(d);
        } else if (d.f === 'revela' || d.f === 'fim') {
          ridTela = '';
          const res = d.res || {}, g = res.ganhos || [];
          const pos = g.findIndex(x => x[0] === meuId);
          const queimei = (res.queimou || []).includes(meuId);
          const errou = (res.erros || []).includes(meuId);
          let msg;
          if (J.tipo === 'sprint') msg = `<p class="ctrl-grande">${pos === 0 ? '⚡' : '👍'}</p><h2>${pos >= 0 ? g[pos][2] + ' acertos' : 'Acabou o tempo'}</h2>`;
          else if (d.j === 'conta') {
            const chute = res.chutes && res.chutes[meuId];
            msg = `<p class="ctrl-grande">${pos === 0 ? '🎯' : pos > 0 ? '👍' : chute != null ? '😅' : '⏰'}</p>
              <h2>${chute != null ? `Tu chutou ${esc(chute)}` : 'Não deu tempo'}</h2><p>Tinha <b>${res.certo}</b> ${res.d ? res.d.alvo : ''}${pos >= 0 ? ` · <b>+${g[pos][2]}</b>` : ''}</p>`;
          }
          else if (queimei) msg = `<p class="ctrl-grande">🔥</p><h2>Queimou!</h2><p>Tocou antes da hora.</p>`;
          else if (pos === 0) msg = `<p class="ctrl-grande">⚡</p><h2>Tu foi ${d.j === 'acha' || d.j === 'reflexo' ? 'o mais rápido' : 'o primeiro'}! +${g[0][2]}</h2>`;
          else if (pos > 0) msg = `<p class="ctrl-grande">👍</p><h2>${d.j === 'acha' ? 'Chegou' : 'Acertou'}! ${pos + 1}º · +${g[pos][2]}</h2>`;
          else if (errou) msg = `<p class="ctrl-grande">❌</p><h2>${d.j === 'reflexo' ? 'Muito devagar!' : 'Errou essa!'}</h2>`;
          else msg = `<p class="ctrl-grande">⏰</p><h2>${d.j === 'acha' ? 'Não terminou a tempo' : 'Não deu tempo'}</h2>`;
          if (d.j === 'quiz' && res.d && res.certo != null) msg += `<p>Resposta: <b>${esc(res.d.ops[+res.certo])}</b></p>`;
          if (d.f === 'fim') {
            const ord = (d.lista || []).slice().sort((a, b) => b[2] - a[2]);
            const minha = ord.findIndex(x => x[0] === meuId) + 1;
            const souChefe = d.ch === meuId;
            casca(`<div class="ctrl-msg ctrl-fim">
              <p class="ctrl-grande">${minha === 1 ? '🏆' : minha === 2 ? '🥈' : minha === 3 ? '🥉' : '🎉'}</p>
              <h2>${minha === 1 ? 'Tu ganhou!' : minha ? 'Tu ficou em ' + minha + 'º' : 'Fim de jogo'}</h2>
              <p>${ord[0] ? 'Campeão: <b>' + esc(ord[0][1]) + '</b> com ' + ord[0][2] + ' ' + rotuloPts(J) : ''}</p>
              <p class="ctrl-fica">Tu continua na sala 😉 Já já volta pra todo mundo escolher o próximo jogo.</p>
              ${souChefe ? `<div class="ctrl-fim-botoes">
                <button class="btn btn-grande" type="button" data-a="sala">Escolher outro jogo</button>
                <button class="btn btn-claro" type="button" data-a="denovo">Jogar de novo</button></div>` : ''}
            </div>`, '', 'ctrl-fim');
            palco.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => canal.mandar('cmd', { id: meuId, a: b.dataset.a })));
          } else {
            casca(`<div class="ctrl-msg">${msg}<p class="ctrl-peq">Olha o placar na TV</p></div>`, '', 'ctrl-revela');
          }
        }
      }

      function responder(v, ms) {
        if (!E || E.f !== 'rodada' || ridFeito === E.rid) return;
        ridFeito = E.rid;
        if (ms == null) ms = Math.round(performance.now() - t0);
        canal.mandar('resp', { id: meuId, rid: E.rid, v, ms });
        CA.vibrar(30);
        return ms;
      }
      const esperaFim = (titulo, sub) => casca(`<div class="ctrl-msg"><h2>${titulo}</h2><p>${sub || 'Espera a rodada acabar...'}</p></div>`, '', 'ctrl-foi');

      // progresso (barrinha na TV): no máximo 4 por segundo, pra não entupir a sala
      let progT = 0, progPend = null;
      function mandarProg(o) {
        progPend = o;
        if (progT) return;
        canal.mandar('prog', progPend); progPend = null;
        progT = setTimeout(function solta() { progT = 0; if (progPend) { canal.mandar('prog', progPend); progPend = null; progT = setTimeout(solta, 250); } }, 250);
      }

      // Quiz: 3 respostas coloridas (as mesmas da TV)
      function controleQuiz(d) {
        casca(`<div class="ctrl-jogo">
          <p class="ctrl-pre-r">Pergunta ${d.r} de ${d.t} · olha na TV</p>
          <p class="ctrl-quiz-p">${esc(d.d.p)}</p>
          <div class="ctrl-quiz">${d.d.ops.map((o, i) => `<button type="button" class="ctrl-quiz-op" data-v="${i}" style="--c:${OPCOES[i][1]}"><i>${OPCOES[i][0]}</i><span>${esc(o)}</span></button>`).join('')}</div>
        </div>`, '', 'ctrl-jogo');
        t0 = performance.now();
        palco.querySelector('.ctrl-quiz').addEventListener('pointerdown', e => {
          const b = e.target.closest('[data-v]'); if (!b) return;
          e.preventDefault();
          const ms = responder(b.dataset.v);
          if (ms != null) esperaFim('Foi! ✋', `Tu escolheu <b>${OPCOES[+b.dataset.v][0]}</b> em ${CA.fmtSeg(ms / 1000)}. Espera a resposta na TV...`);
        });
      }

      // Dedo mais rápido: a tela inteira é o botão. Toca só no verde.
      function controleReflexo(d) {
        const rid = d.rid;
        casca(`<div class="ctrl-jogo"><button type="button" class="ctrl-reflexo" data-s="espera"><b>Espera...</b><small>toca quando ficar verde</small></button></div>`, 'ctrl-corrida', 'ctrl-jogo');
        const bt = palco.querySelector('.ctrl-reflexo');
        const inicio = performance.now();
        let verde = 0, acabou = false;
        const tms = [];
        const pinta = (s, txt, sub) => { if (acabou || ridTela !== rid) return; bt.dataset.s = s; bt.innerHTML = `<b>${txt}</b><small>${sub}</small>`; };
        d.d.ev.forEach(([t, tipo, dur]) => {
          tms.push(setTimeout(() => {
            if (tipo === 'vai') { verde = performance.now(); pinta('vai', 'TOCA!', 'agora!'); CA.vibrar(20); }
            else pinta(tipo, tipo === 'falso2' ? 'AGORA?' : 'Ainda não!', 'não toca, é pegadinha');
          }, Math.max(0, t - (performance.now() - inicio))));
          tms.push(setTimeout(() => { if (tipo === 'vai') { verde = -1; pinta('espera', 'Acabou!', 'muito devagar...'); } else pinta('espera', 'Espera...', 'toca quando ficar verde'); }, t + dur));
        });
        bt.addEventListener('pointerdown', e => {
          e.preventDefault();
          if (acabou) return;
          acabou = true; tms.forEach(clearTimeout);
          if (verde > 0) {
            const ms = Math.round(performance.now() - verde);
            responder('ok', ms); CA.som('certo');
            esperaFim(`⚡ ${CA.fmtSeg(ms / 1000)}`, 'Esse foi teu tempo. Olha na TV quem foi mais rápido!');
          } else {
            responder(verde < 0 ? 'tarde' : 'queimou', 9999); CA.som('errado'); CA.vibrar(80);
            esperaFim(verde < 0 ? '🐢 Tarde demais' : '🔥 Queimou!', verde < 0 ? 'O verde já tinha passado.' : 'Tocou antes de ficar verde. Na próxima, espera!');
          }
        });
      }

      // Quantos tem?: olha a TV, depois digita o número
      function controleConta(d) {
        const rid = d.rid, ver = d.d.ver;
        casca(`<div class="ctrl-jogo ctrl-conta">
          <p class="ctrl-pre-r">Rodada ${d.r} de ${d.t}</p>
          <div class="ctrl-conta-olha"><p class="ctrl-grande">👀</p><h2>Olha pra TV!</h2><p>Conta quantos <span class="ctrl-conta-alvo">${d.d.alvo}</span> tem</p></div>
          <div class="ctrl-conta-num mov-aparece" hidden>
            <p>Quantos <span class="ctrl-conta-alvo">${d.d.alvo}</span> tinha?</p>
            <output class="ctrl-visor">0</output>
            <div class="ctrl-teclado">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-t="${n}">${n}</button>`).join('')}<button type="button" data-t="apaga" aria-label="Apagar">⌫</button><button type="button" data-t="0">0</button><button type="button" data-t="ok" class="ok">OK</button></div>
          </div>
        </div>`, '', 'ctrl-jogo');
        let num = '';
        const visor = palco.querySelector('.ctrl-visor');
        setTimeout(() => {
          if (!vivo || ridTela !== rid || ridFeito === rid) return;
          palco.querySelector('.ctrl-conta-olha').hidden = true;
          palco.querySelector('.ctrl-conta-num').hidden = false;
          t0 = performance.now();
          CA.vibrar(20);
        }, ver);
        palco.querySelector('.ctrl-teclado').addEventListener('pointerdown', e => {
          const b = e.target.closest('[data-t]'); if (!b) return;
          e.preventDefault();
          const t = b.dataset.t;
          if (t === 'apaga') num = num.slice(0, -1);
          else if (t === 'ok') {
            if (!num) { CA.aviso('Digita quantos tinha 😉'); return; }
            meuChute = +num;
            responder(String(+num));
            esperaFim(`Tu chutou ${+num}`, 'Olha na TV quantos tinha!');
            return;
          } else if (num.length < 3) num = (num + t).replace(/^0+(?=\d)/, '');
          visor.textContent = num || '0';
          CA.som('tique');
        });
      }

      // Sequência de cores: espera a TV mostrar, depois repete
      function controleMemoria(d) {
        const rid = d.rid, D = d.d, cores = CORES.slice(0, D.k);
        casca(`<div class="ctrl-jogo ctrl-mem">
          <p class="ctrl-pre-r">Rodada ${d.r} de ${d.t} · ${D.seq.length} cores</p>
          <div class="ctrl-mem-olha"><p class="ctrl-grande">👀</p><h2>Olha pra TV!</h2><p>Decora a ordem das cores que piscam</p></div>
          <div class="ctrl-mem-vez mov-aparece" hidden>
            <p class="ctrl-mem-dots">${D.seq.map(() => '<i></i>').join('')}</p>
            <div class="ctrl-mem-pads n${D.k}">${cores.map(c => `<button type="button" data-c="${c.id}" style="--c:${c.hex}" aria-label="${c.nome}"></button>`).join('')}</div>
          </div>
        </div>`, '', 'ctrl-jogo');
        const feitos = [];
        setTimeout(() => {
          if (!vivo || ridTela !== rid || ridFeito === rid) return;
          palco.querySelector('.ctrl-mem-olha').hidden = true;
          palco.querySelector('.ctrl-mem-vez').hidden = false;
          t0 = performance.now();
          CA.vibrar(20);
        }, Math.max(0, D.mostra - 300));
        const dots = () => palco.querySelectorAll('.ctrl-mem-dots i');
        palco.querySelector('.ctrl-mem-pads').addEventListener('pointerdown', e => {
          const b = e.target.closest('[data-c]'); if (!b || ridFeito === rid) return;
          e.preventDefault();
          b.classList.remove('acende'); void b.offsetWidth; b.classList.add('acende');
          const i = feitos.length;
          feitos.push(b.dataset.c);
          if (b.dataset.c !== D.seq[i]) {
            CA.som('errado'); CA.vibrar(80);
            responder(feitos.join(','));
            esperaFim('❌ Errou a ordem', `Tu acertou ${i} de ${D.seq.length}. Olha na TV como era.`);
            return;
          }
          CA.som('certo');
          dots()[i].classList.add('ok');
          mandarProg({ id: meuId, rid, k: i + 1 });
          if (feitos.length === D.seq.length) {
            const ms = responder(feitos.join(','));
            esperaFim('✅ Acertou tudo!', `Em ${CA.fmtSeg(ms / 1000)}. Olha na TV quem foi mais rápido.`);
          }
        });
      }

      // Fala a cor e Responde rápido: igual ao jogo individual. Cada celular recebe a mesma sequência
      // (semente da TV), responde uma atrás da outra até o tempo acabar; quem acertar mais ganha.
      function controleSprint(d) {
        const D = d.d, rid = d.rid, r = CA.rng(D.semente), cor = d.j === 'cor';
        const ativas = cor ? CORES.slice(0, D.k) : [];
        const pool = !cor && CA.PEGADINHAS ? r.shuffle(CA.PEGADINHAS) : [];
        let pi = 0, k = 0, e = 0, multa = 0, atual = null, acabou = false, ordem = ativas;
        casca(`<div class="ctrl-jogo ctrl-sprint">
          <div class="barra"><div class="pontos"><b>0</b> acertos</div><div class="relogio">${Math.round(d.dur / 1000)} s</div></div>
          <div class="ctrl-alvo"></div>
          ${cor ? `<div class="ctrl-cores n${ativas.length}"></div>` : `<div class="ctrl-ce">
            <button type="button" class="ctrl-btn-ce certo" data-v="certo">✔ CERTO</button>
            <button type="button" class="ctrl-btn-ce errado" data-v="errado">✘ ERRADO</button></div>`}
        </div>`, 'ctrl-corrida', 'ctrl-jogo');
        const elAlvo = palco.querySelector('.ctrl-alvo'), elP = palco.querySelector('.pontos b'), elR = palco.querySelector('.relogio');
        const caixa = palco.querySelector(cor ? '.ctrl-cores' : '.ctrl-ce');
        const botoes = () => { caixa.innerHTML = ordem.map(c => `<button type="button" class="ctrl-cor" data-v="${c.id}" style="--c:${c.hex}" aria-label="${c.nome}"></button>`).join(''); };
        function proxima() {
          if (cor) {
            const p = r.pick(ativas); let t = r.pick(ativas);
            while (t.id === p.id) t = r.pick(ativas);
            atual = { certo: t.id };
            elAlvo.innerHTML = `<span class="ctrl-palavra" style="color:${t.hex}">${p.nome}</span>`;
            if (D.mexe || !caixa.children.length) { ordem = D.mexe ? r.shuffle(ativas) : ativas; botoes(); }
          } else {
            let txt, ok;
            if (D.pega && k >= 3 && pi < pool.length && r() < 0.34) [txt, ok] = pool[pi++];
            else ({ txt, certo: ok } = CA.gerarConta(r, Math.min(10, D.n + Math.floor(k / 12))));
            atual = { certo: ok ? 'certo' : 'errado' };
            elAlvo.innerHTML = `<span class="ctrl-frase">${esc(txt)}</span>`;
          }
        }
        proxima();
        t0 = performance.now();
        const fimEm = () => t0 + d.dur - multa * 1000;
        let ultimoTique = -1;
        const rel = setInterval(() => {
          if (!vivo || ridTela !== rid) { clearInterval(rel); return; }
          const resta = Math.max(0, (fimEm() - performance.now()) / 1000);
          elR.textContent = Math.ceil(resta) + ' s';
          const sc = Math.ceil(resta);
          if (sc <= 5 && sc !== ultimoTique && sc > 0) { ultimoTique = sc; CA.som('tique'); }
          if (resta <= 0) { clearInterval(rel); terminar(); }
        }, 100);
        function terminar() {
          if (acabou) return;
          acabou = true; ridFeito = rid;
          canal.mandar('resp', { id: meuId, rid, v: 'fim', k, e, ms: d.dur });
          CA.som('fim'); CA.vibrar([40, 40, 80]);
          casca(`<div class="ctrl-msg"><p class="ctrl-grande">⏰</p><h2>${k} ${k === 1 ? 'acerto' : 'acertos'}!</h2><p>${e ? 'Errou ' + e + '. ' : ''}Olha na TV quem acertou mais.</p></div>`, '', 'ctrl-foi');
        }
        caixa.addEventListener('pointerdown', ev => {
          const b = ev.target.closest('[data-v]');
          if (!b || acabou) return;
          ev.preventDefault();
          if (b.dataset.v === atual.certo) { k++; CA.som('certo'); elP.textContent = k; }
          else { e++; multa += D.multa; CA.som('errado'); CA.vibrar(60); b.classList.remove('treme'); void b.offsetWidth; b.classList.add('treme'); }
          mandarProg({ id: meuId, rid, k, e });
          if (fimEm() - performance.now() <= 0) { terminar(); return; }
          proxima();
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
        </div>`, 'ctrl-corrida', 'ctrl-jogo');
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
              casca(`<div class="ctrl-msg"><p class="ctrl-grande">🏁</p><h2>Terminou! ${CA.fmtSeg(ms / 1000)}</h2><p>Olha na TV quem chegou primeiro.</p></div>`, '', 'ctrl-foi');
              return;
            }
            elA.textContent = alvo;
            mandarProg({ id: meuId, rid, k: alvo - 1 });
          } else {
            multa += 1; CA.som('errado'); CA.vibrar(60);
            b.classList.remove('treme'); void b.offsetWidth; b.classList.add('treme');
          }
        });
      }

      // já tem nome guardado: entra direto (se a página recarregar no meio, volta sozinho pra sala)
      if (nome) entrar(); else pedirNome();

      return () => {
        vivo = false;
        clearInterval(oiT); clearInterval(vigia); clearTimeout(achouT); clearTimeout(progT);
        if (canal) { try { canal.mandar('sai', { id: meuId }); } catch (e) {} setTimeout(() => canal.fechar(), 150); }
        if (soltarTela) soltarTela();
      };
    },
  };
})();
