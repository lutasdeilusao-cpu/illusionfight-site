import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { sfx } from '../../../../../lib/sfx'
import { getGanguesEnemyPortraitById } from '../../data/ganguesEnemyPortraits.js'
import GanguesDialogoEncontro from './GanguesDialogoEncontro'
import GanguesAgiotagem from './GanguesAgiotagem'
import { GanguesClubeTutorial, GanguesAgiotaTutorial } from './GanguesDescansoTutorial'
import './GanguesDescanso.css'
import { clubePremioDe } from '../../data/ganguesLoadout.js'
import { apostasPossiveis } from '../../data/ganguesApostas.js'

/* Encontro AGIOTA — pino dedicado, pedido do Isaias, 21/09/2026: "vamos
   criar um pin dedicado ao agiota, escolhe uma imagem, coloca ele no
   cantinho, parado, com uma tag nele, agiota. Ele só fala que dá 100.
   Antes de emprestar ele lança um contrato e a pessoa aceita ou não. Lá
   embaixo, letra miúda, escrito que deve 1000. Depois que pegou o
   empréstimo, fala bem clara na tela: você me deve agora".

   Personagem NOVO (Marimbondo/Hornet/Avispón — retrato emprestado do
   catálogo de INIMIGO "Fiado Vencido"/1206, tema batendo com agiotagem;
   mesmo truque do `loja_pocoes`/balconista), separado do Nato da birosca.
   TODO o sistema de dívida mora aqui agora — empréstimo, cura fiada
   (dobra), socorro no teto, pagar e o Clube da Luta (ver
   GanguesAgiotagem.jsx, o componente reutilizável/desacoplado da REGRA em
   si) — a birosca (POI `descanso`, GanguesDescanso.jsx) voltou a ser só
   cura, sem nenhuma menção a dívida.

   Fluxo do empréstimo (a novidade central deste POI, diferente de como
   `GanguesDescanso` chamava `pedirEmprestimo` direto no clique): 1) fala
   inicial só menciona os 100 (`poi.i18n.fala`); 2) o botão principal não
   empresta ainda — abre a tela de CONTRATO (`verContrato`, estado local),
   com o texto claro do acordo e a letra miúda da dívida exata; 3) só ao
   clicar "Aceito" chama `pedirEmprestimo()` de verdade — a tela de
   resultado (falando claro "agora você me deve") já vem pronta do
   <GanguesAgiotagem>, sem precisar duplicar nada aqui. Recusar volta pra
   fala inicial sem gastar nem dever nada. */
export default function GanguesAgiota({ poi, onClose, onClube, territorioId = 'pista' }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [verContrato, setVerContrato] = useState(false) // preview do contrato, antes de aceitar
  const [res, setRes] = useState(null)      // falha (motivo) de alguma ação
  const [pgto, setPgto] = useState(null)    // resultado de "pagar dívida"
  const [verClube, setVerClube] = useState(false)
  const [apostaClube, setApostaClube] = useState(0) // só quem entra sem dívida aposta
  const [animando, setAnimando] = useState(false)
  const timerRef = useRef(null)
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const custo = poi.custoGrana || 10
  const { divida } = store.storyProgress.__birosca || { divida: 0 }
  const aPagar = Math.min(store.grana, divida)
  const clube = verClube && Boolean(onClube)

  const retrato = getGanguesEnemyPortraitById(poi.retratoEnemyId)
  const nome = t(`${poi.i18n}.nome`)
  const sub = t(`${poi.i18n}.sub`)
  const fecharLabel = t('games.gangues.cena.fechar')

  // Mesma animaçãozinha "descansando..." da birosca — aqui roda só na cura
  // fiada (que também cura a tropa geral), via <GanguesAgiotagem comAnimacao>.
  const comAnimacao = (proximo) => {
    sfx.reward?.()
    const reduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    setAnimando(true)
    timerRef.current = setTimeout(() => { setAnimando(false); proximo() }, reduzido ? 350 : 1400)
  }

  const pagar = () => {
    const r = store.pagarBirosca()
    setPgto(r)
    r.ok ? sfx.reward?.() : sfx.cancel()
  }

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

  // ── O agiota também oferece o Clube da Luta (migrou junto com a dívida) ──
  if (clube) {
    return (
      <GanguesDialogoEncontro
        retrato={retrato} nome={t('games.gangues.clube.nome')} sub={t('games.gangues.cena.clube_oferta_tag', { agiota: nome })}
        falas={[t(divida > 0 ? 'games.gangues.cena.clube_oferta_divida' : 'games.gangues.cena.clube_oferta_limpo', { agiota: nome, premio: clubePremioDe(territorioId) })]}
        escolhas={[
          { id: 'recusar', label: t('games.gangues.cena.clube_recusar'), onClick: () => setVerClube(false) },
          { id: 'aceitar', label: t('games.gangues.cena.clube_aceitar'), variante: 'go', onClick: () => onClube(custo, false, divida > 0 ? 0 : apostaClube) },
        ]}
        onClose={onClose} fecharLabel={fecharLabel}
      >
        {divida > 0 && (
          <div className="gang-cena-fiado-caderneta">
            <p className="gang-cena-fiado-linha">{t('games.gangues.cena.fiado_devendo', { divida, agiota: nome })}</p>
          </div>
        )}
        {/* Clube apostado (Isaias, 30/09/2026): só pra quem entra sem dívida —
            põe uma grana a mais; venceu as 3 rondas, leva o prêmio + o dobro. */}
        {divida <= 0 && apostasPossiveis(store.rep, store.grana).length > 0 && (
          <div className="gang-cena-aposta">
            <small>{t('games.gangues.clube.aposta_titulo')}</small>
            <div className="gang-cena-aposta__opcoes">
              {[0, ...apostasPossiveis(store.rep, store.grana)].map(v => (
                <button key={v} type="button" className={`gang-cena-aposta__opt${apostaClube === v ? ' is-escolhida' : ''}`} onClick={() => setApostaClube(v)}>
                  {v === 0 ? t('games.gangues.clube.aposta_nada') : `💵 ${v}`}
                </button>
              ))}
            </div>
            {apostaClube > 0 && <p className="gang-cena-aposta__premio">{t('games.gangues.clube.aposta_premio', { n: apostaClube * 2 })}</p>}
          </div>
        )}
        <GanguesClubeTutorial />
      </GanguesDialogoEncontro>
    )
  }

  return (
    <GanguesAgiotagem
      retrato={retrato} nome={nome} fecharLabel={fecharLabel} onClose={onClose}
      custoBase={custo} valorEmprestimo={poi.emprestimo} onClube={onClube} comAnimacao={comAnimacao}
    >
      {({ agio, pedirEmprestimo, pedirCuraFiada, pedirSocorro }) => {
        // ── Tela de CONTRATO do empréstimo — a novidade pedida. Só chama
        // `pedirEmprestimo()` de verdade ao clicar Aceito; a tela de
        // resultado ("agora você me deve") é da própria <GanguesAgiotagem>.
        if (verContrato) {
          const onAceitar = () => {
            const r = pedirEmprestimo()
            if (!r.ok) { setRes({ ok: false, motivo: r.motivo }); sfx.cancel(); setVerContrato(false); return }
            sfx.reward?.()
            setVerContrato(false)
          }
          return (
            <GanguesDialogoEncontro
              retrato={retrato} nome={nome} sub={t(`${poi.i18n}.contrato_tag`)}
              falas={[t(`${poi.i18n}.contrato_corpo`)]}
              escolhas={[
                { id: 'recusar', label: t(`${poi.i18n}.contrato_recusar`), onClick: () => setVerContrato(false) },
                { id: 'aceitar', label: t(`${poi.i18n}.contrato_aceitar`), variante: 'go', onClick: onAceitar },
              ]}
              onClose={onClose} fecharLabel={fecharLabel}
            >
              <p className="gds-letra-miuda">{t(`${poi.i18n}.contrato_letra_miuda`, { divida: agio.proximaDivida })}</p>
            </GanguesDialogoEncontro>
          )
        }

        const falaInicial = t(`${poi.i18n}.fala`)
        const falas = res?.motivo === 'ja_deve'
          ? [t('games.gangues.cena.emprestimo_ja_deve', { agiota: nome })]
          : res?.motivo === 'sem_emprestimo'
            ? [t('games.gangues.cena.fiado_sem_emprestimo', { agiota: nome })]
            : res?.motivo === 'teto'
              ? [t('games.gangues.cena.fiado_teto', { agiota: nome })]
              : res?.motivo === 'grana'
                ? [t('games.gangues.cena.descanso_sem_grana')]
                : (Array.isArray(falaInicial) ? falaInicial : [falaInicial])

        const onFiarClick = () => {
          const r = pedirCuraFiada()
          if (!r.ok) { setRes({ ok: false, motivo: r.motivo }); sfx.cancel() }
        }
        const onSocorroClick = () => { sfx.vs?.(); pedirSocorro() }

        const escolhas = []
        if (divida > 0 && !pgto?.ok && aPagar > 0) {
          escolhas.push({ id: 'pagar', label: t('games.gangues.cena.fiado_pagar', { grana: aPagar, agiota: nome }), onClick: pagar })
        }
        if (agio.podeEmprestimo) {
          escolhas.push({ id: 'emprestimo', label: t(`${poi.i18n}.botao_ver_contrato`), variante: 'go', onClick: () => { sfx.select?.(); setVerContrato(true) } })
        } else if (agio.podeFiarCura) {
          escolhas.push({ id: 'fiar', label: t('games.gangues.cena.fiado_pedir', { divida: agio.proximaDivida }), variante: 'go', onClick: onFiarClick })
        } else if (agio.noTeto) {
          escolhas.push({ id: 'socorro', label: t('games.gangues.cena.agiota_socorro', { agiota: nome }), variante: 'go', onClick: onSocorroClick })
        }
        escolhas.push({ id: 'fechar', label: fecharLabel, onClick: onClose })
        if (Boolean(onClube)) {
          escolhas.push({ id: 'clube', label: t('games.gangues.cena.clube_botao'), variante: 'link', onClick: () => setVerClube(true) })
        }

        return (
          <GanguesDialogoEncontro retrato={retrato} nome={nome} sub={sub} falas={falas} escolhas={escolhas} onClose={onClose} fecharLabel={fecharLabel}>
            {divida > 0 && (
              <div className="gang-cena-fiado-caderneta">
                {pgto?.ok ? (
                  <p className="gang-cena-fiado-linha">
                    {t(pgto.restante > 0
                      ? 'games.gangues.cena.fiado_pago_parcial'
                      : 'games.gangues.cena.fiado_pago_total', { pago: pgto.pago, restante: pgto.restante, agiota: nome })}
                  </p>
                ) : (
                  <p className="gang-cena-fiado-linha">{t('games.gangues.cena.fiado_devendo', { divida, agiota: nome })}</p>
                )}
              </div>
            )}
            <GanguesAgiotaTutorial />
          </GanguesDialogoEncontro>
        )
      }}
    </GanguesAgiotagem>
  )
}
