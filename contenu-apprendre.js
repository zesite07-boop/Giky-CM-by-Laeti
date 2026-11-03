/* Parcours 1 — Apprendre le métier (T1 à T8). */
(function (root) {
  'use strict';
  const C = root.CMContenu = root.CMContenu || { lecons: [] };
  C.lecons.push(
{
  id: 't1', code: 'T1', parcours: 'apprendre', titre: 'Le rôle du community manager Twitch', duree: '8 min',
  court: 'Ce que tu vends vraiment : du temps de lien, pas des posts.',
  objectif: 'Décrire ton périmètre en une phrase et refuser ce qui n’en fait pas partie.',
  situation: 'Un streamer te demande « de gérer ses réseaux ». Il pense à TikTok, Discord, ses mails sponsors et le montage de ses VOD. Il propose 300 € par mois.',
  cours: [
    ['Trois métiers sous un même mot', 'Community management (animer, répondre, modérer), social media (publier, programmer) et production (montage, graphisme). Un client mélange souvent les trois. Toi, tu nommes ce que tu fais et tu chiffres le reste à part.'],
    ['Ta valeur pour un streamer', 'Il est en live, il ne peut pas tout tenir. Tu prolonges le live : avant (annonce), pendant (chat, clips), après (best-of, Discord). Ce que tu vends, c’est une communauté qui revient au prochain live.'],
    ['Le périmètre écrit', 'Liste : plateformes, fréquence, horaires de présence, délais de réponse, ce qui est exclu. Un périmètre flou se transforme en heures gratuites.']
  ],
  memo: 'Une phrase-métier : « J’anime et je fais grandir ta communauté entre deux lives ; le montage et le graphisme sont des options chiffrées à part. »',
  defi: 'Écris ta phrase-métier et ta liste « ce que je ne fais pas » dans le carnet.',
  sources: [],
  questions: [
    { id: 't1q1', type: 'choix', titre: 'Première réponse', texte: 'Que réponds-tu au streamer qui veut « tout » pour 300 € par mois ?',
      options: ['J’accepte, je verrai en cours de route.', 'Je propose un périmètre écrit pour 300 €, et je chiffre le montage et les sponsors en options.', 'Je refuse : 300 €, c’est trop peu.'],
      retours: ['Accepter un périmètre flou, c’est offrir les heures de dépassement.', 'Tu gardes le client et tu protèges ton temps : chaque tâche a un prix.', 'Refuser sec ferme une porte ; un petit forfait cadré peut être rentable.'],
      bonne: 1, explication: 'On cadre d’abord le périmètre, ensuite le prix suit.' },
    { id: 't1q2', type: 'multiple', titre: 'Le périmètre', texte: 'Quels éléments doivent figurer dans un périmètre écrit ? (3 réponses)',
      options: ['Les plateformes couvertes', 'Les délais de réponse', 'Ta couleur préférée', 'Ce qui est exclu', 'Le nombre de followers garanti'],
      retours: ['Oui : sinon il ajoute une plateforme sans payer.', 'Oui : il sait quand t’attendre.', 'Hors sujet.', 'Oui : l’exclusion écrite évite les débats.', 'Non : tu ne garantis pas un résultat que tu ne maîtrises pas.'],
      bonne: [0, 1, 3], explication: 'Plateformes, délais, exclusions : c’est le minimum pour éviter le travail gratuit.' },
    { id: 't1q3', type: 'choix', critique: true, titre: 'Promesse', texte: 'Un prospect demande : « Tu me garantis +1 000 followers en un mois ? »',
      options: ['Oui, pour signer.', 'Non : je m’engage sur des actions et un suivi mesuré, pas sur un chiffre de followers.', 'Oui, j’achèterai des followers s’il faut.'],
      retours: ['Une promesse intenable te coûte le client et ta réputation.', 'Tu t’engages sur ce que tu maîtrises : moyens, régularité, mesure.', 'Acheter des followers viole les règles des plateformes et détruit l’engagement.'],
      bonne: 1, explication: 'Erreur critique : promettre un résultat non maîtrisé, ou tricher pour l’atteindre.' }
  ]
},
{
  id: 't2', code: 'T2', parcours: 'apprendre', titre: 'Les codes de Twitch', duree: '10 min',
  court: 'Raid, clip, VOD, sub, emote, modérateur : parler la langue du client.',
  objectif: 'Utiliser les bons mots et proposer des actions qui ont du sens sur Twitch.',
  situation: 'Ton client finit son live et lance un raid vers une petite chaîne. Le lendemain, il te demande quoi publier.',
  cours: [
    ['Le vocabulaire qui compte', 'Raid : envoyer ses viewers sur une autre chaîne en fin de live. Clip : extrait court créé par un viewer ou le streamer. VOD : rediffusion. Sub : abonnement payant. Emote : émoticône propre à la chaîne.'],
    ['Ce que la communauté attend', 'Des rendez-vous réguliers (planning), des moments partagés (clips), de la reconnaissance (shout-out, raids rendus). La régularité compte plus que la perfection.'],
    ['Les règles de la plateforme', 'Twitch publie des règles communautaires : harcèlement, contenus haineux, usurpation. Ton client en est responsable sur sa chaîne ; toi, tu l’aides à les faire respecter.']
  ],
  memo: 'Planning stable + clips du lendemain + raids rendus = une communauté qui se sent vue.',
  defi: 'Note les 5 mots Twitch que ton client utilise le plus et ce qu’ils veulent dire pour lui.',
  sources: ['twitchCG'],
  questions: [
    { id: 't2q1', type: 'choix', titre: 'Le lendemain', texte: 'Que publies-tu en priorité le lendemain du live ?',
      options: ['Un long texte de remerciement.', 'Le meilleur clip du live, avec l’heure du prochain live.', 'Rien, la VOD suffit.'],
      retours: ['Peu lu, peu partagé.', 'Court, partageable, et ça annonce le prochain rendez-vous.', 'La VOD est longue ; personne ne la regarde en entier.'],
      bonne: 1, explication: 'Le clip prolonge le live ; l’horaire transforme le spectateur en habitué.' },
    { id: 't2q2', type: 'choix', titre: 'Raid reçu', texte: 'Un autre streamer a raidé ton client hier. Que proposes-tu ?',
      options: ['L’ignorer.', 'Un remerciement public et un raid rendu à l’occasion.', 'Lui demander de l’argent.'],
      retours: ['Les raids fonctionnent sur la réciprocité.', 'Remercier et rendre : c’est le code de la plateforme.', 'Hors des usages.'],
      bonne: 1, explication: 'La réciprocité est un moteur de croissance sur Twitch.' },
    { id: 't2q3', type: 'choix', critique: true, titre: 'Usurpation', texte: 'Pour faire du buzz, ton client veut publier un faux message « signé » par un autre streamer connu.',
      options: ['Tu le fais, c’est de l’humour.', 'Tu refuses et tu expliques le risque : usurpation d’identité, contraire aux règles de Twitch.', 'Tu le fais sur un autre réseau.'],
      retours: ['L’humour n’efface pas l’usurpation.', 'Tu protèges ton client et ta propre réputation.', 'Le risque est le même ailleurs.'],
      bonne: 1, explication: 'Erreur critique : se faire passer pour quelqu’un d’autre.' }
  ]
},
{
  id: 't3', code: 'T3', parcours: 'apprendre', titre: 'Construire une ligne éditoriale', duree: '10 min',
  court: 'Trois piliers, un ton, une fréquence que le client peut tenir.',
  objectif: 'Rédiger une ligne éditoriale d’une page pour un streamer.',
  situation: 'Ta cliente streame des jeux indé trois soirs par semaine. Ses posts partent dans tous les sens.',
  cours: [
    ['Trois piliers', 'Exemple : 1) les moments du live (clips), 2) les coulisses (setup, préparation), 3) la communauté (fan-arts, sondages). Chaque post entre dans un pilier, sinon il ne sort pas.'],
    ['Le ton', 'Tutoiement ou vouvoiement, emojis ou pas, humour ou sobriété. Écris trois exemples « on dit » et trois « on ne dit pas ».'],
    ['La fréquence tenable', 'Mieux vaut 3 posts par semaine pendant six mois que 2 par jour pendant trois semaines. La fréquence se cale sur le planning de live.']
  ],
  memo: 'Une page : piliers, ton (on dit / on ne dit pas), fréquence, plateformes.',
  defi: 'Rédige la ligne éditoriale d’un de tes clients actuels en une page.',
  sources: [],
  questions: [
    { id: 't3q1', type: 'choix', titre: 'Le post hors piliers', texte: 'Ta cliente veut publier son avis sur une polémique politique. Ses piliers : clips, coulisses, communauté.',
      options: ['Tu publies, c’est son compte.', 'Tu lui rappelles la ligne et tu lui proposes d’en parler en live si elle y tient.', 'Tu publies sans lui en parler.'],
      retours: ['C’est son compte, mais ton rôle est de signaler le décalage.', 'Elle décide, avec les éléments en main.', 'Jamais sans validation.'],
      bonne: 1, explication: 'La ligne éditoriale sert à décider ; le client reste maître, informé.' },
    { id: 't3q2', type: 'nombre', titre: 'Fréquence', texte: 'Elle streame 3 soirs par semaine. Tu prévois 1 clip par live et 1 post communauté par semaine. Combien de posts par semaine ?',
      bonne: 4, tolerance: 0, unite: 'posts', explication: '3 clips + 1 post communauté = 4 posts par semaine.' },
    { id: 't3q3', type: 'multiple', titre: 'Le ton', texte: 'Que mets-tu dans la partie « ton » ? (2 réponses)',
      options: ['Des exemples « on dit / on ne dit pas »', 'Le tarif', 'Le choix tutoiement ou vouvoiement', 'Le mot de passe du compte'],
      retours: ['Oui : c’est concret.', 'Non, ça va dans le devis.', 'Oui.', 'Jamais dans un document partagé.'],
      bonne: [0, 2], explication: 'Le ton se décrit par des exemples et des choix simples.' }
  ]
},
{
  id: 't4', code: 'T4', parcours: 'apprendre', titre: 'Le calendrier de publication', duree: '8 min',
  court: 'Planifier une semaine type autour des lives.',
  objectif: 'Construire un calendrier hebdomadaire réaliste et le faire valider.',
  situation: 'Ton client change son planning de live chaque semaine. Tes posts tombent à côté.',
  cours: [
    ['Partir du live', 'Annonce le jour même (2 à 3 heures avant), clip le lendemain, post communauté le jour sans live.'],
    ['Préparer en lot', 'Une session par semaine pour programmer. Garder un créneau pour l’imprévu (clip viral, annonce).'],
    ['Faire valider', 'Le client valide le calendrier une fois par semaine, pas chaque post. Écris le délai de validation : sans réponse sous 24 heures, tu publies la version prévue.']
  ],
  memo: 'Planning de live figé le lundi → calendrier envoyé le lundi → validé le mardi.',
  defi: 'Propose à un client une règle de validation écrite avec un délai.',
  sources: [],
  questions: [
    { id: 't4q1', type: 'choix', titre: 'Planning mouvant', texte: 'Le planning change sans cesse. Quelle solution ?',
      options: ['Tu publies au hasard.', 'Tu demandes le planning de la semaine chaque lundi, sinon tu publies les posts « sans date ».', 'Tu arrêtes d’annoncer les lives.'],
      retours: ['Les annonces ratées découragent la communauté.', 'Une règle simple, et une réserve de posts intemporels.', 'L’annonce est le post le plus utile.'],
      bonne: 1, explication: 'Une règle de calendrier et une réserve de contenus intemporels.' },
    { id: 't4q2', type: 'choix', titre: 'Validation', texte: 'Le client ne répond pas aux demandes de validation. Que mets-tu en place ?',
      options: ['Tu attends, quitte à ne rien publier.', 'Une règle écrite : sans retour sous 24 heures, la version prévue part.', 'Tu publies tout sans demander.'],
      retours: ['Le compte meurt pendant l’attente.', 'Tu restes dans le cadre convenu et le compte vit.', 'Tu sors du cadre : risque de conflit.'],
      bonne: 1, explication: 'La validation tacite doit être écrite à l’avance.' },
    { id: 't4q3', type: 'nombre', titre: 'Annonce', texte: 'Le live commence à 20 h. Tu publies l’annonce 2 heures avant. À quelle heure ? (nombre d’heures, ex. 18)',
      bonne: 18, tolerance: 0, unite: 'h', explication: '20 h − 2 h = 18 h.' }
  ]
},
{
  id: 't5', code: 'T5', parcours: 'apprendre', titre: 'Animer et modérer le chat', duree: '10 min',
  court: 'Règles affichées, outils Twitch, escalade claire.',
  objectif: 'Appliquer une échelle de modération proportionnée et documentée.',
  situation: 'Pendant le live, un viewer insiste lourdement sur le physique de ta cliente.',
  cours: [
    ['Les règles du chat', 'Affichées dans le panneau de la chaîne : respect, pas de spoil, pas de pub. Les modérateurs les appliquent toutes de la même façon.'],
    ['L’échelle', 'Twitch propose des outils graduels : avertissement (warn), exclusion temporaire (timeout), bannissement (ban), signalement. On monte d’un cran à chaque récidive ; on saute directement au ban pour la haine ou les menaces.'],
    ['Garder une trace', 'Une capture et une ligne dans le journal de modération : qui, quoi, quand, quelle sanction. Ça protège la chaîne et les modérateurs.']
  ],
  memo: 'Warn → timeout → ban. Haine, menace, contenu sexuel : ban direct + signalement.',
  defi: 'Rédige les 5 règles de chat d’un client et l’échelle de sanctions associée.',
  sources: ['twitchModeration', 'twitchCG'],
  questions: [
    { id: 't5q1', type: 'choix', titre: 'Remarque lourde', texte: 'Première remarque déplacée sur le physique. Que fais-tu ?',
      options: ['Rien, ça passera.', 'Un avertissement ou un timeout, et tu notes l’événement.', 'Tu réponds par une insulte.'],
      retours: ['Laisser passer installe le comportement.', 'Proportionné, traçable.', 'Tu deviens toi-même le problème.'],
      bonne: 1, explication: 'Sanction graduée et trace écrite.' },
    { id: 't5q2', type: 'choix', critique: true, titre: 'Menace', texte: 'Un compte écrit une menace de mort contre la streameuse.',
      options: ['Un simple avertissement.', 'Ban immédiat, capture, signalement à Twitch, et tu préviens la streameuse.', 'Tu supprimes le message et tu n’en parles pas.'],
      retours: ['Une menace n’entre pas dans l’échelle graduée.', 'La gravité justifie le ban direct et le signalement.', 'Supprimer sans trace empêche toute suite.'],
      bonne: 1, explication: 'Erreur critique : traiter une menace comme un écart mineur ou la faire disparaître sans trace.' },
    { id: 't5q3', type: 'multiple', titre: 'Journal de modération', texte: 'Que notes-tu dans le journal ? (3 réponses)',
      options: ['Le pseudo', 'Le message ou sa capture', 'Ton avis sur la personne', 'La sanction appliquée', 'Son adresse supposée'],
      retours: ['Oui.', 'Oui.', 'Non : des faits, pas d’opinion.', 'Oui.', 'Non : tu ne collectes pas de données que tu n’as pas à avoir.'],
      bonne: [0, 1, 3], explication: 'Des faits : qui, quoi, quelle sanction.' }
  ]
},
{
  id: 't6', code: 'T6', parcours: 'apprendre', titre: 'Les droits : image, musique, contenus', duree: '12 min',
  court: 'Ce que tu peux publier, et ce qui demande une autorisation.',
  objectif: 'Repérer les contenus qui exigent un accord avant publication.',
  situation: 'Tu veux poster un clip où l’on voit l’invitée du live, avec une musique connue en fond, et un fan-art trouvé sur X.',
  cours: [
    ['Le droit à l’image', 'Une personne identifiable doit avoir donné son accord pour la diffusion de son image. Une invitée de live a accepté le live, pas forcément le clip promotionnel : demande.'],
    ['Le droit d’auteur', 'Une œuvre (musique, dessin, photo) est protégée dès sa création. Sans autorisation, la reproduction est interdite, sauf exceptions étroites comme la courte citation avec nom de l’auteur et source.'],
    ['Le fan-art', 'L’artiste reste l’auteur. Demande l’autorisation, crédite-le visiblement, ne recadre pas sans accord.']
  ],
  memo: 'Personne identifiable = accord. Œuvre d’un tiers = autorisation + crédit. En cas de doute : on demande ou on ne publie pas.',
  defi: 'Prépare un message type pour demander l’autorisation d’un fan-artiste.',
  sources: ['image', 'cnilImage', 'inpiAuteur'],
  questions: [
    { id: 't6q1', type: 'choix', titre: 'L’invitée', texte: 'L’invitée apparaît dans le clip promo. Que fais-tu ?',
      options: ['Tu publies, elle était en live.', 'Tu lui demandes son accord pour ce clip précis.', 'Tu floutes le streamer.'],
      retours: ['L’accord pour le live ne couvre pas tout usage.', 'Accord précis, usage précis.', 'Hors sujet.'],
      bonne: 1, explication: 'L’accord vaut pour un usage donné.' },
    { id: 't6q2', type: 'choix', critique: true, titre: 'Le fan-art', texte: 'Tu trouves un superbe fan-art de ton client sur X, sans contact avec l’artiste.',
      options: ['Tu le reposte en retirant la signature.', 'Tu demandes l’autorisation et tu crédites ; sans réponse, tu ne publies pas.', 'Tu le reposte, c’est un hommage.'],
      retours: ['Retirer la signature aggrave l’atteinte.', 'Tu respectes l’auteur.', 'L’hommage ne remplace pas l’autorisation.'],
      bonne: 1, explication: 'Erreur critique : effacer l’auteur ou publier son œuvre sans accord.' },
    { id: 't6q3', type: 'multiple', titre: 'Exceptions', texte: 'Quelles exceptions au droit d’auteur existent ? (2 réponses)',
      options: ['La courte citation, avec auteur et source', 'La parodie', '« Je l’ai trouvé sur internet »', '« Je n’en tire pas d’argent »'],
      retours: ['Oui, sous conditions.', 'Oui, dans les lois du genre.', 'Non.', 'Non : la gratuité ne suffit pas.'],
      bonne: [0, 1], explication: 'Les exceptions sont limitées ; la gratuité n’en est pas une.' }
  ]
},
{
  id: 't7', code: 'T7', parcours: 'apprendre', titre: 'Partenariats et mentions obligatoires', duree: '10 min',
  court: 'Quand ton client parle d’une marque contre avantage, ça se dit.',
  objectif: 'Appliquer les règles de transparence de l’influence commerciale.',
  situation: 'Une marque de périphériques offre un casque à ton client contre deux posts et une mention en live.',
  cours: [
    ['La transparence', 'Une promotion contre rémunération ou avantage (même un produit offert) doit être signalée clairement : « Publicité » ou « Collaboration commerciale », de façon lisible pendant toute la promotion.'],
    ['Le contrat', 'Au-delà de 1 000 € HT par collaboration (rémunération ou avantages), un contrat écrit est obligatoire entre la marque et le créateur. En dessous, un écrit reste conseillé.'],
    ['Ton rôle', 'Tu prépares les mentions, tu vérifies qu’elles sont visibles, tu gardes les échanges avec la marque.']
  ],
  memo: 'Produit offert = avantage. Avantage = mention « Publicité » ou « Collaboration commerciale ».',
  defi: 'Crée un modèle de post sponsorisé avec la mention bien visible.',
  sources: ['influence', 'influenceContrat'],
  questions: [
    { id: 't7q1', type: 'choix', critique: true, titre: 'Casque offert', texte: 'Le client dit : « Le casque est gratuit, pas besoin de mention. »',
      options: ['Il a raison.', 'Il a tort : un produit offert contre promotion est un avantage, la mention est obligatoire.', 'On met la mention en tout petit à la fin.'],
      retours: ['Un avantage en nature compte.', 'Transparence claire et visible.', 'Une mention cachée n’est pas une mention claire.'],
      bonne: 1, explication: 'Erreur critique : cacher un partenariat commercial.' },
    { id: 't7q2', type: 'choix', titre: 'Formulation', texte: 'Quelle mention est conforme ?',
      options: ['« #merci »', '« Collaboration commerciale »', '« #spon » noyé dans 20 hashtags'],
      retours: ['Ne dit pas qu’il y a un partenariat.', 'Explicite.', 'Pas lisible.'],
      bonne: 1, explication: 'Les mentions doivent être explicites et lisibles.' },
    { id: 't7q3', type: 'nombre', titre: 'Seuil du contrat', texte: 'À partir de quel montant HT par collaboration le contrat écrit devient-il obligatoire ? (en €)',
      bonne: 1000, tolerance: 0, unite: '€ HT', explication: '1 000 € HT, rémunération et avantages en nature compris.' }
  ]
},
{
  id: 't8', code: 'T8', parcours: 'apprendre', titre: 'Mesurer et faire un bilan mensuel', duree: '10 min',
  court: 'Trois indicateurs, une page, une décision.',
  objectif: 'Produire un bilan mensuel qui aide le client à décider.',
  situation: 'Ton client reçoit tes chiffres bruts chaque mois et ne les lit pas.',
  cours: [
    ['Trois indicateurs', 'Choisis-les avec lui : moyenne de viewers, nouveaux followers, clips partagés, membres actifs sur Discord. Trois, pas quinze.'],
    ['Comparer', 'Un chiffre seul ne dit rien. Compare au mois précédent et explique l’écart en une phrase.'],
    ['Décider', 'Chaque bilan se termine par une proposition : « On garde », « On arrête », « On teste ».']
  ],
  memo: 'Bilan = 3 chiffres + 3 comparaisons + 1 décision.',
  defi: 'Fais le bilan du mois dernier d’un client avec ce format.',
  sources: [],
  questions: [
    { id: 't8q1', type: 'nombre', titre: 'Évolution', texte: 'Moyenne de viewers : 40 le mois dernier, 50 ce mois-ci. Quelle hausse en % ?',
      bonne: 25, tolerance: 0.5, unite: '%', explication: '(50 − 40) / 40 = 25 %.' },
    { id: 't8q2', type: 'choix', titre: 'La fin du bilan', texte: 'Comment termines-tu le bilan ?',
      options: ['Par un tableau de 15 indicateurs.', 'Par une proposition claire : garder, arrêter ou tester.', 'Par une demande d’augmentation.'],
      retours: ['Personne ne le lit.', 'Le client sait quoi décider.', 'Hors sujet ici.'],
      bonne: 1, explication: 'Un bilan sert à décider.' },
    { id: 't8q3', type: 'choix', critique: true, titre: 'Chiffre gênant', texte: 'Les followers ont baissé. Que fais-tu ?',
      options: ['Tu retires le chiffre du bilan.', 'Tu le montres, tu expliques l’hypothèse et tu proposes une action.', 'Tu changes la période pour masquer la baisse.'],
      retours: ['Masquer une donnée casse la confiance.', 'L’honnêteté fidélise le client.', 'Manipuler les chiffres est une faute.'],
      bonne: 1, explication: 'Erreur critique : maquiller les résultats.' }
  ]
}
  );
}(typeof globalThis !== 'undefined' ? globalThis : this));
