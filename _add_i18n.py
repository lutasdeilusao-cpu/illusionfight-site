"""Add site page i18n keys to all three JSON files."""
import json, os

ROOT = r"C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI\src\i18n"

def load(fn):
    with open(os.path.join(ROOT, fn), "r", encoding="utf-8") as f:
        return json.load(f)

def save(fn, data):
    with open(os.path.join(ROOT, fn), "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

pt = load("pt.json")
en = load("en.json")
es = load("es.json")

site_pt = {
    "login": {
        "titulo": "ENTRAR",
        "subtitulo": "Acesse sua conta no SDR",
        "email": "Email",
        "senha": "Senha",
        "entrar": "ENTRAR",
        "entrando": "ENTRANDO...",
        "sem_conta": "Não tem conta?",
        "cadastrar_link": "Cadastre-se",
        "erro": "Erro ao fazer login"
    },
    "cadastro": {
        "titulo": "CADASTRO",
        "subtitulo": "Crie sua conta no SDR",
        "nome": "Nome",
        "email": "Email",
        "telefone": "Telefone",
        "senha": "Senha",
        "confirmar_senha": "Confirmar Senha",
        "cadastrar": "CADASTRAR",
        "cadastrando": "CADASTRANDO...",
        "ja_tem_conta": "Já tem conta?",
        "entrar_link": "Entrar",
        "email_invalido": "Email inválido",
        "telefone_invalido": "Telefone deve ter no mínimo 10 dígitos",
        "senha_curta": "Senha deve ter no mínimo 6 caracteres",
        "senhas_diferem": "Senhas não conferem",
        "sucesso": "Verifique seu email para confirmar o cadastro.",
        "erro_perfil": "Conta criada mas erro ao salvar perfil. Tente novamente."
    },
    "games": {
        "titulo": "GAMES",
        "subtitulo": "explore além da história principal",
        "secao_jogos": "JOGOS",
        "secao_conteudo": "CONTEÚDO",
        "inserir_ficha": "INSERIR FICHA",
        "em_breve": "EM BREVE",
        "credits": "LUTAS DE ILUSÃO — 1 PLAYER",
        "badges": {"free": "FREE", "lancado": "LANÇADO", "novo": "NOVO", "beta": "BETA"},
        "nomes": {
            "ldi": "LDI LENDAS", "jack": "Jack Dream Beer", "pesadelo": "PRESADELO PARTICULAR",
            "arena": "LDI ARENA", "tama": "TAMA LDI", "trumps": "LDI TRUMPS",
            "tatics": "LDI TATICS", "minigames": "MINI GAMES", "duelo": "DUELO LDI",
            "quiz": "Quiz SDR", "leaderboard": "Leaderboard"
        },
        "taglines": {
            "ldi": "RPG narrativo. crie seu avatar. enfrente a arena.",
            "jack": "idle noir. sonhos não têm lógica. esse tem cervejas.",
            "pesadelo": "20 casos. uma conspiração. um amigo em perigo.",
            "arena": "combate em tempo real contra a CPU.",
            "tama": "seu bicho te espera. alimente, cuide, não deixe morrer.",
            "trumps": "cartas colecionáveis. monte seu deck. vença a IA.",
            "tatics": "6 classes. grid tático. 3v3. batalha por turnos.",
            "minigames": "puzzles standalone. sem login. só habilidade.",
            "duelo": "card game 1v1. invocar, atacar, vencer.",
            "quiz": "teste seu conhecimento do universo LDI.",
            "leaderboard": "ranking global de jogadores."
        }
    },
    "leaderboard": {
        "titulo": "ARENA — RANKING GLOBAL",
        "subtitulo": "Os melhores jogadores de Top Trumps do universo LDI",
        "abas": {"toptrumps": "Top Trumps", "quiz": "Quiz", "geral": "Geral", "cuidadores": "Cuidadores"},
        "badges_label": "badges", "vitorias": "vitórias", "derrotas": "derrotas",
        "cartas": "cartas", "pontos": "pts",
        "sem_rank": "Você ainda não aparece no ranking.",
        "sem_cuidadores": "Nenhum cuidador registrado ainda. Adote um Tamagoshi!",
        "sem_cuidador_voce": "Você ainda não aparece no ranking. Adote e cuide de um Tamagoshi!",
        "carregando": "CARREGANDO..."
    },
    "perfil": {
        "fichas": "FICHAS",
        "abas": ["Conquistas", "Arena", "Coleção", "Conta", "Recompensas", "Tamagoshi"],
        "sair": "SAIR",
        "admin_label": "ADMIN",
        "meu_perfil": "Meu Perfil"
    }
}

site_en = {
    "login": {
        "titulo": "LOG IN",
        "subtitulo": "Access your SDR account",
        "email": "Email",
        "senha": "Password",
        "entrar": "LOG IN",
        "entrando": "LOGGING IN...",
        "sem_conta": "Don't have an account?",
        "cadastrar_link": "Sign up",
        "erro": "Login error"
    },
    "cadastro": {
        "titulo": "SIGN UP",
        "subtitulo": "Create your SDR account",
        "nome": "Name",
        "email": "Email",
        "telefone": "Phone",
        "senha": "Password",
        "confirmar_senha": "Confirm Password",
        "cadastrar": "SIGN UP",
        "cadastrando": "SIGNING UP...",
        "ja_tem_conta": "Already have an account?",
        "entrar_link": "Log in",
        "email_invalido": "Invalid email",
        "telefone_invalido": "Phone must have at least 10 digits",
        "senha_curta": "Password must have at least 6 characters",
        "senhas_diferem": "Passwords do not match",
        "sucesso": "Check your email to confirm your registration.",
        "erro_perfil": "Account created but error saving profile. Please try again."
    },
    "games": {
        "titulo": "GAMES",
        "subtitulo": "explore beyond the main story",
        "secao_jogos": "GAMES",
        "secao_conteudo": "CONTENT",
        "inserir_ficha": "INSERT TOKEN",
        "em_breve": "COMING SOON",
        "credits": "ILLUSION FIGHT — 1 PLAYER",
        "badges": {"free": "FREE", "lancado": "RELEASED", "novo": "NEW", "beta": "BETA"},
        "nomes": {
            "ldi": "LDI LEGENDS", "jack": "Jack Dream Beer", "pesadelo": "PARTICULAR NIGHTMARE",
            "arena": "LDI ARENA", "tama": "TAMA LDI", "trumps": "LDI TRUMPS",
            "tatics": "LDI TATICS", "minigames": "MINI GAMES", "duelo": "LDI DUELO",
            "quiz": "SDR Quiz", "leaderboard": "Leaderboard"
        },
        "taglines": {
            "ldi": "Narrative RPG. create your avatar. face the arena.",
            "jack": "idle noir. dreams have no logic. this one has beer.",
            "pesadelo": "20 cases. a conspiracy. a friend in danger.",
            "arena": "real-time combat against the CPU.",
            "tama": "your pet awaits. feed, care, don't let it die.",
            "trumps": "collectible cards. build your deck. beat the AI.",
            "tatics": "6 classes. tactical grid. 3v3. turn-based battle.",
            "minigames": "standalone puzzles. no login. just skill.",
            "duelo": "card game 1v1. summon, attack, win.",
            "quiz": "test your knowledge of the LDI universe.",
            "leaderboard": "global player ranking."
        }
    },
    "leaderboard": {
        "titulo": "ARENA — GLOBAL RANKING",
        "subtitulo": "The best Top Trumps players in the LDI universe",
        "abas": {"toptrumps": "Top Trumps", "quiz": "Quiz", "geral": "General", "cuidadores": "Caretakers"},
        "badges_label": "badges", "vitorias": "wins", "derrotas": "losses",
        "cartas": "cards", "pontos": "pts",
        "sem_rank": "You are not ranked yet.",
        "sem_cuidadores": "No caretakers registered yet. Adopt a Tamagoshi!",
        "sem_cuidador_voce": "You are not ranked yet. Adopt and care for a Tamagoshi!",
        "carregando": "LOADING..."
    },
    "perfil": {
        "fichas": "TOKENS",
        "abas": ["Achievements", "Arena", "Collection", "Account", "Rewards", "Tamagoshi"],
        "sair": "LOGOUT",
        "admin_label": "ADMIN",
        "meu_perfil": "My Profile"
    }
}

site_es = {
    "login": {
        "titulo": "INICIAR SESIÓN",
        "subtitulo": "Accede a tu cuenta en el SDR",
        "email": "Correo",
        "senha": "Contraseña",
        "entrar": "ENTRAR",
        "entrando": "ENTRANDO...",
        "sem_conta": "¿No tienes cuenta?",
        "cadastrar_link": "Regístrate",
        "erro": "Error al iniciar sesión"
    },
    "cadastro": {
        "titulo": "REGISTRO",
        "subtitulo": "Crea tu cuenta en el SDR",
        "nome": "Nombre",
        "email": "Correo",
        "telefone": "Teléfono",
        "senha": "Contraseña",
        "confirmar_senha": "Confirmar Contraseña",
        "cadastrar": "REGISTRARSE",
        "cadastrando": "REGISTRANDO...",
        "ja_tem_conta": "¿Ya tienes cuenta?",
        "entrar_link": "Iniciar sesión",
        "email_invalido": "Correo inválido",
        "telefone_invalido": "El teléfono debe tener al menos 10 dígitos",
        "senha_curta": "La contraseña debe tener al menos 6 caracteres",
        "senhas_diferem": "Las contraseñas no coinciden",
        "sucesso": "Revisa tu correo para confirmar el registro.",
        "erro_perfil": "Cuenta creada pero error al guardar perfil. Intenta de nuevo."
    },
    "games": {
        "titulo": "JUEGOS",
        "subtitulo": "explora más allá de la historia principal",
        "secao_jogos": "JUEGOS",
        "secao_conteudo": "CONTENIDO",
        "inserir_ficha": "INSERTAR FICHA",
        "em_breve": "PRÓXIMAMENTE",
        "credits": "LUTAS DE ILUSIÓN — 1 JUGADOR",
        "badges": {"free": "GRATIS", "lancado": "LANZADO", "novo": "NUEVO", "beta": "BETA"},
        "nomes": {
            "ldi": "LDI LEYENDAS", "jack": "Jack Dream Beer", "pesadelo": "PESADILLA PARTICULAR",
            "arena": "LDI ARENA", "tama": "TAMA LDI", "trumps": "LDI TRUMPS",
            "tatics": "LDI TATICS", "minigames": "MINI JUEGOS", "duelo": "DUELO LDI",
            "quiz": "Quiz SDR", "leaderboard": "Clasificación"
        },
        "taglines": {
            "ldi": "RPG narrativo. crea tu avatar. enfréntate a la arena.",
            "jack": "idle noir. los sueños no tienen lógica. este tiene cerveza.",
            "pesadelo": "20 casos. una conspiración. un amigo en peligro.",
            "arena": "combate en tiempo real contra la CPU.",
            "tama": "tu mascota te espera. aliméntala, cuídala, no la dejes morir.",
            "trumps": "cartas coleccionables. arma tu mazo. vence a la IA.",
            "tatics": "6 clases. grid táctico. 3v3. batalla por turnos.",
            "minigames": "puzzles independientes. sin login. solo habilidad.",
            "duelo": "juego de cartas 1v1. invocar, atacar, vencer.",
            "quiz": "prueba tu conocimiento del universo LDI.",
            "leaderboard": "ranking global de jugadores."
        }
    },
    "leaderboard": {
        "titulo": "ARENA — RANKING GLOBAL",
        "subtitulo": "Los mejores jugadores de Top Trumps del universo LDI",
        "abas": {"toptrumps": "Top Trumps", "quiz": "Quiz", "geral": "General", "cuidadores": "Cuidadores"},
        "badges_label": "insignias", "vitorias": "victorias", "derrotas": "derrotas",
        "cartas": "cartas", "pontos": "pts",
        "sem_rank": "Aún no apareces en el ranking.",
        "sem_cuidadores": "Ningún cuidador registrado aún. ¡Adopta un Tamagoshi!",
        "sem_cuidador_voce": "Aún no apareces en el ranking. ¡Adopta y cuida un Tamagoshi!",
        "carregando": "CARGANDO..."
    },
    "perfil": {
        "fichas": "FICHAS",
        "abas": ["Logros", "Arena", "Colección", "Cuenta", "Recompensas", "Tamagoshi"],
        "sair": "SALIR",
        "admin_label": "ADMIN",
        "meu_perfil": "Mi Perfil"
    }
}

pt["site"] = site_pt
en["site"] = site_en
es["site"] = site_es

save("pt.json", pt)
save("en.json", en)
save("es.json", es)

# Verify
for fn in ["pt.json", "en.json", "es.json"]:
    d = load(fn)
    assert "site" in d, f"{fn} missing site key"
    assert "login" in d["site"], f"{fn} missing site.login"
    print(f"{fn}: OK — site.login.titulo = {d['site']['login']['titulo']}")
print("Done!")
