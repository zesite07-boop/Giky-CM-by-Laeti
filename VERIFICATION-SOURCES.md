# Vérification des cotisations et de la fiscalité freelance

Vérification faite le 3 novembre 2026 sur les sources officielles. Ces chiffres sont des repères pédagogiques : vérifier le taux en vigueur sur la source officielle liée avant de les appliquer. Ils sont centralisés dans `sources.js` (objet `reperes`), utilisé à la fois par les leçons et par les simulateurs.

## Repères retenus pour le module

| Repère | Valeur 2026 | Source officielle |
|---|---|---|
| Cotisations micro, libéral non réglementé (BNC, hors Cipav) | 25,6 % du CA encaissé (27,8 % avec versement libératoire) | [Service-Public F37353](https://entreprendre.service-public.gouv.fr/vosdroits/F37353), [F36232](https://entreprendre.service-public.gouv.fr/vosdroits/F36232) |
| Cotisations micro, prestations de services BIC | 21,2 % (22,9 % avec versement libératoire) | [Service-Public F37353](https://entreprendre.service-public.gouv.fr/vosdroits/F37353) |
| Formation professionnelle (CFP) | 0,2 % libéral, 0,1 % commercial, 0,3 % artisanal | [Service-Public F23459](https://entreprendre.service-public.gouv.fr/vosdroits/F23459) |
| Acre | Plus automatique depuis le 1er janvier 2026 ; exonération ramenée à 25 % pour les débuts d'activité depuis le 1er juillet 2026 (taux BNC 19,2 %) ; demande sous 60 jours | [Service-Public F11677](https://entreprendre.service-public.gouv.fr/vosdroits/F11677), [actualité A18795](https://entreprendre.service-public.gouv.fr/actualites/A18795) |
| Plafond micro 2026-2028 | 83 600 € (services, libéral), 203 100 € (vente) ; sortie après 2 années consécutives | [Service-Public A18813](https://entreprendre.service-public.gouv.fr/actualites/A18813), [impots.gouv.fr](https://www.impots.gouv.fr/professionnel/questions/pour-rester-micro-entrepreneur-quel-montant-de-chiffre-daffaires-ou-de) |
| Abattement forfaitaire | 34 % BNC, 50 % BIC services, 71 % vente (minimum 305 €) | [Service-Public F36244](https://entreprendre.service-public.gouv.fr/vosdroits/F36244) |
| Versement libératoire | 2,2 % BNC, 1,7 % BIC services, 1 % vente ; RFR 2024 ≤ 29 315 € par part pour 2026 ; option avant le 30 septembre pour l'année suivante | [impots.gouv.fr](https://www.impots.gouv.fr/professionnel/questions/en-tant-que-micro-entrepreneur-sous-quelles-conditions-puis-je-opter-pour-l), [Service-Public F23267](https://entreprendre.service-public.gouv.fr/vosdroits/F23267) |
| Franchise en base de TVA (services) | 37 500 € (CA N-1), seuil majoré 41 250 € (TVA dès le jour du dépassement) ; réforme à 25 000 € abandonnée | [Service-Public F21746](https://entreprendre.service-public.gouv.fr/vosdroits/F21746), [impots.gouv.fr](https://www.impots.gouv.fr/professionnel/les-regimes-dimposition-la-tva) |
| CFE | Exonérée l'année de création, base −50 % l'année suivante, pas de cotisation minimum si CA N-2 ≤ 5 000 € | [Service-Public F23999](https://entreprendre.service-public.gouv.fr/vosdroits/F23999) |
| Factures | Mentions obligatoires, indemnité forfaitaire 40 €, paiement à 30 jours par défaut | [Service-Public F31808](https://entreprendre.service-public.gouv.fr/vosdroits/F31808), [F23211](https://entreprendre.service-public.gouv.fr/vosdroits/F23211) |
| Facture électronique | Réception obligatoire depuis le 1er septembre 2026 ; émission et e-reporting pour micro/TPE/PME au 1er septembre 2027, même en franchise de TVA | [impots.gouv.fr](https://www.impots.gouv.fr/professionnel/je-decouvre-la-facturation-electronique) |
| Influence commerciale | Mention « Publicité » ou « Collaboration commerciale » ; contrat écrit obligatoire au-delà de 1 000 € HT | [economie.gouv.fr](https://www.economie.gouv.fr/influenceurs-quels-sont-mes-devoirs), [Service-Public A18674](https://entreprendre.service-public.gouv.fr/actualites/A18674) |
| Chiffre d'affaires à déclarer | Montant encaissé HT, sans déduire frais ni commissions ; déclarer même 0 € | [Service-Public F23257](https://entreprendre.service-public.gouv.fr/vosdroits/F23257) |
| Facture en devise étrangère | Possible en dollars ou en livres ; la facture indique aussi la contre-valeur en euros et le taux de change appliqué | [economie.gouv.fr](https://www.economie.gouv.fr/entreprises/gerer-son-entreprise-au-quotidien/gerer-sa-comptabilite-et-ses-demarches/comment-facturer-dans-une-monnaie-etrangere), [mentions obligatoires](https://www.economie.gouv.fr/entreprises/gerer-son-entreprise-au-quotidien/gerer-sa-comptabilite-et-ses-demarches/mentions-obligatoires-dune-facture-tout-savoir) |
| TVA sur une facture en devise | Toujours exprimée en euros | [BOFiP BOI-TVA-DECLA-30-20-20-10](https://bofip.impots.gouv.fr/bofip/140-PGP.html/identifiant=BOI-TVA-DECLA-30-20-20-10-20121231) |
| Client professionnel UE / hors UE | « Autoliquidation » et numéros de TVA des deux parties (UE, avec DES) ; « TVA non applicable – art. 259-1 du CGI » (hors UE) | [impots.gouv.fr, prestations entre assujettis](https://www.impots.gouv.fr/professionnel/prestations-entre-assujettis) |
| Franchise en base | Mention « TVA non applicable, art. 293 B du CGI » | [Service-Public F31808](https://entreprendre.service-public.gouv.fr/vosdroits/F31808) |
| Taux de change de référence | 2 novembre 2026 : 1 € = 1,1216 USD et 0,8358 GBP (modifiables dans la boîte à outils) | [BCE](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.fr.html) |
| Simulateur officiel | Pour un calcul exact des cotisations | [Urssaf, mon-entreprise](https://mon-entreprise.urssaf.fr/simulateurs/auto-entrepreneur) |

## Écarts trouvés

1. Le tutoriel indiquait « souvent 20-25 % du CA en micro pour les services ». C'est dépassé pour le libéral BNC : le taux est de 25,6 % depuis le 1er janvier 2026 (24,6 % en 2025), voir [Service-Public A18823](https://entreprendre.service-public.gouv.fr/actualites/A18823). Le tutoriel est corrigé.
2. Une page Bpifrance Création mentionne encore un taux BNC prévu à 26,1 % : c'est une ancienne trajectoire, non retenue ; la source de référence est Service-Public.
3. Plafond de RFR pour le versement libératoire : impots.gouv.fr donne 29 315 € par part pour 2026 ; Service-Public affiche 29 579 €, probablement le seuil applicable à l'option suivante. Le module retient 29 315 € pour 2026 et invite à vérifier.
4. La catégorie du community management (BNC libéral ou BIC) dépend de l'immatriculation : le module enseigne BNC par défaut et demande de vérifier l'attestation.
5. La boîte à outils affiche un « taux global » qui inclut la formation professionnelle (25,6 + 0,2 + 2,2 = 28 % en BNC avec versement libératoire) ; le tableau ci-dessus donne 27,8 % hors formation professionnelle.
