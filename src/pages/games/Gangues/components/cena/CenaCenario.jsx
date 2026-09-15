import { useLanguage } from '../../../../../context/LanguageContext'

/* ══════════════════════════════════════════════════════════════
   CENÁRIO DA CENA — desenho puro (sem lógica de jogo).
   Recebe os dados da cena (quarteirões, prédios, obstáculos, cenário,
   fiação) e monta o mundo em CSS: rua de periferia, favela de verdade,
   praça, empecilhos. A colisão é derivada em GanguesCena a partir de
   `quarteiroes` + `obstaculos.solido` — aqui é só a arte.
   ══════════════════════════════════════════════════════════════ */

// `?debugmapa=1`/`?debugmapa=0` na URL liga/desliga e GRAVA em localStorage —
// sem isso, cada troca de tela (cena → mapa → cena de novo) ou reload perdia
// o parâmetro e o Isaias tinha que digitar `?debugmapa=1` no celular de novo
// toda vez (achado real, 15/09/2026: ele reportou "não sei... talvez tenha
// sido sobrescrito" depois de pedir o overlay e não conseguir ver nada —
// mais provável de ser essa fricção de digitar a query string no celular
// toda vez do que um bug de fato no overlay, que funciona normalmente
// quando o parâmetro está de verdade na URL). Fail-safe: erro de leitura de
// localStorage (modo privado etc.) cai pra "desligado", nunca trava a tela.
function isDebugMapaAtivo() {
  if (typeof window === 'undefined') return false
  const q = new URLSearchParams(window.location.search).get('debugmapa')
  try {
    if (q === '1') { window.localStorage.setItem('ldi-gangues-debugmapa', '1'); return true }
    if (q === '0') { window.localStorage.removeItem('ldi-gangues-debugmapa'); return false }
    return window.localStorage.getItem('ldi-gangues-debugmapa') === '1'
  } catch { return q === '1' }
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

// ── Overlay de debug (?debugmapa=1) ──────────────────────────────
// Desenha por cima da ilustração de fundo: colisores (quarteirões em
// vermelho, hitboxes de porta dos prédios em ciano), POIs (POS, pontinho
// amarelo) e zonas de entrada (ENTRY_ZONES, contorno verde). Serve pro
// Isaias comparar com a imagem e me passar os ajustes de coordenada — não
// aparece pra jogador nenhum (só quando a query string pede). Nunca
// interfere na lógica real (é 100% cosmético, lê os mesmos dados que o
// motor já usa).
function DebugColisores({ cena }) {
  return (
    <>
      {(cena.quarteiroes || []).map((q, i) => (
        <div key={`dq${i}`} className="gang-debug-box gang-debug-box--quarteirao" style={{ left: q.x, top: q.y, width: q.w, height: q.h }}>
          <b>Q{i}</b>
        </div>
      ))}
      {(cena.predios || []).map(p => (
        <div key={`dp${p.id}`} className="gang-debug-box gang-debug-box--predio" style={{ left: p.x, top: p.y, width: p.w, height: p.h }}>
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

export default function CenaCenario({ cena, bossAberto, muroAberto, precisaFundoCima }) {
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
    // `?debugmapa=1` na URL liga o overlay de colisores/POIs por cima da
    // imagem — pra comparar e ajustar coordenada, nunca aparece sem o
    // parâmetro (e persiste em localStorage depois de ligado 1x, pra não se
    // perder ao trocar de tela — ver isDebugMapaAtivo()).
    const debug = isDebugMapaAtivo()
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
        {debug && <DebugColisores cena={cena} />}
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
