/* ══════════════════════════════════════════════════════════════
   CARTAS — uma por inimigo (id = 10000 + id do inimigo), estilo Ragnarok.

   Cada carta só entra num ESPAÇO de peça (`slot`: arma, corpo, cabeca,
   bracos, pes, amuleto) e, encaixada, fica pra sempre. Gerada por regra a
   partir do inimigo: o território dá a força (1 Pista … 7 Laje), o id escolhe
   o espaço e a variação. Os chefes têm carta própria (CARTAS_DE_CHEFE).

   Efeitos (`efeitos`, lista):
   • attr        { attr: 'A'|'D'|'H'|'PM', v }   soma fixa no atributo
   • pv / pm     { v }                           soma no Osso/energia máximos
   • statusAoBater { status, chance }            chance de pôr o status no alvo
   • autoTalento { talento, nivel, chance }      chance de soltar o talento de graça num ataque normal
   • curaAoBater { v, chance }                   chance de recuperar Osso ao acertar
   • curaAoDerrubar { v }                        recupera Osso ao derrubar alguém
   • bloqueio    { chance }                      chance de zerar o golpe recebido
   • reduzDano   { v }                           tira v de todo golpe recebido
   • imune       { status }                      não pega aquele status
   • grana       { pct }                         +pct% de grana na vitória
   O motor aplica tudo em engine/ganguesCartaEfeitos.js.
   ══════════════════════════════════════════════════════════════ */
import { GANGUES_INIMIGOS_LISTA, cargoSlugDeInimigo } from './ganguesInimigos.js'

export const GANGUES_CARTA_BASE = 10000
export const cartaDoInimigo = enemyId => GANGUES_CARTA_BASE + Number(enemyId)

const STATUS_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const AUTO_TALENTOS = ['soco_de_ferro', 'bola_de_fogo', 'golpe_certeiro', 'marreta', 'tremor', 'estilhaco_terrestre', 'reflexo_falso', 'raio_curto']

// Variações de cada espaço (t = território 1–7).
const VARIACOES = {
  arma: [
    t => [{ tipo: 'attr', attr: 'A', v: Math.ceil(t * 0.6) }],
    (t, id) => [{ tipo: 'statusAoBater', status: STATUS_IDS[id % 9], chance: 0.05 + 0.01 * t }],
    (t, id) => [{ tipo: 'autoTalento', talento: AUTO_TALENTOS[id % AUTO_TALENTOS.length], nivel: Math.min(3, Math.ceil(t / 3)), chance: 0.03 + 0.005 * t }],
  ],
  corpo: [
    t => [{ tipo: 'attr', attr: 'D', v: Math.ceil(t * 0.6) }],
    t => [{ tipo: 'pv', v: 2 + t }],
    t => [{ tipo: 'bloqueio', chance: 0.04 + 0.01 * t }],
  ],
  cabeca: [
    (t, id) => [{ tipo: 'imune', status: STATUS_IDS[id % 9] }, { tipo: 'pv', v: t }],
    t => [{ tipo: 'pm', v: 1 + Math.floor(t / 2) }],
    t => [{ tipo: 'attr', attr: 'PM', v: Math.ceil(t / 3) }],
  ],
  bracos: [
    t => [{ tipo: 'curaAoBater', v: 1 + t, chance: 0.10 }],
    t => [{ tipo: 'attr', attr: 'A', v: Math.ceil(t / 3) }],
  ],
  pes: [
    t => [{ tipo: 'attr', attr: 'H', v: 1 + Math.floor(t / 3) }],
    t => [{ tipo: 'reduzDano', v: Math.ceil(t / 3) }],
  ],
  amuleto: [
    t => [{ tipo: 'grana', pct: 5 + 2 * t }],
    t => [{ tipo: 'curaAoDerrubar', v: 2 + t }],
    t => [{ tipo: 'pm', v: 1 + Math.floor(t / 2) }, { tipo: 'pv', v: 1 + Math.floor(t / 2) }],
  ],
}
const ESPACOS = ['arma', 'corpo', 'cabeca', 'bracos', 'pes', 'amuleto']

// Carta de chefe: dois efeitos, mais forte que qualquer carta do bairro.
const CARTAS_DE_CHEFE = {
  1500: { slot: 'arma', efeitos: [{ tipo: 'attr', attr: 'A', v: 2 }, { tipo: 'autoTalento', talento: 'soco_de_ferro', nivel: 1, chance: 0.08 }] },
  1501: { slot: 'amuleto', efeitos: [{ tipo: 'grana', pct: 25 }, { tipo: 'attr', attr: 'D', v: 1 }] },
  1502: { slot: 'arma', efeitos: [{ tipo: 'statusAoBater', status: 2, chance: 0.15 }, { tipo: 'attr', attr: 'A', v: 2 }] },
  1503: { slot: 'corpo', efeitos: [{ tipo: 'attr', attr: 'D', v: 4 }, { tipo: 'bloqueio', chance: 0.08 }] },
  1504: { slot: 'bracos', efeitos: [{ tipo: 'curaAoBater', v: 8, chance: 0.15 }, { tipo: 'attr', attr: 'A', v: 3 }] },
  1505: { slot: 'cabeca', efeitos: [{ tipo: 'attr', attr: 'PM', v: 4 }, { tipo: 'imune', status: 7 }, { tipo: 'imune', status: 5 }] },
  1600: { slot: 'arma', efeitos: [{ tipo: 'attr', attr: 'A', v: 5 }, { tipo: 'autoTalento', talento: 'tempestade_total', nivel: 3, chance: 0.06 }] },
}

function montarCarta(inimigo) {
  const id = GANGUES_CARTA_BASE + inimigo.id
  const chefe = CARTAS_DE_CHEFE[inimigo.id]
  if (chefe) return { id, enemyId: inimigo.id, chefe: true, ...chefe }
  const t = Number(inimigo.album?.territorioId) || 2
  const cargo = cargoSlugDeInimigo(inimigo.id)
  // General vale um território a mais; encontro aleatório entra como bairro 2.
  const forca = Math.min(7, t + (cargo === 'general' ? 1 : 0))
  const slot = ESPACOS[inimigo.id % ESPACOS.length]
  const variacoes = VARIACOES[slot]
  const efeitos = variacoes[Math.floor(inimigo.id / ESPACOS.length) % variacoes.length](forca, inimigo.id)
  return { id, enemyId: inimigo.id, slot, efeitos }
}

export const GANGUES_CARTAS = new Map(GANGUES_INIMIGOS_LISTA.map(e => { const c = montarCarta(e); return [c.id, c] }))
export const GANGUES_CARTAS_LISTA = [...GANGUES_CARTAS.values()].sort((a, b) => a.id - b.id)
export const ehCarta = id => GANGUES_CARTAS.has(Number(id))
export const getGanguesCarta = id => GANGUES_CARTAS.get(Number(id)) || null

/** Todos os efeitos das cartas encaixadas nas peças equipadas. */
export function efeitosDasCartas(equipment = {}) {
  const lista = []
  for (const peca of Object.values(equipment || {})) {
    for (const cartaId of peca?.cards || []) {
      const carta = cartaId && getGanguesCarta(cartaId)
      if (carta) lista.push(...carta.efeitos.map(e => ({ ...e, cartaId: carta.id })))
    }
  }
  return lista
}

/** Soma fixa das cartas por atributo/recurso: { A, D, H, PM, pv, pm }. */
export function somaFixaDasCartas(equipment = {}) {
  const soma = { A: 0, D: 0, H: 0, PM: 0, pv: 0, pm: 0 }
  for (const e of efeitosDasCartas(equipment)) {
    if (e.tipo === 'attr') soma[e.attr] += e.v
    if (e.tipo === 'pv') soma.pv += e.v
    if (e.tipo === 'pm') soma.pm += e.v
  }
  return soma
}

/** Nome da carta na tela. */
export const nomeCarta = (t, carta) => t('games.gangues.drop.carta_nome', { inimigo: t(`games.gangues.enemy_names.${carta.enemyId}`) })

/** "+2 Porrada · 8% de soltar Soco de Ferro (nível 1)" — o que a carta faz. */
export function textoCarta(t, carta) {
  return (carta?.efeitos || []).map(e => {
    const pct = Math.round((e.chance || 0) * 100)
    switch (e.tipo) {
      case 'attr': return t('games.gangues.carta.attr', { v: e.v, attr: t(`games.gangues.attr_labels.${e.attr}`) })
      case 'pv': return t('games.gangues.carta.pv', { v: e.v })
      case 'pm': return t('games.gangues.carta.pm', { v: e.v })
      case 'statusAoBater': return t('games.gangues.carta.status_ao_bater', { pct, status: t(`games.gangues.status.${e.status}.nome`) })
      case 'autoTalento': return t('games.gangues.carta.auto_talento', { pct, talento: t(`games.gangues.progression.skills.${e.talento}`), n: e.nivel })
      case 'curaAoBater': return t('games.gangues.carta.cura_ao_bater', { pct, v: e.v })
      case 'curaAoDerrubar': return t('games.gangues.carta.cura_ao_derrubar', { v: e.v })
      case 'bloqueio': return t('games.gangues.carta.bloqueio', { pct })
      case 'reduzDano': return t('games.gangues.carta.reduz_dano', { v: e.v })
      case 'imune': return t('games.gangues.carta.imune', { status: t(`games.gangues.status.${e.status}.nome`) })
      case 'grana': return t('games.gangues.carta.grana', { pct: e.pct })
      default: return ''
    }
  }).filter(Boolean).join(' · ')
}
