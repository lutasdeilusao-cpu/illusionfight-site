import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useAuth } from '../../../../context/AuthContext'
import { useGanguesStore } from '../store/useGanguesStore'
import { GANGUES_CHARACTER_CATALOG, getGanguesAvailableCharacterIds } from '../data/ganguesCharacters.js'
import { getGanguesPortrait } from '../data/ganguesPortraits.js'
import { GANGUES_INITIAL_PARTY_SIZE } from '../data/ganguesLoadout.js'
import { sfx } from '../../../../lib/sfx'
import GanguesFichaCard from '../components/GanguesFichaCard'

const PATH_MARKS = { atacante: 'A', defensor: 'D', mistico: 'M' }

export default function GanguesCreate({ onNavigate, onCreated }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = useGanguesStore()
  const [initialRecruitment] = useState(() => store.roster.length === 0)
  const required = initialRecruitment ? 2 : 1
  const [activeIndex, setActiveIndex] = useState(0)
  const [detailId, setDetailId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const candidates = useMemo(() => {
    const recruited = new Set(store.roster.map(member => Number(member.character_template_id)).filter(Boolean))
    const available = new Set(getGanguesAvailableCharacterIds({
      campaignClears: store.campaignClears,
      storyProgress: store.storyProgress,
      rep: store.rep,
      eventCharacterIds: store.eventCharacterIds,
    }))
    return GANGUES_CHARACTER_CATALOG.filter(character => available.has(character.id) && !recruited.has(character.id))
  }, [store.roster, store.campaignClears, store.storyProgress, store.rep, store.eventCharacterIds])

  const detail = candidates.find(character => character.id === detailId) || null
  const at = offset => candidates[(activeIndex + offset + candidates.length) % candidates.length]
  const slides = candidates.length > 1
    ? [{ character: at(-1), position: 'prev' }, { character: at(0), position: 'current' }, { character: at(1), position: 'next' }]
    : candidates.map(character => ({ character, position: 'current' }))

  useEffect(() => {
    const close = event => { if (event.key === 'Escape') setDetailId(null) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  const move = direction => {
    if (candidates.length < 2) return
    sfx.select()
    setActiveIndex(index => (index + direction + candidates.length) % candidates.length)
  }

  const openSheet = character => {
    sfx.click()
    setDetailId(character.id)
  }

  const toggleSelection = character => {
    const selected = selectedIds.includes(character.id)
    if (selected) setSelectedIds(ids => ids.filter(id => id !== character.id))
    else if (selectedIds.length < required) setSelectedIds(ids => [...ids, character.id])
    else setSelectedIds(ids => [...ids.slice(1), character.id])
    sfx.select()
    setDetailId(null)
  }

  // A DUPLA FUNDADORA (initialRecruitment) nasce no nível 1, do jeito clássico.
  // Todo recruta DEPOIS disso vem já ADIANTADO — pedido do Isaias: chegar no
  // nível 1 numa gangue que já rodou o bairro faz o novato virar peso morto
  // por um tempão. Cada recrutamento pós-fundação sobe +5: o 1º recruta vem
  // L5, o 2º L10, o 3º L15... `N` conta pelo tamanho do elenco JÁ formado
  // (não precisa de contador novo salvo em lugar nenhum).
  const nivelDoProximoRecruta = () => {
    if (initialRecruitment) return 1
    // .getState() (não o `store` do render) pra pegar o elenco ATUALIZADO,
    // caso essa função rode mais de uma vez no mesmo confirmRecruitment.
    const n = Math.max(1, useGanguesStore.getState().roster.length - GANGUES_INITIAL_PARTY_SIZE + 1)
    return 5 * n
  }

  const confirmRecruitment = async () => {
    if (selectedIds.length !== required || saving) return
    setSaving(true)
    setError('')
    const saved = []
    for (const characterId of selectedIds) {
      const nivel = nivelDoProximoRecruta()
      const xpTotal = Math.max(0, nivel - 1)
      const member = await store.recruitTemplate(characterId, user?.id, xpTotal)
      if (!member) break
      saved.push(member)
    }
    setSaving(false)
    if (saved.length !== required) {
      setError(t('games.gangues.party.save_error'))
      return
    }
    store.setActiveParty([...store.activeParty, ...saved].slice(0, 2))
    // O 1º personagem que o jogador escolheu (selectedIds[0] -> saved[0], a
    // ordem do for...of bate com a ordem da escolha) vira líder da gangue de
    // cara — só na fundação; recrutas depois disso não mexem no líder já
    // escolhido. Aviso disso aparece pro jogador em recruitment.lobby_pitch.
    if (initialRecruitment && saved[0]) store.definirLider(saved[0].id)
    sfx.reward()
    onCreated?.(saved[saved.length - 1])
    if (!onCreated) onNavigate('lobby')
  }

  return (
    <main className="gang-recruit">
      <header className="gang-recruit__head">
        <button className="gang-recruit__back" onClick={() => onNavigate('lobby')} aria-label={t('games.gangues.btn_voltar')}>←</button>
        <h1>{initialRecruitment ? t('games.gangues.recruitment.title_initial') : t('games.gangues.recruitment.title')}</h1>
        <p>{t(`games.gangues.recruitment.${initialRecruitment ? 'subtitle_initial' : 'subtitle'}`, { n: required })}</p>
        {initialRecruitment && <p className="gang-recruit__aviso-lider">⭐ {t('games.gangues.recruitment.aviso_lider')}</p>}
      </header>

      <section className="gang-recruit__stage" aria-label={t('games.gangues.recruitment.candidates')}>
        <div className="gang-recruit__street" aria-hidden="true"><i /><i /><i /></div>
        <button className="gang-recruit__arrow gang-recruit__arrow--left" onClick={() => move(-1)} aria-label={t('games.gangues.recruitment.previous')}>‹</button>
        <div className="gang-recruit__slides">
          {slides.map(({ character, position }) => {
            const selected = selectedIds.includes(character.id)
            const foto = getGanguesPortrait(character.slug)
            return (
              <motion.button
                key={`${position}-${character.id}`}
                className={`gang-fighter-card gang-fighter-card--${position} gang-fighter-card--${character.combat_path}${selected ? ' gang-fighter-card--selected' : ''}`}
                onClick={() => position === 'current' ? openSheet(character) : move(position === 'prev' ? -1 : 1)}
                initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
              >
                <span className="gang-fighter-card__number">#{String(character.id).padStart(2, '0')}</span>
                {selected && <span className="gang-fighter-card__selected">✓ {t('games.gangues.recruitment.marked')}</span>}
                <span className={`gang-fighter-card__portrait${foto ? ' gang-fighter-card__portrait--foto' : ''}`} aria-hidden="true">
                  {foto ? <img src={foto} alt="" /> : <i>{character.name[0]}</i>}
                  <b>{PATH_MARKS[character.combat_path]}</b>
                </span>
                <span className="gang-fighter-card__copy"><small>{t(`games.gangues.loadout.paths.${character.combat_path}.name`)}</small><strong>{character.name}</strong><em>{t(`games.gangues.progression.paths.${character.special_path}`)}</em></span>
                <span className="gang-fighter-card__cta">{t('games.gangues.recruitment.open_sheet')} →</span>
              </motion.button>
            )
          })}
        </div>
        <button className="gang-recruit__arrow gang-recruit__arrow--right" onClick={() => move(1)} aria-label={t('games.gangues.recruitment.next')}>›</button>
      </section>

      <div className="gang-recruit__dots">{candidates.map((character, index) => <button key={character.id} className={index === activeIndex ? 'is-active' : ''} onClick={() => setActiveIndex(index)} aria-label={character.name} />)}</div>

      <section className="gang-recruit__picks">
        <div><span>{t('games.gangues.recruitment.your_picks')}</span><strong>{selectedIds.length}/{required}</strong></div>
        <div className="gang-recruit__slots">
          {Array.from({ length: required }, (_, index) => {
            const character = candidates.find(item => item.id === selectedIds[index])
            return <button key={index} disabled={!character} onClick={() => character && openSheet(character)} className={character ? 'is-filled' : ''}>{character ? <><b>{character.name[0]}</b><span>{character.name}</span><i>✓</i></> : <><b>+</b><span>{t('games.gangues.recruitment.empty_slot')}</span></>}</button>
          })}
        </div>
        {error && <p className="gang-err">{error}</p>}
        <button className="gang-recruit__confirm" disabled={selectedIds.length !== required || saving} onClick={confirmRecruitment}>{saving ? t('games.gangues.carregando') : t('games.gangues.recruitment.confirm', { n: required })}</button>
      </section>

      <AnimatePresence>
        {detail && <motion.div className="gang-sheet-modal" role="dialog" aria-modal="true" aria-labelledby="gang-sheet-name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="gang-sheet-modal__scrim" onClick={() => setDetailId(null)} aria-label={t('games.gangues.recruitment.close')} />
          <motion.article className={`gang-sheet-modal__card gang-sheet-modal__card--${detail.combat_path}`} initial={{ y: 60, scale: .94 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 24 }}>
            <button className="gang-sheet-modal__close" onClick={() => setDetailId(null)} aria-label={t('games.gangues.recruitment.close')}>×</button>
            <GanguesFichaCard
              tituloId="gang-sheet-name"
              numero={detail.id}
              nome={detail.name}
              caminho={detail.combat_path}
              retrato={getGanguesPortrait(detail.slug)}
              subcaminho={t(`games.gangues.progression.paths.${detail.special_path}`)}
              atributos={detail.base_stats}
              pv={{ max: detail.base_resources.pv_max }}
              pm={{ max: detail.base_resources.pm_max }}
              tecnica={{ nome: t(`games.gangues.progression.skills.${detail.base_technique.id}`), custo: detail.base_technique.pm_cost }}
            />
            <button className={`gang-sheet-modal__select${selectedIds.includes(detail.id) ? ' is-selected' : ''}`} onClick={() => toggleSelection(detail)}>{selectedIds.includes(detail.id) ? t('games.gangues.recruitment.remove') : t('games.gangues.recruitment.select')}</button>
          </motion.article>
        </motion.div>}
      </AnimatePresence>
    </main>
  )
}
