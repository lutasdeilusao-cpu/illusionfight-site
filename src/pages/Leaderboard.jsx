import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import LoginGate from '../components/LoginGate/LoginGate'
import './Leaderboard.css'

const ranking = [
  { pos: 1, nome: 'Isaias Leal', iniciais: 'IL', vitorias: 847, derrotas: 23, cartas: 80, pontos: 9850 },
  { pos: 2, nome: 'KimPrimordial', iniciais: 'K', vitorias: 612, derrotas: 45, cartas: 76, pontos: 8720 },
  { pos: 3, nome: 'Jack_Vitoria', iniciais: 'J', vitorias: 589, derrotas: 67, cartas: 71, pontos: 8340 },
  { pos: 4, nome: 'Nina_Angel', iniciais: 'N', vitorias: 534, derrotas: 78, cartas: 68, pontos: 7900 },
  { pos: 5, nome: 'ShuntaroRei', iniciais: 'S', vitorias: 501, derrotas: 92, cartas: 65, pontos: 7450 },
  { pos: 6, nome: 'Thunderbolt', iniciais: 'T', vitorias: 467, derrotas: 103, cartas: 60, pontos: 6980 },
  { pos: 7, nome: 'LisaTop500', iniciais: 'L', vitorias: 423, derrotas: 115, cartas: 58, pontos: 6520 },
  { pos: 8, nome: 'MikaelZylvaron', iniciais: 'M', vitorias: 398, derrotas: 128, cartas: 55, pontos: 6100 },
  { pos: 9, nome: 'NeonHacker', iniciais: 'N', vitorias: 365, derrotas: 140, cartas: 52, pontos: 5750 },
  { pos: 10, nome: 'OraVidente', iniciais: 'O', vitorias: 334, derrotas: 156, cartas: 48, pontos: 5400 },
]

for (let i = 11; i <= 20; i++) {
  ranking.push({
    pos: i, nome: `Jogador${i}`, iniciais: `J${i}`,
    vitorias: Math.floor(Math.random() * 300) + 50,
    derrotas: Math.floor(Math.random() * 200) + 50,
    cartas: Math.floor(Math.random() * 60) + 10,
    pontos: Math.floor(Math.random() * 3000) + 1000
  })
}

export default function Leaderboard() {
  const { t } = useLanguage()
  const { user, perfil } = useAuth()
  const [aba, setAba] = useState('toptrumps')

  const [cuidadores, setCuidadores] = useState([])
  const [carregandoFama, setCarregandoFama] = useState(false)

  useEffect(() => {
    if (aba !== 'cuidadores' || cuidadores.length > 0) return
    setCarregandoFama(true)
    const carregar = async () => {
      const { data: fama } = await supabase
        .from('tamagoshi_fama')
        .select('*')
      if (!fama) { setCarregandoFama(false); return }
      const { data: badges } = await supabase
        .from('tamagoshi_badges')
        .select('*')
      const badgeCount = {}
      ;(badges || []).forEach(b => {
        badgeCount[b.user_id] = (badgeCount[b.user_id] || 0) + 1
      })
      const userCount = {}
      fama.forEach(f => {
        if (!userCount[f.user_id]) {
          userCount[f.user_id] = { partidas: 0, badges: badgeCount[f.user_id] || 0, nomes: new Set() }
        }
        userCount[f.user_id].partidas++
        if (f.nome_custom) userCount[f.user_id].nomes.add(f.nome_custom)
      })
      const userIds = Object.keys(userCount)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome')
        .in('id', userIds)
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

  const top3 = ranking.slice(0, 3)
  const restante = ranking.slice(3)

  const cuidadoresTop3 = cuidadores.slice(0, 3)
  const cuidadoresRest = cuidadores.slice(3)

  return (
    <section className="lb-page">
      <h1 className="lb-titulo">{t('site.leaderboard.titulo')}</h1>
      <p className="lb-sub">{t('site.leaderboard.subtitulo')}</p>

      <div className="lb-abas">
        {['toptrumps', 'quiz', 'geral', 'cuidadores'].map(a => (
          <button
            key={a}
            className={`lb-aba ${aba === a ? 'lb-aba--ativa' : ''}`}
            onClick={() => setAba(a)}
          >
            {a === 'toptrumps' ? t('site.leaderboard.abas.toptrumps').toUpperCase() : a === 'quiz' ? t('pages.leaderboard.quiz_sdr') : a === 'geral' ? t('site.leaderboard.abas.geral').toUpperCase() : t('site.leaderboard.abas.cuidadores').toUpperCase()}
            {(a === 'quiz' || a === 'geral') && <span className="lb-breve">{t('site.games.em_breve')}</span>}
          </button>
        ))}
      </div>

      <LoginGate feature="o ranking da arena">
        {aba === 'cuidadores' ? (
          carregandoFama ? (
            <p className="lb-sub">{t('site.leaderboard.carregando')}</p>
          ) : cuidadores.length === 0 ? (
            <p className="lb-sub">{t('site.leaderboard.sem_cuidadores')}</p>
          ) : (
            <>
              <div className="lb-podium">
                {[cuidadoresTop3[1], cuidadoresTop3[0], cuidadoresTop3[2]].filter(Boolean).map((j, i) => (
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
                {cuidadoresRest.map(j => (
                  <div key={j.userId} className="lb-linha" style={{ gridTemplateColumns: '40px 1fr 70px 70px' }}>
                    <span className="lb-linha-pos">{j.pos}</span>
                    <span className="lb-linha-jogador"><span className="lb-linha-avatar" style={{ background: `hsl(${j.pos * 47}, 65%, 45%)` }}>{j.iniciais}</span>{j.nome}</span>
                    <span>{j.partidas}</span><span>{j.badges}</span>
                  </div>
                ))}
              </div>
              {user && (
                <div className="lb-user-card">
                  <span className="lb-user-pos">{t('pages.leaderboard.sua_posicao')}</span>
                  {(() => {
                    const meu = cuidadores.find(j => j.userId === user.id)
                    return meu ? (
                      <div className="lb-user-row" style={{ gridTemplateColumns: '40px 1fr 70px 70px' }}>
                        <span className="lb-linha-pos">#{meu.pos}</span>
                        <span className="lb-linha-jogador"><span className="lb-linha-avatar" style={{ background: '#e8853a' }}>{perfil?.nome?.[0]?.toUpperCase() || '?'}</span>{perfil?.nome || user.email}</span>
                        <span>{meu.partidas}</span><span>{meu.badges}</span>
                      </div>
                    ) : (
                      <p className="lb-sub lb-sub--left">{t('site.leaderboard.sem_cuidador_voce')}</p>
                    )
                  })()}
                </div>
              )}
            </>
          )
        ) : (
          <>
            <div className="lb-podium">
              {[top3[1], top3[0], top3[2]].map((j, i) => (
                <div key={j.pos} className={`lb-podium-item ${i === 0 ? 'segundo' : i === 1 ? 'primeiro' : 'terceiro'}`}>
                  <div className="lb-podium-pos">#{j.pos}</div>
                  <div className="lb-podium-avatar" style={{ background: `hsl(${j.pos * 47}, 65%, 45%)` }}>{j.iniciais}</div>
                  <div className="lb-podium-nome">{j.nome}</div>
                  <div className="lb-podium-pontos">{j.pontos} {t('pages.leaderboard.pontos')}</div>
                </div>
              ))}
            </div>
            <div className="lb-tabela">
              <div className="lb-tabela-header"><span>#</span><span>{t('pages.leaderboard.jogador')}</span><span>{t('pages.leaderboard.vitorias')}</span><span>{t('pages.leaderboard.derrotas')}</span><span>{t('pages.leaderboard.cartas')}</span><span>{t('pages.leaderboard.pontos')}</span></div>
              {restante.map(j => (
                <div key={j.pos} className="lb-linha">
                  <span className="lb-linha-pos">{j.pos}</span>
                  <span className="lb-linha-jogador"><span className="lb-linha-avatar" style={{ background: `hsl(${j.pos * 47}, 65%, 45%)` }}>{j.iniciais}</span>{j.nome}</span>
                  <span>{j.vitorias}</span><span>{j.derrotas}</span><span>{j.cartas}</span><span>{j.pontos}</span>
                </div>
              ))}
            </div>
            {user && (
            <div className="lb-user-card">
              <span className="lb-user-pos">{t('pages.leaderboard.sua_posicao')}</span>
              <div className="lb-user-row">
                <span className="lb-linha-pos">#42</span>
                <span className="lb-linha-jogador"><span className="lb-linha-avatar" style={{ background: '#e8853a' }}>{perfil?.nome?.[0]?.toUpperCase() || '?'}</span>{perfil?.nome || user?.email || '—'}</span>
                <span className="lb-user-pontos">3.240 {t('pages.leaderboard.pontos')}</span>
              </div>
            </div>
            )}
          </>
        )}
      </LoginGate>
    </section>
  )
}
