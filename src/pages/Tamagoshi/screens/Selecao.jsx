import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { CRIATURAS } from '../data/criaturas'
import { PERSONALIDADES } from '../data/personalidades'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Selecao({ onEscolher, userTier }) {
  const { t } = useLanguage()
  const opcoes = useMemo(() => {
    const qtd = userTier === 'primordial' ? 10 : userTier === 'elite' ? 3 : 1
    const umaPorTipo = []
    const tipos = Object.keys(PERSONALIDADES)
    for (const tipo of tipos) {
      const disponiveis = CRIATURAS.filter(c => c.tipo === tipo)
      umaPorTipo.push(shuffle(disponiveis)[0])
    }
    return shuffle(umaPorTipo).slice(0, qtd)
  }, [userTier])

  return (
    <div className="tama-screen">
      <div className="tama-selecao">
        <h2 className="tama-selecao-title">{t('games.tamagoshi.selecao_titulo')}</h2>
        <p className="tama-selecao-sub">{t('games.tamagoshi.selecao_sub')}</p>
        <div className="tama-selecao-grid">
          {opcoes.map((c, i) => {
            const pers = PERSONALIDADES[c.tipo]
            return (
              <motion.button
                key={c.id}
                className="tama-selecao-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEscolher(c.id)}
                style={{ borderColor: pers.cor }}
              >
                <div className="tama-selecao-emoji">{c.emoji}</div>
                <div className="tama-selecao-nome">{c.nome}</div>
                <div className="tama-selecao-tipo" style={{ color: pers.cor }}>{pers.nome}</div>
                <div className="tama-selecao-raridade">{c.raridade}</div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
