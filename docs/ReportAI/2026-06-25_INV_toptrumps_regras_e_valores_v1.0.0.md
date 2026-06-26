# INV — Top Trumps: Regras, Valores e Arquitetura

**Data:** 2026-06-25
**Versão do documento:** 1.0.0
**Jogo:** Top Trumps LDI (single-player)
**Arquivo principal:** `src/pages/TopTrumps.jsx` (1158 linhas)

---

## 1. Arquitetura Geral

### 1.1 Stack
- **React 19** — componente funcional único `TopTrumps()` contendo todo o estado via `useState`
- **Zustand não usado** — jogo não segue o padrão dos outros jogos do site
- **i18n** — via `LanguageContext` + `cardLabels.js`
- **Persistência** — deck do jogador em Supabase (`toptrumps_decks`), autenticação via `AuthContext`
- **SFX** — `src/lib/sfx.js` (heartbeat loop, click, win, lose, draw, card flip, etc.)

### 1.2 Estrutura de diretórios (Top Trumps)
```
src/pages/
  TopTrumps.jsx              ← Single-player (1158 linhas)
  TopTrumpsMP.jsx            ← Multiplayer (960 linhas)
  TopTrumps.css              ← Estilos SP
  TopTrumpsMP.css            ← Estilos MP
  TopTrumps/
    components/
      CardViewerModal.jsx
      DeckBuilder.jsx
      DeckStartModal.jsx

src/components/
  TopTrumpsCard/             ← Componente de carta reutilizável (SP e MP)

src/data/
  supertrunfo-pt.json        ← 76 cartas em português
  supertrunfo-en.json        ← 76 cartas em inglês
  supertrunfo-es.json        ← 76 cartas em espanhol

src/hooks/
  useLeaderboardDB.js        ← Deck + partidas + ranking (419 linhas)
  useTopTrumpsMP.js          ← Sala multiplayer + movimentos

src/i18n/
  cardLabels.js              ← ATTR_META (7 atributos jogáveis + RANK informativo)
```

### 1.3 JSON: meta declara 105 cartas, mas existem apenas 76
O campo `meta.total_cartas` diz **105**, mas o array `cartas` contém apenas **76** objetos (IDs 1–76). Faltam **29 cartas** (IDs 77–105) para atingir o total declarado.

---

## 2. Cartas e Atributos

### 2.1 Atributos (8 no total)
| Chave | Exibição | Faixa | Inverso | Jogável | Descrição |
|---|---|---|---|---|---|
| `rank_sdr` | RANK | 0–999999 | ✅ menor vence | ❌ | Ranking mundial SDR. Apenas informativo na carta. |
| `poder_mental` | PM/MP | 0–100 | ❌ | ✅ | Energia mental em batalha |
| `velocidade` | VL/SPD | 0–100 | ❌ | ✅ | Reação e movimento |
| `resistencia` | RE/RES | 0–100 | ❌ | ✅ | Absorção de dano |
| `nivel_xama` | NX/SL | 0–10 | ❌ | ✅ | Domínio elemental |
| `fator_caos` | FC/CF | 0–100 | ❌ | ✅ | Imprevisibilidade |
| `energia_base` | EB/BE | 0–100 | ❌ | ✅ | Reserva de energia |
| `poder_explosivo` | PE/EP | 0–100 | ❌ | ✅ | Liberação súbita |

**Total de 7 atributos jogáveis** (rank_sdr excluído).

### 2.2 ATTR_META (cardLabels.js:42–49)
```js
export const ATTR_META = [
  { key: 'poder_mental',    labelId: 'pm',   max: 100, cssKey: 'pm' },
  { key: 'resistencia',     labelId: 're',   max: 100, cssKey: 're' },
  { key: 'velocidade',      labelId: 'vl',   max: 100, cssKey: 'vl' },
  { key: 'nivel_xama',      labelId: 'nx',   max: 10,  cssKey: 'nx' },
  { key: 'fator_caos',      labelId: 'fc',   max: 100, cssKey: 'fc' },
  { key: 'energia_base',    labelId: 'eb',   max: 100, cssKey: 'eb' },
  { key: 'poder_explosivo', labelId: 'pe',   max: 100, cssKey: 'pe' },
]
```
Nota: `rank_sdr` **não** está em `ATTR_META` — não tem max fixo, não é jogável.

### 2.3 Tabela completa de atributos por carta (76 cartas)

| ID | Carta | rank_sdr | PM | VL | RE | NX | FC | EB | PE |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Kim | 1201 | 94 | 78 | 85 | 9 | 99 | 70 | 100 |
| 2 | Jack | 10776 | 71 | 88 | 62 | 5 | 82 | 65 | 74 |
| 3 | Nina | 8724 | 76 | 85 | 79 | 4 | 61 | 72 | 68 |
| 4 | Thunderbolt | 30156 | 68 | 91 | 70 | 2 | 45 | 60 | 55 |
| 5 | Shuntaro | 998 | 83 | 87 | 74 | 7 | 68 | 78 | 72 |
| 6 | Lisa | 500 | 88 | 82 | 80 | 6 | 73 | 80 | 77 |
| 7 | Nexus Phantasm | 1 | 95 | 70 | 99 | 3 | 96 | 90 | 88 |
| 8 | Pajé Yawanari | 1 | 100 | 40 | 100 | 10 | 88 | 100 | 95 |
| 9 | VoidHunter_X | 1 | 91 | 76 | 97 | 8 | 94 | 88 | 91 |
| 10 | David Kronos | 1 | 99 | 55 | 98 | 10 | 91 | 95 | 97 |
| 11 | Xakaxi | 1 | 97 | 72 | 95 | 9 | 50 | 92 | 80 |
| 12 | Nara | 1 | 88 | 90 | 86 | 8 | 79 | 85 | 87 |
| 13 | Powa | 1 | 85 | 65 | 80 | 8 | 95 | 75 | 100 |
| 14 | Helena | 999999 | 55 | 45 | 90 | 0 | 88 | 30 | 20 |
| 15 | Osvaldo | 750000 | 70 | 40 | 65 | 3 | 25 | 55 | 35 |
| 16 | Ryan | 500000 | 52 | 44 | 48 | 1 | 30 | 40 | 45 |
| 17 | Samuel | 900000 | 38 | 50 | 60 | 0 | 35 | 45 | 40 |
| 18 | Roxy | 200000 | 65 | 74 | 71 | 0 | 77 | 60 | 58 |
| 19 | Brock | 400000 | 55 | 62 | 78 | 0 | 48 | 55 | 50 |
| 20 | Walter | 999999 | 48 | 30 | 55 | 0 | 20 | 35 | 15 |
| 21 | A Máquina | 999999 | 92 | 35 | 70 | 0 | 10 | 85 | 20 |
| 22 | IA NeoGuide | 0 | 100 | 100 | 100 | 0 | 50 | 100 | 60 |
| 23 | O Narrador | 1 | 88 | 85 | 90 | 5 | 100 | 80 | 70 |
| 24 | Sarah | 3200 | 85 | 77 | 73 | 5 | 55 | 78 | 72 |
| 25 | Alex | 15000 | 77 | 80 | 68 | 4 | 42 | 72 | 65 |
| 26 | Mia | 999999 | 78 | 70 | 75 | 3 | 60 | 65 | 82 |
| 27 | Jaret | 45000 | 80 | 55 | 92 | 6 | 38 | 82 | 75 |
| 28 | Mikael | 8000 | 90 | 72 | 68 | 4 | 35 | 82 | 78 |
| 29 | Isabella | 12000 | 79 | 93 | 60 | 3 | 70 | 68 | 80 |
| 30 | Tira | 28000 | 86 | 65 | 74 | 5 | 30 | 76 | 68 |
| 31 | Kawa | 1 | 82 | 88 | 85 | 7 | 45 | 80 | 85 |
| 32 | Tawira | 1 | 84 | 86 | 80 | 8 | 58 | 82 | 79 |
| 33 | Iara | 1 | 90 | 60 | 78 | 9 | 35 | 88 | 55 |
| 34 | Garra Negra | 1 | 88 | 82 | 94 | 9 | 90 | 85 | 92 |
| 35 | Ferro Vivo | 2200 | 78 | 75 | 98 | 2 | 20 | 90 | 65 |
| 36 | Kimura | 4500 | 84 | 82 | 71 | 5 | 62 | 75 | 80 |
| 37 | Doru | 5800 | 82 | 87 | 76 | 6 | 55 | 80 | 78 |
| 38 | Sena | 18000 | 74 | 91 | 62 | 4 | 80 | 70 | 73 |
| 39 | Mako | 9200 | 80 | 68 | 85 | 6 | 40 | 82 | 72 |
| 40 | Kei | 3000 | 83 | 86 | 66 | 5 | 88 | 72 | 76 |
| 41 | Brenda | 35000 | 68 | 85 | 70 | 4 | 97 | 65 | 82 |
| 42 | Tairo | 22000 | 76 | 50 | 95 | 6 | 28 | 88 | 80 |
| 43 | Luna | 6700 | 87 | 70 | 65 | 5 | 50 | 80 | 84 |
| 44 | Rex | 55000 | 62 | 78 | 82 | 2 | 85 | 58 | 77 |
| 45 | Elara | 7300 | 82 | 89 | 67 | 6 | 58 | 78 | 76 |
| 46 | Ozzy | 42000 | 61 | 72 | 75 | 3 | 65 | 60 | 78 |
| 47 | Zeph | 11000 | 78 | 75 | 80 | 3 | 44 | 74 | 70 |
| 48 | Ora | 1 | 98 | 55 | 72 | 9 | 40 | 92 | 70 |
| 49 | Tank | 38000 | 60 | 30 | 100 | 2 | 22 | 85 | 55 |
| 50 | Asha | 4100 | 89 | 80 | 68 | 7 | 65 | 82 | 79 |
| 51 | Gu | 1800 | 86 | 90 | 72 | 6 | 75 | 80 | 82 |
| 52 | Neon | 3600 | 91 | 78 | 63 | 4 | 82 | 82 | 80 |
| 53 | Vera | 48000 | 65 | 68 | 85 | 3 | 60 | 72 | 65 |
| 54 | Sol Dourado | 13000 | 81 | 76 | 75 | 5 | 52 | 80 | 85 |
| 55 | Frio Eterno | 6200 | 85 | 63 | 88 | 7 | 30 | 86 | 80 |
| 56 | Ryu | 2800 | 83 | 98 | 62 | 5 | 55 | 75 | 82 |
| 57 | Ana | 9800 | 85 | 62 | 82 | 7 | 48 | 84 | 72 |
| 58 | Vulcão | 7900 | 74 | 58 | 95 | 6 | 60 | 88 | 90 |
| 59 | Ghost | 5400 | 88 | 82 | 65 | 6 | 92 | 80 | 75 |
| 60 | Berto | 52000 | 70 | 55 | 90 | 3 | 38 | 78 | 88 |
| 61 | Yuki | 48000 | 72 | 80 | 66 | 4 | 50 | 68 | 72 |
| 62 | Cris | 85000 | 60 | 76 | 70 | 2 | 72 | 58 | 68 |
| 63 | Ferro Espiral | 14000 | 83 | 72 | 77 | 4 | 42 | 78 | 76 |
| 64 | Dom | 5100 | 94 | 65 | 70 | 7 | 65 | 82 | 74 |
| 65 | Mari | 39000 | 70 | 88 | 66 | 4 | 76 | 68 | 75 |
| 66 | Sam | 8200 | 92 | 58 | 68 | 2 | 38 | 80 | 70 |
| 67 | Toru | 4800 | 84 | 85 | 72 | 6 | 58 | 80 | 82 |
| 68 | Bea | 7600 | 87 | 74 | 68 | 6 | 62 | 80 | 78 |
| 69 | Kal | 10200 | 80 | 68 | 96 | 5 | 40 | 85 | 78 |
| 70 | Pip | 3800 | 88 | 78 | 68 | 7 | 80 | 78 | 85 |
| 71 | Zara | 11500 | 82 | 76 | 72 | 5 | 55 | 76 | 68 |
| 72 | Hiro | 15500 | 81 | 58 | 95 | 6 | 32 | 82 | 60 |
| 73 | São | 62000 | 65 | 96 | 80 | 3 | 50 | 88 | 58 |
| 74 | Vale das Cinzas | 1 | 97 | 88 | 94 | 10 | 100 | 95 | 99 |
| 75 | Kim Primordial | 1 | 100 | 95 | 98 | 10 | 95 | 100 | 100 |
| 76 | Alan | 1 | 99 | 97 | 96 | 9 | 88 | 95 | 96 |

### 2.4 Extremos por atributo

| Atributo | Min | Carta(s) min | Max | Carta(s) max | Spread |
|---|---|---|---|---|---|
| rank_sdr | 1 | Nexus, Yawanari, Void, David, Xakaxi, Nara, Powa, Narrador, Kawa, Tawira, Iara, Garra Negra, Ora, Vale das Cinzas, Kim Primordial, Alan (16 cartas) | 999999 | Helena, Walter, A Máquina, Mia | 999998 |
| poder_mental | 38 | Samuel | 100 | Yawanari, NeoGuide, Kim Primordial | 62 |
| velocidade | 30 | Walter, Tank | 100 | NeoGuide | 70 |
| resistencia | 48 | Ryan | 100 | Yawanari, NeoGuide, Tank | 52 |
| nivel_xama | 0 | Helena, Samuel, Roxy, Brock, Walter, A Máquina, NeoGuide (7 cartas) | 10 | Yawanari, David, Vale das Cinzas, Kim Primordial | 10 |
| fator_caos | 10 | A Máquina | 100 | Narrador, Vale das Cinzas | 90 |
| energia_base | 30 | Helena | 100 | Yawanari, NeoGuide, Kim Primordial | 70 |
| poder_explosivo | 15 | Walter | 100 | Kim, Powa, Kim Primordial | 85 |

### 2.5 Observações sobre valores
- **rank_sdr** tem escala absurda (1 a 999999) — 16 cartas têm rank_sdr=1 (considerados topo), 4 têm 999999 (considerados fracos), 1 tem 0 (NeoGuide).
- **nivel_xama** é o único atributo com escala 0–10; 7 cartas têm nivel_xama=0 (Helena, Samuel, Roxy, Brock, Walter, A Máquina, NeoGuide).
- **Nenhuma carta tem todos atributos zerados** — todas 76 cartas têm pelo menos alguns valores >0.
- Cartas **primordial** (ids 74–76: Vale das Cinzas, Kim Primordial, Alan) têm valores extremos em quase todos atributos.

---

## 3. Season 1 — Coleção inicial

### 3.1 SEASON_1_IDS (TopTrumps.jsx:54–66)
30 cartas definidas como a temporada atual:
```
kim_briguento, jack_vitoria, nina_angel,
thunderbolt_trovao, shuntaro_rei_xama,
lisa_top500, nexus_phantasm, yawanari_imortal,
voidhunter_void, david_kronos_primordial,
xakaxi_cacique, nara_guerreira, powa_corrompido,
helena_sobrevivente, osvaldo_porteiro, ryan_grato,
samuel_valentao, roxy_mercenaria, brock_lider_capanga,
walter_diretor, a_maquina_professor, neo_guide_ia,
narrador_arena, sarah_arenia, alex_draymoor,
mia_thessor, jaret_wendor, mikael_zylvaron,
isabella_erendale, tira_valetis
```

### 3.2 Filtragem
`todasCartas` (linha 103) é filtrada automaticamente para incluir **apenas cartas em SEASON_1_IDS**:
```js
const todasCartas = deck.cartas.filter(c => SEASON_1_IDS.includes(c.id))
```
Isso significa que cartas com ID 31–76 **nunca aparecem** no jogo single-player atual (só viriam se adicionadas a SEASON_1_IDS ou se a lógica mudasse).

### 3.3 Distribuição
- **20 cartas** distribuidas para novos jogadores
- **10 cartas** reservadas para eventos do admin

### 3.4 TIER_OVERRIDE
```js
const TIER_OVERRIDE = { nexus_phantasm: 'primordial' }
```
Nexus Phantasm (originalmente elite) sobe para primordial na Season 1.

### 3.5 Tiers
```json
["free", "elite", "primordial", "lendario", "sombra"]
```

---

## 4. Regras do Jogo (Single-Player)

### 4.1 Fluxo de fases
```
menu → ppt → jogando → (resolverRodada → resultado_rodada → jogando)ⁿ → recompensa
                                                                        → fim_jogo
```

### 4.2 Inicialização (menu)
1. Deck do jogador é carregado do Supabase (`toptrumps_decks`) ou gerado via `getCartasIniciais()`.
2. Jogador escolhe **totalTurnos**: 5, 10, 15 ou 20 (deve ser ≤ deckUsuario.length).
3. Ao clicar "Jogar", chama `iniciarJogoComCartas()`.

### 4.3 Distribuição de cartas por partida
```js
const pool = embaralhar([...deckUsuario])
const cartasJogador = pool.slice(0, 5)
const cartasIA = embaralhar([...deckUsuario]).slice(0, 5)
```
- **5 cartas únicas** para o jogador (do topo do pool embaralhado)
- **5 cartas únicas** para a IA (também do mesmo pool, embaralhado separadamente)
- Cartas podem coincidir entre jogador e IA (são embaralhamentos independentes do mesmo pool)

### 4.4 Jokenpô decorativo (ppt)
Antes da primeira rodada:
1. Jogador escolhe 0/1/2 (pedra/papel/tesoura).
2. IA escolhe aleatoriamente após 1.2s.
3. Vencedor ou empate → jogador começa. IA vence → IA começa.
4. Transição automática para `fase === 'jogando'` após 2s.
- Apenas a primeira vez; não há PPT entre rodadas.

### 4.5 Rodada (jogando)

#### Turno do jogador
1. Jogador vê sua carta e clica em **1 dos 7 atributos jogáveis**.
2. Modal de confirmação aparece com o valor escolhido vs valor máximo.
3. Ao confirmar, chama `resolverRodada(attrKey, 'jogador')`.

#### Turno da IA
1. Disparado pelo `useEffect` quando `vezAtual === 'ia'` e `fase === 'jogando'`:
   ```js
   const timer = setTimeout(() => iaEscolherAtributo(), 500)
   ```
2. `iaEscolherAtributo()` (linha 365):
   - Filtra atributos que a carta da IA possui e exclui `rank_sdr`.
   - Escolhe **um aleatoriamente** entre os disponíveis.
   - **Não vê os valores do jogador** — é justo (conforme comentário linha 371).
   - Aguarda 1.5s de delay dramático.
3. Chama `resolverRodada(attrKey, 'ia')`.

### 4.6 Resolução (resolverRodada — linha 381)

```js
if (attr.inverso) res = vJ < vI ? 'ganhou' : vJ > vI ? 'perdeu' : 'empate'
else res = vJ > vI ? 'ganhou' : vJ < vI ? 'perdeu' : 'empate'
```

- Atributos normais: **maior vence**.
- rank_sdr (inverso): **menor vence** (rank_sdr nunca é jogável, então isso só importa se implementarem no futuro).
- Empate: ninguém pontua.

**Sequência de animação:**
1. `cardFlip()` + carta começa a sumir (600ms)
2. Cortina entra + `vs()` SFX + heartbeat (1200ms)
3. Cortina sai, carta revelada, resultado mostrado (1800ms total)
4. Placar atualizado, `historicoRodadas` registrado, fase → `resultado_rodada`

### 4.7 Alternância de turnos (proximaRodada — linha 445)
```js
setVezAtual(v => v === 'jogador' ? 'ia' : 'jogador')
```
A **vez alterna a cada rodada** independentemente de quem venceu.

Próxima carta é cíclica:
```js
const pJ = deckJogador[rodada % deckJogador.length]
const pI = deckIA[rodada % deckIA.length]
```

### 4.8 Fim de jogo (finalizarPartida — linha 483)
Quando `rodada >= totalTurnos`:
1. **Vitória** (placar.jogador > placar.ia):
   - Registra evento `trumps_vitoria` e `jogo_jogado`
   - Pontua no ranking (+20pts) via `registrarPontuacaoRanking`
   - Se tem tentativas restantes e não ganhou carta hoje: fase → `recompensa`
   - Senão: fase → `fim_jogo`
2. **Derrota/Empate**: fase → `fim_jogo`
3. **Sempre** consuma 1 tentativa diária via `consumirTentativa()`

### 4.9 Recompensa (escolherRecompensa — linha 537)
- 3 cartas aleatórias que o jogador **ainda não possui** são oferecidas.
- Jogador clica em uma para revelar e confirmar.
- Verificação anti-reload no banco (`verificarCartaGanhaHoje`).
- Carta adicionada ao localStorage + Supabase.
- Marca `jaGanhouHoje = true`.
- Partida registrada com `carta_recompensa`.

### 4.10 Desistir (handleDesistir — linha 459)
- Conta como derrota (+1 placar.ia, +1 derrotas no histórico).
- Consome 1 tentativa diária.
- Vai direto para `fim_jogo`.

---

## 5. Limites e Tentativas

### 5.1 Por tier
```js
const TENTATIVAS_POR_TIER = { free: 3, elite: 5, primordial: 7 }
```

### 5.2 Deck inicial por tier
```js
const qtd = userTier === 'primordial' ? 15 : userTier === 'elite' ? 10 : 5
```
- 4 cartas garantidas (1 de cada tier: free, elite, lendario, primordial)
- Restante preenchido aleatoriamente

### 5.3 Carta premiada por dia
- Apenas **1 carta premiada por dia** (verificação via `toptrumps_partidas.carta_recompensa`).
- Verificação dupla: localStorage + Supabase.

### 5.4 Limite de partidas ranqueadas
```js
const MAX_RANKED_PLAYS_DIA = 5
```

---

## 6. Multiplayer (TopTrumpsMP.jsx — 960 linhas)

### 6.1 Diferenças principais do SP
- **Salas**: criadas via Supabase (`toptrumps_salas`), join por ID.
- **Deck**: cada jogador usa seu próprio deck do banco (sem deck IA).
- **Turnos**: 30s de timer por jogada; timeout = escolha automática aleatória.
- **Resolução**: resultados calculados server-side via `movimentos` registrados.
- **PPT inicial**: jokenpô para decidir quem começa.
- **Fases**: `carregando → ppt → jogando → resultado_rodada → (recompensa) → fim`.

### 6.2 Atributos excluídos
Mesma lógica: `rank_sdr` não é jogável (linha 230 MP).

---

## 7. IA — Estratégia

### 7.1 Single-player (SP)
- Escolha **puramente aleatória** entre atributos disponíveis (linha 375).
- Delay de 1.5s para parecer que está "pensando".
- Não analisa valores da carta do jogador.
- **Nota:** a IA sempre joga depois do jogador na mesma rodada (alternância), ou seja, o jogador escolhe primeiro, a IA escolhe depois, mas a comparação é no mesmo atributo — a IA escolhe **qual atributo comparar**, e ambos usam o mesmo atributo escolhido pela IA.

**IMPORTANTE — Correção de fluxo:** Reanalisando o código, a IA escolhe o atributo apenas quando `vezAtual === 'ia'`. Mas olhando `proximaRodada()`:
```js
setVezAtual(v => v === 'jogador' ? 'ia' : 'jogador')
```
A vez alterna. Então:
- Rodada 1: jogador escolhe atributo (se vez=jogador)
- Rodada 2: IA escolhe atributo (se vez=ia)
- Rodada 3: jogador escolhe...
Ou seja, **cada rodada apenas um dos dois escolhe o atributo**, não os dois na mesma rodada. Isso muda a interpretação.

**Confirmação:** O jogador escolhe o atributo (via onClickAtributo → confirmarJogada → resolverRodada). A IA escolhe o atributo quando é a vez dela. Em ambos os casos, a resolução compara os valores da carta atual do jogador E da IA no atributo escolhido.

Portanto: **quem está na vez escolhe qual atributo comparar** para ambos os lados.

### 7.2 Multiplayer (MP)
- Escolha do jogador real.
- Timeout (30s) = escolha aleatória automática.

---

## 8. Deck e Persistência

### 8.1 Fluxo de carregamento (useEffect linha 566)
1. Tenta carregar do Supabase (`toptrumps_decks`).
2. Aceita tanto `id_num` (número) quanto `id` (slug string) — compatibilidade.
3. Se banco tem <5 cartas válidas → gera novo deck via `getCartasIniciais()`.
4. **Admin auto-fill**: se role é admin, garante TODAS as cartas da temporada.
5. Guests: recebem 5 cartas aleatórias em memória (sem persistência).

### 8.2 localStorage x Supabase
- localStorage (`ldi-toptrumps-deck-${userId}`) é usado como cache.
- Supabase é a fonte da verdade.
- `salvarCartasDeck()` faz upsert por `user_id, carta_id`.
- `substituirDeck()` limpa e reinsere.

---

## 9. Rankings e Achievements

### 9.1 Ranking global
- Tabela: `toptrumps_ranking` no Supabase.
- +20pts por vitória no Top Trumps.
- +15pts por vitória na Arena.
- Período mensal (`YYYY-MM`).
- Suporte a filtro por país (`country_code`).
- Limite: 5 partidas ranqueadas/dia.

### 9.2 Achievements
| Achievement | Trigger |
|---|---|
| `primeira_vitoria_trumps` | 1ª vitória |
| `primeira_derrota_trumps` | 1ª derrota |
| `veterano_trumps_10` | 10 partidas |
| `centuriao_trumps` | 100 partidas |
| `lenda_trumps` | 1000 partidas |

---

## 10. Problemas e Observações

### 10.1 Cartas faltando no JSON
`meta.total_cartas = 105`, mas há apenas 76 cartas (IDs 1–76). 29 cartas (IDs 77–105) precisam ser adicionadas.

### 10.2 Cartas fora da Season 1 nunca aparecem
Apenas 30 das 76 cartas estão em `SEASON_1_IDS`. Cartas 31–73 (44 cartas) estão no JSON mas **não são acessíveis** no jogo atual — só viriam se adicionadas à season ou se a lógica de filtro mudasse.

### 10.3 IA sem estratégia
A IA escolhe atributo aleatoriamente sem qualquer heurística. Poderia ser melhorada para:
- Escolher o atributo mais forte da própria carta
- Escolher o atributo mais fraco da carta do oponente (baseado em rodadas anteriores)
- Análise de padrão de escolha do jogador

### 10.4 Alternância de vez pode beneficiar um lado
Como a vez alterna independentemente de quem venceu, se um jogador perde na rodada em que escolhe, ele só terá chance de escolher de novo a cada 2 rodadas.

### 10.5 rank_sdr não é jogável mas consta em atributos
O array `atributos` inclui rank_sdr (linha 104–107), mas ele é filtrado em `iaEscolherAtributo` (linha 373) e não está em `ATTR_META`. É exibido na carta mas não é clicável.

### 10.6 Nenhum crash ou bug crítico identificado
- Código defensivo com verificações de nulidade em `resolverRodada`, `iaEscolherAtributo`.
- Race conditions em tentativas mitigadas com `await consumirTentativa()`.
- Verificação anti-reload em `escolherRecompensa`.

---

## 11. Resumo de Arquivos Relevantes

| Arquivo | Linhas | Papel |
|---|---|---|
| `src/pages/TopTrumps.jsx` | 1158 | Single-Player completo |
| `src/pages/TopTrumpsMP.jsx` | 960 | Multiplayer |
| `src/data/supertrunfo-pt.json` | 2230 | 76 cartas (declara 105) |
| `src/i18n/cardLabels.js` | 50 | ATTR_META (7 atributos) |
| `src/lib/getDeck.js` | 9 | Loader por locale |
| `src/hooks/useLeaderboardDB.js` | 419 | Deck, partidas, ranking |
| `src/hooks/useTopTrumpsMP.js` | — | Sala multiplayer |
| `src/components/TopTrumpsCard/` | — | Componente de carta |
| `src/pages/TopTrumps/` | — | CardViewerModal, DeckBuilder, DeckStartModal |
