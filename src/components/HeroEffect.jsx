import { useRef } from 'react'
import { useHeroEffect } from '../hooks/useHeroEffect'
import './HeroEffect.css'

export default function HeroEffect() {
  const canvasRef = useRef(null)
  useHeroEffect(canvasRef)

  return <canvas ref={canvasRef} className="hero-effect" />
}
