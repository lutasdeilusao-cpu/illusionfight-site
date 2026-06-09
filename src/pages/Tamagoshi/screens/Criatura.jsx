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
  const { t } = useLanguage()
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
          {store.status === 'critico' && <span className="tama-critico-badge">{t('games.tamagoshi.critico')}</span>}
        </div>

        <div className="tama-dix-display" onClick={onLoja} style={{ cursor: 'pointer', fontSize: '0.75rem', color: '#F5A623', marginBottom: '0.3rem' }}>
          {t('games.tamagoshi.dix_display', { saldo: dixSaldo })} <span style={{ color: '#666', fontSize: '0.6rem' }}>{t('games.tamagoshi.loja_link')}</span>
        </div>

        <BalloonFala texto={fala} cor={pers.cor} />

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

        <BackToGamesBtn onClick={() => navigate('/games')} label={t('games.tamagoshi.voltar_extras')} />
      </div>
    </div>
  )
}
