import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAchievements } from '../context/AchievementsContext'
import './Login.css'

export default function Cadastro() {
  const { migrarLocalParaSupabase, desbloquear } = useAchievements()
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '', confirmarSenha: '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)

  const set = (campo) => (e) => setForm(s => ({ ...s, [campo]: e.target.value }))

  const validar = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email inválido'
    if (form.telefone.replace(/\D/g, '').length < 10) return 'Telefone deve ter no mínimo 10 dígitos'
    if (form.senha.length < 6) return 'Senha deve ter no mínimo 6 caracteres'
    if (form.senha !== form.confirmarSenha) return 'Senhas não conferem'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setSucesso('')
    const erroValidacao = validar()
    if (erroValidacao) { setErro(erroValidacao); return }
    setCarregando(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) { setErro(error.message); setCarregando(false); return }
    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, nome: form.nome, telefone: form.telefone })
      await migrarLocalParaSupabase(data.user.id)
      await desbloquear('recrutado')
    }
    setCarregando(false)
    setSucesso('Verifique seu email para confirmar o cadastro.')
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1 className="auth-titulo">CADASTRO</h1>
        <p className="auth-sub">Crie sua conta no SDR</p>
        {erro && <p className="auth-erro">{erro}</p>}
        {sucesso && <p className="auth-sucesso">{sucesso}</p>}
        {!sucesso && (
          <form onSubmit={handleSubmit}>
            <label className="auth-label">Nome<input type="text" className="auth-input" value={form.nome} onChange={set('nome')} required /></label>
            <label className="auth-label">Email<input type="email" className="auth-input" value={form.email} onChange={set('email')} required /></label>
            <label className="auth-label">Telefone<input type="tel" className="auth-input" value={form.telefone} onChange={set('telefone')} required /></label>
            <label className="auth-label">Senha<input type="password" className="auth-input" value={form.senha} onChange={set('senha')} required /></label>
            <label className="auth-label">Confirmar Senha<input type="password" className="auth-input" value={form.confirmarSenha} onChange={set('confirmarSenha')} required /></label>
            <button className="auth-btn" type="submit" disabled={carregando}>{carregando ? 'CADASTRANDO...' : 'CADASTRAR'}</button>
          </form>
        )}
        <p className="auth-link-text">Já tem conta? <Link to="/login" className="auth-link">Entrar</Link></p>
      </div>
    </section>
  )
}
