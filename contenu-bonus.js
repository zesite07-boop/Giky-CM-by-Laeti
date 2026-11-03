/* Enrichissement v2 : questions supplémentaires dans chaque leçon, trois leçons business
   (devises, devis-facture, budget-reporting) et questions bonus de l'épreuve finale.
   Les taux de change des exercices sont fictifs et arrondis ; les chiffres légaux sont
   des repères pédagogiques vérifiés le 3 novembre 2026 : vérifier le taux en vigueur
   sur la source officielle liée. */
(function (root) {
  'use strict';
  const C = root.CMContenu = root.CMContenu || { lecons: [] };
  C.version = '2.0.0';
  const ajouter = (id, qs, sources) => {
    const l = id === 'final' ? C.final : C.lecons.find(x => x.id === id);
    if (!l) throw new Error('Leçon inconnue : ' + id);
    l.questions.push(...qs);
    if (sources) for (const s of sources) if (!l.sources.includes(s)) l.sources.push(s);
  };
  const ch = (id, titre, texte, options, retours, bonne, explication, critique) =>
    Object.assign({ id, type: 'choix', titre, texte, options, retours, bonne, explication }, critique ? { critique: true } : {});
  const mu = (id, titre, texte, options, retours, bonne, explication) => ({ id, type: 'multiple', titre, texte, options, retours, bonne, explication });
  const nb = (id, titre, texte, bonne, tolerance, unite, explication) => ({ id, type: 'nombre', titre, texte, bonne, tolerance, unite, explication });

  /* ---------- Apprendre le métier ---------- */
  ajouter('t1', [
    ch('t1q4', 'Le message de 23 h', 'Ton contrat prévoit des réponses en jours ouvrés, de 9 h à 18 h. Le streamer t’écrit à 23 h : « URGENT, une story maintenant ! »',
      ['Tu réponds tout de suite, comme toujours.', 'Tu réponds le lendemain matin, tu rappelles le cadre et tu proposes une option « astreinte » chiffrée.', 'Tu ne réponds jamais à ce genre de message.'],
      ['Tu crées une habitude que tu devras tenir à chaque fois.', 'Le cadre protège ton énergie, et l’option payante répond au vrai besoin.', 'Le silence abîme la relation : réponds, mais dans tes horaires.'],
      1, 'Un cadre écrit et une option payante pour l’urgence valent mieux que l’épuisement.'),
    mu('t1q5', 'Ton cœur de métier', 'Quelles tâches relèvent du community management ? (2 réponses)',
      ['Répondre aux commentaires et animer le Discord.', 'Monter une vidéo YouTube de 20 minutes.', 'Planifier les posts qui annoncent les lives.', 'Réparer le PC du streamer.'],
      ['Animer la communauté, c’est le cœur du métier.', 'Le montage est une option à chiffrer à part.', 'Annoncer et rythmer les lives fait partie du rôle.', 'Hors périmètre.'],
      [0, 2], 'Animation et planification : le cœur. Montage et graphisme : options chiffrées.')
  ]);
  ajouter('t2', [
    ch('t2q4', 'Nouveau viewer', 'Un nouveau viewer dit bonjour dans le chat. Qu’est-ce qui le fait revenir ?',
      ['L’ignorer pour ne pas casser le rythme.', 'Le saluer par son pseudo et l’inclure dans la discussion.', 'Lui demander tout de suite de follow.'],
      ['Il repart souvent aussi vite qu’il est venu.', 'Se sentir vu, c’est la première raison de revenir.', 'Trop direct : d’abord l’accueil, ensuite le follow.'],
      1, 'Accueillir par le pseudo, c’est le geste de base qui fidélise.'),
    ch('t2q5', 'Changer d’horaire ?', 'Ton client veut changer d’horaire chaque semaine « pour tester ». Que conseilles-tu ?',
      ['Changer chaque semaine.', 'Garder un créneau fixe 4 semaines, puis comparer les chiffres.', 'Supprimer le planning.'],
      ['Personne ne peut prendre l’habitude de venir.', 'Un test propre : une variable, une durée, une comparaison.', 'Sans planning, la communauté ne sait pas quand venir.'],
      1, 'Tester une chose à la fois, sur une durée suffisante.')
  ]);
  ajouter('t3', [
    ch('t3q4', 'Combien de piliers ?', 'Combien de piliers de contenu proposes-tu pour démarrer ?',
      ['Un seul.', 'Trois ou quatre.', 'Une douzaine.'],
      ['Trop étroit : tu vas tourner en rond.', 'Assez pour varier, assez peu pour rester reconnaissable.', 'Impossible à tenir et à reconnaître.'],
      1, 'Trois ou quatre piliers : variés mais lisibles.'),
    nb('t3q5', 'Le bon mix', 'Ta cliente veut 60 % de coulisses et 40 % de clips. Sur 20 posts par mois, combien de clips ?', 8, 0, 'posts', '20 × 40 % = 8 clips.')
  ]);
  ajouter('t4', [
    nb('t4q4', 'Volume du mois', '3 lives par semaine. Pour chaque live : 1 annonce et 1 clip. En plus : 2 posts communauté par semaine. Combien de publications sur 4 semaines ?', 32, 0, 'publications', '(3 × 2 + 2) × 4 = 32.'),
    ch('t4q5', 'Pas encore validé', 'Le client te demande de publier un post qu’il n’a pas validé, « pour aller vite ».',
      ['Tu publies.', 'Tu demandes une validation écrite rapide (un simple message) et tu la gardes.', 'Tu ne publies plus jamais rien sans réunion.'],
      ['Si le post pose problème, c’est toi qui portes le risque.', 'Une trace écrite de 10 secondes te protège.', 'Trop lourd : un message suffit.'],
      1, 'Toujours une trace écrite de la validation.')
  ]);
  ajouter('t5', [
    ch('t5q4', 'Le modo trop zélé', 'Un modérateur bénévole bannit des gens « pour rigoler ».',
      ['Tu laisses faire.', 'Tu rappelles la charte de modération écrite et tu revois ses droits avec le streamer.', 'Tu le bannis en plein live, devant tout le monde.'],
      ['La communauté perd confiance dans la modération.', 'Règles claires et droits ajustés, en privé.', 'L’humilier en public crée un second problème.'],
      1, 'La modération suit une charte écrite, et on recadre en privé.'),
    ch('t5q5', 'Le lien suspect', 'Un viewer poste en boucle un lien raccourci inconnu.',
      ['Tu cliques pour voir ce que c’est.', 'Tu supprimes, tu donnes un timeout et tu actives le filtre de liens.', 'Tu ne fais rien.'],
      ['Ne clique jamais : risque d’arnaque ou de piratage du compte.', 'Supprimer, sanctionner, prévenir.', 'Les viewers risquent de cliquer.'],
      1, 'Erreur critique : cliquer sur un lien inconnu peut compromettre les comptes.', true)
  ], ['twitchAutomod']);
  ajouter('t6', [
    ch('t6q4', 'La musique du clip', 'Tu veux mettre un tube connu en fond d’un clip TikTok sponsorisé.',
      ['Pas de souci si l’extrait dure moins de 30 secondes.', 'Tu prends un titre de la bibliothèque commerciale de la plateforme, ou une musique libre avec une licence adaptée.', 'Créditer l’artiste suffit.'],
      ['La « règle des 30 secondes » n’existe pas.', 'Une licence qui couvre l’usage commercial.', 'Créditer n’est pas avoir l’autorisation.'],
      1, 'Erreur critique : utiliser une œuvre protégée dans une publicité sans licence.', true),
    ch('t6q5', 'Le montage d’un fan', 'Un viewer t’envoie un montage de ton client et accepte que tu le publies.',
      ['Tu le publies sans le citer.', 'Tu le publies en le créditant, avec son accord écrit (un message suffit).', 'Tu le modifies et tu le signes.'],
      ['Son travail mérite d’être crédité.', 'Accord écrit et crédit : la communauté adore.', 'Tu t’appropries le travail de quelqu’un.'],
      1, 'Accord écrit + crédit visible.')
  ]);
  ajouter('t7', [
    ch('t7q4', 'Où placer la mention ?', 'La mention « Publicité » ou « Collaboration commerciale » doit être…',
      ['Cachée parmi les hashtags, à la fin.', 'Claire, lisible, identifiable, et visible pendant toute la promotion.', 'Dite une seule fois, à la fin d’un live de 4 heures.'],
      ['Une mention cachée n’en est pas une.', 'C’est ce qu’exige la loi sur l’influence commerciale.', 'Les viewers arrivés avant ne l’entendent pas.'],
      1, 'Mention claire, lisible, identifiable, pendant toute la promotion.'),
    mu('t7q5', 'Les interdits', 'Quelles promotions sont interdites aux influenceurs ? (2 réponses)',
      ['La chirurgie esthétique.', 'Les jeux vidéo.', 'Inciter à arrêter un traitement médical.', 'Les boissons sans alcool.'],
      ['Interdite par la loi de 2023.', 'Autorisés, avec la mention.', 'Interdite : c’est l’« abstention thérapeutique ».', 'Autorisées, avec la mention.'],
      [0, 2], 'Chirurgie esthétique et abstention thérapeutique sont interdites. Liste complète sur la source officielle.')
  ], ['loiInfluence', 'arppCM']);
  ajouter('t8', [
    nb('t8q4', 'Taux d’engagement', '450 interactions pour 15 000 impressions. Quel est le taux d’engagement ? (en %)', 3, 0.05, '%', '450 ÷ 15 000 = 0,03, soit 3 %.'),
    ch('t8q5', 'Le bon indicateur', 'Quel indicateur montre le mieux la fidélité sur Twitch ?',
      ['Le nombre total de followers.', 'La moyenne de spectateurs et la part de viewers qui reviennent.', 'Les likes sur un tweet.'],
      ['Il ne baisse presque jamais : il ne dit pas qui revient.', 'Ceux qui reviennent sont ta communauté.', 'C’est un signal faible, sur une autre plateforme.'],
      1, 'La fidélité se lit dans ceux qui reviennent.')
  ]);

  /* ---------- Missions ---------- */
  ajouter('m1', [
    ch('m1q4', 'Le rythme', 'Hugo veut streamer 7 jours sur 7, 8 heures par jour, dès le lancement.',
      ['Tu valides : plus il streame, plus il grandit.', 'Tu proposes un rythme qu’il pourra tenir 3 mois, par exemple 3 soirs fixes.', 'Tu lui dis d’attendre d’avoir 1 000 followers.'],
      ['Il risque l’épuisement en quelques semaines.', 'La régularité bat l’intensité.', 'On ne gagne pas de followers sans streamer.'],
      1, 'Un rythme tenable et fixe.'),
    mu('m1q5', 'Avant le premier live', 'Que prépares-tu avant le premier live ? (3 réponses)',
      ['Les panneaux et le planning de la chaîne.', 'Les règles du chat.', 'L’achat de 500 viewers.', 'Un message d’annonce sur ses réseaux.'],
      ['Ils rassurent les nouveaux.', 'Indispensable avant d’ouvrir le chat.', 'Interdit par Twitch, et risqué pour la chaîne.', 'Les premiers viewers viennent de là.'],
      [0, 1, 3], 'Planning, règles, annonce. Jamais de faux viewers.')
  ]);
  ajouter('m2', [
    ch('m2q4', 'Après le choc', 'Ta cliente est secouée après le raid et veut arrêter le live.',
      ['Tu insistes pour qu’elle continue.', 'Tu la soutiens : elle coupe si elle veut, un message calme à la communauté, débrief plus tard.', 'Tu publies les pseudos des harceleurs et tu appelles la communauté à riposter.'],
      ['Sa santé passe avant les statistiques.', 'Protéger la personne, puis la communauté.', 'Appeler à riposter, c’est du harcèlement en retour.'],
      1, 'Erreur critique : appeler à la riposte expose ta cliente et sa communauté.', true),
    ch('m2q5', 'La prochaine fois', 'Que mets-tu en place pour la prochaine fois ?',
      ['Rien, ça ne se reproduira pas.', 'Une procédure écrite avec les modos : mode followers-only prêt, AutoMod réglé, commandes listées.', 'Tu désactives le chat pour toujours.'],
      ['Les raids se répètent souvent.', 'Une procédure prête évite de paniquer.', 'Sans chat, plus de communauté.'],
      1, 'Une procédure écrite, testée avec l’équipe.')
  ], ['twitchAutomod']);
  ajouter('m3', [
    nb('m3q4', 'Taux de clic', 'Ton post d’annonce fait 12 000 vues et 240 clics vers la page du jeu. Taux de clic ? (en %)', 2, 0.05, '%', '240 ÷ 12 000 = 2 %.'),
    ch('m3q5', 'Embargo', 'Le studio t’a confié la date de sortie, sous embargo. Un ami youtubeur te la demande.',
      ['Tu la lui donnes « en off ».', 'Tu refuses poliment : l’embargo vaut pour tout le monde.', 'Tu lui donnes juste un indice.'],
      ['Une fuite peut te coûter le client et ta réputation.', 'La confidentialité est non négociable.', 'Un indice, c’est déjà une fuite.'],
      1, 'Erreur critique : rompre un embargo.', true)
  ]);
  ajouter('m4', [
    ch('m4q3', 'Le slogan', 'La marque de chips veut que le streamer dise : « Les meilleures chips du monde, prouvé scientifiquement ».',
      ['Tu acceptes.', 'Tu proposes un avis personnel honnête, sans affirmation qu’on ne peut pas prouver.', 'Tu ajoutes un clin d’œil pour que ça passe.'],
      ['Une affirmation fausse peut être une pratique commerciale trompeuse.', 'Honnête et défendable.', 'L’humour n’efface pas l’affirmation.'],
      1, 'Pas d’allégation qu’on ne peut pas prouver.'),
    ch('m4q4', 'Le test', 'La marque a un budget pour un test. Quelle approche ?',
      ['Un seul gros streamer, sans regarder son public.', 'Trois streamers moyens dont le public colle à la marque, chacun avec son lien ou code de suivi.', '30 micro-streamers choisis au hasard.'],
      ['Tout repose sur un seul pari.', 'Comparable, mesurable, et l’affinité est vérifiée.', 'Impossible à suivre.'],
      1, 'Affinité + suivi individuel = un test qui apprend quelque chose.'),
    nb('m4q5', 'Coût par vente', 'Budget : 3 000 € pour 3 streamers. Ventes suivies : 120, 60 et 20. Coût par vente global ? (en €)', 15, 0, '€', '3 000 ÷ 200 ventes = 15 € par vente.')
  ]);
  ajouter('m5', [
    ch('m5q4', 'Dérapage en direct', 'Un caster lance une insulte pendant le direct.',
      ['Tu ignores.', 'Tu modères le clip, l’orga s’excuse et applique la règle prévue.', 'Tu supprimes toute la VOD sans un mot.'],
      ['Le silence passe pour de l’approbation.', 'Réagir vite, selon une règle connue d’avance.', 'Supprimer sans expliquer alimente la rumeur.'],
      1, 'Réaction rapide, excuses, règle appliquée.'),
    nb('m5q5', 'Planning de posts', 'Tournoi de 3 jours : 4 posts par jour, plus un récap final. Combien de posts ?', 13, 0, 'posts', '3 × 4 + 1 = 13.')
  ]);
  ajouter('m6', [
    mu('m6q3', 'Les faits', 'Quels constats sont factuels ? (2 réponses)',
      ['Les lives commencent en moyenne 25 minutes en retard (relevé sur 8 lives).', 'Le contenu est nul.', 'Aucune publication entre deux lives depuis 3 semaines.', 'La streameuse manque d’énergie.'],
      ['Mesuré, daté : factuel.', 'Jugement, pas un constat.', 'Vérifiable : factuel.', 'Ressenti, pas un fait.'],
      [0, 2], 'Un constat se mesure.'),
    ch('m6q4', 'Combien d’actions ?', 'Combien d’actions proposes-tu à la fin de l’audit ?',
      ['Quinze.', 'Trois, classées selon leur impact et l’effort qu’elles demandent.', 'Aucune : juste les constats.'],
      ['Personne ne les fera.', 'Assez pour avancer, peu pour s’y tenir.', 'Un audit sans action ne sert à rien.'],
      1, 'Trois actions priorisées.'),
    ch('m6q5', 'La suite', 'L’audit était offert. Comment conclus-tu ?',
      ['Tu réalises toutes les actions gratuitement.', 'Tu proposes une offre chiffrée pour les réaliser, avec une date de rappel.', 'Tu attends qu’il te recontacte.'],
      ['Ton temps a une valeur.', 'L’audit devient une porte d’entrée commerciale.', 'Souvent, il ne revient pas.'],
      1, 'Audit → offre chiffrée → date de rappel.')
  ]);

  /* ---------- Business ---------- */
  ajouter('b1', [
    ch('b1q4', 'Beaucoup de frais', 'Tes frais réels font 45 % de ton chiffre d’affaires (matériel, logiciels, sous-traitance).',
      ['Tu restes en micro sans te poser de question.', 'Tu compares avec un régime au réel, avec un expert-comptable : l’abattement de 34 % ne couvre pas tes frais.', 'Tu achètes encore plus de matériel.'],
      ['Tu pourrais payer plus qu’au réel.', 'En micro, tes frais ne se déduisent pas : seul l’abattement forfaitaire compte.', 'Ça ne règle rien.'],
      1, 'En micro, les frais réels ne se déduisent pas.'),
    nb('b1q5', 'L’assiette', 'En micro, tu encaisses 2 000 € et tu as 300 € de frais. Sur quel montant sont calculées tes cotisations ? (en €)', 2000, 0, '€', 'Sur l’encaissé brut : 2 000 €. Les frais ne se déduisent pas.')
  ], ['declarerCA']);
  ajouter('b2', [
    nb('b2q4', 'Trimestre BIC', 'Trimestre en BIC services : 6 000 € encaissés, 21,2 % + 0,1 % de CFP. Total à payer ? (en €)', 1278, 1, '€', '6 000 × 21,3 % = 1 278 €.'),
    ch('b2q5', 'Mois à zéro', 'Tu n’as rien encaissé ce mois-ci.',
      ['Pas besoin de déclarer.', 'Tu déclares 0 €.', 'Tu déclareras le double le mois prochain.'],
      ['La déclaration reste obligatoire, même à zéro.', 'Même un chiffre d’affaires nul se déclare.', 'Chaque période se déclare séparément.'],
      1, 'Même un chiffre d’affaires de 0 € se déclare.')
  ], ['declarerCA', 'simulateurUrssaf']);
  ajouter('b3', [
    nb('b3q4', 'Versement libératoire', 'Chiffre d’affaires BNC : 30 000 €, versement libératoire de 2,2 %. Impôt ? (en €)', 660, 1, '€', '30 000 × 2,2 % = 660 €.'),
    ch('b3q5', 'Accès au VFL', 'Le versement libératoire est possible si…',
      ['Ton revenu fiscal de référence de l’avant-dernière année ne dépasse pas un plafond par part.', 'Toujours, quel que soit ton revenu.', 'Seulement en BIC.'],
      ['C’est la condition : le plafond est sur impots.gouv.fr.', 'Il y a une condition de revenu.', 'Ouvert en BNC comme en BIC.'],
      0, 'Condition de revenu fiscal de référence : vérifier le plafond en vigueur.')
  ]);
  ajouter('b4', [
    nb('b4q4', 'Ton TJM', 'Tu veux garder 24 000 € par an. Frais : 1 200 €. Prélèvements : 25,8 % (BNC + CFP). 135 jours facturés. Quel TJM, arrondi à l’euro supérieur ? (en €)', 252, 1, '€', '(24 000 + 1 200) ÷ (1 − 0,258) ÷ 135 ≈ 251,6, donc 252 €.'),
    ch('b4q5', 'En dollars', 'Un client américain te demande ton TJM en dollars.',
      ['Tu donnes le même chiffre en $.', 'Tu convertis au taux du jour et tu indiques la devise, la date du taux et la durée de validité du devis.', 'Tu refuses de travailler en dollars.'],
      ['1 € ≠ 1 $ : tu perds ou tu gagnes au hasard.', 'Le prix est clair, et le risque de change est limité dans le temps.', 'C’est possible, avec les bonnes mentions.'],
      1, 'Convertir, dater, limiter la validité.')
  ], ['devises']);
  ajouter('b5', [
    ch('b5q4', 'Numérotation', 'Comment numérotes-tu tes factures ?',
      ['Je recommence à 1 pour chaque client.', 'Selon une séquence chronologique continue, sans trou.', 'Au hasard, c’est plus joli.'],
      ['Ça crée des doublons.', 'C’est l’obligation.', 'Interdit : la suite doit être continue.'],
      1, 'Séquence chronologique et continue.'),
    ch('b5q5', 'Délai maximum', 'Entre professionnels, quel est le délai de paiement maximal en règle générale ?',
      ['60 jours après la date de la facture (ou 45 jours fin de mois si c’est prévu au contrat).', '6 mois.', 'Il n’y a pas de limite.'],
      ['C’est le plafond général.', 'Beaucoup trop long.', 'La loi fixe un plafond.'],
      0, '60 jours après la date d’émission, ou 45 jours fin de mois.')
  ]);
  ajouter('b6', [
    nb('b6q4', 'Ton coussin', 'Tes dépenses mensuelles : 1 600 €. Combien pour un coussin de 3 mois ? (en €)', 4800, 0, '€', '1 600 × 3 = 4 800 €.'),
    ch('b6q5', 'Payé d’avance', 'Un client te paie 1 500 € d’avance pour 3 mois.',
      ['Tu dépenses tout.', 'Tu provisionnes les cotisations dès l’encaissement, puis tu étales le reste sur 3 mois.', 'Tu attends la fin des 3 mois pour le déclarer.'],
      ['Les cotisations tomberont quand même.', 'Encaissé = déclaré : provisionne tout de suite.', 'Tu déclares ce que tu encaisses, à la période où tu l’encaisses.'],
      1, 'Erreur critique : retarder la déclaration d’un encaissement.', true)
  ]);

  /* ---------- Clients ---------- */
  ajouter('p1', [
    ch('p1q3', 'Ta phrase', 'Quelle phrase de positionnement est la plus forte ?',
      ['Je fais de tout sur les réseaux.', 'J’aide les streameurs FR de 50 à 500 viewers à remplir leurs lives grâce aux clips et au Discord.', 'Je suis créative et motivée.'],
      ['Trop vague pour être recommandée.', 'Qui, quoi, comment : on sait tout de suite.', 'Des qualités, pas une offre.'],
      1, 'Qui + résultat + comment.'),
    ch('p1q4', 'La peur de la niche', 'Tu as peur qu’une niche te fasse rater des clients. Qu’en est-il ?',
      ['Une niche claire facilite le bouche-à-oreille, et tu peux quand même accepter d’autres missions.', 'Une niche interdit tout autre client.', 'Sans niche, tu as forcément plus de clients.'],
      ['On recommande facilement une spécialiste.', 'C’est une vitrine, pas une prison.', 'Généraliste = difficile à recommander.'],
      0, 'La niche, c’est ta vitrine.')
  ]);
  ajouter('p2', [
    ch('p2q3', 'Chiffre confidentiel', 'Ton meilleur résultat est confidentiel.',
      ['Tu inventes un chiffre approchant.', 'Tu le présentes en tendance (« +40 % de viewers moyens ») si l’accord le permet, sinon tu demandes au client.', 'Tu le publies quand même.'],
      ['Inventer ruine ta crédibilité.', 'Tu valorises sans trahir.', 'Violation de la confidentialité.'],
      1, 'Tendance relative, avec accord.'),
    mu('p2q4', 'Ta page', 'Que mets-tu sur ta page portfolio ? (3 réponses)',
      ['Trois études de cas.', 'Un moyen de contact clair.', 'Ton offre et un prix « à partir de ».', 'Les détails de ta vie privée.'],
      ['La preuve.', 'Sans contact, aucune mission.', 'Ça filtre les demandes.', 'Ça n’aide pas à vendre et ça t’expose.'],
      [0, 1, 2], 'Preuves, offre, contact.')
  ]);
  ajouter('p3', [
    mu('p3q3', 'Les bons signaux', 'Quels signaux montrent qu’un streamer a besoin d’aide ? (2 réponses)',
      ['Lives réguliers, mais aucun post entre deux lives.', 'Il vient d’annoncer un partenariat avec une marque.', 'Il ne streame plus depuis un an.', 'Il a déjà une équipe com de 5 personnes.'],
      ['Il y a un manque visible.', 'Nouvelle charge de travail : bon moment.', 'Plus d’activité, pas de besoin.', 'Le besoin est déjà couvert.'],
      [0, 1], 'Un manque visible ou un nouveau projet.'),
    nb('p3q4', 'Réponses attendues', '30 prospects, 20 % de taux de réponse. Combien de réponses ?', 6, 0, 'réponses', '30 × 20 % = 6.')
  ]);
  ajouter('p4', [
    ch('p4q3', 'L’objet', 'Quel objet de message donne envie d’ouvrir ?',
      ['« Proposition commerciale »', '« Ton clip du boss final de mardi : une idée »', '« URGENT »'],
      ['On sait d’avance que c’est une pub.', 'Précis, personnel, curieux.', 'Agressif, et faux.'],
      1, 'Précis et personnel.'),
    ch('p4q4', '« Pas maintenant »', 'Le prospect répond : « Pas maintenant. »',
      ['Tu insistes chaque semaine.', 'Tu remercies, tu demandes quand revenir vers lui et tu notes la date.', 'Tu supprimes le contact.'],
      ['Tu te grilles.', '« Pas maintenant » n’est pas « non ».', 'Tu perds une future mission.'],
      1, 'Remercier, demander quand, noter la date.')
  ]);
  ajouter('p5', [
    mu('p5q3', 'Les bonnes questions', 'Quelles questions ouvrent vraiment la découverte ? (2 réponses)',
      ['« Qu’est-ce qui serait une réussite pour toi dans 3 mois ? »', '« Tu signes aujourd’hui ? »', '« Qu’as-tu déjà essayé, et qu’est-ce qui a coincé ? »', '« Tu as un petit budget, non ? »'],
      ['Ouvre sur l’objectif.', 'Trop tôt, ça ferme.', 'Ouvre sur l’expérience.', 'Question fermée et orientée.'],
      [0, 2], 'Questions ouvertes : objectif et vécu.'),
    ch('p5q4', 'Il parle beaucoup', 'Le prospect raconte son parcours pendant 20 minutes.',
      ['Tu le coupes.', 'Tu écoutes, tu reformules en 2 phrases et tu ramènes la discussion vers son objectif.', 'Tu racontes le tien aussi.'],
      ['Il se sent ignoré.', 'Il se sent compris, et l’appel avance.', 'L’appel dérive.'],
      1, 'Écouter, reformuler, recentrer.')
  ]);
  ajouter('p6', [
    ch('p6q3', '« C’est cher »', 'Le prospect dit : « C’est cher. »',
      ['Tu baisses de 30 %.', 'Tu demandes « Cher par rapport à quoi ? », tu rappelles le résultat visé et tu proposes un périmètre réduit.', 'Tu abandonnes.'],
      ['Tu dévalues ton travail.', 'Tu comprends l’objection et tu ajustes le périmètre, pas ton prix.', 'Une objection est une question.'],
      1, 'Comprendre, rappeler la valeur, ajuster le périmètre.'),
    nb('p6q4', 'Acompte', 'Devis de 1 500 €, acompte de 30 %. Montant de l’acompte ? (en €)', 450, 0, '€', '1 500 × 30 % = 450 €.'),
    ch('p6q5', 'Validité', 'Quelle durée de validité donnes-tu à ton devis ?',
      ['Illimitée.', 'Une durée précise (par exemple 30 jours), écrite sur le devis.', 'Aucune mention.'],
      ['Ton prix de 2026 serait encore valable en 2028.', 'Tu gardes la main sur ton prix et sur ton planning.', 'Source de litiges.'],
      1, 'Une durée écrite protège ton prix, surtout en devise étrangère.')
  ]);

  /* ---------- Nouvelles leçons business ---------- */
  C.lecons.push(
  {
    id: 'b7', code: 'B7', parcours: 'business', titre: 'Clients à l’étranger : dollars et livres sterling', duree: '12 min',
    court: 'Facturer en $ ou en £ sans te tromper de mention ni de déclaration.',
    objectif: 'Facturer un client au Royaume-Uni ou aux États-Unis, puis déclarer correctement en euros.',
    situation: 'Un studio indépendant de Londres et une marque de New York veulent travailler avec toi. L’un paie en livres, l’autre en dollars.',
    cours: [
      ['Facturer en devise', 'Tu peux facturer en dollars (USD) ou en livres sterling (GBP) : la devise doit être reconnue et convertible, et ta comptabilité reste en euros. Indique le montant en devise, sa contre-valeur en euros et le taux de change appliqué.'],
      ['La TVA selon le client', 'Client professionnel hors UE (Royaume-Uni, États-Unis) : facture sans TVA française, avec la mention « TVA non applicable – art. 259-1 du CGI ». Client professionnel dans l’UE : facture hors taxe avec la mention « Autoliquidation ». En franchise, pour un client en France : « TVA non applicable, art. 293 B du CGI ».'],
      ['Client pro dans l’UE', 'Il te faut un numéro de TVA intracommunautaire, le tien et celui du client, et une déclaration européenne de services. Renseigne-toi auprès de ton service des impôts des entreprises avant la première facture.'],
      ['Déclarer à l’Urssaf', 'Tu déclares en euros le chiffre d’affaires encaissé, sans déduire les commissions ni les frais. Pour chaque paiement, note la date, le montant en devise, le taux utilisé et le montant en euros. Garde toujours la même méthode.']
    ],
    memo: 'Devise + contre-valeur en € + taux daté sur la facture. Pro hors UE : « TVA non applicable – art. 259-1 du CGI ». Pro UE : « Autoliquidation ». Urssaf : en €, sans déduire les frais. Repère pédagogique : vérifier sur la source officielle liée.',
    defi: 'Dans la boîte à outils, prépare un devis test en dollars pour une marque imaginaire de New York, puis compare le total en €, $ et £.',
    sources: ['devises', 'mentionsEco', 'assujettis', 'bofipDevises', 'declarerCA', 'bce', 'factures'],
    questions: [
      ch('b7q1', 'Facturer en livres', 'Le studio de Londres veut une facture en livres sterling. C’est possible ?',
        ['Non, toujours en euros.', 'Oui, avec la contre-valeur en euros et le taux de change appliqué.', 'Oui, sans rien ajouter.'],
        ['La loi autorise les devises reconnues et convertibles.', 'Montant en £, équivalent en €, taux daté.', 'Il manque la contre-valeur et le taux.'],
        1, 'Devise autorisée, avec contre-valeur en euros et taux.'),
      ch('b7q2', 'Mention TVA : New York', 'Client professionnel à New York. Quelle mention de TVA ?',
        ['« TVA 20 % »', '« TVA non applicable – art. 259-1 du CGI »', '« Autoliquidation »'],
        ['Écrire une TVA te rend redevable de cette TVA.', 'C’est la mention pour un client pro hors UE.', 'Réservée aux clients pros dans l’UE.'],
        1, 'Erreur critique : facturer une TVA française à tort.', true),
      nb('b7q3', 'Dollars → euros', 'Tu factures 1 000 $. Taux fictif : 1 € = 1,12 $. Contre-valeur en euros, arrondie ? (en €)', 893, 1, '€', '1 000 ÷ 1,12 ≈ 892,86, soit environ 893 €.'),
      nb('b7q4', 'Livres → euros', 'Tu factures 800 £. Taux fictif : 1 € = 0,84 £. Contre-valeur en euros, arrondie ? (en €)', 952, 1, '€', '800 ÷ 0,84 ≈ 952,38, soit environ 952 €.'),
      ch('b7q5', 'Les frais de la plateforme', 'Le client paie 1 000 $. La plateforme de paiement prend des frais. Que déclares-tu à l’Urssaf ?',
        ['Le montant arrivé sur ton compte, frais déduits.', 'La contre-valeur en euros des 1 000 $, sans déduire les frais.', 'Rien : c’est un client étranger.'],
        ['Les commissions et frais ne se déduisent pas.', 'Le chiffre d’affaires se déclare brut.', 'Ton activité est en France : tout se déclare.'],
        1, 'Brut, en euros, sans déduire les frais.'),
      ch('b7q6', 'Mention TVA : Berlin', 'Client professionnel à Berlin, assujetti à la TVA. Quelle mention ?',
        ['« Autoliquidation »', '« TVA non applicable, art. 293 B du CGI »', '« TVA non applicable – art. 259-1 du CGI »'],
        ['C’est la mention pour un pro dans l’UE.', 'Pour la franchise en France.', 'Pour un pro hors UE.'],
        0, 'UE : « Autoliquidation » et les numéros de TVA des deux parties.')
    ]
  },
  {
    id: 'b8', code: 'B8', parcours: 'business', titre: 'Devis et facture pas à pas', duree: '10 min',
    court: 'Les mentions qui te protègent, sans y passer ta soirée.',
    objectif: 'Rédiger un devis signé puis une facture complète en 10 minutes.',
    situation: 'Une streameuse accepte ta proposition. Tu dois lui envoyer un devis ce soir, puis la facture à la fin du mois.',
    cours: [
      ['Le devis', 'Périmètre détaillé, prix, délais, durée de validité, conditions de paiement (acompte). Il est signé avec « Bon pour accord » avant que tu commences.'],
      ['La facture', 'Numéro chronologique continu, date, identités (avec la mention EI et ton SIREN), désignation précise, quantité, prix unitaire HT, total, mention de TVA, date d’échéance, pénalités de retard et indemnité de 40 € pour les clients professionnels.'],
      ['L’erreur', 'Une facture envoyée ne se supprime pas. Tu émets une facture d’avoir qui l’annule, puis une nouvelle facture.'],
      ['La facture électronique', 'Recevoir des factures électroniques est obligatoire depuis le 1er septembre 2026. Les émettre le sera au 1er septembre 2027 pour les micro-entreprises : choisis ta plateforme agréée à l’avance.']
    ],
    memo: 'Devis signé avant de commencer. Facture : numéro continu, mentions, échéance, pénalités, 40 €. Une erreur = un avoir, jamais une suppression. Repère pédagogique : vérifier sur la source officielle liée.',
    defi: 'Utilise le générateur de la boîte à outils pour préparer ton modèle de devis, puis imprime-le en PDF.',
    sources: ['factures', 'mentionsEco', 'delais', 'efacture'],
    questions: [
      mu('b8q1', 'Ton devis', 'Que contient ton devis ? (3 réponses)',
        ['Un périmètre détaillé.', 'Une durée de validité.', 'Ton numéro de sécurité sociale.', 'Les conditions de paiement.'],
        ['Ce qui est inclus, et ce qui ne l’est pas.', 'Ton prix ne vaut pas indéfiniment.', 'Donnée personnelle inutile.', 'Acompte, échéances, moyens de paiement.'],
        [0, 1, 3], 'Périmètre, validité, paiement.'),
      ch('b8q2', 'Le numéro suivant', 'Ta dernière facture porte le n° 2026-014. Quel numéro pour la suivante ?',
        ['2026-016', '2026-015', '2026-001'],
        ['Il manquerait un numéro.', 'Suite continue.', 'Doublon interdit.'],
        1, 'Pas de trou, pas de doublon.'),
      nb('b8q3', 'Le total', '3 clips à 80 € et un calendrier éditorial à 250 €. Total HT ? (en €)', 490, 0, '€', '3 × 80 + 250 = 490 €.'),
      ch('b8q4', 'L’erreur', 'Tu t’es trompée sur une facture déjà envoyée.',
        ['Tu la supprimes et tu en refais une avec le même numéro.', 'Tu émets une facture d’avoir qui l’annule, puis une nouvelle facture.', 'Tu modifies le PDF.'],
        ['Une facture émise ne disparaît pas.', 'L’avoir garde ta numérotation propre.', 'Le document envoyé fait foi.'],
        1, 'Avoir + nouvelle facture.'),
      ch('b8q5', 'Client particulier', 'Un particulier te commande un logo pour son usage perso. L’indemnité forfaitaire de 40 € figure sur la facture ?',
        ['Oui, toujours.', 'Non : elle concerne les clients professionnels.', 'Oui, et elle est doublée.'],
        ['Elle est prévue entre professionnels.', 'Clients pros uniquement.', 'Non.'],
        1, 'L’indemnité de 40 € s’applique entre professionnels.')
    ]
  },
  {
    id: 'b9', code: 'B9', parcours: 'business', titre: 'Budget pro et reporting client', duree: '10 min',
    court: 'Ce que coûte ton activité, et ce que tu montres à tes clients.',
    objectif: 'Calculer ton budget mensuel multi-devises et produire un reporting d’une page.',
    situation: 'Tes abonnements sont en dollars, ton client attend son bilan du mois, et tu n’as aucune idée de ce que tu dépenses vraiment.',
    cours: [
      ['Ton budget pro', 'Liste tes abonnements (souvent en dollars), ton matériel, ton assurance, ta CFE, ta formation. Ramène tout en mensuel et en euros : tu vois ce que coûte vraiment ton activité.'],
      ['Le piège des devises', 'Un abonnement en dollars change de prix en euros quand le taux bouge, et ta banque peut ajouter des frais sur les paiements en devise. Vérifie tes conditions bancaires.'],
      ['Les formules du reporting', 'Taux d’engagement = interactions ÷ impressions. Taux de clic = clics ÷ impressions. CPM = coût ÷ impressions × 1 000. Coût par clic = coût ÷ clics.'],
      ['Le format', 'Une page, envoyée à date fixe : 3 chiffres clés, 3 comparaisons avec le mois précédent, 1 décision. Le générateur de reporting le prépare pour toi.']
    ],
    memo: 'Budget : tout en mensuel, tout en euros. Reporting : 3 chiffres, 3 comparaisons, 1 décision, à date fixe.',
    defi: 'Remplis le budget de la boîte à outils avec tes vrais abonnements et note ton poste le plus lourd.',
    sources: ['bce', 'cfe'],
    questions: [
      nb('b9q1', 'Abonnement en dollars', 'Abonnement à 15 $ par mois. Taux fictif : 1 € = 1,12 $. Coût annuel en euros, arrondi ? (en €)', 161, 1, '€', '15 × 12 ÷ 1,12 ≈ 160,71, soit environ 161 €.'),
      nb('b9q2', 'Le CPM', 'Budget pub : 200 € pour 50 000 impressions. Quel CPM ? (en €)', 4, 0.01, '€', '200 ÷ 50 000 × 1 000 = 4 €.'),
      nb('b9q3', 'Taux de clic', '1 200 clics pour 60 000 impressions. Taux de clic ? (en %)', 2, 0.05, '%', '1 200 ÷ 60 000 = 2 %.'),
      ch('b9q4', 'Le début du reporting', 'Ton reporting commence par…',
        ['40 captures d’écran.', 'Les 3 chiffres clés et leur évolution.', 'Des excuses pour le mois.'],
        ['Personne ne les lit.', 'L’essentiel en 10 secondes.', 'Commence par les faits.'],
        1, 'Trois chiffres clés d’abord.'),
      ch('b9q5', 'L’oubli classique', 'Quel poste oublies-tu souvent dans ton budget ?',
        ['La CFE de fin d’année et les frais bancaires sur les paiements en devise.', 'Ton café du matin.', 'Rien, tout est toujours prévu.'],
        ['Ce sont les deux surprises classiques.', 'C’est du perso.', 'Il y a toujours une surprise.'],
        0, 'CFE et frais de change : à provisionner.')
    ]
  });

  /* ---------- Épreuve finale : questions bonus ---------- */
  ajouter('final', [
    nb('efq7', 'Paiement en livres', 'Le studio britannique te paie 1 120 £. Taux fictif du jour : 1 € = 0,84 £. Combien déclares-tu, en euros arrondis ? (en €)', 1333, 1, '€', '1 120 ÷ 0,84 ≈ 1 333 €, déclarés en euros, sans déduire les frais.'),
    ch('efq8', 'Client à Montréal', 'Facture à un client professionnel de Montréal. Quelle mention de TVA ?',
      ['« TVA 20 % »', '« TVA non applicable – art. 259-1 du CGI »', '« Autoliquidation »'],
      ['Pas de TVA française pour un pro hors UE.', 'Pro hors UE.', 'Mention prévue pour l’UE.'],
      1, 'Erreur critique : facturer une TVA française à tort.', true),
    nb('efq9', 'Bilan du mois', 'Spectateurs moyens : 40 le mois dernier, 52 ce mois-ci. Hausse ? (en %)', 30, 0.5, '%', '(52 − 40) ÷ 40 = 30 %.'),
    ch('efq10', 'Trop de projets', 'Tu as 4 clients et tu sens que tu décroches. Un cinquième arrive.',
      ['Tu acceptes, tu verras bien.', 'Tu priorises, tu bloques des créneaux fixes et tu proposes au cinquième une date de début plus tard.', 'Tu travailles la nuit.'],
      ['Tu risques de mal servir les cinq.', 'Une date de début plus tard, c’est quand même un oui.', 'L’épuisement coûte plus cher qu’un client.'],
      1, 'Protéger ton énergie, c’est protéger tes clients.')
  ], ['devises', 'assujettis']);

  const b = C.parcours.find(p => p.id === 'business');
  if (b) b.court = 'Statut, prix, impôts, devises';
}(typeof globalThis !== 'undefined' ? globalThis : this));
