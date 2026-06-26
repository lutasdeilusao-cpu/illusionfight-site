import { motion, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════════════
   CityHUD — Heads-Up Display da cidade
   
   Exibe: nome do distrito, relógio, interações
   ═══════════════════════════════════════════════════ */

export default function CityHUD({
  districtName,
  zoneText,
  zoneVisible,
  interactLabel,
  npcDialog,
  showMenu,
  setShowMenu,
  onBackToMenu,
  t,
  weather = 'clear',
  time = 480,
}) {
  // Relógio baseado no tempo da cidade (0–1440 min)
  const totalMin = Math.floor(time)
  const hours = String(Math.floor(totalMin / 60)).padStart(2, '0')
  const mins = String(totalMin % 60).padStart(2, '0')

  const weatherIcon = weather === 'rain' ? '🌧' : weather === 'night' ? '🌙' : '☀️'
  const weatherLabel = weather === 'rain' ? t('tatics.city.weather_rain')
    : weather === 'night' ? t('tatics.city.weather_night')
    : t('tatics.city.weather_clear')

  return (
    <>
      {/* ── District name (top center) ── */}
      <div className={`city-zone-hud ${zoneVisible ? 'visible' : ''}`}>
        {zoneText}
      </div>

      {/* ── Clock + Weather (top right) ── */}
      <div className="city-clock">{hours}:{mins}</div>
      <div className="city-weather-indicator" title={weatherLabel}>{weatherIcon}</div>

      {/* ── District label (top left) ── */}
      <div className="city-district-label">{districtName}</div>

      {/* ── Interact label (bottom center) ── */}
      <AnimatePresence>
        {interactLabel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="city-interact-label"
          >
            {interactLabel}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NPC Dialog (center) ── */}
      <AnimatePresence>
        {npcDialog && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="city-npc-dialog-overlay"
          >
            <div className="city-npc-dialog-box">
              <p className="city-npc-dialog-text">{npcDialog}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Menu ── */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="city-menu-overlay"
            onClick={() => setShowMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="city-menu-panel"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="city-menu-title">{t('tatics.menu.title')}</h3>
              <button className="city-menu-btn" onClick={onBackToMenu}>
                {t('tatics.menu.mainMenu')}
              </button>
              <button
                className="city-menu-btn city-menu-btn-close"
                onClick={() => setShowMenu(false)}
              >
                {t('tatics.menu.continue')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
