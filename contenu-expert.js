/* Parcours « Défis de pro » (1/2) : X1 à X5, niveaux 3 (difficile) et 4 (expert).
   Pensé pour une community manager avec plusieurs années de métier : cas ambigus, arbitrages, chiffres lus avec méthode.
   Les repères juridiques sont pédagogiques et à faire relire ; les chiffres légaux viennent de sources.js. */
(function (root) {
  'use strict';
  const C = root.CMContenu = root.CMContenu || { lecons: [] };
  const ch = (id, titre, texte, options, retours, bonne, explication, critique) =>
    Object.assign({ id, type: 'choix', titre, texte, options, retours, bonne, explication }, critique ? { critique: true } : {});
  const mu = (id, titre, texte, options, retours, bonne, explication) => ({ id, type: 'multiple', titre, texte, options, retours, bonne, explication });
  const nb = (id, titre, texte, bonne, tolerance, unite, explication) => ({ id, type: 'nombre', titre, texte, bonne, tolerance, unite, explication });

  const NOUVELLES = [
  {
    id: 'x1', code: 'X1', parcours: 'expert', niveau: 3, titre: 'Modération sous pression', duree: '12 min',
    court: 'Raid haineux, bénévoles à bout, preuves à garder : le sang-froid se prépare.',
    objectif: 'Réagir dans le bon ordre pendant une attaque, protéger l’équipe de modération et garder des preuves exploitables.',
    situation: 'Ton client est en direct devant 300 viewers. Un groupe organisé inonde le chat de messages haineux. Le streamer, énervé, te souffle : « Bannis-les tous ! »',
    cours: [
      ['Protéger d’abord, communiquer ensuite', 'Pendant une attaque coordonnée, l’ordre est : limiter l’accès au chat (mode abonnés ou followers, mode lent, mode bouclier de la plateforme si disponible), nettoyer, puis seulement parler. Répondre aux attaquants les nourrit. Une ligne au streamer suffit : « On gère, continue. »'],
      ['Un protocole écrit pour les modérateurs', 'Qui peut bannir et qui doit demander ? Quand un timeout suffit-il ? Où note-t-on le motif ? Comment un viewer conteste-t-il un ban ? Sans protocole, chaque modérateur improvise et les bénévoles s’épuisent ou se contredisent. Révise-le après chaque incident.'],
      ['Garder des preuves', 'Une capture utile montre la date et l’heure, le pseudo (et si possible l’identifiant du compte), le message complet et un peu de contexte avant et après. Pour des menaces ou de l’incitation à la haine, c’est la personne visée (ici le streamer) qui décide de signaler à la plateforme, à la plateforme officielle de signalement ou de porter plainte. Tu l’aides à documenter, tu ne décides pas à sa place.'],
      ['Le ton d’après', 'Un message court, factuel, sans nommer de comptes : « Un groupe a essayé de perturber le live. Les mesures sont en place. Merci aux modérateurs. » Pas de polémique, pas de détails techniques, pas de menaces en retour. Un débrief avec l’équipe sous 24 heures.']
    ],
    memo: 'Protéger le chat, puis nettoyer, puis communiquer court. Preuves datées. Le streamer décide des suites judiciaires.',
    defi: 'Écris en dix lignes le protocole de ta modération : qui bannit quoi, qui décide d’un ban définitif, comment contester.',
    sources: [],
    questions: [
      ch('x1q1', 'Le premier geste', 'Le raid haineux démarre, le chat part dans tous les sens. Que fais-tu en premier ?',
        ['Tu publies une longue story pour condamner l’attaque.', 'Tu restreins le chat (followers/abonnés, mode lent), tu fais nettoyer par l’équipe et tu préviens le streamer en une ligne.', 'Tu réponds aux raiders pour les faire reculer.', 'Tu demandes au streamer d’arrêter le live.'],
        ['Parler avant de protéger laisse l’attaque se poursuivre.', 'Oui : limiter l’accès, nettoyer, puis communiquer court.', 'Répondre nourrit les attaquants.', 'Arrêter le live donne l’attaque pour gagnante, sauf si la situation l’exige.'],
        1, 'Protéger d’abord : on réduit la surface d’attaque, on nettoie, on communique ensuite.'),
      ch('x1q2', 'Le modérateur trop zélé', 'Un modérateur bénévole bannit à vie un habitué après une blague limite, sans passer par le protocole. Que fais-tu ?',
        ['Tu laisses faire pour ne pas froisser le bénévole.', 'Tu annules le ban en public pour montrer que l’équipe n’est pas arbitraire.', 'Tu transformes le ban en timeout le temps d’en parler, puis tu rappelles en privé la règle d’escalade au modérateur.', 'Tu retires le rôle de modérateur tout de suite.'],
        ['Un ban à vie injustifié abîme la communauté et crée un précédent.', 'Désavouer un bénévole en public l’humilie et le démotive.', 'Oui : tu corriges l’effet immédiat sans casser la relation, puis tu clarifies la règle en privé.', 'C’est disproportionné pour une première entorse.'],
        2, 'Corriger l’effet, protéger la relation, clarifier la règle : dans cet ordre.'),
      ch('x1q3', 'Menaces dans le chat', 'En plein live, un viewer écrit des menaces de mort visant le streamer. Quelle est la bonne conduite ?',
        ['Tu supprimes le message et tu bannis sans rien garder.', 'Tu captures le message (pseudo, identifiant, date et heure, contexte), tu bannis, puis tu informes le streamer, qui décide de la suite (signalement à la plateforme, plateforme officielle de signalement, plainte).', 'Tu réponds publiquement pour dénoncer l’auteur.', 'Tu ignores : c’est du trolling.'],
        ['Sans trace, le streamer ne pourra rien prouver.', 'Oui : preuve d’abord, ban ensuite, et décision laissée à la personne visée.', 'Une réponse publique expose le streamer et peut aggraver la situation.', 'Des menaces ne se minimisent jamais : elles se documentent.'],
        1, 'Les preuves sont indispensables avant toute suite. La décision de signaler ou porter plainte revient au streamer.', true),
      mu('x1q4', 'La bonne capture', 'Quels éléments rendent une capture d’écran exploitable comme preuve ? (3 réponses)',
        ['La date et l’heure visibles', 'Le pseudo (et l’identifiant du compte si possible)', 'Le message en entier avec un peu de contexte', 'Un recadrage serré sur le seul mot choquant'],
        ['Oui : sans horodatage, la capture est contestable.', 'Oui : un pseudo peut changer, l’identifiant non.', 'Oui : le contexte évite l’accusation d’avoir tronqué.', 'Non : le recadrage fait perdre la date, l’auteur et le contexte.'],
        [0, 1, 2], 'Date, auteur, message complet : trois éléments qui rendent la preuve crédible.'),
      nb('x1q5', 'Lire l’attaque', 'Sur 12 comptes arrivés dans le chat en deux minutes, 8 ont été créés il y a moins d’un jour. Quelle proportion cela fait-il ? (en %)', 66.7, 0.5, '%', '8 ÷ 12 × 100 ≈ 66,7 %. Une forte part de comptes très récents est un signal d’attaque coordonnée.'),
      ch('x1q6', 'Le message d’après', 'Le live est fini. Que publies-tu dans la communauté ?',
        ['Un long récit détaillé de l’attaque avec les pseudos des raiders.', 'Un message court : un groupe a tenté de perturber le live, les mesures sont en place, merci aux modérateurs.', 'Rien du tout : on fait comme si de rien n’était.', 'Un message menaçant les auteurs de poursuites.'],
        ['Nommer les comptes les met en lumière et peut les encourager.', 'Oui : factuel, court, sans amplifier, avec un remerciement.', 'Le silence laisse les rumeurs combler le vide pour une communauté qui a tout vu.', 'Les menaces en retour relèvent du streamer et de ses conseils, pas du CM.'],
        1, 'Court, factuel, pas de pseudos, un merci à l’équipe : c’est le ton d’après-crise.'),
      ch('x1q7', 'Abonnés uniquement, vraiment ?', 'Après l’attaque, le streamer veut passer le chat en « abonnés uniquement » pour toute la saison. Quel est le principal risque ?',
        ['Aucun : plus de calme, plus de qualité.', 'Les nouveaux viewers ne peuvent plus parler, ce qui freine la découverte et la fidélisation.', 'La plateforme interdit cette option.', 'Les modérateurs n’auront plus rien à faire.'],
        ['Le calme a un coût caché : on ferme la porte aux nouveaux.', 'Oui : mieux vaut des restrictions graduées et temporaires, par exemple followers depuis dix minutes.', 'Faux : l’option existe.', 'Faux : la modération porte aussi sur la qualité des échanges.'],
        1, 'Les restrictions fortes protègent mais coupent l’accueil : on les module selon le risque.'),
      nb('x1q8', 'Le planning des modérateurs', 'Le streamer fait 18 heures de live par semaine. Chaque heure doit être couverte par deux modérateurs. Vous êtes 4 modérateurs. Combien d’heures par semaine chacun doit-il couvrir ? (en h)', 9, 0, 'h', '18 h × 2 = 36 heures-modération ; 36 ÷ 4 = 9 h par modérateur.')
    ]
  },
  {
    id: 'x2', code: 'X2', parcours: 'expert', niveau: 3, titre: 'Stratégie éditoriale multi-plateformes', duree: '12 min',
    court: 'Un live, dix contenus : décider quoi publier, où et pourquoi.',
    objectif: 'Bâtir un enchaînement live → clips → formats courts → rappel, le tester proprement et le mesurer.',
    situation: 'Ton client stream trois soirs par semaine et veut « être partout » : Twitch, TikTok, YouTube Shorts, Instagram, X. Il t’alloue environ 6 heures par semaine.',
    cours: [
      ['Un live est une mine', 'Un live de trois heures contient dix moments clippables. La chaîne type : annonce avant le live, clips pendant, formats verticaux dans les 24 heures, récap en fin de semaine, rappel du prochain rendez-vous. Chaque contenu renvoie vers le live suivant.'],
      ['Chaque plateforme son rôle', 'Twitch : rendez-vous et fidélisation. Formats courts : découverte. Discord ou newsletter : rétention et rappel. Vouloir la même chose partout dilue l’effort. Mieux vaut tenir deux plateformes pendant trois mois que quatre pendant trois semaines.'],
      ['Tester une seule variable', 'Pour savoir si les sous-titres améliorent la rétention, compare des clips semblables, publiés à des horaires comparables, avec et sans sous-titres. Un test où tout change n’apprend rien. Prévois au moins une dizaine de publications par variante avant de conclure.'],
      ['Découverte ou conversion ?', 'Un clip à 200 000 vues et 12 nouveaux followers n’est pas un échec de portée, mais un échec de passerelle : appel vers le live, rappel d’horaire, lien. Mesure la découverte (vues) et la conversion (vues → follows → présence au live).']
    ],
    memo: 'Un live alimente une chaîne de contenus. Une variable testée à la fois. Découverte et conversion se mesurent séparément.',
    defi: 'Dessine la chaîne type d’un de tes clients : un live, quatre contenus issus de ce live, un rappel. Note quelle plateforme joue quel rôle.',
    sources: [],
    questions: [
      ch('x2q1', 'Beaucoup de vues, peu de followers', 'Un clip atteint 200 000 vues mais ne rapporte que 12 nouveaux followers. Que conclus-tu ?',
        ['C’est un flop, on arrête ce format.', 'La découverte fonctionne, c’est la passerelle vers le live qui manque : appel, horaire, lien.', 'Les vues sont fausses.', 'Il faut poster plus souvent le même clip.'],
        ['Tu jettes un format qui attire l’audience.', 'Oui : tu distingues la portée (vues) de la conversion (follows) et tu travailles la passerelle.', 'Rien ne le laisse penser, vérifie plutôt la source du trafic.', 'Répéter le même contenu ne règle pas le manque de passerelle.'],
        1, 'Portée et conversion sont deux mesures : ici la portée est bonne, la conversion à améliorer.'),
      ch('x2q2', 'Un vrai test', 'Tu veux savoir si les sous-titres améliorent la rétention des clips. Quel plan retiens-tu ?',
        ['Pendant un mois, tu changes le format, le titre, l’horaire et les sous-titres, puis tu compares.', 'Tu publies dix clips comparables avec sous-titres et dix sans, à des horaires comparables, en ne changeant que ça.', 'Tu essaies une fois sur un clip et tu décides.', 'Tu demandes l’avis de ta mère.'],
        ['Si tout change, tu ne sauras pas ce qui a joué.', 'Oui : une seule variable, un échantillon suffisant.', 'Un seul clip ne prouve rien.', 'Charmant, mais pas une mesure.'],
        1, 'Un test valable change une variable et repose sur plusieurs publications.'),
      mu('x2q3', 'Les deux premières secondes', 'Dans un format vertical, qu’est-ce qui aide à retenir le spectateur dans les deux premières secondes ? (2 réponses)',
        ['Une accroche claire : action, question ou résultat dès le début', 'Un logo animé de trois secondes', 'Des sous-titres lisibles', 'Le contexte complet de la partie avant de montrer le moment fort'],
        ['Oui : le spectateur doit comprendre vite pourquoi rester.', 'Non : un logo d’intro retarde le contenu.', 'Oui : beaucoup regardent sans le son.', 'Non : le contexte vient après l’accroche, pas avant.'],
        [0, 2], 'Accroche immédiate et sous-titres : les deux leviers les plus simples.'),
      nb('x2q4', 'Quelques clips portent tout', 'Sur 12 clips publiés dans le mois, 3 génèrent 80 % des vues. Quelle part des clips cela représente-t-il ? (en %)', 25, 0, '%', '3 ÷ 12 × 100 = 25 %. Un quart des clips fait presque tout le résultat : cherche ce qu’ils ont en commun.'),
      nb('x2q5', 'Conversion pour mille vues', '50 000 vues ont rapporté 400 nouveaux followers. Combien de followers pour 1 000 vues ?', 8, 0, 'followers', '400 ÷ 50 000 × 1 000 = 8 followers pour 1 000 vues.'),
      ch('x2q6', 'Le filigrane', 'Tu veux republier sur un autre réseau une vidéo exportée avec le filigrane d’une autre plateforme. Que fais-tu ?',
        ['Tu la republies telle quelle : tout le monde fait ça.', 'Tu ré-exportes la vidéo depuis ton fichier source, sans filigrane, au bon format pour chaque réseau.', 'Tu recadres au hasard pour cacher le filigrane.', 'Tu renonces à toute republication.'],
        ['Les plateformes diffusent souvent moins les vidéos portant le logo d’un concurrent.', 'Oui : propre, adapté, et souvent mieux diffusé.', 'Un recadrage bricolé nuit à la lisibilité.', 'Tu perds tout le bénéfice de la réutilisation.'],
        1, 'Repartir du fichier source évite le filigrane et permet d’adapter le format.'),
      ch('x2q7', 'Le rythme autour du live', 'Ton client stream le mardi, le jeudi et le samedi soir. Quelle cadence est la plus solide ?',
        ['Une annonce le matin du live, un rappel une heure avant, des clips dans les 24 heures après.', 'Un seul gros post par semaine.', 'Des posts aléatoires quand tu y penses.', 'Uniquement des publications pendant le live.'],
        ['Oui : avant (annonce, rappel), pendant, après (clips) : le cycle complet.', 'Trop peu de rendez-vous pour trois lives par semaine.', 'Sans régularité, l’audience n’apprend pas quand venir.', 'Tu rates l’avant et l’après, qui font venir et revenir.'],
        0, 'Le cycle annonce, rappel, clips autour de chaque live fait revenir l’audience.'),
      ch('x2q8', 'Partout, tous les jours', 'Le client veut publier tous les jours sur quatre réseaux avec 6 heures par semaine. Que proposes-tu ?',
        ['Tu acceptes, on verra.', 'Tu proposes deux plateformes avec un format tenable, mesuré sur trois mois, puis tu élargis si les chiffres le justifient.', 'Tu conseilles d’abandonner les réseaux.', 'Tu travailles le week-end pour tout tenir.'],
        ['C’est la recette de l’épuisement et d’une qualité en baisse.', 'Oui : tu proposes un périmètre réaliste, mesurable et évolutif.', 'Tu rejettes le besoin au lieu de le cadrer.', 'Tu dépasses ton périmètre sans le facturer.'],
        1, 'Mieux vaut tenir deux plateformes que d’en survoler quatre.')
    ]
  },
  {
    id: 'x3', code: 'X3', parcours: 'expert', niveau: 3, titre: 'Lire les analytics sans se faire avoir', duree: '14 min',
    court: 'Moyenne ou pic, coût par clic, ROI, corrélation : les chiffres qui disent vrai.',
    objectif: 'Choisir les bons indicateurs, calculer coûts et retours, et ne pas confondre corrélation et causalité.',
    situation: 'À la fin du mois, ton client te demande un rapport « qui montre que ça marche ». Il a fait un giveaway, une campagne sponsorisée et un week-end de lives spéciaux.',
    cours: [
      ['Moyenne, pic, cumul', 'Les viewers moyens racontent la fidélité, le pic raconte un moment, les heures regardées racontent l’engagement total. Une moyenne qui monte alors que le pic stagne peut être une très bonne nouvelle : plus de régularité, moins de dépendance à un pic.'],
      ['Les formules à connaître', 'Coût par clic (CPC) = budget ÷ clics. Coût pour mille impressions (CPM) = budget ÷ impressions × 1 000. Retour sur investissement (ROI) = (gain − coût) ÷ coût × 100. Moyenne pondérée = somme(valeur × durée) ÷ somme des durées.'],
      ['Corrélation n’est pas causalité', 'Si les lives sont plus suivis les jours où tu publies une story, la story n’en est pas forcément la cause : ces jours-là, le live était peut-être déjà annoncé et plus attendu. Pour trancher, alterne : une semaine avec, une semaine sans, à conditions comparables.'],
      ['Honnêteté du rapport', 'Un mois exceptionnel (giveaway, événement) se signale comme tel. Présenter une hausse due à un concours comme une croissance naturelle est une faute professionnelle : le client prendrait de mauvaises décisions.']
    ],
    memo: 'CPC = budget ÷ clics. CPM = budget ÷ impressions × 1 000. ROI = (gain − coût) ÷ coût × 100. Un événement exceptionnel se signale dans le rapport.',
    defi: 'Choisis un rapport mensuel passé : repère un chiffre qui dépendait d’un événement exceptionnel et réécris la phrase qui l’accompagne.',
    sources: [],
    questions: [
      nb('x3q1', 'Le coût par clic', 'Une publicité de 150 € a généré 620 clics. Quel est le coût par clic ? (en €, arrondi au centime)', 0.24, 0.01, '€', '150 ÷ 620 ≈ 0,24 € par clic.'),
      nb('x3q2', 'Le CPM', 'La même publicité de 150 € a été affichée 48 000 fois. Quel est le CPM (coût pour mille impressions) ? (en €)', 3.125, 0.01, '€', '150 ÷ 48 000 × 1 000 = 3,125 € pour mille impressions.'),
      nb('x3q3', 'Le retour sur investissement', 'Une campagne de 200 € a généré 650 € de ventes attribuées. Quel est le ROI ? (en %)', 225, 0.5, '%', '(650 − 200) ÷ 200 × 100 = 225 %.'),
      ch('x3q4', 'Moyenne en hausse, pic stable', 'La moyenne de viewers passe de 40 à 52, mais le pic reste à 70. Que dis-tu au client ?',
        ['Rien n’a changé puisque le pic est identique.', 'La régularité de l’audience progresse : plus de monde, plus souvent, et moins de dépendance aux pics.', 'La moyenne ne sert à rien.', 'Il faut ignorer les chiffres jusqu’au prochain pic.'],
        ['Tu regardes le mauvais indicateur pour juger de la fidélité.', 'Oui : la moyenne mesure la fidélité, le pic un moment.', 'La moyenne est justement l’indicateur de fidélité.', 'Tu rates l’information utile.'],
        1, 'La moyenne raconte la fidélité, le pic un moment : on les lit ensemble.'),
      ch('x3q5', 'Le giveaway dans le rapport', 'Le mois dernier comportait un giveaway qui a attiré beaucoup de nouveaux comptes. Le client veut présenter « +300 % de croissance » sans le mentionner. Que fais-tu ?',
        ['Tu présentes +300 % tel quel pour lui faire plaisir.', 'Tu présentes le chiffre avec le contexte du giveaway et, si possible, la croissance hors événement.', 'Tu retires le chiffre pour éviter d’en parler.', 'Tu minores le chiffre sans le dire.'],
        ['Tu le laisses décider sur une base trompeuse.', 'Oui : un chiffre se présente avec son contexte, et un événement exceptionnel se signale.', 'Tu prives le client d’une information utile.', 'Modifier discrètement un chiffre est une faute.'],
        1, 'Le rapport doit permettre de décider : l’événement exceptionnel est signalé et, si possible, isolé.', true),
      mu('x3q6', 'Les indicateurs actionnables', 'Quels indicateurs te permettent de prendre une décision concrète ? (3 réponses)',
        ['Le taux de conversion d’une vue en follow', 'La rétention moyenne d’une vidéo', 'Le créneau où l’affluence est la plus forte', 'Le nombre total d’impressions pris seul'],
        ['Oui : il oriente l’appel à l’action.', 'Oui : il montre où l’audience décroche.', 'Oui : il guide les horaires de publication.', 'Non : sans rapport à un résultat, un total n’oriente aucune décision.'],
        [0, 1, 2], 'Un indicateur est utile quand il débouche sur une action précise.'),
      ch('x3q7', 'Corrélation ou causalité', 'Les jours où tu publies une story, le live compte plus de viewers. Peux-tu conclure que la story les amène ?',
        ['Oui, c’est évident.', 'Non, pas sans test : alterne avec et sans story à conditions comparables.', 'Oui, si la différence dépasse 5 %.', 'Non, les stories ne servent à rien.'],
        ['Une coïncidence ou une cause tierce est possible.', 'Oui : seul un test alterné peut établir un lien.', 'Aucun seuil ne transforme une corrélation en preuve.', 'Tu tires une conclusion opposée sans preuve.'],
        1, 'Corrélation n’est pas causalité : on teste en alternant.'),
      nb('x3q8', 'La moyenne pondérée', 'Lundi : 40 viewers en moyenne sur 2 heures. Jeudi : 60 viewers en moyenne sur 4 heures. Quelle est la moyenne sur les 6 heures ? (arrondie à l’unité)', 53, 0.5, 'viewers', '(40 × 2 + 60 × 4) ÷ 6 = 320 ÷ 6 ≈ 53,3. Ce n’est pas 50 : la plus longue session pèse plus lourd.')
    ]
  },
  {
    id: 'x4', code: 'X4', parcours: 'expert', niveau: 4, titre: 'Négocier tarifs et périmètre', duree: '14 min',
    court: 'Forfait, retainer, performance : choisir le modèle et tenir le cadre.',
    objectif: 'Choisir un modèle de rémunération, chiffrer un dépassement, relever un tarif et répondre à une demande de remise.',
    situation: 'Un client te propose une commission sur les nouveaux abonnés, en rappelant que « tout le monde lui dit oui ». Un autre ajoute des tâches chaque semaine « puisque tu es déjà dessus ».',
    cours: [
      ['Quatre modèles, quatre risques', 'Forfait : prévisible, risque de dépassement. Retainer : revenu régulier, il faut un plafond d’heures. Régie (taux journalier) : simple, mais tu vends du temps. Performance : tu portes un risque sur lequel tu n’as pas la main. Un bon compromis : forfait de base et prime plafonnée.'],
      ['Chaque ajout est une option chiffrée', 'Un dépassement se traite par un avenant ou une option, jamais par un « ok, pour cette fois ». Dis : « Je peux l’ajouter pour X €, ou on retire quelque chose du périmètre. » Le périmètre écrit est ton protecteur.'],
      ['Relever un tarif', 'Préviens à l’avance (un mois ou plus), appuie-toi sur des résultats, propose une date d’effet. Une hausse de 10 % sur un forfait de 900 € donne 990 €. Les clients fidèles qui comprennent la valeur restent le plus souvent.'],
      ['Remise contre contrepartie', 'Ne jamais baisser un prix sans contrepartie : engagement plus long, paiement anticipé, périmètre réduit, référence publique. Une remise offerte sans rien en échange devient le nouveau prix de référence.']
    ],
    memo: 'Forfait + prime plafonnée. Tout ajout est chiffré. Remise contre contrepartie. Relever un tarif avec préavis et résultats.',
    defi: 'Rédige la phrase que tu dis quand un client ajoute une tâche « en passant ».',
    sources: [],
    questions: [
      ch('x4q1', 'La commission', 'Un client propose de te payer uniquement 10 % des nouveaux abonnements apportés. Que réponds-tu ?',
        ['Oui, ça m’engage à fond.', 'Je propose un forfait de base et une prime sur les résultats, plafonnée, avec une définition claire de ce qui est compté.', 'Non, je ne travaille jamais à la performance.', 'Oui, mais je choisis les chiffres.'],
        ['Tu portes un risque sur l’acquisition sans en maîtriser tous les leviers.', 'Oui : tu sécurises ta rémunération et tu restes motivée par les résultats.', 'Tu écartes un bon format sans l’avoir étudié.', 'Un chiffre défini unilatéralement est une source de conflit.'],
        1, 'Forfait de base plus prime plafonnée : le risque est partagé.'),
      ch('x4q2', 'Juste un TikTok en plus', 'Chaque semaine, le client ajoute « juste un petit TikTok » non prévu dans le contrat. Que fais-tu ?',
        ['Tu le fais, c’est un petit geste.', 'Tu proposes un avenant chiffré ou le retrait d’une autre tâche, avant de le faire.', 'Tu le fais mais tu bâcles.', 'Tu rompts le contrat.'],
        ['Le petit geste devient la norme.', 'Oui : le périmètre protège ton temps et ton revenu.', 'Tu abîmes ta réputation.', 'Disproportionné à ce stade.'],
        1, 'Chaque ajout se chiffre ou se compense : sans cela, le périmètre n’existe plus.'),
      nb('x4q3', 'Le taux horaire réel', 'Forfait de 900 € par mois prévu pour 24 heures de travail. Ce mois-ci, tu passes 31 heures. Quel est ton taux horaire réel ? (en €/h)', 29.03, 0.05, '€/h', '900 ÷ 31 ≈ 29,03 €/h, contre 37,50 €/h prévus (900 ÷ 24).'),
      nb('x4q4', 'Relever son forfait', 'Tu relèves de 10 % un forfait de 900 € par mois. Nouveau forfait ? (en €)', 990, 0, '€', '900 × 1,1 = 990 €.'),
      ch('x4q5', 'La remise de 20 %', 'Un client te demande 20 % de remise en échange de « beaucoup de visibilité ». Que réponds-tu ?',
        ['Oui, la visibilité n’a pas de prix.', 'Tu acceptes une remise contre une contrepartie mesurable : contrat plus long, paiement anticipé ou référence écrite.', 'Tu refuses sans proposer d’alternative.', 'Tu acceptes puis tu travailles moins.'],
        ['La visibilité ne paie pas les cotisations.', 'Oui : une remise s’échange, elle ne se donne pas.', 'Fermer la porte sans alternative te coûte un client possible.', 'Tu dégrades la qualité sans le dire.'],
        1, 'Toute baisse de prix s’accompagne d’une contrepartie claire.'),
      mu('x4q6', 'Les clauses d’un retainer', 'Quelles clauses protègent un retainer mensuel ? (3 réponses)',
        ['Un préavis de résiliation', 'Un plafond d’heures et un tarif des heures supplémentaires', 'La remise des accès et des livrables à la fin de la mission', 'Un paiement « quand le client peut »'],
        ['Oui : il évite les ruptures brutales.', 'Oui : il encadre les dépassements.', 'Oui : la sortie de mission est prévue.', 'Non : un paiement sans échéance expose à l’impayé.'],
        [0, 1, 2], 'Préavis, plafond d’heures, sortie de mission : trois protections clés.'),
      nb('x4q7', 'Acompte et solde', 'Devis de 1 800 €, acompte de 30 % à la signature. Quel est le solde à la livraison ? (en €)', 1260, 0, '€', '30 % de 1 800 = 540 € ; 1 800 − 540 = 1 260 €.'),
      ch('x4q8', 'Moins cher ailleurs', 'Un prospect te dit qu’un autre freelance fait la même chose deux fois moins cher. Que fais-tu ?',
        ['Tu t’alignes sur son prix.', 'Tu clarifies le périmètre et le résultat attendu, tu compares les contenus des offres et tu proposes si besoin une version réduite.', 'Tu dénigres l’autre freelance.', 'Tu ne réponds pas.'],
        ['Tu perds ta marge et ta valeur perçue.', 'Oui : tu compares des prestations, pas des prix.', 'Dénigrer un confrère abîme ta crédibilité.', 'Tu abandonnes une vente possible.'],
        1, 'On compare des périmètres et des résultats, pas seulement des tarifs.')
    ]
  },
  {
    id: 'x5', code: 'X5', parcours: 'expert', niveau: 4, titre: 'Contrats, droits et sponsoring', duree: '14 min',
    court: 'Mentions obligatoires, droits sur les clips, images, données : savoir où s’arrête ton rôle.',
    objectif: 'Reconnaître les obligations qui s’imposent à un contenu sponsorisé, sécuriser les droits d’un clip et alerter au bon moment.',
    situation: 'Un jeu indépendant propose 1 200 € HT à ton client pour trois streams sponsorisés. Tu es chargée de publier les annonces. Le sponsor demande aussi un clip avec une musique connue.',
    cours: [
      ['Mention claire sur un contenu sponsorisé', 'Un contenu publié contre rémunération ou avantage doit afficher clairement la mention « Publicité » ou « Collaboration commerciale », lisible pendant toute la durée du contenu. Que tu publies au nom du streamer ou non, la mention ne se négocie pas pour l’esthétique.'],
      ['Contrat écrit', 'Au-delà d’un seuil (1 000 € HT dans les repères du module, à vérifier), une collaboration entre un créateur de contenu et un annonceur appelle un contrat écrit comportant des clauses précises. L’influenceur et l’annonceur peuvent être solidairement responsables en cas de dommage. À faire relire par un professionnel.'],
      ['Droits sur les clips et les montages', 'Musique, jeu, image du streamer, images d’invités : chacun a ses droits. Une cession de droits doit être écrite et préciser les droits cédés, leur étendue, leur destination, le lieu et la durée. Les éditeurs de jeux publient souvent des règles pour les créateurs : vérifie-les avant de monétiser ou de sponsoriser.'],
      ['Données de la communauté', 'Un concours qui collecte des e-mails ou des pseudos est un traitement de données personnelles. Collecte le strict nécessaire, annonce à quoi cela sert, limite la durée de conservation, protège le tableau.'],
      ['Le rôle du CM', 'Tu repères le risque, tu alertes, tu proposes une relecture. Tu ne tranches pas une question juridique à la place du client ou d’un professionnel. Ce module est pédagogique : il ne remplace pas un conseil juridique.']
    ],
    memo: 'Mention « Publicité » ou « Collaboration commerciale » sur tout contenu sponsorisé. Cession écrite et précise. Données minimales. Tu alertes, tu ne tranches pas.',
    defi: 'Prends un post sponsorisé récent de l’un de tes clients : vérifie la mention, sa lisibilité et sa durée d’affichage.',
    sources: ['influenceContrat'],
    questions: [
      ch('x5q1', 'La mention qui gâche l’esthétique', 'Tu publies pour le streamer un post issu d’une collaboration rémunérée. Il trouve que la mention casse l’esthétique et préfère la retirer. Que fais-tu ?',
        ['Tu la retires, c’est lui le client.', 'Tu la gardes visible et lisible, en proposant une intégration plus soignée.', 'Tu la glisses dans les hashtags.', 'Tu ne publies rien et tu ne dis rien.'],
        ['La mention est une obligation, pas un choix esthétique.', 'Oui : tu respectes l’obligation et tu réponds à la préoccupation d’image.', 'Une mention noyée n’est pas claire.', 'Tu bloques sans expliquer et laisses le problème intact.'],
        1, 'La mention « Collaboration commerciale » ou « Publicité » doit rester claire et lisible.', true),
      ch('x5q2', 'La musique connue', 'Le sponsor souhaite un clip avec le titre d’un artiste célèbre en fond. Le streamer est d’accord. Que fais-tu ?',
        ['Tu l’ajoutes, l’accord du streamer suffit.', 'Tu alertes : l’accord du streamer ne couvre pas les droits de l’artiste, et tu proposes une musique libre ou licenciée.', 'Tu l’ajoutes en baissant le volume.', 'Tu changes la musique sans en parler.'],
        ['Le streamer ne détient pas les droits sur la musique d’un tiers.', 'Oui : tu identifies le risque et proposes une alternative concrète.', 'Un volume bas ne change rien au droit.', 'Tu modifies sans en informer ni le streamer ni le sponsor.'],
        1, 'Les droits sur une musique appartiennent à ses titulaires, pas au streamer.'),
      nb('x5q3', 'Au-dessus du seuil', 'La collaboration rapporte 1 200 € HT. Le repère du module est un contrat écrit au-delà de 1 000 € HT. De combien de pour cent le montant dépasse-t-il le seuil ? (en %)', 20, 0.1, '%', '(1 200 − 1 000) ÷ 1 000 × 100 = 20 %. Le seuil est franchi : contrat écrit.'),
      ch('x5q4', 'Le tableur du concours', 'Pour un concours, tu collectes les e-mails des participants dans un tableur partagé avec toute l’équipe. Que fais-tu ?',
        ['Tu laisses tout le monde y accéder.', 'Tu collectes le strict nécessaire, tu informes les participants de l’usage, tu limites les accès et tu supprimes les données après le concours.', 'Tu gardes tout indéfiniment au cas où.', 'Tu envoies le tableur au sponsor sans prévenir.'],
        ['Trop d’accès pour des données personnelles.', 'Oui : minimum de données, finalité claire, durée limitée.', 'Conservation illimitée sans justification.', 'Transmettre sans information des participants est une faute.'],
        1, 'Données minimales, finalité annoncée, conservation limitée : le trio de base.'),
      mu('x5q5', 'Une cession de droits solide', 'Que doit préciser une cession de droits écrite ? (4 réponses)',
        ['Les droits cédés (reproduction, adaptation…)', 'Le territoire concerné', 'La durée', 'Les supports et destinations', 'La couleur de la charte graphique'],
        ['Oui : chaque droit se désigne.', 'Oui : le lieu fait partie des mentions.', 'Oui : la durée encadre la cession.', 'Oui : les supports délimitent l’exploitation.', 'Non : sans rapport avec la cession.'],
        [0, 1, 2, 3], 'Droits, territoire, durée, supports : l’étendue se définit précisément.'),
      ch('x5q6', 'Le sponsor veut une mention discrète', 'Le sponsor te demande de supprimer la mention « Collaboration commerciale » parce que « ça fait pub ». Que fais-tu ?',
        ['Tu l’enlèves, il paie.', 'Tu rappelles que la mention est obligatoire et tu proposes une formulation soignée.', 'Tu la laisses sans rien dire.', 'Tu refuses la mission.'],
        ['Tu acceptes un contenu qui ne respecte pas les règles.', 'Oui : tu appliques la règle et tu proposes une solution.', 'Tu ne réponds pas à sa demande.', 'Disproportionné : une solution existe.'],
        1, 'La mention est une obligation : on en discute la forme, pas l’existence.'),
      ch('x5q7', 'L’invité dans le clip', 'Un invité apparaît clairement dans un moment drôle. Tu veux publier le clip. Que fais-tu ?',
        ['Tu publies, c’était en public.', 'Tu demandes son accord (idéalement écrit) avant de publier ou tu recadres.', 'Tu publies et tu supprimes s’il se plaint.', 'Tu floutes son visage au hasard.'],
        ['Le droit à l’image s’applique même sur un live public.', 'Oui : accord préalable ou recadrage.', 'Tu agis a posteriori au risque d’un préjudice.', 'Un flou approximatif ne règle ni le fond ni la forme.'],
        1, 'L’accord d’une personne identifiable se demande avant de publier.'),
      ch('x5q8', 'Le désaccord juridique', 'Le sponsor et le streamer se disputent sur une clause d’exclusivité. Le streamer te demande de trancher. Que fais-tu ?',
        ['Tu tranches avec ton bon sens.', 'Tu expliques ce qui est écrit, tu signales les risques et tu recommandes une relecture par un professionnel du droit.', 'Tu prends le parti du sponsor.', 'Tu bloques les publications sans prévenir.'],
        ['Une erreur d’interprétation peut coûter cher.', 'Oui : tu éclaires sans te substituer à un juriste.', 'Tu choisis un camp sans fondement.', 'Tu bloques sans informer les parties.'],
        1, 'Tu repères le risque et orientes vers un professionnel : tu ne tranches pas.')
    ]
  }
  ];
  C.lecons.push(...NOUVELLES);
  C.melanger(NOUVELLES);
}(typeof globalThis !== 'undefined' ? globalThis : this));
