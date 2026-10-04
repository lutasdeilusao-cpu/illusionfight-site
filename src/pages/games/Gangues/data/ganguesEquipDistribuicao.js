// Equipamento que cada bairro vende (uma categoria por bairro: comum Pista,
// incomum Feira, raro Baixada, pesado Vila, grife Morro, nobre Alto, lendário
// Laje). A loja vende ~10 peças, sempre na versão SEM encaixe — o caminho da
// especialidade inteiro + arma e corpo dos outros dois (Pista/Vila atacante,
// Feira/Morro defensor, Baixada/Alto místico; a Laje vende arma, corpo e
// amuleto de todos). A versão com encaixe só cai de inimigo (ganguesDrops.js).
export const GANGUES_LOJA_EQUIP = {
  pista: [201, 202, 203, 204, 205, 206, 213, 215, 225, 227, 238],
  feira: [207, 209, 219, 220, 221, 222, 223, 224, 231, 233],
  baixada: [301, 303, 307, 309, 311, 312, 313, 314, 315, 316, 317, 318],
  vila: [401, 402, 403, 404, 405, 406, 407, 409, 413, 415],
  morro: [501, 503, 507, 508, 509, 510, 511, 512, 513, 515],
  alto: [601, 603, 607, 609, 613, 614, 615, 616, 617, 618],
  laje: [701, 703, 706, 707, 709, 712, 713, 715, 718],
}
