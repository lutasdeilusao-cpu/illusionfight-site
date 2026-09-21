import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { sfx } from '../../../../../lib/sfx'
import { getGanguesNpcPortrait } from '../../data/ganguesNpcPortraits.js'
import { getGanguesPortraitByTemplateId } from '../../data/ganguesPortraits.js'
import GanguesRetratoImg from '../GanguesRetratoImg'
import GanguesDialogoEncontro from './GanguesDialogoEncontro'
import GanguesAgiotagem from './GanguesAgiotagem'
import { GanguesDescansoTutorial, GanguesClubeTutorial } from './GanguesDescansoTutorial'
import './GanguesDescanso.css'

/* Encontro DESCANSO — a birosca. Restaura o PV/PM de TODA a tropa gastando
   grana e mostra quanto cada personagem recuperou. Repetível.

   REDESIGN (pedido do Isaias, 20/09/2026, print do card antigo — só texto
   cru, sem cara nenhuma: "colocar o rosto do nego velho ali em cima...
   colocar a cabeça de quem tá sendo recuperado, quanto tá sendo recuperado
   ... uma animaçãozinha de descanso antes de apresentar o resultado, que a
   maioria dos rpgs tem"). Migrado pro MESMO componente reutilizável do
   "papo" (GanguesDialogoEncontro — retrato circular + balão + botões,
   linguagem visual única da cena) em vez do card cru `.gang-cena-enc--*`
   de antes — o dono da birosca (npcSlug 'nego_veio', ver pois.js) fica
   ancorado no topo em TODA fase do fluxo (oferta → animando → resultado),
   nunca remonta.

   Agiotagem do Nato — REDESENHO COMPLETO (Isaias, 21/09/2026: "você pode
   pegar um empréstimo... até 100, só que paga 10 vezes mais, fica devendo
   1000... a partir daí pode se endividar pelo dobro pra ganhar uma cura,
   até 10.000, aí o Nato te remenda de graça mas te joga pro Clube da
   Luta. E pediu explicitamente um "componente reutilizável desacoplado
   desse sistema"). A REGRA (quanto empresta, quanto dobra, o teto) mora no
   store (`agiotagemInfo`/`pedirEmprestimoNato`/`fiarDescanso`, ambos
   NPC-agnósticos — ganguesBiroscaSlice.js); a UI das 3 telas de resultado
   (empréstimo, cura fiada, socorro forçado) mora em `<GanguesAgiotagem>`,
   um componente à parte que só o Nato usa hoje mas não depende de nada
   específico dele — qualquer outro território pode montar o mesmo
   componente com seu próprio NPC/retrato. Enquanto a dívida > 0, o chefe
   da Pista (Carvão) fica bloqueado em qualquer território (ver
   `iniciarTreta` em GanguesCena.jsx) — o jeito mais rápido de zerar é
   justamente o Clube da Luta. A dívida é global e silenciosa
   (store.__birosca) — o jogador só topa com ela aqui. Pode passar só pra
   pagar.

   OFERTA DO CORRE (mergeado aqui em 20/09/2026 — pedido do Isaias, achou o
   pino "A birosca do Seu Nato" redundante com este, mesma cara duas vezes
   no mapa: "não precisa, a missão do Nego Véio pode aparecer ali no
   descanso"): existia um POI `birosca` À PARTE (papo) só pra oferecer o
   corre e revelar beco_2 — removido. `poi.ofertaFlagId` ('nato_oferta')
   chega revelado (não resolvido) quando `beco` é vencido; enquanto isso
   for verdade, ESTA tela abre primeiro com o convite do Nato (reaproveita
   o texto/escolhas que já existiam em i18n `cena.pista.birosca`), antes do
   descanso normal — decidir (aceitar ou não) marca a oferta resolvida e
   segue pro resto do fluxo. */
export default function GanguesDescanso({ poi, cena, onClose, onClube }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [res, setRes] = useState(null)         // resultado do descanso à vista
  const [pgto, setPgto] = useState(null)        // resultado de "pagar dívida"
  const [verClube, setVerClube] = useState(false) // abriu o painel do Clube da Luta
  const [animando, setAnimando] = useState(null) // { proximo: () => void } — tela de "descansando..."
  const [ofertaResultado, setOfertaResultado] = useState(null) // fala de resposta do Nato, depois de decidir
  const [ofertaDecidida, setOfertaDecidida] = useState(false) // decidiu NESTA sessão do modal — segue pro descanso normal
  const timerRef = useRef(null)
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const custo = poi.custoGrana || 10
  // Recuperar com o caído (revive) custa 3× e leva mais tempo de animação —
  // pedido do Isaias, 21/09/2026: "recuperar quem não caiu custa 10... com o
  // caído dá mais trabalho, custa 30, pra equilibrar os preços".
  const custoCaidos = custo * 3
  const semGrana = store.grana < custo
  const semGranaCaidos = store.grana < custoCaidos
  const info = store.descansoInfo()
  const { divida } = store.storyProgress.__birosca || { divida: 0 }
  const aPagar = Math.min(store.grana, divida)
  // O Clube da Luta é oferecido SEMPRE (desde a 1ª visita à birosca), não só
  // num beco sem saída. Sem dívida: ganha 200 de grana. Com dívida: quita a
  // dívida. Nunca dá XP. Perdeu, te remendam e te largam na Pista.
  const clube = verClube && Boolean(onClube)

  const retrato = getGanguesNpcPortrait(poi.npcSlug)
  const nome = t(`${poi.i18n}.nome`)
  const sub = t(`${poi.i18n}.sub`)
  const retratoMembro = id => getGanguesPortraitByTemplateId(store.roster.find(m => m.id === id)?.character_template_id)

  // "Uma animaçãozinha de descanso antes de apresentar o resultado" — só
  // roda quando a tropa DE VERDADE descansou/foi curada (não pra falha nem
  // pra pagar dívida, que não tem nada de "descanso" nisso). Reduced motion
  // encurta bastante em vez de sumir de vez (mesmo critério da vinheta de
  // abertura, ver AGENTS.md).
  const comAnimacao = (proximo, demorado = false) => {
    sfx.reward?.()
    const reduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    setAnimando(true)
    const base = reduzido ? 350 : 1400
    timerRef.current = setTimeout(() => { setAnimando(false); proximo() }, demorado ? Math.round(base * 1.6) : base)
  }

  // `incluirCaidos` = a opção cara, que também revive quem tá com PV zerado
  // (ver descansarTropa em ganguesBiroscaSlice.js) — animação mais longa.
  const descansar = (incluirCaidos = false) => {
    const r = store.descansarTropa(incluirCaidos ? custoCaidos : custo, incluirCaidos)
    if (!r.ok) { setRes(r); sfx.cancel(); return }
    comAnimacao(() => setRes(r), incluirCaidos)
  }
  const pagar = () => {
    const r = store.pagarBirosca()
    setPgto(r)
    r.ok ? sfx.reward?.() : sfx.cancel()
  }

  const listaCura = (detalhe) => (
    <ul className="gds-lista">
      {detalhe.map(d => (
        <li key={d.id} className="gds-lista-item">
          <span className="gds-lista-avatar">
            <GanguesRetratoImg src={retratoMembro(d.id)} alt="" fallback={<b aria-hidden="true">{(d.nome || '?')[0]}</b>} />
          </span>
          <strong className="gds-lista-nome">{d.nome}</strong>
          <span className="gds-lista-ganho">
            {d.pv > 0 && <em className="is-pv">+{d.pv} PV</em>}
            {d.pm > 0 && <em className="is-pm">+{d.pm} PM</em>}
          </span>
        </li>
      ))}
    </ul>
  )

  const fecharLabel = t('games.gangues.cena.fechar')

  // ── Oferta pendente do Nato (corre do pacote) — abre ANTES de tudo, uma
  // vez só, até o jogador decidir. `cena` pode faltar num uso isolado
  // (defensivo, nunca deveria faltar no fluxo real).
  // `ofertaAoAbrir` é capturado UMA VEZ na montagem (useState preguiçoso) —
  // decidir a oferta chama `marcarPoiResolvido`, que já reflete no store
  // reativo `prog` no mesmo clique; sem congelar o valor inicial, a tela de
  // "resultado" (resposta do Nato) nunca chegava a aparecer, porque a
  // condição virava falsa antes do próximo render mostrar `ofertaResultado`.
  const prog = cena ? store.cenaProgresso[cena.id] : null
  const [ofertaAoAbrir] = useState(() => Boolean(poi.ofertaFlagId) && Boolean(prog?.revelados?.[poi.ofertaFlagId]) && !prog?.resolvidos?.[poi.ofertaFlagId])
  const decidirOferta = (aceitou) => {
    sfx.select?.()
    store.marcarPoiResolvido(cena.id, poi.ofertaFlagId, aceitou ? ['corre'] : [])
    setOfertaResultado(t(`games.gangues.cena.pista.birosca.escolhas.${aceitou ? 'aceita_corre' : 'so_papo'}.resultado`))
  }
  if (ofertaAoAbrir && !ofertaDecidida) {
    const nomeNato = t('games.gangues.cena.pista.birosca.nome')
    const subNato = t('games.gangues.cena.pista.birosca.sub')
    if (ofertaResultado) {
      return (
        <GanguesDialogoEncontro
          retrato={retrato} nome={nomeNato} sub={subNato}
          falas={[ofertaResultado]}
          escolhas={[{ id: 'continuar', label: fecharLabel, variante: 'go', onClick: () => setOfertaDecidida(true) }]}
          onClose={onClose} fecharLabel={fecharLabel}
        />
      )
    }
    const falaNato = t('games.gangues.cena.pista.birosca.fala')
    return (
      <GanguesDialogoEncontro
        retrato={retrato} nome={nomeNato} sub={subNato}
        falas={Array.isArray(falaNato) ? falaNato : [falaNato]}
        escolhas={[
          { id: 'aceita_corre', label: t('games.gangues.cena.pista.birosca.escolhas.aceita_corre.label'), variante: 'go', onClick: () => decidirOferta(true) },
          { id: 'so_papo', label: t('games.gangues.cena.pista.birosca.escolhas.so_papo.label'), onClick: () => decidirOferta(false) },
        ]}
        onClose={onClose} fecharLabel={fecharLabel}
      />
    )
  }

  // ── "Descansando..." — animação curta antes de revelar o resultado ──
  if (animando) {
    return (
      <GanguesDialogoEncontro retrato={retrato} nome={nome} sub={sub} onClose={onClose} fecharLabel={fecharLabel}>
        <div className="gds-animando" role="status">
          <span className="gds-animando-zzz" aria-hidden="true">💤</span>
          <p className="gds-animando-texto">{t('games.gangues.cena.descanso_animando')}</p>
          <div className="gds-animando-barra"><span /></div>
        </div>
      </GanguesDialogoEncontro>
    )
  }

  // ── O Nato oferece o Clube da Luta ──
  if (clube) {
    return (
      <GanguesDialogoEncontro
        retrato={retrato} nome={t('games.gangues.clube.nome')} sub={t('games.gangues.cena.clube_oferta_tag')}
        falas={[t(divida > 0 ? 'games.gangues.cena.clube_oferta_divida' : 'games.gangues.cena.clube_oferta_limpo')]}
        escolhas={[
          { id: 'recusar', label: t('games.gangues.cena.clube_recusar'), onClick: () => setVerClube(false) },
          { id: 'aceitar', label: t('games.gangues.cena.clube_aceitar'), variante: 'go', onClick: () => onClube(custo) },
        ]}
        onClose={onClose} fecharLabel={fecharLabel}
      >
        {divida > 0 && (
          <div className="gang-cena-fiado-caderneta">
            <p className="gang-cena-fiado-linha">{t('games.gangues.cena.fiado_devendo', { divida })}</p>
          </div>
        )}
        <GanguesClubeTutorial />
      </GanguesDialogoEncontro>
    )
  }

  // ── Sistema de agiotagem (empréstimo/cura fiada/socorro forçado) — ver
  // GanguesAgiotagem.jsx. Se há um resultado pendente dele, renderiza
  // sozinho; senão devolve `{ agio, pedirEmprestimo, pedirCuraFiada,
  // pedirSocorro }` pra montar os botões junto com os que não são dele
  // (descansar, pagar, clube) num único diálogo.
  return (
    <GanguesAgiotagem
      retrato={retrato} nome={nome} fecharLabel={fecharLabel} onClose={onClose}
      custoBase={custo} onClube={onClube} comAnimacao={comAnimacao} renderDetalheCura={listaCura}
    >
      {({ agio, pedirEmprestimo, pedirCuraFiada, pedirSocorro }) => {
        const falas = res?.ok
          ? [t('games.gangues.cena.descanso_titulo')]
          : [res?.motivo === 'inteira'
            ? t('games.gangues.cena.descanso_ja_inteira')
            : res?.motivo === 'ja_deve'
              ? t('games.gangues.cena.emprestimo_ja_deve')
              : res?.motivo === 'sem_emprestimo'
                ? t('games.gangues.cena.fiado_sem_emprestimo')
                : res?.motivo === 'teto'
                  ? t('games.gangues.cena.fiado_teto')
                  : res?.motivo === 'grana'
                    ? t('games.gangues.cena.descanso_sem_grana')
                    : t(`${poi.i18n}.intro`)]

        const onEmprestimoClick = () => {
          const r = pedirEmprestimo()
          if (!r.ok) { setRes({ ok: false, motivo: r.motivo }); sfx.cancel(); return }
          sfx.reward?.()
        }
        const onFiarClick = () => {
          const r = pedirCuraFiada()
          if (!r.ok) { setRes({ ok: false, motivo: r.motivo }); sfx.cancel() }
        }
        const onSocorroClick = () => { sfx.vs?.(); pedirSocorro() }

        const escolhas = []
        if (!res?.ok) {
          if (divida > 0 && !pgto?.ok && aPagar > 0) {
            escolhas.push({ id: 'pagar', label: t('games.gangues.cena.fiado_pagar', { grana: aPagar }), onClick: pagar })
          }
          if (!semGrana) escolhas.push({ id: 'descansar', label: t('games.gangues.cena.descanso_curar', { grana: custo }), variante: 'go', onClick: () => descansar(false) })
          if (info.temCaido && !semGranaCaidos) escolhas.push({ id: 'descansar_caidos', label: t('games.gangues.cena.descanso_curar_caidos', { grana: custoCaidos }), variante: 'go', onClick: () => descansar(true) })
          if (agio.podeEmprestimo) {
            escolhas.push({ id: 'emprestimo', label: t('games.gangues.cena.emprestimo_pedir', { valor: agio.valorEmprestimo, divida: agio.proximaDivida }), variante: semGrana ? 'go' : undefined, onClick: onEmprestimoClick })
          } else if (agio.podeFiarCura) {
            escolhas.push({ id: 'fiar', label: t('games.gangues.cena.fiado_pedir', { divida: agio.proximaDivida }), variante: semGrana ? 'go' : undefined, onClick: onFiarClick })
          } else if (agio.noTeto) {
            escolhas.push({ id: 'socorro', label: t('games.gangues.cena.nato_socorro'), variante: 'go', onClick: onSocorroClick })
          }
        }
        escolhas.push({ id: 'fechar', label: fecharLabel, onClick: onClose })
        if (Boolean(onClube) && !res?.ok) {
          escolhas.push({ id: 'clube', label: t('games.gangues.cena.clube_botao'), variante: 'link', onClick: () => setVerClube(true) })
        }

        return (
          <GanguesDialogoEncontro retrato={retrato} nome={nome} sub={sub} falas={falas} escolhas={escolhas} onClose={onClose} fecharLabel={fecharLabel}>
            {res?.ok && listaCura(res.detalhe)}

            {/* Caderneta: só aparece se tem dívida. Silenciosa fora daqui. */}
            {divida > 0 && !res?.ok && (
              <div className="gang-cena-fiado-caderneta">
                {pgto?.ok ? (
                  <p className="gang-cena-fiado-linha">
                    {t(pgto.restante > 0
                      ? 'games.gangues.cena.fiado_pago_parcial'
                      : 'games.gangues.cena.fiado_pago_total', { pago: pgto.pago, restante: pgto.restante })}
                  </p>
                ) : (
                  <p className="gang-cena-fiado-linha">
                    {t('games.gangues.cena.fiado_devendo', { divida })}
                  </p>
                )}
              </div>
            )}
            <GanguesDescansoTutorial />
          </GanguesDialogoEncontro>
        )
      }}
    </GanguesAgiotagem>
  )
}
