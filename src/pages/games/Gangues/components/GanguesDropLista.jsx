import { dropsDoInimigo, infoDoDrop } from '../data/ganguesDrops.js'
import { faltamPraGarantia } from '../engine/ganguesDrop.js'

const pct = chance => `${(chance * 100).toLocaleString(document.documentElement.lang || 'pt-BR', { maximumFractionDigits: 2 })}%`

/* O que o inimigo derruba: chance de cada linha e quantas vitórias faltam,
   no máximo, pra garantia. `contadores` = storyProgress.__drops. */
export default function GanguesDropLista({ enemyId, contadores = {}, t }) {
  const linhas = dropsDoInimigo(enemyId)
  if (!linhas.length) return null
  return (
    <ul className="gang-drop-lista">
      {linhas.map(linha => {
        const info = infoDoDrop(t, linha)
        return (
          <li key={`${linha.tipo}-${linha.id}`} className={`gang-drop-linha gang-drop-linha--${linha.tipo}`}>
            <b>{info.icone}</b>
            <span className="gang-drop-linha__nome">{info.nome}</span>
            <span className="gang-drop-linha__chance">{pct(linha.chance)}</span>
            <small className="gang-drop-linha__garantia">{t('games.gangues.drop.garantia', { n: faltamPraGarantia(enemyId, linha, contadores) })}{linha.tipo === 'equip' ? ` · ${t('games.gangues.drop.variante')}` : ''}</small>
          </li>
        )
      })}
    </ul>
  )
}
