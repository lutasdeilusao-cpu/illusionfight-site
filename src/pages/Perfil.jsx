import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useAchievements } from '../context/AchievementsContext'
import todosAchievements from '../data/achievements-pt.json'
import './Perfil.css'

export default function Perfil() {
  const navigate = useNavigate()
  const { user, perfil, logout, carregando } = useAuth()
  const { desbloqueados } = useAchievements()
  const [shareLink, setShareLink] = useState('')
  const [shareStatus, setShareStatus] = useState(null)

  useEffect(() => {
    if (!user && !carregando) navigate('/login')
  }, [user, carregando])

  useEffect(() => {
    if (!user) return
    const mesAtual = new Date().toISOString().slice(0, 7)
    supabase
      .from('share_submissions')
      .select('status')
      .eq('user_id', user.id)
      .eq('mes_referencia', mesAtual)
      .single()
      .then(({ data }) => {
        if (data) setShareStatus(data.status)
      })
  }, [user])

  if (carregando) return <section className="perfil-page"><p className="perfil-carregando">Carregando...</p></section>
  if (!user) return null

  async function enviarShare() {
    if (!shareLink.trim()) return
    try { new URL(shareLink) } catch { setShareStatus('url_invalida'); return }
    const mesAtual = new Date().toISOString().slice(0, 7)
    const { error } = await supabase.from('share_submissions').insert({
      user_id: user.id,
      link: shareLink.trim(),
      mes_referencia: mesAtual
    })
    if (error?.code === '23505') {
      setShareStatus('ja_enviou')
    } else if (error) {
      setShareStatus('erro')
    } else {
      setShareStatus('pendente')
      setShareLink('')
    }
  }

  return (
    <section className="perfil-page">
      <div className="perfil-header">
        <div className="perfil-avatar">{perfil?.nome?.[0]?.toUpperCase() || '...'}</div>
        <h1 className="perfil-nome">{perfil?.nome || '...'}</h1>
        <p className="perfil-email">{user.email}</p>
      </div>

      <h2 className="perfil-section-title">ACHIEVEMENTS</h2>
      <div className="perfil-achievements">
          {todosAchievements.map(a => {
            const unlocked = desbloqueados.includes(a.id)
            const secretoNaoVisto = a.secreto && !unlocked
            return (
              <div
                key={a.id}
                className={`perfil-achievement-card ${unlocked ? 'perfil-achievement-card--unlocked' : 'perfil-achievement-card--locked'}`}
              >
                <div className="perfil-achievement-icone">{a.icone}</div>
                <div className="perfil-achievement-nome">{secretoNaoVisto ? '???' : a.nome}</div>
                <div className="perfil-achievement-desc">{secretoNaoVisto ? 'Achievement secreto' : a.descricao}</div>
                <div className={`perfil-achievement-status ${unlocked ? 'status-unlocked' : 'status-locked'}`}>
                  {unlocked ? '✓ DESBLOQUEADO' : '🔒 BLOQUEADO'}
                </div>
              </div>
            )
          })}
      </div>

      <div className="perfil-share-section">
        <h3 className="perfil-section-title">CONQUISTA MENSAL</h3>
        <p className="perfil-share-desc">
          Compartilhou o LDI no X, YouTube, TikTok ou qualquer rede esse mês?
          Cole o link da publicação para auditoria e ganhe o achievement 🔥
        </p>

        {shareStatus === 'aprovado' && (
          <div className="perfil-share-status aprovado">✓ Compartilhamento aprovado este mês. Volte no mês que vem!</div>
        )}
        {shareStatus === 'pendente' && (
          <div className="perfil-share-status pendente">⏳ Link enviado — em análise. Você será notificado quando aprovado.</div>
        )}
        {shareStatus === 'rejeitado' && (
          <div className="perfil-share-status rejeitado">✗ Link rejeitado. O post não foi encontrado ou não menciona o LDI.</div>
        )}
        {shareStatus === 'ja_enviou' && (
          <div className="perfil-share-status pendente">Você já enviou um link este mês.</div>
        )}

        {(!shareStatus || shareStatus === 'rejeitado') && (
          <div className="perfil-share-form">
            <input
              type="url"
              placeholder="https://x.com/seuperfil/status/..."
              value={shareLink}
              onChange={e => setShareLink(e.target.value)}
              className="perfil-share-input"
            />
            <button onClick={enviarShare} className="perfil-share-btn">ENVIAR PARA ANÁLISE</button>
          </div>
        )}
      </div>

      <button className="perfil-logout" onClick={logout}>SAIR</button>
    </section>
  )
}
