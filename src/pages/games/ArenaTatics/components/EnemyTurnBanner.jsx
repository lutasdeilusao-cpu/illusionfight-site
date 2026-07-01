import { useState, useEffect } from 'react'
import { getElem } from '../data/elementals'
import { useLanguage } from '../../../../context/LanguageContext'

/**
 * EnemyTurnBanner — Banner épico quando inimigo age
 */
export default function EnemyTurnBanner({ acao, onFechar }) {
  const { t } = useLanguage()
  if (!acao) return null
  const elem = getElem(acao.atacante?.elemental)

  useEffect(() => {
    const t = setTimeout(onFechar, 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="enemy-turn-banner" style={{
      '--elem-cor': elem.cor,
      '--elem-glow': elem.glow,
    }}>
      <div className="enemy-turn-banner-inner">
        <div className="enemy-turn-banner-skill" style={{ color: elem.cor }}>
          {acao.skill?.nome?.toUpperCase() || t('tatics.combat.ataque')}
        </div>
        <div className="enemy-turn-banner-names">
          {acao.atacante?.nome}
          <span style={{ color: elem.cor }}> ▶ </span>
          {acao.alvo?.nome}
        </div>
        {acao.resultado?.dano > 0 && (
          <div className="enemy-turn-banner-dano">-{acao.resultado.dano}</div>
        )}
      </div>
    </div>
  )
}
