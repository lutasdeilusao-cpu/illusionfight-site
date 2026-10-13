import { useCallback, useEffect, useRef, useState } from 'react'
import { ligarSom, somGolpe, somBloqueio, somPoder, somBatida } from './somPentagrama'
import './LutaRitmo.css'

// Luta rítmica (teste do laboratório). As notas nascem pequenas, longe, no
// centro da arena, e vêm crescendo até a posição delas; quando o anel encosta
// na nota, ela pulsa: é a hora de tocar. Soco e chute batem no inimigo e
// enchem a energia; o bloqueio é o golpe dele chegando: tocou na hora, defende,
// deixou passar, apanha. Energia cheia vira SUPER: uma rajada de notas douradas
// seguidas; acertou todas, golpe pesado.
// Tudo de uma mão: leitura em cima, arena no meio-baixo, no alcance do dedão.

const BPM = 96
const BATIDA = 60000 / BPM
const VOO = 1500 // ms que a nota leva crescendo até a hora certa
const JANELA = { perfeito: 70, bom: 150 }
const SOME = 190 // passou disso depois da hora, conta como erro
const VIDA = 100
const VIDA_INIMIGO = 220
const ENERGIA_MAX = 100

const TIPOS = {
  soco: { icone: '👊', dano: 6, energia: 10, ataque: true },
  chute: { icone: '🦶', dano: 9, energia: 12, ataque: true },
  bloqueio: { icone: '✋', dano: 12, energia: 6, ataque: false },
  super: { icone: '⚡', dano: 7, energia: 0, ataque: true },
}

const sorteia = lista => lista[Math.floor(Math.random() * lista.length)]
const pos = () => ({ x: 14 + Math.random() * 72, y: 14 + Math.random() * 72 })

// Uma frase de 8 batidas: ataques seus no meio, golpes dele (bloqueio) no
// contratempo das frases mais à frente. Fica mais denso conforme a luta anda.
function frase(inicio, n) {
  const notas = []
  const densidade = Math.min(0.75, 0.42 + n * 0.04)
  for (let b = 0; b < 8; b++) {
    if (b === 7 || Math.random() > densidade) continue
    const tipo = n > 0 && b % 4 === 3 ? 'bloqueio' : sorteia(['soco', 'soco', 'chute', 'bloqueio'])
    notas.push({ tipo, hora: inicio + b * BATIDA })
    if (n > 2 && Math.random() < 0.15) notas.push({ tipo: 'soco', hora: inicio + b * BATIDA + BATIDA / 2 })
  }
  return notas
}

export default function LutaRitmo({ t, ficha, onSair }) {
  const [, setQuadro] = useState(0)
  const [fim, setFim] = useState(null)
  const estado = useRef(null)
  const id = useRef(0)

  const novaLuta = useCallback(() => {
    const agora = performance.now() + 900
    estado.current = {
      inicio: agora, notas: [], proxFrase: agora + VOO, nFrase: 0, proxBatida: agora,
      vida: VIDA, inimigo: VIDA_INIMIGO, inimigoIni: VIDA_INIMIGO, energia: 0, combo: 0, melhorCombo: 0,
      aviso: null, tremor: 0, superAte: 0, superFalhou: false,
    }
    setFim(null)
  }, [])

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
          for (const n of frase(s.proxFrase, s.nFrase)) s.notas.push({ ...n, id: ++id.current, ...pos(), estado: 'vindo' })
          s.proxFrase += 8 * BATIDA; s.nFrase++
        }
        while (s.proxBatida <= agora) {
          const i = Math.round((s.proxBatida - s.inicio) / BATIDA)
          somBatida(i % 4 === 0)
          s.proxBatida += BATIDA
        }
        for (const n of s.notas) {
          if (n.estado === 'vindo' && agora - n.hora > SOME) {
            n.estado = 'errou'; n.fimEm = agora
            s.combo = 0
            if (n.tipo === 'bloqueio') { s.vida = Math.max(0, s.vida - TIPOS.bloqueio.dano); s.tremor = agora + 260; avisar(t('games.ldi.batalha.ritmo.apanhou'), 'is-mal') }
            else if (n.tipo === 'super') s.superFalhou = true
            else avisar(t('games.ldi.batalha.ritmo.errou'), 'is-mal')
          }
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
  }, [fim, t])

  const dispararSuper = () => {
    const s = estado.current
    const agora = performance.now()
    s.energia = 0
    somPoder()
    avisar(t('games.ldi.batalha.ritmo.super'), 'is-super')
    // Abre espaço: limpa o que ainda está longe e solta 4 notas douradas em sequência.
    s.notas = s.notas.filter(n => n.estado !== 'vindo' || n.hora - agora < 500)
    const base = Math.ceil((agora + VOO - s.inicio) / (BATIDA / 2)) * (BATIDA / 2) + s.inicio
    const c = pos()
    for (let i = 0; i < 4; i++) {
      s.notas.push({ tipo: 'super', hora: base + i * (BATIDA / 2), id: ++id.current, x: Math.min(86, Math.max(14, c.x + (i - 1.5) * 12)), y: Math.min(86, Math.max(14, c.y + (i % 2 ? 10 : -10))), estado: 'vindo' })
    }
    s.superAte = base + 4 * (BATIDA / 2) + 200
    s.superFalhou = false
    s.proxFrase = Math.max(s.proxFrase, s.superAte + BATIDA * 2)
  }

  const tocar = (n, e) => {
    e.preventDefault()
    const s = estado.current
    if (!s || n.estado !== 'vindo') return
    const agora = performance.now()
    const dif = Math.abs(agora - n.hora)
    if (dif > JANELA.bom * 1.6) return // tocou cedo demais: ignora, a nota segue vindo
    const nota = dif <= JANELA.perfeito ? 'perfeito' : dif <= JANELA.bom ? 'bom' : 'raspou'
    const mult = nota === 'perfeito' ? 1.5 : nota === 'bom' ? 1 : 0.5
    const tp = TIPOS[n.tipo]
    n.estado = 'acertou'; n.nota = nota; n.fimEm = agora
    s.combo++; s.melhorCombo = Math.max(s.melhorCombo, s.combo)
    if (tp.ataque) {
      s.inimigo = Math.max(0, s.inimigo - Math.round(tp.dano * mult * (1 + Math.min(s.combo, 20) * 0.02)))
      somGolpe(n.tipo === 'chute' ? 'peD' : 'maoD')
    } else somBloqueio(nota === 'perfeito')
    if (n.tipo !== 'super') s.energia = Math.min(ENERGIA_MAX, s.energia + tp.energia * mult)
    avisar(t(`games.ldi.batalha.ritmo.${nota}`), `is-${nota}`)
    if (n.tipo === 'super' && !s.notas.some(o => o.tipo === 'super' && o.estado === 'vindo') && !s.superFalhou) {
      s.inimigo = Math.max(0, s.inimigo - 30)
      avisar(t('games.ldi.batalha.ritmo.super_acertou'), 'is-super')
    }
  }

  const s = estado.current
  if (!s) return <div className="rt-page" />
  const agora = performance.now()
  const inimigoIni = s.inimigoIni
  const aviso = s.aviso && s.aviso.ate > agora ? s.aviso : null

  return (
    <div className={`rt-page${s.tremor > agora ? ' is-tremendo' : ''}`}>
      <header className="rt-topo">
        <button type="button" className="rt-sair" onClick={onSair}>{t('games.ldi.batalha.sair')}</button>
        <div className="rt-barras">
          <div className="rt-barra rt-barra--ele">
            <span>{t(`games.ldi.batalha.inimigos.${ficha.id}.nome`)}</span>
            <i style={{ '--v': s.inimigo / inimigoIni }} />
          </div>
          <div className="rt-barra rt-barra--voce">
            <span>{t('games.ldi.batalha.voce')}</span>
            <i style={{ '--v': s.vida / VIDA }} />
          </div>
        </div>
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
          const x = 50 + (n.x - 50) * p
          const y = 50 + (n.y - 50) * p
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
          <h2 className={`pg-titulo is-${fim}`}>{t(`games.ldi.batalha.${fim}`)}</h2>
          <p>{t('games.ldi.batalha.ritmo.melhor_combo', { n: s.melhorCombo })}</p>
          <button type="button" className="if-btn if-btn--primary" onClick={novaLuta}>{t('games.ldi.batalha.de_novo')}</button>
          <button type="button" className="rt-sair rt-sair--fim" onClick={onSair}>{t('games.ldi.batalha.sair')}</button>
        </div>
      )}
    </div>
  )
}
