/**
 * Inimigos — i18n
 * Cada inimigo possui nome e desc traduzidos para pt, en, es.
 */

export const INIMIGOS_I18N = {
  capanga_terno_01: {
    id: 'capanga_terno_01', hp: 20, atk: 3, def: 1,
    nome: { pt: 'Capanga do Terno', en: 'Suit Thug', es: 'Matón de Traje' },
    desc: { pt: 'Um capanga qualquer. Segue ordens. Não faz perguntas.', en: 'Just a thug. Follows orders. No questions.', es: 'Un matón cualquiera. Sigue órdenes. No hace preguntas.' },
  },
  capanga_terno_02: {
    id: 'capanga_terno_02', hp: 30, atk: 4, def: 2,
    nome: { pt: 'Capanga do Terno (veterano)', en: 'Suit Thug (veteran)', es: 'Matón de Traje (veterano)' },
    desc: { pt: 'Experiente. Já fez isso antes. Não vai ser a primeira vez que apanha.', en: 'Experienced. Done this before. Won\'t be the first time he gets hit.', es: 'Experto. Ya lo hizo antes. No será la primera vez que le peguen.' },
  },
  capanga_elite: {
    id: 'capanga_elite', hp: 45, atk: 6, def: 3,
    nome: { pt: 'Cobrador de Elite', en: 'Elite Enforcer', es: 'Cobrador de Élite' },
    desc: { pt: 'Terno caro. Soco pesado. Não está aqui por dinheiro — está por lealdade.', en: 'Expensive suit. Heavy punch. Not here for money — here out of loyalty.', es: 'Traje caro. Puñetazo fuerte. No está aquí por dinero — está por lealtad.' },
  },
  ferreiro_brigao: {
    id: 'ferreiro_brigao', hp: 25, atk: 5, def: 1,
    nome: { pt: 'O Ferreiro', en: 'The Blacksmith', es: 'El Herrero' },
    desc: { pt: 'Mãos que amassam ferro. Você não quer estar no lugar do ferro.', en: 'Hands that shape iron. You don\'t want to be in the iron\'s place.', es: 'Manos que amasan hierro. No quieres estar en el lugar del hierro.' },
  },
  enfermeira_assassina: {
    id: 'enfermeira_assassina', hp: 22, atk: 3, def: 3,
    nome: { pt: 'A Enfermeira', en: 'The Nurse', es: 'La Enfermera' },
    desc: { pt: 'Sabe exatamente onde dói mais.', en: 'Knows exactly where it hurts most.', es: 'Sabe exactamente dónde duele más.' },
  },
  kim_final: {
    id: 'kim_final', hp: 60, atk: 8, def: 5,
    nome: { pt: 'Kim', en: 'Kim', es: 'Kim' },
    desc: { pt: 'O dono do bar. O cérebro. O fim de tudo.', en: 'The bar owner. The brain. The end of everything.', es: 'El dueño del bar. El cerebro. El fin de todo.' },
  },
}

export function getInimigo(id, locale = 'pt') {
  const e = INIMIGOS_I18N[id]
  if (!e) return { id, nome: locale === 'en' ? 'Unknown' : locale === 'es' ? 'Desconocido' : 'Desconhecido', hp: 15, atk: 2, def: 0, desc: locale === 'en' ? 'An unknown enemy.' : locale === 'es' ? 'Un enemigo desconocido.' : 'Um inimigo desconhecido.' }
  return { ...e, nome: e.nome[locale] || e.nome.pt, desc: e.desc[locale] || e.desc.pt }
}
