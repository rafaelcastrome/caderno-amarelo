# Junta a narração (falas f01..f12 nos tempos do tl.json) + trilha sintetizada + efeitos -> audio.wav (48 kHz estéreo)
import json, wave, numpy as np
SR = 48000; TL = json.load(open('dados.json'))['tl']; DUR = TL[-1]['ini'] + TL[-1]['dur'] + 2.8
N = int(DUR * SR); voz = np.zeros(N); mus = np.zeros((N, 2)); fx = np.zeros(N)
rng = np.random.default_rng(3)
def le(p):
    w = wave.open(p); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; return x
for c in TL:
    x = le(f"audio/f{c['i']:02d}.wav"); a = int(c['ini'] * SR); voz[a:a + len(x)] += x[:N - a]
wave_out = lambda p, y: (lambda w: (w.setnchannels(1 if y.ndim == 1 else 2), w.setsampwidth(2), w.setframerate(SR), w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()), w.close()))(wave.open(p, 'wb'))
wave_out('voz.wav', voz)
t = np.arange(N) / SR
def S(i): return TL[i - 1]['ini']
def E(i): return TL[i]['ini'] if i < len(TL) else DUR
def env(a, b, fi=1.0, fo=1.0):
    e = np.clip((t - a) / fi, 0, 1) * np.clip((b - t) / fo, 0, 1); return e
# trilha: pad de acordes (fantasia), muda de humor por tomada
def nota(n): return 440 * 2 ** ((n - 69) / 12)
def pad(acorde, a, b, vol=0.05, brilho=1.0):
    e = env(a, b, 1.2, 1.2); m = e > 0; y = np.zeros(N); tt = t[m]
    for k, n in enumerate(acorde):
        f = nota(n); ph = rng.uniform(0, 6.28)
        y[m] += (np.sin(2 * np.pi * f * tt + ph) + 0.3 * brilho * np.sin(4 * np.pi * f * tt + ph) + 0.12 * brilho * np.sin(6 * np.pi * f * tt)) * (0.8 + 0.2 * np.sin(2 * np.pi * (0.13 + k * 0.05) * tt))
    return y * e * vol
AM = [57, 64, 69, 72]; F = [53, 60, 65, 69]; C = [48, 55, 64, 67]; G = [55, 62, 67, 71]; Dm = [50, 57, 62, 65]; E7 = [52, 59, 64, 68]
p = np.zeros(N)
p += pad([45, 52, 57, 60, 63], 0, E(1) + 0.5, 0.05, 0.6)            # gancho tenso (dim)
seq = [AM, F, C, G, AM, F, C, G, AM, F]
# tomadas 2-7: calmas, acordes trocando a cada ~3.3 s
a = S(2); k = 0
while a < E(7):
    b = min(a + 3.3, E(7) + 0.5); p += pad(seq[k % len(seq)], a, b + 0.8, 0.045); a += 3.3; k += 1
p += pad([45, 51, 57, 60], S(8), E(8) + 0.5, 0.05, 0.5)               # vírus chegando
p += pad([40, 47, 52, 55, 58], S(9), E(9) + 0.4, 0.06, 1.2)           # guerra
p += pad(C, S(10), S(10) + 3.6, 0.05) + pad(G, S(10) + 3.4, E(10) + 0.6, 0.05)
p += pad(F, S(11), E(11) + 0.6, 0.04, 0.5)
p += pad([41, 48, 57, 64, 67], S(12), DUR, 0.055, 1.0)                 # virada, grande
mus[:, 0] = p; mus[:, 1] = np.roll(p, 240)
# graves de tambor na guerra
def pancada(at, f0=60, d=0.5, vol=0.5):
    i = int(at * SR); n = int(d * SR); tt = np.arange(n) / SR; y = np.sin(2 * np.pi * (f0 * np.exp(-tt * 4)) * tt) * np.exp(-tt * 7) * vol
    fx[i:i + n] += y[:max(0, N - i)]
for x in np.arange(S(9), E(9), 0.47): pancada(x, 70, 0.4, 0.35)
for x in np.arange(S(8) + 0.4, S(8) + 3.0, 0.5): pancada(x, 110, 0.6, 0.18)  # quedas dos vírus
# coração batendo (tomada 3) — tum-tum
for x in np.arange(S(3), E(3), 1.15): pancada(x + 0.06, 55, 0.35, 0.55); pancada(x + 0.25, 50, 0.3, 0.35)
# fervura: bolhas (pops filtrados)
def bolhas(a, b, dens, vol):
    for x in np.arange(a, b, 1 / dens):
        at = x + rng.uniform(0, 1 / dens); i = int(at * SR); n = int(0.06 * SR); tt = np.arange(n) / SR
        f = rng.uniform(250, 700); y = np.sin(2 * np.pi * f * (1 + tt * 8) * tt) * np.exp(-tt * 60) * vol
        fx[i:i + n] += y[:max(0, N - i)]
bolhas(0, E(1), 14, 0.12); bolhas(S(9) + 2.5, E(9), 18, 0.12)
# chuva brilhante: sininhos
for x in np.arange(S(10), S(10) + 5.5, 0.16):
    i = int(x * SR); n = int(0.5 * SR); tt = np.arange(n) / SR; f = nota(rng.choice([84, 86, 88, 91, 93, 96]))
    fx[i:i + n] += (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 9) * 0.05)[:max(0, N - i)]
# virada: whoosh + boom
i = int(S(12) * SR); n = int(5 * SR); w = rng.normal(0, 1, n); w = np.convolve(w, np.ones(60) / 60, 'same'); tt = np.arange(n) / SR
fx[i:i + n] += (w * np.sin(np.pi * np.clip(tt / 5, 0, 1)) ** 2 * 0.35)[:max(0, N - i)]
pancada(S(12) + 5.0, 40, 2.5, 0.6)
# mix com ducking da trilha sob a voz
vs = np.abs(voz); k = int(0.25 * SR); envv = np.convolve(vs, np.ones(k) / k, 'same'); duck = 1 - 0.45 * np.clip(envv / 0.05, 0, 1)
mix = np.zeros((N, 2))
for ch in range(2): mix[:, ch] = voz * 0.95 + mus[:, ch] * duck * 1.1 + fx * 0.8 * duck ** 0.5
mix /= max(1.0, np.abs(mix).max() / 0.95)
wave_out('audio.wav', mix); print('audio.wav', DUR)
