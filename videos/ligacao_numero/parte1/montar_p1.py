#!/usr/bin/env python3
"""Monta narration.mp3 + timeline.json da parte 1 a partir de mix.json:
cenas: [{"a": "arquivo.wav", "ganho": 1, "pausa": 0.6} | {"silencio": s}]
camadas: [{"a": "x.wav", "de": [cena, frac], "ate": [cena, frac], "vol": v, "loop": true, "fade": s}]"""
import json, os, subprocess
import numpy as np
from scipy.io import wavfile
SR = 44100
M = json.load(open("mix.json"))
def ler(p):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).copy()
partes, tempos, t = [], [], 0.0
for i, c in enumerate(M["cenas"], 1):
    a = ler(c["a"]) * c.get("ganho", 1.0) if "a" in c else np.zeros(int(c["silencio"] * SR), np.float32)
    seg = np.concatenate([a, np.zeros(int(c.get("pausa", 0.6) * SR), np.float32)])
    tempos.append({"cena": i, "start": round(t, 3), "end": round(t + len(seg) / SR, 3), "fala": round(len(a) / SR, 3)})
    t += len(seg) / SR; partes.append(seg)
mix = np.concatenate(partes)
T = lambda cf: tempos[cf[0] - 1]["start"] + cf[1] * (tempos[cf[0] - 1]["end"] - tempos[cf[0] - 1]["start"])
for L in M.get("camadas", []):
    x = ler(L["a"]) * L.get("vol", 1.0); i0 = int(T(L["de"]) * SR)
    i1 = int(T(L["ate"]) * SR) if "ate" in L else min(len(mix), i0 + len(x))
    n = i1 - i0
    if n <= 0: continue
    x = np.resize(x, n) if L.get("loop") else np.pad(x, (0, max(0, n - len(x))))[:n]
    nf = min(n // 2, int(L.get("fade", 0.02) * SR))
    if nf: x[:nf] *= np.linspace(0, 1, nf); x[-nf:] *= np.linspace(1, 0, nf)
    mix[i0:i1] += x
pk = np.max(np.abs(mix)); mix = mix * (0.89 / pk) if pk > 0.89 else mix
os.makedirs("audio", exist_ok=True)
wavfile.write("audio/mix.wav", SR, (mix * 32767).astype(np.int16))
subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-i", "audio/mix.wav", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "192k", "narration.mp3"])
json.dump({"total": round(t, 3), "motor_tts": M.get("voz", ""), "cenas": tempos}, open("timeline.json", "w"), indent=2)
for c in tempos: print(c)
