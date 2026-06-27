const fs = require('fs');
const path = 'C:\\Users\\isaia\\Downloads\\BRANDS\\Lutas de Ilusão\\SiteLDI\\docs\\Marketing\\pr_outreach_illusion_fight_int_email.csv';

const text = fs.readFileSync(path, 'utf8');
const rawLines = text.split('\n').filter(l => l.trim());
const NEW_HEADER = 'Nome,Handle,Plataforma,Seguidores,Contato,Nicho,Angulo,Categoria,Pais';

const COUNTRY_MAP = {
  'us': 'US', 'usa': 'US', 'united states': 'US',
  'uk': 'UK', 'united kingdom': 'UK', 'gb': 'UK', 'great britain': 'UK', 'england': 'UK', 'scotland': 'UK', 'wales': 'UK',
  'spain': 'Spain', 'espanha': 'Spain', 'españa': 'Spain', 'espana': 'Spain',
  'argentina': 'Argentina',
  'mexico': 'Mexico', 'méxico': 'Mexico',
  'colombia': 'Colombia',
  'chile': 'Chile',
  'peru': 'Peru',
  'venezuela': 'Venezuela',
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
  'brazil': 'Brazil', 'brasil': 'Brazil',
  'canada': 'Canada',
  'japan': 'Japan',
  'australia': 'Australia',
  'international': 'International',
  'latin america': 'Latin America'
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

// Pitch starters to detect Angle column boundary
const PITCH_STARTERS = ['pitch', 'free ', 'send ', 'lead with', 'lead with the', 'offer ', 'submit', 'position', 'frame ',
  'focus on', 'present ', 'propose ', 'enviar', 'presentar', 'specialized', 'alternative', 'newsletter',
  'blog of', 'blog with', 'geek', 'portal', 'community', 'magazine', 'indie game', 'juego',
  'angle of', 'brief pitch', 'creative process', 'close pitch', 'direct editorial',
  'focus webtoon', 'shonen angle', 'pop/geek', 'personalized', 'regional pitch',
  'propose episode', 'pitch world', 'send angle', 'offer interview', 'review pitch',
  'request review', 'propose note', 'send concise', 'propose mention',
  'latin american', 'send press', 'coverage', 'pitch webtoon-first',
  'anime/manga angle', 'general pitch', 'marketing partnership', 'pitch cercano',
  'vender el mundo', 'presentar', 'enviar gancho', 'enviar nota', 'ofrecer',
  'proponer', 'solicitar', 'mandar', 'usar el angulo', 'pitch regional',
  'fan chile', 'fan argentina', 'fan colombia', 'fan peru', 'fan mexico',
  'fan spain', 'contacto editorial'];

function parseRow(fields) {
  const n = fields.length;
  if (n === 0) return null;

  const first5 = fields.slice(0, 5);
  const last2 = fields.slice(-2);
  const middle = fields.slice(5, -2);

  // Determine category and country from last2
  let categoria = last2[0] || '';
  let paisRaw = last2[1] || '';

  // Normalize: check if last2[0] looks like a country instead of category
  const catNorm = categoria.trim().toUpperCase();
  const validCategories = ['PRESS', 'GAMES', 'BOOKS', 'WEBTOON/MANGA', 'GAME DESIGN PODCAST', 'TTRPG',
    'INDIE COMICS', 'SFF BOOKS', 'INDIE GAMES NEWSLETTER', 'PRIORIDADE MÁXIMA', 'WEBTOON/MANGA'];
  if (!validCategories.includes(catNorm) && paisRaw && validCategories.includes(paisRaw.trim().toUpperCase())) {
    // Swapped: categoria is actually country, pais is actually category
    const temp = categoria;
    categoria = paisRaw;
    paisRaw = temp;
  }

  const pais = normalizeCountry(paisRaw);

  // Split middle into Niche and Angle
  let nicho = '', angulo = '';
  if (middle.length === 0) {
    nicho = '';
    angulo = '';
  } else if (middle.length === 1) {
    nicho = middle[0];
    angulo = '';
  } else {
    let splitIdx = middle.length;
    for (let i = 0; i < middle.length; i++) {
      const word = middle[i].trim().toLowerCase();
      if (PITCH_STARTERS.some(s => word.startsWith(s))) {
        splitIdx = i;
        break;
      }
    }
    if (splitIdx === middle.length) splitIdx = Math.ceil(middle.length / 2);
    nicho = middle.slice(0, splitIdx).join(', ');
    angulo = middle.slice(splitIdx).join(', ');
  }

  return {
    nome: first5[0] || '',
    handle: first5[1] || '',
    plataforma: first5[2] || '',
    seguidores: first5[3] || '',
    contato: first5[4] || '',
    nicho,
    angulo,
    categoria,
    pais
  };
}

console.log(`Total linhas: ${rawLines.length - 1}`);

const parsedRows = [];
for (let i = 1; i < rawLines.length; i++) {
  const fields = splitLine(rawLines[i]);
  const row = parseRow(fields);
  if (row) parsedRows.push(row);
}

console.log(`Parseadas: ${parsedRows.length}`);

// Write new CSV
const lines = [NEW_HEADER];
for (const r of parsedRows) {
  lines.push([
    quoteField(r.nome),
    quoteField(r.handle),
    quoteField(r.plataforma),
    quoteField(r.seguidores),
    quoteField(r.contato),
    quoteField(r.nicho),
    quoteField(r.angulo),
    quoteField(r.categoria),
    quoteField(r.pais)
  ].join(','));
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');

// Verify
const verify = fs.readFileSync(path, 'utf8');
const vLines = verify.split('\n').filter(l => l.trim());
console.log(`Total final: ${vLines.length - 1}`);

// Distribution
const dist = {};
for (let i = 1; i < vLines.length; i++) {
  const f = splitLine(vLines[i]);
  const c = f[8] || '(empty)';
  dist[c] = (dist[c] || 0) + 1;
}
console.log('\nDistribuicao por pais:');
Object.entries(dist).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k || '(empty)'}: ${v}`));
