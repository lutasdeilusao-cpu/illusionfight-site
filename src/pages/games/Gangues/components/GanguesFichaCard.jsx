import { useLanguage } from '../../../../context/LanguageContext'

const ATTRS = ['A', 'H', 'R', 'D']

/** Conteúdo visual de uma ficha — usado dentro de QUALQUER moldura (o modal
 *  de recrutamento, o popup rápido de combate, o topo da tela de progressão)
 *  pra manter uma única linguagem visual em vez de 3 estilos diferentes.
 *  Cada seção é opcional: quem chama passa só o que faz sentido no contexto
 *  (recrutamento não tem PV/PM atual porque o personagem nunca lutou; fora
 *  de combate não tem "atual" de PV/PM, só o máximo). */
export default function GanguesFichaCard({ numero, nome, caminho, subcaminho, nivel, atributos, pv, pm, xp, tecnica, tituloId }) {
  const { t } = useLanguage()
  return (
    <>
      <div className="gang-sheet-modal__hero">
        {numero != null && <span>#{String(numero).padStart(2, '0')}</span>}
        <i>{nome?.[0]?.toUpperCase()}</i>
        {caminho && <small>{t(`games.gangues.loadout.paths.${caminho}.name`)}</small>}
        <h2 id={tituloId}>{nome}{nivel != null && <b className="gang-ficha-nivel"> · NV {nivel}</b>}</h2>
        {subcaminho && <p>{subcaminho}</p>}
      </div>

      <div className="gang-sheet-modal__stats">
        {ATTRS.map(attr => (
          <div key={attr}>
            <span>{t(`games.gangues.attr_labels.${attr}`)}</span>
            <strong>{atributos?.[attr] ?? 0}</strong>
            <i>{Array.from({ length: 5 }, (_, index) => <b key={index} className={index < (atributos?.[attr] ?? 0) ? 'is-on' : ''} />)}</i>
          </div>
        ))}
      </div>

      {(pv || pm) && (
        <div className="gang-sheet-modal__resources">
          {pv && (
            <span>
              <span className="gang-sheet-modal__resource-row"><small>PV</small><strong>{pv.atual != null ? `${Math.max(0, pv.atual)}/${pv.max}` : pv.max}</strong></span>
              {pv.atual != null && <i className="gang-ficha-bar gang-ficha-bar--pv"><b style={{ width: `${Math.max(0, Math.min(100, (pv.atual / pv.max) * 100))}%` }} /></i>}
            </span>
          )}
          {pm && (
            <span>
              <span className="gang-sheet-modal__resource-row"><small>PM</small><strong>{pm.atual != null ? `${Math.max(0, pm.atual)}/${pm.max}` : pm.max}</strong></span>
              {pm.atual != null && <i className="gang-ficha-bar gang-ficha-bar--pm"><b style={{ width: `${Math.max(0, Math.min(100, (pm.atual / pm.max) * 100))}%` }} /></i>}
            </span>
          )}
        </div>
      )}

      {xp && (
        <div className="gang-sheet-modal__xp">
          <span className="gang-sheet-modal__resource-row"><small>XP</small><strong>{xp.atual}/{xp.max}</strong></span>
          <i className="gang-ficha-bar gang-ficha-bar--xp"><b style={{ width: `${Math.max(0, Math.min(100, (xp.atual / xp.max) * 100))}%` }} /></i>
          {xp.disponivel > 0 && <small className="gang-ficha-xp-disponivel">{t('games.gangues.ficha_xp_disponivel', { n: xp.disponivel })}</small>}
        </div>
      )}

      {tecnica && (
        <div className="gang-sheet-modal__technique">
          <small>{t('games.gangues.recruitment.starting_technique')}</small>
          <strong>{tecnica.nome}</strong>
          <span>{tecnica.custo} PM</span>
        </div>
      )}
    </>
  )
}
