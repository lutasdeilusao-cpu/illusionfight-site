import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { usePersonagem } from '../hooks/usePersonagens'
import './PersonagemDetalhe.css'

export default function PersonagemDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const personagem = usePersonagem(id)
  const [imgError, setImgError] = useState(false)

  if (!personagem) {
    return (
      <section className="personagem-detail">
        <Helmet>
          <title>Personagem não encontrado — Lutas de Ilusão</title>
        </Helmet>
        <div className="container">
          <button className="personagem-detail__back" onClick={() => navigate('/personagens')}>
            ← PERSONAGENS
          </button>
          <p>Personagem não encontrado.</p>
        </div>
      </section>
    )
  }

  const meta = [
    personagem.idade && { label: 'Idade', value: `${personagem.idade} anos` },
    personagem.status && { label: 'Status', value: personagem.status },
    personagem.grupo && { label: 'Grupo', value: personagem.grupo },
  ].filter(Boolean)

  const combat = [
    personagem.arma && { label: 'Arma', value: personagem.arma },
    personagem.estilo && { label: 'Estilo', value: personagem.estilo },
    personagem.elemental && { label: 'Elemental', value: personagem.elemental },
  ].filter(Boolean)

  return (
    <section className="personagem-detail">
      <Helmet>
        <title>{personagem.nome} — Lutas de Ilusão</title>
      </Helmet>
      <div className="container">
        <button className="personagem-detail__back" onClick={() => navigate('/personagens')}>
          ← PERSONAGENS
        </button>

        <div className="personagem-detail__grid">
          <div className="personagem-detail__image">
            {personagem.imagem && !imgError ? (
              <img src={personagem.imagem} alt={personagem.nome} onError={() => setImgError(true)} />
            ) : (
              <span className="personagem-detail__image-placeholder">{personagem.nome}</span>
            )}
          </div>

          <div className="personagem-detail__info">
            <h1 className="personagem-detail__name">{personagem.nomeCompleto || personagem.nome}</h1>
            {personagem.apelido && <p className="personagem-detail__apelido">{personagem.apelido}</p>}

            {personagem.ranking && (
              <div className="personagem-detail__meta-value personagem-detail__meta-value--ranking">
                #{personagem.ranking}
              </div>
            )}

            {meta.length > 0 && (
              <div className="personagem-detail__meta">
                {meta.map(m => (
                  <div key={m.label} className="personagem-detail__meta-item">
                    <span className="personagem-detail__meta-label">{m.label}</span>
                    <span className="personagem-detail__meta-value">{m.value}</span>
                  </div>
                ))}
              </div>
            )}

            {combat.length > 0 && (
              <div className="personagem-detail__combat">
                {combat.map(c => (
                  <div key={c.label} className="personagem-detail__combat-row">
                    <span className="personagem-detail__combat-label">{c.label}</span>
                    <span className="personagem-detail__combat-value">{c.value}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="personagem-detail__descricao">{personagem.descricaoCompleta}</p>

            {personagem.frase && (
              <div className="personagem-detail__frase">"{personagem.frase}"</div>
            )}

            {personagem.relacoes && personagem.relacoes.length > 0 && (
              <>
                <h3 className="personagem-detail__relacoes-title">Relações</h3>
                <div className="personagem-detail__relacoes">
                  {personagem.relacoes.map((r, i) => (
                    <div key={i} className="personagem-detail__relacao">
                      <span className="personagem-detail__relacao-personagem">{r.personagem}</span>
                      <span className="personagem-detail__relacao-tipo">— {r.tipo}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
