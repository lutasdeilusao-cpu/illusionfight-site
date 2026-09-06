import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useGanguesStore } from './store/useGanguesStore'
import { contarTerritoriosDominados, getGanguesSaveSlotLimit } from './data/ganguesLoadout.js'
import { sfx } from '../../../lib/sfx'
import './GanguesSaveSelect.css'

/* ══════════════════════════════════════════════════════════════
   SUAS GANGUES — tela antes do lobby, só pra conta logada.
   Uma conta pode ter várias gangues (saves) em paralelo, cada uma
   com seu próprio nome, elenco e progresso no mapa — dá pra
   recrutar elencos diferentes sem perder o save anterior. Também
   é daqui que se apaga uma gangue (o "resetar o jogo" do pedido).
   ══════════════════════════════════════════════════════════════ */

function formatarData(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString() } catch { return '' }
}

export default function GanguesSaveSelect({ onNavigate }) {
  const { t } = useLanguage()
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
    onNavigate('lobby')
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
      <header className="gang-saves__head">
        <h1>{t('games.gangues.saves.titulo')}</h1>
        <p>{t('games.gangues.saves.subtitulo')}</p>
      </header>

      {saves.length === 0 ? (
        <p className="gang-saves__vazio">{t('games.gangues.saves.sem_saves')}</p>
      ) : (
        <div className="gang-saves__lista">
          {saves.map((save, index) => {
            const dominados = contarTerritoriosDominados(save.story_progress)
            return (
              <div key={save.id} className="gang-saves__card-shell">
                <button className="gang-saves__card" disabled={Boolean(abrindo)} onClick={() => abrir(save.id)}>
                  <span className="gang-saves__card-index">{t('games.gangues.saves.slot', { n: index + 1 })}</span>
                  <strong className="gang-saves__card-nome">{save.gang_name || t('games.gangues.saves.sem_nome')}</strong>
                  <span className="gang-saves__card-meta">
                    <span>{t('games.gangues.saves.territorios', { n: dominados })}</span>
                    <span>{formatarData(save.atualizada_em)}</span>
                  </span>
                  <span className="gang-saves__card-cta">{abrindo === save.id ? t('games.gangues.carregando') : t('games.gangues.saves.abrir')} <b>→</b></span>
                </button>
                <button className="gang-saves__card-delete" disabled={Boolean(abrindo)} aria-label={t('games.gangues.saves.excluir')} onClick={(event) => excluir(event, save)}>
                  {excluindo === save.id ? '…' : '×'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {saves.length < limite ? (
        <button className="gang-new-sheet gang-new-sheet--primary" disabled={Boolean(abrindo)} onClick={criar}>
          <span className="gang-new-sheet-icon">⚡</span>{abrindo === 'novo' ? t('games.gangues.carregando') : t('games.gangues.saves.nova_gangue')}
        </button>
      ) : (
        <p className="gang-saves__limite">{t('games.gangues.saves.limite_atingido', { n: limite })}</p>
      )}
    </main>
  )
}
