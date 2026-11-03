// PDF de brinde do jogo "Desafios do Caderno Amarelo": os 66 desafios + gabarito no fim.
// Usa os mesmos dados do jogo (loja/assets/js/desafios-dados.js).
// Rodar: cd produtos/desafios_pdf && node completo.js  -> desafios-do-caderno-v1.pdf
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const raiz = path.resolve(__dirname, '../..');
const dados = fs.readFileSync(path.join(raiz, 'loja/assets/js/desafios-dados.js'), 'utf8');
const fonte = 'file://' + path.join(__dirname, 'Caveat-Bold.ttf');

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<style>
@font-face { font-family: Caveat; src: url('${fonte}'); }
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Caveat, cursive; color: #1f1f24; }
.page { width: 210mm; height: 297mm; padding: 16mm 16mm 14mm 26mm; position: relative; page-break-after: always; overflow: hidden;
  background: #fffdf3 repeating-linear-gradient(to bottom, transparent 0 31px, #b9d4ee 31px 32px); }
.page::before { content: ''; position: absolute; left: 18mm; top: 0; bottom: 0; width: 2px; background: #f2a3a3; }
.rodape { position: absolute; bottom: 8mm; left: 26mm; right: 16mm; display: flex; justify-content: space-between; font-size: 15px; color: #8a8270; }
.capa { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: #ffd23f; }
.capa::before { display: none; }
.capa h1 { font-size: 78px; line-height: .95; margin: 0 0 18px; }
.capa p { font-size: 30px; margin: 6px 0; }
.capa .selo { margin-top: 40px; font-size: 24px; border: 3px solid #1f1f24; border-radius: 14px; padding: 10px 22px; background: #fffdf3; }
.desafio { height: 128mm; border-bottom: 2px dashed #c9bfa4; padding-top: 4mm; display: flex; flex-direction: column; }
.desafio:last-of-type { border-bottom: 0; }
.num { font-size: 22px; color: #d62828; }
.tit { font-size: 34px; line-height: 1; margin: 2px 0 6px; }
.perg { font-size: 25px; line-height: 1.15; margin-bottom: 6px; white-space: pre-line; }
.img { flex: 1; min-height: 0; display: flex; justify-content: center; align-items: center; }
.img svg { max-height: 100%; max-width: 100%; height: 64mm; width: auto; }
.linha { font-size: 22px; color: #8a8270; margin-top: 4px; }
h2 { font-size: 46px; margin: 4px 0 10px; }
.gab { font-size: 19px; line-height: 1.12; margin-bottom: 7px; }
.gab b { color: #d62828; }
.gab .r { font-size: 23px; }
</style></head><body><div id="saida"></div>
<script>${dados}</script>
<script>
const D = window.DESAFIOS;
const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const n2 = i => String(i).padStart(2, '0');
let h = '<section class="page capa"><h1>Desafios do<br>Caderno Amarelo</h1><p>' + D.length + ' desafios pra testar teu cérebro</p><p>charadas, pegadinhas, ilusões e sequências</p><div class="selo">Tenta sozinho primeiro! O gabarito está no fim 🤫</div><p style="margin-top:50px;font-size:24px">@Cardeno_Amarelo</p></section>';
let pag = 1;
for (let i = 0; i < D.length; i += 2) {
  pag++;
  h += '<section class="page">';
  for (const d of D.slice(i, i + 2)) {
    const id = d.id ?? (D.indexOf(d) + 1);
    h += '<div class="desafio"><div class="num">Desafio ' + n2(id) + '</div><div class="tit">' + esc(d.titulo) + '</div><div class="perg">' + esc(d.pergunta) + '</div>' +
      '<div class="img">' + (d.imagem || '') + '</div><div class="linha">Minha resposta: ______________________</div></div>';
  }
  h += '<div class="rodape"><span>Desafios do Caderno Amarelo</span><span>' + pag + '</span></div></section>';
}
const porPag = 11;
for (let i = 0; i < D.length; i += porPag) {
  pag++;
  h += '<section class="page"><h2>Gabarito' + (i ? ' (continuação)' : '') + '</h2>';
  for (const d of D.slice(i, i + porPag)) {
    const id = d.id ?? (D.indexOf(d) + 1);
    h += '<div class="gab"><b>' + n2(id) + '.</b> <span class="r">' + esc(d.respostaCorreta) + '</span>' + (d.explicacao ? ' · ' + esc(d.explicacao) : '') + '</div>';
  }
  h += '<div class="rodape"><span>Desafios do Caderno Amarelo</span><span>' + pag + '</span></div></section>';
}
document.getElementById('saida').innerHTML = h;
</script></body></html>`;

(async () => {
  const tmp = path.join(__dirname, '_completo.html');
  fs.writeFileSync(tmp, html);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + tmp);
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: path.join(__dirname, 'desafios-do-caderno-v1.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  const pags = await p.$$('.page');
  for (const i of [0, 1, pags.length - 1]) await pags[i].screenshot({ path: path.join(__dirname, `_conf${i}.png`) });
  console.log('páginas:', pags.length);
  await b.close();
  fs.unlinkSync(tmp);
})();
