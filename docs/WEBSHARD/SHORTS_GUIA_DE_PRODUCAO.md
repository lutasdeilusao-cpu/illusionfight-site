# Shorts — guia de produção automatizada

Como produzir os vídeos curtos (YouTube Shorts, TikTok, Reels) a partir das páginas do webtoon. O vídeo de referência é o **Short 01, "A Primeira Corrente"** (Cap. 1, págs. 21–26), aprovado e publicado em 04/11/2026.

- **Gerador:** `MARKETING\ShortVideosAI\_gerador\make_short.py`
- **Saída:** `MARKETING\ShortVideosAI\`
- **Postagem:** ver `FERRAMENTAS_AUTOMACAO.md`, seção 3.

---

## 1. Formato aprovado

| Item | Padrão |
|---|---|
| Resolução | 1080×1920, 30fps, H.264 (CRF 17) + AAC 192k |
| Duração | 15–30s (o Short 01 tem 30s) |
| Estrutura | Tira contínua estilo webtoon: as páginas ficam empilhadas e a câmera rola por elas |
| Cada página | 1. **Página inteira parada por 1,5–2s**, pra pessoa ver tudo<br>2. Animação: zooms nos pontos fortes, com flash e tremor nas onomatopeias<br>3. Transição pra próxima |
| Transição | Rolagem pra cima (0,55s): a página atual sobe e a próxima entra por baixo, com arranque e freada (easing) e motion blur vertical proporcional à velocidade |
| Final | Card com logos oficiais e CTA (4s) |
| Áudio | Música oficial com o pico alinhado ao golpe principal, SFX em cada onomatopeia e um whoosh em cada rolagem |

---

## 2. Escolher o trecho

As páginas ficam em `WEBSHARD\LUTAS DE ILUSAO\MAIN\<cap>\PT\NN.png`, com 960×1637 (já em 9:16). Nas linhas principais, as págs. 01–04 são capa, aviso e propaganda; a história começa na 05.

Critérios:
- **Abrir no quadro mais forte** do trecho (um rosto, um golpe, uma tensão). O primeiro segundo decide se a pessoa fica.
- O trecho precisa ter **virada e payoff** (no Short 01: Kim destruído → liberta a corrente → "MINHA VEZ" → combo).
- Precisa ser entendível pra quem nunca leu.
- **Cortar no pico**, sem resolver, pra pessoa ir pro site.
- De 5 a 7 páginas cabem em 30s.

Mapa do Cap. 1 (já analisado):

| Págs. | Trecho | Uso |
|---|---|---|
| 05–12 | Queda na arena, o Jack, a gosma vira monstro | Short "Abertura" |
| 21–26 | A primeira corrente, "MINHA VEZ", 1000 hit combo | **Short 01 (publicado)** |
| 32–36 | Monstro evoluído, "vou te dar um braço… mas é só um braço" | Short "Só um braço" |
| 38–43 | Selfie, ele acorda, "Vai dormir, cria do diabo!!!" | Short "Era só um sonho" (revela o final; postar por último) |
| 44–51 | Palavras do Autor | Short com narração do autor |

---

## 3. Montar o roteiro (`roteiros/NN_Nome.py`)

O gerador (`make_short.py`) é fixo. **Cada short é um arquivo em `_gerador/roteiros/`** com:
- `CAP` (pasta do capítulo) e `CAP_TXT` (texto do card, ex.: "CAPÍTULO 1");
- `VOZ_DIR` (pasta das falas);
- `PLAN` (as páginas);
- opcional: `aplicar_voz(PLAN)`, que redefine as páginas com fala na versão com voz.

Cada item do `PLAN` é uma página:

```python
dict(p=23, words=0, hold=1.6,             # página 23, palavras nos balões, parada inteira por 1,6s
     enter_fx=[...], enter_sfx=[...],     # opcional: efeito/som no instante em que a página chega
     kraang=True,                         # opcional: alinha o pico da música aqui (só uma página)
     steps=[                              # movimentos de câmera, em sequência
        (0.7, (480, 1270, 620),           # (duração s, (cx, cy, largura) alvo)
         [("flash", 0.6, 0.25, 1.0), ("shake", 0.6, 0.45, 20)],   # efeitos
         [(0.6, "combat/sword_hit.wav", 1.0)]),                    # sons
        (0.8, (480, 1290, 590), [], []),
     ]),
```

Por último entra `dict(p="END", hold=4.0, steps=[], enter_sfx=[(0.0, "magic/spell_impact.ogg", 0.9)])`, o card final.

### Tempo de leitura (`words=`)

Todo short precisa ser **legível**. Em cada página com texto, informe `words=` com o número de palavras dos balões (onomatopeias não contam). O gerador garante que a página fique na tela por pelo menos:

> **1,2s + 0,35s por palavra**

Exemplos: 9 palavras dão 4,4s; 21 palavras dão 8,6s; 31 palavras dão 12,1s.

- Se a soma de hold e passos for menor, a página estica por igual, com câmera, efeitos e sons acompanhando.
- Páginas só de ação (sem balão) continuam rápidas.
- O vídeo pode passar de 30s. **Até cerca de 1 minuto está ok**; a prioridade é dar pra ler.
- Na versão com fala, quem manda é o tempo da voz.

### Câmera: `(cx, cy, largura)`

Tudo em **coordenadas da página** (0–960 de largura, 0–1637 de altura).
- `cx, cy` é o centro do enquadramento. `largura` é quanto da página aparece; a altura sai automática (× 16/9).
- `960` = página inteira. `600` ≈ zoom de 1,6×. **Não desça de ~540**, porque a imagem fica borrada.
- Pra **páginas com balão de fala**, use largura ≥ 680–700 pro texto não cortar na lateral.
- Pra achar as coordenadas, olhe a página e estime o centro do quadro alvo. Exemplo: o rosto embaixo da página fica em `cy ≈ 1200`.
- Cuidado com rodapés de texto (ex.: "Visite o portal…" na pág. 23). Limite o `cy` pra não mostrar.

### Efeitos

| Efeito | Formato | Uso |
|---|---|---|
| `flash` | `("flash", início, duração, intensidade 0–1)` | Clarão branco no impacto (TIIINK, KRAAANG) |
| `shake` | `("shake", início, duração, pixels)` | Tremor. 12–16 é leve/contínuo (combo); 20–28 é impacto forte |

Os tempos são relativos ao início do passo.

### Sons (SFX)

Ficam em `SiteLDI\.gh-pages-worktree\arena\sfx\`. Formato: `(início, "pasta/arquivo", volume)`.

| Onomatopeia / momento | Arquivo |
|---|---|
| Impacto de abertura, soco pesado | `combat/heavy_hit.wav` |
| Golpe metálico (TIIINK) | `combat/sword_hit.wav`, `combat/sword_hit_2.wav` (+ `magic/electric_hit.wav` baixo) |
| Estalos curtos (CRACK, TCLK, KRIK) | `combat/dagger_hit.wav` (vol. 0,5) |
| Explosão / golpe principal (KRAAANG) | `magic/explosion.ogg` + `combat/heavy_hit.wav` |
| Movimento rápido (VSHOOOM) | `combat/heavy_swing.wav` |
| Whoosh leve | `combat/sword_swing.wav` (já entra sozinho em toda rolagem) |
| Card final | `magic/spell_impact.ogg` |

**Rajada de combo:** use `"COMBO"` no lugar da lista de sons do passo. O script gera socos a cada 0,11s durante o passo.

### Ritmo de referência (Short 01)

| Pág. | Hold | Animação |
|---|---|---|
| 21 | 1,5s | Zoom lento no sorriso (gancho) |
| 22 | 2,0s | Zoom nos balões "libertar uma das correntes" (3 balões, hold maior) |
| 23 | 1,6s | Zoom no pulso, TIIINK com flash e tremor |
| 24 | 1,6s | CRACK/TCLK/KRIK, depois TIIINK |
| 25 | 1,6s | **KRAAANG na chegada** (flash, tremor 28, explosão; pico da música), punho, VSHOOOM |
| 26 | 1,6s | "MINHA VEZ", depois 1000 HIT COMBO com rajada e tremor contínuo |
| END | 4,0s | Card final |

---

## 4. Música

> **Regra atual:** cada short usa uma das **músicas oficiais do Isaias** (`IsaiasLealMusic\MusicasSite\`), escolhida pelo clima da cena e definida no roteiro com `MUSICA = "<arquivo>"`. O gerador acha sozinho o pico da faixa, alinha esse pico com a página `kraang=True` e **nunca repete um trecho já usado por outro short** (fica registrado em `_gerador/musicas_usadas.json`). Sem `MUSICA`, usa a Opening.

O texto abaixo descreve o comportamento original, que continua valendo pra Opening.

- Faixa oficial: `BRANDS\IsaiasLealMusic\MusicasSite\Lutas de Ilusão(Opening) - Isaias Leal Music.mp3`.
- O script corta a música de forma que **o pico de 3:51.80** (`MUSIC_PEAK`) caia exatamente na página marcada com `kraang=True`. Basta marcar a página do golpe principal.
- Volume da música 0,6, fade-in de 0,3s, fade-out de 1,8s no fim. A mixagem final passa por um limitador (volume médio ≈ −14 dB, padrão dos Shorts).
- Pra usar outra faixa: troque `MUSIC` e encontre o pico dela. Analise o volume (RMS) por janela com numpy e pegue o ponto com o maior salto depois de uma respiração.

---

## 5. Card final (padrão de marca)

| Elemento | Detalhe |
|---|---|
| Fundo | Capa do capítulo (pág. 01), desfocada (blur 16) e escurecida (20%) |
| Logo principal | `Personagens\Logos oficiais\LogoEnglish.png` (Illusion Fight), no topo |
| Texto | "CONTINUA…" / "CAPÍTULO N COMPLETO EM" / **ILLUSIONFIGHT.COM** (amarelo) / "ALÉM DO QUADRINHO TEM" (ciano) / **LIVRO • MÚSICAS • GAMES** |
| Selo | Retângulo vermelho: **TUDO 100% GRÁTIS NO SITE** |
| Assinatura | `LogoSquareEn.png` (LF) embaixo |
| Fonte | **Rajdhani** (`Fonts\Rajdhani`, a mesma do site), em Bold e SemiBold. **Nunca** use fonte de quadrinho em texto de marketing. |

O card é enquadrado sozinho, sem pedaço da página anterior aparecendo.

---

## 6. Gerar

```
python "MARKETING\ShortVideosAI\_gerador\make_short.py" "C:/Users/isaia/Downloads/BRANDS" "<_gerador>/roteiros/NN_Nome.py" "C:/Users/isaia/Downloads/BRANDS/Lutas de Ilusão/MARKETING/ShortVideosAI/NN_Nome.mp4" [voz]
```

Sempre gere as **duas versões**: sem fala (`NN_Nome.mp4`) e com fala (`NN_Nome_COM_FALA.mp4`, com `voz` no fim). A ideia é testar qual o público prefere.

- O render leva de 3 a 5 minutos (por causa do motion blur). Ao final, o script imprime a duração, o tempo do KRAAANG e o ponto de início da música.
- Pra trocar de capítulo, ajuste `CAP` e `CAP_TXT` no roteiro.
- Efeitos de som em rajada no lugar da lista de sons de um passo: `"COMBO"` gera socos a cada 0,11s e `"SLASH"` gera cortes a cada 0,2s.
- Nome do arquivo: `NN_Nome_Do_Short.mp4`. Fica só a versão final na pasta.

## 7. Conferir antes de postar

1. Extraia quadros pra revisar sem assistir tudo:
   ```
   ffmpeg -ss <t> -i video.mp4 -frames:v 1 -vf scale=270:480 quadro.png
   ```
2. Confira:
   - balões inteiros (nada cortado na lateral);
   - nenhum rodapé de texto aparecendo;
   - card final limpo;
   - um quadro no meio de uma rolagem, com borrão suave e sem cópias duplicadas.
3. Assista no celular pra checar o ritmo e o volume.
4. Crie o `meta_NN.json` (título, descrição e legenda) e poste pelos scripts da `FERRAMENTAS_AUTOMACAO.md`.

## 8. Versão com fala (ElevenLabs)

Cada short pode ter duas versões: **sem fala** (padrão) e **com fala**, em que os balões das páginas são dublados. Só entram as **falas de balão**; legendas de narrador e onomatopeias ficam de fora.

### 8.1 Roteiro

- Uma linha por balão, em português, com as **tags de direção em inglês** antes da frase (o modelo responde melhor).
- **Três `[pause]` depois de cada fala.** Isso cria um silêncio de cerca de 1s entre as falas, que é onde o corte automático acontece.
- **Sempre `[pause]` depois da última palavra**, senão o ElevenLabs corta o fim da palavra.
- Use reticências pra peso e pausa, CAIXA ALTA pra ênfase e uma emoção por frase.

**Personagens e vozes:**

| Personagem | Voz (ElevenLabs) | Como dirigir |
|---|---|---|
| Kim | Aaditya – Dramatic TV Narrator | **Muito sério, quase nunca ri.** Em luta e diante dos outros, o humor dele é sarcasmo seco, sem sorriso (`[deadpan]`, `[dry sarcasm]`, `[cold]`, `[flat]`), e gritos só de raiva ou de choque de verdade. Nesses momentos, **nunca** usar `[laughs]`, `[grin]`, `[cocky]` nem `[mocking]`. **Exceção:** quando ele está sozinho, falando consigo mesmo em situação absurda (ex.: caindo do céu no Short 03), pode ter mais liberdade: pânico, nervosismo, sarcasmo mais solto. Isso funcionou muito bem. |
| Jack | Elio – Youthful & Warm International Voice | Teatral, animado, debochado e leve. |
| Helena (mãe do Kim) | Ana Alice – Friendly & Clear | Mãe brava, grita de outro cômodo. Escolhida pelo Isaias em 04/11/2026. |
| Pajé | Grandfather Joe – Gentle, warm & wise | Xamã idoso, debochado, gíria de quebrada e nordestina; vai do místico ao grito. Escolhido em 04/11/2026. |
| Osvaldo | Spuds Oxley – Grandpa | Porteiro idoso, gentil, medroso de bronca. Escolhido em 04/11/2026. |

Roteiro do Short 01 (`_gerador/voz/01/voz_01.txt`):
```
[exhausted, bloodied, a slow smirk] Já que é um sonho... então eu acho que não preciso pegar leve. [pause] [pause] [pause]
[quietly, almost to himself] Faz tempo. [pause] [pause] [pause]
[dark, determined, building] Mas eu acho que tá na hora... de libertar uma das CORRENTES. [pause] [pause] [pause]
[low, dangerous, grinning] Minha vez. [pause]
```

**Pronúncia e sotaque (aprendido na prática):**
- **Frase curta e solta sai com sotaque errado** (ex.: "MORRA JACK" saiu espanhol), porque o idioma está em Auto e falta contexto. Coloque **uma frase extra em português depois** no mesmo take (`[pause]` triplo entre elas) e descarte essa frase no corte.
- **Abreviações e palavrões por extenso:** o balão diz "KRL", mas o roteiro tem que ter "Caralho" (e assim por diante). A voz lê exatamente o que está escrito.
- **Não quebre a piada com pontuação:** ponto no meio de uma frase de humor cria uma pausa que mata o timing. Ex.: "Gastei. A nossa cota." vira "Gastei a nossa cota."
- **Personagem recorrente só com voz oficial:** nunca gerar fala de personagem sem voz oficial escolhida pelo Isaias.
- **Nomes em inglês/marcas:** escreva como se fala em português. Ex.: PowWow → `Pou-Uou`.
- **R forte:** se "morra" sair "morar", reforce na grafia: `MORRRA`.
- **Um take por personagem.** Junte as falas do mesmo personagem (de vários shorts) num take só e separe no corte.

### 8.2 Gerar (Chrome 9222, aba `elevenlabs.io/app/speech-synthesis/text-to-speech`)

Scripts em `C:\webshard_refs\shorts\`:

| Passo | Script | O que faz |
|---|---|---|
| 1 | `node el_voz.cjs "<busca>" "<nome exato>"` | Seleciona a voz (ex.: `"Elio Youthful" "Elio – Youthful & Warm International Voice"`). O nome precisa ser **exato**, inclusive travessões. Se a voz já estiver selecionada, não faz nada. Ao final, confere no painel. |
| 2 | conferir | Modelo **Eleven v4**. |
| 3 | `node el3.cjs roteiro.txt` | **Limpa o editor** (o ElevenLabs guarda o roteiro anterior, mesmo depois de recarregar), **confere que ficou vazio**, cola o roteiro e **confere que o editor ficou idêntico ao arquivo**. Se algo não bater, para. |
| 4 | `node el5.cjs take.mp3` | Clica em **Generate speech** (ou **Regenerate speech**) e salva o áudio **direto da resposta de rede da API** (`text-to-dialogue/stream`). O player usa streaming, então a URL `blob:` não serve. |
| 5 | `python cortar_falas.py take.mp3 <N> <pasta> <prefixo>` | Corta em N falas: descarta respiração e ruído, e junta trechos pelos menores intervalos até sobrar N. Imprime a duração e o pico de cada fala. |

O roteiro inteiro é gerado numa geração só, pra entonação ficar contínua. Se uma fala sair ruim, gere outro take (`take2`) ou troque só a tag.

### 8.3 Cortar as falas

1. Detecte os silêncios:
   ```
   ffmpeg -i voz_NN_take1.mp3 -af silencedetect=noise=-40dB:d=0.6 -f null -
   ```
   Cada `silence_start`/`silence_end` separa uma fala da próxima.
2. Corte cada fala com **`-ss` e `-t` antes do `-i`**, deixando uns 0,08s de folga antes e 0,2s depois, e com fade de 0,03s na entrada e 0,12s na saída:
   ```
   ffmpeg -ss <ini> -t <dur> -i voz_NN_take1.mp3 -af "afade=t=in:d=0.03,afade=t=out:st=<dur-0.12>:d=0.12" falaN.wav
   ```
3. Confira se cada fala tem som com `volumedetect` (`max_volume` em torno de −6 a −12 dB) e ouça.
4. Salve em `MARKETING\ShortVideosAI\_gerador\voz\NN\` (`fala1.wav`, `fala2.wav`…, junto com o take original e o roteiro).

### 8.4 Encaixar no vídeo

**Jeito padrão (automático):** no roteiro, coloque `FALAS = {página: ["kim1.wav", "jack1.wav", ...]}`, com as falas em ordem de leitura e os arquivos em `VOZ_DIR`. O gerador:
- coloca a 1ª fala 0,3s depois da página chegar e as seguintes em sequência, com 0,35s de intervalo;
- estica a página pra caber tudo (câmera e efeitos proporcionais);
- aplica o ducking da seção 8.5.

**Jeito manual** (usado no Short 01): a função `aplicar_voz(PLAN)` no roteiro redefine as páginas com `voice=[(t_rel, "falaN.wav"), ...]`:
- `t_rel` conta a partir da chegada da página.
- O hold e os passos da página **esticam** pra caber as falas, com uns 0,35s entre elas.
- Coloque cada fala quando a câmera estiver mostrando o balão dela.
### 8.5 Mixagem com fala (regra: a voz sempre na frente)

Quando há fala, a música vira só fundo. O script faz isso sozinho:

| Parâmetro | Valor | Efeito |
|---|---|---|
| `DUCK` | 0,15 | A música cai pra 15% (cerca de −16 dB) durante as falas |
| `DUCK_PRE` / `DUCK_DOWN` | 0,6s / 0,45s | A música começa a descer **antes** da fala entrar |
| `DUCK_POST` / `DUCK_UP` | 0,3s / 0,7s | Segura baixa depois da fala e **sobe devagar** |
| `DUCK_MERGE` | 1,5s | Falas próximas viram **um bloco só**, sem a música subir e descer entre elas |
| Faixa da voz | EQ −8 dB em 2,5 kHz na música, só durante as falas | Abre espaço pra voz, pra os dois não disputarem a mesma frequência |
| Voz | mono no centro, highpass 90 Hz, compressor 3:1, `VOICE_VOL` 1,4 | Fala clara e com volume constante |

Medição do Short 01: música normal em −14 dB, música entre as falas em −31 dB, voz entre −13 e −16 dB.

Gerar:
```
python make_short.py "C:/Users/isaia/Downloads/BRANDS" "<saida>_COM_FALA.mp4" voz
```

O Short 01 com fala ficou com 37,8s (a página 22 cresceu de 4,3s pra 11,2s por causa das três falas).

## 9. Próximos passos (automação)

- Job agendado que pega os shorts prontos e posta em horários pré-definidos (a definir).

## CTA no meio do vídeo (obrigatório desde 05/11/2026)

O `make_short.py` põe sozinho, em todo short, dois botões na parte de baixo da tela: **"👍 GOSTEI"** (cinza) e **"🔔 INSCREVA-SE"** (vermelho). Eles ficam 2,8s na tela, começando em **45% da duração** do vídeo; o roteiro pode trocar esse momento com `CTA_T = <segundos>`.
- Entram com um pulinho e o som `ui/select.wav`.
- Em +1,3s o botão é "clicado" e vira **"INSCRITO"** (cinza), com `ui/click.wav` e um **sino de notificação forte** (`_gerador/sfx/cta_sino.wav`, "ding-ding" em duas notas, sintetizado pelo projeto, volume 1.3).
- A arte é desenhada pelo próprio script (Rajdhani + ícones da fonte Segoe UI Symbol), sem nenhum asset de terceiros.
- Os vídeos antigos, sem CTA, estão em `ShortVideosAI\_antigos_sem_cta\`.
