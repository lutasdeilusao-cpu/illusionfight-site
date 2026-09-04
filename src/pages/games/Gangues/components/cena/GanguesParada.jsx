import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../../context/LanguageContext'
import { sfx } from '../../../../../lib/sfx'
import PuzzleForça from '../../../../../components/Puzzles/PuzzleForça'
import PuzzleStealthGrid from '../../../../../components/Puzzles/PuzzleStealthGrid'
import PuzzleDecoder from '../../../../../components/Puzzles/PuzzleDecoder'

/* Encontro de PUZZLE — atende PARADA (problema pra equipe resolver) e
   CORRE (tarefa da gangue: entrega/fuga). Base técnica é a lib
   Puzzles/ compartilhada; aqui entra a SKIN de gangue: a tela de
   contexto antes (a gazua é gazua, o stealth tem viatura) e o
   desfecho. Falhar numa parada pode cair numa treta. */

const PUZZLES = {
  forca: PuzzleForça,
  stealth: PuzzleStealthGrid,
  decoder: PuzzleDecoder,
}

export default function GanguesParada({ poi, onResolve, onClose }) {
  const { t } = useLanguage()
  const [fase, setFase] = useState('intro') // intro | jogo | fim
  const [ganhou, setGanhou] = useState(false)

  const base = poi.i18n
  const spec = poi.puzzle || {}
  const Puzzle = PUZZLES[spec.type] || PuzzleForça
  const ehCorre = poi.tipo === 'corre'

  const terminar = (ok) => {
    setGanhou(ok)
    setFase('fim')
    ok ? sfx.reward?.() : sfx.lose()
  }

  const sair = () => {
    if (ganhou) {
      onResolve({ ok: true, recompensa: poi.recompensa, revela: poi.revela })
    } else if (poi.falha?.viraTreta) {
      onResolve({ ok: false, viraTreta: poi.falha.viraTreta, revela: poi.revela })
    } else {
      onResolve({ ok: false, revela: poi.revela, folego: -12 })
    }
  }

  return (
    <div className={`gang-cena-enc gang-cena-enc--parada gang-cena-skin--${spec.skin || 'gen'}`}>
      {fase !== 'jogo' && (
        <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
      )}

      {fase === 'intro' && (
        <>
          <span className="gang-cena-eyebrow">{t(`games.gangues.cena.tipo.${poi.tipo}`)}</span>
          <h3 className="gang-cena-enc-titulo">{t(`${base}.nome`)}</h3>
          <p className="gang-cena-enc-sub">{t(`${base}.sub`)}</p>
          <p className="gang-cena-enc-intro">{t(`${base}.intro`)}</p>
          <div className="gang-cena-enc-acoes">
            <button className="gang-cena-btn" onClick={onClose}>{t('games.gangues.cena.parada_pular')}</button>
            <button className="gang-cena-btn gang-cena-btn--go" onClick={() => { sfx.select(); setFase('jogo') }}>
              {t('games.gangues.cena.parada_tentar')}
            </button>
          </div>
        </>
      )}

      {fase === 'jogo' && (
        <motion.div className="gang-cena-puzzle-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Puzzle config={spec.config || {}} onSolve={() => terminar(true)} onFail={() => terminar(false)} />
        </motion.div>
      )}

      {fase === 'fim' && (
        <>
          <span className={`gang-cena-enc-selo ${ganhou ? 'is-ok' : 'is-fail'}`}>{ganhou ? '✓' : '✕'}</span>
          <p className="gang-cena-enc-desfecho">
            {ganhou
              ? t(ehCorre ? 'games.gangues.cena.corre_ok' : 'games.gangues.cena.parada_ok')
              : poi.falha?.viraTreta
                ? t('games.gangues.cena.parada_falha')
                : t(ehCorre ? 'games.gangues.cena.corre_falha' : 'games.gangues.cena.parada_falha_leve')}
          </p>
          <button className="gang-cena-btn gang-cena-btn--go" onClick={sair}>{t('games.gangues.cena.fechar')}</button>
        </>
      )}
    </div>
  )
}
