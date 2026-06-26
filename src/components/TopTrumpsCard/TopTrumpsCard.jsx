import React, { Fragment } from 'react'
import { CARD_LABELS, ATTR_META } from '../../i18n/cardLabels'
import tmpl0 from '../../assets/images/cards/TemplateBaseReutilizavel.png'
import tmpl1 from '../../assets/images/cards/TemplateBaseReutilizavel-01.png'
import tmpl2 from '../../assets/images/cards/TemplateBaseReutilizavel-02.png'
import tmpl3 from '../../assets/images/cards/TemplateBaseReutilizavel-03.png'
import tmpl4 from '../../assets/images/cards/TemplateBaseReutilizavel-04.png'
import tmpl5 from '../../assets/images/cards/TemplateBaseReutilizavel-05.png'
import mysteryBg from '../../assets/images/cards/CardInterrogation.png'
import './TopTrumpsCard.css'

const TEMPLATES = [tmpl0, tmpl1, tmpl2, tmpl3, tmpl4, tmpl5]

/**
 * TopTrumpsCard — Template reutilizável de carta do Super Trunfo LDI.
 *
 * Props:
 *   characterImage    — URL da imagem de fundo do personagem (bg)
 *   name              — Nome do personagem
 *   description       — Descrição curta (vai na área inferior esquerda)
 *   locale            — 'pt' | 'en' | 'es'
 *   attributes        — { rank_sdr, poder_mental, velocidade, resistencia, nivel_xama, fator_caos, energia_base, poder_explosivo }
 *   faceDown          — Se true, mostra o verso escuro da carta
 *   mystery           — Se true, mostra o template com CardInterrogation bg e ??? nos dados
 *   onAttributeClick  — (attrKey) => void — chamado ao clicar num atributo
 *   disabled          — Desabilita clique nos atributos
 */
export default function TopTrumpsCard({
  characterImage,
  name = '',
  description = '',
  locale = 'pt',
  attributes = {},
  faceDown = false,
  mystery = false,
  onAttributeClick,
  disabled = false,
  templateIndex = 0,
  mini = false,
}) {
  const labels = CARD_LABELS[locale] || CARD_LABELS.pt

  if (faceDown) {
    return (
      <div className="tt-card-wrapper">
        <div className="tt-card-template">
          <div className="tt-card-verso">
            <span className="tt-card-verso-icon">?</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`tt-card-wrapper${mini ? ' tt-card--mini' : ''}${faceDown ? ' tt-card--facedown' : ''}`}>
      <div className="tt-card-template">
        {/* Camada 1 — Background do personagem (img tag, no inline style) */}
        <img className="tt-card-character-bg-img"
          src={mystery ? mysteryBg : characterImage}
          alt="" draggable={false} />

        {/* Camada 2 — Template PNG (moldura com cor variável) */}
      <img
        className="tt-card-template-img"
        src={TEMPLATES[templateIndex % TEMPLATES.length]}
        alt=""
        draggable={false}
      />

      {/* Camada 3 — Dados dinâmicos */}
      <div className="tt-card-data">
        {/* Nome — ??? no modo mistério */}
        <div className="tt-card-name">{mystery ? '???' : name}</div>

        {/* Descrição — ??? no modo mistério */}
        <div className="tt-card-description">
          {mystery
            ? Array.from({ length: 4 }, () => '???').join(' ')
            : description}
        </div>

        {/* Atributos — label (title) e valor (atr) separados para posicionamento independente */}
        {ATTR_META.map((attr) => {
          const valor = mystery ? '???' : attributes[attr.key]
          if (!mystery && (valor === undefined || valor === null)) return null
          const clicavel = !!onAttributeClick && !mystery
          const titleClasses = [
            'tt-card-attr-label',
            `tt-card-attr--${attr.cssKey}-title`,
            clicavel && 'tt-card-attr-clickable',
            (disabled || mystery) && 'tt-card-attr--disabled',
          ].filter(Boolean).join(' ')
          const atrClasses = [
            'tt-card-attr-value',
            `tt-card-attr--${attr.cssKey}-atr`,
            clicavel && 'tt-card-attr-clickable',
            (disabled || mystery) && 'tt-card-attr--disabled',
          ].filter(Boolean).join(' ')
          return (
            <React.Fragment key={attr.key}>
              <div
                className={titleClasses}
                onClick={clicavel && !disabled ? () => onAttributeClick(attr.key) : undefined}
                role={clicavel ? 'button' : undefined}
                tabIndex={clicavel && !disabled ? 0 : undefined}
                onKeyDown={clicavel && !disabled ? (e) => { if (e.key === 'Enter' || e.key === ' ') onAttributeClick(attr.key) } : undefined}
              >
                {labels[attr.labelId]}
              </div>
              <div
                className={atrClasses}
                onClick={clicavel && !disabled ? () => onAttributeClick(attr.key) : undefined}
                role={clicavel ? 'button' : undefined}
                tabIndex={clicavel && !disabled ? 0 : undefined}
                onKeyDown={clicavel && !disabled ? (e) => { if (e.key === 'Enter' || e.key === ' ') onAttributeClick(attr.key) } : undefined}
              >
                {valor}
              </div>
            </React.Fragment>
          )
        })}

        {/* Rank SDR */}
        {!mystery && attributes.rank_sdr !== undefined && (
          <div className="tt-card-rank">
            <span className="tt-card-rank-label">{labels.rank}</span>
            <span className="tt-card-rank-value">#{attributes.rank_sdr}</span>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
