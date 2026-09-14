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
   mapa — dá pra recrutar elencos diferentes sem perder o save
   anterior. Também é daqui que se apaga uma gangue (o "resetar o
   jogo" do pedido).

   Reconstruída do zero (pedido do Isaias, 14/09/2026 — 1ª tentativa de
   redesign foi rejeitada por inteiro: "só trocou o fundo da imagem e
   manteve tudo genérico, texto ilegível, botão sair horrível... isso é
   a primeira tela de contato do jogador com o jogo, tem que ser épica
   e inesquecível"). A logo oficial (arte por idioma, transparente,
   `assets/logos/`) agora é o ÚNICO título — nada de repetir "SUAS
   GANGUES" gigante embaixo dela, redundante. Hero com glow pulsante +
   fumaça de spray subindo (motivo visual dos sprays da própria logo) +
   entrada em cascata via Framer Motion. Cards reconstruídos bem maiores
   e mais legíveis (cor por índice, meta com ícone), CTA de fundar
   gangue como peça central quando não há nenhuma ainda, exclusão virou
   um ícone discreto no canto (não uma barra vermelha ocupando a
   largura toda). Sair virou uma seta minúscula no canto, no padrão
   "← voltar" já usado no resto do jogo, não mais uma caixa solta
   flutuando no fim da tela. Mecânica (abrir/criar/excluir save)
   inalterada, só o visual mudou.
   ══════════════════════════════════════════════════════════════ */

const LOGOS = { pt: logoPt, en: logoEn, es: logoEs }
const CORES_CARD = ['amber', 'teal', 'violet']

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

  if (loading) return <main className="gang-lobby gang-saves"><div className="gang-saves__loading">{t('games.gangues.saves.carregando')}</div></main>

  const podeCriar = saves.length < limite

  return (
    <main className="gang-lobby gang-saves">
      <button className="gang-saves__voltar" onClick={() => navigate('/games')} aria-label={t('games.gangues.sair_do_jogo')}>←</button>

      <motion.section className="gang-saves__hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .4 }}>
        <span className="gang-saves__embers" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
        <motion.img
          className="gang-saves__logo" src={LOGOS[locale] || logoPt} alt="LDI Gangues"
          initial={{ opacity: 0, scale: .55, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 13, delay: .1 }}
        />
        <motion.p className="gang-saves__tagline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .55, duration: .35 }}>
          {t('games.gangues.saves.subtitulo')}
        </motion.p>
      </motion.section>

      <div className="gang-saves__body">
        {saves.length === 0 ? (
          <motion.div className="gang-saves__empty" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .7, type: 'spring', stiffness: 200, damping: 22 }}>
            <span className="gang-saves__empty-badge" aria-hidden="true">🥊</span>
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
                      transition={{ delay: .1 + index * 0.08, type: 'spring', stiffness: 230, damping: 22 }}
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
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 + saves.length * 0.08 + .08 }}
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
