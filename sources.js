/* Sources officielles du module CM freelance.
   Chiffres vérifiés le 3 novembre 2026 sur les pages citées.
   Avant toute application réelle : rouvrir la source et vérifier le taux en vigueur. */
(function (root, factory) {
  'use strict';
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.CMSources = data;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const verifie = '3 novembre 2026';
  const sources = {
    microSocial: { nom: 'Service-Public Entreprendre : régime micro-social (taux 2026)', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F37353' },
    cotisMicro: { nom: 'Service-Public Entreprendre : cotisations sociales du micro-entrepreneur', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F36232' },
    fiscMicro: { nom: 'Service-Public Entreprendre : fiscalité du micro-entrepreneur (abattement, VFL, CFE)', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F36244' },
    seuilsMicro: { nom: 'Service-Public Entreprendre : nouveaux seuils 2026-2028 de la micro-entreprise', url: 'https://entreprendre.service-public.gouv.fr/actualites/A18813' },
    statut: { nom: 'Urssaf : choisir son statut juridique', url: 'https://www.urssaf.fr/accueil/choisir-statut-juridique.html' },
    tvaFranchise: { nom: 'Service-Public Entreprendre : franchise en base de TVA', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F21746' },
    tvaImpots: { nom: 'impots.gouv.fr : les régimes d’imposition à la TVA', url: 'https://www.impots.gouv.fr/professionnel/les-regimes-dimposition-la-tva' },
    vfl: { nom: 'impots.gouv.fr : conditions du versement libératoire', url: 'https://www.impots.gouv.fr/professionnel/questions/en-tant-que-micro-entrepreneur-sous-quelles-conditions-puis-je-opter-pour-l' },
    acre: { nom: 'Service-Public Entreprendre : l’Acre', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F11677' },
    acreActu: { nom: 'Service-Public Entreprendre : Acre, exonération ramenée à 25 % (juillet 2026)', url: 'https://entreprendre.service-public.gouv.fr/actualites/A18795' },
    cfp: { nom: 'Service-Public Entreprendre : contribution à la formation professionnelle', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F23459' },
    cfe: { nom: 'Service-Public Entreprendre : CFE du micro-entrepreneur', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F23999' },
    factures: { nom: 'Service-Public Entreprendre : mentions obligatoires d’une facture', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F31808' },
    delais: { nom: 'Service-Public Entreprendre : délais de paiement et pénalités de retard', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F23211' },
    efacture: { nom: 'impots.gouv.fr : je découvre la facturation électronique', url: 'https://www.impots.gouv.fr/professionnel/je-decouvre-la-facturation-electronique' },
    cession: { nom: 'Service-Public Entreprendre : contrat de cession de droits d’auteur', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F22667' },
    inpiAuteur: { nom: 'INPI : le droit d’auteur et ses exceptions', url: 'https://www.inpi.fr/ressources/propriete-intellectuelle/droit-dauteur' },
    image: { nom: 'Service-Public : droit à l’image et respect de la vie privée', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F32103' },
    cnilImage: { nom: 'CNIL : le droit à l’image s’applique-t-il sur internet ?', url: 'https://www.cnil.fr/fr/cnil-direct/question/le-droit-limage-sapplique-t-il-sur-internet' },
    influence: { nom: 'economie.gouv.fr : influenceurs, quels sont mes devoirs ?', url: 'https://www.economie.gouv.fr/influenceurs-quels-sont-mes-devoirs' },
    influenceContrat: { nom: 'Service-Public Entreprendre : contrats marques-influenceurs (seuil 1 000 € HT)', url: 'https://entreprendre.service-public.gouv.fr/actualites/A18674' },
    twitchCG: { nom: 'Twitch : Community Guidelines', url: 'https://safety.twitch.tv/s/article/Community-Guidelines' },
    twitchAttaques: { nom: 'Twitch : combattre les attaques ciblées (hate raids)', url: 'https://safety.twitch.tv/s/article/Combating-Targeted-Attacks?language=en_US' },
    twitchModeration: { nom: 'Twitch : gérer le harcèlement (warn, timeout, ban, signalement)', url: 'https://safety.twitch.tv/s/article/Managing-Harassment?language=en_US' },
    metaSuite: { nom: 'Meta Business Help Center : comment fonctionne Meta Business Suite', url: 'https://www.facebook.com/business/help/205614130852988' },
    metaProgrammer: { nom: 'Meta Business Help Center : créer et programmer des posts sur l’appli mobile', url: 'https://www.facebook.com/business/help/609176706604372' },
    metaCalendrier: { nom: 'Meta Business Help Center : bonnes pratiques du calendrier', url: 'https://www.facebook.com/business/help/1170295510042639' },
    metaRoles: { nom: 'Meta Business Help Center : paramètres du compte, personnes et rôles', url: 'https://www.facebook.com/business/help/1312088372467053' },
    waOnboarding: { nom: 'WhatsApp Business : bien démarrer avec l’appli (profil, messages, réponses rapides, étiquettes)', url: 'https://whatsappbusiness.com/resources/resource-library/onboarding-success-whatsapp-business-app/' },
    waFirst: { nom: 'WhatsApp Business : une première impression professionnelle', url: 'https://whatsappbusiness.com/resources/resource-library/strong-first-impression-whatsapp-business-app/' },
    waFaq: { nom: 'WhatsApp Business : appli gratuite ou Business Platform (FAQ)', url: 'https://whatsappbusiness.com/resources/faq/' },
    waLists: { nom: 'WhatsApp Business : listes et réponses rapides', url: 'https://whatsappbusiness.com/resources/resource-library/staying-organized-smb-using-lists-quick-replies/' },
    liPage: { nom: 'LinkedIn Aide : créer une Page LinkedIn (gratuit)', url: 'https://www.linkedin.com/help/linkedin/answer/a543852' },
    liTypes: { nom: 'LinkedIn Aide : types de Pages et leurs fonctions', url: 'https://www.linkedin.com/help/linkedin/answer/a727893' },
    liCreateur: { nom: 'LinkedIn Aide : gérer le mode créateur', url: 'https://www.linkedin.com/help/linkedin/answer/a524035' },
    twitchClips: { nom: 'Twitch Aide : créer, modifier et partager des clips', url: 'https://help.twitch.tv/s/article/how-to-use-clips' },
    twitchDual: { nom: 'Twitch Aide : streaming en double format (vertical)', url: 'https://help.twitch.tv/s/article/dual-format-vertical-video' },
    twitchDevClips: { nom: 'Twitch pour les développeurs : les clips', url: 'https://dev.twitch.tv/docs/api/clips/' },
    pharos: { nom: 'Service-Public : signaler un contenu illicite (Pharos)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/R17674' },
    cyberharcelement: { nom: 'Service-Public : cyberharcèlement', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F32239' },
    declarerCA: { nom: 'Service-Public Entreprendre : quand et comment déclarer son chiffre d’affaires (même à 0 €)', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F23257' },
    devises: { nom: 'economie.gouv.fr : comment facturer dans une monnaie étrangère ?', url: 'https://www.economie.gouv.fr/entreprises/gerer-son-entreprise-au-quotidien/gerer-sa-comptabilite-et-ses-demarches/comment-facturer-dans-une-monnaie-etrangere' },
    mentionsEco: { nom: 'economie.gouv.fr : mentions obligatoires d’une facture (devises, langue)', url: 'https://www.economie.gouv.fr/entreprises/gerer-son-entreprise-au-quotidien/gerer-sa-comptabilite-et-ses-demarches/mentions-obligatoires-dune-facture-tout-savoir' },
    bofipDevises: { nom: 'BOFiP : facturation dans une monnaie autre que l’euro (TVA en euros)', url: 'https://bofip.impots.gouv.fr/bofip/140-PGP.html/identifiant=BOI-TVA-DECLA-30-20-20-10-20121231' },
    assujettis: { nom: 'impots.gouv.fr : prestations entre assujettis (Autoliquidation, art. 259-1 du CGI)', url: 'https://www.impots.gouv.fr/professionnel/prestations-entre-assujettis' },
    bce: { nom: 'Banque centrale européenne : taux de change de référence de l’euro', url: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.fr.html' },
    simulateurUrssaf: { nom: 'Urssaf : simulateur officiel auto-entrepreneur (mon-entreprise)', url: 'https://mon-entreprise.urssaf.fr/simulateurs/auto-entrepreneur' },
    loiInfluence: { nom: 'Légifrance : loi du 9 juin 2023 sur l’influence commerciale', url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000047663185' },
    arppCM: { nom: 'ARPP : certificat Animateurs de communautés responsables', url: 'https://www.arpp.org/influence-responsable/certificat-animateurs-de-communautes-responsables/' },
    twitchAutomod: { nom: 'Twitch : utiliser AutoMod', url: 'https://help.twitch.tv/s/article/how-to-use-automod' }
  };
  /* Repères chiffrés : une seule source de vérité pour le cours ET les simulateurs. */
  const reperes = {
    annee: 2026,
    tauxBNC: 25.6,          // libéral non réglementé, hors Cipav (F37353)
    tauxBIC: 21.2,          // prestations de services BIC (F37353)
    tauxAcreBNC: 19.2,      // Acre, débuts d'activité depuis le 1er juillet 2026 (Bpifrance / F11677)
    vflBNC: 2.2,            // versement libératoire BNC (F36244)
    vflBIC: 1.7,
    cfpLiberal: 0.2,        // CFP micro-entrepreneur, activité libérale (F23459)
    cfpCommercial: 0.1,
    abattementBNC: 34,      // micro-BNC (F36244)
    abattementBIC: 50,
    plafondServices: 83600, // seuil micro 2026-2028 (A18813)
    tvaBase: 37500,         // franchise TVA services, N-1 (F21746)
    tvaMajore: 41250,       // seuil majoré, bascule au jour du dépassement (F21746)
    rfrVfl: 29315,          // RFR 2024 par part, option VFL pour 2026 (impots.gouv.fr)
    indemniteRetard: 40,    // indemnité forfaitaire de recouvrement (F23211)
    cfeSeuil: 5000,         // exonération de cotisation minimum de CFE (F23999)
    efactureReception: '1er septembre 2026',
    efactureEmission: '1er septembre 2027',
    contratInfluence: 1000, // contrat écrit obligatoire au-delà de 1 000 € HT (A18674)
    /* Taux de référence BCE du 2 novembre 2026 (1 € = x devise). Modifiables dans la boîte à outils. */
    change: { date: '2026-11-02', USD: 1.1216, GBP: 0.8358, source: 'BCE' },
    tvaNormal: 20
  };
  return { verifie, sources, reperes };
}));
