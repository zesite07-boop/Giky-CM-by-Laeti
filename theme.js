/* Applique le thème du système avant l'affichage pour limiter le flash blanc en mode sombre.
   Le choix enregistré (clair ou sombre) est appliqué ensuite par formation.js. */
(function () {
  'use strict';
  var sombre = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', sombre ? 'sombre' : 'clair');
}());
