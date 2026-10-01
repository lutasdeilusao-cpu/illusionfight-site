// ── DISTRIBUIÇÃO EXCLUSIVA do equipamento por bairro (Isaias, 30/09/2026:
// "ficar exclusivo em cada loja... uma loja tem mais itens de atacante, outra
// de defensor, outra de místico"). Cada bairro tem UMA categoria (comum Pista,
// incomum Feira, raro Baixada, pesado Vila, grife Morro, nobre Alto, lendário
// Laje). A loja do bairro vende ~10 peças dela — o caminho da especialidade
// inteiro + arma e corpo dos outros dois (Pista/Vila atacante, Feira/Morro
// defensor, Baixada/Alto místico; a Laje vende arma, corpo e amuleto de todos).
// As outras peças só saem como prêmio da 1ª vitória nas lutas do bairro
// (GANGUES_DROP_EQUIP, lido em calcularRecompensaCena). Gerado a partir da lista
// de lutas de cada cena, da mais fraca pra mais forte, espalhado.
export const GANGUES_LOJA_EQUIP = {
  // + o Boné Vira-Lata (238, livre) que a Pista sempre vendeu.
  pista: [201, 202, 203, 204, 205, 206, 213, 215, 225, 227, 238],
  feira: [207, 209, 219, 220, 221, 222, 223, 224, 231, 233],
  baixada: [301, 303, 307, 309, 311, 312, 313, 314, 315, 316, 317, 318],
  vila: [401, 402, 403, 404, 405, 406, 407, 409, 413, 415],
  morro: [501, 503, 507, 508, 509, 510, 511, 512, 513, 515],
  alto: [601, 603, 607, 609, 613, 614, 615, 616, 617, 618],
  laje: [701, 703, 706, 707, 709, 712, 713, 715, 718],
}

export const GANGUES_DROP_EQUIP = {
  pista: { sinal: 214, tunel_m3: 216, tunel_m2: 217, beco_2: 218, beco_3: 226, galpao_m2: 228, rasteira_velha: 229, posmuro_2: 230 },
  feira: { catraca: 208, cobranca: 210, beco_gato: 211, mao_turco: 212, deposito_1: 232, deposito_2: 234, barraca_4: 235, mercadao_m2: 236 },
  baixada: { folgado_1: 302, folgado_final: 304, folgado_2: 305, folgado_3: 306, folgado_4: 308, folgado_5: 310 },
  vila: { guarita: 408, cadeado: 410, andar_1: 411, trinco: 412, andar_4: 414, andar_6: 416, bloco_inteiro: 417, chave_mestra: 418 },
  morro: { escadaria: 502, cupim: 504, laje_nova: 505, posto_rojao: 506, segunda_mae: 514, escadaria_inteira: 516, ultima_escada: 517, conta_do_morro: 518 },
  alto: { porta_aco: 602, sala_fechada: 604, cinco_presa: 605, cinco_engrenagem: 606, cinco_quase: 608, cinco_quarto: 610, formacao_completa: 611, favor_devido: 612 },
  laje: { ultima_guarda: 702, fiapo: 704, revanche_cobrador: 705, revanche_fura_bucho: 708, revanche_zefa: 710, costura_fina: 711, corte_certo: 714, revanche_contador: 716, fase_colcha: 717 },
}

/** A peça de prêmio da 1ª vitória num ponto da cena, ou null. */
export function dropDoPonto(cenaId, poiId) {
  return GANGUES_DROP_EQUIP[cenaId]?.[poiId] ?? null
}
