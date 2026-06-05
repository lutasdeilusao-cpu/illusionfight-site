import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { DUNGEONS } from '../data/dungeons'
import { ITENS } from '../data/itens'
import { MONOLOGUES } from '../data/monologues'

function getDungeonsDisponiveis(store) {
  const flags = store.flags || {}
  const dc = store.dungeonsCompletas || []
  return Object.values(DUNGEONS).filter(d => {
    if (d.tutorial) return flags.TEM_BENGALA
    if (d.requerDungeon && !dc.includes(d.requerDungeon)) return false
    if (d.requerFlag && !flags[d.requerFlag]) return false
    if (d.noturna && store.periodo !== 'NOITE') return false
    if (d.id === 'porto_velho' || d.id === 'doca_abandonada' || d.id === 'torre_kronos') {
      if (!flags.AURANIS_LIBERADO) return false
    }
    if (d.id === 'rua_branca' || d.id === 'porto_seco' || d.id === 'ilha_privada') {
      if (!flags.KARNAZAR_LIBERADO) return false
    }
    if (d.id === 'rua' && !dc.includes('onibus')) return false
    if (d.id === 'onibus_noturno' && !flags.NOTAS_LIBERADO) return false
    if (d.id === 'risca_faca_interior' && !flags.RISCA_FACA_LIBERADO) return false
    if (d.id === 'anexo') return flags.TEM_BENGALA
    if (d.id === 'onibus') return flags.TEM_BENGALA
    return flags.TEM_BENGALA
  })
}

function rollD6() { return Math.floor(Math.random() * 6) + 1 }

const INTERVALO = 1200

const HIT_WORDS = ['CRACK!', 'POW!', 'WHAM!', 'BAM!', 'KAPOW!']
const DAMAGE_WORDS = ['OOF!', 'UGH!', 'ARGH!', 'NNGH!', 'ACK!']

export default function Dungeon({ dungeonId }) {
  const store = useJackStore()
  const dungeon = DUNGEONS[dungeonId]
  const [log, setLog] = useState([])
  const [hp, setHp] = useState(store.hpAtual)
  const hpMax = store.hpMax
  const [fase, setFase] = useState('combat')
  const [animAtk, setAnimAtk] = useState(false)
  const [animDano, setAnimDano] = useState(false)
  const [animKill, setAnimKill] = useState(false)
  const [stealthMode, setStealthMode] = useState(dungeon?.mecanica === 'stealth')
  const [stealthDetectado, setStealthDetectado] = useState(false)
  const [fugaRound, setFugaRound] = useState(0)
  const [fugaVivo, setFugaVivo] = useState(true)
  const [showAutoPicker, setShowAutoPicker] = useState(false)

  // Generate enemies for infinite dungeon
  const getInfiniteEnemies = () => {
    if (!dungeon?.infinito) return dungeon?.inimigos || 0
    return 3 + Math.floor(store.nivel * 1.5)
  }
  const getInfiniteEnemyHp = () => {
    if (!dungeon?.infinito) return dungeon?.inimigoHp || 3
    return 3 + Math.floor(store.nivel * 0.8)
  }
  const getInfiniteEnemyDmg = () => {
    if (!dungeon?.infinito) return dungeon?.inimigoDmg || 1
    return 1 + Math.floor(store.nivel * 0.3)
  }
  const getInfiniteDrop = () => {
    if (!dungeon?.infinito) return dungeon?.dropCap || 0
    return (dungeon?.dropCap || 30) + Math.floor(store.nivel * 2)
  }

  const totalInimigos = dungeon?.infinito ? getInfiniteEnemies() : (dungeon?.inimigos || 0)
  const dropCap = dungeon?.infinito ? getInfiniteDrop() : (dungeon?.dropCap || 0)
  const [totalInimigosState] = useState(totalInimigos)
  const [dropCapState] = useState(dropCap)
  const [restantes, setRestantes] = useState(totalInimigos)
  const [progresso, setProgresso] = useState(0)
  const [onomatopeias, setOnomatopeias] = useState([])

  const inimigosRef = useRef(totalInimigos)
  const hpRef = useRef(store.hpAtual)
  const stopRef = useRef(false)
  const danoArmaRef = useRef(store.equipado?.arma?.dano || 0)
  const defesaRef = useRef(store.equipado?.armadura?.reducaoDano || 0)
  const reducaoRef = useRef(0)
  const aliado = store.aliadoAtual
  const primordialAtivo = store.flags.KRONOS_VIU && store.medidorPrimordial >= 10
  const onoIdRef = useRef(0)

  const addOnomatopeia = useCallback((text, type) => {
    const id = ++onoIdRef.current
    setOnomatopeias(prev => [...prev, { id, text, type }])
    setTimeout(() => {
      setOnomatopeias(prev => prev.filter(o => o.id !== id))
    }, 800)
  }, [])

  if (!dungeon) {
    console.error('[JACK] Dungeon não encontrada:', dungeonId, 'keys disponíveis:', Object.keys(DUNGEONS))
    return (
      <div className="jdc-dungeon">
        <p className="jack-text jack-text--crimson">dungeon não encontrada: {dungeonId}</p>
        <button className="jack-btn" onClick={() => store.setFase('dungeon_select')}>[ voltar ]</button>
      </div>
    )
  }

  useEffect(() => {
    if (dungeon) {
      setLog([`${dungeon.nome}`])
    }
    danoArmaRef.current = store.equipado?.arma?.dano || 0
    defesaRef.current = store.equipado?.armadura?.reducaoDano || 0
    if (aliado?.id === 'kim') reducaoRef.current = 1
    if (aliado?.id === 'shuntaro') danoArmaRef.current += 2
    if (primordialAtivo) danoArmaRef.current *= 2
  }, [])

  // Escape dungeon
  useEffect(() => {
    if (!dungeon || dungeon.mecanica !== 'fuga') return
    stopRef.current = false
    const tick = () => {
      if (stopRef.current) return
      const rolagem = rollD6()
      if (rolagem <= 3) {
        const dmg = dungeon.danoPorFalha || 5
        const novoHp = hpRef.current - dmg
        hpRef.current = novoHp
        setHp(novoHp)
        store.setHpAtual(novoHp)
        setAnimDano(true)
        setTimeout(() => setAnimDano(false), 300)
        addOnomatopeia(DAMAGE_WORDS[Math.floor(Math.random() * DAMAGE_WORDS.length)], 'damage')
        setLog(l => [...l, `🎲 rolou ${rolagem}... falhou! (-${dmg} HP)`])
        if (novoHp <= 0) {
          stopRef.current = true
          store.setHpAtual(0)
          setFugaVivo(false)
          setTimeout(() => setFase('derrota'), 100)
          return
        }
      } else {
        setLog(l => [...l, `🎲 rolou ${rolagem}! esquivou.`])
      }
      setFugaRound(r => {
        const novo = r + 1
        if (novo >= (dungeon.rounds || 15)) {
          stopRef.current = true
          store.setHpAtual(hpRef.current)
          if (dungeon.desbloqueiaFlag) store.setFlag(dungeon.desbloqueiaFlag)
          if (dungeon.dropCap) { store.ganharCervejas(dungeon.dropCap); store.ganharXp(Math.max(1, Math.floor(dungeon.dropCap / 8))) }
          store.incrementarMedidor()
          setLog(l => [...l, `🗼 Kronos: "você é mais interessante do que achei."`, `💨 ejetado de volta.`])
          store.setMonologo(MONOLOGUES.kronos_aparece)
          setTimeout(() => setFase('vitoria'), 500)
          return novo
        }
        return novo
      })
    }
    const interval = setInterval(tick, INTERVALO)
    return () => { clearInterval(interval); stopRef.current = true }
  }, [])

  // Combat mode
  useEffect(() => {
    if (fase !== 'combat') return
    if (dungeon?.mecanica === 'fuga') return
    stopRef.current = false

    const tick = () => {
      if (stopRef.current) return
      if (inimigosRef.current <= 0) return

      // Stealth mode
      if (stealthMode && !stealthDetectado) {
        const stealthRoll = rollD6()
        if (stealthRoll >= 4) {
          store.ganharCervejas(1)
          inimigosRef.current--
          setRestantes(inimigosRef.current)
          setAnimKill(true)
          setTimeout(() => setAnimKill(false), 400)
          setProgresso(prev => prev + 1)
          addOnomatopeia('SLY...', 'hit')
          setLog(l => [...l, `🥷 passou sem ser visto. (-1 inimigo)`])
          if (inimigosRef.current <= 0) {
            finalizarDungeon(dungeon, 3)
          }
          return
        } else {
          setStealthDetectado(true)
          setLog(l => [...l, `👀 foi detectado! combate inicia.`])
          return
        }
      }

      const danoArma = danoArmaRef.current
      const defesa = defesaRef.current
      const atq = rollD6() + danoArma
      const def = rollD6()
      const acertou = atq > def

      // Attack animation
      setAnimAtk(true)
      setTimeout(() => setAnimAtk(false), 400)

      if (acertou) {
        addOnomatopeia(HIT_WORDS[Math.floor(Math.random() * HIT_WORDS.length)], 'hit')
        store.ganharCervejas(1)
        inimigosRef.current--
        setRestantes(inimigosRef.current)
        setAnimKill(true)
        setTimeout(() => setAnimKill(false), 400)
        setProgresso(prev => prev + 1)

        if (inimigosRef.current <= 0) {
          stopRef.current = true
          setLog(l => [...l, `💥 derrubou! (${atq} vs ${def})`, `✅ todos derrubados!`])
          if (dungeon?.boss) {
            setTimeout(() => bossBattle(dungeon), 1000)
          } else {
            store.setHpAtual(hpRef.current)
            finalizarDungeon(dungeon)
            setTimeout(() => setFase('vitoria'), 500)
          }
          return
        }
        setLog(l => [...l, `💥 derrubou! (${atq} vs ${def})`])
        return
      }

      // Miss
      addOnomatopeia('MISS!', 'miss')
      const dmgBase = Math.max(1, rollD6() - defesa)
      const dmg = Math.min(3, dmgBase) - reducaoRef.current
      const dmgFinal = Math.max(0, dmg)
      const novoHp = hpRef.current - dmgFinal
      hpRef.current = novoHp
      setHp(novoHp)
      store.setHpAtual(novoHp)

      if (dmgFinal > 0) {
        setAnimDano(true)
        setTimeout(() => setAnimDano(false), 300)
        addOnomatopeia(DAMAGE_WORDS[Math.floor(Math.random() * DAMAGE_WORDS.length)], 'damage')
      }

      if (novoHp <= 0) {
        stopRef.current = true
        store.setHpAtual(0)
        setLog(l => [...l, `❌ errou. (${atq} vs ${def})`, `⚔️ ataque inimigo! (-${dmgFinal} HP)`, `💀 você morreu.`])
        store.setMonologo(MONOLOGUES.morre)
        setTimeout(() => setFase('derrota'), 100)
        return
      }
      setLog(l => [...l, `❌ errou. (${atq} vs ${def})`, `⚔️ ataque inimigo! (-${dmgFinal} HP)`])
    }

    const interval = setInterval(tick, INTERVALO)
    return () => { clearInterval(interval); stopRef.current = true }
  }, [fase, stealthMode, stealthDetectado])

  // Auto-mode: restart on victory
  useEffect(() => {
    if (!store.autoMode.ativo || fase !== 'vitoria') return
    const id = setTimeout(() => {
      store.setFase(`dungeon_${store.autoMode.dungeonId}`)
    }, 2000)
    return () => clearTimeout(id)
  }, [store.autoMode.ativo, fase])

  // Auto-mode: HP recovery on death
  useEffect(() => {
    if (!store.autoMode.ativo || fase !== 'derrota') return
    const id = setInterval(() => {
      const s = useJackStore.getState()
      if (s.hpAtual >= s.hpMax) {
        clearInterval(id)
        store.setFase(`dungeon_${store.autoMode.dungeonId}`)
      } else {
        store.setHpAtual(Math.min(s.hpMax, s.hpAtual + 2))
      }
    }, 2000)
    return () => clearInterval(id)
  }, [store.autoMode.ativo, fase])

  const bossBattle = (d) => {
    const boss = d.boss
    if (!boss) { finalizarDungeon(d); return }
    setAnimAtk(true)
    setTimeout(() => setAnimAtk(false), 400)
    const atqB = rollD6() + danoArmaRef.current
    const defB = rollD6()
    if (atqB > defB) {
      addOnomatopeia(HIT_WORDS[Math.floor(Math.random() * HIT_WORDS.length)], 'hit')
      store.setHpAtual(hpRef.current)
      finalizarDungeon(d, 1)
      setLog(l => [...l, `🎯 acertou ${boss.nome}!`, `🏆 ${boss.nome} derrotado!`])
      setTimeout(() => setFase('vitoria'), 500)
    } else {
      addOnomatopeia('MISS!', 'miss')
      const dmgB = Math.max(1, rollD6() + (boss.dmg || 3) - defesaRef.current - reducaoRef.current)
      const novoHp = hpRef.current - dmgB
      hpRef.current = novoHp
      setHp(novoHp)
      store.setHpAtual(novoHp)
      setAnimDano(true)
      setTimeout(() => setAnimDano(false), 300)
      addOnomatopeia(DAMAGE_WORDS[Math.floor(Math.random() * DAMAGE_WORDS.length)], 'damage')
      if (novoHp <= 0) {
        store.setHpAtual(0)
        setLog(l => [...l, `${boss.nome} revidou! (-${dmgB} HP)`, `💀 derrotado pelo boss.`])
        setTimeout(() => setFase('derrota'), 100)
      } else {
        setAnimAtk(true)
        setTimeout(() => setAnimAtk(false), 400)
        const atqB2 = rollD6() + danoArmaRef.current
        if (atqB2 > defB) {
          addOnomatopeia(HIT_WORDS[Math.floor(Math.random() * HIT_WORDS.length)], 'hit')
          store.setHpAtual(hpRef.current)
          finalizarDungeon(d, 1)
          setLog(l => [...l, `🎯 ${boss.nome} derrotado!`])
          setTimeout(() => setFase('vitoria'), 500)
        } else {
          addOnomatopeia('MISS!', 'miss')
          store.setHpAtual(0)
          setLog(l => [...l, `${boss.nome} contra-atacou!`, `💀 derrotado.`])
          setTimeout(() => setFase('derrota'), 100)
        }
      }
    }
  }

  const finalizarDungeon = (d, rewardMult = 1) => {
    const dCap = dungeon?.infinito ? getInfiniteDrop() : (d.dropCap || 0)
    const dropCapResult = Math.floor(dCap * rewardMult)
    const dropNotas = d.dropNotas || 0
    const dropFrag = d.dropFragmentos || 0
    if (dungeon?.infinito) {
      store.ganharCervejas(dropCapResult)
      store.ganharXp(Math.max(1, Math.floor(dropCapResult / 8)))
    } else {
      store.completarDungeon(d.id, dropCapResult, dropNotas, dropFrag)
      if (d.desbloqueiaFlag) store.setFlag(d.desbloqueiaFlag)
      store.incrementarMedidor()
    }
    if (aliado?.id === 'nina') useJackStore.setState(state => ({ notas: state.notas + Math.floor(dropNotas * 0.5) }))
    if (primordialAtivo && rewardMult === 1 && !dungeon?.infinito) store.zerarMedidor()
  }

  const pct = totalInimigos > 0 ? Math.round((progresso / totalInimigos) * 100) : 0
  const hpPct = hpMax > 0 ? Math.max(0, Math.round((hp / hpMax) * 100)) : 0
  const hpColor = hpPct > 60 ? '#22C55E' : hpPct > 30 ? '#F5A623' : '#E02020'
  const visibleEnemies = Math.min(restantes, 5)

  if (fase === 'derrota') {
    return (
      <div className="jdc-dungeon" style={{ textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="jdc-dungeon-end-icon" style={{ color: '#8B0000' }}>{store.autoMode.ativo ? '💀🤖' : '💀'}</div>
          <p className="jack-text jack-text--crimson" style={{ fontSize: '1.2rem' }}>você morreu.</p>
          {store.autoMode.ativo ? (
            <>
              <p className="jack-text jack-text--amber" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>🤖 AUTO — recuperando HP...</p>
              <p className="jack-text" style={{ fontSize: '1rem', marginTop: '0.3rem' }}>{store.hpAtual}/{store.hpMax}</p>
            </>
          ) : (
            <button className="jack-btn" onClick={() => { store.setHpAtual(Math.max(1, hpRef.current)); store.setFase('vila') }} style={{ marginTop: '1rem' }}>[ voltar ]</button>
          )}
        </motion.div>
      </div>
    )
  }

  if (fase === 'vitoria') {
    return (
      <div className="jdc-dungeon" style={{ textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="jdc-dungeon-end-icon" style={{ color: '#F5A623' }}>✅</div>
          <p className="jack-text jack-text--amber" style={{ fontSize: '1.2rem' }}>{dungeon?.nome || 'Dungeon'} completo!</p>
          <p className="jack-text">
            🍺 +{dungeon?.mecanica === 'stealth' && !stealthDetectado ? Math.floor((dungeon?.infinito ? dropCapState : dungeon?.dropCap || 0) * 3) : (dungeon?.infinito ? dropCapState : dungeon?.dropCap || 0)} cervejas
            {dungeon?.dropNotas > 0 ? ` · 💵 ${dungeon?.dropNotas} notas` : ''}
            {dungeon?.dropFragmentos > 0 ? ` · 💎 ${dungeon?.dropFragmentos} fragmentos` : ''}
          </p>
          {dungeon?.id === 'onibus' && <p className="jack-text jack-text--dim">🏷️ notas desbloqueadas!</p>}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button className="jack-btn" onClick={() => {
              if (store._retornoInvestigacao) {
                store.visitarLocal(store._localPendente)
                store.setFase(`investigar_${store._localPendente}`)
                useJackStore.setState({ _retornoInvestigacao: false, _localPendente: null })
              } else {
                store.setFase('dungeon_select')
              }
            }}>{store._retornoInvestigacao ? '[ voltar pra investigação ]' : '[ voltar ]'}</button>
            <button className="jack-btn jack-btn--amber" onClick={() => store.showResultCard({
              title: `${dungeon?.nome || 'Dungeon'} completo`,
              subtitle: `${(dungeon?.infinito ? dropCapState : dungeon?.dropCap || 0)} cervejas`,
              context: 'dungeon',
              stats: [
                { label: 'Cervejas', value: `🍺 ${(dungeon?.infinito ? dropCapState : dungeon?.dropCap || 0)}` },
                { label: 'Notas', value: `💵 ${dungeon?.dropNotas || 0}` },
                { label: 'Fragmentos', value: `💎 ${dungeon?.dropFragmentos || 0}` },
                { label: 'Dungeons', value: store.dungeonsCompletas?.length || 0 },
              ],
            })}>[ compartilhar ]</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="jdc-dungeon">
      {store.autoMode.ativo && <div className="jdc-auto-tag">🤖 AUTO</div>}
      <div className="jdc-dungeon-status">
        <span className="jdc-dungeon-status-loc">{dungeon?.nome || 'Dungeon'}</span>
        {dungeon?.mecanica === 'fuga' && (
          <span className="jack-text--amber" style={{ fontSize: '0.7rem' }}>round {fugaRound}/{dungeon.rounds || 15}</span>
        )}
        {stealthMode && !stealthDetectado && (
          <span className="jack-text--crimson" style={{ fontSize: '0.7rem' }}>🥷 stealth</span>
        )}
        <span className="jdc-dungeon-status-hp">
          <span className="jdc-dungeon-status-hp-label">MORAL</span>
          <span className="jdc-dungeon-status-hp-val">{hp}/{hpMax}</span>
        </span>
      </div>

      {dungeon?.mecanica !== 'fuga' && (
        <>
          {/* Battle scene: horizontal layout */}
          <div className="jdc-dungeon-battle">
            {/* Jack (left) */}
            <div className="jdc-dungeon-player-area">
              <motion.div
                className="jdc-dungeon-player-sprite"
                animate={{
                  x: animAtk ? 30 : animDano ? -8 : 0,
                }}
                transition={{
                  type: animDano ? 'tween' : 'spring',
                  duration: animAtk ? 0.4 : animDano ? 0.15 : 0.2,
                  stiffness: animDano ? 500 : 200,
                  damping: animDano ? 8 : 15,
                }}
              >
                {primordialAtivo ? '🔥' : '🕵️'}
              </motion.div>
              <span className="jdc-dungeon-player-label">Jack{primordialAtivo ? '*' : ''}</span>
            </div>

            {/* VS zone */}
            <div className="jdc-dungeon-combat-center">
              <AnimatePresence>
                {onomatopeias.map(o => (
                  <motion.div
                    key={o.id}
                    className={`jdc-dungeon-onomato jdc-dungeon-onomato--${o.type}`}
                    initial={{ opacity: 1, scale: 0.5, y: 0 }}
                    animate={{ opacity: 0, scale: 1.2, y: -30 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    {o.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Enemies (right) */}
            <div className="jdc-dungeon-enemies">
              {Array.from({ length: visibleEnemies }).map((_, i) => (
                <motion.div key={i} className="jdc-dungeon-enemy-sprite"
                  animate={i === visibleEnemies - 1 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ opacity: 1 - i * 0.1 }}>
                  <motion.span className="jdc-dungeon-enemy-emoji"
                    animate={animKill ? { opacity: 0, scale: 0, x: 20 } : {}}
                    transition={{ duration: 0.3 }}
                  >👤</motion.span>
                </motion.div>
              ))}
              {restantes > 5 && <span className="jack-text jack-text--dim" style={{ fontSize: '0.7rem' }}>+{restantes - 5}</span>}
            </div>
          </div>

          <div className="jdc-dungeon-progress-wrap">
            <motion.div className="jdc-dungeon-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3 }} />
          </div>
          <p className="jack-text jack-text--dim" style={{ fontSize: '0.65rem', textAlign: 'center', margin: '0.25rem 0' }}>
            {restantes} inimigo{restantes !== 1 ? 's' : ''} restante{restantes !== 1 ? 's' : ''}
          </p>
        </>
      )}

      {/* Moral bar */}
      <div className="jdc-dungeon-hpbar">
        <motion.div className="jdc-dungeon-hpbar-fill"
          animate={{ width: `${hpPct}%` }}
          transition={{ duration: 0.3 }}
          style={{ backgroundColor: hpColor }} />
      </div>

      <div className="jdc-dungeon-sep"></div>

      <div className="jdc-dungeon-log">
        <AnimatePresence>
          {log.slice(-6).map((entry, i) => (
            <motion.p key={i} className="jdc-dungeon-log-entry"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}>{entry}</motion.p>
          ))}
        </AnimatePresence>
      </div>

      <div className="jdc-dungeon-sep"></div>

      {/* Use item */}
      <div className="jdc-dungeon-items">
        {store.inventario.filter(i => i.id === 'energetico' || i.id === 'cachaca' || i.id === 'kit_medico' || i.id === 'antidoto' || i.id === 'cigarro_marelia').map(item => (
          <button key={item.id} className="jack-btn" onClick={() => {
            const full = ITENS[item.id]
            store.usarItem(item.id)
            const novaHp = Math.min(hpMax, hp + (full.cura || 0))
            setHp(novaHp)
            hpRef.current = novaHp
            setLog(l => [...l, `🧪 usou ${item.nome}. +${full.cura || 0} HP`])
          }} style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', margin: '0 0.2rem 0.2rem 0' }}>
            [ 🧪 {item.nome} ]
          </button>
        ))}
        {store.inventario.filter(i => i.id === 'ultimo_cigarro').map(item => (
          <button key={item.id} className="jack-btn jack-btn--crimson" onClick={() => {
            store.usarItem(item.id)
            const novaHp = hpMax
            setHp(novaHp)
            hpRef.current = novaHp
            setLog(l => [...l, `🚬 último cigarro. Moral total.`])
          }} style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', margin: '0 0.2rem 0.2rem 0' }}>
            [ 🚬 último cigarro ]
          </button>
        ))}
      </div>

      <div className="jdc-dungeon-footer">
        {dungeon?.mecanica !== 'fuga' && <span className="jack-text jack-text--dim">progresso: {pct}%</span>}
        {dungeon?.mecanica === 'fuga' && <span className="jack-text jack-text--dim">esquiva: {fugaRound}/{dungeon.rounds || 15}</span>}
        <button
          className={`jack-btn ${store.autoMode.ativo ? 'jack-btn--amber' : ''}`}
          onClick={() => {
            if (store.autoMode.ativo) {
              store.setAutoMode(null)
            } else {
              setShowAutoPicker(true)
            }
          }}
          style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}
        >
          {store.autoMode.ativo ? '[ 🤖 AUTO ]' : '[ 🤖 auto ]'}
        </button>
        <button className="jack-btn jack-btn--crimson" onClick={() => { stopRef.current = true; store.setFase('vila') }}>
          [ fugir ]
        </button>
      </div>

      {/* Auto-mode dungeon picker modal */}
      {showAutoPicker && (
        <div className="jdc-auto-picker-overlay" onClick={() => setShowAutoPicker(false)}>
          <div className="jdc-auto-picker" onClick={e => e.stopPropagation()}>
            <div className="jdc-auto-picker-title">Selecionar dungeon pra automático</div>
            <div className="jdc-auto-picker-list">
              {getDungeonsDisponiveis(store).map(d => {
                const completa = store.dungeonsCompletas?.includes(d.id)
                return (
                  <button
                    key={d.id}
                    className="jdc-auto-picker-item"
                    onClick={() => {
                      store.setAutoMode(d.id)
                      setShowAutoPicker(false)
                      if (dungeonId && dungeonId !== d.id) {
                        stopRef.current = true
                        store.setFase(`dungeon_${d.id}`)
                      }
                    }}
                  >
                    <span className="jdc-auto-picker-item-emoji">{d.emoji || '⚔️'}</span>
                    <span className="jdc-auto-picker-item-info">
                      <span className="jdc-auto-picker-item-nome">{d.nome}</span>
                      <span className="jdc-auto-picker-item-desc">
                        {completa ? `🔄 ${Math.floor((d.dropCap || 0) / 2)} 🍺` : `${d.inimigos || '?'} inim · ${d.dropCap || 0} 🍺`}
                        {d.infinito ? ' · ♾️' : ''}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            <button className="jack-btn" onClick={() => setShowAutoPicker(false)} style={{ marginTop: '0.5rem' }}>[ cancelar ]</button>
          </div>
        </div>
      )}
    </div>
  )
}
