import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { CRIATURAS } from '../data/criaturas'
import { PERSONALIDADES, getFala } from '../data/personalidades'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { sfx } from '../sfx'
import MetricBar from '../components/MetricBar'
import CriaturaSprite from '../components/CriaturaSprite'
import BalloonFala from '../components/BalloonFala'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { useNavigate } from 'react-router-dom'

export default function Criatura({ isAdmin, onAction, onLoja, onVoltar, subFase }) {
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  const store = useTamagoshiStore()
  const pers = PERSONALIDADES[store.personalidade] || PERSONALIDADES.CARENTE

  const [fala, setFala] = useState('')
  const [mostrando, setMostrando] = useState('')

  const metricasBaixas = useMemo(() => {
    const baixas = []
    if (store.fome < 60) baixas.push({ key: 'fome', valor: store.fome })
    if (store.higiene < 60) baixas.push({ key: 'sede', valor: store.higiene })
    if (store.energia < 60) baixas.push({ key: 'passeio', valor: store.energia })
    if (store.saude < 60) baixas.push({ key: 'saude', valor: store.saude })
    if (store.humor < 60) baixas.push({ key: 'critico', valor: store.humor })
    return baixas.sort((a, b) => a.valor - b.valor)
  }, [store.fome, store.higiene, store.energia, store.humor, store.saude])

  useEffect(() => {
    sfx.notificacao()
    if (store.status === 'critico') {
      setFala(getFala(store.personalidade, 'critico', store.criaturaId, t, locale))
      setMostrando('critico')
    } else if (metricasBaixas.length) {
      const { key } = metricasBaixas[0]
      setFala(getFala(store.personalidade, key, store.criaturaId, t, locale))
      setMostrando(key)
    } else {
      setFala(getFala(store.personalidade, 'boasVindas', store.criaturaId, t, locale))
      setMostrando('boasVindas')
    }
  }, [store.fome, store.higiene, store.energia, store.humor, store.status, store.personalidade])

  const icones = { fome: '🍖', higiene: '🧼', energia: '⚡', humor: '🎭' }

  const [adminTrocaAberta, setAdminTrocaAberta] = useState(false)
  const [trocaAberta, setTrocaAberta] = useState(false)

  const slots = useTamagoshiStore(s => s.slots)
  const slotAtivo = useTamagoshiStore(s => s.slotAtivo)

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
          {store.status === 'critico' && <span className="tama-critico-badge">{t('games.tamagoshi.critico')}</span>}
        </div>

        <div className="tama-criatura-dix-display" onClick={onLoja}>
          {t('games.tamagoshi.dix_display', { saldo: dixSaldo })} <span className="tama-criatura-loja-link">{t('games.tamagoshi.loja_link')}</span>
        </div>

        <BalloonFala texto={fala} tipo={store.personalidade} />

        <CriaturaSprite
          criaturaId={store.criaturaId}
          status={store.status}
          estagio={store.estagio}
          criaturas={CRIATURAS}
        />

        <div className="tama-metricas">
          <MetricBar label={t('games.tamagoshi.fome')} valor={store.fome} cor="#F5A623" icone="🍖" />
          <MetricBar label={t('games.tamagoshi.higiene')} valor={store.higiene} cor="#00B4D8" icone="🧼" />
          <MetricBar label={t('games.tamagoshi.energia')} valor={store.energia} cor="#22C55E" icone="⚡" />
          <MetricBar label={t('games.tamagoshi.humor')} valor={store.humor} cor="#EC4899" icone="🎭" />
          <MetricBar label={t('games.tamagoshi.saude')} valor={store.saude} cor="#FF4444" icone="❤️" />
        </div>

        {slots.length > 1 && (
          <div className="tama-criatura-trocar-container">
            <motion.button
              className="tama-btn tama-btn--sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTrocaAberta(true)}
            >
              🔄 {t('games.tamagoshi.trocar_tama')}
            </motion.button>
          </div>
        )}

        <AnimatePresence>
          {trocaAberta && (
            <motion.div
              className="tama-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrocaAberta(false)}
            >
              <motion.div
                className="tama-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <h3>{t('games.tamagoshi.selecionar_slot')}</h3>
                <div className="tama-slots-list">
                  {slots.map(s => {
                    const isAtivo = s.slot === slotAtivo
                    const criatura = CRIATURAS.find(c => c.id === s.criatura_id)
                    return (
                      <button
                        key={s.slot}
                        className={`tama-slot-card ${isAtivo ? 'tama-slot-card--ativo' : ''}`}
                        disabled={isAtivo}
                        onClick={() => {
                          store.alternarSlot(s.slot)
                          setTrocaAberta(false)
                        }}
                      >
                        <span className="tama-slot-emoji">{criatura?.emoji || '🐉'}</span>
                        <span className="tama-slot-nome">{criatura?.nome || t('games.tamagoshi.criatura_desconhecida')}</span>
                        <span className="tama-slot-status">
                          {isAtivo ? '✅' : s.hibernando ? '💤' : '✅'}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <button className="tama-btn" onClick={() => setTrocaAberta(false)}>
                  {t('games.tamagoshi.fechar')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="tama-acoes">
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { sfx.clique(); onAction('alimentar') }}>
            {t('games.tamagoshi.alimentar')}
          </motion.button>
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { sfx.clique(); onAction('banhar') }}>
            {t('games.tamagoshi.banhar')}
          </motion.button>
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { sfx.clique(); onAction('passear') }}>
            {t('games.tamagoshi.passear')}
          </motion.button>
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { sfx.clique(); onAction('brincar') }}>
            {t('games.tamagoshi.brincar')}
          </motion.button>
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { sfx.clique(); onAction('saude') }}>
            {t('games.tamagoshi.saude_btn')}
          </motion.button>
          <motion.button className="tama-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { sfx.clique(); onLoja() }}>
            {t('games.tamagoshi.loja')}
          </motion.button>
        </div>

        {isAdmin && (
          <div className="tama-admin">
            <div className="tama-admin-header">
              <span className="tama-admin-label">{t('games.tamagoshi.admin')}</span>
              <button className={`tama-btn tama-btn--sm ${store.adminFastMode ? 'tama-btn--active' : ''}`}
                onClick={() => store.toggleAdminFastMode()}>
                {store.adminFastMode ? t('games.tamagoshi.fast_on') : t('games.tamagoshi.fast_off')}
              </button>
              <button className="tama-btn tama-btn--sm"
                onClick={() => setAdminTrocaAberta(!adminTrocaAberta)}>
                {t('games.tamagoshi.trocar')}
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
