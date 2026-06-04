const JACK_VERSION = '0.2.0'
console.log(`[JACK] versão carregada: ${JACK_VERSION}`)

import { create } from 'zustand'

const STORAGE_KEY = 'jack_candy_save'

const AREAS = {
  onibus: {
    id: 'onibus', nome: 'O Ônibus', desc: 'um ônibus abandonado. dentro, avatares sem rosto.',
    inimigos: 3, recompensa: 50, item: null, chefe: false,
    inimigoNome: 'avatar vazio',
  },
  rua: {
    id: 'rua', nome: 'A Rua de Marelia', desc: 'a rua que não termina. os passos ecoam.',
    inimigos: 5, recompensa: 80, item: { id: 'sapatos_couro', nome: 'Sapatos de Couro', desc: 'sapatos pretos. gastos. firmes.', icone: '👞' }, chefe: false,
    inimigoNome: 'vulto na neblina',
  },
  boteco: {
    id: 'boteco', nome: 'O Boteco do Jazz', desc: 'música ao fundo. copos sujos. gente pior.',
    inimigos: 6, recompensa: 150, item: null, chefe: true,
    inimigoNome: 'frequentador', chefeNome: 'gerente do boteco',
  },
}

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return null
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      capangas: state.capangas, capangasTotais: state.capangasTotais,
      notas: state.notas, inventario: state.inventario,
      flags: state.flags, fase: state.fase,
      titleDone: state.titleDone, pajéApareceu: state.pajéApareceu,
      mostraBarraca: state.mostraBarraca,
      areasCompletas: state.areasCompletas,
      questHp: state.questHp, questMaxHp: state.questMaxHp,
      danoBengala: state.danoBengala,
      kimShopAberto: state.kimShopAberto,
    }))
  } catch (_) {}
}

const defaultState = {
  capangas: 0, capangasTotais: 0, notas: 0,
  inventario: [], flags: {}, fase: 'inicio',
  titleDone: false, pajéApareceu: false, mostraBarraca: false,
  monologoAtual: null,
  areasCompletas: [],
  questHp: 5, questMaxHp: 5,
  danoBengala: 1,
  kimShopAberto: false,
  questAtiva: null,
  questStep: 0,
  questProgress: 0,
  questInimigosRestantes: 0,
  questResultado: null,
}

function rollD6() { return Math.floor(Math.random() * 6) + 1 }

export const useJackStore = create((set, get) => {
  const saved = loadSave()
  return {
    ...defaultState, ...(saved || {}),

    tick: () => {
      set(state => {
        const b = state.capangas + 1
        const t = state.capangasTotais + 1
        const m = t > 0 && t % 500 === 0 ? 'eram tantos que perdi a conta. no sonho isso era normal.' : state.monologoAtual
        return { capangas: b, capangasTotais: t, monologoAtual: m }
      })
    },

    guardar: () => set(state => ({ monologoAtual: `você empilhou os capangas. ${state.capangas} corpos no chão.` })),
    rolarNoChao: () => set(state => ({ capangas: 0, monologoAtual: `você jogou ${state.capangas} capangas pela janela. foram longe.` })),

    comprarBengala: () => {
      set(state => {
        if (state.capangas < 100 || state.flags.TEM_BENGALA) return state
        return {
          capangas: state.capangas - 100,
          inventario: [...state.inventario, { id: 'bengala_steampunk', nome: 'Bengala Steampunk', desc: 'bengala de madeira com engrenagens douradas. parece pesada. parece certa.', icone: '⚙' }],
          flags: { ...state.flags, TEM_BENGALA: true },
          danoBengala: 1,
          monologoAtual: 'no sonho eu sempre soube que ia precisar de algo pra bater. só não sabia que ia ser uma bengala.',
          mostraBarraca: false,
        }
      })
    },
    fecharBarraca: () => set({ mostraBarraca: false }),
    abrirBarraca: () => set({ mostraBarraca: true }),

    // === QUESTS ===

    iniciarQuest: (areaId) => {
      const area = AREAS[areaId]
      if (!area) return
      set({
        questAtiva: areaId,
        questStep: 0,
        questProgress: 0,
        questInimigosRestantes: area.inimigos,
        questResultado: null,
        questHp: get().questMaxHp,
        monologoAtual: 'a rua no sonho tinha o mesmo cheiro da rua de verdade. só que aqui eu sabia que podia bater em todo mundo.',
      })
    },

    tickQuest: () => {
      const state = get()
      if (!state.questAtiva || state.questResultado) return
      const area = AREAS[state.questAtiva]
      if (!area) return
      const step = state.questStep + 1
      const totalSteps = 15
      const spawnInterval = Math.floor(totalSteps / (area.inimigos + 1))
      let inimigosRestantes = state.questInimigosRestantes
      let resultado = null
      let hp = state.questHp
      let capangas = state.capangas
      let inimsRest = inimigosRestantes
      let monologo = null

      if (step >= totalSteps) {
        const completa = !state.areasCompletas.includes(area.id)
        const recompensa = completa ? area.recompensa : Math.floor(area.recompensa / 2)
        capangas += recompensa
        const novasAreas = completa ? [...state.areasCompletas, area.id] : state.areasCompletas
        const novoItem = completa && area.item ? [...state.inventario, area.item] : state.inventario
        if (area.id === 'boteco' && completa && !state.flags.KIM_LIBERADO) {
          monologo = 'kim nunca falava muito. no sonho era igual. pelo menos era consistente.'
        }
        set({
          questAtiva: null, questStep: 0, questProgress: 0, questInimigosRestantes: 0,
          questResultado: 'completo', capangas, inventario: novoItem,
          areasCompletas: novasAreas, monologoAtual: monologo,
          flags: { ...state.flags, [`${area.id.toUpperCase()}_COMPLETO`]: true, ...(area.id === 'boteco' && completa ? { KIM_LIBERADO: true } : {}) },
        })
        return
      }

      if (step % spawnInterval === 0 && inimsRest > 0) {
        const ataqueJogador = rollD6() + (state.danoBengala || 1)
        const ataqueInimigo = rollD6()
        const dano = Math.max(0, ataqueJogador - ataqueInimigo)
        hp -= Math.max(0, ataqueInimigo - (state.danoBengala || 1))
        inimsRest--
        if (hp <= 0) {
          set({
            questResultado: 'derrota', questAtiva: null, questStep: 0,
            questHp: state.questMaxHp, questInimigosRestantes: inimsRest,
            monologoAtual: 'acordei. não de verdade. só dentro do sonho mesmo.',
          })
          return
        }
        set({
          questStep: step, questProgress: step / totalSteps,
          questInimigosRestantes: inimsRest, questHp: hp,
          monologoAtual: `batalha: você ${ataqueJogador} vs ${ataqueInimigo}. ${dano > 0 ? `inimigo levou ${dano} de dano.` : `você defendeu.`}`,
        })
        return
      }

      set({ questStep: step, questProgress: step / totalSteps })
    },

    // === KIM ===

    abrirKimShop: () => set({ kimShopAberto: true }),
    fecharKimShop: () => set({ kimShopAberto: false }),

    comprarUpgradeBengala: () => {
      const nivel = get().danoBengala || 1
      const custo = nivel >= 2 ? 250 : 100
      set(state => {
        if (state.capangas < custo) return state
        return {
          capangas: state.capangas - custo,
          danoBengala: nivel + 1,
          monologoAtual: `a bengala parece mais pesada agora. dano: +${nivel + 1}.`,
        }
      })
    },

    comprarPocao: () => {
      set(state => {
        if (state.capangas < 30) return state
        return {
          capangas: state.capangas - 30,
          questMaxHp: state.questMaxHp + 1,
          questHp: Math.min(state.questMaxHp + 1, state.questHp + 2),
          inventario: [...state.inventario, { id: 'pocao_energetico', nome: 'Poção Energética', desc: 'lata amassada. gosto de infância.', icone: '🥫', consumivel: true }],
          monologoAtual: 'energético quente. o gosto de quando tudo era mais simples.',
        }
      })
    },

    // === MISC ===

    setTitleDone: () => set({ titleDone: true }),
    limparMonologo: () => set({ monologoAtual: null }),
    reset: () => set({ ...defaultState }),
    persistNow: () => persist(get()),
  }
})

setInterval(() => {
  const state = useJackStore.getState()
  if (state.fase) persist(state)
}, 30000)

export { AREAS }
