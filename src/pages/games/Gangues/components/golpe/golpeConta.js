/* O que a tela do golpe mostra, montado a partir do resultado do resolver
   (engine/ganguesCombatResolver.js): as parcelas de ataque e defesa, o dano e
   cada efeito que entrou (talento, passiva, carta, status) com o dono dele. */
import { describeGanguesSpecialEffect } from '../../engine/ganguesSpecialEffects.js'
import { GANGUES_STATUS } from '../../engine/ganguesStatus.js'
import { getGanguesPortraitByTemplateId } from '../../data/ganguesPortraits.js'
import { getGanguesEnemyPortraitById } from '../../data/ganguesEnemyPortraits.js'

/** Rosto de um combatente (jogador pelo template, inimigo pelo id). */
export const rostoDe = c => (!c ? null : c.side === 'player' ? getGanguesPortraitByTemplateId(c.character_template_id) : getGanguesEnemyPortraitById(c.id))

const parcela = (rotulo, v) => (v ? { rotulo, v } : null)

export function montarGolpe({ t, result, atacante, alvo }) {
  const c = result.conta || {}
  const talento = id => t(`games.gangues.progression.skills.${id}`)
  const ataque = [
    parcela(t('games.gangues.attr_labels.A'), c.porrada),
    { rotulo: '🎲', v: c.dado, dado: true },
    parcela(t('games.gangues.golpe.critico'), c.critico),
    parcela('🔪', c.arma),
    parcela(t('games.gangues.attr_labels.PM'), c.malandragem),
    parcela(t('games.gangues.golpe.bonus'), c.bonus),
  ].filter(Boolean)
  const defesa = [
    parcela(t('games.gangues.attr_labels.D'), c.couro),
    { rotulo: '🎲', v: c.dadoDef, dado: true },
    parcela('🛡️', c.armadura),
    parcela(t('games.gangues.golpe.ignorou'), c.ignorou ? -c.ignorou : 0),
    parcela(t('games.gangues.golpe.bonus'), c.bonusDef),
  ].filter(Boolean)

  const efeitos = []
  const add = (dono, icone, nome, desc = '') => efeitos.push({ dono, icone, nome, desc })
  if (result.activeSpecialId) add(atacante, '⚡', talento(result.activeSpecialId), describeGanguesSpecialEffect(t, result.activeSpecialId))
  if (result.cartaTalento) add(atacante, '🃏', t('games.gangues.carta.disparou_talento', { talento: talento(result.cartaTalento) }))
  for (const id of result.passivosGatilho?.attacker || []) add(atacante, '🛡', talento(id), describeGanguesSpecialEffect(t, id, result.passivosNivel?.[id] || 1))
  for (const id of result.passivosGatilho?.defender || []) add(alvo, '🛡', talento(id), describeGanguesSpecialEffect(t, id, result.passivosNivel?.[id] || 1))
  if (result.cartaBloqueio) add(alvo, '🃏', t('games.gangues.carta.disparou_bloqueio'))
  else if (c.cartaDefesa) add(alvo, '🃏', t('games.gangues.golpe.carta_reduziu', { v: c.cartaDefesa }))
  if (c.escudo) add(alvo, '🛡', t('games.gangues.golpe.escudo', { v: c.escudo }))
  if (result.cartaCura > 0) add(atacante, '🃏', t('games.gangues.carta.disparou_cura', { v: result.cartaCura }))
  if (result.statusAplicado) {
    const st = GANGUES_STATUS[result.statusAplicado]
    add(alvo, st?.icone || '•', t(`games.gangues.status.${result.statusAplicado}.nome`), t(`games.gangues.status.${result.statusAplicado}.desc`))
  }

  const pvAntes = Number(alvo?.pv) || 0
  return {
    ataque, defesa, fa: result.fa, fd: result.fd, dano: result.damage,
    critico: Boolean(result.critical), bloqueio: Boolean(result.cartaBloqueio),
    efeitos, pvAntes, pvDepois: Math.max(0, pvAntes - result.damage), pvMax: Number(alvo?.pvMax) || 1,
  }
}
