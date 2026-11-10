"""Tira do pacote do GitHub Pages as mídias pesadas que mudam pouco e serve
pelo R2 (mesmo bucket/Worker das páginas do WEB SHARD, prefixo `site/`).
Isaias, 10/11/2026: o deploy de 356 MB travava no "syncing_files" do Pages.

  site/presskit/illusion-fight-presskit.zip   ← dist/presskit (gerado no build)
  site/preview-privado/paginas/{novo,antigo}/NN.png  ← dist/preview-privado (uma vez)
  site/musica/ldi/luta-NN.mp3                 ← src/pages/games/LDI/batalha/musica

Sobe só o que falta ou mudou (md5 x ETag) e APAGA do dist o que está no R2.
Roda no predeploy, depois do build. Endereço público: WEBSHARD_CDN + '/site/...'
(src/lib/siteCdn.js).

Uso: python scripts/site-r2.py
"""
import hashlib
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib.util
_spec = importlib.util.spec_from_file_location('wr2', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'webshard-r2.py'))
_wr2 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_wr2)

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(RAIZ, 'dist')
TIPOS = {'.png': 'image/png', '.zip': 'application/zip', '.mp3': 'audio/mpeg', '.webp': 'image/webp'}

# (pasta local, prefixo no R2, apagar do dist depois?)
ORIGENS = [
    (os.path.join(DIST, 'presskit'), 'site/presskit', True),
    (os.path.join(DIST, 'preview-privado', 'paginas'), 'site/preview-privado/paginas', True),
    (os.path.join(RAIZ, 'src', 'pages', 'games', 'LDI', 'batalha', 'musica'), 'site/musica/ldi', False),
]


def md5(p):
    h = hashlib.md5()
    with open(p, 'rb') as f:
        for bloco in iter(lambda: f.read(1 << 20), b''):
            h.update(bloco)
    return h.hexdigest()


def main():
    s3, bucket = _wr2.cliente()
    no_r2 = {}
    for pg in s3.get_paginator('list_objects_v2').paginate(Bucket=bucket, Prefix='site/'):
        for o in pg.get('Contents', []):
            no_r2[o['Key']] = o['ETag'].strip('"')
    subiu = tirou = 0
    for pasta, prefixo, apagar in ORIGENS:
        if not os.path.isdir(pasta):
            continue
        for raiz, _, nomes in os.walk(pasta):
            for nome in nomes:
                p = os.path.join(raiz, nome)
                ext = os.path.splitext(nome)[1].lower()
                if ext not in TIPOS:
                    continue
                chave = prefixo + '/' + os.path.relpath(p, pasta).replace(os.sep, '/')
                if no_r2.get(chave) != md5(p):
                    s3.upload_file(p, bucket, chave, ExtraArgs={'ContentType': TIPOS[ext]})
                    subiu += 1
                tirou += os.path.getsize(p) if apagar else 0
        if apagar:
            shutil.rmtree(pasta)
    print(f'[site-r2] {subiu} arquivo(s) enviado(s) ao R2; {tirou / 1048576:.0f} MB fora do pacote')


if __name__ == '__main__':
    main()
