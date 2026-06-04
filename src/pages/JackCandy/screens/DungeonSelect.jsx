import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { DUNGEONS } from '../data/dungeons'

export default function DungeonSelect() {
  const store = useJackStore()
  const flags = store.flags || {}
  const dc = store.dungeonsCompletas || []

  const todas = Object.values(DUNGEONS)

  // Filtro progressivo: só mostra dungeons desbloqueadas
  const dungeons = todas.filter(d => {
    // Sempre disponível se tutorial
    if (d.tutorial) return flags.TEM_BENGALA
    // Requer dungeon anterior completada
    if (d.requerDungeon && !dc.includes(d.requerDungeon)) return false
    // Requer flag específica
    if (d.requerFlag && !flags[d.requerFlag]) return false
    // Dungeons noturnas precisam de NOITE
    if (d.noturna && store.periodo !== 'NOITE') return false
    // Dungeons de Auranis/Karnazar: check flags das cidades
    if (d.id === 'porto_velho' || d.id === 'doca_abandonada' || d.id === 'torre_kronos') {
      if (!flags.AURANIS_LIBERADO) return false
    }
    if (d.id === 'rua_branca' || d.id === 'porto_seco' || d.id === 'ilha_privada') {
      if (!flags.KARNAZAR_LIBERADO) return false
    }
    // Rua requer onibus
    if (d.id === 'rua' && !dc.includes('onibus')) return false
    // Ônibus noturno requer onibus completo
    if (d.id === 'onibus_noturno' && !flags.NOTAS_LIBERADO) return false
    // Risca a Faca Interior requer flag
    if (d.id === 'risca_faca_interior' && !flags.RISCA_FACA_LIBERADO) return false
    // Anexo: disponível desde o início
    if (d.id === 'anexo') return flags.TEM_BENGALA
    // Onibus: disponível desde o início
    if (d.id === 'onibus') return flags.TEM_BENGALA
    // Outros: visível por padrão se TEM_BENGALA
    return flags.TEM_BENGALA
  })

  if (dungeons.length === 0) {
    return (
      <motion.div className="jdc-vila" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="jdc-vila-title">DUNGEONS</div>
        <p className="jack-text jack-text--dim" style={{ textAlign: 'center' }}>
          nenhuma dungeon disponível. explore a vila primeiro.
        </p>
        <button className="jack-btn" onClick={() => store.setFase('vila')} style={{ marginTop: '1rem' }}>[ voltar ]</button>
      </motion.div>
    )
  }

  return (
    <motion.div className="jdc-vila" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="jdc-vila-title">DUNGEONS</div>
      <p className="jack-text jack-text--dim" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        entre onde a noite é mais escura
      </p>

      <div className="jdc-vila-grid">
        {dungeons.map(d => {
          const completa = dc.includes(d.id)

          return (
            <motion.button
              key={d.id}
              className={`jdc-vila-card ${completa ? 'jdc-vila-card--done' : ''}`}
              onClick={() => store.setFase(`dungeon_${d.id}`)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ borderLeftColor: completa ? '#22C55E' : '#8B0000' }}
            >
              <div className="jdc-vila-card-emoji">
                {completa ? '🔄' : (d.emoji || '⚔️')}
              </div>
              <div className="jdc-vila-card-info">
                <span className="jdc-vila-card-nome">{d.nome}</span>
                <span className="jdc-vila-card-desc">{d.desc}</span>
                <span className="jdc-vila-card-detail">
                  {d.mecanica === 'fuga' ? `⚡ fuga · ${d.dropCap || 0} 🍺` :
                   d.mecanica === 'stealth' ? `🥷 stealth · ${d.inimigos} inimigos` :
                   d.infinito ? `♾️ infinito · escala c/ nível` :
                   completa
                    ? `rejogar (${Math.floor((d.dropCap || 0) / 2)} 🍺)`
                    : `${d.inimigos} inimigos · ${d.dropCap || 0} 🍺`}
                  {d.dropNotas > 0 ? ` · ${d.dropNotas} notas` : ''}
                  {d.dropFragmentos > 0 ? ` · ${d.dropFragmentos} 💎` : ''}
                  {d.boss ? ` · boss: ${d.boss.nome}` : ''}
                </span>
              </div>
              <div className="jdc-vila-card-arrow" style={{ color: completa ? '#22C55E' : '#8B0000' }}>→</div>
            </motion.button>
          )
        })}
      </div>

      <div className="jdc-vila-legend">
        <span>⚔️ Nova</span>
        <span>🔄 Rejogar</span>
        {store.periodo === 'NOITE' && <span>🌙 Noturna</span>}
      </div>
    </motion.div>
  )
}
