import { createPortal } from 'react-dom'
import { getGanguesItem } from '../data/ganguesItens.js'
import '../screens/GanguesProgressionFlow.css'

// Modal BLOQUEANTE (mesma linguagem visual do prompt de level-up, ver
// `.gang-progression-prompt` em GanguesProgressionFlow.css) pra recompensa
// automática a cada marco de reputação (a cada 50 pontos, ver
// GANGUES_REP_MARCO_INTERVALO em data/ganguesLoadout.js). Pedido do Isaias
// (2026-09-14): "tem que esparmar na tela e falar pegue aqui sua
// recompensa" — nada de toast que some sozinho, só fecha no clique.
// `marco`: { nivel, valor, itemId } (o ÚLTIMO marco cruzado, se mais de um
// tiver sido cruzado de uma vez — todos já foram concedidos no inventário
// antes de chegar aqui, ver ganharRep em ganguesCenaEconomiaSlice.js).
export default function GanguesRepRecompensaModal({ t, marco, onClose }) {
  if (!marco) return null
  const item = getGanguesItem(marco.itemId)

  return createPortal(
    <div className="gang-progression-prompt" role="dialog" aria-modal="true" aria-labelledby="gang-rep-recompensa-title">
      <div className="gang-progression-prompt__card">
        <span className="gang-progression-prompt__icon">🎖</span>
        <h2 id="gang-rep-recompensa-title">{t('games.gangues.cena.rep_recompensa.titulo', { valor: marco.valor })}</h2>
        <p>{t('games.gangues.cena.rep_recompensa.sub')}</p>
        {item && (
          <div className="gang-rep-recompensa-item">
            <b>{item.icone}</b>
            <span>{t(item.nome)}</span>
          </div>
        )}
        <button className="gang-progression-prompt__confirm" onClick={onClose}>{t('games.gangues.cena.rep_recompensa.pegar')}</button>
      </div>
    </div>,
    document.body
  )
}
