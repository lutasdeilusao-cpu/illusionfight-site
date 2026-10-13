import { useCallback, useEffect, useRef, useState } from 'react'
import { ligarSom, alternarMudo, estaMudo, somGolpe, somBloqueio, somEsquiva, somPoder, somBatida, tocarMusica, pararMusica, latenciaSom } from './som'
import { PODERES, KIT, TETO_SUPER } from './campanha'
import Arena3D from './Arena3D'
import './LutaRitmo.css'

// Luta rítmica. Cada nota nasce pequena, longe, e vem crescendo até o ponto
// dela; quando o anel encosta, ela pulsa: é a hora de tocar.
// Cada golpe tem o seu lugar na arena:
//   soco 👊   vem pelos lados (esquerda ou direita)
//   chute 🦶  vem de baixo
//   cabeçada  sai do centro e sobe
//   bloqueio ✋ é o golpe DELE chegando: tocou na hora, defende
//   esquiva 💨 é no centro: tocou na hora, desvia
// Errar um ataque seu não dói; deixar passar um golpe dele, dói.
// Energia cheia vira SUPER: rajada de notas douradas; acertou todas, golpe pesado.
// Os mais fortes também soltam super: notas vermelhas pra defender; cada uma que
// passa é uma fatia do dano. Nenhum super tira mais que TETO_SUPER da vida cheia.
// A luta anda no tempo da música dela (ficha.musica); sem música, a batida sintetizada.
// Tudo de uma mão: leitura em cima, arena no meio-baixo, botão do super embaixo.

const VOO = 1500 // ms que a nota leva crescendo até a hora certa
const JANELA = { perfeito: 70, bom: 150 }
const SOME = 190 // passou disso depois da hora, conta como erro
const VIDA = 100
const ENERGIA_MAX = 100

const TIPOS = {
  soco: { icone: '👊', dano: 7, energia: 12, dele: false },
  chute: { icone: '🦶', dano: 10, energia: 14, dele: false },
  cabecada: { icone: '💥', dano: 13, energia: 16, dele: false },
  bloqueio: { icone: '✋', dano: 12, energia: 8, dele: true },
  esquiva: { icone: '💨', dano: 14, energia: 10, dele: true },
  super: { icone: '⚡', dano: 0, energia: 0, dele: false },
  superDele: { icone: '⚡', dano: 0, energia: 0, dele: true },
}

const entre = (a, b) => a + Math.random() * (b - a)
const sorteiaPeso = pesos => {
  const lista = Object.entries(pesos)
  let r = Math.random() * lista.reduce((s, [, p]) => s + p, 0)
  for (const [k, p] of lista) if ((r -= p) <= 0) return k
  return lista[0][0]
}

// De onde a nota sai (de) e onde ela tem que ser tocada (alvo), em % da arena.
function trajetoUm(tipo) {
  if (tipo === 'soco') {
    const esq = Math.random() < 0.5, y = entre(26, 66)
    return esq ? { de: { x: -12, y }, alvo: { x: entre(14, 34), y } } : { de: { x: 112, y }, alvo: { x: entre(66, 86), y } }
  }
  if (tipo === 'chute') { const x = entre(18, 82); return { de: { x, y: 114 }, alvo: { x, y: entre(72, 88) } } }
  if (tipo === 'cabecada') return { de: { x: 50, y: 50 }, alvo: { x: entre(30, 70), y: entre(12, 28) } }
  if (tipo === 'esquiva') return { de: { x: 50, y: 50 }, alvo: { x: 50, y: 50 } }
  return { de: { x: 50, y: 50 }, alvo: { x: entre(20, 80), y: entre(28, 66) } }
}
// Nunca uma nota em cima da outra: sorteia o alvo até ficar longe das que ainda
// estão vindo (no tempo de tela delas), senão fica confuso saber qual é a vez.
function trajeto(tipo, vindo) {
  let melhor = null, folga = -1
  for (let i = 0; i < 12; i++) {
    const tj = trajetoUm(tipo)
    const d = Math.min(99, ...vindo.map(n => Math.hypot(n.alvo.x - tj.alvo.x, n.alvo.y - tj.alvo.y)))
    if (d > folga) { melhor = tj; folga = d }
    if (d >= 32) break
  }
  return melhor
}

// Frases rítmicas de 2 compassos, em colcheias (0 a 15). A caixa cai em 2, 6,
// 10 e 14: é nela que as notas moram. Notas sem pausa entre elas (até 1 tempo) viram um grupo
// ("tá-tá-tá") do mesmo golpe. Nível 1 é o treino; 4, o chefão.
const FRASES = {
  // nível 1: golpes no tempo, em grupos de 3 ou 4 com descanso no meio (pra pegar o desatento)
  1: [[0, 2, 4, 8, 10, 12], [0, 2, 4, 6, 10, 12, 14], [2, 4, 6, 10, 12, 14], [0, 2, 4, 6, 12, 14], [0, 2, 4, 10, 12, 14]],
  2: [[2, 6, 10, 14], [2, 6, 12, 13, 14], [6, 10, 11, 12], [2, 10, 12, 14], [2, 3, 4, 10]],
  3: [[2, 6, 12, 13, 14], [2, 3, 4, 10, 14], [6, 7, 8, 12, 13, 14], [2, 6, 10, 11, 12, 14], [0, 2, 6, 8, 10, 14]],
  4: [[2, 4, 6, 10, 12, 13, 14], [0, 2, 3, 4, 8, 10, 11, 12], [2, 3, 4, 6, 10, 11, 12, 14], [2, 6, 7, 8, 10, 12, 13, 14]],
  5: [[0, 2, 3, 4, 6, 8, 10, 11, 12, 14], [2, 3, 4, 5, 6, 10, 12, 13, 14], [0, 1, 2, 6, 8, 9, 10, 12, 13, 14], [2, 4, 5, 6, 8, 10, 11, 12, 13, 14]],
}
// Os grupos revezam: um seu, um dele (às vezes, `defesaPeso`, dois dele seguidos).
// `vez` guarda de quem foi o último grupo entre uma frase e outra.
function frase(ficha, inicio, n, batida, vez) {
  const nivel = n < 2 ? ficha.niveis[0] : ficha.niveis[Math.floor(Math.random() * ficha.niveis.length)]
  const lista = FRASES[nivel]
  const passos = lista[Math.floor(Math.random() * lista.length)]
  const notas = []
  let tipo = null, anterior = -9
  for (const p of passos) {
    // começa grupo novo depois de uma pausa (mais de 1 tempo sem nota)
    if (p - anterior > 2) {
      vez.dele = vez.dele == null ? false : vez.dele ? Math.random() < ficha.defesaPeso * 0.5 : true
      tipo = vez.dele ? sorteiaPeso(ficha.defesas) : sorteiaPeso(ficha.golpes)
    }
    notas.push({ tipo, hora: inicio + p * batida / 2 })
    anterior = p
  }
  return notas
}

export default function LutaRitmo({ t, ficha, onSair, onResultado }) {
  const [, setQuadro] = useState(0)
  const [fim, setFim] = useState(null)
  const [mudo, setMudo] = useState(estaMudo())
  const [sem3d, setSem3d] = useState(false)
  const semTresD = useCallback(() => setSem3d(true), [])
  const estado = useRef(null)
  const id = useRef(0)
  const BATIDA = 60000 / ficha.bpm

  const novaLuta = useCallback(() => {
    const agora = performance.now() + 900
    estado.current = {
      inicio: agora, notas: [], proxFrase: agora + Math.ceil(VOO / (8 * BATIDA)) * 8 * BATIDA, nFrase: 0, proxBatida: agora,
      vida: VIDA, inimigo: ficha.vida, energia: 0, combo: 0, melhorCombo: 0,
      aviso: null, tremor: 0, poder: null, atordoadoAte: 0, vez: { dele: null }, pausaAte: 0, ultimo: agora, flash: 0,
      // com música: nada é agendado até ela começar a tocar (aí o tempo da luta casa com o dela)
      faixa: ficha.musica ? tocarMusica(ficha.musica.url, ficha.musica.velocidade) : null, sincronizado: !ficha.musica, ancora: 0, criadoEm: agora,
    }
    setFim(null)
  }, [ficha, BATIDA])

  useEffect(() => { ligarSom(); novaLuta() }, [novaLuta])
  useEffect(() => pararMusica, [])
  useEffect(() => { if (fim) pararMusica() }, [fim])

  const avisar = (texto, cls) => { estado.current.aviso = { texto, cls, ate: performance.now() + 600 } }

  // Laço: agenda frases, toca a batida, derruba as notas que passaram da hora.
  useEffect(() => {
    if (fim) return
    let raf
    const passo = () => {
      const s = estado.current
      const agora = performance.now()
      if (s) {
        const empurra = dt => {
          s.inicio += dt; s.proxFrase += dt; s.proxBatida += dt
          for (const n of s.notas) if (n.estado === 'vindo') n.hora += dt
        }
        const f = s.faixa
        if (f && f.error) { pararMusica(); s.faixa = null; s.sincronizado = true; s.inicio = agora; s.proxBatida = agora; s.proxFrase = Math.max(s.proxFrase, agora + VOO) }
        else if (f && f.ended) {
          // Acabou a música: ela recomeça e a luta espera a entrada da batida de novo.
          f.currentTime = 0; f.play().catch(() => {})
          s.sincronizado = false; s.criadoEm = agora
        } else if (f && !s.sincronizado) {
          // A música começou. A luta espera a introdução: a 1ª nota cai na batida em
          // que o groove entra (`entrada`, medida no arquivo); dali o tempo é o dela.
          // (tempo do arquivo / velocidade = tempo real; + o atraso do som até o ouvido)
          const vel = ficha.musica.velocidade || 1
          if (f.currentTime > 0.05 && !f.paused) {
            const zero = agora - f.currentTime * 1000 / vel + ficha.musica.entrada * 1000 / vel + latenciaSom()
            const compasso = 8 * BATIDA
            s.inicio = zero + Math.max(0, Math.ceil((agora + VOO - zero) / compasso)) * compasso
            s.proxBatida = s.inicio
            s.proxFrase = s.inicio
            s.ancora = agora - f.currentTime * 1000 / vel
            s.sincronizado = true
            if (s.recomecaAte) s.recomecaAte = s.inicio - VOO / 2
          } else if (agora > s.criadoEm + 20000) {
            // a música não tocou de jeito nenhum: cala ela e segue na batida sintetizada
            // (nunca as duas juntas — a música carregando devagar só atrasa o começo)
            pararMusica(); s.faixa = null; s.sincronizado = true
            s.inicio = agora; s.proxBatida = agora
            s.proxFrase = agora + Math.ceil(VOO / (8 * BATIDA)) * 8 * BATIDA
          }
        } else if (f) {
          // Corrige o desvio do relógio contra a música (o áudio manda).
          const desvio = (agora - f.currentTime * 1000 / (ficha.musica.velocidade || 1)) - s.ancora
          if (Math.abs(desvio) > 30 && !f.paused) { empurra(desvio); s.ancora += desvio }
        }
        // Tomou golpe: sem música, o tempo para um instante (tudo é empurrado junto).
        // Com música, não: ela não para, então a luta também não.
        if (agora < s.pausaAte && !s.faixa) empurra(agora - s.ultimo)
        s.ultimo = agora
        if (!s.sincronizado) { setQuadro(q => q + 1); raf = requestAnimationFrame(passo); return }
        // Perto do fim da música não agenda mais nada: avisa que ela vai recomeçar.
        const fimMusica = s.faixa && s.faixa.duration ? s.ancora + s.faixa.duration * 1000 / (ficha.musica.velocidade || 1) : Infinity
        while (s.proxFrase < agora + VOO + 8 * BATIDA) {
          if (s.proxFrase + 8 * BATIDA > fimMusica - 200) { s.recomecaAte = Infinity; break }
          const sd = ficha.superDele
          if (sd && !s.poder && s.nFrase >= 2 && s.nFrase % sd.cada === 0) { superDele(s, sd); continue }
          for (const n of frase(ficha, s.proxFrase, s.nFrase, BATIDA, s.vez)) {
            if (TIPOS[n.tipo].dele && n.hora < s.atordoadoAte) continue // atordoado: ele não ataca
            s.notas.push({ ...n, ...trajeto(n.tipo, s.notas.filter(o => o.estado === 'vindo' && Math.abs(o.hora - n.hora) < VOO)), id: ++id.current, estado: 'vindo' })
          }
          s.proxFrase += 8 * BATIDA; s.nFrase++
        }
        while (s.proxBatida <= agora) {
          const passoB = Math.round((s.proxBatida - s.inicio) / (BATIDA / 2)) % 8
          if (!s.faixa) somBatida(passoB)
          if (passoB % 2 === 0) s.pulso = { em: s.proxBatida, caixa: passoB === 2 || passoB === 6 }
          s.proxBatida += BATIDA / 2
        }
        for (const n of s.notas) {
          if (n.estado !== 'vindo' || agora - n.hora <= SOME) continue
          n.estado = 'errou'; n.fimEm = agora
          s.combo = 0
          if (n.tipo === 'superDele') avisar(t('games.ldi.batalha.ritmo.apanhou'), 'is-mal')
          else if (TIPOS[n.tipo].dele) apanhar(s, n, agora)
          else avisar(t('games.ldi.batalha.ritmo.errou'), 'is-raspou')
        }
        fecharSuper(s, agora)
        s.notas = s.notas.filter(n => n.estado === 'vindo' || agora - n.fimEm < 380)
        if (s.apresenta && agora > s.apresenta.ate) s.apresenta = null
        if (s.apresenta) { /* espera a apresentação acabar */ }
        else if (s.inimigo <= 0) setFim('vitoria')
        else if (s.vida <= 0) setFim('derrota')
      }
      setQuadro(q => q + 1)
      raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [fim, t, ficha, BATIDA])

  // Tomou: para tudo um instante, tela vermelha, treme, POW.
  const apanhar = (s, n, agora) => {
    s.vida = Math.max(0, s.vida - TIPOS[n.tipo].dano)
    s.pausaAte = agora + 280; s.tremor = agora + 420; s.flash = agora + 420; s.apanhouEm = agora
    somGolpe('cabecada')
    avisar(t('games.ldi.batalha.ritmo.apanhou'), 'is-mal')
  }

  // SUPER em três tempos. 1) CARGA: a luta para (some tudo dele), só a virada do
  // poder, com mais respiro entre as notas e espalhada pela arena; cada acerto
  // enche a barra de carga (cada nota vale uma fatia igual). 2) APRESENTAÇÃO: o
  // tempo congela e o golpe é lançado com a carga que você juntou. 3) A luta volta.
  const APRESENTA = 1700
  // próxima virada de compasso a partir de `hora` (a luta volta sempre na cabeça do compasso)
  const noCompasso = (s, hora) => s.inicio + Math.ceil((hora - s.inicio) / (8 * BATIDA)) * 8 * BATIDA
  // Em volta da arena, uma nota em cada ponto do círculo, longe uma da outra.
  const emRoda = (total, i, giro) => {
    const ang = giro + (i / total) * Math.PI * 2 * (total > 4 ? 1 : 0.85)
    return { x: 50 + Math.cos(ang) * 33, y: 50 + Math.sin(ang) * 33 }
  }

  // Super DELE: ocupa a frase inteira com a virada dele; você defende nota a nota.
  const superDele = (s, sd) => {
    const base = s.proxFrase, giro = Math.random() * Math.PI * 2
    sd.notas.forEach((q, i) => {
      s.notas.push({ tipo: 'superDele', hora: base + q * BATIDA / 2, de: { x: 50, y: 50 }, alvo: emRoda(sd.notas.length, i, giro), id: ++id.current, estado: 'vindo' })
    })
    s.poder = { dele: true, dano: sd.dano, total: sd.notas.length, acertos: 0, mostraEm: base - VOO }
    s.proxFrase = noCompasso(s, base + (sd.notas[sd.notas.length - 1] + 1) * BATIDA / 2 + APRESENTA + BATIDA)
    s.nFrase++
  }
  const dispararSuper = id_ => {
    const s = estado.current
    if (s.poder) return
    const pd = PODERES[id_]
    const agora = performance.now()
    s.energia = 0
    somPoder()
    // A luta para: tira todas as notas que ainda estão vindo.
    s.notas = s.notas.filter(n => n.estado !== 'vindo')
    const passo = BATIDA / 2
    const base = Math.ceil((agora + VOO - s.inicio) / BATIDA) * BATIDA + s.inicio
    const total = pd.virada.length
    const giro = Math.random() * Math.PI * 2
    pd.virada.forEach((q, i) => {
      s.notas.push({ tipo: 'super', hora: base + q * passo, de: { x: 50, y: 50 }, alvo: emRoda(total, i, giro), id: ++id.current, estado: 'vindo' })
    })
    s.poder = { id: id_, total, acertos: 0, mostraEm: 0 }
    s.proxFrase = noCompasso(s, Math.max(s.proxFrase, base + (pd.virada[total - 1] + 1) * passo + APRESENTA + BATIDA))
  }

  // Última nota da virada resolvida: congela o tempo e apresenta o golpe; o efeito
  // sai na proporção da carga juntada.
  const fecharSuper = (s, agora) => {
    if (!s.poder || s.notas.some(n => (n.tipo === 'super' || n.tipo === 'superDele') && n.estado === 'vindo')) return
    const frac = s.poder.acertos / s.poder.total
    if (s.poder.dele) {
      // o que passou da defesa vira dano (no máximo TETO_SUPER da sua vida cheia)
      const dano = Math.round(Math.min(s.poder.dano, VIDA * TETO_SUPER) * (1 - frac))
      s.vida = Math.max(0, s.vida - dano)
      s.apresenta = { dele: true, frac, ate: agora + APRESENTA }
      if (dano > 0) { somGolpe('cabecada'); s.tremor = agora + 500; s.flash = agora + 500; s.apanhouEm = agora }
      else somBloqueio(true)
      s.pausaAte = agora + APRESENTA
      s.poder = null
      return
    }
    const pd = PODERES[s.poder.id]
    if (pd.dano) s.inimigo = Math.max(0, s.inimigo - Math.round(Math.min(pd.dano, ficha.vida * TETO_SUPER) * frac))
    if (pd.cura) s.vida = Math.min(VIDA, s.vida + Math.round(pd.cura * frac))
    if (pd.atordoa && frac > 0) s.atordoadoAte = agora + APRESENTA + pd.atordoa * frac
    s.apresenta = { id: s.poder.id, frac, ate: agora + APRESENTA }
    s.pausaAte = agora + APRESENTA
    if (frac > 0) { somPoder(); s.tremor = agora + 500; s.golpeEm = agora }
    s.poder = null
  }

  const tocar = (n, e) => {
    e.preventDefault()
    const s = estado.current
    if (!s || n.estado !== 'vindo') return
    const agora = performance.now()
    const dif = Math.abs(agora - n.hora)
    if (dif > JANELA.bom * 1.6) {
      // Fora da hora: perdeu a chance. A nota some, a tela treme e fica vermelha;
      // se era golpe dele, você toma.
      n.estado = 'errou'; n.fimEm = agora; s.combo = 0
      if (TIPOS[n.tipo].dele && n.tipo !== 'superDele') apanhar(s, n, agora)
      else { s.tremor = agora + 260; s.flash = agora + 260; avisar(t('games.ldi.batalha.ritmo.fora_da_hora'), 'is-mal') }
      return
    }
    const nota = dif <= JANELA.perfeito ? 'perfeito' : dif <= JANELA.bom ? 'bom' : 'raspou'
    const mult = nota === 'perfeito' ? 1.5 : nota === 'bom' ? 1 : 0.5
    const tp = TIPOS[n.tipo]
    n.estado = 'acertou'; n.nota = nota; n.fimEm = agora
    s.combo++; s.melhorCombo = Math.max(s.melhorCombo, s.combo)
    if (n.tipo === 'bloqueio' || n.tipo === 'superDele') somBloqueio(nota === 'perfeito')
    else if (n.tipo === 'esquiva') somEsquiva()
    else {
      s.inimigo = Math.max(0, s.inimigo - Math.round(tp.dano * mult * (1 + Math.min(s.combo, 20) * 0.02)))
      s.golpeEm = agora
      somGolpe(n.tipo)
    }
    if (n.tipo === 'super' || n.tipo === 'superDele') { if (s.poder) s.poder.acertos++ }
    else s.energia = Math.min(ENERGIA_MAX, s.energia + tp.energia * mult)
    avisar(t(`games.ldi.batalha.ritmo.${n.tipo === 'esquiva' ? 'desviou' : nota}`), `is-${nota}`)
  }

  const s = estado.current
  if (!s) return <div className="rt-page" />
  const agora = performance.now()
  const aviso = s.aviso && s.aviso.ate > agora ? s.aviso : null

  return (
    <div className={`rt-page${s.tremor > agora ? ' is-tremendo' : ''}`}>
      {s.flash > agora && <div key={s.flash} className="rt-flash" aria-hidden="true">{s.pausaAte > agora - 400 && s.vida >= 0 ? t('games.ldi.batalha.ritmo.pow') : ''}</div>}
      <header className="rt-topo">
        <button type="button" className="rt-sair" onClick={onSair}>{t('games.ldi.batalha.sair')}</button>
        <div className="rt-barras">
          <div className="rt-barra rt-barra--ele">
            <span>{t(`games.ldi.batalha.inimigos.${ficha.id}.nome`)}</span>
            <i style={{ '--v': s.inimigo / ficha.vida }} />
          </div>
          <div className="rt-barra rt-barra--voce">
            <span>{t('games.ldi.batalha.voce')}</span>
            <i style={{ '--v': s.vida / VIDA }} />
          </div>
        </div>
        <button type="button" className="rt-sair" aria-label={t('games.ldi.batalha.som')} onClick={() => setMudo(alternarMudo())}>{mudo ? '🔇' : '🔊'}</button>
      </header>

      <div className="rt-placar">
        <b>{s.combo > 1 ? t('games.ldi.batalha.ritmo.combo', { n: s.combo }) : ''}</b>
        {aviso && <strong key={s.aviso.ate} className={`rt-aviso ${aviso.cls}`}>{aviso.texto}</strong>}
      </div>

      <div className="rt-arena">
        {sem3d && <div className="rt-fundo" aria-hidden="true" />}
        {!sem3d && <Arena3D estadoRef={estado} voo={VOO} janela={JANELA.bom} lutador={ficha.id <= 2 ? 'robo' : 'aventureiro'} onFalha={semTresD} />}
        {s.poder && agora >= s.poder.mostraEm && (
          <div className={`rt-carga${s.poder.dele ? ' is-dele' : ''}`} aria-hidden="true">
            <span>{s.poder.dele ? t('games.ldi.batalha.ritmo.super_dele') : t(`games.ldi.batalha.ritmo.poderes.${s.poder.id}.nome`)}</span>
            <i style={{ '--v': s.poder.acertos / s.poder.total }} />
            <b>{Math.round(s.poder.acertos / s.poder.total * 100)}%</b>
          </div>
        )}
        {s.apresenta && (
          <div key={s.apresenta.ate} className={`rt-lanca${s.apresenta.dele ? ' is-dele' : ''}${!s.apresenta.dele && s.apresenta.frac === 0 ? ' is-falhou' : ''}`} aria-hidden="true">
            <b>{s.apresenta.dele ? t('games.ldi.batalha.ritmo.super_dele_nome') : t(`games.ldi.batalha.ritmo.poderes.${s.apresenta.id}.nome`)}</b>
            <strong>{t(s.apresenta.dele ? 'games.ldi.batalha.ritmo.defendeu_pct' : 'games.ldi.batalha.ritmo.super_pct', { n: Math.round(s.apresenta.frac * 100) })}</strong>
          </div>
        )}
        {s.recomecaAte > agora && !s.notas.some(n => n.estado === 'vindo') && (
          <div className="rt-recomeca" aria-live="polite">{t('games.ldi.batalha.ritmo.recomeca')}</div>
        )}
        {s.pulso && <div key={s.pulso.em} className={`rt-pulso${s.pulso.caixa ? ' is-caixa' : ''}`} aria-hidden="true" />}
        {!fim && s.notas.map(n => {
          // 0 = acabou de nascer, longe; 1 = hora de tocar.
          const p = Math.min(1.08, Math.max(0, 1 - (n.hora - agora) / VOO))
          // acende um pouco ANTES do beat e segura um pouco DEPOIS (a janela do toque)
          const perto = n.estado === 'vindo' && agora >= n.hora - JANELA.perfeito && agora <= n.hora + JANELA.bom
          // Com 3D, o botão de toque segue a bola (n.tela, gravado pela Arena3D).
          const tres = !sem3d && n.tela
          const x = tres ? n.tela.x : n.de.x + (n.alvo.x - n.de.x) * Math.min(1, p)
          const y = tres ? n.tela.y : n.de.y + (n.alvo.y - n.de.y) * Math.min(1, p)
          return (
            <button
              key={n.id}
              type="button"
              className={`rt-nota rt-nota--${n.tipo} is-${n.estado}${perto ? ' is-agora' : ''}${n.nota ? ` is-${n.nota}` : ''}${tres ? ' is-3d' : ''}`}
              style={{ left: `${x}%`, top: `${y}%`, '--p': p, '--d': tres ? `${Math.max(30, n.tela.rpx * 2)}px` : undefined, zIndex: Math.round(p * 100) }}
              onPointerDown={e => tocar(n, e)}
            >
              <span className="rt-nota__anel" style={{ '--a': Math.max(1, 1 + (n.hora - agora) / VOO * 1.6) }} />
              <span className="rt-nota__icone">{TIPOS[n.tipo].icone}</span>
            </button>
          )
        })}
      </div>

      <footer className="rt-base">
        {s.energia >= ENERGIA_MAX && !s.poder ? (
          <div className="rt-poderes">
            {(KIT[ficha.id] || ['rajada']).map(pid => (
              <button key={pid} type="button" className="rt-poder" onClick={() => dispararSuper(pid)}>
                <b>{t(`games.ldi.batalha.ritmo.poderes.${pid}.nome`)}</b>
                <small>{t(`games.ldi.batalha.ritmo.poderes.${pid}.desc`)}</small>
                <i className="rt-poder__notas">{'●'.repeat(PODERES[pid].virada.length)}</i>
              </button>
            ))}
          </div>
        ) : (
          <div className={`rt-energia${s.poder && !s.poder.dele ? ' is-cheia' : ''}`} style={{ '--v': s.poder && !s.poder.dele ? 1 : s.energia / ENERGIA_MAX }}>
            <i />
            <span>{s.poder ? t(s.poder.dele ? 'games.ldi.batalha.ritmo.super_dele' : `games.ldi.batalha.ritmo.poderes.${s.poder.id}.nome`) : t('games.ldi.batalha.energia', { n: Math.floor(s.energia) })}</span>
          </div>
        )}
        <p className="rt-legenda">{t('games.ldi.batalha.ritmo.legenda')}</p>
      </footer>

      {fim && (
        <div className="rt-fim">
          <h2 className={`rt-fim__titulo is-${fim}`}>{t(`games.ldi.batalha.${fim}`)}</h2>
          <p>{t('games.ldi.batalha.ritmo.melhor_combo', { n: s.melhorCombo })}</p>
          {onResultado ? (
            <button type="button" className="rt-btn" onClick={() => onResultado(fim)}>{t(fim === 'vitoria' ? 'games.ldi.batalha.ritmo.continuar' : 'games.ldi.batalha.de_novo')}</button>
          ) : (
            <>
              <button type="button" className="rt-btn" onClick={novaLuta}>{t('games.ldi.batalha.de_novo')}</button>
              <button type="button" className="rt-sair rt-sair--fim" onClick={onSair}>{t('games.ldi.batalha.sair')}</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
