import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useLanguage } from '../../../context/LanguageContext'
import { trackEvent } from '../../../lib/analytics'
import concierge from '../../../assets/images/creators/neoguide-concierge.webp'
import NeoGuideFala from './NeoGuideFala'
import './CreatorsPorta.css'

const CONTATO = 'lutasdeilusao@gmail.com'
const ITENS = ['livros', 'webtoon', 'games', 'artes', 'neoguide']

/** Entrada da área: quem não entrou vê a porta e o login;
 *  quem entrou sem a tag vê o aviso de convite (modo "sem_convite"). */
export default function CreatorsPorta({ modo = 'login', email: emailLogado, onSair }) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    trackEvent('login_start', { method: 'email', origem: 'creators' })
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha })
    setEnviando(false)
    if (error) {
      setErro(/invalid login credentials/i.test(error.message || '') ? t('creators.porta.erro_credenciais') : t('creators.porta.erro_generico'))
      return
    }
    trackEvent('login', { method: 'email', origem: 'creators' })
  }

  return (
    <section className="cr-porta">
      <div className="cr-porta__arte">
        <img src={concierge} alt={t('creators.neoguide.alt')} width="720" height="1260" />
        <div className="cr-porta__veu" />
        <div className="cr-porta__titulo">
          <span className="if-eyebrow">{t('creators.porta.eyebrow')}</span>
          <h1>{t('creators.porta.titulo')}</h1>
          <p>{t('creators.porta.sub')}</p>
        </div>
      </div>

      <div className="cr-porta__corpo">
        <NeoGuideFala nome={t('creators.neoguide.nome')} texto={t(modo === 'login' ? 'creators.porta.fala' : 'creators.porta.fala_sem_convite')} />

        <ul className="cr-porta__lista if-stagger">
          {ITENS.map((id, i) => (
            <li key={id} className="cr-porta__item">
              <span className="cr-porta__num">{String(i + 1).padStart(2, '0')}</span>
              <span>{t(`creators.porta.itens.${id}`)}</span>
            </li>
          ))}
        </ul>

        {modo === 'login' ? (
          <form className="cr-porta__form if-panel" onSubmit={entrar}>
            <span className="if-eyebrow">{t('creators.porta.form_titulo')}</span>
            <label className="if-label" htmlFor="cr-email">{t('creators.porta.email')}</label>
            <input id="cr-email" className="if-field" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
            <label className="if-label" htmlFor="cr-senha">{t('creators.porta.senha')}</label>
            <input id="cr-senha" className="if-field" type="password" autoComplete="current-password" required value={senha} onChange={e => setSenha(e.target.value)} />
            {erro && <p className="cr-porta__erro" role="alert">{erro}</p>}
            <button type="submit" className="if-btn if-btn--primary cr-porta__entrar" disabled={enviando}>
              {enviando ? t('creators.porta.entrando') : t('creators.porta.entrar')}
            </button>
            <p className="cr-porta__convite">
              {t('creators.porta.sem_conta')} <a href={`mailto:${CONTATO}?subject=Creator%20access`}>{CONTATO}</a>
            </p>
          </form>
        ) : (
          <div className="cr-porta__form if-panel">
            <span className="if-eyebrow">{t(modo === 'expirado' ? 'creators.porta.expirado_titulo' : 'creators.porta.sem_convite_titulo')}</span>
            <p className="cr-porta__aviso">{t(modo === 'expirado' ? 'creators.porta.expirado' : 'creators.porta.sem_convite', { email: emailLogado || '' })}</p>
            <a className="if-btn if-btn--amber cr-porta__entrar" href={`mailto:${CONTATO}?subject=Creator%20access&body=${encodeURIComponent(emailLogado || '')}`}>
              {t('creators.porta.pedir_convite')}
            </a>
            <button type="button" className="if-btn if-btn--ghost" onClick={onSair}>{t('creators.porta.trocar_conta')}</button>
          </div>
        )}
      </div>
    </section>
  )
}
