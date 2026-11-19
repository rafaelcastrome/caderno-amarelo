#!/usr/bin/env python3
import json, subprocess, sys, os
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CFG = json.load(open("cfg.json"))
CUTS, P = CFG["cuts"], CFG["pausas"]
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(len(P))]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
os.makedirs("sfx", exist_ok=True)
tl = montar(); x = novo(tl[-1]["end"])
fim = lambda c: tl[c - 1]["start"] + tl[c - 1]["fala"]
for c in CFG["timers"]:                       # tique por segundo na pausa da cena c
    a, b = fim(c) + 0.2, tl[c - 1]["end"]; t = a
    while t < b - 0.3: tique(x, t, 0.06); t += 1.0
for c in CFG["dings"]: ding(x, tl[c - 1]["start"] + 0.05)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(True)
for c in tl: print(c)
