import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import './Admin.css'

const ADMIN_EMAIL = 'isaiasgamedev@gmail.com'

export default function Admin() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) carregarSubmissoes()
  }, [user])

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <section className="admin-page">
        <div className="admin-bloqueado">{t('admin.titulo')} - Acesso negado.</div>
      </section>
    )
  }

  async function carregarSubmissoes() {
    const { data } = await supabase
      .from('share_submissions')
      .select('*, profiles(nome)')
      .eq('status', 'pendente')
      .order('criado_em', { ascending: false })
    setSubmissions(data || [])
  }

  async function aprovar(id, userId) {
    await supabase.from('share_submissions').update({
      status: 'aprovado',
      auditado_em: new Date().toISOString()
    }).eq('id', id)
    await supabase.from('user_achievements').upsert({
      user_id: userId,
      achievement_id: 'divulgador'
    }, { onConflict: 'user_id,achievement_id' })
    carregarSubmissoes()
  }

  async function rejeitar(id) {
    await supabase.from('share_submissions').update({
      status: 'rejeitado',
      auditado_em: new Date().toISOString()
    }).eq('id', id)
    carregarSubmissoes()
  }

  return (
    <section className="admin-page">
      <h1 className="admin-titulo">AUDITORIA — COMPARTILHAMENTOS PENDENTES</h1>
      <p className="admin-contador">{submissions.length} pendentes</p>
      {submissions.map(s => (
        <div key={s.id} className="admin-card">
          <div className="admin-card-info">
            <span className="admin-nome">{s.profiles?.nome || '—'}</span>
            <span className="admin-mes">{s.mes_referencia}</span>
            <a href={s.link} target="_blank" rel="noreferrer" className="admin-link">{s.link}</a>
            <span className="admin-data">{new Date(s.criado_em).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="admin-acoes">
            <button className="admin-btn-aprovar" onClick={() => aprovar(s.id, s.user_id)}>APROVAR</button>
            <button className="admin-btn-rejeitar" onClick={() => rejeitar(s.id)}>REJEITAR</button>
          </div>
        </div>
      ))}
      {submissions.length === 0 && <p className="admin-vazio">Nenhuma submissão pendente.</p>}
    </section>
  )
}
