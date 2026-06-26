import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { useFichas } from '../../../context/FichasContext'
import { useDix } from '../../../context/DixContext'
import { FICHAS_GATE_ATIVO } from '../../../config/fichas'
import PerfilConquistas from './abas/PerfilConquistas'
import PerfilArena from './abas/PerfilArena'
import PerfilColecao from './abas/PerfilColecao'
import PerfilConta from './abas/PerfilConta'
import Recompensas from './abas/Recompensas'
import PerfilTamagoshi from './abas/PerfilTamagoshi'
import PerfilProgresso from './PerfilProgresso'
import './Perfil.css'

const TIER_CONFIG = {
  free: { labelKey: 'site.perfil.tier_ranqueado', cor: '#555', bordaCor: '#333' },
  elite: { labelKey: 'site.perfil.tier_elite', cor: '#00B4D8', bordaCor: '#00B4D8' },
  primordial: { labelKey: 'site.perfil.tier_primordial', cor: '#F5A623', bordaCor: '#F5A623' },
}

const SECOES = [
  { id: 'colecao',    icone: 'ðŸƒ', labelKey: 'site.perfil.abas_colecao' },
  { id: 'tamagoshi',  icone: 'ðŸ¥š', labelKey: 'site.perfil.abas_tamagoshi' },
  { id: 'arena',      icone: 'âš”ï¸', labelKey: 'site.perfil.abas_arena' },
  { id: 'conquistas', icone: 'ðŸ†', labelKey: 'site.perfil.abas_conquistas' },
  { id: 'recompensas',icone: 'ðŸŽ°', labelKey: 'site.perfil.abas_recompensas' },
  { id: 'conta',      icone: 'âš™ï¸', labelKey: 'site.perfil.abas_conta' },
]

export default function Perfil() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user, perfil, logout, carregando } = useAuth()
  const { saldo, podeColetarHoje, coletarDiarias, isAdmin, loading: fichasLoading } = useFichas()
  const { saldo: dix } = useDix()

  const [abertos, setAbertos] = useState({
    colecao: false,
    tamagoshi: false,
    arena: false,
    conquistas: false,
    recompensas: false,
    conta: false,
  })

  const toggle = (secao) => setAbertos(prev => ({ ...prev, [secao]: !prev[secao] }))

  const tier = 'free'
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
            {perfil?.nome?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="perfil-header-info">
            <h1 className="perfil-nome">{perfil?.nome || '...'}</h1>
            <p className="perfil-email">{user.email}</p>
            <span className="perfil-tier-badge"
              style={{ color: tierCfg.cor, borderColor: tierCfg.bordaCor + '44', background: tierCfg.cor + '11' }}>
              â˜… {t(tierCfg.labelKey)}
            </span>
          </div>
          <div className="perfil-contadores">
            {FICHAS_GATE_ATIVO && (
              <div className="perfil-contador">
                <span className="perfil-contador-valor">
                  {isAdmin ? 'âˆž' : fichasLoading ? 'â€”' : saldo}
                </span>
                <span className="perfil-contador-label">ðŸŽ° {t('site.perfil.fichas')}</span>
              </div>
            )}
            <div className="perfil-contador">
              <span className="perfil-contador-valor">{dix}</span>
              <span className="perfil-contador-label">ðŸ’° DIX</span>
            </div>
          </div>
        </div>
        {FICHAS_GATE_ATIVO && podeColetarHoje && !isAdmin && (
          <button className="perfil-fichas-coletar" onClick={coletarDiarias}>
            {t('site.perfil.coletar')}
          </button>
        )}
      </div>

      {/* Barra de Progresso */}
      <PerfilProgresso />

      {/* SeÃ§Ãµes colapsÃ¡veis */}
      <div className="perfil-secoes">
        {SECOES.map((secao) => {
          const aberta = abertos[secao.id]
          const isRecompensas = secao.id === 'recompensas'
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
                  {aberta ? 'â–¼' : 'â–º'}
                </span>
              </button>
              <div className={`perfil-secao-corpo${aberta ? '' : ' fechado'}`}>
                <div className="perfil-secao-conteudo">
                  {secao.id === 'recompensas' && <Recompensas />}
                  {secao.id === 'conquistas' && <PerfilConquistas />}
                  {secao.id === 'arena' && <PerfilArena userId={user.id} />}
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