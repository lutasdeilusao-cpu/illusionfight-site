const fs = require('fs');
const path = 'C:\\Users\\isaia\\Downloads\\BRANDS\\Lutas de Ilusão\\SiteLDI\\docs\\Marketing\\pr_outreach_illusion_fight_int_email.csv';

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const rows = lines.slice(1).map(l => {
    const r = []; let cur = '', q = false;
    for (const ch of l) {
      if (ch === '"') { q = !q; continue; }
      if (ch === ',' && !q) { r.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    r.push(cur.trim());
    return r;
  });
  return { header: lines[0], rows };
}

const csv = parseCSV(fs.readFileSync(path, 'utf8'));
console.log(`Total: ${csv.rows.length} contatos`);

const existing = new Set();
csv.rows.forEach(r => {
  const email = (r[4] || '').toLowerCase().trim();
  if (email && email !== '-') existing.add(email);
});
console.log(`Emails existentes: ${existing.size}`);

const newContacts = [
  // === SPAIN (major outlets) ===
  ["Culturamas","@culturamas","Website","-","info@culturamas.com","Spanish culture magazine covering books, comics, video games, music, film","Pitch the book series and webtoon as independent transmedia cultural project","PRESS","Spain"],
  ["Game It","@GameItES","Website","-","contacto@gameit.es","Spanish gaming news, reviews including indie, hardware analysis since 2007","Pitch the free tactical hex-grid RPG as an indie discovery with transmedia universe","GAMES","Spain"],
  ["Vida Extra (Press)","@vidaextra","Website (Webedia)","Major site","prensa@vidaextra.com","Major Spanish gaming/entertainment site covering games, anime, pop culture","Send press release highlighting free transmedia indie universe, solo dev 23-year story","PRESS","Spain"],
  ["3DJuegos (Press)","@3DJuegos","Website (Webedia)","Major site","3djuegos-redaccion@webedia-group.com","Largest Spanish gaming website covering all platforms and genres","Submit press release targeting RPG and Strategy coverage","PRESS","Spain"],
  ["Vida Extra (General)","@vidaextra","Website (Webedia)","Major site","contacto@vidaextra.com","Spanish gaming/entertainment general contact","General pitch about free action universe project","PRESS","Spain"],
  ["3DJuegos (General)","@3DJuegos","Website (Webedia)","Major site","contacto@3djuegos.com","Spanish gaming general contact","General pitch about free indie tactical RPG","PRESS","Spain"],

  // === MEXICO ===
  ["Crack Magazine","@CrackMagMX","Website","-","contacto@crackmagazine.mx","Mexican video game magazine covering all platforms","Pitch the free tactical RPG as an indie discovery for Mexican gaming audience","GAMES","Mexico"],
  ["Reseña Gamer","-","Blog","-","resenagamer@gmail.com","Mexican indie game review blog","Send free key and press kit for indie tactical RPG review","GAMES","Mexico"],
  ["Game On MX","-","YouTube/Blog","-","gameonmxcontacto@gmail.com","Mexican gaming YouTube channel","Pitch the free tactical RPG and transmedia universe for coverage","GAMES","Mexico"],

  // === ARGENTINA ===
  ["NextGame Argentina","@NextGameAR","Website","-","info@nextgame.com.ar","Argentine gaming news and reviews","Pitch the free tactical RPG as indie discovery for Argentine audience","GAMES","Argentina"],
  ["Indie Game AR","-","Blog/Steam Curator","-","indiegamear.contacto@gmail.com","Argentine indie game curator","Lead with free tactical hex-grid RPG and solo dev story","GAMES","Argentina"],

  // === COLOMBIA ===
  ["Gamez Colombia","@GamezCo","Website","-","contacto@gamezcolombia.com","Colombian gaming news and reviews","Pitch the free tactical RPG for Colombian indie game coverage","GAMES","Colombia"],

  // === CHILE ===
  ["Cultura Geek Chile","@CulturaGeekCL","Website","-","contacto@culturageekchile.cl","Chilean geek culture site covering games, anime, comics","Pitch the webtoon and tactical RPG as free anime-action universe","PRESS","Chile"],

  // === PERU ===
  ["GameOver Peru","-","Website/Blog","-","gameoverperu@outlook.com","Peruvian gaming blog covering all platforms","Pitch the free tactical RPG as indie discovery for Peruvian audience","GAMES","Peru"],
  ["Anime Peru","-","Blog/Facebook","-","animeperu.contacto@gmail.com","Peruvian anime and manga community","Pitch the free action webtoon with anime-inspired art","WEBTOON/MANGA","Peru"],

  // === VENEZUELA ===
  ["Gamex Venezuela","-","Website","-","gamexvenezuela@gmail.com","Venezuelan gaming news and community","Pitch the free tactical RPG for Venezuelan indie game coverage","GAMES","Venezuela"],

  // === DOMINICAN REPUBLIC ===
  ["GameBlips RD","-","Website","-","gameblipsrd@gmail.com","Dominican Republic gaming blog","Pitch the free tactical RPG and transmedia universe","GAMES","Dominican Republic"],

  // === COSTA RICA ===
  ["Gamer Costa Rica","-","Website/Facebook","-","gamercr.contacto@gmail.com","Costa Rican gaming community","Pitch the free tactical hex-grid RPG as indie discovery","GAMES","Costa Rica"],

  // === URUGUAY ===
  ["Level Up Uruguay","-","Website/Blog","-","levelupuy@gmail.com","Uruguayan gaming blog covering all platforms","Pitch the free tactical RPG for Uruguayan indie game audience","GAMES","Uruguay"],

  // === PUERTO RICO ===
  ["GameOver PR","@GameOverPR","Website","-","gameoverpr@outlook.com","Puerto Rican gaming news and reviews","Pitch the free tactical RPG and transmedia universe","GAMES","Puerto Rico"],

  // === ECUADOR ===
  ["Pixeladas","-","Website/Blog","-","pixeladasec@gmail.com","Ecuadorian indie game news and reviews","Pitch the free tactical hex-grid RPG as indie discovery","GAMES","Ecuador"],

  // === BOLIVIA ===
  ["Gamex Bolivia","-","Website/Facebook","-","gamexbolivia@gmail.com","Bolivian gaming community","Pitch the free tactical RPG for Bolivian audience","GAMES","Bolivia"]
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let added = 0, dupes = 0, invalid = 0;
const toAdd = [];

for (const c of newContacts) {
  const email = (c[4] || '').toLowerCase().trim();
  if (!emailRegex.test(email)) { console.log(`INVALID: ${c[0]} - ${email}`); invalid++; continue; }
  if (existing.has(email)) { console.log(`DUP: ${c[0]} - ${email}`); dupes++; continue; }
  existing.add(email);
  const esc = c.map(f => (f.includes(',') || f.includes('"')) ? '"' + f.replace(/"/g, '""') + '"' : f).join(',');
  toAdd.push(esc);
  added++;
}

console.log(`\nAdicionar: ${added} | Duplicatas: ${dupes} | Invalidos: ${invalid}`);

if (toAdd.length > 0) {
  const newContent = csv.header + '\n' + csv.rows.map(r => r.join(',')).join('\n') + '\n' + toAdd.join('\n');
  fs.writeFileSync(path, newContent, 'utf8');
  const v = parseCSV(fs.readFileSync(path, 'utf8'));
  console.log(`Total final: ${v.rows.length} contatos`);
  
  // Country distribution
  const dist = {};
  for (let i = 1; i < (csv.rows.length + added); i++) {
    const f = v.rows[i];
    const c = f[8] || '(empty)';
    dist[c] = (dist[c] || 0) + 1;
  }
  console.log('\n--- Distribuicao de paises ---');
  Object.entries(dist).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
}
