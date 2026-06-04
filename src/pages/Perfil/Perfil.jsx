import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAchievements } from '../../context/AchievementsContext'
import { carregarStats } from '../../hooks/useTopTrumpsDB'
import PerfilConquistas from './abas/PerfilConquistas'
import PerfilArena from './abas/PerfilArena'
import PerfilColecao from './abas/PerfilColecao'
import PerfilConta from './abas/PerfilConta'
import Recompensas from './abas/Recompensas'
import { useFichas } from '../../context/FichasContext'
import '../Perfil.css'

const ABAS = [
  { id: 'recompensas', label: 'Fichas', icone: '🎰' },
  { id: 'conquistas', label: 'Conquistas', icone: '🏆' },
  { id: 'arena', label: 'Arena', icone: '🃏' },
  { id: 'colecao', label: 'Coleção', icone: '🎴' },
  { id: 'conta', label: 'Conta', icone: '⚙️' },
]

export default function Perfil() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, perfil, logout, carregando } = useAuth()
  const { desbloqueados } = useAchievements()
  const { saldo, podeColetarHoje, coletarDiarias, isAdmin, loading: fichasLoading } = useFichas()
  const abaAtiva = searchParams.get('aba') || 'conquistas'

  console.log('[PERFIL] render | aba:', abaAtiva, '| fichas:', saldo, '| podeColetarHoje:', podeColetarHoje)

  useEffect(() => {
    if (!user && !carregando) navigate('/login')
  }, [user, carregando])

  if (carregando) return <section className="perfil-page"><p className="perfil-carregando">Carregando...</p></section>
  if (!user) return null

  return (
    <section className="perfil-page">
      <div className="perfil-header">
        <div className="perfil-avatar" style={{ background: `hsl(${(perfil?.nome || 'U').length * 47}, 65%, 45%)` }}>{perfil?.nome?.[0]?.toUpperCase() || '...'}</div>
        <h1 className="perfil-nome">{perfil?.nome || '...'}</h1>
        <p className="perfil-email">{user.email}</p>
        <div className="perfil-fichas-header">
          <span className="perfil-fichas-saldo">🎰 {isAdmin ? '∞' : fichasLoading ? '...' : saldo}</span>
          {podeColetarHoje && !isAdmin && (
            <button className="perfil-fichas-coletar-btn" onClick={coletarDiarias}>COLETAR</button>
          )}
        </div>
      </div>

      <div className="perfil-tabs">
        {ABAS.map(aba => (
          <button
            key={aba.id}
            className={`perfil-tab${abaAtiva === aba.id ? ' perfil-tab--ativa' : ''}`}
            onClick={() => setSearchParams({ aba: aba.id })}
          >
            <span className="perfil-tab-icone">{aba.icone}</span>
            <span className="perfil-tab-label">{aba.label}</span>
          </button>
        ))}
      </div>

      {abaAtiva === 'recompensas' && <Recompensas />}
      {abaAtiva === 'conquistas' && <PerfilConquistas />}
      {abaAtiva === 'arena' && <PerfilArena userId={user.id} />}
      {abaAtiva === 'colecao' && <PerfilColecao userId={user.id} />}
      {abaAtiva === 'conta' && <PerfilConta />}

      <button className="perfil-logout" onClick={logout}>SAIR</button>
    </section>
  )
}
