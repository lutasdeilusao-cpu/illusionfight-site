"""Unifica a limpeza do PR feita no Brevo (Isaias, 01/10/2026).

Entrada: as exportações do Brevo em limpeza/Br, limpeza/Int e as duas que
ficaram em listas_email_int (bloco11_ao_bloco18). Em cada bloco, o arquivo
normal = contatos que RECEBERAM o e-mail de teste (fichas limpas); o
"*SoftBounce*" = falha temporária (caixa cheia, servidor fora) — não é morto,
mas também não está confirmado, então fica numa lista à parte.

Saída (separador ';', UTF-8, coluna EMAIL — importa direto no Brevo):
  contatos_limpos.csv / contatos_limpos_br.csv / contatos_limpos_int.csv
  soft_bounce.csv (só quem NÃO aparece como limpo)
Rodar de novo é seguro: sempre recria a partir dos originais.
"""
import csv, glob, os

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
CAMPOS = ['EMAIL', 'NOME', 'CATEGORIA', 'ANGULO', 'NICHO', 'SEGUIDORES', 'PLATAFORMA', 'REDE_SOCIAL', 'MERCADO', 'LISTA']

arquivos = sorted(glob.glob(os.path.join(RAIZ, 'limpeza', '*', '*.csv'))) + \
    sorted(glob.glob(os.path.join(RAIZ, 'listas_email_int', 'bloco11_ao_bloco18*.csv')))

limpos, soft = {}, {}
for f in arquivos:
    nome = os.path.basename(f)
    eh_soft = 'softbounce' in nome.lower().replace('-', '').replace('_', '')
    mercado = 'BR' if os.sep + 'Br' + os.sep in f else 'INT'
    lista = nome.rsplit('.', 1)[0].replace('_SoftBounce', '').replace('-SoftBounce', '')
    with open(f, encoding='utf-8-sig') as h:
        for r in csv.DictReader(h, delimiter=';'):
            email = (r.get('EMAIL') or '').strip().lower()
            if '@' not in email:
                continue
            linha = {c: (r.get(c) or '').strip() for c in CAMPOS}
            linha.update(EMAIL=email, MERCADO=mercado, LISTA=lista)
            (soft if eh_soft else limpos).setdefault(email, linha)

# entregou em algum teste = limpo, mesmo que tenha dado soft bounce em outro
soft = {e: l for e, l in soft.items() if e not in limpos}

def salvar(nome, linhas):
    with open(os.path.join(AQUI, nome), 'w', encoding='utf-8-sig', newline='') as h:
        w = csv.DictWriter(h, fieldnames=CAMPOS, delimiter=';')
        w.writeheader()
        w.writerows(sorted(linhas, key=lambda l: (l['MERCADO'], l['LISTA'], l['NOME'].lower())))
    print(f'{nome}: {len(linhas)}')

todos = list(limpos.values())
salvar('contatos_limpos.csv', todos)
salvar('contatos_limpos_br.csv', [l for l in todos if l['MERCADO'] == 'BR'])
salvar('contatos_limpos_int.csv', [l for l in todos if l['MERCADO'] == 'INT'])
salvar('soft_bounce.csv', list(soft.values()))
