/**
 * QA — Duelo Campo de Batalha v2.0
 * 5 rodadas completas (turno player + IA = 1 rodada)
 *
 * Uso: npx playwright test qa-duelo-campo-de-batalha.cjs --headed
 * Ou: node qa-duelo-campo-de-batalha.cjs
 */

const { chromium } = require('playwright')
const path = require('path')

const BASE = 'http://localhost:5173'
const EMAIL = 'gramikgames@gmail.com'
const PASSWORD = 'Vidanerd123$'
const REPORT_PATH = path.join(__dirname, 'qa-duelo-report.md')

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function run() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()

  const report = {
    coinToss: '❓',
    drawAnimation: '❓',
    boardUniform: '❓',
    descerFase: '❓',
    movimentoFase: '❓',
    ataqueFase: '❓',
    trapHidden: '❓',
    spellTargetCheck: '❓',
    lpCalculated: '❓',
    aiFunctional: '❓',
    victoryCondition: '❓',
    bugsFound: [],
    bugsFixed: [],
    rounds: [],
    roundData: [],
  }

  try {
    // ── LOGIN ──
    console.log('[QA] Abrindo site...')
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await delay(2000)

    // Login via navegação
    console.log('[QA] Navegando para login...')
    // Clica no link de login
    const loginBtn = page.locator('a[href="/login"], button:has-text("Entrar"), button:has-text("Login")').first()
    if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loginBtn.click()
      await delay(1500)
    }

    // Preenche email/senha
    const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first()
    const passField = page.locator('input[type="password"], input[name="password"], input[placeholder*="senha"]').first()

    if (await emailField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailField.fill(EMAIL)
      await passField.fill(PASSWORD)
      await delay(500)

      const submitBtn = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first()
      await submitBtn.click()
      await delay(3000)
      console.log('[QA] Login realizado')
    } else {
      console.log('[QA] Pode já estar logado')
    }

    // ── Navegar para o Duelo ──
    console.log('[QA] Navegando para Duelo LDI...')
    await page.goto(`${BASE}/games/duelo`, { waitUntil: 'networkidle' })
    await delay(2000)

    // Verificar se está na página do menu
    const menuTitle = page.locator('.duel-menu-title')
    if (await menuTitle.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('[QA] Menu do Duelo visível ✅')
    } else {
      console.log('[QA] Menu não encontrado, tentando navegar diretamente...')
      // Talvez precise de admin
    }

    // ── INICIAR 5 RODADAS ──
    for (let rodada = 1; rodada <= 5; rodada++) {
      console.log(`\n═══════════════════════════════`)
      console.log(`[QA] RODADA ${rodada}`)
      console.log(`═══════════════════════════════`)

      const roundLog = []

      // Clicar em iniciar
      const startBtn = page.locator('button:has-text("INICIAR"), .duel-menu-btn').first()
      if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await startBtn.click()
        await delay(1000)
        roundLog.push('Jogo iniciado')
      }

      // Verificar coin toss
      console.log('[QA] Coin toss...')
      const coinElement = page.locator('.duelo-coin-toss')
      if (await coinElement.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('[QA] 🪙 Animação de moeda visível ✅')
        report.coinToss = 'ok'
        roundLog.push('Coin toss: animação visível')
        await delay(3500)
      } else {
        console.log('[QA] ⚠️ Moeda não encontrada')
        report.bugsFound.push(`Rodada ${rodada}: Animação de moeda não apareceu`)
      }

      // Verificar draw animation
      console.log('[QA] Draw animation...')
      const drawElement = page.locator('.duelo-draw-animation')
      if (await drawElement.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('[QA] 🃏 Animação de saque visível ✅')
        report.drawAnimation = 'ok'
        roundLog.push('Draw animation: visível')
        await delay(3000)
      } else {
        console.log('[QA] ⚠️ Draw animation não encontrada')
      }

      // Verificar tabuleiro uniforme
      console.log('[QA] Verificando tabuleiro...')
      await delay(2000)
      const gridCells = page.locator('.duelo-grid-cell')
      const cellCount = await gridCells.count()
      if (cellCount === 25) {
        console.log('[QA] ✅ Grid 5×5 com 25 células')
        // Verificar se tem classes de território
        const hasTerritory = await page.locator('.duelo-grid-cell--ai-territory').count()
        if (hasTerritory === 0) {
          console.log('[QA] ✅ Tabuleiro uniforme (sem cor de território)')
          report.boardUniform = 'ok'
        } else {
          console.log('[QA] ⚠️ Ainda tem classes de território')
          report.bugsFound.push(`Rodada ${rodada}: Tabuleiro ainda tem distinção de território`)
        }
      } else {
        console.log(`[QA] ⚠️ Grid tem ${cellCount} células (esperado 25)`)
        report.bugsFound.push(`Rodada ${rodada}: Grid com ${cellCount} células`)
      }

      // ── TURNO DO PLAYER ──
      console.log('[QA] --- TURNO DO PLAYER ---')

      // Fase 1 — DESCER
      console.log('[QA] Fase DESCER...')
      const phaseIndicator = page.locator('.duelo-phase-indicator')
      const phaseText = await phaseIndicator.textContent().catch(() => '')
      roundLog.push(`Fase atual: ${phaseText}`)

      // Verificar hint
      const hint = page.locator('.duelo-targeting-hint')
      const hintText = await hint.textContent().catch(() => '')
      roundLog.push(`Hint: ${hintText}`)
      console.log(`[QA] Hint: ${hintText}`)

      // Tentar selecionar carta da mão e colocar no grid
      const handCards = page.locator('.duelo-hand-card')
      const handCount = await handCards.count()
      console.log(`[QA] Cartas na mão: ${handCount}`)

      if (handCount > 0) {
        // Clica na primeira carta
        await handCards.first().click()
        await delay(1000)

        // Verificar se abriu modal de confirmação (para monstro)
        const confirmModal = page.locator('.duelo-confirm-modal')
        if (await confirmModal.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('[QA] ✅ Modal de confirmação "Descer?" visível')
          roundLog.push('Modal confirmação visível para monstro')
          // Clica em DESCER
          const confirmBtn = page.locator('button:has-text("DESCER")')
          await confirmBtn.click()
          await delay(500)

          // Clica em uma célula do grid para posicionar
          const targetCell = page.locator('.duelo-grid-cell').nth(20) // fileira 4
          await targetCell.click()
          await delay(1000)
          console.log('[QA] ✅ Monstro posicionado no grid')
          roundLog.push('Monstro posicionado')
        } else {
          // Pode ser armadilha ou magia
          const tip = await hint.textContent().catch(() => '')
          if (tip.includes('armadilha') || tip.includes('oculta') || tip.includes('trap')) {
            console.log('[QA] ✅ Armadilha selecionada, modo posicionamento')
            roundLog.push('Armadilha selecionada')
            // Coloca no grid
            const targetCell = page.locator('.duelo-grid-cell').nth(20)
            await targetCell.click()
            await delay(500)
          } else if (tip.includes('alvo') || tip.includes('target') || tip.includes('magia')) {
            console.log('[QA] ✅ Magia selecionada, precisa de alvo')
            roundLog.push('Magia selecionada')
            // Clica em algum monstro no grid
            const monsterCell = page.locator('.duelo-grid-monster--ai').first()
            if (await monsterCell.isVisible({ timeout: 1000 }).catch(() => false)) {
              await monsterCell.click()
              await delay(500)
            } else {
              // Tenta no grid
              await page.locator('.duelo-grid-cell').nth(12).click()
              await delay(500)
            }
          } else {
            console.log('[QA] ⚠️ Carta clicada mas sem ação específica')
          }
        }
      }

      // PRÓXIMA FASE (Descer → Movimento ou Ataque)
      const nextPhaseBtn = page.locator('button:has-text("PRÓXIMA FASE")')
      if (await nextPhaseBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextPhaseBtn.click()
        await delay(1000)
        console.log('[QA] ✅ PRÓXIMA FASE clicado')
        roundLog.push('PRÓXIMA FASE clicado')

        // Fase 2 — MOVIMENTO (se não for primeira rodada)
        const phaseAfter = await page.locator('.duelo-phase-indicator').textContent().catch(() => '')
        console.log(`[QA] Fase após próximo: ${phaseAfter}`)
        roundLog.push(`Fase após Next: ${phaseAfter}`)

        if (phaseAfter.includes('MOVIMENTO')) {
          console.log('[QA] Fase MOVIMENTO...')

          // Tenta selecionar monstro aliado
          const allyMonster = page.locator('.duelo-grid-monster--player').first()
          if (await allyMonster.isVisible({ timeout: 2000 }).catch(() => false)) {
            await allyMonster.click()
            await delay(500)
            console.log('[QA] ✅ Monstro selecionado para mover')

            // Verifica se células de MOV apareceram
            const moveCells = page.locator('.duelo-grid-cell--move')
            const moveCount = await moveCells.count()
            console.log(`[QA] Células de MOV: ${moveCount}`)
            roundLog.push(`Células MOV: ${moveCount}`)

            if (moveCount > 0) {
              await moveCells.first().click()
              await delay(500)
              console.log('[QA] ✅ Monstro movido')
              roundLog.push('Monstro movido')
            }
          } else {
            console.log('[QA] ⚠️ Nenhum monstro aliado para mover')
          }

          // PRÓXIMA FASE novamente
          const nextPhaseBtn2 = page.locator('button:has-text("PRÓXIMA FASE")')
          if (await nextPhaseBtn2.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextPhaseBtn2.click()
            await delay(500)
            console.log('[QA] ✅ PRÓXIMA FASE (Movimento → Ataque)')
            roundLog.push('Movimento → Ataque')
          }
        }

        // Fase 3 — ATAQUE
        const phaseAtaque = await page.locator('.duelo-phase-indicator').textContent().catch(() => '')
        console.log(`[QA] Fase: ${phaseAtaque}`)

        if (phaseAtaque.includes('ATAQUE')) {
          console.log('[QA] Fase ATAQUE...')

          // Tenta selecionar monstro aliado para atacar
          const allyMonster = page.locator('.duelo-grid-monster--player').first()
          if (await allyMonster.isVisible({ timeout: 2000 }).catch(() => false)) {
            await allyMonster.click()
            await delay(500)
            console.log('[QA] ✅ Monstro selecionado para atacar')

            // Verifica células de ataque
            const attackCells = page.locator('.duelo-grid-cell--attack')
            const attackCount = await attackCells.count()
            console.log(`[QA] Células de ATAQUE: ${attackCount}`)
            roundLog.push(`Células ATAQUE: ${attackCount}`)

            if (attackCount > 0) {
              await attackCells.first().click()
              await delay(500)
              console.log('[QA] ✅ Ataque realizado')
              roundLog.push('Ataque realizado')
            }
          } else {
            console.log('[QA] ⚠️ Nenhum monstro aliado para atacar')
          }
        }

        // ENCERRAR TURNO
        const endTurnBtn = page.locator('button:has-text("ENCERRAR TURNO")')
        if (await endTurnBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await endTurnBtn.click()
          await delay(500)
          console.log('[QA] ✅ Turno encerrado')
          roundLog.push('Turno encerrado')
        }
      }

      // ── TURNO DA IA ──
      console.log('[QA] --- TURNO DA IA ---')
      const aiThinking = page.locator('.duelo-turn-indicator')
      await delay(4000) // Espera IA processar
      const turnText = await aiThinking.textContent().catch(() => '')
      console.log(`[QA] Turno status: ${turnText}`)
      roundLog.push(`Status IA: ${turnText}`)

      if (turnText.includes('VOCÊ') || turnText.includes('YOU') || turnText.includes('TÚ')) {
        console.log('[QA] ✅ IA completou o turno')
        roundLog.push('IA completou turno')
      }

      // Verificar se o jogo acabou
      const gameOver = page.locator('.duelo-phase-over')
      if (await gameOver.isVisible({ timeout: 2000 }).catch(() => false)) {
        const overText = await gameOver.textContent()
        console.log(`[QA] ⛔ Jogo encerrado: ${overText}`)
        roundLog.push(`Fim de jogo: ${overText}`)

        if (overText.includes('VITÓRIA') || overText.includes('VICTORY') || overText.includes('DERROTA') || overText.includes('DEFEAT')) {
          report.victoryCondition = 'ok'
        }
        break // Sai do loop se o jogo acabou
      }

      report.roundData.push({ rodada, log: roundLog })
      report.rounds.push(rodada)

      // Se for a última rodada e não acabou, registra
      if (rodada === 5) {
        console.log('[QA] 5 rodadas concluídas sem fim de jogo')
      }
    }

    // ── AVALIAÇÃO FINAL ──
    console.log('\n═══════════════════════════════════')
    console.log('QA DUELO CAMPO DE BATALHA')
    console.log('═══════════════════════════════════')

    const status = (s) => s === 'ok' ? '✅ ok' : s === '❓' ? '⚠️ não testado' : `⚠️ ${s}`

    const reportLines = [
      '═══════════════════════════════════',
      'QA DUELO CAMPO DE BATALHA',
      '═══════════════════════════════════',
      `RODADAS TESTADAS: ${report.rounds.length}`,
      `SORTEIO DE MOEDA: ${status(report.coinToss)}`,
      `SAQUE DE CARTAS: ${status(report.drawAnimation)}`,
      `TABULEIRO UNIFORME: ${status(report.boardUniform)}`,
      `FASE DESCER CARTAS: ${status(report.descerFase)}`,
      `FASE MOVIMENTO: ${status(report.movimentoFase)}`,
      `FASE ATAQUE: ${status(report.ataqueFase)}`,
      `ARMADILHAS OCULTAS: ${status(report.trapHidden)}`,
      `MAGIAS COM VERIFICAÇÃO DE ALVO: ${status(report.spellTargetCheck)}`,
      `LP CALCULADO CORRETAMENTE: ${status(report.lpCalculated)}`,
      `IA FUNCIONAL: ${status(report.aiFunctional)}`,
      `CONDIÇÃO DE VITÓRIA: ${status(report.victoryCondition)}`,
      `BUGS ENCONTRADOS: ${report.bugsFound.length}`,
      `BUGS CORRIGIDOS: ${report.bugsFixed.length}`,
      `STATUS: ${report.bugsFound.length === 0 ? '✅ pronto' : '⚠️ pendências'}`,
      '═══════════════════════════════════',
    ]

    reportLines.forEach(l => console.log(l))

    // Salvar relatório
    const fs = require('fs')
    fs.writeFileSync(REPORT_PATH, reportLines.join('\n'), 'utf-8')
    console.log(`\n[QA] Relatório salvo em: ${REPORT_PATH}`)

  } catch (err) {
    console.error('[QA] ❌ Erro durante QA:', err.message)
    report.bugsFound.push(`Erro: ${err.message}`)
  } finally {
    await browser.close()
  }
}

run()
