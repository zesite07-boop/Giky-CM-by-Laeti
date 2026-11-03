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

  const DEVISES = ['EUR', 'USD', 'GBP'];
  const OUTILS = ['devises', 'cotis', 'revenu', 'treso', 'pipeline', 'budget', 'reporting', 'doc'];
  const SITUATIONS = ['franchise', 'tva-fr', 'ue-pro', 'hors-ue-pro'];
  function defauts() {
    return {
      devises: { USD: 1.1216, GBP: 0.8358, date: '2026-11-02', source: 'BCE' },
      cotis: { montant: 3000, devise: 'EUR', regime: 'bnc', vfl: false, acre: false, periode: 'mois' },
      budget: { ca: 3000, fraisChange: 0, lignes: [
        { nom: 'Outil de planification', montant: 22, devise: 'USD', freq: 'mois' },
        { nom: 'Logiciel de création graphique', montant: 12, devise: 'EUR', freq: 'mois' },
        { nom: 'Banque d’images et de musiques', montant: 120, devise: 'USD', freq: 'an' },
        { nom: 'Assurance RC pro', montant: 180, devise: 'EUR', freq: 'an' },
        { nom: 'CFE (provision)', montant: 300, devise: 'EUR', freq: 'an' },
        { nom: 'Forfait téléphone et internet (part pro)', montant: 20, devise: 'EUR', freq: 'mois' }
      ] },
      reporting: { client: 'Chaîne de Lou', mois: 'Octobre 2026', abonnesDebut: 1200, abonnesFin: 1410, impressions: 48000, interactions: 1900,
        clics: 620, publications: 24, spectateursAvant: 38, spectateurs: 45, heures: 36, budgetPub: 150, devisePub: 'EUR', decision: '' },
      doc: { type: 'devis', numero: 'D-2026-001', date: '2026-11-03', delai: 30, devise: 'EUR', situation: 'franchise', tauxTva: 20, acompte: 30,
        emetteur: { nom: '', siret: '', adresse: '', email: '' },
        client: { nom: '', adresse: '', tva: '', pro: true },
        lignes: [{ desc: 'Animation du serveur Discord (1 mois)', qte: 1, pu: 600 }, { desc: 'Clips verticaux sous-titrés', qte: 8, pu: 40 }],
        penalites: 'trois fois le taux d’intérêt légal', notes: '' }
    };
  }
  function neuf() {
    return Object.assign({
      version: VERSION, vue: 'accueil', etape: 'cours', question: 0, focus: false,
      reponses: {}, notes: {}, derniere: null,
      theme: null, aere: false, energie: null, jours: [], outil: 'devises',
      scenarios: {}, eclair: { meilleur: 0, parties: 0, bonnes: 0 },
      revenu: { tjm: 250, jours: 3, semaines: 45, regime: 'bnc', vfl: false, acre: false, frais: 1200 },
      treso: { solde: 1500, provision: 28, depenses: 1600, ca: [2500, 900, 3200, 1800, 0, 2600] },
      pipeline: { contacts: 6, reponse: 25, rdv: 50, signature: 30, panier: 900, objectif: 3000 }
    }, defauts());
  }
  const clone = v => JSON.parse(JSON.stringify(v));
  /* Fusion défensive : ne garde que les clés connues, avec le bon type. */
  function fusion(def, src) {
    if (!src || typeof src !== 'object' || Array.isArray(src)) return clone(def);
    const out = {};
    for (const k of Object.keys(def)) {
      const d = def[k], v = src[k];
      if (typeof d === 'number') out[k] = nombre(v, -1e9, 1e9) ? v : d;
      else if (typeof d === 'string') out[k] = typeof v === 'string' ? v.slice(0, 600) : d;
      else if (typeof d === 'boolean') out[k] = typeof v === 'boolean' ? v : d;
      else if (Array.isArray(d)) out[k] = Array.isArray(v) ? v.slice(0, 30).map(x => fusion(d[0], x)) : clone(d);
      else if (d && typeof d === 'object') out[k] = fusion(d, v);
    }
    return out;
  }
  const enumere = (v, liste, def) => liste.includes(v) ? v : def;

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
    out.vue = [...ids, 'accueil', 'carnet', 'simulateurs', 'sources', 'scenarios', 'eclair', 'ressources'].includes(obj.vue) ? obj.vue : 'accueil';
    out.etape = ['cours', 'exercice', 'ancrage'].includes(obj.etape) ? obj.etape : 'cours';
    out.question = Number.isInteger(obj.question) && obj.question >= 0 && obj.question < 20 ? obj.question : 0;
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
    /* Champs v2 (facultatifs : une sauvegarde v1 reste importable). */
    out.theme = enumere(obj.theme, ['clair', 'sombre'], null);
    out.aere = obj.aere === true;
    out.energie = enumere(obj.energie, ['basse', 'moyenne', 'haute'], null);
    out.outil = enumere(obj.outil, OUTILS, 'devises');
    if (Array.isArray(obj.jours)) out.jours = [...new Set(obj.jours.filter(j => typeof j === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(j)))].sort().slice(-400);
    if (obj.scenarios && typeof obj.scenarios === 'object' && !Array.isArray(obj.scenarios)) {
      for (const [k, v] of Object.entries(obj.scenarios).slice(0, 60)) {
        if (/^[a-z0-9-]{1,30}$/.test(k) && v && typeof v === 'object' && nombre(v.meilleur, 0, 100)) out.scenarios[k] = { meilleur: Math.round(v.meilleur), parties: nombre(v.parties, 0, 1e6) ? Math.round(v.parties) : 1 };
      }
    }
    if (obj.eclair && typeof obj.eclair === 'object') for (const k of ['meilleur', 'parties', 'bonnes']) if (nombre(obj.eclair[k], 0, 1e6)) out.eclair[k] = Math.round(obj.eclair[k]);
    const d = defauts();
    out.devises = fusion(d.devises, obj.devises);
    for (const c of DEVISES.slice(1)) if (!nombre(out.devises[c], 0.0001, 10000)) out.devises[c] = d.devises[c];
    out.cotis = fusion(d.cotis, obj.cotis);
    out.cotis.devise = enumere(out.cotis.devise, DEVISES, 'EUR'); out.cotis.regime = enumere(out.cotis.regime, ['bnc', 'bic'], 'bnc');
    out.cotis.periode = enumere(out.cotis.periode, ['mois', 'trimestre'], 'mois');
    if (!nombre(out.cotis.montant, 0, 1e7)) out.cotis.montant = d.cotis.montant;
    out.budget = fusion(d.budget, obj.budget);
    out.budget.lignes.forEach(l => { l.devise = enumere(l.devise, DEVISES, 'EUR'); l.freq = enumere(l.freq, ['mois', 'an'], 'mois'); if (!nombre(l.montant, 0, 1e7)) l.montant = 0; l.nom = l.nom.slice(0, 120); });
    out.reporting = fusion(d.reporting, obj.reporting);
    out.reporting.devisePub = enumere(out.reporting.devisePub, DEVISES, 'EUR');
    out.doc = fusion(d.doc, obj.doc);
    out.doc.type = enumere(out.doc.type, ['devis', 'facture'], 'devis'); out.doc.devise = enumere(out.doc.devise, DEVISES, 'EUR');
    out.doc.situation = enumere(out.doc.situation, SITUATIONS, 'franchise');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(out.doc.date)) out.doc.date = d.doc.date;
    out.doc.lignes.forEach(l => { l.desc = l.desc.slice(0, 300); if (!nombre(l.qte, 0, 1e6)) l.qte = 0; if (!nombre(l.pu, 0, 1e8)) l.pu = 0; });
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
    const taux = tauxCotis(r.regime, r.acre, R);
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

  /* ---------- Devises : taux = unités de devise pour 1 € (convention BCE) ---------- */
  function tauxDe(t, c) { return c === 'EUR' ? 1 : t[c]; }
  function convertir(m, de, vers, t) { return m / tauxDe(t, de) * tauxDe(t, vers); }
  function enEuros(m, de, t) { return convertir(m, de, 'EUR', t); }
  function trois(eur, t) { return { EUR: eur, USD: eur * t.USD, GBP: eur * t.GBP }; }
  /* Taux croisé, ex. 1 $ = x £ */
  function croise(de, vers, t) { return tauxDe(t, vers) / tauxDe(t, de); }

  function tauxCotis(regime, acre, R) {
    const bnc = regime !== 'bic';
    return bnc ? (acre ? R.tauxAcreBNC : R.tauxBNC) : (acre ? Math.round(R.tauxBIC * 0.75 * 10) / 10 : R.tauxBIC);
  }
  /* Outil cotisations : un encaissement (en €, $ ou £) → ce que tu paies à l'Urssaf, en euros. */
  function calculerCotisations(c, R, t) {
    if (!c || !nombre(c.montant, 0, 1e7)) return null;
    const bnc = c.regime !== 'bic';
    const eur = enEuros(c.montant, c.devise, t);
    const taux = tauxCotis(c.regime, c.acre, R), tauxCfp = bnc ? R.cfpLiberal : R.cfpCommercial, tauxVfl = c.vfl ? (bnc ? R.vflBNC : R.vflBIC) : 0;
    const cotisations = eur * taux / 100, cfp = eur * tauxCfp / 100, impot = eur * tauxVfl / 100;
    const total = cotisations + cfp + impot, reste = eur - total;
    const annuel = eur * (c.periode === 'trimestre' ? 4 : 12);
    const alertes = [];
    if (annuel > R.plafondServices) alertes.push(`À ce rythme (${Math.round(annuel).toLocaleString('fr-FR')} € par an), tu dépasses le plafond micro de ${R.plafondServices.toLocaleString('fr-FR')} €.`);
    if (annuel > R.tvaMajore) alertes.push(`À ce rythme, tu dépasses le seuil majoré de franchise de TVA (${R.tvaMajore.toLocaleString('fr-FR')} €) : la TVA s’applique dès le jour du dépassement.`);
    else if (annuel > R.tvaBase) alertes.push(`À ce rythme, tu dépasses ${R.tvaBase.toLocaleString('fr-FR')} € : surveille la franchise de TVA.`);
    if (c.acre) alertes.push('L’Acre n’est plus automatique depuis 2026 et ne concerne que les débuts d’activité : vérifie ton éligibilité.');
    return { eur, taux, tauxCfp, tauxVfl, cotisations, cfp, impot, total, reste, annuel, global: taux + tauxCfp + tauxVfl, alertes };
  }
  /* Outil budget : tout ramené en mensuel et en euros, avec l'exposition au change. */
  function calculerBudget(b, t) {
    if (!b || !Array.isArray(b.lignes) || !nombre(b.ca, 0, 1e8) || !nombre(b.fraisChange, 0, 100)) return null;
    const lignes = b.lignes.map(l => {
      const base = enEuros(nombre(l.montant, 0, 1e7) ? l.montant : 0, l.devise, t);
      const frais = l.devise !== 'EUR' ? base * b.fraisChange / 100 : 0;
      const parMois = (base + frais) / (l.freq === 'an' ? 12 : 1);
      return Object.assign({}, l, { parMois, parAn: parMois * 12 });
    });
    const mensuel = lignes.reduce((a, l) => a + l.parMois, 0);
    const expose = lignes.filter(l => l.devise !== 'EUR').reduce((a, l) => a + l.parMois, 0);
    const top = lignes.slice().sort((a, z) => z.parMois - a.parMois)[0] || null;
    return { lignes, mensuel, annuel: mensuel * 12, part: b.ca > 0 ? mensuel / b.ca * 100 : null, expose, sensibilite: expose * 0.1, top };
  }
  /* Outil reporting : indicateurs du mois pour le client. */
  function calculerReporting(r, t) {
    if (!r) return null;
    const n = k => nombre(r[k], 0, 1e10) ? r[k] : 0;
    const croissance = n('abonnesFin') - n('abonnesDebut');
    const budget = enEuros(n('budgetPub'), r.devisePub, t);
    return {
      croissance, croissancePct: n('abonnesDebut') > 0 ? croissance / n('abonnesDebut') * 100 : null,
      engagement: n('impressions') > 0 ? n('interactions') / n('impressions') * 100 : null,
      ctr: n('impressions') > 0 ? n('clics') / n('impressions') * 100 : null,
      spectateursPct: n('spectateursAvant') > 0 ? (n('spectateurs') - n('spectateursAvant')) / n('spectateursAvant') * 100 : null,
      heuresRegardees: n('spectateurs') * n('heures'),
      interactionsParPost: n('publications') > 0 ? n('interactions') / n('publications') : null,
      budget, cpm: n('impressions') > 0 && budget > 0 ? budget / n('impressions') * 1000 : null,
      cpc: n('clics') > 0 && budget > 0 ? budget / n('clics') : null,
      coutAbonne: croissance > 0 && budget > 0 ? budget / croissance : null
    };
  }
  function ajouterJours(iso, j) {
    const d = new Date(iso + 'T12:00:00Z'); if (isNaN(d)) return null;
    d.setUTCDate(d.getUTCDate() + j); return d.toISOString().slice(0, 10);
  }
  /* Outil devis / facture : totaux, contre-valeurs et mentions selon la situation du client. */
  function calculerDocument(d, t, R) {
    if (!d || !Array.isArray(d.lignes)) return null;
    const lignes = d.lignes.map(l => Object.assign({}, l, { total: (nombre(l.qte, 0, 1e6) ? l.qte : 0) * (nombre(l.pu, 0, 1e8) ? l.pu : 0) }));
    const ht = lignes.reduce((a, l) => a + l.total, 0);
    const avecTva = d.situation === 'tva-fr';
    const tva = avecTva ? ht * (nombre(d.tauxTva, 0, 100) ? d.tauxTva : R.tvaNormal) / 100 : 0;
    const ttc = ht + tva;
    const acompte = d.type === 'devis' && nombre(d.acompte, 0, 100) ? ttc * d.acompte / 100 : 0;
    const echeance = ajouterJours(d.date, nombre(d.delai, 0, 365) ? d.delai : 30);
    const mentions = [], alertes = [];
    if (d.situation === 'franchise') mentions.push('TVA non applicable, art. 293 B du CGI');
    if (d.situation === 'ue-pro') { mentions.push('Autoliquidation'); if (!d.client.tva) alertes.push('Client pro dans l’UE : ajoute son numéro de TVA intracommunautaire (et le tien).'); }
    if (d.situation === 'hors-ue-pro') mentions.push('TVA non applicable – art. 259-1 du CGI');
    if ((d.situation === 'ue-pro' || d.situation === 'hors-ue-pro') && !d.client.pro) alertes.push('Ces mentions visent un client professionnel. Pour un particulier à l’étranger, les règles diffèrent : vérifie sur impots.gouv.fr.');
    if (!d.emetteur.nom) alertes.push('Ajoute ton nom (suivi de la mention EI).');
    if (!d.emetteur.siret) alertes.push('Ajoute ton numéro SIREN ou SIRET.');
    if (!d.client.nom) alertes.push('Ajoute le nom du client.');
    if (!lignes.some(l => l.desc && l.total > 0)) alertes.push('Ajoute au moins une ligne avec une désignation et un prix.');
    return { lignes, ht, tva, ttc, acompte, echeance, mentions, alertes, avecTva,
      eur: { ht: enEuros(ht, d.devise, t), tva: enEuros(tva, d.devise, t), ttc: enEuros(ttc, d.devise, t) },
      etranger: d.devise !== 'EUR' };
  }

  /* ---------- Jeu : XP, niveaux, série de jours ---------- */
  const NIVEAUX = [[0, 'Viewer'], [150, 'Follower'], [400, 'Abonnée'], [800, 'VIP'], [1300, 'Modo'], [1900, 'Partenaire'], [2600, 'Légende']];
  function xp(contenu, etat) {
    let points = 0;
    for (const l of toutes(contenu)) {
      for (const q of l.questions) if (Object.prototype.hasOwnProperty.call(etat.reponses, q.id) && correcte(q, etat.reponses[q.id])) points += 10;
      if (bilan(l, etat.reponses).reussi) points += 25;
    }
    for (const k of Object.keys(etat.scenarios || {})) points += 5 * (etat.scenarios[k].meilleur || 0);
    points += 5 * Math.min((etat.eclair && etat.eclair.bonnes) || 0, 200);
    let i = 0; while (i < NIVEAUX.length - 1 && points >= NIVEAUX[i + 1][0]) i++;
    const suivant = NIVEAUX[i + 1] || null;
    const pct = suivant ? Math.round((points - NIVEAUX[i][0]) / (suivant[0] - NIVEAUX[i][0]) * 100) : 100;
    return { points, niveau: i + 1, nom: NIVEAUX[i][1], suivant: suivant ? { seuil: suivant[0], nom: suivant[1], reste: suivant[0] - points } : null, pct };
  }
  function serie(jours, aujourdhui) {
    const set = new Set(jours || []);
    let n = 0, j = aujourdhui;
    if (!set.has(j)) j = ajouterJours(j, -1);
    while (j && set.has(j)) { n++; j = ajouterJours(j, -1); }
    return n;
  }
  /* Score d'un scénario → palier. */
  function palier(points, max) {
    const p = max ? points / max : 0;
    return p >= 0.8 ? { id: 'or', nom: 'Victoire parfaite' } : p >= 0.5 ? { id: 'argent', nom: 'Mission réussie' } : { id: 'bronze', nom: 'Game over… on rejoue ?' };
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
    calculerRevenu, tjmPour, calculerTreso, calculerPipeline, stockage,
    DEVISES, OUTILS, convertir, enEuros, trois, croise, calculerCotisations, calculerBudget, calculerReporting, calculerDocument, ajouterJours,
    NIVEAUX, xp, serie, palier, tauxCotis };
}));
