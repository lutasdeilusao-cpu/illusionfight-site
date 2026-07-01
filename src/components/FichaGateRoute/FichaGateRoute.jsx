import { useState, useEffect } from 'react'
import { useFichas } from '../../context/FichasContext'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Link } from 'react-router-dom'
import { FICHAS_GATE_ATIVO } from '../../config/fichas'
import ModalConfirmacaoFicha from '../ModalConfirmacaoFicha/ModalConfirmacaoFicha'
import ModalSemFichas from '../ModalSemFichas/ModalSemFichas'
import './FichaGateRoute.css'

/**
 * FichaGateRoute — proteção de rota que combina LoginGate + FichaGate.
 *
 * Props:
 *   gameId       — identificador do jogo (ex: 'arena', 'jack_dream_beer')
 *   feature      — descrição para o LoginGate (ex: 'a Arena LDI')
 *   nomeExibicao — nome para exibir nos modais (ex: 'Arena LDI')
 *   isFree       — se true, não cobra ficha (só login)
 *   children     — componente do jogo (renderizado só após passar pelo gate)
 */
function getHoje() {
  return new Date().toISOString().split('T')[0]
}

function isDesbloqueadoHoje(gameId) {
  try {
    return localStorage.getItem(`ficha_gate_${gameId}`) === getHoje()
  } catch { return false }
}

export default function FichaGateRoute({ gameId, feature, nomeExibicao, isFree, children }) {
  // Se o gate de fichas está desativado globalmente, renderiza os children direto
  if (!FICHAS_GATE_ATIVO) return children

  const { t } = useLanguage()
  const { user } = useAuth()
  const { saldo, gastarFicha, isAdmin, loading } = useFichas()
  const [etapa, setEtapa] = useState('carregando') // carregando | login | bloqueado | confirmacao | semfichas | liberado
  const [gastando, setGastando] = useState(false)

  // Se é FREE, libera direto (só precisa de login)
  const free = isFree === true

  useEffect(() => {
    if (!user) { setEtapa('login'); return }
    if (loading) { setEtapa('carregando'); return }
    if (free) { setEtapa('gamefree'); return } // Mostra info de jogo FREE
    if (isAdmin || isDesbloqueadoHoje(gameId)) { setEtapa('liberado'); return }
    if (saldo <= 0) { setEtapa('semfichas'); return }
    setEtapa('confirmacao')
  }, [user, loading, free, isAdmin, gameId, saldo])

  const handleConfirmar = async () => {
    if (gastando) return
    setGastando(true)
    const ok = await gastarFicha(gameId)
    if (ok) {
      try { localStorage.setItem(`ficha_gate_${gameId}`, getHoje()) } catch {}
      setEtapa('liberado')
    } else {
      setEtapa('semfichas')
    }
    setGastando(false)
  }

  // ── LoginGate ──
  if (etapa === 'login') {
    return (
      <div className="fgr-gate">
        <div className="fgr-icon">🔒</div>
        <p className="fgr-text">{t('login_gate.texto', { feature })}</p>
        <Link to="/cadastro" className="fgr-btn fgr-btn--primary">{t('login_gate.criar')}</Link>
        <Link to="/login" className="fgr-link">{t('login_gate.entrar')}</Link>
      </div>
    )
  }

  // ── Carregando ──
  if (etapa === 'carregando') {
    return       <div className="fgr-gate"><div className="fgr-icon">⏳</div><p className="fgr-text">{t('ficha_gate.carregando')}</p></div>
  }

  // ── Game FREE — avisa que não gasta ficha ──
  if (etapa === 'gamefree') {
    return (
      <div className="fgr-gate">
        <div className="fgr-icon">🎁</div>
        <p className="fgr-titulo" style={{ color: '#22C55E' }}>{t('ficha_gate.gamefree.titulo')}</p>
        <p className="fgr-desc">{t('ficha_gate.gamefree.desc', { nome: nomeExibicao || feature })}</p>
        <p className="fgr-sub">{t('ficha_gate.gamefree.sub')}</p>
        <button className="fgr-btn fgr-btn--primary" onClick={() => setEtapa('liberado')}>
          {t('ficha_gate.gamefree.jogar')}
        </button>
      </div>
    )
  }

  // ── Já liberou (admin, já pagou, free confirmado, etc.) ──
  if (etapa === 'liberado') {
    return children
  }

  // ── Confirmação de gasto ──
  if (etapa === 'confirmacao') {
    return (
      <div className="fgr-gate">
        <div className="fgr-icon">🎰</div>
        <p className="fgr-titulo">{t('ficha_gate.confirmacao.titulo')}</p>
        <p className="fgr-desc">{t('ficha_gate.confirmacao.desc', { nome: nomeExibicao || feature })}</p>
        <p className="fgr-duracao">{t('ficha_gate.confirmacao.duracao')}</p>
        <div className="fgr-saldo-row">
          <span>{t('ficha_gate.confirmacao.saldo_atual')}</span><span className="fgr-val">{saldo} 🎰</span>
        </div>
        <div className="fgr-saldo-row fgr-saldo-row--restante">
          <span>{t('ficha_gate.confirmacao.saldo_restante')}</span><span className="fgr-val">{saldo - 1} 🎰</span>
        </div>
        <button className="fgr-btn fgr-btn--primary" onClick={handleConfirmar} disabled={gastando}>
          {gastando ? t('ficha_gate.confirmacao.gastando') : t('ficha_gate.confirmacao.confirmar')}
        </button>
        <Link to="/perfil?aba=recompensas" className="fgr-link">{t('ficha_gate.confirmacao.coletar_mais')}</Link>
      </div>
    )
  }

  // ── Sem fichas ──
  if (etapa === 'semfichas') {
    return (
      <div className="fgr-gate">
        <div className="fgr-icon">🎰</div>
        <p className="fgr-titulo">{t('ficha_gate.semfichas.titulo')}</p>
        <p className="fgr-desc">{t('ficha_gate.semfichas.desc', { nome: nomeExibicao || feature })}</p>
        <p className="fgr-sub">{t('ficha_gate.semfichas.sub')}</p>
        <Link to="/perfil?aba=recompensas" className="fgr-btn fgr-btn--primary">{t('ficha_gate.semfichas.coletar')}</Link>
        <Link to="/assinar" className="fgr-btn fgr-btn--elite">{t('ficha_gate.semfichas.assinar')}</Link>
        <Link to="/games" className="fgr-link">{t('ficha_gate.semfichas.voltar')}</Link>
      </div>
    )
  }

  return null
}
