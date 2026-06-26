const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const existingEmails = fs.readFileSync(path.join(__dirname, 'existing_all_emails.txt'), 'utf-8')
  .split('\n')
  .filter(Boolean)
  .map(e => e.trim().toLowerCase());

console.log(`Loaded ${existingEmails.length} existing emails.\n`);

const channels = [
  // NICHE 1: Webtoon/Webcomic (US-based)
  { handle: '@colossaliscrazy', name: 'Colossal Is Crazy', niche: 'Webtoon commentary/review', category: 'WEBTOON/MANGA' },
  { handle: '@BakaShift', name: 'BakaShift', niche: 'Anime/manga/webtoon commentary', category: 'WEBTOON/MANGA' },
  { handle: '@MangaKamen', name: 'MangaKamen', niche: 'Manga/anime commentary', category: 'WEBTOON/MANGA' },
  { handle: '@MangaSloth', name: 'MangaSloth', niche: 'Manga recommendations', category: 'WEBTOON/MANGA' },
  { handle: '@NearlyOnRed', name: 'Nearly On Red', niche: 'Manga collecting/reviews', category: 'WEBTOON/MANGA' },
  { handle: '@TheMangaScholar', name: 'The Manga Scholar', niche: 'Manga analysis', category: 'WEBTOON/MANGA' },

  // NICHE 2: Anime/Manga YouTube (US-based)
  { handle: '@ScamboliReviews', name: 'Scamboli Reviews', niche: 'Anime reviews and recommendations', category: 'WEBTOON/MANGA' },
  { handle: '@domainaniki', name: 'Domain Aniki', niche: 'Solo Leveling/JJK/Chainsaw Man breakdowns', category: 'WEBTOON/MANGA' },
  { handle: '@DBZimran', name: 'DBZimran', niche: 'Anime/manga video essays', category: 'WEBTOON/MANGA' },
  { handle: '@ManhwaOutpost', name: 'Manhwa Outpost', niche: 'Manhwa deep dives/power systems', category: 'WEBTOON/MANGA' },
  { handle: '@ManhwaExplorer', name: 'Manhwa Explorer', niche: 'Manhwa analysis', category: 'WEBTOON/MANGA' },
  { handle: '@ManhwaRecapZone', name: 'Manhwa Recap Zone', niche: 'Manhwa cinematic recaps', category: 'WEBTOON/MANGA' },
  { handle: '@mangatama', name: 'mangatama', niche: 'Manga collecting/hauls/recommendations', category: 'WEBTOON/MANGA' },

  // NICHE 3: Tactical RPG/Turn-Based Game Reviewers (US-based)
  { handle: '@Nookrium', name: 'Nookrium', niche: 'Indie strategy/tactics/simulation', category: 'GAMES' },
  { handle: '@ChristopherOdd', name: 'ChristopherOdd', niche: 'Turn-based strategy RPGs/XCOM-likes', category: 'GAMES' },
  { handle: '@Wanderbots', name: 'Wanderbots', niche: 'Indie games/strategy/deckbuilders', category: 'GAMES' },
  { handle: '@Splattercatgaming', name: 'Splattercatgaming', niche: 'Daily indie game coverage', category: 'GAMES' },
  { handle: '@MortismalGaming', name: 'Mortismal Gaming', niche: 'RPG reviews/completionist analysis', category: 'GAMES' },
  { handle: '@PartyElite', name: 'PartyElite', niche: 'Strategy/tactics/RPG games', category: 'GAMES' },
  { handle: '@MegaMogwai', name: 'MegaMogwai', niche: 'Card games and deckbuilding', category: 'GAMES' },
  { handle: '@Jorbs', name: 'Jorbs', niche: 'Deckbuilder strategy/analysis', category: 'GAMES' },
  { handle: '@Sifd', name: 'Sifd', niche: 'Roguelikes/deckbuilders/indie gameplay', category: 'GAMES' },
  { handle: '@OrbitalPotato', name: 'Orbital Potato', niche: 'Roguelikes/deckbuilders/indie strategy', category: 'GAMES' },
  { handle: '@RhapsodyPlays', name: 'Rhapsody', niche: 'Deckbuilders/roguelikes/strategy', category: 'GAMES' },
  { handle: '@OlexaYT', name: 'Olexa', niche: 'Roguelites/deckbuilders/indie', category: 'GAMES' },
  { handle: '@FrostPrime', name: 'Frost Prime', niche: 'Deckbuilders/roguelikes/StS audience', category: 'GAMES' },

  // NICHE 4: Indie Game Discovery (US-based)
  { handle: '@GetIndieGaming', name: 'Get Indie Gaming', niche: 'Indie game showcases/recommendations', category: 'GAMES' },
  { handle: '@IndieGamePulse', name: 'Indie Game Pulse', niche: 'Indie game discovery/news', category: 'GAMES' },
  { handle: '@ClemmyGames', name: 'Best Indie Games/ClemmyGames', niche: 'Indie game discovery showcases', category: 'GAMES' },
  { handle: '@TheScarletSeeker', name: 'The Scarlet Seeker', niche: 'JRPGs/tactical RPGs discovery', category: 'GAMES' },
  { handle: '@davidvinc', name: 'Davidvinc RPGs', niche: 'JRPGs/RPG recommendations', category: 'GAMES' },
  { handle: '@DeckbuildingDad', name: 'Deckbuilding Dad', niche: 'Deckbuilders and card battlers', category: 'GAMES' },

  // NICHE 5: SFF/Fantasy Book Review (US-based)
  { handle: '@MerphyNapier', name: 'Merphy Napier', niche: 'Fantasy books/manga/storytelling', category: 'BOOKS' },
  { handle: '@BookswithEmilyFox', name: 'Books with Emily Fox', niche: 'Sci-fi/fantasy reviews/reading vlogs', category: 'BOOKS' },
  { handle: '@PeruseProject', name: 'PeruseProject', niche: 'Fantasy/YA reading vlogs', category: 'BOOKS' },
  { handle: '@LibraryofaViking', name: 'Library of a Viking', niche: 'Epic fantasy/sci-fi book reviews', category: 'BOOKS' },
  { handle: '@thebookleo', name: 'The Book Leo', niche: 'Fantasy/sci-fi BookTube', category: 'BOOKS' },
  { handle: '@BooksandLala', name: 'BooksandLala', niche: 'Fantasy/thriller BookTube', category: 'BOOKS' },
  { handle: '@ThoughtsOnTomes', name: 'Thoughts on Tomes', niche: 'Fantasy book discussions', category: 'BOOKS' },
  { handle: '@TheShadesofOrange', name: 'The Shades of Orange', niche: 'Sci-fi/fantasy/horror reviews', category: 'BOOKS' },
  { handle: '@SFF180', name: 'SFF180', niche: 'Science fiction/fantasy book reviews', category: 'BOOKS' },
  { handle: '@Bookpilled', name: 'Bookpilled', niche: 'Vintage/modern sci-fi books', category: 'BOOKS' },
  { handle: '@CapturedInWords', name: 'Captured in Words', niche: 'Fantasy books and adaptations', category: 'BOOKS' },
  { handle: '@PhilipChaseTheBestofFantasy', name: 'Philip Chase', niche: 'Epic fantasy analysis/reviews', category: 'BOOKS' },
  { handle: '@SteveTalksBooks', name: 'Steve Talks Books', niche: 'Fantasy/sci-fi reviews/author interviews', category: 'BOOKS' },

  // NICHE 6: TTRPG Culture/Actual-Play (US-based)
  { handle: '@dungeondudes', name: 'Dungeon Dudes', niche: 'D&D/TTRPG advice/actual play', category: 'GAMES' },
  { handle: '@Taking20', name: 'Taking20', niche: 'TTRPG/D&D advice and discussion', category: 'GAMES' },
  { handle: '@Dungeoncast', name: 'The Dungeoncast', niche: 'D&D lore/TTRPG discussion', category: 'GAMES' },
  { handle: '@dndbeyond', name: 'D&D Beyond', niche: 'Official D&D/TTRPG channel', category: 'GAMES' },
  { handle: '@PointyHat', name: 'Pointy Hat', niche: 'D&D/TTRPG advice/homebrew', category: 'GAMES' },
  { handle: '@XPtoLevel3', name: 'XP to Level 3', niche: 'D&D/TTRPG and pop culture', category: 'GAMES' },

  // NICHE 7: Geek Culture/Pop Culture Press (US-based)
  { handle: '@KindaFunny', name: 'Kinda Funny', niche: 'Gaming/pop culture news', category: 'PRESS' },
  { handle: '@Polygon', name: 'Polygon', niche: 'Gaming/comics/pop culture', category: 'PRESS' },
  { handle: '@ign', name: 'IGN', niche: 'Gaming/entertainment/pop culture', category: 'PRESS' },
  { handle: '@ScreenRant', name: 'ScreenRant', niche: 'Movies/TV/gaming/pop culture', category: 'PRESS' },
  { handle: '@GamerantOfficial', name: 'GameRant', niche: 'Gaming news/reviews', category: 'PRESS' },
  { handle: '@CBR', name: 'CBR (Comic Book Resources)', niche: 'Comics/movies/anime news', category: 'PRESS' },
  { handle: '@ColliderVideos', name: 'Collider', niche: 'Movies/TV/pop culture', category: 'PRESS' },
  { handle: '@ComicBookDotCom', name: 'ComicBook.com', niche: 'Comics/gaming/anime news', category: 'PRESS' },
  { handle: '@io9', name: 'io9', niche: 'Sci-fi/fantasy/pop culture', category: 'PRESS' },
  { handle: '@Kotaku', name: 'Kotaku', niche: 'Gaming/geek culture', category: 'PRESS' },
];

function extractEmail(text) {
  if (!text) return null;
  const regex = /[\w.+-]+@[\w-]+\.[\w.-]+/gi;
  const matches = text.match(regex);
  if (!matches) return null;
  const business = matches.filter(m => {
    const l = m.toLowerCase();
    if (l.includes('noreply') || l.includes('no-reply') || l.includes('google')) return false;
    return true;
  });
  return business.length > 0 ? business[0] : null;
}

function isUSBased(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const usIndicators = [
    'united states', 'usa', 'u.s.a.', 'u.s.',
    'california', 'new york', 'texas', 'florida', 'illinois', 'pennsylvania',
    'ohio', 'georgia', 'north carolina', 'michigan', 'new jersey', 'virginia',
    'washington', 'arizona', 'massachusetts', 'tennessee', 'indiana', 'missouri',
    'maryland', 'wisconsin', 'colorado', 'minnesota', 'south carolina', 'alabama',
    'louisiana', 'kentucky', 'oregon', 'oklahoma', 'connecticut', 'utah',
    'iowa', 'nevada', 'arkansas', 'kansas', 'mississippi', 'new mexico',
    'nebraska', 'west virginia', 'idaho', 'hawaii', 'maine', 'new hampshire',
    'montana', 'rhode island', 'delaware', 'south dakota', 'north dakota',
    'alaska', 'vermont', 'wyoming', 'district of columbia'
  ];
  return usIndicators.some(ind => lower.includes(ind));
}

async function main() {
  const results = [];
  const duplicates = [];
  const noEmail = [];
  const errors = [];

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'en-US'
  });
  const page = await context.newPage();

  // Navigate to YouTube first to establish session
  await page.goto('https://www.youtube.com', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);

  for (let i = 0; i < channels.length; i++) {
    const ch = channels[i];
    const url = `https://www.youtube.com/${ch.handle}/about`;

    process.stdout.write(`[${i + 1}/${channels.length}] ${ch.name}... `);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);

      // Get page text
      const text = await page.evaluate(() => document.body.innerText);

      const email = extractEmail(text);

      if (email) {
        const lowerEmail = email.toLowerCase().trim();
        if (existingEmails.includes(lowerEmail)) {
          console.log(`DUPLICATE: ${email}`);
          duplicates.push({ ...ch, email });
        } else {
          const us = isUSBased(text);
          console.log(`✅ ${email} | US: ${us ? 'YES' : '?'}`);
          results.push({
            name: ch.name,
            handle: ch.handle,
            platform: 'YouTube',
            followers: '',
            email: email,
            niche: ch.niche,
            angle: '',
            category: ch.category,
            country: 'US',
            usCheck: us
          });
        }
      } else {
        console.log('❌ No email');
        noEmail.push(ch);
      }
    } catch (err) {
      console.log(`ERROR: ${err.message.substring(0, 60)}`);
      errors.push({ ...ch, error: err.message });
    }

    await page.waitForTimeout(300);
  }

  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`Total channels: ${channels.length}`);
  console.log(`New emails found: ${results.length}`);
  console.log(`Duplicates skipped: ${duplicates.length}`);
  console.log(`No email found: ${noEmail.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log('');

  const outreachAngles = {
    'WEBTOON/MANGA': 'Pitch Illusion Fight as a free anime-action universe with webtoon, books, tactical hex-grid RPG, and 36-track OST at illusionfight.com.',
    'GAMES': 'Lead with the free tactical hex-grid RPG, 36-track OST, and transmedia universe (webtoon + books) as a unique indie discovery angle.',
    'BOOKS': 'Pitch the free SFF action book series with webtoon art, tactical RPG tie-in, and original soundtrack at illusionfight.com.',
    'PRESS': 'Submit press release: free transmedia indie action universe spanning webtoon, books, tactical RPG, and 36-track OST by solo creator over 23 years.'
  };

  const header = 'Name\tHandle\tPlatform\tEstimated Followers\tEmail\tNiche\tOutreach Angle\tCategory\tCountry';
  const lines = [header];

  for (const r of results) {
    const angle = outreachAngles[r.category] || 'Illusion Fight is a free action universe: webtoon + book series + tactical hex-grid RPG + 36-track original soundtrack. All free at illusionfight.com. Built by a solo developer over 23 years.';
    const line = [
      r.name,
      r.handle,
      'YouTube',
      '',
      r.email,
      r.niche,
      angle,
      r.category,
      'US'
    ].join('\t');
    lines.push(line);
  }

  const output = lines.join('\n');
  const outputPath = path.join(__dirname, 'docs', 'Marketing', 'us_pr_outreach_new.txt');
  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`Output written to: ${outputPath}`);

  // Also write a detailed log
  const logLines = [];
  logLines.push('=== NEW US CONTACTS FOUND ===');
  logLines.push('');
  for (const r of results) {
    logLines.push(`${r.name} | ${r.handle} | ${r.email} | ${r.category} | US confirmed: ${r.usCheck}`);
  }
  logLines.push('');
  logLines.push('=== DUPLICATES (already in CSV) ===');
  for (const d of duplicates) {
    logLines.push(`${d.name} | ${d.handle} | ${d.email}`);
  }
  logLines.push('');
  logLines.push('=== NO EMAIL FOUND ===');
  for (const n of noEmail) {
    logLines.push(`${n.name} | ${n.handle}`);
  }
  logLines.push('');
  logLines.push('=== ERRORS ===');
  for (const e of errors) {
    logLines.push(`${e.name} | ${e.handle} | ${e.error}`);
  }
  const logPath = path.join(__dirname, 'docs', 'Marketing', 'us_pr_outreach_log.txt');
  fs.writeFileSync(logPath, logLines.join('\n'), 'utf-8');
  console.log(`Detailed log: ${logPath}`);

  console.log('\n--- TAB-SEPARATED OUTPUT PREVIEW ---');
  console.log(output.substring(0, 1500));
  if (output.length > 1500) console.log('...');

  await browser.close();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
