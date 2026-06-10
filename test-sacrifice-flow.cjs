/**
 * TESTE — Sacrifice Flow Duelo v2.3
 * Testa o fluxo completo de sacrifício com cartas mock
 * 
 * Uso: node test-sacrifice-flow.cjs
 * (Requer npm run dev rodando)
 */

const { chromium } = require('playwright')

const BASE = 'http://localhost:5173'
const EMAIL = 'gramikgames@gmail.com'
const PASSWORD = 'Vidanerd123$'

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

async function findServer(page) {
  for (const port of [5173, 5174, 5175, 5176, 5177]) {
    try {
      await page.goto(`http://localhost:${port}`, { waitUntil: 'domcontentloaded', timeout: 3000 })
      return `http://localhost:${port}`
    } catch { continue }
  }
  return null
}

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║  TESTE FLUXO DE SACRIFÍCIO DUELO v2.3   ║')
  console.log('╚══════════════════════════════════════════╝')

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()

  const serverUrl = await findServer(page)
  if (!serverUrl) {
    console.log('❌ Nenhum servidor local encontrado!')
    await browser.close()
    return
  }
  console.log(`[✓] Servidor: ${serverUrl}`)

  // Login
  await page.goto(`${serverUrl}/login`, { waitUntil: 'networkidle' })
  await delay(1500)
  
  const emailField = page.locator('input[type="email"]').first()
  if (await emailField.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailField.fill(EMAIL)
    await page.locator('input[type="password"]').first().fill(PASSWORD)
    await delay(300)
    await page.locator('button[type="submit"], button:has-text("ENTRAR")').first().click()
    await delay(3000)
    console.log('[✓] Login OK')
  }

  // Navegar pro Duelo
  await page.goto(`${serverUrl}/games/duelo`, { waitUntil: 'networkidle' })
  await delay(2000)

  // Iniciar jogo
  const startBtn = page.locator('.duel-menu-btn')
  if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await startBtn.click({ force: true })
    await delay(1000)
    console.log('[✓] Jogo iniciado')
  }

  // Dismiss cookie banner if present
  const cookieBtn = page.locator('button:has-text("ENTENDIDO")').first()
  if (await cookieBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await cookieBtn.click({ force: true })
    await delay(300)
    console.log('[✓] Cookie banner dismissed')
  }

  // Aguardar coin toss + draw animation
  await delay(6000)

  // Aguardar até o turno do player
  let turnosEsperados = 0
  while (turnosEsperados < 30) {
    turnosEsperados++
    const phaseText = await page.locator('.duelo-phase-indicator').textContent().catch(() => '')
    
    // Verificar se game over
    const over = await page.locator('.duelo-phase-over').isVisible({ timeout: 300 }).catch(() => false)
    if (over) {
      console.log('[!] Game Over — reiniciando...')
      await page.goto(`${serverUrl}/games/duelo`, { waitUntil: 'networkidle' })
      await delay(1000)
      const btn = page.locator('.duel-menu-btn')
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click({ force: true })
        await delay(6000)
      }
      continue
    }

    const turnoText = await page.locator('.duelo-turn-indicator').textContent().catch(() => '')
    const isPlayerTurn = turnoText.includes('VOCÊ') || turnoText.includes('Você')
    
    if (!isPlayerTurn) {
      // Turno da IA — esperar
      await delay(2000)
      continue
    }

    // Dismiss cookie banner if showing
    const cb = page.locator('button:has-text("ENTENDIDO")').first()
    if (await cb.isVisible({ timeout: 200 }).catch(() => false)) {
      await cb.click({ force: true })
    }

    // ── TURNO DO PLAYER ──
    if (phaseText.includes('DESCER')) {
      // Primeiro, verificar quantos monstros temos no campo
      const playerMonsters = await page.evaluate(() => {
        const s = window.__dueloStore?.getState()
        if (!s) return 0
        let count = 0
        for (let r = 0; r < s.grid.length; r++)
          for (let c = 0; c < s.grid[0].length; c++)
            if (s.grid[r][c]?.monster?.owner === 'PLAYER') count++
        return count
      })

      console.log(`[Turno ${turnosEsperados}] Monstros no campo: ${playerMonsters}`)

      // Ver mão do jogador
      const handCards = page.locator('.duelo-hand-card')
      const handCount = await handCards.count()
      
      if (playerMonsters >= 3) {
        // Campo cheio — tentar sacrificar
        console.log('[TEST] Campo cheio! Testando fluxo de sacrifício...')
        
        // Pegar estado atual
        const state = await page.evaluate(() => {
          const s = window.__dueloStore?.getState()
          if (!s) return null
          return {
            handCount: s.playerHand.length,
            handMonsters: s.playerHand.filter(c => c.type === 'MONSTER').map(c => ({
              name: c.name, estrelas: c.estrelas, id: c.id_num
            })),
            fieldMonsters: s.grid.flat().filter(c => c?.monster?.owner === 'PLAYER').map(c => c.monster.name)
          }
        })
        
        if (state) {
          console.log(`  Mão: ${state.handCount} cartas`)
          console.log(`  Monstros na mão: ${JSON.stringify(state.handMonsters)}`)
          console.log(`  Monstros no campo: ${state.fieldMonsters}`)
        }

        // Tentar clicar em cada carta monstro da mão
        for (let i = 0; i < handCount; i++) {
          const card = handCards.nth(i)
          const cardType = await card.locator('.duelo-card-type-badge').textContent().catch(() => '')
          
          if (cardType.includes('MONSTER') || await card.textContent().then(t => t.includes('★')).catch(() => false)) {
            console.log(`[TEST] Clicando na carta ${i}...`)
            await card.click()
            await delay(800)

            // Verificar se modal de sacrifício apareceu
            const modal = page.locator('.duelo-confirm-modal-overlay')
            if (await modal.isVisible({ timeout: 1500 }).catch(() => false)) {
              const modalText = await modal.textContent().catch(() => '')
              console.log(`  Modal: ${modalText.substring(0, 120)}`)

              // Só prosseguir se tiver "SELECIONAR" (monstros suficientes)
              if (modalText.includes('SELECIONAR')) {
                console.log('[TEST] ✅ Modal de sacrifício com SELECIONAR!')
                
                // Clicar SELECIONAR
                const selectBtn = page.locator('button:has-text("SELECIONAR")')
                await selectBtn.click()
                await delay(500)
                
                // Agora clicar em monstros aliados para sacrificar
                let targetsSac = 0
                const sacNeeded = modalText.includes('3 sacrifício') ? 3 : 
                                  modalText.includes('2 sacrifício') ? 2 : 1
                console.log(`[TEST] Precisamos de ${sacNeeded} sacrifício(s)`)

                // Pegar posições dos monstros player
                const monsterPositions = await page.evaluate(() => {
                  const s = window.__dueloStore?.getState()
                  if (!s) return []
                  const positions = []
                  for (let r = 0; r < s.grid.length; r++)
                    for (let c = 0; c < s.grid[0].length; c++)
                      if (s.grid[r][c]?.monster?.owner === 'PLAYER')
                        positions.push({ row: r, col: c })
                  return positions
                })

                console.log(`[TEST] Monstros aliados encontrados: ${monsterPositions.length}`)

                for (let s = 0; s < Math.min(sacNeeded, monsterPositions.length); s++) {
                  const idx = monsterPositions[s].row * 10 + monsterPositions[s].col
                  console.log(`[TEST] Clicando em monstro em [${monsterPositions[s].row},${monsterPositions[s].col}] (idx ${idx})`)
                  
                  // Clicar na célula do monstro
                  const cells = page.locator('.duelo-grid-cell')
                  await cells.nth(idx).click()
                  await delay(800)

                  // Verificar se modal de confirmação final apareceu
                  const confirmModal = page.locator('button:has-text("SIM, SACRIFICAR")')
                  if (await confirmModal.isVisible({ timeout: 1000 }).catch(() => false)) {
                    console.log('[TEST] ✅ Modal CONFIRMAR SACRIFÍCIO apareceu!')
                    
                    // Verificar estado ANTES de confirmar
                    const beforeState = await page.evaluate(() => {
                      const s = window.__dueloStore?.getState()
                      if (!s) return null
                      const playerMons = s.grid.flat().filter(c => c?.monster?.owner === 'PLAYER')
                      return {
                        playerMonstersCount: playerMons.length,
                        playerMonsters: playerMons.map(m => m.monster.name),
                        sacrificeTargets: s.sacrificeTargets.map(t => t.card.name),
                        handCount: s.playerHand.length,
                      }
                    })
                    console.log(`  ANTES: ${JSON.stringify(beforeState)}`)

                    // CONFIRMAR sacrifício
                    await confirmModal.click()
                    await delay(1000)

                    // Verificar estado DEPOIS
                    const afterState = await page.evaluate(() => {
                      const s = window.__dueloStore?.getState()
                      if (!s) return null
                      const playerMons = s.grid.flat().filter(c => c?.monster?.owner === 'PLAYER')
                      return {
                        playerMonstersCount: playerMons.length,
                        playerMonsters: playerMons.map(m => m.monster.name),
                        handCount: s.playerHand.length,
                        waitingForGridTarget: s.waitingForGridTarget,
                        selectedHandCard: s.selectedHandCard?.name || null,
                        confirmSacrifice: s.confirmSacrifice,
                      }
                    })
                    console.log(`  DEPOIS: ${JSON.stringify(afterState)}`)

                    // Verificar se o monstro INVOCADO está no campo
                    if (afterState) {
                      const cardName = (await page.evaluate(() => {
                        const s = window.__dueloStore?.getState()
                        return s?.selectedHandCard?.name || 'NO_CARD'
                      }))
                      
                      console.log(`  Card esperado no campo: `)
                      
                      // Checar se o monstro sumiu e o novo apareceu
                      const allMonsterNames = await page.evaluate(() => {
                        const s = window.__dueloStore?.getState()
                        if (!s) return []
                        return s.grid.flat()
                          .filter(c => c?.monster)
                          .map(c => c.monster.name)
                      })
                      console.log(`  Monstros no campo agora: ${allMonsterNames}`)
                    }

                    targetsSac = sacNeeded
                    break
                  }
                }

                if (targetsSac < sacNeeded) {
                  console.log(`[⚠️] Não completou sacrifício (${targetsSac}/${sacNeeded})`)
                } else {
                  console.log('[✓] Sacrifício completo!')
                }
                
                // Cancelar carta para não atrapalhar
                const cancelBtn = page.locator('button:has-text("CANCELAR CARTA")')
                if (await cancelBtn.isVisible({ timeout: 500 }).catch(() => false)) {
                  await cancelBtn.click()
                  await delay(300)
                }

              } else if (modalText.includes('VOLTAR') && modalText.includes('apenas')) {
                console.log('[TEST] ⚠️ Sacrifício insuficiente — cancelando')
                const voltarBtn = page.locator('button:has-text("VOLTAR")')
                await voltarBtn.click()
                await delay(300)
              } else if (modalText.includes('CANCELAR') && !modalText.includes('SELECIONAR')) {
                const cancelBtn = page.locator('button:has-text("CANCELAR")')
                await cancelBtn.click()
                await delay(300)
              }
              
              // Sair do loop de cartas
              break
            }
          }
        }
      } else if (playerMonsters < 3) {
        // Tem espaço — tentar colocar monstro
        // Procurar monstro na mão
        for (let i = 0; i < handCount; i++) {
          const card = handCards.nth(i)
          const text = await card.textContent()
          if (text.includes('★') || text.includes('⚔️')) {
            await card.click()
            await delay(600)
            
            const modal = page.locator('.duelo-confirm-modal-overlay')
            if (await modal.isVisible({ timeout: 1000 }).catch(() => false)) {
              const modalText = await modal.textContent()
              if (modalText.includes('DESCER') || modalText.includes('Descer')) {
                const descerBtn = page.locator('button:has-text("DESCER")')
                await descerBtn.click()
                await delay(400)
                
                // Clicar na primeira célula vazia
                const emptyIdx = await page.evaluate(() => {
                  const s = window.__dueloStore?.getState()
                  if (!s) return -1
                  for (let r = 0; r < s.grid.length; r++)
                    for (let c = 0; c < s.grid[0].length; c++)
                      if (!s.grid[r][c].monster) return r * 10 + c
                  return -1
                })
                
                if (emptyIdx >= 0) {
                  const cells = page.locator('.duelo-grid-cell')
                  await cells.nth(emptyIdx).click()
                  await delay(500)
                  console.log(`[✓] Monstro colocado em [${Math.floor(emptyIdx/10)},${emptyIdx%10}]`)
                }
              }
              break
            }
          }
        }
      }
    }

    // Avançar fase ou encerrar turno
    const nextBtn = page.locator('button:has-text("PRÓXIMA FASE"), button:has-text("ENCERRAR TURNO")').first()
    if (await nextBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await nextBtn.click({ force: true })
      await delay(500)
    }

    // Esperar IA
    await delay(2000)
  }

  // Relatório final
  const finalState = await page.evaluate(() => {
    const s = window.__dueloStore?.getState()
    if (!s) return null
    const playerMons = s.grid.flat().filter(c => c?.monster?.owner === 'PLAYER')
    return {
      turnNumber: s.turnNumber,
      playerLP: s.playerLP,
      aiLP: s.aiLP,
      playerMonsters: playerMons.map(m => m.monster.name),
      playerMonstersCount: playerMons.length,
      playerHandCount: s.playerHand.length,
    }
  })

  console.log('\n══════════════════════════════════════════')
  console.log('         RELATÓRIO FINAL')
  console.log('══════════════════════════════════════════')
  console.log(`Estado final: ${JSON.stringify(finalState, null, 2)}`)
  console.log('══════════════════════════════════════════')

  await browser.close()
}

main().catch(err => {
  console.error('❌ ERRO:', err.message)
  process.exit(1)
})
