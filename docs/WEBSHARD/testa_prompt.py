"""Testa um prompt de página do WEB SHARD contra MANDAMENTOS_WEBSHARD.md e TEMPLATE_PROMPT_PAGINA.md.

Uso: python testa_prompt.py <p_NNN.txt> [mais arquivos...]
Os vizinhos (p_NNN-1 e p_NNN+1 na mesma pasta) entram na conferência de ângulo e de corte.
Sai com código 1 se algum prompt falhar.
"""
import re
import sys
from pathlib import Path

# Personagens e cores vêm do próprio prompt: cada linha de PERSONAGENS é "Nome: ... Cor: <cor>."
CORES = {}

SECOES = ['REFERÊNCIAS', 'ESTILO', 'PERSONAGENS', 'LUGAR E GEOGRAFIA', 'COMPOSIÇÃO',
          'PAINEL 1', 'ESTILHAÇOS', 'TEXTOS']
ABERTURA = 'Criar UMA página de quadrinho vertical e alta, no tamanho 960×1637.'
NEGACOES = r'\b(sem|não|nao|nunca|nenhum|nenhuma|nada|jamais)\b'
BORDA_BRANCA = r'margem|margens|área livre|area livre|longe das bordas|moldura branca|borda branca'
ROSTO = r'\b(rosto|olho|olhos|boca|sorri\w*|express\w*|sobrancelha\w*|nariz|barba|marca no olho)\b'
FUNCOES = r'tempo|reação|reacao|causa|consequência|consequencia|olhar|detalhe'
ACAO = r'salt\w*|ca[ií]\w*|queda|golpe\w*|soco|chut\w*|chega\w*|pous\w*|corre\w*|investe\w*|lan[çc]\w*'
LEITOR = r'olh\w* (para|pro|ao) (o )?(leitor|lente|câmera|camera)'


def secoes(txt):
    """Divide o prompt em blocos pelo título em caixa alta no começo da linha."""
    blocos, atual = {}, None
    for linha in txt.splitlines():
        m = re.match(r'^(REFERÊNCIAS|ESTILO|PERSONAGENS|LUGAR E GEOGRAFIA|COMPOSIÇÃO|PAINEL \d+[^\n]*|ESTILHAÇOS|TEXTOS)\s*$', linha)
        if m:
            atual = m.group(1)
            blocos[atual] = []
        elif atual:
            blocos[atual].append(linha)
    return {k: '\n'.join(v) for k, v in blocos.items()}


def paineis(blocos):
    return [(k, v) for k, v in blocos.items() if k.startswith('PAINEL')]


def camera(texto):
    m = re.search(r'^Câmera:\s*(.+)$', texto, re.M)
    return m.group(1).split(',')[0].strip().lower() if m else None


def corte(txt):
    m = re.search(r'corte diagonal que (sobe|desce) da (esquerda|direita)', txt)
    return m.groups() if m else None


def sem_falas(txt):
    """Tira o que está entre aspas (fala e onomatopeia), que não é instrução de desenho."""
    return re.sub(r'"[^"]*"', '""', txt)


def vizinho(arq, passo):
    m = re.match(r'p_(\d+)\.txt$', arq.name)
    if not m:
        return None
    v = arq.with_name('p_%03d.txt' % (int(m.group(1)) + passo))
    return v.read_text(encoding='utf-8') if v.exists() else None


def testa(arq):
    txt = arq.read_text(encoding='utf-8')
    corpo = '\n'.join(txt.splitlines()[2:]) if txt.startswith('OUT:') else txt
    instr = sem_falas(corpo)
    b = secoes(corpo)
    pn = paineis(b)
    CORES.clear()
    for nome, cor in re.findall(r'^(\w+):[^\n]*?\bCor:\s*([\w-]+)', b.get('PERSONAGENS', ''), re.M):
        CORES[nome.lower()] = cor.lower()
    res = []

    def r(cod, ok, msg):
        res.append((cod, ok, msg))

    # Template
    falta = [s for s in SECOES if not any(k.startswith(s) for k in b)]
    r('T', not falta, 'seções do template presentes' + (f' — faltam: {", ".join(falta)}' if falta else ''))
    r('T', txt.startswith('OUT:') and '\nREFS:' in txt, 'cabeçalho OUT e REFS')
    r('T', bool(CORES), 'cada personagem com "Cor:" em PERSONAGENS' + ('' if CORES else ' — nenhuma cor declarada'))

    # M1
    pix = re.findall(r'\d{3,4}\s*[×x]\s*\d{3,4}', corpo)
    r('M1', ABERTURA in corpo and pix == ['960×1637'], f'abertura fixa e um só número de pixels (achou {pix})')
    # M2
    bb = re.findall(BORDA_BRANCA, instr, re.I)
    r('M2', 'quatro beiras' in corpo and not bb, 'arte até as quatro beiras' + (f' — palavras proibidas: {bb}' if bb else ''))
    # M3
    n = len(pn)
    unico_ok = n != 1 or re.search(r'pausa dramática|glitch', b.get('COMPOSIÇÃO', ''), re.I)
    r('M3', 1 <= n <= 3 and bool(unico_ok), f'{n} painel(is); painel único só com pausa dramática ou glitch')
    # M4
    est = re.findall(r'^- Estilhaço \d+.*$', b.get('ESTILHAÇOS', ''), re.M)
    sem_funcao = [e[:40] for e in est if not re.search(r'Função:\s*(' + FUNCOES + ')', e, re.I)]
    r('M4', len(est) >= 2 and not sem_funcao, f'{len(est)} estilhaço(s), cada um com função' + (f' — sem função: {sem_funcao}' if sem_funcao else ''))
    # M5
    comp = b.get('COMPOSIÇÃO', '')
    erros5 = []
    for i in range(1, n):
        m = re.search(rf'Entre o painel {i} e o painel {i + 1}:(.*)', comp)
        dono = re.search(r'—\s*(\w+)', pn[i - 1][0])
        cor_dono = CORES.get(dono.group(1).lower()) if dono else None
        if not m:
            erros5.append(f'falta a borda {i}-{i + 1}')
        elif not cor_dono:
            erros5.append(f'dono do painel {i} sem cor em PERSONAGENS')
        elif cor_dono not in m.group(1).lower():
            erros5.append(f'borda {i}-{i + 1} sem a cor {cor_dono} de quem domina o painel {i}')
    for k, _ in pn:
        if not re.search(r'—\s*\w+ domina', k):
            erros5.append(f'"{k}" sem quem domina')
    r('M5', not erros5, 'borda colorida com a cor de quem domina' + (f' — {erros5}' if erros5 else ''))
    # M6
    c = corte(corpo)
    ant, prox = vizinho(arq, -1), vizinho(arq, 1)
    erros6 = []
    if not c:
        erros6.append('direção do corte não escrita')
    for nome, v in (('anterior', ant), ('seguinte', prox)):
        if c and v and corte(v) == c:
            erros6.append(f'mesma direção da página {nome}')
    r('M6', not erros6, f'corte diagonal {c}' + (f' — {erros6}' if erros6 else ''))
    # M7
    cams = [camera(v) for _, v in pn]
    erros7 = [f'{pn[i][0]} sem "Câmera:"' for i, x in enumerate(cams) if not x]
    erros7 += [f'painéis {i + 1} e {i + 2} repetem "{cams[i]}"' for i in range(len(cams) - 1) if cams[i] and cams[i] == cams[i + 1]]
    if ant and cams and cams[0]:
        pa = paineis(secoes(ant))
        if pa and camera(pa[-1][1]) == cams[0]:
            erros7.append('1º painel repete o último da página anterior')
    if prox and cams and cams[-1]:
        pp = paineis(secoes(prox))
        if pp and camera(pp[0][1]) == cams[-1]:
            erros7.append('último painel repete o 1º da página seguinte')
    r('M7', not erros7, f'ângulos {cams}' + (f' — {erros7}' if erros7 else ''))
    # M8
    plano = arq.parent.parent / 'PLANO_CAMERA.md'
    r('M8', plano.exists(), f'plano de câmera do capítulo escrito antes ({plano.name})')
    # M9
    erros9 = [k for k, v in pn if re.search(r'corpo inteiro', v, re.I) and not re.search(ACAO, v, re.I)]
    r('M9', not erros9, 'corpo inteiro só com ação' + (f' — {erros9}' if erros9 else ''))
    # M10
    erros10 = [k for k, v in pn if sum(1 for p in CORES if re.search(rf'\b{p}\b', v, re.I)) > 3]
    r('M10', not erros10, 'até 3 personagens por painel' + (f' — {erros10}' if erros10 else ''))
    # M11, M12, M13
    tx = b.get('TEXTOS', '')
    r('M11', re.search(r'fonte oficial', tx, re.I) is not None, 'fonte oficial única nos balões')
    erros12 = []
    if not re.search(r'fundo branco', tx, re.I):
        erros12.append('fundo branco')
    if not re.search(r'destaque', tx, re.I):
        erros12.append('palavras de destaque')
    for linha in re.findall(r'^- .*$', tx, re.M):
        if 'onomatopeia' in linha.lower():
            continue
        quem = [p for p in CORES if re.search(rf'\b{p}\b', sem_falas(linha), re.I)]
        if quem and CORES[quem[0]] not in linha.lower() and CORES[quem[0]] not in tx.lower():
            erros12.append(f'fala de {quem[0]} sem a cor {CORES[quem[0]]}')
    r('M12', not erros12, 'balão branco, cor de quem fala, destaque' + (f' — falta: {erros12}' if erros12 else ''))
    r('M13', re.search(r'grande', tx, re.I) is not None, 'balão grande para celular')
    # M14
    falas = re.findall(r'^- .*$', tx, re.M)
    sem_lugar = [f[:40] for f in falas if not (re.search(r'Painel \d', f) and re.search(r'esquerda|direita|centro|acima|abaixo|alto|baixo|ao longo', f, re.I))]
    r('M14', 'A leitura desce' in comp and not sem_lugar, 'ordem de leitura e lugar de cada texto' + (f' — sem lugar: {sem_lugar}' if sem_lugar else ''))
    # M15
    erros15 = [f[:40] for f in falas if 'fora do quadro' in f and 'borda' not in f]
    r('M15', not erros15, 'fala de fora do quadro com cauda pela borda' + (f' — {erros15}' if erros15 else ''))
    # M16
    r('M16', any('onomatopeia' in f.lower() for f in falas), 'onomatopeia na página (aviso se a cena for muda)')
    # M17
    sobra = re.findall(r'\{[^}]*\}|^>>.*$|\[M\d+\]', corpo, re.M)
    r('M17', not sobra, 'nenhuma instrução do template sobrou no prompt' + (f' — {sobra[:3]}' if sobra else ''))
    # M18
    neg = sorted({m.group(0) for m in re.finditer(NEGACOES, instr, re.I)})
    r('M18', not neg, 'tudo em positivo' + (f' — negações: {neg}' if neg else ''))
    # M19
    erros19 = []
    for p in CORES:
        if re.search(rf'\b{p}\b[^.\n]*(de costas|só de costas)', instr, re.I):
            for frase in re.split(r'(?<=[.:])\s+|\n', instr):
                if re.search(rf'\b{p}\b', frase, re.I) and re.search(ROSTO, frase, re.I) and not re.search(r'\bolha\b', frase):
                    erros19.append(f'{p}: "{frase.strip()[:60]}"')
    r('M19', not erros19, 'quem está de costas sem rosto' + (f' — {erros19}' if erros19 else ''))
    # M20
    geo = b.get('LUGAR E GEOGRAFIA', '')
    r('M20', 'esquerda da imagem' in geo and 'direita da imagem' in geo, 'geografia fixa: esquerda e direita da imagem')
    # M21
    olhares = re.findall(r'[^.\n]*\bolh(a|am|ando)\b[^.\n]*', instr)
    frases = [f for f in re.findall(r'[^.\n]*\bolh(?:a|am|ando)\b[^.\n]*', instr)]
    erros21 = [f.strip()[:60] for f in frases if not re.search(r'esquerda|direita|primeiro plano', f, re.I)]
    r('M21', not erros21, 'todo olhar com lado' + (f' — {erros21}' if erros21 else ''))
    # M22
    erros22 = []
    for k, v in pn:
        m = re.search(r'ombro (direito|esquerdo)', v)
        if m and re.search(r'canto[^.]*\b(direito|esquerdo)\b', v):
            lado = re.search(r'canto[^.]*\b(direito|esquerdo)\b', v).group(1)
            if lado != m.group(1):
                erros22.append(f'{k}: ombro {m.group(1)} no canto {lado}')
    r('M22', not erros22, 'câmera fecha com a imagem' + (f' — {erros22}' if erros22 else ''))
    # M23
    r('M23', not re.search(LEITOR, instr, re.I), 'ninguém olha para o leitor ou para a lente')
    return res


def main():
    falhou = False
    for a in sys.argv[1:]:
        print(f'\n== {a}')
        for cod, ok, msg in testa(Path(a)):
            print(f'  {"OK  " if ok else "FALHA"} {cod:4} {msg}')
            falhou |= not ok
    print('\nRESULTADO:', 'FALHOU' if falhou else 'PASSOU')
    sys.exit(1 if falhou else 0)


if __name__ == '__main__':
    main()
