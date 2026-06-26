import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useFichas } from '../../../../context/FichasContext'
import { FICHAS_GATE_ATIVO } from '../../../../config/fichas'
import './Recompensas.css'

const MOTIVO_KEY_MAP = {
  diaria: 'site.perfil.recomp_motivo_diaria', achievement: 'site.perfil.recomp_motivo_achievement',
  webtoon: 'site.perfil.recomp_motivo_webtoon', livro: 'site.perfil.recomp_motivo_livro',
  indicacao: 'site.perfil.recomp_motivo_indicacao', compartilhamento: 'site.perfil.recomp_motivo_compartilhamento',
  jack_dream_beer: 'site.perfil.recomp_motivo_jack', lendas_ldi: 'site.perfil.recomp_motivo_lendas', top_trumps: 'site.perfil.recomp_motivo_trumps',
}

export default function Recompensas() {
  const { t } = useLanguage()
  const { saldo, fichasDiarias, podeColetarHoje, coletarDiarias, historico, carregarHistorico, isAdmin } = useFichas()
  const [coletando, setColetando] = useState(false)
  const [coletado, setColetado] = useState(false)

  useEffect(() => { carregarHistorico() }, [])

  const handleColetar = async () => { setColetando(true); const ok = await coletarDiarias(); if (ok) setColetado(true); setColetando(false); setTimeout(() => setColetado(false), 3000) }

  // Se o gate de fichas está desativado, não exibe nada
  if (!FICHAS_GATE_ATIVO) return null

  return (
    <div className="recomp-page">
      <div className="recomp-saldo">
        <span className="recomp-saldo-emoji">🎰</span>
        <div><p className="recomp-saldo-val">{isAdmin ? '∞' : saldo}</p><p className="recomp-saldo-label">{t('site.perfil.recomp_fichas_disponiveis')}</p></div>
      </div>
      {isAdmin && <p className="recomp-admin">{t('site.perfil.recomp_admin_bypass')}</p>}
      {!isAdmin && (
        <div className="recomp-ticket-wrap">
          <p className="recomp-secao-label">{t('site.perfil.recomp_ficha_diaria')}</p>
          <motion.div className={`recomp-ticket ${podeColetarHoje ? 'recomp-ticket--disponivel' : 'recomp-ticket--coletado'}`}
            whileHover={podeColetarHoje ? { scale: 1.02 } : {}} onClick={podeColetarHoje ? handleColetar : undefined}>
            <div className="recomp-ticket-inner">
              <span className="recomp-ticket-emoji">{podeColetarHoje ? '🎟️' : '✅'}</span>
              <div>
                <p className="recomp-ticket-titulo">{podeColetarHoje ? t('site.perfil.recomp_fichas_disponiveis_valor', { n: fichasDiarias }) : t('site.perfil.recomp_fichas_coletadas_hoje')}</p>
                <p className="recomp-ticket-sub">{podeColetarHoje ? t('site.perfil.recomp_clique_coletar') : t('site.perfil.recomp_reset_meia_noite', { n: fichasDiarias })}</p>
              </div>
              {podeColetarHoje && <span className="recomp-ticket-cta">{coletando ? '...' : t('site.perfil.recomp_coletar_btn')}</span>}
            </div>
            <div className="recomp-ticket-perfurado" />
          </motion.div>
          <AnimatePresence>{coletado && <motion.p className="recomp-coletado-msg" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{t('site.perfil.recomp_coletadas_msg', { n: fichasDiarias })}</motion.p>}</AnimatePresence>
        </div>
      )}
      <div className="recomp-como">
        <p className="recomp-secao-label">{t('site.perfil.recomp_como_ganhar')}</p>
        <div className="recomp-como-grid">
          {[
            { emoji: '📖', acaoKey: 'site.perfil.recomp_acao_livro', fichas: '+1' },
            { emoji: '📺', acaoKey: 'site.perfil.recomp_acao_webtoon', fichas: '+1' },
            { emoji: '🏆', acaoKey: 'site.perfil.recomp_acao_achievement', fichas: '+1' },
            { emoji: '👥', acaoKey: 'site.perfil.recomp_acao_indicar', fichas: '+3' },
            { emoji: '📤', acaoKey: 'site.perfil.recomp_acao_compartilhar', fichas: '+2' },
            { emoji: '⭐', acaoKey: 'site.perfil.recomp_acao_elite', fichas: '10/dia' },
            { emoji: '💎', acaoKey: 'site.perfil.recomp_acao_primordial', fichas: '30/dia' }
          ].map((item, i) => (
            <div key={i} className="recomp-como-item"><span>{item.emoji}</span><span className="recomp-como-acao">{t(item.acaoKey)}</span><span className="recomp-como-fichas">{t('site.perfil.recomp_acoes_fichas', { n: item.fichas })}</span></div>
          ))}
        </div>
      </div>
      {historico.length > 0 && (
        <div className="recomp-historico">
          <p className="recomp-secao-label">{t('site.perfil.recomp_historico')}</p>
          {historico.map(h => (
            <div key={h.id} className={`recomp-hist-item ${h.tipo === 'ganho' ? 'recomp-hist-item--ganho' : 'recomp-hist-item--gasto'}`}>
              <span className="recomp-hist-motivo">{MOTIVO_KEY_MAP[h.motivo] ? t(MOTIVO_KEY_MAP[h.motivo]) : h.motivo}</span>
              <span className="recomp-hist-qtd">{h.tipo === 'ganho' ? '+' : '-'}{h.quantidade} 🎰</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
