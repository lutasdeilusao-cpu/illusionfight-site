import { useCallback, useEffect, useRef, useState } from 'react'
import { useGanguesAutoLembrado, chaveDoSave } from './useGanguesVelocidadeAuto.js'
import { farolDe } from '../components/cena/GanguesCenaAtores.jsx'

/* ══════════════════════════════════════════════════════════════
   BRIGA AUTOMÁTICA na cena (pedido do Isaias, 27/09/2026)
   Switch no meio dos controles (entre o analógico e o botão de interagir).
   Ligado: encostou num oponente de BRIGA → entra direto na luta, sem o
   "interagir" e sem o "bora pro pau" da carta. Nada do fluxo manual some —
   desligado, tudo funciona como antes.

   Quem entra sozinho (switch ligado = o jogador quer BRIGA, não as outras
   opções — Isaias, 27/09/2026):
   • POI `treta` (rua, dungeon, depósito). A Rinha infinita NÃO — ela é
     escolha do jogador, só no toque (senão quem só anda fica preso nela).
   • papo com uma escolha que vira briga (o pivete do sinal, o contador do
     galpão, o Boleto Vencido): o switch escolhe a briga sozinho, pelo mesmo
     caminho do clique manual (inclusive o −1 de rep do "aperta").
   Fica de fora: puzzle/corre (`parada`/`corre`) — a briga ali só vem se o
   jogador ERRAR o puzzle, não é uma escolha.
   Também de fora (v3.72.0 — "pro cara ter um pouco de interação, senão ele
   larga o jogo"): personagem VERMELHO (obrigatório ainda não feito — o
   jogador tem que clicar), o CHEFE, e tudo na ÁREA DO CHEFE (`bloqueado`,
   ver naAreaDoChefe em cenaHelpers.js — o switch fica apagado lá). E
   perder uma luta DESLIGA todo automático (desligarAutomaticos, chamado
   pela derrota da cena e pelo farm ausente).

   ENCOSTOU, ENTROU (Isaias, 30/09/2026: "o cara passa uma, duas, três
   vezes em você e aí finalmente triga a briga... a ideia é encostou, entrou
   na briga"). Antes o adversário da última luta, quem já estava encostado ao
   ligar o switch e quem foi barrado ficavam numa lista de IGNORADOS até
   descolar ou até dar uma volta inteira no caminho — por isso a briga
   demorava várias passadas. Hoje a lista existe só pra briga BARRADA por
   trava (rep, dívida, informante, tropa no chão), senão o aviso da trava
   repetiria a cada 150ms: fica ignorado até ficar SEPARACAO_MS sem encostar.
   LUTA CONTINUADA (Isaias, 30/09/2026, 2º relato): voltar da luta em cima
   do adversário e brigar DE NOVO é o farm — é de propósito, não um bug. Quem
   ANDA volta na ponta do caminho mais longe do jogador (faseLongeDe, em
   GanguesCenaAtores.jsx) e vem buscar ele sozinho em poucos segundos; em
   cima de quem é PARADO, emenda direto. Pra parar, o switch "briga de rua"
   também existe DENTRO da luta (GanguesCombat.jsx, useBrigaDeRua): desligou
   lá, a volta pra rua não dispara nada. (Afastar o jogador do adversário na
   volta foi tentado e desfeito no mesmo dia — matava o farm em cima de quem
   é parado.)
   ══════════════════════════════════════════════════════════════ */

const GANGUES_BRIGA_AUTO_CHAVE = 'ldi-gangues-briga-auto'
// Os automáticos lembrados (useGanguesAutoLembrado): briga automática da
// cena + automático do combate normal e da Multidão (GanguesCombat.jsx).
const GANGUES_AUTOMATICOS = [GANGUES_BRIGA_AUTO_CHAVE, 'ldi-gangues-auto', 'ldi-gangues-auto-multidao']

/** O switch da briga de rua, lido/gravado de qualquer tela (a luta usa pra
 *  deixar o jogador desligar sem voltar pra rua — ver o cabeçalho). */
export const useBrigaDeRua = () => useGanguesAutoLembrado(GANGUES_BRIGA_AUTO_CHAVE)

export function brigaAutoLigada() {
  try { return localStorage.getItem(chaveDoSave(GANGUES_BRIGA_AUTO_CHAVE)) === '1' } catch { return false }
}
/** Perdeu → desliga TUDO (Isaias, 28/09/2026: "reseta, desliga o
 *  automático, desliga tudo, faz ele começar de novo"). As telas leem a
 *  chave ao montar, então a próxima cena/luta já nasce desligada. */
export function desligarAutomaticos() {
  try { GANGUES_AUTOMATICOS.forEach(k => localStorage.setItem(chaveDoSave(k), '0')) } catch { /* sem storage: nada lembrado */ }
}

// Como a briga começa sozinha nesse alvo: opções pro iniciarTreta da cena,
// ou null se ele não é de briga automática.
function brigaDoAlvo(alvo) {
  if (!alvo || alvo.ehPorta || alvo.ehSaida || alvo.ehVolta || alvo.ehPassagem || alvo.ehChefe) return null
  if (farolDe(alvo) === 'is-obrigatorio') return null
  // A Rinha (luta infinita) é escolha do jogador, só no toque — senão quem
  // só anda pela rua fica preso num farm sem fim.
  if (alvo.rinhaInfinita) return null
  if (alvo.estado !== 'disponivel' && !alvo.repetivel) return null
  if (alvo.tipo === 'treta') return { aposta: 0 }
  const briga = alvo.tipo === 'papo' && (alvo.escolhas || []).find(e => e.viraTreta)
  return briga ? { viraTreta: briga.viraTreta, revela: briga.revela } : null
}
const entraSozinho = alvo => Boolean(brigaDoAlvo(alvo))

// `colidindo(alvo)` — a mesma regra do botão de interagir (colisão real pra
// personagem que anda, zona fixa pra pino parado). `ultimoPoiId` — o
// adversário da última luta (storyTarget.cenaPoiId). `rodando` — falso com
// qualquer coisa aberta por cima da cena (diálogo, modal, ficha, bolsa...).
const SEPARACAO_MS = 700
const VIGIA_MS = 150
// Aviso antes da luta (v3.70.0 — Isaias: "tá tão automático... falta o cara
// ter uma noção de que tá entrando numa briga"): encostou, sobe um pop-up
// com uma frase de rua por ANUNCIO_MS e só depois a luta abre. A cena só
// chama `anunciar(continuar)` depois das travas (rep, dívida, tropa no chão)
// — o aviso nunca promete uma briga que vai ser barrada.
const ANUNCIO_MS = 1200
const ANUNCIO_FRASES = 8

export default function useGanguesBrigaAutomatica({ alvos, colidindo, rodando, bloqueado, onBriga }) {
  const [ligado, setLigado] = useGanguesAutoLembrado(GANGUES_BRIGA_AUTO_CHAVE)
  // Só quem foi BARRADO por trava (ver o cabeçalho): se a luta abriu, a cena
  // desmonta e a lista vai junto.
  const ignorados = useRef(new Map())
  // Cópia em estado (só os ids) pra cena saber quem não deve pausar.
  const [ignoradosIds, setIgnoradosIds] = useState(() => new Set(ignorados.current.keys()))
  const publicar = useCallback(() => {
    setIgnoradosIds(prev => {
      const ids = [...ignorados.current.keys()]
      return ids.length === prev.size && ids.every(id => prev.has(id)) ? prev : new Set(ids)
    })
  }, [])
  // O vigia roda num intervalo (não só quando algo muda): a separação
  // precisa ser confirmada pelo TEMPO, mesmo sem nenhum render novo.
  const [anuncio, setAnuncio] = useState(null)
  const anunciando = useRef(false)
  const atual = useRef({})
  atual.current = { alvos, colidindo, rodando: rodando && !bloqueado, ligado, onBriga }

  useEffect(() => {
    const id = setInterval(() => {
      const { alvos: lista, colidindo: colide, rodando: ativo, ligado: on, onBriga: brigar } = atual.current
      const agora = Date.now()
      for (const [poiId, info] of ignorados.current) {
        const alvo = lista.find(a => a.id === poiId)
        if (!alvo) { if (lista.length) ignorados.current.delete(poiId); continue }
        if (colide(alvo)) { info.soltoDesde = null; continue }
        info.soltoDesde ??= agora
        if (agora - info.soltoDesde >= SEPARACAO_MS) ignorados.current.delete(poiId)
      }
      publicar()
      if (!on || !ativo || anunciando.current) return
      const alvo = lista.find(a => entraSozinho(a) && !ignorados.current.has(a.id) && colide(a))
      if (!alvo) return
      ignorados.current.set(alvo.id, { soltoDesde: null })
      publicar()
      brigar(alvo, brigaDoAlvo(alvo))
    }, VIGIA_MS)
    return () => clearInterval(id)
  }, [publicar])

  const alternar = useCallback(() => setLigado(!ligado), [ligado, setLigado])

  const anunciar = useCallback((continuar) => {
    anunciando.current = true
    setAnuncio({ frase: Math.floor(Math.random() * ANUNCIO_FRASES) })
    setTimeout(() => { anunciando.current = false; setAnuncio(null); continuar() }, ANUNCIO_MS)
  }, [])

  return { ligado, alternar, bloqueado: Boolean(bloqueado), ignorados: ignoradosIds, anuncio, anunciar }
}

/* Saída automática do pós-luta (pedido do Isaias, 27/09/2026): quem liga a
   briga automática quer upar — "entrar e sair de batalha". Com o switch
   ligado e a luta vinda da cena, as telas depois da luta se clicam sozinhas:
   o "NÓIS É CRIA" (botão de próximo) em 2s e o relatório ("Segue na
   quebrada") em 3s — no máximo 5s até voltar pra rua. Só na VITÓRIA: a
   derrota desliga os automáticos e espera o clique (v3.72.0).
   Clique manual continua valendo (e qualquer toque na tela reinicia a
   contagem, pra não arrancar o jogador que parou pra ler). */
export const GANGUES_AVANCO_AUTO_MS = { resultado: 2000, relatorio: 3000 }

// `forcar`: avança mesmo com a briga automática desligada (a Rinha infinita
// emenda uma luta na outra sozinha — é o que ela é).
export function useGanguesAvancoAutomatico({ ativo, ms, acao, forcar = false }) {
  const [salvo] = useGanguesAutoLembrado(GANGUES_BRIGA_AUTO_CHAVE)
  const ligado = salvo || forcar
  const acaoRef = useRef(acao)
  acaoRef.current = acao
  useEffect(() => {
    if (!ligado || !ativo) return
    let timer
    const armar = () => { clearTimeout(timer); timer = setTimeout(() => acaoRef.current(), ms) }
    armar()
    window.addEventListener('pointerdown', armar)
    return () => { clearTimeout(timer); window.removeEventListener('pointerdown', armar) }
  }, [ligado, ativo, ms])
}
