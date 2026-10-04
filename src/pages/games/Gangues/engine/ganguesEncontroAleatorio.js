/* ══════════════════════════════════════════════════════════════
   ENCONTRO ALEATÓRIO da cena — refeito do zero em 26/09/2026 (substitui
   por completo "o bicho"). Pedido do Isaias:
   - o 1º vem com 5 minutos de jogo, depois de 15 em 15 minutos;
   - o Nego Véio avisa ("sujou o bagulho"), com fala própria por tipo;
   - aparece longe e PERSEGUE o jogador pelas ruas (pathfinding de verdade,
     respeitando prédio/quarteirão/muro — nunca atravessa parede);
   - é mais rápido que o jogador: é pra acontecer, não é pra fugir;
   - se o jogador entrar em outra luta/interior/diálogo, ele espera parado
     onde estava e continua quando o jogador volta pra rua;
   - alcançou → onomatopeia na tela → luta.
   Tipos: moto (assalto, "todo mundo tá sujeito"), polícia, e mais 2 da lore
   (bonde rival e o cobrador da Banca). Arte por enquanto = bolinha colorida.
   SEMPRE no mínimo 2 inimigos (Isaias, 26/09/2026) — por isso o encontro é
   isento da suavização de 1ª luta/frustração (GanguesRoute.jsx).
   Lógica pura (sem React) — o hook useGanguesEncontroAleatorio.js cuida do
   tempo/estado e a GanguesCena.jsx do desenho e da luta.
   ══════════════════════════════════════════════════════════════ */
import { TILE, hitsSolid } from './ganguesCenaMotor.js'

/** Tempo de jogo (em segundos, contado só andando na rua da cena). */
export const ALEATORIO_PRIMEIRO_S = 5 * 60
export const ALEATORIO_INTERVALO_S = 15 * 60
/** O perseguidor anda 1 TILE a cada PASSO_MS — o jogador anda 1 TILE a cada
 *  STEP_MS (110ms): 90ms ≈ 22% mais rápido, não dá pra despistar. */
export const ALEATORIO_PASSO_MS = 90
/** Distância de "alcançou" (px, centro a centro). */
export const ALEATORIO_ALCANCE = 30
/** Nasce a esta distância de CAMINHO (em passos de TILE) do jogador. */
const SPAWN_MIN_PASSOS = 16, SPAWN_MAX_PASSOS = 26

/** Os tipos. `revezamento` segue o formato de gerarBandoRevezamento
 *  (ganguesEncontros.js): `baseMaisForte` = a ficha do líder do bando fica
 *  perto do personagem MAIS FORTE da gangue × `ratioComTime` (o 2º corpo em
 *  diante sai 2–3 pontos abaixo). Nome/fala/onomatopeia no i18n
 *  (games.gangues.cena.aleatorio.<id>). `apelidos`: quem tem molde de papel
 *  genérico (Piloto/Garupa, Soldado/Cabo) ganha nome de rua próprio por
 *  corpo, sem repetir (batizarBando, ganguesEncontros.js). */
export const ALEATORIO_TIPOS = {
  // Se ganharem de você (`derrota`): a moto te rapela (até 3 consumíveis); a
  // Ronda pega o acerto (20% da grana na mão) e ainda leva 1 consumível.
  moto: { id: 'moto', cor: 'amarela', revezamento: { pool: [1701, 1702], budgetPorCorpo: 3, qtdMin: 2, qtdMax: 3, ratioComTime: 0.9, baseMaisForte: true, apelidos: 'moto' }, derrota: { levaConsumivel: 3 } },
  policia: { id: 'policia', cor: 'azul', revezamento: { pool: [1711, 1712], budgetPorCorpo: 3, qtdMin: 2, qtdMax: 3, ratioComTime: 1, baseMaisForte: true, apelidos: 'policia' }, derrota: { levaGranaFrac: 0.2, levaConsumivel: 1 } },
  bonde: { id: 'bonde', cor: 'vermelha', revezamento: { pool: [1204, 1205, 1206, 1207, 1208, 1209], budgetPorCorpo: 3, qtdMin: 3, qtdMax: 4, ratioComTime: 0.75, baseMaisForte: true } },
  cobranca: { id: 'cobranca', cor: 'roxa', revezamento: { pool: [1401, 1402, 1404, 1405, 1406], budgetPorCorpo: 3, qtdMin: 2, qtdMax: 2, ratioComTime: 1.15, baseMaisForte: true } },
  // ── Feira (v3.65.0) ──
  // O Rapa (fiscal da prefeitura): se ganhar de você, leva 1 consumível.
  rapa: { id: 'rapa', cor: 'laranja', revezamento: { pool: [1711, 1712], budgetPorCorpo: 3, qtdMin: 2, qtdMax: 3, ratioComTime: 1, baseMaisForte: true, apelidos: 'rapa' }, derrota: { levaConsumivel: 1 } },
  // O Apagão: Os Gato te cercam no breu (só do lado apagado da Feira).
  apagao: { id: 'apagao', cor: 'cinza', revezamento: { pool: [1104, 1106, 1204, 1105], budgetPorCorpo: 3, qtdMin: 3, qtdMax: 4, ratioComTime: 0.9, baseMaisForte: true } },
  // A Cobrança do Turco: só aparece pra quem deve ao agiota — se ganhar de
  // você, leva 10% da grana na mão (NUNCA abate a dívida: só o Clube quita).
  cobranca_divida: { id: 'cobranca_divida', cor: 'roxa', revezamento: { pool: [1304, 1305, 1404], budgetPorCorpo: 3, qtdMin: 2, qtdMax: 3, ratioComTime: 1.1, baseMaisForte: true }, derrota: { levaGranaFrac: 0.1 } },
}
const ORDEM_INICIAL = ['moto', 'policia']
// Sorteio padrão (a Pista). Cada cena pode trocar a lista (`cena.aleatorio`).
const SORTEIO_PADRAO = ['moto', 'policia', 'bonde', 'cobranca']

/** Qual tipo vem no n-ésimo encontro (0 = o primeiro): os 2 primeiros são
 *  sempre moto e depois polícia; daí em diante sorteia da lista da cena
 *  (`sorteio`), sem repetir o anterior. */
export function tipoDoEncontro(n, anterior = null, sorteio = null) {
  if (n < ORDEM_INICIAL.length) return ORDEM_INICIAL[n]
  const lista = (sorteio?.length ? sorteio : SORTEIO_PADRAO).filter(t => ALEATORIO_TIPOS[t])
  const opcoes = lista.filter(t => t !== anterior)
  const pool = opcoes.length ? opcoes : lista
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Estado salvo em storyProgress.__aleatorio (save do jogador):
 *  { tempo, proxima, contador, ultimo, ativo: null | { tipo, x, y } } */
export function estadoInicialAleatorio() {
  return { tempo: 0, proxima: ALEATORIO_PRIMEIRO_S, contador: 0, ultimo: null, ativo: null }
}

// ── Pathfinding: BFS numa grade de TILE px ────────────────────────
// O jogador anda em múltiplos de TILE a partir do spawn, então a grade do
// perseguidor é a mesma — cada célula é livre se o círculo do jogador caberia
// ali (`hitsSolid`, a MESMA colisão que trava o jogador, portão do muro incluso).
const celula = p => ({ cx: Math.round(p.x / TILE), cy: Math.round(p.y / TILE) })
const VIZ = [[1, 0], [-1, 0], [0, 1], [0, -1]]

function livreFn(world, gate, colliders) {
  const cache = new Map()
  return (cx, cy) => {
    const k = cx * 10000 + cy
    if (cache.has(k)) return cache.get(k)
    const x = cx * TILE, y = cy * TILE
    const ok = x >= 20 && x <= world.w - 20 && y >= 20 && y <= world.h - 24 && !hitsSolid(x, y, gate, colliders)
    cache.set(k, ok)
    return ok
  }
}

function bfs(origem, livre, parar) {
  const ini = celula(origem)
  const chave = (cx, cy) => cx * 10000 + cy
  const pai = new Map([[chave(ini.cx, ini.cy), null]])
  const fila = [[ini.cx, ini.cy, 0]]
  for (let i = 0; i < fila.length; i++) {
    const [cx, cy, d] = fila[i]
    if (parar(cx, cy, d)) return { alvo: [cx, cy], pai, chave }
    for (const [dx, dy] of VIZ) {
      const nx = cx + dx, ny = cy + dy, k = chave(nx, ny)
      if (pai.has(k) || !livre(nx, ny)) continue
      pai.set(k, [cx, cy]); fila.push([nx, ny, d + 1])
    }
    if (fila.length > 12000) break
  }
  return { alvo: null, pai, chave, fila }
}

/** Próxima posição do perseguidor rumo ao jogador (1 TILE por chamada),
 *  sempre por caminho livre. Sem caminho (jogador num lugar inalcançável),
 *  fica onde está. */
export function proximoPassoPerseguidor(de, ate, { world, gate, colliders }) {
  const livre = livreFn(world, gate, colliders)
  const alvo = celula(ate)
  const r = bfs(de, livre, (cx, cy) => Math.abs(cx - alvo.cx) + Math.abs(cy - alvo.cy) <= 1)
  if (!r.alvo) return de
  // volta pelo caminho até o 1º passo depois da origem
  let atual = r.alvo, anterior = null
  while (true) {
    const p = r.pai.get(r.chave(atual[0], atual[1]))
    if (!p) break
    anterior = atual; atual = p
  }
  const passo = anterior || r.alvo
  return { x: passo[0] * TILE, y: passo[1] * TILE }
}

/** Onde o perseguidor nasce: uma célula livre a 16–26 passos de CAMINHO do
 *  jogador (longe o bastante pra dar tempo de ver ele chegando, perto o
 *  bastante pra não demorar). Sem nenhuma nessa faixa, a mais distante. */
export function posicaoDeSpawnPerseguidor(player, { world, gate, colliders }) {
  const livre = livreFn(world, gate, colliders)
  const r = bfs(player, livre, () => false)
  const candidatos = []
  let maisLonge = null
  for (const [cx, cy, d] of r.fila || []) {
    if (d >= SPAWN_MIN_PASSOS && d <= SPAWN_MAX_PASSOS) candidatos.push([cx, cy])
    if (!maisLonge || d > maisLonge[2]) maisLonge = [cx, cy, d]
  }
  const escolhido = candidatos.length ? candidatos[Math.floor(Math.random() * candidatos.length)] : maisLonge
  return escolhido ? { x: escolhido[0] * TILE, y: escolhido[1] * TILE } : { x: player.x, y: player.y }
}
