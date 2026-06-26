import { motion } from 'framer-motion'
import { getCorPorElemental } from '../data/cosmeticos'

export default function SkillModal({ personagem, skills, onSelect, onClose }) {
  const corElem = personagem.elemental ? getCorPorElemental(personagem.elemental) : '#00B4D8'
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="tatics-skill-overlay"
    >
      <div className="tatics-skill-sheet">
        <div className="tatics-skill-handle" />

        <div className="tatics-skill-header">
          <div className="tatics-skill-header-info">
            <span className="tatics-skill-header-nome">{personagem.nome}</span>
            <span className="tatics-skill-header-mp">
              ⚡ {personagem.energia}/{personagem.energiaMax} MP
            </span>
          </div>
          <button className="tatics-skill-close" onClick={onClose}>✕</button>
        </div>

        <div className="tatics-skill-list">
          {skills.map(skill => {
            const podeUsar = personagem.energia >= skill.custo
            return (
              <motion.button
                key={skill.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => podeUsar && onSelect(skill)}
                disabled={!podeUsar}
                className={`tatics-skill-card ${podeUsar ? 'skill-disponivel' : 'skill-indisponivel'}`}
              >
                <div className={`tatics-skill-custo ${podeUsar ? 'custo-disponivel' : 'custo-indisponivel'}`}>
                  <span className="tatics-skill-custo-valor">{skill.custo}</span>
                  <span className="tatics-skill-custo-label">MP</span>
                </div>
                <div className="tatics-skill-info">
                  <div className="tatics-skill-nome">{skill.nome}</div>
                  <div className="tatics-skill-desc">{skill.desc}</div>
                </div>
                <div className="tatics-skill-meta">
                  <span>{skill.alcance}⤴</span>
                  <span>{skill.dano}x</span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
