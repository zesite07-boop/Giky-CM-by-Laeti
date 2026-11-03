// Tests du moteur et cohérence du contenu : node tests/moteur.test.js
'use strict';
const assert = require('assert');
require('../contenu.js'); require('../contenu-apprendre.js'); require('../contenu-entrainer.js');
require('../contenu-business.js'); require('../contenu-clients.js');
const C = globalThis.CMContenu, M = require('../moteur.js'), S = require('../sources.js');
const lecons = M.toutes(C);
assert.strictEqual(C.lecons.length, 26, '26 leçons');
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
const pr = M.progression(C, back); assert.strictEqual(pr.total, 27);
console.log('OK :', lecons.length, 'leçons,', [...ids].length - lecons.length, 'questions');
