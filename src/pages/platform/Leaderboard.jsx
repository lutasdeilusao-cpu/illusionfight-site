import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import {
  carregarRanking, carregarPosicaoUsuario,
  carregarRankingArena, carregarPosicaoUsuarioArena,
  carregarRankingTama, carregarPosicaoUsuarioTama
} from '../../hooks/useLeaderboardDB'
import LoginGate from '../../components/LoginGate/LoginGate'
import { getNomePais } from '../../data/paises'
import './Leaderboard.css'

function getPeriodLabel() {
  const d = new Date()
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function RankingSection({ rank, carregando, posicao, scope, setScope, user, perfil, t, locale, msgVazio, msgSemPosicao, colVitorias = true }) {
  const meuPais = perfil?.country_code || null

  return (
    <>
      <div className="lb-ranking-meta">
        <span className="lb-periodo">{getPeriodLabel()}</span>
        <div className="lb-scope-toggle">
          <button className={`lb-scope-btn${scope === 'global' ? ' lb-scope-btn--ativo' : ''}`} onClick={() => setScope('global')}>🌎 Global</button>
          {meuPais && (
            <button className={`lb-scope-btn${scope === meuPais ? ' lb-scope-btn--ativo' : ''}`} onClick={() => setScope(meuPais)}>
              {getNomePais(meuPais, locale)}
            </button>
          )}
        </div>
      </div>

      {carregando ? (
        <p className="lb-sub">{t('site.leaderboard.carregando')}</p>
      ) : rank.length === 0 ? (
        <p className="lb-sub">{msgVazio}</p>
      ) : (
        <>
          <div className="lb-podium">
            {[rank[1], rank[0], rank[2]].filter(Boolean).map((j, i) => (
              <div key={j.userId} className={`lb-podium-item ${i === 0 ? 'segundo' : i === 1 ? 'primeiro' : 'terceiro'}`}>
                <div className="lb-podium-pos">#{j.pos}</div>
                <div className="lb-podium-avatar" style={{ background: `hsl(${j.pos * 47}, 65%, 45%)` }}>{j.iniciais}</div>
                <div className="lb-podium-nome">{j.nome}</div>
                <div className="lb-podium-pontos">{j.pontos} {t('pages.leaderboard.pontos')}</div>
              </div>
            ))}
          </div>
          <div className="lb-tabela">
            <div className="lb-tabela-header">
              <span>#</span>
              <span>{t('pages.leaderboard.jogador')}</span>
              {colVitorias && <span>{t('pages.leaderboard.vitorias')}</span>}
              <span>{t('pages.leaderboard.pontos')}</span>
            </div>
            {rank.slice(3).map(j => (
              <div key={j.userId} className="lb-linha">
                <span className="lb-linha-pos">{j.pos}</span>
                <span className="lb-linha-jogador">
                  <span className="lb-linha-avatar" style={{ background: `hsl(${j.pos * 47}, 65%, 45%)` }}>{j.iniciais}</span>
                  {j.nome}
                </span>
                {colVitorias && <span>{j.vitorias}</span>}
                <span>{j.pontos}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {user && (
        <div className="lb-user-card">
          <span className="lb-user-pos">{t('pages.leaderboard.sua_posicao')}</span>
          {posicao ? (
            <div className="lb-user-row">
              <span className="lb-linha-pos">#{posicao.pos}</span>
              <span className="lb-linha-jogador">
                <span className="lb-linha-avatar" style={{ background: '#e8853a' }}>{perfil?.nome?.[0]?.toUpperCase() || '?'}</span>
                {perfil?.nome || user.email}
              </span>
              {colVitorias && <span>{posicao.vitorias}</span>}
              <span className="lb-user-pontos">{posicao.pontos} {t('pages.leaderboard.pontos')}</span>
            </div>
          ) : (
            <p className="lb-sub lb-sub--left">{msgSemPosicao}</p>
          )}
        </div>
      )}
    </>
  )
}

export default function Leaderboard() {
  const { t, locale } = useLanguage()
  const { user, perfil } = useAuth()
  const [aba, setAba] = useState('toptrumps')

  const [rankTT, setRankTT] = useState([])
  const [carregandoTT, setCarregandoTT] = useState(false)
  const [posicaoTT, setPosicaoTT] = useState(null)
  const [scopeTT, setScopeTT] = useState('global')

  const [rankArena, setRankArena] = useState([])
  const [carregandoArena, setCarregandoArena] = useState(false)
  const [posicaoArena, setPosicaoArena] = useState(null)
  const [scopeArena, setScopeArena] = useState('global')

  const [rankTama, setRankTama] = useState([])
  const [carregandoTama, setCarregandoTama] = useState(false)
  const [posicaoTama, setPosicaoTama] = useState(null)
  const [scopeTama, setScopeTama] = useState('global')

  useEffect(() => {
    if (aba !== 'toptrumps') return
    setCarregandoTT(true)
    carregarRanking(scopeTT).then(data => { setRankTT(data); setCarregandoTT(false) })
    if (user?.id) carregarPosicaoUsuario(user.id, scopeTT).then(setPosicaoTT)
  }, [aba, scopeTT, user])

  useEffect(() => {
    if (aba !== 'arena') return
    setCarregandoArena(true)
    carregarRankingArena(scopeArena).then(data => { setRankArena(data); setCarregandoArena(false) })
    if (user?.id) carregarPosicaoUsuarioArena(user.id, scopeArena).then(setPosicaoArena)
  }, [aba, scopeArena, user])

  useEffect(() => {
    if (aba !== 'cuidadores') return
    setCarregandoTama(true)
    carregarRankingTama(scopeTama).then(data => { setRankTama(data); setCarregandoTama(false) })
    if (user?.id) carregarPosicaoUsuarioTama(user.id, scopeTama).then(setPosicaoTama)
  }, [aba, scopeTama, user])

  return (
    <section className="lb-page">
      <h1 className="lb-titulo">{t('site.leaderboard.titulo')}</h1>
      <p className="lb-sub">{t('site.leaderboard.subtitulo')}</p>

      <div className="lb-abas">
        {['toptrumps', 'arena', 'cuidadores'].map(a => (
          <button key={a} className={`lb-aba ${aba === a ? 'lb-aba--ativa' : ''}`} onClick={() => setAba(a)}>
            {a === 'toptrumps' ? 'TOP TRUMPS'
              : a === 'arena' ? 'LDI ARENA'
              : 'CUIDADORES'}
          </button>
        ))}
      </div>

      <LoginGate feature="o ranking">

        {aba === 'toptrumps' && (
          <RankingSection
            rank={rankTT} carregando={carregandoTT} posicao={posicaoTT}
            scope={scopeTT} setScope={setScopeTT}
            user={user} perfil={perfil} t={t} locale={locale}
            msgVazio="Nenhuma partida ranqueada este mês ainda. Seja o primeiro!"
            msgSemPosicao="Você ainda não pontuou este mês. Vença uma partida para entrar!"
          />
        )}

        {aba === 'arena' && (
          <RankingSection
            rank={rankArena} carregando={carregandoArena} posicao={posicaoArena}
            scope={scopeArena} setScope={setScopeArena}
            user={user} perfil={perfil} t={t} locale={locale}
            msgVazio="Nenhuma vitória ranqueada este mês ainda. Seja o primeiro!"
            msgSemPosicao="Você ainda não pontuou este mês. Vença uma batalha na Arena!"
          />
        )}

        {aba === 'cuidadores' && (
          <RankingSection
            rank={rankTama} carregando={carregandoTama} posicao={posicaoTama}
            scope={scopeTama} setScope={setScopeTama}
            user={user} perfil={perfil} t={t} locale={locale}
            colVitorias={false}
            msgVazio="Nenhum cuidador pontuou este mês ainda. Cuide da sua criatura para entrar!"
            msgSemPosicao="Você ainda não pontuou este mês. Alimente, banhe ou passeie com sua criatura!"
          />
        )}

      </LoginGate>
    </section>
  )
}
