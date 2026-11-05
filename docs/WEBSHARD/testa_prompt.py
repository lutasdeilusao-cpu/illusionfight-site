"""Testa um prompt de página do WEB SHARD contra MANDAMENTOS_WEBSHARD.md e TEMPLATE_PROMPT_PAGINA.md.

Uso: python testa_prompt.py <p_NNN.txt> [mais arquivos...]
Os ângulos de câmera de todas as páginas da pasta ficam guardados em _angulos.json, na própria pasta.
Todo "Câmera:" começa por um dos enquadramentos aprovados (REPERTORIO, mandamento 8).
Nenhum enquadramento se repete dentro de uma janela de painéis seguidos do tamanho do repertório
(13 painéis, umas 6 a 7 páginas). Quem repete é a página de número maior.
Estilhaços: de 1 a 5, quantidade igual em 3 páginas seguidas reprova, lugar (alto/meio/baixo + esquerda/centro/direita)
diferente entre si e da página anterior, com função e sem "Conta:". Ficam guardados em _estilhacos.json.
Dois enquadramentos que já apareceram juntos numa página anterior do capítulo não aparecem juntos de novo.
A direção do corte é comparada com a página anterior e a seguinte.
Sai com código 1 se algum prompt falhar.
"""
import json
import re
import sys
from pathlib import Path

# Enquadramentos aprovados (mandamento 8). Entrou um novo nos mandamentos, entra aqui.
REPERTORIO = ['detalhe macro', 'close extremo', 'close grande-angular', 'contra-plongée extremo',
              'plongée alto', 'zenital', 'holandês', 'sobre o ombro', 'perfis frente a frente',
              'quadro dentro do quadro', 'grande-angular baixa', 'teleobjetiva', 'subjetiva',
              'plano geral', 'plano inteiro', 'plano americano', 'contraluz', 'reflexo', 'plano em profundidade', 'rasante']
JANELA = 13  # painéis seguidos sem repetir enquadramento

# Personagens e cores vêm do próprio prompt: cada linha de PERSONAGENS é "Nome: ... Cor: <cor>."
CORES = {}

SECOES = ['PLANO DE CÂMERA', 'REFERÊNCIAS', 'ESTILO', 'PERSONAGENS', 'LUGAR E GEOGRAFIA', 'COMPOSIÇÃO',
          'PAINEL 1', 'ESTILHAÇOS', 'TEXTOS']
ABERTURA = 'Criar UMA página de quadrinho vertical e alta, no tamanho 960×1637.'
NEGACOES = r'\b(sem|não|nao|nunca|nenhum|nenhuma|nada|jamais)\b'
BORDA_BRANCA = r'margem|margens|área livre|area livre|longe das bordas|moldura branca|borda branca'
ROSTO = r'\b(rosto|olho|olhos|boca|sorri\w*|express\w*|sobrancelha\w*|nariz|barba|marca no olho)\b'
FUNCOES = r'tempo|reação|reacao|causa|consequência|consequencia|olhar|detalhe'
ACAO = r'avan[çc]\w*|salt\w*|ca[ií]\w*|queda|golpe\w*|soco|chut\w*|chega\w*|pous\w*|corre\w*|investe\w*|lan[çc]\w*'
LEITOR = r'olh\w* (para|pro|ao) (o )?(leitor|lente|câmera|camera)'


def secoes(txt):
    """Divide o prompt em blocos pelo título em caixa alta no começo da linha."""
    blocos, atual = {}, None
    for linha in txt.splitlines():
        m = re.match(r'^(PLANO DE CÂMERA|REFERÊNCIAS|ESTILO|PERSONAGENS|LUGAR E GEOGRAFIA|COMPOSIÇÃO|PAINEL \d+[^\n]*|ESTILHAÇOS|TEXTOS)\s*$', linha)
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
    m = re.search(r'cortes? diagona(?:l|is) que (sobe|desce)m? da (esquerda|direita)', txt)
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


def tipo(cam):
    """O enquadramento aprovado com que o "Câmera:" começa, ou None se estiver fora do repertório."""
    for t in sorted(REPERTORIO, key=len, reverse=True):
        if cam and cam.startswith(t):
            return t
    return None


def lugar(linha):
    """Lugar do estilhaço na página: 'alto-esquerda', 'meio-centro', 'baixo-direita'..."""
    cab = linha.split(':')[0].lower()
    v = 'alto' if re.search(r'\b(alto|topo)\b', cab) else 'baixo' if re.search(r'\b(embaixo|baixo)\b', cab) else 'meio' if 'meio' in cab else None
    h = 'esquerda' if 'esquerda' in cab else 'direita' if 'direita' in cab else 'centro' if 'centro' in cab else None
    return f'{v}-{h}' if v and h else None


def estilhacos(txt):
    return re.findall(r'^- Estilhaço \d+.*$', secoes(txt).get('ESTILHAÇOS', ''), re.M)


def registro_est(pasta):
    """Quantidade e lugares dos estilhaços de cada página da pasta, gravados em _estilhacos.json."""
    reg = {}
    for f in sorted(pasta.glob('p_*.txt')):
        es = estilhacos(f.read_text(encoding='utf-8'))
        if es and all(lugar(e) for e in es):
            reg[f.stem[2:]] = [lugar(e) for e in es]
    (pasta / '_estilhacos.json').write_text(json.dumps(reg, ensure_ascii=False, indent=1), encoding='utf-8')
    return reg


def registro(pasta):
    """Lê os ângulos de todas as páginas da pasta que já seguem o template e grava em _angulos.json."""
    reg = {}
    for f in sorted(pasta.glob('p_*.txt')):
        pn = paineis(secoes(f.read_text(encoding='utf-8')))
        tipos = [tipo(camera(v)) for _, v in pn]
        if tipos and all(tipos):
            reg[f.stem[2:]] = tipos
    (pasta / '_angulos.json').write_text(json.dumps(reg, ensure_ascii=False, indent=1), encoding='utf-8')
    return reg


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
    est = estilhacos(corpo)
    erros4 = []
    if not 1 <= len(est) <= 5:
        erros4.append(f'{len(est)} estilhaços; o limite é de 1 a 5')
    lugares = [lugar(e) for e in est]
    erros4 += [f'estilhaço {i + 1} sem lugar (alto/meio/baixo + esquerda/centro/direita)' for i, l in enumerate(lugares) if not l]
    erros4 += [f'dois estilhaços no mesmo lugar: {l}' for l in {l for l in lugares if l and lugares.count(l) > 1}]
    erros4 += [f'estilhaço {i + 1} sem função' for i, e in enumerate(est) if not re.search(r'Função:\s*(' + FUNCOES + ')', e, re.I)]
    erros4 += [f'estilhaço {i + 1} tem "Conta:" (a IA desenha a frase como caixa de narração)' for i, e in enumerate(est) if 'Conta:' in e]
    reg_e = registro_est(arq.parent)
    ant_pags = [k for k in sorted(reg_e) if k < arq.stem[2:]]
    if ant_pags:
        repetidos = sorted(set(lugares) & set(reg_e[ant_pags[-1]]) - {None})
        if repetidos:
            erros4.append(f'lugar repetido da página {ant_pags[-1]}: {repetidos}')
    if len(ant_pags) >= 2 and len(reg_e[ant_pags[-1]]) == len(reg_e[ant_pags[-2]]) == len(est):
        erros4.append(f'{len(est)} estilhaços pela 3ª página seguida ({ant_pags[-2]}, {ant_pags[-1]})')
    r('M4', not erros4, f'{len(est)} estilhaço(s) em {lugares}' + (f' — {erros4}' if erros4 else ''))
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
    tipos = [tipo(c) for c in cams]
    erros7 = [f'{pn[i][0]} sem "Câmera:"' for i, x in enumerate(cams) if not x]
    erros7 += [f'painel {i + 1} fora do repertório: "{c}"' for i, c in enumerate(cams) if c and not tipos[i]]
    eu = arq.stem[2:]
    reg = registro(arq.parent)
    meus = {frozenset((a, b)) for i, a in enumerate(tipos) for b in tipos[i + 1:] if a and b and a != b}
    for pag, ts in sorted(reg.items()):
        if pag < eu:
            for par in meus & {frozenset((a, b)) for i, a in enumerate(ts) for b in ts[i + 1:]}:
                erros7.append(f'par {" + ".join(sorted(par))} já usado junto na página {pag}')
    antes = []  # (página, painel, enquadramento) de todas as páginas anteriores, em ordem
    for pag, ts in sorted(reg.items()):
        if pag < eu:
            antes += [(pag, i + 1, t) for i, t in enumerate(ts)]
    for i, t in enumerate(tipos):
        if not t:
            continue
        janela = antes[-(JANELA - 1 - i):] if JANELA - 1 - i > 0 else []
        janela += [(eu, j + 1, tipos[j]) for j in range(i)]
        for pag, pnl, tt in janela:
            if tt == t:
                erros7.append(f'painel {i + 1} repete "{t}" da página {pag} painel {pnl}')
    r('M7', not erros7, f'enquadramentos {tipos} (janela de {JANELA} painéis)' + (f' — {erros7}' if erros7 else ''))
    # M8
    plano = b.get('PLANO DE CÂMERA', '')
    erros8 = []
    if not plano:
        erros8.append('falta o bloco PLANO DE CÂMERA no topo')
    else:
        if not re.search(r'Corte:.*(sobe|desce)', plano):
            erros8.append('plano sem direção do corte')
        if not re.search(r'Estilhaços:', plano):
            erros8.append('plano sem estilhaços')
        for i, (k, v) in enumerate(pn, 1):
            m = re.search(rf'^Painel {i}:\s*(.+?)\.?\s*$', plano, re.M)
            if not m:
                erros8.append(f'painel {i} fora do plano')
            elif camera(v) and tipo(m.group(1).split(',')[0].strip().lower()) != tipo(camera(v)):
                erros8.append(f'painel {i}: plano "{m.group(1)}" e câmera "{camera(v)}" diferentes')
        if corte(corpo) and not re.search(rf'Corte:.*{corte(corpo)[0]}', plano):
            erros8.append('direção do corte no plano diferente da composição')
    r('M8', not erros8, 'plano de câmera da página no topo, igual aos painéis' + (f' — {erros8}' if erros8 else ''))
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
    # M14: balão do lado de quem fala (quem aparece no painel recebe o balão do lado dele)
    geo14 = b.get('LUGAR E GEOGRAFIA', '')
    blocos14 = {k.split()[1]: v for k, v in paineis(b)}

    def lado(texto, nome):
        # lado em que o personagem está: o nome seguido de até 3 palavras e "à esquerda/direita da imagem", sem ser alvo de olhar
        m = re.search(rf'(?<!para )(?<!para o )(?<!para a )\b{nome}\b(?: (?!olha\b|para\b|e\b)[^\s.,;]+){{0,3}} (à|a) (esquerda|direita) da imagem', texto, re.I)
        return {'esquerda': 'esq', 'direita': 'dir'}[m.group(2).lower()] if m else None
    erros14 = []
    for f in falas:
        m = re.match(r'^- Painel (\d+), ([^,]+), ([^,]+),', f)
        if not m or 'fora do quadro' in f or 'onomatopeia' in f:
            continue
        pn14, pos, quem = m.group(1), m.group(2).lower(), m.group(3).strip()
        if quem.lower() not in CORES:
            continue
        bloco = blocos14.get(pn14, '')
        if re.search(rf'\b{quem}\b[^.\n]*de costas', bloco, re.I) and 'boca' in f:
            erros14.append(f'P{pn14} {quem} de costas com cauda na boca')
            continue
        lq = lado(bloco, quem) or lado(geo14, quem)
        lb = 'esq' if 'esquerda' in pos else 'dir' if 'direita' in pos else None
        if lq and lb and lq != lb:
            erros14.append(f'P{pn14} balão de {quem} à {pos} com {quem} do outro lado')
    r('M14', not erros14, 'balão do lado de quem fala' + (f' — {erros14}' if erros14 else ''))
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
    # cada painel é julgado sozinho: de costas ou no fundo = sem rosto, sem olhar e sem "de frente para a câmera"
    for bloco in re.split(r'\n(?=PAINEL \d)', instr.split('\nESTILHAÇOS')[0]):
        if not bloco.startswith('PAINEL'):
            continue
        for p in CORES:
            if re.search(rf'\b{p}\b[^.\n]*de costas', bloco, re.I):
                for frase in re.split(r'(?<=[.:])\s+|\n', bloco):
                    if re.search(rf'\b{p}\b', frase, re.I) and re.search(ROSTO, frase, re.I) and not re.search(r'\bolha\b', frase):
                        erros19.append(f'{p}: "{frase.strip()[:60]}"')
            longe = re.search(rf'\b{p}\b(?: (?!e\b)[^\s.,;]+){{0,2}}? (de costas|para o fundo|no fundo|ao fundo|pequen[oa]|mais distante|distante|longe)\b', bloco, re.I)
            if longe and re.search(rf'\b{p} olha\b', bloco, re.I):
                erros19.append(f'{p} de costas/no fundo com "olha para"')
            if re.search(rf'\b{p}\b[^.\n]*(para trás|para o fundo|se afasta)[^.\n]*de frente para a câmera', bloco, re.I):
                erros19.append(f'{p}: afastando-se e "de frente para a câmera" na mesma pose')
    r('M19', not erros19, 'quem está de costas sem rosto' + (f' — {erros19}' if erros19 else ''))
    # "punho" a IA lê como punho de roupa e põe luva; escrever "mão fechada"
    pun = re.findall(r'[^.\n]*\bpunhos?\b[^.\n]*', instr, re.I)
    r('M19', not pun, 'mão fechada, nunca "punho" (vira luva)' + (f' — {[p.strip()[:50] for p in pun]}' if pun else ''))
    # M20
    geo = b.get('LUGAR E GEOGRAFIA', '')
    r('M20', 'esquerda da imagem' in geo and 'direita da imagem' in geo, 'geografia fixa: esquerda e direita da imagem')
    # M20: lugar só pelo nome da ficha, dito uma vez no LUGAR; nada de cenário depois
    lug = re.findall(r'^Lugar:.*$', geo, re.M)
    lug_ok = len(lug) == 1 and re.fullmatch(r'Lugar: [^.]+ da ficha \w+\.', lug[0].strip()) is not None
    r('M20', lug_ok, 'uma linha "Lugar: <lugar> da ficha <Ficha>." e mais nada' + ('' if lug_ok else f' — achou {lug or "nenhuma"}'))
    cenario = r'\b(chão|piso|céu|horizonte|mureta|cenário|arena)\b|^Fundo:'
    depois = '\n'.join(v for k, v in b.items() if k.startswith('PAINEL') or k in ('ESTILHAÇOS', 'COMPOSIÇÃO'))
    # a linha "Câmera:" pode usar o piso como régua de altura ("rente ao piso", "de cima, apontada para o piso")
    depois = re.sub(r'^Câmera:.*$', '', depois, flags=re.M)
    achou = sorted({m.group(0) for m in re.finditer(cenario, sem_falas(depois), re.I | re.M)})
    r('M20', not achou, 'cenário citado só no LUGAR, nunca em painel ou estilhaço' + (f' — achou: {achou}' if achou else ''))
    fora = [i + 1 for i, e in enumerate(est) if n > 1 and 'dentro do painel' not in e]
    r('M20', not fora, 'estilhaço inteiro dentro de um painel, nunca em cima do corte' + (f' — estilhaço(s) {fora} sem "inteiro dentro do painel N"' if fora else ''))
    pecas = r'\b(bainha|guarda|cabo|lâmina|haste|ponteira|empunhadura|punho)\b'
    erros_arma = []
    for k, v in list(pn) + [(f'estilhaço {i + 1}', e) for i, e in enumerate(est)]:
        ps = {m.group(1).lower() for m in re.finditer(pecas, sem_falas(v), re.I)}
        if len(ps) >= 4:
            erros_arma.append(f'{k}: {sorted(ps)}')
    r('M20', not erros_arma, 'arma pela ficha e estado simples, sem peça por peça' + (f' — {erros_arma}' if erros_arma else ''))
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
