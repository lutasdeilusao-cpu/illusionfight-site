import { CARD_LABELS, ATTR_META } from '../../i18n/cardLabels'
import templateImg from '../../assets/images/cards/TemplateBaseReutilizavel.png'
import './TopTrumpsCard.css'

/**
 * TopTrumpsCard — Template reutilizável de carta do Super Trunfo LDI.
 *
 * Props:
 *   characterImage  — URL da imagem de fundo do personagem (bg)
 *   name            — Nome do personagem
 *   description     — Descrição curta (vai na área inferior esquerda)
 *   locale          — 'pt' | 'en' | 'es'
 *   attributes      — { rank_sdr, poder_mental, velocidade, resistencia, nivel_xama, fator_caos, energia_base, poder_explosivo }
 *   faceDown        — Se true, mostra o verso da carta
 */
export default function TopTrumpsCard({
  characterImage,
  name = '',
  description = '',
  locale = 'pt',
  attributes = {},
  faceDown = false,
}) {
  const labels = CARD_LABELS[locale] || CARD_LABELS.pt

  if (faceDown) {
    return (
      <div className="tt-card-template">
        <div className="tt-card-verso">
          <span className="tt-card-verso-icon">?</span>
        </div>
      </div>
    )
  }

  return (
    <div className="tt-card-template">
      {/* Camada 1 — Background do personagem (visível dentro do hexágono) */}
      {characterImage && (
        <div
          className="tt-card-character-bg"
          style={{ backgroundImage: `url(${characterImage})` }}
        />
      )}

      {/* Camada 2 — Template PNG (moldura fixa) */}
      <img
        className="tt-card-template-img"
        src={templateImg}
        alt=""
        draggable={false}
      />

      {/* Camada 3 — Dados dinâmicos */}
      <div className="tt-card-data">
        {/* Nome */}
        <div className="tt-card-name">{name}</div>

        {/* Descrição */}
        <div className="tt-card-description">{description}</div>

        {/* Atributos — label + valor empilhados */}
        {ATTR_META.map((attr) => {
          const valor = attributes[attr.key]
          if (valor === undefined || valor === null) return null
          return (
            <div
              key={attr.key}
              className={`tt-card-attr tt-card-attr--${attr.cssKey}`}
            >
              <span className="tt-card-attr-label">{labels[attr.labelId]}</span>
              <span className="tt-card-attr-value">{valor}</span>
            </div>
          )
        })}

        {/* Rank SDR — slot próprio (posicionado junto à descrição) */}
        {attributes.rank_sdr !== undefined && (
          <div className="tt-card-rank">
            <span className="tt-card-rank-label">{labels.rank}</span>
            <span className="tt-card-rank-value">#{attributes.rank_sdr}</span>
          </div>
        )}
      </div>
    </div>
  )
}
