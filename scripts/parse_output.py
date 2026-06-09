import json

with open('scripts/soundon-output.json', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.index('[\n  {')
tracks = json.loads(content[idx:])

print(f'Total: {len(tracks)} tracks\n')

for i, t in enumerate(tracks):
    plats = ', '.join([p['nome'] for p in t['plataformas']])
    status = 'OK' if t['publicado'] else '--'
    print(f"{i+1:2d}. {t['titulo'][:35]:35s} [{status}] {plats}")

with open('scripts/soundon-clean.json', 'w', encoding='utf-8') as f:
    json.dump(tracks, f, indent=2, ensure_ascii=False)

print('\nSaved to scripts/soundon-clean.json')
