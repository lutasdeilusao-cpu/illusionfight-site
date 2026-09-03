import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { trackEvent } from '../../lib/analytics'
import './Login.css'

/* ══════════════════════════════════════════════════════════════
   CADASTRO — o mais simples possível
   Nome, email, senha. Sem país, sem telefone, sem confirmar senha,
   sem confirmação de email. O perfil é criado pela trigger do banco
   (handle_new_auth_user); o frontend não depende disso pra seguir.

   Regra de ouro daqui pra frente: NADA pode deixar o botão travado
   em "Cadastrando...". Todo caminho passa pelo finally.
   ══════════════════════════════════════════════════════════════ */

// sessionStorage lança em Safari privado / storage cheio. Nunca deixar
// isso derrubar o cadastro — foi o que travou a conta do teste real.
const guardarPendente = (dados) => {
  try { sessionStorage.setItem('ldi-cadastro-pendente', JSON.stringify(dados)) } catch { /* segue sem */ }
}

// Promise que rejeita depois de N ms — evita o "carregando pra sempre"
// se a rede engasgar no meio do signUp.
const comTimeout = (promise, ms, rotulo) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout:${rotulo}`)), ms)),
])

export default function Cadastro() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [precisaConfirmar, setPrecisaConfirmar] = useState(false)

  const set = (campo) => (e) => setForm(s => ({ ...s, [campo]: e.target.value }))

  useEffect(() => { trackEvent('signup_view') }, [])

  const validar = () => {
    if (!form.nome.trim()) return t('site.cadastro.nome_obrigatorio')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t('site.cadastro.email_invalido')
    if (form.senha.length < 6) return t('site.cadastro.senha_curta')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    const erroValidacao = validar()
    if (erroValidacao) { setErro(erroValidacao); return }

    setCarregando(true)
    trackEvent('signup_start')

    const email = form.email.trim().toLowerCase()
    const dadosPerfil = { nome: form.nome.trim() }
    guardarPendente(dadosPerfil)

    try {
      const { data, error } = await comTimeout(
        supabase.auth.signUp({
          email,
          password: form.senha,
          options: { emailRedirectTo: 'https://illusionfight.com/login', data: dadosPerfil },
        }),
        20000,
        'signup',
      )

      if (error) {
        // "User already registered" / "already been registered"
        if (/already\s*(been\s*)?registered|exists/i.test(error.message || '')) {
          trackEvent('signup_error', { error_code: 'email_taken' })
          setErro(t('site.cadastro.email_ja_existe'))
          return
        }
        trackEvent('signup_error', { error_code: error.code || 'signup_failed' })
        setErro(error.message || t('site.cadastro.erro_generico'))
        return
      }

      // Supabase devolve um "usuário" sem identities quando o email já existe
      // e a confirmação está ligada. Trata como email já cadastrado.
      const identities = data?.user?.identities
      if (Array.isArray(identities) && identities.length === 0) {
        trackEvent('signup_error', { error_code: 'email_taken' })
        setErro(t('site.cadastro.email_ja_existe'))
        return
      }

      trackEvent('signup_requested')

      // Confirmação de email está OFF → a sessão vem junto. Segue direto.
      if (data?.session?.user) {
        trackEvent('signup_complete')
        navigate('/perfil')
        return
      }

      // Sem sessão: ou a confirmação foi religada no painel, ou o signUp
      // não persistiu. Tenta logar na hora — se a confirmação estiver OFF,
      // isto funciona e o cadastro termina sem tela intermediária.
      const { data: loginData, error: loginError } = await comTimeout(
        supabase.auth.signInWithPassword({ email, password: form.senha }),
        15000,
        'login',
      )

      if (loginData?.session?.user) {
        trackEvent('signup_complete', { via: 'auto_login' })
        navigate('/perfil')
        return
      }

      // Só aqui é confirmação de email de verdade.
      trackEvent('signup_confirmation_required')
      if (loginError && !/email not confirmed/i.test(loginError.message || '')) {
        // login falhou por outro motivo, mas a conta foi criada — mostra a
        // tela de confirmação mesmo assim, é o caminho mais seguro.
      }
      setPrecisaConfirmar(true)
    } catch (err) {
      // Timeout, exceção de rede, storage — qualquer coisa cai aqui.
      trackEvent('signup_error', { error_code: String(err?.message || 'exception').slice(0, 40) })
      setErro(t('site.cadastro.erro_generico'))
    } finally {
      setCarregando(false)
    }
  }

  if (precisaConfirmar) {
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
          <label className="auth-label">{t('site.cadastro.nome')}
            <input type="text" className="auth-input" value={form.nome} onChange={set('nome')} autoComplete="name" required />
          </label>
          <label className="auth-label">{t('site.cadastro.email')}
            <input type="email" className="auth-input" value={form.email} onChange={set('email')} autoComplete="email" required />
          </label>
          <label className="auth-label">{t('site.cadastro.senha')}
            <input type="password" className="auth-input" value={form.senha} onChange={set('senha')} autoComplete="new-password" minLength={6} required />
          </label>
          <button className="auth-btn" type="submit" disabled={carregando}>
            {carregando ? t('site.cadastro.cadastrando') : t('site.cadastro.cadastrar')}
          </button>
          <p className="auth-privacidade-aviso">{t('site.cadastro.privacidade_aviso')}</p>
        </form>
        <p className="auth-link-text">
          {t('site.cadastro.ja_tem_conta')} <Link to="/login" className="auth-link">{t('site.cadastro.entrar_link')}</Link>
        </p>
      </div>
    </section>
  )
}
