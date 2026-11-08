/* Service worker : le module marche sans connexion.
   Stratégie : on sert la copie en cache tout de suite, puis on la met à jour en arrière-plan.
   Pour forcer une mise à jour chez tout le monde, change VERSION. Aucune donnée personnelle n'est mise en cache. */
'use strict';
const VERSION = 'cm-v15';
const FICHIERS = ['./', './index.html', './manifest.webmanifest', './theme.js', './formation.css', './sources.js', './contenu.js', './contenu-apprendre.js', './contenu-entrainer.js',
  './contenu-business.js', './contenu-clients.js', './contenu-bonus.js', './contenu-reseaux.js', './contenu-calculs.js', './contenu-expert.js', './contenu-expert-2.js', './scenarios.js', './ressources.js', './gestion.js', './pourcentages.js', './kit.js', './data/veille.json', './moteur.js', './formation.js',
  './fonts/ibm-plex-sans-400.woff2', './fonts/ibm-plex-sans-600.woff2', './fonts/chakra-petch-600.woff2', './fonts/chakra-petch-700.woff2', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(noms => Promise.all(noms.filter(n => n !== VERSION).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // les taux BCE passent directement par le réseau
  if (url.pathname.endsWith('/data/veille.json')) { // la veille : réseau d'abord, copie en cache hors connexion
    e.respondWith(caches.open(VERSION).then(async cache => {
      try { const rep = await fetch(req, { cache: 'no-cache' }); if (rep && rep.ok) { cache.put(req, rep.clone()); return rep; } } catch (_) { /* hors connexion */ }
      return (await cache.match(req, { ignoreSearch: true })) || Response.error();
    }));
    return;
  }
  e.respondWith(caches.open(VERSION).then(async cache => {
    const cache1 = await cache.match(req, { ignoreSearch: true });
    const reseau = fetch(req).then(rep => { if (rep && rep.ok) cache.put(req, rep.clone()); return rep; }).catch(() => null);
    if (cache1) { e.waitUntil(reseau); return cache1; }
    const rep = await reseau;
    if (rep) return rep;
    if (req.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
    return Response.error();
  }));
});
