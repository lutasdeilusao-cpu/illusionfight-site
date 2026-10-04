import { useCallback, useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useFichas } from '../../../../context/FichasContext'
import { useReader } from '../../../../context/ReaderContext'
import Pentagrama from './Pentagrama'
import { FICHAS, PONTOS, ENERGIA_BASE, ENERGIA_MAX, ESQUIVA, MAX_POR_CARGA, TOQUES_POR_CARGA, PODER_MAX, PODER_POR_SEGUNDO, PODER_POR_TOQUE, PODERES, escolherCombo, escolherDefesaDele, resolverAtaque, comboLido, MAX_DEFESA, JANELA_TEMPO, golpesDe, maxGolpes, sequenciaDoPoder, acertouSequencia } from './motorPentagrama'
import { ligarSom, alternarMudo, estaMudo, tocarCompasso, somAcende, somLigar, somGolpe, somBloqueio, somEsquiva, somPoder, somPapel } from './somPentagrama'
import './Batalha.css'

// Laboratório da batalha do pentagrama (só admin; no dev abre pra qualquer um).
// Uma batida = um compasso de 8 tempos: você desenha o seu combo até a barra
// amarela acabar. O combo do inimigo não aparece — só com a habilidade de ler
// a origem, e aí só de onde nasce o 1º golpe. Soltou o traço, o último ponto
// pisca: tocar nele carrega. Depois vem um compasso de replay: o seu
// pentagrama contra o dele, inteiro, e o passo a passo.
// Tocar/segurar a bolinha em cima da cabeça enche a barra de poder; cheia, cada batida
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
            {['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8'].map(k => <li key={k}>{t(`games.ldi.batalha.regras.${k}`)}</li>)}
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
  const [papel, setPapel] = useState('ataque') // ataque | defesa (o papel do jogador nesta batida)
  const [vemGolpes, setVemGolpes] = useState(0)
  const [virou, setVirou] = useState(false)
  const [tempos, setTempos] = useState([]) // um por golpe: ligado no tempo do beat?
  const [recusa, setRecusa] = useState(null) // toque recusado: mostra o motivo e treme o tabuleiro
  const [fantasmas, setFantasmas] = useState([]) // atacando: a reação dele a cada golpe seu
  const inicioBatida = useRef(0)
  const historicoAtaque = useRef([])
  // Atacando: os pontos que ele defende, escolhidos no começo da batida.
  const defesaDele = useRef([])
  const mostrarFantasma = useCallback((id, ponto, estadoF, dur) => {
    setFantasmas(f => [...f.filter(x => x.id !== id), { id, ponto, estado: estadoF }])
    setTimeout(() => setFantasmas(f => f.filter(x => x.id !== id)), dur)
  }, [])
  const estado = useRef({})
  const golpes = golpesDe(combo).length
  const cargaMax = tonto.jog ? 0 : golpes === 0 ? 0 : golpes <= MAX_POR_CARGA[2] ? 2 : golpes <= MAX_POR_CARGA[1] ? 1 : 0
  const carga = Math.min(cargaMax, Math.floor(toques / TOQUES_POR_CARGA))
  estado.current = { combo, carga, energia, vida, tonto, poder, guia, papel, tempos }
  const ultimoJog = useRef([])

  // Uma batida: um ataca, o outro defende. Atacando, você desenha livre e ele
  // tenta adivinhar; defendendo, ele vem com N golpes (dá pra ouvir e ver a
  // contagem) e você espelha pra bloquear. Bloqueou ou esquivou, a vez vira.
  useEffect(() => {
    if (fim) return
    const timers = []
    const oitavo = batida / 8
    const meu = estado.current.papel
    inicioBatida.current = performance.now()
    defesaDele.current = meu === 'ataque'
      ? escolherDefesaDele(ficha, { ultimoDoJogador: ultimoJog.current, lido: historicoAtaque.current.length >= 2 && historicoAtaque.current.at(-1).join() === historicoAtaque.current.at(-2).join() })
      : []
    const comboIni = meu === 'defesa' ? escolherCombo(ficha, { ultimoDoJogador: ultimoJog.current, tonto: estado.current.tonto.ini }) : []
    tocarCompasso(batida)
    somPapel(meu)
    setVemGolpes(comboIni.length)
    comboIni.forEach((_, i) => timers.push(setTimeout(somAcende, oitavo * (i + 1))))
    // Só com a habilidade: de onde nasce o 1º golpe dele.
    if (verOrigem && comboIni.length) timers.push(setTimeout(() => setTelegrafo(comboIni.slice(0, 1)), oitavo))
    if (Math.random() < CHANCE_CENTRO) {
      const abre = batida * (0.3 + Math.random() * 0.45)
      timers.push(setTimeout(() => setCentroAberto(true), abre))
      timers.push(setTimeout(() => setCentroAberto(false), abre + CENTRO_MS * (batida / VELOCIDADES.normal)))
    }
    timers.push(setTimeout(() => {
      const { combo: cj, carga: cg, energia: en, vida: vd, guia: seq, tempos: tp } = estado.current
      const soltouPoder = seq.length > 0 && acertouSequencia(cj, seq) ? 'geloNegro' : null
      let r, comboJog = cj, comboOutro
      if (meu === 'ataque') {
        // Mesmo combo pela 3ª vez seguida: ele já leu e defende aqueles membros.
        const lido = !soltouPoder && comboLido(historicoAtaque.current, cj)
        comboOutro = lido ? escolherDefesaDele(ficha, { ultimoDoJogador: golpesDe(cj), lido: true }) : defesaDele.current
        r = resolverAtaque({ combo: cj, carga: cg, energia: en.jog, poder: soltouPoder, noTempo: tp }, { combo: comboOutro, energia: en.ini })
        if (lido) r.passos.unshift({ tipo: 'lido' })
        if (golpesDe(cj).length) historicoAtaque.current = [...historicoAtaque.current, golpesDe(cj)].slice(-3)
      } else {
        comboOutro = comboIni
        // Defesa às cegas: os pontos que você tocou, em qualquer ordem.
        r = resolverAtaque({ combo: comboIni, energia: en.ini }, { combo: cj, energia: en.jog, poder: soltouPoder })
      }
      // Normaliza atacante/defensor pra jogador/inimigo.
      const eu = meu === 'ataque' ? 'atk' : 'def'
      const quem = q => (q === eu ? 'jog' : 'ini')
      const danoJog = meu === 'ataque' ? r.danoAtk : r.danoDef
      const danoIni = meu === 'ataque' ? r.danoDef : r.danoAtk
      const passos = r.passos.map(p => ({ ...p, quem: p.quem ? quem(p.quem) : undefined, defensor: meu === 'ataque' ? 'ini' : 'jog' }))
      setPoder(p => (soltouPoder ? 0 : Math.min(PODER_MAX, p + (meu === 'defesa' ? r.poderGanhoDef : 0))))
      setGuia([])
      if (soltouPoder) somPoder()
      if (golpesDe(cj).length && meu === 'ataque') ultimoJog.current = golpesDe(cj)
      const novaVida = { jog: Math.max(0, vd.jog - danoJog), ini: Math.max(0, vd.ini - danoIni) }
      setVida(novaVida)
      const bonus = Math.min(ENERGIA_MAX, ENERGIA_BASE + r.bonusDef)
      setEnergia(meu === 'ataque' ? { jog: ENERGIA_BASE, ini: bonus } : { jog: bonus, ini: ENERGIA_BASE })
      setTonto(meu === 'ataque' ? { jog: Boolean(r.atkTonto), ini: Boolean(r.defTonto) } : { jog: Boolean(r.defTonto), ini: Boolean(r.atkTonto) })
      setVirou(r.vira)
      setReplay({ passos, comboJog, comboIni: comboOutro, carga: cg, papel: meu, vira: r.vira, tontoJog: meu === 'ataque' ? r.atkTonto : r.defTonto, tontoIni: meu === 'ataque' ? r.defTonto : r.atkTonto })
      setCentroAberto(false)
      setTravado(true)
      const semi = batida / 16000
      passos.forEach((p, i) => {
        if (meu === 'ataque' && (p.tipo === 'acerto' || p.tipo === 'bloqueio')) return // já tocou ao vivo, no fantasma
        if (p.tipo === 'acerto') somGolpe(p.ponto, i * semi)
        else if (p.tipo === 'bloqueio') somBloqueio(!!p.duro, i * semi)
        else if (p.tipo === 'esquiva') somEsquiva(i * semi)
      })
      timers.push(setTimeout(() => {
        if (novaVida.jog <= 0 || novaVida.ini <= 0) { setFim(novaVida.ini <= 0 ? 'vitoria' : 'derrota'); return }
        setCombo([]); setTempos([]); setFantasmas([]); setToques(0); setTelegrafo([]); setTravado(false); setReplay(null)
        setVirou(false)
        if (r.vira) setPapel(p => (p === 'ataque' ? 'defesa' : 'ataque'))
        setN(x => x + 1)
      }, batida))
    }, batida))
    return () => timers.forEach(clearTimeout)
  }, [n, fim]) // eslint-disable-line react-hooks/exhaustive-deps

  const mudar = useCallback(novo => {
    const antigo = estado.current.combo
    if (novo.length > antigo.length) {
      const ultimo = novo[novo.length - 1]
      if (ultimo === ESQUIVA) somEsquiva()
      else {
        // No tempo? perto de um dos 4 tempos da batida.
        const quarto = batida / 4
        const t = (performance.now() - inicioBatida.current) % quarto
        const noTempo = Math.min(t, quarto - t) <= JANELA_TEMPO * quarto
        setTempos(tp => [...tp, noTempo])
        somLigar(golpesDe(novo).length - 1, ultimo, noTempo)
        if (estado.current.papel === 'ataque') reagirAoGolpe(golpesDe(novo).length - 1, ultimo, noTempo)
      }
    }
    setCombo(novo)
  }, [batida]) // eslint-disable-line react-hooks/exhaustive-deps

  const recusar = useCallback(motivo => {
    setRecusa({ motivo, id: Date.now() })
    setTimeout(() => setRecusa(r => (r && Date.now() - r.id >= 900 ? null : r)), 950)
  }, [])

  // Atacando: cada golpe que você solta já mostra a reação dele, como
  // fantasma no ponto: azul entrou (cinza se fora do tempo, vale menos),
  // dourado ele defendeu, tracejado ele esquivou.
  function reagirAoGolpe(i, ponto, noTempo) {
    const dd = defesaDele.current
    const id = `atk-${i}`
    const dur = (batida / 4) * 0.9
    if (dd.includes(ESQUIVA)) return mostrarFantasma(id, ponto, 'vazio', dur)
    const bloqueou = dd.some(d => PONTOS[d].membro === PONTOS[ponto].membro)
    mostrarFantasma(id, ponto, bloqueou ? 'bloqueado' : noTempo ? 'acerto' : 'fora', dur)
    if (bloqueou) somBloqueio(false)
    else somGolpe(ponto)
  }
  const tocar = useCallback(() => {
    setToques(x => x + 1)
    somLigar(2 + Math.floor((toques + 1) / TOQUES_POR_CARGA), 'cab')
  }, [toques])
  const tocarOrbe = useCallback(() => setPoder(p => Math.min(PODER_MAX, p + PODER_POR_TOQUE)), [])
  // Barra cheia: a sequência do poder aparece na hora, na batida em que você está.
  useEffect(() => {
    if (poder >= PODER_MAX && !guia.length && !replay) setGuia(sequenciaDoPoder(PODERES.geloNegro))
  }, [poder, guia.length, replay])
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
  const maxBase = papel === 'defesa' ? Math.min(MAX_DEFESA, maxGolpes(0, tonto.jog)) : maxGolpes(0, tonto.jog)
  const max = guia.length ? Math.max(guia.length, maxBase) : maxBase
  const podeCarregar = !travado && golpes > 0 && carga < cargaMax
  const progresso = carga > 0 && carga >= cargaMax ? 100 : carga >= cargaMax ? 0 : ((toques % TOQUES_POR_CARGA) / TOQUES_POR_CARGA) * 100

  return (
    <div className="pg-page pg-luta">
      {/* Sair e som no topo, longe do tabuleiro e da bolinha de energia. */}
      <div className="pg-topo">
        <button type="button" className="pg-sair" onClick={onSair}>{t('games.ldi.batalha.sair')}</button>
        <button type="button" className="pg-sair" onClick={() => setMudo(alternarMudo())} aria-label={t('games.ldi.batalha.som')}>{mudo ? '🔇' : '🔊'}</button>
      </div>
      <div className="pg-hud">
        <Barra rotulo={t('games.ldi.batalha.voce')} vida={vida.jog} max={VIDA_JOG} energia={energia.jog} tonto={tonto.jog} lado="jog" t={t} poder={poder} />
        <span className="pg-hud__vs">VS</span>
        <Barra rotulo={t(`games.ldi.batalha.fichas.${ficha.id}`)} vida={vida.ini} max={ficha.vida} energia={energia.ini} tonto={tonto.ini} lado="ini" t={t} />
      </div>
      <div className="pg-batida"><i key={`${n}-${replay ? 'r' : 'b'}`} className={replay ? 'is-replay' : ''} style={{ '--dur': `${batida}ms` }} /></div>

      <div className="pg-leitura">
        {replay ? <Replay t={t} r={replay} /> : (
          <>
            <p key={n} className={`pg-papel is-${papel}`}>{t(`games.ldi.batalha.papel.${papel}`)}</p>
            <p className={`pg-status${tonto.jog ? ' is-tonto' : ''}`}>
              {guia.length ? t('games.ldi.batalha.poder_pronto')
                : segurando ? t('games.ldi.batalha.carregando_poder')
                : tonto.jog ? t('games.ldi.batalha.tonto')
                : carga ? t('games.ldi.batalha.carga', { n: carga === 1 ? 'I' : 'II' })
                : papel === 'defesa' ? t('games.ldi.batalha.status_defesa', { n: vemGolpes })
                : podeCarregar ? t('games.ldi.batalha.toque_carregar', { n: TOQUES_POR_CARGA })
                : t('games.ldi.batalha.status_ataque')}
            </p>
          </>
        )}
      </div>

      {/* O palco pulsa no tempo (4 por batida), na cor do papel. */}
      {recusa && <p key={recusa.id} className="pg-recusa">{t(`games.ldi.batalha.recusa.${recusa.motivo}`)}</p>}
      <div key={`${n}-${replay ? 'r' : 'b'}`} className={`pg-palco is-${replay ? 'replay' : papel}${recusa ? ' is-treme' : ''}`} style={{ '--quarto': `${batida / 4}ms` }}>
        <Pentagrama combo={combo} telegrafo={replay ? [] : telegrafo} guia={replay ? [] : guia} centroAberto={centroAberto} travado={travado}
          segurandoOrbe={segurando} onOrbe={setSegurando} onOrbeToque={tocarOrbe}
          max={max} carga={carga} progresso={progresso} podeCarregar={podeCarregar} onMudar={mudar} onToque={tocar}
          tempos={tempos} quarto={batida / 4} fantasmas={replay ? [] : fantasmas}
          onRecusado={() => recusar(tonto.jog ? 'tonto' : papel === 'defesa' ? 'maximo_defesa' : 'maximo')} />
      </div>
    </div>
  )
}

// Replay da troca: o seu pentagrama contra o dele, e o passo a passo.
function Replay({ t, r }) {
  return (
    <div className="pg-replay">
      {r.vira && <p className="pg-virada">{t(r.papel === 'ataque' ? 'games.ldi.batalha.virada_ele' : 'games.ldi.batalha.virada_voce')}</p>}
      <div className="pg-replay__lados">
        <figure className="is-jog">
          <Pentagrama mini combo={r.comboJog} carga={r.carga} />
          <figcaption>{t('games.ldi.batalha.voce')} · {t(`games.ldi.batalha.papel.${r.papel}`)}</figcaption>
        </figure>
        <figure className="is-ini">
          <Pentagrama mini telegrafo={r.comboIni} combo={[]} />
          <figcaption>{t('games.ldi.batalha.ele')} · {t(`games.ldi.batalha.papel.${r.papel === 'ataque' ? 'defesa' : 'ataque'}`)}</figcaption>
        </figure>
      </div>
      <div className="pg-passos">
        {r.passos.map((p, i) => <p key={i} className={`pg-passo is-${p.tipo}${p.quem ? ` is-${p.quem}` : ''}`}>{textoPasso(t, p)}</p>)}
        {!r.passos.length && <p className="pg-passo is-vazio">{t('games.ldi.batalha.passo.nada')}</p>}
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
        <span className={`pg-poder${poder >= PODER_MAX ? ' is-cheia' : poder >= 90 ? ' is-n3' : poder >= 70 ? ' is-n2' : poder >= 50 ? ' is-n1' : ''}`}>
          <i style={{ '--pct': `${poder}%` }} />
          {poder >= PODER_MAX && <b className="pg-poder__super">{t('games.ldi.batalha.super')}</b>}
        </span>
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
  if (p.tipo === 'lido') return t('games.ldi.batalha.passo.lido')
  if (p.tipo === 'parado') return t(`games.ldi.batalha.passo.parado_${p.quem}`)
  if (p.tipo === 'bloqueio') return t(`games.ldi.batalha.passo.bloqueou_${p.defensor}${p.duro ? '_duro' : ''}`, { golpe: nome(p.ponto) })
  return t(`games.ldi.batalha.passo.acerto_${p.quem}`, { golpe: nome(p.ponto), dano: p.dano }) + (p.noTempo ? ` ${t('games.ldi.batalha.passo.no_tempo')}` : '')
}
