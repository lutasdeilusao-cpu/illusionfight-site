import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { veiaPorId } from '../data/veias'
import { habilidadePorId } from '../data/habilidades'

// Cartões de escolha. Escolha com `decisao` pede confirmação em tela cheia
// antes de valer; escolha trancada mostra a Veia e o nível que abririam.
export default function Escolhas({ t, escolhas, veiaJogador, onEscolher }) {
  const [pendente, setPendente] = useState(null)

  const tocar = ch => {
    if (!ch.disponivel) return
    if (ch.decisao) setPendente(ch)
    else onEscolher(ch)
  }

  return (
    <>
      <p className="if-eyebrow ld-escolhas__titulo">{t('games.ldi.jogo.decidir')}</p>
      <ol className="ld-escolhas if-stagger">
        {escolhas.map((ch, i) => <Cartao key={ch.id} t={t} ch={ch} i={i} veiaJogador={veiaJogador} onClick={() => tocar(ch)} />)}
      </ol>
      {createPortal(
        <AnimatePresence>
          {pendente && (
            <Decisao t={t} ch={pendente}
              onConfirmar={() => { const ch = pendente; setPendente(null); onEscolher(ch) }}
              onVoltar={() => setPendente(null)} />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}

function Cartao({ t, ch, i, veiaJogador, onClick }) {
  const veia = veiaPorId(ch.veia || habilidadePorId(ch.motivo)?.veia)
  const classes = ['ld-escolha', !ch.disponivel && 'is-trancada', ch.veia && 'is-veia', ch.decisao && 'is-decisao'].filter(Boolean).join(' ')
  return (
    <li>
      <button type="button" className={classes} onClick={onClick} disabled={!ch.disponivel}
        style={veia ? { '--veia-cor': veia.cor } : undefined}>
        <span className="ld-escolha__n">{String(i + 1).padStart(2, '0')}</span>
        <span className="ld-escolha__corpo">
          {ch.veia && <span className="ld-escolha__veia">{veia.icone} {t(`games.ldi.veias.${ch.veia}.nome`)} · {t(`games.ldi.veias.${ch.veia}.area`)}</span>}
          <span className="ld-escolha__texto">{ch.label}</span>
          {ch.motivo && <Trava t={t} hab={ch.motivo} veiaJogador={veiaJogador} />}
        </span>
      </button>
    </li>
  )
}

// Porta trancada: o nome da habilidade e, se ela é da Veia do jogador, onde
// se aprende; se é de outra Veia, só dá pra abrir seguindo aquela Veia.
function Trava({ t, hab, veiaJogador }) {
  const h = habilidadePorId(hab)
  const daMinhaVeia = h?.veia === veiaJogador
  return (
    <>
      <span className="ld-escolha__requer">🔒 {t('games.ldi.jogo.requer', { hab: t(`games.ldi.habilidades.${hab}.nome`) })}</span>
      <span className="ld-escolha__dica">
        {daMinhaVeia ? t(`games.ldi.habilidades.${hab}.onde`) : t('games.ldi.jogo.requer_outra', { veia: t(`games.ldi.veias.${h?.veia}.nome`) })}
      </span>
    </>
  )
}

function Decisao({ t, ch, onConfirmar, onVoltar }) {
  const veia = veiaPorId(ch.veia)
  return (
    <motion.div className="ld-decisao" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={veia ? { '--veia-cor': veia.cor } : undefined}>
      <motion.div className="ld-decisao__card" initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }}>
        <p className="if-eyebrow">{t('games.ldi.decisao.eyebrow')}</p>
        {veia && (
          <>
            <span className="ld-decisao__icone">{veia.icone}</span>
            <h2 className="ld-decisao__veia">{t(`games.ldi.veias.${ch.veia}.nome`)}</h2>
            <p className="ld-decisao__area">{t(`games.ldi.veias.${ch.veia}.area`)}</p>
            <p className="ld-decisao__desc">{t(`games.ldi.veias.${ch.veia}.desc`)}</p>
          </>
        )}
        <p className="ld-decisao__escolha">“{ch.label}”</p>
        <p className="ld-decisao__aviso">{t('games.ldi.decisao.aviso')}</p>
        <button type="button" className="if-btn ld-decisao__ok" onClick={onConfirmar}>{t('games.ldi.decisao.confirmar')}</button>
        <button type="button" className="ld-decisao__voltar" onClick={onVoltar}>{t('games.ldi.decisao.voltar')}</button>
      </motion.div>
    </motion.div>
  )
}
