/* ══════════════════════════════════════════════════════════════
   INTERIOR DE CÔMODO — o mesmo mundo walkable, só que dentro de um
   prédio (birosca, oficina, mercearia, galpão do chefe). Com `amb.fundo`
   o cômodo é uma ilustração em pixel art; sem ela, desenho em CSS a
   partir de `amb.cenario`. A colisão vem de `com.colliders` (paredes +
   móveis), montada em GanguesCena.
   ══════════════════════════════════════════════════════════════ */

import { useState } from 'react'

export default function CenaInterior({ amb }) {
  const W = amb.world || { w: 440, h: 320 }
  const [fundoFalhou, setFundoFalhou] = useState(null)
  if (amb.fundo && fundoFalhou !== amb.fundo) {
    return (
      <img
        className="gang-int-fundo" src={amb.fundo} alt="" aria-hidden="true" draggable="false"
        style={{ width: W.w, height: W.h }} onError={() => setFundoFalhou(amb.fundo)}
      />
    )
  }
  const piso = (amb.cenario || []).find(c => c.tipo === 'chao-galpao') ? 'is-galpao'
    : (amb.cenario || []).find(c => c.tipo === 'chao-tunel') ? 'is-tunel' : ''
  return (
    <>
      <div className={`gang-int-chao ${piso}`} style={{ width: W.w, height: W.h }} aria-hidden="true" />
      <div className="gang-int-parede" style={{ width: W.w }} aria-hidden="true" />
      {(amb.cenario || []).map((c, i) => {
        if (c.tipo === 'chao-galpao' || c.tipo === 'chao-interno' || c.tipo === 'chao-tunel') return null
        const st = { left: c.x, top: c.y }
        if (c.w) st.width = c.w
        if (c.h) st.height = c.h
        if (c.lona) st['--lona'] = c.lona // cor da lona da barraca (labirinto do Mercadão)
        return <i key={i} className={`gang-int-obj gang-int-obj--${c.tipo}`} style={st} aria-hidden="true" />
      })}
    </>
  )
}
