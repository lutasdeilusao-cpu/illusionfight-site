import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './LDI.css'

export default function Lobby() {
  return (
    <div className="ldi-lobby">
      <div className="ldi-lobby-bg" />
      <motion.div
        className="ldi-lobby-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="ldi-lobby-brand">
          <h1 className="ldi-lobby-title">LENDAS DO LDI</h1>
          <p className="ldi-lobby-sub">Arco 1: Descobrimento</p>
          <p className="ldi-lobby-desc">
            Um RPG narrativo de livro-jogo digital no universo Lutas de Ilusão.
            Suas escolhas definem seu destino na arena.
          </p>
        </div>

        <div className="ldi-lobby-actions">
          <Link to="/extras/ldi/create" className="ldi-btn ldi-btn--primary">
            NOVA FICHA
          </Link>
          <Link to="/extras/ldi/create" className="ldi-btn ldi-btn--outline">
            CONTINUAR
          </Link>
        </div>

        <div className="ldi-lobby-disclaimer">
          <p>Salvamento automático via navegador. Faça login para salvar na nuvem.</p>
        </div>
      </motion.div>
    </div>
  )
}
