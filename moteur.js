/* Moteur du module CM : état, correction, barème, sauvegarde, simulateurs.
   Aucune dépendance, aucune requête réseau. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CMMoteur = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const CLE = 'jtipilot_formation_cm_v1';
  const VERSION = 1;
  const MAX_FICHIER = 200000;
  const SEUIL = 80;
  const texte = (v, n) => typeof v === 'string' ? v.slice(0, n || 1500) : '';
  const nombre = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;

  function neuf() {
    return {
      version: VERSION, vue: 'accueil', etape: 'cours', question: 0, focus: false,
      reponses: {}, notes: {}, derniere: null,
      revenu: { tjm: 250, jours: 3, semaines: 45, regime: 'bnc', vfl: false, acre: false, frais: 1200 },
      treso: { solde: 1500, provision: 28, depenses: 1600, ca: [2500, 900, 3200, 1800, 0, 2600] },
      pipeline: { contacts: 6, reponse: 25, rdv: 50, signature: 30, panier: 900, objectif: 3000 }
    };
  }

  function toutes(contenu) { return [...contenu.lecons, contenu.final]; }

  function valeurValide(q, v) {
    if (q.type === 'nombre') return nombre(v, -1e9, 1e9);
    if (q.type === 'multiple') return Array.isArray(v) && v.length > 0 && v.length <= q.options.length &&
      v.every(x => Number.isInteger(x) && x >= 0 && x < q.options.length) && new Set(v).size === v.length;
    return Number.isInteger(v) && v >= 0 && v < q.options.length;
  }
  function correcte(q, v) {
    if (!valeurValide(q, v)) return false;
    if (q.type === 'nombre') return Math.abs(v - q.bonne) <= (q.tolerance || 0) + 1e-9;
    if (q.type === 'multiple') return v.length === q.bonne.length && q.bonne.every(x => v.includes(x));
    return v === q.bonne;
  }
  function bilan(lecon, reponses) {
    const vals = reponses || {};
    let repondu = 0, bonnes = 0, critiques = 0;
    for (const q of lecon.questions) {
      const v = Object.prototype.hasOwnProperty.call(vals, q.id) ? vals[q.id] : undefined;
      if (!valeurValide(q, v)) continue;
      repondu++;
      if (correcte(q, v)) bonnes++;
      else if (q.critique) critiques++;
    }
    const total = lecon.questions.length, score = total ? Math.round(bonnes / total * 100) : 0, fini = repondu === total;
    return { total, repondu, bonnes, critiques, score, fini, reussi: fini && score >= SEUIL && critiques === 0 };
  }
  /* Progression par parcours et prochaine leçon conseillée (reprise TDAH-friendly). */
  function progression(contenu, etat) {
    const parcours = {};
    for (const p of contenu.parcours) parcours[p.id] = { total: 0, reussies: 0 };
    let prochaine = null, derniereReussie = null;
    for (const l of toutes(contenu)) {
      const b = bilan(l, etat.reponses);
      const p = parcours[l.parcours];
      if (p) { p.total++; if (b.reussi) p.reussies++; }
      if (b.reussi) derniereReussie = l;
      else if (!prochaine) prochaine = l;
    }
    const total = toutes(contenu).length;
    const reussies = toutes(contenu).filter(l => bilan(l, etat.reponses).reussi).length;
    return { parcours, prochaine, derniereReussie, total, reussies, reste: total - reussies };
  }

  function normaliser(obj, contenu) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj) || obj.version !== VERSION) {
      throw new Error('Format non compatible. Utilise une sauvegarde de ce module (version 1).');
    }
    const out = neuf(), lecons = toutes(contenu), ids = lecons.map(l => l.id);
    out.vue = [...ids, 'accueil', 'carnet', 'simulateurs', 'sources'].includes(obj.vue) ? obj.vue : 'accueil';
    out.etape = ['cours', 'exercice', 'ancrage'].includes(obj.etape) ? obj.etape : 'cours';
    out.question = Number.isInteger(obj.question) && obj.question >= 0 && obj.question < 10 ? obj.question : 0;
    out.focus = obj.focus === true;
    out.derniere = ids.includes(obj.derniere) ? obj.derniere : null;
    for (const l of lecons) {
      const note = obj.notes && Object.prototype.hasOwnProperty.call(obj.notes, l.id) ? obj.notes[l.id] : null;
      if (note && typeof note === 'object') out.notes[l.id] = { action: texte(note.action), echeance: texte(note.echeance, 120), fait: note.fait === true };
      for (const q of l.questions) {
        if (obj.reponses && Object.prototype.hasOwnProperty.call(obj.reponses, q.id) && valeurValide(q, obj.reponses[q.id])) {
          out.reponses[q.id] = Array.isArray(obj.reponses[q.id]) ? [...obj.reponses[q.id]] : obj.reponses[q.id];
        }
      }
    }
    if (obj.revenu && typeof obj.revenu === 'object') {
      const r = obj.revenu;
      if (nombre(r.tjm, 0, 5000)) out.revenu.tjm = r.tjm;
      if (nombre(r.jours, 0, 7)) out.revenu.jours = r.jours;
      if (nombre(r.semaines, 0, 52)) out.revenu.semaines = r.semaines;
      if (nombre(r.frais, 0, 1000000)) out.revenu.frais = r.frais;
      if (['bnc', 'bic'].includes(r.regime)) out.revenu.regime = r.regime;
      out.revenu.vfl = r.vfl === true; out.revenu.acre = r.acre === true;
    }
    if (obj.treso && typeof obj.treso === 'object') {
      const t = obj.treso;
      if (nombre(t.solde, -1000000, 1000000)) out.treso.solde = t.solde;
      if (nombre(t.provision, 0, 100)) out.treso.provision = t.provision;
      if (nombre(t.depenses, 0, 1000000)) out.treso.depenses = t.depenses;
      if (Array.isArray(t.ca) && t.ca.length === 6 && t.ca.every(n => nombre(n, 0, 1000000))) out.treso.ca = [...t.ca];
    }
    if (obj.pipeline && typeof obj.pipeline === 'object') {
      const p = obj.pipeline;
      for (const [k, max] of [['contacts', 1000], ['reponse', 100], ['rdv', 100], ['signature', 100], ['panier', 1000000], ['objectif', 1000000]]) {
        if (nombre(p[k], 0, max)) out.pipeline[k] = p[k];
      }
    }
    if (ids.includes(out.vue)) {
      const l = lecons.find(x => x.id === out.vue);
      out.question = Math.min(out.question, l.questions.length - 1);
      if (out.etape === 'ancrage' && !bilan(l, out.reponses).fini) out.etape = 'cours';
    }
    return out;
  }
  function importer(json, contenu) {
    if (typeof json !== 'string' || json.length > MAX_FICHIER) throw new Error('Le fichier dépasse la taille autorisée (200 Ko).');
    let obj;
    try { obj = JSON.parse(json); } catch (_) { throw new Error('Ce fichier ne contient pas un JSON valide. Ta progression est conservée.'); }
    return normaliser(obj, contenu);
  }

  /* Simulateur 1 : du tarif journalier au revenu net annuel (micro-entreprise).
     R = repères chiffrés issus de sources.js. */
  function calculerRevenu(r, R) {
    if (!r || !nombre(r.tjm, 0, 5000) || !nombre(r.jours, 0, 7) || !nombre(r.semaines, 0, 52) || !nombre(r.frais, 0, 1000000)) return null;
    const bnc = r.regime !== 'bic';
    const jours = r.jours * r.semaines;
    const ca = r.tjm * jours;
    let taux = bnc ? (r.acre ? R.tauxAcreBNC : R.tauxBNC) : (r.acre ? Math.round(R.tauxBIC * 0.75 * 10) / 10 : R.tauxBIC);
    const tauxCfp = bnc ? R.cfpLiberal : R.cfpCommercial;
    const tauxVfl = r.vfl ? (bnc ? R.vflBNC : R.vflBIC) : 0;
    const cotisations = ca * taux / 100, cfp = ca * tauxCfp / 100, impot = ca * tauxVfl / 100;
    const net = ca - cotisations - cfp - impot - r.frais;
    const alertes = [];
    if (ca > R.plafondServices) alertes.push(`Au-delà de ${R.plafondServices.toLocaleString('fr-FR')} €, plafond micro des services : deux années de suite et tu changes de régime.`);
    if (ca > R.tvaMajore) alertes.push(`Au-delà de ${R.tvaMajore.toLocaleString('fr-FR')} €, la TVA s’applique dès le jour du dépassement.`);
    else if (ca > R.tvaBase) alertes.push(`Entre ${R.tvaBase.toLocaleString('fr-FR')} € et ${R.tvaMajore.toLocaleString('fr-FR')} € : franchise de TVA maintenue cette année, perdue l’an prochain.`);
    if (r.acre) alertes.push('L’Acre n’est plus automatique depuis 2026 et ne concerne que les débuts d’activité : vérifie ton éligibilité.');
    return { jours, ca, taux, tauxCfp, tauxVfl, cotisations, cfp, impot, frais: r.frais, net, netMensuel: net / 12,
      prelevement: taux + tauxCfp + tauxVfl, alertes };
  }
  /* Tarif journalier nécessaire pour un net annuel voulu. */
  function tjmPour(netVoulu, r, R) {
    const base = calculerRevenu(Object.assign({}, r, { tjm: 1 }), R);
    if (!base || base.jours <= 0 || !nombre(netVoulu, 0, 10000000)) return null;
    const garde = 1 - base.prelevement / 100;
    return Math.ceil((netVoulu + r.frais) / garde / base.jours);
  }
  /* Simulateur 2 : trésorerie sur 6 mois avec provision à chaque encaissement. */
  function calculerTreso(t) {
    if (!t || !nombre(t.solde, -1000000, 1000000) || !nombre(t.provision, 0, 100) || !nombre(t.depenses, 0, 1000000) ||
      !Array.isArray(t.ca) || t.ca.length !== 6 || !t.ca.every(n => nombre(n, 0, 1000000))) return null;
    let dispo = t.solde, reserve = 0, minimum = dispo, alerte = null;
    const mois = t.ca.map((ca, i) => {
      const prov = ca * t.provision / 100;
      reserve += prov;
      dispo += ca - prov - t.depenses;
      if (dispo < minimum) minimum = dispo;
      if (alerte === null && dispo < 0) alerte = i + 1;
      return { mois: i + 1, ca, provision: prov, dispo, reserve };
    });
    const moyenne = t.ca.reduce((a, n) => a + n, 0) / 6;
    const coussin = t.depenses > 0 ? Math.max(0, dispo) / t.depenses : null;
    return { mois, minimum, alerte, reserve, final: dispo, moyenne, coussin };
  }
  /* Simulateur 3 : pipeline de prospection, du contact au chiffre d'affaires. */
  function calculerPipeline(p) {
    if (!p || ![['contacts', 1000], ['reponse', 100], ['rdv', 100], ['signature', 100], ['panier', 1000000], ['objectif', 1000000]].every(([k, m]) => nombre(p[k], 0, m))) return null;
    const semaines = 52 / 12;
    const contactsMois = p.contacts * semaines;
    const reponses = contactsMois * p.reponse / 100;
    const rdv = reponses * p.rdv / 100;
    const signatures = rdv * p.signature / 100;
    const ca = signatures * p.panier;
    const conversion = p.reponse * p.rdv * p.signature / 1e6;
    const contactsNecessaires = conversion > 0 && p.panier > 0 ? Math.ceil(p.objectif / p.panier / conversion / semaines) : null;
    return { contactsMois, reponses, rdv, signatures, ca, conversion, contactsNecessaires };
  }

  function stockage(getStorage, contenu) {
    let support = null, persistant = false, avertissement = '';
    try {
      support = getStorage();
      const raw = support.getItem(CLE);
      const etat = raw ? importer(raw, contenu) : neuf();
      persistant = true;
      return { etat, get persistant() { return persistant; }, get avertissement() { return avertissement; },
        enregistrer(v) {
          try { support.setItem(CLE, JSON.stringify(v)); return true; }
          catch (_) { persistant = false; avertissement = 'La sauvegarde locale est indisponible. Exporte ta progression avant de fermer.'; return false; }
        } };
    } catch (_) {
      avertissement = 'La sauvegarde locale est indisponible dans ce navigateur. Tu peux continuer et exporter ta progression en fichier.';
      return { etat: neuf(), persistant: false, avertissement, enregistrer() { return false; } };
    }
  }
  return { CLE, VERSION, SEUIL, MAX_FICHIER, neuf, toutes, correcte, bilan, progression, valeurValide, normaliser, importer,
    calculerRevenu, tjmPour, calculerTreso, calculerPipeline, stockage };
}));
