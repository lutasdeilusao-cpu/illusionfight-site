import { useLanguage } from '../../../../../context/LanguageContext'

/* ══════════════════════════════════════════════════════════════
   CENÁRIO DA CENA — desenho puro (sem lógica de jogo).
   Recebe os dados da cena (quarteirões, prédios, obstáculos, cenário,
   fiação) e monta o mundo em CSS: rua de periferia, favela de verdade,
   praça, empecilhos. A colisão é derivada em GanguesCena a partir de
   `quarteiroes` + `obstaculos.solido` — aqui é só a arte.
   ══════════════════════════════════════════════════════════════ */

// ── Rua asfaltada (o traçado fixo da Pista) ──
function Ruas() {
  return (
    <>
      <div className="gang-road road-main" />
      <div className="gang-road road-cross r1" />
      <div className="gang-road road-cross r2" />
      <div className="gang-road road-cross r3" />
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

export default function CenaCenario({ cena, bossAberto, muroAberto }) {
  const { t } = useLanguage()
  const W = cena.mundo?.w || 760
  const H = cena.mundo?.h || 2340
  // postes: 2 na faixa pós-muro nova (o galpão fica lá no fundo) + os da rua
  // (todos +500 pós a expansão do mundo).
  const lamps = [120, 340, 520, 700, 1010, 1180, 1360, 1540, 1740, 1930, 2110]

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
