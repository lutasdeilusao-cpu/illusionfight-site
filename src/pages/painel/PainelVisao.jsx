// Aba "Visão geral": números do período, série por dia, funil e rankings.
import { Kpi, Cartao, Lista, Serie, Funil } from './PainelBlocos'
import { num, duracao } from './painelUtil'

const lista = (arr, campo = 'sessoes') => (arr || []).map(o => ({ chave: o.chave, valor: o[campo] }))

export default function PainelVisao({ dados, t, locale, onFiltro }) {
  const k = dados?.kpis || {}
  const f = dados?.funil || {}
  const n = v => num(v, locale)

  return (
    <div className="painel-grade">
      <div className="painel-kpis">
        <Kpi rotulo={t('painel.kpi.visitantes')} valor={n(k.visitantes)} sub={t('painel.kpi.novos_voltaram', { novos: n(k.novos), voltaram: n(k.voltaram) })} destaque />
        <Kpi rotulo={t('painel.kpi.sessoes')} valor={n(k.sessoes)} sub={t('painel.kpi.logados', { n: n(k.logados) })} />
        <Kpi rotulo={t('painel.kpi.paginas')} valor={n(k.paginas)} sub={k.sessoes ? t('painel.kpi.por_sessao', { n: (k.paginas / k.sessoes).toFixed(1) }) : null} />
        <Kpi rotulo={t('painel.kpi.tempo')} valor={duracao(k.duracao_media)} sub={t('painel.kpi.por_sessao_curto')} />
        <Kpi rotulo={t('painel.kpi.rejeicao')} valor={`${k.rejeicao || 0}%`} />
        <Kpi rotulo={t('painel.kpi.cadastros')} valor={n(k.cadastros)} />
      </div>

      <Cartao titulo={t('painel.cartao.por_dia')}>
        <Serie pontos={(dados?.serie || []).map(d => ({ rotulo: d.dia.slice(5).split('-').reverse().join('/'), valor: d.visitantes }))} vazio={t('painel.vazio')} formatar={n} />
      </Cartao>

      <Cartao titulo={t('painel.cartao.por_hora')}>
        <Serie pontos={Array.from({ length: 24 }, (_, h) => ({ rotulo: String(h).padStart(2, '0'), valor: (dados?.horas || []).find(x => x.hora === h)?.sessoes || 0 }))} vazio={t('painel.vazio')} formatar={n} />
      </Cartao>

      <Cartao titulo={t('painel.cartao.funil')}>
        <Funil etapas={[
          { rotulo: t('painel.funil.entraram'), valor: f.entraram || 0 },
          { rotulo: t('painel.funil.engajaram'), valor: f.engajaram || 0 },
          { rotulo: t('painel.funil.consumiram'), valor: f.consumiram || 0 },
          { rotulo: t('painel.funil.cadastraram'), valor: f.cadastraram || 0 },
        ]} />
      </Cartao>

      <Cartao titulo={t('painel.cartao.paginas')}>
        <Lista
          itens={(dados?.paginas || []).map(p => ({ chave: p.rota, titulo: p.titulo, valor: p.views, extra: `${n(p.visitantes)} · ${duracao(p.tempo)}` }))}
          vazio={t('painel.vazio')} formatar={n}
          onEscolher={i => onFiltro('rota', i.chave)}
        />
      </Cartao>

      <Cartao titulo={t('painel.cartao.origens')}>
        <Lista itens={lista(dados?.origens)} vazio={t('painel.vazio')} formatar={n} onEscolher={i => onFiltro('origem', i.chave)} />
      </Cartao>

      <Cartao titulo={t('painel.cartao.conteudo')}>
        <Lista
          itens={(dados?.conteudo || []).map(c => ({ chave: `${c.tipo === 'jogo' ? '🎮' : '📖'} ${c.chave}`, valor: c.tempo_total, extra: `${n(c.sessoes)} · ${t('painel.media')} ${duracao(c.tempo_medio)}` }))}
          vazio={t('painel.vazio')} formatar={duracao}
        />
      </Cartao>

      <Cartao titulo={t('painel.cartao.lugares')}>
        <Lista itens={lista(dados?.lugares)} vazio={t('painel.vazio_lugar')} formatar={n} />
      </Cartao>

      <Cartao titulo={t('painel.cartao.dispositivos')}>
        <Lista itens={lista(dados?.dispositivos)} vazio={t('painel.vazio')} formatar={n} onEscolher={i => onFiltro('dispositivo', i.chave)} />
      </Cartao>

      <Cartao titulo={t('painel.cartao.modelos')}>
        <Lista itens={lista(dados?.modelos)} vazio={t('painel.vazio')} formatar={n} />
      </Cartao>

      <Cartao titulo={t('painel.cartao.sistemas')}>
        <Lista itens={lista(dados?.sistemas)} vazio={t('painel.vazio')} formatar={n} />
      </Cartao>

      <Cartao titulo={t('painel.cartao.navegadores')}>
        <Lista itens={lista(dados?.navegadores)} vazio={t('painel.vazio')} formatar={n} />
      </Cartao>

      <Cartao titulo={t('painel.cartao.telas')}>
        <Lista itens={lista(dados?.telas)} vazio={t('painel.vazio')} formatar={n} />
      </Cartao>

      <Cartao titulo={t('painel.cartao.idiomas')}>
        <Lista itens={lista(dados?.idiomas)} vazio={t('painel.vazio')} formatar={n} onEscolher={i => onFiltro('idioma', i.chave)} />
      </Cartao>

      <Cartao titulo={t('painel.cartao.eventos')}>
        <Lista itens={(dados?.eventos || []).map(e => ({ chave: e.chave, valor: e.total, extra: t('painel.em_sessoes', { n: n(e.sessoes) }) }))} vazio={t('painel.vazio')} formatar={n} />
      </Cartao>
    </div>
  )
}
