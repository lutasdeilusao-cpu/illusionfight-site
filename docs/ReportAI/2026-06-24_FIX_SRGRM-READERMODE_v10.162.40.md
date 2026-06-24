# FIX: ReaderMode + Botão Back no SRGRM — v10.162.40

## Problema
- SRGRM.jsx não ativava ReaderMode, então Navbar e TrialBanner ficavam visíveis durante o jogo
- Não havia botão para voltar ao hub `/prototype` — o usuário precisava usar o navegador

## O que foi feito

### 1. ReaderMode ativado
- Importado `useReader` de `ReaderContext`
- `useEffect` com `setReaderMode(true)` e cleanup `setReaderMode(false)`

### 2. Botão "← Voltar" adicionado
- Posicionado dentro de `.prototype-header` (mesmo padrão do hub)
- Navega para `/prototype` via `useNavigate()`
- Usa classes `proto-btn proto-btn-secondary` do `Prototype.css`

## Versão

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/pages/Prototype/SRGRM/SRGRM.jsx` | ReaderMode + botão back | — |
| `src/config/version.js` | SITE_VERSION bump | 10.161.41 → **10.162.40** |
| `SITE_MAP.md` | Versão atualizada | ✅ |
| **Commit** | `61005e60` | `fix: ReaderMode + botão back no SRGRM + v10.162.40` |
| **Deploy** | Publicado | ✅ |
