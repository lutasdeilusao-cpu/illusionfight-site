# Report — Top Trumps SP: Sound Toggle Position Fixed no Topo

**Versão SITE:** 10.179.2 → **10.179.3**
**Versão TS:** 5.37.1 → **5.37.2**
**Data:** 2026-06-26

---

## Problema

O `.tt-sound-toggle` usava `position: absolute` dentro de containers com `position: relative`. Em cada fase (menu, ppt, jogando, resultado, recompensa, fim_jogo), o container pai era diferente, e o botão sobrepunha o conteúdo do título/header em várias fases — especialmente na tela de resultado final e na fase jogando.

## Solução

Mudar de `position: absolute` para `position: fixed`, fixando o botão no topo do viewport (fora de qualquer container), centralizado horizontalmente. Isso elimina o overlap em TODAS as fases de uma vez.

## ETAPA 1 — Prova de Leitura

### ANTES — `.tt-sound-toggle` (L2-21):
```css
.tt-sound-toggle {
  position: absolute;
  top: 0.75rem;
  left: 0;
  right: 0;
  margin: 0 auto;
  z-index: 10;
  width: 2.2rem;
  height: 2.2rem;
  ...
}
```

### ANTES — `.tt-relatorio` (L1248-1253):
```css
.tt-relatorio {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding-top: 3.5rem;  /* workaround para botão absolute */
}
```

### DEPOIS — `.tt-sound-toggle` (L2-21):
```css
.tt-sound-toggle {
  position: fixed;
  top: 0.5rem;
  left: 0;
  right: 0;
  margin: 0 auto;
  z-index: 100;
  ...
}
```

### DEPOIS — `.tt-relatorio` (L1248-1252):
```css
.tt-relatorio {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  /* padding-top removido — botão fixed não afeta fluxo */
}
```

## Confirmação Bundle

```
tt-sound-toggle{...;position:fixed;top:.5rem;left:0;right:0;margin:0 auto;z-index:100;...}
```

## Teste Lógico

| Fluxo | Item | Status |
|---|---|---|
| **Menu** | Botão fixed no topo, não sobrepõe cards | ✅ |
| **PPT** | Botão fixed, não sobrepõe opções | ✅ |
| **Jogando** | Botão fixed, não sobrepõe game-header | ✅ |
| **Resultado** | Botão fixed, não sobrepõe resultado | ✅ |
| **Recompensa** | Botão fixed, não sobrepõe cartas | ✅ |
| **Fim jogo** | Botão fixed, não sobrepõe título | ✅ |
| **Hover** | `transform: scale(1.1)` não conflita com `margin: 0 auto` | ✅ |
| **Z-index** | `z-index: 100` acima do conteúdo, abaixo de modais (1000+) | ✅ |
| **Responsivo** | `left:0; right:0; margin:0 auto` centraliza em qq viewport | ✅ |

## Build

```
npm run build → ✓ built in 2.02s → 26 rotas pré-renderizadas
```

## Versões

| Constante | Antes | Depois |
|---|---|---|
| `TS_VERSION` | 5.37.1 | **5.37.2** |
| `SITE_VERSION` | 10.179.2 | **10.179.3** |

## Deploy

| Etapa | Hash/Status |
|---|---|
| **Commit** | `7e89dce6` |
| **Push** | ✅ |
| **Deploy** | Published ✅ |
