#!/usr/bin/env python3
"""Corta o take Gemini nas falas e monta narration.mp3 + timeline.json no formato da skill whiteboard.
uso: montar.py <projeto>   (lê <projeto>/montagem.json)
montagem.json: {"take": "falas/take1.wav", "cortes": [t...],   # pontos de corte (meio dos silêncios)
  "cenas": [{"fala": 0, "pausa": 0.6} | {"arquivo": "sfx/x.wav", "pausa": 1.0} | {"silencio": 6.0}],
  "fundo": {"arquivo": "sfx/fundo.wav", "volume": [[t, vol], ...]}  (opcional, mixado por baixo)}"""
import json, os, subprocess, sys
import numpy as np
from scipy.io import wavfile

SR = 44100
root = os.path.abspath(sys.argv[1]); M = json.load(open(os.path.join(root, "montagem.json")))

def ler(path):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", os.path.join(root, path),
                                   "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).copy()

def aparar(x, lim=10 ** (-42 / 20)):
    # tira silêncio e o "estalo" final do Gemini (barulho curto depois do último silêncio)
    env = np.convolve(np.abs(x), np.ones(441) / 441, "same")
    on = np.where(env > lim)[0]
    if not len(on): return x
    a, b = on[0], on[-1]
    x = x[max(0, a - 400): b + 1200]
    n = int(0.012 * SR); r = np.linspace(0, 1, n)
    x[:n] *= r; x[-n:] *= r[::-1]
    return x

take = ler(M["take"]); cuts = [0] + [int(c * SR) for c in M["cortes"]] + [len(take)]
falas = [aparar(take[cuts[i]:cuts[i + 1]]) for i in range(len(cuts) - 1)]
# normaliza cada fala para o mesmo pico RMS
for i, f in enumerate(falas):
    falas[i] = f * (0.12 / (np.sqrt(np.mean(f ** 2)) + 1e-9))

partes, tempos, t = [], [], 0.0
cenas = M["cenas"]
for i, c in enumerate(cenas, 1):
    if "fala" in c: a = falas[c["fala"]]
    elif "arquivo" in c: a = ler(c["arquivo"]) * c.get("ganho", 1.0)
    else: a = np.zeros(int(c["silencio"] * SR), np.float32)
    pausa = c.get("pausa", 2.5 if i == len(cenas) else 0.6)
    seg = np.concatenate([a, np.zeros(int(pausa * SR), np.float32)])
    tempos.append({"cena": i, "start": round(t, 3), "end": round(t + len(seg) / SR, 3), "fala": round(len(a) / SR, 3)})
    t += len(seg) / SR; partes.append(seg)
mix = np.concatenate(partes)
if "fundo" in M:
    f = ler(M["fundo"]["arquivo"])
    f = np.resize(f, len(mix)) if len(f) < len(mix) else f[:len(mix)]
    pts = [[tempos[c - 1]["start"] + fr * (tempos[c - 1]["end"] - tempos[c - 1]["start"]), v]
           for c, fr, v in M["fundo"]["volume_cenas"]] if "volume_cenas" in M["fundo"] else M["fundo"]["volume"]
    pts = np.array(pts, float)
    vol = np.interp(np.arange(len(mix)) / SR, pts[:, 0], pts[:, 1])
    mix = mix + f * vol
pk = np.max(np.abs(mix)); mix = mix * (0.89 / pk) if pk > 0.89 else mix
wav = os.path.join(root, "audio", "mix.wav"); os.makedirs(os.path.dirname(wav), exist_ok=True)
wavfile.write(wav, SR, (mix * 32767).astype(np.int16))
subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-i", wav, "-ac", "2", "-c:a", "libmp3lame", "-b:a", "192k",
                       os.path.join(root, "narration.mp3")])
json.dump({"total": round(t, 3), "motor_tts": "gemini " + M.get("voz", "Algieba"), "cenas": tempos},
          open(os.path.join(root, "timeline.json"), "w"), indent=2)
for c in tempos: print(c)
