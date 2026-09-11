// Funções puras de apresentação de combate — nome de combatente, trash talk,
// transformação de evento bruto em entrada de log, e os pequenos helpers de
// localStorage/constantes do modo automático e do blink da Multidão.
// Extraído de GanguesCombat.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).

// Modo automático: vive no menu da bolinha de ação (GanguesActionOrb) e
// APARECE pra todo mundo — é chamariz de assinatura. Beta: liberado geral.
// Quando o site sair do beta, trocar este flag pra true fecha o USO pra quem
// não assina (o botão continua visível, com coroa 👑, e o toque manda pro
// /assinar via toggleModoAuto). O guard em `podeUsarModoAuto` + o check no
// efeito de auto-ataque garantem que non-assinante nunca dispara.
export const MODO_AUTO_EXIGE_ASSINATURA = false
export const TIERS_COM_MODO_AUTO = ['elite', 'primordial']

export const ONOMATOPEIAS = ['POW!', 'WHAM!', 'CRACK!', 'SLASH!', 'BOOM!', 'THWACK!']
export const randomOnoma = () => ONOMATOPEIAS[Math.floor(Math.random() * ONOMATOPEIAS.length)]

// Pisca o switch da Briga em Multidão até o jogador ligar ele PELO MENOS UMA
// vez — sem isso, quem nunca reparou no switch nunca descobre o modo (mesmo
// padrão de flag no localStorage dos outros tutoriais autocontidos).
const MULTIDAO_BLINK_KEY = 'ldi-gangues-multidao-blink-visto'
export function multidaoBlinkJaVisto() { try { return localStorage.getItem(MULTIDAO_BLINK_KEY) === '1' } catch { return false } }
export function marcarMultidaoBlinkVisto() { try { localStorage.setItem(MULTIDAO_BLINK_KEY, '1') } catch {} }

export function fighterName(t, member) {
  if (!member) return '?'
  if (member.side !== 'enemy') return member.sheet_name
  const base = t(`games.gangues.enemy_names.${member.id}`) || member.name
  // Mesmo molde pode sair 2x+ no bando (ver gerarBandoInimigo) — sem isso os
  // dois aparecem com nome idêntico, impossível diferenciar quem já apanhou.
  return member.numeroInstancia ? `${base} (${member.numeroInstancia})` : base
}

// Quanto cada personagem do jogador contribuiu na luta (dano causado +
// quantos inimigos ele finalizou) — usado pra pesar a divisão de XP no
// final (GanguesVictory.jsx): quem mais lutou/matou ganha mais, mas todo
// mundo que participou ganha pelo menos alguma coisa. Reconstrói o PV de
// cada inimigo evento a evento (a partir do pvMax, que não muda durante a
// luta) só pra saber qual golpe foi o que derrubou cada um.
export function computarContribuicoes(eventosBrutos, combatants) {
  const porId = {}
  const pvSimulado = new Map(combatants.filter(c => c.side === 'enemy').map(c => [c.key, c.pvMax]))
  for (const ev of eventosBrutos) {
    if (ev.type !== 'attack' || ev.side !== 'player') continue
    const ator = combatants.find(c => c.key === ev.actorKey)
    if (!ator) continue
    const stat = porId[ator.id] || (porId[ator.id] = { dano: 0, abates: 0 })
    stat.dano += ev.result?.damage || 0
    const antes = pvSimulado.get(ev.targetKey)
    if (antes != null) {
      const depois = Math.max(0, antes - (ev.result?.damage || 0))
      pvSimulado.set(ev.targetKey, depois)
      if (antes > 0 && depois <= 0) stat.abates += 1
    }
  }
  return porId
}

export function pickTrash(t, enemy, category) {
  const translated = t(`games.gangues.trash_talk_npc.${enemy.id}.${category}`)
  const pool = Array.isArray(translated) ? translated : (enemy.trash_talk?.[category] || [])
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

// Um evento de combate (do motor normal OU do avanço de rodada da Briga em
// Multidão — mesmo formato) vira 1-2 entradas de log. Reusado nos dois
// modos pra não duplicar a lógica de nome/trash-talk/onomatopeia.
export function transformarEvento(t, event, combatants) {
  if (event.type === 'battle_start') return [{ id: event.id, kind: 'system', text: t('games.gangues.log_batalha_inicio') }]
  if (event.type === 'initiative') {
    return [{ id: event.id, kind: 'initiative', order: event.order.map(item => ({ ...item, name: fighterName(t, combatants.find(m => m.key === item.key)) })) }]
  }
  if (event.type === 'item') {
    const actor = combatants.find(m => m.key === event.actorKey)
    const alvo = combatants.find(m => m.key === event.targetKey)
    const mesmo = !event.targetKey || event.targetKey === event.actorKey
    const chave = mesmo ? 'games.gangues.log_usou_item' : 'games.gangues.log_usou_item_em'
    return [{ id: event.id, kind: 'system', text: t(chave, { nome: fighterName(t, actor), alvo: fighterName(t, alvo), n: event.curado || 0 }) }]
  }
  if (event.type !== 'attack') return []
  const actor = combatants.find(m => m.key === event.actorKey) || { side: event.side }
  const target = combatants.find(m => m.key === event.targetKey)
  const isPlayer = event.side === 'player'
  const entries = [{
    id: event.id, kind: 'attack_card', side: event.side,
    actorName: fighterName(t, actor), targetName: fighterName(t, target), round: event.round,
    fa: event.result.fa, fd: event.result.fd, dice: event.result.rolls.fa, defenseDice: event.result.rolls.fd,
    dmg: event.result.damage, onoma: randomOnoma(),
    shieldConsumed: event.result.shieldConsumed || 0,
    attackerBonus: event.result.attackerBonus, defenderBonus: event.result.defenderBonus,
    critical: event.result.critical, criticalBonus: event.result.criticalBonus,
    activeSpecialId: event.result.activeSpecialId || null,
  }]
  const enemyCombatant = isPlayer ? target : actor
  if (enemyCombatant?.trash_talk) {
    const category = event.result.critical ? 'take_critical' : isPlayer ? 'take_damage' : 'attack_hit'
    if (Math.random() < 0.6) {
      const line = pickTrash(t, enemyCombatant, category)
      if (line) entries.push({ id: `${event.id}-trash`, kind: 'trash', sender: fighterName(t, enemyCombatant), text: line })
    }
  }
  return entries
}
