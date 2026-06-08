import { useState, useEffect } from 'react'
import { useFichas } from '../../context/FichasContext'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Link } from 'react-router-dom'
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
    if (free || isAdmin || isDesbloqueadoHoje(gameId)) { setEtapa('liberado'); return }
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
    return <div className="fgr-gate"><div className="fgr-icon">⏳</div><p className="fgr-text">carregando...</p></div>
  }

  // ── Já liberou (admin, já pagou, free, etc.) ──
  if (etapa === 'liberado') {
    return children
  }

  // ── Confirmação de gasto ──
  if (etapa === 'confirmacao') {
    return (
      <div className="fgr-gate">
        <div className="fgr-icon">🎰</div>
        <p className="fgr-titulo">GASTAR 1 FICHA?</p>
        <p className="fgr-desc">você vai gastar 1 ficha para desbloquear {nomeExibicao || feature}.</p>
        <p className="fgr-duracao">⏳ válido por 24 horas — jogue à vontade!</p>
        <div className="fgr-saldo-row">
          <span>saldo atual</span><span className="fgr-val">{saldo} 🎰</span>
        </div>
        <div className="fgr-saldo-row fgr-saldo-row--restante">
          <span>saldo após gastar</span><span className="fgr-val">{saldo - 1} 🎰</span>
        </div>
        <button className="fgr-btn fgr-btn--primary" onClick={handleConfirmar} disabled={gastando}>
          {gastando ? '...' : '[ gastar 1 ficha ]'}
        </button>
        <Link to="/perfil?aba=recompensas" className="fgr-link">coletar mais fichas</Link>
      </div>
    )
  }

  // ── Sem fichas ──
  if (etapa === 'semfichas') {
    return (
      <div className="fgr-gate">
        <div className="fgr-icon">🎰</div>
        <p className="fgr-titulo">SEM FICHAS</p>
        <p className="fgr-desc">você precisa de 1 ficha para jogar {nomeExibicao || feature}.</p>
        <p className="fgr-sub">fichas diárias resetam à meia-noite.</p>
        <Link to="/perfil?aba=recompensas" className="fgr-btn fgr-btn--primary">coletar fichas</Link>
        <Link to="/assinar" className="fgr-btn fgr-btn--elite">assinar elite — 10 fichas/dia</Link>
        <Link to="/games" className="fgr-link">voltar aos games</Link>
      </div>
    )
  }

  return null
}
