/* Interface du module CM freelance. Rendu par chaînes, délégation d'événements, aucune requête réseau. */
(function () {
  'use strict';
  const C = window.CMContenu, M = window.CMMoteur, S = window.CMSources, R = S.reperes;
  const depot = M.stockage(() => window.localStorage, C);
  let etat = depot.etat, drafts = {}, dernierFocus = null;
  const toutes = M.toutes(C);
  const $ = s => document.querySelector(s);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const euro = v => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
  const nb = (v, d) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: d == null ? 1 : d }).format(v);
  const getLecon = () => toutes.find(l => l.id === etat.vue);
  const qActuelle = () => { const l = getLecon(); return l && l.questions[etat.question]; };
  const repondu = q => Object.prototype.hasOwnProperty.call(etat.reponses, q.id);
  const parcoursDe = l => C.parcours.find(p => p.id === l.parcours);

  function annoncer(t) { $('#annonce').textContent = t; }
  function sauver() {
    const ok = depot.enregistrer(etat);
    const warn = $('#stockage-avertissement');
    if (warn) { warn.hidden = depot.persistant; warn.textContent = depot.avertissement; }
    return ok;
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
    return `<details class="sources"><summary>${esc(titre || 'Sources officielles')}</summary><ul>${ids.map(id => {
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
    const actif = etat.vue === view || (view === 'accueil' && false);
    return `<button class="nav-lien" data-view="${view}" ${actif ? 'aria-current="page"' : ''}>${num}<span>${esc(libelle)}</span></button>`;
  }
  function menu() {
    const groupes = C.parcours.filter(p => p.id !== 'final').map(p => {
      const ls = C.lecons.filter(l => l.parcours === p.id);
      return `<div class="nav-groupe"><p class="sur-titre">${esc(p.nom)}</p>${ls.map(l => lienNav(l.id, marque(l), l.titre)).join('')}</div>`;
    }).join('');
    return `${lienNav('accueil', '<span class="nav-num">↗</span>', 'Accueil')}
      ${groupes}
      <div class="nav-groupe"><p class="sur-titre">Pour finir</p>${lienNav('final', marque(C.final), 'Épreuve finale')}</div>
      <div class="nav-groupe"><p class="sur-titre">Outils</p>${lienNav('simulateurs', '<span class="nav-num">€</span>', 'Simulateurs')}${lienNav('carnet', '<span class="nav-num">≡</span>', 'Mon carnet')}${lienNav('sources', '<span class="nav-num">§</span>', 'Sources officielles')}</div>`;
  }

  /* ---------- Accueil ---------- */
  function badges(pr) {
    return `<div class="badges">${C.parcours.map(p => {
      const s = pr.parcours[p.id], ok = s && s.total && s.reussies === s.total;
      return `<div class="badge ${ok ? 'obtenu' : ''}"><strong>${esc(p.badge)}</strong><span>${s ? `${s.reussies} / ${s.total}` : ''}</span></div>`;
    }).join('')}</div>`;
  }
  function accueil() {
    const pr = M.progression(C, etat);
    const prochaine = pr.prochaine;
    const derniere = etat.derniere ? toutes.find(l => l.id === etat.derniere) : null;
    const debut = pr.reussies === 0 && !Object.keys(etat.reponses).length;
    const reprise = debut ? 'Commence par la première leçon : 8 minutes, trois questions.'
      : `Tu as validé ${pr.reussies} leçon${pr.reussies > 1 ? 's' : ''}${derniere ? `, la dernière ouverte était « ${derniere.titre} »` : ''}. Il en reste ${pr.reste}. ${prochaine ? `Commence par ${prochaine.code} : ${prochaine.titre}.` : 'Tout est validé.'}`;
    return `<header class="en-tete"><p class="sur-titre">JTIpilot · Module ${esc(C.titre)}</p><h1>Ton métier, ton business, tes clients.</h1><p class="intro">Quatre parcours courts et une épreuve finale. Des leçons de 8 à 12 minutes, une question à la fois, et le droit de recommencer autant que tu veux.</p></header>
      <div class="disposition"><div class="pile">
        <section class="depart"><p class="sur-titre">${debut ? 'Bienvenue' : 'Ta reprise'}</p><h2>${prochaine ? esc(prochaine.titre) : 'Module terminé.'}</h2><p>${esc(reprise)}</p>
          <button class="bouton" data-view="${prochaine ? prochaine.id : 'carnet'}">${debut ? 'Commencer' : prochaine ? 'Reprendre' : 'Ouvrir mon carnet'} <span aria-hidden="true">→</span></button></section>
        ${C.parcours.filter(p => p.id !== 'final').map(p => {
          const ls = C.lecons.filter(l => l.parcours === p.id);
          return `<section><div class="titre-liste"><div><h2>${esc(p.nom)}</h2><p class="petit">${esc(p.image)}</p></div><span class="etiquette">${pr.parcours[p.id].reussies} / ${ls.length} validées</span></div>
            <div class="ateliers">${ls.map(l => `<article class="atelier-ligne"><span class="numero">${esc(l.code)}</span><div><h3>${esc(l.titre)}</h3><p class="petit">${esc(l.duree)} · ${esc(statut(l))}</p></div><button class="lien-action" data-view="${l.id}" aria-label="Ouvrir ${esc(l.code)} : ${esc(l.titre)}">Ouvrir <span aria-hidden="true">↗</span></button></article>`).join('')}</div></section>`;
        }).join('')}
        <section class="carte invitation"><p class="sur-titre">Le boss de fin</p><h2>${esc(C.final.titre)}</h2><p>${esc(C.final.court)} ${C.final.questions.length} questions, 80 % et aucune erreur critique.</p><div class="actions"><button class="bouton primaire" data-view="final">Ouvrir l’épreuve</button><span class="petit">${esc(statut(C.final))}</span></div></section>
      </div>${panneau(pr)}</div>`;
  }
  function panneau(pr) {
    pr = pr || M.progression(C, etat);
    return `<aside class="panneau" aria-label="Repères"><section class="carte"><h2>Ton avancée</h2><div class="progression-texte"><span>Leçons validées</span><strong>${pr.reussies} / ${pr.total}</strong></div><progress value="${pr.reussies}" max="${pr.total}" aria-label="${pr.reussies} leçons validées sur ${pr.total}"></progress>${badges(pr)}</section>
      <section class="carte"><p class="sur-titre">Comment ça marche</p><ol class="liste-simple"><li>Un cours de 3 ou 4 points.</li><li>Des questions, une à la fois.</li><li>Une explication pour chaque réponse.</li><li>Un mini-défi à faire dans la vraie vie.</li></ol><p class="petit">Validé à 80 % sans erreur critique. Pas de chrono.</p></section>
      <section class="carte"><h2>Besoin de souffler ?</h2><p class="petit">Le mode focus masque tout sauf la leçon. Ta progression est sauvegardée à chaque réponse.</p><div class="actions"><button class="bouton" data-action="focus">${etat.focus ? 'Quitter le mode focus' : 'Activer le mode focus'}</button></div></section></aside>`;
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
    return `<section class="carte"><div class="situation"><p class="sur-titre">La situation</p><p>${esc(l.situation)}</p></div>
      ${l.cours.map(([t, x]) => `<section class="cours-bloc"><h2>${esc(t)}</h2><p>${esc(x)}</p></section>`).join('')}
      <div class="memo"><strong>À retenir</strong>${esc(l.memo)}</div>
      ${l.parcours === 'business' ? '<div class="actions"><button class="bouton" data-view="simulateurs">Tester avec les simulateurs</button></div>' : ''}
      <div class="actions"><button class="bouton primaire" data-action="exercice">${M.bilan(l, etat.reponses).fini ? 'Revoir mes réponses' : 'Passer aux questions'} <span aria-hidden="true">→</span></button><span class="petit">${l.questions.length} questions · sans chrono</span></div>
      ${liensSources(l.sources)}</section>`;
  }
  function libelleConsigne(q) {
    if (q.type === 'multiple') return `Plusieurs réponses : choisis-en ${q.bonne.length}.`;
    return 'Une seule réponse.';
  }
  function renduQuestion(l) {
    const q = l.questions[etat.question], faite = repondu(q), val = faite ? etat.reponses[q.id] : drafts[q.id];
    let champs;
    if (q.type === 'nombre') {
      champs = `<fieldset><legend>Ta réponse (en ${esc(q.unite)})</legend><div class="champ-reponse"><label class="sr-only" for="nombre-reponse">Ta réponse en ${esc(q.unite)}</label><input id="nombre-reponse" name="nombre" type="number" inputmode="decimal" step="any" value="${val == null ? '' : esc(val)}" ${faite ? 'disabled' : ''}><span>${esc(q.unite)}</span></div></fieldset>`;
    } else {
      champs = `<fieldset><legend>${esc(libelleConsigne(q))}</legend>${q.options.map((o, i) => {
        const coche = q.type === 'multiple' ? Array.isArray(val) && val.includes(i) : val === i;
        let classe = '';
        if (faite) {
          const bonne = q.type === 'multiple' ? q.bonne.includes(i) : q.bonne === i;
          classe = bonne ? 'juste' : coche ? 'faux' : '';
        }
        return `<label class="choix ${classe}"><input type="${q.type === 'multiple' ? 'checkbox' : 'radio'}" name="choix" value="${i}" ${coche ? 'checked' : ''} ${faite ? 'disabled' : ''}><span>${esc(o)}${faite && (coche || classe === 'juste') ? `<small class="retour-option">${esc(q.retours[i])}</small>` : ''}</span></label>`;
      }).join('')}</fieldset>`;
    }
    const ok = faite && M.correcte(q, val);
    const attendue = q.type === 'nombre' ? `${nb(q.bonne, 2)} ${q.unite}` : q.type === 'multiple' ? q.bonne.map(i => q.options[i]).join(' · ') : q.options[q.bonne];
    const feedback = faite ? `<section id="correction" class="feedback ${ok ? '' : q.critique ? 'critique' : 'erreur'}" tabindex="-1" aria-label="Correction"><h3>${ok ? 'Bien joué.' : q.critique ? 'Erreur critique : à reprendre.' : 'Pas tout à fait.'}</h3>${!ok ? `<p><strong>Réponse attendue :</strong> ${esc(attendue)}</p>` : ''}<p>${esc(q.explication)}</p></section>` : '';
    return `<section class="carte question"><p class="q-compteur">${esc(l.code)} · Question ${etat.question + 1} sur ${l.questions.length}${q.critique ? ' · <span class="drapeau">point critique</span>' : ''}</p><h2 tabindex="-1">${esc(q.titre)}</h2><p>${esc(q.texte)}</p>
      <form id="form-question" novalidate>${champs}<p id="erreur-question" class="validation" role="alert"></p>${!faite ? '<div class="actions"><button type="submit" class="bouton primaire">Vérifier</button></div>' : ''}</form>${feedback}
      ${faite ? `<div class="actions"><button class="bouton primaire" data-action="suivante">${etat.question === l.questions.length - 1 ? 'Voir mon bilan' : 'Question suivante'} <span aria-hidden="true">→</span></button>${!ok ? '<button class="bouton discret" data-action="reessayer-question">Réessayer</button>' : ''}</div>` : ''}
      <div class="actions"><button class="bouton discret" data-action="cours">Revoir le cours</button>${etat.question > 0 ? '<button class="bouton discret" data-action="precedente">Question précédente</button>' : ''}</div></section>`;
  }
  function ancrage(l) {
    const b = M.bilan(l, etat.reponses), note = etat.notes[l.id] || {};
    const idx = toutes.indexOf(l), suivante = toutes.slice(idx + 1).find(x => !M.bilan(x, etat.reponses).reussi) || toutes.find(x => !M.bilan(x, etat.reponses).reussi);
    const message = b.reussi ? 'Leçon validée. Un pas de plus.' : b.critiques ? `${b.critiques} erreur${b.critiques > 1 ? 's' : ''} critique${b.critiques > 1 ? 's' : ''} : la leçon n’est pas validée, même avec un bon score.` : `Il faut 80 % pour valider. Tu y es presque.`;
    return `<section class="carte"><p class="sur-titre">Ton bilan</p><div class="resume-score"><p class="score">${b.score} %<span> · ${b.bonnes} / ${b.total} bonnes réponses</span></p></div>
      <div class="feedback ${b.reussi ? '' : b.critiques ? 'critique' : 'erreur'}"><h3>${esc(message)}</h3><p>${b.reussi ? esc(l.memo) : 'Relis le cours, puis rejoue la leçon. Tes notes sont conservées.'}</p></div>
      <section class="cours-bloc"><h2>Ton mini-défi</h2><p>${esc(l.defi)}</p></section>
      <div class="champ"><label for="note-action">Mon action concrète</label><textarea id="note-action" data-note="action" maxlength="1500" placeholder="Ce que je fais pour de vrai…">${esc(note.action)}</textarea></div>
      <div class="deux-champs"><div class="champ"><label for="note-echeance">Pour quand ?</label><input id="note-echeance" data-note="echeance" type="text" maxlength="120" value="${esc(note.echeance)}" placeholder="Ex. jeudi soir"></div>
      <div class="champ"><span class="label-faux">Où j’en suis</span><label class="choix case"><input type="checkbox" data-note="fait" ${note.fait ? 'checked' : ''}><span>Défi réalisé</span></label></div></div>
      <p class="sauve-note" data-note-etat>Enregistré automatiquement dans ton carnet.</p>
      <div class="actions">${suivante ? `<button class="bouton primaire" data-view="${suivante.id}">Suivante : ${esc(suivante.code)} <span aria-hidden="true">→</span></button>` : '<button class="bouton primaire" data-view="carnet">Voir mon carnet</button>'}<button class="bouton discret" data-action="rejouer">Rejouer la leçon</button><button class="bouton discret" data-view="accueil">Faire une pause</button></div>
      ${liensSources(l.sources)}</section>`;
  }

  /* ---------- Simulateurs ---------- */
  function champNum(groupe, cle, libelle, val, min, max, step) {
    const id = `${groupe}-${cle}`;
    return `<div><label for="${id}">${libelle}</label><input id="${id}" data-sim="${groupe}" data-cle="${cle}" type="number" inputmode="decimal" min="${min}" max="${max}" step="${step}" value="${esc(val)}"></div>`;
  }
  function resultatRevenu() {
    const r = M.calculerRevenu(etat.revenu, R);
    if (!r) return '<p class="validation">Vérifie les valeurs saisies.</p>';
    const besoin = M.tjmPour(30000, etat.revenu, R);
    return `<div class="calcul-sortie"><div class="calcul-ligne"><span>Jours facturés par an</span><strong>${nb(r.jours)}</strong></div>
      <div class="calcul-ligne"><span>Chiffre d’affaires annuel</span><strong>${euro(r.ca)}</strong></div>
      <div class="calcul-ligne"><span>Cotisations sociales (${nb(r.taux)} %)</span><strong>− ${euro(r.cotisations)}</strong></div>
      <div class="calcul-ligne"><span>Formation professionnelle (${nb(r.tauxCfp)} %)</span><strong>− ${euro(r.cfp)}</strong></div>
      ${r.tauxVfl ? `<div class="calcul-ligne"><span>Versement libératoire (${nb(r.tauxVfl)} %)</span><strong>− ${euro(r.impot)}</strong></div>` : ''}
      <div class="calcul-ligne"><span>Frais professionnels</span><strong>− ${euro(r.frais)}</strong></div>
      <div class="calcul-ligne total"><span>Reste annuel${r.tauxVfl ? ' après impôt' : ' avant impôt'}</span><strong>${euro(r.net)}</strong></div>
      <div class="calcul-ligne"><span>Soit par mois</span><strong>${euro(r.netMensuel)}</strong></div></div>
      ${r.alertes.map(a => `<p class="alerte-sim">${esc(a)}</p>`).join('')}
      <p class="petit">Pour garder 30 000 € par an avec ces hypothèses, il faudrait un tarif d’environ <strong>${besoin ? euro(besoin) : '—'}</strong> par jour.</p>
      <p class="minuscule">${r.tauxVfl ? '' : 'Sans versement libératoire, l’impôt sur le revenu reste à payer : il dépend de ton foyer fiscal (abattement ' + (etat.revenu.regime === 'bic' ? R.abattementBIC : R.abattementBNC) + ' %). '}Repères ${R.annee} vérifiés le ${esc(S.verifie)} : vérifier le taux en vigueur sur la source officielle liée. CFE non incluse.</p>`;
  }
  function resultatTreso() {
    const t = M.calculerTreso(etat.treso);
    if (!t) return '<p class="validation">Vérifie les valeurs saisies.</p>';
    return `<table class="table-cash"><caption>Disponible en fin de mois, après provision et dépenses</caption><thead><tr><th scope="col">Mois</th><th scope="col">Encaissé</th><th scope="col">Mis de côté</th><th scope="col">Disponible</th></tr></thead><tbody>${t.mois.map(m => `<tr ${m.dispo < 0 ? 'class="cash-negatif"' : ''}><th scope="row">M${m.mois}</th><td>${euro(m.ca)}</td><td>${euro(m.provision)}</td><td>${m.dispo < 0 ? '<span class="sr-only">Déficit : </span>' : ''}${euro(m.dispo)}</td></tr>`).join('')}</tbody></table>
      <div class="feedback ${t.alerte ? 'erreur' : ''}"><h3>${t.alerte ? `Découvert dès le mois ${t.alerte}.` : 'Pas de découvert sur 6 mois.'}</h3><p>Réserve pour l’Urssaf et les impôts : <strong>${euro(t.reserve)}</strong>. Moyenne encaissée : ${euro(t.moyenne)} par mois. ${t.coussin != null ? `Coussin final : ${nb(t.coussin)} mois de dépenses (objectif : 3).` : ''}</p></div>
      <p class="minuscule">La provision n’est pas de l’argent disponible : c’est ce que tu dois. Prévois aussi la CFE en fin d’année.</p>`;
  }
  function resultatPipeline() {
    const p = M.calculerPipeline(etat.pipeline);
    if (!p) return '<p class="validation">Vérifie les valeurs saisies.</p>';
    return `<div class="entonnoir"><div><strong>${nb(p.contactsMois, 0)}</strong><span>contacts / mois</span></div><div><strong>${nb(p.reponses)}</strong><span>réponses</span></div><div><strong>${nb(p.rdv)}</strong><span>appels</span></div><div><strong>${nb(p.signatures)}</strong><span>signatures</span></div></div>
      <div class="calcul-sortie"><div class="calcul-ligne total"><span>Chiffre d’affaires signé par mois</span><strong>${euro(p.ca)}</strong></div>
      <div class="calcul-ligne"><span>Contacts par semaine pour atteindre ${euro(etat.pipeline.objectif)} / mois</span><strong>${p.contactsNecessaires == null ? '—' : nb(p.contactsNecessaires, 0)}</strong></div></div>
      <p class="minuscule">Taux indicatifs : mesure les tiens dans ton tableau de prospection après 30 contacts.</p>`;
  }
  function simulateurs() {
    const r = etat.revenu, t = etat.treso, p = etat.pipeline;
    return `<header class="en-tete"><p class="sur-titre">Outils · Piloter mon business</p><h1 tabindex="-1">Simulateurs</h1><p class="intro">Trois calculs pour décider avec des chiffres. Les taux viennent des sources officielles vérifiées le ${esc(S.verifie)} ; ce sont des repères pédagogiques, pas un conseil fiscal.</p></header>
      <div class="pile">
      <details class="calculateur" open><summary>1. Du tarif journalier au revenu</summary><div class="calcul-corps">
        <div class="calcul-champs">${champNum('revenu', 'tjm', 'Tarif journalier (€)', r.tjm, 0, 5000, 10)}${champNum('revenu', 'jours', 'Jours facturés / semaine', r.jours, 0, 7, 0.5)}${champNum('revenu', 'semaines', 'Semaines travaillées / an', r.semaines, 0, 52, 1)}${champNum('revenu', 'frais', 'Frais annuels (€)', r.frais, 0, 1000000, 50)}
        <div><label for="revenu-regime">Catégorie</label><select id="revenu-regime" data-sim="revenu" data-cle="regime"><option value="bnc" ${r.regime === 'bnc' ? 'selected' : ''}>Libéral BNC (${nb(R.tauxBNC)} %)</option><option value="bic" ${r.regime === 'bic' ? 'selected' : ''}>Services BIC (${nb(R.tauxBIC)} %)</option></select></div>
        <div class="options-sim"><label class="choix case"><input type="checkbox" data-sim="revenu" data-cle="vfl" ${r.vfl ? 'checked' : ''}><span>Versement libératoire</span></label><label class="choix case"><input type="checkbox" data-sim="revenu" data-cle="acre" ${r.acre ? 'checked' : ''}><span>Acre (débuts d’activité)</span></label></div></div>
        <div id="resultat-revenu" aria-live="polite">${resultatRevenu()}</div>${liensSources(['microSocial', 'cfp', 'vfl', 'acreActu', 'seuilsMicro', 'tvaFranchise'])}</div></details>
      <details class="calculateur"><summary>2. Trésorerie sur 6 mois</summary><div class="calcul-corps">
        <div class="calcul-champs">${champNum('treso', 'solde', 'Solde de départ (€)', t.solde, -1000000, 1000000, 50)}${champNum('treso', 'provision', 'Part mise de côté (%)', t.provision, 0, 100, 1)}${champNum('treso', 'depenses', 'Dépenses perso + pro / mois (€)', t.depenses, 0, 1000000, 50)}</div>
        <fieldset class="mois-champs"><legend>Encaissements prévus</legend>${t.ca.map((v, i) => `<div><label for="treso-ca-${i}">Mois ${i + 1} (€)</label><input id="treso-ca-${i}" data-sim="treso" data-cle="ca" data-i="${i}" type="number" inputmode="decimal" min="0" max="1000000" step="50" value="${esc(v)}"></div>`).join('')}</fieldset>
        <div id="resultat-treso" aria-live="polite">${resultatTreso()}</div><p class="minuscule">Astuce : en BNC, ${nb(R.tauxBNC + R.cfpLiberal)} % couvrent les cotisations et la formation ; ajoute ${nb(R.vflBNC)} % avec le versement libératoire, ou une marge pour l’impôt sinon.</p></div></details>
      <details class="calculateur"><summary>3. Pipeline de prospection</summary><div class="calcul-corps">
        <div class="calcul-champs">${champNum('pipeline', 'contacts', 'Contacts / semaine', p.contacts, 0, 1000, 1)}${champNum('pipeline', 'reponse', 'Taux de réponse (%)', p.reponse, 0, 100, 1)}${champNum('pipeline', 'rdv', 'Réponses → appel (%)', p.rdv, 0, 100, 1)}${champNum('pipeline', 'signature', 'Appels → signature (%)', p.signature, 0, 100, 1)}${champNum('pipeline', 'panier', 'Contrat moyen / mois (€)', p.panier, 0, 1000000, 50)}${champNum('pipeline', 'objectif', 'Objectif mensuel (€)', p.objectif, 0, 1000000, 100)}</div>
        <div id="resultat-pipeline" aria-live="polite">${resultatPipeline()}</div></div></details>
      </div>`;
  }

  /* ---------- Carnet et sources ---------- */
  function carnet() {
    const entrees = toutes.filter(l => etat.notes[l.id] && (etat.notes[l.id].action || etat.notes[l.id].echeance));
    const faits = entrees.filter(l => etat.notes[l.id].fait).length;
    return `<header class="en-tete"><p class="sur-titre">Outils</p><h1 tabindex="-1">Mon carnet</h1><p class="intro">Tes actions concrètes, au même endroit. ${entrees.length ? `${faits} sur ${entrees.length} réalisées.` : 'Il se remplit à la fin de chaque leçon.'}</p></header>
      <div class="pile">${entrees.length ? entrees.map(l => {
        const n = etat.notes[l.id];
        return `<article class="carte note-carnet ${n.fait ? 'faite' : ''}"><p class="sur-titre">${esc(l.code)} · ${esc(l.titre)}</p><p class="note-texte">${esc(n.action || '—')}</p><p class="petit">${n.echeance ? 'Pour : ' + esc(n.echeance) + ' · ' : ''}${n.fait ? 'Réalisé' : 'À faire'}</p><div class="actions"><button class="bouton discret" data-view="${l.id}" data-ancrage="1">Modifier</button></div></article>`;
      }).join('') : '<section class="carte"><p>Aucune action notée pour l’instant.</p><div class="actions"><button class="bouton primaire" data-view="accueil">Retour à l’accueil</button></div></section>'}
      <section class="carte"><h2>Garder une copie</h2><p class="petit">Ta progression vit dans ce navigateur. Exporte-la en fichier pour la garder ou changer d’appareil.</p><div class="actions"><button class="bouton" data-action="sauvegarde">Sauvegarder ou restaurer</button><button class="bouton discret" data-action="imprimer">Imprimer le carnet</button></div></section></div>`;
  }
  function sources() {
    const lignes = [
      ['Cotisations micro, libéral BNC', `${nb(R.tauxBNC)} %`, 'microSocial'], ['Cotisations micro, services BIC', `${nb(R.tauxBIC)} %`, 'microSocial'],
      ['Acre, BNC (débuts depuis le 1er juillet 2026)', `${nb(R.tauxAcreBNC)} %`, 'acreActu'], ['Formation professionnelle, libéral', `${nb(R.cfpLiberal)} %`, 'cfp'],
      ['Versement libératoire BNC / BIC services', `${nb(R.vflBNC)} % / ${nb(R.vflBIC)} %`, 'fiscMicro'], ['Plafond RFR par part pour le versement libératoire 2026', euro(R.rfrVfl), 'vfl'],
      ['Abattement micro-BNC / BIC services', `${R.abattementBNC} % / ${R.abattementBIC} %`, 'fiscMicro'], ['Plafond micro services 2026-2028', euro(R.plafondServices), 'seuilsMicro'],
      ['Franchise TVA services (seuil / seuil majoré)', `${euro(R.tvaBase)} / ${euro(R.tvaMajore)}`, 'tvaFranchise'], ['Indemnité forfaitaire de recouvrement', euro(R.indemniteRetard), 'delais'],
      ['Facture électronique : réception / émission micro', `${R.efactureReception} / ${R.efactureEmission}`, 'efacture'], ['Contrat écrit marque-influenceur', `> ${euro(R.contratInfluence)} HT`, 'influenceContrat']
    ];
    return `<header class="en-tete"><p class="sur-titre">Outils</p><h1 tabindex="-1">Sources officielles</h1><p class="intro">Chiffres vérifiés le ${esc(S.verifie)}. Chaque chiffre est un repère pédagogique : vérifier le taux en vigueur sur la source officielle liée avant de l’appliquer.</p></header>
      <section class="carte"><table class="table-cash table-sources"><caption>Repères ${R.annee}</caption><thead><tr><th scope="col">Repère</th><th scope="col">Valeur</th><th scope="col">Source</th></tr></thead><tbody>${lignes.map(([n, v, s]) => `<tr><th scope="row">${esc(n)}</th><td>${esc(v)}</td><td><a href="${esc(S.sources[s].url)}" target="_blank" rel="noopener noreferrer">Ouvrir <span class="sr-only">${esc(S.sources[s].nom)} (nouvel onglet)</span></a></td></tr>`).join('')}</tbody></table></section>
      <section class="carte"><h2>Toutes les sources</h2><ul class="liste-sources">${Object.values(S.sources).map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.nom)} <span class="sr-only">(nouvel onglet)</span></a></li>`).join('')}</ul></section>`;
  }

  /* ---------- Rendu ---------- */
  function contenuVue() {
    const l = getLecon();
    if (l) return lecon(l);
    if (etat.vue === 'simulateurs') return simulateurs();
    if (etat.vue === 'carnet') return carnet();
    if (etat.vue === 'sources') return sources();
    return accueil();
  }
  function fil() {
    const l = getLecon();
    if (l) return `${esc(parcoursDe(l).nom)}<span>${esc(l.code)}</span>`;
    return { simulateurs: 'Outils<span>Simulateurs</span>', carnet: 'Outils<span>Mon carnet</span>', sources: 'Outils<span>Sources</span>' }[etat.vue] || 'Module CM<span>Accueil</span>';
  }
  function render(focusSel) {
    document.body.classList.toggle('focus', etat.focus);
    $('#application').innerHTML = `<div class="coquille"><aside class="rail" aria-label="Navigation du module"><div><p class="marque">JTIpilot<span aria-hidden="true"></span></p><p class="sous-marque">Community manager freelance</p></div><nav aria-label="Leçons">${menu()}</nav><div class="rail-bas"><strong>Repères ${R.annee}</strong>Vérifiés le ${esc(S.verifie)} sur les sources officielles.</div></aside>
      <div class="zone"><div class="barre"><p class="fil">${fil()}</p><div class="outils"><button class="bouton" data-action="focus" aria-pressed="${etat.focus}">Mode focus</button><button class="bouton" data-action="sauvegarde">Sauvegarder</button></div></div>
      <p class="ruban"><span class="point" aria-hidden="true"></span>Ta progression reste dans ce navigateur. Aucune donnée n’est envoyée.</p>
      <p id="stockage-avertissement" class="stockage-alerte" ${depot.persistant ? 'hidden' : ''}>${esc(depot.avertissement)}</p>
      <details class="mobile-nav"><summary>Toutes les leçons</summary><nav aria-label="Leçons (mobile)">${menu()}</nav></details>
      <main id="principal">${contenuVue()}<footer class="pied"><span>JTIpilot · Module ${esc(C.titre)} · contenu ${esc(C.version)} revu le ${esc(C.revue)}. Les chiffres légaux et fiscaux sont des repères pédagogiques : vérifier sur la source officielle liée.</span><button class="lien-action" data-view="sources">Sources</button></footer></main></div></div>`;
    sauver();
    if (focusSel) { const el = $(focusSel); if (el) el.focus({ preventScroll: false }); }
  }
  function ouvrir(view, ancrer) {
    const l = toutes.find(x => x.id === view);
    etat.vue = view; etat.question = 0; drafts = {};
    if (l) {
      etat.derniere = l.id;
      const b = M.bilan(l, etat.reponses);
      etat.etape = ancrer && b.fini ? 'ancrage' : b.fini ? 'ancrage' : 'cours';
    }
    render('h1'); window.scrollTo(0, 0);
  }

  /* ---------- Événements ---------- */
  document.addEventListener('submit', e => {
    if (e.target.id !== 'form-question') return;
    e.preventDefault();
    const q = qActuelle(), err = $('#erreur-question');
    let v;
    if (q.type === 'nombre') { const raw = $('#nombre-reponse').value.replace(',', '.'); v = raw === '' ? NaN : Number(raw); }
    else { const vals = [...document.querySelectorAll('input[name="choix"]:checked')].map(x => Number(x.value)); v = q.type === 'multiple' ? vals : vals[0]; }
    if (!M.valeurValide(q, v)) { err.textContent = q.type === 'nombre' ? 'Entre un nombre.' : 'Choisis une réponse.'; return; }
    if (q.type === 'multiple' && v.length !== q.bonne.length) { err.textContent = `Choisis exactement ${q.bonne.length} réponses.`; return; }
    etat.reponses[q.id] = v; delete drafts[q.id];
    render('#correction');
    annoncer(M.correcte(q, v) ? 'Bonne réponse.' : 'Réponse incorrecte, la correction est affichée.');
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.matches('[data-note]') && t.type !== 'checkbox') {
      const l = getLecon(); if (!l) return;
      etat.notes[l.id] = Object.assign({ action: '', echeance: '', fait: false }, etat.notes[l.id], { [t.dataset.note]: t.value.slice(0, t.dataset.note === 'action' ? 1500 : 120) });
      sauver(); const n = $('[data-note-etat]'); if (n) n.textContent = 'Enregistré.';
    }
    if (t.matches('input[data-sim]')) majSim(t);
    if (t.name === 'nombre') drafts[qActuelle().id] = t.value;
  });
  function majSim(t) {
    const g = t.dataset.sim, k = t.dataset.cle;
    if (t.type === 'checkbox') etat[g][k] = t.checked;
    else if (t.tagName === 'SELECT') etat[g][k] = t.value;
    else {
      if (t.value === '' || !t.validity.valid) return;
      const n = Number(t.value);
      if (k === 'ca') { const ca = [...etat.treso.ca]; ca[Number(t.dataset.i)] = n; etat.treso.ca = ca; } else etat[g][k] = n;
    }
    const cible = { revenu: ['#resultat-revenu', resultatRevenu], treso: ['#resultat-treso', resultatTreso], pipeline: ['#resultat-pipeline', resultatPipeline] }[g];
    $(cible[0]).innerHTML = cible[1](); sauver();
  }
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'choix') { const q = qActuelle(); const vals = [...document.querySelectorAll('input[name="choix"]:checked')].map(x => Number(x.value)); drafts[q.id] = q.type === 'multiple' ? vals : vals[0]; }
    if (t.matches('[data-sim]') && (t.type === 'checkbox' || t.tagName === 'SELECT')) majSim(t);
    if (t.matches('[data-note="fait"]')) { const l = getLecon(); etat.notes[l.id] = Object.assign({ action: '', echeance: '', fait: false }, etat.notes[l.id], { fait: t.checked }); sauver(); annoncer(t.checked ? 'Défi marqué comme réalisé.' : 'Défi marqué à faire.'); }
    if (t.id === 'fichier-progression') importerFichier(t.files[0]);
  });
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-view],[data-action]'); if (!b) return;
    if (b.dataset.view) { const m = b.closest('.mobile-nav'); if (m) m.open = false; ouvrir(b.dataset.view, b.dataset.ancrage === '1'); return; }
    const a = b.dataset.action, l = getLecon();
    if (a === 'focus') { etat.focus = !etat.focus; render('.barre [data-action="focus"]'); annoncer(etat.focus ? 'Mode focus activé.' : 'Mode focus désactivé.'); return; }
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
      etat = M.neuf(); drafts = {}; render('h1'); annoncer('Le module a été réinitialisé.'); return;
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
      etat = prochain; drafts = {}; render('h1'); annoncer('Progression restaurée.');
    } catch (err) { msg.textContent = err.message || 'Import impossible. Ta progression est conservée.'; }
    finally { $('#fichier-progression').value = ''; }
  }
  render();
}());
