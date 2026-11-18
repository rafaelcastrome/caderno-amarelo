#!/usr/bin/env python3
"""montagem.json + sons (tique a cada segundo nos cronômetros, ding na resposta); chama ../_comum/montar.py."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [4.1, 8.0, 13.4, 19.0, 24.2, 31.1]
P = [0.3, 8.0, 0.6, 10.0, 0.6, 12.0, 2.2]      # pausas = cronômetros nas cenas 2, 4 e 6
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(7)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); x = novo(tl[-1]["end"])
for c in (2, 4, 6):
    a = tl[c - 1]["start"] + tl[c - 1]["fala"]; b = tl[c - 1]["end"]
    k = 0
    while a + k < b - 0.2:
        tique(x, a + k, 0.09 if b - (a + k) < 3.5 else 0.06); k += 1
    if c < 6: ding(x, tl[c]["start"] + 0.05)
    else: buzina(x, b - 0.05)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(True)
for c in tl: print(c)
