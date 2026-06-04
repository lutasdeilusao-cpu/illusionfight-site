const SUSPEITOS = {
  osvaldo: { nome: 'Osvaldo', desc: 'Dono do bar. Sabe de tudo, fala de menos.' },
  desconhecido_terno: { nome: 'O Homem do Terno', desc: 'Sempre de terno. Sempre onde não deveria estar.' },
  capanga_fabrica: { nome: 'Capanga da Fábrica', desc: 'Uniforme sujo. Mãos calejadas. Olhar vazio.' },
  contador: { nome: 'O Contador', desc: 'Números são sua linguagem. Mentiras são seu dialeto.' },
  ferreiro: { nome: 'O Ferreiro', desc: 'Forja ferraduras de dia. Álibis de noite.' },
  enfermeira: { nome: 'A Enfermeira', desc: 'Sorriso doce. Mãos frias. Ninguém nota quando ela sai do plantão.' },
  nina: { nome: 'Nina', desc: 'A mulher do chapéu preto. Sabe mais do que diz. Diz menos do que sabe.' },
  kim: { nome: 'Kim', desc: 'O dono do bar. O homem por trás de tudo.' },
}

export function defineSuspeito(id) {
  return SUSPEITOS[id] || null
}
