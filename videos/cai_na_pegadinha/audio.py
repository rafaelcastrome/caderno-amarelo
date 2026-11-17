#!/usr/bin/env python3
"""montagem.json + sons (tique, buzina de erro, ding de acerto); chama ../_comum/montar.py."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [3.33, 5.6, 7.5, 10.45, 13.3, 15.6, 18.4, 24.0, 26.7, 37.4, 41.0, 44.8, 47.5]
#     0     1    2    3     4    5    6     7    8     9    10   11    12   13
P = [0.3, 2.3, 1.1, 0.35, 2.1, 1.1, 0.35, 1.1, 0.35, 1.1, 0.35, 1.1, 0.45, 2.2]
# instante (s, dentro da fala) da resposta CERTA em cada revelação
CERTA = {4: 1.55, 7: 1.4, 9: 1.25, 11: 1.45, 13: 0.8}   # chave = nº da cena (1-based)
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(14)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); x = novo(tl[-1]["end"])
fim = lambda c: tl[c - 1]["start"] + tl[c - 1]["fala"]
for c in (2, 5):                       # "fala 5 vezes": 5 tiques na pausa
    for k in range(5): tique(x, fim(c) + 0.15 + k * 0.4)
for c in (3, 6, 8, 10, 12):            # pausa de resposta: 2 tiques
    tique(x, fim(c) + 0.1, 0.06); tique(x, fim(c) + 0.6, 0.06)
for c, d in CERTA.items():             # revelação
    buzina(x, tl[c - 1]["start"] + 0.02); ding(x, tl[c - 1]["start"] + d)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(True)
for c in tl: print(c)
