#!/usr/bin/env node
/* Collecte la veille : lit veille-sources.json, récupère les flux RSS/Atom et écrit data/veille.json.
   Lancé toutes les heures par .github/workflows/veille.yml. Aucune dépendance (Node 20 ou plus). */
'use strict';
const fs = require('fs'), path = require('path');
const RACINE = path.join(__dirname, '..');
const MAX_PAR_SOURCE = 15, JOURS = 30, MAX_TOTAL = 250, MAX_OCTETS = 3e6;
const ENTITES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', hellip: '…', laquo: '«', raquo: '»' };

function decoder(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : '';
    }
    return Object.prototype.hasOwnProperty.call(ENTITES, e.toLowerCase()) ? ENTITES[e.toLowerCase()] : m;
  });
}
/* Texte brut : retire CDATA, balises et entités, compacte les espaces. */
function texte(s, max) {
  if (!s) return '';
  let t = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  t = decoder(t).replace(/<[^>]*>/g, ' ');
  t = decoder(t).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  return max && t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}
function balise(xml, nom) {
  const m = new RegExp('<' + nom + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + nom + '>', 'i').exec(xml);
  return m ? m[1] : '';
}
function lien(bloc) {
  const alt = /<link\b[^>]*\brel=["']alternate["'][^>]*\bhref=["']([^"']+)["']/i.exec(bloc) || /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']alternate["']/i.exec(bloc);
  if (alt) return decoder(alt[1]).trim();
  const atomSimple = /<link\b(?![^>]*\brel=["'](?:self|replies|enclosure)["'])[^>]*\bhref=["']([^"']+)["'][^>]*\/?>/i.exec(bloc);
  const rss = texte(balise(bloc, 'link'));
  if (rss) return rss;
  if (atomSimple) return decoder(atomSimple[1]).trim();
  return texte(balise(bloc, 'guid'));
}
const https = u => /^https?:\/\/[^\s<>"']+$/i.test(u) ? u.slice(0, 600) : '';
/* Transforme un flux RSS 2.0 ou Atom en liste d'éléments {titre, lien, date, resume, editeur}. */
function parseFeed(xml, maintenantIso) {
  if (typeof xml !== 'string' || !/<(rss|feed|rdf:RDF)\b/i.test(xml)) throw new Error('Ce n’est pas un flux RSS ou Atom.');
  const blocs = xml.match(/<(item|entry)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi) || [];
  const items = [];
  for (const b of blocs) {
    const titre = texte(balise(b, 'title'), 200), url = https(lien(b));
    if (!titre || !url) continue;
    const brut = texte(balise(b, 'pubDate') || balise(b, 'published') || balise(b, 'updated') || balise(b, 'dc:date'));
    const t = Date.parse(brut);
    items.push({ titre, lien: url, date: Number.isFinite(t) ? new Date(t).toISOString() : maintenantIso,
      resume: texte(balise(b, 'description') || balise(b, 'summary') || balise(b, 'content:encoded') || balise(b, 'content'), 240), editeur: texte(balise(b, 'source'), 80) });
  }
  return items;
}
/* Assemble les éléments de toutes les sources : doublons retirés, récents seulement, du plus récent au plus ancien. */
function assembler(parSource, maintenantIso) {
  const limite = Date.parse(maintenantIso) - JOURS * 864e5, vus = new Set(), tout = [];
  for (const { source, items } of parSource) {
    for (const it of items.slice().sort((a, z) => z.date.localeCompare(a.date)).slice(0, MAX_PAR_SOURCE)) {
      if (Date.parse(it.date) < limite || vus.has(it.lien)) continue;
      vus.add(it.lien);
      tout.push({ titre: it.titre, lien: it.lien, date: it.date, resume: it.resume, source: source.nom, categorie: source.categorie, editeur: it.editeur || '' });
    }
  }
  return tout.sort((a, z) => z.date.localeCompare(a.date)).slice(0, MAX_TOTAL);
}
async function telecharger(url) {
  const rep = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JTIpilotVeille/1.0; +https://github.com/zesite07-boop/Giky-CM-by-Laeti)', Accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5' } });
  if (!rep.ok) throw new Error('HTTP ' + rep.status);
  const buf = Buffer.from(await rep.arrayBuffer());
  if (buf.length > MAX_OCTETS) throw new Error('Flux trop volumineux.');
  return buf.toString('utf8');
}
async function main() {
  const maintenant = new Date().toISOString();
  const config = JSON.parse(fs.readFileSync(path.join(RACINE, 'veille-sources.json'), 'utf8'));
  const fichier = path.join(RACINE, 'data', 'veille.json');
  let ancien = { maj: null, sources: [], items: [] };
  try { ancien = JSON.parse(fs.readFileSync(fichier, 'utf8')); } catch (_) { /* premier passage */ }
  const parSource = [], statuts = [];
  for (const source of config.sources) {
    if (!/^https:\/\//.test(source.url)) { statuts.push({ id: source.id, nom: source.nom, statut: 'erreur', nb: 0, message: 'Adresse non https' }); continue; }
    try {
      const items = parseFeed(await telecharger(source.url), maintenant);
      parSource.push({ source, items });
      statuts.push({ id: source.id, nom: source.nom, statut: 'ok', nb: items.length, message: '' });
    } catch (e) {
      /* Panne passagère : on garde les anciens éléments de cette source plutôt que de la vider. */
      const gardes = (ancien.items || []).filter(i => i.source === source.nom).map(i => ({ titre: i.titre, lien: i.lien, date: i.date, resume: i.resume, editeur: i.editeur }));
      if (gardes.length) parSource.push({ source, items: gardes });
      statuts.push({ id: source.id, nom: source.nom, statut: 'erreur', nb: gardes.length, message: String(e.message || e).slice(0, 120) });
    }
  }
  const items = assembler(parSource, maintenant);
  const resultat = { maj: maintenant, sources: statuts, items };
  const memeContenu = JSON.stringify({ s: ancien.sources, i: ancien.items }) === JSON.stringify({ s: statuts, i: items });
  if (memeContenu) { console.log('Aucun changement.'); } else { fs.writeFileSync(fichier, JSON.stringify(resultat, null, 1) + '\n'); console.log(`Veille mise à jour : ${items.length} éléments.`); }
  for (const s of statuts) console.log(`${s.statut === 'ok' ? 'OK    ' : 'ERREUR'} ${s.nom} (${s.nb})${s.message ? ' : ' + s.message : ''}`);
  if (!statuts.some(s => s.statut === 'ok')) { console.error('Aucune source n’a répondu.'); process.exitCode = 1; }
}
module.exports = { parseFeed, assembler, texte };
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
