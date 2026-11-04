/* Gestion : livre des recettes, plafonds, échéances, révision espacée, planning, contrat et CGV, facture électronique.
   Fonctions pures, sans dépendance ni réseau. Les données viennent de l'état (moteur.js). */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CMGestion = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  const ajouter = (iso, j) => { const d = new Date(iso + 'T12:00:00Z'); if (isNaN(d)) return null; d.setUTCDate(d.getUTCDate() + j); return d.toISOString().slice(0, 10); };
  const finDeMois = (annee, mois) => new Date(Date.UTC(annee, mois, 0, 12)).toISOString().slice(0, 10); // mois 1..12
  const arrondi = n => Math.round(n * 100) / 100;

  /* ---------- Livre des recettes ---------- */
  const MODES = ['virement', 'carte', 'paypal', 'stripe', 'cheque', 'especes', 'autre'];
  const MODES_NOMS = { virement: 'Virement', carte: 'Carte', paypal: 'PayPal', stripe: 'Stripe', cheque: 'Chèque', especes: 'Espèces', autre: 'Autre' };
  const eur = r => r.taux > 0 ? r.montant / r.taux : 0;
  function trier(recettes) {
    return recettes.slice().sort((a, b) => (a.date + a.num).localeCompare(b.date + b.num));
  }
  /* Numérotation continue : F-AAAA-001, 002… sans trou. */
  function numeroSuivant(recettes, annee, prefixe) {
    const p = prefixe || 'F', re = new RegExp('^' + p + '-' + annee + '-(\\d+)$');
    let max = 0;
    for (const r of recettes) { const m = re.exec(r.num || ''); if (m) max = Math.max(max, Number(m[1])); }
    return `${p}-${annee}-${String(max + 1).padStart(3, '0')}`;
  }
  function trous(recettes, annee, prefixe) {
    const p = prefixe || 'F', re = new RegExp('^' + p + '-' + annee + '-(\\d+)$'), vus = new Set();
    for (const r of recettes) { const m = re.exec(r.num || ''); if (m) vus.add(Number(m[1])); }
    const max = Math.max(0, ...vus), manquants = [];
    for (let i = 1; i < max; i++) if (!vus.has(i)) manquants.push(`${p}-${annee}-${String(i).padStart(3, '0')}`);
    return manquants;
  }
  function doublons(recettes) {
    const vus = new Set(), d = new Set();
    for (const r of recettes) { if (!r.num) continue; if (vus.has(r.num)) d.add(r.num); vus.add(r.num); }
    return [...d];
  }
  function totauxRecettes(recettes, annee) {
    let encaisse = 0, attente = 0, nbPaye = 0, nbAttente = 0;
    for (const r of recettes) {
      if (r.statut === 'paye') { if ((r.datePaiement || r.date).slice(0, 4) === String(annee)) { encaisse += eur(r); nbPaye++; } }
      else if (r.date.slice(0, 4) === String(annee)) { attente += eur(r); nbAttente++; }
    }
    return { encaisse: arrondi(encaisse), attente: arrondi(attente), nbPaye, nbAttente };
  }
  const neutre = v => { const s = String(v == null ? '' : v); return /^[=+\-@\t\r]/.test(s) ? "'" + s : s; };
  const cell = v => { const s = neutre(v); return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const dec = n => String(arrondi(n)).replace('.', ',');
  const dec4 = n => String(Math.round(n * 10000) / 10000).replace('.', ',');
  /* CSV lisible par Excel en français : séparateur « ; », virgule décimale, BOM UTF-8. */
  function csvRecettes(recettes) {
    const tete = ['Date de paiement', 'Numéro', 'Date de la facture', 'Client', 'Désignation', 'Montant HT', 'Devise', 'Taux (1 € =)', 'Montant HT en euros', 'Statut', 'Mode de règlement'];
    const lignes = trier(recettes).map(r => [r.statut === 'paye' ? r.datePaiement : '', r.num, r.date, r.client, r.desc, dec(r.montant), r.devise, dec4(r.taux), dec(eur(r)),
      r.statut === 'paye' ? 'Payé' : 'En attente', MODES_NOMS[r.mode] || r.mode].map(cell).join(';'));
    return '\ufeff' + [tete.map(cell).join(';')].concat(lignes).join('\r\n') + '\r\n';
  }

  /* ---------- Plafonds et seuils ---------- */
  function niveau(pct) { return pct >= 100 ? 'depasse' : pct >= 90 ? 'alerte' : pct >= 70 ? 'vigilance' : 'ok'; }
  const NIVEAUX_NOMS = { ok: 'Tout va bien', vigilance: 'À surveiller', alerte: 'Proche du seuil', depasse: 'Seuil dépassé' };
  function plafonds(recettes, annee, aujourdhui, p, R) {
    const t = totauxRecettes(recettes, annee);
    const ca = t.encaisse + (p.anterieur || 0);
    const debut = annee + '-01-01', ecoules = Math.max(1, Math.round((new Date(aujourdhui + 'T12:00:00Z') - new Date(debut + 'T12:00:00Z')) / 864e5) + 1);
    const fin = ecoules >= 365;
    const projection = fin ? ca : ca / ecoules * 365;
    const seuils = [
      { id: 'micro', nom: 'Plafond micro-entreprise (services)', valeur: R.plafondServices,
        info: 'Dépassé deux années de suite, tu sors du régime micro. Dépassé une seule année, il reste en vigueur l’année suivante.' },
      { id: 'tva', nom: 'Franchise de TVA : seuil de base', valeur: R.tvaBase,
        info: 'Dépassé : la franchise est maintenue jusqu’à la fin de l’année, perdue au 1er janvier suivant (si le seuil majoré n’est pas franchi).' },
      { id: 'tvaMaj', nom: 'Franchise de TVA : seuil majoré', valeur: R.tvaMajore,
        info: 'Dépassé : la TVA s’applique dès le jour du dépassement. Facture alors avec TVA à partir de ce jour.' }
    ].map(s => {
      const pct = ca / s.valeur * 100, reste = s.valeur - ca;
      let jour = null;
      if (!fin && reste > 0 && projection > s.valeur && ca > 0) jour = ajouter(debut, Math.round(s.valeur / (ca / ecoules)) - 1);
      return Object.assign(s, { pct, reste, niveau: niveau(pct), projectionDepasse: projection > s.valeur, jour });
    });
    const alertes = [];
    if (ca > R.tvaMajore) alertes.push(`Tu as dépassé ${fmt(R.tvaMajore)} € : la TVA s’applique dès le jour du dépassement.`);
    else if (ca > R.tvaBase) alertes.push(`Tu as dépassé ${fmt(R.tvaBase)} € : la franchise de TVA est perdue au 1er janvier suivant. Au-delà de ${fmt(R.tvaMajore)} €, elle est perdue tout de suite.`);
    if ((p.caN1 || 0) > R.tvaBase) alertes.push(`Ton chiffre d’affaires de l’an dernier (${fmt(p.caN1)} €) dépasse ${fmt(R.tvaBase)} € : vérifie si tu dois déjà facturer la TVA cette année.`);
    if (ca > R.plafondServices) alertes.push(`Tu as dépassé ${fmt(R.plafondServices)} € : parle à l’Urssaf ou à un comptable sans attendre.`);
    if (projection > R.tvaBase && ca <= R.tvaBase && !fin) alertes.push(`À ce rythme, tu atteindras environ ${fmt(Math.round(projection))} € sur l’année : tu franchirais le seuil de TVA de base.`);
    return { ca, encaisse: t.encaisse, attente: t.attente, projection, ecoules, seuils, alertes, plusHaut: seuils.reduce((a, s) => s.pct > a.pct ? s : a, seuils[0]) };
  }
  function fmt(n) { return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n); }

  /* ---------- Échéances ---------- */
  /* Les dates « fixe » sont des règles stables ; les autres dépendent de l'année ou de ton avis : à vérifier. */
  function echeances(annee, profil) {
    const liste = [];
    const trimestriel = profil.periodicite === 'trimestre';
    if (trimestriel) {
      [[annee, 1, 'T4', annee - 1], [annee, 4, 'T1', annee], [annee, 7, 'T2', annee], [annee, 10, 'T3', annee]].forEach(([a, m, t, aa]) => {
        liste.push({ id: `urssaf-${a}-${m}`, date: finDeMois(a, m), titre: `Urssaf : déclarer le chiffre d’affaires du ${t} ${aa}`, detail: 'Déclaration sur autoentrepreneur.urssaf.fr, même à 0 €. Le paiement des cotisations suit la même date.', type: 'urssaf', fixe: true });
      });
    } else {
      const noms = ['décembre', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre'];
      const de = n => (/^[aeiouhéèàâô]/i.test(n) ? 'd’' : 'de ') + n;
      for (let m = 1; m <= 12; m++) {
        liste.push({ id: `urssaf-${annee}-${m}`, date: finDeMois(annee, m), titre: `Urssaf : déclarer le chiffre d’affaires ${de(noms[m - 1])}${m === 1 ? ' ' + (annee - 1) : ''}`, detail: 'Déclaration sur autoentrepreneur.urssaf.fr, même à 0 €. Le paiement des cotisations suit la même date.', type: 'urssaf', fixe: true });
      }
    }
    if (profil.cfe) liste.push({ id: `cfe-${annee}`, date: `${annee}-12-15`, titre: 'CFE : date limite de paiement (en général)', detail: 'L’avis arrive en fin d’automne sur impots.gouv.fr (espace professionnel). Vérifie la date exacte sur ton avis. Provisionne-la chaque mois.', type: 'cfe', fixe: false });
    liste.push({ id: `impot-${annee}`, date: null, titre: 'Déclaration de revenus (impôt sur le revenu)', detail: 'Au printemps : la date change chaque année. Reporte ton chiffre d’affaires annuel dans la case micro-BNC ou micro-BIC.', type: 'impots', fixe: false });
    liste.push({ id: `bilan-${annee}`, date: `${annee}-12-31`, titre: 'Fin d’année : vérifier ton livre des recettes et tes plafonds', detail: 'Numérotation sans trou, factures payées pointées, chiffre d’affaires annuel comparé aux seuils.', type: 'autre', fixe: true });
    if (annee <= 2026) liste.push({ id: 'efact-recep', date: '2026-09-01', titre: 'Facture électronique : réception obligatoire pour tous', detail: 'Tu dois pouvoir recevoir les factures de tes fournisseurs via une plateforme agréée.', type: 'autre', fixe: true });
    if (annee <= 2027) liste.push({ id: 'efact-emis', date: '2027-09-01', titre: 'Facture électronique : émission obligatoire pour les micro-entreprises', detail: 'À partir de cette date, tu émets tes factures vers les clients professionnels français via une plateforme agréée.', type: 'autre', fixe: true });
    return liste.filter(e => e.date === null || e.date.slice(0, 4) === String(annee) || e.id.startsWith('efact')).sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
  }
  function prochaines(liste, aujourdhui) {
    return liste.filter(e => e.date && e.date >= aujourdhui);
  }
  const ics = v => String(v).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  function plier(ligne) {
    const out = []; let s = ligne;
    while (s.length > 74) { out.push(s.slice(0, 74)); s = ' ' + s.slice(74); }
    out.push(s); return out;
  }
  const compact = iso => iso.replace(/-/g, '');
  /* Fichier .ics importable dans Google Agenda, Apple Calendrier, Outlook. */
  function exportIcs(evenements, maintenant) {
    const stamp = (maintenant || new Date().toISOString()).replace(/[-:]/g, '').replace(/\.\d+/, '').slice(0, 15) + 'Z';
    const lignes = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JTIpilot//Module CM//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Échéances CM freelance'];
    for (const e of evenements) {
      if (!e.date) continue;
      lignes.push('BEGIN:VEVENT', `UID:${e.id}@jtipilot-cm`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${compact(e.date)}`, `DTEND;VALUE=DATE:${compact(ajouter(e.date, 1))}`,
        `SUMMARY:${ics(e.titre)}`, `DESCRIPTION:${ics(e.detail + (e.fixe ? '' : ' (Date indicative : à vérifier.)'))}`,
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${ics(e.titre)}`, 'TRIGGER:-P3D', 'END:VALARM', 'END:VEVENT');
    }
    lignes.push('END:VCALENDAR');
    return lignes.flatMap(plier).join('\r\n') + '\r\n';
  }
  function lienGoogleAgenda(e) {
    if (!e.date) return null;
    const q = new URLSearchParams({ action: 'TEMPLATE', text: e.titre, dates: `${compact(e.date)}/${compact(ajouter(e.date, 1))}`, details: e.detail });
    return 'https://calendar.google.com/calendar/render?' + q.toString();
  }

  /* ---------- Révision espacée (boîtes de Leitner) ---------- */
  const INTERVALLES = [1, 3, 7, 16, 35];
  const MAITRISEE = 6, LOIN = '9999-12-31';
  /* Après une réponse. En révision, une bonne réponse fait monter d'une boîte ; ailleurs, seulement si la question était due. */
  function apresReponse(rev, qid, ok, aujourdhui, enRevision) {
    const e = rev[qid];
    if (!ok) { rev[qid] = { boite: 1, due: enRevision ? aujourdhui : ajouter(aujourdhui, 1) }; return rev[qid]; }
    if (!e || e.boite >= MAITRISEE) return e || null;
    if (!enRevision && e.due > aujourdhui) return e;
    const b = e.boite + 1;
    rev[qid] = b >= MAITRISEE ? { boite: MAITRISEE, due: LOIN } : { boite: b, due: ajouter(aujourdhui, INTERVALLES[b - 1]) };
    return rev[qid];
  }
  /* Ajoute à la révision les questions déjà ratées dans les leçons. */
  function amorcer(rev, reponses, ids, correcte, aujourdhui) {
    let n = 0;
    for (const { q } of ids) {
      if (!Object.prototype.hasOwnProperty.call(reponses, q.id) || rev[q.id]) continue;
      if (!correcte(q, reponses[q.id])) { rev[q.id] = { boite: 1, due: aujourdhui }; n++; }
    }
    return n;
  }
  function aReviser(rev, aujourdhui) {
    return Object.keys(rev).filter(id => rev[id].due <= aujourdhui).sort((a, b) => rev[a].due.localeCompare(rev[b].due) || rev[a].boite - rev[b].boite);
  }
  function statsRevision(rev, aujourdhui) {
    const ids = Object.keys(rev), boites = [0, 0, 0, 0, 0, 0];
    ids.forEach(id => { boites[rev[id].boite - 1]++; });
    const prochaine = ids.filter(id => rev[id].due > aujourdhui && rev[id].due !== LOIN).map(id => rev[id].due).sort()[0] || null;
    return { total: ids.length, dues: aReviser(rev, aujourdhui).length, maitrisees: boites[5], boites, prochaine };
  }

  /* ---------- Planning éditorial ---------- */
  const TYPES_PLANNING = { live: 'Live', clip: 'Clip', post: 'Post', autre: 'Autre' };
  function lundi(iso) {
    const d = new Date(iso + 'T12:00:00Z'); const jour = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - jour); return d.toISOString().slice(0, 10);
  }
  function semaine(items, debut, client) {
    const jours = []; for (let i = 0; i < 7; i++) jours.push(ajouter(debut, i));
    const choisis = items.filter(x => jours.includes(x.date) && (!client || x.client === client))
      .sort((a, b) => (a.date + (a.heure || '99:99') + a.titre).localeCompare(b.date + (b.heure || '99:99') + b.titre));
    const parClient = {};
    for (const x of choisis) {
      const c = parClient[x.client || 'Sans client'] = parClient[x.client || 'Sans client'] || { live: 0, clip: 0, post: 0, autre: 0, fait: 0, total: 0 };
      c[x.type]++; c.total++; if (x.fait) c.fait++;
    }
    return { jours: jours.map(j => ({ date: j, items: choisis.filter(x => x.date === j) })), parClient, total: choisis.length, fait: choisis.filter(x => x.fait).length };
  }
  function clientsConnus(planning, recettes) {
    return [...new Set(planning.map(x => x.client).concat(recettes.map(r => r.client)).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  }

  /* ---------- Contrat et CGV ---------- */
  function datefr(iso) { const d = new Date(iso + 'T12:00:00Z'); return isNaN(d) ? '…' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); }
  const ou = (v, d) => (v && String(v).trim()) || d;
  const SYMB = { EUR: '€', USD: '$', GBP: '£' };
  const montant = (v, dev) => `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v)} ${SYMB[dev] || dev}`;
  function contrat(c, R, aujourdhui) {
    const p = c.prestataire, k = c.client, a = [];
    const n = () => a.filter(x => /^ARTICLE/.test(x)).length + 1;
    a.push('CONTRAT DE PRESTATION DE SERVICES');
    a.push(`Community management — ${ou(k.nom, 'Client')}`);
    a.push('');
    a.push('ENTRE LES SOUSSIGNÉS');
    a.push(`${ou(p.nom, '[Ton nom]')}, entrepreneur individuel (EI), SIRET ${ou(p.siret, '[SIRET]')}, domicilié(e) ${ou(p.adresse, '[adresse]')}, ${ou(p.email, '[e-mail]')}, ci-après « le Prestataire »,`);
    a.push(`ET ${ou(k.nom, '[Nom du client]')}, ${ou(k.adresse, '[adresse du client]')}${k.representant ? `, représenté(e) par ${k.representant}` : ''}, ci-après « le Client ».`);
    a.push('');
    a.push(`ARTICLE ${n()} — OBJET`);
    a.push(`Le Prestataire réalise pour le Client les missions suivantes : ${ou(c.prestation, '[décris précisément les missions : animation du chat, modération, clips, publications, planning…]')}.`);
    a.push('Le Prestataire est tenu à une obligation de moyens. Il ne garantit pas un nombre d’abonnés, de spectateurs, de vues ou un revenu précis, qui dépendent de nombreux facteurs hors de son contrôle.');
    a.push('');
    a.push(`ARTICLE ${n()} — DURÉE`);
    a.push(`Le contrat prend effet le ${datefr(c.debut)} pour ${c.duree > 0 ? `une durée de ${c.duree} mois` : 'une durée indéterminée'}. Il peut être résilié par chacune des parties avec un préavis de ${c.preavis} jours, notifié par écrit (e-mail avec accusé de réception suffisant). Les missions réalisées jusqu’à la fin du préavis restent dues.`);
    a.push('');
    a.push(`ARTICLE ${n()} — PRIX ET PAIEMENT`);
    a.push(`Prix : ${montant(c.prix, c.devise)} HT ${c.modalite === 'mois' ? 'par mois' : c.modalite === 'mission' ? 'par mission' : 'au forfait'}. ${c.tva === 'franchise' ? 'TVA non applicable, art. 293 B du CGI.' : c.tva === 'tva' ? 'La TVA est ajoutée au taux en vigueur.' : 'TVA selon la situation du Client (autoliquidation ou non-application), précisée sur chaque facture.'}`);
    if (c.devise !== 'EUR') a.push(`Les factures sont libellées en ${c.devise}. Elles indiquent la contre-valeur en euros au taux de référence de la Banque centrale européenne à la date de facturation.`);
    if (c.acompte > 0) a.push(`Un acompte de ${c.acompte} % est dû à la signature. Le travail démarre à sa réception.`);
    a.push(`Les factures sont payables sous ${c.delai} jours à compter de leur date d’émission, par virement. En cas de retard, des pénalités sont dues au taux de ${ou(c.penalites, 'trois fois le taux d’intérêt légal')}, ainsi qu’une indemnité forfaitaire de ${R.indemniteRetard} € pour frais de recouvrement (client professionnel). Le Prestataire peut suspendre ses missions après une mise en demeure restée sans effet.`);
    a.push('');
    if (c.cession) {
      a.push(`ARTICLE ${n()} — CESSION DES DROITS D’AUTEUR`);
      a.push(`Les contenus créés par le Prestataire pour le Client (${ou(c.cessionObjet, 'clips, montages, visuels, textes de publications')}) sont protégés par le droit d’auteur. Le Prestataire cède au Client, à titre ${c.cessionPrix ? 'gratuit, le prix du présent contrat incluant cette cession' : 'exclusif'} et sous réserve du paiement intégral du prix :`);
      a.push(`• le droit de reproduction et le droit de représentation, sur ${ou(c.cessionSupports, 'les réseaux sociaux, les plateformes de diffusion en direct et le site du Client')} ;`);
      a.push(`• pour le territoire suivant : ${ou(c.cessionTerritoire, 'le monde entier')} ;`);
      a.push(`• pour une durée de ${ou(c.cessionDuree, '5 ans')} à compter de la livraison de chaque contenu.`);
      a.push('Toute autre exploitation (publicité payante par une marque tierce, revente, édition) nécessite un accord écrit préalable. Le Prestataire conserve le droit de présenter ces réalisations dans son portfolio, sauf opposition motivée du Client. Le Prestataire reste titulaire des droits sur ses modèles, méthodes et outils préexistants.');
      a.push('');
    }
    if (c.droitImage) {
      a.push(`ARTICLE ${n()} — DROIT À L’IMAGE`);
      a.push(`Le Client déclare avoir obtenu l’autorisation écrite des personnes identifiables apparaissant dans les contenus qu’il fournit (lui-même, invités, modérateurs, spectateurs filmés ou entendus) pour la captation, le montage et la diffusion de leur image et de leur voix, sur ${ou(c.cessionSupports, 'les supports prévus à l’article précédent')}, pendant ${ou(c.cessionDuree, '5 ans')}. Il garantit le Prestataire contre toute réclamation d’un tiers sur ce fondement. Le Prestataire ne diffuse ni ne conserve d’image ou de voix d’une personne qui a retiré son autorisation et respecte les demandes de retrait.`);
      a.push('');
    }
    a.push(`ARTICLE ${n()} — ACCÈS ET CONFIDENTIALITÉ`);
    a.push('Le Client donne au Prestataire les accès strictement nécessaires (rôle de modérateur, accès aux outils de planification, aux statistiques). Il peut les retirer à tout moment. Aucun mot de passe principal n’est partagé : le Prestataire utilise des accès délégués. Chaque partie garde confidentielles les informations non publiques de l’autre.');
    a.push('');
    a.push(`ARTICLE ${n()} — RESPECT DES RÈGLES DES PLATEFORMES`);
    a.push('Le Prestataire applique les règles de la communauté de chaque plateforme. Le Client reste responsable des contenus qu’il diffuse. Si une publicité ou un partenariat est présenté, les mentions de collaboration commerciale obligatoires sont indiquées.');
    a.push('');
    a.push(`ARTICLE ${n()} — DONNÉES PERSONNELLES`);
    a.push('Chaque partie traite les données personnelles (pseudos, messages, e-mails) uniquement pour la mission, conformément au RGPD, et les supprime ou les restitue à la fin du contrat.');
    a.push('');
    a.push(`ARTICLE ${n()} — LOI APPLICABLE`);
    a.push(`Le contrat est soumis au droit français. Les parties cherchent d’abord une solution amiable. À défaut, les tribunaux de ${ou(c.ville, '[ville]')} sont compétents.`);
    a.push('');
    a.push(`Fait à ${ou(c.ville, '[ville]')}, le ${datefr(aujourdhui)}, en deux exemplaires.`);
    a.push('');
    a.push('Le Prestataire (« Lu et approuvé »)            Le Client (« Lu et approuvé »)');
    return a.join('\n');
  }
  function cgv(c, R) {
    const p = c.prestataire, a = [];
    a.push('CONDITIONS GÉNÉRALES DE VENTE');
    a.push(`${ou(p.nom, '[Ton nom]')}, entrepreneur individuel (EI) — SIRET ${ou(p.siret, '[SIRET]')} — ${ou(p.email, '[e-mail]')}`);
    a.push('');
    a.push('1. Champ d’application');
    a.push('Ces conditions s’appliquent à toute prestation de community management et de création de contenus vendue par le Prestataire à un client professionnel. Elles prévalent sur les conditions d’achat du client, sauf accord écrit.');
    a.push('2. Devis et commande');
    a.push('Toute prestation fait l’objet d’un devis gratuit. La commande est ferme à la signature du devis (« Bon pour accord ») et au paiement de l’acompte indiqué.');
    a.push('3. Prix');
    a.push(`Les prix sont en ${c.devise} hors taxes. ${c.tva === 'franchise' ? 'TVA non applicable, art. 293 B du CGI.' : 'La TVA éventuelle est ajoutée selon la situation du client.'} Toute demande hors du périmètre du devis fait l’objet d’un avenant.`);
    a.push('4. Paiement');
    a.push(`Paiement par virement sous ${c.delai} jours à compter de la date de facture. Pénalités de retard au taux de ${ou(c.penalites, 'trois fois le taux d’intérêt légal')} dès le lendemain de l’échéance, plus une indemnité forfaitaire de ${R.indemniteRetard} € pour frais de recouvrement. Pas d’escompte pour paiement anticipé.`);
    a.push('5. Exécution et livraison');
    a.push('Les délais sont indicatifs. Le client fournit à temps les contenus, accès et validations nécessaires ; les retards de sa part décalent d’autant les livraisons. Deux séries de retours sont incluses ; les suivantes sont facturées.');
    a.push('6. Annulation et résiliation');
    a.push(`Annulation par le client : l’acompte reste acquis, et le travail déjà réalisé est dû. Résiliation d’un contrat en cours avec un préavis de ${c.preavis} jours par écrit.`);
    a.push('7. Propriété intellectuelle');
    a.push(`Le Prestataire reste titulaire des droits sur ses créations jusqu’au paiement intégral. ${c.cession ? `Il cède ensuite au client les droits de reproduction et de représentation sur ${ou(c.cessionSupports, 'les supports convenus')}, pour ${ou(c.cessionTerritoire, 'le monde entier')} et ${ou(c.cessionDuree, '5 ans')}, comme précisé au devis ou au contrat.` : 'Toute cession de droits fait l’objet d’une clause écrite précisant les droits cédés, leur étendue, leur destination, le lieu et la durée.'}`);
    a.push('8. Droit à l’image');
    a.push('Le client garantit disposer des autorisations des personnes apparaissant dans les contenus qu’il fournit.');
    a.push('9. Responsabilité');
    a.push('Le Prestataire est tenu à une obligation de moyens. Il ne garantit aucun résultat chiffré (abonnés, vues, revenus) et n’est pas responsable des décisions des plateformes (modération, suspension, algorithme).');
    a.push('10. Données personnelles');
    a.push('Les données sont traitées uniquement pour la prestation, conformément au RGPD. Le client peut demander leur accès, rectification ou suppression à l’adresse ci-dessus.');
    a.push('11. Droit applicable et litiges');
    a.push(`Droit français. Recherche d’une solution amiable d’abord ; à défaut, tribunaux de ${ou(c.ville, '[ville]')}.`);
    return a.join('\n');
  }

  /* ---------- Facture électronique ---------- */
  const CHECKLIST = [
    ['cible', 'Comprendre le calendrier : réception obligatoire pour tous depuis le 1er septembre 2026, émission obligatoire pour les micro-entreprises le 1er septembre 2027.'],
    ['liste', 'Ouvrir la liste officielle des plateformes agréées sur impots.gouv.fr (page « facturation électronique »).'],
    ['clients', 'Lister mes clients : pros en France (facture électronique), clients à l’étranger ou particuliers (e-reporting, pas de facture électronique).'],
    ['criteres', 'Comparer 2 ou 3 plateformes avec la grille de choix ci-dessous.'],
    ['essai', 'Tester la plateforme choisie gratuitement avec une vraie facture d’essai.'],
    ['compte', 'Ouvrir mon compte, vérifier mon SIRET et mes coordonnées, et récupérer mon adresse de réception.'],
    ['annuaire', 'Vérifier que mon adresse de réception est bien rattachée à la plateforme choisie (annuaire central).'],
    ['clients-info', 'Prévenir mes clients professionnels français de ma nouvelle adresse de réception et des nouvelles factures.'],
    ['numerotation', 'Garder ma numérotation continue : la plateforme reprend la suite de mes numéros, sans trou.'],
    ['export', 'Vérifier que je peux exporter mes factures et mes données si je change de plateforme.'],
    ['archivage', 'Prévoir la conservation de mes factures pendant 10 ans (copie dans la plateforme et sauvegarde chez moi).'],
    ['recettes', 'Continuer à tenir mon livre des recettes (il reste obligatoire, la plateforme ne le remplace pas).']
  ];
  const CRITERES = [['p', 'Prix clair (gratuit ou abonnement fixe)'], ['d', 'Factures en dollars et en livres'], ['r', 'E-reporting inclus (clients étrangers, particuliers)'], ['x', 'Export de mes données'], ['s', 'Support en français']];
  const EFACT_IDS = CHECKLIST.map(c => c[0]);
  function avancementEfact(ef) {
    const faits = EFACT_IDS.filter(id => ef.coches[id]).length;
    const scores = ef.choix.map(c => ({ nom: c.nom, score: CRITERES.filter(([k]) => c[k]).length }));
    const meilleur = scores.filter(s => s.nom).sort((a, b) => b.score - a.score)[0] || null;
    return { faits, total: EFACT_IDS.length, scores, meilleur };
  }

  return { ajouter, finDeMois, MODES, MODES_NOMS, eur, trier, numeroSuivant, trous, doublons, totauxRecettes, csvRecettes,
    plafonds, niveau, NIVEAUX_NOMS, echeances, prochaines, exportIcs, lienGoogleAgenda,
    INTERVALLES, MAITRISEE, LOIN, apresReponse, amorcer, aReviser, statsRevision,
    TYPES_PLANNING, lundi, semaine, clientsConnus, contrat, cgv, CHECKLIST, CRITERES, EFACT_IDS, avancementEfact };
}));
