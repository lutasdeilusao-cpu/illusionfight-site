import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useEventos } from '../../../../context/EventosContext'
import { CRIATURAS } from '../data/criaturas'
import { PERSONALIDADES, PERS_NOME_KEY } from '../data/personalidades'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import SEASON_1 from '../data/tamagoshi-season1.json'

// Temporada ativa para seleÃ§Ã£o gratuita (usa JSON dedicado da Temporada 1)
const CRIATURAS_T1 = CRIATURAS.filter(c => SEASON_1.criaturas.includes(c.id))

// Limite de slots por tier (T1: todos max 1; desbloqueado na T2)
const SLOT_LIMITS = { free: 1, elite: 1, primordial: 1 }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Selecao({ onEscolher, userTier, onGacha }) {
  const { t } = useLanguage()
  const { registrarEvento } = useEventos()
  const slots = useTamagoshiStore(s => s.slots)
  const limite = SLOT_LIMITS[userTier] || 1
  const atingiuLimite = slots.length >= limite

  const opcoes = useMemo(() => {
    if (atingiuLimite) return []
    const qtd = userTier === 'primordial' ? 10 : userTier === 'elite' ? 3 : 1
    // Embaralha todas as 10 criaturas T1 e pega qtd aleatÃ³rias
    // Isso garante que free users recebam 1 das 10 (nÃ£o sempre Kroniki)
    const todasEmbaralhadas = shuffle(CRIATURAS_T1)
    return todasEmbaralhadas.slice(0, qtd)
  }, [userTier])

  const tRaridade = (r) => t('games.tamagoshi.raridade_' + r)

  return (
    <div className="tama-screen">
      <div className="tama-selecao">
        <h2 className="tama-selecao-title">{t('games.tamagoshi.selecao_titulo')}</h2>
        <p className="tama-selecao-sub">{t('games.tamagoshi.selecao_sub')}</p>
        {atingiuLimite ? (
          <div className="tama-selecao-limite">
            <p>{t('games.tamagoshi.slots_limite_atingido', { limite })}</p>
          </div>
        ) : (
        <div className="tama-selecao-grid">
          {opcoes.map((c, i) => {
            const pers = PERSONALIDADES[c.tipo]
            return (
              <motion.button
                key={c.id}
                className="tama-selecao-card"
                data-tipo={c.tipo}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { registrarEvento('tama_criado', 'Criou um Tamagoshi', 1); onEscolher(c.id) }}
              >
                <div className="tama-selecao-emoji">
                  {c.imagem ? (
                    <img src={c.imagem} alt={c.nome} className="tama-selecao-img" draggable={false} />
                  ) : (
                    c.emoji
                  )}
                </div>
                <div className="tama-selecao-nome">{c.nome}</div>
                <div className="tama-selecao-tipo" data-tipo={c.tipo}>{t('games.tamagoshi.personalidade_' + PERS_NOME_KEY[c.tipo])}</div>
                <div className="tama-selecao-raridade">{tRaridade(c.raridade)}</div>
              </motion.button>
            )
          })}
        </div>
        )} {/* fim do ternary atingiuLimite */}

        {/* Gacha â€” acesso ao sorteio T1 */}
        <div className="tama-selecao-gacha">
          <motion.button
            className="tama-btn gacha-btn-entry"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGacha}
          >
            ðŸŽ° {t('games.tamagoshi.gacha_entrar')}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
