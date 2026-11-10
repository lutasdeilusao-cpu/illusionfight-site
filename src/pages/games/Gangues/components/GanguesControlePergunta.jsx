// Pergunta de entrada (só no computador, uma vez): jogar no mouse ou no
// teclado? Ver hooks/ganguesControle.js. Funciona nos dois: clique, setas +
// Enter, ou as teclas M / T direto.
import { createPortal } from 'react-dom'
import { sfx } from '../../../../lib/sfx'
import { definirModoControle } from '../hooks/ganguesControle'
import useGanguesTeclado from '../hooks/useGanguesTeclado'
import './GanguesControlePergunta.css'

export default function GanguesControlePergunta({ t }) {
  const escolher = modo => { sfx.select?.(); definirModoControle(modo) }
  useGanguesTeclado({ m: () => escolher('mouse'), t: () => escolher('teclado') }, true, 2)

  return createPortal(
    <div className="gang-controle-pergunta" role="dialog" aria-modal="true" aria-labelledby="gang-controle-titulo">
      <div className="gang-controle-pergunta__card">
        <span className="gang-controle-pergunta__eyebrow">LDI GANGUES</span>
        <h2 id="gang-controle-titulo">{t('games.gangues.controle.titulo')}</h2>
        <p>{t('games.gangues.controle.texto')}</p>
        <div className="gang-controle-pergunta__opcoes">
          <button type="button" autoFocus onClick={() => escolher('teclado')}>
            <b aria-hidden="true">⌨️</b>
            <strong>{t('games.gangues.controle.teclado')}</strong>
            <small>{t('games.gangues.controle.teclado_dica')}</small>
          </button>
          <button type="button" onClick={() => escolher('mouse')}>
            <b aria-hidden="true">🖱️</b>
            <strong>{t('games.gangues.controle.mouse')}</strong>
            <small>{t('games.gangues.controle.mouse_dica')}</small>
          </button>
        </div>
        <p className="gang-controle-pergunta__rodape">{t('games.gangues.controle.rodape')}</p>
      </div>
    </div>,
    document.body,
  )
}
