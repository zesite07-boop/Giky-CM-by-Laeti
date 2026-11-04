# Reprise du projet — Module Community manager freelance (JTIpilot)

Document écrit le 4 novembre 2026 pour reprendre le projet sans rien perdre. Dépôt : https://github.com/zesite07-boop/Giky-CM-by-Laeti · Site : https://zesite07-boop.github.io/Giky-CM-by-Laeti/

## 1. Ce que c'est, pour qui

Un outil d'autoformation et de gestion qui tourne **entièrement dans le navigateur**, sans serveur, sans compte, sans framework. Il est destiné à **Laetitia**, community manager freelance (micro-entreprise) spécialisée **Twitch et jeux vidéo**, qui travaille pour des streamers et des studios, y compris à l'étranger (dollars, livres sterling).

Le public cible est TDAH : une question à la fois, XP et niveaux (Viewer → Légende), série de jours, sprints minutés, mode focus, texte aéré, mode sombre, animations réductibles.

Basé sur le gabarit JTIpilot (parcours responsable d'agence). Thème mauve et blanc.

## 2. Architecture

Site statique (GitHub Pages, `.nojekyll`). Pas de build. Scripts classiques chargés dans l'ordre par `index.html` avec `defer`. Politique de sécurité du contenu stricte : `script-src 'self'`, pas de script ni de style en ligne, `connect-src` limité à `https://api.frankfurter.dev` (taux BCE, à la demande), `manifest-src` et `worker-src` à `'self'`. **Ne jamais ajouter de script ou de style inline.** Pour mettre une largeur dynamique, utiliser `data-w` (appliqué par `largeurs()` dans `formation.js`).

| Fichier | Rôle |
|---|---|
| `index.html` | Page, CSP, dialogues (sauvegarde, confirmation), manifeste |
| `formation.css` | Styles (variables `--accent`, `--ligne`, etc., mode sombre via `data-theme`) |
| `theme.js` | Thème système avant affichage |
| `sources.js` | **Source de vérité** des liens officiels et des repères chiffrés (`reperes`) |
| `contenu.js` + `contenu-*.js` | 4 parcours, 29 leçons, 151 questions, épreuve finale |
| `scenarios.js` | 12 scénarios à embranchements |
| `ressources.js` | 66 ressources en 11 catégories |
| `gestion.js` | **Nouveau (v3)** : calculs purs des outils de gestion, révision, contrat, checklist |
| `moteur.js` | État, normalisation défensive, correction, barème, simulateurs v2, XP, stockage |
| `formation.js` | Interface (rendu par chaînes HTML, délégation d'événements) |
| `sw.js`, `manifest.webmanifest`, `icons/` | **Nouveau (v3)** : application installable hors connexion |
| `tests/moteur.test.js`, `tests/gestion.test.js` | Tests Node sans dépendance |
| `VERIFICATION-SOURCES.md` | Vérification des chiffres sur les sources officielles |

### Modèle de données (localStorage, clé `jtipilot_formation_cm_v1`, version 1)

Un seul objet JSON, validé champ par champ à chaque chargement et import (`normaliser` dans `moteur.js` : tout ce qui est inconnu ou mal typé est écarté ou remplacé par la valeur par défaut). Les champs ajoutés en v3 sont facultatifs : **une sauvegarde plus ancienne reste importable**.

- v1 : `reponses`, `notes`, `derniere`, `revenu`, `treso`, `pipeline`, `vue`, `etape`, `question`, `focus`.
- v2 : `theme`, `aere`, `energie`, `jours`, `outil`, `scenarios`, `eclair`, `devises`, `cotis`, `budget`, `reporting`, `doc`.
- v3 : `recettes[]`, `planning[]`, `revision{}`, `plafonds`, `echeances`, `contrat`, `efact{coches, choix[3]}`.

Limites : fichier d'import 1 Mo ; 1 500 lignes maximum pour les recettes et pour le planning (un export plein fait environ 780 Ko).

### Principe de l'interface

`render()` reconstruit toute la page à partir de `etat` ; les champs d'outils portent `data-sim="groupe" data-cle="chemin.pointé"` et `majSim()` écrit dans `etat` puis ne rafraîchit que `#resultat-<outil>`. Les formulaires d'ajout (recettes, planning) utilisent des brouillons hors état (`pf`, attributs `data-pf`). Les actions passent par `data-action` (un seul écouteur de clic). Les onglets de la boîte à outils : tableau `ONGLETS` + `OUTIL_RENDU` dans `formation.js` + identifiant dans `OUTILS` de `moteur.js`.

## 3. Contenu pédagogique (v2, inchangé)

4 parcours : Apprendre le métier (T1–T8), S'entraîner (M1–M6), Piloter mon business (B1–B9), Décrocher des clients (P1–P6). Épreuve finale : 10 questions, validation à 80 % et aucune erreur critique. Jeux : scénarios, quiz éclair, question du jour. Boîte à outils multidevise (€/$/£) avec taux BCE modifiables ou actualisés à la demande.

## 4. Ce qui a été ajouté en v3 (4 novembre 2026)

1. **Sauvegarde de la progression** : existait déjà (export et import JSON). Étendue aux nouvelles données, limite portée à 1 Mo.
2. **Livre des recettes** (onglet « Livre des recettes ») : date, numéro, client, désignation, montant HT en devise et converti en euros au taux du moment, statut payé ou en attente, mode de règlement. Numérotation `F-AAAA-001` **continue** (prochain numéro, détection des trous et des doublons). Lien avec « Devis & facture » : bouton « Prochain numéro libre » et « Enregistrer dans le livre des recettes ». Export CSV pour Excel français (séparateur `;`, virgule décimale, BOM UTF-8, protection contre l'injection de formules).
3. **Facture électronique** : mini-leçon, checklist de 12 étapes mémorisée, grille de choix de plateforme (3 candidates × 5 critères).
4. **Calendrier des échéances** : déclaration Urssaf mensuelle ou trimestrielle (fin du mois suivant), CFE (15 décembre en général, marqué « à vérifier »), impôt sur le revenu (date variable), jalons de la facture électronique. Export `.ics` (rappel 3 jours avant) et lien « Ajouter à Google Agenda » par échéance.
5. **Plafonds** : chiffre d'affaires encaissé de l'année (recettes payées + report saisi) comparé au plafond micro, à la franchise de TVA et au seuil majoré ; niveaux (ok, à surveiller dès 70 %, proche dès 90 %, dépassé), projection annuelle et date estimée de dépassement, messages selon la règle de TVA.
6. **Révision espacée** (menu « Révision espacée » + tuile d'accueil) : boîtes de Leitner 1, 3, 7, 16, 35 jours. Toute question ratée (leçon, quiz éclair, ou déjà ratée avant la v3) y entre ; en révision, une bonne réponse fait monter d'une boîte, une erreur renvoie en boîte 1. Pas d'XP en révision (pour ne pas gonfler le score).
7. **Planning éditorial** : vue par semaine, lives, clips, posts, par client, avec filtre, coche « fait » et résumé par client.
8. **Contrat et CGV** : générateur de texte (missions, durée, préavis, prix, acompte, pénalités et indemnité de 40 €, cession de droits d'auteur avec étendue, supports, territoire et durée, clause de droit à l'image, confidentialité, RGPD, droit applicable). Copie et impression PDF. **Modèle pédagogique, à faire relire.**
9. **Version installable hors connexion (PWA)** : manifeste, service worker (cache puis mise à jour en arrière-plan), icônes 192/512/maskable, bouton « Installer l'app » (Android, ordinateur), mode d'emploi iPhone dans « Mon carnet ».

## 5. Vérifications faites

- `node tests/moteur.test.js` et `node tests/gestion.test.js` passent (calculs, numérotation, plafonds, échéances, ICS, Leitner, planning, contrat, normalisation défensive, aller-retour export/import, taille maximale).
- Test de bout en bout dans Chromium : tous les onglets, ajout de recettes, trou et doublon de numéros, CSV et ICS téléchargés et relus, plafonds, planning, contrat, checklist, révision (erreur → boîte 1 → bonne réponse → boîte 2), export puis import après effacement du stockage, **rechargement hors connexion**, mobile 390 px sans débordement, **aucune erreur de console**.

## 6. Points d'attention

- Les chiffres légaux viennent de `sources.js` (vérifiés le 3 novembre 2026). Les rouvrir sur les sources officielles avant toute mise à jour.
- Les dates d'échéance « fixes » (déclaration Urssaf : fin du mois suivant ou du trimestre) sont des règles stables ; CFE et impôt sur le revenu sont marqués « à vérifier ».
- Facture électronique : calendrier repris de `sources.js` (réception 1er septembre 2026, émission micro-entreprises 1er septembre 2027). Les modalités (liste des plateformes, e-reporting) évoluent : la mini-leçon renvoie à impots.gouv.fr.
- Contrat et CGV : texte pédagogique, pas un conseil juridique.
- **Après toute modification d'un fichier de l'application, changer `VERSION` dans `sw.js`**, sinon les téléphones gardent l'ancienne copie.
- Les données restent dans le navigateur de l'appareil : exporter régulièrement (bouton « Sauvegarder »).

## 7. Idées non faites (non demandées)

Kit média Twitch et grille de tarifs, certificat imprimable, planning exporté en `.ics`, sauvegarde automatique vers un cloud, synchronisation entre appareils.
