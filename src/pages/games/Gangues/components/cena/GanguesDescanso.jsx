import { useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { sfx } from '../../../../../lib/sfx'

/* Encontro DESCANSO — a birosca. Restaura o PV/PM de TODA a tropa gastando
   grana e mostra quanto cada personagem recuperou. Repetível.

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

  const custo = poi.custoGrana || 10
  const semGrana = store.grana < custo
  const { divida, fiados } = store.storyProgress.__birosca || { divida: 0, fiados: 0 }
  const podeFiar = fiados < 2
  const aPagar = Math.min(store.grana, divida)
  // Beco sem saída: 2 fiados, dívida aberta, tropa toda no chão e sem grana pra
  // pagar. O Nato oferece o Clube da Luta (o 3º fiado, 15×, que já enfia o cara
  // na roda). É a única saída.
  const clube = !contrato && !res?.ok && Boolean(onClube) && store.clubeDaLutaElegivel()

  const descansar = () => {
    const r = store.descansarTropa(custo)
    setRes(r)
    r.ok ? sfx.reward?.() : sfx.cancel()
  }
  const fiar = () => {
    const r = store.fiarDescanso(custo)
    if (!r.ok) { setRes({ ok: false, motivo: r.motivo }); sfx.cancel(); return }
    setContrato(r)
    sfx.reward?.()
  }
  const pagar = () => {
    const r = store.pagarBirosca()
    setPgto(r)
    r.ok ? sfx.reward?.() : sfx.cancel()
  }

  const listaCura = (detalhe) => (
    <ul className="gang-cena-descanso-lista">
      {detalhe.map(d => (
        <li key={d.id}>
          <strong>{d.nome}</strong>
          <span>
            {d.pv > 0 && <em className="is-pv">+{d.pv} PV</em>}
            {d.pm > 0 && <em className="is-pm">+{d.pm} PM</em>}
          </span>
        </li>
      ))}
    </ul>
  )

  // ── O Nato oferece o Clube da Luta (beco sem saída) ──
  if (clube) {
    return (
      <div className="gang-cena-enc gang-cena-enc--descanso gang-cena-enc--clube">
        <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
        <span className="gang-cena-eyebrow">{t('games.gangues.cena.clube_oferta_tag')}</span>
        <h3 className="gang-cena-enc-titulo">{t(`${poi.i18n}.nome`)}</h3>
        <p className="gang-cena-enc-intro">{t('games.gangues.cena.clube_oferta')}</p>
        <div className="gang-cena-fiado-caderneta">
          <p className="gang-cena-fiado-linha">{t('games.gangues.cena.fiado_devendo', { divida })}</p>
        </div>
        <div className="gang-cena-enc-acoes">
          <button className="gang-cena-btn" onClick={onClose}>{t('games.gangues.cena.clube_recusar')}</button>
          <button className="gang-cena-btn gang-cena-btn--go" onClick={() => onClube(custo)}>{t('games.gangues.cena.clube_aceitar')}</button>
        </div>
      </div>
    )
  }

  // ── Tela do contrato (depois de aceitar o fiado) ──
  if (contrato) {
    return (
      <div className="gang-cena-enc gang-cena-enc--descanso gang-cena-enc--fiado">
        <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
        <span className="gang-cena-eyebrow">{t('games.gangues.cena.fiado_contrato_tag')}</span>
        <h3 className="gang-cena-enc-titulo">{t(`${poi.i18n}.nome`)}</h3>
        <p className="gang-cena-enc-desfecho">
          {t('games.gangues.cena.fiado_contrato', { valor: contrato.valor, divida: contrato.divida })}
        </p>
        {listaCura(contrato.detalhe)}
        <div className="gang-cena-enc-acoes">
          <button className="gang-cena-btn gang-cena-btn--go" onClick={onClose}>{t('games.gangues.cena.fechar')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="gang-cena-enc gang-cena-enc--descanso">
      <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
      <span className="gang-cena-eyebrow">{t('games.gangues.cena.tipo.descanso')}</span>
      <h3 className="gang-cena-enc-titulo">{t(`${poi.i18n}.nome`)}</h3>
      <p className="gang-cena-enc-sub">{t(`${poi.i18n}.sub`)}</p>

      {res?.ok ? (
        <>
          <p className="gang-cena-enc-desfecho">{t('games.gangues.cena.descanso_titulo')}</p>
          {listaCura(res.detalhe)}
        </>
      ) : (
        <p className="gang-cena-enc-intro">
          {res?.motivo === 'inteira'
            ? t('games.gangues.cena.descanso_ja_inteira')
            : res?.motivo === 'sujo'
              ? t('games.gangues.cena.fiado_nome_sujo')
              : (res?.motivo === 'grana' || (semGrana && !podeFiar))
                ? t('games.gangues.cena.descanso_sem_grana')
                : t(`${poi.i18n}.intro`)}
        </p>
      )}

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

      <div className="gang-cena-enc-acoes">
        <button className="gang-cena-btn" onClick={onClose}>{t('games.gangues.cena.fechar')}</button>
        {divida > 0 && !pgto?.ok && aPagar > 0 && (
          <button className="gang-cena-btn" onClick={pagar}>
            {t('games.gangues.cena.fiado_pagar', { grana: aPagar })}
          </button>
        )}
        {!res?.ok && !contrato && (
          <>
            {!semGrana && (
              <button className="gang-cena-btn gang-cena-btn--go" onClick={descansar}>
                {t('games.gangues.cena.descanso_curar', { grana: custo })}
              </button>
            )}
            {podeFiar && (
              <button className={`gang-cena-btn${semGrana ? ' gang-cena-btn--go' : ''}`} onClick={fiar}>
                {t('games.gangues.cena.fiado_pedir')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
