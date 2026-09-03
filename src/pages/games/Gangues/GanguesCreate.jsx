import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useGanguesStore } from './store/useGanguesStore'
import { GANGUES_ATTRIBUTE_MAX, GANGUES_CREATION_POINTS, GANGUES_PATHS, getGanguesResources } from './data/ganguesLoadout.js'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import NeoGuideTip from './components/NeoGuideTip'
import { sfx } from '../../../lib/sfx'

const PATH_MARKS = { atacante: 'A', defensor: 'D', mistico: 'M' }
const ATTRS = ['A', 'H', 'R', 'D']

const TUTORIAL_PATHS_KEY = 'ldi-gangues-tutorial-paths-seen'
const TUTORIAL_PATH_BY_STEP = [null, 'atacante', 'defensor', 'mistico', null]
const TUTORIAL_PATH_SIDE_BY_STEP = ['right', 'left', 'right', 'left', 'right']

const TUTORIAL_ATTRS_KEY = 'ldi-gangues-tutorial-attrs-seen'
const TUTORIAL_ATTR_BY_STEP = [null, 'A', 'H', 'R', 'D', null]
const TUTORIAL_ATTR_SIDE_BY_STEP = ['right', 'left', 'right', 'left', 'right', 'right']

export default function GanguesCreate({ onNavigate, blockedPaths = [], creationNumber = 1, onCreated }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = useGanguesStore()
  const sheet = store.sheet
  const [step, setStep] = useState('path')
  const [error, setError] = useState('')
  const [pathTutorialActive, setPathTutorialActive] = useState(false)
  const [pathTutorialStep, setPathTutorialStep] = useState(0)
  const [attrTutorialActive, setAttrTutorialActive] = useState(false)
  const [attrTutorialStep, setAttrTutorialStep] = useState(0)
  // Quando o jogador tenta avançar com algo faltando, a NeoGuide fala e o
  // campo culpado acende. Antes só saía um <p> sem estilo nenhum e a pessoa
  // achava que o botão estava quebrado.
  const [aviso, setAviso] = useState(null)
  const nomeRef = useRef(null)
  const caminhosRef = useRef(null)
  const pontosRef = useRef(null)
  const spent = ATTRS.reduce((sum, attr) => sum + (sheet.attributes?.[attr] || 0), 0)
  const remaining = GANGUES_CREATION_POINTS - spent

  useEffect(() => { setStep('path'); setError(''); setAviso(null) }, [creationNumber])

  /** Bloqueou? A NeoGuide explica o quê e o campo culpado acende.
   *  `vars` alimenta as mensagens com contador (ex.: pontos restantes). */
  const avisar = (campo, vars) => {
    sfx.cancel()
    setError(t(`games.gangues.neoguide.avisos.${campo}.erro`, vars))
    setAviso({ campo, texto: t(`games.gangues.neoguide.avisos.${campo}.dica`, vars) })
  }

  const limparAviso = () => { setAviso(null); setError('') }

  // Leva o jogador até o campo que falta — de nada adianta a Neo apontar
  // para um campo que ficou fora da tela.
  useEffect(() => {
    if (!aviso) return
    const alvo = { nome: nomeRef, caminho: caminhosRef, pontos: pontosRef, resistencia: pontosRef }[aviso.campo]
    alvo?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (aviso.campo === 'nome') nomeRef.current?.querySelector('input')?.focus()
  }, [aviso])

  useEffect(() => {
    if (step !== 'path') return
    try {
      if (!localStorage.getItem(TUTORIAL_PATHS_KEY)) { setPathTutorialActive(true); setPathTutorialStep(0) }
    } catch { setPathTutorialActive(true); setPathTutorialStep(0) }
  }, [step])

  useEffect(() => {
    if (step !== 'attributes') return
    try {
      if (!localStorage.getItem(TUTORIAL_ATTRS_KEY)) { setAttrTutorialActive(true); setAttrTutorialStep(0) }
    } catch { setAttrTutorialActive(true); setAttrTutorialStep(0) }
  }, [step])

  const dismissPathTutorial = () => {
    try { localStorage.setItem(TUTORIAL_PATHS_KEY, '1') } catch {}
    setPathTutorialActive(false)
  }

  const advancePathTutorial = () => {
    if (pathTutorialStep >= TUTORIAL_PATH_BY_STEP.length - 1) { dismissPathTutorial(); return }
    setPathTutorialStep(value => value + 1)
  }

  const dismissAttrTutorial = () => {
    try { localStorage.setItem(TUTORIAL_ATTRS_KEY, '1') } catch {}
    setAttrTutorialActive(false)
  }

  const advanceAttrTutorial = () => {
    if (attrTutorialStep >= TUTORIAL_ATTR_BY_STEP.length - 1) { dismissAttrTutorial(); return }
    setAttrTutorialStep(value => value + 1)
  }

  const highlightedPath = pathTutorialActive ? TUTORIAL_PATH_BY_STEP[pathTutorialStep] : null
  const highlightedAttr = attrTutorialActive ? TUTORIAL_ATTR_BY_STEP[attrTutorialStep] : null

  const selectPath = (id) => {
    if (blockedPaths.includes(id)) return
    sfx.select()
    limparAviso()
    store.updateSheet({ combat_path: id, attributes: { A: 0, H: 0, R: 0, D: 0 }, loadout_version: 2 })
  }

  const continueToAttributes = () => {
    if (!sheet.sheet_name?.trim()) { avisar('nome'); return }
    if (!GANGUES_PATHS.includes(sheet.combat_path)) { avisar('caminho'); return }
    limparAviso()
    setStep('attributes')
  }

  const changeAttribute = (attr, delta) => {
    const current = sheet.attributes?.[attr] || 0
    if (delta > 0 && (remaining <= 0 || current >= GANGUES_ATTRIBUTE_MAX)) return
    if (delta < 0 && current <= 0) return
    sfx.select()
    store.updateSheet({ attributes: { ...sheet.attributes, [attr]: current + delta } })
  }

  const save = async () => {
    if (remaining !== 0) { avisar('pontos', { n: remaining }); return }
    if ((sheet.attributes?.R || 0) < 1) { avisar('resistencia'); return }
    limparAviso()
    const saved = user ? await store.saveToCloud(user.id) : store.addLocalSheet(sheet)
    if (!saved) { setError(t('games.gangues.party.save_error')); return }
    onCreated?.(saved)
    if (!onCreated) onNavigate('lobby')
  }

  if (step === 'attributes') {
    const resources = getGanguesResources(sheet.combat_path, sheet.attributes?.R)
    const tutorialLines = t('games.gangues.tutorial_attrs')
    return <div className="gang-create">
      <AnimatePresence mode="wait">
        {attrTutorialActive && (
          <NeoGuideTip
            key={attrTutorialStep}
            text={Array.isArray(tutorialLines) ? tutorialLines[attrTutorialStep] : ''}
            side={TUTORIAL_ATTR_SIDE_BY_STEP[attrTutorialStep]}
            isLast={attrTutorialStep >= TUTORIAL_ATTR_BY_STEP.length - 1}
            onNext={advanceAttrTutorial}
            onSkip={dismissAttrTutorial}
          />
        )}
        {!attrTutorialActive && aviso && (
          <NeoGuideTip key={`aviso-${aviso.campo}`} text={aviso.texto} side="right" nextLabel={t('games.gangues.neoguide.entendi')} onNext={limparAviso} onSkip={limparAviso} />
        )}
      </AnimatePresence>
      <div className="gc-header"><div className="gc-header-center"><p className="gang-lobby-titulo gang-lobby-titulo--sm">{t('games.gangues.party.distribute_title')}</p><p className="gc-header-name">{sheet.sheet_name}</p></div></div>
      <div className="gc-step">
        <div ref={pontosRef} className={`gc-points-console${aviso?.campo === 'pontos' || aviso?.campo === 'resistencia' ? ' gc-campo--alerta' : ''}`}><span>{t(`games.gangues.loadout.paths.${sheet.combat_path}.name`)}</span><strong>{remaining}</strong><small>{t('games.gangues.party.points_remaining')}</small></div>
        <div className="gc-attr-list">
          {ATTRS.map(attr => <div key={attr} className={`gc-attr-card ${highlightedAttr === attr ? 'gc-attr-card--tip-active' : ''}${aviso?.campo === 'resistencia' && attr === 'R' ? ' gc-campo--alerta' : ''}`}><div className="gc-attr-avatar">{attr}</div><div className="gc-attr-info"><div className="gc-attr-name">{t(`games.gangues.attr_labels.${attr}`)}</div><div className="gc-attr-desc">{t(`games.gangues.attr_desc.${attr}`)}</div></div><div className="gc-attr-controls"><button className="gc-attr-btn" disabled={(sheet.attributes?.[attr] || 0) <= 0} onClick={() => changeAttribute(attr, -1)}>−</button><span className="gc-attr-val">{sheet.attributes?.[attr] || 0}</span><button className="gc-attr-btn" disabled={remaining <= 0 || (sheet.attributes?.[attr] || 0) >= GANGUES_ATTRIBUTE_MAX} onClick={() => changeAttribute(attr, 1)}>+</button></div></div>)}
        </div>
        <div className="gc-resource-preview"><span>PV <b>{resources.pvMax}</b></span><span>PM <b>{resources.pmMax}</b></span></div>
        {error && <p className="gang-err">{error}</p>}
        <div className="gc-nav"><BackToGamesBtn onClick={() => { setError(''); setStep('path') }} label={t('games.gangues.btn_voltar')} /><button className="gc-btn-salvar" onClick={save}>{t('games.gangues.party.finish_member')}</button></div>
      </div>
    </div>
  }

  const pathTutorialLines = t('games.gangues.tutorial_paths')
  return <div className="gang-create">
    <AnimatePresence mode="wait">
      {pathTutorialActive && (
        <NeoGuideTip
          key={pathTutorialStep}
          text={Array.isArray(pathTutorialLines) ? pathTutorialLines[pathTutorialStep] : ''}
          side={TUTORIAL_PATH_SIDE_BY_STEP[pathTutorialStep]}
          isLast={pathTutorialStep >= TUTORIAL_PATH_BY_STEP.length - 1}
          onNext={advancePathTutorial}
          onSkip={dismissPathTutorial}
        />
      )}
      {!pathTutorialActive && aviso && (
        <NeoGuideTip key={`aviso-${aviso.campo}`} text={aviso.texto} side="right" nextLabel={t('games.gangues.neoguide.entendi')} onNext={limparAviso} onSkip={limparAviso} />
      )}
    </AnimatePresence>
    <div className="gc-header"><div className="gc-header-center"><p className="gang-lobby-titulo gang-lobby-titulo--sm">{t('games.gangues.loadout.path_title')}</p></div></div>
    <div className="gc-step">
      <div ref={nomeRef} className={`gc-name-hero gc-name-hero--simple${aviso?.campo === 'nome' ? ' gc-campo--alerta' : ''}`}><div className="gc-name-avatar gc-name-avatar--neutral">{sheet.sheet_name ? sheet.sheet_name[0].toUpperCase() : '?'}</div><input className="gc-name-input" value={sheet.sheet_name || ''} onChange={event => { if (aviso?.campo === 'nome') limparAviso(); store.updateSheet({ sheet_name: event.target.value }) }} placeholder={t('games.gangues.placeholder_nome')} autoFocus /></div>
      <div ref={caminhosRef} className={`gc-loadout-grid gc-loadout-grid--styles${aviso?.campo === 'caminho' ? ' gc-campo--alerta' : ''}`}>{GANGUES_PATHS.map(id => <button key={id} disabled={blockedPaths.includes(id)} className={`gc-loadout-card ${sheet.combat_path === id ? 'gc-loadout-card--active' : ''} ${highlightedPath === id ? 'gc-loadout-card--tip-active' : ''}`} onClick={() => selectPath(id)}><span className="gc-path-mark">{PATH_MARKS[id]}</span><span className="gc-path-copy"><strong>{t(`games.gangues.loadout.paths.${id}.name`)}</strong><span className="gc-path-resource">{t('games.gangues.loadout.resource_rate', getGanguesResources(id, 1))}</span><span className="gc-path-bonus">{t(`games.gangues.loadout.paths.${id}.bonus`)}</span>{blockedPaths.includes(id) && <span className="gc-path-blocked">{t('games.gangues.party.path_unavailable')}</span>}</span><span className="gc-path-check">{sheet.combat_path === id ? '✓' : '→'}</span></button>)}</div>
      {error && <p className="gang-err">{error}</p>}
      <div className="gc-nav"><BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.gangues.btn_voltar')} /><button className="gc-btn-salvar" onClick={continueToAttributes}>{t('games.gangues.btn_proximo')}</button></div>
    </div>
  </div>
}
