const LOCAIS = {
  beco_estacao: { nome: 'Beco da Estação', desc: 'Úmido. Escuro. Cheira a cigarro velho e segredos.' },
  bar_esquina: { nome: 'Bar da Esquina', desc: 'Ponto de encontro. Todo mundo passa por aqui mais cedo ou mais tarde.' },
  delegacia_central: { nome: 'Delegacia Central', desc: 'A lei em Marelia. Arquivos empoeirados e casos não resolvidos.' },
  fabrica_marelia: { nome: 'Fábrica de Marelia', desc: 'Fechada há três anos. Luzes no segundo andar dizem o contrário.' },
  escritorio_fabrica: { nome: 'Escritório da Fábrica', desc: 'Papeis, recibos, livros-caixa. Alguém organizou a bagunça recentemente.' },
  porto_marelia: { nome: 'Porto de Marelia', desc: 'Containers empilhados. O som das ondas abafa o que não se deve ouvir.' },
  oficina_ferreiro: { nome: 'Oficina do Ferreiro', desc: 'Ferramentas, fogo, metal. Cada martelada ecoa no beco ao lado.' },
  hotel_central: { nome: 'Hotel Central', desc: 'Quartos alugados por hora. O recepcionista vê tudo e não conta nada.' },
  hospital_central: { nome: 'Hospital Central', desc: 'Corredores brancos. Prontuários que somem. Silêncio depois da meia-noite.' },
  correio_central: { nome: 'Correio Central', desc: 'Cartas, pacotes, encomendas. Alguém aqui sabe para onde tudo vai.' },
}

export function defineLocal(id) {
  return LOCAIS[id] || { nome: id, desc: 'Local de investigação.' }
}
