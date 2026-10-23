import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { capituloTemConteudo, capitulosDe, capitulosEspeciais, capitulosPrincipais, rotaTitulo, tituloPorSlug } from '../../../../lib/webshard/catalogo'
import { lerProgresso } from '../../../../lib/webshard/progresso'
import CarrosselLento from '../../../../components/CarrosselLento/CarrosselLento'
import EpisodioCard from './EpisodioCard'
import './LobbyLDI.css'

/** Lobby do Lutas de Ilusão, estilo streaming. Três fileiras, cada uma com
 *  uma frase dizendo o que é: a linha principal, os especiais e os contos em
 *  quadrinho (o título `contos-de-ilusao`, que mora dentro deste). Cada capa
 *  abre a leitura direto; o que ainda não saiu aparece em preto e branco. */
export default function LobbyLDI({ titulo, liberado, dataPara, progresso }) {
  const { t } = useLanguage()
  const contos = useMemo(() => tituloPorSlug('contos-de-ilusao', { isAdmin: true, soAdmin: true }), [])

  const fileiras = [
    { id: 'principal', titulo, caps: capitulosPrincipais(titulo), progresso },
    { id: 'especiais', titulo, caps: capitulosEspeciais(titulo).filter(capituloTemConteudo), progresso },
    contos && { id: 'contos', titulo: contos, caps: capitulosDe(contos), progresso: lerProgresso(contos.slug), link: rotaTitulo(contos) },
  ].filter(f => f && f.caps.length)

  return (
    <div className="lobby-ldi">
      {fileiras.map(f => (
        <section key={f.id} className="lobby-ldi__fileira">
          <div className="lobby-ldi__cabeca">
            <h2 className="lobby-ldi__h2">{t(`webShard.lobby.${f.id}`)}</h2>
            {f.link && <Link to={f.link} className="lobby-ldi__ver">{t('webShard.lobby.ver_tudo')} ›</Link>}
          </div>
          <p className="lobby-ldi__sub">{t(`webShard.lobby.${f.id}_sub`)}</p>
          <CarrosselLento trilhoClassName="lobby-ldi__trilho" intervalo={0}>
            {f.caps.map(cap => (
              <EpisodioCard key={cap.id} titulo={f.titulo} cap={cap} liberado={liberado(cap)} data={dataPara(cap)} progresso={f.progresso} />
            ))}
          </CarrosselLento>
        </section>
      ))}
    </div>
  )
}
