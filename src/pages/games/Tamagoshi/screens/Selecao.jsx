import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useEventos } from '../../../../context/EventosContext'
import { CRIATURAS } from '../data/criaturas'
import { PERSONALIDADES, PERS_NOME_KEY } from '../data/personalidades'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import SEASON_1 from '../data/tamagoshi-season1.json'

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

export function gerarOpcoesSelecaoTama(userTier) {
  const qtd = userTier === 'primordial' ? 10 : userTier === 'elite' ? 3 : 1
  return shuffle(CRIATURAS_T1).slice(0, qtd)
}

export default function Selecao({ onEscolher, userTier, onGacha, opcoes }) {
  const { t } = useLanguage()
  const { registrarEvento } = useEventos()
  const slots = useTamagoshiStore(s => s.slots)
  const limite = SLOT_LIMITS[userTier] || 1
  const atingiuLimite = slots.length >= limite
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
            {opcoes.map((c, i) => (
              <motion.button
                key={c.id}
                className="tama-selecao-card"
                data-tipo={c.tipo}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  registrarEvento('tama_criado', 'Criou um Tamagoshi', 1)
                  onEscolher(c.id)
                }}
              >
                <div className="tama-selecao-emoji">
                  {c.imagem ? (
                    <img src={c.gifs?.apresentacao || c.imagem} alt={c.nome} className="tama-selecao-img" draggable={false} />
                  ) : (
                    c.emoji
                  )}
                </div>
                <div className="tama-selecao-nome">{c.nome}</div>
                <div className="tama-selecao-tipo" data-tipo={c.tipo}>
                  {t('games.tamagoshi.personalidade_' + PERS_NOME_KEY[c.tipo])}
                </div>
                <div className="tama-selecao-raridade">{tRaridade(c.raridade)}</div>
              </motion.button>
            ))}
          </div>
        )}

        {/* O sorteio pago oferece uma nova opção; voltar preserva estas ofertas. */}
        {!atingiuLimite && <div className="tama-selecao-gacha">
          <motion.button
            className="tama-btn gacha-btn-entry"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGacha}
          >
            🎰 {t('games.tamagoshi.gacha_entrar')}
          </motion.button>
        </div>}
      </div>
    </div>
  )
}
