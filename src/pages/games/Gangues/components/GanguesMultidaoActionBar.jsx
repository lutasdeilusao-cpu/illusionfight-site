import { getEquippedActiveGanguesSpecials } from '../engine/ganguesSpecialEffects.js'
import './GanguesMultidaoActionBar.css'

// Barra de ação da Briga em Multidão, no mesmo visual do menu de ação da luta
// normal (GanguesActionOrb): talento/item por personagem, AVANÇAR RODADA em
// destaque e o switch do automático. Sair fica no "Mete o pé" da barra do topo.
export default function GanguesMultidaoActionBar({
  t, playerTeam, poderesMultidao, itensMultidao,
  cicloPoderMultidao, toggleItemMultidao, avancarRodada, revelandoRodada, estadoMultidao,
  autoOn, onToggleAuto,
}) {
  return (
    <div className="gang-mdao">
      <p className="gang-mdao__eyebrow">{t('games.gangues.multidao.poderes_titulo')}</p>
      <div className="gang-mdao__membros">
        {playerTeam.map(member => {
          const especiais = getEquippedActiveGanguesSpecials(member)
          const escolhido = poderesMultidao[member.id] || null
          const usandoItem = Boolean(itensMultidao[member.id])
          const rotulo = usandoItem ? t('games.gangues.multidao.vai_usar_item') : escolhido ? t(`games.gangues.progression.skills.${escolhido}`) : t('games.gangues.combat_specials.normal_attack')
          return (
            <div key={member.id} className="gang-mdao__membro">
              <button
                type="button"
                disabled={!especiais.length}
                className={`gang-mdao__talento${escolhido ? ' is-poder' : ''}${usandoItem ? ' is-item' : ''}`}
                onClick={() => cicloPoderMultidao(member)}
              >
                <strong>{member.sheet_name}</strong>
                <small>{rotulo}</small>
              </button>
              <button
                type="button"
                className={`gang-mdao__item${usandoItem ? ' is-on' : ''}`}
                aria-label={t('games.gangues.multidao.usar_item')}
                title={t('games.gangues.multidao.usar_item')}
                onClick={() => toggleItemMultidao(member)}
              >
                🎒
              </button>
            </div>
          )
        })}
      </div>
      <button type="button" className="gang-mdao__avancar" disabled={revelandoRodada || !estadoMultidao} onClick={avancarRodada}>
        <b aria-hidden="true">⚔️</b>{t('games.gangues.multidao.avancar_rodada')}
      </button>
      <button
        type="button"
        className={`gang-mdao__auto${autoOn ? ' is-on' : ''}`}
        aria-pressed={autoOn}
        title={t('games.gangues.multidao.auto_switch_titulo')}
        onClick={onToggleAuto}
      >
        <span className="gang-mdao__track"><span className="gang-mdao__dot" /></span>
        {t('games.gangues.auto.switch_label')}
      </button>
    </div>
  )
}
