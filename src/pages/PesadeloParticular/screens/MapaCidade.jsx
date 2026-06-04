import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import { usePPStore } from '../store/usePPStore'
import { CASOS } from '../data/casos'
import { casosDisponiveis } from '../data/resolver'

export default function MapaCidade() {
  const { user } = useAuth()
  const store = usePPStore()
  const { casosResolvidos, reputacao } = store

  const disponiveis = casosDisponiveis(casosResolvidos, reputacao)
  const todosCasos = CASOS.map(c => {
    const resolvido = casosResolvidos.includes(c.id)
    const disponivel = disponiveis.find(d => d.id === c.id)
    return { ...c, resolvido, disponivel: !!disponivel }
  })

  const handleEntrar = (caso) => {
    if (caso.resolvido) return
    if (!caso.disponivel) return
    store.iniciarCaso(caso)
  }

  return (
    <div className="pp-container">
      <div className="pp-header">
        <h1 className="pp-title">PESADELO PARTICULAR</h1>
        <p className="pp-subtitle">Marelia, 1954. O sonho escolheu você.</p>
      </div>

      <div className="pp-rep-display">★ {reputacao}</div>

      <div className="pp-section">
        <div className="pp-section-label">Casos</div>
        <div className="pp-mapa-grid">
          {todosCasos.map(c => (
            <motion.div key={c.id}
              className={`pp-mapa-node ${c.resolvido ? 'pp-mapa-node--resolvido' : c.disponivel ? 'pp-mapa-node--disponivel' : 'pp-mapa-node--bloqueado'}`}
              whileHover={c.disponivel && !c.resolvido ? { x: 3 } : {}}
              onClick={() => handleEntrar(c)}>
              <div className="pp-mapa-diff">{'◆'.repeat(c.dificuldade)}</div>
              <div className="pp-mapa-nome">{c.nome}</div>
              <div className="pp-mapa-rep">
                {c.resolvido ? '✓ resolvido' : c.disponivel ? `+${c.reputacao_ganho} rep` : 'bloqueado'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
