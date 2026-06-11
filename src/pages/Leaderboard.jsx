import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import {
  carregarRanking, carregarPosicaoUsuario,
  carregarRankingArena, carregarPosicaoUsuarioArena
} from '../hooks/useLeaderboardDB'
import LoginGate from '../components/LoginGate/LoginGate'
import './Leaderboard.css'

function getPeriodLabel() {
  const d = new Date()
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function RankingSection({ rank, carregando, posicao, scope, setScope, user, perfil, t, msgVazio, msgSemPosicao }) {
  return (
    <>
      <div className="lb-ranking-meta">
        <span className="lb-periodo">{getPeriodLabel()}</span>
        <div className="lb-scope-toggle">
          <button className={`lb-scope-btn${scope === 'global' ? ' lb-scope-btn--ativo' : ''}`} onClick={() => setScope('global')}>🌎 Global</button>
          <button className={`lb-scope-btn${scope === 'BR' ? ' lb-scope-btn--ativo' : ''}`} onClick={() => setScope('BR')}>🇧🇷 Brasil</button>
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
              <span>{t('pages.leaderboard.vitorias')}</span>
              <span>{t('pages.leaderboard.pontos')}</span>
            </div>
            {rank.slice(3).map(j => (
              <div key={j.userId} className="lb-linha">
                <span className="lb-linha-pos">{j.pos}</span>
                <span className="lb-linha-jogador">
                  <span className="lb-linha-avatar" style={{ background: `hsl(${j.pos * 47}, 65%, 45%)` }}>{j.iniciais}</span>
                  {j.nome}
                </span>
                <span>{j.vitorias}</span>
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
              <span>{posicao.vitorias}</span>
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
  const { t } = useLanguage()
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

  const [cuidadores, setCuidadores] = useState([])
  const [carregandoFama, setCarregandoFama] = useState(false)

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
    if (aba !== 'cuidadores' || cuidadores.length > 0) return
    setCarregandoFama(true)
    const carregar = async () => {
      const { data: fama } = await supabase.from('tamagoshi_fama').select('*')
      if (!fama) { setCarregandoFama(false); return }
      const { data: badges } = await supabase.from('tamagoshi_badges').select('*')
      const badgeCount = {}
      ;(badges || []).forEach(b => { badgeCount[b.user_id] = (badgeCount[b.user_id] || 0) + 1 })
      const userCount = {}
      fama.forEach(f => {
        if (!userCount[f.user_id]) userCount[f.user_id] = { partidas: 0, badges: badgeCount[f.user_id] || 0 }
        userCount[f.user_id].partidas++
      })
      const userIds = Object.keys(userCount)
      const { data: profiles } = await supabase.from('profiles').select('id, nome').in('id', userIds)
      const profileMap = {}
      ;(profiles || []).forEach(p => { profileMap[p.id] = p.nome })
      const ranked = Object.entries(userCount)
        .map(([uid, info]) => ({
          userId: uid,
          nome: profileMap[uid] || uid.slice(0, 8),
          iniciais: (profileMap[uid] || '?')[0].toUpperCase(),
          partidas: info.partidas,
          badges: info.badges,
        }))
        .sort((a, b) => b.partidas - a.partidas || b.badges - a.badges)
        .slice(0, 50)
        .map((j, i) => ({ ...j, pos: i + 1 }))
      setCuidadores(ranked)
      setCarregandoFama(false)
    }
    carregar()
  }, [aba])

  return (
    <section className="lb-page">
      <h1 className="lb-titulo">{t('site.leaderboard.titulo')}</h1>
      <p className="lb-sub">{t('site.leaderboard.subtitulo')}</p>

      <div className="lb-abas">
        {['toptrumps', 'arena', 'quiz', 'geral', 'cuidadores'].map(a => (
          <button key={a} className={`lb-aba ${aba === a ? 'lb-aba--ativa' : ''}`} onClick={() => setAba(a)}>
            {a === 'toptrumps' ? 'TOP TRUMPS'
              : a === 'arena' ? 'LDI ARENA'
              : a === 'quiz' ? t('pages.leaderboard.quiz_sdr')
              : a === 'geral' ? t('site.leaderboard.abas.geral').toUpperCase()
              : t('site.leaderboard.abas.cuidadores').toUpperCase()}
            {(a === 'quiz' || a === 'geral') && <span className="lb-breve">{t('site.games.em_breve')}</span>}
          </button>
        ))}
      </div>

      <LoginGate feature="o ranking da arena">

        {aba === 'toptrumps' && (
          <RankingSection
            rank={rankTT} carregando={carregandoTT} posicao={posicaoTT}
            scope={scopeTT} setScope={setScopeTT}
            user={user} perfil={perfil} t={t}
            msgVazio="Nenhuma partida ranqueada este mês ainda. Seja o primeiro!"
            msgSemPosicao="Você ainda não pontuou este mês. Vença uma partida para entrar!"
          />
        )}

        {aba === 'arena' && (
          <RankingSection
            rank={rankArena} carregando={carregandoArena} posicao={posicaoArena}
            scope={scopeArena} setScope={setScopeArena}
            user={user} perfil={perfil} t={t}
            msgVazio="Nenhuma vitória ranqueada este mês ainda. Seja o primeiro!"
            msgSemPosicao="Você ainda não pontuou este mês. Vença uma batalha na Arena!"
          />
        )}

        {aba === 'cuidadores' && (
          carregandoFama ? (
            <p className="lb-sub">{t('site.leaderboard.carregando')}</p>
          ) : cuidadores.length === 0 ? (
            <p className="lb-sub">{t('site.leaderboard.sem_cuidadores')}</p>
          ) : (
            <>
              <div className="lb-podium">
                {[cuidadores[1], cuidadores[0], cuidadores[2]].filter(Boolean).map((j, i) => (
                  <div key={j.userId} className={`lb-podium-item ${i === 0 ? 'segundo' : i === 1 ? 'primeiro' : 'terceiro'}`}>
                    <div className="lb-podium-pos">#{j.pos}</div>
                    <div className="lb-podium-avatar" style={{ background: `hsl(${j.pos * 47}, 65%, 45%)` }}>{j.iniciais}</div>
                    <div className="lb-podium-nome">{j.nome}</div>
                    <div className="lb-podium-pontos">{j.partidas} {t('pages.leaderboard.partidas')}</div>
                    <div className="lb-podium-pontos lb-podium-pontos--badges">{j.badges} {t('pages.leaderboard.badges')}</div>
                  </div>
                ))}
              </div>
              <div className="lb-tabela">
                <div className="lb-tabela-header"><span>#</span><span>{t('pages.leaderboard.cuidador')}</span><span>{t('pages.leaderboard.partidas')}</span><span>{t('pages.leaderboard.badges')}</span></div>
                {cuidadores.slice(3).map(j => (
                  <div key={j.userId} className="lb-linha" style={{ gridTemplateColumns: '40px 1fr 70px 70px' }}>
                    <span className="lb-linha-pos">{j.pos}</span>
                    <span className="lb-linha-jogador"><span className="lb-linha-avatar" style={{ background: `hsl(${j.pos * 47}, 65%, 45%)` }}>{j.iniciais}</span>{j.nome}</span>
                    <span>{j.partidas}</span><span>{j.badges}</span>
                  </div>
                ))}
              </div>
              {user && (() => {
                const meu = cuidadores.find(j => j.userId === user.id)
                return (
                  <div className="lb-user-card">
                    <span className="lb-user-pos">{t('pages.leaderboard.sua_posicao')}</span>
                    {meu ? (
                      <div className="lb-user-row" style={{ gridTemplateColumns: '40px 1fr 70px 70px' }}>
                        <span className="lb-linha-pos">#{meu.pos}</span>
                        <span className="lb-linha-jogador"><span className="lb-linha-avatar" style={{ background: '#e8853a' }}>{perfil?.nome?.[0]?.toUpperCase() || '?'}</span>{perfil?.nome || user.email}</span>
                        <span>{meu.partidas}</span><span>{meu.badges}</span>
                      </div>
                    ) : (
                      <p className="lb-sub lb-sub--left">{t('site.leaderboard.sem_cuidador_voce')}</p>
                    )}
                  </div>
                )
              })()}
            </>
          )
        )}

      </LoginGate>
    </section>
  )
}
