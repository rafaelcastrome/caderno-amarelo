# Trilha + efeitos sintetizados (numpy) por baixo da narração: batida tensa, "vush" a cada troca de copo,
# tique-taque no congelamento, "plim" na revelação. swaps.json vem da página (window.__SWAPS).
import json, subprocess, numpy as np, os
root = os.path.dirname(os.path.abspath(__file__)); SR = 44100
tl = json.load(open(f"{root}/timeline.json")); sw = json.load(open(f"{root}/swaps.json"))["swaps"]
C = {c["cena"]: c for c in tl["cenas"]}; T = tl["total"]; N = int(T * SR) + SR
out = np.zeros(N); rng = np.random.default_rng(5)
def add(sig, t, g=1.0):
    i = int(t * SR); j = min(N, i + len(sig)); out[i:j] += g * sig[: j - i]
def env(n, a=0.005, r=None):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    if r: nr = min(n, int(r * SR)); e[-nr:] *= np.linspace(1, 0, nr)
    return e
def tone(f, d, decay=6.0):
    t = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-decay * t)
def lowpass(x, k): return np.convolve(x, np.ones(k) / k, mode="same")
# --- batida (124 bpm) ---
bpm = 124; beat = 60 / bpm
kick = lambda: (np.sin(2 * np.pi * np.cumsum(np.linspace(110, 45, int(.18 * SR))) / SR) * np.exp(-np.arange(int(.18 * SR)) / SR * 18))
hat = lambda: rng.standard_normal(int(.04 * SR)) * np.exp(-np.arange(int(.04 * SR)) / SR * 90)
bassN = [55, 55, 65.4, 49]
music = np.zeros(N); mi = 0
def madd(sig, t, g):
    i = int(t * SR); j = min(N, i + len(sig)); music[i:j] += g * sig[: j - i]
t = 0.0; k = 0
while t < T - 1.0:
    madd(kick(), t, 0.9)
    madd(tone(3200, .03, 160), t + beat / 2, 0.10)   # chimbal limpo (antes era ruído)
    f = bassN[(k // 4) % 4]; d = beat * 0.9; tt = np.arange(int(d * SR)) / SR
    madd(np.tanh(2.5 * np.sin(2 * np.pi * f * tt)) * env(len(tt), .01, .08), t, 0.22)
    t += beat; k += 1
# volume da música: mais alto quando ninguém fala (embaralhando), baixo sob a voz
vol = np.full(N, 0.30)
for c in tl["cenas"]:
    i0, i1 = int(c["start"] * SR), int((c["start"] + c["fala"]) * SR); vol[i0:i1] = 0.16
vol = lowpass(vol, int(.15 * SR)); vol[int((T - 1.2) * SR):] *= np.linspace(1, 0, N - int((T - 1.2) * SR))
out += music * vol
# --- vush em cada troca ---
for fase in sw:
    for t0, dur, npares in fase:
        n = int(dur * SR); nz = rng.standard_normal(n); x = np.linspace(0, 1, n)
        w = lowpass(lowpass(nz, 60), 30) * 6; w *= np.sin(np.pi * x) ** 3   # vush grave e macio (sem chiado)
        add(w, t0, 0.18 + 0.05 * (npares - 1))
        add(tone(1500, .03, 140), t0, 0.18)          # tique
# --- levantar copo (pop) e revelação (plim) ---
pop = lambda: np.sin(2 * np.pi * np.cumsum(np.linspace(300, 900, int(.09 * SR))) / SR) * np.exp(-np.arange(int(.09 * SR)) / SR * 30)
for t in [C[5]["start"] + .5, C[8]["start"] + .4]: add(pop(), t, 0.5)
for c in [4, 7, 10]:
    t = C[c]["start"] + .05; add(pop(), t, 0.5)
    add(tone(1046.5, 1.0, 4) + .6 * tone(1568, 1.0, 5) + .3 * tone(2093, 1.0, 6), t + .08, 0.35)
# --- tique-taque no congelamento ---
for c in [3, 6, 9]:
    t = C[c]["start"]; k = 0
    while t < C[c + 1]["start"] - .1:
        add(tone(2400 if k % 2 == 0 else 1700, .04, 90), t, 0.35); t += .5; k += 1
# --- final: acorde ---
t = C[11]["start"]
for f in [523.25, 659.25, 783.99, 1046.5]: add(tone(f, 1.6, 2.5), t, 0.16)
out = np.clip(out, -1, 1)
pcm = (out * 32767).astype(np.int16).tobytes()
open(f"{root}/sfx.raw", "wb").write(pcm)
subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", f"{root}/sfx.raw",
    "-i", f"{root}/narration.mp3", "-filter_complex",
    "[0]volume=0.8[a];[1]aresample=44100,pan=mono|c0=c0,volume=1.0[b];[a][b]amix=inputs=2:normalize=0,alimiter=limit=0.95,loudnorm=I=-14:TP=-1.5:LRA=11",
    "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", f"{root}/audio_final.mp3"])
os.remove(f"{root}/sfx.raw"); print("ok")
