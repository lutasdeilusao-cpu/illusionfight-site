import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { sfx } from '../../../lib/sfx'
import GangDialog from './components/GangDialog'
import './GanguesModes.css'

const INTRO_KEY = 'ldi-gangues-naming-intro'

/* ══════════════════════════════════════════════════════════════
   BATIZAR A GANGUE — primeira coisa ao entrar no jogo.
   Os personagens importam, mas é o nome da gangue que reverbera:
   é ele que os inimigos vão falar, é ele que domina Marelia.
   ══════════════════════════════════════════════════════════════ */

const SUGESTOES = ['bonde', 'firma', 'trilha', 'sindicato', 'quebrada']

export default function GanguesNaming({ onDone, modoEdicao = false }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [nome, setNome] = useState(store.gangName || '')
  const [intro, setIntro] = useState(() => {
    if (modoEdicao) return false
    try { return !localStorage.getItem(INTRO_KEY) } catch { return true }
  })
  const fecharIntro = () => {
    try { localStorage.setItem(INTRO_KEY, '1') } catch { /* ignora */ }
    setIntro(false)
  }

  const limpo = nome.replace(/\s+/g, ' ').trim()
  const valido = limpo.length >= 2

  const confirmar = () => {
    if (!valido) { sfx.cancel(); return }
    sfx.select?.()
    store.setGangName(limpo)
    onDone()
  }

  return (
    <main className="gang-lobby gang-modes gang-naming">
      <AnimatePresence>
        {intro && (
          <GangDialog
            lines={t('games.gangues.naming.abertura')}
            speaker={t('games.gangues.dialogo.veio_nome')}
            sub={t('games.gangues.dialogo.veio_sub')}
            onFinish={fecharIntro}
            onSkip={fecharIntro}
          />
        )}
      </AnimatePresence>

      {modoEdicao && (
        <header className="gang-story-head">
          <button className="gang-progression-screen-back" onClick={onDone}>
            ← {t('games.gangues.progression.back_to_roster')}
          </button>
        </header>
      )}

      <div className="gang-modes-titulo-wrap">
        <span className="if-eyebrow">IF // MARELIA</span>
        <h1 className="gang-modes-titulo">
          {modoEdicao ? t('games.gangues.naming.titulo_editar') : t('games.gangues.naming.titulo')}
        </h1>
        <p className="gang-naming-sub">{t('games.gangues.naming.sub')}</p>
      </div>

      <motion.div className="gang-naming-campo" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <label htmlFor="gang-nome-input">{t('games.gangues.naming.label')}</label>
        <input
          id="gang-nome-input"
          type="text"
          value={nome}
          maxLength={28}
          autoComplete="off"
          placeholder={t('games.gangues.naming.placeholder')}
          onChange={e => setNome(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') confirmar() }}
        />
        <span className="gang-naming-contador">{limpo.length}/28</span>

        <div className="gang-naming-sugestoes">
          <span>{t('games.gangues.naming.exemplos')}</span>
          {SUGESTOES.map(s => (
            <button key={s} type="button" className="gang-naming-chip" onClick={() => setNome(t(`games.gangues.naming.sugestao_${s}`))}>
              {t(`games.gangues.naming.sugestao_${s}`)}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="gang-naming-preview" aria-hidden={!valido}>
        {valido
          ? t('games.gangues.naming.preview', { nome: limpo })
          : t('games.gangues.naming.preview_vazio')}
      </div>

      <button className="gang-new-sheet gang-new-sheet--primary gang-naming-ok" disabled={!valido} onClick={confirmar}>
        {modoEdicao ? t('games.gangues.naming.salvar') : t('games.gangues.naming.fundar')}
      </button>
    </main>
  )
}
