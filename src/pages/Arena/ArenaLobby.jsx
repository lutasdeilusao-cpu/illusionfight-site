import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useArenaStore } from './store/useArenaStore'
import enemiesData from './data/arena-enemies.json'

const ELEM_COLORS = {
  fogo: '#F5A623', agua: '#00B4D8', terra: '#22C55E', ar: '#A855F4',
  trevas: '#8B0000', luz: '#F5A623', neutro: '#666'
}
const DIFF_COLORS = { easy: '#22C55E', medium: '#F5A623', hard: '#8B0000', very_hard: '#A855F4' }
const DIFF_LABELS = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD', very_hard: 'VERY HARD' }

const delay = ms => new Promise(res => setTimeout(res, ms))

function NeoGuideIntro({ onShow }) {
  const [passo, setPasso] = useState(0)
  const [texto, setTexto] = useState('')
  const [digitando, setDigitando] = useState(true)
  const mountedRef = useRef(true)

  const linhas = [
    'Bem-vindo ao LDI Arena, lutador.',
    'Aqui, cada batalha é real. Escolha sua ficha ou monte um novo guerreiro.',
  ]
  const velocidade = 30

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (passo >= linhas.length) { setDigitando(false); return }
    let i = 0
    setTexto('')
    setDigitando(true)
    const interval = setInterval(() => {
      if (!mountedRef.current) { clearInterval(interval); return }
      if (i >= linhas[passo].length) { clearInterval(interval); setTimeout(() => { if (mountedRef.current) { setPasso(p => p + 1); setTexto(prev => prev) } }, 600); return }
      setTexto(linhas[passo].slice(0, i + 1))
      i++
    }, velocidade)
    return () => clearInterval(interval)
  }, [passo])

  return (
    <div className="arena-lobby-intro">
      <div className="arena-ng-avatar">◈</div>
      <div className="arena-ng-text">
        {passo === 0 ? texto : linhas[0]}
        {passo === 0 && <span className="arena-ng-cursor" />}
      </div>
      {passo >= 1 && (
        <div className="arena-ng-text">
          {texto}
          {passo === 1 && digitando && <span className="arena-ng-cursor" />}
        </div>
      )}
      {!digitando && (
        <motion.button className="arena-ng-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }} onClick={onShow}>
          MOSTRAR FICHAS
        </motion.button>
      )}
    </div>
  )
}

export default function ArenaLobby({ onNavigate }) {
  const { user } = useAuth()
  const store = useArenaStore()
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showIntro, setShowIntro] = useState(true)
  const [showEnemies, setShowEnemies] = useState(null)

  useEffect(() => {
    if (!user) return
    store.loadSheets(user.id).then(data => { setSheets(data); setLoading(false) })
  }, [user])

  const handleLutar = (sheet) => {
    store.loadSheet(sheet)
    setShowEnemies(sheet)
  }

  const handleSelectEnemy = (enemy) => {
    store.startMatch(enemy)
    onNavigate('combat')
  }

  const elemColor = (el) => ELEM_COLORS[el] || '#666'

  if (showIntro) {
    return (
      <div className="arena-lobby">
        <div className="arena-header">
          <button className="arena-back" onClick={() => window.history.back()}>← extras</button>
          <h1 className="arena-titulo"><span className="arena-titulo-glitch" data-text="LDI ARENA">LDI ARENA</span></h1>
        </div>
        <NeoGuideIntro onShow={() => setShowIntro(false)} />
      </div>
    )
  }

  const tiers = [1, 2, 3, 4]
  const enemiesByTier = tiers.map(t => enemiesData.filter(e => e.tier === t)).filter(g => g.length > 0)

  if (showEnemies) {
    const selectedSheet = showEnemies
    const sElem = selectedSheet.elemental || 'neutro'
    const sColor = elemColor(sElem)
    return (
      <div className="arena-lobby">
        <div className="arena-header">
          <button className="arena-back" onClick={() => setShowEnemies(null)}>← fichas</button>
          <h2 className="arena-titulo-menor">selecione o inimigo</h2>
        </div>

        <div className="arena-sheet-card-v" style={{ '--elem-cor': sColor, '--elem-cor-hover': sColor, maxWidth: 600, margin: '0 auto 16px', cursor: 'default', borderLeftWidth: 2 }}>
          <div className="arena-sheet-avatar" style={{ background: sColor }}>
            {selectedSheet.sheet_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="arena-sheet-info">
            <div className="arena-sheet-name-v">{selectedSheet.sheet_name}</div>
            <div className="arena-sheet-attrs-v">
              F:{selectedSheet.attributes?.F||0} H:{selectedSheet.attributes?.H||0} R:{selectedSheet.attributes?.R||0} A:{selectedSheet.attributes?.A||0} PdF:{selectedSheet.attributes?.PdF||0}
            </div>
          </div>
          <div className="arena-sheet-arrow">⚔️</div>
        </div>

        <div className="arena-enemy-list">
          {enemiesByTier.map((group, gi) => [
            <div key={`tier-${gi}`} className="arena-enemy-tier-sep">TIER {gi + 1}</div>,
            ...group.map(enemy => {
              const diffColor = DIFF_COLORS[enemy.difficulty] || '#888'
              const eColor = elemColor(enemy.elemental)
              return (
                <motion.div key={enemy.id} className="arena-enemy-card-v"
                  style={{ '--cor': eColor }}
                  onClick={() => handleSelectEnemy(enemy)} whileHover={{}}>
                  <div className="arena-enemy-diff" style={{ color: diffColor }}>{DIFF_LABELS[enemy.difficulty] || enemy.difficulty}</div>
                  <div className="arena-enemy-av" style={{ background: eColor }}>{enemy.name[0]}</div>
                  <div className="arena-enemy-info">
                    <div className="arena-enemy-name-v">{enemy.name}</div>
                    <div className="arena-enemy-rank-v">Rank #{enemy.rank}</div>
                    <div className="arena-enemy-attrs-v">
                      F:{enemy.stats.F} H:{enemy.stats.H} R:{enemy.stats.R} A:{enemy.stats.A} PdF:{enemy.stats.PdF}
                    </div>
                  </div>
                  <div className="arena-sheet-arrow">→</div>
                </motion.div>
              )
            })
          ])}
        </div>
      </div>
    )
  }

  return (
    <div className="arena-lobby">
      <div className="arena-header">
        <button className="arena-back" onClick={() => window.history.back()}>← extras</button>
        <h1 className="arena-titulo"><span className="arena-titulo-glitch" data-text="LDI ARENA">LDI ARENA</span></h1>
        <p className="arena-sub"><span className="arena-cursor">█</span> crie sua ficha. lute contra a CPU. suba no ranking.</p>
      </div>

      <div className="arena-section-label">
        <span>▶ SUAS FICHAS</span>
        <div className="arena-section-linha" />
      </div>

      {loading && <p className="arena-loading">carregando...</p>}
      {!loading && sheets.length === 0 && (
        <p className="arena-empty">nenhuma ficha ainda. crie sua primeira!</p>
      )}

      <div className="arena-sheet-list">
        {sheets.map(sheet => {
          const sElem = sheet.elemental || 'neutro'
          const sColor = elemColor(sElem)
          return (
            <motion.div key={sheet.id} className="arena-sheet-card-v"
              style={{ '--elem-cor': sColor, '--elem-cor-hover': sColor }}
              whileHover={{}} onClick={() => handleLutar(sheet)}>
              <div className="arena-sheet-avatar" style={{ background: sColor }}>
                {sheet.sheet_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="arena-sheet-info">
                <div className="arena-sheet-name-v">{sheet.sheet_name}</div>
                <div className="arena-sheet-sub">
                  {sheet.elemental && <span>{String.fromCodePoint(...{ fogo: 0x1F525, agua: 0x1F4A7, terra: 0x1FAA8, ar: 0x1F4A8, trevas: 0x1F311, luz: 0x2728, neutro: 0x26AA }[sheet.elemental] || 0x26AA)} {sheet.elemental}</span>}
                  <span>LV {sheet.attribute_points_gained ? sheet.attribute_points_gained + 1 : 1}</span>
                  <span>{sheet.xp_total || 0} XP</span>
                </div>
                <div className="arena-sheet-attrs-v">
                  F:{sheet.attributes?.F||0} H:{sheet.attributes?.H||0} R:{sheet.attributes?.R||0} A:{sheet.attributes?.A||0} PdF:{sheet.attributes?.PdF||0}
                </div>
              </div>
              <div className="arena-sheet-arrow">→</div>
            </motion.div>
          )
        })}
      </div>

      <div className="arena-new-sheet" onClick={() => { store.newSheet(); onNavigate('create') }}>
        ➕ NOVA FICHA
      </div>
    </div>
  )
}
