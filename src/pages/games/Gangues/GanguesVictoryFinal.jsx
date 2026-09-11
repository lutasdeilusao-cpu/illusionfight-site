import { motion } from 'framer-motion'

// Confronto final contra o Alan — canon: Marélia não fica com você.
// Extraído de GanguesVictory.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §2).
export default function GanguesVictoryFinal({ t, gangName, podeRecrutar, recrutar, onNavigate }) {
  const suaGangue = gangName || t('games.gangues.report.your_gang')
  const paragrafos = (t('games.gangues.story.final.paragrafos') || []).map(par =>
    String(par).replace(/\{gangue\}/g, suaGangue))
  return (
    <main className="gang-report gang-report--final">
      <motion.div className="gang-final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <span className="gang-report-code">{t('games.gangues.story.final.code')}</span>
        <h1 className="gang-final-titulo">{t('games.gangues.story.final.titulo')}</h1>
        {paragrafos.map((par, i) => (
          <motion.p
            key={i}
            className="gang-final-par"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.6 }}
          >
            {par}
          </motion.p>
        ))}
        <motion.button
          className="gang-report-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + paragrafos.length * 0.6 }}
          onClick={() => onNavigate('story')}
        >
          {t('games.gangues.story.voltar_mapa')}
        </motion.button>
        {podeRecrutar && <button className="gang-report-secondary" onClick={recrutar}>{t('games.gangues.report.recrutar')}</button>}
      </motion.div>
    </main>
  )
}
