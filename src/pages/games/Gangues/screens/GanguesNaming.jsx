import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useGanguesStore } from '../store/useGanguesStore'
import { sfx } from '../../../../lib/sfx'
import GangDialog from '../components/GangDialog'
import { getGanguesNpcPortrait } from '../data/ganguesNpcPortraits.js'
import logoPt from '../assets/logos/logo-pt.png'
import logoEn from '../assets/logos/logo-en.png'
import logoEs from '../assets/logos/logo-es.png'
import './GanguesModes.css'
import './GanguesStory.css' // .gang-lobby-quit (botão de sair) mora lá
import './GanguesNaming.css'

/* ══════════════════════════════════════════════════════════════
   BATIZAR A GANGUE — primeira coisa ao entrar no jogo.
   Os personagens importam, mas é o nome da gangue que reverbera:
   é ele que os inimigos vão falar, é ele que domina Marelia.

   Reconstruída de verdade (pedido do Isaias, 14/09/2026 — a 1ª tentativa
   só trocou o fundo da página e deixou o painel inteiro intocado: caixa
   de logo em texto, moldura âmbar genérica, botão padrão — "reaproveitando
   tudo de antes", rejeitada com razão). Agora usa a MESMA identidade das
   outras telas novas: logo oficial (PNG por idioma, como em
   GanguesSaveSelect), painel de cartaz rasgado/colado na parede (cantos
   de fita, borda irregular), título em fonte de pichação, e o CTA no
   mesmo desenho "spray-paint" (halo de neblina de tinta) do resto do jogo.
   ══════════════════════════════════════════════════════════════ */

const LOGOS = { pt: logoPt, en: logoEn, es: logoEs }

export default function GanguesNaming({ onDone, modoEdicao = false, onSair }) {
  const { t, locale } = useLanguage()
  const store = useGanguesStore()
  const [nome, setNome] = useState(store.gangName || '')
  const [intro, setIntro] = useState(!modoEdicao)
  const fecharIntro = () => setIntro(false)

  const limpo = nome.replace(/\s+/g, ' ').trim()
  const valido = limpo.length >= 2

  const confirmar = () => {
    if (!valido) { sfx.cancel(); return }
    sfx.select?.()
    store.setGangName(limpo)
    onDone()
  }

  return (
    <main className="gang-lobby gang-modes gang-naming gang-brickwall-bg">
      <AnimatePresence>
        {intro && (
          <GangDialog
            lines={t('games.gangues.naming.abertura')}
            speaker={t('games.gangues.dialogo.veio_nome')}
            sub={t('games.gangues.dialogo.veio_sub')}
            retrato={getGanguesNpcPortrait('nego_veio')}
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

      <motion.div className="gang-naming-poster" initial={{ opacity: 0, y: 22, rotate: -1.5 }} animate={{ opacity: 1, y: 0, rotate: -1.5 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
        <span className="gang-naming-poster__fita gang-naming-poster__fita--esq" aria-hidden="true" />
        <span className="gang-naming-poster__fita gang-naming-poster__fita--dir" aria-hidden="true" />
        <img className="gang-naming-poster__logo" src={LOGOS[locale] || logoPt} alt="LDI Gangues" />
        <h1 className="gang-naming-poster__titulo">
          {modoEdicao ? t('games.gangues.naming.titulo_editar') : t('games.gangues.naming.titulo')}
        </h1>
        <p className="gang-naming-poster__pitch">{t('games.gangues.naming.poster_pitch')}</p>

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
        </motion.div>

        <button className="gang-naming-spray" disabled={!valido} onClick={confirmar}>
          <span className="gang-naming-spray-halo" aria-hidden="true" />
          <strong>{modoEdicao ? t('games.gangues.naming.salvar') : t('games.gangues.naming.fundar')}</strong>
        </button>
      </motion.div>

      {/* Sem isso, a fundação da gangue não tinha NENHUMA saída visível —
          só aparece fora do modo de edição (que já tem seu próprio botão
          de voltar no header acima). */}
      {!modoEdicao && onSair && (
        <button className="gang-lobby-quit" onClick={onSair}>{t('games.gangues.sair_do_jogo')}</button>
      )}
    </main>
  )
}
