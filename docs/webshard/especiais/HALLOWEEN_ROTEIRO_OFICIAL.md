# Especial de Halloween — roteiro oficial de produção

> Revisão editorial: 19/10/2026. Direção de Isaías: continuidade de acontecimentos, quatro linguagens de POV, câmeras como protagonistas e leitura no celular com uma mão. Três lançamentos: **51 páginas narrativas + 9 editoriais por lançamento = 180 páginas físicas; 153 páginas de história**. Esta revisão substitui as versões sobrepostas do documento recebido. O original permanece no histórico do Git; não usar suas instruções conflitantes para produzir novas páginas.
>
> Status: roteiro e diálogos revisados para leitura autoral; **nenhuma página narrativa foi gerada nesta revisão**; as fichas de material geradas posteriormente estão registradas em §16 e aguardam revisão autoral. Falas novas são redação editorial deste roteiro, não citações recuperadas de uma arte anterior. Os destinos, as mortes e o banquete foram preservados. A pasta Personagens foi repovoada durante esta revisão: As referências existentes foram inspecionadas e registradas em §13.1; o acréscimo de Brock e as novas fichas têm registro em §16. Os nomes com prefixo halloween_ são complementos planejados, não arquivos já existentes.

## 1. Direção da experiência

As câmeras são os protagonistas formais: cada uma tem um alcance, uma memória e uma maneira de falhar. A analógica guarda o que os personagens esquecem; a digital transforma espetáculo em testemunho; a segurança revela a operação indiferente; a primeira pessoa rompe o registro externo para tornar a perda humana. Não criar uma câmera neutra, cinematográfica e invisível para resolver uma cena difícil.

A história acompanha o que muda, não cada metro percorrido. Pode cortar da entrada do corredor para o cômodo de destino, omitir espera ou mostrar outra ação simultânea. O leitor precisa reconhecer lugar, causa e consequência; não precisa acompanhar toda caminhada. Repetir o mesmo instante por outra fonte somente quando a repetição acrescentar informação. Uma câmera registra a tentativa de resgate; outra revela o procedimento que a torna inútil.

**Abertura fixa:** L1-01 festa já acontecendo pela segurança → L1-02 chegada do trio pela segurança → L1-03 analógica de Nina → **L1-04 digital Full HD de Fred, em outro cômodo**. Não gastar uma quarta página continuando a chegada. O quarto POV, subjetivo, só aparece quando André perde a possibilidade de ser visto apenas de fora.

A obrigação de usar analógica pertence ao trabalho escolar de Nina; Fred usa a digital por escolha para produzir conteúdo para a POW-POW. Não obrigar os dois dispositivos a cumprir a mesma regra escolar.

O horror progride de festa → jogo que parece defeituoso → evidência física → tentativa de fuga → vitória de Kronos. As falas dão desejo, atrito, afeto e decisões. A narração é uma intervenção editorial breve, sem revelar o mecanismo. O silêncio permanece quando ele faz a cena funcionar.

### 1.1 Fontes e precedência

1. Orientações de Isaías em 19/10/2026, incorporadas neste documento.
2. Manifesto e regras universais: [WEBSHARD_GUIA_DE_PRODUCAO.md](../WEBSHARD_GUIA_DE_PRODUCAO.md), §§2–7; processo e referências: [PRODUCAO_IMAGEM.md](../../PRODUCAO_IMAGEM.md).
3. Este roteiro determina os acontecimentos, as exceções deste especial e os textos das páginas.
4. Fichas aprovadas determinam aparência; plantas aprovadas determinam geografia. Uma ficha não modifica o roteiro nem muda a identidade de um personagem.
5. Para vozes e identidade, conferir os capítulos atuais de `src/data/historias/lutas-de-ilusao/pt/`, sobretudo 01–03, e `src/data/personagens-pt.json`. As fichas em `docs/LDI/Conhecimento_Otimizado/` ajudam, mas contêm versões antigas divergentes.

A paleta, o neon e o desenho dos capítulos regulares do LDI não são obrigações universais do WEB SHARD. Neste especial: realismo fotográfico extremo e filamentos tecnológicos discretos. A verticalidade, a clareza, a letra grande, a área segura e a hierarquia entre painéis e estilhaços continuam obrigatórias.

### 1.2 Numeração e nove páginas editoriais

`L1-01` significa página narrativa 01 do lançamento 1; não significa página física 01, nem prancha de ambiente 01. Cada lançamento tem Lx-01 a Lx-51 e **nove posições editoriais separadas**, totalizando 60. Não preencher essas nove posições com cenas da história. Capa, entrada, aviso, divulgação, créditos e contracapa serão diagramados com os materiais editoriais oficiais; não inventar aqui textos de aviso, anúncios ou uma ordem que ainda não foi fornecida. A posição física das nove páginas depende desse espelho editorial.

## 2. Regras visuais e contrato de todos os prompts

**Um prompt de página é a soma desta seção, da ficha de fonte (§3), do estado de continuidade (§§4–6) e do bloco Lx-NN correspondente.** Os blocos abaixo são instruções de produção, não apenas títulos de eventos. Antes de enviar uma página ao gerador, reunir essas partes num único texto e anexar as referências reais pelo nome. Não mandar só o resumo da página, nem pedir que o gerador abra links ou consulte este documento.

- **EXTREMO REALISMO fotográfico**, 960 × 1637 px, full-bleed. Pele, cabelo, bronze, tecidos e pedra com textura natural; anatomia e perspectiva plausíveis. O dispositivo governa a nitidez e a exposição. A arena é simulada dentro da história, mas a imagem não assume estética de videogame ou ilustração.
- A página vertical é montagem editorial de trechos e recortes das fontes. Não exige que toda filmadora tenha gravado um quadro vertical nem permite criar um ângulo que não foi registrado. Ruído e HUD pertencem ao feed; filamentos, balões e faixas pertencem à leitura WEB SHARD.
- Conteúdo indispensável dentro de x=100–860 e y=80–1557, aproximadamente. O cenário ocupa as bordas; a safe area não vira margem branca.
- Um ou dois painéis grandes. Três somente quando o bloco justificar progressão rápida; quatro não serão usados. **L1-01 foi reduzida a dois feeds legíveis**, em vez da grade antiga de quatro. Entrada e corredor são estabelecidos na página seguinte. Não disfarçar uma terceira cena inteira como estilhaço.
- Cortes de 8–15°, direção coerente dentro da página, leitura de cima para baixo. Escolher a inclinação por sequência; não alternar diagonais aleatoriamente. Sem divisão em página de painel único.
- Separação por filamentos tecnológicos finos e escuros, como fibra óptica e microcabos vivos. Um reflexo discreto indica a força dominante; não vira neon, fumaça, eletricidade ou moldura grossa. O separador é composição editorial, não objeto registrado pela câmera.
- Enquadrar a ação necessária. Plano geral só para estabelecer espaço, mudar escala ou mostrar uma relação espacial decisiva. A câmera portátil não encontra sempre rostos perfeitamente compostos; a segurança não faz close, zoom nem acompanha pessoas.
- **Shards:** nenhum por padrão. Quando especificado, um fragmento irregular sobreposto amplia um detalhe já captado pela mesma fonte naquele momento. Não mostrar o olho de Nina de fora quando ela opera a analógica, nem a mão de Fred inteira segurando a câmera pelo POV do próprio aparelho. Uma percepção subjetiva não vira estilhaço decorativo de uma fonte física.
- Balões brancos, letras e contornos na cor de voz, caixa alta, comic bold condensada, mesma fonte no elenco. Reservar espaço para texto desde o quadro; linhas curtas, sem hifenização. Uma palavra pode ganhar ênfase. O guia não fixa uma família comprovada nem um mínimo universal em pixels; não tratar Anime Ace/LETREIRO.png como referência já aprovada deste reinício. A ficha tipográfica precede a geração.
- Textos entre aspas nos blocos são literais; o nome antes dos dois-pontos indica o falante para produção, **não é escrito na arte**. Copiar uma vez, com acentos. Falas fora de quadro apontam para o operador ou para a posição espacial da voz; nunca para um personagem errado. Pensamento é explicitamente identificado e só aparece na percepção subjetiva.
- Narração: faixa estreita de fita magnética escura, letras claras legíveis, sem cauda. Não é áudio da vigilância. O número de faixas é o indicado na página. Sem narração adicional sobre o que a imagem já explica.
- Conservar as roupas, a sujeira acumulada, os objetos, a mão que opera a câmera e os obstáculos. O reset muda o estado do evento conforme o roteiro; não permite trocar silenciosamente a aparência das pessoas.
- A consequência dos ataques é legível por tensão, cabos envolvendo membros, imobilidade, rosto, som captado e reação; a revisão não exige exposição de lesões. Não esconder uma morte inteira em ruído.
- Cada página será revisada a 320, 360, 390, 430 e 480 px. Se a fala não couber, editar/recompor; não diminuir a letra para salvar um quadro lotado. Isso é requisito da revisão visual futura, não teste já realizado em artes inexistentes.

### 2.1 Blur, sujeira e falhas com função

**BLUR-M:** rastro de movimento durante uma virada, corrida ou queda. Mantém a resposta do dispositivo: analógico pode ter arrasto de sinal; digital pode borrar por movimento/exposição sem adquirir VHS. **LENTE:** tecido encostado, marca de dedo, poeira ou contato com o chão; registrar onde a marca fica até alguém limpá-la. **FOCO:** caça de foco por proximidade/obstrução; não é defeito sobrenatural automático.

O borrão pode ser quase ilegível por um painel curto, desde que haja âncora reconhecível antes e recuperação de informação depois. Um som captado pode atravessar esse quadro. A página seguinte não muda magicamente de lugar ou operador. Não escrever instruções paradoxais como “tudo ilegível, mas identificar seis pessoas”. Quando a informação depende do texto, mantê-lo na área segura e legível.

A vigilância permanece fixa: pessoas em movimento podem borrar, o sensor pode comprimir ou perder frames, mas a imagem inteira não ganha tremor de mão. Um trecho borrado não pode esconder troca de grupo, reposicionamento de câmera, passagem de mundo, descoberta da fita, captura ou resultado do ataque. O bloco indica **a causa, o que se perde e qual âncora recupera a leitura**. Nem toda página de corrida precisa de blur.

## 3. Quatro linguagens, quatro limites

| Fonte | Imagem e áudio | O que pode mostrar | Limite e olhar |
|---|---|---|---|
| C — segurança de Kronos | Preto e branco, câmera física fixa, ruído discreto, sem áudio | Geografia real, festa, laboratório, procedimentos, deslocamentos, corpos, DELETE | Não mostra interior do LDI, pensamentos, conversas audíveis ou movimentos de câmera. |
| A — analógica de Nina | Cor analógica, resolução irregular, ruído de crominância/tracking moderado; áudio ambiente e vozes | O mundo real na direção da lente; fica gravando quando apoiada | Não entra no LDI nem mostra automaticamente quem a segura. A gravação resiste ao reset. |
| D — digital de Fred | Cor limpa Full HD, áudio; tremor/foco/exposição fisicamente possíveis | Mundo real; no LDI, registro do dispositivo virtual vinculado ao SBI | Só mostra a rota de Fred ou o campo de um apoio estabelecido. Não visita outra câmara sozinha. |
| S — percepção subjetiva | Abertura orgânica de olho; sem REC/HUD; sons percebidos e pensamento curto | Visão e experiência imediata de André, Anderson e, no final, Fred/Nina/Jack/Kim | Não é arquivo recuperado, telepatia ou quinta câmera; não fornece conhecimento fora da vítima. |

**HUD fechado:** C usa `REC`, identificador CAM/local, `31/10` e hora do registro. A usa `REC` e `TC` de fita; relógio físico aparece quando for pista. D usa `REC` e `FHD`; sem HUD analógico. S não tem texto técnico. Os desenhos de interface precisam de ficha própria; os arquivos de referência disponíveis não incluem uma ficha final desses HUDs. O ano do mundo não está definido: não imprimir 1998/2026 nem inventar um ano. A hora da segurança acompanha o registro físico, e não o relógio cenográfico reiniciado.

**Sem som na segurança:** não transcrever diálogo ou onomatopeia por cima de C como se tivesse microfone. `SEM ÁUDIO` pode aparecer uma vez como rótulo editorial em L1-01; não encher a festa de balões “NO SOUND”. Nos anúncios, a fala passa somente entre A e D, que têm áudio. Uma inserção de C interrompe o diálogo impresso; não serve para acrescentar frases que ninguém registrou.

**Olhares:** na gravação para a POW-POW, Fred se dirige à lente do próprio aparelho apoiado; exceção diegética explícita. Nas demais páginas, o olhar tem alvo dentro da cena. Kronos fala olhando para pessoas, a mesa ou um monitor da sala, sem encarar o leitor. Câmera deixada fixa continua fixa mesmo quando alguém sai do enquadramento.

### 3.1 Registro digital dentro do LDI

O roteiro recebido já exigia D no LDI, mas não explicava sua passagem. **Convenção de encenação desta revisão:** Fred vincula a câmera ao modo de registro do SBI antes da conexão; a sala real retém o aparelho físico, e o ambiente virtual fornece sua representação de captura. Uma tela de vínculo, um gesto de confirmação e a retomada da mesma empunhadura tornam a passagem compreensível. Não afirmar que uma câmera física atravessou a sala, nem explicar o funcionamento espiritual do LDI. O registro virtual tem o mesmo POV limitado de uma câmera portada; não é câmera livre do jogo.

O arquivo digital do ciclo anterior desaparece no reset. A câmera física pode conservar marcas de uso, mas a sessão virtual recomeça; bateria “milagrosamente cheia” não será usada como prova. A analógica conserva a fita e o relógio físico. Não alegar que ambas guardaram todas as provas.

## 4. Geografia, custódia e relógios

### 4.1 Planta dramática a fixar antes das artes

```text
Entrada principal — vestíbulo — corredor oeste — salão da festa
                                             ├ buffet lateral
                                             ├ lounge leste de Fred (vão acústico; porta de sensor para passagem de serviço que retorna ao corredor oeste)
                                             ├ corredor técnico — laboratório SBI; bifurcação para circulação/escadaria
                                             └ corredor de circulação — escadaria/patamar
Laboratório — acesso de serviço — salão do banquete (área distinta da festa)
LDI: arena — portões A / B / C — três câmaras de gladiadores
```

Esse é o projeto de conexões desta revisão, não uma planta antiga já aprovada. A prancha-mestra deverá fixar dimensões, aberturas, eixos e retornos. A passagem de serviço do lounge é uma alternativa já existente ao retorno pelo salão, não uma saída secreta criada na fuga; o atendente a usa no primeiro ciclo. O lounge é outro cômodo, mas o anúncio do salão chega por seu vão; não inventar teletransporte de áudio. Na fuga, saída principal e escadaria são tentativas distintas; os perseguidores fecham caminhos já apresentados. Nenhuma porta secreta resolve ou causa uma captura.

### 4.2 Mapa de pessoas e cadeiras

| Ciclo | Convidados anunciados | Participantes | Plateia virtual | Saída |
|---|---|---|---|---|
| 1 | 100 | Kim, Jack, Nina, Fred, Brock, Jason, André, Anderson, Michael: 9 | 91 | André morre; restam 8 participantes. |
| 2 | 50 | Os mesmos, sem André: 8 | 42 | Jason, Brock, Michael e Anderson morrem; restam Kim, Jack, Nina e Fred. |
| 3 | 10 | Os quatro sobreviventes + seis convidados genéricos | Não repetir plateia de 91/42 | Os seis genéricos se mascaram; Jack, Nina e Fred são drenados; Kim é preservado. |

Funcionários da mansão não entram automaticamente no número de convidados. Os seis convidados do ciclo 3 são reconhecíveis antes/depois da máscara; não confundi-los com os funcionários que já serviam a festa. O banquete tem **nove drenados: seis genéricos + Jack + Nina + Fred**, mais Kim e Kronos: onze ocupantes ao todo. André, Brock, Jason, Anderson e Michael não voltam como comensais.

Laboratório: nove bases e cadeiras no ciclo 1; uma cadeira retirada deixa oito no ciclo 2; quatro retiradas deixam quatro no ciclo 3, redistribuídas em torno do centro durante a manutenção vista por C. Manter vestígios da organização antiga e o mesmo contorno de sala. Não estreitar a sala quando faltam cadeiras. Fixar a cadeira de André dentro do campo de A no ciclo 1 e a de Brock em primeiro plano no ciclo 2. Os outros corpos podem ficar parcialmente fora do campo, nunca surgir todos num close impossível.

LDI: A contém Kim/Jack/Nina; B contém Fred/Brock/Jason; C contém André/Anderson/Michael no ciclo 1 e Anderson/Michael no ciclo 2. Fred vê os portões das outras câmaras de fora. O interior de A no ciclo 2 fica fora de campo; o roteiro não inventa uma quarta câmera para segui-lo. O interior de C chega pela percepção de Anderson. Os quatro sobreviventes não chegam ao fim por vencerem um monstro novo: o ciclo é encerrado pelo procedimento de Kronos.

### 4.3 Custódia das câmeras

| Trecho | Analógica A | Digital D |
|---|---|---|
| Festa L1 | Nina opera; Jack a segura por uma breve passagem mostrada | Apoiada no lounge para Fred aparecer; depois Fred a pega. |
| Conexão L1 | Nina apoia na mesa do laboratório; lente para a cadeira de André | Fred vincula ao SBI; aparelho físico fica no suporte; representação virtual com Fred. |
| Encerramento L1 | Continua registrando; um funcionário a recolhe e a devolve na reorganização | Sessão apagada; aparelho real reposicionado para o ciclo seguinte. |
| Festa/conexão L2 | Nina recebe; deixa num apoio mais baixo, com Brock no campo | Fred opera a sessão seguinte; não vê as gravações anteriores. |
| Encerramento L2 | Funcionário transporta e entrega sem desligar; o trajeto pode ser elíptico | Sessão anterior apagada. |
| Investigação L3 | Nina entrega a Jack; D filma o visor ocular de A durante a revisão da fita | Fred filma os outros e a reprodução: não criar uma vista externa neutra. |
| Fuga L3 | Jack opera; alça no punho evita perder o aparelho na primeira queda | Fred opera, sempre com Kim na mesma rota. |
| Captura L3 | Segurança mostra um Mascarado recolher A e apoiá-la no laboratório | Segurança mostra captura/vínculo; no LDI Fred apoia a representação perto da entrada. |
| Desfecho | Kronos recolhe A, vira a lente para si sem olhar direto e passa a um funcionário; este registra o percurso e a apoia no banquete | D fica abandonada no ponto estabelecido; não acompanha Kronos depois que Fred morre. |

Não mostrar Kronos segurando A de fora pelo POV de A. O gesto de recolher o aparelho é C; a fala seguinte é A, com enquadramento próximo compatível com braço estendido/lente virada. A passagem para o funcionário precisa ser visível no registro; depois a câmera permanece no apoio final.

### 4.4 Tempo do evento, tempo físico e tempo de fita

O relógio cenográfico do salão volta a **20:00** em cada ciclo. No relógio físico de algarismos romanos, isso é orientação dos ponteiros: hora em VIII, minutos em XII, com a noite já estabelecida. Não acrescentar uma tela digital ou escrever 20:00 sobre o mostrador da referência; os números 20:00 nesta documentação indicam o horário da ação. A arena diurna tem um mostrador cerimonial de referência `20:00` integrado ao relógio de sol: é interface da simulação, não o horário astronômico do sol. O céu da arena permanece claro e seco. Mansão: noite.

A começa a registrar às **19:47**. Na primeira apresentação de seu HUD, TC=`00:00:00`; no início da investigação do ciclo 3, TC=`02:50:00` aproximadamente. O tempo de fita não é a hora do relógio da parede. **153 páginas não equivalem a 153 minutos.** Conexões, espera e reorganizações podem ser omitidas; o contador registra o intervalo real omitido. Não atribuir avanço de uma hora a um único golpe nem desenhar uma espera só para justificar duração.

Durante o PLAY da fita, TC pode recuar porque estamos vendo gravação anterior. O relógio físico continua avançando. Jack retorna ao fim gravado antes de retomar REC; não rebobina e grava por cima da prova. A frase antiga “contador nunca diminui em nenhuma circunstância” foi corrigida: **o reset não apaga/reinicia a fita**, mas reprodução tem seu próprio estado. Uma breve pausa voluntária para PLAY é reconhecida, não escondida como falha de continuidade. Definir no objeto uma fita de longa duração e alimentação capaz de cobrir o evento; não travar bateria em 100% durante três horas.

**Fechamento de HUD antes das artes:** o mapa de montagem deve anotar hora/TC de entrada e saída de cada tomada, com os pares simultâneos abaixo no mesmo instante. Os blocos não autorizam o gerador a inventar números intermediários. O ano e o valor do prêmio ainda não foram fornecidos; as fichas disponíveis e os complementos faltantes estão discriminados em §13.1; usar redação sem valor/ano e anexos verificados, em vez de fabricar dados. O roteiro é legível sem esses números técnicos.

## 5. Pistas triviais que mudam de função

| Pista | Loop 1: parece cotidiana | Loop 2: leitor reconhece a alteração | Loop 3: alteração vira decisão/consequência |
|---|---|---|---|
| Uva e lugar no buffet | Desconhecido divide comida com Kim e engasga; se recompõe | Lugar vazio; Jack pega a mesma uva; Nina o interrompe | Nina afasta a tigela antes de oferecerem; não precisa lembrar o motivo. |
| Cabo baixo no corredor técnico | Michael tropeça; um comentário curto, segue | Jack tira o cabo do caminho antes de Michael pisar | Sem Michael, Jack já passa o cabo para o lado ao fugir; o caminho útil é lembrado pelo corpo. |
| Aceitação da luta | Jack brinca e aceita André | Jack aceita Jason; Nina diz “Jack, não luta”; ele recua | Kim tenta negociar a própria vida pelos amigos; Kronos elimina a possibilidade de escolha. |
| Porta do lounge | Atendente com bandeja aciona sensor; porta abre | Fred espera a abertura antes do gesto do atendente, sem perceber | A mesma porta não abre; a familiaridade vira armadilha, e Kim procura outra rota. |
| Contagem do vídeo | Fred conta “três, dois...” e Michael invade o quadro | Falta André; Fred deixa um espaço absurdo ao organizar o grupo | Fred tenta falar para a lente sozinho e interrompe a própria pose. A ausência pesa sem recapitulação verbal. |
| Alça da analógica | Nina exige que Jack passe a alça no punho ao segurá-la | Jack faz o gesto antes que ela peça | Na fuga a câmera escorrega, a alça segura; o quadro borra e recupera. A testemunha continua. |

Essas pistas não são uma lista que os personagens explicam ao leitor. Não repetir a mesma fala nos três ciclos. Um objeto só vira destaque se seu estado mudar. O espectador do quadrinho pode perceber ausência e repetição antes dos participantes.

## 6. Vozes, identidade e texto

**Correção de identidade:** Kim tem cabelo preto, traços indígenas e pele marrom; Jack tem dreads verdes e pele mais escura. A revisão recebida trocava os dois. Figurino romano deve ser desenhado para a identidade correta, sem trocar corpos para conservar uma frase antiga. Nina mantém cabelo rosa; Brock é careca; Jason é o mais alto/forte; Michael tem cabelo ruivo e cicatriz; Anderson tem franja preta; André é gordo e forte, com cabelo black. Conferir as fichas atuais antes de gerar. Não transportar automaticamente uniforme escolar ou avatar steampunk para a festa romana.

Kim: seco, faminto e impaciente; age para ajudar antes de conseguir nomear o que sente. Jack: provoca, improvisa e se protege com humor; quando tem medo, a brincadeira falha. Nina: direta, observadora, ativa; a intuição não a transforma em narradora da mitologia. Fred: performa prestígio, depois apela à influência do pai e perde a pose. Brock: pragmático, protetor de André; a força resolve o primeiro cabo, não o procedimento. André: compromisso simples com a irmã. Jason: humor encobre necessidade de dinheiro para a família. Anderson: observa saídas, quer deixar de trabalhar para Fred. Michael: busca aceitação, invade a gravação e força uma coragem que não sustenta.

Preservar o quase-casal Jack/Nina previsto para este especial; não converter essa escolha em atualização romântica do romance inteiro. Kronos fala como anfitrião: frases calmas, controle do espaço e promessas que mudam de sentido. A explicação sobre almas e o Sangue Primordial não vira monólogo na festa.

| Voz | Cor de texto/contorno | Observação |
|---|---|---|
| Kim | `#1E6FE0` | Base do guia geral. |
| Jack | `#22C55E` | Contorno fino escuro na letra quando necessário ao contraste; não usar o glow como tinta. |
| Nina | `#B82E69` | Rosa framboesa do guia. |
| Fred | `#C9A227` | Contorno fino escuro indispensável para o dourado sobre branco. |
| Brock | `#8B1E1E` | Marrom-vinho do guia. |
| Anderson | `#4B5563` | Cinza-chumbo do guia, corrigindo o ciano antigo que confundia voz e dominância. |
| André | `#9A4A16` | Tom editorial do laranja queimado do especial. |
| Jason | `#6D28A6` | Tom editorial violeta. |
| Michael | `#155E63` | Tom editorial azul-petróleo. |
| Kronos | `#4B5058` | Tom editorial cinza metálico, legível no branco. |
| Desconhecido | `#6B543A` | Tom editorial bronze escuro; fala única de função cotidiana. |

Os tons editoriais novos precisam constar da ficha de letreiramento antes de produzir a arte; não são paleta retroativa dos capítulos regulares. Dominância dos filamentos: Kim azul; Jack verde; Nina rosa; Fred dourado; Brock vinho; André laranja; Jason violeta; Michael petróleo; Anderson ciano; Kronos metálico; funcionários bronze; cabos carmesim. Uma página pode ter fala de uma pessoa e dominância de outra.

## 7. Como ler os blocos de página

Em cada bloco: **Fonte** determina a linguagem, o operador e o local; **Quadros** fecha o número, o enquadramento, o acontecimento e eventuais shards/blur; **Texto** lista tudo que pode ser acrescentado além do HUD da fonte; **Ligação** fixa a informação nova e a saída para o corte seguinte. Sem narração/SFX/shards adicionais quando não listados. As cores seguem §6; filamentos seguem a dominância indicada. A narrativa usa português brasileiro; localização EN/ES ocorrerá depois do texto autoral e não foi executada nesta revisão.

As primeiras dez páginas estão fechadas na nova ordem. As demais completam os 51 acontecimentos visuais de cada lançamento, sem reapresentar entradas nem prolongar o mesmo resgate para preencher contagem. Em duas fontes do mesmo instante, o áudio impresso avança; nunca duplicar uma frase para provar sincronismo.

## 8. Lançamento 1 — Loop 1: o espetáculo se rompe

### L1-01 — A festa já começou
**Fonte:** C; CAM 03 SALÃO e CAM 04 PISCINA; fixas; dominância metálica.
**Quadros:** dois feeds simultâneos, grandes, diagonais coerentes. Salão cheio, funcionários servindo; piscina ocupada em área reconhecível da mesma mansão. Sem personagens principais em destaque, sem laboratório, sem shards. A câmera observa atividade, não apresenta um catálogo de arquitetura.
**Texto:** faixa: “ESPECIAL DE HALLOWEEN DE LUTAS DE ILUSÃO: AQUI TUDO COMEÇA E AQUI TUDO TERMINA.” Rótulo editorial único: “SEM ÁUDIO”.
**Ligação:** o leitor conhece uma festa em andamento e o olhar fixo que voltará no encerramento. A entrada será vista quando alguém chegar.

### L1-02 — Os três chegam
**Fonte:** C; CAM 01 ENTRADA, depois CAM 02 CORREDOR OESTE; dominância bronze.
**Quadros:** dois painéis sequenciais, horários progressivos. Primeiro: trio atravessa a entrada, Nina filmando. Segundo: já no fim do corredor oeste, Kim afasta o drapeado para passar no vão do salão; Jack logo atrás. O percurso intermediário foi omitido. Sem sala SBI, sem shards.
**Texto:** faixa: “CONVIDADOS ESPECIAIS ACABAM DE CHEGAR.” Nenhuma fala captada.
**Ligação:** o gesto de Kim no vão é a âncora da página seguinte, sem reencenar toda a caminhada.

### L1-03 — Agora estamos na mão de Nina
**Fonte:** A, operada por Nina no limiar do salão; dominância verde. REC e início de TC, imagem colorida analógica.
**Quadros:** dois painéis. Retomar Kim terminando de afastar o tecido, agora do ângulo atrás dele; Jack responde. Segundo: Nina vira um pouco para a decoração necessária, com Jack ainda na margem. Um shard subordinado do tecido/bronze já registrado; não inventar plano externo de Nina.
**Texto:** Kim: “SÓ VAMOS COMER E DEPOIS VAMOS EMBORA PRA CASA.” Jack: “TÁ BOM, TÁ BOM, PASSA A FOME.” Nina, fora do quadro: “O KRONOS CAPRICHOU NESSA FESTA, HEIN?”
**Ligação:** o leitor reconhece lugar e gesto, mas ganha voz e intimidade. Kim aponta o buffet. Não continuar a mesma entrada na página 4.

### L1-04 — Em outro cômodo, outra imagem
**Fonte:** D, apoiada no lounge leste; Fred diante da própria lente; dominância dourada. Full HD colorida, limpa.
**Quadros:** dois painéis no mesmo eixo fixo. Fred prepara a pose e conta; Michael invade a lateral antes do fim. O vão ao fundo deixa reconhecer a luz do salão, sem trazer o trio para o mesmo cômodo. Sem shards.
**Texto:** faixa: “OUTRO CÔMODO. MESMA FESTA.” Fred: “TRÊS, DOIS...” / “POW-POW, HOJE O HYPERMOMENT É MEU!” Michael: “TÔ NA IMAGEM?”
**Ligação:** corte paralelo, não salto de horas. Terceira fonte apresentada em quatro páginas; a interrupção trivial terá versões diferentes nos resets.

### L1-05 — Um compromisso banal
**Fonte:** D ainda apoiada; lounge; dominância laranja de André.
**Quadros:** dois painéis. Fred tenta refazer a pose; André passa atrás com Brock e confere dois ingressos. Um shard dos ingressos, no campo já visível, sem nomes/títulos legíveis.
**Texto:** Fred: “DÁ PRA NÃO PASSAR NA FRENTE?” André: “SÓ NÃO DEMORA. PROMETI CINEMA PRA MINHA IRMÃ.” Brock: “A GENTE SAI A TEMPO.”
**Ligação:** André tem vida depois da festa; Brock assume um compromisso com ele. A informação não recebe música, narração de presságio nem close de despedida.

### L1-06 — A porta abre sozinha
**Fonte:** D; Fred pega o aparelho do apoio e aponta para a porta do lounge; dominância dourada.
**Quadros:** dois painéis. Gesto de recolher: dedos entram na borda e o eixo sobe, sem mostrar Fred de fora. Atendente chega pela passagem de serviço com bandeja e aciona o sensor com o antebraço; a porta abre. O grupo continua à vista no lounge, sem saída ainda.
**Texto:** Fred, atrás da câmera: “ATÉ A PORTA É MAIS CARA QUE A SUA CASA.” Anderson: “ENTÃO PARA DE SEGURAR ELA.”
**Ligação:** sensor e batente ficam estabelecidos; a piada de Fred mantém a pose e encobre um mecanismo que depois falhará.

### L1-07 — A uva
**Fonte:** A nas mãos de Nina, buffet; dominância azul.
**Quadros:** dois painéis. Kim já comendo ao lado do desconhecido; depois o homem tosse com uma uva e Kim lhe aproxima água. Um shard da mão e da tigela, mesmo momento. Nada de queda ou morte.
**Texto:** desconhecido: “ESSA AQUI TÁ BOA.” Kim: “DEIXA UM POUCO PRA MIM.” / “ÁGUA AÍ.”
**Ligação:** ele se recompõe e sinaliza que está bem. Identificar seu lugar na borda do balcão e a tigela; não transformar em retrato misterioso.

### L1-08 — O anfitrião muda o fluxo
**Fonte:** C; CAM 03 SALÃO e CAM 05 LOUNGE; dominância metálica.
**Quadros:** dois feeds do mesmo instante. Kronos chega à área do anúncio e os funcionários abrem espaço; no lounge, Fred vira D para o vão, antes ocupado pelo atendente. Nina termina de desviar a lente do buffet. Sem áudio, sem shards.
**Texto:** nenhum além do HUD.
**Ligação:** a segurança acrescenta posição e orientação das duas câmeras. Não repete o engasgo nem o vídeo inteiro. O discurso começa na fonte sonora seguinte.

### L1-09 — Cem convidados
**Fonte:** A, Nina do salão para Kronos; dominância metálica.
**Quadros:** dois painéis, mesmo eixo portátil. Kronos pede atenção; segundo quadro permite ver Jack reagindo na margem, sem corte para uma câmera externa. Sem shards.
**Texto:** Kronos: “BOA NOITE AOS NOSSOS CEM CONVIDADOS ESPECIAIS.” / “NOVE DE VOCÊS VÃO ESTREAR O NOVO EVENTO.”
**Ligação:** “cem” e “nove” ficam claros, sem pessoas dizendo que são pistas. O anúncio continua no mesmo tempo pela digital.

### L1-10 — A promessa de prêmio
**Fonte:** D, Fred filmando os capangas no lounge, com o anúncio vindo pelo vão; dominância dourada.
**Quadros:** dois painéis. Reação de Jason ao prêmio, Brock olha para André; segundo quadro Fred ajusta o enquadramento, não aparece de frente segurando o próprio aparelho. Sem shards.
**Texto:** Kronos, voz do salão: “E O VENCEDOR LEVA UM PRÊMIO EM DINHEIRO.” Jason: “AÍ EU GOSTEI.” Fred, fora do quadro: “EU FALEI QUE IA RENDER.”
**Ligação:** trecho novo do discurso. Não repetir agradecimento, inventar valor do prêmio ou simular fala por cima de C.

### L1-11 — O motivo de Kim muda
**Fonte:** A, Nina para Kim e Jack; salão; dominância azul.
**Quadros:** dois painéis. Kim para de mastigar ao ouvir “prêmio”; Jack repara antes de ele responder. O desconhecido continua vivo no buffet ao fundo parcial.
**Texto:** Jack: “NÃO ERA COMER E IR EMBORA?” Kim: “DÁ PRA COMER DEPOIS.”
**Ligação:** a adesão nasce da ação e do dinheiro, sem monólogo sobre ganância.

### L1-12 — Quem fica assistindo
**Fonte:** A, retorno curto a Kronos; dominância metálica.
**Quadros:** um painel. Kronos indica o acesso técnico, sem abrir ainda a sala. Quadro de informação útil, não panorâmica da festa.
**Texto:** Kronos: “OS OUTROS NOVENTA E UM ACOMPANHAM PELOS PRÓPRIOS SBIS.” / “DEPOIS, TODOS PODERÃO PARTICIPAR.”
**Ligação:** estabelece os 91 e conduz o movimento seguinte. Não ilustrar 91 corpos contáveis num quadro minúsculo.

### L1-13 — Segura direito
**Fonte:** A, Nina entrega a Jack, ainda no salão; dominância rosa.
**Quadros:** dois painéis. Nina filma Jack estendendo a mão; o enquadramento baixa enquanto ele recebe, mostrando a alça passando em seu punho. Não mostrar os dois aparelhos ou Nina de frente antes da troca.
**Texto:** Nina: “PASSA A ALÇA NO PUNHO.” Jack: “EU SEI SEGURAR UMA CÂMERA.”
**Ligação:** troca material do operador, não troca de fonte. A posição baixa conduz à retomada na mão de Jack.

### L1-14 — Dois grupos entram no mesmo fluxo
**Fonte:** C; CAM 03 SALÃO; dominância bronze.
**Quadros:** um painel fixo. Trio e grupo de Fred convergem para o corredor técnico. Jack segura A com alça no punho; Fred segura D. Atendente indica o caminho. O desconhecido permanece no buffet, fora dos nove.
**Texto:** nenhum além do HUD.
**Ligação:** a segurança confirma custódia e seleção sem fazer apresentação nominal de nove pessoas.

### L1-15 — Fantasia e trabalho
**Fonte:** A, Jack filma Nina durante o deslocamento já iniciado; dominância verde.
**Quadros:** dois painéis próximos. Nina nota o drapeado desconfortável de Jack sem olhar para a lente; depois ajusta uma dobra que invade a borda do registro. Sem plano inteiro obrigatório.
**Texto:** Jack, atrás da câmera: “VOCÊ ESCOLHEU ESSA FANTASIA SÓ PRA ME VER SOFRER?” Nina: “PRA VER SE VOCÊ PARA QUIETO NO TRABALHO.”
**Ligação:** aproximação dos dois e motivo escolar da filmagem surgem numa ação útil; não explicar a relação em narração.

### L1-16 — O outro trabalho de Anderson
**Fonte:** D, Fred atrás do grupo no acesso técnico; dominância dourada.
**Quadros:** dois painéis. Anderson pede que Fred caminhe; Jason olha para o prêmio anunciado e desfaz a piada quando Brock o encara.
**Texto:** Anderson: “ÚLTIMO TRABALHO QUE EU FAÇO PRA VOCÊ.” Jason: “SE EU GANHAR, RESOLVO LÁ EM CASA.” Fred: “PRIMEIRO TEM QUE GANHAR.”
**Ligação:** duas motivações em conflito curto, não ficha biográfica. Nina recupera A fora deste enquadramento; sua devolução é registrada na página seguinte pela fonte que consegue vê-la.

### L1-17 — O tropeço
**Fonte:** D, Fred no corredor técnico; dominância petróleo.
**Quadros:** dois painéis. Ao fundo, Jack entrega A a Nina; Michael passa o pé num cabo baixo junto ao batente e quase cai. Jason o segura pela roupa e já continua. Um shard do cabo no mesmo piso.
**Texto:** Michael: “PORRA!” Jason: “SEGURA A POSE, ESTRELA.”
**Ligação:** fixar lado do batente, trajeto do cabo e direção de marcha. Acidente rápido; não gastar outra página rindo dele.

### L1-18 — Nove lugares
**Fonte:** A de Nina, entrada do laboratório; dominância bronze.
**Quadros:** um painel geral funcional. Nove cadeiras SBI e rota de serviço reconhecíveis; mesa lateral no primeiro plano. Nina se aproxima dessa mesa, sem o quadro revelar uma décima cadeira.
**Texto:** Nina, fora do quadro: “ISSO É BEM MAIS VELHO DO QUE EU ESPERAVA.” Jack: “COMBINA COM A TUA CÂMERA.”
**Ligação:** agora o laboratório pode ser visto. O espanto pertence ao desenho ritualístico de equipamento técnico, não a ignorância sobre o que é um SBI.

### L1-19 — Fred exige um registro
**Fonte:** D, empunhada por Fred junto à estação; dominância dourada.
**Quadros:** dois painéis. A lente baixa para o ponto de vínculo do dispositivo; a mão confirma a conexão. O grupo ainda está acordado.
**Texto:** Fred: “EU VOU GRAVAR LÁ DENTRO.” Brock: “SÓ NÃO ATRAPALHA.” Interface literal única: “REGISTRO VINCULADO”.
**Ligação:** planta o modo de captura virtual. Nenhum aparelho físico será mostrado atravessando o LDI.

### L1-20 — As mãos ficam livres
**Fonte:** C; CAM 06 LABORATÓRIO; dominância bronze.
**Quadros:** um painel. Fred encaixa D no suporte físico depois de vincular; Nina ainda segura A. Funcionários apontam os assentos. Nove participantes reconhecíveis, sem fila de retratos.
**Texto:** nenhum além do HUD.
**Ligação:** mostra onde D fica de verdade e por que Fred não continua filmando fisicamente quando preso.

### L1-21 — A analógica fica
**Fonte:** A, Nina ajusta a mesa lateral; dominância rosa.
**Quadros:** dois painéis. Quadro inclina ao apoiar; segundo já está estável, cadeira de André dentro do campo. Nina entra pela lateral da própria imagem, agora que não está segurando a câmera.
**Texto:** Nina: “VOU DEIXAR GRAVANDO AQUI.” Jack, fora do campo: “NÃO VAI ESQUECER ELA.”
**Ligação:** apoio, altura e eixo ficam fechados. Dali em diante A não se aproxima do rosto de André por vontade narrativa.

### L1-22 — O aperto
**Fonte:** A fixa na mesa; dominância bronze.
**Quadros:** dois painéis do mesmo campo em instantes diferentes. André testa uma correia; Brock responde ao alcance do microfone, mesmo parcialmente fora da imagem. Funcionário fecha o conector.
**Texto:** André: “PRECISA APERTAR TANTO?” Brock: “JÁ JÁ ACABA.” SFX captado: “CLAC”.
**Ligação:** o gesto parece rotina de segurança e mais tarde vira contenção. Não antecipar a dor verdadeira.

### L1-23 — O lado de fora permanece
**Fonte:** C; CAM 06 LABORATÓRIO; dominância metálica.
**Quadros:** um painel fixo. Últimos capacetes conectados, A visível no apoio, D no suporte; porta técnica se fecha, cadeiras continuam onde estavam.
**Texto:** nenhum além do HUD.
**Ligação:** elipse assumida entre conexão e primeiro trecho útil da sessão virtual. Nenhuma pessoa entra fisicamente numa arena pela porta do laboratório.

### L1-24 — A primeira cela
**Fonte:** D virtual de Fred, câmara B; dominância dourada.
**Quadros:** dois painéis. Fred levanta a representação do aparelho na mesma empunhadura; Brock e Jason junto ao portão B. A luz diurna invade quando o portão abre.
**Texto:** Fred: “TÁ GRAVANDO.” Jason: “ENTÃO PEGA O MEU LADO BOM.”
**Ligação:** imagem limpa e REC/FHD confirmam D; não usar VHS ou uma tomada aérea do jogo.

### L1-25 — O portão do trio
**Fonte:** D, Fred sai de B; dominância verde.
**Quadros:** dois painéis. Primeiro, batente de B na borda enquanto Fred gira; segundo, portão A abre e Kim, Jack e Nina saem. Não cortar para dentro de A antes de ele poder vê-la.
**Texto:** Jack: “BONITO O PASSEIO.” Kim: “CADÊ O PRÊMIO?”
**Ligação:** os grupos passam a ocupar o mesmo espaço. A rotação é visível entre imagens, não posição impossível do operador.

### L1-26 — André vem atrás
**Fonte:** D, agora com visão do portão C; dominância laranja.
**Quadros:** dois painéis. André, Anderson e Michael deixam C; Brock levanta a mão para chamar André para perto. Um shard do gesto de Brock no quadro captado.
**Texto:** Brock: “AQUI, ANDRÉ.” André: “TÔ INDO.”
**Ligação:** fecha a divisão 3+3+3 e a amizade, sem reapresentar nomes em legendas.

### L1-27 — Noventa e um assistem
**Fonte:** D de Fred, margem da arena; dominância metálica.
**Quadros:** um painel em plano aberto com função: pista, portões e parte da plateia de aparência morta-viva sob sol escaldante. Não repetir esse panorama em todas as páginas seguintes.
**Texto:** Fred: “ISSO VAI DAR MUITO ACESSO.” Nina: “OLHA A CARA DESSE POVO.”
**Ligação:** Fred lê o desconforto como oportunidade; o leitor pode aceitar a plateia como estética da simulação.

### L1-28 — O anfitrião acima deles
**Fonte:** D, eixo para a sacada imperial; dominância metálica.
**Quadros:** um painel. Kronos como César grotesco, acima das arquibancadas; referência cerimonial `20:00` integrada ao relógio de sol. Sem trono no chão.
**Texto:** Kronos: “ESCOLHAM OS PRIMEIROS DESAFIANTES.”
**Ligação:** autoridade e regra aparente em uma frase. Não repetir a explicação do evento.

### L1-29 — André tem pressa
**Fonte:** D, Fred volta a lente ao grupo; dominância laranja.
**Quadros:** dois painéis. André ergue a mão; Brock tenta adiar por um instante, André sorri e dá de ombros.
**Texto:** André: “EU VOU. QUERO ACABAR LOGO.” Brock: “NEM VIU COMO É.” André: “TEM O CINEMA, MANO.”
**Ligação:** o compromisso cotidiano produz a decisão fatal, sem entrada de flashback da irmã.

### L1-30 — Jack aceita
**Fonte:** D; dominância verde.
**Quadros:** dois painéis. Jack se coloca como adversário; Kim observa sem alarme. Fred recua um passo para manter os dois no campo.
**Texto:** Jack: “FECHOU. PROMETO PEGAR LEVE.” Kim: “SÓ NÃO ENROLA.”
**Ligação:** a luta é uma escolha, ainda percebida como jogo. A aceitação será alterada no segundo ciclo.

### L1-31 — Um instante de hesitação
**Fonte:** D; Nina na margem do campo de Fred; dominância rosa.
**Quadros:** um painel. Nina quase ergue a mão para Jack; ele já segue para o centro, sem perceber. Foco continua no mesmo plano, sem close externo privilegiado.
**Texto:** Nina: “JACK...” Jack: “É RÁPIDO.”
**Ligação:** intuição pequena; Nina não adivinha a morte e não diz ainda a frase que mudará a luta.

### L1-32 — Filmando a brincadeira
**Fonte:** D; Fred ajusta a posição à margem; dominância dourada.
**Quadros:** dois painéis. Michael se oferece para entrar na imagem; Anderson o puxa para não tampar a luta. O centro continua visível.
**Texto:** Michael: “PEGA MINHA REAÇÃO.” Anderson: “SAI DA FRENTE, PORRA.”
**Ligação:** reafirma D como objeto disputado por exibicionismo e mostra onde os dois ficam quando começarem a rir.

### L1-33 — Não é uma luta séria
**Fonte:** D; dominância verde.
**Quadros:** dois painéis. Jack e André ajustam a distância; André abre a guarda de brincadeira. Enquadramento do torso e mãos, sem novo panorama.
**Texto:** André: “VAI, MANDA.” Jack: “NÃO VAI CHORAR DEPOIS.”
**Ligação:** prepara o contato sem sobrecarregar o quadro do impacto com piada e reação ao mesmo tempo.

### L1-34 — O soquinho
**Fonte:** D; dominância verde.
**Quadros:** dois painéis, contato leve e queda exagerada de André rindo. Um shard subordinado do punho tocando, não outro golpe.
**Texto:** SFX captado: “TOC”. André: “BOA. AGORA É MINHA VEZ.”
**Ligação:** o riso pertence ao jogo aparente. Não tornar o soco visualmente forte para justificar os cabos.

### L1-35 — Algo puxa por baixo
**Fonte:** D; dominância carmesim começa a substituir o verde.
**Quadros:** dois painéis. André firma a mão na areia para levantar; um cabo se prende no braço e impede o gesto. Fred não antecipa o local com um close perfeito.
**Texto:** André: “UÉ...”
**Ligação:** a primeira anomalia impede uma ação concreta; ainda não é um painel de execução inteira.

### L1-36 — A graça acaba
**Fonte:** D; dominância carmesim.
**Quadros:** dois painéis. Outros cabos envolvem André; sua expressão e a tensão corporal mudam. Jack para a poucos passos, mão ainda meio erguida.
**Texto:** André: “EI. TÁ DOENDO.” / “TÁ DOENDO DE VERDADE!”
**Ligação:** a voz transforma o registro: já não é reação de jogo. Cabos e corpos permanecem na mesma posição na troca de fonte.

### L1-37 — Kim entra no quadro
**Fonte:** D; Fred gira para acompanhar Kim; dominância azul.
**Quadros:** dois painéis. Kim cruza perto da lente; **BLUR-M** curto por virada brusca, com a capa como rastro. Segundo painel recupera o braço de André e Kim se abaixando no mesmo lado. Não esconder a chegada de Kim no borrão.
**Texto:** Kim: “SOLTA ELE!”
**Ligação:** a câmera perde a composição por uma causa visível; a ação continua legível quando recupera o foco.

### L1-38 — Outra mão, mesmo braço
**Fonte:** A fixa no laboratório, mesmo instante do bloqueio na arena; dominância bronze.
**Quadros:** dois painéis do eixo estabelecido. Um Mascarado conecta um cabo à região correspondente do corpo real de André; a mão dele contrai. O som é de metal/tecido e respiração, não os gritos da arena.
**Texto:** SFX captado: “CLIC”. Nenhuma fala do LDI.
**Ligação:** primeira convergência decisiva. O leitor ganha a causa física que os participantes não conseguem ver.

### L1-39 — A força não resolve
**Fonte:** D; dominância vinho de Brock.
**Quadros:** dois painéis. Brock e Jason chegam ao lado oposto de Kim; Brock puxa o mesmo feixe enquanto André tenta acompanhar o movimento. Não gerar mais ajudantes.
**Texto:** Brock: “CALMA. É SÓ O JOGO.” Kim: “ENTÃO DESLIGA ESSA MERDA!”
**Ligação:** o procedimento real continua apesar do esforço virtual. As mãos dos três não trocam de lado a cada quadro.

### L1-40 — Quem ainda ri
**Fonte:** D; Fred desvia por um momento para Anderson e Michael e retorna à margem da ação; dominância petróleo.
**Quadros:** dois painéis. Michael começa rindo, Anderson acompanha; o riso para quando ouvem André. Sem blur que encubra a mudança de expressão.
**Texto:** Michael: “PARA DE CENA, ANDRÉ.” André, fora do quadro: “EU NÃO TÔ BRINCANDO!”
**Ligação:** a incredulidade dura uma batida; não mantê-los rindo durante toda a morte.

### L1-41 — Foi só um toque
**Fonte:** D; Jack perto do centro, Nina tenta alcançá-lo; dominância verde enfraquecida.
**Quadros:** dois painéis. Jack olha a própria mão; Nina o puxa pelo ombro para agir, sem retirar Kim/Brock/Jason do resgate.
**Texto:** Jack: “EU NEM BATI FORTE.” Nina: “OLHA PRA MIM. NÃO FOI VOCÊ.”
**Ligação:** culpa e vínculo entram em conflito com o que a câmera registrou. Não explicar a origem dos cabos.

### L1-42 — O corpo responde
**Fonte:** A fixa; laboratório; dominância carmesim.
**Quadros:** dois painéis. André convulsiona no mesmo assento; funcionário segura a estação, não conforta a pessoa. Campo conserva o apoio e os limites da mesa.
**Texto:** apenas respiração/sons físicos captados, sem onomatopeia nova impressa.
**Ligação:** mostrar o contraste metódico, não um segundo ataque independente. A câmera não reenquadra sozinha.

### L1-43 — Dentro dos olhos de André
**Fonte:** S de André, na arena; dominância laranja.
**Quadros:** um painel com abertura orgânica. Mãos de Kim e Brock invadem seu campo tentando libertá-lo; visão baixa, sem ver o próprio rosto. Ruído de vozes é percepção, não fita.
**Texto:** pensamento de André: “TÁ FRIO.” Brock, ouvido por ele: “FICA COMIGO.”
**Ligação:** estreia do quarto POV. Não acrescentar REC, filme de infância ou visão da sala real que André não tem.

### L1-44 — Não para de gravar
**Fonte:** D; Fred baixa o aparelho com medo, Kim ainda no campo; dominância azul.
**Quadros:** dois painéis. Enquadramento ameaça cair para a areia; Kim ergue o rosto na direção de Fred e pede o registro. Fred recupera a altura, sem limpeza milagrosa de uma lente que não tocou o chão.
**Texto:** Fred: “EU VOU DESLIGAR.” Kim: “NÃO. GRAVA ISSO.”
**Ligação:** a mesma câmera que buscava audiência passa a ser necessária como testemunha.

### L1-45 — A promessa volta
**Fonte:** S de André; dominância laranja.
**Quadros:** dois painéis subjetivos. Brock aparece perto demais para um retrato composto; André tenta dizer algo e o foco periférico falha.
**Texto:** André: “MINHA IRMÃ...” Brock: “EU LEVO VOCÊ ATÉ ELA.”
**Ligação:** o compromisso de Brock se torna impossível. Não mostrar ingressos na arena se eles ficaram na roupa real.

### L1-46 — Os ingressos ficaram aqui
**Fonte:** A fixa no laboratório; dominância bronze.
**Quadros:** um painel. Mão real de André relaxa; os ingressos visíveis junto à roupa, dentro do campo estabelecido. Um shard só se os ingressos realmente estiverem legíveis no quadro-mãe; sem inventar texto neles.
**Texto:** nenhum além do HUD.
**Ligação:** o objeto une o compromisso e o corpo físico, sem narração dizendo quem ficará esperando.

### L1-47 — A percepção cede
**Fonte:** S de André; dominância laranja apagando.
**Quadros:** dois painéis, momentos subjetivos: Kim ainda tentando puxá-lo; campo orgânico se fecha até quase nada. Sem borrão de corrida ou HUD.
**Texto:** pensamento: “EU PROMETI.”
**Ligação:** encerramento humano da morte. A frase não explica a tecnologia e não se repete em outra fonte.

### L1-48 — O silêncio que Fred registra
**Fonte:** D; dominância azul.
**Quadros:** um painel. André imóvel, Kim ainda segura o feixe; Brock não consegue largar a mão do amigo. Fred mantém o aparelho, ligeiramente baixo. Nina e Jack no mesmo lado de antes.
**Texto:** Kim: “ANDRÉ?”
**Ligação:** o resultado não fica escondido no apagão subjetivo. Sem mais uma tentativa idêntica de puxar cabo.

### L1-49 — Retirada
**Fonte:** C; CAM 06 LABORATÓRIO; dominância metálica.
**Quadros:** dois painéis fixos em instantes diferentes. Funcionários destravam e levam a cadeira de André com o corpo; depois permanece o vazio da base. As outras oito estações não mudam de lugar.
**Texto:** nenhum além do HUD.
**Ligação:** quem controla o evento transforma a morte em procedimento. Não recolocar André no segundo ciclo.

### L1-50 — DELETE
**Fonte:** C; mesma CAM 06; dominância metálica.
**Quadros:** um painel. O registro é obstruído por encerramento técnico da imagem; a área da cadeira retirada ainda pode ser reconhecida antes da obstrução.
**Texto:** interface literal: “DELETE”.
**Ligação:** apagamento desta fonte, não de todos os olhos e aparelhos. A continua gravando no laboratório.

### L1-51 — O relógio volta; a fita, não
**Fonte:** A; funcionário recolhe o aparelho da mesa e o transporta pelo vão para o salão; dominância metálica.
**Quadros:** dois painéis. Gesto de mão na borda e leve inclinação física; corte elíptico para o relógio do salão terminando de voltar a `20:00`, no campo do aparelho carregado. TC adiante do ciclo, sem desligamento. Não mostrar o funcionário por uma câmera flutuante.
**Texto:** nenhum diálogo; somente os algarismos romanos próprios do mostrador, com ponteiros em VIII/XII (20h), sem legenda numérica adicional.
**Ligação:** fim do lançamento. O reset foi visto, mas a fita avançou. No lançamento 2, Nina recebe a mesma câmera e a festa tem menos gente. Não repetir retirada/DELETE no começo seguinte.

## 9. Lançamento 2 — Loop 2: o leitor reconhece antes deles

### L2-01 — O mesmo buffet, outro vazio
**Fonte:** A; funcionário devolve a câmera a Nina, que orienta a lente para o buffet; dominância azul.
**Quadros:** dois painéis. Mão de Nina recebe o aparelho na borda; Kim já come, e o lugar do desconhecido está vazio. A fita continua adiante. Não repetir a chegada à mansão.
**Texto:** Kim: “PEGA UM PRATO E VEM.”
**Ligação:** uma ausência visual abre o novo ciclo. O desconhecido não virou um cadáver exposto nem um novo Mascarado identificado.

### L2-02 — Falta alguém no enquadramento
**Fonte:** D apoiada no lounge, nova sessão; dominância dourada.
**Quadros:** dois painéis. Fred organiza o grupo, deixando o espaço de André sem perceber; Michael invade cedo como antes, mas não há André passando com os ingressos.
**Texto:** Fred: “MAIS PRA CÁ.” Michael: “ASSIM?” Fred: “NÃO. DEIXA...”
**Ligação:** a repetição é incompleta. Não desenhar silhueta fantasma de André nem fazê-los lembrar sua morte.

### L2-03 — Kim serve dois por hábito
**Fonte:** A nas mãos de Nina; buffet; dominância azul.
**Quadros:** dois painéis. Kim separa comida para o lado antes ocupado; percebe apenas que Jack se aproximou e empurra o prato para ele. Um shard do prato no mesmo balcão.
**Texto:** Jack: “Ô, GENTILEZA?” Kim: “PEGA LOGO.”
**Ligação:** gesto banal muda de destinatário. A frieza de Kim aparece no comportamento, sem narração de diagnóstico.

### L2-04 — Não come essa uva
**Fonte:** A; dominância rosa.
**Quadros:** dois painéis. Jack leva a mão à mesma tigela; Nina o interrompe antes da boca, sem precisar tocar nele enquanto filma. A câmera sofre só uma pequena hesitação de enquadramento.
**Texto:** Nina: “MANO, NÃO COME ESSA UVA!” Jack: “QUAL FOI?”
**Ligação:** primeira alteração inequívoca da pista. Não fazer a uva revelar veneno, olhos ou cabos.

### L2-05 — Ela não sabe dizer
**Fonte:** A; Nina atrás do aparelho, Jack e Kim em campo; dominância rosa.
**Quadros:** dois painéis. Jack deixa a fruta de volta; Kim olha para o lugar vazio, mas não chega a reconhecer alguém.
**Texto:** Nina: “NÃO SEI. TÔ COM UMA SENSAÇÃO RUIM.” Kim: “ENTÃO NÃO COME.”
**Ligação:** eles resolvem o incômodo imediato sem deduzir o loop. A informação muda a ação, não inaugura uma aula de mistério.

### L2-06 — A festa cabe em menos espaço
**Fonte:** C; CAM 03 SALÃO; dominância metálica.
**Quadros:** um painel do mesmo eixo de L1-01. Ilhas de convidados mais espaçadas; atendimento reorganizado, sem trocar paredes ou móveis. Kronos chega ao anúncio.
**Texto:** nenhum além do HUD.
**Ligação:** o leitor compara densidade. Não usar nova panorâmica bonita sem comparação reconhecível.

### L2-07 — Cinquenta escolhidos
**Fonte:** A; Nina para Kronos, salão; dominância metálica.
**Quadros:** dois painéis. O anfitrião anuncia; no segundo, Nina mantém Kronos em campo enquanto sua voz entra de trás da lente.
**Texto:** Kronos: “BOA NOITE AOS NOSSOS CINQUENTA CONVIDADOS ESCOLHIDOS.” / “OITO VÃO COMEÇAR.” Nina, baixo: “NÃO TINHA MAIS GENTE?”
**Ligação:** a fala alterada confirma a ausência sem lembrar o anúncio inteiro. Não dizer “ano passado” como fato que ela conhece.

### L2-08 — O vídeo não resolve
**Fonte:** D; Fred pega a câmera do apoio e filma a reação de Jason/Brock; dominância dourada.
**Quadros:** dois painéis. Jason entende apenas a chance de prêmio; Brock olha para o lado vazio que antes André ocupava e segue. Fred tenta narrar a própria importância.
**Texto:** Jason: “O PRÊMIO CONTINUA, NÉ?” Fred: “CLARO. FOI POR ISSO QUE CHAMARAM A GENTE.”
**Ligação:** a pose sobrevive à ausência. Não fazer Brock lembrar a promessa que foi apagada da memória consciente.

### L2-09 — Antes do sensor
**Fonte:** D empunhada por Fred, saída do lounge; dominância dourada.
**Quadros:** dois painéis. Fred já se aproxima esperando a abertura; atendente chega depois com bandeja menos cheia e aciona o sensor. Fred freia por um instante, depois passa.
**Texto:** Fred: “ANDA, ABRE.” Anderson: “ELE NEM ENCOSTOU AINDA.”
**Ligação:** gesto antecipado pequeno. Mesmo batente e sensor, sem sugerir que Fred controla a porta por pensamento.

### L2-10 — O pé de Jack sabe
**Fonte:** D, Fred filma a marcha no corredor técnico; dominância verde.
**Quadros:** dois painéis. Jack afasta com o pé o mesmo cabo baixo; Michael passa sem tropeçar. Um shard do contato do sapato com o cabo, mesmo registro.
**Texto:** Michael: “QUE FOI?” Jack: “NADA.”
**Ligação:** a comparação funciona com o lado e a altura iguais a L1-17. Não repetir a queda só para a impedir no quadro seguinte.

### L2-11 — A alça antes do pedido
**Fonte:** A; Nina passa o aparelho a Jack por um momento, entrada do laboratório; dominância rosa.
**Quadros:** dois painéis. Mão de Jack entra; ele passa a alça no punho antes de Nina terminar a frase. A lente baixa e se firma, sem mostrar seu próprio rosto.
**Texto:** Nina: “PASSA A...” Jack: “JÁ PASSEI.”
**Ligação:** a memória corporal aparece sem declaração. A câmera continua a mesma fonte.

### L2-12 — Devolução vista pela outra câmera
**Fonte:** D; Fred junto à entrada do laboratório; dominância dourada.
**Quadros:** um painel. Jack entrega A a Nina e retira o punho da alça; ao fundo, os funcionários indicam assentos. A base vazia de André pode ficar na borda, ainda sem ênfase.
**Texto:** Jack: “PESA MAIS QUE A FANTASIA.” Nina: “POR ISSO A ALÇA.”
**Ligação:** confirma a devolução que o próprio POV de A não poderia mostrar inteira de fora.

### L2-13 — Oito cadeiras, a mesma sala
**Fonte:** C; CAM 06 LABORATÓRIO; dominância metálica.
**Quadros:** um painel fixo, comparável a L1-20/23. Oito cadeiras; base da nona sem cadeira. Não compactar o laboratório para esconder o vazio.
**Texto:** nenhum além do HUD.
**Ligação:** soma a ausência física à contagem do anúncio, sem personagens contando todas as cadeiras em voz alta.

### L2-14 — Um apoio mais baixo
**Fonte:** A; Nina escolhe a prateleira inferior da mesa lateral; dominância rosa.
**Quadros:** dois painéis. Lente baixa enquanto o aparelho é apoiado; novo eixo estabiliza perto da perna de Brock, com outras bases em profundidade. Nina entra de lado ao ir para seu assento.
**Texto:** Nina: “AQUI NÃO CAI.”
**Ligação:** a diferença de ângulo foi causada por uma escolha, não por montagem onisciente. Manter esse campo até recolherem o aparelho.

### L2-15 — O arquivo que falta
**Fonte:** A fixa; Fred e D física no campo lateral permitido; dominância dourada.
**Quadros:** dois painéis. Fred olha a tela de D, tenta achar um vídeo e é apressado por Brock. Não inserir imagens antigas na tela vazia.
**Texto:** Fred: “EU NÃO TINHA GRAVADO ISSO?” Brock: “GRAVA DEPOIS. SENTA.”
**Ligação:** digital não conserva a sessão anterior. O leitor conhece a diferença; Fred pode atribuí-la a erro próprio.

### L2-16 — Nova conexão
**Fonte:** C; CAM 06 LABORATÓRIO; dominância bronze.
**Quadros:** um painel. Oito conectados; D de novo no suporte, A no apoio baixo. Um funcionário fecha o último conector. Elipse posterior de preparação, sem caminhada repetida.
**Texto:** nenhum além do HUD.
**Ligação:** a próxima fonte é D virtual; não repetir toda a explicação do vínculo.

### L2-17 — Três na câmara B
**Fonte:** D virtual, Fred com Brock e Jason; dominância dourada.
**Quadros:** dois painéis. Fred confirma o registro e a abertura; Brock espera Jason junto ao batente. Mesmo portão B, mesma arena diurna.
**Texto:** Fred: “AGORA VAI.” Jason: “JÁ ERA PRA TER IDO.”
**Ligação:** a sessão recomeça com a pose habitual, mas a formação dos outros portões mudou.

### L2-18 — Dois onde havia três
**Fonte:** D, Fred sai de B e alcança visão do portão C; dominância petróleo.
**Quadros:** um painel. Anderson e Michael saem de C sem André. A área desocupada aparece por composição, sem sombra fantasma ou legenda explicativa.
**Texto:** Michael: “BORA, ANDERSON.”
**Ligação:** ausência reconhecível de uma pessoa que o leitor já perdeu, sem memorial dos personagens.

### L2-19 — O trio continua junto
**Fonte:** D, visão do portão A; dominância rosa.
**Quadros:** dois painéis. Kim, Jack e Nina saem; Nina demora um instante no batente e olha para o centro da arena. Fred não filma o interior de A antes de poder vê-lo.
**Texto:** Nina: “ESPERA UM POUCO.” Jack: “O QUÊ?”
**Ligação:** hesitação vira tentativa de intervir, ainda sem prova consciente.

### L2-20 — Quarenta e dois
**Fonte:** D, Fred acompanha a direção do olhar de Nina até a sacada; dominância metálica.
**Quadros:** um painel funcional da sacada e de parte da plateia menos numerosa. Mesma topografia, áreas vazias onde antes havia público.
**Texto:** Kronos: “NOSSOS QUARENTA E DOIS ESPECTADORES JÁ ESTÃO A POSTOS.”
**Ligação:** fecha 50 = 8 + 42. Não fazer uma multidão duplicada contradizer a fala por reaproveitar a imagem anterior.

### L2-21 — Jason quer o dinheiro
**Fonte:** D; Fred para Jason; dominância violeta.
**Quadros:** dois painéis. Jason se oferece, tenta manter a graça, olha para Brock antes de seguir.
**Texto:** Jason: “EU VOU.” Brock: “PELO PRÊMIO?” Jason: “TÁ PRECISANDO LÁ EM CASA.”
**Ligação:** o motivo antes sugerido vira escolha. Não substituir Jason por Brock como adversário.

### L2-22 — A resposta conhecida
**Fonte:** D; Jack entra no mesmo espaço de decisão; dominância verde.
**Quadros:** dois painéis. Jack levanta a mão e aceita; Nina avança imediatamente. Ainda não há golpe.
**Texto:** Jack: “ENTÃO VEM.” Nina: “JACK...”
**Ligação:** o leitor reconhece o padrão de aceitação e espera uma ruptura.

### L2-23 — Não luta
**Fonte:** D; Nina alcança Jack; dominância rosa.
**Quadros:** um painel próximo. Nina segura o antebraço dele e o mantém junto ao grupo, sem falar para a lente.
**Texto:** Nina: “JACK, NÃO LUTA.”
**Ligação:** frase decisiva, espaço grande. Não colocar explicação do loop no mesmo balão.

### L2-24 — Ele recua
**Fonte:** D; dominância verde.
**Quadros:** dois painéis. Jack olha Nina, percebe que ela não brinca e baixa a mão; Jason fica sem adversário e olha para a sacada.
**Texto:** Jack: “TÁ. NÃO VOU.” Jason: “E AGORA?”
**Ligação:** a mudança de decisão aconteceu de verdade. Não desenhar depois um soco que a contradiga.

### L2-25 — A regra deixa de valer
**Fonte:** D, eixo para Kronos; dominância metálica.
**Quadros:** dois painéis. Instabilidade breve do ambiente virtual, sem trocar paredes de lugar; Kronos dá a ordem, abandonando a apresentação cordial. A nitidez de D continua limpa.
**Texto:** Kronos: “ATAQUEM.”
**Ligação:** o perigo não depende de Jack aceitar a luta. A falha não vira ruído VHS ou uma tela de erro inventada.

### L2-26 — A plateia se move
**Fonte:** D; dominância carmesim.
**Quadros:** dois painéis. Espectadores descem/saltam pelas rotas da arquibancada para a arena; o grupo começa a correr. Mostrar caminho de aproximação, sem fazer criaturas nascerem dentro dos personagens.
**Texto:** Brock: “PROS PORTÕES!”
**Ligação:** decisão imediata de fuga, não a velha decisão tranquila de “dividir e investigar”.

### L2-27 — A divisão é vista
**Fonte:** D, Fred recuando para B; dominância dourada.
**Quadros:** três painéis, exceção justificada pela separação rápida: trio entra em A ao alcance da lente; Anderson/Michael alcançam C; Brock puxa Fred para B com Jason. Manter os batentes como âncoras. Sem shards extras.
**Texto:** Kim: “NINA, COM O JACK!” Brock: “FRED, AQUI!”
**Ligação:** o leitor sabe quem foi para onde. D entra somente em B; não cortar dentro de A depois disso.

### L2-28 — Segura a passagem
**Fonte:** D em B; Fred junto à parede, Brock no portão, Jason procurando saída; dominância vinho.
**Quadros:** dois painéis. Brock fecha parcialmente o portão contra a pressão; Jason tenta a saída interna, ainda visível no mesmo cômodo.
**Texto:** Brock: “PROCURA OUTRA SAÍDA!” Jason: “TÔ PROCURANDO!”
**Ligação:** cada um faz algo diferente. O espaço não cresce para permitir uma corrida infinita.

### L2-29 — O primeiro cabo rompe
**Fonte:** D; dominância vinho.
**Quadros:** dois painéis. Cabo vem do encaixe de parede; Brock segura e arrebenta um segmento. Um shard do rompimento já captado, com acabamento de conexão técnica.
**Texto:** Brock: “VEM, FILHO DA PUTA!” SFX: “TRAC”.
**Ligação:** uma vitória pequena torna plausível a esperança e contrasta com o procedimento que segue no mundo real.

### L2-30 — A perna real de Brock
**Fonte:** A fixa no apoio baixo; laboratório; dominância bronze.
**Quadros:** dois painéis do mesmo campo em instantes diferentes. Perna de Brock se move quando um funcionário prende o conector; ele reposiciona a mão e continua. A não precisa ver o rosto.
**Texto:** som captado: “CLIC”.
**Ligação:** mesmo instante de resistência de Brock, outra informação. Não repetir a fala que só D registrou.

### L2-31 — Jason puxa Fred
**Fonte:** D; câmara B; dominância violeta.
**Quadros:** dois painéis. Fred recua para o canto errado; Jason o puxa pela roupa para a abertura interna. **BLUR-M** no puxão, recuperando a mesma ombreira da porta em seguida.
**Texto:** Jason: “POR AQUI, CARALHO!” Fred: “SOLTA MINHA ROUPA!”
**Ligação:** ajuda concreta de Jason; Fred ainda reage como dono do grupo. O borrão não esconde troca de câmara.

### L2-32 — Anderson procura a saída
**Fonte:** S de Anderson, câmara C; dominância ciano.
**Quadros:** dois painéis subjetivos. Michael no mesmo campo à frente; Anderson procura tranca/junta acessível. Percepção corporal, sem HUD ou sobrevoo de planta.
**Texto:** Anderson: “A PORTA. AJUDA AQUI.” Michael: “EU TÔ VENDO!”
**Ligação:** primeira visão interna de C vem de olhos identificados, não de D atravessando a parede.

### L2-33 — A coragem encenada
**Fonte:** S de Anderson; dominância petróleo.
**Quadros:** dois painéis. Michael tenta rir, encara um cabo e usa um objeto fixo do ambiente para afastá-lo; a mão falha e ele recua. Sem arma nova surgida do nada.
**Texto:** Michael: “É IGUAL NA ARENA. É SÓ...” Anderson: “ENTÃO POR QUE VOCÊ TÁ TREMENDO?”
**Ligação:** a bravata começa a ceder, com uma ação além de gritar e correr.

### L2-34 — O som atravessa; a imagem, não
**Fonte:** D de Fred, câmara B; dominância vinho.
**Quadros:** dois painéis. Brock escuta a voz de Michael pela passagem/parede vizinha, previamente prevista na planta; Fred quase vira para uma parede sem visão. Jason insiste na rota interna.
**Texto:** Brock: “É O MICHAEL.” Fred: “CADÊ?” Brock: “DO OUTRO LADO.”
**Ligação:** D conhece a outra frente pelo som, sem mostrar seu interior. Não usar áudio da sala física para esse elo.

### L2-35 — O procedimento continua
**Fonte:** A fixa; laboratório; dominância bronze.
**Quadros:** um painel. Da mesma altura baixa, pés de funcionários passam entre bases; cadeira vazia de André continua ausente; conector é levado à estação de Michael em profundidade. Não deslocar A para ver a estação inteira.
**Texto:** nenhum além do HUD.
**Ligação:** liga a ameaça a mais de um corpo por geografia parcial, sem uma cirurgia panorâmica impossível.

### L2-36 — O que Jason não queria dizer
**Fonte:** D; câmara B; dominância violeta.
**Quadros:** dois painéis. Jason força uma tranca com Brock, percebe a pressão dos cabos e perde o sorriso. Não repetir o mesmo quadro de busca da saída.
**Texto:** Jason: “EU PRECISO VOLTAR PRA CASA.” Brock: “ENTÃO PUXA.”
**Ligação:** família aparece como urgência, não flashback completo nem uma segunda explicação sobre o prêmio.

### L2-37 — O cabo prende Brock
**Fonte:** D; dominância carmesim.
**Quadros:** dois painéis. Um novo feixe contorna o segmento rompido e prende Brock; ele empurra Fred para fora do alcance. O primeiro cabo quebrado continua no chão.
**Texto:** Brock: “NÃO FICA PARADO!”
**Ligação:** sua resistência não foi apagada; a superioridade da ameaça vence por outra ação.

### L2-38 — O pai de Fred não está ali
**Fonte:** D, Fred recuando sem largar a câmera; dominância dourada.
**Quadros:** dois painéis. A lente oscila entre Brock e a passagem fechada, sem apontar para o rosto de Fred; a voz perde a pose de apresentador.
**Texto:** Fred, atrás da lente: “NÃO! MEU PAI NÃO VAI DEIXAR ISSO ACONTECER!”
**Ligação:** primeira parte da reação original, encurtada em uma fala que cabe. Não fazê-lo resolver a ameaça por influência.

### L2-39 — Michael é alcançado
**Fonte:** S de Anderson; dominância petróleo.
**Quadros:** dois painéis. Anderson vê o tornozelo de Michael ser puxado e sua mão buscar apoio. Anderson avança para segurar o braço. Sem observar o próprio corpo de fora.
**Texto:** Michael: “ANDERSON, SEGURA!”
**Ligação:** convergência temporal com o ataque em B, não continuação espacial de D.

### L2-40 — Jason não passa
**Fonte:** D; câmara B; dominância carmesim.
**Quadros:** dois painéis. Jason tenta atravessar a abertura livre para ajudar Brock; feixes o prendem no trajeto. Fred registra o rosto perder a força e a mão soltar o batente.
**Texto:** Jason: “BROCK...”
**Ligação:** resultado da tentativa dele, não morte em outro cômodo sem testemunha. Jason é o primeiro dos quatro a cessar movimento nesta montagem.

### L2-41 — A força acaba
**Fonte:** D; dominância vinho.
**Quadros:** dois painéis. Brock tenta romper outro feixe e não consegue; vê Jason imóvel e muda a ordem para Fred. O cabo quebrado anterior ancora a posição.
**Texto:** Brock: “SAI DAQUI, FRED.” Fred: “ABRE ESSA PORRA!”
**Ligação:** a força não se repete como solução. Brock ainda se move; sua morte não será anunciada antes do resultado.

### L2-42 — Pés sem reação
**Fonte:** A fixa; dominância carmesim.
**Quadros:** um painel. Os movimentos antes vistos nas pernas de Brock diminuem; um funcionário já leva material para a estação ao lado. Parte dos pés de Jason, se no campo da planta aprovada, permanece imóvel. Não inventar um novo eixo para incluir todos.
**Texto:** nenhum além do HUD.
**Ligação:** a operação física continua indiferente à fala de Fred.

### L2-43 — Não me larga
**Fonte:** S de Anderson; dominância petróleo.
**Quadros:** dois painéis. Michael agarra seu punho; Anderson tenta firmar o pé. O rosto do amigo está perto demais, a fuga virou sustentação.
**Texto:** Michael: “NÃO ME LARGA.” Anderson: “EU TÔ AQUI.”
**Ligação:** vínculo entre os dois ganha gesto. Não inverter quem está vendo a cena.

### L2-44 — A ameaça vazia
**Fonte:** D; dominância dourada enfraquecida.
**Quadros:** um painel. Fred procura uma saída alta mas filma a parede e parte de Brock, que ainda tenta mover o braço. O foco caça brevemente por proximidade da pedra, não por interferência VHS.
**Texto:** Fred: “EU VOU PROCESSAR VOCÊS!”
**Ligação:** a ameaça do pai vira impotência; não alongar o diálogo original em um parágrafo de pânico.

### L2-45 — Brock para
**Fonte:** D; dominância vinho apagada.
**Quadros:** dois painéis. A mão de Brock deixa de procurar apoio; Fred mantém os dois corpos no alcance possível da lente. Uma passagem parcial junto à parede permite que ele se recolha, sem vitória sobre a ameaça.
**Texto:** Fred: “BROCK?”
**Ligação:** segunda morte confirmada. Fred continua vivo e filmando; não adicionar sua execução neste ciclo.

### L2-46 — Michael escapa da mão
**Fonte:** S de Anderson; dominância petróleo.
**Quadros:** dois painéis. A mão de Michael cede, o corpo fica sem reação; Anderson olha para a própria mão vazia, ainda sem ver seu próprio rosto.
**Texto:** Anderson: “MICHAEL!”
**Ligação:** terceira morte. O quadro orgânico continua sendo Anderson, não troca para Michael sem aviso.

### L2-47 — Agora é o próprio corpo
**Fonte:** S de Anderson; dominância ciano cercado por carmesim.
**Quadros:** dois painéis subjetivos. Ele olha para baixo e vê os feixes envolvendo suas pernas/tronco como raízes; perde alcance e a abertura do olho se fecha. Sem explicação anatômica do procedimento.
**Texto:** pensamento: “EU IA SAIR DESSE GRUPO.”
**Ligação:** quarta morte. A frase recupera seu desejo de deixar Fred sem inventar uma lembrança que não foi plantada.

### L2-48 — Só o registro continua em B
**Fonte:** D; Fred recolhido junto à parede da câmara B; dominância dourada apagada.
**Quadros:** um painel. A lente ainda alcança Brock/Jason imóveis; Fred respira perto do microfone. Não preencher o silêncio com narração de sobrevivência heroica.
**Texto:** respiração captada, sem palavra impressa adicional.
**Ligação:** resultado visível e Fred vivo. O trio de A permaneceu fora de campo; o encerramento do ciclo, não uma vitória inventada, os preserva.

### L2-49 — Quatro cadeiras saem
**Fonte:** C; CAM 06 LABORATÓRIO; dominância metálica.
**Quadros:** dois painéis, momentos do mesmo eixo: funcionários retiram as cadeiras de Jason/Brock/Michael/Anderson; depois restam as quatro de Kim/Jack/Nina/Fred, que os funcionários giram/reposicionam ao redor do centro antes de encerrar a operação. A cadeira já retirada de André não reaparece. A redistribuição é explícita, correspondente à referência SalasCadeiraQuatro.png, e não mudança silenciosa de sala.
**Texto:** nenhum além do HUD.
**Ligação:** confirma quatro mortes e quatro sobreviventes, sem obrigar A baixa a mostrar todos os rostos.

### L2-50 — O segundo DELETE
**Fonte:** C; mesma CAM 06; dominância metálica.
**Quadros:** um painel de encerramento técnico, depois da retirada. Não repetir os dois painéis da remoção.
**Texto:** interface: “DELETE”.
**Ligação:** operação reconhecível, sem explicar para o leitor que é “igual ao primeiro”.

### L2-51 — A fita viaja de novo
**Fonte:** A; funcionário a recolhe do apoio baixo; dominância metálica.
**Quadros:** dois painéis. Lente sobe com a mão na borda; elipse de transporte, relógio do salão em `20:00`. O contador se aproxima de três horas acumuladas. Sem apagão geral que pudesse simular outra gravação.
**Texto:** somente os algarismos romanos próprios do mostrador, com ponteiros em VIII/XII (20h), sem legenda numérica adicional.
**Ligação:** fim do segundo lançamento. Não gastar a abertura do terceiro retirando de novo os mesmos quatro corpos.

## 10. Lançamento 3 — Loop 3: a testemunha vira prova

### L3-01 — Dez
**Fonte:** A, entregue de volta a Nina no salão; dominância metálica.
**Quadros:** dois painéis. Recebimento do aparelho e relógio cenográfico ainda em `20:00`; Kronos diante de uma festa quase vazia. Não repetir o resto do anúncio.
**Texto:** Kronos: “BOA NOITE AOS NOSSOS DEZ CONVIDADOS.”
**Ligação:** a redução chega sem recapitular o segundo lançamento. O som volta por A, não por uma câmera de segurança com áudio inventado.

### L3-02 — Não tem mais plateia para o vídeo
**Fonte:** D apoiada no lounge; Fred sozinho no centro do enquadramento; dominância dourada.
**Quadros:** dois painéis. Fred tenta a pose de L1-04, olha os espaços vazios e abandona a contagem. A lente continua onde estava; ele sai do quadro para pegar D.
**Texto:** Fred: “TRÊS...” / “AH, FODA-SE.”
**Ligação:** terceira versão do hábito. Michael não invade, os cinco capangas não voltam e a ausência não vira piada nova.

### L3-03 — A tigela sai do caminho
**Fonte:** A de Nina, buffet; dominância rosa.
**Quadros:** dois painéis. Nina filma Kim, que oferece a tigela; ela a afasta com a mão livre, vista apenas na borda. A posição antiga do desconhecido continua vazia.
**Texto:** Kim: “QUER?” Nina: “NÃO. DEIXA ISSO AÍ.”
**Ligação:** a intuição agora evita o objeto antes de alguém pegar uma uva. Não reencenar o susto do ciclo 2.

### L3-04 — Quem ainda está na festa
**Fonte:** C; CAM 03 SALÃO; dominância metálica.
**Quadros:** um painel funcional. Kim/Jack/Nina/Fred e seis convidados reconhecíveis distribuídos em três pares, ainda sem máscaras; funcionários circulam separados deles. Sem tentativa de contar todo empregado como convidado.
**Texto:** nenhum além do HUD.
**Ligação:** fixa os dez e os rostos que depois aparecerão no banquete; a contagem não depende de uma panorâmica lotada.

### L3-05 — Nina pede ajuda
**Fonte:** A; Nina atrás da lente, Jack no campo; dominância rosa.
**Quadros:** dois painéis. A mão de Nina oscila pouco; Jack nota o desconforto e oferece segurar. Ela não olha para o próprio aparelho por uma tomada impossível.
**Texto:** Nina: “MANO, EU TÔ ME SENTINDO ESTRANHA.” Jack: “ME DÁ AQUI UM POUCO.”
**Ligação:** o afeto produz a troca de operador. Ela não perdeu habilidade de agir; permite ajuda enquanto observa.

### L3-06 — A troca vista de fora
**Fonte:** D, Fred se aproximando do trio; dominância verde.
**Quadros:** dois painéis. Fred registra Nina entregando A; Jack passa a alça no punho sem pedido. Nina olha para ele, não para D.
**Texto:** Jack: “TÁ CANSADA?” Nina: “NÃO É ISSO.”
**Ligação:** D tem razão para apontar ao grupo e permite ver os dois operadores sem criar outra câmera.

### L3-07 — Quase três horas
**Fonte:** D de Fred, apontada para Jack, Nina e o visor de A; dominância rosa.
**Quadros:** dois painéis. Jack olha o contador físico; segundo aproxima D do visor ocular, que Jack acabou de consultar, mantendo o aro físico como referência. A lente de A está voltada para o chão, não filmando a própria tela.
**Texto:** Jack: “VOCÊ LIGOU ISSO ANTES DE SAIR?” Nina: “LIGUEI QUANDO A GENTE CHEGOU.” Visor de A: “TC 02:50:00”.
**Ligação:** a prova é legível e não confundida com `20:00`. D continua com seu próprio HUD, separado do visor filmado.

### L3-08 — O número não cabe na lembrança
**Fonte:** D; mesma posição de Fred; dominância rosa.
**Quadros:** dois painéis. Jack e Nina conferem a fita, Fred se aproxima sem sair de trás de D. Nina alcança o comando de reprodução enquanto Jack segura A; ela e Jack consultam o ocular alternadamente, depois abrem espaço para D registrar por ele.
**Texto:** Jack: “QUASE TRÊS HORAS?” Nina: “VOLTA UM POUCO.”
**Ligação:** pausa voluntária de REC em A e entrada em PLAY. Não fingir que ela grava a própria reprodução ao mesmo tempo.

### L3-09 — Uma tela dentro da imagem
**Fonte:** D; visor ocular de A filmado por Fred; dominância rosa.
**Quadros:** dois painéis. Nina busca trecho anterior; depois o ocular mostra uma tomada do laboratório. D registra a pequena imagem eletrônica através da ocular, com enquadramento aproximado e foco recuperado; não criar uma tela lateral articulada em A. **FOCO** breve de D procurando a tela, recuperado antes da imagem importante.
**Texto:** visor de A: “PLAY”. Nina: “AQUI. PARA.”
**Ligação:** a moldura física do visor continua visível. Ruído dentro da reprodução não contamina magicamente o arquivo Full HD externo.

### L3-10 — André está na fita
**Fonte:** D filmando o PLAY de A; dominância laranja.
**Quadros:** dois painéis. Trecho reconhecível de A no laboratório: André reclama da correia e Brock responde parcialmente fora do campo. Jack e Nina são vistos só pela margem física da tela, se ali estiverem. Não usar imagem da arena, que A nunca registrou.
**Texto:** áudio reproduzido da fita: André: “PRECISA APERTAR TANTO?” Brock: “JÁ JÁ ACABA.”
**Ligação:** reprise curta e explicitamente gravada. Os personagens atuais não completam a memória do que não viveram conscientemente.

### L3-11 — O procedimento ficou gravado
**Fonte:** D filmando outro trecho do PLAY de A; dominância carmesim.
**Quadros:** dois painéis. Corte de reprodução para o eixo baixo do ciclo 2: perna de Brock se debate e funcionário prende o conector. Aro do ocular, dedos e reflexo mantêm a origem da imagem. D se aproxima do ocular; não inventar uma tela articulada em A.
**Texto:** Nina, presente: “ISSO FOI AQUI.”
**Ligação:** uma segunda prova muda o sentido da fita. Não reapresentar a perseguição inteira ou falsificar imagens de D dentro de A.

### L3-12 — Eles se reconhecem
**Fonte:** D, visor ocular e reação após a leitura; dominância rosa.
**Quadros:** dois painéis. Trecho de A após Nina ter deixado o aparelho: ela senta na própria cadeira; Jack aparece no limite do eixo registrado. Nina já consultou esse trecho pelo ocular; no segundo painel ela se afasta dele e Fred vira D para registrar sua reação.
**Texto:** Nina: “ESSA SOU EU.” Jack: “EU NÃO LEMBRO DISSO.”
**Ligação:** a câmera sabe mais que as pessoas. Não explicar o mecanismo das almas nem adicionar flashback externo da infância.

### L3-13 — Fred prefere o defeito
**Fonte:** D, Fred atrás da lente, Nina/Jack em campo; dominância dourada em conflito com rosa.
**Quadros:** dois painéis. Fred desvia D da tela para a carcaça antiga, tentando reduzir a prova ao aparelho. Nina se interpõe sem olhar para a lente.
**Texto:** Fred: “CÂMERA VELHA É QUE TEM ESSAS COISAS.” Nina: “NÃO É DEFEITO. A GENTE TÁ NA FITA.”
**Ligação:** racionalização, não estupidez absoluta: Fred evita aceitar algo que não controla.

### L3-14 — REC outra vez
**Fonte:** A, Jack retorna ao fim gravado e retoma a filmagem do rosto de Nina; dominância rosa.
**Quadros:** dois painéis. A volta do ângulo baixo ao rosto é movimento da mão de Jack; Nina observa o ambiente e pede que ele mantenha o registro. Sem PLAY dentro do próprio POV de A.
**Texto:** Nina: “NÃO APAGA NADA.” Jack, atrás da câmera: “NÃO VOU APAGAR.”
**Ligação:** gravação retomada após a breve revisão, sem sobrescrever o material. Esse intervalo consciente não é um reset da fita.

### L3-15 — Kronos percebe o aparelho
**Fonte:** C; CAM 03 SALÃO; dominância metálica.
**Quadros:** dois painéis fixos em instantes diferentes. Kronos nota os quatro reunidos sobre A; um dos seis convidados recebe um gesto discreto. A fonte não revela pensamento ou intenção por legenda.
**Texto:** nenhum além do HUD.
**Ligação:** a operação reage à descoberta, sem monólogo do vilão observando o próprio plano.

### L3-16 — A bandeja vazia
**Fonte:** A de Jack, próximo ao vão do lounge; dominância bronze.
**Quadros:** dois painéis. Um atendente retira a última bandeja da rota; atrás, os seis convidados se aproximam dos acessos. Nina nota a movimentação antes dos outros. Não trocar funcionários pelos seis sem mostrar rostos.
**Texto:** Nina: “JACK. OLHA AS PORTAS.”
**Ligação:** o gesto banal de servir passa a liberar o espaço para uma contenção. A porta conhecida ainda parece uma saída.

### L3-17 — Seis máscaras
**Fonte:** A de Jack; salão; dominância bronze.
**Quadros:** dois painéis. Três pares de convidados já reconhecidos levam máscaras romanas ao rosto; depois bloqueiam dois acessos em grupos de três. A câmera acompanha uma rotação curta plausível, sem seis retratos minúsculos em shards.
**Texto:** Nina: “A GENTE VAI SAIR. AGORA.”
**Ligação:** transformação por gesto visível, não aparecimento mágico de seis perseguidores adicionais.

### L3-18 — O anfitrião proíbe
**Fonte:** D, Fred para Kronos e o acesso bloqueado; dominância metálica.
**Quadros:** dois painéis. Kronos permanece calmo; Kim entra entre ele e os amigos. Fred não aparece de frente segurando D.
**Texto:** Kronos: “VOCÊS NÃO PODEM IR EMBORA.” Kim: “ENTÃO TIRA ELES DA FRENTE.”
**Ligação:** a investigação vira sobrevivência. Não repetir o discurso de boas-vindas.

### L3-19 — A primeira brecha
**Fonte:** D de Fred; dominância azul.
**Quadros:** dois painéis. Kim empurra a barreira humana suficiente para abrir passagem, usando a posição já vista; Fred recua junto dele. Não vencer todos os seis num só gesto.
**Texto:** Kim: “CORRE!”
**Ligação:** resistência real cria uma possibilidade. A captura posterior não será automática nem uma fila obediente até as cadeiras.

### L3-20 — Duas rotas físicas
**Fonte:** C; CAM 05 LOUNGE e CAM 07 ESCADARIA; dominância bronze.
**Quadros:** dois feeds sincronizados. Kim/Fred buscam a passagem de serviço do lounge, que retorna ao corredor oeste e à entrada; Jack/Nina para a circulação e escadaria. Três perseguidores em cada frente; funcionários do laboratório continuam em sua função.
**Texto:** nenhum além do HUD.
**Ligação:** estabelece a divisão antes das câmeras portáteis mergulharem na fuga. Nada de LDI durante esta perseguição.

### L3-21 — A porta que conheciam
**Fonte:** D, Fred com Kim tentando o atalho do lounge para a rota de entrada; dominância dourada.
**Quadros:** dois painéis. Fred chega ao sensor esperando a abertura; o mecanismo não responde. Kim testa o batente, reconhecível pelo desenho de L1-06/L2-09.
**Texto:** Fred: “ABRE!” Kim: “SAI DA FRENTE.”
**Ligação:** terceira versão da pista: a familiaridade vira armadilha. Não inventar outro sensor do lado oposto da mesma porta.

### L3-22 — Jack tira o cabo sem pensar
**Fonte:** A de Jack, Jack/Nina no acesso à escadaria junto ao corredor técnico; dominância verde.
**Quadros:** dois painéis. O cabo baixo está no mesmo batente conhecido; pé de Jack o afasta enquanto Nina passa. A lente baixa pelo gesto e recupera Nina à frente.
**Texto:** Nina: “PRA ESCADA!”
**Ligação:** terceira versão do tropeço, agora sem Michael. A memória corporal ajuda uma fuga concreta, não prevê toda emboscada.

### L3-23 — A lente encosta
**Fonte:** D; Kim força o batente, Fred é prensado de lado; dominância azul.
**Quadros:** dois painéis. **LENTE:** manga/tecido invade o campo e o dedo de Fred toca a borda da lente ao segurar o aparelho; depois a imagem volta com uma marca translúcida no canto inferior esquerdo. Kim recua porque o batente não cede.
**Texto:** Kim: “NÃO VAI. VOLTA!”
**Ligação:** a falha tem causa e deixa vestígio. A marca permanece até L3-29; não usar a sujeira para esconder uma porta nova.

### L3-24 — O patamar dá esperança
**Fonte:** A de Jack; Nina na escadaria; dominância rosa.
**Quadros:** dois painéis. Nina testa o acesso superior; uma luz/abertura da mesma rota sugere passagem possível. Os perseguidores ainda sobem abaixo, sem atravessar o grupo instantaneamente.
**Texto:** Nina: “TEM PASSAGEM AQUI.” Jack: “VAI, EU TÔ ATRÁS.”
**Ligação:** oportunidade verificável, que a pressão dos perseguidores depois retira.

### L3-25 — A rota está se fechando
**Fonte:** C; CAM 02 e CAM 07; dominância bronze.
**Quadros:** dois feeds fixos no mesmo intervalo. Uma frente fecha o retorno do oeste; outra ocupa o acesso do patamar. Movimentos dos perseguidores são mostrados onde o grupo não olha. Pessoas podem borrar ao correr; a câmera não treme.
**Texto:** nenhum além do HUD.
**Ligação:** repetição parcial do espaço acrescenta a tática que as portáteis não enxergam. Sem mapa desenhado como parte da filmagem.

### L3-26 — Kim volta por Fred
**Fonte:** D, ainda com marca no canto; dominância azul.
**Quadros:** dois painéis. Fred tropeça ao recuar; a lente baixa e mostra Kim voltar para puxá-lo pelo braço. O próprio Fred não aparece inteiro de fora.
**Texto:** Fred: “EU TÔ INDO!” Kim: “ENTÃO ANDA!”
**Ligação:** o comportamento de Kim contraria o desprezo inicial entre os grupos. O gesto de resgate será inútil depois, não inútil agora.

### L3-27 — Nina abre espaço
**Fonte:** A de Jack; patamar; dominância rosa.
**Quadros:** dois painéis. Nina barra um perseguidor com o corpo/um golpe curto e afasta a mão que tenta alcançar Jack; o registro pega ação parcial, mas o contato essencial fica claro.
**Texto:** Nina: “NÃO PARA!”
**Ligação:** Nina resiste ativamente. Não impor coreografia perfeita de corpo inteiro vista por uma câmera imóvel que não existe.

### L3-28 — A alça segura a testemunha
**Fonte:** A de Jack; dominância verde.
**Quadros:** três painéis por progressão rápida: colisão no antebraço; **BLUR-M** quase ilegível quando A escorrega presa pela alça; recuperação baixa com o mesmo degrau e o pé de Nina. Um detalhe da alça só é visível se entrar fisicamente na borda; sem shard externo do punho de Jack.
**Texto:** Jack: “SEGUREI!” Nina: “VEM!”
**Ligação:** a pista material impede a perda da câmera. A leitura recupera o lugar antes de continuar a fuga.

### L3-29 — Fred limpa o canto
**Fonte:** D, junto ao mesmo corredor oeste; dominância dourada.
**Quadros:** dois painéis. Fred passa a borda limpa do próprio tecido pela lente; parte do campo fica obstruída, depois a marca do canto some. Kim vigia o acesso no fundo.
**Texto:** Kim: “AGORA NÃO, PORRA!” Fred: “EU NÃO TÔ ENXERGANDO!”
**Ligação:** resolve a sujeira estabelecida. Não inventar outra marca ou voltar a uma lente limpa antes desse gesto.

### L3-30 — Dinheiro não compra a saída
**Fonte:** D limpa novamente; Kim/Fred no corredor; dominância dourada.
**Quadros:** dois painéis. Fred tenta negociar com os perseguidores atrás de Kim; Kim o puxa para fora do vão antes que fechem a frente.
**Texto:** Fred: “EU PAGO. QUANTO VOCÊS QUEREM?” Kim: “GUARDA A GRANA E CORRE!”
**Ligação:** defesa habitual de Fred falha em ação. Não transformar em longa conversa com Mascarados.

### L3-31 — A entrada está bloqueada
**Fonte:** C; CAM 01 ENTRADA; dominância metálica.
**Quadros:** um painel fixo. Kim/Fred alcançam o vestíbulo, encontram a porta externa travada e são forçados a retornar. A mesma porta usada no começo; noite lá fora.
**Texto:** nenhum além do HUD.
**Ligação:** fecha a esperança da saída principal com geografia conhecida. Não teletransportar perseguidores nem abrir um jardim secreto.

### L3-32 — O patamar também fecha
**Fonte:** A de Jack; dominância bronze.
**Quadros:** dois painéis. Nina encontra a passagem superior barrada pelo grupo que C já mostrou; a lente volta ao caminho de descida, agora comprimido. Sem inverter o sentido dos degraus.
**Texto:** Nina: “VOLTA. POR BAIXO!”
**Ligação:** perda de oportunidade causada pelo cerco, não por esquecimento da porta que estava aberta.

### L3-33 — Uma segunda tentativa de Kim
**Fonte:** D, Fred acompanha Kim no retorno técnico; dominância azul.
**Quadros:** dois painéis. Kim força uma grade/porta de serviço já presente na planta; cede pouco, mas o espaço não permite passar antes de chegarem. Fred tenta ajudar com a mão livre, mantendo D.
**Texto:** Kim: “PUXA AQUI.” Fred: “NÃO CABE!”
**Ligação:** tentativa diferente da porta anterior; não repetir três vezes o mesmo empurrão.

### L3-34 — Nina protege a câmera e Jack
**Fonte:** A de Jack, base da escada; dominância rosa.
**Quadros:** dois painéis. Nina afasta a mão de um perseguidor da alça e empurra Jack para o último vão. Um outro fecha o caminho; ela volta a encará-los.
**Texto:** Nina: “NÃO SOLTA ESSA CÂMERA.”
**Ligação:** objeto virou prova, mas Nina não abandona Jack para salvá-lo. A captura ainda precisa ser vista.

### L3-35 — A primeira dupla cai
**Fonte:** C; CAM 07 ESCADARIA; dominância bronze.
**Quadros:** dois painéis fixos em instantes diferentes. Três perseguidores imobilizam Jack/Nina pela pressão conjunta; um retira a alça do punho preso e recolhe A. Não mostrar a captura inteira como tela preta da câmera caída.
**Texto:** nenhum além do HUD.
**Ligação:** a custódia muda por gesto visível. A câmera não é destruída nem permanece com Jack depois disso.

### L3-36 — Kim ouve, Fred quer seguir
**Fonte:** D; corredor técnico; dominância azul.
**Quadros:** dois painéis. Um chamado de Nina chega pelo vão da escada; Kim para e se volta para o som. Fred aponta para a passagem que tentavam abrir.
**Texto:** Nina, distante: “KIM!” Fred: “NÃO VOLTA!” Kim: “ELA TÁ ALI.”
**Ligação:** a decisão de ajudar produz a exposição final. D não mostra Jack/Nina presos antes de alcançar a visão deles.

### L3-37 — A digital perde a altura
**Fonte:** D; Fred recua diante do cerco a Kim; dominância carmesim.
**Quadros:** dois painéis. Kim ainda resiste e é segurado por mais de um perseguidor; Fred recebe um impacto e D desce em **BLUR-M**, recuperando piso, pés e a mão que alcança o aparelho. A captura completa não é escondida aqui.
**Texto:** Fred: “NÃO ENCOSTA!”
**Ligação:** último registro portátil de Fred no mundo real; o próximo quadro externo confirma quem tomou D.

### L3-38 — Os quatro são levados
**Fonte:** C; CAM 02 CORREDOR e CAM 06 LABORATÓRIO; dominância bronze.
**Quadros:** dois feeds sequenciais, não simultâneos. Kim/Fred são dominados no corredor; elipse até os quatro sendo conduzidos ao laboratório. Um perseguidor leva D, outro A. Sem multiplicar os seis convidados caçadores; funcionários recebem o grupo.
**Texto:** nenhum além do HUD.
**Ligação:** encerra a resistência e comprova as duas capturas. Não usar arrasto longo como repetição de todas as tentativas de fuga.

### L3-39 — Os aparelhos também são presos
**Fonte:** C; CAM 06 LABORATÓRIO; dominância metálica.
**Quadros:** dois painéis do mesmo campo em instantes diferentes. Funcionário coloca A na mesa em novo ângulo para as quatro estações; D física volta ao suporte de vínculo, depois de confirmada a sessão. Os quatro vão às cadeiras.
**Texto:** nenhum além do HUD; o vínculo é reconhecido pelo mesmo gesto/interface já estabelecidos, sem diálogo audível em C.
**Ligação:** fixa o terceiro apoio de A e a última posição física de D. Não deixar as câmeras “escolherem” novos lugares sozinhas.

### L3-40 — Não há mais convite
**Fonte:** A fixa no novo apoio; dominância rosa.
**Quadros:** dois painéis. Nina/Jack/Fred nas cadeiras, Kim no limite do campo; contenções são fechadas sem negociação. Jack tenta manter a mão próxima da de Nina, mas a correia impede.
**Texto:** Jack: “NINA...” Nina: “EU TÔ AQUI.”
**Ligação:** o campo real e a imobilidade contrastam com a liberdade do começo. O próximo corte é uma conexão, não deslocamento físico para a arena.

### L3-41 — Fred deixa a câmera no chão
**Fonte:** D virtual, representação nas mãos de Fred, junto à entrada da arena; dominância metálica.
**Quadros:** dois painéis. Fred recebe a ordem e apoia D num degrau/pedra baixa firme; segundo quadro já fixa o eixo para o centro. A mão sai da borda. Sol forte, sem nova apresentação de plateia.
**Texto:** Kronos, fora do quadro: “DEIXE A CÂMERA AÍ.” Fred: “EU NÃO VOU ATRAPALHAR.”
**Ligação:** o apoio explica o registro depois de Fred perder o controle. Não acrescentar panorâmica automática ou zoom remoto não estabelecido.

### L3-42 — Kim fica no centro
**Fonte:** D fixa perto da entrada; dominância metálica.
**Quadros:** dois painéis, momentos do mesmo eixo. Kim imobilizado em X por cordas ligadas a quatro ancoragens distintas; outros três no campo disponível. Contenção ritualística, sem cruz. Não enquadrar o rosto de Kim em close por um salto de câmera.
**Texto:** Kim: “SOLTA ELES.”
**Ligação:** sua impotência é material. Não reapresentar luta organizada nem espectadores comemorando.

### L3-43 — Os cabos escolhem os outros
**Fonte:** D fixa; dominância carmesim.
**Quadros:** dois painéis, momentos do mesmo plano. Feixes avançam para Jack/Nina/Fred; Kim força as quatro ancoragens e não alcança ninguém. As posições permitem que o leitor compreenda a distância.
**Texto:** Fred: “EU NÃO FIZ NADA!”
**Ligação:** a câmera mostra a simultaneidade externa, mas a experiência das três vítimas não será um plano longo uniforme.

### L3-44 — Fred sem público
**Fonte:** S de Fred; dominância dourada apagando.
**Quadros:** dois painéis subjetivos. Fred vê Kim preso e tenta procurá-lo como último recurso; olha para a própria mão, agora sem D. Sem lente em frente ao próprio rosto.
**Texto:** Fred: “KIM... FAZ ALGUMA COISA.”
**Ligação:** o homem que comprava ajuda implora sem sua performance. A fonte subjetiva não é o aparelho apoiado.

### L3-45 — O corpo de Fred
**Fonte:** A fixa no laboratório; dominância carmesim.
**Quadros:** dois painéis, momentos do campo. Corpo físico de Fred reage e cessa o movimento; os funcionários seguem para a próxima estação. Nina/Jack ainda têm sinais de movimento, quando no campo.
**Texto:** apenas respiração/sons reais captados, sem fala da arena.
**Ligação:** primeira das três mortes confirmada por consequência física. Não incluir o banquete virtual nem encerrar D por magia.

### L3-46 — Nina e a distância de Kim
**Fonte:** S de Nina, depois S de Kim; dominância rosa cercada por carmesim.
**Quadros:** dois painéis grandes, dois olhos identificados pela posição. Nina vê Kim em X e os cabos no primeiro plano; corte reverso para o olho de Kim, que vê Nina sendo alcançada. Mesma distância/eixo, sem câmera neutra entre eles.
**Texto:** Nina: “KIM, OLHA PRA MIM.” Kim, no seu painel: “EU TÔ TENTANDO.”
**Ligação:** Nina ainda orienta alguém quando perde o corpo. O sentido vem da relação espacial, não de telepatia ou pensamento de um ouvido pelo outro.

### L3-47 — Jack e a escolha impossível
**Fonte:** S de Jack, depois S de Kim; dominância verde cercada por carmesim.
**Quadros:** dois painéis. Jack vê Kim e tenta chegar com a mão; a visão de Kim registra Jack parando, depois a própria corda ainda tensa na borda. Sem um terceiro painel escondido como shard.
**Texto:** Jack: “NÃO FOI VOCÊ.” Kim: “ME LEVA. DEIXA ELES.”
**Ligação:** inverte a culpa do soquinho e a aceitação de lutar. Nina e Jack deixam de reagir; o resultado será confirmado pela fonte real seguinte, sem nova morte de Kim.

### L3-48 — O último procedimento
**Fonte:** C; CAM 06 LABORATÓRIO; dominância metálica.
**Quadros:** dois painéis fixos em instantes diferentes. Jack/Nina/Fred sem reação são retirados; Kim permanece vivo sob controle. Encerramento do registro após o procedimento.
**Texto:** interface no segundo momento: “DELETE”.
**Ligação:** terceiro DELETE **não produz outro reset**. A permanece gravando; seis convidados mascarados não reaparecem inexplicavelmente como cinco capangas mortos nos ciclos anteriores.

### L3-49 — Kronos pega a testemunha
**Fonte:** C → A, mudança explícita entre os dois painéis; dominância metálica.
**Quadros:** dois painéis. Primeiro, outra câmera fixa do laboratório registra Kronos recolhendo A depois do encerramento do feed anterior; segundo, A com a lente virada para ele, perto e um pouco de baixo, enquanto olha um monitor do laboratório fora do eixo da lente. Não mostrar externamente suas duas mãos segurando A no próprio POV.
**Texto:** somente no painel A, Kronos: “EU SABIA QUE ESSA CÂMERA IA SER UM PROBLEMA.” / “ISSO NÃO ESTAVA NOS PLANOS...”
**Ligação:** DELETE encerrou CAM 06, não todo o sistema de segurança. A existência da CAM 08 de serviço deve estar prevista na planta e na ficha de C antes da geração.

### L3-50 — A testemunha muda de mão
**Fonte:** A; Kronos entrega a câmera a um funcionário; dominância metálica.
**Quadros:** dois painéis. Passagem da mão e rotação registradas; elipse até a entrada do banquete, Kronos já adiante, Kim sendo levado para seu lugar. Os nove drenados estão na mesa: seis rostos genéricos reconhecíveis, Jack, Nina e Fred. As máscaras dos seis ficam junto aos seus lugares, sem inscrições.
**Texto:** Kronos: “MAS, NO FINAL, TUDO DEU CERTO.”
**Ligação:** a drenagem dos seis genéricos ficou elíptica; o resultado é mostrado, sem inventar uma nova sequência de execuções para explicá-lo. O funcionário apoia A no ponto final já previsto na ficha do banquete; o eixo se firma antes da última página.

### L3-51 — O banquete
**Fonte:** A fixa no apoio da extremidade da mesa; dominância metálica.
**Quadros:** um painel amplo, vertical, simétrico e funcional como imagem final. Mesa de convivium em profundidade, Kronos ao centro da cabeceira, Kim ao lado, nove drenados nos lugares definidos. Onze ocupantes ao todo; manter os três amigos reconhecíveis sem depender de nove retratos miúdos. Kronos olha Kim, depois a mesa, nunca a lente.
**Texto:** Kronos: “FINALMENTE, SEU CORPO É MEU, KIM.” / “FELIZ HALLOWEEN.”
**Ligação:** fim definitivo. Sem reset, resgate, comentário da câmera, epílogo, piscada para o leitor ou cena após a mesa.

## 11. Convergências e cortes que precisam ser conferidos juntos

| Páginas | Relação | Informação preservada/ganha |
|---|---|---|
| L1-02 → L1-03 | Mesmo gesto, outra fonte | Kim termina de afastar o drapeado; entrada espacial já conhecida ganha som e proximidade. |
| L1-03 → L1-04 | Ação paralela em outro cômodo | Imagem analógica/digital distingue a fonte; faixa breve localiza sem obrigar gesto repetido. |
| L1-07 → L1-08 | Continuação e cobertura | Segurança vê Nina encerrar o buffet e os grupos se orientarem ao anúncio; não repete a tosse. |
| L1-09 → L1-10 → L1-12 | Um anúncio, trechos diferentes | Cem/nove → prêmio → 91; não duplicar o discurso nem inserir áudio em C. |
| L1-13/14/15/17 | Troca de operador verificada | Nina → Jack → Nina; nenhuma tomada impossível da própria pessoa com a câmera. |
| L1-36/38/39 | Simultaneidade arena/corpo | Cabo trava André; outra fonte mostra conector real; volta ao resgate no mesmo estado. |
| L1-43 a 48 | Aproximação subjetiva/resultado | André sente, A conserva o corpo, D confirma a morte; não são três mortes distintas. |
| L2-10 ↔ L1-17 | Repetição com diferença | Mesmo obstáculo/lado; Jack previne a queda em vez de alguém explicar a memória muscular. |
| L2-29/30 | Mesmo esforço em dois mundos | Brock rompe um cabo virtual; o procedimento real continua. Não desenhar a perna em posição incompatível. |
| L2-31 a 47 | Duas frentes paralelas, não viagem da câmera | D somente em B; S somente Anderson em C; A somente laboratório. Ordenar a cessação: Jason, Brock, Michael, Anderson. |
| L3-07 a 14 | D filma a reprodução no ocular de A | Som da fita pode ser ouvido pelo microfone de D; PLAY não é REC nem reset; A nunca mostra um trecho de arena. |
| L3-20/25/31/35/38 | Cobertura da perseguição real | A segurança acrescenta cerco e captura; portáteis acrescentam risco, decisão e perda da imagem. |
| L3-23 a 29 | Marca material persistente | D fica com marca no canto inferior esquerdo até Fred a limpar. VHS não migra de A para D. |
| L3-27/28/35 | Alça muda o resultado | Nina protege; Jack conserva a câmera numa queda; captor retira a alça antes de recolher A. |
| L3-41 a 48 | Execução e impotência | D fixa dá escala, S alterna vítima/Kim, A/C dão consequências reais; Kim permanece vivo. |
| L3-48 a 51 | Procedimento → custódia → banquete | CAM 06 é encerrada, CAM 08 registra a coleta, A muda de mão e ganha apoio final. Nenhuma fonte acompanha o vilão sem operador. |

## 12. Premissa e lógica dos três lançamentos

**Loop 1:** nove pessoas aceitam uma demonstração aparentemente segura. A vontade de André de cumprir um compromisso encontra a brincadeira de Jack. A intervenção dos cabos e a inutilidade do resgate destroem a distinção confortável entre jogo e realidade. Kim não consegue ajudar alguém que estava ao seu alcance. O apagamento da segurança contrasta com a fita que continua.

**Loop 2:** a festa tem metade dos convidados e oito participantes. Os hábitos divergem antes da memória consciente. A recusa de Nina impede a luta, mas não a operação de Kronos. O ataque divide o grupo em espaços que só podem ser narrados por fontes limitadas. Quatro mortes desmontam a confiança em força, influência, coragem e planejamento; Kim perde outras pessoas sem conseguir impedir. O leitor tem evidências que os participantes ainda não conseguem reunir.

**Loop 3:** dez convidados, quatro sobreviventes conhecidos. A analógica materializa o que a mente apagou. O medo deixa de ser só pressentimento; vira uma tentativa de preservar prova e sair. A perseguição ocorre na mansão física e fecha as rotas que pareciam familiares. Na arena, Kim deixa de poder escolher e presencia a perda de Jack/Nina/Fred. O banquete revela o objetivo de Kronos: o corpo de Kim. A explicação metafísica não é necessária para compreender a derrota e não será acrescentada como aula ao final.

**Lógica de direção, não fala de exposição:** Kronos provoca impotência progressiva para abalar Kim. Não basta eliminar seus amigos no primeiro minuto; importa fazê-lo tentar, falhar e acreditar que deveria ter conseguido. O enfraquecimento emocional se percebe pela mudança das decisões e da voz de Kim. Não desenhar um medidor de alma nem anunciar em narração que o vilão está “testando o experimento”.

A diminuição dos convidados é maior que as mortes acompanhadas: de 100 para 50 faltam André e outros 49; de 50 para 10 faltam os quatro mortos do ciclo 2 e outros 36. Essas ausências não autorizam reintroduzir o desconhecido na plateia seguinte por acaso, nem exigem 85 execuções extras. O destino dos ausentes permanece fora do registro acompanhado. Os seis genéricos do último ciclo são os únicos convidados secundários reconhecíveis preservados para a virada das máscaras e para a mesa final.

## 13. Referências a produzir e prompts dos ambientes

A limpeza autorizada retirou o acervo antigo de `ESPECIAIS/presos`; durante o trabalho, a subpasta `Personagens` recebeu referências novas. Os arquivos listados abaixo foram abertos e inspecionados nas revisões de continuidade; isso não equivale à aprovação de uma página narrativa nova. Preservar essas referências, usar as identidades corretas e complementar somente o que falta. O texto atual substitui instruções contraditórias; não resta um segundo roteiro-base concorrente.

### 13.1 Referências existentes e complementos

Local de trabalho: `ESPECIAIS/presos/Personagens/`, ao lado deste documento na pasta de produção. Os arquivos continuam nesse local; não foram copiados automaticamente ao repositório público. Na geração, anexar o arquivo real e citar seu nome, com cerca de cinco referências por chamada. Uma referência de rosto não determina a geografia; uma imagem de equipamento não aprova um HUD que não contém.

| Arquivo existente inspecionado | Uso e observação de continuidade |
|---|---|
| `Kim.png` | Cabelo preto, armadura de bronze e capa vermelha; não trocar por Jack. |
| `Jack.png` | Dreads verdes, túnica clara, drapeado bordô e dourados; a reclamação da fantasia não transforma sua roupa na armadura de Kim. |
| `Nina.png` | Cabelo rosa, vestido creme e drapeados rosados; preservar corte e adornos na festa/fuga. |
| `Freddy.png` | Cabelo loiro, branco/dourado; hematoma no olho ESQUERDO DELE já existe na referência e não é criado pelo reset. Manter lado e estado. |
| `Kronos.png` | Aparência/figurino do anfitrião; cinza metálico é dominância editorial, não ordem para transformar sua pele em metal. |
| `Brock.png` | Ficha individual acrescentada por Isaías: frente/costas/perfil e expressões; identidade própria, distinta de Jason. |
| `KronosCesarDecaido.png` | Novo estado virtual: rei zumbi com rosto cadavérico, olhos opacos, pele ressecada, louros e traje imperial deteriorado; três vistas e quatro expressões. Gerada para revisão autoral, sem substituir Kronos humano. |
| `PlateiaZumbi.png` | Oito figurantes zumbis distintos, juntos numa folha coletiva de duas fileiras; reutilizar identidades, roupas e silhuetas nas plateias de 91 e 42. Gerada para revisão autoral. |
| `CabosVIdeosTentaculos.png` | Cabos orgânicos/tecnológicos com conectores reconhecíveis; governa a aparência da ameaça, não acrescenta personagens ou novos eventos. |
| `Capangas-JasonNegroEsquerda-MichaelRuvio-AndersonEmoFranjaCabeloPreto-AndreUltimoDiretaGordo.png` | Quatro identidades: Jason, Michael, Anderson e André. O nome do arquivo preserva a grafia Ruvio; não renomear ou atribuir o primeiro homem ao Brock. **A ficha de Brock não está nesse grupo.** |
| `Mascarados.jpg` | Seis silhuetas/roupas/máscaras romanas; não prova por si só as faces sem máscara dos seis convidados, nem torna todo funcionário um desses convidados. |
| `Relogio-CameraAnalógica-CameraDigital.png` | A é a filmadora VHS grande à esquerda, com ocular; D é a câmera digital ao centro, com tela articulada. Não inventar LCD lateral em A. Relógio à direita: ponteiros precisam representar 20h; detalhes pontiagudos pedem conferência com a direção romana antes de uso integral. |
| `SalaoFesta.png` | Geografia interna e mobiliário do salão social; não é o salão do banquete. As conexões externas ainda precisam da planta geral. |
| `SalaCadeirasNove.png` | Sala tecnológica, nove cadeiras em fileiras de cinco/quatro; referência do ciclo 1 e base para a variante de oito. |
| `SalasCadeiraQuatro.png` | Quatro estações em configuração radial; a mudança é mostrada como reorganização em L2-49, não alteração sem causa do cenário. |
| `ArenaColiseu.png` | Arena diurna de pedra e sacada elevada; preservar o desenho arquitetônico. Areia é camada superficial/localizada, não substituição silenciosa de todo o piso por duna. |
| `CelasColiseu.png` | Vocabulário/escala das celas; adaptar a planta de A/B/C sem trocar a posição de um portão entre cenas. |
| `AnexoColiseu.png` | Referência de anexo virtual; não usar suas quedas d'água e pontes para substituir o laboratório real ou inventar uma quarta rota na perseguição da mansão. |

**Complementos planejados, ainda não presentes:** identidades dos seis convidados sem máscaras; associação das máscaras/roupas antes e depois; planta geral da mansão com lounge/porta de sensor/escada/banquete; variante de oito cadeiras; campo exato dos apoios de A; interfaces C/A-REC/A-PLAY/D; letreiramento; vínculo D/SBI; relógio cenográfico com horário correto e continuidade romana. Não refazer automaticamente as fichas que já servem.

Os nomes `halloween_planta_geral.png`, `halloween_interfaces.png` e `halloween_letreiramento.png` podem ser usados para organizar esses complementos quando forem produzidos; **não são anexos existentes**. As páginas anteriores aprovadas entram como continuidade, nunca como desculpa para copiar seus balões. Os prompts de ambiente abaixo são critérios de consolidação/complemento das referências, não uma ordem para descartar as imagens que acabaram de ser fornecidas.
### 13.2 Contrato dos prompts de ambiente

Para cada ambiente abaixo, produzir **uma prancha horizontal com exatamente três vistas**: planta ortográfica de cima à esquerda (~35%); perspectiva 1 acima à direita; perspectiva 2 abaixo à direita (~65%). Todas mostram o mesmo lugar, com portas, móveis e escala correspondentes. Realismo fotográfico extremo, materiais romanos e tecnologia integrada. Vazio de pessoas/silhuetas; sem títulos, rótulos, logotipos ou decoração textual. As três vistas são referência técnica, **não uma página narrativa de três painéis** e não precisam imitar filmagem portátil.

As perspectivas devem permitir localizar os eixos usados no roteiro; não produzir duas imagens bonitas que discordem da planta. Noite nos ambientes reais; arena diurna. Objetos de cena, comida, câmeras e corpos são acrescentados depois conforme a página, sem alterar a estrutura permanente.

### AMB-01 — Salão principal
Prancha do lounge de festa romano-futurista: colunas, arcos, mármore/travertino, bronze, púrpura imperial, pista aberta e ilhas de sofás; som/luz integrados. Entrada pelo corredor oeste; conexão do lounge leste, buffet e corredor técnico do laboratório identificáveis pela geometria. Relógio cenográfico monumental na parede, ponteiros em VIII/XII para representar 20h em ficha de objeto separada. Duas perspectivas opostas preservam os vãos. Não colocar mesa de banquete central, cadeiras SBI ou arquitetura gótica.

### AMB-02 — Laboratório SBI
Prancha de laboratório tecnológico clandestino com nove bases em duas fileiras de cinco/quatro e corredor de operação. Cátedras de bronze/pedra escura, interface craniana em forma de elmo, correias e conectores modernos; nada de poltronas de escritório ou salão de jantar. Mesa lateral com apoio alto e prateleira baixa para A, suporte físico de D e acesso de serviço para o banquete. Variantes de estado na mesma geometria: 9 cadeiras; 8 sem a de André; 4 sem as de André/Brock/Jason/Anderson/Michael. As variantes 9/8 preservam as fileiras; a de quatro assume a redistribuição radial mostrada na manutenção de L2-49. Manter contorno da sala, pontos de conexão e eixos de CAM 06/CAM 08; não copiar outra planta sem transição. As perspectivas não adicionam cadeiras ocultas inexistentes na planta.

### AMB-03 — Arena LDI
Prancha de anfiteatro romano monumental com desgaste localizado sob **sol escaldante**, areia superficial seca sobre o pavimento de pedra da referência, sombras duras, arquibancadas e portões A/B/C. Sacada imperial elevada de Kronos integrada à parede curva, acima da plateia, com acesso reservado; não trono no centro. Relógio de sol monumental com suporte cerimonial/simulado para a referência `20:00`. Ponto baixo estável junto à entrada para D no ciclo 3, com campo para o centro e as quatro ancoragens em X; não uma cruz. Não desenhar personagens, chuva, iluminação noturna ou público na ficha vazia.

### AMB-04 — Câmara A de gladiadores
Prancha do compartimento A, com a saída correspondente ao portão A da arena, espaço para três e percurso de retorno. Pedra arruinada, conexões técnicas discretas, luz diurna do portão. Duas vistas conferem o mesmo batente. Serve de continuidade espacial; **não autoriza inserir uma tomada interna de A no ciclo 2**, que nenhuma das fontes acompanhadas registra.

### AMB-05 — Câmara B de gladiadores
Prancha da câmara de Fred/Brock/Jason. Portão B para a arena, parede de onde surgem os cabos, saída interna parcialmente bloqueada e abrigo junto à parede para Fred. Fixar posição da tranca, abertura, segmento rompido e campo possível de D. Vistas do portão para o fundo e do fundo para o portão; não criar uma quarta saída quando a fuga apertar. A composição permite reconhecer os dois corpos a partir do abrigo, sem D atravessar os cabos.

### AMB-06 — Câmara C de gladiadores
Prancha da câmara de André/Anderson/Michael; no segundo ciclo, somente os dois últimos. Portão C e saída/tranca que Anderson testa; proximidade acústica com a passagem de B, sem visão direta entre os interiores. Planos que permitam Michael à frente do olhar de Anderson e o apoio onde tentam resistir. Nada de balcões de festa ou câmeras de segurança do mundo real dentro dela.

### AMB-07 — Corredores e escadaria
Prancha do percurso real oeste/circulação/escada com patamar e dois acessos usados na fuga. Batentes, degraus, grade de serviço e cabo baixo no corredor técnico fixados; nada de labirinto infinito. As vistas de baixo e do patamar concordam com a planta. Demarcar arquitetonicamente onde seis perseguidores podem se dividir em duas frentes, sem pessoas na ficha. Cada bloqueio precisa de um caminho de chegada.

### AMB-08 — Salão do banquete
Prancha de convivium romano monumental, distinta do salão social. Mesa longa no eixo, cabeceira para Kronos, lugar de Kim ao lado e nove lugares para os drenados: **onze assentos**, sem assento para a câmera. Mármore escuro, bronze, abside, luz noturna integrada. Apoio de A na extremidade oposta deve permitir registrar a mesa em profundidade e reconhecer Kronos/Kim sem zoom impossível. Acesso de serviço coerente com o laboratório. Ficha vazia, sem corpos/comida; a distribuição nominal pertence à folha de continuidade de L3-50/51.

### AMB-09 — Entrada e vestíbulo
Prancha da entrada usada no começo e testada no final: portas monumentais, colunas, estátuas decorativas, ligação direta ao corredor oeste. Perspectivas de fora para dentro e de dentro para fora. Mesma fechadura/batente quando a saída não abre; noite exterior. Não inventar uma segunda saída de jardim durante a perseguição.

### AMB-10 — Buffet
Prancha de balcões permanentes integrados lateralmente ao salão, com espaço para Kim e o desconhecido sem fechar a circulação. Fixar canto da tigela de uvas e lugar ao lado de Kim, para a repetição funcionar. Duas vistas concordam com a abertura do salão. Comida/água/pratos entram depois como props de cada ciclo. Não transformar em restaurante com mesa central.

### AMB-11 — Lounge leste e porta de sensor
Prancha do **outro cômodo** de Fred: apoio inicial de D, área onde o grupo passa no fundo, vão acústico para o anúncio e porta de sensor/antebraço na altura do atendente. Fixar lado do sensor, sentido da folha, batente e passagem de serviço que retorna ao corredor oeste/vestíbulo. Mostrar essa conexão na planta geral; não é acesso direto ao exterior. A abertura automática dos ciclos 1/2 e o bloqueio do ciclo 3 usam o mesmo mecanismo. Duas vistas a partir do apoio e da porta, sem personagens.

### OBJ-12 — Objetos, alças e interfaces
Este prompt **não usa planta de ambiente**. Produzir fichas separadas, cada objeto isolado de frente/lado/trás: filmadora analógica com fita longa e alimentação suficiente; digital física e representação virtual; pulseira/alça; suporte SBI de registro; cadeira e base; conector/cabo baixo; máscaras romanas; ingressos sem texto legível; tigela; relógio cenográfico; ancoragens/cordas. Ficha de HUD separa REC, PLAY, TC, hora de gravação e DELETE. Sem marcas reais. A marca de sujeira em D no ciclo 3 é estado temporário documentado, não redesign da câmera.

### 13.3 Campos de segurança

| Identificador literal | Campo físico, sem áudio | Uso narrativo |
|---|---|---|
| CAM 01 — ENTRADA | Portas externas e vestíbulo | Chegada; tentativa final bloqueada. |
| CAM 02 — CORREDOR OESTE | Corredor e seus acessos reais | Entrada, divisão e captura. |
| CAM 03 — SALÃO | Festa e área do anúncio | Comparação de convidados, vigilância de Kronos. |
| CAM 04 — PISCINA | Área externa de lazer | Festa já em andamento, sem mostrar laboratório. |
| CAM 05 — LOUNGE | Fred e conexão do vão do salão | Prova de coexistência e orientação das fontes. |
| CAM 06 — LABORATÓRIO | Estações e acesso principal | Contagem, procedimento, retirada, três DELETEs. |
| CAM 07 — ESCADARIA | Escada/patamar e rota de retorno | Cerco e captura de Jack/Nina. |
| CAM 08 — SERVIÇO | Mesa de A e acesso de serviço do laboratório | Coleta por Kronos após o encerramento do feed CAM 06. |

Não renumerar câmera porque a página mudou. CAM 03 não passa a ser laboratório em um prompt antigo. Um DELETE é encerramento de um feed/arquivo; a existência de CAM 08 precisa ser planejada antes da página final, ainda que só ganhe função dramática ali.

## 14. Montagem resumida

```mermaid
flowchart TD
    C1["C: festa e chegada"] --> A1["A: voz e proximidade do trio"]
    A1 --> D1["D: Fred em outro cômodo"]
    D1 --> F1["Festa: hábitos, prêmio, nove conexões"]
    F1 --> V1["D: arena, André aceita, Jack brinca"]
    V1 --> R1["D / A / S: ataque, corpo, experiência de André"]
    R1 --> X1["C: retirada e DELETE; A: relógio 20:00"]
    X1 --> F2["50 convidados: pistas triviais alteradas"]
    F2 --> V2["Nina impede a luta; Kronos ordena ataque"]
    V2 --> B2["D: câmara B; S: Anderson em C; A: corpos"]
    B2 --> X2["Quatro mortes; retirada e DELETE; A persiste"]
    X2 --> P3["10 convidados; D filma a reprodução no ocular de A"]
    P3 --> M3["Seis convidados põem máscaras"]
    M3 --> H3["Mansão real: duas rotas, resistência, captura"]
    H3 --> V3["D apoiada na arena; Kim em X"]
    V3 --> R3["S / A / C: três mortes e Kim impotente"]
    R3 --> X3["DELETE sem novo reset"]
    X3 --> A3["Kronos recolhe A; entrega a funcionário"]
    A3 --> T3["A fixa: banquete, nove drenados, Kim e Kronos"]
    T3 --> FIM["Feliz Halloween. Fim."]
```

## 15. Revisão editorial executada e limites de produção

| Problema do documento recebido | Decisão nesta revisão |
|---|---|
| Regras e roteiros sobrepostos davam ordens incompatíveis | Uma sequência de 153 páginas e uma regra de produção; não há bloco antigo concorrente. |
| Página 4 prolongava a entrada | Fred aparece na digital em L1-04, em outro cômodo. |
| 180 páginas tratadas como 180 cenas | 3 × (51 narrativas + 9 editoriais), sem acrescentar 27 páginas de filler. |
| Longos blocos sem texto e prompts que pediam “fala aprovada” inexistente | Falas/narrações literais escritas página a página; silêncio especificado onde é deliberado. |
| Continuidade confundida com repetir todo gesto em todo corte | Correspondência pontual; elipses e paralelos com âncoras claras. |
| Câmeras desapareciam, mudavam de mão ou de apoio sem registro | Custódia fechada em §4.3 e mostrada nos blocos correspondentes. |
| A mostraria a própria tela ou filmaria o LDI | D registra o PLAY; A só registra mundo real. |
| Fred filmaria os próprios braços de fora ou uma câmara inacessível | Operador/apoio definidos; outra frente vem de S ou do som, não de D onisciente. |
| A fita “nunca podia recuar”, mesmo em reprodução | Reset não apaga; PLAY recua de modo explícito; volta ao fim antes de REC. |
| Segurança ganhava fala ou tremor portátil | Sem áudio; narrador editorial separado; borrão apenas de movimento no campo/sensor. |
| Realismo confundido com imagem sempre perfeita | Blur, foco e sujeira com causa, persistência e recuperação; pistas decisivas continuam legíveis. |
| Dreads verdes atribuídos ao Kim | Identidades corrigidas conforme os capítulos atuais. |
| Cor de dominância confundida com cor de fala | Duas tabelas distintas; Nina/Anderson/Brock/Fred alinhados ao guia atual. |
| Quatro feeds miúdos e direção de diagonal contraditória | Dois feeds legíveis na abertura; 1–2 painéis como padrão; três apenas em L2-27/L3-28. |
| Arena ora noturna, ora diurna; sol marcando noite | Arena diurna; `20:00` como referência cenográfica de simulação. |
| Remoções repetidas no fim e começo de cada lançamento | Cada encerramento aparece uma vez; lançamento seguinte começa com o estado alterado. |
| Kronos segurava a câmera em um plano impossível | C vê a coleta; A vê a lente virada; funcionário assume e estabelece apoio do banquete. |
| Mesa final podia misturar mortos de ciclos diferentes | Nove drenados corretos, Kim e Kronos; onze ocupantes, sem ressuscitar os capangas anteriores. |

### 15.1 Conferências ainda necessárias na produção de arte

- Confirmar as referências existentes do §13.1 e produzir só os complementos faltantes; a inspeção dessas fichas não equivale à aprovação de páginas novas.
- Materializar a convenção de vínculo D/SBI e a representação virtual; é encenação nova explícita, não informação encontrada num capítulo antigo.
- Fechar o espelho das nove páginas editoriais de cada lançamento a partir dos modelos oficiais; o roteiro já reserva essas páginas sem inventar anúncios.
- Fechar o mapa de hora/TC por tomada a partir dos pontos 19:47, resets cenográficos e quase três horas. Em simultâneos, números correspondentes; em elipses, avanço real; em PLAY, tempo do trecho reproduzido. Nada de números aleatórios gerados em cada arte.
- Aprovar fonte/escala e os tons editoriais de vozes novas em uma prova de celular. O arquivo do guia não prova por si só qual família foi usada nas artes antigas.
- Revisar página aprovada em largura de celular, continuidade de geografia e marcas; anexar a anterior como referência sem copiar seus balões.
- Conferir rosto/corpo corretos, quantidade de pessoas, mãos, fonte/HUD, áudio possível, linha de visão, lado do cabo e custódia antes de aprovar cada imagem.

Essas são dependências de **gerar arte**, não acontecimentos faltando no roteiro. Na revisão textual inicial não foram produzidas imagens novas, testes de página diagramada ou traduções. A inspeção das referências está em §13.1; as fichas geradas na etapa seguinte estão em §16. As variações de trivialidade, os diálogos e a montagem aqui escritos estão disponíveis para revisão de Isaías antes da produção das páginas.

## 16. Fichas de personagem — regra autoral e prompts de 19/10/2026

**Direção expressa de Isaías:** figurantes/personagens genéricos recorrentes são criados juntos numa única folha, com identidades distintas que serão reutilizadas. Personagem principal ou estado importante, como Kronos César decaído, recebe uma ficha individual completa: três colunas com corpo inteiro de frente, costas e perfil; quarta coluna, ou faixa inferior, com expressões da MESMA identidade. Não gerar uma imagem solta para cada pose ou substituir essas vistas por três poses frontais.

**Correção da direção do avatar:** Kronos no LDI é um **César zumbi, rei dos zumbis**, visualmente marcante. Não basta envelhecer o traje ou deixá-lo cansado. A identidade facial permanece reconhecível, mas rosto, olhos, pele e mãos evidenciam sua condição de morto-vivo; a silhueta imperial o destaca acima da plateia. No mundo real, conservar a ficha humana de `Kronos.png`. A primeira tentativa pouco transformada foi rejeitada para essa função e preservada em `Personagens/_descartadas/`.

**Brock:** `Brock.png` foi acrescentado por Isaías e inspecionado; não é mais uma referência faltante. Jason continua sendo o primeiro homem da ficha coletiva dos quatro capangas: não trocar identidades só porque ambos têm cabeça raspada.

### 16.1 Plateia zumbi — prompt completo

Arquivo gerado para revisão autoral: `Personagens/PlateiaZumbi.png`. Referências: `ArenaColiseu.png` e `Capangas-JasonNegroEsquerda-MichaelRuvio-AndersonEmoFranjaCabeloPreto-AndreUltimoDiretaGordo.png`. Oito identidades adultas inéditas em uma folha coletiva; não são os protagonistas nem os capangas.

```text
Use case: photorealistic-natural / reusable crowd character sheet.
Asset: ONE collective reference sheet of recurring undead Roman spectators for a fictional found-footage horror WEB SHARD. Generate a single landscape sheet, preferably 2048 x 1152 or higher native landscape resolution, with EXACTLY EIGHT distinct adult characters together, arranged cleanly in TWO ROWS OF FOUR full-body figures on a seamless neutral medium-gray studio background. Each individual has room around hands, hair and sandals; no overlap or cropping.
REFERENCE ROLES: ArenaColiseu.png governs Roman imperial visual vocabulary and the extreme photographic realism of this fictional production, NOT the setting of this sheet. Capangas-JasonNegroEsquerda-MichaelRuvio-AndersonEmoFranjaCabeloPreto-AndreUltimoDiretaGordo.png governs photographic rendering quality and material texture ONLY. Do NOT copy the four named henchmen's faces, bodies or exact costumes. These eight are NEW unnamed generic adult spectators, never the protagonists or named henchmen.
SUBJECT: a reusable ensemble of eight identifiable zombie-like arena spectators, with human, recognizable, distinct faces. They are invited guests reinterpreted as living-dead Roman spectators inside the LDI: lifeless vacant eyes, exhausted gaunt faces, dull dry pallor retaining natural ethnic distinctions, dry lips, heavy under-eye shadows, slightly stiff or slack posture. Clearly and unmistakably undead, not healthy actors with tired eyes: dry parchment-like skin, sunken facial planes, inert cloudy irises, desiccated hands. Ominous but anatomically intact. The unsettling effect must come from human realism and dead expression, not graphic wounds, exposed anatomy or supernatural neon.
Keep these eight distinct designs, from left to right:
TOP ROW: (1) lean older man with sparse short gray hair and angular nose, worn ivory tunic and rust-red shoulder drape; (2) middle-aged dark-skinned woman with close braided bun, ocher stola and dark bronze fibula; (3) broad-shouldered adult man with curly chestnut hair and short beard, faded olive tunic and plain brown belt; (4) slender adult woman with dark straight chin-length hair, dusty blue stola with ivory underlayer.
BOTTOM ROW: (5) stocky older light-skinned woman with gray hair in a low Roman bun, muted burgundy stola and modest bronze clasp; (6) tall dark-skinned adult man with a narrow face and short tightly curled hair, dusty charcoal tunic and muted ocher shoulder sash; (7) lean adult man with long straight dark hair tied low, aquiline face and tan tunic with muted green drape; (8) adult woman of sturdy build with olive complexion, wavy dark hair pinned up, pale linen stola and weathered terracotta sash.
All garments are ancient Roman party/arena spectator attire, natural worn linen and wool, modest belts, simple bronze clasps and Roman sandals. No modern streetwear, medieval or Victorian dress, Halloween brand costumes or identical prison uniforms. Vary face shape, silhouette, apparent adult age and garment drape so the SAME eight identities can be reused consistently in later crowd panels.
Stances are neutral front or slight three-quarter full-body poses, hands relaxed and clearly formed, some subtle natural asymmetry; no combat poses, no reaching toward the viewer, no weapons. One depicted figure per identity, no turnaround duplicates or extra expression heads on this collective sheet. Maintain exact eight total, both rows equally clear.
Lighting: soft neutral photographic studio lighting, realistic pores, fabric wear, bronze patina, dry desaturated human skin. Do not light this like a colored fantasy painting. Every character is legible separately for reuse; background is NOT a coliseum, crowd, fog or darkness.
TEXT: none. No names, titles, numbers, labels, captions, logos, watermarks, HUD, speech balloons, panel borders, dramatic film blur or decorative fragments. This is a casting continuity sheet rather than a narrative comic page.
```

### 16.2 Kronos César decaído, rei dos zumbis — prompt completo

Arquivo gerado para revisão autoral: `Personagens/KronosCesarDecaido.png`. Referências: `Kronos.png` para identidade e `_descartadas/KronosCesarDecaido_v1_pouco_zumbi.png` exclusivamente para organização da ficha e como exemplo do grau de transformação insuficiente.

```text
Use case: identity-preserve / monstrous sustained character-state reference.
Create ONE reusable photorealistic character model sheet of KRONOS AS THE DECADENT CAESAR, KING OF THE ZOMBIES, for a fictional Roman found-footage horror WEB SHARD. Landscape sheet, preferably 2048 x 1152 or the highest native landscape resolution. This must be a visually spectacular, unmistakably UNDEAD ZOMBIE EMPEROR, not a healthy man in a worn costume.
REFERENCE ROLES: Kronos.png anchors his identity: same underlying aquiline face, recognizable nose and angular cheekbones, long slicked-back black hair and imperial Roman costume language. KronosCesarDecaido_v1_pouco_zumbi.png is the PRIOR REJECTED MILD DESIGN: retain its useful four-column sheet organization but make the undead transformation dramatically stronger. Do NOT merely repeat that mild version. The original references remain unchanged.
SUBJECT DESIGN: the commanding KING OF THE UNDEAD. His face is a dried corpse: deeply hollowed cheeks and temples, visibly sunken milky clouded eyes surrounded by blackened recessed sockets, stretched ash-gray skin with a network of dry dark cracks, shrunken dark lips and an intimidating intact jaw. Powerful, upright imperial presence despite pronounced desiccation of exposed arms and face. He is obviously a reanimated dead emperor, not simply tired, elderly, dirty or cosmetically pale. Preserve enough of Kronos's original facial structure for instant recognition, but the transformation must dominate the image. No exposed organs or open wounds are necessary.
Imperial silhouette is striking and recognizably ANCIENT ROMAN: imposing broad bronze laurel crown of layered aged leaves, broken tips and dark patina, not a medieval spiked king's crown. Aged imperial eagle cuirass and original clasp motifs, heavy burgundy/purple cloak with visibly decayed layers, deep torn hems, weathered gold Roman ornament, corroded bronze bracers, leather skirt strips and Roman sandals. The garments feel ceremonial, powerful and ruined. The crown and cloak must make him unmistakably the sovereign above the generic undead crowd. Dark metallic patina and restrained tarnished gold distinguish him, without neon or magic particles.
LAYOUT, mandatory: exactly FOUR clear columns on a seamless neutral gray photographic studio background. Columns 1, 2 and 3 each show ONE complete head-to-sandals full-body view of THIS SAME zombie Caesar at identical body scale: FRONT; BACK; exact LEFT PROFILE. Arms relaxed slightly apart so the skeletal dryness of hands and arms is readable. Column 4 contains FOUR stacked large head-and-shoulders expressions of this SAME cadaverous face: deathly imperial calm; sinister false welcome with a slight intact-lipped smile; commanding contempt; unnerving victorious satisfaction. Every face including expression portraits has the SAME hollow cheeks, milky eyes, dry cracked skin, crown, hair and decay. Do not make the expression portraits healthy.
Physical consistency: identical costume seams, cloak fastenings, wreath shape, cheekbone structure, hair length and dark crack patterns across all views. Natural proportions, exactly two arms and two legs per full body, intact plausible hands, full uncropped feet and crown. Ultra-photographic texture of desiccated skin, realistic aged cloth and bronze. Controlled neutral studio lighting, sufficiently contrasted to read the facial transformation; NO blur, VHS noise, CCTV interface or dramatic background.
TEXT: absolutely none: no names, labels, titles, numbers, speech bubbles, watermark or logos. This is a single technical turnaround and expression sheet, not a story page or a crowd illustration. No throne, weapons, soldiers or additional people.
```

As imagens produzidas com esses prompts são fichas para revisão autoral; geração e conferência técnica não equivalem à aprovação de Isaías. Elas não substituem automaticamente a referência humana de Kronos ou as fichas dos demais personagens.


**Cadência dos materiais (esclarecimento de Isaías, 19/10/2026):** a pausa de cinco minutos vale para páginas narrativas; fichas e outros materiais de referência podem ser gerados sem intervalo obrigatório. As duas fichas desta seção foram geradas com a ferramenta integrada imagegen; arquivos PNG salvos na pasta Personagens, sem modificar as referências originais. A primeira tentativa do Kronos continua preservada em _descartadas.
