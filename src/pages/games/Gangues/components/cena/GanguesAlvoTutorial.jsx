import { useLanguage } from '../../../../../context/LanguageContext'
import { useTutorialProgress } from '../../../../../context/TutorialProgressContext'
import GangTip from '../GangTip'

// Explica o farol de status dos alvos na rua em 2 momentos bem separados
// (pedido do Isaias, 13/09/2026 — quer tutorial PROGRESSIVO, cada coisa
// explicada só quando ela realmente importa, não tudo de uma vez no início):
//  - "farol" na 1ª vez que o jogador vê a rua com algum alvo disponível —
//    explica vermelho (obrigatório) e amarelo (opcional);
//  - "feito" só quando o PRIMEIRO alvo vira verde de verdade (resolvido OU
//    farmável — ver `farolDe()` em GanguesCenaAtores.jsx) — explica que
//    treta repetível continua batível à vontade mesmo já "feita".
// v2 (13/09/2026): trocado de verde=alvo/azul=farmável pro farol
// vermelho/amarelo/verde (pedido do Isaias — "farol" é mais representativo
// e universal, não precisa de tutorial pra decorar o que cada cor quer
// dizer) — id novo de propósito pra reexibir pra quem só viu a versão
// antiga, já que o SIGNIFICADO das cores mudou, não só o texto.
// Escopado por CONTA (TutorialProgressContext), não mais por save/aparelho —
// pedido do Isaias (14/09/2026).
const TUTORIAL_FAROL = 'alvo_farol_v2'
const TUTORIAL_FEITO = 'alvo_feito_v2'

/** `alvos`: os alvos atuais da cena (amb.alvos). Quem monta decide QUANDO
 *  faz sentido (rua, sem intro/fade/encontro cobrindo a tela) — este
 *  componente só decide QUAL dos 2 avisos (se algum) mostrar. */
export default function GanguesAlvoTutorial({ alvos }) {
  const { t } = useLanguage()
  const { jaViu, marcarVisto, carregado } = useTutorialProgress()

  if (!carregado || !alvos?.length) return null

  if (!jaViu(TUTORIAL_FAROL)) {
    const fechar = () => marcarVisto(TUTORIAL_FAROL)
    return <GangTip text={t('games.gangues.alvo_tutorial.farol')} side="right" isLast onNext={fechar} onSkip={fechar} />
  }

  if (!jaViu(TUTORIAL_FEITO) && alvos.some(a => a.estado === 'resolvido' || a.farmCompleto)) {
    const fechar = () => marcarVisto(TUTORIAL_FEITO)
    return <GangTip text={t('games.gangues.alvo_tutorial.feito')} side="left" isLast onNext={fechar} onSkip={fechar} />
  }

  return null
}
