import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { sfx } from '../../../../../lib/sfx'
import { getGanguesNpcPortrait } from '../../data/ganguesNpcPortraits.js'
import { getGanguesPortraitByTemplateId } from '../../data/ganguesPortraits.js'
import GanguesRetratoImg from '../GanguesRetratoImg'
import GanguesDialogoEncontro from './GanguesDialogoEncontro'
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

   Agiotagem: o Nato TAMBÉM fia o descanso. O preço do fiado NÃO aparece antes
   de aceitar — ao aceitar, mostra o "contrato" (o quanto colou na conta e a
   dívida total). 1º fiado = 5× o preço normal, 2º = 10×. Depois de 2 o nome
   suja e ele não fia mais. A dívida é global e silenciosa (store.__birosca) —
   o jogador só topa com ela aqui. Pode passar só pra pagar. */
export default function GanguesDescanso({ poi, onClose, onClube }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [res, setRes] = useState(null)         // resultado do descanso à vista
  const [contrato, setContrato] = useState(null) // resultado do fiado (contrato + cura)
  const [pgto, setPgto] = useState(null)        // resultado de "pagar dívida"
  const [verClube, setVerClube] = useState(false) // abriu o painel do Clube da Luta
  const [animando, setAnimando] = useState(null) // { proximo: () => void } — tela de "descansando..."
  const timerRef = useRef(null)
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const custo = poi.custoGrana || 10
  const semGrana = store.grana < custo
  const { divida, fiados } = store.storyProgress.__birosca || { divida: 0, fiados: 0 }
  const podeFiar = fiados < 2
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
  const comAnimacao = (proximo) => {
    sfx.reward?.()
    const reduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    setAnimando(true)
    timerRef.current = setTimeout(() => { setAnimando(false); proximo() }, reduzido ? 350 : 1400)
  }

  const descansar = () => {
    const r = store.descansarTropa(custo)
    if (!r.ok) { setRes(r); sfx.cancel(); return }
    comAnimacao(() => setRes(r))
  }
  const fiar = () => {
    const r = store.fiarDescanso(custo)
    if (!r.ok) { setRes({ ok: false, motivo: r.motivo }); sfx.cancel(); return }
    comAnimacao(() => setContrato(r))
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

  // ── Tela do contrato (depois de aceitar o fiado) ──
  if (contrato) {
    return (
      <GanguesDialogoEncontro
        retrato={retrato} nome={nome} sub={t('games.gangues.cena.fiado_contrato_tag')}
        falas={[t('games.gangues.cena.fiado_contrato', { valor: contrato.valor, divida: contrato.divida })]}
        escolhas={[{ id: 'fechar', label: fecharLabel, variante: 'go', onClick: onClose }]}
        onClose={onClose} fecharLabel={fecharLabel}
      >
        {listaCura(contrato.detalhe)}
      </GanguesDialogoEncontro>
    )
  }

  // ── Oferta (padrão) + resultado do descanso à vista ──
  const falas = res?.ok
    ? [t('games.gangues.cena.descanso_titulo')]
    : [res?.motivo === 'inteira'
      ? t('games.gangues.cena.descanso_ja_inteira')
      : res?.motivo === 'sujo'
        ? t('games.gangues.cena.fiado_nome_sujo')
        : (res?.motivo === 'grana' || (semGrana && !podeFiar))
          ? t('games.gangues.cena.descanso_sem_grana')
          : t(`${poi.i18n}.intro`)]

  const escolhas = []
  if (!res?.ok) {
    if (divida > 0 && !pgto?.ok && aPagar > 0) {
      escolhas.push({ id: 'pagar', label: t('games.gangues.cena.fiado_pagar', { grana: aPagar }), onClick: pagar })
    }
    if (!semGrana) escolhas.push({ id: 'descansar', label: t('games.gangues.cena.descanso_curar', { grana: custo }), variante: 'go', onClick: descansar })
    if (podeFiar) escolhas.push({ id: 'fiar', label: t('games.gangues.cena.fiado_pedir'), variante: semGrana ? 'go' : undefined, onClick: fiar })
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
}
