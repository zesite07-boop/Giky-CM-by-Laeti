/* Parcours 3 — Piloter mon business (B1 à B6).
   Tous les chiffres sont des repères pédagogiques vérifiés le 3 novembre 2026 :
   vérifier le taux en vigueur sur la source officielle liée avant de l'appliquer. */
(function (root) {
  'use strict';
  const C = root.CMContenu = root.CMContenu || { lecons: [] };
  C.lecons.push(
{
  id: 'b1', code: 'B1', parcours: 'business', titre: 'Ton statut : micro-entreprise et alternatives', duree: '12 min',
  court: 'Ce que la micro-entreprise permet, et quand elle devient trop petite.',
  objectif: 'Expliquer ton régime et repérer les seuils qui le changent.',
  situation: 'Tu es en micro-entreprise depuis 2 ans. Un client te propose une grosse mission. Tu te demandes si ton statut tient.',
  cours: [
    ['Le principe', 'En micro-entreprise, tu paies tes cotisations sur le chiffre d’affaires encaissé, déclaré chaque mois ou chaque trimestre. Pas de chiffre d’affaires, pas de cotisations.'],
    ['Le plafond', 'Pour les prestations de services et les activités libérales, le plafond 2026-2028 est de 83 600 € de chiffre d’affaires annuel. Tu sors du régime si tu le dépasses deux années civiles de suite.'],
    ['Ta catégorie', 'Le community management est en général une activité libérale non réglementée (BNC). Vérifie la catégorie indiquée sur ton attestation d’immatriculation : elle fixe ton taux.'],
    ['Les alternatives', 'Entreprise individuelle au réel, EURL, SASU : utiles quand les frais sont élevés ou le chiffre d’affaires important. À étudier avec un expert-comptable avant de changer.']
  ],
  memo: 'Micro = cotisations sur l’encaissé. Plafond services 83 600 €. Ta catégorie (BNC ou BIC) fixe ton taux. Repère pédagogique : vérifier sur la source officielle.',
  defi: 'Retrouve ta catégorie (BNC ou BIC) sur ton attestation et note-la dans le carnet.',
  sources: ['seuilsMicro', 'microSocial', 'statut'],
  questions: [
    { id: 'b1q1', type: 'choix', titre: 'Base de calcul', texte: 'Sur quoi sont calculées tes cotisations en micro-entreprise ?',
      options: ['Sur ce que tu as facturé.', 'Sur le chiffre d’affaires effectivement encaissé.', 'Sur ton bénéfice.'],
      retours: ['Une facture impayée n’est pas encore du chiffre d’affaires déclarable.', 'Tu déclares ce qui est arrivé sur ton compte.', 'C’est le cas au réel, pas en micro.'],
      bonne: 1, explication: 'Les cotisations micro portent sur l’encaissé.' },
    { id: 'b1q2', type: 'nombre', titre: 'Plafond', texte: 'Quel est le plafond annuel de chiffre d’affaires pour les prestations de services (2026-2028) ? (en €)',
      bonne: 83600, tolerance: 0, unite: '€', explication: '83 600 € pour les services et activités libérales (repère 2026-2028).' },
    { id: 'b1q3', type: 'choix', titre: 'Dépassement', texte: 'Tu dépasses 83 600 € une seule année. Que se passe-t-il ?',
      options: ['Tu sors immédiatement du régime.', 'Tu restes en micro ; tu en sors si le dépassement se répète l’année suivante.', 'Rien, jamais.'],
      retours: ['Non, il faut deux années consécutives.', 'C’est la règle des deux années civiles.', 'Il y a bien une conséquence.'],
      bonne: 1, explication: 'Sortie après deux années civiles consécutives de dépassement.' }
  ]
},
{
  id: 'b2', code: 'B2', parcours: 'business', titre: 'Cotisations sociales : les taux 2026', duree: '12 min',
  court: 'Ce que l’Urssaf prend sur chaque euro encaissé.',
  objectif: 'Calculer tes cotisations à partir de ton chiffre d’affaires.',
  situation: 'Tu as encaissé 3 000 € ce mois-ci. Tu veux savoir combien mettre de côté.',
  cours: [
    ['Les taux 2026', 'Activité libérale non réglementée (BNC, hors Cipav) : 25,6 % du chiffre d’affaires depuis le 1er janvier 2026. Prestations de services BIC : 21,2 %.'],
    ['La formation professionnelle', 'S’ajoute la contribution à la formation professionnelle : 0,2 % pour une activité libérale, 0,1 % pour une activité commerciale.'],
    ['L’Acre', 'L’aide à la création n’est plus automatique depuis 2026 et l’exonération est passée à 25 % pour les débuts d’activité depuis le 1er juillet 2026. Elle concerne les créateurs, pas toi après 2 ans.']
  ],
  memo: 'BNC : 25,6 % + 0,2 % CFP. BIC services : 21,2 % + 0,1 %. Repère pédagogique : vérifier le taux en vigueur sur la source officielle liée.',
  defi: 'Calcule tes cotisations du mois dernier avec ton vrai chiffre d’affaires.',
  sources: ['microSocial', 'cotisMicro', 'cfp', 'acre', 'acreActu'],
  questions: [
    { id: 'b2q1', type: 'nombre', titre: 'Cotisations BNC', texte: 'Tu encaisses 3 000 € en BNC à 25,6 %. Combien de cotisations sociales ? (en €)',
      bonne: 768, tolerance: 1, unite: '€', explication: '3 000 × 25,6 % = 768 €.' },
    { id: 'b2q2', type: 'nombre', titre: 'Avec la CFP', texte: 'Même chiffre d’affaires, en ajoutant la CFP libérale de 0,2 %. Total ? (en €)',
      bonne: 774, tolerance: 1, unite: '€', explication: '768 + (3 000 × 0,2 % = 6) = 774 €.' },
    { id: 'b2q3', type: 'choix', critique: true, titre: 'Source', texte: 'Un article de blog de 2024 annonce un taux de 21,1 % pour ton activité. Que fais-tu ?',
      options: ['Tu l’utilises, il est bien classé dans Google.', 'Tu vérifies sur service-public ou l’Urssaf : le taux a changé en 2026.', 'Tu prends la moyenne entre le blog et ta mémoire.'],
      retours: ['Un vieux taux fausse tout ton budget.', 'Source officielle, date vérifiée.', 'Une moyenne de chiffres faux reste fausse.'],
      bonne: 1, explication: 'Erreur critique : appliquer un taux non vérifié sur une source officielle.' }
  ]
},
{
  id: 'b3', code: 'B3', parcours: 'business', titre: 'Impôt et TVA', duree: '12 min',
  court: 'Abattement, versement libératoire, franchise de TVA.',
  objectif: 'Savoir quand la TVA s’applique et comment ton revenu est imposé.',
  situation: 'Ton chiffre d’affaires grimpe. Un client te demande si tu factures la TVA.',
  cours: [
    ['L’impôt sur le revenu', 'Sans option, ton chiffre d’affaires est déclaré et l’administration applique un abattement forfaitaire : 34 % en BNC, 50 % en BIC services. Le reste s’ajoute à tes autres revenus.'],
    ['Le versement libératoire', 'Option possible si ton revenu fiscal de référence le permet : tu paies l’impôt en même temps que les cotisations, 2,2 % du chiffre d’affaires en BNC, 1,7 % en BIC services. À demander avant le 30 septembre pour l’année suivante.'],
    ['La franchise de TVA', 'En 2026, pour les services : pas de TVA tant que ton chiffre d’affaires de l’année précédente est sous 37 500 €. Si tu dépasses 41 250 € en cours d’année, la TVA s’applique dès le jour du dépassement. Sur tes factures : « TVA non applicable, art. 293 B du CGI ».']
  ],
  memo: 'Franchise TVA services : 37 500 € (seuil majoré 41 250 €). Abattement BNC 34 %. VFL BNC 2,2 %. Repère pédagogique : vérifier sur la source officielle.',
  defi: 'Vérifie sur impots.gouv.fr si ton revenu fiscal de référence permet le versement libératoire.',
  sources: ['fiscMicro', 'vfl', 'tvaFranchise', 'tvaImpots'],
  questions: [
    { id: 'b3q1', type: 'nombre', titre: 'Abattement', texte: 'Chiffre d’affaires BNC annuel : 30 000 €, abattement 34 %. Quel montant est ajouté à ton revenu imposable ? (en €)',
      bonne: 19800, tolerance: 1, unite: '€', explication: '30 000 × (1 − 34 %) = 19 800 €.' },
    { id: 'b3q2', type: 'choix', critique: true, titre: 'Seuil majoré', texte: 'En septembre, ton chiffre d’affaires de l’année atteint 42 000 €. Que fais-tu ?',
      options: ['Rien jusqu’au 1er janvier.', 'Tu factures la TVA dès le dépassement de 41 250 € et tu te rapproches de ton service des impôts.', 'Tu arrêtes de facturer jusqu’à la fin de l’année.'],
      retours: ['Au-delà du seuil majoré, la franchise cesse tout de suite.', 'C’est la règle 2026.', 'Tu perds des revenus sans régler le problème.'],
      bonne: 1, explication: 'Erreur critique : continuer à facturer sans TVA après le seuil majoré.' },
    { id: 'b3q3', type: 'choix', titre: 'La mention', texte: 'Quelle mention portes-tu sur tes factures en franchise ?',
      options: ['« Sans TVA »', '« TVA non applicable, art. 293 B du CGI »', 'Aucune'],
      retours: ['Trop vague.', 'Mention prévue par les textes.', 'La mention est obligatoire.'],
      bonne: 1, explication: 'La mention exacte est requise.' }
  ]
},
{
  id: 'b4', code: 'B4', parcours: 'business', titre: 'Fixer ton prix', duree: '12 min',
  court: 'Du revenu voulu au tarif journalier, sans te sous-payer.',
  objectif: 'Calculer un tarif journalier qui couvre cotisations, frais et jours non facturés.',
  situation: 'Tu factures 250 € par jour. Tu as l’impression de travailler beaucoup pour peu.',
  cours: [
    ['Les jours facturables', 'Sur une année, retire congés, jours de prospection, d’administratif et de formation. Beaucoup de freelances ne facturent que 3 jours sur 5.'],
    ['Le calcul à l’envers', 'Revenu net voulu + frais annuels, divisé par (1 − taux de cotisations), divisé par les jours facturables. Le simulateur le fait pour toi.'],
    ['Forfaits', 'Pour un streamer, un forfait mensuel (périmètre écrit) est plus lisible qu’un tarif à la journée. Garde le tarif journalier comme référence interne.']
  ],
  memo: 'Prix = (net voulu + frais) / (1 − taux) / jours facturables. Repère pédagogique : vérifier le taux en vigueur.',
  defi: 'Passe ton tarif actuel dans le simulateur et note l’écart avec ton objectif.',
  sources: ['microSocial'],
  questions: [
    { id: 'b4q1', type: 'nombre', titre: 'Jours facturables', texte: '45 semaines travaillées, 3 jours facturés par semaine. Combien de jours facturables par an ?',
      bonne: 135, tolerance: 0, unite: 'jours', explication: '45 × 3 = 135 jours.' },
    { id: 'b4q2', type: 'nombre', titre: 'Chiffre d’affaires annuel', texte: '135 jours à 250 €. Quel chiffre d’affaires ? (en €)',
      bonne: 33750, tolerance: 0, unite: '€', explication: '135 × 250 = 33 750 €.' },
    { id: 'b4q3', type: 'choix', titre: 'Le forfait', texte: 'Un streamer veut un prix. Que lui présentes-tu ?',
      options: ['Ton tarif journalier, sans détail.', 'Un forfait mensuel avec un périmètre écrit, et des options chiffrées.', 'Un prix à l’heure, à décompter.'],
      retours: ['Difficile à comprendre pour lui.', 'Lisible et sans surprise.', 'Le décompte crée de la méfiance.'],
      bonne: 1, explication: 'Le forfait cadré rassure et protège ton temps.' }
  ]
},
{
  id: 'b5', code: 'B5', parcours: 'business', titre: 'Factures, délais et retards', duree: '10 min',
  court: 'Une facture complète, c’est une facture payée plus vite.',
  objectif: 'Émettre des factures conformes et relancer sans gêne.',
  situation: 'Un client te doit 900 € depuis 45 jours. Ta facture n’indique ni date d’échéance ni pénalités.',
  cours: [
    ['Les mentions', 'Numéro unique et chronologique, date, ton nom suivi de « EI », SIREN, client, désignation, prix, mention de TVA, date d’échéance, pénalités de retard, et pour un client professionnel l’indemnité forfaitaire de 40 € pour frais de recouvrement.'],
    ['Les délais', 'Sans accord écrit, le paiement est dû 30 jours après l’exécution de la prestation. Écris l’échéance sur chaque facture.'],
    ['La facture électronique', 'Depuis le 1er septembre 2026, toutes les entreprises doivent pouvoir recevoir des factures électroniques. L’émission devient obligatoire pour les micro-entreprises au 1er septembre 2027, via une plateforme agréée, même en franchise de TVA.']
  ],
  memo: 'Échéance + pénalités + 40 € sur chaque facture pro. E-facture : émission obligatoire au 1er septembre 2027. Repère pédagogique : vérifier sur la source officielle.',
  defi: 'Vérifie ton modèle de facture avec la liste des mentions et corrige-le.',
  sources: ['factures', 'delais', 'efacture'],
  questions: [
    { id: 'b5q1', type: 'multiple', titre: 'Mentions', texte: 'Quelles mentions sont obligatoires ? (3 réponses)',
      options: ['Numéro unique et chronologique', 'Ton SIREN', 'Ta photo', 'La date d’échéance', 'Le nombre de followers du client'],
      retours: ['Oui.', 'Oui.', 'Non.', 'Oui.', 'Non.'],
      bonne: [0, 1, 3], explication: 'Numéro, SIREN, échéance font partie des mentions obligatoires.' },
    { id: 'b5q2', type: 'nombre', titre: 'Indemnité', texte: 'Quel est le montant de l’indemnité forfaitaire pour frais de recouvrement entre professionnels ? (en €)',
      bonne: 40, tolerance: 0, unite: '€', explication: '40 €, en plus des pénalités de retard.' },
    { id: 'b5q3', type: 'choix', titre: 'Relance', texte: 'Le client a 15 jours de retard. Première relance ?',
      options: ['Un message sec avec menace d’avocat.', 'Un rappel courtois avec la facture, l’échéance et la nouvelle date attendue.', 'Rien, il paiera.'],
      retours: ['Trop tôt pour durcir.', 'Factuel, daté, poli.', 'Le retard s’installe.'],
      bonne: 1, explication: 'Relance graduée : courtoise, puis ferme, puis mise en demeure.' }
  ]
},
{
  id: 'b6', code: 'B6', parcours: 'business', titre: 'Trésorerie, CFE et contrats', duree: '10 min',
  court: 'Mettre de côté, prévoir les échéances, signer avant de commencer.',
  objectif: 'Construire une réserve et sécuriser tes missions par écrit.',
  situation: 'Tes revenus varient de 800 € à 4 000 € par mois. En décembre, l’avis de CFE arrive.',
  cours: [
    ['La provision', 'À chaque encaissement, mets de côté tes cotisations (et ton impôt si tu as le versement libératoire) sur un compte séparé. Vise une réserve de 3 mois de dépenses.'],
    ['La CFE', 'Cotisation foncière des entreprises : exonérée l’année de création, réduite de moitié l’année suivante. Pas de cotisation minimum si ton chiffre d’affaires de l’avant-dernière année est inférieur à 5 000 €. Sinon, le montant dépend de ta commune.'],
    ['Le contrat', 'Devis signé ou contrat avant de commencer : périmètre, prix, échéances, cession des droits sur les contenus créés (supports, durée, territoire), durée et résiliation.']
  ],
  memo: 'Provision à chaque encaissement. CFE à prévoir chaque fin d’année. Rien ne démarre sans devis signé. Repère pédagogique : vérifier sur la source officielle.',
  defi: 'Ouvre (ou vérifie) un compte dédié aux provisions et fixe ton pourcentage.',
  sources: ['cfe', 'cession', 'microSocial'],
  questions: [
    { id: 'b6q1', type: 'nombre', titre: 'Provision', texte: 'Tu encaisses 2 500 € et tu provisionnes 28 %. Combien mets-tu de côté ? (en €)',
      bonne: 700, tolerance: 0, unite: '€', explication: '2 500 × 28 % = 700 €.' },
    { id: 'b6q2', type: 'choix', critique: true, titre: 'Sans devis', texte: 'Un client pressé veut que tu commences demain, « on verra le prix après ».',
      options: ['Tu commences, ça fait un client.', 'Tu envoies un devis court aujourd’hui et tu commences dès qu’il est signé.', 'Tu commences et tu factures ce que tu veux.'],
      retours: ['Sans prix écrit, tu n’as rien à réclamer.', 'Rapide et protégé.', 'Le litige est garanti.'],
      bonne: 1, explication: 'Erreur critique : travailler sans accord écrit sur le prix.' },
    { id: 'b6q3', type: 'choix', titre: 'Droits', texte: 'Tu crées des visuels pour un client. Qui détient les droits ?',
      options: ['Le client, automatiquement.', 'Toi, sauf cession écrite précisant supports, durée et territoire.', 'Personne.'],
      retours: ['Il faut une cession écrite.', 'La cession doit être écrite et détaillée.', 'L’auteur a des droits dès la création.'],
      bonne: 1, explication: 'La cession de droits d’auteur se fait par écrit et se négocie.' }
  ]
}
  );
}(typeof globalThis !== 'undefined' ? globalThis : this));
