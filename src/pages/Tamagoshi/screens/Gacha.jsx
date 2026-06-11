import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { CRIATURAS } from '../data/criaturas'
import { PERSONALIDADES, PERS_NOME_KEY } from '../data/personalidades'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { DIX_GACHA } from '../data/moedas'

// Apenas as 10 primeiras criaturas da CRIATURAS_BASE participam do sorteio T1
const CRIATURAS_T1_GACHA = CRIATURAS.slice(0, 10)

function sortearT1() {
  const disponiveis = CRIATURAS_T1_GACHA
  return disponiveis[Math.floor(Math.random() * disponiveis.length)]
}

const STORAGE_KEY = 'ldi_tama_gacha_free_used'

function isFreeSpinUsed() {
  try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
}

function marcarFreeSpinUsado() {
  try { localStorage.setItem(STORAGE_KEY, 'true') } catch {}
}

export default function Gacha({ onConcluir, onVoltar }) {
  const { t } = useLanguage()
  const store = useTamagoshiStore()

  const [temporada, setTemporada] = useState(1)
  const [sorteada, setSorteada] = useState(null)
  const [girando, setGirando] = useState(false)
  const [erro, setErro] = useState('')
  const [aceita, setAceita] = useState(false)

  const saldo = store._isAdmin ? Infinity : (store._dixSaldo || 0)
  const primeiroGiroGratis = !isFreeSpinUsed()
  const podePagar = store._isAdmin || primeiroGiroGratis || saldo >= DIX_GACHA
  const disponiveis = CRIATURAS_T1_GACHA

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

    const criatura = sortearT1()
    if (!criatura) {
      setErro(t('games.tamagoshi.gacha_sem_criaturas'))
      setGirando(false)
      return
    }

    // Primeiro giro é grátis; demais debitam DIX
    if (!store._isAdmin && !primeiroGiroGratis) {
      try {
        await store.gastarDix(store._userId, DIX_GACHA, `gacha temporada ${temporada}`)
      } catch (e) {
        setErro(e.message)
        setGirando(false)
        return
      }
    } else if (!store._isAdmin && primeiroGiroGratis) {
      marcarFreeSpinUsado()
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
        <p className="tama-gacha-sub">{t('games.tamagoshi.gacha_sub', { custo: primeiroGiroGratis ? 'GRÁTIS' : DIX_GACHA })}</p>

        {/* Seletor de temporada — T1 disponível, T2 EM BREVE */}
        <div className="tama-gacha-temporadas">
          <button
            className={`tama-gacha-temp-btn ${temporada === 1 ? 'tama-gacha-temp-btn--ativo' : ''}`}
            onClick={() => { setTemporada(1); setSorteada(null) }}
            disabled={girando}
          >
            {t('games.tamagoshi.gacha_temporada_1')}
            <span className="tama-gacha-temp-qtd">{CRIATURAS_T1_GACHA.length} {t('games.tamagoshi.gacha_criaturas')}</span>
          </button>
          <button
            className="tama-gacha-temp-btn tama-gacha-temp-btn--breve"
            disabled
          >
            {t('games.tamagoshi.gacha_temporada_2')}
            <span className="tama-gacha-temp-qtd">EM BREVE</span>
          </button>
        </div>

        {/* Saldo + badge de giro grátis */}
        <div className="tama-gacha-saldo">
          <span>{t('games.tamagoshi.dix_display', { saldo: store._isAdmin ? '∞' : saldo })}</span>
          {primeiroGiroGratis && <span className="tama-gacha-gratis-badge">🎁 1º GIRO GRÁTIS</span>}
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
              <span>{t('games.tamagoshi.gacha_girar', { custo: primeiroGiroGratis ? 'GRÁTIS' : DIX_GACHA })}</span>
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
