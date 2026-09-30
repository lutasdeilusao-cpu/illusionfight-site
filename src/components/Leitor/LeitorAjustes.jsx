import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useLanguage } from '../../context/LanguageContext'
import { FONTES, ESPACOS, TAMANHO_MIN, TAMANHO_MAX } from './useLeitorPreferencias'
import './LeitorAjustes.css'

/** Painel de ajustes de leitura (gaveta de baixo): tamanho, fonte e
 *  espaçamento. Mostra a prévia no próprio texto — muda na hora. */
export default function LeitorAjustes({ aberto, onFechar, prefs }) {
  const { t } = useLanguage()
  return createPortal(
    <AnimatePresence>
      {aberto && (
        <motion.div className="leitor-ajustes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" className="leitor-ajustes__fundo" onClick={onFechar} aria-label={t('pages.leitor.fechar')} />
          <motion.div className="leitor-ajustes__gaveta" role="dialog" aria-label={t('pages.leitor.ajustes')}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 420, damping: 38 }}>
            <div className="leitor-ajustes__topo">
              <span className="leitor-ajustes__eyebrow">{t('pages.leitor.ajustes')}</span>
              <button type="button" className="leitor-ajustes__x" onClick={onFechar} aria-label={t('pages.leitor.fechar')}>×</button>
            </div>

            <div className="leitor-ajustes__linha">
              <span className="leitor-ajustes__rotulo">{t('pages.leitor.tamanho')}</span>
              <div className="leitor-ajustes__passo">
                <button type="button" onClick={prefs.menor} disabled={prefs.tamanho <= TAMANHO_MIN}>A−</button>
                <b>{prefs.tamanho}</b>
                <button type="button" onClick={prefs.maior} disabled={prefs.tamanho >= TAMANHO_MAX}>A+</button>
              </div>
            </div>

            <div className="leitor-ajustes__linha">
              <span className="leitor-ajustes__rotulo">{t('pages.leitor.fonte')}</span>
              <div className="leitor-ajustes__opcoes">
                {FONTES.map(f => (
                  <button key={f} type="button" className={`leitor-ajustes__opcao leitor-ajustes__opcao--${f}${prefs.fonte === f ? ' is-ativa' : ''}`} onClick={() => prefs.setFonte(f)} aria-pressed={prefs.fonte === f}>
                    {t(`pages.leitor.fonte_${f}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="leitor-ajustes__linha">
              <span className="leitor-ajustes__rotulo">{t('pages.leitor.espaco')}</span>
              <div className="leitor-ajustes__opcoes">
                {ESPACOS.map(e => (
                  <button key={e} type="button" className={`leitor-ajustes__opcao${prefs.espaco === e ? ' is-ativa' : ''}`} onClick={() => prefs.setEspaco(e)} aria-pressed={prefs.espaco === e}>
                    {t(`pages.leitor.espaco_${e}`)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
