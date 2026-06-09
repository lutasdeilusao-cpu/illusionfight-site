import Card from './Card'
import { useLanguage } from '../../../context/LanguageContext'

export default function CardPreviewModal({ card, onClose }) {
  const { t } = useLanguage()
  if (!card) return null

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
      zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0D0D1A', border: '2px solid #1A1A2E', borderRadius: 8,
        padding: 24, maxWidth: 320, width: '100%', textAlign: 'center',
      }}>
        <div style={{ transform: 'scale(1.8)', margin: '20px auto 24px' }}>
          <Card card={card} />
        </div>
        <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 20, color: '#F5A623', margin: '0 0 4px', letterSpacing: 2 }}>
          {card.name}
        </h2>
        {card.type === 'MONSTER' && (
          <p style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: '#666', letterSpacing: 2, margin: '4px 0' }}>
            {t('games.duelo.card_atk')} {card.atk} / {t('games.duelo.card_def')} {card.def} · 👟{card.mov} 🎯{card.rng}
          </p>
        )}
        {card.type !== 'MONSTER' && (
          <p style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: card.type === 'SPELL' ? '#22C55E' : '#EF4444', letterSpacing: 2, margin: '4px 0' }}>
            {card.type === 'SPELL' ? t('games.duelo.card_magia') : t('games.duelo.card_armadilha')}
          </p>
        )}
        <p style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: '#777', lineHeight: 1.6, margin: '8px 0', fontStyle: 'italic' }}>
          {card.desc}
        </p>
        <button onClick={onClose} style={{
          marginTop: 12, background: 'none', border: '1px solid #333', color: '#666',
          padding: '8px 24px', cursor: 'pointer', fontFamily: "'Courier New',monospace", fontSize: 12,
        }}>{t('games.duelo.btn_fechar')}</button>
      </div>
    </div>
  )
}
