import { useLanguage } from '../../../../context/LanguageContext'
import { formatarData } from '../../../../lib/webshard/catalogo'
import './CascataLiberacao.css'

const DEGRAUS = [
  { id: 'assinante', niveis: ['primordial', 'elite'], campo: 'elite', rotulo: 'calendar.level_subscriber' },
  { id: 'conta', niveis: ['conta'], campo: 'conta', rotulo: 'calendar.level_account' },
  { id: 'publico', niveis: ['publico'], campo: 'publico', rotulo: 'calendar.level_public' },
]

/** As 3 datas de um capítulo travado (assinante → conta grátis → público),
 *  lado a lado. Mostrar só a data do público afastava gente ("ninguém volta
 *  daqui a 4 meses") — a cascata deixa claro que dá pra ler antes. O degrau
 *  de quem está vendo leva "você". */
export default function CascataLiberacao({ liberacao, nivel }) {
  const { t } = useLanguage()
  if (!liberacao) return null
  return (
    <span className="ws-cascata">
      {DEGRAUS.map(d => (
        <span
          key={d.id}
          className={`ws-cascata__degrau ws-cascata__degrau--${d.id}${d.niveis.includes(nivel) ? ' is-voce' : ''}`}
        >
          <span className="ws-cascata__rotulo">{t(d.rotulo)}</span>
          <span className="ws-cascata__data">{formatarData(liberacao[d.campo])}</span>
          {d.niveis.includes(nivel) && <span className="ws-cascata__voce">{t('webShard.cascata.voce')}</span>}
        </span>
      ))}
    </span>
  )
}
