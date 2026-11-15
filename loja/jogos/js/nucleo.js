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
    document.querySelectorAll('.aviso').forEach(x => x.remove()); // um aviso por vez, sem empilhar
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

  // Endereço do jogo escrito por extenso no card (quem vê o story acha fácil).
  CA.enderecoJogo = () => (location.host.replace(/^www\./, '') + location.pathname.replace(/index\.html$/, '')).replace(/\/$/, '');

  // Card original de cada partida: tempo, estrelas, a grade que a pessoa jogou com o
  // caminho da caneta passando pelos números na ordem, e o link + como jogar no rodapé.
  CA.gerarCard = async function ({ jogo, linha1, valor, linha3, cor, estrelas, quadro, regra, comoJoga, tentativa }) {
    await carregarFonte();
    const W = 1080, H = 1920;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const F = s => `700 ${s}px CaveatCard, Caveat, 'Comic Sans MS', cursive`;
    const caber = (txt, tam, larg) => { g.font = F(tam); while (tam > 30 && g.measureText(txt).width > larg) g.font = F(--tam); return tam; };
    // papel quadriculado
    g.fillStyle = '#fbf5df'; g.fillRect(0, 0, W, H);
    for (let x = 0; x <= W; x += 54) {
      g.strokeStyle = x % 216 === 0 ? 'rgba(70,130,200,.24)' : 'rgba(70,130,200,.12)';
      g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
    }
    for (let y = 0; y <= H; y += 54) {
      g.strokeStyle = y % 216 === 0 ? 'rgba(70,130,200,.24)' : 'rgba(70,130,200,.12)';
      g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    }
    const ouro = CA.ehPremium();
    if (ouro) {
      g.strokeStyle = '#c99a1b'; g.lineWidth = 26; g.strokeRect(30, 30, W - 60, H - 60);
      g.strokeStyle = '#ffd23f'; g.lineWidth = 8; g.strokeRect(62, 62, W - 124, H - 124);
    }
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';

    // fita amarela com o nome do jogo
    g.save(); g.translate(540, 210); g.rotate(-0.035);
    g.fillStyle = 'rgba(255,210,63,.92)'; g.fillRect(-420, -78, 840, 136);
    g.fillStyle = '#1f1f24'; caber(jogo, 104, 780); g.fillText(jogo, 0, 24);
    g.restore();
    g.fillStyle = '#55555c'; caber(linha1, 64, 900); g.fillText(linha1, 540, 352);

    // tempo grande com sombra de caneta + estrelas
    g.font = F(230); g.fillStyle = '#1f1f24'; g.fillText(valor, 548, 553);
    g.fillStyle = cor || '#d62828'; g.fillText(valor, 540, 545);
    let y = 600;
    if (estrelas != null) {
      const est = (cx, cy, r, cheia) => {
        g.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
          g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        }
        g.closePath();
        g.fillStyle = cheia ? '#ffd23f' : 'rgba(31,31,36,.08)'; g.fill();
        g.lineWidth = 6; g.lineJoin = 'round'; g.strokeStyle = '#1f1f24'; g.stroke();
      };
      for (let i = 0; i < 3; i++) est(540 + (i - 1) * 110, 630, 42, i < estrelas);
      y = 680;
    } else {
      g.strokeStyle = '#ffd23f'; g.lineWidth = 22; g.lineCap = 'round';
      g.beginPath(); g.moveTo(330, 600); g.quadraticCurveTo(540, 578, 750, 604); g.stroke();
      y = 650;
    }
    if (tentativa) {
      // carimbo da tentativa (de primeira / na 3ª tentativa)
      const txt = tentativa === 'de primeira' ? 'DE PRIMEIRA!' : tentativa.replace(/^na /, '').toUpperCase();
      g.save(); g.translate(205, 430); g.rotate(-0.16);
      g.font = F(46); const lw = Math.min(330, g.measureText(txt).width + 40);
      caber(txt, 46, lw - 30);
      g.strokeStyle = '#d62828'; g.lineWidth = 6; g.strokeRect(-lw / 2, -40, lw, 72);
      g.fillStyle = '#d62828'; g.fillText(txt, 0, 12);
      g.restore();
    }
    if (ouro) {
      g.save(); g.translate(850, 420); g.rotate(0.18);
      g.fillStyle = '#c99a1b'; g.fillRect(-150, -42, 300, 70);
      g.fillStyle = '#fff'; g.font = F(52); g.fillText('★ PREMIUM', 0, 10);
      g.restore();
    }

    // a grade que a pessoa jogou, com o caminho da caneta
    if (quadro) {
      const n = quadro.n, lado = 540, x0 = (W - lado) / 2, y0 = y + 20, cel = lado / n, pad = cel * 0.07;
      g.save(); g.translate(540, y0 + lado / 2); g.rotate(0.012); g.translate(-540, -(y0 + lado / 2));
      g.fillStyle = 'rgba(31,31,36,.12)'; g.fillRect(x0 + 10, y0 + 12, lado, lado);
      g.fillStyle = '#fff'; g.fillRect(x0 - 12, y0 - 12, lado + 24, lado + 24);
      const centro = i => [x0 + (i % n + 0.5) * cel, y0 + (Math.floor(i / n) + 0.5) * cel];
      quadro.nomes.forEach((nome, i) => {
        const [cx, cy] = centro(i);
        g.fillStyle = quadro.cores[i]; g.strokeStyle = quadro.bordas[i]; g.lineWidth = 3;
        g.fillRect(cx - cel / 2 + pad, cy - cel / 2 + pad, cel - 2 * pad, cel - 2 * pad);
        g.strokeRect(cx - cel / 2 + pad, cy - cel / 2 + pad, cel - 2 * pad, cel - 2 * pad);
        g.fillStyle = 'rgba(31,31,36,.55)'; g.font = F(Math.round(cel * 0.5));
        g.fillText(nome, cx, cy + cel * 0.17);
      });
      // traço de caneta (meio tremido, como feito à mão)
      const pts = quadro.caminho.map(centro);
      g.strokeStyle = n > 4 ? 'rgba(214,40,40,.7)' : 'rgba(214,40,40,.85)'; g.lineWidth = Math.max(4, cel * 0.055); g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      pts.forEach(([px, py], k) => {
        const tx = px + Math.sin(k * 2.3) * cel * 0.08, ty = py + Math.cos(k * 1.7) * cel * 0.08;
        if (!k) g.moveTo(tx, ty);
        else {
          const [qx, qy] = pts[k - 1];
          g.quadraticCurveTo((qx + px) / 2 + Math.cos(k) * cel * 0.12, (qy + py) / 2 + Math.sin(k) * cel * 0.12, tx, ty);
        }
      });
      g.stroke();
      const bola = ([px, py], txt) => {
        g.fillStyle = '#d62828'; g.beginPath(); g.arc(px, py, cel * 0.26, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#fff'; g.font = F(Math.round(cel * 0.34)); g.fillText(txt, px, py + cel * 0.11);
      };
      if (pts.length) { bola(pts[0], quadro.nomes[quadro.caminho[0]]); bola(pts[pts.length - 1], quadro.nomes[quadro.caminho[pts.length - 1]]); }
      g.restore();
      y = y0 + lado + 20;
      if (regra) { g.fillStyle = '#55555c'; caber('Regra: ' + regra, 48, 900); g.fillText('Regra: ' + regra, 540, y + 45); y += 50; }
    }

    g.fillStyle = '#1f1f24'; caber(linha3 || 'Duvido tu bater!', 92, 900);
    g.fillText(linha3 || 'Duvido tu bater!', 540, Math.min(y + 95, 1405));

    // rodapé: onde jogar + como jogar + me marca
    const bx = 110, bw = W - 220, by = 1475, bh = 330;
    g.save(); g.translate(540, by + bh / 2); g.rotate(-0.012); g.translate(-540, -(by + bh / 2));
    g.fillStyle = 'rgba(31,31,36,.14)'; g.fillRect(bx + 10, by + 12, bw, bh);
    g.fillStyle = '#fff'; g.fillRect(bx, by, bw, bh);
    g.strokeStyle = '#1f1f24'; g.lineWidth = 5; g.strokeRect(bx, by, bw, bh);
    g.fillStyle = 'rgba(255,210,63,.9)'; g.fillRect(540 - 120, by - 30, 240, 56);
    g.fillStyle = '#1f1f24'; g.font = F(46); g.fillText('JOGA GRÁTIS', 540, by + 12);
    const end = CA.enderecoJogo();
    g.fillStyle = '#1d4ed8'; caber(end, 68, bw - 50); g.fillText(end, 540, by + 115);
    g.strokeStyle = 'rgba(29,78,216,.5)'; g.lineWidth = 4;
    const lw = Math.min(g.measureText(end).width, bw - 50);
    g.beginPath(); g.moveTo(540 - lw / 2, by + 130); g.lineTo(540 + lw / 2, by + 130); g.stroke();
    const como = comoJoga || 'Abre o link e tenta bater meu tempo';
    g.fillStyle = '#55555c'; caber(como, 50, bw - 60); g.fillText(como, 540, by + 205);
    g.fillStyle = '#1f1f24'; caber('Me marca @Cardeno_Amarelo que eu reposto!', 58, bw - 60);
    g.fillText('Me marca @Cardeno_Amarelo que eu reposto!', 540, by + 285);
    g.restore();
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
    CA.aviso('Imagem salva! Link copiado: cola no adesivo de link 📸');
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
        ${r.amigo.placar ? `<b class="placar-duelo">${r.amigo.placar}</b>` : ''}
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
          ${r.desafio ? `<button class="btn btn-grande ${r.proxima ? 'btn-claro' : ''}" data-a="desafiar">Desafiar um amigo</button>` : ''}
          ${r.card ? `<button class="btn btn-grande btn-claro" data-a="card">Postar nos stories</button>
          <p class="dica-card">Posta e me marca <b>@Cardeno_Amarelo</b> que eu reposto ✨</p>` : ''}
          <button class="btn btn-grande btn-claro" data-a="denovo">Jogar de novo</button>
          <a class="link-voltar" href="${(r.linkVoltar || {}).href || '#/jogo?id=acha'}">${(r.linkVoltar || {}).txt || 'Ver todas as fases'}</a>
        </div>
        ${CA.ehPremium() ? '' : `<a class="chamada-premium" href="#/premium">
          <strong>Caderno Premium</strong>
          <span>Libera todos os níveis de todos os jogos, os desafios dos dias anteriores e o card dourado. Mensal R$ 4,90 ou anual R$ 29,90.</span>
        </a>`}
      </section>`);
    tela.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      if (b.dataset.a === 'desafiar') CA.compartilhar(r.desafio.texto, r.desafio.url);
      if (b.dataset.a === 'card') {
        b.disabled = true;
        // copia o link junto, pra colar no adesivo de link do Instagram
        try { navigator.clipboard.writeText('https://' + CA.enderecoJogo() + '/').catch(() => {}); } catch (e) {}
        CA.mandarCard(r.card).finally(() => { b.disabled = false; });
      }
      if (b.dataset.a === 'denovo') r.jogarDeNovo();
    });
    return tela;
  };
})();
