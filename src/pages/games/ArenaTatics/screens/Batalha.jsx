import { useState, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import GridCanvas from '../components/GridCanvas'
import StatusBar from '../components/StatusBar'
import TurnoIndicator from '../components/TurnoIndicator'
import ActionMenu from '../components/ActionMenu'
import ConfirmEndTurn from '../components/ConfirmEndTurn'
import DanoPopup from '../components/DanoPopup'
import SkillPreviewModal from '../components/SkillPreviewModal'
import CombatResultModal from '../components/CombatResultModal'
import EnemyTurnBanner from '../components/EnemyTurnBanner'
import { StatusBadges } from '../components/JuiceComponents'
import { CLASSES } from '../data/classes'
import { getMultiplicadorElemental } from '../data/elementais'
import { getCorPorElemental } from '../data/cosmeticos'
import { useArenaTaticsStore } from '../store/useArenaTaticsStore'
import { screenShake, flashCelula } from '../data/juice'
import { getElem } from '../data/elementals'
import { sortearIAs, resolverAcaoIA, getDescricaoIA } from '../data/aiPersonalities'
import { resolverAtaque, processarStatus, temStatus, podeAgir, podeMover } from '../data/combat'

// â”€â”€ Helpers â”€â”€
function getSkills(p) {
  // Novos personagens jÃ¡ tÃªm skills embutidas
  if (p.skills && p.skills.length > 0 && p.skills[0].dano !== undefined) return p.skills
  const c = CLASSES[p.classe]; return c?.skills_base || []
}

// Conjunto de cÃ©lulas ocupadas (aliados, inimigos, obstÃ¡culos)
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
  // Verifica cada cÃ©lula no caminho horizontalâ†’vertical
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
  // Apenas aliados e obstÃ¡culos bloqueiam â€” inimigos sÃ£o ALVOS vÃ¡lidos
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

// â”€â”€ Helper: verifica se um ponto estÃ¡ em um array de alcance â”€â”€
function estahEmAlcance(x, y, alcance) {
  return alcance.some(cel => cel.x === x && cel.y === y)
}

// â”€â”€ Path calculator â€” BFS para contornar obstÃ¡culos corretamente â”€â”€
function calcularCaminho(x1, y1, x2, y2, bloqueadas = new Set(), l = 16, c = 16) {
  if (x1 === x2 && y1 === y2) return []
  
  // BFS: encontra caminho mais curto evitando bloqueadas
  const queue = [{ x: x1, y: y1, path: [] }]
  const visited = new Set([`${x1},${y1}`])
  
  while (queue.length > 0) {
    const { x, y, path } = queue.shift()
    
    // 4 direÃ§Ãµes: cima, baixo, esquerda, direita
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
      // Pula se jÃ¡ visitou ou se estÃ¡ bloqueado
      if (visited.has(key) || bloqueadas.has(key)) continue
      
      const newPath = [...path, { x: nx, y: ny }]
      
      // Chegou no destino!
      if (nx === x2 && ny === y2) return newPath
      
      visited.add(key)
      queue.push({ x: nx, y: ny, path: newPath })
    }
  }
  
  // Sem rota possÃ­vel
  console.warn(`[Pathfinding] Sem rota de (${x1},${y1}) para (${x2},${y2})`)
  return []
}

// â”€â”€ Fase label helper â”€â”€
function getFaseLabel(fase, t) {
  const map = {
    idle:        'tatics.fase_idle',
    actionMenu:  'tatics.fase_acao',
    mover:       'tatics.fase_mover',
    skillSelect: 'tatics.fase_skill',
    target:      'tatics.fase_target',
    animando:    'tatics.fase_animando',
    inimigo:     'tatics.fase_inimigo',
  }
  const corMap = {
    idle: '#00B4D8', actionMenu: '#F4A227', mover: '#F4A227',
    skillSelect: '#E24B4A', target: '#E24B4A', animando: '#F4A227', inimigo: '#E24B4A',
  }
  const iconeMap = {
    idle: 'âš”ï¸', actionMenu: 'ðŸŽ¯', mover: 'ðŸ‘£',
    skillSelect: 'âš¡', target: 'ðŸŽ¯', animando: 'ðŸ‘£', inimigo: 'â³',
  }
  const key = map[fase]
  if (key && t) return { texto: t(key), icone: iconeMap[fase] || '', cor: corMap[fase] || '#4F5359' }
  return { texto: '', icone: '', cor: '#4F5359' }
}

export default function Batalha({ onVitoria, onDerrota }) {
  const store = useArenaTaticsStore()
  const batalha = store.batalha
  const [faseAcao, setFaseAcao] = useState('idle') // idle | actionMenu | mover | skillSelect | target | inimigo
  const [selectedAlly, setSelectedAlly] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [alcance, setAlcance] = useState([])
  const [danos, setDanos] = useState([])
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [animPos, setAnimPos] = useState(null)
  const [enemyTarget, setEnemyTarget] = useState(null)
  const [enemyLog, setEnemyLog] = useState('')
  const [enemyDisplay, setEnemyDisplay] = useState({ subFase: 'idle', alcance: [], animPos: null, currentEnemyId: null })
  const [caminhoAtivo, setCaminhoAtivo] = useState(null)
  const [passoAtual, setPassoAtual] = useState(0)
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
  const { t } = useLanguage()
  const faseLabel = getFaseLabel(faseAcao, t)

  // Computa se personagem pode agir
  const jaMoveu = selectedAlly?.jaMoveu ?? false
  const jaAtacou = selectedAlly?.jaAtacou ?? false

  // Verifica se todos os aliados estÃ£o exaustos
  const todosExaustos = aliados.filter(a => a.hp > 0).every(a => a.jaMoveu && a.jaAtacou)

  // Se estiver animando movimento, mostra o ally na posiÃ§Ã£o animada
  const aliadosVisiveis = animPos && selectedAlly
    ? aliados.map(a => a.id === selectedAlly.id ? { ...a, x: animPos.x, y: animPos.y } : a)
    : aliados

  // Durante animaÃ§Ã£o do caminho, mostra sÃ³ as cÃ©lulas do caminho ainda nÃ£o visitadas
  const alcanceVisivel = faseAcao === 'animando' && caminhoAtivo
    ? caminhoAtivo.slice(passoAtual)
    : alcance

  // Grid display: enemy phases override with their own alcance/turnoFase
  const gridTurnoFase = faseAcao === 'inimigo' && enemyDisplay.subFase !== 'idle'
    ? (enemyDisplay.subFase === 'moveAnim' ? 'animando' : enemyDisplay.subFase.startsWith('move') ? 'mover' : 'target')
    : faseAcao
  const gridAlcance = faseAcao === 'inimigo' ? enemyDisplay.alcance : alcanceVisivel

  // Enemy visual position during their animation
  const inimigosVisiveis = enemyDisplay.animPos
    ? inimigos.map(i => i.id === enemyDisplay.currentEnemyId ? { ...i, x: enemyDisplay.animPos.x, y: enemyDisplay.animPos.y } : i)
    : inimigos

  // â”€â”€ Helpers visuais â”€â”€
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

  // â”€â”€ Verifica se todos exaustos e decide turno â”€â”€
  const verificarFimTurno = () => {
    if (todosExaustos) {
      setTimeout(() => turnoInimigo(), 400)
    } else {
      limparSelecao()
      setFaseAcao('idle')
    }
  }

  // â”€â”€ 1. IDLE â†’ clicou no personagem â†’ ACTION MENU â”€â”€
  const handleAllyClick = (a) => {
    if (faseAcao !== 'idle') return
    if (a.jaMoveu && a.jaAtacou) return // exausto
    if (temStatus(a, 'atordoamento')) return // atordoado
    if (temStatus(a, 'silencio')) return // silenciado
    if (temStatus(a, 'congelado')) return // congelado
    setSelectedAlly(a); setFaseAcao('actionMenu')
  }

  // â”€â”€ 2. ACTION MENU â†’ escolheu MOVER â”€â”€
  const handleActionMover = () => {
    if (!selectedAlly) return
    setAlcance(getAlcanceMovimento(selectedAlly, aliados, inimigos, obstrucoes)); setFaseAcao('mover')
  }

  // â”€â”€ 2b. ACTION MENU â†’ escolheu ATACAR â”€â”€
  const handleActionAtacar = () => {
    if (!selectedAlly) return
    setAlcance([]); setFaseAcao('skillSelect')
  }

  // â”€â”€ 2c. ACTION MENU â†’ fechou (volta pra idle) â”€â”€
  const handleActionClose = () => {
    limparSelecao(); setFaseAcao('idle')
  }

  // â”€â”€ 3. MOVER â†’ clicou numa casa â†’ anima caminho (lento, cÃ©lula por cÃ©lula) â”€â”€
  const handleMoveClick = (x, y, cel) => {
    if (!cel.emAlcance || !selectedAlly) return

    const ocup = getOcupadas(aliados, inimigos, obstrucoes, selectedAlly.id)
    const path = calcularCaminho(selectedAlly.x, selectedAlly.y, x, y, ocup)
    if (path.length === 0) { setFaseAcao('actionMenu'); return }

    // Mostra sÃ³ o caminho, apaga o resto
    setAlcance(path)
    setCaminhoAtivo(path)
    setPassoAtual(0)
    selectedAlly.jaMoveu = true
    setFaseAcao('animando')

    let step = 0
    const TICK = V // ms por cÃ©lula

    const tick = () => {
      if (step >= path.length) {
        selectedAlly.x = x; selectedAlly.y = y
        setAnimPos(null)
        setCaminhoAtivo(null)
        setAlcance([])
        // Se jÃ¡ atacou tambÃ©m â†’ exausto, verifica todos
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

  // â”€â”€ 4. SKILL SELECT â†’ escolheu uma skill â”€â”€
  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill); setAlcance(getAlcanceSkill(selectedAlly, skill, aliados, inimigos, obstrucoes)); setFaseAcao('target')
  }

  const handleCloseSkill = () => {
    setSelectedSkill(null); setFaseAcao('actionMenu')
  }

  // â”€â”€ 5. TARGET â†’ clicou no grid â”€â”€
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

    // Juice: flash na cÃ©lula do alvo
    flashCelula(`[data-cell="${alvo.x},${alvo.y}"]`, selectedAlly.elemental, 'recebe')

    // Aplica dano + consome energia via store (garante re-render da UI)
    const danoFinal = resultado.acertou ? Math.max(0, dano) : 0
    const custoEnergia = selectedSkill.custo || 0

    store.atualizarPersonagem('inimigos', alvo.id, { hp: Math.max(0, alvo.hp - danoFinal) })
    store.atualizarPersonagem('aliados', selectedAlly.id, {
      energia: Math.max(0, selectedAlly.energia - custoEnergia),
      jaAtacou: true,
    })
    // MutaÃ§Ã£o direta tambÃ©m para manter referÃªncia local consistente
    alvo.hp = Math.max(0, alvo.hp - danoFinal)
    selectedAlly.energia = Math.max(0, selectedAlly.energia - custoEnergia)
    selectedAlly.jaAtacou = true

    if (resultado.acertou) {
      showDano(danoFinal, x * 48 + 24, y * 48 + 24, crit)
    } else {
      showDano(0, x * 48 + 24, y * 48 + 24, false)
      setEnemyLog(`ðŸ˜¤ ${selectedAlly.nome} errou!`)
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

    // Se jÃ¡ moveu â†’ exausto, verifica se todos acabaram
    if (selectedAlly.jaMoveu) {
      verificarFimTurno()
    } else {
      setFaseAcao('actionMenu')
    }
  }

  const handleBackToSkills = () => {
    setSelectedSkill(null); setAlcance([]); setFaseAcao('skillSelect')
  }

  // â”€â”€ Grid click dispatcher (bloqueado no freeLook) â”€â”€
  const handleGridClick = (x, y, cel) => {
    if (freeLook) return // modo visualizaÃ§Ã£o: nÃ£o executa aÃ§Ãµes
    if (faseAcao === 'mover') handleMoveClick(x, y, cel)
    else if (faseAcao === 'target') handleTargetClick(x, y, cel)
    else if (faseAcao === 'idle' && cel.aliado) handleAllyClick(cel.aliado)
  }

  // â”€â”€ Helper: skills do inimigo por ID â”€â”€
  function getInimigoSkills(inimigo) {
    // Novos personagens jÃ¡ tÃªm skills embutidas
    if (inimigo.skills && inimigo.skills.length > 0 && inimigo.skills[0].dano !== undefined) {
      return inimigo.skills
    }
    // Fallback: busca da classe
    const cls = CLASSES[inimigo.classe]
    if (!cls) return []
    const skillIds = inimigo.skills || cls.skills_base.map(s => s.id)
    return skillIds.map(id => cls.skills_base.find(s => s.id === id)).filter(Boolean)
  }

  // â”€â”€ ENEMY TURN â€” visual completo como Player â”€â”€
  const turnoInimigo = useCallback(() => {
    setFaseAcao('inimigo')
    setEnemyDisplay({ subFase: 'idle', alcance: [], animPos: null, currentEnemyId: null })

    const inimigosVivos = [...inimigos].filter(i => i.hp > 0)
    const aliadosVivos = [...aliados].filter(a => a.hp > 0)
    if (inimigosVivos.length === 0 || aliadosVivos.length === 0) {
      store.avancarTurno();
      // Reseta flags de aÃ§Ã£o dos aliados para o novo turno
      aliados.forEach(a => { a.jaMoveu = false; a.jaAtacou = false })
      setFaseAcao('idle'); return
    }

    let currentIdx = 0

    function processarInimigo() {
      if (currentIdx >= inimigosVivos.length) {
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
        // Reseta flags de aÃ§Ã£o dos aliados para o novo turno
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

      // â”€â”€ STEP 1: THINKING + target highlight â”€â”€
      setEnemyLog(`ðŸŽ¯ ${inimigo.nome} â†’ ${alvo.nome}`)
      setEnemyTarget({ x: alvo.x, y: alvo.y })
      setEnemyDisplay({ subFase: 'thinking', alcance: [], animPos: null, currentEnemyId: inimigo.id })
      tickRef.current++

      const attackRange = podeAtacar ? getAlcanceSkill(inimigo, melhorSkill, inimigos, aliados, obstrucoes) : []
      const temVisao = podeAtacar && estahEmAlcance(alvo.x, alvo.y, attackRange)

      if (podeAtacar && temVisao) {
        // â”€â”€ LINHA DE VISÃƒO LIVRE: ataca direto â”€â”€
        setTimeout(() => {
          setEnemyDisplay({ subFase: 'attackPreview', alcance: attackRange, animPos: null, currentEnemyId: inimigo.id })
          setEnemyLog(`âš¡ ${inimigo.nome} usa ${melhorSkill.nome}`)
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
              setEnemyLog(`ðŸ’¥ ${inimigo.nome} causou ${danoFinal} em ${alvo.nome}`)
            } else {
              setEnemyLog(`ðŸ˜¤ ${inimigo.nome} errou o ataque!`)
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
        // â”€â”€ OBSTÃCULO NO MEIO: tenta mover para uma cÃ©lula com visÃ£o livre â”€â”€
        const moveRange = getAlcanceMovimento(inimigo, aliados, inimigos, obstrucoes)
        const ocup2 = getOcupadas(aliados, inimigos, obstrucoes, inimigo.id)

        // Procura cÃ©lula onde o inimigo consegue atacar (alcance + linha de visÃ£o)
        let melhorCelula = null
        let melhorDist = Infinity
        for (const cell of moveRange) {
          // Simula o ataque dessa cÃ©lula candidata
          const cellSkillRange = getAlcanceSkill(
            { ...inimigo, x: cell.x, y: cell.y },
            melhorSkill, inimigos, aliados, obstrucoes
          )
          if (estahEmAlcance(alvo.x, alvo.y, cellSkillRange)) {
            // Se a cÃ©lula jÃ¡ estÃ¡ no caminho sem bloquear
            const caminho = calcularCaminho(inimigo.x, inimigo.y, cell.x, cell.y, ocup2)
            if (caminho.length > 0 || (cell.x === inimigo.x && cell.y === inimigo.y)) {
              const d = Math.abs(cell.x - alvo.x) + Math.abs(cell.y - alvo.y)
              if (d < melhorDist) { melhorDist = d; melhorCelula = cell }
            }
          }
        }

        if (melhorCelula) {
          // Achou cÃ©lula viÃ¡vel â†’ move e ataca
          const path = calcularCaminho(inimigo.x, inimigo.y, melhorCelula.x, melhorCelula.y, ocup2)
          setEnemyDisplay({ subFase: 'movePreview', alcance: moveRange, animPos: null, currentEnemyId: inimigo.id })
          setEnemyLog(`ðŸ‘£ ${inimigo.nome} contorna obstÃ¡culo`)
          setEnemyTarget(null)
          tickRef.current++

          const TICK = V
          let step = 0
          const tickMove = () => {
            if (step >= path.length) {
              inimigo.x = melhorCelula.x; inimigo.y = melhorCelula.y
              tickRef.current++

              // Ataca da nova posiÃ§Ã£o
              const cellSkillRange2 = getAlcanceSkill(inimigo, melhorSkill, inimigos, aliados, obstrucoes)
              setEnemyDisplay({ subFase: 'attackPreview', alcance: cellSkillRange2, animPos: null, currentEnemyId: inimigo.id })
              setEnemyLog(`âš¡ ${inimigo.nome} usa ${melhorSkill.nome}`)
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
                  setEnemyLog(`ðŸ’¥ ${inimigo.nome} causou ${danoF} em ${alvo.nome}`)
                } else {
                  setEnemyLog(`ðŸ˜¤ ${inimigo.nome} errou o ataque!`)
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
          // Nenhuma cÃ©lula viÃ¡vel â†’ pula
          setEnemyLog(`ðŸ˜ ${inimigo.nome} sem rota de ataque`)
          setEnemyTarget(null)
          setEnemyDisplay({ subFase: 'idle', alcance: [], animPos: null, currentEnemyId: null })
          tickRef.current++
          currentIdx++
          setTimeout(processarInimigo, V * 0.5)
        }
      } else {
        // â”€â”€ PRECISA MOVER: mostra grid de movimento â”€â”€
        const moveRange = getAlcanceMovimento(inimigo, aliados, inimigos, obstrucoes)

        setTimeout(() => {
          setEnemyDisplay({ subFase: 'movePreview', alcance: moveRange, animPos: null, currentEnemyId: inimigo.id })
          setEnemyLog(`ðŸ‘£ ${inimigo.nome} calcula rota`)
          setEnemyTarget(null)
          tickRef.current++

          // Escolhe melhor cÃ©lula: prefere com linha de visÃ£o, senÃ£o a mais perto
          let bestCell = null
          let bestDist = Infinity
          let fallbackCell = null
          let fallbackDist = Infinity
          for (const cell of moveRange) {
            const d = Math.abs(cell.x - alvo.x) + Math.abs(cell.y - alvo.y)
            // Tenta simular ataque dessa cÃ©lula
            const cellSkillRange = getAlcanceSkill(
              { ...inimigo, x: cell.x, y: cell.y },
              melhorSkill, inimigos, aliados, obstrucoes
            )
            if (estahEmAlcance(alvo.x, alvo.y, cellSkillRange) && d < bestDist) {
              bestDist = d; bestCell = cell
            }
            // Fallback: cÃ©lula mais perto do alvo
            if (d < fallbackDist) { fallbackDist = d; fallbackCell = cell }
          }
          // Se nenhuma cÃ©lula tem visÃ£o, usa a mais perto
          if (!bestCell) bestCell = fallbackCell

          if (!bestCell) { currentIdx++; setTimeout(processarInimigo, V * 0.3); return }

          // â”€â”€ ANIMA CAMINHO â”€â”€
          const ocup = getOcupadas(aliados, inimigos, obstrucoes, inimigo.id)
          const path = calcularCaminho(inimigo.x, inimigo.y, bestCell.x, bestCell.y, ocup)
          const TICK = V
          let step = 0

          const tick = () => {
            if (step >= path.length) {
              inimigo.x = bestCell.x; inimigo.y = bestCell.y
              tickRef.current++

              // â”€â”€ AGORA TENTA ATACAR â”€â”€
              const dist2 = Math.abs(inimigo.x - alvo.x) + Math.abs(inimigo.y - alvo.y)
              const skill2 = skills.filter(s => (s.dano || 0) > 0 && (inimigo.energia || 99) >= s.custo)
                .sort((a, b) => b.dano - a.dano)[0]
              const pode2 = skill2 && skill2.alcance >= dist2

              if (pode2) {
                const attackRange = getAlcanceSkill(inimigo, skill2, inimigos, aliados, obstrucoes)
                setEnemyDisplay({ subFase: 'attackPreview', alcance: attackRange, animPos: null, currentEnemyId: inimigo.id })
                setEnemyLog(`âš¡ ${inimigo.nome} usa ${skill2.nome}`)
                setEnemyTarget({ x: alvo.x, y: alvo.y })
                tickRef.current++

                setTimeout(() => {
                  // â”€â”€ VALIDA: alvo ainda estÃ¡ no alcance (linha de visÃ£o)? â”€â”€
                  if (!estahEmAlcance(alvo.x, alvo.y, attackRange)) {
                    setEnemyLog(`ðŸ˜ ${inimigo.nome} perdeu o alvo!`)
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
                    setEnemyLog(`ðŸ’¥ ${inimigo.nome} causou ${danoFinal2} em ${alvo.nome}`)
                  } else {
                    setEnemyLog(`ðŸ˜¤ ${inimigo.nome} errou o ataque!`)
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
                setEnemyLog(`ðŸ˜¤ ${inimigo.nome} nÃ£o alcanÃ§a`)
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

  // â”€â”€ END TURN â”€â”€
  const handleEndTurn = () => {
    setShowEndConfirm(false); limparSelecao(); turnoInimigo()
  }

  return (
    <div className="tatics-batalha">
      {/* Batalha background effects */}
      <div className="tatics-batalha-bg" />
      <div className="tatics-batalha-scanlines" />
      <div className="tatics-batalha-vignette" />

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
        {freeLook ? 'âš”' : 'ðŸ”'}
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

      {/* â”€â”€ ACTION MENU (bottom sheet) â”€â”€ */}
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

      {/* â”€â”€ SKILL MODAL â”€â”€ */}
      <AnimatePresence>
        {faseAcao === 'skillSelect' && selectedAlly && (
          <SkillPreviewModal personagem={selectedAlly} skills={getSkills(selectedAlly)}
            onUsar={handleSkillSelect}
            onFechar={handleCloseSkill} />
        )}
      </AnimatePresence>

      {/* â”€â”€ COMBAT RESULT MODAL â”€â”€ */}
      <CombatResultModal resultado={combatResult} onFechar={() => setCombatResult(null)} />

      {/* â”€â”€ ENEMY TURN BANNER â”€â”€ */}
      <AnimatePresence>
        {enemyBanner && (
          <EnemyTurnBanner acao={enemyBanner} onFechar={() => setEnemyBanner(null)} />
        )}
      </AnimatePresence>

      {/* â”€â”€ IDLE: ally buttons + END TURN â”€â”€ */}
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
                    {exausto ? 'ðŸ”’' : a.classe === 'karuak' ? 'ðŸ›¡ï¸' : a.classe === 'moraki' ? 'ðŸŒªï¸' : a.classe === 'tivara' ? 'ðŸ¹' : a.classe === 'zephyra' ? 'ðŸŒŠ' : a.classe === 'ignis' ? 'ðŸ”¥' : 'ðŸ—¡ï¸'}
                  </div>
                  <div className="tatics-ally-btn-name">{a.nome}</div>
                  <div className="tatics-ally-btn-hp">{a.hp}/{a.hpMax}</div>
                </motion.button>
              )
            })}
          </div>
          {/* End Turn button */}
          <button className="tatics-ally-endturn" onClick={() => setShowEndConfirm(true)}>
            â­ FINALIZAR TURNO
          </button>
        </div>
      )}

      {/* â”€â”€ Mover instruction â”€â”€ */}
      {faseAcao === 'mover' && (
        <div className="tatics-instruction">
          <span className="tatics-instruction-move">ðŸ‘£ Toque em uma casa amarela para mover {selectedAlly?.nome}</span>
          <button onClick={handleCancelMove} className="tatics-instruction-btn">CANCELAR âœ•</button>
        </div>
      )}

      {/* â”€â”€ Target instruction â”€â”€ */}
      {faseAcao === 'target' && (
        <div className="tatics-instruction">
          <span className="tatics-instruction-attack">âš”ï¸ Toque em um inimigo para usar {selectedSkill?.nome}</span>
          <button onClick={handleBackToSkills} className="tatics-instruction-btn">VOLTAR â—€</button>
        </div>
      )}

      {/* â”€â”€ Inimigo agindo â”€â”€ */}
      {faseAcao === 'inimigo' && (
        <div className="tatics-enemy-turn-info">
          {enemyLog || 'â³ INIMIGO AGINDO...'}
        </div>
      )}

      {/* â”€â”€ Confirm End Turn modal â”€â”€ */}
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
