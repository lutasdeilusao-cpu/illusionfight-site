# Temporada 1 — o que falta (por prazo)

Fonte: `src/data/season-one-schedule.js` (datas reais de cada item) cruzado com o que existe no projeto.
Prazo = a data do ASSINANTE (o primeiro a receber). Conta grátis e público recebem depois, o mesmo conteúdo.
✅ pronto · 🟡 parcial · ❌ não existe · ❓ decisão do Isaias

## P0 — Lançamento 15/11/2026
| Item | Estado | Falta |
|---|---|---|
| Livro caps 1–2 (15/11) | ✅ pt/en/es | — |
| WEB SHARD 01 (15/11) | ✅ 54 págs pt/en/es | — |
| Música 1 — abertura "Lutas de Ilusão" | ✅ | — |
| Jogo: Super Trunfo | ✅ | — |
| Jogo: LDI Gangues | 🟡 | retratos de 365 inimigos (na fila do Codex, 16 grades); revisar os 7 bairros jogando |
| Jogo: Lendas do LDI | 🟡 | **texto da história só em pt** (4 atos) — falta EN/ES (o site é inglês primeiro); sistema de progressão (adiado); conferir artes refeitas |

## P1 — até o 1º hiato (dez/2026 – fev/2027)
| Data | Item | Estado | Falta |
|---|---|---|---|
| 30/11 – 15/01 | Livro caps 3–6 | ✅ pt/en/es | — |
| 15/12, 15/01 | WEB SHARD 02, 03 | ✅ pt/en/es | — |
| 15/12 | Música 2 "O Dia Depois do Julgamento" | ✅ | — |
| 15/01 | Música 3 | ❓ | escolher qual música (26 prontas no R2, sem título na T1) |
| 30/01 | Conto "Sonata de uma Briga" | ✅ | — |
| 15/02, 28/02 | Mundo das Sombras caps 1–2 (texto) | ✅ pt/en/es | — |
| 15/02 | WEB SHARD Especial E1 | ❌ | ❓ conteúdo: Mundo das Sombras v2 (cap.1, em produção) ou Heróis da Cidade; + EN/ES |
| 15/02 | Videoclipe 1 | ❌ | escolher música + produzir |

## P2 — 2º ciclo (mar – mai/2027)
| Data | Item | Estado | Falta |
|---|---|---|---|
| 15/03 | Jogos Q2: Tama, Jack Dream Beer, LDI Arena (Tactics) | 🟡 | terminar e tirar do `SoAdmin` |
| 15/03 – 30/05 | Livro caps 7–12 | 🟡 só pt | traduzir EN/ES |
| 15/03 | WEB SHARD 04 | ✅ pt/en/es | — |
| 15/04 | WEB SHARD 05 | 🟡 65 págs pt | EN/ES |
| 15/05 | WEB SHARD 06 | 🟡 59 págs pt ("Em Produção") | conferir se fechou; EN/ES |
| 15/03, 15/04, 15/05 | Músicas 4–6 | ❓ | escolher |

## P3 — 2º hiato (jun/2027)
| 15/06 | Mundo das Sombras cap 3 (texto) | ✅ | — |
| 15/06 | WEB SHARD Especial E2 | ❌ | ❓ conteúdo (MDS cap.2?) |
| 15/06 | Videoclipe 2 | ❌ | — |
| 30/06 | Conto "Alan, o Campeão" | ✅ | — |

## P4 — 3º ciclo (jul – set/2027)
| 15/07 | Jogos Q3: Duelo, RPG 32 bits, LDI Isométrico | ❌/🟡 | produzir |
| 15/07 – 30/09 | Livro caps 13–18 | 🟡 só pt | EN/ES |
| 15/07, 15/08, 15/09 | WEB SHARD 07, 08, 09 | ❌ | produzir do zero (pt + EN/ES) |
| 15/07 – 15/09 | Músicas 7–9 | ❓ | escolher |

## P5 — 3º hiato (out/2027)
| 15/10 | Mundo das Sombras cap 4 | ✅ | — |
| 15/10 | WEB SHARD Especial E3 | ❌ | ❓ conteúdo (MDS cap.3?) |
| 15/10 | Videoclipe 3 | ❌ | — |
| 30/10 | Conto "A Banda do Kim e do Jack" | ✅ | — |

## P6 — fim do ano (nov – dez/2027)
| 15/11 – 30/12 | Contos 04–07 (Nina, Jack, Inocentes, Correntes) | ✅ | — |
| 15/11, 15/12 | Especial de Terror partes 1 e 2 (E4, E5) | ❌ | história + produção |

## Rotas do projeto (o que existe hoje)
| Rota | O quê | Estado | Na T1 |
|---|---|---|---|
| `/games/toptrumps` (+ `/multiplayer`, `/games/multiplayer/lobby`) | Super Trunfo (SP e MP) | público | Q1 15/11/2026 |
| `/games/ldi-gangues` | LDI Gangues | público | Q1 |
| `/games/ldi` (+ `/game`, `/luta` laboratório da luta rítmica) | Lendas do LDI | público | Q1 |
| `/games/tamagoshi` | Tamagoshi LDI | só admin | Q2 15/03/2027 |
| `/games/jackcandy` | Jack Dream Candy (Jack Dream Beer) | só admin | Q2 |
| `/games/ldi-tatics` | **LDI Tactics — tabuleiro ISOMÉTRICO** (`ArenaTatics`, `GridCanvas` iso) | só admin | Q2 ("LDI Arena") / Q3 ("LDI Isométrico") ❓ qual vai em qual |
| `/prototype/arenatestbed` | **Arena Testbed — tabuleiro HEXAGONAL** (V2, IA por personalidade) | laboratório | candidato ao "LDI Arena hexagonal" do Q2 ❓ |
| `/prototype/srgrm` | Protótipo SRGRM 3v3 | laboratório | — |
| `/games/duelo` | Duelo LDI | só admin | Q3 15/07/2027 |
| (sem rota) | RPG 32 bits | ❌ não existe | Q3 |
| `/games/pesadelo` | Pesadelo Particular | só admin | fora do roadmap |
| `/games/minigames` | MiniGames | só admin | fora do roadmap |
| `/games/kernel-panic`, `/codigo-perdido`, `/sliding-rafael`, `/maze-rafael`, `/glitch-rafael`, `/bullet-hell-rafael`, `/stabilizer-rafael` | Kernel Games (sócio) | só admin | aguardam calendário do sócio |
| `/historias/*`, `/livro/*`, `/webtoon/*`, `/musicas`, `/calendario`, `/universos/*`, `/creators`, `/autor`, `/loja`, `/assinar`, `/admin` | portal | público (admin escondido) | — |

## Traduções em andamento (agentes)
- Lendas do LDI, 4 atos → EN/ES: `LAB-NVIDIA/lendas_traduz.py` (DeepSeek; Gemini estourou a cota grátis), revisão do agente antes de ligar `IDIOMAS_PRONTOS`.
- Livro caps 7–28 → EN/ES: `LAB-NVIDIA/livro_traduz.py 7 28` (DeepSeek, Gemini reserva), saída em `LAB-NVIDIA/livro_traducao/` pra revisão antes de ir pro site.

## Fora da T1 (sem data)
Mundo das Sombras caps 5–6 (texto pronto), Mar de Cinzas ("em avaliação", Apêndice sem texto), Livro caps 19–28 (só pt, T2).
