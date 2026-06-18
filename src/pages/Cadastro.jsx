import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useAchievements } from '../context/AchievementsContext'
import { useLanguage } from '../context/LanguageContext'
import { PAISES } from '../data/paises'
import './Login.css'

export default function Cadastro() {
  const { t, locale } = useLanguage()
  const { carregarPerfil } = useAuth()
  const { migrarLocalParaSupabase, desbloquear } = useAchievements()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', pais: '', senha: '', confirmarSenha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const set = (campo) => (e) => setForm(s => ({ ...s, [campo]: e.target.value }))

  const validar = () => {
    if (!form.pais) return t('site.cadastro.pais_obrigatorio')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t('site.cadastro.email_invalido')
    if (form.telefone.replace(/\D/g, '').length < 10) return t('site.cadastro.telefone_invalido')
    if (form.senha.length < 6) return t('site.cadastro.senha_curta')
    if (form.senha !== form.confirmarSenha) return t('site.cadastro.senhas_diferem')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
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
      const { error: perfilError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, nome: form.nome, telefone: form.telefone, country_code: form.pais })
      if (perfilError) {
        console.error('Erro perfil:', perfilError)
        setErro(t('site.cadastro.erro_perfil'))
        setCarregando(false)
        return
      }
      await supabase.from('user_achievements').upsert({
        user_id: data.user.id,
        achievement_id: 'recrutado'
      }, { onConflict: 'user_id,achievement_id' })
      await migrarLocalParaSupabase(data.user.id)
      await desbloquear('recrutado')
      await carregarPerfil(data.user.id)
    }
    setCarregando(false)
    navigate('/')
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1 className="auth-titulo">{t('site.cadastro.titulo')}</h1>
        <p className="auth-sub">{t('site.cadastro.subtitulo')}</p>
        {erro && <p className="auth-erro">{erro}</p>}
        <form onSubmit={handleSubmit}>
          <label className="auth-label">{t('site.cadastro.nome')}<input type="text" className="auth-input" value={form.nome} onChange={set('nome')} required /></label>
          <label className="auth-label">{t('site.cadastro.email')}<input type="email" className="auth-input" value={form.email} onChange={set('email')} required /></label>
          <label className="auth-label">{t('site.cadastro.telefone')}<input type="tel" className="auth-input" value={form.telefone} onChange={set('telefone')} required /></label>
          <label className="auth-label">{t('site.cadastro.pais')}
            <select className="auth-input" value={form.pais} onChange={set('pais')} required>
              <option value="">{t('site.cadastro.pais_selecione')}</option>
              {PAISES.map(p => (
                <option key={p.code} value={p.code}>{p[locale] || p.pt}</option>
              ))}
            </select>
          </label>
          <label className="auth-label">{t('site.cadastro.senha')}<input type="password" className="auth-input" value={form.senha} onChange={set('senha')} required /></label>
          <label className="auth-label">{t('site.cadastro.confirmar_senha')}<input type="password" className="auth-input" value={form.confirmarSenha} onChange={set('confirmarSenha')} required /></label>
          <button className="auth-btn" type="submit" disabled={carregando}>{carregando ? t('site.cadastro.cadastrando') : t('site.cadastro.cadastrar')}</button>
          <p className="auth-privacidade-aviso">
            {t('site.cadastro.privacidade_aviso')}
          </p>
        </form>
        <p className="auth-link-text">{t('site.cadastro.ja_tem_conta')} <Link to="/login" className="auth-link">{t('site.cadastro.entrar_link')}</Link></p>
      </div>
    </section>
  )
}
