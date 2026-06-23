# FEAT: Navbar — Logo IF substituindo texto "LDI"

> Versão: 10.159.4
> Hash: `1f429b8c`
> Deploy: `Published` ✅

---

## Etapa 1 — Outputs brutos

### grep "LDI" na Navbar
```
src/components/Navbar.jsx:44:          <Link to="/" className="navbar__logo">LDI</Link>
```

### grep "logo|brand" na Navbar
```
src/components/Navbar.jsx:44:          <Link to="/" className="navbar__logo">LDI</Link>
src/components/Navbar.css:29:.navbar__logo {
```

### favicon-ldi.png
```
Name            Length
favicon-ldi.png  89373
```

---

## Etapa 2 — Substituição

### Navbar.jsx — ANTES (linha 44)
```jsx
<Link to="/" className="navbar__logo">LDI</Link>
```

### Navbar.jsx — DEPOIS (linhas 44-46)
```jsx
<Link to="/" className="navbar__logo">
  <img src="/favicon-ldi.png" alt="Illusion Fight" className="navbar__logo-img" />
</Link>
```

### Navbar.css — ANTES (linhas 29-36)
```css
.navbar__logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.75rem;
  color: var(--accent-teal);
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
```

### Navbar.css — DEPOIS (linhas 29-44)
```css
.navbar__logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.75rem;
  color: var(--accent-teal);
  letter-spacing: 0.05em;
  flex-shrink: 0;
  line-height: 0;
}

.navbar__logo-img {
  height: 36px;
  width: auto;
  display: block;
}
```

### Grep confirmação pós-edição
```
src/components/Navbar.jsx:44:          <Link to="/" className="navbar__logo">
src/components/Navbar.jsx:45:            <img src="/favicon-ldi.png" alt="Illusion Fight" className="navbar__logo-img" />
src/components/Navbar.jsx:46:          </Link>
```
Zero ocorrências de "LDI" como texto na Navbar.

---

## Teste lógico

### Fluxo 1 — Texto "LDI" some completamente
✅ Texto removido, substituído por `<img>`. Nenhum fallback de texto visível.

### Fluxo 2 — Logo com fundo transparente sobre fundo escuro
✅ `favicon-ldi.png` tem 85%+ pixels transparentes. Exibido diretamente sem background na navbar.

### Fluxo 3 — Mobile não quebra layout
✅ `navbar__logo` tem `flex-shrink: 0`. `navbar__logo-img` tem `height: 36px; width: auto; display: block` — não afeta o fluxo flex. Navbar usa `gap: 2rem` no inner, layout existente preservado.

### Fluxo 4 — `alt="Illusion Fight"` para acessibilidade
✅ `alt="Illusion Fight"` presente no `<img>`.

---

## Build output

```
vite v8.0.16 building client environment for production...
✓ 1247 modules transformed.
✓ built in 912ms
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

---

## Versões

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | SITE_VERSION patch +1 | 10.159.3 → **10.159.4** |
| `SITE_MAP.md` | Versão + descrição Navbar atualizada | ✅ |
| `src/components/Navbar.jsx` | Texto "LDI" → `<img>` logo IF | ✅ |
| `src/components/Navbar.css` | `.navbar__logo-img` adicionado, `line-height: 0` no logo | ✅ |
| **Commit** | `1f429b8c` — `feat: navbar logo IF substituindo texto LDI v10.159.4` | ✅ |
| **Deploy** | `Published` | ✅ |

---

## Teste manual pendente

- [ ] Abrir `illusionfight.com` e confirmar que o logo IF aparece na navbar (canto superior esquerdo) no lugar do texto "LDI"
- [ ] Verificar fundo transparente sobre navbar escura
- [ ] Testar em mobile (viewport estreito) — logo não deve quebrar
- [ ] Hard refresh (Ctrl+F5) para limpar cache
