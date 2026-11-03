/* Parcours 4 — Décrocher des clients (P1 à P6) et épreuve finale. */
(function (root) {
  'use strict';
  const C = root.CMContenu = root.CMContenu || { lecons: [] };
  C.lecons.push(
{
  id: 'p1', code: 'P1', parcours: 'clients', titre: 'Ton positionnement', duree: '10 min',
  court: 'Qui tu aides, à faire quoi, avec quelle preuve.',
  objectif: 'Écrire une phrase de positionnement qui fait réagir ta cible.',
  situation: 'Sur LinkedIn, ton titre est « Community Manager freelance ». Comme 10 000 autres profils.',
  cours: [
    ['La formule', 'J’aide [cible] à [résultat] grâce à [méthode/preuve]. Exemple : « J’aide les studios indé à remplir leur Discord avant la sortie, 8 ans d’expérience dont des missions pour Amazon sur Twitch. »'],
    ['Ta preuve', 'Sous-traitance pour Amazon sur Twitch, 8 ans de métier, formation jeux vidéo : c’est rare. Mets-le en avant, dans le respect de ta clause de confidentialité.'],
    ['Deux pistes en parallèle', 'Missions freelance et poste salarié : la même phrase sert les deux, seul l’appel à l’action change.']
  ],
  memo: 'J’aide [qui] à [quoi] grâce à [preuve].',
  defi: 'Écris trois versions de ta phrase et demande à deux personnes laquelle est la plus claire.',
  sources: [],
  questions: [
    { id: 'p1q1', type: 'choix', titre: 'Le meilleur titre', texte: 'Quel titre LinkedIn est le plus efficace ?',
      options: ['Community Manager freelance', 'Community manager Twitch et jeux vidéo, j’aide les studios et streamers à faire revenir leur public', 'Passionnée de réseaux sociaux'],
      retours: ['Générique.', 'Cible + résultat.', 'Ne dit pas ce que tu vends.'],
      bonne: 1, explication: 'Cible et résultat explicites.' },
    { id: 'p1q2', type: 'choix', critique: true, titre: 'Confidentialité', texte: 'Ta mission Amazon est sous accord de confidentialité. Que publies-tu ?',
      options: ['Les chiffres internes de la campagne.', 'Le type de mission, sans données confidentielles, après avoir vérifié ce que l’accord permet.', 'Des captures du back-office.'],
      retours: ['Violation de l’accord.', 'Tu valorises l’expérience sans trahir le client.', 'Violation de l’accord.'],
      bonne: 1, explication: 'Erreur critique : divulguer des informations couvertes par la confidentialité.' }
  ]
},
{
  id: 'p2', code: 'P2', parcours: 'clients', titre: 'Ton portfolio en ligne', duree: '12 min',
  court: 'Trois études de cas valent mieux que trente captures.',
  objectif: 'Structurer trois études de cas lisibles en 2 minutes.',
  situation: 'Tu as 8 ans de travail, mais rien de montrable en un lien.',
  cours: [
    ['L’étude de cas', 'Contexte (2 lignes), ce que tu as fait (3 actions), résultat (1 à 3 chiffres, avec l’accord du client), une capture.'],
    ['Le support', 'Une page simple sur LinkedIn (section Sélection) ou un site gratuit type GitHub Pages. Un lien, pas un PDF de 12 Mo.'],
    ['Les droits', 'Tu montres un travail fait pour un client : demande son accord et masque les données sensibles.']
  ],
  memo: 'Contexte → actions → résultat → capture. Avec l’accord du client.',
  defi: 'Rédige ta première étude de cas avec ce format.',
  sources: ['cession'],
  questions: [
    { id: 'p2q1', type: 'choix', titre: 'Structure', texte: 'Quel ordre pour une étude de cas ?',
      options: ['Résultat → contexte → outils', 'Contexte → actions → résultat', 'Liste des outils utilisés'],
      retours: ['Le lecteur ne comprend pas le résultat sans contexte.', 'Logique et rapide à lire.', 'Les outils n’intéressent pas le client.'],
      bonne: 1, explication: 'Contexte, actions, résultat.' },
    { id: 'p2q2', type: 'nombre', titre: 'Combien', texte: 'Combien d’études de cas pour démarrer ?',
      bonne: 3, tolerance: 0, unite: 'études', explication: 'Trois études de cas bien choisies suffisent.' }
  ]
},
{
  id: 'p3', code: 'P3', parcours: 'clients', titre: 'Cibler tes prospects', duree: '10 min',
  court: 'Une liste de 30 noms vaut mieux qu’une annonce sur un réseau.',
  objectif: 'Construire une liste qualifiée de 30 prospects.',
  situation: 'Tu postes « Je suis disponible » sur LinkedIn. 2 likes, 0 client.',
  cours: [
    ['Trois cercles', '1) Ton réseau (anciens clients, collègues), 2) les studios et streamers proches de ta spécialité, 3) les agences qui sous-traitent.'],
    ['Les signaux', 'Un studio qui annonce un jeu, un streamer qui passe partenaire, une agence qui recrute : ce sont des moments où le besoin existe.'],
    ['Le tableau', 'Nom, contact, signal repéré, date du premier message, relance prévue. Le pipeline de JTIpilot sert à ça.']
  ],
  memo: '30 noms, 3 cercles, 1 signal par nom.',
  defi: 'Liste 10 prospects avec un signal concret pour chacun.',
  sources: [],
  questions: [
    { id: 'p3q1', type: 'choix', titre: 'Le bon moment', texte: 'Quel est le meilleur signal pour contacter un studio ?',
      options: ['Il vient d’annoncer une date de sortie.', 'Il n’a rien publié depuis 2 ans.', 'Il a 50 000 followers.'],
      retours: ['Le besoin de communication est immédiat.', 'Peut-être en difficulté.', 'La taille n’est pas un besoin.'],
      bonne: 0, explication: 'Un signal = un besoin daté.' },
    { id: 'p3q2', type: 'nombre', titre: 'Rythme', texte: 'Tu contactes 6 prospects par semaine. En combien de semaines atteins-tu 30 contacts ?',
      bonne: 5, tolerance: 0, unite: 'semaines', explication: '30 / 6 = 5 semaines.' }
  ]
},
{
  id: 'p4', code: 'P4', parcours: 'clients', titre: 'Le premier message', duree: '10 min',
  court: 'Court, personnalisé, avec une question facile.',
  objectif: 'Écrire un premier message qui obtient une réponse.',
  situation: 'Tu veux écrire à un studio qui annonce son jeu dans 2 mois.',
  cours: [
    ['La structure', '1) Ce que tu as remarqué chez eux, 2) une idée concrète, 3) une preuve courte, 4) une question fermée : « Ça vous parle d’en discuter 15 minutes jeudi ? »'],
    ['La longueur', '5 lignes maximum. Pas de CV, pas de tarif dans le premier message.'],
    ['La relance', 'Une relance à J+5, une dernière à J+12, puis tu arrêtes. Note tout dans ton tableau.']
  ],
  memo: 'Remarque + idée + preuve + question. 5 lignes. Relance J+5 et J+12.',
  defi: 'Envoie 3 premiers messages cette semaine avec ce modèle.',
  sources: [],
  questions: [
    { id: 'p4q1', type: 'choix', titre: 'Ouverture', texte: 'Quelle ouverture choisis-tu ?',
      options: ['« Bonjour, je suis community manager depuis 8 ans… »', '« J’ai vu votre annonce de sortie en janvier ; votre Discord pourrait accueillir les joueurs de la démo. »', '« Vous avez besoin d’un CM ? »'],
      retours: ['Parle de toi, pas d’eux.', 'Remarque précise + idée.', 'Trop direct, réponse facile : non.'],
      bonne: 1, explication: 'Commence par eux, pas par toi.' },
    { id: 'p4q2', type: 'choix', titre: 'Sans réponse', texte: 'Pas de réponse après 2 relances. Que fais-tu ?',
      options: ['Tu relances chaque jour.', 'Tu arrêtes, tu notes et tu reviendras sur un nouveau signal.', 'Tu écris un message vexé.'],
      retours: ['Tu deviens du spam.', 'Tu restes professionnelle.', 'Tu fermes la porte.'],
      bonne: 1, explication: 'Deux relances, puis on passe à autre chose.' }
  ]
},
{
  id: 'p5', code: 'P5', parcours: 'clients', titre: 'L’entretien découverte', duree: '12 min',
  court: 'Écouter 70 % du temps, reformuler, proposer une suite.',
  objectif: 'Mener un appel de 20 minutes qui débouche sur un devis.',
  situation: 'Le studio a dit oui pour un appel. Tu as 20 minutes.',
  cours: [
    ['Les questions', 'Objectif (pour quand ?), situation actuelle, ce qui a déjà été essayé, qui décide, budget envisagé.'],
    ['La reformulation', '« Si je résume : vous voulez 1 000 membres sur Discord avant la démo de mars, et personne en interne n’a le temps. C’est ça ? »'],
    ['La suite', 'Termine par une date : « Je vous envoie une proposition jeudi, on en parle vendredi 10 h ? »']
  ],
  memo: 'Questionner, reformuler, fixer la suite avec une date.',
  defi: 'Prépare tes 5 questions de découverte sur une fiche.',
  sources: [],
  questions: [
    { id: 'p5q1', type: 'choix', titre: 'Le budget', texte: 'Le prospect esquive la question du budget.',
      options: ['Tu laisses tomber.', 'Tu proposes des fourchettes : « Plutôt 500, 1 500 ou 3 000 € par mois ? »', 'Tu annonces ton prix le plus haut.'],
      retours: ['Tu risques un devis hors budget.', 'Facile à répondre, ça cadre la proposition.', 'Prématuré.'],
      bonne: 1, explication: 'Les fourchettes débloquent la question du budget.' },
    { id: 'p5q2', type: 'choix', titre: 'Fin d’appel', texte: 'Comment termines-tu ?',
      options: ['« Je vous recontacte. »', '« Je vous envoie la proposition jeudi, on en parle vendredi 10 h ? »', '« Merci, bonne journée. »'],
      retours: ['Flou.', 'Prochaine étape datée.', 'Aucune suite.'],
      bonne: 1, explication: 'Toujours une suite datée.' }
  ]
},
{
  id: 'p6', code: 'P6', parcours: 'clients', titre: 'Devis, objections et négociation', duree: '12 min',
  court: 'Défendre ton prix en changeant le périmètre, pas la valeur.',
  objectif: 'Répondre à une objection de prix sans brader ton travail.',
  situation: 'Le studio trouve ton devis de 1 500 € par mois « un peu cher ».',
  cours: [
    ['Le devis', 'Périmètre, livrables, prix, durée, conditions de paiement, validité de l’offre, cession des droits. Trois options si possible : essentiel, standard, complet.'],
    ['L’objection', 'Demande : « Cher par rapport à quoi ? » Puis réduis le périmètre plutôt que le prix : moins de plateformes, moins de posts.'],
    ['Le poste salarié', 'En entretien d’embauche, la même logique vaut : tu présentes tes résultats et ta fourchette, puis tu écoutes.']
  ],
  memo: 'On baisse le périmètre, pas le prix du même travail.',
  defi: 'Rédige trois options (essentiel, standard, complet) pour ton offre principale.',
  sources: ['cession', 'factures'],
  questions: [
    { id: 'p6q1', type: 'choix', critique: true, titre: '« Trop cher »', texte: 'Le studio veut le même périmètre pour 900 € au lieu de 1 500 €.',
      options: ['Tu acceptes tout de suite.', 'Tu proposes l’option essentielle à 900 € avec un périmètre réduit.', 'Tu acceptes et tu feras moins sans le dire.'],
      retours: ['Tu travailles 40 % moins cher.', 'Le prix suit le périmètre.', 'Tu trahis l’accord.'],
      bonne: 1, explication: 'Erreur critique : réduire secrètement la prestation après avoir accepté un prix.' },
    { id: 'p6q2', type: 'multiple', titre: 'Contenu du devis', texte: 'Que doit contenir ton devis ? (3 réponses)',
      options: ['Le périmètre et les livrables', 'La durée de validité', 'Tes autres clients et leurs tarifs', 'Les conditions de paiement'],
      retours: ['Oui.', 'Oui.', 'Non : confidentiel.', 'Oui.'],
      bonne: [0, 1, 3], explication: 'Périmètre, validité, paiement.' }
  ]
}
  );

  C.final = {
    id: 'final', code: 'EF', parcours: 'final', titre: 'Épreuve finale : ta première semaine de mission', duree: '15 min',
    court: 'Un mélange des quatre parcours, en situation.',
    objectif: 'Montrer que tu sais tenir une mission complète, du devis à la crise.',
    situation: 'Un studio indé te signe pour 3 mois. Lancement de la démo la semaine prochaine sur Twitch.',
    cours: [['Règle', '80 % de bonnes réponses et aucune erreur critique. Tu peux recommencer autant de fois que tu veux.']],
    memo: 'Tu as tout ce qu’il faut. Relis les mémos si tu bloques.',
    defi: 'Choisis une action du carnet et fais-la avant demain soir.',
    sources: ['microSocial', 'tvaFranchise', 'influence', 'twitchAttaques'],
    questions: [
      { id: 'efq1', type: 'choix', critique: true, titre: 'Démarrage', texte: 'Le studio veut commencer avant d’avoir signé le devis.',
        options: ['Tu commences.', 'Tu fais signer le devis d’abord, le jour même si besoin.', 'Tu commences et tu factures plus tard ce que tu veux.'],
        retours: ['Aucune protection.', 'Devis signé avant de commencer.', 'Litige assuré.'],
        bonne: 1, explication: 'Rien ne démarre sans accord écrit.' },
      { id: 'efq2', type: 'nombre', titre: 'Cotisations', texte: 'Premier mois encaissé : 1 500 € en BNC à 25,6 %. Combien de cotisations sociales ? (en €)',
        bonne: 384, tolerance: 1, unite: '€', explication: '1 500 × 25,6 % = 384 €.' },
      { id: 'efq3', type: 'choix', critique: true, titre: 'Clés offertes', texte: 'Le studio donne des clés du jeu à des streamers contre un live. Mention ?',
        options: ['Aucune, ce sont des cadeaux.', '« Collaboration commerciale » ou « Publicité », visible pendant la promotion.', 'Un hashtag discret.'],
        retours: ['Un avantage contre promotion doit être signalé.', 'Transparence claire.', 'Pas lisible.'],
        bonne: 1, explication: 'Avantage en nature = mention obligatoire.' },
      { id: 'efq4', type: 'choix', critique: true, titre: 'Raid', texte: 'Pendant le live de la démo, un raid haineux arrive.',
        options: ['Tu réponds dans le chat.', 'Followers-only, mode lent, AutoMod renforcé, puis bans, signalement et captures.', 'Tu coupes le stream sans prévenir.'],
        retours: ['Tu nourris l’attaque.', 'Procédure dans l’ordre.', 'La décision revient au client.'],
        bonne: 1, explication: 'Couper le flux, puis sanctionner et documenter.' },
      { id: 'efq5', type: 'choix', titre: 'Bilan', texte: 'Fin du premier mois : les ajouts en liste de souhaits sont décevants.',
        options: ['Tu ne les mentionnes pas.', 'Tu les montres avec une hypothèse et une action à tester.', 'Tu changes la période.'],
        retours: ['Confiance perdue.', 'Honnête et actionnable.', 'Manipulation.'],
        bonne: 1, explication: 'Un bilan honnête mène à une décision.' },
      { id: 'efq6', type: 'choix', titre: 'TVA', texte: 'Ton chiffre d’affaires de l’an dernier : 28 000 €. Cette année, tu en es à 36 000 € en novembre. Factures-tu la TVA ?',
        options: ['Oui, depuis janvier.', 'Non, tu restes sous le seuil majoré de 41 250 € ; surveille-le.', 'Oui, dès 25 000 €.'],
        retours: ['L’an dernier était sous 37 500 €.', 'Franchise maintenue en 2026, à surveiller.', 'La réforme à 25 000 € a été abandonnée.'],
        bonne: 1, explication: 'Repère 2026 : 37 500 € (N-1) et seuil majoré 41 250 €.' }
    ]
  };
}(typeof globalThis !== 'undefined' ? globalThis : this));
