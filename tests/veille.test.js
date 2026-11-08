// Tests de la collecte de veille : node tests/veille.test.js
'use strict';
const assert = require('assert');
const { parseFeed, assembler, texte } = require('../scripts/veille.js');
const NOW = '2026-11-04T12:00:00.000Z';
const rss = `<?xml version="1.0"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>X</title>
<item><title><![CDATA[Twitch &amp; <b>clips</b> : la nouveauté]]></title><link>https://exemple.fr/a</link><pubDate>Wed, 04 Nov 2026 10:00:09 +0000</pubDate><description>&lt;p&gt;Résumé &amp;amp; détails&lt;/p&gt;</description></item>
<item><title>Sans lien</title><pubDate>Wed, 04 Nov 2026 09:00:00 +0000</pubDate></item>
<item><title>Lien dangereux</title><link>javascript:alert(1)</link><pubDate>Wed, 04 Nov 2026 09:00:00 +0000</pubDate></item>
<item><title>Google</title><link>https://news.google.com/rss/articles/abc</link><pubDate>Tue, 03 Nov 2026 08:00:00 GMT</pubDate><source url="https://x.fr">Le Média</source></item>
<item><title>Ancien</title><link>https://exemple.fr/vieux</link><pubDate>Mon, 01 Jan 2024 08:00:00 GMT</pubDate></item>
</channel></rss>`;
let items = parseFeed(rss, NOW);
assert.strictEqual(items.length, 3, 'liens non http(s) et éléments sans lien écartés');
assert.strictEqual(items[0].titre, 'Twitch & clips : la nouveauté'); assert.strictEqual(items[0].resume, 'Résumé & détails');
assert.strictEqual(items[1].editeur, 'Le Média'); assert.strictEqual(items[0].date, '2026-11-04T10:00:09.000Z');
const atom = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Post Reddit</title><link rel="replies" href="https://reddit.com/x/comments"/><link href="https://www.reddit.com/r/Twitch/comments/1/" /><updated>2026-11-04T11:00:00+00:00</updated><content type="html">&lt;div&gt;Texte&lt;/div&gt;</content></entry></feed>`;
items = parseFeed(atom, NOW); assert.strictEqual(items.length, 1); assert.strictEqual(items[0].lien, 'https://www.reddit.com/r/Twitch/comments/1/'); assert.strictEqual(items[0].resume, 'Texte');
const atom2 = `<feed><entry><title>Alt</title><link rel="alternate" type="text/html" href="https://exemple.fr/alt?a=1&amp;b=2"/><link rel="self" href="https://exemple.fr/self"/><published>2026-11-04T11:00:00Z</published></entry></feed>`;
assert.strictEqual(parseFeed(atom2, NOW)[0].lien, 'https://exemple.fr/alt?a=1&b=2');
assert.throws(() => parseFeed('<html><body>Bot détecté</body></html>', NOW), /pas un flux/);
assert.throws(() => parseFeed(null, NOW));
assert.strictEqual(parseFeed('<rss><channel><item><title>Sans date</title><link>https://e.fr/s</link></item></channel></rss>', NOW)[0].date, NOW);
assert.strictEqual(texte('a'.repeat(300), 50).length, 50); assert.strictEqual(texte('x &#128512; y'), 'x 😀 y'); assert.strictEqual(texte('&#99999999999;'), '');
const sA = { nom: 'A', categorie: 'actu' }, sB = { nom: 'B', categorie: 'alerte' };
const tout = assembler([{ source: sA, items: parseFeed(rss, NOW) }, { source: sB, items: [{ titre: 'Doublon', lien: 'https://exemple.fr/a', date: NOW, resume: '', editeur: '' }, { titre: 'Récent', lien: 'https://e.fr/r', date: '2026-11-04T11:30:00.000Z', resume: '', editeur: '' }] }], NOW);
assert.deepStrictEqual(tout.map(x => x.titre), ['Récent', 'Twitch & clips : la nouveauté', 'Google'], 'récent d’abord, doublon et ancien retirés');
assert.strictEqual(tout[0].categorie, 'alerte'); assert.strictEqual(tout[1].source, 'A');
const beaucoup = assembler([{ source: sA, items: Array.from({ length: 40 }, (_, i) => ({ titre: 't' + i, lien: 'https://e.fr/' + i, date: NOW, resume: '', editeur: '' })) }], NOW);
assert.strictEqual(beaucoup.length, 20, '20 par source maximum');
console.log('OK veille');
/* Créateurs suivis et chaînes en direct (v8) */
{
  const { sourcesCreateurs, streamsVersItems } = require('../scripts/veille.js');
  const src = sourcesCreateurs({ createurs_suivis: ['A', 'B', 'C', 'D', 'E', 'Little Big Whale'] });
  assert.strictEqual(src.length, 2, 'lots de 4 noms'); assert.ok(src.every(s => s.categorie === 'decouverte' && /^https:\/\/news\.google\.com\/rss\/search\?q=/.test(s.url)));
  assert.ok(decodeURIComponent(src[1].url.replace(/\+/g, ' ')).includes('"Little Big Whale"')); assert.deepStrictEqual(sourcesCreateurs({}), []);
  const flux = [{ user_login: 'Petit', user_name: 'Petit', viewer_count: 120, game_name: 'Minecraft', title: 'Je découvre' }, { user_login: 'gros', user_name: 'Gros', viewer_count: 90000, title: 'x' },
    { user_login: 'minus', user_name: 'Minus', viewer_count: 3, title: 'x' }, { user_login: 'bad link!', user_name: 'Bad', viewer_count: 100, title: 'x' }, { user_login: 'moyen', user_name: 'Moyen', viewer_count: 800, title: 'Live' }];
  const its = streamsVersItems(flux, [{ lien: 'https://www.twitch.tv/petit', date: '2026-11-01T00:00:00.000Z' }], NOW);
  assert.strictEqual(its.length, 2, 'ni trop gros, ni trop petit, ni identifiant douteux');
  assert.strictEqual(its[0].lien, 'https://www.twitch.tv/moyen'); assert.strictEqual(its[1].date, '2026-11-01T00:00:00.000Z', 'date de première apparition conservée');
  assert.strictEqual(its[1].titre, 'Petit : 120 spectateurs en direct sur Minecraft');
  const tout = assembler([{ source: { nom: 'T', categorie: 'decouverte', max: 40 }, items: Array.from({ length: 30 }, (_, i) => ({ titre: 't' + i, lien: 'https://x.fr/' + i, date: NOW, resume: '', editeur: '' })) }], NOW);
  assert.strictEqual(tout.length, 30, 'plafond par source modulable');
  console.log('OK veille créateurs suivis');
}
