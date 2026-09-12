import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { ganguesTemMultiplayer } from './data/ganguesLoadout.js'
import { sfx } from '../../../lib/sfx'
import './GanguesModes.css'
import './GanguesModesRedesign.css'

/* ══════════════════════════════════════════════════════════════
   SELEÇÃO DE MODO — depois que a dupla está montada.
   Dois caminhos: MODO HISTÓRIA (mapa de Marelia, progresso) e
   MODO BATALHA (confronto avulso 2×2, sem progresso).
   ══════════════════════════════════════════════════════════════ */

export default function GanguesModes({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const party = store.activeParty
  const [gangueAberta, setGangueAberta] = useState(false)

  if (party.length < 2) { onNavigate('lobby'); return null }

  const torreAberta = store.campaignClears >= 1
  const mpLiberado = ganguesTemMultiplayer(store.roster)

  const ir = () => {
    sfx.select?.()
    onNavigate('story')
  }

  return (
    <main className="gang-lobby gang-modes">
      <header className="gang-story-head">
        <button className="gang-progression-screen-back" onClick={() => onNavigate('lobby')}>
          ← {t('games.gangues.progression.back_to_roster')}
        </button>
      </header>

      <button className="gang-modes-gang-button" onClick={() => setGangueAberta(true)}>
        <span>{store.gangName}</span><small>{t('games.gangues.modes.ver_escalacao', { n: party.length })}</small><b>→</b>
      </button>

      {(() => {
        const modo = store.dificuldadeJogo?.() || 'medio'
        const opcoes = ['facil', 'medio', 'dificil']
        return (
          <div className="gang-modes-dif">
            <span className="gang-modes-dif-tag">{t('games.gangues.modes.dif_titulo')}</span>
            <div className="gang-modes-dif-row">
              {opcoes.map(op => (
                <button
                  key={op}
                  type="button"
                  className={`gang-modes-dif-btn gang-modes-dif-btn--${op}${modo === op ? ' is-ativo' : ''}`}
                  onClick={() => { sfx.select?.(); store.setDificuldadeJogo(op) }}
                >
                  <b>{t(`games.gangues.modes.dif_${op}`)}</b>
                  <small>{t(`games.gangues.modes.dif_${op}_sub`)}</small>
                </button>
              ))}
            </div>
            <p className="gang-modes-dif-nota">{t(`games.gangues.modes.dif_${modo}_desc`)}</p>
          </div>
        )
      })()}

      <div className="gang-modes-grid">
        <motion.button className="gang-modes-card gang-modes-card--historia" onClick={ir}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 240, damping: 20 }}>
          <span className="gang-modes-card-index">01</span>
          <span className="gang-modes-card-art" aria-hidden="true"><i /><b>MARELIA</b></span>
          <span className="gang-modes-card-tag">{t('games.gangues.modes.historia_tag')}</span>
          <strong className="gang-modes-card-titulo">{t('games.gangues.modes.historia_titulo')}</strong>
          <small className="gang-modes-card-desc">{t('games.gangues.modes.historia_desc')}</small>
          <span className="gang-modes-card-cta">{t('games.gangues.modes.comecar_historia')} <b>→</b></span>
        </motion.button>

        {torreAberta ? (
          <motion.button className="gang-modes-card gang-modes-card--batalha" onClick={() => { sfx.select?.(); onNavigate('batalha') }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <span className="gang-modes-card-index">02</span>
            <span className="gang-modes-card-art" aria-hidden="true"><i /><b>TORRE</b></span>
            <span className="gang-modes-card-tag">{t('games.gangues.modes.batalha_tag')}</span>
            <strong className="gang-modes-card-titulo">{t('games.gangues.modes.batalha_titulo')}</strong>
            <small className="gang-modes-card-desc">{t('games.gangues.modes.batalha_desc')}</small>
            <span className="gang-modes-card-cta">{t('games.gangues.modes.entrar_torre')} <b>→</b></span>
          </motion.button>
        ) : (
          <motion.div className="gang-modes-card gang-modes-card--batalha gang-modes-card--locked"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <span className="gang-modes-card-index">02</span>
            <span className="gang-modes-lock" aria-hidden="true">⊘</span>
            <span className="gang-modes-card-tag">{t('games.gangues.modes.bloqueado')}</span>
            <strong className="gang-modes-card-titulo">{t('games.gangues.modes.batalha_titulo')}</strong>
            <small className="gang-modes-card-desc">{t('games.gangues.modes.batalha_bloqueada_desc')}</small>
            <span className="gang-modes-card-cta">{t('games.gangues.modes.em_breve')}</span>
          </motion.div>
        )}

        <motion.div className={`gang-modes-card gang-modes-card--multiplayer${mpLiberado ? '' : ' gang-modes-card--locked'}`}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
          <span className="gang-modes-card-index">03</span>
          <span className="gang-modes-lock" aria-hidden="true">{mpLiberado ? '⧉' : '⊘'}</span>
          <span className="gang-modes-card-tag">{mpLiberado ? t('games.gangues.modes.liberado') : t('games.gangues.modes.bloqueado')}</span>
          <strong className="gang-modes-card-titulo">{t('games.gangues.modes.multiplayer_titulo')}</strong>
          <small className="gang-modes-card-desc">{mpLiberado ? t('games.gangues.modes.multiplayer_liberado_desc') : t('games.gangues.modes.multiplayer_bloqueada_desc')}</small>
          <span className="gang-modes-card-cta">{t('games.gangues.modes.em_breve')}</span>
        </motion.div>
      </div>

      {gangueAberta && <div className="gang-modes-party-modal" onClick={() => setGangueAberta(false)}>
        <section onClick={event => event.stopPropagation()}>
          <span className="if-eyebrow">{store.gangName}</span>
          <h2>{t('games.gangues.modes.escalacao')}</h2>
          <div>{party.map(member => <article key={member.id}><i>{member.sheet_name[0]}</i><span><strong>{member.sheet_name}</strong><small>{t(`games.gangues.loadout.paths.${member.combat_path}.name`)}</small></span><b>✓</b></article>)}</div>
          <button onClick={() => setGangueAberta(false)}>{t('games.gangues.ficha_fechar')}</button>
        </section>
      </div>}
    </main>
  )
}
