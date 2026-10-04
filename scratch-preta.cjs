const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const erros = []; p.on('response', r => r.status() >= 400 && erros.push('HTTP ' + r.status() + ' ' + r.url())); p.on('pageerror', e => erros.push('PAGE ' + e.message)); p.on('console', m => m.type() === 'error' && erros.push('CON ' + m.text()));
  for (const url of [process.argv[2] + '/games/ldi', process.argv[2] + '/games/ldi/jogo', process.argv[2] + '/games']) {
    erros.length = 0
    await p.goto(url, { waitUntil: 'networkidle' }).catch(e => erros.push('NAV ' + e.message)); await p.waitForTimeout(5000);
    const txt = (await p.locator('#root').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200);
    console.log(url, '\n  texto:', txt, '\n  erros:', erros.slice(0, 5));
  }
  await b.close();
})();
