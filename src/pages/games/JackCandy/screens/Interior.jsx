import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useJackStore } from '../store/useJackStore'
import { NPCS } from '../data/npcs'
import { ITENS } from '../data/itens'

export default function Interior({ npcId }) {
  const { t } = useLanguage()
  const store = useJackStore()
  const npc = NPCS[npcId]
  const [msg, setMsg] = useState('')
  const [aba, setAba] = useState('todos')
  const [baloes, setBaloes] = useState([])

  if (!npc) return null

  const moedaIcon = (moeda) => {
    if (moeda === 'nota') return 'ðŸ’µ'
    if (moeda === 'fragmento') return 'ðŸ’Ž'
    return 'ðŸº'
  }

  const moedaNome = (moeda) => {
    if (moeda === 'nota') return 'notas'
    if (moeda === 'fragmento') return 'fragmentos'
    return 'cervejas'
  }

  const saldo = (moeda) => {
    if (moeda === 'nota') return store.notas
    if (moeda === 'fragmento') return store.fragmentos
    return store.cervejas
  }

  const addBalao = (texto) => {
    setBaloes(b => [...b.slice(-2), texto])
    setTimeout(() => setBaloes(b => b.slice(1)), 3000)
  }

  const handleComprar = (itemId) => {
    const item = ITENS[itemId]
    if (!item) return
    if (saldo(item.moeda) < item.preco) {
      setMsg(t('games.jackcandy.interior_recursos_insuficientes'))
      return
    }
    store.comprarItem(itemId)
    const msgCompra = t('games.jackcandy.interior_comprou', { nome: item.nome })
    setMsg(msgCompra)
    addBalao(msgCompra)
  }

  // Todos os itens do NPC (incluindo loja secreta se aplicÃ¡vel)
  const todosItens = [
    ...(npc.itens || []),
    ...(npc.loja_secreta && store.flags[npc.requerFlagLoja] ? npc.loja_secreta : [])
  ].filter(itemId => {
    const item = ITENS[itemId]
    if (!item) return false
    // JÃ¡ equipado â†’ esconde
    const eq = store.equipado
    if (eq.arma?.id === itemId || eq.armadura?.id === itemId || eq.acessorio?.id === itemId) return false
    // JÃ¡ no inventÃ¡rio â†’ esconde
    if (store.inventario.find(i => i.id === itemId)) return false
    // Bengala sÃ³ aparece antes de comprar
    if (itemId === 'bengala_steampunk' && store.flags.TEM_BENGALA) return false
    // NÃ£o-consumÃ­veis jÃ¡ comprados nÃ£o aparecem
    if (!item.cura && (store.comprou || []).includes(itemId)) return false
    return true
  })

  const categorias = ['todos', 'arma', 'armadura', 'consumivel', 'acessorio']
  const itensFiltrados = todosItens.filter(itemId => {
    const item = ITENS[itemId]
    if (!item) return false
    if (aba === 'arma') return item.slot === 'arma' || item.danoBonus
    if (aba === 'armadura') return item.slot === 'armadura'
    if (aba === 'consumivel') return !!item.cura
    if (aba === 'acessorio') return item.slot === 'acessorio'
    return true
  })

  const missaoStatus = npc.missoes?.map(m => {
    if (m.flag && store.flags[m.flag]) return 'done'
    return m.disponivel ? 'open' : 'locked'
  }) || []

  const iconeSlot = (item) => {
    if (item.cura) return 'ðŸ§ª'
    if (item.slot === 'arma') return 'âš”ï¸'
    if (item.slot === 'armadura') return 'ðŸ›¡ï¸'
    if (item.slot === 'acessorio') return 'ðŸ’'
    if (item.danoBonus) return 'ðŸ”§'
    return 'ðŸ“¦'
  }

  return (
    <motion.div className="jdc-interior" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="jdc-interior-header">
        <div>
          <span className="jdc-interior-nome">{npc.interior}</span>
          <span className="jdc-interior-dono"> â€” {npc.nome}</span>
        </div>
        <button className="jack-btn jdc-btn-xs" onClick={() => store.setFase('vila')}>
          {t('games.jackcandy.interior_sair')}
        </button>
      </div>

      {/* BalÃ£o de saudaÃ§Ã£o */}
      <div className="jdc-interior-balao">
        <p className="jdc-interior-balao-text">{npc.saudacao}</p>
      </div>

      {/* MissÃµes */}
      {npc.missoes && npc.missoes.length > 0 && (
        <div className="jdc-interior-missoes">
          <p className="jack-text jack-text--dim jdc-text-xs jdc-mb-03">{t('games.jackcandy.interior_missoes')}</p>
          {npc.missoes.map((m, i) => (
            <div key={m.id} className="jdc-interior-missao">
              <span>{missaoStatus[i] === 'done' ? 'âœ…' : missaoStatus[i] === 'open' ? 'ðŸ“‹' : 'ðŸ”’'}</span>
              <span className="jack-text">{m.nome}</span>
              {m.desc && <span className="jack-text--dim">{m.desc}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Abas */}
      <div className="jack-tabs">
        {categorias.map(cat => (
          <button key={cat} className={`jack-tab ${aba === cat ? 'jack-tab--active' : ''}`}
            onClick={() => setAba(cat)}>{cat}</button>
        ))}
      </div>

      {/* Itens */}
      <div className="jdc-interior-itens">
        {itensFiltrados.map(itemId => {
          const item = ITENS[itemId]
          if (!item) return null
          const podeComprar = saldo(item.moeda) >= item.preco
          return (
            <motion.div key={itemId} className="jdc-interior-item"
              whileHover={{ borderColor: '#F5A623', background: 'rgba(245,166,35,0.03)' }}>
              <div className="jdc-interior-item-icon">{iconeSlot(item)}</div>
              <div className="jdc-interior-item-info">
                <span className="jdc-interior-item-nome">{item.nome}</span>
                <span className="jdc-interior-item-desc">{item.desc}</span>
                <div className="jdc-interior-item-stats">
                  {item.dano && <span>âš”ï¸ +{item.dano}</span>}
                  {item.capPerSeg && <span>ðŸº/s +{item.capPerSeg}</span>}
                  {item.hpMaxBonus && <span>â¤ï¸ +{item.hpMaxBonus} Moral</span>}
                  {item.cura && <span>ðŸ§ª +{item.cura} Moral</span>}
                  {item.reducaoDano && <span>ðŸ›¡ï¸ -{item.reducaoDano} dmg</span>}
                </div>
              </div>
              <div className="jdc-interior-item-preco">
                <span className={podeComprar ? 'jack-text--amber' : 'jack-text--crimson'}>
                  {moedaIcon(item.moeda)} {item.preco}
                </span>
                <button className="jack-btn jack-btn--amber"
                  onClick={() => handleComprar(itemId)}
                  disabled={!podeComprar}
                  className="jack-btn jack-btn--amber jdc-interior-comprar-btn">
                  {t('games.jackcandy.interior_comprar')}
                </button>
              </div>
            </motion.div>
          )
        })}
        {itensFiltrados.length === 0 && (
          <p className="jack-text jack-text--dim jdc-interior-vazio">
            {npc.id === 'paje' && store.flags.TEM_BENGALA && !todosItens.length
              ? t('games.jackcandy.interior_todos_comprados')
              : t('games.jackcandy.interior_nada_disponivel')}
          </p>
        )}
      </div>

      {/* Feedback */}
      {msg && (
        <motion.p className="jack-text jack-text--amber" initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}>{msg}</motion.p>
      )}

      {/* BalÃµes flutuantes */}
      <div className="jdc-interior-baloes-flutuantes">
        <AnimatePresence>
          {baloes.map((b, i) => (
            <motion.div key={i} className="jdc-interior-balao-float"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >{b}</motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
