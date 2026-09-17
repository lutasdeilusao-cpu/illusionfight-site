import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { getGanguesCorpo, getGanguesCorpoPoses, GANGUES_CORPO_POSES } from '../data/ganguesPortraits.js'
import GanguesRetratoImg from './GanguesRetratoImg'

/** Corpo inteiro do personagem com ciclo de pose por toque — pedido do
 *  Isaias (17/09/2026): "primeiro contato do usuário com os personagens"
 *  (lobby de escolha inicial + recrutamento) merecia mostrar o corpo todo,
 *  não só a cabeça. Um toque na imagem avança frente → costas → lado →
 *  frente (sempre nessa ordem, sempre voltando pro início no 4º toque).
 *  `onCiclar` é opcional — GanguesCreate.jsx usa pra tocar um som de UI.
 *  Sem nenhuma pose disponível pra esse slug, renderiza `fallback` (o
 *  chamador decide: cabeça, inicial do nome, o de sempre). */
export default function GanguesRetratoCorpo({ slug, className, imgClassName, fallback = null, onCiclar }) {
  const { t } = useLanguage()
  const [poseIndex, setPoseIndex] = useState(0)
  const poses = getGanguesCorpoPoses(slug)
  if (!poses) return fallback

  const pose = GANGUES_CORPO_POSES[poseIndex]
  const src = getGanguesCorpo(slug, pose)

  const ciclar = event => {
    event.stopPropagation()
    setPoseIndex(index => (index + 1) % GANGUES_CORPO_POSES.length)
    onCiclar?.()
  }

  return (
    <button type="button" className={className} onClick={ciclar} aria-label={t('games.gangues.recruitment.pose_trocar')}>
      <GanguesRetratoImg className={imgClassName} src={src} alt="" fallback={fallback} />
      <span className="gang-corpo-poses" aria-hidden="true">
        {GANGUES_CORPO_POSES.map((p, index) => <i key={p} className={index === poseIndex ? 'is-active' : ''} />)}
      </span>
    </button>
  )
}
