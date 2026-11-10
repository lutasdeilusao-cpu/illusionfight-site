"""Leva as páginas traduzidas (PNG da produção) pro site: converte EN/ES em
webp na pasta pública do capítulo e gera a miniatura (capa) de cada idioma
em src/assets/webshard/cap-<slug>-<id>-<idioma>.webp — a que o portal mostra
quando troca a língua (miniaturaCapitulo em src/lib/webshard/catalogo.js).

Depois: python scripts/webshard-r2.py (sobe pro R2) e acrescentar os idiomas
em "idiomas" no episodios.json do título.

Uso:
  python scripts/publicar-traducao.py <pasta-producao> <pasta-publica> <slug> <id> [prefixo-arquivo]
  ex.: ... "WEBSHARD/LUTAS DE ILUSAO/CONTOS/01-sonata" contos-de-ilusao/sonata contos-de-ilusao sonata
       (prefixo-arquivo: 'p_' quando os PNG se chamam p_001.png)
"""
import os
import sys

from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LARGURA_PAGINA = 960
LARGURA_MINI = 240


def main():
    origem, publica, slug, cap = sys.argv[1:5]
    prefixo = sys.argv[5] if len(sys.argv) > 5 else ''
    destino_base = os.path.join(RAIZ, 'public', 'webtoon', *publica.split('/'))
    pt_dir = os.path.join(destino_base, 'pt')
    n_pt = len([f for f in os.listdir(pt_dir) if f.endswith('.webp')])
    for idioma in ('en', 'es'):
        src = os.path.join(origem, idioma.upper())
        nomes = sorted(f for f in os.listdir(src) if f.endswith('.png') and '_v' not in f)
        if len(nomes) != n_pt:
            sys.exit(f'{idioma}: {len(nomes)} páginas, PT tem {n_pt} — não publiquei')
        dst = os.path.join(destino_base, idioma)
        os.makedirs(dst, exist_ok=True)
        for i, nome in enumerate(nomes, 1):
            im = Image.open(os.path.join(src, nome)).convert('RGB')
            if im.width != LARGURA_PAGINA:
                im = im.resize((LARGURA_PAGINA, round(im.height * LARGURA_PAGINA / im.width)), Image.LANCZOS)
            im.save(os.path.join(dst, f'{i:02d}.webp'), 'WEBP', quality=82, method=6)
        print(f'{idioma}: {len(nomes)} páginas → public/webtoon/{publica}/{idioma}')
    # miniaturas por idioma (capa = página 01)
    for idioma in ('pt', 'en', 'es'):
        p1 = sorted(f for f in os.listdir(os.path.join(destino_base, idioma)) if f.endswith('.webp'))[0]
        im = Image.open(os.path.join(destino_base, idioma, p1)).convert('RGB')
        im = im.resize((LARGURA_MINI, round(im.height * LARGURA_MINI / im.width)), Image.LANCZOS)
        saida = os.path.join(RAIZ, 'src', 'assets', 'webshard', f'cap-{slug}-{cap}-{idioma}.webp')
        im.save(saida, 'WEBP', quality=85, method=6)
        print('miniatura', os.path.basename(saida), im.size)


if __name__ == '__main__':
    main()
