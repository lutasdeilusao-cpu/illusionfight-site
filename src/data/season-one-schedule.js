// Calendário oficial da Temporada 1 — pedido do Isaias, 22/09/2026.
//
// Modelo final (depois de 2 idas e vindas na mesma conversa):
// 1) Chegou uma tabela nova com 2 colunas (Portal / "Canvas") — decidiu não
//    citar Webtoon Canvas por nome ("usa como Outras Plataformas... vai que
//    eu lanço em outra também né").
// 2) Primeiro pediu pra tirar as linhas de assinante/conta da lista de
//    drops (só a data do Portal apareceria).
// 3) Mudou de ideia na sequência: "pra assinante vai sair 15 de novembro...
//    conta grátis 30 de novembro... free só vai ver 15 de dezembro... e
//    assim vai por todo o calendário, sempre dando prioridade aos
//    assinantes" — ou seja, o sistema de 3 níveis VOLTA pra lista de drops,
//    só que com uma regra nova e uniforme: cada data "Portal" da tabela
//    nova é a data de CONTA GRÁTIS; assinante = 15 dias antes; público =
//    15 dias depois. Mesmo capítulo, 3 momentos de acesso.
//
// Cada evento de Portal (capítulo LDI, hiato+Mundo das Sombras, ou T2 Cap.1)
// vira 3 linhas na timeline (assinante/conta/público), casando com o dia
// exato em que aquele nível libera aquele conteúdo. "Outras Plataformas"
// segue com as próprias datas, sem relação com os 3 níveis (não tem
// assinatura por lá, é ritmo próprio de tradução/postagem).
//
// Datas de HIATO sem dia exato na tabela original (só "fev/27", "jun/27",
// "out+nov/27") ganharam um dia de referência (meio do período) só pra virar
// a data de CONTA GRÁTIS âncora — não são datas oficiais anunciadas.
export const SEASON_ONE_DROPS = [
  { date: '2026-11-15', subscriber: 'LDI Cap. 1 (WEB SHARD)', account: '—', public: '—', outras: '—' },
  { date: '2026-11-30', subscriber: '—', account: 'LDI Cap. 1 (WEB SHARD)', public: '—', outras: '—' },
  { date: '2026-12-15', subscriber: 'LDI Cap. 2 (WEB SHARD)', account: '—', public: 'LDI Cap. 1 (WEB SHARD)', outras: 'Parte 1 (Cap.1/2)' },
  { date: '2026-12-30', subscriber: '—', account: 'LDI Cap. 2 (WEB SHARD)', public: '—', outras: 'Parte 2 (Cap.1/2) — fecha Cap.1' },
  { date: '2027-01-14', subscriber: '—', account: '—', public: 'LDI Cap. 2 (WEB SHARD)', outras: 'Parte 3 (Cap.2/2)' },
  { date: '2027-01-15', subscriber: 'LDI Cap. 3 (WEB SHARD)', account: '—', public: '—', outras: '—' },
  { date: '2027-01-29', subscriber: '—', account: '—', public: '—', outras: 'Parte 4 (Cap.2/2) — fecha Cap.2' },
  { date: '2027-01-30', subscriber: '—', account: 'LDI Cap. 3 (WEB SHARD)', public: '—', outras: '—' },
  { date: '2027-01-31', subscriber: 'HIATO LDI — Mundo das Sombras Cap. 1 (WEB SHARD) + Heróis da Cidade (4 tirinhas semanais)', account: '—', public: '—', outras: '—' },
  { date: '2027-02-13', subscriber: '—', account: '—', public: '—', outras: 'Parte 5 (Cap.3/2)' },
  { date: '2027-02-14', subscriber: '—', account: '—', public: 'LDI Cap. 3 (WEB SHARD)', outras: '—' },
  { date: '2027-02-15', subscriber: '—', account: 'HIATO LDI — Mundo das Sombras Cap. 1 (WEB SHARD) + Heróis da Cidade (4 tirinhas semanais)', public: '—', outras: 'Parte 6 (28/2) — fecha Cap.3' },
  { date: '2027-03-02', subscriber: '—', account: '—', public: 'HIATO LDI — Mundo das Sombras Cap. 1 (WEB SHARD) + Heróis da Cidade (4 tirinhas semanais)', outras: '—' },
  { date: '2027-03-15', subscriber: 'LDI Cap. 4 (WEB SHARD)', account: '—', public: '—', outras: '—' },
  { date: '2027-03-30', subscriber: '—', account: 'LDI Cap. 4 (WEB SHARD)', public: '—', outras: 'Parte 7 (Cap.4/2) — fecha junto com o lançamento do portal' },
  { date: '2027-04-14', subscriber: '—', account: '—', public: 'LDI Cap. 4 (WEB SHARD)', outras: 'Parte 8 (Cap.4/2) — fecha Cap.4' },
  { date: '2027-04-15', subscriber: 'LDI Cap. 5 (WEB SHARD)', account: '—', public: '—', outras: '—' },
  { date: '2027-04-30', subscriber: '—', account: 'LDI Cap. 5 (WEB SHARD)', public: '—', outras: 'Parte 9 (Cap.5/2)' },
  { date: '2027-05-15', subscriber: 'LDI Cap. 6 (WEB SHARD)', account: '—', public: 'LDI Cap. 5 (WEB SHARD)', outras: 'Parte 10 (Cap.5/2) — fecha Cap.5' },
  { date: '2027-05-30', subscriber: '—', account: 'LDI Cap. 6 (WEB SHARD)', public: '—', outras: 'Parte 11 (Cap.6/2)' },
  { date: '2027-06-05', subscriber: 'HIATO LDI — Mundo das Sombras Cap. 2 (WEB SHARD) + Heróis da Cidade (4 tirinhas semanais)', account: '—', public: '—', outras: '—' },
  { date: '2027-06-14', subscriber: '—', account: '—', public: 'LDI Cap. 6 (WEB SHARD)', outras: 'Parte 12 (Cap.6/2) — fecha Cap.6' },
  { date: '2027-06-20', subscriber: '—', account: 'HIATO LDI — Mundo das Sombras Cap. 2 (WEB SHARD) + Heróis da Cidade (4 tirinhas semanais)', public: '—', outras: '—' },
  { date: '2027-07-05', subscriber: '—', account: '—', public: 'HIATO LDI — Mundo das Sombras Cap. 2 (WEB SHARD) + Heróis da Cidade (4 tirinhas semanais)', outras: '—' },
  { date: '2027-07-15', subscriber: 'LDI Cap. 7 (WEB SHARD)', account: '—', public: '—', outras: '—' },
  { date: '2027-07-30', subscriber: '—', account: 'LDI Cap. 7 (WEB SHARD)', public: '—', outras: 'Parte 13 (Cap.7/2) — fecha junto com o portal' },
  { date: '2027-08-14', subscriber: '—', account: '—', public: 'LDI Cap. 7 (WEB SHARD)', outras: 'Parte 14 (Cap.7/2) — fecha Cap.7' },
  { date: '2027-08-15', subscriber: 'LDI Cap. 8 (WEB SHARD)', account: '—', public: '—', outras: '—' },
  { date: '2027-08-30', subscriber: '—', account: 'LDI Cap. 8 (WEB SHARD)', public: '—', outras: 'Parte 15 (Cap.8/2) — fecha junto com o portal' },
  { date: '2027-09-14', subscriber: '—', account: '—', public: 'LDI Cap. 8 (WEB SHARD)', outras: 'Parte 16 (Cap.8/2) — fecha Cap.8' },
  { date: '2027-09-15', subscriber: 'LDI Cap. 9 (WEB SHARD)', account: '—', public: '—', outras: '—' },
  { date: '2027-09-30', subscriber: '—', account: 'LDI Cap. 9 (WEB SHARD)', public: '—', outras: 'Parte 17 (Cap.9/2) — fecha junto com o portal' },
  { date: '2027-10-05', subscriber: 'HIATO LDI (duplo) — Mundo das Sombras Cap. 3 (WEB SHARD) + Heróis da Cidade (8 tirinhas semanais)', account: '—', public: '—', outras: '—' },
  { date: '2027-10-15', subscriber: '—', account: '—', public: 'LDI Cap. 9 (WEB SHARD)', outras: 'Parte 18 (Cap.9/2) — fecha Cap.9' },
  { date: '2027-10-20', subscriber: '—', account: 'HIATO LDI (duplo) — Mundo das Sombras Cap. 3 (WEB SHARD) + Heróis da Cidade (8 tirinhas semanais)', public: '—', outras: 'Outras plataformas paradas — sem material novo até a T2' },
  { date: '2027-11-04', subscriber: '—', account: '—', public: 'HIATO LDI (duplo) — Mundo das Sombras Cap. 3 (WEB SHARD) + Heróis da Cidade (8 tirinhas semanais)', outras: '—' },
  { date: '2027-12-15', subscriber: 'Temporada 2, Cap. 1 (WEB SHARD)', account: '—', public: '—', outras: '—' },
  { date: '2027-12-30', subscriber: '—', account: 'Temporada 2, Cap. 1 (WEB SHARD)', public: '—', outras: 'Parte 19 (Cap.10/2) — retoma junto com o portal' },
  { date: '2028-01-14', subscriber: '—', account: '—', public: 'Temporada 2, Cap. 1 (WEB SHARD)', outras: 'Parte 20 (Cap.10/2) — fecha Cap.10' },
].map((row, index) => ({ number: index + 1, ...row }))

// Data de conclusão de cada obra DENTRO da Temporada 1, por nível de acesso
// (assinante / conta grátis / público — mesma regra -15/0/+15 dias). Mar de
// Cinzas/Contos avulsos saíram da T1 nesta reformulação (não aparecem mais
// no calendário oficial) — ficam de fora daqui até voltarem a ter data.
export const SEASON_ONE_COMPLETION = [
  ['ldi', '2027-09-15', '2027-09-30', '2027-10-15'],
  ['shadows', '2027-10-05', '2027-10-20', '2027-11-04'],
]

// Panorama de temporadas — pedido do Isaias, 22/09/2026: "temos que deixar
// bem explícito: SE tivermos segunda temporada — e não sabemos se teremos
// ela — será lançada em tal data, e assim vale pras outras. A única coisa
// que garantimos é a T1." Datas de T2 em diante são a MESMA cadência
// aplicada pra frente (projeção), nunca uma promessa — por isso `confirmada`
// só é `true` na T1; o componente é quem decide como deixar isso visível
// (badge/aviso), não confiar só no texto do rodapé.
export const SEASONS_OVERVIEW = [
  { season: 'T1', start: '2026-11-30', end: '2027-09-30', note: 'note_t1', confirmada: true },
  { season: 'T2', start: '2027-12-30', end: '2028-10-30', confirmada: false },
  { season: 'T3', start: '2028-12-30', end: '2029-10-30', confirmada: false },
  { season: 'T4', start: '2029-12-30', end: '2030-10-30', confirmada: false },
  { season: 'T5', start: '2030-12-30', end: '2031-10-30', confirmada: false },
  { season: 'T6', start: '2031-12-30', end: '2032-10-30', confirmada: false },
]
