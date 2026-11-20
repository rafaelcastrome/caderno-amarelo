#!/usr/bin/env python3
"""Monta narração + tiques da contagem. Pausa de cada nível = lead + duração da contagem + respiro."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CFG = json.load(open("cfg.json")); L = CFG["lead"]
dur = lambda n: (n["ate"] - n["de"] + 1) / n["por_s"]
P = [L + dur(n) + 0.55 for n in CFG["niveis"]] + [CFG["pausa_final"]]
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CFG["cuts"], "cenas": [{"fala": i, "pausa": round(P[i], 3)} for i in range(len(P))]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); x = novo(tl[-1]["end"])
for n in CFG["niveis"]:
    c = tl[n["c"] - 1]; t0 = c["start"] + c["fala"] + L
    k = n["ate"] - n["de"] + 1
    amp = 0.07 if n["por_s"] <= 10 else 0.035
    for i in range(k): tique(x, t0 + i / n["por_s"], amp)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
for c in montar(True): print(c)
