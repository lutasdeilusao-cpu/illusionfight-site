import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import './GateLeitura.css'

/** Gate de leitura: visitante sem conta lê até 85% de qualquer capítulo
 *  (WEB SHARD, livro, contos, obras) e o final pede conta grátis. */
export const GATE_FRACAO = 0.85

/** Quem precisa do gate: só visitante sem conta. */
export function useGateLeitura() {
  const { user } = useAuth()
  return !user
}

/** Corta uma lista (páginas) nos primeiros 85%. */
export function cortarLista(lista, ativo) {
  if (!ativo || lista.length < 2) return lista
  return lista.slice(0, Math.max(1, Math.floor(lista.length * GATE_FRACAO)))
}

/** Corta um texto markdown nos primeiros 85% dos blocos (parágrafos). */
export function cortarTexto(md, ativo) {
  if (!ativo || !md) return md
  const blocos = md.split(/\n\s*\n/)
  if (blocos.length < 2) return md
  return blocos.slice(0, Math.max(1, Math.floor(blocos.length * GATE_FRACAO))).join('\n\n')
}

export default function GateLeitura() {
  const { t } = useLanguage()
  return (
    <aside className="gate-leitura">
      <div className="gate-leitura__fade" aria-hidden="true" />
      <div className="gate-leitura__card">
        <span className="gate-leitura__eyebrow">{t('gate_leitura.eyebrow')}</span>
        <p className="gate-leitura__titulo">{t('gate_leitura.titulo')}</p>
        <p className="gate-leitura__texto">{t('gate_leitura.texto')}</p>
        <div className="gate-leitura__acoes">
          <Link to="/cadastro" className="if-btn if-btn--amber">{t('gate_leitura.criar')}</Link>
          <Link to="/login" className="if-btn if-btn--ghost">{t('gate_leitura.entrar')}</Link>
        </div>
      </div>
    </aside>
  )
}
