#!/usr/bin/env python3
"""Monta narração (take único Algieba) + sfx: 3 tiques em cada tentativa e um 'ding' em cada revelação."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
C = json.load(open("cfg.json"))
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": C["cuts"],
         "cenas": [{"fala": i, "pausa": p} for i, p in enumerate(C["pausas"])]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); x = novo(tl[-1]["end"])
for k, c in enumerate(C["tentativas"]):
    s = tl[c]; t0 = s["start"] + s["fala"] + 0.3
    for i in range(3): tique(x, t0 + i * 0.75, 0.06)
# revelações: cachorro (fala 2), chorando (5), me paga (9)
for c in (2, 5, 9): ding(x, tl[c]["start"] + 0.02, 0.08)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
for c in montar(True): print(c)
