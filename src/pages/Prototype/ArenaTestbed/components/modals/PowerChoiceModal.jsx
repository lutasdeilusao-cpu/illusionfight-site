import { useLanguage } from '../../../../../context/LanguageContext'
import { audio } from '../../engine/audioManager'
import './PowerChoiceModal.css'

export default function PowerChoiceModal({ mode, charName, faBruto, opcoes, onEscolher }) {
  const { t } = useLanguage()

  return (
    <div className="pcm-overlay" onClick={() => {}}>
      <div className="pcm-modal" onClick={e => e.stopPropagation()}>
        <div className="pcm-header">
          <span className="pcm-header-label">
            {mode === 'ataque'
              ? t('prototype.arena_testbed.pcm_attack_title')
              : t('prototype.arena_testbed.pcm_defense_title')}
          </span>
          <span className="pcm-char-name">{charName}</span>
        </div>

        {mode === 'defesa' && faBruto != null && (
          <div className="pcm-fa-display">
            <span className="pcm-fa-label">{t('prototype.arena_testbed.pcm_fa_label')}</span>
            <span className="pcm-fa-value">{faBruto}</span>
          </div>
        )}

        <div className="pcm-opcoes">
          {opcoes.map((op, i) => (
            <button
              key={i}
              className={`pcm-btn ${op.poderId ? 'pcm-btn--poder' : 'pcm-btn--comum'}`}
              onClick={() => { audio.powerActivate(); onEscolher(op) }}
              disabled={!op.disponivel}
            >
              <span className="pcm-btn-label">{op.rotulo}</span>
              {op.custoMP > 0 && (
                <span className="pcm-btn-custo">-{op.custoMP} MP</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}