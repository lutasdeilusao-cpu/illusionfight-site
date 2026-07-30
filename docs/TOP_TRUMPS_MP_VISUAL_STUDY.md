# Estudo de modernização visual — Top Trumps Multiplayer

Data: 2026-07-30  
Escopo analisado: Top Trumps single-player v5.45.0 e multiplayer v5.12.12  
Status: Etapa 1 concluída em 2026-07-30; gameplay e cartas ainda mantêm o layout legado.

## Progresso

- [x] Etapa 0 — baseline funcional validado em partida de cinco rodadas.
- [x] Etapa 1 — infraestrutura visual compartilhada.
- [ ] Etapa 2 — tela de gameplay com carta oficial.
- [ ] Etapa 3 — revelação com swipe.
- [ ] Etapa 4 — jokenpô controlado.
- [ ] Etapa 5 — resultado final.
- [ ] Etapa 6 — limpeza de CSS legado.

Na Etapa 1, o multiplayer passou a consumir `FireParticles`, `BurstParticles`, `CurtainReveal` e `SoundToggle` compartilhados, importou os tokens oficiais e passou a pré-carregar as artes resolvidas exclusivamente por `topTrumpsCardImages.js`. As cartas genéricas continuam visíveis até a Etapa 2.

## 1. Objetivo

Levar o multiplayer para a linguagem visual mobile-first atual do single-player, incluindo cartas e artes oficiais, sem alterar o protocolo multiplayer que hoje cobre:

- matchmaking público e reconciliação de sala;
- entrada dos dois jogadores na mesma sala;
- jokenpô sincronizado;
- barreira de segurança antes da jogada;
- temporizador e jogada automática;
- realtime, polling de reconciliação e deduplicação;
- autoridade única para avanço de rodada;
- encerramento sincronizado e retorno ao lobby.

A modernização deve ser cosmética e estrutural na camada de apresentação. Regras de rede e persistência não devem ser reescritas junto com a troca visual.

## 2. Diagnóstico da implementação atual

### Single-player

`TopTrumpsSP.jsx` tem 52 linhas e atua como composition root. Estado e regras ficam em hooks especializados, enquanto cada fase possui uma tela:

- `MenuScreen`;
- `GameScreen`;
- `ResultScreen`;
- `RewardScreen`;
- `GameOverScreen`;
- `Jokempo`.

O visual atual usa:

- container retrato com `max-width: 480px`;
- altura baseada em `100dvh`;
- layout mobile-first;
- `TopTrumpsCard` como renderizador oficial;
- `topTrumpsCardImages.js` como resolvedor exclusivo das artes;
- templates oficiais `TemplateBaseReutilizavel-00..05`;
- carta adversária em modo `mystery`;
- resultado com navegação horizontal entre as duas cartas;
- componentes próprios para partículas, cortina e efeitos;
- tokens compartilhados em `styles/tokens.css`.

### Multiplayer

`TopTrumpsMP.jsx` tem 1.185 linhas e acumula:

- estado de apresentação;
- carregamento de decks;
- protocolo de sala;
- subscriptions;
- polling;
- watchdog;
- jokenpô;
- relógio;
- resolução de rodada;
- efeitos;
- markup de todas as fases.

`TopTrumpsMP.css` tem 889 linhas e recria localmente HUD, cartas, partículas, cortina, jokenpô e tela final.

As cartas multiplayer atuais são painéis genéricos com iniciais, nome e lista de atributos. Elas não utilizam:

- `TopTrumpsCard`;
- `getTopTrumpsCardImage`;
- artes oficiais;
- templates oficiais;
- modo `mystery` oficial;
- interação por regiões da carta.

Essa duplicação é a principal distância visual e também aumenta o risco de divergência futura.

## 3. Regra arquitetural principal

Compartilhar apresentação, não compartilhar regra de jogo.

O single-player deve continuar usando `useTopTrumpsSP`. O multiplayer deve continuar usando seu protocolo de Supabase e sua máquina de estados online. Ambos podem consumir componentes visuais puros com contratos explícitos.

```text
Single-player hooks ─┐
                     ├─> componentes visuais Top Trumps
Multiplayer online ──┘
```

Nenhum componente visual compartilhado deve:

- consultar Supabase;
- conhecer `salaId`;
- registrar movimentos;
- decidir autoridade;
- avançar turno;
- iniciar polling;
- alterar o status da sala.

Ele recebe dados e callbacks por propriedades.

## 4. Contratos funcionais que não podem ser quebrados

Antes da modernização, estes comportamentos devem ser tratados como invariantes:

1. `sala.turno_atual` é a fonte autoritativa do turno.
2. Apenas J1 grava avanço e encerramento da sala.
3. Movimento atrasado não altera `jaMovi` da rodada atual.
4. Cada resolução usa a chave `salaId:turno`.
5. A barreira de cinco segundos antecede a liberação da jogada.
6. O temporizador só começa com sala, carta, fase e autoridade válidas.
7. Realtime e polling permanecem ativos como mecanismos complementares.
8. A sala remota pode ficar retida durante a revelação.
9. A troca para a próxima rodada ocorre somente após a apresentação do resultado.
10. Sala encerrada não pode rearmar relógio ou gerar nova jogada.
11. O matchmaking preserva a sala recém-retornada pelo RPC.
12. Ambos os clientes devem enxergar o mesmo ID de sala antes do jokenpô.

Durante a implementação visual, alterações nas áreas responsáveis por esses contratos devem ser evitadas. Se forem inevitáveis, precisam de tarefa funcional separada.

## 5. Arquitetura proposta

### 5.1 Composition root multiplayer

`TopTrumpsMP.jsx` deve terminar como orquestrador, semelhante ao single-player:

```jsx
if (fase === 'carregando') return <MultiplayerLoadingScreen />
if (fase === 'ppt') return <MultiplayerJokempoScreen />
if (fase === 'jogando') return <MultiplayerGameScreen />
if (fase === 'revelacao') return <MultiplayerResultScreen />
if (fase === 'fim') return <MultiplayerGameOverScreen />
```

O arquivo continuará dono da integração entre os hooks até uma etapa posterior segura. A primeira extração deve mover apenas JSX e efeitos puramente visuais.

### 5.2 Componentes compartilháveis sem regra

Componentes atuais que podem ser reutilizados diretamente:

- `TopTrumpsCard`;
- `FireParticles`;
- `BurstParticles`;
- `CurtainReveal`;
- `SoundToggle`, após conferir o contrato atual.

Componentes que precisam virar apresentação parametrizável:

- cabeçalho/HUD;
- área principal de uma carta;
- miniatura misteriosa do adversário;
- comparação de resultado;
- visualizador deslizável de cartas;
- relatório final.

### 5.3 Componentes multiplayer propostos

Criar no máximo de forma incremental, nunca todos de uma vez:

```text
components/multiplayer/
├── MultiplayerGameScreen.jsx
├── MultiplayerResultScreen.jsx
├── MultiplayerGameOverScreen.jsx
└── MultiplayerStatus.jsx
```

`MultiplayerGameScreen`

- recebe carta local, arte, placar, rodada e timer;
- usa `TopTrumpsCard`;
- converte `onAttributeClick` em `jogarAtributo`;
- respeita `rodadaLiberada`, `ehMinhaVez`, `jaMovi` e `girando`;
- mostra carta oficial `mystery` para o oponente;
- não conhece Supabase.

`MultiplayerResultScreen`

- recebe as duas cartas já resolvidas;
- reutiliza o padrão swipe do `ResultScreen`;
- exibe nome real do oponente;
- chama apenas `onProximaRodada`;
- não altera sala nem turno.

`MultiplayerGameOverScreen`

- adapta o relatório final para `eu` e `oponente`;
- mantém retorno automático ao lobby controlado pelo container;
- não inicia navegação por conta própria.

`MultiplayerStatus`

- reúne mensagens de sincronização: minha vez, oponente escolhendo, aguardando confirmação e barreira;
- não decide se uma ação está liberada.

## 6. Mapeamento visual SP → MP

| Single-player | Multiplayer atual | Destino |
|---|---|---|
| `GameScreen` | JSX dentro de `fase === 'jogando'` | `MultiplayerGameScreen` usando a mesma composição retrato |
| `TopTrumpsCard` oficial | `.ttmp-card` genérico | `TopTrumpsCard` com arte oficial |
| carta `mystery` mini | painel `???` grande | carta oficial misteriosa mini |
| score jogador × IA | você × nome do oponente | HUD parametrizado |
| IA escolhendo | adversário escolhendo | mesmo tratamento visual, texto multiplayer |
| confirmação de atributo | clique envia imediatamente | manter sem modal inicialmente para não mudar timing |
| `ResultScreen` swipe | duas cartas lado a lado | swipe mobile-first com cartas oficiais |
| `GameOverScreen` | fim simplificado | relatório multiplayer compacto |
| `Jokempo` compartilhado | jokenpô próprio | avaliar adaptação do componente compartilhado |
| efeitos compartilhados | cópias `ttmp-*` | reutilizar componentes existentes |

## 7. Decisões visuais

### Gameplay

- Portrait obrigatório, largura máxima de 480px.
- Uma carta local oficial ocupa a maior área útil.
- Carta adversária permanece pequena e oculta até a revelação.
- HUD deve ocupar uma única faixa compacta.
- Timer fica no HUD e não sobre a área clicável da carta.
- Estado bloqueado deve ser perceptível sem reduzir demais a legibilidade.
- Atributos só recebem interação quando todos os gates funcionais estiverem abertos.

### Resultado da rodada

- Não exibir duas cartas oficiais completas lado a lado em telas estreitas.
- Usar o swipe já validado no single-player.
- Placar, atributo e valores permanecem visíveis durante o swipe.
- Botão de próxima rodada permanece separado da área arrastável.

### Jokenpô

- Preservar a sincronização atual.
- A primeira implementação pode manter seu markup atual e receber apenas tokens/layout.
- Reutilizar `Jokempo` somente depois de criar um adaptador online; o componente não pode assumir adversário local/IA nem calcular resultado no cliente.

### Tela final

- Mostrar placar e vencedor de forma inequívoca.
- Exibir contagem das rodadas realmente resolvidas quando o histórico multiplayer estiver disponível.
- Informar visualmente o retorno automático ao lobby.
- Não oferecer “jogar novamente” dentro da sala encerrada.

## 8. Estratégia CSS

1. Importar `styles/tokens.css` no escopo das novas telas.
2. Usar prefixos compartilhados apenas para elementos realmente idênticos.
3. Manter prefixo `ttmp-` para estados exclusivos online.
4. Evitar copiar as 314 linhas de `TopTrumpsCard.css`.
5. Remover CSS multiplayer obsoleto somente após cada fase migrada e validada.
6. Não criar overrides desktop no fim como base do design; a base nasce em portrait.
7. Respeitar `env(safe-area-inset-*)` e `100dvh`.
8. Não usar `style={{}}` para propriedades visuais.

Observação: `GameScreen` atualmente altera a largura de uma barra via `ref.style.width`. Essa técnica não deve ser copiada para novos componentes.

## 9. Plano de implementação incremental

### Etapa 0 — Baseline funcional

- Registrar uma sessão completa de cinco rodadas em dois clientes.
- Salvar logs esperados de matchmaking, jokenpô, cinco avanços e encerramento.
- Capturar screenshots mobile dos estados principais.
- Não alterar UI nesta etapa.

Critério de saída: partida completa repetível antes da migração visual.

### Etapa 1 — Infraestrutura visual

- Extrair partículas, cortina e toggle de som duplicados.
- Importar tokens oficiais.
- Adicionar resolvedor de imagem oficial ao fluxo MP.
- Não substituir ainda a carta genérica.

Critério de saída: nenhum comportamento ou layout principal modificado.

### Etapa 2 — Tela de gameplay

- Criar `MultiplayerGameScreen`.
- Trocar somente a fase `jogando`.
- Usar `TopTrumpsCard` oficial para a carta local.
- Usar `mystery + mini` para o adversário.
- Manter timer, barreira e callbacks existentes.

Critério de saída: cinco rodadas funcionam e nenhuma ação é possível durante bloqueios.

### Etapa 3 — Revelação

- Criar `MultiplayerResultScreen`.
- Migrar a fase `revelacao` para cartas oficiais e swipe.
- Reutilizar partículas e cortina.
- Preservar `salaPendenteRef` e o clique de próxima rodada.

Critério de saída: os dois clientes veem cartas, atributo, valores e resultado equivalentes.

### Etapa 4 — Jokenpô

- Criar adaptador visual para o `Jokempo` compartilhado ou tematizar o existente.
- Manter `escolherPPT` e a resolução remota fora do componente visual.

Critério de saída: escolhas simultâneas continuam sincronizadas e empate reinicia corretamente.

### Etapa 5 — Resultado final

- Criar `MultiplayerGameOverScreen`.
- Adaptar o relatório visual.
- Mostrar contagem regressiva do retorno ao lobby.
- Preservar encerramento remoto e redirect existentes.

Critério de saída: uma única tela final e retorno dos dois clientes ao lobby.

### Etapa 6 — Limpeza

- Remover markup e CSS `ttmp-*` comprovadamente órfãos.
- Verificar que nenhuma classe usada no lobby foi removida.
- Revisar imports e duplicações.
- Atualizar este documento e `SITE_MAP.md`.

Critério de saída: nenhum estilo legado interfere nas telas novas.

## 10. Testes necessários por etapa

### Funcionais em dois clientes

- usuário A entra primeiro e usuário B entra depois;
- usuário B entra primeiro e usuário A entra depois;
- diferença de 30–60 segundos entre entradas;
- escolhas rápidas e lentas no jokenpô;
- turno de A e turno de B;
- clique antes da barreira;
- timeout sem clique;
- cinco rodadas completas;
- resultado final nos dois clientes;
- retorno ao lobby;
- nova partida após retorno.

### Visuais

- 360×800;
- 390×844;
- 430×932;
- 480×900;
- viewport desktop mantendo coluna portrait;
- PT, EN e ES;
- nomes longos de personagem e jogador;
- cartas com valores de oito dígitos;
- safe area e teclado/zoom do navegador;
- carta mystery e carta revelada.

### Regressão técnica

- IDs das cartas coincidem nos três catálogos;
- nenhuma arte cai em `card-fallback.png`;
- nenhuma subscription adicional é criada por componente visual;
- não há novo `setInterval` na camada de UI;
- `TopTrumpsMP.jsx` mantém os logs diagnósticos;
- build com sourcemap permanece habilitada.

## 11. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Reutilizar `GameScreen` diretamente e herdar conceitos de IA | Criar adaptador/tela MP usando componentes visuais menores |
| Mover lógica ao extrair JSX | Passar valores e callbacks; nenhuma chamada Supabase nos componentes |
| Carta oficial grande estourar viewport | Reutilizar escalas e wrappers já testados no SP |
| Clique duplicado em label e valor da carta | Manter gate funcional no callback do container além do `disabled` visual |
| CSS `.tt-*` global colidir com `.ttmp-*` | Migrar fase por fase e auditar seletores |
| Jokenpô compartilhado calcular resultado localmente | Criar modo controlado por props antes de reutilizar |
| Tela final navegar antes de ambos receberem encerramento | Redirect continua no container após `fase === 'fim'` |
| Refactor grande esconder regressão multiplayer | Um commit/versionamento/deploy por etapa funcional |

## 12. Arquivos que devem permanecer funcionalmente estáveis

Durante as etapas exclusivamente visuais, evitar mudanças de comportamento em:

- `src/hooks/useTopTrumpsMP.js`;
- subscriptions e reconciliação dentro de `TopTrumpsMP.jsx`;
- `resolverRodada`;
- `seguirParaProximaRodada`;
- temporizador;
- barreira de cinco segundos;
- matchmaking do lobby.

Alterações nesses pontos devem ser justificadas e testadas como correção funcional separada.

## 13. Avaliação de tamanho e extração

`TopTrumpsMP.jsx` e `TopTrumpsMP.css` ultrapassam 300 linhas. A extração é necessária antes de acrescentar nova apresentação:

- JSX por fase deve sair do arquivo principal;
- CSS deve acompanhar o componente correspondente;
- a extração deve começar pela tela de gameplay;
- lógica de rede não deve ser extraída no mesmo commit da troca visual.

Essa abordagem reduz o arquivo sem transformar a modernização cosmética em reescrita do multiplayer.

## 14. Ordem recomendada

1. Baseline funcional e screenshots.
2. Infraestrutura visual compartilhada.
3. Gameplay com carta oficial.
4. Revelação com swipe.
5. Jokenpô controlado.
6. Relatório final.
7. Limpeza de CSS legado.

Não é recomendado executar tudo em um único deploy. O ponto seguro de parada após cada etapa é uma partida completa entre dois clientes.

## 15. Resultado esperado

Ao final, o multiplayer terá a mesma identidade visual do single-player:

- coluna portrait mobile-first;
- cartas e artes oficiais;
- carta adversária misteriosa;
- HUD compacto;
- revelação por swipe;
- efeitos compartilhados;
- relatório final moderno.

Internamente, continuará sendo o multiplayer já estabilizado, com seus contratos de sala, turno, autoridade, realtime, reconciliação e encerramento preservados.
