// Motor GENÉRICO de navegação da cena (rua OU cômodo de interior) — nenhuma
// função aqui depende de React nem sabe nada específico de território; tudo
// que precisa (coordenadas de pino/zona) vem de `cena.pos`/`cena.entryZones`,
// preenchidos por cada território (ver data/cenas/pista/posicoes.js).
// Extraído de GanguesCena.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §5).
export const WORLD = { w: 760, h: 2840 }
export const SPAWN = { x: 380, y: 2720 }
export const TILE = 20
export const STEP_MS = 110
export const PLAYER_RADIUS = 18

// Um obstáculo `solido` vira um retângulo de colisão PEQUENO em volta do ponto
// (o jogador tem raio 18; corredor da pista ~186px — colisor grande trancava).
export function obstRect(o) { return { x: o.x - 15, y: o.y - 11, w: 30, h: 22 } }

export function collidersDaCena(cena, bossAberto) {
  if (!cena) return []
  const q = cena.quarteiroes || []
  const s = (cena.obstaculos || []).filter(o => o.solido).map(obstRect)
  // prédios `solo` (fora dos quarteirões): a fachada é sólida; a porta é uma
  // zona à parte no chão (porta.zx/zy), então não precisa de "vão".
  const p = (cena.predios || []).filter(pr => pr.solo && (!pr.pos_portao || bossAberto)).map(pr => ({ x: pr.x, y: pr.y, w: pr.w, h: pr.h }))
  return [...q, ...s, ...p]
}

// ── Ambiente ativo (rua OU cômodo de interior) ────────────────
// Um "ambiente" abstrai o que o motor precisa: mundo, colisão e a lista de
// ALVOS (pinos de POI + porta + saída + passagem). Rua e interior usam o
// mesmo código de navegação e o mesmo botão de ação contextual.
export function resolverRefPoi(cena, refId) {
  if (refId === '__chefe') return { ...cena.chefe, id: 'boss', ehChefe: true }
  return cena.pois.find(p => p.id === refId) || null
}
export function estadoInternoPoi(def, prog) {
  if (def.ehChefe) return prog.boss ? 'resolvido' : 'disponivel'
  if (prog.resolvidos[def.id] && !def.repetivel) return 'resolvido'
  return 'disponivel'
}
export function estadoPoi(p, prog) { if (!p.visivel && !prog.revelados[p.id]) return 'escondido'; if (prog.resolvidos[p.id] && !p.repetivel) return 'resolvido'; return 'disponivel' }
// ids de POI que "moram dentro" de um interior — somem do mapa da rua.
export function refsInternos(cena) {
  const s = new Set()
  for (const inter of Object.values(cena.interiores || {}))
    for (const com of inter.comodos || [])
      for (const pd of com.pois || []) if (pd.ref && pd.ref !== '__chefe') s.add(pd.ref)
  return s
}
export function montarAmbiente(cena, local, prog, baseFeita, muroAberto) {
  if (!cena) return null
  const POS = cena.pos || {}
  const ENTRY_ZONES = cena.entryZones || {}
  const laDeCima = baseFeita || muroAberto // pode chegar do outro lado do muro (tunelando ou pelo muro aberto)
  if (!local) {
    const dentro = refsInternos(cena)
    const pois = cena.pois
      .filter(p => !dentro.has(p.id) && (p.visivel || prog.revelados[p.id] || (p.pos_portao && laDeCima)))
      .map(p => ({
        ...p, world: POS[p.id], zona: ENTRY_ZONES[p.id],
        estado: (p.pos_portao && laDeCima) ? estadoPoi({ ...p, visivel: true }, prog) : estadoPoi(p, prog),
        farmCompleto: Boolean(p.repetivel && prog.resolvidos[p.id]),
      }))
      .filter(p => p.world)
    // portas dos prédios que abrem interior (porta.zx/zy = zona no chão)
    const portas = (cena.predios || []).filter(pr => pr.porta?.para && (!pr.pos_portao || laDeCima)).map(pr => {
      const inter = cena.interiores?.[pr.porta.para]
      const gatePorPoi = inter?.abreCom
      const gateResolvido = inter?.abreComResolvido // exige o POI VENCIDO (não só revelado)
      const liberada = inter?.gate === 'portao'
        ? baseFeita
        : gateResolvido
          ? (Boolean(prog.resolvidos[gateResolvido]) || prog.boss)
          : (!gatePorPoi || prog.revelados[gatePorPoi] || prog.resolvidos[gatePorPoi] || prog.boss)
      const zx = pr.porta.zx ?? (pr.x + pr.w / 2), zy = pr.porta.zy ?? (pr.y + pr.h + 16)
      return {
        id: `porta_${pr.id}`, ehPorta: true, interId: pr.porta.para, predioId: pr.id,
        comodo: pr.porta.comodo || 0, spawn: pr.porta.spawn,
        world: { x: zx, y: zy }, zona: { x: zx - 34, y: zy - 30, w: 68, h: 60 },
        estado: inter ? (liberada ? 'disponivel' : 'trancado') : 'trancado',
      }
    })
    // se existe galpão-interior, o pino de chefe da RUA some (a luta é dentro)
    const temGalpaoInterno = Boolean(cena.interiores?.galpao)
    const alvos = [...pois, ...portas]
    if (!temGalpaoInterno) {
      alvos.push({
        ...cena.chefe, world: POS.boss, zona: ENTRY_ZONES.boss, ehChefe: true,
        estado: prog.boss ? 'resolvido' : laDeCima ? 'disponivel' : 'trancado',
      })
    }
    return {
      interior: false, world: cena.mundo || WORLD, colliders: collidersDaCena(cena, laDeCima),
      gateAtivo: muroAberto ? null : 'fechado', // o muro só abre depois do Carvão
      alvos: alvos.filter(a => a.world), nomeLugar: null,
    }
  }
  // interior
  const inter = cena.interiores?.[local.id]
  const com = inter?.comodos?.[local.comodo] || inter?.comodos?.[0]
  if (!com) return null
  const pois = (com.pois || []).map(pd => {
    if (pd.precisa && !prog.resolvidos[pd.precisa]) return null
    const def = pd.ref ? resolverRefPoi(cena, pd.ref) : pd.poi
    if (!def) return null
    return {
      ...def, world: pd.pos, zona: { x: pd.pos.x - 34, y: pd.pos.y - 34, w: 68, h: 68 },
      estado: estadoInternoPoi(def, prog), farmCompleto: Boolean(def.repetivel && prog.resolvidos[def.id]),
    }
  }).filter(Boolean)
  const alvos = [...pois]
  if (com.saida) alvos.push({ id: '__saida', ehSaida: true, paraPredio: com.saida.paraPredio, world: { x: com.saida.x + com.saida.w / 2, y: com.saida.y + com.saida.h / 2 }, zona: com.saida, estado: 'disponivel' })
  if (com.voltaPara != null) { const zw = com.world.w; alvos.push({ id: '__volta', ehVolta: true, para: com.voltaPara, world: { x: zw / 2, y: com.world.h - 16 }, zona: { x: 0, y: com.world.h - 34, w: zw, h: 34 }, estado: 'disponivel' }) }
  if (com.passagem) {
    const pg = com.passagem; const trancada = pg.precisa && !prog.resolvidos[pg.precisa]
    alvos.push({
      id: '__passagem', ehPassagem: true, para: pg.para, label: pg.label, precisa: pg.precisa,
      world: { x: pg.x + pg.w / 2, y: pg.y + pg.h / 2 }, zona: pg, estado: trancada ? 'trancado' : 'disponivel',
    })
  }
  // Cômodo com "voltar" (túnel/galpão): a zona de volta fica na borda de baixo,
  // mas TODO cômodo tem uma parede sólida de fundo ({x:0,y:h-28,w:tudo,h:28})
  // que cobria a zona inteira — o jogador só conseguia AVANÇAR, nunca voltar.
  // Aqui a gente remove qualquer colisor colado no rodapé quando o cômodo tem
  // `voltaPara`, deixando o caminho de volta livre.
  const colliders = (com.colliders || []).filter(c => com.voltaPara == null || c.y < com.world.h - 34)
  return {
    interior: true, world: com.world, colliders, gateAtivo: false,
    alvos, nomeLugar: inter.nome, comodoIdx: local.comodo, comodoTotal: inter.comodos.length, cenario: com.cenario || [],
  }
}

export function validPosition(p) { return Number.isFinite(p?.x) && Number.isFinite(p?.y) && p.x >= 35 && p.x <= WORLD.w - 35 && p.y >= 70 && p.y <= WORLD.h - 40 }
export function validPos(p, w) { return Number.isFinite(p?.x) && Number.isFinite(p?.y) && p.x >= 20 && p.x <= (w?.w || WORLD.w) - 20 && p.y >= 20 && p.y <= (w?.h || WORLD.h) - 20 }
// Overlap do "corpo" do jogador (mesmo raio da colisão) com a zona, não um
// ponto exato — com movimento em grade, o centro do jogador raramente cai
// pixel-perfeito dentro de corredores estreitos de 35-80px; exigir isso
// deixaria zonas inalcançáveis dependendo de por onde a grade passa perto
// delas. "Chegou perto o suficiente" é o comportamento certo pra interação.
export function insideZone(p, z) { return Boolean(z && p.x + PLAYER_RADIUS > z.x && p.x - PLAYER_RADIUS < z.x + z.w && p.y + PLAYER_RADIUS > z.y && p.y - PLAYER_RADIUS < z.y + z.h) }
export function hitsSolid(x, y, gate, colliders = []) {
  const hit = colliders.some(r => x + PLAYER_RADIUS > r.x && x - PLAYER_RADIUS < r.x + r.w && y + PLAYER_RADIUS > r.y && y - PLAYER_RADIUS < r.y + r.h)
  if (hit) return true
  // portão da gangue rival — enquanto FECHADO barra a faixa y330-350; depois
  // de aberto (chefe/galpão liberados) a faixa fica livre.
  if (gate === 'fechado' && y - PLAYER_RADIUS < 1350 && y + PLAYER_RADIUS > 1330) return true
  return false
}
export function stepPlayer(p, dx, dy, gate, colliders, world) {
  const W = world || WORLD
  const x = Math.max(20, Math.min(W.w - 20, p.x + dx * TILE)), y = Math.max(20, Math.min(W.h - 24, p.y + dy * TILE))
  return hitsSolid(x, y, gate, colliders) ? p : { x, y }
}
