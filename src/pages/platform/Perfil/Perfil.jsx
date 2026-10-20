import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { useDix } from '../../../context/DixContext'
import PerfilConquistas from './abas/PerfilConquistas'
import PerfilGangues from './abas/PerfilGangues'
import PerfilColecao from './abas/PerfilColecao'
import PerfilConta from './abas/PerfilConta'
import PerfilTamagoshi from './abas/PerfilTamagoshi'
import PerfilProgresso from './PerfilProgresso'
import { ehAssinante } from '../../../lib/releaseAccess'
import './Perfil.css'

const TIER_CONFIG = {
  free: { labelKey: 'site.perfil.tier_ranqueado', cor: '#555', bordaCor: '#333' },
  elite: { labelKey: 'site.perfil.tier_elite', cor: '#00B4D8', bordaCor: '#00B4D8' },
}

const SECOES = [
  { id: 'colecao',    icone: '🃏', labelKey: 'site.perfil.abas_colecao' },
  { id: 'tamagoshi',  icone: '🥚', labelKey: 'site.perfil.abas_tamagoshi', soAdmin: true }, // jogo fora da leva atual
  { id: 'gangues',    icone: '🥊', labelKey: 'site.perfil.abas_gangues' },
  { id: 'conquistas', icone: '🏆', labelKey: 'site.perfil.abas_conquistas' },
  { id: 'conta',      icone: '⚙️', labelKey: 'site.perfil.abas_conta' },
]

export default function Perfil() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user, perfil, logout, carregando } = useAuth()
  const isAdmin = perfil?.is_admin === true
  const { saldo: dix } = useDix()

  const [abertos, setAbertos] = useState({
    colecao: false,
    tamagoshi: false,
    arena: false,
    conquistas: false,
    conta: false,
  })

  const toggle = (secao) => setAbertos(prev => ({ ...prev, [secao]: !prev[secao] }))

  const tier = ehAssinante(perfil) ? 'elite' : 'free'
  const tierCfg = TIER_CONFIG[tier]

  useEffect(() => {
    if (!user && !carregando) navigate('/login')
  }, [user, carregando])

  if (carregando) return (
    <section className="perfil-page">
      <p className="perfil-carregando">{t('site.leaderboard.carregando')}</p>
    </section>
  )
  if (!user) return null

  return (
    <section className="perfil-page">
      {/* Header fixo */}
      <div className="perfil-header">
        <div className="perfil-header-inner">
          <div className="perfil-avatar"
            style={{ background: `hsl(${(perfil?.nome || 'U').length * 47}, 55%, 35%)` }}>
            {perfil?.nome?.trim()?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="perfil-header-info">
            {/* Só o primeiro nome — o nome completo, se houver, aparece na aba Conta. */}
            <h1 className="perfil-nome">{perfil?.nome?.trim().split(/\s+/)[0] || '...'}</h1>
            <p className="perfil-email">{user.email}</p>
            <span className="perfil-tier-badge"
              style={{ color: tierCfg.cor, borderColor: tierCfg.bordaCor + '44', background: tierCfg.cor + '11' }}>
              ★ {t(tierCfg.labelKey)}
            </span>
          </div>
          <div className="perfil-contadores">
            <div className="perfil-contador">
              <span className="perfil-contador-valor">{dix}</span>
              <span className="perfil-contador-label">💰 DIX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progresso */}
      <PerfilProgresso />

      {/* Seções colapsáveis */}
      <div className="perfil-secoes">
        {SECOES.filter(secao => !secao.soAdmin || isAdmin).map((secao) => {
          const aberta = abertos[secao.id]
          return (
            <div key={secao.id} className="perfil-secao">
              <button
                className="perfil-secao-header"
                onClick={() => toggle(secao.id)}
              >
                <span className="perfil-secao-titulo">
                  {secao.icone} {t(secao.labelKey)}
                </span>
                <span className={`perfil-secao-seta${aberta ? '' : ' fechado'}`}>
                  {aberta ? '▼' : '►'}
                </span>
              </button>
              <div className={`perfil-secao-corpo${aberta ? '' : ' fechado'}`}>
                <div className="perfil-secao-conteudo">
                  {secao.id === 'conquistas' && <PerfilConquistas />}
                  {secao.id === 'gangues' && <PerfilGangues userId={user.id} />}
                  {secao.id === 'colecao' && <PerfilColecao userId={user.id} />}
                  {secao.id === 'tamagoshi' && <PerfilTamagoshi />}
                  {secao.id === 'conta' && <PerfilConta />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button className="perfil-logout" onClick={logout}>[ {t('site.perfil.sair')} ]</button>
    </section>
  )
}