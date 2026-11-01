"""Trava que roda antes de todo comando de terminal e barra geração de imagem de quadrinho fora das regras."""
import json, os, re, sys

BOT = r'C:\webshard_refs\chatgpt_bot'
EXPRESSAO = {'Kim': 'KimExpressionSheet.png', 'Jack': 'JackExpressionSheet.png', 'Nina': 'NinaExpressionSheet.png'}


def bloqueia(motivo):
    print(f'TRAVA DE IMAGEM: {motivo}\nLer docs/WEBSHARD/REGRAS_CRITICAS.md, seção ERROS JÁ COMETIDOS.', file=sys.stderr)
    sys.exit(2)


def confere_fila(cmd):
    m = re.search(r'lote_plus\.cjs\s+(?:"[^"]*"|\S+)\s+(\S+\.json)', cmd)
    if not m:
        return
    caminho = os.path.join(BOT, m.group(1).strip('"'))
    if not os.path.exists(caminho):
        return
    jobs = json.load(open(caminho, encoding='utf-8'))
    pendentes = [j for j in jobs if not os.path.exists(j['out'])]
    for j in pendentes:
        nomes = [os.path.basename(r) for r in j['refs']]
        for quem, ficha in EXPRESSAO.items():
            tem_corpo = any(n.startswith(quem) and 'Expression' not in n for n in nomes)
            tem_expr = any(n.startswith(quem) and 'Expression' in n for n in nomes)
            if tem_corpo and not tem_expr:
                bloqueia(f'página {j["n"]}: {quem} sem {ficha}.')
        if any(n.startswith(('Estilo', 'modelo_')) for n in nomes):
            bloqueia(f'página {j["n"]}: página de outra obra ou de estilo anexada.')
        if j.get('dest') and os.path.exists(j['dest']):
            bloqueia(f'página {j["n"]}: o destino já existe e seria sobrescrito: {j["dest"]}')
    if len(pendentes) > 1 and not os.path.exists(caminho + '.teste_ok'):
        bloqueia(f'fila de {len(pendentes)} páginas sem teste aprovado. Gerar UMA, abrir, conferir e só então criar {caminho}.teste_ok')


def confere_script_codex(cmd):
    for arq in re.findall(r'(?:python\S*|py)\s+(?:-\S+\s+)*"?([^"\s]+\.py)', cmd):
        if not os.path.exists(arq):
            continue
        texto = open(arq, encoding='utf-8', errors='ignore').read()
        if "'codex'" in texto and 'exec' in texto and 'input=' not in texto:
            bloqueia(f'{arq} chama o Codex sem mandar o prompt pela entrada padrão.')


def main():
    dados = json.load(sys.stdin)
    cmd = dados.get('tool_input', {}).get('command', '')
    if 'codex exec' in cmd and ' - ' not in cmd + ' ' and '-' != cmd.strip().split(' ')[-1]:
        bloqueia('codex exec direto sem prompt pela entrada padrão.')
    confere_fila(cmd)
    confere_script_codex(cmd)


main()
