"""Deploy completo do site: páginas do WEB SHARD no R2 -> build -> commit -> push -> gh-pages -> confere no ar.

Uso:
  python scripts/deploy.py "mensagem do commit"   # faz tudo
  python scripts/deploy.py --so-conferir          # só confere se o ar serve o SITE_VERSION

A versão já tem que estar subida em src/config/version.js e no SITE_MAP.md.
Toda etapa é cronometrada; etapa que passa de 1 minuto gera ALERTA na saída
(algo pode estar preso). Sai com código 0 só quando o site no ar serve a versão nova.
"""
import re
import subprocess
import sys
import time
import random
import urllib.request

RAIZ = __file__.rsplit('scripts', 1)[0]
SITE = 'https://illusionfight.com/'
LIMITE = 60          # segundos: passou disso, avisa
ESPERA_MAX = 600     # segundos esperando o GitHub Pages publicar
API = 'https://api.github.com/repos/lutasdeilusao-cpu/illusionfight-site'
CO_AUTOR ='Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'

alertas = []


def log(msg):
    print(msg, flush=True)


def etapa(nome, cmd):
    log(f'[deploy] {nome}...')
    ini = time.time()
    r = subprocess.run(cmd, cwd=RAIZ, shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace')
    dur = time.time() - ini
    log(f'[deploy] {nome}: {dur:.0f}s (código {r.returncode})')
    if dur > LIMITE:
        alertas.append(f'{nome} levou {dur:.0f}s (> {LIMITE}s) — verificar, pode ter falhado ou ficado preso')
    if r.returncode != 0:
        log((r.stdout + r.stderr)[-3000:])
        fim(False, f'{nome} falhou')
    return r


def versao():
    txt = open(RAIZ + 'src/config/version.js', encoding='utf-8').read()
    return re.search(r"SITE_VERSION\s*=\s*'([^']+)'", txt).group(1)


def baixar(url):
    req = urllib.request.Request(url, headers={'Cache-Control': 'no-cache', 'User-Agent': 'ldi-deploy'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode('utf-8', 'replace')


def no_ar(v):
    try:
        html = baixar(f'{SITE}?v={int(time.time())}{random.randint(0, 9999)}')
        js = re.search(r'assets/index-[^"\']+\.js', html)
        return bool(js) and v in baixar(SITE + js.group(0) + f'?v={random.randint(0, 99999)}')
    except Exception as e:
        log(f'[deploy] erro ao baixar o site: {e}')
        return False


def ultimo_pages():
    """Status da última publicação do GitHub Pages: (status, conclusão)."""
    try:
        import json
        d = json.loads(baixar(API + '/actions/runs?per_page=1'))['workflow_runs'][0]
        return d['status'], d['conclusion']
    except Exception:
        return None, None


def republicar():
    """Commit vazio no gh-pages: o GitHub Pages publica de novo."""
    wt = RAIZ + '.gh-pages-worktree'
    env = 'GRAPHIFY_SKIP_HOOK=1 '
    subprocess.run(f'{env}git commit -q --allow-empty -m "republica" && {env}git push -q origin HEAD:gh-pages',
                   cwd=wt, shell=True)


def conferir(v, tentativas=2):
    log(f'[deploy] conferindo se o ar serve {v}...')
    ini = time.time()
    avisou = False
    while time.time() - ini < ESPERA_MAX:
        if no_ar(v):
            log(f'[deploy] NO AR: {v} ({time.time() - ini:.0f}s depois do push)')
            return True
        status, conclusao = ultimo_pages()
        if status == 'completed' and conclusao not in (None, 'success'):
            alertas.append(f'GitHub Pages terminou com "{conclusao}"')
            log(f'[deploy] ALERTA: GitHub Pages falhou ({conclusao})')
            if tentativas > 1:
                log('[deploy] publicando de novo...')
                republicar()
                time.sleep(20)
                return conferir(v, tentativas - 1)
            return False
        if not avisou and time.time() - ini > LIMITE:
            avisou = True
            alertas.append(f'o ar ainda não servia {v} depois de {LIMITE}s — verificar o GitHub Pages')
            log(f'[deploy] ALERTA: passou de {LIMITE}s e o ar ainda não tem {v}')
        time.sleep(15)
    return False


def fim(ok, motivo=''):
    for a in alertas:
        log(f'[deploy] ALERTA: {a}')
    log(f'[deploy] {"PRONTO" if ok else "FALHOU"} {motivo}')
    sys.exit(0 if ok else 1)


def main():
    v = versao()
    if '--so-conferir' in sys.argv:
        fim(conferir(v), v)
    if len(sys.argv) < 2:
        fim(False, 'falta a mensagem do commit')
    msg = sys.argv[1]
    if v not in msg:
        msg += f' + v{v}'
    etapa('páginas do WEB SHARD no R2', 'python scripts/webshard-r2.py')
    etapa('build', 'npm run build')
    etapa('git add', 'git add -A')
    with open(RAIZ + '.git/DEPLOY_MSG', 'w', encoding='utf-8') as f:
        f.write(f'{msg}\n\n{CO_AUTOR}\n')
    etapa('commit', 'git commit -q -F .git/DEPLOY_MSG')
    etapa('push', 'git push -q')
    etapa('gh-pages', 'node scripts/deploy-gh-pages.cjs')
    fim(conferir(v), v)


if __name__ == '__main__':
    main()
