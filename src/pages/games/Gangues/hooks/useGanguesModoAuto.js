// Modo Automático do combate normal. Liga e a vez de cada personagem sai
// sozinha. Desde a v3.73.0 (pedido do Isaias, 28/09/2026) é CONFIGURÁVEL —
// ver `escolherAcaoAuto`:
//  • por personagem: só ataque normal (o de sempre) ou UM talento escolhido,
//    que ele usa toda vez que tiver PM/PV pra pagar (senão, ataque normal);
//  • poção automática: qualquer um da tropa com PV ≤ 50% toma a poção de PV
//    que a gangue tiver; sem PM pro talento escolhido, o próprio personagem
//    toma poção de PM. Usar item gasta a vez de quem está agindo, igual no manual.
// `modoAutoOn` mora no GanguesCombat (o motor precisa dele pra acelerar a IA
// do inimigo em 2x/3x — ver useGanguesVelocidadeAuto.js).
// Extraído de GanguesCombat.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MODO_AUTO_EXIGE_ASSINATURA, TIERS_COM_MODO_AUTO } from '../engine/ganguesCombatPresentation.js'

// Configuração do automático (por navegador, igual o liga/desliga — não é save).
const CONFIG_CHAVE = 'ldi-gangues-auto-config'
const CONFIG_PADRAO = { talentos: {}, pocao: false }
export const POCAO_LIMIAR_PV = 0.5

export function lerAutoConfig() {
  try {
    const v = JSON.parse(localStorage.getItem(CONFIG_CHAVE) || 'null')
    return v && typeof v === 'object' ? { talentos: v.talentos || {}, pocao: Boolean(v.pocao) } : CONFIG_PADRAO
  } catch { return CONFIG_PADRAO }
}

export function useGanguesAutoConfig() {
  const [config, setConfig] = useState(lerAutoConfig)
  const mudar = useCallback(fn => setConfig(atual => {
    const prox = fn(atual)
    try { localStorage.setItem(CONFIG_CHAVE, JSON.stringify(prox)) } catch { /* sem storage: vale só agora */ }
    return prox
  }), [])
  const escolherTalento = useCallback((membroId, specialId) => mudar(c => ({ ...c, talentos: { ...c.talentos, [membroId]: specialId || null } })), [mudar])
  const alternarPocao = useCallback(() => mudar(c => ({ ...c, pocao: !c.pocao })), [mudar])
  return { config, escolherTalento, alternarPocao }
}

// A poção que melhor tapa o buraco: sem efeito colateral primeiro, depois a
// menor que cobre o que falta (sem desperdiçar a grande), senão a maior.
export function melhorPocao(itens, tipo, falta) {
  const lista = itens.filter(i => i.tipo === tipo && i.quantidade > 0)
  if (!lista.length) return null
  const semColateral = lista.filter(i => !i.status?.length)
  const pool = semColateral.length ? semColateral : lista
  const cobre = pool.filter(i => i.valor >= falta).sort((a, b) => a.valor - b.valor)
  return cobre[0] || pool.sort((a, b) => b.valor - a.valor)[0]
}

/** O que o automático faz nesta vez — pura, testável.
 *  `ator` = combatente da vez; `aliados` = time do jogador ({key,pv,pvMax,pm,pmMax});
 *  `especiais` = talentos ativos equipados do ator; `pagavel(special)`;
 *  `itens` = inventário de combate ({id,tipo,valor,quantidade,status}). */
export function escolherAcaoAuto({ ator, aliados, especiais, pagavel, itens, config }) {
  if (config.pocao) {
    const ferido = aliados
      .filter(a => a.pv > 0 && a.pvMax > 0 && a.pv / a.pvMax <= POCAO_LIMIAR_PV)
      .sort((a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0]
    const pocao = ferido && melhorPocao(itens, 'cura_pv', ferido.pvMax - ferido.pv)
    if (pocao) return { tipo: 'item', itemId: pocao.id, alvoKey: ferido.key }
  }
  const escolhido = especiais.find(s => s.id === config.talentos?.[ator?.id])
  if (escolhido) {
    if (pagavel(escolhido)) return { tipo: 'talento', specialId: escolhido.id }
    const eu = aliados.find(a => a.key === ator.key)
    const custo = escolhido.effect?.cost
    if (config.pocao && custo?.kind === 'pm' && eu) {
      const pocao = melhorPocao(itens, 'cura_pm', custo.values[escolhido.level - 1] - eu.pm)
      if (pocao) return { tipo: 'item', itemId: pocao.id, alvoKey: eu.key }
    }
  }
  return { tipo: 'ataque' }
}

export default function useGanguesModoAuto({ modoAutoOn, setModoAutoOn, velocidade = 1, perfil, modoMultidaoAtivo, machinePhase, result, koCena, selectedActor, selectedTarget, agir }) {
  const navigate = useNavigate()
  // Beta: o botão APARECE pra todo mundo (é chamariz de assinatura — o cara vê
  // toda hora que podia automatizar). `podeUsarModoAuto` só decide se toca ou
  // se manda pro /assinar. Hoje o flag está desligado → todo mundo pode.
  const podeUsarModoAuto = !MODO_AUTO_EXIGE_ASSINATURA || TIERS_COM_MODO_AUTO.includes(perfil?.tier)
  const autoQueuedRef = useRef(false)
  const agirRef = useRef(agir)
  agirRef.current = agir
  const toggleModoAuto = () => {
    if (!podeUsarModoAuto) { navigate('/assinar'); return }
    setModoAutoOn(v => !v)
  }

  // ── Quando é a vez do jogador, a ação configurada sai sozinha depois de
  // uma pausa curta — dá pra ver o alvo escolhido antes do golpe sair.
  // autoQueuedRef evita disparar de novo enquanto o timer da vez atual
  // ainda não resolveu (mesmo padrão do aiQueued em useGanguesTurnMachine).
  useEffect(() => {
    // koCena: o modo automático PARA enquanto o cartão de KO está na tela —
    // senão o próximo golpe já sai e o momento passa batido.
    if (modoMultidaoAtivo || !modoAutoOn || !podeUsarModoAuto || machinePhase !== 'player' || result || koCena || !selectedActor || !selectedTarget) {
      autoQueuedRef.current = false
      return
    }
    if (autoQueuedRef.current) return
    autoQueuedRef.current = true
    const timer = setTimeout(() => { agirRef.current(); autoQueuedRef.current = false }, 750 / velocidade)
    return () => clearTimeout(timer)
  }, [velocidade, modoMultidaoAtivo, modoAutoOn, podeUsarModoAuto, machinePhase, result, koCena, selectedActor, selectedTarget])

  return { podeUsarModoAuto, modoAutoOn, setModoAutoOn, toggleModoAuto }
}
