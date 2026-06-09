import json

with open('src/data/musicas.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_count = {}
for t in data:
    n = len(t['plataformas'])
    by_count.setdefault(n, []).append(t)

for cnt in sorted(by_count.keys()):
    print(f'\n=== {cnt} plataforma(s) ===')
    for t in by_count[cnt]:
        plats = ', '.join([p['nome'] for p in t['plataformas']])
        print(f'  {t["titulo"]}: {plats}')
