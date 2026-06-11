import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useArenaStore } from './store/useArenaStore'
import enemiesData from './data/arena-enemies.json'
import { useNavigate } from 'react-router-dom'
import BackToGamesBtn from '../../components/BackToGamesBtn/BackToGamesBtn'
import { sfx } from '../../lib/sfx'
import { supabase } from '../../lib/supabase'

const ELEM_COLORS = {
  fogo: '#F5A623', agua: '#00B4D8', terra: '#22C55E', ar: '#A855F4',
  trevas: '#8B0000', luz: '#F5A623', neutro: '#666'
}
const DIFF_COLORS = { easy: '#22C55E', medium: '#F5A623', hard: '#8B0000', very_hard: '#A855F4' }
const DIFF_LABELS = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD', very_hard: 'VERY HARD' }

const delay = ms => new Promise(res => setTimeout(res, ms))

function NeoGuideIntro({ onShow }) {
  const { t } = useLanguage()
  const [passo, setPasso] = useState(0)
  const [texto, setTexto] = useState('')
  const [digitando, setDigitando] = useState(true)
  const mountedRef = useRef(true)

  const linhas = [
    t('games.arena.intro_linha1'),
    t('games.arena.intro_linha2'),
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
          transition={{ delay: 0.3 }} onClick={() => { sfx.click(); onShow() }}>
          {t('games.arena.mostrar_fichas')}
        </motion.button>
      )}
    </div>
  )
}

export default function ArenaLobby({ onNavigate }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const store = useArenaStore()
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const introKey = user ? `arena-intro-seen-${user.id}` : 'arena-intro-seen'
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(introKey))
  const [showEnemies, setShowEnemies] = useState(null)
  const [somAtivo, setSomAtivo] = useState(sfx.enabled)

  useEffect(() => {
    if (!user) return
    store.loadSheets(user.id).then(data => {
      setSheets(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [user])

  const handleLutar = (sheet) => {
    sfx.select()
    store.loadSheet(sheet)
    setShowEnemies(sheet)
  }

  const handleSelectEnemy = (enemy) => {
    sfx.vs()
    store.startMatch(enemy)
    onNavigate('combat')
  }

  const handleIntroDone = () => {
    localStorage.setItem(introKey, '1')
    setShowIntro(false)
  }

  const handleDelete = async (e, sheetId) => {
    e.stopPropagation()
    sfx.cancel()
    if (!window.confirm(t('games.arena.confirmar_excluir'))) return
    try {
      // Primeiro deleta game_saves (FK constraint), depois a ficha
      await supabase.from('game_saves').delete().eq('sheet_id', sheetId)
      const { error } = await supabase.from('character_sheets').delete().eq('id', sheetId)
      if (error) {
        console.error('[ARENA] Erro ao excluir ficha:', error)
        alert(t('games.arena.erro_excluir'))
        return
      }
      setSheets(prev => prev.filter(s => s.id !== sheetId))
      console.log('[ARENA] Ficha excluída:', sheetId)
    } catch (err) {
      console.error('[ARENA] Erro ao excluir ficha:', err)
    }
  }

  const elemColor = (el) => ELEM_COLORS[el] || '#666'

  const elemCores = {
    fogo:     { cor: '#FF4500', glow: 'rgba(255,69,0,0.15)' },
    agua:     { cor: '#00B4D8', glow: 'rgba(0,180,216,0.15)' },
    terra:    { cor: '#8B6914', glow: 'rgba(139,105,20,0.15)' },
    ar:       { cor: '#A8DADC', glow: 'rgba(168,218,220,0.15)' },
    eletrico: { cor: '#F5A623', glow: 'rgba(245,166,35,0.15)' },
    trevas:   { cor: '#9B59B6', glow: 'rgba(155,89,182,0.15)' },
    neutro:   { cor: '#00B4D8', glow: 'rgba(0,180,216,0.1)' },
  }

  if (showIntro) {
    return (
      <div className="arena-lobby">
        <div className="arena-lobby-hero" style={{ paddingTop: 48 }}>
          <p className="arena-lobby-titulo">{t('games.arena.modo_standalone')}</p>
          <h1 className="arena-lobby-nome">{t('games.arena.titulo')}</h1>
        </div>
        <NeoGuideIntro onShow={handleIntroDone} />
      </div>
    )
  }

  const tiers = [1, 2, 3, 4]

  if (showEnemies) {
    const selectedSheet = showEnemies
    const sElem = selectedSheet.elemental || 'neutro'
    const ec = elemCores[sElem] || elemCores.neutro
    const unlockedIds = store.sheet.enemies_unlocked || ['treinamento']
    const visibleEnemies = enemiesData.filter(e => unlockedIds.includes(e.id))

    const diffCores = {
      easy:      { cor: '#22C55E', glow: 'rgba(34,197,94,0.15)' },
      medium:    { cor: '#F5A623', glow: 'rgba(245,166,35,0.15)' },
      hard:      { cor: '#8B0000', glow: 'rgba(139,0,0,0.15)' },
      very_hard: { cor: '#A855F4', glow: 'rgba(168,85,244,0.15)' },
    }

    return (
      <div className="arena-lobby">

        <div className="arena-lobby-hero" style={{ paddingTop: 48, marginBottom: 24 }}>
          <p className="arena-lobby-titulo">{t('games.arena.lobby_titulo')}</p>
          <h1 className="arena-lobby-nome" style={{ fontSize: 32 }}>{selectedSheet.sheet_name}</h1>
          <p className="arena-lobby-sub">
            {t('games.arena.elements.' + (selectedSheet.elemental || 'neutro') + '.label') || selectedSheet.elemental || 'neutro'} · {['F','H','R','A','PdF'].map(a => `${a}:${selectedSheet.attributes?.[a]||0}`).join(' ')}
          </p>
        </div>

        <div className="arena-lobby-divider" />

        <p className="arena-lobby-section-label">{t('games.arena.inimigos_desbloqueados')}</p>

        <div className="arena-sheet-list">
          {visibleEnemies.map(enemy => {
            const dc = diffCores[enemy.difficulty] || { cor: '#666', glow: 'rgba(100,100,100,0.1)' }
            return (
              <div
                key={enemy.id}
                className="arena-sheet-card-v"
                style={{ '--elem-cor': dc.cor, '--elem-glow': dc.glow }}
                onClick={() => handleSelectEnemy(enemy)}
              >
                <div className="arena-sheet-avatar" style={{
                  background: `radial-gradient(circle at 35% 35%, ${dc.cor}, #0a0a0a)`,
                  boxShadow: `0 0 20px ${dc.glow}`
                }}>
                  {(t('games.arena.enemy_names.' + enemy.id) || enemy.name)[0]}
                </div>
                <div className="arena-sheet-info">
                  <div className="arena-sheet-name-v">{t('games.arena.enemy_names.' + enemy.id) || enemy.name}</div>
                  <div className="arena-sheet-meta">
                    rank #{enemy.rank} · tier {enemy.tier} · {t('games.arena.diff_' + (enemy.difficulty || 'easy'))}
                  </div>
                  <div className="arena-sheet-stats">
                    {['F','H','R','A','PdF'].map(attr => (
                      <div key={attr} className="arena-sheet-stat">
                        <span className="arena-sheet-stat-label">{attr}</span>
                        <span className="arena-sheet-stat-val" style={{ color: dc.cor }}>
                          {enemy.stats[attr] ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="arena-sheet-arrow">→</span>
              </div>
            )
          })}
        </div>

        <button className="arena-new-sheet" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#666' }}
          onClick={() => { sfx.click(); setShowEnemies(null) }}>
          {t('games.arena.voltar')}
        </button>

      </div>
    )
  }

  return (
    <div className="arena-lobby">

      {/* Hero */}
      <div className="arena-lobby-hero">
        <p className="arena-lobby-titulo">{t('games.arena.modo_standalone')}</p>
        <h1 className="arena-lobby-nome">{t('games.arena.titulo')}</h1>
        <p className="arena-lobby-sub">{t('games.arena.lobby_sub')}</p>
      </div>

      <div className="arena-lobby-divider" />

      {/* Lista de fichas */}
      <p className="arena-lobby-section-label">{t('games.arena.suas_fichas')}</p>

      {loading ? (
        <div className="arena-lobby-empty">{t('games.arena.carregando')}</div>
      ) : sheets.length === 0 ? (
        <div className="arena-sheet-list">
          <div className="arena-lobby-empty">{t('games.arena.sem_fichas')}</div>
        </div>
      ) : (
        <div className="arena-sheet-list">
          {sheets.map(s => {
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
                    {s.elemental || 'neutro'} · {t('games.arena.lv', { n: s.level || 1 })} · {s.xp_total || 0} XP
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
                <div className="arena-sheet-card-actions">
                  <button className="arena-sheet-delete-btn" onClick={(e) => handleDelete(e, s.id)} title={t('games.arena.excluir_ficha')}>✕</button>
                  <span className="arena-sheet-arrow">→</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Nova ficha */}
      <button className="arena-new-sheet" onClick={() => { store.newSheet(); onNavigate('create') }}>
        <span className="arena-new-sheet-icon">+</span>
        {t('games.arena.nova_ficha')}
      </button>

      <BackToGamesBtn onClick={() => navigate('/games')} style={{ marginTop: '1rem' }} label={t('games.arena.voltar_games')} />
      <button className="arena-sfx-toggle" onClick={() => { sfx.toggle(); setSomAtivo(sfx.enabled) }} title={t('games.arena.sfx_toggle')} style={{ marginTop: '0.5rem', fontSize: 18 }}>
        {sfx.enabled ? '🔊' : '🔇'}
      </button>
    </div>
  )
}
