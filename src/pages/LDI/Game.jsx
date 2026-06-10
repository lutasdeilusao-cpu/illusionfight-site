import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useGameStore } from './store/useGameStore'
import { useCombatStore } from './store/useCombatStore'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import SceneView from './components/SceneView'
import ManualDrawer from './components/ManualDrawer'
import './LDI.css'

const ATTR_KEYS = {
  F: 'games.ldi.attr_forca',
  H: 'games.ldi.attr_agilidade',
  R: 'games.ldi.attr_resistencia',
  A: 'games.ldi.attr_protecao',
  PdF: 'games.ldi.attr_poder_elemental',
}

export default function Game() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setReaderMode } = useReader()
  const locale = useLanguage().locale
  const { sheet, save, currentScene, choices, sceneNav, setScene, makeChoice, updateSave, saveToCloud, updateSheet, clearLevelUp, setLocale } = useGameStore()
  const combat = useCombatStore()
  const [levelUpAttr, setLevelUpAttr] = useState(null)
  const [levelUpPoints, setLevelUpPoints] = useState(1)
  const [tempAttrs, setTempAttrs] = useState(null)
  const [showManual, setShowManual] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (locale) setLocale(locale)
  }, [locale, setLocale])

  useEffect(() => {
    const sceneParam = searchParams.get('scene')
    if (sceneParam && sceneParam !== currentScene?.id) {
      setScene(sceneParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (save?.level_up_available) {
      setLevelUpPoints(1)
      setLevelUpAttr(null)
      setTempAttrs(null)
    }
  }, [save?.level_up_available])

  useEffect(() => {
    console.log('[LDI] readerMode setado para true (Game)')
    setReaderMode(true)
    return () => {
      console.log('[LDI] readerMode setado para false (Game cleanup)')
      setReaderMode(false)
    }
  }, [setReaderMode])

  useEffect(() => {
    if (!sheet?.sheet_name) {
      navigate('/games/ldi')
      return
    }
    if (!currentScene && save.status === 'active') {
      setScene(save.current_scene_id || '1.1')
    }
  }, [sheet, currentScene, save, navigate, setScene])

  useEffect(() => {
    if (combat.active) {
      navigate('/games/ldi/combat')
    }
  }, [combat.active, navigate])

  useEffect(() => {
    console.log('[GAME] useEffect save.status:', save?.status)
    if (save.status === 'ended_victory' || save.status === 'ended_defeat' || save.status === 'ended_fork') {
      if (user) saveToCloud(user.id)
      navigate('/games/ldi/end')
    }
  }, [save.status, navigate, user, saveToCloud])

  const handleChoice = useCallback((choice) => {
    if (choice.isPuzzle) {
      const pType = choice.puzzleType || 'simon'
      const pDiff = choice.puzzleDiff || 3
      const returnScene = choice.next_scene || currentScene?.id || '3.2_dia8'
      const puzzleUrl = `/games/ldi/puzzle?type=${pType}&diff=${pDiff}&return=${returnScene}`
      setReaderMode(false)
      navigate(puzzleUrl)
      return
    }
    makeChoice(choice).catch(e => console.error('[LDI] choice error:', e))
    if (user) saveToCloud(user.id).catch(e => console.error('[LDI] save falhou:', e))
  }, [makeChoice, user, saveToCloud, currentScene, navigate, setReaderMode])

  const handleLevelUpAttr = (attr) => {
    if (levelUpPoints <= 0) return
    const base = sheet?.attributes || {}
    const temp = tempAttrs || { ...base }
    const current = temp[attr] || 0
    if (current >= 4) return
    temp[attr] = current + 1
    setTempAttrs(temp)
    setLevelUpPoints(p => p - 1)
    setLevelUpAttr(attr)
  }

  const handleRemoveLevelUp = (attr) => {
    const base = sheet?.attributes || {}
    const temp = tempAttrs || { ...base }
    const current = temp[attr] || 0
    if (current <= (base[attr] || 0)) return
    temp[attr] = current - 1
    setTempAttrs(temp)
    setLevelUpPoints(p => p + 1)
    setLevelUpAttr(null)
  }

  const handleConfirmLevelUp = () => {
    if (levelUpPoints > 0) return
    if (tempAttrs) updateSheet({ attributes: tempAttrs })
    clearLevelUp()
    setTempAttrs(null)
    setLevelUpAttr(null)
    setLevelUpPoints(1)
    if (user) saveToCloud(user.id)
  }

  if (save?.level_up_available) {
    const baseAttrs = sheet?.attributes || {}
    const displayAttrs = tempAttrs || baseAttrs
    return (
      <div className="ldi-game">
        <div className="ldi-levelup-overlay">
          <motion.div
            className="ldi-levelup-box"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="ldi-levelup-title">{t('games.ldi.game.levelup_titulo')}</div>
            <div className="ldi-levelup-sub">{t('games.ldi.game.levelup_sub')}</div>
            <div className="ldi-levelup-points">{t('games.ldi.game.levelup_pontos', { n: levelUpPoints })}</div>
            {Object.entries(ATTR_KEYS).map(([key, labelKey]) => {
              const label = t(labelKey)
              const baseVal = baseAttrs[key] || 0
              const currentVal = displayAttrs[key] || 0
              const atMax = currentVal >= 4
              const isUpgraded = currentVal > baseVal
              return (
                <div key={key} className="ldi-levelup-attr" style={isUpgraded ? { borderColor: '#FFD700' } : {}}>
                  <span className="ldi-levelup-attr-label">{label}</span>
                  <span className="ldi-levelup-attr-value">
                    {isUpgraded ? `${baseVal} → ${currentVal}` : baseVal}
                  </span>
                  <button
                    className="ldi-levelup-attr-btn"
                    onClick={() => handleRemoveLevelUp(key)}
                    disabled={!isUpgraded}
                    style={{ marginRight: '0.25rem' }}
                  >−</button>
                  <button
                    className="ldi-levelup-attr-btn"
                    onClick={() => handleLevelUpAttr(key)}
                    disabled={atMax || levelUpPoints <= 0}
                    style={isUpgraded ? { borderColor: '#FFD700', background: 'rgba(255,215,0,0.15)' } : {}}
                  >+</button>
                </div>
              )
            })}
            <button
              className="ldi-levelup-confirm"
              onClick={handleConfirmLevelUp}
              disabled={levelUpPoints > 0}
              style={levelUpPoints > 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              {levelUpPoints > 0 ? t('games.ldi.game.levelup_restam', { n: levelUpPoints }) : t('games.ldi.game.levelup_confirmar')}
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!currentScene) {
    return (
      <div className="ldi-game">
        <div className="ldi-game-loading">{t('games.ldi.game.carregando')}</div>
      </div>
    )
  }

  return (
    <div className="ldi-game">
      <div className="ldi-game-hud">
        <span className="ldi-game-hud-item" onClick={() => navigate('/games/ldi/sheet')}>
          {t('games.ldi.game.hud_ficha')}
        </span>
        <span className="ldi-game-hud-item">
          {t('games.ldi.game.hud_dia', { n: save.day_in_game })}
        </span>
        <span className="ldi-game-hud-item">
          {t('games.ldi.game.hud_creditos', { n: save.credits })}
        </span>
        <span className="ldi-game-hud-item" onClick={() => navigate('/games/ldi/clues')}>
          {t('games.ldi.game.hud_pistas', { n: save.clues_collected?.length || 0 })}
        </span>
        <span className="ldi-game-hud-item" onClick={() => setShowManual(true)} style={{ cursor: 'pointer' }}>
          {t('games.ldi.game.hud_manual')}
        </span>
        <span className="ldi-game-hud-item ldi-game-hud-pv">
          ❤️ {save.pv_current}/{Math.max(1, (sheet?.attributes?.R || 0) * 5)}
        </span>
      </div>

      <SceneView
        scene={currentScene}
        choices={choices}
        onChoice={handleChoice}
        sceneNav={sceneNav}
      />

      <ManualDrawer open={showManual} onClose={() => setShowManual(false)} />
    </div>
  )
}
