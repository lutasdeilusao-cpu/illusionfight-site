import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { cancelarAssinatura } from '../../../lib/stripe'

export default function PerfilConta() {
  const { user, perfil, session } = useAuth()
  const { locale } = useLanguage()
  const [shareLink, setShareLink] = useState('')
  const [shareStatus, setShareStatus] = useState(null)
  const [cancelando, setCancelando] = useState(false)
  const [feedbackCancela, setFeedbackCancela] = useState(null)

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
    if (!confirm('Confirmar cancelamento? O acesso continua até o fim do período pago.')) return
    setCancelando(true)
    try {
      await cancelarAssinatura(session.access_token)
      setFeedbackCancela('Cancelamento agendado. Acesso mantido até o fim do período.')
    } catch (err) {
      console.error('[PERFIL] erro cancelar:', err)
      setFeedbackCancela(`Erro: ${err.message}`)
    } finally {
      setCancelando(false)
    }
  }

  return (
    <div className="perfil-conta">
      <div className="perfil-conta-info">
        <h3 className="perfil-section-title">INFORMAÇÕES DA CONTA</h3>
        <div className="perfil-conta-campo"><span className="perfil-conta-label">Nome</span><span className="perfil-conta-valor">{perfil?.nome || '...'}</span></div>
        <div className="perfil-conta-campo"><span className="perfil-conta-label">Email</span><span className="perfil-conta-valor">{user?.email || '...'}</span></div>
        <div className="perfil-conta-campo"><span className="perfil-conta-label">Tier</span><span className="perfil-conta-valor">{perfil?.tier || 'RANQUEADO'} <Link to="/assinar" className="perfil-conta-upgrade">Fazer upgrade</Link></span></div>
      </div>

      <div className="perfil-assinatura">
        <h3 className="perfil-section-title">ASSINATURA</h3>
        <p>Plano: <strong>{perfil?.tier || 'RANQUEADO'}</strong></p>
        <p>Status: <strong>{perfil?.subscription_status || '—'}</strong></p>
        {perfil?.current_period_end && (
          <p>Renova em: {new Date(perfil.current_period_end).toLocaleDateString(locale)}</p>
        )}
        {perfil?.subscription_status === 'active' && (
          <button
            className="btn btn-outline"
            onClick={handleCancelar}
            disabled={cancelando}
          >
            {cancelando ? 'Cancelando...' : 'Cancelar assinatura'}
          </button>
        )}
        {feedbackCancela && <p className="perfil-feedback">{feedbackCancela}</p>}
      </div>

      <div className="perfil-share-section">
        <h3 className="perfil-section-title">CONQUISTA MENSAL</h3>
        <p className="perfil-share-desc">Compartilhou o LDI no X, YouTube, TikTok ou qualquer rede esse mês? Cole o link da publicação para auditoria e ganhe o achievement 🔥</p>
        {shareStatus === 'aprovado' && <div className="perfil-share-status aprovado">✓ Compartilhamento aprovado este mês. Volte no mês que vem!</div>}
        {shareStatus === 'pendente' && <div className="perfil-share-status pendente">⏳ Link enviado — em análise.</div>}
        {shareStatus === 'rejeitado' && <div className="perfil-share-status rejeitado">✗ Link rejeitado.</div>}
        {shareStatus === 'ja_enviou' && <div className="perfil-share-status pendente">Você já enviou um link este mês.</div>}
        {(!shareStatus || shareStatus === 'rejeitado') && (
          <div className="perfil-share-form">
            <input type="url" placeholder="https://x.com/seuperfil/status/..." value={shareLink} onChange={e => setShareLink(e.target.value)} className="perfil-share-input" />
            <button onClick={enviarShare} className="perfil-share-btn">ENVIAR PARA ANÁLISE</button>
          </div>
        )}
      </div>
    </div>
  )
}
