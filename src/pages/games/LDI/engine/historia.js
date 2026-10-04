// Motor da história do Lendas: carrega as cenas, decide quais escolhas
// aparecem e o que cada escolha muda no save. Sem React e sem Supabase.
//
// Cena:    { id, title, text[], choices[], capitulo?, destaque?, luta?, ensina?: [ids] }
// Escolha: { id, label, next_scene, requer?: { hab: id | [ids] }, veia?, someQuandoSabe?: [ids],
//            decisao?, flags_required?, flags_set?, isPuzzle?, puzzleType?, puzzleDiff?, luta?, next_falha? }
// next_scene "fim:<vitoria|derrota|fork>" encerra a jornada.
//
// Habilidade só se aprende dentro da própria Veia. `ensina` numa cena é uma
// lista: o jogador aprende a primeira da lista que é da Veia dele e que ele
// ainda não sabe (uma por visita). `requer.hab` com lista = qualquer uma serve.

import { habilidadePorId } from '../data/habilidades'

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
// que não aconteceu some; presa a habilidade aparece trancada com o nome dela
// (motivo = id da habilidade), pra mostrar que outro caminho abre a porta.
export function avaliarEscolhas(cena, save) {
  const sabe = save.habilidades || []
  return (cena?.choices || [])
    .filter(ch => (ch.flags_required || []).every(f => save.flags?.[f]))
    .filter(ch => !(ch.someQuandoSabe || []).some(h => sabe.includes(h)))
    .map(ch => {
      const pedidas = [].concat(ch.requer?.hab ?? [])
      if (!pedidas.length || pedidas.some(h => sabe.includes(h))) return { ...ch, disponivel: true }
      const motivo = pedidas.find(h => habilidadePorId(h)?.veia === save.veia) ?? pedidas[0]
      return { ...ch, disponivel: false, motivo }
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
  if (escolha.veia) novo.veia = escolha.veia
  return novo
}

function aprender(save, lista) {
  const sabe = save.habilidades || []
  const nova = lista.find(id => habilidadePorId(id)?.veia === save.veia && !sabe.includes(id))
  return nova ? { save: { ...save, habilidades: [...sabe, nova] }, aprendeu: nova } : { save, aprendeu: null }
}

// Entrar numa cena: atualiza cena/ato e aprende o que a cena ensina.
// Devolve o save novo e a habilidade aprendida (pra tela anunciar).
export function entrarNaCena(save, cena) {
  return aprender({ ...save, cena: cena.id, ato: atoDaCena(cena.id) }, cena.ensina || [])
}

export const fimDe = destino => (destino?.startsWith('fim:') ? destino.slice(4) : null)
