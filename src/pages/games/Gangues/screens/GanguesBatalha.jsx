import { useMemo, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useGanguesStore } from '../store/useGanguesStore'
import { sfx } from '../../../../lib/sfx'
import { GANGUES_TERRITORIOS } from '../data/ganguesTerritorios.js'
import { GANGUES_TERRITORIO_ENCONTRO, calcularPontosTime } from '../data/ganguesEncontros.js'
import { GANGUES_STORY_BATTLE_PARTY_MAX } from '../data/ganguesLoadout.js'
import { getGanguesLevelFromXp } from '../data/ganguesCharacters.js'
import './GanguesBatalha.css'

/* ══════════════════════════════════════════════════════════════
   MODO BATALHA — A TORRE (estilo Mortal Kombat)
   Grind rápido de AP pra levar as fichas a L→99 (o teto que libera o
   multiplayer). Sem progresso de história: luta atrás de luta, o jogador
   escolhe o tema (território) e a FOLGA de nível (quão puxado quer). Cada
   andar sobe a dificuldade e o AP. Derrota = sai da torre com o AP ganho.
   ══════════════════════════════════════════════════════════════ */

// Fator sobre os pontos do time — a "folga" que o jogador escolhe.
const FOLGAS = [
  { id: 'leve', fator: 0.70 },
  { id: 'igual', fator: 1.00 },
  { id: 'puxado', fator: 1.35 },
  { id: 'brabo', fator: 1.80 },
]

export default function GanguesBatalha({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const torre = store.torre
  const [territorioId, setTerritorioId] = useState('pista')
  const [folgaId, setFolgaId] = useState('igual')

  const party = useMemo(
    () => (store.activeParty.length ? store.activeParty : store.roster).slice(0, GANGUES_STORY_BATTLE_PARTY_MAX),
    [store.activeParty, store.roster],
  )
  const nivelMedio = party.length
    ? Math.round(party.reduce((s, m) => s + getGanguesLevelFromXp(m.xp_total), 0) / party.length)
    : 1
  const recorde = store.storyProgress.__torre || {}

  if (store.campaignClears < 1) { onNavigate('modes'); return null }
  if (!party.length) { onNavigate('lobby'); return null }

  const lutar = (andar, terr, folga) => {
    const config = GANGUES_TERRITORIO_ENCONTRO[terr]
    const fator = FOLGAS.find(f => f.id === folga)?.fator ?? 1
    const base = calcularPontosTime(party)
    // budget sobe ~8% por andar; nunca abaixo do nº de corpos mínimo
    const pontos = Math.max(4, Math.round(base * fator * (1 + (andar - 1) * 0.08)))
    store.setStoryTarget({
      territorioId: terr,
      enemyId: config.moldes[0],
      dificuldade: folga === 'brabo' ? 'dificil' : folga === 'leve' ? 'facil' : 'normal',
      pontosFixos: pontos,
      torre: true,
      torreAndar: andar,
      isChefe: false,
      fixo: false,
    })
    sfx.vs?.()
    onNavigate('story-combat')
  }

  const iniciar = () => {
    sfx.select?.()
    store.torreIniciar({ territorioId, folga: folgaId })
    lutar(1, territorioId, folgaId)
  }

  // ── Já numa subida ativa: tela de "andar N" ──
  if (torre) {
    return (
      <main className="gang-torre">
        <header className="gang-torre__top">
          <button className="gang-torre__back" onClick={() => { sfx.cancel?.(); store.torreEncerrar(); onNavigate('modes') }}>
            ← {t('games.gangues.batalha.sair_torre')}
          </button>
        </header>
        <div className="gang-torre__andar-hero">
          <span className="gang-torre__eyebrow">{t(`games.gangues.story.territorios.${torre.territorioId}.nome`)}</span>
          <b className="gang-torre__andar-num">{t('games.gangues.batalha.andar', { n: torre.andar })}</b>
          <small>{t(`games.gangues.batalha.folga.${torre.folga}`)}</small>
        </div>
        <div className="gang-torre__acoes">
          <button className="gang-torre__go" onClick={() => { sfx.select?.(); lutar(torre.andar, torre.territorioId, torre.folga) }}>
            {t('games.gangues.batalha.continuar')}
          </button>
          <button className="gang-torre__quit" onClick={() => { sfx.cancel?.(); store.torreEncerrar(); onNavigate('modes') }}>
            {t('games.gangues.batalha.encerrar')}
          </button>
        </div>
      </main>
    )
  }

  // ── Seletor: tema + folga ──
  return (
    <main className="gang-torre">
      <header className="gang-torre__top">
        <button className="gang-torre__back" onClick={() => { sfx.cancel?.(); onNavigate('modes') }}>
          ← {t('games.gangues.progression.back_to_roster')}
        </button>
      </header>

      <div className="gang-torre__title">
        <h1>{t('games.gangues.batalha.titulo')}</h1>
        <p>{t('games.gangues.batalha.sub', { n: nivelMedio })}</p>
      </div>

      <section className="gang-torre__bloco">
        <h2>{t('games.gangues.batalha.escolha_tema')}</h2>
        <div className="gang-torre__temas">
          {GANGUES_TERRITORIOS.map(terr => (
            <button
              key={terr.id}
              className={`gang-torre__tema${territorioId === terr.id ? ' is-active' : ''}`}
              style={{ '--terr-cor': terr.cor }}
              onClick={() => { sfx.select?.(); setTerritorioId(terr.id) }}
            >
              <strong>{t(`games.gangues.story.territorios.${terr.id}.nome`)}</strong>
              {recorde[terr.id] ? <small>{t('games.gangues.batalha.recorde', { n: recorde[terr.id] })}</small> : <small>—</small>}
            </button>
          ))}
        </div>
      </section>

      <section className="gang-torre__bloco">
        <h2>{t('games.gangues.batalha.escolha_folga')}</h2>
        <div className="gang-torre__folgas">
          {FOLGAS.map(f => (
            <button
              key={f.id}
              className={`gang-torre__folga${folgaId === f.id ? ' is-active' : ''}`}
              onClick={() => { sfx.select?.(); setFolgaId(f.id) }}
            >
              <strong>{t(`games.gangues.batalha.folga.${f.id}`)}</strong>
              <small>{t(`games.gangues.batalha.folga_desc.${f.id}`)}</small>
            </button>
          ))}
        </div>
      </section>

      <button className="gang-torre__go" onClick={iniciar}>
        {t('games.gangues.batalha.subir')}
      </button>
    </main>
  )
}
