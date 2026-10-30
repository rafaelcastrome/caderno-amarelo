"""Gera kit_mentalista.html a partir de truques.py. Depois: node render.js -> kit-mentalista-v1.pdf"""
import html
from pathlib import Path

from truques import TRUQUES

AQUI = Path(__file__).parent
e = html.escape

CSS = """
@font-face { font-family: Caveat; src: url('Caveat-Bold.ttf'); }
@page { size: A5; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Nunito, Inter, sans-serif; color: #1f1f24; font-size: 10.2pt; line-height: 1.38; }
.pag { width: 148mm; height: 210mm; position: relative; overflow: hidden; page-break-after: always;
  background-color: #fbf5df;
  background-image: linear-gradient(rgba(70,130,200,.24) .4mm, transparent .4mm), linear-gradient(90deg, rgba(70,130,200,.24) .4mm, transparent .4mm),
    linear-gradient(rgba(70,130,200,.13) .2mm, transparent .2mm), linear-gradient(90deg, rgba(70,130,200,.13) .2mm, transparent .2mm);
  background-size: 20mm 20mm, 20mm 20mm, 5mm 5mm, 5mm 5mm;
  padding: 11mm 10mm 12mm 19mm; }
.pag::before { content: ''; position: absolute; left: 14mm; top: 0; bottom: 0; width: .6mm; background: rgba(214,40,40,.35); }
.mao { font-family: Caveat, cursive; }
.tag { display: inline-block; font-family: Caveat; font-size: 15pt; background: #ffd23f; padding: 0 3mm; border-radius: 1.5mm; transform: rotate(-2deg); }
h1 { font-family: Caveat; font-size: 30pt; line-height: 1; margin: 2mm 0 1.5mm; }
h3 { font-family: Caveat; font-size: 15pt; line-height: 1; margin: 3mm 0 1mm; color: #1d4ed8; }
.efeito { font-size: 10.5pt; }
.material { font-size: 9pt; color: #55555c; margin-top: 1mm; }
ol.falas { margin-left: 5mm; }
ol.falas li { margin: .6mm 0; padding-left: 1mm; }
ol.falas li::marker { font-family: Caveat; color: #d62828; font-size: 12pt; }
.caixa { border: .5mm solid #1f1f24; border-radius: 3mm; padding: 2.5mm 3.5mm; margin-top: 3mm; background: rgba(255,250,240,.9); }
.segredo { border-color: #d62828; }
.segredo b.mao, .dica b.mao { font-size: 14pt; display: block; line-height: 1; margin-bottom: .8mm; }
.segredo b.mao { color: #d62828; }
.dica { border-style: dashed; }
.saida { font-size: 9pt; color: #55555c; margin-top: 2.5mm; }
.rodape { position: absolute; bottom: 5mm; left: 19mm; right: 10mm; display: flex; justify-content: space-between; font-family: Caveat; font-size: 11pt; color: #8a8a8a; }
.u { background: linear-gradient(transparent 60%, #ffd23f 60%); }
.red { color: #d62828; }
"""

CEREBRO = """<svg width="100mm" height="52mm" viewBox="0 0 300 160"><g fill="none" stroke="#1f1f24" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M95 115 C55 118 40 90 52 72 C38 55 55 30 80 36 C88 18 118 16 128 30 C142 18 172 22 175 42 C200 40 210 68 195 82 C208 102 185 122 160 115 C150 132 110 132 95 115 Z"/><path d="M128 32 C120 55 135 70 125 95 M80 36 C85 50 100 55 98 70 M175 44 C160 55 165 70 150 80"/></g><g stroke="#d62828" stroke-width="3.5" stroke-linecap="round"><path d="M218 40 l22 -14 M226 72 l28 0 M218 104 l22 14 M32 40 l-22 -14 M24 72 l-24 0 M32 104 l-22 14"/></g></svg>"""


def rodape(n):
    return f'<div class="rodape"><span>{n}</span><span>@Cardeno_Amarelo</span></div>'


def capa():
    return f"""<section class="pag">
  <span class="tag">kit em PDF</span>
  <div class="mao" style="font-size:64pt;line-height:.92;margin-top:10mm">Kit<br><span class="u">Mentalista</span></div>
  <div class="mao" style="font-size:22pt;margin-top:6mm">20 truques e mágicas pra<br><span class="red">impressionar</span> os teus amigos</div>
  <div style="margin:10mm 0 0 2mm">{CEREBRO}</div>
  <div class="mao" style="font-size:15pt;color:#1d4ed8;margin-top:4mm">mente · números · cartas · objetos</div>
  {rodape('Caderno Amarelo')}
</section>"""


def boas_vindas(paginas):
    itens = "".join(f"<li>{e(t['titulo'])} <span style='color:#8a8a8a'>· pág. {paginas[i]}</span></li>" for i, t in enumerate(TRUQUES))
    return f"""<section class="pag">
  <span class="tag">leia antes!</span>
  <h1>As 3 regras do mágico</h1>
  <ol class="falas">
    <li><b>Nunca conta o segredo.</b> O mistério é o que deixa o truque incrível.</li>
    <li><b>Nunca repete o mesmo truque</b> pra mesma pessoa. Na segunda vez ela descobre.</li>
    <li><b>Treina sozinho antes.</b> Duas vezes já basta.</li>
  </ol>
  <p style="margin-top:2mm">Em cada truque você encontra o <b>efeito</b> (o que a plateia vê), as <b>falas</b> pra apresentar, o <b class="red">segredo</b>, uma <b>dica de mágico</b> e o que fazer se der errado.</p>
  <h3 style="font-size:20pt;margin-top:5mm">Os truques</h3>
  <ol class="falas" style="font-size:9pt;line-height:1.2">{itens}</ol>
  {rodape(2)}
</section>"""


def pagina_truque(i, t, n):
    falas = "".join(f"<li>{e(f)}</li>" for f in t["falas"])
    return f"""<section class="pag">
  <span class="tag">truque {i + 1:02d}</span>
  <h1>{e(t['titulo'])}</h1>
  <p class="efeito">{e(t['efeito'])}</p>
  <p class="material"><b>Precisa de:</b> {e(t['material'])}</p>
  <h3>Como apresentar</h3>
  <ol class="falas">{falas}</ol>
  <div class="caixa segredo"><b class="mao">O segredo</b>{e(t['segredo'])}</div>
  <div class="caixa dica"><b class="mao">Dica de mágico</b>{e(t['dica'])}</div>
  <p class="saida"><b>Se der errado:</b> {e(t['saida'])}</p>
  {rodape(n)}
</section>"""


SIMBOLOS = ["▲", "●", "■", "♥", "♣", "☾", "✿", "◆", "☂", "♪"]


def tabela_cristal(n):
    import random
    rnd = random.Random(7)
    cel = []
    for k in range(10, 100):
        sim = "★" if k % 9 == 0 and k <= 81 else rnd.choice(SIMBOLOS)
        cel.append(f"<div><span style='font-size:8pt;color:#55555c'>{k}</span> <span style='color:#1d4ed8'>{sim}</span></div>")
    grade = "".join(cel)
    return f"""<section class="pag">
  <span class="tag">bola de cristal</span>
  <h1>Acha o teu número</h1>
  <p>Procura o resultado da tua conta e decora o símbolo dele. Depois, vira a página.</p>
  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:1.2mm 2mm;margin-top:3mm;font-size:11pt;background:rgba(255,250,240,.9);border:.5mm solid #1f1f24;border-radius:3mm;padding:3mm">{grade}</div>
  {rodape(n)}
</section>"""


def revelacao_cristal(n):
    return f"""<section class="pag" style="text-align:center">
  <div class="mao" style="font-size:24pt;margin-top:22mm">A bola de cristal diz que o teu símbolo é...</div>
  <div style="font-size:150pt;line-height:1;margin-top:10mm;color:#1d4ed8">★</div>
  <div class="mao" style="font-size:22pt;margin-top:8mm">Acertei? 🔮</div>
  {rodape(n)}
</section>"""


def final(n):
    return f"""<section class="pag">
  <span class="tag">e agora?</span>
  <div class="mao" style="font-size:44pt;line-height:.95;margin-top:10mm">Agora o mágico<br>é <span class="u">você</span>!</div>
  <p style="font-size:12pt;margin-top:8mm">Escolhe teu truque favorito e testa hoje com alguém. Grava a reação da pessoa e marca a gente no Instagram:</p>
  <div class="mao" style="font-size:30pt;margin-top:4mm">@Cardeno_Amarelo</div>
  <p style="margin-top:8mm">Ideia de apresentação: <b>Pensa num número de 1 a 4</b> pra aquecer, depois <b>Elefante cinza na Dinamarca</b>, <b>Os clipes que se abraçam</b> e fecha com o <b>1089</b> com a previsão no papel.</p>
  <p class="saida" style="margin-top:10mm">Este kit é pra uso pessoal. Por favor, não compartilhe o arquivo: assim o Caderno Amarelo continua fazendo conteúdo de graça pra todo mundo. Valeu! 💛</p>
  {rodape(n)}
</section>"""


def main():
    corpo, n, inicio = [], 3, []
    for i, t in enumerate(TRUQUES):
        inicio.append(n)
        corpo.append(pagina_truque(i, t, n)); n += 1
        if t["titulo"].startswith("A bola de cristal"):
            corpo.append(tabela_cristal(n)); n += 1
            corpo.append(revelacao_cristal(n)); n += 1
    paginas = [capa(), boas_vindas(inicio)] + corpo + [final(n)]
    doc = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{''.join(paginas)}</body></html>"""
    (AQUI / "kit_mentalista.html").write_text(doc, encoding="utf-8")


if __name__ == "__main__":
    main()
