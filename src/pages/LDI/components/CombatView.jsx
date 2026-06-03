import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Onomatopeia, DiceRollDisplay, ScreenFlash } from './DiceRoll'
import { checkNearDeath } from '../engine/character'

const FRASES_INIMIGO = {
  stormbyte_91: [
    "Novato no LDI é tudo igual. Carne fresca.",
    "Rank zero. Isso explica tudo.",
    "Vai chorar pra sua mamãe desligar o SBI?",
    "Nem registrei esse ataque no meu histórico.",
    "Você nem deveria estar aqui.",
    "Já vi uns 500 como você. Todos caíram no primeiro round.",
    "Desiste. O LDI não foi feito para fracos.",
  ],
  kaeda: [
    "O sistema me alimenta. Você me alimenta.",
    "Você é só mais um pixel no meu feed.",
    "Já esqueci seu nome. O algoritmo não registra lixo.",
    "Dados são a única coisa real. E você é só ruído.",
    "A rede não perdoa. E eu sou a rede.",
    "Cada batida sua aqui dentro vira informação. Obrigado.",
  ],
  ghostpulse: [
    "Você não deveria ter vindo aqui. Ninguém devia.",
    "As pessoas somem neste nível do LDI. Você sabia?",
    "Você ouviu isso? Não? Exato. É o som do nada.",
    "Não há saída. Só o reset infinito.",
    "Eu tentei avisar os outros. Ninguém me escuta mais.",
    "A escuridão aqui tem fome. E você acabou de chegar.",
  ],
  ironveil: [
    "Especificação: oponente classificado como irrelevante.",
    "Cálculo de dano concluído. Chance de vitória: 0,02%.",
    "Você é um erro de sistema. E eu sou a correção.",
    "Escaneamento completo. Nenhuma ameaça detectada.",
    "Protocolo de eliminação ativado. Motivo: você existe.",
    "Iron Veil não falha. Iron Veil não sente. Iron Veil executa.",
  ],
  null_entity: [
    "...",
    "VOCÊ NÃO DEVERIA ESTAR AQUI.",
    "ANOMALIA DETECTADA. INICIANDO PROTOCOLO DE PURGA.",
    "NULL_ENTITY não reconhece sua assinatura digital.",
    "SUA EXISTÊNCIA NESTE NÍVEL É UM ERRO.",
    "O VAZIO TE OBSERVA DE VOLTA.",
  ],
  default: [
    "Isso foi só o aquecimento.",
    "Você está perdendo tempo meu.",
    "Patético.",
    "Não me faça rir — ah, você já me fez.",
    "O LDI não precisa de perdedores.",
    "Você veio até aqui para isso? Que decepção.",
  ],
}

const MODE_ICONS = { fists: '✊', armed: '⚔️', power: '⚡' }
const MODE_LABELS = { fists: 'Mãos Livres', armed: 'Armado', power: 'Poder' }

export default function CombatView({
  sheet,
  save,
  combat,
  onAttack,
  onEnemyAttack,
  onSelectMode,
  onEndCombat,
  onFlee,
  selectedPowers = [],
  availablePowers = [],
}) {
  const [showOnomatopeia, setShowOnomatopeia] = useState(null)
  const [flashRed, setFlashRed] = useState(false)
  const [playerDice, setPlayerDice] = useState(null)
  const [enemyDice, setEnemyDice] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [damageNumber, setDamageNumber] = useState(null)
  const [showEnemyTurnOverlay, setShowEnemyTurnOverlay] = useState(false)
  const logEndRef = useRef(null)

  const pvMax = (sheet?.attributes?.R || 0) * 5 || 1
  const pmMax = (sheet?.attributes?.PdF || 0) * 4 || 2
  const [playerPv, setPlayerPv] = useState(save?.pv_current ?? pvMax)
  useEffect(() => {
    if (save?.pv_current !== undefined) setPlayerPv(save.pv_current)
  }, [save?.pv_current])
  const pvPct = Math.max(0, (playerPv / pvMax) * 100)
  const enemyPvMax = combat.enemy?.pv_max || 1
  const enemyPvPct = Math.max(0, ((combat.enemy?.pv_current ?? enemyPvMax) / enemyPvMax) * 100)
  const nearDeath = checkNearDeath(sheet, playerPv)
  const isNearDeath = playerPv <= (sheet?.attributes?.R || 0)
  const pmCurrent = save?.pm_current ?? pmMax

  const log = combat.log || []
  const visibleLog = log.slice(-10)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [log.length])

  const handleAttack = async () => {
    if (animating) return
    setAnimating(true)

    setShowOnomatopeia({ mode: combat.playerMode, critical: false })
    const result = onAttack()
    if (result) {
      setPlayerDice({ result: result.fa, success: result.damage > 0 })
      if (result.damage > 0) setDamageNumber({ value: result.damage, target: 'enemy', x: 60, y: 20 })
    }

    await new Promise(r => setTimeout(r, 800))

    if (result?.defeated) {
      setShowOnomatopeia(null)
      setAnimating(false)
      handleEndCombat('victory')
      return
    }

    setShowOnomatopeia(null)
    setPlayerDice(null)
    setDamageNumber(null)

    // Dramatic pause - VEZ DO INIMIGO
    combat.addLog({
      type: 'enemy_turn',
      text: `=== VEZ DO INIMIGO ===`,
    })
    setShowEnemyTurnOverlay(true)
    await new Promise(r => setTimeout(r, 1500))
    setShowEnemyTurnOverlay(false)

    setFlashRed(true)
    setShowOnomatopeia({ mode: combat.enemy?.preferred_mode || 'fists', critical: false })
    const enemyResult = onEnemyAttack()
    if (enemyResult) {
      setEnemyDice({ result: enemyResult.fa, success: enemyResult.damage > 0 })
      if (enemyResult.damage > 0) {
        setDamageNumber({ value: enemyResult.damage, target: 'player', x: 20, y: 20 })
        const newPv = Math.max(0, playerPv - enemyResult.damage)
        setPlayerPv(newPv)
        const enemyId = combat.enemy?.id || 'default'
        const frases = FRASES_INIMIGO[enemyId] || FRASES_INIMIGO.default
        const frase = frases[Math.floor(Math.random() * frases.length)]
        combat.addLog({
          type: 'taunt',
          text: `<span class="ldi-log-taunt-name">${combat.enemy.name}:</span> ${frase}`,
        })
        if (newPv <= 0) {
          await new Promise(r => setTimeout(r, 1200))
          setShowOnomatopeia(null)
          setFlashRed(false)
          setAnimating(false)
          handleEndCombat('defeat')
          return
        }
      }
    }

    await new Promise(r => setTimeout(r, 800))
    setShowOnomatopeia(null)
    setFlashRed(false)
    setPlayerDice(null)
    setEnemyDice(null)
    setDamageNumber(null)
    setAnimating(false)
  }

  const handleAttackWithPower = async (power) => {
    if (animating || pmCurrent < (power.cost || 1)) return
    setAnimating(true)

    combat.addLog({
      type: 'attack',
      text: `Você usou ${power.name}! ⚡${power.cost} PM`,
    })

    setShowOnomatopeia({ mode: 'power', critical: false })
    const result = onAttack()
    if (result) {
      setPlayerDice({ result: result.fa, success: result.damage > 0 })
      if (result.damage > 0) setDamageNumber({ value: result.damage + 1, target: 'enemy', x: 60, y: 20 })
    }

    await new Promise(r => setTimeout(r, 800))

    if (result?.defeated) {
      setShowOnomatopeia(null)
      setAnimating(false)
      handleEndCombat('victory')
      return
    }

    setShowOnomatopeia(null)
    setPlayerDice(null)
    setDamageNumber(null)

    combat.addLog({
      type: 'enemy_turn',
      text: `=== VEZ DO INIMIGO ===`,
    })
    setShowEnemyTurnOverlay(true)
    await new Promise(r => setTimeout(r, 1500))
    setShowEnemyTurnOverlay(false)

    setFlashRed(true)
    setShowOnomatopeia({ mode: combat.enemy?.preferred_mode || 'fists', critical: false })
    const enemyResult = onEnemyAttack()
    if (enemyResult) {
      setEnemyDice({ result: enemyResult.fa, success: enemyResult.damage > 0 })
      if (enemyResult.damage > 0) {
        setDamageNumber({ value: enemyResult.damage, target: 'player', x: 20, y: 20 })
        const newPv = Math.max(0, playerPv - enemyResult.damage)
        setPlayerPv(newPv)
        const enemyId = combat.enemy?.id || 'default'
        const frases = FRASES_INIMIGO[enemyId] || FRASES_INIMIGO.default
        const frase = frases[Math.floor(Math.random() * frases.length)]
        combat.addLog({
          type: 'taunt',
          text: `<span class="ldi-log-taunt-name">${combat.enemy.name}:</span> ${frase}`,
        })
        if (newPv <= 0) {
          await new Promise(r => setTimeout(r, 1200))
          setShowOnomatopeia(null)
          setFlashRed(false)
          setAnimating(false)
          handleEndCombat('defeat')
          return
        }
      }
    }

    await new Promise(r => setTimeout(r, 800))
    setShowOnomatopeia(null)
    setFlashRed(false)
    setPlayerDice(null)
    setEnemyDice(null)
    setDamageNumber(null)
    setAnimating(false)
  }

  const handleEndCombat = (result) => {
    onEndCombat(result)
  }

  if (!combat.active || !combat.enemy) return null

  const playerEntries = ['attack', 'power']
  const enemyEntries = ['enemy_attack']
  const isPlayerLog = (type) => playerEntries.includes(type)
  const isEnemyLog = (type) => enemyEntries.includes(type)

  return (
    <div className="ldi-combat">
      {flashRed && <ScreenFlash color="red" intensity={0.4} duration={300} />}
      {nearDeath && <div className="ldi-vignette ldi-vignette--pulse" />}

      <AnimatePresence>
        {showOnomatopeia && (
          <Onomatopeia
            key={Date.now()}
            mode={showOnomatopeia.mode}
            critical={showOnomatopeia.critical}
            onDone={() => {}}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEnemyTurnOverlay && (
          <motion.div
            className="ldi-enemy-turn-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              className="ldi-enemy-turn-text"
              animate={{ opacity: [1, 0.2, 1, 0.2, 1] }}
              transition={{ duration: 1.5, repeat: 0 }}
            >
              === VEZ DO INIMIGO ===
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ldi-combat-grid">
        <div className="ldi-combat-player">
          <h3 className="ldi-combat-name">{sheet?.sheet_name || 'Você'}</h3>

          <div className="ldi-combat-hp-bar">
            <div className="ldi-combat-hp-label">
              <span>PV</span>
              <span>{playerPv}/{pvMax}</span>
            </div>
            <motion.div
              className="ldi-combat-hp-track"
              animate={nearDeath ? { x: [-2, 2, -2, 2, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className={`ldi-combat-hp-fill ${pvPct <= 30 ? 'ldi-hp--danger' : pvPct <= 60 ? 'ldi-hp--warning' : 'ldi-hp--safe'}`}
                initial={false}
                animate={{ width: `${pvPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </motion.div>
          </div>

          <div className="ldi-combat-pm-bar">
            <span className="ldi-combat-pm-label">PM</span>
            <div className="ldi-combat-pm-icons">
              {Array.from({ length: pmMax }, (_, i) => (
                <motion.span
                  key={i}
                  className={`ldi-pm-icon ${i < pmCurrent ? 'ldi-pm-icon--active' : ''}`}
                  initial={false}
                  animate={i === pmCurrent ? { scale: [1, 0.5, 0], opacity: [1, 0.5, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >◆</motion.span>
              ))}
            </div>
          </div>

          <div className="ldi-combat-mode">
            <span className="ldi-combat-mode-label">Modo:</span>
            <span className="ldi-combat-mode-value">{MODE_ICONS[combat.playerMode]} {MODE_LABELS[combat.playerMode]}</span>
          </div>

          <div className="ldi-combat-powers">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className={`ldi-power-star ${i < combat.powersUsed ? 'ldi-power-star--used' : 'ldi-power-star--active'}`}>
                ★
              </span>
            ))}
          </div>

          {isNearDeath && (
            <motion.div
              className="ldi-near-death-badge"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ⚠ PERTO DA MORTE
            </motion.div>
          )}
        </div>

        <div className="ldi-combat-log ldi-combat-log--whatsapp">
          <div className="ldi-combat-log-feed">
            {visibleLog.map((entry, i) => {
              if (entry.type === 'enemy_turn') {
                return (
                  <motion.div
                    key={i}
                    className="ldi-log-bubble ldi-log-bubble--turn"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {entry.text}
                  </motion.div>
                )
              }
              if (entry.type === 'taunt') {
                return (
                  <motion.div
                    key={i}
                    className="ldi-log-bubble ldi-log-bubble--enemy ldi-log-bubble--taunt"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span dangerouslySetInnerHTML={{ __html: entry.text }} />
                  </motion.div>
                )
              }
              if (entry.type === 'initiative') {
                return (
                  <motion.div
                    key={i}
                    className="ldi-log-bubble ldi-log-bubble--system"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {entry.text}
                  </motion.div>
                )
              }
              const alignRight = isPlayerLog(entry.type)
              return (
                <motion.div
                  key={i}
                  className={`ldi-log-bubble ${alignRight ? 'ldi-log-bubble--player' : 'ldi-log-bubble--enemy'}`}
                  initial={{ x: alignRight ? 20 : -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {entry.type === 'taunt' ? (
                    <span dangerouslySetInnerHTML={{ __html: entry.text }} />
                  ) : entry.text}
                </motion.div>
              )
            })}
            <div ref={logEndRef} />
          </div>

          <div className="ldi-combat-mode-select">
            {Object.entries(MODE_ICONS).map(([mode, icon]) => (
              <button
                key={mode}
                className={`ldi-mode-btn ${combat.playerMode === mode ? 'ldi-mode-btn--active' : ''}`}
                onClick={() => onSelectMode(mode)}
                disabled={animating}
              >
                {icon} {MODE_LABELS[mode]}
              </button>
            ))}
            <button
              className="ldi-mode-btn ldi-mode-btn--flee"
              onClick={onFlee}
              disabled={animating}
            >
              🏃 Fugir
            </button>
          </div>

          {combat.playerMode === 'power' && selectedPowers.length > 0 ? (
            <div className="ldi-combat-power-buttons">
              {selectedPowers.map(fullPower => {
                if (!fullPower) return null
                const cost = fullPower.cost || 1
                const canUse = pmCurrent >= cost
                return (
                  <button
                    key={fullPower.id}
                    className="ldi-power-attack-btn"
                    onClick={() => handleAttackWithPower(fullPower)}
                    disabled={animating || !canUse}
                  >
                    <span className="ldi-power-attack-name">{fullPower.name}</span>
                    <span className="ldi-power-attack-cost">⚡{cost} PM</span>
                    {!canUse && <span className="ldi-power-attack-nopm">PM insuficiente</span>}
                  </button>
                )
              })}
              <button
                className="ldi-combat-attack-btn"
                onClick={handleAttack}
                disabled={animating}
              >
                {animating ? '⚔️ ROLANDO...' : '⚔️ ATACAR (Básico)'}
              </button>
            </div>
          ) : (
            <button
              className="ldi-combat-attack-btn"
              onClick={handleAttack}
              disabled={animating}
            >
              {animating ? '⚔️ ROLANDO...' : '⚔️ ATACAR'}
            </button>
          )}
        </div>

        <div className="ldi-combat-enemy">
          <h3 className="ldi-combat-name ldi-combat-name--enemy">{combat.enemy.name}</h3>

          <div className="ldi-combat-hp-bar">
            <div className="ldi-combat-hp-label">
              <span>PV</span>
              <span>{combat.enemy.pv_current}/{enemyPvMax}</span>
            </div>
            <motion.div
              className="ldi-combat-hp-track"
              animate={damageNumber?.target === 'enemy' ? { x: [-3, 3, -3, 3, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="ldi-combat-hp-fill ldi-hp--enemy"
                initial={false}
                animate={{ width: `${enemyPvPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </motion.div>
          </div>

          <div className="ldi-combat-enemy-mode">
            <span>Modo: {MODE_ICONS[combat.enemy.preferred_mode || 'fists']} {MODE_LABELS[combat.enemy.preferred_mode || 'fists']}</span>
          </div>

          {damageNumber && damageNumber.target === 'enemy' && (
            <motion.div
              className="ldi-dmg-float"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              +{damageNumber.value}
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {playerDice && (
          <DiceRollDisplay result={playerDice.result} success={playerDice.success} onDone={() => setPlayerDice(null)} />
        )}
      </AnimatePresence>

      {isNearDeath && <div className="ldi-screen-pulse" />}
    </div>
  )
}
