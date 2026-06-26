import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { getNo, getEvolucaoAtiva } from '../data/classTree'

/**
 * EvolutionScreen — Tela de evolução de classe
 *
 * Exibida automaticamente ao atingir nível 40 ou 70.
 * Para personagens do roster: evolução automática sem escolha.
 * Mostra animação + nova classe + frase de lore + preview das skills.
 */
export default function EvolutionScreen({ rosterEntry, nivel, onConfirm }) {
  const { t } = useLanguage()
  const [step, setStep] = useState('intro') // intro → preview → confirmado
  const [showDetails, setShowDetails] = useState(false)

  const evoPath = rosterEntry?.caminhoEvolutivo
  const isNv40 = nivel >= 40 && nivel < 70
  const isNv70 = nivel >= 70

  const evolucao = evoPath ? getEvolucaoAtiva(rosterEntry.classe, nivel, evoPath) : null

  // Se não tem evolução para esse nível, confirma automaticamente
  useEffect(() => {
    if (!evolucao) {
      onConfirm?.()
    }
  }, [])

  if (!evolucao || !evoPath) return null

  const nomeAntigo = rosterEntry.nome
  const nomeNovo = evolucao.nome
  const fraseLore = evolucao.fraseLore || ''

  const handleConfirm = () => {
    setStep('confirmado')
    setTimeout(() => {
      onConfirm?.()
    }, 1500)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000 100%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Courier New, monospace',
    }}>
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center' }}
          >
            {/* Efeito de luz */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(255,215,0,0.3)',
                  '0 0 60px rgba(255,215,0,0.6)',
                  '0 0 20px rgba(255,215,0,0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: 120, height: 120, borderRadius: '50%',
                background: 'radial-gradient(circle, #FFD70033, #000)',
                border: '2px solid #FFD700',
                margin: '0 auto 2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem',
              }}
            >
              {rosterEntry.classe === 'karuak' ? '🛡️'
                : rosterEntry.classe === 'moraki' ? '🌪️'
                : rosterEntry.classe === 'tivara' ? '🏹'
                : rosterEntry.classe === 'zephyra' ? '🌊'
                : rosterEntry.classe === 'ignis' ? '🔥'
                : '🗡️'}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div style={{ color: '#FFD700', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 8 }}>
                {isNv70 ? 'EVOLUÇÃO FINAL' : 'EVOLUÇÃO'}
              </div>
              <div style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: 4 }}>
                {nomeAntigo}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}
              >
                → {nomeNovo}
              </motion.div>

              {fraseLore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  style={{
                    color: '#888', fontSize: '0.75rem', fontStyle: 'italic',
                    maxWidth: 320, margin: '0 auto 1.5rem', lineHeight: 1.4,
                  }}
                >
                  "{fraseLore}"
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0 }}
              >
                <button
                  onClick={() => setShowDetails(true)}
                  style={{
                    background: 'transparent', border: '1px solid #FFD70044',
                    color: '#FFD700', padding: '8px 24px', borderRadius: 8,
                    cursor: 'pointer', fontFamily: 'Courier New', fontSize: '0.7rem',
                    letterSpacing: '0.1em', marginBottom: 12,
                  }}
                >
                  VER DETALHES
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {step === 'intro' && showDetails && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute', bottom: '15%',
              background: '#0d0d0d', border: '1px solid #222',
              borderRadius: 16, padding: '1rem 1.5rem',
              maxWidth: 360, width: '90%',
            }}
          >
            <div style={{ color: '#FFD700', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: 8, textAlign: 'center' }}>
              NOVAS HABILIDADES
            </div>

            {evolucao.passiva && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: '#4ECDC4', fontSize: '0.6rem', marginBottom: 2 }}>PASSIVA</div>
                <div style={{ color: '#eee', fontSize: '0.7rem', fontWeight: 700 }}>{evolucao.passiva.nome}</div>
                <div style={{ color: '#888', fontSize: '0.6rem' }}>{evolucao.passiva.desc}</div>
              </div>
            )}

            {evolucao.skills_novas?.length > 0 && (
              <div>
                <div style={{ color: '#4ECDC4', fontSize: '0.6rem', marginBottom: 4 }}>SKILLS</div>
                {evolucao.skills_novas.map((skill, i) => (
                  <div key={i} style={{
                    background: '#1a1a1a', borderRadius: 8, padding: '6px 10px',
                    marginBottom: 4,
                  }}>
                    <div style={{ color: '#eee', fontSize: '0.65rem', fontWeight: 700 }}>
                      {skill.nome} <span style={{ color: '#888', fontWeight: 400 }}>(custo {skill.custo})</span>
                    </div>
                    <div style={{ color: '#888', fontSize: '0.6rem' }}>{skill.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {evolucao.bonusAtributos && (
              <div style={{ marginTop: 8 }}>
                <div style={{ color: '#FFD700', fontSize: '0.6rem', marginBottom: 4 }}>BÔNUS DE ATRIBUTOS</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {Object.entries(evolucao.bonusAtributos).map(([k, v]) => (
                    <span key={k} style={{
                      background: '#2a2a1a', color: '#FFD700', fontSize: '0.55rem',
                      padding: '2px 8px', borderRadius: 4,
                    }}>
                      {k.toUpperCase()} +{v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {evolucao.bonusHp ? (
              <div style={{ marginTop: 6, color: '#4CAF50', fontSize: '0.6rem' }}>
                HP +{Math.round(evolucao.bonusHp * 100)}%
                {evolucao.bonusSp ? ` | SP +${Math.round(evolucao.bonusSp * 100)}%` : ''}
              </div>
            ) : null}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ textAlign: 'center', marginTop: 12 }}
            >
              <button
                onClick={handleConfirm}
                style={{
                  background: 'linear-gradient(135deg, #FFD70022, #FF8C0022)',
                  border: '1px solid #FFD700',
                  color: '#FFD700', padding: '10px 32px', borderRadius: 8,
                  cursor: 'pointer', fontFamily: 'Courier New', fontSize: '0.75rem',
                  fontWeight: 700, letterSpacing: '0.15em',
                }}
              >
                CONFIRMAR
              </button>
            </motion.div>
          </motion.div>
        )}

        {step === 'confirmado' && (
          <motion.div
            key="confirmado"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '3px solid #FFD700',
                borderTopColor: 'transparent',
                margin: '0 auto 1.5rem',
              }}
            />
            <div style={{ color: '#4ECDC4', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.15em' }}>
              EVOLUÇÃO CONCLUÍDA
            </div>
            <div style={{ color: '#888', fontSize: '0.7rem', marginTop: 8 }}>
              {nomeNovo}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
