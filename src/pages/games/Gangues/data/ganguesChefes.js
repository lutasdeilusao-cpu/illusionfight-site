/* ══════════════════════════════════════════════════════════════
   CHEFES — tabelas (equipe fixa, orçamento de pontos, fração do líder,
   corpos por luta). Só dado: a geração do bando é gerarBandoChefe em
   ./ganguesEncontros.js, e a prévia da carta (TretaVS) usa pontosPreviewPoi
   no mesmo arquivo. Separado de ganguesEncontros.js pra ele não passar de
   500 linhas (AGENTS.md, regra de tamanho de arquivo).
   ══════════════════════════════════════════════════════════════ */
// Equipe do CHEFE — fixa, nunca sorteada. O chefe não anda sozinho, leva os
// melhores da própria gangue junto (o 1º id é sempre o próprio chefe). Sendo
// sempre a mesma composição, dá pra aprender o combate e voltar mais forte —
// bem diferente do bando comum, que é aleatório de propósito.
// O 1º id é sempre o próprio chefe; os outros são os 2 GENERAIS daquele
// território (faixa 1451+, ver GDD §5.5) — vencer o chefe desbloqueia os
// generais no Álbum de uma vez, já que eles não aparecem em treta comum.
export const GANGUES_CHEFE_EQUIPE = {
  pista: [1500, 1451, 1452],
  feira: [1501, 1453, 1454],
  baixada: [1502, 1455, 1456],
  vila: [1503, 1457, 1458],
  morro: [1504, 1459, 1460],
  alto: [1505, 1461, 1462],
  laje: [1600, 1463, 1464],
}

// Orçamento de pontos FIXO do bando do chefe, por território — NÃO escala com o
// jogador (ao contrário da treta comum). É de propósito: o chefe é um paredão
// fixo, e o loop de RPG é você VOLTAR mais forte.
//
// ESCADA DE NÍVEL DOS 7 CHEFES (pedido do Isaias, dez/2026): 7 territórios,
// teto do jogador L99. Cada chefe é "pau a pau" no nível-alvo abaixo:
//   pista 15 · feira 28 · baixada 42 · vila 56 · morro 70 · alto 84 · laje 99+
// (~14 níveis entre cada; o 7º é PAREDÃO — encara no L99 e ainda apanha).
//
// calcularPontosTime = soma de A+H+D+PV+PM, e o crescimento autorado é
// EXATAMENTE +1 ponto por nível → 1 ficha nível N = N pontos (+ o total
// inicial de nível 1). O time cresce 1 vaga por território dominado (2 na
// Pista, 3 na Feira, ... até 6 = teto de batalha):
//   pista  L15 · 2 fichas ·  30 pts → budget ~35  (~1.15×, pau a pau)
//   feira  L28 · 3 fichas ·  84 pts → budget ~97
//   baixada L42 · 4 fichas · 168 pts → budget ~193
//   vila   L56 · 5 fichas · 280 pts → budget ~322
//   morro  L70 · 6 fichas · 420 pts → budget ~483
//   alto   L84 · 6 fichas · 504 pts → budget ~580
//   laje   L99 · 6 fichas · 594 pts → budget ~700 (paredão, ~1.18×)
//
// AJUSTE jan/2027 (feedback do Isaias — "tô matando no automático com uma
// porrada, sou muito de upar"): +~4 níveis por ficha em cada chefe (o Isaias
// pediu "3 a 5 pontos"), +5 na Laje. Não é soft-scaling (o chefe continua
// fixo — o loop de RPG é voltar mais forte), só um piso mais alto pra não
// virar pushover pra quem chega no nível-alvo. "Playtest pra confirmar" —
// ver o ajuste de 15/09/2026 logo abaixo, esse foi o playtest.
//
// AJUSTE 15/09/2026 (Isaias, via relato do amigo dele jogando): o playtest
// pedido acima aconteceu — amigo chegou no Carvão no nível 11 (bem abaixo do
// alvo L15) e "venceu com certa facilidade". Investigado com simulação real
// (mesma iniciativa H+d3, mesmo FA/FD do resolver, sem usar poderes — modo
// Automático só ataca no normal): SEM equipamento, o Carvão de fato esmaga
// (só ~5% de vitória do jogador) — o budget em si tava correto. O furo real:
// `calcularPontosTime` (usada em toda escala dinâmica) soma só atributo CRU,
// nunca conta o bônus de equipamento — e o chefe, sendo orçamento FIXO, não
// tem NENHUMA compensação em lugar nenhum. Simulado: +2A/+1D por ficha (1
// arma barata cada, fácil de bancar) já vira a luta pra ~49%; +4A/+2D vira
// ~88% pro jogador — "vitória com certa facilidade" bate exatamente com uma
// gangue com um pouco de equipamento.
//
// Decisão do Isaias (não foi "só sobe o budget" — foi mudar o paradigma):
// PARAR de tentar acompanhar a ficha do jogador nas tretas da Pista (a raiz
// do problema é viver perseguindo um alvo que build de equipamento sempre
// vai furar). Pista virou NÍVEL FIXO ponta a ponta — cada POI tem uma ficha
// de pontos travada de propósito, sem depender de playerTeam/ratio nenhum
// (ver `pontosFixo`/`poi.fixo` em GanguesCena.jsx+GanguesRoute.jsx e o
// `revezamento` das tretas comuns em data/cenas/pista/pois.js). Ladder
// aprovada pelo Isaias: 1º inimigo nível 3, tretas de rua sobem de 3 em 3
// (6, 9), os 2 Generais ficam acima da média da rua (13, 16), o galpão
// pós-muro continua subindo (17, 19) e o Carvão fecha fixo em nível 20 —
// dessa vez o equipamento é um bônus de verdade (você fica mais forte que o
// "nível" da luta), não um furo que zera o desafio.
// Budget recalculado pra bater Carvão=20: corpos=2, liderFrac=0.60 →
// 33×0.60=19.8→20 (Carvão) e o resto (13) pro Sinaleiro que o acompanha.
// Os outros 6 territórios (ainda formato antigo) continuam na tabela velha
// até passarem pelo mesmo tratamento.
//
// AJUSTE 15/09/2026 nº2 (Isaias, direto, sem ambiguidade): "de três em três
// essa progressão, a primeira luta [sinal] é MUITO fácil de propósito (ficha
// de 3, sempre) — a partir da segunda luta sobe de 3 em 3 sem exceção, cada
// inimigo novo tem que obrigar a ralar uns 3 níveis pra encarar o próximo."
// Ladder final da Pista: sinal=3 · beco=8 · beco_2=11 · beco_3=14 ·
// Sinaleiro=17 · Rasteira Velha=20 · posmuro_1=23 · posmuro_2=26 ·
// Carvão=30 (o chefe quebra o padrão de +3 de propósito — "pra ser difícil,
// pra ser ralado"). Budget recalculado pra bater Carvão=30: corpos=2,
// liderFrac=0.60 → 50×0.60=30 (Carvão) e o resto (20) pro Sinaleiro que
// some com ele na luta de chefe.
// Pista 48 (29/09/2026): calibrado por simulação pro teto 20 — dupla nível 20
// com o conjunto comum vence ~60%, sem item ~30%.
// 29/09/2026 (Isaias: "46 tá muito alto, é o 2º de 7"): Feira comprimida pra
// faixa 21–33 — Cobrador 82×0.40 = 33 (teto do bairro), escolta ~25 cada.
export const GANGUES_CHEFE_BUDGET = { pista: 48, feira: 82, baixada: 115, vila: 148, morro: 180, alto: 606, laje: 732 }
// Fração do orçamento que vai pro LÍDER (o chefe em si), por território.
// Feira (v3.65.0, PLANO_FEIRA.md §5): 110 × 0,47 → Cobrador 52 e as duas
// escoltas (Mão do Turco e Caixa Forte) com 29 cada — o orçamento 110 que já
// existia fecha certinho, só mudou a divisão.
// Vila (30/09/2026, PLANO_VILA.md §5): 148 × 0,40 → Ferrugem 59 e os dois
// Generais de escolta (Bloco Inteiro e Chave Mestra Maior) com ~44 cada.
// Morro (30/09/2026): 180 × 0,40 → A Fera 72, escolta ~54 cada.
const GANGUES_CHEFE_LIDER_FRAC = { pista: 0.60, feira: 0.40, baixada: 0.40, vila: 0.40, morro: 0.40 }
const GANGUES_CHEFE_LIDER_FRAC_PADRAO = 0.60
export function liderFracChefe(territorioId) {
  return GANGUES_CHEFE_LIDER_FRAC[territorioId] ?? GANGUES_CHEFE_LIDER_FRAC_PADRAO
}
/** REGRA (Isaias, 28/09/2026): o inimigo mais forte de cada território é
 *  sempre o CHEFÃO — "não pode ter inimigo mais forte no território que o
 *  boss". Este é o nível (pontos de ficha) do líder do bando do chefe — o
 *  teto de qualquer corpo gerado naquele território (a conta exata, com a
 *  ficha escalada, é pontosDoChefe em ganguesEncontros.js). */
export function tetoDoTerritorio(territorioId) {
  const budget = GANGUES_CHEFE_BUDGET[territorioId]
  return budget ? Math.round(budget * liderFracChefe(territorioId)) : null
}
// Quantos CORPOS o bando do chefe tem (o resto de GANGUES_CHEFE_EQUIPE fica só
// pra lore/álbum). Pista = 2 (Carvão + Rasteira Velha): 2×2 é a única treta
// justa enquanto o elenco do jogador é travado em 2 fichas (a vaga nº 3 só abre
// vencendo o próprio chefe). O 3º general (Sinaleiro Chefe, 1451) é
// colecionável no POI `sinaleiro` da cena da Pista. Feira = 3 (Cobrador + os
// dois generais), pra um time que já tem a 3ª vaga.
export const GANGUES_CHEFE_CORPOS = { pista: 2, feira: 3, baixada: 3, vila: 3, morro: 3 }
