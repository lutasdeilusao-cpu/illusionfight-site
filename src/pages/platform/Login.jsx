import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { trackEvent } from '../../lib/analytics'
import './Login.css'

// Recuperação de senha (02/10/2026): o painel mostrou alguém errando a senha
// 2x e indo embora — o site não tinha "esqueci minha senha". Três modos na
// mesma página: entrar · pedir o link · definir a senha nova (quem volta pelo
// link do e-mail cai aqui com #type=recovery e o Supabase abre a sessão).
// O link volta pra /login de propósito: é a URL que já está liberada no Auth.
const URL_VOLTA = 'https://illusionfight.com/login'

export default function Login() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [modo, setModo] = useState(() => (typeof location !== 'undefined' && /type=recovery/.test(location.hash) ? 'nova_senha' : 'entrar'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [errouSenha, setErrouSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)

  // o Supabase avisa quando a sessão veio de um link de recuperação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(evento => {
      if (evento === 'PASSWORD_RECOVERY') setModo('nova_senha')
    })
    return () => subscription.unsubscribe()
  }, [])

  const trocarModo = novo => { setModo(novo); setErro(''); setAviso('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    trackEvent('login_start', { method: 'email' })
    try {
      const { error } = await Promise.race([
        supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 20000)),
      ])
      if (error) {
        trackEvent('login_error', { method: 'email', error_type: 'authentication' })
        if (/invalid login credentials/i.test(error.message || '')) {
          setErro(t('site.login.credenciais_invalidas'))
          setErrouSenha(true)
        } else {
          setErro(error.message || t('site.login.erro_generico'))
        }
        return
      }
      trackEvent('login', { method: 'email' })
      navigate('/perfil')
    } catch {
      // Timeout / erro de rede: o login pode ter dado certo mesmo assim — a
      // sessão é gravada ANTES da promise resolver. Confere antes de acusar erro.
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          trackEvent('login', { method: 'email' })
          navigate('/perfil')
          return
        }
      } catch { /* segue pro erro */ }
      trackEvent('login_error', { method: 'email', error_type: 'exception' })
      setErro(t('site.login.erro_generico'))
    } finally {
      setCarregando(false)
    }
  }

  const pedirLink = async (e) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: URL_VOLTA })
    setCarregando(false)
    trackEvent('password_reset_request', { ok: !error })
    if (error) { setErro(t('site.login.erro_generico')); return }
    // mesma mensagem existindo a conta ou não (não entrega quem tem cadastro)
    setAviso(t('site.login.link_enviado'))
  }

  const salvarSenha = async (e) => {
    e.preventDefault()
    setErro('')
    if (password.length < 6) { setErro(t('site.login.senha_curta')); return }
    setCarregando(true)
    const { error } = await supabase.auth.updateUser({ password })
    setCarregando(false)
    trackEvent('password_reset_done', { ok: !error })
    if (error) { setErro(t('site.login.erro_generico')); return }
    navigate('/perfil')
  }

  const campoEmail = (
    <label className="auth-label">
      {t('site.login.email')}
      <input type="email" className="auth-input" value={email} onChange={e => setEmail(e.target.value)} required />
    </label>
  )

  return (
    <section className="auth-page">
      <Helmet><title>{`${t('site.login.titulo')} — Illusion Fight`}</title></Helmet>
      <div className="auth-card">
        {modo === 'entrar' && (
          <>
            <h1 className="auth-titulo">{t('site.login.titulo')}</h1>
            <p className="auth-sub">{t('site.login.subtitulo')}</p>
            {erro && (
              <p className="auth-erro">
                {erro}
                {errouSenha && <> {' '}<button type="button" className="auth-esqueci auth-esqueci--erro" onClick={() => trocarModo('recuperar')}>{t('site.login.esqueci_erro')}</button></>}
              </p>
            )}
            <form data-analytics-id="login_form" onSubmit={handleSubmit}>
              {campoEmail}
              <label className="auth-label">
                {t('site.login.senha')}
                <input type="password" className="auth-input" value={password} onChange={e => setPassword(e.target.value)} required />
              </label>
              <button type="button" className="auth-esqueci" onClick={() => trocarModo('recuperar')}>{t('site.login.esqueci')}</button>
              <button className="auth-btn" type="submit" disabled={carregando}>
                {carregando ? t('site.login.entrando') : t('site.login.entrar')}
              </button>
            </form>
            <p className="auth-link-text">
              {t('site.login.sem_conta')} <Link to="/cadastro" className="auth-link">{t('site.login.cadastrar_link')}</Link>
            </p>
          </>
        )}

        {modo === 'recuperar' && (
          <>
            <h1 className="auth-titulo">{t('site.login.recuperar_titulo')}</h1>
            <p className="auth-sub">{t('site.login.recuperar_sub')}</p>
            {erro && <p className="auth-erro">{erro}</p>}
            {aviso ? <p className="auth-sucesso">{aviso}</p> : (
              <form data-analytics-id="reset_form" onSubmit={pedirLink}>
                {campoEmail}
                <button className="auth-btn" type="submit" disabled={carregando}>
                  {carregando ? t('site.login.enviando') : t('site.login.enviar_link')}
                </button>
              </form>
            )}
            <p className="auth-link-text">
              <button type="button" className="auth-esqueci" onClick={() => trocarModo('entrar')}>{t('site.login.voltar_entrar')}</button>
            </p>
          </>
        )}

        {modo === 'nova_senha' && (
          <>
            <h1 className="auth-titulo">{t('site.login.nova_senha_titulo')}</h1>
            <p className="auth-sub">{t('site.login.nova_senha_sub')}</p>
            {erro && <p className="auth-erro">{erro}</p>}
            <form data-analytics-id="new_password_form" onSubmit={salvarSenha}>
              <label className="auth-label">
                {t('site.login.nova_senha')}
                <input type="password" className="auth-input" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required autoComplete="new-password" />
              </label>
              <button className="auth-btn" type="submit" disabled={carregando}>
                {carregando ? t('site.login.enviando') : t('site.login.salvar_senha')}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  )
}
