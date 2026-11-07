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
| Fred (valentão loiro) | Lax – Funny, Sarcastic and Smooth | Debochado, provocador. |
| Brock (valentão careca) | Dontae Brown | Grandalhão, intimidador. |
| Professor máquina | Cliff – Warm, Authoritative Narrator | Voz de autoridade, didática. |
| Figurante: mulher idosa | Lucinda – Earthy and Wise | Só para figurante sem voz oficial própria. |

**Preferência de voz:** vozes em inglês falando português costumam soar mais limpas que as vozes brasileiras da biblioteca, que em geral são mal gravadas. Um sotaque leve não é problema.

#### Vozes oficiais: busca exata no ElevenLabs

Use estes nomes **exatamente assim** no `el_voz.cjs` (`node el_voz.cjs "<busca>" "<nome exato>"`). O travessão é `–` (meia-risca), não hífen.

| Personagem | Busca | Nome exato da voz | Status |
|---|---|---|---|
| Kim | `Aaditya` | Aaditya – Dramatic TV Narrator | Oficial (Isaias) |
| Jack | `Elio Youthful` | Elio – Youthful & Warm International Voice | Oficial (Isaias) |
| Helena | `Ana Alice` | Ana Alice – Friendly & Clear | Oficial, 04/11/2026 |
| Pajé | `Grandfather Joe` | Grandfather Joe – Gentle, warm & wise | Oficial, 04/11/2026 |
| Osvaldo | `Spuds Oxley` | Spuds Oxley – Grandpa | Oficial, 04/11/2026 (ainda não usado em short) |
| Fred | `Lax` | Lax – Funny, Sarcastic and Smooth | Usada no Short 12 |
| Brock | `Dontae` | Dontae Brown | Usada no Short 12 |
| Professor máquina | `Cliff` | Cliff – Warm, Authoritative Narrator | Usada no Short 12 |
| Senhora (figurante) | `Lucinda` | Lucinda – Earthy and Wise | Usada no Short 11 |

Antes de gerar, confira no painel a **voz**, o modelo **Eleven v4** e o idioma **Portuguese**.

#### Elenco de cada short (o que já foi dublado)

| Short | Quem fala | Arquivos (`_gerador\voz\NN\`) | Roteiro (`C:\webshard_refs\shorts\voz\`) |
|---|---|---|---|
| 01 A Primeira Corrente | Kim | `fala1–4.wav` | `_gerador\voz\01\voz_01.txt` |
| 02 Só Um Braço | Kim | `kim1–4.wav` | `kim_02.txt` |
| 03 Que Porra É Essa | Kim (12), Jack (1) | `kim1–12`, `jack1` | `kim_03.txt` / `kim_03_livre.txt`, `jack_todos.txt` |
| 04 Não Há Regras | Kim | `kim1–7` | `kim_04.txt` |
| 05 Era Só Um Sonho | Kim, Jack, Helena | `kim1–4`, `jack2–7`, `helena1` | `kim_05.txt`, `jack_todos.txt`, `mae_05.txt` |
| 06 Morra Jack | Kim, Jack | `kim1`, `jack1` | `kim_06.txt`, `jack_todos.txt` |
| 07 Você Não É o Escolhido | Pajé (11), Kim | `p<pág>_paje<n>`, `p8_kim1` | `cap2_paje.txt`, `cap2_kim.txt` |
| 08 O Despertador | Pajé (14), Kim (8) | `p<pág>_paje<n>`, `p<pág>_kim<n>` | idem |
| 09 A Medusa Acordou | Kim, Helena | `p33–36_*` | `cap2_kim.txt`, `cap2_helena.txt` |
| 10 Até os 18 | Helena (10), Kim (9) | `p38–43_*` | idem |
| 11 A Análise do Kim | Kim, Jack, Senhora | `p52–53_*` | `c11_kim.txt`, `c11_jack.txt`, `c11_senhora.txt` |
| 12 Quem É Essa Garota | Kim, Jack, Fred, Brock, Professor | `p57–61_*` | `c12_*.txt` |

Nome do arquivo de fala: `p<página>_<personagem><n>.wav`. O número da página diz onde a fala entra, e o `n` é a ordem da fala desse personagem no capítulo. Os shorts 01–06 usam o formato antigo, sem página.

#### Como dirigir cada personagem: exemplos reais que funcionaram

A tag vai **em inglês, entre colchetes, antes da frase**. Use 2 ou 3 palavras: emoção + jeito de falar + ação física, se tiver. Uma emoção por frase. CAIXA ALTA marca a palavra que leva o soco, e reticências dão peso e pausa.

**Kim: sério, frio, sarcasmo seco.** O humor vem do conteúdo, nunca do tom.
```
[exhausted, bloodied, a slow smirk] Já que é um sonho... então eu acho que não preciso pegar leve. [pause] [pause] [pause]
[quietly, almost to himself] Faz tempo. [pause] [pause] [pause]
[dark, determined, building] Mas eu acho que tá na hora... de libertar uma das CORRENTES. [pause] [pause] [pause]
[low, dangerous, grinning] Minha vez. [pause]
```
(Short 01. Essa fala é sozinho, em clímax; `smirk`/`grinning` só passam aqui, e nunca diante de outros.)
```
[serious, catching his breath, analyzing] Mudou... ficou mais forte, mais rápido... [pause] [pause] [pause]
[cold, decided] Esse vale uma CORRENTE. [pause] [pause] [pause]
[cold, flat, done playing] Cansei de brincar. Vou te dar um braço... pra pagar o que eu ARRANQUEI de você. [pause] [pause] [pause]
[low, flat, menacing] Mas é só um braço... [pause]
```
(Short 02: ameaça fria. É o tom-padrão do Kim em luta.)
```
[serious, low, determined] Não importa se é sonho, game ou realidade... [pause] [pause] [pause]
[cold, rhythmic] Velho... jovem... homem... mulher... [pause] [pause] [pause]
[shouting, charging] OU GOSMA! [pause] [pause] [pause]
[cold, deadpan, dodging] Sabe qual é a única regra da briga de rua? [pause] [pause] [pause]
[roaring] NÃO HÁ REGRAS! [pause] [pause] [pause]
[dry sarcasm, mid-punch] Espero que tenha um bom plano DENTÁRIO. [pause]
```
(Short 04: crescendo com uma lista ritmada, o grito na virada e a piada seca no soco.)

**Kim sozinho em situação absurda:** aqui ele pode soltar mais. Há duas versões do Short 03: `kim_03.txt` (tom sério, tags `serious`/`deadpan`) e `kim_03_livre.txt` (abaixo). O take aprovado (`kim_03.mp3`) foi gerado logo depois da versão livre, então provavelmente é ela. O Isaias aprovou esse tom mais solto para o Kim sozinho:
```
[panicked, falling, shouting] QUE PORRA É ESSA? [pause] [pause] [pause]
[breathing hard, to himself] Aquieta, coração. [pause] [pause] [pause]
[calming down, certain] Com toda a certeza... isso é um sonho. [pause] [pause] [pause]
[through gritted teeth] Cabeça de musgo. [pause] [pause] [pause]
[furious, shouting] EU VOU MATAR ESSE CARA! [pause] [pause] [pause]
[confused, sarcastic] Eita, tá brotando petróleo do c...
```
Outros registros do Kim que funcionaram: `[polite, calm, serious]` com a senhora no ônibus, `[quiet, analytical, deadpan, whispering to his friend]` nas análises, `[exhausted, flat]` e `[furious scream]` no fim do cap. 1, e `[annoyed, flat]` / `[dry, bored, thinking]` na escola.

**Jack: teatral, animado, debochado, leve.**
```
[excited, filming with his phone] Isso vai ficar demais no meu perfil na PowWow! [pause] [pause] [pause]
[cheerful, sing-song, getting closer] Kim... Kim... Kim... [pause] [pause] [pause]
[laughing, happy] Sorria para a selfie, meu mano! [pause] [pause] [pause]
[sheepish, apologetic] Hum... desculpa, Kim, estamos ficando sem tempo. [pause] [pause] [pause]
[teasing, signature line] E como eu sempre digo: você deveria começar a jogar Lutas de Ilusões. [pause]
```
Também: `[playful, whispering, betting]` e `[impressed, laughing softly]` (Short 11). "PowWow" saiu errado; o retake usou `Pau-Uau` (`jack_01b.txt`).

**Helena tem dois modos.**
- Mãe brava gritando de outro cômodo (Short 05): `[angry mother, shouting from another room] VAI DORMIR, CRIA DO DIABO! [pause]`
- De ressaca, rude (cap. 2):
```
[hungover, raspy, cold] Kim. [pause] [pause] [pause]
[hungover, rude] Foda-se o café, manda um dix agora. [pause] [pause] [pause]
[angry, hungover, shouting] Cadê, cadê, caralho? Manda logo a minha grana, porra! [pause] [pause] [pause]
[angry, mocking] O que é isso? Auditoria? [pause] [pause] [pause]
[furious, screaming, pointing] Ô, demônio! ...
```

**Pajé: místico que vira malandro.** O contraste é a graça.
```
[mysterious, warm, old wise shaman] Acorda, parça... porque sua vida tá prestes a dar um giro de trezentos e sessenta graus! [pause] [pause] [pause]
[outraged, shouting, old man] Você é bem metidinho a espertinho, né, Caralho! [pause] [pause] [pause]
[hesitant, trying to be polite] É o seguinte... sem ofensa, não leva pro coração! [pause] [pause] [pause]
[casual, a bit mocking] Muito menos o mais preparado... [pause] [pause] [pause]
[laid back, street slang] Se não é o cara certo pra isso, tá ligado... [pause]
```
Número escrito por extenso ("trezentos e sessenta") para a voz não ler errado.

**Figurantes e coadjuvantes (Short 11 e 12):**
```
Senhora (Lucinda):  [sweet, kind old lady, smiling] Ai, meu jovem, não precisa não, mas obrigada por perguntar. Me dá dois pacotes, por favor.
Fred (Lax):         [impatient, angry, whispering] Mas eles estão bem aqui— / [frustrated, impatient] Eu não aguento esperar.
Brock (Dontae):     [calm, cold, deep voice] Espera a terceira aula. / [firm, cold] Terceira aula.
Professor (Cliff):  [robotic, synthetic teacher voice, neutral] Vamos iniciar a aula de hoje.
```

#### Frase de contexto no fim do take (obrigatória em take curto)

Todo roteiro de personagem termina com **uma frase extra em português, com a tag `Brazilian Portuguese`**, que é **descartada no corte**. Ela segura o sotaque das falas curtas. Exemplos usados: `[calm, Brazilian Portuguese] Mais uma terça-feira normal nesse ônibus. [pause]`, `[cheerful, Brazilian Portuguese] Bora, que hoje o dia vai ser bom demais. [pause]`, `[breathing hard, Brazilian Portuguese] Eu juro que dessa vez você não escapa, cabeça de musgo. [pause]`. No corte, peça **N+1 falas** e jogue fora a última.

#### Tags que funcionam (biblioteca)

| Quero… | Tags |
|---|---|
| Ameaça fria | `cold, flat, menacing` · `low, dangerous` · `cold, decided` |
| Sarcasmo seco | `deadpan, dry sarcasm` · `dry, bored` · `dry, annoyed` |
| Grito | `furious, shouting` · `roaring` · `furious scream` · `screaming, fed up` |
| Pânico | `panicked, falling, shouting` · `breathing hard, to himself` |
| Cansaço/ferido | `exhausted, bloodied` · `catching his breath` · `exhausted, flat` |
| Pensando/analisando | `serious, suspicious, thinking` · `quiet, analytical` · `whispering to his friend` |
| Alegre/brincalhão | `excited` · `cheerful, sing-song` · `laughing, happy` · `playful, teasing` |
| Sem graça | `sheepish, apologetic` · `hesitant, embarrassed` |
| Idoso | `old wise shaman` · `old man` · `sweet, kind old lady` |
| Voz de máquina | `robotic, synthetic teacher voice, neutral` |

**Ação física na tag ajuda a entonação:** `mid-punch`, `dodging`, `charging`, `throwing`, `pointing`, `filming with his phone`, `walking`, `falling`.

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
| 2 | conferir + `node el_lang2.cjs Portuguese` | Modelo **Eleven v4**. O script troca o idioma de **Auto** para **Portuguese** e confere a troca no fim. Isso evita frase curta com sotaque espanhol ou inglês. |
| 3 | `node el3.cjs roteiro.txt` | **Limpa o editor** (o ElevenLabs guarda o roteiro anterior, mesmo depois de recarregar), **confere que ficou vazio**, cola o roteiro e **confere que o editor ficou idêntico ao arquivo**. Se algo não bater, para. |
| 4 | `node el5.cjs take.mp3` | Clica em **Generate speech** (ou **Regenerate speech**) e salva o áudio **direto da resposta de rede da API** (`text-to-dialogue/stream`). O player usa streaming, então a URL `blob:` não serve. |
| 5 | `python cortar_falas.py take.mp3 <N> <pasta> <prefixo>` | Corta em N falas: descarta respiração e ruído, e junta trechos pelos menores intervalos até sobrar N. Imprime a duração e o pico de cada fala. |

O roteiro inteiro é gerado numa geração só, pra entonação ficar contínua. Se uma fala sair ruim, gere outro take (`take2`) ou troque só a tag.

**Corte alinhado ao roteiro (preferido quando há falas com "..." no meio):** `python cortar_alinhado.py take.mp3 roteiro.txt <pasta> <prefixo>`. Ele lê as falas do roteiro e, entre todos os silêncios ≥ 0,2s, escolhe os cortes que mais combinam com a duração esperada de cada fala (nº de caracteres ÷ velocidade do take). Assim uma pausa longa dentro da frase não vira corte. O script marca as falas suspeitas, e essas precisam ser ouvidas.

**Lote de vários shorts (ex.: cap. 2, `cap2_falas.py`):**
1. Liste todas as falas como `(short, página, personagem, tag, texto)` em ordem de leitura.
2. `python cap2_falas.py roteiros` gera **um roteiro por personagem** (`voz/cap2_<personagem>.txt`), já com o triplo `[pause]` e a frase de contexto em português no fim (descartada no corte).
3. Para cada personagem: `el_voz` → `el3` → `el5` → `cortar_alinhado`.
4. `python cap2_falas.py distribuir` copia os cortes para a pasta de cada short e escreve o mapa `FALAS` em cada roteiro.

Para um capítulo novo, copie o `cap2_falas.py` e troque a lista.

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
