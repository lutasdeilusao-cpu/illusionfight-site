import csv, re, sys, os

CSV = r"docs/Marketing/pr_outreach_illusion_fight.csv"
OUT = r"docs/Marketing/pr_outreach_email_direto.csv"
BR_CSV = r"docs/Marketing/pr_outreach_brasil.csv"
BR_OUT = r"docs/Marketing/pr_outreach_brasil_email_direto.csv"

def ler_csv(path):
    with open(path, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))

def salvar_csv(path, linhas, nomes_campos):
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=nomes_campos)
        w.writeheader()
        w.writerows(linhas)

# ── Etapa 2: limpar duplicatas ──
print("=" * 60)
print("ETAPA 2 — LIMPEZA DE DUPLICATAS")
print("=" * 60)

linhas = ler_csv(CSV)
nomes_campos = list(linhas[0].keys()) if linhas else []
total_antes = len(linhas)
print(f"Total de linhas (sem header): {total_antes}")

seen_nome = set()
seen_contato_email = set()
duplicatas_nome = []
duplicatas_contato = []
limpas = []

for idx, row in enumerate(linhas):
    nome = row.get("Nome", "").strip()
    contato = row.get("Contato", "").strip()

    # Duplicata por Nome
    if nome in seen_nome:
        duplicatas_nome.append((nome, contato))
        continue

    # Duplicata por Contato (se for e-mail válido)
    email_valido = bool(re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', contato))
    if email_valido and contato in seen_contato_email:
        duplicatas_contato.append((nome, contato))
        continue

    seen_nome.add(nome)
    if email_valido:
        seen_contato_email.add(contato)
    limpas.append(row)

print(f"\nLinhas removidas por NOME duplicado: {len(duplicatas_nome)}")
for n, c in duplicatas_nome:
    print(f"  - Nome: {n} | Contato: {c}")

print(f"\nLinhas removidas por CONTATO (e-mail) duplicado: {len(duplicatas_contato)}")
for n, c in duplicatas_contato:
    print(f"  - Nome: {n} | Contato: {c}")

total_removidas = len(duplicatas_nome) + len(duplicatas_contato)
total_depois = len(limpas)
print(f"\nTotal removidas: {total_removidas}")
print(f"Total após limpeza: {total_depois} (header + {total_depois} dados)")

# Salva CSV limpo
salvar_csv(CSV, limpas, nomes_campos)

# ── Etapa 3: extrair e-mails diretos ──
print("\n" + "=" * 60)
print("ETAPA 3 — EXTRAÇÃO DE E-MAILS DIRETOS")
print("=" * 60)

exclude_patterns = [
    "via ", "http", "YouTube About", "DM/", "não encontrado", "nao encontrado"
]

def is_direct_email(contato):
    c = contato.lower().strip()
    if "@" not in c:
        return False
    for pat in exclude_patterns:
        if pat.lower() in c:
            return False
    return True

diretos = [row for row in limpas if is_direct_email(row.get("Contato", ""))]
print(f"Total de e-mails diretos extraídos: {len(diretos)}")

for r in     diretos:
    print(f"  {r['Nome']:40s} | {r['Contato']}")

salvar_csv(OUT, diretos, nomes_campos)

# ── Etapa 4: Brasil ──
print("\n" + "=" * 60)
print("ETAPA 4 — BRASIL")
print("=" * 60)

if os.path.exists(BR_CSV):
    linhas_br = ler_csv(BR_CSV)
    print(f"Total de linhas BR (sem header): {len(linhas_br)}")

    seen_nome_br = set()
    seen_contato_br = set()
    br_limpas = []
    for row in linhas_br:
        nome = row.get("Nome", "").strip()
        contato = row.get("Contato", "").strip()
        if nome in seen_nome_br:
            continue
        email_valido = bool(re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', contato))
        if email_valido and contato in seen_contato_br:
            continue
        seen_nome_br.add(nome)
        if email_valido:
            seen_contato_br.add(contato)
        br_limpas.append(row)

    salvar_csv(BR_CSV, br_limpas, list(linhas_br[0].keys()))
    br_diretos = [row for row in br_limpas if is_direct_email(row.get("Contato", ""))]
    salvar_csv(BR_OUT, br_diretos, list(br_limpas[0].keys()))
    print(f"BR após limpeza: {len(br_limpas)}")
    print(f"BR e-mails diretos: {len(br_diretos)}")
else:
    print(f"Arquivo {BR_CSV} não encontrado. Pulando.")

# ── Resumo final ──
print("\n" + "=" * 60)
print("RESUMO FINAL")
print("=" * 60)
print(f"Internacional — Antes: {total_antes}  |  Depois: {total_depois}  |  E-mails diretos: {len(diretos)}")
if os.path.exists(BR_CSV):
    print(f"Brasil       — Antes: {len(linhas_br)}  |  Depois: {len(br_limpas)}  |  E-mails diretos: {len(br_diretos)}")
else:
    print("Brasil       — arquivo não existe")
