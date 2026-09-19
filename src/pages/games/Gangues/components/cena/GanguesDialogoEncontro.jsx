import { motion } from 'framer-motion'
import GanguesRetratoImg from '../GanguesRetratoImg'
import './GanguesDialogoEncontro.css'

/* ══════════════════════════════════════════════════════════════
   DIÁLOGO DE ENCONTRO — componente reutilizável e desacoplado pro "papo
   com um NPC da rua" (retrato + nome + fala + escolhas). Pedido do Isaias
   (19/09/2026, print da cara antiga do "papo", "A boca do sinal": "essa
   cena de diálogo era de outra era... vamos revisar tudo isso, o mais
   tema de gangues possível... e criar um componente reutilizável
   desacoplado, com CSS separado, seguindo as regras de componentização").

   Antes esse markup morava direto dentro de GanguesPapo.jsx (a MESMA
   estrutura repetida sempre que um novo tipo de encontro com NPC
   aparecesse). Agora é um componente PURO — só recebe dados e callbacks,
   não lê i18n nem store — pra poder ser reaproveitado por qualquer
   encontro futuro que precise de "NPC falando + escolhas" (GanguesPapo é
   o único uso hoje, mas o ponto é não precisar copiar/colar de novo).

   Visual puxado do MESMO vocabulário do GangDialog (retrato circular
   animado, balão com "rabicho" apontando pra cabeça) — a voz de rua da
   cena e a da cutscene inteira agora são a mesma linguagem, só num
   tamanho mais compacto (isso aqui abre no MEIO da exploração, não troca
   de tela). Cor de destaque = `cor` (o território atual, `--terr-cor`,
   por padrão) em vez do âmbar fixo do GangDialog — cada bairro mantém a
   cara própria.
   ══════════════════════════════════════════════════════════════ */
export default function GanguesDialogoEncontro({ retrato, nome, sub, falas = [], escolhas = [], onClose, fecharLabel = '✕' }) {
  return (
    <div className="gdlg-card">
      <button className="gdlg-close" onClick={onClose} aria-label={fecharLabel}>✕</button>

      <span className="gdlg-portrait">
        <span className="gdlg-portrait-face">
          <GanguesRetratoImg src={retrato} alt="" fallback={<b aria-hidden="true">{(nome || '?')[0]}</b>} />
        </span>
      </span>

      <div className="gdlg-bubble">
        <span className="gdlg-bubble-tail" aria-hidden="true" />
        <span className="gdlg-nome">
          {nome}
          {sub ? <em> · {sub}</em> : null}
        </span>

        {falas.map((linha, i) => (
          <motion.p
            key={i}
            className="gdlg-fala"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 * i }}
          >
            {linha}
          </motion.p>
        ))}

        {escolhas.length > 0 && (
          <div className="gdlg-escolhas">
            {escolhas.map(escolha => (
              <button
                key={escolha.id}
                type="button"
                className={`gdlg-btn${escolha.variante ? ` gdlg-btn--${escolha.variante}` : ''}`}
                onClick={escolha.onClick}
                disabled={escolha.disabled}
              >
                <span>{escolha.label}</span>
                {escolha.extra ? <em className="gdlg-btn-extra">{escolha.extra}</em> : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
