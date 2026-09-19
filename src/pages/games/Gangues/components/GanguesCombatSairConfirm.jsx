import { useLanguage } from '../../../../context/LanguageContext'

/* Confirmação de "Mete o Pé" (pedido do Isaias, 18/09/2026: "quando
   aparecer um mete o pé tem que aparecer um diálogo 'você deseja sair
   desse jogo e voltar ao menu?'... quando ele voltar ele deve voltar
   pro inicial do jogo"). Antes os dois botões de fugir do combate
   (barra normal e barra da Briga em Multidão) saíam na hora, sem
   perguntar nada — agora os dois só abrem esse modal; quem decide de
   fato é ele. Confirmar chama `onConfirmar` (GanguesCombat.jsx passa
   pra fase 'lobby', a tela inicial de quem já tem gangue montada — ver
   GanguesRoute.jsx `onSairConfirmado`); cancelar só fecha e a luta
   continua de onde parou (nada de estado é mexido até confirmar). */
export default function GanguesCombatSairConfirm({ onConfirmar, onCancelar }) {
  const { t } = useLanguage()
  return (
    <div className="gang-sair-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="gang-sair-confirm-title">
      <div className="gang-sair-confirm-card">
        <h2 id="gang-sair-confirm-title">{t('games.gangues.combat_specials.sair_confirm_titulo')}</h2>
        <p>{t('games.gangues.combat_specials.sair_confirm_texto')}</p>
        <div className="gang-sair-confirm-acoes">
          <button type="button" className="gang-sair-confirm-cancelar" onClick={onCancelar}>
            {t('games.gangues.combat_specials.sair_confirm_cancelar')}
          </button>
          <button type="button" className="gang-sair-confirm-confirmar" onClick={onConfirmar}>
            {t('games.gangues.combat_specials.sair_confirm_confirmar')}
          </button>
        </div>
      </div>
    </div>
  )
}
