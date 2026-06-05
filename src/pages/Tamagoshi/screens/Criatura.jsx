import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CRIATURAS } from '../data/criaturas'
import { PERSONALIDADES, getFala } from '../data/personalidades'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import MetricBar from '../components/MetricBar'
import CriaturaSprite from '../components/CriaturaSprite'
import BalloonFala from '../components/BalloonFala'

export default function Criatura({ isAdmin, onAction, onLoja }) {
  const store = useTamagoshiStore()
  const pers = PERSONALIDADES[store.personalidade] || PERSONALIDADES.CARENTE

  const [fala, setFala] = useState('')
  const [mostrando, setMostrando] = useState('')

  const metricasBaixas = useMemo(() => {
    const baixas = []
    if (store.fome < 60) baixas.push({ key: 'fome', valor: store.fome })
    if (store.higiene < 60) baixas.push({ key: 'sede', valor: store.higiene })
    if (store.energia < 60) baixas.push({ key: 'passeio', valor: store.energia })
    if (store.humor < 60) baixas.push({ key: 'critico', valor: store.humor })
    return baixas.sort((a, b) => a.valor - b.valor)
  }, [store.fome, store.higiene, store.energia, store.humor])

  useEffect(() => {
    if (store.status === 'critico') {
      setFala(getFala(store.personalidade, 'critico', store.criaturaId))
      setMostrando('critico')
    } else if (metricasBaixas.length) {
      const { key } = metricasBaixas[0]
      setFala(getFala(store.personalidade, key, store.criaturaId))
      setMostrando(key)
    } else {
      setFala(getFala(store.personalidade, 'boasVindas', store.criaturaId))
      setMostrando('boasVindas')
    }
  }, [store.fome, store.higiene, store.energia, store.humor, store.status, store.personalidade])

  const icones = { fome: '🍖', higiene: '🧼', energia: '⚡', humor: '🎭' }

  const [adminTrocaAberta, setAdminTrocaAberta] = useState(false)

  const handleAdminTrocar = (id) => {
    store.trocarCriatura(id)
    setAdminTrocaAberta(false)
  }

  const dixSaldo = store._isAdmin ? '∞' : store._dixSaldo

  return (
    <div className="tama-screen">
      <div className="tama-criatura">
        <div className="tama-criatura-header">
          <span className="tama-criatura-nome">{store.nomeCustom}</span>
          {store.status === 'critico' && <span className="tama-critico-badge">CRÍTICO</span>}
        </div>

        <div className="tama-dix-display" onClick={onLoja} style={{ cursor: 'pointer', fontSize: '0.75rem', color: '#F5A623', marginBottom: '0.3rem' }}>
          🪙 {dixSaldo} DIX <span style={{ color: '#666', fontSize: '0.6rem' }}>[loja]</span>
        </div>

        <BalloonFala texto={fala} cor={pers.cor} />

        <CriaturaSprite
          criaturaId={store.criaturaId}
          status={store.status}
          estagio={store.estagio}
          criaturas={CRIATURAS}
        />

        <div className="tama-metricas">
          <MetricBar label="Fome" valor={store.fome} cor="#F5A623" icone="🍖" />
          <MetricBar label="Higiene" valor={store.higiene} cor="#00B4D8" icone="🧼" />
          <MetricBar label="Energia" valor={store.energia} cor="#22C55E" icone="⚡" />
          <MetricBar label="Humor" valor={store.humor} cor="#EC4899" icone="🎭" />
        </div>

        <div className="tama-acoes">
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onAction('alimentar')}>
            [ alimentar ]
          </motion.button>
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onAction('banhar')}>
            [ banhar ]
          </motion.button>
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onAction('passear')}>
            [ passear ]
          </motion.button>
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onAction('brincar')}>
            [ brincar ]
          </motion.button>
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onLoja}>
            [ loja ]
          </motion.button>
        </div>

        {isAdmin && (
          <div className="tama-admin">
            <div className="tama-admin-header">
              <span className="tama-admin-label">⚙ admin</span>
              <button className={`tama-btn tama-btn--sm ${store.adminFastMode ? 'tama-btn--active' : ''}`}
                onClick={() => store.toggleAdminFastMode()}>
                {store.adminFastMode ? '⏩ fast: on' : '▶ fast: off'}
              </button>
              <button className="tama-btn tama-btn--sm"
                onClick={() => setAdminTrocaAberta(!adminTrocaAberta)}>
                [ trocar ]
              </button>
            </div>
            <AnimatePresence>
              {adminTrocaAberta && (
                <motion.div className="tama-admin-grid"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}>
                  {CRIATURAS.map(c => (
                    <button key={c.id} className="tama-btn tama-btn--tiny"
                      onClick={() => handleAdminTrocar(c.id)}>
                      {c.emoji} {c.nome}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
