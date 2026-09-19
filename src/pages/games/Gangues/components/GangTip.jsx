import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'
import { getGanguesNpcPortrait } from '../data/ganguesNpcPortraits.js'
import GanguesRetratoImg from './GanguesRetratoImg'

/* Dica de rua — componente ÚNICO usado por todo tutorial contextual do
   jogo (combate, KO, Multidão, descanso, alvo — ver os 6 arquivos que
   importam este aqui). Reescrito do zero (pedido do Isaias, 19/09/2026,
   print do tutorial de combate encostado no canto inferior direito, por
   cima da luta rolando ao fundo: "esse sistema de diálogo está muito
   ruim... parecem atualmente pop-up de propaganda atrapalhando o
   jogador... esses diálogos deveriam aparecer no meio, pausar o jogo").
   Antes era um balão pequeno ancorado num canto (`side: 'left'|'right'`),
   SEM fundo/scrim — o jogo continuava visível e clicável por baixo,
   sem nenhuma sensação de pausa, fácil de confundir com um anúncio.
   Agora é um overlay de tela cheia (mesmo padrão visual/estrutural do
   balão do GangDialog e do GanguesCombatSairConfirm): scrim escurece e
   BLOQUEIA clique no que está atrás (pausa de verdade, não só visual),
   card centralizado, e o botão de pular é o MESMO `.gang-dlg-skip`
   (não um botãozinho próprio) — mesma cara em qualquer tela do jogo que
   pergunta "quer pular isso?". `side` não existe mais (não faz sentido
   pra um card centralizado) — mantido como parâmetro aceito e ignorado
   só pra não quebrar quem ainda passa essa prop.
   Continua via PORTAL pro <body> pelo mesmo motivo de antes: monta como
   filho de telas com Framer Motion por perto, e um `position:fixed`
   preso num stacking context errado ficava atrás do backdrop de outro
   modal (achado com os tutoriais do descanso/clube, 13/09/2026). */
export default function GangTip({ text, isLast, nextLabel, onNext, onSkip }) {
  const { t } = useLanguage()
  const advance = () => { sfx.click(); onNext?.() }
  const skip = (event) => { event.stopPropagation(); sfx.click(); onSkip?.() }

  return createPortal(
    <motion.div
      className="gang-tip-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={advance}
    >
      <div className="gang-tip-card" onClick={event => event.stopPropagation()}>
        {/* Pedido do Isaias (19/09/2026): "coloque a cabeça do Nego Véio
            nesses diálogos tutorial" — a dica de rua é a voz DELE (o dono
            da birosca, guia do jogador), mesma cara animada usada no
            GangDialog, só menor. */}
        <span className="gang-tip-portrait">
          <GanguesRetratoImg src={getGanguesNpcPortrait('nego_veio')} fallback={<b aria-hidden="true">N</b>} />
        </span>
        <p className="gang-tip-text">{text}</p>
        <button className="gang-tip-next" onClick={advance}>
          {nextLabel || (isLast ? t('games.gangues.dialogo.fechar') : t('games.gangues.dialogo.proximo'))}
        </button>
      </div>
      <button className="gang-dlg-skip" onClick={skip}>{t('games.gangues.dialogo.pular')}</button>
    </motion.div>,
    document.body
  )
}
