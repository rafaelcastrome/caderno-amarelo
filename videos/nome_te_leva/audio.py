#!/usr/bin/env python3
"""montagem.json + tambor de suspense antes da revelação; chama ../_comum/montar.py."""
import json, subprocess, numpy as np
from scipy.io import wavfile
CUTS = [3.7, 9.75, 17.75, 22.7, 25.4, 27.55]
P = [0.35, 0.4, 0.4, 3.0, 1.6, 0.8, 2.2]   # pausa 3 s no "pausa o vídeo"; 1,6 s de tambor antes do Cocô
SR = 44100
def montar(fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(7)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
tl = montar(); tot = tl[-1]["end"]
x = np.zeros(int(tot * SR) + SR, np.float32)
def hit(t0, f, amp, dec):
    n = int(0.35 * SR); tt = np.arange(n) / SR
    s = amp * np.sin(2 * np.pi * f * tt * (1 - 0.3 * tt)) * np.exp(-tt * dec)
    i = int(t0 * SR); x[i:i + n] += s[:len(x) - i]
# rufar: batidas acelerando entre o fim da fala 5 e o "Cocô"
a = tl[4]["start"] + tl[4]["fala"]; b = tl[5]["start"]
t = a; k = 0
while t < b - 0.05:
    hit(t, 120, 0.10 + 0.08 * (t - a) / (b - a), 25); k += 1; t += max(0.06, 0.18 - 0.012 * k)
hit(b, 70, 0.35, 6)   # bumbo na revelação
# "plim" de passo durante a demonstração (Ana: 1,2,3 e o pulo de 4)
s2 = tl[2]["start"]
for d in (2.0, 2.6, 3.2):
    n = int(0.12 * SR); tt = np.arange(n) / SR; i = int((s2 + d) * SR)
    x[i:i + n] += 0.06 * np.sin(2 * np.pi * 1320 * tt) * np.exp(-tt * 30)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(True)
for c in tl: print(c)
