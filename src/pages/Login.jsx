import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Login.css'

export default function Login() {
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
        <h1 className="auth-titulo">ENTRAR</h1>
        <p className="auth-sub">Acesse sua conta no SDR</p>
        {erro && <p className="auth-erro">{erro}</p>}
        <form onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input type="email" className="auth-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label className="auth-label">
            Senha
            <input type="password" className="auth-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          <button className="auth-btn" type="submit" disabled={carregando}>
            {carregando ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>
        <p className="auth-link-text">
          Não tem conta? <Link to="/cadastro" className="auth-link">Cadastre-se</Link>
        </p>
      </div>
    </section>
  )
}
