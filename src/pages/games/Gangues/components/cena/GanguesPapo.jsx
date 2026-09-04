import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { sfx } from '../../../../../lib/sfx'

/* Encontro PAPO — conversa com um local da quebrada. 2–3 escolhas com
   consequência: revela POI, custa grana, ou parte pra treta. Usa a
   linguagem visual do GangDialog (rosto + voz de rua). */
export default function GanguesPapo({ poi, onResolve, onClose }) {
  const { t } = useLanguage()
  const grana = useGanguesStore(s => s.grana)
  const [resultado, setResultado] = useState(null)

  const base = poi.i18n
  const nome = t(`${base}.nome`)
  const sub = t(`${base}.sub`)
  const falas = useMemo(() => {
    const raw = t(`${base}.fala`)
    return Array.isArray(raw) ? raw : [raw]
  }, [t, base])

  const escolher = (escolha) => {
    if (escolha.custoGrana && grana < escolha.custoGrana) { sfx.cancel(); return }
    sfx.select()
    if (escolha.viraTreta) { onResolve({ viraTreta: escolha.viraTreta, revela: escolha.revela }); return }
    const texto = t(`${base}.escolhas.${escolha.id}.resultado`)
    const temTexto = texto && texto !== `${base}.escolhas.${escolha.id}.resultado`
    if (temTexto) {
      setResultado({ texto, escolha })
    } else {
      onResolve({ ok: true, revela: escolha.revela, recompensa: escolha.recompensa, custoGrana: escolha.custoGrana })
    }
  }

  return (
    <div className="gang-cena-enc gang-cena-enc--papo">
      <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
      <span className="gang-cena-papo-face" aria-hidden="true">{(nome || '?')[0]}</span>
      <span className="gang-cena-papo-nome">{nome}{sub ? <em> · {sub}</em> : null}</span>

      {resultado ? (
        <>
          <p className="gang-cena-papo-fala">{resultado.texto}</p>
          <button
            className="gang-cena-btn gang-cena-btn--go"
            onClick={() => onResolve({ ok: true, revela: resultado.escolha.revela, recompensa: resultado.escolha.recompensa, custoGrana: resultado.escolha.custoGrana })}
          >
            {t('games.gangues.cena.fechar')}
          </button>
        </>
      ) : (
        <>
          {falas.map((linha, i) => (
            <motion.p
              key={i}
              className="gang-cena-papo-fala"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 * i }}
            >
              {linha}
            </motion.p>
          ))}
          <div className="gang-cena-papo-escolhas">
            {(poi.escolhas || []).map((escolha) => {
              const semGrana = escolha.custoGrana && grana < escolha.custoGrana
              return (
                <button
                  key={escolha.id}
                  className={`gang-cena-btn ${escolha.viraTreta ? 'gang-cena-btn--treta' : ''}`}
                  onClick={() => escolher(escolha)}
                  disabled={semGrana}
                >
                  {t(`${base}.escolhas.${escolha.id}.label`)}
                  {escolha.custoGrana ? <em className="gang-cena-btn-custo"> −{escolha.custoGrana}</em> : null}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
