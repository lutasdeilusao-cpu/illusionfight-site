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
    store.loadSheets(user.id).then(data => {
      setSheets(Array.isArray(data) ? data : [])
      setLoading(false)
    })
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

  if (showEnemies) {
    const selectedSheet = showEnemies
    const sElem = selectedSheet.elemental || 'neutro'
    const sColor = elemColor(sElem)
    const unlockedIds = store.sheet.enemies_unlocked || ['treinamento']
    const visibleEnemies = enemiesData.filter(e => unlockedIds.includes(e.id))
    const visibleByTier = tiers.map(t => visibleEnemies.filter(e => e.tier === t)).filter(g => g.length > 0)
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
          {visibleByTier.map((group, gi) => [
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

      {/* Hero */}
      <div className="arena-lobby-hero">
        <p className="arena-lobby-titulo">modo standalone</p>
        <h1 className="arena-lobby-nome">LDI ARENA</h1>
        <p className="arena-lobby-sub">crie sua ficha · lute contra a CPU · suba no ranking</p>
      </div>

      <div className="arena-lobby-divider" />

      {/* Lista de fichas */}
      <p className="arena-lobby-section-label">suas fichas</p>

      {loading && <p className="arena-lobby-empty">carregando...</p>}
      {!loading && sheets.length === 0 ? (
        <div className="arena-sheet-list">
          <div className="arena-lobby-empty">nenhuma ficha encontrada</div>
        </div>
      ) : (
        <div className="arena-sheet-list">
          {sheets.map(s => {
            const elemCores = {
              fogo: { cor: '#FF4500', glow: 'rgba(255,69,0,0.15)' },
              agua: { cor: '#00B4D8', glow: 'rgba(0,180,216,0.15)' },
              terra: { cor: '#8B6914', glow: 'rgba(139,105,20,0.15)' },
              ar:   { cor: '#A8DADC', glow: 'rgba(168,218,220,0.15)' },
              eletrico: { cor: '#F5A623', glow: 'rgba(245,166,35,0.15)' },
              neutro: { cor: '#00B4D8', glow: 'rgba(0,180,216,0.1)' },
            }
            const ec = elemCores[s.elemental] || elemCores.neutro
            return (
              <div
                key={s.id}
                className="arena-sheet-card-v"
                style={{ '--elem-cor': ec.cor, '--elem-glow': ec.glow }}
                onClick={() => handleLutar(s)}
              >
                <div className="arena-sheet-avatar">
                  {(s.sheet_name || 'X')[0].toUpperCase()}
                </div>
                <div className="arena-sheet-info">
                  <div className="arena-sheet-name-v">{s.sheet_name}</div>
                  <div className="arena-sheet-meta">
                    {s.elemental || 'neutro'} · LV {s.level || 1} · {s.xp_total || 0} XP
                  </div>
                  <div className="arena-sheet-stats">
                    {['F','H','R','A','PdF'].map(attr => (
                      <div key={attr} className="arena-sheet-stat">
                        <span className="arena-sheet-stat-label">{attr}</span>
                        <span className="arena-sheet-stat-val">{s.attributes?.[attr] ?? 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="arena-sheet-arrow">→</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Nova ficha */}
      <button className="arena-new-sheet" onClick={() => { store.newSheet(); onNavigate('create') }}>
        <span className="arena-new-sheet-icon">+</span>
        nova ficha
      </button>

    </div>
  )
}
