// Motor da história do Lendas: carrega as cenas, decide quais escolhas
// aparecem e o que cada escolha muda no save. Sem React e sem Supabase.
//
// Cena:    { id, title, text[], choices[], capitulo?, destaque?, luta?, ganha?: { nivel } }
// Escolha: { id, label, next_scene, requer?: { veia?, nivel }, veia?, decisao?,
//            flags_required?, flags_set?, isPuzzle?, puzzleType?, puzzleDiff?, next_falha? }
// next_scene "fim:<vitoria|derrota|fork>" encerra a jornada.

import { NIVEL_MAX } from '../data/veias'

// O texto do Lendas só está pronto em português; os outros idiomas entram
// depois que o texto for aprovado.
const IDIOMAS_PRONTOS = ['pt']
const ATOS = [1, 2, 3, 4]
const cache = {}

export async function carregarCenas(locale) {
  const lang = IDIOMAS_PRONTOS.includes(locale) ? locale : 'pt'
  if (!cache[lang]) {
    const atos = await Promise.all(ATOS.map(a => import(`../data/scenes/${lang}/act${a}.json`)))
    cache[lang] = new Map(atos.flatMap(m => m.default).map(c => [c.id, c]))
  }
  return cache[lang]
}

export const atoDaCena = id => parseInt(id, 10) || 1

// Cada escolha volta com { disponivel, motivo }. Escolha presa a um evento
// que não aconteceu some; presa a Veia ou nível aparece trancada, pra
// mostrar que outro caminho abriria aquela porta.
export function avaliarEscolhas(cena, save) {
  return (cena?.choices || [])
    .filter(ch => (ch.flags_required || []).every(f => save.flags?.[f]))
    .map(ch => {
      const r = ch.requer
      if (!r) return { ...ch, disponivel: true }
      const veiaOk = !r.veia || save.veia === r.veia
      const nivelOk = (save.nivel || 0) >= r.nivel
      return { ...ch, disponivel: veiaOk && nivelOk, motivo: veiaOk && nivelOk ? null : r }
    })
}

// O que uma escolha muda no save (sem ainda trocar de cena).
export function aplicarEscolha(save, cena, escolha) {
  const flags = { ...save.flags }
  for (const f of escolha.flags_set || []) flags[f] = true
  // Passagem de uma opção só ("Respirar", "Seguir em frente") não é escolha:
  // não vai pro diário.
  const escolheu = (cena.choices || []).length > 1
  const novo = {
    ...save,
    flags,
    diario: escolheu ? [...save.diario, { cena: cena.title, escolha: escolha.label, ato: atoDaCena(cena.id) }] : save.diario,
  }
  if (escolha.veia) { novo.veia = escolha.veia; novo.nivel = Math.max(1, save.nivel || 0) }
  return novo
}

// Entrar numa cena: atualiza cena/ato e sobe o nível se a cena der um nível
// novo. Devolve o save novo e quanto subiu (pra tela anunciar).
export function entrarNaCena(save, cena) {
  const novo = { ...save, cena: cena.id, ato: atoDaCena(cena.id) }
  const alvo = Math.min(NIVEL_MAX, cena.ganha?.nivel || 0)
  if (save.veia && alvo > (save.nivel || 0)) {
    novo.nivel = alvo
    return { save: novo, subiu: alvo }
  }
  return { save: novo, subiu: 0 }
}

export const fimDe = destino => (destino?.startsWith('fim:') ? destino.slice(4) : null)
