#!/usr/bin/env python3
"""montagem.json + sons (tique, buzina de erro, ding de acerto); chama ../_comum/montar.py."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [6.71, 12.32, 18.86, 25.53, 31.29, 39.89, 44.90, 53.69, 59.12, 70.14, 76.02]
#     0    1    2    3     4    5     6    7     8    9     10   11    12
P = [0.3, 2.0, 0.5, 2.0, 0.5, 2.2, 0.5, 2.0, 0.5, 2.0, 0.5, 2.2]
# instante (s, dentro da fala) da resposta CERTA em cada revelação
CERTA = {3: 1.19, 5: 1.95, 7: 1.98, 9: 1.55, 11: 1.84}   # chave = nº da cena (1-based)
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(12)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); x = novo(tl[-1]["end"])
fim = lambda c: tl[c - 1]["start"] + tl[c - 1]["fala"]
for c in (2, 4, 6, 8, 10):             # pausa de resposta: tiques
    for k in range(4): tique(x, fim(c) + 0.1 + k * 0.45, 0.06)
for c, d in CERTA.items():             # revelação
    buzina(x, tl[c - 1]["start"] + 0.02); ding(x, tl[c - 1]["start"] + d)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(True)
for c in tl: print(c)
