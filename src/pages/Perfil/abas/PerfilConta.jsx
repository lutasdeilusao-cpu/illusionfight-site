import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { cancelarAssinatura, iniciarCheckout } from '../../../lib/stripe'

function calcDiasRestantes(dataFim) {
  if (!dataFim) return null
  return Math.ceil((new Date(dataFim) - new Date()) / (1000 * 60 * 60 * 24))
}

function getStatusLabel(t, status, cancelAtPeriodEnd) {
  if (status === 'active' && !cancelAtPeriodEnd) return t('site.perfil.billing_status_active')
  if (status === 'active' && cancelAtPeriodEnd) return t('site.perfil.billing_status_canceled')
  if (status === 'past_due') return t('site.perfil.billing_status_past_due')
  if (status === 'canceled' || status === 'incomplete_expired') return t('site.perfil.billing_status_expired')
  return t('site.perfil.billing_status_none')
}

function getStatusClass(status, cancelAtPeriodEnd) {
  if (status === 'active' && !cancelAtPeriodEnd) return 'perfil-status--active'
  if (status === 'active' && cancelAtPeriodEnd) return 'perfil-status--canceled'
  return 'perfil-status--none'
}

export default function PerfilConta() {
  const { user, perfil } = useAuth()
  const { t, locale } = useLanguage()
  const [shareLink, setShareLink] = useState('')
  const [shareStatus, setShareStatus] = useState(null)
  const [cancelando, setCancelando] = useState(false)
  const [renovando, setRenovando] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // ── Dados da assinatura ──
  const subscriptionStatus = perfil?.subscription_status
  const cancelAtPeriodEnd = perfil?.cancel_at_period_end
  const tier = perfil?.tier || 'RANQUEADO'
  const currentPeriodEnd = perfil?.current_period_end
  const diasRestantes = useMemo(() => calcDiasRestantes(currentPeriodEnd), [currentPeriodEnd])
  const statusLabel = getStatusLabel(t, subscriptionStatus, cancelAtPeriodEnd)
  const statusClass = getStatusClass(subscriptionStatus, cancelAtPeriodEnd)
  const isSubscribed = subscriptionStatus === 'active'
  const isCanceled = isSubscribed && cancelAtPeriodEnd
  const isActive = isSubscribed && !cancelAtPeriodEnd
  const isExpired = subscriptionStatus === 'canceled' || subscriptionStatus === 'incomplete_expired' || subscriptionStatus === 'past_due'
  const hasSubscription = isSubscribed || isExpired

  useEffect(() => {
    if (!user) return
    const mesAtual = new Date().toISOString().slice(0, 7)
    supabase.from('share_submissions').select('status').eq('user_id', user.id).eq('mes_referencia', mesAtual).single().then(({ data }) => {
      if (data) setShareStatus(data.status)
    })
  }, [user])

  async function enviarShare() {
    if (!shareLink.trim()) return
    try { new URL(shareLink) } catch { setShareStatus('url_invalida'); return }
    const mesAtual = new Date().toISOString().slice(0, 7)
    const { error } = await supabase.from('share_submissions').insert({ user_id: user.id, link: shareLink.trim(), mes_referencia: mesAtual })
    if (error?.code === '23505') setShareStatus('ja_enviou')
    else if (error) setShareStatus('erro')
    else { setShareStatus('pendente'); setShareLink('') }
  }

  async function handleCancelar() {
    const confirmMsg = t('site.perfil.billing_confirm_cancel')
    if (!window.confirm(confirmMsg)) return
    setCancelando(true)
    setFeedback(null)
    try {
      await cancelarAssinatura()
      setFeedback({ type: 'success', msg: t('site.perfil.billing_cancel_success') })
    } catch (err) {
      console.error('[PERFIL] erro cancelar:', err)
      setFeedback({ type: 'error', msg: `${t('site.perfil.billing_error')}: ${err.message}` })
    } finally {
      setCancelando(false)
    }
  }

  async function handleRenovar() {
    setRenovando(true)
    setFeedback(null)
    try {
      await iniciarCheckout(tier)
    } catch (err) {
      console.error('[PERFIL] erro renovar:', err)
      setFeedback({ type: 'error', msg: `${t('site.perfil.billing_error')}: ${err.message}` })
      setRenovando(false)
    }
  }

  // ── Render ──
  return (
    <div className="perfil-conta">

      {/* ── INFORMAÇÕES DA CONTA ── */}
      <div className="perfil-conta-card">
        <h3 className="perfil-section-title">{t('site.perfil.conta_titulo')}</h3>
        <div className="perfil-conta-campo">
          <span className="perfil-conta-label">{t('site.perfil.conta_nome')}</span>
          <span className="perfil-conta-valor">{perfil?.nome || '...'}</span>
        </div>
        <div className="perfil-conta-campo">
          <span className="perfil-conta-label">{t('site.perfil.conta_email')}</span>
          <span className="perfil-conta-valor">{user?.email || '...'}</span>
        </div>
        <div className="perfil-conta-campo">
          <span className="perfil-conta-label">{t('site.perfil.conta_tier')}</span>
          <span className="perfil-conta-valor">{tier}</span>
        </div>
      </div>

      {/* ── ASSINATURA ── */}
      <div className="perfil-conta-card">
        <h3 className="perfil-section-title">{t('site.perfil.billing_titulo')}</h3>

        {/* Status badge */}
        <div className={`perfil-status-badge ${statusClass}`}>{statusLabel}</div>

        {/* Caso 1: Sem assinatura / expirado */}
        {!isSubscribed && !isExpired && (
          <div className="perfil-billing-empty">
            <p className="perfil-billing-text">{t('site.perfil.billing_no_subscription')}</p>
            <Link to="/assinar" className="btn btn-primary perfil-billing-cta">
              {t('site.perfil.billing_ver_planos')}
            </Link>
          </div>
        )}

        {/* Caso 2: Expirado */}
        {isExpired && !isSubscribed && (
          <div className="perfil-billing-empty">
            <p className="perfil-billing-text">{t('site.perfil.billing_expired')}</p>
            <Link to="/assinar" className="btn btn-primary perfil-billing-cta">
              {t('site.perfil.billing_ver_planos')}
            </Link>
          </div>
        )}

        {/* Caso 3: Assinatura ATIVA */}
        {isActive && (
          <div className="perfil-billing-details">
            <div className="perfil-billing-row">
              <span className="perfil-billing-label">{t('site.perfil.billing_plan')}</span>
              <span className="perfil-billing-value">{tier}</span>
            </div>
            {currentPeriodEnd && (
              <div className="perfil-billing-row">
                <span className="perfil-billing-label">{t('site.perfil.billing_next_charge')}</span>
                <span className="perfil-billing-value">
                  {new Date(currentPeriodEnd).toLocaleDateString(locale)}
                  {diasRestantes !== null && (
                    <span className="perfil-billing-dias"> — {t('site.perfil.billing_dias_restantes', { n: diasRestantes })}</span>
                  )}
                </span>
              </div>
            )}
            <button
              className="btn btn-outline perfil-billing-btn perfil-billing-btn--cancel"
              onClick={handleCancelar}
              disabled={cancelando}
            >
              {cancelando ? t('site.perfil.billing_cancelando') : t('site.perfil.billing_cancelar_btn')}
            </button>
          </div>
        )}

        {/* Caso 4: CANCELADA — ainda no período */}
        {isCanceled && (
          <div className="perfil-billing-details">
            <div className="perfil-billing-row">
              <span className="perfil-billing-label">{t('site.perfil.billing_plan')}</span>
              <span className="perfil-billing-value">{tier}</span>
            </div>
            {currentPeriodEnd && (
              <div className="perfil-billing-row">
                <span className="perfil-billing-label">{t('site.perfil.billing_access_until')}</span>
                <span className="perfil-billing-value">
                  {new Date(currentPeriodEnd).toLocaleDateString(locale)}
                  {diasRestantes !== null && (
                    <span className="perfil-billing-dias"> — {t('site.perfil.billing_dias_restantes', { n: diasRestantes })}</span>
                  )}
                </span>
              </div>
            )}
            <button
              className="btn btn-primary perfil-billing-btn perfil-billing-btn--renew"
              onClick={handleRenovar}
              disabled={renovando}
            >
              {renovando ? t('site.perfil.billing_renovando') : t('site.perfil.billing_renovar_btn')}
            </button>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`perfil-feedback perfil-feedback--${feedback.type}`}>
            {feedback.msg}
          </div>
        )}
      </div>

      {/* ── CONQUISTA MENSAL ── */}
      <div className="perfil-conta-card">
        <h3 className="perfil-section-title">{t('site.perfil.share_titulo')}</h3>
        <p className="perfil-share-desc">{t('site.perfil.share_desc')}</p>
        {shareStatus === 'aprovado' && <div className="perfil-share-status aprovado">{t('site.perfil.share_aprovado')}</div>}
        {shareStatus === 'pendente' && <div className="perfil-share-status pendente">{t('site.perfil.share_pendente')}</div>}
        {shareStatus === 'rejeitado' && <div className="perfil-share-status rejeitado">{t('site.perfil.share_rejeitado')}</div>}
        {shareStatus === 'ja_enviou' && <div className="perfil-share-status pendente">{t('site.perfil.share_ja_enviou')}</div>}
        {(!shareStatus || shareStatus === 'rejeitado') && (
          <div className="perfil-share-form">
            <input
              type="url"
              placeholder={t('site.perfil.share_placeholder')}
              value={shareLink}
              onChange={e => setShareLink(e.target.value)}
              className="perfil-share-input"
            />
            <button onClick={enviarShare} className="perfil-share-btn">{t('site.perfil.share_enviar')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
