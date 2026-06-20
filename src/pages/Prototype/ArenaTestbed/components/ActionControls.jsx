import { useLanguage } from '../../../../context/LanguageContext'

export default function ActionControls({
  subPhase, subPhaseStep, isPlayerTurn, iaThinking, currentChar,
  turnoAcoes, pendingMove,
  onAction, onMove, onAttack, onUseItem, onConfirmMove,
  onCancel, onSkipMove, onSkipAction, onEndTurn,
}) {
  const { t } = useLanguage()

  return (
    <>
      {isPlayerTurn && subPhase === 'free' && currentChar && (
        <div className="atb-action-panel">
          <div className="atb-action-panel-name">{currentChar.nome}</div>
          <button
            className="atb-action-panel-btn"
            disabled={turnoAcoes.moveu}
            onClick={() => { onAction('move') }}
          >
            👟 {t('prototype.arena_testbed.btn_move')}
          </button>
          <button
            className="atb-action-panel-btn atb-action-panel-btn--attack"
            disabled={turnoAcoes.atacou}
            onClick={() => { onAction('attack') }}
          >
            ⚔ {t('prototype.arena_testbed.btn_attack')}
          </button>
          {currentChar?.inventario?.pocaoHP > 0 && (
            <button
              className="atb-action-panel-btn atb-action-panel-btn--hp"
              onClick={() => onUseItem('hp')}
            >
              ❤ ×{currentChar.inventario.pocaoHP}
            </button>
          )}
          {currentChar?.inventario?.pocaoMP > 0 && (
            <button
              className="atb-action-panel-btn atb-action-panel-btn--mp"
              onClick={() => onUseItem('mp')}
            >
              💧 ×{currentChar.inventario.pocaoMP}
            </button>
          )}
        </div>
      )}

      <div className="atb-bottom-nav">
        {isPlayerTurn && !iaThinking ? (
          <>
            {subPhase === 'free' && (
              <button className="atb-action-btn atb-action-btn--end-turn" onClick={onEndTurn}>
                ⏭ {t('prototype.arena_testbed.end_turn')}
              </button>
            )}

            {subPhase === 'movimento' && (
              <>
                {pendingMove ? (
                  <>
                    <button className="atb-action-btn atb-action-btn--confirm" onClick={onConfirmMove}>
                      ✓ {t('prototype.arena_testbed.btn_confirm_move')}
                    </button>
                    <button className="atb-action-btn atb-action-btn--cancel" onClick={onCancel}>
                      ✕ {t('prototype.arena_testbed.btn_cancel')}
                    </button>
                  </>
                ) : null}
              </>
            )}

            {subPhase === 'acao' && subPhaseStep === 'escolher_acao' && (
              <>
                <button className="atb-action-btn atb-action-btn--attack" onClick={onAttack}>
                  ⚔ {t('prototype.arena_testbed.action_common_attack')}
                </button>
                <button className="atb-action-btn atb-action-btn--skip" onClick={onSkipAction}>
                  ⏭ {t('prototype.arena_testbed.skip_action')}
                </button>
              </>
            )}

            {subPhase === 'acao' && subPhaseStep === 'escolher_alvo' && (
              <button className="atb-action-btn atb-action-btn--cancel" onClick={onCancel}>
                × {t('prototype.arena_testbed.btn_cancel')}
              </button>
            )}
          </>
        ) : (
          <div className="atb-ia-thinking-row">
            <span className="atb-ia-dots">{t('prototype.arena_testbed.ia_thinking')}</span>
          </div>
        )}
      </div>
    </>
  )
}