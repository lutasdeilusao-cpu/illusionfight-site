// Modo Automático do combate normal. Liga e a vez de cada personagem sai
// sozinha, e é configurável — ver `escolherAcaoAuto`:
//  • por personagem: só ataque normal (o de sempre) ou UM talento escolhido,
//    que ele usa toda vez que tiver PM/PV pra pagar (senão, ataque normal);
//  • poção automática: alguém da tropa com PV ≤ 50% → o MAIS INTEIRO (mais
//    PV) gasta a vez dele dando a poção de PV pro mais machucado (o ferido
//    segue batendo; sozinho de pé, se cura);
//  • poção de PM automática (opção à parte): sem PM pro talento escolhido, o
//    próprio personagem toma poção de PM. Usar item gasta a vez de quem age.
// `modoAutoOn` mora no GanguesCombat (o motor precisa dele pra acelerar a IA
// do inimigo em 2x/3x — ver useGanguesVelocidadeAuto.js).
// Extraído de GanguesCombat.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).
import { logDebug } from '../../../../lib/debugLog'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MODO_AUTO_EXIGE_ASSINATURA, TIERS_COM_MODO_AUTO } from '../engine/ganguesCombatPresentation.js'
import { chaveDoSave } from './useGanguesVelocidadeAuto.js'

// Configuração do automático (por navegador e por save, igual o liga/desliga
// — gangue nova começa do zero; ver chaveDoSave).
const CONFIG_CHAVE = 'ldi-gangues-auto-config'
const CONFIG_PADRAO = { talentos: {}, pocao: false, pocaoPm: false }
export const POCAO_LIMIAR_PV = 0.5

export function lerAutoConfig() {
  try {
    const v = JSON.parse(localStorage.getItem(chaveDoSave(CONFIG_CHAVE)) || 'null')
    // Config sem `pocaoPm` herda o valor de `pocao`.
    return v && typeof v === 'object' ? { talentos: v.talentos || {}, pocao: Boolean(v.pocao), pocaoPm: Boolean(v.pocaoPm ?? v.pocao) } : CONFIG_PADRAO
  } catch { return CONFIG_PADRAO }
}

export function useGanguesAutoConfig() {
  const [config, setConfig] = useState(lerAutoConfig)
  const mudar = useCallback(fn => setConfig(atual => {
    const prox = fn(atual)
    try { localStorage.setItem(chaveDoSave(CONFIG_CHAVE), JSON.stringify(prox)) } catch { /* sem storage: vale só agora */ }
    return prox
  }), [])
  const escolherTalento = useCallback((membroId, specialId) => mudar(c => ({ ...c, talentos: { ...c.talentos, [membroId]: specialId || null } })), [mudar])
  const alternarPocao = useCallback(() => mudar(c => ({ ...c, pocao: !c.pocao })), [mudar])
  const alternarPocaoPm = useCallback(() => mudar(c => ({ ...c, pocaoPm: !c.pocaoPm })), [mudar])
  return { config, escolherTalento, alternarPocao, alternarPocaoPm }
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
    // Quem cura é o MAIS INTEIRO da tropa (mais PV), abrindo mão da vez dele
    // — nunca o ferido gastando a própria vez pra se curar (Isaias,
    // 28/09/2026). Só quando o ferido é o único de pé ele se cura sozinho.
    const vivos = aliados.filter(a => a.pv > 0 && a.pvMax > 0)
    const ferido = vivos
      .filter(a => a.pv / a.pvMax <= POCAO_LIMIAR_PV)
      .sort((a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0]
    const maisInteiro = [...vivos].sort((a, b) => (b.pv - a.pv) || (b.pv / b.pvMax - a.pv / a.pvMax))[0]
    const pocao = ferido && maisInteiro?.key === ator?.key && melhorPocao(itens, 'cura_pv', ferido.pvMax - ferido.pv)
    if (pocao) return { tipo: 'item', itemId: pocao.id, alvoKey: ferido.key }
  }
  const escolhido = especiais.find(s => s.id === config.talentos?.[ator?.id])
  if (escolhido) {
    if (pagavel(escolhido)) return { tipo: 'talento', specialId: escolhido.id }
    const eu = aliados.find(a => a.key === ator.key)
    const custo = escolhido.effect?.cost
    if (config.pocaoPm && custo?.kind === 'pm' && eu) {
      const pocao = melhorPocao(itens, 'cura_pm', custo.values[escolhido.level - 1] - eu.pm)
      if (pocao) return { tipo: 'item', itemId: pocao.id, alvoKey: eu.key }
    }
  }
  return { tipo: 'ataque' }
}

export default function useGanguesModoAuto({ modoAutoOn, setModoAutoOn, velocidade = 1, perfil, modoMultidaoAtivo, machinePhase, turnoSeq, result, koCena, selectedActor, selectedTarget, agir }) {
  const navigate = useNavigate()
  // Beta: o botão APARECE pra todo mundo (é chamariz de assinatura — o cara vê
  // toda hora que podia automatizar). `podeUsarModoAuto` só decide se toca ou
  // se manda pro /assinar. Hoje o flag está desligado → todo mundo pode.
  const podeUsarModoAuto = !MODO_AUTO_EXIGE_ASSINATURA || TIERS_COM_MODO_AUTO.includes(perfil?.tier)
  const agirRef = useRef(agir)
  agirRef.current = agir
  const toggleModoAuto = () => {
    if (!podeUsarModoAuto) { navigate('/assinar'); return }
    setModoAutoOn(v => !v)
  }

  // ── Quando é a vez do jogador, a ação configurada sai sozinha depois de
  // uma pausa curta — dá pra ver o alvo escolhido antes do golpe sair.
  // `turnoSeq` muda a cada vez que passa, então o mesmo personagem agindo duas
  // vezes seguidas (depois de um item) também dispara. Mudou qualquer coisa
  // no meio da espera (ex.: a vez passou e o personagem selecionado troca logo
  // depois), o timer velho é cancelado e um novo é armado — nunca fica sem.
  // koCena: o automático PARA enquanto o cartão de KO está na tela.
  const podeAgir = !modoMultidaoAtivo && modoAutoOn && podeUsarModoAuto && machinePhase === 'player' && !result && !koCena && Boolean(selectedActor) && Boolean(selectedTarget)
  useEffect(() => {
    if (!podeAgir) return
    const timer = setTimeout(() => {
      logDebug('gangues.auto.acao', { turnoSeq, ator: selectedActor, alvo: selectedTarget })
      agirRef.current()
    }, 750 / velocidade)
    return () => clearTimeout(timer)
  }, [velocidade, podeAgir, turnoSeq, selectedActor, selectedTarget])

  // Vigia: automático ligado, vez do jogador e nada saiu em 4 s → grava no log
  // de depuração (contas admin) o estado da luta e força a ação.
  const estadoRef = useRef({})
  estadoRef.current = { modoAutoOn, machinePhase, turnoSeq, result, koCena, selectedActor, selectedTarget, modoMultidaoAtivo }
  useEffect(() => {
    if (modoMultidaoAtivo || !modoAutoOn || !podeUsarModoAuto || result) return
    const timer = setTimeout(() => {
      const e = estadoRef.current
      if (e.result || e.koCena) return
      // Parada em qualquer fase vai pro log; só na vez do jogador dá pra agir.
      logDebug('gangues.auto.travou', e)
      if (e.machinePhase === 'player') agirRef.current()
    }, 4000 / velocidade)
    return () => clearTimeout(timer)
  }, [turnoSeq, modoAutoOn, modoMultidaoAtivo, podeUsarModoAuto, result, velocidade])

  return { podeUsarModoAuto, modoAutoOn, setModoAutoOn, toggleModoAuto }
}
