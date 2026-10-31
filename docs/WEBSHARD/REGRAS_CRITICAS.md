# REGRAS CRÍTICAS DE PRODUÇÃO DE QUADRINHO

**Leia isto antes de qualquer outro guia, toda vez.** Vale pra todo quadrinho do projeto: WEB SHARD de Lutas de Ilusão (linha principal e contos), Mundo das Sombras, Mar de Cinzas, Heróis da Cidade e especiais. Quando um guia de produto contradiz este arquivo, este arquivo vence. A exceção é a regra de estilo que só existe naquele produto (fonte, cor, traço).

Cada regra saiu de um erro real que custou páginas e cota. Os guias de cada produto dizem COMO é o produto; este arquivo diz onde a produção já errou.

São só dois documentos por trabalho: este arquivo e o guia do produto.
- `WEBSHARD_GUIA_DE_PRODUCAO.md`: Lutas de Ilusão (linha principal e contos) e o formato de todo WEB SHARD. Modelo pronto de produção: `WEBSHARD/LUTAS DE ILUSAO/CONTOS/06-inocentes/PRODUCAO/`;
- `MDS_GUIA_DE_PRODUCAO.md`: Mundo das Sombras;
- `BRANDS/Lutas de Ilusão/WEBSHARD/MAR DE CINZAS/MDC_GUIA_DE_PRODUCAO.md`: Mar de Cinzas;
- `HDC_GUIA_DE_PRODUCAO.md`: Heróis da Cidade;
- `Especiais/`: especiais (o Halloween em câmera na mão segue `HALLOWEEN_ROTEIRO_OFICIAL.md`).

Ferramentas, fila e os truques de imagem estão no fim deste arquivo (§9).

---

## 1. As três leis

1. **Imagem errada é prompt errado.** O modelo desenha exatamente o que está escrito. Se a página saiu errada, a correção é no texto do prompt ou na ficha que ele anexa. Gerar de novo o mesmo prompt não é correção.
2. **Tudo o que está no prompt pode aparecer na página.** Palavra vira objeto, marcação vira texto desenhado e nome vira pessoa. Só entra no prompt o que a câmera vê, escrito em positivo.
3. **O modelo não lembra nada.** Ele não conhece o guia, a página anterior nem a ficha que não foi anexada. Tudo o que vale numa página está escrito nela.

## 2. Atitude

- **Ler o guia e EXECUTAR o guia.** Ler e depois parar num "plano com perguntas" não é fazer o trabalho. Se a regra está no guia, ela vale sem precisar de pedido.
- **Transformar o guia num checklist antes de escrever** e conferir cada página contra ele. Ler o guia uma vez no começo e confiar na memória não basta: a regra de ângulo cinematográfico estava no guia e mesmo assim saíram 53 páginas com a mesma pose.
- **Decisão com padrão claro não vira pergunta.** Seguir o padrão e marcar no relatório o que foi assumido. Pergunta ao Isaias só quando a resposta muda o trabalho: divisão em capítulos, roupa oficial, texto que não está na história, ficha nova cara.
- **Nenhuma imagem sem autorização do Isaias.** Ele autoriza por etapa (fichas, capa, storyboard, páginas). Autorização de uma etapa não vale pra outra.
- **Revisão de roteiro é minha, lendo página por página.** Não terceirizar pra agente nem automatizar quando o Isaias pede leitura. Script serve pra checagem mecânica (contagem, texto literal, palavra proibida) e não substitui a leitura.
- **A cada ajuste pedido, entregar o trabalho completo atualizado** (o prompt ou o bloco inteiro), nunca só o pedaço que mudou.

## 3. Roteiro

### Texto
- **Nunca espremer a história.** Toda fala e toda narração do texto original entram literais.
  - Conto 06: a 1ª versão tinha 63 páginas e usava 43 de 74 falas. A versão certa tem 131 páginas e usa 74 de 74.
  - Conferir por script, frase por frase, contra o `.md` da história. Frase dividida em dois balões conta como presente.
  - Só fica de fora o que não existe na imagem, como links do site.
  - Exceção: a adaptação de livro do MDS escolhe o texto da cena (o livro não vira legenda). Isso só vale quando o guia do produto disser.
- **O tamanho vem do texto, não de uma meta de páginas.** Primeiro distribuir o texto inteiro, depois contar as páginas, depois dividir em capítulos (40 a 47 páginas, no tamanho do Sonata).
- **Fala nunca é inventada.** Texto que não está na história (carimbo, etiqueta, glitch, pergunta do gancho) vai listado no relatório pro Isaias aprovar. SFX e escrita em objeto podem entrar.
- **Corrigir erro de ditado antes de travar o texto.** Depois de travado, o texto é copiado palavra por palavra.

### Estrutura do capítulo
- Todo capítulo tem capa, aviso de idade, as páginas de história, o gancho em glitch, a página de divulgação e os créditos. As regras de cada página fixa estão no guia do produto.
- Antes de gerar capa, procurar arte oficial (`Personagens/Capas_Contos/`).

### Página
- **No máximo 2 painéis mais os estilhaços.** Painel único só em pausa dramática ou glitch. Página de ação nunca tem painel único.
- **Um corte só por página**, com proporção (60/40, 65/35…), grau e lado definidos. A página nunca repete o lado e a proporção da anterior.
  - Com 2 painéis só existe uma emenda. Escrever "A desce pra direita, B desce pra esquerda" obriga o modelo a adivinhar.
- **O balão fica no painel de quem fala.** Balão de alguém num painel em que ele não aparece é erro.
- **A leitura desce.** Balões alternando entre os painéis criam leitura em zigue-zague. Na mesma altura, a leitura vai da esquerda pra direita.
- **O estilhaço tem função** (tempo, reação, causa/consequência, olhar ou detalhe que conta) e não repete o que um painel já mostra.
- **Onomatopeia em toda página de cena**: som de ambiente, passo, gole, mastigação. Faltou em 24 páginas da parte 1 e em 27 da parte 2 do conto 06.

### Geografia e olhar
- **Geografia fixa por cena**, escrita no topo do bloco e repetida em toda página da cena: quem fica à ESQUERDA e quem fica à DIREITA da imagem.
- **Todo olhar tem direção.** Escrever "olhando o Jack, fora do quadro à direita da imagem", nunca "olhando o Jack". Olhar sem lado ou invertido foi o 2º erro mais comum.
- **Todo "dois de perfil" diz quem está de cada lado.**
- **A posição da câmera precisa fechar com a imagem.**
  - "Por cima do ombro direito" com o ombro desfocado no canto esquerdo não fecha.
  - Câmera atrás de alguém que vira a cabeça pra trás vira um olhar direto pra lente.
  - Câmera de lado com dois andando "na mesma distância" sai com um atrás do outro.
- **Ninguém olha pro leitor nem pra lente**, nem quando o texto fala "você", nem em selfie, vlog, vilão ou ponto de vista subjetivo. Nesse caso a pessoa olha acima e ao lado do ponto de vista.

### Continuidade
- **A continuidade vai escrita em TODA página onde vale**, nunca só na primeira: a roupa rasgada (de qual ombro até onde), a garrafa (debaixo de qual braço), o copo (em qual mão e de quê), a marca (aparece ou não).
- **O lado é sempre do personagem** ("braço DIREITO DELE").
- **O painel de baixo continua o de cima e a página continua a anterior.** Ler a página contra a cronologia. Erros que passaram:
  - a garrafa na boca e debaixo do braço ao mesmo tempo;
  - o jab dado com o braço que segura a garrafa;
  - a faca na mão antes de pegar;
  - a fatia no prato antes de cortar o bolo;
  - o motorista carregando caixa antes de o caminhão chegar;
  - dois copos na mão e, no painel seguinte, servindo comida com as duas mãos.
- **A roupa é a da ficha, não a da memória.** Exemplos: a ficha casual do Kim não tem boné; a do Jack é regata, então ela não tem gola. Abrir a ficha antes de escrever a roupa.
- **Objeto que já sumiu da história não entra como referência.** A ficha dele faz o modelo desenhar o objeto de volta.

## 4. Câmera (o erro mais caro)

- **Proibido:** corpo inteiro, pessoa em pé parada de frente e centralizada, e a mesma pose em páginas seguidas. No conto 06 foram 53 páginas descartadas, todas com a pose da ficha.
- **Por que acontece:**
  - "Plano americano" e "plano médio" fazem o Codex desenhar a pessoa em pé, de frente, inteira.
  - Ângulo só de passagem ("lente na altura do peito") é ignorado.
- **O plano de câmera é escrito ANTES dos prompts:** um enquadramento por painel, pra todas as páginas, escolhido pelo que acontece na página. Painéis vizinhos nunca repetem enquadramento, inclusive o último de uma página e o primeiro da seguinte.
- **Todo painel diz quatro coisas:**
  - **altura** do ponto de vista: no chão, na cintura, no olho, no teto;
  - **ângulo**: contra-plongée, plongée, holandês, sobre o ombro, subjetiva;
  - **lente**: grande-angular perto, que dá urgência, ou teleobjetiva longe, que espia;
  - **primeiro plano**: algo desfocado entre o ponto de vista e a ação.
- **O enquadramento abre o painel** ("ENQUADRAMENTO OBRIGATÓRIO — …") e diz o corte do corpo em palavras de corpo: "da cintura pra cima", "só cabeça e ombros enchem o painel". "Close" sozinho o modelo abre.
- **Termos que saem do texto:** "plano americano", "plano médio", "plano geral", "da cabeça às coxas", "em pé" (vira "em movimento") e plano geral disfarçado ("o Kim pequeno no fundo do quadro").
- **O corpo está em ação:** girado, inclinado, com o peso deslocado, e a pose muda de um painel pro outro.
- **Pouco fundo.** O lugar aparece em pedaços atrás da ação. A ficha de ambiente mostra o lugar inteiro, mas isso não manda abrir a câmera. Cenário que a cena não usa puxa a câmera pra abrir.
- **No máximo dois personagens em foco por painel.**
- **Os 13 enquadramentos que funcionaram:**
  - detalhe macro e close extremo;
  - close grande-angular;
  - contra-plongée extremo, plongée alto e zenital;
  - holandês;
  - sobre o ombro e perfis frente a frente;
  - quadro dentro do quadro (através de objeto);
  - grande-angular baixa e teleobjetiva;
  - subjetiva.
- **O storyboard testa a câmera, não só o texto.** Conferir a variedade de enquadramento entre as páginas, não só se cada página está certa.

## 5. Prompt

O prompt final é gerado por script a partir do roteiro (`montar.py`, `v3.py`). O roteiro cru nunca vai pro modelo.

### O que o modelo desenha se estiver no texto
- **Marcação de produção.** Já saíram desenhados na arte:
  - "(ÊNFASE: VIP)" e "SFX:";
  - códigos de cor, "80 px", "10°", "60%";
  - as letras A e B e o nome do enquadramento;
  - "ALL CAPS", "FOLHA DOS AUTOS" e nomes de arquivo.
  
  Tudo isso é reescrito em linguagem de desenho ("o painel de cima é um pouco maior", "a palavra X bem maior"), sem números, colchetes ou asteriscos. Margem nunca vai em pixels: "margem larga" desenhou moldura preta.
- **Título, capítulo ou número de página** saem escritos no topo. Nenhuma linha do prompt diz isso.
- **"Lente" e "câmera"** viram uma câmera fotográfica na cena. Usar "ponto de vista" e "visto do nível do chão". "Câmera lenta" vira "slow motion". "Glass" desenhou vidro de verdade.
- **Nome de pessoa** em parêntese ou em olhar ("(a Nina)", "olhando o Freddy fora do quadro") puxa a pessoa pra uma página em que ela não está.
- **Nome do arquivo anexado.** Ficha da comitiva chamada "ComitivaFreddy" pode desenhar o Freddy. Só a ficha do próprio personagem leva o nome dele.
- **O que não deve aparecer.** "Sem chuva" desenha chuva; "a pata que falta" desenha a pata. Descrever em positivo: "rua seca", "três patas".
- **Detalhe que a câmera não vê.** Rosto, olho e expressão de quem está de costas viram a pessoa de frente. O logo do boné de costas virou boné pra trás.

### O que o modelo inventa se NÃO estiver no texto
- **Lugar.** Sem ele, sai muro em ruína ou casa destruída. Toda página diz onde está e anexa a ficha do lugar quando tiver.
- **Roupa.** Sem ela, saíram o Kim de boné na festa, o Jack de regata verde e o armário da comitiva sem camisa. Toda página traz a roupa de cada um, tirada da ficha. Ficha de grupo é descrita da esquerda pra direita, posição por posição.
- **Objeto.** "Copo" virou caneca de café; o material vai escrito em TODA página onde o objeto aparece. Coisa local se explica: "coxinha (salgadinho brasileiro frito, dourado, em forma de gota)", senão vira coxa de frango.
- **Pose e identidade.** "Quem está sentado" virou duas meninas. Página só com a ficha de rosto do Kim, sem dizer quem é, deu um Kim com cara de menina. Descrever a pessoa mesmo quando só o rosto aparece e mandar "copiar o rosto exatamente das fichas X e Y". Idade vai escrita nos closes ("menino de 13 anos, rosto de criança"), senão o rosto envelhece.
- **Texto.** Sem contagem, aparecem balão inventado, carimbo que não existe e caixa repetida. Cada página:
  - diz quantos balões e caixas tem;
  - lista cada texto UMA vez, com acento;
  - diz em que painel cada texto fica;
  - descreve o carimbo só na página que tem carimbo.
- **Palavra vaga.** "Empty eyes" virou olho de cego; "paper bag with bones" virou ícone de caveira. Escrever o concreto.

### O que não chega ao modelo
- "Use o bloco do guia" e "como na página anterior" não significam nada pra ele. Bloco de estilo (o semirrealista, por exemplo) vai escrito por extenso na página, com a âncora anexada.
- Referência por link: o modelo finge que abriu. Referência só vale anexada, citada pelo nome do arquivo.

### Antes da fila
- **Ler o prompt montado inteiro contra ele mesmo:** câmera contra ação, lado contra lado, roupa contra ficha, texto contra a lista.
- Depois de mudar o roteiro, montar os prompts de novo, senão a fila roda a versão velha.

## 6. Fichas e referências

- **Primeiro levantar o que já existe** em `Personagens/`: ficha oficial, ficha de expressão, ambiente e capa. No conto 06, a capa oficial mostrava o Freddy de blazer e a ficha nova tinha camisa branca; sem conferir, ele troca de roupa no meio da história.
- **A ficha nasce antes da página.** Nenhuma página é gerada sem a ficha de corpo e a de rosto de quem aparece nela com o rosto à mostra.
- **Ficha nova só quando o elemento volta várias vezes e a variação estraga a cena.**
  - Contar em quantas páginas ele aparece e se a história depende de ser o mesmo ("saiu pela mesma carga e descarga por onde entrou").
  - Precisou de ficha: personagem num estado novo, figurantes e grupos recorrentes, ambientes que voltam e objetos centrais.
  - Não precisou: roupa rasgada. Continuidade escrita resolve.
- **Estado diferente do mesmo personagem = ficha diferente**, e cada página anexa a do momento certo. Ex.: o Freddy da festa sem o olho roxo. Quando uma ficha de rosto vem de outro estado, o prompt diz o que pegar dela ("só o olho roxo; a roupa é a da festa").
- **A ficha manda na aparência.** Pose, fundo, luz e texto da ficha são ignorados, e o prompt manda ignorar. Ficha com vários personagens: dizer qual figura usar.
- **A ficha também é prompt.** Ficha com erro espalha o erro pelo capítulo. Toda ficha gerada é conferida antes de ir pra página. Já apareceram:
  - logo da Nike (marca real é proibida);
  - porta numa parede na planta e em outra na vista;
  - o bolo com flores numa ficha e com morango em outra;
  - cachorro com quatro patas quando eram três.
- **Antes de "corrigir" uma página, comparar com a ficha.** Se ela bate com a ficha aprovada, não é erro.
- **Anatomia fora do padrão o Codex não desenha** (volta sempre com quatro patas). Editar a ficha no Gemini e montar só as vistas certas.
- **Onde moram:** `BRANDS/Lutas de Ilusão/Personagens/`, um arquivo de cada. Uma pasta por personagem com as fichas oficiais na raiz (`Kim/KimExpressionSheet.png`), mais `Inimigos/`, `Secundarios/`, `Trio/`, `Cenarios/`, `Objetos/`, `Estilo/`, `Capas_Contos/`. `_A_IDENTIFICAR/` não se usa até o Isaias dizer quem é. Ficha nova vai direto pra pasta do dono (`<Nome><Roupa>Sheet.png`, `<Lugar>_<Parte>.png`), nunca só na pasta do capítulo.
- **Formatos de ficha:**
  - personagem principal ou transformação: frente, costas e perfil de corpo inteiro, mais 3 expressões do mesmo rosto;
  - figurantes e grupos recorrentes: vários na mesma folha, lado a lado, com identidades distintas;
  - ambiente: planta de cima à esquerda e duas vistas do MESMO lugar à direita, nos ângulos que as páginas usam, sem personagens e sem texto; planta e vistas concordam;
  - objeto: quadro quadrado, só o objeto;
  - tamanho no Codex: 1536×1024 (horizontal) ou 1024×1024 (objeto). Lado de marca ou ferida se escreve "lado ESQUERDO DELE".
- **O fragmento de fundo não fecha o espaço.** Uma cama entre 2 ou 3 paredes vira "quarto de uma cama só"; escrever que o lugar continua e some no escuro.
- **No máximo 5 anexos por página**, só do que está no quadro. Página anterior entra só se for a mesma cena.

## 7. Revisão do roteiro

No conto 06, a revisão de 131 páginas achou 150 erros, e as revisões manuais das partes 1 e 2 acharam mais 50 e 47. Os tipos que mais aparecem, na ordem em que vale procurar:

1. onomatopeia faltando;
2. olhar sem lado ou invertido;
3. lado dos personagens não definido;
4. continuidade impossível na cronologia;
5. ficha errada (ambiente de outra cena) ou ficha de rosto faltando;
6. palavra que puxa pessoa ou objeto pro desenho;
7. câmera contraditória ou plano geral disfarçado;
8. roupa contra a ficha (gola em regata, boné fora da escola);
9. balão no painel errado e leitura em zigue-zague;
10. referência que não chega ao modelo ("bloco do guia").

Depois de cada revisão, checagem mecânica por script:
- texto literal completo;
- no máximo 5 anexos;
- nenhum corte nem enquadramento repetido entre vizinhos;
- nenhum nome de personagem em página sem a ficha dele;
- nenhuma marcação de produção nem "câmera"/"lente" no prompt final.

## 8. Storyboard e produção

- **Storyboard no Gemini, descartável, pra testar o PROMPT.**
  - Erro que aparece nele é corrigido na causa (montador, cabeçalho, roteiro), nunca página por página.
  - Rodar de novo até sair limpo: a parte 1 do conto 06 precisou de 4 rodadas, e a câmera de mais 3.
- **Separar o vício do Gemini do erro de prompt.**
  - É do Gemini: anatomia (braço a mais), caixa repetida ou pulada de vez em quando, letra errada, figurante duplicado. O Codex não repete isso e não vale perseguir no prompt.
  - É do prompt: composição, câmera, quem está no quadro e texto inventado.
- **O Isaias revisa os prompts e o storyboard antes do Codex.**
- **Produzir no Codex em lote de 5 e revisar antes de soltar o resto.** No conto 06, a pose repetida só foi vista com 53 páginas prontas; olhar as 5 primeiras teria economizado a cota.
- **Revisar cada página pronta:**
  - ficha e rosto;
  - cor das letras, ordem dos balões e acento;
  - estilhaços, corte e continuidade;
  - variedade de ângulo;
  - corpo igual ao da ficha: na capa do conto 06, o braço do Jack saiu musculoso, e a ficha é esguia.
- **A revisão vai pro Isaias com a lista de críticas.** Refazer é decisão conjunta.
- **Correção:** página do Codex se corrige no Codex. Mudou a composição, a página inteira é refeita pelo prompt. Mudou só o texto, a página vai anexada e o pedido é trocar só aquele texto.
- **Script também erra.**
  - O script de continuidade lia errado os números a partir da página 100.
  - Um caractere de controle invisível no `montar.py` gerou lixo.
  - Conferir a SAÍDA do script, não só se ele rodou.
- **Página refeita nunca é apagada.** Ela vai pra `_descartadas/<motivo>/`. Roteiro antigo vai pra `PRODUCAO/_historico/`. A página nova nasce antes da antiga sair.
- **Numeração só com números** (`01.png`, `02.png`…), na ordem final.
- **A cota do Codex acaba no meio** (umas 40 a 50 imagens por janela). Quando volta está no log (`resets_in_seconds`). Retomar de onde parou; agendar a retomada pede permissão do Isaias.

## 9. Ferramentas, fila e truques de imagem

O repositório é público: aqui só vai NOME de chave. As chaves ficam em `SiteLDI/.env.local`, lidas por `LAB-NVIDIA/chaves.py`.

| Uso | Ferramenta |
|---|---|
| Página final, ficha, capa | **Codex**: `codex exec --skip-git-repo-check -m gpt-5.6-terra --sandbox workspace-write -c model_reasoning_effort="low" -i <ref>... -` (prompt via stdin). Sempre com `-m`. Tamanhos 1024×1024, 1536×1024, 1024×1536. Uns 2 min por imagem. |
| Storyboard, cartoon (HDC), tradução de página, edição pontual de ficha | **Nano Banana 2** (`gemini-3.1-flash-image`), chave `GEMINI_API_KEY_PANORAMA`, `imageSize "2K"` + `aspectRatio`. |
| Texto braçal (transcrever balão, rascunho de tradução) | NVIDIA `moonshotai/kimi-k3` → Gemini `gemini-3-flash-preview` → DeepSeek `deepseek-flash`. Sempre rascunho. |
| Não usar | FLUX/Kontext da NVIDIA, Pollinations. |

- **Codex não abre caminho com acento.** Copiar as referências pra `C:\webshard_refs` antes de anexar, e provar que o anexo abriu antes de culpar o prompt.
- **Referência anexada** (`-i` no Codex, inline no Gemini) e citada pelo nome do arquivo, nunca "imagem 1".
- **Fila:** cada prompt começa com `OUT: <arquivo>` e `REFS: <arquivos>`. Roda na ordem de dependência, pula o que existe, tem trava contra rodada dupla e grava log. Prefixo no Codex: "ECONOMY MODE: do not inspect files or run commands… Generate ONCE… Reply only: ok."
- **Ritmo:** página narrativa, um pedido a cada 2 minutos; fichas, em sequência. Ao trocar de fila, parar a anterior (processo, `schtasks /query`, cron da sessão).
- **Texto:** lista fechada ("Write ONLY the texts listed, each exactly once… No other text."), acentos explícitos, nunca hifenizar. Letra se corrige no gerador, nunca em PIL.
- **Anatomia no Gemini:** "EXACTLY two arms… one elbow and one hand each… no extra arms, no floating hands". Quadro difícil: 3 variantes e escolher pelo recorte ampliado.
- **Conteúdo:** nunca pessoa, banda, marca ou logo de IA real. Nunca escrever "sangue/blood": mostrar a consequência. Estampa de folha tropical → "PALM and BANANA leaves only".
- **Fundo transparente:** o Gemini pinta xadrez. Gerar em branco liso, de novo em preto liso, e calcular alpha = 1 − (branco − preto).
- **Economia de cota:** página dupla = uma imagem 1536×1024 com 2 páginas e calha preta fina, cortada em 2 de 768×1024. Vale também pra fichas, retratos e blocos de mapa.
- **Revisão de entrega:** folha de contato pra visão geral e recorte ampliado onde tem mão, rosto ou texto. O Isaias revisa pelo celular: mandar a imagem ou a folha.

### Gerar pelo site do ChatGPT (Chrome conectado)

Serve para teste e poucas páginas; lote continua no Codex. Automatizar o site pode violar os termos de uso da OpenAI.

1. Abrir um Chrome comum com perfil próprio: `chrome.exe --remote-debugging-port=9222 --user-data-dir=C:\webshard_refs\chatgpt_bot\perfil_cdp --force-dark-mode --enable-features=WebContentsForceDark https://chatgpt.com/images`.
2. O login é manual, nessa janela. Chrome aberto pelo Playwright é recusado pelo Google.
3. Conectar com `chromium.connectOverCDP('http://127.0.0.1:9222')`. Script pronto: `C:\webshard_refs\chatgpt_bot\gera.cjs`.
4. Anexar as fichas com `setInputFiles` no `input[type=file][accept="image/*"]` que não é o de câmera. Os rótulos mudam com o idioma da conta.
5. Esperar sumirem as barras de envio, clicar no campo editável, usar `keyboard.insertText` com o prompt e clicar em Enviar.
6. A imagem pronta tem `alt` com "gerada" e `src` em `blob:`. Salvar por `fetch` dentro da página, nunca por requisição externa.

Refs ficam em `C:\webshard_refs`, sem acento no caminho. O navegador integrado do VS Code pela extensão não sobe arquivo e trava nessa página.

**Lote pelo ChatGPT: todo job passa por `prepara_lote.py <de> <até>`** (pasta `PRODUCAO/ferramentas` do conto). Ele monta um anexo único com uma página aprovada + `Baloes_LetreiroOficial.png`, soma as fichas de quem aparece (pessoas antes do cenário, 5 anexos no total) e fixa fonte e cores no fim de todo prompt. Fonte descrita só em palavras sai diferente no ChatGPT e a cor varia. Revisar a primeira página do lote antes de deixar correr.

