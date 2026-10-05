import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { trackEvent } from '../../../lib/analytics'
import BotaoCopiar from './BotaoCopiar'
import { ARTES, DUVIDAS, FICHA } from '../data/creatorsCardapio'
import './CreatorsServicos.css'

/** Artes liberadas pro conteúdo do creator, com download direto. */
export function CreatorsArtes() {
  const { t } = useLanguage()
  return (
    <div className="cr-serv">
      <span className="if-eyebrow">{t('creators.artes.eyebrow')}</span>
      <p className="cr-serv__nota">{t('creators.artes.nota')}</p>
      <div className="cr-artes if-stagger">
        {ARTES.map(a => (
          <a
            key={a.id}
            className="cr-arte"
            href={a.arquivo}
            download={`illusion-fight-${a.id}.webp`}
            onClick={() => trackEvent('select_item', { component: 'creators_arte', item_id: a.id })}
          >
            <img src={a.arquivo} alt={t(`creators.artes.itens.${a.id}`)} loading="lazy" />
            <span className="cr-arte__rotulo">{t(`creators.artes.itens.${a.id}`)}</span>
            <span className="cr-arte__baixar">{t('creators.artes.baixar')} ↓</span>
          </a>
        ))}
      </div>
    </div>
  )
}

/** Ficha técnica: linhas prontas pra colar em descrição de vídeo e matéria. */
export function CreatorsFicha() {
  const { t } = useLanguage()
  const linhas = FICHA.map(id => ({ id, rotulo: t(`creators.ficha.itens.${id}.rotulo`), valor: t(`creators.ficha.itens.${id}.valor`) }))
  const tudo = linhas.map(l => `${l.rotulo}: ${l.valor}`).join('\n')
  return (
    <div className="cr-serv">
      <span className="if-eyebrow">{t('creators.ficha.eyebrow')}</span>
      <dl className="cr-ficha if-panel">
        {linhas.map(l => (
          <div key={l.id} className="cr-ficha__linha">
            <dt>{l.rotulo}</dt>
            <dd>{l.valor}</dd>
          </div>
        ))}
      </dl>
      <BotaoCopiar texto={tudo} rotulo={t('creators.ficha.copiar_tudo')} />
      <span className="if-eyebrow cr-serv__sub">{t('creators.ficha.descricao_titulo')}</span>
      <p className="cr-ficha__desc if-panel">{t('creators.ficha.descricao')}</p>
      <BotaoCopiar texto={t('creators.ficha.descricao')} />
    </div>
  )
}

/** Perguntas que a NeoGuide responde. */
export function CreatorsDuvidas() {
  const { t } = useLanguage()
  const [aberta, setAberta] = useState(null)
  return (
    <div className="cr-serv">
      <span className="if-eyebrow">{t('creators.duvidas.eyebrow')}</span>
      <div className="cr-duvidas">
        {DUVIDAS.map((id, i) => {
          const ativa = aberta === id
          return (
            <div key={id} className={`cr-duvida${ativa ? ' is-aberta' : ''}`}>
              <button type="button" className="cr-duvida__pergunta" aria-expanded={ativa} onClick={() => setAberta(ativa ? null : id)}>
                <span className="cr-duvida__num">{String(i + 1).padStart(2, '0')}</span>
                <span>{t(`creators.duvidas.itens.${id}.p`)}</span>
              </button>
              {ativa && <p className="cr-duvida__resposta">{t(`creators.duvidas.itens.${id}.r`)}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
