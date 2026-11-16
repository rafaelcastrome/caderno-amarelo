#!/usr/bin/env python3
"""montagem.json + sons (tesoura no recorte, vupt na troca, ding no encaixe); chama ../_comum/montar.py."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [3.05, 6.1, 9.8, 12.6, 17.0, 22.2]
P = [1.3, 0.4, 0.3, 1.0, 0.5, 0.4, 2.5]
def montar(fundo=False):
    M = {"take": "falas/take2.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(7)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); x = novo(tl[-1]["end"])
s1 = tl[0]["start"] + tl[0]["fala"]
for k in range(3): tique(x, s1 + 0.15 + 0.4 * k, 0.07)
s4 = tl[3]["start"]
put(x, s4 + 0.1, tom(300, 0.9, 0.05, 2, 900))      # vupt subindo enquanto o tampo voa
ding(x, tl[4]["start"])
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(True)
for c in tl: print(c)
