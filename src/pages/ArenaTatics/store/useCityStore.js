/* ═══════════════════════════════════════════════════
   useCityStore — Zustand store for Marélia city state
   
   Gerencia: distrito atual, clima, tempo do dia,
   estados de NPCs, descobertas do jogador
   ═══════════════════════════════════════════════════ */

import { create } from 'zustand'

function calcWeather(time) {
  if (time < 360 || time > 1260) return 'night'       // 06:00–21:00 = dia
  if (Math.random() > 0.88) return 'rain'
  return 'clear'
}

export const useCityStore = create((set, get) => ({
  currentDistrict: 'central',
  visitedDistricts: ['central'],
  discoveredPlaces: [],
  cityTime: 480,           // 0–1440 minutos (08:00 = início)
  cityWeather: 'clear',     // 'clear' | 'rain' | 'night'
  npcStates: {},            // { [npcId]: { falou: false, questAceita: false, questCompleta: false } }
  particlesVisible: true,
  transitionOverlay: false,

  enterDistrict: (id) => {
    set(s => ({
      currentDistrict: id,
      visitedDistricts: s.visitedDistricts.includes(id)
        ? s.visitedDistricts : [...s.visitedDistricts, id],
    }))
  },

  discoverPlace: (placeName) => set(s => ({
    discoveredPlaces: s.discoveredPlaces.includes(placeName)
      ? s.discoveredPlaces : [...s.discoveredPlaces, placeName],
  })),

  advanceTime: (minutes) => {
    const t = (get().cityTime + minutes) % 1440
    set({ cityTime: t, cityWeather: calcWeather(t) })
  },

  setCityTime: (t) => set({ cityTime: t % 1440, cityWeather: calcWeather(t % 1440) }),

  talkToNpc: (npcId) => set(s => ({
    npcStates: {
      ...s.npcStates,
      [npcId]: { ...(s.npcStates[npcId] || {}), falou: true },
    },
  })),

  setNpcQuest: (npcId, aceita) => set(s => ({
    npcStates: {
      ...s.npcStates,
      [npcId]: { ...(s.npcStates[npcId] || {}), questAceita: aceita },
    },
  })),

  completeNpcQuest: (npcId) => set(s => ({
    npcStates: {
      ...s.npcStates,
      [npcId]: { ...(s.npcStates[npcId] || {}), questCompleta: true },
    },
  })),

  setTransitionOverlay: (v) => set({ transitionOverlay: v }),

  reset: () => set({
    currentDistrict: 'central',
    visitedDistricts: ['central'],
    discoveredPlaces: [],
    cityTime: 480,
    cityWeather: 'clear',
    npcStates: {},
    particlesVisible: true,
    transitionOverlay: false,
  }),
}))
