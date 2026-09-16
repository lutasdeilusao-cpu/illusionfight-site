import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { useAuth } from '../../../../context/AuthContext'
import { useGanguesStore } from '../store/useGanguesStore'
import { contarTerritoriosDominados, getGanguesSaveSlotLimit } from '../data/ganguesLoadout.js'
import { sfx } from '../../../../lib/sfx'
import logoPt from '../assets/logos/logo-pt.png'
import logoEn from '../assets/logos/logo-en.png'
import logoEs from '../assets/logos/logo-es.png'
import somImpacto from '../assets/sons/saves-impact.mp3'
import somTijolo from '../assets/sons/saves-tijolo.mp3'
import './GanguesStory.css' // .gang-lobby-quit (botão de sair) mora lá
import './GanguesSaveSelect.css'

/* ══════════════════════════════════════════════════════════════
   SUAS GANGUES — a PRIMEIRA tela que uma conta logada vê ao entrar
   no jogo (antes do lobby). Uma conta pode ter várias gangues (saves)
   em paralelo, cada uma com seu próprio nome, elenco e progresso no
   mapa. Também é daqui que se apaga uma gangue.

   5ª reconstrução (pedido do Isaias, 14/09/2026, ajuste fino depois de
   aprovar a 4ª): "parabéns, tá muito melhor" — só pediu mais fôlego:
   mais tijolo caindo, animação mais longa, SOM de cada batida ("tu tu
   tu") e um "buraco" de estado vazio que não parecesse mais uma bolha
   preta solta sem nada a ver com a parede. Sequência final, 100%
   CSS-timed (constantes abaixo espelham os keyframes do CSS — mudar um
   lado sem o outro desincroniza):

     t=0-1020ms  → ~18 tijolos caem de cima em posições/atrasos variados
                   e se encaixam na parede (nth-child, sem inline style),
                   com uma cadência de batidas sonoras (TIJOLO_KNOCK_MS)
     t=980-1400  → a logo cai de cima (já visível, não escondida) e
                   acelera até bater na posição final
     t=1400ms    → IMPACTO: flash + tremor de tela + estilhaços de
                   tijolo voando pra todo lado a partir do centro + SOM
                   de verdade (mp3 baixado de banco de efeitos royalty-
                   free via curl — nunca os bips sintetizados do
                   sfx.js), tudo disparado no mesmo instante
     t~1600ms    → tagline + corpo da tela entram (Framer Motion, delay
                   deslocado por IMPACT_MS pra nunca competir com o
                   impacto)

   Fonte de rua: 'Permanent Marker' (Google Fonts, já carregada no
   index.html) na tagline e no CTA — nenhuma fonte nova de peso pro
   bundle (só CSS, carregamento único do documento). O "boxing glove"
   genérico já tinha saído; o CTA de fundar a 1ª gangue tem um desenho
   próprio "spray-paint" (halo de neblina de tinta + respingos), e o
   "buraco" do estado vazio agora tem borda quebrada/irregular (tijolo
   estilhaçado de verdade), não mais uma bolha preta lisa.
   ══════════════════════════════════════════════════════════════ */

const LOGOS = { pt: logoPt, en: logoEn, es: logoEs }
const CORES_CARD = ['amber', 'teal', 'violet']
// Retimado (pedido do Isaias, 14/09/2026, ajuste fino: "mais tijolo caindo
// no começo e pra durar mais tempo essa animação") — precisa bater com a
// duração da animação da logo em GanguesSaveSelect.css (gang-saves-queda)
// e os animation-delay do flash/tremor/estilhaços, todos == IMPACT_MS.
const IMPACT_MS = 1400
// Cada "tu" da parede se montando — som de verdade (não sintetizado),
// agendado pra bater perto do instante em que cada leva de tijolos pousa
// (ver --pouso/animation-delay em GanguesSaveSelect.css). Não é 1 som por
// tijolo (com ~18 peças ficaria uma zoeira só) — uma cadência de batidas
// representando a parede sendo erguida.
const TIJOLO_KNOCK_MS = [60, 220, 380, 540, 700, 860, 1020]

function formatarData(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString() } catch { return '' }
}

export default function GanguesSaveSelect({ onNavigate }) {
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  const { user, perfil } = useAuth()
  const store = useGanguesStore()
  const [loading, setLoading] = useState(true)
  const [abrindo, setAbrindo] = useState(null)
  const [excluindo, setExcluindo] = useState(null)

  const limite = getGanguesSaveSlotLimit(perfil?.tier)
  const saves = store.saves
  // Save sem gang_name = gangue nunca batizada de verdade (o jogador saiu
  // no meio da tela de nome) — não conta como gangue de verdade pro
  // jogador nem pro limite de vagas; fica invisível na lista até ganhar
  // um nome (ver `criar()`, que reaproveita esse registro em vez de criar
  // outro toda vez que o jogador tenta de novo).
  const savesNomeados = saves.filter(save => save.gang_name)

  useEffect(() => {
    if (!user) return
    store.listSaves(user.id).finally(() => setLoading(false))
  }, [user])

  // Som de impacto — toca no momento exato em que a logo "bate" na parede
  // (IMPACT_MS, sincronizado com o flash/tremor/estilhaços no CSS), não no
  // instante de montar o componente. Respeita o mute global do jogo
  // (sfx.enabled), mas é um arquivo de áudio de verdade, não os bips
  // sintetizados do resto do sfx.js — o Isaias pediu especificamente por isso.
  useEffect(() => {
    if (!sfx.enabled) return
    const timer = setTimeout(() => {
      const audio = new Audio(somImpacto)
      audio.volume = 0.55
      audio.play().catch(() => {})
    }, IMPACT_MS)
    return () => clearTimeout(timer)
  }, [])

  // "Tu-tu-tu" da parede se montando — pedido do Isaias: "esse tijolo tem
  // que ter som quando ele caindo". `playbackRate`/volume levemente
  // variados por batida pra não soar como o mesmo som robótico repetido.
  useEffect(() => {
    if (!sfx.enabled) return
    const timers = TIJOLO_KNOCK_MS.map((ms, i) => setTimeout(() => {
      const audio = new Audio(somTijolo)
      audio.volume = 0.32
      audio.playbackRate = 0.92 + (i % 3) * 0.09
      audio.play().catch(() => {})
    }, ms))
    return () => timers.forEach(clearTimeout)
  }, [])

  const abrir = async (saveId) => {
    if (abrindo) return
    sfx.select?.()
    setAbrindo(saveId)
    await store.selecionarSave(saveId)
    // Save que já tem gangue montada → direto pro MAPA (escolher território).
    // Não faz sentido refazer o recrutamento toda vez. Save vazio cai no
    // lobby, que é onde mora o onboarding de recrutar.
    const temGangue = useGanguesStore.getState().roster.length >= 2
    onNavigate(temGangue ? 'story' : 'lobby')
  }

  const criar = async () => {
    if (abrindo || savesNomeados.length >= limite) return
    sfx.click()
    setAbrindo('novo')
    // Já existe um save criado mas nunca batizado (o jogador abriu "fundar
    // nova gangue" antes e saiu/recarregou no meio do nome) — reaproveita
    // em vez de criar outro registro no Supabase. Sem isso, cada tentativa
    // abandonada de fundar deixava uma "Gangue Sem Nome" fantasma pra
    // sempre, ocupando vaga sem o jogador nunca ter fundado de verdade
    // (pedido do Isaias, 14/09/2026: "enquanto o cara não fundou a gangue
    // oficialmente, não é pra aparecer uma gangue sem nome").
    const fantasma = saves.find(save => !save.gang_name)
    const id = fantasma ? fantasma.id : await store.criarNovoSave(user.id)
    if (!id) { setAbrindo(null); return }
    await store.selecionarSave(id)
    onNavigate('lobby')
  }

  const excluir = async (event, save) => {
    event.stopPropagation()
    const nome = save.gang_name || t('games.gangues.saves.sem_nome')
    if (!window.confirm(t('games.gangues.saves.excluir_confirm', { nome }))) return
    setExcluindo(save.id)
    await store.excluirSaveById(save.id, user.id)
    setExcluindo(null)
  }

  const podeCriar = savesNomeados.length < limite
  const s = (base) => base / 1000 + IMPACT_MS / 1000

  // A hero (logo + entrada de impacto) SEMPRE monta na hora, mesmo antes da
  // lista de saves voltar do Supabase — senão a "porrada" de entrada só
  // tocaria depois do round-trip de rede, tarde demais pra sentir o
  // impacto. Só o CORPO (cards/CTA) espera o carregamento de verdade.
  return (
    <main className="gang-lobby gang-saves">
      <span className="gang-saves__flash" aria-hidden="true" />
      {/* Parede se montando — ~18 tijolos caindo, espalhados, ANTES da
          logo cair (pedido do Isaias: "mais tijolo caindo, e pra durar
          mais tempo essa animação"). */}
      <span className="gang-saves__tijolos" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
      </span>
      {/* Estilhaços do impacto — a logo bate na parede e os pedaços voam
          pra todo lado (dispara junto com o flash/tremor, ver IMPACT_MS). */}
      <span className="gang-saves__estilhacos" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i />
      </span>

      <section className="gang-saves__hero gang-saves__hero--treme">
        <span className="gang-saves__embers" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
        <img className="gang-saves__logo gang-saves__logo--porrada" src={LOGOS[locale] || logoPt} alt="LDI Gangues" />
        <motion.p className="gang-saves__tagline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: s(80), duration: .35 }}>
          {t('games.gangues.saves.subtitulo')}
        </motion.p>
      </section>

      <div className="gang-saves__body">
        {loading ? (
          <motion.p className="gang-saves__loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: s(150) }}>
            {t('games.gangues.saves.carregando')}
          </motion.p>
        ) : savesNomeados.length === 0 ? (
          <motion.div className="gang-saves__buraco" initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: s(150), type: 'spring', stiffness: 210, damping: 20 }}>
            <span className="gang-saves__buraco-estilhaco" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></span>
            <p>{t('games.gangues.saves.sem_saves')}</p>
            <motion.button className="gang-saves__spray gang-saves__spray--primary" disabled={Boolean(abrindo)} onClick={criar} whileTap={{ scale: .96 }}>
              <span className="gang-saves__spray-halo" aria-hidden="true" />
              <strong>{abrindo === 'novo' ? t('games.gangues.carregando') : t('games.gangues.saves.nova_gangue')}</strong>
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="gang-saves__lista">
              <AnimatePresence>
                {savesNomeados.map((save, index) => {
                  const dominados = contarTerritoriosDominados(save.story_progress)
                  const cor = CORES_CARD[index % CORES_CARD.length]
                  return (
                    <motion.div
                      key={save.id} className={`gang-saves__card-shell gang-saves__card-shell--${cor}`}
                      initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .94 }}
                      transition={{ delay: s(150) + index * 0.08, type: 'spring', stiffness: 230, damping: 22 }}
                    >
                      <button
                        className="gang-saves__card-delete" disabled={Boolean(abrindo)} onClick={(event) => excluir(event, save)}
                        aria-label={t('games.gangues.saves.excluir')}
                      >
                        {excluindo === save.id ? '…' : '🗑'}
                      </button>
                      <button className="gang-saves__card" disabled={Boolean(abrindo)} onClick={() => abrir(save.id)}>
                        <span className="gang-saves__card-index">{t('games.gangues.saves.slot', { n: index + 1 })}</span>
                        <strong className="gang-saves__card-nome">{save.gang_name || t('games.gangues.saves.sem_nome')}</strong>
                        <span className="gang-saves__card-meta">
                          <span>🗺 {t('games.gangues.saves.territorios', { n: dominados })}</span>
                          <span>🕓 {formatarData(save.atualizada_em)}</span>
                        </span>
                        <span className="gang-saves__card-cta">{abrindo === save.id ? t('games.gangues.carregando') : t('games.gangues.saves.abrir')} <b>→</b></span>
                      </button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {podeCriar ? (
              <motion.button
                className="gang-saves__spray gang-saves__spray--ghost" disabled={Boolean(abrindo)} onClick={criar} whileTap={{ scale: .96 }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: s(150) + savesNomeados.length * 0.08 + .08 }}
              >
                <span className="gang-saves__spray-halo" aria-hidden="true" />
                <strong>{abrindo === 'novo' ? t('games.gangues.carregando') : t('games.gangues.saves.nova_gangue')}</strong>
              </motion.button>
            ) : (
              <p className="gang-saves__limite">{t('games.gangues.saves.limite_atingido', { n: limite })}</p>
            )}
          </>
        )}
      </div>

      <button className="gang-lobby-quit" onClick={() => navigate('/games')}>{t('games.gangues.sair_do_jogo')}</button>
    </main>
  )
}
