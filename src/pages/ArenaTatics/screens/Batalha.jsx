import { useState, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GridCanvas from '../components/GridCanvas'
import StatusBar from '../components/StatusBar'
import TurnoIndicator from '../components/TurnoIndicator'
import ActionMenu from '../components/ActionMenu'
import ConfirmEndTurn from '../components/ConfirmEndTurn'
import DanoPopup from '../components/DanoPopup'
import EventoBanner from '../components/EventoBanner'
import SkillPreviewModal from '../components/SkillPreviewModal'
import CombatResultModal from '../components/CombatResultModal'
import EnemyTurnBanner from '../components/EnemyTurnBanner'
import { StatusBadges } from '../components/JuiceComponents'
import { CLASSES } from '../data/classes'
import { getMultiplicadorElemental } from '../data/elementais'
import { getEventoAleatorio } from '../data/eventos'
import { getCorPorElemental } from '../data/cosmeticos'
import { useArenaTaticsStore } from '../store/useArenaTaticsStore'
import { screenShake, flashCelula } from '../data/juice'
import { getElem } from '../data/elementals'
import { sortearIAs, resolverAcaoIA, getDescricaoIA } from '../data/aiPersonalities'
import { resolverAtaque, processarStatus, temStatus, podeAgir, podeMover } from '../data/combat'

// ── Helpers ──
function getSkills(p) {
  // Novos personagens já têm skills embutidas
  if (p.skills && p.skills.length > 0 && p.skills[0].dano !== undefined) return p.skills
  const c = CLASSES[p.classe]; return c?.skills_base || []
}

// Conjunto de células ocupadas (aliados, inimigos, obstáculos)
function getOcupadas(aliados, inimigos, obstrucoes, ignoreId = null) {
  const set = new Set()
  aliados.forEach(a => { if (a.id !== ignoreId && a.hp > 0) set.add(`${a.x},${a.y}`) })
  inimigos.forEach(i => { if (i.hp > 0) set.add(`${i.x},${i.y}`) })
  obstrucoes.forEach(o => set.add(`${o.x},${o.y}`))
  return set
}

function getAlcanceMovimento(p, aliados = [], inimigos = [], obstrucoes = [], l = 16, c = 16) {
  const r = 3; const casas = []
  const ocup = getOcupadas(aliados, inimigos, obstrucoes, p.id)
  for (let dx = -r; dx <= r; dx++)
    for (let dy = -r; dy <= r; dy++)
      if (Math.abs(dx) + Math.abs(dy) <= r) {
        const nx = p.x + dx, ny = p.y + dy
        if (nx >= 0 && nx < c && ny >= 0 && ny < l && !ocup.has(`${nx},${ny}`))
          casas.push({ x: nx, y: ny })
      }
  return casas
}

function temLinhaVisao(x1, y1, x2, y2, obstrucoes = []) {
  // Verifica cada célula no caminho horizontal→vertical
  let cx = x1, cy = y1
  const obsSet = new Set(obstrucoes.map(o => `${o.x},${o.y}`))
  // Horizontal
  while (cx !== x2) { cx += cx < x2 ? 1 : -1; if ((cx !== x2 || cy !== y2) && obsSet.has(`${cx},${cy}`)) return false }
  // Vertical
  while (cy !== y2) { cy += cy < y2 ? 1 : -1; if ((cx !== x2 || cy !== y2) && obsSet.has(`${cx},${cy}`)) return false }
  return true
}

function getAlvoOcupadas(aliados, obstrucoes) {
  const set = new Set()
  aliados.forEach(a => { if (a.hp > 0) set.add(`${a.x},${a.y}`) })
  obstrucoes.forEach(o => set.add(`${o.x},${o.y}`))
  return set
}

function getAlcanceSkill(p, skill, aliados = [], inimigos = [], obstrucoes = [], l = 16, c = 16) {
  const casas = []
  // Apenas aliados e obstáculos bloqueiam — inimigos são ALVOS válidos
  const bloqueadas = getAlvoOcupadas(aliados, obstrucoes)
  for (let dx = -skill.alcance; dx <= skill.alcance; dx++)
    for (let dy = -skill.alcance; dy <= skill.alcance; dy++)
      if (Math.abs(dx) + Math.abs(dy) <= skill.alcance) {
        const nx = p.x + dx, ny = p.y + dy
        if (nx >= 0 && nx < c && ny >= 0 && ny < l && !bloqueadas.has(`${nx},${ny}`))
          if (temLinhaVisao(p.x, p.y, nx, ny, obstrucoes))
            casas.push({ x: nx, y: ny })
      }
  return casas
}

// ── Helper: verifica se um ponto está em um array de alcance ──
function estahEmAlcance(x, y, alcance) {
  return alcance.some(cel => cel.x === x && cel.y === y)
}

// ── Path calculator — BFS para contornar obstáculos corretamente ──
function calcularCaminho(x1, y1, x2, y2, bloqueadas = new Set(), l = 16, c = 16) {
  if (x1 === x2 && y1 === y2) return []
  
  // BFS: encontra caminho mais curto evitando bloqueadas
  const queue = [{ x: x1, y: y1, path: [] }]
  const visited = new Set([`${x1},${y1}`])
  
  while (queue.length > 0) {
    const { x, y, path } = queue.shift()
    
    // 4 direções: cima, baixo, esquerda, direita
    const neighbors = [
      { nx: x, ny: y - 1 }, // cima
      { nx: x, ny: y + 1 }, // baixo
      { nx: x - 1, ny: y }, // esquerda
      { nx: x + 1, ny: y }  // direita
    ]
    
    for (const { nx, ny } of neighbors) {
      // Verifica limites do grid
      if (nx < 0 || nx >= c || ny < 0 || ny >= l) continue
      
      const key = `${nx},${ny}`
      // Pula se já visitou ou se está bloqueado
      if (visited.has(key) || bloqueadas.has(key)) continue
      
      const newPath = [...path, { x: nx, y: ny }]
      
      // Chegou no destino!
      if (nx === x2 && ny === y2) return newPath
      
      visited.add(key)
      queue.push({ x: nx, y: ny, path: newPath })
    }
  }
  
  // Sem rota possível
  console.warn(`[Pathfinding] Sem rota de (${x1},${y1}) para (${x2},${y2})`)
  return []
}

// ── Fase label helper ──
function getFaseLabel(fase) {
  switch (fase) {
    case 'idle': return { texto: 'SEU TURNO', icone: '⚔️', cor: '#00B4D8' }
    case 'actionMenu': return { texto: 'ESCOLHA UMA AÇÃO', icone: '🎯', cor: '#F4A227' }
    case 'mover': return { texto: 'SELECIONE DESTINO', icone: '👣', cor: '#F4A227' }
    case 'skillSelect': return { texto: 'SELECIONE UM ATAQUE', icone: '⚡', cor: '#E24B4A' }
    case 'target': return { texto: 'MIRANDO', icone: '🎯', cor: '#E24B4A' }
    case 'animando': return { texto: 'ANIMANDO...', icone: '👣', cor: '#F4A227' }
    case 'inimigo': return { texto: 'INIMIGO AGINDO...', icone: '⏳', cor: '#E24B4A' }
    default: return { texto: '', icone: '', cor: '#4F5359' }
  }
}

export default function Batalha({ onVitoria, onDerrota }) {
  const store = useArenaTaticsStore()
  const batalha = store.batalha
  const [faseAcao, setFaseAcao] = useState('idle') // idle | actionMenu | mover | skillSelect | target | inimigo
  const [selectedAlly, setSelectedAlly] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [alcance, setAlcance] = useState([])
  const [danos, setDanos] = useState([])
  const [eventoAtual, setEventoAtual] = useState(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [animPos, setAnimPos] = useState(null)
  const [enemyTarget, setEnemyTarget] = useState(null)
  const [enemyLog, setEnemyLog] = useState('')
  const [enemyDisplay, setEnemyDisplay] = useState({ subFase: 'idle', alcance: [], animPos: null, currentEnemyId: null })
  const [caminhoAtivo, setCaminhoAtivo] = useState(null)
  const [passoAtual, setPassoAtual] = useState(0)
  const eventosUsados = useRef([])
  const danoId = useRef(0)
  const tickRef = useRef(0)
  const gridRef = useRef(null)
  const [combatResult, setCombatResult] = useState(null)
  const [enemyBanner, setEnemyBanner] = useState(null)
  const [iaInfo, setIaInfo] = useState(() => sortearIAs())
  const [freeLook, setFreeLook] = useState(false)
  const V = 600

  if (!batalha) return null
  const { aliados, inimigos, turno, obstrucoes = [] } = batalha
  const faseLabel = getFaseLabel(faseAcao)

  // Computa se personagem pode agir
  const jaMoveu = selectedAlly?.jaMoveu ?? false
  const jaAtacou = selectedAlly?.jaAtacou ?? false

  // Verifica se todos os aliados estão exaustos
  const todosExaustos = aliados.filter(a => a.hp > 0).every(a => a.jaMoveu && a.jaAtacou)

  // Se estiver animando movimento, mostra o ally na posição animada
  const aliadosVisiveis = animPos && selectedAlly
    ? aliados.map(a => a.id === selectedAlly.id ? { ...a, x: animPos.x, y: animPos.y } : a)
    : aliados

  // Durante animação do caminho, mostra só as células do caminho ainda não visitadas
  const alcanceVisivel = faseAcao === 'animando' && caminhoAtivo
    ? caminhoAtivo.slice(passoAtual)
    : alcance

  // Grid display: enemy phases override with their own alcance/turnoFase
  const gridTurnoFase = faseAcao === 'inimigo' && enemyDisplay.subFase !== 'idle'
    ? (enemyDisplay.subFase.startsWith('move') ? 'mover' : 'target')
    : faseAcao
  const gridAlcance = faseAcao === 'inimigo' ? enemyDisplay.alcance : alcanceVisivel

  // Enemy visual position during their animation
  const inimigosVisiveis = enemyDisplay.animPos
    ? inimigos.map(i => i.id === enemyDisplay.currentEnemyId ? { ...i, x: enemyDisplay.animPos.x, y: enemyDisplay.animPos.y } : i)
    : inimigos

  // ── Helpers visuais ──
  const showDano = (v, x, y, crit = false) => {
    const id = danoId.current++; setDanos(d => [...d, { id, valor: v, x, y, critico: crit }])
    setTimeout(() => setDanos(d => d.filter(dd => dd.id !== id)), 900)
  }

  const limparSelecao = () => {
    setSelectedAlly(null); setSelectedSkill(null); setAlcance([])
  }
  const limparAcao = () => {
    setSelectedSkill(null); setAlcance([])
  }

  // ── Verifica se todos exaustos e decide turno ──
  const verificarFimTurno = () => {
    if (todosExaustos) {
      setTimeout(() => turnoInimigo(), 400)
    } else {
      limparSelecao()
      setFaseAcao('idle')
    }
  }

  // ── 1. IDLE → clicou no personagem → ACTION MENU ──
  const handleAllyClick = (a) => {
    if (faseAcao !== 'idle') return
    if (a.jaMoveu && a.jaAtacou) return // exausto
    if (temStatus(a, 'atordoamento')) return // atordoado
    if (temStatus(a, 'silencio')) return // silenciado
    if (temStatus(a, 'congelado')) return // congelado
    setSelectedAlly(a); setFaseAcao('actionMenu')
  }

  // ── 2. ACTION MENU → escolheu MOVER ──
  const handleActionMover = () => {
    if (!selectedAlly) return
    setAlcance(getAlcanceMovimento(selectedAlly, aliados, inimigos, obstrucoes)); setFaseAcao('mover')
  }

  // ── 2b. ACTION MENU → escolheu ATACAR ──
  const handleActionAtacar = () => {
    if (!selectedAlly) return
    setAlcance([]); setFaseAcao('skillSelect')
  }

  // ── 2c. ACTION MENU → fechou (volta pra idle) ──
  const handleActionClose = () => {
    limparSelecao(); setFaseAcao('idle')
  }

  // ── 3. MOVER → clicou numa casa → anima caminho (lento, célula por célula) ──
  const handleMoveClick = (x, y, cel) => {
    if (!cel.emAlcance || !selectedAlly) return

    const ocup = getOcupadas(aliados, inimigos, obstrucoes, selectedAlly.id)
    const path = calcularCaminho(selectedAlly.x, selectedAlly.y, x, y, ocup)
    if (path.length === 0) { setFaseAcao('actionMenu'); return }

    // Mostra só o caminho, apaga o resto
    setAlcance(path)
    setCaminhoAtivo(path)
    setPassoAtual(0)
    selectedAlly.jaMoveu = true
    setFaseAcao('animando')

    let step = 0
    const TICK = V // ms por célula

    const tick = () => {
      if (step >= path.length) {
        selectedAlly.x = x; selectedAlly.y = y
        setAnimPos(null)
        setCaminhoAtivo(null)
        setAlcance([])
        // Se já atacou também → exausto, verifica todos
        if (selectedAlly.jaAtacou) {
          verificarFimTurno()
        } else {
          setFaseAcao('actionMenu')
        }
        return
      }
      setAnimPos(path[step])
      setPassoAtual(step + 1)
      step++
      setTimeout(tick, TICK)
    }
    setTimeout(tick, TICK)
  }

  const handleCancelMove = () => {
    setAlcance([]); setFaseAcao('actionMenu')
  }

  // ── 4. SKILL SELECT → escolheu uma skill ──
  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill); setAlcance(getAlcanceSkill(selectedAlly, skill, aliados, inimigos, obstrucoes)); setFaseAcao('target')
  }

  const handleCloseSkill = () => {
    setSelectedSkill(null); setFaseAcao('actionMenu')
  }

  // ── 5. TARGET → clicou no grid ──
  const handleTargetClick = (x, y, cel) => {
    if (!cel.emAlcance || !selectedSkill || !selectedAlly) return
    const alvo = inimigos.find(i => i.x === x && i.y === y)
    if (!alvo) return
    const mult = getMultiplicadorElemental(selectedAlly.elemental, alvo.elemental)
    const resultado = resolverAtaque(selectedAlly, alvo, selectedSkill, mult)
    const dano = resultado.dano
    const crit = resultado.critico

    // Juice: screen shake
    const elemAtacante = getElem(selectedAlly.elemental)
    screenShake(elemAtacante.shakePerfil, gridRef)

    // Juice: flash na célula do alvo
    flashCelula(`[data-cell="${alvo.x},${alvo.y}"]`, selectedAlly.elemental, 'recebe')

    // Aplica dano + consome energia via store (garante re-render da UI)
    const danoFinal = resultado.acertou ? Math.max(0, dano) : 0
    const custoEnergia = selectedSkill.custo || 0

    store.atualizarPersonagem('inimigos', alvo.id, { hp: Math.max(0, alvo.hp - danoFinal) })
    store.atualizarPersonagem('aliados', selectedAlly.id, {
      energia: Math.max(0, selectedAlly.energia - custoEnergia),
      jaAtacou: true,
    })
    // Mutação direta também para manter referência local consistente
    alvo.hp = Math.max(0, alvo.hp - danoFinal)
    selectedAlly.energia = Math.max(0, selectedAlly.energia - custoEnergia)
    selectedAlly.jaAtacou = true

    if (resultado.acertou) {
      showDano(danoFinal, x * 48 + 24, y * 48 + 24, crit)
    } else {
      showDano(0, x * 48 + 24, y * 48 + 24, false)
      setEnemyLog(`😤 ${selectedAlly.nome} errou!`)
    }

    // Juice: show combat result modal
    setCombatResult({
      atacante: { nome: selectedAlly.nome, elemental: selectedAlly.elemental },
      alvo: { nome: alvo.nome, elemental: alvo.elemental, hp: Math.max(0, alvo.hp - danoFinal), hpMax: alvo.hpMax },
      skill: selectedSkill,
      dano: danoFinal,
      critico: crit,
      acertou: resultado.acertou,
      missTipo: resultado.missTipo,
      status: resultado.status,
    })

    store.executarAcao({ tipo: 'ataque', de: selectedAlly.nome, alvo: alvo.nome, dano: danoFinal, critico: crit })

    const hpApos = Math.max(0, alvo.hp - danoFinal)
    if (hpApos <= 0) {
      const rest = inimigos.filter(i => i.hp > 0)
      if (rest.length === 0) {
        const g = Math.round(inimigos.reduce((a, i) => a + (i.recompensa_sdr || 10), 0) * (1 + turno * 0.05))
        return setTimeout(() => onVitoria(g), 500)
      }
    }

    limparAcao()

    // Se já moveu → exausto, verifica se todos acabaram
    if (selectedAlly.jaMoveu) {
      verificarFimTurno()
    } else {
      setFaseAcao('actionMenu')
    }
  }

  const handleBackToSkills = () => {
    setSelectedSkill(null); setAlcance([]); setFaseAcao('skillSelect')
  }

  // ── Grid click dispatcher (bloqueado no freeLook) ──
  const handleGridClick = (x, y, cel) => {
    if (freeLook) return // modo visualização: não executa ações
    if (faseAcao === 'mover') handleMoveClick(x, y, cel)
    else if (faseAcao === 'target') handleTargetClick(x, y, cel)
    else if (faseAcao === 'idle' && cel.aliado) handleAllyClick(cel.aliado)
  }

  // ── Helper: skills do inimigo por ID ──
  function getInimigoSkills(inimigo) {
    // Novos personagens já têm skills embutidas
    if (inimigo.skills && inimigo.skills.length > 0 && inimigo.skills[0].dano !== undefined) {
      return inimigo.skills
    }
    // Fallback: busca da classe
    const cls = CLASSES[inimigo.classe]
    if (!cls) return []
    const skillIds = inimigo.skills || cls.skills_base.map(s => s.id)
    return skillIds.map(id => cls.skills_base.find(s => s.id === id)).filter(Boolean)
  }

  // ── ENEMY TURN — visual completo como Player ──
  const turnoInimigo = useCallback(() => {
    setFaseAcao('inimigo')
    setEnemyDisplay({ subFase: 'idle', alcance: [], animPos: null, currentEnemyId: null })

    const inimigosVivos = [...inimigos].filter(i => i.hp > 0)
    const aliadosVivos = [...aliados].filter(a => a.hp > 0)
    if (inimigosVivos.length === 0 || aliadosVivos.length === 0) {
      store.avancarTurno();
      // Reseta flags de ação dos aliados para o novo turno
      aliados.forEach(a => { a.jaMoveu = false; a.jaAtacou = false })
      setFaseAcao('idle'); return
    }

    let currentIdx = 0

    function processarInimigo() {
      if (currentIdx >= inimigosVivos.length) {
        if ((turno + 1) % 3 === 0) {
          const ev = getEventoAleatorio(eventosUsados.current)
          eventosUsados.current.push(ev.id); setEventoAtual(ev)
        }
        setEnemyLog(''); setEnemyTarget(null)
        setEnemyDisplay({ subFase: 'idle', alcance: [], animPos: null, currentEnemyId: null })
        // Processa status em todos os personagens ao fim do turno inimigo
        ;[...aliados, ...inimigos].forEach(p => {
          const r = processarStatus(p)
          if (r.danoTotal > 0) {
            showDano(r.danoTotal, p.x * 48 + 24, p.y * 48 + 24, false)
            // Sincroniza HP alterado por status com a store
            const lado = aliados.includes(p) ? 'aliados' : 'inimigos'
            store.atualizarPersonagem(lado, p.id, { hp: p.hp })
          }
        })
        store.avancarTurno();
        // Reseta flags de ação dos aliados para o novo turno
        aliados.forEach(a => { a.jaMoveu = false; a.jaAtacou = false })
        setFaseAcao('idle')
        return
      }

      const inimigo = inimigosVivos[currentIdx]
      const alvo = [...aliados.filter(a => a.hp > 0)].sort((a, b) => a.hp - b.hp)[0]
      if (!alvo) { currentIdx++; setTimeout(processarInimigo, V * 0.3); return }

      const dist = Math.abs(inimigo.x - alvo.x) + Math.abs(inimigo.y - alvo.y)
      const skills = getInimigoSkills(inimigo)
      const melhorSkill = skills.filter(s => (s.dano || 0) > 0 && (inimigo.energia || 99) >= s.custo)
        .sort((a, b) => b.dano - a.dano)[0]

      const podeAtacar = melhorSkill && melhorSkill.alcance >= dist

      // ── STEP 1: THINKING + target highlight ──
      setEnemyLog(`🎯 ${inimigo.nome} → ${alvo.nome}`)
      setEnemyTarget({ x: alvo.x, y: alvo.y })
      setEnemyDisplay({ subFase: 'thinking', alcance: [], animPos: null, currentEnemyId: inimigo.id })
      tickRef.current++

      const attackRange = podeAtacar ? getAlcanceSkill(inimigo, melhorSkill, inimigos, aliados, obstrucoes) : []
      const temVisao = podeAtacar && estahEmAlcance(alvo.x, alvo.y, attackRange)

      if (podeAtacar && temVisao) {
        // ── LINHA DE VISÃO LIVRE: ataca direto ──
        setTimeout(() => {
          setEnemyDisplay({ subFase: 'attackPreview', alcance: attackRange, animPos: null, currentEnemyId: inimigo.id })
          setEnemyLog(`⚡ ${inimigo.nome} usa ${melhorSkill.nome}`)
          tickRef.current++

          setTimeout(() => {
            const mult = getMultiplicadorElemental(inimigo.elemental, alvo.elemental)
            const r = resolverAtaque(inimigo, alvo, melhorSkill, mult)
            const dano = r.dano

            // Juice: screen shake + flash
            const elemInimigo = getElem(inimigo.elemental)
            screenShake(elemInimigo.shakePerfil, gridRef)
            flashCelula(`[data-cell="${alvo.x},${alvo.y}"]`, inimigo.elemental, 'recebe')

            // Juice: enemy turn banner
            setEnemyBanner({ atacante: inimigo, alvo, skill: melhorSkill, resultado: r })

            if (r.acertou) {
              const danoFinal = Math.max(0, r.dano)
              alvo.hp = Math.max(0, alvo.hp - danoFinal)
              inimigo.energia = Math.max(0, inimigo.energia - (melhorSkill.custo || 0))
              showDano(danoFinal, alvo.x * 48 + 24, alvo.y * 48 + 24)
              store.atualizarPersonagem('aliados', alvo.id, { hp: alvo.hp })
              store.atualizarPersonagem('inimigos', inimigo.id, { energia: inimigo.energia })
              store.executarAcao({ tipo: 'ataque_inimigo', de: inimigo.nome, alvo: alvo.nome, dano: danoFinal })
              setEnemyLog(`💥 ${inimigo.nome} causou ${danoFinal} em ${alvo.nome}`)
            } else {
              setEnemyLog(`😤 ${inimigo.nome} errou o ataque!`)
            }
            setEnemyTarget(null)
            setEnemyDisplay({ subFase: 'attackDone', alcance: [], animPos: null, currentEnemyId: inimigo.id })
            tickRef.current++

            if (alvo.hp <= 0 && aliados.filter(a => a.hp > 0).length === 0) {
              setTimeout(() => onDerrota(), 800); return
            }

            currentIdx++
            setTimeout(processarInimigo, V * 0.5)
          }, V)
        }, V * 0.8)
      } else if (podeAtacar && !temVisao) {
        // ── OBSTÁCULO NO MEIO: tenta mover para uma célula com visão livre ──
        const moveRange = getAlcanceMovimento(inimigo, aliados, inimigos, obstrucoes)
        const ocup2 = getOcupadas(aliados, inimigos, obstrucoes, inimigo.id)

        // Procura célula onde o inimigo consegue atacar (alcance + linha de visão)
        let melhorCelula = null
        let melhorDist = Infinity
        for (const cell of moveRange) {
          // Simula o ataque dessa célula candidata
          const cellSkillRange = getAlcanceSkill(
            { ...inimigo, x: cell.x, y: cell.y },
            melhorSkill, inimigos, aliados, obstrucoes
          )
          if (estahEmAlcance(alvo.x, alvo.y, cellSkillRange)) {
            // Se a célula já está no caminho sem bloquear
            const caminho = calcularCaminho(inimigo.x, inimigo.y, cell.x, cell.y, ocup2)
            if (caminho.length > 0 || (cell.x === inimigo.x && cell.y === inimigo.y)) {
              const d = Math.abs(cell.x - alvo.x) + Math.abs(cell.y - alvo.y)
              if (d < melhorDist) { melhorDist = d; melhorCelula = cell }
            }
          }
        }

        if (melhorCelula) {
          // Achou célula viável → move e ataca
          const path = calcularCaminho(inimigo.x, inimigo.y, melhorCelula.x, melhorCelula.y, ocup2)
          setEnemyDisplay({ subFase: 'movePreview', alcance: moveRange, animPos: null, currentEnemyId: inimigo.id })
          setEnemyLog(`👣 ${inimigo.nome} contorna obstáculo`)
          setEnemyTarget(null)
          tickRef.current++

          const TICK = V
          let step = 0
          const tickMove = () => {
            if (step >= path.length) {
              inimigo.x = melhorCelula.x; inimigo.y = melhorCelula.y
              tickRef.current++

              // Ataca da nova posição
              const cellSkillRange2 = getAlcanceSkill(inimigo, melhorSkill, inimigos, aliados, obstrucoes)
              setEnemyDisplay({ subFase: 'attackPreview', alcance: cellSkillRange2, animPos: null, currentEnemyId: inimigo.id })
              setEnemyLog(`⚡ ${inimigo.nome} usa ${melhorSkill.nome}`)
              setEnemyTarget({ x: alvo.x, y: alvo.y })
              tickRef.current++

              setTimeout(() => {
                const mult = getMultiplicadorElemental(inimigo.elemental, alvo.elemental)
                const r = resolverAtaque(inimigo, alvo, melhorSkill, mult)
                const dano = r.dano

                const elemI = getElem(inimigo.elemental)
                screenShake(elemI.shakePerfil, gridRef)
                flashCelula(`[data-cell="${alvo.x},${alvo.y}"]`, inimigo.elemental, 'recebe')
                setEnemyBanner({ atacante: inimigo, alvo, skill: melhorSkill, resultado: r })

                if (r.acertou) {
                  const danoF = Math.max(0, r.dano)
                  alvo.hp = Math.max(0, alvo.hp - danoF)
                  inimigo.energia = Math.max(0, inimigo.energia - (melhorSkill.custo || 0))
                  showDano(danoF, alvo.x * 48 + 24, alvo.y * 48 + 24)
                  store.atualizarPersonagem('aliados', alvo.id, { hp: alvo.hp })
                  store.atualizarPersonagem('inimigos', inimigo.id, { energia: inimigo.energia })
                  store.executarAcao({ tipo: 'ataque_inimigo', de: inimigo.nome, alvo: alvo.nome, dano: danoF })
                  setEnemyLog(`💥 ${inimigo.nome} causou ${danoF} em ${alvo.nome}`)
                } else {
                  setEnemyLog(`😤 ${inimigo.nome} errou o ataque!`)
                }
                setEnemyTarget(null)
                setEnemyDisplay({ subFase: 'attackDone', alcance: [], animPos: null, currentEnemyId: inimigo.id })
                tickRef.current++

                if (alvo.hp <= 0 && aliados.filter(a => a.hp > 0).length === 0) {
                  setTimeout(() => onDerrota(), 800); return
                }
                currentIdx++
                setTimeout(processarInimigo, V * 0.5)
              }, V)
              return
            }
            setEnemyDisplay({
              subFase: 'moveAnim',
              alcance: path.slice(step),
              animPos: path[step],
              currentEnemyId: inimigo.id,
            })
            step++
            setTimeout(tickMove, TICK)
          }
          setTimeout(tickMove, TICK)
        } else {
          // Nenhuma célula viável → pula
          setEnemyLog(`😐 ${inimigo.nome} sem rota de ataque`)
          setEnemyTarget(null)
          setEnemyDisplay({ subFase: 'idle', alcance: [], animPos: null, currentEnemyId: null })
          tickRef.current++
          currentIdx++
          setTimeout(processarInimigo, V * 0.5)
        }
      } else {
        // ── PRECISA MOVER: mostra grid de movimento ──
        const moveRange = getAlcanceMovimento(inimigo, aliados, inimigos, obstrucoes)

        setTimeout(() => {
          setEnemyDisplay({ subFase: 'movePreview', alcance: moveRange, animPos: null, currentEnemyId: inimigo.id })
          setEnemyLog(`👣 ${inimigo.nome} calcula rota`)
          setEnemyTarget(null)
          tickRef.current++

          // Escolhe melhor célula: prefere com linha de visão, senão a mais perto
          let bestCell = null
          let bestDist = Infinity
          let fallbackCell = null
          let fallbackDist = Infinity
          for (const cell of moveRange) {
            const d = Math.abs(cell.x - alvo.x) + Math.abs(cell.y - alvo.y)
            // Tenta simular ataque dessa célula
            const cellSkillRange = getAlcanceSkill(
              { ...inimigo, x: cell.x, y: cell.y },
              melhorSkill, inimigos, aliados, obstrucoes
            )
            if (estahEmAlcance(alvo.x, alvo.y, cellSkillRange) && d < bestDist) {
              bestDist = d; bestCell = cell
            }
            // Fallback: célula mais perto do alvo
            if (d < fallbackDist) { fallbackDist = d; fallbackCell = cell }
          }
          // Se nenhuma célula tem visão, usa a mais perto
          if (!bestCell) bestCell = fallbackCell

          if (!bestCell) { currentIdx++; setTimeout(processarInimigo, V * 0.3); return }

          // ── ANIMA CAMINHO ──
          const ocup = getOcupadas(aliados, inimigos, obstrucoes, inimigo.id)
          const path = calcularCaminho(inimigo.x, inimigo.y, bestCell.x, bestCell.y, ocup)
          const TICK = V
          let step = 0

          const tick = () => {
            if (step >= path.length) {
              inimigo.x = bestCell.x; inimigo.y = bestCell.y
              tickRef.current++

              // ── AGORA TENTA ATACAR ──
              const dist2 = Math.abs(inimigo.x - alvo.x) + Math.abs(inimigo.y - alvo.y)
              const skill2 = skills.filter(s => (s.dano || 0) > 0 && (inimigo.energia || 99) >= s.custo)
                .sort((a, b) => b.dano - a.dano)[0]
              const pode2 = skill2 && skill2.alcance >= dist2

              if (pode2) {
                const attackRange = getAlcanceSkill(inimigo, skill2, inimigos, aliados, obstrucoes)
                setEnemyDisplay({ subFase: 'attackPreview', alcance: attackRange, animPos: null, currentEnemyId: inimigo.id })
                setEnemyLog(`⚡ ${inimigo.nome} usa ${skill2.nome}`)
                setEnemyTarget({ x: alvo.x, y: alvo.y })
                tickRef.current++

                setTimeout(() => {
                  // ── VALIDA: alvo ainda está no alcance (linha de visão)? ──
                  if (!estahEmAlcance(alvo.x, alvo.y, attackRange)) {
                    setEnemyLog(`😐 ${inimigo.nome} perdeu o alvo!`)
                    currentIdx++
                    setEnemyDisplay({ subFase: 'idle', alcance: [], animPos: null, currentEnemyId: null })
                    tickRef.current++
                    setTimeout(processarInimigo, V * 0.5)
                    return
                  }

                  const mult = getMultiplicadorElemental(inimigo.elemental, alvo.elemental)
                  const r = resolverAtaque(inimigo, alvo, melhorSkill, mult)
                  const dano = r.dano

                  const elemI2 = getElem(inimigo.elemental)
                  screenShake(elemI2.shakePerfil, gridRef)
                  flashCelula(`[data-cell="${alvo.x},${alvo.y}"]`, inimigo.elemental, 'recebe')
                  setEnemyBanner({ atacante: inimigo, alvo, skill: melhorSkill, resultado: r })

                  if (r.acertou) {
                    const danoFinal2 = Math.max(0, r.dano)
                    alvo.hp = Math.max(0, alvo.hp - danoFinal2)
                    inimigo.energia = Math.max(0, inimigo.energia - (melhorSkill.custo || 0))
                    showDano(danoFinal2, alvo.x * 48 + 24, alvo.y * 48 + 24)
                    store.atualizarPersonagem('aliados', alvo.id, { hp: alvo.hp })
                    store.atualizarPersonagem('inimigos', inimigo.id, { energia: inimigo.energia })
                    store.executarAcao({ tipo: 'ataque_inimigo', de: inimigo.nome, alvo: alvo.nome, dano: danoFinal2 })
                    setEnemyLog(`💥 ${inimigo.nome} causou ${danoFinal2} em ${alvo.nome}`)
                  } else {
                    setEnemyLog(`😤 ${inimigo.nome} errou o ataque!`)
                  }
                  setEnemyTarget(null)
                  setEnemyDisplay({ subFase: 'attackDone', alcance: [], animPos: null, currentEnemyId: inimigo.id })
                  tickRef.current++

                  if (alvo.hp <= 0 && aliados.filter(a => a.hp > 0).length === 0) {
                    setTimeout(() => onDerrota(), 800); return
                  }
                  currentIdx++
                  setTimeout(processarInimigo, V * 0.5)
                }, V)
              } else {
                setEnemyLog(`😤 ${inimigo.nome} não alcança`)
                currentIdx++
                setEnemyDisplay({ subFase: 'idle', alcance: [], animPos: null, currentEnemyId: null })
                setTimeout(processarInimigo, V * 0.5)
              }
              return
            }

            setEnemyDisplay({
              subFase: 'moveAnim',
              alcance: path.slice(step),
              animPos: path[step],
              currentEnemyId: inimigo.id,
            })
            step++
            setTimeout(tick, TICK)
          }
          setTimeout(tick, TICK)
        }, V * 0.8)
      }
    }

    setTimeout(processarInimigo, V * 0.8)
  }, [aliados, inimigos, turno, store, obstrucoes])

  // ── END TURN ──
  const handleEndTurn = () => {
    setShowEndConfirm(false); limparSelecao(); turnoInimigo()
  }

  return (
    <div className="tatics-batalha">
      {/* Batalha background effects */}
      <div className="tatics-batalha-bg" />
      <div className="tatics-batalha-scanlines" />
      <div className="tatics-batalha-vignette" />

      {/* Evento banner */}
      <AnimatePresence>{eventoAtual && <EventoBanner evento={eventoAtual} onClose={() => setEventoAtual(null)} />}</AnimatePresence>

      {/* Phase indicator */}
      <TurnoIndicator turno={turno} fase={faseAcao === 'inimigo' ? 'inimigo' : 'player'} />

      {/* Phase context bar */}
      {faseAcao !== 'inimigo' && (
        <div className="tatics-fasebar" style={{ '--fase-cor': faseLabel.cor }}>
          <span className="tatics-fasebar-texto">{faseLabel.icone} {faseLabel.texto}</span>
        </div>
      )}

      {/* Grid */}
      <div className="tatics-batalha-gridarea" ref={gridRef}>
        <DanoPopup danos={danos} />
        <GridCanvas aliados={aliadosVisiveis} inimigos={inimigosVisiveis} alcance={gridAlcance} turnoFase={gridTurnoFase} onCasaClick={handleGridClick} alvoHighlight={enemyTarget} obstrucoes={obstrucoes} freeLook={freeLook} />
      </div>

      {/* Free look toggle */}
      <button className={`tatics-freelook-btn${freeLook ? ' active' : ''}`}
        onClick={() => setFreeLook(f => !f)}
        title={freeLook ? 'Voltar ao modo combate' : 'Visualizar mapa'}
      >
        {freeLook ? '⚔' : '🔍'}
      </button>

      {/* Enemy log */}
      {enemyLog && (
        <div className="tatics-enemy-log">
          <span className="tatics-enemy-log-prompt">&gt;</span>
          <span className="tatics-enemy-log-text">{enemyLog}</span>
        </div>
      )}

      <StatusBar personagens={aliadosVisiveis.filter(a => a.hp > 0)} lado="aliado" />
      <StatusBar personagens={inimigosVisiveis.filter(i => i.hp > 0)} lado="inimigo" />

      {/* ── ACTION MENU (bottom sheet) ── */}
      <AnimatePresence>
        {faseAcao === 'actionMenu' && selectedAlly && (
          <ActionMenu
            personagem={selectedAlly}
            jaMoveu={jaMoveu}
            jaAtacou={jaAtacou}
            onMover={handleActionMover}
            onAtacar={handleActionAtacar}
            onItem={() => {}} // placeholder
            onClose={handleActionClose}
            onEndTurn={() => setShowEndConfirm(true)}
          />
        )}
      </AnimatePresence>

      {/* ── SKILL MODAL ── */}
      <AnimatePresence>
        {faseAcao === 'skillSelect' && selectedAlly && (
          <SkillPreviewModal personagem={selectedAlly} skills={getSkills(selectedAlly)}
            onUsar={handleSkillSelect}
            onFechar={handleCloseSkill} />
        )}
      </AnimatePresence>

      {/* ── COMBAT RESULT MODAL ── */}
      <CombatResultModal resultado={combatResult} onFechar={() => setCombatResult(null)} />

      {/* ── ENEMY TURN BANNER ── */}
      <AnimatePresence>
        {enemyBanner && (
          <EnemyTurnBanner acao={enemyBanner} onFechar={() => setEnemyBanner(null)} />
        )}
      </AnimatePresence>

      {/* ── IDLE: ally buttons + END TURN ── */}
      {faseAcao === 'idle' && (
        <div className="tatics-ally-section">
          <div className="tatics-ally-list">
            {aliados.filter(a => a.hp > 0).map(a => {
              const exausto = a.jaMoveu && a.jaAtacou
              const cor = getCorPorElemental(a.elemental || 'fogo')
              return (
                <motion.button key={a.id} whileTap={!exausto ? { scale: 0.95 } : {}}
                  onClick={() => !exausto && handleAllyClick(a)}
                  className={`tatics-ally-btn ${exausto ? 'ally-exausto' : ''}`}
                  style={exausto ? {} : {
                    background: `linear-gradient(135deg, ${cor}22, #0d0d0d)`,
                    border: `1px solid ${cor}44`,
                  }}>
                  <div className="tatics-ally-btn-icon">
                    {exausto ? '🔒' : a.classe === 'karuak' ? '🛡️' : a.classe === 'moraki' ? '🌪️' : a.classe === 'tivara' ? '🏹' : a.classe === 'zephyra' ? '🌊' : a.classe === 'ignis' ? '🔥' : '🗡️'}
                  </div>
                  <div className="tatics-ally-btn-name">{a.nome}</div>
                  <div className="tatics-ally-btn-hp">{a.hp}/{a.hpMax}</div>
                </motion.button>
              )
            })}
          </div>
          {/* End Turn button */}
          <button className="tatics-ally-endturn" onClick={() => setShowEndConfirm(true)}>
            ⏭ FINALIZAR TURNO
          </button>
        </div>
      )}

      {/* ── Mover instruction ── */}
      {faseAcao === 'mover' && (
        <div className="tatics-instruction">
          <span className="tatics-instruction-move">👣 Toque em uma casa amarela para mover {selectedAlly?.nome}</span>
          <button onClick={handleCancelMove} className="tatics-instruction-btn">CANCELAR ✕</button>
        </div>
      )}

      {/* ── Target instruction ── */}
      {faseAcao === 'target' && (
        <div className="tatics-instruction">
          <span className="tatics-instruction-attack">⚔️ Toque em um inimigo para usar {selectedSkill?.nome}</span>
          <button onClick={handleBackToSkills} className="tatics-instruction-btn">VOLTAR ◀</button>
        </div>
      )}

      {/* ── Inimigo agindo ── */}
      {faseAcao === 'inimigo' && (
        <div className="tatics-enemy-turn-info">
          {enemyLog || '⏳ INIMIGO AGINDO...'}
        </div>
      )}

      {/* ── Confirm End Turn modal ── */}
      <AnimatePresence>
        {showEndConfirm && (
          <ConfirmEndTurn
            onConfirm={handleEndTurn}
            onCancel={() => setShowEndConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
