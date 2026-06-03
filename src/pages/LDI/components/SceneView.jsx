import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Typewriter from './Typewriter'
import ChoiceList from './ChoiceList'

export default function SceneView({ scene, choices, onChoice }) {
  const [showChoices, setShowChoices] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  if (!scene) return null

  const handleComplete = () => setShowChoices(true)
  const handleSkip = () => setShowChoices(true)

  const handleChoiceClick = async (choice) => {
    console.log('[LDI] onChoice chamado, choice:', choice.id, choice.label)
    setSelectedId(choice.id)
    setTransitioning(true)
    setTimeout(() => {
      onChoice(choice)
    }, 300)
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scene.id}
        className="ldi-scene"
        initial={{ clipPath: 'inset(0 50% 0 50%)' }}
        animate={{ clipPath: 'inset(0 0% 0 0%)' }}
        exit={{ clipPath: 'inset(0 50% 0 50%)' }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {scene.image && (
          <div className="ldi-scene-image">
            <img src={scene.image} alt={scene.title} loading="lazy" onError={(e) => { e.target.style.display = 'none' }} />
          </div>
        )}

        <div className="ldi-scene-header">
          <h2 className="ldi-scene-title">{scene.title}</h2>
        </div>

        <div className="ldi-scene-text">
          <Typewriter
            paragraphs={scene.text}
            speed={30}
            pauseBetween={300}
            onComplete={handleComplete}
            onSkip={handleSkip}
          />
        </div>

        <AnimatePresence>
          {showChoices && (
            <motion.div
              className="ldi-scene-choices"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ChoiceList
                choices={choices}
                onChoice={handleChoiceClick}
                transitioning={transitioning}
                selectedId={selectedId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
