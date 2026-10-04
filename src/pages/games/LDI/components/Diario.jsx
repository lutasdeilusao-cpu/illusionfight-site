import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { veiaPorId, romano } from '../data/veias'

// Gaveta com a Veia e o nível, as pistas e tudo que o jogador escolheu,
// separado por ato.
export default function Diario({ t, save, onFechar }) {
  const veia = veiaPorId(save.veia)
  const atos = [...new Set(save.diario.map(d => d.ato))]
  return createPortal(
    <motion.div className="ld-diario" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onFechar}>
      <motion.aside className="ld-diario__painel" initial={{ x: 40 }} animate={{ x: 0 }} onClick={e => e.stopPropagation()}>
        <header className="ld-diario__topo">
          <h2>{t('games.ldi.diario.titulo')}</h2>
          <button type="button" className="ld-diario__fechar" onClick={onFechar}>{t('games.ldi.diario.fechar')}</button>
        </header>

        <p className="if-eyebrow">{t('games.ldi.veia_termo')} <small>{t('games.ldi.veia_explica')}</small></p>
        {veia ? (
          <div className="ld-diario__veia" style={{ '--veia-cor': veia.cor }}>
            <span className="ld-diario__veia-icone">{veia.icone}</span>
            <div>
              <b>{t(`games.ldi.veias.${veia.id}.nome`)} {romano(save.nivel)}</b>
              <small>{t(`games.ldi.niveis.${save.nivel}.nome`)} ({t(`games.ldi.niveis.${save.nivel}.explica`)})</small>
            </div>
            <ol className="ld-diario__trilha">
              {[1, 2, 3, 4, 5].map(n => <li key={n} className={n <= save.nivel ? 'is-on' : ''}>{romano(n)}</li>)}
            </ol>
          </div>
        ) : <p className="ld-diario__vazio">{t('games.ldi.lobby.sem_veia')}</p>}

        {save.pistas.length > 0 && (
          <>
            <p className="if-eyebrow">{t('games.ldi.diario.pistas')}</p>
            <ul className="ld-diario__pistas">{save.pistas.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </>
        )}

        <p className="if-eyebrow">{t('games.ldi.diario.escolhas')}</p>
        {!save.diario.length && <p className="ld-diario__vazio">{t('games.ldi.diario.vazio')}</p>}
        {atos.map(a => (
          <section key={a} className="ld-diario__ato">
            <h3>{t('games.ldi.jogo.ato', { n: romano(a) })}</h3>
            <ol>
              {save.diario.filter(d => d.ato === a).map((d, i) => (
                <li key={i}><small>{d.cena}</small><span>{d.escolha}</span></li>
              ))}
            </ol>
          </section>
        ))}
      </motion.aside>
    </motion.div>,
    document.body,
  )
}
