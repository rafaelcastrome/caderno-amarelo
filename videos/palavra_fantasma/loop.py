#!/usr/bin/env python3
"""Palavra fantasma: sílabas tônicas 'lo' (de LOBO) e 'bo' (de BOLO) com mesma duração e volume,
repetidas sem pausa: lôbôlôbô... O cérebro alterna entre ouvir LOBO e BOLO (transformação verbal, Warren 1958)."""
import subprocess, numpy as np
from scipy.io import wavfile
SR = 44100
def ler(a, b):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", str(a), "-to", str(b), "-i", "falas/palavras.wav",
                                   "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).copy()
def esticar(x, dur):
    wavfile.write("/tmp/_s.wav", SR, x)
    k = len(x) / SR / dur
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", "/tmp/_s.wav", "-af", f"atempo={k:.4f}",
                                   "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    y = np.frombuffer(raw, np.float32).copy(); n = int(dur * SR)
    return np.pad(y, (0, max(0, n - len(y))))[:n]
D = 0.26
lo = esticar(ler(0.285, 0.635), D)   # LO (tônica de lobo)
bo = esticar(ler(1.695, 1.905), D)   # BO (tônica de bolo)
for s in (lo, bo):
    s *= 0.12 / np.sqrt(np.mean(s ** 2))
    f = int(0.015 * SR); r = np.linspace(0, 1, f); s[:f] *= r; s[-f:] *= r[::-1]
par = np.concatenate([lo, bo])
def loop(seg, p=par):
    n = int(round(seg / (2 * D)))
    y = np.tile(p, n)
    rng = np.random.default_rng(7); ruido = rng.standard_normal(len(y)).astype(np.float32)
    ruido = np.convolve(ruido, np.ones(8) / 8, "same") * 0.006      # chiado bem baixinho por baixo
    y = y + ruido
    f = int(0.2 * SR); r = np.linspace(0, 1, f); y[:f] *= r; y[-f:] *= r[::-1]
    return y
for nome, seg, p in [("loop_14", 14.04, par), ("loop_lobo", 5.2, par), ("loop_bolo", 5.2, np.concatenate([bo, lo]))]:
    y = loop(seg, p); y = y * (0.85 / np.max(np.abs(y)))
    wavfile.write(f"sfx/{nome}.wav", SR, (y * 32767).astype(np.int16))
    print(nome, len(y) / SR)
