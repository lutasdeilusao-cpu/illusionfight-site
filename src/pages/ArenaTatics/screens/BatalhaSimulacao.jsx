import { useState, useRef, useEffect, useCallback } from 'react'
import Grid from '../components/Grid'
import StatusBar from '../components/StatusBar'
import TurnoIndicator from '../components/TurnoIndicator'
import DanoPopup from '../components/DanoPopup'
import CombatResultModal from '../components/CombatResultModal'
import EnemyTurnBanner from '../components/EnemyTurnBanner'
import { ROSTER, construirPersonagem } from '../data/roster'
import { TODAS_IAS, resolverAcaoIA, getDescricaoIA } from '../data/aiPersonalities'
import { resolverAtaque } from '../data/combat'
import { getMultiplicadorElemental } from '../data/elementais'
import { screenShake, flashCelula } from '../data/juice'
import { getElem } from '../data/elementals'

const COL = 8, ROWS = 16

/**
 * Sorteia personagens únicos do roster
 */
function pickChars(n) {
  const shuffled = [...ROSTER].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n * 2) // n pra cada time
}

/**
 * Posiciona personagens no grid
 */
function posicionar(personagens, lado, startY) {
  const posicoes = lado === 'aliado'
    ? [[1, 3], [2, 7], [1, 11], [2, 1], [1, 5], [2, 9]]
    : [[6, 3], [5, 7], [6, 11], [5, 1], [6, 5], [5, 9]]
  return personagens.slice(0, 6).map((r, i) => {
    const p = construirPersonagem(r.id, posicoes[i][0], posicoes[i][1], lado)
    if (!p) return null
    return { ...p, rosterNome: r.nome }
  }).filter(Boolean)
}

export default function BatalhaSimulacao({ config, onFim }) {
  const { numChars, numIAs, ias: iasConfig, speed } = config

  // Inicializa personagens
  const chars = useRef(pickChars(numChars))
  const [aliados, setAliados] = useState(() => posicionar(chars.current.slice(0, numChars), 'aliado', 2))
  const [inimigos, setInimigos] = useState(() => posicionar(chars.current.slice(numChars, numChars * 2), 'inimigo', 2))
  const [obstrucoes] = useState(() => {
    const obs = []
    for (let i = 0; i < 4 + Math.floor(Math.random() * 3); i++) {
      obs.push({ x: 1 + Math.floor(Math.random() * 6), y: 1 + Math.floor(Math.random() * 14) })
    }
    return obs
  })

  // Estado da batalha
  const [turno, setTurno] = useState(1)
  const [fase, setFase] = useState('player') // player | enemy
  const [danos, setDanos] = useState([])
  const [log, setLog] = useState('')
  const [combatResult, setCombatResult] = useState(null)
  const [enemyBanner, setEnemyBanner] = useState(null)
  const gridRef = useRef(null)
  const danoId = useRef(0)
  const rodando = useRef(true)
  const [terminou, setTerminou] = useState(false)

  // Sortear IAs (divisão igualitária)
  const ias = useRef(() => {
    const shuffled = [...iasConfig].sort(() => Math.random() - 0.5)
    // Distribui IAs entre os times
    const half = Math.ceil(numIAs / 2)
    return {
      timeAzul: shuffled.slice(0, half),
      timeVermelho: shuffled.slice(half, half + half),
    }
  })()

  // Log de debug
  const addLog = (msg) => {
    setLog(msg)
    console.log(`[SIM] ${msg}`)
  }

  // Mostrar dano
  const showDano = (v, x, y, crit = false) => {
    const id = danoId.current++
    setDanos(d => [...d, { id, valor: v, x, y, critico: crit }])
    setTimeout(() => setDanos(d => d.filter(dd => dd.id !== id)), 900)
  }

  // Verificar fim de batalha
  const checkFim = useCallback((aliadosAtual, inimigosAtual) => {
    const aliadosVivos = aliadosAtual.filter(a => a.hp > 0)
    const inimigosVivos = inimigosAtual.filter(i => i.hp > 0)
    if (aliadosVivos.length === 0 || inimigosVivos.length === 0) {
      rodando.current = false
      setTerminou(true)
      const vencedor = aliadosVivos.length > 0 ? 'TIME AZUL' : 'TIME VERMELHO'
      const iaVencedora = aliadosVivos.length > 0
        ? ias.timeAzul.map(ia => ia.nome).join(' + ')
        : ias.timeVermelho.map(ia => ia.nome).join(' + ')
      const desc = aliadosVivos.length > 0
        ? getDescricaoIA(ias.timeAzul[0], ias.timeAzul[1] || ias.timeAzul[0])
        : getDescricaoIA(ias.timeVermelho[0], ias.timeVermelho[1] || ias.timeVermelho[0])
      addLog(`🏆 ${vencedor} venceu! (${desc})`)
      setTimeout(() => onFim?.({
        vencedor,
        iaVencedora,
        turnos: turno,
        descricao: desc,
        aliadosSobreviventes: aliadosVivos.map(a => a.nome),
        inimigosSobreviventes: inimigosVivos.map(i => i.nome),
      }), 1500)
      return true
    }
    return false
  }, [turno, onFim])

  // Executar ação de um personagem
  const executarAcaoPersonagem = useCallback((personagem, timeAliados, timeInimigos, iasDoTime, lado, fnUpdate) => {
    return new Promise(resolve => {
      if (!rodando.current || personagem.hp <= 0) { resolve(); return }

      const ia = iasDoTime[Math.floor(Math.random() * iasDoTime.length)]
      const acao = resolverAcaoIA(personagem, ia, ia, timeAliados, timeInimigos)
      if (!acao || !acao.skill || !acao.alvo) {
        // Move para frente se não tiver ação
        const novaPos = { x: lado === 'aliado' ? Math.min(7, personagem.x + 1) : Math.max(0, personagem.x - 1), y: personagem.y }
        fnUpdate(prev => prev.map(p => p.id === personagem.id ? { ...p, x: novaPos.x, y: novaPos.y, jaMoveu: true, jaAtacou: true } : p))
        addLog(`🚶 ${personagem.nome} avançou`)
        setTimeout(resolve, speed * 0.5)
        return
      }

      const { skill, alvo } = acao
      addLog(`⚡ ${personagem.nome} → ${skill.nome} → ${alvo.nome}`)
      const mult = getMultiplicadorElemental(personagem.elemental, alvo.elemental)
      const resultado = resolverAtaque(personagem, alvo, skill, mult)

      // Juice
      const elem = getElem(personagem.elemental)
      screenShake(elem.shakePerfil, gridRef)
      flashCelula(`[data-cell="${alvo.x},${alvo.y}"]`, personagem.elemental, 'recebe')
      setEnemyBanner({ atacante: personagem, alvo, skill, resultado })

      setCombatResult({
        atacante: { nome: personagem.nome, elemental: personagem.elemental },
        alvo: { nome: alvo.nome, elemental: alvo.elemental, hp: Math.max(0, alvo.hp - resultado.dano), hpMax: alvo.hpMax },
        skill,
        dano: resultado.acertou ? resultado.dano : 0,
        critico: resultado.critico,
        acertou: resultado.acertou,
        missTipo: resultado.missTipo,
        status: resultado.status,
      })

      if (resultado.acertou) {
        const danoFinal = Math.max(0, resultado.dano)
        showDano(danoFinal, alvo.x * 48 + 24, alvo.y * 48 + 24, resultado.critico)
        // Aplica dano
        fnUpdate(prev => prev.map(p => {
          if (p.id === alvo.id) return { ...p, hp: Math.max(0, p.hp - danoFinal) }
          if (p.id === personagem.id) return { ...p, jaMoveu: true, jaAtacou: true }
          return p
        }))
      } else {
        showDano(0, alvo.x * 48 + 24, alvo.y * 48 + 24, false)
        fnUpdate(prev => prev.map(p =>
          p.id === personagem.id ? { ...p, jaMoveu: true, jaAtacou: true } : p
        ))
      }

      setTimeout(resolve, speed)
    })
  }, [speed])

  // Processar turno de um time
  const processarTime = useCallback(async (timeAliados, timeInimigos, iasDoTime, lado, fnUpdate) => {
    const vivos = timeAliados.filter(p => p.hp > 0)
    for (const p of vivos) {
      if (!rodando.current) break
      await executarAcaoPersonagem(p, timeAliados, timeInimigos, iasDoTime, lado, fnUpdate)
      if (checkFim(timeAliados, timeInimigos)) { rodando.current = false; break }
    }
    // Reseta flags de turno
    fnUpdate(prev => prev.map(p => ({ ...p, jaMoveu: false, jaAtacou: false })))
  }, [executarAcaoPersonagem, checkFim])

  // Loop principal da batalha
  useEffect(() => {
    if (terminou) return
    let cancelled = false

    const loop = async () => {
      while (rodando.current && !cancelled) {
        addLog(`\n=== TURNO ${turno} ===`)
        setFase('player')

        // Time Azul (aliados) age
        await processarTime(aliados, inimigos, ias.timeAzul, 'aliado', setAliados)
        if (!rodando.current || cancelled) break

        setFase('enemy')

        // Time Vermelho (inimigos) age
        await processarTime(inimigos, aliados, ias.timeVermelho, 'inimigo', setInimigos)
        if (!rodando.current || cancelled) break

        setTurno(t => t + 1)
      }
    }

    loop()

    return () => { cancelled = true; rodando.current = false }
  }, [])

  return (
    <div className="tatics-batalha">
      <div className="tatics-batalha-bg" />
      <div className="tatics-batalha-scanlines" />
      <div className="tatics-batalha-vignette" />

      <TurnoIndicator turno={turno} fase={fase} />

      {/* Info das IAs */}
      <div className="tatics-sim-ia-bar">
        <div className="tatics-sim-ia-bar-item" style={{ color: '#00B4D8' }}>
          {ias.timeAzul.map(ia => ia.nome).join(' + ')}
        </div>
        <div className="tatics-sim-ia-bar-vs">VS</div>
        <div className="tatics-sim-ia-bar-item" style={{ color: '#E24B4A' }}>
          {ias.timeVermelho.map(ia => ia.nome).join(' + ')}
        </div>
      </div>

      {/* Grid */}
      <div className="tatics-batalha-gridarea" ref={gridRef}>
        <DanoPopup danos={danos} />
        <Grid aliados={aliados} inimigos={inimigos} alcance={[]} turnoFase="idle" onCasaClick={() => {}} obstrucoes={obstrucoes} alvoHighlight={null} />
      </div>

      {/* Log */}
      {log && (
        <div className="tatics-enemy-log">
          <span className="tatics-enemy-log-prompt">&gt;</span>
          <span className="tatics-enemy-log-text">{log}</span>
        </div>
      )}

      <StatusBar personagens={aliados.filter(a => a.hp > 0)} lado="aliado" />
      <StatusBar personagens={inimigos.filter(i => i.hp > 0)} lado="inimigo" />

      {/* Combat Result Modal */}
      <CombatResultModal resultado={combatResult} onFechar={() => setCombatResult(null)} />

      {/* Enemy Turn Banner */}
      {enemyBanner && (
        <EnemyTurnBanner acao={enemyBanner} onFechar={() => setEnemyBanner(null)} />
      )}

      {/* Fim da batalha */}
      {terminou && (
        <div className="tatics-sim-fim-overlay">
          <div className="tatics-sim-fim-card">
            <div className="tatics-sim-fim-title">BATALHA ENCERRADA</div>
            <div className="tatics-sim-fim-info">
              {aliados.filter(a => a.hp > 0).length > 0 ? '🏆 TIME AZUL VENCEU!' : '🔥 TIME VERMELHO VENCEU!'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
