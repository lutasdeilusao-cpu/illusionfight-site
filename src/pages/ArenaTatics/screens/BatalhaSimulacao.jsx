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

export default function BatalhaSimulacao({ config, onFim }) {
  const { numChars, numIAs, ias: iasConfig, speed } = config

  // Estado inicial único — tudo num useState pra evitar stale closures
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
  const [log, setLog] = useState('')
  const [combatResult, setCombatResult] = useState(null)
  const [enemyBanner, setEnemyBanner] = useState(null)
  const [terminou, setTerminou] = useState(false)
  const gridRef = useRef(null)
  const danoId = useRef(0)
  const rodando = useRef(true)

  const addLog = (msg) => { setLog(msg) }
  const showDano = (v, x, y, crit = false) => {
    const id = danoId.current++
    setDanos(d => [...d, { id, valor: v, x, y, critico: crit }])
    setTimeout(() => setDanos(d => d.filter(dd => dd.id !== id)), 900)
  }
  const upd = (fn) => setState(prev => { const n = fn(prev); stateRef.current = n; return n })

  // Ação de um personagem
  const agir = (p, timeAliados, timeInimigos, iasDoTime, lado) => new Promise(resolve => {
    if (!rodando.current || p.hp <= 0) { resolve(); return }
    const ia = iasDoTime[Math.floor(Math.random() * iasDoTime.length)]
    const acao = resolverAcaoIA(p, ia, ia, timeAliados, timeInimigos)
    if (!acao?.skill || !acao?.alvo) {
      const novaX = lado === 'aliado' ? Math.min(7, p.x + 1) : Math.max(0, p.x - 1)
      const key = lado === 'aliado' ? 'aliados' : 'inimigos'
      upd(prev => ({ ...prev, [key]: prev[key].map(a => a.id === p.id ? { ...a, x: novaX, jaMoveu: true, jaAtacou: true } : a) }))
      addLog(`🚶 ${p.nome} avançou`)
      setTimeout(resolve, speed * 0.5)
      return
    }
    const { skill, alvo } = acao
    addLog(`⚡ ${p.nome} → ${skill.nome} → ${alvo.nome}`)
    const resultado = resolverAtaque(p, alvo, skill, getMultiplicadorElemental(p.elemental, alvo.elemental))
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
      const ladoAlvo = timeAliados.includes(alvo) ? 'aliados' : 'inimigos'
      const ladoAtk = lado === 'aliado' ? 'aliados' : 'inimigos'
      upd(prev => ({
        ...prev,
        [ladoAlvo]: prev[ladoAlvo].map(x => x.id === alvo.id ? { ...x, hp: Math.max(0, x.hp - danoFinal) } : x),
        [ladoAtk]: prev[ladoAtk].map(x => x.id === p.id ? { ...x, jaMoveu: true, jaAtacou: true } : x),
      }))
    } else {
      showDano(0, alvo.x * 48 + 24, alvo.y * 48 + 24, false)
      const ladoAtk = lado === 'aliado' ? 'aliados' : 'inimigos'
      upd(prev => ({ ...prev, [ladoAtk]: prev[ladoAtk].map(x => x.id === p.id ? { ...x, jaMoveu: true, jaAtacou: true } : x) }))
    }
    setTimeout(resolve, speed)
  })

  // Processa um time
  const processarTime = async (time, oponentes, iasDoTime, lado) => {
    const key = lado === 'aliado' ? 'aliados' : 'inimigos'
    for (const p of time.filter(x => x.hp > 0)) {
      if (!rodando.current) break
      const cur = stateRef.current
      await agir(p, cur[key], key === 'aliados' ? cur.inimigos : cur.aliados, iasDoTime, lado)
      const d = stateRef.current
      const av = d.aliados.filter(a => a.hp > 0)
      const iv = d.inimigos.filter(i => i.hp > 0)
      if (av.length === 0 || iv.length === 0) {
        rodando.current = false; setTerminou(true)
        const vencedor = av.length > 0 ? 'TIME AZUL' : 'TIME VERMELHO'
        const iaV = av.length > 0 ? d.ias.timeAzul.map(ia => ia.nome).join(' + ') : d.ias.timeVermelho.map(ia => ia.nome).join(' + ')
        const desc = av.length > 0 ? getDescricaoIA(d.ias.timeAzul[0], d.ias.timeAzul[1] || d.ias.timeAzul[0]) : getDescricaoIA(d.ias.timeVermelho[0], d.ias.timeVermelho[1] || d.ias.timeVermelho[0])
        addLog(`🏆 ${vencedor} venceu! (${desc})`)
        setTimeout(() => onFim?.({ vencedor, iaVencedora: iaV, turnos: d.turno, descricao: desc, aliadosSobreviventes: av.map(a => a.nome), inimigosSobreviventes: iv.map(i => i.nome) }), 1500)
        return true
      }
    }
    return false
  }

  // Loop principal
  useEffect(() => {
    if (terminou) return
    let cancelled = false
    const loop = async () => {
      while (rodando.current && !cancelled) {
        let cur = stateRef.current
        addLog(`=== TURNO ${cur.turno} ===`)
        upd(p => ({ ...p, fase: 'player' }))
        if (await processarTime(cur.aliados, cur.inimigos, cur.ias.timeAzul, 'aliado') || !rodando.current || cancelled) break
        cur = stateRef.current
        upd(p => ({ ...p, fase: 'enemy' }))
        if (await processarTime(cur.inimigos, cur.aliados, cur.ias.timeVermelho, 'inimigo') || !rodando.current || cancelled) break
        upd(p => ({ ...p, turno: p.turno + 1, aliados: p.aliados.map(a => ({ ...a, jaMoveu: false, jaAtacou: false })), inimigos: p.inimigos.map(i => ({ ...i, jaMoveu: false, jaAtacou: false })) }))
      }
    }
    loop()
    return () => { cancelled = true; rodando.current = false }
  }, [terminou])

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
          </div>
        </div>
      )}
    </div>
  )
}
