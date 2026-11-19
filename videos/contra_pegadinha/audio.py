#!/usr/bin/env python3
"""Contra-pegadinha: montagem.json + sons (tiques, buzina de erro, ding de acerto)."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [4.67, 7.27, 9.09, 13.40, 18.61, 23.32, 28.03, 32.00, 34.63, 36.66, 41.63, 47.43, 50.07]  # cenas 5-6 = take2 (algodão x ferro)
#     0    1    2    3    4    5    6    7    8    9    10   11   12   13
P = [0.3, 2.3, 1.3, 0.5, 1.3, 0.5, 1.3, 0.5, 2.3, 1.2, 0.5, 1.3, 0.5, 2.2]
CERTA = {4: 1.4, 6: 3.1, 8: 2.3, 11: 1.05, 13: 1.0}   # cena (1-based) -> s da resposta certa
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(14)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
if __name__ == "__main__":
    import os; os.makedirs("sfx", exist_ok=True)
    tl = montar(); x = novo(tl[-1]["end"])
    fim = lambda c: tl[c - 1]["start"] + tl[c - 1]["fala"]
    for c in (2, 9):
        for k in range(5): tique(x, fim(c) + 0.15 + k * 0.4)
    for c in (3, 5, 7, 10, 12):
        tique(x, fim(c) + 0.1, 0.06); tique(x, fim(c) + 0.6, 0.06)
    for c, d in CERTA.items():
        buzina(x, tl[c - 1]["start"] + 0.02); ding(x, tl[c - 1]["start"] + d)
    wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
    tl = montar(True)
    for c in tl: print(c)
