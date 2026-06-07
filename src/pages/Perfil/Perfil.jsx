import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAchievements } from '../../context/AchievementsContext'
import { useLanguage } from '../../context/LanguageContext'
import { useFichas } from '../../context/FichasContext'
import PerfilConquistas from './abas/PerfilConquistas'
import PerfilArena from './abas/PerfilArena'
import PerfilColecao from './abas/PerfilColecao'
import PerfilConta from './abas/PerfilConta'
import Recompensas from './abas/Recompensas'
import PerfilTamagoshi from './abas/PerfilTamagoshi'
import '../Perfil.css'

const TIER_CONFIG = {
  free: { labelKey: 'site.perfil.tier_ranqueado', cor: '#555', bordaCor: '#333' },
  elite: { labelKey: 'site.perfil.tier_elite', cor: '#00B4D8', bordaCor: '#00B4D8' },
  primordial: { labelKey: 'site.perfil.tier_primordial', cor: '#F5A623', bordaCor: '#F5A623' },
}

export default function Perfil() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, perfil, logout, carregando } = useAuth()
  const { saldo, podeColetarHoje, coletarDiarias, isAdmin, loading: fichasLoading } = useFichas()
  const abaAtiva = searchParams.get('aba') || 'conquistas'

  const tier = 'free' // integrar com profiles depois
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

  const ABAS = [
    { id: 'recompensas', label: t('site.perfil.abas_recompensas'), icone: '🎰', pulse: podeColetarHoje },
    { id: 'conquistas', label: t('site.perfil.abas_conquistas'), icone: '🏆' },
    { id: 'arena', label: t('site.perfil.abas_arena'), icone: '⚔️' },
    { id: 'colecao', label: t('site.perfil.abas_colecao'), icone: '🃏' },
    { id: 'tamagoshi', label: t('site.perfil.abas_tamagoshi'), icone: '🥚' },
    { id: 'conta', label: t('site.perfil.abas_conta'), icone: '⚙️' },
  ]

  return (
    <section className="perfil-page">
      {/* Header */}
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
              ★ {t(tierCfg.labelKey)}
            </span>
          </div>
          <div className="perfil-header-fichas">
            <span className="perfil-fichas-saldo">
              {isAdmin ? '∞' : fichasLoading ? '—' : saldo} 🎰
            </span>
            <span className="perfil-fichas-label">{t('site.perfil.fichas')}</span>
            {podeColetarHoje && !isAdmin && (
              <button className="perfil-fichas-coletar" onClick={coletarDiarias}>
                {t('site.perfil.coletar')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="perfil-tabs">
        {ABAS.map(aba => (
          <button
            key={aba.id}
            className={`perfil-tab${abaAtiva === aba.id
              ? aba.id === 'recompensas' ? ' perfil-tab--ativa-fichas' : ' perfil-tab--ativa'
              : ''}`}
            onClick={() => setSearchParams({ aba: aba.id })}
          >
            <span className="perfil-tab-icone">{aba.icone}</span>
            <span className="perfil-tab-label">{aba.label}</span>
            {aba.pulse && abaAtiva !== aba.id && (
              <span className="perfil-tab-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="perfil-conteudo">
        {abaAtiva === 'recompensas' && <Recompensas />}
        {abaAtiva === 'conquistas' && <PerfilConquistas />}
        {abaAtiva === 'arena' && <PerfilArena userId={user.id} />}
        {abaAtiva === 'colecao' && <PerfilColecao userId={user.id} />}
        {abaAtiva === 'tamagoshi' && <PerfilTamagoshi />}
        {abaAtiva === 'conta' && <PerfilConta />}
      </div>

      <button className="perfil-logout" onClick={logout}>[ {t('site.perfil.sair')} ]</button>
    </section>
  )
}