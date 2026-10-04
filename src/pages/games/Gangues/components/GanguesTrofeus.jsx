import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useGanguesStore } from '../store/useGanguesStore'
import { estadoDosTrofeus, trofeusNovos, textoTrofeu } from '../data/ganguesTrofeus.js'
import { getGanguesItem } from '../data/ganguesItens.js'
import { sfx } from '../../../../lib/sfx'

const estadoDoStore = s => estadoDosTrofeus({ storyProgress: s.storyProgress, roster: s.roster, grana: s.grana, rep: s.rep, campaignClears: s.campaignClears, inventario: s.inventario, equipamentos: s.equipamentos })

/* Vigia dos troféus: confere a cada mudança do save, marca o que foi cumprido
   em storyProgress.__trofeus, entrega a recompensa e mostra o aviso na tela
   (um por vez). Montado uma vez no GanguesRoute. */
export default function GanguesTrofeus() {
  const { t } = useLanguage()
  const [fila, setFila] = useState([])
  const timer = useRef(null)

  useEffect(() => {
    const conferir = () => {
      const s = useGanguesStore.getState()
      if (!s.gangName) return
      const novos = trofeusNovos(estadoDoStore(s))
      if (!novos.length) return
      useGanguesStore.setState(state => ({ storyProgress: { ...state.storyProgress, __trofeus: [...(state.storyProgress.__trofeus || []), ...novos.map(tr => tr.id)] } }))
      for (const tr of novos) {
        if (tr.recompensa.grana) s.ganharGrana(tr.recompensa.grana)
        for (const [id, qtd] of Object.entries(tr.recompensa.itens || {})) s.darItem(Number(id), qtd)
      }
      useGanguesStore.getState()._persistStory()
      // Muitos de uma vez (save antigo): um aviso só, com o total.
      setFila(f => [...f, ...(novos.length > 3 ? [{ resumo: true, id: `resumo-${Date.now()}`, icone: '🏆', n: novos.length, grana: novos.reduce((x, tr) => x + (tr.recompensa.grana || 0), 0) }] : novos)])
    }
    const unsub = useGanguesStore.subscribe(() => {
      clearTimeout(timer.current)
      timer.current = setTimeout(conferir, 600)
    })
    conferir()
    return () => { unsub(); clearTimeout(timer.current) }
  }, [])

  const atual = fila[0]
  useEffect(() => {
    if (!atual) return
    sfx.reward?.()
    const id = setTimeout(() => setFila(f => f.slice(1)), 3800)
    return () => clearTimeout(id)
  }, [atual])

  return createPortal((
    <AnimatePresence>
      {atual && (() => {
        const { nome } = atual.resumo ? { nome: t('games.gangues.trofeus.resumo', { n: atual.n }) } : textoTrofeu(t, atual)
        const recompensa = atual.resumo ? { grana: atual.grana } : atual.recompensa
        const itens = Object.entries(recompensa.itens || {}).map(([id, qtd]) => `${getGanguesItem(id)?.icone || ''}×${qtd}`)
        return (
          <motion.button key={atual.id} type="button" className="gang-trofeu-toast" onClick={() => setFila(f => f.slice(1))}
            initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}>
            <span className="gang-trofeu-toast__icone">{atual.icone}</span>
            <span className="gang-trofeu-toast__info">
              <small>{t('games.gangues.trofeus.desbloqueou')}</small>
              <strong>{nome}</strong>
              <em>{[recompensa.grana ? `💵 +${recompensa.grana}` : '', ...itens].filter(Boolean).join('  ')}</em>
            </span>
          </motion.button>
        )
      })()}
    </AnimatePresence>
  ), document.body)
}
