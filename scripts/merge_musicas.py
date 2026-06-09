import json

with open('scripts/soundon-clean.json', 'r', encoding='utf-8') as f:
    new_tracks = json.load(f)

with open('src/data/musicas.json', 'r', encoding='utf-8') as f:
    old_data = json.load(f)

# Keep the special "Lutas de Ilusão" entry
lutas = [t for t in old_data if t['id'] == 'lutas-de-ilusao']

# Build the new full list: Lutas de Ilusão + new tracks (excluding duplicate Sinfonia)
final = lutas[:]

for t in new_tracks:
    # Skip "Sinfonia Imperfeita" if it's the old placeholder (we use the new one)
    # The new data has real platform URLs
    final.append(t)

# Sort by title
final.sort(key=lambda x: x['titulo'].lower())

with open('src/data/musicas.json', 'w', encoding='utf-8') as f:
    json.dump(final, f, indent=2, ensure_ascii=False)

print(f'✅ Updated musicas.json: {len(final)} tracks total')
print(f'   Kept: Lutas de Ilusão (special cover)')
print(f'   Added/updated: {len(new_tracks)} tracks from SoundOn')
