#!/usr/bin/env python3
"""montagem.json (cronômetro de 20 s em silêncio depois do "Fecha!", sem tique pra não ajudar a contar) + plin no começo e no fim."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [5.1, 11.2, 15.4, 20.28]
P = [0.2, 20.0, 1.8, 0.6, 2.5]
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(5)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); x = novo(tl[-1]["end"])
fim2 = tl[1]["start"] + tl[1]["fala"]
ding(x, tl[2]["start"] - 0.25, 0.08)     # fim do cronômetro
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(True)
for c in tl: print(c)
