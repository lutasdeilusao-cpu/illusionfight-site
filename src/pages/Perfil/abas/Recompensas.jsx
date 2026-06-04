import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFichas } from '../../../context/FichasContext'
import './Recompensas.css'

const MOTIVO_LABEL = {
  diaria: 'fichas diárias', achievement: 'achievement desbloqueado',
  webtoon: 'episódio lido', livro: 'capítulo lido',
  indicacao: 'indicação qualificada', compartilhamento: 'compartilhamento aprovado',
  jack_dream_beer: 'jack dream beer', lendas_ldi: 'lendas do ldi', top_trumps: 'top trumps',
}

export default function Recompensas() {
  const { saldo, fichasDiarias, podeColetarHoje, coletarDiarias, historico, carregarHistorico, isAdmin } = useFichas()
  const [coletando, setColetando] = useState(false)
  const [coletado, setColetado] = useState(false)

  useEffect(() => { carregarHistorico() }, [])

  const handleColetar = async () => { setColetando(true); const ok = await coletarDiarias(); if (ok) setColetado(true); setColetando(false); setTimeout(() => setColetado(false), 3000) }

  return (
    <div className="recomp-page">
      <div className="recomp-saldo">
        <span className="recomp-saldo-emoji">🎰</span>
        <div><p className="recomp-saldo-val">{isAdmin ? '∞' : saldo}</p><p className="recomp-saldo-label">fichas disponíveis</p></div>
      </div>
      {isAdmin && <p className="recomp-admin">★ conta admin — bypass de fichas ativo</p>}
      {!isAdmin && (
        <div className="recomp-ticket-wrap">
          <p className="recomp-secao-label">FICHA DIÁRIA</p>
          <motion.div className={`recomp-ticket ${podeColetarHoje ? 'recomp-ticket--disponivel' : 'recomp-ticket--coletado'}`}
            whileHover={podeColetarHoje ? { scale: 1.02 } : {}} onClick={podeColetarHoje ? handleColetar : undefined}>
            <div className="recomp-ticket-inner">
              <span className="recomp-ticket-emoji">{podeColetarHoje ? '🎟️' : '✅'}</span>
              <div>
                <p className="recomp-ticket-titulo">{podeColetarHoje ? `+ ${fichasDiarias} fichas disponíveis` : 'fichas coletadas hoje'}</p>
                <p className="recomp-ticket-sub">{podeColetarHoje ? 'clique para coletar' : `resetam à meia-noite · ${fichasDiarias} fichas/dia`}</p>
              </div>
              {podeColetarHoje && <span className="recomp-ticket-cta">{coletando ? '...' : 'COLETAR'}</span>}
            </div>
            <div className="recomp-ticket-perfurado" />
          </motion.div>
          <AnimatePresence>{coletado && <motion.p className="recomp-coletado-msg" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>+{fichasDiarias} fichas coletadas!</motion.p>}</AnimatePresence>
        </div>
      )}
      <div className="recomp-como">
        <p className="recomp-secao-label">COMO GANHAR FICHAS</p>
        <div className="recomp-como-grid">
          {[{ emoji: '📖', acao: 'Ler capítulo do livro', fichas: '+1' },{ emoji: '📺', acao: 'Ler episódio do webtoon', fichas: '+1' },{ emoji: '🏆', acao: 'Desbloquear achievement', fichas: '+1' },{ emoji: '👥', acao: 'Indicar um amigo', fichas: '+3' },{ emoji: '📤', acao: 'Compartilhar resultado', fichas: '+2' },{ emoji: '⭐', acao: 'Assinar Elite', fichas: '10/dia' },{ emoji: '💎', acao: 'Assinar Primordial', fichas: '30/dia' }].map((item, i) => (
            <div key={i} className="recomp-como-item"><span>{item.emoji}</span><span className="recomp-como-acao">{item.acao}</span><span className="recomp-como-fichas">{item.fichas} 🎰</span></div>
          ))}
        </div>
      </div>
      {historico.length > 0 && (
        <div className="recomp-historico">
          <p className="recomp-secao-label">HISTÓRICO</p>
          {historico.map(h => (
            <div key={h.id} className={`recomp-hist-item ${h.tipo === 'ganho' ? 'recomp-hist-item--ganho' : 'recomp-hist-item--gasto'}`}>
              <span className="recomp-hist-motivo">{MOTIVO_LABEL[h.motivo] || h.motivo}</span>
              <span className="recomp-hist-qtd">{h.tipo === 'ganho' ? '+' : '-'}{h.quantidade} 🎰</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
