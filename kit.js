/* Kit de prospection : génère le message, les pièces du portfolio, les 3 offres et le plan de relances,
   adaptés au type de client et au type de demande. Aucune donnée n’est envoyée : tout est calculé dans le navigateur.
   Les textes sont des modèles à relire et à personnaliser avant l’envoi. */
(function (root, factory) {
  'use strict';
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.CMKit = data;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const TYPES_CLIENT = {
    'streamer-petit': { nom: 'Petit streamer (moins de 100 spectateurs)', vous: false },
    'streamer-moyen': { nom: 'Streamer confirmé (100 à 1 000 spectateurs)', vous: false },
    'streamer-gros': { nom: 'Gros streamer ou structure', vous: true },
    'marque': { nom: 'Marque ou agence', vous: true },
    'orga': { nom: 'Organisateur d’événement ou de tournoi', vous: true },
    'team': { nom: 'Équipe e-sport', vous: true }
  };
  const DEMANDES = {
    'complet': 'Gestion complète des réseaux',
    'clips': 'Clips et formats courts',
    'discord': 'Animation et modération (Discord, chat)',
    'calendrier': 'Ligne éditoriale et calendrier',
    'audit': 'Audit ponctuel',
    'event': 'Communication d’un événement'
  };

  /* Chaque phrase existe en tutoiement et en vouvoiement. */
  const ACCROCHE = {
    'streamer-petit': { tu: 'J’ai regardé ta chaîne {chaine} : l’ambiance est là, et c’est ce qui fait qu’une petite communauté devient fidèle.', vous: 'J’ai regardé votre chaîne {chaine} : l’ambiance est là, et c’est ce qui fait qu’une petite communauté devient fidèle.' },
    'streamer-moyen': { tu: 'Je suis {chaine} et j’aime la façon dont ta communauté réagit en direct. Il y a de la matière pour que tes meilleurs moments tournent plus loin que ton live.', vous: 'Je suis {chaine} et j’apprécie la façon dont votre communauté réagit en direct. Il y a de la matière pour que vos meilleurs moments tournent plus loin que votre live.' },
    'streamer-gros': { tu: 'Avec l’audience de {chaine}, chaque semaine produit plus de moments que tu ne peux en publier.', vous: 'Avec l’audience de {chaine}, chaque semaine produit plus de moments que vous ne pouvez en publier.' },
    'marque': { tu: 'Votre présence auprès des créateurs sur Twitch gagne à être portée par quelqu’un qui connaît les codes de la plateforme.', vous: 'Votre présence auprès des créateurs sur Twitch gagne à être portée par quelqu’un qui connaît les codes de la plateforme.' },
    'orga': { tu: 'Un événement comme {chaine} se joue aussi avant et après le direct : annonces, rappels, résumés.', vous: 'Un événement comme {chaine} se joue aussi avant et après le direct : annonces, rappels, résumés.' },
    'team': { tu: 'Une équipe comme {chaine} produit des moments forts qui méritent d’être vus hors des matchs.', vous: 'Une équipe comme {chaine} produit des moments forts qui méritent d’être vus hors des matchs.' }
  };

  /* Par type de demande : proposition, pièces de portfolio, contenu des 3 offres. */
  const DEMANDE = {
    'complet': {
      proposition: { tu: 'Je peux prendre en charge tes réseaux de bout en bout : planning, publications, clips, réponses à la communauté et bilan mensuel.', vous: 'Je peux prendre en charge vos réseaux de bout en bout : planning, publications, clips, réponses à la communauté et bilan mensuel.' },
      pieces: ['Une étude de cas : avant, ce que j’ai fait, après (chiffres)', 'Un exemple de calendrier éditorial sur un mois', 'Un rapport mensuel type (2 pages)', 'Trois publications de référence avec leurs résultats'],
      offres: [['Essentiel', ['3 publications par semaine', 'Programmation', 'Bilan mensuel court']], ['Régulier', ['5 publications par semaine', 'Clips verticaux sous-titrés', 'Réponses à la communauté', 'Bilan mensuel']], ['Complet', ['Tout Régulier', 'Planning stratégique trimestriel', 'Gestion des partenariats', 'Point hebdomadaire']]]
    },
    'clips': {
      proposition: { tu: 'Je transforme tes lives en clips verticaux courts, sous-titrés, prêts pour TikTok, Shorts et Reels, avec un titre qui donne envie de venir sur ta chaîne.', vous: 'Je transforme vos lives en clips verticaux courts, sous-titrés, prêts pour TikTok, Shorts et Reels, avec un titre qui donne envie de venir sur votre chaîne.' },
      pieces: ['Trois clips avant/après (brut puis monté)', 'Un exemple de sous-titrage et de titre', 'Les chiffres d’un clip qui a bien tourné', 'Ma règle de choix du moment (une page)'],
      offres: [['Essentiel', ['4 clips par mois', 'Format vertical', 'Sous-titres']], ['Régulier', ['10 clips par mois', 'Sous-titres et titres', 'Publication sur 2 plateformes']], ['Complet', ['20 clips par mois', 'Publication et programmation', 'Bilan des clips qui marchent']]]
    },
    'discord': {
      proposition: { tu: 'Je m’occupe de l’animation et de la modération de ta communauté : accueil des nouveaux, règles claires, rendez-vous réguliers et gestion des conflits.', vous: 'Je m’occupe de l’animation et de la modération de votre communauté : accueil des nouveaux, règles claires, rendez-vous réguliers et gestion des conflits.' },
      pieces: ['Un exemple de charte et de règles de serveur', 'Ma grille de modération (avertir, mute, bannir)', 'Un calendrier d’animations sur un mois', 'Des chiffres d’activité avant/après sur un serveur géré'],
      offres: [['Essentiel', ['Modération aux heures de live', 'Règles et accueil']], ['Régulier', ['Modération et animation hebdomadaire', 'Rapport mensuel d’activité']], ['Complet', ['Animation quotidienne', 'Équipe de modérateurs formée', 'Gestion de crise']]]
    },
    'calendrier': {
      proposition: { tu: 'Je construis ta ligne éditoriale et un calendrier clair : quoi publier, quand, avec quel ton, pour que tu saches toujours quoi faire sans te creuser la tête.', vous: 'Je construis votre ligne éditoriale et un calendrier clair : quoi publier, quand, avec quel ton, pour que vous sachiez toujours quoi faire sans y réfléchir à chaque fois.' },
      pieces: ['Un exemple de piliers de contenu', 'Un calendrier éditorial d’un mois', 'Un modèle de bilan mensuel', 'Une fiche de ton et de style'],
      offres: [['Essentiel', ['Ligne éditoriale en 3 piliers', 'Calendrier du mois']], ['Régulier', ['Ligne éditoriale', 'Calendrier du trimestre', 'Modèles de publications']], ['Complet', ['Tout Régulier', 'Atelier de prise en main', 'Suivi mensuel pendant 3 mois']]]
    },
    'audit': {
      proposition: { tu: 'Je fais l’audit de tes réseaux et de ta chaîne : ce qui marche, ce qui bloque, et trois actions à lancer dès la semaine prochaine.', vous: 'Je fais l’audit de vos réseaux et de votre chaîne : ce qui marche, ce qui bloque, et trois actions à lancer dès la semaine prochaine.' },
      pieces: ['Un audit anonymisé en exemple', 'Ma grille d’analyse (une page)', 'Un plan d’actions type à 30 jours'],
      offres: [['Essentiel', ['Audit d’une plateforme', 'Synthèse de 2 pages']], ['Régulier', ['Audit de 3 plateformes', 'Plan d’actions à 30 jours']], ['Complet', ['Audit complet', 'Plan à 90 jours', 'Restitution en visio']]]
    },
    'event': {
      proposition: { tu: 'Je gère la communication de ton événement : annonces, rappels, direct sur les réseaux, résumés et remerciements.', vous: 'Je gère la communication de votre événement : annonces, rappels, direct sur les réseaux, résumés et remerciements.' },
      pieces: ['Un plan de communication d’événement type', 'Un exemple de rétroplanning (J-30 à J+7)', 'Des publications live en exemple', 'Un bilan d’événement chiffré'],
      offres: [['Essentiel', ['Rétroplanning', 'Annonces avant l’événement']], ['Régulier', ['Rétroplanning', 'Couverture le jour J', 'Résumé après l’événement']], ['Complet', ['Communication de J-30 à J+7', 'Équipe sur place ou à distance', 'Bilan chiffré']]]
    }
  };

  const CTA = {
    'streamer-petit': { tu: 'Si tu veux, on en parle dix minutes cette semaine, sans engagement : tu me dis ce qui te prend du temps, je te dis ce que je peux en faire.', vous: 'Si vous le souhaitez, on en parle dix minutes cette semaine, sans engagement.' },
    'streamer-moyen': { tu: 'Dis-moi quand tu as 15 minutes cette semaine : je te présente le kit et on regarde ce qui te ferait gagner le plus de temps.', vous: 'Dites-moi quand vous avez 15 minutes cette semaine : je vous présente le kit.' },
    'streamer-gros': { tu: 'Je peux vous présenter mon fonctionnement en 20 minutes, avec un exemple de livrable sur vos propres contenus.', vous: 'Je peux vous présenter mon fonctionnement en 20 minutes, avec un exemple de livrable sur vos propres contenus.' },
    'marque': { tu: 'Je peux vous présenter la méthode en 20 minutes et vous envoyer un exemple de reporting.', vous: 'Je peux vous présenter la méthode en 20 minutes et vous envoyer un exemple de reporting.' },
    'orga': { tu: 'Pouvons-nous caler un échange rapide avant la date limite de vos annonces ?', vous: 'Pouvons-nous caler un échange rapide avant la date limite de vos annonces ?' },
    'team': { tu: 'Avez-vous 20 minutes cette semaine pour que je vous montre un exemple sur un de vos matchs ?', vous: 'Avez-vous 20 minutes cette semaine pour que je vous montre un exemple sur un de vos matchs ?' }
  };

  const OUVERT = { tu: 'Salut', vous: 'Bonjour' };
  const FIN = { tu: 'À très vite,', vous: 'Bien cordialement,' };

  function remplir(s, k) { return s.replace(/\{chaine\}/g, k.chaine || 'votre chaîne'); }
  function ton(k) { return k.ton === 'tu' ? 'tu' : k.ton === 'vous' ? 'vous' : (TYPES_CLIENT[k.typeClient] || TYPES_CLIENT['streamer-moyen']).vous ? 'vous' : 'tu'; }
  function euro(n) { return Math.round(Number(n) * 100) / 100; }
  function fr(n) { return euro(n).toLocaleString('fr-FR', { maximumFractionDigits: 2 }).replace(/ | /g, ' '); }
  function ajouterJours(iso, j) { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + j); return d.toISOString().slice(0, 10); }

  function mentions(k) {
    const base = k.tva === 'tva' ? 'Prix en euros hors taxes, TVA de 20 % en sus.' : 'Prix nets en euros, TVA non applicable (art. 293 B du CGI).';
    return `${base} Devis valable ${k.validite} jours. Acompte de ${k.acompte} % à la signature, solde à ${k.delai} jours.`;
  }

  function relances(k, t) {
    const nom = k.contact ? ` ${k.contact}` : '';
    const sign = `${k.moi || ''}${k.marque ? ' · ' + k.marque : ''}`;
    const o = OUVERT[t];
    return [
      { j: 3, titre: 'Relance courte', texte: `${o}${nom},\n\n${t === 'tu' ? 'Je me permets de remonter mon message de la semaine dernière : as-tu pu jeter un œil au kit ?' : 'Je me permets de remonter mon message de la semaine dernière : avez-vous pu jeter un œil au kit ?'}\nUne question suffit, je reste disponible.\n\n${sign}` },
      { j: 7, titre: 'Relance avec de la valeur', texte: `${o}${nom},\n\n${t === 'tu' ? 'Pour ne pas te relancer pour rien, voici une idée concrète que tu peux utiliser tout de suite' : 'Pour ne pas vous relancer pour rien, voici une idée concrète que vous pouvez utiliser tout de suite'} : [une idée de contenu précise sur ${k.chaine || 'ta chaîne'}, par exemple un moment à clipper ou une publication à programmer].\n${t === 'tu' ? 'Si ça te parle, on peut aller plus loin.' : 'Si cela vous convient, on peut aller plus loin.'}\n\n${sign}` },
      { j: 14, titre: 'Clôture polie', texte: `${o}${nom},\n\n${t === 'tu' ? 'Je n’ai pas eu de retour, je suppose que ce n’est pas le bon moment, et c’est très bien. Je clos le sujet de mon côté ; mon offre reste valable si tu changes d’avis.' : 'Je n’ai pas eu de retour, je suppose que ce n’est pas le bon moment, et c’est très bien. Je clos le sujet de mon côté ; mon offre reste valable si vous changez d’avis.'}\n\n${sign}` }
    ];
  }

  const CAS = [
    ['Pas de réponse après 7 jours', 'Tu envoies la relance avec de la valeur, puis la clôture à J+14. Jamais plus de trois messages.'],
    ['« C’est trop cher »', 'Ne baisse pas ton prix : propose l’offre en dessous, ou retire un élément. Demande : « Quel budget aviez-vous en tête ? »'],
    ['« Je vais y réfléchir »', 'Propose une date : « Je vous recontacte jeudi, ça vous convient ? », puis mets-la dans ton agenda.'],
    ['« Oui, on y va »', 'Envoie le devis et le contrat dans l’heure, avec l’acompte. Fixe la date de démarrage.']
  ];

  function genererKit(k) {
    const t = ton(k), d = DEMANDE[k.demande] || DEMANDE.complet, type = TYPES_CLIENT[k.typeClient] ? k.typeClient : 'streamer-moyen';
    const prix = [k.offre1, k.offre2, k.offre3];
    const offres = d.offres.map(([nom, contenu], i) => ({ nom, prix: euro(prix[i]), contenu }));
    const nom = k.contact ? ` ${k.contact}` : '';
    const preuve = k.preuve && k.preuve.trim() ? ['', k.preuve.trim()] : [];
    const sign = [k.moi, k.marque, k.portfolio, k.email].filter(Boolean).join('\n');
    const message = [`${OUVERT[t]}${nom},`, '', remplir(ACCROCHE[type][t], k), '', d.proposition[t], ...preuve,
      '', `${t === 'tu' ? 'Je t’ai préparé' : 'Je vous ai préparé'} un kit court : ${d.pieces.length} pièces de portfolio et 3 offres claires, de ${fr(prix[0])} € à ${fr(prix[2])} €.`,
      '', CTA[type][t], '', FIN[t], sign].join('\n').replace(/\n{3,}/g, '\n\n');
    const objet = (type === 'marque' || type === 'orga' || type === 'team') ? `Proposition : ${DEMANDES[k.demande] || ''}${k.chaine ? ' · ' + k.chaine : ''}` : `${k.chaine ? k.chaine + ' : u' : 'U'}ne idée pour ${k.demande === 'clips' ? 'tes clips' : k.demande === 'discord' ? 'ta communauté' : 'tes réseaux'}`;
    return { objet, message, portfolio: d.pieces.slice(), offres, mentions: mentions(k), suivi: relances(k, t), cas: CAS.map(c => c.slice()), tonUtilise: t };
  }

  function textePortfolio(g) { return g.portfolio.map((p, i) => `${i + 1}. ${p}`).join('\n'); }
  function texteOffres(g, k) {
    return g.offres.map(o => `${o.nom} · ${fr(o.prix)} €${k.tva === 'tva' ? ' HT' : ''}\n${o.contenu.map(c => '  - ' + c).join('\n')}`).join('\n\n') + '\n\n' + g.mentions;
  }
  function datesSuivi(iso) { return [3, 7, 14].map(j => ({ j, date: ajouterJours(iso, j) })); }
  const TITRES = ['Relance courte', 'Relance avec de la valeur', 'Clôture polie'];
  /* Prochaine relance due pour un kit suivi : `faites` relances déjà envoyées (0 à 3). Retourne null si rien à faire. */
  function relanceDue(envoi, faites, statut, auj) {
    if (!['envoye', 'relance'].includes(statut) || faites >= 3) return null;
    const dates = datesSuivi(envoi), prochaine = dates[faites];
    return { index: faites, j: prochaine.j, date: prochaine.date, titre: TITRES[faites], due: prochaine.date <= auj, retard: prochaine.date < auj };
  }

  return { TYPES_CLIENT, DEMANDES, genererKit, textePortfolio, texteOffres, datesSuivi, relanceDue, ajouterJours, ton };
}));
