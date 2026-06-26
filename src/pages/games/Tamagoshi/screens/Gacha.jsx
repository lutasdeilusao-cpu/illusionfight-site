import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { CRIATURAS } from '../data/criaturas'
import { PERSONALIDADES, PERS_NOME_KEY } from '../data/personalidades'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { DIX_GACHA } from '../data/moedas'
import SEASON_1 from '../data/tamagoshi-season1.json'

// Apenas as criaturas listadas no JSON da Temporada 1 participam do sorteio T1
const CRIATURAS_T1_GACHA = CRIATURAS.filter(c => SEASON_1.criaturas.includes(c.id))

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

  const TRADUZIR_ERRO_GACHA = {
    'usuario nao autenticado': 'erro_nao_autenticado',
    'DIX insuficiente': 'erro_dix_insuficiente',
    'erro ao gastar DIX': 'erro_gastar_dix',
  }

  const saldo = store._isAdmin ? Infinity : (store._dixSaldo || 0)
  const primeiroGiroGratis = !isFreeSpinUsed()
  const podePagar = store._isAdmin || primeiroGiroGratis || saldo >= DIX_GACHA
  const disponiveis = CRIATURAS_T1_GACHA

  const handleGirar = async () => {
    if (girando) return
    setErro('')
    setSorteada(null)
    setAceita(false)

    if (!store._isAdmin && !primeiroGiroGratis && saldo < DIX_GACHA) {
      setErro(t('games.tamagoshi.gacha_saldo_insuficiente'))
      return
    }

    setGirando(true)

    // AnimaÃ§Ã£o de rolagem (simula 1.5s de "girando")
    await new Promise(r => setTimeout(r, 1500))

    const criatura = sortearT1()
    if (!criatura) {
      setErro(t('games.tamagoshi.gacha_sem_criaturas'))
      setGirando(false)
      return
    }

    // Primeiro giro Ã© grÃ¡tis; demais debitam DIX
    if (!store._isAdmin && !primeiroGiroGratis) {
      try {
        await store.gastarDix(store._userId, DIX_GACHA, `gacha temporada ${temporada}`)
      } catch (e) {
        setErro(t('games.tamagoshi.' + (TRADUZIR_ERRO_GACHA[e.message] || 'erro_desconhecido')))
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
        <p className="tama-gacha-sub">{t('games.tamagoshi.gacha_sub', { custo: primeiroGiroGratis ? t('games.tamagoshi.gacha_gratis') : DIX_GACHA })}</p>

        {/* Seletor de temporada â€” T1 disponÃ­vel, T2 EM BREVE */}
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
            <span className="tama-gacha-temp-qtd">{t('games.tamagoshi.em_breve')}</span>
          </button>
        </div>

        {/* Saldo + badge de giro grÃ¡tis */}
        <div className="tama-gacha-saldo">
          <span>{t('games.tamagoshi.dix_display', { saldo: store._isAdmin ? 'âˆž' : saldo })}</span>
          {primeiroGiroGratis && <span className="tama-gacha-gratis-badge">ðŸŽ {t('games.tamagoshi.gacha_giro_gratis')}</span>}
        </div>

        {/* Erro */}
        {erro && <p className="tama-gacha-erro">{erro}</p>}

        {/* BotÃ£o girar */}
        {!sorteada && (
          <motion.button
            className="tama-btn gacha-btn-roll"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGirar}
            disabled={girando || !podePagar}
          >
            {girando ? (
              <span className="tama-gacha-girando">{t('games.tamagoshi.gacha_girando')} ðŸŽ°</span>
            ) : (
              <span>{t('games.tamagoshi.gacha_girar', { custo: primeiroGiroGratis ? t('games.tamagoshi.gacha_gratis') : DIX_GACHA })}</span>
            )}
          </motion.button>
        )}

        {/* AnimaÃ§Ã£o de rolagem */}
        <AnimatePresence>
          {girando && (
            <motion.div
              className="tama-gacha-rolagem"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="tama-gacha-rolagem-emoji">
                {['ðŸŽ²', 'âœ¨', 'ðŸŒŸ', 'ðŸ’«', 'â­'].map((e, i) => (
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
              <div className="tama-gacha-resultado-emoji" data-tipo={sorteada.tipo}>
                {sorteada.imagem ? (
                  <img src={sorteada.imagem} alt={sorteada.nome} className="tama-gacha-resultado-img" draggable={false} />
                ) : (
                  <span className="tama-gacha-emoji-grande">{sorteada.emoji}</span>
                )}
              </div>
              <h3 className="tama-gacha-resultado-nome">{sorteada.nome}</h3>
              <p className="tama-gacha-resultado-tipo" data-tipo={sorteada.tipo}>
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

        {/* BotÃ£o voltar */}
        {!sorteada && !girando && (
          <motion.button
            className="tama-btn tama-gacha-voltar"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onVoltar}
          >
            {t('games.tamagoshi.voltar')}
          </motion.button>
        )}
      </div>
    </div>
  )
}
