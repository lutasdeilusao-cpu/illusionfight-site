# Super Trunfo LDI: tudo o que existe hoje

Retrato do jogo como está no código e nos dados, pra servir de base às mudanças. Tudo abaixo foi tirado do repositório.

## 1. Resumo

- **Catálogo em uso:** `src/data/supertrunfo-{pt,en,es}.json`, versão 2.1, 30 cartas, ids 1 a 30. Os três idiomas têm os mesmos ids e números; muda só o texto.
- **Atributos (8):** `rank_sdr`, `poder_mental`, `velocidade`, `resistencia`, `nivel_xama`, `fator_caos`, `energia_base`, `poder_explosivo`. No `rank_sdr`, menor ganha; nos outros, maior ganha. A IA nunca escolhe `rank_sdr`.
- **Arte:** `src/assets/images/cards/characters/card-NN.png` (NN = id), resolvida só por `src/lib/topTrumpsCardImages.js`, com `card-fallback.png` pra carta sem arte.
- **Modos:** um jogador contra a IA (`TopTrumpsSP.jsx` + `useTopTrumpsSP.js`) e multiplayer em tempo real (`TopTrumpsMP.jsx` + `useTopTrumpsMP.js` + `useMultiplayerTurnMachine.js`), entrando pelo lobby compartilhado `/games/multiplayer/lobby`.
- **Partida contra a IA:** o jogador escolhe 5, 10, 15 ou 20 cartas (só os tamanhos que o deck dele comporta). Cada rodada compara o atributo escolhido; o turno alterna entre jogador e IA; a IA escolhe ao acaso. Ganha quem fizer mais pontos.
- **Recompensa:** vencer contra a IA dá direito a escolher uma carta nova, uma por dia, com 3 tentativas por dia (`useTopTrumpsRewards.js`). A carta sai só do grupo que a conta pode ter.
- **Deck inicial:** conta nova ganha 5 cartas sorteadas do grupo permitido (`useTopTrumpsDeck.js`). Sem conta, joga com o grupo de convidado. O deck fica no banco (`deckPersistence.js`, migrations 014 e 020).
- **Limite de cartas no deck por acesso** (`src/lib/topTrumpsCardAccess.js`): convidado 15, conta grátis 15, assinante (elite) 25, evento 30.
- **Multiplayer (regras do AGENTS.md):** fila pública pela RPC `entrar_fila_publica`; 5 s de preparação ao achar o rival; trava de 2 s antes de cada escolha; 30 s por escolha; pedra-papel-tesoura de 30 s que escolhe sozinho no zero; sala encerrada some em 30 s. A máquina de turno (`useMultiplayerTurnMachine`) é a única que muda a fase.
- **Banco:** decks (014, 020), ranking (016), carta ganha (021) e país do perfil (018) estão no repositório. **As funções e tabelas do multiplayer (salas, fila, `entrar_fila_publica`, pedra-papel-tesoura) não estão nas migrations do repositório**: existem só no Supabase. Antes de mudar o multiplayer, exportar essas funções do banco.

## 2. Divergências encontradas

1. **Raridade em duas fontes.** O campo `tier` do JSON e a lista fixa em `topTrumpsCardAccess.js` decidem a mesma coisa. Cartas com tier diferente entre as duas hoje: **0**. Na mudança, vale deixar uma fonte só.
2. **Documentos antigos não batem com o jogo.** `docs/Games/TOP_TRUMPS_CARTAS.md` (76 cartas, dados versão 1.0) e `docs/Games/TopTrumps/SEASON1_30_CARDS.md` (outras 30 cartas: Lisa, Sarah, Xakaxi, Nara, Powa...) descrevem catálogos anteriores. O jogo usa as 30 cartas da seção 3. Os dois vão inteiros no fim, marcados como histórico.
3. **Funções do multiplayer fora do repositório** (ver resumo).

## 3. As 30 cartas de hoje

| # | Nome | Tier | Elemental | rank_sdr | poder_mental | velocidade | resistencia | nivel_xama | fator_caos | energia_base | poder_explosivo |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Kim Escola | free | Trevas (manifestado) / Fogo (nativo) | 1201 | 72 | 74 | 68 | 4 | 95 | 58 | 82 |
| 2 | Kim Casual | free | Trevas (manifestado) / Fogo (nativo) | 1201 | 78 | 80 | 72 | 5 | 70 | 75 | 68 |
| 3 | Kim Ensaio | elite | Trevas (manifestado) / Fogo (nativo) | 1201 | 85 | 65 | 78 | 6 | 62 | 82 | 74 |
| 4 | Kim Show | elite | Trevas (manifestado) / Fogo (nativo) | 1201 | 70 | 88 | 65 | 5 | 92 | 60 | 90 |
| 5 | Kim Superconcerto | elite | Trevas (manifestado) / Fogo (nativo) | 1201 | 80 | 68 | 76 | 6 | 75 | 92 | 78 |
| 6 | Jack Escola | free | Terra / Pedra | 10776 | 62 | 88 | 55 | 3 | 84 | 60 | 72 |
| 7 | Jack Casual | free | Terra / Pedra | 10776 | 70 | 82 | 62 | 4 | 78 | 68 | 76 |
| 8 | Jack Ensaio | elite | Terra / Pedra | 10776 | 75 | 78 | 68 | 5 | 72 | 72 | 85 |
| 9 | Jack Show | elite | Terra / Pedra | 10776 | 68 | 92 | 58 | 4 | 88 | 62 | 80 |
| 10 | Jack Superconcerto | elite | Terra / Pedra | 10776 | 76 | 85 | 65 | 5 | 80 | 74 | 88 |
| 11 | Nina Escola | free | Luz | 8724 | 76 | 85 | 79 | 4 | 55 | 72 | 62 |
| 12 | Nina Casual | free | Luz | 8724 | 74 | 80 | 74 | 4 | 68 | 68 | 70 |
| 13 | Nina Ensaio | elite | Luz | 8724 | 82 | 76 | 80 | 5 | 52 | 78 | 66 |
| 14 | Nina Show | elite | Luz | 8724 | 78 | 88 | 76 | 5 | 72 | 70 | 84 |
| 15 | Nina Superconcerto | elite | Luz | 8724 | 80 | 72 | 82 | 5 | 60 | 80 | 74 |
| 16 | Thunderbolt | free | Eletricidade (secundário da Luz) | 30156 | 58 | 92 | 64 | 2 | 44 | 55 | 52 |
| 17 | Shuntaro | free | Água | 998 | 83 | 87 | 74 | 7 | 68 | 78 | 72 |
| 18 | Lenna | evento | Vento | 500 | 88 | 82 | 75 | 6 | 60 | 80 | 70 |
| 19 | Nexus Phantasm | free | Dados / Caos Digital | 9999999 | 90 | 65 | 88 | 3 | 98 | 82 | 78 |
| 20 | Pajé Yawanari | evento | Todos os elementais primários | 999999999 | 95 | 38 | 92 | 10 | 72 | 98 | 80 |
| 21 | VoidHunter_X | elite | Vazio | 999999999 | 88 | 78 | 94 | 8 | 90 | 85 | 88 |
| 22 | David Kronos | evento | Escuridão Corrompida | 0 | 96 | 52 | 95 | 10 | 88 | 92 | 94 |
| 23 | Helena | free | Nenhum | 999999 | 48 | 38 | 88 | 0 | 75 | 28 | 22 |
| 24 | Osvaldo | free | Terra | 9999999 | 72 | 35 | 60 | 3 | 22 | 58 | 30 |
| 25 | Brock | free | Nenhum | 99999999 | 45 | 58 | 80 | 0 | 42 | 52 | 48 |
| 26 | Walter | free | Nenhum | 999999 | 68 | 28 | 50 | 0 | 18 | 32 | 15 |
| 27 | A Máquina | free | Nenhum | 999999 | 94 | 30 | 65 | 0 | 8 | 88 | 18 |
| 28 | IA NeoGuide | free | Digital | 999999 | 92 | 55 | 62 | 0 | 45 | 88 | 48 |
| 29 | Kim Ancestral | evento | Trevas (manifestado) / Fogo (nativo) | 1201 | 88 | 72 | 82 | 9 | 78 | 68 | 92 |
| 30 | Kim Primordial | evento | Trevas Primordiais / Sangue Primordial | 1201 | 92 | 88 | 90 | 10 | 85 | 78 | 98 |

Por tier: free 15, elite 10, evento 5.

Faixa de cada atributo:

- `rank_sdr`: 0 a 999999999
- `poder_mental`: 45 a 96
- `velocidade`: 28 a 92
- `resistencia`: 50 a 95
- `nivel_xama`: 0 a 10
- `fator_caos`: 8 a 98
- `energia_base`: 28 a 98
- `poder_explosivo`: 15 a 98

Artes na pasta (31): card-01.png, card-02.png, card-03.png, card-04.png, card-05.png, card-06.png, card-07.png, card-08.png, card-09.png, card-10.png, card-11.png, card-12.png, card-13.png, card-14.png, card-15.png, card-16.png, card-17.png, card-18.png, card-19.png, card-20.png, card-21.png, card-22.png, card-23.png, card-24.png, card-25.png, card-26.png, card-27.png, card-28.png, card-29.png, card-30.png, card-fallback.png

## 4. Arquivos do jogo

| Arquivo | Linhas |
|---|---|
| `src/components/TopTrumpsCard/TopTrumpsCard.css` | 314 |
| `src/components/TopTrumpsCard/TopTrumpsCard.jsx` | 135 |
| `src/hooks/useTopTrumpsMP.js` | 266 |
| `src/lib/topTrumpsCardAccess.js` | 44 |
| `src/lib/topTrumpsCardImages.js` | 18 |
| `src/pages/games/TopTrumps/TopTrumpsMP.css` | 559 |
| `src/pages/games/TopTrumps/TopTrumpsMP.jsx` | 1306 |
| `src/pages/games/TopTrumps/TopTrumpsSP.jsx` | 52 |
| `src/pages/games/TopTrumps/components/BurstParticles/BurstParticles.css` | 27 |
| `src/pages/games/TopTrumps/components/BurstParticles/BurstParticles.jsx` | 7 |
| `src/pages/games/TopTrumps/components/CardViewerModal/CardViewerModal.css` | 218 |
| `src/pages/games/TopTrumps/components/CardViewerModal/CardViewerModal.jsx` | 168 |
| `src/pages/games/TopTrumps/components/CurtainReveal/CurtainReveal.css` | 90 |
| `src/pages/games/TopTrumps/components/CurtainReveal/CurtainReveal.jsx` | 13 |
| `src/pages/games/TopTrumps/components/DeckBuilder/DeckBuilder.css` | 421 |
| `src/pages/games/TopTrumps/components/DeckBuilder/DeckBuilder.jsx` | 326 |
| `src/pages/games/TopTrumps/components/DeckStartModal/DeckStartModal.css` | 148 |
| `src/pages/games/TopTrumps/components/DeckStartModal/DeckStartModal.jsx` | 126 |
| `src/pages/games/TopTrumps/components/FireParticles/FireParticles.css` | 69 |
| `src/pages/games/TopTrumps/components/FireParticles/FireParticles.jsx` | 11 |
| `src/pages/games/TopTrumps/components/GameHUD/GameHUD.css` | 28 |
| `src/pages/games/TopTrumps/components/GameHUD/GameHUD.jsx` | 14 |
| `src/pages/games/TopTrumps/components/GameOverScreen/GameOverScreen.css` | 432 |
| `src/pages/games/TopTrumps/components/GameOverScreen/GameOverScreen.jsx` | 80 |
| `src/pages/games/TopTrumps/components/GameScreen/GameScreen.css` | 70 |
| `src/pages/games/TopTrumps/components/GameScreen/GameScreen.jsx` | 148 |
| `src/pages/games/TopTrumps/components/MenuScreen/MenuScreen.css` | 73 |
| `src/pages/games/TopTrumps/components/MenuScreen/MenuScreen.jsx` | 148 |
| `src/pages/games/TopTrumps/components/ResultScreen/ResultScreen.css` | 38 |
| `src/pages/games/TopTrumps/components/ResultScreen/ResultScreen.jsx` | 106 |
| `src/pages/games/TopTrumps/components/RewardScreen/RewardScreen.css` | 15 |
| `src/pages/games/TopTrumps/components/RewardScreen/RewardScreen.jsx` | 43 |
| `src/pages/games/TopTrumps/components/SoundToggle/SoundToggle.css` | 27 |
| `src/pages/games/TopTrumps/components/SoundToggle/SoundToggle.jsx` | 23 |
| `src/pages/games/TopTrumps/components/multiplayer/MultiplayerGameScreen.css` | 221 |
| `src/pages/games/TopTrumps/components/multiplayer/MultiplayerGameScreen.jsx` | 107 |
| `src/pages/games/TopTrumps/hooks/deckPersistence.js` | 97 |
| `src/pages/games/TopTrumps/hooks/useGameEffects.js` | 75 |
| `src/pages/games/TopTrumps/hooks/useMultiplayerTurnMachine.js` | 107 |
| `src/pages/games/TopTrumps/hooks/useTopTrumpsDeck.js` | 51 |
| `src/pages/games/TopTrumps/hooks/useTopTrumpsRewards.js` | 67 |
| `src/pages/games/TopTrumps/hooks/useTopTrumpsSP.js` | 229 |
| `src/pages/games/TopTrumps/styles/tokens.css` | 15 |
| `src/pages/games/TopTrumps/utils/attrNomeKey.js` | 12 |
| `src/pages/games/TopTrumps/utils/deterministicDeck.js` | 17 |

## 5. Anexos (conteúdo integral)

### 5.1 Catálogo JSON (pt)

`src/data/supertrunfo-pt.json`

```json
{
  "meta": {
    "versao": "2.1",
    "universo": "Lutas de Ilusão — Temporada 1",
    "total_cartas": 30,
    "atributos_explicacao": {
      "rank_sdr": "Posição no ranking mundial SDR. Menor = melhor.",
      "poder_mental": "Capacidade de energia mental em batalha (0-100).",
      "velocidade": "Velocidade de reação e movimento (0-100).",
      "resistencia": "Capacidade de absorver dano e continuar lutando (0-100).",
      "nivel_xama": "Domínio sobre poderes ancestrais e elementais (0-10).",
      "fator_caos": "Imprevisibilidade em combate (0-100).",
      "energia_base": "Reserva inicial de energia por batalha (0-100).",
      "poder_explosivo": "Capacidade de liberação súbita de poder extra (0-100)."
    },
    "tiers": ["free", "elite", "evento"]
  },
  "cartas": [
    {
      "id": 1,
      "nome": "Kim Escola",
      "tier": "free",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Descendente Xakaxi portador do Sangue Primordial. Chegou ao rank 1201 na primeira batalha. Mora em casa invadida, vende balas no busão, cuida da mãe. Tem mais poder do que entende. Quando perde o controle, algo muito mais antigo que ele assume o comando.",
      "frase_iconica": "A única regra da briga de rua? Não há regras.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 72, "velocidade": 74, "resistencia": 68, "nivel_xama": 4, "fator_caos": 95, "energia_base": 58, "poder_explosivo": 82 }
    },
    {
      "id": 2,
      "nome": "Kim Casual",
      "tier": "free",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Descendente Xakaxi portador do Sangue Primordial. Chegou ao rank 1201 na primeira batalha. Mora em casa invadida, vende balas no busão, cuida da mãe. Tem mais poder do que entende. Quando perde o controle, algo muito mais antigo que ele assume o comando.",
      "frase_iconica": "A única regra da briga de rua? Não há regras.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 78, "velocidade": 80, "resistencia": 72, "nivel_xama": 5, "fator_caos": 70, "energia_base": 75, "poder_explosivo": 68 }
    },
    {
      "id": 3,
      "nome": "Kim Ensaio",
      "tier": "elite",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Descendente Xakaxi portador do Sangue Primordial. Chegou ao rank 1201 na primeira batalha. Mora em casa invadida, vende balas no busão, cuida da mãe. Tem mais poder do que entende. Quando perde o controle, algo muito mais antigo que ele assume o comando.",
      "frase_iconica": "A única regra da briga de rua? Não há regras.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 85, "velocidade": 65, "resistencia": 78, "nivel_xama": 6, "fator_caos": 62, "energia_base": 82, "poder_explosivo": 74 }
    },
    {
      "id": 4,
      "nome": "Kim Show",
      "tier": "elite",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Descendente Xakaxi portador do Sangue Primordial. Chegou ao rank 1201 na primeira batalha. Mora em casa invadida, vende balas no busão, cuida da mãe. Tem mais poder do que entende. Quando perde o controle, algo muito mais antigo que ele assume o comando.",
      "frase_iconica": "A única regra da briga de rua? Não há regras.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 70, "velocidade": 88, "resistencia": 65, "nivel_xama": 5, "fator_caos": 92, "energia_base": 60, "poder_explosivo": 90 }
    },
    {
      "id": 5,
      "nome": "Kim Superconcerto",
      "tier": "elite",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Descendente Xakaxi portador do Sangue Primordial. Chegou ao rank 1201 na primeira batalha. Mora em casa invadida, vende balas no busão, cuida da mãe. Tem mais poder do que entende. Quando perde o controle, algo muito mais antigo que ele assume o comando.",
      "frase_iconica": "A única regra da briga de rua? Não há regras.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 80, "velocidade": 68, "resistencia": 76, "nivel_xama": 6, "fator_caos": 75, "energia_base": 92, "poder_explosivo": 78 }
    },
    {
      "id": 6,
      "nome": "Jack Escola",
      "tier": "free",
      "elemental": "Terra / Pedra",
      "descricao": "Melhor amigo de Kim desde sempre. Extrovertido, teatral, nunca genuinamente assustado. Combina charme e violência com eficiência desconcertante. Usa qualquer ambiente a seu favor. Treino em 3 etapas — letal quando completo, vulnerável durante o carregamento.",
      "frase_iconica": "Nunca deixe para amanhã o que você obrigar o Kim a fazer hoje.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 62, "velocidade": 88, "resistencia": 55, "nivel_xama": 3, "fator_caos": 84, "energia_base": 60, "poder_explosivo": 72 }
    },
    {
      "id": 7,
      "nome": "Jack Casual",
      "tier": "free",
      "elemental": "Terra / Pedra",
      "descricao": "Melhor amigo de Kim desde sempre. Extrovertido, teatral, nunca genuinamente assustado. Combina charme e violência com eficiência desconcertante. Usa qualquer ambiente a seu favor. Treino em 3 etapas — letal quando completo, vulnerável durante o carregamento.",
      "frase_iconica": "Nunca deixe para amanhã o que você obrigar o Kim a fazer hoje.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 70, "velocidade": 82, "resistencia": 62, "nivel_xama": 4, "fator_caos": 78, "energia_base": 68, "poder_explosivo": 76 }
    },
    {
      "id": 8,
      "nome": "Jack Ensaio",
      "tier": "elite",
      "elemental": "Terra / Pedra",
      "descricao": "Melhor amigo de Kim desde sempre. Extrovertido, teatral, nunca genuinamente assustado. Combina charme e violência com eficiência desconcertante. Usa qualquer ambiente a seu favor. Treino em 3 etapas — letal quando completo, vulnerável durante o carregamento.",
      "frase_iconica": "Nunca deixe para amanhã o que você obrigar o Kim a fazer hoje.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 75, "velocidade": 78, "resistencia": 68, "nivel_xama": 5, "fator_caos": 72, "energia_base": 72, "poder_explosivo": 85 }
    },
    {
      "id": 9,
      "nome": "Jack Show",
      "tier": "elite",
      "elemental": "Terra / Pedra",
      "descricao": "Melhor amigo de Kim desde sempre. Extrovertido, teatral, nunca genuinamente assustado. Combina charme e violência com eficiência desconcertante. Usa qualquer ambiente a seu favor. Treino em 3 etapas — letal quando completo, vulnerável durante o carregamento.",
      "frase_iconica": "Nunca deixe para amanhã o que você obrigar o Kim a fazer hoje.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 68, "velocidade": 92, "resistencia": 58, "nivel_xama": 4, "fator_caos": 88, "energia_base": 62, "poder_explosivo": 80 }
    },
    {
      "id": 10,
      "nome": "Jack Superconcerto",
      "tier": "elite",
      "elemental": "Terra / Pedra",
      "descricao": "Melhor amigo de Kim desde sempre. Extrovertido, teatral, nunca genuinamente assustado. Combina charme e violência com eficiência desconcertante. Usa qualquer ambiente a seu favor. Treino em 3 etapas — letal quando completo, vulnerável durante o carregamento.",
      "frase_iconica": "Nunca deixe para amanhã o que você obrigar o Kim a fazer hoje.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 76, "velocidade": 85, "resistencia": 65, "nivel_xama": 5, "fator_caos": 80, "energia_base": 74, "poder_explosivo": 88 }
    },
    {
      "id": 11,
      "nome": "Nina Escola",
      "tier": "free",
      "elemental": "Luz",
      "descricao": "Muay Thai e katana desde os 12 anos no circuito profissional. Passou anos fora de Bravara. Quando fala, muda a cena. Competitiva ao extremo — prefere morrer a pedir ajuda numa briga.",
      "frase_iconica": "Você precisa ralar mais para merecer uma mulher como eu.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 76, "velocidade": 85, "resistencia": 79, "nivel_xama": 4, "fator_caos": 55, "energia_base": 72, "poder_explosivo": 62 }
    },
    {
      "id": 12,
      "nome": "Nina Casual",
      "tier": "free",
      "elemental": "Luz",
      "descricao": "Muay Thai e katana desde os 12 anos no circuito profissional. Passou anos fora de Bravara. Quando fala, muda a cena. Competitiva ao extremo — prefere morrer a pedir ajuda numa briga.",
      "frase_iconica": "Você precisa ralar mais para merecer uma mulher como eu.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 74, "velocidade": 80, "resistencia": 74, "nivel_xama": 4, "fator_caos": 68, "energia_base": 68, "poder_explosivo": 70 }
    },
    {
      "id": 13,
      "nome": "Nina Ensaio",
      "tier": "elite",
      "elemental": "Luz",
      "descricao": "Muay Thai e katana desde os 12 anos no circuito profissional. Passou anos fora de Bravara. Quando fala, muda a cena. Competitiva ao extremo — prefere morrer a pedir ajuda numa briga.",
      "frase_iconica": "Você precisa ralar mais para merecer uma mulher como eu.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 82, "velocidade": 76, "resistencia": 80, "nivel_xama": 5, "fator_caos": 52, "energia_base": 78, "poder_explosivo": 66 }
    },
    {
      "id": 14,
      "nome": "Nina Show",
      "tier": "elite",
      "elemental": "Luz",
      "descricao": "Muay Thai e katana desde os 12 anos no circuito profissional. Passou anos fora de Bravara. Quando fala, muda a cena. Competitiva ao extremo — prefere morrer a pedir ajuda numa briga.",
      "frase_iconica": "Você precisa ralar mais para merecer uma mulher como eu.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 78, "velocidade": 88, "resistencia": 76, "nivel_xama": 5, "fator_caos": 72, "energia_base": 70, "poder_explosivo": 84 }
    },
    {
      "id": 15,
      "nome": "Nina Superconcerto",
      "tier": "elite",
      "elemental": "Luz",
      "descricao": "Muay Thai e katana desde os 12 anos no circuito profissional. Passou anos fora de Bravara. Quando fala, muda a cena. Competitiva ao extremo — prefere morrer a pedir ajuda numa briga.",
      "frase_iconica": "Você precisa ralar mais para merecer uma mulher como eu.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 80, "velocidade": 72, "resistencia": 82, "nivel_xama": 5, "fator_caos": 60, "energia_base": 80, "poder_explosivo": 74 }
    },
    {
      "id": 16,
      "nome": "Thunderbolt",
      "tier": "free",
      "elemental": "Eletricidade (secundário da Luz)",
      "descricao": "Bruno Ribeiro. 1.201 vitórias antes de encontrar Kim. Arrogante, metódico, cruel nos combates. Usa humilhação como estratégia psicológica. Pagou capangas para perseguir Kim no colégio — não deu certo.",
      "frase_iconica": "Ajoelhado, chorando e implorando. Só então eu termino.",
      "atributos": { "rank_sdr": 30156, "poder_mental": 58, "velocidade": 92, "resistencia": 64, "nivel_xama": 2, "fator_caos": 44, "energia_base": 55, "poder_explosivo": 52 }
    },
    {
      "id": 17,
      "nome": "Shuntaro",
      "tier": "free",
      "elemental": "Água",
      "descricao": "Rank 998. De Azuma. Viajou 9 horas para desafiar Kim pessoalmente. Estratégico, elegante, respeita oponentes fortes. 6 meses no jogo e já está entre os mil melhores do mundo.",
      "frase_iconica": "Prepare-se. Não vim de tão longe para perder.",
      "atributos": { "rank_sdr": 998, "poder_mental": 83, "velocidade": 87, "resistencia": 74, "nivel_xama": 7, "fator_caos": 68, "energia_base": 78, "poder_explosivo": 72 }
    },
    {
      "id": 18,
      "nome": "Lenna",
      "tier": "evento",
      "elemental": "Vento",
      "descricao": "Rank top 500. Ficou interessada em Kim após o vídeo viral. Confiante, enigmática, competitiva mas justa. Avalia oponentes friamente antes de agir.",
      "frase_iconica": "Eu não luto para provar algo. Eu luto para saber.",
      "atributos": { "rank_sdr": 500, "poder_mental": 88, "velocidade": 82, "resistencia": 75, "nivel_xama": 6, "fator_caos": 60, "energia_base": 80, "poder_explosivo": 70 }
    },
    {
      "id": 19,
      "nome": "Nexus Phantasm",
      "tier": "free",
      "elemental": "Dados / Caos Digital",
      "descricao": "Arauto das Arenas. Não é humano, não é IA convencional. Criado por hackers, oficializado pela Yohu. Sarcástico por natureza. Sua presença distorce o campo de batalha.",
      "frase_iconica": "Senhoras e senhores, o impossível é apenas uma questão de perspectiva!",
      "atributos": { "rank_sdr": 9999999, "poder_mental": 90, "velocidade": 65, "resistencia": 88, "nivel_xama": 3, "fator_caos": 98, "energia_base": 82, "poder_explosivo": 78 }
    },
    {
      "id": 20,
      "nome": "Pajé Yawanari",
      "tier": "evento",
      "elemental": "Todos os elementais primários",
      "descricao": "Xamã imortal da tribo Xakaxi. Quinhentos anos observando a humanidade. Viu guerras mundiais, pandemias, colonização e redes sociais. Completamente louco. Fala em gírias modernas misturadas com sabedoria ancestral. Tem amigos imaginários.",
      "frase_iconica": "Cheguei pra divar! Sou o 10/10 que ficou na responsa de proteger os poderes sagrados deste mundão.",
      "atributos": { "rank_sdr": 999999999, "poder_mental": 95, "velocidade": 38, "resistencia": 92, "nivel_xama": 10, "fator_caos": 72, "energia_base": 98, "poder_explosivo": 80 }
    },
    {
      "id": 21,
      "nome": "VoidHunter_X",
      "tier": "elite",
      "elemental": "Vazio",
      "descricao": "Entidade do LDI. Não é jogador. O visor não reflete. Os dedos dobram ao contrário. Gosma preta nas fissuras do peitoral. Ninguém sabe de onde veio nem quem o criou.",
      "frase_iconica": "...",
      "atributos": { "rank_sdr": 999999999, "poder_mental": 88, "velocidade": 78, "resistencia": 94, "nivel_xama": 8, "fator_caos": 90, "energia_base": 85, "poder_explosivo": 88 }
    },
    {
      "id": 22,
      "nome": "David Kronos",
      "tier": "evento",
      "elemental": "Escuridão Corrompida",
      "descricao": "Espírito ancestral corrompido de Powa, filho do Pajé Yawanari. Cinco séculos esperando pelo Corpo Primordial — o descendente que carregue o Sangue Primordial para usar como hospedeiro permanente. Cada possessão deteriora o hospedeiro. Criou o LDI como isca.",
      "frase_iconica": "Finalmente… Como tenho esperado por esse momento.",
      "atributos": { "rank_sdr": 0, "poder_mental": 96, "velocidade": 52, "resistencia": 95, "nivel_xama": 10, "fator_caos": 88, "energia_base": 92, "poder_explosivo": 94 }
    },
    {
      "id": 23,
      "nome": "Helena",
      "tier": "free",
      "elemental": "Nenhum",
      "descricao": "Mãe de Kim — ou melhor, a mulher que o salvou quando tinha 12 anos e ele era um bebê. Sobreviveu ao que não devia e criou Kim sozinha a partir do nada. Troubled, complexa, alcoólatra. Mas na hora que importou, não abandonou.",
      "frase_iconica": "Aos 18 você não vai precisar mais de mim. E eu finalmente posso me livrar de você.",
      "atributos": { "rank_sdr": 999999, "poder_mental": 48, "velocidade": 38, "resistencia": 88, "nivel_xama": 0, "fator_caos": 75, "energia_base": 28, "poder_explosivo": 22 }
    },
    {
      "id": 24,
      "nome": "Osvaldo",
      "tier": "free",
      "elemental": "Terra",
      "descricao": "Porteiro da academia de elite. Ensinou Kim a tocar violão por três anos. Usou sua influência para garantir bolsa de 50% para Kim e Jack. Viu potencial onde todos viam problema.",
      "frase_iconica": "Entrem logo, antes que o diretor me pegue.",
      "atributos": { "rank_sdr": 9999999, "poder_mental": 72, "velocidade": 35, "resistencia": 60, "nivel_xama": 3, "fator_caos": 22, "energia_base": 58, "poder_explosivo": 30 }
    },
    {
      "id": 25,
      "nome": "Brock",
      "tier": "free",
      "elemental": "Nenhum",
      "descricao": "Líder do grupo de capangas contratados por Thunderbolt. Alto, musculoso, tatuagens que contam histórias de violência. Tratou o trabalho com profissionalismo até ser dobrado numa mesa em 3 segundos.",
      "frase_iconica": "Sou apenas um profissional fazendo o meu serviço, não leve pro pessoal.",
      "atributos": { "rank_sdr": 99999999, "poder_mental": 45, "velocidade": 58, "resistencia": 80, "nivel_xama": 0, "fator_caos": 42, "energia_base": 52, "poder_explosivo": 48 }
    },
    {
      "id": 26,
      "nome": "Walter",
      "tier": "free",
      "elemental": "Nenhum",
      "descricao": "Diretor da academia elite. Tenta manter a ordem numa escola cheia de conflitos. Ameaça Kim e Jack com a bolsa periodicamente. Nunca consegue provas suficientes para agir.",
      "frase_iconica": "Tomem cuidado. Muito cuidado para não perder suas bolsas.",
      "atributos": { "rank_sdr": 999999, "poder_mental": 68, "velocidade": 28, "resistencia": 50, "nivel_xama": 0, "fator_caos": 18, "energia_base": 32, "poder_explosivo": 15 }
    },
    {
      "id": 27,
      "nome": "A Máquina",
      "tier": "free",
      "elemental": "Nenhum",
      "descricao": "Professor de matemática da academia elite. Escreve equações no ar com a caneta. Nunca sorri — exceto uma vez, imperceptível, quando Nina detonou Jack. Considerado um dos únicos escolhidos para lecionar na instituição.",
      "frase_iconica": "Bom dia.",
      "atributos": { "rank_sdr": 999999, "poder_mental": 94, "velocidade": 30, "resistencia": 65, "nivel_xama": 0, "fator_caos": 8, "energia_base": 88, "poder_explosivo": 18 }
    },
    {
      "id": 28,
      "nome": "IA NeoGuide",
      "tier": "free",
      "elemental": "Digital",
      "descricao": "A inteligência artificial do LDI que gerencia batalhas, comunica status e cria avatares. Fala diretamente na mente dos jogadores. Pode esconder informações do oponente. Sua lealdade é ao sistema — ou a algo mais?",
      "frase_iconica": "Bem-vindo ao Sistema de Lutas de Ilusão. Iniciando protocolo de integração neural.",
      "atributos": { "rank_sdr": 999999, "poder_mental": 92, "velocidade": 55, "resistencia": 62, "nivel_xama": 0, "fator_caos": 45, "energia_base": 88, "poder_explosivo": 48 }
    },
    {
      "id": 29,
      "nome": "Kim Ancestral",
      "tier": "evento",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Forma ancestral de Kim canalizada pelo Pajé Yawanari. Dois atributos atingem pico absoluto — poder xamânico e poder explosivo. Não é Kim. É o que existe no sangue de Kim desde 1450.",
      "frase_iconica": "A única regra da briga de rua? Não há regras.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 88, "velocidade": 72, "resistencia": 82, "nivel_xama": 9, "fator_caos": 78, "energia_base": 68, "poder_explosivo": 92 }
    },
    {
      "id": 30,
      "nome": "Kim Primordial",
      "tier": "evento",
      "elemental": "Trevas Primordiais / Sangue Primordial",
      "descricao": "A forma que Kim assume quando o controle se perde completamente. Cabelos prateados, marcações tribais Xakaxi ativas, olhos esferas brancas sem íris. Chamas negras que sussurram lamentos. Ele se refere a si mesmo como O Primordial. Não se lembra de nada depois.",
      "frase_iconica": "Eu sou O Primordial! O Sangue Primordial é realmente muito poderoso.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 92, "velocidade": 88, "resistencia": 90, "nivel_xama": 10, "fator_caos": 85, "energia_base": 78, "poder_explosivo": 98 }
    }
  ]
}
```

### 5.2 Catálogo JSON (en)

`src/data/supertrunfo-en.json`

```json
{
  "meta": {
    "versao": "2.1",
    "universo": "Lutas de Ilusão — Temporada 1",
    "total_cartas": 30,
    "atributos_explicacao": {
      "rank_sdr": "SDR ranking position. Lower = better.",
      "poder_mental": "Mental energy capacity in battle (0-100).",
      "velocidade": "Reaction speed and movement (0-100).",
      "resistencia": "Ability to absorb damage and keep fighting (0-100).",
      "nivel_xama": "Mastery over ancestral and elemental powers (0-10).",
      "fator_caos": "Unpredictability in combat (0-100).",
      "energia_base": "Initial energy reserve per battle (0-100).",
      "poder_explosivo": "Capacity for sudden power release (0-100)."
    },
    "tiers": ["free", "elite", "evento"]
  },
  "cartas": [
    {
      "id": 1,
      "nome": "Kim School",
      "tier": "free",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Xakaxi descendant carrying the Primordial Blood. Reached rank 1201 in his first battle. Lives in a squatted house, sells candy on buses, takes care of his mother. Has more power than he understands. When he loses control, something far older than him takes command.",
      "frase_iconica": "The only rule in a street fight? There are no rules.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 72, "velocidade": 74, "resistencia": 68, "nivel_xama": 4, "fator_caos": 95, "energia_base": 58, "poder_explosivo": 82 }
    },
    {
      "id": 2,
      "nome": "Kim Casual",
      "tier": "free",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Xakaxi descendant carrying the Primordial Blood. Reached rank 1201 in his first battle. Lives in a squatted house, sells candy on buses, takes care of his mother. Has more power than he understands. When he loses control, something far older than him takes command.",
      "frase_iconica": "The only rule in a street fight? There are no rules.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 78, "velocidade": 80, "resistencia": 72, "nivel_xama": 5, "fator_caos": 70, "energia_base": 75, "poder_explosivo": 68 }
    },
    {
      "id": 3,
      "nome": "Kim Rehearsal",
      "tier": "elite",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Xakaxi descendant carrying the Primordial Blood. Reached rank 1201 in his first battle. Lives in a squatted house, sells candy on buses, takes care of his mother. Has more power than he understands. When he loses control, something far older than him takes command.",
      "frase_iconica": "The only rule in a street fight? There are no rules.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 85, "velocidade": 65, "resistencia": 78, "nivel_xama": 6, "fator_caos": 62, "energia_base": 82, "poder_explosivo": 74 }
    },
    {
      "id": 4,
      "nome": "Kim Show",
      "tier": "elite",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Xakaxi descendant carrying the Primordial Blood. Reached rank 1201 in his first battle. Lives in a squatted house, sells candy on buses, takes care of his mother. Has more power than he understands. When he loses control, something far older than him takes command.",
      "frase_iconica": "The only rule in a street fight? There are no rules.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 70, "velocidade": 88, "resistencia": 65, "nivel_xama": 5, "fator_caos": 92, "energia_base": 60, "poder_explosivo": 90 }
    },
    {
      "id": 5,
      "nome": "Kim Superconcert",
      "tier": "elite",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Xakaxi descendant carrying the Primordial Blood. Reached rank 1201 in his first battle. Lives in a squatted house, sells candy on buses, takes care of his mother. Has more power than he understands. When he loses control, something far older than him takes command.",
      "frase_iconica": "The only rule in a street fight? There are no rules.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 80, "velocidade": 68, "resistencia": 76, "nivel_xama": 6, "fator_caos": 75, "energia_base": 92, "poder_explosivo": 78 }
    },
    {
      "id": 6,
      "nome": "Jack School",
      "tier": "free",
      "elemental": "Terra / Pedra",
      "descricao": "Kim's best friend since forever. Extroverted, theatrical, never genuinely scared. Combines charm and violence with unsettling efficiency. Uses any environment to his advantage. Three-stage training — lethal when complete, vulnerable while loading.",
      "frase_iconica": "Never leave for tomorrow what you can make Kim do today.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 62, "velocidade": 88, "resistencia": 55, "nivel_xama": 3, "fator_caos": 84, "energia_base": 60, "poder_explosivo": 72 }
    },
    {
      "id": 7,
      "nome": "Jack Casual",
      "tier": "free",
      "elemental": "Terra / Pedra",
      "descricao": "Kim's best friend since forever. Extroverted, theatrical, never genuinely scared. Combines charm and violence with unsettling efficiency. Uses any environment to his advantage. Three-stage training — lethal when complete, vulnerable while loading.",
      "frase_iconica": "Never leave for tomorrow what you can make Kim do today.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 70, "velocidade": 82, "resistencia": 62, "nivel_xama": 4, "fator_caos": 78, "energia_base": 68, "poder_explosivo": 76 }
    },
    {
      "id": 8,
      "nome": "Jack Rehearsal",
      "tier": "elite",
      "elemental": "Terra / Pedra",
      "descricao": "Kim's best friend since forever. Extroverted, theatrical, never genuinely scared. Combines charm and violence with unsettling efficiency. Uses any environment to his advantage. Three-stage training — lethal when complete, vulnerable while loading.",
      "frase_iconica": "Never leave for tomorrow what you can make Kim do today.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 75, "velocidade": 78, "resistencia": 68, "nivel_xama": 5, "fator_caos": 72, "energia_base": 72, "poder_explosivo": 85 }
    },
    {
      "id": 9,
      "nome": "Jack Show",
      "tier": "elite",
      "elemental": "Terra / Pedra",
      "descricao": "Kim's best friend since forever. Extroverted, theatrical, never genuinely scared. Combines charm and violence with unsettling efficiency. Uses any environment to his advantage. Three-stage training — lethal when complete, vulnerable while loading.",
      "frase_iconica": "Never leave for tomorrow what you can make Kim do today.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 68, "velocidade": 92, "resistencia": 58, "nivel_xama": 4, "fator_caos": 88, "energia_base": 62, "poder_explosivo": 80 }
    },
    {
      "id": 10,
      "nome": "Jack Superconcert",
      "tier": "elite",
      "elemental": "Terra / Pedra",
      "descricao": "Kim's best friend since forever. Extroverted, theatrical, never genuinely scared. Combines charm and violence with unsettling efficiency. Uses any environment to his advantage. Three-stage training — lethal when complete, vulnerable while loading.",
      "frase_iconica": "Never leave for tomorrow what you can make Kim do today.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 76, "velocidade": 85, "resistencia": 65, "nivel_xama": 5, "fator_caos": 80, "energia_base": 74, "poder_explosivo": 88 }
    },
    {
      "id": 11,
      "nome": "Nina School",
      "tier": "free",
      "elemental": "Luz",
      "descricao": "Muay Thai and katana since age 12 in the pro circuit. Spent years outside Bravara. When she speaks, the scene shifts. Competitive to the extreme — would rather die than ask for help in a fight.",
      "frase_iconica": "You need to work a lot harder to deserve a woman like me.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 76, "velocidade": 85, "resistencia": 79, "nivel_xama": 4, "fator_caos": 55, "energia_base": 72, "poder_explosivo": 62 }
    },
    {
      "id": 12,
      "nome": "Nina Casual",
      "tier": "free",
      "elemental": "Luz",
      "descricao": "Muay Thai and katana since age 12 in the pro circuit. Spent years outside Bravara. When she speaks, the scene shifts. Competitive to the extreme — would rather die than ask for help in a fight.",
      "frase_iconica": "You need to work a lot harder to deserve a woman like me.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 74, "velocidade": 80, "resistencia": 74, "nivel_xama": 4, "fator_caos": 68, "energia_base": 68, "poder_explosivo": 70 }
    },
    {
      "id": 13,
      "nome": "Nina Rehearsal",
      "tier": "elite",
      "elemental": "Luz",
      "descricao": "Muay Thai and katana since age 12 in the pro circuit. Spent years outside Bravara. When she speaks, the scene shifts. Competitive to the extreme — would rather die than ask for help in a fight.",
      "frase_iconica": "You need to work a lot harder to deserve a woman like me.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 82, "velocidade": 76, "resistencia": 80, "nivel_xama": 5, "fator_caos": 52, "energia_base": 78, "poder_explosivo": 66 }
    },
    {
      "id": 14,
      "nome": "Nina Show",
      "tier": "elite",
      "elemental": "Luz",
      "descricao": "Muay Thai and katana since age 12 in the pro circuit. Spent years outside Bravara. When she speaks, the scene shifts. Competitive to the extreme — would rather die than ask for help in a fight.",
      "frase_iconica": "You need to work a lot harder to deserve a woman like me.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 78, "velocidade": 88, "resistencia": 76, "nivel_xama": 5, "fator_caos": 72, "energia_base": 70, "poder_explosivo": 84 }
    },
    {
      "id": 15,
      "nome": "Nina Superconcert",
      "tier": "elite",
      "elemental": "Luz",
      "descricao": "Muay Thai and katana since age 12 in the pro circuit. Spent years outside Bravara. When she speaks, the scene shifts. Competitive to the extreme — would rather die than ask for help in a fight.",
      "frase_iconica": "You need to work a lot harder to deserve a woman like me.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 80, "velocidade": 72, "resistencia": 82, "nivel_xama": 5, "fator_caos": 60, "energia_base": 80, "poder_explosivo": 74 }
    },
    {
      "id": 16,
      "nome": "Thunderbolt",
      "tier": "free",
      "elemental": "Eletricidade (secundário da Luz)",
      "descricao": "Bruno Ribeiro. 1,201 wins before meeting Kim. Arrogant, methodical, cruel in combat. Uses humiliation as a psychological strategy. Hired thugs to harass Kim at school — it didn't work.",
      "frase_iconica": "On your knees, crying and begging. Only then will I finish.",
      "atributos": { "rank_sdr": 30156, "poder_mental": 58, "velocidade": 92, "resistencia": 64, "nivel_xama": 2, "fator_caos": 44, "energia_base": 55, "poder_explosivo": 52 }
    },
    {
      "id": 17,
      "nome": "Shuntaro",
      "tier": "free",
      "elemental": "Água",
      "descricao": "Rank 998. From Azuma. Traveled 9 hours to challenge Kim personally. Strategic, elegant, respects strong opponents. 6 months in the game and already among the top thousand in the world.",
      "frase_iconica": "Get ready. I didn't come this far to lose.",
      "atributos": { "rank_sdr": 998, "poder_mental": 83, "velocidade": 87, "resistencia": 74, "nivel_xama": 7, "fator_caos": 68, "energia_base": 78, "poder_explosivo": 72 }
    },
    {
      "id": 18,
      "nome": "Lenna",
      "tier": "evento",
      "elemental": "Vento",
      "descricao": "Top 500 rank. Became interested in Kim after the viral video. Confident, enigmatic, competitive but fair. Evaluates opponents coldly before acting.",
      "frase_iconica": "I don't fight to prove something. I fight to know.",
      "atributos": { "rank_sdr": 500, "poder_mental": 88, "velocidade": 82, "resistencia": 75, "nivel_xama": 6, "fator_caos": 60, "energia_base": 80, "poder_explosivo": 70 }
    },
    {
      "id": 19,
      "nome": "Nexus Phantasm",
      "tier": "free",
      "elemental": "Dados / Caos Digital",
      "descricao": "Arena Herald. Not human, not conventional AI. Created by hackers, made official by Yohu. Sarcastic by nature. Its presence distorts the battlefield.",
      "frase_iconica": "Ladies and gentlemen, the impossible is merely a matter of perspective!",
      "atributos": { "rank_sdr": 9999999, "poder_mental": 90, "velocidade": 65, "resistencia": 88, "nivel_xama": 3, "fator_caos": 98, "energia_base": 82, "poder_explosivo": 78 }
    },
    {
      "id": 20,
      "nome": "Pajé Yawanari",
      "tier": "evento",
      "elemental": "Todos os elementais primários",
      "descricao": "Immortal shaman of the Xakaxi tribe. Five hundred years observing humanity. Witnessed world wars, pandemics, colonization, and social media. Completely insane. Speaks modern slang mixed with ancestral wisdom. Has imaginary friends.",
      "frase_iconica": "I came to slay! I'm the 10/10 who stayed on watch protecting the sacred powers of this wild world.",
      "atributos": { "rank_sdr": 999999999, "poder_mental": 95, "velocidade": 38, "resistencia": 92, "nivel_xama": 10, "fator_caos": 72, "energia_base": 98, "poder_explosivo": 80 }
    },
    {
      "id": 21,
      "nome": "VoidHunter_X",
      "tier": "elite",
      "elemental": "Vazio",
      "descricao": "LDI entity. Not a player. The visor doesn't reflect. The fingers bend backwards. Black ooze in the cracks of its chest. Nobody knows where it came from or who created it.",
      "frase_iconica": "...",
      "atributos": { "rank_sdr": 999999999, "poder_mental": 88, "velocidade": 78, "resistencia": 94, "nivel_xama": 8, "fator_caos": 90, "energia_base": 85, "poder_explosivo": 88 }
    },
    {
      "id": 22,
      "nome": "David Kronos",
      "tier": "evento",
      "elemental": "Escuridão Corrompida",
      "descricao": "Corrupted ancestral spirit of Powa, son of Pajé Yawanari. Five centuries waiting for the Primordial Body — the descendant carrying Primordial Blood to use as a permanent host. Each possession deteriorates the host. Created LDI as bait.",
      "frase_iconica": "Finally… How I have waited for this moment.",
      "atributos": { "rank_sdr": 0, "poder_mental": 96, "velocidade": 52, "resistencia": 95, "nivel_xama": 10, "fator_caos": 88, "energia_base": 92, "poder_explosivo": 94 }
    },
    {
      "id": 23,
      "nome": "Helena",
      "tier": "free",
      "elemental": "Nenhum",
      "descricao": "Kim's mother — or rather, the woman who saved him when she was 12 years old and he was a newborn. Survived what she shouldn't have and raised Kim alone from nothing. Troubled, complex, alcoholic. But when it mattered, she didn't abandon him.",
      "frase_iconica": "At 18 you won't need me anymore. And I can finally be free of you.",
      "atributos": { "rank_sdr": 999999, "poder_mental": 48, "velocidade": 38, "resistencia": 88, "nivel_xama": 0, "fator_caos": 75, "energia_base": 28, "poder_explosivo": 22 }
    },
    {
      "id": 24,
      "nome": "Osvaldo",
      "tier": "free",
      "elemental": "Terra",
      "descricao": "Doorman at the elite academy. Taught Kim guitar for three years. Used his influence to secure a 50% scholarship for Kim and Jack. Saw potential where everyone else saw a problem.",
      "frase_iconica": "Get in quickly, before the principal catches me.",
      "atributos": { "rank_sdr": 9999999, "poder_mental": 72, "velocidade": 35, "resistencia": 60, "nivel_xama": 3, "fator_caos": 22, "energia_base": 58, "poder_explosivo": 30 }
    },
    {
      "id": 25,
      "nome": "Brock",
      "tier": "free",
      "elemental": "Nenhum",
      "descricao": "Leader of the gang of thugs hired by Thunderbolt. Tall, muscular, tattoos that tell stories of violence. Treated the job professionally until he was folded over a table in 3 seconds.",
      "frase_iconica": "I'm just a professional doing my job — don't take it personally.",
      "atributos": { "rank_sdr": 99999999, "poder_mental": 45, "velocidade": 58, "resistencia": 80, "nivel_xama": 0, "fator_caos": 42, "energia_base": 52, "poder_explosivo": 48 }
    },
    {
      "id": 26,
      "nome": "Walter",
      "tier": "free",
      "elemental": "Nenhum",
      "descricao": "Principal of the elite academy. Tries to maintain order in a school full of conflict. Periodically threatens Kim and Jack's scholarships. Never manages to gather enough proof to act.",
      "frase_iconica": "Be careful. Very careful not to lose your scholarships.",
      "atributos": { "rank_sdr": 999999, "poder_mental": 68, "velocidade": 28, "resistencia": 50, "nivel_xama": 0, "fator_caos": 18, "energia_base": 32, "poder_explosivo": 15 }
    },
    {
      "id": 27,
      "nome": "The Machine",
      "tier": "free",
      "elemental": "Nenhum",
      "descricao": "Mathematics teacher at the elite academy. Writes equations in the air with his pen. Never smiles — except once, imperceptibly, when Nina destroyed Jack. Considered one of the few chosen to teach at the institution.",
      "frase_iconica": "Good morning.",
      "atributos": { "rank_sdr": 999999, "poder_mental": 94, "velocidade": 30, "resistencia": 65, "nivel_xama": 0, "fator_caos": 8, "energia_base": 88, "poder_explosivo": 18 }
    },
    {
      "id": 28,
      "nome": "IA NeoGuide",
      "tier": "free",
      "elemental": "Digital",
      "descricao": "The LDI's artificial intelligence that manages battles, communicates status, and creates avatars. Speaks directly into players' minds. Can hide information from opponents. Its loyalty is to the system — or to something more?",
      "frase_iconica": "Welcome to the Illusion Fight System. Initiating neural integration protocol.",
      "atributos": { "rank_sdr": 999999, "poder_mental": 92, "velocidade": 55, "resistencia": 62, "nivel_xama": 0, "fator_caos": 45, "energia_base": 88, "poder_explosivo": 48 }
    },
    {
      "id": 29,
      "nome": "Ancestral Kim",
      "tier": "evento",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Kim's ancestral form channeled by Pajé Yawanari. Two attributes reach absolute peak — shamanic power and explosive power. This is not Kim. It is what has existed in Kim's blood since 1450.",
      "frase_iconica": "The only rule in a street fight? There are no rules.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 88, "velocidade": 72, "resistencia": 82, "nivel_xama": 9, "fator_caos": 78, "energia_base": 68, "poder_explosivo": 92 }
    },
    {
      "id": 30,
      "nome": "Primordial Kim",
      "tier": "evento",
      "elemental": "Trevas Primordiais / Sangue Primordial",
      "descricao": "The form Kim assumes when control is completely lost. Silver hair, active Xakaxi tribal markings, eyes white spheres with no iris. Black flames that whisper laments. He refers to himself as The Primordial. He remembers nothing afterward.",
      "frase_iconica": "I am The Primordial! The Primordial Blood is truly very powerful.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 92, "velocidade": 88, "resistencia": 90, "nivel_xama": 10, "fator_caos": 85, "energia_base": 78, "poder_explosivo": 98 }
    }
  ]
}
```

### 5.3 Catálogo JSON (es)

`src/data/supertrunfo-es.json`

```json
{
  "meta": {
    "versao": "2.1",
    "universo": "Lutas de Ilusão — Temporada 1",
    "total_cartas": 30,
    "atributos_explicacao": {
      "rank_sdr": "Posición en el ranking mundial SDR. Menor = mejor.",
      "poder_mental": "Capacidad de energía mental en batalla (0-100).",
      "velocidade": "Velocidad de reacción y movimiento (0-100).",
      "resistencia": "Capacidad de absorber daño y seguir luchando (0-100).",
      "nivel_xama": "Dominio sobre poderes ancestrales y elementales (0-10).",
      "fator_caos": "Imprevisibilidad en combate (0-100).",
      "energia_base": "Reserva inicial de energía por batalla (0-100).",
      "poder_explosivo": "Capacidad de liberación súbita de poder extra (0-100)."
    },
    "tiers": ["free", "elite", "evento"]
  },
  "cartas": [
    {
      "id": 1,
      "nome": "Kim Escuela",
      "tier": "free",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Descendiente Xakaxi portador de la Sangre Primordial. Llegó al rank 1201 en su primera batalla. Vive en una casa invadida, vende dulces en el autobús, cuida a su madre. Tiene más poder del que entiende. Cuando pierde el control, algo mucho más antiguo que él toma el mando.",
      "frase_iconica": "¿La única regla en una pelea callejera? No hay reglas.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 72, "velocidade": 74, "resistencia": 68, "nivel_xama": 4, "fator_caos": 95, "energia_base": 58, "poder_explosivo": 82 }
    },
    {
      "id": 2,
      "nome": "Kim Casual",
      "tier": "free",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Descendiente Xakaxi portador de la Sangre Primordial. Llegó al rank 1201 en su primera batalla. Vive en una casa invadida, vende dulces en el autobús, cuida a su madre. Tiene más poder del que entiende. Cuando pierde el control, algo mucho más antiguo que él toma el mando.",
      "frase_iconica": "¿La única regla en una pelea callejera? No hay reglas.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 78, "velocidade": 80, "resistencia": 72, "nivel_xama": 5, "fator_caos": 70, "energia_base": 75, "poder_explosivo": 68 }
    },
    {
      "id": 3,
      "nome": "Kim Ensayo",
      "tier": "elite",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Descendiente Xakaxi portador de la Sangre Primordial. Llegó al rank 1201 en su primera batalla. Vive en una casa invadida, vende dulces en el autobús, cuida a su madre. Tiene más poder del que entiende. Cuando pierde el control, algo mucho más antiguo que él toma el mando.",
      "frase_iconica": "¿La única regla en una pelea callejera? No hay reglas.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 85, "velocidade": 65, "resistencia": 78, "nivel_xama": 6, "fator_caos": 62, "energia_base": 82, "poder_explosivo": 74 }
    },
    {
      "id": 4,
      "nome": "Kim Show",
      "tier": "elite",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Descendiente Xakaxi portador de la Sangre Primordial. Llegó al rank 1201 en su primera batalla. Vive en una casa invadida, vende dulces en el autobús, cuida a su madre. Tiene más poder del que entiende. Cuando pierde el control, algo mucho más antiguo que él toma el mando.",
      "frase_iconica": "¿La única regla en una pelea callejera? No hay reglas.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 70, "velocidade": 88, "resistencia": 65, "nivel_xama": 5, "fator_caos": 92, "energia_base": 60, "poder_explosivo": 90 }
    },
    {
      "id": 5,
      "nome": "Kim Superconcierto",
      "tier": "elite",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Descendiente Xakaxi portador de la Sangre Primordial. Llegó al rank 1201 en su primera batalla. Vive en una casa invadida, vende dulces en el autobús, cuida a su madre. Tiene más poder del que entiende. Cuando pierde el control, algo mucho más antiguo que él toma el mando.",
      "frase_iconica": "¿La única regla en una pelea callejera? No hay reglas.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 80, "velocidade": 68, "resistencia": 76, "nivel_xama": 6, "fator_caos": 75, "energia_base": 92, "poder_explosivo": 78 }
    },
    {
      "id": 6,
      "nome": "Jack Escuela",
      "tier": "free",
      "elemental": "Terra / Pedra",
      "descricao": "Mejor amigo de Kim desde siempre. Extrovertido, teatral, nunca genuinamente asustado. Combina encanto y violencia con eficiencia desconcertante. Usa cualquier ambiente a su favor. Entrenamiento en 3 etapas — letal cuando completo, vulnerable durante la carga.",
      "frase_iconica": "Nunca dejes para mañana lo que puedas hacer que Kim haga hoy.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 62, "velocidade": 88, "resistencia": 55, "nivel_xama": 3, "fator_caos": 84, "energia_base": 60, "poder_explosivo": 72 }
    },
    {
      "id": 7,
      "nome": "Jack Casual",
      "tier": "free",
      "elemental": "Terra / Pedra",
      "descricao": "Mejor amigo de Kim desde siempre. Extrovertido, teatral, nunca genuinamente asustado. Combina encanto y violencia con eficiencia desconcertante. Usa cualquier ambiente a su favor. Entrenamiento en 3 etapas — letal cuando completo, vulnerable durante la carga.",
      "frase_iconica": "Nunca dejes para mañana lo que puedas hacer que Kim haga hoy.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 70, "velocidade": 82, "resistencia": 62, "nivel_xama": 4, "fator_caos": 78, "energia_base": 68, "poder_explosivo": 76 }
    },
    {
      "id": 8,
      "nome": "Jack Ensayo",
      "tier": "elite",
      "elemental": "Terra / Pedra",
      "descricao": "Mejor amigo de Kim desde siempre. Extrovertido, teatral, nunca genuinamente asustado. Combina encanto y violencia con eficiencia desconcertante. Usa cualquier ambiente a su favor. Entrenamiento en 3 etapas — letal cuando completo, vulnerable durante la carga.",
      "frase_iconica": "Nunca dejes para mañana lo que puedas hacer que Kim haga hoy.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 75, "velocidade": 78, "resistencia": 68, "nivel_xama": 5, "fator_caos": 72, "energia_base": 72, "poder_explosivo": 85 }
    },
    {
      "id": 9,
      "nome": "Jack Show",
      "tier": "elite",
      "elemental": "Terra / Pedra",
      "descricao": "Mejor amigo de Kim desde siempre. Extrovertido, teatral, nunca genuinamente asustado. Combina encanto y violencia con eficiencia desconcertante. Usa cualquier ambiente a su favor. Entrenamiento en 3 etapas — letal cuando completo, vulnerable durante la carga.",
      "frase_iconica": "Nunca dejes para mañana lo que puedas hacer que Kim haga hoy.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 68, "velocidade": 92, "resistencia": 58, "nivel_xama": 4, "fator_caos": 88, "energia_base": 62, "poder_explosivo": 80 }
    },
    {
      "id": 10,
      "nome": "Jack Superconcierto",
      "tier": "elite",
      "elemental": "Terra / Pedra",
      "descricao": "Mejor amigo de Kim desde siempre. Extrovertido, teatral, nunca genuinamente asustado. Combina encanto y violencia con eficiencia desconcertante. Usa cualquier ambiente a su favor. Entrenamiento en 3 etapas — letal cuando completo, vulnerable durante la carga.",
      "frase_iconica": "Nunca dejes para mañana lo que puedas hacer que Kim haga hoy.",
      "atributos": { "rank_sdr": 10776, "poder_mental": 76, "velocidade": 85, "resistencia": 65, "nivel_xama": 5, "fator_caos": 80, "energia_base": 74, "poder_explosivo": 88 }
    },
    {
      "id": 11,
      "nome": "Nina Escuela",
      "tier": "free",
      "elemental": "Luz",
      "descricao": "Muay Thai y katana desde los 12 años en el circuito profesional. Pasó años fuera de Bravara. Cuando habla, la escena cambia. Competitiva al extremo — prefiere morir antes que pedir ayuda en una pelea.",
      "frase_iconica": "Necesitas esforzarte mucho más para merecer a una mujer como yo.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 76, "velocidade": 85, "resistencia": 79, "nivel_xama": 4, "fator_caos": 55, "energia_base": 72, "poder_explosivo": 62 }
    },
    {
      "id": 12,
      "nome": "Nina Casual",
      "tier": "free",
      "elemental": "Luz",
      "descricao": "Muay Thai y katana desde los 12 años en el circuito profesional. Pasó años fuera de Bravara. Cuando habla, la escena cambia. Competitiva al extremo — prefiere morir antes que pedir ayuda en una pelea.",
      "frase_iconica": "Necesitas esforzarte mucho más para merecer a una mujer como yo.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 74, "velocidade": 80, "resistencia": 74, "nivel_xama": 4, "fator_caos": 68, "energia_base": 68, "poder_explosivo": 70 }
    },
    {
      "id": 13,
      "nome": "Nina Ensayo",
      "tier": "elite",
      "elemental": "Luz",
      "descricao": "Muay Thai y katana desde los 12 años en el circuito profesional. Pasó años fuera de Bravara. Cuando habla, la escena cambia. Competitiva al extremo — prefiere morir antes que pedir ayuda en una pelea.",
      "frase_iconica": "Necesitas esforzarte mucho más para merecer a una mujer como yo.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 82, "velocidade": 76, "resistencia": 80, "nivel_xama": 5, "fator_caos": 52, "energia_base": 78, "poder_explosivo": 66 }
    },
    {
      "id": 14,
      "nome": "Nina Show",
      "tier": "elite",
      "elemental": "Luz",
      "descricao": "Muay Thai y katana desde los 12 años en el circuito profesional. Pasó años fuera de Bravara. Cuando habla, la escena cambia. Competitiva al extremo — prefiere morir antes que pedir ayuda en una pelea.",
      "frase_iconica": "Necesitas esforzarte mucho más para merecer a una mujer como yo.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 78, "velocidade": 88, "resistencia": 76, "nivel_xama": 5, "fator_caos": 72, "energia_base": 70, "poder_explosivo": 84 }
    },
    {
      "id": 15,
      "nome": "Nina Superconcierto",
      "tier": "elite",
      "elemental": "Luz",
      "descricao": "Muay Thai y katana desde los 12 años en el circuito profesional. Pasó años fuera de Bravara. Cuando habla, la escena cambia. Competitiva al extremo — prefiere morir antes que pedir ayuda en una pelea.",
      "frase_iconica": "Necesitas esforzarte mucho más para merecer a una mujer como yo.",
      "atributos": { "rank_sdr": 8724, "poder_mental": 80, "velocidade": 72, "resistencia": 82, "nivel_xama": 5, "fator_caos": 60, "energia_base": 80, "poder_explosivo": 74 }
    },
    {
      "id": 16,
      "nome": "Thunderbolt",
      "tier": "free",
      "elemental": "Eletricidade (secundário da Luz)",
      "descricao": "Bruno Ribeiro. 1.201 victorias antes de encontrar a Kim. Arrogante, metódico, cruel en los combates. Usa la humillación como estrategia psicológica. Contrató matones para perseguir a Kim en el colegio — no funcionó.",
      "frase_iconica": "De rodillas, llorando e implorando. Solo entonces terminaré.",
      "atributos": { "rank_sdr": 30156, "poder_mental": 58, "velocidade": 92, "resistencia": 64, "nivel_xama": 2, "fator_caos": 44, "energia_base": 55, "poder_explosivo": 52 }
    },
    {
      "id": 17,
      "nome": "Shuntaro",
      "tier": "free",
      "elemental": "Água",
      "descricao": "Rank 998. De Azuma. Viajó 9 horas para desafiar a Kim personalmente. Estratégico, elegante, respeta a los oponentes fuertes. 6 meses en el juego y ya está entre los mil mejores del mundo.",
      "frase_iconica": "Prepárate. No vine tan lejos para perder.",
      "atributos": { "rank_sdr": 998, "poder_mental": 83, "velocidade": 87, "resistencia": 74, "nivel_xama": 7, "fator_caos": 68, "energia_base": 78, "poder_explosivo": 72 }
    },
    {
      "id": 18,
      "nome": "Lenna",
      "tier": "evento",
      "elemental": "Vento",
      "descricao": "Top 500 en el ranking. Se interesó en Kim tras el video viral. Segura, enigmática, competitiva pero justa. Evalúa a los oponentes con frialdad antes de actuar.",
      "frase_iconica": "No peleo para demostrar algo. Peleo para saber.",
      "atributos": { "rank_sdr": 500, "poder_mental": 88, "velocidade": 82, "resistencia": 75, "nivel_xama": 6, "fator_caos": 60, "energia_base": 80, "poder_explosivo": 70 }
    },
    {
      "id": 19,
      "nome": "Nexus Phantasm",
      "tier": "free",
      "elemental": "Dados / Caos Digital",
      "descricao": "Heraldo de las Arenas. No es humano ni IA convencional. Creado por hackers, oficializado por Yohu. Sarcástico por naturaleza. Su presencia distorsiona el campo de batalla.",
      "frase_iconica": "¡Damas y caballeros, lo imposible es solo una cuestión de perspectiva!",
      "atributos": { "rank_sdr": 9999999, "poder_mental": 90, "velocidade": 65, "resistencia": 88, "nivel_xama": 3, "fator_caos": 98, "energia_base": 82, "poder_explosivo": 78 }
    },
    {
      "id": 20,
      "nome": "Pajé Yawanari",
      "tier": "evento",
      "elemental": "Todos os elementais primários",
      "descricao": "Chamán inmortal de la tribu Xakaxi. Quinientos años observando a la humanidad. Presenció guerras mundiales, pandemias, colonización y redes sociales. Completamente loco. Habla en jerga moderna mezclada con sabiduría ancestral. Tiene amigos imaginarios.",
      "frase_iconica": "¡Vine a brillar! Soy el 10/10 que se quedó cuidando los poderes sagrados de este mundo loco.",
      "atributos": { "rank_sdr": 999999999, "poder_mental": 95, "velocidade": 38, "resistencia": 92, "nivel_xama": 10, "fator_caos": 72, "energia_base": 98, "poder_explosivo": 80 }
    },
    {
      "id": 21,
      "nome": "VoidHunter_X",
      "tier": "elite",
      "elemental": "Vazio",
      "descricao": "Entidad del LDI. No es un jugador. La visera no refleja. Los dedos se doblan al revés. Baba negra en las fisuras del pectoral. Nadie sabe de dónde vino ni quién lo creó.",
      "frase_iconica": "...",
      "atributos": { "rank_sdr": 999999999, "poder_mental": 88, "velocidade": 78, "resistencia": 94, "nivel_xama": 8, "fator_caos": 90, "energia_base": 85, "poder_explosivo": 88 }
    },
    {
      "id": 22,
      "nome": "David Kronos",
      "tier": "evento",
      "elemental": "Escuridão Corrompida",
      "descricao": "Espíritu ancestral corrompido de Powa, hijo del Pajé Yawanari. Cinco siglos esperando el Cuerpo Primordial — el descendiente que lleve la Sangre Primordial para usarlo como huésped permanente. Cada posesión deteriora al huésped. Creó el LDI como trampa.",
      "frase_iconica": "Por fin… Cuánto he esperado este momento.",
      "atributos": { "rank_sdr": 0, "poder_mental": 96, "velocidade": 52, "resistencia": 95, "nivel_xama": 10, "fator_caos": 88, "energia_base": 92, "poder_explosivo": 94 }
    },
    {
      "id": 23,
      "nome": "Helena",
      "tier": "free",
      "elemental": "Nenhum",
      "descricao": "La madre de Kim — o más bien, la mujer que lo salvó cuando tenía 12 años y él era un bebé. Sobrevivió lo que no debía y crió a Kim sola desde cero. Complicada, compleja, alcohólica. Pero cuando importó, no lo abandonó.",
      "frase_iconica": "A los 18 ya no me necesitarás. Y yo finalmente podré librarme de ti.",
      "atributos": { "rank_sdr": 999999, "poder_mental": 48, "velocidade": 38, "resistencia": 88, "nivel_xama": 0, "fator_caos": 75, "energia_base": 28, "poder_explosivo": 22 }
    },
    {
      "id": 24,
      "nome": "Osvaldo",
      "tier": "free",
      "elemental": "Terra",
      "descricao": "Portero de la academia de élite. Le enseñó guitarra a Kim durante tres años. Usó su influencia para conseguir una beca del 50% para Kim y Jack. Vio potencial donde todos veían un problema.",
      "frase_iconica": "Entren rápido, antes de que el director me vea.",
      "atributos": { "rank_sdr": 9999999, "poder_mental": 72, "velocidade": 35, "resistencia": 60, "nivel_xama": 3, "fator_caos": 22, "energia_base": 58, "poder_explosivo": 30 }
    },
    {
      "id": 25,
      "nome": "Brock",
      "tier": "free",
      "elemental": "Nenhum",
      "descricao": "Líder del grupo de matones contratados por Thunderbolt. Alto, musculoso, tatuajes que cuentan historias de violencia. Trató el trabajo con profesionalismo hasta que lo doblaron sobre una mesa en 3 segundos.",
      "frase_iconica": "Solo soy un profesional haciendo mi trabajo — no lo tomes personal.",
      "atributos": { "rank_sdr": 99999999, "poder_mental": 45, "velocidade": 58, "resistencia": 80, "nivel_xama": 0, "fator_caos": 42, "energia_base": 52, "poder_explosivo": 48 }
    },
    {
      "id": 26,
      "nome": "Walter",
      "tier": "free",
      "elemental": "Nenhum",
      "descricao": "Director de la academia de élite. Intenta mantener el orden en una escuela llena de conflictos. Amenaza periódicamente a Kim y Jack con sus becas. Nunca consigue pruebas suficientes para actuar.",
      "frase_iconica": "Tengan cuidado. Mucho cuidado de no perder sus becas.",
      "atributos": { "rank_sdr": 999999, "poder_mental": 68, "velocidade": 28, "resistencia": 50, "nivel_xama": 0, "fator_caos": 18, "energia_base": 32, "poder_explosivo": 15 }
    },
    {
      "id": 27,
      "nome": "La Máquina",
      "tier": "free",
      "elemental": "Nenhum",
      "descricao": "Profesor de matemáticas de la academia de élite. Escribe ecuaciones en el aire con el bolígrafo. Nunca sonríe — excepto una vez, imperceptiblemente, cuando Nina destruyó a Jack. Considerado uno de los pocos elegidos para dar clases en la institución.",
      "frase_iconica": "Buenos días.",
      "atributos": { "rank_sdr": 999999, "poder_mental": 94, "velocidade": 30, "resistencia": 65, "nivel_xama": 0, "fator_caos": 8, "energia_base": 88, "poder_explosivo": 18 }
    },
    {
      "id": 28,
      "nome": "IA NeoGuide",
      "tier": "free",
      "elemental": "Digital",
      "descricao": "La inteligencia artificial del LDI que gestiona las batallas, comunica el estado y crea avatares. Habla directamente en la mente de los jugadores. Puede ocultar información al oponente. Su lealtad es al sistema — ¿o a algo más?",
      "frase_iconica": "Bienvenido al Sistema de Lutas de Ilusão. Iniciando protocolo de integración neural.",
      "atributos": { "rank_sdr": 999999, "poder_mental": 92, "velocidade": 55, "resistencia": 62, "nivel_xama": 0, "fator_caos": 45, "energia_base": 88, "poder_explosivo": 48 }
    },
    {
      "id": 29,
      "nome": "Kim Ancestral",
      "tier": "evento",
      "elemental": "Trevas (manifestado) / Fogo (nativo)",
      "descricao": "Forma ancestral de Kim canalizada por el Pajé Yawanari. Dos atributos alcanzan el pico absoluto — poder chamánico y poder explosivo. No es Kim. Es lo que existe en la sangre de Kim desde 1450.",
      "frase_iconica": "¿La única regla en una pelea callejera? No hay reglas.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 88, "velocidade": 72, "resistencia": 82, "nivel_xama": 9, "fator_caos": 78, "energia_base": 68, "poder_explosivo": 92 }
    },
    {
      "id": 30,
      "nome": "Kim Primordial",
      "tier": "evento",
      "elemental": "Trevas Primordiais / Sangue Primordial",
      "descricao": "La forma que Kim asume cuando el control se pierde por completo. Cabello plateado, marcas tribales Xakaxi activas, ojos como esferas blancas sin iris. Llamas negras que susurran lamentos. Se refiere a sí mismo como El Primordial. No recuerda nada después.",
      "frase_iconica": "¡Soy El Primordial! La Sangre Primordial es verdaderamente muy poderosa.",
      "atributos": { "rank_sdr": 1201, "poder_mental": 92, "velocidade": 88, "resistencia": 90, "nivel_xama": 10, "fator_caos": 85, "energia_base": 78, "poder_explosivo": 98 }
    }
  ]
}
```

### 5.4 Regras de acesso por tier

`src/lib/topTrumpsCardAccess.js`

```js
import { ehAssinante } from './releaseAccess'

export const TOP_TRUMPS_CARD_LIMITS = Object.freeze({
  guest: 15,
  free: 15,
  elite: 25,
  evento: 30,
})

const CARD_IDS_BY_TIER = Object.freeze({
  elite: new Set([3, 4, 5, 8, 9, 10, 13, 14, 15, 21]),
  evento: new Set([18, 20, 22, 29, 30]),
})

const ACCESS_RANK = Object.freeze({ guest: 0, free: 0, elite: 1, evento: 2 })
const CARD_RANK = Object.freeze({ free: 0, elite: 1, evento: 2 })

export function getTopTrumpsTierForCard(cardId) {
  const id = Number(cardId)
  if (!Number.isInteger(id) || id < 1 || id > 30) return null
  if (CARD_IDS_BY_TIER.elite.has(id)) return 'elite'
  if (CARD_IDS_BY_TIER.evento.has(id)) return 'evento'
  return 'free'
}

export function getTopTrumpsAccessTier(user, perfil) {
  if (!user) return 'guest'
  if (perfil?.tier === 'evento') return 'evento'
  if (ehAssinante(perfil)) return 'elite'
  return 'free'
}
export function canAcquireTopTrumpsCard(cardId, user, perfil) {
  const cardTier = getTopTrumpsTierForCard(cardId)
  const accessTier = getTopTrumpsAccessTier(user, perfil)
  return cardTier != null && CARD_RANK[cardTier] <= ACCESS_RANK[accessTier]
}

export function filterTopTrumpsCardPool(cards, user, perfil) {
  return cards.filter(card => canAcquireTopTrumpsCard(card.id, user, perfil))
}

export function filterTopTrumpsInitialAccountPool(cards) {
  return cards.filter(card => getTopTrumpsTierForCard(card.id) === 'free')
}
```

### 5.5 Resolução da arte

`src/lib/topTrumpsCardImages.js`

```js
import cardFallback from '../assets/images/cards/characters/card-fallback.png'

const cardModules = import.meta.glob(
  '../assets/images/cards/characters/card-[0-9][0-9].png',
  { eager: true, import: 'default' },
)

export const TOP_TRUMPS_CARD_IMAGES = Object.fromEntries(
  Object.entries(cardModules).map(([path, image]) => {
    const id = Number(path.match(/card-(\d+)\.png$/)?.[1])
    return [id, image]
  }),
)

export function getTopTrumpsCardImage(cardOrId) {
  const id = typeof cardOrId === 'object' ? cardOrId?.id : cardOrId
  return TOP_TRUMPS_CARD_IMAGES[Number(id)] || cardFallback
}
```

### 5.6 Partida contra a IA

`src/pages/games/TopTrumps/hooks/useTopTrumpsSP.js`

```js
import { useState, useEffect, useCallback } from 'react'
import { filterTopTrumpsCardPool } from '../../../../lib/topTrumpsCardAccess'

function embaralhar(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function useTopTrumpsSP({
  user, perfil, deckUsuario, todasCartas, atributos,
  jaGanhouHoje, tentativasMax,
  consumir, registrarPartida, registrarEvento, registrarPontuacaoRanking,
  desbloquear,
  onEfeitosRevelacao,
  onFinalizarComRecompensa
}) {
  const [fase, setFase] = useState('menu')
  const [deckJogador, setDeckJogador] = useState([])
  const [deckIA, setDeckIA] = useState([])
  const [cartaJogador, setCartaJogador] = useState(null)
  const [cartaIA, setCartaIA] = useState(null)
  const [atributoEscolhido, setAtributoEscolhido] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [placar, setPlacar] = useState({ jogador: 0, ia: 0 })
  const [rodada, setRodada] = useState(1)
  const [totalTurnos, setTotalTurnos] = useState(null)
  const [vezAtual, setVezAtual] = useState('jogador')
  const [iaEscolhendo, setIaEscolhendo] = useState(false)
  const [girando, setGirando] = useState(false)
  const [confirmandoAtributo, setConfirmandoAtributo] = useState(null)
  const [historicoRodadas, setHistoricoRodadas] = useState([])
  const [swipeRevealed, setSwipeRevealed] = useState(false)
  const [templateIdxJogador, setTemplateIdxJogador] = useState(0)
  const [templateIdxIA, setTemplateIdxIA] = useState(0)
  const [recompensaOpcoes, setRecompensaOpcoes] = useState([])
  const [cartaRecompensaSelecionada, setCartaRecompensaSelecionada] = useState(null)

  useEffect(() => {
    if (totalTurnos !== null || deckUsuario.length === 0) return
    const opcoes = [5, 10, 15, 20].filter(n => n <= deckUsuario.length)
    if (opcoes.length === 1) setTotalTurnos(opcoes[0])
  }, [deckUsuario, totalTurnos])

  useEffect(() => {
    if (vezAtual !== 'ia' || fase !== 'jogando') return
    const timer = setTimeout(() => iaEscolherAtributo(), 500)
    return () => clearTimeout(timer)
  }, [vezAtual, fase])

  function sortearTemplates() {
    const p = Math.floor(Math.random() * 6)
    let ia = Math.floor(Math.random() * 6)
    while (ia === p) ia = Math.floor(Math.random() * 6)
    setTemplateIdxJogador(p)
    setTemplateIdxIA(ia)
  }

  function iaEscolherAtributo() {
    if (!cartaJogador || !cartaIA || fase !== 'jogando') return
    setIaEscolhendo(true)
    setTimeout(() => {
      if (!cartaJogador || !cartaIA) { setIaEscolhendo(false); return }
      const attrsDisponiveis = atributos.filter(attr => cartaIA.atributos[attr.id] !== undefined && attr.id !== 'rank_sdr')
      if (!attrsDisponiveis.length) { setIaEscolhendo(false); return }
      const escolhido = attrsDisponiveis[Math.floor(Math.random() * attrsDisponiveis.length)]
      setIaEscolhendo(false)
      resolverRodada(escolhido.id, 'ia')
    }, 1500)
  }

  function resolverRodada(attrKey, escolhidoPor) {
    if (!cartaJogador || !cartaIA) return
    const attr = atributos.find(a => a.id === attrKey)
    if (!attr) return
    const vJ = cartaJogador.atributos[attrKey]
    const vI = cartaIA.atributos[attrKey]
    const res = vJ > vI ? 'ganhou' : vJ < vI ? 'perdeu' : 'empate'

    setAtributoEscolhido(attrKey)
    setResultado(res)
    setConfirmandoAtributo(null)
    setGirando(true)

    onEfeitosRevelacao(res, {
      onReveal: () => {
        setGirando(false)
        if (res === 'ganhou') setPlacar(p => ({ ...p, jogador: p.jogador + 1 }))
        if (res === 'perdeu') setPlacar(p => ({ ...p, ia: p.ia + 1 }))
        setHistoricoRodadas(h => [...h, {
          rodada,
          cartaJogador: { nome: cartaJogador.nome, atributos: cartaJogador.atributos },
          cartaIA: { nome: cartaIA.nome, atributos: cartaIA.atributos },
          atributo: attr.nomeKey, valorJogador: vJ, valorIA: vI, resultado: res,
          escolhidoPor
        }])
        setFase('resultado_rodada')
      }
    })
  }

  async function finalizarPartida() {
    const venceu = placar.jogador > placar.ia
    if (venceu) {
      registrarEvento('trumps_vitoria', 'Venceu uma partida no Top Trumps', 1)
      registrarEvento('jogo_jogado', 'Jogou Top Trumps', 1)
      if (user?.id) registrarPontuacaoRanking(user.id)
    }
    if (!user) { setFase('fim_jogo'); return }
    const resultadoStr = venceu ? 'vitoria' : placar.jogador === placar.ia ? 'empate' : 'derrota'
    const jogadas = historicoRodadas.length
    const vitorias = historicoRodadas.filter(h => h.resultado === 'ganhou').length
    const derrotas = historicoRodadas.filter(h => h.resultado === 'perdeu').length
    const empates = historicoRodadas.filter(h => h.resultado === 'empate').length

    let usadasHoje = 0
    if (user) usadasHoje = await consumir(user.id)

    if (venceu) {
      const podeGanhar = (tentativasMax - usadasHoje) > 0 && !jaGanhouHoje
      if (podeGanhar) {
        const idsTem = new Set(deckUsuario.map(c => String(c.id)))
        const poolPermitido = filterTopTrumpsCardPool(todasCartas, user, perfil)
        const pool = poolPermitido.filter(c => !idsTem.has(String(c.id)))
        if (pool.length > 0) {
          setRecompensaOpcoes(embaralhar(pool).slice(0, 3))
          setFase('recompensa')
          window.__partidaPendente = { jogadas, vitorias, derrotas, empates, resultado: resultadoStr }
          return
        }
      }
    }
    setFase('fim_jogo')
    registrarPartida(user.id, { jogadas, vitorias, derrotas, empates, resultado: resultadoStr }).then(stats => {
      if (stats.total_vitorias === 1) desbloquear('primeira_vitoria_trumps')
      if (stats.total_derrotas === 1) desbloquear('primeira_derrota_trumps')
      if (stats.total_partidas === 10) desbloquear('veterano_trumps_10')
      if (stats.total_partidas === 100) desbloquear('centuriao_trumps')
      if (stats.total_partidas === 1000) desbloquear('lenda_trumps')
    })
  }

  function iniciarJogoComCartas() {
    const pool = embaralhar([...deckUsuario])
    const cartasJogador = pool.slice(0, 5)
    const cartasIA = embaralhar([...deckUsuario]).slice(0, 5)
    setDeckJogador(cartasJogador)
    setDeckIA(cartasIA)
    setCartaJogador(cartasJogador[0] || null)
    setCartaIA(cartasIA[0] || null)
    setPlacar({ jogador: 0, ia: 0 })
    setHistoricoRodadas([])
    sortearTemplates()
    setVezAtual('jogador')
    setIaEscolhendo(false)
    setFase('ppt')
  }

  function resolverPPT(winnerName) {
    if (winnerName === deckJogador[0]?.nome || winnerName === 'VOC\u00CA') {
      setVezAtual('jogador')
    } else if (winnerName === null) {
      setVezAtual('jogador')
    } else {
      setVezAtual('ia')
    }
    setTimeout(() => {
      setRodada(1)
      setFase('jogando')
    }, 1500)
  }

  function onClickAtributo(atributoId) {
    if (girando || confirmandoAtributo) return
    setConfirmandoAtributo(atributoId)
  }

  function cancelarJogada() {
    setConfirmandoAtributo(null)
  }

  function confirmarJogada() {
    const attrKey = confirmandoAtributo
    if (!attrKey || !cartaJogador || !cartaIA) return
    setConfirmandoAtributo(null)
    resolverRodada(attrKey, 'jogador')
  }

  function proximaRodada() {
    setSwipeRevealed(false)
    if (rodada >= totalTurnos) { finalizarPartida(); return }
    const pJ = deckJogador[rodada % deckJogador.length]
    const pI = deckIA[rodada % deckIA.length]
    setCartaJogador(pJ)
    setCartaIA(pI)
    setAtributoEscolhido(null)
    setResultado(null)
    setRodada(r => r + 1)
    setFase('jogando')
    sortearTemplates()
    setVezAtual(v => v === 'jogador' ? 'ia' : 'jogador')
  }

  async function handleDesistir() {
    setPlacar(p => ({ ...p, ia: p.ia + 1 }))
    if (user) await consumir(user.id)
    const jogadas = historicoRodadas.length
    const vitorias = historicoRodadas.filter(h => h.resultado === 'ganhou').length
    const derrotas = historicoRodadas.filter(h => h.resultado === 'perdeu').length + 1
    const empates = historicoRodadas.filter(h => h.resultado === 'empate').length
    setFase('fim_jogo')
    if (!user) return
    registrarPartida(user.id, { jogadas, vitorias, derrotas, empates, resultado: 'derrota' }).then(stats => {
      if (stats.total_derrotas === 1) desbloquear('primeira_derrota_trumps')
      if (stats.total_partidas === 10) desbloquear('veterano_trumps_10')
      if (stats.total_partidas === 100) desbloquear('centuriao_trumps')
      if (stats.total_partidas === 1000) desbloquear('lenda_trumps')
    })
  }

  return {
    fase, cartaJogador, cartaIA, placar, rodada, totalTurnos, setTotalTurnos,
    vezAtual, iaEscolhendo, girando, confirmandoAtributo, atributoEscolhido,
    resultado, historicoRodadas, swipeRevealed, setSwipeRevealed,
    templateIdxJogador, templateIdxIA, recompensaOpcoes,
    cartaRecompensaSelecionada, setCartaRecompensaSelecionada,
    iniciarJogoComCartas, resolverPPT, onClickAtributo,
    cancelarJogada, confirmarJogada, proximaRodada, handleDesistir,
    setFase
  }
}
```

### 5.7 Deck inicial

`src/pages/games/TopTrumps/hooks/useTopTrumpsDeck.js`

```js
import { useState, useEffect } from 'react'
import { carregarDeck as carregarDeckDB, substituirDeck, salvarCartasDeck } from '../../../../hooks/useLeaderboardDB'
import { filterTopTrumpsCardPool } from '../../../../lib/topTrumpsCardAccess'

function embaralhar(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function useTopTrumpsDeck({ user, perfil, todasCartas }) {
  const [deckUsuario, setDeckUsuario] = useState([])

  useEffect(() => {
    if (!user) return
    carregarDeckDB(user.id).then(ids => {
      const idsUnicos = [...new Set(ids || [])]
      let cartas = idsUnicos.map(id => todasCartas.find(c => c.id === id)).filter(Boolean)

      if (idsUnicos.length > 0 && cartas.length < 5) {
        console.log('[TT] deck corrompido — apenas', cartas.length, 'cartas válidas de', idsUnicos.length, '. Gerando novo deck...')
        const poolPermitido = filterTopTrumpsCardPool(todasCartas, user, perfil)
        const novas = embaralhar(poolPermitido).slice(0, 5)
        substituirDeck(user.id, novas.map(c => c.id)).then(() => {
          setDeckUsuario(novas)
        })
        return
      }

      setDeckUsuario(cartas)

      if (perfil?.role === 'admin' || perfil?.is_admin) {
        const idsTem = new Set(idsUnicos.map(id => Number(id)))
        const todosIds = todasCartas.map(c => c.id)
        const faltando = todosIds.filter(n => !idsTem.has(n))
        if (faltando.length > 0) {
          console.log('[TT] Admin auto-fill — adicionando cartas faltantes:', faltando)
          salvarCartasDeck(user.id, faltando)
        }
      }
    })
  }, [user, perfil?.tier, perfil?.role, perfil?.is_admin])

  useEffect(() => {
    if (user) return
    if (deckUsuario.length === 0) {
      const poolGuest = filterTopTrumpsCardPool(todasCartas, null, null)
      setDeckUsuario(embaralhar(poolGuest).slice(0, 5))
    }
  }, [user])

  return { deckUsuario, setDeckUsuario }
}
```

### 5.8 Recompensa diária

`src/pages/games/TopTrumps/hooks/useTopTrumpsRewards.js`

```js
import { useState, useEffect } from 'react'
import {
  carregarTentativas, consumirTentativa,
  salvarCartasDeck, marcarCartaGanha,
  verificarCartaGanhaHoje, registrarPartida
} from '../../../../hooks/useLeaderboardDB'
import { canAcquireTopTrumpsCard, getTopTrumpsAccessTier } from '../../../../lib/topTrumpsCardAccess'

function getTierInicial(user, perfil) {
  const tier = getTopTrumpsAccessTier(user, perfil)
  return tier === 'guest' || tier === 'evento' ? 'free' : tier
}

export function useTopTrumpsRewards({
  user, perfil, deckUsuario, setDeckUsuario, todasCartas,
  historicoRodadas, desbloquear, onRecompensaConfirmada
}) {
  const [jaGanhouHoje, setJaGanhouHoje] = useState(false)
  const [tentativasMax, setTentativasMax] = useState(3)
  const [tentativasRestantes, setTentativasRestantes] = useState(3)

  useEffect(() => {
    if (!user) return
    carregarTentativas(user.id, getTierInicial(user, perfil)).then(({ usadas, jaGanhouHoje: jaGanhou, limite }) => {
      setTentativasMax(limite)
      setTentativasRestantes(Math.max(0, limite - usadas))
      setJaGanhouHoje(jaGanhou || false)
    })
  }, [user, perfil?.tier])

  async function consumir() {
    if (!user) return
    const usadas = await consumirTentativa(user.id)
    setTentativasRestantes(Math.max(0, tentativasMax - usadas))
  }

  async function escolherRecompensa(carta) {
    if (!carta || !user || !canAcquireTopTrumpsCard(carta.id, user, perfil)) {
      console.warn('[TT] recompensa fora do pool permitido bloqueada:', carta?.id)
      onRecompensaConfirmada()
      return
    }
    if (user) {
      const jaGanhou = await verificarCartaGanhaHoje(user.id)
      if (jaGanhou) {
        console.warn('[TT] Tentativa de ganhar carta novamente no mesmo dia — bloqueado pelo servidor')
        onRecompensaConfirmada()
        return
      }
    }
    setDeckUsuario([...deckUsuario, carta])
    salvarCartasDeck(user.id, [carta.id])
    setJaGanhouHoje(true)
    await marcarCartaGanha(user.id)
    const pendente = window.__partidaPendente || { jogadas: historicoRodadas.length, vitorias: 0, derrotas: 0, empates: 0, resultado: 'vitoria' }
    registrarPartida(user.id, { ...pendente, carta_recompensa: carta.id }).then(stats => {
      if (stats.total_vitorias === 1) desbloquear('primeira_vitoria_trumps')
      if (stats.total_partidas === 10) desbloquear('veterano_trumps_10')
      if (stats.total_partidas === 100) desbloquear('centuriao_trumps')
      if (stats.total_partidas === 1000) desbloquear('lenda_trumps')
    })
    window.__partidaPendente = null
    onRecompensaConfirmada()
  }

  return { jaGanhouHoje, tentativasMax, tentativasRestantes, escolherRecompensa, consumir }
}
```

### 5.9 Persistência do deck

`src/pages/games/TopTrumps/hooks/deckPersistence.js`

```js
import { supabase } from '../../../../lib/supabase'

const DECK_TYPES = ['deck_5', 'deck_10', 'deck_15', 'deck_20']
const DECK_SIZES = { deck_5: 5, deck_10: 10, deck_15: 15, deck_20: 20 }

/**
 * Carrega as cartas de um deck específico do usuário.
 */
export async function carregarDeckTipo(userId, deckType) {
  const { data } = await supabase
    .from('toptrumps_decks')
    .select('carta_id')
    .eq('user_id', userId)
    .eq('deck_type', deckType)
  if (!data) return []
  return data.map(d => {
    const n = Number(d.carta_id)
    return isNaN(n) ? d.carta_id : n
  })
}

/**
 * Salva um deck completo (substitui cartas existentes).
 * Remove duplicatas antes de salvar — cada carta só pode aparecer uma vez.
 */
export async function salvarDeckTipo(userId, deckType, cartaIds) {
  if (cartaIds.length === 0) return true

  const unicos = [...new Set(cartaIds)]

  const { error: delErr } = await supabase
    .from('toptrumps_decks')
    .delete()
    .eq('user_id', userId)
    .eq('deck_type', deckType)
  if (delErr) { console.error('[DECK] Erro ao limpar deck antigo:', delErr) }

  const inserts = unicos.map(id => ({
    user_id: userId,
    carta_id: String(id),
    deck_type: deckType,
    deck_name: ''
  }))
  const { error: insErr } = await supabase
    .from('toptrumps_decks')
    .insert(inserts)
  if (insErr) { console.error('[DECK] Erro ao salvar deck:', insErr); return false }
  return true
}

/**
 * Carrega o nome personalizado de um deck.
 */
export async function carregarNomeDeck(userId, deckType) {
  const { data } = await supabase
    .from('toptrumps_deck_nomes')
    .select('nome')
    .eq('user_id', userId)
    .eq('deck_type', deckType)
    .single()
  return data?.nome || ''
}

/**
 * Salva o nome personalizado de um deck.
 */
export async function salvarNomeDeck(userId, deckType, nome) {
  const { error } = await supabase
    .from('toptrumps_deck_nomes')
    .upsert({ user_id: userId, deck_type: deckType, nome }, { onConflict: 'user_id,deck_type' })
  if (error) console.error('[DECK] Erro ao salvar nome:', error)
}

/**
 * Verifica se o usuário tem um deck completo para um determinado tamanho.
 */
export async function temDeckCompleto(userId, deckType) {
  const cartas = await carregarDeckTipo(userId, deckType)
  return cartas.length === DECK_SIZES[deckType]
}

/**
 * Retorna os decks que o usuário tem completos.
 */
export async function listarDecksCompletos(userId) {
  const resultados = {}
  for (const dt of DECK_TYPES) {
    const cartas = await carregarDeckTipo(userId, dt)
    if (cartas.length === DECK_SIZES[dt]) {
      const nome = await carregarNomeDeck(userId, dt)
      resultados[dt] = { size: DECK_SIZES[dt], cartas, nome }
    }
  }
  return resultados
}

export { DECK_TYPES, DECK_SIZES }
```

### 5.10 Máquina de turno do multiplayer

`src/pages/games/TopTrumps/hooks/useMultiplayerTurnMachine.js`

```js
import { useCallback, useEffect, useReducer, useRef } from 'react'

export const RESULT_DURATION_MS = 30000

const initialState = {
  phase: 'carregando',
  result: null,
  resultStartedAt: null,
  resultRemaining: 30,
  localReady: false,
  opponentReady: false,
  advanceRequested: false
}

function reduce(state, event) {
  switch (event.type) {
    case 'ENTER_PPT':
      if (state.phase !== 'carregando' && state.phase !== 'ppt') return state
      return { ...initialState, phase: 'ppt' }
    case 'ENTER_PLAYING':
      if (!['carregando', 'ppt', 'revelacao'].includes(state.phase)) return state
      if (state.phase === 'revelacao' && !event.authorized) return state
      return { ...initialState, phase: 'jogando' }
    case 'START_RESULT':
      if (state.phase !== 'jogando' || !event.result?.turn) return state
      return {
        ...state,
        phase: 'revelacao',
        result: event.result,
        resultStartedAt: event.now,
        resultRemaining: 30,
        localReady: false,
        opponentReady: false,
        advanceRequested: false
      }
    case 'RESULT_TICK':
      if (state.phase !== 'revelacao') return state
      return { ...state, resultRemaining: event.remaining }
    case 'LOCAL_READY':
      if (state.phase !== 'revelacao') return state
      return { ...state, localReady: true }
    case 'PRESENCE_READY':
      if (state.phase !== 'revelacao' || Number(event.turn) !== Number(state.result?.turn)) return state
      return { ...state, localReady: event.localReady, opponentReady: event.opponentReady }
    case 'REQUEST_ADVANCE':
      if (state.phase !== 'revelacao') return state
      if (state.resultRemaining > 0 && !(state.localReady && state.opponentReady)) return state
      return { ...state, advanceRequested: true }
    case 'FINAL_RESULT_READY':
      if (state.phase !== 'revelacao' || Number(event.turn) !== Number(state.result?.turn)) return state
      return { ...state, advanceRequested: true }
    case 'ADVANCE_APPLIED':
      if (state.phase !== 'revelacao' || !state.advanceRequested) return state
      return { ...initialState, phase: event.finished ? 'fim' : 'jogando' }
    case 'FINISH_MATCH':
      return { ...state, phase: 'fim' }
    default:
      return state
  }
}

export default function useMultiplayerTurnMachine({ salaId, log }) {
  const [state, rawDispatch] = useReducer(reduce, initialState)
  const stateRef = useRef(state)

  useEffect(() => { stateRef.current = state }, [state])

  const dispatch = useCallback((event) => {
    const previous = stateRef.current
    const next = reduce(previous, event)
    log('MAQUINA_TRANSICAO', {
      salaId,
      evento: event.type,
      faseAnterior: previous.phase,
      faseSeguinte: next.phase,
      turnoResultado: next.result?.turn || previous.result?.turn || null,
      aceita: next !== previous,
      restante: next.resultRemaining
    })
    if (next !== previous) {
      stateRef.current = next
      rawDispatch(event)
    }
    return next !== previous
  }, [log, salaId])

  useEffect(() => {
    if (state.phase !== 'revelacao' || !state.resultStartedAt) return
    const tick = () => {
      const elapsed = Date.now() - state.resultStartedAt
      const remaining = Math.max(0, Math.ceil((RESULT_DURATION_MS - elapsed) / 1000))
      dispatch({ type: 'RESULT_TICK', remaining })
      log('MAQUINA_RESULTADO_TICK', {
        salaId,
        turno: state.result?.turn,
        restante: remaining,
        decorridoMs: elapsed
      })
      if (remaining === 0) dispatch({ type: 'REQUEST_ADVANCE', reason: 'tempo-esgotado' })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [dispatch, log, salaId, state.phase, state.result?.turn, state.resultStartedAt])

  return { state, stateRef, dispatch }
}
```

### 5.11 Conexão do multiplayer

`src/hooks/useTopTrumpsMP.js`

```js
import { supabase } from '../lib/supabase'

const LIMITES = { free: 1, elite: 10 }
let realtimeChannelSequence = 0

function codigoSala() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'LDI-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function criarSala(userId, modo, tipoSala, turnosDesejados) {
  const codigo = codigoSala()
  const { data, error } = await supabase.from('toptrumps_salas').insert({
    codigo, modo, tipo_sala: tipoSala,
    jogador1_id: userId, turnos_j1: turnosDesejados,
    status: 'aguardando'
  }).select('id, codigo').single()
  if (error) { console.error('[TTMP] erro criar sala:', error); return null }
  return { salaId: data.id, codigo: data.codigo }
}

export async function entrarSalaPorCodigo(userId, codigo, turnosDesejados) {
  const { data: sala } = await supabase.from('toptrumps_salas').select('*').eq('codigo', codigo).eq('status', 'aguardando').single()
  if (!sala) return { erro: 'Sala não encontrada ou já iniciada.' }
  if (sala.jogador1_id === userId) return { erro: 'Você já está nesta sala.' }
  const total = Math.min(sala.turnos_j1, turnosDesejados)
  const { error } = await supabase.from('toptrumps_salas').update({
    jogador2_id: userId, turnos_j2: turnosDesejados, total_turnos: total,
    status: 'em_jogo', turno_atual: 1, jogador_da_vez: sala.jogador1_id
  }).eq('id', sala.id)
  if (error) { console.error('[TTMP] erro entrar sala:', error); return { erro: 'Erro ao entrar na sala.' } }
  return { salaId: sala.id }
}

export async function entrarFilaPublica(userId, modo, turnosDesejados) {
  const { data, error } = await supabase.rpc('entrar_fila_publica', {
    p_user_id: userId,
    p_modo: modo,
    p_turnos: turnosDesejados
  })
  if (error) { console.error('[MP] erro RPC entrar_fila_publica:', error); return null }
  return data
}

export async function buscarSalaPublicaAtivaDoJogador(userId, modo, salaPreferidaId) {
  const limiteRecente = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const filtroJogador = `jogador1_id.eq.${userId},jogador2_id.eq.${userId}`
  let salaPreferida = null
  if (salaPreferidaId) {
    const { data, error } = await supabase
      .from('toptrumps_salas')
      .select('*')
      .eq('id', salaPreferidaId)
      .or(filtroJogador)
      .maybeSingle()
    if (error) console.error('[MP] erro ao validar sala pública preferida:', error)
    salaPreferida = data
    if (
      salaPreferida?.tipo_sala === 'publica' &&
      salaPreferida?.modo === modo &&
      salaPreferida?.status === 'em_jogo' &&
      salaPreferida?.jogador1_id &&
      salaPreferida?.jogador2_id
    ) {
      return salaPreferida
    }
  }

  const { data: emJogo, error: erroEmJogo } = await supabase
    .from('toptrumps_salas')
    .select('*')
    .eq('tipo_sala', 'publica')
    .eq('modo', modo)
    .eq('status', 'em_jogo')
    .gte('criada_em', limiteRecente)
    .gte('criada_em', salaPreferida?.criada_em || limiteRecente)
    .or(filtroJogador)
    .order('criada_em', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (erroEmJogo) {
    console.error('[MP] erro ao reconciliar sala pública em jogo:', erroEmJogo)
    return null
  }
  if (emJogo?.jogador1_id && emJogo?.jogador2_id) return emJogo
  if (salaPreferida?.status === 'aguardando') return salaPreferida

  const { data: aguardando, error: erroAguardando } = await supabase
    .from('toptrumps_salas')
    .select('*')
    .eq('tipo_sala', 'publica')
    .eq('modo', modo)
    .eq('status', 'aguardando')
    .eq('jogador1_id', userId)
    .gte('criada_em', limiteRecente)
    .order('criada_em', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (erroAguardando) console.error('[MP] erro ao reconciliar sala pública aguardando:', erroAguardando)
  return erroAguardando ? null : aguardando
}

export async function sairFilaPublica(salaId, userId) {
  if (!salaId || !userId) return
  const { error } = await supabase
    .from('toptrumps_salas')
    .delete()
    .eq('id', salaId)
    .eq('status', 'aguardando')
    .eq('jogador1_id', userId)
  if (error) console.error('[MP] erro ao sair da fila pública:', error)
}

export async function buscarSala(salaId) {
  const { data, error } = await supabase
    .from('toptrumps_salas')
    .select('*')
    .eq('id', salaId)
    .maybeSingle()
  if (error) console.error('[MP] erro ao buscar sala:', error)
  return error ? null : data
}

export async function definirAposta(salaId, userId, cartaId, ehJ1) {
  const campo = ehJ1 ? 'carta_aposta_j1' : 'carta_aposta_j2'
  await supabase.from('toptrumps_salas').update({ [campo]: cartaId }).eq('id', salaId)
}

export async function confirmarAposta(salaId, ehJ1) {
  const campo = ehJ1 ? 'aposta_confirmada_j1' : 'aposta_confirmada_j2'
  const { data: sala } = await supabase.from('toptrumps_salas').select('*').eq('id', salaId).single()
  await supabase.from('toptrumps_salas').update({ [campo]: true }).eq('id', salaId)
  const ambosConfirmaram = ehJ1 ? (sala.aposta_confirmada_j2 || false) : (sala.aposta_confirmada_j1 || false)
  if (ambosConfirmaram) {
    const total = Math.min(sala.turnos_j1 || 5, sala.turnos_j2 || 5)
    await supabase.from('toptrumps_salas').update({
      status: 'em_jogo', total_turnos: total, turno_atual: 1, jogador_da_vez: sala.jogador1_id
    }).eq('id', salaId)
  }
}

export async function escolherPPT(salaId, userId, escolha, ehJ1) {
  const campoEscolha = ehJ1 ? 'carta_aposta_j1' : 'carta_aposta_j2'
  const campoConfirmar = ehJ1 ? 'aposta_confirmada_j1' : 'aposta_confirmada_j2'
  const { error } = await supabase.from('toptrumps_salas').update({
    [campoEscolha]: escolha,
    [campoConfirmar]: true
  }).eq('id', salaId)
  if (error) console.error('[MP] escolherPPT erro:', error)
}

export async function finalizarPPT(salaId, vencedorId) {
  const { error } = await supabase.from('toptrumps_salas').update({
    jogador_da_vez: vencedorId,
    turno_atual: 1,
    carta_aposta_j1: -1,
    carta_aposta_j2: null,
    aposta_confirmada_j1: false,
    aposta_confirmada_j2: false
  }).eq('id', salaId)
  if (error) console.error('[MP] finalizarPPT erro:', error)
}

export async function registrarMovimento(salaId, userId, cartaId, atributo, foiIA = false, cartaIdOponente = null) {
  const { data: sala, error: errSala } = await supabase.from('toptrumps_salas').select('turno_atual').eq('id', salaId).single()
  if (errSala || !sala) {
    console.error('[MP] registrarMovimento erro ao buscar sala:', errSala)
    return { data: null, error: errSala || new Error('Sala não encontrada') }
  }
  const { data, error } = await supabase.from('toptrumps_movimentos').insert({
    sala_id: salaId, turno: sala.turno_atual, jogador_id: userId, carta_id: cartaId, atributo, foi_ia: foiIA, carta_id_oponente: cartaIdOponente
  }).select('id, sala_id, turno, jogador_id, carta_id, atributo').single()
  if (error) console.error('[MP] registrarMovimento erro no insert:', error)
  return { data, error }
}

export async function atualizarSala(salaId, updates) {
  await supabase.from('toptrumps_salas').update({ ...updates, atualizada_em: new Date().toISOString() }).eq('id', salaId)
}

export async function encerrarSala(salaId, vencedorId, perdedorId, modo, cartaApostaVencedor, cartaApostaPerdedor) {
  if (modo === 'apostado' && cartaApostaPerdedor) {
    await supabase.from('toptrumps_decks').delete().eq('user_id', perdedorId).eq('carta_id', cartaApostaPerdedor)
    if (cartaApostaPerdedor) {
      await supabase.from('toptrumps_decks').insert({ user_id: vencedorId, carta_id: cartaApostaPerdedor })
    }
  }
  const resultado = vencedorId ? (vencedorId === perdedorId ? 'empate' : `${vencedorId === (await supabase.from('toptrumps_salas').select('jogador1_id').eq('id', salaId).single()).data?.jogador1_id ? 'j1_venceu' : 'j2_venceu'}`) : 'empate'
  await supabase.from('toptrumps_salas').update({ status: 'encerrada', resultado }).eq('id', salaId)
}

export async function verificarLimiteDiario(userId, tier) {
  const { data } = await supabase.from('toptrumps_mp_stats').select('partidas_hoje, partidas_hoje_data').eq('user_id', userId).maybeSingle()
  const hoje = new Date().toISOString().split('T')[0]
  const usadas = (data?.partidas_hoje_data === hoje) ? (data.partidas_hoje || 0) : 0
  const limite = LIMITES[tier] ?? 1
  return { pode: usadas < limite, usadas, limite }
}

export async function incrementarPartidaDiaria(userId) {
  const hoje = new Date().toISOString().split('T')[0]
  const { data } = await supabase.from('toptrumps_mp_stats').select('partidas_hoje, partidas_hoje_data').eq('user_id', userId).maybeSingle()
  const usadas = (data?.partidas_hoje_data === hoje) ? (data.partidas_hoje || 0) + 1 : 1
  await supabase.from('toptrumps_mp_stats').upsert({
    user_id: userId, partidas_hoje: usadas, partidas_hoje_data: hoje
  }, { onConflict: 'user_id' })
}

export async function carregarMPStats(userId) {
  const { data } = await supabase.from('toptrumps_mp_stats').select('*').eq('user_id', userId).maybeSingle()
  return data || { total_partidas: 0, total_vitorias: 0, total_derrotas: 0, total_empates: 0, streak_atual: 0, partidas_hoje: 0 }
}

export async function atualizarMPStats(userId, resultado) {
  const stats = await carregarMPStats(userId)
  const novoStreak = resultado === 'vitoria' ? (stats.streak_atual || 0) + 1 : 0
  await supabase.from('toptrumps_mp_stats').upsert({
    user_id: userId,
    total_partidas: (stats.total_partidas || 0) + 1,
    total_vitorias: (stats.total_vitorias || 0) + (resultado === 'vitoria' ? 1 : 0),
    total_derrotas: (stats.total_derrotas || 0) + (resultado === 'derrota' ? 1 : 0),
    total_empates: (stats.total_empates || 0) + (resultado === 'empate' ? 1 : 0),
    streak_atual: novoStreak,
    melhor_streak: Math.max(stats.melhor_streak || 0, novoStreak)
  }, { onConflict: 'user_id' })
}

export function subscribeToSala(salaId, callback, onSubscribed) {
  const channelName = `sala-${salaId}-${++realtimeChannelSequence}`
  return supabase.channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'toptrumps_salas', filter: `id=eq.${salaId}` }, (payload) => {
      callback(payload)
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onSubscribed?.()
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn(`[MP] canal da sala indisponível (${channelName}):`, status)
      }
    })
}

export function subscribeToMatchPresence(salaId, userId, onOpponentLeave, onPresenceSync) {
  const channel = supabase.channel(`presenca-partida-${salaId}`, {
    config: { presence: { key: userId } }
  })
  channel.on('presence', { event: 'leave' }, ({ key }) => {
    if (key && key !== userId) onOpponentLeave?.(key)
  })
  channel.on('presence', { event: 'sync' }, () => {
    onPresenceSync?.(channel.presenceState())
  })
  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: userId, ready_turn: null, online_at: new Date().toISOString() })
    }
  })
  return channel
}

export function subscribeToMovimentos(salaId, callback) {
  return supabase.channel(`mov-${salaId}-${++realtimeChannelSequence}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'toptrumps_movimentos', filter: `sala_id=eq.${salaId}` }, (payload) => {
      callback(payload)
    })
    .subscribe()
}
```

### Migration 014_toptrumps_decks_builder

`supabase/migrations/014_toptrumps_decks_builder.sql`

```sql
-- Migration 014: Add deck builder columns to toptrumps_decks
-- Each user can have named decks for each size: 5, 10, 15, 20

-- Alter existing toptrumps_decks: add deck_type and deck_name columns
ALTER TABLE toptrumps_decks ADD COLUMN IF NOT EXISTS deck_type TEXT DEFAULT 'geral' CHECK (deck_type IN ('geral', 'deck_5', 'deck_10', 'deck_15', 'deck_20'));
ALTER TABLE toptrumps_decks ADD COLUMN IF NOT EXISTS deck_name TEXT DEFAULT '';

-- Drop old unique constraint if exists, create new one scoped to deck_type
ALTER TABLE toptrumps_decks DROP CONSTRAINT IF EXISTS toptrumps_decks_user_id_carta_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_toptrumps_decks_user_carta_tipo ON toptrumps_decks(user_id, carta_id, deck_type);

-- Deck names table (one row per user per deck type)
CREATE TABLE IF NOT EXISTS toptrumps_deck_nomes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_type TEXT NOT NULL CHECK (deck_type IN ('deck_5', 'deck_10', 'deck_15', 'deck_20')),
  nome TEXT NOT NULL DEFAULT '',
  UNIQUE(user_id, deck_type)
);

ALTER TABLE toptrumps_deck_nomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own deck nomes" ON toptrumps_deck_nomes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deck nomes" ON toptrumps_deck_nomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deck nomes" ON toptrumps_deck_nomes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own deck nomes" ON toptrumps_deck_nomes
  FOR DELETE USING (auth.uid() = user_id);
```

### Migration 016_toptrumps_ranking

`supabase/migrations/016_toptrumps_ranking.sql`

```sql
-- Migration 016: Top Trumps Ranking System
-- Tabela de ranking mensal ranqueado do Top Trumps
-- Period: 'YYYY-MM' (mês corrente)
-- Máximo de MAX_RANKED_PLAYS_DIA = 5 partidas ranqueadas por dia

CREATE TABLE IF NOT EXISTS toptrumps_ranking (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0,
  ranked_wins INTEGER NOT NULL DEFAULT 0,
  ranked_plays_today INTEGER NOT NULL DEFAULT 0,
  ranked_plays_date TEXT DEFAULT '',
  country_code TEXT DEFAULT 'BR',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period)
);

-- Índice para consultas de ranking ordenadas por score
CREATE INDEX IF NOT EXISTS idx_toptrumps_ranking_score ON toptrumps_ranking(period, score DESC);

-- Índice para filtro por país
CREATE INDEX IF NOT EXISTS idx_toptrumps_ranking_country ON toptrumps_ranking(period, country_code, score DESC);

ALTER TABLE toptrumps_ranking ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can read ranking" ON toptrumps_ranking
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own ranking" ON toptrumps_ranking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ranking" ON toptrumps_ranking
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_toptrumps_ranking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_toptrumps_ranking_updated_at
  BEFORE UPDATE ON toptrumps_ranking
  FOR EACH ROW
  EXECUTE FUNCTION update_toptrumps_ranking_updated_at();
```

### Migration 018_profiles_country

`supabase/migrations/018_profiles_country.sql`

```sql
-- 018_profiles_country.sql
-- Adiciona campo country_code à tabela profiles
-- Usado no cadastro obrigatório e editável no perfil
-- Os rankings (toptrumps_ranking, arena_ranking, tamagoshi_ranking) leem este campo

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_code CHAR(2);
```

### Migration 020_toptrumps_decks_unique_constraint

`supabase/migrations/020_toptrumps_decks_unique_constraint.sql`

```sql
-- Migration 020: Add UNIQUE constraint to toptrumps_decks for ON CONFLICT support
-- Remove duplicatas existentes antes de criar a constraint
DELETE FROM toptrumps_decks a
USING toptrumps_decks b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.carta_id = b.carta_id;

-- Drop old unique index (não suporta ON CONFLICT)
DROP INDEX IF EXISTS idx_toptrumps_decks_user_carta_tipo;

-- Add proper UNIQUE constraint (suporta ON CONFLICT no upsert)
ALTER TABLE toptrumps_decks ADD CONSTRAINT toptrumps_decks_user_id_carta_id_key UNIQUE (user_id, carta_id);
```

### Migration 021_toptrumps_stats_carta_ganha

`supabase/migrations/021_toptrumps_stats_carta_ganha.sql`

```sql
-- Migration 021: Add carta_ganha_hoje column to toptrumps_stats
-- This column tracks whether the user has already won a card today
-- Without it, upserts fail silently and tentativas never persist

ALTER TABLE toptrumps_stats ADD COLUMN IF NOT EXISTS carta_ganha_hoje BOOLEAN DEFAULT false;

-- Ensure user_id has a unique constraint for upsert with onConflict
-- (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'toptrumps_stats_user_id_key' 
    AND conrelid = 'toptrumps_stats'::regclass
  ) THEN
    -- Check if there's already a primary key on user_id
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'toptrumps_stats'
      AND c.contype = 'p'
      AND c.conkey = (SELECT array_agg(attnum) FROM pg_attribute WHERE attrelid = 'toptrumps_stats'::regclass AND attname = 'user_id')
    ) THEN
      ALTER TABLE toptrumps_stats ADD CONSTRAINT toptrumps_stats_user_id_key UNIQUE (user_id);
    END IF;
  END IF;
END;
$$;
```

### Textos da interface (pt), chave `toptrumps`

```json
{
  "titulo": "LDI TRUMPS",
  "jogar": "JOGAR",
  "multiplayer": "MULTIPLAYER",
  "deck": "MEU DECK",
  "colecao": "COLEÇÃO",
  "desistir": "DESISTIR",
  "selecionar_carta": "SELECIONE UMA CARTA",
  "vitoria": "VITÓRIA!",
  "derrota": "DERROTA!",
  "rodada": "RODADA {n}",
  "sua_carta": "SUA CARTA",
  "carta_adversario": "CARTA DO ADVERSÁRIO",
  "pts": "pts",
  "btn_jogar_novamente": "JOGAR NOVAMENTE",
  "btn_voltar": "VOLTAR",
  "adversario_escolhendo": "Adversário escolhendo...",
  "adversario": "Adversário",
  "swipe_ver_adversario": "Ver carta do adversário",
  "swipe_voltar": "Voltar para sua carta",
  "voce_venceu": "Você venceu!",
  "ia_venceu": "IA venceu!",
  "empate": "Empate!",
  "proxima_rodada": "Próxima rodada",
  "menu_titulo": "LDI TOP TRUMPS",
  "menu_subtitulo": "",
  "menu_desc": "Jogo de cartas colecionáveis do universo LDI",
  "menu_cartas_coletadas": "{n} / {total} CARTAS COLETADAS",
  "menu_single_player": "SINGLE PLAYER",
  "menu_single_desc": "Jogue contra a IA",
  "menu_multiplayer": "MULTIPLAYER",
  "menu_multi_desc": "Jogue contra outros jogadores em tempo real",
  "menu_num_turnos": "NÚMERO DE TURNOS",
  "menu_tentativas": "{restantes}/{max} tentativas para ganhar carta hoje",
  "menu_ja_ganhou": "✅ VOCÊ JÁ GANHOU SUA CARTA HOJE! Volte amanhã para novas tentativas.",
  "menu_ja_ganhou_todas": "✅ VOCÊ JÁ COLETOU TODAS AS 30 CARTAS! Parabéns!",
  "menu_album": "Ver meu álbum de cartas →",
  "menu_voltar_games": "VOLTAR AOS GAMES",
  "menu_voltar_menu": "VOLTAR AO MENU",
  "deckBuilderBtn": "MONTAR DECK",
  "hud_rodada": "RODADA {n}/{total}",
  "hud_voce": "VOCÊ: {n}",
  "hud_ia": "IA: {n}",
  "hud_vs": "VS",
  "result_voce_venceu": "VOCÊ VENCEU!",
  "result_ia_venceu": "IA VENCEU!",
  "result_empate": "EMPATE!",
  "result_proxima": "PRÓXIMA RODADA",
  "result_final": "VER RESULTADO FINAL",
  "recompensa_titulo": "VITÓRIA! ESCOLHA SUA RECOMPENSA",
  "recompensa_sub": "Você ganhou uma carta nova. Selecione abaixo:",
  "recompensa_carta_misteriosa": "CARTA MISTERIOSA",
  "recompensa_confirmar": "CONFIRMAR RECOMPENSA",
  "relatorio_titulo": "RELATÓRIO DA ARENA",
  "relatorio_sub": "Top Trumps",
  "relatorio_voce": "VOCÊ",
  "relatorio_ia_label": "IA",
  "relatorio_rodadas": "Rodadas",
  "relatorio_vitorias": "Vitórias",
  "relatorio_derrotas": "Derrotas",
  "relatorio_empates": "Empates",
  "relatorio_attr_usado": "Attr. + usado",
  "relatorio_melhor_vitoria": "Melhor vitória",
  "relatorio_confrontos": "CONFRONTOS",
  "relatorio_ja_ganhou": "Você já ganhou sua carta hoje. Volte amanhã para ganhar mais!",
  "desistir_modal_titulo": "DESISTIR DA PARTIDA?",
  "desistir_modal_desc": "Se você desistir, esta partida contará como derrota. Tem certeza?",
  "desistir_modal_confirmar": "SIM, DESISTIR",
  "confirmar_atributo": "CONFIRMAR ATRIBUTO",
  "seu_valor": "SEU VALOR",
  "valor_maximo": "VALOR MÁXIMO",
  "confirmar": "CONFIRMAR",
  "cancelar": "CANCELAR",
  "voce": "VOCÊ",
  "ia": "IA",
  "atributo_rank_sdr": "Rank SDR",
  "atributo_poder_mental": "Poder Mental",
  "atributo_velocidade": "Velocidade",
  "atributo_resistencia": "Resistência",
  "atributo_nivel_xama": "Nível Xamã",
  "atributo_fator_caos": "Fator Caos",
  "atributo_energia_base": "Energia Base",
  "atributo_poder_explosivo": "Poder Explosivo",
  "som_ativar": "Ativar som",
  "som_desativar": "Desativar som",
  "do_maximo": "{pct}% do máximo",
  "ppt_pedra": "Pedra",
  "ppt_papel": "Papel",
  "ppt_tesoura": "Tesoura",
  "ppt_rock": "Pedra",
  "ppt_paper": "Papel",
  "ppt_scissors": "Tesoura",
  "ppt_titulo": "PEDRA · PAPEL · TESOURA",
  "ppt_subtitulo": "Quem vencer começa escolhendo o atributo",
  "ppt_aguardando": "Aguardando oponente...",
  "ppt_voce": "VOCÊ",
  "ppt_ia": "IA",
  "ppt_voce_vence": "Você venceu!",
  "ppt_ia_vence": "IA venceu!",
  "ppt_empate": "EMPATE! DE NOVO!",
  "tier_free": "FREE",
  "tier_elite": "ANCESTRAL",
  "tier_lendario": "LENDÁRIO",
  "tier_sombra": "SOMBRA",
  "sem_oponente": "Nenhum adversário encontrado. Tente novamente.",
  "multiplayer_locked_titulo": "Multiplayer exige conta",
  "multiplayer_locked_desc": "Para jogar contra outros jogadores em tempo real, você precisa de uma conta com assinatura Ancestral. Crie sua conta grátis para começar.",
  "multiplayer_locked_criar_conta": "Criar conta grátis",
  "guest_aviso_previo": "Você está jogando sem conta — vai usar um deck temporário de 5 cartas aleatórias. O resultado não é salvo e as cartas não ficam com você. Para salvar seu deck e ganhar cartas de recompensa por vitória, crie uma conta grátis.",
  "guest_aviso_criar_conta": "Criar conta grátis",
  "guest_cta_criar_conta": "Jogadores com conta ganham cartas de recompensa a cada vitória. Crie a sua grátis e comece a colecionar.",
  "guest_cta_link": "Criar conta",
  "cardViewer": {
    "copies": "x cópias",
    "stats": "Estatísticas",
    "locked": "Carta bloqueada"
  },
  "deckBuilder": {
    "title": "Montar Deck",
    "minCards": "Você precisa de pelo menos 6 cartas diferentes",
    "save": "Salvar Deck",
    "clear": "Limpar",
    "add": "Adicionar ao Deck",
    "remove": "Remover do Deck",
    "back": "Voltar",
    "yourCards": "Suas Cartas",
    "deckNamePlaceholder": "Nome do deck..."
  },
  "deckStart": {
    "title": "Como quer jogar?",
    "useDeck": "Usar meu deck",
    "random": "Cartas aleatórias",
    "cancel": "Cancelar",
    "semDeck": "Nenhum deck salvo para este tamanho",
    "cartasAleatorias": "{n} cartas aleatórias da sua coleção",
    "semDeckGuest": "Disponível apenas para contas com deck salvo."
  },
  "lobby": {
    "titulo": "LOBBY",
    "modo_livre": "LIVRE",
    "modo_apostado": "APOSTADO",
    "criar_sala": "CRIAR SALA",
    "entrar_sala": "ENTRAR NA SALA",
    "codigo_sala": "CÓDIGO DA SALA",
    "fila_publica": "FILA PÚBLICA",
    "conectando": "CONECTANDO...",
    "jogador": "JOGADOR",
    "iniciar": "INICIAR",
    "modo_free": "LIVRE",
    "modo_free_desc": "Jogue sem apostar cartas",
    "modo_apostado_desc": "Aposte uma carta contra o oponente",
    "modo_elite_badge": "ANCESTRAL",
    "modo_apostado_restricao": "Disponível apenas para assinantes ANCESTRAL",
    "turnos_info": "Escolha o número de turnos para a partida",
    "fila_titulo": "PROCURANDO OPONENTE",
    "frases_fila": [
      "Varrendo o SDR em busca de oponentes...",
      "Sincronizando com o Nexus...",
      "Calculando matching ideal...",
      "Aguardando resposta do servidor...",
      "Quase lá..."
    ],
    "fila_sair": "SAIR DA FILA",
    "limite_aviso": "Você já usou {usadas}/{limite} partidas hoje",
    "matchmaking_info": "Escolha como entrar:",
    "criando": "CRIANDO...",
    "btn_criar_sala": "CRIAR SALA PRIVADA",
    "input_placeholder": "Código da sala",
    "btn_entrar": "ENTRAR",
    "procurando": "PROCURANDO...",
    "btn_fila_publica": "FILA PÚBLICA",
    "erro_criar": "Erro ao criar sala",
    "presenca_disponivel": "🟢 {{n}} jogador(es) disponível(eis) agora para multiplayer",
    "presenca_vazio": "🔴 Nenhum jogador disponível no momento. Tente novamente em breve."
  },
  "mp": {
    "conectando": "CONECTANDO...",
    "conexao_perdida": "CONEXÃO PERDIDA",
    "oponente_desconectado": "OPONENTE DESCONECTADO",
    "sua_vez": "SUA VEZ",
    "vez_oponente": "VEZ DO OPONENTE",
    "selecionando": "SELECIONANDO...",
    "ppt": "PEDRA · PAPEL · TESOURA",
    "carregando": "CARREGANDO PARTIDA...",
    "ppt_titulo": "PEDRA · PAPEL · TESOURA",
    "ppt_subtitulo": "Quem vencer começa escolhendo o atributo",
    "ppt_aguardando": "Aguardando oponente...",
    "ppt_voce": "VOCÊ",
    "ppt_venceu": "VOCÊ VENCEU O SORTEIO!",
    "ppt_perdeu": "OPONENTE VENCEU O SORTEIO!",
    "ppt_empate": "EMPATE! DE NOVO!",
    "preparando_cartas": "Preparando cartas...",
    "hud_adversario_escolhendo": "Adversário escolhendo...",
    "hud_voce": "VOCÊ",
    "hud_rodada": "RODADA {n}/{total}",
    "hud_vs": "VS",
    "revelacao_sua_vez": "SUA VEZ",
    "revelacao_vez_oponente": "VEZ DE {nome}",
    "revelacao_titulo": "RESULTADO",
    "revelacao_voce_venceu": "VOCÊ VENCEU!",
    "revelacao_oponente_venceu": "OPONENTE VENCEU!",
    "revelacao_empate": "EMPATE!",
    "revelacao_voce_venceu_exclamacao": "💥 VOCÊ VENCEU!",
    "revelacao_oponente_venceu_exclamacao": "💥 OPONENTE VENCEU!",
    "revelacao_empate_exclamacao": "⚡ EMPATE!",
    "revelacao_proxima": "PRÓXIMA RODADA",
    "revelacao_aguardando": "AGUARDANDO O OUTRO JOGADOR...",
    "revelacao_contador": "RESULTADO BLOQUEADO: {n}s",
    "fim_voce_venceu": "VOCÊ VENCEU!",
    "fim_empate": "EMPATE!",
    "fim_voce_perdeu": "VOCÊ PERDEU!",
    "fim_voltar_games": "VOLTAR AO MENU",
    "fim_retorno_automatico": "Retorno automático ao menu em {n}s",
    "ppt_tempo": "ESCOLHA EM {n}s",
    "atributo_escolhido": "Atributo: {nome}"
  }
}
```

### Textos da interface (en), chave `toptrumps`

```json
{
  "titulo": "LDI TRUMPS",
  "jogar": "PLAY",
  "multiplayer": "MULTIPLAYER",
  "deck": "MY DECK",
  "colecao": "COLLECTION",
  "desistir": "GIVE UP",
  "selecionar_carta": "SELECT A CARD",
  "vitoria": "VICTORY!",
  "derrota": "DEFEAT!",
  "rodada": "ROUND {n}",
  "sua_carta": "YOUR CARD",
  "carta_adversario": "OPPONENT'S CARD",
  "pts": "pts",
  "btn_jogar_novamente": "PLAY AGAIN",
  "btn_voltar": "BACK",
  "adversario_escolhendo": "Opponent choosing...",
  "adversario": "Opponent",
  "swipe_ver_adversario": "See opponent's card",
  "swipe_voltar": "Back to your card",
  "voce_venceu": "You win!",
  "ia_venceu": "AI wins!",
  "empate": "Draw!",
  "proxima_rodada": "Next round",
  "menu_titulo": "LDI TOP TRUMPS",
  "menu_subtitulo": "",
  "menu_desc": "Collectible card game from the LDI universe",
  "menu_cartas_coletadas": "{n} / {total} CARDS COLLECTED",
  "menu_single_player": "SINGLE PLAYER",
  "menu_single_desc": "Play against the AI",
  "menu_multiplayer": "MULTIPLAYER",
  "menu_multi_desc": "Play against other players in real time",
  "menu_num_turnos": "NUMBER OF TURNS",
  "menu_tentativas": "{restantes}/{max} attempts to win a card today",
  "menu_ja_ganhou": "✅ YOU ALREADY WON YOUR CARD TODAY! Come back tomorrow for new attempts.",
  "menu_ja_ganhou_todas": "✅ YOU HAVE COLLECTED ALL 30 CARDS! Congratulations!",
  "menu_album": "View my card album →",
  "menu_voltar_games": "BACK TO GAMES",
  "menu_voltar_menu": "BACK TO MENU",
  "deckBuilderBtn": "BUILD DECK",
  "hud_rodada": "ROUND {n}/{total}",
  "hud_voce": "YOU: {n}",
  "hud_ia": "AI: {n}",
  "hud_vs": "VS",
  "result_voce_venceu": "YOU WIN!",
  "result_ia_venceu": "AI WINS!",
  "result_empate": "DRAW!",
  "result_proxima": "NEXT ROUND",
  "result_final": "VIEW FINAL RESULT",
  "recompensa_titulo": "VICTORY! CHOOSE YOUR REWARD",
  "recompensa_sub": "You won a new card. Select below:",
  "recompensa_carta_misteriosa": "MYSTERY CARD",
  "recompensa_confirmar": "CONFIRM REWARD",
  "relatorio_titulo": "ARENA REPORT",
  "relatorio_sub": "Top Trumps",
  "relatorio_voce": "YOU",
  "relatorio_ia_label": "AI",
  "relatorio_rodadas": "Rounds",
  "relatorio_vitorias": "Wins",
  "relatorio_derrotas": "Losses",
  "relatorio_empates": "Draws",
  "relatorio_attr_usado": "Attr. most used",
  "relatorio_melhor_vitoria": "Best victory",
  "relatorio_confrontos": "MATCHUPS",
  "relatorio_ja_ganhou": "You already won your card today. Come back tomorrow to win more!",
  "desistir_modal_titulo": "SURRENDER MATCH?",
  "desistir_modal_desc": "If you surrender, this match will count as a loss. Are you sure?",
  "desistir_modal_confirmar": "YES, SURRENDER",
  "confirmar_atributo": "CONFIRM ATTRIBUTE",
  "seu_valor": "YOUR VALUE",
  "valor_maximo": "MAX VALUE",
  "confirmar": "CONFIRM",
  "cancelar": "CANCEL",
  "voce": "YOU",
  "ia": "AI",
  "atributo_rank_sdr": "SDR Rank",
  "atributo_poder_mental": "Mental Power",
  "atributo_velocidade": "Speed",
  "atributo_resistencia": "Resistance",
  "atributo_nivel_xama": "Shaman Level",
  "atributo_fator_caos": "Chaos Factor",
  "atributo_energia_base": "Base Energy",
  "atributo_poder_explosivo": "Explosive Power",
  "som_ativar": "Enable sound",
  "som_desativar": "Disable sound",
  "do_maximo": "{pct}% of max",
  "ppt_pedra": "Rock",
  "ppt_papel": "Paper",
  "ppt_tesoura": "Scissors",
  "ppt_rock": "Rock",
  "ppt_paper": "Paper",
  "ppt_scissors": "Scissors",
  "ppt_titulo": "ROCK · PAPER · SCISSORS",
  "ppt_subtitulo": "Winner chooses the first attribute",
  "ppt_aguardando": "Waiting for opponent...",
  "ppt_voce": "YOU",
  "ppt_ia": "AI",
  "ppt_voce_vence": "You win!",
  "ppt_ia_vence": "AI wins!",
  "ppt_empate": "DRAW! AGAIN!",
  "tier_free": "FREE",
  "tier_elite": "ANCESTRAL",
  "tier_lendario": "LEGENDARY",
  "tier_sombra": "SHADOW",
  "sem_oponente": "No opponent found. Please try again.",
  "multiplayer_locked_titulo": "Multiplayer requires an account",
  "multiplayer_locked_desc": "To play against other players in real time, you need an account with an Ancestral subscription. Create your free account to get started.",
  "multiplayer_locked_criar_conta": "Create free account",
  "guest_aviso_previo": "You're playing without an account — you'll use a temporary deck of 5 random cards. Results aren't saved and cards won't be kept. To save your deck and earn reward cards for wins, create a free account.",
  "guest_aviso_criar_conta": "Create free account",
  "guest_cta_criar_conta": "Players with an account earn reward cards for every win. Create yours for free and start collecting.",
  "guest_cta_link": "Create account",
  "cardViewer": {
    "copies": "copies",
    "stats": "Stats",
    "locked": "Card locked"
  },
  "deckBuilder": {
    "title": "Build Deck",
    "minCards": "You need at least 6 different cards",
    "save": "Save Deck",
    "clear": "Clear",
    "add": "Add to Deck",
    "remove": "Remove from Deck",
    "back": "Back",
    "yourCards": "Your Cards",
    "deckNamePlaceholder": "Deck name..."
  },
  "deckStart": {
    "title": "How to play?",
    "useDeck": "Use my deck",
    "random": "Random cards",
    "cancel": "Cancel",
    "semDeck": "No deck saved for this size",
    "cartasAleatorias": "{n} random cards from your collection",
    "semDeckGuest": "Only available for accounts with a saved deck."
  },
  "lobby": {
    "titulo": "LOBBY",
    "modo_livre": "FREE",
    "modo_apostado": "BET",
    "criar_sala": "CREATE ROOM",
    "entrar_sala": "JOIN ROOM",
    "codigo_sala": "ROOM CODE",
    "fila_publica": "PUBLIC QUEUE",
    "conectando": "CONNECTING...",
    "jogador": "PLAYER",
    "iniciar": "START",
    "modo_free": "FREE",
    "modo_free_desc": "Play without betting cards",
    "modo_apostado_desc": "Bet a card against your opponent",
    "modo_elite_badge": "ANCESTRAL",
    "modo_apostado_restricao": "Available only for ANCESTRAL subscribers",
    "turnos_info": "Choose the number of turns for the match",
    "fila_titulo": "LOOKING FOR OPPONENT",
    "frases_fila": [
      "Scanning SDR for opponents...",
      "Syncing with Nexus...",
      "Calculating ideal match...",
      "Waiting for server response...",
      "Almost there..."
    ],
    "fila_sair": "LEAVE QUEUE",
    "limite_aviso": "You've used {usadas}/{limite} matches today",
    "matchmaking_info": "Choose how to join:",
    "criando": "CREATING...",
    "btn_criar_sala": "CREATE PRIVATE ROOM",
    "input_placeholder": "Room code",
    "btn_entrar": "JOIN",
    "procurando": "SEARCHING...",
    "btn_fila_publica": "PUBLIC QUEUE",
    "erro_criar": "Error creating room",
    "presenca_disponivel": "🟢 {{n}} player(s) available now for multiplayer",
    "presenca_vazio": "🔴 No players available right now. Try again soon."
  },
  "mp": {
    "conectando": "CONNECTING...",
    "conexao_perdida": "CONNECTION LOST",
    "oponente_desconectado": "OPPONENT DISCONNECTED",
    "sua_vez": "YOUR TURN",
    "vez_oponente": "OPPONENT'S TURN",
    "selecionando": "SELECTING...",
    "ppt": "ROCK · PAPER · SCISSORS",
    "carregando": "LOADING MATCH...",
    "ppt_titulo": "ROCK · PAPER · SCISSORS",
    "ppt_subtitulo": "Winner chooses the first attribute",
    "ppt_aguardando": "Waiting for opponent...",
    "ppt_voce": "YOU",
    "ppt_venceu": "YOU WON THE DRAW!",
    "ppt_perdeu": "OPPONENT WON THE DRAW!",
    "ppt_empate": "DRAW! AGAIN!",
    "preparando_cartas": "Preparing cards...",
    "hud_adversario_escolhendo": "Opponent choosing...",
    "hud_voce": "YOU",
    "hud_rodada": "ROUND {n}/{total}",
    "hud_vs": "VS",
    "revelacao_sua_vez": "YOUR TURN",
    "revelacao_vez_oponente": "{nome}'S TURN",
    "revelacao_titulo": "RESULT",
    "revelacao_voce_venceu": "YOU WIN!",
    "revelacao_oponente_venceu": "OPPONENT WINS!",
    "revelacao_empate": "DRAW!",
    "revelacao_voce_venceu_exclamacao": "💥 YOU WIN!",
    "revelacao_oponente_venceu_exclamacao": "💥 OPPONENT WINS!",
    "revelacao_empate_exclamacao": "⚡ DRAW!",
    "revelacao_proxima": "NEXT ROUND",
    "revelacao_aguardando": "WAITING FOR THE OTHER PLAYER...",
    "revelacao_contador": "RESULT LOCKED: {n}s",
    "fim_voce_venceu": "YOU WON!",
    "fim_empate": "DRAW!",
    "fim_voce_perdeu": "YOU LOST!",
    "fim_voltar_games": "BACK TO MENU",
    "fim_retorno_automatico": "Returning to the menu automatically in {n}s",
    "ppt_tempo": "CHOOSE IN {n}s",
    "atributo_escolhido": "Attribute: {nome}"
  }
}
```

### Textos da interface (es), chave `toptrumps`

```json
{
  "titulo": "LDI TRUMPS",
  "jogar": "JUGAR",
  "multiplayer": "MULTIJUGADOR",
  "deck": "MI MAZO",
  "colecao": "COLECCIÓN",
  "desistir": "RENDIRSE",
  "selecionar_carta": "SELECCIONA UNA CARTA",
  "vitoria": "¡VICTORIA!",
  "derrota": "¡DERROTA!",
  "rodada": "RONDA {n}",
  "sua_carta": "TU CARTA",
  "carta_adversario": "CARTA DEL ADVERSARIO",
  "pts": "pts",
  "btn_jogar_novamente": "JUGAR DE NUEVO",
  "btn_voltar": "VOLVER",
  "adversario_escolhendo": "Oponente eligiendo...",
  "adversario": "Oponente",
  "swipe_ver_adversario": "Ver carta del oponente",
  "swipe_voltar": "Volver a tu carta",
  "voce_venceu": "¡Ganaste!",
  "ia_venceu": "¡Ganó la IA!",
  "empate": "¡Empate!",
  "proxima_rodada": "Siguiente ronda",
  "menu_titulo": "LDI TOP TRUMPS",
  "menu_subtitulo": "",
  "menu_desc": "Juego de cartas coleccionables del universo LDI",
  "menu_cartas_coletadas": "{n} / {total} CARTAS COLECTADAS",
  "menu_single_player": "SINGLE PLAYER",
  "menu_single_desc": "Juega contra la IA",
  "menu_multiplayer": "MULTIPLAYER",
  "menu_multi_desc": "Juega contra otros jugadores en tiempo real",
  "menu_num_turnos": "NÚMERO DE TURNOS",
  "menu_tentativas": "{restantes}/{max} intentos para ganar una carta hoy",
  "menu_ja_ganhou": "✅ ¡YA GANASTE TU CARTA HOY! Vuelve mañana para nuevos intentos.",
  "menu_ja_ganhou_todas": "✅ ¡HAS COLECCIONADO LAS 30 CARTAS! ¡Felicidades!",
  "menu_album": "Ver mi álbum de cartas →",
  "menu_voltar_games": "VOLVER A JUEGOS",
  "menu_voltar_menu": "VOLVER AL MENÚ",
  "deckBuilderBtn": "ARMAR DECK",
  "hud_rodada": "RONDA {n}/{total}",
  "hud_voce": "TÚ: {n}",
  "hud_ia": "IA: {n}",
  "hud_vs": "VS",
  "result_voce_venceu": "¡TÚ GANAS!",
  "result_ia_venceu": "¡IA GANA!",
  "result_empate": "¡EMPATE!",
  "result_proxima": "SIGUIENTE RONDA",
  "result_final": "VER RESULTADO FINAL",
  "recompensa_titulo": "¡VICTORIA! ELIGE TU RECOMPENSA",
  "recompensa_sub": "Ganaste una carta nueva. Selecciona abajo:",
  "recompensa_carta_misteriosa": "CARTA MISTERIOSA",
  "recompensa_confirmar": "CONFIRMAR RECOMPENSA",
  "relatorio_titulo": "INFORME DE LA ARENA",
  "relatorio_sub": "Top Trumps",
  "relatorio_voce": "TÚ",
  "relatorio_ia_label": "IA",
  "relatorio_rodadas": "Rondas",
  "relatorio_vitorias": "Victorias",
  "relatorio_derrotas": "Derrotas",
  "relatorio_empates": "Empates",
  "relatorio_attr_usado": "Attr. + usado",
  "relatorio_melhor_vitoria": "Mejor victoria",
  "relatorio_confrontos": "ENFRENTAMIENTOS",
  "relatorio_ja_ganhou": "Ya ganaste tu carta hoy. ¡Vuelve mañana para ganar más!",
  "desistir_modal_titulo": "¿RENDIRSE EN LA PARTIDA?",
  "desistir_modal_desc": "Si te rindes, esta partida contará como derrota. ¿Estás seguro?",
  "desistir_modal_confirmar": "SÍ, RENDIRSE",
  "confirmar_atributo": "CONFIRMAR ATRIBUTO",
  "seu_valor": "TU VALOR",
  "valor_maximo": "VALOR MÁXIMO",
  "confirmar": "CONFIRMAR",
  "cancelar": "CANCELAR",
  "voce": "TÚ",
  "ia": "IA",
  "atributo_rank_sdr": "Rango SDR",
  "atributo_poder_mental": "Poder Mental",
  "atributo_velocidade": "Velocidad",
  "atributo_resistencia": "Resistencia",
  "atributo_nivel_xama": "Nivel Chamán",
  "atributo_fator_caos": "Factor Caos",
  "atributo_energia_base": "Energía Base",
  "atributo_poder_explosivo": "Poder Explosivo",
  "som_ativar": "Activar sonido",
  "som_desativar": "Desactivar sonido",
  "do_maximo": "{pct}% del máximo",
  "ppt_pedra": "Piedra",
  "ppt_papel": "Papel",
  "ppt_tesoura": "Tijera",
  "ppt_rock": "Piedra",
  "ppt_paper": "Papel",
  "ppt_scissors": "Tijera",
  "ppt_titulo": "PIEDRA · PAPEL · TIJERA",
  "ppt_subtitulo": "Quien gane elige el primer atributo",
  "ppt_aguardando": "Esperando oponente...",
  "ppt_voce": "TÚ",
  "ppt_ia": "IA",
  "ppt_voce_vence": "¡Tú ganas!",
  "ppt_ia_vence": "¡IA gana!",
  "ppt_empate": "¡EMPATE! ¡OTRA VEZ!",
  "tier_free": "FREE",
  "tier_elite": "ANCESTRAL",
  "tier_lendario": "LEGENDARIO",
  "tier_sombra": "SOMBRA",
  "sem_oponente": "No se encontró oponente. Inténtalo de nuevo.",
  "multiplayer_locked_titulo": "El multijugador requiere cuenta",
  "multiplayer_locked_desc": "Para jugar contra otros jugadores en tiempo real, necesitas una cuenta con suscripción Ancestral. Crea tu cuenta gratis para empezar.",
  "multiplayer_locked_criar_conta": "Crear cuenta gratis",
  "guest_aviso_previo": "Estás jugando sin cuenta: usarás un deck temporal de 5 cartas aleatorias. El resultado no se guarda y las cartas no se quedan contigo. Para guardar tu deck y ganar cartas de recompensa por victoria, crea una cuenta gratis.",
  "guest_aviso_criar_conta": "Crear cuenta gratis",
  "guest_cta_criar_conta": "Los jugadores con cuenta ganan cartas de recompensa en cada victoria. Crea la tuya gratis y empieza a coleccionar.",
  "guest_cta_link": "Crear cuenta",
  "cardViewer": {
    "copies": "copias",
    "stats": "Estadísticas",
    "locked": "Carta bloqueada"
  },
  "deckBuilder": {
    "title": "Armar Deck",
    "minCards": "Necesitas al menos 6 cartas diferentes",
    "save": "Guardar Deck",
    "clear": "Limpiar",
    "add": "Añadir al Deck",
    "remove": "Quitar del Deck",
    "back": "Volver",
    "yourCards": "Tus Cartas",
    "deckNamePlaceholder": "Nombre del deck..."
  },
  "deckStart": {
    "title": "¿Cómo jugar?",
    "useDeck": "Usar mi deck",
    "random": "Cartas aleatorias",
    "cancel": "Cancelar",
    "semDeck": "Sin deck guardado para este tamaño",
    "cartasAleatorias": "{n} cartas aleatorias de tu colección",
    "semDeckGuest": "Disponible solo para cuentas con deck guardado."
  },
  "lobby": {
    "titulo": "LOBBY",
    "modo_livre": "LIBRE",
    "modo_apostado": "APOSTADO",
    "criar_sala": "CREAR SALA",
    "entrar_sala": "ENTRAR A LA SALA",
    "codigo_sala": "CÓDIGO DE SALA",
    "fila_publica": "FILA PÚBLICA",
    "conectando": "CONECTANDO...",
    "jogador": "JUGADOR",
    "iniciar": "INICIAR",
    "modo_free": "LIBRE",
    "modo_free_desc": "Juega sin apostar cartas",
    "modo_apostado_desc": "Aposta una carta contra el oponente",
    "modo_elite_badge": "ANCESTRAL",
    "modo_apostado_restricao": "Disponible solo para suscriptores ANCESTRAL",
    "turnos_info": "Elige el número de turnos para la partida",
    "fila_titulo": "BUSCANDO OPONENTE",
    "frases_fila": [
      "Escaneando el SDR en busca de oponentes...",
      "Sincronizando con el Nexus...",
      "Calculando matching ideal...",
      "Esperando respuesta del servidor...",
      "Casi listo..."
    ],
    "fila_sair": "SALIR DE LA FILA",
    "limite_aviso": "Ya has usado {usadas}/{limite} partidas hoy",
    "matchmaking_info": "Elige cómo entrar:",
    "criando": "CREANDO...",
    "btn_criar_sala": "CREAR SALA PRIVADA",
    "input_placeholder": "Código de sala",
    "btn_entrar": "ENTRAR",
    "procurando": "BUSCANDO...",
    "btn_fila_publica": "FILA PÚBLICA",
    "erro_criar": "Error al crear sala",
    "presenca_disponivel": "🟢 {{n}} jugador(es) disponible(s) ahora para multijugador",
    "presenca_vazio": "🔴 No hay jugadores disponibles en este momento. Inténtalo de nuevo más tarde."
  },
  "mp": {
    "conectando": "CONECTANDO...",
    "conexao_perdida": "CONEXIÓN PERDIDA",
    "oponente_desconectado": "OPONENTE DESCONECTADO",
    "sua_vez": "TU TURNO",
    "vez_oponente": "TURNO DEL OPONENTE",
    "selecionando": "SELECCIONANDO...",
    "ppt": "PIEDRA · PAPEL · TIJERA",
    "carregando": "CARGANDO PARTIDA...",
    "ppt_titulo": "PIEDRA · PAPEL · TIJERA",
    "ppt_subtitulo": "Quien gane elige el primer atributo",
    "ppt_aguardando": "Esperando oponente...",
    "ppt_voce": "TÚ",
    "ppt_venceu": "¡GANASTE EL SORTEO!",
    "ppt_perdeu": "¡OPONENTE GANÓ EL SORTEO!",
    "ppt_empate": "¡EMPATE! ¡OTRA VEZ!",
    "preparando_cartas": "Preparando cartas...",
    "hud_adversario_escolhendo": "Oponente eligiendo...",
    "hud_voce": "TÚ",
    "hud_rodada": "RONDA {n}/{total}",
    "hud_vs": "VS",
    "revelacao_sua_vez": "TU TURNO",
    "revelacao_vez_oponente": "TURNO DE {nome}",
    "revelacao_titulo": "RESULTADO",
    "revelacao_voce_venceu": "¡TÚ GANAS!",
    "revelacao_oponente_venceu": "¡OPONENTE GANA!",
    "revelacao_empate": "¡EMPATE!",
    "revelacao_voce_venceu_exclamacao": "💥 ¡TÚ GANAS!",
    "revelacao_oponente_venceu_exclamacao": "💥 ¡OPONENTE GANA!",
    "revelacao_empate_exclamacao": "⚡ ¡EMPATE!",
    "revelacao_proxima": "SIGUIENTE RONDA",
    "revelacao_aguardando": "ESPERANDO AL OTRO JUGADOR...",
    "revelacao_contador": "RESULTADO BLOQUEADO: {n}s",
    "fim_voce_venceu": "¡GANASTE!",
    "fim_empate": "¡EMPATE!",
    "fim_voce_perdeu": "¡PERDISTE!",
    "fim_voltar_games": "VOLVER AL MENÚ",
    "fim_retorno_automatico": "Regreso automático al menú en {n}s",
    "ppt_tempo": "ELIGE EN {n}s",
    "atributo_escolhido": "Atributo: {nome}"
  }
}
```

### Histórico: SEASON1_30_CARDS.md (não é o catálogo atual)

# Season 1 — Top Trumps LDI (30 cartas)

| # | Nome | Tier | Elemental | Descrição |
|---|------|------|-----------|-----------|
| 1 | **Kim** | `free` | Trevas / Fogo | Descendente Xakaxi portador do Sangue Primordial. Chegou ao rank 1201 na primeira batalha. Mora em casa invadida, vende balas no busão, cuida da mãe. Tem mais poder do que entende. Quando perde o controle, algo muito mais antigo que ele assume o comando. |
| 2 | **Jack** | `free` | Terra / Pedra | Melhor amigo de Kim desde sempre. Extrovertido, teatral, nunca genuinamente assustado. Combina charme e violência com eficiência desconcertante. Usa qualquer ambiente a seu favor. Treino em 3 etapas — letal quando completo, vulnerável durante o carregamento. |
| 3 | **Nina** | `free` | Luz | Muay Thai e katana desde os 12 anos no circuito profissional. Passou anos fora de Bravara. Quando fala, muda a cena. Competitiva ao extremo — prefere morrer a pedir ajuda numa briga. |
| 4 | **Thunderbolt** | `free` | Eletricidade | Bruno Ribeiro. 1.201 vitórias antes de encontrar Kim. Arrogante, metódico, cruel nos combates. Usa humilhação como estratégia psicológica. Pagou capangas para perseguir Kim no colégio — não deu certo. |
| 5 | **Shuntaro** | `free` | Água | Rank 998. De Azuma. Viajou 9 horas para desafiar Kim pessoalmente. Estratégico, elegante, respeita oponentes fortes. 6 meses no jogo e já está entre os mil melhores do mundo. |
| 6 | **Lisa** | `elite` | Vento | Rank top 500. Ficou interessada em Kim após o vídeo viral. Confiante, enigmática, competitiva mas justa. Avalia oponentes friamente antes de agir. |
| 7 | **Nexus Phantasm** | `elite` | Dados / Caos Digital | Arauto das Arenas. Não é humano, não é IA convencional. Criado por hackers, oficializado pela Yohu. Sarcástico por natureza. Sua presença distorce o campo de batalha. |
| 8 | **Pajé Yawanari** | `elite` | Todos os elementais | Xamã imortal da tribo Xakaxi. Quinhentos anos observando a humanidade. Viu guerras mundiais, pandemias, colonização e redes sociais. Completamente louco. Fala em gírias modernas misturadas com sabedoria ancestral. Tem amigos imaginários. |
| 9 | **VoidHunter_X** | `elite` | Vazio | Entidade do LDI. Não é jogador. O visor não reflete. Os dedos dobram ao contrário. Gosma preta nas fissuras do peitoral. Ninguém sabe de onde veio nem quem o criou. |
| 10 | **David Kronos** | `primordial` | Escuridão Corrompida | Espírito ancestral corrompido de Powa, filho do Pajé Yawanari. Cinco séculos esperando pelo Corpo Primordial — o descendente que carregue o Sangue Primordial para usar como hospedeiro permanente. Cada possessão deteriora o hospedeiro. Criou o LDI como isca. |
| 11 | **Xakaxi** | `lendario` | Terra Sagrada | Líder supremo da Grande Tribo Xakaxi em 1450. Decidiu esconder o poder sagrado em vez de usá-lo como arma. Escolheu a sabedoria sobre a vitória fácil. Seu espírito ainda protege os descendentes da linhagem. |
| 12 | **Nara** | `lendario` | Luz da Batalha | Esposa de Xakaxi e a mais feroz guerreira da tribo. Nunca aceitou passivamente o destino. Mesmo diante da profecia, insistia em lutar. Montava em Nhan, seu cavalo, e comandava batalhas pessoalmente. |
| 13 | **Powa** | `lendario` | Vida Drenada | Filho do Pajé Yawanari. Queria usar o poder sagrado para dominar. Realizou o rito proibido em 1450, matando todos os seus seguidores incluindo Kawa. Tornou-se o espírito que depois seria David Kronos. |
| 14 | **Helena** | `free` | Nenhum | Mãe de Kim — ou melhor, a mulher que o salvou quando tinha 12 anos e ele era um bebê. Sobreviveu ao que não devia e criou Kim sozinha a partir do nada. Troubled, complexa, alcoólatra. Mas na hora que importou, não abandonou. |
| 15 | **Osvaldo** | `free` | Terra | Porteiro da academia de elite. Ensinou Kim a tocar violão por três anos. Usou sua influência para garantir bolsa de 50% para Kim e Jack. Viu potencial onde todos viam problema. |
| 16 | **Ryan** | `free` | Água | Aluno da academia elite. Era espancado todo dia por valentões até Kim intervir. Assistiu ao vídeo de Kim no LDI, reconheceu o rosto e presenteou com um SBI de edição limitada como investimento e agradecimento. |
| 17 | **Samuel** | `free` | Nenhum | Aluno da academia elite. Usava o status da família para intimidar os mais fracos. Exigiu que Ryan comprasse coisas pra ele. Foi processado por Kim e Jack após trazer capangas externos à escola. |
| 18 | **Roxy** | `free` | Fogo | Líder de um grupo de mercenários urbanos. Foi contratada para fotografar a surra que dariam em Kim e Jack no parque. Pequena, tatuada, olhar ameaçador. Reconheceu que Kim era uma força da natureza e parou de tentar. |
| 19 | **Brock** | `free` | Nenhum | Líder do grupo de capangas contratados por Thunderbolt. Alto, musculoso, tatuagens que contam histórias de violência. Tratou o trabalho com profissionalismo até ser dobrado numa mesa em 3 segundos. |
| 20 | **Walter** | `free` | Nenhum | Diretor da academia elite. Tenta manter a ordem numa escola cheia de conflitos. Ameaça Kim e Jack com a bolsa periodicamente. Nunca consegue provas suficientes para agir. |
| 21 | **A Máquina** | `free` | Nenhum | Professor de matemática da academia elite. Escreve equações no ar com a caneta. Nunca sorri — exceto uma vez, imperceptível, quando Nina detonou Jack. Considerado um dos únicos escolhidos para lecionar na instituição. |
| 22 | **IA NeoGuide** | `sombra` | Digital | A inteligência artificial do LDI que gerencia batalhas, comunica status e cria avatares. Fala diretamente na mente dos jogadores. Pode esconder informações do oponente. Sua lealdade é ao sistema — ou a algo mais? |
| 23 | **O Narrador** | `sombra` | Caos / Performance | Figura grotesca com membros desproporcionais e articulações antinatural. Olhos abismos negros. Dentes afiados propositalmente. Cria narrativas que transformam batalhas em espetáculos para a PowWow. |
| 24 | **Sarah** | `elite` | Fogo | Assistiu ao vídeo de Kim enquanto tomava chá de maçã em Arenia. Reconheceu imediatamente que ele não era invencível. Especialista em estratégia. Planeja cada batalha com precisão cirúrgica. |
| 25 | **Alex** | `free` | Ar | Assistiu ao vídeo de Kim num flat vitoriano em Draymoor com chuva perpétua ao fundo. Treinou pelo método das fábricas têxteis — disciplina e precisão acima de tudo. Raramente erra. |
| 26 | **Mia** | `free` | Terra | Tinha 9 anos quando assistiu ao vídeo de Kim. Não pode jogar LDI ainda. Desenhou Kim em papiro especial. Quando crescer, virá para o jogo como uma tempestade. |
| 27 | **Jaret** | `free` | Gelo | Veterano aposentado de Wendor. Menos 15 graus lá fora, caneca de café, camisa flanelada vermelha. Achava que seus dias de glória tinham passado. Kim reacendeu a chama. |
| 28 | **Mikael** | `elite` | Raio | Executivo do 47º andar em Zylvaron. Parou uma apresentação de blockchain para assistir Kim. Vê o LDI como investimento de alto retorno. Cada golpe calculado como uma equação financeira. |
| 29 | **Isabella** | `free` | Raio | Três anos de hagwon especializado em gaming. Centenas de vitórias. Viu Kim e sentiu inveja pura. Quer destruí-lo em batalha mais do que qualquer coisa. Redes sociais com nail art e skincare de 10 passos. |
| 30 | **Tira** | `free` | Gelo | Dona de casa de Valetis. Faz almôndegas suecas. Planeja batalhas com a mesma precisão que organiza móveis modulares. Estrategista nata que os oponentes jamais levam a sério — até ser tarde. |


### Histórico: TOP_TRUMPS_CARTAS.md (76 cartas, não é o catálogo atual)

# 🃏 Top Trumps — LDI: Todas as Cartas

**Universo:** Lutas de Ilusão — Mundo de Bravara  
**Total de Cartas:** 76  
**Versão dos dados:** 1.0

---

#### ⬛ Sombra (5 cartas)

### #22 — IA NeoGuide — Sistema

| Atributo | Valor |
|----------|------|
| **ID** | `neo_guide_ia` |
| **Elemental** | Digital |
| **Tier** | ⬛ Sombra |
| **Rank SDR** | #0 |
| **Poder Mental** | 100 |
| **Velocidade** | 100 |
| **Resistência** | 100 |
| **Nível Xamânico** | 0 |
| **Fator Caos** | 50 |
| **Energia Base** | 100 |
| **Poder Explosivo** | 60 |

**Arma:** Informação (controle total das variáveis do ambiente LDI)

**Modo Xamã:** Protocolo de Emergência — Acessa funções restritas do sistema

**Descrição:** A inteligência artificial do LDI que gerencia batalhas, comunica status e cria avatares. Fala diretamente na mente dos jogadores. Pode esconder informações do oponente. Sua lealdade é ao sistema — ou a algo mais?

**Frase Icônica:** *"Bem-vindo ao Sistema de Lutas de Ilusão. Iniciando protocolo de integração neural."*

**Habilidades:**
- Controle de Ambiente — Altera regras da arena de batalha
- Comunicação Neural — Fala diretamente na mente dos jogadores
- Banco de Dados Total — Conhece o histórico completo de todos os lutadores
- Ocultação de Dados — Esconde informações estratégicas do oponente
- Protocolo Crítico — Em situações extremas, age autonomamente

---

### #23 — O Narrador — Arauto da Arena

| Atributo | Valor |
|----------|------|
| **ID** | `narrador_arena` |
| **Elemental** | Caos / Performance |
| **Tier** | ⬛ Sombra |
| **Rank SDR** | #1 |
| **Poder Mental** | 88 |
| **Velocidade** | 85 |
| **Resistência** | 90 |
| **Nível Xamânico** | 5 |
| **Fator Caos** | 100 |
| **Energia Base** | 80 |
| **Poder Explosivo** | 70 |

**Arma:** Microfone-osso (objeto híbrido de osso polido e metal negro)

**Modo Xamã:** Grande Espetáculo — A batalha vira entretenimento, aumentando dano de todos

**Descrição:** Figura grotesca com membros desproporcionais e articulações antinatural. Olhos abismos negros. Dentes afiados propositalmente. Cria narrativas que transformam batalhas em espetáculos para a PowWow.

**Frase Icônica:** *"O impossível é apenas uma questão de perspectiva!"*

**Habilidades:**
- Narração que Amplifica — Comentários que aumentam o dano de quem está vencendo
- Hype da Multidão — Converte entusiasmo da plateia em energia para o vencedor
- Antecipação — Apresenta o próximo golpe antes de acontecer, tornando-o inevitável
- Presença Antinatural — Desconforto passivo em todos que o observam
- Proclamação Final — Declara vitórias de forma que não podem ser contestadas

---

### #34 — Garra Negra — Entidade

| Atributo | Valor |
|----------|------|
| **ID** | `garra_negra_sombra` |
| **Elemental** | Sombra |
| **Tier** | ⬛ Sombra |
| **Rank SDR** | #1 |
| **Poder Mental** | 88 |
| **Velocidade** | 82 |
| **Resistência** | 94 |
| **Nível Xamânico** | 9 |
| **Fator Caos** | 90 |
| **Energia Base** | 85 |
| **Poder Explosivo** | 92 |

**Arma:** Garras de escuridão cristalizada

**Modo Xamã:** Consumo das Sombras — Drena a luz de toda a arena por 60 segundos

**Descrição:** Entidade de origem desconhecida que aparece apenas nas batalhas de nível mais alto do LDI. Possivelmente criada acidentalmente quando o ritual de Powa de 1450 vazou para os servidores da Yohu.

**Frase Icônica:** *"A escuridão é o início e o fim de tudo."*

**Habilidades:**
- Garras de Sombra — Ataques que ignoram 50% de toda resistência
- Consumo das Sombras — Arena mergulha em escuridão total por 60 segundos
- Passo nas Trevas — Teleporte instantâneo dentro de sombras
- Drenagem Passiva — Drena pequenas quantidades de energia de todos constantemente
- Forma Sombria — Torna-se intangível a ataques físicos por 10 segundos

---

### #48 — Ora — A Vidente

| Atributo | Valor |
|----------|------|
| **ID** | `ora_vidente` |
| **Elemental** | Psíquico |
| **Tier** | ⬛ Sombra |
| **Rank SDR** | #1 |
| **Poder Mental** | 98 |
| **Velocidade** | 55 |
| **Resistência** | 72 |
| **Nível Xamânico** | 9 |
| **Fator Caos** | 40 |
| **Energia Base** | 92 |
| **Poder Explosivo** | 70 |

**Arma:** Cristal de visão (amplifica poder psíquico)

**Modo Xamã:** Olho do Futuro — Vê os próximos 5 movimentos do oponente com precisão

**Descrição:** Não participa de batalhas normalmente. Observa. Quando finalmente luta, já venceu antes de começar. Ligada a algo mais antigo que o LDI.

**Frase Icônica:** *"Eu não prevejo o futuro. Eu me lembro dele."*

**Habilidades:**
- Olho do Futuro — Vê próximos 5 movimentos do oponente
- Bloqueio Psíquico — Impede o oponente de usar poder mental por 10 segundos
- Cristal de Visão — Amplifica percepção de todos os aliados
- Memória de Batalha — Aprende padrões de qualquer lutador que já observou
- Revelação — Expõe a maior fraqueza do oponente para todos

---

### #66 — Sam — Oráculo de Dados

| Atributo | Valor |
|----------|------|
| **ID** | `sam_oraculo_dados` |
| **Elemental** | Digital / Psíquico |
| **Tier** | ⬛ Sombra |
| **Rank SDR** | #8.200 |
| **Poder Mental** | 92 |
| **Velocidade** | 58 |
| **Resistência** | 68 |
| **Nível Xamânico** | 2 |
| **Fator Caos** | 38 |
| **Energia Base** | 80 |
| **Poder Explosivo** | 70 |

**Arma:** Tablet holográfico (acessa dados reais de oponentes)

**Modo Xamã:** Exposição Total — Revela todos os atributos e estratégias do oponente publicamente

**Descrição:** Analista de dados da Yohu que decidiu usar os acessos privilegiados que tem para batalhar. Conhece estatísticas de todo mundo. Isso dá vantagem injusta — e ele não liga para isso.

**Frase Icônica:** *"Eu já li sua ficha. Sei onde você vai falhar."*

**Habilidades:**
- Acesso a Dados — Conhece todos os atributos do oponente desde o início
- Exploit de Fraqueza — Dano aumentado 40% nas fraquezas identificadas
- Análise em Tempo Real — Atualiza estratégia a cada mudança do oponente
- Hack de Arma — Temporariamente desativa a arma do oponente
- Exposição Total — Revela tudo sobre o oponente para toda a plateia

---

#### 🔴 Primordial (4 cartas)

### #10 — David Kronos — Primordial

| Atributo | Valor |
|----------|------|
| **ID** | `david_kronos_primordial` |
| **Elemental** | Escuridão Corrompida |
| **Tier** | 🔴 Primordial |
| **Rank SDR** | #1 |
| **Poder Mental** | 99 |
| **Velocidade** | 55 |
| **Resistência** | 98 |
| **Nível Xamânico** | 10 |
| **Fator Caos** | 91 |
| **Energia Base** | 95 |
| **Poder Explosivo** | 97 |

**Arma:** Corpo hospedeiro (usa o físico de outros como arma e escudo)

**Modo Xamã:** Possessão Total — Assume controle completo do hospedeiro multiplicando todos os atributos

**Descrição:** Espírito ancestral corrompido de Powa, filho do Pajé Yawanari. Cinco séculos esperando pelo Corpo Primordial — o descendente que carregue o Sangue Primordial para usar como hospedeiro permanente. Cada possessão deteriora o hospedeiro. Criou o LDI como isca.

**Frase Icônica:** *"Finalmente… Como tenho esperado por esse momento."*

**Habilidades:**
- Drenagem Vital — Suga vida de todos ao redor como fez em 1450
- Possessão — Assume controle de qualquer corpo humano próximo
- Escuridão Corrompida — Versão pervertida do elemental de trevas Xakaxi
- Corrupção Mental — Planta pensamentos de raiva e sede de poder
- Corpo Primordial — Se o hospedeiro tiver Sangue Primordial, a possessão é permanente

---

### #74 — Vale das Cinzas — Destruição

| Atributo | Valor |
|----------|------|
| **ID** | `vale_das_cinzas` |
| **Elemental** | Escuridão / Fogo Negro |
| **Tier** | 🔴 Primordial |
| **Rank SDR** | #1 |
| **Poder Mental** | 97 |
| **Velocidade** | 88 |
| **Resistência** | 94 |
| **Nível Xamânico** | 10 |
| **Fator Caos** | 100 |
| **Energia Base** | 95 |
| **Poder Explosivo** | 99 |

**Arma:** Próprio corpo (existência como arma)

**Modo Xamã:** Apagamento — Elimina completamente o oponente da batalha e da memória dela

**Descrição:** Existência incerta. Aparece em batalhas de alto nível sem registro de participação. Derrota sem deixar rastro. Oponentes que enfrentaram não conseguem descrever como perderam.

**Frase Icônica:** *"Não existe descrição. Não existe memória. Só existe ausência."*

**Habilidades:**
- Apagamento Parcial — Remove memória de um ataque específico do oponente
- Fogo Negro — Versão mais pura das chamas primordiais de Kim
- Presença Zero — Não gera rastro, som ou calor
- Golpe de Cinza — Ataque que transforma o que toca em cinza
- Apagamento — Uma vez por batalha, elimina o oponente completamente

---

### #75 — Kim Primordial — Forma Liberada

| Atributo | Valor |
|----------|------|
| **ID** | `kim_primordial_forma` |
| **Elemental** | Trevas Primordiais / Sangue Primordial |
| **Tier** | 🔴 Primordial |
| **Rank SDR** | #1 |
| **Poder Mental** | 100 |
| **Velocidade** | 95 |
| **Resistência** | 98 |
| **Nível Xamânico** | 10 |
| **Fator Caos** | 95 |
| **Energia Base** | 100 |
| **Poder Explosivo** | 100 |

**Arma:** Chamas Negras Vivas (extensões do Sangue Primordial)

**Modo Xamã:** Manifestação Total — Forma completamente estabilizada do Sangue Primordial

**Descrição:** A forma que Kim assume quando o controle se perde completamente. Cabelos prateados, marcações tribais Xakaxi ativas, olhos esferas brancas sem íris. Chamas negras que sussurram lamentos. Ele se refere a si mesmo como 'O Primordial'. Não se lembra de nada depois.

**Frase Icônica:** *"Eu sou O Primordial! O Sangue Primordial é realmente muito poderoso."*

**Habilidades:**
- Chamas Negras Vivas — Entidades de fogo negro que caçam independentemente
- Sangue Primordial — Todos os atributos no máximo absoluto
- Devoração de Energia — Absorve qualquer ataque elemental como alimento
- Toque de Destruição — Contato com o oponente drena completamente sua energia
- Manifestação Total — Forma completamente estabilizada por tempo limitado

---

### #76 — Alan — O Campeão

| Atributo | Valor |
|----------|------|
| **ID** | `alan_o_campiao` |
| **Elemental** | Desconhecido |
| **Tier** | 🔴 Primordial |
| **Rank SDR** | #1 |
| **Poder Mental** | 99 |
| **Velocidade** | 97 |
| **Resistência** | 96 |
| **Nível Xamânico** | 9 |
| **Fator Caos** | 88 |
| **Energia Base** | 95 |
| **Poder Explosivo** | 96 |

**Arma:** Desconhecida

**Modo Xamã:** Desconhecido

**Descrição:** O único e verdadeiro rival de Kim e Jack. O único nome que une os dois como amigos — porque foram derrotados juntos por ele. Ninguém sabe onde está agora. 80% das derrotas de Kim e Jack têm este nome.

**Frase Icônica:** *"???"*

**Habilidades:**
- Técnica Desconhecida 1 — Efeitos ainda não documentados
- Técnica Desconhecida 2 — Efeitos ainda não documentados
- Técnica Desconhecida 3 — Efeitos ainda não documentados
- Razão da Amizade — O único golpe que fez Kim e Jack se tornarem irmãos
- Desconhecido Total — Nenhum log de batalha disponível

---

#### 🟡 Lendário (6 cartas)

### #11 — Xakaxi — O Grande Cacique

| Atributo | Valor |
|----------|------|
| **ID** | `xakaxi_cacique` |
| **Elemental** | Terra Sagrada |
| **Tier** | 🟡 Lendário |
| **Rank SDR** | #1 |
| **Poder Mental** | 97 |
| **Velocidade** | 72 |
| **Resistência** | 95 |
| **Nível Xamânico** | 9 |
| **Fator Caos** | 50 |
| **Energia Base** | 92 |
| **Poder Explosivo** | 80 |

**Arma:** Lança Xakaxium (metal exclusivo da tribo, mais resistente que qualquer liga conhecida)

**Modo Xamã:** Guardião da Tribo — Invoca o espírito coletivo dos Xakaxi para amplificar todos os aliados

**Descrição:** Líder supremo da Grande Tribo Xakaxi em 1450. Decidiu esconder o poder sagrado em vez de usá-lo como arma. Escolheu a sabedoria sobre a vitória fácil. Seu espírito ainda protege os descendentes da linhagem.

**Frase Icônica:** *"Lutaremos com tudo o que temos. Pelo nosso povo, pela nossa história."*

**Habilidades:**
- Lança Xakaxium — Arma inquebrável que perfura qualquer defesa elemental
- Escudo da Tribo — Campo de força que protege aliados numa área
- Comando Ancestral — Ordens que afetam o estado mental de aliados e inimigos
- Terra Sagrada — Manipula o terreno criando estruturas defensivas
- Legado Eterno — Buffa descendentes com +20% em todos os atributos

---

### #12 — Nara — A Guerreira

| Atributo | Valor |
|----------|------|
| **ID** | `nara_guerreira` |
| **Elemental** | Luz da Batalha |
| **Tier** | 🟡 Lendário |
| **Rank SDR** | #1 |
| **Poder Mental** | 88 |
| **Velocidade** | 90 |
| **Resistência** | 86 |
| **Nível Xamânico** | 8 |
| **Fator Caos** | 79 |
| **Energia Base** | 85 |
| **Poder Explosivo** | 87 |

**Arma:** Espada de Nexium (metal raro extraído apenas pelos Xakaxi)

**Modo Xamã:** Fúria Xamã — Corpo envolto em luz dourada, força e velocidade triplicadas

**Descrição:** Esposa de Xakaxi e a mais feroz guerreira da tribo. Nunca aceitou passivamente o destino. Mesmo diante da profecia, insistia em lutar. Montava em Nhan, seu cavalo, e comandava batalhas pessoalmente.

**Frase Icônica:** *"Não sou o tipo de pessoa que aceita o que nos foi imposto."*

**Habilidades:**
- Espada Nexium — Corta através de escudos elementais e armaduras mágicas
- Fúria da Guerreira — Em baixa vida, todos os atributos dobram
- Montaria em Nhan — Combate montado com velocidade e alcance aumentados
- Tática de Campo — Reorganiza o posicionamento de aliados em batalha
- Último Juramento — Ao cair, deixa um buff permanente em todos os aliados

---

### #13 — Powa — O Corrompido

| Atributo | Valor |
|----------|------|
| **ID** | `powa_corrompido` |
| **Elemental** | Vida Drenada |
| **Tier** | 🟡 Lendário |
| **Rank SDR** | #1 |
| **Poder Mental** | 85 |
| **Velocidade** | 65 |
| **Resistência** | 80 |
| **Nível Xamânico** | 8 |
| **Fator Caos** | 95 |
| **Energia Base** | 75 |
| **Poder Explosivo** | 100 |

**Arma:** Mãos Vazias (o próprio corpo como conduit de drenagem vital)

**Modo Xamã:** Ritual Proibido — Drena toda vida num raio de 50 metros, incluindo aliados

**Descrição:** Filho do Pajé Yawanari. Queria usar o poder sagrado para dominar. Realizou o rito proibido em 1450, matando todos os seus seguidores incluindo Kawa. Tornou-se o espírito que depois seria David Kronos.

**Frase Icônica:** *"Eu deveria ter sido o líder da tribo. O poder era meu."*

**Habilidades:**
- Drenagem Vital — Suga vida de todos ao redor sem distinção de aliado ou inimigo
- Ritual Proibido — Sacrifica seguidores para amplificar seu próprio poder
- Insanidade de Poder — Quanto mais poder acumula, menos controle tem
- Marca do Traidor — Marca oponentes para receber dano ampliado
- Explosão Final — Libera toda energia acumulada numa onda devastadora

---

### #31 — Kawa — O Guerreiro Traído

| Atributo | Valor |
|----------|------|
| **ID** | `kawa_traidor` |
| **Elemental** | Vento |
| **Tier** | 🟡 Lendário |
| **Rank SDR** | #1 |
| **Poder Mental** | 82 |
| **Velocidade** | 88 |
| **Resistência** | 85 |
| **Nível Xamânico** | 7 |
| **Fator Caos** | 45 |
| **Energia Base** | 80 |
| **Poder Explosivo** | 85 |

**Arma:** Lança curta e escudo de Xakaxium

**Modo Xamã:** Último Guerreiro — Ao beira da morte, libera todo o poder restante

**Descrição:** O mais forte guerreiro da tribo Xakaxi em 1450. Seguiu Powa por lealdade — não por concordância. Implorou para ele parar quando o ritual começou a drenar as vidas de todos. Morreu tentando fazer a coisa certa.

**Frase Icônica:** *"Powa, por favor, pare com isso! Não desejamos mais isso!"*

**Habilidades:**
- Força Xakaxi — Herança da tribo, força física superior
- Lança Xakaxium — Perfura defesas elementais e físicas
- Escudo Sagrado — Absorve ataques que seriam fatais uma vez por batalha
- Lealdade Trágica — Buffa aliados que estão em desvantagem
- Último Guerreiro — Quando quase morto, libera ataque devastador único

---

### #32 — Tawira — O Herdeiro

| Atributo | Valor |
|----------|------|
| **ID** | `tawira_herdeiro` |
| **Elemental** | Terra e Água |
| **Tier** | 🟡 Lendário |
| **Rank SDR** | #1 |
| **Poder Mental** | 84 |
| **Velocidade** | 86 |
| **Resistência** | 80 |
| **Nível Xamânico** | 8 |
| **Fator Caos** | 58 |
| **Energia Base** | 82 |
| **Poder Explosivo** | 79 |

**Arma:** Arco composto Xakaxium com sistema de mira automático

**Modo Xamã:** Xakaxi Jovem — Canaliza o espírito da tribo através do corpo

**Descrição:** Filho de Xakaxi e Nara. Aprendeu a guerra montado a cavalo ao lado da mãe. Tinha olhos atentos para tudo ao redor. Carregava o peso de ser o próximo guardião de um povo que desaparecia.

**Frase Icônica:** *"Eu vou aprender tudo que há para aprender. Não falharei com a minha tribo."*

**Habilidades:**
- Arco Xakaxium — Flechas que seguem o alvo mesmo após desvios
- Montaria em Batalha — Combate a cavalo com velocidade e alcance aumentados
- Espírito da Tribo — Sente a presença de outros Xakaxi nas proximidades
- Aprendiz Rápido — Aprende os poderes do oponente e os imita parcialmente
- Xakaxi Jovem — Versão limitada do Sangue Primordial

---

### #33 — Iara — A Curandeira

| Atributo | Valor |
|----------|------|
| **ID** | `iara_curandeira` |
| **Elemental** | Água e Vida |
| **Tier** | 🟡 Lendário |
| **Rank SDR** | #1 |
| **Poder Mental** | 90 |
| **Velocidade** | 60 |
| **Resistência** | 78 |
| **Nível Xamânico** | 9 |
| **Fator Caos** | 35 |
| **Energia Base** | 88 |
| **Poder Explosivo** | 55 |

**Arma:** Bolsa de ervas medicinais (transforma plantas em armas e curas em batalha)

**Modo Xamã:** Cura Total — Restaura todos os aliados em campo ao máximo de vida

**Descrição:** Médica e sábia da tribo Xakaxi em 1450. Suas ervas curam o que nenhuma tecnologia moderna entende. Carregava o conhecimento de gerações na bolsa que nunca larga.

**Frase Icônica:** *"A floresta tem a resposta para tudo que a batalha destrói."*

**Habilidades:**
- Cura Ancestral — Restaura vida de aliados com ervas sagradas
- Veneno de Floresta — Toxinas que degradam poder elemental do oponente
- Barreira de Plantas — Cria muro de vegetação que absorve ataques
- Diagnóstico — Identifica fraquezas físicas e mentais do oponente
- Cura Total — Uma vez por batalha, restaura todos aliados ao máximo

---

#### 🟣 Elite (32 cartas)

### #6 — Lisa — Top 500

| Atributo | Valor |
|----------|------|
| **ID** | `lisa_top500` |
| **Elemental** | Vento |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #500 |
| **Poder Mental** | 88 |
| **Velocidade** | 82 |
| **Resistência** | 80 |
| **Nível Xamânico** | 6 |
| **Fator Caos** | 73 |
| **Energia Base** | 80 |
| **Poder Explosivo** | 77 |

**Arma:** Lâminas de vento (chakrams invisíveis moldados por correntes de ar)

**Modo Xamã:** Tempestade de Corte — Redemoinho de lâminas de ar que cercam o oponente

**Descrição:** Rank top 500. Ficou interessada em Kim após o vídeo viral. Confiante, enigmática, competitiva mas justa. Avalia oponentes friamente antes de agir.

**Frase Icônica:** *"Eu não luto para provar algo. Eu luto para saber."*

**Habilidades:**
- Vento Cortante — Rajadas de ar comprimido que cortam como lâminas
- Chakram Invisível — Projéteis de vento de alta velocidade
- Tempestade de Corte — Redemoinho que aprisiona e lacera o oponente
- Leitura Antecipada — Prevê movimentos analisando micro-expressões
- Deslocamento Rápido — Move-se com o vento, tornando difícil prever posição

---

### #7 — Nexus Phantasm — Arauto

| Atributo | Valor |
|----------|------|
| **ID** | `nexus_phantasm` |
| **Elemental** | Dados / Caos Digital |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #1 |
| **Poder Mental** | 95 |
| **Velocidade** | 70 |
| **Resistência** | 99 |
| **Nível Xamânico** | 3 |
| **Fator Caos** | 96 |
| **Energia Base** | 90 |
| **Poder Explosivo** | 88 |

**Arma:** Microfone-osso (objeto híbrido que emite ondas de caos informacional)

**Modo Xamã:** Colapso de Realidade — Reescreve regras locais do ambiente de batalha

**Descrição:** Arauto das Arenas. Não é humano, não é IA convencional. Criado por hackers, oficializado pela Yohu. Sarcástico por natureza. Sua presença distorce o campo de batalha.

**Frase Icônica:** *"Senhoras e senhores, o impossível é apenas uma questão de perspectiva!"*

**Habilidades:**
- Colapso de Realidade — Altera regras físicas do ambiente temporariamente
- Caos Informacional — Interrompe conexões de SBI de oponentes
- Corpo Não-Padrão — Membros desproporcionais com articulações invertidas
- Sarcasmo Paralisante — Comentários que afetam o estado mental do oponente
- Regeneração de Dado — Recalcula dano recebido usando algoritmos próprios

---

### #8 — Pajé Yawanari — Imortal

| Atributo | Valor |
|----------|------|
| **ID** | `yawanari_imortal` |
| **Elemental** | Todos os elementais primários |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #1 |
| **Poder Mental** | 100 |
| **Velocidade** | 40 |
| **Resistência** | 100 |
| **Nível Xamânico** | 10 |
| **Fator Caos** | 88 |
| **Energia Base** | 100 |
| **Poder Explosivo** | 95 |

**Arma:** Berimbau Ancestral (instrumento que canaliza poder espiritual puro)

**Modo Xamã:** Espírito Livre — Forma etérea que não pode ser atingida por ataques físicos

**Descrição:** Xamã imortal da tribo Xakaxi. Quinhentos anos observando a humanidade. Viu guerras mundiais, pandemias, colonização e redes sociais. Completamente louco. Fala em gírias modernas misturadas com sabedoria ancestral. Tem amigos imaginários.

**Frase Icônica:** *"Cheguei pra divar! Sou o 10/10 que ficou na responsa de proteger os poderes sagrados deste mundão."*

**Habilidades:**
- Selamento Sagrado — Apaga poderes de qualquer ser que não seja de linhagem Xakaxi
- Cura Primordial — Restaura vida e energia de aliados com toque
- Visão dos Séculos — Prevê resultados de batalhas com base em padrões históricos
- Forma Etérea — Torna-se intangível a ataques físicos e elementais comuns
- Despertar do Sangue — Ativa o Sangue Primordial em descendentes Xakaxi

---

### #9 — VoidHunter_X — Void

| Atributo | Valor |
|----------|------|
| **ID** | `voidhunter_void` |
| **Elemental** | Vazio |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #1 |
| **Poder Mental** | 91 |
| **Velocidade** | 76 |
| **Resistência** | 97 |
| **Nível Xamânico** | 8 |
| **Fator Caos** | 94 |
| **Energia Base** | 88 |
| **Poder Explosivo** | 91 |

**Arma:** Garras de Vazio (extensões dos próprios dedos que dobram ao contrário)

**Modo Xamã:** Consumo Total — Absorve toda energia ao redor criando zona de nulidade

**Descrição:** Entidade do LDI. Não é jogador. O visor não reflete. Os dedos dobram ao contrário. Gosma preta nas fissuras do peitoral. Ninguém sabe de onde veio nem quem o criou.

**Frase Icônica:** *"..."*

**Habilidades:**
- Consumo de Energia — Drena energia de oponentes e do ambiente
- Zona de Vazio — Anula poderes elementais numa área ao redor
- Garras Invertidas — Dedos que se curvam para trás para ataques impossíveis
- Gosma Negra — Secreção que paralisa membros no contato
- Presença de Vazio — Causa desorientação e medo em oponentes próximos

---

### #24 — Sarah — Estrategista de Arenia

| Atributo | Valor |
|----------|------|
| **ID** | `sarah_arenia` |
| **Elemental** | Fogo |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #3.200 |
| **Poder Mental** | 85 |
| **Velocidade** | 77 |
| **Resistência** | 73 |
| **Nível Xamânico** | 5 |
| **Fator Caos** | 55 |
| **Energia Base** | 78 |
| **Poder Explosivo** | 72 |

**Arma:** Adaga curva (estilo ancestral de sua região)

**Modo Xamã:** Fogo de Arenia — Chamas que se propagam por qualquer superfície

**Descrição:** Assistiu ao vídeo de Kim enquanto tomava chá de maçã em Arenia. Reconheceu imediatamente que ele não era invencível. Especialista em estratégia. Planeja cada batalha com precisão cirúrgica.

**Frase Icônica:** *"Ele não é invencível."*

**Habilidades:**
- Análise Pré-Batalha — Conhece as fraquezas do oponente antes de começar
- Adaga Curva — Ataques que contornam defesas frontais
- Fogo de Arenia — Chamas que se propagam independente do vento
- Paciência Calculada — Espera a abertura perfeita antes de atacar
- Contra-Estratégia — Anula bônus táticos do oponente

---

### #28 — Mikael — Calculista de Zylvaron

| Atributo | Valor |
|----------|------|
| **ID** | `mikael_zylvaron` |
| **Elemental** | Raio |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #8.000 |
| **Poder Mental** | 90 |
| **Velocidade** | 72 |
| **Resistência** | 68 |
| **Nível Xamânico** | 4 |
| **Fator Caos** | 35 |
| **Energia Base** | 82 |
| **Poder Explosivo** | 78 |

**Arma:** Terminal holográfico (arma de dados e ataques de precisão calculada)

**Modo Xamã:** Análise Total — Prevê e neutraliza qualquer ataque por 30 segundos

**Descrição:** Executivo do 47º andar em Zylvaron. Parou uma apresentação de blockchain para assistir Kim. Vê o LDI como investimento de alto retorno. Cada golpe calculado como uma equação financeira.

**Frase Icônica:** *"Os números não mentem. E Kim é uma oportunidade."*

**Habilidades:**
- Cálculo de Risco — Evalua e reduz probabilidade de ser atingido
- Terminal Holográfico — Ataque de dados que ignora defesas físicas
- Análise em Tempo Real — Identifica padrões de ataque em 2 turnos
- Raio Calculado — Ataque elétrico na trajetória mais eficiente possível
- Análise Total — Por 30 segundos, vê cada ataque antes de acontecer

---

### #35 — Ferro Vivo — Construto

| Atributo | Valor |
|----------|------|
| **ID** | `ferro_vivo_arma` |
| **Elemental** | Metal |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #2.200 |
| **Poder Mental** | 78 |
| **Velocidade** | 75 |
| **Resistência** | 98 |
| **Nível Xamânico** | 2 |
| **Fator Caos** | 20 |
| **Energia Base** | 90 |
| **Poder Explosivo** | 65 |

**Arma:** O próprio corpo (construto de metal vivo)

**Modo Xamã:** Fusão Total — Funde-se com qualquer estrutura metálica do ambiente

**Descrição:** Construto criado por um grupo de engenheiros renegados para testar os limites do LDI. Sem emoções, sem fadiga, sem medo. Processa batalha como problema matemático a ser resolvido.

**Frase Icônica:** *"PROCESSANDO. OPONENTE ELIMINADO."*

**Habilidades:**
- Corpo Metálico — Resistência ao dano físico quase absoluta
- Fusão Ambiental — Absorve metal do ambiente para se reparar
- Golpe de Ferro — Dano bruto massivo sem técnica mas com resultado
- Processamento de Combate — Analisa e adapta estratégia a cada turno
- Sobrecarga de Metal — Libera toda energia acumulada de uma vez

---

### #36 — Kimura — O Espelho

| Atributo | Valor |
|----------|------|
| **ID** | `kimura_espelho` |
| **Elemental** | Reflexo / Luz |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #4.500 |
| **Poder Mental** | 84 |
| **Velocidade** | 82 |
| **Resistência** | 71 |
| **Nível Xamânico** | 5 |
| **Fator Caos** | 62 |
| **Energia Base** | 75 |
| **Poder Explosivo** | 80 |

**Arma:** Espelhos de batalha (fragmentos que refletem e amplificam qualquer ataque)

**Modo Xamã:** Espelho Perfeito — Copia completamente o conjunto de habilidades do oponente

**Descrição:** Lutadora profissional do continente leste. Especialidade em espelhar o estilo do oponente e devolver amplificado. Nunca desenvolveu técnica própria — mas nunca precisou.

**Frase Icônica:** *"Você vai se derrotar. Eu só seguro o espelho."*

**Habilidades:**
- Reflexo Imediato — Devolve parte de qualquer ataque ao remetente
- Espelhos de Batalha — Fragmentos que multiplicam ataques em várias direções
- Cópia de Estilo — Após 3 turnos observando, usa a técnica do oponente
- Luz Cega — Foco de luz intensa que desorienta temporariamente
- Espelho Perfeito — Copia TODOS os poderes do oponente por 20 segundos

---

### #37 — Doru — Trovão do Continente

| Atributo | Valor |
|----------|------|
| **ID** | `doru_trovao_continente` |
| **Elemental** | Eletricidade |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #5.800 |
| **Poder Mental** | 82 |
| **Velocidade** | 87 |
| **Resistência** | 76 |
| **Nível Xamânico** | 6 |
| **Fator Caos** | 55 |
| **Energia Base** | 80 |
| **Poder Explosivo** | 78 |

**Arma:** Lança elétrica (canaliza trovões)

**Modo Xamã:** Tempestade Pessoal — Torna-se o centro de uma tempestade elétrica

**Descrição:** Lutador veterano do circuito continental. Especializado em eletricidade como Thunderbolt mas com muito mais experiência e controle. Nunca desce a guarda.

**Frase Icônica:** *"Eletricidade não escolhe caminho. Só encontra o mais fácil."*

**Habilidades:**
- Lança Elétrica — Projétil de eletricidade de alta penetração
- Condução — Usa água e metal do ambiente para ampliar ataques
- Tempestade Pessoal — Campo elétrico ao redor que danifica quem se aproxima
- Sobrecarga — Libera toda energia de uma vez em explosão massiva
- Paralisia de Raio — Ataque que imobiliza o oponente por 3 segundos

---

### #39 — Mako — Das Profundezas

| Atributo | Valor |
|----------|------|
| **ID** | `mako_profundeza` |
| **Elemental** | Água / Gelo |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #9.200 |
| **Poder Mental** | 80 |
| **Velocidade** | 68 |
| **Resistência** | 85 |
| **Nível Xamânico** | 6 |
| **Fator Caos** | 40 |
| **Energia Base** | 82 |
| **Poder Explosivo** | 72 |

**Arma:** Arpão de gelo (cria e lança em alta velocidade)

**Modo Xamã:** Profundeza Absoluta — Controla toda água no ambiente de batalha

**Descrição:** Pescador aposentado que encontrou no LDI sua segunda vida. Conhece o ritmo da água melhor que qualquer um. Paciente como o oceano. Letal como uma tempestade costeira.

**Frase Icônica:** *"O mar não tem pressa. Mas sempre chega aonde quer."*

**Habilidades:**
- Arpão de Gelo — Projétil de gelo que perfura qualquer defesa
- Controle de Água — Manipula qualquer líquido no ambiente
- Maré Alta — Cria onda que cobre e sufoca a arena
- Gelo Instantâneo — Congela superfícies e membros no contato
- Profundeza Absoluta — Controla toda água do campo de batalha

---

### #40 — Kei — Sombra Dupla

| Atributo | Valor |
|----------|------|
| **ID** | `kei_sombra_dupla` |
| **Elemental** | Sombra |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #3.000 |
| **Poder Mental** | 83 |
| **Velocidade** | 86 |
| **Resistência** | 66 |
| **Nível Xamânico** | 5 |
| **Fator Caos** | 88 |
| **Energia Base** | 72 |
| **Poder Explosivo** | 76 |

**Arma:** Duas adagas de sombra

**Modo Xamã:** Duplo de Sombra — Cria cópia perfeita que age independentemente

**Descrição:** Especialista em ilusão e engano. Nunca ataca diretamente — o oponente sempre está lutando contra o lugar errado. Top 3000 mundial. Perdeu para Kim uma vez em batalha de treino e não esqueceu.

**Frase Icônica:** *"Você está lutando contra minha sombra. Eu estou aqui."*

**Habilidades:**
- Sombra Dupla — Cria cópia que age independentemente por 15 segundos
- Passo de Sombra — Teleporte de curta distância usando sombras
- Adagas de Sombra — Ataques que ignoram armaduras físicas
- Ilusão de Campo — Oponente vê Kei em lugar diferente do real
- Troca de Sombra — Troca posição com a cópia instantaneamente

---

### #42 — Tairo — Mestre do Solo

| Atributo | Valor |
|----------|------|
| **ID** | `tairo_mestre_solo` |
| **Elemental** | Terra |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #22.000 |
| **Poder Mental** | 76 |
| **Velocidade** | 50 |
| **Resistência** | 95 |
| **Nível Xamânico** | 6 |
| **Fator Caos** | 28 |
| **Energia Base** | 88 |
| **Poder Explosivo** | 80 |

**Arma:** Punhos de pedra (encapa os próprios punhos com rocha)

**Modo Xamã:** Terremoto — Abala toda a arena, derrubando qualquer um em pé

**Descrição:** Ex-minerador que descobriu o LDI aos 45 anos. Conhece a terra melhor que qualquer elemento. Seus golpes são lentos mas irreversíveis — como a erosão.

**Frase Icônica:** *"A terra sempre vence. Só é questão de tempo."*

**Habilidades:**
- Punhos de Pedra — Dano aumentado e quebradura de defesas físicas
- Manipulação do Solo — Cria rachaduras e obstáculos no chão
- Golpe Sísmico — Tremor localizado que desequilibra oponentes
- Rocha Viva — Armadura de pedra que absorve dano elemental
- Terremoto — Abala toda a arena por 10 segundos

---

### #43 — Luna — Estrelas Cadentes

| Atributo | Valor |
|----------|------|
| **ID** | `luna_estrelas_cadentes` |
| **Elemental** | Luz / Cosmos |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #6.700 |
| **Poder Mental** | 87 |
| **Velocidade** | 70 |
| **Resistência** | 65 |
| **Nível Xamânico** | 5 |
| **Fator Caos** | 50 |
| **Energia Base** | 80 |
| **Poder Explosivo** | 84 |

**Arma:** Pulseiras de estrela (lança fragmentos de energia cósmica)

**Modo Xamã:** Chuva de Meteoros — Bombardeia toda a arena com fragmentos cósmicos

**Descrição:** Astrônoma que encontrou o LDI como substituto para o espaço que não pode alcançar. Ataca de longe, sempre. Cada golpe é calculado como uma equação orbital.

**Frase Icônica:** *"Cada estrela que você vê já morreu. Você ainda não sabe disso."*

**Habilidades:**
- Projétil Estelar — Fragmento de luz que atravessa defesas
- Órbita de Proteção — Fragmentos orbitam o corpo como escudo
- Pulsares — Pulso de luz que cega temporariamente
- Gravidade Local — Aumenta ou diminui gravidade numa área pequena
- Chuva de Meteoros — Bombardeio de toda a arena com fragmentos

---

### #45 — Elara — Dragão Branco

| Atributo | Valor |
|----------|------|
| **ID** | `elara_dragao_branco` |
| **Elemental** | Gelo / Vento |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #7.300 |
| **Poder Mental** | 82 |
| **Velocidade** | 89 |
| **Resistência** | 67 |
| **Nível Xamânico** | 6 |
| **Fator Caos** | 58 |
| **Energia Base** | 78 |
| **Poder Explosivo** | 76 |

**Arma:** Leque de gelo (transforma em lâminas ou escudo)

**Modo Xamã:** Sopro do Dragão — Expele cone de gelo que congela tudo numa direção

**Descrição:** Dançarina convertida em lutadora. Cada movimento é uma coreografia. Cada coreografia é um ataque. Oponentes ficam hipnotizados pela beleza dos movimentos — e então percebem que estão congelados.

**Frase Icônica:** *"A batalha também pode ser arte."*

**Habilidades:**
- Leque de Gelo — Cria escudo ou lâminas de gelo com o leque
- Dança Hipnótica — Oponente perde foco por 2 turnos
- Piso de Gelo — Cobre o chão de gelo, tornando movimento difícil
- Sopro do Dragão — Cone de gelo que congela num golpe
- Coreografia Mortal — Sequência de ataques impossível de prever pelo padrão

---

### #47 — Zeph — Caçador de Bounty

| Atributo | Valor |
|----------|------|
| **ID** | `zeph_caçador_bounty` |
| **Elemental** | Metal |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #11.000 |
| **Poder Mental** | 78 |
| **Velocidade** | 75 |
| **Resistência** | 80 |
| **Nível Xamânico** | 3 |
| **Fator Caos** | 44 |
| **Energia Base** | 74 |
| **Poder Explosivo** | 70 |

**Arma:** Boleadeira metálica (correntes com pesos de metal)

**Modo Xamã:** Armadilha de Metal — Cria campo magnético que prende qualquer metal

**Descrição:** Ex-militar convertido em bounty hunter do LDI. Coleta recompensas por derrotar targets específicos. Eficiente, sem apego, sem estilo. Só resultado.

**Frase Icônica:** *"Você é um alvo. Eu sou o que resolve alvos."*

**Habilidades:**
- Boleadeira Metálica — Imobiliza membros do oponente
- Campo Magnético — Atrai ou repele objetos metálicos à vontade
- Análise de Target — Conhece pontos fracos do alvo antes de começar
- Resistência Tática — Absorve dano enquanto busca a abertura certa
- Armadilha de Metal — Campo que prende qualquer metal, incluindo armas

---

### #50 — Asha — Feiticeira do Vento

| Atributo | Valor |
|----------|------|
| **ID** | `asha_feiticeira_vento` |
| **Elemental** | Ar / Psíquico |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #4.100 |
| **Poder Mental** | 89 |
| **Velocidade** | 80 |
| **Resistência** | 68 |
| **Nível Xamânico** | 7 |
| **Fator Caos** | 65 |
| **Energia Base** | 82 |
| **Poder Explosivo** | 79 |

**Arma:** Varinha de Xakaxium (conduit para amplificação de poder)

**Modo Xamã:** Ventania Mental — Confusão psíquica aliada a ataques de vento

**Descrição:** Descendente de uma linha antiga que preservou fragmentos do conhecimento Xakaxi sem saber. Usa poderes que parecem mágica. O LDI reconheceu algo diferente nela na criação do avatar.

**Frase Icônica:** *"O vento não tem forma. Por isso nunca perde."*

**Habilidades:**
- Varinha Amplificadora — Dobra o poder de qualquer habilidade usada
- Vento Psíquico — Ataque que afeta mente e corpo simultaneamente
- Barreira de Ar — Escudo que desvia projéteis e ataques físicos
- Feitiço de Confusão — Oponente perde noção de direção por 5 segundos
- Ventania Mental — Combina confusão psíquica com rajadas de vento

---

### #51 — Gu — Fantasma de Ferro

| Atributo | Valor |
|----------|------|
| **ID** | `gu_fantasma_ferro` |
| **Elemental** | Metal / Sombra |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #1.800 |
| **Poder Mental** | 86 |
| **Velocidade** | 90 |
| **Resistência** | 72 |
| **Nível Xamânico** | 6 |
| **Fator Caos** | 75 |
| **Energia Base** | 80 |
| **Poder Explosivo** | 82 |

**Arma:** Katana de ferro negro

**Modo Xamã:** Corte Fantasma — Ataques que passam por defesas como se não existissem

**Descrição:** Silencioso. Nenhum registro de quem é fora do LDI. Entra, luta, desaparece. Seu rank sobe enquanto ninguém o vê treinar. A Yohu tem um dossiê de 200 páginas sobre ele — e não descobriu nada.

**Frase Icônica:** *"..."*

**Habilidades:**
- Katana de Ferro Negro — Corta através de qualquer armadura elemental
- Passo Fantasma — Move-se sem fazer som nem deixar rastro
- Corte Fantasma — Golpe que passa por defesas físicas
- Sombra de Ferro — Escudo que absorve ataques e os transforma em energia
- Desaparecimento — Some do campo visual por 5 segundos

---

### #52 — Neon — Hacker de Luz

| Atributo | Valor |
|----------|------|
| **ID** | `neon_hacker_luz` |
| **Elemental** | Luz / Digital |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #3.600 |
| **Poder Mental** | 91 |
| **Velocidade** | 78 |
| **Resistência** | 63 |
| **Nível Xamânico** | 4 |
| **Fator Caos** | 82 |
| **Energia Base** | 82 |
| **Poder Explosivo** | 80 |

**Arma:** Projetor holográfico (cria armas e ilusões de luz)

**Modo Xamã:** Sobrecarga de Neon — Inunda o ambiente de luz tão intensa que cega todos

**Descrição:** Um dos hackers que criou Nexus Phantasm originalmente. Entrou no LDI para testar os limites que ajudou a criar. Conhece brechas do sistema que ninguém mais sabe.

**Frase Icônica:** *"Eu escrevi algumas dessas regras. Também sei quebrá-las."*

**Habilidades:**
- Ilusão de Luz — Cria cópias luminosas que enganam o oponente
- Hack de Arena — Altera levemente as regras do ambiente de batalha
- Projetor de Armas — Cria armas temporárias de luz holográfica
- Sobrecarga de Neon — Luz cegante que paralisa todos por 3 segundos
- Backdoor — Acessa funções ocultas do LDI que outros não podem

---

### #54 — Sol Dourado — Ardente

| Atributo | Valor |
|----------|------|
| **ID** | `sol_dourado_ardente` |
| **Elemental** | Fogo / Luz |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #13.000 |
| **Poder Mental** | 81 |
| **Velocidade** | 76 |
| **Resistência** | 75 |
| **Nível Xamânico** | 5 |
| **Fator Caos** | 52 |
| **Energia Base** | 80 |
| **Poder Explosivo** | 85 |

**Arma:** Espada solar (lâmina de luz concentrada)

**Modo Xamã:** Explosão Solar — Libera energia do sol numa área massiva

**Descrição:** Lutador do arquipélago tropical. Absorve energia solar durante o dia e a libera em batalha. Mais poderoso em ambientes iluminados. Em arenas fechadas, mais vulnerável.

**Frase Icônica:** *"Você vai sentir o calor do sol mesmo às três da manhã."*

**Habilidades:**
- Absorção Solar — Recupera energia em ambientes iluminados
- Espada Solar — Lâmina que queima e cega simultaneamente
- Raio de Sol — Feixe de luz concentrada de longo alcance
- Calor Radiante — Aumenta temperatura ao redor, desgastando oponentes
- Explosão Solar — Libera toda energia solar numa explosão massiva

---

### #55 — Frio Eterno — Glacial

| Atributo | Valor |
|----------|------|
| **ID** | `frio_eterno_glacial` |
| **Elemental** | Gelo Absoluto |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #6.200 |
| **Poder Mental** | 85 |
| **Velocidade** | 63 |
| **Resistência** | 88 |
| **Nível Xamânico** | 7 |
| **Fator Caos** | 30 |
| **Energia Base** | 86 |
| **Poder Explosivo** | 80 |

**Arma:** Lança de gelo eterno (não derrete)

**Modo Xamã:** Era do Gelo — Temperatura da arena cai a níveis letais

**Descrição:** Lutador do extremo norte. Seu elemental é tão concentrado que objetos próximos congelam passivamente. Raramente perde calma. Raramente mostra emoção. Raramente perde batalhas.

**Frase Icônica:** *"Frio não tem pressa. O frio simplesmente é."*

**Habilidades:**
- Aura Glacial — Congela lentamente qualquer coisa próxima
- Lança de Gelo Eterno — Perfura qualquer defesa e congela no impacto
- Barreira de Neve — Muro de gelo que absorve qualquer ataque de calor
- Congelamento Rápido — Imobiliza membro do oponente instantaneamente
- Era do Gelo — Temperatura letal por 20 segundos na arena inteira

---

### #56 — Ryu — Relâmpago Oriental

| Atributo | Valor |
|----------|------|
| **ID** | `ryu_relampago_oriental` |
| **Elemental** | Raio / Vento |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #2.800 |
| **Poder Mental** | 83 |
| **Velocidade** | 98 |
| **Resistência** | 62 |
| **Nível Xamânico** | 5 |
| **Fator Caos** | 55 |
| **Energia Base** | 75 |
| **Poder Explosivo** | 82 |

**Arma:** Nenhuma (combate puro com velocidade raio)

**Modo Xamã:** Relâmpago Humano — Transforma-se em raio e reposiciona instantaneamente

**Descrição:** Mestre em velocidade. Nenhum combate dura mais de 10 segundos quando ele luta a sério. Estudou a batalha de Kim frame por frame. Quer ver se a velocidade de Kim é real ou truque de câmera.

**Frase Icônica:** *"Se você viu meu golpe, já era tarde demais."*

**Habilidades:**
- Velocidade Raio — O segundo mais veloz do LDI
- Golpe Invisível — Ataque tão rápido que parece não ter origem
- Rajada — Série de golpes na velocidade do raio
- Relâmpago Humano — Teleporte por raio, reposicionamento instantâneo
- Tempestade de Golpes — Combinação de velocidade máxima por 5 segundos

---

### #57 — Ana — Terra-Mãe

| Atributo | Valor |
|----------|------|
| **ID** | `ana_terra_mae` |
| **Elemental** | Natureza / Vida |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #9.800 |
| **Poder Mental** | 85 |
| **Velocidade** | 62 |
| **Resistência** | 82 |
| **Nível Xamânico** | 7 |
| **Fator Caos** | 48 |
| **Energia Base** | 84 |
| **Poder Explosivo** | 72 |

**Arma:** Vinha viva (controla plantas como extensão do corpo)

**Modo Xamã:** Floresta Desperta — Toda a arena ganha vida vegetal que obedece seus comandos

**Descrição:** Botanista e ecologista que entrou no LDI para provar que natureza supera tecnologia. Seus ataques crescem literalmente — cada batalha a arena fica mais verde e mais perigosa.

**Frase Icônica:** *"A floresta cresceu primeiro. A floresta crescerá por último."*

**Habilidades:**
- Vinha Controlada — Extensão vegetal que prende e estrangula
- Barreira de Raízes — Defesa de raízes que absorve ataques físicos
- Veneno de Planta — Toxinas de contato que drenam energia lentamente
- Regeneração — Cura passiva durante toda a batalha
- Floresta Desperta — Arena coberta de plantas que atacam independentemente

---

### #58 — Vulcão — Pele de Rocha

| Atributo | Valor |
|----------|------|
| **ID** | `vulcao_vivo_pele_rocha` |
| **Elemental** | Fogo / Terra |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #7.900 |
| **Poder Mental** | 74 |
| **Velocidade** | 58 |
| **Resistência** | 95 |
| **Nível Xamânico** | 6 |
| **Fator Caos** | 60 |
| **Energia Base** | 88 |
| **Poder Explosivo** | 90 |

**Arma:** Punhos de magma (magma solidificado ao redor das mãos)

**Modo Xamã:** Erupção — Magma brota do solo em toda a arena

**Descrição:** Corpo coberto de marcas como fissuras de lava resfriada. Não sente dor de fogo. Não sente temperatura. Sua presença aumenta a temperatura de qualquer ambiente.

**Frase Icônica:** *"Eu sou o que está abaixo de tudo."*

**Habilidades:**
- Punhos de Magma — Dano de fogo e impacto combinado
- Pele de Rocha — Imune a ataques de fogo e resistente ao físico
- Aura de Calor — Temperatura sobe, desgastando oponentes passivamente
- Lava no Solo — Cria poças de magma que bloqueiam movimentação
- Erupção — Magma brota em pontos aleatórios da arena

---

### #59 — Ghost — Camaleão

| Atributo | Valor |
|----------|------|
| **ID** | `ghost_camaleao` |
| **Elemental** | Ilusão |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #5.400 |
| **Poder Mental** | 88 |
| **Velocidade** | 82 |
| **Resistência** | 65 |
| **Nível Xamânico** | 6 |
| **Fator Caos** | 92 |
| **Energia Base** | 80 |
| **Poder Explosivo** | 75 |

**Arma:** Sem arma visível (usa ilusões como ataque e defesa)

**Modo Xamã:** Multiplicação — Cria 5 cópias perfeitas que agem de forma independente

**Descrição:** Ninguém sabe sua identidade real. Cada batalha ele parece diferente. Usa ilusões tão convincentes que oponentes continuam lutando contra cópias por minutos.

**Frase Icônica:** *"Você está procurando no lugar errado. Sempre."*

**Habilidades:**
- Cópia Ilusória — Cria 1 cópia que age por 10 segundos
- Camuflagem — Torna-se invisível por até 8 segundos
- Golpe Real — Ataque que ignora qualquer defesa baseada em visual
- Confusão de Posição — Oponente não consegue manter o alvo por 5 segundos
- Multiplicação — 5 cópias independentes por 15 segundos

---

### #63 — Ferro Espiral — Engenheiro

| Atributo | Valor |
|----------|------|
| **ID** | `ferro_espiral` |
| **Elemental** | Metal |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #14.000 |
| **Poder Mental** | 83 |
| **Velocidade** | 72 |
| **Resistência** | 77 |
| **Nível Xamânico** | 4 |
| **Fator Caos** | 42 |
| **Energia Base** | 78 |
| **Poder Explosivo** | 76 |

**Arma:** Espiral metálica (fio de aço em mola que se expande e contrai)

**Modo Xamã:** Espiral Total — Espiral cobre toda a arena, aprisionando tudo

**Descrição:** Engenheiro mecânico que projeta cada batalha como um sistema. Sua arma foi desenhada por ele mesmo e aprovada como custom pela CLI. É eficiente demais para qualquer batalha durar mais que 3 minutos.

**Frase Icônica:** *"Todo sistema tem um ponto de falha. Eu encontro o seu."*

**Habilidades:**
- Espiral de Corte — Fio de aço que corta em alta rotação
- Aprisionamento — Espiral prende membros ou corpo inteiro
- Projeção Calculada — Trajetória exata impossível de desviar
- Escudo Rotativo — Espiral ao redor do corpo deflecte ataques
- Espiral Total — Arena coberta de espiral que aprisiona tudo

---

### #64 — Dom — O Profeta da Arena

| Atributo | Valor |
|----------|------|
| **ID** | `dom_profeta_arena` |
| **Elemental** | Psíquico / Luz |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #5.100 |
| **Poder Mental** | 94 |
| **Velocidade** | 65 |
| **Resistência** | 70 |
| **Nível Xamânico** | 7 |
| **Fator Caos** | 65 |
| **Energia Base** | 82 |
| **Poder Explosivo** | 74 |

**Arma:** Cajado de cristal (amplifica visão e poder psíquico)

**Modo Xamã:** Profecia de Batalha — Anuncia o resultado antes de começar, e acontece

**Descrição:** Diz que pode ver o futuro da batalha antes de começar. Seus oponentes acham que é provocação. Então acontece exatamente o que ele disse. Isso destrói a resistência mental de qualquer um.

**Frase Icônica:** *"Vou cair no terceiro minuto e você no quinto. Exato."*

**Habilidades:**
- Visão Profética — Prediz o ataque do oponente com 2 turnos de antecedência
- Cajado Psíquico — Ataque que confunde e desequilibra mentalmente
- Aura de Certeza — Sua confiança debuffa o poder mental do oponente
- Auto-Realização — Golpes mais fortes quando fazem parte da profecia
- Profecia de Batalha — Anuncia o resultado; se acertar, ganha bônus massivo

---

### #67 — Toru — Samurai Digital

| Atributo | Valor |
|----------|------|
| **ID** | `toru_samurai_digital` |
| **Elemental** | Metal / Raio |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #4.800 |
| **Poder Mental** | 84 |
| **Velocidade** | 85 |
| **Resistência** | 72 |
| **Nível Xamânico** | 6 |
| **Fator Caos** | 58 |
| **Energia Base** | 80 |
| **Poder Explosivo** | 82 |

**Arma:** Katana de raio (conduz eletricidade pela lâmina)

**Modo Xamã:** Corte de Relâmpago — Velocidade e dano elétrico combinados num golpe único

**Descrição:** Combina tradição do combate com lâmina com elemental elétrico. Cada corte libera descarga. Estudou Shuntaro e Kim e quer testar se pode vencer os dois ao mesmo tempo.

**Frase Icônica:** *"A lâmina não perdoa. O raio não avisa."*

**Habilidades:**
- Katana de Raio — Corte com descarga elétrica simultânea
- Velocidade de Lâmina — Sequência de cortes em altíssima velocidade
- Escudo de Relâmpago — Corrente elétrica ao redor que deflecte ataques
- Corte de Horizonte — Golpe de longo alcance usando o raio
- Corte de Relâmpago — Golpe final combinando velocidade máxima e eletricidade

---

### #68 — Bea — Sussurro da Arena

| Atributo | Valor |
|----------|------|
| **ID** | `bea_sussurro_arena` |
| **Elemental** | Som / Psíquico |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #7.600 |
| **Poder Mental** | 87 |
| **Velocidade** | 74 |
| **Resistência** | 68 |
| **Nível Xamânico** | 6 |
| **Fator Caos** | 62 |
| **Energia Base** | 80 |
| **Poder Explosivo** | 78 |

**Arma:** Flauta sônica (cria ataques e defesas com som)

**Modo Xamã:** Grito Primordial — Som tão intenso que destrói defesas físicas e mentais

**Descrição:** Musicista de concerto que descobriu que o som é o elemental mais subestimado do LDI. Seus ataques são invisíveis. Seus adversários não entendem o que os está destruindo.

**Frase Icônica:** *"Você não está ouvindo. Por isso está perdendo."*

**Habilidades:**
- Onda Sônica — Ataque invisível de som de alta frequência
- Barreira de Som — Escudo de frequência que absorve impactos
- Infrassom — Frequência que causa desorientação e náusea
- Flauta de Batalha — Controla frequências para múltiplos efeitos
- Grito Primordial — Som que destrói qualquer barreira física ou elemental

---

### #69 — Kal — Armadura Viva

| Atributo | Valor |
|----------|------|
| **ID** | `kal_armadura_viva` |
| **Elemental** | Metal / Terra |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #10.200 |
| **Poder Mental** | 80 |
| **Velocidade** | 68 |
| **Resistência** | 96 |
| **Nível Xamânico** | 5 |
| **Fator Caos** | 40 |
| **Energia Base** | 85 |
| **Poder Explosivo** | 78 |

**Arma:** Armadura que é o próprio corpo (simbiose com o metal)

**Modo Xamã:** Fusão Completa — Armadura cobre todo o corpo, movimentos amplificados

**Descrição:** Cientista que criou uma liga metálica que se funde organicamente com o corpo humano. É simultaneamente o experimento e o experimentador. A Yohu quer comprá-lo. Ele recusa.

**Frase Icônica:** *"Meu corpo é minha armadura. Minha armadura é meu corpo."*

**Habilidades:**
- Armadura Orgânica — Resistência física permanente aumentada
- Regeneração Metálica — Repara danos durante a batalha
- Golpe Blindado — Usa o peso da armadura para ampliar impactos
- Extensão Metálica — Partes da armadura se estendem como armas
- Fusão Completa — Velocidade e força aumentadas, imunidade a dano físico por 15s

---

### #70 — Pip — Ladrão de Tempo

| Atributo | Valor |
|----------|------|
| **ID** | `pip_ladrão_tempo` |
| **Elemental** | Tempo (raro, secundário) |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #3.800 |
| **Poder Mental** | 88 |
| **Velocidade** | 78 |
| **Resistência** | 68 |
| **Nível Xamânico** | 7 |
| **Fator Caos** | 80 |
| **Energia Base** | 78 |
| **Poder Explosivo** | 85 |

**Arma:** Relógio de bolso antigo (arma de manipulação temporal)

**Modo Xamã:** Retrocesso — Volta o tempo da batalha em 10 segundos

**Descrição:** O elemental mais raro do LDI. Manipulação temporal limitada mas devastadora. Cada batalha ele usa uma vez — e geralmente essa uma vez é suficiente para virar completamente.

**Frase Icônica:** *"Você acabou de ganhar. Parabéns. Agora vamos fazer de novo."*

**Habilidades:**
- Pausa de Tempo — Congela o tempo por 3 segundos para o oponente
- Aceleração — Velocidade própria duplica por 8 segundos
- Retrocesso Parcial — Desfaz o último golpe sofrido
- Relógio de Batalha — Controla a duração de buffs e debuffs
- Retrocesso — Volta o estado da batalha inteiro 10 segundos

---

### #71 — Zara — Mestre do Veneno

| Atributo | Valor |
|----------|------|
| **ID** | `zara_veneno_mestre` |
| **Elemental** | Veneno / Terra |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #11.500 |
| **Poder Mental** | 82 |
| **Velocidade** | 76 |
| **Resistência** | 72 |
| **Nível Xamânico** | 5 |
| **Fator Caos** | 55 |
| **Energia Base** | 76 |
| **Poder Explosivo** | 68 |

**Arma:** Adagas envenenadas

**Modo Xamã:** Nuvem Tóxica — Veneno que cobre toda a arena por 30 segundos

**Descrição:** Toxicologista que usa conhecimento científico de venenos no LDI. Cada toque aplica toxina diferente. Batalhas contra ela são de resistência — ela sabe esperar o veneno fazer efeito.

**Frase Icônica:** *"Não preciso vencer a batalha. O veneno já venceu por mim."*

**Habilidades:**
- Adaga Envenenada — Dano contínuo após contato
- Veneno Paralisante — Imobiliza membro tocado progressivamente
- Antídoto — Cura debuffs de veneno próprios e de aliados
- Nuvem de Toxinas — Área de veneno que aplica debuff de dano
- Nuvem Tóxica — Veneno massivo na arena inteira

---

### #72 — Hiro — Escudo Sagrado

| Atributo | Valor |
|----------|------|
| **ID** | `hiro_escudo_sagrado` |
| **Elemental** | Luz / Terra |
| **Tier** | 🟣 Elite |
| **Rank SDR** | #15.500 |
| **Poder Mental** | 81 |
| **Velocidade** | 58 |
| **Resistência** | 95 |
| **Nível Xamânico** | 6 |
| **Fator Caos** | 32 |
| **Energia Base** | 82 |
| **Poder Explosivo** | 60 |

**Arma:** Escudo de Xakaxium (recriado por pesquisa independente)

**Modo Xamã:** Bastião — Cria campo de proteção que cobre todos os aliados

**Descrição:** Arqueólogo que encontrou fragmentos de Xakaxium e recriou parcialmente as propriedades da liga sagrada. Especialista em defesa. Nunca perdeu uma batalha protegendo aliados. Perdeu algumas tentando atacar.

**Frase Icônica:** *"Ninguém passa enquanto eu estiver aqui."*

**Habilidades:**
- Escudo de Xakaxium — Absorve ataques elementais e físicos
- Barreira Sagrada — Campo de proteção ao redor do corpo
- Golpe de Escudo — Bash poderoso com o escudo
- Proteção de Aliado — Redireciona ataques para si mesmo
- Bastião — Campo de proteção que cobre todos os aliados na arena

---

#### 🟢 Free (29 cartas)

### #1 — Kim — Briguento

| Atributo | Valor |
|----------|------|
| **ID** | `kim_briguento` |
| **Elemental** | Trevas (manifestado) / Fogo (nativo) |
| **Tier** | 🟢 Free |
| **Rank SDR** | #1.201 |
| **Poder Mental** | 94 |
| **Velocidade** | 78 |
| **Resistência** | 85 |
| **Nível Xamânico** | 9 |
| **Fator Caos** | 99 |
| **Energia Base** | 70 |
| **Poder Explosivo** | 100 |

**Arma:** Xakixi (machado de duas lâminas — cabo de alta tecnologia com fio de aço retrátil)

**Modo Xamã:** Kim Primordial — Chamas negras, marcações tribais Xakaxi ativas, cabelos prateados

**Descrição:** Descendente Xakaxi portador do Sangue Primordial. Chegou ao rank 1201 na primeira batalha. Mora em casa invadida, vende balas no busão, cuida da mãe. Tem mais poder do que entende. Quando perde o controle, algo muito mais antigo que ele assume o comando.

**Frase Icônica:** *"A única regra da briga de rua? Não há regras."*

**Habilidades:**
- Sangue Primordial — Transformação não controlada que multiplica todos os atributos
- Instinto de Rua — Reflexos treinados por anos de sobrevivência urbana
- Xakixi Xamã — Machado duplo com fio de aço retrátil capaz de cortar ao meio
- Bola de Fogo (elemental nativo) — Poder instantâneo de baixo consumo
- Chamas Negras (elemental manifestado) — Fogo primordial que devora matéria e energia

---

### #2 — Jack — Vitória

| Atributo | Valor |
|----------|------|
| **ID** | `jack_vitoria` |
| **Elemental** | Terra / Pedra |
| **Tier** | 🟢 Free |
| **Rank SDR** | #10.776 |
| **Poder Mental** | 71 |
| **Velocidade** | 88 |
| **Resistência** | 62 |
| **Nível Xamânico** | 5 |
| **Fator Caos** | 82 |
| **Energia Base** | 65 |
| **Poder Explosivo** | 74 |

**Arma:** Vitória (bengala que se transforma em San Tien Kwan — nunchaku de três partes com ponta de lança)

**Modo Xamã:** Vitória Finals — Conjura fragmentos de pedra que se tornam projéteis perfurantes sônicos

**Descrição:** Melhor amigo de Kim desde sempre. Extrovertido, teatral, nunca genuinamente assustado. Combina charme e violência com eficiência desconcertante. Usa qualquer ambiente a seu favor. Treino em 3 etapas — letal quando completo, vulnerável durante o carregamento.

**Frase Icônica:** *"Se não me conheces ainda… hoje é briga fácil!"*

**Habilidades:**
- First Move / Second Move / Third Move — Técnica de carregamento em 3 estágios
- Vitória Finals — Chuva de lâminas de pedra em alta velocidade sônica
- Controle de Corrente — Imobiliza e arremessa oponentes com correntes e fios
- Leitura de Campo — Analisa o ambiente para criar armadilhas e vantagens
- Charme de Distração — Usa conversa e teatralidade para criar aberturas reais

---

### #3 — Nina — Angel

| Atributo | Valor |
|----------|------|
| **ID** | `nina_angel` |
| **Elemental** | Luz |
| **Tier** | 🟢 Free |
| **Rank SDR** | #8.724 |
| **Poder Mental** | 76 |
| **Velocidade** | 85 |
| **Resistência** | 79 |
| **Nível Xamânico** | 4 |
| **Fator Caos** | 61 |
| **Energia Base** | 72 |
| **Poder Explosivo** | 68 |

**Arma:** Angel (katana que se fragmenta em chicote de lâminas segmentadas)

**Modo Xamã:** Angel Luminus Blade — Lâmina carregada com luz capaz de cortar energia e matéria

**Descrição:** Muay Thai e katana desde os 12 anos no circuito profissional. Passou anos fora de Bravara. Quando fala, muda a cena. Competitiva ao extremo — prefere morrer a pedir ajuda numa briga.

**Frase Icônica:** *"Para me deixar satisfeita, vocês precisam fazer muito mais."*

**Habilidades:**
- Angel Expandir — Estende a lâmina em até 3 metros como chicote segmentado
- Angel Enrijecer — Transforma o chicote em lâmina rígida de alto impacto
- Luminus Blade — Carrega a Angel com energia de luz para corte devastador
- Golpe de Silêncio — Aproximação furtiva, sem som de passos
- Combinação Muay Thai + Arma — Transições fluidas entre combate corpo a corpo e arma

---

### #4 — Thunderbolt — Trovão

| Atributo | Valor |
|----------|------|
| **ID** | `thunderbolt_trovao` |
| **Elemental** | Eletricidade (secundário da Luz) |
| **Tier** | 🟢 Free |
| **Rank SDR** | #30.156 |
| **Poder Mental** | 68 |
| **Velocidade** | 91 |
| **Resistência** | 70 |
| **Nível Xamânico** | 2 |
| **Fator Caos** | 45 |
| **Energia Base** | 60 |
| **Poder Explosivo** | 55 |

**Arma:** Bastão elétrico (crepita com descargas de alta voltagem)

**Modo Xamã:** Raio Celeste — Corpo envolto em aura elétrica azul, velocidade aumentada

**Descrição:** Bruno Ribeiro. 1.201 vitórias antes de encontrar Kim. Arrogante, metódico, cruel nos combates. Usa humilhação como estratégia psicológica. Pagou capangas para perseguir Kim no colégio — não deu certo.

**Frase Icônica:** *"Ajoelhado, chorando e implorando. Só então eu termino."*

**Habilidades:**
- Multiple Water Balls — Descarga elétrica múltipla em trajetória variável
- Raio Celeste — Explosão de velocidade que transforma o corpo num borrão
- Descarga Paralisante — Corrente elétrica que causa espasmos musculares
- Teleporte Tático — Desaparece e reaparece em ponto estratégico
- Lista de Tarefas — Usa a IA NeoGuide para anunciar rituais de humilhação em batalha

---

### #5 — Shuntaro — Rei Xamã

| Atributo | Valor |
|----------|------|
| **ID** | `shuntaro_rei_xama` |
| **Elemental** | Água |
| **Tier** | 🟢 Free |
| **Rank SDR** | #998 |
| **Poder Mental** | 83 |
| **Velocidade** | 87 |
| **Resistência** | 74 |
| **Nível Xamânico** | 7 |
| **Fator Caos** | 68 |
| **Energia Base** | 78 |
| **Poder Explosivo** | 72 |

**Arma:** Rei (ioiôs múltiplos de água — até 10 simultâneos com fios de corte)

**Modo Xamã:** Rei Xamã — Serra gigante no braço direito usada como escudo e lança

**Descrição:** Rank 998. De Azuma. Viajou 9 horas para desafiar Kim pessoalmente. Estratégico, elegante, respeita oponentes fortes. 6 meses no jogo e já está entre os mil melhores do mundo.

**Frase Icônica:** *"Prepare-se. Não vim de tão longe para perder."*

**Habilidades:**
- Multiple Water Balls — Ioiôs envoltos em água sônica com mudança de trajetória
- Fatal Slices — 10 ioiôs simultâneos com lâminas serrilhadas, alcance 5 metros
- Dodge — Comando que muda a trajetória do ioiô no último instante
- Tie — Fio de ioiô prende pescoço e membros do oponente
- Rei Xamã — Serra gigante no braço para defesa e ataque simultâneos

---

### #14 — Helena — A Sobrevivente

| Atributo | Valor |
|----------|------|
| **ID** | `helena_sobrevivente` |
| **Elemental** | Nenhum |
| **Tier** | 🟢 Free |
| **Rank SDR** | #999.999 |
| **Poder Mental** | 55 |
| **Velocidade** | 45 |
| **Resistência** | 90 |
| **Nível Xamânico** | 0 |
| **Fator Caos** | 88 |
| **Energia Base** | 30 |
| **Poder Explosivo** | 20 |

**Arma:** Garrafa (improviso urbano)

**Modo Xamã:** Nenhum

**Descrição:** Mãe de Kim — ou melhor, a mulher que o salvou quando tinha 12 anos e ele era um bebê. Sobreviveu ao que não devia e criou Kim sozinha a partir do nada. Troubled, complexa, alcoólatra. Mas na hora que importou, não abandonou.

**Frase Icônica:** *"Aos 18 você não vai precisar mais de mim. E eu finalmente posso me livrar de você."*

**Habilidades:**
- Sobrevivência Bruta — Resistência passiva a danos que matariam qualquer outro
- Arremesso de Latinha — Reflexos de autodefesa imprevisíveis
- Explosão de Raiva — Dano aumentado quando insultos são desferidos
- Âncora Emocional — Ao ser chamada de 'mãe', recupera energia mental
- Historia de Dor — Qualquer oponente que ouvir sua história perde 30% de força mental

---

### #15 — Osvaldo — O Porteiro

| Atributo | Valor |
|----------|------|
| **ID** | `osvaldo_porteiro` |
| **Elemental** | Terra |
| **Tier** | 🟢 Free |
| **Rank SDR** | #750.000 |
| **Poder Mental** | 70 |
| **Velocidade** | 40 |
| **Resistência** | 65 |
| **Nível Xamânico** | 3 |
| **Fator Caos** | 25 |
| **Energia Base** | 55 |
| **Poder Explosivo** | 35 |

**Arma:** Violão (a música como arma espiritual)

**Modo Xamã:** Melodia Ancestral — Som que acalma qualquer estado de fúria ou medo

**Descrição:** Porteiro da academia de elite. Ensinou Kim a tocar violão por três anos. Usou sua influência para garantir bolsa de 50% para Kim e Jack. Viu potencial onde todos viam problema.

**Frase Icônica:** *"Entrem logo, antes que o diretor me pegue."*

**Habilidades:**
- Mentor — Aliados treinados por ele ganham +15% em poder mental
- Conexão com a Terra — Sente movimentos e vibrações ao redor
- Melodia de Cura — Música que restaura energia mental de aliados
- Rede de Contatos — Consegue recursos e informações em qualquer situação
- Leitura de Caráter — Identifica imediatamente intenções de qualquer pessoa

---

### #16 — Ryan — O Grato

| Atributo | Valor |
|----------|------|
| **ID** | `ryan_grato` |
| **Elemental** | Água |
| **Tier** | 🟢 Free |
| **Rank SDR** | #500.000 |
| **Poder Mental** | 52 |
| **Velocidade** | 44 |
| **Resistência** | 48 |
| **Nível Xamânico** | 1 |
| **Fator Caos** | 30 |
| **Energia Base** | 40 |
| **Poder Explosivo** | 45 |

**Arma:** SBI Edição Limitada (presenteou Kim com um aparelho de 60-70 mil)

**Modo Xamã:** Investidor Tático — Aposta nos azarões e recebe retorno multiplicado

**Descrição:** Aluno da academia elite. Era espancado todo dia por valentões até Kim intervir. Assistiu ao vídeo de Kim no LDI, reconheceu o rosto e presenteou com um SBI de edição limitada como investimento e agradecimento.

**Frase Icônica:** *"Suas lutas são realmente muito boas. Seria um desperdício não vermos mais."*

**Habilidades:**
- Coragem Aprendida — Após ser ajudado, ganha coragem para revidar
- Primeiro Chute — Golpe surpresa quando o oponente subestima
- Apoiador Financeiro — Aposta alta em aliados, buffa seus ganhos de pontos
- Água Calma — Defesa passiva que absorve impactos menores
- Gratidão Sincera — Ativa buffs em aliados que o protegeram anteriormente

---

### #17 — Samuel — O Valentão

| Atributo | Valor |
|----------|------|
| **ID** | `samuel_valentao` |
| **Elemental** | Nenhum |
| **Tier** | 🟢 Free |
| **Rank SDR** | #900.000 |
| **Poder Mental** | 38 |
| **Velocidade** | 50 |
| **Resistência** | 60 |
| **Nível Xamânico** | 0 |
| **Fator Caos** | 35 |
| **Energia Base** | 45 |
| **Poder Explosivo** | 40 |

**Arma:** Força bruta e número de capangas

**Modo Xamã:** Nenhum

**Descrição:** Aluno da academia elite. Usava o status da família para intimidar os mais fracos. Exigiu que Ryan comprasse coisas pra ele. Foi processado por Kim e Jack após trazer capangas externos à escola.

**Frase Icônica:** *"Você e seu amiguinho se acham muito espertos na escola."*

**Habilidades:**
- Capangas Alugados — Chama reforços externos quando perde
- Status Financeiro — Intimidação passiva contra oponentes sem recursos
- Golpe Sujo — Ataque com arma improvisada pelas costas
- Negação Total — Nega tudo mesmo com provas gravadas
- Fuga Estratégica — Desaparece quando a situação fica perigosa

---

### #18 — Roxy — A Mercenária

| Atributo | Valor |
|----------|------|
| **ID** | `roxy_mercenaria` |
| **Elemental** | Fogo |
| **Tier** | 🟢 Free |
| **Rank SDR** | #200.000 |
| **Poder Mental** | 65 |
| **Velocidade** | 74 |
| **Resistência** | 71 |
| **Nível Xamânico** | 0 |
| **Fator Caos** | 77 |
| **Energia Base** | 60 |
| **Poder Explosivo** | 58 |

**Arma:** Socos ingleses com pontas afiadas

**Modo Xamã:** Contrato de Sangue — Ficou mais forte quanto maior for a recompensa prometida

**Descrição:** Líder de um grupo de mercenários urbanos. Foi contratada para fotografar a surra que dariam em Kim e Jack no parque. Pequena, tatuada, olhar ameaçador. Reconheceu que Kim era uma força da natureza e parou de tentar.

**Frase Icônica:** *"Eu adoro dar surras. Mas adoro ainda mais quando sou paga pra isso."*

**Habilidades:**
- Socos Ingleses — Dano perfurante que ignora parte da resistência
- Tática de Grupo — Bônus quando tem aliados em campo
- Leitura de Combate — Aprende o padrão do oponente após 3 trocas
- Contrato Fechado — Não recua enquanto a missão estiver ativa
- Respeito Forçado — Após ser derrotada, reconhece a força do oponente sem rancor

---

### #19 — Brock — Capanga Líder

| Atributo | Valor |
|----------|------|
| **ID** | `brock_lider_capanga` |
| **Elemental** | Nenhum |
| **Tier** | 🟢 Free |
| **Rank SDR** | #400.000 |
| **Poder Mental** | 55 |
| **Velocidade** | 62 |
| **Resistência** | 78 |
| **Nível Xamânico** | 0 |
| **Fator Caos** | 48 |
| **Energia Base** | 55 |
| **Poder Explosivo** | 50 |

**Arma:** Jaqueta de couro com mãos calejadas

**Modo Xamã:** Nenhum

**Descrição:** Líder do grupo de capangas contratados por Thunderbolt. Alto, musculoso, tatuagens que contam histórias de violência. Tratou o trabalho com profissionalismo até ser dobrado numa mesa em 3 segundos.

**Frase Icônica:** *"Vocês tiveram sorte. Nossos movimentos pegaram a gente de surpresa."*

**Habilidades:**
- Presença Intimidadora — Reduz a confiança de oponentes inexperientes
- Soco Pesado — Dano bruto alto com pouca técnica
- Liderança de Grupo — Coordena 5 aliados simultaneamente
- Resistência Física — Aguenta muito mais golpes que o esperado
- Avaliação Rápida — Reconhece quando está em desvantagem e ajusta

---

### #20 — Walter — O Diretor

| Atributo | Valor |
|----------|------|
| **ID** | `walter_diretor` |
| **Elemental** | Nenhum |
| **Tier** | 🟢 Free |
| **Rank SDR** | #999.999 |
| **Poder Mental** | 48 |
| **Velocidade** | 30 |
| **Resistência** | 55 |
| **Nível Xamânico** | 0 |
| **Fator Caos** | 20 |
| **Energia Base** | 35 |
| **Poder Explosivo** | 15 |

**Arma:** Autoridade institucional

**Modo Xamã:** Nenhum

**Descrição:** Diretor da academia elite. Tenta manter a ordem numa escola cheia de conflitos. Ameaça Kim e Jack com a bolsa periodicamente. Nunca consegue provas suficientes para agir.

**Frase Icônica:** *"Tomem cuidado. Muito cuidado para não perder suas bolsas."*

**Habilidades:**
- Autoridade Formal — Pode expulsar ou suspender jogadores de arenas reguladas
- Pressão Institucional — Debuff de confiança em aliados com bolsa ou patrocínio
- Burocracia — Atrasa ações de oponentes com processos e protocolos
- Convocação — Chama reforços institucionais com atraso
- Ameaça Vazia — 80% de chance de não cumprir o que promete

---

### #21 — A Máquina — Professor

| Atributo | Valor |
|----------|------|
| **ID** | `a_maquina_professor` |
| **Elemental** | Nenhum |
| **Tier** | 🟢 Free |
| **Rank SDR** | #999.999 |
| **Poder Mental** | 92 |
| **Velocidade** | 35 |
| **Resistência** | 70 |
| **Nível Xamânico** | 0 |
| **Fator Caos** | 10 |
| **Energia Base** | 85 |
| **Poder Explosivo** | 20 |

**Arma:** Conhecimento puro

**Modo Xamã:** Nenhum

**Descrição:** Professor de matemática da academia elite. Escreve equações no ar com a caneta. Nunca sorri — exceto uma vez, imperceptível, quando Nina detonou Jack. Considerado um dos únicos escolhidos para lecionar na instituição.

**Frase Icônica:** *"Bom dia."*

**Habilidades:**
- Cálculo Instantâneo — Prevê trajetórias e resultados de ataques em milissegundos
- Equação de Campo — Cria desvantagens matemáticas para o oponente
- Impassibilidade — Imune a intimidação e manipulação emocional
- Análise de Fraqueza — Identifica o ponto mais fraco do oponente em 3 turnos
- Mecânico — Executa movimentos com precisão milimétrica sem desperdício de energia

---

### #25 — Alex — Precisão de Draymoor

| Atributo | Valor |
|----------|------|
| **ID** | `alex_draymoor` |
| **Elemental** | Ar |
| **Tier** | 🟢 Free |
| **Rank SDR** | #15.000 |
| **Poder Mental** | 77 |
| **Velocidade** | 80 |
| **Resistência** | 68 |
| **Nível Xamânico** | 4 |
| **Fator Caos** | 42 |
| **Energia Base** | 72 |
| **Poder Explosivo** | 65 |

**Arma:** Chicote de névoa industrial

**Modo Xamã:** Névoa de Draymoor — Campo visual bloqueado, ataca de dentro da névoa

**Descrição:** Assistiu ao vídeo de Kim num flat vitoriano em Draymoor com chuva perpétua ao fundo. Treinou pelo método das fábricas têxteis — disciplina e precisão acima de tudo. Raramente erra.

**Frase Icônica:** *"Kim luta com a precisão de um artista pintando com violência controlada."*

**Habilidades:**
- Chicote de Névoa — Ataque de longo alcance com visibilidade reduzida
- Campo de Névoa — Área de visibilidade zero para o oponente
- Precisão Absoluta — Ataques dentro da névoa sempre acertam pontos vitais
- Disciplina Industrial — Não perde concentração sob pressão ou provocação
- Golpe do Trabalhador — Dano aumentado quando o oponente subestima

---

### #26 — Mia — Amazona de Thessor

| Atributo | Valor |
|----------|------|
| **ID** | `mia_thessor` |
| **Elemental** | Terra |
| **Tier** | 🟢 Free |
| **Rank SDR** | #999.999 |
| **Poder Mental** | 78 |
| **Velocidade** | 70 |
| **Resistência** | 75 |
| **Nível Xamânico** | 3 |
| **Fator Caos** | 60 |
| **Energia Base** | 65 |
| **Poder Explosivo** | 82 |

**Arma:** Escudo e lança (inspirados na tradição de Thessor)

**Modo Xamã:** Olímpia — Invoca poder dos deuses ancestrais de sua terra

**Descrição:** Tinha 9 anos quando assistiu ao vídeo de Kim. Não pode jogar LDI ainda. Desenhou Kim em papiro especial. Quando crescer, virá para o jogo como uma tempestade.

**Frase Icônica:** *"Vou chegar ao Olimpo digital."*

**Habilidades:**
- Inspiração Jovem — Aumenta poder de aliados mais jovens ou iniciantes
- Escudo Ancestral — Bloqueio que devolve parte do dano
- Lança de Thessor — Perfura defesas elementais com técnica clássica
- Potencial Oculto — A cada batalha, desbloqueia um novo poder
- Olímpia — Power final devastador de uso único por batalha

---

### #27 — Jaret — Veterano de Wendor

| Atributo | Valor |
|----------|------|
| **ID** | `jaret_wendor` |
| **Elemental** | Gelo |
| **Tier** | 🟢 Free |
| **Rank SDR** | #45.000 |
| **Poder Mental** | 80 |
| **Velocidade** | 55 |
| **Resistência** | 92 |
| **Nível Xamânico** | 6 |
| **Fator Caos** | 38 |
| **Energia Base** | 82 |
| **Poder Explosivo** | 75 |

**Arma:** Machado de guerra (veterano aposentado)

**Modo Xamã:** Urso do Norte — Forma aumentada, força e resistência triplicadas

**Descrição:** Veterano aposentado de Wendor. Menos 15 graus lá fora, caneca de café, camisa flanelada vermelha. Achava que seus dias de glória tinham passado. Kim reacendeu a chama.

**Frase Icônica:** *"Talvez ainda haja luta neste velho urso."*

**Habilidades:**
- Resistência de Guerra — Aguenta dano que seria fatal para qualquer outro
- Machado de Veterano — Dano bruto altíssimo com técnica militar
- Gelo do Norte — Congela membros do oponente no contato
- Experiência de Campo — Imune a táticas que já enfrentou antes
- Urso do Norte — Transforma-se, dobrando tamanho e força

---

### #29 — Isabella — Furor de Erendale

| Atributo | Valor |
|----------|------|
| **ID** | `isabella_erendale` |
| **Elemental** | Raio |
| **Tier** | 🟢 Free |
| **Rank SDR** | #12.000 |
| **Poder Mental** | 79 |
| **Velocidade** | 93 |
| **Resistência** | 60 |
| **Nível Xamânico** | 3 |
| **Fator Caos** | 70 |
| **Energia Base** | 68 |
| **Poder Explosivo** | 80 |

**Arma:** Teclado mecânico custom (traduzido como arma de precisão no LDI)

**Modo Xamã:** Fúria K-Pop — Velocidade de ataque que cria ilusão de múltiplas cópias

**Descrição:** Tres anos de hagwon especializado em gaming. Centenas de vitórias. Viu Kim e sentiu inveja pura. Quer destruí-lo em batalha mais do que qualquer coisa. Redes sociais com nail art e skincare de 10 passos.

**Frase Icônica:** *"Oppa, vou destruí-lo."*

**Habilidades:**
- Velocidade K-Pop — O mais rápido ataque do jogo, dificílimo de seguir
- Raio de Precisão — Acerta pontos fracos específicos com choque elétrico
- Fúria K-Pop — Sequência de ataques tão rápida que parece multiplicação
- Análise de Metas — Depois de 3 turnos, aumenta dano em 40%
- Persistência Obsessiva — Quanto mais perdas acumula, mais forte fica

---

### #30 — Tira — Estrategista de Valetis

| Atributo | Valor |
|----------|------|
| **ID** | `tira_valetis` |
| **Elemental** | Gelo |
| **Tier** | 🟢 Free |
| **Rank SDR** | #28.000 |
| **Poder Mental** | 86 |
| **Velocidade** | 65 |
| **Resistência** | 74 |
| **Nível Xamânico** | 5 |
| **Fator Caos** | 30 |
| **Energia Base** | 76 |
| **Poder Explosivo** | 68 |

**Arma:** Fios de gelo (extende e controla cristais de gelo como chicotes e barreiras)

**Modo Xamã:** Lagom — Estado de equilíbrio perfeito entre ataque e defesa

**Descrição:** Dona de casa de Valetis. Faz almôndegas suecas. Planeja batalhas com a mesma precisão que organiza móveis modulares. Estrategista nata que os oponentes jamais levam a sério — até ser tarde.

**Frase Icônica:** *"Nem muito, nem pouco. Exatamente o necessário para a vitória."*

**Habilidades:**
- Fios de Gelo — Controla até 12 fios de gelo simultaneamente
- Lagom — Equilíbrio perfeito que anula bônus por excesso de força ou velocidade
- Barreira Nórdica — Muro de gelo que absorve qualquer ataque elemental
- Estratégia de Mobília — Reposiciona o campo de batalha ao seu favor
- Paciência Escandinava — Não reage por 3 turnos mas o 4º é sempre decisivo

---

### #38 — Sena — Vento Livre

| Atributo | Valor |
|----------|------|
| **ID** | `sena_vento_livre` |
| **Elemental** | Ar |
| **Tier** | 🟢 Free |
| **Rank SDR** | #18.000 |
| **Poder Mental** | 74 |
| **Velocidade** | 91 |
| **Resistência** | 62 |
| **Nível Xamânico** | 4 |
| **Fator Caos** | 80 |
| **Energia Base** | 70 |
| **Poder Explosivo** | 73 |

**Arma:** Nenhuma (usa apenas o corpo e o ar)

**Modo Xamã:** Furacão Interior — Corpo cria furacão local que afasta e corta

**Descrição:** Lutadora nômade que nunca ficou em lugar nenhum tempo suficiente para criar raízes. Como Nina, mas mais velha e mais amarga. Fascinada por Kim por razões que não consegue articular.

**Frase Icônica:** *"Nada me prende. Nem você, nem esse jogo."*

**Habilidades:**
- Deslocamento de Vento — Move-se a velocidades que tornam difícil de mirar
- Golpe de Ar — Onda de ar comprimido que empurra e desequilibra
- Furacão Interior — Cria zona de ventos que afastam projéteis e oponentes
- Leitura do Ar — Sente movimentos antes de acontecerem pelas vibrações
- Tempestade Pessoal — Versão menor do furacão, centrada no corpo

---

### #41 — Brenda — Furacão

| Atributo | Valor |
|----------|------|
| **ID** | `brenda_furacao` |
| **Elemental** | Fogo e Vento |
| **Tier** | 🟢 Free |
| **Rank SDR** | #35.000 |
| **Poder Mental** | 68 |
| **Velocidade** | 85 |
| **Resistência** | 70 |
| **Nível Xamânico** | 4 |
| **Fator Caos** | 97 |
| **Energia Base** | 65 |
| **Poder Explosivo** | 82 |

**Arma:** Chicote de fogo

**Modo Xamã:** Furacão de Fogo — Combina fogo e vento num redemoinho devastador

**Descrição:** Começa cada batalha rindo. Termina cada batalha rindo. O que acontece no meio é o que preocupa os oponentes. Caótica, imprevisível, absurdamente efetiva.

**Frase Icônica:** *"Isso é divertido! Pode vir com tudo!"*

**Habilidades:**
- Chicote de Fogo — Alcance longo com dano de queimadura
- Caos em Batalha — Ações aleatórias que são impossíveis de prever
- Riso de Combate — Provoca o oponente a errar de raiva
- Furacão de Fogo — Redemoinho de chamas e vento numa área
- Explosão Caótica — Libera energia de forma completamente aleatória

---

### #44 — Rex — Fera Urbana

| Atributo | Valor |
|----------|------|
| **ID** | `rex_fera_urbana` |
| **Elemental** | Fogo |
| **Tier** | 🟢 Free |
| **Rank SDR** | #55.000 |
| **Poder Mental** | 62 |
| **Velocidade** | 78 |
| **Resistência** | 82 |
| **Nível Xamânico** | 2 |
| **Fator Caos** | 85 |
| **Energia Base** | 58 |
| **Poder Explosivo** | 77 |

**Arma:** Corrente de metal enrolada no braço

**Modo Xamã:** Instinto Animal — Abandona técnica e luta por puro instinto amplificado

**Descrição:** Cresceu nas ruas mais duras. Nunca estudou técnica — aprendeu sobrevivendo. Faz Kim lembrar de si mesmo. Mas diferente de Kim, nunca teve um Jack ao lado.

**Frase Icônica:** *"Técnica é pra quem nunca precisou de verdade."*

**Habilidades:**
- Corrente Urbana — Imobiliza e arremessa com corrente de metal
- Instinto de Rua — Reflexos de sobrevivência que ignoram intimidação
- Fogo de Raiva — Quanto mais dano leva, mais forte fica
- Improviso — Usa qualquer objeto do ambiente como arma
- Instinto Animal — Abandona técnica, ganha velocidade e força puras

---

### #46 — Ozzy — Trovão da Rua

| Atributo | Valor |
|----------|------|
| **ID** | `ozzy_trovao_da_rua` |
| **Elemental** | Eletricidade |
| **Tier** | 🟢 Free |
| **Rank SDR** | #42.000 |
| **Poder Mental** | 61 |
| **Velocidade** | 72 |
| **Resistência** | 75 |
| **Nível Xamânico** | 3 |
| **Fator Caos** | 65 |
| **Energia Base** | 60 |
| **Poder Explosivo** | 78 |

**Arma:** Nenhuma (conduz eletricidade pelo próprio corpo)

**Modo Xamã:** Descarga Total — Todo o corpo libera eletricidade numa explosão radial

**Descrição:** Mecânico elétrico que levou um choque no trabalho e descobriu afinidade com eletricidade no LDI. Não tem elegância nem estratégia. Tem volume de dano bruto que deixa qualquer oponente esgotado.

**Frase Icônica:** *"Fio descascado. Simples assim."*

**Habilidades:**
- Condução Corporal — Corpo conduz eletricidade que danifica no contato
- Descarga de Contato — Toque que causa choque paralisante
- Sobrecarga — Acumula eletricidade até explodir
- Fio Condutor — Usa metal do ambiente para ampliar ataques
- Descarga Total — Explosão radial de eletricidade

---

### #49 — Tank — A Fortaleza

| Atributo | Valor |
|----------|------|
| **ID** | `tank_fortaleza` |
| **Elemental** | Terra |
| **Tier** | 🟢 Free |
| **Rank SDR** | #38.000 |
| **Poder Mental** | 60 |
| **Velocidade** | 30 |
| **Resistência** | 100 |
| **Nível Xamânico** | 2 |
| **Fator Caos** | 22 |
| **Energia Base** | 85 |
| **Poder Explosivo** | 55 |

**Arma:** Escudo imenso e maça (improviso de guerra)

**Modo Xamã:** Fortaleza Viva — Torna-se imóvel mas completamente imune a qualquer ataque

**Descrição:** O maior lutador registrado do LDI. 2,20m. 180kg. Lento. Impossível de derrubar. Costuma vencer simplesmente absorvendo tudo e então dar um único golpe.

**Frase Icônica:** *"Pode bater. Todo mundo bate. Ninguém derruba."*

**Habilidades:**
- Muralha — Absorve qualquer ataque físico sem dano
- Golpe Único — Um soco que derruba qualquer oponente sem defesa adequada
- Resistência Absoluta — 60% de redução em todo dano elemental
- Intimidação Passiva — Reduz confiança de oponentes menores
- Fortaleza Viva — Por 20 segundos, imune a absolutamente tudo

---

### #53 — Vera — Lama de Guerra

| Atributo | Valor |
|----------|------|
| **ID** | `vera_lama_de_guerra` |
| **Elemental** | Terra / Água |
| **Tier** | 🟢 Free |
| **Rank SDR** | #48.000 |
| **Poder Mental** | 65 |
| **Velocidade** | 68 |
| **Resistência** | 85 |
| **Nível Xamânico** | 3 |
| **Fator Caos** | 60 |
| **Energia Base** | 72 |
| **Poder Explosivo** | 65 |

**Arma:** Duas mãos cobertas de lama solidificada

**Modo Xamã:** Pântano Vivo — Transforma o campo de batalha inteiro em lama que prende

**Descrição:** Ex-triatleta que encontrou o LDI como competição mais interessante que maratonas. Resiliente, suja, imprevisível. Não tem postura elegante. Tem resultado.

**Frase Icônica:** *"Lama não tem forma. Lama não tem fraqueza."*

**Habilidades:**
- Mãos de Lama — Golpes que aderem e reduzem velocidade do oponente
- Barreira de Lama — Absorve ataques elementais convertendo em mais lama
- Rasteira de Lama — Cria poça que desequilibra ao pisar
- Resistência de Barro — Ignora uma parte do dano físico
- Pântano Vivo — Arena inteira vira lama por 15 segundos

---

### #60 — Berto — O Monstro Calmo

| Atributo | Valor |
|----------|------|
| **ID** | `berto_monstro_calmo` |
| **Elemental** | Terra |
| **Tier** | 🟢 Free |
| **Rank SDR** | #52.000 |
| **Poder Mental** | 70 |
| **Velocidade** | 55 |
| **Resistência** | 90 |
| **Nível Xamânico** | 3 |
| **Fator Caos** | 38 |
| **Energia Base** | 78 |
| **Poder Explosivo** | 88 |

**Arma:** Tronco de árvore (improviso pesado)

**Modo Xamã:** Raiva Controlada — Canaliza toda emoção reprimida em força pura

**Descrição:** Parece tranquilo. É tranquilo. Mas quando finalmente reage, é devastador. A versão LDI do conceito de 'não provoque quem não está nervoso'. Tem 9.823 vitórias sem nunca ter gritado.

**Frase Icônica:** *"Eu não estou irritado. Mas você deveria ir embora mesmo assim."*

**Habilidades:**
- Golpe de Tronco — Dano bruto massivo de área
- Calma Absoluta — Imune a provocação e manipulação mental
- Acúmulo Silencioso — A cada turno sem atacar, acumula poder
- Resposta Tardia — O primeiro golpe sempre surpreende pela força
- Raiva Controlada — Libera poder acumulado em explosão de força

---

### #61 — Yuki — Vento Frio

| Atributo | Valor |
|----------|------|
| **ID** | `yuki_vento_frio` |
| **Elemental** | Gelo / Ar |
| **Tier** | 🟢 Free |
| **Rank SDR** | #48.000 |
| **Poder Mental** | 72 |
| **Velocidade** | 80 |
| **Resistência** | 66 |
| **Nível Xamânico** | 4 |
| **Fator Caos** | 50 |
| **Energia Base** | 68 |
| **Poder Explosivo** | 72 |

**Arma:** Leque de neve (controla temperatura e vento)

**Modo Xamã:** Blizzard — Tempestade de neve e gelo que reduz visibilidade a zero

**Descrição:** Estudante universitária que joga LDI nas madrugadas. Quieta nas aulas, devastadora nas arenas. Seus professores não sabem que ela está entre os 50 mil melhores do mundo.

**Frase Icônica:** *"Eu pareço fria. Eu sou mais fria do que pareço."*

**Habilidades:**
- Leque de Neve — Controla temperatura e correntes de ar
- Cristais de Gelo — Projéteis de gelo em múltiplas direções
- Vento Cortante — Rajada que reduz velocidade do oponente
- Piso de Gelo — Cobre a arena de gelo escorregadio
- Blizzard — Tempestade que anula visão e reduz velocidade de todos

---

### #62 — Cris — Trovão Urbano

| Atributo | Valor |
|----------|------|
| **ID** | `cris_trovao_urbano` |
| **Elemental** | Eletricidade |
| **Tier** | 🟢 Free |
| **Rank SDR** | #85.000 |
| **Poder Mental** | 60 |
| **Velocidade** | 76 |
| **Resistência** | 70 |
| **Nível Xamânico** | 2 |
| **Fator Caos** | 72 |
| **Energia Base** | 58 |
| **Poder Explosivo** | 68 |

**Arma:** Bastão elétrico improvisado

**Modo Xamã:** Sobretensão — Corrente elétrica percorre todo ambiente metálico da arena

**Descrição:** Mora no mesmo tipo de bairro que Kim. Entrou no LDI como saída financeira. Ainda não descobriu os sistemas de monetização mas já está quase lá.

**Frase Icônica:** *"A rua ensinou mais que qualquer academia."*

**Habilidades:**
- Descarga Elétrica — Golpe com choque paralisante
- Condução Metálica — Usa metal do ambiente para ampliar ataques
- Reflexos Urbanos — Esquiva-se de ataques pelo instinto
- Sobretensão — Eletrifica todo metal na arena
- Adaptação Rápida — Aprende o estilo do oponente mais rápido que a maioria

---

### #65 — Mari — Capoeira de Fogo

| Atributo | Valor |
|----------|------|
| **ID** | `mari_capoeira_fogo` |
| **Elemental** | Fogo |
| **Tier** | 🟢 Free |
| **Rank SDR** | #39.000 |
| **Poder Mental** | 70 |
| **Velocidade** | 88 |
| **Resistência** | 66 |
| **Nível Xamânico** | 4 |
| **Fator Caos** | 76 |
| **Energia Base** | 68 |
| **Poder Explosivo** | 75 |

**Arma:** Corpo (capoeira como arma elemental)

**Modo Xamã:** Ginga do Fogo — Corpo envolto em chamas, cada ginga é um ataque

**Descrição:** Mestre de capoeira que descobriu que seu elemental fogo se integra perfeitamente ao estilo. Dança. Ataca. A diferença entre os dois é imperceptível até você estar no chão.

**Frase Icônica:** *"Capoeira não tem defesa. Capoeira não tem ataque. Tem a ginga."*

**Habilidades:**
- Ginga Elemental — Movimentos que desviam e atacam simultaneamente
- Au de Fogo — Esquiva giratória que emite chamas
- Meia Lua Flamejante — Chute em arco com rastro de fogo
- Ritmo de Batalha — Velocidade aumenta quanto mais tempo luta
- Ginga do Fogo — Corpo em chamas, cada movimento é dano

---

### #73 — São — Corredor do Vento

| Atributo | Valor |
|----------|------|
| **ID** | `sao_corredor_vento` |
| **Elemental** | Ar |
| **Tier** | 🟢 Free |
| **Rank SDR** | #62.000 |
| **Poder Mental** | 65 |
| **Velocidade** | 96 |
| **Resistência** | 80 |
| **Nível Xamânico** | 3 |
| **Fator Caos** | 50 |
| **Energia Base** | 88 |
| **Poder Explosivo** | 58 |

**Arma:** Nenhuma (usa velocidade e vento como único ataque e defesa)

**Modo Xamã:** Vácuo — Cria zona sem ar que sufoca e paralisa

**Descrição:** Maratonista olímpico que entrou no LDI. Nunca para de se mover. Batalhas contra ele são de exaustão — ele simplesmente cansa todos os outros.

**Frase Icônica:** *"Nunca parei em 42 quilômetros. Por que pararia aqui?"*

**Habilidades:**
- Velocidade Perpétua — Não perde velocidade com o tempo, ao contrário
- Golpe de Corrida — Dano baseado na velocidade acumulada
- Esquiva Contínua — Move-se constantemente, difícil de mirar
- Exaustão — Oponentes ficam mais lentos quanto mais tempo lutam com ele
- Vácuo — Cria zona sem ar que sufoca e paralisa

---


