import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
  const { user, perfil } = useAuth()
  const [aba, setAba] = useState('toptrumps')

  const top3 = ranking.slice(0, 3)
  const restante = ranking.slice(3)

  return (
    <section className="lb-page">
      <h1 className="lb-titulo">ARENA — RANKING GLOBAL</h1>
      <p className="lb-sub">Os melhores jogadores de Top Trumps do universo LDI</p>

      <div className="lb-abas">
        {['toptrumps', 'quiz', 'geral'].map(a => (
          <button
            key={a}
            className={`lb-aba ${aba === a ? 'lb-aba--ativa' : ''}`}
            onClick={() => setAba(a)}
          >
            {a === 'toptrumps' ? 'TOP TRUMPS' : a === 'quiz' ? 'QUIZ SDR' : 'GERAL'}
            {a !== 'toptrumps' && <span className="lb-breve">EM BREVE</span>}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="lb-podium">
        {[top3[1], top3[0], top3[2]].map((j, i) => (
          <div key={j.pos} className={`lb-podium-item ${i === 0 ? 'segundo' : i === 1 ? 'primeiro' : 'terceiro'}`}>
            <div className="lb-podium-pos">#{j.pos}</div>
            <div className="lb-podium-avatar" style={{ background: `hsl(${j.pos * 47}, 65%, 45%)` }}>{j.iniciais}</div>
            <div className="lb-podium-nome">{j.nome}</div>
            <div className="lb-podium-pontos">{j.pontos} pts</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="lb-tabela">
        <div className="lb-tabela-header">
          <span>#</span><span>Jogador</span><span>V</span><span>D</span><span>Cartas</span><span>Pts</span>
        </div>
        {restante.map(j => (
          <div key={j.pos} className="lb-linha">
            <span className="lb-linha-pos">{j.pos}</span>
            <span className="lb-linha-jogador">
              <span className="lb-linha-avatar" style={{ background: `hsl(${j.pos * 47}, 65%, 45%)` }}>{j.iniciais}</span>
              {j.nome}
            </span>
            <span>{j.vitorias}</span><span>{j.derrotas}</span><span>{j.cartas}</span><span>{j.pontos}</span>
          </div>
        ))}
      </div>

      {/* User position */}
      <div className="lb-user-card">
        {user ? (
          <>
            <span className="lb-user-pos">SUA POSIÇÃO</span>
            <div className="lb-user-row">
              <span className="lb-linha-pos">#42</span>
              <span className="lb-linha-jogador">
                <span className="lb-linha-avatar" style={{ background: '#e8853a' }}>{perfil?.nome?.[0]?.toUpperCase() || '?'}</span>
                {perfil?.nome || user.email}
              </span>
              <span className="lb-user-pontos">3.240 pts</span>
            </div>
          </>
        ) : (
          <p className="lb-user-cta">Crie uma conta para aparecer no ranking! <Link to="/cadastro">Cadastre-se</Link></p>
        )}
      </div>
    </section>
  )
}
