import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CRIATURAS } from '../data/criaturas'
import { PERSONALIDADES, getFala } from '../data/personalidades'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import MetricBar from '../components/MetricBar'
import CriaturaSprite from '../components/CriaturaSprite'
import BalloonFala from '../components/BalloonFala'

export default function Criatura({ isAdmin }) {
  const store = useTamagoshiStore()
  const pers = PERSONALIDADES[store.personalidade] || PERSONALIDADES.CARENTE

  const [fala, setFala] = useState('')
  const [mostrando, setMostrando] = useState('')

  const metricasBaixas = useMemo(() => {
    const baixas = []
    if (store.fome < 30) baixas.push('fome')
    if (store.higiene < 30) baixas.push('sede')
    if (store.energia < 30) baixas.push('passeio')
    if (store.humor < 30) baixas.push('critico')
    return baixas
  }, [store.fome, store.higiene, store.energia, store.humor])

  useEffect(() => {
    if (store.status === 'critico') {
      setFala(getFala(store.personalidade, 'critico', store.criaturaId))
      setMostrando('critico')
    } else if (metricasBaixas.length > 1) {
      setFala(getFala(store.personalidade, 'critico', store.criaturaId))
      setMostrando('critico')
    } else if (metricasBaixas.length === 1) {
      setFala(getFala(store.personalidade, metricasBaixas[0], store.criaturaId))
      setMostrando(metricasBaixas[0])
    } else {
      setFala(getFala(store.personalidade, 'fome', store.criaturaId))
      setMostrando('fome')
    }
  }, [store.fome, store.higiene, store.energia, store.humor, store.status, store.personalidade])

  const handleAction = (action) => {
    if (action === 'alimentar') store.alimentar()
    else if (action === 'banhar') store.banhar()
    else if (action === 'passeio') store.setFase('passeio')
    else if (action === 'brincar') store.brincar()
    setFala(getFala(store.personalidade, action === 'passeio' ? 'passeio' : action === 'brincar' ? 'fome' : action, store.criaturaId))
    setMostrando(action)
  }

  const icones = { fome: '🍖', higiene: '🧼', energia: '⚡', humor: '🎭' }

  const [adminTrocaAberta, setAdminTrocaAberta] = useState(false)

  const handleAdminTrocar = (id) => {
    store.trocarCriatura(id)
    setAdminTrocaAberta(false)
  }

  return (
    <div className="tama-screen">
      <div className="tama-criatura">
        <div className="tama-criatura-header">
          <span className="tama-criatura-nome">{store.nomeCustom}</span>
          {store.status === 'critico' && <span className="tama-critico-badge">CRÍTICO</span>}
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
            onClick={() => handleAction('alimentar')}>
            [ alimentar ]
          </motion.button>
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => handleAction('banhar')}>
            [ banhar ]
          </motion.button>
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => handleAction('passeio')}>
            [ passear ]
          </motion.button>
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => handleAction('brincar')}>
            [ brincar ]
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
