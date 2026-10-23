"""Sobe as páginas do WEB SHARD (public/webtoon) pro bucket R2 `webshard`.

O site lê as páginas pelo Worker webshardillusionfight (WEBSHARD_CDN em
src/lib/webshard/catalogo.js), com o mesmo caminho de pasta: public/webtoon/01/pt/01.webp
vira a chave 01/pt/01.webp. Sobe o que falta ou mudou de conteúdo (md5 contra o ETag do R2).
Grava src/data/webshard-hashes.json (chave → 8 letras do md5): o site põe isso no
endereço da página (?r=), então página refeita sempre ganha endereço novo e fura o cache.
Chaves em .env.local (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET).

Uso: python scripts/webshard-r2.py
"""
import hashlib
import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor

import boto3

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA = os.path.join(RAIZ, 'public', 'webtoon')
HASHES = os.path.join(RAIZ, 'src', 'data', 'webshard-hashes.json')
TIPOS = {'.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'}


def cliente():
    env = {}
    for linha in open(os.path.join(RAIZ, '.env.local'), encoding='utf-8'):
        if linha.startswith('R2_') and '=' in linha:
            k, v = linha.strip().split('=', 1)
            env[k] = v
    s3 = boto3.client('s3', endpoint_url=f"https://{env['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
                      aws_access_key_id=env['R2_ACCESS_KEY_ID'], aws_secret_access_key=env['R2_SECRET_ACCESS_KEY'],
                      region_name='auto')
    return s3, env.get('R2_BUCKET', 'webshard')


def main():
    s3, bucket = cliente()
    no_r2 = {}
    for pagina in s3.get_paginator('list_objects_v2').paginate(Bucket=bucket):
        for o in pagina.get('Contents', []):
            no_r2[o['Key']] = o['ETag'].strip('"')

    subir = []
    hashes = {}
    for raiz, _, arquivos in os.walk(PASTA):
        for nome in arquivos:
            ext = os.path.splitext(nome)[1].lower()
            if ext not in TIPOS:
                continue
            caminho = os.path.join(raiz, nome)
            chave = os.path.relpath(caminho, PASTA).replace(os.sep, '/')
            md5 = hashlib.md5(open(caminho, 'rb').read()).hexdigest()
            hashes[chave] = md5[:8]
            if no_r2.get(chave) != md5:
                subir.append((caminho, chave, TIPOS[ext]))

    with open(HASHES, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(dict(sorted(hashes.items())), f, separators=(',', ':'))
    print(f'[webshard-r2] {len(subir)} arquivo(s) pra subir', flush=True)
    feitos = 0

    def um(item):
        caminho, chave, tipo = item
        s3.put_object(Bucket=bucket, Key=chave, Body=open(caminho, 'rb').read(), ContentType=tipo,
                      CacheControl='public, max-age=31536000, immutable')

    with ThreadPoolExecutor(8) as ex:
        for _ in ex.map(um, subir):
            feitos += 1
            if feitos % 100 == 0:
                print(f'[webshard-r2] {feitos}/{len(subir)}', flush=True)
    print(f'[webshard-r2] pronto: {feitos} enviado(s)', flush=True)


if __name__ == '__main__':
    sys.exit(main())
