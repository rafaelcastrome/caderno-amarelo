#!/usr/bin/env python3
"""montagem.json + sons (tique, buzina de erro, ding de acerto); chama ../_comum/montar.py."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [3.68, 6.05, 8.08, 10.81, 15.90, 19.12, 24.12, 27.57, 31.24, 34.13, 39.88, 42.96]
#     0    1    2    3     4    5     6    7     8    9     10   11    12
P = [0.3, 2.3, 1.2, 0.45, 1.3, 0.5, 1.3, 0.5, 1.2, 0.5, 1.3, 0.5, 2.2]
# instante (s, dentro da fala) da resposta CERTA em cada revelação
CERTA = {4: 1.6, 6: 1.58, 8: 1.14, 10: 1.45, 12: 1.14}   # chave = nº da cena (1-based)
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(13)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); x = novo(tl[-1]["end"])
fim = lambda c: tl[c - 1]["start"] + tl[c - 1]["fala"]
for k in range(5): tique(x, fim(2) + 0.15 + k * 0.4)     # "fala gema 5 vezes"
for c in (3, 5, 7, 9, 11):             # pausa de resposta: 2 tiques
    tique(x, fim(c) + 0.1, 0.06); tique(x, fim(c) + 0.6, 0.06)
for c, d in CERTA.items():             # revelação
    buzina(x, tl[c - 1]["start"] + 0.02); ding(x, tl[c - 1]["start"] + d)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(True)
for c in tl: print(c)
