/* Caderno Premium: R$ 9,90, pagamento único no Pix (o mesmo Pix da loja).
   Libera modo impossível, desafios dos dias anteriores, card dourado e os 66 Desafios.
   Sem conta: o número do pedido é o código que libera em outro celular. */
(function () {
  'use strict';
  const CA = window.CA;
  const CFG = window.LOJA_CONFIG || {};
  const API = CFG.supabaseUrl ? CFG.supabaseUrl + '/functions/v1' : null;
  const PRODUTO = 'caderno-premium';
  const PRECO = 'R$ 9,90'; // só pra mostrar; o valor cobrado vem sempre do banco
  const UUID = /^[0-9a-f-]{36}$/i;

  async function chamar(fn, corpo) {
    if (!API) throw new Error('Pagamento indisponível agora.');
    const r = await fetch(`${API}/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CFG.supabaseAnonKey, Authorization: `Bearer ${CFG.supabaseAnonKey}` },
      body: JSON.stringify(corpo),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.erro || 'Não deu certo agora. Tenta de novo em instantes.');
    return j;
  }

  const BENEFICIOS = [
    ['Modo impossível', 'Grade 7x7 no Acha, 20 segundos no Fala a cor e no Responde rápido'],
    ['Desafios dos dias anteriores', 'Perdeu um desafio do dia? Joga qualquer um dos últimos 30 dias'],
    ['Card dourado', 'Teu resultado com moldura dourada e selo Premium pros stories'],
    ['66 Desafios liberados', 'Os enigmas e pegadinhas do jogo completo, sem pagar de novo'],
  ];

  CA.jogos.premium = {
    nome: 'Caderno Premium',
    iniciar(palco) {
      let vivo = true, timer = 0;
      CA.ehPremium() ? ativo() : oferta();

      function ativo(recemPago) {
        clearInterval(timer);
        const { pedido } = CA.ler('premium', {});
        palco.innerHTML = '';
        palco.appendChild(CA.el(`
          <section class="intro premium">
            <a class="voltar" href="#/" aria-label="Voltar">‹</a>
            <h1>${recemPago ? 'Liberado! 🎉' : 'Teu Premium tá ativo'}</h1>
            <p>Modo impossível, desafios anteriores, card dourado e os 66 Desafios já tão liberados neste celular.</p>
            <div class="codigo-caixa">
              <small>Teu código (guarda ele pra liberar em outro celular)</small>
              <code id="codigo-premium">${pedido}</code>
              <button class="btn btn-claro" type="button" data-a="copiar">Copiar código</button>
            </div>
            <a class="btn btn-grande" href="#/">Bora jogar</a>
          </section>`));
        palco.querySelector('[data-a=copiar]').addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(pedido); CA.aviso('Código copiado!'); }
          catch (e) { const c = palco.querySelector('#codigo-premium'); const s = getSelection(); const r = document.createRange(); r.selectNodeContents(c); s.removeAllRanges(); s.addRange(r); }
        });
      }

      function oferta() {
        palco.innerHTML = '';
        palco.appendChild(CA.el(`
          <section class="intro premium">
            <a class="voltar" href="#/" aria-label="Voltar">‹</a>
            <span class="selo-premium">★ Premium</span>
            <h1>Caderno Premium</h1>
            <p>Os jogos continuam de graça pra sempre. O Premium é pra quem quer mais:</p>
            <ul class="beneficios">
              ${BENEFICIOS.map(([t, d]) => `<li><strong>${t}</strong><span>${d}</span></li>`).join('')}
            </ul>
            <div class="preco"><strong>${PRECO}</strong><span>uma vez só, no Pix. Sem mensalidade.</span></div>
            <form id="form-premium" class="form-premium">
              <label for="email-premium">Teu e-mail (pro recibo)</label>
              <input id="email-premium" type="email" required autocomplete="email" placeholder="nome@email.com">
              <button class="btn btn-grande" type="submit">Pagar ${PRECO} no Pix</button>
              <p class="erro-form" role="alert" hidden></p>
            </form>
            <details class="ja-comprei">
              <summary>Já comprei em outro celular</summary>
              <form id="form-codigo">
                <label for="codigo">Cola aqui o teu código</label>
                <input id="codigo" type="text" autocomplete="off" spellcheck="false" placeholder="ex.: 3f2a9c1e-...">
                <button class="btn btn-claro" type="submit">Liberar</button>
                <p class="erro-form" role="alert" hidden></p>
              </form>
            </details>
            <p class="nota">Pagamento por Pix, processado pelo Mercado Pago. Dúvida? ${CFG.contato || ''}</p>
          </section>`));

        const fP = palco.querySelector('#form-premium');
        fP.addEventListener('submit', async e => {
          e.preventDefault();
          const b = fP.querySelector('button'), err = fP.querySelector('.erro-form');
          err.hidden = true; b.disabled = true; b.textContent = 'Gerando Pix...';
          try {
            const pix = await chamar('criar-pix', { produto: PRODUTO, email: fP.querySelector('input').value.trim() });
            if (vivo) telaPix(pix);
          } catch (x) {
            err.textContent = x.message; err.hidden = false;
            b.disabled = false; b.textContent = `Pagar ${PRECO} no Pix`;
          }
        });

        const fC = palco.querySelector('#form-codigo');
        fC.addEventListener('submit', async e => {
          e.preventDefault();
          const cod = fC.querySelector('input').value.trim().toLowerCase();
          const err = fC.querySelector('.erro-form');
          err.hidden = true;
          if (!UUID.test(cod)) { err.textContent = 'Esse código não parece certo. Ele tem 36 letras e números.'; err.hidden = false; return; }
          try {
            const st = await chamar('status-pedido', { pedido: cod });
            if (st.status === 'pago' && st.produto === PRODUTO) { CA.ativarPremium(cod); if (vivo) ativo(true); }
            else { err.textContent = st.status === 'pago' ? 'Esse código é de outro produto da loja.' : 'Esse pagamento ainda não foi confirmado.'; err.hidden = false; }
          } catch (x) { err.textContent = x.message; err.hidden = false; }
        });
      }

      function telaPix(pix) {
        palco.innerHTML = '';
        palco.appendChild(CA.el(`
          <section class="intro premium">
            <a class="voltar" href="#/premium" aria-label="Voltar">‹</a>
            <h1>Paga no Pix</h1>
            <p>Abre o app do banco, escolhe Pix e lê o QR code. Ou copia o código.</p>
            ${pix.qr_base64 ? `<img class="qr" alt="QR code do Pix" src="data:image/png;base64,${pix.qr_base64}">` : ''}
            <textarea class="copia-cola" readonly rows="3" aria-label="Pix copia e cola">${pix.copia_cola || ''}</textarea>
            <button class="btn btn-grande btn-claro" type="button" data-a="copiar">Copiar código Pix</button>
            <p class="esperando"><span class="pontinho"></span> Esperando o pagamento... assim que cair, libera sozinho.</p>
          </section>`));
        palco.querySelector('[data-a=copiar]').addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(pix.copia_cola); CA.aviso('Código Pix copiado!'); }
          catch (e) { palco.querySelector('.copia-cola').select(); }
        });
        const t0 = Date.now();
        timer = setInterval(async () => {
          if (!vivo || Date.now() - t0 > 30 * 60e3) { clearInterval(timer); return; }
          try {
            const st = await chamar('status-pedido', { pedido: pix.pedido });
            if (st.status === 'pago') { CA.ativarPremium(pix.pedido); CA.som('recorde'); if (vivo) ativo(true); }
          } catch (e) { /* tenta de novo no próximo */ }
        }, 4000);
      }

      return () => { vivo = false; clearInterval(timer); };
    },
  };
})();
