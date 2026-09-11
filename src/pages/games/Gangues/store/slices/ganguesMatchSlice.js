// Slice: ciclo de vida da partida (match) — startMatch/endMatch/battleReport.
// Extraído de store/useGanguesStore.js
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
export default function createGanguesMatchSlice(set, get) {
  return {
    match: { playerTeam: [], enemyTeam: [], enemy: null, enemy_id: null, score: 0, status: 'idle', battleReport: null },

    // playerTeamOverride: usado pelo modo história pra levar só um recorte do
    // elenco pra batalha (teto de 3), sem mexer no activeParty "de verdade"
    // que o resto da UI (lobby, Arena) enxerga.
    startMatch: (enemy, enemyTeam = [enemy], playerTeamOverride = null) => {
      const playerTeam = playerTeamOverride || get().activeParty
      set({ match: { playerTeam, enemyTeam, enemy, enemy_id: enemy.id, score: 0, status: 'fighting', battleReport: null } })
    },

    setBattleReport: (battleReport) => set(state => ({ match: { ...state.match, battleReport } })),

    setEnemyCatalog: (_enemyCatalog) => set({ _enemyCatalog }),

    endMatch: (result) => set(state => {
      const newScore = result === 'victory' ? state.match.score + 1 : state.match.score
      return { match: { ...state.match, score: newScore, status: result === 'victory' ? 'victory' : 'defeat' } }
    }),
  }
}

