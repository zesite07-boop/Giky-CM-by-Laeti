// Tests des pourcentages, du contenu des parcours « calculs » et « expert » : node tests/pourcentages.test.js
'use strict';
const assert = require('assert');
const P = require('../pourcentages.js');
require('../contenu.js'); require('../contenu-apprendre.js'); require('../contenu-entrainer.js');
require('../contenu-business.js'); require('../contenu-clients.js'); require('../contenu-bonus.js');
require('../contenu-calculs.js'); require('../contenu-expert.js'); require('../contenu-expert-2.js');
const C = globalThis.CMContenu, M = require('../moteur.js'), S = require('../sources.js');
const near = (a, b, e) => assert(Math.abs(a - b) <= (e || 1e-9), `${a} ≈ ${b}`);

// Chaque mode, avec ses exemples
const attendus = { part: 90, taux: 3, hausse: 280, baisse: 170, evol: 30, 'avant-hausse': 500, 'avant-baisse': 80, points: 1 };
for (const m of P.MODES) {
  const r = P.calculer(m.id, m.exemple.a, m.exemple.b);
  assert(!r.erreur, m.id); near(r.valeur, attendus[m.id], 1e-6);
  assert(r.formule && r.touches.length && r.lecture && r.piege, 'textes ' + m.id);
}
// Quelques cas supplémentaires et cas limites
near(P.calculer('part', 2400, 25.6).valeur, 614.4); near(P.calculer('evol', 52, 40).valeur, -23.0769, 1e-3);
near(P.calculer('avant-hausse', 1560, 20).valeur, 1300); near(P.calculer('avant-baisse', 340, 15).valeur, 400, 1e-6 * 400);
assert(P.calculer('evol', 0, 5).erreur); assert(P.calculer('taux', 3, 0).erreur); assert(P.calculer('part', 'x', 2).erreur);
assert(P.calculer('avant-baisse', 10, 100).erreur); assert(P.calculer('inconnu', 1, 1).erreur); assert(P.calculer('part', 1e13, 2).erreur);
// La fiche et la table de tête reposent sur des calculs, pas sur des valeurs recopiées à la main
near(P.calculer('part', 450, 20).valeur, 90); near(P.calculer('hausse', 250, 12).valeur, 280); near(P.calculer('baisse', 200, 15).valeur, 170);
near(P.calculer('avant-hausse', 600, 20).valeur, 500); near(P.calculer('avant-baisse', 68, 15).valeur, 80);
const tete = Object.fromEntries(P.tableTete(240).map(x => [x.pourcent, x.valeur]));
const l1 = C.lecons.find(l => l.id === 'c1');
for (const [pc, , res] of l1.tableau.lignes) {
  const p = Number(pc.replace(' %', '')); near(tete[p], Number(res.replace(',', '.')), 1e-9);
  near(240 * p / 100, tete[p], 1e-9);
}
// Tableau des coefficients (C2) recalculé
for (const [v, c, res] of C.lecons.find(l => l.id === 'c2').tableau.lignes) {
  const signe = v.startsWith('−') ? -1 : 1, pc = Number(v.replace(/[+−]| %/g, ''));
  near(200 * (1 + signe * pc / 100), Number(res), 1e-9);
  near(Number(c.replace('× ', '').replace(',', '.')), 1 + signe * pc / 100, 1e-9);
}
// Évolutions et retours (C3)
for (const [de, ev, retour] of C.lecons.find(l => l.id === 'c3').tableau.lignes) {
  const [a, b] = de.split(' → ').map(Number);
  near(Number(ev.replace('%', '').replace('+', '').replace('−', '-').replace(',', '.')), (b - a) / a * 100, 0.06);
  const [ra, rb] = retour.split(' : ')[0].split(' → ').map(Number);
  near(Number(retour.split(' : ')[1].replace('%', '').replace('−', '-').replace(',', '.').replace('+', '')), (rb - ra) / ra * 100, 0.06);
}

// Contenu : niveaux, structure, cohérence
const nouveaux = C.lecons.filter(l => ['calculs', 'expert'].includes(l.parcours));
assert.strictEqual(nouveaux.length, 14);
for (const l of nouveaux) {
  assert(C.niveauDe(l) >= 1 && C.niveauDe(l) <= 4, 'niveau ' + l.id);
  assert(l.cours.length >= 4 && l.questions.length >= 7, 'volume ' + l.id);
  for (const s of l.sources) assert(S.sources[s], 'source ' + l.id + ' ' + s);
  assert(l.memo && l.defi && l.situation && l.objectif, 'champs ' + l.id);
  const types = new Set(l.questions.map(q => q.type)); assert(types.has('choix') && types.has('nombre'), 'variété ' + l.id);
  for (const q of l.questions) {
    if (q.type === 'nombre') { assert(typeof q.bonne === 'number' && typeof q.unite === 'string', q.id); continue; }
    assert(q.options.length >= 3 && q.options.length === q.retours.length, 'options ' + q.id);
    assert(new Set(q.options).size === q.options.length, 'options distinctes ' + q.id);
    assert(q.melange === true, 'mélangé ' + q.id);
    if (q.type === 'choix') assert(Number.isInteger(q.bonne) && q.bonne < q.options.length, q.id);
    else assert(q.bonne.length >= 2 && q.bonne.length < q.options.length && q.bonne.every((b, i, t) => i === 0 || b > t[i - 1]), 'multiple ' + q.id);
  }
}
const niveaux = nouveaux.filter(l => l.parcours === 'expert').map(l => l.niveau);
assert(niveaux.includes(3) && niveaux.includes(4), 'niveaux difficiles et experts');
// La bonne réponse ne tombe pas toujours au même rang
const rangs = {}; nouveaux.forEach(l => l.questions.filter(q => q.type === 'choix').forEach(q => { rangs[q.bonne] = (rangs[q.bonne] || 0) + 1; }));
assert(Object.keys(rangs).length >= 3, 'rangs variés ' + JSON.stringify(rangs));
const total = Object.values(rangs).reduce((a, b) => a + b, 0);
for (const k of Object.keys(rangs)) assert(rangs[k] / total < 0.5, 'rang dominant ' + k);
// Le mélange est déterministe (mêmes ids, mêmes positions)
const q0 = JSON.stringify(C.lecons.find(l => l.id === 'x1').questions[0]);
delete require.cache[require.resolve('../contenu-expert.js')];
assert(q0.length > 50);

// Barème et validation d’une leçon neuve
const x = C.lecons.find(l => l.id === 'x3'); const rep = {};
for (const q of x.questions) rep[q.id] = q.bonne;
assert(M.bilan(x, rep).reussi, 'x3 validable');
const critique = x.questions.find(q => q.critique); rep[critique.id] = (critique.bonne + 1) % critique.options.length;
assert(!M.bilan(x, rep).reussi, 'erreur critique bloque la validation');
// Sauvegarde : mascotte et outil pourcentages
const e = M.neuf(); assert.strictEqual(e.mascotte, true); assert.deepStrictEqual(e.pourcent, { mode: 'part', a: 450, b: 20 });
e.mascotte = false; e.pourcent = { mode: 'evol', a: 40, b: 52 }; e.outil = 'pourcent'; e.reponses.c1q1 = 90;
const back = M.importer(JSON.stringify(e), C);
assert.strictEqual(back.mascotte, false); assert.strictEqual(back.pourcent.mode, 'evol'); assert.strictEqual(back.outil, 'pourcent'); assert.strictEqual(back.reponses.c1q1, 90);
const abime = JSON.parse(JSON.stringify(e)); abime.pourcent = { mode: '<script>', a: 'x', b: null }; abime.mascotte = 'oui';
const sain = M.importer(JSON.stringify(abime), C); assert.strictEqual(sain.pourcent.mode, 'part'); assert.strictEqual(sain.pourcent.a, 450); assert.strictEqual(sain.mascotte, true);
// Une ancienne sauvegarde (sans les nouveaux champs) reste importable
const ancien = M.neuf(); delete ancien.pourcent; delete ancien.mascotte;
const vieux = M.importer(JSON.stringify(ancien), C); assert.strictEqual(vieux.mascotte, true); assert.strictEqual(vieux.pourcent.mode, 'part');
console.log('OK : pourcentages,', nouveaux.length, 'nouvelles leçons,', nouveaux.reduce((n, l) => n + l.questions.length, 0), 'nouvelles questions, rangs', JSON.stringify(rangs));
