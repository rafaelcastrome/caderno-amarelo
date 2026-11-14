#!/usr/bin/env python3
"""montagem.json com as falas do encarar batendo com 15 s de contagem, drone de suspense e impacto na troca."""
import json, subprocess, numpy as np
from scipy.io import wavfile
CUTS = [7.8, 15.8, 18.9, 21.5, 25.2, 31.2, 36.7, 43.0]
ALVO = {2: 5.0, 3: 10.0, 4: 15.0}   # segundos depois do início do encarar
FIXA = {0: 0.4, 4: 0.9, 5: 0.7, 6: 0.9, 7: 0.7, 8: 2.4}
SR = 44100
def montar(p, fundo=False):
    M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": round(p[i], 3)} for i in range(9)]}
    if fundo: M["fundo"] = {"arquivo": "sfx/fundo.wav", "volume": [[0, 1.0], [999, 1.0]]}
    json.dump(M, open("montagem.json", "w"), indent=1)
    subprocess.check_call(["python3", "../_comum/montar.py", "."], stdout=subprocess.DEVNULL)
    return json.load(open("timeline.json"))["cenas"]
p = {i: FIXA.get(i, 0.5) for i in range(9)}
tl = montar(p); L = [c["fala"] for c in tl]
T = L[0] + p[0] + L[1] + 0.1            # começa a encarar logo depois de "nem pisca"
p[1] = 0.1 + ALVO[2]
p[2] = ALVO[3] - ALVO[2] - L[2]
p[3] = ALVO[4] - ALVO[3] - L[3]
tl = montar(p); tot = tl[-1]["end"]
n = int(tot * SR) + SR; tt = np.arange(n) / SR
drone = (np.sin(2 * np.pi * 55 * tt) + 0.6 * np.sin(2 * np.pi * 82.4 * tt + np.sin(tt * 0.7)) + 0.3 * np.sin(2 * np.pi * 110.6 * tt)) * (0.6 + 0.4 * np.sin(tt * 0.9))
env = np.clip(tt / 1.5, 0, 1) * np.clip((tot - tt) / 1.5, 0, 1)
x = (0.035 * drone * env).astype(np.float32)
# sobe a tensão durante o encarar
tr = np.clip((tt - T) / 15, 0, 1) * (tt < T + 15)
x += (0.03 * tr * np.sin(2 * np.pi * (220 + 220 * tr) * tt) * (0.5 + 0.5 * np.sin(tt * 30))).astype(np.float32)
# tique suave a cada segundo do encarar
for k in range(15):
    m = int(0.05 * SR); u = np.arange(m) / SR; i = int((T + k) * SR)
    x[i:i + m] += 0.04 * np.sin(2 * np.pi * 900 * u) * np.exp(-u * 70)
# impacto grave na troca pro papel branco
m = int(1.5 * SR); u = np.arange(m) / SR; i = int((T + 15) * SR)
x[i:i + m] += 0.3 * np.sin(2 * np.pi * 48 * u * (1 - 0.2 * u)) * np.exp(-u * 3)
wavfile.write("sfx/fundo.wav", SR, (x * 32767).astype(np.int16))
tl = montar(p, True)
json.dump({"T": round(T, 3)}, open("encarar.json", "w"))
for c in tl: print(c)
print("T", T)
