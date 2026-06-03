import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { TRIAL_ACTIVE } from '../config/trial'
import { useAuth } from '../context/AuthContext'
import { useAchievements } from '../context/AchievementsContext'
import LoginGate from '../components/LoginGate/LoginGate'
import bancoPT from '../data/quiz-pt.json'
import './Quiz.css'

const MODOS = {
  ranqueado: { label: "RANQUEADO", total: 10, dificuldades: ["facil","medio"], premium: false, split: [5,5] },
  elite:     { label: "ELITE",     total: 20, dificuldades: ["facil","medio","dificil"], premium: true, split: [7,7,6] },
  primordial:{ label: "PRIMORDIAL",total: 30, dificuldades: ["facil","medio","dificil"], premium: true, split: [10,10,10] },
}

function embaralhar(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function selecionarPerguntas(modo) {
  const cfg = MODOS[modo]
  const faceis   = embaralhar(bancoPT.filter(q => q.dificuldade === "facil")).slice(0, cfg.split[0])
  const medias   = embaralhar(bancoPT.filter(q => q.dificuldade === "medio")).slice(0, cfg.split[1])
  const dificeis = cfg.split[2] ? embaralhar(bancoPT.filter(q => q.dificuldade === "dificil")).slice(0, cfg.split[2]) : []
  return [...faceis, ...medias, ...dificeis]
}

function gerarDicaGangue(personagem, pergunta) {
  const acertou = Math.random() < 0.9
  if (acertou) {
    const dicaTexto = pergunta.dicas?.[personagem]
    if (dicaTexto) return { texto: dicaTexto, correto: true, indice: pergunta.correta }
    const fallbacks = {
      kim: "Olha... eu acho que é essa, mas não me pergunta qual.",
      jack: "É ESSA AÍ, PODE CONFiar!",
      nina: "Óbvio que é essa."
    }
    return { texto: fallbacks[personagem] || fallbacks.kim, correto: true, indice: pergunta.correta }
  } else {
    const erradas = pergunta.alternativas.map((_, i) => i).filter(i => i !== pergunta.correta)
    const indiceErrado = erradas[Math.floor(Math.random() * erradas.length)]
    const textoErrado = {
      kim: `Olha... eu acho que é a ${String.fromCharCode(65 + indiceErrado)}.`,
      jack: `Com certeza é a ${String.fromCharCode(65 + indiceErrado)}, pode marcar!`,
      nina: `${String.fromCharCode(65 + indiceErrado)}.`
    }
    return { texto: textoErrado[personagem], correto: false, indice: indiceErrado }
  }
}

function calcularRank(acertos, total, tempoMedio) {
  const score = acertos / total
  const bonusVelocidade = Math.max(0, (30 - tempoMedio) / 30) * 0.15
  const pontuacao = score + bonusVelocidade
  if (pontuacao >= 0.95) return { posicao: Math.floor(Math.random() * 200) + 800, tier: "ELITE", descricao: "Top mundial. Kronos está de olho em você." }
  if (pontuacao >= 0.85) return { posicao: Math.floor(Math.random() * 2000) + 1001, tier: "RANQUEADO", descricao: "Competitivo. Mas ainda tem caminho pro top 1000." }
  if (pontuacao >= 0.70) return { posicao: Math.floor(Math.random() * 20000) + 10000, tier: "ASPIRANTE", descricao: "Você sabe o suficiente pra sobreviver. Por enquanto." }
  if (pontuacao >= 0.50) return { posicao: Math.floor(Math.random() * 200000) + 100000, tier: "NOVATO", descricao: "Promissor. Releia os capítulos e volta." }
  return { posicao: Math.floor(Math.random() * 1000000000) + 500000000, tier: "RECRUTA", descricao: "Nem o Thunderbolt teria perdido tanto assim." }
}

export default function Quiz() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { desbloquear, registrarGangue } = useAchievements()

  const [fase, setFase] = useState("entrada")
  const [modo, setModo] = useState(null)
  const [perguntas, setPerguntas] = useState([])
  const [indice, setIndice] = useState(0)
  const [confirmada, setConfirmada] = useState(false)
  const [ultimaResposta, setUltimaResposta] = useState(null)
  const [acertos, setAcertos] = useState(0)
  const [tempos, setTempos] = useState([])
  const [timer, setTimer] = useState(30)
  const [resultadoCalculado, setResultadoCalculado] = useState(null)
  const [historico, setHistorico] = useState([])
  const [ajudasDisponiveis, setAjudasDisponiveis] = useState({ pular: 2, gangue: 1 })
  const [mostraGangue, setMostraGangue] = useState(false)
  const [dicaGangue, setDicaGangue] = useState(null)
  const [dicaIndice, setDicaIndice] = useState(null)
  const [bloqueioModo, setBloqueioModo] = useState(null)
  const [transicao, setTransicao] = useState(null)
  const [rankExibido, setRankExibido] = useState(2847391000)
  const [quizJaCompletou, setQuizJaCompletou] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (fase !== "pergunta" || confirmada) return
    setTimer(30)
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [fase, indice, confirmada])

  useEffect(() => {
    if (timer === 0 && fase === "pergunta" && !confirmada) {
      confirmarResposta(null)
    }
  }, [timer])

  useEffect(() => {
    if (fase !== "resultado" || !resultadoCalculado) return
    setRankExibido(2847391000)
    const inicio = 2847391000
    const fim = resultadoCalculado.posicao
    const duracao = 1800
    const startTime = Date.now()
    const iv = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duracao, 1)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setRankExibido(Math.round(inicio - (inicio - fim) * ease))
      if (progress === 1) clearInterval(iv)
    }, 16)
    return () => clearInterval(iv)
  }, [fase])

  useEffect(() => {
    if (!user && fase !== "entrada") navigate('/login')
  }, [user, fase])

  const iniciarModo = (modoKey) => {
    const config = MODOS[modoKey]
    if (config.premium && !TRIAL_ACTIVE) {
      setBloqueioModo(modoKey)
      return
    }
    setPerguntas(selecionarPerguntas(modoKey))
    setIndice(0)
    setConfirmada(false)
    setUltimaResposta(null)
    setAcertos(0)
    setTempos([])
    setResultadoCalculado(null)
    setHistorico([])
    setAjudasDisponiveis({ pular: 2, gangue: 1 })
    setDicaGangue(null)
    setDicaIndice(null)
    setMostraGangue(false)
    setModo(modoKey)
    setFase("pergunta")
  }

  const confirmarResposta = (resposta) => {
    if (confirmada) return
    clearInterval(timerRef.current)
    setConfirmada(true)
    setDicaIndice(null)
    setUltimaResposta(resposta)
    const pergunta = perguntas[indice]
    const acertou = resposta === pergunta.correta
    if (acertou) setAcertos(s => s + 1)
    setTempos(s => [...s, 30 - timer])
    setHistorico(s => [...s, { pergunta, resposta, acertou }])
    setTimeout(() => {
      document.getElementById("quiz-narrador")?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }, 100)
  }

  const cliqueAlternativa = (i) => {
    if (confirmada) return
    confirmarResposta(i)
  }

  const proximaPergunta = () => {
    const total = perguntas.length
    if (indice + 1 < total) {
      setTransicao("saindo")
      setTimeout(() => {
        setIndice(prev => prev + 1)
        setConfirmada(false)
        setUltimaResposta(null)
        setTimer(30)
        setDicaGangue(null)
        setDicaIndice(null)
        setMostraGangue(false)
        setTransicao("entrando")
        setTimeout(() => setTransicao(null), 200)
      }, 150)
    } else {
      const acertosFinais = acertos + (historico[historico.length - 1]?.acertou ? 1 : 0)
      const tempoMedio = [...tempos, 30 - timer].reduce((a, b) => a + b, 0) / total
      setResultadoCalculado(calcularRank(acertosFinais, total, tempoMedio))
      setFase("resultado")
      if (!quizJaCompletou) {
        setQuizJaCompletou(true)
        desbloquear('ranqueado_sdr')
        if (acertosFinais / total >= 0.8 && modo === 'ranqueado') desbloquear('briguento')
      }
    }
  }

  const pularPergunta = () => {
    if (confirmada || ajudasDisponiveis.pular <= 0) return
    setAjudasDisponiveis(s => ({ ...s, pular: s.pular - 1 }))
    setHistorico(s => [...s, { pergunta: perguntas[indice], resposta: -1, acertou: null, pulada: true }])
    setTempos(s => [...s, 30 - timer])
    confirmarResposta(null)
  }

  const abrirGangue = () => {
    if (ajudasDisponiveis.gangue <= 0) return
    setMostraGangue(true)
  }

  const escolherGangue = (personagem) => {
    setAjudasDisponiveis(s => ({ ...s, gangue: s.gangue - 1 }))
    const dica = gerarDicaGangue(personagem, perguntas[indice])
    setDicaGangue({ ...dica, personagem })
    setDicaIndice(dica.indice)
    setMostraGangue(false)
    registrarGangue()
  }

  const reiniciar = () => {
    setFase("entrada")
    setModo(null)
    setBloqueioModo(null)
  }

  if (fase === "entrada") {
    return (
      <section className="quiz-page-entrada">
        <div className="quiz-header">
          <span className="quiz-nexus-tag">{t('quiz.nexus_tag')}</span>
          <h1 className="quiz-titulo">{t('quiz.titulo')}</h1>
          <p>{t('quiz.subtitulo')}</p>
        </div>

        <LoginGate feature="o Quiz SDR">
          <div className="quiz-modos-grid">
            {Object.entries(MODOS).map(([key, config]) => (
              <div
                key={key}
                className={`quiz-modo-card ${key}`}
                onClick={() =>
                  config.premium && !TRIAL_ACTIVE
                    ? setBloqueioModo(key)
                    : iniciarModo(key)
                }
              >
                <span className={`quiz-modo-badge ${config.premium ? 'premium' : 'free'}`}>
                  {config.premium ? 'PREMIUM' : 'FREE'}
                </span>
                <span className="quiz-modo-label">{config.label}</span>
                <p className="quiz-modo-total">{config.total} perguntas</p>
                <p className="quiz-modo-desc">
                  {key === 'ranqueado' && '5 fáceis + 5 médias'}
                  {key === 'elite' && '7 fáceis + 7 médias + 6 difíceis'}
                  {key === 'primordial' && '10 de cada dificuldade'}
                </p>
                {config.premium && !TRIAL_ACTIVE && (
                  <span className="quiz-modo-lock">🔒</span>
                )}
              </div>
            ))}
          </div>
        </LoginGate>

        <p className="quiz-timer-aviso">{t('quiz.timer_aviso')}</p>

        {bloqueioModo && (
          <div className="quiz-block">
            <h2>{t('quiz.bloqueio_titulo')}</h2>
            <p>{t('quiz.bloqueio_desc')}</p>
            <Link to="/assinar" className="quiz-block-btn">{t('quiz.bloqueio_btn')}</Link>
            <button className="quiz-block-voltar" onClick={() => setBloqueioModo(null)}>
              {t('quiz.bloqueio_voltar')}
            </button>
          </div>
        )}
      </section>
    )
  }

  if (fase === "pergunta") {
    const pergunta = perguntas[indice]
    if (!pergunta) return null
    const total = perguntas.length

    return (
      <section className="quiz-page">
        <div className="quiz-hud">
          <span className="quiz-hud-questao">QUESTÃO {indice + 1}/{total}</span>
          <div className="quiz-timer">
            <div className="quiz-timer-bar">
              <div
                className={`quiz-timer-bar-inner${timer <= 10 ? ' quiz-timer-bar--warn' : ''}`}
                style={{ width: `${(timer / 30) * 100}%` }}
              />
            </div>
            <span className={`quiz-timer-text${timer <= 10 ? ' quiz-timer-text--warn' : ''}`}>
              {timer}
            </span>
          </div>
          <span className="quiz-hud-acertos">ACERTOS: {acertos}</span>
        </div>

        <div className={`quiz-pergunta-container${transicao ? ` ${transicao}` : ''}`}>
          <span className="quiz-categoria">{pergunta.categoria}</span>
          <h2 className="quiz-pergunta-texto">{pergunta.pergunta}</h2>

          <div className="quiz-alternativas">
            {pergunta.alternativas.map((alt, i) => {
              const letra = String.fromCharCode(65 + i)
              let classe = 'quiz-alternativa'
              if (dicaIndice === i && !confirmada) classe += ' quiz-alt-gangue'
              if (confirmada) {
                if (i === pergunta.correta) classe += ' quiz-alt-correta'
                else if (ultimaResposta === i) classe += ' quiz-alt-errada'
                else classe += ' quiz-alternativa--disabled'
              }
              return (
                <button
                  key={i}
                  className={classe}
                  onClick={() => cliqueAlternativa(i)}
                  disabled={confirmada}
                >
                  <span className="quiz-alternativa-letra">{letra}</span>
                  <span className="quiz-alternativa-texto">{alt}</span>
                  {confirmada && i === pergunta.correta && <span className="quiz-alternativa-icon"> ✓</span>}
                  {confirmada && ultimaResposta === i && i !== pergunta.correta && <span className="quiz-alternativa-icon"> ✗</span>}
                </button>
              )
            })}
          </div>

          <div className="quiz-ajudas">
            <button
              className="quiz-ajuda-btn"
              disabled={ajudasDisponiveis.pular <= 0 || confirmada}
              onClick={pularPergunta}
            >
              PULAR ({ajudasDisponiveis.pular})
            </button>
            <button
              className="quiz-ajuda-btn"
              disabled={ajudasDisponiveis.gangue <= 0 || confirmada}
              onClick={abrirGangue}
            >
              GANGUE ({ajudasDisponiveis.gangue})
            </button>
          </div>

          {mostraGangue && (
            <div className="quiz-gangue">
              {['kim', 'jack', 'nina'].map(p => (
                <button
                  key={p}
                  className="quiz-gangue-card"
                  onClick={() => escolherGangue(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {dicaGangue && (
            <div className="quiz-dica">
              <strong>{dicaGangue.personagem}:</strong> {dicaGangue.texto}
            </div>
          )}

          <div className="quiz-narrador" id="quiz-narrador">
            <strong>{t('quiz.nexus_tag')}:</strong> {pergunta.narrador}
          </div>
        </div>

        {confirmada && (
          <button className="quiz-proxima-flutuante" onClick={proximaPergunta}>
            {indice + 1 < total ? 'PRÓXIMA →' : 'VER RESULTADO →'}
          </button>
        )}
      </section>
    )
  }

  if (fase === "resultado" && resultadoCalculado) {
    const total = perguntas.length
    const erros = total - acertos
    const aproveitamento = Math.round((acertos / total) * 100)

    return (
      <section className="quiz-page">
        <div className="quiz-resultado">
          <span className="quiz-nexus-tag">NEXUS PHANTASM — RESULTADO OFICIAL</span>
          <h1 className="quiz-resultado-tier">{resultadoCalculado.tier}</h1>
          <h2 className="quiz-posicao">#{rankExibido.toLocaleString('pt-BR')}</h2>
          <p className="quiz-posicao-label">posição estimada no SDR</p>
          <p className="quiz-descricao"><em>{resultadoCalculado.descricao}</em></p>

          <div className="quiz-stats">
            <div className="quiz-stat">
              <span className="quiz-stat-valor">{acertos}</span>
              <span className="quiz-stat-label">ACERTOS</span>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat-valor">{erros}</span>
              <span className="quiz-stat-label">ERROS</span>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat-valor">{aproveitamento}%</span>
              <span className="quiz-stat-label">APROVEITAMENTO</span>
            </div>
          </div>

          <div className="quiz-revisao">
            <h3>REVISÃO</h3>
            {historico.map((entry, i) => (
              <div
                key={i}
                className={`quiz-revisao-item${entry.pulada ? ' quiz-revisao-item--pulada' : entry.acertou ? ' quiz-revisao-item--certa' : ' quiz-revisao-item--errada'}`}
              >
                <span className="quiz-revisao-icon">{entry.pulada ? '⏭' : entry.acertou ? '✓' : '✗'}</span>
                <span className="quiz-revisao-pergunta">{entry.pergunta.pergunta}</span>
                {!entry.pulada && !entry.acertou && (
                  <span className="quiz-revisao-correta">Correta: {entry.pergunta.alternativas[entry.pergunta.correta]}</span>
                )}
              </div>
            ))}
          </div>

          <div className="quiz-resultado-actions">
            <button className="quiz-reiniciar-btn" onClick={reiniciar}>JOGAR NOVAMENTE</button>
            <Link to="/" className="quiz-voltar-link">VOLTAR À HOME</Link>
          </div>
        </div>
      </section>
    )
  }

  return null
}
