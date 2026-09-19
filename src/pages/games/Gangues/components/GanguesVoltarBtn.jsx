import { useLanguage } from '../../../../context/LanguageContext'

/* Botão de voltar PADRÃO do LDI Gangues (pedido do Isaias, 18/09/2026:
   "os botões estão fora de padrão... a gente tem que padronizar...
   tem que ser um botão grande no alto ali com um bom destaque"). Antes
   cada tela tinha seu próprio botão de voltar — texto pequeno em âmbar
   (`.gang-progression-screen-back`), ou o botão vermelho de "sair do
   jogo" reaproveitado pra só voltar um passo (GanguesTerritorio), cada
   um num canto diferente. Agora é UM componente só, sempre no topo,
   sempre a mesma cara — usado em toda tela que não seja a primeira
   (onde mora o "Sair", ver GanguesSaveSelect/GanguesNaming) nem a
   batalha (que tem seu próprio fluxo de confirmação, ver
   GanguesCombatSairConfirm.jsx). */
export default function GanguesVoltarBtn({ onClick, className = '' }) {
  const { t } = useLanguage()
  // A própria chave i18n já vem com a seta embutida ("← voltar"/"← back"/
  // "← volver") — não duplica aqui.
  return (
    <button type="button" className={`gang-voltar-btn ${className}`.trim()} onClick={onClick}>
      {t('games.gangues.btn_voltar')}
    </button>
  )
}
