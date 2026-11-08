/* Parcours « Les pourcentages, enfin clairs » (C1 à C4).
   Chaque leçon explique la logique du calcul, donne la formule, la touche à taper sur la calculatrice
   et l’astuce de calcul de tête. Les chiffres légaux (25,6 %, TVA 20 %) sont des repères pédagogiques
   vérifiés le 3 novembre 2026 : voir sources.js. */
(function (root) {
  'use strict';
  const C = root.CMContenu = root.CMContenu || { lecons: [] };
  const ch = (id, titre, texte, options, retours, bonne, explication, critique) =>
    Object.assign({ id, type: 'choix', titre, texte, options, retours, bonne, explication }, critique ? { critique: true } : {});
  const mu = (id, titre, texte, options, retours, bonne, explication) => ({ id, type: 'multiple', titre, texte, options, retours, bonne, explication });
  const nb = (id, titre, texte, bonne, tolerance, unite, explication) => ({ id, type: 'nombre', titre, texte, bonne, tolerance, unite, explication });

  const NOUVELLES = [
  {
    id: 'c1', code: 'C1', parcours: 'calculs', niveau: 1, titre: 'Prendre un pourcentage d’un nombre', duree: '10 min',
    court: 'La recette unique : nombre × pourcentage ÷ 100.',
    objectif: 'Calculer X % d’un montant à la calculatrice, puis de tête pour les pourcentages courants.',
    situation: 'Tu envoies un devis de 450 € et tu demandes 20 % d’acompte. Ton client te demande : « Ça fait combien, concrètement ? » Tu veux répondre en trois secondes, sans te tromper de virgule.',
    cours: [
      ['« Pour cent », ça veut dire « sur 100 »', 'Un pourcentage est une fraction dont le bas vaut toujours 100. 20 % = 20 sur 100 = 20 ÷ 100 = 0,2. Quand on te dit « 20 % de 450 », on te demande de prendre 20 centièmes de 450. Rien de plus.'],
      ['La recette à retenir', 'X % de N = N × X ÷ 100. Sur la calculatrice, tu tapes : 450 × 20 ÷ 100 = 90. Variante identique : transformer le pourcentage en coefficient (20 % devient 0,2) et taper 450 × 0,2 = 90.'],
      ['Passer d’un pourcentage à un coefficient', 'Tu décales la virgule de deux rangs vers la gauche : 25 % → 0,25 ; 3 % → 0,03 ; 0,5 % → 0,005. Le piège numéro un : 3 % ne s’écrit pas 0,3. Si le résultat te paraît énorme, c’est presque toujours la virgule.'],
      ['Le calcul de tête, avec seulement trois réflexes', '10 % : tu divises par 10 (la virgule recule d’un cran). 1 % : tu divises par 100. 50 % : la moitié. Avec ça, tu fabriques le reste : 5 % = la moitié de 10 %, 20 % = 10 % × 2, 15 % = 10 % + 5 %, 25 % = un quart, 75 % = 3 quarts.'],
      ['Où tu en as besoin dans le métier', 'Un acompte (30 % de 1 500 €), une commission, des cotisations (25,6 % du chiffre d’affaires encaissé en BNC), un mix de contenus (60 % de coulisses, 40 % de clips sur 20 posts). C’est toujours la même opération.']
    ],
    tableau: {
      legende: 'Calcul de tête sur 240 (par exemple 240 abonnés ou 240 €)',
      entetes: ['Pourcentage', 'Comment faire de tête', 'Résultat sur 240'],
      lignes: [['10 %', '÷ 10', '24'], ['1 %', '÷ 100', '2,4'], ['5 %', 'moitié de 10 %', '12'], ['20 %', '10 % × 2', '48'], ['25 %', '÷ 4', '60'], ['50 %', '÷ 2', '120'], ['75 %', '÷ 4 puis × 3', '180'], ['15 %', '10 % + 5 %', '36']]
    },
    memo: 'X % de N = N × X ÷ 100. Pour 10 % : ÷ 10. Pour 1 % : ÷ 100. 3 % s’écrit 0,03.',
    defi: 'Prends ton dernier devis : calcule de tête 10 % puis 30 % du total, et vérifie à la calculatrice avec la recette.',
    sources: [],
    questions: [
      nb('c1q1', 'L’acompte', 'Ton devis fait 450 €. Tu demandes 20 % d’acompte. Quel montant ? (en €)', 90, 0, '€', '450 × 20 ÷ 100 = 90 €. De tête : 10 % = 45, donc 20 % = 90.'),
      ch('c1q2', 'Le bon coefficient', 'Quel nombre correspond à 3 % quand on le tape en coefficient sur la calculatrice ?',
        ['0,3', '0,03', '3', '0,003'],
        ['0,3 correspond à 30 %. Tu as décalé la virgule d’un seul rang.', 'Oui : 3 ÷ 100 = 0,03. On décale la virgule de deux rangs.', '3 serait un triplement du nombre, pas un pourcentage.', '0,003 correspond à 0,3 %. Tu as décalé de trois rangs.'],
        1, '3 % = 3 ÷ 100 = 0,03. La virgule recule de deux rangs.'),
      nb('c1q3', '10 % de tête', 'Tu as 1 850 abonnés Discord. Combien font 10 % ?', 185, 0, 'abonnés', '1 850 ÷ 10 = 185. On recule la virgule d’un cran.'),
      nb('c1q4', 'Un pourcentage composé', 'Combien font 15 % de 240 ? (astuce : 10 % + 5 %)', 36, 0, '', '10 % de 240 = 24 ; 5 % = 12 ; 24 + 12 = 36.'),
      ch('c1q5', 'Un quart', 'Quelle opération donne 25 % de 800 le plus vite, de tête ?',
        ['800 × 25', '800 ÷ 4', '800 ÷ 25', '800 × 0,025'],
        ['800 × 25 = 20 000, c’est cent fois trop : il manque la division par 100.', 'Oui : 25 % = un quart. 800 ÷ 4 = 200.', '800 ÷ 25 = 32 : ce n’est pas ce qu’on demande.', '0,025 correspond à 2,5 %, pas à 25 %.'],
        1, '25 % = un quart = ÷ 4. 800 ÷ 4 = 200.'),
      mu('c1q6', 'Les écritures équivalentes', 'Lesquelles donnent le même résultat que « 30 % de 600 » ? (3 réponses)',
        ['600 × 30 ÷ 100', '600 × 0,3', '600 × 0,03', '600 ÷ 100 × 30'],
        ['Oui : c’est la recette de base.', 'Oui : 0,3 est le coefficient de 30 %.', 'Non : 0,03 est le coefficient de 3 %.', 'Oui : diviser d’abord par 100 puis multiplier donne le même résultat.'],
        [0, 1, 3], '30 % de 600 = 180. Le coefficient de 30 % est 0,3, pas 0,03.'),
      nb('c1q7', 'Les cotisations', 'Tu encaisses 2 400 € en BNC. Les cotisations sont de 25,6 % (repère pédagogique 2026). Combien ? (en €)', 614.4, 0.5, '€', '2 400 × 25,6 ÷ 100 = 614,40 €. Vérifie le taux en vigueur sur la source officielle.')
    ]
  },
  {
    id: 'c2', code: 'C2', parcours: 'calculs', niveau: 1, titre: 'Hausse, baisse et remise', duree: '10 min',
    court: 'Le coefficient multiplicateur : un seul calcul au lieu de deux.',
    objectif: 'Augmenter ou diminuer un nombre de X % en une seule opération, et éviter le piège des pourcentages qui s’enchaînent.',
    situation: 'Tu relèves ton tarif journalier de 12 % et, le même jour, un client te demande 15 % de remise sur un forfait. Tu dois donner les deux nouveaux prix sans te tromper.',
    cours: [
      ['Le coefficient, ton raccourci', 'Une hausse de X % multiplie par (1 + X ÷ 100). Une baisse de X % multiplie par (1 − X ÷ 100). +20 % → × 1,2. −15 % → × 0,85. +100 % → × 2. −50 % → × 0,5. Une seule opération suffit.'],
      ['La méthode en deux temps (si le coefficient te perd)', 'Tu calcules d’abord la part : 12 % de 250 = 30. Puis tu l’ajoutes (hausse) ou tu la retires (baisse) : 250 + 30 = 280. Les deux méthodes donnent le même résultat. Choisis celle qui te rassure.'],
      ['Le piège des pourcentages qui s’enchaînent', 'Deux pourcentages ne s’additionnent pas. +10 % puis −10 % ne ramène pas au départ : 100 → 110 → 99. C’est −1 % au total. Chaque pourcentage s’applique à la valeur du moment, pas à la valeur d’origine.'],
      ['Le cas de la TVA', 'Ajouter 20 % de TVA revient à multiplier le prix hors taxe par 1,2. 80 € HT → 96 € TTC. Même mécanique que toute hausse.'],
      ['Se méfier du mot « jusqu’à »', 'Une remise « jusqu’à −50 % » est une remise maximale, pas moyenne. Toujours demander à quel produit ou à quel forfait elle s’applique avant de la comparer.']
    ],
    tableau: {
      legende: 'Coefficients à connaître, exemples sur 200',
      entetes: ['Variation', 'Coefficient', 'Résultat sur 200'],
      lignes: [['+10 %', '× 1,1', '220'], ['+20 %', '× 1,2', '240'], ['+50 %', '× 1,5', '300'], ['+100 %', '× 2', '400'], ['−10 %', '× 0,9', '180'], ['−20 %', '× 0,8', '160'], ['−25 %', '× 0,75', '150'], ['−50 %', '× 0,5', '100']]
    },
    memo: 'Hausse : × (1 + X ÷ 100). Baisse : × (1 − X ÷ 100). Les pourcentages successifs se multiplient, ils ne s’additionnent pas.',
    defi: 'Calcule ton tarif journalier avec +10 %, +15 % et +20 % ; note le plus réaliste pour ton prochain devis.',
    sources: [],
    questions: [
      nb('c2q1', 'Relever son tarif', 'Ton tarif journalier est de 250 €. Tu l’augmentes de 12 %. Nouveau tarif ? (en €)', 280, 0, '€', '250 × 1,12 = 280 €. Ou : 12 % de 250 = 30, puis 250 + 30.'),
      nb('c2q2', 'La remise', 'Un forfait coûte 200 €. Tu accordes 15 % de remise. Prix final ? (en €)', 170, 0, '€', '200 × 0,85 = 170 €. Ou : 15 % de 200 = 30, puis 200 − 30.'),
      ch('c2q3', 'Le coefficient d’une baisse', 'Quel coefficient correspond à une baisse de 30 % ?',
        ['0,3', '0,7', '1,3', '0,03'],
        ['0,3 est ce qui reste d’un nombre baissé de 70 %.', 'Oui : 1 − 0,30 = 0,70.', '1,3 correspond à une hausse de 30 %.', '0,03 correspond à 3 %.'],
        1, 'Baisse de 30 % : on garde 70 %, donc × 0,7.'),
      ch('c2q4', 'Plus dix, moins dix', 'Un prix de 100 € augmente de 10 %, puis baisse de 10 %. Où arrive-t-on ?',
        ['À 100 €, comme au départ', 'À 99 €', 'À 101 €', 'À 110 €'],
        ['Les deux pourcentages ne s’annulent pas : ils s’appliquent à des bases différentes.', 'Oui : 100 × 1,1 = 110, puis 110 × 0,9 = 99.', '101 € serait le résultat d’une hausse de 1 %.', 'Tu as oublié la baisse.'],
        1, '100 → 110 → 99. Les pourcentages successifs se multiplient.'),
      nb('c2q5', 'L’abonnement', 'Un outil à 12 € par mois augmente de 25 %. Nouveau prix mensuel ? (en €)', 15, 0, '€', '12 × 1,25 = 15 €. De tête : 25 % = un quart de 12 = 3.'),
      nb('c2q6', 'Passer au TTC', 'Un service est facturé 80 € HT avec une TVA à 20 %. Prix TTC ? (en €)', 96, 0, '€', '80 × 1,2 = 96 €. La TVA est une hausse comme une autre.'),
      mu('c2q7', 'Deux bonnes façons', 'Quelles opérations donnent le prix après une remise de 20 % sur 150 € ? (2 réponses)',
        ['150 × 0,8', '150 − (150 × 20 ÷ 100)', '150 × 0,2', '150 − 20'],
        ['Oui : le coefficient d’une baisse de 20 % est 0,8.', 'Oui : tu calcules la remise (30 €) puis tu la retires.', 'Non : 150 × 0,2 = 30, c’est le montant de la remise, pas le prix final.', 'Non : retirer 20 € n’est pas retirer 20 %.'],
        [0, 1], 'Prix final : 150 × 0,8 = 120 €.')
    ]
  },
  {
    id: 'c3', code: 'C3', parcours: 'calculs', niveau: 2, titre: 'Évolution, taux et points', duree: '12 min',
    court: 'Lire un taux d’engagement et une croissance sans se tromper de base.',
    objectif: 'Calculer une évolution en pourcentage, un taux, et distinguer un écart en points d’une évolution en pourcentage.',
    situation: 'Ton client te montre son bilan : « Les viewers moyens sont passés de 40 à 52, et l’engagement de 2 % à 3 %. » Tu dois dire de combien ça a progressé, en deux phrases justes.',
    cours: [
      ['Mesurer une évolution', 'Évolution (%) = (arrivée − départ) ÷ départ × 100. À la calculatrice : ( 52 − 40 ) ÷ 40 × 100 = 30. On divise toujours par la valeur de DÉPART. C’est la question qui sauve : « par rapport à quoi ? »'],
      ['Calculer un taux (une part)', 'Taux (%) = partie ÷ total × 100. 270 clics pour 9 000 impressions : 270 ÷ 9 000 × 100 = 3 %. C’est la formule du taux d’engagement, du taux de clic, du taux de réponse. La partie en premier, le total en second.'],
      ['Points ou pourcentage ?', 'Passer de 2 % à 3 % est un gain de 1 point. En évolution, c’est +50 % (1 ÷ 2). Les deux phrases sont vraies, mais « +1 % » est fausse. Dans un bilan, précise toujours « points » pour un écart entre deux taux.'],
      ['Une hausse et sa baisse inverse ne s’annulent pas', 'De 40 à 52 : +30 %. De 52 à 40 : −23,1 %, pas −30 %. Chaque calcul part d’une base différente. Même logique que +10 % puis −10 %.'],
      ['Un pourcentage sans base est un bluff', '« +300 % d’interactions » peut vouloir dire passer de 2 à 8. Demande toujours le chiffre de départ avant de t’enthousiasmer ou de t’inquiéter.']
    ],
    tableau: {
      legende: 'Une évolution et son retour ne sont jamais symétriques',
      entetes: ['De… à…', 'Évolution', 'Retour (à l’envers)'],
      lignes: [['100 → 150', '+50 %', '150 → 100 : −33,3 %'], ['40 → 52', '+30 %', '52 → 40 : −23,1 %'], ['100 → 200', '+100 %', '200 → 100 : −50 %'], ['200 → 100', '−50 %', '100 → 200 : +100 %']]
    },
    memo: 'Évolution = (arrivée − départ) ÷ départ × 100. Taux = partie ÷ total × 100. Entre deux taux : « points ».',
    defi: 'Prends deux chiffres de ton activité (abonnés, vues, interactions) à un mois d’écart et rédige l’évolution en une phrase avec la base.',
    sources: [],
    questions: [
      nb('c3q1', 'La croissance', 'Les viewers moyens passent de 40 à 52. Quelle évolution ? (en %)', 30, 0.1, '%', '(52 − 40) ÷ 40 × 100 = 30 %.'),
      nb('c3q2', 'Le retour en arrière', 'Les viewers moyens repassent de 52 à 40. Quelle évolution ? (en %, négative)', -23.1, 0.1, '%', '(40 − 52) ÷ 52 × 100 ≈ −23,1 %. La base est 52, pas 40.'),
      nb('c3q3', 'Taux de clic', '270 clics pour 9 000 impressions. Quel taux de clic ? (en %)', 3, 0.05, '%', '270 ÷ 9 000 × 100 = 3 %.'),
      ch('c3q4', 'Points ou pourcentage', 'Le taux d’engagement passe de 2 % à 3 %. Quelle phrase est exacte ?',
        ['« L’engagement a augmenté de 1 % »', '« L’engagement a gagné 1 point, soit +50 % »', '« L’engagement a augmenté de 3 % »', '« L’engagement a doublé »'],
        ['Faux : c’est confondre points et pourcentage.', 'Oui : l’écart est de 1 point, et rapporté au départ (2 %) cela fait +50 %.', 'Faux : 3 % est le taux d’arrivée, pas l’évolution.', 'Faux : doubler, c’est passer de 2 % à 4 %.'],
        1, '3 − 2 = 1 point. 1 ÷ 2 = +50 % d’évolution.'),
      nb('c3q5', 'Les abonnés', 'Tu passes de 1 200 à 1 410 abonnés. Quelle croissance ? (en %)', 17.5, 0.1, '%', '(1 410 − 1 200) ÷ 1 200 × 100 = 17,5 %.'),
      ch('c3q6', 'Le chiffre sans base', 'Un client t’annonce fièrement : « +200 % de viewers ce mois-ci ! » Que fais-tu en premier ?',
        ['Tu le félicites et tu l’écris dans le rapport.', 'Tu demandes le chiffre de départ et le chiffre d’arrivée avant de conclure.', 'Tu en déduis que le nombre de viewers a doublé.'],
        ['Sans la base, tu ne sais pas si c’est 2 viewers devenus 6 ou 500 devenus 1 500.', 'Oui : un pourcentage n’a de sens qu’avec sa base.', '+200 % signifie multiplié par 3, pas par 2, et sans la base cela ne veut rien dire.'],
        1, '+200 % = × 3. Mais passer de 2 à 6 viewers n’a pas le même poids que de 500 à 1 500.'),
      nb('c3q7', 'Les likes', 'Un post passe de 5 à 20 likes. De combien de pour cent a-t-il augmenté ? (en %)', 300, 0.5, '%', '(20 − 5) ÷ 5 × 100 = 300 %. Quadrupler, c’est +300 %.')
    ]
  },
  {
    id: 'c4', code: 'C4', parcours: 'calculs', niveau: 2, titre: 'Retrouver le point de départ', duree: '12 min',
    court: 'HT/TTC, prix avant remise, net voulu : on ne « retire » pas le pourcentage.',
    objectif: 'Remonter de l’arrivée au départ avec la division, et éviter l’erreur classique du pourcentage retiré à l’envers.',
    situation: 'Un client te règle 600 € TTC et te demande combien de TVA tu lui as facturée. Ou encore : tu veux encaisser 1 000 € nets après 22 % de prélèvements. Dans les deux cas, on te donne l’arrivée et tu cherches le départ.',
    cours: [
      ['Le piège de la marche arrière', 'Pour passer de 600 € TTC à l’HT, beaucoup retirent 20 % : 600 − 120 = 480. C’est faux. Les 20 % s’appliquaient au prix HT (500), pas au prix TTC (600). On retire un pourcentage sur la mauvaise base.'],
      ['La bonne méthode', 'Pour défaire une hausse de X %, tu divises par le coefficient : 600 ÷ 1,2 = 500. Pour défaire une baisse, tu divises aussi : 68 ÷ 0,85 = 80. Ensuite tu vérifies en refaisant le calcul normal : 500 × 1,2 = 600.'],
      ['TVA : combien dans un TTC ?', 'HT = TTC ÷ 1,2. La TVA = TTC − HT. Sur 1 560 € TTC : HT = 1 300 €, TVA = 260 €. Tu n’as pas besoin de retenir « la TVA fait 16,67 % du TTC » : la division suffit.'],
      ['Viser un montant net', 'Tu veux 1 000 € nets après 22 % de prélèvements ? Il reste 78 % : 1 000 ÷ 0,78 ≈ 1 282 €. Même mécanique que pour la remise : ce que tu gardes est une part du total.'],
      ['Le réflexe de vérification', 'Après chaque marche arrière, refais le calcul dans le sens normal. Si tu ne retrouves pas ton chiffre de départ, c’est que tu as retiré le pourcentage au lieu de diviser.']
    ],
    tableau: {
      legende: 'Marche arrière : toujours une division',
      entetes: ['Je connais…', 'Je cherche…', 'Calcul', 'Exemple'],
      lignes: [['Un prix TTC', 'Le prix HT', 'TTC ÷ 1,2', '600 ÷ 1,2 = 500'], ['Un prix remisé de 15 %', 'Le prix d’origine', 'Final ÷ 0,85', '68 ÷ 0,85 = 80'], ['Un net voulu après 22 % de prélèvements', 'Le total à encaisser', 'Net ÷ 0,78', '1 000 ÷ 0,78 ≈ 1 282'], ['Un TTC', 'Le montant de TVA', 'TTC − TTC ÷ 1,2', '1 560 − 1 300 = 260']]
    },
    memo: 'Pour remonter à l’origine : on divise par le coefficient (1,2 ; 0,85…), on ne retire pas le pourcentage.',
    defi: 'Prends une facture TTC reçue d’un fournisseur et retrouve l’HT puis la TVA avec la division.',
    sources: [],
    questions: [
      nb('c4q1', 'Du TTC au HT', 'Tu reçois 600 € TTC (TVA 20 %). Quel est le montant HT ? (en €)', 500, 0, '€', '600 ÷ 1,2 = 500 €.'),
      nb('c4q2', 'Avant la remise', 'Un abonnement coûte 68 € après une remise de 15 %. Quel était son prix d’origine ? (en €)', 80, 0, '€', '68 ÷ 0,85 = 80 €. Vérification : 80 × 0,85 = 68.'),
      ch('c4q3', 'Pourquoi pas 20 % de moins ?', 'Pourquoi ne retrouve-t-on pas le prix HT en retirant 20 % du prix TTC ?',
        ['Parce que la TVA change selon les mois.', 'Parce que les 20 % s’appliquaient au prix HT, pas au prix TTC.', 'Parce que la calculatrice arrondit.', 'En réalité, on retrouve bien le prix HT.'],
        ['Faux : le taux normal est stable, le problème est la base du calcul.', 'Oui : 20 % de 500 = 100, mais 20 % de 600 = 120. Les bases ne sont pas les mêmes.', 'Faux : l’erreur est de méthode, pas d’arrondi.', 'Faux : 600 − 20 % = 480, pas 500.'],
        1, 'La hausse s’est faite sur l’HT. La marche arrière se fait par la division par 1,2.'),
      nb('c4q4', 'Viser un net', 'Tu veux garder 1 000 € nets après 22 % de prélèvements. Combien faut-il encaisser, à l’euro près ? (en €)', 1282.05, 1, '€', '1 000 ÷ 0,78 ≈ 1 282 €. Il reste 78 % de ce que tu encaisses.'),
      nb('c4q5', 'La commission', 'Un streamer reçoit 340 € après une commission de 15 % prélevée par une plateforme. Quel était le montant brut ? (en €)', 400, 0, '€', '340 ÷ 0,85 = 400 €. Vérification : 400 × 0,85 = 340.'),
      nb('c4q6', 'La part de TVA', 'Une facture est de 1 560 € TTC (TVA 20 %). Quel est le montant de la TVA ? (en €)', 260, 0, '€', 'HT = 1 560 ÷ 1,2 = 1 300 €. TVA = 1 560 − 1 300 = 260 €.'),
      mu('c4q7', 'Les bons réflexes', 'Quelles affirmations sont justes ? (2 réponses)',
        ['Pour retrouver l’HT, on divise le TTC par 1,2.', 'Pour retrouver l’HT, on retire 20 % du TTC.', 'Après une marche arrière, on vérifie en refaisant le calcul dans le sens normal.', 'Une baisse de 20 % puis une hausse de 20 % ramène toujours au départ.'],
        ['Oui : 1,2 est le coefficient de la TVA à 20 %.', 'Non : c’est l’erreur classique, la base est mauvaise.', 'Oui : si tu ne retrouves pas le chiffre de départ, tu t’es trompé.', 'Non : 100 → 80 → 96, pas 100.'],
        [0, 2], 'Diviser par le coefficient, puis vérifier : ce sont les deux réflexes à garder.')
    ]
  }
  ];
  C.lecons.push(...NOUVELLES);
  C.melanger(NOUVELLES);
}(typeof globalThis !== 'undefined' ? globalThis : this));
