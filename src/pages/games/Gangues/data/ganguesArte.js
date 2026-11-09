// Arte oficial dos ícones do Gangues.
// Arquivos em assets/arte/<tipo>/<chave>.webp: equip/<id>, item/<id>,
// talento/<id do special>, trofeu/<tipo>, status/<id>, slot/<slot>,
// pino/<n>, carta/<slot>, estrutura/<nome>. Sem arquivo = null, e quem
// desenha cai no emoji.
const ARQUIVOS = import.meta.glob('../assets/arte/*/*.webp', { eager: true, import: 'default' })

const ARTE = {}
for (const [caminho, url] of Object.entries(ARQUIVOS)) {
  const m = caminho.match(/arte\/([^/]+)\/([^/]+)\.webp$/)
  if (m) (ARTE[m[1]] ||= {})[m[2]] = url
}

export const arteDe = (tipo, chave) => (chave == null ? null : ARTE[tipo]?.[String(chave)] || null)
export const arteItem = id => arteDe('item', id)
export const arteEquip = id => arteDe('equip', id)
export const arteTalento = id => arteDe('talento', id)
export const arteTrofeu = tipo => arteDe('trofeu', tipo)
export const arteStatus = id => arteDe('status', id)
export const arteSlot = slot => arteDe('slot', slot)
export const arteCarta = slot => arteDe('carta', slot)
export const arteEstrutura = nome => arteDe('estrutura', nome)

// Ícone de pino por tipo de lugar.
const PINO_POR_TIPO = { achado: 0, corre: 1, descanso: 22, loja: 23, agiota: 24, jogo: 7, treta: 21 }
export const artePino = tipo => arteDe('pino', PINO_POR_TIPO[tipo])
export function artePinoDoPonto(p) {
  const n = p.ehChefe ? 20 : p.ehPorta ? 15 : p.ehSaida || p.ehVolta ? 16 : p.ehSaidaBairro ? 19
    : p.ehPassagem ? (p.label === 'subir' ? 17 : 18) : PINO_POR_TIPO[p.tipo]
  return arteDe('pino', n)
}

// Pinos cuja cara é de um NPC com arte própria e que nascem de lista (salas dos fundos).
const NPC_POR_PINO = {
  linha_pista: 'retalho_solto', linha_feira: 'fio_cortado', linha_baixada: 'costura_fina',
  linha_vila: 'conta_fechada', linha_morro: 'fiapo', linha_alto: 'agulha',
  informante_morro: 'moleque_da_frente_da_escada', informante_alto: 'moleque_da_roda',
  informante_laje: 'fiapo_do_bonde_do_retalho', galpao_contador: 'contador_do_movimento',
}
export const npcDoPino = p => p?.arteNpc || NPC_POR_PINO[p?.id] || null

// Consumível usa id 1–99 e equipamento 101+, então o id sozinho diz o catálogo.
export const arteDoId = id => (Number(id) > 100 ? arteEquip(id) : arteItem(id))
