import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport:{ width:390, height:900 }, deviceScaleFactor:2 })
const errs=[]; p.on('console',m=>m.type()==='error'&&errs.push(m.text()))
const skip = async()=>{ const s=await p.$('.neoguide-skip'); if(s){await s.click();await p.waitForTimeout(400)} }
const criar = async(n)=>{ await skip()
  const bs=await p.$$('.gang-new-sheet'); if(bs.length){ await bs[bs.length-1].click(); await p.waitForTimeout(900); await skip() }
  if (!await p.$('.gc-name-input')) return false
  await p.fill('.gc-name-input', n)
  const c=await p.$$('.gc-loadout-card:not([disabled])'); await c[0].click(); await p.waitForTimeout(250)
  await p.click('.gc-btn-salvar'); await p.waitForTimeout(800); await skip()
  for(let i=0;i<5;i++){const b2=await p.$$('.gc-attr-btn'); await b2[i<2?5:1].click(); await p.waitForTimeout(100)}
  await p.click('.gc-btn-salvar'); await p.waitForTimeout(1200); return true }

await p.goto('http://localhost:4201/games/ldi-gangues', { waitUntil:'domcontentloaded' })
await p.evaluate(()=>{ localStorage.setItem('ldi-intro-day','x')
  localStorage.setItem('ldi-gangues-tutorial-paths-seen','1'); localStorage.setItem('ldi-gangues-tutorial-attrs-seen','1') })
await p.reload({ waitUntil:'networkidle' }); await p.waitForTimeout(2400)
await criar('Kim'); await criar('Nina'); await skip()

// seleciona so os que estao com "+"
for (let i=0;i<4;i++){
  const alvo = await p.$('.gang-sheet-card-v:has-text("+")')
  const btn = await p.$('button:has-text("INICIAR BATALHA")')
  if (btn && await btn.isEnabled()) break
  if (alvo) { await alvo.click(); await p.waitForTimeout(400) } else break
}
const btn = await p.$('button:has-text("INICIAR BATALHA")')
console.log('iniciar habilitado:', btn ? await btn.isEnabled() : 'ausente')
await btn.click(); await p.waitForTimeout(1600); await skip()
if (!await p.$('.gang-combat')) { const o=await p.$('.gang-sheet-card-v'); if(o){await o.click(); await p.waitForTimeout(1600); await skip()} }
console.log('em combate:', await p.evaluate(()=>!!document.querySelector('.gang-combat')))

let dadoOk=false
for (let i=0;i<70;i++){
  if (!dadoOk && await p.$('.dramatic-dice-attacker')) {
    await p.waitForTimeout(1800)
    const d = await p.evaluate(()=>({a:document.querySelector('.dramatic-dice-attacker')?.textContent.trim(),
      v:document.querySelector('.dramatic-dice-vs')?.textContent.trim(),
      imp:!!document.querySelector('.dramatic-dice-impacto'), onda:!!document.querySelector('.dramatic-dice-shockwave')}))
    if(d.a){ console.log(`DADO: "${d.a}" | ${d.v} | impacto:${d.imp} onda:${d.onda}`)
      await p.screenshot({path:process.argv[2]+'/gangues-dado.png'}); dadoOk=true }
  }
  if (await p.$('.gang-fala-final')) {
    const f = await p.evaluate(()=>({n:document.querySelector('.gang-fala-final-nome')?.textContent,
      s:document.querySelector('.gang-fala-final-selo')?.textContent,
      t:document.querySelector('.gang-fala-final-texto')?.textContent,
      res:!!document.querySelector('.gang-match-result')}))
    console.log(`\nFALA: ${f.n} [${f.s||'—'}] ${f.t}`)
    console.log(`  resultado apareceu junto? ${f.res}  (esperado: false)`)
    await p.screenshot({path:process.argv[2]+'/gangues-fala.png'})
    await p.waitForTimeout(3000)
    console.log('  apos a pausa, tela de resultado:', await p.evaluate(()=>!!document.querySelector('.gang-match-result')))
    break
  }
  const bt = await p.$('button:has-text("ATACAR"), .gang-action-attack')
  if (bt && await bt.isEnabled().catch(()=>false)) await bt.click().catch(()=>{})
  await p.waitForTimeout(600)
}
console.log('\nerros:', errs.length)
await b.close()
