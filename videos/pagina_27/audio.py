#!/usr/bin/env python3
"""montagem.json + sons (plim na demonstração, rufar antes do 27); chama ../_comum/montar.py."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [4.04, 8.65, 14.65, 19.05, 22.65]
P = [0.3, 0.9, 3.0, 1.6, 0.7, 2.3]   # 3 s no "pausa o vídeo"; 1,6 s de rufar antes do 27
DEMO = 3.55                           # "tipo assim" dentro da fala 2
def montar(fundo=False):
    M = {"take": "falas/take2.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(6)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); x = novo(tl[-1]["end"])
for k in range(4): put(x, tl[1]["start"] + DEMO + 0.3 * k, tom(1320, 0.12, 0.06, 30))
rufar(x, tl[3]["start"] + tl[3]["fala"], tl[4]["start"]); bumbo(x, tl[4]["start"]); ding(x, tl[4]["start"] + 0.05, 0.07)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(True)
for c in tl: print(c)
