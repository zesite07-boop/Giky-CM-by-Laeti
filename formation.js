/* Interface du module CM freelance. Rendu par chaînes, délégation d'événements.
   Seule requête réseau possible : le bouton « Actualiser les taux BCE », à la demande. */
(function () {
  'use strict';
  const C = window.CMContenu, M = window.CMMoteur, S = window.CMSources, R = S.reperes;
  const SC = window.CMScenarios || [], RS = window.CMRessources || [], G = window.CMGestion, PC = window.CMPourcent;
  const depot = M.stockage(() => window.localStorage, C);
  let etat = depot.etat, drafts = {}, dernierFocus = null;
  let combo = 0, eclair = null, jeu = null, conv = { montant: 500, devise: 'USD' }, sprint = null, toastTimer = null;
  const toutes = M.toutes(C);
  const NIV = C.niveaux, niveauDe = l => C.niveauDe(l);
  let niveauEclair = 0;
  if (!etat.debut) etat.debut = new Date().toLocaleDateString('sv-SE');
  let reglagesOuvert = false;
  let pf = {}, revision = null, semaineDebut = G.lundi(new Date().toLocaleDateString('sv-SE')), installPrompt = null, sansXp = false;
  const $ = s => document.querySelector(s);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SYMB = { EUR: '€', USD: '$', GBP: '£' }, NOMS = { EUR: 'euros', USD: 'dollars US', GBP: 'livres sterling' };
  const fmtCache = {};
  const argent = (v, c, d) => {
    const k = (c || 'EUR') + (d == null ? 0 : d);
    fmtCache[k] = fmtCache[k] || new Intl.NumberFormat('fr-FR', { style: 'currency', currency: c || 'EUR', currencyDisplay: 'narrowSymbol', minimumFractionDigits: d || 0, maximumFractionDigits: d == null ? 0 : d });
    return fmtCache[k].format(v);
  };
  const euro = v => argent(v, 'EUR');
  const nb = (v, d) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: d == null ? 1 : d }).format(v);
  const dateFr = iso => { if (!iso) return '—'; const d = new Date(iso + 'T12:00:00Z'); return isNaN(d) ? iso : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); };
  const aujourdhui = () => new Date().toLocaleDateString('sv-SE');
  const getLecon = () => toutes.find(l => l.id === etat.vue);
  const qActuelle = () => { const l = getLecon(); return l && l.questions[etat.question]; };
  const repondu = q => Object.prototype.hasOwnProperty.call(etat.reponses, q.id);
  const parcoursDe = l => C.parcours.find(p => p.id === l.parcours);
  const T = () => etat.devises;
  const IC = {
    jeu: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v5M4.5 12.5h5M16 11h.01M18.5 14h.01"/>',
    eclair: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    revision: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>',
    veille: '<path d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14"/><circle cx="6" cy="18" r="1.5"/>',
    outils: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    etoile: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    flamme: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
    reglages: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    accueil: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    livre: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/>',
    fleche: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  const icone = (n, t) => `<svg aria-hidden="true" width="${t || 24}" height="${t || 24}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;

  /* Un montant en euros affiché dans les trois devises, la devise choisie mise en avant. */
  function triplet(eur, choisie, d) {
    const v = M.trois(eur, T());
    return `<span class="triplet">${M.DEVISES.map(c => `<span class="puce-devise ${c === (choisie || 'EUR') ? 'choisie' : ''}"><abbr title="${NOMS[c]}">${c}</abbr> ${argent(v[c], c, d)}</span>`).join('')}</span>`;
  }
  function ligneTriple(libelle, eur, choisie, classe, signe, principale) {
    const p = principale || choisie || 'EUR';
    return `<div class="calcul-ligne ${classe || ''}"><span>${libelle}</span><strong>${signe || ''}${argent(M.convertir(eur, 'EUR', p, T()), p)}</strong></div><div class="ligne-devises">${triplet(eur, choisie)}</div>`;
  }

  /* Largeurs des jauges appliquées via le CSSOM (la politique de sécurité interdit les styles en ligne). */
  function largeurs(racine) { (racine || document).querySelectorAll('[data-w]').forEach(el => { el.style.width = Math.max(0, Math.min(100, Number(el.dataset.w) || 0)) + '%'; }); }
  function annoncer(t) { $('#annonce').textContent = t; }
  function toast(t, classe) {
    const el = $('#toast'); if (!el) return;
    el.textContent = t; el.className = 'toast visible ' + (classe || '');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.className = 'toast'; }, 4200);
  }
  function sauver() {
    const ok = depot.enregistrer(etat);
    const warn = $('#stockage-avertissement');
    if (warn) { warn.hidden = depot.persistant; warn.textContent = depot.avertissement; }
    return ok;
  }
  function marquerJour() {
    const j = aujourdhui();
    if (!etat.jours.includes(j)) { etat.jours = etat.jours.concat(j).slice(-400); }
  }
  function appliquerTheme() {
    const sombre = etat.theme ? etat.theme === 'sombre' : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = sombre ? 'sombre' : 'clair';
    document.documentElement.classList.toggle('aere', !!etat.aere);
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = sombre ? '#160f22' : '#7b3fbf';
    return sombre;
  }
  /* Confirmation dans la page (les boîtes natives peuvent être bloquées dans un cadre). */
  function confirmer(message, libelle) {
    return new Promise(resolve => {
      const d = $('#confirmation');
      $('#confirmation-texte').textContent = message;
      $('#confirmation-ok').textContent = libelle || 'Confirmer';
      const fin = v => { d.close(); d.removeEventListener('close', annuler); resolve(v); };
      const annuler = () => resolve(false);
      $('#confirmation-ok').onclick = () => fin(true);
      $('#confirmation-non').onclick = () => fin(false);
      d.addEventListener('close', annuler, { once: true });
      d.showModal();
    });
  }
  function liensSources(ids, titre) {
    if (!ids || !ids.length) return '';
    return `<details class="sources"><summary>${esc(titre || 'Sources officielles')}</summary><ul>${ids.filter(id => S.sources[id]).map(id => {
      const s = S.sources[id]; return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.nom)} <span class="sr-only">(nouvel onglet)</span></a></li>`;
    }).join('')}</ul><p class="minuscule">Repère pédagogique vérifié le ${esc(S.verifie)} : vérifier le taux en vigueur sur la source officielle liée avant de l’appliquer.</p></details>`;
  }
  function statut(l) {
    const b = M.bilan(l, etat.reponses);
    return b.fini ? (b.reussi ? 'Validée' : 'À revoir') : b.repondu ? 'En cours' : 'À découvrir';
  }
  function marque(l) {
    const b = M.bilan(l, etat.reponses);
    return b.reussi ? '<span class="nav-num fait" aria-label="validée">✓</span>' : `<span class="nav-num">${esc(l.code)}</span>`;
  }

  /* ---------- Navigation ---------- */
  function lienNav(view, num, libelle, pastille) {
    const actif = etat.vue === view;
    return `<button class="nav-lien" data-view="${view}" ${actif ? 'aria-current="page"' : ''}>${num}<span>${esc(libelle)}</span>${pastille ? `<span class="pastille-alerte" aria-label="${pastille} échéance${pastille > 1 ? 's' : ''} à traiter">${pastille}</span>` : ''}</button>`;
  }
  function menu() {
    const groupes = C.parcours.filter(p => p.id !== 'final').map(p => {
      const ls = C.lecons.filter(l => l.parcours === p.id);
      return `<div class="nav-groupe"><p class="sur-titre">${esc(p.nom)}</p>${ls.map(l => lienNav(l.id, marque(l), l.titre)).join('')}</div>`;
    }).join('');
    return `${lienNav('accueil', '<span class="nav-num">⌂</span>', 'Accueil')}
      <div class="nav-groupe"><p class="sur-titre">Jouer et s’outiller</p>${lienNav('simulateurs', '<span class="nav-num">€$£</span>', 'Boîte à outils', alertesFortes().length)}${lienNav('scenarios', '<span class="nav-num">▶</span>', 'Scénarios')}${lienNav('eclair', '<span class="nav-num">⚡</span>', 'Quiz éclair')}${lienNav('revision', '<span class="nav-num">↻</span>', 'Révision espacée')}${lienNav('veille', '<span class="nav-num">◉</span>', 'Veille et idées')}${lienNav('ressources', '<span class="nav-num">★</span>', 'Ressources')}</div>
      ${groupes}
      <div class="nav-groupe"><p class="sur-titre">Pour finir</p>${lienNav('final', marque(C.final), 'Épreuve finale')}</div>
      <div class="nav-groupe"><p class="sur-titre">Mes affaires</p>${lienNav('carnet', '<span class="nav-num">≡</span>', 'Mon carnet')}${lienNav('sources', '<span class="nav-num">§</span>', 'Sources officielles')}${lienNav('suggestions', '<span class="nav-num">✎</span>', 'Mes idées pour le logiciel')}</div>`;
  }
  function blocXp(compact) {
    const x = M.xp(C, etat), sj = M.serie(etat.jours, aujourdhui());
    return `<div class="xp ${compact ? 'compact' : ''}"><div class="xp-tete"><span class="niveau">Niv. ${x.niveau} · ${esc(x.nom)}</span><strong>${nb(x.points, 0)} XP</strong></div>
      <div class="jauge" role="img" aria-label="${x.pct} % vers le niveau suivant"><span data-w="${x.pct}"></span></div>
      <p class="minuscule">${x.suivant ? `Encore ${nb(x.suivant.reste, 0)} XP pour ${esc(x.suivant.nom)}` : 'Niveau maximum atteint'} · ${sj ? `Série : ${sj} jour${sj > 1 ? 's' : ''}` : 'Lance ta série aujourd’hui'}</p></div>`;
  }

  /* ---------- Accueil ---------- */
  function badges(pr) {
    return `<div class="badges">${C.parcours.map(p => {
      const s = pr.parcours[p.id], ok = s && s.total && s.reussies === s.total;
      return `<div class="badge ${ok ? 'obtenu' : ''}"><strong>${esc(p.badge)}</strong><span>${s ? `${s.reussies} / ${s.total}` : ''}</span></div>`;
    }).join('')}</div>`;
  }
  function questionDuJour() {
    const toutesQ = []; toutes.forEach(l => l.questions.forEach((q, i) => toutesQ.push({ l, q, i })));
    const j = aujourdhui(); let h = 0; for (const c of j) h = (h * 31 + c.charCodeAt(0)) % 100003;
    return toutesQ[h % toutesQ.length];
  }
  const ENERGIES = { basse: ['Faible', 'Doux', 1], moyenne: ['Moyenne', 'Normal', 2], haute: ['Pleine', 'À fond', 3] };
  const aReponses = l => l.questions.some(q => repondu(q));
  const libelleLecon = l => M.bilan(l, etat.reponses).reussi ? 'Revoir' : aReponses(l) ? 'Reprendre' : 'Commencer';
  function prochaineAction(e, pr) {
    if (e === 'basse') return { etiq: 'Pour une énergie douce', titre: 'Quiz éclair', meta: '3 min · 5 questions', texte: 'Cinq questions au hasard. Zéro pression, tu peux t’arrêter quand tu veux.', bouton: 'Lancer le quiz', vue: 'eclair' };
    if (e === 'haute') {
      const m = C.lecons.find(l => /^m\d/.test(l.id) && !M.bilan(l, etat.reponses).reussi);
      if (m) return { etiq: 'Pour une énergie à fond', titre: `${m.code} · ${m.titre}`, meta: `${m.duree} · mission`, texte: m.objectif, bouton: aReponses(m) ? 'Reprendre la mission' : 'Jouer la mission', vue: m.id };
      return { etiq: 'Pour une énergie à fond', titre: 'Scénarios', meta: `${SC.length} histoires`, texte: 'Joue une histoire dont tu es l’héroïne.', bouton: 'Jouer un scénario', vue: 'scenarios' };
    }
    const p = pr.prochaine;
    if (!p) return { etiq: 'Pour une énergie normale', titre: 'Module terminé', meta: 'Bravo', texte: 'Tout est validé. Ton carnet garde tes actions concrètes.', bouton: 'Ouvrir mon carnet', vue: 'carnet' };
    return { etiq: 'Pour une énergie normale', titre: `${p.code} · ${p.titre}`, meta: `${p.duree} · 3 étapes`, texte: p.objectif, bouton: aReponses(p) ? 'Reprendre la leçon' : 'Commencer la leçon', vue: p.id };
  }
  /* ---------- Alertes d'échéances ---------- */
  function listeAlertes() {
    const y = annee(), vus = new Set(), tout = [];
    for (const e of [].concat(G.echeances(y - 1, etat.echeances), G.echeances(y, etat.echeances), G.echeances(y + 1, etat.echeances))) if (!vus.has(e.id)) { vus.add(e.id); tout.push(e); }
    return G.alertes(tout, etat.echeancesFaites, aujourdhui());
  }
  const alertesFortes = () => listeAlertes().filter(a => a.niveau !== 'passee');
  function prochaineEcheance() {
    const y = annee(), vus = new Set(), tout = [];
    for (const e of [].concat(G.echeances(y, etat.echeances), G.echeances(y + 1, etat.echeances))) if (!vus.has(e.id)) { vus.add(e.id); tout.push(e); }
    const auj = aujourdhui();
    const p = tout.filter(e => e.date && e.date > auj && !etat.echeancesFaites.includes(e.id)).sort((a, b) => a.date.localeCompare(b.date))[0];
    return p ? { e: p, delai: Math.round((Date.parse(p.date) - Date.parse(auj)) / 864e5) } : null;
  }
    function quand(a) {
    return a.niveau === 'passee' ? `Date passée le ${dateFr(a.date)}` : a.delai < 0 ? `En retard de ${-a.delai} jour${a.delai < -1 ? 's' : ''}` : a.delai === 0 ? 'Aujourd’hui' : a.delai === 1 ? 'Demain' : `Dans ${a.delai} jours`;
  }
  function ligneAlerte(a) {
    return `<li class="alerte-ligne al-${a.niveau}"><span class="al-point" aria-hidden="true"></span><div><strong>${esc(quand(a))} · ${esc(a.titre)}</strong>${a.fixe ? '' : '<span class="etiquette">Date indicative</span>'}<span class="minuscule">${esc(dateFr(a.date))}</span></div><button class="bouton" data-action="echeance-fait" data-id="${esc(a.id)}">C’est fait</button></li>`;
  }
  function lignePassee(a) {
    return `<li class="alerte-ligne al-passee"><div><strong>${esc(a.titre)}</strong><span class="minuscule">Date passée le ${esc(dateFr(a.date))}. Tu l’as déjà faite ?</span></div><button class="bouton" data-action="echeance-fait" data-id="${esc(a.id)}">Oui, c’est fait</button></li>`;
  }
  function ligneProchaine() {
    const p = prochaineEcheance(); if (!p) return '';
    return `<p class="petit prochaine-ech">Prochaine échéance : <strong>${esc(p.e.titre)}</strong>, le ${esc(dateFr(p.e.date))} (dans ${p.delai} jour${p.delai > 1 ? 's' : ''}).</p>`;
  }
  function carteAlertes() {
    const al = listeAlertes(), fortes = al.filter(a => a.niveau !== 'passee'), passees = al.filter(a => a.niveau === 'passee');
    if (!al.length) return ligneProchaine();
    const urgent = fortes.some(a => a.niveau === 'retard' || a.niveau === 'jour');
    return `${fortes.length ? `<section class="alertes-carte ${urgent ? 'urgent' : ''}" role="region" aria-label="Échéances à traiter"><h2><span class="al-point" aria-hidden="true"></span>${urgent ? 'Échéance à traiter maintenant' : 'Échéances à venir cette semaine'}</h2><ul class="alertes-liste">${fortes.map(ligneAlerte).join('')}</ul><button class="lien-action" data-action="outil" data-outil="echeances">Voir tout le calendrier des échéances</button></section>` : ''}
      ${passees.length ? `<section class="alertes-passees" role="region" aria-label="Dates passées à vérifier"><h2>À vérifier</h2><ul class="alertes-liste">${passees.map(lignePassee).join('')}</ul></section>` : ''}${ligneProchaine()}`;
  }
  /* Bandeau fin sur les autres pages : l'échéance la plus urgente. */
  function bandeauAlertes() {
    if (etat.vue === 'accueil') return '';
    const al = alertesFortes(); if (!al.length) return '';
    const a = al[0], urgent = a.niveau === 'retard' || a.niveau === 'jour';
    return `<div class="bandeau-alerte al-${a.niveau} ${urgent ? 'urgent' : ''}" role="status"><span class="al-point" aria-hidden="true"></span><span class="bandeau-texte"><strong>${esc(quand(a))}</strong> : ${esc(a.titre)}${al.length > 1 ? ` (+ ${al.length - 1} autre${al.length > 2 ? 's' : ''})` : ''}</span><button class="bouton" data-action="outil" data-outil="echeances">Voir</button><button class="bouton" data-action="echeance-fait" data-id="${esc(a.id)}">C’est fait</button></div>`;
  }
  function badgeApp() {
    try { const n = alertesFortes().length; if (n && navigator.setAppBadge) navigator.setAppBadge(n); else if (navigator.clearAppBadge) navigator.clearAppBadge(); } catch (_) { /* non pris en charge */ }
  }
  function rappelSauvegarde() {
    const donnees = Object.keys(etat.reponses).length || etat.recettes.length || etat.planning.length || etat.idees.length || Object.keys(etat.notes).length;
    const ref = etat.sauvegarde || etat.debut;
    if (!donnees || !ref) return '';
    const jours = Math.floor((Date.parse(aujourdhui()) - Date.parse(ref)) / 864e5);
    if (!(jours >= 30)) return '';
    return `<section class="rappel-sauvegarde" role="status"><span>${etat.sauvegarde ? `Dernière sauvegarde il y a ${jours} jours.` : 'Tu n’as encore jamais sauvegardé ta progression.'} Un fichier de secours évite de tout perdre.</span><button class="bouton" data-action="sauvegarde">Sauvegarder</button></section>`;
  }
  const tuile = (vue, cls, ic, titre, sous) => `<button class="tuile t-${cls}" data-view="${vue}"><span class="tuile-icone">${icone(ic)}</span><strong>${titre}</strong><span>${sous}</span></button>`;
  const tuilesJeu = () => [
    tuile('scenarios', 'cerise', 'jeu', 'Scénarios', `${SC.length} histoires dont tu es l’héroïne`),
    tuile('eclair', 'or', 'eclair', 'Quiz éclair', `5 questions au hasard, à ton niveau${etat.eclair.meilleur ? ` · record ${etat.eclair.meilleur}/5` : ''}`),
    tuile('revision', 'turquoise', 'revision', 'Révision', `${G.aReviser(etat.revision, aujourdhui()).length} à revoir aujourd’hui`)
  ].join('');
  function accueil() {
    const pr = M.progression(C, etat), e = etat.energie || 'moyenne', x = M.xp(C, etat), sj = M.serie(etat.jours, aujourdhui());
    const a = prochaineAction(e, pr), qj = questionDuJour();
    const classes = ['f-mauve', 'f-cerise', 'f-turquoise', 'f-or'];
    return `<div class="accueil-colonne"><h1 class="sr-only" tabindex="-1">Accueil du module community manager</h1>
      <div class="salut"><span class="logo-cm" aria-hidden="true">CM</span><div><p>Module community manager</p><strong>Salut Laetitia</strong></div><span class="pastille-niveau">${icone('etoile', 16)} Niv. ${x.niveau}</span></div>
      ${rappelSauvegarde()}
      ${carteAlertes()}
      <section class="energie-bloc"><h2>Ton énergie du jour ?</h2><div class="energie-choix" role="group" aria-label="Niveau d’énergie">${Object.entries(ENERGIES).map(([k, v]) => `<button class="energie-btn e-${k}" data-action="energie" data-energie="${k}" aria-pressed="${e === k}"><span class="barres" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= v[2] ? 'on' : ''}"></i>`).join('')}</span>${esc(v[0])}<small>${esc(v[1])}</small></button>`).join('')}</div></section>
      <section class="prochaine" aria-label="Ta prochaine action"><span class="etiq">${esc(a.etiq)}</span><h2>${esc(a.titre)}</h2><p class="meta">${esc(a.meta)}</p><p>${esc(a.texte)}</p>
        <button class="bouton-cerise" data-view="${esc(a.vue)}">${esc(a.bouton)} ${icone('fleche', 20)}</button><button class="bouton secondaire" data-action="sprint" data-minutes="10">Sprint de 10 minutes</button></section>
      <section class="progres-carte" aria-label="Ta progression"><div class="progres-ligne"><div><span class="serie">${icone('flamme', 20)}<span class="chiffre">${sj} j</span></span><span class="legende">de suite</span></div>
        <div class="milieu"><span class="legende"><span>${x.suivant ? `Vers ${esc(x.suivant.nom)}` : `Niveau ${esc(x.nom)}`}</span><b>${nb(x.points, 0)}${x.suivant ? ` / ${nb(x.suivant.seuil, 0)}` : ''} XP</b></span><span class="jauge-turquoise" role="img" aria-label="${x.pct} % vers le niveau suivant"><span data-w="${x.pct}"></span></span></div>
        <div class="droite"><span class="chiffre">${pr.reussies} / ${pr.total}</span><span class="legende">étapes</span></div></div>
        <p class="petit">Série douce : un jour de pause ne casse rien.</p></section>
      <h2 class="titre-section">Jouer et s’outiller</h2>
      <div class="grille-jeux">${tuilesJeu()}
        ${tuile('veille', 'mauve', 'veille', 'Veille', `${etat.idees.length} idée${etat.idees.length > 1 ? 's' : ''} · actus créateurs Twitch`)}
        ${tuile('simulateurs', 'or', 'outils', 'Boîte à outils', 'Recettes, plafonds, devis')}
        ${tuile('ressources', 'turquoise', 'etoile', 'Ressources', `${RS.reduce((n, c) => n + c.liens.length, 0)} outils et liens triés`)}
        <button class="tuile t-cerise" data-action="outil" data-outil="pourcent"><span class="tuile-icone">${icone('outils')}</span><strong>Pourcentages</strong><span>Formules, calculatrice, calcul de tête</span></button>
        <button class="tuile t-mauve" data-action="famille" data-id="expert"><span class="tuile-icone">${icone('flamme')}</span><strong>Défis de pro</strong><span>${C.lecons.filter(l => l.parcours === 'expert').length} cas difficiles, niveaux 3 et 4</span></button></div>
      ${qj ? `<section class="carte qdj"><div class="tete-qdj"><span class="etiq-cerise">Question du jour · ${esc(qj.l.code)}</span><span class="puce-xp">+10 XP</span></div><h2>${esc(qj.q.titre)}</h2><p>${esc(qj.q.texte)}</p><div class="actions"><button class="bouton primaire" data-action="qdj" data-lecon="${qj.l.id}" data-i="${qj.i}">${repondu(qj.q) ? 'Revoir ma réponse' : 'Y répondre'} <span aria-hidden="true">→</span></button></div></section>` : ''}
      <div class="titre-liste"><h2 class="titre-section">Tout le programme</h2><span class="petit">${C.lecons.length} leçons</span></div>
      <div class="familles">${C.parcours.filter(p => p.id !== 'final').map((p, i) => { const n = C.lecons.filter(l => l.parcours === p.id).length, r = pr.parcours[p.id].reussies; return `<button class="famille ${classes[i % 4]}" data-action="famille" data-id="${p.id}"><strong>${esc(p.nom)}</strong><span class="piste"><span data-w="${Math.max(6, Math.round(100 * r / n))}"></span></span><span class="petit">${r} / ${n}</span></button>`; }).join('')}</div>
      <div class="liens-bas"><button class="lien-action" data-view="programme">Voir toutes les leçons</button><button class="lien-action" data-view="carnet">Mon carnet</button><button class="lien-action" data-view="suggestions">Mes idées pour le logiciel</button></div></div>`;
  }
  function programme() {
    const pr = M.progression(C, etat);
    return `<header class="en-tete"><p class="sur-titre">Apprendre</p><h1 tabindex="-1">Tout le programme</h1><p class="intro">${C.lecons.length} leçons de 8 à 12 minutes, dans l’ordre que tu veux. Chacune se rejoue autant de fois que tu veux.</p></header>
      <div class="disposition"><div class="pile">${C.parcours.filter(p => p.id !== 'final').map(p => {
        const ls = C.lecons.filter(l => l.parcours === p.id);
        return `<section id="fam-${p.id}"><div class="titre-liste"><div><h2>${esc(p.nom)}</h2><p class="petit">${esc(p.image)}</p></div><span class="etiquette">${pr.parcours[p.id].reussies} / ${ls.length} validées</span></div>
          <div class="ateliers">${ls.map(l => `<article class="atelier-ligne ${M.bilan(l, etat.reponses).reussi ? 'validee' : ''}"><span class="numero">${esc(l.code)}</span><div><h3>${esc(l.titre)}</h3><p class="petit">${esc(l.duree)} · ${esc(statut(l))}</p>${pastilleNiveau(l)}</div><button class="lien-action" data-view="${l.id}" aria-label="${libelleLecon(l)} ${esc(l.code)} : ${esc(l.titre)}">${libelleLecon(l)}</button></article>`).join('')}</div></section>`;
      }).join('')}
        <section class="carte invitation"><p class="sur-titre">Le boss de fin</p><h2>${esc(C.final.titre)}</h2><p>${esc(C.final.court)} ${C.final.questions.length} questions, 80 % et aucune erreur critique.</p><div class="actions"><button class="bouton primaire" data-view="final">Ouvrir l’épreuve</button><span class="petit">${esc(statut(C.final))}</span></div></section>
      </div>${panneau(pr)}</div>`;
  }
  function jouer() {
    return `<header class="en-tete"><p class="sur-titre">Jouer</p><h1 tabindex="-1">Jouer pour apprendre</h1><p class="intro">Trois façons de t’entraîner, sans pression et sans chrono imposé.</p></header><div class="grille-jeux">${tuilesJeu()}</div>`;
  }
  function victoire(l, suivante) {
    const x = M.xp(C, etat);
    return `<section class="victoire" aria-label="Leçon validée"><span class="fete" aria-hidden="true">${'<i></i>'.repeat(12)}</span><span class="medaille" aria-hidden="true">${icone('etoile', 60)}</span>
      <h3>Leçon validée !</h3>${blocMascotte('fete', l.id)}<p>${esc(l.code)} · ${esc(l.titre)}</p><span class="gain">+25 XP</span>
      <div class="vers"><div class="legende"><span>${x.suivant ? `Vers ${esc(x.suivant.nom)}` : 'Niveau maximum'}</span><b>${nb(x.points, 0)}${x.suivant ? ` / ${nb(x.suivant.seuil, 0)}` : ''} XP</b></div><span class="jauge-turquoise"><span data-w="${x.pct}"></span></span>${x.suivant ? `<p>Encore ${nb(x.suivant.reste, 0)} XP pour ${esc(x.suivant.nom)}.</p>` : ''}</div>
      <p>${esc(l.memo)}</p>
      <div class="actions">${suivante ? `<button class="bouton-cerise" data-view="${suivante.id}">Leçon suivante : ${esc(suivante.code)} ${icone('fleche', 20)}</button>` : '<button class="bouton-cerise" data-view="carnet">Voir mon carnet</button>'}<button class="bouton" data-view="accueil">Retour à l’accueil</button></div></section>`;
  }
  function panneau(pr) {
    pr = pr || M.progression(C, etat);
    return `<aside class="panneau" aria-label="Repères"><section class="carte"><h2>Ton avancée</h2>${blocXp()}<div class="progression-texte"><span>Leçons validées</span><strong>${pr.reussies} / ${pr.total}</strong></div><progress value="${pr.reussies}" max="${pr.total}" aria-label="${pr.reussies} leçons validées sur ${pr.total}"></progress>${badges(pr)}</section>
      <section class="carte"><p class="sur-titre">Comment gagner des XP</p><ul class="liste-simple"><li>10 XP par bonne réponse.</li><li>25 XP par leçon validée.</li><li>5 XP par point de scénario.</li><li>5 XP par bonne réponse au quiz éclair.</li></ul><p class="petit">Validé à 80 % sans erreur critique. Pas de chrono imposé.</p></section>
      <section class="carte"><h2>Besoin de souffler ?</h2><p class="petit">Le mode focus masque tout sauf la leçon. Le texte aéré agrandit l’interlignage. Ta progression est sauvegardée à chaque réponse.</p><div class="actions"><button class="bouton" data-action="focus">${etat.focus ? 'Quitter le mode focus' : 'Activer le mode focus'}</button></div></section></aside>`;
  }

  /* ---------- Questions (leçons et quiz éclair) ---------- */
  function libelleConsigne(q) {
    if (q.type === 'multiple') return `Plusieurs réponses : choisis-en ${q.bonne.length}.`;
    return 'Une seule réponse.';
  }
  function champsQuestion(q, val, faite) {
    if (q.type === 'nombre') {
      return `<fieldset><legend>Ta réponse (en ${esc(q.unite)})</legend><div class="champ-reponse"><label class="sr-only" for="nombre-reponse">Ta réponse en ${esc(q.unite)}</label><input id="nombre-reponse" name="nombre" type="number" inputmode="decimal" step="any" value="${val == null ? '' : esc(val)}" ${faite ? 'disabled' : ''}><span>${esc(q.unite)}</span></div></fieldset>`;
    }
    return `<fieldset><legend>${esc(libelleConsigne(q))}</legend>${q.options.map((o, i) => {
      const coche = q.type === 'multiple' ? Array.isArray(val) && val.includes(i) : val === i;
      let classe = '';
      if (faite) { const bonne = q.type === 'multiple' ? q.bonne.includes(i) : q.bonne === i; classe = bonne ? 'juste' : coche ? 'faux' : ''; }
      return `<label class="choix ${classe}"><input type="${q.type === 'multiple' ? 'checkbox' : 'radio'}" name="choix" value="${i}" ${coche ? 'checked' : ''} ${faite ? 'disabled' : ''}><span><span class="lettre" aria-hidden="true">${'ABCDEF'[i]}</span>${esc(o)}${faite && (coche || classe === 'juste') ? `<small class="retour-option">${esc(q.retours[i])}</small>` : ''}</span></label>`;
    }).join('')}</fieldset>`;
  }
  /* ---------- Niveaux de difficulté ---------- */
  const pastilleNiveau = l => {
    const n = niveauDe(l);
    return `<span class="niveau n${n}" title="Niveau ${n} sur 4 : ${NIV[n]}"><span class="niv-points" aria-hidden="true">${[1, 2, 3, 4].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>Niveau ${n} · ${NIV[n]}</span>`;
  };

  /* ---------- Mochi, la mascotte (SVG sans script ni style en ligne) ---------- */
  const PAROLES = {
    fete: ['Série en or ! Tu es en feu.', 'Là, c’est du niveau pro. Bravo !', 'High five virtuel : tu l’as bien mérité.', 'Propre, rapide, juste. On continue ?', 'Tu me fais danser, là !'],
    content: ['Bien vu, ça rentre.', 'Exactement ça. Mochi approuve.', 'Net. Une de plus dans la poche.', 'Ça, c’est le bon réflexe métier.', 'Tu l’as : ça se retient mieux après un succès.'],
    rassure: ['Pas grave : une erreur, c’est un souvenir qui s’installe.', 'Regarde la réponse, respire, on y revient tout à l’heure.', 'Même les pros se trompent ici. Tu t’en souviendras mieux.', 'On ne te juge pas, on apprend. Prochaine !', 'Cette question reviendra en révision : tu auras ta revanche.'],
    attentif: ['Celle-ci compte vraiment dans le métier. Relis le cours tranquillement, puis réessaie.', 'Point critique : prends ton temps, c’est le genre d’erreur qui coûte cher en vrai.', 'On souffle. Ce point-là vaut la peine d’être bien compris.']
  };
  /* Message choisi à partir d’une graine (identifiant de question) : il ne change pas à chaque rafraîchissement de l’écran. */
  const parole = (humeur, graine) => {
    const t = PAROLES[humeur]; let h = 7;
    for (const c of String(graine || '') + humeur) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return t[h % t.length];
  };
  const mascotteActive = () => etat.mascotte !== false;
  function mascotte(humeur) {
    const yeuxBase = '<circle class="m-oeil" cx="47" cy="66" r="4.5"/><circle class="m-oeil" cx="73" cy="66" r="4.5"/><circle class="m-reflet" cx="48.6" cy="64.4" r="1.5"/><circle class="m-reflet" cx="74.6" cy="64.4" r="1.5"/>';
    const yeux = {
      content: yeuxBase,
      fete: '<path class="m-trait" d="M41 69 Q47 59 53 69"/><path class="m-trait" d="M67 69 Q73 59 79 69"/>',
      rassure: yeuxBase + '<path class="m-trait fin" d="M40 57 Q47 52 54 58"/><path class="m-trait fin" d="M66 58 Q73 52 80 57"/>',
      attentif: '<circle class="m-oeil" cx="47" cy="66" r="5.5"/><circle class="m-oeil" cx="73" cy="66" r="5.5"/><circle class="m-reflet" cx="48.8" cy="64" r="1.8"/><circle class="m-reflet" cx="74.8" cy="64" r="1.8"/><path class="m-trait fin" d="M40 56 L54 56"/><path class="m-trait fin" d="M66 56 L80 56"/>'
    }[humeur];
    const bouche = {
      content: '<path class="m-trait" d="M52 78 Q60 87 68 78"/>',
      fete: '<path class="m-bouche" d="M48 76 Q60 98 72 76 Z"/>',
      rassure: '<path class="m-trait" d="M53 81 Q60 86 67 81"/>',
      attentif: '<path class="m-trait" d="M54 83 L66 83"/>'
    }[humeur];
    const bras = humeur === 'fete'
      ? '<path class="m-bras" d="M24 82 Q8 70 10 46"/><path class="m-bras" d="M96 82 Q112 70 110 46"/><circle class="m-corps" cx="10" cy="43" r="7"/><circle class="m-corps" cx="110" cy="43" r="7"/>'
      : '<ellipse class="m-corps" cx="22" cy="92" rx="9" ry="7"/><ellipse class="m-corps" cx="98" cy="92" rx="9" ry="7"/>';
    const extra = {
      fete: '<path class="m-etoile" d="M18 22 l2.4 5 5.4 .8 -3.9 3.8 .9 5.4 -4.8 -2.6 -4.8 2.6 .9 -5.4 -3.9 -3.8 5.4 -.8z"/><path class="m-etoile" d="M102 14 l2 4.2 4.5 .7 -3.3 3.2 .8 4.5 -4 -2.2 -4 2.2 .8 -4.5 -3.3 -3.2 4.5 -.7z"/><circle class="m-etoile" cx="60" cy="9" r="3"/>',
      content: '<path class="m-etoile" d="M100 22 l2 4.2 4.5 .7 -3.3 3.2 .8 4.5 -4 -2.2 -4 2.2 .8 -4.5 -3.3 -3.2 4.5 -.7z"/>',
      rassure: '<path class="m-coeur" d="M100 36 C92 28 92 20 98 20 C101 20 102 23 100 25 C102 23 107 20 110 24 C112 28 106 33 100 36 Z"/>',
      attentif: ''
    }[humeur];
    return `<svg class="mascotte m-${humeur}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <ellipse class="m-ombre" cx="60" cy="110" rx="30" ry="5"/>${bras}
      <path class="m-corps" d="M26 46 L22 16 L50 32 Z"/><path class="m-corps" d="M94 46 L98 16 L70 32 Z"/><path class="m-oreille" d="M29 40 L27 24 L42 33 Z"/><path class="m-oreille" d="M91 40 L93 24 L78 33 Z"/>
      <path class="m-corps" d="M60 30 C88 30 101 52 101 74 C101 97 83 108 60 108 C37 108 19 97 19 74 C19 52 32 30 60 30 Z"/><ellipse class="m-ventre" cx="60" cy="94" rx="20" ry="11"/>
      <path class="m-arc" d="M25 66 C22 30 98 30 95 66"/><rect class="m-coque" x="15" y="58" width="12" height="22" rx="6"/><rect class="m-coque" x="93" y="58" width="12" height="22" rx="6"/><path class="m-micro" d="M99 78 Q99 92 82 93"/><circle class="m-coque" cx="80" cy="93" r="4"/>
      <circle class="m-joue" cx="37" cy="77" r="5.5"/><circle class="m-joue" cx="83" cy="77" r="5.5"/>${yeux}${bouche}${extra}</svg>`;
  }
  /* Mochi et sa phrase. Vide si la mascotte est désactivée dans les réglages. */
  const blocMascotte = (humeur, graine) => mascotteActive() ? `<div class="mascotte-bloc">${mascotte(humeur)}<p class="mascotte-parole">${esc(parole(humeur, graine))}</p></div>` : '';

  function feedbackQuestion(q, val) {
    const ok = M.correcte(q, val);
    const attendue = q.type === 'nombre' ? `${nb(q.bonne, 2)} ${q.unite}` : q.type === 'multiple' ? q.bonne.map(i => q.options[i]).join(' · ') : q.options[q.bonne];
    const fete = ok ? `<span class="fete" aria-hidden="true">${'<i></i>'.repeat(12)}</span>` : '';
    const humeur = ok ? (combo > 2 ? 'fete' : 'content') : q.critique ? 'attentif' : 'rassure', m = mascotteActive();
    return `<section id="correction" class="feedback ${ok ? 'gagne' : q.critique ? 'critique' : 'erreur'}" tabindex="-1" aria-label="Correction">${fete}<div class="fb-corps">${m ? mascotte(humeur) : ''}<div class="fb-texte"><h3>${ok ? ['Bien joué.', 'Exactement.', 'Dans le mille.', 'Pro.'][Math.floor(Math.random() * 4)] : q.critique ? 'Erreur critique : à reprendre.' : 'Pas tout à fait.'}${ok && combo > 1 ? ` <span class="combo">Combo ×${combo}</span>` : ''}${ok && !sansXp ? ' <span class="gain">+10 XP</span>' : ''}</h3>${m ? `<p class="mascotte-parole">${esc(parole(humeur, q.id))}</p>` : ''}${!ok ? `<p><strong>Réponse attendue :</strong> ${esc(attendue)}</p>` : ''}<p>${esc(q.explication)}</p></div></div></section>`;
  }
  function pointsQuestions(l) {
    return `<ol class="points-q" aria-label="Avancement des questions">${l.questions.map((q, i) => {
      const r = repondu(q), ok = r && M.correcte(q, etat.reponses[q.id]);
      return `<li class="${i === etat.question ? 'actuelle' : ''} ${r ? (ok ? 'juste' : 'faux') : ''}"><span class="sr-only">Question ${i + 1} : ${r ? (ok ? 'juste' : 'à revoir') : 'à faire'}</span></li>`;
    }).join('')}</ol>`;
  }

  /* ---------- Leçon ---------- */
  function etapes() {
    const noms = [['cours', 'Comprendre'], ['exercice', 'Décider'], ['ancrage', 'Retenir']];
    return `<ol class="etapes">${noms.map(([id, n], i) => `<li class="${etat.etape === id ? 'actuelle' : ''}" ${etat.etape === id ? 'aria-current="step"' : ''}>${i + 1}. ${n}</li>`).join('')}</ol>`;
  }
  function lecon(l) {
    const p = parcoursDe(l);
    const corps = etat.etape === 'exercice' ? renduQuestion(l) : etat.etape === 'ancrage' ? ancrage(l) : cours(l);
    return `<button class="retour" data-view="accueil"><span aria-hidden="true">←</span> Accueil</button>
      <header class="lecon-entete"><div class="meta"><span class="etiquette">${esc(p.nom)}</span><span>${esc(l.code)} · ${esc(l.duree)}</span><span>${esc(statut(l))}</span>${pastilleNiveau(l)}</div><h1 tabindex="-1">${esc(l.titre)}</h1><p class="intro">${esc(l.objectif)}</p></header>
      ${etapes()}${corps}`;
  }
  const tableauLecon = t => `<div class="table-defile"><table class="table-cash table-lecon"><caption>${esc(t.legende)}</caption><thead><tr>${t.entetes.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.lignes.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  function cours(l) {
    const outil = { c1: 'pourcent', c2: 'pourcent', c3: 'pourcent', c4: 'pourcent', b2: 'cotis', b3: 'cotis', b4: 'revenu', b5: 'doc', b6: 'treso', b7: 'devises', b8: 'doc', b9: 'budget', p1: 'pipeline', p2: 'pipeline', t8: 'reporting' }[l.id];
    return `<section class="carte"><div class="situation"><p class="sur-titre">La situation</p><p>${esc(l.situation)}</p></div>
      ${l.cours.map(([t, x], i) => `<section class="cours-bloc"><h2><span class="puce-num" aria-hidden="true">${i + 1}</span>${esc(t)}</h2><p>${esc(x)}</p></section>`).join('')}
      ${l.tableau ? tableauLecon(l.tableau) : ''}
      <div class="memo"><strong>À retenir</strong>${esc(l.memo)}</div>
      ${outil ? `<div class="actions"><button class="bouton" data-action="outil" data-outil="${outil}">Tester dans la boîte à outils</button></div>` : ''}
      <div class="actions"><button class="bouton primaire" data-action="exercice">${M.bilan(l, etat.reponses).fini ? 'Revoir mes réponses' : 'Passer aux questions'} <span aria-hidden="true">→</span></button><span class="petit">${l.questions.length} questions · sans chrono</span></div>
      ${liensSources(l.sources)}</section>`;
  }
  function renduQuestion(l) {
    const q = l.questions[etat.question], faite = repondu(q), val = faite ? etat.reponses[q.id] : drafts[q.id];
    const ok = faite && M.correcte(q, val);
    return `<section class="carte question">${pointsQuestions(l)}<p class="q-compteur">${esc(l.code)} · Question ${etat.question + 1} sur ${l.questions.length}${q.critique ? ' · <span class="drapeau">point critique</span>' : ''}</p><h2 tabindex="-1">${esc(q.titre)}</h2><p>${esc(q.texte)}</p>
      <form id="form-question" data-mode="lecon" novalidate>${champsQuestion(q, val, faite)}<p id="erreur-question" class="validation" role="alert"></p>${!faite ? '<div class="actions"><button type="submit" class="bouton primaire">Vérifier</button></div>' : ''}</form>${faite ? feedbackQuestion(q, val) : ''}
      ${faite ? `<div class="actions"><button class="bouton primaire" data-action="suivante">${etat.question === l.questions.length - 1 ? 'Voir mon bilan' : 'Question suivante'} <span aria-hidden="true">→</span></button>${!ok ? '<button class="bouton discret" data-action="reessayer-question">Réessayer</button>' : ''}</div>` : ''}
      <div class="actions"><button class="bouton discret" data-action="cours">Revoir le cours</button>${etat.question > 0 ? '<button class="bouton discret" data-action="precedente">Question précédente</button>' : ''}</div></section>`;
  }
  function ancrage(l) {
    const b = M.bilan(l, etat.reponses), note = etat.notes[l.id] || {};
    const idx = toutes.indexOf(l), suivante = toutes.slice(idx + 1).find(x => !M.bilan(x, etat.reponses).reussi) || toutes.find(x => !M.bilan(x, etat.reponses).reussi);
    const message = b.reussi ? 'Leçon validée. +25 XP.' : b.critiques ? `${b.critiques} erreur${b.critiques > 1 ? 's' : ''} critique${b.critiques > 1 ? 's' : ''} : la leçon n’est pas validée, même avec un bon score.` : `Il faut 80 % pour valider. Tu y es presque.`;
    return `<section class="carte"><p class="sur-titre">Ton bilan</p><div class="resume-score"><p class="score">${b.score} %<span> · ${b.bonnes} / ${b.total} bonnes réponses</span></p></div>
      ${b.reussi ? victoire(l, suivante) : `<div class="feedback ${b.critiques ? 'critique' : 'erreur'}"><h3>${esc(message)}</h3><p>Relis le cours, puis rejoue la leçon. Tes notes sont conservées.</p></div>`}
      <section class="cours-bloc"><h2>Ton mini-défi</h2><p>${esc(l.defi)}</p></section>
      <div class="champ"><label for="note-action">Mon action concrète</label><textarea id="note-action" data-note="action" maxlength="1500" placeholder="Ce que je fais pour de vrai…">${esc(note.action)}</textarea></div>
      <div class="deux-champs"><div class="champ"><label for="note-echeance">Pour quand ?</label><input id="note-echeance" data-note="echeance" type="text" maxlength="120" value="${esc(note.echeance)}" placeholder="Ex. jeudi soir"></div>
      <div class="champ"><span class="label-faux">Où j’en suis</span><label class="choix case"><input type="checkbox" data-note="fait" ${note.fait ? 'checked' : ''}><span>Défi réalisé</span></label></div></div>
      <p class="sauve-note" data-note-etat>Enregistré automatiquement dans ton carnet.</p>
      <div class="actions">${b.reussi ? '' : suivante ? `<button class="bouton primaire" data-view="${suivante.id}">Suivante : ${esc(suivante.code)} <span aria-hidden="true">→</span></button>` : '<button class="bouton primaire" data-view="carnet">Voir mon carnet</button>'}<button class="bouton discret" data-action="rejouer">Rejouer la leçon</button><button class="bouton discret" data-view="accueil">Faire une pause</button></div>
      ${liensSources(l.sources)}</section>`;
  }

  /* ---------- Quiz éclair ---------- */
  function nouvelEclair() {
    let pool = []; toutes.filter(l => !niveauEclair || niveauDe(l) === niveauEclair).forEach(l => l.questions.forEach(q => pool.push({ l, q })));
    if (pool.length < 5) { pool = []; toutes.forEach(l => l.questions.forEach(q => pool.push({ l, q }))); }
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    eclair = { qs: pool.slice(0, 5), i: 0, rep: {}, fini: false };
  }
  function choixNiveau() {
    const nbQ = n => toutes.filter(l => !n || niveauDe(l) === n).reduce((t, l) => t + l.questions.length, 0);
    const libs = [[0, 'Tous niveaux'], [1, 'Facile'], [2, 'Intermédiaire'], [3, 'Difficile'], [4, 'Expert']];
    return `<section class="carte niveaux-bloc"><h2>Ton niveau du moment</h2><div class="niveaux-choix" role="group" aria-label="Niveau de difficulté">${libs.map(([n, lib]) => `<button class="puce-niveau ${n ? 'n' + n : ''}" data-action="eclair-niveau" data-niveau="${n}" aria-pressed="${niveauEclair === n}">${lib}<small>${nbQ(n)} questions</small></button>`).join('')}</div><p class="petit">Facile : les bases. Intermédiaire : les missions et le business. Difficile et Expert : les défis de pro, pour quelqu’un qui connaît déjà le métier.</p></section>`;
  }
  function vueEclair() {
    if (!eclair) nouvelEclair();
    const tete = `<header class="en-tete"><p class="sur-titre">Jouer · Quiz éclair</p><h1 tabindex="-1">5 questions, tout le module</h1><p class="intro">Des questions tirées au hasard dans toutes les leçons. Parfait pour 3 minutes de révision. Record : ${etat.eclair.meilleur} / 5 · ${etat.eclair.parties} partie${etat.eclair.parties > 1 ? 's' : ''}.</p></header>`;
    if (eclair.fini) {
      const bonnes = eclair.qs.filter(x => M.correcte(x.q, eclair.rep[x.q.id])).length;
      const ratees = eclair.qs.filter(x => !M.correcte(x.q, eclair.rep[x.q.id]));
      return `${tete}${choixNiveau()}<section class="carte"><div class="resume-score"><p class="score">${bonnes} / 5<span> · +${bonnes * 5} XP</span></p></div>
        ${blocMascotte(bonnes >= 4 ? 'fete' : bonnes >= 3 ? 'content' : 'rassure', 'eclair' + bonnes)}<div class="feedback ${bonnes >= 4 ? 'gagne' : bonnes >= 3 ? '' : 'erreur'}">${bonnes >= 4 ? `<span class="fete" aria-hidden="true">${'<i></i>'.repeat(12)}</span>` : ''}<h3>${bonnes === 5 ? 'Sans faute. Légendaire.' : bonnes >= 3 ? 'Solide. Encore une ?' : 'Échauffement terminé. On rejoue ?'}</h3>${ratees.length ? `<p>À revoir : ${ratees.map(x => `<button class="lien-action en-ligne" data-view="${x.l.id}">${esc(x.l.code)} ${esc(x.l.titre)}</button>`).join(' · ')}</p>` : ''}</div>
        <div class="actions"><button class="bouton primaire" data-action="eclair-rejouer">Nouvelle partie <span aria-hidden="true">↻</span></button><button class="bouton discret" data-view="accueil">Faire une pause</button></div></section>`;
    }
    const { l, q } = eclair.qs[eclair.i], faite = Object.prototype.hasOwnProperty.call(eclair.rep, q.id), val = faite ? eclair.rep[q.id] : drafts[q.id];
    return `${tete}${eclair.i === 0 && !Object.keys(eclair.rep).length ? choixNiveau() : ''}<section class="carte question"><ol class="points-q" aria-hidden="true">${eclair.qs.map((x, i) => { const r = Object.prototype.hasOwnProperty.call(eclair.rep, x.q.id); return `<li class="${i === eclair.i ? 'actuelle' : ''} ${r ? (M.correcte(x.q, eclair.rep[x.q.id]) ? 'juste' : 'faux') : ''}"></li>`; }).join('')}</ol>
      <p class="q-compteur">Éclair · ${eclair.i + 1} / 5 · tirée de ${esc(l.code)}</p><h2 tabindex="-1">${esc(q.titre)}</h2><p>${esc(q.texte)}</p>
      <form id="form-question" data-mode="eclair" novalidate>${champsQuestion(q, val, faite)}<p id="erreur-question" class="validation" role="alert"></p>${!faite ? '<div class="actions"><button type="submit" class="bouton primaire">Vérifier</button></div>' : ''}</form>${faite ? feedbackQuestion(q, val) : ''}
      ${faite ? `<div class="actions"><button class="bouton primaire" data-action="eclair-suivante">${eclair.i === 4 ? 'Voir mon score' : 'Suivante'} <span aria-hidden="true">→</span></button></div>` : ''}</section>`;
  }

  /* ---------- Scénarios ---------- */
  function vueScenarios() {
    if (jeu) return jouerScenario();
    const joues = SC.filter(s => etat.scenarios[s.id]).length;
    return `<header class="en-tete"><p class="sur-titre">Jouer · Scénarios</p><h1 tabindex="-1">Tu es la CM. À toi de décider.</h1><p class="intro">${SC.length} histoires inspirées du terrain, 3 décisions chacune. Chaque choix rapporte 0, 1 ou 2 points. ${joues} jouée${joues > 1 ? 's' : ''} sur ${SC.length}.</p></header>
      <div class="grille-scenarios">${SC.map(s => {
        const r = etat.scenarios[s.id], max = s.etapes.length * 2, p = r ? M.palier(r.meilleur, max) : null;
        return `<article class="carte scenario ${p ? 'medaille-' + p.id : ''}"><div class="meta"><span class="etiquette">${esc(s.theme)}</span>${r ? `<span class="medaille">${r.meilleur} / ${max}</span>` : '<span class="petit">Nouveau</span>'}</div><h2>${esc(s.titre)}</h2><p class="petit">${esc(s.intro)}</p><div class="actions"><button class="bouton ${r ? '' : 'primaire'}" data-action="jouer" data-id="${s.id}">${r ? 'Rejouer' : 'Jouer'} <span aria-hidden="true">▶</span></button></div></article>`;
      }).join('')}</div>`;
  }
  function jouerScenario() {
    const s = SC.find(x => x.id === jeu.id), max = s.etapes.length * 2;
    const lec = toutes.find(l => l.id === s.lecon);
    if (jeu.etape >= s.etapes.length) {
      const p = M.palier(jeu.points, max);
      return `<button class="retour" data-action="quitter-jeu"><span aria-hidden="true">←</span> Tous les scénarios</button><header class="en-tete"><p class="sur-titre">Scénario · ${esc(s.theme)}</p><h1 tabindex="-1">${esc(s.titre)}</h1></header>
        <section class="carte"><div class="resume-score"><p class="score">${jeu.points} / ${max}<span> · +${jeu.points * 5} XP max</span></p></div>
        <div class="feedback ${p.id === 'or' ? 'gagne' : p.id === 'argent' ? '' : 'erreur'}">${p.id === 'or' ? `<span class="fete" aria-hidden="true">${'<i></i>'.repeat(12)}</span>` : ''}<h3>${esc(p.nom)}</h3><p>${jeu.choix.map((c, i) => `Décision ${i + 1} : ${c.pts} point${c.pts > 1 ? 's' : ''}.`).join(' ')}</p></div>
        <div class="actions"><button class="bouton primaire" data-action="jouer" data-id="${s.id}">Rejouer <span aria-hidden="true">↻</span></button>${lec ? `<button class="bouton" data-view="${lec.id}">Revoir ${esc(lec.code)} : ${esc(lec.titre)}</button>` : ''}<button class="bouton discret" data-action="quitter-jeu">Autre scénario</button></div></section>`;
    }
    const e = s.etapes[jeu.etape], choisi = jeu.choix[jeu.etape];
    return `<button class="retour" data-action="quitter-jeu"><span aria-hidden="true">←</span> Tous les scénarios</button>
      <header class="en-tete"><p class="sur-titre">Scénario · ${esc(s.theme)} · décision ${jeu.etape + 1} sur ${s.etapes.length}</p><h1 tabindex="-1">${esc(s.titre)}</h1></header>
      <section class="carte scene">${jeu.etape === 0 ? `<div class="situation"><p class="sur-titre">Le décor</p><p>${esc(s.intro)}</p></div>` : ''}
      <ol class="points-q" aria-hidden="true">${s.etapes.map((x, i) => `<li class="${i === jeu.etape ? 'actuelle' : ''} ${jeu.choix[i] ? (jeu.choix[i].pts === 2 ? 'juste' : jeu.choix[i].pts === 1 ? 'moyen' : 'faux') : ''}"></li>`).join('')}</ol>
      <h2 class="scene-texte">${esc(e.texte)}</h2>
      <div class="choix-scene">${e.choix.map(([t, pts, ret], i) => {
        const cl = choisi ? (choisi.i === i ? (pts === 2 ? 'juste' : pts === 1 ? 'moyen' : 'faux') : 'eteint') : '';
        return `<button class="choix-jeu ${cl}" data-action="choisir" data-i="${i}" ${choisi ? 'disabled' : ''}><span class="lettre" aria-hidden="true">${'ABC'[i]}</span><span>${esc(t)}${choisi && choisi.i === i ? `<small class="retour-option">${esc(ret)} <strong>${pts === 2 ? '+2 points' : pts === 1 ? '+1 point' : '0 point'}</strong></small>` : ''}</span></button>`;
      }).join('')}</div>
      ${choisi ? `<div class="actions"><button class="bouton primaire" data-action="scene-suite" id="scene-suite">${jeu.etape === s.etapes.length - 1 ? 'Voir le dénouement' : 'Et ensuite ?'} <span aria-hidden="true">→</span></button></div>` : ''}</section>`;
  }

  /* ---------- Ressources ---------- */
  function vueRessources() {
    return `<header class="en-tete"><p class="sur-titre">S’outiller · Ressources</p><h1 tabindex="-1">La boîte à liens de la CM</h1><p class="intro">Des outils et des sources triés par usage. Exemples sans partenariat : les offres et les prix changent, vérifie sur chaque site.</p></header>
      <nav class="puces-nav" aria-label="Catégories">${RS.map(c => `<a class="puce" href="#res-${c.id}">${esc(c.titre)}</a>`).join('')}</nav>
      <div class="champ filtre"><label for="filtre-res">Filtrer</label><input id="filtre-res" type="text" placeholder="Ex. Discord, gratuit, facture…" data-filtre="res"></div>
      <div class="pile">${RS.map(c => `<section class="carte res-cat" id="res-${c.id}"><h2>${esc(c.titre)}</h2><p class="astuce"><strong>Astuce :</strong> ${esc(c.astuce)}</p>
        <ul class="res-liste">${c.liens.map(r => `<li data-texte="${esc((r.nom + ' ' + r.desc + ' ' + r.prix + ' ' + c.titre).toLowerCase())}"><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.nom)} <span class="sr-only">(nouvel onglet)</span></a><span class="res-desc">${esc(r.desc)}</span><span class="etiquette prix">${esc(r.prix)}</span></li>`).join('')}</ul></section>`).join('')}
        <p class="petit" id="res-vide" hidden>Aucun résultat pour ce filtre.</p></div>`;
  }

  /* ---------- Boîte à outils ---------- */
  function champNum(groupe, cle, libelle, val, min, max, step) {
    const id = `${groupe}-${cle.replace(/\./g, '-')}`;
    return `<div><label for="${id}">${libelle}</label><input id="${id}" data-sim="${groupe}" data-cle="${cle}" type="number" inputmode="decimal" min="${min}" max="${max}" step="${step}" value="${esc(val)}"></div>`;
  }
  function champTexte(groupe, cle, libelle, val, max, ph, type) {
    const id = `${groupe}-${cle.replace(/\./g, '-')}`;
    return `<div><label for="${id}">${libelle}</label><input id="${id}" data-sim="${groupe}" data-cle="${cle}" type="${type || 'text'}" maxlength="${max || 200}" value="${esc(val)}" ${ph ? `placeholder="${esc(ph)}"` : ''}></div>`;
  }
  function champSelect(groupe, cle, libelle, val, options) {
    const id = `${groupe}-${cle.replace(/\./g, '-')}`;
    return `<div><label for="${id}">${libelle}</label><select id="${id}" data-sim="${groupe}" data-cle="${cle}">${options.map(([v, t]) => `<option value="${v}" ${String(val) === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>`;
  }
  function caseSim(groupe, cle, libelle, val) {
    return `<label class="choix case"><input type="checkbox" data-sim="${groupe}" data-cle="${cle}" ${val ? 'checked' : ''}><span>${esc(libelle)}</span></label>`;
  }
  const optDevises = () => M.DEVISES.map(c => [c, `${c} (${SYMB[c]}) · ${NOMS[c]}`]);
  function tauxCroises() {
    const t = T();
    return `<span>1 € = ${nb(t.USD, 4)} $</span><span>1 € = ${nb(t.GBP, 4)} £</span><span>1 $ = ${nb(M.croise('USD', 'EUR', t), 4)} €</span><span>1 £ = ${nb(M.croise('GBP', 'EUR', t), 4)} €</span><span>1 £ = ${nb(M.croise('GBP', 'USD', t), 4)} $</span>`;
  }
  function barreTaux() {
    const t = T();
    return `<section class="carte taux"><div class="taux-tete"><div><p class="sur-titre">Taux utilisés partout</p><p class="petit" id="taux-source">Source : ${esc(t.source)} du ${esc(dateFr(t.date))}. Modifiables à la main.</p></div><button class="bouton" data-action="maj-taux" id="maj-taux">Actualiser les taux BCE</button></div>
      <div class="calcul-champs deux">${champNum('devises', 'USD', '1 € = … dollars US', t.USD, 0.0001, 10000, 0.0001)}${champNum('devises', 'GBP', '1 € = … livres sterling', t.GBP, 0.0001, 10000, 0.0001)}</div>
      <p class="taux-croises" id="taux-croises">${tauxCroises()}</p>
      <p class="minuscule">Le bouton interroge un service public de taux (Frankfurter, données BCE) : c’est la seule requête réseau du module. Taux de référence publiés vers 16 h les jours ouvrés.</p></section>`;
  }
  const ONGLETS = [['pourcent', 'Pourcentages'], ['devises', 'Convertir'], ['cotis', 'Cotisations'], ['revenu', 'Tarif → revenu'], ['treso', 'Trésorerie'], ['pipeline', 'Prospection'], ['budget', 'Budget'], ['reporting', 'Reporting'], ['doc', 'Devis & facture'], ['recettes', 'Livre des recettes'], ['plafonds', 'Plafonds'], ['echeances', 'Échéances'], ['planning', 'Planning'], ['contrat', 'Contrat & CGV'], ['efacture', 'Facture électronique']];

  function resultatDevises() {
    const eur = M.enEuros(conv.montant, conv.devise, T());
    const v = M.trois(eur, T());
    const comparer = [100, 300, 500, 1000];
    return `<div class="grand-triplet">${M.DEVISES.map(c => `<div class="${c === conv.devise ? 'choisie' : ''}"><span>${NOMS[c]}</span><strong>${argent(v[c], c, 2)}</strong></div>`).join('')}</div>
      <table class="table-cash"><caption>Comparer des tarifs ronds selon la devise de départ</caption><thead><tr><th scope="col">Montant</th><th scope="col">en €</th><th scope="col">en $</th><th scope="col">en £</th></tr></thead><tbody>
      ${M.DEVISES.map(c => comparer.map(m => { const e = M.enEuros(m, c, T()), x = M.trois(e, T()); return `<tr><th scope="row">${argent(m, c)}</th>${M.DEVISES.map(d => `<td class="${d === c ? 'surligne' : ''}">${argent(x[d], d)}</td>`).join('')}</tr>`; }).join('')).join('')}</tbody></table>`;
  }
  function outilDevises() {
    return `<div class="calcul-champs deux"><div><label for="conv-montant">Montant</label><input id="conv-montant" data-conv="montant" type="number" inputmode="decimal" min="0" step="0.01" value="${esc(conv.montant)}"></div>
      <div><label for="conv-devise">Devise de départ</label><select id="conv-devise" data-conv="devise">${optDevises().map(([v, t]) => `<option value="${v}" ${conv.devise === v ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div></div>
      <div id="resultat-devises" aria-live="polite">${resultatDevises()}</div>
      <div class="memo"><strong>Facturer un client à l’étranger</strong>Tu peux facturer en dollars ou en livres, mais la facture indique aussi la contre-valeur en euros et le taux appliqué. Toute TVA due est exprimée en euros. Tu déclares à l’Urssaf le montant réellement encaissé en euros, frais bancaires non déduits.</div>
      ${liensSources(['devises', 'bofipDevises', 'bce', 'declarerCA', 'assujettis'])}`;
  }

  function barre(parts) {
    const tot = parts.reduce((a, p) => a + Math.max(0, p[1]), 0) || 1;
    return `<div class="barre-empilee" role="img" aria-label="${esc(parts.map(p => `${p[0]} ${Math.round(p[1] / tot * 100)} %`).join(', '))}">${parts.map(p => `<span class="${p[2]}" data-w="${Math.max(0, p[1]) / tot * 100}"></span>`).join('')}</div><ul class="legende">${parts.map(p => `<li><span class="pastille ${p[2]}"></span>${esc(p[0])} · ${Math.round(Math.max(0, p[1]) / tot * 100)} %</li>`).join('')}</ul>`;
  }
  function resultatCotis() {
    const c = etat.cotis, r = M.calculerCotisations(c, R, T());
    if (!r) return '<p class="validation">Vérifie les valeurs saisies.</p>';
    const d = c.devise;
    return `${c.devise !== 'EUR' ? `<p class="info-devise">Encaissé ${argent(c.montant, d, 2)} → environ <strong>${argent(r.eur, 'EUR', 2)}</strong> au taux ${esc(T().source)}. Déclare le montant réellement arrivé sur ton compte en euros.</p>` : ''}
      <div class="calcul-sortie">${ligneTriple('Chiffre d’affaires à déclarer (en euros)', r.eur, d, '', '', 'EUR')}
      ${ligneTriple(`Cotisations sociales (${nb(r.taux)} %)`, r.cotisations, d, '', '− ', 'EUR')}
      ${ligneTriple(`Formation professionnelle (${nb(r.tauxCfp)} %)`, r.cfp, d, '', '− ', 'EUR')}
      ${r.tauxVfl ? ligneTriple(`Versement libératoire (${nb(r.tauxVfl)} %)`, r.impot, d, '', '− ', 'EUR') : ''}
      ${ligneTriple(`Il te reste${r.tauxVfl ? ' (impôt payé)' : ' (avant impôt)'}`, r.reste, d, 'total', '', 'EUR')}</div>
      ${barre([['Cotisations', r.cotisations, 'c1'], ['Formation', r.cfp, 'c2'], ['Impôt libératoire', r.impot, 'c3'], ['Pour toi', r.reste, 'c4']])}
      <p class="petit">Taux global appliqué : <strong>${nb(r.global, 1)} %</strong>. Projection sur un an à ce rythme : ${euro(r.annuel)}.</p>
      ${r.alertes.map(a => `<p class="alerte-sim">${esc(a)}</p>`).join('')}
      <p class="minuscule">Repères ${R.annee} vérifiés le ${esc(S.verifie)} : vérifier le taux en vigueur sur la source officielle liée. Pour un calcul officiel, utilise le simulateur de l’Urssaf.</p>`;
  }
  function outilCotis() {
    const c = etat.cotis;
    return `<div class="calcul-champs">${champNum('cotis', 'montant', 'Montant encaissé', c.montant, 0, 10000000, 10)}${champSelect('cotis', 'devise', 'Devise encaissée', c.devise, optDevises())}${champSelect('cotis', 'periode', 'Tu déclares', c.periode, [['mois', 'Chaque mois'], ['trimestre', 'Chaque trimestre']])}
      ${champSelect('cotis', 'regime', 'Catégorie', c.regime, [['bnc', `Libéral BNC (${nb(R.tauxBNC)} %)`], ['bic', `Services BIC (${nb(R.tauxBIC)} %)`]])}
      <div class="options-sim">${caseSim('cotis', 'vfl', 'Versement libératoire', c.vfl)}${caseSim('cotis', 'acre', 'Acre (débuts d’activité)', c.acre)}</div></div>
      <div id="resultat-cotis" aria-live="polite">${resultatCotis()}</div>${liensSources(['microSocial', 'cfp', 'vfl', 'acreActu', 'declarerCA', 'seuilsMicro', 'tvaFranchise', 'simulateurUrssaf'])}`;
  }

  function resultatRevenu() {
    const r = M.calculerRevenu(etat.revenu, R);
    if (!r) return '<p class="validation">Vérifie les valeurs saisies.</p>';
    const besoin = M.tjmPour(30000, etat.revenu, R);
    return `<div class="calcul-sortie"><div class="calcul-ligne"><span>Jours facturés par an</span><strong>${nb(r.jours)}</strong></div>
      ${ligneTriple('Chiffre d’affaires annuel', r.ca)}
      <div class="calcul-ligne"><span>Cotisations sociales (${nb(r.taux)} %)</span><strong>− ${euro(r.cotisations)}</strong></div>
      <div class="calcul-ligne"><span>Formation professionnelle (${nb(r.tauxCfp)} %)</span><strong>− ${euro(r.cfp)}</strong></div>
      ${r.tauxVfl ? `<div class="calcul-ligne"><span>Versement libératoire (${nb(r.tauxVfl)} %)</span><strong>− ${euro(r.impot)}</strong></div>` : ''}
      <div class="calcul-ligne"><span>Frais professionnels</span><strong>− ${euro(r.frais)}</strong></div>
      ${ligneTriple(`Reste annuel${r.tauxVfl ? ' après impôt' : ' avant impôt'}`, r.net, 'EUR', 'total')}
      ${ligneTriple('Soit par mois', r.netMensuel)}</div>
      ${r.alertes.map(a => `<p class="alerte-sim">${esc(a)}</p>`).join('')}
      <p class="petit">Pour garder 30 000 € par an avec ces hypothèses, il faudrait un tarif d’environ <strong>${besoin ? euro(besoin) : '—'}</strong> par jour${besoin ? `, soit ${argent(besoin * T().USD, 'USD')} ou ${argent(besoin * T().GBP, 'GBP')}` : ''}.</p>
      <p class="minuscule">${r.tauxVfl ? '' : 'Sans versement libératoire, l’impôt sur le revenu reste à payer : il dépend de ton foyer fiscal (abattement ' + (etat.revenu.regime === 'bic' ? R.abattementBIC : R.abattementBNC) + ' %). '}Repères ${R.annee} vérifiés le ${esc(S.verifie)} : vérifier le taux en vigueur sur la source officielle liée. CFE non incluse.</p>`;
  }
  function outilRevenu() {
    const r = etat.revenu;
    return `<div class="calcul-champs">${champNum('revenu', 'tjm', 'Tarif journalier (€)', r.tjm, 0, 5000, 10)}${champNum('revenu', 'jours', 'Jours facturés / semaine', r.jours, 0, 7, 0.5)}${champNum('revenu', 'semaines', 'Semaines travaillées / an', r.semaines, 0, 52, 1)}${champNum('revenu', 'frais', 'Frais annuels (€)', r.frais, 0, 1000000, 50)}
      ${champSelect('revenu', 'regime', 'Catégorie', r.regime, [['bnc', `Libéral BNC (${nb(R.tauxBNC)} %)`], ['bic', `Services BIC (${nb(R.tauxBIC)} %)`]])}
      <div class="options-sim">${caseSim('revenu', 'vfl', 'Versement libératoire', r.vfl)}${caseSim('revenu', 'acre', 'Acre (débuts d’activité)', r.acre)}</div></div>
      <div id="resultat-revenu" aria-live="polite">${resultatRevenu()}</div>${liensSources(['microSocial', 'cfp', 'vfl', 'acreActu', 'seuilsMicro', 'tvaFranchise'])}`;
  }
  function resultatTreso() {
    const t = M.calculerTreso(etat.treso);
    if (!t) return '<p class="validation">Vérifie les valeurs saisies.</p>';
    return `<table class="table-cash"><caption>Disponible en fin de mois, après provision et dépenses</caption><thead><tr><th scope="col">Mois</th><th scope="col">Encaissé</th><th scope="col">Mis de côté</th><th scope="col">Disponible</th></tr></thead><tbody>${t.mois.map(m => `<tr ${m.dispo < 0 ? 'class="cash-negatif"' : ''}><th scope="row">M${m.mois}</th><td>${euro(m.ca)}</td><td>${euro(m.provision)}</td><td>${m.dispo < 0 ? '<span class="sr-only">Déficit : </span>' : ''}${euro(m.dispo)}</td></tr>`).join('')}</tbody></table>
      <div class="feedback ${t.alerte ? 'erreur' : ''}"><h3>${t.alerte ? `Découvert dès le mois ${t.alerte}.` : 'Pas de découvert sur 6 mois.'}</h3><p>Réserve pour l’Urssaf et les impôts : <strong>${euro(t.reserve)}</strong> (${argent(t.reserve * T().USD, 'USD')} · ${argent(t.reserve * T().GBP, 'GBP')}). Moyenne encaissée : ${euro(t.moyenne)} par mois. ${t.coussin != null ? `Coussin final : ${nb(t.coussin)} mois de dépenses (objectif : 3).` : ''}</p></div>
      <p class="minuscule">La provision n’est pas de l’argent disponible : c’est ce que tu dois. Prévois aussi la CFE en fin d’année.</p>`;
  }
  function outilTreso() {
    const t = etat.treso;
    return `<div class="calcul-champs">${champNum('treso', 'solde', 'Solde de départ (€)', t.solde, -1000000, 1000000, 50)}${champNum('treso', 'provision', 'Part mise de côté (%)', t.provision, 0, 100, 1)}${champNum('treso', 'depenses', 'Dépenses perso + pro / mois (€)', t.depenses, 0, 1000000, 50)}</div>
      <fieldset class="mois-champs"><legend>Encaissements prévus (convertis en € s’ils arrivent en $ ou £)</legend>${t.ca.map((v, i) => champNum('treso', 'ca.' + i, `Mois ${i + 1} (€)`, v, 0, 1000000, 50)).join('')}</fieldset>
      <div id="resultat-treso" aria-live="polite">${resultatTreso()}</div><p class="minuscule">Astuce : en BNC, ${nb(R.tauxBNC + R.cfpLiberal)} % couvrent les cotisations et la formation ; ajoute ${nb(R.vflBNC)} % avec le versement libératoire, ou une marge pour l’impôt sinon.</p>`;
  }
  function resultatPipeline() {
    const p = M.calculerPipeline(etat.pipeline);
    if (!p) return '<p class="validation">Vérifie les valeurs saisies.</p>';
    return `<div class="entonnoir"><div><strong>${nb(p.contactsMois, 0)}</strong><span>contacts / mois</span></div><div><strong>${nb(p.reponses)}</strong><span>réponses</span></div><div><strong>${nb(p.rdv)}</strong><span>appels</span></div><div><strong>${nb(p.signatures)}</strong><span>signatures</span></div></div>
      <div class="calcul-sortie">${ligneTriple('Chiffre d’affaires signé par mois', p.ca, 'EUR', 'total')}
      <div class="calcul-ligne"><span>Contacts par semaine pour atteindre ${euro(etat.pipeline.objectif)} / mois</span><strong>${p.contactsNecessaires == null ? '—' : nb(p.contactsNecessaires, 0)}</strong></div></div>
      <p class="minuscule">Taux indicatifs : mesure les tiens dans ton tableau de prospection après 30 contacts.</p>`;
  }
  function outilPipeline() {
    const p = etat.pipeline;
    return `<div class="calcul-champs">${champNum('pipeline', 'contacts', 'Contacts / semaine', p.contacts, 0, 1000, 1)}${champNum('pipeline', 'reponse', 'Taux de réponse (%)', p.reponse, 0, 100, 1)}${champNum('pipeline', 'rdv', 'Réponses → appel (%)', p.rdv, 0, 100, 1)}${champNum('pipeline', 'signature', 'Appels → signature (%)', p.signature, 0, 100, 1)}${champNum('pipeline', 'panier', 'Contrat moyen / mois (€)', p.panier, 0, 1000000, 50)}${champNum('pipeline', 'objectif', 'Objectif mensuel (€)', p.objectif, 0, 1000000, 100)}</div>
      <div id="resultat-pipeline" aria-live="polite">${resultatPipeline()}</div>`;
  }

  function resultatBudget() {
    const b = M.calculerBudget(etat.budget, T());
    if (!b) return '<p class="validation">Vérifie les valeurs saisies.</p>';
    return `<div class="calcul-sortie">${ligneTriple('Charges pro par mois', b.mensuel, 'EUR', 'total')}${ligneTriple('Charges pro par an', b.annuel)}
      ${b.part != null ? `<div class="calcul-ligne"><span>Part de ton chiffre d’affaires mensuel</span><strong>${nb(b.part, 1)} %</strong></div><div class="jauge ${b.part > 30 ? 'alerte' : ''}"><span data-w="${Math.min(100, b.part)}"></span></div>` : ''}
      ${ligneTriple('Dépenses payées en $ ou £ (par mois)', b.expose)}</div>
      ${b.expose > 0 ? `<p class="info-devise">Si l’euro baisse de 10 % face au dollar et à la livre, ces abonnements te coûtent environ <strong>${argent(b.sensibilite, 'EUR', 2)} de plus par mois</strong>.</p>` : ''}
      ${b.top ? `<p class="petit">Plus gros poste : <strong>${esc(b.top.nom || 'sans nom')}</strong>, ${argent(b.top.parMois, 'EUR', 2)} par mois.</p>` : ''}
      ${b.part != null && b.part > 30 ? '<p class="alerte-sim">Plus de 30 % de ton chiffre d’affaires part en charges : fais le tri dans les abonnements.</p>' : ''}`;
  }
  function outilBudget() {
    const b = etat.budget;
    return `<div class="calcul-champs deux">${champNum('budget', 'ca', 'Chiffre d’affaires mensuel moyen (€)', b.ca, 0, 100000000, 50)}${champNum('budget', 'fraisChange', 'Frais bancaires de change (%)', b.fraisChange, 0, 100, 0.1)}</div>
      <div class="lignes-edit" role="group" aria-label="Postes de dépense">${b.lignes.map((l, i) => `<div class="ligne-edit">${champTexte('budget', `lignes.${i}.nom`, 'Poste', l.nom, 120)}${champNum('budget', `lignes.${i}.montant`, 'Montant', l.montant, 0, 10000000, 0.01)}${champSelect('budget', `lignes.${i}.devise`, 'Devise', l.devise, M.DEVISES.map(c => [c, `${c} ${SYMB[c]}`]))}${champSelect('budget', `lignes.${i}.freq`, 'Fréquence', l.freq, [['mois', 'par mois'], ['an', 'par an']])}<button class="bouton discret retirer" data-action="retirer-ligne" data-groupe="budget" data-i="${i}" aria-label="Retirer ${esc(l.nom || 'ce poste')}">✕</button></div>`).join('')}</div>
      <div class="actions"><button class="bouton" data-action="ajouter-ligne" data-groupe="budget">+ Ajouter un poste</button></div>
      <div id="resultat-budget" aria-live="polite">${resultatBudget()}</div>
      <p class="minuscule">Les abonnements payés en dollars changent de prix en euros avec le taux. En micro-entreprise, les charges ne se déduisent pas du chiffre d’affaires déclaré : ce budget sert à piloter, pas à déclarer.</p>${liensSources(['declarerCA', 'cfe', 'bce'])}`;
  }

  function texteReporting(r, k) {
    const p = (v, d) => v == null ? '—' : nb(v, d == null ? 1 : d);
    return `Bilan ${r.mois} · ${r.client}

Communauté : ${p(r.abonnesDebut, 0)} → ${p(r.abonnesFin, 0)} abonnés (${k.croissance >= 0 ? '+' : ''}${p(k.croissance, 0)}, ${k.croissancePct == null ? '—' : (k.croissancePct >= 0 ? '+' : '') + p(k.croissancePct)} %).
Portée : ${p(r.impressions, 0)} impressions sur ${p(r.publications, 0)} publications.
Engagement : ${p(k.engagement, 2)} % (${p(r.interactions, 0)} interactions, soit ${p(k.interactionsParPost, 0)} par publication).
Clics : ${p(r.clics, 0)} (taux de clic ${p(k.ctr, 2)} %).
Live : ${p(r.spectateurs, 0)} spectateurs moyens (${k.spectateursPct == null ? '—' : (k.spectateursPct >= 0 ? '+' : '') + p(k.spectateursPct)} % vs mois précédent), ${p(k.heuresRegardees, 0)} heures regardées.
${k.budget > 0 ? `Publicité : ${argent(r.budgetPub, r.devisePub, 2)} (${argent(k.budget, 'EUR', 2)}). Coût pour 1 000 impressions : ${k.cpm == null ? '—' : argent(k.cpm, 'EUR', 2)}. Coût par clic : ${k.cpc == null ? '—' : argent(k.cpc, 'EUR', 2)}. Coût par nouvel abonné : ${k.coutAbonne == null ? '—' : argent(k.coutAbonne, 'EUR', 2)}.\n` : ''}
Décision pour le mois prochain : ${r.decision || 'à compléter'}`;
  }
  function resultatReporting() {
    const r = etat.reporting, k = M.calculerReporting(r, T());
    const kpi = (t, v, s, cl) => `<div class="kpi ${cl || ''}"><span>${t}</span><strong>${v}</strong>${s ? `<small>${s}</small>` : ''}</div>`;
    const sg = v => v == null ? '—' : (v >= 0 ? '+' : '') + nb(v) + ' %';
    return `<div class="kpis">${kpi('Nouveaux abonnés', (k.croissance >= 0 ? '+' : '') + nb(k.croissance, 0), sg(k.croissancePct), k.croissance >= 0 ? 'hausse' : 'baisse')}
      ${kpi('Engagement', k.engagement == null ? '—' : nb(k.engagement, 2) + ' %', 'interactions / impressions')}
      ${kpi('Taux de clic', k.ctr == null ? '—' : nb(k.ctr, 2) + ' %', 'clics / impressions')}
      ${kpi('Spectateurs moyens', nb(r.spectateurs, 0), sg(k.spectateursPct), (k.spectateursPct || 0) >= 0 ? 'hausse' : 'baisse')}
      ${kpi('Heures regardées', nb(k.heuresRegardees, 0), 'spectateurs × heures de live')}
      ${kpi('Coût par abonné', k.coutAbonne == null ? '—' : argent(k.coutAbonne, 'EUR', 2), k.coutAbonne == null ? 'pas de pub ou pas de hausse' : `${argent(k.coutAbonne * T().USD, 'USD', 2)} · ${argent(k.coutAbonne * T().GBP, 'GBP', 2)}`)}</div>
      ${k.budget > 0 ? `<div class="calcul-sortie">${ligneTriple('Budget publicitaire', k.budget, r.devisePub)}<div class="calcul-ligne"><span>Coût pour 1 000 impressions (CPM)</span><strong>${k.cpm == null ? '—' : argent(k.cpm, 'EUR', 2)}</strong></div><div class="calcul-ligne"><span>Coût par clic (CPC)</span><strong>${k.cpc == null ? '—' : argent(k.cpc, 'EUR', 2)}</strong></div></div>` : ''}
      <div class="champ"><label for="texte-reporting">Ton rapport prêt à envoyer</label><textarea id="texte-reporting" readonly rows="11">${esc(texteReporting(r, k))}</textarea></div>
      <div class="actions"><button class="bouton primaire" data-action="copier" data-cible="#texte-reporting">Copier le rapport</button></div>`;
  }
  function outilReporting() {
    const r = etat.reporting;
    return `<div class="calcul-champs">${champTexte('reporting', 'client', 'Client', r.client, 120)}${champTexte('reporting', 'mois', 'Période', r.mois, 60)}${champNum('reporting', 'publications', 'Publications', r.publications, 0, 100000, 1)}
      ${champNum('reporting', 'abonnesDebut', 'Abonnés début de mois', r.abonnesDebut, 0, 1e9, 1)}${champNum('reporting', 'abonnesFin', 'Abonnés fin de mois', r.abonnesFin, 0, 1e9, 1)}${champNum('reporting', 'impressions', 'Impressions', r.impressions, 0, 1e10, 1)}
      ${champNum('reporting', 'interactions', 'Interactions', r.interactions, 0, 1e10, 1)}${champNum('reporting', 'clics', 'Clics', r.clics, 0, 1e10, 1)}${champNum('reporting', 'heures', 'Heures de live', r.heures, 0, 10000, 0.5)}
      ${champNum('reporting', 'spectateursAvant', 'Spectateurs moyens (mois précédent)', r.spectateursAvant, 0, 1e7, 1)}${champNum('reporting', 'spectateurs', 'Spectateurs moyens (ce mois)', r.spectateurs, 0, 1e7, 1)}${champNum('reporting', 'budgetPub', 'Budget pub', r.budgetPub, 0, 1e8, 1)}
      ${champSelect('reporting', 'devisePub', 'Devise du budget pub', r.devisePub, optDevises())}</div>
      <div class="champ"><label for="reporting-decision">La décision à proposer au client</label><textarea id="reporting-decision" data-sim="reporting" data-cle="decision" maxlength="600" rows="3" placeholder="Ex. garder les clips du mardi, arrêter les sondages du dimanche">${esc(r.decision)}</textarea></div>
      <div id="resultat-reporting" aria-live="polite">${resultatReporting()}</div>
      <p class="minuscule">Un bon reporting tient en une page : 3 chiffres, ce qui a marché, une décision. Les plateformes calculent parfois l’engagement autrement : précise ta formule au client.</p>`;
  }

  const SITUATIONS = [['franchise', 'France, franchise de TVA (micro sous les seuils)'], ['tva-fr', 'Je facture la TVA (client en France)'], ['ue-pro', 'Client professionnel dans l’Union européenne'], ['hors-ue-pro', 'Client professionnel hors UE (Royaume-Uni, États-Unis…)']];
  function papier() {
    const d = etat.doc, r = M.calculerDocument(d, T(), R), dv = d.devise, m = v => argent(v, dv, 2);
    const facture = d.type === 'facture', t = T(), taux = dv === 'EUR' ? null : t[dv];
    const mentions = r.mentions.slice();
    const bas = [];
    if (r.etranger) bas.push(`Montants exprimés en ${NOMS[dv]} (${dv}). Contre-valeur : ${argent(r.eur.ht, 'EUR', 2)} HT${r.avecTva ? `, TVA ${argent(r.eur.tva, 'EUR', 2)}, ${argent(r.eur.ttc, 'EUR', 2)} TTC` : ''}. Taux appliqué : 1 € = ${nb(taux, 4)} ${dv} (taux de référence ${t.source} du ${dateFr(t.date)}).`);
    if (r.avecTva && r.etranger) bas.push(`Montant de la TVA en euros : ${argent(r.eur.tva, 'EUR', 2)}.`);
    if (facture) {
      bas.push(`Date d’échéance : ${dateFr(r.echeance)} (${d.delai} jours).`);
      if (d.client.pro) bas.push(`En cas de retard de paiement : pénalités au taux de ${d.penalites}, et indemnité forfaitaire pour frais de recouvrement de ${R.indemniteRetard} €. Escompte pour paiement anticipé : néant.`);
    } else {
      bas.push(`Devis valable jusqu’au ${dateFr(r.echeance)}.${r.acompte ? ` Acompte de ${nb(d.acompte, 0)} % à la signature : ${m(r.acompte)}.` : ''}`);
    }
    return `<article class="papier" aria-label="Aperçu du ${facture ? 'de la facture' : 'devis'}">
      <header class="papier-tete"><div><p class="papier-type">${facture ? 'Facture' : 'Devis'}</p><p>N° ${esc(d.numero || '—')}</p><p>Date : ${esc(dateFr(d.date))}</p></div>
        <div class="papier-emetteur"><strong>${esc(d.emetteur.nom || 'Ton nom')} EI</strong><p>${esc(d.emetteur.adresse || 'Ton adresse')}</p><p>SIRET : ${esc(d.emetteur.siret || '—')}</p><p>${esc(d.emetteur.email)}</p></div></header>
      <div class="papier-client"><p class="papier-label">${facture ? 'Facturé à' : 'Pour'}</p><strong>${esc(d.client.nom || 'Nom du client')}</strong><p>${esc(d.client.adresse || 'Adresse du client')}</p>${d.client.tva ? `<p>N° TVA : ${esc(d.client.tva)}</p>` : ''}</div>
      <table class="papier-table"><thead><tr><th scope="col">Désignation</th><th scope="col">Qté</th><th scope="col">Prix unitaire HT</th><th scope="col">Total HT</th></tr></thead>
        <tbody>${r.lignes.map(l => `<tr><td>${esc(l.desc || '—')}</td><td>${nb(l.qte, 2)}</td><td>${m(l.pu)}</td><td>${m(l.total)}</td></tr>`).join('')}</tbody></table>
      <div class="papier-totaux"><div><span>Total HT</span><strong>${m(r.ht)}</strong></div>${r.avecTva ? `<div><span>TVA ${nb(d.tauxTva, 1)} %</span><strong>${m(r.tva)}</strong></div>` : ''}<div class="net"><span>${r.avecTva ? 'Total TTC' : 'Net à payer'}</span><strong>${m(r.ttc)}</strong></div>${r.etranger ? `<div class="contre"><span>Contre-valeur</span><strong>${argent(r.eur.ttc, 'EUR', 2)}</strong></div>` : ''}</div>
      <div class="papier-mentions">${mentions.map(x => `<p><strong>${esc(x)}</strong></p>`).join('')}${d.situation === 'ue-pro' ? `<p>N° TVA intracommunautaire du client : ${esc(d.client.tva || 'à compléter')}. N° TVA de l’émetteur : à compléter.</p>` : ''}${bas.map(x => `<p>${esc(x)}</p>`).join('')}${d.notes ? `<p>${esc(d.notes)}</p>` : ''}</div>
      ${!facture ? '<div class="papier-signature"><p>Bon pour accord, date et signature du client :</p><span></span></div>' : ''}
    </article>`;
  }
  function resultatDoc() {
    const r = M.calculerDocument(etat.doc, T(), R);
    if (!r) return '<p class="validation">Vérifie les valeurs saisies.</p>';
    return `${r.alertes.length ? `<div class="alertes-doc" role="status">${r.alertes.map(a => `<p class="alerte-sim">${esc(a)}</p>`).join('')}</div>` : '<p class="ok-doc">Les mentions principales sont là. Relis avant d’envoyer.</p>'}
      <div class="calcul-sortie">${ligneTriple(r.avecTva ? 'Total TTC' : 'Total à payer', r.eur.ttc, etat.doc.devise, 'total')}</div>
      ${papier()}
      <div class="actions"><button class="bouton primaire" data-action="imprimer-doc">Imprimer ou enregistrer en PDF</button>${etat.doc.type === 'devis' ? '<button class="bouton" data-action="vers-facture">Devis accepté : en faire une facture</button>' : '<button class="bouton" data-action="recette-depuis-doc">Enregistrer dans le livre des recettes</button>'}</div>`;
  }
  function outilDoc() {
    const d = etat.doc;
    return `<div class="calcul-champs">${champSelect('doc', 'type', 'Document', d.type, [['devis', 'Devis'], ['facture', 'Facture']])}${champTexte('doc', 'numero', 'Numéro', d.numero, 40)}${d.type === 'facture' ? '<div class="champ-bouton"><button class="bouton" data-action="numero-suivant">Prochain numéro libre</button></div>' : ''}${champTexte('doc', 'date', 'Date', d.date, 10, '', 'date')}
      ${champNum('doc', 'delai', d.type === 'devis' ? 'Validité (jours)' : 'Délai de paiement (jours)', d.delai, 0, 60, 1)}${champSelect('doc', 'devise', 'Devise de facturation', d.devise, optDevises())}${champSelect('doc', 'situation', 'Situation TVA', d.situation, SITUATIONS)}
      ${d.situation === 'tva-fr' ? champNum('doc', 'tauxTva', 'Taux de TVA (%)', d.tauxTva, 0, 100, 0.1) : ''}${d.type === 'devis' ? champNum('doc', 'acompte', 'Acompte à la signature (%)', d.acompte, 0, 100, 5) : ''}</div>
      <details class="bloc-plie" open><summary>Toi et ton client</summary><div class="calcul-champs">${champTexte('doc', 'emetteur.nom', 'Ton nom (EI ajouté)', d.emetteur.nom, 120, 'Laetitia Exemple')}${champTexte('doc', 'emetteur.siret', 'SIRET', d.emetteur.siret, 20)}${champTexte('doc', 'emetteur.email', 'E-mail', d.emetteur.email, 120)}
        ${champTexte('doc', 'emetteur.adresse', 'Ton adresse', d.emetteur.adresse, 200)}${champTexte('doc', 'client.nom', 'Client', d.client.nom, 120, 'PixelNord Studio')}${champTexte('doc', 'client.adresse', 'Adresse du client', d.client.adresse, 200)}
        ${champTexte('doc', 'client.tva', 'N° TVA du client (si UE)', d.client.tva, 30)}<div class="options-sim">${caseSim('doc', 'client.pro', 'Le client est un professionnel', d.client.pro)}</div></div></details>
      <div class="lignes-edit doc" role="group" aria-label="Lignes du document">${d.lignes.map((l, i) => `<div class="ligne-edit">${champTexte('doc', `lignes.${i}.desc`, 'Désignation', l.desc, 300)}${champNum('doc', `lignes.${i}.qte`, 'Quantité', l.qte, 0, 1000000, 0.5)}${champNum('doc', `lignes.${i}.pu`, `Prix unitaire HT (${SYMB[d.devise]})`, l.pu, 0, 100000000, 0.01)}<button class="bouton discret retirer" data-action="retirer-ligne" data-groupe="doc" data-i="${i}" aria-label="Retirer la ligne ${i + 1}">✕</button></div>`).join('')}</div>
      <div class="actions"><button class="bouton" data-action="ajouter-ligne" data-groupe="doc">+ Ajouter une ligne</button></div>
      <div class="calcul-champs deux">${champTexte('doc', 'penalites', 'Taux des pénalités de retard', d.penalites, 120)}${champTexte('doc', 'notes', 'Note libre (conditions, droits d’usage…)', d.notes, 400)}</div>
      <div id="resultat-doc" aria-live="polite">${resultatDoc()}</div>
      <p class="minuscule">Modèle pédagogique : vérifie les mentions obligatoires sur les sources officielles liées. À partir du ${esc(R.efactureReception)}, tu dois pouvoir recevoir des factures électroniques ; l’émission devient obligatoire pour les micro-entreprises au ${esc(R.efactureEmission)}.</p>
      ${liensSources(['factures', 'mentionsEco', 'devises', 'bofipDevises', 'assujettis', 'tvaFranchise', 'delais', 'efacture'])}`;
  }
  /* ---------- Gestion : recettes, plafonds, échéances, planning, contrat, facture électronique ---------- */
  const annee = () => Number(aujourdhui().slice(0, 4));
  const nouvelId = () => 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const telecharger = (contenu, type, nom) => {
    const url = URL.createObjectURL(new Blob([contenu], { type })), a = document.createElement('a');
    a.href = url; a.download = nom; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  function champPf(groupe, cle, libelle, val, type, extra) {
    const id = `pf-${groupe}-${cle}`;
    return `<div><label for="${id}">${libelle}</label><input id="${id}" data-pf="${groupe}.${cle}" type="${type || 'text'}" ${type === 'number' ? 'inputmode="decimal" min="0" step="0.01"' : 'maxlength="200"'} value="${esc(val)}" ${extra || ''}></div>`;
  }
  function selectPf(groupe, cle, libelle, val, options, rerender) {
    const id = `pf-${groupe}-${cle}`;
    return `<div><label for="${id}">${libelle}</label><select id="${id}" data-pf="${groupe}.${cle}" ${rerender ? 'data-rerender="1"' : ''}>${options.map(([v, t]) => `<option value="${esc(v)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>`;
  }
  const kpi = (libelle, valeur, note) => `<div class="kpi"><span class="petit">${esc(libelle)}</span><strong>${valeur}</strong>${note ? `<span class="minuscule">${note}</span>` : ''}</div>`;

  /* Livre des recettes */
  function pfRecette() {
    if (!pf.recette) pf.recette = { date: aujourdhui(), num: G.numeroSuivant(etat.recettes, annee()), client: '', desc: '', montant: '', devise: 'EUR', statut: 'attente', datePaiement: '', mode: 'virement' };
    return pf.recette;
  }
  function resultatRecettes() {
    const rs = G.trier(etat.recettes), y = annee(), t = G.totauxRecettes(rs, y), tr = G.trous(rs, y), dbl = G.doublons(rs);
    const alertes = [];
    if (tr.length) alertes.push(`Numéros manquants dans ta série ${y} : ${tr.join(', ')}. Une facture ne se supprime pas : si tu l’annules, garde son numéro et émets un avoir.`);
    if (dbl.length) alertes.push(`Numéro utilisé deux fois : ${dbl.join(', ')}. Chaque facture a un numéro unique.`);
    return `<div class="kpis">${kpi(`Encaissé en ${y}`, euro(t.encaisse), `${t.nbPaye} paiement${t.nbPaye > 1 ? 's' : ''}`)}${kpi('Facturé, pas encore payé', euro(t.attente), `${t.nbAttente} facture${t.nbAttente > 1 ? 's' : ''}`)}${kpi('Prochain numéro', esc(G.numeroSuivant(rs, y)), 'Série continue, sans trou')}</div>
      ${alertes.map(a => `<p class="alerte-sim">${esc(a)}</p>`).join('')}
      ${rs.length ? `<div class="table-defile"><table class="table-cash"><caption>Livre des recettes, classé par date</caption><thead><tr><th scope="col">Date</th><th scope="col">N°</th><th scope="col">Client</th><th scope="col">Désignation</th><th scope="col">Montant HT</th><th scope="col">Statut</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>${rs.map(r => `<tr class="${r.statut === 'paye' ? '' : 'en-attente'}"><td>${esc(dateCourte(r.statut === 'paye' ? r.datePaiement : r.date))}</td><td>${esc(r.num || '—')}</td><td>${esc(r.client || '—')}</td><td>${esc(r.desc || '—')}</td>
          <td>${argent(r.montant, r.devise, 2)}${r.devise !== 'EUR' ? `<br><small>≈ ${argent(G.eur(r), 'EUR', 2)}</small>` : ''}</td>
          <td>${r.statut === 'paye' ? `Payé · ${esc(G.MODES_NOMS[r.mode])}` : 'En attente'}</td>
          <td class="cellule-actions"><button class="bouton discret" data-action="recette-paye" data-id="${esc(r.id)}">${r.statut === 'paye' ? 'Remettre en attente' : 'Marquer payé'}</button><button class="bouton discret" data-action="recette-suppr" data-id="${esc(r.id)}" aria-label="Supprimer ${esc(r.num || r.desc || 'cette ligne')}">✕</button></td></tr>`).join('')}</tbody></table></div>`
      : '<p class="petit">Aucune ligne pour l’instant. Ajoute ta première facture ci-dessus, ou enregistre-la depuis l’outil Devis &amp; facture.</p>'}
      <div class="actions"><button class="bouton primaire" data-action="csv-recettes" ${rs.length ? '' : 'disabled'}>Exporter en CSV (Excel, comptable)</button></div>`;
  }
  function outilRecettes() {
    const f = pfRecette();
    return `<p class="petit">Le livre des recettes liste chaque encaissement, dans l’ordre, avec la date, le client, la nature de la prestation, le montant et le mode de règlement. Il reste obligatoire en micro-entreprise, même avec une plateforme de facturation. Tes factures y gardent une numérotation continue.</p>
      <details class="bloc-plie" open><summary>Ajouter une facture ou un encaissement</summary><div class="calcul-champs">
        ${champPf('recette', 'num', 'Numéro de facture', f.num, 'text', 'maxlength="40"')}${champPf('recette', 'date', 'Date de la facture', f.date, 'date')}${champPf('recette', 'client', 'Client', f.client, 'text', 'list="clients-connus"')}
        ${champPf('recette', 'desc', 'Désignation', f.desc)}${champPf('recette', 'montant', 'Montant HT', f.montant, 'number')}${selectPf('recette', 'devise', 'Devise', f.devise, optDevises())}
        ${selectPf('recette', 'statut', 'Statut', f.statut, [['attente', 'En attente de paiement'], ['paye', 'Déjà payée']], true)}
        ${f.statut === 'paye' ? champPf('recette', 'datePaiement', 'Date de paiement', f.datePaiement || aujourdhui(), 'date') + selectPf('recette', 'mode', 'Mode de règlement', f.mode, G.MODES.map(m => [m, G.MODES_NOMS[m]])) : ''}</div>
        <datalist id="clients-connus">${G.clientsConnus(etat.planning, etat.recettes).map(c => `<option value="${esc(c)}"></option>`).join('')}</datalist>
        <p id="erreur-recette" class="validation" role="alert"></p>
        <div class="actions"><button class="bouton primaire" data-action="recette-ajouter">Ajouter au livre</button><button class="bouton" data-action="recette-depuis-doc">Reprendre ma facture en cours (Devis &amp; facture)</button></div></details>
      <div id="resultat-recettes" aria-live="polite">${resultatRecettes()}</div>
      <p class="minuscule">Les montants en dollars et en livres sont convertis au taux affiché en haut de la page à l’instant de la saisie. Le chiffre d’affaires déclaré à l’Urssaf est le montant HT réellement encaissé, en euros.</p>
      ${liensSources(['declarerCA', 'factures'])}`;
  }
  const dateCourte = iso => { if (!iso) return '—'; const d = new Date(iso + 'T12:00:00Z'); return isNaN(d) ? iso : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }); };

  /* Tableau de bord des plafonds */
  function resultatPlafonds() {
    const p = G.plafonds(etat.recettes, annee(), aujourdhui(), etat.plafonds, R);
    return `<div class="kpis">${kpi(`Chiffre d’affaires ${annee()}`, euro(p.ca), 'Encaissé, HT, en euros')}${kpi('Facturé en attente', euro(p.attente), 'Pas encore compté')}${kpi('Projection sur l’année', euro(Math.round(p.projection)), `Au rythme de ${p.ecoules} jours`)}</div>
      ${p.alertes.map(a => `<p class="alerte-sim">${esc(a)}</p>`).join('')}
      <div class="pile seuils">${p.seuils.map(s => `<article class="seuil niveau-${s.niveau}"><div class="seuil-tete"><h3>${esc(s.nom)}</h3><span class="etiquette">${esc(G.NIVEAUX_NOMS[s.niveau])}</span></div>
        <div class="jauge ${s.niveau === 'alerte' || s.niveau === 'depasse' ? 'alerte' : ''}" role="img" aria-label="${nb(s.pct, 0)} % du seuil de ${nb(s.valeur, 0)} euros"><span data-w="${Math.min(100, s.pct)}"></span></div>
        <p class="petit"><strong>${euro(p.ca)}</strong> sur ${euro(s.valeur)} (${nb(s.pct, 0)} %) · ${s.reste > 0 ? `reste ${euro(s.reste)}` : `dépassé de ${euro(-s.reste)}`}</p>
        <p class="minuscule">${esc(s.info)}${s.jour ? ` À ce rythme, tu franchirais ce seuil vers le ${esc(dateFr(s.jour))}.` : ''}</p></article>`).join('')}</div>`;
  }
  function outilPlafonds() {
    const pl = etat.plafonds;
    return `<p class="petit">Le tableau se remplit tout seul avec les paiements du livre des recettes. Ajoute ce que tu as déjà encaissé cette année en dehors de l’outil.</p>
      <div class="calcul-champs deux">${champNum('plafonds', 'anterieur', `Déjà encaissé en ${annee()} hors outil (€ HT)`, pl.anterieur, 0, 1000000000, 100)}${champNum('plafonds', 'caN1', `Chiffre d’affaires de ${annee() - 1} (€ HT)`, pl.caN1, 0, 1000000000, 100)}</div>
      <div id="resultat-plafonds" aria-live="polite">${resultatPlafonds()}</div>
      <p class="minuscule">Repères ${R.annee} : plafond micro ${euro(R.plafondServices)}, franchise de TVA ${euro(R.tvaBase)} (majoré ${euro(R.tvaMajore)}). Repères pédagogiques : vérifie sur les sources officielles.</p>
      ${liensSources(['seuilsMicro', 'tvaFranchise', 'microSocial'])}`;
  }

  /* Calendrier des échéances */
  function listeEcheances() {
    const y = annee(), vus = new Set(), tout = [];
    for (const e of G.echeances(y, etat.echeances).concat(G.echeances(y + 1, etat.echeances))) if (!vus.has(e.id)) { vus.add(e.id); tout.push(e); }
    const limite = G.ajouter(aujourdhui(), 400);
    return tout.filter(e => (e.date && e.date >= aujourdhui() && e.date <= limite) || (!e.date && e.id === `impot-${y}`));
  }
  function resultatEcheances() {
    const liste = listeEcheances(), dates = liste.filter(e => e.date), sans = liste.filter(e => !e.date);
    const faite = e => etat.echeancesFaites.includes(e.id);
    const carte = e => `<li class="echeance type-${e.type} ${faite(e) ? 'faite' : ''}"><div class="echeance-date"><strong>${e.date ? esc(dateFr(e.date)) : 'Date variable'}</strong>${e.fixe ? '' : '<span class="etiquette">À vérifier</span>'}</div><div><h3>${esc(e.titre)}</h3><p class="petit">${esc(e.detail)}</p>${e.date ? `<a class="lien-action" href="${esc(G.lienGoogleAgenda(e))}" target="_blank" rel="noopener noreferrer">Ajouter à Google Agenda <span class="sr-only">(nouvel onglet)</span></a> ` : ''}${e.date ? `<button class="bouton discret" data-action="${faite(e) ? 'echeance-defaire' : 'echeance-fait'}" data-id="${esc(e.id)}" aria-pressed="${faite(e)}">${faite(e) ? 'Fait ✓ (annuler)' : 'Marquer comme fait'}</button>` : ''}</div></li>`;
    return `<ul class="echeances">${dates.map(carte).join('')}${sans.map(carte).join('')}</ul>
      <div class="actions"><button class="bouton primaire" data-action="telecharger-ics">Tout exporter vers mon agenda (.ics)</button></div>
      <p class="minuscule">Le fichier .ics s’importe dans Google Agenda (Paramètres → Importer), Apple Calendrier ou Outlook. Un rappel est ajouté 3 jours avant chaque échéance. Les dates marquées « À vérifier » changent selon l’année ou ton avis : confirme-les sur ton avis ou sur impots.gouv.fr.</p>`;
  }
  function outilEcheances() {
    const e = etat.echeances;
    return `<div class="calcul-champs deux">${champSelect('echeances', 'periodicite', 'Je déclare mon chiffre d’affaires', e.periodicite, [['mois', 'Chaque mois'], ['trimestre', 'Chaque trimestre']])}</div>
      <div class="options-sim">${caseSim('echeances', 'cfe', 'Je suis soumise à la CFE (pas la première année)', e.cfe)}</div>
      <div id="resultat-echeances" aria-live="polite">${resultatEcheances()}</div>
      ${liensSources(['declarerCA', 'cfe', 'fiscMicro', 'efacture'])}`;
  }

  /* Planning éditorial */
  function pfPlan() {
    if (!pf.plan) pf.plan = { date: aujourdhui(), heure: '', client: '', type: 'live', titre: '' };
    return pf.plan;
  }
  function resultatPlanning() {
    const w = G.semaine(etat.planning, semaineDebut, pf.filtreClient || ''), fin = G.ajouter(semaineDebut, 6);
    const jourFr = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
    const cl = Object.entries(w.parClient);
    return `<div class="semaine-nav"><button class="bouton" data-action="sem" data-d="-1" aria-label="Semaine précédente">←</button><strong>Du ${esc(dateFr(semaineDebut))} au ${esc(dateFr(fin))}</strong><button class="bouton" data-action="sem" data-d="1" aria-label="Semaine suivante">→</button><button class="bouton discret" data-action="sem" data-d="0">Cette semaine</button></div>
      <p class="petit">${w.total ? `${w.fait} sur ${w.total} fait${w.total > 1 ? 's' : ''} cette semaine.` : 'Rien de prévu cette semaine.'}</p>
      ${cl.length ? `<div class="kpis">${cl.map(([nom, c]) => kpi(nom, `${c.total}`, `${c.live} live${c.live > 1 ? 's' : ''} · ${c.clip} clip${c.clip > 1 ? 's' : ''} · ${c.post} post${c.post > 1 ? 's' : ''}${c.autre ? ` · ${c.autre} autre${c.autre > 1 ? 's' : ''}` : ''}`)).join('')}</div>` : ''}
      <ol class="semaine">${w.jours.map(j => `<li class="${j.date === aujourdhui() ? 'aujourdhui' : ''}"><h3>${esc(jourFr(j.date))}</h3>${j.items.length ? `<ul>${j.items.map(x => `<li class="plan-item type-${x.type} ${x.fait ? 'fait' : ''}"><label class="plan-case"><input type="checkbox" data-action="plan-fait" data-id="${esc(x.id)}" ${x.fait ? 'checked' : ''}><span><span class="etiquette">${esc(G.TYPES_PLANNING[x.type])}</span> ${x.heure ? `<strong>${esc(x.heure)}</strong> ` : ''}${esc(x.titre || '—')} <em>· ${esc(x.client || 'Sans client')}</em></span></label><button class="bouton discret" data-action="plan-suppr" data-id="${esc(x.id)}" aria-label="Supprimer ${esc(x.titre || 'cet élément')}">✕</button></li>`).join('')}</ul>` : '<p class="minuscule">—</p>'}</li>`).join('')}</ol>`;
  }
  function outilPlanning() {
    const f = pfPlan(), clients = G.clientsConnus(etat.planning, etat.recettes);
    return `<p class="petit">Planifie par client tes lives, tes clips et tes publications, semaine par semaine. Coche quand c’est fait.</p>
      <details class="bloc-plie" open><summary>Ajouter au planning</summary><div class="calcul-champs">
        ${champPf('plan', 'titre', 'Quoi ?', f.titre, 'text', 'placeholder="Live Zelda, clip du boss…"')}${champPf('plan', 'client', 'Client', f.client, 'text', 'list="clients-connus-plan"')}${selectPf('plan', 'type', 'Type', f.type, Object.entries(G.TYPES_PLANNING))}
        ${champPf('plan', 'date', 'Jour', f.date, 'date')}${champPf('plan', 'heure', 'Heure (facultatif)', f.heure, 'time')}</div>
        <datalist id="clients-connus-plan">${clients.map(c => `<option value="${esc(c)}"></option>`).join('')}</datalist>
        <p id="erreur-plan" class="validation" role="alert"></p><div class="actions"><button class="bouton primaire" data-action="plan-ajouter">Ajouter</button></div></details>
      <div class="calcul-champs deux"><div><label for="pf-filtre-client">Afficher un seul client</label><select id="pf-filtre-client" data-pf="filtre.client" data-rerender="1"><option value="">Tous les clients</option>${clients.map(c => `<option value="${esc(c)}" ${pf.filtreClient === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div></div>
      <div id="resultat-planning" aria-live="polite">${resultatPlanning()}</div>`;
  }

  /* Contrat et CGV */
  function resultatContrat() {
    const c = etat.contrat, texte = c.type === 'cgv' ? G.cgv(c, R) : G.contrat(c, R, aujourdhui());
    return `<div class="avertissement"><p><strong>Modèle pédagogique, pas un conseil juridique.</strong> Remplace les passages entre crochets, adapte chaque clause à ton cas, puis fais relire par un juriste ou une structure d’accompagnement avant de signer, surtout pour la cession de droits.</p></div>
      <article class="papier contrat-texte" aria-label="Aperçu du ${c.type === 'cgv' ? 'CGV' : 'contrat'}">${esc(texte)}</article>
      <div class="actions"><button class="bouton primaire" data-action="copier-contrat">Copier le texte</button><button class="bouton" data-action="imprimer-contrat">Imprimer ou enregistrer en PDF</button></div>`;
  }
  function outilContrat() {
    const c = etat.contrat;
    return `<div class="calcul-champs deux">${champSelect('contrat', 'type', 'Document', c.type, [['contrat', 'Contrat de prestation (avec ses clauses)'], ['cgv', 'Conditions générales de vente (CGV)']])}${champTexte('contrat', 'ville', 'Ville de signature', c.ville, 80)}</div>
      <details class="bloc-plie" open><summary>Toi et ton client</summary><div class="calcul-champs">${champTexte('contrat', 'prestataire.nom', 'Ton nom', c.prestataire.nom, 120)}${champTexte('contrat', 'prestataire.siret', 'SIRET', c.prestataire.siret, 20)}${champTexte('contrat', 'prestataire.email', 'E-mail', c.prestataire.email, 120)}
        ${champTexte('contrat', 'prestataire.adresse', 'Ton adresse', c.prestataire.adresse, 200)}${champTexte('contrat', 'client.nom', 'Client (nom ou société)', c.client.nom, 120)}${champTexte('contrat', 'client.adresse', 'Adresse du client', c.client.adresse, 200)}${champTexte('contrat', 'client.representant', 'Représentant du client', c.client.representant, 120)}</div></details>
      <details class="bloc-plie" open><summary>Mission, prix et paiement</summary><div class="calcul-champs">${champTexte('contrat', 'prestation', 'Missions', c.prestation, 600)}${champTexte('contrat', 'debut', 'Début', c.debut, 10, '', 'date')}${champNum('contrat', 'duree', 'Durée en mois (0 = indéterminée)', c.duree, 0, 120, 1)}
        ${champNum('contrat', 'preavis', 'Préavis de résiliation (jours)', c.preavis, 0, 365, 1)}${champNum('contrat', 'prix', 'Prix HT', c.prix, 0, 100000000, 10)}${champSelect('contrat', 'devise', 'Devise', c.devise, optDevises())}
        ${champSelect('contrat', 'modalite', 'Prix', c.modalite, [['mois', 'Par mois'], ['mission', 'Par mission'], ['forfait', 'Au forfait']])}${champSelect('contrat', 'tva', 'TVA', c.tva, [['franchise', 'Franchise de TVA (art. 293 B)'], ['tva', 'Je facture la TVA'], ['etranger', 'Client pro étranger']])}
        ${champNum('contrat', 'acompte', 'Acompte à la signature (%)', c.acompte, 0, 100, 5)}${champNum('contrat', 'delai', 'Délai de paiement (jours)', c.delai, 0, 365, 1)}${champTexte('contrat', 'penalites', 'Taux des pénalités de retard', c.penalites, 120)}</div></details>
      <details class="bloc-plie"><summary>Droits d’auteur et droit à l’image</summary><div class="options-sim">${caseSim('contrat', 'cession', 'Inclure la cession des droits d’auteur sur mes créations', c.cession)}${caseSim('contrat', 'cessionPrix', 'La cession est comprise dans le prix', c.cessionPrix)}${caseSim('contrat', 'droitImage', 'Inclure la clause de droit à l’image', c.droitImage)}</div>
        <div class="calcul-champs">${champTexte('contrat', 'cessionObjet', 'Contenus concernés', c.cessionObjet, 200)}${champTexte('contrat', 'cessionSupports', 'Supports autorisés', c.cessionSupports, 300)}${champTexte('contrat', 'cessionTerritoire', 'Territoire', c.cessionTerritoire, 80)}${champTexte('contrat', 'cessionDuree', 'Durée', c.cessionDuree, 40)}</div>
        <p class="minuscule">La loi demande, pour chaque droit cédé, d’indiquer l’étendue, la destination, le lieu et la durée de la cession. Un droit non mentionné n’est pas cédé.</p></details>
      <div id="resultat-contrat" aria-live="polite">${resultatContrat()}</div>
      ${liensSources(['cession', 'inpiAuteur', 'image', 'cnilImage', 'delais', 'influenceContrat'])}`;
  }

  /* Facture électronique */
  function resultatEfacture() {
    const a = G.avancementEfact(etat.efact);
    return `<div class="jauge" role="img" aria-label="${a.faits} étapes sur ${a.total}"><span data-w="${Math.round(a.faits / a.total * 100)}"></span></div><p class="petit"><strong>${a.faits} / ${a.total}</strong> étapes faites.${a.meilleur && a.meilleur.score > 0 ? ` Plateforme en tête de ta grille : <strong>${esc(a.meilleur.nom)}</strong> (${a.meilleur.score} / ${G.CRITERES.length}).` : ''}</p>`;
  }
  function outilEfacture() {
    const ef = etat.efact;
    return `<section class="lecon-bloc"><h3>À retenir en 2 minutes</h3>
      <ul class="liste-simple"><li><strong>Facture électronique</strong> : entre professionnels établis en France, la facture passe par une <strong>plateforme agréée</strong> (ex-« PDP »), pas par un simple PDF envoyé par e-mail.</li>
        <li><strong>Calendrier</strong> : recevoir des factures électroniques est obligatoire pour toutes les entreprises depuis le ${esc(R.efactureReception)} ; émettre l’est pour les micro-entreprises au ${esc(R.efactureEmission)}.</li>
        <li><strong>Pas de facture électronique, mais un e-reporting</strong> : pour les clients à l’étranger (dollars, livres) et les particuliers, on te demandera de transmettre des données de transaction, pas une facture structurée.</li>
        <li><strong>Formats</strong> : les plateformes gèrent les formats structurés (Factur-X, UBL, CII). Toi, tu saisis ta facture comme d’habitude.</li>
        <li><strong>Tu gardes</strong> : numérotation continue, mentions obligatoires, livre des recettes, conservation 10 ans.</li></ul>
      <p class="minuscule">Les modalités précises (liste des plateformes, e-reporting, sanctions) évoluent : vérifie sur la page officielle ci-dessous avant d’agir.</p></section>
      <h3>Ma checklist</h3><div id="resultat-efacture" aria-live="polite">${resultatEfacture()}</div>
      <div class="checklist">${G.CHECKLIST.map(([id, t]) => caseSim('efact', `coches.${id}`, t, ef.coches[id])).join('')}</div>
      <h3>Choisir ma plateforme</h3><p class="petit">Note 2 ou 3 plateformes de la liste officielle et coche les critères remplis. Demande le prix et les conditions par écrit.</p>
      <div class="table-defile"><table class="table-cash grille-choix"><caption>Grille de choix</caption><thead><tr><th scope="col">Plateforme</th>${G.CRITERES.map(([, n]) => `<th scope="col">${esc(n)}</th>`).join('')}</tr></thead>
        <tbody>${ef.choix.map((c, i) => `<tr><th scope="row"><label class="sr-only" for="efact-choix-${i}-nom">Nom de la plateforme ${i + 1}</label><input id="efact-choix-${i}-nom" data-sim="efact" data-cle="choix.${i}.nom" type="text" maxlength="80" value="${esc(c.nom)}" placeholder="Plateforme ${i + 1}"></th>${G.CRITERES.map(([k, n]) => `<td><label class="choix case"><input type="checkbox" data-sim="efact" data-cle="choix.${i}.${k}" ${c[k] ? 'checked' : ''}><span class="sr-only">${esc(n)}</span></label></td>`).join('')}</tr>`).join('')}</tbody></table></div>
      ${liensSources(['efacture', 'factures', 'delais'])}`;
  }

  /* Veille et idées */
  let veille = { etat: 'idle', data: null };
  const CAT_VEILLE = [['createurs', 'Créateurs Twitch'], ['', 'Tout'], ['actu', 'Actualités'], ['communaute', 'Communauté'], ['alerte', 'Alertes Google']];
  function nettoyerVeille(d) {
    const s = (v, n) => typeof v === 'string' ? v.slice(0, n) : '';
    const items = Array.isArray(d && d.items) ? d.items.slice(0, 500).filter(x => x && typeof x === 'object' && /^https?:\/\/[^\s<>"']+$/i.test(x.lien)).map(x => ({
      titre: s(x.titre, 200), lien: x.lien.slice(0, 600), date: s(x.date, 40), resume: s(x.resume, 240), source: s(x.source, 80), categorie: s(x.categorie, 20), editeur: s(x.editeur, 80) })) : [];
    const sources = Array.isArray(d && d.sources) ? d.sources.slice(0, 50).map(x => ({ nom: s(x && x.nom, 80), statut: x && x.statut === 'ok' ? 'ok' : 'erreur', nb: Number(x && x.nb) || 0 })) : [];
    return { maj: s(d && d.maj, 40) || null, items, sources };
  }
  function chargerVeille() {
    if (veille.etat === 'chargement') return;
    veille = { etat: 'chargement', data: veille.data };
    fetch('./data/veille.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(d => { veille = { etat: 'ok', data: nettoyerVeille(d) }; })
      .catch(() => { veille = { etat: 'erreur', data: veille.data }; })
      .finally(() => { if (etat.vue === 'veille') majVeilleZone(); });
  }
  function majVeilleZone() { const z = $('#veille-flux'); if (z) z.innerHTML = fluxVeille(); }
  function ilYa(iso) {
    const t = Date.parse(iso); if (!Number.isFinite(t)) return '';
    const m = Math.max(0, Math.round((Date.now() - t) / 60000));
    return m < 60 ? `il y a ${Math.max(1, m)} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`;
  }
  const sansAccent = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function liensRecherche(q) {
    const e = encodeURIComponent(q);
    return `<p class="petit">Cherche-le directement :</p><div class="actions"><a class="bouton" href="https://news.google.com/search?q=${e}&hl=fr&gl=FR&ceid=FR:fr" target="_blank" rel="noopener noreferrer">Google Actualités <span class="sr-only">(nouvel onglet)</span></a><a class="bouton" href="https://www.youtube.com/results?search_query=${e}" target="_blank" rel="noopener noreferrer">YouTube <span class="sr-only">(nouvel onglet)</span></a><a class="bouton" href="https://www.twitch.tv/search?term=${e}" target="_blank" rel="noopener noreferrer">Twitch <span class="sr-only">(nouvel onglet)</span></a></div><p class="minuscule">Pour qu’un créateur soit suivi automatiquement, envoie-le à JT depuis « Mes idées pour le logiciel » (type « Un créateur à suivre »).</p>`;
  }
  function fluxVeille() {
    const f = pf.veille || { cat: 'createurs', q: '' };
    if (veille.etat === 'idle' || (veille.etat === 'chargement' && !veille.data)) return '<p class="petit" role="status">Chargement de la veille…</p>';
    if (!veille.data) return '<p class="alerte-sim" role="status">La veille n’est pas disponible pour l’instant (hors connexion pour la première fois ?). Réessaie plus tard : la boîte à idées marche déjà.</p>';
    const d = veille.data, q = (f.q || '').trim(), mots = sansAccent(q).split(/\s+/).filter(Boolean);
    const attente = f.cat === 'createurs' && !d.items.some(x => x.categorie === 'createurs'), cat = (attente || q) ? '' : f.cat;
    const liste = d.items.map((x, i) => Object.assign({ i }, x)).filter(x => (!cat || x.categorie === cat) && (!mots.length || mots.every(m => sansAccent(x.titre + ' ' + x.resume + ' ' + x.source + ' ' + x.editeur).includes(m))));
    const pannes = d.sources.filter(s => s.statut !== 'ok'), max = (q || veille.tout) ? 60 : 5;
    return `${attente ? '<p class="petit" role="status">Les sources spécialisées créateurs Twitch arrivent à la prochaine collecte (dans l’heure). En attendant, tout est affiché.</p>' : ''}<p class="petit">${d.maj ? `Dernière nouveauté ${esc(ilYa(d.maj))}.` : 'Aucune collecte pour l’instant.'} ${d.items.length} éléments de ${d.sources.filter(s => s.statut === 'ok').length} source${d.sources.filter(s => s.statut === 'ok').length > 1 ? 's' : ''}.${veille.etat === 'erreur' ? ' Affichage de la dernière copie : tu es peut-être hors connexion.' : ''}</p>
      ${pannes.length ? `<details class="bloc-plie"><summary>${pannes.length} source${pannes.length > 1 ? 's' : ''} sans réponse</summary><p class="petit">${pannes.map(s => esc(s.nom)).join(' · ')}. Ce n’est pas grave : les autres continuent, et les anciens éléments sont conservés.</p></details>` : ''}
      ${liste.length ? `<ul class="flux-veille">${liste.slice(0, max).map(x => `<li class="flux-item"><div><p class="petit"><span class="etiquette">${esc(x.editeur || x.source)}</span> ${esc(ilYa(x.date))}</p><h3><a href="${esc(x.lien)}" target="_blank" rel="noopener noreferrer">${esc(x.titre)} <span class="sr-only">(nouvel onglet)</span></a></h3>${x.resume ? `<p class="petit">${esc(x.resume)}</p>` : ''}</div>
        <button class="bouton" data-action="veille-idee" data-i="${x.i}">Garder comme idée</button></li>`).join('')}</ul>${liste.length > max ? (max === 5 ? `<button class="bouton voir-plus" data-action="veille-tout">Voir plus (${liste.length - 5} autres)</button>` : `<p class="minuscule">${liste.length - 60} autres : affine avec le filtre.</p>`) : ''}` : `<p class="petit">${q ? `Rien dans la veille pour « ${esc(q)} » (elle ne garde que les 30 derniers jours).` : 'Rien ne correspond à ce filtre.'}</p>${q ? liensRecherche(q) : ''}`}`;
  }
  const STATUTS_IDEE = [['a-faire', 'À faire'], ['en-cours', 'En cours'], ['publie', 'Publié']];
  function vueVeille() {
    if (veille.etat === 'idle') chargerVeille();
    if (!pf.veille) pf.veille = { cat: 'createurs', q: '' };
    if (!pf.idee) pf.idee = { titre: '', lien: '', note: '' };
    const i = pf.idee, f = pf.veille;
    return `<header class="en-tete"><p class="sur-titre">Ma veille · Twitch France</p><h1 tabindex="-1">Veille et idées</h1><p class="intro">Les actualités sur les créateurs de contenu Twitch et YouTube (revenus, règles, plateformes, tendances) arrivent toutes seules, une collecte par heure. Garde ce qui peut devenir un contenu dans ta boîte à idées, puis envoie-le dans le planning.</p></header>
      <section class="carte"><h2>Ma boîte à idées</h2>
        <p class="petit">Sur Android, partage une vidéo TikTok, un tweet ou une page vers l’application installée : l’idée arrive ici toute seule. Sur iPhone, colle le lien à la main.</p>
        <div class="calcul-champs">${champPf('idee', 'titre', 'Idée', i.titre, 'text', 'placeholder="Réaction au clip du boss, format 3 questions…"')}${champPf('idee', 'lien', 'Lien (facultatif)', i.lien, 'url')}${champPf('idee', 'note', 'Note (facultatif)', i.note)}</div>
        <p id="erreur-idee" class="validation" role="alert"></p><div class="actions"><button class="bouton primaire" data-action="idee-ajouter">Ajouter l’idée</button></div>
        ${etat.idees.length ? `<ul class="idees">${etat.idees.map(x => `<li class="idee statut-${x.statut}"><div><h3>${x.lien ? `<a href="${esc(x.lien)}" target="_blank" rel="noopener noreferrer">${esc(x.titre)} <span class="sr-only">(nouvel onglet)</span></a>` : esc(x.titre)}</h3>${x.note ? `<p class="petit">${esc(x.note)}</p>` : ''}<p class="minuscule">${x.date ? esc(dateFr(x.date)) + ' · ' : ''}${x.source === 'partage' ? 'Partagée depuis le téléphone' : x.source === 'veille' ? 'Gardée depuis la veille' : 'Ajoutée à la main'}</p></div>
          <div class="idee-actions"><label class="sr-only" for="st-${esc(x.id)}">Statut de ${esc(x.titre)}</label><select id="st-${esc(x.id)}" data-idee-statut="${esc(x.id)}">${STATUTS_IDEE.map(([v, n]) => `<option value="${v}" ${x.statut === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
          <button class="bouton" data-action="idee-planning" data-id="${esc(x.id)}">Mettre au planning</button><button class="bouton discret" data-action="idee-suppr" data-id="${esc(x.id)}" aria-label="Supprimer l’idée ${esc(x.titre)}">✕</button></div></li>`).join('')}</ul>` : '<p class="petit">Aucune idée pour l’instant.</p>'}</section>
      <section class="carte"><h2>Le fil du jour</h2>
        <div class="calcul-champs deux"><div><label for="veille-cat">Catégorie</label><select id="veille-cat" data-pf="veille.cat">${CAT_VEILLE.map(([v, n]) => `<option value="${v}" ${f.cat === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
          <div><label for="veille-q">Chercher</label><input id="veille-q" data-pf="veille.q" type="search" maxlength="80" value="${esc(f.q)}" placeholder="un jeu, un streamer…"></div></div>
        <div id="veille-flux" aria-live="polite">${fluxVeille()}</div>
        <p class="minuscule">Sources et alertes : liste dans le fichier veille-sources.json du dépôt. Pour suivre un nouveau mot-clé, crée une alerte Google en choisissant « Flux RSS » et donne l’adresse du flux à ton développeur.</p></section>`;
  }

  /* Révision espacée */
  const parQuestion = {}; toutes.forEach(l => l.questions.forEach(q => { parQuestion[q.id] = { l, q }; }));
  function amorcerRevision() { G.amorcer(etat.revision, etat.reponses, Object.values(parQuestion), M.correcte, aujourdhui()); }
  function nouvelleRevision() {
    const ids = G.aReviser(etat.revision, aujourdhui()).filter(id => parQuestion[id]).slice(0, 10);
    revision = { qs: ids.map(id => parQuestion[id]), i: 0, rep: {}, fini: false };
  }
  function vueRevision() {
    const st = G.statsRevision(etat.revision, aujourdhui());
    const tete = `<header class="en-tete"><p class="sur-titre">Jouer · Révision espacée</p><h1 tabindex="-1">Les questions à revoir, au bon moment</h1><p class="intro">Tes questions ratées reviennent après 1, 3, 7, 16 puis 35 jours. Tu les réussis ? Elles s’éloignent. Tu les rates ? Elles reviennent demain. ${st.total ? `${st.total} suivie${st.total > 1 ? 's' : ''} · ${st.maitrisees} maîtrisée${st.maitrisees > 1 ? 's' : ''}.` : ''}</p></header>`;
    if (!revision || (!revision.qs.length && st.dues)) nouvelleRevision();
    if (!revision.qs.length) {
      return `${tete}<section class="carte"><h2>${st.total ? 'Rien à revoir aujourd’hui.' : 'Aucune question à revoir pour l’instant.'}</h2><p>${st.prochaine ? `Prochaine révision le ${esc(dateFr(st.prochaine))}.` : 'Les questions que tu rates dans les leçons et les quiz arrivent ici automatiquement.'}</p><div class="actions"><button class="bouton primaire" data-view="eclair">Faire un quiz éclair</button><button class="bouton discret" data-view="accueil">Retour à l’accueil</button></div></section>`;
    }
    if (revision.fini) {
      const bonnes = revision.qs.filter(x => M.correcte(x.q, revision.rep[x.q.id])).length, reste = G.aReviser(etat.revision, aujourdhui()).length;
      return `${tete}<section class="carte"><div class="resume-score"><p class="score">${bonnes} / ${revision.qs.length}</p></div>${blocMascotte(bonnes === revision.qs.length ? 'fete' : bonnes ? 'content' : 'rassure', 'rev' + bonnes)}<div class="feedback ${bonnes === revision.qs.length ? 'gagne' : ''}"><h3>${bonnes === revision.qs.length ? 'Tout est revenu en mémoire.' : 'Les autres reviendront bientôt.'}</h3><p>${reste ? `Il en reste ${reste} à revoir aujourd’hui.` : 'Plus rien pour aujourd’hui. Bravo.'}</p></div>
        <div class="actions">${reste ? '<button class="bouton primaire" data-action="rev-rejouer">Continuer</button>' : ''}<button class="bouton discret" data-view="accueil">Faire une pause</button></div></section>`;
    }
    const { l, q } = revision.qs[revision.i], faite = Object.prototype.hasOwnProperty.call(revision.rep, q.id), val = faite ? revision.rep[q.id] : drafts[q.id];
    sansXp = true;
    const fb = faite ? feedbackQuestion(q, val) : ''; sansXp = false;
    const e = etat.revision[q.id];
    return `${tete}<section class="carte question"><ol class="points-q" aria-hidden="true">${revision.qs.map((x, i) => { const r = Object.prototype.hasOwnProperty.call(revision.rep, x.q.id); return `<li class="${i === revision.i ? 'actuelle' : ''} ${r ? (M.correcte(x.q, revision.rep[x.q.id]) ? 'juste' : 'faux') : ''}"></li>`; }).join('')}</ol>
      <p class="q-compteur">Révision · ${revision.i + 1} / ${revision.qs.length} · ${esc(l.code)}${e ? ` · boîte ${e.boite} sur 5` : ''}</p><h2 tabindex="-1">${esc(q.titre)}</h2><p>${esc(q.texte)}</p>
      <form id="form-question" data-mode="revision" novalidate>${champsQuestion(q, val, faite)}<p id="erreur-question" class="validation" role="alert"></p>${!faite ? '<div class="actions"><button type="submit" class="bouton primaire">Vérifier</button></div>' : ''}</form>${fb}
      ${faite ? `<div class="actions"><button class="bouton primaire" data-action="rev-suivante">${revision.i === revision.qs.length - 1 ? 'Voir mon score' : 'Suivante'} <span aria-hidden="true">→</span></button><button class="bouton discret" data-view="${l.id}">Revoir ${esc(l.code)}</button></div>` : ''}</section>`;
  }


  /* ---------- Pourcentages : calculatrice commentée, fiche de formules, calcul de tête ---------- */
  function resultatPourcent() {
    const p = etat.pourcent, r = PC.calculer(p.mode, p.a, p.b);
    if (r.erreur) return `<p class="validation" role="alert">${esc(r.erreur)}</p>`;
    const val = r.unite === '%' ? `${nb(r.valeur, 2)} %` : r.unite ? `${nb(r.valeur, 2)} ${r.unite}` : nb(r.valeur, 2);
    return `<div class="resultat-pc"><span class="petit">Résultat</span><strong>${esc(val)}</strong><p>${esc(r.lecture)}</p></div>
      <div class="pc-bloc"><h3>Le calcul</h3><p class="formule">${esc(r.formule)}</p></div>
      <div class="pc-bloc"><h3>Sur la calculatrice</h3><ol class="touches">${r.touches.map(t => `<li><code>${esc(t)}</code></li>`).join('')}</ol></div>
      <div class="pc-bloc"><h3>De tête</h3><ul class="liste-simple">${r.tete.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <div class="feedback erreur"><h3>Le piège à éviter</h3><p>${esc(r.piege)}</p></div>`;
  }
  function outilPourcent() {
    const p = etat.pourcent, m = PC.MODES.find(x => x.id === p.mode) || PC.MODES[0];
    return `<p class="petit">Choisis ce que tu cherches et tape tes deux nombres : tu obtiens le résultat, la formule, les touches de la calculatrice et l’astuce pour le faire de tête.</p>
      <div class="calcul-champs">${champSelect('pourcent', 'mode', 'Je veux…', p.mode, PC.MODES.map(x => [x.id, x.nom]))}${champNum('pourcent', 'a', esc(m.a), p.a, -1000000000, 1000000000, 'any')}${champNum('pourcent', 'b', esc(m.b), p.b, -1000000000, 1000000000, 'any')}</div>
      <div id="resultat-pourcent" aria-live="polite">${resultatPourcent()}</div>
      <details class="fiche" open><summary>Fiche des formules : quoi utiliser, et quand</summary><div class="table-defile"><table class="table-cash table-lecon"><caption>Une ligne par besoin. Sur la calculatrice, tape exactement ce qui est écrit.</caption>
        <thead><tr><th scope="col">Je veux…</th><th scope="col">Formule</th><th scope="col">Touches</th><th scope="col">Exemple</th><th scope="col">Quand ?</th></tr></thead>
        <tbody>${PC.FICHE.map(f => `<tr><th scope="row">${esc(f.besoin)}</th><td>${esc(f.formule)}</td><td><code>${esc(f.touches)}</code></td><td>${esc(f.exemple)}</td><td>${esc(f.quand)}</td></tr>`).join('')}</tbody></table></div></details>
      <details class="fiche"><summary>Calcul de tête : les pourcentages qu’on fait sans calculatrice</summary><div class="table-defile"><table class="table-cash table-lecon"><caption>Exemple sur 240 (abonnés, euros, vues…)</caption>
        <thead><tr><th scope="col">Pourcentage</th><th scope="col">Comment faire</th><th scope="col">Résultat sur 240</th></tr></thead>
        <tbody>${PC.tableTete(240).map(x => `<tr><th scope="row">${nb(x.pourcent, 0)} %</th><td>${esc(x.astuce)}</td><td>${nb(x.valeur, 2)}</td></tr>`).join('')}</tbody></table></div>
        <p class="petit">Avec 10 % et 1 %, tu fabriques presque tous les autres : 30 % = 10 % × 3, 12 % = 10 % + 2 × 1 %.</p></details>`;
  }

  const OUTIL_RENDU = { pourcent: [outilPourcent, resultatPourcent], devises: [outilDevises, resultatDevises], cotis: [outilCotis, resultatCotis], revenu: [outilRevenu, resultatRevenu], treso: [outilTreso, resultatTreso], pipeline: [outilPipeline, resultatPipeline], budget: [outilBudget, resultatBudget], reporting: [outilReporting, resultatReporting], doc: [outilDoc, resultatDoc], recettes: [outilRecettes, resultatRecettes], plafonds: [outilPlafonds, resultatPlafonds], echeances: [outilEcheances, resultatEcheances], planning: [outilPlanning, resultatPlanning], contrat: [outilContrat, resultatContrat], efacture: [outilEfacture, resultatEfacture] };
  function simulateurs() {
    const o = etat.outil;
    return `<header class="en-tete"><p class="sur-titre">S’outiller · Piloter mon business</p><h1 tabindex="-1">Boîte à outils</h1><p class="intro">${ONGLETS.length} outils pour décider avec des chiffres, en euros, dollars et livres sterling. Les taux viennent des sources officielles vérifiées le ${esc(S.verifie)} : ce sont des repères pédagogiques, pas un conseil fiscal.</p></header>
      ${barreTaux()}
      <div class="onglets" role="tablist" aria-label="Outils">${ONGLETS.map(([id, n]) => `<button role="tab" id="onglet-${id}" aria-controls="panneau-outil" aria-selected="${o === id}" tabindex="${o === id ? 0 : -1}" data-action="onglet" data-outil="${id}">${esc(n)}</button>`).join('')}</div>
      <section class="carte panneau-outil" id="panneau-outil" role="tabpanel" aria-labelledby="onglet-${o}"><h2>${esc(ONGLETS.find(x => x[0] === o)[1])}</h2>${OUTIL_RENDU[o][0]()}</section>`;
  }

  /* ---------- Carnet et sources ---------- */
  function carnet() {
    const entrees = toutes.filter(l => etat.notes[l.id] && (etat.notes[l.id].action || etat.notes[l.id].echeance));
    const faits = entrees.filter(l => etat.notes[l.id].fait).length;
    return `<header class="en-tete"><p class="sur-titre">Mes affaires</p><h1 tabindex="-1">Mon carnet</h1><p class="intro">Tes actions concrètes, au même endroit. ${entrees.length ? `${faits} sur ${entrees.length} réalisées.` : 'Il se remplit à la fin de chaque leçon.'}</p></header>
      <div class="pile">${entrees.length ? entrees.map(l => {
        const n = etat.notes[l.id];
        return `<article class="carte note-carnet ${n.fait ? 'faite' : ''}"><p class="sur-titre">${esc(l.code)} · ${esc(l.titre)}</p><p class="note-texte">${esc(n.action || '—')}</p><p class="petit">${n.echeance ? 'Pour : ' + esc(n.echeance) + ' · ' : ''}${n.fait ? 'Réalisé' : 'À faire'}</p><div class="actions"><button class="bouton discret" data-view="${l.id}" data-ancrage="1">Modifier</button></div></article>`;
      }).join('') : '<section class="carte"><p>Aucune action notée pour l’instant.</p><div class="actions"><button class="bouton primaire" data-view="accueil">Retour à l’accueil</button></div></section>'}
      <section class="carte"><h2>Garder une copie</h2><p class="petit">Ta progression vit dans ce navigateur. Exporte-la en fichier pour la garder ou changer d’appareil.</p><div class="actions"><button class="bouton" data-action="sauvegarde">Sauvegarder ou restaurer</button><button class="bouton discret" data-action="imprimer">Imprimer le carnet</button></div></section>
      <section class="carte"><h2>Sur ton téléphone, même sans connexion</h2><p class="petit">Installe le module comme une application : il s’ouvre en plein écran et marche hors connexion (seule l’actualisation des taux BCE demande internet). Sur Android et sur ordinateur : bouton « Installer l’app » en haut. Sur iPhone : Partager, puis « Sur l’écran d’accueil ». Pense à exporter ta progression de temps en temps : elle reste sur cet appareil.</p></section></div>`;
  }
  function sources() {
    const t = R.change;
    const lignes = [
      ['Cotisations micro, libéral BNC', `${nb(R.tauxBNC)} %`, 'microSocial'], ['Cotisations micro, services BIC', `${nb(R.tauxBIC)} %`, 'microSocial'],
      ['Acre, BNC (débuts depuis le 1er juillet 2026)', `${nb(R.tauxAcreBNC)} %`, 'acreActu'], ['Formation professionnelle, libéral', `${nb(R.cfpLiberal)} %`, 'cfp'],
      ['Versement libératoire BNC / BIC services', `${nb(R.vflBNC)} % / ${nb(R.vflBIC)} %`, 'fiscMicro'], ['Plafond RFR par part pour le versement libératoire 2026', euro(R.rfrVfl), 'vfl'],
      ['Abattement micro-BNC / BIC services', `${R.abattementBNC} % / ${R.abattementBIC} %`, 'fiscMicro'], ['Plafond micro services 2026-2028', euro(R.plafondServices), 'seuilsMicro'],
      ['Franchise TVA services (seuil / seuil majoré)', `${euro(R.tvaBase)} / ${euro(R.tvaMajore)}`, 'tvaFranchise'], ['Mention de franchise', 'TVA non applicable, art. 293 B du CGI', 'tvaFranchise'],
      ['Chiffre d’affaires à déclarer', 'Encaissé, en euros, sans déduire frais ni commissions', 'declarerCA'],
      ['Facture en devise étrangère', 'Montant en devise + contre-valeur en € + taux appliqué', 'devises'], ['TVA sur une facture en devise', 'Toujours indiquée en euros', 'bofipDevises'],
      ['Client pro dans l’UE / hors UE', '« Autoliquidation » / « TVA non applicable – art. 259-1 du CGI »', 'assujettis'],
      ['Taux de change de référence', `1 € = ${nb(t.USD, 4)} $ · ${nb(t.GBP, 4)} £ (${dateFr(t.date)})`, 'bce'],
      ['Indemnité forfaitaire de recouvrement', euro(R.indemniteRetard), 'delais'],
      ['Facture électronique : réception / émission micro', `${R.efactureReception} / ${R.efactureEmission}`, 'efacture'], ['Contrat écrit marque-influenceur', `> ${euro(R.contratInfluence)} HT`, 'influenceContrat']
    ];
    return `<header class="en-tete"><p class="sur-titre">Mes affaires</p><h1 tabindex="-1">Sources officielles</h1><p class="intro">Chiffres vérifiés le ${esc(S.verifie)}. Chaque chiffre est un repère pédagogique : vérifier le taux en vigueur sur la source officielle liée avant de l’appliquer.</p></header>
      <section class="carte"><table class="table-cash table-sources"><caption>Repères ${R.annee}</caption><thead><tr><th scope="col">Repère</th><th scope="col">Valeur</th><th scope="col">Source</th></tr></thead><tbody>${lignes.map(([n, v, s]) => `<tr><th scope="row">${esc(n)}</th><td>${esc(v)}</td><td><a href="${esc(S.sources[s].url)}" target="_blank" rel="noopener noreferrer">Ouvrir <span class="sr-only">${esc(S.sources[s].nom)} (nouvel onglet)</span></a></td></tr>`).join('')}</tbody></table></section>
      <section class="carte"><h2>Toutes les sources</h2><ul class="liste-sources">${Object.values(S.sources).map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.nom)} <span class="sr-only">(nouvel onglet)</span></a></li>`).join('')}</ul></section>`;
  }

  /* ---------- Suggestions d'amélioration : le message part par e-mail vers le développeur ---------- */
  const TYPES_SUG = [['idee', 'Une idée'], ['probleme', 'Un problème'], ['contenu', 'Un contenu qui manque'], ['createur', 'Un créateur à suivre dans la veille'], ['autre', 'Autre chose']];
  const CONTACT = ['zesite07', 'gmail.com'].join('@');
  let sugBrouillon = { type: 'idee', texte: '' };
  function vueSuggestions() {
    const liste = etat.suggestions.slice().reverse();
    return `<header class="en-tete"><p class="sur-titre">Mes affaires</p><h1 tabindex="-1">Mes idées pour le logiciel</h1><p class="intro">Un truc qui t’agace, une idée, un contenu qui manque ? Écris-le ici : ça prépare un e-mail pour JT, qui s’en sert pour améliorer le logiciel.</p></header>
      <section class="carte"><div class="calcul-champs"><div><label for="sug-type">C’est…</label><select id="sug-type" data-sug="type">${TYPES_SUG.map(([v, n]) => `<option value="${v}" ${sugBrouillon.type === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div></div>
        <label for="sug-texte">Ton message</label><textarea id="sug-texte" data-sug="texte" rows="6" maxlength="1000" placeholder="Ex. Quand je fais le quiz sur les pourcentages, j’aimerais pouvoir revoir la formule sans quitter la question.">${esc(sugBrouillon.texte)}</textarea>
        <div class="actions"><button class="bouton primaire" data-action="suggestion-envoyer">Envoyer à JT par e-mail</button></div>
        <p class="minuscule">Ça ouvre ton application e-mail avec le message déjà écrit : il faut ensuite appuyer sur « Envoyer » dans ton e-mail. Rien ne part tout seul.</p></section>
      ${liste.length ? `<section><h2>Mes messages</h2><ul class="idees">${liste.map(x => `<li class="idee"><div><p class="petit"><span class="etiquette">${esc((TYPES_SUG.find(t => t[0] === x.type) || TYPES_SUG[0])[1])}</span> ${x.date ? esc(dateFr(x.date)) : ''}</p><p>${esc(x.texte)}</p><p class="minuscule">${x.envoye ? 'E-mail préparé' : 'Pas encore envoyé'}</p></div><div class="actions"><button class="bouton" data-action="suggestion-renvoyer" data-id="${esc(x.id)}">${x.envoye ? 'Renvoyer' : 'Envoyer'}</button><button class="bouton discret" data-action="suggestion-supprimer" data-id="${esc(x.id)}">Supprimer</button></div></li>`).join('')}</ul></section>` : ''}`;
  }
  function ouvrirMail(s) {
    const lib = (TYPES_SUG.find(t => t[0] === s.type) || TYPES_SUG[0])[1];
    const sujet = `[Giky CM] ${lib} : ${s.texte.replace(/\s+/g, ' ').slice(0, 50)}`;
    const corps = `${s.texte}\n\n— Laetitia (envoyé depuis le module CM, contenu ${C.version})`;
    const a = document.createElement('a');
    a.href = `mailto:${CONTACT}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
    a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- Rendu ---------- */
  function contenuVue() {
    const l = getLecon();
    if (l) return lecon(l);
    const v = { simulateurs, carnet, sources, programme, jouer, scenarios: vueScenarios, eclair: vueEclair, revision: vueRevision, veille: vueVeille, ressources: vueRessources, suggestions: vueSuggestions }[etat.vue];
    return v ? v() : accueil();
  }
  function fil() {
    const l = getLecon();
    if (l) return `${esc(parcoursDe(l).nom)}<span>${esc(l.code)}</span>`;
    return { programme: 'Apprendre<span>Tout le programme</span>', jouer: 'Jouer<span>Jouer pour apprendre</span>', simulateurs: 'Outils<span>Boîte à outils</span>', carnet: 'Mes affaires<span>Mon carnet</span>', sources: 'Mes affaires<span>Sources</span>', scenarios: 'Jouer<span>Scénarios</span>', eclair: 'Jouer<span>Quiz éclair</span>', revision: 'Jouer<span>Révision espacée</span>', veille: 'Ma veille<span>Veille et idées</span>', ressources: 'Outils<span>Ressources</span>', suggestions: 'Mes affaires<span>Mes idées pour le logiciel</span>' }[etat.vue] || 'Module CM<span>Accueil</span>';
  }
  function boutonsBarre() {
    const sombre = document.documentElement.dataset.theme === 'sombre';
    return `<span id="minuteur" class="minuteur" ${sprint ? '' : 'hidden'} role="timer" aria-live="off"></span>${installPrompt ? '<button class="bouton primaire" data-action="installer">Installer l’app</button>' : ''}
      <details class="reglages" ${reglagesOuvert ? 'open' : ''}><summary aria-label="Réglages">${icone('reglages', 22)}<span class="reglages-lib">Réglages</span></summary><div class="reglages-panneau">
        <div class="sprint-zone"><details class="sprint"><summary class="bouton">${sprint ? 'Sprint en cours' : 'Sprint'}</summary><div class="sprint-menu" role="group" aria-label="Durée du sprint">${[5, 10, 15, 25].map(m => `<button class="bouton" data-action="sprint" data-minutes="${m}">${m} min</button>`).join('')}${sprint ? '<button class="bouton discret" data-action="stop-sprint">Arrêter</button>' : ''}</div></details></div>
        <button class="bouton" data-action="theme" aria-pressed="${sombre}" title="Basculer le mode sombre">${sombre ? '☀ Clair' : '☾ Sombre'}</button>
        <button class="bouton" data-action="aere" aria-pressed="${!!etat.aere}" title="Agrandir l’interlignage">Texte aéré</button>
        <button class="bouton" data-action="mascotte" aria-pressed="${mascotteActive()}" title="Afficher ou masquer Mochi, la mascotte">Mascotte</button>
        <button class="bouton" data-action="focus" aria-pressed="${etat.focus}">Focus</button><button class="bouton" data-action="sauvegarde">Sauvegarder</button>
        <p class="minuscule">Ta progression reste dans ce navigateur. Seul le bouton « Actualiser les taux BCE » contacte un service externe, à ta demande.</p></div></details>`;
  }
  function barreBas() {
    const v = etat.vue, actif = { accueil: v === 'accueil', apprendre: !!getLecon() || v === 'programme' || v === 'final', jouer: ['jouer', 'scenarios', 'eclair', 'revision'].includes(v), business: ['simulateurs', 'ressources'].includes(v), veille: v === 'veille' };
    const nA = alertesFortes().length;
    const t = (id, vue, ic, lib) => `<button data-view="${vue}" ${actif[id] ? 'aria-current="page"' : ''}>${icone(ic, 22)}${lib}${id === 'business' && nA ? `<span class="pastille-alerte" aria-label="${nA} échéance${nA > 1 ? 's' : ''} à traiter">${nA}</span>` : ''}</button>`;
    return `<nav class="bas" aria-label="Navigation principale">${t('accueil', 'accueil', 'accueil', 'Accueil')}${t('apprendre', 'programme', 'livre', 'Apprendre')}${t('jouer', 'jouer', 'jeu', 'Jouer')}${t('business', 'simulateurs', 'outils', 'Business')}${t('veille', 'veille', 'veille', 'Veille')}</nav>`;
  }
  function render(focusSel) {
    appliquerTheme(); amorcerRevision();
    document.body.classList.toggle('focus', etat.focus);
    $('#application').innerHTML = `<div class="coquille"><aside class="rail" aria-label="Navigation du module"><div><p class="marque">JTIpilot<span aria-hidden="true"></span></p><p class="sous-marque">Community manager freelance</p></div>${blocXp(true)}<nav aria-label="Leçons">${menu()}</nav><div class="rail-bas"><strong>Repères ${R.annee}</strong>Vérifiés le ${esc(S.verifie)} sur les sources officielles.</div></aside>
      <div class="zone"><div class="barre"><p class="fil">${fil()}</p><div class="outils">${boutonsBarre()}</div></div>
      <p id="stockage-avertissement" class="stockage-alerte" ${depot.persistant ? 'hidden' : ''}>${esc(depot.avertissement)}</p>
      ${bandeauAlertes()}
      <main id="principal">${contenuVue()}<footer class="pied"><span>JTIpilot · Module ${esc(C.titre)} · contenu ${esc(C.version)} revu le ${esc(C.revue)}. Les chiffres légaux et fiscaux sont des repères pédagogiques : vérifier sur la source officielle liée.</span><button class="lien-action" data-view="sources">Sources</button></footer></main></div></div>${barreBas()}`;
    largeurs(); majMinuteur(); badgeApp();
    sauver();
    if (focusSel) { const el = $(focusSel); if (el) el.focus({ preventScroll: false }); }
  }
  function ouvrir(view, ancrer) {
    const l = toutes.find(x => x.id === view);
    etat.vue = view; etat.question = 0; drafts = {};
    if (view === 'eclair' && (!eclair || eclair.fini)) nouvelEclair();
    if (view === 'revision') { amorcerRevision(); nouvelleRevision(); }
    if (view !== 'scenarios') jeu = null;
    if (l) {
      etat.derniere = l.id;
      const b = M.bilan(l, etat.reponses);
      etat.etape = ancrer && b.fini ? 'ancrage' : b.fini ? 'ancrage' : 'cours';
    }
    render('h1'); window.scrollTo(0, 0);
  }

  /* ---------- Sprint (minuteur doux) ---------- */
  function majMinuteur() {
    const el = $('#minuteur'); if (!el) return;
    if (!sprint) { el.hidden = true; return; }
    const reste = Math.max(0, Math.round((sprint.fin - Date.now()) / 1000));
    el.hidden = false; el.textContent = `${Math.floor(reste / 60)}:${String(reste % 60).padStart(2, '0')}`;
    el.setAttribute('aria-label', `Sprint : ${Math.ceil(reste / 60)} minute${reste > 60 ? 's' : ''} restantes`);
    if (reste <= 0) {
      clearInterval(sprint.id); const duree = sprint.duree; sprint = null; el.hidden = true;
      const s = document.querySelector('.sprint summary'); if (s) s.textContent = 'Sprint';
      toast(`Sprint de ${duree} minutes terminé. Pause : lève-toi, bois un verre d’eau, 5 minutes loin de l’écran.`, 'fin');
      annoncer(`Sprint de ${duree} minutes terminé. C’est l’heure de la pause.`);
    }
  }
  function lancerSprint(minutes) {
    if (sprint) clearInterval(sprint.id);
    sprint = { fin: Date.now() + minutes * 60000, duree: minutes, id: setInterval(majMinuteur, 1000) };
    const d = document.querySelector('details.sprint'); if (d) d.open = false;
    reglagesOuvert = false; const rg = document.querySelector('details.reglages'); if (rg) rg.open = false;
    const s = document.querySelector('.sprint summary'); if (s) s.textContent = 'Sprint en cours';
    majMinuteur(); toast(`Sprint de ${minutes} minutes lancé. Une seule chose à la fois.`);
  }

  /* ---------- Taux BCE à la demande ---------- */
  async function majTaux(b) {
    b.disabled = true; b.textContent = 'Actualisation…';
    try {
      const rep = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP', { cache: 'no-store' });
      if (!rep.ok) throw new Error();
      const j = await rep.json();
      if (!j.rates || !(j.rates.USD > 0) || !(j.rates.GBP > 0)) throw new Error();
      etat.devises = { USD: j.rates.USD, GBP: j.rates.GBP, date: String(j.date || aujourdhui()).slice(0, 10), source: 'BCE' };
      render('#maj-taux'); toast(`Taux BCE du ${dateFr(etat.devises.date)} chargés : 1 € = ${nb(j.rates.USD, 4)} $ et ${nb(j.rates.GBP, 4)} £.`);
    } catch (e) {
      b.disabled = false; b.textContent = 'Actualiser les taux BCE';
      toast('Impossible de joindre le service de taux. Les taux actuels sont conservés : tu peux les saisir à la main.', 'erreur');
    }
  }

  /* ---------- Événements ---------- */
  document.addEventListener('submit', e => {
    if (e.target.id !== 'form-question') return;
    e.preventDefault();
    const modeEclair = e.target.dataset.mode === 'eclair', modeRev = e.target.dataset.mode === 'revision';
    const q = modeRev ? revision.qs[revision.i].q : modeEclair ? eclair.qs[eclair.i].q : qActuelle(), err = $('#erreur-question');
    let v;
    if (q.type === 'nombre') { const raw = $('#nombre-reponse').value.replace(',', '.'); v = raw === '' ? NaN : Number(raw); }
    else { const vals = [...document.querySelectorAll('input[name="choix"]:checked')].map(x => Number(x.value)); v = q.type === 'multiple' ? vals : vals[0]; }
    if (!M.valeurValide(q, v)) { err.textContent = q.type === 'nombre' ? 'Entre un nombre.' : 'Choisis une réponse.'; return; }
    if (q.type === 'multiple' && v.length !== q.bonne.length) { err.textContent = `Choisis exactement ${q.bonne.length} réponses.`; return; }
    const ok = M.correcte(q, v);
    combo = ok ? combo + 1 : 0;
    marquerJour();
    if (modeRev) revision.rep[q.id] = v; else if (modeEclair) eclair.rep[q.id] = v; else etat.reponses[q.id] = v;
    G.apresReponse(etat.revision, q.id, ok, aujourdhui(), modeRev);
    delete drafts[q.id];
    render('#correction');
    annoncer(ok ? `Bonne réponse${combo > 1 ? `, combo de ${combo}` : ''}.` : 'Réponse incorrecte, la correction est affichée.');
  });
  const qCourante = () => etat.vue === 'revision' && revision && revision.qs.length ? revision.qs[revision.i].q : etat.vue === 'eclair' && eclair ? eclair.qs[eclair.i].q : qActuelle();
  function majPf(t) {
    const [g, k] = t.dataset.pf.split('.');
    if (g === 'veille') { pf.veille = pf.veille || { cat: 'createurs', q: '' }; pf.veille[k] = t.value; majVeilleZone(); return; }
    if (g === 'filtre') pf.filtreClient = t.value;
    else if (pf[g]) pf[g][k] = t.value;
    if (t.dataset.rerender) render(`#${t.id}`);
  }
  function chemin(obj, cle, valeur) {
    const parts = cle.split('.'); let o = obj;
    for (let i = 0; i < parts.length - 1; i++) { o = o[/^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i]]; if (o == null) return; }
    const k = parts[parts.length - 1]; o[/^\d+$/.test(k) ? Number(k) : k] = valeur;
  }
  function majSim(t) {
    const g = t.dataset.sim, k = t.dataset.cle;
    let v;
    if (t.type === 'checkbox') v = t.checked;
    else if (t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.type === 'text' || t.type === 'date') {
      v = t.value;
      if (t.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
    } else {
      if (t.value === '' || !t.validity.valid) return;
      v = Number(t.value);
    }
    chemin(etat[g], k, v);
    if (g === 'devises') {
      etat.devises.source = 'saisie manuelle'; etat.devises.date = aujourdhui();
      const ts = $('#taux-source'); if (ts) ts.textContent = `Source : saisie manuelle du ${dateFr(etat.devises.date)}. Modifiables à la main.`;
      const tc = $('#taux-croises'); if (tc) tc.innerHTML = tauxCroises();
    }
    if (g === 'pourcent' && k === 'mode') {
      const m = PC.MODES.find(x => x.id === etat.pourcent.mode);
      if (m) { etat.pourcent.a = m.exemple.a; etat.pourcent.b = m.exemple.b; }
      render(`#${t.id}`); sauver(); return;
    }
    /* Les champs dont le libellé dépend d'un choix demandent un rendu complet. */
    if (g === 'doc' && ['type', 'situation', 'devise'].includes(k)) { render(`#${t.id}`); sauver(); return; }
    const cible = $(`#resultat-${etat.outil}`);
    if (cible) { cible.innerHTML = OUTIL_RENDU[etat.outil][1](); largeurs(cible); }
    sauver();
  }
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.matches('[data-sug]')) { sugBrouillon[t.dataset.sug] = t.dataset.sug === 'type' ? (TYPES_SUG.some(x => x[0] === t.value) ? t.value : 'idee') : t.value.slice(0, 1000); return; }
    if (t.matches('[data-note]') && t.type !== 'checkbox') {
      const l = getLecon(); if (!l) return;
      etat.notes[l.id] = Object.assign({ action: '', echeance: '', fait: false }, etat.notes[l.id], { [t.dataset.note]: t.value.slice(0, t.dataset.note === 'action' ? 1500 : 120) });
      sauver(); const n = $('[data-note-etat]'); if (n) n.textContent = 'Enregistré.';
    }
    if (t.matches('input[data-sim]:not([type="checkbox"]), textarea[data-sim]')) majSim(t);
    if (t.matches('[data-conv]')) {
      if (t.dataset.conv === 'montant') { if (t.value === '' || !t.validity.valid) return; conv.montant = Number(t.value); }
      $('#resultat-devises').innerHTML = resultatDevises();
    }
    if (t.matches('[data-filtre="res"]')) {
      const f = t.value.trim().toLowerCase(); let vus = 0;
      document.querySelectorAll('.res-liste li').forEach(li => { const ok = !f || li.dataset.texte.includes(f); li.hidden = !ok; if (ok) vus++; });
      document.querySelectorAll('.res-cat').forEach(c => { c.hidden = ![...c.querySelectorAll('li')].some(li => !li.hidden); });
      $('#res-vide').hidden = vus > 0;
    }
    if (t.name === 'nombre') { const q = qCourante(); if (q) drafts[q.id] = t.value; }
    if (t.matches('[data-pf]') && t.tagName !== 'SELECT') majPf(t);
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'choix') { const q = qCourante(); const vals = [...document.querySelectorAll('input[name="choix"]:checked')].map(x => Number(x.value)); drafts[q.id] = q.type === 'multiple' ? vals : vals[0]; }
    if (t.matches('[data-sim]') && (t.type === 'checkbox' || t.tagName === 'SELECT')) majSim(t);
    if (t.matches('select[data-pf]')) majPf(t);
    if (t.matches('[data-idee-statut]')) { const x = etat.idees.find(y => y.id === t.dataset.ideeStatut); if (x) { x.statut = ['a-faire', 'en-cours', 'publie'].includes(t.value) ? t.value : 'a-faire'; sauver(); annoncer('Statut mis à jour.'); } }
    if (t.matches('[data-conv="devise"]')) { conv.devise = t.value; $('#resultat-devises').innerHTML = resultatDevises(); }
    if (t.matches('[data-note="fait"]')) { const l = getLecon(); etat.notes[l.id] = Object.assign({ action: '', echeance: '', fait: false }, etat.notes[l.id], { fait: t.checked }); sauver(); annoncer(t.checked ? 'Défi marqué comme réalisé.' : 'Défi marqué à faire.'); }
    if (t.id === 'fichier-progression') importerFichier(t.files[0]);
  });
  document.addEventListener('keydown', e => {
    const tab = e.target.closest && e.target.closest('[role="tab"]'); if (!tab) return;
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const ids = ONGLETS.map(x => x[0]); let i = ids.indexOf(etat.outil);
    i = e.key === 'Home' ? 0 : e.key === 'End' ? ids.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length;
    etat.outil = ids[i]; render(`#onglet-${ids[i]}`);
  });
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-view],[data-action]'); if (!b) return;
    if (b.dataset.view) { const m = b.closest('.mobile-nav'); if (m) m.open = false; ouvrir(b.dataset.view, b.dataset.ancrage === '1'); return; }
    const a = b.dataset.action, l = getLecon();
    if (a === 'focus') { etat.focus = !etat.focus; render('.barre [data-action="focus"]'); annoncer(etat.focus ? 'Mode focus activé.' : 'Mode focus désactivé.'); return; }
    if (a === 'theme') { const sombre = document.documentElement.dataset.theme === 'sombre'; etat.theme = sombre ? 'clair' : 'sombre'; render('.barre [data-action="theme"]'); annoncer(etat.theme === 'sombre' ? 'Mode sombre activé.' : 'Mode clair activé.'); return; }
    if (a === 'mascotte') { etat.mascotte = !mascotteActive(); render('.barre [data-action="mascotte"]'); annoncer(etat.mascotte ? 'Mascotte affichée.' : 'Mascotte masquée.'); return; }
    if (a === 'aere') { etat.aere = !etat.aere; render('.barre [data-action="aere"]'); annoncer(etat.aere ? 'Texte aéré activé.' : 'Texte aéré désactivé.'); return; }
    if (a === 'famille') { ouvrir('programme'); const el = document.getElementById('fam-' + b.dataset.id); if (el) el.scrollIntoView(); return; }
    if (a === 'veille-tout') { veille.tout = true; majVeilleZone(); return; }
    if (a === 'sprint') { lancerSprint(Number(b.dataset.minutes) || 10); return; }
    if (a === 'stop-sprint') { if (sprint) clearInterval(sprint.id); sprint = null; render('.sprint summary'); toast('Sprint arrêté. Pas grave : tu reprends quand tu veux.'); return; }
    if (a === 'energie') { etat.energie = b.dataset.energie; render('.energie-bloc [aria-pressed="true"]'); return; }
    if (a === 'qdj') { const lq = toutes.find(x => x.id === b.dataset.lecon); etat.vue = lq.id; etat.derniere = lq.id; etat.etape = 'exercice'; etat.question = Number(b.dataset.i); drafts = {}; render('.question h2'); window.scrollTo(0, 0); return; }
    if (a === 'outil') { etat.outil = b.dataset.outil; ouvrir('simulateurs'); return; }
    if (a === 'echeance-fait') { if (!etat.echeancesFaites.includes(b.dataset.id)) etat.echeancesFaites.push(b.dataset.id); render(); toast('Échéance marquée comme faite.'); return; }
    if (a === 'echeance-defaire') { etat.echeancesFaites = etat.echeancesFaites.filter(x => x !== b.dataset.id); render(); toast('Échéance remise à faire.'); return; }
    if (a === 'suggestion-envoyer') {
      const texte = sugBrouillon.texte.trim();
      if (!texte) { toast('Écris d’abord ton message.', 'erreur'); return; }
      const s = { id: nouvelId(), date: aujourdhui(), type: sugBrouillon.type, texte, envoye: true };
      etat.suggestions.push(s); sugBrouillon = { type: 'idee', texte: '' };
      render('h1'); ouvrirMail(s); toast('Ton e-mail est prêt : appuie sur « Envoyer » dans ton application e-mail.'); return;
    }
    if (a === 'suggestion-renvoyer') { const s = etat.suggestions.find(x => x.id === b.dataset.id); if (s) { s.envoye = true; sauver(); ouvrirMail(s); } return; }
    if (a === 'suggestion-supprimer') { etat.suggestions = etat.suggestions.filter(x => x.id !== b.dataset.id); render('h1'); return; }
    if (a === 'onglet') { etat.outil = b.dataset.outil; render(`#onglet-${etat.outil}`); return; }
    if (a === 'maj-taux') { majTaux(b); return; }
    if (a === 'copier') {
      const el = $(b.dataset.cible); if (!el) return;
      try { await navigator.clipboard.writeText(el.value); toast('Rapport copié. Colle-le dans ton mail ou ton Notion.'); }
      catch (err) { el.focus(); el.select(); toast('Texte sélectionné : fais Ctrl+C (ou Cmd+C) pour le copier.'); }
      return;
    }
    if (a === 'ajouter-ligne') {
      const g = b.dataset.groupe, lignes = etat[g].lignes;
      if (lignes.length >= 30) { toast('30 lignes maximum.'); return; }
      lignes.push(g === 'budget' ? { nom: '', montant: 0, devise: 'EUR', freq: 'mois' } : { desc: '', qte: 1, pu: 0 });
      render(`#${g}-lignes-${lignes.length - 1}-${g === 'budget' ? 'nom' : 'desc'}`); return;
    }
    if (a === 'retirer-ligne') { const g = b.dataset.groupe; etat[g].lignes.splice(Number(b.dataset.i), 1); render(`[data-action="ajouter-ligne"][data-groupe="${g}"]`); return; }
    if (a === 'imprimer-doc') { document.body.classList.add('impression-doc'); window.print(); setTimeout(() => document.body.classList.remove('impression-doc'), 500); return; }
    if (a === 'vers-facture') { etat.doc.type = 'facture'; etat.doc.numero = G.numeroSuivant(etat.recettes, Number(aujourdhui().slice(0, 4))); etat.doc.date = aujourdhui(); render('#doc-type'); toast('C’est une facture. Vérifie le numéro : il doit suivre ta numérotation, sans trou.'); return; }
    if (a === 'jouer') { jeu = { id: b.dataset.id, etape: 0, points: 0, choix: [] }; render('h1'); window.scrollTo(0, 0); return; }
    if (a === 'quitter-jeu') { jeu = null; render('h1'); return; }
    if (a === 'choisir') {
      const s = SC.find(x => x.id === jeu.id), c = s.etapes[jeu.etape].choix[Number(b.dataset.i)];
      jeu.choix[jeu.etape] = { i: Number(b.dataset.i), pts: c[1] }; jeu.points += c[1]; marquerJour();
      render('#scene-suite'); annoncer(`${c[2]} ${c[1]} point${c[1] > 1 ? 's' : ''}.`); return;
    }
    if (a === 'scene-suite') {
      jeu.etape++;
      const s = SC.find(x => x.id === jeu.id);
      if (jeu.etape >= s.etapes.length) {
        const prec = etat.scenarios[s.id];
        etat.scenarios[s.id] = { meilleur: Math.max(prec ? prec.meilleur : 0, jeu.points), parties: (prec ? prec.parties : 0) + 1 };
      }
      render('h1'); window.scrollTo(0, 0); return;
    }
    if (a === 'eclair-suivante') {
      if (eclair.i < 4) { eclair.i++; drafts = {}; render('.question h2'); return; }
      eclair.fini = true;
      const bonnes = eclair.qs.filter(x => M.correcte(x.q, eclair.rep[x.q.id])).length;
      etat.eclair = { meilleur: Math.max(etat.eclair.meilleur, bonnes), parties: etat.eclair.parties + 1, bonnes: etat.eclair.bonnes + bonnes };
      render('h1'); return;
    }
    if (a === 'eclair-niveau') { niveauEclair = Number(b.dataset.niveau) || 0; nouvelEclair(); drafts = {}; render('.niveaux-choix [aria-pressed="true"]'); return; }
    if (a === 'eclair-rejouer') { nouvelEclair(); drafts = {}; render('.question h2'); return; }
    if (a === 'sauvegarde') { reglagesOuvert = false; const rg = document.querySelector('details.reglages'); if (rg) rg.open = false; dernierFocus = b; $('#message-import').textContent = ''; $('#sauvegarde').showModal(); return; }
    if (a === 'fermer-sauvegarde') { $('#sauvegarde').close(); if (dernierFocus && dernierFocus.isConnected) dernierFocus.focus(); return; }
    if (a === 'exercice') { etat.etape = 'exercice'; const i = l.questions.findIndex(q => !repondu(q)); etat.question = i === -1 ? 0 : i; render('.question h2'); return; }
    if (a === 'cours') { etat.etape = 'cours'; render('h1'); return; }
    if (a === 'suivante') {
      if (!repondu(qActuelle())) return;
      if (etat.question < l.questions.length - 1) etat.question++;
      else if (M.bilan(l, etat.reponses).fini) etat.etape = 'ancrage';
      else etat.question = l.questions.findIndex(q => !repondu(q));
      render(etat.etape === 'ancrage' ? 'h1' : '.question h2'); window.scrollTo(0, 0); return;
    }
    if (a === 'precedente') { etat.question = Math.max(0, etat.question - 1); render('.question h2'); return; }
    if (a === 'reessayer-question') { const q = qActuelle(); delete etat.reponses[q.id]; delete drafts[q.id]; render('.question h2'); return; }
    if (a === 'rejouer') {
      if (!(await confirmer('Rejouer cette leçon ? Ses réponses seront effacées. Tes notes et les autres leçons sont conservées.', 'Rejouer'))) return;
      for (const q of l.questions) delete etat.reponses[q.id];
      etat.question = 0; etat.etape = 'exercice'; drafts = {}; render('.question h2'); annoncer('Nouvelle tentative.'); return;
    }
    if (a === 'recette-ajouter') {
      const f = pfRecette(), err = $('#erreur-recette'), m = Number(String(f.montant).replace(',', '.')), iso = /^\d{4}-\d{2}-\d{2}$/;
      if (!iso.test(f.date)) { err.textContent = 'Indique la date de la facture.'; return; }
      if (f.montant === '' || !Number.isFinite(m) || m < 0) { err.textContent = 'Indique un montant HT (0 ou plus).'; return; }
      if (!f.client.trim()) { err.textContent = 'Indique le client.'; return; }
      if (f.num.trim() && etat.recettes.some(r => r.num === f.num.trim())) { err.textContent = `Le numéro ${f.num.trim()} existe déjà. Chaque facture a un numéro unique.`; return; }
      if (etat.recettes.length >= 1500) { err.textContent = 'Le livre est plein (1 500 lignes). Exporte-le en CSV puis fais le ménage.'; return; }
      const paye = f.statut === 'paye';
      etat.recettes.push({ id: nouvelId(), num: f.num.trim().slice(0, 40), date: f.date, client: f.client.trim().slice(0, 120), desc: f.desc.trim().slice(0, 200), montant: m, devise: f.devise, taux: f.devise === 'EUR' ? 1 : T()[f.devise],
        statut: paye ? 'paye' : 'attente', datePaiement: paye ? (iso.test(f.datePaiement) ? f.datePaiement : aujourdhui()) : '', mode: f.mode });
      pf.recette = null; render('#pf-recette-num'); toast('Ajouté au livre des recettes.'); return;
    }
    if (a === 'recette-depuis-doc') {
      const d = etat.doc; if (d.type !== 'facture') { toast('Passe d’abord ton document en « Facture ».'); return; }
      const r = M.calculerDocument(d, T(), R);
      if (!r || r.ht <= 0) { toast('Ajoute au moins une ligne avec un prix.'); return; }
      if (d.numero && etat.recettes.some(x => x.num === d.numero)) { toast(`La facture ${d.numero} est déjà dans le livre des recettes.`); return; }
      if (etat.recettes.length >= 1500) { toast('Le livre est plein (1 500 lignes). Exporte-le en CSV.'); return; }
      etat.recettes.push({ id: nouvelId(), num: d.numero.slice(0, 40), date: d.date, client: d.client.nom.slice(0, 120) || 'Client', desc: ((r.lignes.find(x => x.desc) || {}).desc || `Facture ${d.numero}`).slice(0, 200), montant: r.ht, devise: d.devise,
        taux: d.devise === 'EUR' ? 1 : T()[d.devise], statut: 'attente', datePaiement: '', mode: 'virement' });
      pf.recette = null; render('[data-action="recette-depuis-doc"]'); toast(`Facture ${d.numero} ajoutée, en attente de paiement. Marque-la payée à l’encaissement.`); return;
    }
    if (a === 'numero-suivant') { etat.doc.numero = G.numeroSuivant(etat.recettes, Number(etat.doc.date.slice(0, 4)) || annee()); render('#doc-numero'); return; }
    if (a === 'recette-paye') {
      const r = etat.recettes.find(x => x.id === b.dataset.id); if (!r) return;
      if (r.statut === 'paye') { r.statut = 'attente'; r.datePaiement = ''; } else { r.statut = 'paye'; r.datePaiement = aujourdhui(); }
      render(`[data-action="recette-paye"][data-id="${r.id}"]`); annoncer(r.statut === 'paye' ? 'Marqué payé.' : 'Remis en attente.'); return;
    }
    if (a === 'recette-suppr') {
      if (!(await confirmer('Supprimer cette ligne du livre ? Si c’est une facture déjà envoyée, garde plutôt son numéro et émets un avoir : la numérotation ne doit pas avoir de trou.', 'Supprimer'))) return;
      etat.recettes = etat.recettes.filter(x => x.id !== b.dataset.id); render('#panneau-outil h2'); return;
    }
    if (a === 'csv-recettes') { telecharger(G.csvRecettes(etat.recettes), 'text/csv;charset=utf-8', `livre-des-recettes-${annee()}.csv`); toast('Fichier CSV prêt. Il s’ouvre dans Excel ou Google Sheets.'); return; }
    if (a === 'telecharger-ics') { telecharger(G.exportIcs(listeEcheances()), 'text/calendar;charset=utf-8', 'echeances-cm-freelance.ics'); toast('Fichier agenda prêt. Importe-le dans Google Agenda ou ton calendrier.'); return; }
    if (a === 'sem') { const dd = Number(b.dataset.d); semaineDebut = dd === 0 ? G.lundi(aujourdhui()) : G.ajouter(semaineDebut, 7 * dd); render(`[data-action="sem"][data-d="${dd}"]`); return; }
    if (a === 'plan-ajouter') {
      const f = pfPlan(), err = $('#erreur-plan');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) { err.textContent = 'Choisis un jour.'; return; }
      if (!f.titre.trim()) { err.textContent = 'Dis ce que c’est : « Live Zelda », « Clip du boss »…'; return; }
      if (etat.planning.length >= 1500) { err.textContent = 'Le planning est plein (1 500 éléments). Supprime les anciens.'; return; }
      etat.planning.push({ id: nouvelId(), date: f.date, heure: /^\d{2}:\d{2}$/.test(f.heure) ? f.heure : '', client: f.client.trim().slice(0, 80), type: f.type, titre: f.titre.trim().slice(0, 120), fait: false });
      semaineDebut = G.lundi(f.date); pf.plan = Object.assign({}, f, { titre: '', heure: '' });
      render('#pf-plan-titre'); toast('Ajouté au planning.'); return;
    }
    if (a === 'plan-fait') { const x = etat.planning.find(y => y.id === b.dataset.id); if (!x) return; x.fait = b.checked; render(`[data-action="plan-fait"][data-id="${x.id}"]`); return; }
    if (a === 'plan-suppr') { etat.planning = etat.planning.filter(y => y.id !== b.dataset.id); render('#pf-plan-titre'); return; }
    if (a === 'copier-contrat') {
      const c = etat.contrat, txt = c.type === 'cgv' ? G.cgv(c, R) : G.contrat(c, R, aujourdhui());
      try { await navigator.clipboard.writeText(txt); toast('Texte copié. Colle-le dans un document pour le relire et l’adapter.'); }
      catch (err) { const sel = window.getSelection(), rg = document.createRange(), el = $('.contrat-texte'); rg.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(rg); toast('Texte sélectionné : fais Ctrl+C (ou Cmd+C) pour le copier.'); }
      return;
    }
    if (a === 'imprimer-contrat') { document.body.classList.add('impression-contrat'); window.print(); setTimeout(() => document.body.classList.remove('impression-contrat'), 500); return; }
    if (a === 'rev-suivante') { if (revision.i < revision.qs.length - 1) { revision.i++; drafts = {}; render('.question h2'); } else { revision.fini = true; render('h1'); } return; }
    if (a === 'rev-rejouer') { nouvelleRevision(); drafts = {}; render(revision.qs.length ? '.question h2' : 'h1'); return; }
    if (a === 'installer') {
      if (!installPrompt) return;
      installPrompt.prompt(); try { await installPrompt.userChoice; } catch (err) { /* ignoré */ }
      installPrompt = null; b.remove(); return;
    }
    if (a === 'idee-ajouter') {
      const f = pf.idee || { titre: '', lien: '', note: '' }, err = $('#erreur-idee'), lien = f.lien.trim();
      if (!f.titre.trim() && !lien) { err.textContent = 'Écris l’idée ou colle un lien.'; return; }
      if (lien && !/^https?:\/\/[^\s<>"']+$/i.test(lien)) { err.textContent = 'Le lien doit commencer par https://'; return; }
      if (etat.idees.length >= 500) { err.textContent = 'La boîte est pleine (500 idées). Supprime les anciennes.'; return; }
      etat.idees.unshift({ id: nouvelId(), titre: (f.titre.trim() || lien).slice(0, 200), lien: lien.slice(0, 500), note: f.note.trim().slice(0, 500), statut: 'a-faire', date: aujourdhui(), source: 'manuel' });
      pf.idee = null; render('#pf-idee-titre'); toast('Idée ajoutée.'); return;
    }
    if (a === 'veille-idee') {
      const x = veille.data && veille.data.items[Number(b.dataset.i)]; if (!x) return;
      if (etat.idees.some(y => y.lien === x.lien)) { toast('Cette idée est déjà dans ta boîte.'); return; }
      if (etat.idees.length >= 500) { toast('La boîte est pleine (500 idées).'); return; }
      etat.idees.unshift({ id: nouvelId(), titre: x.titre.slice(0, 200), lien: x.lien.slice(0, 500), note: `${x.editeur || x.source}`.slice(0, 500), statut: 'a-faire', date: aujourdhui(), source: 'veille' });
      render(`[data-action="veille-idee"][data-i="${b.dataset.i}"]`); toast('Gardée dans ta boîte à idées.'); return;
    }
    if (a === 'idee-planning') {
      const x = etat.idees.find(y => y.id === b.dataset.id); if (!x) return;
      if (etat.planning.length >= 1500) { toast('Le planning est plein (1 500 éléments).'); return; }
      etat.planning.push({ id: nouvelId(), date: aujourdhui(), heure: '', client: '', type: 'post', titre: x.titre.slice(0, 120), fait: false });
      x.statut = 'en-cours'; render(`[data-action="idee-planning"][data-id="${x.id}"]`); toast('Ajoutée au planning d’aujourd’hui. Change le jour dans l’outil Planning.'); return;
    }
    if (a === 'idee-suppr') { etat.idees = etat.idees.filter(y => y.id !== b.dataset.id); render('#pf-idee-titre'); return; }
    if (a === 'exporter') { exporter(); return; }
    if (a === 'imprimer') { window.print(); return; }
    if (a === 'reinitialiser') {
      $('#sauvegarde').close();
      if (!(await confirmer('Effacer toute ta progression et ton carnet ? Exporte d’abord si tu veux garder une copie.', 'Tout effacer'))) return;
      etat = M.neuf(); drafts = {}; eclair = null; jeu = null; pf = {}; revision = null; render('h1'); annoncer('Le module a été réinitialisé.'); return;
    }
  });
  function exporter() {
    const blob = new Blob([JSON.stringify(M.normaliser(etat, C), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = `jtipilot-module-cm-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    etat.sauvegarde = aujourdhui(); sauver();
    const rappel = document.querySelector('.rappel-sauvegarde'); if (rappel) rappel.remove();
    $('#message-import').textContent = 'Fichier préparé. Garde-le en lieu sûr : il contient tes notes.';
  }
  async function importerFichier(file) {
    if (!file) return;
    const msg = $('#message-import');
    try {
      if (file.size > M.MAX_FICHIER) throw new Error('Le fichier dépasse 1 Mo. Rien n’a été modifié.');
      const prochain = M.importer(await file.text(), C);
      $('#sauvegarde').close();
      if (!(await confirmer('Remplacer ta progression actuelle par ce fichier ?', 'Remplacer'))) return;
      etat = prochain; drafts = {}; eclair = null; jeu = null; pf = {}; revision = null; render('h1'); annoncer('Progression restaurée.');
    } catch (err) { msg.textContent = err.message || 'Import impossible. Ta progression est conservée.'; }
    finally { $('#fichier-progression').value = ''; }
  }
  document.addEventListener('toggle', e => { if (e.target.classList && e.target.classList.contains('reglages')) reglagesOuvert = e.target.open; }, true);
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const suivre = () => { if (!etat.theme) render(); };
    if (mq.addEventListener) mq.addEventListener('change', suivre);
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); installPrompt = e;
    const zone = document.querySelector('.barre .outils');
    if (zone && !zone.querySelector('[data-action="installer"]')) zone.insertAdjacentHTML('beforeend', '<button class="bouton primaire" data-action="installer">Installer l’app</button>');
  });
  window.addEventListener('appinstalled', () => { installPrompt = null; document.querySelectorAll('[data-action="installer"]').forEach(x => x.remove()); toast('Application installée.'); });
  window.addEventListener('offline', () => toast('Tu es hors connexion. Tout marche, sauf l’actualisation des taux BCE.'));
  window.addEventListener('online', () => toast('De retour en ligne.'));
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
  /* Partage depuis le téléphone : l'adresse reçue devient une idée. */
  function traiterPartage() {
    const p = new URLSearchParams(location.search);
    if (p.get('vue') === 'veille') { etat.vue = 'veille'; history.replaceState(null, '', location.pathname); return false; }
    if (!p.has('url') && !p.has('text') && !p.has('title')) return false;
    const m = /https?:\/\/[^\s<>"']+/.exec([p.get('url'), p.get('text')].filter(Boolean).join(' ')), lien = m ? m[0].slice(0, 500) : '';
    const titre = (p.get('title') || (p.get('text') || '').replace(/https?:\/\/\S+/g, '').trim() || lien).slice(0, 200);
    history.replaceState(null, '', location.pathname);
    if (!titre && !lien) return false;
    etat.vue = 'veille';
    if (!(lien && etat.idees.some(y => y.lien === lien)) && etat.idees.length < 500) etat.idees.unshift({ id: nouvelId(), titre: titre || lien, lien, note: '', statut: 'a-faire', date: aujourdhui(), source: 'partage' });
    return true;
  }
  const partage = traiterPartage();
  render();
  if (partage) toast('Idée ajoutée depuis le partage.');
}());
