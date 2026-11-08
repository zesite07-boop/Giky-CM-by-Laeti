/* Structure du module : parcours et métadonnées. Les leçons sont ajoutées par contenu-*.js. */
(function (root) {
  'use strict';
  const C = root.CMContenu = root.CMContenu || { lecons: [] };
  C.version = '1.0.0';
  C.revue = '3 novembre 2026';
  C.titre = 'Community manager freelance';
  /* Niveaux de difficulté : 1 Facile, 2 Intermédiaire, 3 Difficile, 4 Expert.
     Une leçon sans champ « niveau » prend le niveau de son parcours (Apprendre : 1, les autres : 2). */
  C.niveaux = { 1: 'Facile', 2: 'Intermédiaire', 3: 'Difficile', 4: 'Expert' };
  C.niveauDe = l => l.niveau || (l.parcours === 'apprendre' || l.parcours === 'calculs' ? 1 : 2);
  /* Mélange déterministe des options (graine = identifiant de la question) : la bonne réponse
     ne tombe pas toujours au même rang, et les réponses déjà enregistrées restent valides au rechargement. */
  C.melanger = lecons => {
    for (const l of lecons) for (const q of l.questions) {
      if (q.type === 'nombre' || q.melange) continue;
      let h = 2166136261;
      for (const c of q.id) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
      const hasard = () => (h = (Math.imul(h, 1664525) + 1013904223) >>> 0) / 4294967296;
      const ordre = q.options.map((_, i) => i);
      for (let i = ordre.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); [ordre[i], ordre[j]] = [ordre[j], ordre[i]]; }
      q.options = ordre.map(i => q.options[i]); q.retours = ordre.map(i => q.retours[i]);
      q.bonne = Array.isArray(q.bonne) ? q.bonne.map(b => ordre.indexOf(b)).sort((a, b) => a - b) : ordre.indexOf(q.bonne);
      q.melange = true;
    }
  };
  C.parcours = [
    { id: 'apprendre', nom: 'Apprendre le métier', court: 'Les bases solides', badge: 'Fondations', image: 'Le tutoriel du jeu : on apprend les commandes.' },
    { id: 'calculs', nom: 'Les pourcentages, enfin clairs', court: 'Formules, calculatrice, calcul de tête', badge: 'Calculatrice maîtrisée', image: 'La barre de stats : tu lis enfin les chiffres de ton personnage.' },
    { id: 'entrainer', nom: 'S’entraîner sur des missions', court: 'Des cas réels', badge: 'Missions accomplies', image: 'Les quêtes : chaque mission te fait monter de niveau.' },
    { id: 'business', nom: 'Piloter mon business', court: 'Statut, prix, impôts', badge: 'Gestionnaire', image: 'L’inventaire : tu sais ce que tu as et ce que tu dois.' },
    { id: 'clients', nom: 'Décrocher des clients', court: 'Prospecter et signer', badge: 'Recrutement', image: 'Le multijoueur : tu formes ton équipe de clients.' },
    { id: 'expert', nom: 'Défis de pro', court: 'Cas difficiles, niveau confirmé', badge: 'Pro confirmé', image: 'Le mode difficile : les situations qu’on ne trouve qu’après des années de métier.' },
    { id: 'final', nom: 'Épreuve finale', court: 'Le boss de fin', badge: 'Module validé', image: 'Le boss de fin : tout ce que tu as appris, en situation.' }
  ];
}(typeof globalThis !== 'undefined' ? globalThis : this));
