/* ══════════════════════════════════════════════════════════════
   INTERIOR DE CÔMODO — o mesmo mundo walkable, só que dentro de um
   prédio (birosca, oficina, mercearia, galpão do chefe). Desenho puro
   a partir de `amb.cenario`. A colisão vem de `com.colliders` (paredes +
   móveis), montada em GanguesCena.
   ══════════════════════════════════════════════════════════════ */

export default function CenaInterior({ amb }) {
  const W = amb.world || { w: 440, h: 320 }
  const galpao = (amb.cenario || []).some(c => c.tipo === 'chao-galpao')
  return (
    <>
      <div className={`gang-int-chao ${galpao ? 'is-galpao' : ''}`} style={{ width: W.w, height: W.h }} aria-hidden="true" />
      <div className="gang-int-parede" style={{ width: W.w }} aria-hidden="true" />
      {(amb.cenario || []).map((c, i) => {
        if (c.tipo === 'chao-galpao' || c.tipo === 'chao-interno') return null
        const st = { left: c.x, top: c.y }
        if (c.w) st.width = c.w
        if (c.h) st.height = c.h
        return <i key={i} className={`gang-int-obj gang-int-obj--${c.tipo}`} style={st} aria-hidden="true" />
      })}
    </>
  )
}
