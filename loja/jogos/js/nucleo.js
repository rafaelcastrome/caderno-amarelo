/* Núcleo do app de jogos do Caderno Amarelo.
   Coisas que todos os jogos usam: sorteio com semente (pra desafiar amigo e
   desafio do dia), recordes no celular, sons, tela de resultado, compartilhar
   e card pros stories. Sem conta e sem dado pessoal. */
(function () {
  'use strict';

  const CA = (window.CA = window.CA || {});
  CA.jogos = CA.jogos || {};

  // ---------- sorteio com semente ----------
  // Mesma semente = mesma partida. É isso que faz o "desafiar amigo" funcionar.
  CA.rng = function (semente) {
    let a = semente >>> 0;
    const r = function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.int = (min, max) => min + Math.floor(r() * (max - min + 1));
    r.pick = arr => arr[Math.floor(r() * arr.length)];
    r.shuffle = arr => {
      const a2 = arr.slice();
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    };
    return r;
  };
  CA.novaSemente = () => Math.floor(Math.random() * 2 ** 31);

  // Desafio do dia: a data de Brasília vira a semente.
  CA.hojeBR = function () {
    const d = new Date(Date.now() - 3 * 3600e3);
    return d.toISOString().slice(0, 10); // AAAA-MM-DD
  };
  CA.sementeDoDia = function (extra, data) {
    const s = (data || CA.hojeBR()) + '|' + (extra || '');
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  };

  // Qual jogo é o desafio de um dia (roda entre os jogos, um por dia).
  CA.ORDEM = ['acha']; // os jogos cor e rapido ficam guardados (arquivos cor.js e rapido.js) pra usar depois
  CA.jogoDoDia = function (data) {
    const dia = Math.floor(Date.parse((data || CA.hojeBR()) + 'T12:00:00Z') / 864e5);
    return CA.ORDEM[dia % CA.ORDEM.length];
  };
  CA.fmtData = d => d.slice(8, 10) + '/' + d.slice(5, 7);
  // Lê o parâmetro d da rota: '1' = hoje, 'AAAA-MM-DD' = dia anterior (só Premium).
  // Devolve a data, null (não é desafio do dia) ou false (bloqueado: já mandou pro Premium).
  CA.dataDoDesafio = function (p) {
    if (!p.d) return null;
    if (p.d === '1') return CA.hojeBR();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.d) || p.d >= CA.hojeBR()) return CA.hojeBR();
    if (!CA.ehPremium()) { location.hash = '#/premium'; return false; }
    return p.d;
  };

  // ---------- guardar no celular (pode falhar em aba anônima) ----------
  CA.ler = function (chave, padrao) {
    try {
      const v = localStorage.getItem('ca-jogos:' + chave);
      return v == null ? padrao : JSON.parse(v);
    } catch (e) { return padrao; }
  };
  CA.gravar = function (chave, valor) {
    try { localStorage.setItem('ca-jogos:' + chave, JSON.stringify(valor)); } catch (e) { /* sem espaço */ }
  };

  // Recorde: menor é melhor (tempo) ou maior é melhor (pontos).
  CA.recorde = function (chave, valor, menorMelhor) {
    const antigo = CA.ler('rec:' + chave, null);
    const bateu = antigo == null || (menorMelhor ? valor < antigo : valor > antigo);
    if (bateu) CA.gravar('rec:' + chave, valor);
    return { antigo, bateu };
  };

  // Conta e Premium ficam em premium.js (CA.conta, CA.ehPremium, CA.sincronizar).
  CA.ehPremium = () => false;

  // ---------- sons (curtinhos, gerados na hora) ----------
  let ctx = null;
  CA.somLigado = () => CA.ler('som', true);
  CA.som = function (tipo) {
    if (!CA.somLigado()) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const notas = {
        certo: [[660, 0, .07], [990, .06, .09]],
        errado: [[180, 0, .18]],
        tique: [[1200, 0, .03]],
        valendo: [[523, 0, .1], [784, .1, .16]],
        fim: [[784, 0, .12], [659, .12, .12], [523, .24, .25]],
        recorde: [[523, 0, .1], [659, .1, .1], [784, .2, .1], [1046, .3, .3]],
      }[tipo] || [];
      const t0 = ctx.currentTime;
      notas.forEach(([f, ini, dur]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = tipo === 'errado' ? 'sawtooth' : 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t0 + ini);
        g.gain.exponentialRampToValueAtTime(.18, t0 + ini + .01);
        g.gain.exponentialRampToValueAtTime(.0001, t0 + ini + dur);
        o.connect(g).connect(ctx.destination);
        o.start(t0 + ini);
        o.stop(t0 + ini + dur + .02);
      });
    } catch (e) { /* sem som, tudo bem */ }
  };
  CA.vibrar = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

  // ---------- utilidades de tela ----------
  CA.el = function (html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  CA.palco = () => document.getElementById('palco');
  CA.fmtSeg = s => s.toFixed(1).replace('.', ',') + ' s';

  // Contagem "Preparado? 3, 2, 1, Valendo!" antes de cada partida.
  CA.contagem = function (alvo) {
    return new Promise(resolve => {
      const cap = CA.el('<div class="contagem"><span>Preparado?</span></div>');
      alvo.appendChild(cap);
      const passos = ['3', '2', '1', 'Valendo!'];
      let i = 0;
      const span = cap.firstElementChild;
      setTimeout(function prox() {
        if (i >= passos.length) { cap.remove(); resolve(); return; }
        span.textContent = passos[i];
        span.className = i === 3 ? 'valendo' : 'num';
        void span.offsetWidth;
        span.classList.add('pula');
        CA.som(i === 3 ? 'valendo' : 'tique');
        i++;
        setTimeout(prox, i === 4 ? 450 : 650);
      }, 700);
    });
  };

  // ---------- link de desafio ----------
  CA.linkDesafio = function (jogo, params) {
    const base = location.origin + location.pathname;
    const q = new URLSearchParams(params).toString();
    return base + '#/' + jogo + '?' + q;
  };

  CA.compartilhar = async function (texto, url) {
    const msg = texto + '\n' + url;
    try {
      if (navigator.share) { await navigator.share({ text: texto, url }); return 'ok'; }
    } catch (e) { if (e && e.name === 'AbortError') return 'cancelou'; }
    try { await navigator.clipboard.writeText(msg); CA.aviso('Link copiado! Cola no WhatsApp 😉'); return 'copiado'; }
    catch (e) { window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank'); return 'whats'; }
  };

  CA.aviso = function (texto) {
    const a = CA.el(`<div class="aviso" role="status">${texto}</div>`);
    document.body.appendChild(a);
    setTimeout(() => a.classList.add('some'), 2200);
    setTimeout(() => a.remove(), 2700);
  };

  // ---------- card pros stories (1080x1920) ----------
  let fonteOk = null;
  function carregarFonte() {
    if (fonteOk) return fonteOk;
    fonteOk = (async () => {
      try {
        const f = new FontFace('CaveatCard', 'url(../assets/fonts/Caveat-Bold.ttf)');
        await f.load();
        document.fonts.add(f);
      } catch (e) { /* cai pra fonte do sistema */ }
    })();
    return fonteOk;
  }
  CA.fonteCard = carregarFonte;

  CA.gerarCard = async function ({ jogo, linha1, valor, linha3, cor }) {
    await carregarFonte();
    const c = document.createElement('canvas');
    c.width = 1080; c.height = 1920;
    const g = c.getContext('2d');
    // papel quadriculado
    g.fillStyle = '#fbf5df'; g.fillRect(0, 0, 1080, 1920);
    for (let x = 0; x <= 1080; x += 54) {
      g.strokeStyle = x % 216 === 0 ? 'rgba(70,130,200,.26)' : 'rgba(70,130,200,.14)';
      g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1920); g.stroke();
    }
    for (let y = 0; y <= 1920; y += 54) {
      g.strokeStyle = y % 216 === 0 ? 'rgba(70,130,200,.26)' : 'rgba(70,130,200,.14)';
      g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.lineTo(1080, y); g.stroke();
    }
    const ouro = CA.ehPremium();
    if (ouro) {
      g.strokeStyle = '#c99a1b'; g.lineWidth = 26; g.strokeRect(30, 30, 1020, 1860);
      g.strokeStyle = '#ffd23f'; g.lineWidth = 8; g.strokeRect(62, 62, 956, 1796);
    }
    // margem vermelha
    g.strokeStyle = 'rgba(214,40,40,.55)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(130, 0); g.lineTo(130, 1920); g.stroke();

    const F = s => `700 ${s}px CaveatCard, Caveat, 'Comic Sans MS', cursive`;
    g.textAlign = 'center'; g.fillStyle = '#1f1f24';
    // fita amarela + nome do jogo
    g.save(); g.translate(540, 330); g.rotate(-0.04);
    g.fillStyle = 'rgba(255,210,63,.9)'; g.fillRect(-380, -80, 760, 140);
    g.fillStyle = '#1f1f24'; g.font = F(104); g.fillText(jogo, 0, 22);
    g.restore();

    g.font = F(84); g.fillStyle = '#55555c'; g.fillText(linha1, 540, 640);
    // valor grande com sombra de caneta
    g.font = F(330); g.fillStyle = '#1f1f24'; g.fillText(valor, 548, 1018);
    g.fillStyle = cor || '#d62828'; g.fillText(valor, 540, 1010);
    // sublinhado à mão
    g.strokeStyle = '#ffd23f'; g.lineWidth = 26; g.lineCap = 'round';
    g.beginPath(); g.moveTo(250, 1080); g.quadraticCurveTo(540, 1050, 830, 1086); g.stroke();

    g.fillStyle = '#1f1f24'; g.font = F(96); g.fillText(linha3 || 'Duvido tu bater! 👀', 540, 1290);
    if (ouro) {
      g.save(); g.translate(540, 1450); g.rotate(-0.05);
      g.fillStyle = '#c99a1b'; g.fillRect(-260, -60, 520, 96);
      g.fillStyle = '#fff'; g.font = F(70); g.fillText('★ PREMIUM ★', 0, 10);
      g.restore();
    }
    g.font = F(70); g.fillStyle = '#55555c'; g.fillText('joga de graça no link da bio', 540, 1600);
    g.font = F(92); g.fillStyle = '#1f1f24'; g.fillText('@Cardeno_Amarelo', 540, 1720);
    return c;
  };

  CA.mandarCard = async function (dados) {
    const c = await CA.gerarCard(dados);
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    const arq = new File([blob], 'caderno-amarelo-' + Date.now() + '.png', { type: 'image/png' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [arq] })) {
        await navigator.share({ files: [arq] });
        return;
      }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = arq.name;
    document.body.appendChild(a); a.click(); a.remove();
    CA.aviso('Imagem salva! Posta nos stories 📸');
  };

  // ---------- tela de resultado (igual pra todos os jogos) ----------
  // r = { jogo, titulo, valorTxt, detalhe, recorde:{bateu,antigo}, recordeTxt, desafio:{texto,url},
  //       amigo:{nome?, valorTxt, ganhou}, card:{...}, jogarDeNovo:fn, extra? }
  CA.resultado = function (r) {
    CA.som(r.recorde && r.recorde.bateu && r.recorde.antigo != null ? 'recorde' : 'fim');
    const amigo = r.amigo ? `
      <div class="placar-amigo ${r.amigo.ganhou ? 'ganhou' : 'perdeu'}">
        ${r.amigo.ganhou ? 'Tu ganhou do teu amigo! 🏆' : 'Teu amigo ganhou dessa vez 😅'}
        <small>Ele fez ${r.amigo.valorTxt}</small>
      </div>` : '';
    const rec = r.recorde && r.recorde.bateu && r.recorde.antigo != null
      ? '<div class="recorde-novo">NOVO RECORDE!</div>'
      : (r.recordeTxt ? `<div class="recorde">Teu recorde: ${r.recordeTxt}</div>` : '');
    const tela = CA.el(`
      <section class="resultado">
        <div class="folha ${CA.ehPremium() ? 'folha-ouro' : ''}">
          <p class="res-titulo">${r.titulo}</p>
          ${r.estrelas ? `<p class="res-estrelas" aria-label="${r.estrelas} de 3 estrelas">${'<i class="cheia">★</i>'.repeat(r.estrelas)}${'<i>★</i>'.repeat(3 - r.estrelas)}</p>` : ''}
          <p class="res-valor">${r.valorTxt}</p>
          ${r.detalhe ? `<p class="res-detalhe">${r.detalhe}</p>` : ''}
          ${rec}
          ${amigo}
        </div>
        <div class="acoes">
          ${r.proxima ? `<a class="btn btn-grande ${r.proxima.tranca ? 'btn-ouro' : ''}" href="${r.proxima.href}">${r.proxima.txt}</a>` : ''}
          <button class="btn btn-grande ${r.proxima ? 'btn-claro' : ''}" data-a="desafiar">Desafiar um amigo</button>
          <button class="btn btn-grande btn-claro" data-a="card">Postar nos stories</button>
          <button class="btn btn-grande btn-claro" data-a="denovo">Jogar de novo</button>
          <a class="link-voltar" href="#/">Ver todas as fases</a>
        </div>
        ${CA.ehPremium() ? `<a class="mais-desafios" href="../desafios.html">
          <strong>Teus 66 Desafios tão liberados.</strong> Bora? →
        </a>` : `<a class="chamada-premium" href="#/premium">
          <strong>Caderno Premium</strong>
          <span>Todas as 30 fases, desafios dos dias anteriores, card dourado e os 66 Desafios. R$ 9,90 uma vez só.</span>
        </a>`}
      </section>`);
    tela.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      if (b.dataset.a === 'desafiar') CA.compartilhar(r.desafio.texto, r.desafio.url);
      if (b.dataset.a === 'card') { b.disabled = true; CA.mandarCard(r.card).finally(() => { b.disabled = false; }); }
      if (b.dataset.a === 'denovo') r.jogarDeNovo();
    });
    return tela;
  };
})();
