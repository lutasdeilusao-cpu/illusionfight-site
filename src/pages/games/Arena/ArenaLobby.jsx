import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useArenaStore, limiteFichasPorTier, podeCriarFicha } from './store/useArenaStore'
import ArenaXpBar from './components/ArenaXpBar'
import enemiesData from './data/arena-enemies.json'
import { useNavigate } from 'react-router-dom'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { sfx } from '../../../lib/sfx'
import { supabase } from '../../../lib/supabase'

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
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const store = useArenaStore()
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const introKey = user ? `arena-intro-seen-${user.id}` : 'arena-intro-seen'
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(introKey))
  const [showEnemies, setShowEnemies] = useState(null)
  const [somAtivo, setSomAtivo] = useState(sfx.enabled)
  const [modalUpgrade, setModalUpgrade] = useState(null) // 'fichas' | 'multiplayer' | null

  useEffect(() => {
    if (!user) {
      // Guest: pode ter ficha temporária vinda do ArenaCreate
      setLoading(false)
      return
    }
    store.loadSheets(user.id).then(data => {
      const list = Array.isArray(data) ? data : []
      setSheets(list)
      setLoading(false)
      // Se voltou de uma partida com ficha carregada, auto-mostra seleção de oponente
      const currentSheet = store.sheet
      if (currentSheet?.id) {
        const match = list.find(s => s.id === currentSheet.id)
        if (match) setShowEnemies(match)
      }
    })
  }, [user])

  // Monitora ficha temporária (guest — !user) para exibir no lobby
  useEffect(() => {
    if (user) return
    if (store.sheet?.sheet_name?.trim()) {
      setSheets([{ ...store.sheet, _temp: true }])
    } else {
      setSheets([])
    }
  }, [user, store.sheet?.sheet_name])

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

  if (showIntro) {
    return (
      <div className="arena-lobby">
        <div className="arena-lobby-hero arena-lobby-hero--sm">
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

        <div className="arena-lobby-hero arena-lobby-hero--enemies">
          <p className="arena-lobby-titulo">{t('games.arena.lobby_titulo')}</p>
          <h1 className="arena-lobby-nome arena-lobby-nome--enemy">{selectedSheet.sheet_name}</h1>
          <p className="arena-lobby-sub">
            {['F','H','R','A','PdF'].map(a => `${a}:${selectedSheet.attributes?.[a]||0}`).join(' ')}
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

        <button className="arena-new-sheet arena-new-sheet--back"
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
      <div className="arena-lobby-section-label arena-lobby-section-label--row">
        <span>{t('games.arena.suas_fichas')}</span>
        {user && (
          <span className="arena-limit-counter">
            {t('games.arena.limite.fichas_usadas', { n: sheets.length, limite: limiteFichasPorTier(perfil?.tier) })}
          </span>
        )}
      </div>

      {loading ? (
        <div className="arena-lobby-empty">{t('games.arena.carregando')}</div>
      ) : sheets.length === 0 ? (
        <div className="arena-sheet-list">
          <div className="arena-lobby-empty">{t('games.arena.sem_fichas')}</div>
        </div>
      ) : (
        <div className="arena-sheet-list">
          {sheets.map(s => {
            const isTemp = s._temp
            return (
              <div
                key={s.id || 'temp'}
                className={`arena-sheet-card-v ${isTemp ? 'arena-sheet-card-v--temp' : ''}`}
                style={{ '--elem-cor': isTemp ? '#F5A623' : '#00B4D8', '--elem-glow': isTemp ? 'rgba(245,166,35,0.15)' : 'rgba(0,180,216,0.1)' }}
                onClick={() => handleLutar(s)}
              >
                <div className="arena-sheet-avatar" style={isTemp ? { background: 'radial-gradient(circle at 35% 35%, #F5A623, #0a0a0a)', boxShadow: '0 0 20px rgba(245,166,35,0.15)' } : {}}>
                  {(s.sheet_name || 'X')[0].toUpperCase()}
                </div>
                <div className="arena-sheet-info">
                  <div className="arena-sheet-name-v">
                    {s.sheet_name}
                    {isTemp && <span className="arena-temp-badge">{t('games.arena.guest_temp_badge')}</span>}
                  </div>
                  <ArenaXpBar
                    xpTotal={s.xp_total || 0}
                    t={t}
                    compact
                  />
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
                  {!isTemp && (
                    <button className="arena-sheet-delete-btn" onClick={(e) => handleDelete(e, s.id)} title={t('games.arena.excluir_ficha')}>✕</button>
                  )}
                  <span className="arena-sheet-arrow">→</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Nova ficha — bloqueada se atingiu limite */}
      {user && !podeCriarFicha(perfil, sheets.length) ? (
        <button className="arena-new-sheet arena-new-sheet--blocked" onClick={() => { sfx.click(); setModalUpgrade('fichas') }}>
          <span className="arena-new-sheet-icon">+</span>
          {t('games.arena.nova_ficha')}
          <span className="arena-limite-upgrade-tag">{t('games.arena.limite.upgrade')}</span>
        </button>
      ) : (
        <button className="arena-new-sheet" onClick={() => { sfx.click(); store.newSheet(); onNavigate('create') }}>
          <span className="arena-new-sheet-icon">+</span>
          {t('games.arena.nova_ficha')}
        </button>
      )}

      {/* Multiplayer — gate Elite+ */}
      <div className="arena-lobby-divider arena-lobby-divider--gap" />
      <p className="arena-lobby-section-label">{t('games.arena.multiplayer_titulo')}</p>
      {user && perfil?.tier !== 'elite' && perfil?.tier !== 'primordial' ? (
        <button className="arena-new-sheet arena-mp-blocked" onClick={() => { sfx.click(); setModalUpgrade('multiplayer') }}>
          <span className="arena-new-sheet-icon">🌐</span>
          {t('games.arena.multiplayer_titulo')}
          <span className="arena-limite-upgrade-tag">{t('games.arena.multiplayer.apenas_elite')}</span>
        </button>
      ) : (
        <button className="arena-new-sheet" onClick={() => { sfx.click(); /* TODO: navegar para multiplayer */ }}>
          <span className="arena-new-sheet-icon">🌐</span>
          {t('games.arena.multiplayer_titulo')}
        </button>
      )}

      {/* Modal de upgrade */}
      {modalUpgrade && (
        <div className="arena-upgrade-overlay" onClick={() => setModalUpgrade(null)}>
          <div className="arena-upgrade-modal" onClick={e => e.stopPropagation()}>
            {modalUpgrade === 'fichas' ? (
              <>
                <div className="arena-upgrade-modal-icon">🔒</div>
                <h2 className="arena-upgrade-modal-titulo">{t('games.arena.limite.modal_titulo')}</h2>
                <p className="arena-upgrade-modal-body">
                  {perfil?.tier
                    ? t('games.arena.limite.modal_body', { tier: perfil.tier, limite: limiteFichasPorTier(perfil.tier) })
                    : t('games.arena.limite.modal_body_sem_tier', { limite: limiteFichasPorTier(perfil?.tier) })}
                </p>
                <p className="arena-upgrade-modal-info">
                  {t('games.arena.limite.fichas_usadas', { n: sheets.length, limite: limiteFichasPorTier(perfil?.tier) })}
                </p>
                <div className="arena-upgrade-modal-tiers">
                  <div className="arena-upgrade-tier-card arena-upgrade-tier-card--elite">
                    <span className="arena-upgrade-tier-nome">ELITE</span>
                    <span className="arena-upgrade-tier-valor">3 fichas</span>
                  </div>
                  <div className="arena-upgrade-tier-card arena-upgrade-tier-card--primordial">
                    <span className="arena-upgrade-tier-nome">PRIMORDIAL</span>
                    <span className="arena-upgrade-tier-valor">5 fichas</span>
                  </div>
                </div>
                <button className="arena-upgrade-modal-btn" onClick={() => { sfx.click(); navigate('/assinar') }}>
                  {t('games.arena.limite.modal_btn')}
                </button>
              </>
            ) : (
              <>
                <div className="arena-upgrade-modal-icon">🌐</div>
                <h2 className="arena-upgrade-modal-titulo">{t('games.arena.multiplayer.modal_titulo')}</h2>
                <p className="arena-upgrade-modal-body">{t('games.arena.multiplayer.modal_body')}</p>
                <button className="arena-upgrade-modal-btn" onClick={() => { sfx.click(); navigate('/assinar') }}>
                  {t('games.arena.multiplayer.modal_btn')}
                </button>
              </>
            )}
            <button className="arena-upgrade-modal-close" onClick={() => setModalUpgrade(null)}>✕</button>
          </div>
        </div>
      )}

      <BackToGamesBtn onClick={() => navigate('/games')} label={t('games.arena.voltar_games')} />
      <button className="arena-sfx-toggle arena-sfx-toggle--lobby" onClick={() => { sfx.toggle(); setSomAtivo(sfx.enabled) }} title={t('games.arena.sfx_toggle')}>
        {sfx.enabled ? '🔊' : '🔇'}
      </button>
    </div>
  )
}
