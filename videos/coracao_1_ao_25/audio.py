#!/usr/bin/env python3
"""Desenho escondido no 1 ao 25: pausas calculadas pra as falas baterem com o cronômetro de 30 s,
tique-taque (sfx/fundo.wav) e brilho na revelação; chama ../_comum/montar.py."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
import numpy as np
from scipy.io import wavfile
from sfx import *
DUR = 30
CUTS = [5.71, 13.66, 15.51, 17.65, 19.53, 20.77, 21.89, 22.98, 24.05, 24.90, 26.40, 30.67, 34.62, 40.17]
ALVO = {2: 1.5, 3: 15.0, 4: 20.0, 5: 25.0, 6: 26.0, 7: 27.0, 8: 28.0, 9: 29.0, 10: 30.0}
FIXA = {0: 0.35, 10: 0.5, 11: 0.4, 12: 0.5, 13: 0.4, 14: 1.6}
N = 15
def montar(p, fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": round(p[i], 3)} for i in range(N)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
p = {i: FIXA.get(i, 0.5) for i in range(N)}
tl = montar(p); L = [c["fala"] for c in tl]
p[1] = 0.05 + ALVO[2]
for i in range(2, 10): p[i] = ALVO[i + 1] - ALVO[i] - L[i]
tl = montar(p)
T = tl[1]["start"] + tl[1]["fala"] + 0.05
x = novo(tl[-1]["end"])
for k in range(DUR): tique(x, T + k, 0.05 if k < DUR - 10 else 0.09)
n = int(0.6 * SR); tt = np.arange(n) / SR
put(x, T + DUR, (0.06 * np.sign(np.sin(2 * np.pi * 220 * tt)) * np.exp(-tt * 4)).astype(np.float32))
R0 = tl[11]["start"] + 0.9                       # casas acendendo (0.09 s cada)
for k in range(25): put(x, R0 + k * 0.09, tom(880 * 2 ** (k / 24), 0.08, 0.035, 30))
ding(x, tl[12]["start"] + 0.05, 0.12)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(p, True)
json.dump({"T": round(T, 3), "R0": round(R0, 3)}, open("cronometro.json", "w"))
for c in tl: print(c)
print("T", T, "R0", R0)
