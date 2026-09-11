import { getEquippedActiveGanguesSpecials } from '../engine/ganguesSpecialEffects.js'

// Barra de ação da Briga em Multidão: chips de poder/item por personagem +
// botão de avançar rodada. Extraído de GanguesCombat.jsx
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).
export default function GanguesMultidaoActionBar({
  t, onNavigate, playerTeam, poderesMultidao, itensMultidao,
  cicloPoderMultidao, toggleItemMultidao, avancarRodada, revelandoRodada, estadoMultidao,
}) {
  return (
    <div className="gang-actions-bar">
      <div className="gang-multidao-poderes-fila">
        <span className="gang-power-attacks-label">{t('games.gangues.multidao.poderes_titulo')}</span>
        <div className="gang-multidao-chips">
          {playerTeam.map(member => {
            const especiais = getEquippedActiveGanguesSpecials(member)
            const escolhido = poderesMultidao[member.id] || null
            const usandoItem = Boolean(itensMultidao[member.id])
            const rotulo = usandoItem ? t('games.gangues.multidao.vai_usar_item') : escolhido ? t(`games.gangues.progression.skills.${escolhido}`) : t('games.gangues.combat_specials.normal_attack')
            return (
              <div key={member.id} className="gang-multidao-chip-wrap">
                <button
                  type="button"
                  disabled={!especiais.length}
                  className={`gang-multidao-chip ${escolhido ? 'gang-multidao-chip--poder' : ''} ${usandoItem ? 'gang-multidao-chip--item' : ''}`}
                  onClick={() => cicloPoderMultidao(member)}
                >
                  <strong>{member.sheet_name}</strong>
                  <small>{rotulo}</small>
                </button>
                <button
                  type="button"
                  className={`gang-multidao-item-toggle ${usandoItem ? 'gang-multidao-item-toggle--on' : ''}`}
                  title={t('games.gangues.multidao.usar_item')}
                  onClick={() => toggleItemMultidao(member)}
                >
                  🎒
                </button>
              </div>
            )
          })}
        </div>
      </div>
      <div className="gang-actions-row">
        <button className="gang-exit-btn" onClick={() => onNavigate('territorio')}>{t('games.gangues.btn_sair')}</button>
        <button className="gang-attack-btn" disabled={revelandoRodada || !estadoMultidao} onClick={avancarRodada}>
          {t('games.gangues.multidao.avancar_rodada')}
        </button>
      </div>
    </div>
  )
}
