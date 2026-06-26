import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useGameStore } from './store/useGameStore'
import { useReader } from '../../../context/ReaderContext'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import './LDI.css'

const END_MESSAGES = {
  ended_defeat: {
    title: 'K.O.',
    text: 'VocÃª foi longe. Mas nÃ£o longe o suficiente.',
    icon: 'ðŸ’€',
  },
  ended_fork: {
    title: 'RECUSA',
    text: 'VocÃª estava certo em recusar. Mas isso nÃ£o foi suficiente.',
    icon: 'ðŸšª',
  },
  ended_victory: {
    title: 'VITÃ“RIA',
    text: 'O Arco 1 estÃ¡ completo. Mas a lenda apenas comeÃ§ou.',
    icon: 'ðŸ†',
  },
}

const ACHIEVEMENTS = [
  { id: 'punho_puro', name: 'Punho Puro', desc: 'Termine o jogo sem usar Poder nenhuma vez', check: (s) => !s?.flags?.CONFRONTO_FINAL && s?.status === 'ended_victory' },
  { id: 'diplomata', name: 'Diplomata', desc: 'Resolva o Ato IV por negociaÃ§Ã£o', check: (s) => s?.flags?.VITORIA_NEGOCIACAO },
  { id: 'investigador', name: 'Investigador', desc: 'Resolva o Ato IV por exposiÃ§Ã£o', check: (s) => s?.flags?.VITORIA_EXPOSICAO },
  { id: 'guerreiro', name: 'Guerreiro', desc: 'Derrote NULL_ENTITY em combate direto', check: (s) => s?.flags?.CONFRONTO_FINAL && s?.status === 'ended_victory' },
  { id: 'teimoso', name: 'Teimoso', desc: 'Enfrente o boss despreparado e venÃ§a', check: (s) => s?.flags?.CONFRONTO_DESPREPARADO && s?.status === 'ended_victory' },
  { id: 'recruta', name: 'Recruta', desc: 'Aceite entrar para a OrganizaÃ§Ã£o', check: (s) => s?.flags?.ACEITOU_ORGANIZACAO },
  { id: 'sobrevivente', name: 'Sobrevivente', desc: 'Complete o Arco 1', check: (s) => s?.status === 'ended_victory' },
  { id: 'acordo', name: 'Acordo Escuro', desc: 'Aceite o acordo do vilÃ£o', check: (s) => s?.flags?.ACEITOU_ACORDO },
  { id: 'honra', name: 'Honrado', desc: 'Mantenha o cÃ³digo de honra atÃ© o fim', check: (s) => s?.status === 'ended_victory' },
]

export default function End() {
  const { t } = useLanguage()
  const { setReaderMode } = useReader()
  const { sheet, save, resetGame } = useGameStore()
  const [showRetro, setShowRetro] = useState(false)

  const endType = save?.status || 'ended_victory'
  const msg = END_MESSAGES[endType] || END_MESSAGES.ended_victory
  const lastChoices = save?.last_choices || []
  const clues = save?.clues_collected || []
  const unlocked = ACHIEVEMENTS.filter(a => a.check(save))
  const xpGained = sheet?.xp_total || 0

  if (showRetro) {
    return (
      <div className="ldi-end">
        <motion.div className="ldi-end-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="ldi-end-retro-title">{t('games.ldi.end.retrospecto')}</div>
          
          <div className="ldi-end-retro-section">
            <h3>{t('games.ldi.end.conquistas', { n: unlocked.length, total: ACHIEVEMENTS.length })}</h3>
            <div className="ldi-end-achievements">
              {ACHIEVEMENTS.map(a => {
                const has = unlocked.find(u => u.id === a.id)
                return (
                  <div key={a.id} className={`ldi-end-achievement ${has ? 'ldi-end-achievement--ok' : ''}`}>
                    <span className="ldi-end-achievement-icon">{has ? 'âœ…' : 'â¬œ'}</span>
                    <div>
                      <div className="ldi-end-achievement-name">{a.name}</div>
                      <div className="ldi-end-achievement-desc">{a.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {lastChoices.length > 0 && (
            <div className="ldi-end-retro-section">
              <h3>{t('games.ldi.end.decisoes')}</h3>
              <ul className="ldi-end-retro-list">
                {lastChoices.map((c, i) => (
                  <li key={i} className="ldi-end-retro-item">{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="ldi-end-retro-section">
            <h3>{t('games.ldi.end.estatisticas')}</h3>
            <div className="ldi-end-stats">
              <div className="ldi-end-stat">
                <span className="ldi-end-stat-label">{t('games.ldi.end.dia')}</span>
                <span className="ldi-end-stat-value">{save?.day_in_game || 1}</span>
              </div>
              <div className="ldi-end-stat">
                <span className="ldi-end-stat-label">{t('games.ldi.end.pistas')}</span>
                <span className="ldi-end-stat-value">{clues.length}</span>
              </div>
              <div className="ldi-end-stat">
                <span className="ldi-end-stat-label">{t('games.ldi.end.xp_total')}</span>
                <span className="ldi-end-stat-value">{xpGained}</span>
              </div>
              <div className="ldi-end-stat">
                <span className="ldi-end-stat-label">{t('games.ldi.end.creditos')}</span>
                <span className="ldi-end-stat-value">{save?.credits || 0}</span>
              </div>
            </div>
          </div>

          {clues.length > 0 && (
            <div className="ldi-end-retro-section">
              <h3>{t('games.ldi.end.pistas_coletadas')}</h3>
              <ul className="ldi-end-retro-list">
                {clues.map((c, i) => (
                  <li key={i} className="ldi-end-retro-item">{c.text || c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="ldi-end-actions" style={{ marginTop: '1.5rem' }}>
            <button className="ldi-btn ldi-btn--ghost" onClick={() => setShowRetro(false)}>
              {t('games.ldi.voltar')}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="ldi-end">
      <motion.div
        className="ldi-end-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <motion.div
          className="ldi-end-title"
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {msg.icon} {msg.title}
        </motion.div>

        <motion.p
          className="ldi-end-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          {msg.text}
        </motion.p>

        <motion.div
          className="ldi-end-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <div className="ldi-end-stat">
            <span className="ldi-end-stat-label">{t('games.ldi.end.dia')}</span>
            <span className="ldi-end-stat-value">{save?.day_in_game || 1}</span>
          </div>
          <div className="ldi-end-stat">
            <span className="ldi-end-stat-label">{t('games.ldi.end.pistas')}</span>
            <span className="ldi-end-stat-value">{clues.length}</span>
          </div>
          <div className="ldi-end-stat">
            <span className="ldi-end-stat-label">{t('games.ldi.end.xp')}</span>
            <span className="ldi-end-stat-value">{xpGained}</span>
          </div>
          <div className="ldi-end-stat">
            <span className="ldi-end-stat-label">{t('games.ldi.end.conquistas_label')}</span>
            <span className="ldi-end-stat-value">{unlocked.length}/{ACHIEVEMENTS.length}</span>
          </div>
        </motion.div>

        {clues.length > 0 && (
          <motion.div
            className="ldi-end-clues"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
          >
            <h3>{t('games.ldi.end.pistas_label')}</h3>
            <ul>
              {clues.map((clue, i) => (
                <li key={i}>{clue.text || clue}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {unlocked.length > 0 && (
          <motion.div
            className="ldi-end-achievements-bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.5 }}
          >
            {unlocked.slice(0, 3).map(a => (
              <span key={a.id} className="ldi-end-ach-badge">âœ… {a.name}</span>
            ))}
            {unlocked.length > 3 && <span className="ldi-end-ach-badge">+{unlocked.length - 3}</span>}
          </motion.div>
        )}

        <motion.div
          className="ldi-end-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 0.5 }}
        >
          <button className="ldi-btn ldi-btn--outline" onClick={() => setShowRetro(true)}>
            ðŸ“œ VER RETROSPECTO
          </button>
          <Link
            to="/games/ldi/game"
            className="ldi-btn ldi-btn--primary"
            onClick={resetGame}
          >
            NOVO RUN COM ESTA FICHA
          </Link>
          <Link
            to="/games/ldi/create"
            className="ldi-btn ldi-btn--outline"
            onClick={resetGame}
          >
            CRIAR NOVA FICHA
          </Link>
          <BackToGamesBtn to="/games" label="VOLTAR AOS EXTRAS" />
        </motion.div>
      </motion.div>
    </div>
  )
}
