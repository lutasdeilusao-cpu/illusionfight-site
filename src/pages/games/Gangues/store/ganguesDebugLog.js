// Log de TUDO do LDI Gangues pras contas admin (lib/debugLog.js), sem
// espalhar chamada pelos arquivos do jogo: um subscribe no store registra
// o que mudou (antes → depois) e cada ação do store é embrulhada pra gravar
// o nome + os argumentos resumidos. Só é instalado com o debug log ligado.
import { useEffect } from 'react'
import { useGanguesStore } from './useGanguesStore'
import { logDebug, resumir, debugLogAtivo, aoMudarDebugLog } from '../../../../lib/debugLog'

// Ações de alta frequência / leitura pura (chamadas no render ou a cada passo).
const ACOES_IGNORADAS = new Set([
  'salvarPosicaoCena', '_persistCena', '_persistStory', '_birosca', '_cena', '_deficitTropa',
  'getLider', 'getLiderId', 'temItens', 'descansoInfo', 'agiotagemInfo', 'aleatorioEstado',
  'reginaDeveFavor', 'dificuldadeJogo', 'salvarAleatorio', 'setEnemyCatalog',
])
const POSICAO_MS = 10000

const igual = (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b)

/** Diff raso por chave: { chave: { de, para } } só do que mudou. */
function diffChaves(a = {}, b = {}) {
  const r = {}
  for (const k of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    if (!igual(a?.[k], b?.[k])) r[k] = { de: a?.[k], para: b?.[k] }
  }
  return r
}

const vazio = o => !o || !Object.keys(o).length

function resumoFicha(f) {
  if (!f) return f
  return { nome: f.sheet_name, nivel: f.level ?? f.nivel, xp: f.xp_total, attr: f.attributes, pv: f.pv ?? f.pvAtual, pm: f.pm ?? f.pmAtual, equip: f.equipamento ?? f.equipment }
}

function diffRoster(a = [], b = []) {
  const porId = l => Object.fromEntries((l || []).map(f => [f.id, resumoFicha(f)]))
  const A = porId(a), B = porId(b)
  const r = {}
  for (const id of new Set([...Object.keys(A), ...Object.keys(B)])) {
    if (!A[id]) r[id] = { novo: B[id] }
    else if (!B[id]) r[id] = { saiu: A[id].nome }
    else {
      const d = diffChaves(A[id], B[id])
      if (!vazio(d)) r[id] = { nome: B[id].nome, ...d }
    }
  }
  return r
}

let ultimaPosicao = 0

function aoMudar(s, p) {
  if (s.grana !== p.grana) logDebug('gangues.grana', { de: p.grana, para: s.grana })
  if (s.rep !== p.rep) logDebug('gangues.rep', { de: p.rep, para: s.rep })
  if (s._saveId !== p._saveId) logDebug('gangues.save', { de: p._saveId, para: s._saveId, gangue: s.gangName })
  if (s.gangName !== p.gangName) logDebug('gangues.nome', { de: p.gangName, para: s.gangName })
  if (s.storyTarget !== p.storyTarget && !igual(s.storyTarget, p.storyTarget)) logDebug('gangues.luta.alvo', s.storyTarget)
  if (s.match?.status !== p.match?.status) {
    logDebug('gangues.luta.status', { de: p.match?.status, para: s.match?.status, inimigos: (s.match?.enemyTeam || []).map(e => ({ id: e.id, nome: e.name || e.nome, attr: e.stats || e.attributes })) })
  }
  if (s.match?.battleReport !== p.match?.battleReport && s.match?.battleReport) logDebug('gangues.luta.resultado', s.match.battleReport)
  if (s.roster !== p.roster) { const d = diffRoster(p.roster, s.roster); if (!vazio(d)) logDebug('gangues.roster', d) }
  if (s.activeParty !== p.activeParty && !igual(s.activeParty, p.activeParty)) logDebug('gangues.time', { de: p.activeParty, para: s.activeParty })
  if (s.inventario !== p.inventario) { const d = diffChaves(p.inventario, s.inventario); if (!vazio(d)) logDebug('gangues.inventario', d) }
  if (s.equipamentos !== p.equipamentos && !igual(s.equipamentos, p.equipamentos)) logDebug('gangues.equipamentos', { de: p.equipamentos, para: s.equipamentos })
  if (s.storyProgress !== p.storyProgress) {
    const d = diffChaves(p.storyProgress, s.storyProgress)
    if (d.__birosca) logDebug('gangues.divida', d.__birosca)
    delete d.__birosca
    if (!vazio(d)) logDebug('gangues.story', d)
  }
  if (s.cenaProgresso !== p.cenaProgresso) {
    for (const [cena, m] of Object.entries(diffChaves(p.cenaProgresso, s.cenaProgresso))) {
      const d = diffChaves(m.de, m.para)
      const pos = d.posicao
      delete d.posicao
      if (!vazio(d)) logDebug('gangues.cena', { cena, ...d })
      if (pos && Date.now() - ultimaPosicao >= POSICAO_MS) {
        ultimaPosicao = Date.now()
        logDebug('gangues.posicao', { cena, ...pos.para })
      }
    }
  }
}

let desinstalar = null

export function instalarGanguesDebugLog() {
  if (desinstalar) return desinstalar
  const estado = useGanguesStore.getState()
  const originais = {}
  const embrulhadas = {}
  for (const [nome, fn] of Object.entries(estado)) {
    if (typeof fn !== 'function' || ACOES_IGNORADAS.has(nome)) continue
    originais[nome] = fn
    embrulhadas[nome] = (...args) => {
      logDebug('gangues.acao', { acao: nome, args: resumir(args) })
      return fn(...args)
    }
  }
  useGanguesStore.setState(embrulhadas)
  const cancelar = useGanguesStore.subscribe(aoMudar)
  logDebug('gangues.debug', { ligado: true, acoes: Object.keys(embrulhadas).length })
  desinstalar = () => {
    cancelar()
    const atual = useGanguesStore.getState()
    const volta = {}
    for (const nome of Object.keys(originais)) if (atual[nome] === embrulhadas[nome]) volta[nome] = originais[nome]
    useGanguesStore.setState(volta)
    desinstalar = null
  }
  return desinstalar
}

/** Montado no GanguesRoute: instala enquanto o debug log estiver ligado e registra a fase/tela. */
export function useGanguesDebugLog(fase) {
  useEffect(() => {
    let tirar = debugLogAtivo() ? instalarGanguesDebugLog() : null
    const parar = aoMudarDebugLog(ligado => {
      if (ligado && !tirar) tirar = instalarGanguesDebugLog()
      if (!ligado && tirar) { tirar(); tirar = null }
    })
    return () => { parar(); if (tirar) tirar() }
  }, [])
  useEffect(() => { logDebug('gangues.fase', { fase }) }, [fase])
}
