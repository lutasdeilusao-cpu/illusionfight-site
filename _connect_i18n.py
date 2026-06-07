"""
Connect t() in ALL remaining game JSX files.
Batch updates imports and key UI text.
"""
import os, re

ROOT = r"C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI"

def add_import_and_t(filepath, import_path):
    """Add useLanguage import and extract t() if not present."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already has useLanguage import
    if 'useLanguage' in content:
        return False
    
    # Add import after the last import or at top
    if "import" in content:
        # Find the last import line and add after it
        lines = content.split('\n')
        last_import = 0
        for i, line in enumerate(lines):
            if line.strip().startswith('import ') or line.strip().startswith('//'):
                last_import = i
        
        # Insert the new import
        indent = ''
        for i in range(last_import + 1, min(last_import + 3, len(lines))):
            if lines[i].strip():
                indent = ' ' * (len(lines[i]) - len(lines[i].lstrip()))
                break
        
        insert_line = last_import + 1
        lines.insert(insert_line, f"{indent}import {{ useLanguage }} from '{import_path}'")
        lines.insert(insert_line + 1, '')
        content = '\n'.join(lines)
    
    # Add const { t } = useLanguage() after export default or function declaration
    # Find the function/component definition
    pattern = re.compile(r'(export default function \w+\s*\(\{?[^}]*\}?\s*\)\s*\{)')
    match = pattern.search(content)
    if match:
        func_def = match.group(1)
        # Find the closing paren/bracket
        end_idx = match.end()
        # Insert after the opening brace
        content = content[:end_idx] + '\n  const { t } = useLanguage()' + content[end_idx:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

# Files to update with their import paths
FILES = [
    # Top Trumps
    (r"src\pages\TopTrumpsLobby.jsx", "../context/LanguageContext"),
    (r"src\pages\TopTrumpsMP.jsx", "../context/LanguageContext"),
    
    # Arena Combat
    (r"src\pages\Arena\ArenaCombat.jsx", "../../context/LanguageContext"),
    
    # Pesadelo Particular
    (r"src\pages\PesadeloParticular\PP.jsx", "../../context/LanguageContext"),
    
    # LDI screens
    (r"src\pages\LDI\Lobby.jsx", "../../context/LanguageContext"),
    (r"src\pages\LDI\Create.jsx", "../../context/LanguageContext"),
    (r"src\pages\LDI\Game.jsx", "../../context/LanguageContext"),
    (r"src\pages\LDI\Combat.jsx", "../../context/LanguageContext"),
    
    # Jack Candy screens  
    (r"src\pages\JackCandy\JackCandy.jsx", "../../context/LanguageContext"),
    
    # Tamagoshi
    (r"src\pages\Tamagoshi\Tamagoshi.jsx", "../../context/LanguageContext"),
    
    # Perfil
    (r"src\pages\Perfil\Perfil.jsx", "../../context/LanguageContext"),
    (r"src\pages\Perfil\abas\PerfilConquistas.jsx", "../../../context/LanguageContext"),
    (r"src\pages\Perfil\abas\PerfilArena.jsx", "../../../context/LanguageContext"),
    (r"src\pages\Perfil\abas\PerfilColecao.jsx", "../../../context/LanguageContext"),
    (r"src\pages\Perfil\abas\PerfilConta.jsx", "../../../context/LanguageContext"),
    (r"src\pages\Perfil\abas\Recompensas.jsx", "../../../context/LanguageContext"),
    (r"src\pages\Perfil\abas\PerfilTamagoshi.jsx", "../../../context/LanguageContext"),
    
    # Admin
    (r"src\pages\Admin.jsx", "../context/LanguageContext"),
]

count = 0
for filepath, import_path in FILES:
    full = os.path.join(ROOT, filepath)
    if not os.path.exists(full):
        print(f"❌ {filepath} not found")
        continue
    try:
        if add_import_and_t(full, import_path):
            print(f"✅ {filepath}")
            count += 1
        else:
            print(f"⏭️ {filepath} (already has useLanguage)")
    except Exception as e:
        print(f"❌ {filepath}: {e}")

print(f"\n📊 Updated {count} files")
