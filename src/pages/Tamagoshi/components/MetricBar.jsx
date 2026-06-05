import { motion } from 'framer-motion'

export default function MetricBar({ label, valor, cor, icone }) {
  const pct = Math.max(0, Math.min(100, valor || 0))
  const bgCor = pct > 60 ? cor : pct > 30 ? '#F5A623' : '#E02020'

  return (
    <div className="tama-mb">
      <div className="tama-mb-label">
        <span>{icone}</span>
        <span>{label}</span>
        <span className="tama-mb-valor">{pct}%</span>
      </div>
      <div className="tama-mb-track">
        <motion.div
          className="tama-mb-fill"
          style={{ background: bgCor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  )
}
