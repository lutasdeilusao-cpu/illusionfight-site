import { useCallback, useEffect, useRef } from 'react'
import { useGanguesAutoLembrado } from './useGanguesVelocidadeAuto.js'

/* ══════════════════════════════════════════════════════════════
   BRIGA AUTOMÁTICA na cena (pedido do Isaias, 27/09/2026)
   Switch no meio dos controles (entre o analógico e o botão de interagir).
   Ligado: encostou num oponente de BRIGA → entra direto na luta, sem o
   "interagir" e sem o "bora pro pau" da carta. Nada do fluxo manual some —
   desligado, tudo funciona como antes.

   Quem entra sozinho: só POI `treta` pura (rua, dungeon, depósito, chefe).
   Fica de fora quem pede decisão antes: puzzle/corre/papo (mesmo os que
   viram treta se errar) e a Rinha de Apostas (`aposta` — escolher o valor).

   ANTI-LOOP ("ignora esse personagem só nessa primeira colisão, até
   descolidir"): voltar de uma luta te devolve colado no mesmo adversário —
   sem trava, entraria em luta de novo na hora, pra sempre, e o jogador nem
   conseguiria alcançar o switch. Então todo oponente que já disparou (ou
   foi barrado por uma trava — rep, dívida, informante, tropa no chão), o
   adversário da última luta, e quem já estava encostado na hora de ligar o
   switch ficam IGNORADOS até a colisão com eles acabar. Separou → vale de
   novo: dá pra ficar parado esperando o bicho voltar a encostar.
   Separar = ficar SEM encostar por SEPARACAO_MS seguidos, não um piscar:
   a colisão é medida na tela a cada 150ms e pisca na borda (a animação
   parada do personagem mexe o círculo dele) — uma leitura "soltou" só já
   liberava o adversário e a luta voltava no quadro seguinte (o loop, pego
   no teste do ciclo completo: luta → vitória → volta → luta de novo em
   ~1s). Cada item: `visto` = já vimos ele encostado depois de entrar na
   lista (o adversário da última luta pode levar um passo pra encostar de
   novo, porque o passeio dele reinicia quando a tela volta); `soltoDesde`
   = desde quando está sem encostar.
   ══════════════════════════════════════════════════════════════ */

const GANGUES_BRIGA_AUTO_CHAVE = 'ldi-gangues-briga-auto'

function entraSozinho(alvo) {
  if (!alvo || alvo.tipo !== 'treta' || alvo.aposta) return false
  if (alvo.ehPorta || alvo.ehSaida || alvo.ehVolta || alvo.ehPassagem) return false
  return alvo.estado === 'disponivel' || Boolean(alvo.repetivel)
}

// `colidindo(alvo)` — a mesma regra do botão de interagir (colisão real pra
// personagem que anda, zona fixa pra pino parado). `ultimoPoiId` — o
// adversário da última luta (storyTarget.cenaPoiId). `rodando` — falso com
// qualquer coisa aberta por cima da cena (diálogo, modal, ficha, bolsa...).
const SEPARACAO_MS = 700
const VIGIA_MS = 150

export default function useGanguesBrigaAutomatica({ alvos, colidindo, rodando, ultimoPoiId, onBriga }) {
  const [ligado, setLigado] = useGanguesAutoLembrado(GANGUES_BRIGA_AUTO_CHAVE)
  const ignorados = useRef(new Map(ultimoPoiId ? [[ultimoPoiId, { visto: false, soltoDesde: null }]] : []))
  // O vigia roda num intervalo (não só quando algo muda): a separação
  // precisa ser confirmada pelo TEMPO, mesmo sem nenhum render novo.
  const atual = useRef({})
  atual.current = { alvos, colidindo, rodando, ligado, onBriga }

  useEffect(() => {
    const id = setInterval(() => {
      const { alvos: lista, colidindo: colide, rodando: ativo, ligado: on, onBriga: brigar } = atual.current
      const agora = Date.now()
      for (const [poiId, info] of ignorados.current) {
        const alvo = lista.find(a => a.id === poiId)
        if (alvo && colide(alvo)) { info.visto = true; info.soltoDesde = null; continue }
        if (!alvo) { if (lista.length) ignorados.current.delete(poiId); continue }
        if (!info.visto) continue
        info.soltoDesde ??= agora
        if (agora - info.soltoDesde >= SEPARACAO_MS) ignorados.current.delete(poiId)
      }
      if (!on || !ativo) return
      const alvo = lista.find(a => entraSozinho(a) && !ignorados.current.has(a.id) && colide(a))
      if (!alvo) return
      ignorados.current.set(alvo.id, { visto: true, soltoDesde: null })
      brigar(alvo)
    }, VIGIA_MS)
    return () => clearInterval(id)
  }, [])

  const alternar = useCallback(() => {
    // Ligando: quem já está encostado agora não dispara de surpresa — só
    // depois de separar e encostar de novo.
    if (!ligado) for (const a of alvos) if (entraSozinho(a) && colidindo(a)) ignorados.current.set(a.id, { visto: true, soltoDesde: null })
    setLigado(!ligado)
  }, [ligado, alvos, colidindo, setLigado])

  return { ligado, alternar }
}
