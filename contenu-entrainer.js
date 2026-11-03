/* Parcours 2 — S'entraîner sur des missions (M1 à M6). */
(function (root) {
  'use strict';
  const C = root.CMContenu = root.CMContenu || { lecons: [] };
  C.lecons.push(
{
  id: 'm1', code: 'M1', parcours: 'entrainer', titre: 'Mission : lancer une chaîne Twitch', duree: '12 min',
  court: 'Un nouveau streamer, zéro communauté, un mois pour poser les bases.',
  objectif: 'Construire un plan de lancement sur 4 semaines avec des étapes mesurables.',
  situation: 'Hugo lance sa chaîne de jeux de stratégie. 12 followers, aucun planning, un Discord vide. Budget : 400 € par mois.',
  cours: [
    ['Semaine 1 : fondations', 'Planning fixe (2 à 3 lives), panneaux de chaîne, règles du chat, Discord avec 4 salons maximum.'],
    ['Semaines 2 et 3 : régularité', 'Annonce avant chaque live, un clip le lendemain, participation aux chats de chaînes proches (sans spam).'],
    ['Semaine 4 : premier bilan', 'Trois indicateurs comparés à la semaine 1, une décision pour le mois suivant.']
  ],
  memo: 'Lancer, c’est d’abord rendre la chaîne prévisible : planning, règles, rendez-vous.',
  defi: 'Écris le plan de lancement de 4 semaines pour un vrai prospect.',
  sources: ['twitchCG'],
  questions: [
    { id: 'm1q1', type: 'choix', titre: 'Priorité 1', texte: 'Par quoi commences-tu ?',
      options: ['Une campagne de pub payante.', 'Un planning fixe et des règles de chat.', 'Un logo animé à 300 €.'],
      retours: ['Sans rendez-vous fixe, la pub amène des gens qui ne reviennent pas.', 'La base : un rendez-vous et un cadre.', 'Joli, mais pas prioritaire avec 400 €.'],
      bonne: 1, explication: 'On rend la chaîne prévisible avant d’attirer du monde.' },
    { id: 'm1q2', type: 'choix', critique: true, titre: 'Raccourci', texte: 'Hugo propose d’acheter 500 viewers pour « faire décoller » la chaîne.',
      options: ['Tu acceptes.', 'Tu refuses : c’est du viewbotting, interdit par Twitch, avec un risque de suspension.', 'Tu acceptes mais sans le dire.'],
      retours: ['Risque de suspension et engagement nul.', 'Tu protèges la chaîne.', 'Pire encore.'],
      bonne: 1, explication: 'Erreur critique : gonfler artificiellement l’audience.' },
    { id: 'm1q3', type: 'nombre', titre: 'Taux horaire', texte: 'Tu passes 16 heures par mois pour 400 €. Combien gagnes-tu de l’heure (avant cotisations) ?',
      bonne: 25, tolerance: 0, unite: '€/h', explication: '400 / 16 = 25 € de l’heure, avant cotisations et frais.' }
  ]
},
{
  id: 'm2', code: 'M2', parcours: 'entrainer', titre: 'Mission : raid haineux en direct', duree: '12 min',
  court: 'Des dizaines de comptes inondent le chat d’insultes. Tu as 2 minutes.',
  objectif: 'Appliquer une procédure de crise de modération dans le bon ordre.',
  situation: 'Ta cliente est en live. 60 comptes créés aujourd’hui arrivent et inondent le chat de messages haineux.',
  cours: [
    ['Couper le flux', 'Twitch propose des outils pour ces attaques : chat réservé aux followers depuis une durée minimum, mode lent, AutoMod renforcé, vérification par téléphone ou mail, effacement du chat.'],
    ['Protéger la streameuse', 'Message privé court : « On gère, tu peux faire une pause. » Elle décide de continuer ou de couper.'],
    ['Après la crise', 'Bannir les comptes, signaler à Twitch, garder les captures. Si menaces graves ou contenu illicite : signalement Pharos ; en cas de danger immédiat, appeler le 17.']
  ],
  memo: 'Couper (followers-only, slow, AutoMod) → protéger → bannir et signaler → documenter.',
  defi: 'Écris ta procédure « raid haineux » en 6 lignes et partage-la avec tes modérateurs.',
  sources: ['twitchAttaques', 'twitchModeration', 'pharos', 'cyberharcelement'],
  questions: [
    { id: 'm2q1', type: 'choix', critique: true, titre: 'Premier geste', texte: 'Quel est ton premier geste ?',
      options: ['Répondre aux insultes une par une.', 'Activer le mode followers-only avec une durée, le mode lent et l’AutoMod renforcé.', 'Attendre la fin du live.'],
      retours: ['Tu nourris l’attaque et tu perds du temps.', 'Tu coupes le flux tout de suite.', 'La streameuse subit l’attaque en direct.'],
      bonne: 1, explication: 'Erreur critique : ne pas couper le flux d’une attaque.' },
    { id: 'm2q2', type: 'multiple', titre: 'Après', texte: 'Que fais-tu après la crise ? (3 réponses)',
      options: ['Bannir les comptes', 'Signaler à Twitch', 'Publier les pseudos pour les humilier', 'Garder les captures', 'Supprimer toutes les traces'],
      retours: ['Oui.', 'Oui.', 'Non : tu alimentes le conflit.', 'Oui : preuves.', 'Non : tu perds les preuves.'],
      bonne: [0, 1, 3], explication: 'Sanctionner, signaler, documenter.' },
    { id: 'm2q3', type: 'choix', critique: true, titre: 'Menace grave', texte: 'Un message contient l’adresse de la streameuse et une menace de venir chez elle.',
      options: ['Tu le supprimes et tu continues.', 'Captures, ban, signalement à Twitch, tu préviens la streameuse ; danger immédiat : 17, puis plainte et signalement.', 'Tu publies l’affaire sur X pour alerter.'],
      retours: ['La menace reste réelle.', 'Sécurité de la personne d’abord, preuves ensuite.', 'Tu diffuses encore son adresse.'],
      bonne: 1, explication: 'Erreur critique : banaliser une menace physique.' }
  ]
},
{
  id: 'm3', code: 'M3', parcours: 'entrainer', titre: 'Mission : annonce d’un jeu vidéo', duree: '10 min',
  court: 'Un studio indé annonce son jeu en live. Tout doit être prêt avant.',
  objectif: 'Préparer un dispositif d’annonce avant, pendant et après.',
  situation: 'Un studio de 4 personnes révèle la bande-annonce de son jeu vendredi à 18 h sur Twitch. Tu es en charge des réseaux.',
  cours: [
    ['Avant', 'Compte à rebours sur 5 jours, visuels validés, liens prêts (page du jeu, liste de souhaits), réponses aux questions fréquentes rédigées.'],
    ['Pendant', 'Un modérateur dédié au chat, toi sur les réseaux : posts programmés à l’heure exacte, clips de la bande-annonce.'],
    ['Après', 'Remercier, relayer les réactions, mesurer : vues, ajouts en liste de souhaits, nouveaux membres Discord.']
  ],
  memo: 'Tout ce qui peut être écrit avant l’est : posts, réponses, liens.',
  defi: 'Écris la FAQ de 5 questions qu’un public pose à l’annonce d’un jeu.',
  sources: ['inpiAuteur'],
  questions: [
    { id: 'm3q1', type: 'choix', titre: 'Embargo', texte: 'Un journaliste te demande la bande-annonce 2 jours avant, « pour préparer son article ».',
      options: ['Tu l’envoies, c’est de la visibilité.', 'Tu demandes l’accord du studio et tu fixes un embargo écrit.', 'Tu la publies toi-même en avance.'],
      retours: ['Fuite possible, décision qui ne t’appartient pas.', 'Le studio décide ; l’embargo protège la date.', 'Tu casses l’annonce.'],
      bonne: 1, explication: 'La date d’annonce appartient au client.' },
    { id: 'm3q2', type: 'choix', titre: 'Musique', texte: 'Le studio veut une musique à la mode sur le teaser TikTok.',
      options: ['Tu la prends sur YouTube.', 'Tu utilises une musique sous licence ou la bande-son du jeu.', 'Tu baisses le volume pour que ça passe.'],
      retours: ['Œuvre protégée sans autorisation.', 'Droits maîtrisés.', 'Le volume ne change rien aux droits.'],
      bonne: 1, explication: 'La musique est une œuvre protégée.' },
    { id: 'm3q3', type: 'nombre', titre: 'Compte à rebours', texte: 'Annonce le vendredi. Tu publies un post par jour du lundi au vendredi inclus. Combien de posts ?',
      bonne: 5, tolerance: 0, unite: 'posts', explication: 'Lundi, mardi, mercredi, jeudi, vendredi : 5 posts.' }
  ]
},
{
  id: 'm4', code: 'M4', parcours: 'entrainer', titre: 'Mission : une marque hors jeu vidéo', duree: '10 min',
  court: 'Transférer tes compétences Twitch à une marque grand public.',
  objectif: 'Adapter ta méthode à un client qui ne connaît pas Twitch.',
  situation: 'Une marque de boissons veut « être sur Twitch » et te demande un plan. Elle n’a jamais travaillé avec des streamers.',
  cours: [
    ['Traduire', 'Explique Twitch avec leurs mots : « des émissions en direct, avec un public qui parle à l’animateur ». Pas de jargon au premier rendez-vous.'],
    ['Choisir les bons streamers', 'Affinité avec la marque, public compatible (âge, centres d’intérêt), historique propre. Le nombre de followers n’est pas le premier critère.'],
    ['Cadrer légalement', 'Mention « Publicité » ou « Collaboration commerciale », contrat écrit au-delà de 1 000 € HT, et attention renforcée si la marque est soumise à des règles particulières (alcool par exemple).']
  ],
  memo: 'Affinité > audience. Transparence obligatoire. Pas de jargon.',
  defi: 'Prépare une fiche « Twitch en 5 phrases » pour un prospect non gamer.',
  sources: ['influence', 'influenceContrat'],
  questions: [
    { id: 'm4q1', type: 'choix', titre: 'Critère de choix', texte: 'Quel critère prime pour choisir un streamer ?',
      options: ['Le plus de followers possible.', 'L’affinité avec la marque et le public visé.', 'Le moins cher.'],
      retours: ['Une grosse audience mal ciblée convertit peu.', 'Pertinence d’abord.', 'Le prix vient ensuite.'],
      bonne: 1, explication: 'Un public aligné vaut plus qu’un public large.' },
    { id: 'm4q2', type: 'choix', critique: true, titre: 'Mention cachée', texte: 'La marque demande que le partenariat « paraisse naturel », sans mention.',
      options: ['Tu acceptes.', 'Tu refuses et tu expliques l’obligation de transparence.', 'Tu mets la mention dans la description de la VOD seulement.'],
      retours: ['Pratique commerciale trompeuse.', 'Tu protèges la marque, le streamer et toi.', 'Pas clair ni visible pendant la promotion.'],
      bonne: 1, explication: 'Erreur critique : dissimuler une collaboration commerciale.' }
  ]
},
{
  id: 'm5', code: 'M5', parcours: 'entrainer', titre: 'Mission : couvrir un événement e-sport', duree: '10 min',
  court: 'Un week-end de tournoi, trois plateformes, une équipe de modération.',
  objectif: 'Organiser la couverture d’un événement avec des rôles clairs.',
  situation: 'Un tournoi amateur de 2 jours, diffusé sur Twitch, avec 32 équipes. Tu coordonnes les réseaux et 3 modérateurs.',
  cours: [
    ['Les rôles', 'Un modérateur par créneau, toi en coordination. Chaque modérateur connaît l’échelle de sanctions et la procédure de crise.'],
    ['Le direct', 'Résultats publiés dans les 10 minutes, clips des actions marquantes, tableau du tournoi mis à jour.'],
    ['Les mineurs', 'Beaucoup de joueurs sont mineurs : pas de photo ou vidéo promotionnelle sans accord des parents, pas de nom de famille ni d’établissement.']
  ],
  memo: 'Rôles écrits, résultats rapides, mineurs protégés.',
  defi: 'Fais un planning de modération sur 2 jours avec 3 personnes.',
  sources: ['image', 'twitchModeration'],
  questions: [
    { id: 'm5q1', type: 'choix', critique: true, titre: 'Joueur mineur', texte: 'Un joueur de 15 ans gagne. Tu veux publier sa photo avec son nom complet.',
      options: ['Tu publies, il a gagné.', 'Tu demandes l’accord écrit des parents, et tu utilises son pseudo.', 'Tu publies et tu retireras si on se plaint.'],
      retours: ['Mineur : l’accord des parents est nécessaire.', 'Accord et données minimales.', 'Le mal est fait dès la publication.'],
      bonne: 1, explication: 'Erreur critique : diffuser l’image d’un mineur sans l’accord des parents.' },
    { id: 'm5q2', type: 'nombre', titre: 'Créneaux', texte: '2 jours de 10 heures de diffusion, créneaux de 2 heures. Combien de créneaux de modération ?',
      bonne: 10, tolerance: 0, unite: 'créneaux', explication: '20 heures / 2 = 10 créneaux.' },
    { id: 'm5q3', type: 'choix', titre: 'Résultats', texte: 'Quand publies-tu les résultats d’un match ?',
      options: ['Le lendemain, en récapitulatif.', 'Dans les 10 minutes.', 'Seulement la finale.'],
      retours: ['La communauté cherche l’info en direct.', 'C’est le rythme de l’événement.', 'Tu perds l’intérêt des phases éliminatoires.'],
      bonne: 1, explication: 'Le direct appelle des résultats rapides.' }
  ]
},
{
  id: 'm6', code: 'M6', parcours: 'entrainer', titre: 'Mission : auditer une communauté', duree: '12 min',
  court: 'Un diagnostic en une page qui donne envie de signer.',
  objectif: 'Réaliser un audit court qui sert aussi de proposition commerciale.',
  situation: 'Une streameuse de 2 000 followers stagne depuis 6 mois. Elle te demande « ce qui ne va pas ».',
  cours: [
    ['Observer', 'Régularité du planning, qualité des panneaux, activité du chat, présence hors live (clips, Discord, réseaux).'],
    ['Trois constats, trois actions', 'Pas vingt. Chaque constat est factuel, chaque action est faisable en un mois.'],
    ['Transformer', 'L’audit se termine par une offre : « Je peux mettre ces trois actions en place pour X € par mois. »']
  ],
  memo: 'Audit = 3 constats factuels + 3 actions + 1 offre.',
  defi: 'Fais l’audit gratuit d’une chaîne que tu aimerais avoir comme cliente.',
  sources: [],
  questions: [
    { id: 'm6q1', type: 'choix', titre: 'Format', texte: 'Quel format pour l’audit ?',
      options: ['Un rapport de 30 pages.', 'Une page : 3 constats, 3 actions, une offre.', 'Un message vocal.'],
      retours: ['Personne ne le lira.', 'Lisible, actionnable, commercial.', 'Pas réutilisable.'],
      bonne: 1, explication: 'Court et actionnable.' },
    { id: 'm6q2', type: 'choix', titre: 'Ton', texte: 'Comment formules-tu un constat négatif ?',
      options: ['« Ton Discord est nul. »', '« Le Discord a 4 messages ce mois-ci ; on peut le relancer avec un salon clips. »', 'Tu n’en parles pas.'],
      retours: ['Blessant et non actionnable.', 'Fait + action.', 'Elle paie pour savoir.'],
      bonne: 1, explication: 'Un fait chiffré, suivi d’une action.' }
  ]
}
  );
}(typeof globalThis !== 'undefined' ? globalThis : this));
