const fs = require('fs');
const path = 'C:\\Users\\isaia\\Downloads\\BRANDS\\Lutas de Ilusão\\SiteLDI\\docs\\Marketing\\pr_outreach_illusion_fight_int_email.csv';

const text = fs.readFileSync(path, 'utf8');
const rawLines = text.split('\n').filter(l => l.trim());
const NEW_HEADER = 'Nome,Handle,Plataforma,Seguidores,Contato,Nicho,Angulo,Categoria,Pais';

const COUNTRY_MAP = {
  'us': 'US', 'usa': 'US', 'united states': 'US',
  'uk': 'UK', 'united kingdom': 'UK', 'gb': 'UK', 'great britain': 'UK',
  'spain': 'Spain', 'espanha': 'Spain', 'españa': 'Spain', 'espana': 'Spain', 'es': 'Spain',
  'argentina': 'Argentina',
  'mexico': 'Mexico', 'méxico': 'Mexico', 'mx': 'Mexico',
  'colombia': 'Colombia', 'co': 'Colombia',
  'chile': 'Chile', 'cl': 'Chile',
  'peru': 'Peru', 'pe': 'Peru',
  'venezuela': 'Venezuela', 've': 'Venezuela',
  'ecuador': 'Ecuador',
  'guatemala': 'Guatemala',
  'cuba': 'Cuba',
  'bolivia': 'Bolivia',
  'dominican republic': 'Dominican Republic',
  'honduras': 'Honduras',
  'paraguay': 'Paraguay',
  'el salvador': 'El Salvador',
  'nicaragua': 'Nicaragua',
  'costa rica': 'Costa Rica',
  'panama': 'Panama',
  'uruguay': 'Uruguay',
  'puerto rico': 'Puerto Rico',
  'equatorial guinea': 'Equatorial Guinea',
  'brazil': 'Brazil', 'brasil': 'Brazil', 'br': 'Brazil',
  'canada': 'Canada',
  'japan': 'Japan', 'jp': 'Japan',
  'china': 'China', 'cn': 'China',
  'south korea': 'South Korea', 'korea': 'South Korea', 'kr': 'South Korea',
  'taiwan': 'Taiwan', 'tw': 'Taiwan',
  'hong kong': 'Hong Kong', 'hk': 'Hong Kong',
  'thailand': 'Thailand', 'th': 'Thailand',
  'vietnam': 'Vietnam', 'vn': 'Vietnam',
  'indonesia': 'Indonesia', 'id': 'Indonesia',
  'malaysia': 'Malaysia', 'my': 'Malaysia',
  'india': 'India', 'in': 'India',
  'philippines': 'Philippines', 'ph': 'Philippines',
  'australia': 'Australia', 'au': 'Australia',
  'international': 'International',
  'latin america': 'Latin America', 'latin america spanish-language': 'Latin America',
  'spanish-language market': 'Spanish-language market'
};

function normalizeCountry(val) {
  if (!val) return '';
  const t = val.trim();
  if (!t || t === '-') return '';
  return COUNTRY_MAP[t.toLowerCase()] || t;
}

function splitLine(line) {
  const r = []; let cur = '', q = false;
  for (const ch of line) {
    if (ch === '"') { q = !q; continue; }
    if (ch === ',' && !q) { r.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  r.push(cur.trim());
  return r;
}

function quoteField(f) {
  if (!f) return '';
  const s = String(f);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

const PITCH_STARTERS = ['pitch', 'free ', 'send ', 'lead with', 'offer ', 'submit', 'position', 'frame ',
  'focus on', 'present ', 'propose ', 'enviar', 'presentar', 'specialized', 'alternative',
  'newsletter', 'blog of', 'blog with', 'geek', 'portal', 'community', 'magazine',
  'angle of', 'brief pitch', 'creative process', 'close pitch', 'direct editorial',
  'focus webtoon', 'shonen angle', 'pop/geek', 'personalized', 'regional pitch',
  'propose episode', 'pitch world', 'send angle', 'offer interview', 'review pitch',
  'request review', 'propose note', 'send concise', 'propose mention',
  'latin american', 'send press', 'coverage', 'pitch webtoon-first',
  'anime/manga angle', 'general pitch', 'marketing partnership', 'pitch cercano',
  'vender el mundo', 'presentar', 'enviar gancho', 'enviar nota', 'ofrecer',
  'proponer', 'solicitar', 'mandar', 'usar el angulo', 'pitch regional',
  'free resource', 'free webtoon', 'free tactical', 'free turn-based',
  'free action', 'free strategy', 'free hex-grid', 'free SFF', 'free fantasy',
  'free indie', 'free game', 'free universe', 'free access',
  'press release', 'free transmedia', 'coverage of', 'cover the',
  'pitch:', 'focus on', 'story of', 'pitch of', 'pitch for',
  'inspiration for', 'resource for', 'proposal for', 'angle for',
  'pitch centered', 'pitch Illusion', 'faction', 'tactical', 'angle webtoon',
  'recommendation for', 'direct fit', 'pitch brief',
  'send to', 'submit a', 'write a', 'pitch a', 'offer an',
  'coverage for', 'coverage.', 'send a', 'lead with the',
  'pitch de', 'nota de', 'press'];

function parseRow(fields) {
  const n = fields.length;
  if (n === 0) return null;
  const first5 = fields.slice(0, 5);
  const last2 = fields.slice(-2);
  const middle = fields.slice(5, -2);
  let categoria = last2[0] || '';
  let paisRaw = last2[1] || '';
  const validCategories = ['PRESS', 'GAMES', 'BOOKS', 'WEBTOON/MANGA', 'GAME DESIGN PODCAST', 'TTRPG',
    'INDIE COMICS', 'SFF BOOKS', 'INDIE GAMES NEWSLETTER', 'PRIORIDADE MÁXIMA', 'WEBTOON/MANGA'];
  const catNorm = categoria.trim().toUpperCase();
  if (!validCategories.includes(catNorm) && paisRaw && validCategories.includes(paisRaw.trim().toUpperCase())) {
    const temp = categoria; categoria = paisRaw; paisRaw = temp;
  }
  const pais = normalizeCountry(paisRaw);
  let nicho = '', angulo = '';
  if (middle.length === 0) { nicho = ''; angulo = ''; }
  else if (middle.length === 1) { nicho = middle[0]; angulo = ''; }
  else {
    let splitIdx = middle.length;
    for (let i = 0; i < middle.length; i++) {
      const word = middle[i].trim().toLowerCase();
      if (PITCH_STARTERS.some(s => word.startsWith(s))) { splitIdx = i; break; }
    }
    if (splitIdx === middle.length) splitIdx = Math.ceil(middle.length / 2);
    nicho = middle.slice(0, splitIdx).join(', ');
    angulo = middle.slice(splitIdx).join(', ');
  }
  return { nome: first5[0]||'', handle: first5[1]||'', plataforma: first5[2]||'', seguidores: first5[3]||'', contato: first5[4]||'', nicho, angulo, categoria, pais };
}

console.log(`Linhas: ${rawLines.length - 1}`);
const parsed = [];
for (let i = 1; i < rawLines.length; i++) {
  const row = parseRow(splitLine(rawLines[i]));
  if (row) parsed.push(row);
}
console.log(`Parseadas: ${parsed.length}`);

const lines = [NEW_HEADER];
for (const r of parsed) {
  lines.push([quoteField(r.nome), quoteField(r.handle), quoteField(r.plataforma), quoteField(r.seguidores),
    quoteField(r.contato), quoteField(r.nicho), quoteField(r.angulo), quoteField(r.categoria), quoteField(r.pais)].join(','));
}
fs.writeFileSync(path, lines.join('\n'), 'utf8');

const dist = {};
const verify = fs.readFileSync(path, 'utf8').split('\n').filter(l => l.trim());
for (let i = 1; i < verify.length; i++) {
  const f = splitLine(verify[i]);
  const c = f[8] || '(empty)';
  dist[c] = (dist[c] || 0) + 1;
}
console.log(`Total: ${verify.length - 1}`);
console.log('\nPaises:');
Object.entries(dist).sort((a,b) => b[1]-a[1]).filter(([k]) => k !== '(empty)' && !['GAMES','PRESS','BOOKS','WEBTOON/MANGA','GAME DESIGN PODCAST','TTRPG','INDIE COMICS','SFF BOOKS','INDIE GAMES NEWSLETTER','PRIORIDADE MÁXIMA','MÁXIMA'].includes(k) && !k.startsWith('and ') && !k.startsWith('Pitch ') && !k.startsWith('Free ') && !k.startsWith('Send ') && !k.startsWith('Lead ') && !k.startsWith('Offer ') && !k.startsWith('Submit ') && !k.startsWith('Position ') && !k.startsWith('Frame ') && !k.startsWith('Focus ') && !k.startsWith('Emphasize ') && !k.startsWith('Avoid ') && !k.startsWith('Solo ') && !k.startsWith('Tactical ') && !k.startsWith('Deckbuilder') && !k.startsWith('Unique ') && !k.startsWith('ARC-') && !k.startsWith('indie-') && !k.startsWith('gothic/') && k.length < 30).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
