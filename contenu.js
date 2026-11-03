/* Structure du module : parcours et métadonnées. Les leçons sont ajoutées par contenu-*.js. */
(function (root) {
  'use strict';
  const C = root.CMContenu = root.CMContenu || { lecons: [] };
  C.version = '1.0.0';
  C.revue = '3 novembre 2026';
  C.titre = 'Community manager freelance';
  C.parcours = [
    { id: 'apprendre', nom: 'Apprendre le métier', court: 'Les bases solides', badge: 'Fondations', image: 'Le tutoriel du jeu : on apprend les commandes.' },
    { id: 'entrainer', nom: 'S’entraîner sur des missions', court: 'Des cas réels', badge: 'Missions accomplies', image: 'Les quêtes : chaque mission te fait monter de niveau.' },
    { id: 'business', nom: 'Piloter mon business', court: 'Statut, prix, impôts', badge: 'Gestionnaire', image: 'L’inventaire : tu sais ce que tu as et ce que tu dois.' },
    { id: 'clients', nom: 'Décrocher des clients', court: 'Prospecter et signer', badge: 'Recrutement', image: 'Le multijoueur : tu formes ton équipe de clients.' },
    { id: 'final', nom: 'Épreuve finale', court: 'Le boss de fin', badge: 'Module validé', image: 'Le boss de fin : tout ce que tu as appris, en situation.' }
  ];
}(typeof globalThis !== 'undefined' ? globalThis : this));
