import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { TRIAL_ACTIVE } from '../config/trial'
import bancoPT from '../data/quiz-pt.json'
import './Quiz.css'

const MODOS = {
  recruta: { label: "RECRUTA", total: 10, dificuldades: ["facil"], cor: "verde", premium: true, descricao: "Básico — qualquer fã entra" },
  ranqueado: { label: "RANQUEADO", total: 10, dificuldades: ["facil", "medio"], cor: "teal", premium: false, descricao: "Free — 5 fáceis + 5 médias" },
  elite: { label: "ELITE", total: 20, dificuldades: ["facil", "medio", "dificil"], cor: "carmesim", premium: true, descricao: "Completo — do prólogo ao Kronos" }
}

function embaralhar(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function selecionarPerguntasRanqueado(banco) {
  const faceis = embaralhar(banco.filter(q => q.dificuldade === "facil")).slice(0, 5)
  const medias = embaralhar(banco.filter(q => q.dificuldade === "medio")).slice(0, 5)
  return [...faceis, ...medias]
}

function selecionarPerguntasRecruta(banco) {
  return embaralhar(banco.filter(q => q.dificuldade === "facil")).slice(0, 10)
}

function selecionarPerguntasElite(banco) {
  const faceis = embaralhar(banco.filter(q => q.dificuldade === "facil")).slice(0, 6)
  const medias = embaralhar(banco.filter(q => q.dificuldade === "medio")).slice(0, 7)
  const dificeis = embaralhar(banco.filter(q => q.dificuldade === "dificil")).slice(0, 7)
  return [...faceis, ...medias, ...dificeis]
}

function gerarDicaUniversitario(personagem, pergunta) {
  const acertou = Math.random() < 0.9
  if (acertou) {
    const dicaTexto = pergunta.dicas?.[personagem]
    if (dicaTexto) return { texto: dicaTexto, correto: true }
    const fallbacks = {
      kim: `Olha... eu acho que é a alternativa certa, mas não me pergunta qual.`,
      jack: `É ESSA AÍ, PODE CONFiar!`,
      nina: `Óbvio que é essa.`
    }
    return { texto: fallbacks[personagem] || fallbacks.kim, correto: true }
  } else {
    const erradas = pergunta.alternativas.map((_, i) => i).filter(i => i !== pergunta.correta)
    const indiceErrado = erradas[Math.floor(Math.random() * erradas.length)]
    const textoErrado = {
      kim: `Olha... eu acho que é a ${String.fromCharCode(65 + indiceErrado)}.`,
      jack: `Com certeza é a ${String.fromCharCode(65 + indiceErrado)}, pode marcar!`,
      nina: `${String.fromCharCode(65 + indiceErrado)}.`
    }
    return { texto: textoErrado[personagem], correto: false }
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
  const [ajudasDisponiveis, setAjudasDisponiveis] = useState({ pular: 2, universitario: 1 })
  const [mostraUniversitarios, setMostraUniversitarios] = useState(false)
  const [dicaUniversitario, setDicaUniversitario] = useState(null)
  const [bloqueioModo, setBloqueioModo] = useState(null)

  useEffect(() => {
    if (fase !== "pergunta" || confirmada) return
    setTimer(30)
    const iv = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(iv); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [fase, indice, confirmada])

  useEffect(() => {
    if (timer === 0 && fase === "pergunta" && !confirmada) {
      confirmarResposta(null)
    }
  }, [timer])

  const iniciarModo = (modoKey) => {
    const config = MODOS[modoKey]
    if (config.premium && !TRIAL_ACTIVE) {
      setBloqueioModo(modoKey)
      return
    }
    let selecionadas
    if (modoKey === 'recruta') selecionadas = selecionarPerguntasRecruta(bancoPT)
    else if (modoKey === 'ranqueado') selecionadas = selecionarPerguntasRanqueado(bancoPT)
    else selecionadas = selecionarPerguntasElite(bancoPT)
    setPerguntas(selecionadas)
    setIndice(0)
    setConfirmada(false)
    setUltimaResposta(null)
    setAcertos(0)
    setTempos([])
    setResultadoCalculado(null)
    setHistorico([])
    setAjudasDisponiveis({ pular: 2, universitario: 1 })
    setDicaUniversitario(null)
    setMostraUniversitarios(false)
    setModo(modoKey)
    setFase("pergunta")
  }

  const confirmarResposta = (resposta) => {
    if (confirmada) return
    setConfirmada(true)
    setUltimaResposta(resposta)
    const pergunta = perguntas[indice]
    const acertou = resposta === pergunta.correta
    if (acertou) setAcertos(s => s + 1)
    setTempos(s => [...s, 30 - timer])
    setHistorico(s => [...s, { pergunta, resposta, acertou }])
  }

  const cliqueAlternativa = (i) => {
    if (confirmada) return
    confirmarResposta(i)
  }

  const proximaPergunta = () => {
    const total = perguntas.length
    if (indice + 1 < total) {
      setIndice(s => s + 1)
      setConfirmada(false)
      setUltimaResposta(null)
      setTimer(30)
      setDicaUniversitario(null)
      setMostraUniversitarios(false)
    } else {
      const tempoMedio = [...tempos, 30 - timer].reduce((a, b) => a + b, 0) / total
      setResultadoCalculado(calcularRank(acertos + (historico[historico.length - 1]?.acertou ? 1 : 0), total, tempoMedio))
      setFase("resultado")
    }
  }

  const pularPergunta = () => {
    if (confirmada || ajudasDisponiveis.pular <= 0) return
    setAjudasDisponiveis(s => ({ ...s, pular: s.pular - 1 }))
    setHistorico(s => [...s, { pergunta: perguntas[indice], resposta: -1, acertou: null, pulada: true }])
    setTempos(s => [...s, 30 - timer])
    confirmarResposta(null)
  }

  const abrirUniversitarios = () => {
    if (ajudasDisponiveis.universitario <= 0) return
    setMostraUniversitarios(true)
  }

  const escolherUniversitario = (personagem) => {
    setAjudasDisponiveis(s => ({ ...s, universitario: s.universitario - 1 }))
    const dica = gerarDicaUniversitario(personagem, perguntas[indice])
    setDicaUniversitario({ ...dica, personagem })
    setMostraUniversitarios(false)
  }

  const reiniciar = () => {
    setFase("entrada")
    setModo(null)
    setBloqueioModo(null)
  }

  if (fase === "entrada") {
    return (
      <section className="quiz-page">
        <div className="quiz-header">
          <span className="quiz-nexus-tag">{t('quiz.nexus_tag')}</span>
          <h1>{t('quiz.titulo')}</h1>
          <p>{t('quiz.subtitulo')}</p>
        </div>

        <div className="quiz-modos-grid">
          {Object.entries(MODOS).map(([key, config]) => (
            <div
              key={key}
              className="quiz-modo-card"
              style={{ '--modo-cor': config.cor }}
              onClick={() =>
                config.premium && !TRIAL_ACTIVE
                  ? setBloqueioModo(key)
                  : iniciarModo(key)
              }
            >
              <div className="quiz-modo-card-header">
                <span className="quiz-modo-label">{config.label}</span>
                {config.premium ? (
                  <span className="quiz-modo-badge quiz-modo-badge--premium">PREMIUM</span>
                ) : (
                  <span className="quiz-modo-badge quiz-modo-badge--free">FREE</span>
                )}
              </div>
              <p className="quiz-modo-total">{config.total} perguntas</p>
              <p className="quiz-modo-desc">{config.descricao}</p>
              {config.premium && !TRIAL_ACTIVE && (
                <span className="quiz-modo-lock">🔒</span>
              )}
            </div>
          ))}
        </div>

        <p className="quiz-timer-aviso">{t('quiz.timer_aviso')}</p>

        {bloqueioModo && (
          <div className="quiz-block">
            <div className="quiz-block-content">
              <h2>{t('quiz.bloqueio_titulo')}</h2>
              <p>{t('quiz.bloqueio_desc')}</p>
              <Link to="/assinar" className="quiz-block-btn">{t('quiz.bloqueio_btn')}</Link>
              <button className="quiz-block-voltar" onClick={() => setBloqueioModo(null)}>
                {t('quiz.bloqueio_voltar')}
              </button>
            </div>
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

        <div className="quiz-pergunta-container">
          <span className="quiz-categoria">{pergunta.categoria}</span>
          <h2 className="quiz-pergunta-texto">{pergunta.pergunta}</h2>

          <div className="quiz-alternativas">
            {pergunta.alternativas.map((alt, i) => {
              const letra = String.fromCharCode(65 + i)
              let classe = 'quiz-alternativa'
              if (confirmada) {
                if (i === pergunta.correta) classe += ' quiz-alternativa--correct'
                else if (ultimaResposta === i) classe += ' quiz-alternativa--wrong'
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
              disabled={ajudasDisponiveis.universitario <= 0 || confirmada}
              onClick={abrirUniversitarios}
            >
              UNIVERSITÁRIOS ({ajudasDisponiveis.universitario})
            </button>
          </div>

          {mostraUniversitarios && (
            <div className="quiz-universitarios">
              {['kim', 'jack', 'nina'].map(p => (
                <button
                  key={p}
                  className="quiz-universitario-card"
                  onClick={() => escolherUniversitario(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {dicaUniversitario && (
            <div className="quiz-dica">
              <strong>{dicaUniversitario.personagem}:</strong> {dicaUniversitario.texto}
            </div>
          )}

          {confirmada && (
            <div className="quiz-actions">
              <button className="quiz-next-btn" onClick={proximaPergunta}>
                {indice + 1 < total ? 'PRÓXIMA →' : 'VER RESULTADO →'}
              </button>
            </div>
          )}

          <div className="quiz-narrador">
            <strong>{t('quiz.nexus_tag')}:</strong> {pergunta.narrador}
          </div>
        </div>
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
          <h1 className="quiz-tier">{resultadoCalculado.tier}</h1>
          <h2 className="quiz-posicao">#{resultadoCalculado.posicao.toLocaleString('pt-BR')}</h2>
          <p className="quiz-posicao-label">posição estimada no SDR</p>
          <p className="quiz-descricao"><em>{resultadoCalculado.descricao}</em></p>

          <div className="quiz-stats">
            <div className="quiz-stat quiz-stat--acertos">
              <span className="quiz-stat-valor">{acertos}</span>
              <span className="quiz-stat-label">ACERTOS</span>
            </div>
            <div className="quiz-stat quiz-stat--erros">
              <span className="quiz-stat-valor">{erros}</span>
              <span className="quiz-stat-label">ERROS</span>
            </div>
            <div className="quiz-stat quiz-stat--aproveitamento">
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
