import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../../context/LanguageContext'
import { sfx } from '../../../../../lib/sfx'
import './GanguesMiniMapa.css'

/* MINI-MAPA da cena (só na rua). Setinhas apontando pra onde ir — cada
   objetivo pendente vira uma seta no aro do radar, na direção real dele a
   partir do jogador. Some/aparece: recolhido é só uma bolinha no canto, um
   toque abre, o "–" fecha de volta pra bolinha. A escolha fica salva.

   Props:
   - player: { x, y }  posição atual no mundo
   - alvos: [{ id, nome, pos:{x,y} }]  objetivos pendentes (já sem os feitos) */

const KEY = 'ldi-gangues-minimapa-aberto'
const RAIO = 44 // px — onde os marcadores ficam no aro do radar

export default function GanguesMiniMapa({ player, alvos = [] }) {
  const { t } = useLanguage()
  const [aberto, setAberto] = useState(() => {
    try { return localStorage.getItem(KEY) !== '0' } catch { return true }
  })

  const alternar = (v) => {
    setAberto(v)
    sfx.select?.()
    try { localStorage.setItem(KEY, v ? '1' : '0') } catch { /* private mode */ }
  }

  const marcadores = useMemo(() => alvos
    .filter(a => a?.pos)
    .map(a => {
      const dx = a.pos.x - player.x
      const dy = a.pos.y - player.y
      return { ...a, ang: Math.atan2(dy, dx), passos: Math.max(1, Math.round(Math.hypot(dx, dy) / 20)) }
    })
    .sort((a, b) => a.passos - b.passos), [alvos, player])

  const proximo = marcadores[0]

  if (!aberto) {
    return (
      <button
        className="gang-minimapa-bolinha"
        onClick={() => alternar(true)}
        aria-label={t('games.gangues.cena.minimapa.abrir')}
      >
        <span aria-hidden="true">🧭</span>
        {marcadores.length > 0 && <i className="gang-minimapa-bolinha-num">{marcadores.length}</i>}
      </button>
    )
  }

  return (
    <motion.div
      className="gang-minimapa"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.16 }}
    >
      <button
        className="gang-minimapa-x"
        onClick={() => alternar(false)}
        aria-label={t('games.gangues.cena.minimapa.fechar')}
      >–</button>
      <span className="gang-minimapa-eyebrow">{t('games.gangues.cena.minimapa.titulo')}</span>

      <div className="gang-minimapa-radar">
        <i className="gang-minimapa-eu" aria-hidden="true" />
        {marcadores.map((m, i) => (
          <i
            key={m.id}
            className={`gang-minimapa-seta${i === 0 ? ' is-proximo' : ''}`}
            style={{
              '--mx': `${Math.cos(m.ang) * RAIO}px`,
              '--my': `${Math.sin(m.ang) * RAIO}px`,
              '--ang': `${m.ang}rad`,
            }}
          />
        ))}
      </div>

      <p className="gang-minimapa-legenda">
        {proximo
          ? `${proximo.nome} · ${t('games.gangues.cena.minimapa.passos', { n: proximo.passos })}`
          : t('games.gangues.cena.minimapa.limpo')}
      </p>
    </motion.div>
  )
}
