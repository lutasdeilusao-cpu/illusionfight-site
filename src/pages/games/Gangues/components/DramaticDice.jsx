import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'
import { getGanguesAtaqueNormalAnimacao, tocarSomCombate } from '../data/ganguesCombatAnimations.js'
import GanguesCombatSpriteAnim from './GanguesCombatSpriteAnim.jsx'
import './DramaticDice.css'

// Máquina de animação de combate (16/09/2026) — generalizada a partir do
// teste único do Trinca (soco de 8, depois 16 quadros) depois de aprovado:
// "a partir de agora a gente vai implementar uma máquina de animação...
// vai ser oficial os 30 personagens recrutáveis". Os dados de CADA
// personagem (folha, grade, timing, sons) moram em
// `data/ganguesCombatAnimations.js` — este arquivo só resolve
// `attackerTemplateId` -> config (ou null, se o personagem ainda não tem
// arte própria) e orquestra o timing genérico a partir dela. Nada
// hardcoded pra um personagem específico aqui.

/**
 * DramaticDice — Tela cheia que pausa o jogo e mostra um dado rodando
 * com efeito cinematográfico (começa rápido, desacelera, revela o número).
 *
 * Mostra QUEM está atacando e em QUEM — sem isso o jogador se perde no
 * meio da rolagem, sem saber de quem é o turno.
 *
 * @param {{ finalValue: number, sides?: number, side: 'player'|'enemy', onComplete: () => void, powerName?: string, attackerName?: string, attackerRetrato?: string|null, targetName?: string, theme?: { rgb: string, glyphs: string[], particleCount: number } | null, attackerTemplateId?: number|null }} props
 */
export default function DramaticDice({ finalValue, sides = 6, side, onComplete, powerName, attackerName, attackerRetrato, targetName, theme, attackerTemplateId }) {
  const { t } = useLanguage()
  // Animação de ataque normal do personagem (null se ele ainda não tem
  // arte própria, ou se foi um PODER — os poderes ainda não têm animação
  // registrada, ver ganguesCombatAnimations.js). `side==='player'` já vem
  // garantido por quem chama (attackerTemplateId só existe pro jogador).
  const anim = !powerName ? getGanguesAtaqueNormalAnimacao(attackerTemplateId) : null
  const [display, setDisplay] = useState(null)       // null = fase de "aquecimento"
  const [phase, setPhase] = useState('intro')        // intro → rolling → reveal → done
  const displayRef = useRef(null)                    // ref para usar dentro do timer sem causar re-render
  const lastSoundRef = useRef(0)
  const isCritical = finalValue === sides
  // Crítico sempre ganha (visual já é o "uau" da tela) — o tema por poder só
  // aparece fora do crítico, senão os dois efeitos brigam pela mesma cor.
  const fx = !isCritical && theme ? theme : null

  // Duração da tela: normal 1.5s~2s, crítico 2s fixo — MAS quando tem
  // animação de personagem, a rolagem trava num valor fixo (duração da
  // animação inteira menos os 400ms da intro) pra a revelação do número
  // SEMPRE cair exatamente quando o último quadro termina (pedido do
  // Isaias: "a jogada do dado tem que finalizar no [último] frame, aí
  // apresenta o resultado"). Isso também garante de graça que a tela
  // nunca fecha no meio da animação (a revelação só começa depois dela
  // já ter rodado inteira).
  const animDuracaoMs = anim ? anim.frames * anim.frameMs : 0
  const totalDuration = useRef(
    anim ? (animDuracaoMs - 400) : isCritical ? 2000 : (1500 + Math.random() * 500)
  )

  // Sons da animação (arquivo de verdade, não os bips sintetizados de
  // sfx.js — mesmo padrão de GanguesSaveSelect.jsx): `voz`/`ambiente`
  // tocam juntos desde o quadro 1; cada entrada de `golpes` toca no seu
  // quadro de impacto (1-indexado). Os arquivos já foram PRÉ-CARREGADOS
  // no início da batalha (GanguesCombat.jsx chama
  // `precarregarAnimacaoCombate` pra cada personagem do time assim que a
  // luta começa) — aqui só dispara `.play()` no `<audio>` que já existe,
  // sem esperar download/decodificação na hora do golpe.
  //
  // Dependência é `attackerTemplateId`/`powerName` (primitivos), NÃO
  // `anim`: `anim` é um objeto NOVO a cada render
  // (getGanguesAtaqueNormalAnimacao devolve um literal `{ ...dados }`
  // sempre), então usá-lo como dependência fazia o efeito disparar de novo
  // a cada re-render do componente (troca de fase/display), repetindo o
  // som da fala várias vezes por ataque (achado pelo Isaias, 16/09/2026:
  // "o som da fala tá repetindo várias vezes"). A identidade que importa é
  // a de QUEM está atacando, não a do objeto derivado.
  useEffect(() => {
    if (!anim || !sfx.enabled) return
    if (anim.sons.ambiente) tocarSomCombate(anim.sons.ambiente, 0.6)
    if (anim.sons.voz) tocarSomCombate(anim.sons.voz, 0.8)
    const timers = (anim.sons.golpes || []).map(({ frame, arquivo }) =>
      setTimeout(() => tocarSomCombate(arquivo, 0.85), (frame - 1) * anim.frameMs)
    )
    return () => timers.forEach(clearTimeout)
  }, [attackerTemplateId, powerName])

  useEffect(() => {
    // Fase 1: intro — show the "?" for a moment
    const t1 = setTimeout(() => {
      setPhase('rolling')
    }, 400)

    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (phase !== 'rolling') return

    let stopped = false
    const rollDuration = totalDuration.current

    // Gera delays com easing CÚBICO (começa rápido, desacelera MUITO no final)
    const steps = []
    let accum = 0
    while (accum < rollDuration) {
      const progress = accum / rollDuration // 0 → 1
      // delay cúbico: começa em ~30ms, termina em ~350ms
      // curva cúbica: fica mais lento exponencialmente perto do fim
      const rawDelay = 30 + Math.pow(progress, 1.8) * 320
      const jitter = (Math.random() - 0.5) * 20
      const delay = Math.max(20, Math.min(400, rawDelay + jitter))
      steps.push(delay)
      accum += delay
    }

    // Corrente de setTimeout (NÃO requestAnimationFrame): rAF simplesmente
    // não dispara com a aba/app em segundo plano — o combate ficava
    // congelado esperando a revelação do dado até o jogador voltar pro
    // app. setTimeout continua rodando em background (o navegador só
    // aumenta o intervalo mínimo, não para de vez), então a luta segue
    // sozinha se o jogador trocar de app no modo automático.
    let stepIdx = 0
    let timerId

    function tick() {
      if (stopped) return

      if (stepIdx >= steps.length) {
        sfx.diceLand()
        setPhase('reveal')
        setDisplay(finalValue)
        return
      }

      // Sorteia um número diferente do atual (usa ref p/ não causar loop)
      let next
      do {
        next = Math.floor(Math.random() * sides) + 1
      } while (next === displayRef.current && steps.length > 3)
      displayRef.current = next
      setDisplay(next)

      // Som de tick a cada troca de número (com debounce)
      const now = Date.now()
      if (now - lastSoundRef.current > 30) {
        lastSoundRef.current = now
        sfx.diceTick()
      }

      timerId = setTimeout(tick, steps[stepIdx])
      stepIdx++
    }

    timerId = setTimeout(tick, steps[0] || 0)
    return () => { stopped = true; clearTimeout(timerId) }
  }, [phase, finalValue, sides]) // ← sem display! ref evita o loop infinito

  // Na fase reveal, espera 1s (normal) ou 1.2s (crítico) e chama onComplete —
  // como `totalDuration` já trava a rolagem pra terminar junto do quadro 16
  // (ver acima), o soco sempre já rodou por completo quando a revelação
  // começa; não precisa de nenhuma conta extra de segurança aqui.
  useEffect(() => {
    if (phase !== 'reveal') return
    const delay = isCritical ? 1200 : 1000
    const t = setTimeout(() => {
      setPhase('done')
      onComplete?.()
    }, delay)
    return () => clearTimeout(t)
  }, [phase, onComplete, isCritical])

  const isPlayer = side === 'player'

  return (
    <AnimatePresence>
      <motion.div
        className="dramatic-dice-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Background blur */}
        <div className="dramatic-dice-bg" />

        <div className={`dramatic-dice-container${anim ? ' dramatic-dice-container--compacto' : ''}`} style={fx ? { '--fx-rgb': fx.rgb } : undefined}>
          {/* Nome do poder (se houver) — aparece antes da label */}
          {powerName && (
            <motion.div
              className={`dramatic-dice-powername ${fx ? 'dramatic-dice-powername--fx' : ''}`}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
            >
              ⚡ {powerName} ⚡
            </motion.div>
          )}

          {/* Quem ataca quem — a identificação que faltava */}
          <motion.div
            className={`dramatic-dice-label dramatic-dice-label--${isPlayer ? 'player' : 'enemy'}`}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <span className="dramatic-dice-attacker">
              {attackerRetrato ? <img className="dramatic-dice-attacker-foto" src={attackerRetrato} alt="" /> : (isPlayer ? '🎯' : '💀')}
              {' '}{attackerName || '—'}
            </span>
            {targetName && (
              <span className="dramatic-dice-vs">{t('games.gangues.dado.ataca')} <b>{targetName}</b></span>
            )}
          </motion.div>

          {/* O dado em si */}
          <div className="dramatic-dice-stage">
            {/* LIGHTING EFFECTS */}
            <div className={`dramatic-dice-glow ${isCritical && phase === 'reveal' ? 'dramatic-dice-glow--critico' : ''} ${fx && phase === 'reveal' ? 'dramatic-dice-glow--fx' : ''}`} />

            <motion.div
              className={`dramatic-dice-box ${isCritical && phase === 'reveal' ? 'dramatic-dice-box--critico' : ''} ${fx && phase === 'reveal' ? 'dramatic-dice-box--fx' : ''} ${phase === 'reveal' ? 'dramatic-dice-box--reveal' : ''} ${phase === 'rolling' ? 'dramatic-dice-box--rolling' : ''}`}
              animate={
                phase === 'intro' ? { scale: 0, rotate: -180 } :
                phase === 'rolling' ? { scale: 1, rotate: [0, 15, -15, 10, -10, 5, -5, 0] } :
                phase === 'reveal' ? {
                  scale: [1.3, 0.9, 1.1, 1],
                  rotate: [5, -3, 2, 0],
                } :
                { scale: 1, rotate: 0 }
              }
              transition={
                phase === 'intro' ? { duration: 0.4, ease: 'easeOut' } :
                phase === 'rolling' ? { duration: 0.15, repeat: Infinity, ease: 'linear' } :
                phase === 'reveal' ? { duration: 0.6, ease: 'easeOut' } :
                { duration: 0.3 }
              }
            >
              <span className="dramatic-dice-emoji">🎲</span>
              <span className={`dramatic-dice-number ${phase === 'reveal' ? 'dramatic-dice-number--final' : ''} ${isCritical && phase === 'reveal' ? 'dramatic-dice-number--critico' : ''} ${fx && phase === 'reveal' ? 'dramatic-dice-number--fx' : ''}`}>
                {display ?? '?'}
              </span>
            </motion.div>

            {/* Impacto: onda de choque + soco batendo no instante da revelação.
                É o que dá peso ao número — antes o dado só parava. */}
            {phase === 'reveal' && (
              <>
                <motion.span
                  className={`dramatic-dice-shockwave ${isCritical ? 'dramatic-dice-shockwave--critico' : ''} ${fx ? 'dramatic-dice-shockwave--fx' : ''}`}
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: isCritical ? 3.2 : 2.4, opacity: 0 }}
                  transition={{ duration: isCritical ? 0.7 : 0.55, ease: 'easeOut' }}
                />
                <motion.span
                  className={`dramatic-dice-impacto ${isCritical ? 'dramatic-dice-impacto--critico' : ''}`}
                  initial={{ scale: 0, rotate: isPlayer ? -35 : 35, opacity: 0 }}
                  animate={{ scale: [0, 1.3, 1.05], rotate: isPlayer ? [-35, 8, 0] : [35, -8, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6, times: [0, 0.3, 1], ease: 'easeOut' }}
                >
                  {isCritical ? '💥' : fx ? fx.glyphs[0] : '👊'}
                </motion.span>
              </>
            )}

            {/* Partículas / estrelas ao redor no reveal */}
            {phase === 'reveal' && (
              <motion.div
                className="dramatic-dice-particles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {(() => {
                  const count = isCritical ? 8 : (fx?.particleCount || 8)
                  return [...Array(count)].map((_, i) => {
                    const angle = (i / count) * 360
                    const dist = 60 + Math.random() * 40
                    return (
                      <motion.span
                        key={i}
                        className="dramatic-dice-particle"
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: Math.cos((angle * Math.PI) / 180) * dist,
                          y: Math.sin((angle * Math.PI) / 180) * dist,
                          opacity: 0,
                          scale: 0,
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                          background: isCritical ? '#F5A623' : fx ? `rgb(${fx.rgb})` : '#00B4D8',
                        }}
                      >
                        {isCritical ? '✦' : fx ? fx.glyphs[i % fx.glyphs.length] : '•'}
                      </motion.span>
                    )
                  })
                })()}
              </motion.div>
            )}
          </div>

          {/* Animação de ataque do personagem (Trinca, Muro, ...) — fica
              ENTRE o dado (agora pequeno, lá em cima) e o texto final
              (crítico/etc, embaixo), como pedido: "em destaque na hora que
              tá sendo dado o dado". Roda durante o giro e a revelação (a
              instância inteira remonta a cada ataque, via `key` no ponto de
              uso em GanguesCombatOverlays.jsx). Componente/dados genéricos —
              ver GanguesCombatSpriteAnim.jsx e ganguesCombatAnimations.js. */}
          {anim && (
            <GanguesCombatSpriteAnim
              sheet={anim.sheet}
              cols={anim.cols}
              rows={anim.rows}
              frames={anim.frames}
              frameMs={anim.frameMs}
              frameW={anim.frameW}
              frameH={anim.frameH}
              className="dramatic-dice-sprite-animado"
            />
          )}

          {/* Frase dramática embaixo */}
          <motion.div
            className="dramatic-dice-subtext"
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {phase === 'intro' && `🎲 ${t('games.gangues.dado.preparando')}`}
            {phase === 'rolling' && t('games.gangues.dado.girando')}
            {phase === 'reveal' && (
              <motion.span
                className={isCritical ? 'dramatic-dice-subtext--critico' : ''}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {isCritical
                  ? (isPlayer ? `⚡ ${t('games.gangues.dado.critico_player')} ⚡` : `💀 ${t('games.gangues.dado.critico_enemy')} 💀`)
                  : `🎯 ${t('games.gangues.dado.resultado', { n: finalValue })}`
                }
              </motion.span>
            )}
          </motion.div>

          {/* Barra de progresso no rodapé (sutil) */}
          {phase === 'rolling' && (
            <motion.div
              className="dramatic-dice-progress"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: totalDuration.current / 1000, ease: 'easeIn' }}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
