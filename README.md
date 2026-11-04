# JTIpilot · Module Community manager freelance

Module d'autoformation pour une community manager freelance spécialisée Twitch et jeux vidéo, construit à partir du gabarit JTIpilot (parcours responsable d'agence).

## Contenu (version 3.0)

- 4 parcours, 29 leçons, 151 questions avec une explication pour chaque option :
  - Apprendre le métier (T1 à T8)
  - S'entraîner sur des missions (M1 à M6)
  - Piloter mon business (B1 à B9, dont B7 « Clients à l'étranger : dollars et livres sterling », B8 « Devis et facture pas à pas », B9 « Budget pro et reporting client »)
  - Décrocher des clients (P1 à P6)
- Une épreuve finale de 10 questions. Validation : 80 % de bonnes réponses et aucune erreur critique.
- Jeux : 12 scénarios à embranchements (3 décisions, médailles), quiz éclair de 5 questions au hasard, question du jour.
- Pensé pour un cerveau TDAH : une question à la fois, points d'avancement, XP et niveaux (Viewer → Légende), série de jours, combos et célébration (désactivée si « réduire les animations »), check-in d'énergie, sprints minutés de 5 à 25 minutes avec rappel de pause, mode focus, texte aéré.
- Thème mauve et blanc, mode sombre switchable (mémorisé, suit le système par défaut).
- Boîte à outils en euros, dollars US et livres sterling, avec contre-valeurs visibles partout : convertisseur, cotisations, tarif → revenu, trésorerie, prospection, budget pro, reporting client (texte prêt à copier), devis et facture (aperçu imprimable, mentions selon la situation TVA du client).
- Taux de change BCE modifiables, et bouton « Actualiser les taux BCE » (service Frankfurter, seule requête réseau, à la demande).
- 66 ressources et outils triés en 11 catégories, avec filtre.
- Progression dans le navigateur (localStorage), export et import JSON (1 Mo maximum) ; une sauvegarde v1 reste importable.
- Version 3 : 6 nouveaux outils dans la boîte à outils (14 au total) : livre des recettes (numérotation continue, statut payé ou en attente, export CSV, lien avec Devis & facture), plafonds (micro, franchise de TVA, alerte et projection), échéances (Urssaf, CFE, export .ics et Google Agenda), planning éditorial (semaine, par client), contrat et CGV (cession de droits, droit à l'image), facture électronique (leçon, checklist, grille de choix de plateforme).
- Révision espacée : les questions ratées reviennent après 1, 3, 7, 16 puis 35 jours (boîtes de Leitner).
- Veille et idées : actualités et alertes Google collectées chaque heure par GitHub Actions (`scripts/veille.js`, `veille-sources.json` → `data/veille.json`), boîte à idées avec partage depuis le téléphone (Android) et envoi vers le planning.
- Application installable (PWA) qui marche sans connexion : `manifest.webmanifest`, `sw.js`, `icons/`.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page, politique de sécurité du contenu, dialogues |
| `formation.css` | Styles du gabarit + ajouts du module |
| `sources.js` | Sources officielles et repères chiffrés (une seule source de vérité) |
| `contenu.js` | Parcours et métadonnées |
| `contenu-apprendre.js`, `contenu-entrainer.js`, `contenu-business.js`, `contenu-clients.js` | Leçons par parcours, épreuve finale dans `contenu-clients.js` |
| `contenu-bonus.js` | Questions supplémentaires, leçons B7 à B9, questions de l'épreuve finale ajoutées |
| `scenarios.js` | Les 12 scénarios |
| `ressources.js` | Ressources et outils par catégorie |
| `theme.js` | Applique le thème du système avant l’affichage (le choix enregistré est appliqué par `formation.js`) |
| `gestion.js` | Recettes, plafonds, échéances, révision espacée, planning, contrat et CGV, facture électronique (fonctions pures) |
| `scripts/veille.js`, `veille-sources.json`, `data/veille.json`, `.github/workflows/veille.yml` | Collecte horaire des flux RSS (aucune dépendance) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Version installable et hors connexion |
| `moteur.js` | Correction, barème, sauvegarde, calculs (devises, cotisations, budget, reporting, devis/facture), XP et série |
| `formation.js` | Interface |
| `tests/moteur.test.js`, `tests/gestion.test.js` | Tests : `node tests/moteur.test.js && node tests/gestion.test.js && node tests/veille.test.js` |
| `VERIFICATION-SOURCES.md` | Vérification des chiffres sur les sources officielles |

## Mettre à jour un taux

Après toute modification d'un fichier de l'application, change `VERSION` dans `sw.js` pour que les téléphones se mettent à jour. Modifier uniquement `reperes` dans `sources.js` et le texte de la leçon concernée, puis lancer les tests. Chaque chiffre légal, fiscal ou social est un repère pédagogique : vérifier le taux en vigueur sur la source officielle liée.

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou `python3 -m http.server` dans ce dossier.

## En ligne

- Site : https://zesite07-boop.github.io/Giky-CM-by-Laeti/
- Dépôt : https://github.com/zesite07-boop/Giky-CM-by-Laeti
