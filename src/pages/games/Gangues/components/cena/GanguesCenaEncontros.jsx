import { useState } from 'react'
import { getGanguesEnemyPortraitById } from '../../data/ganguesEnemyPortraits.js'
import { pontosPreviewPoi } from '../../data/ganguesEncontros.js'
import { nivelRealDePontos } from '../../data/ganguesDificuldade.js'

// Os dois modais de "encarar ou não": o encontro aleatório de rua e a treta
// programada (POI/chefe). Extraído de GanguesCena.jsx
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §5).
export function EventoVS({ fala, onSim, onNao, cenaId, t }) {
  const b = `games.gangues.cena.${cenaId}.evento`
  return <div className="gang-cena-enc gang-cena-enc--vs gang-cena-enc--evento">
    <span className="gang-cena-enc-selo">!</span>
    <span className="gang-cena-eyebrow">{t('games.gangues.cena.evento_tag')}</span>
    <h3 className="gang-cena-enc-titulo">{t(`${b}.nome`)}</h3>
    <p className="gang-cena-papo-fala">{fala}</p>
    <div className="gang-cena-enc-acoes">
      <button className="gang-cena-btn" onClick={onNao}>{t('games.gangues.cena.evento_nao')}</button>
      <button className="gang-cena-btn gang-cena-btn--go" onClick={onSim}>{t('games.gangues.cena.evento_sim')}</button>
    </div>
  </div>
}

export function TretaVS({ poi, fala, nivelTropa, avisoOff, onOcultarAviso, onSim, onNao, t, territorioId }) {
  const nome = poi.ehChefe ? t(`games.gangues.story.bosses.${poi.boss}.nome`) : t(`${poi.i18n}.nome`)
  const falaRaw = fala ?? (poi.ehChefe ? t(`games.gangues.story.bosses.${poi.boss}.fala`, { suaGangue: t('games.gangues.report.your_gang') }) : t(`${poi.i18n}.fala`))
  const falaShow = Array.isArray(falaRaw) ? falaRaw[0] : falaRaw
  // Aviso de nível: só quando a tropa tá 2+ níveis ABAIXO do recomendado — 1 de
  // diferença não conta (dado, equipamento e estratégia cobrem). Igual/acima
  // ou só 1 abaixo: nada. `avisoOff` = o jogador pediu pra não ver mais nesse
  // território (reseta ao trocar de bairro).
  // BUG achado pelo Isaias (19/09/2026, 2x seguidas): `poi.nivelRec` é o
  // MESMO número usado como orçamento de pontos do inimigo (ex. "beco"
  // nivelRec:8 = ficha de 8 pontos) — mas 8 pontos de ficha correspondem a
  // um nível REAL de personagem bem menor (~2), não 8. O aviso comparava
  // esse número direto com `nivelTropa` (nível real da tropa), dando um
  // "recomendado nível 8" mentiroso pra uma treta que na prática é fácil.
  // Fix: converte pro nível real equivalente (nivelRealDePontos) antes de
  // comparar/exibir — não mexe no orçamento de combate em si (pontosFixo
  // continua o mesmo, só a tradução pra "nível" na tela fica honesta).
  const nivelRecReal = poi.nivelRec ? nivelRealDePontos(pontosPreviewPoi(poi, territorioId) ?? poi.nivelRec) : null
  const abaixo = !avisoOff && nivelRecReal && Number.isFinite(nivelTropa) && (nivelRecReal - nivelTropa) >= 2
  const retrato = getGanguesEnemyPortraitById(poi.enemy)
  // Falha de carregamento (rede ruim — ver GanguesRetratoImg/AGENTS.md
  // 15/09/2026) cai pra inicial, igual quando não tem retrato nenhum.
  const [retratoFalhou, setRetratoFalhou] = useState(false)
  const temFoto = Boolean(retrato) && !retratoFalhou
  return <div className="gang-cena-enc gang-cena-enc--vs">
    <span className={`gang-cena-enc-selo${temFoto ? ' gang-cena-enc-selo--foto' : ''}`}>{temFoto ? <img src={retrato} alt="" onError={() => setRetratoFalhou(true)} /> : (nome || '?')[0]}</span>
    <span className="gang-cena-eyebrow">{poi.ehChefe ? t('games.gangues.story.boss_tag') : t('games.gangues.cena.tipo.treta')}</span>
    <h3 className="gang-cena-enc-titulo">{nome}</h3>
    <p className="gang-cena-papo-fala">{falaShow}</p>
    {abaixo && <div className="gang-cena-vs-aviso">⚠ {t('games.gangues.cena.nivel_rec_baixo', { rec: nivelRecReal, atual: nivelTropa })}<button type="button" className="gang-cena-vs-aviso-off" onClick={onOcultarAviso}>{t('games.gangues.cena.nivel_rec_ocultar')}</button></div>}
    <div className="gang-cena-enc-acoes">
      <button className="gang-cena-btn" onClick={onNao}>{t('games.gangues.cena.treta_nao')}</button>
      <button className={`gang-cena-btn gang-cena-btn--go${abaixo ? ' gang-cena-btn--risco' : ''}`} onClick={onSim}>{t(abaixo ? 'games.gangues.cena.treta_sim_risco' : 'games.gangues.cena.treta_sim')}</button>
    </div>
  </div>
}
