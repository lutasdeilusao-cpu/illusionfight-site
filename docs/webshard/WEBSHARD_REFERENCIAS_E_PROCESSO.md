# WEBSHARD LDI — Referências, evolução e processo

> Complemento do [Manifesto e guia de produção](WEBSHARD_GUIA_DE_PRODUCAO.md). Consolidação em 05/10/2026, com handoff v2 e pesquisa do acervo local.
> A orientação atual do autor prevalece. **Nina: rosa framboesa `#B82E69`**, escolhido por delegação do autor a partir das fichas fornecidas; substitui a pendência do handoff.

## 1. O que a evolução do acervo revela

Isaias relata que o desenvolvimento vem desde o ano anterior e que criou a linguagem por não gostar da organização narrativa de webtoon, comic e mangá para o produto que queria. As imagens mostram experiências diferentes de composição; nomes de pastas e datas de arquivo não bastam para atribuir uma cronologia exata de criação.

### 1.1 Estágios visuais observados

| Conjunto | Observação visual por amostragem | Relação com o WEBSHARD atual |
|---|---|---|
| `Webtoon/` | Páginas 800 × 1280, fundo branco, texto separado e quadros pequenos com bastante vazio | Contraste com a página atual integrada e de maior ocupação visual. Há 7 PSDs e 8 PNGs. |
| `Webtoon01/01/` | Estudos horizontais, em torno de 1344–1376 × 768–784, com grades de cenas de rotina | Material de desenvolvimento; não gabarito final de leitura vertical. |
| `PagesWebtoon/00/PT/` | Versões do episódio de apresentação, fundos vinho/preto, imagens unificadas, índices, páginas e PSDs | Documenta montagem e experimentação; contém duplicatas/derivados, não 148 páginas narrativas distintas. |
| `PagesWebtoon/REMAKE 00/` | Arte mais detalhada, mudança de enquadramentos e composição; ainda há áreas vazias e dimensões diferentes | Etapa de transição, não a edição atual de 53 páginas. |
| `WEBTOON OFICIAL/01–03-2/` | Páginas muito altas, várias faixas e balões, inclusive dimensões 853 × 1844 | Mostra a organização seriada anterior e o problema de densidade que a nova direção procura evitar. “OFICIAL” no nome é histórico. |
| `WEBSHARD/LDI/01/{PT,EN,ES}/` | Arquivos PNG correspondentes ao lote de idiomas do capítulo disponível no portal | Referência externa mais próxima do produto atual: 53 PT, 53 EN, 52 ES. |
| `WEBSHARD/LDI/02/` | 64 PNGs; amostras mostram Kim, Pajé, Helena, rotina e estilhaços com bordas coloridas | Produção externa existente, **não publicada pelo catálogo atual**. Contagem de arquivos não prova revisão ou conclusão editorial. |

**Leitura crítica da evolução:** a direção atual reúne o acontecimento principal e seus detalhes numa única composição, usa a cor para reduzir esforço de identificação e reserva texto maior em vez de multiplicar faixas. Essa interpretação visual é coerente com a motivação declarada por Isaias; não é uma reconstrução de conversas antigas não fornecidas.

O objetivo de produção não é copiar cada tentativa anterior. É preservar o aprendizado que levou a painéis maiores, estilhaços subordinados, hierarquia, legibilidade e cor narrativa. Uma página antiga mais carregada não autoriza repetir o excesso.

### 1.2 Inventário externo

Raiz pesquisada: `C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão`. Os caminhos desta seção são relativos a essa raiz e servem à equipe local; os arquivos externos não foram publicados junto com este manual.

| Pasta | Inventário de arquivos |
|---|---|
| `WEBSHARD/` | 263 PNGs no total, incluindo LDI, Heróis da Cidade e WEBANIME. |
| `WEBSHARD/LDI/01/` | 158 PNGs nos três idiomas. |
| `WEBSHARD/LDI/02/` | 64 PNGs. |
| `WEBTOON OFICIAL/` | 87 PNGs: 28 em 01, 23 em 02, 10 em 03, 26 em 03-2. |
| `PagesWebtoon/` | 260 arquivos: 73 PSDs, 112 PNGs, 73 JPGs e 2 scripts Python. |
| `Webtoon/` | 15 arquivos: 7 PSDs e 8 PNGs. |
| `Webtoon01/` | 15 imagens: 6 PNGs e 9 JPGs. |
| `ChapterImages/` | 7 PNGs de apoio em Cap1/Cap2/Cap3. |
| `Fonts/` | 14 arquivos, incluindo `animeace2_bld.ttf`, `Ethnocentric-Regular.otf` e pacotes ZIP. Não prova a fonte das artes atuais. |

A inspeção combinou inventário completo dessas pastas com amostras visuais de cada estágio. As 53 páginas PT publicadas e as 69 páginas do preview histórico foram percorridas em pranchas de contato. Não se afirma leitura integral de todos os PSDs, de toda tradução ou de cada arte externa.

## 2. Handoff: precedência e diferenças resolvidas

| Assunto | Registro antigo | Decisão da consolidação |
|---|---|---|
| Nome | Nome oficial WEB SHARD; descritor WEB COMIC / MANGÁ VERTICAL | Preservar WEB SHARD como nome; definição atual é linguagem autoral própria. Descritor antigo não define sua identidade. |
| Painéis | 1–2, com exceção antiga de 3–4 no esmagamento | Regra atual: até dois; exceção específica de três. Quatro ficam como histórico, não autorização permanente. |
| Neon | Opcional na linguagem geral, adotado no LDI | Preservar sua função narrativa no LDI; outras marcas podem tomar decisões diferentes. |
| Nina | Cor ainda indefinida | **Rosa framboesa `#B82E69`**, definido nesta tarefa após o autor delegar a escolha de um tom próximo das fichas. |
| Páginas citadas | Esmagamento “34”, gritos “40”, diário “41–49” | Numeração histórica; no produto atual o mapa é o §9 do guia. Identificar cena e arquivo, não deslocar referências automaticamente. |
| Tradução EN | Handoff parou no bloco 16–24 | O repo já tem 53 EN; isso não prova revisão linguística integral, mas supera aquele inventário de andamento. |
| Capítulo 1 | Handoff reúne descrição de rotina e sonho | O portal atual publica o sonho como introdução 01; há rotina no acervo externo 02. Não importar a numeração antiga ao catálogo. |
| Calendário | Agenda de trabalho antiga | Dados atuais de `episodios.json` e calendário do portal prevalecem. Não substituir datas com o handoff. |
| Ferramenta | Limite de 5 imagens por prompt no fluxo usado | Tratar como restrição daquele processo; conferir a ferramenta efetivamente usada antes de gerar. |

O handoff contém relatos de recusas de ferramentas e tentativas de reformulação. Aqui, a regra operacional é descrever fielmente a cena e o personagem, manter as restrições visuais aprovadas e respeitar os limites da ferramenta. Não disfarçar uma pessoa como máquina nem tratar mudanças de vocabulário como garantia de aceitação.

## 3. Fichas, personagens e cenário

### 3.1 Onde estão as referências

A pasta `Personagens/WEBTOON/` reúne cópias de trabalho de `KimCasualDanoSheet.png`, `KimCasualSheet.png`, fichas escolares de Kim e Jack, `JackExpressionSheet.png`, `JackCasualSheet.png`, `NinaBaseSheet.png`, `NinaCasualSheet.png`, `VoidBaseSheet.png`, `VoidV2BaseSheet.png`, `VoidV2CromadoSheet.png`, `FreddySheet.png`, `BrockSheet.png`, `AMaquinaSheet.png`, `HITCOMBO.png`, `Ambiente2.png`, `Ambiente.png` e `QuartoKim.png`.

Também existem cópias em subpastas de personagens e cenários. Não presumir que duplicatas sejam idênticas ou que a mais recente por data de disco seja a aprovada. No briefing, declarar o caminho e a revisão usada.

Diferenças de nome verificadas: o arquivo da casa é **`Casa Kim2.png`**, com espaço, em `Personagens/WEBTOON/` e `Personagens/Cenarios/`; o handoff escreve `Casa_Kim2.png`. A ficha escolar de Jack sem uniforme aparece como **`JackEscolarNouniformeSheet.png`**. A ficha do autor existe em `Personagens/Autor/IsaiasSheet.png`.

### 3.2 Direção específica dos personagens

| Personagem/estado | Regras registradas no handoff |
|---|---|
| Kim casual | Camiseta preta, plaquinha no colar, pulseira azul, jeans rasgado, tênis preto/branco. Ficha prevalece em aparência; pose deve seguir a ação. |
| Kim danificado | Supercílio direito cortado; olho esquerdo roxo; bochecha esquerda ralada; canto esquerdo do lábio cortado; marcas na nuca; rasgo grande nas costas. Preservar lados entre todas as vistas. |
| Jack | Negro brasileiro, pele escura, dreads verdes curtas e definidas em quantidade moderada. Usar ficha de expressão; evitar descaracterização. Ao zoar: meio sorriso fechado e sobrancelha erguida, não gargalhada automática. Celular em uma mão, outra livre. |
| Nina | Cabelo rosa em rabo de cavalo longo; casual com jaqueta rosa aberta, cropped preto, jeans rasgado, luvas sem dedos e tênis rosa de cano alto. Voz **rosa framboesa `#B82E69`**. Conferir ficha da cena. |
| Helena | Nome com E, cabelo roxo; referência de ressaca mencionada no handoff como `HelenaRessaca.png`. |
| Freddy | Terno completo, olho roxo permanente na referência registrada. |
| Brock | Jaqueta preta de couro; não é aluno. |
| Pajé Yawanari | Visual exuberante de drag queen moderna: cocar, chapéu preto, óculos redondos, barba branca com tranças, ouro, cajado, manto geométrico e tênis branco. Debochado. |
| Isaias no diário | Boné com caveira, moletom roxo, calça preta, meias e tênis rosa; usar `IsaiasSheet.png`. |
| Kim Primordial | Handoff descreve cabelo branco, pele cinza-escura, olhos brancos, marcas tribais, preto e padrões turquesa. Não havia ficha própria confirmada naquele documento; não inventar uma referência aprovada. |
| Void fase 1 | Construto mecânico fictício, ~2,10 m; armadura preta fosca, garras e linhas laranja. Exatamente dois braços e duas pernas; sem capa, manto ou tecido. |
| Void fase 2 | **`VoidV2CromadoSheet.png` prevalece** sobre a fase 2 preta: cromado espelhado, mandíbula serrilhada, viseira laranja, lâminas curvas nos antebraços. |

Void está na introdução onírica, mas o handoff o mantém **fora do cânone oficial** até decisão do autor e proíbe usá-lo em capa/material promocional oficial. Sua presença no capítulo não resolve essa pendência automaticamente.

### 3.3 Ambientes e assets

- Casa: três janelas superiores; quarto de Kim na esquerda; garagem, entrada, janela baixa de Helena, lâmpada pendurada e rua rachada. Usar a referência, não reconstruir fachadas diferentes a cada página.
- Quarto: bagunça, pôsteres, prateleiras, guitarra e TV antiga, conforme `QuartoKim.png`.
- Arena: `Ambiente2.png`, coliseu, plateia, bandeiras e mármore com louros dourados; `Ambiente.png` é o estado destruído. Céu conforme o momento.
- Elite Academy: portão de ferro com nome dourado no arco. Sala A-304: três fileiras, quatro carteiras por fileira, disposição 2 + corredor + 2; primeira fileira com Kim, Jack, lugar vazio e Nina. Planta com corredor ainda constava pendente.
- Óculos de RA: nome de referência no handoff `OculosSaladeAula.png`; confirmar arquivo antes do uso.
- Logos: `LogoEnglish.png` e `LogoSquareEn.png` segundo o handoff; usar assets aprovados, nunca redesenhar a marca para cada página.
- HIT COMBO: arquivo localizado em `Personagens/WEBTOON/HITCOMBO.png`; recortar/aplicar o asset existente.

## 4. Câmera, corpo, olhar e ação

**Cada painel deve declarar seu próprio ângulo**, claramente diferente do anterior. Variar escala também: plano geral, close, detalhe, plongée, contra-plongée, sobre o ombro e ponto de vista subjetivo. Não fazer todas as páginas como rostos colados à câmera.

Personagens não olham para o leitor, salvo exceção explicitada: retrato de perfil, selfie, câmera com posição física justificável ou quebra de quarta parede do Pajé. Em conversa, olhar para o interlocutor ou acontecimento.

Descrever qual braço/perna atua, onde fica o peso, o giro do quadril, a trajetória e o contato. O handoff usa terminologia brasileira e distingue golpes retos de ganchos em arco; sua nomenclatura de “cruzado” não deve substituir a descrição biomecânica. O desenho precisa ser inequívoco mesmo se o nome de um golpe variar entre referências.

| Recurso validado | Como orientar |
|---|---|
| Rajada/multiexposição | Corpo nítido, 6–8 imagens-fantasma dos braços partindo dos mesmos ombros, opacidades distintas e movimento. Parecer vários golpes, não só uma pose borrada. |
| Esquiva rápida | Fantasmas de cabeça/tronco com pés plantados quando a ação exigir. |
| Esmagamento progressivo | O corpo inteiro baixa, joelhos flexionam, câmera acompanha e chão entra na imagem; não esticar o braço. Aplicar o teto atual de painéis. |
| Mudança entre painéis | Declarar o que mudou em pose, distância, estado ou ação. Evitar repetição involuntária do mesmo instante. |
| Transformação do Void | Casca preta racha e cai, revelando cromado por baixo; manter laranja para continuidade. |
| Impacto insuficiente, pose correta | Preservar anatomia; acrescentar choque, detritos, reação, piso e som em torno do contato. |

Direção visual de dano do handoff: marcas humanas em vinho-escuro quase preto, secas/crostas, sem sangue vivo jorrando, poças, osso exposto ou desfiguração grotesca. Inserto interno usa diagrama técnico azul-ciano. Isso é direção de conteúdo/arte, não promessa sobre aprovação de ferramentas.

### 4.1 As cinco correntes

Registro narrativo de produção do handoff: cinco correntes mentais — dois pulsos, dois tornozelos e pescoço —, cada uma associada a 20% de poder. Elos pretos com chama negra, veios carmesim e fumaça; movimento quase vivo. Na introdução, Kim solta a do **pulso direito**.

Pré-movimento: estalar pescoço → girar ombro → girar pulso com braço solto para baixo. **Não segurar um pulso com a outra mão.** Depois da libertação, as correntes deixam de aparecer; conferir a cena equivalente no lote atual, pois o número antigo “página 23” não é chave confiável.

Contido: sério, técnico, econômico. Libertado: postura animalesca, rajadas e diversão brutal. Quando recupera seriedade, a expressão marca a transição. Essas regras orientam a sequência; uma mudança no cânone geral deve ser validada pelo autor, não inferida de um sonho.

## 5. Som, texto de impacto e HIT COMBO

O handoff exige **ao menos uma onomatopeia por página de cena**. Aplicar ao roteiro narrativo; capas, créditos e avisos têm função editorial própria. Som é texto gráfico sem balão, geralmente branco com contorno/glow da cena. Seu tamanho acompanha a intensidade: golpe decisivo maior que passo.

**MISS** é a forma registrada para golpe que não conecta. Listar no prompt os sons da referência anterior a ignorar, além dos novos a escrever. Não deixar a ferramenta copiar letras antigas.

Vocabulário registrado: FSSH, ZIIIP, BIP, GLUP, FRUP, MISS, FWOOSH, CRACK, KRAKOOM, BAM, SHKK, KRA-THOOOM, THUD, GRNK, SCHRAAACK, VSHOOOM, DA-DA-DA-DAK, KRAK, KRUNCH, KRRAAASH, TIIINK, KRAAANG, VRRRM, SWOOSH, KRIK, TUC, KRK. Usar somente os sons especificados para a página.

### 5.1 Contador de combo

- Só em sequência de **três ou mais golpes acertados**, apenas dentro do LDI; nunca em briga do mundo real.
- Zera ao final da sequência. Pertence a quem acerta, não a quem apanha.
- Fica no **canto superior esquerdo do painel**, sem cobrir rosto ou informação.
- É **overlay de transmissão** para espectadores. Lutadores não o enxergam e não comentam o contador enquanto lutam.
- Usar `HITCOMBO.png`, com letras e dígitos em chroma verde; não regenerar um HUD diferente.
- Ideia reservada, ainda não regra implementada: contador falhar quando Kim supera a capacidade de medição.

## 6. Processo de referência e correção

1. Identificar anexos por **nome de arquivo**, nunca apenas “imagem 1”.
2. Ficha prevalece em aparência, mas sua pose neutra deve ser ignorada quando há movimento.
3. Referência de pose governa mecânica corporal; ignorar roupa, pessoa e ambiente alheios ao LDI.
4. Página anterior governa continuidade; ignorar texto antigo, ângulo e neon quando o novo roteiro os muda.
5. Usar poucas referências relevantes. O pacote de luta registrado era Kim danificado + Void correto + arena + página anterior, deixando um quinto espaço para correção, Jack ou HUD.
6. Quando houver mudança durável de estado, produzir ficha correspondente e fixar o lado dos ferimentos em todas as vistas.
7. Prompts devem ser enxutos. Detalhar a regra específica da página, ângulo/borda por painel e texto exato; evitar repetir o mesmo bloco genérico várias vezes.

Revisar português de ditado antes de fechar o texto: grafia, acento, nome e sentido. Preservar a voz informal aprovada; depois de travado, não normalizar falas silenciosamente durante geração ou tradução.

Para correção pontual, usar a página aprovada e uma marcação clara. Descrever **uma mudança**, preservar enquadramento, anatomia correta, texto, neon e composição restantes. Retângulo de marcação não entra no resultado. Após qualquer correção solicitada, entregar **o prompt completo atualizado em bloco de código**, não só um fragmento.

Rodapé de glossário registrado: `*[Termo] — [explicação curta]. illusionfight.com/universos`. Deve continuar legível e dentro da área segura; “discreto” não significa microscópico. O modelo histórico não suspende a regra atual de leitura fácil.

## 7. Localização EN e ES

Traduzir a **página aprovada**, preservando arte, posições, proporção e efeitos. Antes, inventariar todo o texto: se só houver sons já utilizáveis em inglês, copiar o arquivo para EN sem gastar nova geração. Não copiar automaticamente para ES sem essa mesma triagem linguística.

Preservar fonte, peso, cor de personagem, glow, inclinação, perspectiva e ênfase. Alterar apenas regiões de texto. Manter balões e geometria na localização de arte aprovada; se a tradução não couber com letra legível, reescrever com fidelidade e revisar o texto antes de autorizar qualquer mudança no desenho.

| PT | EN registrado |
|---|---|
| PLIC... | DRIP... |
| TAC... | TIK... |
| TCLK. | CLK. |
| TAK! | WHAK! |
| GLUP | GULP |
| TUM-TUM | THUMP-THUMP |
| TSC | TSK |
| MINHA VEZ. | MY TURN. |
| FAZ TEMPO. | BEEN A WHILE. |
| ESPERO QUE TENHA UM BOM PLANO DENTÁRIO!!! | HOPE YOU'VE GOT A GOOD DENTAL PLAN!!! |
| JÁ QUE É UM SONHO, ENTÃO EU ACHO QUE NÃO PRECISO PEGAR LEVE. | SINCE IT'S JUST A DREAM, GUESS I DON'T HAVE TO HOLD BACK. |
| MAS EU ACHO QUE TÁ NA HORA DE LIBERTAR UMA DAS CORRENTES. | BUT I THINK IT'S TIME TO BREAK ONE OF THE CHAINS. |

Glossário: Lutas de Ilusão → **Illusion Fight**; Sangue Primordial → **Primordial Blood**; LDI continua LDI. Manter nomes próprios, Bravara, Marélia, Elite Academy, Yohu e Yohualticit. Logos e palavras já em inglês, como HIT COMBO, permanecem. Tradução ES precisa de revisão própria; o handoff não fornece uma tabela espanhola equivalente.

## 8. Vídeo e outras obras: limites de reaproveitamento

Vídeo é derivação, não substituto do gabarito da página. O handoff registra frames inicial/final em 1080 × 1920 com mesma câmera, distância, luz e fundo; só a ação muda. No teste descrito, não há bordas, painéis, texto ou onomatopeias desenhadas. Descrever ordem das ações sem impor minutagem quadro a quadro e manter anatomia/fichas estáveis.

O estilo 2D anime citado nos testes de vídeo é uma escolha daquele experimento. Não reclassifica a página WEBSHARD, cuja direção de imagem no handoff é semi-realista detalhada, alto contraste e iluminação dramática.

Heróis da Cidade tem material externo em `WEBSHARD/HeroisDaCidade/`, mas sua aparição nessa pasta não valida as mesmas regras: o handoff pede comédia de uma página, visual cartoon anos 90 e definição independente de formato/neon. No portal, continua sem fonte de capítulos e visível apenas para admin. Mundo das Sombras e Mar de Cinzas também exigem guias próprios; esta documentação não prescreve suas paletas.

## 9. Fonte e limitações

O handoff v2 foi fornecido como `Pasted text.txt` nesta conversa. Seus parâmetros foram incorporados aqui e no guia principal; não é necessário depender do arquivo temporário do chat para continuar produzindo. Datas, estados de tradução e números antigos de página foram reconciliados com o repositório, sem apagar o registro das diferenças.

Os arquivos externos permanecem nos diretórios de origem. O manual registra inventário e caminhos, sem publicar em massa arte inédita, arquivos editáveis ou o capítulo 02. As únicas imagens usadas como exemplos online no guia são as que já fazem parte do portal.

## 10. Modelos específicos de correção e tradução

```text
CORREÇÃO PONTUAL — página [arquivo], revisão [n]
A página está aprovada. Corrigir somente [erro] em [local].
Manter composição, enquadramento, poses, texto, cores, neon e sons.
Referências: [página]; [marcação]; [ficha relevante, se necessária].
A marcação não deve aparecer no resultado.
Texto e onomatopeias a preservar: [lista literal].
Conferir [correção], continuidade e ausência de alterações colaterais.
Entrega: página completa 960 × 1637 px.
```

```text
LOCALIZAÇÃO — página aprovada [arquivo], PT → [EN/ES]
Trocar somente os textos listados; preservar toda a arte e os balões.
Manter fonte, cor, tamanho legível, glow, posição, inclinação e ênfase.
Texto exato: [local: original → tradução aprovada].
Manter sem alteração: [logos, nomes, sons e elementos já no idioma].
Aplicar glossário oficial. Não inventar diálogo nem redesenhar.
Conferir cada substituição e exportar na dimensão original da página.
```

## 11. Fluxo recomendado de produção

### Etapa 1 — Briefing e continuidade

Definir capítulo, momento da história, contexto anterior/posterior, personagens, roupas, cenário, estado físico e referências aprovadas. Separar intenção narrativa de descrição visual. Registrar a versão do roteiro utilizado.

### Etapa 2 — Decupagem vertical

Dividir a sequência em batidas. Para cada página, escolher o acontecimento principal e limitar os painéis grandes. Anotar o motivo de qualquer terceiro painel. Planejar o silêncio e a passagem entre páginas.

### Etapa 3 — Roteiro visual e cromático

Descrever painéis, detalhes sobrepostos, diagonais, direção do movimento, texto exato, cores de voz e domínio emocional. Prever mudança de neon quando ela tiver função narrativa.

### Etapa 4 — Esboço com texto real

Colocar os balões e o texto definitivo no esboço. Aplicar guias da safe area definida para a produção. Revisar a miniatura: se tudo disputa atenção, reduzir elementos antes de detalhar a arte.

### Etapa 5 — Arte

Produzir a cena com referências consistentes. Conferir anatomia, contato dos golpes, perspectiva, iluminação e continuidade. A textura do desenho não deve competir com a leitura dos estilhaços ou das falas.

Se houver geração assistida por IA, informar a estrutura de página explicitamente; o nome WEBSHARD sozinho não garante que a ferramenta conheça a linguagem. Usar referências aprovadas, revisar cada resultado e corrigir texto, anatomia e continuidade. A ferramenta é parte do processo, não a autoridade editorial.

### Etapa 6 — Letreiramento e neon

Aplicar fala por personagem e borda por intenção da cena. Conferir os dois sistemas separadamente. Regular glow e espessura olhando a arte reduzida; um efeito bonito em tamanho grande pode borrar letras ou eliminar divisões no celular.

### Etapa 7 — Revisão em escala de leitura

Testar o arquivo exportado na largura do celular, em sequência com as páginas anterior e posterior. Confirmar que a leitura funciona sem zoom, que a ação é entendida e que as bordas não carregam informação vulnerável.

### Etapa 8 — Tradução e pacote final

Entregar imagens por idioma, miniaturas/capas necessárias, metadados e registro de pendências. Guardar referências e arquivos editáveis de maneira recuperável. Publicar pelo processo do repositório.

## 12. Modelos reutilizáveis

### 12.1 Ficha de página

```text
WEBSHARD LDI — capítulo __ / página __ / revisão __
Tipo: narrativa | capa | aviso | editorial | divulgação | créditos
Fonte do roteiro/cânone:
O que muda nesta página:
Momento anterior / gancho para a seguinte:
Ambiente e continuidade:
Personagens e referências de aparência:

Painel principal 1 — ação, enquadramento e foco:
Painel principal 2 — ação, enquadramento e foco (se necessário):
Terceiro painel — justificativa excepcional (se houver):
Estilhaços — conteúdo, função, ângulo e borda de cada um:
Ordem de leitura / movimento / sobreposições:

Falas exatas — personagem, idioma, cor e ênfase:
Pensamentos:
Onomatopeias:
Quem controla a cena / emoção dominante:
Neon — cor dominante, exceções e motivo:

Dimensão do mestre / dimensão de exportação:
Safe area — aproximadamente 100 / 100 / 80 / 80 px:
Referência de fonte e tamanho aprovado:
Validação em largura de celular:
Pendências e responsável pela decisão:
```

### 12.2 Briefing de arte ou geração assistida

```text
Criar uma página WEBSHARD de Lutas de Ilusão, vertical, conforme
as referências aprovadas anexadas e o roteiro abaixo.

Composição: [um ou dois painéis grandes], com [detalhes necessários]
em estilhaços sobrepostos. Diagonais conduzem o olhar por [percurso].
A imagem dominante mostra [ação]. Os estilhaços mostram [funções].
Preservar clareza e pouca informação na escala do celular.

Personagens e continuidade: [aparência, roupa, estado físico, posições].
Cenário e luz: [descrição específica].
Controle/emoção: [intenção]. Neon: [cor aprovada e mudanças justificadas].
Vozes: [personagem → cor aprovada].
Texto exato e localização: [falas curtas; espaço para letras grandes].

Dimensão: 960 × 1637 px. Área segura: ~100 px laterais, ~80 px topo/base.
Ângulo de cada painel: [ângulo distinto]; cortes diagonais de 8–15 graus.
Borda de cada painel/estilhaço: [neon, núcleo e glow; repetir em cada bloco].
Olhar: para [ação/interlocutor]; nunca para o leitor sem exceção expressa.
Onomatopeias exatas: [ao menos uma para a página narrativa].
Ignorar textos e onomatopeias antigos das referências: [lista].
Ênfase em [PALAVRA]; colchetes não aparecem na imagem final.
Sem texto de diálogo fornecido: sem balões; manter sons especificados.
Referências de página: [arquivos].
Não inventar falas, nomes, cores canônicas ou elementos de continuidade.
```

Campos pendentes não devem ser preenchidos com valores apresentados como oficiais. A produção pode estudar alternativas identificadas como propostas, mantendo a decisão em aberto.

