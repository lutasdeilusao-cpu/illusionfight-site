import { useState, useEffect } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { getGanguesCorpo, getGanguesCorpoPoses, GANGUES_CORPO_POSES } from '../data/ganguesPortraits.js'
import GanguesRetratoImg from './GanguesRetratoImg'

/** Corpo inteiro do personagem em modo apresentação — pedido do Isaias
 *  (17/09/2026): "primeiro contato do usuário com os personagens" (lobby
 *  de escolha inicial + recrutamento) merecia mostrar o corpo todo, não só
 *  a cabeça. Troca de pose SOZINHA a cada 2,5s (frente → lado → costas →
 *  frente...) — o ciclo só por toque (v3.21.0) não era descoberto pelo
 *  jogador ("não é muito intuitivo que você vai apertar pra ver outras
 *  imagens"), então a apresentação automática é a via principal agora.
 *
 *  BUG separado (Isaias reportou, mesmo dia, com print do menu oficial
 *  travado): a v3.21.0 fazia a imagem INTEIRA ser o botão de ciclo — no
 *  card do carrossel (`GanguesCreate.jsx`) isso "roubava" o toque que
 *  antes abria a ficha (o card inteiro era clicável pra isso desde
 *  sempre), então tocar no personagem só girava a pose e não dava mais
 *  pra selecionar ninguém. Fix: a imagem agora é só visual (`<div>`, não
 *  `<button>`) — o toque nela atravessa pro elemento pai (reabre o
 *  comportamento de sempre: tocar o card abre a ficha). Só o botão
 *  pequeno `⟳` no canto cicla a pose manualmente (reinicia a contagem de
 *  2,5s, pra não trocar de novo rápido demais em seguida), sem competir
 *  com mais nada. `onCiclar` é opcional — GanguesCreate.jsx usa pra tocar
 *  um som de UI. Sem nenhuma pose disponível pra esse slug, renderiza
 *  `fallback` (o chamador decide: cabeça, inicial do nome, o de sempre). */
export default function GanguesRetratoCorpo({ slug, className, imgClassName, fallback = null, onCiclar }) {
  const { t } = useLanguage()
  const [poseIndex, setPoseIndex] = useState(0)
  const poses = getGanguesCorpoPoses(slug)

  useEffect(() => {
    if (!poses) return
    const id = setInterval(() => setPoseIndex(index => (index + 1) % GANGUES_CORPO_POSES.length), 2500)
    return () => clearInterval(id)
  }, [poses, poseIndex])

  if (!poses) return fallback

  const pose = GANGUES_CORPO_POSES[poseIndex]
  const src = getGanguesCorpo(slug, pose)

  const ciclar = event => {
    event.stopPropagation()
    setPoseIndex(index => (index + 1) % GANGUES_CORPO_POSES.length)
    onCiclar?.()
  }

  return (
    <div className={className}>
      <GanguesRetratoImg className={imgClassName} src={src} alt="" fallback={fallback} />
      <button type="button" className="gang-corpo-cycle" onClick={ciclar} aria-label={t('games.gangues.recruitment.pose_trocar')}>⟳</button>
      <span className="gang-corpo-poses" aria-hidden="true">
        {GANGUES_CORPO_POSES.map((p, index) => <i key={p} className={index === poseIndex ? 'is-active' : ''} />)}
      </span>
    </div>
  )
}
