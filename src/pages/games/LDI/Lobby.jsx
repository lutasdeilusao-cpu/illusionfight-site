import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { useEventos } from '../../../context/EventosContext'
import { useLendasStore, listarSaves, apagarSave } from './store/useLendasStore'
import { VEIAS, veiaPorId, romano } from './data/veias'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import './Lendas.css'

export default function Lobby() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { registrarEvento } = useEventos()
  const { novoJogo, carregar } = useLendasStore()
  const [saves, setSaves] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [nome, setNome] = useState('')
  const [criando, setCriando] = useState(false)

  useEffect(() => {
    if (!user) return
    setCarregando(true)
    listarSaves(user.id).then(d => { setSaves(d); setCarregando(false) })
  }, [user])

  const comecar = e => {
    e.preventDefault()
    if (!nome.trim()) return
    novoJogo(nome, user?.id || null)
    registrarEvento('lendas_personagem', 'Criou personagem em Lendas', 1)
    navigate('/games/ldi/game')
  }

  const continuar = s => { carregar(s, user.id); navigate('/games/ldi/game') }

  const apagar = async s => {
    if (!window.confirm(t('games.ldi.lobby.apagar_confirmar'))) return
    if (await apagarSave(s.id)) setSaves(l => l.filter(x => x.id !== s.id))
  }

  return (
    <div className="ld-page ld-lobby">
      <p className="if-eyebrow">{t('games.ldi.sub')}</p>
      <h1 className="ld-lobby__titulo">{t('games.ldi.titulo')}</h1>
      <p className="ld-lobby__desc">{t('games.ldi.lobby.desc')}</p>

      {criando ? (
        <form className="if-panel ld-lobby__novo" onSubmit={comecar}>
          <label className="if-eyebrow" htmlFor="ld-nome">{t('games.ldi.lobby.nome_label')}</label>
          <input id="ld-nome" className="if-field" value={nome} maxLength={24} autoFocus
            placeholder={t('games.ldi.lobby.nome_placeholder')} onChange={e => setNome(e.target.value)} />
          <button type="submit" className="if-btn if-btn--primary" disabled={!nome.trim()}>{t('games.ldi.lobby.comecar')}</button>
          <button type="button" className="ld-lobby__link" onClick={() => setCriando(false)}>{t('games.ldi.lobby.cancelar')}</button>
        </form>
      ) : (
        <button type="button" className="if-btn if-btn--primary ld-lobby__cta" onClick={() => setCriando(true)}>{t('games.ldi.lobby.novo')}</button>
      )}

      {!user && (
        <div className="if-panel ld-lobby__guest">
          <b>{t('games.ldi.lobby.guest_titulo')}</b>
          <p>{t('games.ldi.lobby.guest_desc')}</p>
          <Link to="/cadastro">{t('games.ldi.lobby.guest_criar_conta')}</Link>
        </div>
      )}

      {user && (
        <section className="ld-lobby__saves">
          <p className="if-eyebrow">{t('games.ldi.lobby.suas')}</p>
          {carregando && <p className="ld-lobby__vazio">{t('games.ldi.lobby.carregando')}</p>}
          {!carregando && !saves.length && <p className="ld-lobby__vazio">{t('games.ldi.lobby.vazio')}</p>}
          {saves.map(s => {
            const v = veiaPorId(s.veia)
            return (
              <article key={s.id} className="if-panel ld-save" style={v ? { '--veia-cor': v.cor } : undefined}>
                <div className="ld-save__info">
                  <b>{s.nome}</b>
                  <small>{v ? `${v.icone} ${t(`games.ldi.veias.${v.id}.nome`)} ${romano(s.nivel)}` : t('games.ldi.lobby.sem_veia')} · {t('games.ldi.jogo.ato', { n: romano(s.ato) })}</small>
                  {s.status !== 'ativo' && <small className="ld-save__status">{t(`games.ldi.lobby.status_${s.status}`)}</small>}
                </div>
                {s.status === 'ativo' && <button type="button" className="if-btn if-btn--ghost" onClick={() => continuar(s)}>{t('games.ldi.lobby.continuar')}</button>}
                <button type="button" className="ld-lobby__link" onClick={() => apagar(s)}>{t('games.ldi.lobby.apagar')}</button>
              </article>
            )
          })}
        </section>
      )}

      <section className="ld-lobby__veias">
        <p className="if-eyebrow">{t('games.ldi.lobby.veias_titulo')}</p>
        <p className="ld-lobby__desc">{t('games.ldi.lobby.veias_desc')}</p>
        <ul>
          {VEIAS.map(v => (
            <li key={v.id} style={{ '--veia-cor': v.cor }}>
              <span>{v.icone}</span>
              <b>{t(`games.ldi.veias.${v.id}.nome`)}</b>
              <small>{t(`games.ldi.veias.${v.id}.area`)}</small>
            </li>
          ))}
        </ul>
      </section>

      <BackToGamesBtn />
    </div>
  )
}
