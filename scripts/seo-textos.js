// Textos de SEO das páginas fixas, nos 3 idiomas (Isaias, 01/10/2026:
// "fazer a sugestão 1 e a 3"). Cada idioma tem a sua versão no Google:
// inglês na raiz, português em /pt/..., espanhol em /es/... (hreflang no
// prerender-routes.js). Os textos foram escritos pro que as pessoas DIGITAM
// na busca, em cada língua — "webtoon brasileiro", "ler grátis online",
// "jogo de navegador grátis", "web novel" — e não traduzidos palavra por
// palavra. Título até ~60 caracteres, descrição até ~155.
//
// Formato: caminho → { en, pt, es: [título, descrição, h1, parágrafo] } +
// meta: [prioridade, frequência, indexável].

export const IDIOMAS = ['en', 'pt', 'es']
export const HTML_LANG = { en: 'en', pt: 'pt-BR', es: 'es' }
export const OG_LOCALE = { en: 'en_US', pt: 'pt_BR', es: 'es_LA' }
export const MARCA = { en: 'Illusion Fight', pt: 'Lutas de Ilusão', es: 'Luchas de Ilusión' }

export const FIXAS = {
  '/login': {
    meta: ['0.0', 'yearly', false],
    en: ['Log in — Illusion Fight', 'Log in to your Illusion Fight account to pick up your stories, games and progress.', 'Log in to Illusion Fight', 'Access your account to continue your progress.'],
    pt: ['Entrar — Lutas de Ilusão | Illusion Fight', 'Entre na sua conta do Illusion Fight e continue suas histórias, jogos e progresso.', 'Entrar no Illusion Fight', 'Acesse sua conta pra continuar de onde parou.'],
    es: ['Iniciar sesión — Illusion Fight', 'Entra a tu cuenta de Illusion Fight y sigue tus historias, juegos y progreso.', 'Iniciar sesión en Illusion Fight', 'Accede a tu cuenta para seguir donde te quedaste.'],
  },
  '/cadastro': {
    meta: ['0.0', 'yearly', false],
    en: ['Create a free account — Illusion Fight', 'Create your free account to read every chapter in full and save your games and achievements on any device.', 'Create a free account', 'Read every chapter in full and save your progress on any device.'],
    pt: ['Criar conta grátis — Lutas de Ilusão | Illusion Fight', 'Crie sua conta grátis pra ler os capítulos inteiros e salvar jogos e conquistas em qualquer aparelho.', 'Crie sua conta grátis', 'Leia os capítulos inteiros e salve seu progresso em qualquer aparelho.'],
    es: ['Crear cuenta gratis — Illusion Fight', 'Crea tu cuenta gratis para leer los capítulos completos y guardar tus juegos y logros en cualquier dispositivo.', 'Crea tu cuenta gratis', 'Lee los capítulos completos y guarda tu progreso en cualquier dispositivo.'],
  },
  '/personagens': {
    meta: ['0.9', 'monthly'],
    en: ['Characters — Kim, Jack, Nina and the LDI Arena | Illusion Fight', 'Meet the fighters of Illusion Fight: Kim, Jack, Nina, Helena, Shuntaro and the rest of the cast of the Brazilian action webcomic.', 'Illusion Fight characters', 'Explore the fighters, their stories, fighting styles and place in the Illusion Fight universe.'],
    pt: ['Personagens de Lutas de Ilusão — Kim, Jack, Nina e a arena LDI', 'Conheça os lutadores de Lutas de Ilusão: Kim, Jack, Nina, Helena, Shuntaro e todo o elenco do webtoon brasileiro de ação.', 'Personagens de Lutas de Ilusão', 'Os lutadores, suas histórias, estilos de luta e o lugar de cada um no universo de Lutas de Ilusão.'],
    es: ['Personajes de Luchas de Ilusión — Kim, Jack, Nina y la arena LDI', 'Conoce a los luchadores de Luchas de Ilusión: Kim, Jack, Nina, Helena, Shuntaro y todo el elenco del webtoon brasileño de acción.', 'Personajes de Luchas de Ilusión', 'Los luchadores, sus historias, estilos de pelea y su lugar en el universo de Luchas de Ilusión.'],
  },
  '/historias': {
    meta: ['0.9', 'weekly'],
    en: ['Free Online Stories — Web Novel and Short Stories | Illusion Fight', 'Read free stories online: the Illusion Fight web novel, the Illusion Tales short stories and other dark fantasy worlds by Isaias Leal.', 'Illusion Fight stories', 'The whole Illusion Fight reading universe in one place: the main storyline, the tales and other stories.'],
    pt: ['Histórias para ler online grátis — livro e contos | Lutas de Ilusão', 'Leia histórias online grátis: o livro de Lutas de Ilusão, os Contos de Ilusão e outros mundos de fantasia sombria de Isaias Leal.', 'Histórias de Lutas de Ilusão', 'Todo o universo de leitura de Lutas de Ilusão num lugar só: a história principal, os contos e outras obras.'],
    es: ['Historias para leer online gratis — novela y cuentos | Luchas de Ilusión', 'Lee historias online gratis: la novela de Luchas de Ilusión, los Cuentos de Ilusión y otros mundos de fantasía oscura de Isaias Leal.', 'Historias de Luchas de Ilusión', 'Todo el universo de lectura de Luchas de Ilusión en un solo lugar: la historia principal, los cuentos y otras obras.'],
  },
  '/historias/lutas-de-ilusao': {
    meta: ['0.9', 'weekly'],
    en: ['Illusion Fight — Free Web Novel, Read Online by Chapter', 'Read the Illusion Fight web novel online for free, chapter by chapter: Kim, 17, in a virtual arena where the pain is 100% real.', 'The Illusion Fight novel', 'Follow the published chapters of the novel that expands the LDI universe.'],
    pt: ['Lutas de Ilusão — livro online grátis, capítulo por capítulo', 'Leia o livro Lutas de Ilusão online e grátis, capítulo por capítulo: Kim, 17 anos, numa arena virtual onde a dor é 100% real.', 'O livro Lutas de Ilusão', 'Acompanhe os capítulos publicados do livro que expande o universo LDI.'],
    es: ['Luchas de Ilusión — novela online gratis, capítulo a capítulo', 'Lee la novela Luchas de Ilusión online y gratis, capítulo a capítulo: Kim, 17 años, en una arena virtual donde el dolor es 100% real.', 'La novela Luchas de Ilusión', 'Sigue los capítulos publicados de la novela que expande el universo LDI.'],
  },
  '/historias/contos': {
    meta: ['0.7', 'weekly'],
    en: ['Illusion Tales — Free Short Stories Online | Illusion Fight', 'Free short stories from the Illusion Fight universe: Alan, Nina, Jack and the band — other characters, the same world. Read online.', 'Illusion Tales', 'Side stories from the Illusion Fight universe — characters and experiences that expand the LDI arena beyond the main storyline.'],
    pt: ['Contos de Ilusão — contos para ler online grátis | Lutas de Ilusão', 'Contos grátis do universo de Lutas de Ilusão: Alan, Nina, Jack e a banda — outros personagens, o mesmo mundo. Leia online.', 'Contos de Ilusão', 'Histórias paralelas do universo de Lutas de Ilusão — personagens e vivências que expandem a arena LDI além da linha principal.'],
    es: ['Cuentos de Ilusión — cuentos para leer online gratis | Luchas de Ilusión', 'Cuentos gratis del universo de Luchas de Ilusión: Alan, Nina, Jack y la banda — otros personajes, el mismo mundo. Lee online.', 'Cuentos de Ilusión', 'Historias paralelas del universo de Luchas de Ilusión — personajes y vivencias que expanden la arena LDI más allá de la línea principal.'],
  },
  '/historias/mundo-das-sombras': {
    meta: ['0.6', 'monthly'],
    en: ['The Shadow World — Dark Fantasy Novel | Illusion Fight', 'The Shadow World, a dark fantasy novel by Isaias Leal. Book 1 of the Discovery Saga. Coming soon, for free, on Illusion Fight.', 'The Shadow World', 'Minus is nine years old and has already lost everything three times. The mark on his shoulder draws the shadows. Dark fantasy from the creator of Illusion Fight.'],
    pt: ['Mundo das Sombras — livro de fantasia sombria | Lutas de Ilusão', 'Mundo das Sombras, fantasia sombria de Isaias Leal. Livro 1 da Saga do Descobrimento. Em breve, grátis, no portal de Lutas de Ilusão.', 'Mundo das Sombras', 'Minus tem nove anos e já perdeu tudo três vezes. A marca no ombro atrai as sombras. Fantasia sombria do criador de Lutas de Ilusão.'],
    es: ['Mundo de las Sombras — novela de fantasía oscura | Luchas de Ilusión', 'Mundo de las Sombras, fantasía oscura de Isaias Leal. Libro 1 de la Saga del Descubrimiento. Muy pronto, gratis, en Luchas de Ilusión.', 'Mundo de las Sombras', 'Minus tiene nueve años y ya lo perdió todo tres veces. La marca en su hombro atrae a las sombras. Fantasía oscura del creador de Luchas de Ilusión.'],
  },
  '/historias/mar-de-cinzas': {
    meta: ['0.6', 'monthly'],
    en: ['Sea of Ashes — Cosmic Horror Dark Fantasy | Illusion Fight', 'Sea of Ashes, a dark fantasy of cosmic horror and oppression by Isaias Leal. Arc I. Coming soon, for free, on Illusion Fight.', 'Sea of Ashes', 'Seventeen years old, a white dress, a groom with three dead wives — and something at the bottom of the ocean that has been waiting for thirty thousand years.'],
    pt: ['Mar de Cinzas — fantasia sombria e horror cósmico | Lutas de Ilusão', 'Mar de Cinzas, fantasia sombria de horror cósmico e opressão de Isaias Leal. Arco I. Em breve, grátis, no portal de Lutas de Ilusão.', 'Mar de Cinzas', 'Dezessete anos, um vestido branco, um noivo com três esposas mortas — e algo no fundo do oceano que espera há trinta mil anos.'],
    es: ['Mar de Cenizas — fantasía oscura y horror cósmico | Luchas de Ilusión', 'Mar de Cenizas, fantasía oscura de horror cósmico y opresión de Isaias Leal. Arco I. Muy pronto, gratis, en Luchas de Ilusión.', 'Mar de Cenizas', 'Diecisiete años, un vestido blanco, un novio con tres esposas muertas — y algo en el fondo del océano que espera hace treinta mil años.'],
  },
  '/webtoon': {
    meta: ['0.9', 'weekly'],
    en: ['Brazilian Action Webtoon — Read Free Online | Illusion Fight WEB SHARD', 'Read Illusion Fight for free: a Brazilian action webtoon in vertical chapters, like manhwa and manga. Kim and the fighters of Bravara.', 'WEB SHARD — Illusion Fight', 'Illusion Fight is the first WEB SHARD series: a Brazilian vertical action comic published in free chapters right here on the site. If you like manga, manhwa or action webcomics, you will recognize the rhythm — with a 100% Brazilian universe and cast.'],
    pt: ['Webtoon brasileiro de ação — leia grátis online | Lutas de Ilusão', 'Leia Lutas de Ilusão grátis: webtoon brasileiro de ação em capítulos verticais, no ritmo de mangá e manhwa. Kim e os lutadores de Bravara.', 'WEB SHARD — Lutas de Ilusão', 'Lutas de Ilusão é a primeira série WEB SHARD: um quadrinho vertical brasileiro de ação, publicado em capítulos grátis aqui no site. Se você curte mangá, manhwa ou webtoon de ação, vai reconhecer o ritmo — com universo e elenco 100% brasileiros.'],
    es: ['Webtoon brasileño de acción — lee gratis online | Luchas de Ilusión', 'Lee Luchas de Ilusión gratis: webtoon brasileño de acción en capítulos verticales, al ritmo del manga y el manhwa. Kim y los luchadores de Bravara.', 'WEB SHARD — Luchas de Ilusión', 'Luchas de Ilusión es la primera serie WEB SHARD: un cómic vertical brasileño de acción, publicado en capítulos gratis aquí en el sitio. Si te gusta el manga, el manhwa o el webtoon de acción, vas a reconocer el ritmo — con un universo y un elenco 100% brasileños.'],
  },
  '/webtoon/lutas-de-ilusao': {
    meta: ['0.8', 'weekly'],
    en: ['Illusion Fight Webtoon — All Chapters Free | WEB SHARD', 'Read Illusion Fight, the vertical action webtoon: Kim, 17, in a virtual arena where the pain is 100% real. Free, in English, Portuguese and Spanish.', 'Illusion Fight — WEB SHARD', 'Bravara, 2XXX. In the LDI, the pain is real and winning is everything. Kim, 17, sells candy on the bus and never cared about some rich-kid game. Until he lost a bet.'],
    pt: ['Lutas de Ilusão webtoon — todos os capítulos grátis | WEB SHARD', 'Leia Lutas de Ilusão, o webtoon vertical de ação: Kim, 17 anos, numa arena virtual onde a dor é 100% real. Grátis, em português, inglês e espanhol.', 'Lutas de Ilusão — WEB SHARD', 'Bravara, 2XXX. No LDI, a dor é real e vencer é tudo. Kim, 17 anos, vende bala no ônibus e nunca ligou pra jogo de playboy. Até perder uma aposta.'],
    es: ['Luchas de Ilusión webtoon — todos los capítulos gratis | WEB SHARD', 'Lee Luchas de Ilusión, el webtoon vertical de acción: Kim, 17 años, en una arena virtual donde el dolor es 100% real. Gratis, en español, portugués e inglés.', 'Luchas de Ilusión — WEB SHARD', 'Bravara, 2XXX. En el LDI, el dolor es real y ganar lo es todo. Kim, 17 años, vende dulces en el autobús y nunca le importó un juego de niños ricos. Hasta que perdió una apuesta.'],
  },
  '/musicas': {
    meta: ['0.8', 'monthly'],
    en: ['Illusion Fight Soundtrack — Listen Free on Nina Radio', 'Listen to the original Illusion Fight soundtrack for free: the anime openings, the songs of Kim and Jack\'s band and Nina Radio exclusives.', 'Illusion Fight music', 'Discover and listen to the original songs of the LDI universe.'],
    pt: ['Trilha sonora de Lutas de Ilusão — ouça grátis na Rádio Nina', 'Ouça grátis a trilha original de Lutas de Ilusão: as aberturas do anime, as músicas da banda do Kim e do Jack e as exclusivas da Rádio Nina.', 'Músicas de Lutas de Ilusão', 'Descubra e ouça as músicas originais do universo LDI.'],
    es: ['Banda sonora de Luchas de Ilusión — escucha gratis en Radio Nina', 'Escucha gratis la banda sonora original de Luchas de Ilusión: las aperturas del anime, las canciones de la banda de Kim y Jack y las exclusivas de Radio Nina.', 'Música de Luchas de Ilusión', 'Descubre y escucha las canciones originales del universo LDI.'],
  },
  '/universos': {
    meta: ['0.8', 'monthly'],
    en: ['Universes and Lore — Illusion Fight, The Shadow World, Sea of Ashes', 'The three universes by Isaias Leal: Illusion Fight, The Shadow World and Sea of Ashes. Lore, races, maps and glossaries.', 'The Illusion Fight universes', "Explore the worldbuilding of the creator's three universes: Illusion Fight, The Shadow World and Sea of Ashes."],
    pt: ['Universos e lore — Lutas de Ilusão, Mundo das Sombras, Mar de Cinzas', 'Os três universos de Isaias Leal: Lutas de Ilusão, Mundo das Sombras e Mar de Cinzas. Lore, raças, mapas e glossários.', 'Os universos de Lutas de Ilusão', 'Explore a construção de mundo dos três universos do autor: Lutas de Ilusão, Mundo das Sombras e Mar de Cinzas.'],
    es: ['Universos y lore — Luchas de Ilusión, Mundo de las Sombras, Mar de Cenizas', 'Los tres universos de Isaias Leal: Luchas de Ilusión, Mundo de las Sombras y Mar de Cenizas. Lore, razas, mapas y glosarios.', 'Los universos de Luchas de Ilusión', 'Explora la construcción de mundo de los tres universos del autor: Luchas de Ilusión, Mundo de las Sombras y Mar de Cenizas.'],
  },
  '/universos/lutas-de-ilusao': {
    meta: ['0.8', 'monthly'],
    en: ['The World of Illusion Fight — Bravara, the LDI Arena and Lore', 'Explore Bravara, the LDI arena, the characters, factions and history of the Illusion Fight universe.', 'The world of Illusion Fight', 'Discover the lore, places, organizations and events of the LDI universe.'],
    pt: ['O mundo de Lutas de Ilusão — Bravara, a arena LDI e a lore', 'Explore Bravara, a arena LDI, os personagens, as facções e a história do universo de Lutas de Ilusão.', 'O mundo de Lutas de Ilusão', 'Descubra a lore, os lugares, as organizações e os eventos do universo LDI.'],
    es: ['El mundo de Luchas de Ilusión — Bravara, la arena LDI y el lore', 'Explora Bravara, la arena LDI, los personajes, las facciones y la historia del universo de Luchas de Ilusión.', 'El mundo de Luchas de Ilusión', 'Descubre el lore, los lugares, las organizaciones y los eventos del universo LDI.'],
  },
  '/universos/mundo-das-sombras': {
    meta: ['0.5', 'monthly'],
    en: ['The Shadow World — universe and glossary | Illusion Fight', 'The worldbuilding of The Shadow World: the Shadows and the Illuminated, the Marked, the Shield and the Arc 1 glossary.', 'The Shadow World universe', 'The Shadows and the Illuminated, the Marked, the Shield — what the characters know by the end of Arc 1.'],
    pt: ['Mundo das Sombras — universo e glossário | Lutas de Ilusão', 'A construção de mundo de Mundo das Sombras: as Sombras e os Iluminados, os Marcados, o Escudo e o glossário do Arco 1.', 'O universo de Mundo das Sombras', 'As Sombras e os Iluminados, os Marcados, o Escudo — o que os personagens sabem até o fim do Arco 1.'],
    es: ['Mundo de las Sombras — universo y glosario | Luchas de Ilusión', 'La construcción de mundo de Mundo de las Sombras: las Sombras y los Iluminados, los Marcados, el Escudo y el glosario del Arco 1.', 'El universo de Mundo de las Sombras', 'Las Sombras y los Iluminados, los Marcados, el Escudo — lo que los personajes saben al final del Arco 1.'],
  },
  '/universos/mar-de-cinzas': {
    meta: ['0.5', 'monthly'],
    en: ['Sea of Ashes — the Thalvorn universe | Illusion Fight', 'The worldbuilding of Sea of Ashes: Thalvorn, its races, the six human crowns, the creatures of the ocean and the cosmic horror.', 'The Sea of Ashes universe', 'Thalvorn: an ocean of islands run on the memory of dead gods. Races, human crowns and what lives at the bottom.'],
    pt: ['Mar de Cinzas — o universo de Thalvorn | Lutas de Ilusão', 'A construção de mundo de Mar de Cinzas: Thalvorn, suas raças, as seis coroas humanas, as criaturas do oceano e o horror cósmico.', 'O universo de Mar de Cinzas', 'Thalvorn: um oceano de ilhas movido pela memória de deuses mortos. Raças, coroas humanas e o que vive no fundo.'],
    es: ['Mar de Cenizas — el universo de Thalvorn | Luchas de Ilusión', 'La construcción de mundo de Mar de Cenizas: Thalvorn, sus razas, las seis coronas humanas, las criaturas del océano y el horror cósmico.', 'El universo de Mar de Cenizas', 'Thalvorn: un océano de islas movido por la memoria de dioses muertos. Razas, coronas humanas y lo que vive en el fondo.'],
  },
  '/autor': {
    meta: ['0.7', 'monthly'],
    en: ['Isaias Leal — Creator of Illusion Fight', 'Meet Isaias Leal, the Brazilian creator of Illusion Fight: webtoon, web novel, games and a whole transmedia universe.', 'The author of Illusion Fight', 'Meet the creator and go behind the scenes of the Illusion Fight universe.'],
    pt: ['Isaias Leal — criador de Lutas de Ilusão', 'Conheça Isaias Leal, o autor brasileiro de Lutas de Ilusão: webtoon, livro, jogos e um universo transmídia inteiro.', 'O autor de Lutas de Ilusão', 'Conheça o criador e os bastidores do universo de Lutas de Ilusão.'],
    es: ['Isaias Leal — creador de Luchas de Ilusión', 'Conoce a Isaias Leal, el autor brasileño de Luchas de Ilusión: webtoon, novela, juegos y todo un universo transmedia.', 'El autor de Luchas de Ilusión', 'Conoce al creador y el detrás de escena del universo de Luchas de Ilusión.'],
  },
  '/assinar': {
    meta: ['0.6', 'monthly'],
    en: ['Subscribe and Support Illusion Fight', 'See the plans to support Illusion Fight and unlock early chapters and perks across the LDI universe.', 'Subscribe to Illusion Fight', "See the plans and support the creation of Illusion Fight's WEB SHARD comics, games and stories."],
    pt: ['Assine e apoie Lutas de Ilusão', 'Veja os planos pra apoiar Lutas de Ilusão e liberar capítulos antecipados e vantagens em todo o universo LDI.', 'Assine Lutas de Ilusão', 'Veja os planos e apoie a criação dos quadrinhos WEB SHARD, jogos e histórias de Lutas de Ilusão.'],
    es: ['Suscríbete y apoya Luchas de Ilusión', 'Mira los planes para apoyar Luchas de Ilusión y desbloquear capítulos anticipados y ventajas en todo el universo LDI.', 'Suscríbete a Luchas de Ilusión', 'Mira los planes y apoya la creación de los cómics WEB SHARD, juegos e historias de Luchas de Ilusión.'],
  },
  '/games': {
    meta: ['0.8', 'weekly'],
    en: ['Free Browser Games — RPG, Card Game and Minigames | Illusion Fight', 'Play free browser games, nothing to download: gang RPG, card game, puzzles, a virtual pet and more in the Illusion Fight universe.', 'Illusion Fight games', 'Play for free in the Illusion Fight universe: tactical RPG, card game, browser minigames, a virtual pet and more — right in your browser, nothing to download.'],
    pt: ['Jogos grátis no navegador — RPG, Super Trunfo e minigames | Lutas de Ilusão', 'Jogue grátis no navegador, sem baixar nada: RPG de gangue, Super Trunfo, quebra-cabeças, bichinho virtual e mais, no universo de Lutas de Ilusão.', 'Jogos de Lutas de Ilusão', 'Jogue grátis no universo de Lutas de Ilusão: RPG tático, Super Trunfo, minigames, bichinho virtual e mais — direto no navegador, sem baixar nada.'],
    es: ['Juegos gratis en el navegador — RPG, cartas y minijuegos | Luchas de Ilusión', 'Juega gratis en el navegador, sin descargar nada: RPG de pandillas, juego de cartas, rompecabezas, mascota virtual y más, en el universo de Luchas de Ilusión.', 'Juegos de Luchas de Ilusión', 'Juega gratis en el universo de Luchas de Ilusión: RPG táctico, juego de cartas, minijuegos, mascota virtual y más — directo en el navegador, sin descargar nada.'],
  },
  '/loja': {
    meta: ['0.7', 'monthly'],
    en: ['Shop — Illusion Fight', 'Find DIX and digital items from the Illusion Fight universe.', 'Illusion Fight shop', 'Explore digital items and ways to support the Illusion Fight universe.'],
    pt: ['Loja — Lutas de Ilusão', 'Encontre DIX e itens digitais do universo de Lutas de Ilusão.', 'Loja de Lutas de Ilusão', 'Itens digitais e formas de apoiar o universo de Lutas de Ilusão.'],
    es: ['Tienda — Luchas de Ilusión', 'Encuentra DIX y objetos digitales del universo de Luchas de Ilusión.', 'Tienda de Luchas de Ilusión', 'Objetos digitales y formas de apoyar el universo de Luchas de Ilusión.'],
  },
  '/quiz': {
    meta: ['0.5', 'monthly'],
    en: ['Illusion Fight Quiz — How Well Do You Know the LDI?', 'Test your knowledge of Illusion Fight and the LDI universe.', 'Illusion Fight quiz', 'Answer questions and find out how well you know the LDI arena.'],
    pt: ['Quiz de Lutas de Ilusão — quanto você sabe do LDI?', 'Teste seus conhecimentos sobre Lutas de Ilusão e o universo LDI.', 'Quiz de Lutas de Ilusão', 'Responda as perguntas e descubra quanto você conhece da arena LDI.'],
    es: ['Quiz de Luchas de Ilusión — ¿cuánto sabes del LDI?', 'Pon a prueba lo que sabes de Luchas de Ilusión y el universo LDI.', 'Quiz de Luchas de Ilusión', 'Responde las preguntas y descubre cuánto conoces la arena LDI.'],
  },
  '/custos': {
    meta: ['0.4', 'monthly'],
    en: ['Platform costs — Illusion Fight', 'See the costs and the structure that keep the Illusion Fight platform running.', 'Platform costs', 'Transparency about the structure and costs behind the Illusion Fight project.'],
    pt: ['Custos da plataforma — Lutas de Ilusão', 'Veja os custos e a estrutura que mantêm a plataforma de Lutas de Ilusão no ar.', 'Custos da plataforma', 'Transparência sobre a estrutura e os custos por trás do projeto Lutas de Ilusão.'],
    es: ['Costos de la plataforma — Luchas de Ilusión', 'Mira los costos y la estructura que mantienen la plataforma de Luchas de Ilusión en línea.', 'Costos de la plataforma', 'Transparencia sobre la estructura y los costos detrás del proyecto Luchas de Ilusión.'],
  },
  '/web-shard': {
    meta: ['0.6', 'monthly'],
    en: ['WEB SHARD: Vertical Webcomic and Manga in Composed Pages — Illusion Fight', "WEB SHARD is Illusion Fight's own format: composed vertical pages built for scrolling on your phone. Learn what it is and read the debut series.", "WEB SHARD — Illusion Fight's own format", 'A reading format created by Illusion Fight: composed vertical pages designed for scrolling on your phone.'],
    pt: ['WEB SHARD: webtoon e mangá vertical em páginas compostas | Lutas de Ilusão', 'WEB SHARD é o formato próprio de Lutas de Ilusão: páginas verticais compostas pra rolar no celular. Entenda o que é e leia a série de estreia.', 'WEB SHARD — o formato de Lutas de Ilusão', 'Um formato de leitura criado por Lutas de Ilusão: páginas verticais compostas, pensadas pra rolar no celular.'],
    es: ['WEB SHARD: webtoon y manga vertical en páginas compuestas | Luchas de Ilusión', 'WEB SHARD es el formato propio de Luchas de Ilusión: páginas verticales compuestas para deslizar en el celular. Descubre qué es y lee la serie de estreno.', 'WEB SHARD — el formato de Luchas de Ilusión', 'Un formato de lectura creado por Luchas de Ilusión: páginas verticales compuestas, pensadas para deslizar en el celular.'],
  },
  '/calendario': {
    meta: ['0.8', 'weekly'],
    en: ['Release Calendar — Season 1 | Illusion Fight', 'Follow the releases of chapters, WEB SHARD, games, music and partners of Illusion Fight.', 'Release calendar', 'See the public Season 1 calendar and follow every release channel of the Illusion Fight universe.'],
    pt: ['Calendário de lançamentos — Temporada 1 | Lutas de Ilusão', 'Acompanhe os lançamentos de capítulos, WEB SHARD, jogos, músicas e parceiros de Lutas de Ilusão.', 'Calendário de lançamentos', 'Veja o calendário público da Temporada 1 e acompanhe cada lançamento do universo de Lutas de Ilusão.'],
    es: ['Calendario de lanzamientos — Temporada 1 | Luchas de Ilusión', 'Sigue los lanzamientos de capítulos, WEB SHARD, juegos, música y socios de Luchas de Ilusión.', 'Calendario de lanzamientos', 'Mira el calendario público de la Temporada 1 y sigue cada lanzamiento del universo de Luchas de Ilusión.'],
  },
  '/leaderboard': {
    meta: ['0.5', 'weekly'],
    en: ['Leaderboard — Illusion Fight', 'Follow the player rankings of the Illusion Fight universe.', 'Illusion Fight leaderboard', 'See the arena player standings.'],
    pt: ['Ranking — Lutas de Ilusão', 'Acompanhe o ranking dos jogadores do universo de Lutas de Ilusão.', 'Ranking de Lutas de Ilusão', 'Veja a classificação dos jogadores da arena.'],
    es: ['Ranking — Luchas de Ilusión', 'Sigue el ranking de jugadores del universo de Luchas de Ilusión.', 'Ranking de Luchas de Ilusión', 'Mira la clasificación de los jugadores de la arena.'],
  },
  '/games/ldi': {
    meta: ['0.6', 'monthly'],
    en: ['LDI Legends — Free Narrative RPG | Illusion Fight', 'Play LDI Legends, the free narrative RPG of the Illusion Fight universe, right in your browser.', 'LDI Legends', 'Step into the narrative adventure and write your story in the LDI arena.'],
    pt: ['LDI Lendas — RPG narrativo grátis | Lutas de Ilusão', 'Jogue LDI Lendas, o RPG narrativo grátis do universo de Lutas de Ilusão, direto no navegador.', 'LDI Lendas', 'Entre na aventura narrativa e escreva sua história na arena LDI.'],
    es: ['Leyendas LDI — RPG narrativo gratis | Luchas de Ilusión', 'Juega Leyendas LDI, el RPG narrativo gratis del universo de Luchas de Ilusión, directo en el navegador.', 'Leyendas LDI', 'Entra en la aventura narrativa y escribe tu historia en la arena LDI.'],
  },
  '/games/ldi-gangues': {
    meta: ['0.6', 'monthly'],
    en: ['LDI Gangs — Free Gang RPG in Your Browser | Illusion Fight', 'Build your crew, take over the streets of Marélia and fight bosses in LDI Gangs, a free gang RPG you play right in your browser.', 'LDI Gangs', 'Form your gang, recruit fighters and take every territory of Marélia, from the Track to the Rooftop.'],
    pt: ['LDI Gangues — jogo de gangue grátis no navegador | Lutas de Ilusão', 'Monte sua tropa, tome as ruas de Marélia e encare os chefões em LDI Gangues, RPG de gangue grátis direto no navegador.', 'LDI Gangues', 'Funde sua gangue, recrute lutadores e tome cada território de Marélia, da Pista até a Laje.'],
    es: ['LDI Gangues — juego de pandillas gratis en el navegador | Luchas de Ilusión', 'Arma tu banda, toma las calles de Marélia y enfrenta a los jefes en LDI Gangues, RPG de pandillas gratis directo en el navegador.', 'LDI Gangues', 'Funda tu pandilla, recluta luchadores y toma cada territorio de Marélia, de la Pista a la Azotea.'],
  },
  '/games/toptrumps': {
    meta: ['0.6', 'monthly'],
    en: ['LDI Trumps — Free Online Top Trumps Card Game | Illusion Fight', 'Play a free online Top Trumps card game with the fighters of Illusion Fight: solo or against other players.', 'LDI Trumps', 'Build your deck and play matches with characters from the LDI universe.'],
    pt: ['LDI Super Trunfo — Super Trunfo online grátis | Lutas de Ilusão', 'Jogue Super Trunfo online grátis com os lutadores de Lutas de Ilusão: sozinho ou contra outros jogadores.', 'LDI Super Trunfo', 'Monte seu baralho e jogue partidas com os personagens do universo LDI.'],
    es: ['LDI Trumps — juego de cartas Top Trumps online gratis | Luchas de Ilusión', 'Juega Top Trumps online gratis con los luchadores de Luchas de Ilusión: solo o contra otros jugadores.', 'LDI Trumps', 'Arma tu mazo y juega partidas con los personajes del universo LDI.'],
  },
}

export const HOME = {
  en: ['Illusion Fight — Free Brazilian Webtoon, Web Novel and Browser Games', 'Illusion Fight: a Brazilian action universe with a free webtoon (WEB SHARD), a web novel and short stories to read online, and free browser games.', 'Illusion Fight: webtoon, stories and games in one universe', 'Discover a Brazilian action and science fiction story. Read the WEB SHARD webtoon and the chapter-by-chapter stories online for free, meet the characters and play free browser games in the Illusion Fight universe: gang RPG, card game, minigames and more — nothing to download.'],
  pt: ['Lutas de Ilusão — webtoon brasileiro, livro e jogos grátis | Illusion Fight', 'Lutas de Ilusão: universo brasileiro de ação com webtoon grátis (WEB SHARD), livro e contos pra ler online e jogos grátis no navegador.', 'Lutas de Ilusão: webtoon, histórias e jogos num universo só', 'Uma história brasileira de ação e ficção científica. Leia o webtoon WEB SHARD e as histórias em capítulos online e de graça, conheça os personagens e jogue grátis no navegador no universo de Lutas de Ilusão: RPG de gangue, Super Trunfo, minigames e mais — sem baixar nada.'],
  es: ['Luchas de Ilusión — webtoon brasileño, novela y juegos gratis | Illusion Fight', 'Luchas de Ilusión: universo brasileño de acción con webtoon gratis (WEB SHARD), novela y cuentos para leer online y juegos gratis en el navegador.', 'Luchas de Ilusión: webtoon, historias y juegos en un solo universo', 'Una historia brasileña de acción y ciencia ficción. Lee el webtoon WEB SHARD y las historias por capítulos online y gratis, conoce a los personajes y juega gratis en el navegador en el universo de Luchas de Ilusión: RPG de pandillas, juego de cartas, minijuegos y más — sin descargar nada.'],
}

// Rótulos da página estática (o que o Google lê fora do título)
export const UI = {
  en: { nav: ['Stories', 'WEB SHARD', 'Games', 'Characters', 'Universes'], verTambem: 'See also', migalha: 'Breadcrumb', cap: 'Chapter', resto: 'Create a free account to read the rest of this chapter.', todos: 'All chapters', personagens: 'Characters', todosPersonagens: 'All characters', lerHistorias: 'Read the stories', contos: 'Illusion Tales', todosContos: 'All Illusion Tales', livro: 'The Novel — Illusion Fight', jogos: 'Games', pagina: 'page', fatos: ['Nickname', 'Age', 'Group', 'Weapon', 'Fighting style', 'Elemental affinity', 'Ranking'], personagemTitulo: '{nome} — Illusion Fight character', capLivro: '{titulo} — Illusion Fight novel, chapter {n}', capConto: '{nome} — chapter {n}: {titulo} | Illusion Fight', hubConto: '{nome} — Illusion Tales | Illusion Fight', obraCap: '{nome} — {titulo} | Illusion Fight', ep: '{titulo} — Illusion Fight webtoon, chapter {n}', epExtra: 'Read this chapter of Illusion Fight, the Brazilian action and sci-fi webtoon, online for free in English, Portuguese and Spanish.', livroExtra: 'Read it online for free in English. Portuguese and Spanish versions are also available.', gratis: 'Read it online for free on Illusion Fight.', oQueEWebshard: 'What is WEB SHARD', todosEps: 'Illusion Fight — all chapters' },
  pt: { nav: ['Histórias', 'WEB SHARD', 'Jogos', 'Personagens', 'Universos'], verTambem: 'Veja também', migalha: 'Navegação', cap: 'Capítulo', resto: 'Crie sua conta grátis pra ler o resto deste capítulo.', todos: 'Todos os capítulos', personagens: 'Personagens', todosPersonagens: 'Todos os personagens', lerHistorias: 'Ler as histórias', contos: 'Contos de Ilusão', todosContos: 'Todos os Contos de Ilusão', livro: 'O livro — Lutas de Ilusão', jogos: 'Jogos', pagina: 'página', fatos: ['Apelido', 'Idade', 'Grupo', 'Arma', 'Estilo de luta', 'Afinidade elemental', 'Ranking'], personagemTitulo: '{nome} — personagem de Lutas de Ilusão', capLivro: '{titulo} — Lutas de Ilusão, livro, capítulo {n}', capConto: '{nome} — capítulo {n}: {titulo} | Lutas de Ilusão', hubConto: '{nome} — Contos de Ilusão | Lutas de Ilusão', obraCap: '{nome} — {titulo} | Lutas de Ilusão', ep: '{titulo} — webtoon Lutas de Ilusão, capítulo {n}', epExtra: 'Leia este capítulo de Lutas de Ilusão, o webtoon brasileiro de ação e ficção científica, online e grátis em português, inglês e espanhol.', livroExtra: 'Leia online e grátis em português. Também em inglês e espanhol.', gratis: 'Leia online e grátis no portal de Lutas de Ilusão.', oQueEWebshard: 'O que é WEB SHARD', todosEps: 'Lutas de Ilusão — todos os capítulos' },
  es: { nav: ['Historias', 'WEB SHARD', 'Juegos', 'Personajes', 'Universos'], verTambem: 'Ver también', migalha: 'Navegación', cap: 'Capítulo', resto: 'Crea tu cuenta gratis para leer el resto de este capítulo.', todos: 'Todos los capítulos', personagens: 'Personajes', todosPersonagens: 'Todos los personajes', lerHistorias: 'Leer las historias', contos: 'Cuentos de Ilusión', todosContos: 'Todos los Cuentos de Ilusión', livro: 'La novela — Luchas de Ilusión', jogos: 'Juegos', pagina: 'página', fatos: ['Apodo', 'Edad', 'Grupo', 'Arma', 'Estilo de pelea', 'Afinidad elemental', 'Ranking'], personagemTitulo: '{nome} — personaje de Luchas de Ilusión', capLivro: '{titulo} — Luchas de Ilusión, novela, capítulo {n}', capConto: '{nome} — capítulo {n}: {titulo} | Luchas de Ilusión', hubConto: '{nome} — Cuentos de Ilusión | Luchas de Ilusión', obraCap: '{nome} — {titulo} | Luchas de Ilusión', ep: '{titulo} — webtoon Luchas de Ilusión, capítulo {n}', epExtra: 'Lee este capítulo de Luchas de Ilusión, el webtoon brasileño de acción y ciencia ficción, online y gratis en español, portugués e inglés.', livroExtra: 'Léela online y gratis en español. También en portugués e inglés.', gratis: 'Lee online y gratis en el portal de Luchas de Ilusión.', oQueEWebshard: 'Qué es WEB SHARD', todosEps: 'Luchas de Ilusión — todos los capítulos' },
}

export const preencher = (modelo, vars) => modelo.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
