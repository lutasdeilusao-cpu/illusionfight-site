# Imagens do portal

As imagens do portal são feitas no ChatGPT, pelo robô do navegador (`C:\webshard_refs\site_imgs\`, Chrome 9222, `gera_site.cjs <prompt.txt> <saida.png> [refs...]`). Cada imagem vende a área em que aparece: a arte mostra o que a pessoa vai encontrar ao tocar nela.

- **Formato:** sempre retrato 2:3, como um card. Nada quadrado nem largo.
- **Estilo:** anime/webtoon com acabamento de capa, cor saturada, luz ciano e âmbar, sem texto dentro da arte (o site é em 3 idiomas).
- **Personagens:** fichas oficiais da raiz de `Personagens/<Nome>/`, copiadas para `C:\webshard_refs\site_imgs\refs\` (caminho sem acento). Carta, cena ou capa com personagem mostra só o elenco do LDI.

## Onde cada imagem mora

| Área | Arquivo | Conteúdo |
|---|---|---|
| Inicial (cards "Escolha seu destino") e banner rotativo do desktop | `assets/images/banners/banner-01..05.webp` | Histórias, Quadrinhos, Jogos, Músicas, Apoio |
| Rádio Nina (avatar do convite, /musicas, recomendações) | `assets/images/characters/nina-balloon.png` | Nina de fone no estúdio |
| Capa de cada música e faixa da rádio | `assets/images/music/capas/<id>.webp` (600×900) | Cena que traduz o título |
| Card do LDI Lendas em /games | `assets/images/games/lendas.webp` | Lutador no pentagrama das Veias |
| Card do Super Trunfo em /games | `assets/images/games/supertrunfo.webp` | Mesa com cartas do Kim, Jack e Nina |
| Próximos jogos em /games | `assets/images/games/proximo-<id>.webp` (320×480) | Tama, Jack Dream Beer, Arena |

Fora do escopo: capas de capítulo, capas de obra (Mundo das Sombras, Mar de Cinzas), WEB SHARD e Loja.
