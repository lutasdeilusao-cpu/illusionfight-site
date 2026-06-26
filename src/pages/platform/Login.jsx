import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import './Login.css'

export default function Login() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setCarregando(false)
    if (error) {
      setErro(error.message)
    } else {
      navigate('/perfil')
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1 className="auth-titulo">{t('site.login.titulo')}</h1>
        <p className="auth-sub">{t('site.login.subtitulo')}</p>
        {erro && <p className="auth-erro">{erro}</p>}
        <form onSubmit={handleSubmit}>
          <label className="auth-label">
            {t('site.login.email')}
            <input type="email" className="auth-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label className="auth-label">
            {t('site.login.senha')}
            <input type="password" className="auth-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          <button className="auth-btn" type="submit" disabled={carregando}>
            {carregando ? t('site.login.entrando') : t('site.login.entrar')}
          </button>
        </form>
        <p className="auth-link-text">
          {t('site.login.sem_conta')} <Link to="/cadastro" className="auth-link">{t('site.login.cadastrar_link')}</Link>
        </p>
      </div>
    </section>
  )
}
