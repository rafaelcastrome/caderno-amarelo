#!/usr/bin/env python3
"""montagem.json + sons (tique em cada palavra, rufar antes da revelação); chama ../_comum/montar.py."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [5.2, 13.7, 20.4, 23.19, 28.96]
P = [10.6, 2.2, 1.4, 0.6, 0.6, 2.5]
PAL = 0.85                       # segundos por palavra (12 palavras na pausa da cena 1)
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(6)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); x = novo(tl[-1]["end"])
t0 = tl[0]["start"] + tl[0]["fala"] + 0.2
for k in range(12): put(x, t0 + k * PAL, tom(1250, 0.09, 0.07, 40))
put(x, t0 + 12 * PAL, tom(880, 0.25, 0.06, 12))
a = tl[1]["start"] + tl[1]["fala"]
for k in range(3): tique(x, a + 0.25 + 0.6 * k, 0.08)
rufar(x, tl[2]["start"] + tl[2]["fala"] + 0.1, tl[3]["start"]); bumbo(x, tl[3]["start"]); buzina(x, tl[3]["start"] + 0.05, 0.08)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(True)
for c in tl: print(c)
