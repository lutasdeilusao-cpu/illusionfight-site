import { useLanguage } from '../../../../../context/LanguageContext'
import { collidersDaCena, predioEhSolido, MURO_GATE_Y1, MURO_GATE_Y2 } from '../../engine/ganguesCenaMotor.js'

/* ══════════════════════════════════════════════════════════════
   CENÁRIO DA CENA — desenho puro (sem lógica de jogo).
   Recebe os dados da cena (quarteirões, prédios, obstáculos, cenário,
   fiação) e monta o mundo em CSS: rua de periferia, favela de verdade,
   praça, empecilhos. A colisão é derivada em GanguesCena a partir de
   `quarteiroes` + `obstaculos.solido` — aqui é só a arte.
   ══════════════════════════════════════════════════════════════ */

// Ativa/desliga o overlay de debug e GRAVA em localStorage. Existiu antes só
// via `?debugmapa=1` na URL — o Isaias reportou (15/09/2026) que no celular
// dele NÃO TEM COMO digitar isso (sem barra de endereço acessível de onde
// ele joga), então a query string sozinha nunca ia funcionar por mais que
// persistisse depois de ligada — o problema não era persistência, era não
// ter NENHUMA forma de ligar pela primeira vez. Fix real: botão de verdade
// no HUD da cena (🧱, GanguesCena.jsx), que chama `alternarDebugMapa()`
// direto — a URL continua funcionando como atalho extra (útil pra mim
// testar via Playwright), mas não é mais o único jeito. Fail-safe: erro de
// leitura/escrita de localStorage (modo privado etc.) nunca trava a tela.
const DEBUG_MAPA_KEY = 'ldi-gangues-debugmapa'
export function isDebugMapaAtivo() {
  if (typeof window === 'undefined') return false
  const q = new URLSearchParams(window.location.search).get('debugmapa')
  try {
    if (q === '1') { window.localStorage.setItem(DEBUG_MAPA_KEY, '1'); return true }
    if (q === '0') { window.localStorage.removeItem(DEBUG_MAPA_KEY); return false }
    return window.localStorage.getItem(DEBUG_MAPA_KEY) === '1'
  } catch { return q === '1' }
}
export function alternarDebugMapa() {
  const ligado = !isDebugMapaAtivo()
  try {
    if (ligado) window.localStorage.setItem(DEBUG_MAPA_KEY, '1')
    else window.localStorage.removeItem(DEBUG_MAPA_KEY)
  } catch { /* modo privado etc. — segue só em memória via o estado do componente */ }
  return ligado
}

// ── Rua asfaltada (o traçado fixo da Pista) ──
function Ruas() {
  return (
    <>
      <div className="gang-road road-main" />
      <div className="gang-road road-cross r1" />
      <div className="gang-road road-cross r2" />
      <div className="gang-road road-cross r3" />
      <div className="gang-road road-cross r4" />
      <div className="gang-road road-cross r5" />
      <div className="gang-road road-branch left" />
      <div className="gang-road road-branch right" />
    </>
  )
}

function Predio({ p, bossAberto, t }) {
  if (p.pos_portao && !bossAberto) return null
  const style = {
    left: p.x, top: p.y, width: p.w, height: p.h,
    '--predio-cor': p.cor || '#7d7468',
    '--andares': p.andares || 1,
  }
  return (
    <div className={`gang-predio gang-predio--${p.tipo}${p.pos_portao ? ' is-pos-portao' : ''}`} style={style} aria-hidden="true">
      <div className="gang-predio-corpo" />
      <div className="gang-predio-teto" />
      {p.toldo && <i className="gang-predio-toldo" />}
      {p.portao_aco && <i className="gang-predio-portao-aco" />}
      {(p.porta || p.tipo === 'galpao') && (
        <i
          className="gang-predio-porta"
          style={p.portaX != null ? { left: p.portaX - p.x, width: p.portaW || 60 } : undefined}
        />
      )}
      {p.luz && <i className="gang-predio-luz" />}
      {p.varal && <i className="gang-predio-varal" />}
      {p.pich && <b className="gang-predio-pich">RATO<br />DE PISTA</b>}
      {p.nome && <small className="gang-predio-nome">{t(p.nome)}</small>}
    </div>
  )
}

// ── Overlay de debug (botão 🧱, GanguesCena.jsx) ──────────────────
// Desenha por cima da ilustração de fundo: os colisores DE VERDADE
// (vermelho — literalmente `collidersDaCena(cena, bossAberto)`, a MESMA
// função que `hitsSolid`/`stepPlayer` usam pra travar o jogador; não é uma
// reconstrução aproximada a partir de `quarteiroes`/`predios` cruzada na
// mão), os prédios que existem no dado mas NÃO colidem agora (contorno
// cinza tracejado — sem `solo`, ou porta `pos_portao` já aberta pelo chefe;
// mostrados só de referência, pra não confundir com colisor de verdade),
// POIs (ponto amarelo) e zonas de entrada (contorno verde).
//
// Achado real, 15/09/2026 (Isaias: "eu quero todos [os colisores], não só
// os que você selecionou"): a 1ª versão desenhava `cena.quarteiroes` +
// TODOS os `cena.predios` à mão — cobria os quarteirões certinho, mas (a)
// desenhava prédio decorativo sem `solo` como se colidisse, e (b) nunca
// desenhava os colisores vindos de `obstaculos.solido` (via `obstRect`,
// ganguesCenaMotor.js) — vazios pra Pista hoje (a ilustração de fundo já
// desenha entulho/obstáculo, não duplica em CSS), mas se algum território
// futuro voltar a usar obstáculo sólido, essa versão antiga mentiria pro
// Isaias mostrando MENOS do que trava de verdade. Corrigido puxando a
// função de colisão real em vez de reconstruir o dado igual a ela — não
// tem como esse overlay ficar incompleto de novo sem o motor de colisão
// mudar junto.
function DebugColisores({ cena, bossAberto, muroAberto, larguraMundo }) {
  const colisoresReais = collidersDaCena(cena, bossAberto)
  const prediosNaoSolidos = (cena.predios || []).filter(p => !predioEhSolido(p, bossAberto))
  return (
    <>
      {/* TESTE: colisão por imagem (16/09/2026) — a própria máscara (branco=
          andável, preto=sólido) desenhada por cima em transparência, mais
          uma linha marcando onde ela passa a valer (`colisorImagemY1`; acima
          da linha ela nem é consultada, só os retângulos de sempre). */}
      {cena.colisorImagem && (
        <>
          <img className="gang-debug-mask" src={cena.colisorImagem} alt="" style={{ left: 0, top: 0, width: larguraMundo }} aria-hidden="true" />
          <div className="gang-debug-mask-linha" style={{ left: 0, top: cena.colisorImagemY1 || 0, width: larguraMundo }}>
            <b>colisorImagem vale daqui pra baixo (y≥{cena.colisorImagemY1 || 0})</b>
          </div>
        </>
      )}
      {/* Faixa do muro/portão — bloqueio de rua INTEIRA (não é um retângulo
          comum de `colliders`), só existe enquanto `!muroAberto`. Achado
          real: faltava por completo no overlay antigo (Isaias: "esse
          colisão do muro não tá mostrando... não tô conseguindo passar") —
          `hitsSolid` (ganguesCenaMotor.js) aplica essa 2ª regra de bloqueio
          por fora da lista `colliders`, então `collidersDaCena()` sozinha
          nunca ia mostrar ela. */}
      {!muroAberto && (
        <div className="gang-debug-box gang-debug-box--muro" style={{ left: 0, top: MURO_GATE_Y1, width: larguraMundo, height: MURO_GATE_Y2 - MURO_GATE_Y1 }}>
          <b>MURO (rua inteira)</b>
        </div>
      )}
      {colisoresReais.map((c, i) => (
        <div key={`dc${i}`} className="gang-debug-box gang-debug-box--colisor" style={{ left: c.x, top: c.y, width: c.w, height: c.h }}>
          <b>#{i}</b>
        </div>
      ))}
      {prediosNaoSolidos.map(p => (
        <div key={`dp${p.id}`} className="gang-debug-box gang-debug-box--predio-livre" style={{ left: p.x, top: p.y, width: p.w, height: p.h }}>
          <b>{p.id}</b>
        </div>
      ))}
      {Object.entries(cena.entryZones || {}).map(([id, z]) => (
        <div key={`dz${id}`} className="gang-debug-box gang-debug-box--zona" style={{ left: z.x, top: z.y, width: z.w, height: z.h }} />
      ))}
      {Object.entries(cena.pos || {}).map(([id, p]) => (
        <div key={`dpos${id}`} className="gang-debug-dot" style={{ left: p.x, top: p.y }}>
          <b>{id}</b>
        </div>
      ))}
    </>
  )
}

function ItemCenario({ c, t }) {
  const base = { left: c.x, top: c.y }
  if (c.tipo === 'praca' || c.tipo === 'quadra' || c.tipo === 'mural') {
    return <div className={`gang-deco gang-deco--${c.tipo}`} style={{ ...base, width: c.w, height: c.h }} aria-hidden="true">
      {c.tipo === 'quadra' && <i className="gang-quadra-linha" />}
    </div>
  }
  if (c.tipo === 'varal') return <i className="gang-deco gang-deco--varal" style={{ ...base, width: c.w }} aria-hidden="true" />
  if (c.tipo === 'grafite') return <div className="gang-deco gang-deco--grafite" style={base} aria-hidden="true">{c.texto ? t(c.texto) : 'A RUA LEMBRA'}</div>
  return <i className={`gang-deco gang-deco--${c.tipo}`} style={base} aria-hidden="true" />
}

export default function CenaCenario({ cena, bossAberto, muroAberto, precisaFundoCima, debugAtivo }) {
  const { t } = useLanguage()
  const W = cena.mundo?.w || 760
  const H = cena.mundo?.h || 2840
  // postes: 2 na faixa pós-muro nova (o galpão fica lá no fundo) + os da rua
  // (todos +500 pós a expansão do mundo).
  const lamps = [120, 340, 520, 700, 880, 1060, 1240, 1510, 1690, 1870, 2050, 2260, 2440, 2620]

  // Cena com ILUSTRAÇÃO DE FUNDO (hoje só a Pista, ver mundo.js/FUNDO_PISTA):
  // a imagem já desenha prédio, cenário, obstáculo, fiação e o próprio chão —
  // não desenha mais nada disso em CSS por cima (viraria duplicado/errado).
  // `quarteiroes`/`predios` continuam existindo como dado (colisão + portas
  // de interior), só não são mais RENDERIZADOS visualmente aqui.
  if (cena.fundoImagem) {
    // Sem `.gang-world-gate` aqui: a imagem já desenha o muro+túnel fixos
    // (não dá pra "abrir" uma ilustração estática). A colisão do portão
    // (ganguesCenaMotor.js) já libera a passagem sozinha quando `muroAberto` —
    // o jogador só deixa de esbarrar, sem troca visual (aceito por ora; um
    // efeito de "muro aberto" fica pra um retoque futuro de arte).
    // Overlay de colisores/POIs por cima da imagem, pra comparar e ajustar
    // coordenada — ligado pelo botão 🧱 no HUD (GanguesCena.jsx), que já
    // resolve on/off via `debugAtivo`; nunca aparece sem alguém ligar.
    const debug = debugAtivo
    // Fundo cortado em 2 imagens na faixa do muro (ver mundo.js/FUNDO_PISTA):
    // a de BAIXO (spawn até o muro, sempre visível de cara) carrega eager —
    // a tela de loading em GanguesCena.jsx já garante que ela existe antes
    // de liberar a entrada. A de CIMA só é MONTADA no DOM (e só então o
    // navegador baixa de verdade) quando `precisaFundoCima` vira true —
    // controle explícito em vez de `loading="lazy"` nativo de propósito: o
    // `<img>` mora dentro de `.gang-cena-world`, que "rola" a câmera via
    // `transform:translate3d` (não scroll real), e o heurístico nativo de
    // distância-até-o-viewport de alguns navegadores pode não considerar
    // esse transform corretamente — melhor não depender disso pra uma
    // imagem de ~200KB. Confirmado ao vivo com Playwright (log de rede) que
    // com esse gate a imagem de cima só baixa (bytes reais, não só a
    // resolução do import em dev) quando `precisaFundoCima` fica true.
    // `GanguesCena.jsx` calcula isso como `player.y <= 1430` (mesmo limiar
    // que já acende o aviso "🔒 trancado" — dá folga suficiente pra imagem
    // carregar em segundo plano antes do jogador realmente chegar no muro)
    // OU já ter destrancado o muro/túnel (save carregado do outro lado).
    const { baixo, cima, corteY } = cena.fundoImagem
    return (
      <>
        {precisaFundoCima && <img className="gang-cena-fundo" src={cima} alt="" style={{ width: W, height: corteY, top: 0 }} aria-hidden="true" />}
        <img className="gang-cena-fundo" src={baixo} alt="" style={{ width: W, height: H - corteY, top: corteY }} aria-hidden="true" />
        {debug && <DebugColisores cena={cena} bossAberto={bossAberto} muroAberto={muroAberto} larguraMundo={W} />}
      </>
    )
  }

  return (
    <>
      <Ruas />

      {/* quarteirões — a laje/terra de base sob os prédios */}
      {(cena.quarteiroes || []).map((q, i) => (
        <div key={`q${i}`} className="gang-quarteirao" style={{ left: q.x, top: q.y, width: q.w, height: q.h }} aria-hidden="true" />
      ))}

      {/* cenário de fundo (praça, quadra, mural, varais) — antes dos prédios */}
      {(cena.cenario || []).filter(c => ['praca', 'quadra', 'mural', 'varal', 'grafite'].includes(c.tipo)).map((c, i) => (
        <ItemCenario key={`cf${i}`} c={c} t={t} />
      ))}

      {/* prédios */}
      {(cena.predios || []).map(p => <Predio key={p.id} p={p} bossAberto={bossAberto} t={t} />)}

      {/* o muro da gangue rival — só abre depois de bater o Carvão */}
      <div className={`gang-world-gate ${muroAberto ? 'is-open' : ''}`} aria-hidden="true" />

      {/* cenário de frente (árvores, bancos, vida) — depois dos prédios */}
      {(cena.cenario || []).filter(c => !['praca', 'quadra', 'mural', 'varal', 'grafite'].includes(c.tipo)).map((c, i) => (
        <ItemCenario key={`cd${i}`} c={c} t={t} />
      ))}

      {/* empecilhos de rua */}
      {(cena.obstaculos || []).map(o => (
        <i key={o.id} className={`gang-obst gang-obst--${o.tipo}${o.solido ? ' is-solido' : ''}`} style={{ left: o.x, top: o.y }} aria-hidden="true" />
      ))}

      {/* postes */}
      {lamps.map((y, i) => <span key={y} className="gang-world-lamp" style={{ left: i % 2 ? 690 : 45, top: y }} aria-hidden="true" />)}

      {/* fiação aérea (o gato) — por cima de tudo */}
      {cena.fiacao?.length > 0 && (
        <svg className="gang-fiacao" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
          {cena.fiacao.map(([ax, ay, bx, by], i) => (
            <path key={i} d={`M ${ax} ${ay} Q ${(ax + bx) / 2} ${(ay + by) / 2 + 22} ${bx} ${by}`} />
          ))}
        </svg>
      )}
    </>
  )
}
