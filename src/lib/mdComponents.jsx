import { Link } from 'react-router-dom'

/**
 * Componentes customizados pro ReactMarkdown dos leitores (livro e contos).
 * Links internos (começam com "/") viram <Link> do React Router — navegação
 * client-side, sem recarregar a página. Usado pras citações cruzadas entre os
 * contos e a linha principal.
 */
export const readerMdComponents = {
  a({ href = '', children }) {
    if (href.startsWith('/')) {
      return <Link to={href}>{children}</Link>
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  },
}
