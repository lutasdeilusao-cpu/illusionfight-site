const fichas = []

function gerarId() {
  return `ficha_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export async function salvarFicha(ficha) {
  const nova = { id: gerarId(), ...ficha }
  const idx = fichas.findIndex(f => f.id === ficha.id)
  if (idx !== -1) {
    fichas[idx] = nova
  } else {
    fichas.push(nova)
  }
  return { ...nova }
}

export async function carregarFichas() {
  return fichas.map(f => ({ ...f }))
}

export async function deletarFicha(id) {
  const idx = fichas.findIndex(f => f.id === id)
  if (idx !== -1) fichas.splice(idx, 1)
}
