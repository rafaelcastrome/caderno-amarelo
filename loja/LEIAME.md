# Loja do Caderno Amarelo

Loja estática (HTML/CSS/JS, sem build) com pagamento Pix pelo Mercado Pago e entrega automática do PDF.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `index.html` | Página inicial: destaque, vitrine de produtos, como funciona, dúvidas |
| `produto.html?p=<slug>` | Página de um produto + checkout Pix |
| `produtos.json` | **Vitrine**: textos, capa, preço exibido, ordem e status de cada produto |
| `assets/` | CSS, JS, fonte Caveat e capas (`assets/img/`) |
| `assets/js/config.js` | URL e chave pública (anon) do Supabase. Vazio = modo demonstração |
| `_fonte_capas/` | HTML das capas; `node _fonte_capas/render.js` gera os PNG |
| `supabase/schema.sql` | Tabelas `produtos` (preço real) e `pedidos`, bucket privado `produtos` |
| `supabase/functions/` | `criar-pix`, `status-pedido`, `webhook-mercadopago` |

## Como cadastrar um produto novo

1. Fazer a capa (800×1000) em `_fonte_capas/` e salvar em `assets/img/`.
2. Adicionar um item em `produtos.json` (copiar um existente e trocar `slug`, textos e capa).
3. Subir o PDF no bucket `produtos` do Supabase, ex.: `meu-produto/meu-produto-v1.pdf`.
4. Inserir a linha no banco (o preço cobrado vem daqui, não do JSON):
   ```sql
   insert into produtos (slug, nome, preco, arquivo)
   values ('meu-produto', 'Meu Produto', 5.90, 'meu-produto/meu-produto-v1.pdf');
   ```
5. Publicar a loja de novo.

Pra deixar um produto "em breve", use `"ativo": false` no JSON.

## Back-end (Supabase)

Secrets das funções (nunca no código nem no chat):

- `MP_ACCESS_TOKEN`: token de produção do Mercado Pago (Suas integrações → Credenciais de produção)
- `MP_WEBHOOK_SECRET`: assinatura secreta do webhook (opcional, recomendado)
- `LOJA_ORIGEM`: endereço da loja, ex. `https://loja.exemplo.com` (limita quem chama as funções)
- `RESEND_API_KEY` e `EMAIL_REMETENTE`: envio do link por e-mail (opcional)

Deploy:

```bash
supabase db push            # ou rodar schema.sql no SQL Editor
supabase functions deploy criar-pix
supabase functions deploy status-pedido
supabase functions deploy webhook-mercadopago --no-verify-jwt
```

No Mercado Pago, cadastrar o webhook (evento "Pagamentos") apontando para
`https://<projeto>.supabase.co/functions/v1/webhook-mercadopago`.

## Testar localmente

```bash
cd loja && python3 -m http.server 8765
```

Abrir `http://localhost:8765`. Com `config.js` vazio, o checkout roda em modo demonstração (não cobra nada).
