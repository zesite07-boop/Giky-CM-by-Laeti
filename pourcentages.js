/* Calculs de pourcentages : fonctions pures, testables sans navigateur.
   Utilisées par l’outil « Pourcentages » (calculatrice commentée, fiche de formules, calcul de tête)
   et par les leçons du parcours « Les pourcentages, enfin clairs ». */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CMPourcent = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const fmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 });
  const f = v => fmt.format(Math.round(v * 1e6) / 1e6).replace('-', '−');
  const fmt2 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
  const f2 = v => fmt2.format(v).replace('-', '−');
  const fini = v => typeof v === 'number' && Number.isFinite(v);
  /* Écriture « calculatrice » d’un pourcentage en coefficient : 20 → 0,2 ; 3 → 0,03. */
  const coef = p => f(p / 100);

  /* Les modes proposés dans l’outil. a et b sont les deux nombres saisis ; leurs libellés dépendent du mode. */
  const MODES = [
    { id: 'part', nom: 'Calculer X % d’un nombre', a: 'Le nombre (ex. un montant, un nombre d’abonnés)', b: 'Le pourcentage X (%)', exemple: { a: 450, b: 20 } },
    { id: 'taux', nom: 'Quelle part représente A sur B ?', a: 'A : la petite quantité (ex. clics, interactions)', b: 'B : le total (ex. impressions, abonnés)', exemple: { a: 270, b: 9000 } },
    { id: 'hausse', nom: 'Augmenter un nombre de X %', a: 'Le nombre de départ', b: 'La hausse X (%)', exemple: { a: 250, b: 12 } },
    { id: 'baisse', nom: 'Diminuer un nombre de X %', a: 'Le nombre de départ', b: 'La baisse X (%)', exemple: { a: 200, b: 15 } },
    { id: 'evol', nom: 'Évolution entre deux valeurs', a: 'La valeur de départ', b: 'La valeur d’arrivée', exemple: { a: 40, b: 52 } },
    { id: 'avant-hausse', nom: 'Retrouver le nombre avant une hausse de X %', a: 'Le nombre obtenu après la hausse (ex. prix TTC)', b: 'La hausse X (%) (ex. 20 pour la TVA)', exemple: { a: 600, b: 20 } },
    { id: 'avant-baisse', nom: 'Retrouver le nombre avant une baisse de X %', a: 'Le nombre obtenu après la baisse (ex. prix remisé)', b: 'La baisse X (%)', exemple: { a: 68, b: 15 } },
    { id: 'points', nom: 'Passer de A % à B % : points ou pourcentage ?', a: 'Le taux de départ (%)', b: 'Le taux d’arrivée (%)', exemple: { a: 2, b: 3 } }
  ];
  const MODES_IDS = MODES.map(m => m.id);

  /* Astuces de calcul de tête pour « X % de N ». */
  function teteParts(n, p) {
    const out = [];
    const rond = Number.isInteger(p) && p > 0 && p <= 100;
    const dix = n / 10, un = n / 100;
    const simples = { 50: ['la moitié', n / 2], 25: ['le quart (÷ 4)', n / 4], 75: ['3 quarts : le quart (÷ 4) puis × 3', n / 4 * 3], 10: ['÷ 10 (décale la virgule d’un cran)', dix],
      1: ['÷ 100 (décale la virgule de deux crans)', un], 5: ['la moitié de 10 %', dix / 2], 20: ['10 % × 2', dix * 2], 15: ['10 % + 5 %', dix + dix / 2], 30: ['10 % × 3', dix * 3], 40: ['10 % × 4', dix * 4] };
    if (simples[p]) out.push(`${f(p)} % de ${f(n)} : ${simples[p][0]}, soit ${f(simples[p][1])}.`);
    else if (rond && p < 100) {
      const diz = Math.floor(p / 10), uni = p % 10;
      const noms = [], calc = [];
      if (diz) { noms.push(`${diz} × 10 %`); calc.push(`${diz} × ${f(dix)}`); }
      if (uni) { noms.push(`${uni} × 1 %`); calc.push(`${uni} × ${f(un)}`); }
      out.push(`${f(p)} % = ${noms.join(' + ')}. Ici : ${calc.join(' + ')} = ${f(diz * dix + uni * un)}.`);
    } else out.push('Pour un pourcentage avec des décimales, passe par le coefficient : c’est plus sûr.');
    out.push(`Contrôle rapide : 10 % de ${f(n)} font ${f(dix)}. Ton résultat doit être cohérent avec ça.`);
    return out;
  }

  function calculer(mode, a, b) {
    if (!MODES_IDS.includes(mode)) return { erreur: 'Choisis un type de calcul.' };
    if (!fini(a) || !fini(b)) return { erreur: 'Saisis deux nombres.' };
    if (Math.abs(a) > 1e12 || Math.abs(b) > 1e12) return { erreur: 'Nombres trop grands.' };
    const m = MODES.find(x => x.id === mode);
    let valeur, unite = '', formule, touches, tete = [], lecture, piege = '';
    if (mode === 'part') {
      valeur = a * b / 100; formule = `${f(a)} × ${f(b)} ÷ 100 = ${f(valeur)}`;
      touches = [`${f(a)}  ×  ${f(b)}  ÷  100  =`, `ou, avec le coefficient : ${f(a)}  ×  ${coef(b)}  =`];
      tete = teteParts(a, b);
      lecture = `${f(b)} % de ${f(a)}, c’est ${f(valeur)}.`;
      piege = 'Piège fréquent : 3 % se note 0,03 (pas 0,3). Si ton résultat te paraît énorme, vérifie la virgule.';
    } else if (mode === 'taux') {
      if (b === 0) return { erreur: 'Le total B ne peut pas être 0.' };
      valeur = a / b * 100; unite = '%'; formule = `${f(a)} ÷ ${f(b)} × 100 = ${f(valeur)} %`;
      touches = [`${f(a)}  ÷  ${f(b)}  ×  100  =`, `ou : ${f(a)}  ÷  ${f(b)}  =  ${f(a / b)}, puis × 100`];
      tete = [`Contrôle : ${f(valeur)} % de ${f(b)} doit redonner ${f(a)}.`, a > b ? 'A est plus grand que B : le résultat dépasse 100 %. C’est possible, mais vérifie que tu as bien mis le total en second.' : `A est plus petit que B : le résultat est sous 100 %. Si A valait la moitié de B, ce serait 50 %.`];
      lecture = `${f(a)} sur ${f(b)} représente ${f(valeur)} %.`;
      piege = 'On divise toujours la partie par le total, pas l’inverse.';
    } else if (mode === 'hausse' || mode === 'baisse') {
      const s = mode === 'hausse' ? 1 : -1, c = 1 + s * b / 100;
      valeur = a * c; formule = `${f(a)} × (1 ${s > 0 ? '+' : '−'} ${f(b)} ÷ 100) = ${f(a)} × ${f(c)} = ${f(valeur)}`;
      touches = [`${f(a)}  ×  ${f(c)}  =`, `ou en deux temps : ${f(a)}  ×  ${f(b)}  ÷  100  =  ${f(a * b / 100)}, puis ${s > 0 ? '+' : '−'} ${f(a)}`];
      tete = [`Le coefficient ${f(c)} fait tout en une seule opération.`, ...teteParts(a, b).slice(0, 1)];
      lecture = `${f(a)} ${s > 0 ? 'augmenté' : 'diminué'} de ${f(b)} %, cela fait ${f(valeur)} (${s > 0 ? '+' : '−'} ${f(Math.abs(valeur - a))}).`;
      piege = mode === 'hausse' ? 'Une hausse de 100 % double le nombre (× 2). Le coefficient se lit : 1 + hausse.' : 'Une baisse de 20 % laisse 80 % : coefficient 0,8, pas 0,2. Le coefficient se lit : 1 − baisse.';
    } else if (mode === 'evol') {
      if (a === 0) return { erreur: 'La valeur de départ ne peut pas être 0 : on ne peut pas calculer une évolution en pourcentage.' };
      valeur = (b - a) / a * 100; unite = '%';
      formule = `(${f(b)} − ${f(a)}) ÷ ${f(a)} × 100 = ${f(valeur)} %`;
      touches = [`(  ${f(b)}  −  ${f(a)}  )  ÷  ${f(a)}  ×  100  =`];
      tete = [`On divise toujours par la valeur de DÉPART (${f(a)}), jamais par celle d’arrivée.`, `Contrôle : ${f(a)} × ${f(1 + valeur / 100)} doit redonner ${f(b)}.`];
      lecture = valeur === 0 ? 'Aucune évolution.' : `${valeur > 0 ? 'Hausse' : 'Baisse'} de ${f(Math.abs(valeur))} % entre ${f(a)} et ${f(b)}.`;
      piege = `Une hausse et la baisse inverse ne s’annulent pas : revenir de ${f(b)} à ${f(a)} ferait ${b ? f2((a - b) / b * 100) : '—'} %, et non ${f2(-valeur)} %.`;
    } else if (mode === 'avant-hausse' || mode === 'avant-baisse') {
      const s = mode === 'avant-hausse' ? 1 : -1, c = 1 + s * b / 100;
      if (c <= 0) return { erreur: 'Une baisse de 100 % ou plus n’a pas de point de départ calculable.' };
      valeur = a / c; formule = `${f(a)} ÷ (1 ${s > 0 ? '+' : '−'} ${f(b)} ÷ 100) = ${f(a)} ÷ ${f(c)} = ${f(valeur)}`;
      touches = [`${f(a)}  ÷  ${f(c)}  =`];
      const faux = a * (1 - s * b / 100);
      tete = [`Contrôle : ${f(valeur)} × ${f(c)} doit redonner ${f(a)}.`];
      lecture = `Avant ${s > 0 ? 'la hausse' : 'la baisse'} de ${f(b)} %, c’était ${f(valeur)}.`;
      piege = `Ne retire pas ${f(b)} % du nombre final : ${f(a)} ${s > 0 ? '−' : '+'} ${f(b)} % = ${f(faux)}, ce n’est PAS ${f(valeur)}. Le pourcentage s’appliquait au point de départ, pas à l’arrivée.`;
    } else if (mode === 'points') {
      const pts = b - a;
      valeur = pts; unite = Math.abs(pts) > 1 ? 'points' : 'point'; formule = `${f(b)} % − ${f(a)} % = ${f(pts)} point${Math.abs(pts) > 1 ? 's' : ''}`;
      touches = [`${f(b)}  −  ${f(a)}  =  ${f(pts)}  (points)`, a !== 0 ? `en pourcentage : (  ${f(b)}  −  ${f(a)}  )  ÷  ${f(a)}  ×  100  =  ${f(pts / a * 100)} %` : ''].filter(Boolean);
      tete = ['Les « points » mesurent un écart entre deux pourcentages. Le « % d’évolution » mesure l’écart rapporté au point de départ.'];
      lecture = a !== 0 ? `De ${f(a)} % à ${f(b)} %, c’est ${pts >= 0 ? '+' : '−'}${f(Math.abs(pts))} point${Math.abs(pts) > 1 ? 's' : ''}, soit ${pts >= 0 ? '+' : '−'}${f(Math.abs(pts / a * 100))} % d’évolution.` : `De ${f(a)} % à ${f(b)} % : ${f(pts)} points. L’évolution en % n’est pas calculable depuis 0.`;
      piege = 'Écrire « +1 % » quand on passe de 2 % à 3 % est faux : c’est +1 point (et +50 % d’évolution).';
    }
    return { mode, nom: m.nom, valeur: Math.round(valeur * 1e8) / 1e8, unite, formule, touches, tete, lecture, piege };
  }

  /* Fiche de formules : une ligne par besoin. Les exemples sont recalculés par calculer() dans les tests. */
  const FICHE = [
    { besoin: 'Prendre X % d’un nombre', formule: 'N × X ÷ 100', touches: '450 × 20 ÷ 100', exemple: '20 % de 450 € = 90 €', quand: 'Acompte, commission, cotisations, mix de contenus' },
    { besoin: 'Savoir quelle part A représente sur B', formule: 'A ÷ B × 100', touches: '270 ÷ 9 000 × 100', exemple: '270 clics sur 9 000 vues = 3 %', quand: 'Taux d’engagement, de clic, de réponse' },
    { besoin: 'Augmenter de X %', formule: 'N × (1 + X ÷ 100)', touches: '250 × 1,12', exemple: '250 € + 12 % = 280 €', quand: 'Hausse de tarif, TVA (× 1,2)' },
    { besoin: 'Diminuer de X %', formule: 'N × (1 − X ÷ 100)', touches: '200 × 0,85', exemple: '200 € − 15 % = 170 €', quand: 'Remise, geste commercial' },
    { besoin: 'Mesurer une évolution', formule: '(Arrivée − Départ) ÷ Départ × 100', touches: '(52 − 40) ÷ 40 × 100', exemple: '40 → 52 viewers = + 30 %', quand: 'Bilan mensuel, croissance' },
    { besoin: 'Retrouver le nombre avant une hausse', formule: 'Final ÷ (1 + X ÷ 100)', touches: '600 ÷ 1,2', exemple: '600 € TTC = 500 € HT', quand: 'TTC → HT, prix avant augmentation' },
    { besoin: 'Retrouver le nombre avant une baisse', formule: 'Final ÷ (1 − X ÷ 100)', touches: '68 ÷ 0,85', exemple: '68 € après − 15 % = 80 € avant', quand: 'Prix avant remise' },
    { besoin: 'Comparer deux taux', formule: 'Arrivée − Départ (en points)', touches: '3 − 2', exemple: '2 % → 3 % = + 1 point (+ 50 %)', quand: 'Taux d’engagement, de conversion' }
  ];

  /* Table du calcul de tête, construite par le calcul pour un nombre donné (jamais écrite à la main). */
  function tableTete(n) {
    const lignes = [[10, '÷ 10'], [1, '÷ 100'], [5, 'moitié de 10 %'], [20, '10 % × 2'], [25, '÷ 4'], [50, '÷ 2'], [75, '÷ 4 puis × 3'], [15, '10 % + 5 %']];
    return lignes.map(([p, astuce]) => ({ pourcent: p, astuce, valeur: n * p / 100 }));
  }

  return { MODES, MODES_IDS, calculer, FICHE, tableTete, teteParts, coef, f };
}));
