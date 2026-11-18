#!/usr/bin/env python3
"""O envelope: montagem.json + sons (tiques na resposta, rasgo do envelope, buzina+ding nas certas)."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
from scipy.io import wavfile
import numpy as np
from sfx import *
CUTS = [5.06, 7.06, 9.68, 16.91, 21.24, 25.60, 28.82, 35.81, 38.69, 41.99, 44.19, 46.67, 50.82]
#     0    1    2    3    4    5    6    7    8     9     10    11    12   13
P = [0.3, 2.2, 2.2, 2.4, 2.2, 2.2, 1.3, 0.9, 0.35, 0.35, 0.35, 0.35, 0.6, 1.8]
def rasgo(x, t, d=0.45, amp=0.22):
    n = int(d * SR); r = np.random.default_rng(3).standard_normal(n).astype(np.float32)
    r = np.convolve(r, np.ones(6) / 6, "same")                     # papel: ruído meio abafado
    env = np.exp(-np.linspace(0, 4, n)) * (0.6 + 0.4 * np.abs(np.sin(np.linspace(0, 40, n))))
    put(x, t, r * env * amp)
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(14)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); x = novo(tl[-1]["end"])
fim = lambda c: tl[c - 1]["start"] + tl[c - 1]["fala"]
for c in (2, 3, 4, 5, 6):                       # pausa de resposta
    tique(x, fim(c) + 0.1, 0.06); tique(x, fim(c) + 0.9, 0.06); tique(x, fim(c) + 1.7, 0.06)
rasgo(x, fim(7) + 0.05)                          # abre o envelope
for c in (9, 10, 11, 12, 13):                    # certas
    ding(x, tl[c - 1]["start"] + 0.05)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(True)
for c in tl: print(c)
