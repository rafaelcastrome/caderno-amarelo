/* Funil de venda (anônimo). Grava eventos na tabela eventos_funil do Supabase.
   Nada pessoal: só um id aleatório do aparelho (localStorage), o evento, um detalhe curto
   (jogo, nível, plano, produto, origem, página) e se está no navegador do Instagram.
   gerou_pix e pagou são gravados no servidor (criar-pix e webhook). Uso: Funil.ev('abriu_loja', { ... }). */
(function () {
  'use strict';
  const CFG = window.LOJA_CONFIG || {};
  const CHAVE = 'ca-funil:sessao';
  const novoId = () => (crypto.randomUUID ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)));
  function sessao() {
    try {
      let s = localStorage.getItem(CHAVE);
      if (!/^[0-9a-f-]{36}$/i.test(s || '')) { s = novoId(); localStorage.setItem(CHAVE, s); }
      return s;
    } catch (e) { return window.__caSessao || (window.__caSessao = novoId()); }
  }
  const ig = /Instagram/i.test(navigator.userAgent || '');
  const CAMPOS = ['jogo', 'nivel', 'plano', 'produto', 'origem', 'pagina', 'valor'];
  const ja = new Set(); // não repete o mesmo evento+detalhe na mesma página aberta

  function ev(evento, detalhe) {
    try {
      const d = {};
      for (const k of CAMPOS) if (detalhe && detalhe[k] != null) d[k] = typeof detalhe[k] === 'number' ? detalhe[k] : String(detalhe[k]).slice(0, 40);
      const chave = evento + JSON.stringify(d);
      if (ja.has(chave)) return;
      ja.add(chave);
      if (!CFG.supabaseUrl || /^(localhost|127\.)/.test(location.hostname)) return;
      fetch(CFG.supabaseUrl + '/rest/v1/eventos_funil', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + CFG.supabaseAnonKey, Prefer: 'return=minimal' },
        body: JSON.stringify({ sessao: sessao(), evento, detalhe: d, navegador_ig: ig }),
      }).catch(() => {});
    } catch (e) { /* medir nunca pode quebrar o site */ }
  }

  // abriu_site: uma vez por dia por aparelho (o funil conta pessoas por dia)
  function abriuSite(pagina) {
    try {
      const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
      if (localStorage.getItem('ca-funil:site') === hoje) return;
      localStorage.setItem('ca-funil:site', hoje);
    } catch (e) { /* segue */ }
    ev('abriu_site', { pagina });
  }

  window.Funil = { ev, sessao, ig, abriuSite };
})();
