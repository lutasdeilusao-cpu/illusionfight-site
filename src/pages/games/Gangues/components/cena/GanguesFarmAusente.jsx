import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { CENAS_POR_ID } from '../../data/cenas/cenaHelpers.js'
import { getGanguesLevelFromXp } from '../../data/ganguesCharacters.js'
import { GANGUES_SUCATA_ID } from '../../data/ganguesEquip.js'
import { GANGUES_ITENS_LISTA } from '../../data/ganguesItens.js'
import { simularFarmRinha, lutaAoVivo, rinhaDoAlvo } from '../../engine/ganguesFarmAusente.js'
import enemiesData from '../../data/gangues-enemies.json'

// App em segundo plano (Isaias, 28/09/2026). Envolve a CENA, a LUTA e a tela
// de VITÓRIA (por onde o avanço automático passa entre luta e rua).
//
// • NA RINHA (sessão de Rinha infinita — luta ou vitória com
//   `storyTarget.rinha`): farm CALCULADO. Fica vivo 3 minutos (troca rápida
//   de app não muda nada); bateu 3 minutos, a tela é desmontada e, na volta,
//   sai a conta de 1 luta a cada 5 minutos fora (engine/ganguesFarmAusente.js)
//   e o cartão "Enquanto você tava fora".
// • EM QUALQUER OUTRO LUGAR: NADA — nem marca no save, nem cartão na volta
//   (Isaias, 30/09/2026: "não é pra exibir esse cartão se você não tiver na
//   rinha... tá matando a minha aba"). O jogo segue ao vivo no fundo até o
//   celular deixar, e na volta continua de onde está.
//
// O ponto de saída mora no SAVE — marca `storyProgress.__farmAusente`
// (store.marcarFarmAusente, gravada sem debounce): { tipo: 'rinha', desde,
// foto, lutas, vitorias, caiu, remendos, territorioId, alvo, luta, ids }.
// `alvo` null = a Rinha acabou no fundo (perdeu sem grana pra se remendar).
// `foto` = grana/rep/sucata/poções/XP na saída: o relatório é a diferença
// entre ela e o que o save tem na volta — vale com a página viva ou
// recarregada (aba descartada). `lutas`/`vitorias`/`caiu` contam as lutas
// que terminaram AO VIVO no fundo (a tela de vitória que monta com o app
// escondido anota) e descontam do ritmo de 5 minutos.
const GANGUES_FARM_ESPERA_MS = 3 * 60 * 1000
const PAUSA_CALCULO_MS = 700
const POCOES = new Set(GANGUES_ITENS_LISTA.filter(i => i.tipo === 'cura_pv' || i.tipo === 'cura_pm').map(i => i.id))

const marcaAtual = () => useGanguesStore.getState().storyProgress?.__farmAusente || null
const nivelDe = xp => getGanguesLevelFromXp(xp || 0)

function fotoDoSave() {
  const st = useGanguesStore.getState()
  const inv = st.inventario || {}
  return {
    grana: st.grana || 0, rep: st.rep || 0, sucata: inv[GANGUES_SUCATA_ID] || 0,
    pocoes: Object.entries(inv).reduce((n, [id, q]) => n + (POCOES.has(Number(id)) ? q : 0), 0),
    xp: Object.fromEntries(st.roster.map(m => [m.id, m.xp_total || 0])),
  }
}

// Esta tela é uma sessão de Rinha? Devolve o que a conta precisa, ou null.
function sessaoRinha({ luta, vitoria }) {
  const st = useGanguesStore.getState()
  const alvo = rinhaDoAlvo(st.storyTarget)
  if (!alvo) return null
  if (luta) {
    const viva = lutaAoVivo.ler?.()
    const emCurso = viva && !viva.terminou && viva.combatants?.length
    return { territorioId: alvo.territorioId, alvo, luta: emCurso ? { combatants: viva.combatants, round: viva.round || 1 } : null, ids: (st.match.playerTeam || []).map(m => m.id) }
  }
  // Vitória segue a sessão da Rinha; derrota também, se a casa remendou a
  // tropa (tinha grana — `rinhaRemendada`); derrota sem grana encerra.
  const segue = st.match.battleReport?.outcome === 'victory' || Boolean(st.storyTarget?.rinhaRemendada)
  return vitoria && segue ? { territorioId: alvo.territorioId, alvo, luta: null, ids: null } : null
}

// O relatório: diferença entre a foto da saída e o save agora + as lutas.
function montarResumo(m, calc) {
  const st = useGanguesStore.getState()
  const agora = fotoDoSave()
  const niveis = st.roster
    .filter(r => m.foto.xp[r.id] != null && nivelDe(r.xp_total) > nivelDe(m.foto.xp[r.id]))
    .map(r => ({ nome: r.sheet_name, de: nivelDe(m.foto.xp[r.id]), para: nivelDe(r.xp_total) }))
  return {
    remendos: (m.remendos || 0) + (calc?.remendos || 0),
    lutas: (m.lutas || 0) + (calc?.lutas || 0),
    vitorias: (m.vitorias || 0) + (calc?.vitorias || 0),
    grana: agora.grana - m.foto.grana, rep: agora.rep - m.foto.rep, sucata: agora.sucata - m.foto.sucata,
    pocoes: Math.max(0, m.foto.pocoes - agora.pocoes), niveis,
    derrota: Boolean(m.caiu || calc?.derrota), teto: Boolean(calc?.teto), meioNaoConta: Boolean(calc?.meioNaoConta),
  }
}
const mudouAlgo = r => Boolean(r.lutas > 0 || r.grana || r.rep || r.sucata || r.pocoes || r.niveis.length)

const sinal = n => (n < 0 ? `${n}` : `+${n}`)

export default function GanguesFarmAusente({ children, luta = false, vitoria = false, aoVoltar, aoContinuarRinha }) {
  const { t } = useLanguage()
  const tRef = useRef(t); tRef.current = t
  const [fase, setFase] = useState('cena') // cena | fora | calculando | resultado
  const [resumo, setResumo] = useState(null)

  useEffect(() => {
    let espera, timer
    const store = useGanguesStore.getState
    const gravar = mudanca => store().marcarFarmAusente({ ...marcaAtual(), ...mudanca })

    // App foi pro fundo NA RINHA: grava a saída (se ainda não tem — outra
    // tela pode ter gravado antes, nos minutos em que o jogo seguiu vivo).
    // Fora da Rinha não grava nada.
    const sair = () => {
      if (marcaAtual()) return
      const rinha = sessaoRinha({ luta, vitoria })
      if (!rinha) return
      store().marcarFarmAusente({ tipo: 'rinha', desde: Date.now(), foto: fotoDoSave(), lutas: 0, vitorias: 0, caiu: false, remendos: 0, ...rinha })
    }
    // Esta tela montou com o app no fundo: a vitória conta a luta que acabou
    // ao vivo; na Rinha, a marca segue a sessão (alvo novo, luta sem foto).
    const montouNoFundo = () => {
      const m = marcaAtual()
      if (!m || !vitoria) return
      const venceu = store().match.battleReport?.outcome === 'victory'
      const rinha = sessaoRinha({ luta, vitoria })
      // Perdeu e a casa remendou: conta o remendo e a roda segue. Perdeu sem
      // grana: a Rinha acabou ali (`alvo` null) — o cálculo não segue lutando
      // com a tropa no chão.
      gravar({ lutas: (m.lutas || 0) + 1, vitorias: (m.vitorias || 0) + (venceu ? 1 : 0), remendos: (m.remendos || 0) + (!venceu && rinha ? 1 : 0), caiu: m.caiu || (!venceu && !rinha), alvo: rinha ? rinha.alvo : null, luta: null })
    }
    // Só na Rinha: 3 minutos no fundo, a tela desmonta (a foto da luta vai
    // pra marca). Luta que acabou agora espera a vitória montar (é ela que
    // aplica o prêmio).
    const armar = () => {
      clearTimeout(espera)
      const m = marcaAtual()
      if (m?.tipo !== 'rinha' || !m.alvo) return
      const desmontar = () => {
        if (luta && lutaAoVivo.ler?.()?.terminou) { espera = setTimeout(desmontar, 3000); return }
        const rinha = sessaoRinha({ luta, vitoria })
        if (!rinha || !marcaAtual()) return
        gravar({ alvo: rinha.alvo, luta: rinha.luta, ids: rinha.ids || marcaAtual().ids })
        setFase('fora')
      }
      espera = setTimeout(desmontar, Math.max(0, GANGUES_FARM_ESPERA_MS - (Date.now() - m.desde)))
    }
    // App na frente com uma marca de saída: relatório (e, na Rinha, a conta).
    // Sem marca, nunca fica preso na tela desmontada.
    const processar = () => {
      clearTimeout(espera)
      const m = marcaAtual()
      const ms = m ? Date.now() - m.desde : 0
      // Marca que não é da Rinha (save de antes da v3.81.5) só é limpa.
      if (!m || ms < GANGUES_FARM_ESPERA_MS || !m.foto || m.tipo !== 'rinha') {
        if (m) store().limparFarmAusente()
        setFase(f => (f === 'fora' ? 'cena' : f))
        return
      }
      const fechar = calc => {
        const r = { ...montarResumo(m, calc), segundos: ms / 1000, alvo: m.alvo || null }
        const cena = CENAS_POR_ID[m.territorioId]
        const poi = cena?.pois.find(p => p.id === (m.alvo?.cenaPoiId || 'rinha'))
        r.lugar = poi?.i18n ? tRef.current(`${poi.i18n}.nome`) : ''
        store().limparFarmAusente()
        setResumo(r)
        setFase('resultado')
      }
      if (!m.alvo) { fechar(null); return }
      setFase('calculando')
      // Deixa a tela de carga pintar antes da conta (que roda de uma vez).
      timer = setTimeout(() => {
        const cena = CENAS_POR_ID[m.territorioId]
        const calc = cena ? simularFarmRinha({ store, cena, segundos: ms / 1000, enemiesData, alvo: m.alvo, lutaEmAndamento: m.luta, ids: m.ids, lutasVivas: m.lutas || 0 }) : null
        fechar(calc)
      }, PAUSA_CALCULO_MS)
    }
    const aoMudar = () => {
      if (!document.hidden) { processar(); return }
      sair()
      armar()
    }
    document.addEventListener('visibilitychange', aoMudar)
    // Montou com o app no fundo (a luta começou/acabou durante o tempo fora):
    // anota e segue a mesma contagem. Montou com o app na frente e uma marca
    // no save (página recarregada depois de a aba ser descartada, ou a volta
    // caiu numa tela fora do embrulho): relatório.
    if (document.hidden) { montouNoFundo(); armar() }
    else if (marcaAtual()) processar()
    return () => { clearTimeout(espera); clearTimeout(timer); document.removeEventListener('visibilitychange', aoMudar) }
  }, [luta, vitoria])

  if (fase === 'fora') return null
  if (fase === 'calculando') {
    return (
      <div className="gang-page--loading" role="status">
        <span className="gang-loading-mark">{t('games.gangues.farm_ausente.calculando')}</span>
        <i className="gang-loading-line" aria-hidden="true" />
      </div>
    )
  }
  if (fase === 'resultado' && resumo) {
    const aviso = resumo.derrota ? 'derrota' : resumo.teto ? 'teto' : !resumo.lutas ? 'pouco_tempo' : null
    const podeContinuar = !resumo.derrota && resumo.alvo && aoContinuarRinha
    const min = Math.max(1, Math.round(resumo.segundos / 60))
    return (
      <div className="gang-farm-ausente" role="dialog" aria-modal="true" aria-labelledby="gang-farm-ausente-titulo">
        <div className="gang-farm-ausente__card">
          <span className="gang-farm-ausente__eyebrow">{t('games.gangues.farm_ausente.eyebrow')}</span>
          <h2 id="gang-farm-ausente-titulo">{t('games.gangues.farm_ausente.titulo')}</h2>
          <p className="gang-farm-ausente__tempo">{t('games.gangues.farm_ausente.tempo', { min, lugar: resumo.lugar || '—' })}</p>
          {mudouAlgo(resumo) && (
            <dl className="gang-farm-ausente__numeros">
              <div><dt>{t('games.gangues.farm_ausente.lutas')}</dt><dd>{resumo.vitorias}/{resumo.lutas}</dd></div>
              <div><dt>{t('games.gangues.farm_ausente.grana')}</dt><dd>{sinal(resumo.grana)}</dd></div>
              <div><dt>{t('games.gangues.farm_ausente.rep')}</dt><dd>{sinal(resumo.rep)}</dd></div>
              <div><dt>{t('games.gangues.farm_ausente.sucata')}</dt><dd>{sinal(resumo.sucata)}</dd></div>
              {resumo.pocoes > 0 && <div><dt>{t('games.gangues.farm_ausente.pocoes')}</dt><dd>−{resumo.pocoes}</dd></div>}
            </dl>
          )}
          {resumo.niveis.length > 0 && (
            <ul className="gang-farm-ausente__niveis" aria-label={t('games.gangues.farm_ausente.niveis')}>
              {resumo.niveis.map(n => <li key={n.nome}><strong>{n.nome}</strong><span>NV {n.de} → {n.para}</span></li>)}
            </ul>
          )}
          {aviso && <p className={`gang-farm-ausente__aviso is-${aviso}`}>{t(`games.gangues.farm_ausente.${aviso}`)}</p>}
          {resumo.remendos > 0 && <p className="gang-farm-ausente__aviso">{t('games.gangues.farm_ausente.remendos', { n: resumo.remendos })}</p>}
          {resumo.meioNaoConta && resumo.lutas > 0 && <p className="gang-farm-ausente__aviso">{t('games.gangues.farm_ausente.meio_nao_conta')}</p>}
          {podeContinuar && (
            <button type="button" className="gang-farm-ausente__voltar" onClick={() => { const alvo = resumo.alvo; setResumo(null); setFase('cena'); aoContinuarRinha(alvo) }}>
              {t('games.gangues.farm_ausente.continuar_rinha')}
            </button>
          )}
          <button type="button" className={`gang-farm-ausente__voltar${podeContinuar ? ' is-secundario' : ''}`} onClick={() => { setResumo(null); setFase('cena'); aoVoltar?.() }}>
            {t('games.gangues.farm_ausente.voltar')}
          </button>
        </div>
      </div>
    )
  }
  return children
}
