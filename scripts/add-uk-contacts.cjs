const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\isaia\\Downloads\\BRANDS\\Lutas de Ilusão\\SiteLDI\\docs\\Marketing';
const intCsvPath = path.join(BASE, 'pr_outreach_illusion_fight_int_email.csv');
const brEmailCsvPath = path.join(BASE, 'pr_outreach_illusion_fight_br_email.csv');
const csvToDelete = path.join(BASE, 'pr_outreach_illusion_fight.csv');

// Read existing CSV
function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const header = lines[0];
  const rows = lines.slice(1).map(l => {
    const cols = [];
    let current = '', inQuotes = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { cols.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    cols.push(current.trim());
    return cols;
  });
  return { header, rows };
}

console.log('=== LENDO CSV EXISTENTE ===');
const csv = parseCSV(fs.readFileSync(intCsvPath, 'utf8'));
console.log(`Total existente: ${csv.rows.length} contatos`);

const existingEmails = new Set();
csv.rows.forEach(r => {
  const email = (r[4] || '').toLowerCase().trim();
  if (email && email !== '-') existingEmails.add(email);
});
console.log(`Emails existentes: ${existingEmails.size}`);

// New contacts from the UK/Europe batch (verified by research agent)
const newContacts = [
  // === UK PRESS / GAMES ===
  ["Game-News.co.uk","@game-news.co.uk","Website","-","marco@game-news.co.uk","Indie game news","Free transmedia indie universe, press release","PRESS","UK"],
  ["Loot Level Chill","@LootLevelChill","Website","-","Adam@LootLevelChill.com","Indie game news/reviews","UK-based indie site, review & feature pitch","PRESS","UK"],
  ["Video Games Chronicle","@VGC","Website","-","andy.robinson@videogameschronicle.com","Game news/reviews","Major UK outlet, press release & editorial pitch","PRESS","UK"],
  ["Tabletop Sentinel","@tabletopsentinel","Website","-","contact@tabletopsentinel.com","Tabletop/RPG news","UK-based daily news, perfect for tactical RPG & worldbuilding angle","PRESS","UK"],
  ["PopSize","@popsize","Website","-","press@popsize.co.uk","Pop culture","UK pop culture outlet, press release","PRESS","UK"],
  ["Pocket Gamer","@pocketgamer","Website","-","reviews@pocketgamer.co.uk","Mobile/indie games","UK mobile gaming press, review pitch","PRESS","UK"],
  ["VG247","@VG247","Website","-","contact@vg247.com","Video game blog","Major UK gaming blog, press release","PRESS","UK"],
  ["Comic Book News UK","@comicbooknewsuk","Website","-","contact@comicbooknews.co.uk","UK indie comics","UK comics site, press release for webtoon & books","PRESS","UK"],
  ["downthetubes","@downthetubes","Website","-","editor@downthetubes.net","UK comics/news","UK comics site, press release for webtoon","PRESS","UK"],
  ["Anime News Network (UK)","@animenewsnetwork","Website","-","uk-news@animenewsnetwork.com","Anime/manga news","UK-specific submissions for anime-inspired webtoon","PRESS","UK"],
  ["Anime Lane","@AnimeLaneCast","Podcast","-","contact@plaintoastproductions.com","Anime podcast","UK anime podcast, pitch free anime-inspired webtoon & OST","WEBTOON/MANGA","UK"],
  ["Hall of Comics Podcast","@HallOfComicsUK","Podcast","-","hallofcomicspodcastuk@gmail.com","Comics podcast","UK comics podcast, pitch webtoon & book series","WEBTOON/MANGA","UK"],
  ["The Webtoon Room","@thewebtoonroom","Podcast","-","thewebtoonroom@gmail.com","Webtoon podcast","Perfect fit: webtoon-focused podcast, pitch Illusion Fight webtoon","WEBTOON/MANGA","UK"],
  ["My Webtoon Journey","@MyWebtoonPod","Podcast","-","mywebtoonjourney@gmail.com","Webtoon podcast","Direct webtoon podcast, pitch the free webtoon & universe","WEBTOON/MANGA","UK"],
  ["Once Upon a Bookcase","@onceuponabookcase","Blog","-","onceuponabookcase@gmail.com","Fantasy book reviews","UK fantasy blog, pitch free SFF book series","BOOKS","UK"],
  ["Jellyfish Reads","@jellyfishreads","Blog","-","jellyfishreads@gmail.com","Book reviews","UK book blog, pitch free SFF book series","BOOKS","UK"],
  ["Scattered Figments","@scatteredfigments","Blog","-","l-a-u-r-a@live.co.uk","Book reviews","UK book blog, pitch free SFF book series","BOOKS","UK"],
  ["The Elifylop","@elifylop","Blog","-","elifylop@hotmail.co.uk","Book reviews","UK reviewer, pitch free SFF book series","BOOKS","UK"],
  ["SFF Addicts","@sffaddicts","Podcast","-","sffaddictspod@gmail.com","SFF book podcast","UK-based SFF podcast, pitch free book series & transmedia angle","BOOKS","UK"],
  ["Fantasy Writers' Toolshed","@fantasywriterstoolshed","Podcast","-","thefantasywriterstoolshed@gmail.com","Fantasy writing podcast","UK-based, pitch worldbuilding & transmedia story","BOOKS","UK"],
  ["Dear Fantasy Reader","@dearfantasyreader","Podcast","-","dearfantasyreaderpod@gmail.com","Fantasy book podcast","UK-based fantasy podcast, pitch book series","BOOKS","UK"],
  ["Quick Book Reviews","@quickbookreviews","Podcast","-","quickbookreviews@outlook.com","Book reviews","UK book podcast, pitch free SFF book series","BOOKS","UK"],
  ["Fluff N Crunch","@fluffncrunch","Podcast","-","fluffncrunch@tutanota.com","TTRPG podcast","UK-based TTRPG podcast, pitch tactical RPG & worldbuilding","GAMES","UK"],
  ["Table-Top Talk","@tabletopTalk","Podcast","-","topofthetable2ya@gmail.com","TTRPG podcast","UK TTRPG podcast, pitch tactical RPG & free universe","GAMES","UK"],
  ["Roll to Save","@rolltosave","Podcast","-","rolltosavepod@gmail.com","TTRPG podcast","UK RPG podcast, pitch tactical RPG & free universe","GAMES","UK"],
  ["Beat British","@beatbritish","Podcast","-","theguys@beatbritish.co.uk","Gaming podcast","UK gaming podcast, pitch indie tactical RPG","GAMES","UK"],
  ["All About Strategy Games","@allaboutstrategygames","Steam Curator","-","allaboutstrategygames@gmail.com","Strategy/turn-based games","Steam curator, perfect for free tactical hex-grid RPG","GAMES","UK"],
  ["Indie-Credible","@indiecredible","Podcast","-","Podcast@indie-credible.com","Indie game podcast","UK indie game podcast, pitch free tactical RPG & transmedia","GAMES","UK"],
  ["The Computer Game Show","@tcgs","Podcast","-","podcast@tcgs.co","UK gaming podcast","UK gaming podcast, pitch indie tactical RPG & OST","GAMES","UK"],
  ["TheXboxHub","@TheXboxHub","Website / YouTube","-","neil@thexboxhub.com","Xbox, PC and indie game reviews","Pitch the free tactical hex-grid RPG as a reviewable indie discovery","GAMES","UK"],
  ["Thumb Culture","@Thumb_culture","Website","-","enquiries@thumbculture.co.uk","Gaming news, reviews, hardware and indie coverage","Send a concise review pitch for the free tactical RPG","GAMES","UK"],
  ["Rapid Reviews UK","@rapidreviewsuk","Website","-","editor@rapidreviewsuk.com","Video game and tech reviews in the UK","Lead with a quick-review angle: free tactical RPG","GAMES","UK"],
  ["Game-News.co.uk","@gamenewsweb","Website","-","marco@game-news.co.uk","Gaming news, reviews, interviews and competitions","Submit a formal review-material pitch for the free tactical RPG","GAMES","UK"],
  ["GamingOnLinux","@gamingonlinux","Website / Steam Curator","30K+ Steam followers","contact@gamingonlinux.com","Linux and Steam Deck gaming news, reviews and guides","Offer a Linux/Steam Deck-friendly discovery pitch","GAMES","UK"],
  ["Xbox Tavern","@XboxTavern","Website / Podcast","1.5K Facebook","cloud@xboxtavern.com","Xbox reviews, features, interviews and ID@Xbox games","Pitch the free tactical RPG as an indie review","GAMES","UK"],
  ["NookGaming","@NookSite","Website / Steam Curator","220 Steam followers","contact@nookgaming.com","Anime games, JRPGs, visual novels, indie games and manga-adjacent coverage","Lead with the anime-inspired tactical RPG, webtoon, book series and OST","GAMES","UK"],
  ["Movies Games and Tech","@moviesgamestek","Website / YouTube","-","andrew@moviesgamesandtech.com","Games, tech, reviews, guides and entertainment","Pitch the free tactical RPG and transmedia universe","GAMES","UK"],
  ["GamePitt","@GamePittReviews","Website / OpenCritic","-","press@gamepitt.co.uk","Detailed reviews for AAA, niche and indie games","Send the tactical RPG for review consideration","GAMES","UK"],
  ["Game People","-","Website","-","editor@gamepeople.co.uk","Personal and niche video game reviews","Pitch Illusion Fight as a personal-story game review","GAMES","UK"],
  ["Otaku News","@otaku_news","Website / Bluesky","4K X followers","webmaster@otakunews.com","Anime, manga, Japanese pop culture and fan news","Send a webtoon-first press pitch with anime-style action","WEBTOON/MANGA","UK"],
  ["Anime Freshmen","@AnimeFreshmen","Podcast / YouTube / Instagram","-","hello@animefreshmen.com","Anime podcast and London-based anime discussion platform","Offer a podcast discovery/interview angle","WEBTOON/MANGA","UK"],
  ["The Eloquent Page","-","Book review blog","-","admin@theeloquentpage.co.uk","Fantasy, science fiction, horror and genre fiction reviews","Pitch the free SFF action book series as the primary review target","BOOKS","UK"],
  ["Becky's Book Blog","@CrooksBooks","Book review blog","2K+ subscribers","Rebecca.Crook@hotmail.co.uk","Fantasy, horror, speculative fiction, adult and YA reviews","Send a focused SFF/fantasy review request for the book series","BOOKS","UK"],
  ["BookLore","-","Book review website","-","submissions@booklore.co.uk","Independent UK book review site","Submit the free action-fantasy book series as a digital review package","BOOKS","UK"],
  ["Track of Words","@track_of_words","SFF review blog","474 subscribers","michael@trackofwords.com","Science fiction, fantasy, horror reviews, interviews and guest posts","Pitch an interview or feature about building one SFF universe","BOOKS","UK"],
  ["SFBook","@sfbook","Book review website","-","ant@sfbook.com","Science fiction, fantasy, horror and speculative fiction reviews","Send a clean SFF review pitch for the free book series","BOOKS","UK"],
  ["Dead Girl Reads","@deadgirlreads","Book review blog / Instagram","-","dg182uk@gmail.com","Fantasy, dark fantasy, horror and speculative book reviews","Offer the free action-SFF book series for review","BOOKS","UK"],
  ["The Good Friends of Jackson Elias","@GoodFriendsOfJE","Podcast / Patreon","1.2K+ Patreon members","submissions@blasphemoustomes.com","Call of Cthulhu, horror gaming, weird fiction and roleplaying games","Pitch the worldbuilding, factions and soundtrack as RPG/horror-adjacent discussion material","GAMES","UK"],
  ["The Smart Party","@the_smart_party","Podcast / YouTube","-","thesmartparty@hotmail.com","UK RPG podcast, GM advice and tabletop roleplaying discussion","Offer a design-discussion pitch about tactical encounters","GAMES","UK"],
  ["Hell or High Rollers","@hellorhighpod","Podcast / Acast","-","hellorhighrollerspodcast@gmail.com","British D&D actual-play comedy podcast","Pitch the free tactical RPG, lore, factions and 36-track OST","GAMES","UK"],
  ["Broken Frontier","@brokenfrontier","Website / Newsletter","-","reviews@brokenfrontier.com","Comics, graphic novels, indie comics and creator-owned material","Submit the webtoon as a free creator-owned comics project","WEBTOON/MANGA","UK"],
  ["Down The Tubes","@downthetubesnet","Website","1.8K Facebook","editor@downthetubes.net","British comics news, interviews, features and popular culture","Pitch a creator-owned webtoon/comics feature","PRESS","UK"],
  ["Comic Book News UK","@cbn_uk","Website","1.5K Facebook","contact@comicbooknews.co.uk","UK indie comics news, previews, scoops and reviews","Query first with the webtoon/comics angle","PRESS","UK"],
  ["Pipedream Comics","@pipedreamcomics","Website / X / Instagram","827 Facebook","pipedreamcomicsuk@gmail.com","Indie, small press and digital comics","Send a webtoon-first review pitch highlighting free digital access","WEBTOON/MANGA","UK"],
  ["Get Your Comic On","@getyourcomicon1","Website / Podcast","295K monthly visitors","neil@getyourcomicon.co.uk","Comics, movies, TV, anime, gaming and pop culture","Offer a pop-culture feature about a free creator-owned action universe","PRESS","UK"],
  ["SFcrowsnest","@SFcrowsnest","Website / Magazine","-","gfwillmetts-2@hotmail.co.uk","Science fiction, fantasy, horror, anime, manga, games and RPG coverage","Submit a compact press/review query for the free SFF book series","BOOKS","UK"]
];

console.log(`\nNovos contatos para processar: ${newContacts.length}`);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let added = 0, dupes = 0, invalid = 0;
const toAdd = [];

for (const c of newContacts) {
  const email = (c[4] || '').toLowerCase().trim();
  const handle = (c[1] || '').toLowerCase().trim();

  if (!emailRegex.test(email)) {
    console.log(`  INVALID: ${c[0]} - ${email}`);
    invalid++;
    continue;
  }

  if (existingEmails.has(email)) {
    console.log(`  DUPLICATE email: ${c[0]} - ${email}`);
    dupes++;
    continue;
  }

  existingEmails.add(email);

  const escapedRow = c.map(field => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
  }).join(',');

  toAdd.push(escapedRow);
  added++;
}

console.log(`\n=== RESULTADOS ===`);
console.log(`Adicionados: ${added}`);
console.log(`Duplicatas ignoradas: ${dupes}`);
console.log(`Emails invalidos ignorados: ${invalid}`);

if (toAdd.length > 0) {
  const newContent = csv.header + '\n' + csv.rows.map(r => r.join(',')).join('\n') + '\n' + toAdd.join('\n');
  fs.writeFileSync(intCsvPath, newContent, 'utf8');
  console.log(`\nAtualizado: ${intCsvPath}`);
  
  // Verify
  const verifyCsv = parseCSV(fs.readFileSync(intCsvPath, 'utf8'));
  console.log(`Total apos adicao: ${verifyCsv.rows.length} contatos`);
}

// Delete the non-email CSV (only if it exists)
if (fs.existsSync(csvToDelete)) {
  fs.unlinkSync(csvToDelete);
  console.log(`\nDeletado (contato sem email): ${csvToDelete}`);
} else {
  console.log(`\nNao encontrado para deletar: ${csvToDelete}`);
}

// Verify br_email.csv still exists
if (fs.existsSync(brEmailCsvPath)) {
  console.log(`Preservado: ${brEmailCsvPath}`);
} else {
  console.log(`ATENCAO: ${brEmailCsvPath} nao encontrado!`);
}

console.log(`\n=== RESUMO ===`);
console.log(`+${added} novos contatos adicionados ao int_email.csv`);
