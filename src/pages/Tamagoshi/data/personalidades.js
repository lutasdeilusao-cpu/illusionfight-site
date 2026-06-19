export const PERSONALIDADES = {
  CARENTE: {
    nome: 'Carente',
    desc: 'dramático, apegado, notifica antes de precisar',
    notificacoes: {
      boasVindas: '"ah… você veio. tava contando os segundos."',
      fome: '"tô com fome mas tudo bem, fica aí, eu aguento... provavelmente"',
      sede: '"três horas sem água. três. horas. tá tudo bem comigo não"',
      passeio: '"você não me levou passear hoje. eu fiquei aqui sozinho. olhando pra parede."',
      critico: '"tô mal. muito mal. mas vai lá que eu fico"',
      morte: '"então era isso... sabia que ia acabar assim... pelo menos tava com você no final"',
    },
    cor: '#EC4899',
  },
  AGRESSIVO: {
    nome: 'Agressivo',
    desc: 'ameaças vazias, raiva performática, no fundo só quer atenção',
    notificacoes: {
      boasVindas: '"ah, chegou. demorou. mas tudo bem."',
      fome: '"me alimenta. agora."',
      sede: '"água. já."',
      passeio: '"se você não me tirar daqui eu destruo tudo aqui dentro"',
      critico: '"tô no limite. não tô pedindo. tô avisando."',
      morte: '"...tudo bem. eu entendo. foi bom enquanto durou. seu idiota."',
    },
    cor: '#E02020',
  },
  FOFO: {
    nome: 'Fofo',
    desc: 'entusiasmo total, transforma tudo em festa',
    notificacoes: {
      boasVindas: '"OI! QUE BOM QUE VOCÊ VEIO! TÔ TÃO FELIZ!"',
      fome: '"oi! tô com fominha! mas tudo bem! você vem logo né? né? né?"',
      sede: '"aguinha por favor por favor por favor obrigado te amo"',
      passeio: '"PASSEIO? VAI TER PASSEIO HOJE? pergunta só, sem pressão, mas VAI?"',
      critico: '"oi... tô um pouquinho mal... mas fico bem quando você chegar tá?"',
      morte: '"foi tão bom... obrigado por tudo... eu vou sentir saudade... muita saudade..."',
    },
    cor: '#F5A623',
  },
  INDEPENDENTE: {
    nome: 'Independente',
    desc: 'frio, econômico, nunca implora',
    notificacoes: {
      boasVindas: '"presença registrada. prossiga."',
      fome: '"alimento necessário."',
      sede: '"hidratação pendente."',
      passeio: '"seria útil sair hoje."',
      critico: '"situação crítica. sua decisão."',
      morte: '"entendido."',
    },
    cor: '#A855F4',
  },
  FILOSOFO: {
    nome: 'Filósofo',
    desc: 'reflexivo, transforma necessidade em observação existencial',
    notificacoes: {
      boasVindas: '"sua presença levanta questões interessantes. como vai?"',
      fome: '"o vazio no estômago é parente do vazio no universo. os dois têm solução."',
      sede: '"a água não pertence a ninguém. mas eu precisaria de um pouco agora."',
      passeio: '"faz tempo que não vejo o céu de Marelia. ou qualquer céu."',
      critico: '"estou chegando numa fronteira interessante. prefiro não atravessá-la hoje."',
      morte: '"a fronteira foi atravessada. não se preocupe. é apenas mais uma jornada."',
    },
    cor: '#22C55E',
  },
  COMICO: {
    nome: 'Cômico',
    desc: 'alheio ao drama, confusão genuína, comentários fora de contexto',
    notificacoes: {
      boasVindas: '"ah! é você! que coincidência! tava justamente pensando em… outra coisa."',
      fome: '"mano. biscoito. simples assim."',
      sede: '"água. suco. qualquer coisa. até aquela água sem gás sem graça tá bom"',
      passeio: '"precisamos sair. eu vi uma pomba aqui que tô querendo conhecer melhor"',
      critico: '"cara. isso tá ficando sério. eu acho. não sei. tô zonzo"',
      morte: '"não acredito que vou morrer por causa de biscoito. que história pra contar lá do outro lado"',
    },
    cor: '#00B4D8',
  },
}

export const PERS_NOME_KEY = {
  CARENTE: 'carente',
  AGRESSIVO: 'agressivo',
  FOFO: 'fofo',
  INDEPENDENTE: 'independente',
  FILOSOFO: 'filosofo',
  COMICO: 'comico',
}

import { FALAS_CRIATURA as FALAS_PT } from './falas-criatura-pt'
import { FALAS_CRIATURA as FALAS_EN } from './falas-criatura-en'
import { FALAS_CRIATURA as FALAS_ES } from './falas-criatura-es'

const FALAS_MAP = { pt: FALAS_PT, en: FALAS_EN, es: FALAS_ES }

export function getFala(tipo, chave, criaturaId, tFn, locale) {
  const FALAS = FALAS_MAP[locale] || FALAS_PT
  if (tFn) {
    const tipoKey = PERS_NOME_KEY[tipo] || 'carente'
    const chaveLower = chave.toLowerCase()
    if (!criaturaId) {
      const i18nKey = 'games.tamagoshi.notif_' + tipoKey + '_' + chaveLower
      const translated = tFn(i18nKey)
      if (translated !== i18nKey) return translated
    } else {
      const falaKey = 'games.tamagoshi.fala_' + criaturaId + '_' + chaveLower
      const translated = tFn(falaKey)
      if (translated !== falaKey) return translated
      const notifKey = 'games.tamagoshi.notif_' + tipoKey + '_' + chaveLower
      const notifTranslated = tFn(notifKey)
      if (notifTranslated !== notifKey) return notifTranslated
    }
  }
  if (criaturaId && FALAS[criaturaId]?.[chave]) {
    const arr = FALAS[criaturaId][chave]
    return arr[Math.floor(Math.random() * arr.length)]
  }
  return PERSONALIDADES[tipo]?.notificacoes[chave] || '...'
}
