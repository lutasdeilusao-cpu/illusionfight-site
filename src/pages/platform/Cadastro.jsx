import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import { ensureUserProfile } from '../../lib/profileProvisioning'
import { useLanguage } from '../../context/LanguageContext'
import { PAISES } from '../../data/paises'
import { trackEvent } from '../../lib/analytics'
import './Login.css'

export default function Cadastro() {
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  const [cadastroConcluido, setCadastroConcluido] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', pais: '', senha: '', confirmarSenha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const set = (campo) => (e) => setForm(s => ({ ...s, [campo]: e.target.value }))

  useEffect(() => { trackEvent('signup_view') }, [])

  const validar = () => {
    if (!form.pais) return t('site.cadastro.pais_obrigatorio')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t('site.cadastro.email_invalido')
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
    trackEvent('signup_start', { pais: form.pais })
    const dadosPerfil = { nome: form.nome, pais: form.pais }
    sessionStorage.setItem('ldi-cadastro-pendente', JSON.stringify(dadosPerfil))
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: {
        emailRedirectTo: 'https://illusionfight.com/login',
        data: dadosPerfil,
      }
    })
    if (error) {
      trackEvent('signup_error', { error_code: error.code || 'signup_failed' })
      setErro(error.message)
      setCarregando(false)
      return
    }
    trackEvent('signup_requested', { pais: form.pais })

    if (data.session?.user) {
      const { error: profileError } = await ensureUserProfile(data.session.user, dadosPerfil)
      if (profileError) {
        trackEvent('signup_error', { error_code: 'profile_creation_failed' })
        console.error('[Cadastro] conta criada; perfil será recuperado na sessão:', profileError)
      }
      sessionStorage.removeItem('ldi-cadastro-pendente')
      trackEvent('signup_complete', { pais: form.pais })
      setCarregando(false)
      navigate('/perfil')
      return
    }

    setCarregando(false)
    trackEvent('signup_confirmation_required', { pais: form.pais })
    setCadastroConcluido(true)
  }

  if (cadastroConcluido) {
    return (
      <section className="auth-page">
        <Helmet><title>{`${t('site.cadastro.confirme_titulo')} — Illusion Fight`}</title></Helmet>
        <div className="auth-card">
          <h1 className="auth-titulo">{t('site.cadastro.confirme_titulo')}</h1>
          <p className="auth-sub">{t('site.cadastro.confirme_mensagem')}</p>
          <p className="auth-link-text">
            <Link to="/login" className="auth-link">{t('site.cadastro.entrar_link')}</Link>
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="auth-page">
      <Helmet><title>{`${t('site.cadastro.titulo')} — Illusion Fight`}</title></Helmet>
      <div className="auth-card">
        <h1 className="auth-titulo">{t('site.cadastro.titulo')}</h1>
        <p className="auth-sub">{t('site.cadastro.subtitulo')}</p>
        {erro && <p className="auth-erro">{erro}</p>}
        <form onSubmit={handleSubmit}>
          <label className="auth-label">{t('site.cadastro.nome')}<input type="text" className="auth-input" value={form.nome} onChange={set('nome')} required /></label>
          <label className="auth-label">{t('site.cadastro.email')}<input type="email" className="auth-input" value={form.email} onChange={set('email')} required /></label>
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
