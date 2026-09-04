import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { sfx } from '../../../lib/sfx'
import './GanguesModes.css'

/* ══════════════════════════════════════════════════════════════
   SELEÇÃO DE MODO — depois que a dupla está montada.
   Dois caminhos: MODO HISTÓRIA (mapa de Marelia, progresso) e
   MODO BATALHA (confronto avulso 2×2, sem progresso).
   ══════════════════════════════════════════════════════════════ */

export default function GanguesModes({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const party = store.activeParty

  if (party.length < 2) { onNavigate('lobby'); return null }

  const ir = (destino) => {
    sfx.select?.()
    if (destino === 'enemy') store.setStoryTarget(null)
    onNavigate(destino)
  }

  const MODOS = [
    {
      id: 'historia', destino: 'story', cor: 'var(--if-amber)', icon: '🗺',
      titulo: t('games.gangues.modes.historia_titulo'),
      desc: t('games.gangues.modes.historia_desc'),
      tag: t('games.gangues.modes.historia_tag'),
    },
    {
      id: 'batalha', destino: 'enemy', cor: 'var(--if-teal)', icon: '⚔',
      titulo: t('games.gangues.modes.batalha_titulo'),
      desc: t('games.gangues.modes.batalha_desc'),
      tag: t('games.gangues.modes.batalha_tag'),
    },
  ]

  return (
    <main className="gang-lobby gang-modes">
      <header className="gang-story-head">
        <button className="gang-progression-screen-back" onClick={() => onNavigate('lobby')}>
          ← {t('games.gangues.progression.back_to_roster')}
        </button>
      </header>

      <div className="gang-modes-titulo-wrap">
        <span className="if-eyebrow">IF // {store.gangName || 'MARELIA'}</span>
        <h1 className="gang-modes-titulo">{t('games.gangues.modes.titulo')}</h1>
      </div>

      <div className="gang-modes-dupla">
        <span className="gang-modes-dupla-label">
          {store.gangName ? t('games.gangues.modes.dupla_da_gangue', { gangue: store.gangName }) : t('games.gangues.modes.sua_dupla')}
        </span>
        <div className="gang-modes-dupla-lista">
          {party.map(member => (
            <span key={member.id} className="gang-modes-dupla-item">
              <span className="gang-modes-dupla-avatar">{member.sheet_name[0].toUpperCase()}</span>
              <span className="gang-modes-dupla-nome">{member.sheet_name}</span>
              <span className="gang-modes-dupla-path">{t(`games.gangues.loadout.paths.${member.combat_path}.name`)}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="gang-modes-grid">
        {MODOS.map((modo, i) => (
          <motion.button
            key={modo.id}
            className={`gang-modes-card gang-modes-card--${modo.id}`}
            style={{ '--modo-cor': modo.cor }}
            onClick={() => ir(modo.destino)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.1, type: 'spring', stiffness: 240, damping: 20 }}
          >
            <span className="gang-modes-card-icon">{modo.icon}</span>
            <span className="gang-modes-card-tag">{modo.tag}</span>
            <strong className="gang-modes-card-titulo">{modo.titulo}</strong>
            <small className="gang-modes-card-desc">{modo.desc}</small>
            <span className="gang-modes-card-cta">{t('games.gangues.modes.jogar')} <b>→</b></span>
          </motion.button>
        ))}
      </div>
    </main>
  )
}
