import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import NeoGuideFala from './NeoGuideFala'
import { INTERESSES } from '../data/creatorsCardapio'
import './CreatorsBoasVindas.css'

const REGRAS = ['liberdade', 'trechos', 'completo', 'artes', 'pessoal', 'prazo']

/** Primeira visita: termos do programa e, depois, o que a pessoa curte. */
export default function CreatorsBoasVindas({ nome, aceitouTermos, interessesIniciais, salvando, onAceitar, onInteresses }) {
  const { t } = useLanguage()
  const [escolhidos, setEscolhidos] = useState(interessesIniciais)

  function alternar(id) {
    setEscolhidos(lista => (lista.includes(id) ? lista.filter(x => x !== id) : [...lista, id]))
  }

  if (!aceitouTermos) {
    return (
      <section className="cr-bv">
        <NeoGuideFala nome={t('creators.neoguide.nome')} texto={t('creators.termos.fala', { nome })} />
        <div className="cr-bv__termos if-panel">
          <span className="if-eyebrow">{t('creators.termos.eyebrow')}</span>
          <ol className="cr-bv__regras">
            {REGRAS.map((id, i) => (
              <li key={id} className={`cr-bv__regra${id === 'completo' ? ' is-destaque' : ''}`}>
                <span className="cr-bv__num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{t(`creators.termos.regras.${id}.titulo`)}</strong>
                  <p>{t(`creators.termos.regras.${id}.texto`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="cr-bv__acao">
          <button type="button" className="if-btn if-btn--primary cr-bv__btn" disabled={salvando} onClick={onAceitar}>
            {t('creators.termos.aceitar')}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="cr-bv">
      <NeoGuideFala nome={t('creators.neoguide.nome')} texto={t('creators.interesses.fala')} />
      <div className="cr-bv__chips if-stagger">
        {INTERESSES.map(id => (
          <button
            key={id}
            type="button"
            className={`cr-bv__chip${escolhidos.includes(id) ? ' is-ativo' : ''}`}
            aria-pressed={escolhidos.includes(id)}
            onClick={() => alternar(id)}
          >
            <span className="cr-bv__chip-icone" aria-hidden="true">{t(`creators.interesses.itens.${id}.icone`)}</span>
            <span>{t(`creators.interesses.itens.${id}.nome`)}</span>
          </button>
        ))}
      </div>
      <div className="cr-bv__acao">
        <button type="button" className="if-btn if-btn--primary cr-bv__btn" disabled={salvando || escolhidos.length === 0} onClick={() => onInteresses(escolhidos)}>
          {t('creators.interesses.continuar')}
        </button>
      </div>
    </section>
  )
}
