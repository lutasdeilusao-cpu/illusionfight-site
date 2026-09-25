import { useLanguage } from '../../../../context/LanguageContext'
import { imagemWebshard, localizado } from '../../../../lib/webshard/catalogo'
import './TituloHero.css'

/** Capa grande de um título: arte de fundo com corte diagonal na base,
 *  nome, selos (gênero, classificação, status) e o texto de apoio.
 *  Os botões vêm de fora (children) — o hub e a página do título pedem
 *  ações diferentes. Histórias reaproveita: `capa`/`nome` já resolvidos e
 *  `selos` próprios (peso, canon) no lugar de gênero/classificação. */
export default function TituloHero({ titulo, texto, eyebrow, as: Titulo = 'h2', children, capa: capaProp, nome: nomeProp, selos }) {
  const { t, locale } = useLanguage()
  const capa = capaProp ?? imagemWebshard(titulo.capa)
  const nome = nomeProp ?? localizado(titulo, 'nome', locale)

  return (
    <section className="ws-hero" style={{ '--ws-cor': titulo.cor }}>
      <div className="ws-hero__arte">
        {capa && <img src={capa} alt={nome} fetchpriority="high" decoding="async" />}
      </div>
      <div className="ws-hero__conteudo">
        {eyebrow && <span className="ws-hero__eyebrow">{eyebrow}</span>}
        <Titulo className="ws-hero__nome">{nome}</Titulo>
        <div className="ws-hero__selos">
          <span className="ws-hero__selo ws-hero__selo--cor">{t(`webShard.status.${titulo.status}`)}</span>
          {selos ? selos.map(s => <span key={s} className="ws-hero__selo">{s}</span>) : (
            <>
              {titulo.generos.map(g => (
                <span key={g} className="ws-hero__selo">{t(`webShard.generos.${g}`)}</span>
              ))}
              <span className="ws-hero__selo">{t('webShard.titulo.classificacao', { n: titulo.classificacao })}</span>
            </>
          )}
        </div>
        {texto && texto.split('\n\n').map((p, i) => <p key={i} className="ws-hero__texto">{p}</p>)}
        {children && <div className="ws-hero__acoes">{children}</div>}
      </div>
    </section>
  )
}
