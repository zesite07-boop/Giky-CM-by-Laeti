// Tests du moteur et cohérence du contenu : node tests/moteur.test.js
'use strict';
const assert = require('assert');
require('../contenu.js'); require('../contenu-apprendre.js'); require('../contenu-entrainer.js');
require('../contenu-business.js'); require('../contenu-clients.js'); require('../contenu-bonus.js'); require('../contenu-reseaux.js');
require('../contenu-calculs.js'); require('../contenu-expert.js'); require('../contenu-expert-2.js');
const C = globalThis.CMContenu, M = require('../moteur.js'), S = require('../sources.js');
const lecons = M.toutes(C);
assert.strictEqual(C.lecons.length, 49, '29 leçons de base + 4 de calculs + 10 défis de pro + 3 réseaux pro + clipping');
const ids = new Set();
for (const l of lecons) {
  assert(!ids.has(l.id), 'id unique ' + l.id); ids.add(l.id);
  assert(C.parcours.some(p => p.id === l.parcours), 'parcours ' + l.id);
  assert(l.questions.length >= 2, 'questions ' + l.id);
  for (const s of l.sources) assert(S.sources[s], 'source inconnue ' + s + ' dans ' + l.id);
  for (const q of l.questions) {
    assert(!ids.has(q.id), 'id q unique ' + q.id); ids.add(q.id);
    if (q.type !== 'nombre') {
      assert.strictEqual(q.retours.length, q.options.length, 'retours ' + q.id);
      assert(M.valeurValide(q, q.bonne), 'bonne valide ' + q.id);
    }
    assert(M.correcte(q, q.bonne), 'bonne correcte ' + q.id);
  }
}
// Barème : 80 % + zéro critique
const l = C.lecons.find(x => x.id === 'b2');
const rep = {}; for (const q of l.questions) rep[q.id] = q.bonne;
assert(M.bilan(l, rep).reussi);
rep.b2q3 = 0; const b = M.bilan(l, rep);
assert(!b.reussi && b.critiques === 1);
// Calculs business recoupés avec les questions
const R = S.reperes;
const r = M.calculerRevenu({ tjm: 250, jours: 3, semaines: 45, regime: 'bnc', vfl: false, acre: false, frais: 0 }, R);
assert.strictEqual(r.ca, 33750); assert(Math.abs(r.cotisations - 33750 * 0.256) < 0.01);
assert(Math.abs(r.cfp - 67.5) < 0.01);
const t = M.tjmPour(30000, { tjm: 0, jours: 3, semaines: 45, regime: 'bnc', vfl: false, acre: false, frais: 1200 }, R);
const check = M.calculerRevenu({ tjm: t, jours: 3, semaines: 45, regime: 'bnc', vfl: false, acre: false, frais: 1200 }, R);
assert(check.net >= 30000 && check.net < 30000 + 135, 'tjmPour');
const tr = M.calculerTreso(M.neuf().treso); assert(tr && tr.mois.length === 6);
const p = M.calculerPipeline(M.neuf().pipeline); assert(p && p.contactsNecessaires > 0);
// Import / export
const e = M.neuf(); e.reponses.t1q1 = 1; e.notes.t1 = { action: 'x', echeance: 'y', fait: true };
const back = M.importer(JSON.stringify(e), C); assert.strictEqual(back.reponses.t1q1, 1); assert(back.notes.t1.fait);
assert.throws(() => M.importer('{', C)); assert.throws(() => M.importer('{"version":9}', C));
const pr = M.progression(C, back); assert.strictEqual(pr.total, 50);

{ // ---------- v2 : devises, outils, jeu ----------
const near = (a, b, eps) => assert(Math.abs(a - b) < (eps || 0.01), `${a} ≈ ${b}`);
const tx = { USD: 1.1216, GBP: 0.8358 };
near(M.convertir(100, 'EUR', 'USD', tx), 112.16); near(M.convertir(112.16, 'USD', 'EUR', tx), 100);
near(M.convertir(100, 'GBP', 'USD', tx), 100 / 0.8358 * 1.1216); near(M.croise('USD', 'GBP', tx), 0.8358 / 1.1216, 1e-9);
const tr = M.trois(1000, tx); near(tr.USD, 1121.6); near(tr.GBP, 835.8);
const co = M.calculerCotisations({ montant: 1121.6, devise: 'USD', regime: 'bnc', vfl: true, acre: false, periode: 'mois' }, S.reperes, tx);
near(co.eur, 1000); near(co.cotisations, 256); near(co.cfp, 2); near(co.impot, 22); near(co.reste, 720); near(co.global, 28);
const big = M.calculerCotisations({ montant: 8000, devise: 'EUR', regime: 'bnc', vfl: false, acre: false, periode: 'mois' }, S.reperes, tx);
assert(big.alertes.some(a => a.includes('plafond')) && big.alertes.some(a => a.includes('TVA')));
assert.strictEqual(M.calculerCotisations({ montant: -1 }, S.reperes, tx), null);
const bu = M.calculerBudget({ ca: 2000, fraisChange: 2, lignes: [{ nom: 'a', montant: 112.16, devise: 'USD', freq: 'mois' }, { nom: 'b', montant: 1200, devise: 'EUR', freq: 'an' }] }, tx);
near(bu.mensuel, 102 + 100); near(bu.expose, 102); near(bu.sensibilite, 10.2); near(bu.part, 10.1); assert.strictEqual(bu.top.nom, 'a');
const rp = M.calculerReporting({ abonnesDebut: 1000, abonnesFin: 1100, impressions: 20000, interactions: 800, clics: 200, publications: 10, spectateursAvant: 40, spectateurs: 50, heures: 20, budgetPub: 112.16, devisePub: 'USD' }, tx);
near(rp.croissancePct, 10); near(rp.engagement, 4); near(rp.ctr, 1); near(rp.spectateursPct, 25); assert.strictEqual(rp.heuresRegardees, 1000);
near(rp.budget, 100); near(rp.cpm, 5); near(rp.cpc, 0.5); near(rp.coutAbonne, 1);
const base = M.neuf().doc;
const doc = (o) => M.calculerDocument(Object.assign(JSON.parse(JSON.stringify(base)), o), tx, S.reperes);
let d = doc({}); assert.strictEqual(d.ht, 920); assert.strictEqual(d.tva, 0); near(d.acompte, 276); assert(d.mentions.includes('TVA non applicable, art. 293 B du CGI'));
d = doc({ situation: 'tva-fr', devise: 'USD', tauxTva: 20 }); near(d.tva, 184); near(d.ttc, 1104); near(d.eur.tva, 184 / 1.1216); assert(d.etranger && d.avecTva);
d = doc({ situation: 'ue-pro' }); assert(d.mentions.includes('Autoliquidation') && d.alertes.some(a => a.includes('TVA intracommunautaire')));
d = doc({ situation: 'hors-ue-pro', devise: 'GBP' }); assert(d.mentions.includes('TVA non applicable – art. 259-1 du CGI')); near(d.eur.ttc, 920 / 0.8358);
assert.strictEqual(doc({ type: 'facture', date: '2026-11-03', delai: 30 }).echeance, '2026-12-03'); assert.strictEqual(doc({ type: 'facture' }).acompte, 0);
assert.strictEqual(M.ajouterJours('2026-02-27', 2), '2026-03-01');
assert.strictEqual(M.serie(['2026-11-01', '2026-11-02', '2026-11-03'], '2026-11-03'), 3);
assert.strictEqual(M.serie(['2026-11-01', '2026-11-02'], '2026-11-03'), 2);
assert.strictEqual(M.serie(['2026-10-30'], '2026-11-03'), 0);
assert.strictEqual(M.serie(['2026-11-01', '2026-11-03'], '2026-11-03'), 2, 'un jour de pause ne casse pas la série');
assert.strictEqual(M.serie(['2026-10-29', '2026-11-03'], '2026-11-03'), 1, 'deux jours de pause cassent la série');
const ex = M.neuf(); assert.strictEqual(M.xp(C, ex).points, 0); assert.strictEqual(M.xp(C, ex).nom, 'Viewer');
for (const q of C.lecons[0].questions) ex.reponses[q.id] = q.bonne;
ex.scenarios.raid = { meilleur: 6, parties: 1 }; ex.eclair.bonnes = 4;
assert.strictEqual(M.xp(C, ex).points, C.lecons[0].questions.length * 10 + 25 + 30 + 20);
assert.strictEqual(M.palier(5, 6).id, 'or'); assert.strictEqual(M.palier(3, 6).id, 'argent'); assert.strictEqual(M.palier(2, 6).id, 'bronze');
// Normalisation défensive des champs v2
const sale = Object.assign(M.neuf(), { theme: 'rose', outil: 'pirate', jours: ['2026-11-03', 'x', '2026-11-03'], scenarios: { raid: { meilleur: 4 }, 'BAD ID': { meilleur: 2 } },
  devises: { USD: -3, GBP: 0.9, date: '2026-11-02', source: 'BCE' }, doc: { type: 'x', devise: 'JPY', lignes: [{ desc: 'ok', qte: 'a', pu: 10 }], client: { nom: 'C', pro: 'oui' } },
  budget: { ca: 1, fraisChange: 0, lignes: [{ nom: 'n', montant: 5, devise: 'CHF', freq: 'semaine' }] } });
const pr2 = M.importer(JSON.stringify(sale), C);
assert.strictEqual(pr2.theme, null); assert.strictEqual(pr2.outil, 'devises'); assert.deepStrictEqual(pr2.jours, ['2026-11-03']);
assert.deepStrictEqual(Object.keys(pr2.scenarios), ['raid']); assert.strictEqual(pr2.devises.USD, 1.1216); assert.strictEqual(pr2.devises.GBP, 0.9);
assert.strictEqual(pr2.doc.type, 'devis'); assert.strictEqual(pr2.doc.devise, 'EUR'); assert.strictEqual(pr2.doc.lignes[0].qte, 1); assert.strictEqual(pr2.doc.client.pro, true);
assert.strictEqual(pr2.budget.lignes[0].devise, 'EUR'); assert.strictEqual(pr2.budget.lignes[0].freq, 'mois');
// Sauvegarde v1 (sans champs v2) toujours importable
const v1 = { version: 1, vue: 'accueil', etape: 'cours', question: 0, focus: false, reponses: { t1q1: 1 }, notes: {}, derniere: null };
const pv1 = M.importer(JSON.stringify(v1), C); assert.strictEqual(pv1.reponses.t1q1, 1); assert.strictEqual(pv1.doc.lignes.length, 2);
// Scénarios et ressources
const SC = require('../scenarios.js'), RS = require('../ressources.js');
assert.strictEqual(SC.length, 12); const sid = new Set();
for (const s of SC) { assert(!sid.has(s.id)); sid.add(s.id); assert(lecons.some(l => l.id === s.lecon), 'leçon scénario ' + s.id); assert.strictEqual(s.etapes.length, 3);
  for (const e of s.etapes) { assert.strictEqual(e.choix.length, 3); assert(e.choix.some(c => c[1] === 2), 'choix à 2 points ' + s.id); for (const c of e.choix) assert([0, 1, 2].includes(c[1])); } }
for (const c of RS) for (const r of c.liens) assert(/^https:\/\//.test(r.url), 'https ' + r.url);
}
console.log('OK :', lecons.length, 'leçons,', [...ids].length - lecons.length, 'questions');
