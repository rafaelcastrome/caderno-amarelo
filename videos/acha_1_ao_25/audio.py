#!/usr/bin/env python3
"""Monta montagem.json com pausas calculadas pra o cronômetro de 25 s bater com as falas,
gera sfx/tique.wav (tique-taque por segundo) e chama ../_comum/montar.py (duas passadas)."""
import json, subprocess, numpy as np
from scipy.io import wavfile
CUTS = [5.8, 13.07, 19.74, 21.75, 23.88, 25.82, 27.02, 27.9, 28.72, 29.6, 30.42, 33.4, 44.94, 47.6, 54.77]
# fala -> segundo do cronômetro em que ela começa (None = pausa fixa)
ALVO = {3: 3.0, 4: 12.5, 5: 15.0, 6: 20.0, 7: 21.0, 8: 22.0, 9: 23.0, 10: 24.0, 11: 25.0}
FIXA = {0: 0.4, 1: 0.35, 11: 0.6, 12: 0.5, 13: 0.5, 14: 0.5, 15: 2.2}
SR = 44100
def montar(pausas, fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS,
         "cenas": [{"fala": i, "pausa": round(pausas[i], 3)} for i in range(16)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/tique.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
p = {i: FIXA.get(i, 0.5) for i in range(16)}
tl = montar(p); L = [c["fala"] for c in tl]
T = L[0] + p[0] + L[1] + p[1] + L[2] + 0.05
for i in range(2, 11):
    ini = T + ALVO[i] if i >= 3 else T - 0.05 - L[2]   # início da fala i
    p[i] = T + ALVO[i + 1] - (ini + L[i])
tl = montar(p)
T = tl[2]["start"] + tl[2]["fala"] + 0.05
# tique-taque: 1 por segundo nos 25 s, mais forte nos últimos 10; buzina curta no fim
tot = tl[-1]["end"]; x = np.zeros(int(tot * SR) + SR, np.float32)
def clique(f, dur, amp):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (amp * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 60)).astype(np.float32)
for k in range(25):
    t0 = int((T + k) * SR); amp = 0.05 if k < 15 else 0.09
    c = clique(1500 if k % 2 == 0 else 1150, 0.06, amp); x[t0:t0 + len(c)] += c
n = int(0.6 * SR); tt = np.arange(n) / SR
b = 0.10 * np.sign(np.sin(2 * np.pi * 220 * tt)) * np.exp(-tt * 4); t0 = int((T + 25) * SR); x[t0:t0 + n] += b * 0.6
wavfile.write("sfx/tique.wav", SR, (x * 32767).astype(np.int16))
tl = montar(p, fundo=True)
json.dump({"T": round(T, 3)}, open("cronometro.json", "w"))
for c in tl: print(c)
print("T =", T)
