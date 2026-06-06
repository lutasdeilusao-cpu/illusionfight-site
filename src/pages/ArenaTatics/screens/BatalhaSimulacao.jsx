import { useState, useRef, useEffect } from 'react'
import Grid from '../components/Grid'
import StatusBar from '../components/StatusBar'
import TurnoIndicator from '../components/TurnoIndicator'
import DanoPopup from '../components/DanoPopup'
import CombatResultModal from '../components/CombatResultModal'
import EnemyTurnBanner from '../components/EnemyTurnBanner'
import { ROSTER, construirPersonagem } from '../data/roster'
import { resolverAcaoIA, getDescricaoIA } from '../data/aiPersonalities'
import { resolverAtaque } from '../data/combat'
import { getMultiplicadorElemental } from '../data/elementais'
import { screenShake, flashCelula } from '../data/juice'
import { getElem } from '../data/elementals'

function pickChars(n) {
  const shuffled = [...ROSTER].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n * 2)
}

function posicionar(personagens, lado) {
  const posicoes = lado === 'aliado'
    ? [[1, 3], [2, 7], [1, 11], [2, 1], [1, 5], [2, 9]]
    : [[6, 3], [5, 7], [6, 11], [5, 1], [6, 5], [5, 9]]
  return personagens.slice(0, 6).map((r, i) => {
    const p = construirPersonagem(r.id, posicoes[i][0], posicoes[i][1], lado)
    return p ? { ...p, rosterNome: r.nome } : null
  }).filter(Boolean)
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

export default function BatalhaSimulacao({ config, onFim }) {
  const { numChars, numIAs, ias: iasConfig, speed } = config

  // Estado inicial
  const [state, setState] = useState(() => {
    const chars = pickChars(numChars)
    const aliados = posicionar(chars.slice(0, numChars), 'aliado')
    const inimigos = posicionar(chars.slice(numChars, numChars * 2), 'inimigo')
    const obstrucoes = []
    for (let i = 0; i < 4 + Math.floor(Math.random() * 3); i++)
      obstrucoes.push({ x: 1 + Math.floor(Math.random() * 6), y: 1 + Math.floor(Math.random() * 14) })
    const shuffled = [...iasConfig].sort(() => Math.random() - 0.5)
    const half = Math.ceil(numIAs / 2)
    return {
      aliados, inimigos, obstrucoes, turno: 1, fase: 'player',
      ias: { timeAzul: shuffled.slice(0, half), timeVermelho: shuffled.slice(half, half + half) },
    }
  })

  const stateRef = useRef(state)
  stateRef.current = state

  const [danos, setDanos] = useState([])
  const [log, setLog] = useState('Pronto')
  const [combatResult, setCombatResult] = useState(null)
  const [enemyBanner, setEnemyBanner] = useState(null)
  const [terminou, setTerminou] = useState(false)
  const gridRef = useRef(null)
  const danoId = useRef(0)
  const rodando = useRef(true)
  const iniciado = useRef(false)

  const addLog = (msg) => { setLog(msg); console.log(`[SIM] ${msg}`) }
  const showDano = (v, x, y, crit = false) => {
    const id = danoId.current++
    setDanos(d => [...d, { id, valor: v, x, y, critico: crit }])
    setTimeout(() => setDanos(d => d.filter(dd => dd.id !== id)), 900)
  }
  const upd = (fn) => setState(prev => { const n = fn(prev); stateRef.current = n; return n })

  // Ação de UM personagem
  const agir = async (p, iasDoTime, lado) => {
    if (!rodando.current || p.hp <= 0) return false

    const cur = stateRef.current
    const timeAliados = cur.aliados
    const timeInimigos = cur.inimigos
    const key = lado === 'aliado' ? 'aliados' : 'inimigos'

    // Escolhe IA (divide igualmente)
    const idx = cur[key].findIndex(x => x.id === p.id)
    const ia = iasDoTime[Math.floor(idx / Math.ceil(cur[key].filter(x => x.hp > 0).length / iasDoTime.length)) % iasDoTime.length]

    // Resolve ação da IA
    const oponentes = key === 'aliados' ? timeInimigos : timeAliados
    const acao = resolverAcaoIA(p, ia, ia, key === 'aliados' ? timeAliados : timeInimigos, oponentes)

    if (!acao?.skill || !acao?.alvo) {
      // Move p/ frente
      const novaX = lado === 'aliado' ? Math.min(7, p.x + 1) : Math.max(0, p.x - 1)
      addLog(`🚶 ${p.nome} avançou`)
      upd(prev => ({ ...prev, [key]: prev[key].map(a => a.id === p.id ? { ...a, x: novaX, jaMoveu: true, jaAtacou: true } : a) }))
      await sleep(speed * 0.5)
      return false
    }

    const { skill, alvo } = acao
    addLog(`⚡ ${p.nome} → ${skill.nome} → ${alvo.nome}`)

    // Calcula dano
    const resultado = resolverAtaque(p, alvo, skill, getMultiplicadorElemental(p.elemental, alvo.elemental))

    // Juice
    const elem = getElem(p.elemental)
    screenShake(elem.shakePerfil, gridRef)
    flashCelula(`[data-cell="${alvo.x},${alvo.y}"]`, p.elemental, 'recebe')
    setEnemyBanner({ atacante: p, alvo, skill, resultado })
    setCombatResult({
      atacante: { nome: p.nome, elemental: p.elemental },
      alvo: { nome: alvo.nome, elemental: alvo.elemental, hp: Math.max(0, alvo.hp - resultado.dano), hpMax: alvo.hpMax },
      skill, dano: resultado.acertou ? resultado.dano : 0, critico: resultado.critico,
      acertou: resultado.acertou, missTipo: resultado.missTipo, status: resultado.status,
    })

    if (resultado.acertou) {
      const danoFinal = Math.max(0, resultado.dano)
      showDano(danoFinal, alvo.x * 48 + 24, alvo.y * 48 + 24, resultado.critico)
      const ladoAlvo = key === 'aliados' ? 'inimigos' : 'aliados'
      upd(prev => ({
        ...prev,
        [ladoAlvo]: prev[ladoAlvo].map(x => x.id === alvo.id ? { ...x, hp: Math.max(0, x.hp - danoFinal) } : x),
        [key]: prev[key].map(x => x.id === p.id ? { ...x, jaMoveu: true, jaAtacou: true } : x),
      }))
    } else {
      showDano(0, alvo.x * 48 + 24, alvo.y * 48 + 24, false)
      upd(prev => ({ ...prev, [key]: prev[key].map(x => x.id === p.id ? { ...x, jaMoveu: true, jaAtacou: true } : x) }))
    }

    await sleep(speed)
    return false
  }

  // Processa um time INTEIRO (com pausas visuais)
  const processarTime = async (lado) => {
    const key = lado === 'aliado' ? 'aliados' : 'inimigos'
    const iasDoTime = lado === 'aliado' ? stateRef.current.ias.timeAzul : stateRef.current.ias.timeVermelho

    while (rodando.current) {
      const cur = stateRef.current
      const vivos = cur[key].filter(x => x.hp > 0)
      const pronto = vivos.find(x => !x.jaMoveu || !x.jaAtacou)
      if (!pronto) break

      await agir(pronto, iasDoTime, lado)

      // Check fim
      const d = stateRef.current
      if (d.aliados.filter(a => a.hp > 0).length === 0 || d.inimigos.filter(i => i.hp > 0).length === 0) {
        return true
      }
    }
    return false
  }

  // Loop principal
  useEffect(() => {
    if (iniciado.current) return
    iniciado.current = true

    let cancelled = false
    const loop = async () => {
      try {
        while (rodando.current && !cancelled) {
          const cur = stateRef.current
          addLog(`=== TURNO ${cur.turno} ===`)

          // Time Azul
          upd(p => ({ ...p, fase: 'player' }))
          await sleep(speed * 0.3)
          if (await processarTime('aliado') || !rodando.current || cancelled) break

          // Time Vermelho
          upd(p => ({ ...p, fase: 'enemy' }))
          await sleep(speed * 0.3)
          if (await processarTime('inimigo') || !rodando.current || cancelled) break

          // Fim do turno — reseta flags
          upd(p => ({
            ...p, turno: p.turno + 1,
            aliados: p.aliados.map(a => ({ ...a, jaMoveu: false, jaAtacou: false })),
            inimigos: p.inimigos.map(i => ({ ...i, jaMoveu: false, jaAtacou: false })),
          }))
        }
      } catch (err) {
        console.error('[SIM] Erro no loop:', err)
        addLog(`❌ ERRO: ${err.message}`)
      }

      // Fim da batalha
      const d = stateRef.current
      const av = d.aliados.filter(a => a.hp > 0)
      const iv = d.inimigos.filter(i => i.hp > 0)
      if (av.length === 0 || iv.length === 0) {
        rodando.current = false
        setTerminou(true)
        const vencedor = av.length > 0 ? 'TIME AZUL' : 'TIME VERMELHO'
        const iaV = av.length > 0
          ? d.ias.timeAzul.map(ia => ia.nome).join(' + ')
          : d.ias.timeVermelho.map(ia => ia.nome).join(' + ')
        addLog(`🏆 ${vencedor} venceu! (${iaV})`)
      }
    }

    loop()
    return () => { cancelled = true; rodando.current = false }
  }, [])

  const { aliados, inimigos, obstrucoes, turno, fase, ias } = state

  return (
    <div className="tatics-batalha">
      <div className="tatics-batalha-bg" />
      <div className="tatics-batalha-scanlines" />
      <div className="tatics-batalha-vignette" />
      <TurnoIndicator turno={turno} fase={fase} />
      <div className="tatics-sim-ia-bar">
        <div className="tatics-sim-ia-bar-item" style={{ color: '#00B4D8' }}>{ias.timeAzul.map(ia => ia.nome).join(' + ')}</div>
        <div className="tatics-sim-ia-bar-vs">VS</div>
        <div className="tatics-sim-ia-bar-item" style={{ color: '#E24B4A' }}>{ias.timeVermelho.map(ia => ia.nome).join(' + ')}</div>
      </div>
      <div className="tatics-batalha-gridarea" ref={gridRef}>
        <DanoPopup danos={danos} />
        <Grid aliados={aliados} inimigos={inimigos} alcance={[]} turnoFase="idle" onCasaClick={() => {}} obstrucoes={obstrucoes} alvoHighlight={null} />
      </div>
      {log && <div className="tatics-enemy-log"><span className="tatics-enemy-log-prompt">&gt;</span><span className="tatics-enemy-log-text">{log}</span></div>}
      <StatusBar personagens={aliados.filter(a => a.hp > 0)} lado="aliado" />
      <StatusBar personagens={inimigos.filter(i => i.hp > 0)} lado="inimigo" />
      <CombatResultModal resultado={combatResult} onFechar={() => setCombatResult(null)} />
      {enemyBanner && <EnemyTurnBanner acao={enemyBanner} onFechar={() => setEnemyBanner(null)} />}
      {terminou && (
        <div className="tatics-sim-fim-overlay">
          <div className="tatics-sim-fim-card">
            <div className="tatics-sim-fim-title">BATALHA ENCERRADA</div>
            <div className="tatics-sim-fim-info">{aliados.filter(a => a.hp > 0).length > 0 ? '🏆 TIME AZUL VENCEU!' : '🔥 TIME VERMELHO VENCEU!'}</div>
            <div className="tatics-sim-fim-sub" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.5rem', color: '#4F5359', marginTop: 4 }}>{ias.timeAzul.map(ia => ia.nome).join(' + ')} vs {ias.timeVermelho.map(ia => ia.nome).join(' + ')}</div>
          </div>
        </div>
      )}
    </div>
  )
}
