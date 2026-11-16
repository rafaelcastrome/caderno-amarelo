# Hospedagem (desde 16/11/2026)
- Site (jogos + loja): Netlify, projeto `cardenoamarelo` (https://cardenoamarelo.netlify.app, site id bdabd0bc-e2df-41a7-a3a9-03b84d98aa57). Sobe a pasta `loja/` SEM `loja/supabase/`, `loja/_fonte_capas/` e `loja/LEIAME.md`, com o `netlify/netlify.toml` na raiz.
- Endereço antigo `cadernoamarelo.netlify.app` (projeto `cadernoamarelo`, site id ccc8d542-017e-4ad4-8aae-1dda0a4a9d13) só redireciona: sobe a pasta `netlify-antigo-redirect/`. Não apagar esse projeto, senão alguém pode pegar o nome.
- Cloudflare Pages `caderno-amarelo-loja` (main) também só redireciona: `npx wrangler pages deploy hospedagem/pages-dev-redirect --project-name caderno-amarelo-loja --branch main`.
- Supabase: segredo `LOJA_ORIGEM` = `https://cardenoamarelo.netlify.app` (CORS das funções).
