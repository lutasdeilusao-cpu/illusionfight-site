import { createPortal } from 'react-dom'
import { sfx } from '../../../../lib/sfx'
import { getEquippedActiveGanguesSpecials } from '../engine/ganguesSpecialEffects.js'
import { GANGUES_ITENS_LISTA, textoEfeitoItem } from '../data/ganguesItens.js'

const TIPOS_DA_TATICA = new Set(['cura_pv', 'cura_pm'])

// Tática da Briga em Multidão: pra cada lutador, o talento que ele usa e a
// poção (PV ou PM) que ele toma quando fizer sentido. Vale pra todas as
// rodadas e lutas até o jogador mudar. Portal no <body>: a luta tem elementos animados por cima.
export default function GanguesMultidaoTatica({ t, time, poderes, escolherPoder, itens, escolherItem, inventario, onClose }) {
  // Na tática só entram as poções de PV e de PM; o resto da bolsa não serve aqui.
  const itensDeLuta = GANGUES_ITENS_LISTA.filter(it => TIPOS_DA_TATICA.has(it.tipo) && (inventario[it.id] || 0) > 0)
  const tocar = fn => { sfx.select?.(); fn() }
  return createPortal((
    <div className="gang-tatica" role="dialog" aria-modal="true">
      <button className="gang-tatica__scrim" onClick={onClose} aria-label={t('games.gangues.cena.fechar')} />
      <div className="gang-tatica__card">
        <p className="gang-tatica__eyebrow">{t('games.gangues.multidao.tatica')}</p>
        <p className="gang-tatica__sub">{t('games.gangues.multidao.tatica_sub')}</p>
        {time.map(member => {
          const especiais = getEquippedActiveGanguesSpecials(member)
          const poder = poderes[member.id] || null
          const item = itens[member.id] || null
          return (
            <div key={member.id} className="gang-tatica__membro">
              <strong className="gang-tatica__nome">{member.sheet_name}</strong>
              <small className="gang-tatica__rotulo">{t('games.gangues.multidao.tatica_talento')}</small>
              <div className="gang-tatica__opcoes">
                <button type="button" className={`gang-tatica__op${!poder ? ' is-on' : ''}`} onClick={() => tocar(() => escolherPoder(member.id, null))}>
                  {t('games.gangues.combat_specials.normal_attack')}
                </button>
                {especiais.map(s => (
                  <button key={s.id} type="button" className={`gang-tatica__op${poder === s.id ? ' is-on' : ''}`} onClick={() => tocar(() => escolherPoder(member.id, s.id))}>
                    {t(`games.gangues.progression.skills.${s.id}`)}
                  </button>
                ))}
              </div>
              <small className="gang-tatica__rotulo">{t('games.gangues.multidao.tatica_item')}</small>
              <div className="gang-tatica__opcoes">
                <button type="button" className={`gang-tatica__op gang-tatica__op--item${!item ? ' is-on' : ''}`} onClick={() => tocar(() => escolherItem(member.id, null))}>
                  {t('games.gangues.multidao.tatica_sem_item')}
                </button>
                {itensDeLuta.map(it => (
                  <button key={it.id} type="button" className={`gang-tatica__op gang-tatica__op--item${item === it.id ? ' is-on' : ''}`} onClick={() => tocar(() => escolherItem(member.id, it.id))}>
                    {it.icone} {t(it.nome)} ×{inventario[it.id]}
                    <small>{textoEfeitoItem(t, it)}</small>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
        <button type="button" className="gang-tatica__pronto" onClick={onClose}>{t('games.gangues.multidao.tatica_pronto')}</button>
      </div>
    </div>
  ), document.body)
}
