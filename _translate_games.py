"""
Translate ALL games to EN and ES.
Usage: python _translate_games.py
"""
import json, os, re, subprocess

ROOT = r"C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI"
I18N = os.path.join(ROOT, "src", "i18n")

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

# Load current i18n
pt = load_json(os.path.join(I18N, "pt.json"))
en = load_json(os.path.join(I18N, "en.json"))
es = load_json(os.path.join(I18N, "es.json"))

# Initialize games section
GAMES_PT = {}
GAMES_EN = {}
GAMES_ES = {}

# ============================================================
# 1. DUELO LDI
# ============================================================
GAMES_PT["duelo"] = {
    "titulo": "LDI DUELO",
    "subtitulo": "invocar · atacar · vencer",
    "descricao": "60 cartas. 30 monstros. 15 magias. 15 armadilhas.",
    "descricao2": "Monte sua estratégia. Derrote a IA.",
    "descricao3": "Mesmo deck para os dois lados — vitória é skill.",
    "iniciar": "INICIAR DUELO",
    "lp": "LP",
    "cartas": "CARTAS",
    "vs_ia": "1v1 VS IA",
    "sua_vez": "SUA VEZ",
    "vez_ia": "VEZ DA IA",
    "vitoria": "VITÓRIA",
    "derrota": "DERROTA",
    "atacar": "ATACAR",
    "passar": "PASSAR",
    "conceder": "CONCEDER",
    "invocar": "INVOCAR",
    "ativar": "ATIVAR",
    "selecionar_alvo": "SELECIONE UM ALVO",
    "sem_alvos": "SEM ALVOS DISPONÍVEIS",
    "mao": "MÃO",
    "campo": "CAMPO",
    "cemiterio": "CEMITÉRIO",
    "deck": "DECK",
    "btn_voltar": "VOLTAR",
    "btn_jogar_novamente": "JOGAR NOVAMENTE",
    "btn_voltar_menu": "VOLTAR AO MENU",
}

GAMES_EN["duelo"] = {
    "titulo": "LDI DUEL",
    "subtitulo": "summon · attack · win",
    "descricao": "60 cards. 30 monsters. 15 spells. 15 traps.",
    "descricao2": "Build your strategy. Defeat the AI.",
    "descricao3": "Same deck for both sides — victory is skill.",
    "iniciar": "START DUEL",
    "lp": "LP",
    "cartas": "CARDS",
    "vs_ia": "1v1 VS AI",
    "sua_vez": "YOUR TURN",
    "vez_ia": "AI'S TURN",
    "vitoria": "VICTORY",
    "derrota": "DEFEAT",
    "atacar": "ATTACK",
    "passar": "PASS",
    "conceder": "CONCEDE",
    "invocar": "SUMMON",
    "ativar": "ACTIVATE",
    "selecionar_alvo": "SELECT A TARGET",
    "sem_alvos": "NO TARGETS AVAILABLE",
    "mao": "HAND",
    "campo": "FIELD",
    "cemiterio": "GRAVEYARD",
    "deck": "DECK",
    "btn_voltar": "BACK",
    "btn_jogar_novamente": "PLAY AGAIN",
    "btn_voltar_menu": "BACK TO MENU",
}

GAMES_ES["duelo"] = {
    "titulo": "DUELO LDI",
    "subtitulo": "invocar · atacar · vencer",
    "descricao": "60 cartas. 30 monstruos. 15 magias. 15 trampas.",
    "descricao2": "Arma tu estrategia. Derrota a la IA.",
    "descricao3": "Mismo mazo para ambos lados — la victoria es habilidad.",
    "iniciar": "INICIAR DUELO",
    "lp": "PV",
    "cartas": "CARTAS",
    "vs_ia": "1v1 VS IA",
    "sua_vez": "TU TURNO",
    "vez_ia": "TURNO DE LA IA",
    "vitoria": "VICTORIA",
    "derrota": "DERROTA",
    "atacar": "ATACAR",
    "passar": "PASAR",
    "conceder": "RENDIRSE",
    "invocar": "INVOCAR",
    "ativar": "ACTIVAR",
    "selecionar_alvo": "SELECCIONA UN OBJETIVO",
    "sem_alvos": "SIN OBJETIVOS DISPONIBLES",
    "mao": "MANO",
    "campo": "CAMPO",
    "cemiterio": "CEMENTERIO",
    "deck": "MAZO",
    "btn_voltar": "VOLVER",
    "btn_jogar_novamente": "JUGAR DE NUEVO",
    "btn_voltar_menu": "VOLVER AL MENÚ",
}

# ============================================================
# 2. MINI GAMES
# ============================================================
GAMES_PT["minigames"] = {
    "titulo": "MINI GAMES",
    "subtitulo": "puzzles standalone. sem login. sem save. só habilidade.",
    "jogar": "JOGAR",
    "voltar": "← extras",
    "puzzles": {
        "infiltracao": {"nome": "Infiltração", "desc": "evite as câmeras. chegue ao objetivo.", "detalhe": "câmeras com cone de visão rotativo. uma rota existe. encontre.", "dificuldade": "★★☆"},
        "decoder": {"nome": "Decoder", "desc": "mensagem cifrada. descubra o código.", "detalhe": "sliders de frequência. alinhe os sinais. decifre a mensagem.", "dificuldade": "★☆☆"},
        "sliding": {"nome": "Sliding Tiles", "desc": "reorganize as peças na ordem certa.", "detalhe": "deslize os blocos. uma peça vazia. complete a imagem.", "dificuldade": "★★★"},
        "labirinto": {"nome": "Labirinto", "desc": "encontre a saída. sem mapa.", "detalhe": "paredes invisíveis. só seu tato. só seu instinto.", "dificuldade": "★★☆"},
        "forca": {"nome": "Forca", "desc": "adivinhe a palavra. erro tem preço.", "detalhe": "letra por letra. cada erro te aproxima do fim.", "dificuldade": "★☆☆"},
        "anagrama": {"nome": "Anagrama", "desc": "embaralhamento. reorganize. descubra.", "detalhe": "letras fora de ordem. seu cérebro é o decoder.", "dificuldade": "★★☆"},
    },
    "timer": "⏱ {s}s",
    "tentativas": "tentativas: {a}/{b}",
    "erros": "erros: {a}/{b}",
    "passou": "✓ passou.",
    "falhou": "✗ falhou.",
    "confirmar": "CONFIRMAR",
    "desistir": "DESISTIR",
    "voltar": "VOLTAR",
}

GAMES_EN["minigames"] = {
    "titulo": "MINI GAMES",
    "subtitulo": "standalone puzzles. no login. no save. just skill.",
    "jogar": "PLAY",
    "voltar": "← extras",
    "puzzles": {
        "infiltracao": {"nome": "Infiltration", "desc": "avoid the cameras. reach the goal.", "detalhe": "rotating camera cones. a route exists. find it.", "dificuldade": "★★☆"},
        "decoder": {"nome": "Decoder", "desc": "ciphered message. crack the code.", "detalhe": "frequency sliders. align the signals. decipher the message.", "dificuldade": "★☆☆"},
        "sliding": {"nome": "Sliding Tiles", "desc": "rearrange the tiles in the right order.", "detalhe": "slide the blocks. one empty slot. complete the picture.", "dificuldade": "★★★"},
        "labirinto": {"nome": "Maze", "desc": "find the exit. no map.", "detalhe": "invisible walls. only your touch. only your instinct.", "dificuldade": "★★☆"},
        "forca": {"nome": "Hangman", "desc": "guess the word. mistakes cost.", "detalhe": "letter by letter. each error brings you closer to the end.", "dificuldade": "★☆☆"},
        "anagrama": {"nome": "Anagram", "desc": "scrambled. rearrange. discover.", "detalhe": "letters out of order. your brain is the decoder.", "dificuldade": "★★☆"},
    },
    "timer": "⏱ {s}s",
    "tentativas": "attempts: {a}/{b}",
    "erros": "mistakes: {a}/{b}",
    "passou": "✓ passed.",
    "falhou": "✗ failed.",
    "confirmar": "CONFIRM",
    "desistir": "GIVE UP",
    "voltar": "BACK",
}

GAMES_ES["minigames"] = {
    "titulo": "MINI JUEGOS",
    "subtitulo": "puzzles independientes. sin login. sin guardado. solo habilidad.",
    "jogar": "JUGAR",
    "voltar": "← extras",
    "puzzles": {
        "infiltracao": {"nome": "Infiltración", "desc": "evita las cámaras. llega al objetivo.", "detalhe": "cámaras con cono de visión rotatorio. existe una ruta. encuéntrala.", "dificuldade": "★★☆"},
        "decoder": {"nome": "Decoder", "desc": "mensaje cifrado. descubre el código.", "detalhe": "deslizadores de frecuencia. alinea las señales. descifra el mensaje.", "dificuldade": "★☆☆"},
        "sliding": {"nome": "Sliding Tiles", "desc": "reorganiza las piezas en el orden correcto.", "detalhe": "desliza los bloques. una pieza vacía. completa la imagen.", "dificuldade": "★★★"},
        "labirinto": {"nome": "Laberinto", "desc": "encuentra la salida. sin mapa.", "detalhe": "paredes invisibles. solo tu tacto. solo tu instinto.", "dificuldade": "★★☆"},
        "forca": {"nome": "Ahorcado", "desc": "adivina la palabra. error tiene precio.", "detalhe": "letra por letra. cada error te acerca al final.", "dificuldade": "★☆☆"},
        "anagrama": {"nome": "Anagrama", "desc": "revuelto. reorganiza. descubre.", "detalhe": "letras fuera de orden. tu cerebro es el decoder.", "dificuldade": "★★☆"},
    },
    "timer": "⏱ {s}s",
    "tentativas": "intentos: {a}/{b}",
    "erros": "errores: {a}/{b}",
    "passou": "✓ pasó.",
    "falhou": "✗ falló.",
    "confirmar": "CONFIRMAR",
    "desistir": "RENDIRSE",
    "voltar": "VOLVER",
}

# ============================================================
# 3. ARENA MODE
# ============================================================
GAMES_PT["arena"] = {
    "titulo": "LDI ARENA",
    "nova_ficha": "NOVA FICHA",
    "inserir_ficha": "INSERIR FICHA",
    "escolher_outra": "ESCOLHER OUTRA FICHA",
    "voltar_site": "← VOLTAR AO SITE",
    "sem_fichas": "SEM FICHAS",
    "criar_ficha": "CRIAR FICHA",
    "lobby_titulo": "SELECIONE SUA FICHA",
    "combate_titulo": "COMBATE",
    "vitoria": "VITÓRIA",
    "derrota": "DERROTA",
    "hp": "HP",
    "mp": "MP",
    "atacar": "ATACAR",
    "defender": "DEFENDER",
    "habilidade": "HABILIDADE",
    "fugir": "FUGIR",
    "inimigo": "INIMIGO",
    "player": "JOGADOR",
    "elemental": "ELEMENTAL",
    "arma": "ARMA",
    "vantagens": "VANTAGENS",
    "desvantagens": "DESVANTAGENS",
    "unicas": "ÚNICAS",
    "nome_ficha": "Nome da Ficha",
    "ex_arma": "ex: katana, punhos, bastão...",
    "confirmar_ficha": "CONFIRMAR FICHA",
    "escolher_elemento": "Escolha seu Elemental",
    "pts_disponiveis": "pts disponíveis",
    "precisa_ser_zero": "(precisa ser 0)",
    "proximo": "PRÓXIMO →",
    "voltar": "VOLTAR",
}

GAMES_EN["arena"] = {
    "titulo": "LDI ARENA",
    "nova_ficha": "NEW SHEET",
    "inserir_ficha": "INSERT TOKEN",
    "escolher_outra": "CHOOSE ANOTHER SHEET",
    "voltar_site": "← BACK TO SITE",
    "sem_fichas": "NO TOKENS",
    "criar_ficha": "CREATE SHEET",
    "lobby_titulo": "SELECT YOUR SHEET",
    "combate_titulo": "COMBAT",
    "vitoria": "VICTORY",
    "derrota": "DEFEAT",
    "hp": "HP",
    "mp": "MP",
    "atacar": "ATTACK",
    "defender": "DEFEND",
    "habilidade": "ABILITY",
    "fugir": "FLEE",
    "inimigo": "ENEMY",
    "player": "PLAYER",
    "elemental": "ELEMENTAL",
    "arma": "WEAPON",
    "vantagens": "ADVANTAGES",
    "desvantagens": "DISADVANTAGES",
    "unicas": "UNIQUE",
    "nome_ficha": "Sheet Name",
    "ex_arma": "ex: katana, fists, staff...",
    "confirmar_ficha": "CONFIRM SHEET",
    "escolher_elemento": "Choose your Elemental",
    "pts_disponiveis": "pts available",
    "precisa_ser_zero": "(must be 0)",
    "proximo": "NEXT →",
    "voltar": "BACK",
}

GAMES_ES["arena"] = {
    "titulo": "LDI ARENA",
    "nova_ficha": "NUEVA FICHA",
    "inserir_ficha": "INSERTAR FICHA",
    "escolher_outra": "ELEGIR OTRA FICHA",
    "voltar_site": "← VOLVER AL SITIO",
    "sem_fichas": "SIN FICHAS",
    "criar_ficha": "CREAR FICHA",
    "lobby_titulo": "SELECCIONA TU FICHA",
    "combate_titulo": "COMBATE",
    "vitoria": "VICTORIA",
    "derrota": "DERROTA",
    "hp": "PV",
    "mp": "PM",
    "atacar": "ATACAR",
    "defender": "DEFENDER",
    "habilidade": "HABILIDAD",
    "fugir": "HUIR",
    "inimigo": "ENEMIGO",
    "player": "JUGADOR",
    "elemental": "ELEMENTAL",
    "arma": "ARMA",
    "vantagens": "VENTAJAS",
    "desvantagens": "DESVENTAJAS",
    "unicas": "ÚNICAS",
    "nome_ficha": "Nombre de Ficha",
    "ex_arma": "ej: katana, puños, bastón...",
    "confirmar_ficha": "CONFIRMAR FICHA",
    "escolher_elemento": "Elige tu Elemental",
    "pts_disponiveis": "pts disponibles",
    "precisa_ser_zero": "(debe ser 0)",
    "proximo": "SIGUIENTE →",
    "voltar": "VOLVER",
}

# ============================================================
# 4. TOP TRUMPS
# ============================================================
GAMES_PT["toptrumps"] = {
    "titulo": "LDI TRUMPS",
    "jogar": "JOGAR",
    "multiplayer": "MULTIPLAYER",
    "deck": "MEU DECK",
    "colecao": "COLEÇÃO",
    "desistir": "DESISTIR",
    "selecionar_carta": "SELECIONE UMA CARTA",
    "vitoria": "VITÓRIA!",
    "derrota": "DERROTA!",
    "rodada": "RODADA {n}",
    "sua_carta": "SUA CARTA",
    "carta_adversario": "CARTA DO ADVERSÁRIO",
    "pts": "pts",
    "btn_jogar_novamente": "JOGAR NOVAMENTE",
    "btn_voltar": "VOLTAR",
    "lobby": {
        "titulo": "LOBBY",
        "modo_livre": "LIVRE",
        "modo_apostado": "APOSTADO",
        "criar_sala": "CRIAR SALA",
        "entrar_sala": "ENTRAR NA SALA",
        "codigo_sala": "CÓDIGO DA SALA",
        "fila_publica": "FILA PÚBLICA",
        "conectando": "CONECTANDO...",
        "jogador": "JOGADOR",
        "iniciar": "INICIAR",
    },
    "mp": {
        "conectando": "CONECTANDO...",
        "conexao_perdida": "CONEXÃO PERDIDA",
        "oponente_desconectado": "OPONENTE DESCONECTADO",
        "sua_vez": "SUA VEZ",
        "vez_oponente": "VEZ DO OPONENTE",
        "selecionando": "SELECIONANDO...",
        "ppt": "PEDRA · PAPEL · TESOURA",
    },
}

GAMES_EN["toptrumps"] = {
    "titulo": "LDI TRUMPS",
    "jogar": "PLAY",
    "multiplayer": "MULTIPLAYER",
    "deck": "MY DECK",
    "colecao": "COLLECTION",
    "desistir": "GIVE UP",
    "selecionar_carta": "SELECT A CARD",
    "vitoria": "VICTORY!",
    "derrota": "DEFEAT!",
    "rodada": "ROUND {n}",
    "sua_carta": "YOUR CARD",
    "carta_adversario": "OPPONENT'S CARD",
    "pts": "pts",
    "btn_jogar_novamente": "PLAY AGAIN",
    "btn_voltar": "BACK",
    "lobby": {
        "titulo": "LOBBY",
        "modo_livre": "FREE",
        "modo_apostado": "BET",
        "criar_sala": "CREATE ROOM",
        "entrar_sala": "JOIN ROOM",
        "codigo_sala": "ROOM CODE",
        "fila_publica": "PUBLIC QUEUE",
        "conectando": "CONNECTING...",
        "jogador": "PLAYER",
        "iniciar": "START",
    },
    "mp": {
        "conectando": "CONNECTING...",
        "conexao_perdida": "CONNECTION LOST",
        "oponente_desconectado": "OPPONENT DISCONNECTED",
        "sua_vez": "YOUR TURN",
        "vez_oponente": "OPPONENT'S TURN",
        "selecionando": "SELECTING...",
        "ppt": "ROCK · PAPER · SCISSORS",
    },
}

GAMES_ES["toptrumps"] = {
    "titulo": "LDI TRUMPS",
    "jogar": "JUGAR",
    "multiplayer": "MULTIJUGADOR",
    "deck": "MI MAZO",
    "colecao": "COLECCIÓN",
    "desistir": "RENDIRSE",
    "selecionar_carta": "SELECCIONA UNA CARTA",
    "vitoria": "¡VICTORIA!",
    "derrota": "¡DERROTA!",
    "rodada": "RONDA {n}",
    "sua_carta": "TU CARTA",
    "carta_adversario": "CARTA DEL ADVERSARIO",
    "pts": "pts",
    "btn_jogar_novamente": "JUGAR DE NUEVO",
    "btn_voltar": "VOLVER",
    "lobby": {
        "titulo": "LOBBY",
        "modo_livre": "LIBRE",
        "modo_apostado": "APOSTADO",
        "criar_sala": "CREAR SALA",
        "entrar_sala": "ENTRAR A LA SALA",
        "codigo_sala": "CÓDIGO DE SALA",
        "fila_publica": "FILA PÚBLICA",
        "conectando": "CONECTANDO...",
        "jogador": "JUGADOR",
        "iniciar": "INICIAR",
    },
    "mp": {
        "conectando": "CONECTANDO...",
        "conexao_perdida": "CONEXIÓN PERDIDA",
        "oponente_desconectado": "OPONENTE DESCONECTADO",
        "sua_vez": "TU TURNO",
        "vez_oponente": "TURNO DEL OPONENTE",
        "selecionando": "SELECCIONANDO...",
        "ppt": "PIEDRA · PAPEL · TIJERA",
    },
}

# ============================================================
# Apply to i18n files
# ============================================================
pt["games"] = GAMES_PT
en["games"] = GAMES_EN
es["games"] = GAMES_ES

for fn, data in [("pt.json", pt), ("en.json", en), ("es.json", es)]:
    save_json(os.path.join(I18N, fn), data)
    print(f"✅ {fn}: games section added with {len(data.get('games', {}))} games")

# Verify
for lang in ["pt", "en", "es"]:
    d = load_json(os.path.join(I18N, f"{lang}.json"))
    games = d.get("games", {})
    print(f"\n📊 {lang.upper()} games:")
    for g, v in games.items():
        if isinstance(v, dict):
            print(f"   - {g}: {len(v)} keys")
print("\n✅ Done! Games translation data generated.")
