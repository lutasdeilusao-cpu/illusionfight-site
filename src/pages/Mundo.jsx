import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { usePersonagens } from '../hooks/usePersonagens'
import CharacterCard from '../components/CharacterCard'
import data from '../data/mundo-pt.json'
import './Mundo.css'

const PROTAGONIST_IDS = ['kim', 'jack', 'nina']

export default function Mundo() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const all = usePersonagens()
  const protagonists = all.filter(p => PROTAGONIST_IDS.includes(p.id))

  return (
    <>
      <Helmet><title>Mundo — Lutas de Ilusão</title></Helmet>

      <section className="mundo-hero">
        <div className="container">
          <h1 className="mundo-hero__title">O UNIVERSO</h1>
          <p className="mundo-hero__subtitle">Bravara. 2030. Uma arena onde a dor é 100% real.</p>
        </div>
      </section>

      <section className="mundo-section" id="bravara">
        <div className="container">
          <h2 className="section-title">BRAVARA</h2>
          <div className="mundo-two-cols">
            <div className="mundo-col">
              <h3 className="mundo-col-title">O País</h3>
              <p className="mundo-text">Bravara é uma nação de contrastes violentos. Florestas tropicais densas convivem com centros urbanos onde a tecnologia da Yohualticit coexiste com casas invadidas, vielas sem infraestrutura e jovens que vendem balas em ônibus para pagar a conta de luz.</p>
            </div>
            <div className="mundo-col">
              <h3 className="mundo-col-title">2030</h3>
              <p className="mundo-text">Em 2030, Bravara é um país com um pé no futuro e outro num passado que nunca foi resolvido. A Elite Academy usa realidade aumentada nas salas de aula. A periferia de Marelia não tem saneamento básico. O LDI é o maior fenômeno cultural do mundo. E três bilhões de pessoas escolhem sentir dor de verdade por ranking.</p>
            </div>
          </div>

          <div className="mundo-locais-grid">
            {data.localizacoes.map(l => (
              <div key={l.nome} className="mundo-local-card">
                <h4 className="mundo-local-nome">{l.nome}</h4>
                <p className="mundo-local-desc">{l.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mundo-section mundo-section--alt" id="timeline">
        <div className="container">
          <h2 className="section-title">LINHA DO TEMPO</h2>
          <div className="timeline-track">
            {data.timeline.map((p, i) => (
              <div key={p.ano} className={`timeline-point${p.ano === '2030' ? ' timeline-point--now' : ''}`}>
                <span className="timeline-ano">{p.ano}</span>
                <span className="timeline-texto">{p.texto}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mundo-section" id="ldi">
        <div className="container">
          <h2 className="section-title">LUTAS DE ILUSÃO</h2>
          <p className="mundo-subtitle">"Uma arena virtual. Dor 100% real."</p>
          <p className="mundo-text mundo-text--max">O LDI foi criado pela Yohualticit em 2022. O hardware SBI — capacete e luva tecnológica — conecta o sistema nervoso do jogador ao MDI, o Mundo de Ilusões. Dentro do LDI, você manifesta poderes elementais, empunha armas criadas pelo próprio espírito e sente cada golpe como se fosse real. Três bilhões de jogadores escolhem isso todos os dias.</p>

          <div className="mundo-combat-grid">
            <div className="mundo-combat-card">
              <span className="mundo-combat-icon">⚡</span>
              <h3 className="mundo-combat-title">Mãos Livres</h3>
              <p className="mundo-combat-desc">O modo básico. Menor gasto de energia. Força e velocidade sobre-humanas. A escolha de quem sabe o que está fazendo.</p>
            </div>
            <div className="mundo-combat-card">
              <span className="mundo-combat-icon">⚔️</span>
              <h3 className="mundo-combat-title">Modo de Armas</h3>
              <p className="mundo-combat-desc">Cada arma tem forma Normal e forma Xamã. Algumas se manifestam espontaneamente — e isso não é normal.</p>
            </div>
            <div className="mundo-combat-card">
              <span className="mundo-combat-icon">🔥</span>
              <h3 className="mundo-combat-title">Modo de Poder</h3>
              <p className="mundo-combat-desc">Elementais primários: Fogo, Terra, Ar, Água, Luz, Escuridão. A energia mental determina o poder, não o físico.</p>
            </div>
          </div>

          <h3 className="mundo-section-subtitle">Ranking SDR</h3>
          <div className="mundo-ranking">
            {data.ranking_sdr.map(r => (
              <div key={r.faixa} className="mundo-ranking-item" style={{ '--rank-color': r.cor }}>
                <span className="mundo-ranking-faixa">{r.faixa}</span>
                <span className="mundo-ranking-label">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mundo-section mundo-section--alt" id="xakaxi">
        <div className="container">
          <h2 className="section-title">OS XAKAXI</h2>
          <p className="mundo-subtitle">"Em 1450, eles eram o povo mais avançado do mundo. Cinquenta anos depois, não existiam mais."</p>
          <p className="mundo-text mundo-text--max">A tribo Xakaxi habitava o território que hoje é Bravara. Dominavam seis elementos. Possuíam fibra de carbono, agricultura robotizada, óculos amplificadores e um metal único chamado Xakaxium. Eram uma civilização que não deveria existir naquele século — e não existe mais.</p>
          <p className="mundo-text mundo-text--max">O que os destruiu não foi a invasão de 1500. Foi o ritual proibido do filho do próprio Pajé. Powa abriu uma porta que não devia ser aberta. Para fechá-la, Yawanari sacrificou o próprio corpo. A tribo perdeu a memória tecnológica. Quando os invasores chegaram, não havia mais nada para defender.</p>

          <div className="mundo-tech-grid">
            {data.tecnologias_xakaxi.map(t => (
              <div key={t.nome} className="mundo-tech-card">
                <h4 className="mundo-tech-nome">{t.nome}</h4>
                <p className="mundo-tech-desc">{t.descricao}</p>
              </div>
            ))}
          </div>

          <div className="mundo-premium-badge">
            <p>Ritual do Selamento detalhado, fichas de Yawanari, Powa e Tawira, e as Sagas Primordiais</p>
            <span className="mundo-premium-tag">PREMIUM</span>
          </div>
        </div>
      </section>

      <section className="mundo-section" id="glossario">
        <div className="container">
          <h2 className="section-title">GLOSSÁRIO</h2>
          <div className="mundo-glossario-grid">
            {data.glossario.map(g => (
              <div key={g.sigla} className={`mundo-glossario-card${g.premium ? ' mundo-glossario-card--premium' : ''}`}>
                <span className="mundo-glossario-sigla">{g.sigla}</span>
                <span className="mundo-glossario-nome">{g.nome}</span>
                <p className="mundo-glossario-desc">{g.descricao}</p>
                {g.premium && <span className="mundo-premium-tag mundo-premium-tag--sm">PREMIUM</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mundo-section mundo-section--alt" id="personagens">
        <div className="container">
          <h2 className="section-title">CONHEÇA OS PERSONAGENS</h2>
          <div className="mundo-personagens-row">
            {protagonists.map(p => (
              <CharacterCard key={p.id} character={p} />
            ))}
          </div>
          <button className="mundo-ver-todos" onClick={() => navigate('/personagens')}>
            VER TODOS
          </button>
        </div>
      </section>
    </>
  )
}
