import { useState } from 'react'
import { PV_MAX, CUSTO_RECUPERAR, PRECO_POCAO, CURA_POCAO } from '../batalha/bolso'

// PV, grana e poções sempre à vista no pé da tela; tocar abre o ponto de
// recuperação (recuperar tudo pagando, usar e comprar poção).
export default function Bolso({ t, bolso, onMudar }) {
  const [aberto, setAberto] = useState(false)
  const { pv, grana, pocoes } = bolso
  const cheio = pv >= PV_MAX
  return (
    <>
      <button type="button" className="ld-bolso" onClick={() => setAberto(true)}>
        <span className="ld-bolso__pv"><i style={{ '--v': pv / PV_MAX }} /></span>
        <b>❤ {pv}</b><b>💰 {grana}</b><b>🧪 {pocoes}</b>
      </button>
      {aberto && (
        <div className="ld-bolso-overlay" onClick={() => setAberto(false)}>
          <div className="ld-bolso-painel if-panel" onClick={e => e.stopPropagation()}>
            <p className="if-eyebrow">{t('games.ldi.bolso.titulo')}</p>
            <p className="ld-bolso-painel__linha">❤ {pv}/{PV_MAX} · 💰 {grana} · 🧪 {pocoes}</p>
            <button type="button" className="if-btn" disabled={cheio || grana < CUSTO_RECUPERAR}
              onClick={() => onMudar({ pv: PV_MAX, grana: grana - CUSTO_RECUPERAR })}>
              {t('games.ldi.bolso.recuperar', { n: CUSTO_RECUPERAR })}
            </button>
            <button type="button" className="if-btn" disabled={cheio || pocoes < 1}
              onClick={() => onMudar({ pv: Math.min(PV_MAX, pv + CURA_POCAO), pocoes: pocoes - 1 })}>
              {t('games.ldi.bolso.usar', { n: CURA_POCAO })}
            </button>
            <button type="button" className="if-btn" disabled={grana < PRECO_POCAO}
              onClick={() => onMudar({ grana: grana - PRECO_POCAO, pocoes: pocoes + 1 })}>
              {t('games.ldi.bolso.comprar', { n: PRECO_POCAO })}
            </button>
            <button type="button" className="ld-reler" onClick={() => setAberto(false)}>{t('games.ldi.bolso.fechar')}</button>
          </div>
        </div>
      )}
    </>
  )
}
