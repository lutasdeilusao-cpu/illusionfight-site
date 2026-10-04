import { getGanguesCharacter, eventosDoNivel } from '../../data/ganguesCharacters.js'
import { eventosDoLevelUp } from '../../engine/ganguesVictoryResolver.js'
import { describeGanguesSpecialEffect } from '../../engine/ganguesSpecialEffects.js'
import { getGanguesPortraitByTemplateId } from '../../data/ganguesPortraits.js'
import GanguesRetratoImg from '../GanguesRetratoImg'

/* Quem subiu de nível nesta luta: o que ganhou (atributo, talento novo e o
   que ele faz). Bloqueia até o jogador confirmar. */
function Evento({ t, evento }) {
  const skill = id => t(`games.gangues.progression.skills.${id}`)
  if (evento.type === 'attribute') return `+${evento.delta} ${t(`games.gangues.attr_labels.${evento.attribute}`)}`
  if (evento.type === 'unlock_special') return `⚡ ${skill(evento.special_id)}`
  if (evento.type === 'special_rank') return `⬆ ${skill(evento.special_id)} NV${evento.rank}`
  if (evento.type === 'max_rank') return `★ ${evento.title}`
  return null
}

export default function LevelUpModal({ t, levelUps, onClose }) {
  return (
    <div className="gang-progression-prompt" role="dialog" aria-modal="true" aria-labelledby="gang-levelup-prompt-title">
      <div className="gang-progression-prompt__card">
        <span className="gang-progression-prompt__icon">⬆</span>
        <h2 id="gang-levelup-prompt-title">{t('games.gangues.levelup.titulo')}</h2>
        {levelUps.map(lu => {
          const character = getGanguesCharacter(lu.characterTemplateId)
          const eventos = character ? eventosDoLevelUp(character, lu.fromLevel, lu.toLevel, eventosDoNivel) : []
          return (
            <div key={lu.id} className="gang-levelup-entry">
              <div className="gang-levelup-entry__head">
                <span className={`gang-levelup-entry__avatar gang-path--${character?.combat_path}`}>
                  <GanguesRetratoImg src={getGanguesPortraitByTemplateId(lu.characterTemplateId)} fallback={lu.name?.[0]?.toUpperCase()} />
                </span>
                <span className="gang-levelup-entry__nome">{lu.name}</span>
                <span className="gang-levelup-entry__nivel">NV {lu.toLevel}</span>
              </div>
              <div className="gang-levelup-entry__eventos">
                {eventos.map((evento, i) => (
                  <span key={i} className={`gang-levelup-tag${evento.type === 'unlock_special' || evento.type === 'special_rank' ? ' gang-levelup-tag--poder' : ''}`}><Evento t={t} evento={evento} /></span>
                ))}
              </div>
              {eventos.filter(e => e.type === 'unlock_special').map(e => {
                const passiva = character?.signature_specials?.find(s => s.id === e.special_id)?.kind === 'passive'
                return (
                  <p key={e.special_id} className="gang-levelup-talento">
                    <b>{t(`games.gangues.progression.skills.${e.special_id}`)}</b>
                    <em>{t(passiva ? 'games.gangues.levelup.passiva_sempre' : 'games.gangues.levelup.ativa_equipar')}</em>
                    <span>{describeGanguesSpecialEffect(t, e.special_id, 1)}</span>
                  </p>
                )
              })}
            </div>
          )
        })}
        <button className="gang-progression-prompt__confirm" onClick={onClose}>{t('games.gangues.levelup.continuar')}</button>
      </div>
    </div>
  )
}
