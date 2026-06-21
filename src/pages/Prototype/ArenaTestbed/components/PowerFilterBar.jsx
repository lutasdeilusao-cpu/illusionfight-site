import { useLanguage } from '../../../../context/LanguageContext'
import SortToggle from './SortToggle'
import './PowerFilterBar.css'

const ELEMENTOS = ['fogo', 'agua', 'terra', 'ar', 'trevas', 'luz']

export default function PowerFilterBar({ filtroElemento, setFiltroElemento, ordenacao, setOrdenacao, setSortDir }) {
  const { t } = useLanguage()

  function toggleSort(campo) {
    if (ordenacao === campo) {
      setSortDir(prev => prev === 'crescente' ? 'decrescente' : 'crescente')
    } else {
      setOrdenacao(campo)
      setSortDir('crescente')
    }
  }

  return (
    <div className="pfb-root">
      <div className="pfb-elementos">
        <button
          className={`pfb-elem-btn ${filtroElemento === null ? 'pfb-elem-btn--ativo' : ''}`}
          onClick={() => setFiltroElemento(null)}
        >
          {t('prototype.arena_testbed.pfb_geral')}
        </button>
        {ELEMENTOS.map(elem => (
          <button
            key={elem}
            className={`pfb-elem-btn pfb-elem-btn--${elem} ${filtroElemento === elem ? 'pfb-elem-btn--ativo' : ''}`}
            onClick={() => setFiltroElemento(elem)}
          >
            {t('prototype.arena_testbed.pfb_' + elem)}
          </button>
        ))}
      </div>

      <div className="pfb-ordem">
        <SortToggle
          label={t('prototype.arena_testbed.pfb_ordem_fa')}
          ativo={ordenacao === 'fa'}
          crescente={ordenacao === 'fa'}
          onClick={() => toggleSort('fa')}
        />
        <SortToggle
          label={t('prototype.arena_testbed.pfb_ordem_fd')}
          ativo={ordenacao === 'fd'}
          crescente={ordenacao === 'fd'}
          onClick={() => toggleSort('fd')}
        />
        <SortToggle
          label={t('prototype.arena_testbed.pfb_ordem_az')}
          ativo={ordenacao === 'az'}
          crescente={true}
          onClick={() => toggleSort('az')}
        />
      </div>
    </div>
  )
}
