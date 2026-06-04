# PLANO REFACTORY — Jack Dream Candy v2.0.0

## Objetivo
Refatoração completa do jogo Jack Dream Candy:
1. Eliminar todo ASCII do código (StatusBar HP bar, comentários, referências)
2. Refatorar Vila para navegação ramificada baseada em mundo/cidades
3. Dungeons NÃO aparecem na Vila — separadas em tela própria
4. Interior com UI moderna, ícones/emojis, estilo balão de mensagem
5. Inventario com dropdowns, slots de equipamento, visual de game
6. Expansão completa com 3 Arcos narrativos + 3 cidades

## ARQUIVOS A MODIFICAR
| Arquivo | Status | Mudanças |
|---------|--------|----------|
| `data/flags.js` | NOVO | Centralizar todas as flags |
| `data/cidades.js` | NOVO | Definição das 3 cidades e seus locais |
| `data/npcs.js` | EXPANDIR | +Lara, Karim, Operativo, Viran, Tira; Osvaldo → missão |
| `data/itens.js` | EXPANDIR | +20 itens dos Arcos I/II/III |
| `data/dungeons.js` | EXPANDIR | +10 dungeons dos Arcos I/II/III |
| `data/monologues.js` | EXPANDIR | +40 monólogos |
| `store/useJackStore.js` | EXPANDIR | fragmentos, Primordial, dia/noite, cidadeAtual, aliado |
| `screens/Vila.jsx` | REWRITE | Sistema de cidades, sem dungeons, ramificado |
| `screens/Interior.jsx` | REWRITE | Moderno, ícones, balões |
| `screens/Inventario.jsx` | REWRITE | Dropdowns, equip slots, visual game |
| `screens/DungeonSelect.jsx` | REFATORAR | Usar cards da Vila |
| `screens/Dungeon.jsx` | MANTER | Já refeito sem ASCII em v1.5.1 |
| `screens/Intro.jsx` | CHECAR | Verificar ASCII residual |
| `components/StatusBar.jsx` | REFATORAR | Remover ASCII HP bar, adicionar dia/noite |
| `components/CombatLog.jsx` | CHECAR | Verificar ASCII residual |
| `components/Monologue.jsx` | CHECAR | Verificar ASCII residual |
| `JackCandy.jsx` | AJUSTAR | Suporte multi-cidade |
| `JackCandy.css` | EXPANDIR | Classes novas para lojas, inventário, cidades |

## ETAPA 1 — LIMPEZA ASCII
- [ ] StatusBar.jsx: trocar `█░` por div CSS gradiente
- [ ] Grep em todo projeto por ASCII/ascii remanescente
- [ ] Remover comentários mencionando ASCII

## ETAPA 2 — DATA LAYER
- [ ] Criar `flags.js` com todas flags do jogo
- [ ] Criar `cidades.js` com Marelia, Auranis, Karnazar
- [ ] Expandir `npcs.js` com todos NPCs novos
- [ ] Expandir `itens.js` com todos itens novos
- [ ] Expandir `dungeons.js` com todas dungeons novas
- [ ] Expandir `monologues.js` com todos monólogos novos

## ETAPA 3 — STORE
- [ ] Adicionar `fragmentos` (terceiro recurso)
- [ ] Adicionar `medidorPrimordial` (0-10)
- [ ] Adicionar `periodo` (dia/noite)
- [ ] Adicionar `cidadeAtual` (marelia/auranis/karnazar)
- [ ] Adicionar `aliadoAtual` (null/kim/nina/shuntaro)
- [ ] Novas actions: alternarPeriodo, setCidade, setAliado, gastarFragmentos

## ETAPA 4 — UI VILA
- [ ] Rewrite Vila.jsx com sistema de cidades
- [ ] Cards com emoji, gradiente, hover effects
- [ ] Navegação entre cidades via setas/botões
- [ ] Locais desbloqueados por flags
- [ ] Balão de mensagem ao entrar em local
- [ ] Dungeons removidas da grid → DungeonSelect.jsx

## ETAPA 5 — UI INTERIOR (LOJA)
- [ ] Rewrite Interior.jsx com visual moderno
- [ ] Itens com ícones emoji
- [ ] Categorias por tipo (arma/armadura/consumível)
- [ ] Balão de saudação do NPC
- [ ] Confirmação de compra com feedback visual

## ETAPA 6 — UI INVENTÁRIO
- [ ] Rewrite Inventario.jsx visual game
- [ ] Slots de equipamento com dropdown para trocar
- [ ] Mochila com categorias (consumíveis/upgrades)
- [ ] Visual do personagem com slots
- [ ] Drag-drop ou clique para equipar/usar

## ETAPA 7 — SISTEMAS NOVOS
- [ ] Botão dia/noite na StatusBar
- [ ] Display medidor Primordial (pós-KRONOS_VIU)
- [ ] Sistema de aliados (pré-dungeon)
- [ ] Sistema de investigação (3 missões)

## ETAPA 8 — DEPLOY
- [ ] Bump JACK_VERSION → 2.0.0
- [ ] SITE_MAP.md atualizado
- [ ] Build + commit + push + deploy
- [ ] Relatório completo
