import { create } from 'zustand'
import { supabase } from '../../../../lib/supabase'
import { LDI_VERSION } from '../../../../config/version'
import { carregarCenas, avaliarEscolhas, aplicarEscolha, entrarNaCena, fimDe } from '../engine/historia'

console.log(`[LDI] versão carregada: ${LDI_VERSION}`)

// Save do Lendas: uma linha em lendas_saves. Sem conta, vive só na memória
// (o progresso some ao recarregar, de propósito — ver regra "sem save local").
const SAVE_VAZIO = {
  id: null, nome: '', veia: null, habilidades: [], cena: '1.1', ato: 1,
  flags: {}, pistas: [], diario: [], status: 'ativo',
}
const COLUNAS = 'id,nome,veia,habilidades,cena,ato,flags,pistas,diario,status,atualizado_em'

export const useLendasStore = create((set, get) => ({
  save: SAVE_VAZIO,
  userId: null,
  cenas: null,
  cena: null,
  escolhas: [],
  aprendeu: null,

  async iniciar(locale) {
    const cenas = await carregarCenas(locale)
    set({ cenas })
    get().irPara(get().save.cena)
  },

  novoJogo(nome, userId) {
    set({ save: { ...SAVE_VAZIO, nome: nome.trim() }, userId, cena: null, aprendeu: null })
  },

  carregar(linha, userId) {
    set({ save: { ...SAVE_VAZIO, ...linha }, userId, cena: null, aprendeu: null })
  },

  irPara(id) {
    const { cenas, save } = get()
    const cena = cenas?.get(id) || cenas?.get('1.1')
    if (!cena) return
    const { save: novo, aprendeu } = entrarNaCena(save, cena)
    set({ save: novo, cena, escolhas: avaliarEscolhas(cena, novo), aprendeu })
  },

  // Escolha feita (ou puzzle terminado, com `falhou`).
  escolher(escolha, falhou = false) {
    const { save, cena } = get()
    const destino = falhou && escolha.next_falha ? escolha.next_falha : escolha.next_scene
    const novo = aplicarEscolha(save, cena, escolha)
    const fim = fimDe(destino)
    if (fim) {
      set({ save: { ...novo, status: fim }, escolhas: [] })
    } else {
      set({ save: novo })
      get().irPara(destino)
    }
    get().salvar()
  },

  addPista(texto) {
    set(s => ({ save: { ...s.save, pistas: [...s.save.pistas, texto] } }))
  },

  limparAprendeu: () => set({ aprendeu: null }),

  // Os saves entram em fila: o 1º insert precisa devolver o id antes do
  // próximo virar update, senão a mesma jornada vira duas linhas.
  salvar() {
    fila = fila.then(() => gravar(get, set))
    return fila
  },
}))

let fila = Promise.resolve()
async function gravar(get, set) {
  const { save, userId } = get()
  if (!userId) return
  const { id, ...dados } = save
  const linha = { ...dados, user_id: userId, atualizado_em: new Date().toISOString() }
  const q = id
    ? supabase.from('lendas_saves').update(linha).eq('id', id).select('id').maybeSingle()
    : supabase.from('lendas_saves').insert(linha).select('id').maybeSingle()
  const { data, error } = await q
  if (error) { console.error('[LDI] save falhou:', error); return }
  if (!id && data?.id) set(s => ({ save: { ...s.save, id: data.id } }))
}

export async function listarSaves(userId) {
  const { data, error } = await supabase.from('lendas_saves').select(COLUNAS)
    .eq('user_id', userId).order('atualizado_em', { ascending: false })
  if (error) console.error('[LDI] listar saves falhou:', error)
  return data || []
}

export async function apagarSave(id) {
  const { error } = await supabase.from('lendas_saves').delete().eq('id', id)
  if (error) console.error('[LDI] apagar save falhou:', error)
  return !error
}
