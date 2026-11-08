/* Parcours Business (B10 à B12) et Apprendre (T9) : réseaux pro et clipping.
   B10 Facebook Pro (Meta Business Suite), B11 WhatsApp Business, B12 LinkedIn en pro, T9 Le clipping Twitch.
   Les fonctions décrites viennent des pages d’aide officielles (voir sources.js, vérifiées le 8 novembre 2026).
   Les menus et les offres changent : rouvrir la source avant d’appliquer. Aucun abonnement n’est nécessaire. */
(function (root) {
  'use strict';
  const C = root.CMContenu = root.CMContenu || { lecons: [] };
  const ch = (id, titre, texte, options, retours, bonne, explication, critique) =>
    Object.assign({ id, type: 'choix', titre, texte, options, retours, bonne, explication }, critique ? { critique: true } : {});
  const mu = (id, titre, texte, options, retours, bonne, explication) => ({ id, type: 'multiple', titre, texte, options, retours, bonne, explication });
  const nb = (id, titre, texte, bonne, tolerance, unite, explication) => ({ id, type: 'nombre', titre, texte, bonne, tolerance, unite, explication });

  const NOUVELLES = [
  {
    id: 'b10', code: 'B10', parcours: 'business', niveau: 2, titre: 'Facebook en version pro : Meta Business Suite', duree: '12 min',
    court: 'Une Page, un outil gratuit, un calendrier : gérer Facebook et Instagram au même endroit.',
    objectif: 'Mettre en place ta présence pro sur Facebook et programmer tes publications sans payer.',
    situation: 'Un client te demande : « Tu peux aussi gérer ma Page Facebook ? » Tu as ton compte personnel, mais pas de présence pro. Tu veux faire propre, sans mélanger vie privée et métier, et sans abonnement.',
    cours: [
      ['La Page, pas ton profil', 'Pour travailler, on utilise une Page Facebook (ton activité) et non ton profil personnel. Tu donnes aux autres des rôles sur la Page, jamais ton mot de passe. C’est ce qui permet de séparer le privé du pro et de travailler pour un client sans accéder à son compte perso.'],
      ['Meta Business Suite, l’outil gratuit', 'Meta Business Suite regroupe, gratuitement, la gestion de tes comptes Facebook et Instagram : accueil avec la liste des choses à faire, calendrier de contenu, création et programmation de posts, stories et reels, statistiques (insights) et boîte de réception unique. Les outils de l’ancien Creator Studio y ont été regroupés.'],
      ['Programmer en lot', 'Tu peux créer un post, choisir Facebook, Instagram ou les deux, puis « Programmer pour plus tard » (date et heure), ou l’enregistrer en brouillon. Tout apparaît dans le calendrier, où tu peux aussi dupliquer un post. Un post Instagram doit contenir un média (image ou vidéo).'],
      ['La boîte de réception', 'L’Inbox rassemble les messages et commentaires de la Page, de Messenger, d’Instagram et d’un compte WhatsApp Business. Tu peux y créer des réponses automatiques pour les questions qui reviennent (horaires, tarifs, planning).'],
      ['Les rôles', 'Dans les paramètres, tu ajoutes des personnes et leur donnes un rôle sur chaque actif (Page, compte Instagram). Il faut un rôle qui autorise à publier pour créer un post. Un client te donne un accès avec un rôle limité : tu peux publier sans voir ses données privées, et il peut te retirer l’accès quand il veut.'],
      ['Sans abonnement', 'Tout ce qui précède est gratuit. La publicité (booster un post, Ads Manager) est une option payante et facultative : tu peux décider de ne jamais y toucher, ou de la proposer au client comme prestation séparée, avec son propre budget.']
    ],
    tableau: { legende: 'Quoi faire où', entetes: ['Je veux…', 'Où dans Meta Business Suite'], lignes: [
      ['Planifier ma semaine', 'Calendrier + « Programmer pour plus tard »'],
      ['Répondre vite', 'Inbox + réponses automatiques'],
      ['Voir ce qui marche', 'Insights (statistiques)'],
      ['Donner un accès à un client', 'Paramètres, personnes et rôles']
    ] },
    memo: 'Une Page pour le pro, jamais ton profil. Meta Business Suite = gratuit : calendrier, Inbox, insights, rôles. La pub est une option payante, pas une obligation.',
    defi: 'Ouvre Meta Business Suite, programme un post de test en brouillon pour dans 3 jours et regarde-le apparaître dans le calendrier.',
    sources: ['metaSuite', 'metaProgrammer', 'metaCalendrier', 'metaRoles'],
    questions: [
      ch('b10q1', 'Page ou profil', 'Tu gères la communication d’un client sur Facebook. Où publies-tu ?',
        ['Depuis ton profil personnel, c’est plus rapide.', 'Depuis sa Page, avec un rôle que le client t’a attribué.', 'Avec son mot de passe, pour tout voir.'],
        ['Tu mélangerais privé et pro, et tu exposerais ton profil.', 'C’est la méthode propre : accès limité, révocable, vie privée séparée.', 'Ne demande jamais un mot de passe : un rôle suffit.'],
        1, 'On travaille depuis une Page, avec un rôle attribué, jamais avec les identifiants du client.', true),
      ch('b10q2', 'Le prix de l’outil', 'Combien coûte Meta Business Suite pour programmer des posts et lire l’Inbox ?',
        ['Un abonnement mensuel obligatoire.', 'C’est gratuit ; seules les publicités sont payantes, et elles sont facultatives.', 'Il faut payer pour chaque post programmé.'],
        ['Non : la gestion de tes comptes est gratuite.', 'Oui : la pub est une option, pas un prérequis.', 'Non : aucun tarif par post.'],
        1, 'Meta Business Suite est un outil gratuit ; la publicité est une option payante.'),
      ch('b10q3', 'Instagram aussi', 'Tu programmes un post pour Facebook et Instagram avec seulement du texte. Que se passe-t-il ?',
        ['Rien de particulier.', 'Pour Instagram, il faut au moins un média : ajoute une image ou une vidéo.', 'Instagram transforme le texte en image seul.'],
        ['Non : Instagram demande un média.', 'Oui : les posts Instagram doivent comporter une image ou une vidéo.', 'Non, il ne le fait pas pour toi.'],
        1, 'Un post Instagram doit inclure un média ; un post Facebook peut être du texte seul.'),
      mu('b10q4', 'Dans l’Inbox', 'Quels messages peux-tu lire et gérer dans l’Inbox de Meta Business Suite ? (2 réponses ou plus)',
        ['Les messages et commentaires de ta Page Facebook.', 'Ceux de ton compte Instagram pro.', 'Les SMS de ton téléphone.', 'Les mails de ta boîte Gmail.'],
        ['Oui.', 'Oui, avec Messenger.', 'Non, ce ne sont pas des canaux Meta.', 'Non, c’est une autre boîte.'],
        [0, 1], 'L’Inbox réunit Page, Messenger, Instagram et un compte WhatsApp Business.'),
      ch('b10q5', 'Le brouillon', 'Tu hésites sur le texte d’un post. Comment ne pas le perdre ?',
        ['Tu le publies puis le supprimes.', 'Tu l’enregistres en brouillon, il se retrouve plus tard.', 'Tu le gardes ouvert dans un onglet.'],
        ['Mauvaise idée : il serait visible un instant.', 'Oui : brouillon puis programmation quand c’est prêt.', 'Fragile : tu risques de tout perdre.'],
        1, 'Le brouillon sert à terminer plus tard, sans publier.'),
      ch('b10q6', 'Le client ne veut plus', 'La mission se termine. Que fait le client pour reprendre le contrôle ?',
        ['Il change de Facebook.', 'Il retire ton rôle dans les paramètres de sa Page.', 'Il supprime sa Page.'],
        ['Disproportionné.', 'Oui : les rôles se retirent à tout moment.', 'Il perdrait toute sa communauté.'],
        1, 'Les rôles sont révocables : c’est la garantie du client et la tienne.')
    ]
  },
  {
    id: 'b11', code: 'B11', parcours: 'business', niveau: 2, titre: 'WhatsApp Business : un téléphone pro, sans abonnement', duree: '12 min',
    court: 'Profil pro, messages automatiques, réponses rapides, étiquettes : l’appli gratuite suffit.',
    objectif: 'Configurer WhatsApp Business pour répondre vite et rester organisée, sans mélanger pro et perso.',
    situation: 'Tes clients te contactent sur ton WhatsApp perso, parfois à 23 h. Tu perds des messages et tu ne sais plus qui attend quoi. Tu veux une messagerie pro, simple et gratuite.',
    cours: [
      ['Deux applis, deux usages', 'WhatsApp Business est une appli gratuite à télécharger, pensée pour les petites entreprises : profil professionnel, messages automatiques, réponses rapides, étiquettes. La WhatsApp Business Platform, elle, est faite pour les moyennes et grandes entreprises et s’intègre par programmation : tu n’en as pas besoin pour ton métier.'],
      ['Un numéro dédié', 'WhatsApp recommande un numéro réservé à l’activité pour séparer clairement le travail du privé. Tu peux utiliser WhatsApp (perso) et WhatsApp Business sur deux numéros différents sur le même téléphone.'],
      ['Le profil pro', 'Dans Outils, Profil de l’entreprise : nom que tes clients connaissent, photo reconnaissable, description courte et précise, horaires, adresse si utile, e-mail et site. Un profil complet rassure avant même le premier message.'],
      ['Accueil et absence', 'Le message d’accueil salue la première prise de contact. Le message d’absence rassure hors horaires. Dans l’absence, indique toujours quand tu réponds : « Je réponds en jours ouvrés, 9 h à 18 h ».'],
      ['Réponses rapides', 'Tu enregistres tes réponses fréquentes derrière un raccourci (par exemple « /tarifs » ou « /planning »). Relis-les : elles sont souvent le premier contact. Une structure simple : salutation + une réponse claire + une prochaine étape.'],
      ['Étiquettes et listes', 'Pour ne rien perdre : « Nouveau contact », « Devis envoyé », « En cours », « Paiement en attente », « Terminé ». WhatsApp conseille 5 minutes en fin de journée pour étiqueter les conversations ouvertes.'],
      ['Équipe et appareils', 'L’appli permet de lier plusieurs appareils sur un même numéro, utile si un associé ou un assistant répond avec toi.']
    ],
    tableau: { legende: 'Les outils WhatsApp Business', entetes: ['Outil', 'À quoi ça sert'], lignes: [
      ['Message d’accueil', 'Saluer la première prise de contact'],
      ['Message d’absence', 'Dire quand tu réponds, hors horaires'],
      ['Réponses rapides', 'Envoyer tarifs, planning, process en un raccourci'],
      ['Étiquettes', 'Savoir qui attend quoi']
    ] },
    memo: 'Appli Business gratuite. Numéro dédié. Profil complet, accueil + absence avec un délai de réponse, 5 réponses rapides, étiquettes. 5 minutes d’étiquetage chaque soir.',
    defi: 'Écris tes 5 réponses rapides (tarifs, planning, process, horaires, prochaine étape) et le message d’absence avec ton délai de réponse.',
    sources: ['waOnboarding', 'waFirst', 'waFaq', 'waLists'],
    questions: [
      ch('b11q1', 'Gratuit ou payant', 'Quelle version de WhatsApp convient à une freelance qui répond à ses clients depuis son téléphone ?',
        ['La WhatsApp Business Platform, pour les grandes entreprises.', 'L’appli WhatsApp Business, gratuite à télécharger.', 'Un abonnement obligatoire à une agence.'],
        ['C’est pour les moyennes et grandes entreprises, avec intégration.', 'Oui : conçue pour les petites entreprises, depuis un appareil.', 'Aucune obligation.'],
        1, 'L’appli Business est gratuite et suffit pour une activité de freelance.'),
      ch('b11q2', 'Le message d’absence', 'Quel message d’absence est le plus utile ?',
        ['« Absente. »', '« Merci ! Je réponds en jours ouvrés de 9 h à 18 h, à demain matin. »', '« Réponse dans les meilleurs délais. »'],
        ['Aucune information utile.', 'Oui : il donne un horaire et rassure.', 'Trop vague, le client ne sait rien.'],
        1, 'Un bon message d’absence indique quand le client aura une réponse.'),
      ch('b11q3', 'Numéro dédié', 'Pourquoi WhatsApp recommande-t-il un numéro réservé à l’activité ?',
        ['Pour payer moins.', 'Pour séparer clairement le travail du privé.', 'C’est obligatoire pour envoyer des messages.'],
        ['Ça n’a aucun rapport avec le prix.', 'Oui : tu règles tes horaires et tes réponses sans toucher à ta vie perso.', 'Faux : ce n’est pas obligatoire, c’est une bonne pratique.'],
        1, 'Un numéro dédié sépare le pro du perso : c’est la recommandation de WhatsApp.'),
      mu('b11q4', 'Les bonnes pratiques', 'Quelles bonnes pratiques valent pour les réponses rapides ? (2 réponses)',
        ['Relire et corriger chaque réponse, car elles sont souvent le premier contact.', 'Les mettre à jour quand tes tarifs ou horaires changent.', 'Les écrire une fois avec des fautes, personne ne regarde.', 'Utiliser la même réponse pour tous les sujets.'],
        ['Oui : une réponse enregistrée doit être irréprochable.', 'Oui : sinon tu enverras des informations fausses.', 'Non : c’est l’image de ton activité.', 'Non : une réponse par sujet est plus claire.'],
        [0, 1], 'Relire et mettre à jour : tes réponses rapides parlent pour toi.'),
      nb('b11q5', 'Les cinq minutes', 'Combien de minutes par jour WhatsApp conseille-t-il pour étiqueter les conversations ouvertes ?', 5, 0, 'min', 'Cinq minutes en fin de journée suffisent pour repartir sur une base claire.'),
      ch('b11q6', 'Un client à 23 h', 'Un client écrit à 23 h : « Tu peux me faire une story ce soir ? » Que fait ton message d’absence ?',
        ['Rien, tu réponds tout de suite.', 'Il accuse réception et annonce que tu réponds demain matin.', 'Il refuse la demande.'],
        ['Tu perds ta limite de disponibilité.', 'Oui : le client est rassuré, tu protèges ton soir.', 'Il n’annule rien, il informe.'],
        1, 'Absence + horaire de réponse = limite claire sans froisser le client.')
    ]
  },
  {
    id: 'b12', code: 'B12', parcours: 'business', niveau: 2, titre: 'LinkedIn en pro : profil, Page et mode créateur', duree: '12 min',
    court: 'Être trouvée par les agences, marques et managers de streamers, sans payer.',
    objectif: 'Construire un profil et une Page LinkedIn qui t’apportent des demandes, avec les outils gratuits.',
    situation: 'Les managers de streamers, les agences et les marques cherchent des CM sur LinkedIn. Ton profil n’a pas été touché depuis des mois. Tu veux un profil qui parle de tes 8 ans de métier, sans payer d’abonnement.',
    cours: [
      ['Profil et Page, deux choses', 'Ton profil représente toi. La Page LinkedIn représente ton activité. Pour créer une Page, tu dois avoir un profil à ton vrai nom (un profil au nom d’une entreprise est interdit). Tu en deviens administratrice par défaut.'],
      ['Créer une Page, gratuitement', 'La Page Entreprise est gratuite : bouton « Pour les entreprises » (ou « Work ») en haut à droite, « Créer une Page Entreprise », type Entreprise, puis nom, adresse publique, site, secteur, logo et slogan. La création se fait sur ordinateur ou sur iPhone/iPad, pas sur Android.'],
      ['Ce que donne une Page', 'Publier, mesurer l’audience avec des statistiques, et ajouter un bouton d’action pour convertir les visiteurs. Selon LinkedIn, les Pages complètes reçoivent davantage de vues : renseigne tout.'],
      ['La Page Service', 'LinkedIn propose aussi une Page Service qui rend tes prestations plus faciles à trouver et permet à tout membre de t’écrire gratuitement ou de demander une proposition. Elle demande un profil personnel et une Page Entreprise.'],
      ['Le mode créateur', 'Sur ton profil, section Ressources, « Mode créateur » : tu actives le mode et tu choisis des thèmes. Il sert à gagner en visibilité en publiant régulièrement. Gratuit, désactivable à tout moment.'],
      ['L’abonnement, jamais obligatoire', 'Il existe des offres payantes (Page Entreprise Premium, Pages Carrière). Elles sont facultatives : tout ce qui précède fonctionne sans payer. Commence gratuit, mesure, et décide seulement si une offre te fait gagner un client.'],
      ['Ton profil de CM Twitch', 'Titre précis : « Community manager Twitch et créateurs de contenu | 8 ans d’expérience ». Résumé : pour qui, ce que tu fais, un résultat chiffré. Mets en avant des exemples (clips, planning, modération).']
    ],
    tableau: { legende: 'Ce qui est gratuit ou payant', entetes: ['Outil LinkedIn', 'Prix'], lignes: [
      ['Profil personnel', 'Gratuit'],
      ['Page Entreprise', 'Gratuit'],
      ['Page Service', 'Gratuit (suppose une Page)'],
      ['Mode créateur', 'Gratuit'],
      ['Page Entreprise Premium, Pages Carrière', 'Payant, facultatif']
    ] },
    memo: 'Profil à ton vrai nom. Page Entreprise gratuite, créée sur ordinateur ou iPhone. Mode créateur gratuit. Le payant (Premium, Pages Carrière) est facultatif.',
    defi: 'Réécris ton titre LinkedIn avec « community manager Twitch », ton nombre d’années et ta cible, puis crée ta Page Entreprise en renseignant tous les champs.',
    sources: ['liPage', 'liTypes', 'liCreateur'],
    questions: [
      ch('b12q1', 'Le nom du profil', 'Peux-tu créer un profil LinkedIn au nom de ton activité (« Giky CM ») ?',
        ['Oui, c’est plus pro.', 'Non : le profil porte ton vrai nom ; l’activité a sa Page.', 'Oui, mais il faut payer.'],
        ['Les conditions d’utilisation l’interdisent.', 'Oui : profil à ton nom, Page pour l’activité.', 'Non, c’est interdit même en payant.'],
        1, 'Le profil représente une personne réelle ; la Page représente l’activité.', true),
      ch('b12q2', 'Créer une Page', 'Où peux-tu créer une Page LinkedIn aujourd’hui ?',
        ['Sur ordinateur ou sur un appareil iOS, pas sur Android.', 'Uniquement sur Android.', 'Nulle part, il faut passer par un support.'],
        ['Oui, selon l’aide de LinkedIn.', 'Non, c’est l’inverse.', 'Non, la création est en libre-service.'],
        0, 'LinkedIn indique que la création de Page est disponible sur ordinateur et iOS.'),
      ch('b12q3', 'Le prix', 'Combien coûte la création d’une Page Entreprise LinkedIn ?',
        ['Elle est gratuite ; un abonnement Premium est possible mais facultatif.', 'Un abonnement mensuel est obligatoire.', 'Il faut acheter une licence pour publier.'],
        ['Oui, selon LinkedIn.', 'Non, ce n’est pas obligatoire.', 'Non, l’achat concerne les Pages Carrière.'],
        0, 'La Page Entreprise est gratuite ; Premium est une option.'),
      mu('b12q4', 'Un profil qui attire', 'Quels éléments aident un manager de streamer à te trouver et à te faire confiance ? (2 réponses)',
        ['Un titre précis : métier, cible, années d’expérience.', 'Un résumé avec un résultat concret.', 'Un titre vague : « Passionnée ».', 'Aucun exemple de travail.'],
        ['Oui : il comprend en une ligne ce que tu fais.', 'Oui : une preuve vaut mieux qu’une promesse.', 'Non : trop vague.', 'Non : sans preuve, difficile de te croire.'],
        [0, 1], 'Titre précis + résultat concret : la base d’un profil qui convertit.'),
      ch('b12q5', 'Mode créateur', 'À quoi sert le mode créateur et que coûte-t-il ?',
        ['À gagner en visibilité par la publication régulière ; il s’active gratuitement dans la section Ressources du profil.', 'À facturer plus cher ; il coûte un abonnement.', 'À masquer ton profil.'],
        ['Oui : activable et désactivable à tout moment.', 'Non : ce n’est pas un abonnement.', 'Non, il fait l’inverse.'],
        0, 'Le mode créateur est un réglage gratuit du profil, pas un abonnement.'),
      ch('b12q6', 'La proposition payante', 'LinkedIn te propose Premium dès l’inscription de ta Page. Que fais-tu ?',
        ['Tu paies, sinon tu perds des clients.', 'Tu commences gratuit, tu mesures, tu décides seulement si une offre te fait gagner un client.', 'Tu ignores LinkedIn pour toujours.'],
        ['Rien ne l’impose.', 'Oui : décision basée sur des résultats.', 'Tu perdrais un canal utile et gratuit.'],
        1, 'Gratuit d’abord, payant seulement si le retour est mesurable.')
    ]
  },
  {
    id: 't9', code: 'T9', parcours: 'apprendre', niveau: 2, titre: 'Le clipping Twitch : faire de bons clips', duree: '14 min',
    court: 'Choisir le bon moment, utiliser l’éditeur de Twitch, publier en vertical, respecter les droits.',
    objectif: 'Fabriquer un clip prêt à publier sur Twitch, TikTok, YouTube Shorts ou Instagram, en règle.',
    situation: 'Ton client vient de réussir un moment hilarant en live. Tu veux le poster ce soir sur TikTok, mais le clip fait 58 secondes, en 16/9, sans titre. Il a aussi parlé avec un invité et une musique passait en fond.',
    cours: [
      ['Qu’est-ce qu’un bon clip ?', 'Un clip = un seul moment : une réaction, une victoire, un fail, une phrase marquante. Si tu dois expliquer le contexte pendant 20 secondes, ce n’est pas le bon moment. Repère : le plus fort se place dans les premières secondes. Les repères de durée sont des habitudes de métier, pas des règles de la plateforme : seule la limite de 60 secondes de Twitch est officielle.'],
      ['Créer un clip sur Twitch', 'Clique sur l’icône clip sur un live ou une rediffusion : le Clip Creator s’ouvre en fenêtre déplaçable et tu continues de regarder. Règle la durée avec le curseur (60 secondes au maximum), donne un titre et clique sur Publier. L’audio du live est coupé pendant la création pour que tu entendes le clip. Le streamer peut aussi dire « Twitch, Clip That » pendant le live.'],
      ['Le format vertical', 'Dans l’éditeur, Twitch propose un cadrage qui garde la caméra et le jeu dans l’image. Pour la version verticale, deux mises en page : Empilée (caméra + jeu en deux zones, réglable) et Pleine (une seule zone). Tu peux aussi choisir un format entre 16:9 et 9:16, le vide étant rempli par un flou. Pour télécharger la version portrait, il faut d’abord l’avoir créée en modifiant la mise en page.'],
      ['Les sous-titres', 'Les clips créés par « Clip That » ou par les clips automatiques ont des sous-titres par défaut ; pour les autres, ils sont inclus si l’option « Ajouter des sous-titres » a été cochée. Le streamer et ses éditeurs peuvent les corriger ou les retirer pendant 30 jours après la création. Relis toujours : une erreur de sous-titre se voit.'],
      ['Où les gérer et les partager', 'Tableau de bord créateur, Contenu, Clips : tu modifies le titre, le découpage, la mise en page, et tu télécharges la version horizontale ou verticale. Pour une chaîne dont tu es l’éditrice, tu peux publier directement vers YouTube, TikTok, Instagram et Snapchat depuis ce menu.'],
      ['Les clips d’une autre chaîne', 'Un spectateur peut partager le lien. Pour publier directement le clip d’une autre chaîne sur son compte, il faut que le streamer ait activé ce réglage. Sur TikTok, le nom de la chaîne est alors ajouté automatiquement en hashtag. Un clip fait par un spectateur n’est pas une licence de réutilisation : demande l’accord du streamer, précise où, si tu montes et si c’est monétisé, et garde la preuve.'],
      ['Les droits dans un clip', 'Un clip peut contenir : la voix du streamer, une musique, des images de jeu, un invité. L’accord du streamer ne couvre pas forcément la musique, le jeu ou l’invité. Clip sans musique tierce, ou accord clair pour chaque élément. En cas de doute, on ne publie pas.'],
      ['Des outils pour aller plus vite', 'L’éditeur de Twitch est gratuit et suffit pour 80 % des cas. D’autres outils (CapCut, Eklipse, ou de nombreux outils en ligne) automatisent le montage ou la détection de moments forts : compare les offres, les conditions et les limites gratuites avant de les utiliser, et vérifie que leur usage est compatible avec les conditions de Twitch et l’accord du streamer.'],
      ['Dual Format', 'Twitch propose le streaming en double format : une disposition horizontale et une verticale. Ce format fournit les deux versions des clips et rediffusions, sans montage supplémentaire. C’est à proposer aux streamers qui stream avec un logiciel compatible.']
    ],
    tableau: { legende: 'La méthode en 6 étapes', entetes: ['Étape', 'Ce que je fais'], lignes: [
      ['1. Moment', 'Un seul moment, le plus fort au début'],
      ['2. Clip', 'Clip Creator, 60 secondes maximum, titre court'],
      ['3. Format', 'Version verticale : Empilée ou Pleine'],
      ['4. Texte', 'Sous-titres relus, titre, hashtags'],
      ['5. Droits', 'Accord streamer, pas de musique tierce, invité d’accord'],
      ['6. Publier', 'TikTok, Shorts, Reels ; lien vers la chaîne']
    ] },
    memo: 'Un clip = un moment. 60 secondes max sur Twitch. Version verticale (Empilée ou Pleine). Sous-titres relus. Un clip fait par un spectateur n’est pas une licence : demande l’accord, évite la musique tierce.',
    defi: 'Choisis un moment du dernier live de ta cliente, crée le clip de moins de 30 secondes, règle la version verticale et remplis la fiche : titre, accord, musique, plateforme, heure de publication.',
    sources: ['twitchClips', 'twitchDual', 'twitchDevClips'],
    questions: [
      nb('t9q1', 'La limite', 'Quelle est la durée maximale d’un clip créé avec le Clip Creator de Twitch ? (en secondes)', 60, 0, 's', 'La limite officielle est de 60 secondes.'),
      ch('t9q2', 'Le bon moment', 'Quel moment du live choisis-tu pour un clip TikTok ?',
        ['Un long moment où il explique les règles du jeu.', 'Le fou rire de 20 secondes, compréhensible sans contexte.', 'Les 5 minutes avant le fou rire pour tout expliquer.'],
        ['Trop long et trop lent.', 'Oui : un moment, fort, sans contexte.', 'Le spectateur aura déjà quitté.'],
        1, 'Un clip, c’est un seul moment qui se comprend seul.'),
      ch('t9q3', 'Le format', 'Tu veux la version verticale d’un clip avec caméra et jeu. Quelle mise en page choisis-tu ?',
        ['Empilée : caméra et jeu dans deux zones.', 'Pleine : une seule zone qui prend tout l’écran.', 'Les deux sont impossibles.'],
        ['Oui, elle est conçue pour ce cas.', 'Pleine n’affiche qu’une zone ; tu perds la caméra ou le jeu.', 'Faux : ces deux mises en page existent.'],
        0, 'Empilée garde caméra et jeu dans l’image ; Pleine utilise une seule zone.'),
      ch('t9q4', 'Le téléchargement', 'Tu ne trouves pas l’option « télécharger la version portrait ». Que fais-tu ?',
        ['Tu cherches un autre site.', 'Tu modifies le clip, ajustes la mise en page, enregistres et attends le rendu.', 'Tu changes de téléphone.'],
        ['Inutile : l’outil officiel le fait.', 'Oui : la version portrait doit d’abord être créée.', 'Aucun rapport.'],
        1, 'La version portrait se crée en modifiant la mise en page, puis elle devient téléchargeable.'),
      ch('t9q5', 'Le clip d’un spectateur', 'Un spectateur a fait un super clip du streamer. Tu veux le poster sur ton compte TikTok. Que fais-tu d’abord ?',
        ['Tu télécharges et tu postes, c’est public.', 'Tu vérifies que le streamer autorise le partage direct, ou tu lui demandes son accord.', 'Tu changes la musique et tu postes.'],
        ['Un clip public n’est pas une licence de réutilisation.', 'Oui : réglage du streamer ou accord clair.', 'Changer la musique ne règle pas la question de l’accord.'],
        1, 'Un clip fait par un spectateur n’est pas une licence de réutilisation : accord du streamer d’abord.', true),
      ch('t9q6', 'La musique', 'Dans le clip, un tube connu passe en fond. Le streamer est d’accord. Que fais-tu ?',
        ['Tu publies : il a dit oui.', 'Tu coupes la musique ou tu obtiens un accord clair pour la musique aussi.', 'Tu ajoutes un hashtag.'],
        ['Son accord ne couvre pas forcément la musique.', 'Oui : la musique est un autre droit.', 'Ça ne règle rien.'],
        1, 'L’accord du streamer ne couvre pas la musique d’un tiers.', true),
      mu('t9q7', 'Sous-titres', 'Quelles affirmations sur les sous-titres sont justes ? (2 réponses)',
        ['Les clips créés par « Clip That » en ont par défaut.', 'Le streamer et ses éditeurs peuvent les corriger pendant 30 jours.', 'Ils ne se modifient jamais.', 'Ils sont toujours parfaits.'],
        ['Oui.', 'Oui : tu corriges les erreurs.', 'Non : on peut les corriger ou les retirer.', 'Non : relis-les toujours.'],
        [0, 1], 'Sous-titres par défaut pour Clip That, modifiables pendant 30 jours.'),
      ch('t9q8', 'Les outils', 'Un outil en ligne promet de créer tes clips automatiquement. Comment l’évalues-tu ?',
        ['Je prends le premier trouvé.', 'Je compare l’offre gratuite, les limites et les conditions, et je vérifie que l’usage respecte les règles de Twitch et l’accord du streamer.', 'J’utilise uniquement des outils payants.'],
        ['Tu risques de payer ou de publier sans droit.', 'Oui : tarif, limites, conditions, droits.', 'Le prix ne garantit rien.'],
        1, 'Outil = comparer l’offre, les conditions et les droits avant d’utiliser.')
    ]
  }
  ];
  C.lecons.push(...NOUVELLES);
  C.melanger(NOUVELLES);
}(typeof globalThis !== 'undefined' ? globalThis : this));
