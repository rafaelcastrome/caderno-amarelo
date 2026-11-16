# Hospedagem (desde 16/11/2026)
- Site (jogos + loja): Netlify, projeto `cadernoamarelo` (https://cadernoamarelo.netlify.app). Sobe a pasta `loja/` SEM `loja/supabase/`, `loja/_fonte_capas/` e `loja/LEIAME.md`, com o `netlify/netlify.toml` na raiz.
- Cloudflare Pages `caderno-amarelo-loja` (main) só redireciona pro Netlify: `npx wrangler pages deploy hospedagem/pages-dev-redirect --project-name caderno-amarelo-loja --branch main`.
- Supabase: segredo `LOJA_ORIGEM` = `https://cadernoamarelo.netlify.app` (CORS das funções).
