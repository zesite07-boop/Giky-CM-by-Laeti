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
| `contenu.js` + `contenu-*.js` | 6 parcours, 49 leçons, 297 questions, épreuve finale |
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

### Veille et idées (ajout du 4 novembre 2026, après la v3)

- **Collecte** : `.github/workflows/veille.yml` lance `scripts/veille.js` toutes les heures (et à la demande depuis l'onglet Actions). Le script lit `veille-sources.json`, récupère chaque flux RSS ou Atom, écrit `data/veille.json` et ne commite que si le contenu change. Une source en panne garde ses anciens éléments et apparaît dans « sources sans réponse ». Le site lit ce fichier (même origine, donc la CSP reste stricte), le service worker le sert réseau d'abord puis copie en cache hors connexion.
- **Sources par défaut** : 3 recherches Google Actualités (Twitch France, streamers, sorties de jeux), Dexerto FR, Journal du Geek, Numerama, Gamekult, jeuxvideo.com, Reddit r/Twitch. **Exécution réelle du 4/11/2026 : toutes répondent (110 éléments)**, sauf r/LivestreamFail (HTTP 429 de Reddit, retiré). r/Twitch peut être bloqué par Reddit à tout moment : le journal du workflow indique OK ou ERREUR par source.
- **Alertes Google** : créer l'alerte sur google.com/alerts, destination « Flux RSS », puis ajouter l'adresse dans `veille-sources.json` avec `"categorie": "alerte"`.
- **TikTok et Instagram** : pas de flux officiel gratuit, pas de collecte automatique. À la place : partage depuis le téléphone (`share_target` du manifeste, Android) qui crée une idée, ou lien collé à la main.
- **Boîte à idées** (`etat.idees`, 500 maximum) : statut à faire, en cours, publié ; bouton « Mettre au planning ».
- **Clips Twitch** : aucune source gratuite de clips français mise à jour n'a été trouvée pour une intégration directe. Piste officielle : API Twitch « Get Clips » (jeton d'application, application développeur à créer) ; non faite. La réutilisation de clips d'un tiers demande l'accord du streamer.

### Redesign « accueil par énergie » (4 novembre 2026, maquette validée par JT)

- **Accueil** : énergie du jour en premier (faible / moyenne / pleine, clé d'état `energie` = basse / moyenne / haute), carte « Prochaine action » (faible → quiz éclair, moyenne → prochaine leçon, pleine → prochaine mission M*, sinon scénarios), progression (série, XP, niveau, étapes), 6 tuiles colorées, question du jour (+10 XP), 4 familles de leçons avec barre de progression. Fonctions : `accueil`, `prochaineAction`, `programme` (liste complète des 43 leçons + épreuve finale), `jouer` (3 tuiles), `victoire` (fin de leçon validée).
- **Navigation** : barre du bas à 5 onglets sur téléphone (≤ 800 px) : Accueil, Apprendre (`programme`), Jouer (`jouer`), Business (`simulateurs`), Veille. Le rail de gauche reste sur grand écran. Les 5 boutons du haut sont regroupés dans « Réglages » (Sprint, Sombre, Texte aéré, Focus, Sauvegarder) ; le panneau reste ouvert pendant les réglages (`reglagesOuvert`). Le bandeau permanent a été retiré, sa phrase est dans Réglages.
- **Couleurs** : mauve conservé ; accents cerise `--cerise` (action principale), turquoise `--turquoise` (progression), or `--or-vif` (récompenses), versions « texte » plus foncées pour le contraste, variantes mode sombre. Police des titres Chakra Petch (fichiers dans `fonts/`, licence OFL).
- **Série douce** : `M.serie` tolère maintenant un jour de pause (deux jours de suite sans jouer la cassent).
- **Veille** : 5 éléments puis « Voir plus » (sans filtre).
- **Rappel de sauvegarde** : champs d'état `debut` et `sauvegarde` (dates ISO). Carte sur l'accueil quand il y a des données et que 30 jours ont passé depuis la dernière sauvegarde (ou le premier lancement). Effacée après un export.
- **Boutons de leçon** : Commencer / Reprendre / Revoir au lieu de « Ouvrir ↗ ».
- Service worker `cm-v6`. Vérifié : tests unitaires, e2e (dont hors connexion), veille 5 + voir plus, sécurité d'affichage, rappel de sauvegarde, rendu 390 px et 1280 px, mode clair et sombre.
- Non vérifié : appareil réel de Laetitia.

- **v4 (novembre 2026)** : parcours `calculs` (C1–C4) et `expert` (X1–X10) ajoutés SANS toucher aux leçons existantes (progression conservée ; total 29 → 44 avec l'épreuve). Niveaux 1–4 (`C.niveaux`, `C.niveauDe`), ordre des options mélangé de façon déterministe (`C.melanger`). `toutes()` triée par ordre de parcours et mise en cache. Mascotte Mochi (SVG inline, classes CSS, réglage `mascotte`). Outil `pourcent` (`pourcentages.js`, tests dédiés). Quiz éclair avec choix de niveau. Service worker `cm-v7`. Tests Node + e2e Chrome OK. Non testé sur le téléphone réel de Laetitia.

- **v5 (8/11/2026)** : `G.alertes(liste, faites, auj)` (pur, testé) ; état `echeancesFaites` (ids) et `suggestions` ; `carteAlertes` (accueil), `bandeauAlertes` (autres pages), pastilles `.pastille-alerte` (rail + barre du bas), `navigator.setAppBadge` si disponible. Vue `suggestions` : `mailto:` vers JT (adresse assemblée dans `CONTACT`, formation.js) ; lire les messages en cherchant « [Giky CM] » dans la boîte mail. Veille : catégorie `createurs` (6 alertes Google, Tubefilter, Passionfruit vérifiés ; Blog du Modérateur non vérifiable depuis l'atelier, le journal du workflow dira OK ou ERREUR). Repli : tant qu'aucun élément `createurs` n'existe, la veille affiche tout. SW `cm-v8`.

- **v6 (8/11/2026)** : alertes : `niveau` `passee` (> 3 jours, calme, sans pastille) + ligne « Prochaine échéance » ; veille : recherche sans accents, multi-mots, tous les articles, liens Google/YouTube/Twitch si rien, 3 requêtes de 4 créateurs (collecte 20 par source / 400) ; vue `pcimages` (8 cartes, état `pcv` en mémoire, `majPcv` met à jour curseurs sans re-rendu) ; menu : `groupeMenu`/`menuOuvert` (aff, jeu, out, app + app-<parcours>), accueil : section Mes affaires. SW `cm-v10`.

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


## v7 (8 novembre 2026)
- `contenu-reseaux.js` : B10 Facebook Pro (Meta Business Suite), B11 WhatsApp Business, B12 LinkedIn en pro (parcours Business) et T9 Le clipping Twitch (parcours Apprendre). Sources officielles ajoutées dans `sources.js` (clés meta*, wa*, li*, twitchClips, twitchDual, twitchDevClips). Rien de payant n'est obligatoire.
- Veille : catégories `evenements` et `decouverte` (7 nouvelles sources Google Actualités dans `veille-sources.json`), onglets dédiés, tuile d'accueil avec le compte de la semaine, MAX_TOTAL 700. Pour ajouter un créateur : suggestion « Un créateur à suivre » -> à ajouter dans `veille-sources.json` (max 4 noms par requête).
- Non vérifié (accès refusé) : sites officiels des événements (Z Event, TwitchCon, Paris Games Week) -> aucun lien direct, passage par la collecte.
- SW cm-v11. 49 leçons, 297 questions.

- **v8 (8/11/2026)** : `kit.js` (UMD `CMKit`, testé) génère le kit prospect (6 types de client × 6 demandes, ton auto, 3 offres, mentions TVA/acompte/délai, relances J+3/J+7/J+14) ; état `kits` (suivi des envois, rappels `relanceDue` sur l'accueil). Boîte à outils découpée en 4 familles (`FAMILLES`, `famille-outil`). Mochi : humeurs `salut`/`pense`, présente dans les cours (`mascotte-cours`) et réactive aux réponses. Leçons P7 et P8 (kit de prospection). Veille : liste `createurs_suivis` (noms cherchés par lots de 4 dans Google Actualités, catégorie découverte) ; option API Twitch (secrets `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` → chaînes FR en direct de 25 à 1 500 spectateurs). SW `cm-v12`. 50 leçons, 297 questions.

- **v9 (8/11/2026, cm-v14)** : refonte de la navigation en 4 espaces distincts. Apprendre (`programme` : parcours apprendre + calculs), S'entraîner (`jouer` : quiz, scénarios, missions, défis de pro, épreuve finale), Business (`business` : outils + leçons business/clients, bascule `sousBiz`), Outils et ressources (`simulateurs` : veille, ressources, pourcentages en images, outils de travail). `PARCOURS_ESPACE` range chaque parcours dans un seul espace ; `FAMILLES` porte l'espace en 6e élément ; `panneauOutils(espace)`. Barre du bas : Accueil · Apprendre · S'entraîner · Business · Outils (la Veille est dans Outils). Cotisations : ajout d'une note (impôt sans versement libératoire, CFE, aucune charge déduite). Scripts e2e à jour (les vues se rejoignent par `[data-view]`).

## v10 (cm-v15) — audit JT
- Routes hash (`#/business/kit`, `#/lecon/t3`…) : le bouton Retour du navigateur reste dans le site.
- « ← Retour » unique, « ↑ Haut », puces collantes Ressources/Sources, accueil réduit à l'essentiel, texte ≥ 14 px.
- Kit prospect en 4 étapes (`kitEtape`, action `kit-etape`) ; `#resultat-kit` n'existe qu'à l'étape 4.
- Échéance Urssaf : « Comment faire (3 étapes) ».
- Reste : favoris « Mes 3 outils », suivi unique, glossaire, rappel 1 semaine, cartes image (plafonds, relances, T3).

## v11 (cm-v16) — fin de l'audit
- Favoris « Mes 3 outils » (`etat.favoris`) + recherche d'outil (datalist) ; étoile dans chaque outil.
- Suivi unique : nouvel outil `suivi` (Suivi clients) ; plus de liste dans le kit.
- Rappel d'échéance « dans 1 semaine » (`etat.rappels`, filtre dans `listeAlertes`).
- Jargon : sigles cliquables (`JARGON`, `jargonner()`), glossaire + sources par thème dans Sources.
- Visuels de leçon `VISUELS` (t3, b1, b5) ; focus/minuteur/« sauvegardé automatiquement » dans la leçon.
- Icônes SVG partout (plus d'emoji dans menus/familles) ; XP affiché une fois (accueil + victoire) ; carte « prochaine action » agrandie.
- Test : /home/claude/e2e/e2e9.py (nouveautés), e2e10.py (rappel avec horloge simulée).

## v12 (cm-v17) — segmentation Métier de CM / Business + menu plat
- `etat.domaine` ('cm'|'biz'), `DOMAINES`, `domaineLecon()` (X4, X5, X9 forcés en biz ; business/clients/calculs = biz), `selecteurDomaine()`.
- Apprendre, S'entraîner, quiz éclair, révision, scénarios, question du jour : filtrés par domaine.
- Business = outils seulement (plus de bascule « Les leçons »). `#/business/lecons` redirige vers Apprendre/Business.
- Menu latéral plat : Accueil, Apprendre, S'entraîner, Business, Outils, Mon carnet. Les pages secondaires (scénarios, éclair, veille…) s'ouvrent depuis les tuiles.
- Tests : /home/claude/e2e/runner.py <script> (shim data-view), e2e11.py = domaines.
