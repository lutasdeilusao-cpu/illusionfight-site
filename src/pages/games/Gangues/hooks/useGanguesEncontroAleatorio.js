// Encontro aleatório da cena (26/09/2026) — relógio de jogo, aviso do Nego
// Véio, perseguição por pathfinding e a onomatopeia do "te pegaram". Regras e
// tipos em engine/ganguesEncontroAleatorio.js; o estado persistente mora em
// storyProgress.__aleatorio (ver ganguesCenaProgressoSlice.js).
//
// `rodando` = o jogador está na RUA da cena com o jogo correndo (sem intro,
// encontro aberto, fade, interior…). Fora disso o relógio para e o
// perseguidor congela onde está — e continua de onde parou quando o jogador
// volta (inclusive depois de uma luta, porque a posição fica salva).
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ALEATORIO_PASSO_MS, ALEATORIO_ALCANCE, tipoDoEncontro,
  proximoPassoPerseguidor, posicaoDeSpawnPerseguidor,
} from '../engine/ganguesEncontroAleatorio.js'

const ONOMATOPEIA_MS = 950

export default function useGanguesEncontroAleatorio({ store, rodando, player, collidersRef, worldRef, gateRef, onAlcancou }) {
  const [aviso, setAviso] = useState(null) // tipo a ser anunciado pelo Nego Véio
  const [perseguidor, setPerseguidor] = useState(() => store.aleatorioEstado().ativo || null)
  const [onomatopeia, setOnomatopeia] = useState(null)
  // `store` (objeto do useGanguesStore()) muda de identidade a cada render —
  // e a cena re-renderiza a cada passo do jogador (110ms). Nos efeitos ele
  // entra por ref, senão o relógio reiniciaria a cada passo e nunca contaria.
  const storeRef = useRef(store); storeRef.current = store
  const playerRef = useRef(player); playerRef.current = player
  const persRef = useRef(perseguidor); persRef.current = perseguidor
  const onAlcancouRef = useRef(onAlcancou); onAlcancouRef.current = onAlcancou
  const esperaAteRef = useRef(0)
  const ativoAgora = rodando && !aviso && !onomatopeia

  // ── Relógio de jogo (1s) ──
  useEffect(() => {
    if (!ativoAgora) return
    let tick = 0
    const id = setInterval(() => {
      const e = storeRef.current.aleatorioEstado()
      const tempo = (e.tempo || 0) + 1
      tick++
      const disparar = !e.ativo && !persRef.current && tempo >= (e.proxima || 0)
      if (disparar) {
        const tipo = tipoDoEncontro(e.contador || 0, e.ultimo)
        storeRef.current.salvarAleatorio({ tempo, contador: (e.contador || 0) + 1, ultimo: tipo })
        setAviso(tipo)
      } else {
        // grava no save a cada 15s de jogo (não a cada segundo)
        storeRef.current.salvarAleatorio({ tempo }, tick % 15 === 0)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [ativoAgora])

  // O Nego Véio terminou de avisar → o perseguidor aparece longe e vem.
  const confirmarAviso = useCallback(() => {
    const tipo = aviso
    setAviso(null)
    if (!tipo) return
    const pos = posicaoDeSpawnPerseguidor(playerRef.current, { world: worldRef.current, gate: gateRef.current, colliders: collidersRef.current })
    const novo = { tipo, x: pos.x, y: pos.y }
    setPerseguidor(novo)
    storeRef.current.salvarAleatorio({ ativo: novo })
  }, [aviso, worldRef, gateRef, collidersRef])

  // ── Perseguição ──
  useEffect(() => {
    if (!ativoAgora || !perseguidor) return
    let cancelado = false, timer, passos = 0
    const passo = () => {
      if (cancelado) return
      const p = persRef.current
      if (!p) return
      const alvo = playerRef.current
      const dist = Math.hypot(p.x - alvo.x, p.y - alvo.y)
      if (dist <= ALEATORIO_ALCANCE && Date.now() >= esperaAteRef.current) {
        storeRef.current.salvarAleatorio({ ativo: p })
        setOnomatopeia(p.tipo)
        setTimeout(() => {
          setOnomatopeia(null)
          // false = não deu pra lutar agora (tropa no chão) — espera um pouco
          // e volta a encostar; ele nunca desiste.
          if (onAlcancouRef.current?.(p.tipo) === false) esperaAteRef.current = Date.now() + 5000
        }, ONOMATOPEIA_MS)
        return
      }
      const prox = dist <= ALEATORIO_ALCANCE ? p : proximoPassoPerseguidor(p, alvo, { world: worldRef.current, gate: gateRef.current, colliders: collidersRef.current })
      const novo = { ...p, x: prox.x, y: prox.y }
      persRef.current = novo
      setPerseguidor(novo)
      if (++passos % 20 === 0) storeRef.current.salvarAleatorio({ ativo: novo })
      timer = setTimeout(passo, ALEATORIO_PASSO_MS)
    }
    timer = setTimeout(passo, ALEATORIO_PASSO_MS)
    return () => {
      cancelado = true; clearTimeout(timer)
      // Parou (luta, interior, diálogo, saiu da cena): fica salvo onde estava.
      if (persRef.current) storeRef.current.salvarAleatorio({ ativo: persRef.current })
    }
    // perseguidor entra só pra ligar/desligar o loop; a posição vem do ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativoAgora, Boolean(perseguidor), worldRef, gateRef, collidersRef])

  return { aviso, confirmarAviso, perseguidor, onomatopeia }
}
