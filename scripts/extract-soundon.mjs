/**
 * Extracts platform links from SoundOn smart links
 * DestUrl is in base64-encoded "cd" parameters
 * node scripts/extract-soundon.mjs
 */

const URLS = [
  'https://sndo.ffm.to/ejqb6y7','https://sndo.ffm.to/kygw42j','https://sndo.ffm.to/moq6vpb',
  'https://sndo.ffm.to/qk1q9br','https://sndo.ffm.to/a3gnqjm','https://sndo.ffm.to/5zrzwar',
  'https://sndo.ffm.to/jdq7aqm','https://sndo.ffm.to/yzoogxb','https://sndo.ffm.to/pdemaae',
  'https://sndo.ffm.to/yre0joo','https://sndo.ffm.to/bmbb8jq','https://sndo.ffm.to/5qwaojk',
  'https://sndo.ffm.to/k9oaa3n','https://sndo.ffm.to/xjyveaw','https://sndo.ffm.to/5n1vaxr',
  'https://sndo.ffm.to/927dnbx','https://sndo.ffm.to/qqwk2qd','https://sndo.ffm.to/0eez3jr',
  'https://sndo.ffm.to/xd2kmap','https://sndo.ffm.to/yzxm26j','https://sndo.ffm.to/zxr2a64',
  'https://sndo.ffm.to/ob2vynb','https://sndo.ffm.to/dzq0gm3','https://sndo.ffm.to/pqqdj9l',
  'https://sndo.ffm.to/plw9wed','https://sndo.ffm.to/jj4p9xl','https://sndo.ffm.to/qmrovm',
  'https://sndo.ffm.to/mxzoyry','https://sndo.ffm.to/abvx7wo','https://sndo.ffm.to/vovo72j',
  'https://sndo.ffm.to/j5v5r3d','https://sndo.ffm.to/nxq23dq','https://sndo.ffm.to/vdkddel',
  'https://sndo.ffm.to/opdvb47','https://sndo.ffm.to/7xa6jgx',
];

function slug(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').replace(/--+/g,'-');
}

function decodeCd(html) {
  const results = [];
  const seen = new Set();
  // Find all href with cd parameter
  const hrefRe = /href="[^"]*\bcd=([A-Za-z0-9+/=]+)"/g;
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    try {
      const cd = m[1];
      const decoded = JSON.parse(atob(cd));
      if (decoded.destUrl && decoded.srvc && !seen.has(decoded.srvc)) {
        seen.add(decoded.srvc);
        results.push({ service: decoded.srvc, url: decoded.destUrl.replace(/\\u002F/g, '/') });
      }
    } catch(e) {}
  }
  return results;
}

async function main() {
  const all = [];
  for (const url of URLS) {
    try {
      const html = await (await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}})).text();
      const title = (html.match(/<title>([^<]+)<\/title>/)?.[1]||'Unknown').replace(/ - Isaias Leal$/,'').trim();
      const plats = decodeCd(html);
      all.push({ id:slug(title)||`t${all.length+1}`, title, plats });
      console.log(`[${all.length}] ${title} » ${plats.map(p=>p.service).join(',')||'—'}`);
    } catch(e) { console.error(`ERR: ${e.message}`); }
  }
  
  const S = {
    spotify:{nome:'Spotify',cor:'#1DB954',icone:'spotify'},
    apple:{nome:'Apple Music',cor:'#FC3C44',icone:'apple'},
    amazon:{nome:'Amazon Music',cor:'#00A8E1',icone:'amazon'},
    deezer:{nome:'Deezer',cor:'#A238FF',icone:'deezer'},
    tidal:{nome:'Tidal',cor:'#000000',icone:'tidal'},
    youtube:{nome:'YouTube',cor:'#FF0000',icone:'youtube'},
    tiktoksound:{nome:'TikTok',cor:'#000000',icone:'tiktok'},
    itunes:{nome:'iTunes',cor:'#FC3C44',icone:'apple'},
  };
  
  const json = all.map(t=>({
    id:t.id, titulo:t.title, artista:'Isaias Leal',
    ano:t.plats.length?'2025':'—', publicado:!!t.plats.length,
    capa:null, cor:'#1A1D21',
    plataformas:t.plats.map(p=>{
      const m=S[p.service]; return m?{...m,url:p.url}:{nome:p.service,url:p.url,cor:'#1A1D21',icone:p.service};
    })
  }));
  console.log('\n'+JSON.stringify(json,null,2));
}
main().catch(console.error);
