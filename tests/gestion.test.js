// Tests de gestion.js et de la normalisation des nouveaux champs : node tests/gestion.test.js
'use strict';
const assert = require('assert');
require('../contenu.js'); require('../contenu-apprendre.js'); require('../contenu-entrainer.js');
require('../contenu-business.js'); require('../contenu-clients.js'); require('../contenu-bonus.js');
const C = globalThis.CMContenu, M = require('../moteur.js'), G = require('../gestion.js'), R = require('../sources.js').reperes;
const near = (a, b, e) => assert(Math.abs(a - b) < (e || 0.01), `${a} ≈ ${b}`);
const rec = (o) => Object.assign({ id: 'r' + Math.random().toString(36).slice(2, 8), num: '', date: '2026-03-01', client: 'A', desc: 'x', montant: 100, devise: 'EUR', taux: 1, statut: 'paye', datePaiement: '2026-03-02', mode: 'virement' }, o);

// Numérotation continue
let rs = [rec({ num: 'F-2026-001' }), rec({ num: 'F-2026-002' }), rec({ num: 'F-2025-009' })];
assert.strictEqual(G.numeroSuivant(rs, 2026), 'F-2026-003'); assert.strictEqual(G.numeroSuivant([], 2026), 'F-2026-001');
assert.strictEqual(G.numeroSuivant(rs, 2025), 'F-2025-010');
rs = [rec({ num: 'F-2026-001' }), rec({ num: 'F-2026-004' })];
assert.deepStrictEqual(G.trous(rs, 2026), ['F-2026-002', 'F-2026-003']);
assert.deepStrictEqual(G.doublons([rec({ num: 'F-1' }), rec({ num: 'F-1' }), rec({ num: '' }), rec({ num: '' })]), ['F-1']);

// Totaux : encaissé par année de paiement, devises converties
rs = [rec({ montant: 1000 }), rec({ montant: 1121.6, devise: 'USD', taux: 1.1216 }), rec({ statut: 'attente', datePaiement: '', montant: 500 }),
  rec({ montant: 300, date: '2025-12-20', datePaiement: '2026-01-05' }), rec({ montant: 900, date: '2025-11-02', datePaiement: '2025-11-05' })];
const t = G.totauxRecettes(rs, 2026); near(t.encaisse, 2300); near(t.attente, 500); assert.strictEqual(t.nbPaye, 3);

// CSV : BOM, ; , virgule décimale, injection neutralisée, guillemets
const csv = G.csvRecettes([rec({ num: 'F-2026-001', client: '=HYPERLINK("x")', desc: 'a;b "c"', montant: 12.5 })]);
assert(csv.startsWith('﻿Date de paiement;'), 'BOM'); assert(csv.includes('12,5')); assert(G.csvRecettes([rec({ devise: 'USD', taux: 1.1216 })]).includes('1,1216'));
assert(G.echeances(2026, { periodicite: 'mois', cfe: false }).some(x => x.titre.includes('d’avril') && true) && G.echeances(2026, { periodicite: 'mois', cfe: false }).some(x => x.titre.includes('de mars'))); assert(csv.includes("'=HYPERLINK") && !csv.includes(';=HYPERLINK'), 'injection');
assert(csv.includes('"a;b ""c"""')); assert(csv.endsWith('\r\n'));

// Plafonds
let p = G.plafonds([rec({ montant: 42000 })], 2026, '2026-12-31', { anterieur: 0, caN1: 0 }, R);
assert.strictEqual(p.seuils[1].niveau, 'depasse'); assert.strictEqual(p.seuils[2].niveau, 'depasse'); assert.strictEqual(p.seuils[0].niveau, 'ok');
assert(p.alertes.some(a => a.includes('dès le jour')));
p = G.plafonds([rec({ montant: 38000 })], 2026, '2026-12-31', { anterieur: 0, caN1: 0 }, R);
assert.strictEqual(p.seuils[2].niveau, 'alerte'); assert.strictEqual(p.seuils[1].niveau, 'depasse'); assert(p.alertes.some(a => a.includes('1er janvier')));
p = G.plafonds([rec({ montant: 10000, datePaiement: '2026-03-31' })], 2026, '2026-03-31', { anterieur: 5000, caN1: 40000 }, R);
near(p.ca, 15000); assert(p.alertes.some(a => a.includes('l’an dernier'))); assert(p.projection > 15000);
const pj = p.seuils[0]; assert(typeof pj.projectionDepasse === 'boolean');
assert.strictEqual(G.niveau(69), 'ok'); assert.strictEqual(G.niveau(70), 'vigilance'); assert.strictEqual(G.niveau(90), 'alerte'); assert.strictEqual(G.niveau(100), 'depasse');

// Échéances
let e = G.echeances(2026, { periodicite: 'mois', cfe: true });
assert.strictEqual(e.filter(x => x.type === 'urssaf').length, 12);
assert.strictEqual(e.find(x => x.id === 'urssaf-2026-2').date, '2026-02-28'); assert.strictEqual(e.find(x => x.id === 'urssaf-2026-12').date, '2026-12-31');
assert(e.find(x => x.id === 'cfe-2026').date === '2026-12-15' && !e.find(x => x.id === 'cfe-2026').fixe);
e = G.echeances(2028, { periodicite: 'trimestre', cfe: false });
assert.deepStrictEqual(e.filter(x => x.type === 'urssaf').map(x => x.date), ['2028-01-31', '2028-04-30', '2028-07-31', '2028-10-31']);
assert.strictEqual(G.finDeMois(2028, 2), '2028-02-29');
assert(!e.some(x => x.type === 'cfe'));
const e26 = G.echeances(2026, { periodicite: 'trimestre', cfe: true });
assert.strictEqual(G.prochaines(e26, '2026-11-04')[0].date >= '2026-11-04', true);
const cal = G.exportIcs(e26, '2026-11-04T10:00:00.000Z');
assert(cal.startsWith('BEGIN:VCALENDAR\r\n') && cal.endsWith('END:VCALENDAR\r\n'));
assert.strictEqual((cal.match(/BEGIN:VEVENT/g) || []).length, e26.filter(x => x.date).length);
assert(!/DTSTART;VALUE=DATE:null/.test(cal)); assert(cal.includes('DTSTAMP:20261104T100000Z'));
assert(cal.split('\r\n').every(l => l.length <= 75), 'lignes pliées');
assert(G.lienGoogleAgenda(e26[0]).startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE'));
assert.strictEqual(G.lienGoogleAgenda({ date: null }), null);

// Révision espacée
const rev = {};
G.apresReponse(rev, 'q1', false, '2026-11-04', false); assert.deepStrictEqual(rev.q1, { boite: 1, due: '2026-11-05' });
assert.deepStrictEqual(G.aReviser(rev, '2026-11-04'), []); assert.deepStrictEqual(G.aReviser(rev, '2026-11-05'), ['q1']);
G.apresReponse(rev, 'q1', true, '2026-11-05', true); assert.deepStrictEqual(rev.q1, { boite: 2, due: '2026-11-08' });
G.apresReponse(rev, 'q1', true, '2026-11-06', false); assert.strictEqual(rev.q1.boite, 2, 'bonne réponse hors échéance : pas de montée');
G.apresReponse(rev, 'q1', true, '2026-11-08', true); G.apresReponse(rev, 'q1', true, '2026-11-15', true); G.apresReponse(rev, 'q1', true, '2026-12-01', true);
assert.deepStrictEqual(rev.q1, { boite: 5, due: '2027-01-05' }); G.apresReponse(rev, 'q1', true, '2027-01-05', true);
assert.deepStrictEqual(rev.q1, { boite: 6, due: G.LOIN }); assert.deepStrictEqual(G.aReviser(rev, '2099-01-01'), []);
G.apresReponse(rev, 'q1', false, '2027-02-01', true); assert.deepStrictEqual(rev.q1, { boite: 1, due: '2027-02-01' });
const q = C.lecons[0].questions[0], mauvaise = q.type === 'nombre' ? q.bonne + 9999 : (q.type === 'multiple' ? [0] : (q.bonne + 1) % q.options.length);
const rv2 = {}; const n = G.amorcer(rv2, { [q.id]: mauvaise }, [{ q }], M.correcte, '2026-11-04');
assert.strictEqual(n, M.correcte(q, mauvaise) ? 0 : 1);
const st = G.statsRevision({ a: { boite: 1, due: '2026-11-01' }, b: { boite: 6, due: G.LOIN }, c: { boite: 3, due: '2026-12-01' } }, '2026-11-04');
assert.strictEqual(st.dues, 1); assert.strictEqual(st.maitrisees, 1); assert.strictEqual(st.prochaine, '2026-12-01');

// Planning
assert.strictEqual(G.lundi('2026-11-04'), '2026-11-02'); assert.strictEqual(G.lundi('2026-11-08'), '2026-11-02'); assert.strictEqual(G.lundi('2026-11-02'), '2026-11-02');
const pl = [{ id: 'a', date: '2026-11-03', heure: '20:00', client: 'Lou', type: 'live', titre: 'Live', fait: true }, { id: 'b', date: '2026-11-04', heure: '', client: 'Lou', type: 'clip', titre: 'Clip', fait: false },
  { id: 'c', date: '2026-11-09', heure: '', client: 'Lou', type: 'post', titre: 'Hors semaine', fait: false }, { id: 'd', date: '2026-11-05', heure: '', client: 'Max', type: 'post', titre: 'Post', fait: false }];
let w = G.semaine(pl, '2026-11-02'); assert.strictEqual(w.total, 3); assert.strictEqual(w.parClient.Lou.live, 1); assert.strictEqual(w.parClient.Lou.clip, 1); assert.strictEqual(w.parClient.Max.post, 1); assert.strictEqual(w.fait, 1);
w = G.semaine(pl, '2026-11-02', 'Max'); assert.strictEqual(w.total, 1); assert.strictEqual(w.jours.length, 7);
assert.deepStrictEqual(G.clientsConnus(pl, [{ client: 'Zed' }]), ['Lou', 'Max', 'Zed']);

// Contrat et CGV
const d = M.neuf().contrat;
let txt = G.contrat(Object.assign({}, d, { client: { nom: 'PixelNord', adresse: 'Lille', representant: 'Lou' } }), R, '2026-11-04');
for (const m of ['CONTRAT DE PRESTATION', 'PixelNord', 'obligation de moyens', 'CESSION DES DROITS', 'DROIT À L’IMAGE', 'ARTICLE 1 —', 'ARTICLE 8 —', 'indemnité forfaitaire de 40 €', 'art. 293 B', '4 novembre 2026', 'durée de 5 ans']) assert(txt.includes(m), 'contrat contient ' + m);
txt = G.contrat(Object.assign({}, d, { cession: false, droitImage: false, devise: 'USD' }), R, '2026-11-04');
assert(!txt.includes('CESSION') && !txt.includes('IMAGE') && txt.includes('contre-valeur en euros'));
assert(/ARTICLE 7 —/.test(txt) && !/ARTICLE 8 —/.test(txt), 'numérotation continue sans cession');
const cg = G.cgv(d, R); for (const m of ['CONDITIONS GÉNÉRALES', '40 €', 'obligation de moyens', 'Droit français']) assert(cg.includes(m));

// Facture électronique
assert.deepStrictEqual(G.EFACT_IDS, Object.keys(M.neuf().efact.coches)); assert.strictEqual(new Set(G.EFACT_IDS).size, G.EFACT_IDS.length);
const ne = M.neuf(); ne.efact.coches.cible = true; ne.efact.choix[1] = { nom: 'Plateforme B', p: true, d: true, r: false, x: true, s: true }; ne.efact.choix[0].nom = 'A'; ne.efact.choix[0].p = true;
const av = G.avancementEfact(ne.efact); assert.strictEqual(av.faits, 1); assert.strictEqual(av.meilleur.nom, 'Plateforme B'); assert.strictEqual(av.meilleur.score, 4);

// Intégration : export / import aller-retour et nettoyage
const s = M.neuf();
s.recettes = [rec({ id: 'ok1', num: 'F-2026-001' })]; s.planning = [pl[0]]; s.revision = { [q.id]: { boite: 2, due: '2026-11-08' } };
s.plafonds.anterieur = 1234; s.echeances.periodicite = 'trimestre'; s.contrat.prix = 900; s.contrat.client.nom = 'Zed'; s.efact.coches.liste = true;
const back = M.importer(JSON.stringify(s), C);
assert.strictEqual(back.recettes.length, 1); assert.strictEqual(back.recettes[0].num, 'F-2026-001'); assert.strictEqual(back.planning.length, 1);
assert.deepStrictEqual(back.revision[q.id], { boite: 2, due: '2026-11-08' }); assert.strictEqual(back.plafonds.anterieur, 1234); assert.strictEqual(back.echeances.periodicite, 'trimestre');
assert.strictEqual(back.contrat.prix, 900); assert.strictEqual(back.contrat.client.nom, 'Zed'); assert.strictEqual(back.efact.coches.liste, true);
const sale = M.neuf();
sale.recettes = [rec({ id: 'x y' }), rec({ id: 'ok', montant: -5 }), rec({ id: 'ok2', date: 'hier' }), rec({ id: 'dup' }), rec({ id: 'dup' }), rec({ id: 'ok3', devise: 'JPY', mode: 'troc', statut: 'zz' }), null, 5];
sale.planning = [{ id: 'p1', date: '2026-02-30x' }, { id: 'p2', date: '2026-11-04', type: 'zz', heure: '25h', fait: 'oui', titre: 'a'.repeat(999) }];
sale.revision = { inconnue: { boite: 2, due: '2026-11-08' }, [q.id]: { boite: 99, due: '2026-11-08' } };
sale.outil = 'recettes'; sale.contrat.devise = 'JPY'; sale.contrat.debut = 'bientôt'; sale.contrat.duree = -4; sale.efact.choix = 'non';
const b2 = M.importer(JSON.stringify(sale), C);
assert.deepStrictEqual(b2.recettes.map(r => r.id), ['dup', 'ok3']); assert.strictEqual(b2.recettes[1].devise, 'EUR'); assert.strictEqual(b2.recettes[1].mode, 'virement'); assert.strictEqual(b2.recettes[1].statut, 'attente');
assert.deepStrictEqual(b2.planning.map(x => x.id), ['p2']); assert.strictEqual(b2.planning[0].type, 'post'); assert.strictEqual(b2.planning[0].heure, ''); assert.strictEqual(b2.planning[0].fait, false); assert.strictEqual(b2.planning[0].titre.length, 120);
assert.deepStrictEqual(b2.revision, {}); assert.strictEqual(b2.outil, 'recettes'); assert.strictEqual(b2.contrat.devise, 'EUR'); assert.strictEqual(b2.contrat.debut, M.neuf().contrat.debut); assert.strictEqual(b2.contrat.duree, M.neuf().contrat.duree);
assert.strictEqual(b2.efact.choix.length, 3);
// Une sauvegarde de l'ancienne version (sans les nouveaux champs) reste importable
const ancien = M.neuf(); for (const k of ['recettes', 'planning', 'revision', 'plafonds', 'echeances', 'contrat', 'efact']) delete ancien[k];
const b3 = M.importer(JSON.stringify(ancien), C); assert.deepStrictEqual(b3.recettes, []); assert.strictEqual(b3.efact.choix.length, 3);
// Taille : 1 500 recettes + 1 500 éléments de planning tiennent dans la limite
const gros = M.neuf(); gros.recettes = Array.from({ length: 1500 }, (_, i) => rec({ id: 'r' + i, num: 'F-2026-' + String(i + 1).padStart(3, '0'), client: 'Client ' + i, desc: 'Prestation de community management du mois' }));
gros.planning = Array.from({ length: 1500 }, (_, i) => ({ id: 'p' + i, date: '2026-11-04', heure: '10:00', client: 'Client ' + i, type: 'live', titre: 'Live numéro ' + i, fait: false }));
const js = JSON.stringify(M.normaliser(gros, C), null, 2); assert(js.length < M.MAX_FICHIER, 'export < limite : ' + js.length);
assert.strictEqual(M.importer(js, C).recettes.length, 1500);
// Boîte à idées
const si = M.neuf(); si.idees = [{ id: 'a1', titre: 'Idée <b>', lien: 'https://tiktok.com/x', note: 'n', statut: 'en-cours', date: '2026-11-04', source: 'partage' },
  { id: 'a2', titre: '', lien: 'javascript:alert(1)' }, { id: 'a3', titre: 'Sans lien', lien: 'ftp://x', statut: 'zz', source: 'zz', date: 'x' }, { id: 'a1', titre: 'doublon' }, { id: 'bad id', titre: 'x' }, null];
const bi = M.importer(JSON.stringify(si), C);
assert.deepStrictEqual(bi.idees.map(x => x.id), ['a1', 'a3']); assert.strictEqual(bi.idees[0].statut, 'en-cours'); assert.strictEqual(bi.idees[1].lien, ''); assert.strictEqual(bi.idees[1].statut, 'a-faire'); assert.strictEqual(bi.idees[1].source, 'manuel'); assert.strictEqual(bi.idees[1].date, '');
assert.deepStrictEqual(M.importer(JSON.stringify(Object.assign(M.neuf(), { vue: 'veille' })), C).vue, 'veille');
console.log('OK gestion');

/* v5 : alertes d'échéances et nouveaux champs d'état */
{
  const liste = [
    { id: 'a', date: '2026-11-08', titre: 'jour', fixe: true }, { id: 'b', date: '2026-11-10', titre: 'proche', fixe: true },
    { id: 'c', date: '2026-11-14', titre: 'semaine', fixe: true }, { id: 'd', date: '2026-11-20', titre: 'loin', fixe: true },
    { id: 'e', date: '2026-11-05', titre: 'retard', fixe: true }, { id: 'f', date: '2026-10-01', titre: 'trop ancien', fixe: true }, { id: 'i', date: '2026-10-31', titre: 'passee', fixe: true },
    { id: 'g', date: null, titre: 'sans date', fixe: false }, { id: 'h', date: '2026-11-09', titre: 'faite', fixe: true },
  ];
  const al = G.alertes(liste, ['h'], '2026-11-08');
  assert.deepStrictEqual(al.map(x => x.id), ['i', 'e', 'a', 'b', 'c']);
  assert.deepStrictEqual(al.map(x => x.niveau), ['passee', 'retard', 'jour', 'proche', 'a-venir']);
  assert.deepStrictEqual(al.map(x => x.delai), [-8, -3, 0, 2, 6]);
  assert.deepStrictEqual(G.alertes(liste, undefined, '2026-11-08').length, 6);
  const n = M.normaliser({ version: 1, echeancesFaites: ['urssaf-2026-10', 'a b', 5, 'urssaf-2026-10', '<x>'], suggestions: [{ id: 's1', date: '2026-11-08', type: 'zzz', texte: '  ', envoye: true }, { id: 's2', date: 'nimporte', type: 'probleme', texte: 'Bug <b>x</b>', envoye: 1 }, { id: 's2', texte: 'doublon' }] }, C);
  assert.deepStrictEqual(n.echeancesFaites, ['urssaf-2026-10']);
  assert.strictEqual(n.suggestions.length, 1);
  assert.deepStrictEqual(n.suggestions[0], { id: 's2', date: '', type: 'probleme', texte: 'Bug <b>x</b>', envoye: false });
  assert.deepStrictEqual(M.normaliser({ version: 1 }, C).suggestions, []);
  console.log('OK alertes');
}
