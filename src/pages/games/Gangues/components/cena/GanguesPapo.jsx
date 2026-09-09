import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { sfx } from '../../../../../lib/sfx'
import { getGanguesItem } from '../../data/ganguesItens.js'
import { getGanguesEquip } from '../../data/ganguesEquip.js'

/* Encontro PAPO — conversa com um local da quebrada. 2–3 escolhas com
   consequência: revela POI, custa grana, ou parte pra treta. Usa a
   linguagem visual do GangDialog (rosto + voz de rua). */
export default function GanguesPapo({ poi, onResolve, onClose }) {
  const { t } = useLanguage()
  const grana = useGanguesStore(s => s.grana)
  const inventario = useGanguesStore(s => s.inventario)
  const temItens = (mapa) => Object.entries(mapa || {}).every(([id, q]) => (inventario[id] || 0) >= q)
  const [resultado, setResultado] = useState(null)

  const base = poi.i18n
  const nome = t(`${base}.nome`)
  const sub = t(`${base}.sub`)
  const falas = useMemo(() => {
    const raw = t(`${base}.fala`)
    return Array.isArray(raw) ? raw : [raw]
  }, [t, base])

  const passa = (escolha) => {
    if (escolha.viraTreta) { onResolve({ viraTreta: escolha.viraTreta, revela: escolha.revela }); return }
    onResolve({ ok: true, revela: escolha.revela, recompensa: escolha.recompensa, custoGrana: escolha.custoGrana, informante: escolha.informante, precisaItens: escolha.precisaItens, daEquip: escolha.daEquip })
  }

  const escolher = (escolha) => {
    if (escolha.custoGrana && grana < escolha.custoGrana) { sfx.cancel(); return }
    if (escolha.precisaItens && !temItens(escolha.precisaItens)) { sfx.cancel(); return }
    sfx.select()
    // Mesmo pras escolhas que viram treta (ex: apertar o pivete do sinal),
    // se tiver um `.resultado` no i18n, mostra a linha ANTES de partir pro
    // combate — antes ia direto, sem fala nenhuma.
    const raw = t(`${base}.escolhas.${escolha.id}.resultado`)
    const temTexto = raw && raw !== `${base}.escolhas.${escolha.id}.resultado`
    if (temTexto) {
      setResultado({ texto: Array.isArray(raw) ? raw[Math.floor(Math.random() * raw.length)] : raw, escolha })
      return
    }
    passa(escolha)
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
            onClick={() => passa(resultado.escolha)}
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
              const semItens = escolha.precisaItens && !temItens(escolha.precisaItens)
              const custoItens = escolha.precisaItens
                ? Object.entries(escolha.precisaItens).map(([id, q]) => `${getGanguesItem(id)?.icone || '▪'}×${q}`).join(' ')
                : null
              const ganhaEquip = (escolha.daEquip || []).map(id => getGanguesEquip(id)?.icone).filter(Boolean).join(' ')
              return (
                <button
                  key={escolha.id}
                  className={`gang-cena-btn ${escolha.viraTreta ? 'gang-cena-btn--treta' : ''}`}
                  onClick={() => escolher(escolha)}
                  disabled={semGrana || semItens}
                >
                  {t(`${base}.escolhas.${escolha.id}.label`)}
                  {escolha.custoGrana ? <em className="gang-cena-btn-custo"> −{escolha.custoGrana}</em> : null}
                  {custoItens ? <em className="gang-cena-btn-custo"> {custoItens}</em> : null}
                  {ganhaEquip ? <em className="gang-cena-btn-custo"> → {ganhaEquip}</em> : null}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
