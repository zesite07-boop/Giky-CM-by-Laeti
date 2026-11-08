/* Parcours « Défis de pro » (2/2) : X6 à X10, niveaux 3 (difficile) et 4 (expert).
   Les chiffres légaux viennent de sources.js (vérifiés le 3 novembre 2026) : repères pédagogiques. */
(function (root) {
  'use strict';
  const C = root.CMContenu = root.CMContenu || { lecons: [] };
  const ch = (id, titre, texte, options, retours, bonne, explication, critique) =>
    Object.assign({ id, type: 'choix', titre, texte, options, retours, bonne, explication }, critique ? { critique: true } : {});
  const mu = (id, titre, texte, options, retours, bonne, explication) => ({ id, type: 'multiple', titre, texte, options, retours, bonne, explication });
  const nb = (id, titre, texte, bonne, tolerance, unite, explication) => ({ id, type: 'nombre', titre, texte, bonne, tolerance, unite, explication });

  const NOUVELLES = [
  {
    id: 'x6', code: 'X6', parcours: 'expert', niveau: 3, titre: 'Faire vivre une communauté', duree: '12 min',
    court: 'Accueil, rituels, santé du serveur : l’activité vaut mieux que le nombre de membres.',
    objectif: 'Diagnostiquer la santé d’une communauté, l’animer sans l’épuiser et évaluer l’effet d’un giveaway.',
    situation: 'Le Discord de ton client affiche 400 membres, mais une quinzaine seulement parlent chaque semaine. Il propose un giveaway « pour grossir le serveur ».',
    cours: [
      ['Mesurer la vie, pas la taille', 'Le taux d’activité (membres actifs ÷ membres) et la diversité de ceux qui parlent comptent plus que le total. Un serveur de 400 membres dont 15 parlent est un serveur de passage, pas une communauté.'],
      ['L’accueil en trois temps', 'Un message de bienvenue qui explique les règles en deux phrases, un salon où se présenter avec une question facile, et un premier rituel hebdomadaire (soirée de jeu, résumé de la semaine). On ne demande pas de s’engager avant d’avoir montré ce que le serveur apporte.'],
      ['Règles courtes et exemples', 'Cinq à sept règles claires valent mieux qu’un règlement de douze pages que personne ne lit. Ajoute un exemple concret pour les règles ambiguës et indique comment contester une décision.'],
      ['Les modérateurs bénévoles s’épuisent', 'Rotation des créneaux, remerciements visibles, droit de dire non, règles claires pour déléguer les cas difficiles. Un modérateur épuisé finit par partir ou par mal gérer un conflit.'],
      ['Giveaway : un outil, pas une stratégie', 'Un concours attire des chasseurs de lots. Mesure la rétention à 30 jours : combien de nouveaux membres sont encore actifs un mois plus tard ? C’est ce chiffre, pas le pic, qui justifie l’opération.']
    ],
    memo: 'Taux d’activité = actifs ÷ membres. Accueil, rituel, règles courtes. Un giveaway se juge à la rétention à 30 jours.',
    defi: 'Calcule le taux d’activité d’un serveur que tu connais et propose un rituel hebdomadaire en une phrase.',
    sources: [],
    questions: [
      ch('x6q1', 'Quatre cents membres, quinze actifs', 'Le serveur compte 400 membres et 15 actifs par semaine. Quelle est ta priorité ?',
        ['Créer dix nouveaux salons pour relancer l’activité.', 'Travailler l’accueil des nouveaux et installer un rituel hebdomadaire.', 'Recruter 200 membres supplémentaires.', 'Supprimer les membres inactifs.'],
        ['Plus de salons dilue encore une activité déjà faible.', 'Oui : tu donnes une raison de rester et de revenir.', 'Plus de membres sans vie ne règle rien.', 'Tu fais baisser le total sans créer de vie.'],
        1, 'Quand l’activité est faible, on soigne l’accueil et on installe un rendez-vous régulier.'),
      ch('x6q2', 'La critique acide', 'Un habitué critique systématiquement les choix du streamer, parfois avec des piques. Que fais-tu ?',
        ['Tu le bannis tout de suite.', 'Tu distingues critique argumentée et attaque, tu le contactes en privé et tu rappelles la règle si besoin.', 'Tu le laisses faire : un viewer, c’est un viewer.', 'Tu ne fais rien et tu laisses les modérateurs gérer.'],
        ['Tu te prives d’un point de vue peut-être utile sans distinction.', 'Oui : on traite l’attaque, on garde la critique.', 'Les piques répétées fatiguent la communauté.', 'Tu délègues sans consigne claire.'],
        1, 'Critique et harcèlement ne se traitent pas de la même façon.'),
      nb('x6q3', 'Le taux d’activité', 'Un serveur compte 400 membres dont 15 actifs sur la semaine. Quel est le taux d’activité ? (en %)', 3.75, 0.05, '%', '15 ÷ 400 × 100 = 3,75 %.'),
      mu('x6q4', 'Les signes de santé', 'Quels signaux montrent une communauté en bonne santé ? (3 réponses)',
        ['Les membres se répondent entre eux sans attendre le streamer', 'Plusieurs personnes différentes prennent la parole chaque semaine', 'Les nouveaux reviennent après leur premier message', 'Le nombre total de membres augmente'],
        ['Oui : la communauté se parle, pas seulement avec le streamer.', 'Oui : la diversité des voix montre une dynamique collective.', 'Oui : ils s’y sentent accueillis.', 'Non : le total seul ne dit rien de la vie du serveur.'],
        [0, 1, 2], 'Échanges entre membres, diversité des voix, retours après un premier message : ce sont les vrais signes.'),
      ch('x6q5', 'Le modérateur épuisé', 'Un modérateur bénévole très actif te dit qu’il n’en peut plus. Que fais-tu ?',
        ['Tu lui demandes de tenir jusqu’à la fin du mois.', 'Tu allèges son planning, tu le remercies explicitement et tu clarifies ce qu’il peut refuser.', 'Tu le remplaces sans rien dire.', 'Tu lui proposes plus de responsabilités pour le motiver.'],
        ['Tu risques de perdre un modérateur et de dégrader la modération.', 'Oui : tu prends soin des bénévoles.', 'Le départ brusque est humiliant et laisse un trou.', 'Plus de charge n’aide pas quand quelqu’un est épuisé.'],
        1, 'On protège les bénévoles : planning, reconnaissance, droit de refuser.'),
      ch('x6q6', 'Le giveaway pour grossir', 'Le streamer veut un giveaway « pour faire grossir le Discord ». Quelle réponse est la plus solide ?',
        ['Oui, plus de membres, c’est toujours mieux.', 'Oui, avec des conditions qui montrent un intérêt réel (participer à un live, répondre à une question) et un suivi de la rétention à 30 jours.', 'Non, les giveaways sont toujours mauvais.', 'Oui, avec le plus gros lot possible.'],
        ['Le total n’est pas l’objectif.', 'Oui : tu testes l’intérêt réel et tu mesures ce qui reste.', 'Un giveaway peut très bien fonctionner s’il est bien conçu.', 'Un gros lot attire surtout les chasseurs de lots.'],
        1, 'Un giveaway se prépare avec des conditions utiles et se juge à la rétention.'),
      nb('x6q7', 'La rétention après le concours', 'Le giveaway a fait arriver 300 nouveaux membres. Un mois plus tard, 45 d’entre eux sont encore actifs. Quelle est la rétention à 30 jours ? (en %)', 15, 0, '%', '45 ÷ 300 × 100 = 15 %. C’est ce chiffre qui permet de juger l’opération.'),
      ch('x6q8', 'Le règlement de douze pages', 'Le règlement du serveur fait douze pages. Que proposes-tu ?',
        ['Rien : mieux vaut tout prévoir.', 'Cinq à sept règles claires avec un exemple pour les cas ambigus et la voie de contestation.', 'Supprimer toutes les règles.', 'Mettre le règlement en majuscules.'],
        ['Un règlement que personne ne lit ne protège personne.', 'Oui : court, concret, applicable.', 'Sans règles, la modération devient arbitraire.', 'Les majuscules ne rendent pas un texte plus lisible.'],
        1, 'Des règles courtes et illustrées sont lues et appliquées.')
    ]
  },
  {
    id: 'x7', code: 'X7', parcours: 'expert', niveau: 4, titre: 'Gestion de crise et réputation', duree: '14 min',
    court: 'Rumeur, sponsor qui se retire, doxxing : vérifier, décider, parler une seule fois.',
    objectif: 'Conduire une crise dans l’ordre, rédiger un message d’attente et protéger la personne derrière la chaîne.',
    situation: 'Une rumeur accuse ton client d’un comportement grave. Des captures circulent. Le streamer veut tout supprimer et répondre immédiatement.',
    cours: [
      ['L’ordre qui évite les erreurs', 'Vérifier les faits, décider d’une ligne, communiquer, documenter, débriefer. Sauter la vérification pour répondre vite transforme une rumeur en preuve. Ne supprime rien : les suppressions alimentent l’accusation et détruisent ta propre documentation.'],
      ['Le message d’attente', 'Quand les faits ne sont pas établis : reconnaître qu’on a connaissance de la situation, annoncer qu’on vérifie, dire quand on reparlera. Pas d’accusation, pas de détails, pas de promesse impossible à tenir.'],
      ['Une seule voix', 'Un seul porte-parole, un seul message par canal, repris par l’équipe. Les modérateurs ne répondent pas à titre personnel. Les réponses contradictoires prolongent la crise.'],
      ['Données personnelles et sécurité', 'Si une adresse ou des informations privées sont publiées : retirer ou faire retirer les contenus, signaler à la plateforme, sécuriser les comptes, prévenir la personne, orienter vers un conseil juridique et, selon la gravité, les autorités. Ne jamais relayer ces informations.'],
      ['Prendre soin de la personne', 'Un streamer sous attaque peut cesser de lire le chat, se faire relayer, faire une pause. Le CM filtre, résume, protège. Si la détresse semble sérieuse, propose de l’aide professionnelle.']
    ],
    memo: 'Vérifier, décider, parler une fois, documenter. Ne rien supprimer à chaud. Message d’attente : je sais, je vérifie, je reviens à telle heure.',
    defi: 'Écris un message d’attente de quatre lignes pour une rumeur fictive visant l’un de tes clients.',
    sources: [],
    questions: [
      ch('x7q1', 'La rumeur grave', 'Une rumeur grave circule sur ton client. Il veut tout supprimer et répondre à chaud. Que fais-tu ?',
        ['Tu supprimes tout pour éteindre l’incendie.', 'Tu ne supprimes rien, tu vérifies les faits, tu prépares un message d’attente et tu laisses le streamer décider à froid.', 'Tu réponds toi-même sur ses réseaux pour le protéger.', 'Tu attends en silence que ça passe.'],
        ['Les suppressions donnent l’impression de cacher quelque chose et détruisent tes traces.', 'Oui : vérification, documentation, message d’attente, décision réfléchie.', 'Tu parles à sa place sur un sujet grave sans cadre ni validation.', 'Le silence total laisse la rumeur seule maîtresse du récit.'],
        1, 'On ne supprime rien à chaud : on vérifie, on documente et on décide à froid.', true),
      ch('x7q2', 'Le sponsor se retire', 'Deux heures avant le live, un sponsor annonce qu’il se retire après un message polémique de ton client. Que fais-tu ?',
        ['Tu publies le message du sponsor sur le compte du streamer.', 'Tu préviens le streamer, tu rassembles les faits, tu proposes une réponse courte et tu prépares un plan de repli pour le live.', 'Tu préviens le sponsor qu’il se trompe.', 'Tu annules le live.'],
        ['Tu aggraves la situation sans vérifier.', 'Oui : informer, vérifier, répondre court, préparer le repli.', 'Tu entres en conflit sans connaître les faits.', 'Tu prives le streamer d’une audience fidèle.'],
        1, 'Informer, vérifier, répondre court, prévoir un repli.'),
      mu('x7q3', 'Le message d’attente', 'Que contient un bon message d’attente ? (3 réponses)',
        ['Il reconnaît qu’on a connaissance de la situation', 'Il annonce qu’on vérifie les faits', 'Il indique quand on reparlera', 'Il accuse l’auteur de la rumeur'],
        ['Oui : tu ne laisses pas croire que tu ignores le sujet.', 'Oui : tu ne t’engages pas sur des faits non établis.', 'Oui : tu poses une échéance.', 'Non : une accusation sans preuve ajoute au conflit.'],
        [0, 1, 2], 'Reconnaître, vérifier, donner une échéance : trois éléments sans accusation.'),
      nb('x7q4', 'La portée du démenti', 'La rumeur a touché 12 000 comptes. Ton message de clarification en a touché 3 000. Quelle portée relative a-t-il ? (en %)', 25, 0, '%', '3 000 ÷ 12 000 × 100 = 25 %. Un démenti touche rarement autant de monde que la rumeur : planifie des relais.'),
      ch('x7q5', 'L’adresse publiée', 'L’adresse personnelle du streamer est publiée dans le chat par un inconnu. Que fais-tu ?',
        ['Tu relayes l’information pour alerter la communauté.', 'Tu fais supprimer le message, tu signales le compte, tu prévens le streamer, tu documentes et tu orientes vers un conseil juridique ou les autorités selon la gravité.', 'Tu ne fais rien : ce n’est qu’une adresse.', 'Tu bannis seulement l’auteur.'],
        ['Relayer, c’est diffuser davantage une information privée.', 'Oui : retirer, signaler, prévenir, documenter, orienter.', 'C’est une atteinte grave à la vie privée.', 'Le message reste visible et la personne reste exposée.'],
        1, 'Retirer, signaler, prévenir la personne, documenter et orienter : jamais relayer.', true),
      ch('x7q6', 'Le modérateur et la politique', 'Un modérateur publie une opinion politique tranchée dans le salon officiel, au nom de l’équipe. Que fais-tu ?',
        ['Tu laisses faire : il est libre de s’exprimer.', 'Tu rappelles en privé la charte de l’équipe et tu fais retirer ou corriger le message, sans polémique publique.', 'Tu publies un démenti long et détaillé.', 'Tu l’exclus de l’équipe sur-le-champ.'],
        ['Son message engage l’image de la chaîne.', 'Oui : tu protèges l’image tout en traitant le sujet en privé.', 'Un long démenti public amplifie la polémique.', 'Disproportionné pour un premier écart.'],
        1, 'On traite le sujet en privé, avec une charte claire, sans polémique publique.'),
      ch('x7q7', 'Après la crise', 'La crise est passée. Que fais-tu pour en tirer quelque chose ?',
        ['Rien, on tourne la page.', 'Un débrief documenté : chronologie, ce qui a marché, ce qui a manqué, puis mise à jour du protocole.', 'Tu cherches un responsable à sanctionner.', 'Tu supprimes toutes les traces.'],
        ['Sans débrief, la prochaine crise sera aussi mal préparée.', 'Oui : tu transformes l’épisode en protocole amélioré.', 'Chercher un coupable ne protège pas la prochaine fois.', 'Tu perds ta mémoire de l’événement.'],
        1, 'Chronologie, enseignements et protocole mis à jour : voilà le vrai retour d’expérience.'),
      ch('x7q8', 'Lire le chat malgré tout', 'Sous les attaques, le streamer insiste pour continuer à lire tout le chat en direct. Que proposes-tu ?',
        ['Tu le laisses faire : c’est son choix.', 'Tu proposes un filtre (modérateurs, résumé, mots bloqués), des pauses prévues et un point après le live.', 'Tu coupes le chat sans le prévenir.', 'Tu lui dis d’arrêter le streaming.'],
        ['Tu ne protèges pas la personne exposée.', 'Oui : tu protèges sans décider à sa place.', 'Tu agis sans l’associer à la décision.', 'Tu dépasses ton rôle.'],
        1, 'Filtrer, prévoir des pauses et faire un point : on protège sans décider à la place de la personne.')
    ]
  },
  {
    id: 'x8', code: 'X8', parcours: 'expert', niveau: 3, titre: 'Opérations, outils et sécurité des accès', duree: '12 min',
    court: 'Procédures, lots de contenus, automatisation raisonnée et accès délégués.',
    objectif: 'Organiser son travail pour qu’il tienne en cas d’absence, automatiser sans déshumaniser et sécuriser les accès.',
    situation: 'Tu gères trois clients seule. Un streamer t’envoie son mot de passe par message pour que tu publies. Tu tombes malade une semaine et personne ne sait où sont tes fichiers.',
    cours: [
      ['Documenter pour pouvoir t’absenter', 'Une liste de procédures courtes (publier un clip, annoncer un live, modérer un incident), un calendrier partagé, un dossier de fichiers sources et la liste des accès. Si tu es absente, quelqu’un peut reprendre en une heure.'],
      ['Travailler par lots', 'Préparer douze posts d’une traite plutôt qu’un par jour réduit la perte de concentration. Compare toujours le temps total avec et sans lot : gagner une heure sur quatre est déjà de l’ordre de 25 %.'],
      ['Automatiser les tâches répétitives, pas les relations', 'Annonces récurrentes, réponses aux questions fréquentes, rappels d’horaires : bonnes candidates. Réponse à un viewer en détresse, gestion d’un conflit, négociation : jamais automatisées.'],
      ['Accès délégués et sécurité', 'Ne demande jamais un mot de passe : demande un rôle délégué (modérateur, éditeur, gestionnaire de la page). Active la double authentification, utilise un gestionnaire de mots de passe, et retire les accès à la fin de chaque mission.'],
      ['Fin de mission propre', 'Liste des accès, révocation, remise des fichiers et d’un guide de passation. C’est aussi ce qui donne envie de te recommander.']
    ],
    memo: 'Procédures écrites, lots de contenus, automatisation des répétitions, accès délégués (pas de mots de passe), fin de mission documentée.',
    defi: 'Liste les trois procédures qui te manquent le plus si tu devais t’absenter une semaine.',
    sources: [],
    questions: [
      ch('x8q1', 'Le mot de passe par message', 'Un streamer t’envoie son mot de passe par message privé pour que tu publies. Que fais-tu ?',
        ['Tu t’en sers, c’est plus rapide.', 'Tu le supprimes de la conversation, tu lui conseilles de le changer et tu demandes un accès délégué (rôle) à la place.', 'Tu le partages avec ton équipe pour qu’elle puisse aussi publier.', 'Tu le notes sur un papier.'],
        ['Un mot de passe partagé expose le compte et ne se contrôle pas.', 'Oui : accès délégué, mot de passe changé, bonne pratique installée.', 'Tu multiplies les risques.', 'Un papier se perd ou se lit.'],
        1, 'On demande un rôle délégué, jamais le mot de passe.', true),
      ch('x8q2', 'La fin d’une mission', 'Ta mission se termine à la fin du mois. Quelle est la meilleure sortie ?',
        ['Tu pars en laissant les accès actifs au cas où.', 'Tu listes les accès, les révoques avec le client, remets les fichiers et un guide de passation.', 'Tu supprimes les contenus que tu as créés.', 'Tu coupes le contact.'],
        ['Des accès oubliés sont un risque pour toi comme pour le client.', 'Oui : sortie propre et documentée.', 'Tu détruis la valeur que tu as créée.', 'Tu laisses le client sans mode d’emploi.'],
        1, 'Accès révoqués, fichiers remis, guide de passation.'),
      nb('x8q3', 'Le gain du travail par lots', 'Préparer 12 posts un par un prend 20 minutes chacun. En lot, il te faut 3 heures au total. Quel est le gain de temps ? (en %)', 25, 0.1, '%', '12 × 20 = 240 min ; 240 − 180 = 60 min gagnées ; 60 ÷ 240 × 100 = 25 %.'),
      mu('x8q4', 'Ce qui s’automatise bien', 'Quelles tâches sont de bonnes candidates à l’automatisation ? (3 réponses)',
        ['L’annonce récurrente d’un live', 'La réponse à une question fréquente sur les horaires', 'Le rappel envoyé une heure avant le live', 'La réponse à un viewer qui exprime une détresse'],
        ['Oui : répétitive, prévisible.', 'Oui : la réponse est stable.', 'Oui : action simple et régulière.', 'Non : une situation sensible demande un humain.'],
        [0, 1, 2], 'On automatise le répétitif, jamais la relation sensible.'),
      ch('x8q5', 'Le bot trop bavard', 'Le client veut qu’un bot réponde à toutes les questions du chat. Que proposes-tu ?',
        ['Tu laisses le bot tout gérer.', 'Tu limites le bot aux questions fréquentes et tu gardes l’humain pour le reste, avec un moyen de passer la main.', 'Tu supprimes le bot.', 'Tu programmes des réponses sarcastiques.'],
        ['Un bot hors de son cadre produit des gaffes visibles.', 'Oui : le bot allège, l’humain décide.', 'Tu perds un gain de temps réel.', 'Le sarcasme automatisé est risqué.'],
        1, 'Cadre étroit pour le bot, humain pour le reste.'),
      ch('x8q6', 'Tomber malade une semaine', 'Tu travailles seule pour trois clients. Comment éviter le blocage si tu es absente une semaine ?',
        ['Tu espères ne jamais tomber malade.', 'Tu tiens des procédures courtes, un calendrier partagé et une liste d’accès, et tu as une personne de confiance en renfort.', 'Tu confies tout à un bot.', 'Tu préviens les clients que tu es toujours disponible.'],
        ['Ce n’est pas un plan.', 'Oui : documentation et renfort.', 'Un bot ne remplace pas ton jugement.', 'Tu leur dis le contraire de la réalité.'],
        1, 'Procédures, calendrier partagé, accès listés et un relais possible.'),
      nb('x8q7', 'Le coût annuel des outils', 'Tes outils : 22 $ par mois, 12 € par mois et un abonnement de 120 $ par an. Taux de référence : 1 € = 1,1216 $. Quel est le coût annuel total en euros ? (arrondi à l’euro)', 486, 1, '€', '(22 × 12 + 120) $ = 384 $ ÷ 1,1216 ≈ 342,4 € ; 12 € × 12 = 144 € ; total ≈ 486 €.'),
      ch('x8q8', 'Où vit le calendrier', 'Le calendrier éditorial existe dans trois fichiers différents. Que fais-tu ?',
        ['Tu gardes les trois par prudence.', 'Tu choisis un seul outil partagé comme source de vérité et tu archives les autres.', 'Tu demandes à chacun de tenir le sien.', 'Tu le gardes dans ta tête.'],
        ['Trois versions, trois erreurs possibles.', 'Oui : une source de vérité unique.', 'Chacun travaille avec une version différente.', 'Un calendrier mental ne se transmet pas.'],
        1, 'Un seul calendrier partagé évite les doublons et les oublis.')
    ]
  },
  {
    id: 'x9', code: 'X9', parcours: 'expert', niveau: 4, titre: 'Piloter son activité de freelance', duree: '14 min',
    court: 'Dépendance à un client, taux horaire réel, seuils, trésorerie : décider avec des chiffres.',
    objectif: 'Calculer sa dépendance, son taux horaire effectif, sa marge sous les seuils et sa réserve, puis décider.',
    situation: 'Tu es à 100 % de ta capacité. Un client représente la moitié de ton chiffre d’affaires. Un nouveau client intéressant arrive, et ton chiffre d’affaires approche du seuil de franchise de TVA.',
    cours: [
      ['La dépendance à un client', 'Part d’un client = son chiffre d’affaires ÷ ton chiffre d’affaires total. Plus un client pèse, plus sa perte est dangereuse. Un repère de prudence souvent évoqué (ce n’est pas une règle) : ne pas dépasser environ un tiers du chiffre d’affaires sur un seul client.'],
      ['Le taux horaire effectif', 'Chiffre d’affaires ÷ toutes les heures travaillées (facturables ou non : prospection, administratif, échanges). 3 000 € pour 120 heures donnent 25 € de l’heure, bien moins que le taux affiché. C’est ce chiffre qui oriente tes prix.'],
      ['Les seuils de la micro-entreprise', 'Le plafond de chiffre d’affaires et la franchise de TVA ont chacun un seuil de base et un seuil majoré (voir les sources du module). Quand le seuil majoré est dépassé en cours d’année, la TVA s’applique dès le dépassement : vérifie les dates précises sur la source officielle et préviens tes clients.'],
      ['Réserve et capacité', 'Une réserve de trois mois de dépenses protège des creux. À 100 % de capacité, un nouveau client se choisit : plus cher, mieux rémunéré ou refusé. Dire non à un client moins rentable libère de la place pour un meilleur.'],
      ['Réviser ses tarifs chaque année', 'Une hausse annuelle (inflation, expérience, résultats) annoncée avec préavis est une pratique normale. Ne pas augmenter pendant deux ans revient à baisser son revenu réel.']
    ],
    memo: 'Part de client = CA client ÷ CA total. Taux horaire effectif = CA ÷ toutes les heures. Seuils : vérifier la source. Réserve de 3 mois.',
    defi: 'Calcule la part de ton plus gros client et ton taux horaire effectif du mois dernier.',
    sources: ['seuilsMicro', 'tvaFranchise'],
    questions: [
      nb('x9q1', 'La part du premier client', 'Ton chiffre d’affaires annuel est de 36 000 €, dont 18 000 € viennent d’un seul client. Quelle est sa part ? (en %)', 50, 0, '%', '18 000 ÷ 36 000 × 100 = 50 %. La moitié de ton activité dépend d’un client.'),
      ch('x9q2', 'La dépendance', 'Un client pèse 50 % de ton chiffre d’affaires. Quelle est la meilleure réaction ?',
        ['Aucune : tout va bien tant qu’il paie.', 'Tu prospectes activement et tu fixes un objectif de diversification, sans te fâcher avec lui.', 'Tu lui demandes de payer plus.', 'Tu coupes la relation.'],
        ['Sa perte te mettrait en difficulté immédiate.', 'Oui : tu réduis le risque progressivement.', 'Cela ne règle pas le risque de dépendance.', 'Tu détruis la moitié de ton revenu.'],
        1, 'Diversifier progressivement réduit le risque sans abîmer la relation.'),
      nb('x9q3', 'Le taux horaire effectif', 'Tu factures 3 000 € dans le mois et tu as travaillé 120 heures au total (facturables, prospection et administratif). Quel est ton taux horaire effectif ? (en €/h)', 25, 0, '€/h', '3 000 ÷ 120 = 25 €/h.'),
      nb('x9q4', 'La marge sous le seuil', 'Tu as encaissé 31 200 € en services et la franchise de TVA est à 37 500 € (repère du module). Combien peux-tu encore encaisser avant le seuil de base ? (en €)', 6300, 0, '€', '37 500 − 31 200 = 6 300 €. Le seuil majoré (41 250 €) joue ensuite : vérifie les règles sur la source officielle.'),
      ch('x9q5', 'Le dépassement du seuil majoré', 'En cours d’année, ton chiffre d’affaires dépasse le seuil majoré de la franchise de TVA (41 250 € dans les repères du module). Que fais-tu ?',
        ['Tu continues sans TVA jusqu’à la fin de l’année.', 'Tu vérifies sur la source officielle la date à partir de laquelle la TVA s’applique, tu l’appliques et tu prépares tes clients.', 'Tu arrêtes de facturer.', 'Tu demandes à un client de payer en espèces.'],
        ['Tu risques un redressement.', 'Oui : tu appliques la règle et tu prépares les clients.', 'Tu cesses ton activité inutilement.', 'Tu aggraves ton cas.'],
        1, 'Au dépassement du seuil majoré, la TVA s’applique : vérifie la date sur la source officielle.', true),
      ch('x9q6', 'À pleine capacité', 'Tu es à 100 % de ta capacité et un nouveau client intéressant arrive. Que fais-tu ?',
        ['Tu acceptes en travaillant le soir.', 'Tu proposes un tarif plus élevé ou une date de démarrage plus tardive, ou tu le refuses si le tarif ne justifie pas l’effort.', 'Tu acceptes à un tarif cassé pour te démarquer.', 'Tu abandonnes un ancien client sans prévenir.'],
        ['Tu te surcharges et ta qualité baisse.', 'Oui : la capacité est limitée, le prix aussi se gère.', 'Tu dévalues ta prestation.', 'Rupture brutale, mauvaise réputation.'],
        1, 'À pleine capacité, le prix ou le délai doit rendre le nouveau client rentable.'),
      nb('x9q7', 'La réserve de trésorerie', 'Tes dépenses sont de 1 600 € par mois. Tu vises trois mois de réserve. Quel montant vises-tu ? (en €)', 4800, 0, '€', '1 600 × 3 = 4 800 €.'),
      ch('x9q8', 'Deux ans sans hausse', 'Tu n’as pas augmenté tes tarifs depuis deux ans, avec de meilleurs résultats entre-temps. Que fais-tu ?',
        ['Rien : mieux vaut ne pas risquer de perdre des clients.', 'Tu annonces une hausse avec préavis, tu t’appuies sur des résultats chiffrés et tu proposes une date d’effet.', 'Tu doubles tes tarifs du jour au lendemain.', 'Tu augmentes en t’excusant longuement de le faire.'],
        ['Tu baisses ton revenu réel.', 'Oui : hausse annoncée, argumentée et datée.', 'Brutal et mal reçu.', 'Une hausse argumentée n’appelle pas d’excuses.'],
        1, 'Une hausse annoncée avec préavis et résultats à l’appui est normale.')
    ]
  },
  {
    id: 'x10', code: 'X10', parcours: 'expert', niveau: 4, titre: 'Boss rush : cas complexes', duree: '16 min',
    court: 'Huit situations mêlant légal, chiffres, crise et négociation, sans réponse évidente.',
    objectif: 'Arbitrer entre plusieurs contraintes à la fois et justifier ses choix.',
    situation: 'Une semaine ordinaire pour un CM confirmé : un sponsor, un client britannique, une analyse à rendre, un modérateur en conflit et trois demandes urgentes à 17 h.',
    cours: [
      ['Trier avant d’agir', 'Classe chaque demande selon l’impact (légal, réputation, revenu) et le délai réel. Un risque légal ou de sécurité passe avant un délai commercial, qui passe avant une envie. Dis-le : « Je fais d’abord A, B demain matin. »'],
      ['Dire ce que tu ne promets pas', 'Tu t’engages sur des actions et un suivi, pas sur un résultat dépendant d’autres facteurs (followers, abonnés, ventes). Reformuler une promesse en engagement mesurable est un réflexe de pro.'],
      ['Devises et preuves', 'Un paiement en livres se convertit au taux du jour de la facture, avec le montant en devise, la contre-valeur en euros et le taux indiqués. Garde la trace du taux utilisé.'],
      ['Conflits internes', 'Écoute chacun séparément, rappelle la règle, propose un compromis qui protège le live. Les conflits entre bénévoles se règlent hors du chat.']
    ],
    memo: 'Impact avant urgence. Engagements mesurables, pas de résultats garantis. Taux de change tracé. Conflits traités hors du chat.',
    defi: 'Prends tes trois demandes les plus pressantes de la semaine et classe-les avec la règle impact puis délai.',
    sources: [],
    questions: [
      ch('x10q1', 'Trois demandes à 17 h', 'À 17 h, trois demandes arrivent : (A) un post sponsorisé à publier ce soir sans mention, (B) un client qui veut un rapport pour demain, (C) un message privé inquiétant d’un viewer vers un modérateur. Dans quel ordre traites-tu ?',
        ['A, B, C : le sponsor paie.', 'C, puis A après l’avoir mis aux normes, puis B.', 'B, A, C : le rapport est un livrable.', 'Tu ne fais rien avant le lendemain.'],
        ['Tu laisses un risque humain et un risque légal de côté.', 'Oui : la sécurité des personnes d’abord, la conformité ensuite, puis le livrable.', 'Le risque humain passe en dernier, c’est une erreur.', 'Tu laisses trois sujets sensibles en suspens.'],
        1, 'Sécurité des personnes, conformité légale, puis livrable commercial.', true),
      nb('x10q2', 'Le paiement en livres', 'Un client britannique te règle 1 800 £. Taux de référence : 1 € = 0,8358 £. Quel montant en euros enregistres-tu ? (arrondi à l’euro)', 2154, 1, '€', '1 800 ÷ 0,8358 ≈ 2 153,6 €. Mentionne le montant en livres, la contre-valeur en euros et le taux utilisé.'),
      ch('x10q3', 'La promesse du client', 'Un client te demande de t’engager par écrit sur « +20 % de viewers en deux mois ». Que fais-tu ?',
        ['Tu signes : ça te motive.', 'Tu t’engages sur des actions et un suivi mesuré (fréquence, formats, rapport mensuel), pas sur le chiffre lui-même.', 'Tu signes en négociant une grosse prime.', 'Tu refuses de travailler avec lui.'],
        ['Tu promets un résultat que tu ne maîtrises pas seule.', 'Oui : engagement sur les moyens, pas sur le résultat.', 'Une prime ne rend pas la promesse tenable.', 'Disproportionné : une reformulation suffit.'],
        1, 'On s’engage sur des actions mesurables, pas sur un résultat dépendant de nombreux facteurs.', true),
      nb('x10q4', 'Le coût par follower', 'Une campagne de 150 € a rapporté 240 nouveaux followers. Quel est le coût par follower ? (en €, arrondi au centime)', 0.63, 0.01, '€', '150 ÷ 240 = 0,625, soit environ 0,63 € par follower.'),
      ch('x10q5', 'Le conflit entre deux modérateurs', 'Deux modérateurs s’accrochent publiquement dans le salon de modération pendant un live. Que fais-tu ?',
        ['Tu laisses faire : ils s’arrangeront.', 'Tu interviens sobrement dans le salon, tu les sépares sur le live, puis tu les écoutes chacun en privé.', 'Tu les exclus tous les deux.', 'Tu prends parti dès le premier échange.'],
        ['Le live en souffre et d’autres le voient.', 'Oui : tu protèges le live, tu règles hors du salon.', 'Tu perds deux bénévoles et un savoir-faire.', 'Tu décides sans connaître les faits.'],
        1, 'Séparer sur le live, écouter chacun en privé.'),
      ch('x10q6', 'Le sous-traitant', 'Tu veux confier le montage de clips à un sous-traitant. Qu’est-ce qui est indispensable avant de commencer ?',
        ['Rien : tu lui fais confiance.', 'Un contrat écrit : périmètre, délais, cession des droits sur les clips, confidentialité et conditions de paiement.', 'Un message oral.', 'Un accès complet à tous les comptes du client.'],
        ['Sans écrit, aucune protection.', 'Oui : le cadre écrit protège toutes les parties.', 'Un oral ne prouve rien.', 'Tu donnes bien plus d’accès que nécessaire.'],
        1, 'Cadre écrit, droits cédés, confidentialité, accès limités.'),
      mu('x10q7', 'Un rapport professionnel', 'Quels éléments font un rapport mensuel crédible ? (3 réponses)',
        ['Les chiffres de départ et d’arrivée de chaque indicateur', 'Le signalement des événements exceptionnels du mois', 'Une recommandation chiffrée pour le mois suivant', 'Seulement les chiffres qui flattent le client'],
        ['Oui : une évolution se lit avec sa base.', 'Oui : le contexte évite les fausses conclusions.', 'Oui : le rapport débouche sur une décision.', 'Non : un rapport tronqué trompe le client.'],
        [0, 1, 2], 'Bases, contexte, recommandation : le trio d’un rapport utile.'),
      ch('x10q8', 'Le sponsor et le live caritatif', 'Le sponsor exige un post le soir où le streamer organise un live caritatif important. Que fais-tu ?',
        ['Tu publies quand même, c’est écrit au contrat.', 'Tu prévois le conflit, tu proposes un autre créneau, tu vérifies la clause de date et tu en parles au streamer avant de répondre.', 'Tu annules le live caritatif.', 'Tu ne réponds pas au sponsor.'],
        ['Tu risques de nuire à un événement important.', 'Oui : tu anticipes et tu proposes une alternative.', 'Tu sacrifies un événement pour une clause.', 'Tu bloques sans informer.'],
        1, 'Vérifier la clause, proposer un créneau et informer le streamer avant de répondre.')
    ]
  }
  ];
  C.lecons.push(...NOUVELLES);
  C.melanger(NOUVELLES);
}(typeof globalThis !== 'undefined' ? globalThis : this));
