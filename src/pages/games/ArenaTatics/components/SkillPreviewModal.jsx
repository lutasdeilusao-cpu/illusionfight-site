import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getElem } from '../data/elementals'
import { EfeitoTag } from './JuiceComponents'
import { useLanguage } from '../../../../context/LanguageContext'

/**
 * Padrões de área para preview
 */
const PADROES = {
  linha_reta:   [[-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,0]],
  cone_3:       [[1,-1],[1,0],[1,1]],
  area_3x3:     [[-1,-1],[-1,0],[-1,1],[0,-1],[0,0],[0,1],[1,-1],[1,0],[1,1]],
  area_2x4:     [[-1,0],[-1,1],[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],
  diagonal:     [[1,1],[2,2],[3,3],[1,-1],[2,-2]],
  corpo_corpo:  [[1,0]],
  forma_L:      [[1,0],[2,0],[2,1],[2,2]],
  linha_v:      [[-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,0]],
  area_4x4:     [[-1,-1],[-1,0],[-1,1],[-1,2],[0,-1],[0,0],[0,1],[0,2],[1,-1],[1,0],[1,1],[1,2]],
}

function getPadrao(skill) {
  const rng = skill.alcance || 1
  if (skill.fx?.includes('area3')) return PADROES.area_3x3
  if (skill.fx?.includes('area2x4') || skill.fx?.includes('area_2x4')) return PADROES.area_2x4
  if (skill.fx?.includes('linha') || rng >= 5) return PADROES.linha_reta
  if (skill.fx?.includes('cone')) return PADROES.cone_3
  if (skill.fx?.includes('diag')) return PADROES.diagonal
  if (rng <= 1) return PADROES.corpo_corpo
  return PADROES.corpo_corpo
}

/**
 * MiniGridPreview — Preview 7x7 da área de efeito
 */
function MiniGridPreview({ skill, cor }) {
  const { t } = useLanguage()
  const padrao = getPadrao(skill)
  const SIZE = 7
  const CENTER = 3
  const padraoSet = new Set(padrao.map(([r, c]) => `${r + CENTER},${c + CENTER}`))

  return (
    <div className="tatics-mini-grid-wrap" style={{ borderColor: `${cor}20` }}>
      <span className="tatics-mini-grid-label">{t('tatics.area_efeito')}</span>
      <div className="tatics-mini-grid">
        {Array.from({ length: SIZE }, (_, row) =>
          Array.from({ length: SIZE }, (_, col) => {
            const key = `${row},${col}`
            const isCaster = row === CENTER && col === CENTER
            const isHit = padraoSet.has(key)
            return (
              <div
                key={key}
                className={`tatics-mini-cell ${isCaster ? 'mini-caster' : ''} ${isHit ? 'mini-hit' : ''}`}
                style={{
                  background: isCaster ? `${cor}60` : isHit ? `${cor}30` : 'rgba(255,255,255,0.03)',
                  borderColor: isCaster ? cor : isHit ? `${cor}60` : 'rgba(255,255,255,0.05)',
                  boxShadow: isHit ? `inset 0 0 4px ${cor}30` : 'none',
                }}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

/**
 * SkillPreviewModal — Modal de habilidades com preview visual
 */
export default function SkillPreviewModal({ personagem, skills, onUsar, onFechar }) {
  const { t } = useLanguage()
  const [skillHover, setSkillHover] = useState(null)
  const elem = getElem(personagem?.elemental)
  const spAtual = personagem?.energia || 0
  const spMax = personagem?.energiaMax || 1

  if (!personagem) return null

  return (
    <AnimatePresence>
      <motion.div
        className="tatics-skill-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onFechar}
      >
        <motion.div
          className="tatics-skill-sheet"
          style={{ '--elem-cor': elem.cor, '--elem-glow': elem.glow }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="skill-modal-header" style={{
            borderBottom: `1px solid ${elem.cor}40`,
          }}>
            <span className="skill-modal-nome" style={{ color: elem.cor }}>
              {personagem.nome?.toUpperCase()}
            </span>
            <span className="skill-modal-sp">
              {t('tatics.sp')}: {spAtual}/{spMax}
            </span>
          </div>

          {/* Mini grid preview */}
          {skillHover && (
            <MiniGridPreview skill={skillHover} cor={elem.cor} />
          )}

          {/* Lista de skills */}
          <div className="tatics-skill-list">
            {(skills || personagem.skills || []).map(skill => {
              const disponivel = spAtual >= (skill.custo || 0) && !skill.emRecarga
              return (
                <button
                  key={skill.id}
                  className={`tatics-skill-card ${disponivel ? 'skill-disponivel' : 'skill-indisponivel'}`}
                  style={disponivel ? {
                    '--elem-cor': elem.cor,
                    borderColor: `${elem.cor}30`,
                    background: `linear-gradient(135deg, ${elem.cor}08, transparent)`,
                  } : {}}
                  onMouseEnter={() => setSkillHover(skill)}
                  onMouseLeave={() => setSkillHover(null)}
                  onClick={disponivel ? () => onUsar(skill) : undefined}
                >
                  {/* Custo SP */}
                  <div className="tatics-skill-custo" style={{
                    borderColor: disponivel ? `${elem.cor}50` : '#333',
                    background: disponivel ? `${elem.cor}15` : '#1a1a1a',
                    color: disponivel ? elem.cor : '#555',
                  }}>
                    <span className="tatics-skill-custo-valor">{skill.custo || 0}</span>
                    <span className="tatics-skill-custo-label">{t('tatics.sp')}</span>
                  </div>

                  {/* Info */}
                  <div className="tatics-skill-info">
                    <div className="tatics-skill-nome" style={{ color: disponivel ? '#EAEAEA' : '#555' }}>
                      {skill.nome}
                    </div>
                    <div className="tatics-skill-desc">{skill.desc}</div>
                    {skill.fx && (
                      <div className="tatics-skill-tags">
                        <EfeitoTag efeito={skill.fx.replace(/[0-9]/g, '')} />
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="tatics-skill-meta">
                    {skill.dano > 0 && (
                      <span className="skill-meta-dmg">{skill.dano} {t('tatics.combat.dmg')}</span>
                    )}
                    <span className="skill-meta-rng">{t('tatics.combat.rng')} {skill.alcance || 1}</span>
                    {skill.cd > 0 && (
                      <span className="skill-meta-cd">{t('tatics.combat.cd')} {skill.cd}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
