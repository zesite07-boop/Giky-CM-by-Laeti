/* Ressources et outils du community manager freelance. Liens vérifiés le 3 novembre 2026.
   Les outils cités sont des exemples, sans partenariat : les offres et les prix changent, à vérifier sur chaque site. */
(function (root, factory) {
  'use strict';
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.CMRessources = data;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const r = (nom, url, desc, prix) => ({ nom, url, desc, prix });
  return [
    { id: 'twitch', titre: 'Twitch et le live', astuce: 'Garde un onglet ouvert sur le tableau de bord pendant les lives de tes clients.', liens: [
      r('Twitch Creator Camp', 'https://www.twitch.tv/creatorcamp/fr-fr', 'Les guides officiels de Twitch pour les créateurs.', 'Gratuit'),
      r('Tableau de bord créateur Twitch', 'https://dashboard.twitch.tv', 'Statistiques, modération, gestion du chat.', 'Gratuit'),
      r('Centre de sécurité Twitch', 'https://safety.twitch.tv', 'Règles, harcèlement, raids haineux.', 'Gratuit'),
      r('Twitch : créer et partager des clips', 'https://help.twitch.tv/s/article/how-to-use-clips', 'Clip Creator, version verticale, sous-titres, partage TikTok et YouTube.', 'Officiel'),
      r('Twitch : double format vertical', 'https://help.twitch.tv/s/article/dual-format-vertical-video', 'Streamer en horizontal et en vertical pour avoir les deux versions des clips.', 'Officiel'),
      r('AutoMod (aide Twitch)', 'https://help.twitch.tv/s/article/how-to-use-automod', 'Filtrer automatiquement les messages à risque.', 'Gratuit'),
      r('OBS Studio', 'https://obsproject.com', 'Logiciel libre de diffusion et d’enregistrement.', 'Gratuit'),
      r('Streamlabs', 'https://streamlabs.com', 'Alertes, overlays et outils de live.', 'Freemium'),
      r('StreamElements', 'https://streamelements.com', 'Overlays, bot de chat, alertes.', 'Freemium'),
      r('Nightbot', 'https://nightbot.tv', 'Bot de modération et commandes de chat.', 'Gratuit'),
      r('TwitchTracker', 'https://twitchtracker.com', 'Statistiques publiques des chaînes.', 'Gratuit'),
      r('SullyGnome', 'https://sullygnome.com', 'Analyses détaillées des chaînes et des jeux.', 'Gratuit'),
      r('Streams Charts', 'https://streamscharts.com', 'Classements et tendances du streaming.', 'Freemium')
    ] },
    { id: 'planif', titre: 'Planifier et publier', astuce: 'Choisis un seul outil de planification et tiens-t’y 3 mois avant de changer.', liens: [
      r('Meta Business Suite', 'https://business.facebook.com', 'Planifier sur Facebook et Instagram.', 'Gratuit'),
      r('Metricool', 'https://metricool.com', 'Planification et statistiques multi-réseaux, dont Twitch.', 'Freemium'),
      r('Buffer', 'https://buffer.com', 'Planification simple, file d’attente de posts.', 'Freemium'),
      r('Later', 'https://later.com', 'Planification visuelle, pratique pour Instagram et TikTok.', 'Freemium'),
      r('Hootsuite', 'https://www.hootsuite.com', 'Suite complète pour gérer plusieurs comptes.', 'Payant'),
      r('TikTok for Business', 'https://www.tiktok.com/business/fr', 'Ressources et publicité TikTok.', 'Gratuit'),
      r('YouTube Creators', 'https://www.youtube.com/creators/', 'Guides officiels pour les créateurs YouTube.', 'Gratuit')
    ] },
    { id: 'reseaux', titre: 'Réseaux pro : Facebook, WhatsApp, LinkedIn', astuce: 'Une seule présence pro par réseau, gratuite, et ton profil perso reste à part.', liens: [
      r('Meta Business Suite', 'https://business.facebook.com/', 'Facebook et Instagram : calendrier, Inbox, statistiques, rôles.', 'Gratuit'),
      r('Aide Meta Business Suite', 'https://www.facebook.com/business/help/205614130852988', 'Comment fonctionne l’outil, par Meta.', 'Officiel'),
      r('WhatsApp Business (ressources)', 'https://whatsappbusiness.com/resources/faq/', 'Appli gratuite ou Platform : la FAQ officielle.', 'Officiel'),
      r('LinkedIn : créer une Page', 'https://www.linkedin.com/help/linkedin/answer/a543852', 'Création d’une Page Entreprise gratuite.', 'Officiel'),
      r('LinkedIn : le mode créateur', 'https://www.linkedin.com/help/linkedin/answer/a524035', 'Activer le mode créateur sur ton profil.', 'Officiel')
    ] },
    { id: 'creation', titre: 'Créer des visuels et des clips', astuce: 'Prépare 3 modèles (annonce, clip, récap) : tu n’auras plus qu’à changer le texte.', liens: [
      r('Canva', 'https://www.canva.com', 'Visuels, modèles, kits de marque.', 'Freemium'),
      r('Adobe Express', 'https://www.adobe.com/fr/express/', 'Visuels et vidéos courtes rapides.', 'Freemium'),
      r('CapCut', 'https://www.capcut.com', 'Montage vidéo vertical, sous-titres automatiques.', 'Freemium'),
      r('Eklipse', 'https://eklipse.gg', 'Transforme les temps forts d’un live en clips courts.', 'Freemium'),
      r('DaVinci Resolve', 'https://www.blackmagicdesign.com/fr/products/davinciresolve', 'Montage et étalonnage professionnels.', 'Gratuit'),
      r('Figma', 'https://www.figma.com', 'Maquettes, overlays, design collaboratif.', 'Freemium')
    ] },
    { id: 'libres', titre: 'Images et musiques libres', astuce: 'Note la licence de chaque fichier dans un tableau : tu seras tranquille si on te pose la question.', liens: [
      r('StreamBeats', 'https://www.streambeats.com', 'Musique pensée pour les streamers.', 'Gratuit'),
      r('Free Music Archive', 'https://freemusicarchive.org', 'Musiques sous licences libres : vérifie chaque licence.', 'Gratuit'),
      r('Pixabay', 'https://pixabay.com', 'Images, vidéos et musiques libres de droits.', 'Gratuit'),
      r('Unsplash', 'https://unsplash.com', 'Photos haute qualité.', 'Gratuit'),
      r('Pexels', 'https://www.pexels.com', 'Photos et vidéos libres.', 'Gratuit')
    ] },
    { id: 'communaute', titre: 'Animer la communauté', astuce: 'Un salon Discord « annonces » en lecture seule évite que l’essentiel se noie.', liens: [
      r('Centre de sécurité Discord', 'https://discord.com/safety', 'Modération, sécurité, outils pour les serveurs.', 'Gratuit'),
      r('MEE6', 'https://mee6.xyz', 'Bot Discord : modération, niveaux, annonces.', 'Freemium')
    ] },
    { id: 'veille', titre: 'Veille et analyse', astuce: 'Bloque 20 minutes de veille le lundi matin, pas plus : ça reste un plaisir.', liens: [
      r('Google Trends', 'https://trends.google.fr', 'Ce que les gens cherchent, en temps réel.', 'Gratuit'),
      r('Google Alertes', 'https://www.google.fr/alerts', 'Être prévenue quand on parle d’un client.', 'Gratuit'),
      r('Feedly', 'https://feedly.com', 'Tous tes sites de veille au même endroit.', 'Freemium'),
      r('Looker Studio', 'https://lookerstudio.google.com', 'Tableaux de bord pour tes reportings.', 'Gratuit'),
      r('SteamDB', 'https://steamdb.info', 'Données publiques sur les jeux Steam (utile avec les studios).', 'Gratuit')
    ] },
    { id: 'tdah', titre: 'S’organiser avec un cerveau TDAH', astuce: 'Une seule liste, un seul agenda, et un minuteur pour démarrer : c’est la base.', liens: [
      r('Goblin Tools', 'https://goblin.tools', 'Découpe une tâche floue en petites étapes.', 'Gratuit'),
      r('Pomofocus', 'https://pomofocus.io', 'Minuteur Pomodoro en ligne.', 'Gratuit'),
      r('Focusmate', 'https://www.focusmate.com', 'Sessions de travail en visio avec un binôme (« body doubling »).', 'Freemium'),
      r('Todoist', 'https://todoist.com', 'Liste de tâches simple, avec rappels.', 'Freemium'),
      r('Trello', 'https://trello.com', 'Tableaux visuels : à faire, en cours, fait.', 'Freemium'),
      r('Notion', 'https://www.notion.so', 'Notes, bases clients, calendrier éditorial.', 'Freemium'),
      r('Google Agenda', 'https://calendar.google.com', 'Créneaux fixes et rappels.', 'Gratuit'),
      r('TDAH France (HyperSupers)', 'https://www.tdah-france.fr', 'Association : informations et ressources sur le TDAH.', 'Gratuit')
    ] },
    { id: 'admin', titre: 'Gestion, facturation et devises', astuce: 'Tous les officiels sont gratuits. Pour le reste, compare les offres avant de t’abonner.', liens: [
      r('Urssaf auto-entrepreneur', 'https://www.autoentrepreneur.urssaf.fr', 'Déclarer ton chiffre d’affaires et payer tes cotisations.', 'Officiel'),
      r('Simulateur Urssaf (mon-entreprise)', 'https://mon-entreprise.urssaf.fr/simulateurs/auto-entrepreneur', 'Simulation officielle de tes cotisations et revenus.', 'Officiel'),
      r('impots.gouv.fr, espace professionnel', 'https://www.impots.gouv.fr/professionnel', 'TVA, CFE, facturation électronique.', 'Officiel'),
      r('Taux de change BCE', 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.fr.html', 'Taux de référence officiels de l’euro, publiés chaque jour ouvré.', 'Officiel'),
      r('Henrri', 'https://www.henrri.com', 'Logiciel de devis et factures.', 'Freemium'),
      r('Freebe', 'https://www.freebe.me', 'Gestion pensée pour les freelances.', 'Payant'),
      r('Abby', 'https://abby.fr', 'Facturation et suivi pour micro-entrepreneurs.', 'Freemium'),
      r('Wise', 'https://wise.com/fr/', 'Compte multi-devises pour recevoir des $ et des £ : compare les frais.', 'Payant')
    ] },
    { id: 'droit', titre: 'Droit, éthique et sécurité', astuce: 'Doute sur un contenu ? On demande, ou on ne publie pas.', liens: [
      r('ARPP : Animateurs de communautés responsables', 'https://www.arpp.org/influence-responsable/certificat-animateurs-de-communautes-responsables/', 'Certificat en ligne pour les community managers.', 'Payant'),
      r('economie.gouv.fr : influenceurs, mes devoirs', 'https://www.economie.gouv.fr/influenceurs-quels-sont-mes-devoirs', 'Le guide officiel de l’influence commerciale.', 'Officiel'),
      r('CNIL', 'https://www.cnil.fr', 'Données personnelles, droit à l’image en ligne.', 'Officiel'),
      r('Pharos', 'https://www.service-public.gouv.fr/particuliers/vosdroits/R17674', 'Signaler un contenu illicite.', 'Officiel'),
      r('3018 (e-Enfance)', 'https://e-enfance.org/numero-3018/', 'Numéro national contre le cyberharcèlement.', 'Gratuit')
    ] },
    { id: 'formation', titre: 'Se former en continu', astuce: 'Un module par mois, noté dans ton carnet : la progression se voit.', liens: [
      r('Meta Blueprint', 'https://www.facebook.com/business/learn', 'Formations officielles Facebook et Instagram.', 'Gratuit'),
      r('Google Skillshop', 'https://skillshop.withgoogle.com', 'Formations Google Ads, Analytics, YouTube.', 'Gratuit'),
      r('Google Ateliers Numériques', 'https://grow.google/intl/fr_fr/', 'Formations au numérique en français.', 'Gratuit'),
      r('HubSpot Academy', 'https://academy.hubspot.com', 'Marketing de contenu, réseaux sociaux.', 'Gratuit')
    ] },
    { id: 'missions', titre: 'Trouver des missions', astuce: 'Les plateformes servent à démarrer. Les meilleures missions viennent souvent du réseau.', liens: [
      r('Malt', 'https://www.malt.fr', 'Grande plateforme française de freelances.', 'Commission'),
      r('Codeur.com', 'https://www.codeur.com', 'Appels d’offres de missions web et com.', 'Freemium'),
      r('ComeUp', 'https://comeup.com', 'Micro-services à prix fixe.', 'Commission'),
      r('Welcome to the Jungle', 'https://www.welcometothejungle.com', 'Offres d’emploi et missions, dont le jeu vidéo.', 'Gratuit'),
      r('AFJV emploi', 'https://emploi.afjv.com', 'Offres du secteur jeu vidéo en France.', 'Gratuit')
    ] }
  ];
}));
