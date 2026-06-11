import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { CRIATURAS } from '../data/criaturas'
import { PERSONALIDADES, PERS_NOME_KEY } from '../data/personalidades'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { DIX_GACHA } from '../data/moedas'

function sortearDaTemporada(temporada) {
  const disponiveis = CRIATURAS.filter(c => c.temporada === temporada)
  return disponiveis[Math.floor(Math.random() * disponiveis.length)]
}

export default function Gacha({ onConcluir, onVoltar }) {
  const { t } = useLanguage()
  const store = useTamagoshiStore()

  const [temporada, setTemporada] = useState(2)
  const [sorteada, setSorteada] = useState(null)
  const [girando, setGirando] = useState(false)
  const [erro, setErro] = useState('')
  const [aceita, setAceita] = useState(false)

  const saldo = store._isAdmin ? Infinity : (store._dixSaldo || 0)
  const podePagar = store._isAdmin || saldo >= DIX_GACHA
  const disponiveis = CRIATURAS.filter(c => c.temporada === temporada)

  const handleGirar = async () => {
    if (girando) return
    setErro('')
    setSorteada(null)
    setAceita(false)

    if (!store._isAdmin && saldo < DIX_GACHA) {
      setErro(t('games.tamagoshi.gacha_saldo_insuficiente'))
      return
    }

    setGirando(true)

    // Animação de rolagem (simula 1.5s de "girando")
    await new Promise(r => setTimeout(r, 1500))

    const criatura = sortearDaTemporada(temporada)
    if (!criatura) {
      setErro(t('games.tamagoshi.gacha_sem_criaturas'))
      setGirando(false)
      return
    }

    // Debita DIX
    if (!store._isAdmin) {
      try {
        await store.gastarDix(store._userId, DIX_GACHA, `gacha temporada ${temporada}`)
      } catch (e) {
        setErro(e.message)
        setGirando(false)
        return
      }
    }

    setSorteada(criatura)
    setGirando(false)
  }

  const handleAceitar = async () => {
    if (!sorteada) return
    await store.escolherCriatura(sorteada.id)
    setAceita(true)
    onConcluir()
  }

  const persSorteada = sorteada ? PERSONALIDADES[sorteada.tipo] : null

  return (
    <div className="tama-screen">
      <div className="tama-gacha">
        <h2 className="tama-gacha-title">{t('games.tamagoshi.gacha_titulo')}</h2>
        <p className="tama-gacha-sub">{t('games.tamagoshi.gacha_sub', { custo: DIX_GACHA })}</p>

        {/* Seletor de temporada */}
        <div className="tama-gacha-temporadas">
          {[1, 2].map(season => {
            const qtd = CRIATURAS.filter(c => c.temporada === season).length
            return (
              <button
                key={season}
                className={`tama-gacha-temp-btn ${temporada === season ? 'tama-gacha-temp-btn--ativo' : ''}`}
                onClick={() => { setTemporada(season); setSorteada(null) }}
                disabled={girando}
              >
                {season === 1 ? t('games.tamagoshi.gacha_temporada_1') : t('games.tamagoshi.gacha_temporada_2')}
                <span className="tama-gacha-temp-qtd">{qtd} {t('games.tamagoshi.gacha_criaturas')}</span>
              </button>
            )
          })}
        </div>

        {/* Saldo */}
        <div className="tama-gacha-saldo">
          <span>{t('games.tamagoshi.dix_display', { saldo: store._isAdmin ? '∞' : saldo })}</span>
        </div>

        {/* Erro */}
        {erro && <p className="tama-gacha-erro">{erro}</p>}

        {/* Botão girar */}
        {!sorteada && (
          <motion.button
            className="tama-btn gacha-btn-roll"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGirar}
            disabled={girando || !podePagar}
          >
            {girando ? (
              <span className="tama-gacha-girando">{t('games.tamagoshi.gacha_girando')} 🎰</span>
            ) : (
              <span>{t('games.tamagoshi.gacha_girar', { custo: DIX_GACHA })}</span>
            )}
          </motion.button>
        )}

        {/* Animação de rolagem */}
        <AnimatePresence>
          {girando && (
            <motion.div
              className="tama-gacha-rolagem"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="tama-gacha-rolagem-emoji">
                {['🎲', '✨', '🌟', '💫', '⭐'].map((e, i) => (
                  <motion.span
                    key={i}
                    className="tama-gacha-rolagem-item"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: [0, 1, 0], y: [-20, 0, 20] }}
                    transition={{ duration: 0.6, delay: i * 0.12, repeat: 2 }}
                  >
                    {e}
                  </motion.span>
                ))}
              </div>
              <p className="tama-gacha-rolagem-texto">{t('games.tamagoshi.gacha_embaralhando')}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultado */}
        <AnimatePresence>
          {sorteada && !aceita && (
            <motion.div
              className="tama-gacha-resultado"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="tama-gacha-resultado-emoji" style={{ borderColor: persSorteada?.cor || '#555' }}>
                {sorteada.imagem ? (
                  <img src={sorteada.imagem} alt={sorteada.nome} className="tama-gacha-resultado-img" draggable={false} />
                ) : (
                  <span style={{ fontSize: '3rem' }}>{sorteada.emoji}</span>
                )}
              </div>
              <h3 className="tama-gacha-resultado-nome">{sorteada.nome}</h3>
              <p className="tama-gacha-resultado-tipo" style={{ color: persSorteada?.cor || '#555' }}>
                {t('games.tamagoshi.personalidade_' + PERS_NOME_KEY[sorteada.tipo])}
              </p>
              <p className="tama-gacha-resultado-raridade">
                {t('games.tamagoshi.raridade_' + sorteada.raridade)}
              </p>
              <div className="tama-gacha-resultado-botoes">
                <motion.button
                  className="tama-btn gacha-btn-aceitar"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAceitar}
                >
                  {t('games.tamagoshi.gacha_aceitar')}
                </motion.button>
                <motion.button
                  className="tama-btn gacha-btn-recusar"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSorteada(null)}
                >
                  {t('games.tamagoshi.gacha_recusar')}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão voltar */}
        {!sorteada && !girando && (
          <motion.button
            className="tama-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onVoltar}
            style={{ marginTop: '1rem' }}
          >
            {t('games.tamagoshi.voltar')}
          </motion.button>
        )}
      </div>
    </div>
  )
}
