import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { capitulosEspeciais, capitulosPrincipais, imagemWebshard, localizado } from '../../../../lib/webshard/catalogo'
import { listarHistorias } from '../../../../lib/historias/catalogo'
import CapituloLinha from './CapituloLinha'
import './LobbyLDI.css'

/** Lobby do Lutas de Ilusão, estilo streaming: fileiras de capas que rolam de lado.
 *  Séries (linha principal + especiais com `serie`) abrem a lista de capítulos
 *  embaixo só quando escolhidas; contos levam pra página de cada conto. */
export default function LobbyLDI({ titulo, liberado, previa, dataPara, nivel, progresso }) {
  const { t, locale } = useLanguage()
  const [escolhida, setEscolhida] = useState(null)

  const series = useMemo(() => {
    const principal = { id: 'principal', capa: titulo.capa, nome: t('webShard.lobby.principal'), tagline: localizado(titulo, 'tagline', locale), caps: capitulosPrincipais(titulo) }
    const especiais = (titulo.series || []).map(s => ({
      id: s.id, capa: s.capa, nome: localizado(s, 'nome', locale), tagline: localizado(s, 'tagline', locale),
      caps: capitulosEspeciais(titulo).filter(c => c.serie === s.id),
    })).filter(s => s.caps.some(c => liberado(c) || previa(c)))
    return [principal, ...especiais]
  }, [titulo, locale, t, liberado, previa])
  const contos = useMemo(() => listarHistorias('conto'), [])
  const atual = series.find(s => s.id === escolhida)

  return (
    <div className="lobby-ldi">
      <section className="lobby-ldi__fileira">
        <h2 className="lobby-ldi__h2">{t('webShard.lobby.series')}</h2>
        <div className="lobby-ldi__trilho">
          {series.map(s => (
            <button key={s.id} type="button" className={`lobby-ldi__poster${escolhida === s.id ? ' is-ativo' : ''}`} onClick={() => setEscolhida(escolhida === s.id ? null : s.id)}>
              {imagemWebshard(s.capa) && <img src={imagemWebshard(s.capa)} alt="" loading="lazy" decoding="async" />}
              <span className="lobby-ldi__poster-info">
                <span className="lobby-ldi__poster-nome">{s.nome}</span>
                <span className="lobby-ldi__poster-sub">{s.tagline}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {atual ? (
        <section className="lobby-ldi__caps">
          <div className="lobby-ldi__caps-cabeca">
            <h2 className="lobby-ldi__h2">{atual.nome}</h2>
            <span className="lobby-ldi__total">{t('webShard.titulo.total_caps', { n: atual.caps.filter(c => c.paginas).length })}</span>
          </div>
          <div className="lobby-ldi__lista if-stagger">
            {atual.caps.map(cap => (
              <CapituloLinha key={cap.id} titulo={titulo} cap={cap} liberado={liberado(cap)} data={dataPara(cap)} nivel={nivel} progresso={progresso} previa={previa(cap)} />
            ))}
          </div>
        </section>
      ) : (
        <p className="lobby-ldi__dica">{t('webShard.lobby.escolha')}</p>
      )}

      <section className="lobby-ldi__fileira">
        <h2 className="lobby-ldi__h2">{t('webShard.lobby.contos')}</h2>
        <div className="lobby-ldi__trilho">
          {contos.map(c => (
            <Link key={c.id} to={c.rota} className="lobby-ldi__poster lobby-ldi__poster--conto">
              {c.capa && <img src={c.capa} alt="" loading="lazy" decoding="async" />}
              <span className="lobby-ldi__poster-info">
                <span className="lobby-ldi__poster-nome">{localizado(c, 'nome', locale)}</span>
                <span className="lobby-ldi__poster-sub">{localizado(c, 'tagline', locale)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
