import { GANGUES_TROFEUS, GANGUES_TROFEUS_GRUPOS, progressoDoTrofeu, textoTrofeu } from '../data/ganguesTrofeus.js'
import './GanguesTrofeusLista.css'

/* Troféus do save, por grupo, com barra de progresso. Usado na Coleção do jogo
   e na aba Gangues do perfil. `estado` = estadoDosTrofeus(...). */
export default function GanguesTrofeusLista({ t, estado }) {
  const feitos = new Set((estado.storyProgress?.__trofeus || []).map(Number))
  return (
    <div className="gang-trofeus">
      <p className="gang-trofeus__total"><b>{feitos.size}</b>/{GANGUES_TROFEUS.length} {t('games.gangues.trofeus.titulo')}</p>
      {GANGUES_TROFEUS_GRUPOS.map(grupo => (
        <section key={grupo} className="gang-trofeus__grupo">
          <h4>{t(`games.gangues.trofeus.grupos.${grupo}`)}</h4>
          <ul>
            {GANGUES_TROFEUS.filter(tr => tr.grupo === grupo).map(tr => {
              const on = feitos.has(tr.id)
              const [atual, alvo] = progressoDoTrofeu(tr, estado)
              const { nome, desc } = textoTrofeu(t, tr)
              return (
                <li key={tr.id} className={`gang-trofeu${on ? ' is-on' : ''}`}>
                  <span className="gang-trofeu__icone">{on ? tr.icone : '🔒'}</span>
                  <span className="gang-trofeu__info">
                    <strong>{nome}</strong>
                    <small>{desc}</small>
                    {!on && alvo > 1 && (
                      <span className="gang-trofeu__barra" role="progressbar" aria-valuenow={atual} aria-valuemax={alvo}>
                        <i style={{ '--pct': `${Math.round((atual / alvo) * 100)}%` }} />
                        <em>{atual}/{alvo}</em>
                      </span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
