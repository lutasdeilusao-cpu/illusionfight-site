import { Link } from 'react-router-dom'
import BackToGamesBtn from '../../../../../components/BackToGamesBtn/BackToGamesBtn'

export default function GameOverScreen({
  placar, historicoRodadas, jaGanhouHoje, user, atributos, onJogarNovamente, tt
}) {
  const venceu = placar?.jogador > placar?.ia
  const empatou = placar?.jogador === placar?.ia
  const rodadasJogadas = historicoRodadas?.length || 0
  const vitorias = historicoRodadas?.filter(h => h.resultado === 'ganhou').length || 0
  const derrotas = historicoRodadas?.filter(h => h.resultado === 'perdeu').length || 0
  const empates = historicoRodadas?.filter(h => h.resultado === 'empate').length || 0
  const freqAttr = {}
  historicoRodadas?.forEach(h => { freqAttr[h.atributo] = (freqAttr[h.atributo] || 0) + 1 })
  const attrMaisEscolhido = Object.entries(freqAttr).sort((a, b) => b[1] - a[1])[0]?.[0] || '\u2014'
  let melhorDiferenca = -1, melhorRodada = null
  historicoRodadas?.forEach(h => {
    if (h.resultado === 'ganhou') {
      const attr = atributos?.find(a => a.nomeKey === h.atributo)
      const diff = h.valorJogador - h.valorIA
      if (diff > melhorDiferenca) { melhorDiferenca = diff; melhorRodada = h }
    }
  })
  const icone = venceu ? '\uD83C\uDFC6' : empatou ? '\uD83E\uDD1D' : '\uD83D\uDC80'
  const titulo = venceu ? tt('result_voce_venceu') : empatou ? tt('result_empate') : tt('result_ia_venceu')

  return (
    <section className="tt-page">
      <div className="tt-relatorio">
        <h2 className="tt-relatorio-titulo">{tt('relatorio_titulo')}</h2>
        <p className="tt-relatorio-sub">{tt('relatorio_sub')}</p>
        <div className="tt-relatorio-icone">{icone}</div>
        <h3 className={`tt-relatorio-resultado${venceu ? ' tt-fim-titulo--vitoria' : empatou ? ' tt-fim-titulo--empate' : ' tt-fim-titulo--derrota'}`}>{titulo}</h3>
        {!user && (
          <p className="tt-guest-cta">
            {tt('guest_cta_criar_conta')}{' '}
            <Link to="/cadastro">{tt('guest_cta_link')}</Link>
          </p>
        )}
        <div className="tt-relatorio-placar">
          <div className="tt-relatorio-placar-item"><span className="tt-relatorio-placar-valor">{placar?.jogador}</span><span className="tt-relatorio-placar-label">{tt('relatorio_voce')}</span></div>
          <span className="tt-relatorio-placar-divisor">{'\u00D7'}</span>
          <div className="tt-relatorio-placar-item"><span className="tt-relatorio-placar-valor">{placar?.ia}</span><span className="tt-relatorio-placar-label">{tt('relatorio_ia_label')}</span></div>
        </div>
        <div className="tt-relatorio-stats">
          <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{rodadasJogadas}</span><span className="tt-relatorio-stat-label">{tt('relatorio_rodadas')}</span></div>
          <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{vitorias}</span><span className="tt-relatorio-stat-label">{tt('relatorio_vitorias')}</span></div>
          <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{derrotas}</span><span className="tt-relatorio-stat-label">{tt('relatorio_derrotas')}</span></div>
          <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{empates}</span><span className="tt-relatorio-stat-label">{tt('relatorio_empates')}</span></div>
          <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{attrMaisEscolhido}</span><span className="tt-relatorio-stat-label">{tt('relatorio_attr_usado')}</span></div>
          <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{melhorRodada?.cartaJogador?.nome || '\u2014'}</span><span className="tt-relatorio-stat-label">{tt('relatorio_melhor_vitoria')}</span></div>
        </div>
        <div className="tt-relatorio-lista">
          <h4 className="tt-relatorio-lista-titulo">{tt('relatorio_confrontos')}</h4>
          {historicoRodadas?.map((h, i) => (
            <div key={i} className="tt-relatorio-lista-item">
              <span className="tt-relatorio-lista-icon">{h.resultado === 'ganhou' ? '\u2713' : h.resultado === 'perdeu' ? '\u2717' : '='}</span>
              <span className="tt-relatorio-lista-nome">{h.cartaJogador?.nome} vs {h.cartaIA?.nome}</span>
              <span className="tt-relatorio-lista-attr">{h.atributo}</span>
              <span className="tt-relatorio-lista-valor">{h.valorJogador} {'\u00D7'} {h.valorIA}</span>
            </div>
          ))}
        </div>
        {venceu && jaGanhouHoje && <p className="tt-fim-aviso">{tt('relatorio_ja_ganhou')}</p>}
        <div className="tt-fim-actions">
          <button className="tt-btn-jogar" onClick={onJogarNovamente}>{tt('btn_jogar_novamente')}</button>
          <BackToGamesBtn label={tt('menu_voltar_menu')} />
        </div>
      </div>
    </section>
  )
}
