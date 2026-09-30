import { Children, isValidElement } from 'react'
import { Link } from 'react-router-dom'

/* Como o texto de um capítulo vira tela.
   • O "# CAPÍTULO N — Título" do topo do .md sai: o cabeçalho do leitor já
     mostra número e título (antes aparecia duas vezes).
   • "---" vira quebra de cena.
   • Parágrafo que é SÓ um nome em negrito maiúsculo (**KIM**, **JACK**) vira
     a marca de quem está falando — os contos narrados a dois usam isso.
   • Link interno ("/...") navega sem recarregar (citações entre contos e a
     linha principal); externo abre em aba nova. */

/** Tira o primeiro título "# ..." do começo do markdown. */
export function semTituloDoArquivo(md = '') {
  return md.replace(/^\s*#\s+[^\n]*\n+/, '')
}

function textoDe(no) {
  if (typeof no === 'string') return no
  if (Array.isArray(no)) return no.map(textoDe).join('')
  if (isValidElement(no)) return textoDe(no.props.children)
  return ''
}

// Nome de quem fala: 2 a 24 letras maiúsculas (com acento, espaço ou ponto).
const NOME_DE_FALA = /^[A-ZÀ-Ú][A-ZÀ-Ú .]{1,23}$/

export const leitorMarkdown = {
  h1: () => null,
  hr: () => <div className="leitor-cena" role="separator" aria-hidden="true"><i /><i /><i /></div>,
  p({ children }) {
    const filhos = Children.toArray(children)
    if (filhos.length === 1 && isValidElement(filhos[0]) && filhos[0].type === 'strong') {
      const nome = textoDe(filhos[0]).trim()
      if (NOME_DE_FALA.test(nome)) {
        return <p className={`leitor-fala leitor-fala--${nome.toLowerCase().replace(/[^a-z]/g, '')}`}><span>{nome}</span></p>
      }
    }
    return <p>{children}</p>
  },
  a({ href = '', children }) {
    if (href.startsWith('/')) return <Link to={href}>{children}</Link>
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  },
}
