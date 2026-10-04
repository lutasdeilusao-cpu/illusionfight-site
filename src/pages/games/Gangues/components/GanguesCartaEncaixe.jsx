import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useGanguesStore } from '../store/useGanguesStore'
import { GANGUES_CARTAS_LISTA, nomeCarta, textoCarta } from '../data/ganguesCartas.js'
import { nomePeca } from '../data/ganguesEquip.js'
import { sfx } from '../../../../lib/sfx'

/* Encaixar carta num encaixe vazio de uma peça. Lista as cartas da gangue que
   servem no espaço da peça; escolher pede confirmação, porque a carta fica
   presa pra sempre. `alvo` = { uid } (peça no bolso) ou { memberId, slot }. */
export default function GanguesCartaEncaixe({ t, def, peca, alvo, indice, onClose }) {
  const inventario = useGanguesStore(s => s.inventario)
  const encaixarCarta = useGanguesStore(s => s.encaixarCarta)
  const [escolhida, setEscolhida] = useState(null)
  const cartas = GANGUES_CARTAS_LISTA.filter(c => c.slot === def.slot && (inventario[c.id] || 0) > 0)

  const confirmar = () => {
    if (encaixarCarta(alvo, indice, escolhida.id)) { sfx.reward?.(); onClose() }
    else sfx.cancel?.()
  }

  return createPortal((
    <div className="gang-carta-encaixe" role="dialog" aria-modal="true">
      <button className="gang-carta-encaixe__scrim" onClick={onClose} aria-label={t('games.gangues.cena.fechar')} />
      <div className="gang-carta-encaixe__card">
        <header className="gang-carta-encaixe__head">
          <strong>{t('games.gangues.carta.encaixar_em', { peca: nomePeca(t, def, peca) })}</strong>
          <button onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>×</button>
        </header>
        <p className="gang-carta-encaixe__sub">{t('games.gangues.carta.so_espaco', { espaco: t(`games.gangues.equip.slots.${def.slot}`) })}</p>
        {escolhida ? (
          <div className="gang-carta-encaixe__confirma">
            <span className="gang-carta-encaixe__icone">🃏</span>
            <strong>{nomeCarta(t, escolhida)}</strong>
            <em>{textoCarta(t, escolhida)}</em>
            <p>{t('games.gangues.carta.pra_sempre')}</p>
            <div className="gang-carta-encaixe__acoes">
              <button className="gang-equip-btn gang-equip-btn--off" onClick={() => setEscolhida(null)}>{t('games.gangues.carta.voltar')}</button>
              <button className="gang-equip-btn" onClick={confirmar}>{t('games.gangues.carta.encaixar')}</button>
            </div>
          </div>
        ) : cartas.length === 0 ? (
          <p className="gang-carta-encaixe__vazio">{t('games.gangues.carta.sem_cartas')}</p>
        ) : (
          <div className="gang-carta-encaixe__lista">
            {cartas.map(c => (
              <button key={c.id} className="gang-carta-encaixe__item" onClick={() => { sfx.click?.(); setEscolhida(c) }}>
                <span className="gang-carta-encaixe__icone">🃏</span>
                <span className="gang-carta-encaixe__info">
                  <strong>{nomeCarta(t, c)} ×{inventario[c.id]}</strong>
                  <em>{textoCarta(t, c)}</em>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  ), document.body)
}
