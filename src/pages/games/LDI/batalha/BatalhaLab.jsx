import { useCallback, useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useFichas } from '../../../../context/FichasContext'
import { useReader } from '../../../../context/ReaderContext'
import Pentagrama from './Pentagrama'
import { FICHAS, ENERGIA_BASE, ESQUIVA, MAX_POR_CARGA, TOQUES_POR_CARGA, PODER_MAX, PODER_POR_SEGUNDO, PODERES, escolherCombo, resolverTroca, golpesDe, maxGolpes, sequenciaDoPoder, acertouSequencia } from './motorPentagrama'
import { ligarSom, alternarMudo, estaMudo, tocarCompasso, somAcende, somLigar, somGolpe, somBloqueio, somEsquiva, somPoder } from './somPentagrama'
import './Batalha.css'

// Laboratório da batalha do pentagrama (só admin; no dev abre pra qualquer um).
// Uma batida = um compasso de 8 tempos: você desenha o seu combo até a barra
// amarela acabar. O combo do inimigo não aparece — só com a habilidade de ler
// a origem, e aí só de onde nasce o 1º golpe. Soltou o traço, o último ponto
// pisca: tocar nele carrega. Depois vem um compasso de replay: o seu
// pentagrama contra o dele, inteiro, e o passo a passo.
// Segurar a bolinha entre as pernas enche a barra de poder; cheia, cada batida
// manda uma sequência — desenhou ela, sai o Gelo Negro.
// Tudo de uma mão: leitura em cima, tabuleiro embaixo, no alcance do dedão.
const VELOCIDADES = { lento: 3400, normal: 2600, rapido: 1900 }
const VIDA_JOG = 60
const CHANCE_CENTRO = 0.22
const CENTRO_MS = 420

export default function BatalhaLab() {
  const { t } = useLanguage()
  const { isAdmin, loading } = useFichas()
  const { setReaderMode } = useReader()
  const [fase, setFase] = useState('menu')
  const [oponente, setOponente] = useState('saco')
  const [velocidade, setVelocidade] = useState('normal')
  const [verOrigem, setVerOrigem] = useState(false)

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const liberado = isAdmin || import.meta.env.VITE_DEBUG === 'true'
  if (loading && !liberado) return <div className="pg-page" />
  if (!liberado) return <div className="pg-page"><p className="pg-aviso">{t('games.ldi.batalha.restrito')}</p></div>

  if (fase === 'menu') {
    return (
      <div className="pg-page">
        <p className="if-eyebrow">{t('games.ldi.batalha.lab')}</p>
        <h1 className="pg-titulo">{t('games.ldi.batalha.titulo')}</h1>
        <p className="pg-texto">{t('games.ldi.batalha.como')}</p>
        <details className="pg-como">
          <summary>{t('games.ldi.batalha.como_joga')}</summary>
          <ul className="pg-regras">
            {['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'].map(k => <li key={k}>{t(`games.ldi.batalha.regras.${k}`)}</li>)}
          </ul>
        </details>
        <div className="pg-menu-acoes">
          <p className="if-eyebrow">{t('games.ldi.batalha.oponente')}</p>
          <div className="pg-opcoes">
            {Object.keys(FICHAS).map(id => (
              <button key={id} type="button" className={`pg-opcao${oponente === id ? ' is-on' : ''}`} onClick={() => setOponente(id)}>
                {t(`games.ldi.batalha.fichas.${id}`)}
              </button>
            ))}
          </div>
          <p className="if-eyebrow">{t('games.ldi.batalha.velocidade')}</p>
          <div className="pg-opcoes">
            {Object.keys(VELOCIDADES).map(v => (
              <button key={v} type="button" className={`pg-opcao${velocidade === v ? ' is-on' : ''}`} onClick={() => setVelocidade(v)}>
                {t(`games.ldi.batalha.vel.${v}`)}
              </button>
            ))}
          </div>
          <p className="if-eyebrow">{t('games.ldi.batalha.habilidade')}</p>
          <button type="button" className={`pg-opcao${verOrigem ? ' is-on' : ''}`} onClick={() => setVerOrigem(v => !v)}>
            {verOrigem ? '✓ ' : ''}{t('games.ldi.batalha.ver_origem')}
          </button>
          <button type="button" className="if-btn if-btn--primary pg-comecar" onClick={() => { ligarSom(); setFase('luta') }}>{t('games.ldi.batalha.lutar')}</button>
        </div>
      </div>
    )
  }

  return <Luta t={t} ficha={FICHAS[oponente]} batida={VELOCIDADES[velocidade]} verOrigem={verOrigem} onSair={() => setFase('menu')} />
}

function Luta({ t, ficha, batida, verOrigem, onSair }) {
  const [vida, setVida] = useState({ jog: VIDA_JOG, ini: ficha.vida })
  const [energia, setEnergia] = useState({ jog: ENERGIA_BASE, ini: ENERGIA_BASE })
  const [tonto, setTonto] = useState({ jog: false, ini: false })
  const [n, setN] = useState(0)
  const [combo, setCombo] = useState([])
  const [toques, setToques] = useState(0)
  const [travado, setTravado] = useState(false)
  const [telegrafo, setTelegrafo] = useState([])
  const [centroAberto, setCentroAberto] = useState(false)
  const [replay, setReplay] = useState(null)
  const [fim, setFim] = useState(null)
  const [mudo, setMudo] = useState(estaMudo)
  const [poder, setPoder] = useState(0)
  const [segurando, setSegurando] = useState(false)
  const [guia, setGuia] = useState([])
  const estado = useRef({})
  const golpes = golpesDe(combo).length
  const cargaMax = tonto.jog ? 0 : golpes === 0 ? 0 : golpes <= MAX_POR_CARGA[2] ? 2 : golpes <= MAX_POR_CARGA[1] ? 1 : 0
  const carga = Math.min(cargaMax, Math.floor(toques / TOQUES_POR_CARGA))
  estado.current = { combo, carga, energia, vida, tonto, poder, guia }
  const ultimoJog = useRef([])

  // Uma batida: o inimigo escolhe o combo e acende ponto a ponto no tempo; o
  // centro abre raramente; no fim a troca resolve e vem o compasso de replay.
  useEffect(() => {
    if (fim) return
    const timers = []
    const oitavo = batida / 8
    const comboIni = escolherCombo(ficha, { ultimoDoJogador: ultimoJog.current, tonto: estado.current.tonto.ini })
    tocarCompasso(batida)
    const seqPoder = estado.current.poder >= PODER_MAX ? sequenciaDoPoder(PODERES.geloNegro) : []
    setGuia(seqPoder)
    // Só com a habilidade: de onde nasce o 1º golpe dele, no primeiro tempo.
    if (verOrigem) timers.push(setTimeout(() => { setTelegrafo(comboIni.slice(0, 1)); somAcende() }, oitavo))
    if (Math.random() < CHANCE_CENTRO) {
      const abre = batida * (0.3 + Math.random() * 0.45)
      timers.push(setTimeout(() => setCentroAberto(true), abre))
      timers.push(setTimeout(() => setCentroAberto(false), abre + CENTRO_MS * (batida / VELOCIDADES.normal)))
    }
    timers.push(setTimeout(() => {
      const { combo: cj, carga: cg, energia: en, vida: vd } = estado.current
      const esquivaIni = Math.random() < ficha.esquiva
      const trIni = esquivaIni ? [ESQUIVA, ...comboIni] : comboIni
      const soltouPoder = seqPoder.length > 0 && acertouSequencia(cj, seqPoder)
      const r = resolverTroca({ combo: cj, carga: cg, energia: en.jog, poder: soltouPoder ? 'geloNegro' : null }, { combo: trIni, energia: en.ini })
      setPoder(p => (soltouPoder ? 0 : Math.min(PODER_MAX, p + r.poderGanho.jog)))
      setGuia([])
      if (soltouPoder) somPoder()
      if (golpesDe(cj).length) ultimoJog.current = golpesDe(cj)
      const novaVida = { jog: Math.max(0, vd.jog - r.danoJog), ini: Math.max(0, vd.ini - r.danoIni) }
      setVida(novaVida)
      setEnergia({ jog: r.energiaJog, ini: r.energiaIni })
      setTonto({ jog: r.tontoJog, ini: r.tontoIni })
      setReplay({ ...r, comboJog: cj, comboIni: trIni, carga: cg })
      setCentroAberto(false)
      setTravado(true)
      const semi = batida / 16000
      r.passos.forEach((p, i) => {
        if (p.tipo === 'acerto' || p.tipo === 'interrompe') somGolpe(p.ponto, i * semi)
        else if (p.tipo === 'bloqueio') somBloqueio(!!p.duro, i * semi)
        else if (p.tipo === 'esquiva') somEsquiva(i * semi)
      })
      timers.push(setTimeout(() => {
        if (novaVida.jog <= 0 || novaVida.ini <= 0) { setFim(novaVida.ini <= 0 ? 'vitoria' : 'derrota'); return }
        setCombo([]); setToques(0); setTelegrafo([]); setTravado(false); setReplay(null)
        setN(x => x + 1)
      }, batida))
    }, batida))
    return () => timers.forEach(clearTimeout)
  }, [n, fim]) // eslint-disable-line react-hooks/exhaustive-deps

  const mudar = useCallback(novo => {
    const antigo = estado.current.combo
    if (novo.length > antigo.length) {
      const ultimo = novo[novo.length - 1]
      if (ultimo === ESQUIVA) somEsquiva(); else somLigar(golpesDe(novo).length - 1, ultimo)
    }
    setCombo(novo)
  }, [])
  const tocar = useCallback(() => {
    setToques(x => x + 1)
    somLigar(2 + Math.floor((toques + 1) / TOQUES_POR_CARGA), 'cab')
  }, [toques])
  const soltar = useCallback(() => setTravado(true), [])
  // Segurando a bolinha: a barra de poder enche (e você não ataca).
  useEffect(() => {
    if (!segurando) return
    const id = setInterval(() => setPoder(p => Math.min(PODER_MAX, p + PODER_POR_SEGUNDO / 10)), 100)
    return () => clearInterval(id)
  }, [segurando])

  if (fim) {
    return (
      <div className="pg-page pg-fim">
        <h1 className={`pg-titulo is-${fim}`}>{t(`games.ldi.batalha.${fim}`)}</h1>
        <p className="pg-texto">{t('games.ldi.batalha.trocas', { n: n + 1 })}</p>
        <button type="button" className="if-btn if-btn--primary" onClick={onSair}>{t('games.ldi.batalha.de_novo')}</button>
      </div>
    )
  }

  // Com o poder pronto, a sequência dele vale mesmo tonto.
  const max = guia.length ? Math.max(guia.length, maxGolpes(0, tonto.jog)) : maxGolpes(0, tonto.jog)
  const podeCarregar = travado && !replay && carga < cargaMax
  const progresso = carga > 0 && carga >= cargaMax ? 100 : carga >= cargaMax ? 0 : ((toques % TOQUES_POR_CARGA) / TOQUES_POR_CARGA) * 100

  return (
    <div className="pg-page pg-luta">
      <div className="pg-hud">
        <Barra rotulo={t('games.ldi.batalha.voce')} vida={vida.jog} max={VIDA_JOG} energia={energia.jog} tonto={tonto.jog} lado="jog" t={t} poder={poder} />
        <span className="pg-hud__vs">VS</span>
        <Barra rotulo={t(`games.ldi.batalha.fichas.${ficha.id}`)} vida={vida.ini} max={ficha.vida} energia={energia.ini} tonto={tonto.ini} lado="ini" t={t} />
      </div>
      <div className="pg-batida"><i key={`${n}-${replay ? 'r' : 'b'}`} className={replay ? 'is-replay' : ''} style={{ '--dur': `${batida}ms` }} /></div>

      <div className="pg-leitura">
        {replay ? <Replay t={t} r={replay} /> : (
          <p className={`pg-status${tonto.jog ? ' is-tonto' : ''}`}>
            {guia.length ? t('games.ldi.batalha.poder_pronto')
              : segurando ? t('games.ldi.batalha.carregando_poder')
              : tonto.jog ? t('games.ldi.batalha.tonto')
              : carga ? t('games.ldi.batalha.carga', { n: carga === 1 ? 'I' : 'II' })
              : podeCarregar ? t('games.ldi.batalha.toque_carregar', { n: TOQUES_POR_CARGA })
              : t(travado ? 'games.ldi.batalha.travado' : 'games.ldi.batalha.desenhe')}
          </p>
        )}
      </div>

      <Pentagrama combo={combo} telegrafo={replay ? [] : telegrafo} guia={replay ? [] : guia} centroAberto={centroAberto} travado={travado}
        segurandoOrbe={segurando} onOrbe={setSegurando}
        max={max} carga={carga} progresso={progresso} podeCarregar={podeCarregar} onMudar={mudar} onSoltar={soltar} onToque={tocar} />
      <div className="pg-rodape">
        <button type="button" className="pg-sair" onClick={() => setMudo(alternarMudo())} aria-label={t('games.ldi.batalha.som')}>{mudo ? '🔇' : '🔊'}</button>
        <button type="button" className="pg-sair" onClick={onSair}>{t('games.ldi.batalha.sair')}</button>
      </div>
    </div>
  )
}

// Replay da troca: o seu pentagrama contra o dele, e o passo a passo.
function Replay({ t, r }) {
  return (
    <div className="pg-replay">
      <div className="pg-replay__lados">
        <figure className="is-jog">
          <Pentagrama mini combo={r.comboJog} carga={r.carga} />
          <figcaption>{t('games.ldi.batalha.voce')}{r.carga ? ` · ${t('games.ldi.batalha.carga', { n: r.carga === 1 ? 'I' : 'II' })}` : ''}</figcaption>
        </figure>
        <figure className="is-ini">
          <Pentagrama mini telegrafo={r.comboIni} combo={[]} />
          <figcaption>{t('games.ldi.batalha.ele')}</figcaption>
        </figure>
      </div>
      <div className="pg-passos">
        {r.passos.map((p, i) => <p key={i} className={`pg-passo is-${p.tipo}${p.quem ? ` is-${p.quem}` : ''}`}>{textoPasso(t, p)}</p>)}
        {!r.passos.length && <p className="pg-passo is-vazio">{t('games.ldi.batalha.passo.nada')}</p>}
        {r.aberto.jog && <p className="pg-passo is-ini">{t('games.ldi.batalha.passo.guarda_aberta')}</p>}
        {r.tontoJog && <p className="pg-passo is-ini">{t('games.ldi.batalha.passo.ficou_tonto')}</p>}
        {r.tontoIni && <p className="pg-passo is-jog">{t('games.ldi.batalha.passo.deixou_tonto')}</p>}
      </div>
    </div>
  )
}

function Barra({ rotulo, vida, max, energia, tonto, lado, t, poder }) {
  const pct = `${(vida / max) * 100}%`
  return (
    <div className={`pg-barra is-${lado}`}>
      <span className="pg-sangue"><i className="pg-sangue__rastro" style={{ '--pct': pct }} /><i className="pg-sangue__vida" style={{ '--pct': pct }} /></span>
      {poder != null && (
        <span className={`pg-poder${poder >= PODER_MAX ? ' is-cheia' : ''}`}><i style={{ '--pct': `${poder}%` }} /></span>
      )}
      <div className="pg-barra__info"><b>{rotulo}</b><small>{tonto ? '💫 ' : ''}{t('games.ldi.batalha.energia', { n: energia })}</small></div>
    </div>
  )
}

function textoPasso(t, p) {
  const nome = id => t(`games.ldi.batalha.pontos.${id}`)
  if (p.tipo === 'poder') return t(`games.ldi.batalha.passo.poder_${p.quem}`, { poder: t(`games.ldi.batalha.poderes.${p.poder}`), dano: p.dano })
  if (p.tipo === 'congelado') return t('games.ldi.batalha.passo.congelado', { golpe: nome(p.ponto) })
  if (p.tipo === 'esquiva') return t(`games.ldi.batalha.passo.esquiva_${p.quem}`)
  if (p.tipo === 'vazio') return t('games.ldi.batalha.passo.vazio', { golpe: nome(p.ponto) })
  if (p.tipo === 'bloqueio') return t(p.duro ? `games.ldi.batalha.passo.bloqueio_duro_${p.duro}` : 'games.ldi.batalha.passo.bloqueio', { golpe: nome(p.pontoIni) })
  if (p.tipo === 'interrompe') return t(`games.ldi.batalha.passo.interrompe_${p.quem}`, { golpe: nome(p.ponto), fraco: nome(p.pontoFraco) })
  return t(`games.ldi.batalha.passo.${p.limpo ? 'limpo' : 'acerto'}_${p.quem}`, { golpe: nome(p.ponto), dano: p.dano })
}
