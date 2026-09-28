import { useCallback, useEffect, useRef, useState } from 'react'
import { useGanguesAutoLembrado, chaveDoSave } from './useGanguesVelocidadeAuto.js'
import { cicloDoPinoMs, farolDe } from '../components/cena/GanguesCenaAtores.jsx'

/* ══════════════════════════════════════════════════════════════
   BRIGA AUTOMÁTICA na cena (pedido do Isaias, 27/09/2026)
   Switch no meio dos controles (entre o analógico e o botão de interagir).
   Ligado: encostou num oponente de BRIGA → entra direto na luta, sem o
   "interagir" e sem o "bora pro pau" da carta. Nada do fluxo manual some —
   desligado, tudo funciona como antes.

   Quem entra sozinho (switch ligado = o jogador quer BRIGA, não as outras
   opções — Isaias, 27/09/2026):
   • POI `treta` (rua, dungeon, depósito, chefe). A Rinha de Apostas entra
     sem apostar (a opção "Nada").
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

   ANTI-LOOP ("ignora esse personagem só nessa primeira colisão, até
   descolidir"): voltar de uma luta te devolve colado no mesmo adversário —
   sem trava, entraria em luta de novo na hora, pra sempre, e o jogador nem
   conseguiria alcançar o switch. Então todo oponente que já disparou (ou
   foi barrado por uma trava — rep, dívida, informante, tropa no chão), o
   adversário da última luta, e quem já estava encostado na hora de ligar o
   switch ficam IGNORADOS até a colisão com eles acabar. Separou → vale de
   novo: dá pra ficar parado esperando o bicho voltar a encostar.
   Ou até quem anda COMPLETAR UMA VOLTA do caminho dele (v3.69.1 — Isaias,
   parado no meio da patrulha: "ele completou o caminho mais de duas vezes...
   o usuário está em cima dele esperando batalhar"): quem fica em cima do
   caminho quer briga, então passou uma volta inteira desde que entrou na
   lista, vale de novo mesmo sem nunca ter descolado.
   Enquanto ignorado, o personagem que ANDA não para ao encostar (a pausa
   normal existe pra deixar o jogador interagir) — atravessa, termina o
   caminho dele e, na próxima passada, encosta de novo e aí sim é briga.
   Por isso o hook publica `ignorados` pra cena (PinoAlvo, prop `ignorado`).
   Separar = ficar SEM encostar por SEPARACAO_MS seguidos, não um piscar:
   a colisão é medida na tela a cada 150ms e pisca na borda (a animação
   parada do personagem mexe o círculo dele) — uma leitura "soltou" só já
   liberava o adversário e a luta voltava no quadro seguinte (o loop, pego
   no teste do ciclo completo: luta → vitória → volta → luta de novo em
   ~1s). Cada item: `visto` = já vimos ele encostado depois de entrar na
   lista (o adversário da última luta pode levar um passo pra encostar de
   novo, porque o passeio dele reinicia quando a tela volta); `soltoDesde`
   = desde quando está sem encostar; `desde` = quando entrou na lista.
   ══════════════════════════════════════════════════════════════ */

const GANGUES_BRIGA_AUTO_CHAVE = 'ldi-gangues-briga-auto'
// Os automáticos lembrados (useGanguesAutoLembrado): briga automática da
// cena + automático do combate normal e da Multidão (GanguesCombat.jsx).
const GANGUES_AUTOMATICOS = [GANGUES_BRIGA_AUTO_CHAVE, 'ldi-gangues-auto', 'ldi-gangues-auto-multidao']

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
const ANUNCIO_MS = 2500
const ANUNCIO_FRASES = 8

export default function useGanguesBrigaAutomatica({ alvos, colidindo, rodando, bloqueado, ultimoPoiId, onBriga }) {
  const [ligado, setLigado] = useGanguesAutoLembrado(GANGUES_BRIGA_AUTO_CHAVE)
  const ignorados = useRef(new Map(ultimoPoiId ? [[ultimoPoiId, { visto: false, soltoDesde: null, desde: Date.now() }]] : []))
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
        const ciclo = alvo && cicloDoPinoMs(alvo)
        if (ciclo && agora - info.desde >= ciclo) { ignorados.current.delete(poiId); continue }
        if (alvo && colide(alvo)) { info.visto = true; info.soltoDesde = null; continue }
        if (!alvo) { if (lista.length) ignorados.current.delete(poiId); continue }
        if (!info.visto) continue
        info.soltoDesde ??= agora
        if (agora - info.soltoDesde >= SEPARACAO_MS) ignorados.current.delete(poiId)
      }
      publicar()
      if (!on || !ativo || anunciando.current) return
      const alvo = lista.find(a => entraSozinho(a) && !ignorados.current.has(a.id) && colide(a))
      if (!alvo) return
      ignorados.current.set(alvo.id, { visto: true, soltoDesde: null, desde: agora })
      publicar()
      brigar(alvo, brigaDoAlvo(alvo))
    }, VIGIA_MS)
    return () => clearInterval(id)
  }, [publicar])

  const alternar = useCallback(() => {
    // Ligando: quem já está encostado agora não dispara de surpresa — só
    // depois de separar e encostar de novo.
    if (!ligado) for (const a of alvos) if (entraSozinho(a) && colidindo(a)) ignorados.current.set(a.id, { visto: true, soltoDesde: null, desde: Date.now() })
    publicar()
    setLigado(!ligado)
  }, [ligado, alvos, colidindo, setLigado, publicar])

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

export function useGanguesAvancoAutomatico({ ativo, ms, acao }) {
  const [ligado] = useGanguesAutoLembrado(GANGUES_BRIGA_AUTO_CHAVE)
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
