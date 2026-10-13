import { useCallback, useEffect, useRef, useState } from 'react'
import { ligarSom, alternarMudo, estaMudo, somGolpe, somBloqueio, somEsquiva, somPoder, somBatida } from './som'
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
  super: { icone: '⚡', dano: 8, energia: 0, dele: false },
}

const entre = (a, b) => a + Math.random() * (b - a)
const sorteiaPeso = pesos => {
  const lista = Object.entries(pesos)
  let r = Math.random() * lista.reduce((s, [, p]) => s + p, 0)
  for (const [k, p] of lista) if ((r -= p) <= 0) return k
  return lista[0][0]
}

// De onde a nota sai (de) e onde ela tem que ser tocada (alvo), em % da arena.
function trajeto(tipo) {
  if (tipo === 'soco') {
    const esq = Math.random() < 0.5, y = entre(32, 62)
    return esq ? { de: { x: -12, y }, alvo: { x: entre(16, 30), y } } : { de: { x: 112, y }, alvo: { x: entre(70, 84), y } }
  }
  if (tipo === 'chute') { const x = entre(24, 76); return { de: { x, y: 114 }, alvo: { x, y: entre(74, 86) } } }
  if (tipo === 'cabecada') return { de: { x: 50, y: 50 }, alvo: { x: entre(40, 60), y: entre(16, 26) } }
  if (tipo === 'esquiva') return { de: { x: 50, y: 50 }, alvo: { x: 50, y: 50 } }
  return { de: { x: 50, y: 50 }, alvo: { x: entre(26, 74), y: entre(32, 64) } }
}

// Frases rítmicas de 2 compassos, em colcheias (0 a 15). A caixa cai em 2, 6,
// 10 e 14: é nela que as notas moram. Colcheias seguidas viram um grupo rápido
// ("tá-tá-tá") do mesmo golpe. Nível 1 é o treino; 4, o chefão.
const FRASES = {
  1: [[2, 6], [6, 14], [2, 10], [2, 6, 10, 14], [10, 14], []],
  2: [[2, 6, 10, 14], [2, 6, 12, 13, 14], [6, 10, 11, 12], [2, 10, 12, 14], [2, 3, 4, 10]],
  3: [[2, 6, 12, 13, 14], [2, 3, 4, 10, 14], [6, 7, 8, 12, 13, 14], [2, 6, 10, 11, 12, 14], [0, 2, 6, 8, 10, 14]],
  4: [[2, 4, 6, 10, 12, 13, 14], [0, 2, 3, 4, 8, 10, 11, 12], [2, 3, 4, 6, 10, 11, 12, 14], [2, 6, 7, 8, 10, 12, 13, 14]],
}
function frase(ficha, inicio, n, batida) {
  // as 2 primeiras frases da luta são sempre do nível mais leve dele, pra entrar no ritmo
  const nivel = n < 2 ? ficha.niveis[0] : ficha.niveis[Math.floor(Math.random() * ficha.niveis.length)]
  const lista = FRASES[nivel]
  const passos = lista[Math.floor(Math.random() * lista.length)]
  const notas = []
  let tipo = null, anterior = -9
  for (const p of passos) {
    // começa grupo novo quando não é a colcheia seguida da anterior
    if (p !== anterior + 1) tipo = Math.random() < ficha.defesaPeso ? sorteiaPeso(ficha.defesas) : sorteiaPeso(ficha.golpes)
    notas.push({ tipo, hora: inicio + p * batida / 2 })
    anterior = p
  }
  return notas
}

export default function LutaRitmo({ t, ficha, onSair, onResultado }) {
  const [, setQuadro] = useState(0)
  const [fim, setFim] = useState(null)
  const [mudo, setMudo] = useState(estaMudo())
  const estado = useRef(null)
  const id = useRef(0)
  const BATIDA = 60000 / ficha.bpm

  const novaLuta = useCallback(() => {
    const agora = performance.now() + 900
    estado.current = {
      inicio: agora, notas: [], proxFrase: agora + Math.ceil(VOO / (8 * BATIDA)) * 8 * BATIDA, nFrase: 0, proxBatida: agora,
      vida: VIDA, inimigo: ficha.vida, energia: 0, combo: 0, melhorCombo: 0,
      aviso: null, tremor: 0, superFalhou: false,
    }
    setFim(null)
  }, [ficha, BATIDA])

  useEffect(() => { ligarSom(); novaLuta() }, [novaLuta])

  const avisar = (texto, cls) => { estado.current.aviso = { texto, cls, ate: performance.now() + 600 } }

  // Laço: agenda frases, toca a batida, derruba as notas que passaram da hora.
  useEffect(() => {
    if (fim) return
    let raf
    const passo = () => {
      const s = estado.current
      const agora = performance.now()
      if (s) {
        while (s.proxFrase < agora + VOO + 8 * BATIDA) {
          for (const n of frase(ficha, s.proxFrase, s.nFrase, BATIDA)) s.notas.push({ ...n, ...trajeto(n.tipo), id: ++id.current, estado: 'vindo' })
          s.proxFrase += 8 * BATIDA; s.nFrase++
        }
        while (s.proxBatida <= agora) {
          somBatida(Math.round((s.proxBatida - s.inicio) / (BATIDA / 2)) % 8)
          s.proxBatida += BATIDA / 2
        }
        for (const n of s.notas) {
          if (n.estado !== 'vindo' || agora - n.hora <= SOME) continue
          n.estado = 'errou'; n.fimEm = agora
          s.combo = 0
          if (TIPOS[n.tipo].dele) { s.vida = Math.max(0, s.vida - TIPOS[n.tipo].dano); s.tremor = agora + 260; avisar(t('games.ldi.batalha.ritmo.apanhou'), 'is-mal') }
          else if (n.tipo === 'super') s.superFalhou = true
          else avisar(t('games.ldi.batalha.ritmo.errou'), 'is-raspou')
        }
        s.notas = s.notas.filter(n => n.estado === 'vindo' || agora - n.fimEm < 380)
        if (s.inimigo <= 0) setFim('vitoria')
        else if (s.vida <= 0) setFim('derrota')
      }
      setQuadro(q => q + 1)
      raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [fim, t, ficha, BATIDA])

  const dispararSuper = () => {
    const s = estado.current
    const agora = performance.now()
    s.energia = 0
    somPoder()
    avisar(t('games.ldi.batalha.ritmo.super'), 'is-super')
    // Abre espaço: tira o que ainda está longe e solta 4 notas douradas, meia batida entre elas.
    s.notas = s.notas.filter(n => n.estado !== 'vindo' || n.hora - agora < 500)
    const meia = BATIDA / 2
    const base = Math.ceil((agora + VOO - s.inicio) / meia) * meia + s.inicio
    const cx = entre(30, 70), cy = entre(35, 60)
    for (let i = 0; i < 4; i++) {
      const alvo = { x: cx + (i - 1.5) * 13, y: cy + (i % 2 ? 9 : -9) }
      s.notas.push({ tipo: 'super', hora: base + i * meia, de: { x: 50, y: 50 }, alvo, id: ++id.current, estado: 'vindo' })
    }
    s.superFalhou = false
    s.proxFrase = Math.max(s.proxFrase, base + 4 * meia + BATIDA * 2)
  }

  const tocar = (n, e) => {
    e.preventDefault()
    const s = estado.current
    if (!s || n.estado !== 'vindo') return
    const agora = performance.now()
    const dif = Math.abs(agora - n.hora)
    if (dif > JANELA.bom * 1.6) return // cedo demais: a nota segue vindo
    const nota = dif <= JANELA.perfeito ? 'perfeito' : dif <= JANELA.bom ? 'bom' : 'raspou'
    const mult = nota === 'perfeito' ? 1.5 : nota === 'bom' ? 1 : 0.5
    const tp = TIPOS[n.tipo]
    n.estado = 'acertou'; n.nota = nota; n.fimEm = agora
    s.combo++; s.melhorCombo = Math.max(s.melhorCombo, s.combo)
    if (n.tipo === 'bloqueio') somBloqueio(nota === 'perfeito')
    else if (n.tipo === 'esquiva') somEsquiva()
    else {
      s.inimigo = Math.max(0, s.inimigo - Math.round(tp.dano * mult * (1 + Math.min(s.combo, 20) * 0.02)))
      somGolpe(n.tipo)
    }
    if (n.tipo !== 'super') s.energia = Math.min(ENERGIA_MAX, s.energia + tp.energia * mult)
    avisar(t(`games.ldi.batalha.ritmo.${n.tipo === 'esquiva' ? 'desviou' : nota}`), `is-${nota}`)
    if (n.tipo === 'super' && !s.notas.some(o => o.tipo === 'super' && o.estado === 'vindo') && !s.superFalhou) {
      s.inimigo = Math.max(0, s.inimigo - 30)
      avisar(t('games.ldi.batalha.ritmo.super_acertou'), 'is-super')
    }
  }

  const s = estado.current
  if (!s) return <div className="rt-page" />
  const agora = performance.now()
  const aviso = s.aviso && s.aviso.ate > agora ? s.aviso : null

  return (
    <div className={`rt-page${s.tremor > agora ? ' is-tremendo' : ''}`}>
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
        <div className="rt-fundo" aria-hidden="true" />
        {!fim && s.notas.map(n => {
          // 0 = acabou de nascer, longe; 1 = hora de tocar.
          const p = Math.min(1.08, Math.max(0, 1 - (n.hora - agora) / VOO))
          const perto = n.estado === 'vindo' && Math.abs(n.hora - agora) <= JANELA.bom
          const x = n.de.x + (n.alvo.x - n.de.x) * Math.min(1, p)
          const y = n.de.y + (n.alvo.y - n.de.y) * Math.min(1, p)
          return (
            <button
              key={n.id}
              type="button"
              className={`rt-nota rt-nota--${n.tipo} is-${n.estado}${perto ? ' is-agora' : ''}${n.nota ? ` is-${n.nota}` : ''}`}
              style={{ left: `${x}%`, top: `${y}%`, '--p': p, zIndex: Math.round(p * 100) }}
              onPointerDown={e => tocar(n, e)}
            >
              <span className="rt-nota__anel" style={{ '--a': Math.max(1, 1 + (n.hora - agora) / VOO * 1.6) }} />
              <span className="rt-nota__icone">{TIPOS[n.tipo].icone}</span>
            </button>
          )
        })}
      </div>

      <footer className="rt-base">
        <button
          type="button"
          className={`rt-energia${s.energia >= ENERGIA_MAX ? ' is-cheia' : ''}`}
          disabled={s.energia < ENERGIA_MAX}
          onClick={dispararSuper}
          style={{ '--v': s.energia / ENERGIA_MAX }}
        >
          <i />
          <span>{s.energia >= ENERGIA_MAX ? t('games.ldi.batalha.ritmo.super_pronto') : t('games.ldi.batalha.energia', { n: Math.floor(s.energia) })}</span>
        </button>
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
