/* Guarda o app no celular pra abrir rápido e até sem internet.
   Ao mudar qualquer arquivo do app, sobe a VERSAO. */
const VERSAO = 'ca-jogos-v14';
const ARQUIVOS = [
  './', 'index.html', 'jogos.css', 'manifest.webmanifest',
  'js/nucleo.js', 'js/niveis.js', 'js/acha.js', 'js/cor.js', 'js/rapido.js', 'js/charadas.js', '../assets/js/desafios-dados.js', 'js/premium.js', 'js/ranking.js', 'js/app.js', '../assets/js/config.js',
  'icones/icone-192.png', 'icones/icone-512.png', '../assets/fonts/Caveat-Bold.ttf',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('ca-jogos-') && k !== VERSAO).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Rede primeiro (pega novidade), cache se estiver sem internet.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copia = r.clone();
      caches.open(VERSAO).then(c => c.put(e.request, copia)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
