import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { sfx } from '../../../../../lib/sfx'
import enemiesData from '../../data/gangues-enemies.json'
import { getGanguesEnemyPortraitById } from '../../data/ganguesEnemyPortraits.js'
import {
  apostasPossiveis, tetoAposta, DESAFIO_DIFICULDADES, sortearPuzzle, premio,
  montarRinhaApostas, rodarBrigaNpc,
} from '../../data/ganguesApostas.js'
import PuzzleForça from '../../../../../components/Puzzles/PuzzleForça'
import PuzzleStealthGrid from '../../../../../components/Puzzles/PuzzleStealthGrid'
import PuzzleDecoder from '../../../../../components/Puzzles/PuzzleDecoder'
import PuzzleSimonSays from '../../../../../components/Puzzles/PuzzleSimonSays'
import PuzzleAnagrama from '../../../../../components/Puzzles/PuzzleAnagrama'
import PuzzleLabirinto from '../../../../../components/Puzzles/PuzzleLabirinto'
import GanguesRetratoImg from '../GanguesRetratoImg'
import '../../../../../components/Puzzles/Puzzles.css'

/* A BANCA (29/09/2026, pedido do Isaias) — onde se farma grana sem porrada.
   Duas mesas: o DESAFIO DE MÃO (aposta + puzzle sorteado) e a RINHA DE
   APOSTA (duas fichas NPC brigam sozinhas, aposta num lado). A regra mora
   em data/ganguesApostas.js; aqui é só tela. A grana sai na hora de
   apostar e volta multiplicada se ganhar. */

const PUZZLES = { forca: PuzzleForça, stealth: PuzzleStealthGrid, decoder: PuzzleDecoder, simon: PuzzleSimonSays, anagrama: PuzzleAnagrama, labirinto: PuzzleLabirinto }

function EscolhaAposta({ t, valores, valor, onValor }) {
  if (!valores.length) return <p className="gang-banca-aviso">{t('games.gangues.banca.sem_grana')}</p>
  return (
    <div className="gang-banca-valores">
      {valores.map(v => (
        <button key={v} type="button" className={`gang-banca-valor${v === valor ? ' is-on' : ''}`} onClick={() => { sfx.select?.(); onValor(v) }}>{v}</button>
      ))}
    </div>
  )
}

function MesaDesafio({ t, store, onFim }) {
  const valores = apostasPossiveis(store.rep, store.grana)
  const [valor, setValor] = useState(valores[0] || 0)
  const [jogo, setJogo] = useState(null) // { puzzle, dif, valor }
  const [fim, setFim] = useState(null)

  const comecar = dif => {
    if (!valor || !store.gastarGrana(valor)) { sfx.cancel?.(); return }
    sfx.vs?.()
    setJogo({ puzzle: sortearPuzzle(), dif, valor })
  }
  const terminar = ok => {
    const ganho = ok ? premio(jogo.valor, jogo.dif.mult) : 0
    if (ganho) store.ganharGrana(ganho)
    ok ? sfx.win?.() : sfx.lose?.()
    setFim({ ok, ganho, valor: jogo.valor })
    setJogo(null)
    onFim?.()
  }

  if (jogo) {
    const Puzzle = PUZZLES[jogo.puzzle]
    return (
      <motion.div className="gang-cena-puzzle-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="gang-banca-rodando">{t('games.gangues.banca.desafio_jogando', { valor: jogo.valor, premio: premio(jogo.valor, jogo.dif.mult) })}</p>
        <Puzzle config={{ difficulty: jogo.dif.id }} onSolve={() => terminar(true)} onFail={() => terminar(false)} />
      </motion.div>
    )
  }
  return (
    <div className="gang-banca-mesa">
      {fim && <p className={`gang-banca-resultado${fim.ok ? ' is-ganhou' : ''}`}>{fim.ok ? t('games.gangues.banca.ganhou', { n: fim.ganho }) : t('games.gangues.banca.perdeu', { n: fim.valor })}</p>}
      <p className="gang-cena-enc-sub">{t('games.gangues.banca.desafio_intro')}</p>
      <EscolhaAposta t={t} valores={valores} valor={valor} onValor={setValor} />
      <div className="gang-banca-difs">
        {DESAFIO_DIFICULDADES.map(d => (
          <button key={d.id} type="button" className="gang-cena-btn gang-cena-btn--go" disabled={!valor} onClick={() => comecar(d)}>
            {t(`games.gangues.banca.dif.${d.id}`)} <b>×{d.mult}</b>
          </button>
        ))}
      </div>
    </div>
  )
}

function Lutador({ t, c, cotacao, escolhido, onEscolher, vencedor }) {
  const foto = getGanguesEnemyPortraitById(c.molde)
  const nome = t(`games.gangues.enemy_names.${c.molde}`)
  const s = c.stats
  return (
    <button type="button" className={`gang-banca-lutador${escolhido ? ' is-on' : ''}${vencedor ? ' is-venceu' : ''}`} onClick={onEscolher}>
      <span className="gang-banca-lutador__foto"><GanguesRetratoImg src={foto} fallback={nome[0]} /></span>
      <strong>{nome}</strong>
      <small>{t('games.gangues.banca.ficha', { a: s.A, h: s.H, d: s.D, pv: s.PV, pm: s.PM })}</small>
      <b>×{cotacao}</b>
    </button>
  )
}

function MesaRinha({ t, store, poi, onFim }) {
  const valores = apostasPossiveis(store.rep, store.grana)
  const [valor, setValor] = useState(valores[0] || 0)
  const [lado, setLado] = useState(null)
  const [rodada, setRodada] = useState(0)
  const [luta, setLuta] = useState(null) // { linhas, vencedor, ganho }
  const [mostradas, setMostradas] = useState(0)

  // `rodada` sorteia uma dupla nova a cada "outra rinha".
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dupla = useMemo(() => montarRinhaApostas({ pool: poi.rinhaPool, enemiesData, pontosBase: poi.rinhaPontos || 8 }), [rodada])

  useEffect(() => {
    if (!luta || mostradas >= luta.linhas.length) return
    const timer = setTimeout(() => setMostradas(n => n + 1), 650)
    return () => clearTimeout(timer)
  }, [luta, mostradas])

  const apostar = () => {
    if (!lado || !valor || !store.gastarGrana(valor)) { sfx.cancel?.(); return }
    sfx.vs?.()
    const res = rodarBrigaNpc(dupla.a, dupla.b)
    const nomeDe = key => t(`games.gangues.enemy_names.${key.includes('rinha-a') ? dupla.a.molde : dupla.b.molde}`)
    const linhas = res.eventos.filter(ev => ev.type === 'attack').slice(-6).map(ev => t('games.gangues.banca.linha_golpe', { quem: nomeDe(ev.actorKey), dano: ev.result.damage }))
    const cot = lado === 'a' ? dupla.cotacaoA : dupla.cotacaoB
    const ganho = res.vencedor === lado ? premio(valor, cot) : 0
    if (ganho) store.ganharGrana(ganho)
    setMostradas(0)
    setLuta({ linhas, vencedor: res.vencedor, ganho, valor })
    onFim?.()
  }
  const outra = () => { setLuta(null); setLado(null); setRodada(r => r + 1) }

  const acabou = luta && mostradas >= luta.linhas.length
  useEffect(() => { if (acabou) (luta.ganho ? sfx.win?.() : sfx.lose?.()) }, [acabou, luta])

  return (
    <div className="gang-banca-mesa">
      <p className="gang-cena-enc-sub">{t('games.gangues.banca.rinha_intro')}</p>
      <div className="gang-banca-duelo">
        <Lutador t={t} c={dupla.a} cotacao={dupla.cotacaoA} escolhido={lado === 'a'} vencedor={acabou && luta.vencedor === 'a'} onEscolher={() => !luta && setLado('a')} />
        <span className="gang-banca-x">×</span>
        <Lutador t={t} c={dupla.b} cotacao={dupla.cotacaoB} escolhido={lado === 'b'} vencedor={acabou && luta.vencedor === 'b'} onEscolher={() => !luta && setLado('b')} />
      </div>
      {!luta && <>
        <EscolhaAposta t={t} valores={valores} valor={valor} onValor={setValor} />
        <button type="button" className="gang-cena-btn gang-cena-btn--go" disabled={!lado || !valor} onClick={apostar}>{t('games.gangues.banca.apostar')}</button>
      </>}
      {luta && <div className="gang-banca-log">
        {luta.linhas.slice(0, mostradas).map((l, i) => <p key={i}>{l}</p>)}
        {acabou && <p className={`gang-banca-resultado${luta.ganho ? ' is-ganhou' : ''}`}>{luta.ganho ? t('games.gangues.banca.ganhou', { n: luta.ganho }) : t('games.gangues.banca.perdeu', { n: luta.valor })}</p>}
        {acabou && <button type="button" className="gang-cena-btn" onClick={outra}>{t('games.gangues.banca.outra_rinha')}</button>}
      </div>}
    </div>
  )
}

export default function GanguesBanca({ poi, onClose }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [mesa, setMesa] = useState('desafio')
  const [, setTick] = useState(0)
  const foto = getGanguesEnemyPortraitById(poi.retratoEnemyId)
  const nome = t(`${poi.i18n}.nome`)
  return (
    <div className="gang-cena-enc gang-cena-enc--banca">
      <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
      <span className={`gang-cena-enc-selo${foto ? ' gang-cena-enc-selo--foto' : ''}`}><GanguesRetratoImg src={foto} fallback={nome[0]} /></span>
      <span className="gang-cena-eyebrow">{t('games.gangues.cena.tipo.banca')}</span>
      <h3 className="gang-cena-enc-titulo">{nome}</h3>
      <p className="gang-cena-papo-fala">{t(`${poi.i18n}.fala`)}</p>
      <p className="gang-banca-saldo">💵 {store.grana} · {t('games.gangues.banca.teto', { n: tetoAposta(store.rep) })}</p>
      <div className="gang-banca-abas">
        {['desafio', 'rinha'].map(m => (
          <button key={m} type="button" className={`gang-banca-aba${mesa === m ? ' is-on' : ''}`} onClick={() => { sfx.select?.(); setMesa(m) }}>{t(`games.gangues.banca.mesa_${m}`)}</button>
        ))}
      </div>
      {mesa === 'desafio'
        ? <MesaDesafio t={t} store={store} onFim={() => setTick(n => n + 1)} />
        : <MesaRinha t={t} store={store} poi={poi} onFim={() => setTick(n => n + 1)} />}
    </div>
  )
}
