// Encontro ALEATÓRIO de rua ("selvagem") + o nível médio efetivo da tropa
// (base do aviso de nível no TretaVS). Extraído de GanguesCena.jsx
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §5).
import { useMemo, useRef } from 'react'
import { sfx } from '../../../../lib/sfx'
import { getGanguesLevelFromXp } from '../data/ganguesCharacters.js'
import { getGanguesAttributesWithEquip } from '../data/ganguesEquip.js'

export default function useGanguesCenaEventoAleatorio({ store, t, cena, localRef, encontro, fade, intro, passosRef, setEncontro }) {
  // Encontro aleatório de rua: RARO de propósito (é uma luta acima da ficha).
  // Nunca em interior, nunca antes do 60º passo da visita, cooldown longo
  // (~140 passos), teto de 2 por visita, roll baixinho por passo. E só libera
  // quando o jogador tem ALGUÉM nível 6+ — antes disso o bando do evento
  // massacra (o Carvão já exige L8 pra bater confortável).
  const podeEvento = useMemo(() => store.roster.some(m => getGanguesLevelFromXp(m.xp_total ?? 0) >= 6), [store.roster])
  const eventoStepRef = useRef(0), eventosDadosRef = useRef(0)

  // Nível MÉDIO da tropa de batalha — base do aviso "recomendado nível X" no
  // TretaVS (o Isaias: o cara entra consciente ou upa antes).
  const nivelTropa = useMemo(() => {
    const time = store.activeParty.length ? store.activeParty : store.roster
    if (!time.length) return 1
    // Nível EFETIVO: o nível de XP + o que o equipamento soma de atributo
    // (aproximação — desde a curva de custo escalonada, 1 ponto de atributo
    // já não vale sempre 1 nível igualzinho, mas ainda é uma boa régua pro
    // aviso). Assim o aviso conta a soqueira/colete que o cara já pôs.
    const nivelEf = m => {
      const base = getGanguesLevelFromXp(m.xp_total ?? 0)
      const eff = getGanguesAttributesWithEquip(m.attributes)
      const bonus = ['A', 'H', 'D'].reduce((s, k) => s + Math.max(0, (Number(eff?.[k]) || 0) - (Number(m.attributes?.[k]) || 0)), 0)
      return base + bonus
    }
    return Math.max(1, Math.round(time.reduce((s, m) => s + nivelEf(m), 0) / time.length))
  }, [store.activeParty, store.roster])

  const tentarEvento = () => {
    if (localRef.current || encontro || fade || intro || !podeEvento) return
    if (passosRef.current < 60 || eventosDadosRef.current >= 2) return
    if (passosRef.current - eventoStepRef.current < 140) return
    if (Math.random() >= 0.012) return
    eventoStepRef.current = passosRef.current; eventosDadosRef.current++
    const raw = t(`games.gangues.cena.${cena.id}.evento.fala`)
    sfx.select?.()
    setEncontro({ evento: true, fala: Array.isArray(raw) ? raw[Math.floor(Math.random() * raw.length)] : raw })
  }

  return { podeEvento, nivelTropa, tentarEvento }
}
