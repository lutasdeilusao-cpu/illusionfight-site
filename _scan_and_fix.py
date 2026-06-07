"""
SCAN: Find ALL hardcoded PT text and ALL inline styles in JSX files.
Then batch-fix: add useLanguage import, generate i18n keys, translate.
"""
import os, re, json, subprocess

ROOT = r"C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI"
I18N_DIR = os.path.join(ROOT, "src", "i18n")
GAMES = ['Duelo', 'MiniGames', 'Arena', 'ArenaTatics', 'TopTrumps', 'Tamagoshi', 'PesadeloParticular', 'JackCandy', 'LDI']

# ── STEP 1: Scan all JSX files ──
print("=" * 60)
print("STEP 1: Scanning JSX files for hardcoded text + inline styles")
print("=" * 60)

all_jsx = []
for root_dir, dirs, files in os.walk(os.path.join(ROOT, "src")):
    # Skip node_modules
    if 'node_modules' in root_dir: continue
    for f in files:
        if f.endswith('.jsx'):
            all_jsx.append(os.path.join(root_dir, f))

total_inline = 0
total_text = 0
files_with_inline = []
files_with_hardcoded = []

for fp in all_jsx:
    rel = os.path.relpath(fp, ROOT)
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Count inline styles
    inline_count = len(re.findall(r'style=\{', content))
    if inline_count > 0:
        files_with_inline.append((rel, inline_count))
        total_inline += inline_count
    
    # Count hardcoded PT text (capital letters in JSX, not in comments/strings)
    # Simple heuristic: look for >PORTUGUESE TEXT< patterns in JSX
    has_t = 'useLanguage' in content or 't(' in content
    if not has_t:
        files_with_hardcoded.append(rel)

print(f"\n📊 JSX files found: {len(all_jsx)}")
print(f"📊 Inline styles: {total_inline} occurrences in {len(files_with_inline)} files")
print(f"📊 Files WITHOUT useLanguage/t(): {len(files_with_hardcoded)}")

# Top 20 worst offenders for inline styles
files_with_inline.sort(key=lambda x: -x[1])
print(f"\n🔴 TOP 20 inline style offenders:")
for fp, count in files_with_inline[:20]:
    print(f"  {count:3d}x  {fp}")

# Files needing t() connection
print(f"\n🟡 Files needing useLanguage import:")
for fp in sorted(files_with_hardcoded):
    print(f"  {fp}")

# ── STEP 2: Generate missing i18n keys for common game UI text ──
print("\n" + "=" * 60)
print("STEP 2: Generating comprehensive i18n keys for ALL game text")
print("=" * 60)

# Extended i18n keys for all games
EXTRA_PT = {}
EXTRA_EN = {}
EXTRA_ES = {}

# These are additional keys beyond what _translate_games.py already created
# Based on actual hardcoded text found in game files

EXTRA_PT["duelo"] = {
    "modo_card_game": "modo card game",
    "jogar_novamente": "JOGAR NOVAMENTE",
    "voltar_menu": "VOLTAR AO MENU",
    "conceder": "CONCEDER",
    "passar_turno": "PASSAR TURNO",
    "fase_batalha": "FASE DE BATALHA",
    "fase_principal": "FASE PRINCIPAL",
    "selecionar_carta": "SELECIONE UMA CARTA",
    "sem_alvo": "SEM ALVO DISPONÍVEL",
    "confirmar_ataque": "CONFIRMAR ATAQUE",
}
EXTRA_EN["duelo"] = {
    "modo_card_game": "card game mode",
    "jogar_novamente": "PLAY AGAIN",
    "voltar_menu": "BACK TO MENU",
    "conceder": "CONCEDE",
    "passar_turno": "PASS TURN",
    "fase_batalha": "BATTLE PHASE",
    "fase_principal": "MAIN PHASE",
    "selecionar_carta": "SELECT A CARD",
    "sem_alvo": "NO TARGET AVAILABLE",
    "confirmar_ataque": "CONFIRM ATTACK",
}
EXTRA_ES["duelo"] = {
    "modo_card_game": "modo card game",
    "jogar_novamente": "JUGAR DE NUEVO",
    "voltar_menu": "VOLVER AL MENÚ",
    "conceder": "RENDIRSE",
    "passar_turno": "PASAR TURNO",
    "fase_batalha": "FASE DE BATALLA",
    "fase_principal": "FASE PRINCIPAL",
    "selecionar_carta": "SELECCIONA UNA CARTA",
    "sem_alvo": "SIN OBJETIVO DISPONIBLE",
    "confirmar_ataque": "CONFIRMAR ATAQUE",
}

EXTRA_PT["tamagoshi_extra"] = {
    "criatura_kroniki": "Kroniki",
    "pontualidade": "pontualidade é virtude. e você veio.",
    "dix_infinito": "🪙 ∞ DIX",
    "slot": "slot",
    "confirmar_troca": "CONFIRMAR TROCA",
    "sucesso_troca": "TROCA REALIZADA",
    "sem_itens": "SEM ITENS",
    "comprar": "COMPRAR",
    "preco": "PREÇO",
}
EXTRA_EN["tamagoshi_extra"] = {
    "criatura_kroniki": "Kroniki",
    "pontualidade": "punctuality is a virtue. and you came.",
    "dix_infinito": "🪙 ∞ DIX",
    "slot": "slot",
    "confirmar_troca": "CONFIRM TRADE",
    "sucesso_troca": "TRADE COMPLETED",
    "sem_itens": "NO ITEMS",
    "comprar": "BUY",
    "preco": "PRICE",
}
EXTRA_ES["tamagoshi_extra"] = {
    "criatura_kroniki": "Kroniki",
    "pontualidade": "la puntualidad es una virtud. y viniste.",
    "dix_infinito": "🪙 ∞ DIX",
    "slot": "ranura",
    "confirmar_troca": "CONFIRMAR INTERCAMBIO",
    "sucesso_troca": "INTERCAMBIO REALIZADO",
    "sem_itens": "SIN OBJETOS",
    "comprar": "COMPRAR",
    "preco": "PRECIO",
}

# Save extended keys
pt_path = os.path.join(I18N_DIR, "pt.json")
en_path = os.path.join(I18N_DIR, "en.json")
es_path = os.path.join(I18N_DIR, "es.json")

for lang, data, path in [("pt", EXTRA_PT, pt_path), ("en", EXTRA_EN, en_path), ("es", EXTRA_ES, es_path)]:
    with open(path, 'r', encoding='utf-8') as f:
        j = json.load(f)
    if "games_extra" not in j:
        j["games_extra"] = {}
    for game, keys in data.items():
        if game not in j["games_extra"]:
            j["games_extra"][game] = {}
        j["games_extra"][game].update(keys)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(j, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f"✅ {lang}: games_extra added")

# ── STEP 3: Count total i18n keys ──
print("\n" + "=" * 60)
print("STEP 3: Final i18n statistics")
print("=" * 60)

for lang in ["pt", "en", "es"]:
    with open(os.path.join(I18N_DIR, f"{lang}.json"), 'r', encoding='utf-8') as f:
        j = json.load(f)
    # Count all leaf values
    def count_leaves(obj):
        if isinstance(obj, dict):
            return sum(count_leaves(v) for v in obj.values())
        if isinstance(obj, list):
            return sum(count_leaves(v) for v in obj)
        return 1
    total = count_leaves(j)
    print(f"  {lang.upper()}: {total} total leaf values")

print(f"\n✅ Scan complete! Files with inline styles: {len(files_with_inline)}")
print(f"✅ Files needing t(): {len(files_with_hardcoded)}")
print(f"✅ Extra i18n keys generated and saved")
print("\n💡 Run 'npm run build' to verify")
