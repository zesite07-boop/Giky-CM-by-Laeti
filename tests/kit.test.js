// Tests du kit de prospection : node tests/kit.test.js
'use strict';
const assert = require('assert');
const K = require('../kit.js'), M = require('../moteur.js');
const base = M.neuf().kit;
// Toutes les combinaisons type de client x demande produisent un kit complet
for (const t of Object.keys(K.TYPES_CLIENT)) for (const d of Object.keys(K.DEMANDES)) for (const ton of ['auto', 'tu', 'vous']) {
  const g = K.genererKit(Object.assign({}, base, { typeClient: t, demande: d, ton, contact: 'Léo', chaine: 'LeoLive', moi: 'Laetitia' }));
  assert(g.message.includes('LeoLive') || t === 'marque', 'chaîne citée ' + t + d);
  assert(g.portfolio.length >= 3 && g.portfolio.length <= 5, 'pièces ' + d);
  assert.strictEqual(g.offres.length, 3); assert.strictEqual(g.suivi.length, 3);
  assert(!/undefined|NaN|\{chaine\}/.test(g.message + JSON.stringify(g.offres) + g.suivi.map(s => s.texte).join('')), 'pas de trou ' + t + d);
}
// Ton automatique : tutoiement pour un petit streamer, vouvoiement pour une marque
assert.strictEqual(K.ton({ typeClient: 'streamer-petit', ton: 'auto' }), 'tu');
assert.strictEqual(K.ton({ typeClient: 'marque', ton: 'auto' }), 'vous');
assert.strictEqual(K.ton({ typeClient: 'marque', ton: 'tu' }), 'tu');
// Mentions
assert(K.genererKit(base).mentions.includes('293 B'));
assert(K.genererKit(Object.assign({}, base, { tva: 'tva' })).mentions.includes('TVA de 20 %'));
// Dates de relance
assert.deepStrictEqual(K.datesSuivi('2026-11-08').map(d => d.date), ['2026-11-11', '2026-11-15', '2026-11-22']);
assert.strictEqual(K.relanceDue('2026-11-08', 0, 'envoye', '2026-11-10').due, false);
assert.strictEqual(K.relanceDue('2026-11-08', 0, 'envoye', '2026-11-11').due, true);
assert.strictEqual(K.relanceDue('2026-11-08', 0, 'envoye', '2026-11-12').retard, true);
assert.strictEqual(K.relanceDue('2026-11-08', 1, 'relance', '2026-11-12').due, false);
assert.strictEqual(K.relanceDue('2026-11-08', 3, 'relance', '2026-12-30'), null);
assert.strictEqual(K.relanceDue('2026-11-08', 0, 'signe', '2026-12-30'), null);
// Sauvegarde : kit et suivi validés à l'import
require('../contenu.js'); require('../contenu-apprendre.js'); require('../contenu-entrainer.js');
require('../contenu-business.js'); require('../contenu-clients.js'); require('../contenu-bonus.js'); require('../contenu-reseaux.js');
require('../contenu-calculs.js'); require('../contenu-expert.js'); require('../contenu-expert-2.js');
const e = M.neuf(); e.kit.typeClient = 'marque'; e.kits = [{ id: 'k1', date: '2026-11-08', client: 'Studio X', contact: 'A', typeClient: 'marque', demande: 'audit', statut: 'relance', faites: 2 }];
const n = M.normaliser(JSON.parse(JSON.stringify(e)), globalThis.CMContenu);
assert.strictEqual(n.kit.typeClient, 'marque'); assert.strictEqual(n.kits.length, 1); assert.strictEqual(n.kits[0].faites, 2);
const mauvais = JSON.parse(JSON.stringify(e)); mauvais.kit.typeClient = 'x'; mauvais.kit.offre1 = -5; mauvais.kits = [{ id: '!!', date: 'x' }, { id: 'k2', date: '2026-11-08', statut: 'hack', faites: 99, typeClient: 'zz', demande: 'zz' }];
const m = M.normaliser(mauvais, globalThis.CMContenu);
assert.strictEqual(m.kit.typeClient, 'streamer-moyen'); assert.strictEqual(m.kit.offre1, 350); assert.strictEqual(m.kits.length, 1);
assert.strictEqual(m.kits[0].statut, 'envoye'); assert.strictEqual(m.kits[0].faites, 0); assert.strictEqual(m.kits[0].typeClient, 'streamer-moyen');
// Une ancienne sauvegarde sans kit reste importable
const vieux = JSON.parse(JSON.stringify(M.neuf())); delete vieux.kit; delete vieux.kits;
const v = M.normaliser(vieux, globalThis.CMContenu); assert(Array.isArray(v.kits) && v.kit.typeClient);
console.log('OK kit');
