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
   SUAS GANGUES — tela antes do lobby, só pra conta logada.
   Uma conta pode ter várias gangues (saves) em paralelo, cada uma
   com seu próprio nome, elenco e progresso no mapa — dá pra
   recrutar elencos diferentes sem perder o save anterior. Também
   é daqui que se apaga uma gangue (o "resetar o jogo" do pedido).

   Redesenho pedido pelo Isaias (14/09/2026: "tá muito sem graça essa
   página inicial, quero algo muito melhor") — logo oficial (uma arte
   por idioma, `assets/logos/`, mesmo padrão de retrato/asset por-jogo
   já usado no resto do Gangues) como hero, cartões no mesmo desenho de
   chanfro/cor dos cards de GanguesModes.jsx em vez do card genérico
   antigo. Mecânica (abrir/criar/excluir save) intacta, só o visual mudou.
   ══════════════════════════════════════════════════════════════ */

const LOGOS = { pt: logoPt, en: logoEn, es: logoEs }

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

  if (loading) return <main className="gang-lobby gang-saves"><div className="gang-lobby-empty">{t('games.gangues.saves.carregando')}</div></main>

  return (
    <main className="gang-lobby gang-saves">
      <div className="gang-saves__hero">
        <img className="gang-saves__logo" src={LOGOS[locale] || logoPt} alt="LDI Gangues" />
      </div>

      <header className="gang-saves__head">
        <h1>{t('games.gangues.saves.titulo')}</h1>
        <p>{t('games.gangues.saves.subtitulo')}</p>
      </header>

      {saves.length === 0 ? (
        <p className="gang-saves__vazio">{t('games.gangues.saves.sem_saves')}</p>
      ) : (
        <div className="gang-saves__lista">
          <AnimatePresence>
            {saves.map((save, index) => {
              const dominados = contarTerritoriosDominados(save.story_progress)
              return (
                <motion.div
                  key={save.id} className="gang-saves__card-shell"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }}
                  transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <button className="gang-saves__card" disabled={Boolean(abrindo)} onClick={() => abrir(save.id)}>
                    <span className="gang-saves__card-index">{t('games.gangues.saves.slot', { n: index + 1 })}</span>
                    <strong className="gang-saves__card-nome">{save.gang_name || t('games.gangues.saves.sem_nome')}</strong>
                    <span className="gang-saves__card-meta">
                      <span>{t('games.gangues.saves.territorios', { n: dominados })}</span>
                      <span>{formatarData(save.atualizada_em)}</span>
                    </span>
                    <span className="gang-saves__card-cta">{abrindo === save.id ? t('games.gangues.carregando') : t('games.gangues.saves.abrir')} <b>→</b></span>
                  </button>
                  <button className="gang-saves__card-delete" disabled={Boolean(abrindo)} onClick={(event) => excluir(event, save)}>
                    🗑 {excluindo === save.id ? '…' : t('games.gangues.saves.excluir')}
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {saves.length < limite ? (
        <motion.button
          className="gang-saves__nova" disabled={Boolean(abrindo)} onClick={criar}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: saves.length * 0.06 + 0.08 }}
        >
          <span className="gang-saves__nova-icon" aria-hidden="true">⚡</span>
          <span className="gang-saves__nova-copy">
            <strong>{abrindo === 'novo' ? t('games.gangues.carregando') : t('games.gangues.saves.nova_gangue')}</strong>
          </span>
          <b className="gang-saves__nova-cta">→</b>
        </motion.button>
      ) : (
        <p className="gang-saves__limite">{t('games.gangues.saves.limite_atingido', { n: limite })}</p>
      )}

      <button className="gang-lobby-quit" onClick={() => navigate('/games')}>
        {t('games.gangues.sair_do_jogo')}
      </button>
    </main>
  )
}
