/* Interface du module CM freelance. Rendu par chaînes, délégation d'événements.
   Seule requête réseau possible : le bouton « Actualiser les taux BCE », à la demande. */
(function () {
  'use strict';
  const C = window.CMContenu, M = window.CMMoteur, S = window.CMSources, R = S.reperes;
  const SC = window.CMScenarios || [], RS = window.CMRessources || [];
  const depot = M.stockage(() => window.localStorage, C);
  let etat = depot.etat, drafts = {}, dernierFocus = null;
  let combo = 0, eclair = null, jeu = null, conv = { montant: 500, devise: 'USD' }, sprint = null, toastTimer = null;
  const toutes = M.toutes(C);
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
  function lienNav(view, num, libelle) {
    const actif = etat.vue === view;
    return `<button class="nav-lien" data-view="${view}" ${actif ? 'aria-current="page"' : ''}>${num}<span>${esc(libelle)}</span></button>`;
  }
  function menu() {
    const groupes = C.parcours.filter(p => p.id !== 'final').map(p => {
      const ls = C.lecons.filter(l => l.parcours === p.id);
      return `<div class="nav-groupe"><p class="sur-titre">${esc(p.nom)}</p>${ls.map(l => lienNav(l.id, marque(l), l.titre)).join('')}</div>`;
    }).join('');
    return `${lienNav('accueil', '<span class="nav-num">⌂</span>', 'Accueil')}
      <div class="nav-groupe"><p class="sur-titre">Jouer et s’outiller</p>${lienNav('simulateurs', '<span class="nav-num">€$£</span>', 'Boîte à outils')}${lienNav('scenarios', '<span class="nav-num">▶</span>', 'Scénarios')}${lienNav('eclair', '<span class="nav-num">⚡</span>', 'Quiz éclair')}${lienNav('ressources', '<span class="nav-num">★</span>', 'Ressources')}</div>
      ${groupes}
      <div class="nav-groupe"><p class="sur-titre">Pour finir</p>${lienNav('final', marque(C.final), 'Épreuve finale')}</div>
      <div class="nav-groupe"><p class="sur-titre">Mes affaires</p>${lienNav('carnet', '<span class="nav-num">≡</span>', 'Mon carnet')}${lienNav('sources', '<span class="nav-num">§</span>', 'Sources officielles')}</div>`;
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
  const ENERGIES = {
    basse: ['Batterie faible', 'Fais un quiz éclair (2 minutes) ou relis un mémo. C’est déjà gagné.', 'eclair', 'Lancer le quiz éclair'],
    moyenne: ['Batterie moyenne', 'Une leçon de 8 minutes avec un sprint de 10 minutes, puis pause.', 'reprise', 'Reprendre ma leçon'],
    haute: ['Batterie pleine', 'Joue un scénario, puis attaque un outil de la boîte à outils avec un vrai chiffre.', 'scenarios', 'Jouer un scénario']
  };
  function accueil() {
    const pr = M.progression(C, etat);
    const prochaine = pr.prochaine;
    const derniere = etat.derniere ? toutes.find(l => l.id === etat.derniere) : null;
    const debut = pr.reussies === 0 && !Object.keys(etat.reponses).length;
    const reprise = debut ? 'Commence par la première leçon : 8 minutes, quelques questions, zéro pression.'
      : `Tu as validé ${pr.reussies} leçon${pr.reussies > 1 ? 's' : ''}${derniere ? `, la dernière ouverte était « ${derniere.titre} »` : ''}. Il en reste ${pr.reste}. ${prochaine ? `Prochaine étape : ${prochaine.code}, ${prochaine.titre}.` : 'Tout est validé.'}`;
    const qj = questionDuJour();
    const en = etat.energie && ENERGIES[etat.energie];
    return `<header class="en-tete"><p class="sur-titre">JTIpilot · Module ${esc(C.titre)}</p><h1>Ton métier, ton business, tes clients.</h1><p class="intro">Des leçons de 8 à 12 minutes, une question à la fois, des scénarios à jouer et une boîte à outils en euros, dollars et livres. Tu peux recommencer autant que tu veux.</p></header>
      <div class="disposition"><div class="pile">
        <section class="depart"><p class="sur-titre">${debut ? 'Bienvenue' : 'Ta reprise'}</p><h2>${prochaine ? esc(prochaine.titre) : 'Module terminé.'}</h2><p>${esc(reprise)}</p>
          <button class="bouton" data-view="${prochaine ? prochaine.id : 'carnet'}">${debut ? 'Commencer' : prochaine ? 'Reprendre' : 'Ouvrir mon carnet'} <span aria-hidden="true">→</span></button></section>
        <section class="carte energie"><h2>Ton énergie du jour ?</h2><p class="petit">Choisis, je te propose une activité à ta mesure.</p>
          <div class="segments" role="group" aria-label="Niveau d’énergie">${Object.entries(ENERGIES).map(([k, v]) => `<button class="segment" data-action="energie" data-energie="${k}" aria-pressed="${etat.energie === k}">${esc(v[0])}</button>`).join('')}</div>
          ${en ? `<p class="suggestion">${esc(en[1])}</p><div class="actions"><button class="bouton primaire" ${en[2] === 'reprise' ? `data-view="${prochaine ? prochaine.id : 'accueil'}"` : `data-view="${en[2]}"`}>${esc(en[3])} <span aria-hidden="true">→</span></button><button class="bouton" data-action="sprint" data-minutes="10">Sprint de 10 minutes</button></div>` : ''}</section>
        <div class="grille-jeux">
          <button class="tuile" data-view="scenarios"><span class="tuile-icone" aria-hidden="true">▶</span><strong>Scénarios</strong><span>${SC.length} histoires dont tu es l’héroïne</span></button>
          <button class="tuile" data-view="eclair"><span class="tuile-icone" aria-hidden="true">⚡</span><strong>Quiz éclair</strong><span>5 questions au hasard${etat.eclair.meilleur ? ` · record ${etat.eclair.meilleur}/5` : ''}</span></button>
          <button class="tuile" data-view="simulateurs"><span class="tuile-icone" aria-hidden="true">€$£</span><strong>Boîte à outils</strong><span>Cotisations, budget, reporting, devis</span></button>
          <button class="tuile" data-view="ressources"><span class="tuile-icone" aria-hidden="true">★</span><strong>Ressources</strong><span>${RS.reduce((a, c) => a + c.liens.length, 0)} outils et liens triés</span></button>
        </div>
        ${qj ? `<section class="carte qdj"><p class="sur-titre">Question du jour · ${esc(qj.l.code)}</p><h2>${esc(qj.q.titre)}</h2><p>${esc(qj.q.texte)}</p><div class="actions"><button class="bouton primaire" data-action="qdj" data-lecon="${qj.l.id}" data-i="${qj.i}">${repondu(qj.q) ? 'Revoir ma réponse' : 'Y répondre'} <span aria-hidden="true">→</span></button></div></section>` : ''}
        ${C.parcours.filter(p => p.id !== 'final').map(p => {
          const ls = C.lecons.filter(l => l.parcours === p.id);
          return `<section><div class="titre-liste"><div><h2>${esc(p.nom)}</h2><p class="petit">${esc(p.image)}</p></div><span class="etiquette">${pr.parcours[p.id].reussies} / ${ls.length} validées</span></div>
            <div class="ateliers">${ls.map(l => `<article class="atelier-ligne ${M.bilan(l, etat.reponses).reussi ? 'validee' : ''}"><span class="numero">${esc(l.code)}</span><div><h3>${esc(l.titre)}</h3><p class="petit">${esc(l.duree)} · ${esc(statut(l))}</p></div><button class="lien-action" data-view="${l.id}" aria-label="Ouvrir ${esc(l.code)} : ${esc(l.titre)}">Ouvrir <span aria-hidden="true">↗</span></button></article>`).join('')}</div></section>`;
        }).join('')}
        <section class="carte invitation"><p class="sur-titre">Le boss de fin</p><h2>${esc(C.final.titre)}</h2><p>${esc(C.final.court)} ${C.final.questions.length} questions, 80 % et aucune erreur critique.</p><div class="actions"><button class="bouton primaire" data-view="final">Ouvrir l’épreuve</button><span class="petit">${esc(statut(C.final))}</span></div></section>
      </div>${panneau(pr)}</div>`;
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
  function feedbackQuestion(q, val) {
    const ok = M.correcte(q, val);
    const attendue = q.type === 'nombre' ? `${nb(q.bonne, 2)} ${q.unite}` : q.type === 'multiple' ? q.bonne.map(i => q.options[i]).join(' · ') : q.options[q.bonne];
    const fete = ok ? `<span class="fete" aria-hidden="true">${'<i></i>'.repeat(12)}</span>` : '';
    return `<section id="correction" class="feedback ${ok ? 'gagne' : q.critique ? 'critique' : 'erreur'}" tabindex="-1" aria-label="Correction">${fete}<h3>${ok ? ['Bien joué.', 'Exactement.', 'Dans le mille.', 'Pro.'][Math.floor(Math.random() * 4)] : q.critique ? 'Erreur critique : à reprendre.' : 'Pas tout à fait.'}${ok && combo > 1 ? ` <span class="combo">Combo ×${combo}</span>` : ''}${ok ? ' <span class="gain">+10 XP</span>' : ''}</h3>${!ok ? `<p><strong>Réponse attendue :</strong> ${esc(attendue)}</p>` : ''}<p>${esc(q.explication)}</p></section>`;
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
      <header class="lecon-entete"><div class="meta"><span class="etiquette">${esc(p.nom)}</span><span>${esc(l.code)} · ${esc(l.duree)}</span><span>${esc(statut(l))}</span></div><h1 tabindex="-1">${esc(l.titre)}</h1><p class="intro">${esc(l.objectif)}</p></header>
      ${etapes()}${corps}`;
  }
  function cours(l) {
    const outil = { b2: 'cotis', b3: 'cotis', b4: 'revenu', b5: 'doc', b6: 'treso', b7: 'devises', b8: 'doc', b9: 'budget', p1: 'pipeline', p2: 'pipeline', t8: 'reporting' }[l.id];
    return `<section class="carte"><div class="situation"><p class="sur-titre">La situation</p><p>${esc(l.situation)}</p></div>
      ${l.cours.map(([t, x], i) => `<section class="cours-bloc"><h2><span class="puce-num" aria-hidden="true">${i + 1}</span>${esc(t)}</h2><p>${esc(x)}</p></section>`).join('')}
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
      <div class="feedback ${b.reussi ? 'gagne' : b.critiques ? 'critique' : 'erreur'}">${b.reussi ? `<span class="fete" aria-hidden="true">${'<i></i>'.repeat(12)}</span>` : ''}<h3>${esc(message)}</h3><p>${b.reussi ? esc(l.memo) : 'Relis le cours, puis rejoue la leçon. Tes notes sont conservées.'}</p></div>
      <section class="cours-bloc"><h2>Ton mini-défi</h2><p>${esc(l.defi)}</p></section>
      <div class="champ"><label for="note-action">Mon action concrète</label><textarea id="note-action" data-note="action" maxlength="1500" placeholder="Ce que je fais pour de vrai…">${esc(note.action)}</textarea></div>
      <div class="deux-champs"><div class="champ"><label for="note-echeance">Pour quand ?</label><input id="note-echeance" data-note="echeance" type="text" maxlength="120" value="${esc(note.echeance)}" placeholder="Ex. jeudi soir"></div>
      <div class="champ"><span class="label-faux">Où j’en suis</span><label class="choix case"><input type="checkbox" data-note="fait" ${note.fait ? 'checked' : ''}><span>Défi réalisé</span></label></div></div>
      <p class="sauve-note" data-note-etat>Enregistré automatiquement dans ton carnet.</p>
      <div class="actions">${suivante ? `<button class="bouton primaire" data-view="${suivante.id}">Suivante : ${esc(suivante.code)} <span aria-hidden="true">→</span></button>` : '<button class="bouton primaire" data-view="carnet">Voir mon carnet</button>'}<button class="bouton discret" data-action="rejouer">Rejouer la leçon</button><button class="bouton discret" data-view="accueil">Faire une pause</button></div>
      ${liensSources(l.sources)}</section>`;
  }

  /* ---------- Quiz éclair ---------- */
  function nouvelEclair() {
    const pool = []; toutes.forEach(l => l.questions.forEach(q => pool.push({ l, q })));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    eclair = { qs: pool.slice(0, 5), i: 0, rep: {}, fini: false };
  }
  function vueEclair() {
    if (!eclair) nouvelEclair();
    const tete = `<header class="en-tete"><p class="sur-titre">Jouer · Quiz éclair</p><h1 tabindex="-1">5 questions, tout le module</h1><p class="intro">Des questions tirées au hasard dans toutes les leçons. Parfait pour 3 minutes de révision. Record : ${etat.eclair.meilleur} / 5 · ${etat.eclair.parties} partie${etat.eclair.parties > 1 ? 's' : ''}.</p></header>`;
    if (eclair.fini) {
      const bonnes = eclair.qs.filter(x => M.correcte(x.q, eclair.rep[x.q.id])).length;
      const ratees = eclair.qs.filter(x => !M.correcte(x.q, eclair.rep[x.q.id]));
      return `${tete}<section class="carte"><div class="resume-score"><p class="score">${bonnes} / 5<span> · +${bonnes * 5} XP</span></p></div>
        <div class="feedback ${bonnes >= 4 ? 'gagne' : bonnes >= 3 ? '' : 'erreur'}">${bonnes >= 4 ? `<span class="fete" aria-hidden="true">${'<i></i>'.repeat(12)}</span>` : ''}<h3>${bonnes === 5 ? 'Sans faute. Légendaire.' : bonnes >= 3 ? 'Solide. Encore une ?' : 'Échauffement terminé. On rejoue ?'}</h3>${ratees.length ? `<p>À revoir : ${ratees.map(x => `<button class="lien-action en-ligne" data-view="${x.l.id}">${esc(x.l.code)} ${esc(x.l.titre)}</button>`).join(' · ')}</p>` : ''}</div>
        <div class="actions"><button class="bouton primaire" data-action="eclair-rejouer">Nouvelle partie <span aria-hidden="true">↻</span></button><button class="bouton discret" data-view="accueil">Faire une pause</button></div></section>`;
    }
    const { l, q } = eclair.qs[eclair.i], faite = Object.prototype.hasOwnProperty.call(eclair.rep, q.id), val = faite ? eclair.rep[q.id] : drafts[q.id];
    return `${tete}<section class="carte question"><ol class="points-q" aria-hidden="true">${eclair.qs.map((x, i) => { const r = Object.prototype.hasOwnProperty.call(eclair.rep, x.q.id); return `<li class="${i === eclair.i ? 'actuelle' : ''} ${r ? (M.correcte(x.q, eclair.rep[x.q.id]) ? 'juste' : 'faux') : ''}"></li>`; }).join('')}</ol>
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
  const ONGLETS = [['devises', 'Convertir'], ['cotis', 'Cotisations'], ['revenu', 'Tarif → revenu'], ['treso', 'Trésorerie'], ['pipeline', 'Prospection'], ['budget', 'Budget'], ['reporting', 'Reporting'], ['doc', 'Devis & facture']];

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
      <div class="actions"><button class="bouton primaire" data-action="imprimer-doc">Imprimer ou enregistrer en PDF</button>${etat.doc.type === 'devis' ? '<button class="bouton" data-action="vers-facture">Devis accepté : en faire une facture</button>' : ''}</div>`;
  }
  function outilDoc() {
    const d = etat.doc;
    return `<div class="calcul-champs">${champSelect('doc', 'type', 'Document', d.type, [['devis', 'Devis'], ['facture', 'Facture']])}${champTexte('doc', 'numero', 'Numéro', d.numero, 40)}${champTexte('doc', 'date', 'Date', d.date, 10, '', 'date')}
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
  const OUTIL_RENDU = { devises: [outilDevises, resultatDevises], cotis: [outilCotis, resultatCotis], revenu: [outilRevenu, resultatRevenu], treso: [outilTreso, resultatTreso], pipeline: [outilPipeline, resultatPipeline], budget: [outilBudget, resultatBudget], reporting: [outilReporting, resultatReporting], doc: [outilDoc, resultatDoc] };
  function simulateurs() {
    const o = etat.outil;
    return `<header class="en-tete"><p class="sur-titre">S’outiller · Piloter mon business</p><h1 tabindex="-1">Boîte à outils</h1><p class="intro">Huit outils pour décider avec des chiffres, en euros, dollars et livres sterling. Les taux viennent des sources officielles vérifiées le ${esc(S.verifie)} : ce sont des repères pédagogiques, pas un conseil fiscal.</p></header>
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
      <section class="carte"><h2>Garder une copie</h2><p class="petit">Ta progression vit dans ce navigateur. Exporte-la en fichier pour la garder ou changer d’appareil.</p><div class="actions"><button class="bouton" data-action="sauvegarde">Sauvegarder ou restaurer</button><button class="bouton discret" data-action="imprimer">Imprimer le carnet</button></div></section></div>`;
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

  /* ---------- Rendu ---------- */
  function contenuVue() {
    const l = getLecon();
    if (l) return lecon(l);
    const v = { simulateurs, carnet, sources, scenarios: vueScenarios, eclair: vueEclair, ressources: vueRessources }[etat.vue];
    return v ? v() : accueil();
  }
  function fil() {
    const l = getLecon();
    if (l) return `${esc(parcoursDe(l).nom)}<span>${esc(l.code)}</span>`;
    return { simulateurs: 'Outils<span>Boîte à outils</span>', carnet: 'Mes affaires<span>Mon carnet</span>', sources: 'Mes affaires<span>Sources</span>', scenarios: 'Jouer<span>Scénarios</span>', eclair: 'Jouer<span>Quiz éclair</span>', ressources: 'Outils<span>Ressources</span>' }[etat.vue] || 'Module CM<span>Accueil</span>';
  }
  function boutonsBarre() {
    const sombre = document.documentElement.dataset.theme === 'sombre';
    return `<div class="sprint-zone"><details class="sprint"><summary class="bouton">${sprint ? 'Sprint en cours' : 'Sprint'}</summary><div class="sprint-menu" role="group" aria-label="Durée du sprint">${[5, 10, 15, 25].map(m => `<button class="bouton" data-action="sprint" data-minutes="${m}">${m} min</button>`).join('')}${sprint ? '<button class="bouton discret" data-action="stop-sprint">Arrêter</button>' : ''}</div></details><span id="minuteur" class="minuteur" ${sprint ? '' : 'hidden'} role="timer" aria-live="off"></span></div>
      <button class="bouton" data-action="theme" aria-pressed="${sombre}" title="Basculer le mode sombre">${sombre ? '☀ Clair' : '☾ Sombre'}</button>
      <button class="bouton" data-action="aere" aria-pressed="${!!etat.aere}" title="Agrandir l’interlignage">Texte aéré</button>
      <button class="bouton" data-action="focus" aria-pressed="${etat.focus}">Focus</button><button class="bouton" data-action="sauvegarde">Sauvegarder</button>`;
  }
  function render(focusSel) {
    appliquerTheme();
    document.body.classList.toggle('focus', etat.focus);
    $('#application').innerHTML = `<div class="coquille"><aside class="rail" aria-label="Navigation du module"><div><p class="marque">JTIpilot<span aria-hidden="true"></span></p><p class="sous-marque">Community manager freelance</p></div>${blocXp(true)}<nav aria-label="Leçons">${menu()}</nav><div class="rail-bas"><strong>Repères ${R.annee}</strong>Vérifiés le ${esc(S.verifie)} sur les sources officielles.</div></aside>
      <div class="zone"><div class="barre"><p class="fil">${fil()}</p><div class="outils">${boutonsBarre()}</div></div>
      <p class="ruban"><span class="point" aria-hidden="true"></span>Ta progression reste dans ce navigateur. Seul le bouton « Actualiser les taux BCE » contacte un service externe, à ta demande.</p>
      <p id="stockage-avertissement" class="stockage-alerte" ${depot.persistant ? 'hidden' : ''}>${esc(depot.avertissement)}</p>
      <details class="mobile-nav"><summary>Menu : leçons, jeux et outils</summary>${blocXp(true)}<nav aria-label="Leçons (mobile)">${menu()}</nav></details>
      <main id="principal">${contenuVue()}<footer class="pied"><span>JTIpilot · Module ${esc(C.titre)} · contenu ${esc(C.version)} revu le ${esc(C.revue)}. Les chiffres légaux et fiscaux sont des repères pédagogiques : vérifier sur la source officielle liée.</span><button class="lien-action" data-view="sources">Sources</button></footer></main></div></div>`;
    largeurs(); majMinuteur();
    sauver();
    if (focusSel) { const el = $(focusSel); if (el) el.focus({ preventScroll: false }); }
  }
  function ouvrir(view, ancrer) {
    const l = toutes.find(x => x.id === view);
    etat.vue = view; etat.question = 0; drafts = {};
    if (view === 'eclair' && (!eclair || eclair.fini)) nouvelEclair();
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
    const modeEclair = e.target.dataset.mode === 'eclair';
    const q = modeEclair ? eclair.qs[eclair.i].q : qActuelle(), err = $('#erreur-question');
    let v;
    if (q.type === 'nombre') { const raw = $('#nombre-reponse').value.replace(',', '.'); v = raw === '' ? NaN : Number(raw); }
    else { const vals = [...document.querySelectorAll('input[name="choix"]:checked')].map(x => Number(x.value)); v = q.type === 'multiple' ? vals : vals[0]; }
    if (!M.valeurValide(q, v)) { err.textContent = q.type === 'nombre' ? 'Entre un nombre.' : 'Choisis une réponse.'; return; }
    if (q.type === 'multiple' && v.length !== q.bonne.length) { err.textContent = `Choisis exactement ${q.bonne.length} réponses.`; return; }
    const ok = M.correcte(q, v);
    combo = ok ? combo + 1 : 0;
    marquerJour();
    if (modeEclair) eclair.rep[q.id] = v; else etat.reponses[q.id] = v;
    delete drafts[q.id];
    render('#correction');
    annoncer(ok ? `Bonne réponse${combo > 1 ? `, combo de ${combo}` : ''}.` : 'Réponse incorrecte, la correction est affichée.');
  });
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
    /* Les champs dont le libellé dépend d'un choix demandent un rendu complet. */
    if (g === 'doc' && ['type', 'situation', 'devise'].includes(k)) { render(`#${t.id}`); sauver(); return; }
    const cible = $(`#resultat-${etat.outil}`);
    if (cible) { cible.innerHTML = OUTIL_RENDU[etat.outil][1](); largeurs(cible); }
    sauver();
  }
  document.addEventListener('input', e => {
    const t = e.target;
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
    if (t.name === 'nombre') { const q = etat.vue === 'eclair' && eclair ? eclair.qs[eclair.i].q : qActuelle(); if (q) drafts[q.id] = t.value; }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'choix') { const q = etat.vue === 'eclair' && eclair ? eclair.qs[eclair.i].q : qActuelle(); const vals = [...document.querySelectorAll('input[name="choix"]:checked')].map(x => Number(x.value)); drafts[q.id] = q.type === 'multiple' ? vals : vals[0]; }
    if (t.matches('[data-sim]') && (t.type === 'checkbox' || t.tagName === 'SELECT')) majSim(t);
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
    if (a === 'aere') { etat.aere = !etat.aere; render('.barre [data-action="aere"]'); annoncer(etat.aere ? 'Texte aéré activé.' : 'Texte aéré désactivé.'); return; }
    if (a === 'sprint') { lancerSprint(Number(b.dataset.minutes) || 10); return; }
    if (a === 'stop-sprint') { if (sprint) clearInterval(sprint.id); sprint = null; render('.sprint summary'); toast('Sprint arrêté. Pas grave : tu reprends quand tu veux.'); return; }
    if (a === 'energie') { etat.energie = b.dataset.energie; render('.energie [aria-pressed="true"]'); return; }
    if (a === 'qdj') { const lq = toutes.find(x => x.id === b.dataset.lecon); etat.vue = lq.id; etat.derniere = lq.id; etat.etape = 'exercice'; etat.question = Number(b.dataset.i); drafts = {}; render('.question h2'); window.scrollTo(0, 0); return; }
    if (a === 'outil') { etat.outil = b.dataset.outil; ouvrir('simulateurs'); return; }
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
    if (a === 'vers-facture') { etat.doc.type = 'facture'; etat.doc.numero = etat.doc.numero.replace(/^D/, 'F'); etat.doc.date = aujourdhui(); render('#doc-type'); toast('C’est une facture. Vérifie le numéro : il doit suivre ta numérotation, sans trou.'); return; }
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
    if (a === 'eclair-rejouer') { nouvelEclair(); drafts = {}; render('.question h2'); return; }
    if (a === 'sauvegarde') { dernierFocus = b; $('#message-import').textContent = ''; $('#sauvegarde').showModal(); return; }
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
    if (a === 'exporter') { exporter(); return; }
    if (a === 'imprimer') { window.print(); return; }
    if (a === 'reinitialiser') {
      $('#sauvegarde').close();
      if (!(await confirmer('Effacer toute ta progression et ton carnet ? Exporte d’abord si tu veux garder une copie.', 'Tout effacer'))) return;
      etat = M.neuf(); drafts = {}; eclair = null; jeu = null; render('h1'); annoncer('Le module a été réinitialisé.'); return;
    }
  });
  function exporter() {
    const blob = new Blob([JSON.stringify(M.normaliser(etat, C), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = `jtipilot-module-cm-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#message-import').textContent = 'Fichier préparé. Garde-le en lieu sûr : il contient tes notes.';
  }
  async function importerFichier(file) {
    if (!file) return;
    const msg = $('#message-import');
    try {
      if (file.size > M.MAX_FICHIER) throw new Error('Le fichier dépasse 200 Ko. Rien n’a été modifié.');
      const prochain = M.importer(await file.text(), C);
      $('#sauvegarde').close();
      if (!(await confirmer('Remplacer ta progression actuelle par ce fichier ?', 'Remplacer'))) return;
      etat = prochain; drafts = {}; eclair = null; jeu = null; render('h1'); annoncer('Progression restaurée.');
    } catch (err) { msg.textContent = err.message || 'Import impossible. Ta progression est conservée.'; }
    finally { $('#fichier-progression').value = ''; }
  }
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const suivre = () => { if (!etat.theme) render(); };
    if (mq.addEventListener) mq.addEventListener('change', suivre);
  }
  render();
}());
