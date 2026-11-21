#!/usr/bin/env python3
"""Gera as 3 imagens híbridas em vários tamanhos (já reduzidas com filtro bom) -> hibridas.js
O motor mostra sempre a versão do tamanho exato da tela, então "encolher" = ver de longe de verdade."""
import base64, io, json, numpy as np
from PIL import Image
import hibrida as h
N = 820
TAM = sorted({int(round(N * (90 / N) ** (i / 23))) for i in range(24)}, reverse=True)
PAINEIS = {
    "gato":  (h.emoji("emo/1f436.png"), h.emoji("emo/1f431.png"), (28, 4, 0.5, 2.2)),
    "feliz": (h.emoji("emo/1f622.png"), h.emoji("emo/1f600.png"), (24, 3, 0.6, 1.6)),
    "teamo": (h.texto(["ME", "PAGA"], 300, 10), h.texto(["TE", "AMO"], 250), (30, 3, 0.8, 1.7)),
}
out = {"tam": TAM}
for nome, (lo, pe, p) in PAINEIS.items():
    im = Image.fromarray((h.hibrida(lo, pe, *p) * 255).astype(np.uint8))
    im.save(f"img/{nome}.png")
    d = {}
    for s in TAM:
        b = io.BytesIO(); im.resize((s, s), Image.LANCZOS).save(b, "JPEG", quality=93)
        d[s] = "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()
    out[nome] = d
    prev = Image.new("RGB", (N + 240, N), "white"); prev.paste(im.resize((N, N)), (0, 0))
    prev.paste(im.resize((110, 110), Image.LANCZOS), (N + 60, 300)); prev.paste(im.resize((70, 70), Image.LANCZOS), (N + 80, 500))
    prev.save(f"img/prev_{nome}.png")
open("hibridas.js", "w").write("window.HIB = " + json.dumps(out) + ";\n")
print(TAM)
