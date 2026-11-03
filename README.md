# JTIpilot · Module Community manager freelance

Module d'autoformation pour une community manager freelance spécialisée Twitch et jeux vidéo, construit à partir du gabarit JTIpilot (parcours responsable d'agence).

## Contenu

- 4 parcours, 26 leçons, 70 questions avec une explication pour chaque option :
  - Apprendre le métier (T1 à T8)
  - S'entraîner sur des missions (M1 à M6)
  - Piloter mon business (B1 à B6)
  - Décrocher des clients (P1 à P6)
- Une épreuve finale de 6 questions.
- Validation : 80 % de bonnes réponses et aucune erreur critique.
- Mode focus, reprise guidée, carnet d'actions, badges par parcours.
- 3 simulateurs : tarif journalier vers revenu, trésorerie sur 6 mois, pipeline de prospection.
- Progression dans le navigateur (localStorage), export et import JSON. Aucune requête réseau.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page, politique de sécurité du contenu, dialogues |
| `formation.css` | Styles du gabarit + ajouts du module |
| `sources.js` | Sources officielles et repères chiffrés (une seule source de vérité) |
| `contenu.js` | Parcours et métadonnées |
| `contenu-apprendre.js`, `contenu-entrainer.js`, `contenu-business.js`, `contenu-clients.js` | Leçons par parcours, épreuve finale dans `contenu-clients.js` |
| `moteur.js` | Correction, barème, sauvegarde, simulateurs |
| `formation.js` | Interface |
| `tests/moteur.test.js` | Tests : `node tests/moteur.test.js` |
| `VERIFICATION-SOURCES.md` | Vérification des chiffres sur les sources officielles |

## Mettre à jour un taux

Modifier uniquement `reperes` dans `sources.js` et le texte de la leçon concernée, puis lancer les tests. Chaque chiffre légal, fiscal ou social est un repère pédagogique : vérifier le taux en vigueur sur la source officielle liée.

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou `python3 -m http.server` dans ce dossier.

## En ligne

- Site : https://zesite07-boop.github.io/Giky-CM-by-Laeti/
- Dépôt : https://github.com/zesite07-boop/Giky-CM-by-Laeti
