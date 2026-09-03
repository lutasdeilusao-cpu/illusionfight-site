/* ══════════════════════════════════════════════════════════════
   i18n — carregamento por idioma e por área

   Antes os três idiomas inteiros entravam no bundle (~356K) para
   servir um. Agora o visitante baixa só o núcleo do idioma dele
   (~50K) e as áreas pesadas chegam quando ele entra nelas.

   • core      → navegação, home, histórias, conta, loja. Sempre.
   • games     → strings de dentro dos jogos (inclui pp e toptrumps).
   • prototype → laboratório.

   Gangues continua à parte, em gangues-<lang>.json, carregado por
   useGanguesI18n() — é grande e só interessa a quem abre o jogo.
   ══════════════════════════════════════════════════════════════ */

const CORE = {
  pt: () => import('./core/pt.json'),
  es: () => import('./core/es.json'),
  en: () => import('./core/en.json'),
}

const AREAS = {
  games: {
    pt: () => import('./games/pt.json'),
    es: () => import('./games/es.json'),
    en: () => import('./games/en.json'),
  },
  prototype: {
    pt: () => import('./prototype/pt.json'),
    es: () => import('./prototype/es.json'),
    en: () => import('./prototype/en.json'),
  },
}

export const LOCALES_DISPONIVEIS = Object.keys(CORE)

/** Núcleo do idioma. Resolve para 'pt' se pedirem um idioma que não existe. */
export async function carregarCore(locale) {
  const load = CORE[locale] || CORE.pt
  return (await load()).default
}

/** Área sob demanda. Devolve null quando a área/idioma não existe. */
export async function carregarArea(area, locale) {
  const porIdioma = AREAS[area]
  if (!porIdioma) return null
  const load = porIdioma[locale] || porIdioma.pt
  return (await load()).default
}

/** Qual área a rota atual precisa — null quando o núcleo já basta.
 *  O catálogo /games usa site.games.*, que mora no núcleo; só as
 *  telas de dentro (/games/algum-jogo) precisam do pedaço pesado. */
export function areaDaRota(pathname) {
  if (/^\/games\/./.test(pathname)) return 'games'
  if (pathname.startsWith('/lab')) return 'prototype'
  return null
}

export const LOCALE_LABELS = {
  pt: 'PT',
  es: 'ES',
  en: 'EN',
}
