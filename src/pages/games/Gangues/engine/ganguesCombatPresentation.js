// Funções puras de apresentação de combate — nome de combatente, trash talk,
// transformação de evento bruto em entrada de log, e os pequenos helpers de
// localStorage/constantes do modo automático e do blink da Multidão.
import { getGanguesPortraitByTemplateId } from '../data/ganguesPortraits.js'
import { getGanguesEnemyPortraitById } from '../data/ganguesEnemyPortraits.js'
import { getGanguesItem, textoEfeitoItem } from '../data/ganguesItens.js'

// Retrato do combatente pro log (cabeça de quem deu o golpe) — mesma lógica
// de GanguesCombatRoster.jsx. `member.side` só existe
// nos combatentes de verdade vindos do motor; o `actor` "de mentira" que
// transformarEvento cria pra evento sem side explícito (`{ side: event.side }`)
// não tem `character_template_id`/`id` de personagem, então cai no fallback
// (null) igual sempre caiu — sem quebrar nada.
function retratoDoCombatente(member) {
  if (!member) return null
  return member.side === 'player'
    ? getGanguesPortraitByTemplateId(member.character_template_id)
    : getGanguesEnemyPortraitById(member.id)
}

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
// vez — sem isso, quem nunca reparou no switch nunca descobre o modo. Vive
// no dicionário de tutoriais vistos por CONTA agora (ver
// TutorialProgressContext.jsx, tutorial_id 'multidao_blink', usado em
// useGanguesModoMultidao.js) — não mais aqui como par jaVisto/marcarVisto de
// localStorage.

export function fighterName(t, member) {
  if (!member) return '?'
  if (member.side !== 'enemy') return member.sheet_name
  // Apelido de rua (encontros aleatórios — ver batizarBando): nome próprio,
  // único na luta, no lugar do nome do molde.
  if (member.apelido) {
    const apelido = t(`games.gangues.apelidos.${member.apelido.lista}`)?.[member.apelido.i]
    if (apelido) return apelido
  }
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
/** Evento do motor → linhas do registro. `compacto` (Briga em Multidão):
 *  golpe vira uma linha curta e a provocação aparece menos, pra rodada com
 *  muita gente não virar um muro. */
export function transformarEvento(t, event, combatants, { compacto = false } = {}) {
  if (event.type === 'battle_start') return [{ id: event.id, kind: 'system', text: t('games.gangues.log_batalha_inicio') }]
  if (event.type === 'item') {
    const actor = combatants.find(m => m.key === event.actorKey)
    const alvo = combatants.find(m => m.key === event.targetKey)
    // Nome do item + o que ele fez (cura, buff ou debuff nos inimigos).
    const item = getGanguesItem(event.itemId)
    const params = { nome: fighterName(t, actor), alvo: fighterName(t, alvo), item: item ? t(item.nome) : '', efeito: textoEfeitoItem(t, item) }
    const chave = item?.tipo === 'debuff_inimigos'
      ? 'games.gangues.log_item_inimigos'
      : (!event.targetKey || event.targetKey === event.actorKey) ? 'games.gangues.log_item' : 'games.gangues.log_item_em'
    return [{ id: event.id, kind: 'system', text: t(chave, params) }]
  }
  if (event.type === 'perdeu_vez') {
    const actor = combatants.find(m => m.key === event.actorKey)
    return [{ id: event.id, kind: 'system', text: t(`games.gangues.log_perdeu_vez_${event.motivo}`, { nome: fighterName(t, actor) }) }]
  }
  if (event.type === 'cura') {
    const actor = combatants.find(m => m.key === event.actorKey)
    const alvo = combatants.find(m => m.key === event.targetKey)
    return [{ id: event.id, kind: 'system', text: t('games.gangues.log_cura', { nome: fighterName(t, actor), alvo: fighterName(t, alvo), talento: t(`games.gangues.progression.skills.${event.specialId}`), n: event.curado || 0 }) }]
  }
  if (event.type !== 'attack') return []
  const actor = combatants.find(m => m.key === event.actorKey) || { side: event.side }
  const target = combatants.find(m => m.key === event.targetKey)
  const isPlayer = event.side === 'player'
  const entries = compacto ? [{
    id: event.id, kind: 'golpe', side: event.side,
    actorName: fighterName(t, actor), targetName: fighterName(t, target),
    dmg: event.result.damage, critical: event.result.critical, shieldConsumed: event.result.shieldConsumed || 0,
    activeSpecialId: event.result.activeSpecialId || null,
  }] : [{
    id: event.id, kind: 'attack_card', side: event.side,
    actorName: fighterName(t, actor), actorRetrato: retratoDoCombatente(actor), targetName: fighterName(t, target), round: event.round,
    fa: event.result.fa, fd: event.result.fd, dice: event.result.rolls.fa, defenseDice: event.result.rolls.fd,
    dmg: event.result.damage, onoma: randomOnoma(),
    shieldConsumed: event.result.shieldConsumed || 0,
    critical: event.result.critical, criticalBonus: event.result.criticalBonus,
    activeSpecialId: event.result.activeSpecialId || null,
    statusAplicado: event.result.statusAplicado || null,
  }]
  // Passiva que entrou nesta jogada e status que pegou ganham linha própria
  // no registro, pra serem sentidos.
  const passivos = [...(event.result.passivosGatilho?.attacker || []).map(id => [actor, id]), ...(event.result.passivosGatilho?.defender || []).map(id => [target, id])]
  passivos.forEach(([quem, id], i) => entries.push({ id: `${event.id}-passiva-${i}`, kind: 'system', text: t('games.gangues.log_passiva', { nome: fighterName(t, quem), talento: t(`games.gangues.progression.skills.${id}`) }) }))
  if (event.confuso) entries.push({ id: `${event.id}-grogue`, kind: 'system', text: t('games.gangues.log_grogue', { nome: fighterName(t, actor), alvo: fighterName(t, target) }) })
  if (event.result.statusAplicado) entries.push({ id: `${event.id}-status`, kind: 'system', text: t('games.gangues.log_status', { alvo: fighterName(t, target), status: t(`games.gangues.status.${event.result.statusAplicado}.nome`) }) })
  const enemyCombatant = isPlayer ? target : actor
  if (enemyCombatant?.trash_talk) {
    const category = event.result.critical ? 'take_critical' : isPlayer ? 'take_damage' : 'attack_hit'
    if (Math.random() < (compacto ? 0.15 : 0.6)) {
      const line = pickTrash(t, enemyCombatant, category)
      if (line) entries.push({ id: `${event.id}-trash`, kind: 'trash', sender: fighterName(t, enemyCombatant), senderRetrato: retratoDoCombatente(enemyCombatant), text: line })
    }
  }
  return entries
}
