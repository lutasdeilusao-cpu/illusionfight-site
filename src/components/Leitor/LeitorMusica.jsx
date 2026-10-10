import { useLanguage } from '../../context/LanguageContext'
import { useRadio } from '../RadioNina/RadioNinaContext'
import musicas from '../../data/musicas.json'
import './LeitorMusica.css'

/* Música dentro do texto de um capítulo.

   Letra — bloco de código com a linguagem "letra":
     ```letra
     KIM: Só existe uma regra na briga de rua
     KIM E JACK: Só existe uma regra na briga de rua...
     > Jack grita: — Kim, sua vez!
     ```
   Cada linha "NOME: verso" ganha a cor de quem canta (Kim, Jack, Nina,
   TODOS). Linha que começa com ">" é rubrica: o que acontece no palco.
   Linha em branco separa estrofes.

   Rádio Nina — link "/radio-nina/<id da música em musicas.json>": abre o
   convite da Nina; se a pessoa aceitar, a música toca pelo tocador do site. */

const VOZES = { KIM: 'kim', JACK: 'jack', NINA: 'nina', TODOS: 'todos' }

function vozDe(nome) {
  const partes = nome.split(/\s+E\s+|,\s*/).map(p => VOZES[p.trim()]).filter(Boolean)
  if (!partes.length) return 'todos'
  return partes.length > 1 ? 'todos' : partes[0]
}

export function LetraMusica({ texto }) {
  const estrofes = texto.trim().split(/\n\s*\n/)
  return (
    <div className="leitor-letra" role="group">
      {estrofes.map((estrofe, i) => (
        <div key={i} className="leitor-letra__estrofe">
          {estrofe.split('\n').map((linha, j) => {
            const l = linha.trim()
            if (!l) return null
            if (l.startsWith('>')) {
              return <p key={j} className="leitor-letra__rubrica">{l.slice(1).trim()}</p>
            }
            const m = l.match(/^([A-ZÀ-Ú ,]+):\s*(.+)$/)
            if (!m) return <p key={j} className="leitor-letra__verso">{l}</p>
            return (
              <p key={j} className={`leitor-letra__verso leitor-letra__verso--${vozDe(m[1].trim())}`}>
                <span className="leitor-letra__quem">{m[1].trim()}</span>
                <span className="leitor-letra__canto">{m[2]}</span>
              </p>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function RadioNinaLink({ id, children }) {
  const { t } = useLanguage()
  const { tocarKey, travaDe } = useRadio()
  const musica = musicas.find(m => m.id === id)
  const arquivo = musica?.arquivo
  const trava = arquivo ? travaDe(arquivo) : null

  function abrir() {
    if (!arquivo || trava) return
    window.__ninaPendingNotification = {
      mensagem: t('pages.leitor.radio_convite', { musica: musica.titulo }),
      sim: t('pages.leitor.radio_sim'),
      nao: t('pages.leitor.radio_nao'),
    }
    window.__ninaNotificationCb?.(sim => {
      window.__ninaPendingNotification = null
      if (sim) tocarKey(arquivo)
    })
    window.__ninaMostrarAgora?.()
  }

  if (!musica) return <span>{children}</span>
  return (
    <button type="button" className={`leitor-radio${trava ? ' is-travada' : ''}`} onClick={abrir} disabled={!arquivo}>
      <span className="leitor-radio__icone" aria-hidden="true">{trava ? '🔒' : '▶'}</span>
      <span className="leitor-radio__texto">
        <strong>{children}</strong>
        <small>{trava ? t('pages.leitor.radio_trava', { data: trava.liberaEm }) : t('pages.leitor.radio_ouvir')}</small>
      </span>
    </button>
  )
}
