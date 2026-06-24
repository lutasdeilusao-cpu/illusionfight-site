# 0 - Template de proposta

<a id="nome-da-demanda-resumo-curto"></a>

# \[Nome da demanda\] — \[Resumo curto\]

**Área / Produto:** \[Nome da área, produto ou módulo\]  
**Task:** \[Link ou identificador da task\]  
**Solicitante:** \[Nome do solicitante\]  
**Responsável:** \[Nome do responsável, se houver\]

* * *

<a id="contexto"></a>

## Contexto

\[Explique brevemente o cenário atual, o problema identificado ou a oportunidade que motivou esta demanda.\]

\[Inclua informações relevantes para entender por que essa alteração é necessária.\]

* * *

<a id="objetivo"></a>

## Objetivo

\[Descreva o resultado esperado de forma clara e direta.\]

\[Explique o que deve mudar para usuários, operação, sistema ou processo após a entrega.\]

* * *

<a id="escopo"></a>

## Escopo

<a id="incluído"></a>

### Incluído

- \[Item que faz parte da entrega\]
- \[Item que faz parte da entrega\]
- \[Item que faz parte da entrega\]

<a id="fora-de-escopo"></a>

### Fora de escopo

- \[Item que não será tratado nesta demanda\]
- \[Item que deve virar outra demanda, se necessário\]

* * *

<a id="requisitos"></a>

## Requisitos

<a id="funcionais"></a>

### Funcionais

- \[O sistema/usuário deve conseguir fazer algo\]
- \[Regra ou comportamento esperado\]
- \[Fluxo, validação, permissão ou ação necessária\]

<a id="não-funcionais"></a>

### Não funcionais

- \[Requisito de desempenho, segurança, compatibilidade, rastreabilidade ou usabilidade\]
- \[Restrição técnica ou operacional relevante\]

* * *

<a id="regras-de-negócio"></a>

## Regras de negócio

| Regra | Descrição |
| --- | --- |
| \[Regra 1\] | \[Descrição da regra\] |
| \[Regra 2\] | \[Descrição da regra\] |

* * *

<a id="dados-e-campos"></a>

## Dados e campos

| Campo / Informação | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `[nomeDoCampo]` | `[tipo]` | `[Sim/Não]` | `[Descrição, validação ou regra]` |
| `[nomeDoCampo]` | `[tipo]` | `[Sim/Não]` | `[Descrição, validação ou regra]` |

> **Observação:** \[Inclua decisões, limitações ou pontos de atenção sobre os dados.\]

* * *

<a id="comportamento-esperado"></a>

## Comportamento esperado

- \[Descreva o comportamento esperado no fluxo principal.\]
- \[Descreva comportamentos alternativos, exceções ou mensagens.\]
- \[Informe como dados antigos, ausentes ou inválidos devem ser tratados.\]

* * *

<a id="interface-experiência"></a>

## Interface / Experiência

\[Descreva telas, componentes, estados, textos, filtros, ações ou interações necessárias, se aplicável.\]

- \[Tela, seção ou componente impactado\]
- \[Ação disponível para o usuário\]
- \[Estado vazio, erro, carregamento ou sucesso\]

* * *

<a id="integrações-e-dependências"></a>

## Integrações e dependências

- \[Sistema, serviço, API, fila, planilha, rotina ou equipe dependente\]
- \[Permissão, configuração, feature flag ou dado necessário\]
- \[Dependência técnica ou de negócio\]

* * *

<a id="auditoria-histórico-ou-logs"></a>

## Auditoria, histórico ou logs

\[Descreva se a demanda precisa registrar alterações, eventos, erros, usuário responsável, data/hora ou origem da ação.\]

Exemplo:

```
{
  "entityId": "entity_123",
  "action": "updated",
  "changedBy": "user_456",
  "changedAt": 1765550000000,
  "changes": [
    {
      "field": "fieldName",
      "previousValue": "valor anterior",
      "newValue": "novo valor"
    }
  ]
}

```

* * *

<a id="relatórios-consultas-ou-exportações"></a>

## Relatórios, consultas ou exportações

\[Descreva necessidades de listagem, busca, filtros, ordenação, indicadores, dashboards ou exportação, se aplicável.\]

| Informação | Regra / Origem |
| --- | --- |
| \[Informação 1\] | \[Regra, cálculo ou origem\] |
| \[Informação 2\] | \[Regra, cálculo ou origem\] |

* * *

<a id="plano-de-implementação-sugerido"></a>

## Plano de implementação sugerido

<a id="produto-negócio"></a>

### Produto / Negócio

- \[Validar regra, texto, fluxo ou critério\]
- \[Definir responsáveis, permissões ou operação\]

<a id="design-interface"></a>

### Design / Interface

- \[Criar ou ajustar telas/componentes\]
- \[Validar estados e mensagens\]

<a id="engenharia"></a>

### Engenharia

- \[Alterar modelo, serviço, endpoint, tela ou rotina\]
- \[Garantir compatibilidade com dados existentes\]
- \[Adicionar logs, eventos ou validações\]

<a id="qa-e-testes-unitários-funcionais"></a>

### QA e Testes Unitários/Funcionais

- \[Testar fluxo principal\]
- \[Testar exceções e dados inválidos\]
- \[Testar compatibilidade com registros antigos\]
- \[Testar permissões, filtros ou integrações, se aplicável\]

* * *

<a id="critérios-de-aceite"></a>

## Critérios de aceite

- \[Critério objetivo e verificável\]
- \[Critério objetivo e verificável\]
- \[Critério objetivo e verificável\]
- \[Critério objetivo e verificável\]

* * *

<a id="riscos-e-pontos-de-atenção"></a>

## Riscos e pontos de atenção

- \[Risco, impacto ou dúvida em aberto\]
- \[Dependência que pode bloquear ou atrasar a entrega\]
- \[Ponto que precisa de validação antes ou durante o desenvolvimento\]

* * *

<a id="observações"></a>

## Observações

- \[Informações adicionais\]
- \[Links, referências, exemplos ou decisões tomadas\]