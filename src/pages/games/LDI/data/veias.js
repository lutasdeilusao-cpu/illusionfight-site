// As 5 Veias (linhas de conhecimento). O código só usa o id; nome, área e
// texto moram no i18n em games.ldi.veias.<id>. A cor vai pro CSS como
// --veia-cor.
export const VEIAS = [
  { id: 1, slug: 'fio-solto', cor: 'var(--if-cyan)', icone: '⌁' },
  { id: 2, slug: 'lona', cor: 'var(--if-danger)', icone: '✊' },
  { id: 3, slug: 'faro', cor: 'var(--if-amber)', icone: '◉' },
  { id: 4, slug: 'cao', cor: 'var(--if-ok)', icone: '❝' },
  { id: 5, slug: 'estatica', cor: 'var(--if-violet)', icone: '≋' },
]

export const veiaPorId = id => VEIAS.find(v => v.id === id) || null

// Algarismo romano do ato (I a IV).
export const romano = n => ['', 'I', 'II', 'III', 'IV', 'V'][n] || ''
