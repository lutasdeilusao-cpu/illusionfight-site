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
import './GanguesSaveSelect.css'

/* ══════════════════════════════════════════════════════════════
   SUAS GANGUES — a PRIMEIRA tela que uma conta logada vê ao entrar
   no jogo (antes do lobby). Uma conta pode ter várias gangues (saves)
   em paralelo, cada uma com seu próprio nome, elenco e progresso no
   mapa. Também é daqui que se apaga uma gangue.

   3ª reconstrução (pedido do Isaias, 14/09/2026, 2 rejeições seguidas):
   1ª tentativa só trocou o fundo atrás da logo; 2ª tentativa ("umas
   particulazinhas atrás") ainda foi considerada fraca demais — ele pediu
   uma ENTRADA de verdade: "a logo aparece grande, dando uma porrada, a
   tela pisca, e a tela vai se montando por trás como se fosse uma parede
   de tijolos caindo", e SOM de impacto (nunca os bips sintetizados do
   sfx.js — "áudio bom", banco de som de verdade). Sequência final,
   100% CSS-timed (sincronismo preciso, ver IMPACT_MS abaixo):

     t=0ms    → flash branco na tela + logo entra GIGANTE e trava com
                impacto (overshoot) + tela treme + SOM (mp3 de verdade,
                public/sounds/gangues-saves-impact.mp3 — baixado de um
                banco de efeitos sonoros royalty-free, não é sintetizado)
     t=0-650  → 6 blocos de tijolo caem de cima e se encaixam na parede
                de fundo (nth-child, sem inline style, como as brasas)
     t~900ms  → logo estabiliza no tamanho final da hero
     t~1050ms → tagline + corpo da tela entram (Framer Motion, delay
                deslocado por IMPACT_MS pra nunca competir com o impacto)

   O "boxing glove" genérico saiu — já temos identidade visual própria
   (a logo). O convite de fundar a 1ª gangue agora vive dentro de um
   buraco escuro arrebentado na própria parede de tijolo (border-radius
   orgânico + estilhaços na borda), não numa caixa qualquer.
   ══════════════════════════════════════════════════════════════ */

const LOGOS = { pt: logoPt, en: logoEn, es: logoEs }
const CORES_CARD = ['amber', 'teal', 'violet']
const IMPACT_MS = 1050

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

  useEffect(() => {
    if (!user) return
    store.listSaves(user.id).finally(() => setLoading(false))
  }, [user])

  // Som de impacto da entrada — UMA vez, na primeira montagem real da tela
  // (não em cada re-render). Respeita o mute global do jogo (sfx.enabled),
  // mas é um arquivo de áudio de verdade, não os bips sintetizados do
  // resto do sfx.js — o Isaias pediu especificamente por isso.
  useEffect(() => {
    if (!sfx.enabled) return
    const audio = new Audio('/sounds/gangues-saves-impact.mp3')
    audio.volume = 0.55
    audio.play().catch(() => {})
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
    if (abrindo || saves.length >= limite) return
    sfx.click()
    setAbrindo('novo')
    const id = await store.criarNovoSave(user.id)
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

  const podeCriar = saves.length < limite
  const s = (base) => base / 1000 + IMPACT_MS / 1000

  // A hero (logo + entrada de impacto) SEMPRE monta na hora, mesmo antes da
  // lista de saves voltar do Supabase — senão a "porrada" de entrada só
  // tocaria depois do round-trip de rede, tarde demais pra sentir o
  // impacto. Só o CORPO (cards/CTA) espera o carregamento de verdade.
  return (
    <main className="gang-lobby gang-saves">
      <span className="gang-saves__flash" aria-hidden="true" />
      <span className="gang-saves__tijolos" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>

      <button className="gang-saves__voltar" onClick={() => navigate('/games')} aria-label={t('games.gangues.sair_do_jogo')}>←</button>

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
        ) : saves.length === 0 ? (
          <motion.div className="gang-saves__buraco" initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: s(150), type: 'spring', stiffness: 210, damping: 20 }}>
            <span className="gang-saves__buraco-estilhaco" aria-hidden="true"><i /><i /><i /><i /><i /></span>
            <p>{t('games.gangues.saves.sem_saves')}</p>
            <motion.button className="gang-saves__cta gang-saves__cta--primary" disabled={Boolean(abrindo)} onClick={criar} whileTap={{ scale: .97 }}>
              <span className="gang-saves__cta-icon" aria-hidden="true">⚡</span>
              <strong>{abrindo === 'novo' ? t('games.gangues.carregando') : t('games.gangues.saves.nova_gangue')}</strong>
              <b className="gang-saves__cta-arrow">→</b>
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="gang-saves__lista">
              <AnimatePresence>
                {saves.map((save, index) => {
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
                className="gang-saves__cta gang-saves__cta--ghost" disabled={Boolean(abrindo)} onClick={criar} whileTap={{ scale: .97 }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: s(150) + saves.length * 0.08 + .08 }}
              >
                <span className="gang-saves__cta-icon" aria-hidden="true">+</span>
                <strong>{abrindo === 'novo' ? t('games.gangues.carregando') : t('games.gangues.saves.nova_gangue')}</strong>
              </motion.button>
            ) : (
              <p className="gang-saves__limite">{t('games.gangues.saves.limite_atingido', { n: limite })}</p>
            )}
          </>
        )}
      </div>
    </main>
  )
}
