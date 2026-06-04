import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAchievements } from '../../context/AchievementsContext'
import { useFichas } from '../../context/FichasContext'
import PerfilConquistas from './abas/PerfilConquistas'
import PerfilArena from './abas/PerfilArena'
import PerfilColecao from './abas/PerfilColecao'
import PerfilConta from './abas/PerfilConta'
import Recompensas from './abas/Recompensas'
import '../Perfil.css'

const TIER_CONFIG = {
  free: { label: 'RANQUEADO', cor: '#555', bordaCor: '#333' },
  elite: { label: 'ELITE', cor: '#00B4D8', bordaCor: '#00B4D8' },
  primordial: { label: 'PRIMORDIAL', cor: '#F5A623', bordaCor: '#F5A623' },
}

export default function Perfil() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, perfil, logout, carregando } = useAuth()
  const { saldo, podeColetarHoje, coletarDiarias, isAdmin, loading: fichasLoading } = useFichas()
  const abaAtiva = searchParams.get('aba') || 'conquistas'

  const tier = 'free'
  const tierCfg = TIER_CONFIG[tier]

  console.log('[PERFIL] render | aba:', abaAtiva, '| fichas:', saldo, '| podeColetarHoje:', podeColetarHoje)

  useEffect(() => { if (!user && !carregando) navigate('/login') }, [user, carregando])

  if (carregando) return <section className="perfil-page"><p className="perfil-carregando">CARREGANDO...</p></section>
  if (!user) return null

  const ABAS = [
    { id: 'recompensas', label: 'Fichas', icone: '🎰', pulse: podeColetarHoje },
    { id: 'conquistas', label: 'Conquistas', icone: '🏆' },
    { id: 'arena', label: 'Arena', icone: '⚔️' },
    { id: 'colecao', label: 'Coleção', icone: '🃏' },
    { id: 'conta', label: 'Conta', icone: '⚙️' },
  ]

  return (
    <section className="perfil-page">
      <div className="perfil-header">
        <div className="perfil-header-inner">
          <div className="perfil-avatar" style={{ background: `hsl(${(perfil?.nome || 'U').length * 47}, 55%, 35%)` }}>
            {perfil?.nome?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="perfil-header-info">
            <h1 className="perfil-nome">{perfil?.nome || '...'}</h1>
            <p className="perfil-email">{user.email}</p>
            <span className="perfil-tier-badge" style={{ color: tierCfg.cor, borderColor: tierCfg.bordaCor + '44', background: tierCfg.cor + '11' }}>
              ★ {tierCfg.label}
            </span>
          </div>
          <div className="perfil-header-fichas">
            <span className="perfil-fichas-saldo">{isAdmin ? '∞' : fichasLoading ? '—' : saldo} 🎰</span>
            <span className="perfil-fichas-label">FICHAS</span>
            {podeColetarHoje && !isAdmin && (
              <button className="perfil-fichas-coletar" onClick={coletarDiarias}>COLETAR</button>
            )}
          </div>
        </div>
      </div>

      <div className="perfil-tabs">
        {ABAS.map(aba => (
          <button key={aba.id} className={`perfil-tab${abaAtiva === aba.id ? (aba.id === 'recompensas' ? ' perfil-tab--ativa-fichas' : ' perfil-tab--ativa') : ''}`}
            onClick={() => setSearchParams({ aba: aba.id })}>
            <span className="perfil-tab-icone">{aba.icone}</span>
            <span className="perfil-tab-label">{aba.label}</span>
            {aba.pulse && abaAtiva !== aba.id && <span className="perfil-tab-pulse" />}
          </button>
        ))}
      </div>

      <div className="perfil-conteudo">
        {abaAtiva === 'recompensas' && <Recompensas />}
        {abaAtiva === 'conquistas' && <PerfilConquistas />}
        {abaAtiva === 'arena' && <PerfilArena userId={user.id} />}
        {abaAtiva === 'colecao' && <PerfilColecao userId={user.id} />}
        {abaAtiva === 'conta' && <PerfilConta />}
      </div>

      <button className="perfil-logout" onClick={logout}>[ SAIR ]</button>
    </section>
  )
}
