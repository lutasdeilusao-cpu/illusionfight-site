export const INIMIGOS = {
  capanga_terno_01: { id: 'capanga_terno_01', nome: 'Capanga do Terno', hp: 20, atk: 3, def: 1, desc: 'Um capanga qualquer. Segue ordens. Não faz perguntas.' },
  capanga_terno_02: { id: 'capanga_terno_02', nome: 'Capanga do Terno (veterano)', hp: 30, atk: 4, def: 2, desc: 'Experiente. Já fez isso antes. Não vai ser a primeira vez que apanha.' },
  capanga_elite: { id: 'capanga_elite', nome: 'Cobrador de Elite', hp: 45, atk: 6, def: 3, desc: 'Terno caro. Soco pesado. Não está aqui por dinheiro — está por lealdade.' },
  ferreiro_brigao: { id: 'ferreiro_brigao', nome: 'O Ferreiro', hp: 25, atk: 5, def: 1, desc: 'Mãos que amassam ferro. Você não quer estar no lugar do ferro.' },
  enfermeira_assassina: { id: 'enfermeira_assassina', nome: 'A Enfermeira', hp: 22, atk: 3, def: 3, desc: 'Sabe exatamente onde dói mais.' },
  kim_final: { id: 'kim_final', nome: 'Kim', hp: 60, atk: 8, def: 5, desc: 'O dono do bar. O cérebro. O fim de tudo.' },
}

export function getInimigo(id) {
  return INIMIGOS[id] || { id, nome: 'Desconhecido', hp: 15, atk: 2, def: 0, desc: 'Um inimigo desconhecido.' }
}
