import { useEffect, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { trackEvent } from '../../../../lib/analytics'
import {
  REACOES, contarReacoes, reacaoLocal, reagir, sincronizarPendente,
} from '../../../../lib/webshard/reacoes'
import './Reacoes.css'

/** Um toque, anônimo, no fim do capítulo. Trocar de ideia é só tocar em
 *  outra. "Parabéns, vou compartilhar" já abre o compartilhar. Admin vê os
 *  totais embaixo de cada uma — o público não (sem efeito manada). */
export default function Reacoes({ titulo, capitulo, idioma, isAdmin, onCompartilhar }) {
  const { t } = useLanguage()
  const [escolhida, setEscolhida] = useState(() => reacaoLocal(titulo, capitulo)?.reacao || null)
  const [totais, setTotais] = useState(null)

  useEffect(() => {
    setEscolhida(reacaoLocal(titulo, capitulo)?.reacao || null)
    sincronizarPendente(titulo, capitulo)
  }, [titulo, capitulo])

  useEffect(() => {
    if (!isAdmin) return
    let vivo = true
    contarReacoes(titulo, capitulo).then(r => { if (vivo) setTotais(r) })
    return () => { vivo = false }
  }, [isAdmin, titulo, capitulo, escolhida])

  const escolher = async id => {
    const anterior = escolhida
    setEscolhida(id)
    trackEvent('webshard_reacao', { titulo, capitulo, reacao: id, trocou: Boolean(anterior && anterior !== id) })
    if (id === 'parabens') onCompartilhar?.()
    await reagir({ titulo, capitulo, reacao: id, idioma })
    if (isAdmin) setTotais(await contarReacoes(titulo, capitulo))
  }

  return (
    <section className="ws-reacoes" aria-labelledby="ws-reacoes-titulo">
      <h2 id="ws-reacoes-titulo" className="ws-reacoes__titulo">{t('webShard.reacoes.titulo')}</h2>
      <p className="ws-reacoes__hint">
        {escolhida ? t('webShard.reacoes.obrigado') : t('webShard.reacoes.hint')}
      </p>
      <div className={`ws-reacoes__grade${escolhida ? ' tem-escolha' : ''}`}>
        {REACOES.map(r => (
          <button
            key={r.id}
            type="button"
            className={`ws-reacao ws-reacao--${r.id}${escolhida === r.id ? ' is-active' : ''}`}
            onClick={() => escolher(r.id)}
            aria-pressed={escolhida === r.id}
          >
            <span className="ws-reacao__icone" aria-hidden="true">{r.icone}</span>
            <span className="ws-reacao__rotulo">{t(`webShard.reacoes.${r.id}`)}</span>
            {isAdmin && totais && (
              <span className="ws-reacao__total">{totais[r.id] || 0}</span>
            )}
          </button>
        ))}
      </div>
      {isAdmin && (
        <p className="ws-reacoes__admin">
          {totais
            ? t('webShard.reacoes.admin_total', { n: Object.values(totais).reduce((a, b) => a + b, 0) })
            : t('webShard.reacoes.admin_indisponivel')}
        </p>
      )}
    </section>
  )
}
